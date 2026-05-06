<template>
  <div class="tb-wrap">
    <div class="tb-scroll">
      <div class="contrast-app">
        <header class="browser-header">
          <div>
            <div class="browser-kicker">ARCHETYPE CONTRAST</div>
            <h1>原型对照实验室</h1>
            <p>选择两个原型和一个处境，观察他们在同一个场景下的不同反应。自动生成选题角度。</p>
          </div>
        </header>

        <!-- Selectors -->
        <section class="selector-section">
          <div class="selector-row">
            <div class="selector-block">
              <label class="selector-label">原型 A</label>
              <select v-model="archetypeA" class="contrast-select">
                <option value="">— 选择原型 —</option>
                <option v-for="a in archetypes" :key="a.id" :value="a.name">{{ a.id }} {{ a.name }}</option>
              </select>
              <div v-if="archetypeA" class="selected-preview">
                <span class="preview-name">{{ archetypeA }}</span>
                <span class="preview-liner">{{ findArchetype(archetypeA)?.oneLiner }}</span>
              </div>
            </div>

            <div class="vs-badge">VS</div>

            <div class="selector-block">
              <label class="selector-label">原型 B</label>
              <select v-model="archetypeB" class="contrast-select">
                <option value="">— 选择原型 —</option>
                <option v-for="a in archetypes" :key="a.id" :value="a.name">{{ a.id }} {{ a.name }}</option>
              </select>
              <div v-if="archetypeB" class="selected-preview">
                <span class="preview-name">{{ archetypeB }}</span>
                <span class="preview-liner">{{ findArchetype(archetypeB)?.oneLiner }}</span>
              </div>
            </div>
          </div>

          <!-- Theme quick-select -->
          <div class="theme-section">
            <label class="selector-label">快速选择对照主题</label>
            <div class="theme-chips">
              <button
                v-for="t in contrastThemes"
                :key="t.id"
                class="theme-chip"
                :class="{ active: activeTheme === t.id }"
                @click="selectTheme(t)"
              >
                <span class="theme-label">{{ t.label }}</span>
                <span class="theme-pair">{{ t.a }} × {{ t.b }}</span>
              </button>
            </div>
          </div>

          <!-- Scene selector -->
          <div class="scene-section">
            <label class="selector-label">处境（可选）</label>
            <select v-model="selectedScene" class="contrast-select scene-select">
              <option value="">— 不限定场景 —</option>
              <option v-for="s in scenes" :key="s.id" :value="s.title">{{ s.id }} {{ s.title }} · {{ s.domain }}</option>
            </select>
            <div v-if="selectedScene" class="scene-tag">{{ selectedScene }}</div>
          </div>

          <!-- Generate button -->
          <button
            class="generate-btn"
            :disabled="!archetypeA || !archetypeB"
            @click="generateContrast"
          >
            {{ archetypeA && archetypeB ? `对照 ${archetypeA} × ${archetypeB}` : '请选择两个原型' }}
          </button>
        </section>

        <!-- Contrast result -->
        <section v-if="contrastResult" class="contrast-result">
          <!-- Scene context -->
          <div v-if="contrastResult.sceneContext" class="scene-context-banner">
            {{ contrastResult.sceneContext }}
          </div>

          <!-- Side-by-side cards -->
          <div class="side-by-side">
            <div class="archetype-card contrast-card">
              <div class="card-header" style="border-left-color: var(--accent);">
                <strong class="card-name">{{ contrastResult.a.name }}</strong>
                <span class="card-liner">{{ contrastResult.a.oneLiner }}</span>
              </div>
              <div class="card-body">
                <div class="field-row"><span class="field-label">缺口</span><span>{{ contrastResult.a.gap }}</span></div>
                <div class="field-row"><span class="field-label">欲望</span><span>{{ contrastResult.a.desire }}</span></div>
                <div class="field-row"><span class="field-label">恐惧</span><span>{{ contrastResult.a.fear }}</span></div>
                <div class="field-row"><span class="field-label">防御</span><span>{{ contrastResult.a.defense }}</span></div>
                <div class="field-row"><span class="field-label">脚本</span><span>{{ contrastResult.a.script }}</span></div>
                <div class="field-row"><span class="field-label">心智层级</span><span>{{ contrastResult.a.mindLevel }}</span></div>
                <div class="field-row"><span class="field-label">IFS定位</span><span>{{ contrastResult.a.ifsRole }}</span></div>
              </div>
            </div>

            <div class="archetype-card contrast-card">
              <div class="card-header" style="border-left-color: var(--brand);">
                <strong class="card-name">{{ contrastResult.b.name }}</strong>
                <span class="card-liner">{{ contrastResult.b.oneLiner }}</span>
              </div>
              <div class="card-body">
                <div class="field-row"><span class="field-label">缺口</span><span>{{ contrastResult.b.gap }}</span></div>
                <div class="field-row"><span class="field-label">欲望</span><span>{{ contrastResult.b.desire }}</span></div>
                <div class="field-row"><span class="field-label">恐惧</span><span>{{ contrastResult.b.fear }}</span></div>
                <div class="field-row"><span class="field-label">防御</span><span>{{ contrastResult.b.defense }}</span></div>
                <div class="field-row"><span class="field-label">脚本</span><span>{{ contrastResult.b.script }}</span></div>
                <div class="field-row"><span class="field-label">心智层级</span><span>{{ contrastResult.b.mindLevel }}</span></div>
                <div class="field-row"><span class="field-label">IFS定位</span><span>{{ contrastResult.b.ifsRole }}</span></div>
              </div>
            </div>
          </div>

          <!-- Difference highlight -->
          <div class="diff-section">
            <h3 class="section-title">关键差异</h3>
            <div class="diff-grid">
              <div class="diff-item">
                <div class="diff-label">模式差异</div>
                <p>{{ contrastResult.patternDiff }}</p>
              </div>
              <div class="diff-item">
                <div class="diff-label">情感风格</div>
                <p>{{ contrastResult.emotionDiff }}</p>
              </div>
              <div class="diff-item">
                <div class="diff-label">职场表现</div>
                <p>{{ contrastResult.workplaceDiff }}</p>
              </div>
            </div>
          </div>

          <!-- Topic angles -->
          <div class="angles-section">
            <h3 class="section-title">选题角度</h3>
            <div class="angles-list">
              <article v-for="(angle, idx) in contrastResult.topicAngles" :key="idx" class="angle-card">
                <div class="angle-number">{{ idx + 1 }}</div>
                <h4 class="angle-title">{{ angle.title }}</h4>
                <p class="angle-hook">{{ angle.hook }}</p>
                <p class="angle-body">{{ angle.body }}</p>
              </article>
            </div>
          </div>
        </section>

        <!-- Empty state -->
        <section v-else class="empty-state">
          <div class="empty-icon">⇄</div>
          <p>选择两个原型，查看他们的对照分析</p>
          <p class="empty-hint">也可以从对照主题中快速选择一组经典配对</p>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { archetypes } from '../data/archetypeData.js'
