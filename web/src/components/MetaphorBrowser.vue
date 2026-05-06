<template>
  <div class="tb-wrap"><div class="tb-scroll"><div class="sys-browser">
    <header class="browser-header">
      <div>
        <div class="browser-kicker">METAPHOR SYSTEM</div>
        <h1>隐喻系统</h1>
        <p>72 个高记忆度意象 · 6 类意象 × 4 种使用场景 · 一个隐喻就是一个爆款标题。</p>
      </div>
      <div class="browser-stats"><span><strong>{{ metaphors.length }}</strong> 隐喻</span><span><strong>{{ metaphorTypes.length }}</strong> 类型</span></div>
    </header>
    <section class="filter-row">
      <span class="filter-label">意象类型</span>
      <button v-for="t in metaphorTypes" :key="t.id" class="chip" :class="{ active: activeType === t.id }" :style="{ '--c': t.color }" @click="activeType = activeType === t.id ? null : t.id">{{ t.label }}</button>
    </section>
    <div class="metaphor-grid">
      <article v-for="m in filteredMetaphors" :key="m.id" class="metaphor-card">
        <div class="metaphor-head"><span class="metaphor-id">{{ m.id }}</span><span class="metaphor-type" :style="{ color: typeColor(m.type) }">{{ m.type }}</span><span class="metaphor-scene">{{ m.scene }}</span></div>
        <strong class="metaphor-title">{{ m.title }}</strong>
        <span class="metaphor-concept">→ {{ m.concept }}</span>
      </article>
    </div>
  </div></div></div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { metaphors, metaphorTypes } from '../data/metaphorData.js'
const activeType = ref(null)
const filteredMetaphors = computed(() => activeType.value ? metaphors.filter(m => m.type === activeType.value) : metaphors)
function typeColor(id) { return metaphorTypes.find(t => t.id === id)?.color || '#888' }
</script>

<style scoped>
.tb-wrap { box-sizing: border-box; width: 100%; height: 100%; min-height: 0; overflow: hidden; background: #fafaf9; }
.tb-scroll { box-sizing: border-box; width: 100%; height: 100%; min-height: 0; overflow: hidden auto; overscroll-behavior: contain; }
.sys-browser { max-width: 1200px; margin: 0 auto; padding: 2rem 1.5rem; }
.browser-header { display: flex; justify-content: space-between; align-items: flex-start; gap: 2rem; margin-bottom: 1.5rem; }
.browser-kicker { font-size: 0.7rem; letter-spacing: 0.15em; color: #999; margin-bottom: 0.25rem; }
.browser-header h1 { font-size: 1.6rem; margin: 0 0 0.5rem; color: #333; }
.browser-header p { color: #777; max-width: 560px; line-height: 1.6; margin: 0; }
.browser-stats { display: flex; gap: 1.5rem; flex-shrink: 0; font-size: 0.85rem; color: #777; }
.browser-stats strong { color: #333; }
.filter-row { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 1rem; flex-wrap: wrap; }
.filter-label { font-size: 0.75rem; color: #999; min-width: 4em; }
.chip { padding: 0.3rem 0.7rem; border-radius: 999px; border: 1px solid #e0e0e0; background: #fff; color: #555; font-size: 0.78rem; cursor: pointer; }
.chip:hover { border-color: #ccc; }
.chip.active { border-color: var(--c, #888); color: var(--c, #555); font-weight: 600; }
.metaphor-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 0.5rem; }
.metaphor-card { border: 1px solid #e8e8e8; border-radius: 10px; padding: 0.6rem 0.85rem; background: #fff; }
.metaphor-head { display: flex; gap: 0.5rem; align-items: center; margin-bottom: 0.2rem; }
.metaphor-id { font-size: 0.6rem; color: #bbb; }
.metaphor-type { font-size: 0.65rem; font-weight: 600; }
.metaphor-scene { font-size: 0.65rem; color: #bbb; margin-left: auto; }
.metaphor-title { font-size: 0.82rem; color: #333; display: block; margin-bottom: 0.1rem; }
.metaphor-concept { font-size: 0.68rem; color: #999; }
</style>
