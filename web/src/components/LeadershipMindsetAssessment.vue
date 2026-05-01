<template>
  <div class="assessment-wrap">
    <div class="assessment-scroll">
      <section class="assessment-head">
        <div>
          <div class="tool-kicker">PRODUCT EXPERIMENT · LEADERSHIP DEVELOPMENT</div>
          <h1>领导者心智评估</h1>
          <p>
            从一个真实领导场景出发，观察你现在承载冲突、不确定性、反馈、带人和工作设计的方式。结果不做高低评判，只给出当前倾向、成长边际和可练习的方法。
          </p>
        </div>
        <aside class="head-panel">
          <span>R-110 · Prototype</span>
          <strong>{{ answeredCount }} / {{ questions.length }}</strong>
          <small>已回答题目</small>
        </aside>
      </section>

      <section class="input-panel">
        <label>
          <span>选择或写下一个真实领导场景</span>
          <textarea
            v-model="scenarioText"
            rows="3"
            placeholder="例如：团队对新方向有分歧，我既想推进结果，又担心讨论拖太久、士气被消耗。"
          ></textarea>
        </label>
      </section>

      <div class="assessment-grid">
        <section class="question-panel">
          <div class="panel-head">
            <div>
              <div class="tool-kicker">Scenario Signals</div>
              <h2>场景判断题</h2>
            </div>
            <button class="ghost-btn" @click="resetAnswers">重置</button>
          </div>

          <article v-for="question in questions" :key="question.id" class="question-card">
            <div class="question-copy">
              <span>{{ question.dimension }}</span>
              <p>{{ question.text }}</p>
            </div>
            <div class="choice-list">
              <button
                v-for="option in question.options"
                :key="option.value"
                :class="{ active: answers[question.id] === option.value }"
                @click="answers[question.id] = option.value"
              >
                <strong>{{ option.label }}</strong>
                <small>{{ option.text }}</small>
              </button>
            </div>
          </article>
        </section>

        <section class="result-panel">
          <div class="panel-head">
            <div>
              <div class="tool-kicker">Growth Edge Card</div>
              <h2>成长边际卡</h2>
            </div>
          </div>

          <div class="result-card">
            <div class="problem-box">
              <span>当前领导场景</span>
              <p>{{ displayedScenario }}</p>
            </div>

            <div class="orientation-map">
              <article
                v-for="item in rankedOrientations"
                :key="item.id"
                class="orientation-score"
                :class="{ primary: item.id === primaryOrientation.id }"
              >
                <div>
                  <strong>{{ item.title }}</strong>
                  <span>{{ item.score }} 分</span>
                </div>
                <div class="score-bar">
                  <i :style="{ width: `${Math.max(8, item.percent)}%` }"></i>
                </div>
              </article>
            </div>

            <article class="primary-orientation">
              <span>当前主要倾向</span>
              <h3>{{ primaryOrientation.title }}</h3>
              <p>{{ primaryOrientation.result }}</p>
            </article>

            <div class="insight-grid">
              <article>
                <span>优势</span>
                <p>{{ primaryOrientation.strength }}</p>
              </article>
              <article>
                <span>风险</span>
                <p>{{ primaryOrientation.risk }}</p>
              </article>
              <article>
                <span>成长边际</span>
                <p>{{ primaryOrientation.edge }}</p>
              </article>
              <article>
                <span>本周练习</span>
                <p>{{ primaryOrientation.practice }}</p>
              </article>
            </div>

            <div class="links-block">
              <span>继续探索</span>
              <div class="link-row">
                <button
                  v-for="link in primaryOrientation.links"
                  :key="link.nodeId"
                  @click="$emit('openNode', { slug: 'leadership-evolution', nodeId: link.nodeId })"
                >
                  {{ link.label }}
                </button>
                <button @click="$emit('openTopic', 'complexity-before-skill')">心智复杂度专题</button>
              </div>
            </div>

            <button class="primary-btn" @click="copyResult">复制评估卡</button>
            <p v-if="copyStatus" class="copy-status">{{ copyStatus }}</p>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'

