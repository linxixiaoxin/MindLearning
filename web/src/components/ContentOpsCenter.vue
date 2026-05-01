<template>
  <div class="content-ops-wrap">
    <div class="content-ops-scroll">
      <section class="ops-shell">
        <header class="ops-hero">
          <div>
            <div class="ops-kicker">CONTENT OPS · EMOTION COORDINATE</div>
            <h1>选题中台</h1>
            <p>
              情绪坐标在这里不作为前台心理工具，而是作为你的内容生产入口：
              从真实场景识别情绪信号，翻译成需要、机制和书籍证据，再推进到选题、任务和反馈。
            </p>
          </div>
          <div class="ops-hero-actions">
            <button class="primary-btn" @click="$emit('openProblemLab', selectedTopic?.linkedCaseId || '')">
              进入问题工作台
            </button>
            <button class="ghost-btn" @click="$emit('openEventLens')">从热榜找事件</button>
          </div>
        </header>

        <section class="pipeline-strip" aria-label="选题生产链路">
          <article v-for="step in contentOpsPipeline" :key="step.id" class="pipeline-step">
            <span>{{ step.label }}</span>
            <p>{{ step.description }}</p>
          </article>
        </section>

        <section class="ops-layout">
          <aside class="emotion-rail">
            <div class="panel-head compact">
              <div>
                <div class="ops-kicker">Emotion Index</div>
                <h2>情绪坐标</h2>
              </div>
              <span class="count-pill">{{ emotionContentCoordinates.length }}</span>
            </div>

            <button
              v-for="emotion in emotionContentCoordinates"
              :key="emotion.id"
              class="emotion-tab"
              :class="{ active: selectedEmotionId === emotion.id }"
              @click="selectEmotion(emotion.id)"
            >
              <span>{{ emotion.label }}</span>
              <small>{{ emotion.coreNeed }}</small>
            </button>
          </aside>

          <main class="ops-main">
            <section class="emotion-detail">
              <div class="detail-copy">
                <div class="ops-kicker">Current Coordinate</div>
                <h2>{{ selectedEmotion.label }}：{{ selectedEmotion.coreNeed }}</h2>
                <p>{{ selectedEmotion.lead }}</p>
              </div>

              <div class="expression-card">
                <span>更成熟的一句话</span>
                <p>{{ selectedEmotion.expressionTemplate }}</p>
              </div>
            </section>

            <section class="ops-grid three">
              <article class="ops-panel">
                <div class="ops-kicker">Scenes</div>
                <h3>高频场景</h3>
                <div class="chip-list">
                  <span v-for="scene in selectedEmotion.scenes" :key="scene">{{ scene }}</span>
                </div>
              </article>

              <article class="ops-panel">
                <div class="ops-kicker">Mechanisms</div>
                <h3>背后机制</h3>
                <div class="chip-list green">
                  <span v-for="mechanism in selectedEmotion.mechanisms" :key="mechanism">{{ mechanism }}</span>
                </div>
              </article>

              <article class="ops-panel">
                <div class="ops-kicker">Evidence</div>
                <h3>书籍证据</h3>
                <div class="evidence-list">
                  <button
                    v-for="book in selectedEmotion.evidenceBooks"
                    :key="book.slug"
                    class="evidence-row"
                    @click="$emit('openBook', book.slug)"
                  >
                    <strong>{{ book.title }}</strong>
                    <small>{{ book.role }}</small>
                  </button>
                </div>
              </article>
            </section>

            <section class="topic-section">
              <div class="panel-head">
                <div>
                  <div class="ops-kicker">Topic Pool</div>
                  <h2>当前坐标下的选题</h2>
                </div>
                <div class="topic-summary">
                  <span>{{ filteredTopics.length }} 个选题</span>
                  <span>{{ p0Count }} 个 P0</span>
                </div>
              </div>

              <div class="topic-list">
                <article
                  v-for="topic in filteredTopics"
                  :key="topic.id"
                  class="topic-card"
                  :class="{ active: selectedTopicId === topic.id }"
                  @click="selectedTopicId = topic.id"
                >
                  <div class="topic-card-head">
                    <span class="priority">{{ topic.priority }}</span>
                    <span class="status-pill" :class="getStatusMeta(topic.status).tone">
                      {{ getStatusMeta(topic.status).label }}
                    </span>
                  </div>
                  <h3>{{ topic.title }}</h3>
                  <p>{{ topic.scene }}</p>
                  <div class="topic-meta">
                    <span>{{ topic.platform }}</span>
                    <span>{{ topic.contentForm }}</span>
                    <span>{{ topic.due }}</span>
                  </div>
                </article>
              </div>
            </section>

            <section v-if="selectedTopic" class="selected-topic">
              <div class="selected-copy">
                <div class="ops-kicker">Selected Task</div>
                <h2>{{ selectedTopic.title }}</h2>
                <p>
                  {{ selectedTopic.scene }} · {{ selectedTopic.platform }} ·
                  {{ getStatusMeta(selectedTopic.status).label }}
                </p>
              </div>

              <div class="selected-actions">
                <button class="ghost-btn" @click="$emit('openProblemLab', selectedTopic.linkedCaseId)">
                  看问题案例
                </button>
                <button class="ghost-btn" @click="$emit('openLearningPath', selectedTopic.linkedPathId)">
                  看学习路径
                </button>
                <button class="ghost-btn" @click="$emit('openCapabilityPaths', 'communication')">
                  表达能力路径
                </button>
              </div>

              <div class="task-note-list">
                <article v-for="note in selectedTopic.taskNotes" :key="note" class="task-note">
                  {{ note }}
                </article>
              </div>
            </section>

            <section class="ops-grid two">
              <article class="ops-panel">
                <div class="panel-head compact">
                  <div>
                    <div class="ops-kicker">Angles</div>
                    <h3>可继续扩写的标题角度</h3>
                  </div>
                </div>
                <ol class="angle-list">
                  <li v-for="angle in selectedEmotion.topicAngles" :key="angle">{{ angle }}</li>
                </ol>
              </article>

              <article class="ops-panel">
                <div class="panel-head compact">
                  <div>
                    <div class="ops-kicker">Task Board</div>
                    <h3>中台任务状态</h3>
                  </div>
                </div>
                <div class="ops-task-list">
                  <article v-for="task in contentOpsTasks" :key="task.id" class="ops-task">
                    <span>{{ task.lane }}</span>
                    <strong>{{ task.title }}</strong>
                    <small :class="['status-dot', getStatusMeta(task.status).tone]">
                      {{ getStatusMeta(task.status).label }}
                    </small>
                  </article>
                </div>
              </article>
            </section>
          </main>
        </section>
      </section>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import {
  contentOpsPipeline,
  contentOpsTasks,
  contentTopicItems,
  emotionContentCoordinates,
  getStatusMeta,
  getTopicsForEmotion,
  resolveEmotionCoordinate,
} from '../data/contentOpsData.js'

