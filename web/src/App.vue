<template>
  <div class="app-shell">
    <header class="topbar">
      <button
        v-if="hasBookContext"
        class="icon-btn"
        @click="sidebarOpen = !sidebarOpen"
        title="目录"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <rect x="2" y="4" width="12" height="1.3" rx="0.65" fill="currentColor" />
          <rect x="2" y="7.4" width="9" height="1.3" rx="0.65" fill="currentColor" />
          <rect x="2" y="10.8" width="11" height="1.3" rx="0.65" fill="currentColor" />
        </svg>
      </button>
      <div v-else class="icon-btn ghost"></div>

      <div class="brand" @click="goBrandHome">
        <span class="brand-kicker">{{ brandKicker }}</span>
        <span class="brand-name">{{ brandName }}</span>
      </div>

      <nav class="nav-tabs">
        <button class="nav-btn" :class="{ active: view === 'library' }" @click="goLibrary">书库</button>
        <button class="nav-btn" :class="{ active: view === 'thoughtPartner' }" @click="goThoughtPartner">
          思想伙伴
        </button>
        <button
          v-if="hasBookContext"
          class="nav-btn"
          :class="{ active: view === 'home' }"
          @click="goBookHome(currentSlug)"
        >
          阅读地图
        </button>
        <button
          v-if="hasBookContext"
          class="nav-btn"
          :class="{ active: view === 'graph' }"
          @click="onShowGraph"
        >
          知识图谱
        </button>
        <button
          v-if="hasTopicContext"
          class="nav-btn"
          :class="{ active: view === 'topic' }"
          @click="goTopicHome(currentTopicSlug)"
        >
          专题页
        </button>
      </nav>

      <div class="topbar-right">
        <div v-if="hasBookContext" class="search-scope">
          <button
            class="scope-btn"
            :class="{ active: resolvedSearchScope === 'context' }"
            @click="setSearchScope('context')"
          >
            本书
          </button>
          <button
            class="scope-btn"
            :class="{ active: resolvedSearchScope === 'global' }"
            @click="setSearchScope('global')"
          >
            全站
          </button>
        </div>

        <div class="search-wrap" ref="searchWrapRef">
          <svg class="search-icon" width="13" height="13" viewBox="0 0 16 16" fill="none">
            <circle cx="6.5" cy="6.5" r="4.5" stroke="currentColor" stroke-width="1.4" />
            <path d="M10.5 10.5L14 14" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" />
          </svg>
          <input
            v-model="searchQuery"
            class="search-input"
            :placeholder="searchPlaceholder"
            @keydown.escape="clearSearch"
            @keydown.enter="onSearchEnter"
            @keydown.down.prevent="onSearchArrow(1)"
            @keydown.up.prevent="onSearchArrow(-1)"
            @focus="onSearchFocus"
          />

          <div v-if="searchFocused && searchQuery && searchResults.length > 0" class="search-dropdown">
            <button
              v-for="(item, idx) in searchResults"
              :key="item.key"
              class="search-result"
              :class="{ highlighted: idx === searchHighlight }"
              @mousedown.prevent="onSearchSelect(item)"
            >
              <span class="result-type" :style="{ color: item.typeColor }">
                {{ item.typeLabel }}
              </span>
              <span class="result-main">
                <span class="result-name">{{ item.title }}</span>
                <span v-if="item.tagline" class="result-tagline">{{ item.tagline }}</span>
                <span v-if="item.context" class="result-context">{{ item.context }}</span>
              </span>
            </button>
          </div>

          <div
            v-else-if="searchFocused && searchQuery && searchLoading"
            class="search-dropdown search-empty"
          >
            正在建立多书搜索索引…
          </div>

          <div v-else-if="searchFocused && searchQuery" class="search-dropdown search-empty">
            {{ searchEmptyText }}
          </div>
        </div>

        <span v-if="hasBookContext" class="node-count">{{ currentBookData?.NODES?.length || 0 }} 个节点</span>
      </div>
    </header>

    <div v-if="sidebarVisible && sidebarOpen" class="sidebar-overlay" @click="sidebarOpen = false"></div>

    <div class="main">
      <Sidebar
        v-if="sidebarVisible && currentBookData"
        :open="sidebarOpen"
        :book-data="currentBookData"
        :active-node="activeNode"
        :is-graph-active="view === 'graph'"
        @toggle="sidebarOpen = !sidebarOpen"
        @select-node="onSidebarSelect"
        @show-graph="onShowGraph"
      />

      <main class="content">
        <div v-if="routeLoading" class="app-state">
          <div class="loading-spinner"></div>
          <div class="state-title">正在加载站点数据…</div>
        </div>

        <div v-else-if="routeError" class="app-state">
          <div class="state-icon">📖</div>
          <div class="state-title">这个入口暂时还没准备好</div>
          <div class="state-desc">{{ routeError }}</div>
          <button class="back-btn-lg" @click="goLibrary">返回书库</button>
        </div>

        <BookLibrary
          v-else-if="view === 'library'"
          :registry="registry"
          @navigate="onOpenBook"
          @show-graph="onOpenBookGraph"
          @open-topic="onOpenTopic"
          @open-tool="onOpenTool"
        />

        <HomeView
          v-else-if="view === 'home' && currentBookData"
          :book-data="currentBookData"
          @navigate="onNavigate"
          @show-graph="onShowGraph"
        />

        <KnowledgeGraph
          v-else-if="view === 'graph' && currentBookData"
          :book-data="currentBookData"
          :active-node="activeNode"
          @select-node="onGraphSelect"
          @open-reader="onSidebarSelect"
        />

        <TopicPage
          v-else-if="view === 'topic' && currentTopicData"
          :topic="currentTopicData"
          @open-book="onOpenBook"
          @open-node="onOpenNode"
          @open-topic="onOpenTopic"
        />

        <ThoughtPartnerTool
          v-else-if="view === 'thoughtPartner'"
        />

        <ArticleReader
          v-else-if="view === 'reader' && activeNode && currentBookData"
          :book-data="currentBookData"
          :node-id="activeNode"
          @close="onReaderClose"
          @navigate="onNavigate"
        />
      </main>
    </div>

    <footer class="footer-banner">
      <span class="footer-label">{{ footerSite.creatorLabel }}</span>
      <span class="footer-brand">{{ footerSite.creatorName }}</span>
      <span class="footer-dot">·</span>
      <span class="footer-note">{{ footerSite.footerNote }}</span>
    </footer>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import ArticleReader from './components/ArticleReader.vue'
