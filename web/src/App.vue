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
        <button class="nav-btn" :class="{ active: view === 'sceneHub' }" @click="goSceneHub">处境地图</button>
        <button class="nav-btn" :class="{ active: view === 'library' }" @click="goLibrary">书库</button>
        <button class="nav-btn" :class="{ active: view === 'contentOps' }" @click="goContentOps">工作台</button>
        <button class="nav-btn" :class="{ active: view === 'thoughtPartner' }" @click="goThoughtPartner">思想伙伴</button>

        <div class="more-menu" ref="moreMenuRef">
          <button
            class="nav-btn"
            :class="{ active: moreMenuOpen || isMoreToolActive }"
            @click="moreMenuOpen = !moreMenuOpen"
          >
            更多
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" :class="{ rotated: moreMenuOpen }">
              <path d="M2 3.5L5 6.5L8 3.5" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
            </svg>
          </button>

          <div v-if="moreMenuOpen" class="more-menu-panel">
            <div class="more-group-label">工具路径</div>
            <button class="more-menu-item" :class="{ active: view === 'problemLab' }" @click="goProblemLab()">卡点工作台</button>
            <button class="more-menu-item" :class="{ active: view === 'capabilityPaths' }" @click="goCapabilityPaths()">能力路径</button>
            <button class="more-menu-item" :class="{ active: view === 'learningPaths' }" @click="goLearningPaths()">学习路线</button>
            <button class="more-menu-item" :class="{ active: view === 'roundtable' }" @click="goRoundtable">圆桌</button>
            <button class="more-menu-item" :class="{ active: view === 'eventLens' }" @click="goEventLens()">社会事件</button>
            <button class="more-menu-item" :class="{ active: view === 'archetypeLab' }" @click="goArchetypeLab">原型实验室</button>
            <button class="more-menu-item" :class="{ active: view === 'spaceBrowser' }" @click="goSpaceBrowser()">书籍地图</button>

            <div class="more-divider"></div>
            <div class="more-group-label">知识浏览</div>
            <button class="more-menu-item" :class="{ active: view === 'archetypeBrowser' }" @click="goArchetypeBrowser">原型</button>
            <button class="more-menu-item" :class="{ active: view === 'thinkerBrowser' }" @click="goThinkerBrowser">思想家</button>
            <button class="more-menu-item" :class="{ active: view === 'sceneBrowser' }" @click="goSceneBrowser">场景</button>
            <button class="more-menu-item" :class="{ active: view === 'methodBrowser' }" @click="goMethodBrowser">方法</button>
            <button class="more-menu-item" :class="{ active: view === 'metaphorBrowser' }" @click="goMetaphorBrowser">隐喻</button>
            <button class="more-menu-item" :class="{ active: view === 'conceptBrowser' }" @click="goConceptBrowser">概念</button>
            <button class="more-menu-item" :class="{ active: view === 'archetypeContrast' }" @click="goArchetypeContrast">对照</button>
            <button class="more-menu-item" :class="{ active: view === 'archetypeDialogue' }" @click="goArchetypeDialogue">对话</button>
          </div>
        </div>

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

        <button v-if="!isAuthenticated" class="login-entry-btn" @click="showLoginModal = true">
          登录
        </button>

        <div v-else class="user-menu" ref="userMenuRef">
          <button class="user-avatar-btn" @click="userMenuOpen = !userMenuOpen" :title="userEmail">
            {{ userAvatarLabel }}
          </button>
          <div v-if="userMenuOpen" class="user-dropdown">
            <div class="user-dropdown-header">
              <span class="user-email">{{ userEmail }}</span>
              <span class="user-role">{{ userRoleLabel }}</span>
            </div>
            <button v-if="isAdmin" class="user-dropdown-item" @click="goAdminPanel">
              用户管理
            </button>
            <button class="user-dropdown-item danger" @click="handleLogout">
              退出登录
            </button>
          </div>
        </div>
      </div>
    </header>

    <ExperienceFlowStrip
      v-if="experienceFlowVisible"
      :active-step="experienceStepId"
      @navigate="onExperienceNavigate"
    />

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
          <div class="state-title">正在打开这张地图...</div>
        </div>

        <div v-else-if="routeError" class="app-state">
          <div class="state-icon">!</div>
          <div class="state-title">这个页面暂时打不开</div>
          <div class="state-desc">{{ routeError }}</div>
          <button class="back-btn-lg" @click="goSceneHub">返回导航页</button>
        </div>

        <BookLibrary
          v-else-if="view === 'library'"
          :registry="registry"
          @navigate="onOpenBook"
          @show-graph="onOpenBookGraph"
          @open-topic="onOpenTopic"
          @open-tool="onOpenTool"
        />

        <SceneEntryHub
          v-else-if="view === 'sceneHub'"
          @open-library="goLibrary"
          @open-problem-lab="goProblemLab"
          @open-capability-paths="goCapabilityPaths"
          @open-event-lens="goEventLens"
          @open-thought-partner="goThoughtPartner"
          @open-content-ops="goContentOps"
          @open-learning-paths="goLearningPaths"
          @open-book="onOpenBook"
          @open-roundtable="goRoundtable"
          @open-mindset-trap-diagnostic="goMindsetTrapDiagnostic"
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

        <RoundtableStudio
          v-else-if="view === 'roundtable'"
          @open-problem-lab="goProblemLab"
          @open-content-ops="goContentOps"
        />

        <ArchetypeLab
          v-else-if="view === 'archetypeLab'"
        />

        <ArchetypeDialogue
          v-else-if="view === 'archetypeDialogue'"
        />

        <ArchetypeBrowser
          v-else-if="view === 'archetypeBrowser'"
        />

        <ArchetypeContrast
          v-else-if="view === 'archetypeContrast'"
        />

        <SceneBrowser
          v-else-if="view === 'sceneBrowser'"
          @select-scene="onSelectScene"
        />

        <SceneDetail
          v-else-if="view === 'sceneDetail'"
          :scene-id="currentSceneId"
          @back="goSceneBrowser"
        />

        <MethodBrowser
          v-else-if="view === 'methodBrowser'"
        />

        <MetaphorBrowser
          v-else-if="view === 'metaphorBrowser'"
        />

        <ConceptBrowser
          v-else-if="view === 'conceptBrowser'"
        />

        <ThinkerBrowser
          v-else-if="view === 'thinkerBrowser'"
          @select-thinker="onSelectThinker"
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

        <SpaceAtlas3D
          v-else-if="view === 'spaceBrowser'"
          :registry="registry"
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

        <AdminPanel
          v-else-if="view === 'admin' && isAdmin"
        />

        <div v-else-if="view === 'admin' && !isAdmin" class="app-state">
          <div class="state-icon">!</div>
          <div class="state-title">无权限访问</div>
          <div class="state-desc">你需要管理员权限才能访问这个页面</div>
          <button class="back-btn-lg" @click="goSceneHub">返回导航页</button>
        </div>

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

    <CodexAssistantDock :page-context="codexPageContext" />

    <footer class="footer-banner">
      <span class="footer-label">{{ footerSite.creatorLabel }}</span>
      <span class="footer-brand">{{ footerSite.creatorName }}</span>
      <span class="footer-dot">·</span>
      <span class="footer-note">{{ footerSite.footerNote }}</span>
    </footer>

    <Teleport to="body">
      <div v-if="showLoginModal" class="login-modal-overlay" @click.self="showLoginModal = false">
        <div class="login-modal-card">
          <button class="login-modal-close" @click="showLoginModal = false">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M4 4L12 12M12 4L4 12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
          </button>
          <LoginPage :is-modal="true" @close="showLoginModal = false" />
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import AdminPanel from './components/AdminPanel.vue'
import ArticleReader from './components/ArticleReader.vue'
import ArchetypeLab from './components/ArchetypeLab.vue'
import BookLibrary from './components/BookLibrary.vue'
import CodexAssistantDock from './components/CodexAssistantDock.vue'
import ContentOpsCenter from './components/ContentOpsCenter.vue'
import GrayBookPool from './components/GrayBookPool.vue'
import HomeView from './components/HomeView.vue'
import SceneEntryHub from './components/SceneEntryHub.vue'
import KnowledgeGraph from './components/KnowledgeGraph.vue'
import LearningPathMap from './components/LearningPathMap.vue'
import LoginPage from './components/LoginPage.vue'
import LeadershipMindsetAssessment from './components/LeadershipMindsetAssessment.vue'
import MindsetTrapDiagnostic from './components/MindsetTrapDiagnostic.vue'
import ProblemLab from './components/ProblemLab.vue'
import EventLens from './components/EventLens.vue'
import ExperienceFlowStrip from './components/ExperienceFlowStrip.vue'
import CapabilityPathWorkbench from './components/CapabilityPathWorkbench.vue'
import RoundtableStudio from './components/RoundtableStudio.vue'
import ArchetypeBrowser from './components/ArchetypeBrowser.vue'
import ArchetypeDialogue from './components/ArchetypeDialogue.vue'
import ArchetypeContrast from './components/ArchetypeContrast.vue'
import SceneBrowser from './components/SceneBrowser.vue'
import SceneDetail from './components/SceneDetail.vue'
import MethodBrowser from './components/MethodBrowser.vue'
import MetaphorBrowser from './components/MetaphorBrowser.vue'
import ConceptBrowser from './components/ConceptBrowser.vue'
import ThinkerBrowser from './components/ThinkerBrowser.vue'
import Sidebar from './components/Sidebar.vue'
import SpaceAtlas3D from './components/SpaceAtlas3D.vue'
import ThinkerProfilePage from './components/ThinkerProfilePage.vue'
import ThoughtPartnerTool from './components/ThoughtPartnerTool.vue'
import TopicPage from './components/TopicPage.vue'
import { loadBookBundle, loadRegistry, loadTopicBundle } from './lib/bookData.js'
import { parseRoute, resolveNodeId, routeToUrl } from './lib/routes.js'
import { useAuth } from './lib/auth.js'
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
const view = ref('sceneHub')
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
const currentSceneId = ref('')
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
const moreMenuOpen = ref(false)
const moreMenuRef = ref(null)

