<template>
  <div class="tool-wrap">
    <div class="tool-scroll">
      <section class="tool-head">
        <div class="tool-title-block">
          <div class="tool-kicker">PRODUCT EXPERIMENT · THOUGHT PARTNER</div>
          <h1 class="tool-title">思想伙伴选配器</h1>
          <p class="tool-desc">
            从一个真实困境出发，选配一组作者、学科母题和行动路径，形成当前阶段可调用的思想组合。
          </p>
        </div>

        <div class="tool-status">
          <div class="status-label">MVP v0.1</div>
          <div class="status-value">{{ scenes.length }}</div>
          <div class="status-note">个典型困境已配置</div>
        </div>
      </section>

      <div class="tool-grid">
        <section class="chooser-panel">
          <div class="panel-head">
            <div>
              <div class="tool-kicker">STEP 1</div>
              <h2 class="panel-title">选择当前最贴近的困境</h2>
            </div>
            <span class="panel-count">{{ selectedSceneIndex + 1 }} / {{ scenes.length }}</span>
          </div>

          <div class="scene-list">
            <button
              v-for="(scene, index) in scenes"
              :key="scene.id"
              class="scene-option"
              :class="{ active: selectedSceneId === scene.id }"
              @click="selectedSceneId = scene.id"
            >
              <span class="scene-index">{{ String(index + 1).padStart(2, '0') }}</span>
              <span class="scene-copy">
                <span class="scene-title">{{ scene.title }}</span>
                <span class="scene-desc">{{ scene.description }}</span>
              </span>
            </button>
          </div>

          <label class="custom-field">
            <span>补充一句你的真实版本</span>
            <textarea
              v-model="customScene"
              rows="3"
              placeholder="例如：我不是不想改变，只是每次开始前就觉得自己会失败。"
            ></textarea>
          </label>
        </section>

        <section class="signal-panel">
          <div class="panel-head">
            <div>
              <div class="tool-kicker">STEP 2</div>
              <h2 class="panel-title">微调你需要的承接方式</h2>
            </div>
          </div>

          <div class="control-group">
            <div class="control-label">这次更需要什么？</div>
            <div class="segmented">
              <button
                v-for="need in supportNeeds"
                :key="need"
                :class="{ active: selectedNeed === need }"
                @click="selectedNeed = need"
              >
                {{ need }}
              </button>
            </div>
          </div>

          <div class="control-group">
            <div class="control-label">更喜欢哪种表达气质？</div>
            <div class="segmented">
              <button
                v-for="taste in expressionTastes"
                :key="taste"
                :class="{ active: selectedTaste === taste }"
                @click="selectedTaste = taste"
              >
                {{ taste }}
              </button>
            </div>
          </div>

          <div class="control-group">
            <div class="control-label">这次结果主要帮你做什么？</div>
            <div class="goal-grid">
              <button
                v-for="goal in goals"
                :key="goal"
                :class="{ active: selectedGoal === goal }"
                @click="selectedGoal = goal"
              >
                {{ goal }}
              </button>
            </div>
          </div>

          <div class="axis-strip">
            <div class="axis-head">
              <div class="control-label">本次能力轴</div>
              <p>它决定这次从哪些角度理解问题，并影响作者伙伴的匹配权重。</p>
            </div>
            <article
              v-for="axis in resultAxes"
              :key="axis.id"
              class="axis-chip"
              :style="{ '--axis-color': axis.color }"
            >
              <span>{{ axis.label }}</span>
              <small>{{ axis.question }}</small>
            </article>
          </div>
        </section>

        <section class="result-panel">
          <div class="result-top">
            <div>
              <div class="tool-kicker">RESULT</div>
              <h2 class="result-title">你的思想伙伴组合</h2>
              <div v-if="saveStatus" class="save-status">{{ saveStatus }}</div>
            </div>
            <div class="result-actions">
              <button class="save-btn" @click="saveResultCard">保存图片</button>
              <button class="reset-btn" @click="resetSelection">重置</button>
            </div>
          </div>

          <div ref="resultCardRef" class="share-card">
            <div class="share-card-head">
              <div>
                <div class="tool-kicker">THOUGHT PARTNER CARD</div>
                <h3>一张给当前困境的思想搭配卡</h3>
              </div>
              <span class="card-mark">book-kb-multi</span>
            </div>

            <div class="problem-card">
              <div class="problem-label">当前困境</div>
              <p>{{ displayedProblem }}</p>
            </div>

            <div class="match-reason">
              <div class="action-label">为什么这样匹配</div>
              <p>{{ matchReason }}</p>
            </div>

            <div class="metaphor-map">
              <div class="map-title">隐喻关系图</div>
              <div class="map-stage">
                <div class="problem-orbit">
                  <span>当前困境</span>
                  <strong>{{ selectedScene.title }}</strong>
                </div>
                <div
                  v-for="node in metaphorNodes"
                  :key="node.roleId"
                  class="map-node"
                  :class="node.roleId"
                  :style="{ '--node-color': node.color }"
                >
                  <span>{{ node.label }}</span>
                  <strong>{{ node.name }}</strong>
                  <small>{{ node.metaphor }}</small>
                </div>
              </div>
            </div>

            <div class="lens-row">
              <span v-for="lens in selectedScene.lenses" :key="lens">{{ lens }}</span>
            </div>

            <div class="tuning-row">
              <span v-for="signal in tuningSignals" :key="signal">{{ signal }}</span>
            </div>

            <div class="partners">
              <article
                v-for="role in roles"
                :key="role.id"
                class="partner-card"
              >
                <div class="role-meta">
                  <div>
                    <span class="role-label">{{ role.label }}</span>
                    <span class="role-purpose">{{ role.purpose }}</span>
                  </div>
                </div>
                <button class="partner-name-btn" @click="$emit('open-thinker', thinkerIdFor(role.id))">
                  {{ partnerFor(role.id).name }}
                </button>
                <p>{{ partnerFor(role.id).description }}</p>
                <p class="selection-note">{{ selectionNoteFor(role.id) }}</p>
                <div class="concept-row">
                  <span v-for="concept in partnerFor(role.id).concepts" :key="concept">{{ concept }}</span>
                </div>
                <button class="inline-learn-btn" @click="togglePartner(role.id)">
                  {{ expandedPartnerRole === role.id ? '收起轻量说明' : '展开轻量说明' }}
                </button>
                <div v-if="expandedPartnerRole === role.id" class="partner-logic">
                  <div>
                    <span>他怎么帮你想</span>
                    <p>{{ partnerFor(role.id).thinkingLogic }}</p>
                  </div>
                  <div>
                    <span>适合用在</span>
                    <p>{{ partnerFor(role.id).useFor }}</p>
                  </div>
                  <div>
                    <span>起手问题</span>
                    <p>{{ partnerFor(role.id).starterQuestion }}</p>
                  </div>
                </div>
              </article>
            </div>

            <div class="action-block">
              <div>
                <div class="action-label">最小行动</div>
                <p>{{ adaptiveMinimumAction }}</p>
              </div>
            </div>

            <div class="path-block">
              <div class="action-label">继续探索</div>
              <div class="path-row">
                <span v-for="path in selectedScene.nextPaths" :key="path">{{ path }}</span>
              </div>
            </div>
          </div>

          <div class="feedback-panel">
            <div class="feedback-head">
              <div>
                <div class="tool-kicker">ACTION FEEDBACK</div>
                <h3>行动后回馈，生成新的卡片洞察</h3>
              </div>
              <span>AI 接口预留</span>
            </div>
            <textarea
              v-model="actionFeedback"
              rows="4"
              placeholder="做完最小行动后，把真实发生的情况写在这里：你做了什么、卡在哪里、有什么新感受。"
            ></textarea>
            <div class="feedback-actions">
              <button class="save-btn" @click="generateFeedbackInsight">生成洞察卡</button>
              <button class="reset-btn" @click="sendToLocalCodex">发送给本地 Codex</button>
              <button class="reset-btn" @click="checkLocalCodexResponse">检查 Codex 返回</button>
              <button class="reset-btn" @click="checkBridgeStatus">检查桥接状态</button>
              <button class="reset-btn" @click="copyCodexPrompt">复制给 Codex</button>
              <button class="reset-btn" @click="clearFeedback">清空</button>
            </div>
            <div v-if="codexCopyStatus" class="feedback-status">{{ codexCopyStatus }}</div>
            <div v-if="insightError" class="feedback-status warning">{{ insightError }}</div>
            <div v-if="bridgeStatus" class="bridge-status">
              <span :class="{ online: bridgeStatus.ok, offline: !bridgeStatus.ok }">
                {{ bridgeStatus.ok ? '桥接在线' : '桥接离线' }}
              </span>
              <span v-if="bridgeStatus.latestRequestAt">最后请求：{{ formatTime(bridgeStatus.latestRequestAt) }}</span>
              <span v-if="bridgeStatus.latestResponseAt">最后返回：{{ formatTime(bridgeStatus.latestResponseAt) }}</span>
            </div>

            <div class="codex-bridge">
              <textarea
                v-model="codexInsightText"
                rows="3"
                placeholder="也可以把 Codex 返回的 JSON 粘贴到这里，然后应用成洞察卡。"
              ></textarea>
              <button class="reset-btn" @click="applyCodexInsight">应用 Codex 结果</button>
            </div>

            <div v-if="feedbackInsight" ref="insightCardRef" class="insight-card">
              <div class="share-card-head">
                <div>
                  <div class="tool-kicker">REFLECTION CARD</div>
                  <h3>行动回馈洞察卡</h3>
                </div>
                <button class="mini-save" @click="saveInsightCard">保存图片</button>
              </div>
              <div class="insight-section">
                <div class="action-label">我看见的模式</div>
                <p>{{ feedbackInsight.pattern }}</p>
              </div>
              <div class="insight-section">
                <div class="action-label">这说明什么</div>
                <p>{{ feedbackInsight.reading }}</p>
              </div>
              <div class="insight-section">
                <div class="action-label">新的建议</div>
                <p>{{ feedbackInsight.nextAction }}</p>
              </div>
              <div class="path-row">
                <span v-for="tag in feedbackInsight.tags" :key="tag">{{ tag }}</span>
              </div>
              <div class="insight-source">生成方式：{{ insightSourceLabel }}</div>
            </div>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, nextTick, ref, watch } from 'vue'
