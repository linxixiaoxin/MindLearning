<template>
  <div class="archetype-lab">
    <header class="lab-header">
      <div>
        <div class="lab-kicker">ARCHETYPE LAB</div>
        <h1>人格原型实验室</h1>
        <p>把文学人物内核、现代人生处境和游戏规则放到同一张沙盘里，生成更真实的虚拟人、内容选题和故事种子。</p>
      </div>
      <div class="lab-stats" aria-label="实验室状态">
        <span><strong>{{ sourceWorks.length }}</strong> 源作品</span>
        <span><strong>{{ archetypeKernels.length }}</strong> 原型</span>
        <span><strong>{{ virtualPersons.length }}</strong> 虚拟人</span>
        <span><strong>{{ ruleSets.length }}</strong> 规则</span>
      </div>
    </header>

    <section class="lab-layout">
      <aside class="archetype-rail" aria-label="文学原型">
        <div class="panel-title">
          <span>01</span>
          <h2>文学原型</h2>
        </div>
        <div class="archetype-list">
          <button
            v-for="kernel in archetypeKernels"
            :key="kernel.id"
            class="archetype-option"
            :class="{ active: kernel.id === selectedArchetypeId }"
            type="button"
            :style="{ '--accent': kernel.color }"
            @click="selectedArchetypeId = kernel.id"
          >
            <span class="symbol">{{ kernel.symbol }}</span>
            <span>
              <strong>{{ kernel.shortTitle }}</strong>
              <small>{{ kernel.source }}</small>
            </span>
          </button>
        </div>

        <article class="source-note">
          <span>抽取内核</span>
          <p>{{ selectedArchetype.thesis }}</p>
        </article>
      </aside>

      <main class="simulation-panel">
        <div class="panel-title">
          <span>02</span>
          <h2>人生沙盘</h2>
        </div>

        <section class="stage-canvas" :style="{ '--accent': selectedArchetype.color }">
          <div class="stage-node literature">
            <span>文学母本</span>
            <strong>{{ selectedArchetype.sourceWorkTitle || selectedArchetype.shortTitle }}</strong>
          </div>
          <div class="stage-line left"></div>
          <div class="stage-node scene">
            <span>现代处境</span>
            <strong>{{ selectedScene.title }}</strong>
          </div>
          <div class="stage-line right"></div>
          <div class="stage-node rule">
            <span>规则压力</span>
            <strong>{{ selectedRule.title }}</strong>
          </div>
          <div class="stage-core">
            <strong>人格模型</strong>
            <span>{{ selectedArchetype.shortTitle }}</span>
            <small>{{ selectedRule.shortTitle }} · {{ selectedScene.id }}</small>
          </div>
        </section>

        <section class="selector-block">
          <div class="selector-head">
            <span>现代移植</span>
            <strong>{{ selectedScene.context }}</strong>
          </div>
          <div class="choice-grid">
            <button
              v-for="scene in selectedArchetype.scenes"
              :key="scene.id"
              class="choice-btn"
              :class="{ active: scene.id === selectedSceneId }"
              type="button"
              @click="selectedSceneId = scene.id"
            >
              {{ scene.title }}
            </button>
          </div>
        </section>

        <section class="selector-block rule-block">
          <div class="selector-head">
            <span>规则机制</span>
            <strong>{{ selectedRule.pressure }}</strong>
          </div>
          <div class="choice-grid rules">
            <button
              v-for="rule in ruleSets"
              :key="rule.id"
              class="choice-btn"
              :class="{ active: rule.id === selectedRuleId }"
              type="button"
              @click="selectedRuleId = rule.id"
            >
              {{ rule.title }}
            </button>
          </div>
        </section>
      </main>

      <aside class="output-panel" aria-label="输出">
        <div class="panel-title">
          <span>03</span>
          <h2>输出</h2>
        </div>

        <section class="combo-summary" :style="{ '--accent': selectedArchetype.color }">
          <span>当前组合</span>
          <strong>{{ selectedArchetype.shortTitle }} × {{ selectedScene.title }} × {{ selectedRule.title }}</strong>
          <p>{{ selectedScene.conflict }}</p>
          <small>{{ selectedRule.reveal || selectedRule.pressure }}</small>
        </section>

        <div class="output-tabs">
          <button
            v-for="tab in outputTabs"
            :key="tab.id"
            type="button"
            :class="{ active: tab.id === activeOutput }"
            @click="activeOutput = tab.id"
          >
            {{ tab.label }}
          </button>
        </div>

        <section v-if="activeOutput === 'model'" class="output-body">
          <div class="model-row">
            <span>核心需要</span>
            <p>{{ selectedArchetype.lifeModel.need }}</p>
          </div>
          <div class="model-row">
            <span>保护策略</span>
            <p>{{ selectedArchetype.lifeModel.protection }}</p>
          </div>
          <div class="model-row">
            <span>关系脚本</span>
            <p>{{ selectedArchetype.lifeModel.relationScript }}</p>
          </div>
          <div class="model-row">
            <span>成长边界</span>
            <p>{{ selectedArchetype.lifeModel.growthEdge }}</p>
          </div>
          <div v-if="selectedArchetype.lifeModel.misreadRisk" class="model-row">
            <span>误读风险</span>
            <p>{{ selectedArchetype.lifeModel.misreadRisk }}</p>
          </div>
          <div class="model-row dynamic-row">
            <span>场景触发</span>
            <p>{{ selectedScene.context }}</p>
          </div>
          <div class="model-row dynamic-row">
            <span>规则放大</span>
            <p>{{ selectedRule.pressure }}</p>
          </div>
        </section>

        <section v-else-if="activeOutput === 'content'" class="output-body">
          <div class="angle-list">
            <article v-for="angle in selectedScene.contentAngles" :key="angle">
              <span>选题</span>
              <p>{{ angle }}</p>
            </article>
          </div>
          <div class="rule-review">
            <span>复盘问题</span>
            <strong>{{ selectedArchetype.reviewPrompt || selectedRule.reviewPrompt }}</strong>
          </div>
        </section>

        <section v-else class="output-body">
          <article class="story-seed">
            <span>故事种子</span>
            <p>{{ selectedScene.storySeed }}</p>
          </article>
          <div class="mechanic-list">
            <span v-for="mechanic in selectedRule.mechanics" :key="mechanic">{{ mechanic }}</span>
          </div>
          <p class="transplant-text">{{ selectedScene.transplant }}</p>
        </section>
      </aside>
    </section>

    <section class="expert-strip" aria-label="专家评审">
      <article v-for="expert in expertLenses" :key="expert.id">
        <span>{{ expert.title }}</span>
        <p>{{ expert.task }}</p>
      </article>
    </section>

    <section class="kb-dashboard" aria-label="成熟产品知识库呈现">
      <header class="kb-dashboard-head">
        <div>
          <div class="lab-kicker">PRODUCTIZED KNOWLEDGE BASE</div>
          <h2>从静态样张升级为可扩展的人格原型知识库</h2>
          <p>页面现在读取 `archetype-kb/index.json` 与 `archetype-kb/p0_archetype_seed.json`：先用 4 个文学人物样本验证原型、世界和规则能否真正打通。</p>
        </div>
        <span class="kb-status">{{ kbStatusText }}</span>
      </header>

      <div class="kb-metrics">
        <article>
          <span>SourceWork</span>
          <strong>{{ sourceWorks.length }}</strong>
          <p>书籍、小说、剧本、游戏和论文来源</p>
        </article>
        <article>
          <span>ArchetypeKernel</span>
          <strong>{{ structuredArchetypes.length }}</strong>
          <p>从文本中抽取的人格/命运结构</p>
        </article>
        <article>
          <span>VirtualPerson</span>
          <strong>{{ virtualPersons.length }}</strong>
          <p>可进入圆桌的人生模型</p>
        </article>
        <article>
          <span>RuleSet</span>
          <strong>{{ structuredRuleSets.length }}</strong>
          <p>让模式显形的互动规则</p>
        </article>
      </div>

      <section class="pipeline-panel">
        <div class="panel-title">
          <span>04</span>
          <h2>打通链路</h2>
        </div>
        <div class="pipeline-row">
          <article v-for="step in sharedPipeline" :key="step.id">
            <span>{{ step.from }} -> {{ step.to }}</span>
            <p>{{ step.label }}</p>
          </article>
        </div>
      </section>

      <section class="kb-columns">
        <article class="kb-column">
          <div class="column-head">
            <span>源作品候选</span>
            <strong>{{ sourceWorks.length }} items</strong>
          </div>
          <div class="kb-list">
            <div v-for="work in sourceWorks.slice(0, 5)" :key="work.id" class="kb-item">
              <strong>{{ work.title }}</strong>
              <small>{{ work.source_type }} · {{ work.usable_scope }}</small>
              <p>{{ work.notes }}</p>
            </div>
          </div>
        </article>

        <article class="kb-column">
          <div class="column-head">
            <span>虚拟人生样例</span>
            <strong>{{ virtualPersons.length }} items</strong>
          </div>
          <div class="kb-list">
            <div v-for="person in virtualPersons" :key="person.id" class="kb-item">
              <strong>{{ person.name }}</strong>
              <small>{{ person.fictional_level }} · {{ person.privacy_level }}</small>
              <p>{{ person.current_problem }}</p>
            </div>
            <div v-for="user in roundtableSeedUsers.slice(0, 2)" :key="`seed-${user.id}`" class="kb-item muted">
              <strong>{{ user.name }}</strong>
              <small>roundtable seed · {{ user.archetype }}</small>
              <p>{{ user.problem }}</p>
            </div>
          </div>
        </article>

        <article class="kb-column">
          <div class="column-head">
            <span>页面消费者</span>
            <strong>{{ pageConsumers.length }} routes</strong>
          </div>
          <div class="consumer-list">
            <div v-for="consumer in pageConsumers" :key="consumer.route" class="consumer-item">
              <strong>{{ consumer.route }}</strong>
              <p>{{ consumer.role }}</p>
              <div class="read-tags">
                <span v-for="item in consumer.reads" :key="item">{{ item }}</span>
              </div>
            </div>
          </div>
        </article>
      </section>
    </section>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import {
  archetypeKernels as fallbackArchetypeKernels,
  expertLenses as fallbackExpertLenses,
  ruleSets as fallbackRuleSets,
} from '../data/archetypeLabData.js'

