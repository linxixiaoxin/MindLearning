<template>
  <div class="roundtable-wrap">
    <div class="roundtable-scroll">
      <section class="roundtable-shell">
        <header class="roundtable-header">
          <div>
            <div class="tool-kicker">PROBLEM ROUNDTABLE</div>
            <h1>圆桌工作流</h1>
            <p>把一个真实问题放到桌面上，由教练、反方、证据馆员和内容编辑一起推进到行动卡和内容素材。</p>
          </div>
          <div class="header-actions">
            <button class="ghost-btn" type="button" @click="$emit('openProblemLab', selectedCase.id)">打开卡点</button>
            <button
              class="ghost-btn demo-btn"
              type="button"
              :disabled="!demoSession || demoPlaying"
              @click="playDemoSession()"
            >
              {{ demoPlaying ? '样张播放中' : '播放王熙凤样张' }}
            </button>
            <button
              v-if="demoPlaying"
              class="ghost-btn"
              type="button"
              @click="stopDemoPlayback('已停止样张播放，可以手动继续推进。')"
            >
              停止
            </button>
            <button class="primary-btn" type="button" @click="runNextStageManually">推进一轮</button>
          </div>
        </header>

        <section class="stage-strip" aria-label="圆桌流程阶段">
          <button
            v-for="(stage, index) in roundtableStages"
            :key="stage.id"
            class="stage-step"
            :class="{ active: index === stageIndex, done: index < stageIndex }"
            type="button"
            @click="jumpToStage(index)"
          >
            <span>{{ stage.label }}</span>
            <strong>{{ stage.output }}</strong>
          </button>
        </section>

        <section class="studio-grid">
          <aside class="user-panel">
            <div class="panel-head compact">
              <div>
                <div class="tool-kicker">VIRTUAL USER</div>
                <h2>真实 / 模拟用户</h2>
              </div>
              <button class="tiny-btn" type="button" @click="resetSession">重置</button>
            </div>

            <div class="real-problem-form">
              <div class="form-title">
                <span>REAL PROBLEM</span>
                <strong>真实问题入口</strong>
              </div>
              <label>
                <span>原始表达</span>
                <textarea
                  v-model.trim="rawProblemText"
                  rows="4"
                  placeholder="例如：我一解释就很着急，好像必须马上证明自己没有错。"
                ></textarea>
              </label>
              <div class="form-grid">
                <label>
                  <span>场景</span>
                  <select v-model="rawProblemSceneId">
                    <option v-for="scene in problemSceneOptions" :key="scene.id" :value="scene.id">
                      {{ scene.label }}
                    </option>
                  </select>
                </label>
                <label>
                  <span>称呼</span>
                  <input v-model.trim="rawProblemName" placeholder="可选" />
                </label>
              </div>
              <button
                class="secondary-btn"
                type="button"
                :disabled="!rawProblemText"
                @click="addRawProblemUser"
              >
                放到圆桌上
              </button>
              <small>默认只作为本地工作假设，不做诊断，也不上传隐私材料。</small>
            </div>

            <div class="user-list">
              <button
                v-for="user in users"
                :key="user.id"
                class="user-row"
                :class="{ active: user.id === selectedUser.id }"
                type="button"
                @click="selectUser(user.id)"
              >
                <span class="avatar">{{ user.avatarText }}</span>
                <span>
                  <strong>{{ user.name }}</strong>
                  <small>{{ user.archetype }}</small>
                </span>
              </button>
            </div>

            <div class="seed-maker">
              <label>
                <span>来源设定</span>
                <select v-model="sourceSeedId">
                  <option v-for="source in sourceSeedOptions" :key="source.id" :value="source.id">
                    {{ source.label }}
                  </option>
                </select>
              </label>
              <label>
                <span>生成线索</span>
                <textarea
                  v-model.trim="seedText"
                  rows="3"
                  placeholder="例如：一个读了很多沟通书，但亲密关系里总是越解释越着急的人"
                ></textarea>
              </label>
              <button class="secondary-btn" type="button" @click="addVirtualUser">生成模拟用户</button>
            </div>

            <article class="profile-panel">
              <div class="profile-top">
                <span class="avatar large">{{ selectedUser.avatarText }}</span>
                <div>
                  <strong>{{ selectedUser.name }}</strong>
                  <small>{{ selectedUser.status }}</small>
                </div>
              </div>
              <p>{{ selectedUser.baseNeed }}</p>
              <div class="tag-list">
                <span v-for="trait in selectedUser.traits" :key="trait">{{ trait }}</span>
              </div>
            </article>
          </aside>

          <main class="roundtable-main">
            <section class="mode-bar">
              <button
                v-for="mode in roundtableModes"
                :key="mode.id"
                class="mode-btn"
                :class="{ active: mode.id === selectedModeId }"
                type="button"
                @click="selectedModeId = mode.id"
              >
                <strong>{{ mode.label }}</strong>
                <span>{{ mode.tone }}</span>
              </button>
            </section>

            <section class="life-model-panel">
              <div class="panel-head compact">
                <div>
                  <div class="tool-kicker">VIRTUAL LIFE MODEL</div>
                  <h2>人格原型假设</h2>
                </div>
                <span class="status-pill safety">{{ kbStatusText }} · 非诊断</span>
              </div>

              <div class="model-select-grid">
                <label>
                  <span>文学原型</span>
                  <select v-model="selectedArchetypeId">
                    <option v-for="kernel in archetypeKernels" :key="kernel.id" :value="kernel.id">
                      {{ kernel.shortTitle }}
                    </option>
                  </select>
                </label>
                <label>
                  <span>规则压力</span>
                  <select v-model="selectedRuleId">
                    <option v-for="rule in archetypeRuleSets" :key="rule.id" :value="rule.id">
                      {{ rule.title }}
                    </option>
                  </select>
                </label>
                <button class="tiny-btn model-apply" type="button" @click="applyArchetypeToUser">
                  应用到用户
                </button>
              </div>

              <article class="model-hypothesis">
                <strong>{{ selectedArchetype.shortTitle }} × {{ selectedRule.title }}</strong>
                <p>{{ personaHypothesis }}</p>
                <div class="model-tags">
                  <span v-for="signal in modelSignals" :key="signal">{{ signal }}</span>
                </div>
              </article>
            </section>

            <section class="arch-pairings">
              <div class="panel-head compact"><div><div class="tool-kicker">ARCHETYPE PAIRINGS</div><h2>原型对照议题</h2></div></div>
              <div class="pairing-list">
                <article v-for="p in archetypeRoundtables" :key="p.id" class="pairing-card">
                  <div class="pairing-card-head">
                    <strong>{{ p.title }}</strong>
                    <small>{{ p.scene }}</small>
                  </div>
                  <div class="pairing-participants">
                    <span v-for="pt in p.participants" :key="pt.name" class="pt-badge" :class="pt.type">{{ pt.name }} · {{ pt.role }}</span>
                  </div>
                  <p class="pairing-question">{{ p.moderatorQuestion }}</p>
                </article>
              </div>
            </section>

            <section class="table-stage" :class="selectedModeId">
              <div class="round-table" aria-label="圆桌席位">
                <div class="problem-card">
                  <span>{{ currentStage.label }}</span>
                  <strong>{{ selectedCase.shortTitle }}</strong>
                  <p>{{ selectedUser.problem }}</p>
                </div>

                <button
                  v-for="agent in roundtableAgents"
                  :key="agent.id"
                  class="agent-seat"
                  :class="[agent.seat, { active: activeAgentIds.includes(agent.id) }]"
                  type="button"
                  :style="{ '--agent-color': agent.color }"
                  @click="focusAgentId = agent.id"
                >
                  <span>{{ agent.shortName }}</span>
                  <strong>{{ agent.name }}</strong>
                </button>
              </div>

              <aside class="agent-brief">
                <span>{{ focusedAgent.name }}</span>
                <strong>{{ focusedAgent.role }}</strong>
                <p>{{ focusedAgent.task }}</p>
              </aside>
            </section>

            <section class="conversation-panel">
              <div class="panel-head compact">
                <div>
                  <div class="tool-kicker">SESSION STREAM</div>
                  <h2>{{ currentStage.output }}</h2>
                </div>
                <span class="status-pill">{{ selectedMode.label }}</span>
              </div>

              <div class="message-list" :class="selectedModeId">
                <article
                  v-for="message in visibleMessages"
                  :key="message.id"
                  class="message-row"
                  :class="[message.agentId, { user: message.agentId === 'user' }]"
                >
                  <span class="message-role">{{ message.role }}</span>
                  <p>{{ message.text }}</p>
                </article>
              </div>

              <div class="reply-options">
                <button
                  v-for="reply in userReplyOptions"
                  :key="reply"
                  type="button"
                  @click="applyUserReply(reply)"
                >
                  {{ reply }}
                </button>
              </div>
            </section>
          </main>

          <aside class="output-panel">
            <section class="growth-panel">
              <div class="panel-head compact">
                <div>
                  <div class="tool-kicker">GROWTH STATE</div>
                  <h2>持续成长</h2>
                </div>
                <span class="status-pill">{{ growthEvent.text }}</span>
              </div>

              <div class="growth-list">
                <div v-for="metric in growthMetrics" :key="metric.id" class="growth-row">
                  <span>{{ metric.label }}</span>
                  <div class="meter">
                    <i :style="{ width: `${metric.value}%` }"></i>
                  </div>
                  <strong>{{ metric.value }}</strong>
                </div>
              </div>

              <div class="timeline">
                <article v-for="item in visibleTimeline" :key="item">
                  {{ item }}
                </article>
              </div>
            </section>

            <section class="artifact-panel">
              <div class="panel-head compact">
                <div>
                  <div class="tool-kicker">CONTENT ARTIFACT</div>
                  <h2>小红书素材</h2>
                </div>
                <div class="mini-actions">
                  <button class="tiny-btn" type="button" @click="pushArtifactToContentOps">写入</button>
                  <button class="tiny-btn" type="button" @click="$emit('openContentOps')">进中台</button>
                </div>
              </div>

              <div class="artifact-block">
                <span>封面钩子</span>
                <strong>{{ contentArtifact.hook }}</strong>
              </div>

              <ol class="slide-list">
                <li v-for="slide in contentArtifact.slides" :key="slide">{{ slide }}</li>
              </ol>

              <div class="evidence-list">
                <span v-for="book in selectedCase.relatedBooks.slice(0, 3)" :key="book.title">
                  {{ book.title }}
                </span>
              </div>
            </section>

            <section class="session-panel">
              <div class="panel-head compact">
                <div>
                  <div class="tool-kicker">SESSION LEDGER</div>
                  <h2>会话沉淀</h2>
                </div>
                <button class="tiny-btn" type="button" @click="saveRoundtableSession">保存</button>
              </div>

              <div v-if="sessionNotice" class="session-notice">{{ sessionNotice }}</div>
              <div class="session-list">
                <article v-for="session in visibleSavedSessions.slice(0, 3)" :key="session.id">
                  <span>{{ formatSessionTime(session.savedAt) }}</span>
                  <strong>{{ session.output?.xhsSeed?.hook || session.output?.contentArtifact?.title || session.problemTitle }}</strong>
                  <small>{{ session.modeLabel }} · {{ session.archetype?.shortTitle }}</small>
                  <div class="session-actions">
                    <button class="restore-btn" type="button" @click="restoreRoundtableSession(session)">恢复</button>
                    <button class="restore-btn play" type="button" :disabled="demoPlaying" @click="playDemoSession(session)">播放</button>
                  </div>
                </article>
                <p v-if="!visibleSavedSessions.length">还没有保存会话。跑完一轮后可以把它沉淀成 Roundtable Session。</p>
              </div>
            </section>
          </aside>
        </section>
      </section>
    </div>
  </div>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import {
  archetypeKernels as fallbackArchetypeKernels,
  ruleSets as fallbackArchetypeRuleSets,
} from '../data/archetypeLabData.js'
import { getProblemCase } from '../data/problemCaseData.js'
import { archetypeRoundtables } from '../data/roundtableData.js'
import {
  createVirtualUserFromRawProblem,
  createVirtualUserFromSeed,
  growthEvents,
  problemSceneOptions,
  roundtableAgents,
  roundtableModes,
  roundtableStages,
  sourceSeedOptions,
  virtualUserTemplates,
} from '../data/roundtableData.js'

