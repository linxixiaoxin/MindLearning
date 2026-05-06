<template>
  <aside class="codex-dock" :class="{ open: dockOpen }" aria-label="Codex 助手">
    <button class="dock-tab" @click="dockOpen = !dockOpen">
      <span class="status-dot" :class="bridgeState"></span>
      <strong>Codex</strong>
      <small>{{ dockOpen ? '收起' : pageContext?.viewLabel || '助手' }}</small>
    </button>

    <section v-if="dockOpen" class="dock-panel">
      <header class="dock-head">
        <div>
          <span>LOCAL CODEX CLI</span>
          <h2>页面上下文助手</h2>
        </div>
        <button class="icon-btn" @click="dockOpen = false" aria-label="关闭 Codex 助手">×</button>
      </header>

      <div class="context-card">
        <span>当前页面</span>
        <strong>{{ pageContext?.viewLabel || '未知页面' }}</strong>
        <p>{{ contextLine }}</p>
      </div>

      <div class="mode-switch" aria-label="Codex 执行模式">
        <button
          v-for="mode in executionModes"
          :key="mode.id"
          :class="{ active: executionMode === mode.id }"
          @click="executionMode = mode.id"
        >
          <strong>{{ mode.label }}</strong>
          <span>{{ mode.description }}</span>
        </button>
      </div>

      <div class="quick-grid">
        <button
          v-for="command in quickCommands"
          :key="command.id"
          @click="useQuickCommand(command)"
        >
          {{ command.label }}
        </button>
      </div>

      <label class="command-box">
        <span>要交给本地 Codex 的话</span>
        <textarea
          v-model.trim="commandText"
          rows="5"
          placeholder="例如：基于当前页面，帮我判断下一步该推进什么，并列出需要改的文件。"
        ></textarea>
      </label>

      <div class="snippet-row">
        <button v-for="snippet in snippets" :key="snippet" @click="appendSnippet(snippet)">
          {{ snippet }}
        </button>
      </div>

      <div class="dock-actions">
        <button class="primary-btn" :disabled="!commandText || sending" @click="sendCommand">
          {{ sending ? '发送中' : '发送到 Codex CLI' }}
        </button>
        <button class="ghost-btn" @click="pollStatus(false)">刷新状态</button>
        <button class="ghost-btn" @click="toggleBackend">
          {{ backendOpen ? '收起后台' : '打开后台' }}
        </button>
      </div>

      <div class="bridge-row">
        <span :class="['bridge-pill', bridgeState]">{{ bridgeLabel }}</span>
        <span :class="['bridge-pill', agentAlive ? 'online' : 'offline']">{{ agentLabel }}</span>
        <span class="bridge-pill unknown">状态 {{ statusCheckedLabel }}</span>
      </div>

      <div v-if="statusMessage" class="status-box">{{ statusMessage }}</div>

      <section v-if="backendOpen" class="backend-panel">
        <div class="backend-head">
          <div>
            <span>AGENT BACKEND</span>
            <strong>实际收到的内容</strong>
            <small>{{ backendCheckedLabel }}</small>
          </div>
          <button class="ghost-btn" @click="refreshBackend">刷新后台</button>
        </div>
        <article class="backend-block">
          <span>latest inbox</span>
          <pre>{{ latestCommandPreview }}</pre>
        </article>
        <article class="backend-block">
          <span>status</span>
          <pre>{{ commandStatusPreview }}</pre>
        </article>
        <article class="backend-block">
          <span>response</span>
          <pre>{{ responsePreview }}</pre>
        </article>
      </section>

      <article v-if="latestResponse" class="response-box">
        <div>
          <span>Codex 回复</span>
          <strong>{{ latestResponse.label || latestResponse.status || '已写回' }}</strong>
        </div>
        <p v-if="latestResponse.summary">{{ latestResponse.summary }}</p>
        <p v-if="latestResponse.reply && latestResponse.reply !== latestResponse.summary">
          {{ latestResponse.reply }}
        </p>
        <ul v-if="latestResponse.suggestedActions?.length">
          <li v-for="action in latestResponse.suggestedActions" :key="action">{{ action }}</li>
        </ul>
      </article>
    </section>
  </aside>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'

