<template>
  <div class="library-wrap">
    <div class="library-scroll">
      <section class="library-hero">
        <div class="hero-copy">
          <div class="hero-overline">{{ site.heroOverline || 'BOOKS · MAPS · KNOWLEDGE' }}</div>
          <h1 class="hero-title">
            <span class="hero-title-line">{{ site.title || '多书知识站' }}</span>
            <span class="hero-title-line">{{ site.subtitle || '从单书地图到可持续扩书的知识书库' }}</span>
          </h1>
          <p class="hero-desc">{{ site.description || '先选一本书，再进入它自己的阅读地图与知识图谱。' }}</p>
        </div>

        <div class="hero-panel">
          <div class="panel-kicker">当前已接入</div>
          <div class="hero-stats">
            <article class="stat-card">
              <div class="stat-value">{{ books.length }}</div>
              <div class="stat-label">书籍</div>
            </article>
            <article class="stat-card">
              <div class="stat-value">{{ topicCount }}</div>
              <div class="stat-label">专题</div>
            </article>
            <article class="stat-card">
              <div class="stat-value">{{ categoryCount }}</div>
              <div class="stat-label">分类</div>
            </article>
            <article class="stat-card">
              <div class="stat-value">{{ liveCount }}</div>
              <div class="stat-label">可读站点</div>
            </article>
          </div>
        </div>
      </section>

      <section class="book-section">
        <div class="section-head library-head">
          <div>
            <div class="section-kicker">{{ filteredBooks.length }} / {{ books.length }} 本书</div>
            <h2 class="section-title">阅读地图</h2>
          </div>

          <div class="filter-rail" aria-label="书籍筛选">
            <button
              v-for="filter in bookFilters"
              :key="filter.key"
              class="filter-chip"
              :class="{ active: selectedFilter === filter.key }"
              :aria-pressed="selectedFilter === filter.key"
              @click="selectedFilter = filter.key"
            >
              <span>{{ filter.label }}</span>
              <span class="filter-count">{{ filter.count }}</span>
            </button>
          </div>
        </div>

        <div v-if="spotlightBook" class="book-showcase">
          <article class="featured-book">
            <div v-if="spotlightBook.coverImage" class="featured-cover-wrap">
              <img :src="spotlightBook.coverImage" :alt="`${spotlightBook.title} 封面图`" class="book-cover" />
            </div>
            <div v-else class="featured-cover-wrap cover-fallback">
              <span>{{ spotlightBook.shortTitle || spotlightBook.title }}</span>
            </div>

            <div class="featured-copy">
              <div class="book-meta">
                <span class="book-author">{{ spotlightBook.author || '未知作者' }}</span>
                <span class="book-status">{{ statusLabel(spotlightBook.status) }}</span>
              </div>

              <h3 class="featured-title">{{ spotlightBook.title }}</h3>
              <p class="featured-desc">
                {{ spotlightBook.description || '这本书的数据已进入多书站，可直接进入阅读地图。' }}
              </p>

              <div v-if="spotlightBook.stats?.length" class="book-stats">
                <span v-for="stat in spotlightBook.stats.slice(0, 4)" :key="stat.label" class="book-stat">
                  {{ stat.label }} {{ stat.value }}
                </span>
              </div>

              <div v-if="spotlightBook.entryTopics?.length" class="book-entry-topics">
                <div class="book-topic-kicker">专题推荐入口</div>
                <div class="book-topic-list">
                  <button
                    v-for="topic in resolveBookTopics(spotlightBook.entryTopics).slice(0, 3)"
                    :key="`${spotlightBook.slug}-${topic.slug}`"
                    class="book-topic-link"
                    @click="$emit('openTopic', topic.slug)"
                  >
                    {{ topic.shortTitle || topic.title || topic.slug }}
                  </button>
                </div>
              </div>

              <div class="book-actions">
                <button class="primary-btn" @click="$emit('navigate', spotlightBook.slug)">进入阅读地图</button>
                <button class="ghost-btn" @click="$emit('showGraph', spotlightBook.slug)">查看图谱</button>
              </div>
            </div>
          </article>

          <div v-if="focusBooks.length" class="focus-grid">
            <article v-for="book in focusBooks" :key="book.slug" class="focus-card">
              <div class="book-meta">
                <span class="book-author">{{ book.author || '未知作者' }}</span>
                <span class="book-status">{{ statusLabel(book.status) }}</span>
              </div>
              <h3 class="focus-title">{{ book.shortTitle || book.title }}</h3>
              <p class="focus-desc">{{ book.description || '这本书的数据已进入多书站。' }}</p>
              <div v-if="book.entryTopics?.length" class="book-topic-list compact-list">
                <button
                  v-for="topic in resolveBookTopics(book.entryTopics).slice(0, 2)"
                  :key="`${book.slug}-${topic.slug}`"
                  class="book-topic-link"
                  @click="$emit('openTopic', topic.slug)"
                >
                  {{ topic.shortTitle || topic.title || topic.slug }}
                </button>
              </div>
              <div class="focus-actions">
                <button class="primary-btn compact" @click="$emit('navigate', book.slug)">阅读地图</button>
                <button class="ghost-btn compact" @click="$emit('showGraph', book.slug)">图谱</button>
              </div>
            </article>
          </div>
        </div>

        <div v-if="shelfBooks.length" class="book-shelf">
          <article v-for="book in shelfBooks" :key="book.slug" class="shelf-row">
            <div class="shelf-main">
              <div class="shelf-meta">
                <span>{{ book.primaryCategory || '未分类' }}</span>
                <span>{{ statusLabel(book.status) }}</span>
              </div>
              <h3 class="shelf-title">{{ book.shortTitle || book.title }}</h3>
              <p class="shelf-desc">{{ book.author || '未知作者' }} · {{ book.description || '可进入阅读地图。' }}</p>
              <div v-if="book.stats?.length" class="shelf-stats">
                <span v-for="stat in book.stats.slice(0, 2)" :key="stat.label">{{ stat.label }} {{ stat.value }}</span>
              </div>
            </div>
            <div class="shelf-actions">
              <button class="primary-btn compact" @click="$emit('navigate', book.slug)">进入</button>
              <button class="ghost-btn compact" @click="$emit('showGraph', book.slug)">图谱</button>
            </div>
          </article>
        </div>
      </section>

      <section v-if="tools.length || topics.length" class="explore-section">
        <div class="section-head">
          <div>
            <div class="section-kicker">{{ tools.length }} 个实验 · {{ topics.length }} 张专题</div>
            <h2 class="section-title">继续探索</h2>
          </div>
        </div>

        <div class="explore-grid">
          <article v-for="tool in tools" :key="tool.slug" class="explore-card tool-entry">
            <div class="topic-meta">
              <span class="tool-status">{{ tool.phaseLabel || statusLabel(tool.status) }}</span>
            </div>
            <h3 class="explore-title">
              <span>{{ tool.title }}</span>
              <span v-if="tool.subtitle" class="explore-subtitle">{{ tool.subtitle }}</span>
            </h3>
            <p class="explore-desc">{{ tool.description }}</p>
            <div v-if="tool.tags?.length" class="topic-tags">
              <span v-for="tag in tool.tags.slice(0, 3)" :key="tag" class="topic-tag">{{ tag }}</span>
            </div>
            <div class="book-actions">
              <button class="primary-btn compact" @click="$emit('openTool', tool.slug)">打开实验</button>
            </div>
          </article>

          <article v-for="topic in topics" :key="topic.slug" class="explore-card topic-entry">
            <div class="topic-meta">
              <span class="topic-status">{{ topic.phaseLabel || statusLabel(topic.status) }}</span>
            </div>
            <h3 class="explore-title">
              <span>{{ topic.title }}</span>
              <span v-if="topic.subtitle" class="explore-subtitle">{{ topic.subtitle }}</span>
            </h3>
            <p class="explore-desc">{{ topic.description }}</p>
            <div v-if="topic.tags?.length" class="topic-tags">
              <span v-for="tag in topic.tags.slice(0, 3)" :key="tag" class="topic-tag">{{ tag }}</span>
            </div>
            <div v-if="topic.relatedBooks?.length" class="topic-footnote">
              已关联 {{ topic.relatedBooks.length }} 本已接入图书
            </div>
            <div class="book-actions">
              <button class="primary-btn compact" @click="$emit('openTopic', topic.slug)">打开专题</button>
            </div>
          </article>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { bookFilterRules, bookScore, matchesBookFilter, statusLabel } from '../lib/libraryDisplay.js'