defineEmits(['openProblemLab', 'openContentOps'])

const roundtableSessionStorageKey = 'redbook:roundtable-sessions'
const contentArtifactStorageKey = 'redbook:content-artifact-inbox'
const wangxifengDemoSessionId = 'roundtable-session-wangxifeng-control-hub-2026-05-03'

const users = ref(virtualUserTemplates.map(cloneUser))
const selectedUserId = ref(users.value[0].id)
const knowledgeBase = ref(null)
const kbLoadState = ref('loading')
const rawProblemText = ref('')
const rawProblemSceneId = ref(problemSceneOptions[0].id)
const rawProblemName = ref('')
const sourceSeedId = ref(sourceSeedOptions[0].id)
const seedText = ref(sourceSeedOptions[0].seed)
const selectedModeId = ref('yes-and')
const selectedArchetypeId = ref(fallbackArchetypeKernels[0]?.id || '')
const selectedRuleId = ref(fallbackArchetypeRuleSets[0]?.id || '')
const stageIndex = ref(0)
const focusAgentId = ref('host')
const sessionTimeline = ref([])
const userReplies = ref([])
const sessionNotice = ref('')
const savedSessions = ref(loadStoredList(roundtableSessionStorageKey))
const kbSavedSessions = ref([])
const restoringSession = ref(false)
const demoTimer = ref(null)
const demoPlaying = ref(false)

