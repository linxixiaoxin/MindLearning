<template>
  <section class="scene-hub">
    <div class="scene-scroll">
      <div class="scene-shell">

        <!-- LAYER 1: Intake Hero -->
        <section class="intake-hero">
          <div class="hero-copy">
            <div class="tool-kicker">认知地图入口</div>
            <h1>你现在卡在哪？</h1>
            <p>不用先想清楚。把你正在烦的事写下来，帮你拆成看得清、选得动、做得出的下一步。</p>
          </div>
          <div class="intake-box">
            <textarea
              v-model="freeInput"
              rows="2"
              placeholder="说说你最近在烦恼什么… 比如：我和伴侣总是因为小事吵架、我想换工作但不知道做什么、我觉得很累但说不清为什么"
              @keydown.enter.exact="submitFreeInput"
            ></textarea>
            <button
              class="primary-btn intake-btn"
              :disabled="!freeInput.trim() || aiBusy"
              @click="submitFreeInput"
            >
              <span v-if="aiBusy" class="btn-loading">正在理解…</span>
              <span v-else>开始理清</span>
            </button>
          </div>
          <button class="skip-link" @click="scrollToCards">
            不知道怎么描述？试试卡片帮我找方向 ↓
          </button>
        </section>

        <!-- AI Result Banner -->
        <section v-if="aiResult" class="ai-result-banner">
          <div class="result-card">
            <div class="result-left">
              <span class="result-kicker">根据你的描述</span>
              <strong>{{ aiResult.title }}</strong>
              <p>{{ aiResult.description }}</p>
            </div>
            <button class="primary-btn" @click="applyAiResult">进入</button>
            <button class="ghost-btn" @click="aiResult = null">换一个方式</button>
          </div>
        </section>

        <!-- LAYER 2: Card Diagnostic -->
        <section ref="cardSectionRef" class="card-diagnostic">
          <div class="section-head">
            <div>
              <div class="tool-kicker">意象卡片</div>
              <h2>选一张最像你此刻状态的卡片</h2>
            </div>
            <p>不用分析，不用判断——哪张图让你觉得「是我」？</p>
          </div>

          <div class="card-grid">
            <button
              v-for="card in diagnosticCards"
              :key="card.id"
              class="metaphor-card"
              :class="{
                selected: selectedCard?.id === card.id,
                dimmed: selectedCard && selectedCard.id !== card.id,
              }"
              @click="selectCard(card)"
            >
              <span class="card-icon">{{ card.icon }}</span>
              <strong>{{ card.title }}</strong>
              <small>"{{ card.userLanguage }}"</small>
            </button>
          </div>

          <Transition name="slide-fade">
            <div
              v-if="selectedCard && !diagnosticResult"
              class="progressive-questions"
            >
              <div
                v-for="(q, qi) in selectedCard.questions"
                :key="qi"
                class="question-step"
              >
                <p class="question-text">{{ q.text }}</p>
                <div class="choice-row">
                  <button
                    v-for="opt in q.options"
                    :key="opt.value"
                    class="choice-chip"
                    :class="{ active: diagnosticAnswers[qi] === opt.value }"
                    @click="answerQuestion(qi, opt)"
                  >
                    {{ opt.label }}
                  </button>
                </div>
              </div>
              <button
                v-if="allDiagnosticQuestionsAnswered"
                class="primary-btn resolve-btn"
                @click="resolveDiagnostic"
              >
                看看结果
              </button>
            </div>
          </Transition>

          <Transition name="slide-fade">
            <div v-if="diagnosticResult" class="diagnostic-result">
              <div class="result-card">
                <div class="result-left">
                  <span class="result-kicker">根据你的选择</span>
                  <strong>{{ diagnosticResult.title }}</strong>
                  <p>{{ diagnosticResult.description }}</p>
                </div>
                <button class="primary-btn" @click="applyDiagnosticResult">进入</button>
                <button class="ghost-btn" @click="resetDiagnostic">重新选</button>
              </div>
            </div>
          </Transition>
        </section>

        <!-- LAYER 3: Four-Entry Portals -->
        <section class="portal-section">
          <div class="section-head">
            <div>
              <div class="tool-kicker">认知地图入口</div>
              <h2>或者，直接进入你需要的方向</h2>
            </div>
          </div>

          <div class="portal-grid">
            <button
              v-for="entry in portalEntries"
              :key="entry.id"
              class="portal-card"
              @click="goPortalRoute(entry.route)"
            >
              <span class="portal-icon">{{ entry.icon }}</span>
              <div class="portal-copy">
                <strong>{{ entry.title }}</strong>
                <small>{{ entry.subtitle }}</small>
              </div>
              <ul class="portal-hooks">
                <li v-for="hook in entry.hookQuestions" :key="hook">{{ hook }}</li>
              </ul>
            </button>
          </div>
        </section>

        <!-- Continue bar (existing) -->
        <section v-if="lastVisit" class="continue-bar" aria-label="继续上次">
          <div class="continue-card">
            <div class="continue-left">
              <div class="continue-kicker">继续上次</div>
              <strong>{{ lastVisit.label }}</strong>
              <small>{{ lastVisit.timeAgo }}</small>
            </div>
            <button class="primary-btn" @click="resumeLastVisit">从这里继续</button>
          </div>
        </section>

        <!-- LAYER 4: Existing Scene Picker (demoted) -->
        <div class="scene-section-label">
          <span>或者，直接选一个像你的处境</span>
          <p>每种处境都拆成了维度、卡点、走法和最小行动。</p>
        </div>

        <section class="situation-layout">
          <aside class="scene-picker" aria-label="选择当前处境">
            <button
              v-for="scene in scenes"
              :key="scene.id"
              class="scene-choice"
              :class="{ active: scene.id === selectedScene.id }"
              type="button"
              @click="selectScene(scene.id)"
            >
              <span>{{ scene.categoryLabel }}</span>
              <strong>{{ scene.entryTitle }}</strong>
              <small>"{{ scene.userLanguage }}"</small>
            </button>
          </aside>

          <main class="situation-main">
            <section class="overview-grid">
              <article class="situation-card">
                <div class="tool-kicker">{{ selectedScene.stage }}</div>
                <h2>{{ selectedScene.entryTitle }}</h2>
                <p class="reassurance">{{ selectedScene.reassurance }}</p>

                <blockquote>"{{ selectedScene.userLanguage }}"</blockquote>

                <div class="context-grid">
                  <div>
                    <span>核心要处理</span>
                    <strong>{{ selectedScene.coreNeed }}</strong>
                  </div>
                  <div>
                    <span>边界</span>
                    <strong>{{ selectedScene.boundary }}</strong>
                  </div>
                </div>
              </article>

              <aside class="next-card">
                <span>当前最可能的卡点</span>
                <h3>{{ primaryProblem.title }}</h3>
                <p>{{ primaryProblem.userSituation }}</p>
                <div class="output-box">
                  <small>进去后会得到</small>
                  <strong>{{ primaryProblem.output }}</strong>
                </div>
                <button class="primary-btn" type="button" @click="openProblem(primaryProblem)">
                  进入卡点工作台
                </button>
              </aside>
            </section>

            <section class="map-panel">
              <div class="section-head">
                <div>
                  <div class="tool-kicker">看清当前处境</div>
                  <h3>这件事要拆哪几面</h3>
                </div>
                <p>点击一个维度，只高亮一条从"误判 -> 卡点 -> 走法 -> 行动"的链路。</p>
              </div>

              <div class="situation-map">
                <div class="dimension-board" aria-label="关键维度">
                  <button
                    v-for="(dimension, index) in selectedScene.mapDimensions"
                    :key="dimension.label"
                    class="dimension-chip"
                    :class="{ active: index === activeDimensionIndex }"
                    type="button"
                    @click="focusDimension(index)"
                  >
                    <span>{{ dimension.label }}</span>
                    <strong>{{ dimension.userLabel || dimension.question }}</strong>
                  </button>
                </div>

                <div class="readable-chain" aria-label="当前关系链路">
                  <article class="chain-card origin">
                    <span>我的处境</span>
                    <strong>{{ selectedScene.shortTitle }}</strong>
                    <p>{{ selectedScene.userLanguage }}</p>
                  </article>

                  <div class="chain-arrow">拆解</div>

                  <article class="chain-card dimension">
                    <span>当前关注点</span>
                    <strong>{{ activeDimension.label }}</strong>
                    <p>{{ activeDimension.question }}</p>
                  </article>

                  <div class="chain-arrow warning">容易误判</div>

                  <article class="chain-card risk">
                    <span>盲区</span>
                    <strong>{{ activeDimension.risk }}</strong>
                  </article>

                  <div class="chain-arrow problem">转成卡点</div>

                  <article class="chain-card problem">
                    <span>具体卡点</span>
                    <strong>{{ focusedProblem.title }}</strong>
                    <p>{{ focusedProblem.output }}</p>
                  </article>

                  <div class="chain-arrow path">如果这样走</div>

                  <article class="chain-card path">
                    <span>三种走法之一</span>
                    <strong>{{ focusedPath.userLabel || focusedPath.label }}</strong>
                    <p>{{ focusedPath.benefit }}</p>
                  </article>

                  <div class="chain-arrow action">今天先做</div>

                  <article class="chain-card action">
                    <span>一个小动作</span>
                    <strong>{{ focusedAction }}</strong>
                  </article>
                </div>
              </div>

              <div class="map-legend" aria-label="图例">
                <span><b></b>圆角卡 = 当前处境</span>
                <span><b></b>橙色 = 容易误判</span>
                <span><b></b>紫色 = 具体卡点</span>
                <span><b></b>绿色 = 今天先做</span>
              </div>
            </section>

            <section class="detail-grid">
              <article class="scene-panel">
                <div class="panel-head">
                  <div>
                    <div class="tool-kicker">关键维度</div>
                    <h3>每一面都问一个具体问题</h3>
                  </div>
                </div>

                <div class="dimension-list">
                  <button
                    v-for="(dimension, index) in selectedScene.mapDimensions"
                    :key="dimension.label"
                    class="dimension-row"
                    :class="{ active: index === activeDimensionIndex }"
                    type="button"
                    @click="focusDimension(index)"
                  >
                    <span>{{ dimension.label }}</span>
                    <strong>{{ dimension.question }}</strong>
                    <small>{{ dimension.risk }}</small>
                  </button>
                </div>
              </article>

              <article class="scene-panel">
                <div class="panel-head">
                  <div>
                    <div class="tool-kicker">具体卡点</div>
                    <h3>你现在最像卡在哪个问题</h3>
                  </div>
                </div>

                <div class="problem-list">
                  <article
                    v-for="problem in relatedProblems"
                    :key="problem.id"
                    class="problem-card"
                    :class="{ active: problem.id === focusedProblem.id }"
                  >
                    <span>{{ problem.status === 'next' ? '建设中' : '可进入' }}</span>
                    <strong>{{ problem.title }}</strong>
                    <p>{{ problem.userSituation }}</p>
                    <small>{{ problem.output }}</small>
                    <button
                      class="ghost-btn"
                      type="button"
                      :disabled="problem.status === 'next'"
                      @click="openProblem(problem)"
                    >
                      {{ problem.status === 'next' ? '暂未开放' : '进入卡点' }}
                    </button>
                  </article>
                </div>
              </article>
            </section>

            <section class="path-panel">
              <div class="section-head">
                <div>
                  <div class="tool-kicker">选择推演</div>
                  <h3>如果这样走，会发生什么</h3>
                </div>
                <p>不是替你做决定，而是把几条常见走法的收益、代价和复盘问题摆开。</p>
              </div>

              <div class="path-grid">
                <article
                  v-for="path in selectedScene.simulationPaths"
                  :key="path.label"
                  class="path-card"
                  :class="{ active: path.label === focusedPath.label }"
                  @click="focusPath(path.label)"
                >
                  <span>{{ path.label }}</span>
                  <h4>{{ path.userLabel || path.label }}</h4>
                  <div>
                    <strong>可能收益</strong>
                    <p>{{ path.benefit || path.effect }}</p>
                  </div>
                  <div>
                    <strong>可能代价</strong>
                    <p>{{ path.cost }}</p>
                  </div>
                  <small>{{ path.review }}</small>
                </article>
              </div>
            </section>

            <section class="action-resource-grid">
              <article class="action-card">
                <div class="tool-kicker">今天先做一步</div>
                <h3>这周不解决整个人生，只做一个可见动作</h3>
                <ol>
                  <li
                    v-for="(action, index) in selectedScene.minimumActions"
                    :key="action"
                    :class="{ active: action === focusedAction || activeActionIndexes.includes(index) }"
                  >
                    {{ action }}
                  </li>
                </ol>
              </article>

              <article class="resource-card">
                <div class="tool-kicker">继续深入</div>
                <h3>支撑材料放在后面</h3>
                <div class="resource-actions">
                  <button class="ghost-btn" type="button" @click="$emit('open-learning-paths', selectedScene.learningPathId)">
                    练习路线
                  </button>
                  <button class="ghost-btn" type="button" @click="$emit('open-capability-paths', selectedScene.capabilityRoleId)">
                    能力路径
                  </button>
                  <button class="ghost-btn" type="button" @click="$emit('open-thought-partner')">
                    思想伙伴
                  </button>
                </div>
                <div class="book-list">
                  <button
                    v-for="book in selectedScene.evidenceBooks"
                    :key="book.slug"
                    class="book-row"
                    type="button"
                    @click="$emit('open-book', book.slug)"
                  >
                    <strong>{{ book.title }}</strong>
                    <small>{{ book.reason }}</small>
                  </button>
                </div>

                <details class="content-angle">
                  <summary>内容生产视角</summary>
                  <div>
                    <span v-for="angle in selectedScene.contentAngles" :key="angle">{{ angle }}</span>
                  </div>
                </details>
              </article>
            </section>

            <section class="more-scenes">
              <div class="tool-kicker">更多场景</div>
              <h3>还有这些人生场景可以对照</h3>
              <div class="scene-strip">
                <button
                  v-for="scene in moreSystemScenes"
                  :key="scene.id"
                  class="scene-chip"
                  type="button"
                >
                  <strong>{{ scene.title }}</strong>
                  <small>{{ scene.oneLiner }}</small>
                  <span class="domain-tag">{{ scene.domain }}</span>
                </button>
              </div>
            </section>
          </main>
        </section>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed, nextTick, onMounted, ref } from 'vue'
