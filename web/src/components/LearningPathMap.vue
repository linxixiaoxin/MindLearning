<template>
  <div class="learning-wrap">
    <div class="learning-scroll">
      <section class="learning-workbench">
        <aside class="path-rail">
          <div class="rail-head">
            <div class="tool-kicker">从卡点进入 · 练习路线</div>
            <h1>练习路线地图</h1>
            <p>从一个具体卡点出发，把要读的书、要补的概念、要做的练习和要产出的东西排成一条路。</p>
          </div>

          <div class="path-options" aria-label="练习路线样张">
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
            <div class="rail-label">待补路线</div>
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
                <span>这条路要处理的卡点</span>
                <strong>{{ selectedPath.currentBlock }}</strong>
              </div>
            </div>

            <div class="primary-book">
              <span>{{ selectedPath.primaryBook.role }}</span>
              <h3>{{ selectedPath.primaryBook.title }}</h3>
              <p>{{ selectedPath.primaryBook.reason }}</p>
              <button class="primary-btn" @click="$emit('openBook', selectedPath.primaryBook.slug)">打开支撑书</button>
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

          <section class="visual-map-panel">
            <div class="panel-head visual-panel-head">
              <div>
                <div class="tool-kicker">Path Map</div>
                <h3>{{ visualModeTitle }}</h3>
              </div>
              <div class="visual-controls">
                <div class="visual-mode-switch" aria-label="视觉形态">
                  <button
                    v-for="mode in visualModes"
                    :key="mode.id"
                    class="visual-mode-btn"
                    :class="{ active: mode.id === visualMode }"
                    type="button"
                    @click="visualMode = mode.id"
                  >
                    {{ mode.label }}
                  </button>
                </div>
                <div class="visual-legend" aria-label="视觉图例">
                  <span v-for="axis in selectedPath.axes" :key="axis.id" :style="{ '--axis-color': axis.color }">
                    {{ axis.label }}
                  </span>
                </div>
              </div>
            </div>

            <div class="visual-map-shell">
              <svg
                v-if="visualMode === 'metro'"
                class="visual-map metro-map"
                viewBox="0 0 1120 430"
                role="img"
                aria-label="L0 到 L5 的练习路线视觉地图"
              >
                <defs>
                  <filter id="visual-card-shadow" x="-12%" y="-18%" width="124%" height="136%">
                    <feDropShadow dx="0" dy="8" stdDeviation="8" flood-color="#111b22" flood-opacity="0.12" />
                  </filter>
                  <marker id="visual-arrow" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto">
                    <path d="M 0 0 L 10 5 L 0 10 z" fill="#8aa0aa" />
                  </marker>
                </defs>

                <rect x="22" y="28" width="1076" height="374" rx="18" class="visual-bg" />

                <path class="metro-track-shadow" :d="visualMap.routePath" />
                <path class="metro-track" :d="visualMap.routePath" />

                <g
                  v-for="axis in visualMap.axes"
                  :key="axis.id"
                  class="axis-chip"
                  :style="{ '--axis-color': axis.color }"
                >
                  <path class="axis-link" :d="axis.linkPath" />
                  <rect :x="axis.x - 72" :y="axis.y - 24" width="144" height="48" rx="12" />
                  <text :x="axis.x" :y="axis.y" class="chip-title">{{ axis.label }}</text>
                </g>

                <g class="support-card book-card" @click="$emit('openBook', selectedPath.primaryBook.slug)">
                  <path class="support-link" :d="visualMap.book.linkPath" />
                  <rect :x="visualMap.book.x - 72" :y="visualMap.book.y - 28" width="144" height="56" rx="12" />
                  <text :x="visualMap.book.x" :y="visualMap.book.y - 6" class="support-title">主书</text>
                  <text :x="visualMap.book.x" :y="visualMap.book.y + 14" class="support-subtitle">
                    {{ visualMap.book.title }}
                  </text>
                </g>

                <g class="support-card action-card">
                  <path class="support-link" :d="visualMap.practice.linkPath" />
                  <rect :x="visualMap.practice.x - 76" :y="visualMap.practice.y - 28" width="152" height="56" rx="12" />
                  <text :x="visualMap.practice.x" :y="visualMap.practice.y - 6" class="support-title">7 天作品</text>
                  <text :x="visualMap.practice.x" :y="visualMap.practice.y + 14" class="support-subtitle">
                    {{ visualMap.practice.title }}
                  </text>
                </g>

                <g class="support-card output-card">
                  <path class="support-link" :d="visualMap.output.linkPath" />
                  <rect :x="visualMap.output.x - 80" :y="visualMap.output.y - 28" width="160" height="56" rx="12" />
                  <text :x="visualMap.output.x" :y="visualMap.output.y - 6" class="support-title">输出</text>
                  <text :x="visualMap.output.x" :y="visualMap.output.y + 14" class="support-subtitle">
                    {{ visualMap.output.title }}
                  </text>
                </g>

                <g
                  v-for="station in visualMap.stations"
                  :key="station.level"
                  class="metro-station"
                  :class="{ active: station.index === selectedStageIndex }"
                  role="button"
                  tabindex="0"
                  @click="selectedStageIndex = station.index"
                  @keyup.enter="selectedStageIndex = station.index"
                >
                  <circle :cx="station.x" :cy="station.y" r="24" class="station-halo" />
                  <circle :cx="station.x" :cy="station.y" r="17" class="station-dot" />
                  <text :x="station.x" :y="station.y + 5" class="station-level">{{ station.level }}</text>
                  <text :x="station.x" :y="station.y + 47" class="station-title">{{ station.title }}</text>
                </g>
              </svg>

              <svg
                v-else-if="visualMode === 'radar'"
                class="visual-map radar-map"
                viewBox="0 0 1120 430"
                role="img"
                aria-label="能力雷达坐标图"
              >
                <rect x="22" y="28" width="1076" height="374" rx="18" class="visual-bg" />

                <g class="radar-grid">
                  <polygon
                    v-for="ring in radarMap.rings"
                    :key="ring.id"
                    :points="ring.points"
                    class="radar-ring"
                  />
                  <line
                    v-for="axis in radarMap.axes"
                    :key="`axis-line-${axis.id}`"
                    :x1="radarMap.center.x"
                    :y1="radarMap.center.y"
                    :x2="axis.x2"
                    :y2="axis.y2"
                    class="radar-axis-line"
                  />
                </g>

                <polygon :points="radarMap.polygon" class="radar-area" />

                <g
                  v-for="axis in radarMap.axes"
                  :key="axis.id"
                  class="radar-axis-label"
                  :style="{ '--axis-color': axis.color }"
                  role="button"
                  tabindex="0"
                  @click="selectedStageIndex = axis.stageIndex"
                  @keyup.enter="selectedStageIndex = axis.stageIndex"
                >
                  <circle :cx="axis.point.x" :cy="axis.point.y" r="8" class="radar-point" />
                  <rect :x="axis.labelX - 64" :y="axis.labelY - 25" width="128" height="50" rx="12" />
                  <text :x="axis.labelX" :y="axis.labelY - 6" class="radar-label-title">{{ axis.label }}</text>
                  <text :x="axis.labelX" :y="axis.labelY + 13" class="radar-label-subtitle">{{ axis.value }}%</text>
                </g>

                <g class="radar-readout">
                  <rect x="72" y="66" width="220" height="94" rx="14" />
                  <text x="92" y="98" class="readout-kicker">当前焦点</text>
                  <text x="92" y="126" class="readout-title">
                    {{ selectedStage.level }} · {{ selectedStage.title }}
                  </text>
                </g>

                <g
                  v-for="stage in radarMap.stages"
                  :key="stage.level"
                  class="radar-stage-pill"
                  :class="{ active: stage.index === selectedStageIndex }"
                  role="button"
                  tabindex="0"
                  @click="selectedStageIndex = stage.index"
                  @keyup.enter="selectedStageIndex = stage.index"
                >
                  <rect :x="stage.x - 58" :y="stage.y - 20" width="116" height="40" rx="20" />
                  <text :x="stage.x" :y="stage.y + 4">{{ stage.level }} · {{ stage.title }}</text>
                </g>
              </svg>

              <svg
                v-else-if="visualMode === 'center'"
                class="visual-map center-map"
                viewBox="0 0 1120 430"
                role="img"
                aria-label="中心辐射结构图"
              >
                <rect x="22" y="28" width="1076" height="374" rx="18" class="visual-bg" />
                <circle :cx="centerMap.center.x" :cy="centerMap.center.y" r="166" class="center-orbit outer" />
                <circle :cx="centerMap.center.x" :cy="centerMap.center.y" r="94" class="center-orbit inner" />

                <path
                  v-for="link in centerMap.links"
                  :key="link.id"
                  :d="link.path"
                  class="center-spoke"
                />

                <g class="center-core">
                  <circle :cx="centerMap.center.x" :cy="centerMap.center.y" r="62" />
                  <text :x="centerMap.center.x" :y="centerMap.center.y - 12" class="center-core-kicker">能力中心</text>
                  <text :x="centerMap.center.x" :y="centerMap.center.y + 14" class="center-core-title">
                    {{ centerMap.title }}
                  </text>
                </g>

                <g
                  v-for="axis in centerMap.axes"
                  :key="axis.id"
                  class="center-axis-chip"
                  :style="{ '--axis-color': axis.color }"
                  role="button"
                  tabindex="0"
                  @click="selectedStageIndex = axis.stageIndex"
                  @keyup.enter="selectedStageIndex = axis.stageIndex"
                >
                  <rect :x="axis.x - 48" :y="axis.y - 18" width="96" height="36" rx="18" />
                  <text :x="axis.x" :y="axis.y + 4">{{ axis.label }}</text>
                </g>

                <g
                  v-for="node in centerMap.nodes"
                  :key="node.level"
                  class="center-node"
                  :class="{ active: node.index === selectedStageIndex }"
                  role="button"
                  tabindex="0"
                  @click="selectedStageIndex = node.index"
                  @keyup.enter="selectedStageIndex = node.index"
                >
                  <circle :cx="node.x" :cy="node.y" r="36" />
                  <text :x="node.x" :y="node.y - 4" class="center-node-level">{{ node.level }}</text>
                  <text :x="node.x" :y="node.y + 18" class="center-node-title">{{ node.title }}</text>
                </g>

                <g class="center-support book-card" @click="$emit('openBook', selectedPath.primaryBook.slug)">
                  <rect :x="centerMap.book.x - 74" :y="centerMap.book.y - 28" width="148" height="56" rx="12" />
                  <text :x="centerMap.book.x" :y="centerMap.book.y - 6" class="support-title">主书</text>
                  <text :x="centerMap.book.x" :y="centerMap.book.y + 14" class="support-subtitle">
                    {{ centerMap.book.title }}
                  </text>
                </g>

                <g class="center-support action-card">
                  <rect :x="centerMap.practice.x - 82" :y="centerMap.practice.y - 28" width="164" height="56" rx="12" />
                  <text :x="centerMap.practice.x" :y="centerMap.practice.y - 6" class="support-title">7 天作品</text>
                  <text :x="centerMap.practice.x" :y="centerMap.practice.y + 14" class="support-subtitle">
                    {{ centerMap.practice.title }}
                  </text>
                </g>

                <g class="center-support output-card">
                  <rect :x="centerMap.output.x - 82" :y="centerMap.output.y - 28" width="164" height="56" rx="12" />
                  <text :x="centerMap.output.x" :y="centerMap.output.y - 6" class="support-title">输出</text>
                  <text :x="centerMap.output.x" :y="centerMap.output.y + 14" class="support-subtitle">
                    {{ centerMap.output.title }}
                  </text>
                </g>
              </svg>

              <svg
                v-else
                class="visual-map cloud-map"
                viewBox="0 0 1120 430"
                role="img"
                aria-label="练习路线词云图"
              >
                <rect x="22" y="28" width="1076" height="374" rx="18" class="visual-bg" />
                <path class="cloud-current" :d="cloudMap.currentPath" />

                <g
                  v-for="word in cloudMap.words"
                  :key="word.id"
                  class="cloud-word"
                  :class="{ active: word.stageIndex === selectedStageIndex }"
                  :style="{ '--word-color': word.color, '--word-fill': word.fill }"
                  role="button"
                  tabindex="0"
                  @click="selectVisualWord(word)"
                  @keyup.enter="selectVisualWord(word)"
                >
                  <rect
                    :x="word.x - word.width / 2"
                    :y="word.y - word.height / 2"
                    :width="word.width"
                    :height="word.height"
                    :rx="word.height / 2"
                  />
                  <text :x="word.x" :y="word.y + word.textOffset" :font-size="word.fontSize">
                    {{ word.text }}
                  </text>
                </g>

                <g class="cloud-readout">
                  <rect x="802" y="294" width="238" height="72" rx="14" />
                  <text x="824" y="322" class="readout-kicker">点击词块聚焦</text>
                  <text x="824" y="348" class="readout-title">
                    {{ selectedStage.level }} · {{ selectedStage.title }}
                  </text>
                </g>
              </svg>
            </div>
          </section>

          <section class="mermaid-panel">
            <div class="panel-head">
              <div>
                <div class="tool-kicker">Structure</div>
                <h3>从理解到输出的 6 层结构</h3>
              </div>
              <div class="diagram-actions">
                <button class="ghost-btn" @click="renderMermaidMap">刷新图</button>
                <button class="ghost-btn" @click="copyMermaidSource">复制结构源码</button>
              </div>
            </div>

            <div class="mermaid-shell" aria-label="练习路线结构图">
              <div ref="mermaidContainer" class="mermaid-map"></div>
              <pre v-if="mermaidRenderError" class="mermaid-error">{{ mermaidRenderError }}</pre>
            </div>

            <p v-if="mermaidCopyStatus" class="copy-status">{{ mermaidCopyStatus }}</p>
          </section>

          <section class="path-board">
            <div class="map-panel">
              <div class="panel-head">
                <div>
                  <div class="tool-kicker">Route</div>
                  <h3>6 层练习路线</h3>
                </div>
                <button class="ghost-btn" @click="copyPathSummary">复制路线</button>
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
                <span>这一层要看清什么</span>
                <p>{{ selectedStage.learningGoal }}</p>
              </div>

              <div class="detail-block">
                <span>做到什么算过关</span>
                <p>{{ selectedStage.completionSignal }}</p>
              </div>

              <div class="resource-block">
                <span>支撑书与知识节点</span>
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
              <div class="tool-kicker">今天练什么 · {{ selectedPath.practice.time }}</div>
              <h3>{{ selectedPath.practice.title }}</h3>
              <ol>
                <li v-for="step in selectedPath.practice.steps" :key="step">{{ step }}</li>
              </ol>
            </article>

            <article class="output-panel">
              <div class="tool-kicker">最后产出</div>
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
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import {
  defaultLearningPathId,
  learningPathSamples,
  resolveLearningPathId,
  upcomingLearningPaths,
} from '../data/learningPathData.js'

