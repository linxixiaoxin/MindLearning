<template>
  <div class="tool-wrap">
    <div class="tool-scroll">
      <section class="tool-head">
        <div class="tool-title-block">
          <div class="tool-kicker">从卡点进入 · 换几个镜头</div>
          <h1 class="tool-title">思想伙伴</h1>
          <p class="tool-desc">
            当一个问题只靠自己想不动时，先给它配几种看法：谁负责照亮，谁负责翻译，谁负责校准，谁负责收成行动。
          </p>
        </div>

        <div class="tool-status">
          <div class="status-label">可调用视角</div>
          <div class="status-value">{{ scenes.length }}</div>
          <div class="status-note">个典型处境已配置</div>
        </div>
      </section>

      <div class="tool-grid">
        <section class="chooser-panel">
          <div class="panel-head">
            <div>
              <div class="tool-kicker">先定位</div>
              <h2 class="panel-title">选择最贴近的处境</h2>
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
            <span>补一句你的真实版本</span>
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
              <div class="tool-kicker">再调校</div>
              <h2 class="panel-title">这次需要怎样被承接</h2>
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
              <div class="control-label">这次先看哪几面</div>
              <p>这些轴决定先从哪些角度理解问题，再决定请哪些思想伙伴上桌。</p>
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
              <div class="tool-kicker">结果</div>
              <h2 class="result-title">这次的思考分工</h2>
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
                <div class="tool-kicker">Thought Card</div>
                <h3>一张给当前处境的换镜头卡</h3>
              </div>
              <span class="card-mark">book-kb-multi</span>
            </div>

            <div class="problem-card">
              <div class="problem-label">当前处境</div>
              <p>{{ displayedProblem }}</p>
            </div>

            <div class="match-reason">
              <div class="action-label">为什么这样匹配</div>
              <p>{{ matchReason }}</p>
            </div>

            <div class="metaphor-map">
              <div class="map-title">思考分工图</div>
              <div class="map-stage">
                <div class="problem-orbit">
                  <span>当前处境</span>
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
              <div class="path-actions">
                <button class="calibration-btn" @click="openLearningPath">查看对应练习路线</button>
                <button class="calibration-btn" @click="$emit('open-diagnostic')">我想先校准判断</button>
              </div>
            </div>
          </div>

          <button v-if="!aiDockOpen" class="ai-launcher" type="button" @click="aiDockOpen = true">
            AI
          </button>

          <div v-else class="ai-panel ai-dock-fixed">
            <div class="ai-panel-head">
              <div class="ai-dock-handle">
                <div class="tool-kicker">AI 接口</div>
                <h3>先配置，再对话</h3>
                <p>点一下右上角小标可以收起</p>
              </div>
              <div class="ai-head-actions">
                <span class="ai-mode-badge">{{ useLocalAiConfig ? '页面配置生效' : '使用环境变量' }}</span>
                <button class="mini-toggle-btn" type="button" @click="aiDockOpen = false">
                  收起
                </button>
                <button class="mini-toggle-btn" type="button" @click="toggleAiConfig">
                  {{ aiConfigExpanded ? '收起配置' : '展开配置' }}
                </button>
              </div>
            </div>

            <div>
              <div class="ai-summary">
                <span>当前供应商：{{ aiProviderLabel }}</span>
                <span>模型：{{ aiModel || '未填写' }}</span>
                <span>Base URL：{{ aiBaseUrl || '按供应商默认' }}</span>
              </div>

              <div v-if="aiConfigExpanded" class="ai-config">
                <label class="ai-toggle">
                  <input v-model="useLocalAiConfig" type="checkbox" />
                  <span>启用页面配置，覆盖环境变量</span>
                </label>

                <div class="ai-form">
                  <label class="ai-field">
                    <span>供应商</span>
                    <select v-model="aiProvider">
                      <option value="deepseek">DeepSeek</option>
                      <option value="kimi">Kimi / Moonshot</option>
                      <option value="openai">OpenAI</option>
                      <option value="xiaomi">小米 / 兼容接口</option>
                    </select>
                  </label>

                  <label class="ai-field">
                    <span>API Key</span>
                    <div class="ai-key-row">
                      <input
                        v-model="aiApiKey"
                        :type="showAiKey ? 'text' : 'password'"
                        placeholder="在这里粘贴 API Key"
                      />
                      <button class="mini-toggle-btn" type="button" @click="showAiKey = !showAiKey">
                        {{ showAiKey ? '隐藏' : '显示' }}
                      </button>
                    </div>
                  </label>

                  <label class="ai-field">
                    <span>Base URL</span>
                    <input
                      v-model="aiBaseUrl"
                      type="text"
                      placeholder="例如 https://api.deepseek.com"
                    />
                  </label>

                  <label class="ai-field">
                    <span>Model</span>
                    <input
                      v-model="aiModel"
                      type="text"
                      placeholder="例如 deepseek-chat / kimi-k2.6"
                    />
                  </label>
                </div>

                <div class="ai-actions">
                  <button class="save-btn" @click="saveAiSettings">保存配置</button>
                  <button class="reset-btn" @click="testAiConnection">测试接口</button>
                  <button class="reset-btn" @click="resetAiSettings">恢复默认</button>
                </div>

                <div v-if="aiStatus" class="ai-status">{{ aiStatus }}</div>
              </div>

              <div class="ai-chat">
                <div class="ai-chat-head">
                  <div>
                    <div class="tool-kicker">AI 对话</div>
                    <h3>在这里直接跟它说话</h3>
                  </div>
                  <span>{{ chatStatus || '保留当前页面上下文' }}</span>
                </div>

                <div class="chat-log">
                  <article
                    v-for="item in chatMessages"
                    :key="item.id"
                    class="chat-bubble"
                    :class="item.role"
                  >
                    <span class="chat-role">{{ item.roleLabel }}</span>
                    <p>{{ item.content }}</p>
                  </article>
                </div>

                <textarea
                  v-model="chatDraft"
                  rows="3"
                  placeholder="直接问它：这张卡里我该怎么跟进？或者：帮我把这段话改得更像成熟表达。"
                ></textarea>
                <div class="chat-actions">
                  <button class="save-btn" @click="sendChatMessage">发送</button>
                  <button class="reset-btn" @click="insertChatExample">插入示例</button>
                  <button class="reset-btn" @click="clearChat">清空对话</button>
                </div>
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
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { learningPathIdForThoughtPartnerScene } from '../data/learningPathData.js'
import { axes, roles, scenes, thinkers } from '../data/thoughtPartnerData.js'

