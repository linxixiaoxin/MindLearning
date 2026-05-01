export const contentOpsPipeline = [
  {
    id: 'scene',
    label: '真实场景',
    description: '先接住一句真实生活里的卡点，而不是先想标题。',
  },
  {
    id: 'emotion',
    label: '情绪信号',
    description: '把恐惧、愤怒、委屈、焦虑看成入口，不当成结论。',
  },
  {
    id: 'mechanism',
    label: '机制命名',
    description: '翻译成需要、边界、权力、意义建构和关系结构。',
  },
  {
    id: 'evidence',
    label: '书籍证据',
    description: '绑定主书、概念卡和可引用的公开 K/N 节点。',
  },
  {
    id: 'topic',
    label: '选题草案',
    description: '沉淀成小红书、公众号、网站专题或活动主题。',
  },
  {
    id: 'task',
    label: '任务推进',
    description: '看见每个选题处在构思、写作、发布还是复盘。',
  },
]

export const topicStatuses = [
  { id: 'inbox', label: '素材池', tone: 'neutral' },
  { id: 'framing', label: '命名中', tone: 'blue' },
  { id: 'drafting', label: '写作中', tone: 'amber' },
  { id: 'ready', label: '待发布', tone: 'green' },
  { id: 'review', label: '复盘中', tone: 'purple' },
]

