export function groupAliasesByNode(aliasMap = {}) {
  const grouped = {}
  for (const [alias, nodeId] of Object.entries(aliasMap)) {
    if (!grouped[nodeId]) grouped[nodeId] = []
    grouped[nodeId].push(alias)
  }
  return grouped
}

export function buildCurrentBookSearchEntries({ bookData, slug, aliasGroups = {} }) {
  if (!bookData) return []
  const bookTitle = bookData?.SITE?.title || bookData?.SITE?.shortTitle || ''

  return (bookData.NODES || []).map((node) =>
    buildNodeSearchEntry({
      slug,
      bookTitle,
      node,
      aliases: aliasGroups[node.id] || [],
      nodeTypeMeta: bookData?.NODE_TYPE_META || {},
    }),
  )
}

export function buildNodeSearchEntry({
  slug,
  bookTitle,
  bookShortTitle,
  author,
  node,
  aliases = [],
  nodeTypeMeta = {},
  context = '',
}) {
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

export function buildBookSearchEntry(book, bundle) {
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

export function buildTopicSearchEntry(topic) {
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

export function buildToolSearchEntry(tool) {
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

export function scoreSearchEntry(entry, query) {
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

function normalizeSearchText(...parts) {
  return parts.filter(Boolean).join(' ').toLowerCase()
}
