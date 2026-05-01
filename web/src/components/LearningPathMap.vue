<template>
  <div class="learning-wrap">
    <div class="learning-scroll">
      <section class="learning-workbench">
        <aside class="path-rail">
          <div class="rail-head">
            <div class="tool-kicker">PRODUCT EXPERIMENT · LEARNING PATH</div>
            <h1>学习路径地图</h1>
            <p>从一个真实问题出发，把书、概念、练习和输出任务排成一条能执行的学习路线。</p>
          </div>

          <div class="path-options" aria-label="学习路径样张">
            <button
              v-for="path in paths"
              :key="path.id"
              class="path-option"
              :class="{ active: path.id === selectedPath.id }"
              @click="selectPath(path.id)"
            >
              <span>{{ path.phaseLabel }}</span>
              <strong>{{ path.shortTitle }}</strong>
              <small>{{ path.title }}</small>
            </button>
          </div>

          <div class="queued-list">
            <div class="rail-label">后续动作</div>
            <article v-for="item in upcomingPaths" :key="item.title" class="queued-item">
              <span>{{ item.status }}</span>
              <strong>{{ item.title }}</strong>
              <p>{{ item.reason }}</p>
            </article>
          </div>
        </aside>

        <main class="path-main">
          <section class="path-hero">
            <div class="hero-copy">
              <div class="path-meta">
                <span>{{ selectedPath.phaseLabel }}</span>
                <span>{{ selectedPath.audience }}</span>
              </div>
              <h2>{{ selectedPath.title }}</h2>
              <p class="reframe">{{ selectedPath.reframe }}</p>
              <div class="block-line">
                <span>当前卡点</span>
                <strong>{{ selectedPath.currentBlock }}</strong>
              </div>
            </div>

            <div class="primary-book">
              <span>{{ selectedPath.primaryBook.role }}</span>
              <h3>{{ selectedPath.primaryBook.title }}</h3>
              <p>{{ selectedPath.primaryBook.reason }}</p>
              <button class="primary-btn" @click="$emit('openBook', selectedPath.primaryBook.slug)">打开主书</button>
            </div>
          </section>

          <section class="axis-strip">
            <article
              v-for="axis in selectedPath.axes"
              :key="axis.id"
              class="axis-card"
              :style="{ '--axis-color': axis.color }"
            >
              <span>{{ axis.label }}</span>
              <p>{{ axis.question }}</p>
            </article>
          </section>

          <section class="path-board">
            <div class="map-panel">
              <div class="panel-head">
                <div>
                  <div class="tool-kicker">Map</div>
                  <h3>6 层学习路径</h3>
                </div>
                <button class="ghost-btn" @click="copyPathSummary">复制路径</button>
              </div>

              <div class="stage-list">
                <button
                  v-for="(stage, index) in selectedPath.stages"
                  :key="stage.level"
                  class="stage-card"
                  :class="{ active: index === selectedStageIndex }"
                  @click="selectedStageIndex = index"
                >
                  <span class="stage-level">{{ stage.level }}</span>
                  <span class="stage-copy">
                    <strong>{{ stage.title }}</strong>
                    <small>{{ stage.userQuestion }}</small>
                  </span>
                </button>
              </div>

              <p v-if="copyStatus" class="copy-status">{{ copyStatus }}</p>
            </div>

            <div class="stage-detail">
              <div class="detail-head">
                <span>{{ selectedStage.level }}</span>
                <h3>{{ selectedStage.title }}</h3>
                <p>{{ selectedStage.userQuestion }}</p>
              </div>

              <div class="detail-block">
                <span>学习目标</span>
                <p>{{ selectedStage.learningGoal }}</p>
              </div>

              <div class="detail-block">
                <span>完成信号</span>
                <p>{{ selectedStage.completionSignal }}</p>
              </div>

              <div class="resource-block">
                <span>相关书与节点</span>
                <div v-if="selectedStage.resources.length" class="resource-list">
                  <article v-for="resource in selectedStage.resources" :key="resource.label" class="resource-row">
                    <div>
                      <strong>{{ resource.label }}</strong>
                      <small>{{ resource.type }}</small>
                      <p v-if="resource.note">{{ resource.note }}</p>
                    </div>
                    <button
                      v-if="canOpenResource(resource)"
                      class="resource-btn"
                      @click="openResource(resource)"
                    >
                      打开
                    </button>
                    <span v-else class="pending-badge">待接入</span>
                  </article>
                </div>
                <p v-else class="empty-resource">这一层先靠问题重述完成，不需要打开材料。</p>
              </div>
            </div>
          </section>

          <section class="practice-grid">
            <article class="practice-panel">
              <div class="tool-kicker">Practice · {{ selectedPath.practice.time }}</div>
              <h3>{{ selectedPath.practice.title }}</h3>
              <ol>
                <li v-for="step in selectedPath.practice.steps" :key="step">{{ step }}</li>
              </ol>
            </article>

            <article class="output-panel">
              <div class="tool-kicker">Output</div>
              <h3>{{ selectedPath.outputTask.title }}</h3>
              <ul>
                <li v-for="item in selectedPath.outputTask.format" :key="item">{{ item }}</li>
              </ul>
            </article>

            <article class="calibrator-panel">
              <div class="tool-kicker">{{ selectedPath.calibrator.title }}</div>
              <p>{{ selectedPath.calibrator.text }}</p>
              <small>{{ selectedPath.nextDecision }}</small>
            </article>
          </section>
        </main>
      </section>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import {
  defaultLearningPathId,
  learningPathSamples,
  resolveLearningPathId,
  upcomingLearningPaths,
} from '../data/learningPathData.js'

