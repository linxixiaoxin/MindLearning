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
        <button class="nav-btn" :class="{ active: view === 'eventLens' }" @click="goEventLens()">
          社会事件
        </button>
        <button class="nav-btn" :class="{ active: view === 'contentOps' }" @click="goContentOps">
          选题中台
        </button>
        <button class="nav-btn" :class="{ active: view === 'capabilityPaths' }" @click="goCapabilityPaths()">
          能力路径
        </button>
        <button class="nav-btn" :class="{ active: view === 'thoughtPartner' }" @click="goThoughtPartner">
          思想伙伴
        </button>
        <button class="nav-btn" :class="{ active: view === 'problemLab' }" @click="goProblemLab()">
          问题工作台
        </button>
        <button class="nav-btn" :class="{ active: view === 'learningPaths' }" @click="goLearningPaths()">
          学习路径
        </button>
        <button class="nav-btn" :class="{ active: view === 'spaceBrowser' }" @click="goSpaceBrowser()">
          3D书库
        </button>
        <button class="nav-btn" :class="{ active: view === 'grayBooks' }" @click="goGrayBooks">
          灰度池
        </button>
        <button class="nav-btn" :class="{ active: view === 'mindsetTrapDiagnostic' }" @click="goMindsetTrapDiagnostic">
          误区诊断
        </button>
        <button class="nav-btn" :class="{ active: view === 'leadershipMindsetAssessment' }" @click="goLeadershipMindsetAssessment">
          心智评估
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
            正在建立多书搜索索引...
          </div>

          <div v-else-if="searchFocused && searchQuery" class="search-dropdown search-empty">
            {{ searchEmptyText }}
          </div>
        </div>

        <span v-if="hasBookContext" class="node-count">{{ currentBookData?.NODES?.length || 0 }} Nodes</span>
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
          <div class="state-title">This interface is temporarily unavailable.</div>
        </div>

        <div v-else-if="routeError" class="app-state">
          <div class="state-icon">!</div>
          <div class="state-title">Loading interface...</div>
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
          @open-thinker="onOpenThinker"
          @open-diagnostic="goMindsetTrapDiagnostic"
          @open-learning-paths="goLearningPaths"
        />

        <EventLens
          v-else-if="view === 'eventLens'"
          :preset-id="currentEventLensId"
          @open-book="onOpenBook"
          @open-problem-case="onOpenProblemCaseFromEvent"
        />

        <ContentOpsCenter
          v-else-if="view === 'contentOps'"
          @open-book="onOpenBook"
          @open-problem-lab="goProblemLab"
          @open-event-lens="goEventLens"
          @open-learning-path="goLearningPaths"
          @open-capability-paths="goCapabilityPaths"
        />

        <CapabilityPathWorkbench
          v-else-if="view === 'capabilityPaths'"
          :role-id="currentCapabilityRoleId"
          @open-book="onOpenBook"
          @open-problem-lab="goProblemLab"
          @open-learning-path="onSelectLearningPath"
        />

        <ProblemLab
          v-else-if="view === 'problemLab'"
          :case-id="currentProblemCaseId"
          @select-case="onSelectProblemCase"
          @open-book="onOpenBook"
          @open-thinker="onOpenThinker"
          @open-learning-paths="goLearningPaths"
          @open-thought-partner="goThoughtPartner"
        />

        <LearningPathMap
          v-else-if="view === 'learningPaths'"
          :path-id="currentLearningPathId"
          @open-book="onOpenBook"
          @open-node="onOpenNode"
          @select-path="onSelectLearningPath"
        />

        <SpaceBrowser
          v-else-if="view === 'spaceBrowser'"
        />

        <GrayBookPool
          v-else-if="view === 'grayBooks'"
        />

        <MindsetTrapDiagnostic
          v-else-if="view === 'mindsetTrapDiagnostic'"
          @open-node="onOpenNode"
        />

        <LeadershipMindsetAssessment
          v-else-if="view === 'leadershipMindsetAssessment'"
          @open-node="onOpenNode"
          @open-topic="onOpenTopic"
        />

        <ThinkerProfilePage
          v-else-if="view === 'thinkerProfile'"
          :thinker-id="currentThinkerId"
          @back="goThoughtPartner"
          @open-node="onOpenNode"
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
import ContentOpsCenter from './components/ContentOpsCenter.vue'
import GrayBookPool from './components/GrayBookPool.vue'
import HomeView from './components/HomeView.vue'
import KnowledgeGraph from './components/KnowledgeGraph.vue'
import LearningPathMap from './components/LearningPathMap.vue'
import LeadershipMindsetAssessment from './components/LeadershipMindsetAssessment.vue'
import MindsetTrapDiagnostic from './components/MindsetTrapDiagnostic.vue'
import ProblemLab from './components/ProblemLab.vue'
import EventLens from './components/EventLens.vue'
import CapabilityPathWorkbench from './components/CapabilityPathWorkbench.vue'
import Sidebar from './components/Sidebar.vue'
import SpaceBrowser from './components/SpaceBrowser.vue'
import ThinkerProfilePage from './components/ThinkerProfilePage.vue'
import ThoughtPartnerTool from './components/ThoughtPartnerTool.vue'
import TopicPage from './components/TopicPage.vue'
import { loadBookBundle, loadRegistry, loadTopicBundle } from './lib/bookData.js'
import { parseRoute, resolveNodeId, routeToUrl } from './lib/routes.js'
import {
  buildBookSearchEntry,
  buildCurrentBookSearchEntries,
  buildNodeSearchEntry,
  buildToolSearchEntry,
  buildTopicSearchEntry,
  groupAliasesByNode,
  scoreSearchEntry,
} from './lib/searchIndex.js'