const knowledgeBase = ref(null)
const p0Seed = ref(null)
const kbLoadState = ref('loading')
const selectedArchetypeId = ref(fallbackArchetypeKernels[0]?.id || '')
const selectedSceneId = ref(fallbackArchetypeKernels[0]?.scenes?.[0]?.id || '')
const selectedRuleId = ref(fallbackRuleSets[0]?.id || '')
const activeOutput = ref('model')

const outputTabs = [
  { id: 'model', label: '人格卡' },
  { id: 'content', label: '内容线' },
  { id: 'story', label: '故事线' },
]

const fallbackPipeline = [
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
]

const fallbackConsumers = [
  {
    route: '/tools/archetype-lab',
    role: '原型生成和调试器',
    reads: ['ArchetypeKernel', 'LifeScene', 'RuleSet'],
  },
  {
    route: '/tools/roundtable',
    role: '虚拟人生进入问题后的圆桌推演器',
    reads: ['VirtualPerson', 'ProblemCase'],
  },
]

const p0Colors = ['#b65c42', '#9d7045', '#526aa3', '#744f8c']
const p0Symbols = ['祥', '阿', '哈', '罪']

const sourceWorkTitleById = computed(() => {
  const lookup = new Map()
  p0Seed.value?.source_works?.forEach((work) => {
    lookup.set(work.id, work.title)
  })
  return lookup
})

