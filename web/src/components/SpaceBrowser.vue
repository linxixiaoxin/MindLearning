<template>
  <div class="space-browser">
    <header class="hero-bar">
      <div>
        <div class="hero-kicker">Book World Atlas</div>
        <h1 class="hero-title">书籍世界地图</h1>
        <p class="hero-desc">把书当成可以进入的主题世界：远看领域地貌，近看书与问题、练习路线和思想伙伴的连接。</p>
      </div>

      <div class="hero-actions">
        <div class="view-switch" aria-label="浏览模式">
          <button
            class="view-switch-btn"
            :class="{ active: viewMode === 'atlas' }"
            @click="setViewMode('atlas')"
          >
            主题世界
          </button>
          <button
            class="view-switch-btn"
            :class="{ active: viewMode === 'galaxy' }"
            @click="setViewMode('galaxy')"
          >
            关系星图
          </button>
          <button
            class="view-switch-btn"
            :class="{ active: viewMode === 'globe' }"
            @click="setViewMode('globe')"
          >
            立体书库
          </button>
        </div>

        <div class="search-wrap">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <circle cx="6.5" cy="6.5" r="4.5" stroke="currentColor" stroke-width="1.4" />
            <path d="M10.5 10.5L14 14" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" />
          </svg>
          <input v-model="query" placeholder="搜索书 / 问题 / 主题 / 地点" />
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
      <section v-if="viewMode === 'atlas'" class="browser-stage atlas-stage">
        <div
          ref="atlasViewportRef"
          class="atlas-viewport"
          aria-label="书籍主题世界浏览器"
          @pointerdown="onAtlasPointerDown"
          @pointermove="onAtlasPointerMove"
          @pointerup="onAtlasPointerUp"
          @pointercancel="onAtlasPointerUp"
          @pointerleave="onAtlasPointerUp"
          @click="onAtlasCanvasClick"
          @wheel="onAtlasWheel"
        >
          <div class="render-badge">主题世界</div>

          <div class="stage-controls atlas-controls" @pointerdown.stop @click.stop>
            <button title="缩小" aria-label="缩小" @click="adjustAtlasZoom(-0.32)">−</button>
            <button title="重置视角" aria-label="重置视角" @click="resetAtlasView">⌂</button>
            <button title="聚焦当前点位" aria-label="聚焦当前点位" @click="focusAtlasItem(selectedItem)">◎</button>
            <button title="放大" aria-label="放大" @click="adjustAtlasZoom(0.32)">+</button>
          </div>

          <button
            class="tour-toggle"
            :class="{ active: roaming }"
            @pointerdown.stop
            @click.stop="toggleRoaming"
          >
            {{ roaming ? '停止巡游' : '自动巡游' }}
          </button>

          <canvas ref="atlasCanvasRef" class="atlas-canvas"></canvas>
          <div class="atlas-depth-vignette" aria-hidden="true"></div>
          <div class="atlas-cue-card" aria-live="polite">
            <span class="cue-kicker">{{ selectedItem ? kindLabel(selectedItem.kind) : '地图点位' }}</span>
            <strong>{{ selectedItem?.shortTitle || selectedItem?.title || '选择一个点位' }}</strong>
            <p>{{ selectedItem?.summary || '从底部书籍巡游栏选择一本书，镜头会飞到它所在的主题世界。' }}</p>
            <div v-if="selectedItem?.tags?.length" class="cue-tags">
              <span v-for="tag in selectedItem.tags.slice(0, 3)" :key="tag">{{ tag }}</span>
            </div>
          </div>

          <div class="atlas-book-rail" aria-label="书籍巡游栏" @pointerdown.stop @click.stop>
            <button
              v-for="item in atlasRailItems"
              :key="`rail-${item.id}`"
              class="atlas-rail-card"
              :class="{ active: item.id === selectedItem?.id }"
              @click="selectAtlasItem(item)"
            >
              <span class="rail-kind">{{ kindLabel(item.kind) }}</span>
              <strong>{{ item.shortTitle || item.title }}</strong>
              <small>{{ item.era }}</small>
            </button>
          </div>
        </div>
      </section>

      <section v-else-if="viewMode === 'galaxy'" class="browser-stage galaxy-stage">
        <div class="galaxy-space" aria-label="书籍关系星图浏览器">
          <div class="render-badge">关系星图</div>

          <div
            v-for="(region, index) in atlasRegions"
            :key="region.id"
            class="galaxy-cluster"
            :style="galaxyClusterStyle(region, index)"
            aria-hidden="true"
          >
            <span class="galaxy-cluster-title">{{ region.label }}</span>
            <span class="galaxy-cluster-subtitle">{{ region.subtitle }}</span>
          </div>

          <svg class="galaxy-links" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
            <line
              v-for="link in galaxyLinks"
              :key="link.id"
              class="galaxy-link"
              :class="`galaxy-link--${link.kind}`"
              :x1="link.x1"
              :y1="link.y1"
              :x2="link.x2"
              :y2="link.y2"
            />
          </svg>

          <button
            v-for="node in galaxyNodes"
            :key="node.item.id"
            class="galaxy-node"
            :class="[
              `galaxy-node--${node.item.kind}`,
              {
                active: node.item.id === selectedItem?.id,
                linked: node.linked,
              },
            ]"
            :style="galaxyNodeStyle(node)"
            :title="node.item.title"
            @click="selectItem(node.item)"
          >
            <span class="galaxy-node-orbit" aria-hidden="true"></span>
            <span class="galaxy-node-core"></span>
            <span class="galaxy-node-label">{{ node.item.shortTitle || node.item.title }}</span>
          </button>

          <div class="galaxy-focus" aria-live="polite">
            <span>{{ selectedItem ? kindLabel(selectedItem.kind) : '核心节点' }}</span>
            <strong>{{ selectedItem?.shortTitle || selectedItem?.title || '选择一个节点' }}</strong>
          </div>
        </div>
      </section>

      <section v-else class="browser-stage globe-stage">
        <div
          ref="viewportRef"
          class="viewport"
          aria-label="立体书库浏览器"
          @pointerdown="onPointerDown"
          @pointermove="onPointerMove"
          @pointerup="onPointerUp"
          @pointercancel="onPointerUp"
          @pointerleave="onPointerUp"
          @click="onCanvasClick"
          @wheel="onWheel"
        >
          <canvas ref="canvasRef" class="space-canvas"></canvas>
          <div class="render-badge">立体书库</div>

          <div class="stage-controls" @pointerdown.stop @click.stop>
            <button title="缩小" aria-label="缩小" @click="adjustZoom(-0.1)">−</button>
            <button title="放大" aria-label="放大" @click="adjustZoom(0.1)">+</button>
          </div>

          <button
            v-for="item in visibleItems"
            :key="item.id"
            class="world-node"
            :class="[`world-node--${item.kind}`, { active: item.id === selectedItem?.id }]"
            :style="labelStyle(item)"
            @pointerdown.stop
            @click.stop="selectItem(item)"
          >
            <span class="node-dot"></span>
            <span class="node-label">{{ item.title }}</span>
          </button>
        </div>
      </section>

      <aside class="browser-panel">
        <div class="panel-card panel-card--featured">
          <div class="panel-kicker">当前视角</div>
          <h2 class="panel-title">{{ selectedItem?.title || '选择一个点位' }}</h2>
          <p class="panel-desc">{{ selectedItem?.summary || '选择一个点位，查看它和处境、问题、书页、专题页、练习路线之间的连接。' }}</p>

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
          <div class="panel-kicker">{{ modeGuideTitle }}</div>
          <ol class="explain-list">
            <li v-for="note in modeGuideNotes" :key="note">{{ note }}</li>
          </ol>
        </div>

        <div class="panel-card sample-card">
          <div class="panel-kicker">推荐入口</div>
          <div class="entry-list">
            <button v-for="item in spotlightItems" :key="item.id" class="entry-row" @click="selectPanelItem(item)">
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
import * as THREE from 'three'
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'

const props = defineProps({
  registry: {
    type: Object,
    default: () => ({ site: {}, books: [], topics: [], tools: [] }),
  },
})

const filters = [
  { id: 'all', label: '全部' },
  { id: 'book', label: '书' },
  { id: 'topic', label: '主题' },
  { id: 'tool', label: '工具' },
  { id: 'place', label: '地点' },
]

const atlasRegions = [
  { id: 'mind', label: '心理疗愈群岛', subtitle: '情绪 / 身体 / 自我理解', icon: 'tree', color: 0x6f9c6a, x: 29, y: 58 },
  { id: 'thinking', label: '认知决策高地', subtitle: '判断 / 系统 / 误区', icon: 'pyramid', color: 0xd6a45c, x: 48, y: 38 },
  { id: 'dialogue', label: '沟通关系港', subtitle: '表达 / 边界 / 对话', icon: 'gate', color: 0x6ea9a0, x: 69, y: 57 },
  { id: 'leadership', label: '组织与成长山脉', subtitle: '领导力 / 教练 / 复杂度', icon: 'tower', color: 0x9f8350, x: 42, y: 23 },
  { id: 'practice', label: '学习方法平原', subtitle: '习惯 / 输出 / 复利', icon: 'camel', color: 0xca8744, x: 18, y: 35 },
  { id: 'care', label: '健康照护海岸', subtitle: '生命 / 医疗 / 告别', icon: 'lighthouse', color: 0x6d9a98, x: 82, y: 32 },
]

const categoryAnchors = {
  心理疗愈与自我探索: { x: 29, y: 58, lat: -12, lng: 118, era: '心理疗愈' },
  认知决策与系统思考: { x: 48, y: 38, lat: 18, lng: -38, era: '认知决策' },
  沟通表达与关系对话: { x: 69, y: 57, lat: 10, lng: 118, era: '沟通关系' },
  领导管理与组织教练: { x: 42, y: 23, lat: 42, lng: 22, era: '领导组织' },
  学习成长与习惯方法: { x: 18, y: 35, lat: -24, lng: -18, era: '学习成长' },
  医疗健康与照护认知: { x: 82, y: 32, lat: 33, lng: 76, era: '健康照护' },
}

const fallbackItems = [
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
    title: '思想伙伴',
    summary: '给当前处境配几种看法，让作者和理论各自承担照亮、翻译、校准和行动的分工。',
    tags: ['处境', '伙伴', '行动'],
    era: '工具入口',
    lat: 24,
    lng: 152,
    targetUrl: '/tools/thought-partner',
  },
  {
    id: 'problem-lab',
    kind: 'tool',
    title: '卡点工作台',
    summary: '从原话、情绪、需要与问题结构出发，把卡住的地方拆成可推进的小问题。',
    tags: ['原话', '卡点', '行动'],
    era: '工具入口',
    lat: 58,
    lng: -132,
    targetUrl: '/tools/problem-lab',
  },
  {
    id: 'learning-paths',
    kind: 'tool',
    title: '练习路线地图',
    summary: '围绕一个具体卡点，把书、卡片、练习和输出任务组织成一条能走的路线。',
    tags: ['路线', '练习', '输出'],
    era: '工具入口',
    lat: -48,
    lng: -18,
    targetUrl: '/tools/learning-paths',
  },
  {
    id: 'content-ops',
    kind: 'tool',
    title: '个人工作台',
    summary: '把网页项目、原型探索、内容选题和数据复盘放到同一张推进表。',
    tags: ['工作台', '项目', '内容'],
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
    summary: '把热榜、事件和卡点工作台连接起来，作为现实世界的采样口。',
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
    summary: '把角色、能力和练习串成路线，帮助用户看见下一段成长该补哪一块。',
    tags: ['能力', '职业', '路线'],
    era: '路径入口',
    lat: -33,
    lng: 104,
    targetUrl: '/tools/capability-paths',
  },
]

function hashText(value) {
  return Array.from(String(value || '')).reduce((sum, char, index) => {
    return (sum + char.charCodeAt(0) * (index + 7)) % 9973
  }, 0)
}

function clampMap(value, min = 8, max = 92) {
  return Math.min(max, Math.max(min, value))
}

function anchorForBook(book) {
  return categoryAnchors[book.primaryCategory] || categoryAnchors[book.secondaryCategory] || {
    x: 55,
    y: 48,
    lat: 0,
    lng: 0,
    era: book.primaryCategory || '知识入口',
  }
}

function spreadAround(anchor, seed, radiusX = 10, radiusY = 8) {
  const angle = ((seed % 360) * Math.PI) / 180
  const ring = 0.42 + ((seed % 31) / 31) * 0.68
  return {
    x: clampMap(anchor.x + Math.cos(angle) * radiusX * ring),
    y: clampMap(anchor.y + Math.sin(angle) * radiusY * ring),
  }
}

function mapBookToItem(book, index) {
  const anchor = anchorForBook(book)
  const seed = hashText(`${book.slug}-${book.title}-${index}`)
  const point = spreadAround(anchor, seed)
  const lng = ((point.x - 50) / 50) * 150
  const lat = ((50 - point.y) / 50) * 70

  return {
    id: `book-${book.slug}`,
    kind: 'book',
    title: book.title || book.slug,
    shortTitle: book.shortTitle || book.title || book.slug,
    summary: book.description || '这本书已接入多书知识站，可进入阅读地图继续探索。',
    tags: [book.primaryCategory, book.secondaryCategory, ...(book.entryTopics || [])].filter(Boolean).slice(0, 4),
    era: anchor.era,
    lat,
    lng,
    mapX: point.x,
    mapY: point.y,
    coverImage: book.coverImage,
    targetUrl: `/books/${encodeURIComponent(book.slug)}`,
  }
}

function mapTopicToItem(topic, index) {
  const seed = hashText(`${topic.slug}-${topic.title}-${index}`)
  const anchor = atlasRegions[(seed + index) % atlasRegions.length]
  const point = spreadAround(anchor, seed, 13, 10)

  return {
    id: `topic-${topic.slug}`,
    kind: 'topic',
    title: topic.title || topic.slug,
    shortTitle: topic.shortTitle || topic.title || topic.slug,
    summary: topic.description || '专题入口用于把多本书和一个现实问题连起来。',
    tags: [...(topic.tags || []), ...(topic.relatedBooks || [])].filter(Boolean).slice(0, 4),
    era: topic.phaseLabel || '专题入口',
    lat: ((50 - point.y) / 50) * 70,
    lng: ((point.x - 50) / 50) * 150,
    mapX: point.x,
    mapY: point.y,
    targetUrl: `/topics/${encodeURIComponent(topic.slug)}`,
  }
}

