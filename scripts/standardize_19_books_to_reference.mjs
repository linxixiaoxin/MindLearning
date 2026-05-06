#!/usr/bin/env node

import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.resolve(__dirname, '..')
const publicRoot = path.join(projectRoot, 'web', 'public')
const registryPath = path.join(publicRoot, 'registry', 'books.json')
const referenceSlugs = new Set(['mindset-traps', 'leadership-evolution'])
const generatedAt = '2026-04-30'

const standardTypeMeta = {
  topic: { label: '主题', color: '#6d5c93', size: 10 },
  summary: { label: '摘要', color: '#204f67', size: 11 },
  question: { label: '问题', color: '#2e5670', size: 10 },
  logic: { label: '逻辑链', color: '#4f7386', size: 9 },
  book: { label: '书籍', color: '#bf6f3f', size: 10 },
  chapter: { label: '章节', color: '#2e5670', size: 11 },
  concept: { label: '概念', color: '#6f8d66', size: 9 },
  method: { label: '方法', color: '#bf6f3f', size: 10 },
  scenario: { label: '场景', color: '#9b6a57', size: 10 },
  case: { label: '案例', color: '#8d6b44', size: 9 },
  expression: { label: '表达延展', color: '#9d5667', size: 8 },
  relation: { label: '跨书连接', color: '#6a6f8a', size: 8 },
  warning: { label: '误读提醒', color: '#7f8790', size: 8 },
  person: { label: '人物', color: '#9d5667', size: 12 },
}

const standardHome = {
  overview: {
    title: '全书入口',
    subtitle: '先拿总地图',
    desc: '先抓主问题、全书脉络和入口节点，再决定从章节、概念还是场景切进去。',
    color: '#6d5c93',
  },
  themes: {
    title: 'K卡主题',
    subtitle: '把整本书重构成判断入口',
    desc: '把书 K、主题 K 和问题 K 接到同一组入口里，帮助读者从真实问题进入。',
    color: '#6d5c93',
  },
  chapters: {
    title: '章节地图',
    subtitle: '按原书推进',
    desc: '按章节顺读，保住作者原始推进逻辑和每一章的功能。',
    color: '#2e5670',
  },
  books: {
    title: '书籍地图',
    subtitle: '按书进入作者方法',
    desc: '适合作者方法库和合集型书包，用书籍节点代替普通章节。',
    color: '#bf6f3f',
  },
  concepts: {
    title: '核心概念',
    subtitle: '先把底层抓手拿稳',
    desc: '把这本书最重要的概念卡收成主干网络。',
    color: '#6f8d66',
  },
  methods: {
    title: '动作与方法',
    subtitle: '把理解转成能拿来试的动作',
    desc: '把书里的关键方法与判断动作单独抽出来，方便回到现实调用。',
    color: '#bf6f3f',
  },
  scenarios: {
    title: '现实场景',
    subtitle: '从高频卡点切入',
    desc: '从真实困境、典型案例和具体处境进入书里的结构。',
    color: '#9b6a57',
  },
}

const scenarioTitlePattern = /(为什么|如何|总觉得|越来越|越|不敢|不会|不能|团队|员工|公司|职场|争吵|沟通|对话|失望|焦虑|愤怒|冲突|失败|内耗|真正|感觉|被问|看见|普通|热点|旅行)/
const overviewExactTitles = new Set([
  '公开入口',
  '全书入口',
  '全书摘要',
  '全书导读',
  '全书脉络',
  '全书结构',
  '全书论证链',
  'K卡N卡总表',
  '核心内容总览',
  '内容选题角度',
  '视觉表达钩子',
  '作者方法总览',
])
const overviewIncludePattern = /(全书骨架|全书总图|总览)$/
const overviewExcludePattern = /(在全书中|全书主动作|章节图|选题图|处理关键问题|解决什么问题)/

