#!/usr/bin/env node

import { createHash } from 'node:crypto'
import { access, mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.resolve(__dirname, '..')
const workspaceRoot = path.resolve(projectRoot, '..', '..', '..')
const webPublicRoot = path.join(projectRoot, 'web', 'public')
const configsRoot = path.join(projectRoot, 'configs', 'books')
const overrideRoot = path.join(projectRoot, 'configs', 'public_overrides')
const registryPath = path.join(webPublicRoot, 'registry', 'books.json')
const generatedAt = '2026-05-03'

const args = new Set(process.argv.slice(2))
const includePromoted = args.has('--include-promoted')
const dryRun = args.has('--dry-run')
const targetValue = valueForArg('--book') || valueForArg('--working-id')
const limit = Number(valueForArg('--limit') || 0)
const manifestPath = resolveProjectPath(
  valueForArg('--manifest') || 'configs/expansion/50_book_gray_manifest.json',
)
const publicManifestPath = resolveProjectPath(
  valueForArg('--public-manifest') || 'web/public/registry/50_book_gray_manifest.json',
)
const statusFilter = valueForArg('--status')

const manualSlugs = {
  'gray-001-fb557939': 'good-thinking',
  'gray-002-4a5f7268': 'model-thinking',
  'gray-003-63d2f5ab': 'thinking-fast-and-slow',
  'gray-004-a1a4ef0e': 'nonviolent-communication',
  'gray-005-7529e060': 'smart-notes',
  'gray-006-198ef10a': 'second-brain',
  'gray-007-0b3ebb28': 'note-method',
  'gray-008-b710bb2f': 'how-to-read-a-book',
  'gray-009-0c895cde': 'good-learning',
  'gray-010-adcb54cc': 'deep-work',
  'gray-011-3cd4b2fd': 'asking-right-questions',
  'gray-012-0aa92157': 'thinking-in-systems',
  'gray-013-52bcbde7': 'difficult-conversations',
  'gray-014-8d1f8ef7': 'communication-method',
  'gray-015-89ef2bc6': 'pyramid-principle',
  'gray-016-aaa3b27b': 'everything-about-speaking',
  'gray-017-dd9fdf2d': 'why-wont-you-apologize',
  'gray-018-0643cf88': 'art-of-travel',
  'gray-019-d80c2d7c': 'status-anxiety',
  'gray-020-1553ae65': 'news-disquiet',
  'gray-021-0dbd7d47': 'architecture-of-happiness',
  'gray-022-1cc89050': 'ways-of-seeing',
  'gray-023-82533da5': 'poetics-of-space',
  'gray-024-ef577adf': 'escape-from-freedom',
  'gray-025-85f87222': 'presentation-of-self',
  'gray-026-7391f02c': 'speechcraft-guide',
  'gray-027-11571d56': 'five-languages-of-apology',
  'gray-028-5b1126e0': 'twelve-rules-for-life',
  'gray-029-a3e51beb': 'life-mastery-trilogy',
  'gray-030-b36f6fe2': 'eight-thousand-hours',
  'gray-031-78fd3327': 'inner-winner',
  'gray-032-bcb36f71': 'deliberate-practice',
  'gray-033-bbe399b8': 'effective-reading-notes',
  'gray-034-d9c438f0': 'mini-habits',
  'gray-035-7652b8bc': 'time-as-friend',
  'gray-036-249e2c80': 'frame-thinking',
  'gray-037-c83a4ed8': 'gameful-learning',
  'gray-038-0e363c16': 'fogg-behavior-model',
  'gray-039-eda35e73': 'poor-charlies-almanack',
  'gray-040-24bb23a1': 'refinement',
  'gray-041-99435204': 'lifelong-learning',
  'gray-042-dab33db8': 'workplace-mastery',
  'gray-043-96c03899': 'cognitive-awakening',
  'gray-044-7c251251': 'negative-positive-life',
  'gray-045-6c25a597': 'reading-is-enough',
  'gray-046-f7c9c028': 'seven-habits',
  'gray-047-a11e3ec1': 'logic-of-world',
  'gray-048-27575990': 'life-patterns',
  'gray-049-803ed3e4': 'systems-thinking',
  'gray-050-0c88123c': 'critical-thinking-writing',
}

const nodeTypeMeta = {
  topic: { label: '入口', color: '#6d5c93', size: 11 },
  summary: { label: '摘要', color: '#204f67', size: 11 },
  question: { label: '问题', color: '#2e5670', size: 10 },
  logic: { label: '逻辑链', color: '#4f7386', size: 9 },
  chapter: { label: '章节', color: '#3f6f84', size: 10 },
  concept: { label: '概念', color: '#6f8d66', size: 10 },
  method: { label: '方法', color: '#bf6f3f', size: 10 },
  scenario: { label: '场景', color: '#9b6a57', size: 9 },
  case: { label: '案例', color: '#8d6b44', size: 9 },
  expression: { label: '表达延展', color: '#9d5667', size: 8 },
  warning: { label: '误读提醒', color: '#7f8790', size: 8 },
  relation: { label: '跨书连接', color: '#6a6f8a', size: 8 },
}

const groupDefs = [
  { id: 'summary', title: '全书入口', subtitle: '先拿总地图', desc: '从入口、摘要和逻辑链开始理解整本书。', color: '#204f67' },
  { id: 'questions', title: '核心问题', subtitle: 'K 卡问题入口', desc: '这些问题决定了读者为什么需要这本书。', color: '#2e5670' },
  { id: 'chapters', title: '章节地图', subtitle: '按原书推进', desc: '把章节功能、核心问题和上下文关系接起来。', color: '#3f6f84' },
  { id: 'concepts', title: '核心概念', subtitle: 'N 卡概念层', desc: '保留定义、解决的问题、边界和关联概念。', color: '#6f8d66' },
  { id: 'methods', title: '方法动作', subtitle: '行动或判断', desc: '把理解推进到可判断、可练习、可复盘的动作。', color: '#bf6f3f' },
  { id: 'scenarios', title: '场景与案例', subtitle: '现实入口', desc: '用典型场景和案例证据把抽象概念落回现实。', color: '#9b6a57' },
  { id: 'extensions', title: '表达延展', subtitle: '选题与视觉', desc: '保留问题切入、视觉钩子、误读提醒和跨书连接。', color: '#9d5667' },
]

const publicUnsafeTextPatterns = [
  /历届茅盾文学奖/,
  /年度图书销售排行榜/,
  /25岁前一定要读/,
  /有生之年[，,].*一定要看.*名著/,
  /美国亚马逊编辑推荐/,
  /^F\d{2,}[\dA-Z.\- ]*$/i,
  /^Erfolgsmodelle$/i,
  /^下口$/,
  /口\s*0\s*口\s*0|翌口|丬代|自\s*L\s*能\s*h/i,
]

const manualSourceRepairBooks = new Map([
  ['book-c7bed1c989', '抽样发现《商业模式新生代（个人）》混入价值投资概念，需要回源修复结构化资产。'],
])

main().catch((error) => {
  console.error(error)
  process.exit(1)
})

async function main() {
  const manifest = await readJson(manifestPath)
  const registry = await readJson(registryPath)
  const existingRegistryBySlug = new Map((registry.books || []).map((book) => [book.slug, book]))

  const allGrayBooks = (manifest.books || []).map((book) => normalizeGrayBook(book))
  const uniqueGrayBooks = dedupeBooksBySlug(allGrayBooks)
  await mkdir(configsRoot, { recursive: true })

  for (const book of uniqueGrayBooks) {
    await writeBookConfig(book)
  }

  let targets = uniqueGrayBooks.filter((book) => targetMatches(book))
  if (!includePromoted) {
    targets = targets.filter((book) => book.publicRewrite?.status !== 'promoted_full_nk')
  }
  if (statusFilter) {
    targets = targets.filter((book) => book.publicRewrite?.status === statusFilter)
  }
  if (limit > 0) targets = targets.slice(0, limit)

  const builtBooks = []
  const reports = []

  for (const book of targets) {
    const structured = await readJson(path.join(workspaceRoot, book.assets.structuredJson))
    const config = buildConfig(book, structured)
    const bundle = await buildPublicStructuredBundle(config, structured)
    reports.push({
      slot: book.slot,
      slug: config.slug,
      title: config.title,
      nodes: bundle.graph.nodes.length,
      links: bundle.graph.links.length,
      files: Object.keys(bundle.fileMap).length,
    })
    builtBooks.push(buildRegistryBook(config, bundle))
    if (!dryRun) await writeBookBundle(config, bundle)
  }

  if (!dryRun) {
    const builtSlugSet = new Set(builtBooks.map((book) => book.slug))
    registry.books = [
      ...(registry.books || []).filter((book) => !builtSlugSet.has(book.slug)),
      ...builtBooks,
    ]
    await writeJson(registryPath, registry)
    await updateGrayManifest(manifestPath, builtBooks, allGrayBooks)
    await updateGrayManifest(publicManifestPath, builtBooks, allGrayBooks)
  }

  console.log(`public_structured_nk targets: ${targets.length}`)
  if (includePromoted) console.log('includePromoted: true')
  if (dryRun) console.log('dryRun: true')
  for (const item of reports) {
    const existing = existingRegistryBySlug.has(item.slug) ? ' updated' : ''
    console.log(`${String(item.slot).padStart(2, '0')} ${item.slug}: nodes=${item.nodes}, links=${item.links}, files=${item.files}${existing}`)
  }
}

function normalizeGrayBook(book) {
  const slug = book.publicSlug || manualSlugs[book.workingId] || fallbackSlug(book.title, book.workingId)
  return {
    ...book,
    slug,
    cleanCategory: cleanCategory(book.primaryCategory),
  }
}

function targetMatches(book) {
  if (!targetValue) return true
  return [book.slug, book.workingId, book.title].includes(targetValue)
}

function dedupeBooksBySlug(books) {
  const seen = new Set()
  const unique = []
  for (const book of books) {
    if (seen.has(book.slug)) continue
    seen.add(book.slug)
    unique.push(book)
  }
  return unique
}

function buildConfig(book, structured) {
  const meta = structured.book_metadata || {}
  const palette = paletteForCategory(book.cleanCategory)
  const shortTitle = shortTitleFor(book.title)
  const publicSanity = analyzePublicSanity(structured, book.slug)
  const subtitle = firstNonEmpty(
    meta.core_one_liner,
    structured.book_skeleton?.main_problem,
    structured.book_skeleton?.one_sentence_structure,
    `${shortTitle} 的结构化知识地图`,
  )

  return {
    workingId: book.workingId,
    slot: book.slot,
    slug: book.slug,
    title: titleForPublic(book.title),
    shortTitle,
    author: normalizeAuthor(meta.author),
    primaryCategory: book.cleanCategory,
    secondaryCategory: meta.asset_profile || '',
    subtitle: truncate(cleanText(subtitle), 42),
    heroOverline: heroOverlineFor(book.cleanCategory),
    entryTopics: entryTopicsFor(book.cleanCategory),
    source: {
      assetsDir: book.assets.assetsDir,
      structuredJson: book.assets.structuredJson,
      summaryMarkdown: book.assets.summaryMarkdown,
      topicAnglesMarkdown: book.assets.topicAnglesMarkdown,
      visualHooksMarkdown: book.assets.visualHooksMarkdown,
      knTable: book.assets.knTable,
    },
    publication: {
      layer: 'public_structured_nk',
      curationStatus: publicSanity.blockerCount > 0 ? 'needs_source_repair' : 'needs_curated_overrides',
      sourceVisibility: 'private_source',
      generatedFrom: generatedFrom(book),
      overrideDir: `configs/public_overrides/${book.slug}`,
      publicSanity,
    },
    palette,
  }
}

async function buildPublicStructuredBundle(config, structured) {
  const ctx = createBuildContext(config)
  const overview = addNode(ctx, '公开入口', 'topic', '从公开入口进入整本书的问题地图。', 'summary', renderOverview(config, structured))
  const summary = addNode(ctx, '全书摘要', 'summary', '用短摘要和标准摘要快速把握整本书。', 'summary', renderSummary(config, structured))
  const skeleton = addNode(ctx, '全书结构', 'summary', '主问题、核心转向、最终落点和章节推进。', 'summary', renderSkeleton(config, structured))

  link(ctx, overview.id, summary.id, '先读摘要')
  link(ctx, overview.id, skeleton.id, '再看结构')

  addStringCards(ctx, structured.core_questions || [], 'question', 'questions', (text, index) => ({
    title: text,
    tagline: `核心问题 ${index + 1}`,
    markdown: renderQuestion(config, text, index),
    linkLabel: '问题入口',
  }))

  addObjectCards(ctx, structured.k_cards || [], 'question', 'questions', (item, index) => ({
    title: item.title || item.id || `K 卡 ${index + 1}`,
    tagline: item.claim || item.question || '',
    markdown: renderKCard(config, item, index),
    linkLabel: 'K 卡',
  }))

  addStringCards(ctx, structured.logic_chain || [], 'logic', 'summary', (text, index) => ({
    title: `逻辑链 ${index + 1}`,
    tagline: text,
    markdown: renderLogic(config, text, index),
    linkLabel: '论证推进',
  }))

  addObjectCards(ctx, structured.chapter_map || [], 'chapter', 'chapters', (item, index) => ({
    title: item.section_name || `章节 ${index + 1}`,
    tagline: item.role_in_book || item.core_problem || '',
    markdown: renderChapter(config, item, index),
    linkLabel: '章节推进',
    relatedNames: toArray(item.matched_concepts),
  }))

  addObjectCards(ctx, structured.n_cards || [], 'concept', 'concepts', (item, index) => ({
    title: item.name || `N 卡 ${index + 1}`,
    tagline: item.note || item.definition || item.type || '',
    markdown: renderNCard(config, item, index),
    linkLabel: 'N 卡',
  }))

  addObjectCards(ctx, structured.core_concepts || [], 'concept', 'concepts', (item, index) => ({
    title: item.name || `核心概念 ${index + 1}`,
    tagline: item.definition || item.solves_what || '',
    markdown: renderConcept(config, item, index),
    linkLabel: '概念支撑',
    relatedNames: toArray(item.related_concepts),
  }))

  addObjectCards(ctx, structured.theme_units || [], 'concept', 'concepts', (item, index) => ({
    title: item.title || `主题单元 ${index + 1}`,
    tagline: item.focus || '',
    markdown: renderThemeUnit(config, item, index),
    linkLabel: '主题单元',
    relatedNames: toArray(item.concepts),
  }))

  addObjectCards(ctx, structured.key_methods_and_actions || [], 'method', 'methods', (item, index) => ({
    title: item.name || `方法动作 ${index + 1}`,
    tagline: item.when_to_use || item.expected_effect || '',
    markdown: renderMethod(config, item, index),
    linkLabel: '行动方法',
  }))

  addObjectCards(ctx, structured.canonical_scenarios || [], 'scenario', 'scenarios', (item, index) => ({
    title: item.scenario || `典型场景 ${index + 1}`,
    tagline: item.what_it_shows || '',
    markdown: renderScenario(config, item, index),
    linkLabel: '场景入口',
    relatedNames: toArray(item.linked_concepts),
  }))

  addObjectCards(ctx, structured.case_bank || [], 'case', 'scenarios', (item, index) => ({
    title: item.case_name || item.case_id || `案例 ${index + 1}`,
    tagline: item.case_summary || item.what_it_proves || '',
    markdown: renderCase(config, item, index),
    linkLabel: '案例证据',
    relatedNames: toArray(item.linked_concepts),
  }))

  addObjectCards(ctx, structured.xiaohongshu_topics || [], 'expression', 'extensions', (item, index) => ({
    title: item.title || `问题切入 ${index + 1}`,
    tagline: item.pain_point || item.core_contradiction || '',
    markdown: renderTopicAngle(config, item, index),
    linkLabel: '问题切入',
    relatedNames: [...toArray(item.must_keep_concepts), ...toArray(item.candidate_scenarios)],
  }))

  addStringCards(ctx, structured.content_translation?.topic_angles || [], 'expression', 'extensions', (text, index) => ({
    title: `内容切入 ${index + 1}`,
    tagline: text,
    markdown: renderExpressionString(config, '内容切入', text, index),
    linkLabel: '内容切入',
  }))

  addObjectCards(ctx, structured.visual_hooks || [], 'expression', 'extensions', (item, index) => ({
    title: item.hook_name || `视觉钩子 ${index + 1}`,
    tagline: item.content || item.structure || '',
    markdown: renderVisualHook(config, item, index),
    linkLabel: '视觉表达',
  }))

  addStringCards(ctx, structured.content_translation?.visual_hooks || [], 'expression', 'extensions', (text, index) => ({
    title: `视觉钩子 ${index + 1}`,
    tagline: text,
    markdown: renderExpressionString(config, '视觉钩子', text, index),
    linkLabel: '视觉表达',
  }))

  addObjectCards(ctx, structured.misreadings || [], 'warning', 'extensions', (item, index) => ({
    title: item.common_misreading || `误读提醒 ${index + 1}`,
    tagline: item.better_understanding || '',
    markdown: renderMisreading(config, item, index),
    linkLabel: '避免误读',
  }))

  addObjectCards(ctx, structured.cross_book_links || [], 'relation', 'extensions', (item, index) => ({
    title: item.theme || `跨书连接 ${index + 1}`,
    tagline: item.reason || '',
    markdown: renderCrossBookLink(config, item, index),
    linkLabel: '跨书连接',
  }))

  addStringCards(ctx, structured.dense_phrases || [], 'expression', 'extensions', (text, index) => ({
    title: `高密度句 ${index + 1}`,
    tagline: text,
    markdown: renderExpressionString(config, '高密度句', text, index),
    linkLabel: '表达句',
  }))

  connectRelatedNames(ctx)
  await applyOverrides(config, ctx)

  const overviewImage = `/books/${config.slug}/chapter-images/overview.svg`
  const nodeImages = Object.fromEntries(ctx.nodes.map((node) => [node.id, overviewImage]))
  const toc = buildToc(ctx)
  const homeSections = buildHomeSections(ctx)
  const journeyMap = buildJourneyMap(ctx, overviewImage)
  const stats = [
    { label: '公开节点', value: String(ctx.nodes.length) },
    { label: 'K 卡', value: String(ctx.groupCounts.questions || 0) },
    { label: 'N 卡 / 概念', value: String(ctx.groupCounts.concepts || 0) },
    { label: '章节', value: String(ctx.groupCounts.chapters || 0) },
  ]

  const site = {
    title: config.title,
    shortTitle: config.shortTitle,
    subtitle: config.subtitle,
    description: `基于《${config.title}》已通过质检的结构化资产，生成 public_structured_nk 基础公开层：入口、摘要、K/N 卡、章节、概念、场景和表达延展节点。`,
    heroOverline: config.heroOverline,
    heroTitleLines: [config.shortTitle, config.subtitle],
    creatorName: '林子-心智进化之路',
    creatorLabel: '整理与输出',
    footerNote: '复杂世界和复杂人性的同行翻译者',
    assetVersion: '20260503-public-structured-nk',
    publication: config.publication,
    searchPlaceholder: `搜索《${config.shortTitle}》问题、概念、章节、方法、场景…`,
    recommendedPath: journeyMap.map((item) => item.node),
    quickLinks: [
      '全书摘要',
      '全书结构',
      firstNodeId(ctx, 'questions'),
      firstNodeId(ctx, 'concepts'),
      firstNodeId(ctx, 'chapters'),
      firstNodeId(ctx, 'scenarios'),
    ].filter(Boolean),
    journeyOverline: 'Structured Knowledge Map',
    journeyTitle: '基础公开阅读路径',
    journeyDescription: '先从全书摘要和主问题进入，再沿章节、概念、方法和场景向下展开。',
    journeyEntryLabel: '从全书摘要进入',
    journeyMap,
    stats,
    slug: config.slug,
    author: config.author,
    primaryCategory: config.primaryCategory,
    secondaryCategory: config.secondaryCategory,
  }

  return {
    site,
    toc,
    homeSections,
    graph: {
      nodeTypeMeta,
      filters: Object.entries(nodeTypeMeta).map(([type, meta]) => ({ type, label: meta.label, color: meta.color })),
      nodeImages,
      nodes: ctx.nodes,
      links: dedupeLinks(ctx.links),
      linkLabels: ctx.linkLabels,
    },
    fileMap: ctx.fileMap,
    aliasMap: ctx.aliasMap,
    markdownFiles: ctx.markdownFiles,
    coverSvg: buildCoverSvg(config),
  }
}

function createBuildContext(config) {
  return {
    config,
    nodes: [],
    links: [],
    linkLabels: {},
    fileMap: {},
    aliasMap: {},
    markdownFiles: new Map(),
    usedIds: new Set(),
    firstByGroup: {},
    groupItems: new Map(groupDefs.map((group) => [group.id, []])),
    groupCounts: {},
    relatedQueue: [],
  }
}

function addNode(ctx, title, type, tagline, groupId, markdown, options = {}) {
  const id = uniqueId(ctx, cleanTitle(title) || `${type}-${ctx.nodes.length + 1}`)
  const node = { id, type, tagline: truncate(cleanText(tagline), 180) }
  ctx.nodes.push(node)
  ctx.fileMap[id] = `/books/${ctx.config.slug}/vault/公开/${id}.md`
  ctx.markdownFiles.set(id, markdown)
  ctx.aliasMap[title] = id
  ctx.aliasMap[id] = id
  for (const alias of options.aliases || []) {
    if (alias) ctx.aliasMap[alias] = id
  }
  if (groupId) {
    if (!ctx.firstByGroup[groupId]) ctx.firstByGroup[groupId] = id
    ctx.groupItems.get(groupId)?.push(id)
    ctx.groupCounts[groupId] = (ctx.groupCounts[groupId] || 0) + 1
  }
  return node
}

function addStringCards(ctx, items, type, groupId, mapper) {
  toArray(items).filter(Boolean).forEach((text, index) => {
    const cleaned = cleanText(text)
    if (!cleaned) return
    if (isUnsafePublicText(cleaned)) return
    const mapped = mapper(cleaned, index)
    const node = addNode(ctx, mapped.title, type, mapped.tagline, groupId, mapped.markdown)
    link(ctx, '公开入口', node.id, mapped.linkLabel)
  })
}

function addObjectCards(ctx, items, type, groupId, mapper) {
  toArray(items).filter(Boolean).forEach((item, index) => {
    const mapped = mapper(item, index)
    const cleanedTitle = cleanText(mapped.title)
    if (!cleanedTitle) return
    if (isUnsafePublicText(cleanedTitle)) return
    const node = addNode(ctx, mapped.title, type, mapped.tagline, groupId, mapped.markdown, { aliases: mapped.aliases })
    link(ctx, '公开入口', node.id, mapped.linkLabel)
    for (const related of mapped.relatedNames || []) {
      ctx.relatedQueue.push({ source: node.id, targetName: related, label: '相关概念' })
    }
  })
}

function connectRelatedNames(ctx) {
  for (const item of ctx.relatedQueue) {
    const target = ctx.aliasMap[item.targetName]
    if (target && target !== item.source) link(ctx, item.source, target, item.label)
  }
}

function link(ctx, source, target, label) {
  const resolvedSource = ctx.aliasMap[source] || source
  const resolvedTarget = ctx.aliasMap[target] || target
  if (!resolvedSource || !resolvedTarget || resolvedSource === resolvedTarget) return
  ctx.links.push({ source: resolvedSource, target: resolvedTarget, type: 'relates' })
  ctx.linkLabels[`${resolvedSource}→${resolvedTarget}`] = label
}

function buildToc(ctx) {
  return groupDefs
    .map((group) => ({
      id: group.id,
      label: group.title,
      color: group.color,
      sections: [{ label: group.subtitle, items: ctx.groupItems.get(group.id) || [] }],
    }))
    .filter((group) => group.sections[0].items.length)
}

function buildHomeSections(ctx) {
  return groupDefs
    .map((group) => ({
      id: group.id,
      title: group.title,
      subtitle: group.subtitle,
      desc: group.desc,
      color: group.color,
      nodes: (ctx.groupItems.get(group.id) || []).slice(0, 12),
    }))
    .filter((section) => section.nodes.length)
}

function buildJourneyMap(ctx, overviewImage) {
  const steps = [
    ['LV.0', '入口总览', '全书摘要', '先用摘要建立这本书的主问题和整体结构。'],
    ['LV.1', '问题入口', firstNodeId(ctx, 'questions'), '从核心问题进入，判断这本书到底在处理什么卡点。'],
    ['LV.2', '章节推进', firstNodeId(ctx, 'chapters'), '沿章节地图看清原书推进顺序和每章功能。'],
    ['LV.3', '概念骨架', firstNodeId(ctx, 'concepts'), '进入核心概念，理解这本书的关键判断工具。'],
    ['LV.4', '行动与场景', firstNodeId(ctx, 'methods') || firstNodeId(ctx, 'scenarios'), '把理解落到方法动作、场景和案例证据。'],
  ].filter(([, , node]) => node)

  return steps.map(([level, stage, node, summary], index) => ({
    level,
    stage,
    node,
    image: overviewImage,
    summary,
    bridgeToNext: index < steps.length - 1 ? '读完这一层，再进入下一层继续展开。' : '',
  }))
}

function firstNodeId(ctx, groupId) {
  return ctx.firstByGroup[groupId] || ''
}

function buildRegistryBook(config, bundle) {
  return {
    slug: config.slug,
    title: config.title,
    shortTitle: config.shortTitle,
    author: config.author,
    primaryCategory: config.primaryCategory,
    secondaryCategory: config.secondaryCategory,
    status: 'active',
    publication: config.publication,
    description: `已生成 public_structured_nk 基础公开层：入口、摘要、K/N 卡、章节、概念、场景和表达延展，共 ${bundle.graph.nodes.length} 个公开节点。`,
    coverImage: `/books/${config.slug}/chapter-images/overview.svg`,
    entryTopics: config.entryTopics,
    stats: [
      { label: '公开节点', value: String(bundle.graph.nodes.length) },
      { label: '核心问题', value: String(bundle.site.stats.find((item) => item.label === 'K 卡')?.value || 0) },
      { label: '核心概念', value: String(bundle.site.stats.find((item) => item.label === 'N 卡 / 概念')?.value || 0) },
      { label: '章节', value: String(bundle.site.stats.find((item) => item.label === '章节')?.value || 0) },
    ],
  }
}

async function writeBookBundle(config, bundle) {
  const bookDir = path.join(webPublicRoot, 'books', config.slug)
  const chapterImageDir = path.join(bookDir, 'chapter-images')
  const vaultDir = path.join(bookDir, 'vault', '公开')
  const resolvedBookDir = path.resolve(bookDir)
  const resolvedVaultDir = path.resolve(vaultDir)
  if (!resolvedVaultDir.startsWith(`${resolvedBookDir}${path.sep}`)) {
    throw new Error(`Refuse to clean generated vault outside book dir: ${resolvedVaultDir}`)
  }
  await rm(resolvedVaultDir, { recursive: true, force: true })
  await mkdir(chapterImageDir, { recursive: true })
  await mkdir(vaultDir, { recursive: true })

  await writeJson(path.join(bookDir, 'site.json'), bundle.site)
  await writeJson(path.join(bookDir, 'toc.json'), bundle.toc)
  await writeJson(path.join(bookDir, 'home-sections.json'), bundle.homeSections)
  await writeJson(path.join(bookDir, 'graph.json'), bundle.graph)
  await writeJson(path.join(bookDir, 'file-map.json'), bundle.fileMap)
  await writeJson(path.join(bookDir, 'alias-map.json'), bundle.aliasMap)
  await writeFile(path.join(chapterImageDir, 'overview.svg'), bundle.coverSvg, 'utf8')

  for (const [nodeId, content] of bundle.markdownFiles) {
    await writeFile(path.join(vaultDir, `${nodeId}.md`), content, 'utf8')
  }
}

async function writeBookConfig(book) {
  const structured = await readJson(path.join(workspaceRoot, book.assets.structuredJson))
  const config = buildConfig(book, structured)
  const filePath = path.join(configsRoot, `${config.slug}.book.json`)
  const payload = {
    book: {
      slug: config.slug,
      title: config.title,
      shortTitle: config.shortTitle,
      author: config.author,
      primaryCategory: config.primaryCategory,
      secondaryCategory: config.secondaryCategory,
      status: 'active',
    },
    source: config.source,
    builder: {
      profile: 'public_structured_nk_v1',
      entryNode: '全书摘要',
      supportsCrossBookTopic: true,
      hiddenNodes: [],
      pinnedNodes: ['公开入口', '全书摘要', '全书结构'],
    },
    publication: config.publication,
    site: {
      subtitle: config.subtitle,
      description: `《${config.title}》的 public_structured_nk 基础公开层配置。`,
      heroOverline: config.heroOverline,
      heroTitleLines: [config.shortTitle, config.subtitle],
      searchPlaceholder: `搜索《${config.shortTitle}》问题、概念、章节、方法、场景…`,
      creatorName: '林子-心智进化之路',
      creatorLabel: '整理与输出',
      footerNote: '复杂世界和复杂人性的同行翻译者',
    },
    homepage: {
      recommendedPath: ['全书摘要', '全书结构'],
      quickLinks: ['公开入口', '全书摘要', '全书结构'],
      journeyTitle: '基础公开阅读路径',
      journeyDescription: '先从全书摘要和主问题进入，再沿章节、概念、方法和场景展开。',
      sectionOrder: groupDefs.map((group) => group.id),
    },
    images: {
      overviewImage: `/books/${config.slug}/chapter-images/overview.svg`,
      chapterImageMode: 'overview',
      chapterImageOrder: [],
      topicImageMap: {},
      fallbackImage: `/books/${config.slug}/chapter-images/overview.svg`,
    },
  }
  if (!dryRun) await writeJson(filePath, payload)
}

async function applyOverrides(config, ctx) {
  const dir = path.join(overrideRoot, config.slug)
  try {
    await access(dir)
  } catch {
    return
  }
  for (const [nodeId] of ctx.markdownFiles) {
    const overridePath = path.join(dir, `${nodeId}.md`)
    try {
      const content = await readFile(overridePath, 'utf8')
      ctx.markdownFiles.set(nodeId, content)
    } catch {
      // Most nodes will not have overrides; that is expected.
    }
  }
}

async function updateGrayManifest(filePath, builtBooks, allGrayBooks) {
  let manifest
  try {
    manifest = await readJson(filePath)
  } catch {
    return
  }

  const builtBySlug = new Map(builtBooks.map((book) => [book.slug, book]))
  const grayById = new Map(allGrayBooks.map((book) => [book.workingId, book]))

  manifest.books = (manifest.books || []).map((book) => {
    const normalized = grayById.get(book.workingId)
    if (!normalized) return book
    const built = builtBySlug.get(normalized.slug)
    if (!built) {
      return {
        ...book,
        slugStatus: book.slugStatus === 'needs_manual_public_slug' ? 'assigned' : book.slugStatus,
        publicSlug: normalized.slug,
      }
    }
    return {
      ...book,
      slugStatus: 'assigned',
      publicSlug: normalized.slug,
      siteStatus: 'registered_public_structured_nk',
      layers: {
        ...book.layers,
        graphLayer: 'ready',
        publicEntryLayer: 'public_structured_nk_generated',
        publicVaultLayer: 'public_structured_nk_generated',
      },
      publicRewrite: {
        ...book.publicRewrite,
        status: 'public_structured_nk',
        siteSlug: normalized.slug,
        sitePath: `/books/${normalized.slug}`,
        fullVaultRewrite: 'selected_overrides_only',
      },
      publication: {
        layer: 'public_structured_nk',
        curationStatus: 'needs_curated_overrides',
        sourceVisibility: 'private_source',
        overrideDir: `configs/public_overrides/${normalized.slug}`,
      },
    }
  })

  const promotedFull = manifest.books.filter((book) => book.publicRewrite?.status === 'promoted_full_nk').length
  const structured = manifest.books.filter((book) => book.publicRewrite?.status === 'public_structured_nk').length
  manifest.summary = {
    ...(manifest.summary || {}),
    promotedFullNkBooks: promotedFull,
    publicStructuredNkBooks: structured,
    basePublicBooks: promotedFull + structured,
    booksNeedingPublicRewrite: manifest.books.filter((book) => book.publicRewrite?.status === 'not_started').length,
  }
  manifest.updatedAt = generatedAt
  await writeJson(filePath, manifest)
}

function renderOverview(config, structured) {
  return withFrontmatter(config, '公开入口', 'topic', [
    `# ${config.title}`,
    renderField('这本书先解决什么', structured.book_skeleton?.main_problem || structured.book_metadata?.core_one_liner),
    renderField('一句话结构', structured.book_skeleton?.one_sentence_structure),
    renderField('怎么使用这张地图', '这是基础公开层：先提供摘要、核心问题、K/N 卡、章节、概念和场景，后续只对高价值节点做精选覆盖稿。'),
    renderListSection('推荐先看', ['全书摘要', '全书结构', '核心问题', '核心概念', '章节地图']),
  ])
}

function renderSummary(config, structured) {
  const summaries = structured.summaries || {}
  return withFrontmatter(config, '全书摘要', 'summary', [
    '# 全书摘要',
    renderField('一句话定位', structured.book_metadata?.core_one_liner),
    renderField('100 字摘要', summaries.short_100),
    renderField('300 字摘要', summaries.medium_300),
    renderField('标准摘要', summaries.kb_standard),
    renderField('章节推进摘要', summaries.chapter_driven_summary),
    renderField('基础摘要', structured.book_skeleton?.main_problem),
  ])
}

function renderSkeleton(config, structured) {
  const s = structured.book_skeleton || {}
  return withFrontmatter(config, '全书结构', 'summary', [
    '# 全书结构',
    renderField('主问题', s.main_problem),
    renderField('一句话结构', s.one_sentence_structure),
    renderField('核心对象', s.central_object),
    renderField('起点', s.starting_point),
    renderField('核心转向', s.core_turn),
    renderField('最终落点', s.final_landing),
    renderListSection('章节推进', s.chapter_progression_summary || s.detected_headings),
    renderListSection('必须保留的概念', s.must_keep_concepts),
    renderListSection('必须保留的关系', s.must_keep_relations),
  ])
}

function renderQuestion(config, text, index) {
  return withFrontmatter(config, text, 'question', [
    `# ${text}`,
    `这是《${config.title}》的核心问题 ${index + 1}。读这张卡时，先把它当成一个现实困境，而不是考试题。`,
    renderField('这个问题为什么重要', text),
    renderField('阅读建议', '回到全书结构里看：这类问题通常不是靠一个技巧解决，而是需要找到背后的判断方式、概念边界和可行动的场景。'),
  ])
}

function renderKCard(config, item, index) {
  return withFrontmatter(config, item.title || `K 卡 ${index + 1}`, 'question', [
    `# ${item.title || `K 卡 ${index + 1}`}`,
    renderField('K 卡编号', item.id),
    renderField('核心判断', item.claim || item.question),
    renderField('怎么使用', '把这张 K 卡当成进入全书的一扇门：先确认它提出的判断，再去看相关概念、章节或场景。'),
  ])
}

function renderLogic(config, text, index) {
  return withFrontmatter(config, `逻辑链 ${index + 1}`, 'logic', [
    `# 逻辑链 ${index + 1}`,
    text,
    renderField('怎么使用', '把它当作全书论证链的一小段：先确认它连接了哪两个判断，再回到章节、概念或方法节点里找证据。'),
  ])
}

function renderChapter(config, item, index) {
  return withFrontmatter(config, item.section_name || `章节 ${index + 1}`, 'chapter', [
    `# ${item.section_name || `章节 ${index + 1}`}`,
    renderField('本章功能', item.role_in_book),
    renderField('核心问题', item.core_problem),
    renderListSection('核心要点', item.core_points),
    renderListSection('关键论证', item.key_arguments),
    renderField('承接上一章', item.relation_to_previous),
    renderField('交给下一章', item.relation_to_next),
    renderListSection('例子', item.examples),
    renderListSection('现实含义', item.real_world_implications),
    renderListSection('关联概念', item.matched_concepts),
  ])
}

function renderNCard(config, item, index) {
  return withFrontmatter(config, item.name || `N 卡 ${index + 1}`, 'concept', [
    `# ${item.name || `N 卡 ${index + 1}`}`,
    renderField('类型', item.type),
    renderField('说明', item.note || item.definition),
    renderField('解决什么', item.solves_what),
    renderField('边界', item.boundary),
  ])
}

function renderConcept(config, item, index) {
  return withFrontmatter(config, item.name || `核心概念 ${index + 1}`, 'concept', [
    `# ${item.name || `核心概念 ${index + 1}`}`,
    renderField('定义', item.definition),
    renderField('它解决什么', item.solves_what),
    renderListSection('相关概念', item.related_concepts),
    renderField('使用边界', item.boundary),
  ])
}

function renderThemeUnit(config, item, index) {
  return withFrontmatter(config, item.title || `主题单元 ${index + 1}`, 'concept', [
    `# ${item.title || `主题单元 ${index + 1}`}`,
    renderField('主题焦点', item.focus),
    renderListSection('关联概念', item.concepts),
  ])
}

function renderMethod(config, item, index) {
  return withFrontmatter(config, item.name || `方法动作 ${index + 1}`, 'method', [
    `# ${item.name || `方法动作 ${index + 1}`}`,
    renderField('类型', item.type),
    renderField('什么时候用', item.when_to_use),
    renderListSection('步骤', item.steps),
    renderField('预期效果', item.expected_effect),
    renderField('限制', item.limits),
  ])
}

function renderScenario(config, item, index) {
  return withFrontmatter(config, item.scenario || `典型场景 ${index + 1}`, 'scenario', [
    `# ${item.scenario || `典型场景 ${index + 1}`}`,
    renderField('它展示了什么', item.what_it_shows),
    renderListSection('关联概念', item.linked_concepts),
    renderField('为什么容易记住', item.why_memorable),
  ])
}

function renderCase(config, item, index) {
  return withFrontmatter(config, item.case_name || `案例 ${index + 1}`, 'case', [
    `# ${item.case_name || `案例 ${index + 1}`}`,
    renderField('案例类型', item.case_type),
    renderField('来源范围', item.source_scope),
    renderField('案例摘要', item.case_summary),
    renderField('场景说明', item.scene_description),
    renderField('它证明什么', item.what_it_proves),
    renderListSection('关联概念', item.linked_concepts),
    renderListSection('可视化元素', item.visual_elements),
    renderField('默认用法', item.default_usage),
  ])
}

function renderTopicAngle(config, item, index) {
  return withFrontmatter(config, item.title || `问题切入 ${index + 1}`, 'expression', [
    `# ${item.title || `问题切入 ${index + 1}`}`,
    renderField('切入类型', item.topic_type),
    renderField('读者痛点', item.pain_point),
    renderField('覆盖范围', item.chapter_scope),
    renderField('核心矛盾', item.core_contradiction),
    renderListSection('必须保留的概念', item.must_keep_concepts),
    renderListSection('必须保留的关系', item.must_keep_relations),
    renderListSection('候选场景', item.candidate_scenarios),
    renderField('页面结构建议', flattenValue(item.recommended_page_structure)),
    renderField('为什么有效', item.why_it_works),
  ])
}

function renderVisualHook(config, item, index) {
  return withFrontmatter(config, item.hook_name || `视觉钩子 ${index + 1}`, 'expression', [
    `# ${item.hook_name || `视觉钩子 ${index + 1}`}`,
    renderField('适用范围', flattenValue(item.applies_to)),
    renderField('结构', item.structure),
    renderField('内容', item.content),
    renderListSection('必须出现的对象', item.must_show_objects),
    renderListSection('适合页面', item.best_for_pages),
    renderField('为什么适合视觉化', item.why_visual),
  ])
}

function renderMisreading(config, item, index) {
  return withFrontmatter(config, item.common_misreading || `误读提醒 ${index + 1}`, 'warning', [
    `# ${item.common_misreading || `误读提醒 ${index + 1}`}`,
    renderField('更好的理解', item.better_understanding),
    renderField('为什么容易误读', item.why_easy_to_misread),
  ])
}

function renderCrossBookLink(config, item, index) {
  return withFrontmatter(config, item.theme || `跨书连接 ${index + 1}`, 'relation', [
    `# ${item.theme || `跨书连接 ${index + 1}`}`,
    renderListSection('相关书型', item.book_types),
    renderField('连接理由', item.reason),
  ])
}

function renderExpressionString(config, label, text, index) {
  return withFrontmatter(config, `${label} ${index + 1}`, 'expression', [
    `# ${label} ${index + 1}`,
    text,
    renderField('使用提醒', '这类内容适合做内容表达或复盘提示，但要回到原书结构里理解，避免变成孤立金句。'),
  ])
}

function withFrontmatter(config, title, layer, blocks) {
  return `---\ntags: [${escapeYaml(config.shortTitle)}, ${nodeTypeMeta[layer]?.label || layer}]\ncreated: ${generatedAt}\nlayer: public_structured_nk\nsourceVisibility: private_source\n---\n\n${blocks.filter(Boolean).join('\n\n')}\n`
}

function renderField(label, value) {
  const cleaned = flattenValue(value)
  if (!cleaned) return ''
  return `## ${label}\n\n${cleaned}`
}

function renderListSection(label, value) {
  const items = toArray(value).map(flattenValue).filter(Boolean)
  if (!items.length) return ''
  return `## ${label}\n\n${items.map((item) => `- ${item}`).join('\n')}`
}

function flattenValue(value) {
  if (value == null) return ''
  if (Array.isArray(value)) return value.map(flattenValue).filter(Boolean).join('；')
  if (typeof value === 'object') {
    return Object.entries(value)
      .map(([key, val]) => `${key}：${flattenValue(val)}`)
      .filter(Boolean)
      .join('；')
  }
  return cleanText(String(value))
}

function toArray(value) {
  if (value == null) return []
  if (Array.isArray(value)) return value.flatMap((item) => (Array.isArray(item) ? item : [item])).filter(Boolean)
  return [value]
}

function cleanText(value) {
  return String(value || '')
    .replace(/\[\[([^\]]+)\]\]/g, '$1')
    .replace(/后续可围绕[^。]+从清洗正文补入原书例子。/g, '这个场景可以作为理解该主题单元的现实入口。')
    .replace(/发布前围绕[^。]+回清洗正文补证，避免只停留在结构概括。/g, '阅读时要回到具体例子和场景，避免只停留在结构概括。')
    .replace(/清洗正文/g, '具体文本')
    .replace(/发布前/g, '阅读时')
    .replace(/《本书》/g, '这本书')
    .replace(/本书/g, '这本书')
    .replace(/这这+本书/g, '这本书')
    .replace(/整这本书/g, '整本书')
    .replace(/01_sources\/[^\s)>]+/g, '')
    .replace(/\s+/g, ' ')
    .replace(/^\[['"]?/, '')
    .replace(/['"]?\]$/, '')
    .trim()
}

function cleanTitle(value) {
  const title = cleanText(value)
    .replace(/[\\/:*?"<>|#%&{}$!`'@+=,]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
  return truncate(title, 58)
}

function uniqueId(ctx, base) {
  let id = base
  let index = 2
  while (ctx.usedIds.has(id)) {
    id = `${base} ${index}`
    index += 1
  }
  ctx.usedIds.add(id)
  return id
}

function truncate(value, max) {
  const text = String(value || '').trim()
  if (text.length <= max) return text
  return `${text.slice(0, max - 1)}…`
}

function dedupeLinks(links) {
  const seen = new Set()
  return links.filter((link) => {
    const key = `${link.source}→${link.target}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

function buildCoverSvg(config) {
  const { brand, accent, soft } = config.palette
  return `<svg xmlns="http://www.w3.org/2000/svg" width="960" height="1280" viewBox="0 0 960 1280" role="img" aria-label="${escapeXml(config.title)} 封面">
  <rect width="960" height="1280" fill="${soft}"/>
  <rect x="72" y="72" width="816" height="1136" rx="36" fill="#fbfaf6" stroke="${brand}" stroke-opacity="0.22" stroke-width="4"/>
  <circle cx="760" cy="220" r="96" fill="${accent}" fill-opacity="0.16"/>
  <circle cx="190" cy="1010" r="132" fill="${brand}" fill-opacity="0.12"/>
  <path d="M188 380 C320 280 450 500 602 380 C700 304 772 350 820 410" fill="none" stroke="${brand}" stroke-width="10" stroke-linecap="round" opacity="0.32"/>
  <path d="M184 470 H776" stroke="${accent}" stroke-width="6" stroke-linecap="round" opacity="0.55"/>
  <text x="120" y="180" font-family="Arial, 'Microsoft YaHei', sans-serif" font-size="30" fill="${brand}" letter-spacing="3">STRUCTURED KNOWLEDGE MAP</text>
  <text x="120" y="620" font-family="'Microsoft YaHei', Arial, sans-serif" font-size="72" font-weight="700" fill="#17232b">${escapeXml(config.shortTitle)}</text>
  <foreignObject x="120" y="668" width="720" height="210">
    <div xmlns="http://www.w3.org/1999/xhtml" style="font-family:'Microsoft YaHei',Arial,sans-serif;font-size:32px;line-height:1.45;color:${accent};">${escapeXml(config.subtitle)}</div>
  </foreignObject>
  <text x="120" y="1120" font-family="'Microsoft YaHei', Arial, sans-serif" font-size="28" fill="#4d5a62">${escapeXml(config.author)}</text>
</svg>
`
}

function paletteForCategory(category) {
  if (category.includes('沟通')) return { brand: '#5f7356', accent: '#9d5667', soft: '#f0f4ee' }
  if (category.includes('心理')) return { brand: '#6d5c93', accent: '#bf6f3f', soft: '#f2eef6' }
  if (category.includes('学习')) return { brand: '#2e5670', accent: '#6f8d66', soft: '#eef4f5' }
  return { brand: '#204f67', accent: '#bf6f3f', soft: '#eef3f1' }
}

function heroOverlineFor(category) {
  if (category.includes('沟通')) return 'BOOK · CONVERSATION'
  if (category.includes('心理')) return 'BOOK · SELF EXPLORATION'
  if (category.includes('学习')) return 'BOOK · LEARNING SYSTEM'
  return 'BOOK · THINKING MAP'
}

function entryTopicsFor(category) {
  if (category.includes('沟通')) return ['safety-before-skill', 'action-after-understanding']
  if (category.includes('学习')) return ['complexity-before-skill']
  if (category.includes('认知')) return ['seeing-before-solving', 'system-before-blame']
  return []
}

function generatedFrom(book) {
  return [
    book.assets?.structuredJson ? 'structured_json' : '',
    book.assets?.knTable ? 'kn_table' : '',
    book.assets?.summaryMarkdown ? 'summary_md' : '',
  ].filter(Boolean)
}

function cleanCategory(category = '') {
  return String(category).replace(/^\d+_/, '') || '未分类'
}

function titleForPublic(title) {
  return String(title || '').replace(/\s+/g, ' ').trim()
}

function shortTitleFor(title) {
  return titleForPublic(title)
    .replace(/：.+$/, '')
    .replace(/\(.+$/, '')
    .replace(/（.+$/, '')
    .replace(/如何实现从阅读到写作/g, '')
    .trim()
    .slice(0, 18) || titleForPublic(title).slice(0, 18)
}

function normalizeAuthor(author) {
  const text = cleanText(author)
  if (!text || text === '未标注') return '未标注'
  return text
}

function analyzePublicSanity(structured, slug) {
  const hits = []
  collectPublicStrings(structured).forEach(({ path: fieldPath, value }) => {
    if (isUnsafePublicText(value)) {
      hits.push({ field: fieldPath, sample: truncate(cleanText(value), 80) })
    }
  })
  const manualReason = manualSourceRepairBooks.get(slug)
  if (manualReason) {
    hits.push({ field: 'manual_review', sample: manualReason })
  }
  return {
    blockerCount: hits.length,
    status: hits.length > 0 ? 'needs_source_repair' : 'pass',
    samples: hits.slice(0, 8),
  }
}

function collectPublicStrings(value, fieldPath = '', acc = []) {
  if (typeof value === 'string') {
    acc.push({ path: fieldPath, value })
    return acc
  }
  if (Array.isArray(value)) {
    value.forEach((item, index) => collectPublicStrings(item, `${fieldPath}[${index}]`, acc))
    return acc
  }
  if (value && typeof value === 'object') {
    Object.entries(value).forEach(([key, child]) => collectPublicStrings(child, fieldPath ? `${fieldPath}.${key}` : key, acc))
  }
  return acc
}

function isUnsafePublicText(value) {
  const text = cleanText(value)
  return publicUnsafeTextPatterns.some((pattern) => pattern.test(text))
}

function firstNonEmpty(...items) {
  return items.map((item) => cleanText(item)).find(Boolean) || ''
}

function fallbackSlug(title, workingId) {
  const hash = createHash('sha1').update(`${workingId}:${title || 'book'}`).digest('hex').slice(0, 10)
  return `book-${hash}`
}

async function readJson(filePath) {
  const content = await readFile(filePath, 'utf8')
  return JSON.parse(stripBom(content))
}

async function writeJson(filePath, data) {
  await mkdir(path.dirname(filePath), { recursive: true })
  await writeFile(filePath, `${JSON.stringify(data, null, 2)}\n`, 'utf8')
}

function stripBom(value) {
  return value.charCodeAt(0) === 0xfeff ? value.slice(1) : value
}

function escapeXml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
}

function escapeYaml(value) {
  return String(value).replaceAll(',', '，').replaceAll('[', '').replaceAll(']', '')
}

function valueForArg(name) {
  const direct = process.argv.find((item) => item.startsWith(`${name}=`))
  if (direct) return direct.slice(name.length + 1)
  const index = process.argv.indexOf(name)
  if (index >= 0) return process.argv[index + 1]
  return ''
}

function resolveProjectPath(value) {
  if (path.isAbsolute(value)) return value
  return path.join(projectRoot, value)
}
