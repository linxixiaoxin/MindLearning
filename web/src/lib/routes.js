export function parseRoute(pathname) {
  const normalized = pathname.replace(/\/+$/, '') || '/'
  if (normalized === '/' || normalized === '/books') {
    return { view: 'library', slug: '', nodeId: null }
  }

  if (normalized === '/tools/thought-partner') {
    return { view: 'thoughtPartner', slug: '', nodeId: null }
  }

  if (normalized === '/tools/problem-lab') {
    return { view: 'problemLab', slug: '', nodeId: null }
  }

  const problemLabMatch = normalized.match(/^\/tools\/problem-lab\/([^/]+)$/)
  if (problemLabMatch) {
    return { view: 'problemLab', slug: decodeSegment(problemLabMatch[1]), nodeId: null }
  }

  if (normalized === '/tools/event-lens') {
    return { view: 'eventLens', slug: '', nodeId: null }
  }

  if (normalized === '/tools/content-ops') {
    return { view: 'contentOps', slug: '', nodeId: null }
  }

  const eventLensMatch = normalized.match(/^\/tools\/event-lens\/([^/]+)$/)
  if (eventLensMatch) {
    return { view: 'eventLens', slug: decodeSegment(eventLensMatch[1]), nodeId: null }
  }

  if (normalized === '/tools/capability-paths') {
    return { view: 'capabilityPaths', slug: '', nodeId: null }
  }

  const capabilityPathsMatch = normalized.match(/^\/tools\/capability-paths\/([^/]+)$/)
  if (capabilityPathsMatch) {
    return { view: 'capabilityPaths', slug: decodeSegment(capabilityPathsMatch[1]), nodeId: null }
  }

  if (normalized === '/tools/mindset-trap-diagnostic') {
    return { view: 'mindsetTrapDiagnostic', slug: '', nodeId: null }
  }

  if (normalized === '/tools/leadership-mindset-assessment') {
    return { view: 'leadershipMindsetAssessment', slug: '', nodeId: null }
  }

  if (normalized === '/tools/gray-books') {
    return { view: 'grayBooks', slug: '', nodeId: null }
  }

  if (normalized === '/tools/space-browser') {
    return { view: 'spaceBrowser', slug: '', nodeId: null }
  }

  if (normalized === '/tools/learning-paths') {
    return { view: 'learningPaths', slug: '', nodeId: null }
  }

  const learningPathMatch = normalized.match(/^\/tools\/learning-paths\/([^/]+)$/)
  if (learningPathMatch) {
    return { view: 'learningPaths', slug: decodeSegment(learningPathMatch[1]), nodeId: null }
  }

  const thinkerMatch = normalized.match(/^\/tools\/thought-partner\/thinkers\/([^/]+)$/)
  if (thinkerMatch) {
    return { view: 'thinkerProfile', slug: decodeSegment(thinkerMatch[1]), nodeId: null }
  }

  const topicMatch = normalized.match(/^\/topics\/([^/]+)$/)
  if (topicMatch) {
    return { view: 'topic', slug: decodeSegment(topicMatch[1]), nodeId: null }
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
    return { view: 'graph', slug: decodeSegment(graphMatch[1]), nodeId: null }
  }

  const bookMatch = normalized.match(/^\/books\/([^/]+)$/)
  if (bookMatch) {
    return { view: 'home', slug: decodeSegment(bookMatch[1]), nodeId: null }
  }

  return { view: 'library', slug: '', nodeId: null }
}

export function routeToUrl(targetView, slug, nodeId) {
  if (targetView === 'thoughtPartner') return '/tools/thought-partner'
  if (targetView === 'problemLab') {
    return slug ? `/tools/problem-lab/${encodeURIComponent(slug)}` : '/tools/problem-lab'
  }
  if (targetView === 'eventLens') {
    return slug ? `/tools/event-lens/${encodeURIComponent(slug)}` : '/tools/event-lens'
  }
  if (targetView === 'contentOps') return '/tools/content-ops'
  if (targetView === 'capabilityPaths') {
    return slug ? `/tools/capability-paths/${encodeURIComponent(slug)}` : '/tools/capability-paths'
  }
  if (targetView === 'mindsetTrapDiagnostic') return '/tools/mindset-trap-diagnostic'
  if (targetView === 'leadershipMindsetAssessment') return '/tools/leadership-mindset-assessment'
  if (targetView === 'grayBooks') return '/tools/gray-books'
  if (targetView === 'spaceBrowser') return '/tools/space-browser'
  if (targetView === 'learningPaths') {
    return slug ? `/tools/learning-paths/${encodeURIComponent(slug)}` : '/tools/learning-paths'
  }
  if (targetView === 'thinkerProfile') return `/tools/thought-partner/thinkers/${encodeURIComponent(slug)}`
  if (!slug || targetView === 'library') return '/books'

  const safeSlug = encodeURIComponent(slug)
  if (targetView === 'topic') return `/topics/${safeSlug}`
  if (targetView === 'graph') return `/books/${safeSlug}/graph`
  if (targetView === 'reader' && nodeId) return `/books/${safeSlug}/note/${encodeURIComponent(nodeId)}`
  return `/books/${safeSlug}`
}

