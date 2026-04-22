const registryUrl = '/registry/books.json'

const defaultRegistry = {
  site: {
    title: '多书知识站',
    shortTitle: 'Book Hub',
    creatorLabel: 'Knowledge Library',
    creatorName: '林子-心智进化之路',
    footerNote: '复杂世界和复杂人性的同行翻译者',
    description: '把不同书的阅读地图收进同一个入口里。',
  },
  books: [],
}

let registryCache = null
const bookCache = new Map()

async function fetchJson(url) {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Failed to load ${url}`)
  }
  return response.json()
}

function buildFilters(nodeTypeMeta = {}) {
  return Object.entries(nodeTypeMeta).map(([type, meta]) => ({
    type,
    label: meta.label || type,
    color: meta.color || '#7f8790',
  }))
}

export async function loadRegistry() {
  if (registryCache) return registryCache
  try {
    registryCache = await fetchJson(registryUrl)
  } catch {
    registryCache = defaultRegistry
  }
  return registryCache
}

export async function loadBookBundle(slug) {
  if (!slug) throw new Error('Missing slug')
  if (bookCache.has(slug)) return bookCache.get(slug)

  const base = `/books/${encodeURIComponent(slug)}`
  const [site, graph, fileMap, toc, homeSections, aliasMap] = await Promise.all([
    fetchJson(`${base}/site.json`),
    fetchJson(`${base}/graph.json`),
    fetchJson(`${base}/file-map.json`),
    fetchJson(`${base}/toc.json`),
    fetchJson(`${base}/home-sections.json`),
    fetchJson(`${base}/alias-map.json`).catch(() => ({})),
  ])

  const bundle = {
    slug,
    SITE: site,
    NODE_TYPE_META: graph.nodeTypeMeta || {},
    FILTERS: graph.filters || buildFilters(graph.nodeTypeMeta),
    TOC: toc,
    HOME_SECTIONS: homeSections,
    FILE_MAP: fileMap,
    NODE_IMAGES: graph.nodeImages || {},
    NODES: graph.nodes || [],
    LINKS: graph.links || [],
    LINK_LABELS: graph.linkLabels || {},
    ALIAS_MAP: aliasMap || {},
  }

  bookCache.set(slug, bundle)
  return bundle
}