function mapToolToItem(tool, index) {
  const toolAnchors = [
    { x: 17, y: 69, lat: -48, lng: -18 },
    { x: 56, y: 70, lat: -18, lng: 42 },
    { x: 80, y: 62, lat: 8, lng: 126 },
    { x: 70, y: 24, lat: 45, lng: 72 },
  ]
  const anchor = toolAnchors[index % toolAnchors.length]
  const point = spreadAround(anchor, hashText(tool.slug || tool.title), 6, 5)

  return {
    id: `tool-${tool.slug}`,
    kind: 'tool',
    title: tool.title || tool.slug,
    shortTitle: tool.shortTitle || tool.title || tool.slug,
    summary: tool.description || '工具入口用于把书中的能力转成可操作的工作流。',
    tags: tool.tags || ['工具', '实验'],
    era: tool.phaseLabel || '工具入口',
    lat: anchor.lat,
    lng: anchor.lng,
    mapX: point.x,
    mapY: point.y,
    targetUrl: `/tools/${encodeURIComponent(tool.slug)}`,
  }
}

function buildSpaceItems(registry) {
  const books = (registry?.books || []).filter((book) => book?.slug)
  const topics = (registry?.topics || []).filter((topic) => topic?.slug)
  const tools = (registry?.tools || []).filter((tool) => tool?.slug)

  if (!books.length && !topics.length && !tools.length) {
    return fallbackItems.map((item) => ({
      ...item,
      shortTitle: item.shortTitle || item.title,
      mapX: item.mapX ?? clampMap(50 + (item.lng / 150) * 50),
      mapY: item.mapY ?? clampMap(50 - (item.lat / 70) * 50),
    }))
  }

  return [
    ...books.slice(0, 54).map(mapBookToItem),
    ...topics.slice(0, 18).map(mapTopicToItem),
    ...tools.slice(0, 10).map(mapToolToItem),
    {
      id: 'place-xiamen-quanzhou',
      kind: 'place',
      title: '厦门 / 泉州',
      shortTitle: '厦门 / 泉州',
      summary: '旅行专题的真实样本，把地方、问题和观察连成一条线。',
      tags: ['旅行', '地方', '观看'],
      era: '地点入口',
      lat: -14,
      lng: 178,
      mapX: 86,
      mapY: 72,
      targetUrl: '/topics/travel-with-questions',
    },
  ]
}

const colorByKind = {
  book: 0x78c7ff,
  topic: 0xffb869,
  tool: 0x5ee2ad,
  place: 0xff8eb8,
}

const galaxyKindStyles = {
  book: { color: '#78c7ff', glow: 'rgba(120, 199, 255, 0.42)', size: 14 },
  topic: { color: '#ffb869', glow: 'rgba(255, 184, 105, 0.44)', size: 18 },
  tool: { color: '#5ee2ad', glow: 'rgba(94, 226, 173, 0.38)', size: 15 },
  place: { color: '#ff8eb8', glow: 'rgba(255, 142, 184, 0.36)', size: 13 },
}

const galaxyClusterColors = [
  'rgba(120, 199, 255, 0.28)',
  'rgba(255, 184, 105, 0.25)',
  'rgba(94, 226, 173, 0.24)',
  'rgba(211, 149, 255, 0.24)',
  'rgba(255, 219, 122, 0.22)',
  'rgba(255, 142, 184, 0.22)',
]

const atlasWorldWidth = 1200
const atlasWorldHeight = 780
const atlasMapWidth = 84
const atlasMapDepth = 52
const items = computed(() => buildSpaceItems(props.registry))
const selectedFilter = ref('all')
const viewMode = ref('atlas')
const query = ref('')
const canvasRef = ref(null)
const viewportRef = ref(null)
const atlasCanvasRef = ref(null)
const atlasViewportRef = ref(null)
const selectedId = ref(fallbackItems[0].id)
const rotationX = ref(-0.28)
const rotationY = ref(-0.18)
const zoom = ref(1)
const atlasZoom = ref(1)
const atlasPan = ref({ x: 0, y: 0 })
const atlasDragging = ref(false)
const roaming = ref(false)
const dragging = ref(false)
const labelState = ref({})

const dragOrigin = ref({ x: 0, y: 0, rotationX: 0, rotationY: 0 })
const atlasDragOrigin = ref({ x: 0, y: 0, panX: 0, panY: 0 })
const pointerMoved = ref(false)
const suppressNextClick = ref(false)

let scene = null
let camera = null
let renderer = null
let globeGroup = null
let nodesGroup = null
let arcsGroup = null
let resizeObserver = null
let rafId = 0
let viewportWidth = 1
let viewportHeight = 1
let baseCameraDistance = 6.8
let roamTimer = 0

let atlasScene = null
let atlasCamera = null
let atlasRenderer = null
let atlasRoot = null
let atlasIslandsGroup = null
let atlasNodesGroup = null
let atlasRoutesGroup = null
let atlasLandmarksGroup = null
let atlasResizeObserver = null
let atlasRafId = 0
let atlasViewportWidth = 1
let atlasViewportHeight = 1
let atlasCameraTarget = new THREE.Vector3(0, 0, 0)
let atlasCameraCurrentTarget = new THREE.Vector3(0, 0, 0)
let atlasCameraPosition = new THREE.Vector3(0, 46, 82)
let atlasCameraCurrentPosition = new THREE.Vector3(0, 46, 82)

const raycaster = new THREE.Raycaster()
const pointer = new THREE.Vector2()
const atlasRaycaster = new THREE.Raycaster()
const atlasPointer = new THREE.Vector2()
const nodeEntries = new Map()
const atlasNodeEntries = new Map()
const pickTargets = []
const atlasPickTargets = []
const disposableTextures = []
const atlasDisposableTextures = []

const visibleItems = computed(() => {
  const q = query.value.trim().toLowerCase()
  return items.value.filter((item) => {
    const typeMatch = selectedFilter.value === 'all' || item.kind === selectedFilter.value
    if (!typeMatch) return false
    if (!q) return true
    const text = [item.title, item.shortTitle, item.summary, item.era, ...(item.tags || [])].join(' ').toLowerCase()
    return text.includes(q)
  })
})

const spotlightItems = computed(() => visibleItems.value.slice(0, 4))
const atlasRailItems = computed(() => {
  const books = visibleItems.value.filter((item) => item.kind === 'book')
  return (books.length ? books : visibleItems.value).slice(0, 28)
})
const selectedItem = computed(() => visibleItems.value.find((item) => item.id === selectedId.value) || visibleItems.value[0] || null)
const relatedItems = computed(() => {
  const source = selectedItem.value
  if (!source) return []
  return visibleItems.value
    .filter((item) => item.id !== source.id)
    .map((item) => ({
      item,
      score: relationScore(source, item),
    }))
    .sort((a, b) => b.score - a.score || a.item.title.localeCompare(b.item.title, 'zh-Hans-CN'))
    .slice(0, 7)
    .map((entry) => entry.item)
})
const galaxyLinkedIds = computed(() => new Set(relatedItems.value.map((item) => item.id)))
const galaxyNodes = computed(() =>
  visibleItems.value.map((item) => {
    const position = galaxyPosition(item)
    return {
      item,
      x: position.x,
      y: position.y,
      linked: galaxyLinkedIds.value.has(item.id),
    }
  }),
)
const galaxyLinks = computed(() => {
  const source = selectedItem.value
  if (!source) return []
  const start = galaxyPosition(source)
  return relatedItems.value.map((target, index) => {
    const end = galaxyPosition(target)
    return {
      id: `${source.id}-${target.id}`,
      kind: target.kind,
      index,
      x1: start.x,
      y1: start.y,
      x2: end.x,
      y2: end.y,
    }
  })
})
const modeGuideTitle = computed(() => (
  {
    atlas: '主题世界读法',
    galaxy: '关系星图读法',
    globe: '立体书库读法',
  }[viewMode.value] || '空间地图读法'
))
const modeGuideNotes = computed(() => (
  {
    atlas: ['主题世界代表大的内容簇，书、主题、工具会落在最接近的问题领域周围。', '点位高度和距离用来强调“同类聚合”，适合快速看书库分布。', '自动巡游会沿当前筛选结果依次聚焦。'],
    galaxy: ['中心节点是当前选中的书或主题，亮线连接最相关的相邻入口。', '关系优先来自同阶段、同标签和同内容簇，而不是空间位置。', '关系星图适合判断哪些书可以一起组成专题、处境解释或练习路线。'],
    globe: ['立体书库保留空间感，但不会自动旋转；拖动时才改变视角。', '按住 Ctrl / Shift 滚轮可以缩放，普通滚轮留给页面滚动。', '立体书库更适合沉浸式浏览，不承担主要关系解释。'],
  }[viewMode.value] || []
))
const atlasWorldStyle = computed(() => ({
  width: `${atlasWorldWidth}px`,
  height: `${atlasWorldHeight}px`,
  transform: `translate(-50%, -46%) translate3d(${atlasPan.value.x}px, ${atlasPan.value.y}px, 0) rotateX(58deg) rotateZ(-6deg) scale(${atlasZoom.value})`,
}))

watch(
  items,
  (nextItems) => {
    if (!nextItems.some((item) => item.id === selectedId.value) && nextItems[0]) {
      selectedId.value = nextItems[0].id
    }
    if (viewMode.value === 'atlas' && atlasRenderer) {
      disposeAtlasScene()
      requestAnimationFrame(initAtlasScene)
    }
  },
  { immediate: true },
)

watch(
  visibleItems,
  (nextItems) => {
    if (!nextItems.some((item) => item.id === selectedId.value) && nextItems[0]) {
      selectedId.value = nextItems[0].id
    }
    syncNodeVisibility()
    updateArcs()
    syncAtlasNodeVisibility()
    updateAtlasRoutes()
  },
  { flush: 'post' },
)

watch(
  selectedItem,
  (item) => {
    updateNodeSelection()
    updateArcs()
    updateAtlasSelection()
    updateAtlasRoutes()
  },
  { flush: 'post' },
)

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

function kindSymbol(kind) {
  return (
    {
      book: '书',
      topic: '题',
      tool: '器',
      place: '地',
    }[kind] || '点'
  )
}

function relationScore(source, target) {
  const sourceTags = new Set((source.tags || []).filter(Boolean))
  const tagScore = (target.tags || []).reduce((score, tag) => score + (sourceTags.has(tag) ? 8 : 0), 0)
  const eraScore = source.era && target.era && source.era === target.era ? 6 : 0
  const kindScore = source.kind === target.kind ? 2 : 3
  const distance = Math.hypot((source.mapX ?? 50) - (target.mapX ?? 50), (source.mapY ?? 50) - (target.mapY ?? 50))
  const proximityScore = Math.max(0, 8 - distance / 4)
  const topicBridgeScore = source.kind === 'topic' || target.kind === 'topic' ? 1.5 : 0
  return tagScore + eraScore + kindScore + proximityScore + topicBridgeScore
}

function galaxyPosition(item) {
  const seed = hashText(item.id || item.title)
  const angle = ((seed % 360) * Math.PI) / 180
  const orbit = 2.2 + ((seed % 29) / 29) * 6.4
  return {
    x: clampMap(50 + ((item.mapX ?? 50) - 50) * 0.88 + Math.cos(angle) * orbit),
    y: clampMap(50 + ((item.mapY ?? 50) - 50) * 0.72 + Math.sin(angle) * orbit * 0.78),
  }
}

function galaxyClusterStyle(region, index) {
  return {
    left: `${region.x}%`,
    top: `${region.y}%`,
    '--cluster-color': galaxyClusterColors[index % galaxyClusterColors.length],
    '--cluster-size': `${220 + (index % 3) * 42}px`,
  }
}

function galaxyNodeStyle(node) {
  const token = galaxyKindStyles[node.item.kind] || galaxyKindStyles.book
  const selected = node.item.id === selectedItem.value?.id
  const size = selected ? token.size + 9 : node.linked ? token.size + 4 : token.size
  const seed = hashText(node.item.id)
  return {
    left: `${node.x}%`,
    top: `${node.y}%`,
    zIndex: selected ? 90 : node.linked ? 70 : Math.round(20 + node.y),
    '--node-color': token.color,
    '--node-glow': token.glow,
    '--node-size': `${size}px`,
    '--node-ring': `${selected ? size * 3.25 : node.linked ? size * 2.45 : size * 1.8}px`,
    '--label-offset': `${size * 1.08}px`,
    '--node-delay': `${(seed % 16) * 0.07}s`,
  }
}

function setViewMode(nextMode) {
  if (nextMode === viewMode.value) return
  viewMode.value = nextMode
  if (nextMode === 'atlas') {
    stopRoaming()
    disposeScene()
    requestAnimationFrame(initAtlasScene)
    return
  }
  if (nextMode === 'galaxy') {
    stopRoaming()
    disposeAtlasScene()
    disposeScene()
    return
  }
  if (nextMode === 'globe') {
    stopRoaming()
    disposeAtlasScene()
    if (!renderer) {
      requestAnimationFrame(initScene)
    } else {
      requestAnimationFrame(resizeScene)
    }
  }
}

function selectItem(item) {
  selectedId.value = item.id
}

function selectAtlasItem(item) {
  selectItem(item)
  focusAtlasItem(item)
}

function selectPanelItem(item) {
  if (viewMode.value === 'atlas') {
    selectAtlasItem(item)
    return
  }
  selectItem(item)
}

function openItem(item) {
  if (!item?.targetUrl) return
  window.location.assign(item.targetUrl)
}

