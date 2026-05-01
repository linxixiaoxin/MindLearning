<template>
  <div class="diagnostic-wrap">
    <div class="diagnostic-scroll">
      <section class="diagnostic-head">
        <div>
          <div class="tool-kicker">PRODUCT EXPERIMENT · MINDSET TRAPS</div>
          <h1>心智误区诊断</h1>
          <p>
            把《走出心智的误区》里的五类判断陷阱做成一个轻量预警工具。它不是心理诊断，只帮助你在复杂判断前先校准一下自己可能看窄的地方。
          </p>
        </div>
        <aside class="head-panel">
          <span>R-108 · MVP</span>
          <strong>{{ answeredCount }} / {{ questions.length }}</strong>
          <small>已回答题目</small>
        </aside>
      </section>

      <section class="input-panel">
        <label>
          <span>正在卡住的问题</span>
          <textarea
            v-model="problemText"
            rows="3"
            placeholder="例如：团队对新方案都说没意见，但推进时又各自保留，我不知道该继续协调还是直接拍板。"
          ></textarea>
        </label>
      </section>

      <div class="diagnostic-grid">
        <section class="question-panel">
          <div class="panel-head">
            <div>
              <div class="tool-kicker">Signals</div>
              <h2>误区信号题</h2>
            </div>
            <button class="ghost-btn" @click="resetAnswers">重置</button>
          </div>

          <article v-for="question in questions" :key="question.id" class="question-card">
            <div class="question-copy">
              <span>{{ question.dimension }}</span>
              <p>{{ question.text }}</p>
            </div>
            <div class="scale-row" role="group" :aria-label="question.text">
              <button
                v-for="score in scale"
                :key="score.value"
                :class="{ active: answers[question.id] === score.value }"
                @click="answers[question.id] = score.value"
              >
                {{ score.label }}
              </button>
            </div>
          </article>
        </section>

        <section class="result-panel">
          <div class="panel-head">
            <div>
              <div class="tool-kicker">Result Card</div>
              <h2>诊断结果卡</h2>
            </div>
          </div>

          <div class="result-card">
            <div class="problem-box">
              <span>当前问题</span>
              <p>{{ displayedProblem }}</p>
            </div>

            <div class="trap-map">
              <article
                v-for="trap in rankedTraps"
                :key="trap.id"
                class="trap-score"
                :class="{ primary: trap.id === primaryTrap.id }"
              >
                <div>
                  <strong>{{ trap.title }}</strong>
                  <span>{{ trap.score }} 分</span>
                </div>
                <div class="score-bar">
                  <i :style="{ width: `${Math.max(8, trap.percent)}%` }"></i>
                </div>
              </article>
            </div>

            <article class="primary-trap">
              <span>最可能正在发生</span>
              <h3>{{ primaryTrap.title }}</h3>
              <p>{{ primaryTrap.result }}</p>
            </article>

            <div class="insight-grid">
              <article>
                <span>它会怎样影响判断</span>
                <p>{{ primaryTrap.risk }}</p>
              </article>
              <article>
                <span>退出误区的最小实验</span>
                <p>{{ primaryTrap.experiment }}</p>
              </article>
            </div>

            <div class="links-block">
              <span>继续探索</span>
              <div class="link-row">
                <button
                  v-for="link in primaryTrap.links"
                  :key="link.nodeId"
                  @click="$emit('openNode', { slug: 'mindset-traps', nodeId: link.nodeId })"
                >
                  {{ link.label }}
                </button>
              </div>
            </div>

            <button class="primary-btn" @click="copyResult">复制诊断卡</button>
            <p v-if="copyStatus" class="copy-status">{{ copyStatus }}</p>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'

defineEmits(['openNode'])

const problemText = ref('')
const copyStatus = ref('')
const answers = reactive({})
const scale = [
  { label: '很少', value: 0 },
  { label: '有点像', value: 1 },
  { label: '很像', value: 2 },
]