import { scenes as systemScenes } from '../data/sceneData.js'
import {
  defaultLifeSceneId,
  diagnosticCards,
  getLifeScene,
  lifeScenes,
  portalEntries,
  resolveLifeSceneId,
} from '../data/lifeSceneData.js'

const LAST_VISIT_KEY = 'redbook:last-visit'
const AI_SETTINGS_KEY = 'book-kb-multi-thought-partner-ai-settings'

const viewLabels = {
  sceneHub: '处境地图',
  library: '书库',
  home: '阅读地图',
  graph: '知识图谱',
  thoughtPartner: '思想伙伴',
  contentOps: '工作台',
  problemLab: '卡点工作台',
  capabilityPaths: '能力路径',
  learningPaths: '学习路线',
  roundtable: '圆桌',
  eventLens: '社会事件',
  spaceBrowser: '书籍地图',
  reader: '阅读中',
}

// ── Last visit ──
const lastVisit = ref(null)

function loadLastVisit() {
  try {
    const raw = localStorage.getItem(LAST_VISIT_KEY)
    if (!raw) return
    const data = JSON.parse(raw)
    if (!data.view || data.view === 'sceneHub') return
    const elapsed = Date.now() - (data.at || 0)
    const minutes = Math.floor(elapsed / 60000)
    const hours = Math.floor(elapsed / 3600000)
    const days = Math.floor(elapsed / 86400000)
    lastVisit.value = {
      ...data,
      label: viewLabels[data.view] || data.view,
      timeAgo: days > 1 ? `${days} 天前` : hours > 1 ? `${hours} 小时前` : minutes > 1 ? `${minutes} 分钟前` : '刚刚',
    }
  } catch { /* ignore */ }
}