let routeToken = 0
let globalSearchPromise = null

const {
  user,
  loading: authLoading,
  isAuthenticated,
  isAdmin,
  initAuth,
  signOut,
} = useAuth()

const userMenuOpen = ref(false)
const userMenuRef = ref(null)
const showLoginModal = ref(false)

const userEmail = computed(() => user.value?.email || '')
const userRoleLabel = computed(() => isAdmin.value ? '管理员' : '用户')
const userAvatarLabel = computed(() => {
  const email = user.value?.email || ''
  return email.charAt(0).toUpperCase()
})

const moreToolViews = [
  'problemLab', 'capabilityPaths', 'learningPaths', 'roundtable', 'eventLens',
  'archetypeLab', 'spaceBrowser', 'archetypeBrowser', 'thinkerBrowser', 'sceneBrowser',
  'methodBrowser', 'metaphorBrowser', 'conceptBrowser', 'archetypeContrast', 'archetypeDialogue',
]
const isMoreToolActive = computed(() => moreToolViews.includes(view.value))

const toolViewLabels = {
  eventLens: '社会事件入口',
  contentOps: '个人工作台',
  capabilityPaths: '能力路径',
  thoughtPartner: '思想伙伴',
  roundtable: '圆桌工作流',
  archetypeLab: '人格原型实验室',
  problemLab: '卡点工作台',
  learningPaths: '练习路线',
  spaceBrowser: '书籍地图',
  grayBooks: '书库账本',
  mindsetTrapDiagnostic: '误区诊断',
  leadershipMindsetAssessment: '心智评估',
  thinkerProfile: '思想伙伴主页',
  thinkerBrowser: '思想家系统',
  sceneBrowser: '场景系统',
  sceneDetail: '场景详情',
  methodBrowser: '方法系统',
  archetypeBrowser: '原型系统',
  archetypeDialogue: '原型对话',
  metaphorBrowser: '隐喻系统',
  conceptBrowser: '概念系统',
  archetypeContrast: '原型对照',
}