import { axes, roles, scenes, thinkers } from '../data/thoughtPartnerData.js'

defineEmits(['open-thinker'])

const supportNeeds = ['被安放', '被看见', '被解释', '被挑战', '被推动']
const expressionTastes = ['温柔', '锋利', '结构', '诗性', '行动']
const goals = ['理解自己', '修复关系', '找到行动', '形成表达', '建立体系']

const selectedSceneId = ref(scenes[0].id)
const selectedNeed = ref('被解释')
const selectedTaste = ref('结构')
const selectedGoal = ref('理解自己')
const customScene = ref('')
const actionFeedback = ref('')
const feedbackInsight = ref(null)
const insightSource = ref('')
const insightError = ref('')
const codexCopyStatus = ref('')
const codexInsightText = ref('')
const activeCodexRequestAt = ref('')
const codexPolling = ref(false)
const bridgeStatus = ref(null)
const saveStatus = ref('')
const expandedPartnerRole = ref('')
const resultCardRef = ref(null)
const insightCardRef = ref(null)

const selectedScene = computed(() => scenes.find((scene) => scene.id === selectedSceneId.value) || scenes[0])
const selectedSceneIndex = computed(() => scenes.findIndex((scene) => scene.id === selectedScene.value.id))
const displayedProblem = computed(() => customScene.value.trim() || selectedScene.value.title)
const tuningSignals = computed(() => [
  `承接：${selectedNeed.value}`,
  `气质：${selectedTaste.value}`,
  `目标：${selectedGoal.value}`,
])
const axisUsageText = computed(() => {
  const labels = resultAxes.value.map((axis) => axis.label)
  if (!labels.length) return '系统会先判断这件事该从哪些角度看。'
  return `这次先从“${labels.join(' / ')}”看问题：不是马上给建议，而是先分清它和看法、处境、感受分别有什么关系。`
})
const partnerUsageText = computed(() =>
  roles.map((role) => `${role.label}：${partnerFor(role.id).name}，帮你${roleActionText(role.id)}。起手问题：${partnerFor(role.id).starterQuestion}`),
)
const metaphorNodes = computed(() =>
  roles.map((role) => ({
    roleId: role.id,
    label: role.label,
    name: partnerFor(role.id).name,
    metaphor: roleMetaphorText(role.id),
    color: roleColor(role.id),
  })),
)
const matchReason = computed(() => {
  const mainAxis = axes[selectedScene.value.primaryAxis]?.label || '当前'
  const mainPartner = partnerFor('main').name
  const actionPartner = partnerFor('action').name
  return `这张卡不是在告诉你该读哪本书，而是在给当前困境配一组“思考分工”。${mainPartner}先帮你换一个看问题的镜头，${actionPartner}再把理解收束成一个能做的小动作。`
})
const resultAxes = computed(() => {
  const ids = [selectedScene.value.primaryAxis, ...(selectedScene.value.secondaryAxes || [])]
  return ids.map((id) => axes[id]).filter(Boolean)
})
const resolvedPartnerSet = computed(() => buildResolvedPartnerSet())
const adaptiveMinimumAction = computed(() => {
  const base = selectedScene.value.minimumAction
  if (selectedGoal.value === '找到行动') return `${base} 做完后只记录一个变化：身体、情绪或环境里哪一点松动了。`
  if (selectedGoal.value === '修复关系') return `${base} 再补一句：这件事里我真正想被谁理解，想被理解什么。`
  if (selectedGoal.value === '形成表达') return `${base} 然后把这句话改写成一条可以发给未来自己的标题。`
  if (selectedGoal.value === '建立体系') return `${base} 最后把它归到一个固定栏目：触发物、旧反应、新动作。`
  return base
})