defineEmits([
  'openBook',
  'openProblemLab',
  'openEventLens',
  'openLearningPath',
  'openCapabilityPaths',
])

const selectedEmotionId = ref(emotionContentCoordinates[0]?.id || '')
const selectedTopicId = ref('')

const selectedEmotion = computed(() => resolveEmotionCoordinate(selectedEmotionId.value))
const filteredTopics = computed(() => getTopicsForEmotion(selectedEmotionId.value))
const selectedTopic = computed(() =>
  filteredTopics.value.find((topic) => topic.id === selectedTopicId.value) || filteredTopics.value[0],
)
const p0Count = computed(() => filteredTopics.value.filter((topic) => topic.priority === 'P0').length)

watch(filteredTopics, (topics) => {
  if (!topics.some((topic) => topic.id === selectedTopicId.value)) {
    selectedTopicId.value = topics[0]?.id || ''
  }
}, { immediate: true })

function selectEmotion(emotionId) {
  selectedEmotionId.value = emotionId
}

void contentTopicItems
</script>

<style scoped>
.content-ops-wrap {
  height: 100%;
  min-height: 0;
  overflow: hidden;
  background:
    linear-gradient(135deg, rgba(248, 247, 242, 0.94), rgba(236, 241, 240, 0.86)),
    radial-gradient(circle at 8% 4%, rgba(171, 91, 57, 0.12), transparent 30%),
    radial-gradient(circle at 88% 2%, rgba(45, 99, 101, 0.12), transparent 32%);
}

.content-ops-scroll {
  height: 100%;
  overflow-y: auto;
}