const p0UiArchetypes = computed(() => (
  p0Seed.value?.archetype_cards?.map((card, index) => {
    const personality = card.personality_system || {}
    const ruleSystem = card.rule_system || {}
    const sourceTitle = sourceWorkTitleById.value.get(card.source_work_id) || card.source_work_id || '文学母本'

    return {
      id: card.id,
      title: card.archetype_name,
      shortTitle: card.source_character || card.archetype_name,
      source: `${sourceTitle} / ${card.source_character || '人物原型'}`,
      symbol: p0Symbols[index] || (card.source_character || card.archetype_name || '原').slice(0, 1),
      color: p0Colors[index % p0Colors.length],
      thesis: card.one_sentence,
      sourceWorkTitle: sourceTitle,
      reviewPrompt: ruleSystem.review_question || '',
      lifeModel: {
        need: personality.core_desire || personality.core_lack || '',
        fear: personality.core_fear || '',
        protection: personality.protective_strategy || '',
        relationScript: personality.relationship_script || '',
        growthEdge: personality.growth_edge || '',
        misreadRisk: personality.misread_risk || '',
      },
      signals: ruleSystem.primary_rules || [],
      scenes: (card.modern_migrations || []).map((scene) => ({
        id: scene.id,
        title: scene.title,
        context: scene.scene,
        conflict: scene.scene,
        transplant: `${card.source_character || card.archetype_name}的命运结构迁移到现代场景：${scene.scene}`,
        contentAngles: scene.content_angle ? [scene.content_angle] : [],
        storySeed: scene.story_seed || '',
      })),
    }
  }) || []
))