import BookLibrary from './components/BookLibrary.vue'
import HomeView from './components/HomeView.vue'
import KnowledgeGraph from './components/KnowledgeGraph.vue'
import Sidebar from './components/Sidebar.vue'
import ThoughtPartnerTool from './components/ThoughtPartnerTool.vue'
import TopicPage from './components/TopicPage.vue'
import { loadBookBundle, loadRegistry, loadTopicBundle } from './lib/bookData.js'

const registry = ref({
  site: {
    title: '多书知识站',
    shortTitle: 'Book Hub',
    creatorLabel: 'Knowledge Library',
    creatorName: '林子-心智进化之路',
    footerNote: '复杂世界和复杂人性的同行翻译者',
  },
  books: [],
  topics: [],
  tools: [],
})

const sidebarOpen = ref(window.innerWidth > 720)
const view = ref('library')
const activeNode = ref(null)
const currentSlug = ref('')
const currentBookData = ref(null)
const currentTopicSlug = ref('')
const currentTopicData = ref(null)
const routeLoading = ref(true)
const routeError = ref('')

const searchQuery = ref('')
const searchFocused = ref(false)
const searchHighlight = ref(-1)
const searchScope = ref('global')
const searchWrapRef = ref(null)
const globalSearchIndex = ref([])
const globalSearchLoading = ref(false)
const historyStack = ref([])

let routeToken = 0
let globalSearchPromise = null