.ops-shell {
  width: min(1480px, calc(100% - 36px));
  margin: 0 auto;
  padding: 24px 0 36px;
}

.ops-hero,
.emotion-detail,
.selected-topic,
.ops-panel,
.emotion-rail,
.pipeline-step,
.topic-card {
  border: 1px solid var(--border-default);
  border-radius: var(--radius-card);
  background: rgba(255, 255, 255, 0.86);
  box-shadow: var(--shadow-sm);
}

.ops-hero {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 24px;
  align-items: end;
  padding: 26px;
}

.ops-kicker {
  font-size: 11px;
  line-height: 1.4;
  letter-spacing: 0.09em;
  text-transform: uppercase;
  color: var(--text-muted);
}

.ops-hero h1,
.emotion-detail h2,
.topic-section h2,
.selected-topic h2,
.emotion-rail h2 {
  margin: 8px 0 0;
  color: var(--text-primary);
  font-family: var(--font-serif);
  line-height: 1.12;
}

.ops-hero h1 {
  font-size: clamp(36px, 4.6vw, 62px);
}

.ops-hero p,
.emotion-detail p,
.selected-topic p,
.pipeline-step p,
.topic-card p {
  color: var(--text-secondary);
  line-height: 1.75;
}

.ops-hero p {
  max-width: 820px;
  margin: 12px 0 0;
  font-size: 15px;
}

.ops-hero-actions,
.selected-actions,
.topic-summary,
.panel-head {
  display: flex;
  align-items: center;
  gap: 10px;
}

.ops-hero-actions {
  flex-wrap: wrap;
  justify-content: flex-end;
}

.primary-btn,
.ghost-btn {
  border: 1px solid var(--border-default);
  border-radius: var(--radius-pill);
  padding: 9px 15px;
  font-weight: 700;
  cursor: pointer;
}

.primary-btn {
  background: var(--brand);
  border-color: var(--brand);
  color: #fff;
}

.ghost-btn {
  background: rgba(255, 255, 255, 0.78);
  color: var(--text-secondary);
}

.pipeline-strip {
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: 10px;
  margin-top: 14px;
}

.pipeline-step {
  padding: 14px;
}

.pipeline-step span {
  color: var(--text-primary);
  font-weight: 800;
}

.pipeline-step p {
  margin: 8px 0 0;
  font-size: 12px;
}

.ops-layout {
  display: grid;
  grid-template-columns: 280px minmax(0, 1fr);
  gap: 16px;
  margin-top: 16px;
}

.emotion-rail {
  position: sticky;
  top: 18px;
  align-self: start;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 16px;
}

.panel-head {
  justify-content: space-between;
}

.panel-head.compact h2,
.panel-head.compact h3 {
  margin: 4px 0 0;
}

.count-pill,
.topic-summary span,
.status-pill,
.priority,
.status-dot {
  border-radius: var(--radius-pill);
  padding: 4px 9px;
  font-size: 11px;
  font-weight: 800;
}

.count-pill,
.topic-summary span {
  background: rgba(32, 79, 103, 0.08);
  color: var(--brand);
}

.emotion-tab {
  border: 1px solid var(--border-default);
  border-radius: var(--radius-card);
  background: rgba(255, 255, 255, 0.76);
  padding: 12px;
  text-align: left;
  cursor: pointer;
}

.emotion-tab span,
.emotion-tab small {
  display: block;
}

.emotion-tab span {
  color: var(--text-primary);
  font-weight: 800;
}

.emotion-tab small {
  margin-top: 5px;
  color: var(--text-tertiary);
  line-height: 1.5;
}

.emotion-tab.active {
  border-color: rgba(32, 79, 103, 0.28);
  background: rgba(225, 238, 241, 0.88);
}

.ops-main {
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-width: 0;
}

.emotion-detail {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 330px;
  gap: 18px;
  padding: 22px;
}

.expression-card {
  border-left: 3px solid var(--accent);
  background: rgba(250, 246, 238, 0.9);
  padding: 16px;
}

.expression-card span {
  color: var(--text-muted);
  font-size: 12px;
  font-weight: 800;
}

.expression-card p {
  margin: 8px 0 0;
  color: var(--text-primary);
  font-size: 15px;
  line-height: 1.8;
}