watch(selectedScene, (scene) => {
  selectedNeed.value = scene.supportNeed?.[0] || '被解释'
  selectedTaste.value = scene.expressionTaste?.[0] || '结构'
  selectedGoal.value = inferGoal(scene.primaryAxis)
  feedbackInsight.value = null
})

function inferGoal(axis) {
  if (axis === 'relation') return '修复关系'
  if (axis === 'action') return '找到行动'
  if (axis === 'narrative') return '形成表达'
  if (axis === 'social') return '理解自己'
  return '建立体系'
}

function partnerFor(roleId) {
  const thinkerId = thinkerIdFor(roleId)
  return thinkers[thinkerId] || thinkers.deBotton
}

function thinkerIdFor(roleId) {
  const thinkerId = resolvedPartnerSet.value?.[roleId] || selectedScene.value.partnerSet?.[roleId]
  return thinkers[thinkerId] ? thinkerId : 'deBotton'
}

function togglePartner(roleId) {
  expandedPartnerRole.value = expandedPartnerRole.value === roleId ? '' : roleId
}

function selectionNoteFor(roleId) {
  const role = roles.find((item) => item.id === roleId)
  const partnerName = partnerFor(roleId).name
  const roleText = role?.label || '这个位置'
  const reason = roleSignalReason(roleId)
  return `${partnerName}被放在“${roleText}”，主要因为${reason}。`
}

function roleActionText(roleId) {
  if (roleId === 'main') return '先换一个主视角'
  if (roleId === 'translator') return '把复杂感受说清楚'
  if (roleId === 'calibrator') return '避免把问题看窄'
  if (roleId === 'action') return '把理解变成动作'
  if (roleId === 'expression') return '找到自己的表达方式'
  return '补上一种看法'
}

function roleMetaphorText(roleId) {
  if (roleId === 'main') return '照亮入口'
  if (roleId === 'translator') return '把雾气翻译成人话'
  if (roleId === 'calibrator') return '校准方向'
  if (roleId === 'action') return '铺一块踏脚石'
  if (roleId === 'expression') return '给它一种说法'
  return '补一束光'
}

function roleColor(roleId) {
  if (roleId === 'main') return '#204f67'
  if (roleId === 'translator') return '#bf6f3f'
  if (roleId === 'calibrator') return '#795b9b'
  if (roleId === 'action') return '#5f7d43'
  if (roleId === 'expression') return '#a56a2a'
  return '#75838c'
}

const needRoleWeights = {
  被安放: { translator: 6, expression: 5, action: -2 },
  被看见: { main: 3, translator: 5, expression: 3 },
  被解释: { main: 4, calibrator: 5, translator: 2 },
  被挑战: { calibrator: 6, main: 2, action: 3 },
  被推动: { action: 7, calibrator: 2, translator: -2 },
}

const tasteRoleWeights = {
  温柔: { translator: 5, expression: 4 },
  锋利: { calibrator: 6, main: 2 },
  结构: { main: 2, calibrator: 4, action: 3 },
  诗性: { expression: 7, translator: 2 },
  行动: { action: 7, calibrator: 2 },
}

const tasteThinkerWeights = {
  温柔: ['deBotton', 'bachelard', 'nvc'],
  锋利: ['han', 'foucault', 'sontag', 'bourdieu', 'goffman'],
  结构: ['berger', 'lTeacher', 'fogg', 'evaIllouz'],
  诗性: ['bachelard', 'adamPhillips', 'deBotton', 'liXinpin'],
  行动: ['lTeacher', 'fogg', 'nvc', 'decerteau'],
}

const goalRoleWeights = {
  理解自己: { main: 4, translator: 2 },
  修复关系: { action: 4, translator: 3, main: 1 },
  找到行动: { action: 8, calibrator: 2 },
  形成表达: { expression: 8, translator: 2 },
  建立体系: { calibrator: 7, main: 3, action: 2 },
}

const goalThinkerWeights = {
  理解自己: ['deBotton', 'adamPhillips', 'bachelard'],
  修复关系: ['nvc', 'evaIllouz', 'goffman', 'adamPhillips'],
  找到行动: ['lTeacher', 'fogg', 'nvc', 'decerteau'],
  形成表达: ['bachelard', 'adamPhillips', 'liXinpin', 'deBotton'],
  建立体系: ['foucault', 'bourdieu', 'han', 'berger', 'sontag'],
}

function buildResolvedPartnerSet() {
  const used = new Set()
  const result = {}

  for (const role of roles) {
    const chosenId = chooseThinkerForRole(role.id, used)
    result[role.id] = chosenId
    used.add(chosenId)
  }

  return result
}

function chooseThinkerForRole(roleId, used) {
  const entries = Object.entries(thinkers)
    .filter(([id]) => !used.has(id))
    .map(([id, thinker], index) => ({
      id,
      score: scoreThinkerForRole(id, thinker, roleId),
      index,
    }))
    .sort((a, b) => b.score - a.score || a.index - b.index)

  return entries[0]?.id || selectedScene.value.partnerSet?.[roleId] || 'deBotton'
}

function scoreThinkerForRole(id, thinker, roleId) {
  const primaryAxis = selectedScene.value.primaryAxis
  const secondaryAxes = selectedScene.value.secondaryAxes || []
  let score = 0

  if (selectedScene.value.partnerSet?.[roleId] === id) score += roleId === 'main' ? 7 : 3
  if (thinker.roleFit?.includes(roleId)) score += 4
  if (thinker.axis?.includes(primaryAxis)) score += 3
  score += secondaryAxes.filter((axis) => thinker.axis?.includes(axis)).length
  score += needRoleWeights[selectedNeed.value]?.[roleId] || 0
  score += tasteRoleWeights[selectedTaste.value]?.[roleId] || 0
  score += goalRoleWeights[selectedGoal.value]?.[roleId] || 0
  if (tasteThinkerWeights[selectedTaste.value]?.includes(id)) score += 5
  if (goalThinkerWeights[selectedGoal.value]?.includes(id)) score += 4
  if (selectedScene.value.partnerSet && Object.values(selectedScene.value.partnerSet).includes(id)) score += roleId === 'main' ? 1 : 0

  return score
}

