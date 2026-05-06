<template>
  <div class="topic-wrap">
    <div class="topic-scroll">
      <section class="topic-hero">
        <div class="hero-copy">
          <div class="hero-overline">{{ topic.overline || 'CROSS-BOOK TOPIC' }}</div>
          <h1 class="hero-title">
            <span class="hero-title-main">{{ topic.title }}</span>
            <span v-if="topic.subtitle" class="hero-title-sub">{{ topic.subtitle }}</span>
          </h1>
          <p class="hero-desc">{{ topic.description }}</p>

          <div class="hero-question">
            <div class="question-kicker">核心问题</div>
            <p class="question-text">{{ topic.coreQuestion }}</p>
          </div>
        </div>

        <aside class="hero-panel">
          <span class="panel-badge">{{ topic.phaseLabel || '专题推荐' }}</span>
          <p class="panel-note">{{ topic.phaseNote }}</p>

          <div v-if="topic.tags?.length" class="tag-row">
            <span v-for="tag in topic.tags" :key="tag" class="tag-chip">{{ tag }}</span>
          </div>
        </aside>
      </section>

      <div class="topic-layout">
        <aside class="topic-toc" aria-label="专题页目录">
          <div class="toc-title">页面目录</div>
          <button v-for="item in tocItems" :key="item.id" @click="scrollToSection(item.id)">
            <span>{{ item.kicker }}</span>
            <strong>{{ item.label }}</strong>
          </button>
        </aside>

        <div class="topic-main">
          <section id="path" class="path-section">
            <div class="section-head">
              <div class="section-kicker">Recommended Path</div>
              <h2 class="section-title">推荐阅读路径</h2>
            </div>

            <div class="path-grid">
              <article v-for="(step, index) in topic.readingPath || []" :key="step.title" class="path-card">
                <div class="path-num">{{ index + 1 }}</div>
                <div class="path-copy">
                  <h3 class="path-title">{{ step.title }}</h3>
                  <p class="path-desc">{{ step.description }}</p>
                </div>
              </article>
            </div>
          </section>

          <section id="questions" class="insight-grid">
            <article class="insight-card">
              <div class="section-kicker">This Page Answers</div>
              <h2 class="section-title">这张页回答什么</h2>
              <ol class="ordered-list">
                <li v-for="item in topic.questions || []" :key="item">{{ item }}</li>
              </ol>
            </article>

            <article class="insight-card">
              <div class="section-kicker">Common Pitfalls</div>
              <h2 class="section-title">常见误判</h2>
              <ul class="plain-list">
                <li v-for="item in topic.pitfalls || []" :key="item">{{ item }}</li>
              </ul>
            </article>
          </section>

          <section id="logic" class="logic-section">
            <div class="section-head">
              <div class="section-kicker">Core Logic</div>
              <h2 class="section-title">核心逻辑</h2>
            </div>
            <ol class="ordered-list logic-list">
              <li v-for="item in topic.logic || []" :key="item">{{ item }}</li>
            </ol>
          </section>

          <section v-if="topic.knowledgeNodes?.length" id="knowledge" class="travel-section knowledge-section">
            <div class="section-head">
              <div class="section-kicker">Knowledge Graph</div>
              <h2 class="section-title">可点击知识图谱</h2>
            </div>

            <div class="knowledge-layout">
              <div class="knowledge-map">
                <button
                  v-for="node in topic.knowledgeNodes"
                  :key="node.id"
                  class="knowledge-node"
                  :class="{ active: activeKnowledgeNode?.id === node.id }"
                  @click="selectKnowledgeNode(node.id)"
                >
                  <span>{{ node.type }}</span>
                  <strong>{{ node.title }}</strong>
                </button>
              </div>

              <article v-if="activeKnowledgeNode" class="knowledge-detail">
                <div class="knowledge-detail-head">
                  <span>{{ activeKnowledgeNode.type }}</span>
                  <h3>{{ activeKnowledgeNode.title }}</h3>
                </div>

                <p class="knowledge-summary">{{ activeKnowledgeNode.summary }}</p>

                <div v-if="activeKnowledgeNode.origin && !activeKnowledgeNode.hideSummaryBlocks" class="knowledge-block">
                  <strong>名称 / 概念来源</strong>
                  <p>{{ activeKnowledgeNode.origin }}</p>
                </div>

                <div v-if="activeKnowledgeNode.principle && !activeKnowledgeNode.hideSummaryBlocks" class="knowledge-block">
                  <strong>背后原理</strong>
                  <p>{{ activeKnowledgeNode.principle }}</p>
                </div>

                <div v-if="activeKnowledgeNode.lookFor?.length && !activeKnowledgeNode.hideSummaryBlocks" class="knowledge-block">
                  <strong>现场看什么</strong>
                  <ul class="task-list">
                    <li v-for="item in activeKnowledgeNode.lookFor" :key="item">{{ item }}</li>
                  </ul>
                </div>

                <div v-if="activeKnowledgeNode.sections?.length" class="knowledge-sections">
                  <section v-for="section in activeKnowledgeNode.sections" :key="section.title" class="knowledge-read-section">
                    <h4>{{ section.title }}</h4>
                    <p v-for="paragraph in section.paragraphs" :key="paragraph">{{ paragraph }}</p>
                    <ul v-if="section.items?.length" class="task-list">
                      <li v-for="item in section.items" :key="item">{{ item }}</li>
                    </ul>
                  </section>
                </div>

                <div v-if="activeKnowledgeNode.sources?.length" class="knowledge-block">
                  <strong>资料来源</strong>
                  <ul class="source-link-list">
                    <li v-for="source in activeKnowledgeNode.sources" :key="source.url || source.label">
                      <a v-if="source.url" :href="source.url" target="_blank" rel="noreferrer">{{ source.label }}</a>
                      <span v-else>{{ source.label }}</span>
                    </li>
                  </ul>
                </div>

                <div v-if="activeKnowledgeNode.doc" class="knowledge-doc">
                  延伸文档：{{ activeKnowledgeNode.doc }}
                </div>
              </article>
            </div>

            <div v-if="topic.knowledgeEdges?.length" class="edge-list">
              <div v-for="edge in topic.knowledgeEdges" :key="`${edge.from}-${edge.to}`" class="edge-chip">
                <span>{{ edge.from }}</span>
                <strong>{{ edge.relation }}</strong>
                <span>{{ edge.to }}</span>
              </div>
            </div>
          </section>

          <section v-if="topic.travelModules?.length" id="modules" class="travel-section">
            <div class="section-head">
              <div class="section-kicker">Travel Modules</div>
              <h2 class="section-title">专题模块</h2>
            </div>

            <div class="module-grid">
              <article v-for="item in topic.travelModules" :key="item.title" class="module-card">
                <span class="module-kicker">{{ item.kicker }}</span>
                <h3>{{ item.title }}</h3>
                <p>{{ item.detail }}</p>
              </article>
            </div>
          </section>

          <section v-if="topic.confirmedPlan?.length" id="confirmed-plan" class="travel-section">
            <div class="section-head">
              <div class="section-kicker">Confirmed Plan</div>
              <h2 class="section-title">已确认行程约束</h2>
            </div>

            <div class="constraint-grid">
              <article v-for="item in topic.confirmedPlan" :key="item.label" class="constraint-card">
                <span>{{ item.label }}</span>
                <strong>{{ item.value }}</strong>
                <p v-if="item.note">{{ item.note }}</p>
              </article>
            </div>
          </section>

          <section v-if="topic.dailyPlans?.length" id="field-plan" class="travel-section">
            <div class="section-head">
              <div class="section-kicker">5-Day Field Plan</div>
              <h2 class="section-title">厦门 + 泉州 5 天问题路线</h2>
            </div>

            <div class="day-list">
              <article v-for="(day, index) in topic.dailyPlans" :id="`day-${index + 1}`" :key="day.day" class="day-card">
                <div class="day-head">
                  <span class="day-index">{{ day.day }}</span>
                  <strong>{{ day.title }}</strong>
                </div>

                <div class="day-block question-block">
                  <span>主问题</span>
                  <p>{{ day.question }}</p>
                </div>

                <div class="day-block route-block">
                  <span>建议路线</span>
                  <p>{{ day.route }}</p>
                </div>

                <div class="day-block">
                  <span>观察 / 交流任务</span>
                  <ul class="task-list">
                    <li v-for="task in day.tasks" :key="task">{{ task }}</li>
                  </ul>
                </div>

                <div v-if="day.photoTask" class="day-block photo-block">
                  <span>拍照主线</span>
                  <p>{{ day.photoTask }}</p>
                </div>

                <div v-if="day.reviewPrompt" class="day-block">
                  <span>当晚复盘</span>
                  <p>{{ day.reviewPrompt }}</p>
                </div>
              </article>
            </div>
          </section>

          <section v-if="topic.photoMissions?.length" id="photo" class="travel-section">
            <div class="section-head">
              <div class="section-kicker">Photo Missions</div>
              <h2 class="section-title">情侣拍照主线</h2>
            </div>

            <div class="module-grid">
              <article v-for="item in topic.photoMissions" :key="item.title" class="module-card">
                <span class="module-kicker">{{ item.kicker }}</span>
                <h3>{{ item.title }}</h3>
                <p>{{ item.detail }}</p>
                <p v-if="item.scene" class="module-note">{{ item.scene }}</p>
              </article>
            </div>
          </section>

          <section v-if="topic.placeCards?.length" id="places" class="travel-section">
            <div class="section-head">
              <div class="section-kicker">Place Cards</div>
              <h2 class="section-title">地方背景卡</h2>
            </div>

            <div class="place-grid">
              <article v-for="item in topic.placeCards" :key="item.title" class="place-card">
                <div class="place-head">
                  <span>{{ item.kicker }}</span>
                  <h3>{{ item.title }}</h3>
                </div>
                <p>{{ item.context }}</p>
                <div v-if="item.watch?.length" class="watch-box">
                  <strong>现场看什么</strong>
                  <ul class="task-list">
                    <li v-for="point in item.watch" :key="point">{{ point }}</li>
                  </ul>
                </div>
              </article>
            </div>
          </section>

          <section v-if="topic.foodGuide?.length" id="food" class="travel-section">
            <div class="section-head">
              <div class="section-kicker">Taste & Senses</div>
              <h2 class="section-title">五感与美食探店</h2>
            </div>

            <div class="food-grid">
              <article v-for="item in topic.foodGuide" :key="item.city" class="food-card">
                <span>{{ item.city }}</span>
                <h3>{{ item.title }}</h3>
                <ul class="task-list">
                  <li v-for="point in item.items" :key="point">{{ point }}</li>
                </ul>
                <p v-if="item.question">{{ item.question }}</p>
              </article>
            </div>
          </section>

          <section v-if="topic.materialPrompts?.length" id="materials" class="travel-section">
            <div class="section-head">
              <div class="section-kicker">Material Box</div>
              <h2 class="section-title">旅行素材箱</h2>
            </div>

            <div class="material-grid">
              <article v-for="item in topic.materialPrompts" :key="item.title" class="source-card">
                <h3 class="source-title">{{ item.title }}</h3>
                <p class="source-desc">{{ item.prompt }}</p>
              </article>
            </div>
          </section>

          <section v-if="topic.reviewTemplate?.length" id="review" class="travel-section">
            <div class="section-head">
              <div class="section-kicker">Daily Review</div>
              <h2 class="section-title">每天晚上 5 行复盘</h2>
            </div>

            <div class="review-box">
              <div v-for="item in topic.reviewTemplate" :key="item" class="review-line">{{ item }}</div>
            </div>
          </section>

          <section id="sources" class="insight-grid">
            <article class="insight-card">
              <div class="section-kicker">Use This When</div>
              <h2 class="section-title">什么时候最有用</h2>
              <ul class="plain-list">
                <li v-for="item in topic.useCases || []" :key="item">{{ item }}</li>
              </ul>
            </article>

            <article class="insight-card">
              <div class="section-kicker">Current Source</div>
              <h2 class="section-title">当前主来源</h2>
              <ul class="plain-list">
                <li v-for="item in topic.currentSources || []" :key="item.label">
                  <strong>{{ item.label }}</strong>
                  <span>{{ item.detail }}</span>
                </li>
              </ul>
            </article>
          </section>

          <section v-if="topic.relatedBooks?.length" id="books" class="books-section">
            <div class="section-head">
              <div class="section-kicker">Books Already Live</div>
              <h2 class="section-title">已接入书内透镜</h2>
            </div>

            <div class="book-grid">
              <button
                v-for="book in topic.relatedBooks"
                :key="book.slug"
                class="book-card"
                @click="$emit('openBook', book.slug)"
              >
                <span class="book-badge">{{ book.badge || '已接入' }}</span>
                <h3 class="book-title">{{ book.title }}</h3>
                <p class="book-desc">{{ book.description }}</p>
              </button>
            </div>
          </section>

          <section v-if="topic.liveConnections?.length" id="connections" class="connections-section">
            <div class="section-head">
              <div class="section-kicker">Direct Entries</div>
              <h2 class="section-title">现在就能点进的节点</h2>
            </div>

            <div class="connection-grid">
              <button
                v-for="item in topic.liveConnections"
                :key="`${item.bookSlug}-${item.nodeId}`"
                class="connection-card"
                @click="$emit('openNode', { slug: item.bookSlug, nodeId: item.nodeId })"
              >
                <span class="connection-badge">{{ item.badge || '站内直达' }}</span>
                <h3 class="connection-title">{{ item.label }}</h3>
                <p v-if="item.bookTitle" class="connection-book">《{{ item.bookTitle }}》</p>
                <p class="connection-desc">{{ item.detail }}</p>
              </button>
            </div>
          </section>

          <section id="next" class="insight-grid">
            <article class="insight-card">
              <div class="section-kicker">Next Connections</div>
              <h2 class="section-title">下一步会补什么</h2>
              <ul class="plain-list">
                <li v-for="item in topic.nextConnections || []" :key="item.label">
                  <span class="status-chip" :class="`status-${item.status || 'planned'}`">
                    {{ item.status === 'planned' ? '规划中' : '已接入' }}
                  </span>
                  <strong>{{ item.label }}</strong>
                  <span>{{ item.detail }}</span>
                </li>
              </ul>
            </article>

            <article class="insight-card">
              <div class="section-kicker">Companion Topics</div>
              <h2 class="section-title">配套主题页</h2>
              <div class="companion-list">
                <button
                  v-for="item in topic.companionTopics || []"
                  :key="item.label"
                  class="companion-card"
                  :class="{ 'is-live': Boolean(item.slug) }"
                  @click="item.slug && $emit('openTopic', item.slug)"
                >
                  <span class="status-chip" :class="item.slug ? 'status-live' : 'status-planned'">
                    {{ item.slug ? '已接入' : '规划中' }}
                  </span>
                  <strong>{{ item.label }}</strong>
                  <span>{{ item.detail }}</span>
                </button>
              </div>
            </article>
          </section>

          <section id="assets" class="source-section">
            <div class="section-head">
              <div class="section-kicker">Source Assets</div>
              <h2 class="section-title">来源资产</h2>
            </div>

            <div class="source-grid">
              <article v-for="item in topic.sourceAssets || []" :key="item.label" class="source-card">
                <h3 class="source-title">{{ item.label }}</h3>
                <p class="source-desc">{{ item.detail }}</p>
              </article>
            </div>
          </section>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
  topic: {
    type: Object,
    required: true,
  },
})

