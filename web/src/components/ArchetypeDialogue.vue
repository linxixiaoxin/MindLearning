<template>
  <div class="dialogue-shell">
    <div class="dialogue-header">
      <h2 class="dialogue-title">原型对话实验室</h2>
      <p class="dialogue-subtitle">选择场景和两个人格原型，观看它们的内在模式如何对话</p>
    </div>

    <div class="selector-panel">
      <div class="selector-row">
        <div class="selector-group">
          <label class="selector-label">场景</label>
          <select v-model="selectedScene" class="selector" @change="onSceneChange">
            <option value="" disabled>选择一个处境…</option>
            <option v-for="s in scenes" :key="s.id" :value="s.id">
              {{ s.id }} {{ s.title }}
            </option>
          </select>
          <span v-if="currentScene" class="scene-domain-tag" :style="{ background: domainColor }">
            {{ currentScene.domain }}
          </span>
        </div>

        <div class="selector-group">
          <label class="selector-label">原型 A</label>
          <select v-model="selectedArchA" class="selector" @change="onArchChange">
            <option value="" disabled>选择原型…</option>
            <option v-for="a in archetypes" :key="a.id" :value="a.id">
              {{ a.name }} — {{ a.oneLiner }}
            </option>
          </select>
        </div>

        <div class="selector-group">
          <label class="selector-label">原型 B</label>
          <select v-model="selectedArchB" class="selector" @change="onArchChange">
            <option value="" disabled>选择原型…</option>
            <option v-for="a in archetypes" :key="a.id" :value="a.id">
              {{ a.name }} — {{ a.oneLiner }}
            </option>
          </select>
        </div>
      </div>

      <div class="selector-actions">
        <button class="generate-btn" @click="generate" :disabled="!canGenerate">
          {{ dialogue ? '重新生成' : '生成对话' }}
        </button>
        <button class="random-btn" @click="pickRandom">
          换个场景
        </button>
      </div>
    </div>

    <div v-if="!dialogue" class="empty-state">
      <div class="empty-icon">🎭</div>
      <p class="empty-text">选择场景和两个原型，生成一段心理对话</p>
      <p class="empty-hint">每一句台词都来自角色最核心的防御模式</p>
    </div>

    <div v-else class="dialogue-output">
      <div class="scene-context">
        <div class="scene-badge">{{ dialogue.sceneId }}</div>
        <div class="scene-title">{{ dialogue.sceneTitle }}</div>
        <div class="scene-domain-line">
          <span class="domain-tag" :style="{ background: domainColor }">{{ dialogue.sceneDomain }}</span>
          <span class="stuck-tag">{{ dialogue.sceneStuck }}</span>
        </div>
        <div class="scene-oneliner">{{ dialogue.sceneOneLiner }}</div>
        <div class="scene-description">{{ dialogue.sceneDescription }}</div>
      </div>

      <div class="dialogue-lines">
        <div
          v-for="(line, idx) in dialogue.lines"
          :key="idx"
          class="dialogue-line"
          :class="{
            'line-a': isArchA(line.speaker),
            'line-b': isArchB(line.speaker),
          }"
        >
          <span class="line-speaker">{{ line.speaker }}</span>
          <span class="line-divider">：</span>
          <span class="line-text">{{ line.text }}</span>
        </div>
      </div>

      <div class="dialogue-angle">
        <div class="angle-divider"></div>
        <p class="angle-text">{{ dialogue.angle }}</p>
      </div>

      <div class="dialogue-meta">
        <div class="meta-item">
          <span class="meta-label">{{ archA?.name }} 的防御方向</span>
          <span class="meta-badge" :class="'dir-' + (archA?.defense || 'unknown')">
            {{ archA?.defense || '未知' }}
          </span>
          <span class="meta-desc">{{ archA?.oneLiner }}</span>
        </div>
        <div class="meta-item">
          <span class="meta-label">{{ archB?.name }} 的防御方向</span>
          <span class="meta-badge" :class="'dir-' + (archB?.defense || 'unknown')">
            {{ archB?.defense || '未知' }}
          </span>
          <span class="meta-desc">{{ archB?.oneLiner }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { archetypes } from '../data/archetypeData.js'
import { scenes, lifeDomains, stuckTypes } from '../data/sceneData.js'
import { generateDialogue, getVoice } from '../data/dialogueData.js'

const selectedScene = ref('')
const selectedArchA = ref('')
const selectedArchB = ref('')
const dialogue = ref(null)

const domainColorMap = Object.fromEntries(
  lifeDomains.map((d) => [d.id, d.color])
)

const stuckTypeMap = Object.fromEntries(
  stuckTypes.map((s) => [s.id, s.label])
)

const currentScene = computed(() =>
  scenes.find((s) => s.id === selectedScene.value)
)

const domainColor = computed(() => {
  if (!currentScene.value) return '#75838c'
  return domainColorMap[currentScene.value.domain] || '#75838c'
})

const archA = computed(() =>
  archetypes.find((a) => a.id === selectedArchA.value)
)

const archB = computed(() =>
  archetypes.find((a) => a.id === selectedArchB.value)
)

const canGenerate = computed(() =>
  selectedScene.value && selectedArchA.value && selectedArchB.value
)

function isArchA(name) {
  return name === archA.value?.name
}

function isArchB(name) {
  return name === archB.value?.name
}

function onSceneChange() {
  if (canGenerate.value) generate()
}

function onArchChange() {
  if (canGenerate.value) generate()
}

function pickRandom() {
  const sceneIdx = Math.floor(Math.random() * scenes.length)
  selectedScene.value = scenes[sceneIdx].id

  let aIdx = Math.floor(Math.random() * archetypes.length)
  let bIdx
  do {
    bIdx = Math.floor(Math.random() * archetypes.length)
  } while (bIdx === aIdx)

  selectedArchA.value = archetypes[aIdx].id
  selectedArchB.value = archetypes[bIdx].id

  generate()
}

function generate() {
  if (!canGenerate.value) return

  const scene = currentScene.value
  const a = archA.value
  const b = archB.value
  if (!scene || !a || !b) return

  const result = generateDialogue(a, b, scene)

  dialogue.value = {
    sceneId: scene.id,
    sceneTitle: scene.title,
    sceneDomain: scene.domain,
    sceneStuck: stuckTypeMap[scene.stuck] || scene.stuck,
    sceneOneLiner: scene.oneLiner,
    sceneDescription: `${scene.domain}场景——${scene.oneLiner}`,
    lines: result.lines,
    angle: result.angle,
  }
}
</script>

<style scoped>
.dialogue-shell {
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: var(--bg-page);
}

.dialogue-header {
  padding: 20px 28px 8px;
}

.dialogue-title {
  font-family: var(--font-serif);
  font-size: 20px;
  color: var(--text-primary);
  margin: 0;
}

.dialogue-subtitle {
  font-size: 13px;
  color: var(--text-tertiary);
  margin: 4px 0 0;
}

.selector-panel {
  padding: 12px 28px;
  border-bottom: 1px solid var(--border-subtle);
  background: var(--bg-surface);
}

.selector-row {
  display: flex;
  gap: 12px;
  align-items: flex-end;
  flex-wrap: wrap;
}

.selector-group {
  flex: 1;
  min-width: 200px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  position: relative;
}

.selector-label {
  font-size: 11px;
  color: var(--text-tertiary);
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.selector {
  width: 100%;
  padding: 8px 10px;
  border: 1px solid var(--border-default);
  border-radius: var(--radius-control);
  background: var(--bg-elevated);
  color: var(--text-primary);
  font-size: 12px;
  outline: none;
  cursor: pointer;
  transition: border-color 0.18s ease, box-shadow 0.18s ease;
  appearance: auto;
}

.selector:focus {
  border-color: rgba(32, 79, 103, 0.35);
  box-shadow: 0 0 0 3px rgba(32, 79, 103, 0.08);
}

.scene-domain-tag {
  position: absolute;
  right: 8px;
  bottom: 7px;
  font-size: 10px;
  color: #fff;
  padding: 1px 6px;
  border-radius: 4px;
  pointer-events: none;
  opacity: 0.8;
}

.selector-actions {
  display: flex;
  gap: 8px;
  margin-top: 10px;
}

.generate-btn,
.random-btn {
  padding: 8px 18px;
  border: 1px solid var(--border-default);
  border-radius: var(--radius-pill);
  font-size: 12px;
  cursor: pointer;
  transition: background 0.18s ease, color 0.18s ease, border-color 0.18s ease;
}

.generate-btn {
  background: var(--brand);
  color: #fff;
  border-color: var(--brand);
}

.generate-btn:hover:not(:disabled) {
  background: #1a3f52;
}

.generate-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.random-btn {
  background: var(--bg-elevated);
  color: var(--text-secondary);
}

.random-btn:hover {
  color: var(--brand);
  border-color: rgba(32, 79, 103, 0.24);
}

.empty-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 40px;
  color: var(--text-tertiary);
}

.empty-icon {
  font-size: 48px;
  opacity: 0.4;
}

.empty-text {
  font-size: 16px;
  color: var(--text-secondary);
  margin: 0;
}

.empty-hint {
  font-size: 12px;
  color: var(--text-muted);
  margin: 0;
}

.dialogue-output {
  flex: 1;
  overflow-y: auto;
  padding: 20px 28px 32px;
}

.scene-context {
  padding: 14px 18px;
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-panel);
  background: var(--bg-elevated);
  margin-bottom: 20px;
}