const mermaidConfig = {
  startOnLoad: false,
  securityLevel: 'strict',
  theme: 'base',
  themeVariables: {
    primaryColor: '#f7f5f0',
    primaryTextColor: '#15222b',
    primaryBorderColor: '#ddd6ca',
    lineColor: '#8ea2ad',
    secondaryColor: '#dce7eb',
    tertiaryColor: '#fff8f1',
    fontFamily: 'Aptos, Segoe UI, PingFang SC, Microsoft YaHei, sans-serif',
    fontSize: '15px',
  },
  flowchart: {
    curve: 'basis',
    htmlLabels: true,
    nodeSpacing: 34,
    rankSpacing: 44,
    padding: 14,
  },
}

let mermaidApiPromise
const initialLocationSearch = typeof window !== 'undefined' ? window.location.search : ''

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
const mermaidContainer = ref(null)
const mermaidCopyStatus = ref('')
const mermaidRenderError = ref('')
const visualModes = [
  { id: 'metro', label: '路线', title: '从卡点到输出' },
  { id: 'radar', label: '能力', title: '这条路要补哪几块' },
  { id: 'center', label: '中心', title: '围绕核心能力展开' },
  { id: 'cloud', label: '词云', title: '关键词轻重分布' },
]
const visualMode = ref(getInitialVisualMode())
let mermaidRenderRun = 0