const props = defineProps({
  pathId: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['openBook', 'openNode', 'selectPath'])

const paths = learningPathSamples
const upcomingPaths = upcomingLearningPaths
const selectedPathId = ref(resolveLearningPathId(props.pathId || defaultLearningPathId))
const selectedStageIndex = ref(0)
const copyStatus = ref('')

const selectedPath = computed(() => paths.find((path) => path.id === selectedPathId.value) || paths[0])
const selectedStage = computed(() => selectedPath.value?.stages?.[selectedStageIndex.value] || selectedPath.value?.stages?.[0])

watch(
  () => props.pathId,
  (pathId) => {
    const nextPathId = resolveLearningPathId(pathId || defaultLearningPathId)
    if (nextPathId === selectedPathId.value) return
    selectedPathId.value = nextPathId
    selectedStageIndex.value = 0
  },
)

function selectPath(pathId) {
  const nextPathId = resolveLearningPathId(pathId)
  selectedPathId.value = nextPathId
  selectedStageIndex.value = 0
  emit('selectPath', nextPathId)
}

function canOpenResource(resource) {
  return Boolean(resource?.slug)
}

function openResource(resource) {
  if (!canOpenResource(resource)) return
  if (resource.nodeId) {
    emit('openNode', { slug: resource.slug, nodeId: resource.nodeId })
    return
  }
  emit('openBook', resource.slug)
}

async function copyPathSummary() {
  const text = buildPathSummary(selectedPath.value)
  try {
    await navigator.clipboard.writeText(text)
    copyStatus.value = '已复制这条学习路径'
  } catch {
    copyStatus.value = '浏览器暂时不能复制，可直接选中文本保存'
  }

  window.setTimeout(() => {
    copyStatus.value = ''
  }, 2200)
}

function buildPathSummary(path) {
  const stages = path.stages
    .map((stage) => `${stage.level} ${stage.title}: ${stage.learningGoal}`)
    .join('\n')

  return [
    `学习路径：${path.title}`,
    `问题重述：${path.reframe}`,
    `当前卡点：${path.currentBlock}`,
    `主书：${path.primaryBook.title}`,
    stages,
    `练习：${path.practice.title}`,
    `输出：${path.outputTask.title}`,
  ].join('\n')
}
</script>

<style scoped>
.learning-wrap {
  height: 100%;
  overflow-y: auto;
  overflow-x: hidden;
}

.learning-wrap::-webkit-scrollbar {
  width: 4px;
}

.learning-wrap::-webkit-scrollbar-thumb {
  background: var(--border-strong);
  border-radius: 999px;
}

.learning-scroll {
  max-width: 1280px;
  margin: 0 auto;
  padding: 20px 20px 72px;
}

.learning-workbench {
  display: grid;
  grid-template-columns: minmax(260px, 0.32fr) minmax(0, 1fr);
  gap: 16px;
}

.path-rail,
.path-hero,
.axis-card,
.map-panel,
.stage-detail,
.practice-panel,
.output-panel,
.calibrator-panel {
  border: 1px solid var(--border-default);
  border-radius: 8px;
  box-shadow: var(--shadow-sm);
}

.path-rail {
  align-self: start;
  background: rgba(247, 245, 240, 0.92);
  padding: 18px;
}

.rail-head h1 {
  margin: 10px 0 0;
  font-family: var(--font-serif);
  font-size: 30px;
  line-height: 1.12;
  color: var(--text-primary);
  overflow-wrap: anywhere;
}

.rail-head p,
.hero-copy p,
.primary-book p,
.axis-card p,
.detail-block p,
.resource-row p,
.calibrator-panel p,
.queued-item p {
  color: var(--text-secondary);
  line-height: 1.72;
  overflow-wrap: anywhere;
}

.rail-head p {
  margin-top: 12px;
  font-size: 13px;
}

.tool-kicker,
.rail-label,
.path-meta,
.detail-block span,
.resource-block > span,
.primary-book > span {
  font-size: 10px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--text-muted);
}

