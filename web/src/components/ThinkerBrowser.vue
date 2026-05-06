<template>
  <div class="tb-wrap">
    <div class="tb-scroll">
      <div class="thinker-browser">
        <header class="browser-header">
          <div>
            <div class="browser-kicker">THINKER SYSTEM</div>
            <h1>思想家系统</h1>
            <p>72 位思想家 · 八大门派各 9 人 · 为每个困境找到最合适的思想镜头。</p>
          </div>
          <div class="browser-stats">
            <span><strong>{{ totalThinkers }}</strong> 思想家</span>
            <span><strong>{{ schools.length }}</strong> 门派</span>
            <span><strong>{{ pairings.length }}</strong> 配对</span>
          </div>
        </header>

        <section class="school-filter">
          <button
            v-for="school in schools"
            :key="school.id"
            class="school-chip"
            :class="{ active: activeSchool === school.id }"
            :style="{ '--school-color': school.color }"
            @click="activeSchool = activeSchool === school.id ? null : school.id"
          >
            {{ school.label }}
            <span class="school-chip-count">{{ countBySchool(school.id) }}</span>
          </button>
        </section>

        <section class="school-grid">
          <article v-for="school in filteredSchools" :key="school.id" class="school-panel">
            <div class="school-head">
              <span class="school-dot" :style="{ background: school.color }"></span>
              <h2>{{ school.label }}</h2>
              <span class="school-question">{{ school.question }}</span>
            </div>

            <div class="thinker-cards">
              <button
                v-for="thinker in thinkersBySchool(school.id)"
                :key="thinker.slug"
                class="thinker-card"
                @click="$emit('select-thinker', thinker.slug)"
              >
                <div class="card-head">
                  <span class="card-name">{{ thinker.name }}</span>
                  <span class="card-role">{{ thinker.roleLabel }}</span>
                </div>
                <p class="card-thesis">{{ thinker.description }}</p>
                <div class="card-axes">
                  <span
                    v-for="axisId in thinker.axis"
                    :key="axisId"
                    class="axis-tag"
                    :style="{ '--axis-color': axisColors[axisId] }"
                  >{{ axisLabels[axisId] }}</span>
                </div>
              </button>
            </div>
          </article>
        </section>

        <section class="pairing-section">
          <div class="section-head">
            <div class="browser-kicker">THINKER PAIRINGS</div>
            <h2>思想家配对</h2>
            <p>两个思想家对同一个问题的不同切法 = 天然选题</p>
          </div>

          <div class="pairing-grid">
            <article v-for="pair in pairings" :key="pair.id" class="pairing-card">
              <div class="pairing-vs">
                <span>{{ pair.a }}</span>
                <span class="pair-connector">×</span>
                <span>{{ pair.b }}</span>
              </div>
              <p class="pair-tension">{{ pair.tension }}</p>
              <p class="pair-topic">{{ pair.topicExample }}</p>
            </article>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { thinkers, axes } from '../data/thoughtPartnerData.js'

defineEmits(['select-thinker'])

const activeSchool = ref(null)

const schools = [
  { id: '存在与意义', label: '存在与意义', question: '我为什么活着？什么值得做？', color: '#8a5a44' },
  { id: '内在与无意识', label: '内在与无意识', question: '我为什么总是这样？', color: '#6b4c7a' },
  { id: '关系与依恋', label: '关系与依恋', question: '我为什么在关系里受伤？', color: '#795b9b' },
  { id: '社会与结构', label: '社会与结构', question: '哪些痛不是我的错？', color: '#204f67' },
  { id: '观看与审美', label: '观看与审美', question: '我为什么这样看自己？', color: '#2f6f73' },
  { id: '叙事与表达', label: '叙事与表达', question: '我活在什么故事里？', color: '#a56a2a' },
  { id: '身体与空间', label: '身体与空间', question: '身体知道什么？', color: '#5f7d43' },
  { id: '行动与系统', label: '行动与系统', question: '懂了怎么做到？', color: '#4a7c5c' },
]

const axisLabels = Object.fromEntries(Object.entries(axes).map(([k, v]) => [k, v.label]))
const axisColors = Object.fromEntries(Object.entries(axes).map(([k, v]) => [k, v.color]))

const roleLabelMap = {
  main: '主镜头', translator: '翻译者', calibrator: '校正者', action: '行动', expression: '表达',
}

const pairings = [
  { id: '01', a: '阿兰·德波顿', b: '布迪厄', tension: '温柔翻译 vs 冷峻结构', topicExample: '「德波顿说不是你的错，布迪厄说是阶层再生产——都对了」' },
  { id: '02', a: '韩炳哲', b: '德塞托', tension: '时代诊断 vs 微小实践', topicExample: '「韩炳哲诊断完倦怠社会，德塞托给了你一个小动作」' },
  { id: '03', a: '约翰·伯格', b: '巴什拉', tension: '图像批判 vs 空间安放', topicExample: '「伯格拆解图像暴力，巴什拉给你一个可以回去的角落」' },
  { id: '04', a: '福柯', b: 'L 先生', tension: '宏大权力 vs 个人系统', topicExample: '「福柯说权力无处不在，L 先生说先改一个变量」' },
  { id: '05', a: '亚当·菲利普斯', b: '非暴力沟通', tension: '追问欲望 vs 落地表达', topicExample: '「菲利普斯问你在保护什么，NVC 教你怎么说出来」' },
  { id: '06', a: '萨特', b: '阿德勒', tension: '自由即责任 vs 课题分离', topicExample: '「存在主义说你必须选，阿德勒说哪些不归你选」' },
  { id: '07', a: '荣格', b: '戈夫曼', tension: '内在阴影 vs 社会面具', topicExample: '「荣格说阴影要对话，戈夫曼说面具很正常——到底听谁的」' },
  { id: '08', a: '弗兰克尔', b: '加缪', tension: '意义必寻 vs 荒谬即答案', topicExample: '「集中营里找到意义，加缪说不要找——他们都在说活下去」' },
  { id: '09', a: '鲍曼', b: '项飙', tension: '液态现代性 vs 附近', topicExample: '「一切都在流动——但你可以先找回楼下的早餐店」' },
  { id: '10', a: '尼采', b: '一行禅师', tension: '强力意志 vs 当下即足', topicExample: '「尼采说成为你自己，一行禅师说洗碗就是洗碗」' },
  { id: '11', a: '费孝通', b: '鲍尔比', tension: '差序格局 vs 依恋理论', topicExample: '「中国人的关系是一圈一圈的——西方依恋理论够用吗」' },
  { id: '12', a: '鲁迅', b: '阿德勒', tension: '国民性批判 vs 个体心理学', topicExample: '「鲁迅撕开，阿德勒给出路——两个不让自己被环境吞掉的方法」' },
]

