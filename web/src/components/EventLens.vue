<template>
  <div class="event-lens-wrap">
    <div class="event-lens-main">
      <header class="event-lens-head">
        <div>
          <div class="tool-kicker">EVENT LENS</div>
          <h1>社会事件入口</h1>
          <p>先把事件拆成角色、争议和机制，再决定要输出什么观点。</p>
        </div>

        <button class="primary-btn" @click="runAnalysis">生成事件结构</button>
      </header>

      <section class="hot-events-panel">
        <div class="hot-events-head">
          <div>
            <div class="panel-kicker">本地热榜快照</div>
            <h2>从 01_sources 读取已拉取的热榜数据</h2>
            <p>外部热榜先由脚本沉淀到本地，网页只读取本地快照，再按我们的筛选标准挑出值得分析的事件。</p>
          </div>
          <div class="source-actions">
            <button class="ghost-btn" :disabled="hotLoading" @click="loadLocalHotEvents">
              {{ hotLoading ? '正在读取...' : '读取本地热榜快照' }}
            </button>
          </div>
        </div>

        <div v-if="hotError" class="hot-state">{{ hotError }}</div>
        <div v-else-if="hotEvents.length === 0" class="hot-state">还没有读取本地热榜快照，可以先手动输入。</div>
        <div v-else>
          <div class="source-tabs" aria-label="热榜来源筛选">
            <button
              class="source-tab"
              :class="{ active: selectedHotSource === 'all' }"
              @click="selectedHotSource = 'all'"
            >
              全部 {{ hotEvents.length }}
            </button>
            <button
              v-for="source in hotSources"
              :key="source.id"
              class="source-tab"
              :class="{ active: selectedHotSource === source.id }"
              @click="selectedHotSource = source.id"
            >
              {{ source.label }} {{ source.count }}
            </button>
          </div>

          <div class="hot-list">
            <button
              v-for="item in rankedHotEvents"
              :key="item.id"
              class="hot-item"
              @click="useHotEvent(item)"
            >
              <span class="hot-rank">{{ item.score }}</span>
              <span class="hot-main">
                <strong>{{ item.title }}</strong>
                <small>{{ item.reason }}</small>
              </span>
              <span class="hot-meta">
                <span>{{ item.source }}</span>
                <span>{{ sceneLabel(item.sceneId) }}</span>
              </span>
            </button>
          </div>
        </div>
      </section>

      <section class="event-form">
        <label>
          <span>输入社会事件 / 事件名称</span>
          <input v-model.trim="eventName" placeholder="例如：某平台发文被二次解读引发争议" />
        </label>

        <label>
          <span>补充背景（可选）</span>
          <textarea
            v-model.trim="eventSummary"
            rows="4"
            placeholder="你为什么被这个事件卡住？你最想先澄清什么？"
          ></textarea>
        </label>

        <div class="event-meta">
          <label>
            <span>我更关心哪个场景</span>
            <select v-model="sceneId">
              <option v-for="preset in eventLensPresets" :key="preset.id" :value="preset.id">
                {{ preset.label }}
              </option>
            </select>
          </label>

          <label>
            <span>我接下来想做什么</span>
            <select v-model="needType">
              <option value="understand">先理解，先稳住</option>
              <option value="speak">做一条可发观点</option>
              <option value="talk">给对话起一个安全提问</option>
            </select>
          </label>
        </div>

        <label>
          <span>我的真实目标（可选）</span>
          <input v-model.trim="rawNeed" placeholder="比如：我想先发一条澄清，不卷入情绪对骂" />
        </label>
      </section>

      <section class="event-grid">
        <article class="event-card">
          <div class="panel-kicker">事件摘要</div>
          <h3>{{ currentOutput.eventName }}</h3>
          <p>{{ currentOutput.eventSummary }}</p>
          <small>{{ currentOutput.coreFrame }}</small>
        </article>

        <article class="event-card">
          <div class="panel-kicker">角色关系图</div>
          <div class="chip-wrap">
            <article v-for="actor in currentOutput.preset.roleMap" :key="actor.role" class="chip-card">
              <strong>{{ actor.role }}</strong>
              <p>{{ actor.coreNeed }}</p>
            </article>
          </div>
        </article>

        <article class="event-card">
          <div class="panel-kicker">关键问题</div>
          <ol>
            <li v-for="question in currentOutput.preset.perspectiveQuestions" :key="question">{{ question }}</li>
          </ol>
        </article>

        <article class="event-card">
          <div class="panel-kicker">争议谱系</div>
          <div class="spectrum-wrap">
            <span>事件场景</span>
            <p>{{ currentOutput.preset.description }}</p>
            <small>建议输出：{{ currentOutput.rawNeed }}</small>
          </div>
        </article>
      </section>

      <section class="event-tools">
        <article>
          <div class="tool-kicker">输出建议</div>
          <ul>
            <li v-for="item in currentOutput.outputScaffolds" :key="item">{{ item }}</li>
          </ul>
        </article>

        <article>
          <div class="tool-kicker">关联书单</div>
          <div class="book-row" v-for="book in currentOutput.preset.books" :key="book.slug">
            <strong>{{ book.title }}</strong>
            <p>{{ book.reason }}</p>
            <button class="mini-btn" @click="openBookBySlug(book.slug)">打开书</button>
          </div>
        </article>

        <article>
          <div class="tool-kicker">下一步动作</div>
          <p>{{ currentOutput.tensionSummary }}</p>
          <button class="feedback-btn" @click="openRelatedProblem">从相关问题入口继续</button>
        </article>
      </section>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import './event-lens.css'
