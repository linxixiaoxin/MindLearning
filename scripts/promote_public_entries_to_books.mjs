#!/usr/bin/env node

import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.resolve(__dirname, '..')
const webPublicRoot = path.join(projectRoot, 'web', 'public')
const publicEntryDir = path.join(projectRoot, 'configs', 'expansion', 'public_entries', '2026-04-30_first_5')
const generatedAt = '2026-04-30'

const promotions = [
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
    heroOverline: 'LIGHT BOOK · THINKING MODELS',
    entryTopics: ['complexity-before-skill'],
    palette: {
      brand: '#204f67',
      accent: '#bf6f3f',
      soft: '#eef3f1',
    },
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
    heroOverline: 'LIGHT BOOK · MANY MODELS',
    entryTopics: ['system-before-blame'],
    palette: {
      brand: '#2e5670',
      accent: '#6f8d66',
      soft: '#eef4f5',
    },
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
    heroOverline: 'LIGHT BOOK · JUDGMENT BIAS',
    entryTopics: ['seeing-before-solving'],
    palette: {
      brand: '#5a5f7d',
      accent: '#bf6f3f',
      soft: '#f2f0f6',
    },
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
    heroOverline: 'LIGHT BOOK · CONVERSATION',
    entryTopics: ['safety-before-skill', 'action-after-understanding'],
    palette: {
      brand: '#5f7356',
      accent: '#9d5667',
      soft: '#f0f4ee',
    },
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
    heroOverline: 'LIGHT BOOK · NOTES TO OUTPUT',
    entryTopics: [],
    palette: {
      brand: '#6d5c93',
      accent: '#bf6f3f',
      soft: '#f2eef6',
    },
  },
]

const nodeTypeMeta = {
  topic: { label: '入口', color: '#6d5c93', size: 11 },
  question: { label: '问题', color: '#204f67', size: 10 },
  concept: { label: '观点', color: '#6f8d66', size: 10 },
  scenario: { label: '场景', color: '#9b6a57', size: 10 },
  method: { label: '练习', color: '#bf6f3f', size: 10 },
  boundary: { label: '边界', color: '#7f8790', size: 9 },
}

const nodePlan = [
  {
    id: '公开入口',
    type: 'topic',
    section: null,
    tagline: '先用一页公开稿理解这本书适合解决什么问题。',
  },
  {
    id: '这本书解决什么',
    type: 'question',
    section: /这本书在(解决什么|讲什么)/,
    tagline: '把书先还原成一个真实问题，而不是一串知识点。',
  },
  {
    id: '核心观点',
    type: 'concept',
    section: /核心观点/,
    tagline: '抓住这本书最值得带走的判断方式。',
  },
  {
    id: '适用场景',
    type: 'scenario',
    section: /你会在什么情况下需要它/,
    tagline: '判断什么时候该打开这本书，而不是盲目补书单。',
  },
  {
    id: '如何阅读',
    type: 'method',
    section: /可以怎么读/,
    tagline: '把阅读动作收束到几个能执行的问题。',
  },
  {
    id: '最小练习',
    type: 'method',
    section: /一个最小练习/,
    tagline: '从理解推进到一次可以试的小动作。',
  },
  {
    id: '使用边界',
    type: 'boundary',
    section: /使用边界/,
    tagline: '提醒这本书不能替你解决什么。',
  },
]