function roleSignalReason(roleId) {
  const needScore = needRoleWeights[selectedNeed.value]?.[roleId] || 0
  const tasteScore = tasteRoleWeights[selectedTaste.value]?.[roleId] || 0
  const goalScore = goalRoleWeights[selectedGoal.value]?.[roleId] || 0
  const strongest = [
    { label: `承接方式“${selectedNeed.value}”`, score: needScore },
    { label: `表达气质“${selectedTaste.value}”`, score: tasteScore },
    { label: `当前目标“${selectedGoal.value}”`, score: goalScore },
  ].sort((a, b) => b.score - a.score)[0]

  if (strongest?.score > 0) return strongest.label
  return '它和当前困境的能力轴最贴近'
}

function resetSelection() {
  selectedSceneId.value = scenes[0].id
  selectedNeed.value = '被解释'
  selectedTaste.value = '结构'
  selectedGoal.value = '理解自己'
  customScene.value = ''
  clearFeedback()
}

function clearFeedback() {
  actionFeedback.value = ''
  feedbackInsight.value = null
  insightSource.value = ''
  insightError.value = ''
  codexCopyStatus.value = ''
  codexInsightText.value = ''
  activeCodexRequestAt.value = ''
  codexPolling.value = false
  bridgeStatus.value = null
}

const insightSourceLabel = computed(() => {
  if (insightSource.value === 'ai') return 'AI 接口'
  if (insightSource.value === 'codex') return 'Codex 回填'
  if (insightSource.value === 'local') return '本地规则兜底'
  return '未生成'
})

async function generateFeedbackInsight() {
  const text = actionFeedback.value.trim()
  if (!text) {
    feedbackInsight.value = buildEmptyFeedbackInsight()
    insightSource.value = 'local'
    return
  }

  insightError.value = ''
  codexCopyStatus.value = ''

  try {
    const response = await fetch('/.netlify/functions/thought-partner-insight', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(buildInsightPayload()),
    })
    const data = await response.json().catch(() => ({}))
    if (!response.ok || !data.insight) {
      throw new Error(data.error || 'AI 接口暂不可用')
    }

    feedbackInsight.value = normalizeInsight(data.insight)
    insightSource.value = data.source || 'ai'
    return
  } catch (error) {
    insightError.value = `AI 接口暂未接通，已先使用本地规则版。可点“复制给 Codex”在当前对话里生成真实洞察。`
    feedbackInsight.value = buildLocalFeedbackInsight(text)
    insightSource.value = 'local'
  }
}

function buildEmptyFeedbackInsight() {
  return {
    pattern: '你还没有写下行动后的真实反馈。先保留这张思想伙伴卡，等做完最小行动后再回来补一段具体发生的事。',
    reading: '这一步不是为了证明你做得好不好，而是为了把“想改变”变成一段可被观察的材料。',
    nextAction: adaptiveMinimumAction.value,
    tags: ['待回馈', axes[selectedScene.value.primaryAxis]?.label || '观察', selectedGoal.value],
  }
}

function buildLocalFeedbackInsight(text) {
  const hasBlock = /没|不|卡|难|怕|焦虑|累|失败|拖|烦/.test(text)
  const hasAction = /做|写|试|改|说|问|整理|记录|完成/.test(text)
  const mainAxis = axes[selectedScene.value.primaryAxis]?.label || '当前'
  const actionName = partnerFor('action').name

  return {
    pattern: hasBlock
      ? `你的反馈里已经出现了一个阻力点：行动不是没有发生，而是在“${mainAxis}”轴上遇到了旧的保护方式。`
      : `你的反馈里出现了一个可继续放大的线索：你已经把抽象困境转成了一个可观察的小现场。`,
    reading: hasAction
      ? `这说明当前最有价值的不是继续找更多解释，而是追踪这个动作带来的感受变化、关系变化或环境变化。`
      : `这说明你可能还停在理解阶段，下一步需要把洞察压缩到更小、更低摩擦的动作里。`,
    nextAction: `下一次只做一个更小的版本：用 ${actionName} 的行动视角，把这件事拆成“触发时刻 + 一个动作 + 做完后的身体感受”三行记录。`,
    tags: [mainAxis, selectedNeed.value, selectedTaste.value, selectedGoal.value],
  }
}

function buildInsightPayload() {
  return {
    sceneTitle: selectedScene.value.title,
    displayedProblem: displayedProblem.value,
    primaryAxis: axes[selectedScene.value.primaryAxis]?.label || selectedScene.value.primaryAxis,
    supportNeed: selectedNeed.value,
    expressionTaste: selectedTaste.value,
    selectedGoal: selectedGoal.value,
    lenses: selectedScene.value.lenses,
    partners: roles.map((role) => ({
      role: role.label,
      purpose: role.purpose,
      name: partnerFor(role.id).name,
      description: partnerFor(role.id).description,
      concepts: partnerFor(role.id).concepts,
    })),
    minimumAction: adaptiveMinimumAction.value,
    feedback: actionFeedback.value.trim(),
  }
}

function buildCodexPrompt() {
  return [
    '请基于下面这次“思想伙伴选配器”的用户行动反馈，生成一张行动回馈洞察卡。',
    '',
    '要求：',
    '- 用中文。',
    '- 温和、具体、非诊断化。',
    '- 不要做心理疾病诊断，不要夸大结论。',
    '- 输出必须是 JSON，不要加 Markdown 代码块。',
    '- JSON 字段只能包含：pattern, reading, nextAction, tags。',
    '- tags 是 3-5 个短标签。',
    '',
    '输入：',
    JSON.stringify(buildInsightPayload(), null, 2),
    '',
    '输出格式示例：',
    '{"pattern":"...","reading":"...","nextAction":"...","tags":["...","...","..."]}',
  ].join('\n')
}

async function copyCodexPrompt() {
  const prompt = buildCodexPrompt()
  try {
    await navigator.clipboard.writeText(prompt)
    codexCopyStatus.value = '已复制结构化 Prompt，可以直接粘贴给 Codex 生成洞察卡。'
  } catch {
    codexInsightText.value = prompt
    codexCopyStatus.value = '浏览器未允许自动复制，已把 Prompt 放到下方文本框。'
  }
}

async function sendToLocalCodex() {
  try {
    await checkBridgeStatus()
    const response = await fetch('http://127.0.0.1:8787/thought-partner/inbox', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: buildCodexPrompt(),
        insightPayload: buildInsightPayload(),
      }),
    })
    const data = await response.json().catch(() => ({}))
    if (!response.ok || !data.ok) {
      throw new Error(data.error || '本地 Codex 桥接服务未响应')
    }
    activeCodexRequestAt.value = data.receivedAt || ''
    codexCopyStatus.value = '已发送到本地 Codex 收件箱，正在等待 Codex 写回结果。'
    waitForLocalCodexResponse(activeCodexRequestAt.value)
  } catch {
    codexCopyStatus.value = '没有连上本地 Codex 桥接服务。请先运行 npm run codex:bridge，或继续使用“复制给 Codex”。'
  }
}

