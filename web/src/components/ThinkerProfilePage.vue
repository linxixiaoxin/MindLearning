<template>
  <div class="profile-wrap">
    <main class="profile-shell">
      <button class="back-btn" @click="$emit('back')">返回思想伙伴</button>

      <section v-if="thinker" class="profile-hero">
        <div>
          <div class="profile-kicker">THOUGHT PARTNER</div>
          <h1>{{ thinker.name }}</h1>
          <p>{{ thinker.description }}</p>
          <p class="profile-note">这是这个思想伙伴的长期方法主页，不绑定某一个具体困境；结果卡只是一次调用。</p>
        </div>
        <div class="profile-badge">
          <span>适合轴线</span>
          <strong>{{ axisLabels.join(' / ') }}</strong>
        </div>
      </section>

      <section v-if="thinker" class="profile-grid">
        <article class="profile-panel main-panel">
          <div class="panel-label">系统方法论</div>
          <p>{{ thinker.thinkingLogic }}</p>
        </article>

        <article class="profile-panel">
          <div class="panel-label">适用问题域</div>
          <p>{{ thinker.useFor }}</p>
        </article>

        <article class="profile-panel">
          <div class="panel-label">典型提问方式</div>
          <p class="question">{{ thinker.starterQuestion }}</p>
        </article>

        <article class="profile-panel">
          <div class="panel-label">核心概念</div>
          <div class="concept-list">
            <span v-for="concept in thinker.concepts" :key="concept">{{ concept }}</span>
          </div>
        </article>

        <article class="profile-panel graph-panel">
          <div class="panel-label">人物知识图谱雏形</div>
          <div class="concept-map">
            <div class="concept-center">{{ thinker.name }}</div>
            <div
              v-for="(concept, index) in thinker.concepts"
              :key="concept"
              class="concept-node"
              :style="conceptNodeStyle(index)"
            >
              {{ concept }}
            </div>
          </div>
          <p class="future-note">后续这里会升级为人物知识图谱，连接概念、书籍、场景和方法卡。</p>
        </article>

        <article class="profile-panel library-panel">
          <div class="panel-label">概念 / 方法 / 场景库</div>
          <p class="library-intro">这里会优先承接本地书籍和 K/N 卡，不是百科介绍；它回答的是“这个人具体能借给我哪些思考工具”。</p>

          <div v-if="libraryGroups.length" class="library-groups">
            <section v-for="group in libraryGroups" :key="group.type" class="library-group">
              <h2>{{ group.type }}</h2>
              <div class="library-list">
                <article v-for="item in group.items" :key="`${group.type}-${item.title}`" class="library-item">
                  <h3>{{ item.title }}</h3>
                  <p>{{ item.description }}</p>
                  <span>{{ item.source }}</span>
                  <button
                    v-if="item.slug && item.nodeId"
                    class="library-open-btn"
                    @click="$emit('open-node', { slug: item.slug, nodeId: item.nodeId })"
                  >
                    打开卡片
                  </button>
                </article>
              </div>
            </section>
          </div>

          <div v-else class="library-empty">
            待从本地书籍、K 卡和 N 卡接入。这个入口先保留，后续可像书库一样扩成概念图谱。
          </div>
        </article>

        <article class="profile-panel">
          <div class="panel-label">适合的位置</div>
          <div class="concept-list">
            <span v-for="role in roleLabels" :key="role">{{ role }}</span>
          </div>
        </article>

        <article class="profile-panel">
          <div class="panel-label">使用提醒</div>
          <p>{{ thinker.risk }}</p>
        </article>
      </section>

      <section v-else class="empty-state">
        <h1>这个思想伙伴还没准备好</h1>
        <p>可能是链接里的伙伴 ID 还没有配置。</p>
        <button class="back-btn" @click="$emit('back')">返回思想伙伴</button>
      </section>
    </main>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { axes, roles, thinkers } from '../data/thoughtPartnerData.js'

const props = defineProps({
  thinkerId: {
    type: String,
    required: true,
  },
})

defineEmits(['back', 'open-node'])

const thinker = computed(() => thinkers[props.thinkerId])
const axisLabels = computed(() => (thinker.value?.axis || []).map((id) => axes[id]?.label || id))
const roleLabels = computed(() => (thinker.value?.roleFit || []).map((id) => roles.find((role) => role.id === id)?.label || id))
const libraryGroups = computed(() => {
  const items = thinker.value?.conceptLibrary || []
  const order = ['概念', '方法', '场景', '母题', '来源']
  return order
    .map((type) => ({
      type,
      items: items.filter((item) => item.type === type),
    }))
    .filter((group) => group.items.length)
})

function conceptNodeStyle(index) {
  const positions = [
    { x: 50, y: 12 },
    { x: 78, y: 46 },
    { x: 64, y: 82 },
    { x: 26, y: 78 },
    { x: 18, y: 36 },
  ]
  const position = positions[index % positions.length]
  return {
    left: `${position.x}%`,
    top: `${position.y}%`,
  }
}
</script>

<style scoped>
.profile-wrap {
  height: 100%;
  overflow-y: auto;
}

.profile-shell {
  max-width: 1040px;
  margin: 0 auto;
  padding: 30px 20px 78px;
}

