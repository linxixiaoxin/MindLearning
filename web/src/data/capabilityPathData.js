export const defaultCapabilityRoleId = 'pm'

export const capabilityEntryProfiles = [
  {
    id: 'pm',
    role: '产品经理',
    scene: '从需求到交付',
    mission: '把问题从“主观感觉”转成可执行的问题定义、优先级和验收。',
    outcomes: [
      '能从真实困惑抽取一个可验证的问题',
      '能设计一次不压迫的对齐会',
      '能把学习输入转成行动输出',
    ],
    abilities: [
      {
        id: 'pm-problem-definition',
        name: '问题定义',
        pain: '问题描述散乱，目标反复改',
        mapHint: '把问题拆成用户、场景、约束、验证。',
        stage: 'notes-to-writing',
      },
      {
        id: 'pm-priority-judgment',
        name: '优先级判断',
        pain: '所有项都重要，但资源有限',
        mapHint: '先画出影响面、成本与风险关系。',
        stage: 'team-truth-silence',
      },
      {
        id: 'pm-stakeholder-dialog',
        name: '沟通对齐',
        pain: '会里沉默，执行端偏离',
        mapHint: '先做真话入口，再做决议闭环。',
        stage: 'team-truth-silence',
      },
    ],
    starterTask: '今天只做一个“问题地图”，每个节点对应一个验证假设。',
  },
  {
    id: 'communication',
    role: '表达沟通',
    scene: '从阻塞表达到清晰对话',
    mission: '从“我想法正确”转成“对方能听懂并行动”。',
    outcomes: [
      '能把被迫、委屈、焦虑转成具体表达',
      '能发出不升级关系的边界请求',
      '能从冲突里抽取下一步',
    ],
    abilities: [
      {
        id: 'comm-reframe',
        name: '重命名表达',
        pain: '总是先说观点再讲事实',
        mapHint: '先写观察，再写需要，再写请求。',
        stage: 'facts-before-argument',
      },
      {
        id: 'comm-boundary',
        name: '边界声明',
        pain: '害怕说重了，关系变差',
        mapHint: '把界限设成行为标准，不设定人格标签。',
        stage: 'needs-become-blame',
      },
      {
        id: 'comm-content-production',
        name: '内容输出',
        pain: '想法有了但不敢发出来',
        mapHint: '先输出 3 句话：观察-问题-行动。',
        stage: 'notes-to-writing',
      },
    ],
    starterTask: '先把一段想说的话，改成“观察-感受-需要-请求”四句式。',
  },
  {
    id: 'self-growth',
    role: '自我探索',
    scene: '从模糊状态到可行动',
    mission: '用书和问题地图让“我状态不好”变成可观察、可改变的结构。',
    outcomes: [
      '能命名至少三种状态触发源',
      '能把需求和恐惧分开看',
      '能写出一个低摩擦修复动作',
    ],
    abilities: [
      {
        id: 'growth-meaning',
        name: '意义重组',
        pain: '一直解释但没方向',
        mapHint: '先回答这件事真正在回答什么问题。',
        stage: 'needs-become-blame',
      },
      {
        id: 'growth-emotion',
        name: '情绪命名',
        pain: '情绪强但不稳定',
        mapHint: '先从恐惧/焦虑/委屈命名，再接行动。',
        stage: 'team-truth-silence',
      },
      {
        id: 'growth-decision',
        name: '决策韧性',
        pain: '一拖再拖',
        mapHint: '给每个选择加上反事实和最小代价。',
        stage: 'intuition-too-simple',
      },
    ],
    starterTask: '今天只写“这周我想改变的一个行为”和“能承受的反作用”。',
  },
]

export const capabilityPathIndex = capabilityEntryProfiles.reduce((acc, roleProfile) => {
  acc[roleProfile.id] = roleProfile
  return acc
}, {})

export function resolveCapabilityRole(roleId) {
  return capabilityPathIndex[roleId] || capabilityEntryProfiles[0]
}
