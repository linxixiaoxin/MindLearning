#!/usr/bin/env node

import { mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.resolve(__dirname, '..')
const workspaceRoot = path.resolve(projectRoot, '..', '..', '..')
const webPublicRoot = path.join(projectRoot, 'web', 'public')
const publicEntryDir = path.join(projectRoot, 'configs', 'expansion', 'public_entries', '2026-04-30_first_5')
const generatedAt = '2026-04-30'

const bookConfigs = [
  {
    workingId: 'gray-001-fb557939',
    slug: 'good-thinking',
    draftFile: '01_好好思考_公开入口页.md',
    title: '好好思考',
    shortTitle: '好好思考',
    author: '成甲',
    primaryCategory: '认知决策与系统思考',
    secondaryCategory: '学习成长与习惯方法',
    subtitle: '从经验成长，转向模型成长',
    heroOverline: 'BOOK · THINKING MODELS',
    entryTopics: ['complexity-before-skill'],
    palette: { brand: '#204f67', accent: '#bf6f3f', soft: '#eef3f1' },
  },
  {
    workingId: 'gray-002-4a5f7268',
    slug: 'model-thinking',
    draftFile: '02_模型思维_公开入口页.md',
    title: '模型思维',
    shortTitle: '模型思维',
    author: '斯科特·佩奇',
    primaryCategory: '认知决策与系统思考',
    secondaryCategory: '复杂系统与多模型判断',
    subtitle: '复杂问题不要只用一个解释',
    heroOverline: 'BOOK · MANY MODELS',
    entryTopics: ['system-before-blame'],
    palette: { brand: '#2e5670', accent: '#6f8d66', soft: '#eef4f5' },
  },
  {
    workingId: 'gray-003-63d2f5ab',
    slug: 'thinking-fast-and-slow',
    draftFile: '03_思考快与慢_公开入口页.md',
    title: '思考，快与慢',
    shortTitle: '快与慢',
    author: '丹尼尔·卡尼曼',
    primaryCategory: '认知决策与系统思考',
    secondaryCategory: '判断偏差与行为决策',
    subtitle: '为什么第一反应总像是真的',
    heroOverline: 'BOOK · JUDGMENT BIAS',
    entryTopics: ['seeing-before-solving'],
    palette: { brand: '#5a5f7d', accent: '#bf6f3f', soft: '#f2f0f6' },
  },
  {
    workingId: 'gray-004-a1a4ef0e',
    slug: 'nonviolent-communication',
    draftFile: '04_非暴力沟通_公开入口页.md',
    title: '非暴力沟通',
    shortTitle: '非暴力沟通',
    author: '马歇尔·卢森堡',
    primaryCategory: '沟通表达与关系对话',
    secondaryCategory: '冲突修复与关系对话',
    subtitle: '把冲突拆回观察、感受、需要和请求',
    heroOverline: 'BOOK · CONVERSATION',
    entryTopics: ['safety-before-skill', 'action-after-understanding'],
    palette: { brand: '#5f7356', accent: '#9d5667', soft: '#f0f4ee' },
  },
  {
    workingId: 'gray-005-7529e060',
    slug: 'smart-notes',
    draftFile: '05_卡片笔记写作法_公开入口页.md',
    title: '卡片笔记写作法：如何实现从阅读到写作',
    shortTitle: '卡片笔记写作法',
    author: '申克·阿伦斯',
    primaryCategory: '学习成长与习惯方法',
    secondaryCategory: '笔记系统与写作输出',
    subtitle: '让笔记进入写作系统',
    heroOverline: 'BOOK · NOTES TO OUTPUT',
    entryTopics: [],
    palette: { brand: '#6d5c93', accent: '#bf6f3f', soft: '#f2eef6' },
  },
]

const nodeTypeMeta = {
  topic: { label: '主题', color: '#6d5c93', size: 11 },
  summary: { label: '摘要', color: '#204f67', size: 11 },
  question: { label: '问题', color: '#2e5670', size: 10 },
  logic: { label: '逻辑链', color: '#4f7386', size: 9 },
  chapter: { label: '章节', color: '#3f6f84', size: 10 },
  concept: { label: '概念', color: '#6f8d66', size: 10 },
  method: { label: '方法', color: '#bf6f3f', size: 10 },
  scenario: { label: '场景', color: '#9b6a57', size: 9 },
  case: { label: '案例', color: '#8d6b44', size: 9 },
  expression: { label: '表达延展', color: '#9d5667', size: 8 },
  relation: { label: '跨书连接', color: '#6a6f8a', size: 8 },
  warning: { label: '误读提醒', color: '#7f8790', size: 8 },
}

const groupDefs = [
  { id: 'summary', title: '全书入口', subtitle: '先拿总地图', desc: '从入口、摘要和逻辑链开始理解整本书。', color: '#204f67' },
  { id: 'questions', title: '核心问题', subtitle: 'K 卡问题入口', desc: '这些问题决定了读者为什么需要这本书。', color: '#2e5670' },
  { id: 'chapters', title: '章节地图', subtitle: '按原书推进', desc: '把章节功能、核心问题和上下文关系接起来。', color: '#3f6f84' },
  { id: 'concepts', title: '核心概念', subtitle: 'N 卡概念层', desc: '保留定义、解决的问题、边界和关联概念。', color: '#6f8d66' },
  { id: 'methods', title: '方法动作', subtitle: 'N 卡行动层', desc: '把理解推进到可判断、可练习、可复盘的动作。', color: '#bf6f3f' },
  { id: 'scenarios', title: '场景与案例', subtitle: '现实入口', desc: '用典型场景和案例证据把抽象概念落回现实。', color: '#9b6a57' },
  { id: 'extensions', title: '表达延展', subtitle: '选题与视觉', desc: '保留问题切入、视觉钩子、误读提醒和跨书连接。', color: '#9d5667' },
]

async function main() {
  const manifest = JSON.parse(await readFile(path.join(projectRoot, 'configs', 'expansion', '50_book_gray_manifest.json'), 'utf8'))
  const manifestById = new Map((manifest.books || []).map((book) => [book.workingId, book]))

  const registryPath = path.join(webPublicRoot, 'registry', 'books.json')
  const samplePath = path.join(webPublicRoot, 'registry', 'public_entry_samples.json')
  const registry = JSON.parse(await readFile(registryPath, 'utf8'))
  const samples = JSON.parse(await readFile(samplePath, 'utf8'))

  const registryBooks = []
  const bookReports = []

  for (const config of bookConfigs) {
    const manifestBook = manifestById.get(config.workingId)
    if (!manifestBook) throw new Error(`manifest entry not found: ${config.workingId}`)

    const structuredPath = path.join(workspaceRoot, manifestBook.assets.structuredJson)
    const structured = JSON.parse(await readFile(structuredPath, 'utf8'))
    const entryDraft = parseDraft(await readFile(path.join(publicEntryDir, config.draftFile), 'utf8'))

    const bundle = buildFullBookBundle(config, structured, entryDraft)
    await writeFullBookBundle(config, bundle)
    registryBooks.push(buildRegistryBook(config, bundle))
    bookReports.push({
      slug: config.slug,
      title: config.title,
      nodeCount: bundle.graph.nodes.length,
      linkCount: bundle.graph.links.length,
      fileCount: Object.keys(bundle.fileMap).length,
      groups: bundle.groupCounts,
    })
  }

  const promotedSlugs = new Set(registryBooks.map((book) => book.slug))
  registry.books = [
    ...(registry.books || []).filter((book) => !promotedSlugs.has(book.slug)),
    ...registryBooks,
  ]
  await writeJson(registryPath, registry)

  const configById = new Map(bookConfigs.map((item) => [item.workingId, item]))
  samples.entries = (samples.entries || []).map((entry) => {
    const config = configById.get(entry.workingId)
    if (!config) return entry
    return {
      ...entry,
      status: 'promoted_full_nk',
      siteSlug: config.slug,
      sitePath: `/books/${config.slug}`,
    }
  })
  samples.promotedCount = samples.entries.filter((entry) => entry.status === 'promoted_full_nk').length
  samples.updatedAt = generatedAt
  await writeJson(samplePath, samples)

  await updateGrayManifest(path.join(projectRoot, 'configs', 'expansion', '50_book_gray_manifest.json'))
  await updateGrayManifest(path.join(webPublicRoot, 'registry', '50_book_gray_manifest.json'))

  const reportPath = path.join(projectRoot, '03_产品项目文档', '04_研发交付', '46_5本全量NK卡正式接入记录_2026-04-30.md')
  await writeFile(reportPath, buildReport(bookReports), 'utf8')

  console.log(`promoted full NK books: ${registryBooks.map((book) => book.slug).join(', ')}`)
  console.log(bookReports.map((item) => `${item.slug}: nodes=${item.nodeCount}, links=${item.linkCount}`).join('\n'))
}

function buildFullBookBundle(config, structured, entryDraft) {
  const ctx = createBuildContext(config)
  const overview = addNode(ctx, '公开入口', 'topic', '从公开入口进入整本书的问题地图。', 'summary', renderOverview(config, structured, entryDraft))
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

  addObjectCards(ctx, structured.core_concepts || [], 'concept', 'concepts', (item, index) => ({
    title: item.name || `核心概念 ${index + 1}`,
    tagline: item.definition || item.solves_what || '',
    markdown: renderConcept(config, item, index),
    linkLabel: '概念支撑',
    relatedNames: toArray(item.related_concepts),
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

  addObjectCards(ctx, structured.visual_hooks || [], 'expression', 'extensions', (item, index) => ({
    title: item.hook_name || `视觉钩子 ${index + 1}`,
    tagline: item.content || item.structure || '',
    markdown: renderVisualHook(config, item, index),
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
    markdown: renderDensePhrase(config, text, index),
    linkLabel: '表达句',
  }))

  addAuthorAssumptionCards(ctx, structured.author_assumptions || {})
  connectRelatedNames(ctx)

  const overviewImage = `/books/${config.slug}/chapter-images/overview.svg`
  const nodeImages = Object.fromEntries(ctx.nodes.map((node) => [node.id, overviewImage]))
  const toc = buildToc(ctx)
  const homeSections = buildHomeSections(ctx)
  const journeyMap = buildJourneyMap(config, ctx, overviewImage)
  const stats = [
    { label: '公开节点', value: String(ctx.nodes.length) },
    { label: '核心问题', value: String(ctx.groupCounts.questions || 0) },
    { label: '核心概念', value: String(ctx.groupCounts.concepts || 0) },
    { label: '章节', value: String(ctx.groupCounts.chapters || 0) },
  ]

  const site = {
    title: config.title,
    shortTitle: config.shortTitle,
    subtitle: config.subtitle,
    description: `基于《${config.title}》已通过质检的结构化资产，接入全书摘要、核心问题、核心概念、方法动作、场景案例、章节地图和表达延展节点。`,
    heroOverline: config.heroOverline,
    heroTitleLines: [config.shortTitle, config.subtitle],
    creatorName: '林子-心智进化之路',
    creatorLabel: '整理与输出',
    footerNote: '复杂世界和复杂人性的同行翻译者',
    assetVersion: '20260430-full-nk',
    searchPlaceholder: `搜索《${config.shortTitle}》问题、概念、章节、方法、场景…`,
    recommendedPath: journeyMap.map((item) => item.node),
    quickLinks: [
      '全书摘要',
      '全书结构',
      firstNodeId(ctx, 'questions'),
      firstNodeId(ctx, 'concepts'),
      firstNodeId(ctx, 'methods'),
    ].filter(Boolean),
    journeyOverline: 'Full Knowledge Map',
    journeyTitle: '全量 NK 阅读路径',
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
    groupCounts: ctx.groupCounts,
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
  if (options.aliases) {
    for (const alias of options.aliases.filter(Boolean)) ctx.aliasMap[alias] = id
  }
  if (groupId) {
    if (!ctx.firstByGroup[groupId]) ctx.firstByGroup[groupId] = id
    ctx.groupItems.get(groupId)?.push(id)
    ctx.groupCounts[groupId] = (ctx.groupCounts[groupId] || 0) + 1
  }
  return node
}

function addStringCards(ctx, items, type, groupId, mapper) {
  items.filter(Boolean).forEach((text, index) => {
    const mapped = mapper(cleanText(text), index)
    const node = addNode(ctx, mapped.title, type, mapped.tagline, groupId, mapped.markdown)
    link(ctx, '公开入口', node.id, mapped.linkLabel)
  })
}

function addObjectCards(ctx, items, type, groupId, mapper) {
  items.filter(Boolean).forEach((item, index) => {
    const mapped = mapper(item, index)
    const node = addNode(ctx, mapped.title, type, mapped.tagline, groupId, mapped.markdown, { aliases: mapped.aliases })
    link(ctx, '公开入口', node.id, mapped.linkLabel)
    for (const related of mapped.relatedNames || []) {
      ctx.relatedQueue.push({ source: node.id, targetName: related, label: '相关概念' })
    }
  })
}

function addAuthorAssumptionCards(ctx, assumptions) {
  const fields = [
    ['view_of_human', '作者怎样看人'],
    ['view_of_problem_cause', '作者怎样看问题成因'],
    ['view_of_change', '作者怎样看改变'],
    ['reader_common_traps', '读者常见陷阱'],
  ]
  for (const [key, title] of fields) {
    if (!assumptions[key]) continue
    const node = addNode(ctx, title, 'summary', title, 'extensions', renderAuthorAssumption(ctx.config, title, assumptions[key]))
    link(ctx, '公开入口', node.id, '作者假设')
  }
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

function buildJourneyMap(config, ctx, overviewImage) {
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
    description: `已接入全量 NK 结构：全书入口、摘要、核心问题、概念、方法、章节、场景、案例和表达延展，共 ${bundle.graph.nodes.length} 个公开节点。`,
    coverImage: `/books/${config.slug}/chapter-images/overview.svg`,
    entryTopics: config.entryTopics,
    stats: [
      { label: '公开节点', value: String(bundle.graph.nodes.length) },
      { label: '核心问题', value: String(bundle.groupCounts.questions || 0) },
      { label: '核心概念', value: String(bundle.groupCounts.concepts || 0) },
      { label: '章节', value: String(bundle.groupCounts.chapters || 0) },
    ],
  }
}

async function writeFullBookBundle(config, bundle) {
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

function renderOverview(config, structured, entryDraft) {
  return withFrontmatter(config, '公开入口', 'topic', [
    `# ${config.title}`,
    entryDraft.body,
    '## 全量接入说明',
    `这本书现在已接入全书摘要、核心问题、核心概念、方法动作、场景案例、章节地图和表达延展节点。你可以从左侧目录、知识图谱或推荐路径继续深入。`,
    renderListSection('这本书的主问题', [structured.book_skeleton?.main_problem, structured.book_metadata?.core_one_liner]),
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
  ])
}

function renderSkeleton(config, structured) {
  const s = structured.book_skeleton || {}
  return withFrontmatter(config, '全书结构', 'summary', [
    '# 全书结构',
    renderField('主问题', s.main_problem),
    renderField('一句话结构', s.one_sentence_structure),
    renderField('起点', s.starting_point),
    renderField('核心转向', s.core_turn),
    renderField('最终落点', s.final_landing),
    renderField('章节推进', s.chapter_progression_summary),
    renderListSection('必须保留的概念', s.must_keep_concepts),
    renderListSection('必须保留的关系', s.must_keep_relations),
  ])
}

function renderQuestion(config, text, index) {
  return withFrontmatter(config, text, 'question', [
    `# ${text}`,
    `这是《${config.title}》的核心问题 ${index + 1}。读这张卡时，先把它当成一个现实困境，而不是考试题。`,
    '## 这个问题为什么重要',
    text,
    '## 阅读建议',
    '回到全书结构里看：这类问题通常不是靠一个技巧解决，而是需要找到背后的判断方式、概念边界和可行动的场景。',
  ])
}

function renderLogic(config, text, index) {
  return withFrontmatter(config, `逻辑链 ${index + 1}`, 'logic', [
    `# 逻辑链 ${index + 1}`,
    text,
    '## 怎么使用',
    '把它当作全书论证链的一小段：先确认它连接了哪两个判断，再回到章节、概念或方法节点里找证据。',
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

function renderConcept(config, item, index) {
  return withFrontmatter(config, item.name || `核心概念 ${index + 1}`, 'concept', [
    `# ${item.name || `核心概念 ${index + 1}`}`,
    renderField('定义', item.definition),
    renderField('它解决什么', item.solves_what),
    renderListSection('相关概念', item.related_concepts),
    renderField('使用边界', item.boundary),
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

function renderDensePhrase(config, text, index) {
  return withFrontmatter(config, `高密度句 ${index + 1}`, 'expression', [
    `# 高密度句 ${index + 1}`,
    text,
    '## 使用提醒',
    '这类句子适合做内容表达或复盘提示，但要回到原书结构里理解，避免变成孤立金句。',
  ])
}

function renderAuthorAssumption(config, title, value) {
  return withFrontmatter(config, title, 'summary', [
    `# ${title}`,
    renderField('内容', value),
  ])
}

function withFrontmatter(config, title, layer, blocks) {
  return `---\ntags: [${escapeYaml(config.shortTitle)}, ${nodeTypeMeta[layer]?.label || layer}]\ncreated: ${generatedAt}\nlayer: public\n---\n\n${blocks.filter(Boolean).join('\n\n')}\n`
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

function parseDraft(text) {
  const body = text.replace(/^(?:\uFEFF)?---\r?\n[\s\S]*?\r?\n---\r?\n?/, '').trim()
  return { body }
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
    .replace(/\s+/g, ' ')
    .replace(/^\[['"]?/, '')
    .replace(/['"]?\]$/, '')
    .trim()
}

function cleanTitle(value) {
  const title = cleanText(value)
    .replace(/[\\/:*?"<>|]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
  return truncate(title, 70)
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
  <text x="120" y="180" font-family="Arial, 'Microsoft YaHei', sans-serif" font-size="30" fill="${brand}" letter-spacing="3">FULL KNOWLEDGE MAP</text>
  <text x="120" y="620" font-family="'Microsoft YaHei', Arial, sans-serif" font-size="74" font-weight="700" fill="#17232b">${escapeXml(config.shortTitle)}</text>
  <foreignObject x="120" y="668" width="720" height="180">
    <div xmlns="http://www.w3.org/1999/xhtml" style="font-family:'Microsoft YaHei',Arial,sans-serif;font-size:34px;line-height:1.45;color:${accent};">${escapeXml(config.subtitle)}</div>
  </foreignObject>
  <text x="120" y="1120" font-family="'Microsoft YaHei', Arial, sans-serif" font-size="28" fill="#4d5a62">${escapeXml(config.author)}</text>
</svg>
`
}

async function updateGrayManifest(filePath) {
  let manifest
  try {
    manifest = JSON.parse(await readFile(filePath, 'utf8'))
  } catch {
    return
  }

  const configById = new Map(bookConfigs.map((item) => [item.workingId, item]))
  manifest.books = (manifest.books || []).map((book) => {
    const config = configById.get(book.workingId)
    if (!config) return book
    return {
      ...book,
      slugStatus: 'assigned',
      siteStatus: 'registered_full_nk',
      layers: {
        ...book.layers,
        graphLayer: 'ready',
        publicEntryLayer: 'promoted_full_nk_book',
        publicVaultLayer: 'public_structured_cards_ready',
      },
      publicRewrite: {
        ...book.publicRewrite,
        status: 'promoted_full_nk',
        siteSlug: config.slug,
        sitePath: `/books/${config.slug}`,
        fullVaultRewrite: 'structured_assets_imported',
      },
    }
  })
  manifest.summary = {
    ...(manifest.summary || {}),
    promotedFullNkBooks: bookConfigs.length,
  }
  manifest.updatedAt = generatedAt
  await writeJson(filePath, manifest)
}

function buildReport(items) {
  const rows = items.map((item) =>
    `| ${item.title} | \`${item.slug}\` | ${item.nodeCount} | ${item.linkCount} | ${item.groups.questions || 0} | ${item.groups.concepts || 0} | ${item.groups.chapters || 0} |`,
  )
  return `# 5 本全量 NK 卡正式接入记录

> 日期：2026-04-30

## 1. 本次完成

已将前 5 本灰度候选从轻量入口升级为正式全量 NK 结构书包，接入范围包括：

- 全书入口、全书摘要、全书结构
- 核心问题 K 卡
- 核心概念 N 卡
- 方法动作 N 卡
- 章节地图
- 典型场景、案例证据
- 误读提醒、跨书连接、问题切入和视觉表达延展

## 2. 接入结果

| 书名 | slug | 公开节点 | 图谱边 | 核心问题 | 核心概念 | 章节 |
| --- | --- | ---: | ---: | ---: | ---: | ---: |
${rows.join('\n')}

## 3. 说明

本次不是直接复制内部原始底稿，而是从已通过质检的结构化资产生成正式站点包。生成产物已经写入 \`web/public/books/<slug>/\`，并更新 \`registry/books.json\`，因此这 5 本会进入正式 \`/books\`。

## 4. 后续

下一轮可以继续对 5 本中的高价值节点做人工精修，尤其是《非暴力沟通》和《卡片笔记写作法》里部分章节型卡片仍偏结构化，需要逐步改得更像公开文章。
`
}

async function writeJson(filePath, data) {
  await writeFile(filePath, `${JSON.stringify(data, null, 2)}\n`, 'utf8')
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

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
