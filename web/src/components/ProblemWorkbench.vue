<template>
  <section class="workbench">
    <div class="case-hero">
      <div class="hero-copy">
        <div class="case-meta">
          <span>{{ problemCase.phaseLabel }}</span>
          <span>{{ problemCase.entranceType }}</span>
        </div>
        <h2>{{ problemCase.title }}</h2>
        <p class="problem-naming">{{ problemCase.problemNaming }}</p>
        <div class="current-situation">
          <span>当前现场</span>
          <strong>{{ problemCase.currentSituation }}</strong>
        </div>
      </div>

      <div class="action-card">
        <span>{{ problemCase.minimumAction.time }}</span>
        <h3>{{ problemCase.minimumAction.title }}</h3>
        <p>{{ problemCase.minimumAction.text }}</p>
        <small>{{ problemCase.minimumAction.successSignal }}</small>
      </div>
    </div>

    <section class="coordinate-grid">
      <article class="coordinate-panel">
        <div class="panel-kicker">Scene</div>
        <h3>问题坐标</h3>
        <div class="tag-cloud">
          <span v-for="tag in problemCase.sceneTags" :key="tag">{{ tag }}</span>
        </div>
      </article>

      <article class="coordinate-panel">
        <div class="panel-kicker">Emotion</div>
        <h3>情绪信号</h3>
        <div class="tag-cloud warm">
          <span v-for="tag in problemCase.emotionTags" :key="tag">{{ tag }}</span>
        </div>
      </article>

      <article class="coordinate-panel">
        <div class="panel-kicker">Need</div>
        <h3>背后需要</h3>
        <div class="tag-cloud green">
          <span v-for="tag in problemCase.needTags" :key="tag">{{ tag }}</span>
        </div>
      </article>
    </section>

    <section class="core-question">
      <span>核心追问</span>
      <p>{{ problemCase.coreQuestion }}</p>
    </section>

    <section class="workbench-grid">
      <article class="panel thinkers-panel">
        <div class="panel-head">
          <div>
            <div class="panel-kicker">Thought Partners</div>
            <h3>多视角解释</h3>
          </div>
          <button class="ghost-btn" @click="$emit('openThoughtPartner')">打开选配器</button>
        </div>

        <div class="thinker-list">
          <article v-for="thinker in problemCase.recommendedThinkers" :key="`${thinker.name}-${thinker.role}`" class="thinker-row">
            <div>
              <span>{{ thinker.role }}</span>
              <strong>{{ thinker.name }}</strong>
              <p>{{ thinker.reason }}</p>
            </div>
            <button
              v-if="thinker.thinkerId"
              class="mini-btn"
              @click="$emit('openThinker', thinker.thinkerId)"
            >
              详情
            </button>
          </article>
        </div>
      </article>

      <article class="panel books-panel">
        <div class="panel-head">
          <div>
            <div class="panel-kicker">Evidence</div>
            <h3>书籍证据</h3>
          </div>
          <button
            v-if="problemCase.learningPathId"
            class="ghost-btn"
            @click="$emit('openLearningPaths', problemCase.learningPathId)"
          >
            学习路径
          </button>
        </div>

        <div class="book-list">
          <article v-for="book in problemCase.relatedBooks" :key="book.slug || book.title" class="book-row">
            <div>
              <span>{{ book.role }}</span>
              <strong>{{ book.title }}</strong>
              <p>{{ book.reason }}</p>
            </div>
            <button
              v-if="book.slug"
              class="mini-btn"
              @click="$emit('openBook', book.slug)"
            >
              打开
            </button>
          </article>
        </div>

        <div class="concept-strip">
          <span v-for="concept in problemCase.relatedConcepts" :key="concept">{{ concept }}</span>
        </div>
      </article>
    </section>

    <section class="panel workshop-panel">
      <div class="panel-head">
        <div>
          <div class="panel-kicker">Workshop Mode</div>
          <h3>问题工作坊</h3>
        </div>
        <div class="mode-tabs">
          <button
            v-for="mode in availableModes"
            :key="mode.id"
            class="mode-tab"
            :class="{ active: selectedModeId === mode.id }"
            @click="selectedModeId = mode.id"
          >
            {{ mode.shortLabel }}
          </button>
        </div>
      </div>

      <div class="mode-layout">
        <div class="mode-copy">
          <span>{{ selectedMode.phaseLabel }}</span>
          <h4>{{ selectedMode.label }}</h4>
          <p>{{ selectedMode.goal }}</p>
          <small>{{ selectedMode.bestFor }}</small>
        </div>

        <div class="mode-steps">
          <div v-for="step in selectedMode.steps" :key="step" class="step-row">{{ step }}</div>
        </div>

        <div class="mode-output">
          <article
            v-for="item in workshopOutputItems"
            :key="item.key"
            class="output-row"
          >
            <span>{{ item.label }}</span>
            <p>{{ item.value }}</p>
          </article>
        </div>
      </div>
    </section>

    <section class="output-actions">
      <article>
        <div class="panel-kicker">Outputs</div>
        <h3>可沉淀输出</h3>
        <div class="output-tags">
          <span v-for="format in problemCase.outputFormats" :key="format">{{ format }}</span>
        </div>
      </article>

      <div class="feedback-actions">
        <button class="feedback-btn" @click="markFeedback('hit')">这说中了</button>
        <button class="feedback-btn" @click="markFeedback('miss')">这没说中</button>
        <button class="feedback-btn primary" @click="markFeedback('try')">我愿意试这个行动</button>
      </div>
      <p v-if="feedbackText" class="feedback-note">{{ feedbackText }}</p>
    </section>
  </section>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { defaultWorkshopForCase } from '../data/problemCaseData.js'