const footerSite = computed(() => currentBookData.value?.SITE || registry.value.site)
const hasBookContext = computed(() => Boolean(currentBookData.value))
const hasTopicContext = computed(() => Boolean(currentTopicData.value))
const hasToolContext = computed(() => view.value === 'thoughtPartner')
const sidebarVisible = computed(() => hasBookContext.value)
const resolvedSearchScope = computed(() => {
  if (!hasBookContext.value) return 'global'
  return searchScope.value === 'global' ? 'global' : 'context'
})
const searchPlaceholder = computed(() => {
  if (resolvedSearchScope.value === 'global') {
    return registry.value.site?.searchPlaceholder || '搜索书名、主题、章节、概念、方法、场景…'
  }
  return currentBookData.value?.SITE?.searchPlaceholder || '搜索当前书内容…'
})
const searchLoading = computed(() => resolvedSearchScope.value === 'global' && globalSearchLoading.value)
const searchEmptyText = computed(() => {
  if (!searchQuery.value) return ''
  if (resolvedSearchScope.value === 'global') {
    return `没有找到和“${searchQuery.value}”相关的全站内容`
  }
  return `没有找到和“${searchQuery.value}”相关的当前书节点`
})
const brandKicker = computed(() => {
  if (hasBookContext.value) return currentBookData.value?.SITE?.creatorLabel || 'Book Site'
  if (hasTopicContext.value) return currentTopicData.value?.phaseLabel || 'Cross-book Topic'
  if (hasToolContext.value) return 'Product Experiment'
  return registry.value.site?.creatorLabel || 'Knowledge Library'
})
const brandName = computed(() => {
  if (hasBookContext.value) {
    return currentBookData.value?.SITE?.shortTitle || currentBookData.value?.SITE?.title || 'Book'
  }
  if (hasTopicContext.value) {
    return currentTopicData.value?.shortTitle || currentTopicData.value?.title || 'Topic'
  }
  if (hasToolContext.value) return '思想伙伴选配器'
  return registry.value.site?.shortTitle || registry.value.site?.title || '多书知识站'
})

const aliasesByNode = computed(() => groupAliasesByNode(currentBookData.value?.ALIAS_MAP || {}))

const searchResults = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()
  if (!query) return []

  const entries = resolvedSearchScope.value === 'global'
    ? globalSearchIndex.value
    : buildCurrentBookSearchEntries()

  return entries
    .map((entry) => ({ entry, score: scoreSearchEntry(entry, query) }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score || a.entry.title.localeCompare(b.entry.title, 'zh-CN'))
    .slice(0, 10)
    .map((item) => item.entry)
})

watch(searchQuery, () => {
  searchHighlight.value = -1
})

watch(
  [searchQuery, resolvedSearchScope],
  ([query, scope]) => {
    if (scope === 'global' && query.trim()) {
      void ensureGlobalSearchIndex()
    }
  },
  { immediate: true },
)

watch(hasBookContext, (value, previous) => {
  if (value && !previous) {
    searchScope.value = 'context'
  }
  if (!value) {
    searchScope.value = 'global'
  }
})

function groupAliasesByNode(aliasMap = {}) {
  const grouped = {}
  for (const [alias, nodeId] of Object.entries(aliasMap)) {
    if (!grouped[nodeId]) grouped[nodeId] = []
    grouped[nodeId].push(alias)
  }
  return grouped
}

function normalizeSearchText(...parts) {
  return parts.filter(Boolean).join(' ').toLowerCase()
}

function buildNodeSearchEntry({ slug, bookTitle, bookShortTitle, author, node, aliases = [], nodeTypeMeta = {}, context = '' }) {
  const meta = nodeTypeMeta[node.type] || {}
  return {
    key: `node:${slug}:${node.id}`,
    kind: 'node',
    slug,
    nodeId: node.id,
    title: node.id,
    tagline: node.tagline || '',
    context,
    type: node.type,
    typeLabel: meta.label || node.type,
    typeColor: meta.color || '#7f8790',
    searchText: normalizeSearchText(
      node.id,
      node.tagline,
      aliases.join(' '),
      bookTitle,
      bookShortTitle,
      author,
      context,
    ),
  }
}

function buildBookSearchEntry(book, bundle) {
  const title = book.title || bundle?.SITE?.title || book.slug
  const context = [book.author, book.primaryCategory].filter(Boolean).join(' · ')
  return {
    key: `book:${book.slug}`,
    kind: 'book',
    slug: book.slug,
    title,
    tagline: book.description || bundle?.SITE?.description || '',
    context,
    type: 'book',
    typeLabel: '书籍',
    typeColor: '#bf6f3f',
    searchText: normalizeSearchText(
      title,
      book.shortTitle,
      book.author,
      book.primaryCategory,
      book.secondaryCategory,
      book.description,
      bundle?.SITE?.subtitle,
      bundle?.SITE?.description,
    ),
  }
}