const props = defineProps({
  pageContext: {
    type: Object,
    default: () => ({}),
  },
})

const bridgeUrl = 'http://127.0.0.1:8787'
const dockOpen = ref(false)
const commandText = ref('')
const selectedCommandType = ref('next-step')
const executionMode = ref('write')
const sending = ref(false)
const bridgeStatus = ref(null)
const latestReceipt = ref(null)
const latestResponse = ref(null)
const statusMessage = ref('')
const statusTimer = ref(null)
const backendTimer = ref(null)
const backendOpen = ref(false)
const latestCommandRecord = ref(null)
const latestCommandStatus = ref(null)
const backendResponse = ref(null)
const statusCheckedAt = ref('')
const backendCheckedAt = ref('')

const statusRefreshMs = 3000
const backendRefreshMs = 3000

const executionModes = [
  {
    id: 'read-only',
    label: '只读',
    description: '只分析和回复',
    sandbox: 'read-only',
  },
  {
    id: 'write',
    label: '可改',
    description: '允许改工作区文件',
    sandbox: 'workspace-write',
  },
]

const quickCommands = [
  {
    id: 'next-step',
    label: '下一步',
    type: 'planning',
    text: '基于当前页面上下文，帮我判断下一步最该推进什么。请按 P0 / P1 / P2 给出，并说明为什么。',
  },
  {
    id: 'strategy',
    label: '战略对齐',
    type: 'strategy',
    text: '请把当前页面和项目长期战略对齐：它服务哪个内核思想，偏离了什么，下一步该补什么。',
  },
  {
    id: 'fix-page',
    label: '改页面',
    type: 'edit',
    text: '请基于当前页面上下文，判断这个页面哪里不好用，并给出可以直接在本地仓库执行的改法。',
  },
  {
    id: 'summarize',
    label: '总结当前页',
    type: 'summary',
    text: '请总结当前页面在整个产品里的作用、已有信息、缺口和下一步行动。',
  },
  {
    id: 'update-index',
    label: '更新雷达',
    type: 'data',
    text: '请根据当前页面上下文，告诉我哪些数据或资料可能已经过期，需要运行什么脚本或检查什么文件。',
  },
  {
    id: 'write-doc',
    label: '同步文档',
    type: 'documentation',
    text: '请把当前判断整理成可以同步到项目中控台或产品文档的简洁条目。',
  },
]

const snippets = [
  '先读本地上下文',
  '只做最小可验证改动',
  '给我文件路径',
  '同步到工作台',
  '区分短期任务和长期战略',
]

const contextLine = computed(() => {
  const pieces = [
    props.pageContext?.path,
    props.pageContext?.book?.title,
    props.pageContext?.topic?.title,
    props.pageContext?.activeNode?.title,
  ].filter(Boolean)
  return pieces.join(' · ') || '会随页面切换自动更新。'
})

const bridgeState = computed(() => {
  if (!bridgeStatus.value) return 'unknown'
  return bridgeStatus.value.ok ? 'online' : 'offline'
})

const bridgeLabel = computed(() => {
  if (!bridgeStatus.value) return '桥接未检查'
  return bridgeStatus.value.ok ? '桥接在线' : '桥接离线'
})

const agentAlive = computed(() => Boolean(bridgeStatus.value?.agentAlive))

const agentLabel = computed(() => {
  if (!bridgeStatus.value?.ok) return 'Agent 未连接'
  if (agentAlive.value) return `Agent 在线 · ${bridgeStatus.value.agentModel || 'model'}`
  return 'Agent 离线'
})

const selectedExecutionMode = computed(() =>
  executionModes.find((item) => item.id === executionMode.value) || executionModes[0],
)

const latestCommandPreview = computed(() => formatBackendJson(latestCommandRecord.value))
const commandStatusPreview = computed(() => formatBackendJson(latestCommandStatus.value))
const responsePreview = computed(() => formatBackendJson(backendResponse.value))
const statusCheckedLabel = computed(() => formatCheckedAt(statusCheckedAt.value))
const backendCheckedLabel = computed(() =>
  backendCheckedAt.value ? `自动刷新中 · ${formatCheckedAt(backendCheckedAt.value)}` : '打开后自动刷新',
)

