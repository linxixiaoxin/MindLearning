#!/usr/bin/env node

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
const oldGrayManifestPath = path.join(projectRoot, 'configs/expansion/50_book_gray_manifest.json')
const outPath = path.join(projectRoot, 'configs/expansion/ready_structured_books_manifest.json')
const publicOutPath = path.join(projectRoot, 'web/public/registry/ready_structured_books_manifest.json')

const generatedAt = '2026-05-03'

function readJson(filePath) {
  return JSON.parse(stripBom(readFileSync(filePath, 'utf8')))
}

function stripBom(value) {
  return value.charCodeAt(0) === 0xfeff ? value.slice(1) : value
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

function titleKey(value = '') {
  return normalizeTitle(value).replace(/\s+/g, ' ')
}

function hashFor(value, length = 10) {
  return createHash('sha1').update(String(value || '')).digest('hex').slice(0, length)
}

function stableWorkingId(record) {
  return `ready-${hashFor(record.bookDir || record.title, 10)}`
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

function getLatestAuditRecords() {
  const sourceDirIndex = buildSourceDirIndex()
  const files = existsSync(auditRoot)
    ? readdirSync(auditRoot)
        .filter((name) => name.endsWith('.json'))
        .map((name) => {
          const filePath = path.join(auditRoot, name)
          return { name, filePath, mtimeMs: statSync(filePath).mtimeMs }
        })
        .sort((a, b) => b.mtimeMs - a.mtimeMs)
    : []

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
    kCards: 0,
    nCards: 0,
  }
  let structuredEvidence = []
  let parseOk = false

  if (structuredJson) {
    try {
      const structured = readJson(structuredJson)
      parseOk = true
      structuredCounts = {
        coreQuestions: Array.isArray(structured.core_questions) ? structured.core_questions.length : 0,
        coreConcepts: Array.isArray(structured.core_concepts) ? structured.core_concepts.length : 0,
        practicalMethods: Array.isArray(structured.practical_methods) ? structured.practical_methods.length : 0,
        scenarioApplications: Array.isArray(structured.scenario_applications)
          ? structured.scenario_applications.length
          : 0,
        chapters: Array.isArray(structured.chapter_map) ? structured.chapter_map.length : 0,
        kCards: Array.isArray(structured.k_cards) ? structured.k_cards.length : 0,
        nCards: Array.isArray(structured.n_cards) ? structured.n_cards.length : 0,
      }
      if (structuredCounts.kCards > 0) structuredEvidence.push('structured_k_cards')
      if (structuredCounts.nCards > 0) structuredEvidence.push('structured_n_cards')
      if (structuredCounts.coreConcepts > 0) structuredEvidence.push('structured_core_concepts')
      if (structuredCounts.coreQuestions > 0) structuredEvidence.push('structured_core_questions')
      if (structuredCounts.practicalMethods > 0) structuredEvidence.push('structured_methods')
      if (structuredCounts.scenarioApplications > 0) structuredEvidence.push('structured_scenarios')
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
    parseOk,
  }
}

function categoryOf(bookDir) {
  const rel = relativeToWorkspace(bookDir)
  const parts = rel.split('/')
  const idx = parts.findIndex((part) => part === '01_books')
  return idx >= 0 ? parts[idx + 1] || '' : ''
}

function readRegistry() {
  if (!existsSync(registryPath)) return { books: [] }
  return readJson(registryPath)
}

function readOldGrayStatus() {
  if (!existsSync(oldGrayManifestPath)) return new Map()
  const manifest = readJson(oldGrayManifestPath)
  const statusBySource = new Map()
  for (const book of manifest.books || []) {
    if (book.sourceBookDir) statusBySource.set(book.sourceBookDir, book)
  }
  return statusBySource
}

function publicSlugFor(record, registryBook, usedSlugs) {
  if (registryBook?.slug) {
    usedSlugs.add(registryBook.slug)
    return registryBook.slug
  }
  const base = `book-${hashFor(record.bookDir || record.title, 10)}`
  let slug = base
  let index = 2
  while (usedSlugs.has(slug)) {
    slug = `${base}-${index}`
    index += 1
  }
  usedSlugs.add(slug)
  return slug
}

function statusFor(record, registryBook, oldGrayBook) {
  if (oldGrayBook?.publicRewrite?.status === 'promoted_full_nk') return 'promoted_full_nk'
  if (registryBook?.publication?.layer === 'public_structured_nk') return 'public_structured_nk'
  if (oldGrayBook?.publicRewrite?.status === 'public_structured_nk') return 'public_structured_nk'
  if (registryBook) return 'registered_existing'
  return 'not_started'
}

function siteStatusFor(status) {
  if (status === 'promoted_full_nk') return 'registered_full_nk'
  if (status === 'public_structured_nk') return 'registered_public_structured_nk'
  if (status === 'registered_existing') return 'registered_existing'
  return 'ready_not_registered'
}

function buildBooks(records) {
  const registry = readRegistry()
  const registryByTitle = new Map((registry.books || []).map((book) => [titleKey(book.title), book]))
  const usedSlugs = new Set((registry.books || []).map((book) => book.slug).filter(Boolean))
  const oldGrayStatus = readOldGrayStatus()

  const enriched = records
    .filter((record) => record.qualityStatus === '可保留')
    .map((record) => {
      const assets = collectAssetState(record)
      return {
        ...record,
        assets,
        category: categoryOf(record.bookDir),
        hasStructuredAsset: Boolean(assets.structuredJson && assets.parseOk),
        hasNkEvidence: assets.nkEvidence.some((item) => item !== 'structured_json_parse_failed'),
      }
    })
    .filter((record) => record.hasStructuredAsset && record.hasNkEvidence)

  enriched.sort((a, b) => {
    const cat = a.category.localeCompare(b.category, 'zh-Hans-CN')
    if (cat !== 0) return cat
    return a.title.localeCompare(b.title, 'zh-Hans-CN')
  })

  return enriched.map((record, index) => {
    const sourceBookDir = relativeToWorkspace(record.bookDir)
    const registryBook = registryByTitle.get(titleKey(record.title))
    const oldGrayBook = oldGrayStatus.get(sourceBookDir)
    const status = statusFor(record, registryBook, oldGrayBook)
    const publicSlug = publicSlugFor(record, registryBook, usedSlugs)
    const generatedLayer = status === 'not_started' ? 'public_structured_nk_pending' : 'public_structured_cards_ready'

    return {
      slot: index + 1,
      workingId: stableWorkingId(record),
      title: record.title,
      sourceBookDir,
      primaryCategory: record.category,
      slugStatus: 'assigned',
      siteStatus: siteStatusFor(status),
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
        indexLayer: 'ready_for_public_registry',
        graphLayer: status === 'not_started' ? 'ready_after_builder' : 'ready',
        publicEntryLayer: status === 'not_started' ? 'public_structured_nk_pending' : status,
        publicVaultLayer: generatedLayer,
      },
      publicRewrite: {
        status,
        policy: 'do_not_publish_raw_vault',
        prompt: '04_operations/04_products_and_experiments/book-kb-multi/vault内容对外改写提示词.md',
        minimumScope: ['book_landing_page', 'structured_k_n_cards'],
        fullVaultRewrite: status === 'not_started' ? 'selected_overrides_only_after_generation' : 'selected_overrides_only',
        siteSlug: status === 'not_started' ? '' : publicSlug,
        sitePath: status === 'not_started' ? '' : `/books/${publicSlug}`,
      },
      publication: {
        layer: status === 'not_started' ? 'public_structured_nk_pending' : 'public_structured_nk',
        curationStatus: 'needs_curated_overrides',
        sourceVisibility: 'private_source',
        overrideDir: `configs/public_overrides/${publicSlug}`,
      },
      publicSlug,
    }
  })
}

function buildManifest(books, records) {
  const notStarted = books.filter((book) => book.publicRewrite.status === 'not_started').length
  const structured = books.filter((book) => book.publicRewrite.status === 'public_structured_nk').length
  const promotedFull = books.filter((book) => book.publicRewrite.status === 'promoted_full_nk').length
  const registeredExisting = books.filter((book) => book.publicRewrite.status === 'registered_existing').length

  return {
    schema: 'BookExpansionReadyStructuredManifest.v0.1',
    generatedAt,
    target: {
      mode: 'all_ready_structured_public_base_layer',
      selectedCount: books.length,
      existingSiteBookCount: readRegistry().books?.length || 0,
      notRegisteredCount: notStarted,
    },
    selectionPolicy: {
      qualityGate: 'Only latest audit records with status == 可保留 are eligible.',
      assetGate: 'Requires readable 结构化知识.json plus K/N evidence from K/N table or structured card fields.',
      publicationGate: 'Raw vault content stays private; public layer is generated public_structured_nk plus optional curated overrides.',
      slugGate: 'Existing registry slugs are preserved; new books receive stable hash slugs until curated manually.',
    },
    summary: {
      latestAuditRecords: records.length,
      passedQualityRecords: records.filter((record) => record.qualityStatus === '可保留').length,
      candidateCountAfterGates: books.length,
      booksNeedingPublicRewrite: 0,
      booksReadyForRawPublicVault: 0,
      promotedFullNkBooks: promotedFull,
      publicStructuredNkBooks: structured,
      registeredExistingBooks: registeredExisting,
      notRegisteredReadyBooks: notStarted,
      basePublicBooks: promotedFull + structured,
      basePublicBooksAfterBuild: promotedFull + structured + notStarted,
    },
    books,
  }
}

const records = getLatestAuditRecords()
const books = buildBooks(records)
const manifest = buildManifest(books, records)

mkdirSync(path.dirname(outPath), { recursive: true })
mkdirSync(path.dirname(publicOutPath), { recursive: true })
writeFileSync(outPath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8')
writeFileSync(publicOutPath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8')

console.log(`wrote ${relativeToWorkspace(outPath)}`)
console.log(`wrote ${relativeToWorkspace(publicOutPath)}`)
console.log(`selected ${manifest.target.selectedCount} ready structured books`)
console.log(`not registered yet: ${manifest.summary.notRegisteredReadyBooks}`)
