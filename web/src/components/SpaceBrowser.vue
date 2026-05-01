<template>
  <div class="space-browser">
    <header class="hero-bar">
      <div>
        <div class="hero-kicker">Spatial Knowledge Browser</div>
        <h1 class="hero-title">3D 地球书库</h1>
        <p class="hero-desc">把书、主题、地点和方法放进同一个可旋转世界里，从“查找”变成“探索”。</p>
      </div>

      <div class="hero-actions">
        <div class="search-wrap">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <circle cx="6.5" cy="6.5" r="4.5" stroke="currentColor" stroke-width="1.4" />
            <path d="M10.5 10.5L14 14" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" />
          </svg>
          <input v-model="query" placeholder="搜索书 / 主题 / 地点" />
        </div>

        <div class="filters">
          <button
            v-for="filter in filters"
            :key="filter.id"
            class="filter-chip"
            :class="{ active: selectedFilter === filter.id }"
            @click="selectedFilter = filter.id"
          >
            {{ filter.label }}
          </button>
        </div>
      </div>
    </header>

    <main class="browser-layout">
      <section class="browser-stage">
        <div class="sky-layer"></div>
        <div
          ref="viewportRef"
          class="viewport"
          @pointerdown="onPointerDown"
          @pointermove="onPointerMove"
          @pointerup="onPointerUp"
          @pointercancel="onPointerUp"
          @pointerleave="onPointerUp"
          @wheel.prevent="onWheel"
        >
          <div class="world-hint">拖动旋转 · 滚轮缩放 · 点击点位</div>

          <div class="camera" :style="cameraStyle">
            <div class="globe-shell">
              <div class="globe-core"></div>
              <div class="globe-grid globe-grid--lat"></div>
              <div class="globe-grid globe-grid--lng"></div>
              <div class="globe-glow"></div>

              <button
                v-for="item in visibleItems"
                :key="item.id"
                class="world-node"
                :class="[`world-node--${item.kind}`, { active: item.id === selectedItem?.id }]"
                :style="nodeStyle(item)"
                @click="selectItem(item)"
              >
                <span class="node-dot"></span>
                <span class="node-label">{{ item.title }}</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      <aside class="browser-panel">
        <div class="panel-card panel-card--featured">
          <div class="panel-kicker">当前视角</div>
          <h2 class="panel-title">{{ selectedItem?.title || '选择一个点位' }}</h2>
          <p class="panel-desc">{{ selectedItem?.summary || '点击地球上的点位，查看它与书页、专题页、学习路径的连接。' }}</p>

          <div v-if="selectedItem" class="panel-meta">
            <span class="meta-chip">{{ kindLabel(selectedItem.kind) }}</span>
            <span class="meta-chip">{{ selectedItem.era }}</span>
          </div>

          <div v-if="selectedItem" class="panel-tags">
            <span v-for="tag in selectedItem.tags" :key="tag" class="tag-chip">{{ tag }}</span>
          </div>

          <div v-if="selectedItem" class="panel-actions">
            <button class="primary-btn" @click="openItem(selectedItem)">打开内容</button>
            <button class="ghost-btn" @click="focusRandomItem">随机切换</button>
          </div>
        </div>

        <div class="panel-card">
          <div class="panel-kicker">空间地图说明</div>
          <ol class="explain-list">
            <li>每个点位对应一个书、主题、地点或方法。</li>
            <li>缩放后，点位密度会改变，形成“簇”的感觉。</li>
            <li>点击后进入现有书页 / 专题页 / 工具页。</li>
          </ol>
        </div>

        <div class="panel-card sample-card">
          <div class="panel-kicker">推荐入口</div>
          <div class="entry-list">
            <button v-for="item in spotlightItems" :key="item.id" class="entry-row" @click="selectItem(item)">
              <span class="entry-kind">{{ kindLabel(item.kind) }}</span>
              <span class="entry-title">{{ item.title }}</span>
            </button>
          </div>
        </div>
      </aside>
    </main>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'