function focusRandomItem() {
  const pool = visibleItems.value.length ? visibleItems.value : items.value
  const random = pool[Math.floor(Math.random() * pool.length)]
  if (!random) return
  if (viewMode.value === 'atlas') {
    selectAtlasItem(random)
    return
  }
  selectItem(random)
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value))
}

function adjustZoom(delta) {
  zoom.value = clamp(zoom.value + delta, 0.76, 1.48)
}

function adjustAtlasZoom(delta) {
  atlasZoom.value = clamp(atlasZoom.value + delta, 0.24, 7.2)
  moveAtlasCameraToTarget(atlasCameraTarget)
}

function resetAtlasView() {
  atlasZoom.value = 0.68
  atlasPan.value = { x: 0, y: 0 }
  atlasCameraTarget = new THREE.Vector3(0, 0, 0)
  atlasCameraPosition = new THREE.Vector3(0, 46, 82)
}

function atlasNodeStyle(item) {
  const selected = item.id === selectedItem.value?.id
  const baseDepth = {
    book: 82,
    topic: 62,
    tool: 70,
    place: 50,
  }[item.kind] || 58
  const depth = selected ? baseDepth + 34 : baseDepth
  return {
    left: `${item.mapX ?? 50}%`,
    top: `${item.mapY ?? 50}%`,
    zIndex: selected ? 80 : Math.round(30 + (item.mapY || 50)),
    '--node-depth': `${depth}px`,
    '--stem-height': `${Math.max(24, depth - 18)}px`,
    '--node-scale': selected ? 1.12 : 1,
  }
}

function focusAtlasItem(item) {
  if (!item) return
  const position = itemToAtlasPosition(item)
  atlasZoom.value = Math.max(atlasZoom.value, 5.4)
  atlasCameraTarget = position.clone()
  moveAtlasCameraToTarget(position)
}

function atlasCameraDistance() {
  return clamp(58 / Math.pow(atlasZoom.value, 0.98), 5.4, 96)
}

function moveAtlasCameraToTarget(target) {
  const distance = atlasCameraDistance()
  const near = atlasZoom.value >= 3.6
  const lateral = near ? (target.x > 0 ? -1.15 : 1.15) : 0.5
  const targetLift = target.y || atlasTerrainHeightAt(target.x, target.z)
  atlasCameraPosition = new THREE.Vector3(
    target.x + lateral,
    targetLift + (near ? 3.1 + distance * 0.26 : 14 + distance * 0.38),
    target.z + distance,
  )
}

function onAtlasPointerDown(event) {
  if (event.button > 0) return
  atlasDragging.value = true
  pointerMoved.value = false
  atlasViewportRef.value?.setPointerCapture?.(event.pointerId)
  atlasDragOrigin.value = {
    x: event.clientX,
    y: event.clientY,
    panX: atlasPan.value.x,
    panY: atlasPan.value.y,
  }
}

function onAtlasPointerMove(event) {
  if (!atlasDragging.value) return
  const dx = event.clientX - atlasDragOrigin.value.x
  const dy = event.clientY - atlasDragOrigin.value.y
  if (Math.abs(dx) + Math.abs(dy) > 4) {
    pointerMoved.value = true
  }
  atlasPan.value = {
    x: atlasDragOrigin.value.panX + dx,
    y: atlasDragOrigin.value.panY + dy,
  }
  const targetX = clamp(atlasCameraCurrentTarget.x - dx * 0.08 / atlasZoom.value, -atlasMapWidth * 0.46, atlasMapWidth * 0.46)
  const targetZ = clamp(atlasCameraCurrentTarget.z - dy * 0.08 / atlasZoom.value, -atlasMapDepth * 0.46, atlasMapDepth * 0.46)
  atlasCameraTarget = new THREE.Vector3(
    targetX,
    atlasTerrainHeightAt(targetX, targetZ),
    targetZ,
  )
  moveAtlasCameraToTarget(atlasCameraTarget)
}

function onAtlasPointerUp() {
  if (pointerMoved.value) {
    suppressNextClick.value = true
  }
  atlasDragging.value = false
}

function onAtlasCanvasClick(event) {
  if (suppressNextClick.value) {
    suppressNextClick.value = false
    pointerMoved.value = false
    return
  }
  pickAtlasItem(event)
}

function onAtlasWheel(event) {
  if (!event.ctrlKey && !event.metaKey && !event.shiftKey) return
  event.preventDefault()
  const nextZoom = clamp(atlasZoom.value - event.deltaY * 0.0028, 0.24, 7.2)
  atlasZoom.value = nextZoom
  moveAtlasCameraToTarget(atlasCameraTarget)
}

function toggleRoaming() {
  if (roaming.value) {
    stopRoaming()
    return
  }
  startRoaming()
}

function startRoaming() {
  stopRoaming()
  roaming.value = true
  advanceRoaming()
  roamTimer = window.setInterval(advanceRoaming, 2800)
}

function stopRoaming() {
  roaming.value = false
  if (roamTimer) {
    window.clearInterval(roamTimer)
    roamTimer = 0
  }
}

function advanceRoaming() {
  const pool = visibleItems.value
  if (!pool.length) return
  const currentIndex = Math.max(0, pool.findIndex((item) => item.id === selectedId.value))
  const next = pool[(currentIndex + 1) % pool.length]
  selectedId.value = next.id
  focusAtlasItem(next)
}

function atlasPercentToWorld(mapX = 50, mapY = 50) {
  return {
    x: (mapX / 100 - 0.5) * atlasMapWidth,
    z: (mapY / 100 - 0.5) * atlasMapDepth,
  }
}

function atlasTerrainHeightAt(x, z) {
  let height = Math.sin(x * 0.18) * Math.cos(z * 0.24) * 0.08
  height += Math.sin((x + z) * 0.28) * 0.04
  atlasRegions.forEach((region, index) => {
    const center = atlasPercentToWorld(region.x, region.y)
    const dx = (x - center.x) / 7.2
    const dz = (z - center.z) / 5.2
    const mound = Math.exp(-(dx * dx + dz * dz))
    height += mound * (0.72 + (index % 3) * 0.12)
  })
  return clamp(height, -0.08, 1.8)
}

function itemToAtlasPosition(item) {
  const { x, z } = atlasPercentToWorld(item?.mapX ?? 50, item?.mapY ?? 50)
  return new THREE.Vector3(x, atlasTerrainHeightAt(x, z) + 0.03, z)
}

function createAtlasTexture() {
  const canvas = document.createElement('canvas')
  canvas.width = 2048
  canvas.height = 1332
  const ctx = canvas.getContext('2d')

  const base = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
  base.addColorStop(0, '#c8d6bf')
  base.addColorStop(0.46, '#d9d6a6')
  base.addColorStop(1, '#c99b4a')
  ctx.fillStyle = base
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  drawAtlasBlob(ctx, [[80, 740], [260, 420], [560, 500], [650, 830], [360, 1040], [110, 920]], 'rgba(91, 142, 103, 0.68)')
  drawAtlasBlob(ctx, [[485, 310], [720, 130], [1090, 210], [1180, 460], [960, 690], [630, 610]], 'rgba(86, 143, 156, 0.62)')
  drawAtlasBlob(ctx, [[1130, 330], [1460, 170], [1880, 300], [1970, 620], [1680, 810], [1210, 650]], 'rgba(98, 152, 112, 0.64)')
  drawAtlasBlob(ctx, [[710, 820], [1040, 705], [1410, 840], [1270, 1190], [820, 1200]], 'rgba(180, 124, 58, 0.58)')
  drawAtlasBlob(ctx, [[155, 330], [320, 235], [510, 310], [450, 470], [220, 500]], 'rgba(211, 157, 66, 0.5)')
  drawAtlasBlob(ctx, [[1510, 880], [1730, 780], [1940, 900], [1850, 1120], [1570, 1080]], 'rgba(72, 134, 128, 0.52)')

  atlasRegions.forEach((region) => {
    const x = (region.x / 100) * canvas.width
    const y = (region.y / 100) * canvas.height
    drawAtlasContour(ctx, x, y, 178, 112)
    drawAtlasLandmarkIcon(ctx, region.icon, x, y - 86, 70)
  })

  ctx.strokeStyle = 'rgba(77, 119, 144, 0.32)'
  ctx.lineWidth = 5
  ctx.setLineDash([18, 24])
  drawAtlasCurve(ctx, [[130, 860], [410, 730], [670, 640], [960, 440], [1370, 380], [1880, 220]])
  drawAtlasCurve(ctx, [[220, 440], [500, 520], [730, 330], [1030, 560], [1380, 570], [1850, 470]])
  drawAtlasCurve(ctx, [[340, 1120], [620, 920], [940, 1010], [1240, 820], [1720, 790]])
  ctx.setLineDash([])

  atlasRegions.forEach((region) => {
    const x = (region.x / 100) * canvas.width
    const y = (region.y / 100) * canvas.height
    ctx.save()
    ctx.translate(x, y)
    ctx.fillStyle = 'rgba(47, 34, 18, 0.72)'
    ctx.strokeStyle = 'rgba(255, 239, 188, 0.56)'
    ctx.lineWidth = 8
    ctx.font = '700 44px Georgia, serif'
    ctx.textAlign = 'center'
    ctx.strokeText(region.label, 0, 0)
    ctx.fillText(region.label, 0, 0)
    ctx.font = '24px sans-serif'
    ctx.lineWidth = 5
    ctx.fillStyle = 'rgba(47, 34, 18, 0.62)'
    ctx.strokeText(region.subtitle, 0, 38)
    ctx.fillText(region.subtitle, 0, 38)
    ctx.restore()
  })

  ctx.fillStyle = 'rgba(74, 55, 33, 0.08)'
  for (let i = 0; i < 850; i += 1) {
    const x = Math.random() * canvas.width
    const y = Math.random() * canvas.height
    ctx.fillRect(x, y, 1.2, 1.2)
  }

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.anisotropy = 8
  atlasDisposableTextures.push(texture)
  return texture
}

function drawAtlasBlob(ctx, points, color) {
  ctx.save()
  ctx.shadowColor = 'rgba(55, 38, 19, 0.2)'
  ctx.shadowBlur = 24
  ctx.shadowOffsetY = 12
  ctx.fillStyle = color
  ctx.beginPath()
  points.forEach(([x, y], index) => {
    if (index === 0) {
      ctx.moveTo(x, y)
      return
    }
    const previous = points[index - 1]
    ctx.quadraticCurveTo(previous[0], previous[1], x, y)
  })
  ctx.closePath()
  ctx.fill()
  ctx.shadowColor = 'transparent'
  ctx.strokeStyle = 'rgba(255, 238, 184, 0.58)'
  ctx.lineWidth = 7
  ctx.stroke()
  ctx.strokeStyle = 'rgba(59, 74, 53, 0.26)'
  ctx.lineWidth = 2
  ctx.stroke()
  ctx.restore()
}

function drawAtlasContour(ctx, x, y, width, height) {
  ctx.save()
  ctx.translate(x, y)
  ctx.rotate(Math.sin((x + y) * 0.01) * 0.18)
  ctx.strokeStyle = 'rgba(74, 55, 33, 0.18)'
  ctx.lineWidth = 3
  ;[1, 0.76, 0.52, 0.3].forEach((scale) => {
    ctx.beginPath()
    ctx.ellipse(0, 0, width * scale, height * scale, 0, 0, Math.PI * 2)
    ctx.stroke()
  })
  ctx.restore()
}

function drawAtlasLandmarkIcon(ctx, type, x, y, size) {
  ctx.save()
  ctx.translate(x, y)
  ctx.fillStyle = 'rgba(71, 45, 23, 0.84)'
  ctx.strokeStyle = 'rgba(255, 238, 184, 0.72)'
  ctx.lineWidth = Math.max(3, size * 0.06)
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'

  if (type === 'pyramid') {
    ctx.beginPath()
    ctx.moveTo(-size * 0.45, size * 0.36)
    ctx.lineTo(0, -size * 0.42)
    ctx.lineTo(size * 0.45, size * 0.36)
    ctx.closePath()
    ctx.fill()
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(0, -size * 0.42)
    ctx.lineTo(size * 0.12, size * 0.36)
    ctx.stroke()
  } else if (type === 'camel') {
    ctx.beginPath()
    ctx.ellipse(-size * 0.08, size * 0.08, size * 0.3, size * 0.18, 0, 0, Math.PI * 2)
    ctx.fill()
    ctx.stroke()
    ctx.beginPath()
    ctx.arc(-size * 0.22, -size * 0.08, size * 0.13, Math.PI, 0)
    ctx.arc(size * 0.06, -size * 0.08, size * 0.13, Math.PI, 0)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(size * 0.2, 0)
    ctx.lineTo(size * 0.42, -size * 0.18)
    ctx.lineTo(size * 0.5, -size * 0.08)
    ctx.stroke()
    ;[-0.26, -0.05, 0.14, 0.3].forEach((leg) => {
      ctx.beginPath()
      ctx.moveTo(size * leg, size * 0.2)
      ctx.lineTo(size * (leg - 0.04), size * 0.42)
      ctx.stroke()
    })
  } else if (type === 'tower' || type === 'lighthouse') {
    ctx.beginPath()
    ctx.rect(-size * 0.18, -size * 0.36, size * 0.36, size * 0.72)
    ctx.fill()
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(-size * 0.3, -size * 0.36)
    ctx.lineTo(0, -size * 0.55)
    ctx.lineTo(size * 0.3, -size * 0.36)
    ctx.closePath()
    ctx.fill()
    ctx.stroke()
    if (type === 'lighthouse') {
      ctx.beginPath()
      ctx.moveTo(-size * 0.48, -size * 0.42)
      ctx.lineTo(-size * 0.78, -size * 0.52)
      ctx.moveTo(size * 0.48, -size * 0.42)
      ctx.lineTo(size * 0.78, -size * 0.52)
      ctx.stroke()
    }
  } else if (type === 'gate') {
    ctx.beginPath()
    ctx.rect(-size * 0.45, -size * 0.28, size * 0.9, size * 0.18)
    ctx.rect(-size * 0.36, -size * 0.1, size * 0.16, size * 0.48)
    ctx.rect(size * 0.2, -size * 0.1, size * 0.16, size * 0.48)
    ctx.fill()
    ctx.stroke()
  } else {
    ctx.beginPath()
    ctx.moveTo(0, -size * 0.45)
    ctx.lineTo(-size * 0.28, size * 0.08)
    ctx.lineTo(size * 0.28, size * 0.08)
    ctx.closePath()
    ctx.fill()
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(0, size * 0.08)
    ctx.lineTo(0, size * 0.44)
    ctx.stroke()
  }
  ctx.restore()
}

