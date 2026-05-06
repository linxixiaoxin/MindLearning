<template>
  <div class="tb-wrap">
    <div class="tb-scroll">
      <div class="sys-browser">
        <header class="browser-header">
          <div>
            <div class="browser-kicker">SCENE SYSTEM</div>
            <h1>场景系统</h1>
            <p>72 个现代生活处境 · 6 生活域 × 6 卡住类型 · 用户从情绪到内容的第一跳板。</p>
          </div>
          <div class="browser-stats">
            <span><strong>{{ scenes.length }}</strong> 场景</span>
            <span><strong>{{ lifeDomains.length }}</strong> 生活域</span>
            <span><strong>{{ stuckTypes.length }}</strong> 卡住类型</span>
          </div>
        </header>

        <section class="filter-row">
          <span class="filter-label">生活域</span>
          <button v-for="d in lifeDomains" :key="d.id" class="chip"
            :class="{ active: activeDomain === d.id }" :style="{ '--c': d.color }"
            @click="activeDomain = activeDomain === d.id ? null : d.id">{{ d.label }}</button>
        </section>
        <section class="filter-row">
          <span class="filter-label">卡住类型</span>
          <button v-for="s in stuckTypes" :key="s.id" class="chip"
            :class="{ active: activeStuck === s.id }"
            @click="activeStuck = activeStuck === s.id ? null : s.id">{{ s.label }}</button>
        </section>

        <div class="scene-matrix">
          <article v-for="scene in filteredScenes" :key="scene.id" class="scene-card" @click="$emit('select-scene', scene.id)">
            <div class="scene-head">
              <span class="scene-id">{{ scene.id }}</span>
              <span class="scene-domain" :style="{ color: domainColor(scene.domain) }">{{ scene.domain }}</span>
              <span class="scene-stuck">{{ scene.stuck }}</span>
              <span class="scene-depth">{{ scene.depth }}</span>
            </div>
            <strong class="scene-title">{{ scene.title }}</strong>
            <p class="scene-liner">{{ scene.oneLiner }}</p>
            <div class="scene-links">
              <span v-if="scene.archetypes.length" class="link-tag">原型: {{ scene.archetypes.join(' · ') }}</span>
              <span v-if="scene.thinkers.length" class="link-tag thinker">思想家: {{ scene.thinkers.join(' · ') }}</span>
            </div>
          </article>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { scenes, lifeDomains, stuckTypes } from '../data/sceneData.js'

defineEmits(['select-scene'])

const activeDomain = ref(null)
const activeStuck = ref(null)

const filteredScenes = computed(() => {
  let result = scenes
  if (activeDomain.value) result = result.filter(s => s.domain === activeDomain.value)
  if (activeStuck.value) result = result.filter(s => s.stuck === activeStuck.value)
  return result
})

function domainColor(id) {
  return lifeDomains.find(d => d.id === id)?.color || '#888'
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
.scene-matrix { display: grid; grid-template-columns: repeat(auto-fill, minmax(360px, 1fr)); gap: 0.75rem; margin-top: 1rem; }
.scene-card { border: 1px solid #e8e8e8; border-radius: 10px; padding: 0.85rem 1rem; background: #fff; cursor: pointer; transition: box-shadow 0.15s, border-color 0.15s; }
.scene-card:hover { border-color: #204f67; box-shadow: 0 2px 8px rgba(32,79,103,0.1); }
.scene-head { display: flex; gap: 0.5rem; align-items: center; margin-bottom: 0.4rem; }
.scene-id { font-size: 0.65rem; color: #bbb; }
.scene-domain { font-size: 0.7rem; font-weight: 600; }
.scene-stuck { font-size: 0.68rem; color: #999; }
.scene-depth { font-size: 0.65rem; color: #bbb; margin-left: auto; }
.scene-title { font-size: 0.88rem; color: #333; display: block; margin-bottom: 0.2rem; }
.scene-liner { font-size: 0.75rem; color: #888; margin: 0 0 0.4rem; line-height: 1.4; }
.scene-links { display: flex; gap: 0.5rem; flex-wrap: wrap; }
.link-tag { font-size: 0.65rem; padding: 0.1rem 0.4rem; border-radius: 999px; background: #f0ebe3; color: #8a6d3b; }
.link-tag.thinker { background: #e8f0f3; color: #2f6f73; }
</style>