function buildTopicSearchEntry(topic) {
  return {
    key: `topic:${topic.slug}`,
    kind: 'topic',
    slug: topic.slug,
    title: topic.title,
    tagline: topic.subtitle || topic.description || '',
    context: [topic.phaseLabel, ...(topic.tags || []).slice(0, 2)].filter(Boolean).join(' · '),
    type: 'topic',
    typeLabel: '专题',
    typeColor: '#8a5a44',
    searchText: normalizeSearchText(
      topic.title,
      topic.subtitle,
      topic.description,
      topic.phaseLabel,
      ...(topic.tags || []),
    ),
  }
}

function buildToolSearchEntry(tool) {
  return {
    key: `tool:${tool.slug}`,
    kind: 'tool',
    slug: tool.slug,
    title: tool.title,
    tagline: tool.subtitle || tool.description || '',
    context: [tool.phaseLabel, ...(tool.tags || []).slice(0, 2)].filter(Boolean).join(' · '),
    type: 'tool',
    typeLabel: '工具',
    typeColor: '#2f6f73',
    searchText: normalizeSearchText(
      tool.title,
      tool.subtitle,
      tool.description,
      tool.phaseLabel,
      ...(tool.tags || []),
    ),
  }
}

function buildCurrentBookSearchEntries() {
  if (!currentBookData.value) return []
  const bookTitle = currentBookData.value?.SITE?.title || currentBookData.value?.SITE?.shortTitle || ''
  return currentBookData.value.NODES.map((node) =>
    buildNodeSearchEntry({
      slug: currentSlug.value,
      bookTitle,
      node,
      aliases: aliasesByNode.value[node.id] || [],
      nodeTypeMeta: currentBookData.value?.NODE_TYPE_META || {},
    }),
  )
}

function scoreSearchEntry(entry, query) {
  if (!entry.searchText.includes(query)) return 0

  const title = entry.title.toLowerCase()
  const tagline = entry.tagline.toLowerCase()
  const context = (entry.context || '').toLowerCase()
  let score = entry.kind === 'book' ? 18 : 0

  if (title === query) score += 140
  else if (title.startsWith(query)) score += 96
  else if (title.includes(query)) score += 64

  if (tagline.startsWith(query)) score += 30
  else if (tagline.includes(query)) score += 16

  if (context.startsWith(query)) score += 12
  else if (context.includes(query)) score += 6

  return score + 1
}

async function ensureGlobalSearchIndex() {
  if (globalSearchIndex.value.length > 0) return globalSearchIndex.value
  if (globalSearchPromise) return globalSearchPromise

  globalSearchLoading.value = true
  globalSearchPromise = (async () => {
    const books = registry.value?.books || []
    const topics = registry.value?.topics || []
    const tools = registry.value?.tools || []
    const bundles = await Promise.all(
      books.map(async (book) => {
        try {
          const bundle = await loadBookBundle(book.slug)
          return { book, bundle }
        } catch {
          return { book, bundle: null }
        }
      }),
    )

    const entries = []
    for (const topic of topics) {
      entries.push(buildTopicSearchEntry(topic))
    }

    for (const tool of tools) {
      entries.push(buildToolSearchEntry(tool))
    }

    for (const { book, bundle } of bundles) {
      entries.push(buildBookSearchEntry(book, bundle))
      if (!bundle) continue

      const aliasGroups = groupAliasesByNode(bundle.ALIAS_MAP || {})
      for (const node of bundle.NODES || []) {
        entries.push(
          buildNodeSearchEntry({
            slug: book.slug,
            bookTitle: book.title || bundle.SITE?.title || book.slug,
            bookShortTitle: book.shortTitle || bundle.SITE?.shortTitle || '',
            author: book.author || '',
            node,
            aliases: aliasGroups[node.id] || [],
            nodeTypeMeta: bundle.NODE_TYPE_META || {},
            context: `《${book.title || bundle.SITE?.title || book.slug}》`,
          }),
        )
      }
    }

    globalSearchIndex.value = entries
    return entries
  })().finally(() => {
    globalSearchLoading.value = false
    globalSearchPromise = null
  })

  return globalSearchPromise
}

function scheduleGlobalSearchWarmup() {
  const warmup = () => {
    void ensureGlobalSearchIndex()
  }

  if (typeof window.requestIdleCallback === 'function') {
    window.requestIdleCallback(warmup)
    return
  }

  window.setTimeout(warmup, 280)
}

function decodeSegment(value) {
  try {
    return decodeURIComponent(value)
  } catch {
    return value
  }
}