async function checkBridgeStatus() {
  try {
    const response = await fetch('http://127.0.0.1:8787/status')
    const data = await response.json().catch(() => ({}))
    bridgeStatus.value = response.ok ? data : { ok: false }
    if (response.ok) {
      codexCopyStatus.value = '本地桥接服务在线。注意：Codex 分析仍需要我在当前对话回合里读取并写回。'
    }
  } catch {
    bridgeStatus.value = { ok: false }
    codexCopyStatus.value = '本地桥接服务离线。请先运行 npm run codex:bridge。'
  }
}

async function checkLocalCodexResponse() {
  const applied = await fetchLocalCodexResponse(activeCodexRequestAt.value)
  if (!applied) {
    codexCopyStatus.value = '暂时还没有匹配的 Codex 返回。'
  }
}

function formatTime(value) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

async function waitForLocalCodexResponse(requestReceivedAt) {
  if (codexPolling.value) return
  codexPolling.value = true

  for (let index = 0; index < 60; index += 1) {
    const applied = await fetchLocalCodexResponse(requestReceivedAt)
    if (applied) {
      codexPolling.value = false
      return
    }
    await new Promise((resolve) => window.setTimeout(resolve, 2000))
  }

  codexPolling.value = false
  codexCopyStatus.value = '还没有等到 Codex 返回。你可以稍后点“检查 Codex 返回”。'
}

async function fetchLocalCodexResponse(requestReceivedAt = '') {
  try {
    const response = await fetch('http://127.0.0.1:8787/thought-partner/response')
    const data = await response.json().catch(() => ({}))
    if (!response.ok || !data.insight) return false
    if (requestReceivedAt && data.requestReceivedAt && data.requestReceivedAt !== requestReceivedAt) return false

    feedbackInsight.value = normalizeInsight(data.insight)
    insightSource.value = 'codex'
    insightError.value = ''
    codexCopyStatus.value = '已收到 Codex 返回，并应用成洞察卡。'
    return true
  } catch {
    return false
  }
}

function applyCodexInsight() {
  try {
    const parsed = JSON.parse(codexInsightText.value.trim())
    feedbackInsight.value = normalizeInsight(parsed)
    insightSource.value = 'codex'
    insightError.value = ''
    codexCopyStatus.value = '已应用 Codex 返回的洞察卡。'
  } catch {
    codexCopyStatus.value = '没有解析成功。请粘贴纯 JSON，不要带 Markdown 代码块。'
  }
}

function normalizeInsight(insight) {
  const fallback = buildLocalFeedbackInsight(actionFeedback.value.trim())
  return {
    pattern: String(insight.pattern || fallback.pattern).trim(),
    reading: String(insight.reading || insight.meaning || fallback.reading).trim(),
    nextAction: String(insight.nextAction || insight.suggestion || fallback.nextAction).trim(),
    tags: Array.isArray(insight.tags) && insight.tags.length > 0
      ? insight.tags.slice(0, 5).map((tag) => String(tag).trim()).filter(Boolean)
      : fallback.tags,
  }
}

async function saveResultCard() {
  await saveElementAsPng(resultCardRef.value, `思想伙伴卡-${selectedScene.value.id}.png`, '结果卡')
}

async function saveInsightCard() {
  await saveElementAsPng(insightCardRef.value, `行动回馈洞察卡-${selectedScene.value.id}.png`, '洞察卡')
}

async function saveElementAsPng(element, filename, label = '图片') {
  if (!element) return
  saveStatus.value = `正在生成${label}...`

  try {
    const canvas = await renderElementToCanvas(element)
    const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'))
    if (!blob) throw new Error('Canvas did not produce a PNG blob')

    const fileUrl = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.download = filename
    link.href = fileUrl
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.setTimeout(() => URL.revokeObjectURL(fileUrl), 1000)

    saveStatus.value = `${label}已生成。如果浏览器拦截下载，请查看地址栏或下载列表。`
    window.setTimeout(() => {
      if (saveStatus.value.includes('已生成')) saveStatus.value = ''
    }, 3500)
  } catch (error) {
    saveStatus.value = `${label}保存失败：浏览器不支持当前导出方式。`
  }
}

async function renderElementToCanvas(element) {
  await nextTick()

  const rect = element.getBoundingClientRect()
  const width = Math.max(720, Math.ceil(rect.width))
  const cardData = buildExportCardData()
  const height = measureExportCardHeight(cardData, width)
  const canvas = document.createElement('canvas')
  const ratio = Math.max(2, Math.min(window.devicePixelRatio || 2, 3))
  canvas.width = width * ratio
  canvas.height = height * ratio

  const context = canvas.getContext('2d')
  context.scale(ratio, ratio)
  context.fillStyle = '#f7f5f0'
  context.fillRect(0, 0, width, height)
  drawCardFallback(context, cardData, width, height)

  return canvas
}

function buildExportCardData() {
  return {
    title: '当前困境的思想伙伴卡',
    problem: displayedProblem.value,
    reason: matchReason.value,
    axes: axisUsageText.value,
    tuning: tuningSignals.value.join(' / '),
    partners: partnerUsageText.value,
    metaphorNodes: metaphorNodes.value,
    action: adaptiveMinimumAction.value,
  }
}

function measureExportCardHeight(cardData, width) {
  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d')
  const padding = 36
  const contentWidth = width - padding * 2
  let height = padding
  context.font = '700 34px "Microsoft YaHei", sans-serif'
  height += measureWrappedTextHeight(context, cardData.title, contentWidth, 42)
  height += 34
  height += 330
  height += 30
  const blocks = buildExportBlocks(cardData)

  for (const block of blocks) {
    context.font = '700 18px "Microsoft YaHei", sans-serif'
    height += 26
    context.font = '18px "Microsoft YaHei", sans-serif'
    height += measureWrappedTextHeight(context, block.text, contentWidth, 31)
    height += 22
  }

  return Math.max(900, height + padding)
}

function drawCardFallback(context, cardData, width, height) {
  const padding = 44
  const contentWidth = width - padding * 2
  let y = padding

  context.fillStyle = '#fbfaf6'
  context.fillRect(0, 0, width, height)
  context.fillStyle = '#15222b'
  context.font = '700 34px "Microsoft YaHei", sans-serif'
  y = drawWrappedText(context, cardData.title, padding, y, contentWidth, 42)
  y += 18

  context.strokeStyle = 'rgba(32, 79, 103, 0.18)'
  context.lineWidth = 1
  context.beginPath()
  context.moveTo(padding, y)
  context.lineTo(width - padding, y)
  context.stroke()
  y += 24

  y = drawMetaphorMap(context, cardData, padding, y, contentWidth)
  y += 30

  for (const block of buildExportBlocks(cardData)) {
    context.fillStyle = '#204f67'
    context.font = '700 18px "Microsoft YaHei", sans-serif'
    context.fillText(block.title, padding, y)
    y += 26
    context.fillStyle = '#435766'
    context.font = '18px "Microsoft YaHei", sans-serif'
    y = drawWrappedText(context, block.text, padding, y, contentWidth, 31)
    y += 22
  }
}

