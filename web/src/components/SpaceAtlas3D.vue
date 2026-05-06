<template>
  <div class="space-atlas">
    <header class="atlas-topbar">
      <div>
        <span class="atlas-kicker">Book World Atlas</span>
        <h1>书籍世界地图</h1>
      </div>

      <div class="atlas-toolbar" @pointerdown.stop @click.stop>
        <button :class="{ active: cameraMode === 'overview' }" @click="goOverview">全景</button>
        <button :class="{ active: cameraMode === 'island' }" @click="focusRegion(activeRegionId)">主题区</button>
        <button :class="{ active: roaming }" @click="toggleRoaming">{{ roaming ? '暂停巡游' : '自动巡游' }}</button>
      </div>
    </header>

    <main class="atlas-shell">
      <section
        ref="viewportRef"
        class="atlas-stage"
        @pointerdown="onPointerDown"
        @pointermove="onPointerMove"
        @pointerup="onPointerUp"
        @pointercancel="onPointerUp"
        @pointerleave="onPointerUp"
        @click="onStageClick"
        @wheel="onWheel"
      >
        <canvas ref="canvasRef" class="atlas-canvas"></canvas>
        <div ref="labelsRef" class="atlas-label-layer"></div>
        <div class="atlas-fog" aria-hidden="true"></div>

        <aside class="atlas-detail">
          <span>{{ selectedItem ? kindLabel(selectedItem.kind) : activeRegion?.label }}</span>
          <strong>{{ selectedItem?.shortTitle || selectedItem?.title || activeRegion?.label }}</strong>
          <p>{{ selectedItem?.summary || activeRegion?.subtitle || '点击底部书籍或地图中的书块，镜头会飞到对应主题世界。' }}</p>
          <div class="atlas-tags" v-if="selectedItem?.tags?.length">
            <em v-for="tag in selectedItem.tags.slice(0, 3)" :key="tag">{{ tag }}</em>
          </div>
        </aside>
      </section>

      <nav class="atlas-island-list" aria-label="主题世界列表">
        <button
          v-for="region in atlasRegions"
          :key="region.id"
          :class="{ active: region.id === activeRegionId }"
          @click="focusRegion(region.id)"
        >
          <span :style="{ background: region.cssColor }"></span>
          <strong>{{ region.label }}</strong>
          <small>{{ region.subtitle }}</small>
        </button>
      </nav>

      <nav class="atlas-book-rail" aria-label="书籍列表">
        <button
          v-for="item in railItems"
          :key="item.id"
          :class="{ active: item.id === selectedItem?.id }"
          @click="focusItem(item)"
        >
          <span>{{ kindLabel(item.kind) }}</span>
          <strong>{{ item.shortTitle || item.title }}</strong>
          <small>{{ item.era }}</small>
        </button>
      </nav>
    </main>
  </div>
</template>

<script setup>
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { CSS2DObject, CSS2DRenderer } from 'three/examples/jsm/renderers/CSS2DRenderer.js'
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'

const props = defineProps({
  registry: {
    type: Object,
    default: () => ({ site: {}, books: [], topics: [], tools: [] }),
  },
})

const atlasRegions = [
  { id: 'mind', label: '心理疗愈群岛', subtitle: '情绪 / 身体 / 自我理解', icon: 'tree', color: 0x6f9c6a, cssColor: '#7cae74', x: 29, y: 58 },
  { id: 'thinking', label: '认知决策高地', subtitle: '判断 / 系统 / 误区', icon: 'pyramid', color: 0xd6a45c, cssColor: '#d6a45c', x: 48, y: 38 },
  { id: 'dialogue', label: '沟通关系港', subtitle: '表达 / 边界 / 对话', icon: 'gate', color: 0x6ea9a0, cssColor: '#6ea9a0', x: 69, y: 57 },
  { id: 'leadership', label: '组织与成长山脉', subtitle: '领导力 / 教练 / 复杂度', icon: 'tower', color: 0x9f8350, cssColor: '#9f8350', x: 42, y: 23 },
  { id: 'practice', label: '学习方法平原', subtitle: '习惯 / 输出 / 复利', icon: 'camel', color: 0xca8744, cssColor: '#ca8744', x: 18, y: 35 },
  { id: 'care', label: '健康照护海岸', subtitle: '生命 / 医疗 / 告别', icon: 'lighthouse', color: 0x6d9a98, cssColor: '#6d9a98', x: 82, y: 32 },
]

const categoryAnchors = {
  心理疗愈与自我探索: { regionId: 'mind', x: 29, y: 58, era: '心理疗愈' },
  认知决策与系统思考: { regionId: 'thinking', x: 48, y: 38, era: '认知决策' },
  沟通表达与关系对话: { regionId: 'dialogue', x: 69, y: 57, era: '沟通关系' },
  领导管理与组织教练: { regionId: 'leadership', x: 42, y: 23, era: '领导组织' },
  学习成长与习惯方法: { regionId: 'practice', x: 18, y: 35, era: '学习成长' },
  医疗健康与照护认知: { regionId: 'care', x: 82, y: 32, era: '健康照护' },
}

const fallbackItems = [
  { id: 'book-thinking-fast', kind: 'book', title: '思考，快与慢', shortTitle: '思考快慢', regionId: 'thinking', summary: '判断、偏差与系统 1/2 的切换，是认知岛的核心入口。', tags: ['判断', '偏差', '思维'], era: '认知入口', mapX: 47, mapY: 39 },
  { id: 'book-nvc', kind: 'book', title: '非暴力沟通', shortTitle: '非暴力沟通', regionId: 'dialogue', summary: '把语言、感受、需要和请求拆开，让误听更容易被看见。', tags: ['关系', '表达', '需要'], era: '关系入口', mapX: 69, mapY: 56 },
  { id: 'book-leadership', kind: 'book', title: '领导者的意识进化', shortTitle: '意识进化', regionId: 'leadership', summary: '从复杂度、成长边际和发展性实践切入领导力。', tags: ['领导力', '复杂度'], era: '能力入口', mapX: 42, mapY: 24 },
  { id: 'book-mindset-traps', kind: 'book', title: '走出心智的误区', shortTitle: '心智误区', regionId: 'mind', summary: '判断自己是不是被看起来很有道理的解释带偏。', tags: ['误区', '校正'], era: '校正入口', mapX: 30, mapY: 59 },
  { id: 'topic-travel', kind: 'topic', title: '带着问题的旅行', shortTitle: '问题旅行', regionId: 'practice', summary: '把旅行从打卡变成观看训练。', tags: ['旅行', '观看'], era: '主题入口', mapX: 18, mapY: 35 },
  { id: 'tool-partner', kind: 'tool', title: '思想伙伴', shortTitle: '思想伙伴', regionId: 'dialogue', summary: '给当前处境配几种看法，再收成一个最小行动。', tags: ['处境', '行动'], era: '工具入口', mapX: 72, mapY: 60 },
  { id: 'tool-lab', kind: 'tool', title: '卡点工作台', shortTitle: '卡点工作台', regionId: 'mind', summary: '从原话、情绪、需要与问题结构出发。', tags: ['原话', '卡点'], era: '工具入口', mapX: 25, mapY: 63 },
  { id: 'tool-paths', kind: 'tool', title: '练习路线地图', shortTitle: '练习路线', regionId: 'practice', summary: '把书、卡片、练习和输出任务组织成路线。', tags: ['路线', '输出'], era: '路径入口', mapX: 21, mapY: 39 },
  { id: 'tool-ops', kind: 'tool', title: '个人工作台', shortTitle: '工作台', regionId: 'thinking', summary: '把网页项目、原型探索、内容选题和数据复盘放在一起推进。', tags: ['工作台', '项目'], era: '生产入口', mapX: 52, mapY: 42 },
  { id: 'place-xiamen', kind: 'place', title: '厦门 / 泉州', shortTitle: '厦门泉州', regionId: 'care', summary: '旅行专题的真实样本，把地方、问题和观察连成一条线。', tags: ['地方', '观察'], era: '地点入口', mapX: 82, mapY: 32 },
  { id: 'tool-event', kind: 'tool', title: '社会事件入口', shortTitle: '事件入口', regionId: 'care', summary: '把热榜、事件和卡点工作台连接起来。', tags: ['事件', '现实'], era: '外部入口', mapX: 78, mapY: 35 },
  { id: 'tool-career', kind: 'tool', title: '职业 / 能力路径', shortTitle: '能力路径', regionId: 'leadership', summary: '把角色、能力和练习串成可走的路线。', tags: ['能力', '职业'], era: '路径入口', mapX: 39, mapY: 28 },
]

const mapWidth = 150
const mapDepth = 94
const sceneScale = 1.55
const canvasRef = ref(null)
const viewportRef = ref(null)
const labelsRef = ref(null)
const selectedId = ref('')
const activeRegionId = ref('thinking')
const cameraMode = ref('overview')
const dragging = ref(false)
const moved = ref(false)
const dragStart = ref({ x: 0, y: 0 })
const yaw = ref(-0.08)
const pitch = ref(0.78)
const distance = ref(136)
const roaming = ref(false)

let scene = null
let camera = null
let renderer = null
let labelRenderer = null
let root = null
let resizeObserver = null
let rafId = 0
let roamTimer = 0
let gltfLoader = null
let cameraTarget = new THREE.Vector3(0, 0, 0)
let cameraCurrentTarget = new THREE.Vector3(0, 0, 0)
let desiredYaw = -0.08
let desiredPitch = 0.78
let desiredDistance = 136
let currentYaw = -0.08
let currentPitch = 0.78
let currentDistance = 136

const raycaster = new THREE.Raycaster()
const pointer = new THREE.Vector2()
const itemEntries = new Map()
const regionEntries = new Map()
const pickTargets = []
const materials = []
const textures = []
const loadedModels = new Map()