const p0UiRuleSets = computed(() => (
  p0Seed.value?.rule_cards?.map((rule) => ({
    id: rule.id,
    title: rule.title,
    shortTitle: rule.title.replace(/机制|规则/g, '').slice(0, 4),
    pressure: rule.pressure,
    reveal: (rule.reveals || []).join(' / '),
    mechanics: rule.mechanics || [],
    reviewPrompt: rule.pressure,
  })) || []
))

const normalizedSourceWorks = computed(() => {
  if (p0Seed.value?.source_works?.length) {
    return p0Seed.value.source_works.map((work) => ({
      ...work,
      notes: work.primary_use || work.notes || '',
    }))
  }
  return knowledgeBase.value?.source_works || []
})

const normalizedStructuredArchetypes = computed(() => (
  p0Seed.value?.archetype_cards?.length
    ? p0Seed.value.archetype_cards
    : knowledgeBase.value?.archetype_kernels || []
))

const normalizedRuleSets = computed(() => (
  p0Seed.value?.rule_cards?.length
    ? p0Seed.value.rule_cards
    : knowledgeBase.value?.rule_sets || []
))

const archetypeKernels = computed(() => (
  p0UiArchetypes.value.length
    ? p0UiArchetypes.value
    : knowledgeBase.value?.ui_archetypes?.length
    ? knowledgeBase.value.ui_archetypes
    : fallbackArchetypeKernels
))

const ruleSets = computed(() => (
  p0UiRuleSets.value.length
    ? p0UiRuleSets.value
    : knowledgeBase.value?.ui_rule_sets?.length
    ? knowledgeBase.value.ui_rule_sets
    : fallbackRuleSets
))

const expertLenses = computed(() => (
  knowledgeBase.value?.expert_lenses?.length
    ? knowledgeBase.value.expert_lenses
    : fallbackExpertLenses
))

const sourceWorks = computed(() => normalizedSourceWorks.value)
const structuredArchetypes = computed(() => normalizedStructuredArchetypes.value)
const virtualPersons = computed(() => knowledgeBase.value?.virtual_persons || [])
const structuredRuleSets = computed(() => normalizedRuleSets.value)
const roundtableSeedUsers = computed(() => knowledgeBase.value?.roundtable_seed_users || [])
const sharedPipeline = computed(() => knowledgeBase.value?.shared_pipeline || fallbackPipeline)
const pageConsumers = computed(() => knowledgeBase.value?.page_consumers || fallbackConsumers)
const kbStatusText = computed(() => {
  if (kbLoadState.value === 'ready' && p0Seed.value) return '已连接 P0 文学样本'
  if (kbLoadState.value === 'ready') return '已连接知识库 JSON'
  if (kbLoadState.value === 'error') return '使用内置样例数据'
  return '正在读取知识库'
})