export const emotionContentCoordinates = [
  {
    id: 'fear',
    label: '恐惧',
    coreNeed: '安全感、可控感、被允许试错',
    lead: '恐惧不一定说明一个人胆小，它常常说明某个结果太重要，或者某段关系的后果不可预测。',
    scenes: ['向上沟通', '汇报前', '关系冲突后开口', '公开表达', '重大选择'],
    mechanisms: ['评价恐惧', '权力差', '低风险表达', '安全感前提'],
    topicAngles: [
      '你不是不会表达，只是太害怕被误解',
      '为什么越重要的话越难说出口',
      '汇报前紧张，可能不是能力问题，而是安全感问题',
    ],
    expressionTemplate: '这件事对我有点重要，我想先确认一下我们讨论的边界。',
    evidenceBooks: [
      { title: '关键对话', slug: 'key-conversations', role: '安全感机制' },
      { title: '非暴力沟通', slug: 'nonviolent-communication', role: '低风险表达' },
      { title: '复杂心智', slug: 'complex-mind', role: '价值感与防御' },
    ],
  },
  {
    id: 'anger',
    label: '愤怒',
    coreNeed: '边界、公平、尊重、责任清晰',
    lead: '愤怒常常不是脾气差，而是某个边界被踩、某个责任被默认、某个价值被轻视。',
    scenes: ['被甩锅', '被冒犯', '家人越界', '团队隐形劳动', '亲密关系争执'],
    mechanisms: ['边界被踩', '责任默认', '请求被包装成审判', '系统性不公平'],
    topicAngles: [
      '你突然很生气，可能是在保护一个边界',
      '别把“你怎么这样”当成真实需要',
      '为什么越想讲道理，关系越容易升级',
    ],
    expressionTemplate: '我在意的不是这一件事本身，而是这个安排让我感觉我的边界没有被看见。',
    evidenceBooks: [
      { title: '非暴力沟通', slug: 'nonviolent-communication', role: '指责转请求' },
      { title: '系统之美', slug: 'thinking-in-systems', role: '责任回路' },
      { title: '关键对话', slug: 'key-conversations', role: '高风险对话' },
    ],
  },
  {
    id: 'grievance',
    label: '委屈',
    coreNeed: '被看见、被理解、被回应、贡献被承认',
    lead: '委屈不是单纯伤心，而是“我付出了、忍了、期待了，但没有被对方看见”。',
    scenes: ['伴侣没有回应', '朋友忽略感受', '家人默认付出', '团队贡献不可见'],
    mechanisms: ['隐形期待', '被看见需要', '单方维持关系', '贡献承认'],
    topicAngles: [
      '有些委屈不是矫情，是需要没有被看见',
      '别把“需要被理解”说成“你总是不懂我”',
      '关系里最累的不是付出，是付出不被命名',
    ],
    expressionTemplate: '我真正难受的是，我很希望这件事里我的感受也能被你看见。',
    evidenceBooks: [
      { title: '爱情笔记', slug: 'love-notes', role: '亲密关系观察' },
      { title: '非暴力沟通', slug: 'nonviolent-communication', role: '需要翻译' },
      { title: '高难度谈话', slug: 'difficult-conversations', role: '故事层拆分' },
    ],
  },
  {
    id: 'anxiety',
    label: '焦虑',
    coreNeed: '确定性、优先级、可行动路径',
    lead: '焦虑往往来自“重要但不清楚、想控制但控制不了、要行动但不知道从哪里开始”。',
    scenes: ['内容方向', '职业选择', '项目推进', '信息过载', 'AI 工具焦虑'],
    mechanisms: ['目标被遮住', '变量过多', '优先级漂移', '最小行动缺失'],
    topicAngles: [
      '你不是没方向，是目标被焦虑遮住了',
      '请避免陷入工具和方法论焦虑',
      '当信息越看越多，先别找答案，先找下一步',
    ],
    expressionTemplate: '我现在最需要的不是更多信息，而是先确定下一步最小动作。',
    evidenceBooks: [
      { title: '好好思考', slug: 'good-thinking', role: '问题意识' },
      { title: '系统之美', slug: 'thinking-in-systems', role: '变量关系' },
      { title: '笔记的方法', slug: 'note-method', role: '输入到输出' },
    ],
  },
  {
    id: 'low-energy',
    label: '低落',
    coreNeed: '恢复、减负、被允许暂停',
    lead: '低落不一定是消极，它可能是系统能量不足后的保护性降速。',
    scenes: ['长期消耗', '连续输出', '项目停滞', '计划失败', '关系失望'],
    mechanisms: ['系统超载', '低能量行动', '恢复优先', '降低要求'],
    topicAngles: [
      '低落不是没用，只是系统超载',
      '请允许自己先停一会儿',
      '行动力低的时候，不要再给自己加一套方法论',
    ],
    expressionTemplate: '我现在不是不想负责，而是能量太低，需要先把要求降到我能承受的程度。',
    evidenceBooks: [
      { title: '复杂心智', slug: 'complex-mind', role: '自我保护' },
      { title: '伯恩斯新情绪疗法', slug: 'burns-new-mood-therapy', role: '情绪修复' },
      { title: '高绩效教练', slug: 'performance-coaching', role: '最小行动' },
    ],
  },
  {
    id: 'confusion',
    label: '迷茫',
    coreNeed: '身份确认、方向感、意义线索',
    lead: '迷茫常常不是没有选择，而是选择太多、评价太多，自己的长期主线还没有显形。',
    scenes: ['换工作', '内容定位', '人生阶段变化', '读书路线', '关系去留'],
    mechanisms: ['身份叙事', '意义建构', '选择过载', '长期主线'],
    topicAngles: [
      '迷茫不是没有答案，而是还没有看见自己的主线',
      '读很多书还是不知道怎么选，可能是问题没有被命名',
      '方向感不是想出来的，是从反复出现的问题里长出来的',
    ],
    expressionTemplate: '我现在不是要马上决定，而是想先看清这几个选择分别在回答什么问题。',
    evidenceBooks: [
      { title: '人生模式', slug: 'life-patterns', role: '核心模式识别' },
      { title: '好好思考', slug: 'good-thinking', role: '问题命名' },
      { title: '笔记的方法', slug: 'note-method', role: '素材沉淀' },
    ],
  },
]

