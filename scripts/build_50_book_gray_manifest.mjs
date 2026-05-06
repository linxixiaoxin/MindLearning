import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.resolve(__dirname, '..')
const workspaceRoot = path.resolve(projectRoot, '../../..')
const sourceRoot = path.join(workspaceRoot, '01_sources/01_books')
const auditRoot = path.join(workspaceRoot, '04_operations/08_ai_solo_company/31_quality_audits')
const registryPath = path.join(projectRoot, 'web/public/registry/books.json')
const outDir = path.join(projectRoot, 'configs/expansion')
const docsDir = path.join(projectRoot, '03_产品项目文档/04_研发交付')
const manifestPath = path.join(outDir, '50_book_gray_manifest.json')
const publicManifestPath = path.join(projectRoot, 'web/public/registry/50_book_gray_manifest.json')
const reportPath = path.join(docsDir, '44_50本灰度接入清单与转写分层_2026-04-30.md')

const TARGET_COUNT = 50

const priorityKeywords = [
  '好好思考',
  '模型思维',
  '思考，快与慢',
  '非暴力沟通',
  '卡片笔记写作法',
  '打造第二大脑',
  '笔记的方法',
  '如何阅读一本书',
  '好好学习',
  '深度工作',
  '学会提问',
  '系统之美',
  '高难度谈话',
  '沟通的方法',
  '金字塔原理',
  '关于说话的一切',
  '你为什么不道歉',
  '旅行的艺术',
  '身份的焦虑',
  '新闻的骚动',
  '幸福的建筑',
  '观看之道',
  '空间的诗学',
  '逃避自由',
  '日常生活中的自我呈现',
]

function readJson(filePath) {
  return JSON.parse(readFileSync(filePath, 'utf8'))
}

function relativeToWorkspace(filePath) {
  if (!filePath) return ''
  return path.relative(workspaceRoot, filePath).replaceAll(path.sep, '/')
}

function normalizeTitle(value = '') {
  return String(value)
    .replace(/^01_sources[\\/]+01_books[\\/]+/, '')
    .split(/[\\/]/)
    .at(-1)
    .trim()
}

function stableWorkingId(index, title) {
  const hash = createHash('sha1').update(title).digest('hex').slice(0, 8)
  return `gray-${String(index + 1).padStart(3, '0')}-${hash}`
}

function walkDirs(dir, acc = []) {
  if (!existsSync(dir)) return acc
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue
    const child = path.join(dir, entry.name)
    acc.push(child)
    walkDirs(child, acc)
  }
  return acc
}

function walkFiles(dir, acc = []) {
  if (!existsSync(dir)) return acc
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const child = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      walkFiles(child, acc)
    } else {
      acc.push(child)
    }
  }
  return acc
}

function buildSourceDirIndex() {
  const index = new Map()
  for (const dir of walkDirs(sourceRoot)) {
    const name = path.basename(dir)
    if (!index.has(name)) index.set(name, dir)
  }
  return index
}

function resolveBookDir(record, sourceDirIndex) {
  if (record.book_dir && existsSync(record.book_dir)) return record.book_dir

  const bookValue = String(record.book || '')
  if (bookValue.startsWith('01_sources/01_books/') || bookValue.startsWith('01_sources\\01_books\\')) {
    const directPath = path.join(workspaceRoot, bookValue)
    if (existsSync(directPath)) return directPath
  }

  const title = normalizeTitle(bookValue)
  return sourceDirIndex.get(title) || ''
}

function getLatestPassedAuditRecords() {
  const sourceDirIndex = buildSourceDirIndex()
  const files = readdirSync(auditRoot)
    .filter((name) => name.endsWith('.json'))
    .map((name) => {
      const filePath = path.join(auditRoot, name)
      return { name, filePath, mtimeMs: statSync(filePath).mtimeMs }
    })
    .sort((a, b) => b.mtimeMs - a.mtimeMs)

  const byKey = new Map()

  for (const file of files) {
    let records
    try {
      records = readJson(file.filePath)
    } catch {
      continue
    }

    if (!Array.isArray(records)) continue

    for (const record of records) {
      if (record.status !== '可保留') continue

      const bookDir = resolveBookDir(record, sourceDirIndex)
      const title = normalizeTitle(record.book || (bookDir ? path.basename(bookDir) : ''))
      if (!title) continue

      const key = bookDir ? path.normalize(bookDir).toLowerCase() : title
      if (byKey.has(key)) continue

      byKey.set(key, {
        title,
        bookDir,
        auditFile: file.name,
        qualityStatus: record.status,
        errorCount: Number(record.error_count || 0),
        warningCount: Number(record.warning_count || 0),
        recommendedAction: record.recommended_action || '',
        mtimeMs: file.mtimeMs,
      })
    }
  }

  return [...byKey.values()]
}