function drawAtlasCurve(ctx, points) {
  ctx.beginPath()
  ctx.moveTo(points[0][0], points[0][1])
  for (let i = 1; i < points.length - 1; i += 1) {
    const [x, y] = points[i]
    const [nx, ny] = points[i + 1]
    ctx.quadraticCurveTo(x, y, (x + nx) / 2, (y + ny) / 2)
  }
  ctx.stroke()
}

function createAtlasCardTexture(item) {
  const canvas = document.createElement('canvas')
  const isBook = item.kind === 'book'
  canvas.width = isBook ? 512 : 640
  canvas.height = isBook ? 720 : 360
  const ctx = canvas.getContext('2d')
  const palette = {
    book: ['#763f31', '#d2a35c'],
    topic: ['#9b572f', '#e0b45c'],
    tool: ['#2f6f67', '#7cc5a5'],
    place: ['#7b3c5b', '#cc7c91'],
  }[item.kind] || ['#5f4932', '#d4aa61']

  const bg = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
  bg.addColorStop(0, palette[1])
  bg.addColorStop(1, palette[0])
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  ctx.fillStyle = 'rgba(255, 247, 221, 0.14)'
  ctx.fillRect(22, 22, canvas.width - 44, canvas.height - 44)
  ctx.strokeStyle = 'rgba(255, 247, 221, 0.42)'
  ctx.lineWidth = 3
  ctx.strokeRect(22, 22, canvas.width - 44, canvas.height - 44)

  ctx.fillStyle = 'rgba(255, 250, 232, 0.94)'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.font = isBook ? '700 46px sans-serif' : '700 42px sans-serif'
  ctx.lineWidth = 8
  ctx.strokeStyle = 'rgba(42, 25, 13, 0.72)'
  wrapCanvasText(ctx, item.shortTitle || item.title, canvas.width / 2, canvas.height * 0.42, canvas.width - 94, isBook ? 58 : 52, isBook ? 4 : 2)

  ctx.font = isBook ? '26px sans-serif' : '24px sans-serif'
  ctx.fillStyle = 'rgba(255, 250, 232, 0.76)'
  ctx.lineWidth = 5
  ctx.strokeStyle = 'rgba(42, 25, 13, 0.58)'
  wrapCanvasText(ctx, item.era || kindLabel(item.kind), canvas.width / 2, canvas.height * 0.74, canvas.width - 120, 34, 2)

  ctx.fillStyle = 'rgba(255, 250, 232, 0.16)'
  ctx.beginPath()
  ctx.arc(canvas.width * 0.18, canvas.height * 0.16, isBook ? 70 : 48, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = 'rgba(255, 250, 232, 0.88)'
  ctx.font = isBook ? '800 58px sans-serif' : '800 42px sans-serif'
  ctx.fillText(kindSymbol(item.kind), canvas.width * 0.18, canvas.height * 0.16 + 2)

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.anisotropy = 8
  atlasDisposableTextures.push(texture)
  return texture
}

function createAtlasMarkerTexture(item) {
  const canvas = document.createElement('canvas')
  canvas.width = 480
  canvas.height = 680
  const ctx = canvas.getContext('2d')
  const palette = {
    book: ['#6b3529', '#d2a35c'],
    topic: ['#9b572f', '#e0b45c'],
    tool: ['#2f6f67', '#7cc5a5'],
    place: ['#7b3c5b', '#cc7c91'],
  }[item.kind] || ['#5f4932', '#d4aa61']

  const bg = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
  bg.addColorStop(0, '#fff4ce')
  bg.addColorStop(0.32, palette[1])
  bg.addColorStop(1, palette[0])
  ctx.fillStyle = bg
  ctx.beginPath()
  ctx.roundRect(34, 34, canvas.width - 68, canvas.height - 68, 34)
  ctx.fill()
  ctx.lineWidth = 10
  ctx.strokeStyle = 'rgba(255, 239, 196, 0.82)'
  ctx.stroke()

  ctx.fillStyle = 'rgba(66, 38, 20, 0.26)'
  ctx.fillRect(70, 78, 82, canvas.height - 156)

  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillStyle = 'rgba(255, 250, 232, 0.96)'
  ctx.font = '800 58px sans-serif'
  ctx.lineWidth = 7
  ctx.strokeStyle = 'rgba(42, 25, 13, 0.62)'
  ctx.strokeText(kindSymbol(item.kind), 111, 150)
  ctx.fillText(kindSymbol(item.kind), 111, 150)

  ctx.font = '800 48px sans-serif'
  ctx.lineWidth = 8
  ctx.fillStyle = 'rgba(255, 250, 232, 0.98)'
  wrapCanvasText(ctx, item.shortTitle || item.title, 296, 314, 280, 58, 4)

  ctx.font = '500 26px sans-serif'
  ctx.lineWidth = 5
  ctx.fillStyle = 'rgba(255, 239, 202, 0.78)'
  wrapCanvasText(ctx, item.era || kindLabel(item.kind), 296, 560, 270, 32, 2)

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.anisotropy = 8
  atlasDisposableTextures.push(texture)
  return texture
}

function wrapCanvasText(ctx, text, x, y, maxWidth, lineHeight, maxLines) {
  const chars = String(text || '').split('')
  const lines = []
  let line = ''
  chars.forEach((char) => {
    const nextLine = `${line}${char}`
    if (ctx.measureText(nextLine).width > maxWidth && line) {
      lines.push(line)
      line = char
      return
    }
    line = nextLine
  })
  if (line) lines.push(line)
  const visible = lines.slice(0, maxLines)
  const startY = y - ((visible.length - 1) * lineHeight) / 2
  visible.forEach((entry, index) => {
    if (ctx.lineWidth > 0) {
      ctx.strokeText(entry, x, startY + index * lineHeight)
    }
    ctx.fillText(entry, x, startY + index * lineHeight)
  })
}

function initAtlasScene() {
  if (!atlasCanvasRef.value || !atlasViewportRef.value || atlasRenderer) return

  atlasScene = new THREE.Scene()
  atlasScene.fog = new THREE.Fog(0xd8c68f, 54, 172)
  atlasCamera = new THREE.PerspectiveCamera(38, 1, 0.1, 260)

  atlasRenderer = new THREE.WebGLRenderer({
    canvas: atlasCanvasRef.value,
    antialias: true,
    alpha: true,
    powerPreference: 'high-performance',
  })
  atlasRenderer.setClearColor(0x000000, 0)
  atlasRenderer.outputColorSpace = THREE.SRGBColorSpace
  atlasRenderer.shadowMap.enabled = true
  atlasRenderer.shadowMap.type = THREE.PCFSoftShadowMap

  atlasScene.add(new THREE.HemisphereLight(0xfff0d0, 0x314652, 1.85))
  const sun = new THREE.DirectionalLight(0xffffff, 2.4)
  sun.position.set(-18, 32, 24)
  sun.castShadow = true
  sun.shadow.mapSize.width = 2048
  sun.shadow.mapSize.height = 2048
  sun.shadow.camera.near = 1
  sun.shadow.camera.far = 120
  sun.shadow.camera.left = -48
  sun.shadow.camera.right = 48
  sun.shadow.camera.top = 36
  sun.shadow.camera.bottom = -36
  atlasScene.add(sun)

  atlasRoot = new THREE.Group()
  atlasScene.add(atlasRoot)
  atlasIslandsGroup = new THREE.Group()
  atlasNodesGroup = new THREE.Group()
  atlasRoutesGroup = new THREE.Group()
  atlasLandmarksGroup = new THREE.Group()

  createAtlasGround()
  createAtlasIslands()
  createAtlasLandmarks()
  createAtlasNodes()
  atlasRoot.add(atlasIslandsGroup)
  atlasRoot.add(atlasLandmarksGroup)
  atlasRoot.add(atlasRoutesGroup)
  atlasRoot.add(atlasNodesGroup)
  syncAtlasNodeVisibility()
  updateAtlasSelection()
  updateAtlasRoutes()
  resizeAtlasScene()

  atlasResizeObserver = new ResizeObserver(resizeAtlasScene)
  atlasResizeObserver.observe(atlasViewportRef.value)
  atlasRafId = window.requestAnimationFrame(animateAtlas)
  resetAtlasView()
}

function createAtlasGround() {
  const slab = new THREE.Mesh(
    new THREE.BoxGeometry(atlasMapWidth + 1.4, 0.54, atlasMapDepth + 1.4),
    new THREE.MeshStandardMaterial({
      color: 0x8f6531,
      roughness: 0.9,
      metalness: 0.02,
    }),
  )
  slab.position.y = -0.38
  slab.receiveShadow = true
  atlasRoot.add(slab)

  const geometry = new THREE.PlaneGeometry(atlasMapWidth, atlasMapDepth, 220, 140)
  geometry.rotateX(-Math.PI / 2)
  const position = geometry.attributes.position
  for (let i = 0; i < position.count; i += 1) {
    const x = position.getX(i)
    const z = position.getZ(i)
    position.setY(i, atlasTerrainHeightAt(x, z))
  }
  position.needsUpdate = true
  geometry.computeVertexNormals()

  const map = new THREE.Mesh(
    geometry,
    new THREE.MeshStandardMaterial({
      map: createAtlasTexture(),
      roughness: 0.88,
      metalness: 0.01,
    }),
  )
  map.position.y = 0.02
  map.receiveShadow = true
  atlasRoot.add(map)

  const edge = new THREE.Mesh(
    new THREE.PlaneGeometry(atlasMapWidth + 2.2, atlasMapDepth + 2.2),
    new THREE.MeshBasicMaterial({
      color: 0x1d1309,
      transparent: true,
      opacity: 0.22,
      depthWrite: false,
    }),
  )
  edge.rotation.x = -Math.PI / 2
  edge.position.y = -0.22
  atlasRoot.add(edge)
}

function createAtlasIslands() {
  atlasRegions.forEach((region, index) => {
    const center = itemToAtlasPosition({ mapX: region.x, mapY: region.y })
    const radiusX = 5.8 + (index % 3) * 0.7
    const radiusZ = 3.35 + (index % 2) * 0.42
    const island = new THREE.Group()
    island.position.set(center.x, center.y, center.z)
    island.rotation.y = (index - 2) * 0.18

    const cliff = new THREE.Mesh(
      new THREE.CylinderGeometry(1, 1.12, 0.95, 88, 1, false),
      new THREE.MeshStandardMaterial({
        color: 0x8b6a3c,
        roughness: 0.9,
        metalness: 0.02,
      }),
    )
    cliff.scale.set(radiusX, 1, radiusZ)
    cliff.position.y = -0.42
    cliff.castShadow = true
    cliff.receiveShadow = true
    island.add(cliff)

    const cap = new THREE.Mesh(
      new THREE.CylinderGeometry(1, 1.02, 0.18, 88, 1, false),
      new THREE.MeshStandardMaterial({
        color: region.color || 0x9a8550,
        roughness: 0.86,
        metalness: 0.01,
      }),
    )
    cap.scale.set(radiusX * 0.98, 1, radiusZ * 0.98)
    cap.position.y = 0.12
    cap.castShadow = true
    cap.receiveShadow = true
    island.add(cap)

    const rim = new THREE.Mesh(
      new THREE.TorusGeometry(1, 0.025, 8, 96),
      new THREE.MeshStandardMaterial({
        color: 0xffe1a0,
        roughness: 0.72,
        metalness: 0.02,
      }),
    )
    rim.rotation.x = Math.PI / 2
    rim.scale.set(radiusX, radiusZ, 1)
    rim.position.y = 0.24
    rim.castShadow = true
    island.add(rim)

    atlasIslandsGroup.add(island)
  })
}

function createLandmarkTexture(region) {
  const canvas = document.createElement('canvas')
  canvas.width = 420
  canvas.height = 150
  const ctx = canvas.getContext('2d')
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillStyle = 'rgba(47, 31, 16, 0.72)'
  ctx.beginPath()
  ctx.roundRect(20, 26, 380, 92, 18)
  ctx.fill()
  ctx.strokeStyle = 'rgba(255, 239, 196, 0.78)'
  ctx.lineWidth = 5
  ctx.stroke()
  ctx.font = '800 34px sans-serif'
  ctx.lineWidth = 6
  ctx.strokeStyle = 'rgba(20, 12, 4, 0.6)'
  ctx.fillStyle = 'rgba(255, 246, 214, 0.96)'
  ctx.strokeText(region.label, 210, 60)
  ctx.fillText(region.label, 210, 60)
  ctx.font = '500 20px sans-serif'
  ctx.lineWidth = 4
  ctx.fillStyle = 'rgba(255, 239, 202, 0.82)'
  ctx.strokeText(region.subtitle, 210, 94)
  ctx.fillText(region.subtitle, 210, 94)
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  atlasDisposableTextures.push(texture)
  return texture
}

function createAtlasLandmarkModel(region, index) {
  const group = new THREE.Group()
  const main = new THREE.MeshStandardMaterial({ color: 0x76502b, roughness: 0.78, metalness: 0.03 })
  const accent = new THREE.MeshStandardMaterial({ color: region.color || 0xc89452, roughness: 0.7, metalness: 0.02 })
  const dark = new THREE.MeshStandardMaterial({ color: 0x3e2a17, roughness: 0.82, metalness: 0.01 })
  const light = new THREE.MeshStandardMaterial({ color: 0xffdf9c, roughness: 0.62, metalness: 0.04 })

  const add = (geometry, material, position = [0, 0, 0], rotation = [0, 0, 0], scale = [1, 1, 1]) => {
    const mesh = new THREE.Mesh(geometry, material)
    mesh.position.set(...position)
    mesh.rotation.set(...rotation)
    mesh.scale.set(...scale)
    mesh.castShadow = true
    mesh.receiveShadow = true
    group.add(mesh)
    return mesh
  }

  if (region.icon === 'pyramid') {
    add(new THREE.ConeGeometry(0.56, 0.92, 4), accent, [-0.24, 0.46, 0], [0, Math.PI / 4, 0])
    add(new THREE.ConeGeometry(0.34, 0.56, 4), main, [0.46, 0.28, 0.16], [0, Math.PI / 4, 0])
    add(new THREE.BoxGeometry(1.45, 0.08, 0.9), dark, [0.08, 0.04, 0])
  } else if (region.icon === 'camel') {
    add(new THREE.SphereGeometry(0.34, 18, 12), main, [0, 0.54, 0], [0, 0, 0], [1.65, 0.54, 0.44])
    add(new THREE.SphereGeometry(0.16, 16, 10), accent, [-0.22, 0.78, 0], [0, 0, 0], [1, 1.3, 0.78])
    add(new THREE.SphereGeometry(0.16, 16, 10), accent, [0.18, 0.78, 0], [0, 0, 0], [1, 1.3, 0.78])
    add(new THREE.CylinderGeometry(0.055, 0.07, 0.48, 12), main, [0.48, 0.72, 0], [0, 0, -0.55])
    add(new THREE.SphereGeometry(0.13, 14, 10), main, [0.68, 0.9, 0], [0, 0, 0], [1.25, 0.78, 0.72])
    ;[-0.42, -0.16, 0.18, 0.43].forEach((x) => {
      add(new THREE.CylinderGeometry(0.035, 0.045, 0.58, 8), dark, [x, 0.24, x > 0 ? 0.08 : -0.08])
    })
  } else if (region.icon === 'gate') {
    add(new THREE.BoxGeometry(1.34, 0.22, 0.24), main, [0, 0.98, 0])
    add(new THREE.BoxGeometry(0.2, 1.1, 0.22), main, [-0.48, 0.5, 0])
    add(new THREE.BoxGeometry(0.2, 1.1, 0.22), main, [0.48, 0.5, 0])
    add(new THREE.BoxGeometry(0.54, 0.18, 0.2), accent, [0, 0.62, 0.02])
  } else if (region.icon === 'tower' || region.icon === 'lighthouse') {
    add(new THREE.CylinderGeometry(0.28, 0.36, 1.15, 18), main, [0, 0.58, 0])
    add(new THREE.ConeGeometry(0.42, 0.34, 18), accent, [0, 1.32, 0])
    add(new THREE.CylinderGeometry(0.2, 0.2, 0.18, 18), light, [0, 1.1, 0])
    if (region.icon === 'lighthouse') {
      add(new THREE.BoxGeometry(1.25, 0.035, 0.035), light, [0, 1.1, 0], [0, index * 0.4, 0])
    }
  } else {
    add(new THREE.CylinderGeometry(0.08, 0.11, 0.72, 12), dark, [0, 0.36, 0])
    add(new THREE.ConeGeometry(0.48, 0.78, 16), accent, [0, 0.88, 0])
    add(new THREE.ConeGeometry(0.38, 0.62, 16), accent, [0, 1.2, 0])
  }

  group.scale.setScalar(1.72)
  return group
}

function createAtlasLandmarks() {
  atlasRegions.forEach((region, index) => {
    const item = { mapX: region.x, mapY: region.y }
    const position = itemToAtlasPosition(item)
    const model = createAtlasLandmarkModel(region, index)
    model.position.set(position.x, position.y + 0.36, position.z)
    model.rotation.y = (index - 2) * 0.35
    atlasLandmarksGroup.add(model)

    const label = new THREE.Mesh(
      new THREE.PlaneGeometry(4.6, 1.62),
      new THREE.MeshBasicMaterial({
        map: createLandmarkTexture(region),
        transparent: true,
        side: THREE.DoubleSide,
        depthWrite: false,
      }),
    )
    label.position.set(position.x, position.y + 3.38, position.z)
    label.userData.isLandmarkLabel = true
    atlasLandmarksGroup.add(label)

    const base = new THREE.Mesh(
      new THREE.CircleGeometry(1.25, 44),
      new THREE.MeshBasicMaterial({
        color: 0x4b321b,
        transparent: true,
        opacity: 0.22,
        depthWrite: false,
      }),
    )
    base.rotation.x = -Math.PI / 2
    base.position.set(position.x, position.y + 0.04, position.z)
    atlasLandmarksGroup.add(base)
  })
}

function createAtlasNodes() {
  items.value.forEach((item) => {
    const position = itemToAtlasPosition(item)
    const group = new THREE.Group()
    group.position.copy(position)

    const stemHeight = item.kind === 'book' ? 2.35 : 1.62
    const stem = new THREE.Mesh(
      new THREE.CylinderGeometry(0.06, 0.08, stemHeight, 12),
      new THREE.MeshStandardMaterial({ color: 0x654324, roughness: 0.66 }),
    )
    stem.position.y = stemHeight / 2 + 0.04
    stem.castShadow = true
    stem.receiveShadow = true
    group.add(stem)

    const halo = new THREE.Mesh(
      new THREE.CircleGeometry(item.kind === 'book' ? 0.8 : 0.62, 32),
      new THREE.MeshBasicMaterial({
        color: item.kind === 'book' ? 0xffd27a : 0x90e0c2,
        transparent: true,
        opacity: 0.3,
        depthWrite: false,
      }),
    )
    halo.rotation.x = -Math.PI / 2
    halo.position.y = 0.045
    group.add(halo)

    const isBook = item.kind === 'book'
    const fullTexture = createAtlasCardTexture(item)
    const compactTexture = createAtlasMarkerTexture(item)
    const frontMaterial = new THREE.MeshStandardMaterial({
      map: compactTexture,
      roughness: 0.58,
      metalness: 0.03,
    })
    const sideMaterial = new THREE.MeshStandardMaterial({
      color: isBook ? 0x5f3427 : 0x375f58,
      roughness: 0.76,
      metalness: 0.02,
    })
    const pageMaterial = new THREE.MeshStandardMaterial({
      color: 0xf0d9ad,
      roughness: 0.82,
      metalness: 0.01,
    })
    const billboard = new THREE.Group()
    const card = new THREE.Mesh(
      new THREE.BoxGeometry(isBook ? 2.18 : 2.72, isBook ? 3.08 : 1.62, isBook ? 0.42 : 0.32),
      [sideMaterial, sideMaterial, pageMaterial, pageMaterial, frontMaterial, frontMaterial],
    )
    card.castShadow = true
    card.receiveShadow = true
    billboard.position.y = stemHeight + (isBook ? 1.82 : 1.02)
    card.userData.itemId = item.id
    billboard.add(card)
    group.add(billboard)

    atlasNodeEntries.set(item.id, {
      item,
      group,
      card,
      billboard,
      stem,
      halo,
      position,
      frontMaterial,
      fullTexture,
      compactTexture,
      baseBillboardY: billboard.position.y,
    })
    atlasPickTargets.push(card)
    atlasNodesGroup.add(group)
  })
}

function syncAtlasNodeVisibility() {
  if (!atlasNodesGroup) return
  const visibleIds = new Set(visibleItems.value.map((item) => item.id))
  atlasNodeEntries.forEach((entry, id) => {
    entry.group.visible = visibleIds.has(id)
  })
}

function updateAtlasSelection() {
  if (!atlasNodesGroup) return
  atlasNodeEntries.forEach((entry, id) => {
    const selected = id === selectedItem.value?.id
    entry.group.scale.setScalar(selected ? 1.42 : 0.72)
    const nextTexture = selected ? entry.fullTexture : entry.compactTexture
    if (entry.frontMaterial.map !== nextTexture) {
      entry.frontMaterial.map = nextTexture
      entry.frontMaterial.needsUpdate = true
    }
    entry.billboard.position.y = entry.baseBillboardY + (selected ? 0.82 : 0)
    entry.halo.material.opacity = selected ? 0.72 : 0.3
    entry.halo.scale.setScalar(selected ? 2.8 : 1)
  })
}

function updateAtlasRoutes() {
  if (!atlasRoutesGroup) return
  while (atlasRoutesGroup.children.length) {
    disposeObject(atlasRoutesGroup.children.pop())
  }

  const source = selectedItem.value
  if (!source) return
  const sourcePosition = itemToAtlasPosition(source)
  const start = sourcePosition.clone().setY(sourcePosition.y + 0.2)
  visibleItems.value
    .filter((item) => item.id !== source.id)
    .slice(0, 5)
    .forEach((target) => {
      const targetPosition = itemToAtlasPosition(target)
      const end = targetPosition.clone().setY(targetPosition.y + 0.2)
      const mid = start.clone().add(end).multiplyScalar(0.5)
      mid.y = 1.6 + start.distanceTo(end) * 0.1
      const curve = new THREE.QuadraticBezierCurve3(start, mid, end)
      const geometry = new THREE.BufferGeometry().setFromPoints(curve.getPoints(42))
      const line = new THREE.Line(
        geometry,
        new THREE.LineBasicMaterial({
          color: target.kind === 'book' ? 0xd69a4b : 0x5aa6a0,
          transparent: true,
          opacity: 0.64,
          depthWrite: false,
        }),
      )
      atlasRoutesGroup.add(line)
    })
}

function resizeAtlasScene() {
  if (!atlasRenderer || !atlasCamera || !atlasViewportRef.value) return
  const rect = atlasViewportRef.value.getBoundingClientRect()
  atlasViewportWidth = Math.max(1, rect.width)
  atlasViewportHeight = Math.max(1, rect.height)
  atlasRenderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
  atlasRenderer.setSize(atlasViewportWidth, atlasViewportHeight, false)
  atlasCamera.aspect = atlasViewportWidth / atlasViewportHeight
  atlasCamera.updateProjectionMatrix()
}

function animateAtlas() {
  if (!atlasRenderer || !atlasScene || !atlasCamera) return
  atlasCameraCurrentPosition.lerp(atlasCameraPosition, 0.08)
  atlasCameraCurrentTarget.lerp(atlasCameraTarget, 0.08)
  atlasCamera.position.copy(atlasCameraCurrentPosition)
  atlasCamera.lookAt(atlasCameraCurrentTarget.x, atlasCameraCurrentTarget.y + 0.25, atlasCameraCurrentTarget.z)

  atlasNodeEntries.forEach((entry) => {
    if (!entry.group.visible) return
    const lookPoint = atlasCamera.position.clone()
    lookPoint.y = entry.group.position.y + entry.billboard.position.y
    entry.billboard.lookAt(lookPoint)
  })
  atlasLandmarksGroup?.children.forEach((entry) => {
    if (entry.userData?.isLandmarkLabel) {
      const lookPoint = atlasCamera.position.clone()
      lookPoint.y = entry.position.y
      entry.lookAt(lookPoint)
    }
  })

  atlasRenderer.render(atlasScene, atlasCamera)
  atlasRafId = window.requestAnimationFrame(animateAtlas)
}

function pickAtlasItem(event) {
  if (!atlasRenderer || !atlasCamera || !atlasViewportRef.value) return
  const rect = atlasViewportRef.value.getBoundingClientRect()
  atlasPointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
  atlasPointer.y = -(((event.clientY - rect.top) / rect.height) * 2 - 1)

  atlasRaycaster.setFromCamera(atlasPointer, atlasCamera)
  const hits = atlasRaycaster.intersectObjects(atlasPickTargets.filter((target) => target.parent?.visible), false)
  const hit = hits.find((entry) => entry.object.userData.itemId)
  if (!hit) return
  const item = items.value.find((candidate) => candidate.id === hit.object.userData.itemId)
  if (item) selectAtlasItem(item)
}

function disposeAtlasScene() {
  if (atlasRafId) window.cancelAnimationFrame(atlasRafId)
  atlasRafId = 0
  atlasResizeObserver?.disconnect()
  atlasResizeObserver = null
  atlasScene?.traverse((object) => {
    disposeObject(object)
  })
  atlasDisposableTextures.forEach((texture) => texture.dispose())
  atlasDisposableTextures.length = 0
  atlasRenderer?.dispose()
  atlasScene = null
  atlasCamera = null
  atlasRenderer = null
  atlasRoot = null
  atlasIslandsGroup = null
  atlasNodesGroup = null
  atlasRoutesGroup = null
  atlasLandmarksGroup = null
  atlasNodeEntries.clear()
  atlasPickTargets.length = 0
}

function latLngToVector(lat, lng, radius = 2.42) {
  const phi = (lat * Math.PI) / 180
  const theta = (lng * Math.PI) / 180
  return new THREE.Vector3(
    Math.cos(phi) * Math.sin(theta) * radius,
    Math.sin(phi) * radius,
    Math.cos(phi) * Math.cos(theta) * radius,
  )
}

function labelStyle(item) {
  const label = labelState.value[item.id]
  if (!label) {
    return {
      opacity: 0,
      pointerEvents: 'none',
      transform: 'translate3d(-999px, -999px, 0)',
    }
  }

  return {
    opacity: label.opacity,
    pointerEvents: label.visible ? 'auto' : 'none',
    zIndex: label.zIndex,
    transform: `translate3d(${label.x}px, ${label.y}px, 0) translate(-50%, -50%) scale(${label.scale})`,
  }
}

function createEarthTexture() {
  const canvas = document.createElement('canvas')
  canvas.width = 1024
  canvas.height = 512
  const ctx = canvas.getContext('2d')

  const ocean = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
  ocean.addColorStop(0, '#173e58')
  ocean.addColorStop(0.48, '#0e253e')
  ocean.addColorStop(1, '#07121f')
  ctx.fillStyle = ocean
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  ctx.globalAlpha = 0.84
  drawLand(ctx, [
    [160, 150], [220, 104], [310, 128], [336, 202], [286, 250], [210, 238], [154, 196],
  ], '#415c49')
  drawLand(ctx, [
    [410, 128], [520, 88], [630, 132], [674, 218], [594, 278], [462, 254], [384, 196],
  ], '#4c6142')
  drawLand(ctx, [
    [590, 300], [690, 278], [760, 326], [742, 402], [654, 426], [574, 376],
  ], '#6a673e')
  drawLand(ctx, [
    [760, 134], [858, 114], [934, 170], [902, 232], [804, 248], [732, 190],
  ], '#385f54')
  drawLand(ctx, [
    [260, 300], [334, 274], [388, 334], [362, 432], [282, 452], [218, 386],
  ], '#645f3a')

  ctx.globalAlpha = 1
  ctx.strokeStyle = 'rgba(173, 218, 255, 0.16)'
  ctx.lineWidth = 1
  for (let x = 0; x <= canvas.width; x += 64) {
    ctx.beginPath()
    ctx.moveTo(x, 0)
    ctx.lineTo(x, canvas.height)
    ctx.stroke()
  }
  for (let y = 32; y < canvas.height; y += 48) {
    ctx.beginPath()
    ctx.moveTo(0, y)
    ctx.lineTo(canvas.width, y)
    ctx.stroke()
  }

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.anisotropy = 8
  disposableTextures.push(texture)
  return texture
}

function drawLand(ctx, points, color) {
  ctx.fillStyle = color
  ctx.beginPath()
  points.forEach(([x, y], index) => {
    if (index === 0) {
      ctx.moveTo(x, y)
      return
    }
    const previous = points[index - 1]
    ctx.quadraticCurveTo(previous[0], previous[1], x, y)
  })
  ctx.closePath()
  ctx.fill()
}

function createNodeTexture() {
  const canvas = document.createElement('canvas')
  canvas.width = 128
  canvas.height = 128
  const ctx = canvas.getContext('2d')
  const gradient = ctx.createRadialGradient(44, 38, 5, 64, 64, 58)
  gradient.addColorStop(0, 'rgba(255,255,255,1)')
  gradient.addColorStop(0.28, 'rgba(255,255,255,0.92)')
  gradient.addColorStop(0.58, 'rgba(255,255,255,0.42)')
  gradient.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.fillStyle = gradient
  ctx.beginPath()
  ctx.arc(64, 64, 58, 0, Math.PI * 2)
  ctx.fill()

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  disposableTextures.push(texture)
  return texture
}

function initScene() {
  if (!canvasRef.value || !viewportRef.value) return

  scene = new THREE.Scene()
  camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100)
  camera.position.set(0, 0, baseCameraDistance)
  camera.lookAt(0, 0, 0)

  renderer = new THREE.WebGLRenderer({
    canvas: canvasRef.value,
    antialias: true,
    alpha: false,
    powerPreference: 'high-performance',
  })
  renderer.setClearColor(0x07101a, 1)
  renderer.outputColorSpace = THREE.SRGBColorSpace

  scene.add(new THREE.AmbientLight(0x8aa8c8, 1.45))

  const keyLight = new THREE.DirectionalLight(0xffffff, 2.8)
  keyLight.position.set(5, 3.4, 6)
  scene.add(keyLight)

  const rimLight = new THREE.DirectionalLight(0x70ffe0, 1.1)
  rimLight.position.set(-4, -2, -3)
  scene.add(rimLight)

  globeGroup = new THREE.Group()
  scene.add(globeGroup)

  const earth = new THREE.Mesh(
    new THREE.SphereGeometry(2.28, 112, 72),
    new THREE.MeshStandardMaterial({
      map: createEarthTexture(),
      roughness: 0.82,
      metalness: 0.04,
    }),
  )
  globeGroup.add(earth)

  const grid = new THREE.Mesh(
    new THREE.SphereGeometry(2.292, 40, 28),
    new THREE.MeshBasicMaterial({
      color: 0x8ec8ff,
      wireframe: true,
      transparent: true,
      opacity: 0.14,
      depthWrite: false,
    }),
  )
  globeGroup.add(grid)

  const atmosphere = new THREE.Mesh(
    new THREE.SphereGeometry(2.42, 96, 56),
    new THREE.MeshBasicMaterial({
      color: 0x5fb4ff,
      transparent: true,
      opacity: 0.13,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      depthWrite: false,
    }),
  )
  globeGroup.add(atmosphere)

  nodesGroup = new THREE.Group()
  arcsGroup = new THREE.Group()
  globeGroup.add(arcsGroup)
  globeGroup.add(nodesGroup)

  createStars()
  createNodes()
  syncNodeVisibility()
  updateNodeSelection()
  updateArcs()

  resizeScene()
  resizeObserver = new ResizeObserver(resizeScene)
  resizeObserver.observe(viewportRef.value)

  rafId = window.requestAnimationFrame(animate)
}