const traps = [
  {
    id: 'simplifiedStory',
    title: '简化故事',
    result: '你可能已经太快把复杂局面收成了一个顺滑解释。这个解释能带来确定感，但也可能遮住其他原因、弱信号和系统条件。',
    risk: '判断会变得省力，却容易把问题归因到某个人、某个动机或某个单一原因。',
    experiment: '写出 3 个替代解释：一个关于人，一个关于结构，一个关于时机。先不选对错，只扩宽解释空间。',
    links: [
      { label: '简化故事', nodeId: '简化故事' },
      { label: '反证过滤', nodeId: '反证过滤' },
      { label: '用「简化故事的心智误区」处理关键问题', nodeId: '用「简化故事的心智误区」处理关键问题' },
    ],
  },
  {
    id: 'feelingRight',
    title: '感觉正确',
    result: '你现在的确定感可能太强了。它未必是错，但如果确定感让你停止寻找反证，它就会从判断资源变成判断遮蔽物。',
    risk: '你会更容易收集支持自己的材料，忽略让自己不舒服但有价值的弱信号。',
    experiment: '找一个反证或弱信号，问自己：如果它是真的，我现在的判断需要改哪 10%？',
    links: [
      { label: '感觉正确', nodeId: '感觉正确' },
      { label: '默认正确感', nodeId: '默认正确感' },
      { label: '用「感觉正确的心智误区」处理关键问题', nodeId: '用「感觉正确的心智误区」处理关键问题' },
    ],
  },
  {
    id: 'cravingConsensus',
    title: '渴求共识',
    result: '你可能正在把“大家别难受”误认为“问题已经解决”。共识有价值，但过早共识会把必要分歧压到地下。',
    risk: '团队表面顺滑，真实顾虑却不进入讨论，后续推进时会用拖延、沉默或返工的方式冒出来。',
    experiment: '在下一轮讨论里只做一件事：请每个人说出一个仍然不同意、担心或看不清的点。',
    links: [
      { label: '第四章渴求共识的心智误区', nodeId: '第四章渴求共识的心智误区' },
      { label: '为什么一团和气的团队反而更危险', nodeId: '为什么一团和气的团队反而更危险' },
      { label: '渴求共识', nodeId: '渴求共识' },
      { label: '第三选择', nodeId: '第三选择' },
      { label: '用「渴求共识的心智误区」处理关键问题', nodeId: '用「渴求共识的心智误区」处理关键问题' },
    ],
  },
  {
    id: 'cravingControl',
    title: '渴望掌控',
    result: '你可能正在试图把复杂系统变成完全可预测、可衡量、可控制的对象。控制能降低焦虑，但也会让你错过边缘处的真实杠杆。',
    risk: '你会偏好计划和指标，低估关系、语境、时机与涌现变化。',
    experiment: '做一个边缘试验：选一个低风险角落，用 48 小时验证一个小动作，不急着把整套系统设计完。',
    links: [
      { label: '渴望掌控', nodeId: '渴望掌控' },
      { label: '边缘试验', nodeId: '边缘试验' },
      { label: '控制感越强，越可能错失复杂系统的真实杠杆', nodeId: '控制感越强，越可能错失复杂系统的真实杠杆' },
    ],
  },
  {
    id: 'secondJob',
    title: '第二份工作',
    result: '你的一部分精力可能没有用来解决问题，而是在保护某种自我形象：不能显得不专业、不能承认不确定、不能让别人失望。',
    risk: '真正的问题会被自我防卫包住，反馈、学习和求助都会变难。',
    experiment: '写下你正在维护的形象，再写一句允许自己更真实的话：这件事里，我可以不知道什么？可以请求什么？',
    links: [
      { label: '第二份工作', nodeId: '第二份工作' },
      { label: '内观自变', nodeId: '内观自变' },
      { label: '用「捍卫自我的心智误区」处理关键问题', nodeId: '用「捍卫自我的心智误区」处理关键问题' },
    ],
  },
]