const emit = defineEmits(['open-thinker', 'open-diagnostic', 'open-learning-paths'])

const supportNeeds = ['被安放', '被看见', '被解释', '被挑战', '被推动']
const expressionTastes = ['温柔', '锋利', '结构', '诗性', '行动']
const goals = ['理解自己', '修复关系', '找到行动', '形成表达', '建立体系']
const initialScene = scenes[0]

const selectedSceneId = ref(initialScene.id)
const selectedNeed = ref(defaultNeedForScene(initialScene))
const selectedTaste = ref(defaultTasteForScene(initialScene))
const selectedGoal = ref(inferGoal(initialScene.primaryAxis))
const customScene = ref('')
const actionFeedback = ref('')
const feedbackInsight = ref(null)
const insightSource = ref('')
const insightError = ref('')
const codexCopyStatus = ref('')
const codexInsightText = ref('')
const activeCodexRequestAt = ref('')
const activeCodexCommandId = ref('')
const codexPolling = ref(false)
const bridgeStatus = ref(null)
const saveStatus = ref('')
const expandedPartnerRole = ref('')
const resultCardRef = ref(null)
const insightCardRef = ref(null)
const aiConfigExpanded = ref(false)
const aiDockOpen = ref(false)
const aiStorageKey = 'book-kb-multi-thought-partner-ai-settings'
const useLocalAiConfig = ref(false)
const aiProvider = ref('deepseek')
const aiApiKey = ref('')
const aiBaseUrl = ref('')
const aiModel = ref('')
const aiStatus = ref('')
const showAiKey = ref(false)
const chatMessages = ref([
  {
    id: 'welcome',
    role: 'assistant',
    roleLabel: 'AI',
    content: '先把左边配置好，然后你可以直接在这里问我。',
  },
])
const chatDraft = ref('')
const chatStatus = ref('')
const chatBusy = ref(false)
const aiProviderPresets = {
  deepseek: { baseUrl: 'https://api.deepseek.com', model: 'deepseek-chat' },
  kimi: { baseUrl: 'https://api.moonshot.ai/v1', model: 'kimi-k2.6' },
  openai: { baseUrl: 'https://api.openai.com/v1', model: 'gpt-4.1-mini' },
  xiaomi: { baseUrl: '', model: '' },
}