const registry = ref({
  site: {
    title: 'Knowledge Library',
    shortTitle: 'Book Hub',
    creatorLabel: 'Knowledge Library',
    creatorName: 'Product Ops Core',
    footerNote: 'Thought, Learning, and Growth Playground',
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
const currentThinkerId = ref('')
const currentLearningPathId = ref('')
const currentProblemCaseId = ref('')
const currentEventLensId = ref('')
const currentCapabilityRoleId = ref('')
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

const toolViewLabels = {
  eventLens: 'Event Lens',
  contentOps: 'Content Ops',
  capabilityPaths: 'Capability Paths',
  thoughtPartner: 'Thought Partner',
  problemLab: 'Problem Lab',
  learningPaths: 'Learning Paths',
  spaceBrowser: 'Space Browser',
  grayBooks: '50 Gray Books',
  mindsetTrapDiagnostic: 'Mindset Trap Diagnostic',
  leadershipMindsetAssessment: 'Leadership Mindset Assessment',
  thinkerProfile: 'Thinker Profile',
}

const footerSite = computed(() => currentBookData.value?.SITE || registry.value.site)
const hasBookContext = computed(() => Boolean(currentBookData.value))
const hasTopicContext = computed(() => Boolean(currentTopicData.value))
const hasToolContext = computed(() => Boolean(toolViewLabels[view.value]))
const sidebarVisible = computed(() => hasBookContext.value)
const resolvedSearchScope = computed(() => {
  if (!hasBookContext.value) return 'global'
  return searchScope.value === 'global' ? 'global' : 'context'
})
const searchPlaceholder = computed(() => {
  if (resolvedSearchScope.value === 'global') {
    return registry.value.site?.searchPlaceholder || 'Search across books, tools, and topics'
  }
  return currentBookData.value?.SITE?.searchPlaceholder || 'Search inside the current context'
})
const searchLoading = computed(() => resolvedSearchScope.value === 'global' && globalSearchLoading.value)
const searchEmptyText = computed(() => {
  if (!searchQuery.value) return ''
  if (resolvedSearchScope.value === 'global') {
    return `No result for "${searchQuery.value}" in global library`
  }
  return `No result for "${searchQuery.value}" in current context`
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
  if (hasToolContext.value) return toolViewLabels[view.value]
  return registry.value.site?.shortTitle || registry.value.site?.title || 'Knowledge Library'
})

const aliasesByNode = computed(() => groupAliasesByNode(currentBookData.value?.ALIAS_MAP || {}))

const searchResults = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()
  if (!query) return []

  const entries = resolvedSearchScope.value === 'global'
    ? globalSearchIndex.value
    : buildCurrentBookSearchEntries({
      bookData: currentBookData.value,
      slug: currentSlug.value,
      aliasGroups: aliasesByNode.value,
    })

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
            context: `${book.title || bundle.SITE?.title || book.slug}`,
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

async function applyRoute(route, { replaceHistory = false } = {}) {
  const token = ++routeToken
  routeLoading.value = true
  routeError.value = ''

  try {
    if (
      route.view === 'thoughtPartner'
      || route.view === 'eventLens'
      || route.view === 'contentOps'
      || route.view === 'capabilityPaths'
      || route.view === 'problemLab'
      || route.view === 'learningPaths'
      || route.view === 'grayBooks'
      || route.view === 'mindsetTrapDiagnostic'
      || route.view === 'leadershipMindsetAssessment'
    ) {
      currentSlug.value = ''
      currentBookData.value = null
      currentTopicSlug.value = ''
      currentTopicData.value = null
      currentThinkerId.value = ''
      currentLearningPathId.value = route.view === 'learningPaths' ? route.slug : ''
      currentProblemCaseId.value = route.view === 'problemLab' ? route.slug : ''
      currentEventLensId.value = route.view === 'eventLens' ? route.slug : ''
      currentCapabilityRoleId.value = route.view === 'capabilityPaths' ? route.slug : ''
      view.value = route.view
      activeNode.value = null
      searchScope.value = 'global'
      if (replaceHistory) {
        window.history.replaceState({ view: route.view, slug: route.slug }, '', routeToUrl(route.view, route.slug))
      }
      return
    }

    if (route.view === 'thinkerProfile') {
      currentSlug.value = ''
      currentBookData.value = null
      currentTopicSlug.value = ''
      currentTopicData.value = null
      currentThinkerId.value = route.slug
      currentLearningPathId.value = ''
      currentProblemCaseId.value = ''
      currentEventLensId.value = ''
      currentCapabilityRoleId.value = ''
      view.value = 'thinkerProfile'
      activeNode.value = null
      searchScope.value = 'global'
      if (replaceHistory) {
        const nextUrl = routeToUrl(route.view, route.slug, null)
        window.history.replaceState({ view: route.view, slug: route.slug, nodeId: null }, '', nextUrl)
      }
      return
    }

    if (route.view === 'library' || !route.slug) {
      currentSlug.value = ''
      currentBookData.value = null
      currentTopicSlug.value = ''
      currentTopicData.value = null
      currentThinkerId.value = ''
      currentLearningPathId.value = ''
      currentProblemCaseId.value = ''
      currentEventLensId.value = ''
      currentCapabilityRoleId.value = ''
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
      currentThinkerId.value = ''
      currentLearningPathId.value = ''
      currentProblemCaseId.value = ''
      currentEventLensId.value = ''
      currentCapabilityRoleId.value = ''
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
    currentThinkerId.value = ''
    currentLearningPathId.value = ''
    currentProblemCaseId.value = ''
    currentEventLensId.value = ''
    currentCapabilityRoleId.value = ''
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
    currentLearningPathId.value = ''
    currentProblemCaseId.value = ''
    currentEventLensId.value = ''
    currentCapabilityRoleId.value = ''
    view.value = 'library'
    activeNode.value = null
    routeError.value = `Unable to load ${route.slug}, it may be temporary or no route data was found.`
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

async function goEventLens(presetId = '') {
  historyStack.value = []
  clearSearch()
  await goToRoute('eventLens', presetId)
}

async function goContentOps() {
  historyStack.value = []
  clearSearch()
  await goToRoute('contentOps', '')
}

async function goCapabilityPaths(roleId = '') {
  historyStack.value = []
  clearSearch()
  await goToRoute('capabilityPaths', roleId)
}

async function goProblemLab(caseId = '') {
  historyStack.value = []
  clearSearch()
  await goToRoute('problemLab', caseId)
}

async function goLearningPaths(pathId = '') {
  historyStack.value = []
  clearSearch()
  await goToRoute('learningPaths', pathId)
}

async function goSpaceBrowser() {
  historyStack.value = []
  clearSearch()
  await goToRoute('spaceBrowser', '')
}

async function goGrayBooks() {
  historyStack.value = []
  clearSearch()
  await goToRoute('grayBooks', '')
}

async function goMindsetTrapDiagnostic() {
  historyStack.value = []
  clearSearch()
  await goToRoute('mindsetTrapDiagnostic', '')
}

async function goLeadershipMindsetAssessment() {
  historyStack.value = []
  clearSearch()
  await goToRoute('leadershipMindsetAssessment', '')
}

async function onOpenThinker(thinkerId) {
  if (!thinkerId) return
  historyStack.value = []
  clearSearch()
  await goToRoute('thinkerProfile', thinkerId)
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
  if (slug === 'thought-partner') {
    await goThoughtPartner()
    return
  }
  if (slug === 'event-lens') {
    await goEventLens()
    return
  }
  if (slug === 'content-ops') {
    await goContentOps()
    return
  }
  if (slug === 'problem-lab') {
    await goProblemLab()
    return
  }
  if (slug === 'capability-paths') {
    await goCapabilityPaths()
    return
  }
  if (slug === 'learning-paths') {
    await goLearningPaths()
    return
  }
  if (slug === 'space-browser') {
    await goSpaceBrowser()
    return
  }
  if (slug === 'gray-books') {
    await goGrayBooks()
    return
  }
  if (slug === 'mindset-trap-diagnostic') {
    await goMindsetTrapDiagnostic()
    return
  }
  if (slug === 'leadership-mindset-assessment') {
    await goLeadershipMindsetAssessment()
  }
}

async function onOpenProblemCaseFromEvent(caseId) {
  if (!caseId) return
  await goProblemLab(caseId)
}

async function onSelectLearningPath(pathId) {
  if (!pathId) return
  await goToRoute('learningPaths', pathId)
}

async function onSelectProblemCase(caseId) {
  if (!caseId) return
  await goToRoute('problemLab', caseId)
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
  --radius-card: 8px;
  --radius-panel: 12px;
  --radius-control: 8px;
  --radius-pill: 999px;

  --font-serif: "Iowan Old Style", "Palatino Linotype", "Book Antiqua", "Songti SC", serif;
  --font-sans: "Aptos", "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif;
}

html,
body,
#app {
  width: 100%;
  max-width: none;
}

body {
  margin: 0;
  font-family: var(--font-sans);
  background: radial-gradient(circle at top left, #f7f5f0 0%, #edf1f1 55%, #e6ecec 100%);
  color: var(--text-primary);
  text-align: start;
}
</style>

<style scoped>
.app-shell {
  display: flex;
  flex-direction: column;
  height: 100dvh;
  text-align: start;
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
  border-radius: var(--radius-control);
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
  min-width: 0;
}

.nav-btn {
  border: none;
  background: transparent;
  color: var(--text-tertiary);
  padding: 8px 12px;
  border-radius: var(--radius-pill);
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
  border-radius: var(--radius-pill);
  border: 1px solid var(--border-default);
  background: rgba(255, 255, 255, 0.72);
}

.scope-btn {
  border: none;
  background: transparent;
  color: var(--text-muted);
  padding: 6px 10px;
  border-radius: var(--radius-pill);
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
  border-radius: var(--radius-pill);
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
  border-radius: var(--radius-panel);
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
  border-radius: var(--radius-pill);
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

  .icon-btn.ghost {
    display: none;
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

  .nav-tabs {
    flex: 1;
    overflow-x: auto;
    scrollbar-width: none;
  }

  .nav-tabs::-webkit-scrollbar {
    display: none;
  }

  .nav-btn {
    flex: 0 0 auto;
    padding: 8px 10px;
  }

  .topbar-right {
    display: none;
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