const selectedArchetype = computed(() => (
  archetypeKernels.value.find((kernel) => kernel.id === selectedArchetypeId.value)
  || archetypeKernels.value[0]
  || fallbackArchetypeKernels[0]
))

const selectedScene = computed(() => (
  selectedArchetype.value?.scenes?.find((scene) => scene.id === selectedSceneId.value)
  || selectedArchetype.value?.scenes?.[0]
  || fallbackArchetypeKernels[0].scenes[0]
))

const selectedRule = computed(() => (
  ruleSets.value.find((rule) => rule.id === selectedRuleId.value)
  || ruleSets.value[0]
  || fallbackRuleSets[0]
))

watch(selectedArchetypeId, () => {
  selectedSceneId.value = selectedArchetype.value?.scenes?.[0]?.id || ''
})

watch(archetypeKernels, () => {
  if (!archetypeKernels.value.some((kernel) => kernel.id === selectedArchetypeId.value)) {
    selectedArchetypeId.value = archetypeKernels.value[0]?.id || ''
  }
})

watch(ruleSets, () => {
  if (!ruleSets.value.some((rule) => rule.id === selectedRuleId.value)) {
    selectedRuleId.value = ruleSets.value[0]?.id || ''
  }
})

onMounted(async () => {
  try {
    const [kbResponse, p0Response] = await Promise.all([
      fetch('/archetype-kb/index.json'),
      fetch('/archetype-kb/p0_archetype_seed.json'),
    ])
    if (!kbResponse.ok) throw new Error(`Failed to load KB: ${kbResponse.status}`)
    knowledgeBase.value = await kbResponse.json()
    if (p0Response.ok) {
      p0Seed.value = await p0Response.json()
    }
    kbLoadState.value = 'ready'
  } catch {
    kbLoadState.value = 'error'
  }
})
</script>

<style scoped>
.archetype-lab {
  box-sizing: border-box;
  height: 100%;
  min-height: calc(100vh - 112px);
  overflow-x: hidden;
  overflow-y: auto;
  padding: 28px;
  scrollbar-gutter: stable;
  color: #1d2729;
  background:
    radial-gradient(circle at 10% 8%, rgba(182, 92, 66, 0.16), transparent 30%),
    radial-gradient(circle at 88% 12%, rgba(95, 143, 135, 0.18), transparent 32%),
    linear-gradient(135deg, #f4efe5 0%, #e8efe9 52%, #f1e5d5 100%);
}

.lab-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 24px;
  max-width: 1440px;
  margin: 0 auto 22px;
}

.lab-kicker,
.panel-title span,
.source-note span,
.selector-head span,
.model-row span,
.angle-list span,
.rule-review span,
.story-seed span {
  font-size: 11px;
  font-weight: 800;
  line-height: 1.2;
  letter-spacing: 0;
  text-transform: uppercase;
  color: #6f5545;
}

.lab-header h1 {
  margin: 6px 0 8px;
  font-size: clamp(32px, 5vw, 58px);
  line-height: 0.98;
  letter-spacing: 0;
}

.lab-header p {
  max-width: 760px;
  margin: 0;
  color: #47595a;
  font-size: 16px;
  line-height: 1.7;
}

.lab-stats {
  display: grid;
  grid-template-columns: repeat(4, minmax(72px, 1fr));
  gap: 8px;
  min-width: 380px;
}

.lab-stats span {
  display: grid;
  gap: 3px;
  padding: 12px 14px;
  border: 1px solid rgba(29, 39, 41, 0.12);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.58);
  color: #596765;
}

.lab-stats strong {
  color: #1d2729;
  font-size: 22px;
}

.lab-layout {
  display: grid;
  grid-template-columns: minmax(240px, 0.75fr) minmax(420px, 1.45fr) minmax(300px, 0.9fr);
  gap: 16px;
  max-width: 1440px;
  margin: 0 auto;
}