import {
  buildEventOutput,
  defaultEventLensPreset,
  eventLensPresets,
  inferEventScene,
  resolveEventLensPreset,
} from '../data/eventLensData.js'

const props = defineProps({
  presetId: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['openBook', 'openProblemCase'])

const eventName = ref('')
const eventSummary = ref('')
const rawNeed = ref('')
const needType = ref('understand')
const sceneId = ref(resolveEventLensPreset(props.presetId).id || defaultEventLensPreset)
const hotEvents = ref([])
const hotLoading = ref(false)
const hotError = ref('')
const selectedHotSource = ref('all')

const preset = computed(() => resolveEventLensPreset(sceneId.value))
const currentOutput = ref(buildEventOutput({ presetId: sceneId.value }))
const filteredHotEvents = computed(() => selectedHotSource.value === 'all'
  ? hotEvents.value
  : hotEvents.value.filter((item) => item.sourceId === selectedHotSource.value))
const hotSources = computed(() => {
  const map = new Map()
  for (const item of hotEvents.value) {
    const id = item.sourceId || item.source || 'unknown'
    const label = item.source || id
    const current = map.get(id) || { id, label, count: 0 }
    current.count += 1
    map.set(id, current)
  }
  return Array.from(map.values())
})
const rankedHotEvents = computed(() => filteredHotEvents.value
  .map((item) => scoreHotEvent(item))
  .filter((item) => item.score >= 45)
  .sort((a, b) => b.score - a.score || b.hot - a.hot)
  .slice(0, 24))

function applySceneFromInput() {
  const scene = inferEventScene(eventName.value, eventSummary.value)
  const nextScene = resolveEventLensPreset(scene)
  sceneId.value = nextScene.id
}

function runAnalysis() {
  applySceneFromInput()
  currentOutput.value = buildEventOutput({
    eventName: eventName.value,
    eventSummary: eventSummary.value,
    rawNeed: rawNeed.value || `我的目标是 ${needType.value === 'speak'
      ? '先发一条观点而不卷入情绪'
      : needType.value === 'talk'
        ? '先建立一条可复用的对话入口'
        : '先把事实和观点分离'
    }`,
    presetId: sceneId.value,
  })
}

async function loadLocalHotEvents() {
  hotLoading.value = true
  hotError.value = ''

  try {
    const response = await fetch('/api/local-hot-events')
    if (!response.ok) throw new Error('本地热榜快照不存在，请先运行抓取脚本。')
    const payload = await response.json()
    hotEvents.value = normalizeHotEvents(payload)
    selectedHotSource.value = 'all'
    if (hotEvents.value.length === 0) {
      hotError.value = '本地热榜快照为空，先使用手动输入。'
    }
  } catch (error) {
    hotError.value = error.message || '本地热榜快照暂时不可读。'
  } finally {
    hotLoading.value = false
  }
}

function useHotEvent(item) {
  eventName.value = item.title
  eventSummary.value = item.summary || item.reason
  rawNeed.value = '我想先判断这件事是否适合表达，以及应该从哪个结构切入。'
  sceneId.value = item.sceneId
  runAnalysis()
}

function normalizeHotEvents(payload) {
  const items = Array.isArray(payload.items) ? payload.items : Array.isArray(payload.data) ? payload.data : []
  const source = payload.source || payload.title || '知乎热榜'
  return items
    .map((item, index) => ({
      id: String(item.id || `${source}-${index}`),
      title: String(item.title || '').trim(),
      summary: String(item.summary || item.desc || '').trim(),
      hot: Number(item.hot || 0),
      url: item.url || item.mobileUrl || '',
      source: item.source || source,
      sourceId: item.sourceId !== undefined && item.sourceId !== null ? String(item.sourceId) : source,
    }))
    .filter((item) => item.title)
}

function scoreHotEvent(item) {
  const text = `${item.title} ${item.summary}`
  const scene = inferEventScene(item.title, item.summary)
  const structureScore = countMatches(text, [
    '争议', '举报', '回应', '如何看待', '为什么', '合理', '问题', '暴露', '冲突', '管理',
    '员工', '学校', '学生', '医院', '银行', '平台', '公司', '监管', '规则', '数据',
  ], 4) * 8
  const userRelevance = countMatches(text, [
    '学生', '员工', '职场', '管理', '公司', '沟通', '家庭', '关系', '平台', '消费',
    'AI', '教育', '医疗', '银行', '存款', '产品',
  ], 4) * 7
  const modelFit = countMatches(text, [
    '机制', '系统', '数据', '规则', '风险', '激励', '舆论', '平台', '信息', '证据',
    '造假', '融资', '监管',
  ], 4) * 6
  const riskPenalty = countMatches(text, [
    '明星', '赌王', '枪击', '死亡', '自杀', '未成年人', '隐私', '网暴', '刑事',
  ], 3) * 10
  const hotScore = item.hot > 0 ? Math.min(12, Math.round(Math.log10(item.hot))) : 3
  const score = clamp(35 + structureScore + userRelevance + modelFit + hotScore - riskPenalty, 0, 100)

  return {
    ...item,
    score,
    sceneId: scene,
    reason: buildHotReason(score, scene, riskPenalty),
  }
}

function buildHotReason(score, scene, riskPenalty) {
  if (riskPenalty >= 20) return '高风险事件，建议谨慎表达'
  if (scene === 'organization-conflict') return '适合拆组织角色、规则和激励'
  if (scene === 'public-opinion') return '适合拆事实、观点和传播框架'
  if (scene === 'relationship-conflict') return '适合拆角色需要和对话边界'
  if (score >= 75) return '结构张力较高，适合进入分析'
  return '可作为候选观察'
}

function sceneLabel(id) {
  return resolveEventLensPreset(id)?.label || '事件'
}

function countMatches(text, keywords, maxCount) {
  const count = keywords.filter((keyword) => text.includes(keyword)).length
  return Math.min(count, maxCount)
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value))
}