const footerSite = computed(() => currentBookData.value?.SITE || registry.value.site)
const hasBookContext = computed(() => Boolean(currentBookData.value))
const hasTopicContext = computed(() => Boolean(currentTopicData.value))
const hasToolContext = computed(() => Boolean(toolViewLabels[view.value]))
const sidebarVisible = computed(() => hasBookContext.value)
const experienceStepId = computed(() => ({
  sceneHub: 'situation',
  problemLab: 'stuck',
  thoughtPartner: 'partner',
  roundtable: 'partner',
  archetypeLab: 'partner',
  thinkerBrowser: 'partner',
  sceneBrowser: 'partner',
  methodBrowser: 'partner',
  archetypeBrowser: 'partner',
  metaphorBrowser: 'partner',
  conceptBrowser: 'partner',
  learningPaths: 'route',
  spaceBrowser: 'atlas',
}[view.value] || ''))
const experienceFlowVisible = computed(() => Boolean(experienceStepId.value) && !routeLoading.value && !routeError.value)
const resolvedSearchScope = computed(() => {
  if (!hasBookContext.value) return 'global'
  return searchScope.value === 'global' ? 'global' : 'context'
})
const searchPlaceholder = computed(() => {
  if (resolvedSearchScope.value === 'global') {
    return registry.value.site?.searchPlaceholder || '搜索书、工具和专题'
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
  if (view.value === 'sceneHub') return '人生处境地图'
  if (hasToolContext.value) return '工具路径'
  return registry.value.site?.creatorLabel || 'Knowledge Library'
})
const brandName = computed(() => {
  if (hasBookContext.value) {
    return currentBookData.value?.SITE?.shortTitle || currentBookData.value?.SITE?.title || 'Book'
  }
  if (hasTopicContext.value) {
    return currentTopicData.value?.shortTitle || currentTopicData.value?.title || 'Topic'
  }
  if (view.value === 'sceneHub') return '处境地图'
  if (hasToolContext.value) return toolViewLabels[view.value]
  return registry.value.site?.shortTitle || registry.value.site?.title || 'Knowledge Library'
})

const activeNodeContext = computed(() => {
  if (!activeNode.value) return null
  const nodes = currentBookData.value?.NODES || []
  const node = nodes.find((item) => item.id === activeNode.value || item.nodeId === activeNode.value)
  return {
    id: activeNode.value,
    title: node?.title || node?.label || node?.name || activeNode.value,
    type: node?.type || node?.kind || '',
  }
})

const codexPageContext = computed(() => ({
  view: view.value,
  viewLabel: brandName.value,
  brandKicker: brandKicker.value,
  path: window.location.pathname + window.location.search,
  tool: hasToolContext.value
    ? {
        id: view.value,
        label: toolViewLabels[view.value],
      }
    : null,
  book: currentBookData.value
    ? {
        slug: currentSlug.value,
        title: currentBookData.value?.SITE?.title || currentBookData.value?.SITE?.shortTitle || currentSlug.value,
        nodeCount: currentBookData.value?.NODES?.length || 0,
      }
    : null,
  topic: currentTopicData.value
    ? {
        slug: currentTopicSlug.value,
        title: currentTopicData.value?.title || currentTopicData.value?.shortTitle || currentTopicSlug.value,
      }
    : null,
  activeNode: activeNodeContext.value,
  routeState: {
    currentSlug: currentSlug.value,
    currentProblemCaseId: currentProblemCaseId.value,
    currentLearningPathId: currentLearningPathId.value,
    currentEventLensId: currentEventLensId.value,
    currentCapabilityRoleId: currentCapabilityRoleId.value,
    currentThinkerId: currentThinkerId.value,
  },
  registry: {
    books: registry.value.books?.length || 0,
    topics: registry.value.topics?.length || 0,
    tools: registry.value.tools?.length || 0,
  },
}))

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
    if (route.view === 'sceneHub') {
      currentSlug.value = ''
      currentBookData.value = null
      currentTopicSlug.value = ''
      currentTopicData.value = null
      currentThinkerId.value = ''
      currentLearningPathId.value = ''
      currentProblemCaseId.value = ''
      currentEventLensId.value = ''
      currentCapabilityRoleId.value = ''
      view.value = 'sceneHub'
      activeNode.value = null
      searchScope.value = 'global'
      if (replaceHistory) {
        window.history.replaceState({ view: 'sceneHub' }, '', routeToUrl('sceneHub', ''))
      }
      return
    }

    if (
      route.view === 'thoughtPartner'
      || route.view === 'roundtable'
      || route.view === 'archetypeLab'
      || route.view === 'eventLens'
      || route.view === 'contentOps'
      || route.view === 'capabilityPaths'
      || route.view === 'problemLab'
      || route.view === 'learningPaths'
      || route.view === 'grayBooks'
      || route.view === 'mindsetTrapDiagnostic'
      || route.view === 'leadershipMindsetAssessment'
      || route.view === 'thinkerBrowser'
      || route.view === 'sceneBrowser'
      || route.view === 'methodBrowser'
      || route.view === 'archetypeBrowser'
      || route.view === 'archetypeContrast'
      || route.view === 'archetypeDialogue'
      || route.view === 'metaphorBrowser'
      || route.view === 'conceptBrowser'
      || route.view === 'spaceBrowser'
      || route.view === 'admin'
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

    if (route.view === 'sceneDetail') {
      currentSlug.value = ''
      currentBookData.value = null
      currentTopicSlug.value = ''
      currentTopicData.value = null
      currentThinkerId.value = ''
      currentLearningPathId.value = ''
      currentProblemCaseId.value = ''
      currentEventLensId.value = ''
      currentCapabilityRoleId.value = ''
      currentSceneId.value = route.slug
      view.value = 'sceneDetail'
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
      saveLastVisit(view.value, currentSlug.value)
    }
  }
}