const selectedUser = computed(() => users.value.find((user) => user.id === selectedUserId.value) || users.value[0])
const selectedCase = computed(() => getProblemCase(selectedUser.value.problemCaseId))
const selectedMode = computed(() => roundtableModes.find((mode) => mode.id === selectedModeId.value) || roundtableModes[0])
const archetypeKernels = computed(() => {
  const uiArchetypes = knowledgeBase.value?.ui_archetypes?.length
    ? knowledgeBase.value.ui_archetypes
    : fallbackArchetypeKernels
  return uniqueById([
    ...uiArchetypes,
    ...normalizeKnowledgeBaseArchetypes(knowledgeBase.value?.archetype_kernels),
  ])
})
const archetypeRuleSets = computed(() => {
  const uiRules = knowledgeBase.value?.ui_rule_sets?.length
    ? knowledgeBase.value.ui_rule_sets
    : fallbackArchetypeRuleSets
  return uniqueById([
    ...uiRules,
    ...normalizeKnowledgeBaseRuleSets(knowledgeBase.value?.rule_sets),
  ])
})
const selectedArchetype = computed(() =>
  archetypeKernels.value.find((kernel) => kernel.id === selectedArchetypeId.value) || archetypeKernels.value[0],
)
const selectedRule = computed(() =>
  archetypeRuleSets.value.find((rule) => rule.id === selectedRuleId.value) || archetypeRuleSets.value[0],
)
const visibleSavedSessions = computed(() => {
  const seen = new Set()
  return [
    ...savedSessions.value,
    ...kbSavedSessions.value,
  ].filter((session) => {
    if (seen.has(session.id)) return false
    seen.add(session.id)
    return true
  })
})
const demoSession = computed(() => (
  visibleSavedSessions.value.find((session) => session.id === wangxifengDemoSessionId)
  || visibleSavedSessions.value.find((session) => session.problemCaseId === 'control-hub-dependency')
  || null
))
const kbStatusText = computed(() => {
  if (kbLoadState.value === 'ready') return 'KB 已连接'
  if (kbLoadState.value === 'fallback') return '内置数据'
  return '读取中'
})
const currentStage = computed(() => roundtableStages[stageIndex.value] || roundtableStages[0])
const growthEvent = computed(() =>
  growthEvents.find((event) => event.stageId === currentStage.value.id) || growthEvents[0],
)
const focusedAgent = computed(() =>
  roundtableAgents.find((agent) => agent.id === focusAgentId.value) || roundtableAgents[0],
)
const activeAgentIds = computed(() => {
  if (selectedModeId.value === 'coach-1v1') return ['torch', 'host']
  if (selectedModeId.value === 'content-turn') return ['editor', 'evidence', 'host']
  if (selectedModeId.value === 'debate') return ['host', 'challenger', 'evidence', 'torch']
  return ['host', 'torch', 'evidence', 'challenger', 'editor']
})
const visibleMessages = computed(() => buildMessages({
  user: selectedUser.value,
  problemCase: selectedCase.value,
  stage: currentStage.value,
  modeId: selectedModeId.value,
  userReplies: userReplies.value,
  archetype: selectedArchetype.value,
  rule: selectedRule.value,
  personaHypothesis: personaHypothesis.value,
}))
const personaHypothesis = computed(() => {
  const model = selectedArchetype.value?.lifeModel || {}
  const protection = model.protection || '一个曾经有效的保护策略'
  const need = model.need || selectedCase.value.needTags.join('、')
  const pressure = selectedRule.value?.reveal || selectedRule.value?.pressure || '当前规则压力'
  return `${selectedUser.value.name}的当前问题可以先被看作一条“${selectedArchetype.value.shortTitle}”线索：可能在用“${protection}”保护“${need}”。当规则变成“${selectedRule.value.title}”时，${pressure}会被放大。`
})
const modelSignals = computed(() => [
  ...(selectedArchetype.value?.signals || []).slice(0, 3),
  selectedRule.value?.shortTitle || selectedRule.value?.title,
  '可校正假设',
].filter(Boolean))
const growthMetrics = computed(() => {
  const growth = selectedUser.value.growth
  return [
    { id: 'awareness', label: '觉察', value: clamp(growth.awareness) },
    { id: 'agency', label: '行动感', value: clamp(growth.agency) },
    { id: 'expression', label: '表达', value: clamp(growth.expression) },
    { id: 'evidence', label: '证据感', value: clamp(growth.evidence) },
  ]
})
const visibleTimeline = computed(() => [
  ...selectedUser.value.timeline,
  ...sessionTimeline.value,
].slice(-6))
const userReplyOptions = computed(() => {
  if (currentStage.value.id === 'intake') return ['这句话确实说中了', '我还想补一个现场细节']
  if (currentStage.value.id === 'assumption') return ['这个假设有点刺痛', '让我换一个更温和的说法']
  if (currentStage.value.id === 'action') return ['这个动作我愿意试一天', '动作还要再小一点']
  return ['继续推进', '先帮我收束成一句话']
})
const contentArtifact = computed(() => {
  const action = selectedCase.value.minimumAction
  return {
    id: `artifact-${selectedCase.value.id}-${selectedArchetype.value.id}`,
    title: selectedCase.value.title,
    source: 'Roundtable Session',
    hook: `为什么${selectedCase.value.shortTitle}，真正卡住的不是你以为的那件事？`,
    slides: [
      selectedUser.value.problem,
      selectedCase.value.problemNaming,
      `隐含假设：${inferHiddenAssumption(selectedCase.value, selectedUser.value)}`,
      `人格原型假设：${selectedArchetype.value.shortTitle}，但只作为可校正线索。`,
      `可学习视角：${selectedCase.value.recommendedThinkers[0]?.name || '思想伙伴'}的${selectedCase.value.recommendedThinkers[0]?.role || '视角'}`,
      `今天先做：${action?.text || selectedCase.value.minimumAction?.title || '一个最小动作'}`,
    ],
  }
})

watch(selectedUserId, () => {
  if (restoringSession.value) return
  stageIndex.value = 0
  focusAgentId.value = 'host'
  sessionTimeline.value = []
  userReplies.value = []
})

watch(archetypeKernels, (items) => {
  if (!items.some((kernel) => kernel.id === selectedArchetypeId.value)) {
    selectedArchetypeId.value = items[0]?.id || ''
  }
})

watch(archetypeRuleSets, (items) => {
  if (!items.some((rule) => rule.id === selectedRuleId.value)) {
    selectedRuleId.value = items[0]?.id || ''
  }
})

onMounted(() => {
  loadArchetypeKnowledgeBase()
})

onBeforeUnmount(() => {
  stopDemoPlayback()
})

async function loadArchetypeKnowledgeBase() {
  try {
    const response = await fetch('/archetype-kb/index.json')
    if (!response.ok) throw new Error(`KB ${response.status}`)
    const data = await response.json()
    knowledgeBase.value = data
    mergeKnowledgeBaseUsers(buildKnowledgeBaseRoundtableSeeds(data))
    kbSavedSessions.value = normalizeKnowledgeBaseSessions(data.roundtable_sessions)
    kbLoadState.value = 'ready'
  } catch {
    kbSavedSessions.value = []
    kbLoadState.value = 'fallback'
  }
}

function buildKnowledgeBaseRoundtableSeeds(data = {}) {
  return [
    ...(Array.isArray(data.roundtable_seed_users) ? data.roundtable_seed_users : []),
    ...(Array.isArray(data.virtual_persons) ? data.virtual_persons : []),
  ]
}

function normalizeKnowledgeBaseArchetypes(items = []) {
  if (!Array.isArray(items)) return []
  return items.map((item) => ({
    id: item.id,
    title: item.title,
    shortTitle: item.shortTitle || item.short_title || item.title,
    source: item.source || item.source_work_ids?.join('、') || 'archetype-kb',
    symbol: item.symbol || String(item.short_title || item.title || '原').slice(0, 1),
    color: item.color || '#8f624f',
    thesis: item.thesis || item.core_situation,
    lifeModel: {
      need: item.lifeModel?.need || item.need,
      fear: item.lifeModel?.fear || item.fear,
      protection: item.lifeModel?.protection || item.protection_strategy,
      relationScript: item.lifeModel?.relationScript || item.relationship_script,
      growthEdge: item.lifeModel?.growthEdge || item.growth_edge || item.destiny_pattern,
    },
    signals: item.signals || [],
    scenes: (item.scenes || item.modern_transplants || []).map((scene, index) => (
      typeof scene === 'string'
        ? {
            id: `${item.id}-scene-${index}`,
            title: scene,
            context: scene,
            conflict: item.core_situation,
            transplant: scene,
            contentAngles: [],
            storySeed: scene,
          }
        : scene
    )),
  }))
}