function parseRoute(pathname) {
  const normalized = pathname.replace(/\/+$/, '') || '/'
  if (normalized === '/' || normalized === '/books') {
    return { view: 'library', slug: '', nodeId: null }
  }

  if (normalized === '/tools/thought-partner') {
    return { view: 'thoughtPartner', slug: '', nodeId: null }
  }

  const topicMatch = normalized.match(/^\/topics\/([^/]+)$/)
  if (topicMatch) {
    return {
      view: 'topic',
      slug: decodeSegment(topicMatch[1]),
      nodeId: null,
    }
  }

  const noteMatch = normalized.match(/^\/books\/([^/]+)\/note\/(.+)$/)
  if (noteMatch) {
    return {
      view: 'reader',
      slug: decodeSegment(noteMatch[1]),
      nodeId: decodeSegment(noteMatch[2]),
    }
  }

  const graphMatch = normalized.match(/^\/books\/([^/]+)\/graph$/)
  if (graphMatch) {
    return {
      view: 'graph',
      slug: decodeSegment(graphMatch[1]),
      nodeId: null,
    }
  }

  const bookMatch = normalized.match(/^\/books\/([^/]+)$/)
  if (bookMatch) {
    return {
      view: 'home',
      slug: decodeSegment(bookMatch[1]),
      nodeId: null,
    }
  }

  return { view: 'library', slug: '', nodeId: null }
}

function routeToUrl(targetView, slug, nodeId) {
  if (targetView === 'thoughtPartner') return '/tools/thought-partner'
  if (!slug || targetView === 'library') return '/books'
  const safeSlug = encodeURIComponent(slug)
  if (targetView === 'topic') return `/topics/${safeSlug}`
  if (targetView === 'graph') return `/books/${safeSlug}/graph`
  if (targetView === 'reader' && nodeId) return `/books/${safeSlug}/note/${encodeURIComponent(nodeId)}`
  return `/books/${safeSlug}`
}

function resolveNodeId(bookData, nodeId) {
  if (!nodeId || !bookData) return null
  if (bookData.FILE_MAP[nodeId]) return nodeId
  return bookData.ALIAS_MAP[nodeId] || nodeId
}

async function applyRoute(route, { replaceHistory = false } = {}) {
  const token = ++routeToken
  routeLoading.value = true
  routeError.value = ''

  try {
    if (route.view === 'thoughtPartner') {
      currentSlug.value = ''
      currentBookData.value = null
      currentTopicSlug.value = ''
      currentTopicData.value = null
      view.value = 'thoughtPartner'
      activeNode.value = null
      searchScope.value = 'global'
      if (replaceHistory) {
        window.history.replaceState({ view: 'thoughtPartner' }, '', '/tools/thought-partner')
      }
      return
    }

    if (route.view === 'library' || !route.slug) {
      currentSlug.value = ''
      currentBookData.value = null
      currentTopicSlug.value = ''
      currentTopicData.value = null
      view.value = 'library'
      activeNode.value = null
      searchScope.value = 'global'
      if (replaceHistory) {
        window.history.replaceState({ view: 'library' }, '', '/books')
      }
      return
    }

    if (route.view === 'topic') {
      const topicData = await loadTopicBundle(route.slug)
      if (token !== routeToken) return

      currentSlug.value = ''
      currentBookData.value = null
      currentTopicSlug.value = route.slug
      currentTopicData.value = topicData
      view.value = 'topic'
      activeNode.value = null
      searchScope.value = 'global'

      if (replaceHistory) {
        const nextUrl = routeToUrl(route.view, route.slug, null)
        window.history.replaceState({ view: route.view, slug: route.slug, nodeId: null }, '', nextUrl)
      }
      return
    }

    const bookData = await loadBookBundle(route.slug)
    if (token !== routeToken) return

    currentSlug.value = route.slug
    currentBookData.value = bookData
    currentTopicSlug.value = ''
    currentTopicData.value = null
    view.value = route.view
    activeNode.value = route.view === 'reader' ? resolveNodeId(bookData, route.nodeId) : null
    if (searchScope.value !== 'global') {
      searchScope.value = 'context'
    }

    if (replaceHistory) {
      const nextUrl = routeToUrl(route.view, route.slug, activeNode.value)
      window.history.replaceState(
        { view: route.view, slug: route.slug, nodeId: activeNode.value },
        '',
        nextUrl,
      )
    }
  } catch {
    if (token !== routeToken) return
    currentSlug.value = ''
    currentBookData.value = null
    currentTopicSlug.value = ''
    currentTopicData.value = null
    view.value = 'library'
    activeNode.value = null
    routeError.value = `“${route.slug}” 的多书站数据还没有准备好，或者静态文件路径还没有接通。`
  } finally {
    if (token === routeToken) {
      routeLoading.value = false
    }
  }
}