.ops-grid {
  display: grid;
  gap: 16px;
}

.ops-grid.three {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.ops-grid.two {
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
}

.ops-panel {
  padding: 18px;
}

.ops-panel h3 {
  margin: 6px 0 12px;
  color: var(--text-primary);
}

.chip-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.chip-list span {
  border-radius: var(--radius-pill);
  background: rgba(32, 79, 103, 0.08);
  color: var(--brand);
  padding: 6px 10px;
  font-size: 12px;
  font-weight: 700;
}

.chip-list.green span {
  background: rgba(95, 125, 67, 0.1);
  color: #4e6b35;
}

.evidence-list,
.ops-task-list,
.task-note-list {
  display: flex;
  flex-direction: column;
  gap: 9px;
}

.evidence-row {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  width: 100%;
  border: 1px solid var(--border-default);
  border-radius: var(--radius-card);
  background: rgba(255, 255, 255, 0.72);
  padding: 10px;
  color: var(--text-primary);
  cursor: pointer;
  text-align: left;
}

.evidence-row small {
  color: var(--text-tertiary);
}

.topic-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.topic-list {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.topic-card {
  padding: 16px;
  cursor: pointer;
}

.topic-card.active {
  border-color: rgba(171, 91, 57, 0.34);
  background: rgba(255, 250, 242, 0.94);
}

.topic-card-head,
.topic-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 7px;
}

.priority {
  background: rgba(171, 91, 57, 0.1);
  color: var(--accent);
}

.status-pill.neutral,
.status-dot.neutral {
  background: rgba(113, 122, 126, 0.12);
  color: #58656a;
}

.status-pill.blue,
.status-dot.blue {
  background: rgba(32, 79, 103, 0.1);
  color: var(--brand);
}

.status-pill.amber,
.status-dot.amber {
  background: rgba(171, 91, 57, 0.12);
  color: var(--accent);
}

.status-pill.green,
.status-dot.green {
  background: rgba(95, 125, 67, 0.12);
  color: #4f7138;
}

.status-pill.purple,
.status-dot.purple {
  background: rgba(104, 85, 140, 0.12);
  color: #68558c;
}

.topic-card h3 {
  margin: 12px 0 8px;
  color: var(--text-primary);
  line-height: 1.45;
}

.topic-card p {
  margin: 0;
  font-size: 13px;
}

.topic-meta {
  margin-top: 12px;
  color: var(--text-tertiary);
  font-size: 11px;
}

.selected-topic {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 16px;
  padding: 20px;
}

.selected-actions {
  align-self: start;
  justify-content: flex-end;
  flex-wrap: wrap;
}

.task-note-list {
  grid-column: 1 / -1;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.task-note {
  border: 1px dashed rgba(32, 79, 103, 0.22);
  border-radius: var(--radius-card);
  padding: 12px;
  color: var(--text-secondary);
  line-height: 1.65;
}

.angle-list {
  margin: 0;
  padding-left: 20px;
  color: var(--text-secondary);
  line-height: 1.9;
}

.ops-task {
  display: grid;
  grid-template-columns: 76px minmax(0, 1fr) auto;
  gap: 10px;
  align-items: center;
  border-top: 1px solid var(--border-default);
  padding-top: 10px;
}

.ops-task span {
  color: var(--text-muted);
  font-size: 12px;
}

.ops-task strong {
  color: var(--text-primary);
  font-size: 13px;
  line-height: 1.5;
}

@media (max-width: 1120px) {
  .pipeline-strip,
  .topic-list,
  .ops-grid.three {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .ops-layout,
  .emotion-detail {
    grid-template-columns: 1fr;
  }

  .emotion-rail {
    position: static;
  }
}

@media (max-width: 720px) {
  .ops-shell {
    width: min(100% - 24px, 1480px);
    padding-top: 14px;
  }

  .ops-hero,
  .selected-topic {
    grid-template-columns: 1fr;
  }

  .ops-hero-actions,
  .selected-actions {
    justify-content: flex-start;
  }

  .pipeline-strip,
  .topic-list,
  .ops-grid.three,
  .ops-grid.two,
  .task-note-list {
    grid-template-columns: 1fr;
  }

  .ops-task {
    grid-template-columns: 1fr;
  }
}
</style>