onMounted(() => {
  pollStatus(true)
  statusTimer.value = window.setInterval(() => pollStatus(true), statusRefreshMs)
})

onBeforeUnmount(() => {
  if (statusTimer.value) window.clearInterval(statusTimer.value)
  stopBackendAutoRefresh()
})

watch(dockOpen, (open) => {
  if (!open) return
  pollStatus(true)
  if (backendOpen.value) refreshBackend()
})

watch(backendOpen, (open) => {
  if (open) {
    startBackendAutoRefresh()
    return
  }
  stopBackendAutoRefresh()
})

function useQuickCommand(command) {
  selectedCommandType.value = command.type
  commandText.value = command.text
  if (command.type === 'edit' || command.type === 'documentation') {
    executionMode.value = 'write'
  }
}

function appendSnippet(snippet) {
  commandText.value = commandText.value ? `${commandText.value}\n${snippet}` : snippet
}

function buildPayload() {
  const command = commandText.value.trim()
  const commandTypeLabel = quickCommands.find((item) => item.type === selectedCommandType.value)?.label || '页面指令'
  const context = {
    page: props.pageContext || {},
    commonSnippets: snippets,
  }
  const payload = {
    id: `global-codex-${Date.now()}`,
    commandType: selectedCommandType.value,
    commandTypeLabel,
    executionMode: selectedExecutionMode.value.id,
    executionModeLabel: selectedExecutionMode.value.label,
    requestedSandbox: selectedExecutionMode.value.sandbox,
    canModifyFiles: selectedExecutionMode.value.id === 'write',
    priority: 'normal',
    priorityLabel: '普通',
    commandText: command,
    page: props.pageContext?.path || window.location.pathname,
    context,
  }
  payload.prompt = [
    '这是从 book-kb-multi 全站固定 Codex 助手发来的本地指令。',
    '',
    `当前页面：${props.pageContext?.viewLabel || props.pageContext?.view || '未知页面'}`,
    `当前路径：${props.pageContext?.path || window.location.pathname}`,
    `类型：${payload.commandTypeLabel}`,
    `执行模式：${payload.executionModeLabel}（${payload.requestedSandbox}）`,
    '',
    '用户原始指令：',
    command,
    '',
    '页面上下文 JSON：',
    JSON.stringify(context, null, 2),
    '',
    payload.canModifyFiles
      ? '用户已切换到“可改”模式。可以在工作区内做最小必要修改，并在 changedFiles 里列出改动文件。'
      : '用户已切换到“只读”模式。只分析和回复，不要修改文件；需要改动时说明建议交给可改模式或 Codex 会话接手。',
  ].join('\n')
  return payload
}

async function sendCommand() {
  if (!commandText.value.trim()) return
  sending.value = true
  statusMessage.value = ''
  latestResponse.value = null
  try {
    const response = await fetch(`${bridgeUrl}/codex/inbox`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(buildPayload()),
    })
    const data = await response.json().catch(() => ({}))
    if (!response.ok || !data.ok) throw new Error(data.error || '本地桥接未响应')
    latestReceipt.value = data
    statusMessage.value = `已写入本地 Codex 收件箱：${selectedExecutionMode.value.label}模式。`
    await pollStatus(true)
    await refreshBackend()
  } catch {
    bridgeStatus.value = { ok: false }
    statusMessage.value = '桥接离线。先在 web 目录运行 npm run codex:bridge；需要自动处理再运行 npm run codex:agent。'
  } finally {
    sending.value = false
  }
}

async function pollStatus(silent = false) {
  try {
    const response = await fetch(`${bridgeUrl}/status`)
    const data = await response.json().catch(() => ({}))
    if (!response.ok || !data.ok) throw new Error('bridge offline')
    bridgeStatus.value = data
    statusCheckedAt.value = new Date().toISOString()
    if (!silent) {
      statusMessage.value = data.agentAlive ? '桥接和 Agent 都在线。' : '桥接在线，Agent 暂未在线。'
    }
    if (data.latestCommandResponseAt) {
      await loadLatestResponse(true)
    }
  } catch {
    bridgeStatus.value = { ok: false }
    statusCheckedAt.value = new Date().toISOString()
    if (!silent) statusMessage.value = '桥接离线。'
  }
}