function normalizeKnowledgeBaseRuleSets(items = []) {
  if (!Array.isArray(items)) return []
  return items.map((item) => ({
    id: item.id,
    title: item.title,
    shortTitle: item.shortTitle || item.short_title || item.title,
    pressure: item.pressure,
    reveal: item.reveal || item.win_or_progress_condition || item.pressure,
    mechanics: item.mechanics || item.actions || item.state_variables || [],
    reviewPrompt: item.reviewPrompt || item.review_prompts?.[0] || item.win_or_progress_condition,
  }))
}

function normalizeKnowledgeBaseSessions(sessions = []) {
  if (!Array.isArray(sessions)) return []
  return sessions.map((session) => ({
    ...session,
    savedAt: session.savedAt || session.saved_at || session.createdAt || session.created_at,
    problemCaseId: session.problemCaseId || session.problem_case_id || 'team-truth-silence',
    problemTitle: session.problemTitle || session.problem_title || session.title,
    modeId: session.modeId || session.mode_id || 'yes-and',
    modeLabel: session.modeLabel || session.mode_label || 'KB 样张',
    stageId: session.stageId || session.stage_id || 'content',
    output: {
      ...(session.output || {}),
      xhsSeed: session.output?.xhsSeed || session.output?.contentArtifact || session.output?.content_artifact,
    },
  }))
}

function mergeKnowledgeBaseUsers(seedUsers = []) {
  if (!Array.isArray(seedUsers) || seedUsers.length === 0) return

  const normalized = seedUsers.map(normalizeRoundtableSeedUser)
  const normalizedIds = new Set(normalized.map((user) => user.id))
  const existingCustomUsers = users.value.filter((user) => (
    user.id.startsWith('real-problem-')
    || user.id.startsWith('virtual-')
    || user.id.startsWith('restored-')
  ))
  const fallbackOnly = virtualUserTemplates
    .filter((user) => !normalizedIds.has(user.id))
    .map(cloneUser)

  users.value = [
    ...normalized,
    ...fallbackOnly,
    ...existingCustomUsers,
  ]

  if (!users.value.some((user) => user.id === selectedUserId.value)) {
    selectedUserId.value = users.value[0]?.id || ''
  }
}

function normalizeRoundtableSeedUser(seedUser) {
  const fallback = virtualUserTemplates.find((user) => user.id === seedUser.id)
  const problem = seedUser.problem || seedUser.current_problem || ''
  const base = fallback ? cloneUser(fallback) : {
    id: seedUser.id,
    name: seedUser.name,
    avatarText: String(seedUser.name || '种').slice(0, 1),
    source: seedUser.source || 'archetype-kb seed',
    archetype: seedUser.archetype || seedUser.source_archetype_ids?.[0] || '虚拟人生种子',
    currentAge: null,
    status: seedUser.status || '来自人格原型知识库',
    baseNeed: '希望把一个真实问题拆成可以学习、行动和表达的路径。',
    trigger: problem || '从知识库种子进入圆桌。',
    problem,
    problemCaseId: seedUser.problem_case_id || seedUser.problemCaseId || 'notes-to-writing',
    traits: seedUser.traits || seedUser.relationship_patterns || [],
    growth: {
      awareness: 36,
      agency: 30,
      expression: 34,
      evidence: 28,
    },
    timeline: ['来自 archetype-kb 的 Roundtable seed user。'],
  }

  return {
    ...base,
    source: seedUser.source || base.source,
    archetype: seedUser.archetype || seedUser.source_archetype_ids?.[0] || base.archetype,
    status: seedUser.status || seedUser.life_stage || base.status,
    problem: problem || base.problem,
    problemCaseId: seedUser.problem_case_id || seedUser.problemCaseId || base.problemCaseId,
    traits: seedUser.traits?.length
      ? [...seedUser.traits]
      : seedUser.relationship_patterns?.length
        ? [...seedUser.relationship_patterns]
        : [...(base.traits || [])],
  }
}

function selectUser(userId) {
  stopDemoPlayback()
  selectedUserId.value = userId
}

function addRawProblemUser() {
  const nextUser = createVirtualUserFromRawProblem({
    rawText: rawProblemText.value,
    sceneId: rawProblemSceneId.value,
    name: rawProblemName.value,
  })
  users.value = [nextUser, ...users.value]
  selectedUserId.value = nextUser.id
  rawProblemText.value = ''
  rawProblemName.value = ''
  sessionNotice.value = '真实问题已进入圆桌。先把它当成可修正的工作材料。'
}

function addVirtualUser() {
  const nextUser = createVirtualUserFromSeed(seedText.value, sourceSeedId.value)
  users.value = [nextUser, ...users.value]
  selectedUserId.value = nextUser.id
}

function applyArchetypeToUser() {
  mutateSelectedUser((user) => {
    user.archetype = selectedArchetype.value.shortTitle
    user.lifeModel = {
      archetypeId: selectedArchetype.value.id,
      ruleId: selectedRule.value.id,
      hypothesis: personaHypothesis.value,
    }
    user.traits = uniqueList([
      ...(user.traits || []),
      ...(selectedArchetype.value.signals || []).slice(0, 2),
      selectedRule.value.shortTitle || selectedRule.value.title,
    ])
    user.timeline.push(`人格原型假设：${selectedArchetype.value.shortTitle} × ${selectedRule.value.title}`)
  })
  sessionTimeline.value.push(`建模假设：${selectedArchetype.value.shortTitle} × ${selectedRule.value.title}`)
  sessionNotice.value = '已把原型和规则应用到当前用户画像。'
}

function runNextStage() {
  const event = growthEvent.value
  mutateSelectedUser((user) => {
    user.growth[event.metric] = clamp(user.growth[event.metric] + event.delta)
    user.status = statusForStage(currentStage.value.id)
  })
  sessionTimeline.value.push(`${currentStage.value.label}：${event.text}`)
  if (stageIndex.value < roundtableStages.length - 1) {
    stageIndex.value += 1
  }
  focusAgentId.value = focusAgentForStage(currentStage.value.id)
}

function runNextStageManually() {
  stopDemoPlayback()
  runNextStage()
}

function jumpToStage(index) {
  stopDemoPlayback()
  stageIndex.value = index
  focusAgentId.value = focusAgentForStage(roundtableStages[index]?.id)
}

function applyUserReply(reply) {
  userReplies.value.push(reply)
  mutateSelectedUser((user) => {
    user.growth.expression = clamp(user.growth.expression + 3)
    user.growth.agency = clamp(user.growth.agency + 2)
  })
  sessionTimeline.value.push(`用户回应：${reply}`)
}

function resetSession() {
  stopDemoPlayback()
  users.value = virtualUserTemplates.map(cloneUser)
  mergeKnowledgeBaseUsers(buildKnowledgeBaseRoundtableSeeds(knowledgeBase.value))
  selectedUserId.value = users.value[0].id
  stageIndex.value = 0
  sessionTimeline.value = []
  userReplies.value = []
  sessionNotice.value = ''
}

function saveRoundtableSession() {
  const nextSession = buildRoundtableSession()
  savedSessions.value = [nextSession, ...savedSessions.value].slice(0, 12)
  persistList(roundtableSessionStorageKey, savedSessions.value)
  sessionNotice.value = '已保存为 Roundtable Session。'
}