const selectedPath = computed(() => paths.find((path) => path.id === selectedPathId.value) || paths[0])
const selectedStage = computed(() => selectedPath.value?.stages?.[selectedStageIndex.value] || selectedPath.value?.stages?.[0])
const mermaidSource = computed(() => buildLearningPathMermaid(selectedPath.value, selectedStageIndex.value))
const visualMap = computed(() => buildVisualLearningMap(selectedPath.value))
const radarMap = computed(() => buildRadarVisualMap(selectedPath.value, selectedStageIndex.value))
const centerMap = computed(() => buildCenterVisualMap(selectedPath.value))
const cloudMap = computed(() => buildCloudVisualMap(selectedPath.value))
const visualModeTitle = computed(() => visualModes.find((mode) => mode.id === visualMode.value)?.title || '练习路线图')

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

function selectVisualWord(word) {
  if (!Number.isInteger(word?.stageIndex)) return
  selectedStageIndex.value = word.stageIndex
}

function getInitialVisualMode() {
  if (typeof window === 'undefined') return 'metro'
  const mode = new URLSearchParams(
    window.__RED_BOOK_INITIAL_SEARCH__ || initialLocationSearch || window.location.search,
  ).get('visual')
  return visualModes.some((item) => item.id === mode) ? mode : 'metro'
}