function resumeLastVisit() {
  if (!lastVisit.value) return
  const { view, slug } = lastVisit.value
  const url = view === 'reader' && slug
    ? `/books/${encodeURIComponent(slug)}`
    : view === 'problemLab'
    ? '/tools/problem-lab'
    : view === 'home' && slug
    ? `/books/${encodeURIComponent(slug)}`
    : view === 'library'
    ? '/books'
    : '/'
  window.location.href = url
}

onMounted(() => { loadLastVisit() })

// ── Emits ──
const emit = defineEmits([
  'open-library',
  'open-problem-lab',
  'open-capability-paths',
  'open-thought-partner',
  'open-content-ops',
  'open-learning-paths',
  'open-book',
  'open-roundtable',
  'open-mindset-trap-diagnostic',
])

// ── Existing scene data ──
const steps = [
  { id: 'scene', index: '1', label: '选处境' },
  { id: 'dimension', index: '2', label: '看关键维度' },
  { id: 'problem', index: '3', label: '找具体卡点' },
  { id: 'path', index: '4', label: '比较走法' },
  { id: 'action', index: '5', label: '今天先做一步' },
]

const scenes = lifeScenes
const selectedSceneId = ref(defaultLifeSceneId)
const activeDimensionIndex = ref(0)
const focusedProblemId = ref(null)
const focusedPathLabel = ref(null)
const activeStepId = ref('scene')