.path-options,
.queued-list {
  margin-top: 18px;
  display: grid;
  gap: 10px;
}

.path-option {
  width: 100%;
  border: 1px solid var(--border-default);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.76);
  padding: 12px;
  text-align: left;
  cursor: pointer;
  display: grid;
  gap: 4px;
  transition: background 0.18s ease, border-color 0.18s ease, transform 0.18s ease;
}

.path-option:hover,
.path-option.active {
  border-color: rgba(32, 79, 103, 0.28);
  background: var(--brand-soft);
}

.path-option.active {
  transform: translateY(-1px);
}

.path-option span,
.queued-item span {
  color: var(--accent);
  font-size: 10px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.path-option strong,
.queued-item strong {
  color: var(--text-primary);
  font-size: 14px;
  line-height: 1.35;
}

.path-option small {
  color: var(--text-tertiary);
  font-size: 12px;
  line-height: 1.5;
}

.queued-item {
  border-left: 2px solid rgba(191, 111, 63, 0.36);
  padding-left: 10px;
}

.queued-item p {
  margin-top: 5px;
  font-size: 12px;
}

.path-main {
  min-width: 0;
  display: grid;
  gap: 14px;
}

.path-hero {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(250px, 0.38fr);
  overflow: hidden;
  background: rgba(255, 255, 255, 0.86);
}

.hero-copy,
.primary-book {
  padding: 24px;
}

.hero-copy {
  background:
    linear-gradient(135deg, rgba(32, 79, 103, 0.08), rgba(191, 111, 63, 0.06)),
    rgba(255, 255, 255, 0.84);
}

.path-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.path-meta span {
  padding: 3px 8px;
  border: 1px solid rgba(32, 79, 103, 0.14);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.58);
}

.hero-copy h2 {
  margin: 14px 0 0;
  font-family: var(--font-serif);
  font-size: clamp(30px, 4vw, 48px);
  line-height: 1.08;
  color: var(--text-primary);
  overflow-wrap: anywhere;
}

.reframe {
  margin-top: 14px;
  max-width: 760px;
  font-size: 15px;
}

.block-line {
  margin-top: 18px;
  padding: 13px 14px;
  border: 1px solid rgba(32, 79, 103, 0.12);
  border-radius: 8px;
  background: rgba(247, 245, 240, 0.76);
  display: grid;
  gap: 5px;
}

