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
            </div>
            <button class="reset-btn" @click="resetSelection">重置</button>
          </div>

          <div class="problem-card">
            <div class="problem-label">当前困境</div>
            <p>{{ displayedProblem }}</p>
          </div>

          <div class="lens-row">
            <span v-for="lens in selectedScene.lenses" :key="lens">{{ lens }}</span>
          </div>

          <div class="partners">
            <article v-for="role in roles" :key="role.id" class="partner-card">
              <div class="role-meta">
                <span class="role-label">{{ role.label }}</span>
                <span class="role-purpose">{{ role.purpose }}</span>
              </div>
              <h3>{{ partnerFor(role.id).name }}</h3>
              <p>{{ partnerFor(role.id).description }}</p>
              <div class="concept-row">
                <span v-for="concept in partnerFor(role.id).concepts" :key="concept">{{ concept }}</span>
              </div>
            </article>
          </div>

          <div class="action-block">
            <div>
              <div class="action-label">最小行动</div>
              <p>{{ selectedScene.minimumAction }}</p>
            </div>
          </div>

          <div class="path-block">
            <div class="action-label">继续探索</div>
            <div class="path-row">
              <span v-for="path in selectedScene.nextPaths" :key="path">{{ path }}</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { axes, roles, scenes, thinkers } from '../data/thoughtPartnerData.js'

const supportNeeds = ['被安放', '被看见', '被解释', '被挑战', '被推动']
const expressionTastes = ['温柔', '锋利', '结构', '诗性', '行动']
const goals = ['理解自己', '修复关系', '找到行动', '形成表达', '建立体系']

const selectedSceneId = ref(scenes[0].id)
const selectedNeed = ref('被解释')
const selectedTaste = ref('结构')
const selectedGoal = ref('理解自己')
const customScene = ref('')

const selectedScene = computed(() => scenes.find((scene) => scene.id === selectedSceneId.value) || scenes[0])
const selectedSceneIndex = computed(() => scenes.findIndex((scene) => scene.id === selectedScene.value.id))
const displayedProblem = computed(() => customScene.value.trim() || selectedScene.value.title)
const resultAxes = computed(() => {
  const ids = [selectedScene.value.primaryAxis, ...(selectedScene.value.secondaryAxes || [])]
  return ids.map((id) => axes[id]).filter(Boolean)
})

watch(selectedScene, (scene) => {
  selectedNeed.value = scene.supportNeed?.[0] || '被解释'
  selectedTaste.value = scene.expressionTaste?.[0] || '结构'
  selectedGoal.value = inferGoal(scene.primaryAxis)
})

function inferGoal(axis) {
  if (axis === 'relation') return '修复关系'
  if (axis === 'action') return '找到行动'
  if (axis === 'narrative') return '形成表达'
  if (axis === 'social') return '理解自己'
  return '建立体系'
}

function partnerFor(roleId) {
  const thinkerId = selectedScene.value.partnerSet?.[roleId]
  return thinkers[thinkerId] || thinkers.deBotton
}

function resetSelection() {
  selectedSceneId.value = scenes[0].id
  selectedNeed.value = '被解释'
  selectedTaste.value = '结构'
  selectedGoal.value = '理解自己'
  customScene.value = ''
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

.reset-btn {
  border: 1px solid var(--border-default);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.72);
  color: var(--text-secondary);
  padding: 8px 12px;
  font-size: 12px;
  cursor: pointer;
}

.problem-card,
.action-block,
.path-block {
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
.action-block p {
  margin-top: 8px;
  color: var(--text-primary);
  line-height: 1.7;
}

.lens-row {
  margin: 14px 0;
}

.lens-row span,
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
  align-items: center;
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

.partner-card h3 {
  margin-top: 8px;
  font-family: var(--font-serif);
  color: var(--text-primary);
  font-size: 20px;
}

.partner-card p {
  margin-top: 6px;
  color: var(--text-secondary);
  font-size: 13px;
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
}
</style>