const selectedScene = computed(() => getLifeScene(selectedSceneId.value))
const activeDimension = computed(() => selectedScene.value.mapDimensions[activeDimensionIndex.value] || selectedScene.value.mapDimensions[0])
const primaryProblem = computed(() => getProblem(selectedScene.value.primaryProblemCaseId) || selectedScene.value.problemCases[0])
const relatedProblems = computed(() => {
  const problemIds = activeDimension.value?.relatedProblemIds || [selectedScene.value.primaryProblemCaseId]
  return problemIds.map((id) => getProblem(id)).filter(Boolean)
})
const focusedProblem = computed(() => {
  const direct = getProblem(focusedProblemId.value)
  if (direct) return direct
  return relatedProblems.value[0] || primaryProblem.value
})
const relatedPaths = computed(() => {
  const labels = [
    ...(activeDimension.value?.relatedPathLabels || []),
    ...(focusedProblem.value?.recommendedPathLabels || []),
  ]
  const uniqueLabels = Array.from(new Set(labels))
  const paths = uniqueLabels.map((label) => getPath(label)).filter(Boolean)
  return paths.length > 0 ? paths : selectedScene.value.simulationPaths
})
const focusedPath = computed(() => {
  const direct = getPath(focusedPathLabel.value)
  if (direct) return direct
  return relatedPaths.value[0] || selectedScene.value.simulationPaths[0]
})
const activeActionIndexes = computed(() => activeDimension.value?.relatedActionIndexes || [0])
const focusedAction = computed(() => {
  const index = activeActionIndexes.value[0] ?? 0
  return selectedScene.value.minimumActions[index] || selectedScene.value.minimumActions[0]
})

const moreSystemScenes = computed(() => systemScenes.slice(0, 10))

initializeFocus()

function selectScene(sceneId) {
  selectedSceneId.value = resolveLifeSceneId(sceneId)
  activeDimensionIndex.value = 0
  activeStepId.value = 'scene'
  initializeFocus()

  nextTick(() => {
    document.querySelector('.situation-layout')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  })
}

function focusDimension(index) {
  activeDimensionIndex.value = index
  activeStepId.value = 'dimension'
  const dimension = selectedScene.value.mapDimensions[index]
  focusedProblemId.value = dimension.relatedProblemIds?.[0] || selectedScene.value.primaryProblemCaseId
  focusedPathLabel.value = dimension.relatedPathLabels?.[0] || focusedProblem.value?.recommendedPathLabels?.[0] || null
}

function focusPath(pathLabel) {
  focusedPathLabel.value = pathLabel
  activeStepId.value = 'path'
}

function openProblem(problem) {
  if (!problem || problem.status === 'next') return
  activeStepId.value = 'problem'
  emit('open-problem-lab', problem.id)
}

function initializeFocus() {
  const scene = selectedScene.value
  const firstDimension = scene.mapDimensions[0]
  focusedProblemId.value = firstDimension?.relatedProblemIds?.[0] || scene.primaryProblemCaseId
  focusedPathLabel.value = firstDimension?.relatedPathLabels?.[0] || null
}

function getProblem(problemId) {
  if (!problemId) return null
  return selectedScene.value.problemCases.find((problem) => problem.id === problemId) || null
}

function getPath(pathLabel) {
  if (!pathLabel) return null
  return selectedScene.value.simulationPaths.find((path) => path.label === pathLabel) || null
}

// ── LAYER 1: Free-text AI intake ──
const freeInput = ref('')
const aiBusy = ref(false)
const aiResult = ref(null)

function loadAiSettings() {
  try {
    const raw = localStorage.getItem(AI_SETTINGS_KEY)
    if (!raw) return null
    return JSON.parse(raw)
  } catch {
    return null
  }
}

