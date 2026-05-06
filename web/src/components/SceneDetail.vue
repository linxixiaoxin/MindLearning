<template>
  <div class="tb-wrap"><div class="tb-scroll"><div class="detail-shell">
    <div v-if="scene" class="detail-inner">
      <button class="back-btn" @click="$emit('back')">← 返回场景列表</button>

      <!-- Header -->
      <section class="detail-header">
        <div class="header-kicker">SCENE DETAIL</div>
        <h1>{{ scene.title }}</h1>
        <p class="header-liner">{{ scene.oneLiner }}</p>
        <div class="header-meta">
          <span class="meta-tag" :style="{ color: domainColor(scene.domain), borderColor: domainColor(scene.domain) }">{{ scene.domain }}</span>
          <span class="meta-tag stuck">{{ scene.stuck }}</span>
          <span class="meta-tag depth">{{ scene.depth }}</span>
          <span class="meta-tag id">{{ scene.id }}</span>
        </div>
      </section>

      <!-- Archetype section -->
      <section v-if="matchedArchetypes.length" class="detail-section">
        <h2>这个处境下的人物</h2>
        <p class="section-desc">这些文学/文化原型和这个处境共享相同的心理结构。</p>
        <div class="linked-grid">
          <article v-for="a in matchedArchetypes" :key="a.id" class="linked-card">
            <strong>{{ a.name }}</strong>
            <p>{{ a.oneLiner }}</p>
            <span class="linked-meta">{{ a.level }} · {{ a.book }}</span>
          </article>
        </div>
      </section>

      <!-- Thinker section -->
      <section v-if="matchedThinkers.length" class="detail-section">
        <h2>理解的镜头</h2>
        <p class="section-desc">用这些思想家的视角重新理解这个处境。</p>
        <div class="linked-grid">
          <article v-for="t in matchedThinkers" :key="t.id" class="linked-card thinker">
            <strong>{{ t.name }}</strong>
            <p>{{ t.description }}</p>
            <span class="linked-meta">{{ t.school }}</span>
          </article>
        </div>
      </section>

      <!-- Method section -->
      <section v-if="matchedMethods.length" class="detail-section">
        <h2>可以试试</h2>
        <p class="section-desc">针对「{{ scene.stuck }}」类处境的方法建议。</p>
        <div class="linked-grid">
          <article v-for="m in matchedMethods" :key="m.id" class="method-card">
            <strong>{{ m.title }}</strong>
            <span class="method-type" :style="{ color: methodTypeColor(m.type) }">{{ m.type }}</span>
            <p>{{ m.one }}</p>
          </article>
        </div>
      </section>

      <!-- Metaphor section -->
      <section v-if="matchedMetaphors.length" class="detail-section">
        <h2>金句钩子</h2>
        <p class="section-desc">可以写入内容的隐喻钩子。</p>
        <div class="linked-grid metaphors">
          <article v-for="mt in matchedMetaphors" :key="mt.id" class="metaphor-card">
            <strong>{{ mt.title }}</strong>
            <span class="metaphor-type">{{ mt.type }}</span>
            <p>{{ mt.concept }}</p>
          </article>
        </div>
      </section>
    </div>

    <div v-else class="empty-state">
      <h2>未找到场景</h2>
      <p>场景 ID "{{ sceneId }}" 不存在。</p>
      <button class="back-btn" @click="$emit('back')">返回场景列表</button>
    </div>
  </div></div></div>
</template>

<script setup>
import { computed } from 'vue'
import { scenes, lifeDomains, stuckTypes } from '../data/sceneData.js'
import { archetypes } from '../data/archetypeData.js'
import { thinkers } from '../data/thoughtPartnerData.js'
import { methods, methodTypes } from '../data/methodData.js'
import { metaphors, metaphorTypes } from '../data/metaphorData.js'

const props = defineProps({
  sceneId: {
    type: String,
    required: true,
  },
})

defineEmits(['back'])

const scene = computed(() => scenes.find((s) => s.id === props.sceneId))

const matchedArchetypes = computed(() => {
  if (!scene.value) return []
  return archetypes.filter((a) => (scene.value.archetypes || []).includes(a.name))
})

const matchedThinkers = computed(() => {
  if (!scene.value) return []
  return (scene.value.thinkers || [])
    .map((name) => Object.values(thinkers).find((t) => t.name === name))
    .filter(Boolean)
})