function createStars() {
  const count = 520
  const positions = new Float32Array(count * 3)

  for (let i = 0; i < count; i += 1) {
    const radius = 12 + Math.random() * 16
    const theta = Math.random() * Math.PI * 2
    const phi = Math.acos(2 * Math.random() - 1)
    positions[i * 3] = Math.sin(phi) * Math.cos(theta) * radius
    positions[i * 3 + 1] = Math.cos(phi) * radius
    positions[i * 3 + 2] = Math.sin(phi) * Math.sin(theta) * radius
  }

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))

  const stars = new THREE.Points(
    geometry,
    new THREE.PointsMaterial({
      color: 0xf6eee0,
      size: 0.034,
      transparent: true,
      opacity: 0.72,
      sizeAttenuation: true,
      depthWrite: false,
    }),
  )
  scene.add(stars)
}

function createNodes() {
  const texture = createNodeTexture()

  items.value.forEach((item) => {
    const color = colorByKind[item.kind] || 0xffffff
    const marker = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: texture,
        color,
        transparent: true,
        opacity: 0.96,
        depthTest: true,
        depthWrite: false,
      }),
    )
    marker.position.copy(latLngToVector(item.lat, item.lng, 2.46))
    marker.scale.set(0.24, 0.24, 1)
    marker.userData.itemId = item.id
    marker.renderOrder = 4

    nodeEntries.set(item.id, { marker, item })
    pickTargets.push(marker)
    nodesGroup.add(marker)
  })
}