function buildRoutingPrompt(text) {
  return '你是一个问题路由助手。用户描述了他们的困扰，你需要判断最适合引导他们到哪个场景或工具。\n' +
    '\n' +
    '可用的场景：\n' +
    '- career-transition: 职业选择与转型困惑\n' +
    '- exam-school-selection: 升学与选校困惑\n' +
    '- relationship-communication: 关系沟通冲突\n' +
    '\n' +
    '可用的工具：\n' +
    '- thought-partner (思想伙伴): 需要被倾听、理清思路、换视角看问题\n' +
    '- mindset-trap-diagnostic (心智陷阱诊断): 知道问题但动不了、反复陷入同一模式\n' +
    '- problem-lab (卡点工作台): 有具体问题需要拆解\n' +
    '- capability-paths (能力路径): 想了解自己的能力和发展方向\n' +
    '- roundtable (圆桌): 需要多视角讨论\n' +
    '- library (书库): 想通过阅读找答案\n' +
    '\n' +
    '用户描述：' + JSON.stringify(text) + '\n' +
    '\n' +
    '请只返回一个 JSON 对象（不要 markdown 代码块），格式：\n' +
    '{"routeType":"scene"|"tool"|"problem","routeId":"对应的id","title":"一句话推荐标题","description":"为什么推荐这个（50字以内）"}\n' +
    '\n' +
    '如果用户描述太模糊，routeType 用 "tool"，routeId 用 "thought-partner"。'
}

async function callAiParse(text) {
  const settings = loadAiSettings()
  if (!settings || !settings.apiKey) return null

  const presets = {
    deepseek: { baseUrl: 'https://api.deepseek.com', model: 'deepseek-chat' },
    kimi: { baseUrl: 'https://api.moonshot.ai/v1', model: 'kimi-k2.6' },
    openai: { baseUrl: 'https://api.openai.com/v1', model: 'gpt-4.1-mini' },
  }
  const provider = settings.provider || 'deepseek'
  const preset = presets[provider] || presets.deepseek

  try {
    const response = await fetch('/.netlify/functions/thought-partner-insight', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        mode: 'chat',
        message: buildRoutingPrompt(text),
        aiConfig: {
          useLocalAiConfig: true,
          provider: settings.provider || 'deepseek',
          apiKey: settings.apiKey,
          baseUrl: settings.baseUrl || preset.baseUrl,
          model: settings.model || preset.model,
        },
      }),
    })

    if (!response.ok) return null
    const data = await response.json()
    const reply = data.reply || ''
    const jsonMatch = reply.match(/\{[\s\S]*\}/)
    if (!jsonMatch) return null
    return JSON.parse(jsonMatch[0])
  } catch {
    return null
  }
}

function keywordMatch(text) {
  const t = text.toLowerCase()

  if (/职业|工作|换工作|转型|求职|岗位|简历|面试/.test(t)) {
    return { routeType: 'scene', routeId: 'career-transition', title: '职业选择与转型', description: '你想探索职业方向，可以从职业转型地图开始，看清岗位世界和能力差距。' }
  }
  if (/关系|吵架|冲突|伴侣|对象|朋友|沟通|说话|表达|指责|沉默/.test(t)) {
    return { routeType: 'scene', routeId: 'relationship-communication', title: '关系沟通地图', description: '你说的和关系沟通有关，可以先从拆解事实、情绪和需要开始。' }
  }
  if (/考试|升学|选校|专业|志愿|学校|学习/.test(t)) {
    return { routeType: 'scene', routeId: 'exam-school-selection', title: '升学与选校', description: '选学校和专业，可以先不急着找完美答案，而是把影响选择的几面拆开看。' }
  }
  if (/累|疲惫|空虚|没动力|无意义|迷茫|麻木/.test(t)) {
    return { routeType: 'tool', routeId: 'thought-partner', title: '思想伙伴', description: '你可能需要一个安全的对话空间，先理清「累」背后的真实感受和需要。' }
  }
  if (/动不了|卡住|困住|循环|重复|又来了|试过.*没用/.test(t)) {
    return { routeType: 'tool', routeId: 'mindset-trap-diagnostic', title: '心智陷阱诊断', description: '你可能陷入了一个看不见的判断习惯，做个诊断帮你识别它。' }
  }
  if (/选|决定|纠结|犹豫|两个|选项|怎么办/.test(t)) {
    return { routeType: 'tool', routeId: 'problem-lab', title: '卡点工作台', description: '面对选择时，先把选项、维度和风险摆开，比较会变得更清晰。' }
  }

  // Default: too vague, route to thought partner
  return { routeType: 'tool', routeId: 'thought-partner', title: '思想伙伴', description: '你说的我大概有感觉了，但还想更具体。先和思想伙伴聊聊，慢慢理清楚。' }
}

async function submitFreeInput() {
  const text = freeInput.value.trim()
  if (!text || aiBusy.value) return

  aiBusy.value = true
  aiResult.value = null

  // Try AI first, fall back to keyword match
  let result = await callAiParse(text)
  if (!result) {
    result = keywordMatch(text)
  }

  aiResult.value = result
  aiBusy.value = false
}

function applyAiResult() {
  if (!aiResult.value) return
  goRoute(aiResult.value)
}

function goRoute(route) {
  if (!route) return

  const { routeType, routeId } = route

  if (routeType === 'scene') {
    selectScene(routeId)
  } else if (routeType === 'problem') {
    const sceneId = route.scene || 'career-transition'
    selectScene(sceneId)
    nextTick(() => {
      emit('open-problem-lab', routeId)
    })
  } else if (routeType === 'tool') {
    const toolMap = {
      'thought-partner': () => emit('open-thought-partner'),
      'mindset-trap-diagnostic': () => emit('open-mindset-trap-diagnostic'),
      'problem-lab': () => emit('open-problem-lab', ''),
      'capability-paths': () => emit('open-capability-paths', ''),
      'roundtable': () => emit('open-roundtable'),
      'library': () => emit('open-library'),
      'content-ops': () => emit('open-content-ops'),
    }
    const handler = toolMap[routeId]
    if (handler) handler()
  }
}

