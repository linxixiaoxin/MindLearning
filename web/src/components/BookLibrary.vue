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

      <section
        v-for="group in groupedBooks"
        :key="group.category"
        class="category-section"
      >
        <div class="section-head">
          <div>
            <div class="section-kicker">{{ group.books.length }} 本书</div>
            <h2 class="section-title">{{ group.category }}</h2>
          </div>
        </div>

        <div class="book-grid">
          <article v-for="book in group.books" :key="book.slug" class="book-card">
            <div v-if="book.coverImage" class="book-cover-wrap">
              <img :src="book.coverImage" :alt="`${book.title} 封面图`" class="book-cover" />
            </div>

            <div class="book-copy">
              <div class="book-meta">
                <span class="book-author">{{ book.author || '未知作者' }}</span>
                <span class="book-status">{{ statusLabel(book.status) }}</span>
              </div>

              <h3 class="book-title">{{ book.title }}</h3>
              <p class="book-desc">{{ book.description || '这本书的数据已进入多书站，可直接进入阅读地图。' }}</p>

              <div v-if="book.stats?.length" class="book-stats">
                <span v-for="stat in book.stats" :key="stat.label" class="book-stat">
                  {{ stat.label }} {{ stat.value }}
                </span>
              </div>
            </div>

            <div class="book-actions">
              <button class="primary-btn" @click="$emit('navigate', book.slug)">进入阅读地图</button>
              <button class="ghost-btn" @click="$emit('showGraph', book.slug)">查看图谱</button>
            </div>
          </article>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  registry: {
    type: Object,
    default: () => ({ site: {}, books: [] }),
  },
})

defineEmits(['navigate', 'showGraph'])

const site = computed(() => props.registry?.site || {})
const books = computed(() => props.registry?.books || [])
const liveCount = computed(() => books.value.filter((book) => book.status !== 'draft').length)
const groupedBooks = computed(() => {
  const groups = new Map()
  for (const book of books.value) {
    const category = book.primaryCategory || '未分类'
    if (!groups.has(category)) groups.set(category, [])
    groups.get(category).push(book)
  }
  return Array.from(groups.entries()).map(([category, groupBooks]) => ({
    category,
    books: groupBooks.sort((a, b) => a.title.localeCompare(b.title, 'zh-CN')),
  }))
})
const categoryCount = computed(() => groupedBooks.value.length)

function statusLabel(status) {
  if (status === 'active') return '已接入'
  if (status === 'draft') return '草稿'
  return '准备中'
}
</script>

<style scoped>
.library-wrap {
  height: 100%;
  overflow-y: auto;
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
}

.library-hero {
  display: grid;
  grid-template-columns: minmax(0, 1.35fr) minmax(280px, 0.8fr);
  gap: 18px;
  padding: 44px 0 26px;
}

.hero-copy,
.hero-panel,
.category-section,
.book-card {
  border: 1px solid var(--border-default);
  box-shadow: var(--shadow-sm);
}

.hero-copy,
.hero-panel,
.category-section {
  border-radius: 28px;
  background: rgba(247, 245, 240, 0.92);
}

.hero-copy {
  padding: 34px;
}

.hero-overline,
.panel-kicker,
.section-kicker {
  font-size: 10px;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--text-muted);
}

.hero-title {
  margin-top: 14px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-family: var(--font-serif);
  color: var(--text-primary);
  line-height: 1.08;
}

.hero-title-line:first-child {
  font-size: clamp(32px, 4vw, 46px);
}

.hero-title-line:last-child {
  font-size: clamp(18px, 2vw, 24px);
  color: var(--accent);
}

.hero-desc {
  margin-top: 16px;
  max-width: 700px;
  color: var(--text-secondary);
  font-size: 15px;
  line-height: 1.8;
}

.hero-panel {
  padding: 24px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.hero-stats {
  margin-top: 14px;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.stat-card {
  border-radius: 20px;
  border: 1px solid var(--border-default);
  background: rgba(255, 255, 255, 0.72);
  padding: 18px 14px;
  text-align: center;
}

.stat-value {
  font-family: var(--font-serif);
  font-size: 28px;
  color: var(--brand);
}

.stat-label {
  margin-top: 6px;
  font-size: 12px;
  color: var(--text-tertiary);
}

.category-section {
  margin-top: 20px;
  padding: 24px;
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

.book-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.book-card {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.78);
}

.book-cover-wrap {
  aspect-ratio: 16 / 9;
  overflow: hidden;
  background: rgba(32, 79, 103, 0.08);
}

.book-cover {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.book-copy {
  padding: 18px 20px 10px;
}

.book-meta {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 11px;
  color: var(--text-muted);
}

.book-status {
  padding: 2px 8px;
  border-radius: 999px;
  border: 1px solid var(--border-default);
  background: rgba(32, 79, 103, 0.08);
  color: var(--brand);
}

.book-title {
  margin-top: 10px;
  font-family: var(--font-serif);
  font-size: 22px;
  color: var(--text-primary);
  line-height: 1.3;
}

.book-desc {
  margin-top: 10px;
  color: var(--text-secondary);
  font-size: 14px;
  line-height: 1.7;
}

.book-stats {
  margin-top: 12px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.book-stat {
  padding: 4px 9px;
  border-radius: 999px;
  background: rgba(191, 111, 63, 0.08);
  color: var(--accent);
  font-size: 11px;
}

.book-actions {
  display: flex;
  gap: 10px;
  padding: 0 20px 20px;
  margin-top: auto;
}

.primary-btn,
.ghost-btn {
  border-radius: 999px;
  padding: 10px 14px;
  font-size: 13px;
  cursor: pointer;
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

@media (max-width: 960px) {
  .library-hero,
  .book-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 720px) {
  .library-scroll {
    padding: 0 14px 56px;
  }

  .hero-copy,
  .hero-panel,
  .category-section {
    border-radius: 22px;
  }

  .hero-copy,
  .category-section {
    padding: 18px;
  }

  .hero-panel {
    padding: 18px;
  }

  .hero-stats {
    grid-template-columns: 1fr 1fr 1fr;
  }

  .book-copy,
  .book-actions {
    padding-left: 16px;
    padding-right: 16px;
  }

  .book-actions {
    flex-direction: column;
  }
}
</style>
