<template>
  <div class="problem-wrap">
    <div class="problem-scroll">
      <section class="problem-shell">
        <aside class="problem-rail">
          <div class="rail-head">
            <div class="tool-kicker">从处境进入 · 卡点拆解</div>
            <h1>卡点工作台</h1>
            <p>把一句“我卡住了”，拆成当前现场、情绪信号、背后需要、可追问的问题和今天能做的一步。</p>
          </div>

          <div class="case-options" aria-label="具体卡点样张">
            <button
              v-for="item in cases"
              :key="item.id"
              class="case-option"
              :class="{ active: item.id === selectedCase.id }"
              @click="selectCase(item.id)"
            >
              <span>{{ item.phaseLabel }}</span>
              <strong>{{ item.shortTitle }}</strong>
              <small>{{ item.title }}</small>
            </button>
          </div>

          <div class="emotion-panel">
          <div class="rail-label">从情绪找入口</div>
          <article
            v-for="emotion in emotionEntries"
            :key="emotion.id"
            class="emotion-group"
          >
            <button class="emotion-row" @click="openEmotionEntry(emotion)">
              <span>{{ emotion.label }}</span>
              <small>{{ emotion.need }}</small>
            </button>

            <div class="emotion-cases">
              <button
                v-for="caseItem in emotion.caseItems"
                :key="caseItem.id"
                class="emotion-case-btn"
                :class="{ active: caseItem.id === selectedCaseId }"
                @click="selectCase(caseItem.id)"
              >
                {{ caseItem.shortTitle }}
              </button>
            </div>
          </article>
        </div>
      </aside>

        <main class="problem-main">
          <section class="lab-intake">
            <div>
              <div class="tool-kicker">当前任务</div>
              <h2>先把卡住的地方说清楚</h2>
              <p>这里不是马上给答案，而是把处境拆成可以讨论、可以验证、可以行动的几个小部件。</p>
            </div>
            <button class="primary-btn" @click="pickRandomCase">换一个卡点样张</button>
          </section>

          <ProblemWorkbench
            :problem-case="selectedCase"
            @open-book="$emit('openBook', $event)"
            @open-thinker="$emit('openThinker', $event)"
            @open-learning-paths="$emit('openLearningPaths', $event)"
            @open-thought-partner="$emit('openThoughtPartner')"
          />

          <section v-if="suggestedMethods.length" class="method-suggestions">
            <div class="tool-kicker">可以试试这些方法</div>
            <h3>回应这个卡点的几个练习</h3>
            <div class="method-grid">
              <article
                v-for="method in suggestedMethods"
                :key="method.id"
                class="method-card"
              >
                <strong>{{ method.title }}</strong>
                <p>{{ method.one }}</p>
                <span class="method-tag">{{ method.type }}</span>
              </article>
            </div>
          </section>
        </main>
      </section>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import ProblemWorkbench from './ProblemWorkbench.vue'
import { methods } from '../data/methodData.js'
import {
  emotionCoordinates,
  getProblemCase,
  problemCases,
  resolveProblemCaseId,
} from '../data/problemCaseData.js'