onMounted(() => {
  renderMermaidMap()
})

onBeforeUnmount(() => {
  mermaidRenderRun += 1
})

watch(
  mermaidSource,
  () => {
    renderMermaidMap()
  },
  { flush: 'post' },
)

async function renderMermaidMap() {
  await nextTick()
  const target = mermaidContainer.value
  if (!target) return

  const runId = mermaidRenderRun + 1
  mermaidRenderRun = runId
  mermaidRenderError.value = ''
    target.innerHTML = '<div class="mermaid-loading">正在生成路线结构...</div>'

  try {
    const mermaidApi = await getMermaidApi()
    const renderId = `learning-path-map-${selectedPath.value.id}-${runId}`
    const { svg } = await mermaidApi.render(renderId, mermaidSource.value)
    if (runId !== mermaidRenderRun) return
    target.innerHTML = svg
  } catch (error) {
    if (runId !== mermaidRenderRun) return
    target.innerHTML = ''
    mermaidRenderError.value = [
      '结构图渲染失败，已保留可复制源码用于排查。',
      error?.message || String(error),
      '',
      mermaidSource.value,
    ].join('\n')
  }
}

async function getMermaidApi() {
  if (!mermaidApiPromise) {
    mermaidApiPromise = import('mermaid').then(({ default: mermaidApi }) => {
      mermaidApi.initialize(mermaidConfig)
      return mermaidApi
    })
  }

  return mermaidApiPromise
}

async function copyMermaidSource() {
  try {
    await navigator.clipboard.writeText(mermaidSource.value)
    mermaidCopyStatus.value = '已复制结构图源码'
  } catch {
    mermaidCopyStatus.value = '浏览器暂时不能复制，可展开错误区或从源码里取图'
  }

  window.setTimeout(() => {
    mermaidCopyStatus.value = ''
  }, 2200)
}

async function copyPathSummary() {
  const text = buildPathSummary(selectedPath.value)
  try {
    await navigator.clipboard.writeText(text)
    copyStatus.value = '已复制这条练习路线'
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
    `练习路线：${path.title}`,
    `问题重述：${path.reframe}`,
    `当前卡点：${path.currentBlock}`,
    `主书：${path.primaryBook.title}`,
    stages,
    `练习：${path.practice.title}`,
    `输出：${path.outputTask.title}`,
  ].join('\n')
}

function buildVisualLearningMap(path) {
  const stages = path?.stages || []
  const stationPositions = [
    { x: 150, y: 236 },
    { x: 310, y: 150 },
    { x: 470, y: 236 },
    { x: 630, y: 150 },
    { x: 790, y: 236 },
    { x: 950, y: 150 },
  ]
  const stations = stages.map((stage, index) => ({
    ...stage,
    index,
    level: stage.level,
    x: stationPositions[index]?.x || 150 + index * 160,
    y: stationPositions[index]?.y || 236,
    shortSignal: compactVisualText(stage.completionSignal, 12),
  }))
  const axisPositions = [
    { x: 300, y: 340 },
    { x: 530, y: 350 },
    { x: 760, y: 340 },
  ]
  const routePath = buildSmoothRoute(stations)
  const axes = path.axes.map((axis, index) => {
    const position = axisPositions[index] || { x: 300 + index * 220, y: 340 }
    const target = stations[axisTargetIndex(axis, index, stages)] || stations[0]
    return {
      ...axis,
      ...position,
      shortQuestion: compactVisualText(axis.question, 13),
      linkPath: buildSoftLink(position, target),
    }
  })

  return {
    routePath,
    stations,
    axes,
    book: {
      x: 230,
      y: 82,
      title: compactVisualText(path.primaryBook?.title, 10),
      linkPath: buildSoftLink({ x: 230, y: 110 }, stations[Math.min(1, stations.length - 1)] || stations[0]),
    },
    practice: {
      x: 810,
      y: 82,
      title: compactVisualText(path.practice?.title, 10),
      linkPath: buildSoftLink({ x: 810, y: 110 }, stations[Math.max(stations.length - 2, 0)] || stations[0]),
    },
    output: {
      x: 990,
      y: 310,
      title: compactVisualText(path.outputTask?.title, 10),
      linkPath: buildSoftLink({ x: 990, y: 282 }, stations[Math.max(stations.length - 1, 0)] || stations[0]),
    },
  }
}

function buildRadarVisualMap(path, activeStageIndex = 0) {
  const stages = path?.stages || []
  const axes = path?.axes || []
  const center = { x: 560, y: 204 }
  const radius = 122
  const angles = axes.map((_, index) => -90 + (360 / Math.max(axes.length, 1)) * index)
  const rings = [0.36, 0.63, 0.9].map((scale, index) => ({
    id: `ring-${index}`,
    points: angles.map((angle) => pointString(polarPoint(center, radius * scale, angle))).join(' '),
  }))
  const axisModels = axes.map((axis, index) => {
    const angle = angles[index] ?? -90
    const stageIndex = axisTargetIndex(axis, index, stages)
    const score = radarFocusScore(axis, index, stages, activeStageIndex)
    const endPoint = polarPoint(center, radius, angle)
    const labelPoint = polarPoint(center, radius + 74, angle)
    const point = polarPoint(center, radius * score, angle)
    return {
      ...axis,
      index,
      stageIndex,
      value: Math.round(score * 100),
      point,
      x2: endPoint.x,
      y2: endPoint.y,
      labelX: clampNumber(labelPoint.x, 112, 1008),
      labelY: clampNumber(labelPoint.y, 66, 364),
    }
  })
  const stageSpacing = 840 / Math.max(stages.length - 1, 1)
  const stagePills = stages.map((stage, index) => ({
    ...stage,
    index,
    title: compactVisualText(stage.title, 5),
    x: 140 + index * stageSpacing,
    y: 356,
  }))

  return {
    center,
    rings,
    axes: axisModels,
    polygon: axisModels.map((axis) => pointString(axis.point)).join(' '),
    stages: stagePills,
  }
}