async function goToRoute(targetView, slug = '', nodeId = null, { replaceHistory = false } = {}) {
  const nextUrl = routeToUrl(targetView, slug, nodeId)
  const currentUrl = window.location.pathname + window.location.search
  if (replaceHistory) {
    window.history.replaceState({ view: targetView, slug, nodeId }, '', nextUrl)
  } else if (nextUrl !== currentUrl) {
    window.history.pushState({ view: targetView, slug, nodeId }, '', nextUrl)
  }
  await applyRoute({ view: targetView, slug, nodeId }, { replaceHistory: false })
}

async function applyRouteFromUrl(replaceHistory = false) {
  await applyRoute(parseRoute(window.location.pathname), { replaceHistory })
}

async function onPopState() {
  historyStack.value = []
  await applyRouteFromUrl(false)
}

function onClickOutside(event) {
  if (searchWrapRef.value && !searchWrapRef.value.contains(event.target)) {
    searchFocused.value = false
    searchHighlight.value = -1
  }
}

onMounted(async () => {
  document.addEventListener('mousedown', onClickOutside)
  window.addEventListener('popstate', onPopState)
  registry.value = await loadRegistry()
  scheduleGlobalSearchWarmup()
  await applyRouteFromUrl(true)
})

onUnmounted(() => {
  document.removeEventListener('mousedown', onClickOutside)
  window.removeEventListener('popstate', onPopState)
})

async function goLibrary() {
  historyStack.value = []
  clearSearch()
  await goToRoute('library', '')
}

async function goThoughtPartner() {
  historyStack.value = []
  clearSearch()
  await goToRoute('thoughtPartner', '')
}

async function goBookHome(slug) {
  if (!slug) return
  historyStack.value = []
  clearSearch()
  await goToRoute('home', slug)
}

async function goTopicHome(slug) {
  if (!slug) return
  historyStack.value = []
  clearSearch()
  await goToRoute('topic', slug)
}

async function goBrandHome() {
  if (currentSlug.value) {
    await goBookHome(currentSlug.value)
    return
  }
  if (currentTopicSlug.value) {
    await goTopicHome(currentTopicSlug.value)
    return
  }
  await goLibrary()
}

async function onOpenBook(slug) {
  await goBookHome(slug)
}

async function onOpenTopic(slug) {
  await goTopicHome(slug)
}

async function onOpenTool(slug) {
  if (slug !== 'thought-partner') return
  await goThoughtPartner()
}

async function onOpenNode(payload) {
  if (!payload?.slug || !payload?.nodeId) return
  historyStack.value = []
  clearSearch()
  await goToRoute('reader', payload.slug, payload.nodeId)
}

async function onOpenBookGraph(slug) {
  historyStack.value = []
  clearSearch()
  await goToRoute('graph', slug)
}

async function onShowGraph() {
  if (!currentSlug.value) return
  historyStack.value = []
  clearSearch()
  await goToRoute('graph', currentSlug.value)
}

function onGraphSelect(id) {
  activeNode.value = id
}

function setSearchScope(scope) {
  searchScope.value = scope
  searchFocused.value = false
  searchHighlight.value = -1
  if (scope === 'global') {
    void ensureGlobalSearchIndex()
  }
}

function onSearchFocus() {
  searchFocused.value = true
  if (resolvedSearchScope.value === 'global') {
    void ensureGlobalSearchIndex()
  }
}

async function pushReader(id) {
  if (!currentSlug.value) return
  const resolvedId = resolveNodeId(currentBookData.value, id)
  historyStack.value.push({ view: view.value, slug: currentSlug.value, nodeId: activeNode.value })
  activeNode.value = resolvedId
  clearSearch()
  await goToRoute('reader', currentSlug.value, resolvedId)
}

async function onSidebarSelect(id) {
  await pushReader(id)
}

async function onNavigate(id) {
  await pushReader(id)
}

async function onReaderClose() {
  const previous = historyStack.value.pop()
  if (previous) {
    await goToRoute(previous.view, previous.slug, previous.nodeId)
    return
  }
  await goBookHome(currentSlug.value)
}

