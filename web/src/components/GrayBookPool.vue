<template>
  <div class="gray-wrap">
    <div class="gray-scroll">
      <section class="gray-hero">
        <div>
          <div class="tool-kicker">EXPANSION · GRAY POOL</div>
          <h1>50 本灰度候选池</h1>
          <p>这些书已经进入扩容候选，其中部分已转为正式轻量书页；公开页面只展示已改写内容。</p>
        </div>

        <div class="hero-stats">
          <article>
            <span>候选</span>
            <strong>{{ selectedCount }}</strong>
          </article>
          <article>
            <span>正式书库</span>
            <strong>{{ existingSiteBookCount }}</strong>
          </article>
          <article>
            <span>未改写公开</span>
            <strong>{{ rawVaultReadyCount }}</strong>
          </article>
        </div>
      </section>

      <section class="control-row">
        <label class="search-box">
          <span>搜索</span>
          <input v-model="query" type="search" placeholder="书名、分类、质检文件" />
        </label>

        <div class="filter-tabs" aria-label="灰度候选筛选">
          <button
            v-for="option in filterOptions"
            :key="option.value"
            :class="{ active: activeFilter === option.value }"
            @click="activeFilter = option.value"
          >
            {{ option.label }}
          </button>
        </div>
      </section>

      <section v-if="loading" class="state-panel">
        <div class="loading-spinner"></div>
        <p>正在读取灰度候选池…</p>
      </section>

      <section v-else-if="error" class="state-panel">
        <h2>灰度候选池暂时不可用</h2>
        <p>{{ error }}</p>
      </section>

      <section v-else class="book-grid">
        <article v-for="book in filteredBooks" :key="book.workingId" class="gray-book">
          <div class="book-topline">
            <span>#{{ book.slot }}</span>
            <span>{{ evidenceLabel(book) }}</span>
          </div>

          <h2>{{ book.title }}</h2>
          <p>{{ cleanCategory(book.primaryCategory) }}</p>

          <div class="status-line">
            <span>{{ book.quality?.status || '未记录' }}</span>
            <span>{{ rewriteLabel(book) }}</span>
          </div>

          <dl>
            <div>
              <dt>核心问题</dt>
              <dd>{{ book.assets?.counts?.coreQuestions || 0 }}</dd>
            </div>
            <div>
              <dt>概念</dt>
              <dd>{{ book.assets?.counts?.coreConcepts || 0 }}</dd>
            </div>
            <div>
              <dt>章节</dt>
              <dd>{{ book.assets?.counts?.chapters || 0 }}</dd>
            </div>
          </dl>

          <div class="audit-line">
            <span>{{ book.quality?.auditFile }}</span>
          </div>

          <div v-if="entrySampleFor(book)" class="entry-draft">
            <strong>{{ entrySampleTitle(entrySampleFor(book)) }}</strong>
            <span>{{ entrySampleFor(book).angle }}</span>
            <small>{{ entrySampleFor(book).draftPath }}</small>
            <a v-if="entrySampleFor(book).sitePath" :href="entrySampleFor(book).sitePath">打开正式轻量页</a>
          </div>
        </article>
      </section>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'

const manifest = ref(null)
const publicEntrySamples = ref([])
const registryBookCount = ref(0)
const loading = ref(true)
const error = ref('')
const query = ref('')
const activeFilter = ref('all')

const filterOptions = [
  { value: 'all', label: '全部' },
  { value: 'knTable', label: '卡片表' },
  { value: 'structured', label: '结构化依据' },
  { value: 'entryDraft', label: '已有入口稿' },
  { value: 'rewrite', label: '待转写' },
]

const books = computed(() => manifest.value?.books || [])
const selectedCount = computed(() => manifest.value?.target?.selectedCount || books.value.length)
const existingSiteBookCount = computed(() => registryBookCount.value || manifest.value?.target?.existingSiteBookCount || 0)
const rawVaultReadyCount = computed(() => manifest.value?.summary?.booksReadyForRawPublicVault || 0)
const entrySampleMap = computed(() => new Map(publicEntrySamples.value.map((entry) => [entry.workingId, entry])))