import { resolveWorkshopMode, workshopModes } from '../data/workshopModeData.js'

const props = defineProps({
  problemCase: {
    type: Object,
    required: true,
  },
})

defineEmits(['openBook', 'openThinker', 'openLearningPaths', 'openThoughtPartner'])

const selectedModeId = ref(defaultWorkshopForCase(props.problemCase))
const feedbackText = ref('')

const availableModes = computed(() =>
  (props.problemCase.workshopModes || [])
    .map((modeId) => resolveWorkshopMode(modeId))
    .filter(Boolean),
)

const selectedMode = computed(() => {
  if (!availableModes.value.some((mode) => mode.id === selectedModeId.value)) {
    return availableModes.value[0] || workshopModes[0]
  }
  return resolveWorkshopMode(selectedModeId.value)
})

const workshopOutputItems = computed(() => {
  const output = props.problemCase.workshopOutputs?.[selectedMode.value.id] || {}
  const labels = selectedMode.value.outputLabels || {}
  return Object.entries(labels)
    .map(([key, label]) => ({
      key,
      label,
      value: output[key] || '这一项还需要在后续样张中补充。',
    }))
})

watch(
  () => props.problemCase.id,
  () => {
    selectedModeId.value = defaultWorkshopForCase(props.problemCase)
    feedbackText.value = ''
  },
)

function markFeedback(type) {
  if (type === 'hit') {
    feedbackText.value = '已记录为“说中”信号，后续可以把这类问题优先扩成正式专题。'
    return
  }
  if (type === 'miss') {
    feedbackText.value = '已记录为“未命中”信号，后续需要回看问题命名和证据绑定。'
    return
  }
  feedbackText.value = `已记录行动意愿：${props.problemCase.minimumAction.title}。`
}
</script>