function openBookBySlug(slug) {
  if (!slug) return
  emit('openBook', slug)
}

function openRelatedProblem() {
  const caseMap = {
    relationship: 'needs-become-blame',
    organization: 'team-truth-silence',
    public: 'facts-before-argument',
  }

  let caseId = 'notes-to-writing'
  if (sceneId.value === 'relationship-conflict') caseId = caseMap.relationship
  if (sceneId.value === 'organization-conflict') caseId = caseMap.organization
  if (sceneId.value === 'public-opinion') caseId = caseMap.public
  emit('openProblemCase', caseId)
}

watch(
  () => props.presetId,
  (nextPresetId) => {
    if (!nextPresetId) return
    const resolved = resolveEventLensPreset(nextPresetId)
    sceneId.value = resolved.id
    runAnalysis()
  },
)

watch(
  () => [eventName.value, eventSummary.value],
  () => {
    if (!eventName.value && !eventSummary.value) return
    currentOutput.value = buildEventOutput({
      eventName: eventName.value,
      eventSummary: eventSummary.value,
      rawNeed: rawNeed.value || '我先把事实和观点分开。',
      presetId: sceneId.value,
    })
  },
)
</script>

<style scoped>
.event-lens-wrap {
  height: 100%;
  min-height: 0;
  overflow: hidden;
  background:
    linear-gradient(135deg, rgba(255, 255, 255, 0.73), rgba(235, 241, 244, 0.72)),
    radial-gradient(circle at 10% 14%, rgba(95, 125, 103, 0.14), transparent 38%),
    radial-gradient(circle at 88% 10%, rgba(191, 111, 63, 0.12), transparent 30%);
}