const props = defineProps({
  registry: {
    type: Object,
    default: () => ({ site: {}, books: [] }),
  },
})

defineEmits(['navigate', 'showGraph', 'openTopic', 'openTool'])

const selectedFilter = ref('all')

const site = computed(() => props.registry?.site || {})
const books = computed(() => props.registry?.books || [])
const topics = computed(() => props.registry?.topics || [])
const tools = computed(() => props.registry?.tools || [])
const topicMap = computed(() => new Map(topics.value.map((topic) => [topic.slug, topic])))
const liveCount = computed(() => books.value.filter((book) => book.status !== 'draft').length)
const topicCount = computed(() => topics.value.length)
const categoryCount = computed(() => new Set(books.value.map((book) => book.primaryCategory || '未分类')).size)
const bookFilters = computed(() =>
  bookFilterRules
    .map((filter) => ({
      ...filter,
      count: filter.key === 'all'
        ? books.value.length
        : books.value.filter((book) => matchesBookFilter(book, filter.key)).length,
    }))
    .filter((filter) => filter.key === 'all' || filter.count > 0),
)
const filteredBooks = computed(() => books.value.filter((book) => matchesBookFilter(book, selectedFilter.value)))
const orderedBooks = computed(() =>
  [...filteredBooks.value].sort((a, b) => bookScore(b) - bookScore(a) || a.title.localeCompare(b.title, 'zh-CN')),
)
const spotlightBook = computed(() => orderedBooks.value[0] || null)
const focusBooks = computed(() => orderedBooks.value.slice(1, 5))
const shelfBooks = computed(() => orderedBooks.value.slice(5))