function buildCenterVisualMap(path) {
  const stages = path?.stages || []
  const center = { x: 560, y: 214 }
  const radius = 152
  const nodes = stages.map((stage, index) => {
    const angle = -90 + (360 / Math.max(stages.length, 1)) * index
    const point = polarPoint(center, radius, angle)
    return {
      ...stage,
      index,
      x: point.x,
      y: point.y,
      title: compactVisualText(stage.title, 5),
    }
  })
  const axisAngles = [-90, 30, 150]
  const axes = (path?.axes || []).map((axis, index) => {
    const point = polarPoint(center, 102, axisAngles[index] ?? -90)
    return {
      ...axis,
      x: point.x,
      y: point.y,
      stageIndex: axisTargetIndex(axis, index, stages),
    }
  })

  return {
    center,
    title: compactVisualText(path?.shortTitle || path?.title, 8),
    nodes,
    axes,
    links: nodes.map((node) => ({
      id: node.level,
      path: `M ${center.x} ${center.y} L ${node.x} ${node.y}`,
    })),
    book: {
      x: 178,
      y: 104,
      title: compactVisualText(path?.primaryBook?.title, 10),
    },
    practice: {
      x: 930,
      y: 104,
      title: compactVisualText(path?.practice?.title, 10),
    },
    output: {
      x: 930,
      y: 324,
      title: compactVisualText(path?.outputTask?.title, 10),
    },
  }
}

function buildCloudVisualMap(path) {
  const stages = path?.stages || []
  const axes = path?.axes || []
  const lastStageIndex = Math.max(stages.length - 1, 0)
  const defaultColor = '#204f67'
  const rawWords = [
    {
      id: 'path',
      text: compactVisualText(path?.shortTitle || path?.title, 9),
      stageIndex: 0,
      color: defaultColor,
      weight: 5,
    },
    ...axes.map((axis, index) => ({
      id: `axis-${axis.id}`,
      text: axis.label,
      stageIndex: axisTargetIndex(axis, index, stages),
      color: axis.color,
      weight: 4,
    })),
    ...stages.map((stage, index) => ({
      id: `stage-${stage.level}`,
      text: compactVisualText(stage.title, 7),
      stageIndex: index,
      color: axes[index % Math.max(axes.length, 1)]?.color || defaultColor,
      weight: index === 0 || index === lastStageIndex ? 4 : 3,
    })),
    {
      id: 'book',
      text: compactVisualText(path?.primaryBook?.title, 8),
      stageIndex: Math.min(1, lastStageIndex),
      color: '#bf6f3f',
      weight: 3,
    },
    {
      id: 'practice',
      text: compactVisualText(path?.practice?.title, 8),
      stageIndex: Math.max(lastStageIndex - 1, 0),
      color: '#5f7356',
      weight: 3,
    },
    {
      id: 'output',
      text: '作品证据',
      stageIndex: lastStageIndex,
      color: '#204f67',
      weight: 3,
    },
  ].filter((word) => word.text)
  const slots = [
    { x: 560, y: 112, fontSize: 34 },
    { x: 360, y: 118, fontSize: 28 },
    { x: 752, y: 118, fontSize: 28 },
    { x: 214, y: 184, fontSize: 23 },
    { x: 452, y: 198, fontSize: 30 },
    { x: 674, y: 204, fontSize: 26 },
    { x: 914, y: 184, fontSize: 22 },
    { x: 310, y: 282, fontSize: 24 },
    { x: 540, y: 304, fontSize: 25 },
    { x: 760, y: 284, fontSize: 22 },
    { x: 158, y: 324, fontSize: 18 },
    { x: 966, y: 244, fontSize: 18 },
    { x: 430, y: 356, fontSize: 18 },
    { x: 650, y: 356, fontSize: 18 },
  ]
  const words = rawWords.slice(0, slots.length).map((word, index) => {
    const slot = slots[index]
    const fontSize = slot.fontSize + Math.max(word.weight - 3, 0) * 2
    const width = cloudWordWidth(word.text, fontSize)
    const height = Math.max(34, fontSize + 18)
    return {
      ...word,
      x: slot.x,
      y: slot.y,
      fontSize,
      width,
      height,
      textOffset: Math.round(fontSize / 3),
      fill: `color-mix(in srgb, ${word.color} 12%, white)`,
    }
  })

  return {
    words,
    currentPath: 'M 130 220 C 250 108, 420 92, 560 176 S 830 300, 990 202',
  }
}

function buildSmoothRoute(stations) {
  if (!stations.length) return ''
  const [first, ...rest] = stations
  return rest.reduce((path, station, index) => {
    const previous = stations[index]
    const controlOffset = Math.max((station.x - previous.x) * 0.46, 48)
    return [
      path,
      `C ${previous.x + controlOffset} ${previous.y}`,
      `${station.x - controlOffset} ${station.y}`,
      `${station.x} ${station.y}`,
    ].join(' ')
  }, `M ${first.x} ${first.y}`)
}

function buildSoftLink(source, target) {
  if (!source || !target) return ''
  const midX = (source.x + target.x) / 2
  return `M ${source.x} ${source.y} C ${midX} ${source.y}, ${midX} ${target.y}, ${target.x} ${target.y}`
}

