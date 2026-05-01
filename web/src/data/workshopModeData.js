export const defaultWorkshopModeId = 'torch-coach'

export const workshopModes = [
  {
    id: 'torch-coach',
    label: '火把教练',
    shortLabel: '火把',
    phaseLabel: '当下照明',
    goal: '照亮当前站位，降噪，并给出一个 24 小时内能做的小动作。',
    bestFor: '已经被资料、建议和自责淹没，需要先启动而不是继续分析。',
    steps: [
      '你现在真正站在哪里？',
      '此刻最值得聚焦的一个问题是什么？',
      '哪些建议今天先不用听？',
      '24 小时内可以完成的最小动作是什么？',
    ],
    outputLabels: {
      currentPosition: '当前位置',
      focusQuestion: '火把问题',
      noiseToIgnore: '今天先不做',
      minimumAction: '最小行动',
    },
  },
  {
    id: 'coach',
    label: '教练技术',
    shortLabel: '教练',
    phaseLabel: '深度追问',
    goal: '通过目标、现实、选择和承诺，把模糊愿望推进到可执行动作。',
    bestFor: '知道自己想变好，但卡在不开始、不持续或说不清真正目标。',
    steps: [
      '如果这个问题变好 20%，你会看到什么变化？',
      '现在真实卡住你的是什么？',
      '你已经尝试过什么？为什么没有持续？',
      '接下来 24 小时，你愿意承诺哪个动作？',
    ],
    outputLabels: {
      desiredChange: '想看到的变化',
      realBlock: '真实阻力',
      availableChoice: '可选路径',
      commitment: '承诺动作',
    },
  },
  {
    id: 'private-board',
    label: '私董会',
    shortLabel: '私董会',
    phaseLabel: '真实问题诊断',
    goal: '把案主陈述拆成事实、假设、张力和备选路径。',
    bestFor: '涉及真实决策、角色关系和资源取舍的问题。',
    steps: [
      '先把事实和解释拆开。',
      '找出真正的两难张力。',
      '让不同顾问提出追问，而不是直接给建议。',
      '收敛出 2-3 条可验证路径。',
    ],
    outputLabels: {
      caseRestatement: '案主问题重述',
      keyTension: '核心张力',
      blindSpot: '可能盲区',
      experiment: '一周实验',
    },
  },
  {
    id: 'world-cafe',
    label: '世界咖啡',
    shortLabel: '多桌',
    phaseLabel: '多视角发散',
    goal: '把一个开放问题分成多张主题桌，提取共同母题和下一步问题。',
    bestFor: '还没有唯一答案，需要先从个体、关系、系统、文化和行动多面看。',
    steps: [
      '个体心理桌：人在害怕或期待什么？',
      '关系互动桌：谁和谁的关系被卡住了？',
      '组织 / 文化桌：什么规则正在塑造行为？',
      '行动实验桌：如果只试一个小实验，从哪里开始？',
    ],
    outputLabels: {
      tableOne: '个体心理桌',
      tableTwo: '关系互动桌',
      tableThree: '系统文化桌',
      synthesis: '共同母题',
    },
  },
]

export function resolveWorkshopMode(modeId) {
  return workshopModes.find((mode) => mode.id === modeId) || workshopModes[0]
}
