<template>
  <div class="tb-wrap">
    <div class="tb-scroll">
      <div class="sys-browser">
        <header class="browser-header">
          <div>
            <div class="browser-kicker">CONCEPT SYSTEM</div>
            <h1>概念系统</h1>
            <p>{{ concepts.length }} 个概念卡片 · 从日常觉察到深层思辨，构建你的认知底图。</p>
          </div>
          <div class="browser-stats">
            <span><strong>{{ concepts.length }}</strong> 概念</span>
            <span><strong>{{ conceptTypes.length }}</strong> 类型</span>
            <span><strong>{{ maturityLevels.length }}</strong> 成熟度</span>
          </div>
        </header>

        <section class="filter-row">
          <span class="filter-label">概念类型</span>
          <button
            v-for="t in conceptTypes"
            :key="t.id"
            class="chip"
            :class="{ active: activeType === t.id }"
            :style="{ '--c': t.color }"
            @click="activeType = activeType === t.id ? null : t.id"
          >{{ t.label }}</button>
        </section>

        <section class="filter-row">
          <span class="filter-label">成熟度</span>
          <button
            v-for="m in maturityLevels"
            :key="m.id"
            class="chip maturity-chip"
            :class="{ active: activeMaturity === m.id }"
            @click="activeMaturity = activeMaturity === m.id ? null : m.id"
          >{{ m.label }}</button>
        </section>

        <div class="concept-grid">
          <article v-for="c in filteredConcepts" :key="c.name" class="concept-card">
            <div class="concept-head">
              <span class="concept-type" :style="{ color: typeColor(c.type) }">{{ c.type }}</span>
              <span class="concept-maturity" :class="maturityClass(c.maturity)">{{ maturityLabel(c.maturity) }}</span>
            </div>
            <strong class="concept-name">{{ c.name }}</strong>
          </article>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { concepts, conceptTypes, maturityLevels } from '../data/conceptIndexData.js'

const activeType = ref(null)
const activeMaturity = ref(null)

const filteredConcepts = computed(() => {
  let result = concepts
  if (activeType.value) result = result.filter(c => c.type === activeType.value)
  if (activeMaturity.value) result = result.filter(c => c.maturity === activeMaturity.value)
  return result
})

function typeColor(id) { return conceptTypes.find(t => t.id === id)?.color || '#888' }

function maturityClass(m) {
  if (m === 'Evergreen') return 'maturity-eg'
  if (m === 'Growing') return 'maturity-gr'
  return 'maturity-sd'
}

function maturityLabel(m) {
  return maturityLevels.find(l => l.id === m)?.label || m
}
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
.filter-row { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.75rem; flex-wrap: wrap; }
.filter-label { font-size: 0.75rem; color: #999; min-width: 4em; }
.chip { padding: 0.3rem 0.7rem; border-radius: 999px; border: 1px solid #e0e0e0; background: #fff; color: #555; font-size: 0.78rem; cursor: pointer; transition: all 0.15s; }
.chip:hover { border-color: #ccc; }
.chip.active { border-color: var(--c, #888); color: var(--c, #555); font-weight: 600; }
.maturity-chip.active { border-color: #333; color: #333; }
.concept-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 0.5rem; margin-top: 1rem; }
.concept-card { border: 1px solid #e8e8e8; border-radius: 10px; padding: 0.7rem 0.9rem; background: #fff; transition: border-color 0.15s; }
.concept-card:hover { border-color: #ccc; }
.concept-head { display: flex; gap: 0.5rem; align-items: center; margin-bottom: 0.3rem; }
.concept-type { font-size: 0.68rem; font-weight: 600; }
.concept-maturity { font-size: 0.62rem; padding: 0.1rem 0.4rem; border-radius: 4px; margin-left: auto; }
.maturity-sd { background: #f5f5f5; color: #999; }
.maturity-gr { background: #e8f5e9; color: #388e3c; }
.maturity-eg { background: #fff3e0; color: #e65100; }
.concept-name { font-size: 0.85rem; color: #333; display: block; line-height: 1.35; }
</style>
