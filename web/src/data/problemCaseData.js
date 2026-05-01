import { defaultWorkshopModeId } from './workshopModeData.js'

export const defaultProblemCaseId = 'notes-to-writing'

export const problemCases = [
  {
    id: 'notes-to-writing',
    phaseLabel: 'Problem Case Seed',
    shortTitle: '笔记到输出',
    title: '为什么记了很多笔记，还是写不出来',
    entranceType: 'question-card',
    problemNaming: '这不是单纯自律问题，而是笔记还没有形成能承受表达压力的结构。',
    currentSituation: '输入很多，收藏很多，但每次想写东西时，材料像散沙一样堆在一起。',
    sceneTags: ['学习笔记', '内容输出', 'AI 知识系统'],
    emotionTags: ['迷茫', '焦虑', '卡住'],
    needTags: ['结构感', '输出压力', '最小启动'],
    coreQuestion: '这批笔记共同回答了哪个问题，它们之间是什么关系，最后要产出什么？',
    learningPathId: 'notes-to-writing',
    recommendedThinkers: [
      {
        name: '罗伯特·弗里茨',
        role: '结构诊断者',
        reason: '把“写不出来”从意志问题改写成目标、现状和反馈之间的结构性张力。',
      },
      {
        name: 'L 先生',
        thinkerId: 'lTeacher',
        role: '行动伙伴',
        reason: '把洞察压缩成低摩擦的小动作，避免继续收藏更多资料。',
      },
      {
        name: '申克·阿伦斯',
        role: '输出系统搭建者',
        reason: '提醒笔记要进入连接、改写和输出，而不是停在摘录层。',
      },
    ],
    relatedBooks: [
      {
        title: '最小阻力之路',
        slug: 'path-of-least-resistance',
        role: '主书',
        reason: '先把输出卡点看成结构问题。',
      },
      {
        title: '卡片笔记写作法',
        slug: 'smart-notes',
        role: '方法书',
        reason: '把阅读、笔记和写作连成一个生产系统。',
      },
      {
        title: '好好思考',
        slug: 'good-thinking',
        role: '补充书',
        reason: '帮助把零散信息转成问题意识和认知框架。',
      },
    ],
    relatedConcepts: ['结构性张力', '输出任务', '反证过滤', '卡片连接', '最小作品'],
    minimumAction: {
      title: '3 条笔记成卡',
      time: '15 分钟',
      text: '只选 3 条笔记，写成“问题 - 概念 - 例子 - 一句话结论”。',
      successSignal: '哪怕粗糙，也得到一张能讲给别人听的小卡。',
    },
    workshopModes: ['torch-coach', 'coach', 'world-cafe'],
    workshopOutputs: {
      'torch-coach': {
        currentPosition: '你不是缺更多材料，而是缺一个能把材料推向表达的结构。',
        focusQuestion: '如果今天只发一张很小的卡，这 3 条笔记共同回答什么问题？',
        noiseToIgnore: '先不整理全库、先不补资料、先不追求写得漂亮。',
        minimumAction: '15 分钟内把 3 条笔记强行组成一张问题卡。',
      },
      coach: {
        desiredChange: '从“我有很多笔记”变成“我能用一张卡解释一个问题”。',
        realBlock: '害怕输出粗糙，所以一直停在整理和准备。',
        availableChoice: '先做一张难看的小卡；或者继续整理但限定 10 分钟。',
        commitment: '今天只完成一张“问题 - 概念 - 例子 - 结论”卡。',
      },
      'world-cafe': {
        tableOne: '个体心理桌：你可能在用“继续学习”躲开被评价的压力。',
        tableTwo: '关系互动桌：输出意味着要面对别人是否理解，所以会触发防御。',
        tableThree: '系统文化桌：收藏机制奖励囤积，却不奖励生成作品。',
        synthesis: '共同母题是“输入没有被绑定到一个可交付问题”。',
      },
    },
    outputFormats: ['问题卡', '学习路径', '小红书结构卡'],
  },
  {
    id: 'team-truth-silence',
    phaseLabel: 'Problem Case Seed',
    shortTitle: '团队真话',
    title: '团队没人说真话，通常不是大家没想法',
    entranceType: 'question-card',
    problemNaming: '这不是发言积极性问题，而是共享意义池不安全、顾虑没有出口。',
    currentSituation: '会议上大家点头，会后私聊很多，执行时又出现拖延、变形和反复解释。',
    sceneTags: ['团队沟通', '管理协作', '会议设计'],
    emotionTags: ['无力', '烦躁', '不信任'],
    needTags: ['安全感', '真实信息', '行动出口'],
    coreQuestion: '这场沉默背后，大家在保护什么，又缺少哪一种安全感和行动出口？',
    learningPathId: 'team-truth-silence',
    recommendedThinkers: [
      {
        name: '关键对话',
        role: '安全感修复者',
        reason: '先修复共享意义池和安全感，再谈观点、事实和方案。',
      },
      {
        name: '高绩效教练',
        role: '追问者',
        reason: '用开放问题激发觉察与责任，而不是替团队想答案。',
      },
      {
        name: '彼得·圣吉',
        role: '系统观察者',
        reason: '把团队沉默放回系统、学习和反馈回路里看。',
      },
    ],
    relatedBooks: [
      {
        title: '关键对话',
        slug: 'key-conversations',
        role: '主书',
        reason: '处理安全感、事实、观点和行动收束。',
      },
      {
        title: '高绩效教练',
        slug: 'performance-coaching',
        role: '练习书',
        reason: '把管理者从给答案切到提问和促成责任。',
      },
      {
        title: '模型思维',
        slug: 'model-thinking',
        role: '补充书',
        reason: '用多模型看沉默背后的激励、博弈和信息结构。',
      },
    ],
    relatedConcepts: ['安全感', '共享意义池', '沉默与暴力', '团队学习', '低风险真话入口'],
    minimumAction: {
      title: '10 分钟真话入口',
      time: '10 分钟',
      text: '下一次会议只问一句：这件事里你现在还看不清、仍担心或不同意的是什么？',
      successSignal: '至少收回 3 个真实顾虑，并把其中 1 个转成下一步确认动作。',
    },
    workshopModes: ['private-board', 'world-cafe', 'coach', 'torch-coach'],
    workshopOutputs: {
      'torch-coach': {
        currentPosition: '团队不是没有想法，而是说真话的风险太高、出口太模糊。',
        focusQuestion: '下一次会议能不能先保护“说不清”和“不同意”的空间？',
        noiseToIgnore: '先别急着开更长的会，也别继续追问“为什么没人主动”。',
        minimumAction: '设计一轮每人 1 句话的低风险真话入口。',
      },
      coach: {
        desiredChange: '从表面共识变成能听见真实顾虑。',
        realBlock: '大家不确定说出来会不会被反驳、扣帽子或变成额外责任。',
        availableChoice: '先从一个小范围、低风险问题练习，而不是全员大复盘。',
        commitment: '下一次会议前写好一句安全声明和一个开放问题。',
      },
      'private-board': {
        caseRestatement: '你面对的不是“成员不主动”，而是会议容器没能承接真实信息。',
        keyTension: '既想快速推进，又需要先让不确定和反对意见安全出现。',
        blindSpot: '把沉默归因给个人态度，可能遮住了权力距离和反馈惩罚。',
        experiment: '一周内做一次 10 分钟真话入口，只收集顾虑，不当场反驳。',
      },
      'world-cafe': {
        tableOne: '个体心理桌：成员在保护面子、关系和绩效评价。',
        tableTwo: '关系互动桌：权力距离会让真实顾虑转移到会后私聊。',
        tableThree: '系统文化桌：如果提问题的人总背锅，沉默就是理性选择。',
        synthesis: '共同母题是“真话缺少安全容器和行动出口”。',
      },
    },
    outputFormats: ['会议复盘卡', '安全感设计卡', '团队学习路径'],
  },
  {
    id: 'facts-before-argument',
    phaseLabel: 'Problem Case Seed',
    shortTitle: '摆事实前',
    title: '对方不讲道理时，先别急着摆事实',
    entranceType: 'question-card',
    problemNaming: '这不是事实不够多，而是事实、故事、情绪和安全感纠缠在一起。',
    currentSituation: '你越急着证明事实，对方越防御；对方越防御，你越确信他不讲道理。',
    sceneTags: ['关系冲突', '关键对话', '事实与故事'],
    emotionTags: ['愤怒', '委屈', '急切'],
    needTags: ['被理解', '安全感', '共同事实'],
    coreQuestion: '我看到的是事实，还是我已经把事实编成了一个关于对方的故事？',
    learningPathId: 'facts-before-argument',
    recommendedThinkers: [
      {
        name: '关键对话',
        role: '事实拆分者',
        reason: '帮助把事实、故事、感受和请求拆开。',
      },
      {
        name: '非暴力沟通',
        thinkerId: 'nvc',
        role: '需要翻译者',
        reason: '把指责改写成观察、感受、需要和请求。',
      },
      {
        name: '教练的本质',
        role: '评判释放者',
        reason: '提醒你先接收信息，而不是立刻把对方归类。',
      },
    ],
    relatedBooks: [
      {
        title: '关键对话',
        slug: 'key-conversations',
        role: '主书',
        reason: '处理高风险对话里的事实、故事、安全感和行动。',
      },
      {
        title: '非暴力沟通',
        slug: 'nonviolent-communication',
        role: '表达书',
        reason: '把评价转成可谈的需要和请求。',
      },
      {
        title: '教练的本质',
        slug: 'coaching-essence',
        role: '校正书',
        reason: '练习释放评判、主动回放和接收信息。',
      },
    ],
    relatedConcepts: ['从事实到故事', '安全感', '观察-感受-需要-请求', '释放评判', '学习型倾听'],
    minimumAction: {
      title: '摆事实前三句式',
      time: '8 分钟',
      text: '改用三句话：我看到的事实是、我脑中出现的故事是、我想先确认的是。',
      successSignal: '对方愿意补充自己的版本，而不是马上进入辩论。',
    },
    workshopModes: ['torch-coach', 'coach', 'private-board'],
    workshopOutputs: {
      'torch-coach': {
        currentPosition: '你正被“我很确定”推着往前冲，但对方可能先感到被攻击。',
        focusQuestion: '我现在能不能先确认故事，而不是继续证明事实？',
        noiseToIgnore: '今天先不追加证据、先不翻旧账、先不赢辩论。',
        minimumAction: '写下三句式，并只问一个确认问题。',
      },
      coach: {
        desiredChange: '从互相证明变成共同澄清。',
        realBlock: '你害怕一退后就等于承认自己错了。',
        availableChoice: '先承认“我可能理解错了”，并不等于放弃事实。',
        commitment: '下一次开口前先写下事实和故事各一句。',
      },
      'private-board': {
        caseRestatement: '你想让事实被听见，但当前关系安全感不足，事实被听成了攻击。',
        keyTension: '你既要保护事实，又要保护对话还可继续。',
        blindSpot: '把对方防御理解成不讲理，可能忽略了被否定感。',
        experiment: '下一次只做低火力确认，不做完整说服。',
      },
    },
    outputFormats: ['对话前准备卡', '事实故事拆分卡', '关系降温卡'],
  },
  {
    id: 'intuition-too-simple',
    phaseLabel: 'Problem Case Seed',
    shortTitle: '直觉误判',
    title: '我总是靠直觉判断，事后才发现自己想简单了',
    entranceType: 'question-card',
    problemNaming: '这不是你不聪明，而是快思考在复杂问题里过度自信。',
    currentSituation: '当下判断很顺，事后才发现忽略了基准率、反例、系统因素和长期后果。',
    sceneTags: ['认知决策', '系统思考', '判断偏差'],
    emotionTags: ['懊恼', '自责', '不确定'],
    needTags: ['校准', '多模型', '反证'],
    coreQuestion: '这个判断里，我是不是把一个复杂系统简化成了一个顺手故事？',
    learningPathId: 'notes-to-writing',
    recommendedThinkers: [
      {
        name: '丹尼尔·卡尼曼',
        role: '偏差识别者',
        reason: '提醒快思考、锚定、可得性和损失厌恶如何影响判断。',
      },
      {
        name: '斯科特·佩奇',
        role: '多模型校正者',
        reason: '用多个模型替代单一解释，降低“想简单了”的风险。',
      },
      {
        name: '成甲',
        role: '问题意识整理者',
        reason: '把经验反思成可复用的问题、假设和框架。',
      },
    ],
    relatedBooks: [
      {
        title: '思考，快与慢',
        slug: 'thinking-fast-and-slow',
        role: '主书',
        reason: '识别快思考和常见判断偏差。',
      },
      {
        title: '模型思维',
        slug: 'model-thinking',
        role: '校正书',
        reason: '用多模型看复杂问题。',
      },
      {
        title: '好好思考',
        slug: 'good-thinking',
        role: '转化书',
        reason: '把误判复盘成可迁移的认知框架。',
      },
    ],
    relatedConcepts: ['系统 1 / 系统 2', '锚定效应', '可得性偏差', '多模型思维', '反例检查'],
    minimumAction: {
      title: '三问校准',
      time: '10 分钟',
      text: '做重要判断前写下：我被什么锚定了？反例是什么？如果换一个模型会怎么看？',
      successSignal: '至少得到一个让自己没那么确定的替代解释。',
    },
    workshopModes: ['torch-coach', 'coach', 'world-cafe'],
    workshopOutputs: {
      'torch-coach': {
        currentPosition: '你不是缺信息，而是太快把信息组织成了一个顺手解释。',
        focusQuestion: '这个判断最需要哪一个反例来降温？',
        noiseToIgnore: '先不继续寻找支持自己判断的证据。',
        minimumAction: '写下一个反例和一个替代模型。',
      },
      coach: {
        desiredChange: '从“我感觉很对”变成“我知道自己哪里可能错”。',
        realBlock: '承认不确定会让你觉得自己判断力不够。',
        availableChoice: '先做 10 分钟小校准，而不是推翻整个判断。',
        commitment: '下一个重要判断前完成三问校准。',
      },
      'world-cafe': {
        tableOne: '个体心理桌：确定感会降低焦虑，所以大脑喜欢快速收束。',
        tableTwo: '关系互动桌：表达越自信，越容易得到早期认同并强化误判。',
        tableThree: '系统文化桌：快节奏环境奖励迅速表态，惩罚慢判断。',
        synthesis: '共同母题是“确定感来得太早，复杂性进场太晚”。',
      },
    },
    outputFormats: ['判断校准卡', '反例检查卡', '多模型路径'],
  },
  {
    id: 'needs-become-blame',
    phaseLabel: 'Problem Case Seed',
    shortTitle: '需要到指责',
    title: '我很难把真实需要说出口，一开口就变成指责',
    entranceType: 'emotion',
    problemNaming: '这不是你不会说话，而是需要还没有被翻译成对方能听见的请求。',
    currentSituation: '明明想表达委屈、需要和边界，但出口变成“你总是”“你从来不”。',
    sceneTags: ['亲密关系', '边界表达', '冲突修复'],
    emotionTags: ['愤怒', '委屈', '害怕'],
    needTags: ['被重视', '边界', '稳定回应'],
    coreQuestion: '我真正想被看见的需要是什么？它能不能先不以指责的形式出现？',
    learningPathId: 'facts-before-argument',
    recommendedThinkers: [
      {
        name: '非暴力沟通',
        thinkerId: 'nvc',
        role: '需要翻译者',
        reason: '把评价拆成观察、感受、需要和请求。',
      },
      {
        name: '阿兰·德波顿',
        thinkerId: 'deBotton',
        role: '羞耻安放者',
        reason: '帮助把“不体面”的需要讲得不那么羞耻。',
      },
      {
        name: '亚当·菲利普斯',
        thinkerId: 'adamPhillips',
        role: '欲望命名者',
        reason: '追问指责背后真正被保护的愿望。',
      },
    ],
    relatedBooks: [
      {
        title: '非暴力沟通',
        slug: 'nonviolent-communication',
        role: '主书',
        reason: '用观察、感受、需要、请求重写冲突表达。',
      },
      {
        title: '关键对话',
        slug: 'key-conversations',
        role: '补充书',
        reason: '在高风险关系对话中先修复安全感。',
      },
      {
        title: '教练的本质',
        slug: 'coaching-essence',
        role: '追问书',
        reason: '把评判退后一步，回到真实需要。',
      },
    ],
    relatedConcepts: ['观察', '感受', '需要', '请求', '边界表达', '安全感声明'],
    minimumAction: {
      title: '指责改写四句式',
      time: '12 分钟',
      text: '把一句“你总是”改成：我看到、我感到、我需要、我想请求。',
      successSignal: '得到一句不靠攻击也能表达边界的话。',
    },
    workshopModes: ['torch-coach', 'coach', 'private-board'],
    workshopOutputs: {
      'torch-coach': {
        currentPosition: '你现在不是没有需要，而是需要被愤怒包住了。',
        focusQuestion: '如果不指责，你最想让对方看见哪一个需要？',
        noiseToIgnore: '今天先不证明对方错，也不翻旧账。',
        minimumAction: '把一句“你总是”改写成四句式。',
      },
      coach: {
        desiredChange: '从攻击式表达变成边界清楚、对方还能听见。',
        realBlock: '你担心温和表达会让自己的痛苦不被重视。',
        availableChoice: '先把需要说清楚，再决定是否要谈责任。',
        commitment: '写出一句观察、感受、需要、请求，并只发这一句。',
      },
      'private-board': {
        caseRestatement: '你真正想保护的是需要和边界，但表达形式把对方推到了防御位。',
        keyTension: '既想让痛苦被看见，又不想把关系推向互相攻击。',
        blindSpot: '把强烈表达等同于有力量，可能让真正需要更难被听见。',
        experiment: '先做一次四句式改写，不急着进入完整谈判。',
      },
    },
    outputFormats: ['表达改写卡', '边界请求卡', '关系修复路径'],
  },
]

export const emotionCoordinates = [
  {
    id: 'fear',
    label: '恐惧',
    need: '安全感、可控感、低风险试探',
    caseIds: ['team-truth-silence', 'intuition-too-simple'],
  },
  {
    id: 'confusion',
    label: '迷茫',
    need: '问题命名、结构感、下一步',
    caseIds: ['notes-to-writing', 'intuition-too-simple'],
  },
  {
    id: 'anger',
    label: '愤怒',
    need: '边界、被理解、共同事实',
    caseIds: ['facts-before-argument', 'needs-become-blame'],
  },
  {
    id: 'pain',
    label: '痛苦',
    need: '被安放、被看见、可承受的行动',
    caseIds: ['needs-become-blame', 'notes-to-writing'],
  },
]

export function resolveProblemCaseId(caseId) {
  if (problemCases.some((item) => item.id === caseId)) return caseId
  return defaultProblemCaseId
}

export function getProblemCase(caseId) {
  const resolvedId = resolveProblemCaseId(caseId || defaultProblemCaseId)
  return problemCases.find((item) => item.id === resolvedId) || problemCases[0]
}

export function defaultWorkshopForCase(problemCase) {
  return problemCase?.workshopModes?.[0] || defaultWorkshopModeId
}