const selectedScene = computed(() => scenes.find((scene) => scene.id === selectedSceneId.value) || scenes[0])
const selectedSceneIndex = computed(() => scenes.findIndex((scene) => scene.id === selectedScene.value.id))
const selectedLearningPathId = computed(() => learningPathIdForThoughtPartnerScene(selectedScene.value))
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

const aiProviderLabel = computed(() => ({
  deepseek: 'DeepSeek',
  kimi: 'Kimi / Moonshot',
  openai: 'OpenAI',
  xiaomi: '小米 / 兼容接口',
}[aiProvider.value] || aiProvider.value || '未选择'))

watch(selectedScene, (scene) => {
  applySceneDefaults(scene)
})

watch(aiProvider, (provider, previousProvider) => {
  syncAiDefaults(provider, previousProvider)
})

onMounted(() => {
  loadAiSettings()
})

function applySceneDefaults(scene) {
  selectedNeed.value = defaultNeedForScene(scene)
  selectedTaste.value = defaultTasteForScene(scene)
  selectedGoal.value = inferGoal(scene.primaryAxis)
  feedbackInsight.value = null
}

function defaultNeedForScene(scene) {
  return scene.supportNeed?.[0] || '被解释'
}

function defaultTasteForScene(scene) {
  return scene.expressionTaste?.[0] || '结构'
}

function inferGoal(axis) {
  if (axis === 'relation') return '修复关系'
  if (axis === 'action') return '找到行动'
  if (axis === 'narrative') return '形成表达'
  if (axis === 'social') return '理解自己'
  return '建立体系'
}

function loadAiSettings() {
  if (!window?.localStorage) {
    syncAiDefaults(aiProvider.value, '')
    return
  }

  try {
    const raw = window.localStorage.getItem(aiStorageKey)
    if (!raw) {
      syncAiDefaults(aiProvider.value, '')
      return
    }

    const parsed = JSON.parse(raw)
    useLocalAiConfig.value = Boolean(parsed.useLocalAiConfig)
    aiProvider.value = parsed.provider || aiProvider.value
    aiApiKey.value = parsed.apiKey || ''
    aiBaseUrl.value = parsed.baseUrl || ''
    aiModel.value = parsed.model || ''
    aiStatus.value = parsed.useLocalAiConfig
      ? '已加载页面 AI 配置。'
      : '已加载保存的字段，但仍在使用环境变量。'
    syncAiDefaults(aiProvider.value, '')
    aiConfigExpanded.value = false
  } catch {
    syncAiDefaults(aiProvider.value, '')
  }
}

function saveAiSettings() {
  try {
    window.localStorage?.setItem(aiStorageKey, JSON.stringify({
      useLocalAiConfig: useLocalAiConfig.value,
      provider: aiProvider.value,
      apiKey: aiApiKey.value,
      baseUrl: aiBaseUrl.value,
      model: aiModel.value,
    }))
    aiStatus.value = useLocalAiConfig.value
      ? `已保存页面 AI 配置：${aiProviderLabel.value}`
      : '已保存字段，当前仍使用环境变量。'
    aiConfigExpanded.value = false
  } catch {
    aiStatus.value = '保存失败，浏览器可能禁用了本地存储。'
  }
}

function resetAiSettings() {
  aiProvider.value = 'deepseek'
  aiApiKey.value = ''
  aiBaseUrl.value = ''
  aiModel.value = ''
  useLocalAiConfig.value = false
  aiStatus.value = '已恢复默认字段。'
  try {
    window.localStorage?.removeItem(aiStorageKey)
  } catch {
    // Ignore storage cleanup failures.
  }
  syncAiDefaults(aiProvider.value, '')
}