.block-line span {
  color: var(--text-muted);
  font-size: 11px;
}

.block-line strong {
  color: var(--text-primary);
  font-size: 14px;
  line-height: 1.55;
  overflow-wrap: anywhere;
}

.primary-book {
  border-left: 1px solid var(--border-default);
  background: rgba(247, 245, 240, 0.9);
  display: flex;
  flex-direction: column;
}

.primary-book h3 {
  margin: 10px 0 0;
  font-family: var(--font-serif);
  font-size: 26px;
  color: var(--brand);
  line-height: 1.2;
  overflow-wrap: anywhere;
}

.primary-book p {
  margin-top: 12px;
  font-size: 13px;
}

.primary-btn,
.ghost-btn,
.resource-btn {
  border-radius: 8px;
  cursor: pointer;
  white-space: nowrap;
}

.primary-btn {
  margin-top: auto;
  align-self: flex-start;
  border: 1px solid transparent;
  background: var(--brand);
  color: #f7f5f0;
  padding: 10px 13px;
  font-size: 13px;
}

.ghost-btn {
  border: 1px solid var(--border-default);
  background: rgba(255, 255, 255, 0.72);
  color: var(--text-secondary);
  padding: 8px 11px;
  font-size: 12px;
}

.axis-strip {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
}

.axis-card {
  border-color: color-mix(in srgb, var(--axis-color) 28%, var(--border-default));
  background: rgba(255, 255, 255, 0.82);
  padding: 16px;
}

.axis-card span {
  color: var(--axis-color);
  font-weight: 700;
  font-size: 13px;
}

.axis-card p {
  margin-top: 8px;
  font-size: 13px;
}

.path-board {
  display: grid;
  grid-template-columns: minmax(320px, 0.45fr) minmax(0, 1fr);
  gap: 14px;
}

.map-panel,
.stage-detail {
  background: rgba(255, 255, 255, 0.84);
  padding: 18px;
}

.panel-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.panel-head h3,
.detail-head h3,
.practice-panel h3,
.output-panel h3 {
  margin: 5px 0 0;
  font-family: var(--font-serif);
  color: var(--text-primary);
  line-height: 1.22;
}

.panel-head h3 {
  font-size: 24px;
}

.stage-list {
  margin-top: 14px;
  display: grid;
  gap: 9px;
}

.stage-card {
  width: 100%;
  min-height: 70px;
  border: 1px solid var(--border-default);
  border-radius: 8px;
  background: rgba(247, 245, 240, 0.7);
  color: inherit;
  padding: 10px;
  display: grid;
  grid-template-columns: 48px minmax(0, 1fr);
  gap: 10px;
  text-align: left;
  cursor: pointer;
  transition: background 0.18s ease, border-color 0.18s ease;
}

.stage-card:hover,
.stage-card.active {
  border-color: rgba(32, 79, 103, 0.28);
  background: var(--brand-soft);
}

.stage-level,
.detail-head span {
  width: 44px;
  height: 44px;
  border-radius: 8px;
  background: var(--bg-deep);
  color: var(--text-on-dark);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-serif);
  font-size: 18px;
}

.stage-copy {
  min-width: 0;
  display: grid;
  gap: 4px;
}

.stage-copy strong {
  color: var(--text-primary);
  font-size: 14px;
}

.stage-copy small {
  color: var(--text-tertiary);
  font-size: 12px;
  line-height: 1.45;
}

.copy-status {
  margin-top: 10px;
  color: var(--accent);
  font-size: 12px;
}

.stage-detail {
  display: grid;
  gap: 14px;
}

.detail-head {
  display: grid;
  grid-template-columns: 52px minmax(0, 1fr);
  column-gap: 12px;
  align-items: center;
}

.detail-head span {
  grid-row: span 2;
}

.detail-head h3 {
  font-size: 30px;
  overflow-wrap: anywhere;
}