const props = defineProps({
  caseId: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['selectCase', 'openBook', 'openThinker', 'openLearningPaths', 'openThoughtPartner'])

const cases = problemCases
const emotions = emotionCoordinates
const selectedCaseId = ref(resolveProblemCaseId(props.caseId))
const problemCaseMap = computed(() => {
  const map = {}
  for (const item of cases) {
    map[item.id] = item
  }
  return map
})
const emotionEntries = computed(() => emotions
  .map((emotion) => ({
    ...emotion,
    caseItems: (emotion.caseIds || []).map((id) => problemCaseMap.value[id]).filter(Boolean),
  }))
  .filter((emotion) => emotion.caseItems.length > 0))

const selectedCase = computed(() => getProblemCase(selectedCaseId.value))

const suggestedMethods = computed(() => {
  const c = selectedCase.value
  if (!c) return []

  const tags = [
    ...(c.sceneTags || []),
    ...(c.emotionTags || []),
    ...(c.needTags || []),
    c.phaseLabel || '',
  ].join(' ')

  const typePatterns = [
    { match: /关系|信任|人际|连接|沟通|伴侣|家庭|父母/, type: '关系' },
    { match: /表达|说出|开口|拒绝|请求|话语|沉默/, type: '表达' },
    { match: /情绪|感受|觉察|焦虑|迷茫|内疚|羞耻|愤怒/, type: '觉察' },
    { match: /判断|决定|选择|犹豫|比较|评价/, type: '判断' },
    { match: /行动|改变|习惯|系统|结构|笔记|输出/, type: '创作' },
  ]

  for (const { match, type } of typePatterns) {
    if (match.test(tags)) {
      const filtered = methods.filter((m) => m.type === type)
      if (filtered.length >= 3) return filtered.slice(0, 5)
    }
  }

  return methods.filter((m) => ['觉察', '判断', '表达'].includes(m.type)).slice(0, 5)
})

function openEmotionEntry(emotion) {
  const casesInEmotion = emotion.caseItems || []
  if (!casesInEmotion.length) return

  const currentIndex = casesInEmotion.findIndex((item) => item.id === selectedCase.value.id)
  const nextIndex = currentIndex >= 0 ? (currentIndex + 1) % casesInEmotion.length : 0
  selectCase(casesInEmotion[nextIndex].id)
}
watch(
  () => props.caseId,
  (caseId) => {
    const nextCaseId = resolveProblemCaseId(caseId)
    if (nextCaseId === selectedCaseId.value) return
    selectedCaseId.value = nextCaseId
  },
)

function selectCase(caseId) {
  const nextCaseId = resolveProblemCaseId(caseId)
  selectedCaseId.value = nextCaseId
  emit('selectCase', nextCaseId)
}

function pickRandomCase() {
  const candidates = cases.filter((item) => item.id !== selectedCaseId.value)
  const pool = candidates.length ? candidates : cases
  const nextCase = pool[Math.floor(Math.random() * pool.length)] || cases[0]
  selectCase(nextCase.id)
}
</script>

<style scoped>
.problem-wrap {
  height: 100%;
  min-height: 0;
  overflow: hidden;
  background:
    linear-gradient(135deg, rgba(255, 255, 255, 0.72), rgba(237, 241, 241, 0.66)),
    radial-gradient(circle at 12% 0%, rgba(191, 111, 63, 0.12), transparent 34%),
    radial-gradient(circle at 86% 10%, rgba(95, 125, 67, 0.13), transparent 28%);
}

.problem-scroll {
  height: 100%;
  overflow-x: hidden;
  overflow-y: auto;
}

.problem-scroll::-webkit-scrollbar {
  width: 10px;
}

.problem-scroll::-webkit-scrollbar-thumb {
  background: rgba(32, 79, 103, 0.22);
  border-radius: var(--radius-pill);
}

.problem-shell {
  display: grid;
  grid-template-columns: 310px minmax(0, 1fr);
  gap: 18px;
  width: 100%;
  min-width: 0;
  max-width: 1480px;
  margin: 0 auto;
  padding: 22px;
  box-sizing: border-box;
}

.problem-rail {
  position: sticky;
  top: 22px;
  align-self: start;
  display: flex;
  flex-direction: column;
  gap: 14px;
  min-width: 0;
}

.rail-head,
.emotion-panel,
.lab-intake {
  border: 1px solid var(--border-default);
  border-radius: var(--radius-card);
  background: rgba(255, 255, 255, 0.84);
  box-shadow: var(--shadow-sm);
}

.rail-head {
  padding: 20px;
}

.tool-kicker,
.rail-label {
  font-size: 11px;
  line-height: 1.4;
  letter-spacing: 0.09em;
  text-transform: uppercase;
  color: var(--text-muted);
}

.rail-head h1,
.lab-intake h2 {
  margin-top: 8px;
  font-family: var(--font-serif);
  line-height: 1.1;
  color: var(--text-primary);
}

.rail-head h1 {
  font-size: 34px;
}

.lab-intake h2 {
  font-size: 32px;
}

.rail-head p,
.lab-intake p {
  margin-top: 10px;
  color: var(--text-secondary);
  line-height: 1.75;
  overflow-wrap: anywhere;
}

.case-options,
.problem-main,
.emotion-panel {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.case-option,
.emotion-row {
  width: 100%;
  border: 1px solid var(--border-default);
  border-radius: var(--radius-card);
  background: rgba(255, 255, 255, 0.84);
  color: var(--text-secondary);
  text-align: left;
  cursor: pointer;
  transition: background 0.18s ease, border-color 0.18s ease, transform 0.18s ease;
}

.case-option {
  display: flex;
  flex-direction: column;
  gap: 5px;
  padding: 14px;
}

.case-option:hover,
.emotion-row:hover {
  transform: translateY(-1px);
  border-color: rgba(32, 79, 103, 0.26);
  background: #fff;
}

.case-option.active {
  border-color: rgba(32, 79, 103, 0.32);
  background: var(--brand-soft);
}

.case-option span {
  font-size: 10px;
  color: var(--text-muted);
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.case-option strong {
  color: var(--text-primary);
  font-size: 16px;
}

.case-option small {
  color: var(--text-tertiary);
  line-height: 1.45;
}

.emotion-panel {
  padding: 14px;
}

.emotion-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.emotion-row {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 11px 12px;
}

.emotion-cases {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.emotion-case-btn {
  border: 1px solid var(--border-default);
  border-radius: var(--radius-pill);
  background: rgba(255, 255, 255, 0.84);
  color: var(--text-secondary);
  padding: 5px 10px;
  font-size: 11px;
  cursor: pointer;
  transition: background 0.18s ease, border-color 0.18s ease, color 0.18s ease;
}

.emotion-case-btn:hover {
  border-color: rgba(32, 79, 103, 0.26);
  background: #fff;
}

.emotion-case-btn.active {
  border-color: rgba(32, 79, 103, 0.32);
  background: var(--brand-soft);
  color: var(--brand);
}

.emotion-row span {
  color: var(--text-primary);
  font-weight: 700;
}

.emotion-row small {
  color: var(--text-tertiary);
  line-height: 1.45;
}

.problem-main {
  min-width: 0;
}

.lab-intake {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 18px;
  padding: 22px;
}

.primary-btn {
  flex: 0 0 auto;
  border: 1px solid var(--brand);
  border-radius: var(--radius-pill);
  background: var(--brand);
  color: var(--text-on-dark);
  padding: 11px 16px;
  font-size: 13px;
  cursor: pointer;
}

.primary-btn:hover {
  background: #173041;
}

.method-suggestions {
  margin-top: 18px;
  border: 1px solid var(--border-default);
  border-radius: var(--radius-card);
  background: rgba(255,255,255,0.84);
  padding: 20px;
  box-shadow: var(--shadow-sm);
}

.method-suggestions .tool-kicker {
  font-size: 11px;
  letter-spacing: 0.09em;
  text-transform: uppercase;
  color: var(--text-muted);
}

.method-suggestions h3 {
  margin-top: 6px;
  font-family: var(--font-serif);
  font-size: 22px;
  line-height: 1.1;
  color: var(--text-primary);
}

.method-grid {
  display: flex;
  flex-wrap: nowrap;
  gap: 10px;
  margin-top: 14px;
  overflow-x: auto;
  padding-bottom: 6px;
}

.method-card {
  flex: 0 0 240px;
  border: 1px solid var(--border-default);
  border-radius: var(--radius-card);
  background: #fff;
  padding: 14px;
}

.method-card strong {
  display: block;
  color: var(--text-primary);
  font-size: 15px;
  line-height: 1.3;
}

.method-card p {
  margin-top: 6px;
  color: var(--text-tertiary);
  font-size: 13px;
  line-height: 1.5;
}

.method-tag {
  display: inline-block;
  margin-top: 8px;
  border-radius: var(--radius-pill);
  background: rgba(32,79,103,0.08);
  color: var(--brand);
  padding: 3px 8px;
  font-size: 11px;
}

@media (max-width: 1080px) {
  .problem-shell {
    grid-template-columns: 1fr;
  }

  .problem-rail {
    position: static;
  }

  .case-options {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 720px) {
  .problem-shell {
    padding: 14px;
  }

  .case-options {
    grid-template-columns: 1fr;
  }

  .lab-intake {
    align-items: flex-start;
    flex-direction: column;
  }

  .lab-intake h2 {
    font-size: 26px;
  }
}
</style>