defineEmits(['openNode', 'openTopic'])

const scenarioText = ref('')
const copyStatus = ref('')
const answers = reactive({})

const orientations = [
  {
    id: 'control',
    title: '更依赖控制与收束',
    result: '你现在更常用清晰规则、快速判断和任务收束来承载复杂场景。这不是坏事，它常常能在混乱中保住方向和节奏。',
    strength: '能迅速降低模糊度，让团队知道接下来做什么，也能在压力高时稳住基本盘。',
    risk: '如果环境本身高度复杂，过快收束可能会压低分歧、遮住弱信号，让团队只执行你的答案。',
    edge: '下一步不是放弃决断，而是在决断前多容纳一种张力：先让不同解释、不同担心和不同时间尺度上桌。',
    practice: '开下一次关键会议前，先问两轮问题：还有哪种解释可能也成立？如果我现在的判断只对 70%，剩下 30% 是什么？',
    links: [
      { label: '成人发展理论', nodeId: '成人发展理论' },
      { label: '成长边际', nodeId: '成长边际' },
      { label: '发展型会议', nodeId: '发展型会议' },
    ],
  },
  {
    id: 'autonomous',
    title: '更依赖自主判断与责任',
    result: '你倾向于用自己的判断框架承载复杂问题，也愿意为选择负责。你不太容易被单一规则推着走，能主动组织目标和行动。',
    strength: '能在不确定环境里形成方向感，不需要等所有人同意才行动，也能把责任扛起来。',
    risk: '高压时可能会把“我来负责”变成“我来定义问题”，从而低估他人的意义建构方式和系统性限制。',
    edge: '下一步不是更强，而是更能看见自己的判断也只是一个视角，并给团队留下共同建构问题的空间。',
    practice: '找一个你已经很有答案的问题，邀请一位成员说出“如果由你定义这个问题，你会怎么说”。只复述，不立刻修正。',
    links: [
      { label: '结构与内容', nodeId: '结构与内容' },
      { label: '发展型教练', nodeId: '发展型教练' },
      { label: '反馈后学习', nodeId: '反馈后学习' },
    ],
  },
  {
    id: 'interdependent',
    title: '更倾向多视角与共同学习',
    result: '你已经在尝试把复杂场景看成多视角共同作用的结果，而不是单一原因或单一人的问题。你更在意系统、关系和持续学习。',
    strength: '能容纳分歧、弱信号和长期影响，适合处理跨团队、跨角色、因果不清的问题。',
    risk: '如果没有足够的结构支撑，开放性可能变成拖延、过度讨论，或者让团队不知道何时收束。',
    edge: '下一步不是继续打开更多视角，而是给复杂讨论搭脚手架：什么先探索，什么要决定，什么只做边缘试验。',
    practice: '把一个复杂议题拆成三栏：需要共同理解的、需要今天决定的、适合做小实验的。每栏只保留 1-2 项。',
    links: [
      { label: '工作即成长场', nodeId: '工作即成长场' },
      { label: '领导力脚手架', nodeId: '领导力脚手架' },
      { label: '发展型会议', nodeId: '发展型会议' },
    ],
  },
]