.archetype-rail,
.simulation-panel,
.output-panel,
.expert-strip article,
.kb-dashboard,
.pipeline-panel,
.kb-column {
  border: 1px solid rgba(29, 39, 41, 0.14);
  border-radius: 8px;
  background: rgba(255, 252, 245, 0.78);
  box-shadow: 0 18px 44px rgba(52, 42, 32, 0.09);
}

.archetype-rail,
.simulation-panel,
.output-panel {
  padding: 18px;
}

.panel-title {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 16px;
}

.panel-title span {
  display: grid;
  place-items: center;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #1d2729;
  color: #f8f1e8;
  letter-spacing: 0;
}

.panel-title h2 {
  margin: 0;
  font-size: 18px;
  letter-spacing: 0;
}

.archetype-list {
  display: grid;
  gap: 10px;
}

.archetype-option {
  display: grid;
  grid-template-columns: 42px 1fr;
  align-items: center;
  gap: 10px;
  width: 100%;
  min-height: 70px;
  padding: 10px;
  border: 1px solid rgba(29, 39, 41, 0.12);
  border-left: 4px solid transparent;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.48);
  color: inherit;
  text-align: left;
  cursor: pointer;
}

.archetype-option.active {
  border-left-color: var(--accent);
  background: #fffaf2;
}

.symbol {
  display: grid;
  place-items: center;
  width: 42px;
  height: 42px;
  border-radius: 50%;
  background: color-mix(in srgb, var(--accent) 16%, #ffffff);
  color: var(--accent);
  font-size: 20px;
  font-weight: 900;
}

.archetype-option strong,
.stage-node strong,
.selector-head strong,
.rule-review strong {
  display: block;
  font-size: 15px;
  line-height: 1.35;
}

.archetype-option small {
  display: block;
  margin-top: 4px;
  color: #66716e;
  font-size: 12px;
}

.source-note {
  margin-top: 18px;
  padding-top: 16px;
  border-top: 1px solid rgba(29, 39, 41, 0.12);
}

.source-note p {
  margin: 8px 0 0;
  color: #425153;
  line-height: 1.7;
}

.stage-canvas {
  position: relative;
  min-height: 280px;
  overflow: hidden;
  border: 1px solid rgba(29, 39, 41, 0.12);
  border-radius: 8px;
  background:
    linear-gradient(90deg, rgba(255, 255, 255, 0.58), rgba(255, 255, 255, 0.22)),
    repeating-linear-gradient(0deg, rgba(29, 39, 41, 0.05) 0 1px, transparent 1px 28px),
    repeating-linear-gradient(90deg, rgba(29, 39, 41, 0.04) 0 1px, transparent 1px 28px);
}

.stage-node {
  position: absolute;
  z-index: 2;
  width: min(28%, 190px);
  min-height: 82px;
  padding: 14px;
  border: 1px solid rgba(29, 39, 41, 0.16);
  border-radius: 8px;
  background: rgba(255, 250, 242, 0.92);
}

.stage-node span {
  display: block;
  margin-bottom: 6px;
  color: #6f5545;
  font-size: 12px;
  font-weight: 800;
}

.stage-node.literature {
  top: 28px;
  left: 26px;
}

.stage-node.scene {
  right: 30px;
  top: 38px;
}

.stage-node.rule {
  left: 50%;
  bottom: 26px;
  transform: translateX(-50%);
}

.stage-core {
  position: absolute;
  z-index: 3;
  top: 50%;
  left: 50%;
  display: grid;
  place-items: center;
  width: 138px;
  height: 138px;
  transform: translate(-50%, -50%);
  border: 12px solid color-mix(in srgb, var(--accent) 28%, #ffffff);
  border-radius: 50%;
  background: #1d2729;
  color: #fff8ec;
  text-align: center;
  box-shadow: 0 18px 40px rgba(29, 39, 41, 0.22);
}

.stage-core strong {
  font-size: 20px;
  line-height: 1.1;
}

.stage-core span {
  max-width: 92px;
  color: rgba(255, 248, 236, 0.88);
  font-size: 13px;
  font-weight: 800;
  line-height: 1.35;
}

.stage-core small {
  color: rgba(255, 248, 236, 0.72);
}

.stage-line {
  position: absolute;
  z-index: 1;
  height: 2px;
  background: linear-gradient(90deg, transparent, var(--accent), transparent);
  opacity: 0.62;
  transform-origin: center;
}

.stage-line.left {
  top: 125px;
  left: 140px;
  width: 36%;
  transform: rotate(18deg);
}

.stage-line.right {
  top: 130px;
  right: 150px;
  width: 35%;
  transform: rotate(-22deg);
}

.selector-block {
  margin-top: 14px;
  padding: 14px;
  border: 1px solid rgba(29, 39, 41, 0.12);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.42);
}

.selector-head {
  display: grid;
  gap: 6px;
  margin-bottom: 12px;
}

.selector-head strong {
  color: #334447;
  font-size: 14px;
  font-weight: 650;
}

.choice-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
}