async function onSearchSelect(item) {
  clearSearch()

  if (item.kind === 'topic') {
    await goTopicHome(item.slug)
    return
  }

  if (item.kind === 'tool') {
    await onOpenTool(item.slug)
    return
  }

  if (item.kind === 'book') {
    await goBookHome(item.slug)
    return
  }

  historyStack.value = []
  await goToRoute('reader', item.slug, item.nodeId)
}

async function onSearchEnter() {
  if (searchResults.value.length === 0) return
  const index = searchHighlight.value >= 0 ? searchHighlight.value : 0
  await onSearchSelect(searchResults.value[index])
}

function onSearchArrow(direction) {
  const length = searchResults.value.length
  if (length === 0) return
  searchHighlight.value = (searchHighlight.value + direction + length) % length
}

function clearSearch() {
  searchQuery.value = ''
  searchFocused.value = false
  searchHighlight.value = -1
}
</script>

<style>
*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html, body, #app {
  height: 100%;
  min-height: 100dvh;
}

:root {
  --bg-page: #edf1f1;
  --bg-surface: #f7f5f0;
  --bg-elevated: #ffffff;
  --bg-sidebar: #f0ede6;
  --bg-topbar: rgba(247, 245, 240, 0.96);
  --bg-deep: #173041;

  --text-primary: #15222b;
  --text-secondary: #4a5b68;
  --text-tertiary: #75838c;
  --text-muted: #9aa6ad;
  --text-on-dark: #f7f5f0;

  --brand: #204f67;
  --brand-soft: #dce7eb;
  --accent: #bf6f3f;

  --border-subtle: #ece7dc;
  --border-default: #ddd6ca;
  --border-strong: #c7beb2;

  --hover-bg: rgba(32, 79, 103, 0.08);
  --active-bg: rgba(32, 79, 103, 0.12);
  --shadow-sm: 0 4px 16px rgba(17, 27, 34, 0.06);
  --shadow-md: 0 12px 36px rgba(17, 27, 34, 0.1);

  --font-serif: "Iowan Old Style", "Palatino Linotype", "Book Antiqua", "Songti SC", serif;
  --font-sans: "Aptos", "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif;
}