function toggleAiConfig() {
  aiConfigExpanded.value = !aiConfigExpanded.value
}

function syncAiDefaults(provider, previousProvider = '') {
  const preset = aiProviderPresets[provider] || aiProviderPresets.deepseek
  const previousPreset = aiProviderPresets[previousProvider] || null

  if (!aiBaseUrl.value || (previousPreset && aiBaseUrl.value === previousPreset.baseUrl)) {
    aiBaseUrl.value = preset.baseUrl
  }
  if (!aiModel.value || (previousPreset && aiModel.value === previousPreset.model)) {
    aiModel.value = preset.model
  }
}

function insertChatExample() {
  if (chatDraft.value.trim()) return
  chatDraft.value = '我想问：这次我应该先从哪里开始跟进？'
}

function clearChat() {
  chatMessages.value = chatMessages.value.slice(0, 1)
  chatDraft.value = ''
  chatStatus.value = '对话已清空'
}

async function sendChatMessage() {
  const message = chatDraft.value.trim()
  if (!message || chatBusy.value) return

  chatBusy.value = true
  chatStatus.value = '正在回复...'
  chatMessages.value = [
    ...chatMessages.value,
    { id: `user-${Date.now()}`, role: 'user', roleLabel: '我', content: message },
  ]
  chatDraft.value = ''

  try {
    const data = await requestChat({
      mode: 'chat',
      message,
      conversation: chatMessages.value,
      context: buildChatContext(),
    })

    chatMessages.value = [
      ...chatMessages.value,
      {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        roleLabel: 'AI',
        content: data.reply || '我暂时没有拿到回复。',
      },
    ]
    chatStatus.value = '已回复'
  } catch (error) {
    chatMessages.value = [
      ...chatMessages.value,
      {
        id: `error-${Date.now()}`,
        role: 'assistant',
        roleLabel: 'AI',
        content: `暂时连不上接口：${error.message || '未知错误'}`,
      },
    ]
    chatStatus.value = '接口未连通'
  } finally {
    chatBusy.value = false
  }
}

function buildChatContext() {
  return {
    sceneTitle: selectedScene.value.title,
    displayedProblem: displayedProblem.value,
    primaryAxis: axes[selectedScene.value.primaryAxis]?.label || selectedScene.value.primaryAxis,
    supportNeed: selectedNeed.value,
    expressionTaste: selectedTaste.value,
    selectedGoal: selectedGoal.value,
    minimumAction: adaptiveMinimumAction.value,
  }
}

async function testAiConnection() {
  const payload = buildInsightPayload('接口连通性测试：请确认当前 AI 配置是否可用，并返回一条简短洞察。')
  aiStatus.value = '正在测试 AI 接口...'

  try {
    const data = await requestInsight(payload)
    if (!data?.insight) throw new Error(data?.error || '接口未返回洞察')
    aiStatus.value = `接口可用：${data.provider || aiProvider.value} / ${data.model || 'unknown'}`
  } catch (error) {
    aiStatus.value = `接口测试失败：${error.message || '未知错误'}`
  }
}

function openLearningPath() {
  emit('open-learning-paths', selectedLearningPathId.value)
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

const presetRoleWeights = {
  main: 8,
  translator: 12,
  calibrator: 12,
  action: 12,
  expression: 12,
}

const roleMismatchPenalty = {
  translator: -1,
  calibrator: -1,
  action: -4,
  expression: -4,
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
      preset: selectedScene.value.partnerSet?.[roleId] === id,
      score: scoreThinkerForRole(id, thinker, roleId),
      index,
    }))
    .sort((a, b) => b.score - a.score || Number(b.preset) - Number(a.preset) || a.index - b.index)

  return entries[0]?.id || selectedScene.value.partnerSet?.[roleId] || 'deBotton'
}