const questions = [
  { id: 'q1', dimension: '简化故事', trap: 'simplifiedStory', text: '我已经很快有了一个“这就是因为某个人/某个原因”的解释。' },
  { id: 'q2', dimension: '简化故事', trap: 'simplifiedStory', text: '如果别人提出不同解释，我会觉得他们没有看清重点。' },
  { id: 'q3', dimension: '感觉正确', trap: 'feelingRight', text: '我现在很确定自己的判断，因此不太想再找反面证据。' },
  { id: 'q4', dimension: '感觉正确', trap: 'feelingRight', text: '我更想证明自己没错，而不是更新对问题的理解。' },
  { id: 'q5', dimension: '渴求共识', trap: 'cravingConsensus', text: '我倾向于先让大家都舒服一点，把尖锐分歧暂时放下。' },
  { id: 'q6', dimension: '渴求共识', trap: 'cravingConsensus', text: '只要会议上没人反对，我就会把它当作已经达成共识。' },
  { id: 'q7', dimension: '渴望掌控', trap: 'cravingControl', text: '我很想把所有变量都计划清楚，再开始行动。' },
  { id: 'q8', dimension: '渴望掌控', trap: 'cravingControl', text: '我更相信可衡量、可汇报的东西，容易忽略现场里的微妙变化。' },
  { id: 'q9', dimension: '第二份工作', trap: 'secondJob', text: '这件事让我最紧张的，不只是结果，而是别人会怎么看我。' },
  { id: 'q10', dimension: '第二份工作', trap: 'secondJob', text: '我花了不少力气维护“我应该很专业/很可靠/很有答案”的形象。' },
]

const displayedProblem = computed(() => problemText.value.trim() || '先写下一个真实问题，结果卡会围绕它生成。')
const answeredCount = computed(() => Object.values(answers).filter((value) => typeof value === 'number').length)
const rankedTraps = computed(() => {
  const maxScore = 4
  return traps
    .map((trap) => {
      const score = questions
        .filter((question) => question.trap === trap.id)
        .reduce((sum, question) => sum + (answers[question.id] || 0), 0)
      return {
        ...trap,
        score,
        percent: Math.round((score / maxScore) * 100),
      }
    })
    .sort((a, b) => b.score - a.score || traps.findIndex((trap) => trap.id === a.id) - traps.findIndex((trap) => trap.id === b.id))
})
const primaryTrap = computed(() => rankedTraps.value[0] || traps[0])

function resetAnswers() {
  for (const question of questions) {
    delete answers[question.id]
  }
  copyStatus.value = ''
}

async function copyResult() {
  const text = [
    `当前问题：${displayedProblem.value}`,
    `主要误区：${primaryTrap.value.title}`,
    `判断影响：${primaryTrap.value.risk}`,
    `最小实验：${primaryTrap.value.experiment}`,
  ].join('\n')

  try {
    await navigator.clipboard.writeText(text)
    copyStatus.value = '已复制诊断卡文字。'
  } catch {
    copyStatus.value = '浏览器暂时不能写入剪贴板，可以直接选中结果文字。'
  }
}
</script>

<style scoped>
.diagnostic-wrap {
  height: 100%;
  overflow-y: auto;
}

.diagnostic-scroll {
  max-width: 1240px;
  margin: 0 auto;
  padding: 28px 20px 76px;
}

.diagnostic-head {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 220px;
  gap: 16px;
}

.diagnostic-head > div,
.head-panel,
.input-panel,
.question-panel,
.result-panel {
  border: 1px solid var(--border-default);
  border-radius: 24px;
  background: rgba(247, 245, 240, 0.92);
  box-shadow: var(--shadow-sm);
}

.diagnostic-head > div {
  padding: 30px 34px;
}

.tool-kicker {
  font-size: 10px;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--text-muted);
}

h1,
h2,
h3 {
  font-family: var(--font-serif);
  color: var(--text-primary);
}

h1 {
  margin-top: 12px;
  font-size: clamp(34px, 4vw, 48px);
  line-height: 1.08;
}

h2 {
  margin-top: 6px;
  font-size: 24px;
}

