<template>
  <div class="tb-wrap">
    <div class="tb-scroll">
      <div class="sys-browser">
        <header class="browser-header">
          <div>
            <div class="browser-kicker">METHOD SYSTEM</div>
            <h1>方法系统</h1>
            <p>72 个可操作的方法 · 7 类动作 × 3 种深度 · 不只是「我懂了」，是「今天可以试试这个」。</p>
          </div>
          <div class="browser-stats">
            <span><strong>{{ methods.length }}</strong> 方法</span>
            <span><strong>{{ methodTypes.length }}</strong> 类型</span>
            <span><strong>{{ methodDepths.length }}</strong> 深度</span>
          </div>
        </header>

        <section class="filter-row">
          <span class="filter-label">方法类型</span>
          <button v-for="t in methodTypes" :key="t.id" class="chip"
            :class="{ active: activeType === t.id }" :style="{ '--c': t.color }"
            @click="activeType = activeType === t.id ? null : t.id">{{ t.label }}</button>
        </section>
        <section class="filter-row">
          <span class="filter-label">适用深度</span>
          <button v-for="d in methodDepths" :key="d.id" class="chip"
            :class="{ active: activeDepth === d.id }"
            @click="activeDepth = activeDepth === d.id ? null : d.id">{{ d.label }}</button>
        </section>

        <div class="method-grid">
          <article v-for="m in filteredMethods" :key="m.id" class="method-card">
            <div class="method-head">
              <span class="method-id">{{ m.id }}</span>
              <span class="method-type" :style="{ color: typeColor(m.type) }">{{ m.type }}</span>
              <span class="method-depth">{{ m.depth }}</span>
            </div>
            <strong class="method-title">{{ m.title }}</strong>
            <p class="method-one">{{ m.one }}</p>
          </article>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { methods, methodTypes, methodDepths } from '../data/methodData.js'

const activeType = ref(null)
const activeDepth = ref(null)

const filteredMethods = computed(() => {
  let result = methods
  if (activeType.value) result = result.filter(m => m.type === activeType.value)
  if (activeDepth.value) result = result.filter(m => m.depth === activeDepth.value)
  return result
})

function typeColor(id) { return methodTypes.find(t => t.id === id)?.color || '#888' }
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
.method-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 0.6rem; margin-top: 1rem; }
.method-card { border: 1px solid #e8e8e8; border-radius: 10px; padding: 0.7rem 0.9rem; background: #fff; }
.method-head { display: flex; gap: 0.5rem; align-items: center; margin-bottom: 0.3rem; }
.method-id { font-size: 0.65rem; color: #bbb; }
.method-type { font-size: 0.68rem; font-weight: 600; }
.method-depth { font-size: 0.65rem; color: #bbb; margin-left: auto; }
.method-title { font-size: 0.85rem; color: #333; display: block; margin-bottom: 0.15rem; }
.method-one { font-size: 0.73rem; color: #888; margin: 0; line-height: 1.4; }
</style>