function scoreThinkerForRole(id, thinker, roleId) {
  const primaryAxis = selectedScene.value.primaryAxis
  const secondaryAxes = selectedScene.value.secondaryAxes || []
  const isPresetForRole = selectedScene.value.partnerSet?.[roleId] === id
  let score = 0

  if (isPresetForRole) score += presetRoleWeights[roleId] || 0
  if (thinker.roleFit?.includes(roleId)) score += 4
  else if (!isPresetForRole) score += roleMismatchPenalty[roleId] || 0
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
  selectedSceneId.value = initialScene.id
  applySceneDefaults(initialScene)
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
  activeCodexCommandId.value = ''
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
    const data = await requestInsight(buildInsightPayload(text))
    feedbackInsight.value = normalizeInsight(data.insight)
    insightSource.value = data.source || 'ai'
    return
  } catch (error) {
    insightError.value = `AI 接口暂未连通，已先使用本地规则版。可以点“复制给 Codex”在当前对话里生成真实洞察。`
    feedbackInsight.value = buildLocalFeedbackInsight(text)
    insightSource.value = 'local'
  }
}

async function requestInsight(payload) {
  const response = await fetch('/.netlify/functions/thought-partner-insight', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  const data = await response.json().catch(() => ({}))
  if (!response.ok || !data.insight) {
    throw new Error(data.error || 'AI 接口暂不可用')
  }
  return data
}

async function requestChat(payload) {
  const response = await fetch('/.netlify/functions/thought-partner-insight', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...payload,
      feedback: payload.message,
      aiConfig: useLocalAiConfig.value
        ? {
            useLocalAiConfig: true,
            provider: aiProvider.value,
            apiKey: aiApiKey.value.trim(),
            baseUrl: aiBaseUrl.value.trim(),
            model: aiModel.value.trim(),
          }
        : null,
    }),
  })
  const data = await response.json().catch(() => ({}))
  if (!response.ok || !data.reply) {
    throw new Error(data.error || 'AI 对话接口暂不可用')
  }
  return data
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

function buildInsightPayload(overrideFeedback = '') {
  const aiConfig = useLocalAiConfig.value
    ? {
        useLocalAiConfig: true,
        provider: aiProvider.value,
        apiKey: aiApiKey.value.trim(),
        baseUrl: aiBaseUrl.value.trim(),
        model: aiModel.value.trim(),
      }
    : null

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
    feedback: overrideFeedback || actionFeedback.value.trim(),
    aiConfig,
  }
}

function buildCodexInsightPayload() {
  const payload = buildInsightPayload()
  const { aiConfig, ...sanitizedPayload } = payload
  return sanitizedPayload
}