async function main() {
  const registry = await readJson(registryPath)
  const books = registry.books || []
  const targetBooks = books.filter((book) => !referenceSlugs.has(book.slug))
  const reportRows = []

  for (const book of targetBooks) {
    const bookDir = path.join(publicRoot, 'books', book.slug)
    const [site, graph, toc, homeSections] = await Promise.all([
      readJson(path.join(bookDir, 'site.json')),
      readJson(path.join(bookDir, 'graph.json')),
      readJson(path.join(bookDir, 'toc.json')),
      readJson(path.join(bookDir, 'home-sections.json')),
    ])

    const before = {
      home: homeSections.length,
      toc: toc.length,
      journey: site.journeyMap?.length || 0,
    }

    const result = standardizeBook(book, site, graph, toc, homeSections)

    await writeJson(path.join(bookDir, 'site.json'), result.site)
    await writeJson(path.join(bookDir, 'graph.json'), result.graph)
    await writeJson(path.join(bookDir, 'toc.json'), result.toc)
    await writeJson(path.join(bookDir, 'home-sections.json'), result.homeSections)

    Object.assign(book, result.registryPatch)
    reportRows.push({
      slug: book.slug,
      title: book.title,
      before,
      after: {
        home: result.homeSections.length,
        toc: result.toc.length,
        journey: result.site.journeyMap?.length || 0,
      },
      counts: result.counts,
    })
  }

  await writeJson(registryPath, registry)

  const reportPath = path.join(projectRoot, '03_产品项目文档', '04_研发交付', '47_19本对齐心智误区与意识进化结构标准_2026-04-30.md')
  await writeFile(reportPath, buildReport(reportRows), 'utf8')

  console.log(`standardized books: ${reportRows.length}`)
  console.log(reportRows.map((row) => `${row.slug}: home ${row.before.home}->${row.after.home}, toc ${row.before.toc}->${row.after.toc}, journey ${row.before.journey}->${row.after.journey}`).join('\n'))
}

function standardizeBook(book, site, graph, toc, homeSections) {
  const nodes = (graph.nodes || []).map((node) => ({ ...node }))
  const nodeIds = new Set(nodes.map((node) => node.id))
  const fileMap = {}
  const typeBuckets = bucketNodes(nodes)
  const existingHomeNodes = new Set(flattenHomeNodes(homeSections))

  const overview = uniqueExisting([
    ...nodes.filter((node) => isOverviewNode(node.id)).map((node) => node.id),
    ...homeNodesById(homeSections, ['overview', 'summary']).filter((id) => nodeIds.has(id)),
  ]).slice(0, 6)

  const candidateThemes = uniqueExisting([
    ...homeNodesById(homeSections, ['themes', 'topics', 'books']).filter((id) => nodeIds.has(id)),
    ...(typeBuckets.topic || []).map((node) => node.id),
    ...(typeBuckets.question || []).map((node) => node.id),
    ...(typeBuckets.logic || []).map((node) => node.id),
    ...(typeBuckets.book || []).map((node) => node.id),
  ]).filter((id) => !overview.includes(id))

  const derivedScenarioIds = candidateThemes
    .filter((id) => scenarioTitlePattern.test(id))
    .filter((id) => !overview.includes(id))
    .slice(0, 10)

  for (const node of nodes) {
    if (derivedScenarioIds.includes(node.id) && node.type === 'topic') {
      node.type = 'scenario'
    }
  }

  const refreshedBuckets = bucketNodes(nodes)
  const chapters = (refreshedBuckets.chapter || []).map((node) => node.id)
  const books = (refreshedBuckets.book || []).map((node) => node.id)
  const concepts = (refreshedBuckets.concept || []).map((node) => node.id)
  const methods = (refreshedBuckets.method || []).map((node) => node.id)
  const scenarios = uniqueExisting([
    ...(refreshedBuckets.scenario || []).map((node) => node.id),
    ...(refreshedBuckets.case || []).map((node) => node.id),
  ])
  const themes = candidateThemes.filter((id) => !scenarios.includes(id))
  const extensions = uniqueExisting([
    ...(refreshedBuckets.expression || []).map((node) => node.id),
    ...(refreshedBuckets.warning || []).map((node) => node.id),
    ...(refreshedBuckets.relation || []).map((node) => node.id),
  ])
  const people = (refreshedBuckets.person || []).map((node) => node.id)

  const homeGroups = [
    buildHomeSection('overview', overview),
    buildHomeSection('themes', themes.slice(0, 12)),
    chapters.length ? buildHomeSection('chapters', chapters) : buildHomeSection('books', books),
    buildHomeSection('concepts', concepts.slice(0, 18)),
    buildHomeSection('methods', methods.slice(0, 12)),
    buildHomeSection('scenarios', scenarios.slice(0, 12)),
  ].filter((section) => section.nodes.length)

  const tocGroups = [
    tocGroup('topics', '主题入口', standardHome.themes.color, [
      ['全书入口', overview],
      ['K卡主题', themes],
    ]),
    tocGroup(chapters.length ? 'chapters' : 'books', chapters.length ? '章节地图' : '书籍地图', chapters.length ? standardHome.chapters.color : standardHome.books.color, [
      [chapters.length ? '章节推进' : '书籍节点', chapters.length ? chapters : books],
    ]),
    tocGroup('concepts', '核心概念', standardHome.concepts.color, [['概念', concepts]]),
    tocGroup('methods', '动作方法', standardHome.methods.color, [['方法', methods]]),
    tocGroup('scenarios', '现实场景', standardHome.scenarios.color, [['场景 / 案例', scenarios]]),
    tocGroup('extensions', '表达延展', '#9d5667', [['选题 / 视觉 / 误读', extensions]]),
    tocGroup('people', '作者', '#9d5667', [['人物', people]]),
  ].filter((group) => group.sections.some((section) => section.items.length))

  const overviewEntry = overview[0] || themes[0] || chapters[0] || books[0] || concepts[0] || nodes[0]?.id
  const journeyMap = buildJourneyMap({
    site,
    overviewEntry,
    chapters: chapters.length ? chapters : books,
    concepts,
    methods,
    scenarios,
    image: site.journeyMap?.[0]?.image || graph.nodeImages?.[overviewEntry] || book.coverImage || `/books/${book.slug}/chapter-images/overview.svg`,
  })

  const nextSite = {
    ...site,
    description: site.description || book.description || `基于《${book.title}》整理的单书知识站。`,
    searchPlaceholder: '搜索主题、章节、概念、方法、场景…',
    recommendedPath: buildRecommendedPath({ overview, themes, chapters: chapters.length ? chapters : books, concepts, methods, scenarios }),
    quickLinks: buildQuickLinks({ overview, themes, concepts, methods, scenarios, extensions }),
    journeyOverline: 'Journey Map',
    journeyTitle: '章节升级打怪地图',
    journeyDescription: chapters.length
      ? '从总览到章节推进，再接回主题、概念、方法和现实场景，形成一条可以来回穿梭的阅读路径。'
      : '从总览到书籍节点，再接回概念、方法和现实场景，形成一条可以来回穿梭的作者方法路径。',
    journeyEntryLabel: overviewEntry ? `从${overviewEntry}进入` : '从起点进入',
    journeyMap,
    stats: buildStats({ themes, chapters, books, concepts, methods, scenarios }),
    standardizedProfile: {
      basedOn: ['mindset-traps', 'leadership-evolution'],
      updatedAt: generatedAt,
      version: 'reference_profile_v1',
    },
  }

  const nextGraph = {
    ...graph,
    nodeTypeMeta: {
      ...standardTypeMeta,
      ...(graph.nodeTypeMeta || {}),
      topic: standardTypeMeta.topic,
      chapter: standardTypeMeta.chapter,
      concept: standardTypeMeta.concept,
      method: standardTypeMeta.method,
      scenario: standardTypeMeta.scenario,
      person: standardTypeMeta.person,
    },
    filters: buildFilters(nodes),
    nodes,
    links: normalizeLinks(graph.links || [], nodeIds),
  }

  const registryPatch = {
    status: book.status === 'seed' ? 'seed' : 'active',
    stats: buildStats({ themes, chapters, books, concepts, methods, scenarios }),
    description: book.description || nextSite.description,
  }

  return {
    site: nextSite,
    graph: nextGraph,
    toc: tocGroups,
    homeSections: homeGroups,
    registryPatch,
    counts: {
      themes: themes.length,
      chapters: chapters.length,
      books: books.length,
      concepts: concepts.length,
      methods: methods.length,
      scenarios: scenarios.length,
      extensions: extensions.length,
      people: people.length,
      existingHomeNodes: existingHomeNodes.size,
      fileMapEntries: Object.keys(fileMap).length,
    },
  }
}