async function main() {
  console.log('promote_public_entries_to_books.mjs is deprecated; running promote_5_books_full_nk.mjs instead.')
  await import('./promote_5_books_full_nk.mjs')
  return

  const registryPath = path.join(webPublicRoot, 'registry', 'books.json')
  const samplePath = path.join(webPublicRoot, 'registry', 'public_entry_samples.json')
  const registry = JSON.parse(await readFile(registryPath, 'utf8'))
  const samples = JSON.parse(await readFile(samplePath, 'utf8'))

  const promotedBooks = []
  for (const promotion of promotions) {
    const draftPath = path.join(publicEntryDir, promotion.draftFile)
    const draft = await readFile(draftPath, 'utf8')
    const parsed = parseDraft(draft)
    const book = buildBookBundle(promotion, parsed)
    await writeBookBundle(promotion, book)
    promotedBooks.push(buildRegistryBook(promotion))
  }

  const promotedSlugs = new Set(promotedBooks.map((book) => book.slug))
  registry.books = [
    ...(registry.books || []).filter((book) => !promotedSlugs.has(book.slug)),
    ...promotedBooks,
  ]
  await writeJson(registryPath, registry)

  const sampleById = new Map(promotions.map((item) => [item.workingId, item]))
  samples.entries = (samples.entries || []).map((entry) => {
    const promotion = sampleById.get(entry.workingId)
    if (!promotion) return entry
    return {
      ...entry,
      status: 'promoted_lightweight',
      siteSlug: promotion.slug,
      sitePath: `/books/${promotion.slug}`,
    }
  })
  samples.promotedCount = samples.entries.filter((entry) => entry.status === 'promoted_lightweight').length
  samples.updatedAt = generatedAt
  await writeJson(samplePath, samples)

  await updateGrayManifest(path.join(projectRoot, 'configs', 'expansion', '50_book_gray_manifest.json'))
  await updateGrayManifest(path.join(webPublicRoot, 'registry', '50_book_gray_manifest.json'))

  console.log(`promoted lightweight books: ${promotedBooks.map((book) => book.slug).join(', ')}`)
}