const kenneyModelBase = '/atlas-assets/models/kenney/fantasy-town-kit/Models/GLB%20format'
const kenneyHexModelBase = '/atlas-assets/models/kenney/hexagon-kit/Models/GLB%20format'
const kenneySurvivalModelBase = '/atlas-assets/models/kenney/survival-kit/Models/GLB%20format'
const redbookModelBase = '/atlas-assets/models/redbook/custom-glb'
const externalModelAssets = {
  bannerGreen: `${kenneyModelBase}/banner-green.glb`,
  bannerRed: `${kenneyModelBase}/banner-red.glb`,
  bridge: `${kenneyHexModelBase}/bridge.glb`,
  buildingArchery: `${kenneyHexModelBase}/building-archery.glb`,
  buildingCabin: `${kenneyHexModelBase}/building-cabin.glb`,
  buildingCastle: `${kenneyHexModelBase}/building-castle.glb`,
  buildingDock: `${kenneyHexModelBase}/building-dock.glb`,
  buildingMarket: `${kenneyHexModelBase}/building-market.glb`,
  buildingPort: `${kenneyHexModelBase}/building-port.glb`,
  buildingTower: `${kenneyHexModelBase}/building-tower.glb`,
  buildingVillage: `${kenneyHexModelBase}/building-village.glb`,
  buildingWizardTower: `${kenneyHexModelBase}/building-wizard-tower.glb`,
  campfirePit: `${kenneySurvivalModelBase}/campfire-pit.glb`,
  cart: `${kenneyModelBase}/cart.glb`,
  chest: `${kenneySurvivalModelBase}/chest.glb`,
  fenceGate: `${kenneyModelBase}/fence-gate.glb`,
  fountainRound: `${kenneyModelBase}/fountain-round.glb`,
  grassLarge: `${kenneySurvivalModelBase}/grass-large.glb`,
  hedgeLarge: `${kenneyModelBase}/hedge-large.glb`,
  lantern: `${kenneyModelBase}/lantern.glb`,
  patchGrassLarge: `${kenneySurvivalModelBase}/patch-grass-large.glb`,
  pillarStone: `${kenneyModelBase}/pillar-stone.glb`,
  planks: `${kenneyModelBase}/planks.glb`,
  road: `${kenneyModelBase}/road.glb`,
  rockLarge: `${kenneyModelBase}/rock-large.glb`,
  rockA: `${kenneySurvivalModelBase}/rock-a.glb`,
  rockB: `${kenneySurvivalModelBase}/rock-b.glb`,
  rockC: `${kenneySurvivalModelBase}/rock-c.glb`,
  rockFlatGrass: `${kenneySurvivalModelBase}/rock-flat-grass.glb`,
  stoneMountain: `${kenneyHexModelBase}/stone-mountain.glb`,
  stallGreen: `${kenneyModelBase}/stall-green.glb`,
  stallRed: `${kenneyModelBase}/stall-red.glb`,
  stairsStone: `${kenneyModelBase}/stairs-stone.glb`,
  stairsWood: `${kenneyModelBase}/stairs-wide-wood.glb`,
  survivalSignpost: `${kenneySurvivalModelBase}/signpost.glb`,
  survivalTent: `${kenneySurvivalModelBase}/tent.glb`,
  toolAxe: `${kenneySurvivalModelBase}/tool-axe.glb`,
  toolHammer: `${kenneySurvivalModelBase}/tool-hammer.glb`,
  toolPickaxe: `${kenneySurvivalModelBase}/tool-pickaxe.glb`,
  toolShovel: `${kenneySurvivalModelBase}/tool-shovel.glb`,
  tree: `${kenneyModelBase}/tree.glb`,
  treeAutumn: `${kenneySurvivalModelBase}/tree-autumn.glb`,
  treeHighRound: `${kenneyModelBase}/tree-high-round.glb`,
  treeTall: `${kenneySurvivalModelBase}/tree-tall.glb`,
  unitShip: `${kenneyHexModelBase}/unit-ship.glb`,
  unitShipLarge: `${kenneyHexModelBase}/unit-ship-large.glb`,
  wallDoor: `${kenneyModelBase}/wall-door.glb`,
  waterRocks: `${kenneyHexModelBase}/water-rocks.glb`,
  workbench: `${kenneySurvivalModelBase}/workbench.glb`,
  workbenchAnvil: `${kenneySurvivalModelBase}/workbench-anvil.glb`,
  redbookBridgeDoor: `${redbookModelBase}/bridge-door-boundary.glb`,
  redbookCareLighthouse: `${redbookModelBase}/care-lighthouse.glb`,
  redbookCompassPath: `${redbookModelBase}/compass-path.glb`,
  redbookDialogueTable: `${redbookModelBase}/dialogue-table.glb`,
  redbookDualClock: `${redbookModelBase}/dual-clock-decision.glb`,
  redbookGreenhouse: `${redbookModelBase}/sensitivity-greenhouse.glb`,
  redbookMirrorLamp: `${redbookModelBase}/mirror-lamp-self.glb`,
  redbookPracticeWorkbench: `${redbookModelBase}/practice-workbench.glb`,
  redbookStairTower: `${redbookModelBase}/stair-tower-growth.glb`,
  redbookTrojan: `${redbookModelBase}/trojan-program.glb`,
}

const items = computed(() => buildAtlasItems(props.registry))
const railItems = computed(() => items.value.filter((item) => item.kind === 'book').slice(0, 18).concat(items.value.filter((item) => item.kind !== 'book').slice(0, 8)))
const selectedItem = computed(() => items.value.find((item) => item.id === selectedId.value) || null)
const activeRegion = computed(() => atlasRegions.find((region) => region.id === activeRegionId.value) || atlasRegions[0])

watch(
  items,
  (nextItems) => {
    if (!selectedId.value && nextItems[0]) selectedId.value = nextItems[0].id
    rebuildSceneObjects()
  },
  { deep: true },
)

function hashText(value) {
  return Array.from(String(value || '')).reduce((sum, char, index) => (sum + char.charCodeAt(0) * (index + 7)) % 9973, 0)
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value))
}

function spreadAround(anchor, seed, radiusX = 11, radiusY = 7) {
  const angle = ((seed % 360) * Math.PI) / 180
  const ring = 0.35 + ((seed % 37) / 37) * 0.75
  return {
    x: clamp(anchor.x + Math.cos(angle) * radiusX * ring, 7, 93),
    y: clamp(anchor.y + Math.sin(angle) * radiusY * ring, 8, 92),
  }
}

function buildAtlasItems(registry) {
  const books = (registry?.books || []).filter((book) => book?.slug)
  const topics = (registry?.topics || []).filter((topic) => topic?.slug)
  const tools = (registry?.tools || []).filter((tool) => tool?.slug)
  if (!books.length && !topics.length && !tools.length) return fallbackItems

  const bookItems = books.slice(0, 36).map((book, index) => {
    const anchor = categoryAnchors[book.primaryCategory] || categoryAnchors[book.secondaryCategory] || categoryAnchors['心理疗愈与自我探索']
    const point = spreadAround(anchor, hashText(`${book.slug}-${book.title}-${index}`))
    return {
      id: `book-${book.slug}`,
      kind: 'book',
      title: book.title || book.slug,
      shortTitle: book.shortTitle || book.title || book.slug,
      summary: book.description || '这本书已接入多书知识站，可进入阅读地图继续探索。',
      tags: [book.primaryCategory, book.secondaryCategory, ...(book.entryTopics || [])].filter(Boolean),
      era: anchor.era,
      regionId: anchor.regionId,
      mapX: point.x,
      mapY: point.y,
      targetUrl: `/books/${encodeURIComponent(book.slug)}`,
    }
  })

  const topicItems = topics.slice(0, 8).map((topic, index) => {
    const region = atlasRegions[(hashText(topic.slug) + index) % atlasRegions.length]
    const point = spreadAround(region, hashText(topic.title), 8, 6)
    return {
      id: `topic-${topic.slug}`,
      kind: 'topic',
      title: topic.title || topic.slug,
      shortTitle: topic.shortTitle || topic.title || topic.slug,
      summary: topic.description || '专题入口用于把多本书和一个现实问题连起来。',
      tags: topic.tags || [],
      era: topic.phaseLabel || '专题入口',
      regionId: region.id,
      mapX: point.x,
      mapY: point.y,
      targetUrl: `/topics/${encodeURIComponent(topic.slug)}`,
    }
  })

  const toolItems = tools.slice(0, 8).map((tool, index) => {
    const region = atlasRegions[(index + 2) % atlasRegions.length]
    const point = spreadAround(region, hashText(tool.slug || tool.title), 7, 5)
    return {
      id: `tool-${tool.slug}`,
      kind: 'tool',
      title: tool.title || tool.slug,
      shortTitle: tool.shortTitle || tool.title || tool.slug,
      summary: tool.description || '工具入口用于把书中的能力转成可操作的工作流。',
      tags: tool.tags || ['工具'],
      era: tool.phaseLabel || '工具入口',
      regionId: region.id,
      mapX: point.x,
      mapY: point.y,
      targetUrl: `/tools/${encodeURIComponent(tool.slug)}`,
    }
  })

  return [...bookItems, ...topicItems, ...toolItems]
}

function kindLabel(kind) {
  return { book: '书籍', topic: '主题', tool: '工具', place: '地点' }[kind] || '入口'
}

function regionColor(regionId) {
  return atlasRegions.find((region) => region.id === regionId)?.color || 0xb9854e
}

function visualProfileForItem(item) {
  const text = [item.title, item.shortTitle, item.summary, item.era, ...(item.tags || [])].join(' ')
  if (/人类木马|木马|程序|自动/.test(text)) return { form: 'trojan', regionId: item.regionId || 'mind' }
  if (/高敏感|敏感|天赋|身体|情绪/.test(text)) return { form: 'greenhouse', regionId: item.regionId || 'mind' }
  if (/非暴力|沟通|倾听|关系|表达|边界|请求/.test(text)) return { form: 'dialogue-table', regionId: item.regionId || 'dialogue' }
  if (/思考|快与慢|判断|偏差|认知|系统/.test(text)) return { form: 'dual-clock', regionId: item.regionId || 'thinking' }
  if (/领导|组织|教练|复杂度|成长边际/.test(text)) return { form: 'stair-tower', regionId: item.regionId || 'leadership' }
  if (/学习|习惯|路径|练习|输出|复利|方法/.test(text)) return { form: 'workbench', regionId: item.regionId || 'practice' }
  if (/健康|医疗|照护|生命|告别|身体/.test(text)) return { form: 'care-lighthouse', regionId: item.regionId || 'care' }
  if (/旅行|地方|观看|厦门|泉州/.test(text)) return { form: 'compass-path', regionId: item.regionId || 'practice' }

  return {
    form: {
      mind: 'mirror-lamp',
      thinking: 'gear-balance',
      dialogue: 'bridge-door',
      leadership: 'stair-tower',
      practice: 'workbench',
      care: 'care-lighthouse',
    }[item.regionId] || 'object-shrine',
    regionId: item.regionId || 'thinking',
  }
}

function redbookAssetForForm(form) {
  return {
    trojan: 'redbookTrojan',
    greenhouse: 'redbookGreenhouse',
    'dialogue-table': 'redbookDialogueTable',
    'dual-clock': 'redbookDualClock',
    'gear-balance': 'redbookDualClock',
    'stair-tower': 'redbookStairTower',
    workbench: 'redbookPracticeWorkbench',
    'care-lighthouse': 'redbookCareLighthouse',
    'compass-path': 'redbookCompassPath',
    'bridge-door': 'redbookBridgeDoor',
    'mirror-lamp': 'redbookMirrorLamp',
  }[form] || ''
}

function worldFromPercent(x = 50, y = 50) {
  return new THREE.Vector3((x / 100 - 0.5) * mapWidth, terrainElevation(x, y), (y / 100 - 0.5) * mapDepth)
}

function terrainHeight(x, y) {
  let h = Math.sin(x * 0.078) * Math.cos(y * 0.071) * 0.95
  h += Math.sin((x + y) * 0.045) * 0.55
  h += Math.cos((x - y) * 0.058) * 0.38
  atlasRegions.forEach((region, index) => {
    const dx = (x - region.x) / 13
    const dy = (y - region.y) / 9
    h += Math.exp(-(dx * dx + dy * dy)) * (3.4 + (index % 3) * 0.68)
  })
  const eastWater = Math.max(0, (x - 78) / 22) * 1.8
  const southWater = Math.max(0, (y - 82) / 18) * 1.45
  return h - eastWater - southWater
}

function terrainElevation(x, y) {
  return terrainHeight(x, y) * 0.62
}

function material(options) {
  const mat = new THREE.MeshStandardMaterial(options)
  materials.push(mat)
  return mat
}

function prepareModelInstance(object, scale = 1) {
  object.scale.multiplyScalar(scale)
  object.traverse((child) => {
    if (!child.isMesh) return
    child.castShadow = true
    child.receiveShadow = true
  })
  return object
}

function loadExternalModel(assetId) {
  const url = externalModelAssets[assetId]
  if (!url) return Promise.resolve(null)
  if (loadedModels.has(assetId)) return loadedModels.get(assetId)
  if (!gltfLoader) gltfLoader = new GLTFLoader()
  const promise = gltfLoader
    .loadAsync(url)
    .then((gltf) => prepareModelInstance(gltf.scene, 1))
    .catch((error) => {
      console.warn(`Failed to load atlas model ${assetId}`, error)
      return null
    })
  loadedModels.set(assetId, promise)
  return promise
}