function syncNodeVisibility() {
  if (!nodesGroup) return
  const visibleIds = new Set(visibleItems.value.map((item) => item.id))
  nodeEntries.forEach((entry, id) => {
    entry.marker.visible = visibleIds.has(id)
  })
}

function updateNodeSelection() {
  if (!nodesGroup) return
  nodeEntries.forEach((entry, id) => {
    const selected = id === selectedItem.value?.id
    const size = selected ? 0.38 : 0.24
    entry.marker.scale.set(size, size, 1)
    entry.marker.material.opacity = selected ? 1 : 0.86
  })
}

function updateArcs() {
  if (!arcsGroup) return

  while (arcsGroup.children.length) {
    disposeObject(arcsGroup.children.pop())
  }

  const source = selectedItem.value
  if (!source) return

  const targets = visibleItems.value
    .filter((item) => item.id !== source.id)
    .slice(0, 4)

  targets.forEach((target) => {
    const start = latLngToVector(source.lat, source.lng, 2.5)
    const end = latLngToVector(target.lat, target.lng, 2.5)
    const middle = start.clone().add(end).normalize().multiplyScalar(3.08)
    const curve = new THREE.QuadraticBezierCurve3(start, middle, end)
    const geometry = new THREE.BufferGeometry().setFromPoints(curve.getPoints(48))
    const material = new THREE.LineBasicMaterial({
      color: colorByKind[target.kind] || 0xffffff,
      transparent: true,
      opacity: 0.38,
      depthWrite: false,
    })
    arcsGroup.add(new THREE.Line(geometry, material))
  })
}

function resizeScene() {
  if (!renderer || !camera || !viewportRef.value) return

  const rect = viewportRef.value.getBoundingClientRect()
  viewportWidth = Math.max(1, rect.width)
  viewportHeight = Math.max(1, rect.height)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
  renderer.setSize(viewportWidth, viewportHeight, false)
  camera.aspect = viewportWidth / viewportHeight
  camera.updateProjectionMatrix()

  const fov = THREE.MathUtils.degToRad(camera.fov)
  const aspectFit = Math.min(camera.aspect, 1)
  const globeDiameterWithLabels = 5.7
  const fitDistance = globeDiameterWithLabels / (2 * Math.tan(fov / 2) * aspectFit)
  baseCameraDistance = clamp(fitDistance, 7.25, 10.4)
}

function animate() {
  if (globeGroup) {
    globeGroup.rotation.x = rotationX.value
    globeGroup.rotation.y = rotationY.value
  }

  if (camera) {
    const targetDistance = baseCameraDistance / zoom.value
    camera.position.z += (targetDistance - camera.position.z) * 0.12
    camera.lookAt(0, 0, 0)
  }

  updateLabelPositions()
  renderer?.render(scene, camera)
  rafId = window.requestAnimationFrame(animate)
}

function updateLabelPositions() {
  if (!camera || !globeGroup || !viewportRef.value) return

  const nextLabels = {}
  const cameraDirection = camera.position.clone().normalize()
  const rawLabels = []
  const selectedIdValue = selectedItem.value?.id

  visibleItems.value.forEach((item) => {
    const entry = nodeEntries.get(item.id)
    if (!entry?.marker?.visible) return

    const worldPosition = entry.marker.getWorldPosition(new THREE.Vector3())
    const normal = worldPosition.clone().normalize()
    const facing = normal.dot(cameraDirection)
    const projected = worldPosition.clone().project(camera)
    const inFrame = projected.z > -1 && projected.z < 1 && Math.abs(projected.x) < 1.18 && Math.abs(projected.y) < 1.18
    const visible = facing > -0.08 && inFrame
    const depthScale = clamp((facing + 0.2) / 1.2, 0.35, 1)

    const rawX = (projected.x * 0.5 + 0.5) * viewportWidth
    const rawY = (-projected.y * 0.5 + 0.5) * viewportHeight
    const edgeX = viewportWidth < 560 ? 92 : 110
    const edgeY = 28

    rawLabels.push({
      id: item.id,
      x: clamp(rawX, edgeX, Math.max(edgeX, viewportWidth - edgeX)),
      y: clamp(rawY, edgeY, Math.max(edgeY, viewportHeight - edgeY)),
      baseOpacity: clamp(0.35 + depthScale * 0.65, 0.35, 1),
      scale: selectedIdValue === item.id ? 1.08 : clamp(0.78 + depthScale * 0.18, 0.76, 0.98),
      visible,
      zIndex: Math.round(100 + depthScale * 100),
      depthScale,
      selected: selectedIdValue === item.id,
    })
  })

  const maxLabels = viewportWidth < 560 ? 8 : 14
  const allowedLabels = new Set(
    rawLabels
      .filter((label) => label.visible)
      .sort((a, b) => Number(b.selected) - Number(a.selected) || b.depthScale - a.depthScale)
      .slice(0, maxLabels)
      .map((label) => label.id),
  )
  if (selectedIdValue && rawLabels.some((label) => label.id === selectedIdValue && label.visible)) {
    allowedLabels.add(selectedIdValue)
  }

  rawLabels.forEach((label) => {
    const visible = label.visible && allowedLabels.has(label.id)
    nextLabels[label.id] = {
      x: label.x,
      y: label.y,
      opacity: visible ? label.baseOpacity : 0,
      scale: label.scale,
      visible,
      zIndex: label.zIndex,
    }
  })

  labelState.value = nextLabels
}

function onPointerDown(event) {
  if (!viewportRef.value || event.button > 0) return
  dragging.value = true
  pointerMoved.value = false
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
  if (Math.abs(dx) + Math.abs(dy) > 4) {
    pointerMoved.value = true
  }

  rotationY.value = dragOrigin.value.rotationY + dx * 0.006
  rotationX.value = clamp(dragOrigin.value.rotationX + dy * 0.004, -1.05, 0.95)
}

function onPointerUp() {
  if (pointerMoved.value) {
    suppressNextClick.value = true
  }
  dragging.value = false
}

function onCanvasClick(event) {
  if (suppressNextClick.value) {
    suppressNextClick.value = false
    return
  }
  pickItem(event)
}

function onWheel(event) {
  if (!event.ctrlKey && !event.metaKey && !event.shiftKey) return
  event.preventDefault()
  zoom.value = clamp(zoom.value - event.deltaY * 0.0012, 0.76, 1.48)
}

function pickItem(event) {
  if (!renderer || !camera || !viewportRef.value) return

  const rect = viewportRef.value.getBoundingClientRect()
  pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
  pointer.y = -(((event.clientY - rect.top) / rect.height) * 2 - 1)

  raycaster.setFromCamera(pointer, camera)
  const hits = raycaster.intersectObjects(pickTargets.filter((target) => target.visible), false)
  const hit = hits.find((entry) => entry.object.userData.itemId)
  if (!hit) return

  const item = items.value.find((candidate) => candidate.id === hit.object.userData.itemId)
  if (item) selectItem(item)
}

function disposeObject(object) {
  object?.geometry?.dispose?.()
  if (Array.isArray(object?.material)) {
    object.material.forEach((material) => material.dispose?.())
  } else {
    object?.material?.dispose?.()
  }
}

function disposeScene() {
  if (rafId) window.cancelAnimationFrame(rafId)
  rafId = 0
  resizeObserver?.disconnect()
  resizeObserver = null

  scene?.traverse((object) => {
    disposeObject(object)
  })

  disposableTextures.forEach((texture) => texture.dispose())
  disposableTextures.length = 0
  renderer?.dispose()
  scene = null
  camera = null
  renderer = null
  globeGroup = null
  nodesGroup = null
  arcsGroup = null
  nodeEntries.clear()
  pickTargets.length = 0
}

onMounted(() => {
  if (viewMode.value === 'atlas') {
    initAtlasScene()
  } else if (viewMode.value === 'globe') {
    initScene()
  }
})

onUnmounted(() => {
  stopRoaming()
  disposeAtlasScene()
  disposeScene()
})
</script>