import { scenes } from '../data/sceneData.js'
import { archetypeContrasts, contrastThemes, findArchetype, generateContrast as genContrast } from '../data/archetypeContrastData.js'

const archetypeA = ref('')
const archetypeB = ref('')
const selectedScene = ref('')
const activeTheme = ref('')
const contrastResult = ref(null)

function selectTheme(t) {
  activeTheme.value = t.id
  archetypeA.value = t.a
  archetypeB.value = t.b
  generateContrast()
}

function generateContrast() {
  if (!archetypeA.value || !archetypeB.value) return
  contrastResult.value = genContrast(archetypeA.value, archetypeB.value, selectedScene.value)
}
</script>

<style scoped>
.tb-wrap { box-sizing: border-box; width: 100%; height: 100%; min-height: 0; overflow: hidden; background: #fafaf9; }
.tb-scroll { box-sizing: border-box; width: 100%; height: 100%; min-height: 0; overflow: hidden auto; overscroll-behavior: contain; }
/* ---- Container ---- */
.contrast-app {
  max-width: 1100px;
  margin: 0 auto;
  padding: 24px 16px 48px;
  color: var(--text-primary);
}

.browser-header {
  margin-bottom: 28px;
}

.browser-kicker {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.12em;
  color: var(--text-tertiary);
  margin-bottom: 4px;
}

.browser-header h1 {
  font-family: var(--font-serif);
  font-size: 26px;
  font-weight: 500;
  margin-bottom: 6px;
}

.browser-header p {
  font-size: 14px;
  color: var(--text-secondary);
  line-height: 1.6;
}

/* ---- Selectors ---- */
.selector-section {
  background: var(--bg-surface);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-panel);
  padding: 20px;
  margin-bottom: 24px;
}

.selector-row {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 20px;
}

.selector-block {
  flex: 1;
  min-width: 0;
}

.selector-label {
  display: block;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.06em;
  color: var(--text-tertiary);
  margin-bottom: 6px;
  text-transform: uppercase;
}

.contrast-select {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid var(--border-default);
  border-radius: var(--radius-control);
  background: var(--bg-elevated);
  color: var(--text-primary);
  font-size: 13px;
  outline: none;
  cursor: pointer;
  transition: border-color 0.18s;
}

.contrast-select:focus {
  border-color: rgba(32, 79, 103, 0.35);
  box-shadow: 0 0 0 3px rgba(32, 79, 103, 0.08);
}

.vs-badge {
  flex: 0 0 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-serif);
  font-size: 18px;
  font-weight: 700;
  color: var(--accent);
  margin-top: 24px;
}

.selected-preview {
  margin-top: 6px;
  padding: 6px 10px;
  background: var(--bg-elevated);
  border-radius: 6px;
  border: 1px solid var(--border-subtle);
  font-size: 12px;
}