.choice-grid.rules {
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

.choice-btn,
.output-tabs button {
  min-height: 42px;
  padding: 9px 10px;
  border: 1px solid rgba(29, 39, 41, 0.13);
  border-radius: 8px;
  background: rgba(255, 250, 242, 0.62);
  color: #2f3a3c;
  font-weight: 750;
  line-height: 1.25;
  cursor: pointer;
}

.choice-btn.active,
.output-tabs button.active {
  border-color: color-mix(in srgb, var(--accent, #5f8f87) 46%, #1d2729);
  background: #1d2729;
  color: #fff8ec;
}

.output-tabs {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  margin-bottom: 14px;
}

.output-body {
  display: grid;
  gap: 12px;
}

.model-row,
.combo-summary,
.angle-list article,
.rule-review,
.story-seed,
.transplant-text {
  padding: 12px;
  border: 1px solid rgba(29, 39, 41, 0.1);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.52);
}

.model-row p,
.combo-summary p,
.angle-list p,
.story-seed p,
.transplant-text {
  margin: 6px 0 0;
  color: #425153;
  line-height: 1.65;
}

.combo-summary {
  display: grid;
  gap: 7px;
  margin-bottom: 14px;
  border-color: color-mix(in srgb, var(--accent) 26%, rgba(29, 39, 41, 0.1));
  background:
    linear-gradient(135deg, color-mix(in srgb, var(--accent) 10%, #ffffff), rgba(255, 255, 255, 0.58));
}

.combo-summary strong {
  color: #1d2729;
  font-size: 15px;
  line-height: 1.45;
}

.combo-summary small {
  color: #28554f;
  font-size: 12px;
  font-weight: 800;
  line-height: 1.5;
}

.dynamic-row {
  border-left: 4px solid color-mix(in srgb, var(--accent, #5f8f87) 40%, #ffffff);
}

.angle-list {
  display: grid;
  gap: 10px;
}

.rule-review strong {
  margin-top: 8px;
  color: #1d2729;
  line-height: 1.55;
}

.mechanic-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.mechanic-list span {
  padding: 8px 10px;
  border-radius: 999px;
  background: #e2ede7;
  color: #28554f;
  font-size: 12px;
  font-weight: 800;
}

.expert-strip {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 12px;
  max-width: 1440px;
  margin: 16px auto 0;
}

.expert-strip article {
  min-height: 110px;
  padding: 14px;
}

.expert-strip span {
  color: #1d2729;
  font-weight: 850;
}

.expert-strip p {
  margin: 8px 0 0;
  color: #526260;
  font-size: 13px;
  line-height: 1.55;
}

.kb-dashboard {
  max-width: 1440px;
  margin: 16px auto 0;
  padding: 18px;
}

.kb-dashboard-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 16px;
}

.kb-dashboard-head h2 {
  margin: 6px 0 8px;
  font-size: 24px;
  line-height: 1.18;
  letter-spacing: 0;
}

.kb-dashboard-head p {
  max-width: 780px;
  margin: 0;
  color: #526260;
  line-height: 1.7;
}

.kb-status {
  flex: 0 0 auto;
  padding: 8px 12px;
  border: 1px solid rgba(29, 39, 41, 0.12);
  border-radius: 999px;
  background: #e2ede7;
  color: #28554f;
  font-size: 12px;
  font-weight: 850;
}

.kb-metrics {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;
  margin-bottom: 14px;
}

.kb-metrics article {
  min-height: 112px;
  padding: 14px;
  border: 1px solid rgba(29, 39, 41, 0.1);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.5);
}

.kb-metrics span,
.column-head span,
.pipeline-row span {
  color: #6f5545;
  font-size: 11px;
  font-weight: 850;
  line-height: 1.2;
}

.kb-metrics strong {
  display: block;
  margin: 8px 0 4px;
  color: #1d2729;
  font-size: 30px;
  line-height: 1;
}

.kb-metrics p {
  margin: 0;
  color: #526260;
  font-size: 13px;
  line-height: 1.55;
}

.pipeline-panel {
  padding: 16px;
  box-shadow: none;
}

.pipeline-row {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;
}

.pipeline-row article {
  position: relative;
  min-height: 104px;
  padding: 14px;
  border: 1px solid rgba(29, 39, 41, 0.1);
  border-radius: 8px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.62), rgba(226, 237, 231, 0.58));
}

.pipeline-row article:not(:last-child)::after {
  content: '';
  position: absolute;
  top: 50%;
  right: -10px;
  width: 10px;
  height: 2px;
  background: rgba(29, 39, 41, 0.26);
}

.pipeline-row p {
  margin: 8px 0 0;
  color: #334447;
  line-height: 1.6;
}

.kb-columns {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  margin-top: 14px;
}

.kb-column {
  min-height: 320px;
  padding: 14px;
  box-shadow: none;
}

.column-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 12px;
}

.column-head strong {
  color: #1d2729;
  font-size: 13px;
}

.kb-list,
.consumer-list {
  display: grid;
  gap: 10px;
}

.kb-item,
.consumer-item {
  padding: 12px;
  border: 1px solid rgba(29, 39, 41, 0.1);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.5);
}