<style scoped>
.space-browser {
  height: 100%;
  min-height: 0;
  overflow-y: auto;
  padding: 24px;
  color: #f5efe6;
  background:
    radial-gradient(circle at 18% 18%, rgba(72, 159, 225, 0.22), transparent 28%),
    radial-gradient(circle at 82% 16%, rgba(245, 177, 91, 0.18), transparent 24%),
    radial-gradient(circle at 50% 90%, rgba(86, 226, 173, 0.14), transparent 30%),
    linear-gradient(180deg, #0a111d 0%, #101726 45%, #151826 100%);
}

.space-browser::-webkit-scrollbar {
  width: 8px;
}

.space-browser::-webkit-scrollbar-thumb {
  background: rgba(180, 202, 255, 0.22);
  border-radius: 999px;
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
  letter-spacing: 0.16em;
  text-transform: uppercase;
  font-size: 11px;
  color: rgba(226, 233, 247, 0.72);
}

.hero-title {
  margin: 10px 0 8px;
  font-size: clamp(30px, 4.2vw, 46px);
  line-height: 1.05;
  color: #fff8eb;
}

.hero-desc {
  margin: 0;
  color: rgba(239, 244, 252, 0.76);
  max-width: 58ch;
  line-height: 1.6;
}

.hero-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-width: min(520px, 100%);
}

.view-switch {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 4px;
  padding: 4px;
  border: 1px solid rgba(183, 204, 255, 0.14);
  border-radius: 8px;
  background: rgba(11, 18, 34, 0.66);
  backdrop-filter: blur(18px);
}

.view-switch-btn {
  border: 0;
  border-radius: 6px;
  padding: 10px 14px;
  background: transparent;
  color: rgba(235, 242, 255, 0.72);
  cursor: pointer;
  font-weight: 700;
}