function drawMetaphorMap(context, cardData, x, y, width) {
  const mapHeight = 330
  const centerX = x + width / 2
  const centerY = y + mapHeight / 2
  const radius = Math.min(width * 0.29, 190)

  context.fillStyle = 'rgba(32, 79, 103, 0.04)'
  roundedRect(context, x, y, width, mapHeight, 22)
  context.fill()

  context.strokeStyle = 'rgba(32, 79, 103, 0.16)'
  context.setLineDash([6, 7])
  context.beginPath()
  context.arc(centerX, centerY, radius, 0, Math.PI * 2)
  context.stroke()
  context.setLineDash([])

  drawMapBubble(context, centerX, centerY, 74, '#15222b', '当前困境', cardData.problem, 9)

  const positions = [
    { angle: -Math.PI / 2 },
    { angle: -Math.PI / 6 },
    { angle: Math.PI / 5 },
    { angle: Math.PI * 0.78 },
    { angle: Math.PI * 1.18 },
  ]

  cardData.metaphorNodes.forEach((node, index) => {
    const position = positions[index]
    const nodeX = centerX + Math.cos(position.angle) * radius
    const nodeY = centerY + Math.sin(position.angle) * radius
    context.strokeStyle = `${node.color}55`
    context.beginPath()
    context.moveTo(centerX, centerY)
    context.lineTo(nodeX, nodeY)
    context.stroke()
    drawMapBubble(context, nodeX, nodeY, 50, node.color, node.label, node.metaphor, 7)
  })

  return y + mapHeight
}

function drawMapBubble(context, centerX, centerY, radius, color, label, text, maxLength = 8) {
  context.fillStyle = '#fbfaf6'
  context.strokeStyle = `${color}77`
  context.lineWidth = 2
  context.beginPath()
  context.arc(centerX, centerY, radius, 0, Math.PI * 2)
  context.fill()
  context.stroke()

  context.fillStyle = color
  context.textAlign = 'center'
  context.font = '700 13px "Microsoft YaHei", sans-serif'
  context.fillText(label, centerX, centerY - 5)
  context.font = '12px "Microsoft YaHei", sans-serif'
  context.fillText(shortText(text, maxLength), centerX, centerY + 17)
  context.textAlign = 'left'
}

function roundedRect(context, x, y, width, height, radius) {
  context.beginPath()
  context.moveTo(x + radius, y)
  context.arcTo(x + width, y, x + width, y + height, radius)
  context.arcTo(x + width, y + height, x, y + height, radius)
  context.arcTo(x, y + height, x, y, radius)
  context.arcTo(x, y, x + width, y, radius)
  context.closePath()
}

function shortText(text, maxLength) {
  const value = String(text || '')
  return value.length > maxLength ? `${value.slice(0, maxLength)}…` : value
}

function buildExportBlocks(cardData) {
  const blocks = [
    { title: '当前困境', text: cardData.problem },
    { title: '这张卡用来做什么', text: cardData.reason },
    { title: '先从哪里看', text: cardData.axes },
    { title: '你这次想要的承接', text: cardData.tuning },
    { title: '伙伴组合', text: cardData.partners.join('\n') },
    { title: '今天先做一步', text: cardData.action },
  ]
  return blocks
}

function drawWrappedText(context, text, x, y, maxWidth, lineHeight) {
  const paragraphs = String(text || '').split('\n')
  for (const paragraph of paragraphs) {
    const tokens = splitTextForCanvas(paragraph)
    let line = ''

    for (const token of tokens) {
      const nextLine = line + token
      if (context.measureText(nextLine).width > maxWidth && line) {
        context.fillText(line, x, y)
        line = token.trimStart()
        y += lineHeight
      } else {
        line = nextLine
      }
    }

    if (line) {
      context.fillText(line, x, y)
      y += lineHeight
    }
  }

  return y
}

function measureWrappedTextHeight(context, text, maxWidth, lineHeight) {
  let height = 0
  const paragraphs = String(text || '').split('\n')
  for (const paragraph of paragraphs) {
    const tokens = splitTextForCanvas(paragraph)
    let line = ''
    for (const token of tokens) {
      const nextLine = line + token
      if (context.measureText(nextLine).width > maxWidth && line) {
        line = token.trimStart()
        height += lineHeight
      } else {
        line = nextLine
      }
    }
    if (line) height += lineHeight
  }
  return height
}

function splitTextForCanvas(text) {
  return String(text || '').match(/[A-Za-z0-9_.:/+-]+|\s+|./g) || []
}
</script>

<style scoped>
.tool-wrap {
  height: 100%;
  overflow-y: auto;
}

.tool-wrap::-webkit-scrollbar {
  width: 4px;
}

.tool-wrap::-webkit-scrollbar-thumb {
  background: var(--border-strong);
  border-radius: 999px;
}

.tool-scroll {
  max-width: 1280px;
  margin: 0 auto;
  padding: 28px 20px 76px;
}

.tool-head {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 230px;
  gap: 16px;
  align-items: stretch;
}

.tool-title-block,
.tool-status,
.chooser-panel,
.signal-panel,
.result-panel {
  border: 1px solid var(--border-default);
  background: rgba(247, 245, 240, 0.92);
  box-shadow: var(--shadow-sm);
}

.tool-title-block {
  border-radius: 28px;
  padding: 30px 34px;
}

.tool-kicker {
  font-size: 10px;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--text-muted);
}

.tool-title {
  margin-top: 12px;
  font-family: var(--font-serif);
  font-size: clamp(34px, 4vw, 48px);
  line-height: 1.08;
  color: var(--text-primary);
}

.tool-desc {
  margin-top: 14px;
  max-width: 760px;
  color: var(--text-secondary);
  font-size: 15px;
  line-height: 1.8;
}

.tool-status {
  border-radius: 28px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.status-label,
.status-note {
  color: var(--text-muted);
  font-size: 12px;
}

.status-value {
  margin-top: 8px;
  font-family: var(--font-serif);
  font-size: 54px;
  color: var(--accent);
  line-height: 1;
}

.status-note {
  margin-top: 8px;
}

.tool-grid {
  margin-top: 18px;
  display: grid;
  grid-template-columns: minmax(280px, 0.95fr) minmax(260px, 0.78fr) minmax(360px, 1.25fr);
  gap: 16px;
  align-items: start;
}

.chooser-panel,
.signal-panel,
.result-panel {
  border-radius: 24px;
  padding: 20px;
}

.panel-head,
.result-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 16px;
}

.result-actions,
.feedback-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.panel-title,
.result-title {
  margin-top: 6px;
  font-family: var(--font-serif);
  font-size: 25px;
  color: var(--text-primary);
  line-height: 1.2;
}

.panel-count {
  border: 1px solid var(--border-default);
  border-radius: 999px;
  padding: 5px 9px;
  color: var(--text-tertiary);
  font-size: 11px;
  white-space: nowrap;
}