.scene-badge {
  display: inline-block;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.05em;
  color: var(--text-muted);
  margin-bottom: 4px;
}

.scene-title {
  font-family: var(--font-serif);
  font-size: 17px;
  color: var(--text-primary);
  margin-bottom: 6px;
}

.scene-domain-line {
  display: flex;
  gap: 6px;
  margin-bottom: 8px;
}

.domain-tag {
  font-size: 10px;
  color: #fff;
  padding: 1px 8px;
  border-radius: 4px;
}

.stuck-tag {
  font-size: 10px;
  color: var(--text-muted);
  padding: 1px 8px;
  border: 1px solid var(--border-subtle);
  border-radius: 4px;
}

.scene-oneliner {
  font-size: 12px;
  color: var(--text-secondary);
  font-style: italic;
  margin-bottom: 4px;
}

.scene-description {
  font-size: 12px;
  color: var(--text-tertiary);
  line-height: 1.6;
}

.dialogue-lines {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 20px;
}

.dialogue-line {
  padding: 12px 16px;
  border-radius: var(--radius-panel);
  line-height: 1.7;
  font-size: 13px;
  max-width: 80%;
}

.line-a {
  align-self: flex-start;
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  border-left: 3px solid var(--brand);
}

.line-b {
  align-self: flex-end;
  background: var(--bg-elevated);
  border: 1px solid var(--border-subtle);
  border-right: 3px solid var(--accent);
}