.kb-item.muted {
  background: rgba(226, 237, 231, 0.45);
}

.kb-item strong,
.consumer-item strong {
  display: block;
  color: #1d2729;
  font-size: 14px;
  line-height: 1.4;
}

.kb-item small {
  display: block;
  margin-top: 4px;
  color: #6f5545;
  font-size: 12px;
}

.kb-item p,
.consumer-item p {
  margin: 7px 0 0;
  color: #526260;
  font-size: 13px;
  line-height: 1.6;
}

.read-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 10px;
}

.read-tags span {
  padding: 6px 8px;
  border-radius: 999px;
  background: #f1e5d5;
  color: #6f5545;
  font-size: 11px;
  font-weight: 850;
}

@media (max-width: 1180px) {
  .lab-layout {
    grid-template-columns: 1fr;
  }

  .archetype-list {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .expert-strip,
  .kb-metrics,
  .pipeline-row,
  .kb-columns {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .pipeline-row article:not(:last-child)::after {
    display: none;
  }
}

@media (max-width: 760px) {
  .archetype-lab {
    padding: 18px;
  }

  .lab-header {
    display: grid;
  }

  .lab-stats,
  .archetype-list,
  .choice-grid,
  .choice-grid.rules,
  .expert-strip,
  .kb-metrics,
  .pipeline-row,
  .kb-columns {
    grid-template-columns: 1fr;
    min-width: 0;
  }

  .kb-dashboard-head {
    display: grid;
  }

  .stage-canvas {
    min-height: 420px;
  }

  .stage-node {
    position: relative;
    top: auto;
    left: auto;
    right: auto;
    bottom: auto;
    width: auto;
    margin: 12px;
  }

  .stage-node.rule {
    left: auto;
    transform: none;
  }

  .stage-core {
    position: relative;
    top: auto;
    left: auto;
    margin: 18px auto;
    transform: none;
  }

  .stage-line {
    display: none;
  }
}
</style>