function buildHomeSection(id, nodes) {
  const meta = standardHome[id] || standardHome.themes
  return {
    id,
    title: meta.title,
    subtitle: meta.subtitle,
    desc: meta.desc,
    color: meta.color,
    nodes: uniqueExisting(nodes).slice(0, id === 'chapters' ? 16 : 12),
  }
}

function tocGroup(id, label, color, sections) {
  return {
    id,
    label,
    color,
    sections: sections
      .map(([sectionLabel, items]) => ({ label: sectionLabel, items: uniqueExisting(items) }))
      .filter((section) => section.items.length),
  }
}

function buildJourneyMap({ overviewEntry, chapters, concepts, methods, scenarios, image }) {
  const chapterPath = compactJourneyNodes(chapters || [])
  const fallbackPath = [
    overviewEntry,
    concepts?.[0],
    methods?.[0],
    scenarios?.[0],
  ].filter(Boolean)
  const pathNodes = chapterPath.length ? [overviewEntry, ...chapterPath].filter(Boolean) : fallbackPath

  return uniqueExisting(pathNodes).map((node, index, all) => ({
    level: `LV.${index}`,
    stage: index === 0 ? '起点总览' : stageName(index, node),
    node,
    image,
    summary: index === 0 ? '先看清整本书的总问题和阅读入口。' : `进入「${node}」，继续沿着本书的核心路径推进。`,
    bridgeToNext: index < all.length - 1 ? '读完这一层，再进入下一层继续展开。' : '',
  }))
}

function compactJourneyNodes(nodes) {
  const unique = uniqueExisting(nodes)
  if (unique.length <= 9) return unique
  return [...unique.slice(0, 7), unique[unique.length - 1]]
}