<style scoped>
.workbench {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.case-hero,
.panel,
.core-question,
.output-actions,
.coordinate-panel {
  border: 1px solid var(--border-default);
  border-radius: var(--radius-card);
  background: rgba(255, 255, 255, 0.82);
  box-shadow: var(--shadow-sm);
}

.case-hero {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 320px;
  gap: 18px;
  padding: 24px;
}

.hero-copy h2 {
  margin-top: 12px;
  max-width: 780px;
  font-family: var(--font-serif);
  font-size: clamp(28px, 4vw, 52px);
  line-height: 1.05;
  color: var(--text-primary);
}

.case-meta,
.panel-kicker,
.action-card > span,
.current-situation > span,
.core-question > span,
.thinker-row span,
.book-row span,
.mode-copy > span,
.output-row span {
  font-size: 11px;
  line-height: 1.4;
  color: var(--text-muted);
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.case-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.case-meta span,
.tag-cloud span,
.concept-strip span,
.output-tags span {
  display: inline-flex;
  align-items: center;
  min-height: 28px;
  padding: 5px 10px;
  border-radius: var(--radius-pill);
  background: rgba(32, 79, 103, 0.08);
  color: var(--brand);
  font-size: 12px;
}

.problem-naming {
  margin-top: 14px;
  max-width: 720px;
  color: var(--text-secondary);
  font-size: 17px;
  line-height: 1.8;
}

.current-situation {
  margin-top: 20px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-width: 760px;
}

.current-situation strong {
  color: var(--text-primary);
  font-size: 15px;
  line-height: 1.7;
  font-weight: 600;
}

.action-card {
  align-self: stretch;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 20px;
  border-radius: var(--radius-card);
  background: #173041;
  color: var(--text-on-dark);
}

.action-card h3 {
  font-size: 22px;
  line-height: 1.2;
}

.action-card p,
.action-card small {
  color: rgba(247, 245, 240, 0.78);
  line-height: 1.7;
}

.coordinate-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.coordinate-panel {
  padding: 16px;
}

.coordinate-panel h3 {
  margin: 5px 0 12px;
  font-size: 16px;
}

.tag-cloud,
.concept-strip,
.output-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag-cloud.warm span {
  background: rgba(191, 111, 63, 0.1);
  color: var(--accent);
}

.tag-cloud.green span {
  background: rgba(95, 125, 67, 0.12);
  color: #4f6c39;
}

.core-question {
  padding: 18px 22px;
}

.core-question p {
  margin-top: 8px;
  color: var(--text-primary);
  font-family: var(--font-serif);
  font-size: 24px;
  line-height: 1.45;
}

.workbench-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: 14px;
}

.panel {
  padding: 18px;
}

.panel-head {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: flex-start;
  margin-bottom: 14px;
}

.panel-head h3 {
  margin-top: 5px;
  font-size: 20px;
}

.ghost-btn,
.mini-btn,
.mode-tab,
.feedback-btn {
  border: 1px solid var(--border-default);
  border-radius: var(--radius-pill);
  background: var(--bg-elevated);
  color: var(--text-secondary);
  cursor: pointer;
  transition: background 0.18s ease, color 0.18s ease, border-color 0.18s ease;
}

.ghost-btn {
  flex: 0 0 auto;
  padding: 8px 12px;
  font-size: 12px;
}

.mini-btn {
  flex: 0 0 auto;
  padding: 7px 11px;
  font-size: 12px;
}

.ghost-btn:hover,
.mini-btn:hover,
.mode-tab:hover,
.feedback-btn:hover {
  color: var(--brand);
  border-color: rgba(32, 79, 103, 0.24);
  background: var(--brand-soft);
}

.thinker-list,
.book-list,
.mode-output {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.thinker-row,
.book-row,
.output-row {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding: 13px;
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-card);
  background: rgba(247, 245, 240, 0.58);
}

.thinker-row strong,
.book-row strong {
  display: block;
  margin-top: 3px;
  color: var(--text-primary);
}

.thinker-row p,
.book-row p,
.output-row p {
  margin-top: 5px;
  color: var(--text-secondary);
  line-height: 1.6;
  font-size: 13px;
}

.concept-strip {
  margin-top: 14px;
}

.workshop-panel {
  background: #f9faf8;
}

.mode-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  justify-content: flex-end;
}

.mode-tab {
  padding: 8px 11px;
  font-size: 12px;
}

.mode-tab.active {
  color: var(--brand);
  background: var(--brand-soft);
  border-color: rgba(32, 79, 103, 0.24);
}

.mode-layout {
  display: grid;
  grid-template-columns: 280px minmax(0, 1fr) minmax(0, 1.15fr);
  gap: 14px;
}

.mode-copy {
  padding: 16px;
  border-radius: var(--radius-card);
  background: #173041;
  color: var(--text-on-dark);
}

.mode-copy h4 {
  margin-top: 8px;
  font-size: 22px;
}

.mode-copy p,
.mode-copy small {
  display: block;
  margin-top: 10px;
  color: rgba(247, 245, 240, 0.76);
  line-height: 1.7;
}

.mode-steps {
  display: grid;
  grid-template-columns: 1fr;
  gap: 8px;
}

.step-row {
  padding: 12px 14px;
  border-radius: var(--radius-card);
  background: rgba(32, 79, 103, 0.08);
  color: var(--text-primary);
  line-height: 1.55;
  font-size: 13px;
}

.output-actions {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: center;
  gap: 14px;
  padding: 18px;
}

.output-actions h3 {
  margin: 5px 0 12px;
}

.feedback-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: flex-end;
}

.feedback-btn {
  padding: 9px 13px;
  font-size: 12px;
}

.feedback-btn.primary {
  background: var(--brand);
  color: var(--text-on-dark);
  border-color: var(--brand);
}

.feedback-note {
  grid-column: 1 / -1;
  color: var(--text-tertiary);
  font-size: 12px;
}

@media (max-width: 1040px) {
  .case-hero,
  .workbench-grid,
  .mode-layout {
    grid-template-columns: 1fr;
  }

  .coordinate-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 720px) {
  .case-hero,
  .panel,
  .core-question,
  .output-actions,
  .coordinate-panel {
    padding: 16px;
  }

  .hero-copy h2 {
    font-size: 30px;
  }

  .core-question p {
    font-size: 20px;
  }

  .output-actions {
    grid-template-columns: 1fr;
  }

  .feedback-actions {
    justify-content: flex-start;
  }
}
</style>
