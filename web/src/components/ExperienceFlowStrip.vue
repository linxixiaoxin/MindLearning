<template>
  <section class="experience-flow" aria-label="当前体验位置">
    <div class="flow-inner">
      <div class="flow-title">
        <span>当前旅程</span>
        <strong>{{ activeMeta.label }}</strong>
        <small>{{ activeMeta.headline }}</small>
      </div>

      <div class="flow-thread" aria-label="主线进度">
        <button
          v-if="previousStep"
          class="thread-link"
          type="button"
          @click="$emit('navigate', previousStep.id)"
        >
          上一步 {{ previousStep.label }}
        </button>
        <span v-else class="thread-link muted">从这里开始</span>

        <div class="thread-dots" aria-hidden="true">
          <span
            v-for="(step, index) in steps"
            :key="step.id"
            class="thread-dot"
            :class="{ done: index < activeIndex, active: index === activeIndex }"
          ></span>
        </div>

        <button class="thread-link next" type="button" @click="$emit('navigate', nextStep.id)">
          下一步 {{ nextStep.label }}
        </button>
      </div>

      <div class="flow-current">
        <div>
          <span>输入</span>
          <strong>{{ activeMeta.input }}</strong>
        </div>
        <div>
          <span>产出</span>
          <strong>{{ activeMeta.output }}</strong>
        </div>
        <button class="next-step-btn" type="button" @click="$emit('navigate', activeMeta.nextId)">
          {{ activeMeta.nextAction }}
        </button>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  activeStep: {
    type: String,
    default: 'situation',
  },
})

defineEmits(['navigate'])

const steps = [
  {
    id: 'situation',
    label: '处境地图',
    headline: '先看清正在发生什么',
    input: '真实人生处境',
    output: '可拆解卡点',
    nextId: 'stuck',
    nextAction: '拆成卡点',
  },
  {
    id: 'stuck',
    label: '卡点工作台',
    headline: '把卡住的地方说清楚',
    input: '一句我卡住了',
    output: '问题卡与支撑材料',
    nextId: 'partner',
    nextAction: '找思想伙伴',
  },
  {
    id: 'partner',
    label: '思想伙伴',
    headline: '给当前处境安排思考分工',
    input: '当前卡点',
    output: '一组可调用视角',
    nextId: 'route',
    nextAction: '进入练习路线',
  },
  {
    id: 'route',
    label: '练习路线',
    headline: '从理解走到输出',
    input: '要解决的卡点',
    output: '6 层路线与作品任务',
    nextId: 'atlas',
    nextAction: '打开书籍地图',
  },
  {
    id: 'atlas',
    label: '书籍地图',
    headline: '把书放回主题世界',
    input: '路线与支撑书',
    output: '书本、主题与问题连接',
    nextId: 'situation',
    nextAction: '回到处境地图',
  },
]

const activeIndex = computed(() => {
  const index = steps.findIndex((step) => step.id === props.activeStep)
  return index >= 0 ? index : 0
})
const activeMeta = computed(() => steps[activeIndex.value])
const previousStep = computed(() => steps[activeIndex.value - 1] || null)
const nextStep = computed(() => steps.find((step) => step.id === activeMeta.value.nextId) || steps[0])
</script>

<style scoped>
.experience-flow {
  flex: 0 0 auto;
  padding: 8px 18px;
  border-bottom: 1px solid rgba(205, 195, 179, 0.72);
  background: rgba(250, 249, 245, 0.96);
}

.flow-inner {
  display: grid;
  grid-template-columns: minmax(150px, 0.66fr) minmax(280px, 1fr) minmax(330px, 1.08fr);
  align-items: center;
  gap: 16px;
}

.flow-title {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.flow-title span,
.flow-current span {
  color: #8b9aa3;
  font-size: 10px;
  line-height: 1.2;
}

.flow-title strong {
  margin-top: 2px;
  color: #162737;
  font-family: var(--font-serif);
  font-size: 17px;
  line-height: 1.12;
  white-space: nowrap;
}

.flow-title small {
  margin-top: 2px;
  overflow: hidden;
  color: #5c6b76;
  font-size: 11px;
  line-height: 1.2;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.flow-thread {
  display: grid;
  grid-template-columns: auto minmax(84px, 1fr) auto;
  align-items: center;
  gap: 10px;
  min-width: 0;
}

.thread-link {
  border: none;
  background: transparent;
  color: #5c6b76;
  padding: 4px 0;
  font-size: 12px;
  white-space: nowrap;
  cursor: pointer;
}

.thread-link:hover {
  color: #204f67;
}

.thread-link.next {
  color: #204f67;
  font-weight: 700;
}

.thread-link.muted {
  color: #8b9aa3;
  cursor: default;
}

.thread-dots {
  position: relative;
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  align-items: center;
  min-width: 0;
}

.thread-dots::before {
  position: absolute;
  left: 8px;
  right: 8px;
  height: 1px;
  background: rgba(126, 142, 151, 0.28);
  content: '';
}

.thread-dot {
  position: relative;
  justify-self: center;
  width: 8px;
  height: 8px;
  border-radius: 999px;
  background: #c9d1d5;
}

.thread-dot.done {
  background: #7fa0ad;
}

.thread-dot.active {
  width: 18px;
  height: 18px;
  border: 4px solid #dce7eb;
  background: #204f67;
  box-shadow: 0 0 0 1px rgba(32, 79, 103, 0.22);
}

.flow-current {
  display: grid;
  grid-template-columns: 1fr 1fr auto;
  align-items: center;
  gap: 10px;
  min-width: 0;
}

.flow-current div {
  min-width: 0;
}

.flow-current strong {
  display: block;
  overflow: hidden;
  color: #162737;
  font-size: 12px;
  line-height: 1.3;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.next-step-btn {
  border: 1px solid rgba(32, 79, 103, 0.18);
  border-radius: 999px;
  background: #fff;
  color: #204f67;
  padding: 7px 12px;
  font-size: 12px;
  font-weight: 700;
  white-space: nowrap;
  cursor: pointer;
  transition: background 0.18s ease, color 0.18s ease;
}

.next-step-btn:hover {
  background: #204f67;
  color: #fff;
}

@media (max-width: 1180px) {
  .flow-inner {
    grid-template-columns: minmax(130px, 0.6fr) minmax(260px, 1fr);
  }

  .flow-current {
    display: none;
  }
}

@media (max-width: 720px) {
  .experience-flow {
    padding: 7px 12px;
  }

  .flow-inner {
    grid-template-columns: minmax(0, 1fr);
    gap: 6px;
  }

  .flow-title {
    display: none;
  }

  .flow-thread {
    grid-template-columns: auto minmax(76px, 1fr) auto;
  }

  .thread-link {
    font-size: 11px;
  }
}
</style>