.view-switch-btn.active {
  background: rgba(246, 214, 148, 0.18);
  color: #fff5dc;
  box-shadow: inset 0 0 0 1px rgba(246, 214, 148, 0.24);
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

.search-wrap input::placeholder {
  color: rgba(235, 242, 255, 0.46);
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
  border-radius: 8px;
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
  grid-template-columns: minmax(0, 2.25fr) minmax(300px, 0.72fr);
  gap: 18px;
  align-items: start;
  padding-bottom: 36px;
}

.browser-stage,
.browser-panel,
.panel-card {
  border: 1px solid rgba(187, 208, 255, 0.12);
  background: rgba(8, 13, 24, 0.45);
  backdrop-filter: blur(20px);
  box-shadow: 0 28px 80px rgba(0, 0, 0, 0.28);
}

.browser-stage {
  position: relative;
  min-height: clamp(680px, 78vh, 920px);
  border-radius: 12px;
  overflow: hidden;
  isolation: isolate;
}

.browser-stage::before {
  content: '';
  position: absolute;
  inset: 0;
  background-image:
    radial-gradient(circle at 12% 18%, rgba(255, 255, 255, 0.9) 0 1px, transparent 1.2px),
    radial-gradient(circle at 78% 32%, rgba(255, 255, 255, 0.9) 0 1px, transparent 1.2px),
    radial-gradient(circle at 22% 64%, rgba(255, 255, 255, 0.8) 0 1px, transparent 1.2px),
    radial-gradient(circle at 58% 82%, rgba(255, 255, 255, 0.7) 0 1px, transparent 1.2px);
  background-size: 220px 220px;
  opacity: 0.2;
  pointer-events: none;
}

.atlas-stage {
  background:
    radial-gradient(ellipse at 50% 18%, rgba(255, 246, 216, 0.45), transparent 34%),
    linear-gradient(180deg, #263b4d 0%, #9fb1a0 38%, #dbc17f 72%, #6b4d32 100%);
  box-shadow: 0 30px 80px rgba(43, 31, 18, 0.28);
  perspective: 1200px;
  perspective-origin: 50% 38%;
}

.atlas-stage::before {
  background-image:
    linear-gradient(180deg, rgba(255, 244, 211, 0.18), transparent 46%),
    radial-gradient(circle at 18% 22%, rgba(255, 255, 255, 0.46) 0 1px, transparent 1.4px),
    radial-gradient(circle at 72% 24%, rgba(255, 255, 255, 0.3) 0 1px, transparent 1.4px);
  background-size: auto, 180px 180px, 220px 220px;
  opacity: 0.62;
}

.atlas-stage::after {
  content: '';
  position: absolute;
  inset: 0;
  z-index: 2;
  pointer-events: none;
  background:
    radial-gradient(ellipse at center, transparent 50%, rgba(39, 28, 20, 0.32) 100%),
    linear-gradient(180deg, rgba(19, 33, 48, 0.1), transparent 24%, rgba(49, 30, 16, 0.18));
}

.atlas-viewport {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: clamp(680px, 78vh, 920px);
  overflow: hidden;
  cursor: grab;
  touch-action: pan-y;
  perspective: 1200px;
  perspective-origin: 50% 38%;
}

.atlas-viewport:active {
  cursor: grabbing;
}

.atlas-canvas {
  position: absolute;
  inset: 0;
  z-index: 3;
  width: 100%;
  height: 100%;
  display: block;
}

.atlas-depth-vignette {
  position: absolute;
  inset: 0;
  z-index: 4;
  pointer-events: none;
  background:
    radial-gradient(ellipse at 50% 44%, transparent 46%, rgba(26, 20, 14, 0.22) 100%),
    linear-gradient(180deg, rgba(255, 245, 216, 0.18), transparent 28%, rgba(55, 35, 18, 0.2));
}

.atlas-cue-card {
  position: absolute;
  left: 20px;
  bottom: 142px;
  z-index: 7;
  display: grid;
  gap: 7px;
  max-width: min(390px, calc(100% - 40px));
  border: 1px solid rgba(255, 239, 202, 0.32);
  border-radius: 8px;
  padding: 12px 14px;
  background: rgba(53, 35, 20, 0.64);
  color: #fff7e7;
  backdrop-filter: blur(12px);
  box-shadow: 0 18px 38px rgba(39, 24, 10, 0.26);
}

.cue-kicker {
  color: rgba(255, 239, 202, 0.68);
  font-size: 11px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.atlas-cue-card strong {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 15px;
}

.atlas-cue-card p {
  margin: 0;
  color: rgba(255, 247, 228, 0.82);
  font-size: 13px;
  line-height: 1.55;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.cue-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.cue-tags span {
  border: 1px solid rgba(255, 239, 202, 0.2);
  border-radius: 999px;
  padding: 4px 8px;
  color: rgba(255, 247, 228, 0.86);
  background: rgba(255, 255, 255, 0.06);
  font-size: 11px;
}

.atlas-book-rail {
  position: absolute;
  left: 18px;
  right: 18px;
  bottom: 18px;
  z-index: 8;
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: minmax(168px, 210px);
  gap: 10px;
  overflow-x: auto;
  padding: 10px;
  border: 1px solid rgba(255, 239, 202, 0.22);
  border-radius: 10px;
  background: rgba(43, 30, 18, 0.58);
  backdrop-filter: blur(14px);
  scrollbar-width: thin;
}

.atlas-rail-card {
  display: grid;
  gap: 5px;
  min-width: 0;
  border: 1px solid rgba(255, 239, 202, 0.16);
  border-radius: 8px;
  padding: 10px 12px;
  background: rgba(255, 247, 224, 0.1);
  color: #fff7e7;
  text-align: left;
  cursor: pointer;
  transition: transform 0.18s ease, background 0.18s ease, border-color 0.18s ease;
}

.atlas-rail-card.active {
  border-color: rgba(255, 212, 122, 0.7);
  background: rgba(185, 104, 58, 0.42);
}

.atlas-rail-card strong,
.atlas-rail-card small {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.atlas-rail-card strong {
  font-size: 13px;
}

.atlas-rail-card small,
.rail-kind {
  color: rgba(255, 239, 202, 0.68);
  font-size: 11px;
}

.atlas-world {
  position: absolute;
  left: 50%;
  top: 50%;
  z-index: 3;
  transform-origin: center;
  transform-style: preserve-3d;
  transition: transform 0.42s cubic-bezier(0.22, 1, 0.36, 1);
}

.atlas-horizon {
  position: absolute;
  inset: 0;
  z-index: 1;
  pointer-events: none;
  background:
    linear-gradient(180deg, rgba(255, 246, 217, 0.28), transparent 26%),
    radial-gradient(ellipse at 50% 47%, rgba(67, 92, 86, 0.38), transparent 38%);
}

.horizon-cloud {
  position: absolute;
  height: 56px;
  border-radius: 999px;
  background: rgba(255, 248, 224, 0.34);
  filter: blur(10px);
}

.horizon-cloud--left {
  left: 9%;
  top: 14%;
  width: 240px;
}

.horizon-cloud--right {
  right: 8%;
  top: 18%;
  width: 280px;
}

.atlas-paper,
.atlas-wash,
.atlas-mountain,
.atlas-routes {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.atlas-world-shadow {
  position: absolute;
  left: 7%;
  right: 7%;
  top: 10%;
  bottom: 5%;
  border-radius: 48px;
  background: rgba(40, 26, 12, 0.38);
  filter: blur(34px);
  transform: translateZ(-70px) translateY(44px);
  pointer-events: none;
}

.atlas-paper {
  border-radius: 42px;
  background:
    radial-gradient(ellipse at 22% 66%, rgba(198, 142, 49, 0.32), transparent 31%),
    radial-gradient(ellipse at 50% 34%, rgba(95, 142, 95, 0.24), transparent 34%),
    radial-gradient(ellipse at 80% 44%, rgba(92, 145, 152, 0.2), transparent 28%),
    linear-gradient(135deg, #f7e7bd 0%, #efe0b3 48%, #e4cb8c 100%);
  border: 1px solid rgba(96, 65, 31, 0.22);
  box-shadow:
    inset 0 0 80px rgba(111, 75, 31, 0.22),
    0 42px 70px rgba(55, 32, 12, 0.34);
  transform: translateZ(0);
  transform-style: preserve-3d;
}

.atlas-paper::after {
  content: '';
  position: absolute;
  left: 34px;
  right: 34px;
  bottom: -34px;
  height: 42px;
  border-radius: 0 0 30px 30px;
  background: linear-gradient(180deg, #b98c4f, #77522a);
  transform-origin: top;
  transform: rotateX(-78deg);
  box-shadow: 0 28px 30px rgba(49, 27, 11, 0.28);
}

.atlas-wash--top {
  background:
    radial-gradient(ellipse at 22% 24%, rgba(91, 130, 102, 0.28), transparent 22%),
    radial-gradient(ellipse at 48% 18%, rgba(89, 126, 150, 0.22), transparent 28%),
    radial-gradient(ellipse at 78% 22%, rgba(124, 105, 82, 0.18), transparent 24%);
  filter: blur(1px);
  transform: translateZ(8px);
}

.atlas-wash--bottom {
  background:
    radial-gradient(ellipse at 18% 78%, rgba(197, 138, 42, 0.22), transparent 24%),
    radial-gradient(ellipse at 52% 76%, rgba(97, 132, 79, 0.22), transparent 22%),
    radial-gradient(ellipse at 82% 76%, rgba(151, 70, 64, 0.18), transparent 20%);
  transform: translateZ(10px);
}

.atlas-mountain--left {
  clip-path: polygon(0 62%, 8% 48%, 16% 60%, 26% 42%, 35% 60%, 44% 50%, 52% 62%, 52% 100%, 0 100%);
  background: linear-gradient(180deg, rgba(72, 88, 75, 0.02), rgba(65, 76, 62, 0.26));
  transform: translateZ(18px);
}

.atlas-mountain--right {
  clip-path: polygon(58% 58%, 66% 42%, 74% 61%, 84% 38%, 92% 58%, 100% 46%, 100% 100%, 58% 100%);
  background: linear-gradient(180deg, rgba(61, 85, 82, 0.02), rgba(56, 75, 71, 0.24));
  transform: translateZ(20px);
}

.atlas-routes {
  width: 100%;
  height: 100%;
  fill: none;
  stroke: rgba(75, 126, 153, 0.36);
  stroke-width: 3;
  stroke-linecap: round;
  stroke-dasharray: 8 12;
  transform: translateZ(24px);
}

.atlas-region {
  position: absolute;
  display: grid;
  gap: 4px;
  transform: translate(-50%, -50%);
  color: rgba(69, 52, 31, 0.66);
  text-align: center;
  pointer-events: none;
  transform: translate(-50%, -50%) translateZ(34px);
}

.region-title {
  font-family: Georgia, 'Times New Roman', serif;
  font-size: 24px;
  font-weight: 700;
  letter-spacing: 0.08em;
}

.region-subtitle {
  font-size: 12px;
  letter-spacing: 0.06em;
}

.atlas-node {
  position: absolute;
  width: 214px;
  height: 58px;
  border: 0;
  padding: 0;
  background: transparent;
  color: #3f2f1b;
  cursor: pointer;
  transform:
    translate(-50%, -50%)
    translateZ(var(--node-depth))
    rotateZ(6deg)
    rotateX(-58deg)
    scale(var(--node-scale));
  transform-style: preserve-3d;
  transform-origin: center bottom;
  transition: transform 0.24s ease;
}

.atlas-node-face {
  position: relative;
  z-index: 3;
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  gap: 9px;
  align-items: center;
  height: 100%;
  max-width: 214px;
  border: 1px solid rgba(92, 65, 35, 0.2);
  border-radius: 8px;
  padding: 8px 10px;
  background: rgba(255, 249, 226, 0.88);
  box-shadow:
    0 18px 30px rgba(69, 45, 18, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.42);
  transform: translateZ(10px);
  transform-style: preserve-3d;
}

.atlas-node-face::after {
  content: '';
  position: absolute;
  inset: 9px -8px -8px 12px;
  z-index: -1;
  border-radius: 8px;
  background: rgba(91, 60, 31, 0.24);
  transform: translateZ(-18px);
}

.atlas-node.active .atlas-node-face {
  border-color: rgba(156, 71, 55, 0.72);
  background: rgba(255, 244, 211, 0.94);
  box-shadow:
    0 28px 48px rgba(92, 48, 26, 0.32),
    0 0 0 8px rgba(156, 71, 55, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.5);
}

.atlas-pin-stem {
  position: absolute;
  left: 28px;
  top: 47px;
  width: 4px;
  height: var(--stem-height);
  border-radius: 999px;
  background: linear-gradient(180deg, rgba(255, 244, 211, 0.7), rgba(91, 60, 31, 0.42));
  box-shadow: 0 0 18px rgba(255, 231, 166, 0.24);
  transform-origin: top center;
  transform: translateZ(-8px) rotateX(58deg);
  pointer-events: none;
}

.atlas-pin-shadow {
  position: absolute;
  left: 28px;
  top: calc(46px + var(--stem-height));
  width: 58px;
  height: 18px;
  border-radius: 50%;
  background: rgba(53, 35, 16, 0.26);
  filter: blur(4px);
  transform: translate(-50%, -50%) translateZ(calc(var(--node-depth) * -1)) rotateX(58deg);
  pointer-events: none;
}

.atlas-cover,
.atlas-symbol {
  width: 32px;
  height: 44px;
  border-radius: 4px;
  overflow: hidden;
  background: linear-gradient(160deg, #6f3f2f, #c18a45);
  color: #fff7dc;
  display: grid;
  place-items: center;
  font-size: 13px;
  font-weight: 800;
  box-shadow: 0 7px 14px rgba(62, 38, 17, 0.25);
  transform: translateZ(12px);
}

.atlas-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.atlas-node--topic .atlas-symbol,
.atlas-node--topic .atlas-cover {
  background: linear-gradient(160deg, #a85e2d, #e0b45c);
}

.atlas-node--tool .atlas-symbol,
.atlas-node--tool .atlas-cover {
  background: linear-gradient(160deg, #2f6f67, #6ab698);
}

.atlas-node--place .atlas-symbol,
.atlas-node--place .atlas-cover {
  background: linear-gradient(160deg, #7b3c5b, #cc7c91);
}

.atlas-node-copy {
  display: grid;
  gap: 3px;
  min-width: 0;
}

.atlas-node-title {
  max-width: 150px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-weight: 800;
  font-size: 13px;
}

.atlas-node-meta {
  color: rgba(71, 51, 27, 0.66);
  font-size: 11px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.tour-toggle {
  position: absolute;
  z-index: 7;
  left: 20px;
  bottom: 270px;
  border: 1px solid rgba(92, 65, 35, 0.16);
  border-radius: 8px;
  background: rgba(255, 249, 226, 0.78);
  color: #45321c;
  padding: 10px 14px;
  font-weight: 800;
  cursor: pointer;
  backdrop-filter: blur(8px);
}

.tour-toggle.active {
  background: rgba(156, 71, 55, 0.9);
  color: #fff7e7;
}

.atlas-controls {
  background: rgba(255, 249, 226, 0.7);
  color: #45321c;
}

.atlas-controls button {
  color: #45321c;
  background: rgba(88, 57, 26, 0.08);
  font-size: 14px;
  font-weight: 800;
}

.galaxy-stage {
  background:
    radial-gradient(circle at 22% 18%, rgba(120, 199, 255, 0.22), transparent 24%),
    radial-gradient(circle at 74% 28%, rgba(255, 184, 105, 0.2), transparent 28%),
    radial-gradient(circle at 50% 72%, rgba(94, 226, 173, 0.14), transparent 30%),
    linear-gradient(135deg, #070b15 0%, #151021 46%, #071a19 100%);
}

.galaxy-stage::before {
  background-image:
    radial-gradient(circle at 12% 18%, rgba(255, 255, 255, 0.9) 0 1px, transparent 1.4px),
    radial-gradient(circle at 38% 72%, rgba(255, 220, 146, 0.78) 0 1px, transparent 1.4px),
    radial-gradient(circle at 84% 42%, rgba(155, 225, 255, 0.86) 0 1px, transparent 1.4px),
    radial-gradient(circle at 62% 16%, rgba(255, 142, 184, 0.72) 0 1px, transparent 1.4px);
  background-size: 170px 170px, 230px 230px, 190px 190px, 260px 260px;
  opacity: 0.58;
}

.galaxy-space {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: clamp(680px, 78vh, 920px);
  overflow: hidden;
}

.galaxy-space::after {
  content: '';
  position: absolute;
  inset: 0;
  z-index: 4;
  pointer-events: none;
  background:
    radial-gradient(ellipse at center, transparent 48%, rgba(0, 0, 0, 0.48) 100%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.05), transparent 22%, rgba(0, 0, 0, 0.24));
}

.galaxy-cluster {
  position: absolute;
  width: var(--cluster-size);
  height: calc(var(--cluster-size) * 0.72);
  transform: translate(-50%, -50%) rotate(-8deg);
  border-radius: 50%;
  background:
    radial-gradient(ellipse at center, var(--cluster-color), transparent 68%),
    radial-gradient(ellipse at 32% 38%, rgba(255, 255, 255, 0.1), transparent 42%);
  filter: blur(0.2px);
  pointer-events: none;
}

.galaxy-cluster::after {
  content: '';
  position: absolute;
  inset: 18%;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 50%;
  transform: rotate(18deg);
}

.galaxy-cluster-title,
.galaxy-cluster-subtitle {
  position: absolute;
  left: 50%;
  display: block;
  max-width: 150px;
  transform: translateX(-50%) rotate(8deg);
  text-align: center;
  text-shadow: 0 2px 14px rgba(0, 0, 0, 0.55);
}

.galaxy-cluster-title {
  top: 42%;
  color: rgba(255, 248, 226, 0.74);
  font-size: 14px;
  font-weight: 800;
}

.galaxy-cluster-subtitle {
  top: calc(42% + 24px);
  color: rgba(238, 245, 255, 0.42);
  font-size: 11px;
  line-height: 1.35;
}

.galaxy-links {
  position: absolute;
  inset: 0;
  z-index: 2;
  width: 100%;
  height: 100%;
  overflow: visible;
}

.galaxy-link {
  stroke: rgba(218, 235, 255, 0.44);
  stroke-width: 1.25;
  vector-effect: non-scaling-stroke;
  filter: drop-shadow(0 0 8px rgba(122, 196, 255, 0.34));
}

.galaxy-link--topic {
  stroke: rgba(255, 184, 105, 0.58);
}

.galaxy-link--tool {
  stroke: rgba(94, 226, 173, 0.54);
}

.galaxy-link--place {
  stroke: rgba(255, 142, 184, 0.52);
}

.galaxy-node {
  position: absolute;
  display: grid;
  place-items: center;
  width: var(--node-ring);
  height: var(--node-ring);
  border: 0;
  padding: 0;
  background: transparent;
  color: #fff8eb;
  cursor: pointer;
  transform: translate(-50%, -50%);
  transition: transform 0.2s ease, opacity 0.2s ease;
}

.galaxy-node:not(.active):not(.linked) {
  opacity: 0.68;
}

.galaxy-node.active {
  transform: translate(-50%, -50%) scale(1.06);
}

.galaxy-node-orbit {
  position: absolute;
  inset: 0;
  border: 1px solid rgba(255, 255, 255, 0.16);
  border-radius: 50%;
  box-shadow:
    inset 0 0 22px var(--node-glow),
    0 0 28px var(--node-glow);
  opacity: 0.5;
}

.galaxy-node.linked .galaxy-node-orbit,
.galaxy-node.active .galaxy-node-orbit {
  opacity: 0.9;
}

.galaxy-node-core {
  width: var(--node-size);
  height: var(--node-size);
  border-radius: 50%;
  background: radial-gradient(circle at 35% 30%, #fff, var(--node-color) 36%, rgba(8, 13, 24, 0.35) 100%);
  box-shadow:
    0 0 0 5px rgba(255, 255, 255, 0.05),
    0 0 24px var(--node-glow),
    0 0 48px var(--node-glow);
  animation: galaxyPulse 4.2s ease-in-out infinite;
  animation-delay: var(--node-delay);
}

.galaxy-node-label {
  position: absolute;
  left: 50%;
  top: calc(50% + var(--label-offset));
  max-width: 132px;
  padding: 6px 8px;
  border: 1px solid rgba(205, 224, 255, 0.18);
  border-radius: 8px;
  background: rgba(7, 10, 18, 0.76);
  color: rgba(255, 248, 235, 0.92);
  font-size: 11px;
  line-height: 1.2;
  opacity: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  pointer-events: none;
  transform: translateX(-50%) translateY(4px);
  transition: opacity 0.18s ease, transform 0.18s ease;
  white-space: nowrap;
}

.galaxy-node.linked .galaxy-node-label,
.galaxy-node.active .galaxy-node-label,
.galaxy-node:hover .galaxy-node-label {
  opacity: 1;
  transform: translateX(-50%) translateY(0);
}

.galaxy-focus {
  position: absolute;
  left: 20px;
  bottom: 20px;
  z-index: 7;
  display: grid;
  gap: 4px;
  max-width: min(340px, calc(100% - 40px));
  border: 1px solid rgba(205, 224, 255, 0.18);
  border-radius: 8px;
  padding: 12px 14px;
  background: rgba(7, 10, 18, 0.72);
  color: #fff8eb;
  backdrop-filter: blur(12px);
  box-shadow: 0 18px 40px rgba(0, 0, 0, 0.24);
}

.galaxy-focus span {
  color: rgba(220, 233, 255, 0.62);
  font-size: 11px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.galaxy-focus strong {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 15px;
}

@keyframes galaxyPulse {
  0%,
  100% {
    transform: scale(1);
  }

  50% {
    transform: scale(1.16);
  }
}

.viewport {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: clamp(680px, 78vh, 920px);
  cursor: grab;
  touch-action: pan-y;
}

.viewport:active {
  cursor: grabbing;
}

.space-canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  display: block;
}

.render-badge,
.stage-controls {
  position: absolute;
  z-index: 6;
  border: 1px solid rgba(180, 202, 255, 0.14);
  background: rgba(8, 13, 24, 0.62);
  color: rgba(239, 245, 255, 0.82);
  backdrop-filter: blur(12px);
}

.render-badge {
  left: 20px;
  top: 20px;
  padding: 8px 12px;
  border-radius: 999px;
  font-size: 12px;
}

.stage-controls {
  right: 18px;
  top: 18px;
  display: flex;
  gap: 4px;
  padding: 4px;
  border-radius: 8px;
}

.stage-controls button {
  width: 32px;
  height: 32px;
  border: 0;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.08);
  color: #fff;
  cursor: pointer;
  font-size: 18px;
  line-height: 1;
}

.stage-controls button:hover {
  background: rgba(118, 164, 255, 0.24);
}

.world-node {
  position: absolute;
  left: 0;
  top: 0;
  display: flex;
  align-items: center;
  gap: 8px;
  border: 0;
  background: transparent;
  color: #fff;
  transform-origin: center;
  transition: opacity 0.12s ease;
  will-change: transform, opacity;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.38);
}

.node-dot {
  width: 13px;
  height: 13px;
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
  border-radius: 8px;
  border: 1px solid rgba(186, 206, 255, 0.16);
  background: rgba(10, 16, 30, 0.72);
  backdrop-filter: blur(6px);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.world-node.active .node-label {
  background: rgba(82, 138, 255, 0.22);
  border-color: rgba(126, 172, 255, 0.56);
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
  border-radius: 12px;
}

.panel-card {
  padding: 18px;
  border-radius: 8px;
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
  color: #fff8eb;
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
  grid-template-columns: auto minmax(0, 1fr);
  gap: 10px;
  text-align: left;
  padding: 12px 14px;
}

.entry-title {
  font-size: 14px;
  overflow-wrap: anywhere;
}

@media (hover: hover) {
  .filter-chip:hover,
  .primary-btn:hover,
  .ghost-btn:hover,
  .entry-row:hover,
  .atlas-rail-card:hover {
    transform: translateY(-1px);
    border-color: rgba(135, 172, 255, 0.34);
  }
}

@media (max-width: 1100px) {
  .browser-layout {
    grid-template-columns: 1fr;
  }

  .browser-stage,
  .viewport,
  .atlas-viewport,
  .galaxy-space {
    min-height: min(62vh, 620px);
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
  .viewport,
  .atlas-viewport,
  .galaxy-space {
    min-height: 48vh;
  }

  .render-badge {
    left: 14px;
    top: 14px;
  }

  .stage-controls {
    right: 12px;
    top: 12px;
  }

  .tour-toggle {
    left: 14px;
    bottom: 218px;
  }

  .atlas-cue-card {
    left: 14px;
    bottom: 92px;
    max-width: calc(100% - 28px);
    padding: 10px 12px;
  }

  .atlas-cue-card p {
    -webkit-line-clamp: 2;
  }

  .atlas-book-rail {
    left: 12px;
    right: 12px;
    bottom: 12px;
    grid-auto-columns: minmax(142px, 170px);
    padding: 8px;
  }

  .atlas-node {
    width: 172px;
    height: 52px;
  }

  .atlas-node-face {
    padding: 7px 8px;
    gap: 7px;
  }

  .atlas-cover,
  .atlas-symbol {
    width: 26px;
    height: 36px;
  }

  .atlas-node-title {
    max-width: 112px;
    font-size: 12px;
  }

  .region-title {
    font-size: 18px;
  }

  .node-label {
    max-width: 9rem;
  }

  .view-switch-btn {
    padding: 9px 8px;
    font-size: 12px;
  }

  .galaxy-cluster-title {
    font-size: 12px;
  }

  .galaxy-cluster-subtitle {
    display: none;
  }

  .galaxy-node-label {
    max-width: 96px;
    font-size: 10px;
  }

  .galaxy-node.linked:not(.active) .galaxy-node-label {
    opacity: 0;
    transform: translateX(-50%) translateY(4px);
  }

  .galaxy-focus {
    left: 14px;
    bottom: 14px;
    max-width: calc(100% - 28px);
  }

  .panel-title {
    font-size: 22px;
  }
}
</style>