const questions = [
  {
    id: 'q1',
    dimension: '冲突承载',
    text: '关键成员公开反对你的方案时，你更自然的第一反应是：',
    options: [
      { label: 'A', value: 'control', text: '先把讨论拉回目标和规则，避免场面扩散。' },
      { label: 'B', value: 'autonomous', text: '说明自己的判断依据，并要求对方也给出清晰理由。' },
      { label: 'C', value: 'interdependent', text: '先把反对背后的担心、假设和信息差摊开。' },
    ],
  },
  {
    id: 'q2',
    dimension: '不确定性',
    text: '当问题没有清晰答案，但团队在等你拍板时，你更可能：',
    options: [
      { label: 'A', value: 'control', text: '先给一个方向，后面再根据结果修正。' },
      { label: 'B', value: 'autonomous', text: '用自己的判断框架权衡利弊，然后承担选择。' },
      { label: 'C', value: 'interdependent', text: '设计一个小实验，让团队从现实反馈里学习。' },
    ],
  },
  {
    id: 'q3',
    dimension: '反馈方式',
    text: '收到对你领导方式的尖锐反馈时，你更容易：',
    options: [
      { label: 'A', value: 'control', text: '先判断反馈是否准确，避免被情绪带偏。' },
      { label: 'B', value: 'autonomous', text: '把反馈和自己的目标对照，决定哪些要吸收。' },
      { label: 'C', value: 'interdependent', text: '追问反馈背后的经验，和对方一起理解发生了什么。' },
    ],
  },
  {
    id: 'q4',
    dimension: '带人方式',
    text: '下属反复卡在同类问题上时，你更习惯：',
    options: [
      { label: 'A', value: 'control', text: '给出更明确的标准、步骤或检查点。' },
      { label: 'B', value: 'autonomous', text: '帮助对方明确责任和选择，让他自己往前推。' },
      { label: 'C', value: 'interdependent', text: '一起看他如何理解问题，以及哪一步超出了当前承载范围。' },
    ],
  },
  {
    id: 'q5',
    dimension: '工作设计',
    text: '你设计会议时，更看重它首先产出什么？',
    options: [
      { label: 'A', value: 'control', text: '清晰结论、行动项和责任人。' },
      { label: 'B', value: 'autonomous', text: '关键判断、优先级和每个人自己的承诺。' },
      { label: 'C', value: 'interdependent', text: '共同理解、假设显影和可继续学习的结构。' },
    ],
  },
  {
    id: 'q6',
    dimension: '系统视角',
    text: '团队连续几次没有做到承诺时，你更倾向先看：',
    options: [
      { label: 'A', value: 'control', text: '目标是否清楚、过程是否跟进、责任是否明确。' },
      { label: 'B', value: 'autonomous', text: '大家是否真的认同这件事，并愿意承担选择。' },
      { label: 'C', value: 'interdependent', text: '是不是系统、节奏、激励或协作方式让承诺反复落空。' },
    ],
  },
  {
    id: 'q7',
    dimension: '成长边际',
    text: '当你想帮助一个人“变成熟”时，你更可能：',
    options: [
      { label: 'A', value: 'control', text: '告诉他现在应该达到什么标准。' },
      { label: 'B', value: 'autonomous', text: '让他看到自己选择的后果，并承担下一步。' },
      { label: 'C', value: 'interdependent', text: '判断他刚好够得着的新理解方式，并给临时支撑。' },
    ],
  },
  {
    id: 'q8',
    dimension: '压力回落',
    text: '在高压、时间紧、风险大的时候，你最容易退回：',
    options: [
      { label: 'A', value: 'control', text: '我来定，先照做。' },
      { label: 'B', value: 'autonomous', text: '我来扛，但你们也要拿出判断。' },
      { label: 'C', value: 'interdependent', text: '先分清哪些必须收束，哪些还要保留开放。' },
    ],
  },
]

const displayedScenario = computed(() => scenarioText.value.trim() || '先写下一个真实领导场景，结果卡会围绕它生成。')
const answeredCount = computed(() => Object.values(answers).filter(Boolean).length)
const rankedOrientations = computed(() => {
  const maxScore = questions.length
  return orientations
    .map((orientation) => {
      const score = Object.values(answers).filter((value) => value === orientation.id).length
      return {
        ...orientation,
        score,
        percent: Math.round((score / maxScore) * 100),
      }
    })
    .sort((a, b) => b.score - a.score || orientations.findIndex((item) => item.id === a.id) - orientations.findIndex((item) => item.id === b.id))
})
const primaryOrientation = computed(() => rankedOrientations.value[0] || orientations[0])