function resolveBookTopics(entryTopics = []) {
  return entryTopics
    .map((item) => {
      if (typeof item === 'string') {
        return topicMap.value.get(item) || { slug: item, title: item }
      }
      if (!item?.slug) return null
      return {
        ...(topicMap.value.get(item.slug) || {}),
        ...item,
      }
    })
    .filter(Boolean)
}
</script>

<style scoped>
.library-wrap {
  height: 100%;
  overflow-y: auto;
  overflow-x: hidden;
}

.library-wrap::-webkit-scrollbar {
  width: 4px;
}

.library-wrap::-webkit-scrollbar-thumb {
  background: var(--border-strong);
  border-radius: 999px;
}

.library-scroll {
  max-width: 1240px;
  margin: 0 auto;
  padding: 0 20px 72px;
  overflow-x: hidden;
}

.library-hero {
  display: grid;
  grid-template-columns: minmax(0, 1.35fr) minmax(280px, 0.8fr);
  gap: 14px;
  padding: 28px 0 18px;
}

.hero-copy,
.hero-panel,
.featured-book,
.focus-card,
.shelf-row,
.explore-card {
  border: 1px solid var(--border-default);
  border-radius: 8px;
  box-shadow: var(--shadow-sm);
}

.hero-copy,
.hero-panel {
  background: rgba(247, 245, 240, 0.92);
}

.hero-copy {
  padding: 28px;
}

.hero-overline,
.panel-kicker,
.section-kicker,
.book-topic-kicker {
  font-size: 10px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--text-muted);
}

.hero-title {
  margin-top: 12px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-family: var(--font-serif);
  color: var(--text-primary);
  line-height: 1.08;
}

.hero-title-line,
.hero-desc,
.section-title,
.featured-title,
.focus-title,
.shelf-title,
.explore-title {
  overflow-wrap: anywhere;
}

.hero-title-line:first-child {
  font-size: clamp(30px, 3.4vw, 42px);
}

.hero-title-line:last-child {
  font-size: clamp(17px, 1.8vw, 22px);
  color: var(--accent);
}

.hero-desc {
  margin-top: 14px;
  max-width: 700px;
  color: var(--text-secondary);
  font-size: 14px;
  line-height: 1.75;
}