.preview-name {
  font-weight: 600;
  color: var(--text-primary);
  margin-right: 6px;
}

.preview-liner {
  color: var(--text-tertiary);
}

/* ---- Theme chips ---- */
.theme-section {
  margin-bottom: 16px;
}

.theme-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.theme-chip {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 2px;
  padding: 10px 14px;
  border: 1px solid var(--border-default);
  border-radius: var(--radius-control);
  background: var(--bg-elevated);
  cursor: pointer;
  text-align: left;
  transition: all 0.18s ease;
  min-width: 160px;
}

.theme-chip:hover {
  border-color: rgba(32, 79, 103, 0.24);
  background: var(--brand-soft);
}

.theme-chip.active {
  border-color: var(--brand);
  background: var(--brand-soft);
}

.theme-label {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-primary);
}

.theme-pair {
  font-size: 11px;
  color: var(--text-tertiary);
}

/* ---- Scene ---- */
.scene-section {
  margin-bottom: 16px;
}

.scene-select {
  max-width: 500px;
}

.scene-tag {
  display: inline-block;
  margin-top: 6px;
  padding: 4px 10px;
  background: var(--brand-soft);
  border-radius: var(--radius-pill);
  font-size: 12px;
  color: var(--brand);
}

/* ---- Generate button ---- */
.generate-btn {
  display: block;
  width: 100%;
  padding: 12px;
  border: none;
  border-radius: var(--radius-control);
  background: var(--brand);
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.18s ease;
}

.generate-btn:hover:not(:disabled) {
  background: #1a3f52;
}

.generate-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* ---- Contrast result ---- */
.scene-context-banner {
  padding: 10px 16px;
  background: var(--brand-soft);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-control);
  font-size: 13px;
  color: var(--brand);
  margin-bottom: 20px;
  font-weight: 500;
}

.side-by-side {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 24px;
}

.contrast-card {
  border: 1px solid var(--border-default);
  border-radius: var(--radius-panel);
  background: var(--bg-surface);
  overflow: hidden;
}

.card-header {
  padding: 14px 16px;
  border-left: 3px solid;
  background: var(--bg-elevated);
  border-bottom: 1px solid var(--border-subtle);
}

.card-name {
  display: block;
  font-family: var(--font-serif);
  font-size: 18px;
  margin-bottom: 3px;
}

.card-liner {
  display: block;
  font-size: 12px;
  color: var(--text-tertiary);
  line-height: 1.5;
}

.card-body {
  padding: 12px 16px;
}

.field-row {
  display: flex;
  gap: 8px;
  padding: 6px 0;
  border-bottom: 1px solid var(--border-subtle);
  font-size: 12px;
  line-height: 1.6;
}

.field-row:last-child {
  border-bottom: none;
}

.field-label {
  flex: 0 0 64px;
  font-weight: 600;
  color: var(--text-tertiary);
  font-size: 11px;
  letter-spacing: 0.04em;
}

/* ---- Diff section ---- */
.section-title {
  font-family: var(--font-serif);
  font-size: 18px;
  font-weight: 500;
  margin-bottom: 14px;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--border-subtle);
}

.diff-section,
.angles-section {
  margin-bottom: 28px;
}

.diff-grid {
  display: grid;
  gap: 12px;
}

.diff-item {
  padding: 14px 16px;
  background: var(--bg-surface);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-control);
}

.diff-label {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.06em;
  color: var(--accent);
  margin-bottom: 6px;
  text-transform: uppercase;
}

.diff-item p {
  font-size: 13px;
  line-height: 1.7;
  color: var(--text-secondary);
}

/* ---- Angles ---- */
.angles-list {
  display: grid;
  gap: 12px;
}

.angle-card {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 16px;
  background: var(--bg-surface);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-panel);
  position: relative;
}

.angle-number {
  position: absolute;
  top: 12px;
  right: 14px;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: var(--brand-soft);
  color: var(--brand);
  font-size: 12px;
  font-weight: 700;
}

.angle-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
  padding-right: 32px;
}

.angle-hook {
  font-size: 13px;
  line-height: 1.6;
  color: var(--accent);
  font-weight: 500;
}

.angle-body {
  font-size: 12px;
  line-height: 1.7;
  color: var(--text-tertiary);
}

/* ---- Empty state ---- */
.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: var(--text-tertiary);
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 12px;
  color: var(--border-strong);
}

.empty-state p {
  font-size: 14px;
  line-height: 1.6;
}

.empty-hint {
  font-size: 12px !important;
  color: var(--text-muted);
  margin-top: 4px;
}

/* ---- Responsive ---- */
@media (max-width: 720px) {
  .selector-row {
    flex-direction: column;
  }

  .vs-badge {
    margin-top: 0;
    align-self: center;
  }

  .side-by-side {
    grid-template-columns: 1fr;
  }

  .theme-chip {
    min-width: 120px;
  }
}
</style>