function radarFocusScore(axis, axisIndex, stages, activeStageIndex) {
  const targetIndex = axisTargetIndex(axis, axisIndex, stages)
  const distance = Math.abs(targetIndex - activeStageIndex)
  const proximity = Math.max(0, 1 - distance / Math.max(stages.length - 1, 1))
  return clampNumber(0.54 + axisIndex * 0.07 + proximity * 0.22, 0.42, 0.94)
}

function polarPoint(center, radius, angleDegrees) {
  const radians = (angleDegrees * Math.PI) / 180
  return {
    x: roundCoordinate(center.x + Math.cos(radians) * radius),
    y: roundCoordinate(center.y + Math.sin(radians) * radius),
  }
}

function pointString(point) {
  return `${point.x},${point.y}`
}

function cloudWordWidth(text, fontSize) {
  const length = [...String(text || '')].length
  return clampNumber(Math.round(length * fontSize * 0.9 + 34), 76, 236)
}

function clampNumber(value, min, max) {
  return Math.min(Math.max(value, min), max)
}

function roundCoordinate(value) {
  return Math.round(value * 10) / 10
}

function buildLearningPathMermaid(path, activeStageIndex = 0) {
  const stages = path?.stages || []
  const lastStageIndex = Math.max(stages.length - 1, 0)
  const practiceTargetIndex = Math.max(lastStageIndex - 1, 0)
  const primaryBookTargetIndex = Math.min(1, lastStageIndex)
  const lines = [
    '%% Auto-generated from learningPathData L0-L5. POC: show hierarchy, support inputs, and output loop.',
    'flowchart LR',
    `root["${mermaidNodeLabel('路径', path.shortTitle || path.title)}"]`,
    `book["${mermaidNodeLabel(path.primaryBook?.role || '主书', path.primaryBook?.title)}"]`,
    `practice["${mermaidNodeLabel('练习', path.practice?.title)}"]`,
    `output["${mermaidNodeLabel('输出', path.outputTask?.title)}"]`,
    `feedback["${mermaidNodeLabel('反馈', path.nextDecision)}"]`,
    ...path.axes.map((axis, index) => `axis${index}["${mermaidNodeLabel(axis.label, axis.question, 28)}"]`),
    ...stages.map((stage, index) => `stage${index}["${mermaidNodeLabel(`${stage.level} ${stage.title}`, stage.completionSignal, 30)}"]`),
    '',
    ...stages.slice(0, -1).map((_, index) => `stage${index} --> stage${index + 1}`),
    'root --> stage0',
    `book -.-> stage${primaryBookTargetIndex}`,
    `stage${practiceTargetIndex} --> practice`,
    `practice --> stage${lastStageIndex}`,
    `stage${lastStageIndex} --> output`,
    'output -.-> feedback',
    ...path.axes.map((axis, index) => `axis${index} -.-> stage${axisTargetIndex(axis, index, stages)}`),
    '',
    'classDef rootNode fill:#204f67,color:#f7f5f0,stroke:#173041,stroke-width:1px;',
    'classDef stageNode fill:#f7f5f0,color:#15222b,stroke:#ddd6ca,stroke-width:1px;',
    'classDef activeNode fill:#dce7eb,color:#15222b,stroke:#204f67,stroke-width:2px;',
    'classDef supportNode fill:#fff8f1,color:#15222b,stroke:#bf6f3f,stroke-width:1px;',
    'classDef actionNode fill:#eef4ed,color:#15222b,stroke:#5f7356,stroke-width:1px;',
    'class root rootNode;',
    `class ${stages.map((_, index) => `stage${index}`).join(',')} stageNode;`,
    `class stage${Math.min(activeStageIndex, lastStageIndex)} activeNode;`,
    `class book,${path.axes.map((_, index) => `axis${index}`).join(',')} supportNode;`,
    'class practice,output,feedback actionNode;',
  ]

  return lines.join('\n')
}

function axisTargetIndex(axis, axisIndex, stages) {
  const lastStageIndex = Math.max(stages.length - 1, 0)
  const targetById = {
    seeing: 0,
    judgement: 1,
    relationship: 2,
    system: 3,
    action: 3,
    expression: 4,
    narrative: 4,
  }

  return Math.min(targetById[axis.id] ?? axisIndex + 1, lastStageIndex)
}

function mermaidNodeLabel(title, subtitle = '', subtitleMaxLength = 24) {
  return [title, compactMermaidText(subtitle, subtitleMaxLength)]
    .filter(Boolean)
    .map(escapeMermaidLabel)
    .join('<br/>')
}

function compactMermaidText(text = '', maxLength = 24) {
  const normalized = String(text || '').replace(/\s+/g, ' ').trim()
  if (normalized.length <= maxLength) return normalized
  return `${normalized.slice(0, maxLength - 1)}…`
}

function compactVisualText(text = '', maxLength = 12) {
  const normalized = String(text || '').replace(/\s+/g, '').trim()
  if (normalized.length <= maxLength) return normalized
  return `${normalized.slice(0, maxLength - 1)}…`
}