async function loadLatestResponse(silent = false) {
  try {
    const response = await fetch(`${bridgeUrl}/codex/response`)
    const data = await response.json().catch(() => ({}))
    if (!response.ok) {
      if (!silent) statusMessage.value = '暂时还没有 Codex 回复。'
      return
    }
    latestResponse.value = data
  } catch {
    if (!silent) statusMessage.value = '暂时无法读取 Codex 回复。'
  }
}

async function toggleBackend() {
  backendOpen.value = !backendOpen.value
}

async function refreshBackend() {
  try {
    const [latest, status, response] = await Promise.all([
      fetchJson('/codex/inbox/latest'),
      fetchJson('/codex/status'),
      fetchJson('/codex/response'),
    ])
    latestCommandRecord.value = latest
    latestCommandStatus.value = status
    backendResponse.value = response
    backendCheckedAt.value = new Date().toISOString()
  } catch {
    backendCheckedAt.value = new Date().toISOString()
    statusMessage.value = '后台读取失败，请确认 bridge 在线。'
  }
}

function startBackendAutoRefresh() {
  refreshBackend()
  if (backendTimer.value) return
  backendTimer.value = window.setInterval(() => {
    if (backendOpen.value) refreshBackend()
  }, backendRefreshMs)
}

function stopBackendAutoRefresh() {
  if (!backendTimer.value) return
  window.clearInterval(backendTimer.value)
  backendTimer.value = null
}

async function fetchJson(path) {
  const response = await fetch(`${bridgeUrl}${path}`)
  const data = await response.json().catch(() => ({}))
  if (!response.ok) return { error: data.error || `HTTP ${response.status}` }
  return data
}

function formatBackendJson(value) {
  if (!value) return '暂无'
  return JSON.stringify(value, null, 2)
}

function formatCheckedAt(value) {
  if (!value) return '未刷新'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '刚刚'
  return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}
</script>

<style scoped>
.codex-dock {
  position: fixed;
  right: 18px;
  bottom: 48px;
  z-index: 80;
  display: grid;
  justify-items: end;
  gap: 8px;
  color: var(--text-primary);
}

.dock-tab {
  border: 1px solid rgba(32, 79, 103, 0.24);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.94);
  box-shadow: var(--shadow-md);
  color: var(--text-primary);
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  max-width: min(360px, calc(100vw - 36px));
  padding: 10px 13px;
}

.dock-tab small {
  color: var(--text-tertiary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--text-muted);
}

.status-dot.online {
  background: #2f7d52;
}

.status-dot.offline {
  background: #a3493a;
}

.dock-panel {
  width: min(430px, calc(100vw - 36px));
  max-height: min(720px, calc(100vh - 106px));
  overflow: hidden auto;
  border: 1px solid var(--border-default);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.97);
  box-shadow: var(--shadow-md);
  padding: 14px;
}

.dock-panel::-webkit-scrollbar {
  width: 4px;
}

.dock-panel::-webkit-scrollbar-thumb {
  background: var(--border-strong);
  border-radius: 999px;
}

.dock-head,
.dock-actions,
.bridge-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.dock-head {
  justify-content: space-between;
}