function addExternalModel(parent, assetId, options = {}) {
  const anchor = new THREE.Group()
  anchor.position.set(...(options.position || [0, 0, 0]))
  anchor.rotation.set(...(options.rotation || [0, 0, 0]))
  anchor.scale.setScalar(options.scale || 1)
  parent.add(anchor)
  loadExternalModel(assetId).then((source) => {
    if (!source || !anchor.parent) return
    const instance = source.clone(true)
    instance.traverse((child) => {
      if (!child.isMesh) return
      child.castShadow = true
      child.receiveShadow = true
    })
    anchor.add(instance)
  })
  return anchor
}

function createTextTexture(text, options = {}) {
  const canvas = document.createElement('canvas')
  canvas.width = options.width || 512
  canvas.height = options.height || 256
  const ctx = canvas.getContext('2d')
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  if (options.fill) {
    ctx.fillStyle = options.fill
    ctx.beginPath()
    ctx.roundRect(20, 20, canvas.width - 40, canvas.height - 40, options.radius || 24)
    ctx.fill()
  }
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.font = options.font || '800 54px sans-serif'
  ctx.lineWidth = options.strokeWidth || 8
  ctx.strokeStyle = options.stroke || 'rgba(32, 20, 8, 0.74)'
  ctx.fillStyle = options.color || '#fff5d8'
  wrapCanvasText(ctx, text, canvas.width / 2, canvas.height / 2, canvas.width - 72, options.lineHeight || 62, options.maxLines || 3)
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.anisotropy = 8
  textures.push(texture)
  return texture
}

function createBookCoverTexture(item) {
  const profile = visualProfileForItem(item)
  const style = coverStyleForProfile(profile.form, item.regionId)
  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 680
  const ctx = canvas.getContext('2d')
  const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
  gradient.addColorStop(0, style.top)
  gradient.addColorStop(0.56, style.mid)
  gradient.addColorStop(1, style.bottom)
  ctx.fillStyle = gradient
  roundedRect(ctx, 0, 0, canvas.width, canvas.height, 34)
  ctx.fill()

  ctx.globalAlpha = 0.22
  for (let i = 0; i < 42; i += 1) {
    const x = seededUnit(hashText(item.id) + i * 7) * canvas.width
    const y = seededUnit(hashText(item.title) + i * 11) * canvas.height
    const r = 12 + seededUnit(i + hashText(item.shortTitle)) * 38
    ctx.strokeStyle = i % 2 ? style.ink : '#fff0c8'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.arc(x, y, r, 0, Math.PI * 2)
    ctx.stroke()
  }
  ctx.globalAlpha = 1

  ctx.fillStyle = 'rgba(255, 245, 214, 0.92)'
  roundedRect(ctx, 54, 66, 404, 430, 28)
  ctx.fill()
  ctx.strokeStyle = 'rgba(54, 35, 18, 0.24)'
  ctx.lineWidth = 5
  ctx.stroke()

  drawCoverSymbol(ctx, profile.form, style, 256, 272)
  ctx.fillStyle = style.ink
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.font = '800 45px sans-serif'
  wrapCanvasText(ctx, item.shortTitle || item.title, 256, 565, 390, 52, 2)
  ctx.fillStyle = 'rgba(55, 36, 20, 0.58)'
  ctx.font = '700 25px sans-serif'
  ctx.fillText(kindLabel(item.kind), 256, 624)

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.anisotropy = 8
  textures.push(texture)
  return texture
}

function coverStyleForProfile(form, regionId) {
  const regionHex = `#${regionColor(regionId || 'thinking').toString(16).padStart(6, '0')}`
  const styles = {
    trojan: { top: '#7e4d35', mid: '#b97845', bottom: '#e3b66c', ink: '#4a2a1b' },
    greenhouse: { top: '#4f876e', mid: '#8fbf91', bottom: '#d9d09b', ink: '#27533d' },
    'dialogue-table': { top: '#427f78', mid: '#82b6a8', bottom: '#d6c07e', ink: '#234d49' },
    'dual-clock': { top: '#4d6380', mid: '#b69762', bottom: '#ead18d', ink: '#25384e' },
    'gear-balance': { top: '#59636b', mid: '#a88e5a', bottom: '#e0c37b', ink: '#2e3439' },
    'stair-tower': { top: '#6c5d42', mid: '#a6824d', bottom: '#d9b36b', ink: '#392f22' },
    workbench: { top: '#75593a', mid: '#b9854e', bottom: '#d9bc78', ink: '#3e2c1d' },
    'care-lighthouse': { top: '#4c7d84', mid: '#81a99c', bottom: '#e0c985', ink: '#25484d' },
    'compass-path': { top: '#8a6540', mid: '#c28b4f', bottom: '#e4c577', ink: '#493521' },
    'bridge-door': { top: '#53776f', mid: '#9ca879', bottom: '#dcc382', ink: '#31453f' },
    'mirror-lamp': { top: '#6c6f86', mid: '#a6998a', bottom: '#e1c887', ink: '#37384a' },
  }
  return styles[form] || { top: regionHex, mid: '#b99a62', bottom: '#e3c681', ink: '#35261a' }
}

function roundedRect(ctx, x, y, width, height, radius) {
  ctx.beginPath()
  ctx.moveTo(x + radius, y)
  ctx.lineTo(x + width - radius, y)
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius)
  ctx.lineTo(x + width, y + height - radius)
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height)
  ctx.lineTo(x + radius, y + height)
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius)
  ctx.lineTo(x, y + radius)
  ctx.quadraticCurveTo(x, y, x + radius, y)
  ctx.closePath()
}

function drawCoverSymbol(ctx, form, style, cx, cy) {
  ctx.save()
  ctx.translate(cx, cy)
  ctx.strokeStyle = style.ink
  ctx.fillStyle = style.ink
  ctx.lineWidth = 16
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'

  if (form === 'trojan') {
    ctx.fillRect(-92, -20, 150, 58)
    ctx.beginPath()
    ctx.moveTo(46, -34)
    ctx.lineTo(108, -6)
    ctx.lineTo(54, 18)
    ctx.closePath()
    ctx.fill()
    ctx.fillRect(-74, 36, 18, 72)
    ctx.fillRect(20, 36, 18, 72)
    ctx.beginPath()
    ctx.arc(-72, 110, 22, 0, Math.PI * 2)
    ctx.arc(38, 110, 22, 0, Math.PI * 2)
    ctx.fill()
  } else if (form === 'greenhouse') {
    ctx.strokeRect(-90, -18, 180, 110)
    ctx.beginPath()
    ctx.moveTo(-96, -18)
    ctx.quadraticCurveTo(0, -122, 96, -18)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(0, 84)
    ctx.lineTo(0, -8)
    ctx.stroke()
    ctx.beginPath()
    ctx.arc(0, -42, 38, Math.PI * 0.2, Math.PI * 0.9)
    ctx.stroke()
  } else if (form === 'dialogue-table') {
    ctx.beginPath()
    ctx.arc(0, 10, 70, 0, Math.PI * 2)
    ctx.stroke()
    ctx.fillRect(-112, -76, 70, 58)
    ctx.fillRect(42, -76, 70, 58)
    ;[-45, -15, 15, 45].forEach((x) => {
      ctx.beginPath()
      ctx.arc(x, 10, 9, 0, Math.PI * 2)
      ctx.fill()
    })
  } else if (form === 'dual-clock') {
    ;[-54, 54].forEach((x, i) => {
      ctx.beginPath()
      ctx.arc(x, -18, 48, 0, Math.PI * 2)
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(x, -18)
      ctx.lineTo(x + (i ? 22 : -20), -48)
      ctx.moveTo(x, -18)
      ctx.lineTo(x + (i ? -14 : 16), 16)
      ctx.stroke()
    })
    ctx.fillRect(-76, 58, 152, 22)
  } else if (form === 'gear-balance') {
    ctx.beginPath()
    ctx.arc(-58, -18, 52, 0, Math.PI * 2)
    ctx.stroke()
    for (let i = 0; i < 8; i += 1) {
      const a = (i / 8) * Math.PI * 2
      ctx.fillRect(-58 + Math.cos(a) * 63 - 8, -18 + Math.sin(a) * 63 - 8, 16, 16)
    }
    ctx.beginPath()
    ctx.moveTo(42, -72)
    ctx.lineTo(42, 82)
    ctx.moveTo(-14, -26)
    ctx.lineTo(98, -26)
    ctx.stroke()
  } else if (form === 'stair-tower') {
    ;[0, 1, 2, 3].forEach((i) => ctx.fillRect(-100 + i * 48, 66 - i * 34, 52, 30))
    ctx.fillRect(42, -70, 58, 148)
    ctx.beginPath()
    ctx.moveTo(34, -70)
    ctx.lineTo(72, -126)
    ctx.lineTo(110, -70)
    ctx.closePath()
    ctx.fill()
  } else if (form === 'workbench') {
    ctx.fillRect(-110, -12, 220, 32)
    ctx.fillRect(-82, 18, 18, 88)
    ctx.fillRect(64, 18, 18, 88)
    ctx.beginPath()
    ctx.moveTo(-62, -64)
    ctx.lineTo(-18, -20)
    ctx.moveTo(48, -72)
    ctx.lineTo(12, -18)
    ctx.stroke()
  } else if (form === 'care-lighthouse') {
    ctx.beginPath()
    ctx.moveTo(-38, 104)
    ctx.lineTo(-18, -82)
    ctx.lineTo(28, -82)
    ctx.lineTo(48, 104)
    ctx.closePath()
    ctx.fill()
    ctx.fillRect(-36, -118, 82, 36)
    ctx.beginPath()
    ctx.moveTo(-120, -96)
    ctx.lineTo(120, -42)
    ctx.stroke()
  } else if (form === 'compass-path') {
    ctx.beginPath()
    ctx.arc(0, -8, 86, 0, Math.PI * 2)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(0, -94)
    ctx.lineTo(28, 0)
    ctx.lineTo(0, 90)
    ctx.lineTo(-28, 0)
    ctx.closePath()
    ctx.fill()
  } else if (form === 'bridge-door') {
    ctx.fillRect(-110, 40, 220, 30)
    ;[-80, -28, 28, 80].forEach((x) => ctx.fillRect(x - 7, -22, 14, 68))
    ctx.strokeRect(22, -104, 76, 124)
  } else {
    ctx.beginPath()
    ctx.arc(-38, -8, 58, 0, Math.PI * 2)
    ctx.stroke()
    ctx.fillRect(28, 12, 82, 18)
    ctx.beginPath()
    ctx.arc(84, -60, 38, 0, Math.PI * 2)
    ctx.stroke()
  }
  ctx.restore()
}

function wrapCanvasText(ctx, text, x, y, maxWidth, lineHeight, maxLines) {
  const lines = []
  let line = ''
  String(text || '').split('').forEach((char) => {
    const next = line + char
    if (ctx.measureText(next).width > maxWidth && line) {
      lines.push(line)
      line = char
    } else {
      line = next
    }
  })
  if (line) lines.push(line)
  const visible = lines.slice(0, maxLines)
  const startY = y - ((visible.length - 1) * lineHeight) / 2
  visible.forEach((entry, index) => {
    ctx.strokeText(entry, x, startY + index * lineHeight)
    ctx.fillText(entry, x, startY + index * lineHeight)
  })
}