.hero-panel {
  padding: 22px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.hero-stats {
  margin-top: 14px;
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;
}

.stat-card {
  border-radius: 8px;
  border: 1px solid var(--border-default);
  background: rgba(255, 255, 255, 0.72);
  padding: 16px 12px;
  text-align: center;
}

.stat-value {
  font-family: var(--font-serif);
  font-size: 26px;
  color: var(--brand);
}

.stat-label {
  margin-top: 4px;
  font-size: 12px;
  color: var(--text-tertiary);
}

.book-section,
.explore-section {
  margin-top: 22px;
}

.section-head {
  margin-bottom: 14px;
}

.library-head {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px;
}

.section-title {
  margin-top: 6px;
  font-family: var(--font-serif);
  font-size: 28px;
  color: var(--text-primary);
}

.filter-rail {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 8px;
  max-width: 100%;
}

.filter-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border: 1px solid var(--border-default);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.72);
  color: var(--text-secondary);
  padding: 8px 10px;
  font-size: 12px;
  cursor: pointer;
  transition: background 0.18s ease, border-color 0.18s ease, color 0.18s ease;
}

.filter-chip:hover,
.filter-chip.active {
  border-color: rgba(32, 79, 103, 0.28);
  background: var(--brand-soft);
  color: var(--brand);
}

.filter-count {
  color: var(--text-muted);
  font-size: 11px;
}

.book-showcase {
  display: grid;
  grid-template-columns: 1fr;
  gap: 14px;
}

.featured-book {
  min-height: 0;
  display: grid;
  grid-template-columns: minmax(220px, 0.42fr) minmax(0, 1fr);
  overflow: hidden;
  background: rgba(255, 255, 255, 0.84);
}

.featured-cover-wrap {
  height: 300px;
  min-height: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 12px;
  overflow: hidden;
  background: rgba(32, 79, 103, 0.08);
}

.book-cover {
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
}

.cover-fallback {
  min-height: 220px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  color: var(--brand);
  font-family: var(--font-serif);
  font-size: 24px;
  text-align: center;
}