const filteredBooks = computed(() => {
  const keyword = query.value.trim().toLowerCase()
  return books.value.filter((book) => {
    if (activeFilter.value === 'knTable' && !book.assets?.knTable) return false
    if (activeFilter.value === 'structured' && book.assets?.knTable) return false
    if (activeFilter.value === 'entryDraft' && !entrySampleFor(book)) return false
    if (activeFilter.value === 'rewrite' && book.publicRewrite?.status === 'ready') return false

    if (!keyword) return true
    return [
      book.title,
      book.primaryCategory,
      book.quality?.auditFile,
      book.assets?.knTable,
      ...(book.assets?.nkEvidence || []),
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()
      .includes(keyword)
  })
})

onMounted(async () => {
  try {
    const response = await fetch('/registry/50_book_gray_manifest.json')
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    manifest.value = await response.json()
    await loadRegistryBookCount()
    await loadPublicEntrySamples()
  } catch {
    error.value = '没有读到 /registry/50_book_gray_manifest.json，请先运行 build_50_book_gray_manifest.mjs。'
  } finally {
    loading.value = false
  }
})

async function loadPublicEntrySamples() {
  try {
    const response = await fetch('/registry/public_entry_samples.json')
    if (!response.ok) return
    const payload = await response.json()
    publicEntrySamples.value = Array.isArray(payload.entries) ? payload.entries : []
  } catch {
    publicEntrySamples.value = []
  }
}

async function loadRegistryBookCount() {
  try {
    const response = await fetch('/registry/books.json')
    if (!response.ok) return
    const payload = await response.json()
    registryBookCount.value = Array.isArray(payload.books) ? payload.books.length : 0
  } catch {
    registryBookCount.value = 0
  }
}

function evidenceLabel(book) {
  return book.assets?.knTable ? '卡片表' : '结构化依据'
}

function rewriteLabel(book) {
  if (entrySampleFor(book)?.status === 'promoted_full_nk') return '已进正式全量版'
  if (entrySampleFor(book)?.status === 'promoted_lightweight') return '已进正式轻量版'
  if (entrySampleFor(book)) return '入口稿已完成'
  if (book.publicRewrite?.status === 'ready') return '已转写'
  return '待 public rewrite'
}

function entrySampleTitle(entry) {
  if (entry?.status === 'promoted_full_nk') return '已转正式全量页'
  if (entry?.status === 'promoted_lightweight') return '已转正式轻量页'
  return '公开入口稿已完成'
}

function entrySampleFor(book) {
  return entrySampleMap.value.get(book.workingId)
}

function cleanCategory(category = '') {
  return category.replace(/^\d+_/, '') || '未分类'
}
</script>

<style scoped>
.gray-wrap {
  height: 100%;
  overflow-y: auto;
  overflow-x: hidden;
}

.gray-wrap::-webkit-scrollbar {
  width: 4px;
}

.gray-wrap::-webkit-scrollbar-thumb {
  background: var(--border-strong);
  border-radius: 999px;
}

.gray-scroll {
  max-width: 1280px;
  margin: 0 auto;
  padding: 20px 20px 72px;
  display: grid;
  gap: 16px;
}

.gray-hero,
.control-row,
.state-panel,
.gray-book {
  border: 1px solid var(--border-default);
  border-radius: 8px;
  box-shadow: var(--shadow-sm);
}

.gray-hero {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(320px, 0.42fr);
  gap: 18px;
  padding: 24px;
  background:
    linear-gradient(135deg, rgba(32, 79, 103, 0.08), rgba(95, 115, 86, 0.08)),
    rgba(255, 255, 255, 0.86);
}

.tool-kicker {
  color: var(--text-muted);
  font-size: 10px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.gray-hero h1 {
  margin-top: 10px;
  font-family: var(--font-serif);
  font-size: clamp(32px, 4.5vw, 56px);
  line-height: 1.05;
  color: var(--text-primary);
  overflow-wrap: anywhere;
}

.gray-hero p {
  max-width: 680px;
  margin-top: 12px;
  color: var(--text-secondary);
  line-height: 1.75;
}

.hero-stats {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
  align-content: end;
}

.hero-stats article {
  min-height: 104px;
  border: 1px solid rgba(32, 79, 103, 0.12);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.72);
  padding: 14px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.hero-stats span,
.book-topline,
.status-line,
.audit-line,
.search-box span {
  color: var(--text-muted);
  font-size: 11px;
}

.hero-stats strong {
  color: var(--brand);
  font-family: var(--font-serif);
  font-size: 38px;
  line-height: 1;
}

.control-row {
  padding: 14px;
  background: rgba(247, 245, 240, 0.9);
  display: flex;
  gap: 12px;
  align-items: center;
  justify-content: space-between;
}

.search-box {
  min-width: min(420px, 100%);
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  gap: 10px;
  align-items: center;
}

.search-box input {
  width: 100%;
  border: 1px solid var(--border-default);
  border-radius: 999px;
  background: var(--bg-elevated);
  color: var(--text-primary);
  padding: 9px 13px;
  outline: none;
  font-size: 13px;
}

.search-box input:focus {
  border-color: rgba(32, 79, 103, 0.35);
  box-shadow: 0 0 0 3px rgba(32, 79, 103, 0.08);
}

.filter-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: flex-end;
}

.filter-tabs button {
  border: 1px solid var(--border-default);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.74);
  color: var(--text-secondary);
  padding: 8px 11px;
  cursor: pointer;
}