function initScene() {
  if (!canvasRef.value || !viewportRef.value || !labelsRef.value || renderer) return
  scene = new THREE.Scene()
  scene.fog = new THREE.Fog(0xd9c78d, 90, 250)
  camera = new THREE.PerspectiveCamera(36, 1, 0.1, 360)

  renderer = new THREE.WebGLRenderer({ canvas: canvasRef.value, antialias: true, alpha: true, powerPreference: 'high-performance' })
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.setClearColor(0x000000, 0)
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap

  labelRenderer = new CSS2DRenderer({ element: labelsRef.value })
  labelRenderer.domElement.style.position = 'absolute'
  labelRenderer.domElement.style.inset = '0'
  labelRenderer.domElement.style.pointerEvents = 'none'

  root = new THREE.Group()
  root.scale.setScalar(sceneScale)
  scene.add(root)

  const hemi = new THREE.HemisphereLight(0xffefcf, 0x485d65, 1.5)
  scene.add(hemi)
  const sun = new THREE.DirectionalLight(0xffffff, 2.7)
  sun.position.set(-42, 68, 54)
  sun.castShadow = true
  sun.shadow.mapSize.set(2048, 2048)
  sun.shadow.camera.left = -120
  sun.shadow.camera.right = 120
  sun.shadow.camera.top = 90
  sun.shadow.camera.bottom = -90
  sun.shadow.camera.near = 1
  sun.shadow.camera.far = 220
  scene.add(sun)

  createWorld()
  rebuildSceneObjects()
  resizeScene()
  resizeObserver = new ResizeObserver(resizeScene)
  resizeObserver.observe(viewportRef.value)
  goOverview()
  rafId = window.requestAnimationFrame(animate)
}

function createWorld() {
  const base = new THREE.Mesh(
    new THREE.BoxGeometry(mapWidth + 20, 2.4, mapDepth + 18),
    material({ color: 0x527c80, roughness: 0.9 }),
  )
  base.position.y = -1.95
  base.receiveShadow = true
  root.add(base)

  const water = new THREE.Mesh(
    new THREE.PlaneGeometry(mapWidth + 18, mapDepth + 16, 1, 1),
    material({ color: 0x4f8388, roughness: 0.58, transparent: true, opacity: 0.42 }),
  )
  water.rotation.x = -Math.PI / 2
  water.position.y = -0.64
  water.receiveShadow = true
  root.add(water)

  const terrain = new THREE.PlaneGeometry(mapWidth, mapDepth, 150, 92)
  terrain.rotateX(-Math.PI / 2)
  const positions = terrain.attributes.position
  for (let i = 0; i < positions.count; i += 1) {
    const px = ((positions.getX(i) / mapWidth) + 0.5) * 100
    const py = ((positions.getZ(i) / mapDepth) + 0.5) * 100
    positions.setY(i, terrainElevation(px, py))
  }
  positions.needsUpdate = true
  terrain.computeVertexNormals()
  const terrainMesh = new THREE.Mesh(
    terrain,
    material({
      color: 0xffffff,
      map: createMapTexture(),
      roughness: 0.94,
      metalness: 0.01,
    }),
  )
  terrainMesh.receiveShadow = true
  terrainMesh.position.y = -0.06
  root.add(terrainMesh)

  createAmbientScenery()
  atlasRegions.forEach((region, index) => createIsland(region, index))
  createRoutes()
}

function createAmbientScenery() {
  const profiles = {
    mind: { assets: ['treeTall', 'treeHighRound', 'treeAutumn', 'grassLarge', 'patchGrassLarge', 'survivalTent'], count: 18, radiusX: 14, radiusY: 9, scale: [0.04, 0.078] },
    thinking: { assets: ['rockFlatGrass', 'rockA', 'rockB', 'rockC', 'stoneMountain', 'pillarStone'], count: 16, radiusX: 15, radiusY: 9, scale: [0.04, 0.082] },
    dialogue: { assets: ['wallDoor', 'fenceGate', 'lantern', 'bridge', 'planks', 'hedgeLarge'], count: 15, radiusX: 13, radiusY: 8, scale: [0.034, 0.07] },
    leadership: { assets: ['buildingTower', 'buildingArchery', 'stairsStone', 'bannerRed', 'bannerGreen', 'rockLarge'], count: 15, radiusX: 14, radiusY: 8, scale: [0.032, 0.074] },
    practice: { assets: ['workbench', 'cart', 'survivalSignpost', 'campfirePit', 'toolAxe', 'toolHammer', 'toolPickaxe'], count: 17, radiusX: 14, radiusY: 9, scale: [0.034, 0.078] },
    care: { assets: ['buildingDock', 'buildingPort', 'unitShip', 'unitShipLarge', 'lantern', 'tree'], count: 14, radiusX: 13, radiusY: 8, scale: [0.03, 0.066] },
  }

  atlasRegions.forEach((region) => {
    const profile = profiles[region.id]
    scatterScenery(region, profile)
  })

  ;[
    ['waterRocks', 84, 78, 0.042, 0.2],
    ['waterRocks', 9, 78, 0.038, -0.4],
    ['unitShip', 88, 40, 0.032, 0.9],
    ['unitShipLarge', 76, 22, 0.027, -0.7],
    ['survivalSignpost', 39, 49, 0.042, 0.25],
    ['survivalSignpost', 58, 47, 0.042, -0.45],
  ].forEach(([assetId, px, py, scale, turn]) => placeScenery(assetId, px, py, { scale, rotationY: turn }))
}

function scatterScenery(region, profile) {
  if (!profile) return
  for (let i = 0; i < profile.count; i += 1) {
    const seed = hashText(`${region.id}-${i}`)
    const angle = seededUnit(seed) * Math.PI * 2
    const radius = 0.28 + seededUnit(seed + 17) * 0.82
    const px = clamp(region.x + Math.cos(angle) * profile.radiusX * radius, 5, 95)
    const py = clamp(region.y + Math.sin(angle) * profile.radiusY * radius, 6, 91)
    const assetId = profile.assets[(seed + i) % profile.assets.length]
    const scale = profile.scale[0] + seededUnit(seed + 31) * (profile.scale[1] - profile.scale[0])
    placeScenery(assetId, px, py, {
      scale,
      rotationY: seededUnit(seed + 43) * Math.PI * 2,
      yOffset: assetId.includes('Ship') ? -0.28 : 0.02,
    })
  }
}

function placeScenery(assetId, px, py, options = {}) {
  const position = worldFromPercent(px, py)
  position.y += options.yOffset || 0
  return addExternalModel(root, assetId, {
    position: [position.x, position.y, position.z],
    rotation: [0, options.rotationY || 0, 0],
    scale: options.scale || 0.034,
  })
}

function seededUnit(seed) {
  const value = Math.sin(seed * 12.9898) * 43758.5453
  return value - Math.floor(value)
}