// ── LAYER 2: Card diagnostic ──
const cardSectionRef = ref(null)
const selectedCard = ref(null)
const diagnosticAnswers = ref({})
const diagnosticResult = ref(null)

const allDiagnosticQuestionsAnswered = computed(() => {
  if (!selectedCard.value) return false
  return selectedCard.value.questions.every((_, i) => diagnosticAnswers.value[i] !== undefined)
})

function scrollToCards() {
  cardSectionRef.value?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

function selectCard(card) {
  selectedCard.value = card
  diagnosticAnswers.value = {}
  diagnosticResult.value = null
}

function answerQuestion(qi, opt) {
  diagnosticAnswers.value = { ...diagnosticAnswers.value, [qi]: opt.value }

  // Store the selected option's route for this question
  if (!diagnosticAnswers.value._routes) {
    diagnosticAnswers.value._routes = {}
  }
  diagnosticAnswers.value._routes = { ...diagnosticAnswers.value._routes, [qi]: opt.route }
}

function resolveDiagnostic() {
  if (!selectedCard.value || !allDiagnosticQuestionsAnswered.value) return

  // Use the route from the last question's answer (most specific)
  const lastQi = selectedCard.value.questions.length - 1
  const routes = diagnosticAnswers.value._routes || {}
  const route = routes[lastQi]

  if (!route) {
    diagnosticResult.value = {
      title: '去思想伙伴聊聊',
      description: '你的情况可能需要一个更开放的对话，让思想伙伴帮你慢慢理清。',
      route: { type: 'tool', id: 'thought-partner' },
    }
    return
  }

  diagnosticResult.value = {
    title: getRouteLabel(route),
    description: getRouteDescription(route),
    route,
  }
}

function applyDiagnosticResult() {
  if (!diagnosticResult.value?.route) return
  goRoute({
    routeType: diagnosticResult.value.route.type,
    routeId: diagnosticResult.value.route.id,
    scene: diagnosticResult.value.route.scene,
  })
}

function resetDiagnostic() {
  selectedCard.value = null
  diagnosticAnswers.value = {}
  diagnosticResult.value = null
}

function getRouteLabel(route) {
  const labels = {
    'career-transition': '去看看职业选择地图',
    'exam-school-selection': '去看看升学选校地图',
    'relationship-communication': '去看看关系沟通地图',
    'thought-partner': '和思想伙伴聊聊',
    'mindset-trap-diagnostic': '做个心智陷阱诊断',
    'problem-lab': '进入卡点工作台',
    'capability-paths': '探索能力路径',
    'roundtable': '进入圆桌讨论',
    'library': '浏览书库',
    'content-ops': '进入内容工作台',
  }
  return labels[route.id] || '去看看'
}

function getRouteDescription(route) {
  const descriptions = {
    'career-transition': '把目标岗位、能力差距和转型风险摆开看，不急着判断适不适合。',
    'exam-school-selection': '先把学校、专业、城市和你自己的适配度拆开比较。',
    'relationship-communication': '把事实、解释、情绪和需要分开，再决定下一句话怎么说。',
    'thought-partner': '有一个安全的对话空间，帮你换一个看问题的镜头。',
    'mindset-trap-diagnostic': '识别让你反复卡住的判断习惯，找到最小突破口。',
    'problem-lab': '把复杂问题拆成可比较的选项和可验证的下一步。',
    'capability-paths': '看清你的能力画像和发展方向。',
    'roundtable': '多个角色一起帮你从不同角度看清问题。',
    'library': '通过书籍的系统知识找到对应的方法和框架。',
    'content-ops': '把觉察变成可复用、可发布的卡片和流程。',
  }
  return descriptions[route.id] || '从这里开始，慢慢理清。'
}

// ── LAYER 3: Four-entry portal routing ──
function goPortalRoute(route) {
  goRoute({
    routeType: route.type,
    routeId: route.id,
    scene: route.scene,
  })
}
</script>

<style scoped>
/* ── Transitions ── */
.slide-fade-enter-active {
  transition: all 0.35s ease;
}
.slide-fade-leave-active {
  transition: all 0.25s ease;
}
.slide-fade-enter-from {
  opacity: 0;
  transform: translateY(-12px);
}
.slide-fade-leave-to {
  opacity: 0;
}

/* ── Continue bar ── */
.continue-bar {
  max-width: 1060px;
  margin: 0 auto 24px;
}

.continue-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  padding: 20px 24px;
  border-radius: var(--radius-panel);
  border: 1px solid rgba(32, 79, 103, 0.18);
  background: linear-gradient(135deg, rgba(32, 79, 103, 0.06) 0%, rgba(247, 245, 240, 0.94) 40%);
  box-shadow: var(--shadow-sm);
}

.continue-left {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.continue-kicker {
  font-size: 10px;
  letter-spacing: 0.16em;
  color: var(--accent);
  text-transform: uppercase;
}

.continue-left strong {
  font-family: var(--font-serif);
  font-size: 20px;
  color: var(--text-primary);
}

.continue-left small {
  color: var(--text-tertiary);
  font-size: 12px;
}

.continue-card .primary-btn {
  flex-shrink: 0;
  border: 1px solid transparent;
  background: var(--brand);
  color: var(--text-on-dark);
  border-radius: var(--radius-pill);
  padding: 11px 18px;
  font-size: 13px;
  cursor: pointer;
  transition: transform 0.16s ease;
}

.continue-card .primary-btn:hover {
  transform: translateY(-1px);
}

/* ── LAYER 1: Intake Hero ── */
.intake-hero {
  max-width: 780px;
  margin: 0 auto 28px;
  text-align: center;
  padding: 32px 20px 20px;
}

.intake-hero .hero-copy {
  margin-bottom: 20px;
}

.intake-hero .tool-kicker {
  font-size: 11px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--text-muted);
}