function saveLastVisit(v, slug) {
  if (typeof localStorage === 'undefined') return
  try {
    localStorage.setItem('redbook:last-visit', JSON.stringify({
      view: v,
      slug: slug || '',
      at: Date.now(),
    }))
  } catch { /* ignore */ }
}

async function goToRoute(targetView, slug = '', nodeId = null, { replaceHistory = false } = {}) {
  moreMenuOpen.value = false
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
  if (moreMenuRef.value && !moreMenuRef.value.contains(event.target)) {
    moreMenuOpen.value = false
  }
  if (userMenuRef.value && !userMenuRef.value.contains(event.target)) {
    userMenuOpen.value = false
  }
}

onMounted(async () => {
  document.addEventListener('mousedown', onClickOutside)
  window.addEventListener('popstate', onPopState)
  await initAuth()
  registry.value = await loadRegistry()
  scheduleGlobalSearchWarmup()
  await applyRouteFromUrl(true)
})

onUnmounted(() => {
  document.removeEventListener('mousedown', onClickOutside)
  window.removeEventListener('popstate', onPopState)
})

async function goSceneHub() {
  moreMenuOpen.value = false
  historyStack.value = []
  clearSearch()
  await goToRoute('sceneHub', '')
}

async function goLibrary() {
  moreMenuOpen.value = false
  historyStack.value = []
  clearSearch()
  await goToRoute('library', '')
}