defineEmits(['openBook', 'openNode', 'openTopic'])

const activeKnowledgeId = ref(null)

const activeKnowledgeNode = computed(() => {
  const nodes = props.topic.knowledgeNodes || []
  if (!nodes.length) return null
  return nodes.find((node) => node.id === activeKnowledgeId.value) || nodes[0]
})

const tocItems = computed(() => {
  const base = [
    { id: 'path', kicker: 'Path', label: '阅读路径' },
    { id: 'questions', kicker: 'Questions', label: '问题与误判' },
    { id: 'logic', kicker: 'Logic', label: '核心逻辑' },
  ]

  if (props.topic.knowledgeNodes?.length) base.push({ id: 'knowledge', kicker: 'Graph', label: '知识图谱' })
  if (props.topic.travelModules?.length) base.push({ id: 'modules', kicker: 'Modules', label: '专题模块' })
  if (props.topic.confirmedPlan?.length) base.push({ id: 'confirmed-plan', kicker: 'Fixed', label: '已确认约束' })
  if (props.topic.dailyPlans?.length) base.push({ id: 'field-plan', kicker: 'Plan', label: '5 天路线' })
  if (props.topic.photoMissions?.length) base.push({ id: 'photo', kicker: 'Photo', label: '拍照主线' })
  if (props.topic.placeCards?.length) base.push({ id: 'places', kicker: 'Place', label: '地方背景' })
  if (props.topic.foodGuide?.length) base.push({ id: 'food', kicker: 'Taste', label: '五感美食' })
  if (props.topic.materialPrompts?.length) base.push({ id: 'materials', kicker: 'Archive', label: '素材箱' })
  if (props.topic.reviewTemplate?.length) base.push({ id: 'review', kicker: 'Review', label: '5 行复盘' })

  base.push(
    { id: 'sources', kicker: 'Use', label: '适用场景' },
    { id: 'books', kicker: 'Books', label: '书内透镜' },
    { id: 'connections', kicker: 'Nodes', label: '直达节点' },
    { id: 'next', kicker: 'Next', label: '下一步' },
    { id: 'assets', kicker: 'Assets', label: '来源资产' },
  )

  return base
})

