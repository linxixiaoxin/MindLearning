import { createServer } from 'node:http'
import { appendFile, mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.resolve(__dirname, '..')
const inboxDir = path.resolve(projectRoot, 'codex-inbox')
const latestPath = path.join(inboxDir, 'thought-partner-latest.json')
const responsePath = path.join(inboxDir, 'thought-partner-response.json')
const commandLatestPath = path.join(inboxDir, 'codex-command-latest.json')
const commandLogPath = path.join(inboxDir, 'codex-command-log.jsonl')
const commandResponsePath = path.join(inboxDir, 'codex-command-response.json')
const commandStatusPath = path.join(inboxDir, 'codex-command-status.json')
const agentHeartbeatPath = path.join(inboxDir, 'codex-agent-heartbeat.json')
const port = Number(process.env.CODEX_BRIDGE_PORT || 8787)

const server = createServer(async (request, response) => {
  setCorsHeaders(response)

  if (request.method === 'OPTIONS') {
    response.writeHead(204)
    response.end()
    return
  }

  if (request.method === 'GET' && request.url === '/status') {
    const latestRequest = await readJsonFile(latestPath)
    const latestResponse = await readJsonFile(responsePath)
    const latestCommand = await readJsonFile(commandLatestPath)
    const latestCommandResponse = await readJsonFile(commandResponsePath)
    const latestCommandStatus = await readJsonFile(commandStatusPath)
    const agentHeartbeat = await readJsonFile(agentHeartbeatPath)
    writeJson(response, 200, {
      ok: true,
      service: 'codex-insight-bridge',
      started: true,
      port,
      inboxPath: latestPath,
      responsePath,
      commandInboxPath: commandLatestPath,
      commandLogPath,
      commandResponsePath,
      commandStatusPath,
      agentHeartbeatPath,
      latestRequestAt: latestRequest?.receivedAt || null,
      latestResponseAt: latestResponse?.receivedAt || latestResponse?.generatedAt || null,
      latestResponseSource: latestResponse?.source || null,
      latestCommandAt: latestCommand?.receivedAt || null,
      latestCommandType: latestCommand?.payload?.commandType || null,
      latestCommandStatus: latestCommandStatus?.status || null,
      latestCommandStatusLabel: latestCommandStatus?.label || null,
      latestCommandStatusAt: latestCommandStatus?.updatedAt || null,
      latestCommandResponseAt: latestCommandResponse?.receivedAt || latestCommandResponse?.completedAt || null,
      latestCommandResponseFor: latestCommandResponse?.commandId || latestCommandResponse?.requestReceivedAt || null,
      agentHeartbeatAt: agentHeartbeat?.updatedAt || null,
      agentModel: agentHeartbeat?.model || null,
      agentMode: agentHeartbeat?.mode || null,
      agentLastCommandId: agentHeartbeat?.lastCommandId || null,
      agentAlive: isRecentHeartbeat(agentHeartbeat?.updatedAt),
    })
    return
  }

  if (request.method === 'GET' && request.url === '/codex/inbox/latest') {
    try {
      const latestCommand = await readFile(commandLatestPath, 'utf8')
      writeJson(response, 200, JSON.parse(stripBom(latestCommand)))
    } catch {
      writeJson(response, 404, { error: 'No Codex command yet' })
    }
    return
  }

  if (request.method === 'POST' && request.url === '/codex/inbox') {
    try {
      const body = await readBody(request)
      const payload = JSON.parse(body || '{}')
      const record = {
        id: payload.id || `cmd-${Date.now()}`,
        receivedAt: new Date().toISOString(),
        source: 'book-kb-multi local webpage',
        kind: 'codex-command',
        payload,
      }

      await mkdir(inboxDir, { recursive: true })
      await writeFile(commandLatestPath, JSON.stringify(record, null, 2), 'utf8')
      await appendFile(commandLogPath, `${JSON.stringify(record)}\n`, 'utf8')
      await writeCommandStatus({
        commandId: record.id,
        requestReceivedAt: record.receivedAt,
        status: 'queued',
        label: '待 Codex 读取',
        summary: '页面已把指令写入本地收件箱，等待 Codex 会话读取处理。',
      })

      writeJson(response, 200, {
        ok: true,
        id: record.id,
        inboxPath: commandLatestPath,
        logPath: commandLogPath,
        receivedAt: record.receivedAt,
      })
    } catch (error) {
      writeJson(response, 500, {
        error: error.message || 'Failed to write Codex command inbox',
      })
    }
    return
  }

  if (request.method === 'GET' && request.url === '/codex/status') {
    try {
      const commandStatus = await readFile(commandStatusPath, 'utf8')
      writeJson(response, 200, JSON.parse(stripBom(commandStatus)))
    } catch {
      writeJson(response, 404, { error: 'No Codex command status yet' })
    }
    return
  }

  if (request.method === 'GET' && request.url === '/codex/agent') {
    try {
      const agentHeartbeat = await readFile(agentHeartbeatPath, 'utf8')
      const record = JSON.parse(stripBom(agentHeartbeat))
      writeJson(response, 200, { ...record, alive: isRecentHeartbeat(record.updatedAt) })
    } catch {
      writeJson(response, 404, { error: 'No Codex agent heartbeat yet', alive: false })
    }
    return
  }

  if (request.method === 'POST' && request.url === '/codex/status') {
    try {
      const body = await readBody(request)
      const payload = JSON.parse(body || '{}')
      const record = await writeCommandStatus(payload)

      writeJson(response, 200, {
        ok: true,
        statusPath: commandStatusPath,
        updatedAt: record.updatedAt,
      })
    } catch (error) {
      writeJson(response, 500, {
        error: error.message || 'Failed to write Codex command status',
      })
    }
    return
  }

  if (request.method === 'GET' && request.url === '/codex/response') {
    try {
      const commandResponse = await readFile(commandResponsePath, 'utf8')
      writeJson(response, 200, JSON.parse(stripBom(commandResponse)))
    } catch {
      writeJson(response, 404, { error: 'No Codex command response yet' })
    }
    return
  }

  if (request.method === 'POST' && request.url === '/codex/response') {
    try {
      const body = await readBody(request)
      const payload = JSON.parse(body || '{}')
      const record = {
        receivedAt: new Date().toISOString(),
        source: 'local Codex',
        kind: 'codex-command-response',
        ...payload,
      }

      await mkdir(inboxDir, { recursive: true })
      await writeFile(commandResponsePath, JSON.stringify(record, null, 2), 'utf8')
      await writeCommandStatus({
        commandId: record.commandId || record.requestReceivedAt || '',
        requestReceivedAt: record.requestReceivedAt || '',
        status: record.status || 'completed',
        label: record.label || '已完成',
        summary: record.summary || 'Codex 已写回处理结果。',
      })

      writeJson(response, 200, {
        ok: true,
        responsePath: commandResponsePath,
        receivedAt: record.receivedAt,
      })
    } catch (error) {
      writeJson(response, 500, {
        error: error.message || 'Failed to write Codex command response',
      })
    }
    return
  }

  if (request.method === 'GET' && request.url === '/thought-partner/response') {
    try {
      const responseBody = await readFile(responsePath, 'utf8')
      writeJson(response, 200, JSON.parse(stripBom(responseBody)))
    } catch {
      writeJson(response, 404, { error: 'No Codex response yet' })
    }
    return
  }

  if (request.method === 'POST' && request.url === '/thought-partner/response') {
    try {
      const body = await readBody(request)
      const payload = JSON.parse(body || '{}')
      const record = {
        receivedAt: new Date().toISOString(),
        ...payload,
      }
      await mkdir(inboxDir, { recursive: true })
      await writeFile(responsePath, JSON.stringify(record, null, 2), 'utf8')
      writeJson(response, 200, { ok: true, responsePath, receivedAt: record.receivedAt })
    } catch (error) {
      writeJson(response, 500, { error: error.message || 'Failed to write Codex response' })
    }
    return
  }

  if (request.method !== 'POST' || request.url !== '/thought-partner/inbox') {
    writeJson(response, 404, { error: 'Not found' })
    return
  }

  try {
    const body = await readBody(request)
    const payload = JSON.parse(body || '{}')
    const record = {
      receivedAt: new Date().toISOString(),
      source: 'book-kb-multi local webpage',
      payload,
    }

    await mkdir(inboxDir, { recursive: true })
    await writeFile(latestPath, JSON.stringify(record, null, 2), 'utf8')

    writeJson(response, 200, {
      ok: true,
      inboxPath: latestPath,
      receivedAt: record.receivedAt,
    })
  } catch (error) {
    writeJson(response, 500, {
      error: error.message || 'Failed to write Codex inbox',
    })
  }
})

server.listen(port, '127.0.0.1', () => {
  console.log(`Codex insight bridge listening on http://127.0.0.1:${port}`)
  console.log(`Latest inbox file: ${latestPath}`)
  console.log(`Latest response file: ${responsePath}`)
  console.log(`Latest command file: ${commandLatestPath}`)
  console.log(`Latest command status file: ${commandStatusPath}`)
})

function setCorsHeaders(response) {
  response.setHeader('Access-Control-Allow-Origin', '*')
  response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  response.setHeader('Cache-Control', 'no-store')
}

function stripBom(value) {
  return value.charCodeAt(0) === 0xfeff ? value.slice(1) : value
}

async function readJsonFile(filePath) {
  try {
    const content = await readFile(filePath, 'utf8')
    return JSON.parse(stripBom(content))
  } catch {
    return null
  }
}

async function writeCommandStatus(payload) {
  const record = {
    updatedAt: new Date().toISOString(),
    commandId: payload.commandId || '',
    requestReceivedAt: payload.requestReceivedAt || '',
    status: payload.status || 'queued',
    label: payload.label || statusLabelFor(payload.status || 'queued'),
    summary: payload.summary || '',
    changedFiles: Array.isArray(payload.changedFiles) ? payload.changedFiles : [],
  }

  await mkdir(inboxDir, { recursive: true })
  await writeFile(commandStatusPath, JSON.stringify(record, null, 2), 'utf8')
  return record
}

function statusLabelFor(status) {
  const labels = {
    queued: '待 Codex 读取',
    reading: 'Codex 已读取',
    running: '处理中',
    completed: '已完成',
    blocked: '需要人工确认',
    failed: '处理失败',
  }
  return labels[status] || status
}

function isRecentHeartbeat(value) {
  if (!value) return false
  const heartbeatAt = new Date(value).getTime()
  if (!Number.isFinite(heartbeatAt)) return false
  return Date.now() - heartbeatAt < 20_000
}

function writeJson(response, statusCode, body) {
  response.writeHead(statusCode, { 'Content-Type': 'application/json; charset=utf-8' })
  response.end(JSON.stringify(body))
}

function readBody(request) {
  return new Promise((resolve, reject) => {
    let body = ''
    request.setEncoding('utf8')
    request.on('data', (chunk) => {
      body += chunk
      if (body.length > 1_000_000) {
        request.destroy()
        reject(new Error('Request body too large'))
      }
    })
    request.on('end', () => resolve(body))
    request.on('error', reject)
  })
}