const filters = [
  { id: 'all', label: '全部' },
  { id: 'book', label: '书' },
  { id: 'topic', label: '主题' },
  { id: 'tool', label: '工具' },
  { id: 'place', label: '地点' },
]

const items = [
  {
    id: 'thinking-fast-and-slow',
    kind: 'book',
    title: '思考，快与慢',
    summary: '判断、偏差与系统 1/2 的来回切换，是最适合挂在空间里的入口书之一。',
    tags: ['判断', '偏差', '思维'],
    era: '认知入口',
    lat: 18,
    lng: -38,
    targetUrl: '/books/thinking-fast-and-slow',
  },
  {
    id: 'nonviolent-communication',
    kind: 'book',
    title: '非暴力沟通',
    summary: '把语言、感受、需要和请求拆开，让关系的误听更容易被看见。',
    tags: ['关系', '表达', '需要'],
    era: '关系入口',
    lat: 10,
    lng: 118,
    targetUrl: '/books/nonviolent-communication',
  },
  {
    id: 'leadership-evolution',
    kind: 'book',
    title: '领导者的意识进化',
    summary: '从复杂度、成长边际和发展性实践切入，适合放在领导力簇的中心。',
    tags: ['领导力', '成长边际', '复杂度'],
    era: '能力入口',
    lat: 42,
    lng: 22,
    targetUrl: '/books/leadership-evolution',
  },
  {
    id: 'mindset-traps',
    kind: 'book',
    title: '走出心智的误区',
    summary: '用于判断自己是不是被看起来很有道理的解释带偏。',
    tags: ['误区', '诊断', '校正'],
    era: '校正入口',
    lat: -7,
    lng: -92,
    targetUrl: '/books/mindset-traps',
  },
  {
    id: 'travel-with-questions',
    kind: 'topic',
    title: '带着问题的旅行',
    summary: '把旅行从打卡变成观看训练，适合挂在地方与生活方式的交界处。',
    tags: ['旅行', '地方', '观看'],
    era: '主题入口',
    lat: -26,
    lng: 52,
    targetUrl: '/topics/travel-with-questions',
  },
  {
    id: 'thought-partner',
    kind: 'tool',
    title: '思想伙伴选配器',
    summary: '把困境转译成能力轴、作者伙伴和最小行动的系统入口。',
    tags: ['问题', '伙伴', '行动'],
    era: '工具入口',
    lat: 24,
    lng: 152,
    targetUrl: '/tools/thought-partner',
  },
  {
    id: 'problem-lab',
    kind: 'tool',
    title: '问题工作台',
    summary: '从原话、情绪、需求与问题结构出发，做成可交互的工作台。',
    tags: ['原话', '情绪', '需求'],
    era: '工具入口',
    lat: 58,
    lng: -132,
    targetUrl: '/tools/problem-lab',
  },
  {
    id: 'learning-paths',
    kind: 'tool',
    title: '学习路径地图',
    summary: '围绕一个问题，把书、卡片、练习和输出任务组织成路径。',
    tags: ['路径', '练习', '输出'],
    era: '工具入口',
    lat: -48,
    lng: -18,
    targetUrl: '/tools/learning-paths',
  },
  {
    id: 'content-ops',
    kind: 'tool',
    title: '选题中台',
    summary: '把真实场景、原话和选题结构串起来，服务内容生产。',
    tags: ['选题', '场景', '中台'],
    era: '生产入口',
    lat: 4,
    lng: -162,
    targetUrl: '/tools/content-ops',
  },
  {
    id: 'beijing-place',
    kind: 'place',
    title: '厦门 / 泉州',
    summary: '旅行专题的真实样本，把地方、问题和观察连成一条线。',
    tags: ['厦门', '泉州', '地方'],
    era: '地点入口',
    lat: -14,
    lng: 178,
    targetUrl: '/topics/travel-with-questions',
  },
  {
    id: 'event-lens',
    kind: 'tool',
    title: '社会事件入口',
    summary: '把热榜、事件和问题工作台连接起来，作为现实世界的采样口。',
    tags: ['热榜', '事件', '现实'],
    era: '外部入口',
    lat: 33,
    lng: 76,
    targetUrl: '/tools/event-lens',
  },
  {
    id: 'capability-paths',
    kind: 'tool',
    title: '职业 / 能力路径',
    summary: '把角色、能力和练习串成可视化路线，帮助用户看见成长方向。',
    tags: ['能力', '职业', '路线'],
    era: '路径入口',
    lat: -33,
    lng: 104,
    targetUrl: '/tools/capability-paths',
  },
]