.detail-head p {
  margin-top: 4px;
  color: var(--text-tertiary);
  font-size: 13px;
  line-height: 1.55;
  overflow-wrap: anywhere;
}

.detail-block,
.resource-block {
  border-top: 1px solid rgba(32, 79, 103, 0.1);
  padding-top: 13px;
}

.detail-block p {
  margin-top: 6px;
  font-size: 14px;
}

.resource-list {
  margin-top: 10px;
  display: grid;
  gap: 8px;
}

.resource-row {
  border: 1px solid var(--border-default);
  border-radius: 8px;
  background: rgba(247, 245, 240, 0.64);
  padding: 11px;
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 10px;
  align-items: center;
}

.resource-row strong {
  display: block;
  color: var(--text-primary);
  font-size: 13px;
  line-height: 1.4;
  overflow-wrap: anywhere;
}

.resource-row small {
  display: block;
  margin-top: 3px;
  color: var(--text-muted);
  font-size: 11px;
}

.resource-row p,
.empty-resource {
  margin-top: 5px;
  font-size: 12px;
}

.empty-resource {
  color: var(--text-tertiary);
  line-height: 1.6;
}

.resource-btn {
  border: 1px solid rgba(32, 79, 103, 0.16);
  background: rgba(32, 79, 103, 0.08);
  color: var(--brand);
  padding: 7px 10px;
  font-size: 12px;
}

.pending-badge {
  border: 1px solid rgba(191, 111, 63, 0.18);
  border-radius: 8px;
  background: rgba(191, 111, 63, 0.08);
  color: var(--accent);
  padding: 6px 8px;
  font-size: 11px;
  white-space: nowrap;
}

.practice-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.1fr) minmax(0, 1fr) minmax(250px, 0.8fr);
  gap: 12px;
}

.practice-panel,
.output-panel,
.calibrator-panel {
  background: rgba(255, 255, 255, 0.84);
  padding: 18px;
}

.practice-panel h3,
.output-panel h3 {
  font-size: 22px;
}

.practice-panel ol,
.output-panel ul {
  margin: 14px 0 0;
  padding-left: 19px;
  color: var(--text-secondary);
  font-size: 13px;
  line-height: 1.75;
}

.practice-panel li,
.output-panel li {
  padding-left: 3px;
  overflow-wrap: anywhere;
}

.calibrator-panel {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.calibrator-panel p {
  font-family: var(--font-serif);
  font-size: 20px;
  line-height: 1.55;
  color: var(--brand);
}

.calibrator-panel small {
  margin-top: auto;
  color: var(--text-tertiary);
  line-height: 1.6;
}

@media (max-width: 1080px) {
  .learning-workbench,
  .path-hero,
  .path-board,
  .practice-grid {
    grid-template-columns: 1fr;
  }

  .path-rail {
    position: static;
  }

  .path-options {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .primary-book {
    border-left: none;
    border-top: 1px solid var(--border-default);
  }
}

@media (max-width: 720px) {
  .learning-scroll {
    padding: 14px 12px 56px;
  }

  .path-rail,
  .hero-copy,
  .primary-book,
  .map-panel,
  .stage-detail,
  .practice-panel,
  .output-panel,
  .calibrator-panel {
    padding: 14px;
  }

  .path-options,
  .axis-strip {
    grid-template-columns: 1fr;
  }

  .hero-copy h2 {
    font-size: 30px;
  }

  .path-meta {
    display: grid;
  }

  .panel-head,
  .resource-row {
    align-items: stretch;
  }

  .resource-row {
    grid-template-columns: 1fr;
  }

  .resource-btn,
  .pending-badge {
    justify-self: start;
  }

  .detail-head {
    grid-template-columns: 1fr;
  }

  .detail-head span {
    grid-row: auto;
  }

  .detail-head h3 {
    font-size: 26px;
  }

  .stage-card {
    grid-template-columns: 42px minmax(0, 1fr);
  }

  .stage-level,
  .detail-head span {
    width: 40px;
    height: 40px;
    font-size: 16px;
  }
}
</style>