export const contentTopicItems = [
  {
    id: 'mature-expression-not-script',
    title: '成熟表达不是话术，是先看见自己在保护什么',
    emotionId: 'fear',
    scene: '向上沟通 / 关系冲突',
    platform: '小红书 + 公众号',
    priority: 'P0',
    status: 'drafting',
    owner: 'Codex + 人工精修',
    due: '本周',
    linkedCaseId: 'facts-before-argument',
    linkedPathId: 'facts-before-argument',
    contentForm: '选题主轴',
    taskNotes: ['补 3 个真实开口场景', '绑定《非暴力沟通》公开 K/N 卡', '拆成 3 张图文卡'],
  },
  {
    id: 'anger-boundary',
    title: '你突然很生气，可能是在保护一个边界',
    emotionId: 'anger',
    scene: '伴侣 / 家庭 / 团队',
    platform: '小红书',
    priority: 'P0',
    status: 'framing',
    owner: '待扩写',
    due: '本周',
    linkedCaseId: 'needs-become-blame',
    linkedPathId: 'facts-before-argument',
    contentForm: '场景短文',
    taskNotes: ['先写边界被踩的 5 个场景', '避免把愤怒写成情绪宣泄', '加一张指责转请求卡'],
  },
  {
    id: 'team-silence',
    title: '团队没人说真话，通常不是大家没想法',
    emotionId: 'fear',
    scene: '团队协作',
    platform: '网站专题 + 公众号',
    priority: 'P1',
    status: 'ready',
    owner: '已成样张',
    due: '待排期',
    linkedCaseId: 'team-truth-silence',
    linkedPathId: 'team-truth-silence',
    contentForm: '问题案例',
    taskNotes: ['可作为网站问题工作台样张', '后续补会议模板和复盘卡', '连接能力路径：产品经理 / 项目经理'],
  },
  {
    id: 'anxiety-next-step',
    title: '你不是没方向，是目标被焦虑遮住了',
    emotionId: 'anxiety',
    scene: '内容定位 / 项目推进',
    platform: '小红书',
    priority: 'P1',
    status: 'inbox',
    owner: '素材池',
    due: '下周',
    linkedCaseId: 'notes-to-writing',
    linkedPathId: 'notes-to-writing',
    contentForm: '方法卡',
    taskNotes: ['先从 0430 灵感里抽 5 个焦虑场景', '连接笔记到输出路径', '沉淀“不要继续收藏资料”火把卡'],
  },
  {
    id: 'low-energy-action',
    title: '低落不是没用，只是系统超载',
    emotionId: 'low-energy',
    scene: '长期消耗 / 输出停滞',
    platform: '小红书',
    priority: 'P2',
    status: 'inbox',
    owner: '待验证',
    due: '观察',
    linkedCaseId: 'notes-to-writing',
    linkedPathId: 'notes-to-writing',
    contentForm: '安放型内容',
    taskNotes: ['保持边界，不做心理诊断', '只给低风险行动', '适合做温和长尾主题'],
  },
  {
    id: 'confusion-mainline',
    title: '迷茫不是没有答案，而是主线还没有显形',
    emotionId: 'confusion',
    scene: '内容定位 / 人生阶段',
    platform: '公众号 + 网站',
    priority: 'P1',
    status: 'review',
    owner: '需要复盘',
    due: '本月',
    linkedCaseId: 'notes-to-writing',
    linkedPathId: 'notes-to-writing',
    contentForm: '长文母题',
    taskNotes: ['参考 L 先生成熟表达方式', '从问题库反向找高频母题', '适合沉淀为网站专题入口'],
  },
]

export const contentOpsTasks = [
  {
    id: 'fix-emotion-middle-layer',
    title: '把情绪入口从前台工具改成选题中台字段',
    status: 'ready',
    lane: '产品结构',
  },
  {
    id: 'bind-evidence-nodes',
    title: '为 P0 选题绑定 3-5 张公开 K/N 证据卡',
    status: 'framing',
    lane: '证据层',
  },
  {
    id: 'xhs-card-template',
    title: '沉淀“情绪 -> 需要 -> 下一句话”三图模板',
    status: 'drafting',
    lane: '内容模板',
  },
  {
    id: 'event-to-topic',
    title: '把社会事件入口输出接成可入库选题',
    status: 'inbox',
    lane: '热榜输入',
  },
  {
    id: 'ops-feedback',
    title: '补选题发布后的收藏/评论/转化复盘字段',
    status: 'inbox',
    lane: '反馈闭环',
  },
]

export function resolveEmotionCoordinate(emotionId) {
  return emotionContentCoordinates.find((item) => item.id === emotionId) || emotionContentCoordinates[0]
}

export function getTopicsForEmotion(emotionId) {
  return contentTopicItems.filter((item) => item.emotionId === emotionId)
}

export function getStatusMeta(statusId) {
  return topicStatuses.find((item) => item.id === statusId) || topicStatuses[0]
}