export function resolveNodeId(bookData, nodeId) {
  if (!nodeId || !bookData) return null
  const normalizedId = normalizeNodeId(nodeId)
  if (!normalizedId) return null

  if (bookData.FILE_MAP?.[normalizedId]) return normalizedId

  const fromAlias = bookData.ALIAS_MAP?.[normalizedId]
  if (fromAlias && bookData.FILE_MAP?.[fromAlias]) return fromAlias

  const byFileStem = findNodeIdByFileStem(bookData, normalizedId)
  if (byFileStem) return byFileStem

  const byNodeId = findNodeIdByCanonicalId(bookData, normalizedId)
  if (byNodeId) return byNodeId

  const bySimilarity = findNodeIdBySimilarity(bookData, normalizedId)
  if (bySimilarity) return bySimilarity

  return normalizedId
}

function findNodeIdByFileStem(bookData, normalizedId) {
  if (!bookData.FILE_MAP) return null
  const entries = Object.entries(bookData.FILE_MAP)
  for (const [nodeId, filePath] of entries) {
    if (normalizeNodeId(markdownStem(filePath)) === normalizedId) return nodeId
    if (normalizeNodeId(nodeId) === normalizedId) return nodeId
  }
  return null
}

function findNodeIdByCanonicalId(bookData, normalizedId) {
  const nodes = bookData.NODES || []
  for (const node of nodes) {
    if (normalizeNodeId(node?.id) === normalizedId) return node.id
  }
  return null
}

function findNodeIdBySimilarity(bookData, normalizedId) {
  const normalized = normalizeNodeText(normalizedId)
  const match = normalized.match(/^(.*?)(\d+)$/)
  if (!match) return null

  const targetNumber = match[2]
  const targetCore = normalizeNodeText(match[1])

  const candidates = new Set([
    ...Object.keys(bookData.FILE_MAP || {}),
    ...((bookData.NODES || []).map((node) => node?.id).filter(Boolean)),
  ])

  let bestMatch = null
  let bestDistance = Number.POSITIVE_INFINITY

  for (const candidate of candidates) {
    const normalizedCandidate = normalizeNodeText(candidate)
    const candidateMatch = normalizedCandidate.match(/^(.*?)(\d+)$/)
    if (!candidateMatch) continue
    if (candidateMatch[2] !== targetNumber) continue

    const candidateCore = normalizeNodeText(candidateMatch[1])
    if (!candidateCore) continue

    if (candidateCore.includes(targetCore) || targetCore.includes(candidateCore)) {
      return candidate
    }

    const distance = levenshteinDistance(candidateCore, targetCore)
    if (distance < bestDistance) {
      bestDistance = distance
      bestMatch = candidate
    }
  }

  if (bestDistance <= 2) return bestMatch
  return null
}

function normalizeNodeText(value) {
  return normalizeNodeId(value).replace(/\s+/g, '')
}

function levenshteinDistance(left, right) {
  const leftText = String(left || '')
  const rightText = String(right || '')
  const aLen = leftText.length
  const bLen = rightText.length

  if (aLen === 0) return bLen
  if (bLen === 0) return aLen

  let previousRow = new Array(bLen + 1)
  let currentRow = new Array(bLen + 1)

  for (let j = 0; j <= bLen; j += 1) {
    previousRow[j] = j
  }

  for (let i = 1; i <= aLen; i += 1) {
    currentRow[0] = i
    for (let j = 1; j <= bLen; j += 1) {
      const cost = leftText[i - 1] === rightText[j - 1] ? 0 : 1
      currentRow[j] = Math.min(
        previousRow[j] + 1,
        currentRow[j - 1] + 1,
        previousRow[j - 1] + cost,
      )
    }

    const swap = previousRow
    previousRow = currentRow
    currentRow = swap
  }

  return previousRow[bLen]
}

function markdownStem(value) {
  if (!value) return ''
  const clean = String(value).replace(/[?#].*$/, '')
  const parts = clean.split('/').filter(Boolean)
  const last = parts[parts.length - 1] || ''
  return decodeURIComponent(last).replace(/\.md$/i, '')
}

function normalizeNodeId(value) {
  return String(value || '')
    .replace(/\u00A0/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function decodeSegment(value) {
  try {
    return decodeURIComponent(value.replace(/\+/g, ' ')).trim()
  } catch {
    return value.replace(/\+/g, ' ').trim()
  }
}