const selectedFilter = ref('all')
const query = ref('')
const viewportRef = ref(null)
const selectedId = ref(items[0].id)
const rotationX = ref(-0.28)
const rotationY = ref(-0.18)
const zoom = ref(1)
const dragging = ref(false)
const dragOrigin = ref({ x: 0, y: 0, rotationX: 0, rotationY: 0 })
let rafId = 0

const visibleItems = computed(() => {
  const q = query.value.trim().toLowerCase()
  return items.filter((item) => {
    const typeMatch = selectedFilter.value === 'all' || item.kind === selectedFilter.value
    if (!typeMatch) return false
    if (!q) return true
    const text = [item.title, item.summary, item.era, ...(item.tags || [])].join(' ').toLowerCase()
    return text.includes(q)
  })
})

const spotlightItems = computed(() => visibleItems.value.slice(0, 4))
const selectedItem = computed(() => visibleItems.value.find((item) => item.id === selectedId.value) || visibleItems.value[0] || null)

const cameraStyle = computed(() => ({
  '--rot-x': `${rotationX.value}rad`,
  '--rot-y': `${rotationY.value}rad`,
  '--zoom': zoom.value,
}))

function kindLabel(kind) {
  return (
    {
      book: '书',
      topic: '主题',
      tool: '工具',
      place: '地点',
    }[kind] || kind
  )
}

function spherePosition(lat, lng, radius = 220) {
  const phi = (lat * Math.PI) / 180
  const theta = (lng * Math.PI) / 180
  const x = Math.cos(phi) * Math.sin(theta)
  const y = Math.sin(phi)
  const z = Math.cos(phi) * Math.cos(theta)
  return { x: x * radius, y: -y * radius, z: z * radius }
}

function nodeStyle(item) {
  const { x, y, z } = spherePosition(item.lat, item.lng)
  const depth = (z + 220) / 440
  const scale = 0.68 + depth * 0.42
  const opacity = 0.45 + depth * 0.55
  return {
    '--x': `${x}px`,
    '--y': `${y}px`,
    '--z': `${z}px`,
    '--scale': scale,
    opacity,
    zIndex: Math.round(1000 + depth * 100),
  }
}

function selectItem(item) {
  selectedId.value = item.id
}

function openItem(item) {
  if (!item?.targetUrl) return
  window.location.assign(item.targetUrl)
}

function focusRandomItem() {
  const pool = visibleItems.value.length ? visibleItems.value : items
  const random = pool[Math.floor(Math.random() * pool.length)]
  if (random) selectedId.value = random.id
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value))
}

function onPointerDown(event) {
  if (!viewportRef.value) return
  dragging.value = true
  viewportRef.value.setPointerCapture?.(event.pointerId)
  dragOrigin.value = {
    x: event.clientX,
    y: event.clientY,
    rotationX: rotationX.value,
    rotationY: rotationY.value,
  }
}

function onPointerMove(event) {
  if (!dragging.value) return
  const dx = event.clientX - dragOrigin.value.x
  const dy = event.clientY - dragOrigin.value.y
  rotationY.value = dragOrigin.value.rotationY + dx * 0.005
  rotationX.value = clamp(dragOrigin.value.rotationX - dy * 0.004, -1.05, 0.95)
}