function escapeMermaidLabel(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll('[', '【')
    .replaceAll(']', '】')
    .replaceAll('{', '〔')
    .replaceAll('}', '〕')
    .replaceAll('|', '｜')
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
.visual-map-panel,
.mermaid-panel,
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

.visual-map-panel,
.mermaid-panel,
.map-panel,
.stage-detail {
  background: rgba(255, 255, 255, 0.84);
  padding: 18px;
}

.visual-map-panel,
.mermaid-panel {
  min-width: 0;
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

.diagram-actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 8px;
}

.visual-panel-head {
  align-items: flex-start;
}

.visual-controls {
  display: grid;
  justify-items: end;
  gap: 8px;
  min-width: min(520px, 100%);
}

.visual-mode-switch {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 4px;
  border: 1px solid rgba(32, 79, 103, 0.12);
  border-radius: 8px;
  background: rgba(247, 245, 240, 0.72);
  padding: 4px;
}

.visual-mode-btn {
  border: 0;
  border-radius: 7px;
  background: transparent;
  color: var(--text-secondary);
  cursor: pointer;
  padding: 7px 10px;
  font-size: 12px;
  font-weight: 700;
  white-space: nowrap;
  transition: background 0.18s ease, color 0.18s ease, transform 0.18s ease;
}

.visual-mode-btn:hover {
  background: rgba(32, 79, 103, 0.08);
  color: var(--brand);
}

.visual-mode-btn.active {
  background: var(--brand);
  color: var(--text-on-dark);
  transform: translateY(-1px);
}

.visual-legend {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 8px;
}

.visual-legend span {
  border: 1px solid color-mix(in srgb, var(--axis-color) 34%, var(--border-default));
  border-radius: 999px;
  background: color-mix(in srgb, var(--axis-color) 12%, white);
  color: var(--axis-color);
  padding: 5px 9px;
  font-size: 12px;
  font-weight: 700;
}

.visual-map-shell {
  width: 100%;
  max-width: 100%;
  margin-top: 14px;
  border: 1px solid rgba(32, 79, 103, 0.12);
  border-radius: 8px;
  background:
    linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(247, 245, 240, 0.7)),
    rgba(255, 255, 255, 0.84);
  overflow-x: auto;
  overflow-y: hidden;
}

.visual-map {
  width: 100%;
  min-width: 0;
  height: auto;
  display: block;
}

.visual-bg {
  fill: rgba(255, 255, 255, 0.62);
  stroke: rgba(32, 79, 103, 0.08);
}

