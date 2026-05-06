import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.resolve(scriptDir, '..')
const kbRoot = path.join(projectRoot, '02_知识库', '人格原型实验室')
const webPublicRoot = path.join(projectRoot, 'web', 'public', 'archetype-kb')
const outputPath = path.join(webPublicRoot, 'index.json')

async function readJson(filePath, fallback = null) {
  try {
    const raw = await readFile(filePath, 'utf8')
    return JSON.parse(raw)
  } catch (error) {
    if (fallback !== null) return fallback
    throw new Error(`Failed to read JSON ${filePath}: ${error.message}`)
  }
}

async function readJsonDirectory(dirPath) {
  let entries = []
  try {
    entries = await readdir(dirPath, { withFileTypes: true })
  } catch {
    return []
  }

  const records = []
  for (const entry of entries) {
    if (!entry.isFile() || !entry.name.endsWith('.json')) continue
    records.push(await readJson(path.join(dirPath, entry.name)))
  }
  return records
}

async function loadUiSeedData() {
  const archetypeModulePath = path.join(projectRoot, 'web', 'src', 'data', 'archetypeLabData.js')
  const roundtableModulePath = path.join(projectRoot, 'web', 'src', 'data', 'roundtableData.js')
  const archetypeModule = await import(pathToFileURL(archetypeModulePath).href)
  const roundtableModule = await import(pathToFileURL(roundtableModulePath).href)

  return {
    ui_archetypes: archetypeModule.archetypeKernels || [],
    ui_rule_sets: archetypeModule.ruleSets || [],
    expert_lenses: archetypeModule.expertLenses || [],
    roundtable_seed_users: (roundtableModule.virtualUserTemplates || []).map((user) => ({
      id: user.id,
      name: user.name,
      archetype: user.archetype,
      status: user.status,
      source: user.source,
      problem: user.problem,
      problem_case_id: user.problemCaseId,
      traits: user.traits || [],
    })),
  }
}

const [
  sourceWorks,
  archetypeKernels,
  virtualPersons,
  lifeScenes,
  ruleSets,
  roundtableSessions,
  uiSeedData,
] = await Promise.all([
  readJson(path.join(kbRoot, '00_registry', 'source_works.json'), []),
  readJsonDirectory(path.join(kbRoot, '02_archetype_kernels')),
  readJsonDirectory(path.join(kbRoot, '03_virtual_persons')),
  readJsonDirectory(path.join(kbRoot, '04_life_scenes')),
  readJsonDirectory(path.join(kbRoot, '05_rule_sets')),
  readJsonDirectory(path.join(kbRoot, '06_roundtable_sessions')),
  loadUiSeedData(),
])

const exportedAt = new Date().toISOString()

const exportPayload = {
  meta: {
    id: 'archetype-lab-kb',
    title: '人格原型实验室知识库',
    version: '0.1.0',
    exported_at: exportedAt,
    source_root: kbRoot.replaceAll(path.sep, '/'),
    product_definition: '文学原型 + 真实生命史 + 家庭/关系脚本 + 游戏规则 + 圆桌推演',
  },
  source_works: sourceWorks,
  archetype_kernels: archetypeKernels,
  virtual_persons: virtualPersons,
  life_scenes: lifeScenes,
  rule_sets: ruleSets,
  roundtable_sessions: roundtableSessions,
  ...uiSeedData,
  shared_pipeline: [
    {
      id: 'source-to-archetype',
      from: 'SourceWork',
      to: 'ArchetypeKernel',
      label: '从作品和理论抽取人格/命运内核',
    },
    {
      id: 'archetype-to-person',
      from: 'ArchetypeKernel',
      to: 'VirtualPerson',
      label: '组合成可进入圆桌的虚拟人生',
    },
    {
      id: 'person-to-roundtable',
      from: 'VirtualPerson',
      to: 'RoundtableSession',
      label: '带着真实问题进入多智能体推演',
    },
    {
      id: 'roundtable-to-output',
      from: 'RoundtableSession',
      to: 'OutputArtifact',
      label: '沉淀为内容、故事、短剧或游戏样张',
    },
  ],
  page_consumers: [
    {
      route: '/tools/archetype-lab',
      role: '原型生成和调试器',
      reads: ['ArchetypeKernel', 'LifeScene', 'RuleSet', 'SourceWork'],
    },
    {
      route: '/tools/roundtable',
      role: '虚拟人生进入问题后的圆桌推演器',
      reads: ['VirtualPerson', 'ProblemCase', 'ArchetypeKernel', 'EvidenceRefs'],
    },
    {
      route: '/tools/content-ops',
      role: '输出物管理和内容回流',
      reads: ['RoundtableSession', 'OutputArtifact'],
    },
  ],
  next_build_steps: [
    '把 archetypeLabData.js 中的 4 个静态原型迁移为 02_archetype_kernels/*.json',
    '把 roundtableData.js 中的虚拟用户迁移为 03_virtual_persons/*.json',
    '继续把已验证样张补成独立 ProblemCase，并绑定到 /tools/roundtable',
    '加入真实用户材料前，先完成 privacy_level 和 review_status 工作流',
  ],
}

await mkdir(webPublicRoot, { recursive: true })
await writeFile(outputPath, `${JSON.stringify(exportPayload, null, 2)}\n`, 'utf8')

console.log(`Exported archetype KB to ${outputPath}`)
console.log(`Objects: ${sourceWorks.length} source works, ${archetypeKernels.length} archetypes, ${virtualPersons.length} virtual persons, ${lifeScenes.length} life scenes, ${ruleSets.length} rule sets, ${roundtableSessions.length} roundtable sessions`)