function onPointerUp() {
  dragging.value = false
}

function onWheel(event) {
  const delta = Math.sign(event.deltaY) * -0.06
  zoom.value = clamp(zoom.value + delta, 0.72, 1.3)
}

function tick() {
  if (!dragging.value) {
    rotationY.value += 0.0016
  }
  rafId = window.requestAnimationFrame(tick)
}

onMounted(() => {
  rafId = window.requestAnimationFrame(tick)
  if (!visibleItems.value.some((item) => item.id === selectedId.value) && visibleItems.value[0]) {
    selectedId.value = visibleItems.value[0].id
  }
})

onUnmounted(() => {
  if (rafId) window.cancelAnimationFrame(rafId)
})
</script>

<style scoped>
.space-browser {
  min-height: 100%;
  padding: 24px;
  color: #f5efe6;
  background:
    radial-gradient(circle at 20% 20%, rgba(112, 176, 255, 0.18), transparent 28%),
    radial-gradient(circle at 80% 20%, rgba(255, 195, 112, 0.16), transparent 26%),
    radial-gradient(circle at 50% 80%, rgba(177, 255, 182, 0.10), transparent 22%),
    linear-gradient(180deg, #09101f 0%, #0b1425 48%, #101b2d 100%);
}

.hero-bar {
  display: flex;
  justify-content: space-between;
  gap: 18px;
  align-items: flex-end;
  margin-bottom: 18px;
}

.hero-kicker,
.panel-kicker {
  letter-spacing: 0.18em;
  text-transform: uppercase;
  font-size: 12px;
  color: rgba(226, 233, 247, 0.72);
}

.hero-title {
  margin: 10px 0 8px;
  font-size: clamp(30px, 5vw, 46px);
  line-height: 1.05;
}

.hero-desc {
  margin: 0;
  color: rgba(239, 244, 252, 0.76);
  max-width: 58ch;
}

.hero-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-width: min(520px, 100%);
}

.search-wrap {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 14px;
  border: 1px solid rgba(183, 204, 255, 0.14);
  border-radius: 999px;
  background: rgba(11, 18, 34, 0.66);
  backdrop-filter: blur(18px);
}

.search-wrap input {
  flex: 1;
  border: 0;
  outline: 0;
  background: transparent;
  color: #fff;
  font-size: 14px;
}