function buildCodexPrompt() {
  return [
    '请基于下面这次“思想伙伴”卡片的用户行动反馈，生成一张行动回馈洞察卡。',
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
    JSON.stringify(buildCodexInsightPayload(), null, 2),
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
    const payload = buildCodexCommandPayload()
    const response = await fetch('http://127.0.0.1:8787/codex/inbox', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    const data = await response.json().catch(() => ({}))
    if (!response.ok || !data.ok) {
      throw new Error(data.error || '本地 Codex 桥接服务未响应')
    }
    activeCodexCommandId.value = data.id || payload.id
    activeCodexRequestAt.value = data.receivedAt || ''
    codexCopyStatus.value = bridgeStatus.value?.agentAlive
      ? '已发送到本地 Codex Agent，正在等待自动生成洞察卡。'
      : '已发送到本地 Codex 收件箱；桥接在线，但 Agent 暂未在线。'
    waitForLocalCodexResponse(activeCodexRequestAt.value, activeCodexCommandId.value)
  } catch {
    codexCopyStatus.value = '没有连上本地 Codex 桥接服务。请先运行 npm run codex:bridge 和 npm run codex:agent，或继续使用“复制给 Codex”。'
  }
}

function buildCodexCommandPayload() {
  const payload = {
    id: `thought-partner-${Date.now()}`,
    commandType: 'thought-partner-insight',
    commandTypeLabel: '思想伙伴行动回馈洞察',
    executionMode: 'read-only',
    executionModeLabel: '只读',
    requestedSandbox: 'read-only',
    canModifyFiles: false,
    priority: 'normal',
    priorityLabel: '普通',
    commandText: buildCodexPrompt(),
    page: '/tools/thought-partner',
      context: {
      page: {
        view: 'thoughtPartner',
        viewLabel: '思想伙伴',
        path: window.location.pathname + window.location.search,
      },
      insightPayload: buildCodexInsightPayload(),
    },
  }

  payload.prompt = [
    '这是从 book-kb-multi 思想伙伴页面发来的行动回馈洞察请求。',
    '',
    '请生成一张可以直接回填到前端的洞察卡。',
    '重要：由于外层 Codex Agent 必须按固定 schema 回复，请把洞察卡 JSON 作为 reply 字段的完整内容。',
    'reply 字段中不要放 Markdown 代码块，不要放解释文字，只放这个 JSON：',
    '{"pattern":"...","reading":"...","nextAction":"...","tags":["...","...","..."]}',
    '',
    '洞察卡要求：',
    '- 用中文。',
    '- 温和、具体、非诊断化。',
    '- 不要做心理疾病诊断，不要夸大结论。',
    '- nextAction 必须比原行动更小、更具体、可在 24 小时内尝试。',
    '- tags 是 3-5 个短标签。',
    '',
    '页面输入：',
    JSON.stringify(payload.context.insightPayload, null, 2),
  ].join('\n')

  return payload
}

async function checkBridgeStatus() {
  try {
    const response = await fetch('http://127.0.0.1:8787/status')
    const data = await response.json().catch(() => ({}))
    bridgeStatus.value = response.ok ? data : { ok: false }
    if (response.ok) {
      codexCopyStatus.value = data.agentAlive
        ? '本地桥接和 Codex Agent 都在线，可以自动处理回馈洞察。'
        : '本地桥接服务在线，但 Codex Agent 暂未在线。请运行 npm run codex:agent。'
    }
  } catch {
    bridgeStatus.value = { ok: false }
    codexCopyStatus.value = '本地桥接服务离线。请先运行 npm run codex:bridge。'
  }
}

async function checkLocalCodexResponse() {
  const applied = await fetchLocalCodexResponse(activeCodexRequestAt.value, activeCodexCommandId.value)
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

async function waitForLocalCodexResponse(requestReceivedAt, commandId = '') {
  if (codexPolling.value) return
  codexPolling.value = true

  for (let index = 0; index < 60; index += 1) {
    const applied = await fetchLocalCodexResponse(requestReceivedAt, commandId)
    if (applied) {
      codexPolling.value = false
      return
    }
    await new Promise((resolve) => window.setTimeout(resolve, 2000))
  }

  codexPolling.value = false
  codexCopyStatus.value = '还没有等到 Codex 返回。你可以稍后点“检查 Codex 返回”。'
}

async function fetchLocalCodexResponse(requestReceivedAt = '', commandId = '') {
  try {
    const response = await fetch('http://127.0.0.1:8787/codex/response')
    const data = await response.json().catch(() => ({}))
    if (!response.ok) return false
    if (commandId && data.commandId && data.commandId !== commandId) return false
    if (requestReceivedAt && data.requestReceivedAt && data.requestReceivedAt !== requestReceivedAt) return false

    const insight = extractCodexInsight(data)
    if (!insight) {
      if (data.status === 'failed' || data.status === 'blocked') {
        codexCopyStatus.value = data.summary || data.reply || 'Codex Agent 暂时没有生成可回填的洞察卡。'
      }
      return false
    }

    feedbackInsight.value = normalizeInsight(insight)
    insightSource.value = 'codex'
    insightError.value = ''
    codexCopyStatus.value = '已收到 Codex 返回，并应用成洞察卡。'
    return true
  } catch {
    return false
  }
}

function extractCodexInsight(data) {
  if (data?.insight) return data.insight
  const candidates = [data?.reply, data?.summary]
  for (const candidate of candidates) {
    const parsed = parseInsightJson(candidate)
    if (parsed) return parsed
  }
  return null
}

function parseInsightJson(value) {
  const text = String(value || '').trim()
  if (!text) return null

  const candidates = [
    text,
    text.match(/```(?:json)?\s*([\s\S]*?)\s*```/i)?.[1],
    text.includes('{') ? text.slice(text.indexOf('{'), text.lastIndexOf('}') + 1) : '',
  ].filter(Boolean)

  for (const candidate of candidates) {
    try {
      const parsed = JSON.parse(candidate.trim())
      if (parsed && typeof parsed === 'object') return parsed
    } catch {
      // Try the next possible JSON shape.
    }
  }
  return null
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
  await saveElementAsPng(resultCardRef.value, `思想伙伴卡-${selectedScene.value.id}.png`, '结果卡', buildExportCardData())
}

async function saveInsightCard() {
  await saveElementAsPng(insightCardRef.value, `行动回馈洞察卡-${selectedScene.value.id}.png`, '洞察卡', buildInsightExportCardData())
}

async function saveElementAsPng(element, filename, label = '图片', cardData = buildExportCardData()) {
  if (!element) return
  saveStatus.value = `正在生成${label}...`

  try {
    const canvas = await renderElementToCanvas(element, cardData)
    const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'))
    if (!blob) throw new Error('Canvas did not produce a PNG blob')

    const fileUrl = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.download = filename
    link.href = fileUrl
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.setTimeout(() => URL.revokeObjectURL(fileUrl), 30000)

    saveStatus.value = `${label}已生成。如果浏览器拦截下载，请查看地址栏或下载列表。`
    window.setTimeout(() => {
      if (saveStatus.value.includes('已生成')) saveStatus.value = ''
    }, 3500)
  } catch (error) {
    saveStatus.value = `${label}保存失败：浏览器不支持当前导出方式。`
  }
}

async function renderElementToCanvas(element, cardData = buildExportCardData()) {
  await nextTick()

  const rect = element.getBoundingClientRect()
  const width = Math.max(720, Math.ceil(rect.width))
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
    kind: 'result',
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

function buildInsightExportCardData() {
  const insight = feedbackInsight.value || buildEmptyFeedbackInsight()
  return {
    kind: 'insight',
    title: '行动回馈洞察卡',
    problem: displayedProblem.value,
    pattern: insight.pattern,
    reading: insight.reading,
    nextAction: insight.nextAction,
    tags: insight.tags?.join(' / ') || '',
    source: insightSourceLabel.value,
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
  if (cardData.kind !== 'insight') {
    height += 330
    height += 30
  }
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

  if (cardData.kind !== 'insight') {
    y = drawMetaphorMap(context, cardData, padding, y, contentWidth)
    y += 30
  }

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
  if (cardData.kind === 'insight') {
    return [
      { title: '当前困境', text: cardData.problem },
      { title: '我看见的模式', text: cardData.pattern },
      { title: '这说明什么', text: cardData.reading },
      { title: '新的建议', text: cardData.nextAction },
      { title: '标签', text: cardData.tags },
      { title: '生成方式', text: cardData.source },
    ]
  }

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

.path-actions {
  margin-top: 12px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.calibration-btn {
  border: 1px solid rgba(32, 79, 103, 0.18);
  border-radius: 999px;
  background: rgba(32, 79, 103, 0.08);
  color: var(--brand);
  padding: 8px 12px;
  font-size: 12px;
  cursor: pointer;
}

.ai-panel {
  position: fixed;
  right: 16px;
  bottom: 16px;
  z-index: 40;
  width: 340px;
  max-width: calc(100vw - 24px);
  max-height: calc(100vh - 24px);
  overflow: auto;
  margin-top: 0;
  border: 1px solid rgba(121, 91, 155, 0.18);
  border-radius: 22px;
  background: rgba(248, 246, 253, 0.82);
  padding: 18px;
  box-shadow: 0 18px 50px rgba(22, 34, 43, 0.18);
  backdrop-filter: blur(12px);
}

.ai-launcher {
  position: fixed;
  right: 16px;
  bottom: 16px;
  z-index: 40;
  border: 1px solid rgba(121, 91, 155, 0.18);
  border-radius: 999px;
  background: rgba(248, 246, 253, 0.96);
  color: #6c4d8c;
  padding: 8px 11px;
  font-size: 12px;
  font-weight: 700;
  box-shadow: 0 10px 24px rgba(22, 34, 43, 0.14);
  cursor: pointer;
}

.ai-panel-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}

.ai-dock-handle {
  flex: 1;
  min-width: 0;
  user-select: none;
}

.ai-dock-handle p {
  margin-top: 4px;
  color: var(--text-tertiary);
  font-size: 11px;
}

.ai-head-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.ai-panel-head h3 {
  margin: 4px 0 0;
  font-size: 18px;
  color: var(--text-primary);
}

.ai-mode-badge {
  border-radius: 999px;
  background: rgba(121, 91, 155, 0.12);
  color: #6c4d8c;
  padding: 6px 10px;
  font-size: 12px;
  white-space: nowrap;
}

.ai-summary {
  margin-top: 12px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  color: var(--text-secondary);
  font-size: 12px;
}

.ai-summary span {
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.7);
  padding: 5px 10px;
  border: 1px solid rgba(121, 91, 155, 0.12);
}

.ai-config {
  margin-top: 12px;
}

.ai-toggle {
  margin-top: 12px;
  display: flex;
  align-items: center;
  gap: 10px;
  color: var(--text-secondary);
  font-size: 12px;
}

.ai-form {
  margin-top: 12px;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.ai-field {
  display: grid;
  gap: 6px;
}

.ai-field span {
  color: var(--text-secondary);
  font-size: 12px;
  font-weight: 600;
}

.ai-field input,
.ai-field select {
  width: 100%;
  border: 1px solid var(--border-default);
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.9);
  padding: 10px 12px;
  color: var(--text-primary);
  font: inherit;
  font-size: 13px;
  outline: none;
}

.ai-key-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.ai-key-row input {
  flex: 1;
  min-width: 0;
}

.mini-toggle-btn {
  border: 1px solid rgba(121, 91, 155, 0.18);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.8);
  color: #6c4d8c;
  padding: 10px 12px;
  font-size: 12px;
  cursor: pointer;
  white-space: nowrap;
}

.ai-actions {
  margin-top: 12px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.ai-collapsed-hint {
  margin-top: 12px;
  color: var(--text-secondary);
  font-size: 12px;
}

.ai-status {
  margin-top: 10px;
  color: #6c4d8c;
  font-size: 12px;
  line-height: 1.55;
}

.ai-chat {
  margin-top: 14px;
  border-top: 1px solid rgba(121, 91, 155, 0.14);
  padding-top: 14px;
}

.ai-chat-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}

.ai-chat-head h3 {
  margin: 4px 0 0;
  font-size: 18px;
  color: var(--text-primary);
}

.ai-chat-head span {
  color: var(--text-tertiary);
  font-size: 12px;
}

.chat-log {
  margin-top: 12px;
  max-height: 260px;
  overflow: auto;
  display: grid;
  gap: 10px;
  padding-right: 4px;
}

.chat-bubble {
  border-radius: 16px;
  border: 1px solid rgba(121, 91, 155, 0.12);
  background: rgba(255, 255, 255, 0.84);
  padding: 12px 14px;
}

.chat-bubble.user {
  background: rgba(32, 79, 103, 0.06);
  border-color: rgba(32, 79, 103, 0.12);
}

.chat-bubble.assistant {
  background: rgba(95, 125, 67, 0.06);
  border-color: rgba(95, 125, 67, 0.12);
}

.chat-role {
  display: inline-block;
  margin-bottom: 6px;
  color: var(--brand);
  font-size: 11px;
  font-weight: 700;
}

.chat-bubble p {
  margin: 0;
  color: var(--text-primary);
  font-size: 13px;
  line-height: 1.75;
  white-space: pre-wrap;
}

.ai-chat textarea {
  width: 100%;
  margin-top: 12px;
  resize: vertical;
  min-height: 92px;
  border: 1px solid var(--border-default);
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.9);
  padding: 12px 14px;
  color: var(--text-primary);
  font: inherit;
  font-size: 13px;
  line-height: 1.7;
  outline: none;
}

.chat-actions {
  margin-top: 10px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
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
  .ai-panel,
  .result-panel {
    border-radius: 22px;
  }

  .tool-title-block,
  .tool-status,
  .chooser-panel,
  .signal-panel,
  .ai-panel,
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

  .ai-form {
    grid-template-columns: 1fr;
  }

  .ai-key-row {
    flex-direction: column;
    align-items: stretch;
  }

  .chat-actions {
    width: 100%;
  }

  .ai-panel {
    right: 10px;
    bottom: 10px;
    width: calc(100vw - 20px);
    max-width: calc(100vw - 20px);
    max-height: calc(100vh - 20px);
  }

  .ai-launcher {
    right: 10px;
    bottom: 10px;
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

