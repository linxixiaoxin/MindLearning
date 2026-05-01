export const defaultEventLensPreset = 'relationship-conflict'

export const eventLensPresets = [
  {
    id: 'relationship-conflict',
    label: '关系关系冲突',
    prompt: '你被某个关系里的行为触发，想知道是立场冲突，还是表达方式冲突，还是安全感问题。',
    description: '适用于伴侣、家庭、同事、朋友之间出现“我越解释对方越防御”的情况。',
    sceneOptions: [
      '伴侣/家庭冲突',
      '同事和朋友观点偏移',
      '朋友圈争议言语对峙',
    ],
    perspectiveQuestions: [
      '第一层：这件事里每个当事人先守护了什么？',
      '第二层：谁在承担“承认对方会不舒服”的风险？',
      '第三层：如果去掉“对谁对错”的框架，会剩下什么？',
      '第四层：下一步最小试验是什么？',
    ],
    roleMap: [
      {
        role: '当事人自己',
        coreNeed: '被看见、被允许表达边界、被接纳不完美',
      },
      {
        role: '对方',
        coreNeed: '被保护、被理解、避免失面子',
      },
      {
        role: '关系系统',
        coreNeed: '降低误解放大、保留关系修复空间',
      },
    ],
    books: [
      {
        title: '非暴力沟通',
        slug: 'nonviolent-communication',
        reason: '把“评价”改为“观察-感受-需要-请求”。',
      },
      {
        title: '关键对话',
        slug: 'key-conversations',
        reason: '在高风险关系中保留安全和共享事实。',
      },
    ],
    outputScaffolds: [
      '关系事件理解卡',
      '冲突角色图',
      '一条可发送的界限句',
      '24 小时修复动作',
    ],
  },
  {
    id: 'organization-conflict',
    label: '组织/管理冲突',
    prompt: '你在团队、组织、项目里看到“没人发声/信息失真/重复推诿”。',
    description: '适用于会议、汇报、跨部门协作、项目推进中的信号扭曲。',
    sceneOptions: [
      '项目推进摩擦',
      '部门协作扯皮',
      '会议沉默与执行失真',
    ],
    perspectiveQuestions: [
      '第一层：谁承担了反馈成本，谁承担了错误成本？',
      '第二层：哪一种激励让大家选“沉默”而不是“发声”？',
      '第三层：目前信息是否有一个最小安全容器？',
      '第四层：下一次只加一条机制，先降低失真哪个节点？',
    ],
    roleMap: [
      {
        role: '决策层',
        coreNeed: '进度可控、风险可见、减少推诿',
      },
      {
        role: '执行层',
        coreNeed: '说真话后不受惩罚、得到清晰边界',
      },
      {
        role: '系统',
        coreNeed: '更早发现风险、保留复盘空间',
      },
    ],
    books: [
      {
        title: '关键对话',
        slug: 'key-conversations',
        reason: '恢复信息质量和安全感。',
      },
      {
        title: '模型思维',
        slug: 'model-thinking',
        reason: '把问题从个体偏见拉回系统关系。',
      },
    ],
    outputScaffolds: [
      '组织事件角色图',
      '观点谱系',
      '真话入口设计',
      '项目风险清单',
    ],
  },
  {
    id: 'public-opinion',
    label: '舆论议题',
    prompt: '你面对一个热点事件，却容易被情绪带跑，想先把事件结构站稳再发观点。',
    description: '适用于公共舆情、平台内容、评论区争议、观点输出之前的结构化拆解。',
    sceneOptions: [
      '社会热点追踪',
      '平台舆论争议',
      '内容选题和回应',
    ],
    perspectiveQuestions: [
      '第一层：事件背后的时间线是什么？',
      '第二层：谁在定义“伤害”与“错误”？',
      '第三层：信息框架是否被平台情绪放大？',
      '第四层：我能先说清哪个中层事实？',
    ],
    roleMap: [
      {
        role: '传播者',
        coreNeed: '保持表达准确、避免被误读',
      },
      {
        role: '受众',
        coreNeed: '可理解的叙事、可复核的事实',
      },
      {
        role: '机制',
        coreNeed: '平台传播结构对情绪和注意力的偏置',
      },
    ],
    books: [
      {
        title: '好好思考',
        slug: 'good-thinking',
        reason: '帮助区分事实、观点、价值判断。',
      },
      {
        title: '非暴力沟通',
        slug: 'nonviolent-communication',
        reason: '避免观点输出立即进入指责循环。',
      },
    ],
    outputScaffolds: [
      '争议结构图',
      '观点谱系',
      '发布前自查清单',
      '小红书脚本草稿',
    ],
  },
]

export function resolveEventLensPreset(presetId) {
  return eventLensPresets.find((item) => item.id === presetId) || eventLensPresets[0]
}

const sceneKeywordRules = [
  { scene: 'relationship-conflict', keywords: ['伴侣', '夫妻', '家庭', '闹', '吵', '关系', '对象', '家人', '朋友'] },
  { scene: 'organization-conflict', keywords: ['会议', '项目', '团队', '汇报', '对接', '协作', '管理', '老板', 'leader', '组织'] },
  { scene: 'public-opinion', keywords: ['热点', '舆论', '平台', '观点', '评论', '抖音', '微博', '小红书', '媒体'] },
]

export function inferEventScene(description = '', eventName = '') {
  const text = `${eventName} ${description}`.toLowerCase()

  for (const rule of sceneKeywordRules) {
    if (rule.keywords.some((keyword) => text.includes(keyword))) {
      return rule.scene
    }
  }

  return defaultEventLensPreset
}

export function buildEventOutput({ eventName = '', eventSummary = '', rawNeed = '', presetId = '' }) {
  const preset = resolveEventLensPreset(presetId || inferEventScene(eventName, eventSummary))

  return {
    preset,
    eventName: eventName || '未命名事件',
    eventSummary: eventSummary || '尚未补充具体描述。',
    rawNeed: rawNeed || '我想先把情绪和事实分开。',
    coreFrame: `先看“事实”再判断“观点”：${preset.prompt}`,
    tensionSummary:
      '当前情绪通常遮住真实边界、角色期待与信息缺失。先把每个角色的核心需要写清。',
    outputScaffolds: preset.outputScaffolds,
  }
}