function restoreRoundtableSession(session, options = {}) {
  const restoredUser = {
    id: `restored-${session.id}`,
    name: session.user?.name || '已保存用户',
    avatarText: String(session.user?.name || '已').slice(0, 1),
    source: session.user?.source || 'Roundtable Session',
    archetype: session.archetype?.shortTitle || '已保存人格假设',
    currentAge: null,
    status: '从已保存会话恢复',
    baseNeed: `继续处理：${session.problemTitle || '一个已保存问题'}`,
    trigger: session.user?.problem || '',
    problem: session.user?.problem || '',
    problemCaseId: session.problemCaseId || 'notes-to-writing',
    traits: uniqueList([
      session.archetype?.shortTitle,
      session.rule?.title,
      '已保存会话',
    ]),
    privacyLevel: session.user?.privacyLevel || 'synthetic',
    growth: {
      awareness: 54,
      agency: 46,
      expression: 48,
      evidence: 44,
    },
    timeline: Array.isArray(session.timeline) && session.timeline.length
      ? [...session.timeline]
      : ['从已保存 Roundtable Session 恢复。'],
    lifeModel: {
      archetypeId: session.archetype?.id,
      ruleId: session.rule?.id,
      hypothesis: session.archetype?.hypothesis,
    },
  }

  restoringSession.value = true
  users.value = [
    restoredUser,
    ...users.value.filter((user) => user.id !== restoredUser.id),
  ]
  selectedUserId.value = restoredUser.id
  selectedModeId.value = session.modeId || selectedModeId.value
  selectedArchetypeId.value = session.archetype?.id || selectedArchetypeId.value
  selectedRuleId.value = session.rule?.id || selectedRuleId.value
  const targetStageId = options.startAtStageId || session.stageId
  const targetStageIndex = roundtableStages.findIndex((stage) => stage.id === targetStageId)
  stageIndex.value = targetStageIndex >= 0 ? targetStageIndex : 0
  focusAgentId.value = focusAgentForStage(currentStage.value.id)
  sessionTimeline.value = Array.isArray(session.timeline) ? [...session.timeline] : []
  userReplies.value = []
  nextTick(() => {
    restoringSession.value = false
  })
  if (options.notice !== false) {
    sessionNotice.value = options.notice || '已恢复保存会话，可以继续推进或重新写入个人工作台。'
  }
}

function playDemoSession(session = demoSession.value) {
  if (!session) {
    sessionNotice.value = '还没有读取到王熙凤 KB 样张。请稍等 KB 连接完成后再播放。'
    return
  }
  if (typeof window === 'undefined') return

  stopDemoPlayback()
  restoreRoundtableSession(session, {
    startAtStageId: roundtableStages[0]?.id,
    notice: false,
  })
  stageIndex.value = 0
  focusAgentId.value = focusAgentForStage(currentStage.value.id)
  demoPlaying.value = true
  sessionNotice.value = '正在播放王熙凤控制中枢样张：问题进入 -> 命名 -> 假设 -> 视角 -> 行动 -> 内容回流。'

  demoTimer.value = window.setInterval(() => {
    if (stageIndex.value >= roundtableStages.length - 1) {
      finishDemoPlayback()
      return
    }
    runNextStage()
  }, 1400)
}

function finishDemoPlayback() {
  stopDemoPlayback('样张播放完成。右侧会话沉淀保留完整记录；进入 /tools/content-ops/ 可以在圆桌回流池看到内容素材。')
}

function stopDemoPlayback(nextNotice = '') {
  if (demoTimer.value && typeof window !== 'undefined') {
    window.clearInterval(demoTimer.value)
  }
  demoTimer.value = null
  demoPlaying.value = false
  if (nextNotice) sessionNotice.value = nextNotice
}

function focusAgentForStage(stageId) {
  const focusMap = {
    intake: 'host',
    naming: 'challenger',
    assumption: 'torch',
    perspective: 'evidence',
    action: 'torch',
    content: 'editor',
  }
  return focusMap[stageId] || 'host'
}

function pushArtifactToContentOps() {
  const artifact = {
    id: `roundtable-artifact-${Date.now()}`,
    origin: 'roundtable',
    type: '圆桌',
    title: contentArtifact.value.hook,
    source: '/tools/roundtable',
    useFor: `${selectedCase.value.title} · ${selectedArchetype.value.shortTitle} · ${selectedRule.value.title}`,
    topicSeeds: contentArtifact.value.slides,
    problemCaseId: selectedCase.value.id,
    createdAt: new Date().toISOString(),
  }
  const artifacts = [artifact, ...loadStoredList(contentArtifactStorageKey)].slice(0, 20)
  persistList(contentArtifactStorageKey, artifacts)
  sessionNotice.value = '已写入个人工作台圆桌回流池。'
}

function mutateSelectedUser(mutator) {
  users.value = users.value.map((user) => {
    if (user.id !== selectedUserId.value) return user
    const nextUser = cloneUser(user)
    mutator(nextUser)
    return nextUser
  })
}

function cloneUser(user) {
  return {
    ...user,
    traits: [...(user.traits || [])],
    timeline: [...(user.timeline || [])],
    growth: { ...(user.growth || {}) },
    lifeModel: user.lifeModel ? { ...user.lifeModel } : null,
  }
}

function buildRoundtableSession() {
  return {
    id: `roundtable-session-${Date.now()}`,
    savedAt: new Date().toISOString(),
    problemCaseId: selectedCase.value.id,
    problemTitle: selectedCase.value.title,
    modeId: selectedMode.value.id,
    modeLabel: selectedMode.value.label,
    stageId: currentStage.value.id,
    user: {
      id: selectedUser.value.id,
      name: selectedUser.value.name,
      source: selectedUser.value.source,
      problem: selectedUser.value.problem,
      privacyLevel: selectedUser.value.privacyLevel || 'synthetic',
    },
    archetype: {
      id: selectedArchetype.value.id,
      shortTitle: selectedArchetype.value.shortTitle,
      hypothesis: personaHypothesis.value,
    },
    rule: {
      id: selectedRule.value.id,
      title: selectedRule.value.title,
      pressure: selectedRule.value.pressure,
    },
    participants: activeAgentIds.value.map((agentId) => {
      const agent = roundtableAgents.find((item) => item.id === agentId)
      return agent?.name || agentId
    }),
    turns: visibleMessages.value,
    timeline: visibleTimeline.value,
    output: {
      clarifiedProblem: selectedCase.value.problemNaming,
      hiddenAssumptions: [inferHiddenAssumption(selectedCase.value, selectedUser.value)],
      newPerspectives: selectedCase.value.relatedConcepts.slice(0, 4),
      actionCard: selectedCase.value.minimumAction,
      xhsSeed: contentArtifact.value,
    },
  }
}

