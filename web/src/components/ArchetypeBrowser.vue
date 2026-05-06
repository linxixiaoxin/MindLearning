<template>
  <div class="tb-wrap">
    <div class="tb-scroll">
      <div class="sys-browser">
        <header class="browser-header">
          <div>
            <div class="browser-kicker">ARCHETYPE SYSTEM</div>
            <h1>人格原型系统</h1>
            <p>72 个文学人物提炼为可复用的原型模式 · 按心智层级 / 防御方向 / 组织位置三个维度浏览。</p>
          </div>
          <div class="browser-stats">
            <span><strong>{{ archetypes.length }}</strong> 原型</span>
            <span><strong>{{ levels.length }}</strong> 心智层级</span>
            <span><strong>{{ defenses.length }}</strong> 防御方向</span>
          </div>
        </header>

        <section class="filter-row">
          <span class="filter-label">心智层级</span>
          <button v-for="l in levels" :key="l" class="chip" :class="{ active: activeLevel === l }"
            @click="activeLevel = activeLevel === l ? null : l">{{ l }}</button>
        </section>
        <section class="filter-row">
          <span class="filter-label">防御方向</span>
          <button v-for="d in defenses" :key="d" class="chip" :class="{ active: activeDefense === d }"
            @click="activeDefense = activeDefense === d ? null : d">{{ d }}</button>
        </section>

        <div class="archetype-grid">
          <article v-for="a in filteredArchetypes" :key="a.id" class="archetype-card">
            <div class="archetype-head">
              <span class="archetype-id">{{ a.id }}</span>
              <span class="archetype-level">{{ a.level }}</span>
              <span class="archetype-defense">{{ a.defense }}</span>
            </div>
            <strong class="archetype-name">{{ a.name }}</strong>
            <p class="archetype-liner">{{ a.oneLiner }}</p>
            <div class="archetype-meta">
              <span class="meta-tag">{{ a.position }}</span>
              <span class="meta-tag book">{{ a.book }}</span>
            </div>
          </article>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { archetypes } from '../data/archetypeData.js'

const activeLevel = ref(null)
const activeDefense = ref(null)
const levels = ['以我为尊','规范主导','规范主导→自主','自主导向','接近真我','内观自变']
const defenses = ['向上','向下','向外','向内','探测','承接']

const filteredArchetypes = computed(() => {
  let result = archetypes
  if (activeLevel.value) result = result.filter(a => a.level === activeLevel.value)
  if (activeDefense.value) result = result.filter(a => a.defense === activeDefense.value)
  return result
})
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
.filter-label { font-size: 0.75rem; color: #999; min-width: 4.5em; }
.chip { padding: 0.3rem 0.7rem; border-radius: 999px; border: 1px solid #e0e0e0; background: #fff; color: #555; font-size: 0.78rem; cursor: pointer; transition: all 0.15s; }
.chip:hover { border-color: #ccc; }
.chip.active { border-color: #8a5a44; color: #8a5a44; font-weight: 600; }
.archetype-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 0.6rem; margin-top: 1rem; }
.archetype-card { border: 1px solid #e8e8e8; border-radius: 10px; padding: 0.7rem 0.9rem; background: #fff; }
.archetype-head { display: flex; gap: 0.5rem; align-items: center; margin-bottom: 0.3rem; }
.archetype-id { font-size: 0.65rem; color: #bbb; }
.archetype-level { font-size: 0.68rem; color: #8a5a44; font-weight: 600; }
.archetype-defense { font-size: 0.65rem; color: #bbb; margin-left: auto; }
.archetype-name { font-size: 0.9rem; color: #333; display: block; margin-bottom: 0.15rem; }
.archetype-liner { font-size: 0.73rem; color: #888; margin: 0 0 0.3rem; line-height: 1.4; }
.archetype-meta { display: flex; gap: 0.4rem; }
.meta-tag { font-size: 0.65rem; padding: 0.1rem 0.4rem; border-radius: 999px; background: #f0ebe3; color: #8a5a44; }
.meta-tag.book { background: #f0f0f0; color: #777; }
</style>
