#!/usr/bin/env node

import { access, readdir, readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const webRoot = path.resolve(__dirname, '..')
const projectRoot = path.resolve(webRoot, '..')
const publicRoot = path.join(webRoot, 'public')
const configsRoot = path.join(projectRoot, 'configs', 'books')

const errors = []
const warnings = []
const stats = {
  registryBooks: 0,
  registryTopics: 0,
  registryTools: 0,
  checkedBooks: 0,
  checkedTopics: 0,
  graphNodes: 0,
  graphLinks: 0,
  fileMapEntries: 0,
  configBooks: 0,
  publicContentFiles: 0,
}

const requiredBookFiles = [
  'site.json',
  'graph.json',
  'file-map.json',
  'toc.json',
  'home-sections.json',
]

main().catch((error) => {
  errors.push(`Unexpected validator failure: ${error.stack || error.message}`)
  printSummary()
  process.exitCode = 1
})

async function main() {
  const registry = await readJson(path.join(publicRoot, 'registry', 'books.json'), 'registry/books.json')
  const books = assertArray(registry.books, 'registry.books')
  const topics = assertArray(registry.topics || [], 'registry.topics')
  const tools = assertArray(registry.tools || [], 'registry.tools')

  stats.registryBooks = books.length
  stats.registryTopics = topics.length
  stats.registryTools = tools.length

  checkUniqueSlugs(books, 'registry.books')
  checkUniqueSlugs(topics, 'registry.topics')
  checkUniqueSlugs(tools, 'registry.tools')

  const topicSlugs = new Set(topics.map((topic) => topic.slug).filter(Boolean))
  const registryBookSlugs = new Set(books.map((book) => book.slug).filter(Boolean))

  await validateConfigs(registryBookSlugs)

  for (const topic of topics) {
    await validateTopic(topic)
  }

  for (const book of books) {
    await validateRegistryBook(book, topicSlugs)
  }

  await warnPublicBooksNotInRegistry(registryBookSlugs)
  await checkHtmlPlaceholders()

  printSummary()
  if (errors.length) process.exitCode = 1
}

async function validateConfigs(registryBookSlugs) {
  let entries = []
  try {
    entries = await readdir(configsRoot, { withFileTypes: true })
  } catch {
    warn(`configs/books directory not found: ${relative(configsRoot)}`)
    return
  }

  const configFiles = entries
    .filter((entry) => entry.isFile() && entry.name.endsWith('.book.json') && !entry.name.startsWith('_'))
    .map((entry) => entry.name)

  stats.configBooks = configFiles.length
  const seen = new Set()

  for (const fileName of configFiles) {
    const config = await readJson(path.join(configsRoot, fileName), `configs/books/${fileName}`, { warnOnly: true })
    const slug = config?.book?.slug
    if (!slug) {
      warn(`configs/books/${fileName} missing book.slug`)
      continue
    }
    if (seen.has(slug)) warn(`Duplicate config book slug: ${slug}`)
    seen.add(slug)
    if (!registryBookSlugs.has(slug)) {
      warn(`Config book "${slug}" is not present in registry/books.json`)
    }
  }
}

async function validateTopic(topic) {
  if (!topic.slug) {
    error('registry.topics contains an entry without slug')
    return
  }
  stats.checkedTopics += 1
  const topicPath = path.join(publicRoot, 'topics', topic.slug, 'topic.json')
  await assertFile(topicPath, `topics/${topic.slug}/topic.json`)
}

async function validateRegistryBook(book, topicSlugs) {
  if (!book.slug) {
    error('registry.books contains an entry without slug')
    return
  }

  const slug = book.slug
  const status = book.status || 'unknown'
  const strict = status !== 'draft'
  const bookDir = path.join(publicRoot, 'books', slug)

  if (!strict) {
    warn(`Skipping strict bundle validation for draft book "${slug}"`)
    return
  }

  stats.checkedBooks += 1
  await assertDir(bookDir, `books/${slug}`)

  for (const fileName of requiredBookFiles) {
    await assertFile(path.join(bookDir, fileName), `books/${slug}/${fileName}`)
  }

  const [site, graph, fileMap, toc, homeSections] = await Promise.all([
    readJson(path.join(bookDir, 'site.json'), `books/${slug}/site.json`),
    readJson(path.join(bookDir, 'graph.json'), `books/${slug}/graph.json`),
    readJson(path.join(bookDir, 'file-map.json'), `books/${slug}/file-map.json`),
    readJson(path.join(bookDir, 'toc.json'), `books/${slug}/toc.json`),
    readJson(path.join(bookDir, 'home-sections.json'), `books/${slug}/home-sections.json`),
  ])

  validateSiteJson(slug, book, site)
  validateBookGraph(slug, graph)
  await validateFileMap(slug, graph, fileMap)
  validateToc(slug, graph, toc)
  validateHomeSections(slug, graph, homeSections)
  await validateBookAssets(slug, book, site, graph)
  await validatePublicContentQuality(slug, book, site, fileMap)
  validateEntryTopics(slug, book, topicSlugs)
}

function validateSiteJson(slug, registryBook, site) {
  if (!site.title) warn(`books/${slug}/site.json missing title`)
  if (!site.description) warn(`books/${slug}/site.json missing description`)
  if (registryBook.title && site.title && registryBook.title !== site.title) {
    warn(`Title drift for "${slug}": registry="${registryBook.title}", site="${site.title}"`)
  }
  for (const nodeId of [...(site.recommendedPath || []), ...(site.quickLinks || [])]) {
    if (typeof nodeId !== 'string' || !nodeId.trim()) {
      warn(`books/${slug}/site.json contains an empty recommended/quick link entry`)
    }
  }
}

function validateBookGraph(slug, graph) {
  const nodes = assertArray(graph.nodes, `books/${slug}/graph.json nodes`)
  const links = assertArray(graph.links || [], `books/${slug}/graph.json links`)
  stats.graphNodes += nodes.length
  stats.graphLinks += links.length

  const nodeIds = new Set()
  for (const node of nodes) {
    if (!node?.id) {
      error(`books/${slug}/graph.json contains a node without id`)
      continue
    }
    if (nodeIds.has(node.id)) error(`books/${slug}/graph.json duplicate node id: ${node.id}`)
    nodeIds.add(node.id)
    if (!node.type) warn(`books/${slug}/graph.json node "${node.id}" missing type`)
  }

  for (const [index, link] of links.entries()) {
    const source = endpointId(link.source)
    const target = endpointId(link.target)
    if (!source || !target) {
      error(`books/${slug}/graph.json link[${index}] missing source or target`)
      continue
    }
    if (!nodeIds.has(source)) error(`books/${slug}/graph.json link[${index}] source not found: ${source}`)
    if (!nodeIds.has(target)) error(`books/${slug}/graph.json link[${index}] target not found: ${target}`)
  }
}

async function validateFileMap(slug, graph, fileMap) {
  const nodeIds = new Set(assertArray(graph.nodes || [], `books/${slug}/graph.json nodes`).map((node) => node.id))
  const entries = Object.entries(fileMap || {})
  stats.fileMapEntries += entries.length

  for (const [nodeId, urlPath] of entries) {
    if (!nodeIds.has(nodeId)) {
      warn(`books/${slug}/file-map.json has extra node not in graph: ${nodeId}`)
    }
    if (typeof urlPath !== 'string' || !urlPath) {
      error(`books/${slug}/file-map.json entry "${nodeId}" has invalid path`)
      continue
    }
    if (!urlPath.startsWith(`/books/${slug}/`)) {
      warn(`books/${slug}/file-map.json entry "${nodeId}" points outside its book directory: ${urlPath}`)
    }
    await assertPublicAsset(urlPath, `books/${slug}/file-map.json -> ${nodeId}`)
  }

  for (const nodeId of nodeIds) {
    if (!fileMap?.[nodeId]) {
      warn(`books/${slug}/graph.json node has no file-map entry: ${nodeId}`)
    }
  }
}

function validateToc(slug, graph, toc) {
  const nodeIds = new Set((graph.nodes || []).map((node) => node.id))
  if (!Array.isArray(toc)) {
    error(`books/${slug}/toc.json should be an array`)
    return
  }
  for (const item of toc) {
    for (const section of item.sections || []) {
      for (const nodeId of section.items || []) {
        if (!nodeIds.has(nodeId)) warn(`books/${slug}/toc.json references missing node: ${nodeId}`)
      }
    }
  }
}

function validateHomeSections(slug, graph, homeSections) {
  const nodeIds = new Set((graph.nodes || []).map((node) => node.id))
  if (!Array.isArray(homeSections)) {
    error(`books/${slug}/home-sections.json should be an array`)
    return
  }
  for (const section of homeSections) {
    for (const nodeId of section.nodes || []) {
      if (!nodeIds.has(nodeId)) warn(`books/${slug}/home-sections.json references missing node: ${nodeId}`)
    }
  }
}

async function validateBookAssets(slug, registryBook, site, graph) {
  await assertPublicAsset(registryBook.coverImage, `registry coverImage for ${slug}`, { warnOnly: true })
  for (const step of site.journeyMap || []) {
    await assertPublicAsset(step.image, `books/${slug}/site.json journey image "${step.node}"`, { warnOnly: true })
  }
  for (const [nodeId, urlPath] of Object.entries(graph.nodeImages || {})) {
    await assertPublicAsset(urlPath, `books/${slug}/graph.json nodeImages "${nodeId}"`, { warnOnly: true })
  }
}

async function validatePublicContentQuality(slug, registryBook, site, fileMap) {
  const isPublicStructured =
    site?.publication?.layer === 'public_structured_nk' ||
    registryBook?.publication?.layer === 'public_structured_nk'
  if (!isPublicStructured) return

  const fatalPatterns = [
    '01_sources/',
    '01_sources\\',
    '04_operations/',
    '04_operations\\',
    'configs/expansion',
    'configs\\expansion',
    'vault内容对外改写',
    'do_not_publish_raw_vault',
    'needs_3_to_5_rewritten_pages',
    '清洗正文',
    '发布前',
    'TODO',
    'FIXME',
  ]

  for (const [nodeId, urlPath] of Object.entries(fileMap || {})) {
    if (typeof urlPath !== 'string' || !urlPath.endsWith('.md')) continue
    stats.publicContentFiles += 1
    const filePath = publicAssetPath(urlPath)
    let content = ''
    try {
      content = await readFile(filePath, 'utf8')
    } catch {
      continue
    }
    for (const pattern of fatalPatterns) {
      if (content.includes(pattern)) {
        error(`books/${slug}/${nodeId} public content leaks internal marker: ${pattern}`)
      }
    }
  }
}

function validateEntryTopics(slug, book, topicSlugs) {
  for (const topicSlug of book.entryTopics || []) {
    const normalized = typeof topicSlug === 'string' ? topicSlug : topicSlug?.slug
    if (normalized && !topicSlugs.has(normalized)) {
      warn(`registry book "${slug}" references missing entry topic: ${normalized}`)
    }
  }
}

async function warnPublicBooksNotInRegistry(registryBookSlugs) {
  let entries = []
  try {
    entries = await readdir(path.join(publicRoot, 'books'), { withFileTypes: true })
  } catch {
    return
  }
  for (const entry of entries) {
    if (entry.isDirectory() && !registryBookSlugs.has(entry.name)) {
      warn(`public/books/${entry.name} exists but is not registered in registry/books.json`)
    }
  }
}

async function checkHtmlPlaceholders() {
  const htmlPath = path.join(webRoot, 'index.html')
  const html = await readFile(htmlPath, 'utf8').catch(() => '')
  if (html.includes('your-domain.example')) {
    warn('web/index.html still contains your-domain.example social meta placeholders')
  }
}

function checkUniqueSlugs(items, label) {
  const seen = new Set()
  for (const item of items) {
    if (!item?.slug) continue
    if (seen.has(item.slug)) error(`${label} duplicate slug: ${item.slug}`)
    seen.add(item.slug)
  }
}

function endpointId(value) {
  if (typeof value === 'string') return value
  if (value && typeof value === 'object') return value.id
  return ''
}

async function readJson(filePath, label, options = {}) {
  try {
    const content = await readFile(filePath, 'utf8')
    return JSON.parse(stripBom(content))
  } catch (readError) {
    const message = `${label} is missing or invalid JSON: ${readError.message}`
    if (options.warnOnly) warn(message)
    else error(message)
    return {}
  }
}

async function assertDir(dirPath, label) {
  try {
    const entries = await readdir(dirPath)
    if (!entries) error(`${label} is not readable`)
  } catch {
    error(`${label} directory is missing`)
  }
}

async function assertFile(filePath, label) {
  try {
    await access(filePath)
  } catch {
    error(`${label} file is missing`)
  }
}

async function assertPublicAsset(urlPath, label, options = {}) {
  if (!urlPath || typeof urlPath !== 'string') return
  if (/^(https?:)?\/\//i.test(urlPath) || urlPath.startsWith('data:') || urlPath.startsWith('#')) return

  const clean = urlPath.replace(/[?#].*$/, '')
  if (!clean.startsWith('/')) {
    warn(`${label} uses a non-root asset path: ${urlPath}`)
    return
  }

  const assetPath = publicAssetPath(clean)
  try {
    await access(assetPath)
  } catch {
    const message = `${label} asset is missing: ${urlPath}`
    if (options.warnOnly) warn(message)
    else error(message)
  }
}

function publicAssetPath(urlPath) {
  const clean = String(urlPath || '').replace(/[?#].*$/, '')
  return path.join(publicRoot, decodePath(clean.replace(/^\/+/, '')))
}

function assertArray(value, label) {
  if (Array.isArray(value)) return value
  error(`${label} should be an array`)
  return []
}

function stripBom(value) {
  return value.charCodeAt(0) === 0xfeff ? value.slice(1) : value
}

function decodePath(value) {
  try {
    return decodeURI(value)
  } catch {
    return value
  }
}

function error(message) {
  errors.push(message)
}

function warn(message) {
  warnings.push(message)
}

function relative(filePath) {
  return path.relative(projectRoot, filePath).replaceAll(path.sep, '/')
}

function printSummary() {
  console.log('book-kb-multi site validation')
  console.log('--------------------------------')
  console.log(`registry books: ${stats.registryBooks}`)
  console.log(`registry topics: ${stats.registryTopics}`)
  console.log(`registry tools: ${stats.registryTools}`)
  console.log(`config books: ${stats.configBooks}`)
  console.log(`checked books: ${stats.checkedBooks}`)
  console.log(`checked topics: ${stats.checkedTopics}`)
  console.log(`graph nodes: ${stats.graphNodes}`)
  console.log(`graph links: ${stats.graphLinks}`)
  console.log(`file-map entries: ${stats.fileMapEntries}`)
  console.log(`public content files: ${stats.publicContentFiles}`)
  console.log(`errors: ${errors.length}`)
  console.log(`warnings: ${warnings.length}`)

  if (errors.length) {
    console.log('\nErrors')
    for (const message of errors.slice(0, 80)) console.log(`- ${message}`)
    if (errors.length > 80) console.log(`- ...and ${errors.length - 80} more errors`)
  }

  if (warnings.length) {
    console.log('\nWarnings')
    for (const message of warnings.slice(0, 80)) console.log(`- ${message}`)
    if (warnings.length > 80) console.log(`- ...and ${warnings.length - 80} more warnings`)
  }
}