body {
  font-family: var(--font-sans);
  background: radial-gradient(circle at top left, #f7f5f0 0%, #edf1f1 55%, #e6ecec 100%);
  color: var(--text-primary);
}
</style>

<style scoped>
.app-shell {
  display: flex;
  flex-direction: column;
  height: 100dvh;
}

.topbar {
  height: 56px;
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 0 18px;
  background: var(--bg-topbar);
  border-bottom: 1px solid var(--border-default);
  backdrop-filter: blur(10px);
  z-index: 20;
}

.icon-btn {
  width: 34px;
  height: 34px;
  border: 1px solid var(--border-default);
  border-radius: 10px;
  background: var(--bg-elevated);
  color: var(--text-secondary);
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: background 0.18s ease, color 0.18s ease, border-color 0.18s ease;
}

.icon-btn:hover {
  color: var(--brand);
  border-color: rgba(32, 79, 103, 0.24);
  background: var(--brand-soft);
}

.icon-btn.ghost {
  visibility: hidden;
  cursor: default;
}

.brand {
  display: flex;
  flex-direction: column;
  cursor: pointer;
  min-width: 0;
}

.brand-kicker {
  font-size: 10px;
  color: var(--text-muted);
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

.brand-name {
  font-family: var(--font-serif);
  font-size: 18px;
  line-height: 1.1;
  color: var(--text-primary);
}

.nav-tabs {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-left: 6px;
}

.nav-btn {
  border: none;
  background: transparent;
  color: var(--text-tertiary);
  padding: 8px 12px;
  border-radius: 999px;
  font-size: 13px;
  cursor: pointer;
  transition: color 0.18s ease, background 0.18s ease;
}

.nav-btn:hover {
  color: var(--text-primary);
  background: rgba(0, 0, 0, 0.03);
}

.nav-btn.active {
  color: var(--brand);
  background: var(--brand-soft);
}

.topbar-right {
  margin-left: auto;
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 12px;
}

.search-scope {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  padding: 3px;
  border-radius: 999px;
  border: 1px solid var(--border-default);
  background: rgba(255, 255, 255, 0.72);
}

.scope-btn {
  border: none;
  background: transparent;
  color: var(--text-muted);
  padding: 6px 10px;
  border-radius: 999px;
  font-size: 11px;
  cursor: pointer;
  transition: background 0.18s ease, color 0.18s ease;
}

.scope-btn.active {
  background: var(--brand-soft);
  color: var(--brand);
}

.search-wrap {
  position: relative;
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-muted);
  pointer-events: none;
}

.search-input {
  width: 280px;
  padding: 10px 14px 10px 34px;
  border: 1px solid var(--border-default);
  border-radius: 999px;
  background: var(--bg-elevated);
  color: var(--text-primary);
  font-size: 12px;
  outline: none;
  transition: border-color 0.18s ease, box-shadow 0.18s ease;
}

.search-input:focus {
  border-color: rgba(32, 79, 103, 0.35);
  box-shadow: 0 0 0 3px rgba(32, 79, 103, 0.08);
}

.search-dropdown {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  width: 360px;
  max-width: min(360px, calc(100vw - 28px));
  background: var(--bg-elevated);
  border: 1px solid var(--border-default);
  border-radius: 16px;
  box-shadow: var(--shadow-md);
  overflow: hidden;
  z-index: 50;
}

.search-result {
  width: 100%;
  border: none;
  background: transparent;
  display: flex;
  gap: 10px;
  align-items: flex-start;
  text-align: left;
  padding: 12px 14px;
  cursor: pointer;
  transition: background 0.14s ease;
}

.search-result:hover,
.search-result.highlighted {
  background: rgba(32, 79, 103, 0.06);
}

.result-type {
  min-width: 34px;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.result-main {
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-width: 0;
}

.result-name {
  color: var(--text-primary);
  font-size: 13px;
  line-height: 1.35;
}

.result-tagline {
  color: var(--text-tertiary);
  font-size: 11px;
  line-height: 1.5;
}

.result-context {
  color: var(--text-muted);
  font-size: 10px;
  line-height: 1.45;
}

.search-empty {
  padding: 14px;
  color: var(--text-tertiary);
  font-size: 12px;
}

.node-count {
  font-size: 11px;
  color: var(--text-muted);
  white-space: nowrap;
}

.main {
  flex: 1;
  min-height: 0;
  display: flex;
  overflow: hidden;
}

.content {
  flex: 1;
  min-width: 0;
  min-height: 0;
  overflow: hidden;
}

.sidebar-overlay {
  display: none;
}

.app-state {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  text-align: center;
  color: var(--text-secondary);
  padding: 24px;
}

.state-icon {
  font-size: 40px;
}

.state-title {
  font-size: 18px;
  color: var(--text-primary);
}

.state-desc {
  max-width: 460px;
  line-height: 1.8;
}

.loading-spinner {
  width: 24px;
  height: 24px;
  border: 2px solid var(--border-default);
  border-top-color: var(--accent);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.back-btn-lg {
  border: 1px solid var(--border-default);
  border-radius: 999px;
  background: var(--bg-elevated);
  color: var(--text-secondary);
  padding: 8px 16px;
  cursor: pointer;
}

.back-btn-lg:hover {
  color: var(--brand);
  border-color: rgba(32, 79, 103, 0.24);
}

.footer-banner {
  height: 38px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border-top: 1px solid var(--border-default);
  background: rgba(247, 245, 240, 0.92);
  color: var(--text-tertiary);
  font-size: 12px;
}

.footer-label {
  color: var(--text-muted);
}

.footer-brand {
  color: var(--accent);
  font-weight: 700;
}

.footer-dot {
  color: var(--border-strong);
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 980px) {
  .search-input {
    width: 220px;
  }
}

@media (max-width: 720px) {
  .topbar {
    padding: 0 12px;
    gap: 10px;
  }

  .brand-kicker,
  .node-count,
  .footer-dot,
  .footer-note,
  .search-scope {
    display: none;
  }

  .brand-name {
    font-size: 16px;
  }

  .search-input {
    width: 154px;
  }

  .search-dropdown {
    right: -8px;
    width: min(320px, calc(100vw - 16px));
  }

  .sidebar-overlay {
    display: block;
    position: fixed;
    inset: 56px 0 38px;
    background: rgba(12, 21, 28, 0.3);
    z-index: 9;
  }

  .footer-banner {
    gap: 6px;
    font-size: 11px;
  }
}
</style>
