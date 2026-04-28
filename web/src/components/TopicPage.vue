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

      <section class="path-section">
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

      <section class="insight-grid">
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

      <section class="logic-section">
        <div class="section-head">
          <div class="section-kicker">Core Logic</div>
          <h2 class="section-title">核心逻辑</h2>
        </div>
        <ol class="ordered-list logic-list">
          <li v-for="item in topic.logic || []" :key="item">{{ item }}</li>
        </ol>
      </section>

      <section class="insight-grid">
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

      <section v-if="topic.relatedBooks?.length" class="books-section">
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

      <section v-if="topic.liveConnections?.length" class="connections-section">
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

      <section class="insight-grid">
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

      <section class="source-section">
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
</template>

<script setup>
defineProps({
  topic: {
    type: Object,
    required: true,
  },
})

defineEmits(['openBook', 'openNode', 'openTopic'])
</script>

<style scoped>
.topic-wrap {
  height: 100%;
  overflow-y: auto;
}

.topic-wrap::-webkit-scrollbar {
  width: 4px;
}

.topic-wrap::-webkit-scrollbar-thumb {
  background: var(--border-strong);
  border-radius: 999px;
}

.topic-scroll {
  max-width: 1240px;
  margin: 0 auto;
  padding: 0 20px 84px;
}

.topic-hero,
.path-section,
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
.logic-section,
.books-section,
.connections-section,
.source-section {
  border-radius: 30px;
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
  border-radius: 24px;
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
  border-radius: 20px;
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

.path-section,
.logic-section,
.books-section,
.connections-section,
.source-section {
  margin-top: 18px;
  padding: 26px;
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
  border-radius: 24px;
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
  border-radius: 24px;
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

.companion-list {
  display: grid;
  gap: 12px;
}

.companion-card {
  width: 100%;
  border-radius: 18px;
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

@media (max-width: 960px) {
  .topic-hero,
  .path-grid,
  .book-grid,
  .connection-grid,
  .source-grid,
  .insight-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 720px) {
  .topic-scroll {
    padding: 0 14px 48px;
  }

  .topic-hero,
  .path-section,
  .logic-section,
  .books-section,
  .connections-section,
  .source-section {
    padding: 18px;
    border-radius: 24px;
  }

  .hero-copy,
  .hero-panel,
  .insight-card,
  .path-card,
  .book-card,
  .connection-card,
  .companion-card,
  .source-card {
    border-radius: 20px;
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
}
</style>