function scrollToSection(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

function selectKnowledgeNode(id) {
  activeKnowledgeId.value = id
}
</script>

<style scoped>
.topic-wrap {
  height: 100%;
  overflow-y: auto;
  scroll-behavior: smooth;
}

.topic-wrap::-webkit-scrollbar {
  width: 4px;
}

.topic-wrap::-webkit-scrollbar-thumb {
  background: var(--border-strong);
  border-radius: 999px;
}

.topic-scroll {
  max-width: 1320px;
  margin: 0 auto;
  padding: 0 20px 84px;
}

.topic-hero,
.path-section,
.travel-section,
.insight-card,
.logic-section,
.books-section,
.connections-section,
.source-section,
.source-card,
.book-card,
.connection-card,
.companion-card,
.path-card {
  border: 1px solid var(--border-default);
  box-shadow: var(--shadow-sm);
}

.topic-hero,
.path-section,
.travel-section,
.logic-section,
.books-section,
.connections-section,
.source-section {
  border-radius: var(--radius-panel);
  background: rgba(247, 245, 240, 0.92);
}

.topic-hero {
  margin-top: 42px;
  padding: 30px;
  display: grid;
  grid-template-columns: minmax(0, 1.35fr) minmax(280px, 0.75fr);
  gap: 18px;
  background:
    radial-gradient(circle at top right, rgba(191, 111, 63, 0.14) 0%, rgba(247, 245, 240, 0.9) 36%),
    linear-gradient(180deg, rgba(247, 245, 240, 0.96) 0%, rgba(238, 243, 243, 0.96) 100%);
}

.hero-copy,
.hero-panel {
  border-radius: var(--radius-card);
  padding: 28px;
  background: rgba(255, 255, 255, 0.74);
  border: 1px solid rgba(32, 79, 103, 0.08);
}

.hero-overline,
.section-kicker,
.question-kicker {
  font-size: 10px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--text-muted);
}