.intake-hero h1 {
  font-family: var(--font-serif);
  font-size: 36px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 8px 0 10px;
  line-height: 1.15;
}

.intake-hero p {
  color: var(--text-secondary);
  font-size: 16px;
  line-height: 1.6;
  max-width: 560px;
  margin: 0 auto;
}

.intake-box {
  display: flex;
  gap: 10px;
  max-width: 620px;
  margin: 0 auto;
  background: #fff;
  border: 1px solid rgba(32, 79, 103, 0.18);
  border-radius: var(--radius-panel);
  padding: 10px;
  box-shadow: 0 2px 12px rgba(32, 79, 103, 0.06);
}

.intake-box textarea {
  flex: 1;
  border: none;
  outline: none;
  resize: none;
  font-family: var(--font-sans);
  font-size: 15px;
  line-height: 1.55;
  padding: 10px 12px;
  color: var(--text-primary);
  background: transparent;
  min-height: 44px;
}

.intake-box textarea::placeholder {
  color: var(--text-muted);
}

.intake-btn {
  flex-shrink: 0;
  align-self: flex-end;
  border: 1px solid transparent;
  background: var(--brand);
  color: var(--text-on-dark);
  border-radius: var(--radius-pill);
  padding: 11px 22px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.16s ease, opacity 0.16s ease;
  white-space: nowrap;
}

.intake-btn:hover:not(:disabled) {
  transform: translateY(-1px);
}

.intake-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-loading {
  opacity: 0.8;
}

.skip-link {
  display: inline-block;
  margin-top: 14px;
  background: none;
  border: none;
  color: var(--text-muted);
  font-size: 13px;
  cursor: pointer;
  text-decoration: underline;
  text-underline-offset: 3px;
  transition: color 0.18s ease;
}

.skip-link:hover {
  color: var(--accent);
}

/* ── AI Result Banner ── */
.ai-result-banner {
  max-width: 780px;
  margin: 0 auto 28px;
}

.result-card {
  display: flex;
  align-items: center;
  gap: 18px;
  padding: 20px 24px;
  border-radius: var(--radius-panel);
  border: 1px solid rgba(32, 79, 103, 0.2);
  background: linear-gradient(135deg, rgba(32, 79, 103, 0.05), rgba(255, 255, 255, 0.92));
  box-shadow: var(--shadow-sm);
}

.result-left {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.result-kicker {
  font-size: 10px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--accent);
}

.result-left strong {
  font-family: var(--font-serif);
  font-size: 20px;
  color: var(--text-primary);
}

.result-left p {
  font-size: 14px;
  color: var(--text-secondary);
  line-height: 1.5;
  margin: 0;
}

.result-card .primary-btn {
  flex-shrink: 0;
  border: 1px solid transparent;
  background: var(--brand);
  color: var(--text-on-dark);
  border-radius: var(--radius-pill);
  padding: 11px 20px;
  font-size: 14px;
  cursor: pointer;
  transition: transform 0.16s ease;
}

.result-card .primary-btn:hover {
  transform: translateY(-1px);
}

.result-card .ghost-btn {
  flex-shrink: 0;
  background: none;
  border: 1px solid var(--border-default);
  border-radius: var(--radius-pill);
  padding: 9px 16px;
  font-size: 13px;
  color: var(--text-secondary);
  cursor: pointer;
  transition: border-color 0.18s ease;
}

.result-card .ghost-btn:hover {
  border-color: var(--brand);
}

/* ── LAYER 2: Card Diagnostic ── */
.card-diagnostic {
  max-width: 1060px;
  margin: 0 auto 32px;
  border: 1px solid rgba(32, 79, 103, 0.14);
  border-radius: var(--radius-card);
  background: rgba(255, 255, 255, 0.86);
  box-shadow: var(--shadow-sm);
  padding: 28px;
}

.card-diagnostic .section-head {
  margin-bottom: 20px;
}

.card-diagnostic .section-head .tool-kicker {
  font-size: 11px;
  letter-spacing: 0.09em;
  text-transform: uppercase;
  color: var(--text-muted);
}

.card-diagnostic .section-head h2 {
  font-family: var(--font-serif);
  font-size: 24px;
  color: var(--text-primary);
  margin: 6px 0 4px;
}

.card-diagnostic .section-head p {
  color: var(--text-secondary);
  font-size: 14px;
  margin: 0;
}

.card-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 14px;
}

@media (max-width: 720px) {
  .card-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

.metaphor-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 24px 14px 18px;
  border: 1px solid rgba(32, 79, 103, 0.12);
  border-radius: var(--radius-card);
  background: #fff;
  cursor: pointer;
  transition: all 0.22s ease;
  text-align: center;
}

.metaphor-card:hover {
  border-color: rgba(191, 111, 63, 0.35);
  transform: translateY(-3px);
  box-shadow: 0 6px 18px rgba(32, 79, 103, 0.08);
}

.metaphor-card.selected {
  border-color: var(--brand);
  background: rgba(32, 79, 103, 0.04);
  box-shadow: 0 0 0 2px rgba(32, 79, 103, 0.15);
}