.filters {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.filter-chip,
.primary-btn,
.ghost-btn,
.entry-row {
  border: 1px solid rgba(183, 204, 255, 0.14);
  background: rgba(17, 26, 42, 0.78);
  color: #f4f8ff;
  border-radius: 999px;
  padding: 10px 14px;
  cursor: pointer;
  transition: transform 0.18s ease, border-color 0.18s ease, background 0.18s ease;
}

.filter-chip.active {
  background: rgba(78, 134, 255, 0.2);
  border-color: rgba(118, 164, 255, 0.65);
}

.browser-layout {
  display: grid;
  grid-template-columns: minmax(0, 1.75fr) minmax(320px, 0.9fr);
  gap: 18px;
  align-items: stretch;
}

.browser-stage,
.browser-panel,
.panel-card {
  border: 1px solid rgba(187, 208, 255, 0.12);
  background: rgba(8, 13, 24, 0.45);
  backdrop-filter: blur(20px);
  border-radius: 28px;
  box-shadow: 0 28px 80px rgba(0, 0, 0, 0.28);
}

.browser-stage {
  position: relative;
  min-height: 74vh;
  overflow: hidden;
}

.sky-layer {
  position: absolute;
  inset: 0;
  background-image:
    radial-gradient(circle at 12% 18%, rgba(255, 255, 255, 0.9) 0 1px, transparent 1.2px),
    radial-gradient(circle at 78% 32%, rgba(255, 255, 255, 0.9) 0 1px, transparent 1.2px),
    radial-gradient(circle at 22% 64%, rgba(255, 255, 255, 0.8) 0 1px, transparent 1.2px),
    radial-gradient(circle at 58% 82%, rgba(255, 255, 255, 0.7) 0 1px, transparent 1.2px);
  background-size: 220px 220px;
  opacity: 0.24;
  pointer-events: none;
}

.viewport {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 74vh;
  perspective: 1200px;
  touch-action: none;
  cursor: grab;
}

.viewport:active {
  cursor: grabbing;
}

.world-hint {
  position: absolute;
  left: 20px;
  top: 20px;
  z-index: 5;
  padding: 8px 12px;
  border-radius: 999px;
  background: rgba(8, 13, 24, 0.62);
  color: rgba(239, 245, 255, 0.82);
  font-size: 12px;
  border: 1px solid rgba(180, 202, 255, 0.14);
}

.camera {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  transform-style: preserve-3d;
  transform: rotateX(var(--rot-x)) rotateY(var(--rot-y)) scale(var(--zoom));
  transition: transform 0.08s linear;
}

.globe-shell {
  position: relative;
  width: min(68vw, 760px);
  aspect-ratio: 1;
  transform-style: preserve-3d;
  filter: drop-shadow(0 28px 55px rgba(0, 0, 0, 0.34));
}

.globe-core,
.globe-grid,
.globe-glow {
  position: absolute;
  inset: 6%;
  border-radius: 50%;
}

.globe-core {
  background:
    radial-gradient(circle at 32% 28%, rgba(255, 255, 255, 0.34), transparent 23%),
    radial-gradient(circle at 68% 76%, rgba(40, 138, 255, 0.18), transparent 24%),
    radial-gradient(circle at 50% 50%, #0d1f3b 0%, #081321 52%, #050a13 100%);
  box-shadow:
    inset -36px -60px 90px rgba(0, 0, 0, 0.52),
    inset 28px 30px 78px rgba(100, 149, 255, 0.08);
}

.globe-grid {
  border: 1px solid rgba(180, 203, 255, 0.1);
  mix-blend-mode: screen;
  opacity: 0.78;
}

.globe-grid--lat {
  background:
    repeating-radial-gradient(circle at center, transparent 0 22px, rgba(122, 170, 255, 0.14) 22px 23px);
  transform: scale(0.86);
}

.globe-grid--lng {
  background:
    repeating-linear-gradient(90deg, transparent 0 26px, rgba(122, 170, 255, 0.12) 26px 27px);
  border-radius: 50%;
  transform: scale(0.86);
}

.globe-glow {
  background: radial-gradient(circle at 50% 50%, rgba(72, 161, 255, 0.26), transparent 58%);
  filter: blur(18px);
}

.world-node {
  position: absolute;
  left: 50%;
  top: 50%;
  display: flex;
  align-items: center;
  gap: 8px;
  border: 0;
  background: transparent;
  color: #fff;
  transform-style: preserve-3d;
  transform: translate(-50%, -50%) translate3d(var(--x), var(--y), var(--z)) scale(var(--scale));
  transform-origin: center;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.38);
}

.node-dot {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: radial-gradient(circle at 35% 35%, #fff, #8dd0ff 30%, #2e8dff 70%, rgba(46, 141, 255, 0.12) 100%);
  box-shadow: 0 0 0 6px rgba(82, 142, 255, 0.14), 0 0 26px rgba(95, 153, 255, 0.42);
  flex: 0 0 auto;
}

.node-label {
  display: inline-flex;
  align-items: center;
  max-width: 12rem;
  padding: 7px 10px;
  font-size: 12px;
  line-height: 1.15;
  border-radius: 999px;
  border: 1px solid rgba(186, 206, 255, 0.16);
  background: rgba(10, 16, 30, 0.72);
  backdrop-filter: blur(6px);
  white-space: nowrap;
}

.world-node.active .node-label {
  background: rgba(82, 138, 255, 0.22);
  border-color: rgba(126, 172, 255, 0.56);
}

.world-node--book .node-dot {
  box-shadow: 0 0 0 6px rgba(128, 200, 255, 0.12), 0 0 28px rgba(95, 172, 255, 0.4);
}

.world-node--topic .node-dot {
  background: radial-gradient(circle at 35% 35%, #fff, #ffd28a 30%, #ff9d43 72%, rgba(255, 157, 67, 0.12) 100%);
  box-shadow: 0 0 0 6px rgba(255, 174, 92, 0.14), 0 0 26px rgba(255, 164, 70, 0.36);
}

.world-node--tool .node-dot {
  background: radial-gradient(circle at 35% 35%, #fff, #b2ffdc 30%, #42d99d 72%, rgba(66, 217, 157, 0.12) 100%);
  box-shadow: 0 0 0 6px rgba(84, 231, 173, 0.12), 0 0 26px rgba(84, 231, 173, 0.34);
}

.world-node--place .node-dot {
  background: radial-gradient(circle at 35% 35%, #fff, #ffd7e6 30%, #ff86b2 72%, rgba(255, 134, 178, 0.12) 100%);
  box-shadow: 0 0 0 6px rgba(255, 134, 178, 0.1), 0 0 26px rgba(255, 134, 178, 0.28);
}

.browser-panel {
  display: grid;
  gap: 14px;
  padding: 16px;
  align-content: start;
}

.panel-card {
  padding: 18px;
}

.panel-card--featured {
  background:
    linear-gradient(180deg, rgba(21, 34, 57, 0.92), rgba(14, 21, 34, 0.82)),
    radial-gradient(circle at 80% 10%, rgba(98, 153, 255, 0.2), transparent 30%);
}

.panel-title {
  margin: 10px 0 10px;
  font-size: 26px;
  line-height: 1.1;
}

.panel-desc {
  margin: 0;
  color: rgba(235, 242, 255, 0.78);
  line-height: 1.6;
}

.panel-meta,
.panel-tags,
.panel-actions,
.entry-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.panel-meta,
.panel-tags {
  margin-top: 14px;
}

.meta-chip,
.tag-chip,
.entry-kind {
  padding: 6px 10px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(181, 201, 255, 0.12);
  color: rgba(242, 247, 255, 0.9);
  font-size: 12px;
}

.panel-actions {
  margin-top: 16px;
}

.explain-list {
  margin: 0;
  padding-left: 18px;
  color: rgba(236, 242, 255, 0.82);
  line-height: 1.65;
}

.sample-card .entry-list {
  flex-direction: column;
}

.entry-row {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 10px;
  border-radius: 18px;
  text-align: left;
  padding: 12px 14px;
}

.entry-title {
  font-size: 14px;
}

@media (hover: hover) {
  .filter-chip:hover,
  .primary-btn:hover,
  .ghost-btn:hover,
  .entry-row:hover {
    transform: translateY(-1px);
    border-color: rgba(135, 172, 255, 0.34);
  }
}

@media (max-width: 1100px) {
  .browser-layout {
    grid-template-columns: 1fr;
  }

  .browser-stage {
    min-height: 68vh;
  }

  .globe-shell {
    width: min(88vw, 700px);
  }
}

@media (max-width: 720px) {
  .space-browser {
    padding: 16px;
  }

  .hero-bar {
    flex-direction: column;
    align-items: stretch;
  }

  .hero-actions {
    min-width: 0;
  }

  .browser-stage,
  .viewport {
    min-height: 58vh;
  }

  .globe-shell {
    width: min(92vw, 520px);
  }

  .node-label {
    max-width: 9rem;
  }

  .panel-title {
    font-size: 22px;
  }
}
</style>