.scene-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.scene-option {
  width: 100%;
  border: 1px solid var(--border-default);
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.72);
  padding: 12px;
  display: flex;
  gap: 12px;
  text-align: left;
  cursor: pointer;
  transition: background 0.18s ease, border-color 0.18s ease, transform 0.18s ease;
}

.scene-option:hover {
  transform: translateY(-1px);
  border-color: rgba(32, 79, 103, 0.22);
}

.scene-option.active {
  background: rgba(32, 79, 103, 0.08);
  border-color: rgba(32, 79, 103, 0.36);
}

.scene-index {
  flex: 0 0 auto;
  width: 28px;
  height: 28px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: var(--brand-soft);
  color: var(--brand);
  font-size: 11px;
  font-weight: 700;
}

.scene-copy {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.scene-title {
  color: var(--text-primary);
  font-size: 14px;
  line-height: 1.35;
}

.scene-desc {
  color: var(--text-tertiary);
  font-size: 12px;
  line-height: 1.6;
}

.custom-field {
  margin-top: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  color: var(--text-tertiary);
  font-size: 12px;
}

.custom-field textarea {
  width: 100%;
  resize: vertical;
  min-height: 84px;
  border: 1px solid var(--border-default);
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.78);
  padding: 12px 14px;
  color: var(--text-primary);
  font: inherit;
  font-size: 13px;
  line-height: 1.7;
  outline: none;
}

.custom-field textarea:focus {
  border-color: rgba(32, 79, 103, 0.35);
  box-shadow: 0 0 0 3px rgba(32, 79, 103, 0.08);
}

.control-group + .control-group {
  margin-top: 20px;
}

.control-label {
  margin-bottom: 10px;
  color: var(--text-secondary);
  font-size: 13px;
}

.segmented,
.goal-grid,
.lens-row,
.tuning-row,
.concept-row,
.path-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.segmented button,
.goal-grid button {
  border: 1px solid var(--border-default);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.72);
  color: var(--text-secondary);
  padding: 8px 11px;
  font-size: 12px;
  cursor: pointer;
}

.segmented button.active,
.goal-grid button.active {
  background: var(--brand);
  border-color: var(--brand);
  color: #f7f5f0;
}

.goal-grid button {
  border-radius: 14px;
}

.axis-strip {
  margin-top: 22px;
  display: grid;
  gap: 10px;
}

.axis-head {
  border: 1px solid var(--border-default);
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.58);
  padding: 12px;
}

.axis-head p {
  margin-top: 4px;
  color: var(--text-tertiary);
  font-size: 12px;
  line-height: 1.55;
}

.axis-chip {
  border-left: 4px solid var(--axis-color);
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.7);
  padding: 12px;
}

.axis-chip span {
  display: block;
  color: var(--text-primary);
  font-weight: 700;
  font-size: 14px;
}

.axis-chip small {
  display: block;
  margin-top: 4px;
  color: var(--text-tertiary);
  line-height: 1.55;
}

.result-panel {
  background:
    linear-gradient(135deg, rgba(255, 255, 255, 0.86), rgba(247, 245, 240, 0.94)),
    rgba(247, 245, 240, 0.92);
}

.reset-btn,
.save-btn,
.mini-save {
  border: 1px solid var(--border-default);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.72);
  color: var(--text-secondary);
  padding: 8px 12px;
  font-size: 12px;
  cursor: pointer;
}

.save-btn {
  background: var(--brand);
  border-color: var(--brand);
  color: #f7f5f0;
}

.save-status {
  margin-top: 7px;
  color: var(--text-tertiary);
  font-size: 12px;
  line-height: 1.5;
}

.mini-save {
  padding: 6px 10px;
  color: var(--brand);
}

.share-card {
  border: 1px solid rgba(32, 79, 103, 0.18);
  border-radius: 22px;
  background:
    linear-gradient(145deg, rgba(255, 255, 255, 0.94), rgba(247, 245, 240, 0.98)),
    #f7f5f0;
  padding: 18px;
}

.share-card-head,
.feedback-head {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: flex-start;
  margin-bottom: 14px;
}

.share-card-head h3,
.feedback-head h3 {
  margin-top: 5px;
  font-family: var(--font-serif);
  color: var(--text-primary);
  font-size: 22px;
  line-height: 1.25;
}

.card-mark,
.feedback-head span {
  border: 1px solid var(--border-default);
  border-radius: 999px;
  padding: 6px 10px;
  color: var(--text-muted);
  font-size: 11px;
  white-space: nowrap;
  background: rgba(255, 255, 255, 0.62);
}

.problem-card,
.action-block,
.path-block,
.match-reason,
.insight-section {
  border: 1px solid var(--border-default);
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.72);
  padding: 16px;
}