.back-btn {
  border: 1px solid var(--border-default);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.76);
  color: var(--text-secondary);
  padding: 8px 13px;
  font-size: 12px;
  cursor: pointer;
}

.profile-hero {
  margin-top: 16px;
  display: grid;
  grid-template-columns: minmax(0, 1fr) 220px;
  gap: 16px;
  align-items: stretch;
}

.profile-hero > div,
.profile-badge,
.profile-panel,
.empty-state {
  border: 1px solid var(--border-default);
  background: rgba(247, 245, 240, 0.92);
  box-shadow: var(--shadow-sm);
}

.profile-hero > div {
  border-radius: 24px;
  padding: 28px;
}

.profile-kicker,
.panel-label {
  color: var(--text-muted);
  font-size: 10px;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

.profile-hero h1 {
  margin-top: 10px;
  font-family: var(--font-serif);
  color: var(--text-primary);
  font-size: 44px;
  line-height: 1.08;
}

.profile-hero p,
.profile-panel p,
.empty-state p {
  margin-top: 12px;
  color: var(--text-secondary);
  line-height: 1.8;
}

.profile-hero .profile-note {
  margin-top: 10px;
  color: var(--text-tertiary);
  font-size: 13px;
}

.profile-badge {
  border-radius: 24px;
  padding: 22px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.profile-badge span {
  color: var(--text-muted);
  font-size: 12px;
}

.profile-badge strong {
  margin-top: 8px;
  color: var(--brand);
  font-family: var(--font-serif);
  font-size: 24px;
  line-height: 1.25;
}

.profile-grid {
  margin-top: 16px;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

.profile-panel {
  border-radius: 18px;
  padding: 20px;
}

.main-panel {
  grid-column: 1 / -1;
}

.question {
  color: var(--brand);
  font-family: var(--font-serif);
  font-size: 20px;
}

.concept-list {
  margin-top: 12px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.concept-list span {
  border-radius: 999px;
  background: rgba(32, 79, 103, 0.08);
  color: var(--brand);
  padding: 6px 10px;
  font-size: 12px;
}

.graph-panel {
  grid-column: 1 / -1;
}

.library-panel {
  grid-column: 1 / -1;
}

.library-intro {
  max-width: 720px;
}

.library-groups {
  margin-top: 16px;
  display: grid;
  gap: 16px;
}

.library-group h2 {
  margin: 0 0 10px;
  color: var(--brand);
  font-family: var(--font-serif);
  font-size: 20px;
}

.library-list {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.library-item {
  border: 1px solid rgba(32, 79, 103, 0.1);
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.6);
  padding: 14px;
}

.library-item h3 {
  margin: 0;
  color: var(--text-primary);
  font-size: 16px;
}

.library-item p {
  margin-top: 8px;
  font-size: 14px;
  line-height: 1.72;
}

.library-item span {
  display: block;
  margin-top: 10px;
  color: var(--text-muted);
  font-size: 12px;
}

.library-open-btn {
  margin-top: 12px;
  border: 1px solid rgba(32, 79, 103, 0.18);
  border-radius: 999px;
  background: rgba(32, 79, 103, 0.07);
  color: var(--brand);
  padding: 7px 12px;
  font-size: 12px;
  cursor: pointer;
}

.library-open-btn:hover {
  background: rgba(32, 79, 103, 0.12);
}

.library-empty {
  margin-top: 14px;
  border-radius: 14px;
  background: rgba(32, 79, 103, 0.06);
  color: var(--text-secondary);
  padding: 14px;
  line-height: 1.7;
}

.concept-map {
  position: relative;
  margin-top: 14px;
  height: 280px;
  border: 1px solid rgba(32, 79, 103, 0.13);
  border-radius: 18px;
  background:
    radial-gradient(circle at center, rgba(32, 79, 103, 0.08), transparent 48%),
    rgba(255, 255, 255, 0.62);
}

.concept-center,
.concept-node {
  position: absolute;
  transform: translate(-50%, -50%);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.concept-center {
  left: 50%;
  top: 50%;
  width: 132px;
  height: 132px;
  border-radius: 999px;
  border: 1px solid rgba(32, 79, 103, 0.28);
  background: rgba(251, 250, 246, 0.95);
  color: var(--brand);
  font-family: var(--font-serif);
  font-size: 20px;
  padding: 14px;
}

.concept-node {
  min-width: 96px;
  min-height: 42px;
  border-radius: 999px;
  border: 1px solid rgba(191, 111, 63, 0.28);
  background: rgba(255, 255, 255, 0.82);
  color: var(--accent);
  font-size: 12px;
  padding: 8px 12px;
}

.future-note {
  color: var(--text-tertiary);
  font-size: 12px;
}

.empty-state {
  margin-top: 18px;
  border-radius: 24px;
  padding: 28px;
}

.empty-state h1 {
  color: var(--text-primary);
  font-family: var(--font-serif);
}

@media (max-width: 760px) {
  .profile-shell {
    padding: 20px 14px 60px;
  }

  .profile-hero,
  .profile-grid {
    grid-template-columns: 1fr;
  }

  .library-list {
    grid-template-columns: 1fr;
  }

  .profile-hero h1 {
    font-size: 34px;
  }
}
</style>