.featured-copy {
  padding: 22px 22px 18px;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.book-meta,
.topic-meta {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  font-size: 11px;
  color: var(--text-muted);
}

.book-author {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.book-status,
.topic-status,
.tool-status {
  padding: 2px 8px;
  border-radius: 8px;
  border: 1px solid var(--border-default);
  background: rgba(32, 79, 103, 0.08);
  color: var(--brand);
}

.topic-status {
  border-color: rgba(191, 111, 63, 0.18);
  background: rgba(191, 111, 63, 0.08);
  color: var(--accent);
}

.featured-title {
  margin-top: 12px;
  font-family: var(--font-serif);
  font-size: 27px;
  color: var(--text-primary);
  line-height: 1.25;
}

.featured-desc,
.focus-desc,
.shelf-desc,
.explore-desc {
  display: -webkit-box;
  overflow: hidden;
  -webkit-box-orient: vertical;
}

.featured-desc {
  -webkit-line-clamp: 3;
  margin-top: 10px;
  color: var(--text-secondary);
  font-size: 14px;
  line-height: 1.72;
}

.book-stats {
  margin-top: 14px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.book-stat {
  padding: 4px 8px;
  border-radius: 8px;
  background: rgba(191, 111, 63, 0.08);
  color: var(--accent);
  font-size: 11px;
}

.book-entry-topics {
  margin-top: 14px;
  padding-top: 14px;
  border-top: 1px solid rgba(32, 79, 103, 0.08);
}

.book-topic-list,
.topic-tags {
  margin-top: 10px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.compact-list {
  margin-top: 12px;
}

.book-topic-link,
.topic-tag {
  border-radius: 8px;
  border: 1px solid rgba(32, 79, 103, 0.14);
  background: rgba(32, 79, 103, 0.06);
  color: var(--brand);
  padding: 5px 8px;
  font-size: 11px;
}

.book-topic-link {
  cursor: pointer;
}

.book-actions,
.focus-actions,
.shelf-actions {
  display: flex;
  gap: 8px;
}

.book-actions {
  margin-top: auto;
  padding-top: 18px;
}

.primary-btn,
.ghost-btn {
  border-radius: 8px;
  padding: 10px 13px;
  font-size: 13px;
  cursor: pointer;
  white-space: nowrap;
}

.primary-btn {
  border: 1px solid transparent;
  background: var(--brand);
  color: #f7f5f0;
}

.ghost-btn {
  border: 1px solid var(--border-default);
  background: transparent;
  color: var(--text-secondary);
}

.compact {
  padding: 8px 10px;
  font-size: 12px;
}

.focus-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;
}

.focus-card {
  background: rgba(255, 255, 255, 0.82);
  padding: 16px;
}

.focus-title {
  margin-top: 8px;
  font-family: var(--font-serif);
  font-size: 20px;
  line-height: 1.28;
  color: var(--text-primary);
}

.focus-desc {
  -webkit-line-clamp: 2;
  margin-top: 8px;
  color: var(--text-secondary);
  font-size: 13px;
  line-height: 1.62;
}

.focus-actions {
  margin-top: 12px;
}

.book-shelf {
  margin-top: 14px;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.shelf-row {
  display: flex;
  align-items: center;
  gap: 14px;
  background: rgba(255, 255, 255, 0.76);
  padding: 14px;
}

.shelf-main {
  min-width: 0;
  flex: 1;
}

.shelf-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  color: var(--text-muted);
  font-size: 11px;
}

.shelf-title {
  margin-top: 5px;
  color: var(--text-primary);
  font-family: var(--font-serif);
  font-size: 18px;
  line-height: 1.25;
}

.shelf-desc {
  -webkit-line-clamp: 1;
  margin-top: 5px;
  color: var(--text-tertiary);
  font-size: 12px;
  line-height: 1.5;
}

.shelf-stats {
  margin-top: 8px;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  color: var(--accent);
  font-size: 11px;
}

.shelf-actions {
  flex-shrink: 0;
}

.explore-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
}

.explore-card {
  display: flex;
  flex-direction: column;
  min-height: 210px;
  background: rgba(255, 255, 255, 0.78);
  padding: 16px;
}

.tool-entry {
  background:
    linear-gradient(135deg, rgba(32, 79, 103, 0.08), rgba(255, 255, 255, 0.88)),
    rgba(255, 255, 255, 0.78);
}

.topic-entry {
  background:
    linear-gradient(135deg, rgba(191, 111, 63, 0.08), rgba(255, 255, 255, 0.88)),
    rgba(255, 255, 255, 0.78);
}

.explore-title {
  margin-top: 10px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-family: var(--font-serif);
  font-size: 20px;
  color: var(--text-primary);
  line-height: 1.28;
}

.explore-subtitle {
  font-size: 14px;
  color: var(--accent);
}

.explore-desc {
  -webkit-line-clamp: 3;
  margin-top: 9px;
  color: var(--text-secondary);
  font-size: 13px;
  line-height: 1.62;
}

.topic-footnote {
  margin-top: 12px;
  color: var(--text-muted);
  font-size: 11px;
}

@media (max-width: 1080px) {
  .explore-grid {
    grid-template-columns: 1fr;
  }

  .focus-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 960px) {
  .library-hero,
  .book-shelf {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 720px) {
  .library-scroll {
    padding: 0 14px 56px;
  }

  .library-hero {
    padding-top: 18px;
  }

  .hero-copy,
  .hero-panel,
  .featured-copy,
  .focus-card,
  .shelf-row,
  .explore-card {
    padding: 16px;
  }

  .hero-stats {
    grid-template-columns: 1fr 1fr;
  }

  .library-head {
    align-items: flex-start;
    flex-direction: column;
  }

  .filter-rail {
    width: 100%;
    justify-content: flex-start;
    overflow-x: auto;
    padding-bottom: 2px;
    flex-wrap: nowrap;
  }

  .filter-chip {
    flex: 0 0 auto;
  }

  .featured-book {
    grid-template-columns: 1fr;
    min-height: 0;
  }

  .featured-cover-wrap {
    height: 190px;
    min-height: 0;
  }

  .featured-title {
    font-size: 23px;
  }

  .focus-grid {
    grid-template-columns: 1fr;
  }

  .shelf-row {
    align-items: flex-start;
    flex-direction: column;
  }

  .shelf-actions,
  .book-actions,
  .focus-actions {
    width: 100%;
  }

  .shelf-actions .primary-btn,
  .shelf-actions .ghost-btn,
  .book-actions .primary-btn,
  .book-actions .ghost-btn,
  .focus-actions .primary-btn,
  .focus-actions .ghost-btn {
    flex: 1;
  }
}
</style>