async function goThoughtPartner() {
  moreMenuOpen.value = false
  historyStack.value = []
  clearSearch()
  await goToRoute('thoughtPartner', '')
}

async function goRoundtable() {
  moreMenuOpen.value = false
  historyStack.value = []
  clearSearch()
  await goToRoute('roundtable', '')
}

async function goArchetypeLab() {
  moreMenuOpen.value = false
  historyStack.value = []
  clearSearch()
  await goToRoute('archetypeLab', '')
}

async function goThinkerBrowser() {
  moreMenuOpen.value = false
  historyStack.value = []
  clearSearch()
  await goToRoute('thinkerBrowser', '')
}

async function goSceneBrowser() {
  moreMenuOpen.value = false
  historyStack.value = []
  clearSearch()
  await goToRoute('sceneBrowser', '')
}

async function goArchetypeDialogue() {
  moreMenuOpen.value = false
  historyStack.value = []
  clearSearch()
  await goToRoute('archetypeDialogue', '')
}

async function goMethodBrowser() {
  moreMenuOpen.value = false
  historyStack.value = []
  clearSearch()
  await goToRoute('methodBrowser', '')
}

async function goArchetypeBrowser() {
  moreMenuOpen.value = false
  historyStack.value = []
  clearSearch()
  await goToRoute('archetypeBrowser', '')
}

async function goArchetypeContrast() {
  moreMenuOpen.value = false
  historyStack.value = []
  clearSearch()
  await goToRoute('archetypeContrast', '')
}

async function goMetaphorBrowser() {
  moreMenuOpen.value = false
  historyStack.value = []
  clearSearch()
  await goToRoute('metaphorBrowser', '')
}