.line-speaker {
  font-weight: 700;
  color: var(--text-primary);
  font-family: var(--font-serif);
}

.line-divider {
  color: var(--text-tertiary);
}

.line-text {
  color: var(--text-secondary);
}

.dialogue-angle {
  margin-bottom: 20px;
}

.angle-divider {
  height: 1px;
  background: var(--border-default);
  margin-bottom: 12px;
}

.angle-text {
  font-size: 13px;
  color: var(--text-secondary);
  line-height: 1.7;
  margin: 0;
  padding: 0 4px;
  font-style: italic;
}

.dialogue-meta {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  padding: 12px 16px;
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-panel);
  background: var(--bg-surface);
}

.meta-item {
  flex: 1;
  min-width: 180px;
  display: flex;
  flex-direction: column;
  gap: 3px;
  font-size: 12px;
}

.meta-label {
  color: var(--text-tertiary);
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  font-weight: 600;
}

.meta-badge {
  display: inline-block;
  padding: 2px 10px;
  border-radius: var(--radius-pill);
  font-size: 11px;
  font-weight: 600;
  width: fit-content;
}

.dir-向上 {
  background: #fff3e0;
  color: #bf6f3f;
  border: 1px solid #ffd8b3;
}

.dir-向下 {
  background: #e8eaf6;
  color: #5c6bc0;
  border: 1px solid #c5cae9;
}

.dir-向外 {
  background: #fce4ec;
  color: #c62828;
  border: 1px solid #f8bbd0;
}

.dir-向内 {
  background: #f3e5f5;
  color: #7b1fa2;
  border: 1px solid #e1bee7;
}

.dir-探测 {
  background: #e0f2f1;
  color: #00695c;
  border: 1px solid #b2dfdb;
}

.dir-承接 {
  background: #fff8e1;
  color: #f57f17;
  border: 1px solid #ffe082;
}

.dir-unknown {
  background: #f5f5f5;
  color: #9e9e9e;
  border: 1px solid #e0e0e0;
}

.meta-desc {
  color: var(--text-tertiary);
  font-size: 11px;
}

@media (max-width: 720px) {
  .dialogue-header,
  .selector-panel,
  .dialogue-output {
    padding-left: 16px;
    padding-right: 16px;
  }

  .selector-row {
    flex-direction: column;
  }

  .selector-group {
    min-width: 0;
  }

  .dialogue-line {
    max-width: 100%;
  }

  .line-b {
    align-self: flex-start;
    border-left: 3px solid var(--accent);
    border-right: none;
  }
}
</style>