.event-lens-main {
  height: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 22px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  min-height: 0;
  overflow-y: auto;
}

.event-lens-head {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: center;
  padding: 20px;
  border: 1px solid var(--border-default);
  border-radius: var(--radius-card);
  background: rgba(255, 255, 255, 0.86);
  box-shadow: var(--shadow-sm);
}

.event-lens-head h1 {
  margin-top: 8px;
  font-family: var(--font-serif);
  font-size: 36px;
  color: var(--text-primary);
}

.event-lens-head p {
  margin-top: 10px;
  color: var(--text-secondary);
  max-width: 680px;
  line-height: 1.7;
}

.hot-events-panel {
  padding: 16px;
  border: 1px solid var(--border-default);
  border-radius: var(--radius-card);
  background: rgba(255, 255, 255, 0.82);
  box-shadow: var(--shadow-sm);
}

.hot-events-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.source-actions {
  display: flex;
  gap: 8px;
  flex: 0 0 auto;
}

.hot-events-head h2 {
  margin-top: 6px;
  font-size: 20px;
  color: var(--text-primary);
}

.hot-events-head p,
.hot-state {
  margin-top: 8px;
  color: var(--text-secondary);
  line-height: 1.65;
}

.hot-state {
  padding: 12px;
  border: 1px dashed var(--border-default);
  border-radius: var(--radius-card);
  background: rgba(247, 246, 243, 0.62);
}

.hot-list {
  margin-top: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 420px;
  overflow-y: auto;
  padding-right: 4px;
}

.source-tabs {
  margin-top: 14px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.source-tab {
  border: 1px solid var(--border-default);
  border-radius: var(--radius-pill);
  background: rgba(255, 255, 255, 0.74);
  color: var(--text-secondary);
  cursor: pointer;
  padding: 7px 10px;
  font-size: 12px;
  line-height: 1.2;
}

.source-tab.active,
.source-tab:hover {
  border-color: rgba(32, 79, 103, 0.28);
  background: var(--brand-soft);
  color: var(--brand);
}

.hot-item {
  width: 100%;
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-card);
  background: rgba(247, 246, 243, 0.72);
  color: var(--text-primary);
  cursor: pointer;
  display: grid;
  grid-template-columns: 42px minmax(0, 1fr) 132px;
  gap: 12px;
  align-items: start;
  padding: 10px;
  text-align: left;
  transition: border-color 0.18s ease, background 0.18s ease;
}

.hot-item:hover {
  border-color: rgba(32, 79, 103, 0.28);
  background: rgba(220, 231, 235, 0.72);
}

.hot-rank {
  width: 34px;
  height: 34px;
  border-radius: var(--radius-pill);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: var(--brand-soft);
  color: var(--brand);
  font-weight: 700;
  font-size: 12px;
}