const totalThinkers = computed(() => Object.keys(thinkers).length)

const filteredSchools = computed(() => {
  if (!activeSchool.value) return schools
  return schools.filter(s => s.id === activeSchool.value)
})

function countBySchool(schoolId) {
  return Object.values(thinkers).filter(t => t.school === schoolId).length
}

function thinkersBySchool(schoolId) {
  return Object.entries(thinkers)
    .filter(([, t]) => t.school === schoolId)
    .map(([slug, t]) => ({
      slug,
      ...t,
      roleLabel: t.roleFit.map(r => roleLabelMap[r] || r).join('/'),
    }))
}
</script>

<style scoped>
.tb-wrap {
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  min-height: 0;
  overflow: hidden;
  background: #fafaf9;
}

.tb-scroll {
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  min-height: 0;
  overflow: hidden auto;
  overscroll-behavior: contain;
}

.thinker-browser {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1.5rem;
}

.browser-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 2rem;
  margin-bottom: 2rem;
}

.browser-kicker {
  font-size: 0.7rem;
  letter-spacing: 0.15em;
  color: #999;
  margin-bottom: 0.25rem;
}

.browser-header h1 {
  font-size: 1.6rem;
  margin: 0 0 0.5rem;
  color: #333;
}

.browser-header p {
  color: #777;
  max-width: 560px;
  line-height: 1.6;
  margin: 0;
}

.browser-stats {
  display: flex;
  gap: 1.5rem;
  flex-shrink: 0;
}

.browser-stats span {
  font-size: 0.85rem;
  color: #777;
}

.browser-stats strong {
  color: #333;
}

.school-filter {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 2rem;
}

.school-chip {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.4rem 0.85rem;
  border-radius: 999px;
  border: 1px solid #e0e0e0;
  background: #fff;
  color: #333;
  font-size: 0.82rem;
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s;
}

.school-chip:hover {
  background: #f7f7f7;
}

.school-chip.active {
  border-color: var(--school-color);
}

.school-chip-count {
  font-size: 0.72rem;
  opacity: 0.6;
}

.school-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(500px, 1fr));
  gap: 2rem;
  margin-bottom: 3rem;
}

.school-panel {
  border: 1px solid #e8e8e8;
  border-radius: 12px;
  padding: 1.25rem;
  background: #fff;
}

.school-head {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.school-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
  background: var(--school-color);
}

.school-head h2 {
  font-size: 1.05rem;
  margin: 0;
}

.school-question {
  font-size: 0.78rem;
  color: #999;
  margin-left: auto;
}

.thinker-cards {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.thinker-card {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  padding: 0.7rem 0.85rem;
  border: none;
  border-radius: 8px;
  background: #fafaf9;
  text-align: left;
  cursor: pointer;
  transition: background 0.15s;
}

.thinker-card:hover {
  background: #f0f0ee;
}

.card-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-name {
  font-weight: 600;
  font-size: 0.92rem;
}

.card-role {
  font-size: 0.7rem;
  color: #aaa;
}

.card-thesis {
  font-size: 0.8rem;
  color: #777;
  margin: 0;
  line-height: 1.45;
}

.card-axes {
  display: flex;
  gap: 0.35rem;
  flex-wrap: wrap;
}

.axis-tag {
  font-size: 0.65rem;
  padding: 0.1rem 0.5rem;
  border-radius: 999px;
  color: var(--axis-color);
  background: color-mix(in srgb, var(--axis-color) 12%, transparent);
}

.pairing-section {
  margin-bottom: 2rem;
}

.section-head {
  margin-bottom: 1.25rem;
}

.section-head h2 {
  font-size: 1.3rem;
  margin: 0 0 0.25rem;
}

.section-head p {
  color: #777;
  margin: 0;
}

.pairing-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1rem;
}

.pairing-card {
  border: 1px solid #e8e8e8;
  border-radius: 10px;
  padding: 1rem;
  background: #fff;
}

.pairing-vs {
  font-weight: 600;
  font-size: 0.95rem;
  margin-bottom: 0.4rem;
}

.pair-connector {
  color: #ccc;
  margin: 0 0.3rem;
}

.pair-tension {
  font-size: 0.78rem;
  color: #555;
  margin: 0 0 0.3rem;
}

.pair-topic {
  font-size: 0.75rem;
  color: #999;
  margin: 0;
  line-height: 1.4;
}
</style>