.dock-head span,
.context-card span,
.command-box span,
.response-box span {
  color: var(--text-muted);
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.dock-head h2 {
  margin-top: 4px;
  color: var(--text-primary);
  font-family: var(--font-serif);
  font-size: 22px;
  line-height: 1.2;
}

.icon-btn {
  width: 28px;
  height: 28px;
  border: 1px solid var(--border-default);
  border-radius: 8px;
  background: #fff;
  color: var(--text-secondary);
  cursor: pointer;
  font-size: 18px;
  line-height: 1;
}

.context-card,
.response-box,
.status-box {
  border: 1px solid #204f6717;
  border-radius: 8px;
  background: #f8fbfb;
  margin-top: 12px;
  padding: 12px;
}

.context-card strong {
  display: block;
  margin-top: 5px;
  color: var(--text-primary);
}

.context-card p,
.response-box p,
.response-box li,
.status-box {
  color: var(--text-secondary);
  font-size: 12px;
  line-height: 1.65;
}

.context-card p {
  margin-top: 4px;
  overflow-wrap: anywhere;
}

.mode-switch {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
  margin-top: 12px;
}

.mode-switch button {
  border: 1px solid var(--border-default);
  border-radius: 8px;
  background: #fff;
  color: var(--text-secondary);
  cursor: pointer;
  padding: 9px 10px;
  text-align: left;
}

.mode-switch button.active {
  border-color: rgba(32, 79, 103, 0.34);
  background: #e7f0f2;
  color: var(--brand);
}

.mode-switch strong,
.mode-switch span {
  display: block;
}

.mode-switch strong {
  font-size: 13px;
}

.mode-switch span {
  margin-top: 3px;
  font-size: 11px;
  line-height: 1.35;
}

.quick-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 7px;
  margin-top: 12px;
}

.quick-grid button,
.snippet-row button,
.primary-btn,
.ghost-btn {
  border: 1px solid var(--border-default);
  border-radius: 8px;
  cursor: pointer;
  font-weight: 700;
}

.quick-grid button,
.snippet-row button {
  background: #ffffff;
  color: var(--text-secondary);
  padding: 8px;
  font-size: 12px;
}

.quick-grid button:hover,
.snippet-row button:hover {
  border-color: rgba(32, 79, 103, 0.28);
  color: var(--brand);
}

.command-box {
  display: grid;
  gap: 7px;
  margin-top: 12px;
}

.command-box textarea {
  width: 100%;
  resize: vertical;
  border: 1px solid var(--border-default);
  border-radius: 8px;
  background: #fff;
  color: var(--text-primary);
  outline: none;
  padding: 10px;
  font: inherit;
  font-size: 13px;
  line-height: 1.55;
}

.snippet-row {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 9px;
}

.snippet-row button {
  padding: 6px 8px;
  font-size: 11px;
}

.dock-actions {
  justify-content: space-between;
  flex-wrap: wrap;
  margin-top: 12px;
}

.primary-btn,
.ghost-btn {
  padding: 9px 11px;
  font-size: 12px;
}

.primary-btn {
  border-color: var(--brand);
  background: var(--brand);
  color: #fff;
}

.primary-btn:disabled {
  opacity: 0.48;
  cursor: not-allowed;
}

.ghost-btn {
  background: #fff;
  color: var(--text-secondary);
}

.bridge-row {
  flex-wrap: wrap;
  margin-top: 10px;
}

.backend-panel {
  border: 1px solid #204f6717;
  border-radius: 8px;
  background: #fbfaf6;
  margin-top: 12px;
  padding: 12px;
}

.backend-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 8px;
}

.backend-head span,
.backend-block span {
  display: block;
  color: var(--text-muted);
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.backend-head strong {
  display: block;
  margin-top: 4px;
  color: var(--text-primary);
  font-size: 14px;
}

.backend-head small {
  display: block;
  margin-top: 4px;
  color: var(--text-tertiary);
  font-size: 11px;
}

.backend-block {
  margin-top: 10px;
}

.backend-block pre {
  max-height: 190px;
  overflow: auto;
  border: 1px solid #204f6714;
  border-radius: 8px;
  background: #172a38;
  color: #f7f5f0;
  margin-top: 6px;
  padding: 10px;
  font-size: 11px;
  line-height: 1.45;
  white-space: pre-wrap;
  word-break: break-word;
}

.bridge-pill {
  border-radius: 999px;
  background: #204f6712;
  color: var(--brand);
  padding: 5px 8px;
  font-size: 11px;
  font-weight: 800;
}

.bridge-pill.offline {
  background: #bf6f3f16;
  color: var(--accent);
}

.bridge-pill.unknown {
  background: #f0ede6;
  color: var(--text-tertiary);
}

.response-box strong {
  display: block;
  margin-top: 5px;
  color: var(--text-primary);
}

.response-box ul {
  margin: 8px 0 0;
  padding-left: 18px;
}

@media (max-width: 720px) {
  .codex-dock {
    right: 10px;
    bottom: 46px;
  }

  .quick-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