.hero-title {
  margin-top: 14px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.hero-title-main,
.hero-title-sub {
  font-family: var(--font-serif);
  line-height: 1.08;
}

.hero-title-main {
  font-size: clamp(34px, 4vw, 52px);
  color: var(--text-primary);
}

.hero-title-sub {
  font-size: clamp(20px, 2.2vw, 28px);
  color: var(--brand);
}

.hero-desc {
  margin-top: 16px;
  color: var(--text-secondary);
  font-size: 15px;
  line-height: 1.85;
  max-width: 680px;
}

.hero-question {
  margin-top: 22px;
  padding: 18px 20px;
  border-radius: var(--radius-card);
  background: rgba(32, 79, 103, 0.06);
}

.question-text {
  margin-top: 10px;
  font-family: var(--font-serif);
  font-size: 21px;
  line-height: 1.5;
  color: var(--text-primary);
}

.hero-panel {
  display: flex;
  flex-direction: column;
  gap: 16px;
  justify-content: space-between;
}

.panel-badge,
.book-badge,
.status-chip,
.tag-chip {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: fit-content;
  border-radius: 999px;
  font-size: 11px;
}

.panel-badge {
  padding: 7px 12px;
  background: rgba(191, 111, 63, 0.12);
  color: var(--accent);
  font-weight: 700;
}

.panel-note {
  color: var(--text-secondary);
  font-size: 14px;
  line-height: 1.8;
}

.tag-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag-chip {
  padding: 6px 10px;
  border: 1px solid rgba(32, 79, 103, 0.14);
  background: rgba(255, 255, 255, 0.82);
  color: var(--text-secondary);
}

.topic-layout {
  margin-top: 18px;
  display: grid;
  grid-template-columns: 220px minmax(0, 1fr);
  gap: 18px;
  align-items: start;
}

.topic-main {
  min-width: 0;
}

.topic-main > section {
  scroll-margin-top: 22px;
}

.topic-toc {
  position: sticky;
  top: 18px;
  border: 1px solid var(--border-default);
  border-radius: var(--radius-panel);
  background: rgba(247, 245, 240, 0.94);
  box-shadow: var(--shadow-sm);
  padding: 14px;
  display: grid;
  gap: 8px;
  max-height: calc(100vh - 120px);
  overflow-y: auto;
}

.toc-title {
  padding: 6px 8px 10px;
  color: var(--text-muted);
  font-size: 11px;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

.topic-toc button {
  width: 100%;
  border: 1px solid transparent;
  border-radius: var(--radius-control);
  background: rgba(255, 255, 255, 0.58);
  padding: 10px 11px;
  text-align: left;
  cursor: pointer;
}

.topic-toc button:hover {
  border-color: rgba(32, 79, 103, 0.2);
  background: rgba(32, 79, 103, 0.06);
}

.topic-toc button span {
  display: block;
  color: var(--text-muted);
  font-size: 10px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.topic-toc button strong {
  display: block;
  margin-top: 3px;
  color: var(--text-primary);
  font-size: 13px;
}

.path-section,
.travel-section,
.logic-section,
.books-section,
.connections-section,
.source-section {
  padding: 26px;
}

.topic-main > section + section {
  margin-top: 18px;
}

.section-head {
  margin-bottom: 16px;
}

.section-title {
  margin-top: 6px;
  font-family: var(--font-serif);
  font-size: 28px;
  color: var(--text-primary);
}

.path-grid,
.book-grid,
.connection-grid,
.source-grid,
.insight-grid {
  display: grid;
  gap: 16px;
}

.path-grid {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.path-card,
.insight-card,
.source-card {
  border-radius: var(--radius-card);
  background: rgba(255, 255, 255, 0.8);
}

.path-card {
  padding: 18px;
  display: grid;
  grid-template-columns: 42px minmax(0, 1fr);
  gap: 14px;
}

.path-num {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  background: rgba(32, 79, 103, 0.1);
  color: var(--brand);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-serif);
  font-size: 18px;
}

.path-title,
.book-title,
.source-title {
  font-family: var(--font-serif);
  color: var(--text-primary);
}

.path-title {
  font-size: 21px;
  line-height: 1.3;
}

.path-desc,
.book-desc,
.source-desc {
  margin-top: 8px;
  color: var(--text-secondary);
  font-size: 14px;
  line-height: 1.75;
}

.insight-grid {
  margin-top: 18px;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.insight-card {
  padding: 24px;
}

.logic-list {
  max-width: 980px;
}

.ordered-list,
.plain-list {
  color: var(--text-secondary);
  line-height: 1.85;
  padding-left: 20px;
}

.plain-list {
  list-style: disc;
}

.ordered-list li,
.plain-list li {
  margin-bottom: 10px;
}

.plain-list strong {
  display: block;
  color: var(--text-primary);
  font-weight: 700;
}

.book-grid {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.book-card,
.connection-card {
  border-radius: var(--radius-card);
  padding: 22px;
  background: rgba(255, 255, 255, 0.8);
  text-align: left;
  cursor: pointer;
  transition: transform 0.18s ease, border-color 0.18s ease;
}

.book-card:hover,
.connection-card:hover,
.companion-card.is-live:hover {
  transform: translateY(-2px);
  border-color: rgba(32, 79, 103, 0.24);
}

.book-badge,
.connection-badge {
  padding: 5px 10px;
  background: rgba(32, 79, 103, 0.1);
  color: var(--brand);
}

.book-title,
.connection-title {
  margin-top: 14px;
  font-size: 24px;
}

.connection-grid {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.connection-book {
  margin-top: 8px;
  color: var(--accent);
  font-size: 12px;
  letter-spacing: 0.04em;
}

.connection-desc {
  margin-top: 8px;
  color: var(--text-secondary);
  font-size: 14px;
  line-height: 1.75;
}

.status-chip {
  margin-bottom: 6px;
  padding: 4px 8px;
}

.status-planned {
  background: rgba(191, 111, 63, 0.1);
  color: var(--accent);
}

.status-live {
  background: rgba(32, 79, 103, 0.1);
  color: var(--brand);
}

.source-grid {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.source-card {
  padding: 20px;
}

.module-grid,
.material-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
}

.constraint-grid,
.place-grid,
.food-grid {
  display: grid;
  gap: 14px;
}

.constraint-grid {
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

.place-grid {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.food-grid {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.module-card,
.day-card,
.constraint-card,
.place-card,
.food-card {
  border: 1px solid var(--border-default);
  border-radius: var(--radius-card);
  background: rgba(255, 255, 255, 0.78);
  box-shadow: var(--shadow-sm);
}

.module-card,
.constraint-card,
.place-card,
.food-card {
  padding: 18px;
}

.constraint-card span,
.food-card span,
.place-head span {
  display: inline-flex;
  color: var(--text-muted);
  font-size: 10px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.constraint-card strong {
  display: block;
  margin-top: 8px;
  color: var(--text-primary);
  font-family: var(--font-serif);
  font-size: 20px;
  line-height: 1.35;
}

.constraint-card p,
.place-card p,
.food-card p,
.module-note {
  margin-top: 9px;
  color: var(--text-secondary);
  font-size: 14px;
  line-height: 1.75;
}

.module-kicker {
  display: inline-flex;
  border-radius: 999px;
  background: rgba(32, 79, 103, 0.08);
  color: var(--brand);
  padding: 5px 9px;
  font-size: 11px;
}

.module-card h3 {
  margin-top: 12px;
  font-family: var(--font-serif);
  color: var(--text-primary);
  font-size: 21px;
}

.module-card p {
  margin-top: 8px;
  color: var(--text-secondary);
  font-size: 14px;
  line-height: 1.75;
}

.module-note {
  padding-top: 8px;
  border-top: 1px solid rgba(32, 79, 103, 0.08);
}

.place-head h3,
.food-card h3 {
  margin-top: 8px;
  color: var(--text-primary);
  font-family: var(--font-serif);
  font-size: 22px;
}

.watch-box {
  margin-top: 14px;
  padding: 13px 14px;
  border-radius: var(--radius-card);
  background: rgba(32, 79, 103, 0.05);
}

.watch-box strong {
  display: block;
  margin-bottom: 8px;
  color: var(--brand);
  font-size: 13px;
}

.day-list {
  display: grid;
  gap: 14px;
}

.day-card {
  padding: 20px;
  display: grid;
  gap: 14px;
}

.day-head {
  display: flex;
  align-items: baseline;
  gap: 12px;
  flex-wrap: wrap;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(32, 79, 103, 0.1);
}

.day-index {
  border-radius: 999px;
  background: rgba(191, 111, 63, 0.1);
  color: var(--accent);
  padding: 6px 10px;
  font-size: 11px;
}

.day-head strong {
  font-family: var(--font-serif);
  color: var(--text-primary);
  font-size: 24px;
}

.day-block {
  display: grid;
  grid-template-columns: 92px minmax(0, 1fr);
  gap: 12px;
  align-items: start;
}

.day-block > span {
  color: var(--text-muted);
  font-size: 11px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  padding-top: 4px;
}

.day-block p {
  color: var(--text-secondary);
  line-height: 1.75;
}

.question-block p {
  font-family: var(--font-serif);
  color: var(--text-primary);
  font-size: 20px;
  line-height: 1.55;
}

.route-block p {
  border-left: 3px solid rgba(32, 79, 103, 0.28);
  padding-left: 12px;
  color: var(--brand);
}

.photo-block p {
  border-left: 3px solid rgba(191, 111, 63, 0.28);
  padding-left: 12px;
  color: var(--accent);
}

.task-list {
  margin: 0;
  padding-left: 18px;
  color: var(--text-secondary);
  line-height: 1.75;
}

.task-list li + li {
  margin-top: 7px;
}

.companion-list {
  display: grid;
  gap: 12px;
}

.companion-card {
  width: 100%;
  border-radius: var(--radius-card);
  padding: 16px 18px;
  background: rgba(255, 255, 255, 0.74);
  text-align: left;
  cursor: default;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 6px;
  transition: transform 0.18s ease, border-color 0.18s ease;
}

.companion-card.is-live {
  cursor: pointer;
}

.companion-card strong {
  color: var(--text-primary);
  font-size: 15px;
}

.companion-card span:last-child {
  color: var(--text-secondary);
  font-size: 13px;
  line-height: 1.75;
}

.review-box {
  display: grid;
  gap: 10px;
  padding: 18px;
  border: 1px solid rgba(32, 79, 103, 0.1);
  border-radius: var(--radius-card);
  background: rgba(255, 255, 255, 0.78);
}

.review-line {
  padding: 12px 14px;
  border-radius: var(--radius-control);
  background: rgba(32, 79, 103, 0.05);
  color: var(--text-primary);
  font-size: 14px;
}

.knowledge-layout {
  display: grid;
  grid-template-columns: minmax(240px, 0.75fr) minmax(0, 1.25fr);
  gap: 16px;
}

.knowledge-map {
  display: grid;
  gap: 10px;
  align-content: start;
}

.knowledge-node {
  border: 1px solid rgba(32, 79, 103, 0.12);
  border-radius: var(--radius-card);
  background: rgba(255, 255, 255, 0.72);
  padding: 14px 16px;
  text-align: left;
  cursor: pointer;
  transition: transform 0.18s ease, border-color 0.18s ease, background 0.18s ease;
}

.knowledge-node:hover,
.knowledge-node.active {
  transform: translateY(-1px);
  border-color: rgba(32, 79, 103, 0.28);
  background: rgba(32, 79, 103, 0.06);
}

.knowledge-node span,
.knowledge-detail-head span {
  display: block;
  color: var(--text-muted);
  font-size: 10px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.knowledge-node strong {
  display: block;
  margin-top: 5px;
  color: var(--text-primary);
  font-size: 15px;
  line-height: 1.45;
}

.knowledge-detail {
  border: 1px solid var(--border-default);
  border-radius: var(--radius-card);
  background: rgba(255, 255, 255, 0.82);
  box-shadow: var(--shadow-sm);
  padding: 22px;
}

.knowledge-detail h3 {
  margin-top: 7px;
  color: var(--text-primary);
  font-family: var(--font-serif);
  font-size: 28px;
  line-height: 1.25;
}

.knowledge-summary {
  margin-top: 12px;
  color: var(--text-secondary);
  font-size: 15px;
  line-height: 1.8;
}

.knowledge-block {
  margin-top: 16px;
  padding-top: 14px;
  border-top: 1px solid rgba(32, 79, 103, 0.1);
}

.knowledge-block strong {
  color: var(--brand);
  font-size: 13px;
}

.knowledge-block p {
  margin-top: 7px;
  color: var(--text-secondary);
  font-size: 14px;
  line-height: 1.75;
}

.knowledge-doc {
  margin-top: 16px;
  padding: 10px 12px;
  border-radius: var(--radius-control);
  background: rgba(191, 111, 63, 0.08);
  color: var(--accent);
  font-size: 12px;
  line-height: 1.6;
  word-break: break-word;
}

.knowledge-sections {
  margin-top: 18px;
  display: grid;
  gap: 14px;
}

.knowledge-read-section {
  padding: 16px;
  border: 1px solid rgba(32, 79, 103, 0.1);
  border-radius: var(--radius-card);
  background: rgba(247, 245, 240, 0.74);
}

.knowledge-read-section h4 {
  color: var(--text-primary);
  font-family: var(--font-serif);
  font-size: 19px;
  line-height: 1.35;
}

.knowledge-read-section p {
  margin-top: 8px;
  color: var(--text-secondary);
  font-size: 14px;
  line-height: 1.8;
}

.source-link-list {
  margin: 10px 0 0;
  padding-left: 18px;
  color: var(--text-secondary);
  line-height: 1.75;
}

.source-link-list a {
  color: var(--brand);
  text-decoration: none;
  border-bottom: 1px solid rgba(32, 79, 103, 0.22);
}

.source-link-list a:hover {
  color: var(--accent);
  border-bottom-color: rgba(191, 111, 63, 0.32);
}

.edge-list {
  margin-top: 16px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.edge-chip {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  border: 1px solid rgba(32, 79, 103, 0.12);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.7);
  padding: 7px 10px;
  color: var(--text-secondary);
  font-size: 12px;
}

.edge-chip strong {
  color: var(--brand);
}

@media (max-width: 960px) {
  .topic-hero,
  .path-grid,
  .book-grid,
  .connection-grid,
  .source-grid,
  .insight-grid,
  .module-grid,
  .material-grid,
  .constraint-grid,
  .place-grid,
  .food-grid {
    grid-template-columns: 1fr;
  }

  .knowledge-layout {
    grid-template-columns: 1fr;
  }

  .topic-layout {
    grid-template-columns: 1fr;
  }

  .topic-toc {
    position: sticky;
    top: 0;
    z-index: 2;
    display: flex;
    overflow-x: auto;
    overflow-y: hidden;
    max-height: none;
    border-radius: 0 0 18px 18px;
    margin: 0 -20px;
    padding: 10px 20px;
  }

  .toc-title {
    display: none;
  }

  .topic-toc button {
    min-width: 128px;
  }
}

@media (max-width: 720px) {
  .topic-scroll {
    padding: 0 14px 48px;
  }

  .topic-hero,
  .path-section,
  .travel-section,
  .logic-section,
  .books-section,
  .connections-section,
  .source-section {
    padding: 18px;
    border-radius: var(--radius-panel);
  }

  .hero-copy,
  .hero-panel,
  .insight-card,
  .path-card,
  .book-card,
  .connection-card,
  .companion-card,
  .source-card {
    border-radius: var(--radius-card);
    padding: 18px;
  }

  .section-title {
    font-size: 24px;
  }

  .question-text {
    font-size: 18px;
  }

  .path-card {
    grid-template-columns: 36px minmax(0, 1fr);
  }

  .path-num {
    width: 36px;
    height: 36px;
    font-size: 16px;
  }

  .day-block {
    grid-template-columns: 1fr;
    gap: 7px;
  }

  .day-head strong {
    font-size: 21px;
  }

  .question-block p {
    font-size: 18px;
  }
}
</style>
