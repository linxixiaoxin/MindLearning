import { spawn } from 'node:child_process'
import { appendFile, mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.resolve(__dirname, '..')
const inboxDir = path.join(projectRoot, 'codex-inbox')
const latestPath = path.join(inboxDir, 'codex-command-latest.json')
const statusPath = path.join(inboxDir, 'codex-command-status.json')
const responsePath = path.join(inboxDir, 'codex-command-response.json')
const heartbeatPath = path.join(inboxDir, 'codex-agent-heartbeat.json')
const logPath = path.join(inboxDir, 'codex-agent.log')
const runDir = path.join(inboxDir, 'codex-agent-runs')
const schemaPath = path.join(__dirname, 'codex-agent-response.schema.json')
const redbookRoot = path.resolve(projectRoot, '../../../..')

await loadEnvFiles([
  path.join(projectRoot, '.env.local'),
  path.join(projectRoot, '.env'),
])

const runner = 'codex-cli'
const codexBin = process.env.CODEX_CLI_BIN || 'codex'
const codexWorkingDir = process.env.CODEX_AGENT_CWD || redbookRoot
const defaultCodexSandbox = process.env.CODEX_AGENT_SANDBOX || 'read-only'
const writeCodexSandbox = process.env.CODEX_AGENT_WRITE_SANDBOX || 'workspace-write'
const allowWriteMode = process.env.CODEX_AGENT_ALLOW_WRITE !== '0'
const defaultExecutionMode = normalizeExecutionMode(process.env.CODEX_AGENT_DEFAULT_EXECUTION_MODE || 'write')
const model = process.env.CODEX_AGENT_MODEL || 'gpt-5.4-mini'
const modelLabel = model || 'codex-cli default'
const reasoningEffort = process.env.CODEX_AGENT_REASONING_EFFORT || 'low'
const defaultMode = process.env.CODEX_AGENT_MODE || 'reply-only'
const pollMs = Math.max(Number(process.env.CODEX_AGENT_POLL_MS || 3000), 1000)
const execTimeoutMs = Math.max(Number(process.env.CODEX_AGENT_EXEC_TIMEOUT_MS || 900000), 30_000)
const verbose = process.env.CODEX_AGENT_VERBOSE === '1'

let shuttingDown = false
let lastProcessedKey = ''
let lastCommandId = ''
let lastStatus = 'idle'
let lastExecutionMode = defaultExecutionMode
let lastSandbox = defaultExecutionMode === 'write' && allowWriteMode ? writeCodexSandbox : defaultCodexSandbox

console.log(`Codex agent daemon listening to ${latestPath}`)
console.log(`Runner: ${runner}`)
console.log(`Codex CLI: ${codexBin}`)
console.log(`Model: ${modelLabel}`)
console.log(`Reasoning effort: ${reasoningEffort}`)
console.log(`Default mode: ${defaultMode}`)
console.log(`Default execution mode: ${defaultExecutionMode}`)
console.log(`Working dir: ${codexWorkingDir}`)
console.log(`Default sandbox: ${defaultCodexSandbox}`)
console.log(`Write sandbox: ${writeCodexSandbox}`)
console.log(`Write mode allowed: ${allowWriteMode ? 'yes' : 'no'}`)
console.log(`Poll interval: ${pollMs}ms`)
console.log(`Exec timeout: ${execTimeoutMs}ms`)
console.log(`Verbose: ${verbose ? 'on' : 'off'}`)

process.on('SIGINT', () => {
  shuttingDown = true
})

process.on('SIGTERM', () => {
  shuttingDown = true
})

while (!shuttingDown) {
  try {
    await writeHeartbeat()
    await processLatestCommand()
  } catch (error) {
    lastStatus = 'failed'
    await appendLog('loop-error', { message: error.message || String(error) })
  }
  await sleep(pollMs)
}

await writeHeartbeat({ shuttingDown: true })
console.log('Codex agent daemon stopped')

async function processLatestCommand() {
  const record = await readJsonFile(latestPath)
  if (!record?.id || !record?.receivedAt) {
    lastStatus = 'idle'
    return
  }
  const executionConfig = resolveExecutionConfig(record)

  const key = `${record.id}:${record.receivedAt}`
  if (key === lastProcessedKey) return

  if (await hasFreshResponse(record)) {
    lastProcessedKey = key
    lastCommandId = record.id
    lastStatus = 'completed'
    return
  }

  lastCommandId = record.id
  lastExecutionMode = executionConfig.mode
  lastSandbox = executionConfig.sandbox
  lastStatus = 'reading'
  logConsole(`read command ${record.id} (${executionConfig.label}, ${executionConfig.sandbox})`)
  await writeHeartbeat()
  await writeCommandStatus({
    commandId: record.id,
    requestReceivedAt: record.receivedAt,
    status: 'reading',
    label: 'Agent 已读取',
    summary: `本地 agent daemon 已读取这条指令，执行模式：${executionConfig.label}。`,
    executionMode: executionConfig.mode,
    codexSandbox: executionConfig.sandbox,
  })
  await appendLog('command-read', { commandId: record.id, receivedAt: record.receivedAt })

  lastStatus = 'running'
  logConsole(`start codex exec for ${record.id}`)
  await writeHeartbeat()
  await writeCommandStatus({
    commandId: record.id,
    requestReceivedAt: record.receivedAt,
    status: 'running',
    label: 'Agent 调用 Codex CLI 中',
    summary: `正在通过 ${codexBin} exec 处理这条指令，sandbox=${executionConfig.sandbox}。`,
    executionMode: executionConfig.mode,
    codexSandbox: executionConfig.sandbox,
  })

  try {
    const outputText = await callCodexCli(record, executionConfig)
    const parsed = parseAgentJson(outputText)
    const responsePayload = normalizeAgentPayload(parsed, outputText)
    await writeResponse(record, {
      status: responsePayload.needsCodexSession ? 'blocked' : 'completed',
      label: responsePayload.needsCodexSession ? '需要 Codex 接手' : 'Agent 已完成',
      ...responsePayload,
    }, executionConfig)
    await writeCommandStatus({
      commandId: record.id,
      requestReceivedAt: record.receivedAt,
      status: responsePayload.needsCodexSession ? 'blocked' : 'completed',
      label: responsePayload.needsCodexSession ? '需要 Codex 接手' : 'Agent 已完成',
      summary: responsePayload.summary,
      changedFiles: responsePayload.changedFiles,
      executionMode: executionConfig.mode,
      codexSandbox: executionConfig.sandbox,
    })
    lastStatus = responsePayload.needsCodexSession ? 'blocked' : 'completed'
    logConsole(`completed ${record.id}: ${responsePayload.summary}`)
    await appendLog('command-completed', {
      commandId: record.id,
      status: lastStatus,
      needsCodexSession: responsePayload.needsCodexSession,
    })
  } catch (error) {
    const summary = `Agent 调用 Codex CLI 失败：${error.message || String(error)}`
    await writeResponse(record, {
      status: 'failed',
      label: 'Agent 失败',
      summary,
      reply: summary,
      suggestedActions: [
        '在终端运行 codex login 或 codex exec 测试 Codex CLI 是否可用',
        '检查 CODEX_CLI_BIN、CODEX_AGENT_MODEL 和 CODEX_AGENT_CWD 后重新发送指令',
      ],
      changedFiles: [],
      needsCodexSession: true,
    }, executionConfig)
    await writeCommandStatus({
      commandId: record.id,
      requestReceivedAt: record.receivedAt,
      status: 'failed',
      label: 'Agent 失败',
      summary,
      executionMode: executionConfig.mode,
      codexSandbox: executionConfig.sandbox,
    })
    lastStatus = 'failed'
    logConsole(`failed ${record.id}: ${summary}`)
    await appendLog('command-failed', { commandId: record.id, message: error.message || String(error) })
  } finally {
    lastProcessedKey = key
    await writeHeartbeat()
  }
}

function resolveExecutionConfig(record) {
  const payload = record.payload || {}
  const requestedMode = String(payload.executionMode || payload.requestedMode || '').toLowerCase()
  const requestedSandbox = String(payload.requestedSandbox || '').toLowerCase()
  const hasExplicitMode = Boolean(
    payload.executionMode
      || payload.requestedMode
      || payload.requestedSandbox
      || Object.prototype.hasOwnProperty.call(payload, 'canModifyFiles'),
  )
  const wantsWrite = (!hasExplicitMode && defaultExecutionMode === 'write')
    || payload.canModifyFiles === true
    || requestedMode === 'write'
    || requestedMode === 'edit'
    || requestedMode === 'workspace-write'
    || requestedSandbox === 'workspace-write'

  if (wantsWrite && allowWriteMode) {
    return {
      mode: 'write',
      label: '可改',
      sandbox: writeCodexSandbox,
      canModifyFiles: true,
    }
  }

  return {
    mode: 'read-only',
    label: wantsWrite && !allowWriteMode ? '只读（可改模式被环境禁用）' : '只读',
    sandbox: 'read-only',
    canModifyFiles: false,
  }
}

function normalizeExecutionMode(value) {
  const normalized = String(value || '').toLowerCase()
  if (normalized === 'write' || normalized === 'edit' || normalized === 'workspace-write') return 'write'
  return 'read-only'
}

function buildSystemPrompt(executionConfig) {
  const base = [
    '你是 RedBook 本地个人工作台与全站 Codex 助手的 agent daemon，负责处理网页写入 codex-inbox 的本地指令。',
    '你需要优先理解输入中的页面上下文 JSON、当前路径、用户原始指令和 RedBook 工作区约定。',
    '回复必须是 JSON 对象，不要使用 Markdown 代码块。字段：summary, reply, suggestedActions, changedFiles, needsCodexSession。',
    'changedFiles 必须只填写你确实修改过的文件；没有改文件就返回空数组。',
  ]

  if (executionConfig.canModifyFiles) {
    return [
      ...base,
      '当前请求是“可改”模式：你可以在工作区内读取和修改文件，使用最小必要改动完成用户目标。',
      '修改前先基于本地上下文判断范围；不要重构无关内容，不要覆盖用户未要求的改动。',
      '避免危险命令；不要执行 git reset、删除大目录或发布部署。需要高风险操作时把 needsCodexSession 设为 true。',
      '完成后尽量运行轻量验证；在 summary/reply 中说明验证结果。',
    ].join('\n')
  }

  return [
    ...base,
    '当前请求是“只读”模式：只分析、总结、建议和规划；不要修改文件，也不要声称已经修改或运行了未实际执行的命令。',
    '如果用户要求改代码、运行脚本、查询本地文件或执行高风险动作，请说明需要切换到“可改”模式或由 Codex 会话接手。',
  ].join('\n')
}

function buildModelInput(record) {
  const payload = record.payload || {}
  return [
    `当前日期：${new Date().toLocaleString('zh-CN')}`,
    `页面：${payload.page || '/tools/content-ops'}`,
    `指令类型：${payload.commandTypeLabel || payload.commandType || '未指定'}`,
    `执行模式：${payload.executionModeLabel || payload.executionMode || '未指定'}`,
    `请求 sandbox：${payload.requestedSandbox || '未指定'}`,
    `优先级：${payload.priorityLabel || payload.priority || '普通'}`,
    '',
    '用户原始指令：',
    payload.commandText || '',
    '',
    '页面提供的上下文 JSON：',
    JSON.stringify(payload.context || {}, null, 2),
    '',
    '页面生成的完整提示词：',
    payload.prompt || '',
  ].join('\n')
}

async function callCodexCli(record, executionConfig) {
  await mkdir(runDir, { recursive: true })
  const outputFile = path.join(runDir, `${safeFileName(record.id)}-last-message.json`)
  const args = [
    'exec',
    '--color',
    'never',
    '--ephemeral',
    '--sandbox',
    executionConfig.sandbox,
    '--cd',
    codexWorkingDir,
    '--output-schema',
    schemaPath,
    '--output-last-message',
    outputFile,
  ]

  if (model) {
    args.push('--model', model)
  }
  if (reasoningEffort) {
    args.push('-c', `model_reasoning_effort="${reasoningEffort}"`)
  }

  args.push('-')

  const prompt = [
    buildSystemPrompt(executionConfig),
    '',
    buildModelInput(record),
  ].join('\n')

  const result = await runCodexProcess(args, prompt)
  const lastMessage = await readTextFile(outputFile)
  const text = (lastMessage || cleanCodexOutput(result.stdout) || cleanCodexOutput(result.stderr)).trim()
  if (!text) throw new Error('Codex CLI 没有返回可读取的文本。')
  return text
}

function parseAgentJson(text) {
  const candidates = [
    text,
    text.match(/```(?:json)?\s*([\s\S]*?)\s*```/i)?.[1],
    text.slice(text.indexOf('{'), text.lastIndexOf('}') + 1),
  ].filter(Boolean)

  for (const candidate of candidates) {
    try {
      return JSON.parse(candidate.trim())
    } catch {
      // Try the next candidate.
    }
  }

  return null
}

function normalizeAgentPayload(parsed, fallbackText) {
  const payload = parsed && typeof parsed === 'object' ? parsed : {}
  const reply = stringOr(payload.reply, fallbackText.trim())
  const summary = stringOr(payload.summary, firstUsefulLine(reply))
  return {
    summary,
    reply,
    suggestedActions: arrayOfStrings(payload.suggestedActions),
    changedFiles: arrayOfStrings(payload.changedFiles),
    needsCodexSession: Boolean(payload.needsCodexSession),
  }
}

async function hasFreshResponse(record) {
  const response = await readJsonFile(responsePath)
  if (!response || response.commandId !== record.id) return false
  if (response.summary?.includes('OPENAI_API_KEY')) return false

  const responseAt = new Date(response.completedAt || response.receivedAt || '').getTime()
  const commandAt = new Date(record.receivedAt).getTime()
  return Number.isFinite(responseAt) && Number.isFinite(commandAt) && responseAt >= commandAt
}

async function writeResponse(record, payload, executionConfig = resolveExecutionConfig(record)) {
  const responseRecord = {
    receivedAt: new Date().toISOString(),
    completedAt: new Date().toISOString(),
    source: 'codex-agent-daemon',
    kind: 'codex-command-response',
    commandId: record.id,
    requestReceivedAt: record.receivedAt,
    runner,
    codexCli: codexBin,
    codexWorkingDir,
    codexSandbox: executionConfig.sandbox,
    model,
    modelLabel,
    mode: executionConfig.mode,
    executionMode: executionConfig.mode,
    executionModeLabel: executionConfig.label,
    canModifyFiles: executionConfig.canModifyFiles,
    status: payload.status || 'completed',
    label: payload.label || 'Agent 已完成',
    summary: payload.summary || '',
    reply: payload.reply || payload.summary || '',
    suggestedActions: arrayOfStrings(payload.suggestedActions),
    changedFiles: arrayOfStrings(payload.changedFiles),
    needsCodexSession: Boolean(payload.needsCodexSession),
  }

  await mkdir(inboxDir, { recursive: true })
  await writeFile(responsePath, JSON.stringify(responseRecord, null, 2), 'utf8')
  return responseRecord
}

async function writeCommandStatus(payload) {
  const record = {
    updatedAt: new Date().toISOString(),
    commandId: payload.commandId || '',
    requestReceivedAt: payload.requestReceivedAt || '',
    status: payload.status || 'queued',
    label: payload.label || payload.status || 'queued',
    summary: payload.summary || '',
    executionMode: payload.executionMode || '',
    codexSandbox: payload.codexSandbox || '',
    changedFiles: arrayOfStrings(payload.changedFiles),
  }

  await mkdir(inboxDir, { recursive: true })
  await writeFile(statusPath, JSON.stringify(record, null, 2), 'utf8')
  return record
}

async function writeHeartbeat(extra = {}) {
  await mkdir(inboxDir, { recursive: true })
  await writeFile(
    heartbeatPath,
    JSON.stringify({
      updatedAt: new Date().toISOString(),
      source: 'codex-agent-daemon',
      pid: process.pid,
      runner,
      codexCli: codexBin,
      codexWorkingDir,
      codexSandbox: lastSandbox,
      defaultCodexSandbox,
      writeCodexSandbox,
      model: modelLabel,
      reasoningEffort,
      mode: lastExecutionMode,
      defaultMode,
      defaultExecutionMode,
      allowWriteMode,
      pollMs,
      execTimeoutMs,
      lastCommandId,
      lastStatus,
      ...extra,
    }, null, 2),
    'utf8',
  )
}

async function appendLog(event, payload = {}) {
  await mkdir(inboxDir, { recursive: true })
  await appendFile(
    logPath,
    `${JSON.stringify({ at: new Date().toISOString(), event, ...payload })}\n`,
    'utf8',
  )
}

function logConsole(message) {
  console.log(`[${new Date().toLocaleTimeString('zh-CN')}] ${message}`)
}

async function readJsonFile(filePath) {
  try {
    const content = await readFile(filePath, 'utf8')
    return JSON.parse(stripBom(content))
  } catch {
    return null
  }
}

async function readTextFile(filePath) {
  try {
    return await readFile(filePath, 'utf8')
  } catch {
    return ''
  }
}

function runCodexProcess(args, stdin) {
  return new Promise((resolve, reject) => {
    logConsole(`spawn ${codexBin} ${args.join(' ')}`)
    const childEnv = {
      ...process.env,
      NO_COLOR: '1',
    }
    delete childEnv.CODEX_INTERNAL_ORIGINATOR_OVERRIDE
    delete childEnv.CODEX_THREAD_ID

    const child = spawn(codexBin, args, {
      cwd: codexWorkingDir,
      env: childEnv,
      windowsHide: true,
    })

    let stdout = ''
    let stderr = ''
    let settled = false
    const heartbeatTimer = setInterval(() => {
      writeHeartbeat().catch(() => {})
    }, 5000)
    const timer = setTimeout(() => {
      if (settled) return
      terminateChildProcess(child)
      clearInterval(heartbeatTimer)
      settled = true
      const outputDetail = [stdout, stderr]
        .map((text) => truncateText(cleanCodexOutput(text).trim(), 800))
        .filter(Boolean)
        .join(' ')
      reject(new Error(`Codex CLI 超时：${Math.round(execTimeoutMs / 1000)} 秒内没有完成。${outputDetail ? ` 输出片段：${outputDetail}` : ''}`))
    }, execTimeoutMs)

    child.stdout.setEncoding('utf8')
    child.stderr.setEncoding('utf8')
    child.stdout.on('data', (chunk) => {
      stdout += chunk
      if (verbose) process.stdout.write(chunk)
    })
    child.stderr.on('data', (chunk) => {
      stderr += chunk
      if (verbose) process.stderr.write(chunk)
    })
    child.on('error', (error) => {
      if (settled) return
      clearTimeout(timer)
      clearInterval(heartbeatTimer)
      settled = true
      reject(error)
    })
    child.on('close', (code) => {
      if (settled) return
      clearTimeout(timer)
      clearInterval(heartbeatTimer)
      settled = true
      if (code === 0) {
        resolve({ stdout, stderr })
        return
      }
      reject(new Error(`codex exec exited with ${code}: ${cleanCodexOutput(stderr || stdout)}`))
    })

    child.stdin.end(stdin)
  })
}

function terminateChildProcess(child) {
  if (process.platform === 'win32' && child.pid) {
    const killer = spawn('taskkill.exe', ['/PID', String(child.pid), '/T', '/F'], {
      windowsHide: true,
      stdio: 'ignore',
    })
    killer.on('error', () => {})
    return
  }
  child.kill()
}

async function loadEnvFiles(filePaths) {
  for (const filePath of filePaths) {
    let content = ''
    try {
      content = await readFile(filePath, 'utf8')
    } catch {
      continue
    }

    for (const rawLine of content.split(/\r?\n/)) {
      const line = rawLine.trim()
      if (!line || line.startsWith('#')) continue
      const match = line.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/)
      if (!match) continue
      const [, key, rawValue] = match
      if (process.env[key]) continue
      process.env[key] = stripQuotes(rawValue.trim())
    }
  }
}

function stripQuotes(value) {
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1)
  }
  return value
}

function stripBom(value) {
  return value.charCodeAt(0) === 0xfeff ? value.slice(1) : value
}

function stringOr(value, fallback) {
  return typeof value === 'string' && value.trim() ? value.trim() : fallback
}

function firstUsefulLine(value) {
  return value.split(/\r?\n/).map((line) => line.trim()).find(Boolean) || 'Agent 已处理这条指令。'
}

function arrayOfStrings(value) {
  return Array.isArray(value) ? value.filter((item) => typeof item === 'string' && item.trim()) : []
}

function cleanCodexOutput(value) {
  return String(value || '')
    .replace(/\u001b\[[0-9;]*m/g, '')
    .trim()
}

function truncateText(value, maxLength) {
  if (!value || value.length <= maxLength) return value
  return `${value.slice(0, maxLength)}...`
}

function safeFileName(value) {
  return String(value || 'command').replace(/[^a-zA-Z0-9_.-]/g, '_').slice(0, 120)
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
