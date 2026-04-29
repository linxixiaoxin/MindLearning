<template>
  <div class="reader-wrap">
    <div class="reader-header">
      <button class="back-btn" @click="$emit('close')">
        <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
          <path d="M10 4L6 8l4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
        返回
      </button>

      <div class="reader-breadcrumb">
        <span class="breadcrumb-type" :style="{ color: typeMeta.color }">{{ typeMeta.label }}</span>
        <span class="breadcrumb-sep">›</span>
        <span class="breadcrumb-title">{{ nodeId }}</span>
      </div>

      <span class="reader-tagline">{{ nodeTagline }}</span>
    </div>

    <div class="reader-body">
      <div v-if="loading" class="reader-state">
        <div class="loading-spinner"></div>
        <span>正在加载这张卡片…</span>
      </div>

      <div v-else-if="error" class="reader-state">
        <div class="state-icon">📄</div>
        <div class="state-title">暂无对应内容</div>
        <div class="state-desc">“{{ nodeId }}” 还没有对应 Markdown 文件，可以先回到图谱继续查看相关节点。</div>
        <button class="back-btn-lg" @click="$emit('close')">返回上一步</button>
      </div>

      <div v-else>
        <div v-if="canvasCard" class="article-canvas-hero">
          <canvas ref="canvasRef" width="1440" height="760" class="structure-canvas"></canvas>
        </div>

        <div v-else-if="nodeImage" class="article-hero">
          <img :src="nodeImage" :alt="`${nodeId} 对应配图`" class="hero-image" />
        </div>

        <div v-if="frontmatter.tags.length || frontmatter.created" class="article-meta">
          <div v-if="frontmatter.tags.length" class="meta-tags">
            <span v-for="tag in frontmatter.tags" :key="tag" class="meta-tag">{{ tag }}</span>
          </div>
          <span v-if="frontmatter.created" class="meta-created">{{ frontmatter.created }}</span>
        </div>

        <article class="md-content" v-html="renderedHtml" @click.prevent="onArticleClick"></article>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, nextTick, ref, watch } from 'vue'
import { marked } from 'marked'