function firstExisting(paths) {
  return paths.find((item) => item && existsSync(item)) || ''
}

function collectAssetState(record) {
  const bookDir = record.bookDir
  const assetsDir = bookDir ? path.join(bookDir, 'assets') : ''
  const processedDir = bookDir ? path.join(bookDir, 'processed') : ''

  const structuredJson = firstExisting([
    path.join(assetsDir, '结构化知识.json'),
    path.join(processedDir, 'structured_json/结构化知识.json'),
  ])
  const summaryMarkdown = firstExisting([
    path.join(assetsDir, '全书摘要.md'),
    path.join(processedDir, 'standard_summary/全书摘要.md'),
  ])
  const topicAnglesMarkdown = firstExisting([
    path.join(assetsDir, '选题角度.md'),
    path.join(processedDir, 'topic_angles/选题角度.md'),
  ])
  const visualHooksMarkdown = firstExisting([
    path.join(assetsDir, '视觉钩子.md'),
    path.join(processedDir, 'visual_hooks/视觉钩子.md'),
  ])

  const assetFiles = existsSync(assetsDir) ? walkFiles(assetsDir) : []
  const knTable = assetFiles.find((file) => /K卡.*N卡|K卡_N卡|K卡N卡|N卡总表/.test(path.basename(file))) || ''

  let structuredCounts = {
    coreQuestions: 0,
    coreConcepts: 0,
    practicalMethods: 0,
    scenarioApplications: 0,
    chapters: 0,
  }
  let structuredEvidence = []

  if (structuredJson) {
    try {
      const structured = readJson(structuredJson)
      structuredCounts = {
        coreQuestions: Array.isArray(structured.core_questions) ? structured.core_questions.length : 0,
        coreConcepts: Array.isArray(structured.core_concepts) ? structured.core_concepts.length : 0,
        practicalMethods: Array.isArray(structured.practical_methods) ? structured.practical_methods.length : 0,
        scenarioApplications: Array.isArray(structured.scenario_applications)
          ? structured.scenario_applications.length
          : 0,
        chapters: Array.isArray(structured.chapter_map) ? structured.chapter_map.length : 0,
      }
      if (structuredCounts.coreConcepts > 0) structuredEvidence.push('structured_core_concepts')
      if (structuredCounts.practicalMethods > 0) structuredEvidence.push('structured_methods')
      if (structuredCounts.scenarioApplications > 0) structuredEvidence.push('structured_scenarios')
      if (structuredCounts.coreQuestions > 0) structuredEvidence.push('structured_core_questions')
    } catch {
      structuredEvidence.push('structured_json_parse_failed')
    }
  }

  if (knTable) structuredEvidence.unshift('kn_table')

  return {
    assetsDir: relativeToWorkspace(assetsDir),
    structuredJson: relativeToWorkspace(structuredJson),
    summaryMarkdown: relativeToWorkspace(summaryMarkdown),
    topicAnglesMarkdown: relativeToWorkspace(topicAnglesMarkdown),
    visualHooksMarkdown: relativeToWorkspace(visualHooksMarkdown),
    knTable: relativeToWorkspace(knTable),
    nkEvidence: structuredEvidence,
    counts: structuredCounts,
  }
}

function readRegisteredTitles() {
  if (!existsSync(registryPath)) return new Set()
  const registry = readJson(registryPath)
  return new Set((registry.books || []).map((book) => book.title).filter(Boolean))
}