function parseDraft(text) {
  const withoutFrontmatter = text.replace(/^(?:\uFEFF)?---\r?\n[\s\S]*?\r?\n---\r?\n?/, '').trim()
  const lines = withoutFrontmatter.split(/\r?\n/)
  const h1 = lines.find((line) => line.startsWith('# '))?.replace(/^#\s+/, '').trim() || ''
  const body = lines.join('\n')
  const sections = []
  const matches = [...body.matchAll(/^##\s+(.+)$/gm)]
  for (let index = 0; index < matches.length; index += 1) {
    const current = matches[index]
    const next = matches[index + 1]
    sections.push({
      title: current[1].trim(),
      content: body.slice(current.index, next?.index ?? body.length).trim(),
    })
  }
  return { h1, body, sections }
}

function buildBookBundle(promotion, parsed) {
  const nodes = nodePlan.map((node) => ({
    id: node.id,
    type: node.type,
    tagline: node.tagline,
  }))

  const links = nodePlan
    .filter((node) => node.id !== '公开入口')
    .map((node) => ({ source: '公开入口', target: node.id, type: 'contains' }))

  const linkLabels = Object.fromEntries(links.map((link) => [`${link.source}→${link.target}`, '公开轻量版节点']))
  const overviewImage = `/books/${promotion.slug}/chapter-images/overview.svg`
  const nodeImages = Object.fromEntries(nodes.map((node) => [node.id, overviewImage]))

  return {
    site: {
      title: promotion.title,
      shortTitle: promotion.shortTitle,
      subtitle: promotion.subtitle,
      description: `《${promotion.title}》的正式轻量书页：先提供入口判断、核心观点、适用场景、阅读方式、最小练习和使用边界，后续再继续补充更细的深读内容。`,
      heroOverline: promotion.heroOverline,
      heroTitleLines: [promotion.shortTitle, promotion.subtitle],
      creatorName: '林子-心智进化之路',
      creatorLabel: '整理与输出',
      footerNote: '复杂世界和复杂人性的同行翻译者',
      assetVersion: '20260430-light',
      searchPlaceholder: `搜索《${promotion.shortTitle}》公开节点…`,
      recommendedPath: ['公开入口', '核心观点', '最小练习', '使用边界'],
      quickLinks: ['这本书解决什么', '适用场景', '如何阅读', '最小练习'],
      journeyOverline: 'Lightweight Map',
      journeyTitle: '正式轻量阅读路径',
      journeyDescription: '先用公开改写后的少量节点完成可读、可搜、可跳转的正式接入，再逐步扩展为完整书籍包。',
      journeyEntryLabel: '从公开入口进入',
      journeyMap: [
        {
          level: 'LV.0',
          stage: '入口判断',
          node: '公开入口',
          image: overviewImage,
          summary: '先判断这本书适合解决什么问题，以及为什么值得进入。',
          bridgeToNext: '入口清楚以后，再看它真正要改变哪一种判断方式。',
        },
        {
          level: 'LV.1',
          stage: '主观点',
          node: '核心观点',
          image: overviewImage,
          summary: '抓住这本书最重要的思维转向。',
          bridgeToNext: '观点要落地，下一步需要回到真实使用场景。',
        },
        {
          level: 'LV.2',
          stage: '场景匹配',
          node: '适用场景',
          image: overviewImage,
          summary: '判断哪些卡点适合用这本书来处理。',
          bridgeToNext: '知道什么时候用，还要有一个最小动作开始试。',
        },
        {
          level: 'LV.3',
          stage: '最小行动',
          node: '最小练习',
          image: overviewImage,
          summary: '把理解压缩成一次可执行的小练习。',
          bridgeToNext: '',
        },
      ],
      stats: [
        { label: '公开节点', value: String(nodePlan.length) },
        { label: '当前版本', value: '轻量' },
        { label: '行动练习', value: '1' },
        { label: '后续补全', value: '持续' },
      ],
      slug: promotion.slug,
      author: promotion.author,
      primaryCategory: promotion.primaryCategory,
      secondaryCategory: promotion.secondaryCategory,
    },
    toc: [
      {
        id: 'public-light',
        label: '公开轻量版',
        color: promotion.palette.brand,
        sections: [
          {
            label: '先读这几张',
            items: nodePlan.map((node) => node.id),
          },
        ],
      },
    ],
    homeSections: [
      {
        id: 'core',
        title: '先判断要不要读',
        subtitle: '入口与主问题',
        desc: '先把这本书还原成读者当前可能遇到的问题，再判断它能提供什么帮助。',
        color: promotion.palette.brand,
        nodes: ['公开入口', '这本书解决什么', '核心观点'],
      },
      {
        id: 'action',
        title: '再转成一次行动',
        subtitle: '场景、读法与练习',
        desc: '轻量版不追求一次性完整，而是先给出可用的阅读方向和最小练习。',
        color: promotion.palette.accent,
        nodes: ['适用场景', '如何阅读', '最小练习', '使用边界'],
      },
    ],
    graph: {
      nodeTypeMeta,
      filters: Object.entries(nodeTypeMeta).map(([type, meta]) => ({
        type,
        label: meta.label,
        color: meta.color,
      })),
      nodeImages,
      nodes,
      links,
      linkLabels,
    },
    fileMap: Object.fromEntries(
      nodePlan.map((node) => [node.id, `/books/${promotion.slug}/vault/公开/${node.id}.md`]),
    ),
    aliasMap: {
      [promotion.title]: '公开入口',
      [promotion.shortTitle]: '公开入口',
      [parsed.h1]: '公开入口',
    },
    markdownFiles: buildMarkdownFiles(promotion, parsed),
    coverSvg: buildCoverSvg(promotion),
  }
}

function buildMarkdownFiles(promotion, parsed) {
  const sectionByNode = new Map()
  for (const node of nodePlan) {
    if (!node.section) continue
    const match = parsed.sections.find((section) => node.section.test(section.title))
    if (match) sectionByNode.set(node.id, match.content)
  }

  const files = new Map()
  for (const node of nodePlan) {
    const content = node.id === '公开入口'
      ? parsed.body
      : sectionByNode.get(node.id) || `## ${node.id}\n\n这部分已经进入正式轻量书页，后续会继续补充更细的公开知识页。`

    files.set(node.id, renderMarkdown(promotion, node, content))
  }
  return files
}

function renderMarkdown(promotion, node, content) {
  return `---\ntags: [公开书页, 轻量版]\ncreated: ${generatedAt}\nlayer: public\n---\n\n# ${node.id}\n\n> 这是《${promotion.title}》的正式轻量版节点：先帮你判断这本书怎么用，后续会继续补充更多深读内容。\n\n${content}\n`
}

async function writeBookBundle(promotion, book) {
  const bookDir = path.join(webPublicRoot, 'books', promotion.slug)
  const chapterImageDir = path.join(bookDir, 'chapter-images')
  const vaultDir = path.join(bookDir, 'vault', '公开')
  await mkdir(chapterImageDir, { recursive: true })
  await mkdir(vaultDir, { recursive: true })

  await writeJson(path.join(bookDir, 'site.json'), book.site)
  await writeJson(path.join(bookDir, 'toc.json'), book.toc)
  await writeJson(path.join(bookDir, 'home-sections.json'), book.homeSections)
  await writeJson(path.join(bookDir, 'graph.json'), book.graph)
  await writeJson(path.join(bookDir, 'file-map.json'), book.fileMap)
  await writeJson(path.join(bookDir, 'alias-map.json'), book.aliasMap)
  await writeFile(path.join(chapterImageDir, 'overview.svg'), book.coverSvg, 'utf8')

  for (const [nodeId, content] of book.markdownFiles) {
    await writeFile(path.join(vaultDir, `${nodeId}.md`), content, 'utf8')
  }
}

function buildRegistryBook(promotion) {
  return {
    slug: promotion.slug,
    title: promotion.title,
    shortTitle: promotion.shortTitle,
    author: promotion.author,
    primaryCategory: promotion.primaryCategory,
    secondaryCategory: promotion.secondaryCategory,
    status: 'light',
    description: `正式轻量版：已完成入口判断、核心观点、适用场景、读法、练习和边界节点；后续继续补全深层知识页。`,
    coverImage: `/books/${promotion.slug}/chapter-images/overview.svg`,
    entryTopics: promotion.entryTopics,
    stats: [
      { label: '公开节点', value: String(nodePlan.length) },
      { label: '形态', value: '轻量版' },
      { label: '行动练习', value: '1' },
      { label: '状态', value: '已接入' },
    ],
  }
}

function buildCoverSvg(promotion) {
  const { brand, accent, soft } = promotion.palette
  return `<svg xmlns="http://www.w3.org/2000/svg" width="960" height="1280" viewBox="0 0 960 1280" role="img" aria-label="${escapeXml(promotion.title)} 轻量版封面">
  <rect width="960" height="1280" fill="${soft}"/>
  <rect x="72" y="72" width="816" height="1136" rx="36" fill="#fbfaf6" stroke="${brand}" stroke-opacity="0.22" stroke-width="4"/>
  <circle cx="760" cy="220" r="96" fill="${accent}" fill-opacity="0.16"/>
  <circle cx="190" cy="1010" r="132" fill="${brand}" fill-opacity="0.12"/>
  <path d="M188 380 C320 280 450 500 602 380 C700 304 772 350 820 410" fill="none" stroke="${brand}" stroke-width="10" stroke-linecap="round" opacity="0.32"/>
  <path d="M184 470 H776" stroke="${accent}" stroke-width="6" stroke-linecap="round" opacity="0.55"/>
  <text x="120" y="180" font-family="Arial, 'Microsoft YaHei', sans-serif" font-size="30" fill="${brand}" letter-spacing="3">LIGHT BOOK</text>
  <text x="120" y="620" font-family="'Microsoft YaHei', Arial, sans-serif" font-size="74" font-weight="700" fill="#17232b">${escapeXml(promotion.shortTitle)}</text>
  <foreignObject x="120" y="668" width="720" height="180">
    <div xmlns="http://www.w3.org/1999/xhtml" style="font-family:'Microsoft YaHei',Arial,sans-serif;font-size:34px;line-height:1.45;color:${accent};">${escapeXml(promotion.subtitle)}</div>
  </foreignObject>
  <text x="120" y="1120" font-family="'Microsoft YaHei', Arial, sans-serif" font-size="28" fill="#4d5a62">${escapeXml(promotion.author)}</text>
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

  const byId = new Map(promotions.map((item) => [item.workingId, item]))
  manifest.books = (manifest.books || []).map((book) => {
    const promotion = byId.get(book.workingId)
    if (!promotion) return book
    return {
      ...book,
      slugStatus: 'assigned',
      siteStatus: 'registered_lightweight',
      layers: {
        ...book.layers,
        publicEntryLayer: 'promoted_lightweight_book',
        publicVaultLayer: 'blocked_until_full_public_rewrite',
      },
      publicRewrite: {
        ...book.publicRewrite,
        status: 'promoted_lightweight',
        siteSlug: promotion.slug,
        sitePath: `/books/${promotion.slug}`,
        fullVaultRewrite: 'defer_until_user_demand_or_topic_priority',
      },
    }
  })
  manifest.summary = {
    ...(manifest.summary || {}),
    promotedLightweightBooks: promotions.length,
  }
  manifest.updatedAt = generatedAt
  await writeJson(filePath, manifest)
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

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