const props = defineProps({
  nodeId: String,
  bookData: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['close', 'navigate'])

const loading = ref(false)
const error = ref(false)
const renderedHtml = ref('')
const frontmatter = ref({ tags: [], created: '', layer: '' })
const canvasRef = ref(null)

const currentNode = computed(() => (props.bookData?.NODES || []).find((node) => node.id === props.nodeId))
const typeMeta = computed(() => (props.bookData?.NODE_TYPE_META || {})[currentNode.value?.type] || { label: '', color: '#7f8790' })
const nodeTagline = computed(() => currentNode.value?.tagline || '')
const nodeImage = computed(() => props.bookData?.NODE_IMAGES?.[props.nodeId] || '')
const canvasCard = computed(() => props.bookData?.CANVAS_CARDS?.[props.nodeId] || null)
const markdownPathMap = computed(() => {
  const entries = Object.entries(props.bookData?.FILE_MAP || {})
  const map = {}

  for (const [nodeId, filePath] of entries) {
    const stem = markdownStem(filePath)
    if (stem && !map[stem]) {
      map[stem] = nodeId
    }
  }

  return map
})

async function loadContent(id) {
  if (!id) return

  loading.value = true
  error.value = false
  renderedHtml.value = ''
  frontmatter.value = { tags: [], created: '', layer: '' }

  const path = props.bookData?.FILE_MAP?.[id]
  if (!path) {
    loading.value = false
    error.value = true
    return
  }

  try {
    const response = await fetch(path)
    if (!response.ok) throw new Error('not found')
    let text = await response.text()

    const match = text.match(/^(?:\uFEFF)?---\r?\n([\s\S]*?)\r?\n---\r?\n?/)
    if (match) {
      const raw = match[1]
      const tagsLine = raw.match(/^tags:\s*(.+)$/m)
      const layerLine = raw.match(/^layer:\s*(.+)$/m)
      const createdLine = raw.match(/^created:\s*(.+)$/m)

      if (tagsLine) {
        const value = tagsLine[1].trim()
        frontmatter.value.tags = value.startsWith('[')
          ? value.slice(1, -1).split(',').map((item) => item.trim().replace(/^['"]|['"]$/g, ''))
          : value.split(',').map((item) => item.trim())
      }
      if (layerLine) frontmatter.value.layer = layerLine[1].trim()
      if (createdLine) frontmatter.value.created = createdLine[1].trim()

      text = text.slice(match[0].length)
    }

    text = text.replace(/^(\*\*[^*\n]+\*\*)\n(?!\n)/gm, '$1\n\n')

    let processed = text.replace(/\[\[([^\]]+)\]\]/g, (_, name) => {
      return `<a href="#" class="wiki-link" data-wiki="${name}">${name}</a>`
    })
    processed = processed.replace(/\*\*(问|答)\*\*：/g, (_, label) => {
      return `<span class="qa-label">${label}</span>：`
    })

    renderedHtml.value = marked.parse(processed, { breaks: true })
  } catch {
    error.value = true
  } finally {
    loading.value = false
    await nextTick()
    drawCanvasCard()
  }
}

function onArticleClick(event) {
  const link = event.target.closest('a.wiki-link')
  if (link) {
    const target = link.dataset.wiki
    if (target) emit('navigate', target)
    return
  }

  const markdownLink = event.target.closest('a[href]')
  if (!markdownLink) return

  const href = markdownLink.getAttribute('href') || ''
  const target = resolveMarkdownTarget(href)
  if (target) {
    emit('navigate', target)
    return
  }

  if (/^https?:\/\//i.test(href)) {
    window.open(href, '_blank', 'noopener,noreferrer')
  }
}

function markdownStem(value) {
  if (!value) return ''
  const clean = value.replace(/[?#].*$/, '')
  const parts = clean.split('/').filter(Boolean)
  const last = parts[parts.length - 1] || ''
  return decodeURIComponent(last).replace(/\.md$/i, '')
}

function resolveMarkdownTarget(href) {
  if (!href || !/\.md(?:$|[?#])/i.test(href)) return ''

  const stem = markdownStem(href)
  if (!stem) return ''

  const directNode = props.bookData?.FILE_MAP?.[stem]
  if (directNode) return stem

  return (
    props.bookData?.ALIAS_MAP?.[stem]
    || markdownPathMap.value[stem]
    || ''
  )
}

watch(
  () => [props.nodeId, props.bookData],
  ([id]) => {
    loadContent(id)
  },
  { immediate: true },
)

watch(canvasCard, () => {
  if (!loading.value && !error.value) drawCanvasCard()
})

function drawCanvasCard() {
  nextTick(() => {
    const canvas = canvasRef.value
    const card = canvasCard.value
    if (!canvas || !card) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const width = canvas.width
    const height = canvas.height
    ctx.clearRect(0, 0, width, height)
    drawBackground(ctx, width, height)

    const palette = {
      ink: '#15222b',
      muted: '#4a5b68',
      faint: '#9aa6ad',
      brand: '#204f67',
      accent: '#bf6f3f',
      green: '#6f8d66',
      violet: '#795b9b',
      paper: '#fbfaf6',
      line: '#d9d4ca',
    }

    if (card.template === 'translation') drawTranslation(ctx, card, palette, width, height)
    else if (card.template === 'scene-window') drawSceneWindow(ctx, card, palette, width, height)
    else if (card.template === 'compass') drawCompass(ctx, card, palette, width, height)
    else drawModernDilemma(ctx, card, palette, width, height)
  })
}

function drawBackground(ctx, width, height) {
  ctx.fillStyle = '#f7f5f0'
  ctx.fillRect(0, 0, width, height)
  const gradient = ctx.createRadialGradient(1120, 80, 60, 1120, 80, 640)
  gradient.addColorStop(0, 'rgba(220, 231, 235, 0.95)')
  gradient.addColorStop(1, 'rgba(247, 245, 240, 0)')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, width, height)
}

function drawTitle(ctx, card, palette) {
  ctx.fillStyle = palette.accent
  ctx.font = '24px "Segoe UI", sans-serif'
  ctx.fillText(card.kicker || 'STRUCTURE MAP', 78, 86)
  ctx.fillStyle = palette.ink
  ctx.font = '700 64px "Microsoft YaHei", "Segoe UI", sans-serif'
  wrapCanvasText(ctx, card.title || '', 78, 166, 900, 76)
  ctx.fillStyle = palette.muted
  ctx.font = '30px "Microsoft YaHei", "Segoe UI", sans-serif'
  wrapCanvasText(ctx, card.subtitle || '', 82, 268, 920, 42)
}

function drawModernDilemma(ctx, card, palette, width, height) {
  drawTitle(ctx, card, palette)
  const center = { x: 720, y: 500 }
  drawCircle(ctx, center.x, center.y, 118, palette.paper, palette.brand)
  ctx.fillStyle = palette.brand
  ctx.font = '700 30px "Microsoft YaHei", sans-serif'
  centerText(ctx, card.center || '当前困境', center.x, center.y - 8, 200, 34)

  const labels = card.nodes?.length ? card.nodes : ['私人刺痛', '社会标准', '替代参照', '温柔命名']
  const points = [
    { x: 380, y: 430, color: palette.accent },
    { x: 1060, y: 430, color: palette.violet },
    { x: 470, y: 650, color: palette.green },
    { x: 970, y: 650, color: palette.brand },
  ]
  labels.slice(0, 4).forEach((label, index) => {
    const point = points[index]
    drawLine(ctx, center.x, center.y, point.x, point.y, point.color)
    drawCircle(ctx, point.x, point.y, 78, '#fffdf8', point.color)
    ctx.fillStyle = point.color
    ctx.font = '700 24px "Microsoft YaHei", sans-serif'
    centerText(ctx, label, point.x, point.y - 8, 132, 30)
  })
}

function drawTranslation(ctx, card, palette) {
  drawTitle(ctx, card, palette)
  const columns = card.nodes?.length ? card.nodes : ['原始感受', '参照系统', '重新命名']
  const xs = [250, 720, 1190]
  columns.slice(0, 3).forEach((label, index) => {
    roundRect(ctx, xs[index] - 150, 410, 300, 170, 30, '#fffdf8', index === 1 ? palette.accent : palette.brand)
    ctx.fillStyle = index === 1 ? palette.accent : palette.brand
    ctx.font = '700 30px "Microsoft YaHei", sans-serif'
    centerText(ctx, label, xs[index], 480, 230, 36)
    if (index < 2) {
      drawArrow(ctx, xs[index] + 175, 495, xs[index + 1] - 175, 495, palette.line)
    }
  })
}

function drawSceneWindow(ctx, card, palette) {
  drawTitle(ctx, card, palette)
  roundRect(ctx, 238, 360, 960, 300, 38, 'rgba(255,255,255,0.72)', palette.line)
  ctx.strokeStyle = palette.brand
  ctx.lineWidth = 4
  ctx.beginPath()
  ctx.moveTo(718, 360)
  ctx.lineTo(718, 660)
  ctx.stroke()
  ctx.fillStyle = palette.brand
  ctx.font = '700 32px "Microsoft YaHei", sans-serif'
  centerText(ctx, card.left || '日常场景', 478, 470, 360, 40)
  ctx.fillStyle = palette.accent
  centerText(ctx, card.right || '心理结构', 958, 470, 360, 40)
  ctx.fillStyle = palette.muted
  ctx.font = '24px "Microsoft YaHei", sans-serif'
  centerText(ctx, card.caption || '把一个普通现场看成内在生活的线索', 718, 590, 760, 34)
}

function drawCompass(ctx, card, palette) {
  drawTitle(ctx, card, palette)
  const cx = 720
  const cy = 520
  drawCircle(ctx, cx, cy, 170, 'rgba(255,255,255,0.72)', palette.brand)
  drawCircle(ctx, cx, cy, 70, palette.paper, palette.accent)
  ctx.fillStyle = palette.accent
  ctx.font = '700 26px "Microsoft YaHei", sans-serif'
  centerText(ctx, card.center || '替代参照', cx, cy - 8, 160, 34)
  const labels = card.nodes?.length ? card.nodes : ['哲学', '艺术', '政治', '宗教']
  const points = [
    { x: cx, y: cy - 230 },
    { x: cx + 260, y: cy },
    { x: cx, y: cy + 230 },
    { x: cx - 260, y: cy },
  ]
  labels.slice(0, 4).forEach((label, index) => {
    drawLine(ctx, cx, cy, points[index].x, points[index].y, palette.line)
    drawCircle(ctx, points[index].x, points[index].y, 76, '#fffdf8', palette.green)
    ctx.fillStyle = palette.green
    ctx.font = '700 24px "Microsoft YaHei", sans-serif'
    centerText(ctx, label, points[index].x, points[index].y - 8, 130, 30)
  })
}

function wrapCanvasText(ctx, text, x, y, maxWidth, lineHeight) {
  const chars = String(text).split('')
  let line = ''
  let currentY = y
  for (const char of chars) {
    const test = line + char
    if (ctx.measureText(test).width > maxWidth && line) {
      ctx.fillText(line, x, currentY)
      line = char
      currentY += lineHeight
    } else {
      line = test
    }
  }
  if (line) ctx.fillText(line, x, currentY)
}

function centerText(ctx, text, x, y, maxWidth, lineHeight) {
  const chars = String(text).split('')
  const lines = []
  let line = ''
  for (const char of chars) {
    const test = line + char
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line)
      line = char
    } else {
      line = test
    }
  }
  if (line) lines.push(line)
  lines.forEach((item, index) => {
    ctx.fillText(item, x - ctx.measureText(item).width / 2, y + index * lineHeight)
  })
}

function roundRect(ctx, x, y, width, height, radius, fill, stroke) {
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
  ctx.fillStyle = fill
  ctx.fill()
  ctx.strokeStyle = stroke
  ctx.lineWidth = 3
  ctx.stroke()
}

function drawCircle(ctx, x, y, radius, fill, stroke) {
  ctx.beginPath()
  ctx.arc(x, y, radius, 0, Math.PI * 2)
  ctx.fillStyle = fill
  ctx.fill()
  ctx.strokeStyle = stroke
  ctx.lineWidth = 4
  ctx.stroke()
}

function drawLine(ctx, x1, y1, x2, y2, color) {
  ctx.strokeStyle = color
  ctx.lineWidth = 4
  ctx.beginPath()
  ctx.moveTo(x1, y1)
  ctx.lineTo(x2, y2)
  ctx.stroke()
}

function drawArrow(ctx, x1, y1, x2, y2, color) {
  drawLine(ctx, x1, y1, x2, y2, color)
  ctx.fillStyle = color
  ctx.beginPath()
  ctx.moveTo(x2, y2)
  ctx.lineTo(x2 - 18, y2 - 10)
  ctx.lineTo(x2 - 18, y2 + 10)
  ctx.closePath()
  ctx.fill()
}
</script>

<style scoped>
.reader-wrap {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.reader-header {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 12px 26px;
  border-bottom: 1px solid var(--border-default);
  background: rgba(247, 245, 240, 0.86);
  backdrop-filter: blur(8px);
}

.back-btn {
  border: 1px solid var(--border-default);
  border-radius: 999px;
  background: var(--bg-elevated);
  color: var(--text-secondary);
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 7px 12px;
  cursor: pointer;
}

.back-btn:hover,
.back-btn-lg:hover {
  color: var(--brand);
  border-color: rgba(32, 79, 103, 0.24);
}

.reader-breadcrumb {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.breadcrumb-type {
  font-size: 11px;
  font-weight: 700;
}

.breadcrumb-sep {
  color: var(--text-muted);
}

.breadcrumb-title {
  font-family: var(--font-serif);
  font-size: 15px;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.reader-tagline {
  margin-left: auto;
  color: var(--text-muted);
  font-size: 11px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 320px;
}

.reader-body {
  flex: 1;
  overflow-y: auto;
  padding: 34px 48px 48px;
}

.reader-body::-webkit-scrollbar {
  width: 4px;
}

.reader-body::-webkit-scrollbar-thumb {
  background: var(--border-strong);
  border-radius: 999px;
}

.reader-state {
  padding-top: 90px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  text-align: center;
  color: var(--text-secondary);
}

.loading-spinner {
  width: 24px;
  height: 24px;
  border: 2px solid var(--border-default);
  border-top-color: var(--accent);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.state-icon {
  font-size: 38px;
}

.state-title {
  font-size: 17px;
  color: var(--text-primary);
}

.state-desc {
  max-width: 360px;
  line-height: 1.7;
}

.back-btn-lg {
  border: 1px solid var(--border-default);
  border-radius: 999px;
  background: var(--bg-elevated);
  color: var(--text-secondary);
  padding: 8px 16px;
  cursor: pointer;
}

.article-meta {
  max-width: 760px;
  margin: 0 auto 20px;
  display: flex;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;
}

.article-hero,
.article-canvas-hero {
  max-width: 760px;
  margin: 0 auto 22px;
}

.hero-image {
  display: block;
  width: 100%;
  border-radius: 20px;
  border: 1px solid var(--border-default);
  box-shadow: var(--shadow-sm);
  background: rgba(255, 255, 255, 0.72);
}

.structure-canvas {
  display: block;
  width: 100%;
  aspect-ratio: 1440 / 760;
  border-radius: 20px;
  border: 1px solid var(--border-default);
  box-shadow: var(--shadow-sm);
  background: rgba(255, 255, 255, 0.72);
}

.meta-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.meta-tag {
  padding: 3px 10px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.72);
  border: 1px solid var(--border-default);
  color: var(--text-tertiary);
  font-size: 11px;
}

.meta-created {
  color: var(--text-muted);
  font-size: 11px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 720px) {
  .reader-header {
    padding: 10px 14px;
    gap: 10px;
  }

  .reader-tagline {
    display: none;
  }

  .reader-body {
    padding: 22px 18px 36px;
  }
}
</style>

<style>
.md-content {
  max-width: 760px;
  margin: 0 auto;
  color: var(--text-secondary);
  font-size: 15px;
  line-height: 1.82;
}

.md-content h1 {
  margin-bottom: 10px;
  font-family: var(--font-serif);
  font-size: 31px;
  line-height: 1.2;
  color: var(--text-primary);
}

.md-content h2 {
  margin-top: 34px;
  margin-bottom: 14px;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--border-default);
  font-family: var(--font-serif);
  font-size: 20px;
  color: var(--text-primary);
}

.md-content h3 {
  margin-top: 20px;
  margin-bottom: 8px;
  font-size: 15px;
  color: var(--text-primary);
}

.md-content p,
.md-content ul,
.md-content ol,
.md-content blockquote,
.md-content pre {
  margin-bottom: 14px;
}

.md-content img {
  display: block;
  width: 100%;
  max-width: 100%;
  margin: 18px 0 22px;
  border-radius: 18px;
  border: 1px solid var(--border-default);
  box-shadow: var(--shadow-sm);
  background: rgba(255, 255, 255, 0.72);
}

.md-content ul,
.md-content ol {
  padding-left: 22px;
}

.md-content li {
  margin-bottom: 6px;
}

.md-content blockquote {
  padding: 12px 16px;
  border-left: 3px solid var(--accent);
  background: rgba(191, 111, 63, 0.08);
  border-radius: 0 10px 10px 0;
}

.md-content strong {
  color: var(--text-primary);
}

.md-content hr {
  border: none;
  border-top: 1px solid var(--border-default);
  margin: 22px 0;
}

.md-content a {
  color: var(--brand);
  text-decoration: none;
  cursor: pointer;
}

.md-content .wiki-link {
  border-bottom: 1px dashed rgba(32, 79, 103, 0.35);
}

.md-content .wiki-link:hover {
  color: var(--accent);
  border-bottom-color: rgba(191, 111, 63, 0.45);
}

.md-content code {
  padding: 2px 6px;
  border-radius: 6px;
  background: rgba(32, 79, 103, 0.08);
  color: var(--brand);
}

.md-content pre {
  padding: 16px;
  border-radius: 14px;
  background: var(--bg-deep);
  overflow-x: auto;
}

.md-content pre code {
  background: transparent;
  color: var(--text-on-dark);
  padding: 0;
}

.md-content .qa-label {
  display: inline;
  font-weight: 700;
  color: var(--text-primary);
}

.md-content p:not(li p) > strong:first-child {
  display: block;
  margin-bottom: 4px;
  margin-top: 18px;
}

.md-content p:first-of-type > strong:first-child {
  margin-top: 0;
}

@media (max-width: 720px) {
  .md-content {
    font-size: 14px;
    line-height: 1.76;
  }

  .md-content h1 {
    font-size: 24px;
  }

  .md-content h2 {
    font-size: 18px;
  }
}
</style>