function categoryOf(bookDir) {
  const rel = relativeToWorkspace(bookDir)
  const parts = rel.split('/')
  const idx = parts.findIndex((part) => part === '01_books')
  return idx >= 0 ? parts[idx + 1] || '' : ''
}

function priorityIndex(title) {
  const idx = priorityKeywords.findIndex((keyword) => title.includes(keyword))
  return idx >= 0 ? idx : 999
}

function pickCandidates(records) {
  const registeredTitles = readRegisteredTitles()
  const enriched = records
    .map((record) => {
      const assets = collectAssetState(record)
      return {
        ...record,
        assets,
        category: categoryOf(record.bookDir),
        alreadyRegistered: registeredTitles.has(record.title),
        priority: priorityIndex(record.title),
        hasStructuredAsset: Boolean(assets.structuredJson),
        hasNkEvidence: assets.nkEvidence.length > 0,
      }
    })
    .filter((record) => !record.alreadyRegistered)
    .filter((record) => record.hasStructuredAsset && record.hasNkEvidence)

  enriched.sort((a, b) => {
    if (a.priority !== b.priority) return a.priority - b.priority
    const aHasTable = a.assets.knTable ? 0 : 1
    const bHasTable = b.assets.knTable ? 0 : 1
    if (aHasTable !== bHasTable) return aHasTable - bHasTable
    return b.mtimeMs - a.mtimeMs
  })

  const seenTitles = new Set()
  const deduped = []
  for (const record of enriched) {
    const titleKey = record.title.trim()
    if (seenTitles.has(titleKey)) continue
    seenTitles.add(titleKey)
    deduped.push(record)
  }

  return deduped.slice(0, TARGET_COUNT)
}

function buildManifest(candidates, allPassedRecords) {
  const books = candidates.map((record, index) => ({
    slot: index + 1,
    workingId: stableWorkingId(index, record.title),
    title: record.title,
    sourceBookDir: relativeToWorkspace(record.bookDir),
    primaryCategory: record.category,
    slugStatus: 'needs_manual_public_slug',
    siteStatus: 'gray_candidate_not_registered',
    quality: {
      status: record.qualityStatus,
      auditFile: record.auditFile,
      errorCount: record.errorCount,
      warningCount: record.warningCount,
      recommendedAction: record.recommendedAction,
    },
    assets: record.assets,
    layers: {
      sourceLayer: 'ready',
      indexLayer: 'ready_for_gray_registry',
      graphLayer: 'ready_after_builder',
      publicEntryLayer: 'needs_3_to_5_rewritten_pages',
      publicVaultLayer: 'blocked_until_public_rewrite',
    },
    publicRewrite: {
      status: 'not_started',
      policy: 'do_not_publish_raw_vault',
      prompt: '04_operations/04_products_and_experiments/book-kb-multi/vault内容对外改写提示词.md',
      minimumScope: ['book_landing_page', '3_to_5_high_value_k_or_n_pages'],
      fullVaultRewrite: 'defer_until_user_demand_or_topic_priority',
    },
  }))

  return {
    schema: 'BookExpansionGrayManifest.v0.1',
    generatedAt: '2026-04-30',
    target: {
      mode: '50_book_gray_candidate_pool',
      targetCount: TARGET_COUNT,
      selectedCount: books.length,
      existingSiteBookCount: readRegisteredTitles().size,
    },
    selectionPolicy: {
      qualityGate: 'Only records with status == 可保留 are eligible.',
      assetGate: 'Requires structured_json plus K/N evidence from a K/N table or structured card fields.',
      publicationGate: 'Raw vault content must not be public until rewritten with vault内容对外改写提示词.md.',
      slugGate: 'Public slugs remain manual; workingId is only for internal gray tracking.',
    },
    summary: {
      passedQualityRecords: allPassedRecords.length,
      candidateCountAfterGates: books.length,
      booksNeedingPublicRewrite: books.filter((book) => book.publicRewrite.status !== 'ready').length,
      booksReadyForRawPublicVault: 0,
    },
    books,
  }
}

function markdownTableRow(book) {
  return `| ${[
    book.slot,
    book.title.replaceAll('|', '/'),
    book.primaryCategory || '-',
    book.assets.knTable ? 'K/N表' : '结构化NK',
    book.publicRewrite.status,
    book.layers.publicVaultLayer,
  ].join(' | ')} |`
}