function stageName(index, node) {
  if (/第\d+章|第[一二三四五六七八九十]+章|主题单元\d+/.test(node)) return `章节 ${index}`
  if (index === 1) return '核心入口'
  return '推进节点'
}

function buildRecommendedPath({ overview, themes, chapters, concepts, methods, scenarios }) {
  return uniqueExisting([
    overview[0],
    themes[0],
    chapters[0],
    scenarios[0] || methods[0] || concepts[0],
    chapters[chapters.length - 1] || methods[0] || concepts[0],
  ]).slice(0, 5)
}

function buildQuickLinks({ overview, themes, concepts, methods, scenarios, extensions }) {
  return uniqueExisting([
    overview[1],
    overview[2],
    concepts[0],
    concepts[1],
    methods[0],
    scenarios[0],
    themes[0],
    extensions[0],
  ]).slice(0, 6)
}

function buildStats({ themes, chapters, books, concepts, methods, scenarios }) {
  return [
    { label: '主题页', value: String(themes.length) },
    { label: chapters.length ? '章节' : '书籍节点', value: String(chapters.length || books.length) },
    { label: '概念 / 方法', value: String(concepts.length + methods.length) },
    { label: '场景', value: String(scenarios.length) },
  ]
}

function isOverviewNode(id) {
  if (!id || overviewExcludePattern.test(id)) return false
  return overviewExactTitles.has(id) || overviewIncludePattern.test(id)
}

function buildFilters(nodes) {
  const types = uniqueExisting(nodes.map((node) => node.type).filter(Boolean))
  return types.map((type) => ({
    type,
    label: standardTypeMeta[type]?.label || type,
    color: standardTypeMeta[type]?.color || '#7f8790',
  }))
}

function bucketNodes(nodes) {
  return nodes.reduce((acc, node) => {
    const type = node.type || 'topic'
    if (!acc[type]) acc[type] = []
    acc[type].push(node)
    return acc
  }, {})
}

function flattenHomeNodes(homeSections) {
  return (homeSections || []).flatMap((section) => section.nodes || [])
}

function homeNodesById(homeSections, ids) {
  const idSet = new Set(ids)
  return (homeSections || [])
    .filter((section) => idSet.has(section.id))
    .flatMap((section) => section.nodes || [])
}

function uniqueExisting(items) {
  const seen = new Set()
  const result = []
  for (const item of items || []) {
    if (!item || seen.has(item)) continue
    seen.add(item)
    result.push(item)
  }
  return result
}

function normalizeLinks(links, nodeIds) {
  const seen = new Set()
  return links.filter((link) => {
    const source = typeof link.source === 'object' ? link.source.id : link.source
    const target = typeof link.target === 'object' ? link.target.id : link.target
    if (!source || !target || !nodeIds.has(source) || !nodeIds.has(target)) return false
    const key = `${source}→${target}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

function buildReport(rows) {
  const body = rows.map((row) =>
    `| ${row.title} | \`${row.slug}\` | ${row.before.home} -> ${row.after.home} | ${row.before.toc} -> ${row.after.toc} | ${row.before.journey} -> ${row.after.journey} | ${row.counts.themes} | ${row.counts.chapters || row.counts.books} | ${row.counts.concepts + row.counts.methods} | ${row.counts.scenarios} |`,
  )

  return `# 19 本对齐心智误区与意识进化结构标准

> 日期：2026-04-30

## 1. 本次目标

按《走出心智的误区》和《领导者的意识进化》的成熟书包结构，对其余 19 本正式书进行结构标准化处理。

本轮优先统一：

- Home 分组：全书入口、K卡主题、章节地图、核心概念、动作与方法、现实场景
- Toc 分组：主题入口、章节地图、核心概念、动作方法、现实场景、表达延展、作者
- Journey Map：从总览进入章节/书籍推进，再接回概念、方法和场景
- 搜索提示、推荐路径、快捷入口、统计口径和图谱筛选类型

本轮不做逐篇正文重写；正文精修进入下一步。

## 2. 处理结果

| 书名 | slug | Home | Toc | Journey | 主题 | 章节/书籍 | 概念方法 | 场景 |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
${body.join('\n')}

## 3. 后续精修重点

1. 对 5 本新接入全量 NK 书包做高价值卡片人工精修。
2. 对老书中缺少“现实场景”的书，继续从源资产补场景节点，而不是只在 Home 上做结构分组。
3. 德波顿作者方法库只对齐导航标准，不强行改成实用书章节结构。
`
}

async function readJson(filePath) {
  const raw = await readFile(filePath, 'utf8')
  const cleaned = raw.replace(/^\uFEFF/, '')
  return JSON.parse(cleaned)
}

async function writeJson(filePath, data) {
  await writeFile(filePath, `${JSON.stringify(data, null, 2)}\n`, 'utf8')
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