.metaphor-card.dimmed {
  opacity: 0.45;
}

.card-icon {
  font-size: 36px;
  line-height: 1;
}

.metaphor-card strong {
  font-family: var(--font-serif);
  font-size: 17px;
  color: var(--text-primary);
  line-height: 1.3;
}

.metaphor-card small {
  font-size: 13px;
  color: var(--text-tertiary);
  line-height: 1.4;
  max-width: 200px;
}

/* ── Progressive Questions ── */
.progressive-questions {
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid rgba(32, 79, 103, 0.1);
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.question-step {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.question-text {
  font-family: var(--font-serif);
  font-size: 17px;
  color: var(--text-primary);
  margin: 0;
  font-weight: 600;
}

.choice-row {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.choice-chip {
  flex: 1;
  min-width: 140px;
  padding: 12px 16px;
  border: 1px solid rgba(32, 79, 103, 0.15);
  border-radius: var(--radius-card);
  background: #fff;
  color: var(--text-secondary);
  font-size: 14px;
  cursor: pointer;
  transition: all 0.18s ease;
  text-align: center;
}

.choice-chip:hover {
  border-color: var(--brand);
  color: var(--text-primary);
}

.choice-chip.active {
  border-color: var(--brand);
  background: rgba(32, 79, 103, 0.06);
  color: var(--brand);
  font-weight: 600;
}

.resolve-btn {
  align-self: flex-start;
  margin-top: 4px;
}

/* ── LAYER 3: Four Portals ── */
.portal-section {
  max-width: 1060px;
  margin: 0 auto 32px;
}

.portal-section .section-head {
  margin-bottom: 18px;
}

.portal-section .section-head .tool-kicker {
  font-size: 11px;
  letter-spacing: 0.09em;
  text-transform: uppercase;
  color: var(--text-muted);
}

.portal-section .section-head h2 {
  font-family: var(--font-serif);
  font-size: 24px;
  color: var(--text-primary);
  margin: 6px 0 0;
}

.portal-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

@media (max-width: 720px) {
  .portal-grid {
    grid-template-columns: 1fr;
  }
}

.portal-card {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 22px;
  border: 1px solid rgba(32, 79, 103, 0.14);
  border-radius: var(--radius-card);
  background: rgba(255, 255, 255, 0.86);
  box-shadow: var(--shadow-sm);
  cursor: pointer;
  transition: all 0.22s ease;
  text-align: left;
}

.portal-card:hover {
  border-color: rgba(32, 79, 103, 0.28);
  transform: translateY(-2px);
  box-shadow: 0 6px 18px rgba(32, 79, 103, 0.08);
}

.portal-icon {
  font-size: 28px;
  line-height: 1;
}

.portal-copy strong {
  display: block;
  font-family: var(--font-serif);
  font-size: 20px;
  color: var(--text-primary);
}

.portal-copy small {
  display: block;
  margin-top: 4px;
  font-size: 13px;
  color: var(--text-secondary);
  line-height: 1.5;
}

.portal-hooks {
  margin: 8px 0 0;
  padding: 0 0 0 16px;
  list-style: none;
}

.portal-hooks li {
  font-size: 13px;
  color: var(--text-tertiary);
  line-height: 1.6;
  position: relative;
}

.portal-hooks li::before {
  content: '? ';
  color: var(--accent);
  font-weight: 600;
}

/* ── Scene section label ── */
.scene-section-label {
  max-width: 1060px;
  margin: 0 auto 16px;
  text-align: center;
}

.scene-section-label span {
  font-family: var(--font-serif);
  font-size: 20px;
  color: var(--text-primary);
  font-weight: 600;
}

.scene-section-label p {
  margin: 4px 0 0;
  color: var(--text-tertiary);
  font-size: 14px;
}

/* ── More scenes ── */
.more-scenes {
  margin-top: 24px;
  border: 1px solid var(--border-default);
  border-radius: var(--radius-card);
  background: rgba(255,255,255,0.84);
  padding: 20px;
  box-shadow: var(--shadow-sm);
}

.more-scenes .tool-kicker {
  font-size: 11px;
  letter-spacing: 0.09em;
  text-transform: uppercase;
  color: var(--text-muted);
}

.more-scenes h3 {
  margin-top: 6px;
  font-family: var(--font-serif);
  font-size: 22px;
  line-height: 1.1;
  color: var(--text-primary);
}

.scene-strip {
  display: flex;
  flex-wrap: nowrap;
  gap: 10px;
  margin-top: 14px;
  overflow-x: auto;
  padding-bottom: 6px;
}

.scene-chip {
  flex: 0 0 260px;
  border: 1px solid var(--border-default);
  border-radius: var(--radius-card);
  background: #fff;
  color: var(--text-secondary);
  padding: 14px;
  text-align: left;
  cursor: pointer;
  transition: border-color 0.18s ease, transform 0.18s ease;
}

.scene-chip:hover {
  border-color: rgba(32,79,103,0.26);
  transform: translateY(-2px);
}

.scene-chip strong {
  display: block;
  color: var(--text-primary);
  font-size: 15px;
  line-height: 1.3;
}

.scene-chip small {
  display: block;
  margin-top: 6px;
  color: var(--text-tertiary);
  font-size: 13px;
  line-height: 1.5;
}

.scene-chip .domain-tag {
  display: inline-block;
  margin-top: 8px;
  border-radius: var(--radius-pill);
  background: rgba(32,79,103,0.08);
  color: var(--brand);
  padding: 3px 8px;
  font-size: 11px;
}
</style>