function resetAnswers() {
  for (const question of questions) {
    delete answers[question.id]
  }
  copyStatus.value = ''
}

async function copyResult() {
  const text = [
    `当前领导场景：${displayedScenario.value}`,
    `当前主要倾向：${primaryOrientation.value.title}`,
    `优势：${primaryOrientation.value.strength}`,
    `风险：${primaryOrientation.value.risk}`,
    `成长边际：${primaryOrientation.value.edge}`,
    `本周练习：${primaryOrientation.value.practice}`,
  ].join('\n')

  try {
    await navigator.clipboard.writeText(text)
    copyStatus.value = '已复制评估卡文字。'
  } catch {
    copyStatus.value = '浏览器暂时不能写入剪贴板，可以直接选中结果文字。'
  }
}
</script>

<style scoped>
.assessment-wrap {
  height: 100%;
  overflow-y: auto;
}

.assessment-scroll {
  max-width: 1240px;
  margin: 0 auto;
  padding: 28px 20px 76px;
}

.assessment-head {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 220px;
  gap: 16px;
}

.assessment-head > div,
.head-panel,
.input-panel,
.question-panel,
.result-panel {
  border: 1px solid var(--border-default);
  border-radius: 24px;
  background: rgba(247, 245, 240, 0.92);
  box-shadow: var(--shadow-sm);
}

.assessment-head > div {
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

.assessment-head p {
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
.primary-orientation span,
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

.assessment-grid {
  margin-top: 16px;
  display: grid;
  grid-template-columns: minmax(380px, 1fr) minmax(340px, 0.92fr);
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
.choice-list button {
  border: 1px solid var(--border-default);
  background: rgba(255, 255, 255, 0.72);
  color: var(--text-secondary);
  cursor: pointer;
}

.ghost-btn,
.primary-btn,
.link-row button {
  border-radius: 999px;
  padding: 8px 12px;
  font-size: 12px;
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

.choice-list {
  margin-top: 12px;
  display: grid;
  gap: 8px;
}

.choice-list button {
  border-radius: 14px;
  padding: 10px 12px;
  display: grid;
  grid-template-columns: 28px 1fr;
  gap: 8px;
  text-align: left;
}

.choice-list button.active {
  background: rgba(32, 79, 103, 0.09);
  border-color: rgba(32, 79, 103, 0.34);
}

.choice-list strong {
  color: var(--brand);
}

.choice-list small {
  color: var(--text-secondary);
  line-height: 1.55;
}

.result-card {
  border: 1px solid rgba(32, 79, 103, 0.18);
  border-radius: 22px;
  background: linear-gradient(145deg, rgba(255, 255, 255, 0.94), rgba(247, 245, 240, 0.98));
  padding: 18px;
}

.problem-box,
.primary-orientation,
.insight-grid article,
.links-block {
  border: 1px solid var(--border-default);
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.72);
  padding: 14px;
}

.problem-box p,
.primary-orientation p,
.insight-grid p {
  margin-top: 8px;
  color: var(--text-secondary);
  line-height: 1.7;
}

.orientation-map {
  display: grid;
  gap: 8px;
  margin: 14px 0;
}

.orientation-score {
  border: 1px solid var(--border-default);
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.62);
  padding: 10px;
}

.orientation-score.primary {
  border-color: rgba(191, 111, 63, 0.36);
  background: rgba(191, 111, 63, 0.08);
}

.orientation-score > div:first-child {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  color: var(--text-primary);
  font-size: 13px;
}

.orientation-score span {
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

.primary-orientation h3 {
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

@media (max-width: 900px) {
  .assessment-head,
  .assessment-grid {
    grid-template-columns: 1fr;
  }

  .assessment-head > div {
    padding: 22px;
  }
}
</style>