async function goConceptBrowser() {
  moreMenuOpen.value = false
  historyStack.value = []
  clearSearch()
  await goToRoute('conceptBrowser', '')
}

async function goEventLens(presetId = '') {
  moreMenuOpen.value = false
  historyStack.value = []
  clearSearch()
  await goToRoute('eventLens', presetId)
}

async function goContentOps() {
  moreMenuOpen.value = false
  historyStack.value = []
  clearSearch()
  await goToRoute('contentOps', '')
}

async function goCapabilityPaths(roleId = '') {
  moreMenuOpen.value = false
  historyStack.value = []
  clearSearch()
  await goToRoute('capabilityPaths', roleId)
}

async function goProblemLab(caseId = '') {
  moreMenuOpen.value = false
  historyStack.value = []
  clearSearch()
  await goToRoute('problemLab', caseId)
}

async function goLearningPaths(pathId = '') {
  moreMenuOpen.value = false
  historyStack.value = []
  clearSearch()
  await goToRoute('learningPaths', pathId)
}

async function goSpaceBrowser() {
  moreMenuOpen.value = false
  historyStack.value = []
  clearSearch()
  await goToRoute('spaceBrowser', '')
}

async function goAdminPanel() {
  userMenuOpen.value = false
  moreMenuOpen.value = false
  historyStack.value = []
  clearSearch()
  await goToRoute('admin', '')
}

async function handleLogout() {
  userMenuOpen.value = false
  await signOut()
}

async function onExperienceNavigate(stepId) {
  if (stepId === experienceStepId.value) return
  if (stepId === 'situation') {
    await goSceneHub()
    return
  }
  if (stepId === 'stuck') {
    await goProblemLab(currentProblemCaseId.value)
    return
  }
  if (stepId === 'partner') {
    await goThoughtPartner()
    return
  }
  if (stepId === 'route') {
    await goLearningPaths(currentLearningPathId.value)
    return
  }
  if (stepId === 'atlas') {
    await goSpaceBrowser()
  }
}

async function goGrayBooks() {
  moreMenuOpen.value = false
  historyStack.value = []
  clearSearch()
  await goToRoute('grayBooks', '')
}

async function goMindsetTrapDiagnostic() {
  moreMenuOpen.value = false
  historyStack.value = []
  clearSearch()
  await goToRoute('mindsetTrapDiagnostic', '')
}