function buildMessages({ user, problemCase, stage, modeId, userReplies: replies, personaHypothesis: hypothesis }) {
  const baseMessages = {
    intake: [
      message('user', user.name, user.problem),
      message('host', '圆桌主持人', `先把它放到桌面上：${problemCase.currentSituation}`),
      message('torch', '火把教练', `这一轮先不急着证明对错，只确认你现在最想保护的需要：${problemCase.needTags.join('、')}。`),
    ],
    naming: [
      message('host', '圆桌主持人', problemCase.problemNaming),
      message('challenger', '反方朋友', `我想温和地挑战一下：你可能把“${user.trigger}”当成了全部原因，但真正卡住的是你给它的解释。`),
      message('torch', '火把教练', `火把只照一个地方：${problemCase.coreQuestion}`),
    ],
    assumption: [
      message('challenger', '反方朋友', `隐含假设可能是：${inferHiddenAssumption(problemCase, user)}`),
      message('host', '圆桌主持人', `人格原型只作为假设，不作为诊断：${hypothesis}`),
      message('host', '圆桌主持人', '我们不急着推翻它，先把它改成一个可以被验证的句子。'),
      message('torch', '火把教练', `今天先不做：${problemCase.workshopOutputs?.['torch-coach']?.noiseToIgnore || '继续放大自责和比较'}`),
    ],
    perspective: [
      message('evidence', '证据馆员', `${problemCase.relatedBooks[0]?.title || '主书'}可以作为主镜头：${problemCase.relatedBooks[0]?.reason || '把问题放回证据里看'}`),
      message('evidence', '证据馆员', `可学习概念：${problemCase.relatedConcepts.slice(0, 4).join('、')}。`),
      message('host', '圆桌主持人', `这一轮的视角不是给答案，而是让问题变得可学习。`),
    ],
    action: [
      message('torch', '火把教练', `${problemCase.minimumAction.title}：${problemCase.minimumAction.text}`),
      message('host', '圆桌主持人', `成功信号：${problemCase.minimumAction.successSignal}`),
      message('challenger', '反方朋友', '动作还可以更小，只要它真的会发生。'),
    ],
    content: [
      message('editor', '内容编辑', `封面可以从这个问题开始：${problemCase.title}`),
      message('editor', '内容编辑', `图文主线：场景 -> 误区命名 -> 底层机制 -> 书籍视角 -> 一句可尝试表达。`),
      message('host', '圆桌主持人', '这次拆解已经可以存成一个 Problem Case，也可以进入个人工作台排期。'),
    ],
  }[stage.id] || []

  const modeMessage = modeId === 'coach-1v1'
    ? [message('torch', '火把教练', '一对一模式下，我只问一个问题：你现在最不想承认但又最影响行动的是什么？')]
    : modeId === 'debate'
      ? [message('challenger', '反方朋友', '辩论模式下，我会保留一个反方位置：如果这个问题不是你想的那样，还可能是什么？')]
      : modeId === 'content-turn'
        ? [message('editor', '内容编辑', '内容转译模式会把每一轮拆解压缩成读者看得懂的一页。')]
        : []

  const replyMessages = replies.slice(-2).map((reply, index) =>
    message('user', `${user.name} 回应`, reply, `reply-${index}-${reply}`),
  )

  return [...baseMessages, ...modeMessage, ...replyMessages]
}

function message(agentId, role, text, id = '') {
  return {
    id: id || `${agentId}-${text.slice(0, 12)}`,
    agentId,
    role,
    text,
  }
}

function inferHiddenAssumption(problemCase, user) {
  if (problemCase.id === 'notes-to-writing') return '如果作品不够完整，别人就会看见我的不足。'
  if (problemCase.id === 'team-truth-silence') return '只要我追问真话，团队就会觉得被责备。'
  if (problemCase.id === 'control-hub-dependency') return '如果我不亲自盯住，系统就会塌，最后还是我背锅。'
  if (problemCase.id === 'school-major-compare') return '如果这次没有选对，以后就没有修正空间。'
  if (problemCase.id === 'relationship-trigger') return '如果我不马上解释清楚，对方就会误解我的价值。'
  return `如果${user.trigger}继续发生，就说明我没有能力改变。`
}

function statusForStage(stageId) {
  const statusMap = {
    intake: '开始把问题说出口',
    naming: '正在把自责改写成问题命名',
    assumption: '开始看见隐含假设',
    perspective: '正在建立学习视角',
    action: '已经拿到一个最小行动',
    content: '可以把拆解转成内容素材',
  }
  return statusMap[stageId] || '正在圆桌中成长'
}

function loadStoredList(key) {
  if (typeof window === 'undefined') return []
  try {
    const parsed = JSON.parse(window.localStorage.getItem(key) || '[]')
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function persistList(key, value) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(key, JSON.stringify(value))
}

function uniqueList(items) {
  return Array.from(new Set(items.filter(Boolean)))
}

function uniqueById(items) {
  const seen = new Set()
  return items.filter((item) => {
    if (!item?.id || seen.has(item.id)) return false
    seen.add(item.id)
    return true
  })
}

function formatSessionTime(value) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '刚刚'
  return date.toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function clamp(value) {
  return Math.max(0, Math.min(100, Math.round(value || 0)))
}
</script>

<style scoped>
.roundtable-wrap {
  height: 100%;
  min-height: 0;
  overflow: hidden;
  background:
    linear-gradient(135deg, rgba(247, 245, 240, 0.88), rgba(237, 241, 241, 0.92)),
    radial-gradient(circle at 16% 8%, rgba(191, 111, 63, 0.12), transparent 28%),
    radial-gradient(circle at 92% 8%, rgba(32, 79, 103, 0.12), transparent 30%);
}

.roundtable-scroll {
  height: 100%;
  min-height: 0;
  overflow-x: hidden;
  overflow-y: auto;
}

.roundtable-shell {
  width: min(100% - 36px, 1500px);
  min-width: 0;
  margin: 0 auto;
  padding: 22px 0 30px;
}

.roundtable-header,
.stage-strip,
.studio-grid {
  width: 100%;
  min-width: 0;
}

.roundtable-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 18px;
  margin-bottom: 16px;
}