.hot-main {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.hot-main strong {
  overflow-wrap: anywhere;
  line-height: 1.45;
}

.hot-main small {
  color: var(--text-tertiary);
  line-height: 1.5;
}

.hot-meta {
  min-width: 0;
  color: var(--text-muted);
  font-size: 11px;
  line-height: 1.5;
  display: flex;
  flex-direction: column;
  gap: 4px;
  align-items: flex-end;
  text-align: right;
}

.hot-meta span {
  max-width: 100%;
  overflow-wrap: anywhere;
}

.event-form {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  padding: 18px;
  border: 1px solid var(--border-default);
  border-radius: var(--radius-card);
  background: rgba(255, 255, 255, 0.82);
}

label {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
}

label span {
  font-size: 12px;
  color: var(--text-muted);
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

input,
textarea,
select {
  border: 1px solid var(--border-default);
  border-radius: var(--radius-card);
  background: #fff;
  color: var(--text-primary);
  padding: 10px;
  font-size: 14px;
}

.event-meta {
  display: flex;
  gap: 10px;
}

.event-meta label {
  flex: 1;
}

.event-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

.event-card,
.event-tools article {
  border: 1px solid var(--border-default);
  border-radius: var(--radius-card);
  background: rgba(255, 255, 255, 0.86);
  box-shadow: var(--shadow-sm);
  padding: 14px;
}

.event-card h3,
.panel-kicker {
  font-size: 13px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--text-muted);
}

.event-card h3 {
  margin-top: 8px;
  color: var(--text-primary);
  line-height: 1.4;
}

.event-card p {
  margin-top: 8px;
  color: var(--text-secondary);
  line-height: 1.65;
}

.event-card small,
.spectrum-wrap small {
  display: block;
  margin-top: 10px;
  color: var(--text-tertiary);
  line-height: 1.6;
}

.chip-wrap {
  margin-top: 10px;
  display: grid;
  gap: 10px;
}

.chip-card {
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-card);
  background: rgba(247, 246, 243, 0.7);
  padding: 12px;
}

.chip-card strong {
  color: var(--text-primary);
}

.chip-card p {
  margin-top: 6px;
  color: var(--text-secondary);
}

.event-card ol {
  margin-top: 10px;
  padding-left: 18px;
  color: var(--text-secondary);
}

.event-tools {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
}

.event-tools ul {
  margin-top: 10px;
  padding-left: 18px;
  color: var(--text-secondary);
}

.book-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-card);
  padding: 10px;
  margin-top: 10px;
}

.book-row strong {
  color: var(--text-primary);
}

.book-row p {
  margin: 4px 0;
  color: var(--text-secondary);
  font-size: 13px;
}

.mini-btn,
.primary-btn,
.ghost-btn,
.feedback-btn {
  border: 1px solid var(--border-default);
  border-radius: var(--radius-pill);
  background: var(--bg-elevated);
  color: var(--text-secondary);
  cursor: pointer;
}

.primary-btn {
  padding: 10px 14px;
  background: var(--brand);
  color: var(--text-on-dark);
  border-color: var(--brand);
}

.ghost-btn {
  padding: 9px 13px;
  flex: 0 0 auto;
}

.ghost-btn.secondary {
  color: var(--text-tertiary);
  background: rgba(255, 255, 255, 0.62);
}

.ghost-btn:disabled {
  cursor: wait;
  opacity: 0.68;
}

.feedback-btn {
  margin-top: 12px;
  padding: 8px 12px;
  font-size: 12px;
}

.mini-btn {
  padding: 7px 10px;
  font-size: 12px;
}

@media (max-width: 1120px) {
  .event-form,
  .event-grid,
  .event-tools {
    grid-template-columns: 1fr;
  }

  .event-lens-head,
  .hot-events-head {
    flex-direction: column;
    align-items: flex-start;
  }

  .source-actions {
    width: 100%;
    flex-wrap: wrap;
  }

  .hot-item {
    grid-template-columns: 42px minmax(0, 1fr);
  }

  .hot-meta {
    grid-column: 2;
    align-items: flex-start;
    text-align: left;
    flex-direction: row;
    flex-wrap: wrap;
  }
}
</style>