.filter-tabs button.active,
.filter-tabs button:hover {
  background: var(--brand-soft);
  color: var(--brand);
  border-color: rgba(32, 79, 103, 0.22);
}

.book-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.gray-book {
  min-height: 230px;
  background: rgba(255, 255, 255, 0.86);
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.book-topline,
.status-line {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.book-topline span:last-child {
  color: var(--accent);
}

.gray-book h2 {
  color: var(--text-primary);
  font-family: var(--font-serif);
  font-size: 22px;
  line-height: 1.22;
  overflow-wrap: anywhere;
}

.gray-book p {
  color: var(--text-secondary);
  font-size: 13px;
  line-height: 1.5;
}

.status-line span {
  border: 1px solid rgba(32, 79, 103, 0.12);
  border-radius: 999px;
  background: rgba(247, 245, 240, 0.72);
  padding: 5px 8px;
  white-space: nowrap;
}

.status-line span:first-child {
  color: var(--brand);
}

.status-line span:last-child {
  color: var(--accent);
}

.gray-book dl {
  margin-top: auto;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
}

.gray-book dl div {
  border-top: 1px solid rgba(32, 79, 103, 0.1);
  padding-top: 8px;
}

.gray-book dt {
  color: var(--text-muted);
  font-size: 10px;
}

.gray-book dd {
  margin-top: 3px;
  color: var(--text-primary);
  font-size: 18px;
  font-weight: 700;
}

.audit-line {
  min-height: 30px;
  line-height: 1.45;
  overflow-wrap: anywhere;
}

.entry-draft {
  border: 1px solid rgba(95, 115, 86, 0.18);
  border-radius: 8px;
  background: rgba(95, 115, 86, 0.08);
  padding: 10px;
  display: grid;
  gap: 4px;
}

.entry-draft strong {
  color: #4f664a;
  font-size: 13px;
}

.entry-draft span {
  color: var(--text-secondary);
  font-size: 12px;
  line-height: 1.45;
}

.entry-draft small {
  color: var(--text-muted);
  font-size: 10px;
  line-height: 1.4;
  overflow-wrap: anywhere;
}

.entry-draft a {
  width: fit-content;
  color: var(--brand);
  font-size: 12px;
  text-decoration: none;
  border-bottom: 1px solid rgba(32, 79, 103, 0.22);
}

.entry-draft a:hover {
  color: var(--accent);
  border-bottom-color: rgba(191, 111, 63, 0.32);
}

.state-panel {
  min-height: 220px;
  background: rgba(255, 255, 255, 0.82);
  color: var(--text-secondary);
  display: grid;
  place-items: center;
  text-align: center;
  padding: 24px;
}

.state-panel h2 {
  color: var(--text-primary);
  font-family: var(--font-serif);
}

.loading-spinner {
  width: 24px;
  height: 24px;
  border: 2px solid var(--border-default);
  border-top-color: var(--accent);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 1120px) {
  .gray-hero,
  .book-grid {
    grid-template-columns: 1fr 1fr;
  }

  .hero-stats {
    grid-column: 1 / -1;
  }
}

@media (max-width: 720px) {
  .gray-scroll {
    padding: 14px 12px 56px;
  }

  .gray-hero,
  .book-grid,
  .control-row {
    grid-template-columns: 1fr;
  }

  .gray-hero,
  .control-row,
  .gray-book {
    padding: 14px;
  }

  .hero-stats,
  .book-grid {
    grid-template-columns: 1fr;
  }

  .control-row,
  .search-box {
    display: grid;
  }

  .filter-tabs {
    justify-content: flex-start;
  }
}
</style>