.tool-kicker {
  color: var(--text-muted);
  font-size: 11px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.roundtable-header h1 {
  margin-top: 6px;
  font-family: var(--font-serif);
  font-size: clamp(32px, 4.2vw, 54px);
  line-height: 1;
  color: var(--text-primary);
}

.roundtable-header p {
  max-width: 720px;
  margin-top: 9px;
  color: var(--text-secondary);
  line-height: 1.75;
}

.header-actions,
.panel-head,
.mode-bar,
.reply-options,
.tag-list,
.evidence-list {
  display: flex;
  align-items: center;
  gap: 8px;
}

.header-actions {
  flex: 0 0 auto;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.primary-btn,
.ghost-btn,
.secondary-btn,
.tiny-btn {
  border-radius: var(--radius-pill);
  cursor: pointer;
  font-weight: 800;
}

.primary-btn {
  border: 1px solid var(--brand);
  background: var(--brand);
  color: var(--text-on-dark);
  padding: 10px 16px;
}

.ghost-btn,
.secondary-btn,
.tiny-btn {
  border: 1px solid var(--border-default);
  background: rgba(255, 255, 255, 0.82);
  color: var(--text-secondary);
}

.ghost-btn,
.secondary-btn {
  padding: 10px 14px;
}

.demo-btn {
  border-color: rgba(191, 111, 63, 0.32);
  background: rgba(191, 111, 63, 0.1);
  color: #9b5735;
}

.tiny-btn {
  padding: 6px 10px;
  font-size: 12px;
}

.stage-strip {
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: 8px;
  margin-bottom: 16px;
}

.stage-step {
  min-width: 0;
  border: 1px solid var(--border-default);
  border-radius: var(--radius-card);
  background: rgba(255, 255, 255, 0.76);
  color: var(--text-secondary);
  padding: 10px;
  text-align: left;
  cursor: pointer;
}

.stage-step.active {
  border-color: rgba(32, 79, 103, 0.34);
  background: var(--brand-soft);
  color: var(--brand);
}

.stage-step.done {
  border-color: rgba(111, 127, 81, 0.32);
  background: rgba(111, 127, 81, 0.09);
}

.stage-step span,
.stage-step strong {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.stage-step span {
  font-size: 12px;
}

.stage-step strong {
  margin-top: 4px;
  color: var(--text-primary);
  font-size: 13px;
}

.studio-grid {
  display: grid;
  grid-template-columns: 280px minmax(0, 1fr) 320px;
  gap: 14px;
  align-items: start;
}

.user-panel,
.roundtable-main,
.output-panel {
  min-width: 0;
}

.user-panel,
.output-panel,
.roundtable-main {
  display: grid;
  gap: 12px;
}

.panel-head {
  justify-content: space-between;
}

.panel-head h2 {
  margin-top: 4px;
  font-family: var(--font-serif);
  font-size: 22px;
  line-height: 1.1;
}

.user-list,
.real-problem-form,
.seed-maker,
.profile-panel,
.mode-bar,
.life-model-panel,
.table-stage,
.conversation-panel,
.growth-panel,
.artifact-panel,
.session-panel {
  border: 1px solid var(--border-default);
  border-radius: var(--radius-card);
  background: rgba(255, 255, 255, 0.84);
  box-shadow: var(--shadow-sm);
}

.user-list {
  display: grid;
  gap: 8px;
  padding: 10px;
}

.user-row {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  gap: 10px;
  align-items: center;
  border: 1px solid transparent;
  border-radius: var(--radius-card);
  background: transparent;
  padding: 8px;
  text-align: left;
  cursor: pointer;
}

.user-row.active {
  border-color: rgba(32, 79, 103, 0.26);
  background: var(--brand-soft);
}

.avatar {
  width: 34px;
  height: 34px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: #204f67;
  color: #fff;
  font-weight: 900;
}

.avatar.large {
  width: 48px;
  height: 48px;
  font-size: 18px;
}

.user-row strong,
.profile-top strong {
  display: block;
  color: var(--text-primary);
  font-size: 14px;
}

.user-row small,
.profile-top small {
  display: block;
  margin-top: 2px;
  color: var(--text-tertiary);
  font-size: 12px;
  line-height: 1.35;
}

.real-problem-form,
.seed-maker {
  display: grid;
  gap: 10px;
  padding: 12px;
}

.form-title {
  display: grid;
  gap: 3px;
}

.form-title span {
  color: var(--text-muted);
  font-size: 11px;
  font-weight: 900;
}

.form-title strong {
  color: var(--text-primary);
  font-size: 14px;
}

.form-grid,
.model-select-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
}

.seed-maker label,
.real-problem-form label,
.model-select-grid label {
  display: grid;
  gap: 5px;
  color: var(--text-muted);
  font-size: 12px;
}

.seed-maker select,
.seed-maker textarea,
.real-problem-form select,
.real-problem-form textarea,
.real-problem-form input,
.model-select-grid select {
  width: 100%;
  border: 1px solid var(--border-default);
  border-radius: var(--radius-card);
  background: #fff;
  color: var(--text-primary);
  padding: 9px 10px;
  font: inherit;
  outline: none;
}

.seed-maker textarea,
.real-problem-form textarea {
  resize: vertical;
}

.real-problem-form small {
  color: var(--text-tertiary);
  font-size: 11px;
  line-height: 1.5;
}

.secondary-btn {
  width: 100%;
}

.profile-panel,
.growth-panel,
.artifact-panel,
.conversation-panel {
  padding: 14px;
}

.profile-top {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  gap: 10px;
  align-items: center;
}

.profile-panel p {
  margin-top: 10px;
  color: var(--text-secondary);
  line-height: 1.65;
}

.tag-list,
.evidence-list {
  flex-wrap: wrap;
  margin-top: 10px;
}

.tag-list span,
.evidence-list span {
  border-radius: var(--radius-pill);
  background: rgba(32, 79, 103, 0.08);
  color: var(--brand);
  padding: 5px 9px;
  font-size: 12px;
}

.mode-bar {
  flex-wrap: wrap;
  padding: 10px;
}

.mode-btn {
  flex: 1 1 140px;
  min-width: 0;
  border: 1px solid var(--border-default);
  border-radius: var(--radius-card);
  background: #fff;
  color: var(--text-secondary);
  padding: 9px 10px;
  text-align: left;
  cursor: pointer;
}

.mode-btn.active {
  border-color: rgba(32, 79, 103, 0.32);
  background: var(--brand-soft);
  color: var(--brand);
}

.mode-btn strong,
.mode-btn span {
  display: block;
}

.mode-btn span {
  margin-top: 3px;
  font-size: 12px;
}

.life-model-panel {
  display: grid;
  gap: 10px;
  padding: 14px;
}

.status-pill.safety {
  background: rgba(111, 127, 81, 0.12);
  color: #59703f;
}

.model-select-grid {
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) auto;
  align-items: end;
}

.model-apply {
  min-height: 37px;
}

.model-hypothesis {
  border-radius: var(--radius-card);
  background: rgba(32, 79, 103, 0.06);
  padding: 12px;
}

.model-hypothesis strong {
  color: var(--text-primary);
  line-height: 1.35;
}

.model-hypothesis p {
  margin-top: 7px;
  color: var(--text-secondary);
  font-size: 13px;
  line-height: 1.65;
}

.model-tags,
.mini-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 7px;
}

.model-tags {
  margin-top: 10px;
}

.model-tags span {
  border-radius: var(--radius-pill);
  background: #fff;
  color: var(--brand);
  padding: 5px 8px;
  font-size: 12px;
  font-weight: 800;
}

.table-stage {
  position: relative;
  display: grid;
  grid-template-columns: minmax(0, 1fr) 230px;
  gap: 12px;
  min-height: 390px;
  padding: 14px;
}

.round-table {
  position: relative;
  min-height: 360px;
  border-radius: 28px;
  background:
    radial-gradient(ellipse at center, rgba(255, 255, 255, 0.98) 0 26%, rgba(218, 226, 224, 0.76) 27% 36%, transparent 37%),
    radial-gradient(ellipse at center, rgba(32, 79, 103, 0.1), rgba(32, 79, 103, 0.02) 55%, transparent 72%);
}

.problem-card {
  position: absolute;
  left: 50%;
  top: 50%;
  width: min(310px, 58%);
  min-height: 142px;
  transform: translate(-50%, -50%);
  border: 1px solid rgba(32, 79, 103, 0.2);
  border-radius: var(--radius-card);
  background: rgba(255, 255, 255, 0.94);
  box-shadow: var(--shadow-md);
  padding: 18px;
  text-align: center;
}

.problem-card span {
  color: var(--text-muted);
  font-size: 12px;
}

.problem-card strong {
  display: block;
  margin-top: 5px;
  color: var(--text-primary);
  font-size: 18px;
}

.problem-card p {
  margin-top: 8px;
  color: var(--text-secondary);
  font-size: 13px;
  line-height: 1.55;
}

.agent-seat {
  position: absolute;
  width: 116px;
  min-height: 68px;
  border: 1px solid rgba(32, 79, 103, 0.16);
  border-radius: var(--radius-card);
  background: rgba(255, 255, 255, 0.9);
  color: var(--text-secondary);
  padding: 10px;
  text-align: center;
  cursor: pointer;
  box-shadow: var(--shadow-sm);
}

.agent-seat.active {
  border-color: color-mix(in srgb, var(--agent-color), white 35%);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--agent-color), transparent 82%);
}