function buildReport(manifest) {
  const rows = manifest.books.map(markdownTableRow).join('\n')
  const seedBooks = manifest.books
    .slice(0, 12)
    .map((book) => `- ${book.title}：先做书籍入口页 + 3-5 张公开 K/N 页`)
    .join('\n')

  return `# 50 本灰度接入清单与转写分层

> 日期：2026-04-30
> 关联：\`configs/expansion/50_book_gray_manifest.json\`
> 站内入口：\`/tools/gray-books\`
> 结论：可以先做 50 本灰度候选池，但不能把内部 \`vault\` 原文直接公开。

## 1. 本轮判断

本轮不是“50 本正式公开发布”，而是建立一个可控的灰度池：

\`\`\`text
可保留质检资产
-> 进入灰度候选 manifest
-> 先入索引 / 图谱 / 推荐池
-> 只公开已改写的入口页和少量高价值 K/N 页
-> 按用户点击和内容优先级再逐步扩写
\`\`\`

## 2. 当前数字

| 指标 | 数值 |
| --- | ---: |
| 质检通过记录 | ${manifest.summary.passedQualityRecords} |
| 本轮灰度候选 | ${manifest.target.selectedCount} |
| 当前站内已有书 | ${manifest.target.existingSiteBookCount} |
| 灰度池站内入口 | \`/tools/gray-books\` |
| 可直接公开原始 vault | 0 |
| 需要 public rewrite | ${manifest.summary.booksNeedingPublicRewrite} |

## 3. 分层规则

本轮的 “NK 依据” 有两类：优先使用 \`整本书K卡_N卡总表.md\`；如果某些书没有独立总表，但 \`结构化知识.json\` 里已经有 \`core_concepts\` / \`core_questions\` 等稳定字段，则先标为 \`结构化NK\`，只进入灰度候选，不直接公开。

| 层 | 是否可批量 | 对外状态 |
| --- | --- | --- |
| sourceLayer | 可以 | 内部源资产，必须保留质检记录 |
| indexLayer | 可以 | 可进入灰度索引，但不等于公开正文 |
| graphLayer | 可以 | 可生成节点和关系，用于推荐与路径匹配 |
| publicEntryLayer | 半自动 | 每本先改写书籍入口页和 3-5 个重点 K/N 页 |
| publicVaultLayer | 不批量开放 | 未转写前禁止直接公开 |

## 4. 候选清单

| # | 书名 | 分类 | NK 依据 | 转写状态 | vault 公开状态 |
| ---: | --- | --- | --- | --- | --- |
${rows}

## 5. 建议先做的 12 本入口样张

${seedBooks}

## 6. 执行建议

1. 不要一次性转写全量 vault。
2. 每本只先做 1 个书籍入口页和 3-5 个高价值 K/N 页。
3. 所有公开页必须使用 \`vault内容对外改写提示词.md\` 做降噪。
4. 未转写页面可以参与内部图谱和学习路径推荐，但不出现在公开阅读器里。
5. 等 50 本灰度池通过构建、索引和点击验证后，再决定是否扩到 100+。

## 7. 下一步

\`\`\`text
DEV-030：从 50 本灰度 manifest 里选 5 本，生成 public entry 样张。
\`\`\`
`
}

const records = getLatestPassedAuditRecords()
const candidates = pickCandidates(records)
const manifest = buildManifest(candidates, records)

mkdirSync(outDir, { recursive: true })
mkdirSync(docsDir, { recursive: true })
mkdirSync(path.dirname(publicManifestPath), { recursive: true })
writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8')
writeFileSync(publicManifestPath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8')
writeFileSync(reportPath, buildReport(manifest), 'utf8')

console.log(`wrote ${relativeToWorkspace(manifestPath)}`)
console.log(`wrote ${relativeToWorkspace(publicManifestPath)}`)
console.log(`wrote ${relativeToWorkspace(reportPath)}`)
console.log(`selected ${manifest.target.selectedCount}/${TARGET_COUNT} gray candidates`)