.visual-kicker {
  fill: var(--text-muted);
  font-size: 12px;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

.visual-title {
  fill: var(--text-primary);
  font-family: var(--font-serif);
  font-size: 28px;
  font-weight: 700;
}

.metro-track-shadow,
.metro-track {
  fill: none;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.metro-track-shadow {
  stroke: rgba(17, 27, 34, 0.12);
  stroke-width: 20;
}

.metro-track {
  stroke: var(--brand);
  stroke-width: 12;
  marker-end: url(#visual-arrow);
}

.metro-station {
  cursor: pointer;
  outline: none;
}

.station-halo {
  fill: #ffffff;
  stroke: var(--brand);
  stroke-width: 3;
  filter: url(#visual-card-shadow);
}

.station-dot {
  fill: var(--bg-deep);
}

.station-level,
.station-title,
.station-subtitle,
.chip-title,
.chip-subtitle,
.support-title,
.support-subtitle {
  text-anchor: middle;
  dominant-baseline: middle;
}

.station-level {
  fill: var(--text-on-dark);
  font-family: var(--font-serif);
  font-size: 14px;
  font-weight: 700;
}

.station-title {
  fill: var(--text-primary);
  font-size: 16px;
  font-weight: 800;
}

.station-subtitle {
  fill: var(--text-tertiary);
  font-size: 11px;
}

.metro-station.active .station-halo {
  fill: var(--brand-soft);
  stroke: var(--accent);
  stroke-width: 4;
}

.metro-station.active .station-dot {
  fill: var(--accent);
}

.axis-link,
.support-link {
  fill: none;
  stroke-dasharray: 4 5;
  stroke-linecap: round;
}

.axis-link {
  stroke: color-mix(in srgb, var(--axis-color) 58%, transparent);
  stroke-width: 1.6;
}

.axis-chip rect {
  fill: color-mix(in srgb, var(--axis-color) 10%, white);
  stroke: color-mix(in srgb, var(--axis-color) 46%, var(--border-default));
  filter: url(#visual-card-shadow);
}

.chip-title {
  fill: var(--axis-color);
  font-size: 13px;
  font-weight: 800;
}

.chip-subtitle,
.support-subtitle {
  fill: var(--text-secondary);
  font-size: 11px;
}

.support-card {
  cursor: pointer;
}

.support-link {
  stroke: rgba(32, 79, 103, 0.28);
  stroke-width: 1.5;
}

.support-card rect {
  fill: rgba(247, 245, 240, 0.92);
  stroke: rgba(191, 111, 63, 0.42);
  filter: url(#visual-card-shadow);
}

.action-card rect,
.output-card rect {
  fill: #eef4ed;
  stroke: rgba(95, 115, 86, 0.46);
}

.support-title {
  fill: var(--accent);
  font-size: 12px;
  font-weight: 800;
}

.action-card .support-title,
.output-card .support-title {
  fill: #5f7356;
}

.radar-ring {
  fill: none;
  stroke: rgba(32, 79, 103, 0.14);
  stroke-width: 1.2;
}

.radar-axis-line {
  stroke: rgba(32, 79, 103, 0.16);
  stroke-width: 1.3;
}

.radar-area {
  fill: rgba(32, 79, 103, 0.13);
  stroke: var(--brand);
  stroke-width: 2.4;
  stroke-linejoin: round;
}

.radar-axis-label,
.radar-stage-pill,
.center-axis-chip,
.center-node,
.cloud-word {
  cursor: pointer;
  outline: none;
}

.radar-axis-label rect {
  fill: color-mix(in srgb, var(--axis-color) 11%, white);
  stroke: color-mix(in srgb, var(--axis-color) 42%, var(--border-default));
}

.radar-point {
  fill: var(--axis-color);
  stroke: #ffffff;
  stroke-width: 3;
}

.radar-label-title,
.radar-label-subtitle,
.radar-stage-pill text,
.center-core text,
.center-axis-chip text,
.center-node text,
.cloud-word text {
  text-anchor: middle;
  dominant-baseline: middle;
}

.radar-label-title {
  fill: var(--axis-color);
  font-size: 14px;
  font-weight: 900;
}

.radar-label-subtitle {
  fill: var(--text-secondary);
  font-size: 12px;
  font-weight: 800;
}

.radar-readout rect,
.cloud-readout rect {
  fill: rgba(247, 245, 240, 0.84);
  stroke: rgba(32, 79, 103, 0.14);
}

.readout-kicker {
  fill: var(--text-muted);
  font-size: 11px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.readout-title {
  fill: var(--text-primary);
  font-size: 18px;
  font-weight: 900;
}

.radar-stage-pill rect {
  fill: rgba(255, 255, 255, 0.74);
  stroke: rgba(32, 79, 103, 0.14);
}

.radar-stage-pill text {
  fill: var(--text-primary);
  font-size: 13px;
  font-weight: 800;
}

.radar-stage-pill.active rect {
  fill: var(--brand-soft);
  stroke: var(--accent);
  stroke-width: 2.2;
}

.center-orbit {
  fill: none;
  stroke: rgba(32, 79, 103, 0.12);
  stroke-width: 1.4;
}

.center-orbit.outer {
  stroke-dasharray: 4 7;
}

.center-spoke {
  fill: none;
  stroke: rgba(32, 79, 103, 0.16);
  stroke-width: 1.4;
}

.center-core circle {
  fill: var(--brand);
  stroke: rgba(255, 255, 255, 0.72);
  stroke-width: 5;
}

.center-core-kicker {
  fill: rgba(247, 245, 240, 0.74);
  font-size: 11px;
  letter-spacing: 0.12em;
}

.center-core-title {
  fill: var(--text-on-dark);
  font-size: 18px;
  font-weight: 900;
}

.center-axis-chip rect {
  fill: color-mix(in srgb, var(--axis-color) 12%, white);
  stroke: color-mix(in srgb, var(--axis-color) 44%, var(--border-default));
}

.center-axis-chip text {
  fill: var(--axis-color);
  font-size: 13px;
  font-weight: 900;
}

.center-node circle {
  fill: rgba(255, 255, 255, 0.9);
  stroke: var(--brand);
  stroke-width: 2.4;
}

.center-node.active circle {
  fill: var(--brand-soft);
  stroke: var(--accent);
  stroke-width: 4;
}

.center-node-level {
  fill: var(--brand);
  font-family: var(--font-serif);
  font-size: 16px;
  font-weight: 900;
}

.center-node.active .center-node-level {
  fill: var(--accent);
}

.center-node-title {
  fill: var(--text-primary);
  font-size: 11px;
  font-weight: 800;
}

.center-support {
  cursor: pointer;
}

.center-support rect {
  fill: rgba(247, 245, 240, 0.92);
  stroke: rgba(191, 111, 63, 0.42);
}

.center-support.action-card rect,
.center-support.output-card rect {
  fill: #eef4ed;
  stroke: rgba(95, 115, 86, 0.46);
}

.cloud-current {
  fill: none;
  stroke: rgba(32, 79, 103, 0.07);
  stroke-linecap: round;
  stroke-width: 34;
}

.cloud-word rect {
  fill: var(--word-fill);
  stroke: color-mix(in srgb, var(--word-color) 42%, var(--border-default));
  stroke-width: 1.3;
}

.cloud-word text {
  fill: var(--word-color);
  font-weight: 900;
  pointer-events: none;
}

.cloud-word.active rect {
  fill: color-mix(in srgb, var(--word-color) 20%, white);
  stroke: var(--accent);
  stroke-width: 2.4;
}

.cloud-word.active text {
  fill: var(--accent);
}

.mermaid-shell {
  width: 100%;
  max-width: 100%;
  margin-top: 14px;
  border: 1px solid rgba(32, 79, 103, 0.12);
  border-radius: 8px;
  background:
    linear-gradient(135deg, rgba(255, 255, 255, 0.86), rgba(247, 245, 240, 0.72)),
    rgba(255, 255, 255, 0.82);
  overflow-x: auto;
  overflow-y: auto;
}

.mermaid-map {
  width: max-content;
  min-width: 100%;
  min-height: 320px;
  padding: 18px;
  display: flex;
  align-items: center;
}

.mermaid-loading {
  color: var(--text-tertiary);
  font-size: 13px;
}

.mermaid-map :deep(svg) {
  width: auto;
  min-width: 1120px;
  max-width: none;
  height: 270px;
  display: block;
}

.mermaid-map :deep(.node rect),
.mermaid-map :deep(.node polygon),
.mermaid-map :deep(.node path) {
  rx: 8px;
  ry: 8px;
}

.mermaid-map :deep(.edgePath path) {
  stroke-width: 1.5px;
}

.mermaid-map :deep(.label),
.mermaid-map :deep(.nodeLabel) {
  font-family: var(--font-sans);
  line-height: 1.4;
}

.mermaid-error {
  margin: 0;
  border-top: 1px solid var(--border-default);
  background: rgba(191, 111, 63, 0.08);
  color: var(--accent);
  padding: 12px;
  font-size: 12px;
  line-height: 1.55;
  white-space: pre-wrap;
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
  .visual-map-panel,
  .mermaid-panel,
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

  .panel-head {
    flex-direction: column;
  }

  .diagram-actions {
    justify-content: flex-start;
    width: 100%;
  }

  .visual-controls {
    justify-items: stretch;
    width: 100%;
  }

  .visual-mode-switch {
    justify-content: flex-start;
    width: 100%;
  }

  .visual-mode-btn {
    flex: 1;
  }

  .visual-legend {
    justify-content: flex-start;
    width: 100%;
  }

  .diagram-actions .ghost-btn {
    flex: 1;
  }

  .mermaid-map {
    padding: 12px;
  }

  .visual-map {
    min-width: 900px;
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