.agent-seat span {
  display: inline-flex;
  min-width: 32px;
  justify-content: center;
  border-radius: var(--radius-pill);
  background: var(--agent-color);
  color: #fff;
  padding: 3px 7px;
  font-size: 11px;
  font-weight: 900;
}

.agent-seat strong {
  display: block;
  margin-top: 6px;
  color: var(--text-primary);
  font-size: 12px;
}

.agent-seat.top {
  left: 50%;
  top: 0;
  transform: translateX(-50%);
}

.agent-seat.right-top {
  right: 4%;
  top: 22%;
}

.agent-seat.right-bottom {
  right: 12%;
  bottom: 5%;
}

.agent-seat.left-bottom {
  left: 12%;
  bottom: 5%;
}

.agent-seat.left-top {
  left: 4%;
  top: 22%;
}

.agent-brief {
  border-left: 1px solid var(--border-default);
  padding-left: 12px;
  align-self: stretch;
}

.agent-brief span,
.artifact-block span {
  color: var(--text-muted);
  font-size: 12px;
}

.agent-brief strong,
.artifact-block strong {
  display: block;
  margin-top: 6px;
  color: var(--text-primary);
  line-height: 1.35;
}

.agent-brief p {
  margin-top: 10px;
  color: var(--text-secondary);
  line-height: 1.65;
  font-size: 13px;
}

.status-pill {
  border-radius: var(--radius-pill);
  background: rgba(191, 111, 63, 0.1);
  color: #9d5f39;
  padding: 5px 9px;
  font-size: 12px;
  font-weight: 800;
}

.message-list {
  display: grid;
  gap: 9px;
  margin-top: 12px;
}

.message-row {
  display: grid;
  grid-template-columns: 86px minmax(0, 1fr);
  gap: 10px;
  align-items: start;
  border-radius: var(--radius-card);
  background: rgba(32, 79, 103, 0.06);
  padding: 10px;
}

.message-row.user {
  background: rgba(191, 111, 63, 0.08);
}

.message-role {
  color: var(--brand);
  font-size: 12px;
  font-weight: 900;
}

.arch-pairings { margin-bottom: 1rem; }
.pairing-list { display: flex; flex-direction: column; gap: 0.6rem; }
.pairing-card { border: 1px solid var(--border-default); border-radius: 10px; padding: 0.7rem 0.9rem; background: #fff; }
.pairing-card-head { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 0.4rem; }
.pairing-card-head strong { font-size: 0.88rem; }
.pairing-card-head small { font-size: 0.72rem; color: var(--text-tertiary); }
.pairing-participants { display: flex; gap: 0.4rem; flex-wrap: wrap; margin-bottom: 0.4rem; }
.pt-badge { font-size: 0.68rem; padding: 0.1rem 0.5rem; border-radius: 999px; background: #f0ebe3; color: #8a5a44; }
.pt-badge.thinker { background: #e3edf0; color: #204f67; }
.pairing-question { font-size: 0.73rem; color: var(--text-secondary); margin: 0; line-height: 1.45; }

.message-row p {
  margin: 0;
  color: var(--text-secondary);
  line-height: 1.65;
  font-size: 13px;
}

.reply-options {
  flex-wrap: wrap;
  margin-top: 12px;
}

.reply-options button {
  border: 1px solid var(--border-default);
  border-radius: var(--radius-pill);
  background: #fff;
  color: var(--text-secondary);
  padding: 7px 10px;
  font-size: 12px;
  cursor: pointer;
}

.growth-list {
  display: grid;
  gap: 10px;
  margin-top: 12px;
}

.growth-row {
  display: grid;
  grid-template-columns: 48px minmax(0, 1fr) 34px;
  gap: 8px;
  align-items: center;
}

.growth-row span {
  color: var(--text-secondary);
  font-size: 12px;
}

.growth-row strong {
  color: var(--text-primary);
  font-size: 12px;
  text-align: right;
}

.meter {
  height: 8px;
  overflow: hidden;
  border-radius: var(--radius-pill);
  background: rgba(32, 79, 103, 0.1);
}

.meter i {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, #bf6f3f, #204f67);
}

.timeline {
  display: grid;
  gap: 7px;
  margin-top: 12px;
}

.timeline article {
  border-left: 2px solid rgba(32, 79, 103, 0.22);
  padding-left: 9px;
  color: var(--text-secondary);
  font-size: 12px;
  line-height: 1.55;
}

.artifact-block {
  margin-top: 12px;
  border-radius: var(--radius-card);
  background: rgba(32, 79, 103, 0.07);
  padding: 12px;
}

.slide-list {
  display: grid;
  gap: 8px;
  margin: 12px 0 0;
  padding-left: 20px;
  color: var(--text-secondary);
  line-height: 1.55;
  font-size: 13px;
}

.session-panel {
  padding: 14px;
}

.session-notice {
  border-radius: var(--radius-card);
  background: rgba(111, 127, 81, 0.1);
  color: #59703f;
  padding: 9px 10px;
  font-size: 12px;
  line-height: 1.5;
}

.session-list {
  display: grid;
  gap: 8px;
  margin-top: 10px;
}

.session-list article {
  display: grid;
  gap: 4px;
  border-top: 1px solid var(--border-default);
  padding-top: 9px;
}

.session-list article:first-child {
  border-top: 0;
  padding-top: 0;
}

.session-list span,
.session-list small,
.session-list p {
  color: var(--text-tertiary);
  font-size: 12px;
  line-height: 1.45;
}

.session-list strong {
  color: var(--text-primary);
  font-size: 13px;
  line-height: 1.45;
}

.session-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.restore-btn {
  width: fit-content;
  border: 1px solid rgba(32, 79, 103, 0.18);
  border-radius: var(--radius-pill);
  background: rgba(32, 79, 103, 0.07);
  color: var(--brand);
  padding: 5px 9px;
  font-size: 12px;
  font-weight: 900;
  cursor: pointer;
}

.restore-btn.play {
  border-color: rgba(191, 111, 63, 0.22);
  background: rgba(191, 111, 63, 0.08);
  color: #9b5735;
}

.primary-btn:disabled,
.ghost-btn:disabled,
.secondary-btn:disabled,
.restore-btn:disabled {
  cursor: not-allowed;
  opacity: 0.55;
}

@media (max-width: 1220px) {
  .studio-grid {
    grid-template-columns: 260px minmax(0, 1fr);
  }

  .output-panel {
    grid-column: 1 / -1;
    grid-template-columns: 1fr 1fr;
  }
}

@media (max-width: 860px) {
  .roundtable-shell {
    width: calc(100% - 24px);
  }

  .roundtable-header {
    align-items: flex-start;
    flex-direction: column;
  }

  .stage-strip,
  .studio-grid,
  .output-panel,
  .model-select-grid,
  .form-grid {
    grid-template-columns: 1fr;
  }

  .table-stage {
    grid-template-columns: 1fr;
  }

  .agent-brief {
    border-left: 0;
    border-top: 1px solid var(--border-default);
    padding: 12px 0 0;
  }
}

@media (max-width: 640px) {
  .round-table {
    min-height: 470px;
  }

  .problem-card {
    width: min(280px, 78%);
  }

  .agent-seat {
    width: 104px;
  }

  .agent-seat.right-top,
  .agent-seat.right-bottom {
    right: 0;
  }

  .agent-seat.left-top,
  .agent-seat.left-bottom {
    left: 0;
  }

  .message-row {
    grid-template-columns: 1fr;
  }
}
</style>