async function goLeadershipMindsetAssessment() {
  moreMenuOpen.value = false
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

async function onSelectThinker(thinkerId) {
  await onOpenThinker(thinkerId)
}

async function onSelectScene(sceneId) {
  if (!sceneId) return
  historyStack.value = []
  clearSearch()
  await goToRoute('sceneDetail', sceneId)
}

async function goBookHome(slug) {
  if (!slug) return
  moreMenuOpen.value = false
  historyStack.value = []
  clearSearch()
  await goToRoute('home', slug)
}

async function goTopicHome(slug) {
  if (!slug) return
  moreMenuOpen.value = false
  historyStack.value = []
  clearSearch()
  await goToRoute('topic', slug)
}

async function goBrandHome() {
  moreMenuOpen.value = false
  if (currentSlug.value) {
    await goBookHome(currentSlug.value)
    return
  }
  if (currentTopicSlug.value) {
    await goTopicHome(currentTopicSlug.value)
    return
  }
  await goSceneHub()
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
    if (slug === 'roundtable') {
      await goRoundtable()
      return
    }
    if (slug === 'archetype-lab') {
      await goArchetypeLab()
      return
    }
    if (slug === 'life-scenes') {
      await goSceneHub()
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
    return
  }
  if (slug === 'thinkers') {
    await goThinkerBrowser()
    return
  }
  if (slug === 'scenes') {
    await goSceneBrowser()
    return
  }
  if (slug === 'methods') {
    await goMethodBrowser()
    return
  }
  if (slug === 'archetypes') {
    await goArchetypeBrowser()
    return
  }
  if (slug === 'archetype-contrast') {
    await goArchetypeContrast()
    return
  }
  if (slug === 'archetype-dialogue') {
    await goArchetypeDialogue()
    return
  }
  if (slug === 'metaphors') {
    await goMetaphorBrowser()
    return
  }
  if (slug === 'concepts') {
    await goConceptBrowser()
    return
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
  flex: 0 0 auto;
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
  white-space: nowrap;
}

.nav-tabs {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-left: 6px;
  min-width: 0;
  flex: 1 1 auto;
  overflow: visible;
}

.sys-btn {
  color: var(--text-tertiary);
  font-size: 0.8rem;
  padding: 6px 10px;
  border-radius: 6px;
  border: 1px solid var(--border-default);
  background: var(--bg-subtle);
}

.nav-btn {
  flex: 0 0 auto;
  border: none;
  background: transparent;
  color: var(--text-tertiary);
  padding: 8px 12px;
  border-radius: var(--radius-pill);
  font-size: 13px;
  white-space: nowrap;
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

.more-menu {
  position: relative;
  flex: 0 0 auto;
}

.more-btn {
  border: 1px solid transparent;
}

.more-menu-panel {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  z-index: 30;
  min-width: 160px;
  padding: 6px;
  border: 1px solid var(--border-default);
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.96);
  box-shadow: var(--shadow-lg);
}

.more-menu-item {
  display: block;
  width: 100%;
  border: none;
  background: transparent;
  color: var(--text-secondary);
  text-align: left;
  padding: 8px 10px;
  border-radius: 12px;
  cursor: pointer;
}

.more-menu-item:hover,
.more-menu-item.active {
  background: var(--brand-soft);
  color: var(--brand);
}

.more-group-label {
  padding: 6px 10px 2px;
  font-size: 10px;
  color: var(--text-muted);
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.more-divider {
  height: 1px;
  margin: 4px 8px;
  background: var(--border-subtle);
}

.nav-btn svg {
  transition: transform 0.2s ease;
}

.nav-btn svg.rotated {
  transform: rotate(180deg);
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

.login-entry-btn {
  border: 1px solid var(--border-default);
  border-radius: var(--radius-pill);
  background: var(--bg-elevated);
  color: var(--brand);
  padding: 6px 16px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  flex-shrink: 0;
  transition: background 0.18s, border-color 0.18s;
}

.login-entry-btn:hover {
  background: var(--brand-soft);
  border-color: rgba(32, 79, 103, 0.24);
}

.login-modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 100;
  background: rgba(12, 21, 28, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(4px);
}

.login-modal-card {
  position: relative;
  background: var(--bg-elevated);
  border-radius: 20px;
  box-shadow: 0 24px 64px rgba(17, 27, 34, 0.16);
}

.login-modal-close {
  position: absolute;
  top: 14px;
  right: 14px;
  z-index: 1;
  width: 32px;
  height: 32px;
  border: 1px solid var(--border-default);
  border-radius: 50%;
  background: var(--bg-elevated);
  color: var(--text-tertiary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.18s, border-color 0.18s;
}

.login-modal-close:hover {
  color: var(--text-primary);
  border-color: var(--border-strong);
}

.user-menu {
  position: relative;
  flex-shrink: 0;
}

.user-avatar-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 1px solid var(--border-default);
  background: var(--brand);
  color: var(--text-on-dark);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: opacity 0.18s;
}

.user-avatar-btn:hover {
  opacity: 0.85;
}

.user-dropdown {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  z-index: 30;
  min-width: 170px;
  padding: 6px;
  border: 1px solid var(--border-default);
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.96);
  box-shadow: var(--shadow-md);
}

.user-dropdown-header {
  padding: 8px 10px 6px;
  border-bottom: 1px solid var(--border-subtle);
  margin-bottom: 4px;
}

.user-email {
  display: block;
  font-size: 12px;
  color: var(--text-primary);
}

.user-role {
  display: block;
  font-size: 10px;
  color: var(--text-muted);
  margin-top: 2px;
}

.user-dropdown-item {
  display: block;
  width: 100%;
  border: none;
  background: transparent;
  color: var(--text-secondary);
  text-align: left;
  padding: 8px 10px;
  border-radius: 12px;
  cursor: pointer;
  font-size: 13px;
}

.user-dropdown-item:hover {
  background: var(--brand-soft);
  color: var(--brand);
}

.user-dropdown-item.danger:hover {
  background: #fef2f2;
  color: #dc2626;
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
    overflow: visible;
    flex-wrap: wrap;
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