const stuckMethodMap = {
  '说不出口': ['表达'],
  '停不下来': ['觉察', '身体'],
  '回不去': ['创作', '身体'],
  '出不去': ['系统', '判断'],
  '连不上': ['关系', '觉察'],
  '认不清': ['判断', '觉察'],
}

const matchedMethods = computed(() => {
  if (!scene.value) return []
  const targetTypes = stuckMethodMap[scene.value.stuck] || []
  return methods.filter((m) => targetTypes.includes(m.type)).slice(0, 6)
})

const stuckMetaphorMap = {
  '说不出口': ['身体意象', '关系意象'],
  '停不下来': ['机械意象', '自然意象'],
  '回不去': ['时间意象', '空间意象'],
  '出不去': ['空间意象', '机械意象'],
  '连不上': ['关系意象', '空间意象'],
  '认不清': ['自然意象', '身体意象'],
}

const matchedMetaphors = computed(() => {
  if (!scene.value) return []
  const targetTypes = stuckMetaphorMap[scene.value.stuck] || []
  return metaphors.filter((m) => targetTypes.includes(m.type)).slice(0, 3)
})

function domainColor(domainId) {
  return lifeDomains.find((d) => d.id === domainId)?.color || '#888'
}

function methodTypeColor(type) {
  return methodTypes.find((mt) => mt.id === type)?.color || '#888'
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
.detail-shell {
  max-width: 1040px;
  margin: 0 auto;
  padding: 24px 20px 60px;
}
.back-btn {
  border: 1px solid #e0e0e0;
  border-radius: 999px;
  background: rgba(255,255,255,0.76);
  color: #666;
  padding: 7px 13px;
  font-size: 12px;
  cursor: pointer;
  transition: color 0.15s, border-color 0.15s;
}
.back-btn:hover {
  color: #204f67;
  border-color: rgba(32,79,103,0.24);
}
.detail-header {
  margin-top: 16px;
  padding: 24px 28px;
  border: 1px solid #e8e8e8;
  border-radius: 18px;
  background: rgba(247,245,240,0.92);
}
.header-kicker {
  font-size: 10px;
  letter-spacing: 0.16em;
  color: #999;
  text-transform: uppercase;
}
.detail-header h1 {
  margin-top: 10px;
  font-size: 28px;
  color: #333;
  line-height: 1.25;
}
.header-liner {
  margin-top: 8px;
  color: #777;
  line-height: 1.6;
  font-size: 15px;
}
.header-meta {
  margin-top: 12px;
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
.meta-tag {
  font-size: 11px;
  padding: 3px 9px;
  border-radius: 999px;
  border: 1px solid #e0e0e0;
  color: #888;
}
.meta-tag.stuck {
  background: #f0ebe3;
  border-color: #d9ceba;
  color: #8a6d3b;
}
.meta-tag.depth {
  background: #e8f0f3;
  border-color: #bfd3d9;
  color: #2f6f73;
}
.meta-tag.id {
  background: #f5f5f5;
  border-color: #ddd;
  color: #aaa;
  margin-left: auto;
}
.detail-section {
  margin-top: 20px;
}
.detail-section h2 {
  font-size: 18px;
  color: #333;
  margin: 0 0 4px;
}
.section-desc {
  margin: 0 0 12px;
  font-size: 13px;
  color: #999;
}
.linked-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 10px;
}
.linked-card,
.method-card,
.metaphor-card {
  border: 1px solid #e8e8e8;
  border-radius: 10px;
  padding: 14px;
  background: #fff;
}
.linked-card strong,
.method-card strong,
.metaphor-card strong {
  font-size: 14px;
  color: #333;
  display: block;
  margin-bottom: 4px;
}
.linked-card p,
.method-card p,
.metaphor-card p {
  margin: 0;
  font-size: 12px;
  color: #777;
  line-height: 1.5;
}
.linked-meta {
  display: block;
  margin-top: 6px;
  font-size: 11px;
  color: #aaa;
}
.method-type {
  display: inline-block;
  font-size: 10px;
  font-weight: 600;
  margin-bottom: 4px;
}
.metaphor-type {
  display: inline-block;
  font-size: 10px;
  color: #aaa;
  margin-bottom: 4px;
}
.metaphor-card strong {
  color: #8a5a44;
}
.empty-state {
  margin-top: 40px;
  text-align: center;
  color: #888;
}
.empty-state h2 {
  color: #555;
}
</style>