.problem-label,
.action-label {
  color: var(--text-muted);
  font-size: 10px;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

.problem-card p,
.action-block p,
.match-reason p,
.insight-section p {
  margin-top: 8px;
  color: var(--text-primary);
  line-height: 1.7;
}

.match-reason {
  margin-top: 10px;
  background: rgba(32, 79, 103, 0.06);
}

.metaphor-map {
  margin-top: 12px;
  border: 1px solid rgba(32, 79, 103, 0.14);
  border-radius: 20px;
  background:
    radial-gradient(circle at center, rgba(32, 79, 103, 0.09), transparent 56%),
    rgba(255, 255, 255, 0.7);
  padding: 16px;
}

.map-title {
  color: var(--text-muted);
  font-size: 10px;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

.map-stage {
  position: relative;
  height: 330px;
  margin-top: 10px;
}

.problem-orbit,
.map-node {
  position: absolute;
  left: 50%;
  top: 50%;
  border: 1px solid rgba(32, 79, 103, 0.16);
  border-radius: 999px;
  background: rgba(251, 250, 246, 0.94);
  box-shadow: 0 10px 28px rgba(17, 27, 34, 0.08);
  transform: translate(-50%, -50%);
  text-align: center;
}

.problem-orbit {
  width: 132px;
  height: 132px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 14px;
}

.problem-orbit span,
.map-node span {
  color: var(--text-muted);
  font-size: 11px;
}

.problem-orbit strong,
.map-node strong {
  margin-top: 5px;
  color: var(--text-primary);
  font-family: var(--font-serif);
  line-height: 1.25;
}

.problem-orbit strong {
  font-size: 15px;
}

.map-node {
  width: 118px;
  min-height: 96px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  border-color: color-mix(in srgb, var(--node-color), transparent 62%);
}

.map-node::before {
  content: "";
  position: absolute;
  inset: -10px;
  border-radius: 999px;
  border: 1px dashed color-mix(in srgb, var(--node-color), transparent 62%);
  pointer-events: none;
}

.map-node strong {
  color: var(--node-color);
  font-size: 16px;
}

.map-node small {
  margin-top: 5px;
  color: var(--text-tertiary);
  line-height: 1.35;
}

.map-node.main {
  transform: translate(-50%, -50%) translate(0, -128px);
}

.map-node.translator {
  transform: translate(-50%, -50%) translate(136px, -54px);
}

.map-node.calibrator {
  transform: translate(-50%, -50%) translate(116px, 92px);
}

.map-node.action {
  transform: translate(-50%, -50%) translate(-116px, 92px);
}

.map-node.expression {
  transform: translate(-50%, -50%) translate(-136px, -54px);
}

.lens-row {
  margin: 14px 0 8px;
}

.lens-row span,
.tuning-row span,
.concept-row span,
.path-row span {
  border-radius: 999px;
  padding: 5px 9px;
  font-size: 11px;
  line-height: 1.35;
}

.lens-row span {
  background: rgba(191, 111, 63, 0.1);
  color: var(--accent);
}

.tuning-row {
  margin-bottom: 14px;
}

.tuning-row span {
  background: rgba(95, 125, 67, 0.1);
  color: #5f7d43;
}

.partners {
  display: grid;
  gap: 10px;
}

.partner-card {
  border: 1px solid var(--border-default);
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.78);
  padding: 15px;
}

.role-meta {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 8px;
  flex-wrap: wrap;
}

.role-label {
  color: var(--brand);
  font-size: 12px;
  font-weight: 700;
}

.role-purpose {
  color: var(--text-muted);
  font-size: 11px;
}

.partner-name-btn {
  margin-top: 8px;
  border: none;
  background: transparent;
  font-family: var(--font-serif);
  color: var(--text-primary);
  font-size: 20px;
  text-align: left;
  cursor: pointer;
  padding: 0;
}

.partner-name-btn:hover {
  color: var(--brand);
  text-decoration: underline;
  text-underline-offset: 3px;
}

.inline-learn-btn {
  margin-top: 10px;
  border: 1px solid rgba(32, 79, 103, 0.16);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.7);
  color: var(--brand);
  padding: 6px 10px;
  font-size: 12px;
  cursor: pointer;
}

.partner-card p {
  margin-top: 6px;
  color: var(--text-secondary);
  font-size: 13px;
  line-height: 1.65;
}

.partner-card .selection-note {
  margin-top: 8px;
  border-left: 3px solid rgba(95, 125, 67, 0.35);
  padding-left: 9px;
  color: #5f7d43;
  font-size: 12px;
}

.partner-logic {
  margin-top: 12px;
  display: grid;
  gap: 8px;
  border-radius: 16px;
  background: rgba(32, 79, 103, 0.05);
  padding: 12px;
}

.partner-logic span {
  color: var(--brand);
  font-size: 11px;
  font-weight: 700;
}

.partner-logic p {
  margin-top: 3px;
  color: var(--text-secondary);
  font-size: 12px;
  line-height: 1.65;
}

.concept-row {
  margin-top: 10px;
}

.concept-row span {
  background: rgba(32, 79, 103, 0.08);
  color: var(--brand);
}

.action-block {
  margin-top: 14px;
  border-color: rgba(95, 125, 67, 0.22);
  background: rgba(95, 125, 67, 0.08);
}

.path-block {
  margin-top: 10px;
}

.path-row {
  margin-top: 10px;
}

.path-row span {
  background: rgba(121, 91, 155, 0.1);
  color: #6c4d8c;
}

.feedback-panel {
  margin-top: 16px;
  border: 1px solid rgba(32, 79, 103, 0.18);
  border-radius: 22px;
  background: rgba(255, 255, 255, 0.7);
  padding: 18px;
}

.feedback-panel textarea {
  width: 100%;
  resize: vertical;
  min-height: 110px;
  border: 1px solid var(--border-default);
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.84);
  padding: 12px 14px;
  color: var(--text-primary);
  font: inherit;
  font-size: 13px;
  line-height: 1.7;
  outline: none;
}

.feedback-panel textarea:focus {
  border-color: rgba(32, 79, 103, 0.35);
  box-shadow: 0 0 0 3px rgba(32, 79, 103, 0.08);
}

.feedback-actions {
  margin-top: 10px;
}

.feedback-status {
  margin-top: 10px;
  color: var(--text-tertiary);
  font-size: 12px;
  line-height: 1.6;
}

.feedback-status.warning {
  color: #8a5a44;
}

.bridge-status {
  margin-top: 10px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  color: var(--text-tertiary);
  font-size: 12px;
}

.bridge-status span {
  border: 1px solid var(--border-default);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.7);
  padding: 5px 9px;
}

.bridge-status .online {
  border-color: rgba(95, 125, 67, 0.28);
  color: #5f7d43;
}

.bridge-status .offline {
  border-color: rgba(138, 90, 68, 0.28);
  color: #8a5a44;
}

.codex-bridge {
  margin-top: 12px;
  display: grid;
  gap: 8px;
}

.codex-bridge textarea {
  min-height: 84px;
}

.insight-card {
  margin-top: 14px;
  border: 1px solid rgba(95, 125, 67, 0.24);
  border-radius: 20px;
  background:
    linear-gradient(145deg, rgba(255, 255, 255, 0.94), rgba(247, 245, 240, 0.98)),
    #f7f5f0;
  padding: 16px;
}

.insight-section + .insight-section {
  margin-top: 10px;
}

.insight-source {
  margin-top: 12px;
  color: var(--text-muted);
  font-size: 11px;
  text-align: right;
}

@media (max-width: 1120px) {
  .tool-grid {
    grid-template-columns: 1fr 1fr;
  }

  .result-panel {
    grid-column: 1 / -1;
  }
}

@media (max-width: 760px) {
  .tool-scroll {
    padding: 18px 14px 58px;
  }

  .tool-head,
  .tool-grid {
    grid-template-columns: 1fr;
  }

  .tool-title-block,
  .tool-status,
  .chooser-panel,
  .signal-panel,
  .result-panel {
    border-radius: 22px;
  }

  .tool-title-block,
  .tool-status,
  .chooser-panel,
  .signal-panel,
  .result-panel {
    padding: 18px;
  }

  .result-top,
  .share-card-head,
  .feedback-head {
    flex-direction: column;
  }

  .result-actions,
  .feedback-actions {
    width: 100%;
    justify-content: flex-start;
  }

  .map-stage {
    height: 520px;
  }

  .map-node.main {
    transform: translate(-50%, -50%) translate(0, -188px);
  }

  .map-node.translator {
    transform: translate(-50%, -50%) translate(0, -72px);
  }

  .map-node.calibrator {
    transform: translate(-50%, -50%) translate(0, 72px);
  }

  .map-node.action {
    transform: translate(-50%, -50%) translate(0, 188px);
  }

  .map-node.expression {
    transform: translate(-50%, -50%) translate(0, 304px);
  }
}
</style>
