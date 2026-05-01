<template>
  <div class="capability-wrap">
    <section class="capability-main">
      <aside class="capability-rail">
        <div class="rail-head">
          <div class="tool-kicker">CAPABILITY WORK</div>
          <h1>职业 / 能力路径</h1>
          <p>按角色与能力先选入口，再按任务深挖可执行路径。</p>
        </div>

        <div class="entry-list">
          <button
            v-for="entry in capabilityEntryProfiles"
            :key="entry.id"
            class="entry-btn"
            :class="{ active: entry.id === selectedRole.id }"
            @click="selectRole(entry.id)"
          >
            <span>{{ entry.role }}</span>
            <small>{{ entry.scene }}</small>
          </button>
        </div>
      </aside>

      <main class="capability-body">
        <header class="role-head">
          <div>
            <div class="role-meta">{{ selectedRole.role }}</div>
            <h2>{{ selectedRole.mission }}</h2>
          </div>
          <button class="ghost-btn" @click="emitStarterAction">开始本场景任务</button>
        </header>

        <section class="outcome-grid">
          <article v-for="item in selectedRole.abilities" :key="item.id" class="ability-card">
            <div>
              <span>能力卡：{{ item.name }}</span>
              <h3>{{ item.pain }}</h3>
              <p>{{ item.mapHint }}</p>
            </div>
            <div class="ability-actions">
              <button class="mini-btn" @click="openLearningPath(item.stage)">开这条学习路径</button>
              <span class="status">已映射到 {{ stageLabel(item.stage) }}</span>
            </div>
          </article>
        </section>

        <section class="impact-panel">
          <article>
            <div class="panel-kicker">可交付结果</div>
            <ul>
              <li v-for="outcome in selectedRole.outcomes" :key="outcome">{{ outcome }}</li>
            </ul>
          </article>

          <article>
            <div class="panel-kicker">立即输出</div>
            <p>{{ selectedRole.starterTask }}</p>
          </article>

          <article>
            <div class="panel-kicker">下一步</div>
            <p>你可以从问题工作台继续把本场景映射为真实案例，再返回这里补齐路径。</p>
            <button class="feedback-btn" @click="openProblemLab">从“问题工作台”继续</button>
          </article>
        </section>
      </main>
    </section>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { learningPathSamples } from '../data/learningPathData.js'
import {
  capabilityEntryProfiles,
  defaultCapabilityRoleId,
  resolveCapabilityRole,
} from '../data/capabilityPathData.js'

const props = defineProps({
  roleId: {
    type: String,
    default: defaultCapabilityRoleId,
  },
})

const emit = defineEmits(['openBook', 'openProblemLab', 'openLearningPath'])

const selectedRoleId = ref(props.roleId)
const selectedRole = computed(() => resolveCapabilityRole(selectedRoleId.value))

const roleMap = Object.fromEntries(capabilityEntryProfiles.map((role) => [role.id, role]))
const pathMap = Object.fromEntries(learningPathSamples.map((path) => [path.id, path]))

function selectRole(roleId) {
  selectedRoleId.value = roleId
}

function openLearningPath(pathId) {
  if (!pathId) return
  emit('openLearningPath', pathId)
}

function openProblemLab() {
  emit('openProblemLab')
}

function stageLabel(pathId) {
  return pathMap[pathId]?.shortTitle || pathId
}

function emitStarterAction() {
  const firstPathId = selectedRole.value?.abilities?.[0]?.stage
  if (firstPathId) {
    emit('openLearningPath', firstPathId)
  }
}

watch(
  () => props.roleId,
  (nextRoleId) => {
    selectedRoleId.value = nextRoleId || defaultCapabilityRoleId
  },
)
</script>

<style scoped>
.capability-wrap {
  height: 100%;
  min-height: 0;
  overflow: hidden;
  background:
    linear-gradient(135deg, rgba(255, 255, 255, 0.75), rgba(236, 242, 243, 0.7)),
    radial-gradient(circle at 8% 10%, rgba(191, 111, 63, 0.12), transparent 35%),
    radial-gradient(circle at 88% 16%, rgba(32, 79, 103, 0.14), transparent 34%);
}

.capability-main {
  max-width: 1300px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 280px minmax(0, 1fr);
  gap: 14px;
  padding: 22px;
  min-height: 0;
}

.capability-rail,
.role-head,
.ability-card,
.impact-panel article {
  border: 1px solid var(--border-default);
  border-radius: var(--radius-card);
  background: rgba(255, 255, 255, 0.86);
  box-shadow: var(--shadow-sm);
}

.rail-head,
.role-head {
  padding: 16px;
}

.rail-head h1,
.role-head h2 {
  margin-top: 8px;
  font-family: var(--font-serif);
}

.rail-head h1 {
  font-size: 30px;
}

.rail-head p,
.role-head p,
.ability-card p,
.impact-panel p {
  margin-top: 8px;
  color: var(--text-secondary);
  line-height: 1.7;
}

.entry-list {
  margin-top: 10px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.entry-btn {
  padding: 10px 12px;
  border: 1px solid var(--border-default);
  border-radius: var(--radius-card);
  text-align: left;
  background: rgba(255, 255, 255, 0.86);
  color: var(--text-secondary);
}

.entry-btn small {
  display: block;
  margin-top: 4px;
  color: var(--text-tertiary);
  font-size: 12px;
}

.entry-btn.active {
  border-color: rgba(32, 79, 103, 0.32);
  background: var(--brand-soft);
  color: var(--text-primary);
}

.capability-body {
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-width: 0;
}

.role-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.role-meta {
  font-size: 12px;
  color: var(--text-muted);
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.role-head h2 {
  color: var(--text-primary);
  margin-top: 6px;
}

.outcome-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
}

.ability-card {
  padding: 14px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 0;
  gap: 12px;
}

.ability-card span {
  font-size: 11px;
  color: var(--text-muted);
  letter-spacing: 0.07em;
  text-transform: uppercase;
}

.ability-card h3 {
  margin-top: 7px;
  color: var(--text-primary);
}

.ability-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
}

.ability-actions .status {
  color: var(--text-tertiary);
  font-size: 12px;
}

.impact-panel {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
}

.impact-panel article {
  padding: 14px;
}

.impact-panel ul {
  margin-top: 10px;
  padding-left: 18px;
  color: var(--text-secondary);
}

.panel-kicker,
.role-head .panel-kicker {
  font-size: 11px;
  color: var(--text-muted);
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.mini-btn,
.feedback-btn,
.ghost-btn {
  border: 1px solid var(--border-default);
  border-radius: var(--radius-pill);
  background: var(--bg-elevated);
  color: var(--text-secondary);
  cursor: pointer;
}

.ghost-btn,
.feedback-btn {
  padding: 8px 12px;
  font-size: 12px;
}

.mini-btn {
  padding: 6px 10px;
  font-size: 12px;
}

@media (max-width: 1120px) {
  .capability-main {
    grid-template-columns: 1fr;
  }

  .outcome-grid,
  .impact-panel {
    grid-template-columns: 1fr;
  }

  .role-head {
    flex-direction: column;
    gap: 10px;
  }
}
</style>