function createMapTexture() {
  const canvas = document.createElement('canvas')
  canvas.width = 2048
  canvas.height = 1280
  const ctx = canvas.getContext('2d')
  const drawBlob = (cx, cy, rx, ry, fill, stroke, seed = 1) => {
    ctx.save()
    ctx.translate(cx, cy)
    ctx.beginPath()
    for (let i = 0; i <= 36; i += 1) {
      const angle = (i / 36) * Math.PI * 2
      const wobble = 1 + Math.sin(angle * 3 + seed) * 0.06 + Math.cos(angle * 5 + seed * 0.7) * 0.045
      const x = Math.cos(angle) * rx * wobble
      const y = Math.sin(angle) * ry * wobble
      if (i === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    }
    ctx.closePath()
    ctx.fillStyle = fill
    ctx.fill()
    if (stroke) {
      ctx.strokeStyle = stroke
      ctx.lineWidth = 9
      ctx.stroke()
    }
    ctx.restore()
  }

  const base = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
  base.addColorStop(0, '#aeb995')
  base.addColorStop(0.36, '#c8b77a')
  base.addColorStop(0.7, '#b78d5f')
  base.addColorStop(1, '#7f8f72')
  ctx.fillStyle = base
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  for (let i = 0; i < 5200; i += 1) {
    const x = seededUnit(i + 17) * canvas.width
    const y = seededUnit(i + 71) * canvas.height
    const light = seededUnit(i + 131)
    ctx.fillStyle = light > 0.55 ? 'rgba(255, 233, 176, 0.08)' : 'rgba(62, 79, 54, 0.07)'
    ctx.fillRect(x, y, 1.2 + seededUnit(i + 211) * 2.6, 1.2 + seededUnit(i + 313) * 2.4)
  }

  drawBlob(canvas.width * 0.04, canvas.height * 0.1, 430, 230, 'rgba(76, 116, 124, 0.2)', 'rgba(236, 222, 168, 0.2)', 8)
  drawBlob(canvas.width * 0.9, canvas.height * 0.82, 520, 260, 'rgba(60, 111, 125, 0.22)', 'rgba(236, 222, 168, 0.22)', 13)
  drawBlob(canvas.width * 0.82, canvas.height * 0.2, 380, 210, 'rgba(86, 131, 129, 0.13)', null, 19)
  drawBlob(canvas.width * 0.18, canvas.height * 0.86, 300, 160, 'rgba(94, 130, 114, 0.12)', null, 23)

  atlasRegions.forEach((region, index) => {
    const x = (region.x / 100) * canvas.width
    const y = (region.y / 100) * canvas.height
    drawBlob(x, y, 230 + index * 18, 145 + (index % 2) * 24, 'rgba(255, 238, 188, 0.045)', 'rgba(255, 232, 176, 0.24)', index + 4)
    ctx.strokeStyle = 'rgba(73, 52, 29, 0.15)'
    ctx.lineWidth = 3
    ;[0.92, 0.78, 0.62, 0.47, 0.32].forEach((scale, ringIndex) => {
      ctx.beginPath()
      ctx.ellipse(
        x,
        y,
        (230 + index * 18) * scale,
        (145 + (index % 2) * 24) * scale,
        (index - 2) * 0.15 + ringIndex * 0.04,
        0,
        Math.PI * 2,
      )
      ctx.stroke()
    })
    for (let i = 0; i < 22; i += 1) {
      const angle = seededUnit(index * 90 + i) * Math.PI * 2
      const radius = 45 + seededUnit(index * 190 + i) * 190
      const sx = x + Math.cos(angle) * radius
      const sy = y + Math.sin(angle) * radius * 0.58
      ctx.strokeStyle = 'rgba(58, 76, 47, 0.16)'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(sx - 18, sy + 4)
      ctx.quadraticCurveTo(sx, sy - 9, sx + 24, sy + 2)
      ctx.stroke()
    }
  })

  const routeSets = [
    [120, 930, 520, 720, 1010, 580, 1700, 300],
    [290, 450, 710, 340, 1180, 520, 1880, 640],
    [410, 1060, 820, 900, 1340, 980, 1800, 760],
  ]
  ctx.setLineDash([])
  routeSets.forEach((points) => {
    ctx.strokeStyle = 'rgba(88, 56, 28, 0.2)'
    ctx.lineWidth = 32
    ctx.lineCap = 'round'
    ctx.beginPath()
    ctx.moveTo(points[0], points[1])
    for (let i = 2; i < points.length; i += 4) ctx.quadraticCurveTo(points[i], points[i + 1], points[i + 2], points[i + 3])
    ctx.stroke()
    ctx.strokeStyle = 'rgba(238, 212, 151, 0.34)'
    ctx.lineWidth = 16
    ctx.stroke()
  })

  ctx.globalAlpha = 0.18
  for (let i = 0; i < 220; i += 1) {
    const x = seededUnit(i + 100) * canvas.width
    const y = seededUnit(i + 300) * canvas.height
    const r = 1 + seededUnit(i + 700) * 3
    ctx.fillStyle = i % 3 ? '#3f6c59' : '#f1d59a'
    ctx.beginPath()
    ctx.arc(x, y, r, 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.globalAlpha = 1

  routeSets.forEach((points) => {
    ctx.strokeStyle = 'rgba(61, 105, 124, 0.18)'
    ctx.lineWidth = 5
    ctx.setLineDash([20, 28])
    ctx.beginPath()
    ctx.moveTo(points[0], points[1])
    for (let i = 2; i < points.length; i += 4) ctx.quadraticCurveTo(points[i], points[i + 1], points[i + 2], points[i + 3])
    ctx.stroke()
  })

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.anisotropy = 8
  textures.push(texture)
  return texture
}

function createIslandShape(radiusX, radiusZ, seed = 1) {
  const shape = new THREE.Shape()
  for (let i = 0; i <= 40; i += 1) {
    const angle = (i / 40) * Math.PI * 2
    const wobble = 1 + Math.sin(angle * 3 + seed) * 0.08 + Math.cos(angle * 7 + seed * 0.6) * 0.05
    const x = Math.cos(angle) * radiusX * wobble
    const y = Math.sin(angle) * radiusZ * wobble
    if (i === 0) shape.moveTo(x, y)
    else shape.lineTo(x, y)
  }
  return shape
}

function createIslandPlateauGeometry(radiusX, radiusZ, seed) {
  const geometry = new THREE.ExtrudeGeometry(createIslandShape(radiusX, radiusZ, seed), {
    depth: 0.86,
    bevelEnabled: true,
    bevelThickness: 0.1,
    bevelSize: 0.16,
    bevelSegments: 1,
  })
  geometry.rotateX(Math.PI / 2)
  geometry.computeVertexNormals()
  return geometry
}

function createIslandTopGeometry(radiusX, radiusZ, seed) {
  const geometry = new THREE.ShapeGeometry(createIslandShape(radiusX * 0.96, radiusZ * 0.96, seed), 48)
  geometry.rotateX(-Math.PI / 2)
  const positions = geometry.attributes.position
  for (let i = 0; i < positions.count; i += 1) {
    const x = positions.getX(i)
    const z = positions.getZ(i)
    const radial = clamp(Math.sqrt((x / radiusX) ** 2 + (z / radiusZ) ** 2), 0, 1)
    const ridge = Math.sin(x * 0.8 + seed) * Math.cos(z * 0.9 + seed * 0.4) * 0.05
    positions.setY(i, 0.03 + (1 - radial) * 0.2 + ridge)
  }
  positions.needsUpdate = true
  geometry.computeVertexNormals()
  return geometry
}

function createIslandGroundTexture(region, index) {
  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 512
  const ctx = canvas.getContext('2d')
  const regionColorValue = new THREE.Color(region.color)
  const soft = `#${regionColorValue.lerp(new THREE.Color(0xc6b579), 0.56).getHexString()}`
  const gradient = ctx.createRadialGradient(250, 250, 60, 250, 250, 310)
  gradient.addColorStop(0, '#d6bd78')
  gradient.addColorStop(0.42, soft)
  gradient.addColorStop(1, '#7d6038')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  ctx.globalAlpha = 0.34
  for (let i = 0; i < 900; i += 1) {
    const x = seededUnit(index * 1000 + i * 3) * canvas.width
    const y = seededUnit(index * 1300 + i * 5) * canvas.height
    ctx.fillStyle = i % 3 ? 'rgba(63, 83, 49, 0.12)' : 'rgba(255, 229, 164, 0.16)'
    ctx.fillRect(x, y, 1 + seededUnit(i) * 3, 1 + seededUnit(i + 40) * 3)
  }
  ctx.globalAlpha = 1

  ctx.strokeStyle = 'rgba(65, 45, 24, 0.22)'
  ctx.lineWidth = 4
  ;[0.42, 0.58, 0.74, 0.88].forEach((scale, ringIndex) => {
    ctx.beginPath()
    ctx.ellipse(256, 256, 190 * scale, 118 * scale, (index - 2) * 0.22 + ringIndex * 0.08, 0, Math.PI * 2)
    ctx.stroke()
  })

  ctx.strokeStyle = 'rgba(255, 232, 170, 0.2)'
  ctx.lineWidth = 14
  ctx.lineCap = 'round'
  ctx.beginPath()
  ctx.moveTo(86, 290 + index * 5)
  ctx.quadraticCurveTo(220, 210 - index * 3, 430, 255 + index * 8)
  ctx.stroke()

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.anisotropy = 8
  textures.push(texture)
  return texture
}

function createIsland(region, index) {
  const position = worldFromPercent(region.x, region.y)
  const group = new THREE.Group()
  group.position.copy(position)
  group.rotation.y = (index - 2) * 0.2
  root.add(group)
  regionEntries.set(region.id, { region, group, position })

  const radiusX = 5.7 + (index % 3) * 0.82
  const radiusZ = 3.35 + (index % 2) * 0.52
  const cliff = new THREE.Mesh(createIslandPlateauGeometry(radiusX, radiusZ, index + 3), material({
    color: 0x7a5d37,
    roughness: 0.94,
    transparent: true,
    opacity: 0.48,
  }))
  cliff.position.y = 0.06
  cliff.castShadow = true
  cliff.receiveShadow = true
  group.add(cliff)

  const cap = new THREE.Mesh(createIslandTopGeometry(radiusX, radiusZ, index + 3), material({
    color: 0xffffff,
    map: createIslandGroundTexture(region, index),
    roughness: 0.9,
    transparent: true,
    opacity: 0.76,
  }))
  cap.position.y = 0.18
  cap.castShadow = true
  cap.receiveShadow = true
  group.add(cap)

  const rim = new THREE.Mesh(
    new THREE.TorusGeometry(1, 0.028, 8, 108),
    material({ color: 0xffe4a3, roughness: 0.72, metalness: 0.02, transparent: true, opacity: 0.2 }),
  )
  rim.rotation.x = Math.PI / 2
  rim.scale.set(radiusX, radiusZ, 1)
  rim.position.y = 0.22
  rim.castShadow = true
  group.add(rim)

  const landmark = createLandmark(region, index)
  landmark.position.set(0, 0.78, 0)
  landmark.scale.setScalar(1.18)
  group.add(landmark)
  decorateIslandWithModels(group, region, index, radiusX, radiusZ)

  const label = createRegionLabel(region)
  label.position.set(0, 6.4, 0)
  group.add(label)
}

function decorateIslandWithModels(group, region, index, radiusX, radiusZ) {
  const commonScale = 0.028
  if (region.id === 'mind') {
    addExternalModel(group, 'treeHighRound', { position: [-radiusX * 0.38, 0.64, radiusZ * 0.16], rotation: [0, 0.4, 0], scale: 0.036 })
    addExternalModel(group, 'buildingCabin', { position: [radiusX * 0.04, 0.58, -radiusZ * 0.38], rotation: [0, -0.3, 0], scale: 0.022 })
    addExternalModel(group, 'lantern', { position: [radiusX * 0.34, 0.62, -radiusZ * 0.22], scale: 0.034 })
    addExternalModel(group, 'fenceGate', { position: [radiusX * 0.1, 0.58, radiusZ * 0.48], rotation: [0, -0.4, 0], scale: 0.024 })
  } else if (region.id === 'thinking') {
    addExternalModel(group, 'fountainRound', { position: [-radiusX * 0.42, 0.58, -radiusZ * 0.24], scale: 0.026 })
    addExternalModel(group, 'buildingWizardTower', { position: [radiusX * 0.03, 0.58, radiusZ * 0.36], rotation: [0, 0.28, 0], scale: 0.02 })
    addExternalModel(group, 'stairsStone', { position: [radiusX * 0.34, 0.62, radiusZ * 0.2], rotation: [0, -0.7, 0], scale: 0.035 })
    addExternalModel(group, 'rockLarge', { position: [radiusX * 0.02, 0.56, -radiusZ * 0.48], scale: 0.04 })
  } else if (region.id === 'dialogue') {
    addExternalModel(group, 'wallDoor', { position: [radiusX * 0.36, 0.62, radiusZ * 0.12], rotation: [0, -0.5, 0], scale: 0.032 })
    addExternalModel(group, 'bridge', { position: [-radiusX * 0.04, 0.58, radiusZ * 0.4], rotation: [0, 0.4, 0], scale: 0.03 })
    addExternalModel(group, 'fenceGate', { position: [-radiusX * 0.38, 0.58, -radiusZ * 0.25], rotation: [0, 0.7, 0], scale: 0.027 })
    addExternalModel(group, 'lantern', { position: [0, 0.6, radiusZ * 0.48], scale: 0.034 })
  } else if (region.id === 'leadership') {
    addExternalModel(group, 'stairsStone', { position: [-radiusX * 0.4, 0.62, 0], rotation: [0, 0.65, 0], scale: 0.042 })
    addExternalModel(group, 'buildingTower', { position: [radiusX * 0.08, 0.58, -radiusZ * 0.34], rotation: [0, -0.2, 0], scale: 0.024 })
    addExternalModel(group, index % 2 ? 'bannerGreen' : 'bannerRed', { position: [radiusX * 0.44, 0.62, -radiusZ * 0.16], rotation: [0, -0.2, 0], scale: 0.04 })
    addExternalModel(group, 'pillarStone', { position: [radiusX * 0.12, 0.62, radiusZ * 0.44], scale: commonScale })
  } else if (region.id === 'practice') {
    addExternalModel(group, 'cart', { position: [-radiusX * 0.24, 0.62, radiusZ * 0.12], rotation: [0, 0.6, 0], scale: 0.033 })
    addExternalModel(group, 'buildingMarket', { position: [radiusX * 0.36, 0.58, radiusZ * 0.22], rotation: [0, -0.42, 0], scale: 0.024 })
    addExternalModel(group, 'road', { position: [radiusX * 0.26, 0.56, -radiusZ * 0.22], rotation: [0, -0.8, 0], scale: 0.08 })
    addExternalModel(group, 'stairsWood', { position: [radiusX * 0.02, 0.62, radiusZ * 0.46], rotation: [0, 0.2, 0], scale: 0.032 })
  } else if (region.id === 'care') {
    addExternalModel(group, 'lantern', { position: [-radiusX * 0.32, 0.62, radiusZ * 0.18], scale: 0.04 })
    addExternalModel(group, 'buildingDock', { position: [radiusX * 0.05, 0.58, radiusZ * 0.38], rotation: [0, 0.55, 0], scale: 0.022 })
    addExternalModel(group, 'tree', { position: [radiusX * 0.36, 0.62, -radiusZ * 0.08], scale: 0.034 })
    addExternalModel(group, 'road', { position: [0, 0.56, radiusZ * 0.48], rotation: [0, 0.4, 0], scale: 0.075 })
  }
}

function createRegionLabel(region) {
  const el = document.createElement('button')
  el.className = 'atlas-region-label'
  el.type = 'button'
  el.innerHTML = `<strong>${region.label}</strong><span>${region.subtitle}</span>`
  el.addEventListener('click', (event) => {
    event.stopPropagation()
    focusRegion(region.id)
  })
  return new CSS2DObject(el)
}

function createItemLabel(item) {
  const el = document.createElement('button')
  el.className = 'atlas-item-label'
  el.type = 'button'
  el.textContent = item.shortTitle || item.title
  el.addEventListener('click', (event) => {
    event.stopPropagation()
    focusItem(item)
  })
  return new CSS2DObject(el)
}

function createLandmark(region, index) {
  const group = new THREE.Group()
  const main = material({ color: 0x6b4525, roughness: 0.78 })
  const accent = material({ color: region.color, roughness: 0.68 })
  const dark = material({ color: 0x3c2815, roughness: 0.86 })
  const light = material({ color: 0xffdf9b, roughness: 0.6 })
  const add = (geometry, mat, pos = [0, 0, 0], rot = [0, 0, 0], scale = [1, 1, 1]) => {
    const mesh = new THREE.Mesh(geometry, mat)
    mesh.position.set(...pos)
    mesh.rotation.set(...rot)
    mesh.scale.set(...scale)
    mesh.castShadow = true
    mesh.receiveShadow = true
    group.add(mesh)
    return mesh
  }
  if (region.icon === 'pyramid') {
    add(new THREE.ConeGeometry(1.6, 2.9, 4), accent, [-0.75, 1.45, 0], [0, Math.PI / 4, 0])
    add(new THREE.ConeGeometry(1, 1.8, 4), main, [1.15, 0.9, 0.48], [0, Math.PI / 4, 0])
  } else if (region.icon === 'camel') {
    add(new THREE.SphereGeometry(0.8, 18, 12), main, [0, 1.6, 0], [0, 0, 0], [2.3, 0.62, 0.7])
    add(new THREE.SphereGeometry(0.42, 16, 10), accent, [-0.5, 2.25, 0], [0, 0, 0], [1, 1.35, 0.85])
    add(new THREE.SphereGeometry(0.42, 16, 10), accent, [0.42, 2.25, 0], [0, 0, 0], [1, 1.35, 0.85])
    add(new THREE.CylinderGeometry(0.13, 0.16, 1.25, 12), main, [1.25, 2, 0], [0, 0, -0.58])
    add(new THREE.SphereGeometry(0.34, 14, 10), main, [1.75, 2.45, 0], [0, 0, 0], [1.2, 0.8, 0.7])
    ;[-1, -0.42, 0.42, 1].forEach((x) => add(new THREE.CylinderGeometry(0.08, 0.11, 1.35, 8), dark, [x, 0.72, x > 0 ? 0.18 : -0.18]))
  } else if (region.icon === 'gate') {
    add(new THREE.BoxGeometry(3.5, 0.55, 0.5), main, [0, 3.1, 0])
    add(new THREE.BoxGeometry(0.52, 3.1, 0.5), main, [-1.25, 1.55, 0])
    add(new THREE.BoxGeometry(0.52, 3.1, 0.5), main, [1.25, 1.55, 0])
    add(new THREE.BoxGeometry(1.2, 0.34, 0.44), accent, [0, 1.9, 0.05])
  } else if (region.icon === 'tower' || region.icon === 'lighthouse') {
    add(new THREE.CylinderGeometry(0.72, 0.96, 3.6, 20), main, [0, 1.8, 0])
    add(new THREE.ConeGeometry(1.1, 0.9, 20), accent, [0, 4.05, 0])
    add(new THREE.CylinderGeometry(0.55, 0.55, 0.42, 20), light, [0, 3.45, 0])
    if (region.icon === 'lighthouse') add(new THREE.BoxGeometry(3.2, 0.08, 0.08), light, [0, 3.45, 0], [0, index * 0.45, 0])
  } else {
    add(new THREE.CylinderGeometry(0.18, 0.26, 1.8, 12), dark, [0, 0.9, 0])
    add(new THREE.ConeGeometry(1.3, 2.2, 16), accent, [0, 2.1, 0])
    add(new THREE.ConeGeometry(1, 1.8, 16), accent, [0, 3.2, 0])
  }
  return group
}

function createRoutes() {
  atlasRegions.forEach((region, index) => {
    const next = atlasRegions[(index + 1) % atlasRegions.length]
    const start = worldFromPercent(region.x, region.y)
    const end = worldFromPercent(next.x, next.y)
    const mid = start.clone().add(end).multiplyScalar(0.5)
    mid.x += Math.sin(index * 1.7) * 8
    mid.z += Math.cos(index * 1.2) * 5
    const flatCurve = new THREE.QuadraticBezierCurve3(start, mid, end)
    const points = flatCurve.getPoints(56).map((point) => {
      const px = ((point.x / mapWidth) + 0.5) * 100
      const py = ((point.z / mapDepth) + 0.5) * 100
      return new THREE.Vector3(point.x, terrainElevation(px, py) + 0.12, point.z)
    })
    const curve = new THREE.CatmullRomCurve3(points)
    const road = new THREE.Mesh(
      new THREE.TubeGeometry(curve, 92, 0.12, 7, false),
      material({ color: 0x7a5432, roughness: 0.86, transparent: true, opacity: 0.58 }),
    )
    road.receiveShadow = true
    root.add(road)
  })
}

function rebuildSceneObjects() {
  if (!root) return
  itemEntries.forEach((entry) => root.remove(entry.group))
  itemEntries.clear()
  pickTargets.length = 0
  items.value.forEach((item) => createItem(item))
  updateLabelDensity()
}

function createItem(item) {
  const position = worldFromPercent(item.mapX, item.mapY)
  const group = new THREE.Group()
  group.position.copy(position)
  root.add(group)

  const isBook = item.kind === 'book'
  const pedestal = new THREE.Mesh(
    new THREE.CylinderGeometry(isBook ? 0.72 : 0.58, isBook ? 0.9 : 0.72, isBook ? 0.38 : 0.3, 18),
    material({ color: isBook ? 0x735032 : 0x4d6f65, roughness: 0.88 }),
  )
  pedestal.position.y = isBook ? 0.2 : 0.16
  pedestal.castShadow = true
  pedestal.receiveShadow = true
  group.add(pedestal)

  const halo = new THREE.Mesh(new THREE.CircleGeometry(isBook ? 0.9 : 0.7, 32), new THREE.MeshBasicMaterial({ color: isBook ? 0xffd27a : 0x7bd4bc, transparent: true, opacity: 0.24, depthWrite: false }))
  halo.rotation.x = -Math.PI / 2
  halo.position.y = 0.04
  group.add(halo)

  const artifact = createVisualArtifact(item)
  artifact.position.y = isBook ? 0.48 : 0.42
  artifact.userData.itemId = item.id
  group.add(artifact)

  const label = createItemLabel(item)
  label.position.set(0, artifact.position.y + (isBook ? 3.05 : 2.35), 0)
  group.add(label)

  artifact.traverse((child) => {
    if (!child.isMesh) return
    child.userData.itemId = item.id
    pickTargets.push(child)
  })
  itemEntries.set(item.id, { item, group, book: artifact, label, halo })
}

function createVisualArtifact(item) {
  const profile = visualProfileForItem(item)
  const group = new THREE.Group()
  group.userData.faceCamera = false
  const accent = regionColor(profile.regionId)
  const accentMat = material({ color: accent, roughness: 0.72, metalness: 0.02 })
  const warmMat = material({ color: 0xb9854e, roughness: 0.78, metalness: 0.02 })
  const darkMat = material({ color: 0x3d2815, roughness: 0.86, metalness: 0.01 })
  const lightMat = material({ color: 0xffdf9b, roughness: 0.58, metalness: 0.04 })
  const glassMat = material({ color: 0xbfe6db, roughness: 0.2, metalness: 0.02, transparent: true, opacity: 0.42 })
  const pageMat = material({ color: 0xf2d9ad, roughness: 0.82, metalness: 0.01 })

  const add = (geometry, mat, position = [0, 0, 0], rotation = [0, 0, 0], scale = [1, 1, 1]) => {
    const mesh = new THREE.Mesh(geometry, mat)
    mesh.position.set(...position)
    mesh.rotation.set(...rotation)
    mesh.scale.set(...scale)
    mesh.castShadow = true
    mesh.receiveShadow = true
    group.add(mesh)
    return mesh
  }
  const addBook = (position, rotation = [0, 0, 0], scale = [1, 1, 1]) => {
    const book = createBookObject(item, position, rotation, scale)
    group.add(book)
    return book
  }
  const addAsset = (assetId, position, rotation = [0, 0, 0], scale = 0.03) => {
    addExternalModel(group, assetId, { position, rotation, scale })
  }
  const customAssetId = redbookAssetForForm(profile.form)

  if (customAssetId) {
    addAsset(customAssetId, [0, -0.02, 0], [0, 0, 0], 1.22)
  } else {
    add(new THREE.CylinderGeometry(1.45, 1.65, 0.32, 36), material({ color: 0x755438, roughness: 0.88 }), [0, 0.16, 0], [0, 0, 0], [1.25, 1, 0.82])

    if (profile.form === 'trojan') {
    add(new THREE.BoxGeometry(2.1, 0.88, 0.7), warmMat, [0, 1.03, 0])
    add(new THREE.ConeGeometry(0.46, 0.78, 4), warmMat, [1.28, 1.42, 0], [0, Math.PI / 4, 0])
    add(new THREE.SphereGeometry(0.22, 14, 10), darkMat, [1.7, 1.78, 0])
    add(new THREE.BoxGeometry(0.72, 0.36, 0.38), warmMat, [-1.25, 1.08, 0])
    ;[-0.75, -0.22, 0.45, 0.98].forEach((x) => add(new THREE.CylinderGeometry(0.07, 0.09, 1.08, 8), darkMat, [x, 0.48, x > 0 ? 0.22 : -0.22]))
    add(new THREE.BoxGeometry(0.1, 1.45, 0.1), darkMat, [-0.2, 2.1, 0], [0, 0, 0.36])
    add(new THREE.TorusGeometry(0.32, 0.04, 8, 28), lightMat, [-0.55, 2.54, 0], [Math.PI / 2, 0, 0])
    addAsset('cart', [0, 0.42, 0], [0, 0.35, 0], 0.022)
    addAsset('chest', [-0.82, 0.34, -0.42], [0, -0.45, 0], 0.018)
    addBook([0.28, 1.58, 0.52], [-0.18, -0.24, 0.12], [0.42, 0.42, 0.42])
  } else if (profile.form === 'greenhouse') {
    add(new THREE.CylinderGeometry(1.04, 1.04, 0.12, 32), accentMat, [0, 0.58, 0])
    add(new THREE.SphereGeometry(1.1, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), glassMat, [0, 0.7, 0])
    add(new THREE.CylinderGeometry(0.08, 0.11, 1.25, 10), darkMat, [0, 1.05, 0])
    add(new THREE.ConeGeometry(0.55, 0.9, 16), accentMat, [0, 1.72, 0])
    add(new THREE.SphereGeometry(0.22, 16, 10), lightMat, [-0.7, 1.18, 0.18])
    addAsset('tree', [-0.18, 0.36, 0.08], [0, 0.2, 0], 0.02)
    addAsset('lantern', [0.86, 0.42, -0.28], [0, 0, 0], 0.02)
    addBook([0.48, 0.96, -0.34], [-0.36, 0.4, 0.12], [0.34, 0.34, 0.34])
  } else if (profile.form === 'dialogue-table') {
    add(new THREE.CylinderGeometry(0.82, 0.82, 0.18, 32), warmMat, [0, 1, 0])
    add(new THREE.CylinderGeometry(0.13, 0.18, 0.9, 12), darkMat, [0, 0.58, 0])
    ;[-0.74, 0.74].forEach((x) => {
      add(new THREE.BoxGeometry(0.5, 0.48, 0.48), accentMat, [x, 0.7, 0.28])
      add(new THREE.BoxGeometry(0.54, 0.13, 0.5), darkMat, [x, 1, 0.28])
    })
    ;[-0.36, -0.12, 0.12, 0.36].forEach((x, index) => add(new THREE.SphereGeometry(0.1, 12, 8), index % 2 ? lightMat : accentMat, [x, 1.18, 0.02]))
    addAsset('fenceGate', [0, 0.34, -0.68], [0, 0, 0], 0.016)
    addBook([0, 1.34, -0.42], [-0.24, 0, 0], [0.32, 0.32, 0.32])
  } else if (profile.form === 'dual-clock') {
    ;[-0.48, 0.48].forEach((x, index) => {
      add(new THREE.CylinderGeometry(0.48, 0.48, 0.14, 32), index ? accentMat : lightMat, [x, 1.34, 0], [Math.PI / 2, 0, 0])
      add(new THREE.BoxGeometry(0.04, 0.5, 0.04), darkMat, [x, 1.34, 0.08], [0, 0, index ? 1.1 : -0.45])
      add(new THREE.BoxGeometry(0.04, 0.34, 0.04), darkMat, [x, 1.34, 0.1], [0, 0, index ? -0.42 : 0.72])
    })
    add(new THREE.BoxGeometry(1.5, 0.18, 0.3), darkMat, [0, 0.88, 0])
    add(new THREE.ConeGeometry(0.42, 0.82, 4), accentMat, [0, 0.76, 0.42], [0, Math.PI / 4, 0])
    addAsset('fountainRound', [0, 0.34, 0], [0, 0, 0], 0.012)
    addAsset('survivalSignpost', [0.82, 0.34, -0.34], [0, -0.4, 0], 0.02)
    addBook([0, 0.96, -0.42], [-0.28, 0, 0], [0.34, 0.34, 0.34])
  } else if (profile.form === 'gear-balance') {
    add(new THREE.TorusGeometry(0.68, 0.1, 8, 18), accentMat, [-0.45, 1.28, 0], [Math.PI / 2, 0, 0])
    for (let i = 0; i < 8; i += 1) {
      const a = (i / 8) * Math.PI * 2
      add(new THREE.BoxGeometry(0.12, 0.38, 0.1), accentMat, [-0.45 + Math.cos(a) * 0.75, 1.28 + Math.sin(a) * 0.75, 0], [0, 0, a])
    }
    add(new THREE.CylinderGeometry(0.06, 0.08, 1.6, 12), darkMat, [0.62, 1.08, 0])
    add(new THREE.BoxGeometry(1.02, 0.06, 0.08), darkMat, [0.62, 1.78, 0])
    ;[-0.42, 0.42].forEach((x) => add(new THREE.CylinderGeometry(0.22, 0.3, 0.08, 24), lightMat, [0.62 + x, 1.46, 0]))
    addAsset('pillarStone', [0.62, 0.32, 0], [0, 0, 0], 0.018)
    addBook([0.1, 0.82, -0.5], [-0.3, 0.2, 0.08], [0.3, 0.3, 0.3])
  } else if (profile.form === 'stair-tower') {
    ;[0, 1, 2, 3].forEach((step) => add(new THREE.BoxGeometry(0.76, 0.28, 0.72), warmMat, [-0.78 + step * 0.48, 0.54 + step * 0.28, 0]))
    add(new THREE.CylinderGeometry(0.34, 0.44, 2.1, 16), accentMat, [0.9, 1.34, 0])
    add(new THREE.ConeGeometry(0.55, 0.54, 16), lightMat, [0.9, 2.66, 0])
    add(new THREE.BoxGeometry(0.72, 0.34, 0.06), lightMat, [1.28, 2.35, 0], [0, 0, -0.12])
    addAsset('stairsStone', [-0.48, 0.36, 0], [0, 0.62, 0], 0.024)
    addAsset('bannerRed', [1.16, 0.4, -0.4], [0, -0.3, 0], 0.024)
    addBook([-0.58, 1.28, -0.45], [-0.3, 0.42, 0.18], [0.34, 0.34, 0.34])
  } else if (profile.form === 'workbench') {
    add(new THREE.BoxGeometry(1.75, 0.18, 0.92), warmMat, [0, 1.08, 0])
    ;[-0.66, 0.66].forEach((x) => add(new THREE.CylinderGeometry(0.07, 0.09, 0.9, 8), darkMat, [x, 0.58, -0.28]))
    ;[-0.36, 0, 0.36].forEach((x) => add(new THREE.BoxGeometry(0.22, 0.16, 0.28), lightMat, [x, 1.25, 0.1]))
    add(new THREE.BoxGeometry(0.96, 0.12, 0.5), accentMat, [0.22, 1.34, -0.22], [0, 0.2, 0])
    add(new THREE.CylinderGeometry(0.08, 0.08, 0.86, 12), accentMat, [-0.78, 1.46, 0.08], [0.9, 0, 0.2])
    addAsset('workbench', [0.32, 0.34, 0.18], [0, -0.2, 0], 0.014)
    addAsset('toolHammer', [-0.68, 0.34, 0.34], [0, 0.8, 0], 0.024)
    addBook([-0.25, 1.42, 0.28], [-0.36, -0.2, 0], [0.32, 0.32, 0.32])
  } else if (profile.form === 'care-lighthouse') {
    add(new THREE.CylinderGeometry(0.36, 0.5, 2.18, 18), warmMat, [-0.28, 1.25, 0])
    add(new THREE.CylinderGeometry(0.28, 0.28, 0.32, 18), lightMat, [-0.28, 2.52, 0])
    add(new THREE.ConeGeometry(0.48, 0.5, 18), accentMat, [-0.28, 2.92, 0])
    add(new THREE.BoxGeometry(1.18, 0.08, 0.08), lightMat, [-0.28, 2.54, 0], [0, 0.32, 0])
    add(new THREE.BoxGeometry(1.1, 0.72, 0.82), accentMat, [0.72, 0.8, 0.05])
    add(new THREE.ConeGeometry(0.8, 0.48, 4), darkMat, [0.72, 1.42, 0.05], [0, Math.PI / 4, 0])
    addAsset('lantern', [-0.68, 0.42, -0.35], [0, 0, 0], 0.022)
    addAsset('tree', [0.92, 0.34, 0.42], [0, 0.2, 0], 0.02)
    addBook([0.5, 1.3, -0.5], [-0.25, -0.32, 0.1], [0.3, 0.3, 0.3])
  } else if (profile.form === 'compass-path') {
    add(new THREE.CylinderGeometry(0.8, 0.8, 0.12, 40), lightMat, [0, 0.88, 0])
    add(new THREE.ConeGeometry(0.18, 1.0, 3), accentMat, [0, 0.98, 0], [Math.PI / 2, 0, 0])
    ;[-0.9, -0.3, 0.3, 0.9].forEach((x, index) => add(new THREE.BoxGeometry(0.42, 0.1, 0.24), index % 2 ? accentMat : warmMat, [x, 0.52, -0.58 + index * 0.34], [0, 0.4, 0]))
    addAsset('road', [0, 0.34, -0.32], [0, 0.4, 0], 0.055)
    addAsset('survivalSignpost', [-0.78, 0.34, 0.36], [0, 0.5, 0], 0.022)
    addBook([0.62, 1.08, 0.34], [-0.3, 0.46, 0], [0.3, 0.3, 0.3])
  } else if (profile.form === 'bridge-door') {
    add(new THREE.BoxGeometry(2.2, 0.18, 0.5), warmMat, [0, 0.9, 0])
    ;[-0.7, 0, 0.7].forEach((x) => add(new THREE.BoxGeometry(0.12, 0.9, 0.14), darkMat, [x, 0.52, 0]))
    add(new THREE.BoxGeometry(0.82, 1.4, 0.16), accentMat, [0.95, 1.28, -0.42], [0, -0.22, 0])
    add(new THREE.TorusGeometry(0.11, 0.02, 8, 16), lightMat, [0.78, 1.28, -0.32], [Math.PI / 2, 0, 0])
    addAsset('wallDoor', [0.8, 0.3, -0.42], [0, -0.24, 0], 0.018)
    addAsset('bridge', [-0.45, 0.3, 0.2], [0, 0.3, 0], 0.018)
    addBook([-0.7, 1.18, -0.35], [-0.28, 0.42, 0], [0.32, 0.32, 0.32])
  } else if (profile.form === 'mirror-lamp') {
    add(new THREE.CylinderGeometry(0.68, 0.78, 0.12, 32), warmMat, [-0.42, 0.78, 0])
    add(new THREE.TorusGeometry(0.55, 0.055, 12, 36), lightMat, [-0.42, 1.54, 0], [Math.PI / 2, 0, 0])
    add(new THREE.CircleGeometry(0.48, 32), glassMat, [-0.42, 1.54, 0.03], [0, 0, 0])
    add(new THREE.CylinderGeometry(0.07, 0.09, 1.22, 10), darkMat, [-0.42, 1.02, 0])
    add(new THREE.CylinderGeometry(0.08, 0.1, 1.05, 12), darkMat, [0.82, 1.16, 0])
    add(new THREE.SphereGeometry(0.28, 16, 10), lightMat, [0.82, 1.82, 0])
    add(new THREE.ConeGeometry(0.45, 0.48, 18), accentMat, [0.82, 1.98, 0])
    addAsset('lantern', [0.82, 0.34, 0.02], [0, 0, 0], 0.022)
    addAsset('rockFlatGrass', [-0.76, 0.28, -0.22], [0, 0.5, 0], 0.012)
    addBook([0.05, 1.02, -0.46], [-0.34, 0.1, 0.1], [0.32, 0.32, 0.32])
  } else {
    add(new THREE.ConeGeometry(0.82, 1.7, 5), accentMat, [0, 1.2, 0])
    addBook([0.4, 0.9, -0.48], [-0.34, 0.36, 0], [0.34, 0.34, 0.34])
  }
  }

  const pick = new THREE.Mesh(
    new THREE.BoxGeometry(3.2, 3.6, 2.5),
    new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false }),
  )
  pick.position.y = 1.75
  pick.userData.isPickVolume = true
  group.add(pick)
  return group
}

function createBookObject(item, position = [0, 0, 0], rotation = [0, 0, 0], scale = [1, 1, 1]) {
  const isBook = item.kind === 'book'
  const front = material({
    map: createBookCoverTexture(item),
    roughness: 0.58,
  })
  const side = material({ color: coverSpineColor(item), roughness: 0.78 })
  const pages = material({ color: 0xf0d9ad, roughness: 0.84 })
  const mesh = new THREE.Mesh(
    new THREE.BoxGeometry(isBook ? 2.6 : 3.2, isBook ? 3.7 : 2.05, isBook ? 0.46 : 0.36),
    [side, side, pages, pages, front, front],
  )
  mesh.castShadow = true
  mesh.receiveShadow = true
  mesh.position.set(...position)
  mesh.rotation.set(...rotation)
  mesh.scale.set(...scale)
  return mesh
}

function coverSpineColor(item) {
  const style = coverStyleForProfile(visualProfileForItem(item).form, item.regionId)
  return new THREE.Color(style.ink).getHex()
}

function kindFill(kind) {
  return {
    book: 'rgba(111, 55, 41, 0.95)',
    topic: 'rgba(142, 83, 38, 0.95)',
    tool: 'rgba(42, 102, 94, 0.95)',
    place: 'rgba(104, 58, 83, 0.95)',
  }[kind] || 'rgba(92, 65, 35, 0.95)'
}

function updateLabelDensity() {
  const zoomLevel = currentDistance
  regionEntries.forEach(({ group }) => {
    group.children.forEach((child) => {
      if (child.isCSS2DObject) child.element.classList.toggle('compact', zoomLevel < 72)
    })
  })
  itemEntries.forEach((entry) => {
    const selected = entry.item.id === selectedId.value
    const closeToFocus = entry.group.position.distanceTo(cameraCurrentTarget) < 17
    const showNearby = zoomLevel < 48 && closeToFocus
    entry.label.element.classList.toggle('hidden', !selected && !showNearby)
    entry.label.element.classList.toggle('selected', selected)
    entry.group.scale.setScalar(selected ? 1.68 : 1.02)
    entry.halo.material.opacity = selected ? 0.62 : 0.24
    entry.halo.scale.setScalar(selected ? 2.4 : 1)
  })
}

function focusItem(item) {
  if (!item) return
  selectedId.value = item.id
  activeRegionId.value = item.regionId || activeRegionId.value
  cameraMode.value = 'book'
  const position = worldFromPercent(item.mapX, item.mapY)
  setCameraTarget(position, -0.18 + (position.x > 0 ? -0.12 : 0.12), 0.52, 28)
  updateLabelDensity()
}

function focusRegion(regionId) {
  const region = atlasRegions.find((entry) => entry.id === regionId) || activeRegion.value
  activeRegionId.value = region.id
  cameraMode.value = 'island'
  const position = worldFromPercent(region.x, region.y)
  setCameraTarget(position, -0.08, 0.72, 62)
}

function goOverview() {
  cameraMode.value = 'overview'
  setCameraTarget(new THREE.Vector3(0, 0, 0), -0.08, 0.82, 136)
}

function setCameraTarget(target, nextYaw, nextPitch, nextDistance) {
  cameraTarget = clampCameraTarget(target.clone())
  desiredYaw = nextYaw
  desiredPitch = clamp(nextPitch, 0.22, 1.18)
  desiredDistance = clamp(nextDistance, 18, 170)
  yaw.value = desiredYaw
  pitch.value = desiredPitch
  distance.value = desiredDistance
}

function clampCameraTarget(target) {
  target.x = clamp(target.x, -mapWidth * 0.48, mapWidth * 0.48)
  target.z = clamp(target.z, -mapDepth * 0.48, mapDepth * 0.48)
  const px = ((target.x / mapWidth) + 0.5) * 100
  const py = ((target.z / mapDepth) + 0.5) * 100
  target.y = terrainElevation(px, py)
  return target
}

function onPointerDown(event) {
  if (event.button > 1) return
  dragging.value = true
  moved.value = false
  dragStart.value = {
    x: event.clientX,
    y: event.clientY,
    yaw: desiredYaw,
    pitch: desiredPitch,
    target: cameraTarget.clone(),
    mode: event.shiftKey || event.altKey || event.button === 1 ? 'rotate' : 'pan',
  }
  viewportRef.value?.setPointerCapture?.(event.pointerId)
}

function onPointerMove(event) {
  if (!dragging.value) return
  const dx = event.clientX - dragStart.value.x
  const dy = event.clientY - dragStart.value.y
  if (Math.abs(dx) + Math.abs(dy) > 4) moved.value = true
  if (dragStart.value.mode === 'rotate') {
    desiredYaw = dragStart.value.yaw - dx * 0.004
    desiredPitch = clamp(dragStart.value.pitch + dy * 0.0025, 0.28, 1.14)
    return
  }

  const panSpeed = clamp(desiredDistance * 0.0022, 0.04, 0.24)
  const right = new THREE.Vector3(Math.cos(desiredYaw), 0, -Math.sin(desiredYaw))
  const forward = new THREE.Vector3(Math.sin(desiredYaw), 0, Math.cos(desiredYaw))
  const nextTarget = dragStart.value.target
    .clone()
    .addScaledVector(right, -dx * panSpeed)
    .addScaledVector(forward, -dy * panSpeed)
  cameraTarget = clampCameraTarget(nextTarget)
}

function onPointerUp() {
  dragging.value = false
}

function onWheel(event) {
  event.preventDefault()
  desiredDistance = clamp(desiredDistance + event.deltaY * 0.08, 18, 170)
}

function onStageClick(event) {
  if (moved.value) {
    moved.value = false
    return
  }
  if (!renderer || !camera || !viewportRef.value) return
  const rect = viewportRef.value.getBoundingClientRect()
  pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
  pointer.y = -(((event.clientY - rect.top) / rect.height) * 2 - 1)
  raycaster.setFromCamera(pointer, camera)
  const hits = raycaster.intersectObjects(pickTargets, false)
  const hit = hits.find((entry) => entry.object.userData.itemId)
  if (!hit) return
  const item = items.value.find((entry) => entry.id === hit.object.userData.itemId)
  if (item) focusItem(item)
}

function toggleRoaming() {
  if (roaming.value) {
    stopRoaming()
    return
  }
  roaming.value = true
  advanceRoaming()
  roamTimer = window.setInterval(advanceRoaming, 3200)
}

function stopRoaming() {
  roaming.value = false
  if (roamTimer) window.clearInterval(roamTimer)
  roamTimer = 0
}

function advanceRoaming() {
  const pool = railItems.value
  if (!pool.length) return
  const currentIndex = Math.max(0, pool.findIndex((item) => item.id === selectedId.value))
  focusItem(pool[(currentIndex + 1) % pool.length])
}

function resizeScene() {
  if (!renderer || !camera || !labelRenderer || !viewportRef.value) return
  const rect = viewportRef.value.getBoundingClientRect()
  const width = Math.max(1, rect.width)
  const height = Math.max(1, rect.height)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
  renderer.setSize(width, height, false)
  labelRenderer.setSize(width, height)
  camera.aspect = width / height
  camera.updateProjectionMatrix()
}

function animate() {
  if (!renderer || !scene || !camera || !labelRenderer) return
  cameraCurrentTarget.lerp(cameraTarget, 0.075)
  currentYaw += (desiredYaw - currentYaw) * 0.08
  currentPitch += (desiredPitch - currentPitch) * 0.08
  currentDistance += (desiredDistance - currentDistance) * 0.08

  const horizontal = Math.cos(currentPitch) * currentDistance
  camera.position.set(
    cameraCurrentTarget.x + Math.sin(currentYaw) * horizontal,
    cameraCurrentTarget.y + Math.sin(currentPitch) * currentDistance,
    cameraCurrentTarget.z + Math.cos(currentYaw) * horizontal,
  )
  camera.lookAt(cameraCurrentTarget.x, cameraCurrentTarget.y + 2.2, cameraCurrentTarget.z)

  itemEntries.forEach((entry) => {
    if (entry.book.userData.faceCamera) {
      entry.book.lookAt(camera.position.x, entry.group.position.y + entry.book.position.y, camera.position.z)
    }
  })
  updateLabelDensity()
  renderer.render(scene, camera)
  labelRenderer.render(scene, camera)
  rafId = window.requestAnimationFrame(animate)
}

function disposeScene() {
  stopRoaming()
  if (rafId) window.cancelAnimationFrame(rafId)
  resizeObserver?.disconnect()
  resizeObserver = null
  if (root) {
    root.traverse((object) => object.geometry?.dispose?.())
  }
  materials.forEach((mat) => mat.dispose())
  textures.forEach((texture) => texture.dispose())
  materials.length = 0
  textures.length = 0
  renderer?.dispose()
  scene = null
  camera = null
  renderer = null
  labelRenderer = null
  root = null
  itemEntries.clear()
  regionEntries.clear()
  pickTargets.length = 0
}

onMounted(initScene)
onUnmounted(disposeScene)
</script>

<style scoped>
.space-atlas {
  min-height: calc(100vh - 124px);
  color: #fff4dc;
}

.atlas-topbar {
  display: flex;
  justify-content: space-between;
  gap: 18px;
  align-items: center;
  padding: 20px 24px 12px;
}

.atlas-kicker {
  display: block;
  color: rgba(151, 105, 54, 0.72);
  font-size: 12px;
  letter-spacing: 0;
  text-transform: uppercase;
}

.atlas-topbar h1 {
  margin: 4px 0 0;
  color: #6c4728;
  font-size: 28px;
  letter-spacing: 0;
}

.atlas-toolbar {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.atlas-toolbar button,
.atlas-island-list button,
.atlas-book-rail button {
  border: 1px solid rgba(255, 233, 190, 0.18);
  border-radius: 8px;
  color: #fff3d9;
  background: rgba(60, 42, 24, 0.62);
  cursor: pointer;
}

.atlas-toolbar button {
  padding: 9px 13px;
}

.atlas-toolbar button.active,
.atlas-island-list button.active,
.atlas-book-rail button.active {
  border-color: rgba(255, 205, 112, 0.78);
  background: rgba(155, 93, 49, 0.72);
}

.atlas-shell {
  display: grid;
  grid-template-rows: minmax(680px, 74vh) auto auto;
  gap: 12px;
  padding: 0 18px 18px;
}

.atlas-stage {
  position: relative;
  overflow: hidden;
  min-height: 680px;
  border: 1px solid rgba(255, 232, 184, 0.16);
  border-radius: 12px;
  background:
    radial-gradient(circle at 50% 20%, rgba(255, 226, 155, 0.28), transparent 42%),
    linear-gradient(180deg, #8f9c79, #b79055 64%, #6e4d2c);
}

.atlas-canvas,
.atlas-label-layer,
.atlas-fog {
  position: absolute;
  inset: 0;
}

.atlas-canvas {
  width: 100%;
  height: 100%;
}

.atlas-label-layer {
  pointer-events: none;
}

.atlas-fog {
  pointer-events: none;
  box-shadow: inset 0 0 80px rgba(35, 21, 10, 0.44);
  background:
    linear-gradient(180deg, rgba(255, 240, 194, 0.2), transparent 24%),
    radial-gradient(circle at 50% 72%, transparent 40%, rgba(62, 39, 18, 0.34) 100%);
}

.atlas-detail {
  position: absolute;
  left: 18px;
  top: 18px;
  z-index: 4;
  width: min(300px, calc(100% - 36px));
  padding: 13px 14px;
  border: 1px solid rgba(255, 232, 184, 0.18);
  border-radius: 10px;
  background: rgba(52, 35, 20, 0.68);
  backdrop-filter: blur(16px);
}

.atlas-detail span {
  color: rgba(255, 232, 184, 0.66);
  font-size: 12px;
}

.atlas-detail strong {
  display: block;
  margin-top: 6px;
  font-size: 19px;
}

.atlas-detail p {
  margin: 8px 0 0;
  color: rgba(255, 243, 222, 0.78);
  line-height: 1.7;
}

.atlas-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 12px;
}

.atlas-tags em {
  border: 1px solid rgba(255, 232, 184, 0.18);
  border-radius: 999px;
  padding: 4px 8px;
  color: rgba(255, 238, 208, 0.82);
  font-size: 12px;
  font-style: normal;
}

.atlas-island-list,
.atlas-book-rail {
  display: grid;
  grid-auto-flow: column;
  gap: 10px;
  overflow-x: auto;
  padding-bottom: 2px;
  scrollbar-width: thin;
}

.atlas-island-list {
  grid-auto-columns: minmax(188px, 1fr);
}

.atlas-book-rail {
  grid-auto-columns: minmax(170px, 220px);
}

.atlas-island-list button,
.atlas-book-rail button {
  display: grid;
  gap: 4px;
  min-width: 0;
  padding: 10px 12px;
  text-align: left;
}

.atlas-island-list span {
  width: 28px;
  height: 6px;
  border-radius: 999px;
}

.atlas-island-list strong,
.atlas-book-rail strong,
.atlas-book-rail small {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.atlas-island-list small,
.atlas-book-rail span,
.atlas-book-rail small {
  color: rgba(255, 232, 184, 0.62);
  font-size: 12px;
}

:global(.atlas-region-label),
:global(.atlas-item-label) {
  border: 1px solid rgba(255, 232, 184, 0.22);
  border-radius: 8px;
  color: #fff4dc;
  background: rgba(52, 34, 18, 0.72);
  box-shadow: 0 10px 28px rgba(33, 20, 10, 0.24);
  pointer-events: auto;
  cursor: pointer;
  white-space: nowrap;
}

:global(.atlas-region-label) {
  display: grid;
  gap: 2px;
  padding: 8px 12px;
  text-align: center;
}

:global(.atlas-region-label strong) {
  font-size: 18px;
}

:global(.atlas-region-label span) {
  color: rgba(255, 232, 184, 0.72);
  font-size: 12px;
}

:global(.atlas-region-label.compact span) {
  display: none;
}

:global(.atlas-item-label) {
  padding: 5px 8px;
  font-size: 12px;
}

:global(.atlas-item-label.hidden) {
  display: none;
}

:global(.atlas-item-label.selected) {
  border-color: rgba(255, 211, 126, 0.84);
  background: rgba(137, 72, 38, 0.86);
  font-weight: 800;
}

@media (max-width: 760px) {
  .atlas-topbar {
    align-items: flex-start;
    flex-direction: column;
  }

  .atlas-shell {
    grid-template-rows: minmax(560px, 68vh) auto auto;
    padding-inline: 10px;
  }

  .atlas-stage {
    min-height: 560px;
  }

  .atlas-detail {
    top: auto;
    bottom: 14px;
  }
}
</style>