.diagnostic-head p {
  margin-top: 14px;
  color: var(--text-secondary);
  line-height: 1.8;
}

.head-panel {
  padding: 24px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.head-panel span,
.head-panel small,
.input-panel span,
.question-copy span,
.primary-trap span,
.insight-grid span,
.links-block span,
.problem-box span {
  color: var(--text-muted);
  font-size: 11px;
}

.head-panel strong {
  margin-top: 8px;
  font-family: var(--font-serif);
  font-size: 44px;
  color: var(--accent);
}

.input-panel {
  margin-top: 16px;
  padding: 18px;
}

.input-panel label {
  display: grid;
  gap: 8px;
}

textarea {
  width: 100%;
  resize: vertical;
  border: 1px solid var(--border-default);
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.78);
  padding: 12px 14px;
  color: var(--text-primary);
  font: inherit;
  line-height: 1.7;
  outline: none;
}

.diagnostic-grid {
  margin-top: 16px;
  display: grid;
  grid-template-columns: minmax(360px, 1fr) minmax(340px, 0.9fr);
  gap: 16px;
  align-items: start;
}

.question-panel,
.result-panel {
  padding: 20px;
}

.panel-head {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: flex-start;
  margin-bottom: 16px;
}

.ghost-btn,
.primary-btn,
.link-row button,
.scale-row button {
  border: 1px solid var(--border-default);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.72);
  color: var(--text-secondary);
  padding: 8px 12px;
  font-size: 12px;
  cursor: pointer;
}

.primary-btn {
  width: 100%;
  margin-top: 14px;
  background: var(--brand);
  border-color: var(--brand);
  color: #f7f5f0;
}

.question-card {
  border: 1px solid var(--border-default);
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.72);
  padding: 14px;
}

.question-card + .question-card {
  margin-top: 10px;
}

.question-copy p {
  margin-top: 5px;
  color: var(--text-primary);
  line-height: 1.65;
}

.scale-row {
  margin-top: 12px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.scale-row button.active {
  background: var(--brand);
  border-color: var(--brand);
  color: #f7f5f0;
}

.result-card {
  border: 1px solid rgba(32, 79, 103, 0.18);
  border-radius: 22px;
  background: linear-gradient(145deg, rgba(255, 255, 255, 0.94), rgba(247, 245, 240, 0.98));
  padding: 18px;
}

.problem-box,
.primary-trap,
.insight-grid article,
.links-block {
  border: 1px solid var(--border-default);
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.72);
  padding: 14px;
}

.problem-box p,
.primary-trap p,
.insight-grid p {
  margin-top: 8px;
  color: var(--text-secondary);
  line-height: 1.7;
}

.trap-map {
  display: grid;
  gap: 8px;
  margin: 14px 0;
}

.trap-score {
  border: 1px solid var(--border-default);
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.62);
  padding: 10px;
}

.trap-score.primary {
  border-color: rgba(191, 111, 63, 0.36);
  background: rgba(191, 111, 63, 0.08);
}

.trap-score > div:first-child {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  color: var(--text-primary);
  font-size: 13px;
}

.trap-score span {
  color: var(--text-muted);
}

.score-bar {
  margin-top: 8px;
  height: 7px;
  border-radius: 999px;
  background: rgba(32, 79, 103, 0.08);
  overflow: hidden;
}

.score-bar i {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: var(--accent);
}

.primary-trap h3 {
  margin-top: 8px;
  font-size: 26px;
}

.insight-grid {
  margin-top: 10px;
  display: grid;
  gap: 10px;
}

.links-block {
  margin-top: 10px;
}

.link-row {
  margin-top: 10px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.link-row button {
  color: var(--brand);
}

.copy-status {
  margin-top: 10px;
  color: var(--text-tertiary);
  font-size: 12px;
  text-align: center;
}

@media (max-width: 860px) {
  .diagnostic-head,
  .diagnostic-grid {
    grid-template-columns: 1fr;
  }

  .diagnostic-head > div {
    padding: 22px;
  }
}
</style>
