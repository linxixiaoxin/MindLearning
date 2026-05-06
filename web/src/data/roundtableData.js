export const roundtableModes = [
  {
    id: 'yes-and',
    label: 'Yes-and 接力',
    tone: '先接住，再推进',
    focus: '适合把混乱问题慢慢照亮，不急着给判断。',
  },
  {
    id: 'debate',
    label: '多视角辩论',
    tone: '观点相互校准',
    focus: '适合用户陷入单一解释，需要反方和证据介入。',
  },
  {
    id: 'coach-1v1',
    label: '一对一教练',
    tone: '一次只问一个问题',
    focus: '适合敏感、私密、需要慢慢澄清的处境。',
  },
  {
    id: 'content-turn',
    label: '内容转译',
    tone: '从问题到图文素材',
    focus: '适合把一轮拆解变成小红书选题、封面和图文逻辑。',
  },
]

export const roundtableStages = [
  {
    id: 'intake',
    label: '问题进入',
    output: '原始表达',
  },
  {
    id: 'naming',
    label: '卡点命名',
    output: '问题命名',
  },
  {
    id: 'assumption',
    label: '假设拆解',
    output: '隐含假设',
  },
  {
    id: 'perspective',
    label: '视角学习',
    output: '书籍证据',
  },
  {
    id: 'action',
    label: '行动承诺',
    output: '最小行动',
  },
  {
    id: 'content',
    label: '内容回流',
    output: '图文素材',
  },
]

export const roundtableAgents = [
  {
    id: 'host',
    name: '圆桌主持人',
    shortName: '主持',
    seat: 'top',
    color: '#204f67',
    role: '控制节奏',
    task: '把大家的发言收束成一条可继续推进的问题线。',
  },
  {
    id: 'torch',
    name: '火把教练',
    shortName: '火把',
    seat: 'right-top',
    color: '#bf6f3f',
    role: '照亮当下',
    task: '先看见用户现在真正站在哪里，只给一个最小行动。',
  },
  {
    id: 'evidence',
    name: '证据馆员',
    shortName: '证据',
    seat: 'right-bottom',
    color: '#6f7f51',
    role: '连接书籍',
    task: '把本地书籍、概念和方法卡接到当前问题上。',
  },
  {
    id: 'challenger',
    name: '反方朋友',
    shortName: '反方',
    seat: 'left-bottom',
    color: '#7e5d57',
    role: '指出盲点',
    task: '温和地挑战用户最顺手的解释和隐含假设。',
  },
  {
    id: 'editor',
    name: '内容编辑',
    shortName: '编辑',
    seat: 'left-top',
    color: '#5c7180',
    role: '转成素材',
    task: '把拆解过程改写成小红书图文可用的选题和页面逻辑。',
  },
]

export const virtualUserTemplates = [
  {
    id: 'creator-lin',
    name: '林知远',
    avatarText: '林',
    source: '本地内容库 + 《人类木马程序》式自我观察',
    archetype: '知识型创作者',
    currentAge: 29,
    status: '正在从输入型学习转向稳定输出',
    baseNeed: '希望把读书、心理洞察和个人表达稳定转成内容作品。',
    trigger: '看到同领域账号增长很快，开始怀疑自己的表达是否太慢、太复杂。',
    problem: '我明明有很多材料，却总是觉得还没准备好，不敢把复杂想法发出去。',
    problemCaseId: 'notes-to-writing',
    traits: ['高敏感', '资料很多', '自我要求高', '害怕粗糙'],
    growth: {
      awareness: 42,
      agency: 36,
      expression: 44,
      evidence: 58,
    },
    timeline: [
      '习惯用继续整理资料缓解发布焦虑。',
      '开始意识到“准备好”可能是逃避被评价。',
      '最近尝试把一张卡先发出来，而不是等全系统完成。',
    ],
  },
  {
    id: 'manager-qiao',
    name: '乔安',
    avatarText: '乔',
    source: '团队沟通案例 + 《关键对话》',
    archetype: '新晋团队负责人',
    currentAge: 34,
    status: '从解决问题的人，转向设计对话容器的人',
    baseNeed: '希望团队能说真话，也希望自己不要每次都变成救火的人。',
    trigger: '连续两次项目复盘会上大家沉默，会后却私下吐槽很多。',
    problem: '我感觉团队没人主动说真话，但我又怕一追问大家更防御。',
    problemCaseId: 'team-truth-silence',
    traits: ['责任感强', '推进欲高', '怕失控', '容易替团队想答案'],
    growth: {
      awareness: 48,
      agency: 52,
      expression: 40,
      evidence: 46,
    },
    timeline: [
      '过去把沉默理解成员工不主动。',
      '开始看到会议结构和安全感对真话的影响。',
      '下一步要练习先收集顾虑，而不是立刻反驳。',
    ],
  },
  {
    id: 'student-mu',
    name: '穆夏',
    avatarText: '穆',
    source: '升学选择场景 + 模型思维',
    archetype: '高考后选择者',
    currentAge: 18,
    status: '从被排名推着走，转向建立自己的比较地图',
    baseNeed: '希望选一个不后悔的方向，同时不想完全被家长和热门专业带走。',
    trigger: '家里更看重学校名气，自己又担心专业不适合。',
    problem: '我到底该优先学校还是专业？我怕选错一步以后就很难改。',
    problemCaseId: 'school-major-compare',
    traits: ['信息焦虑', '怕错过', '很在意家人评价', '缺真实职业样本'],
    growth: {
      awareness: 35,
      agency: 30,
      expression: 34,
      evidence: 28,
    },
    timeline: [
      '一开始只看排名和经验帖。',
      '开始把学校、专业、城市、能力和风险拆开比较。',
      '下一步要补一个专业的真实课程和毕业去向信息。',
    ],
  },
]

export const sourceSeedOptions = [
  {
    id: 'book',
    label: '书籍生成',
    prompt: '从一本书的核心冲突生成一个虚拟用户',
    seed: '一个读了很多心理书但一到真实关系里就表达不清的人',
  },
  {
    id: 'website',
    label: '网站生成',
    prompt: '从一个网站/账号/论坛现象生成用户',
    seed: '一个长期刷经验帖但越看越焦虑的升学选择者',
  },
  {
    id: 'content-data',
    label: '内容数据生成',
    prompt: '从小红书数据和选题信号生成用户',
    seed: '一个对表达、沟通、心理类内容有强烈共鸣的读者',
  },
]

export const problemSceneOptions = [
  {
    id: 'relationship',
    label: '关系沟通',
    problemCaseId: 'relationship-trigger',
    hint: '伴侣、朋友、家人、同事之间一句话触发强烈反应。',
  },
  {
    id: 'content',
    label: '内容输出',
    problemCaseId: 'notes-to-writing',
    hint: '读了很多、想法很多，但发布、写作或表达卡住。',
  },
  {
    id: 'team',
    label: '团队协作',
    problemCaseId: 'team-truth-silence',
    hint: '会议沉默、真话缺席、责任和反馈都很难推进。',
  },
  {
    id: 'choice',
    label: '选择决策',
    problemCaseId: 'school-major-compare',
    hint: '升学、职业、方向选择里被排名、建议和后果推着走。',
  },
  {
    id: 'conflict',
    label: '事实争执',
    problemCaseId: 'facts-before-argument',
    hint: '越摆事实越像吵架，事实、故事和安全感纠缠在一起。',
  },
]

export const growthEvents = [
  {
    stageId: 'intake',
    metric: 'awareness',
    delta: 4,
    text: '把混乱感说成了一个可以被看见的问题。',
  },
  {
    stageId: 'naming',
    metric: 'awareness',
    delta: 8,
    text: '从“我不行”移动到“这里有一个结构性卡点”。',
  },
  {
    stageId: 'assumption',
    metric: 'agency',
    delta: 7,
    text: '发现原来推动自己的不是事实本身，而是一个未被检验的假设。',
  },
  {
    stageId: 'perspective',
    metric: 'evidence',
    delta: 9,
    text: '找到可以继续学习的书籍和概念，不再只靠感觉判断。',
  },
  {
    stageId: 'action',
    metric: 'agency',
    delta: 10,
    text: '把问题压缩成 24 小时内能做的一步。',
  },
  {
    stageId: 'content',
    metric: 'expression',
    delta: 12,
    text: '把这次拆解转成一条能服务类似读者的内容种子。',
  },
]

export function createVirtualUserFromSeed(seed, sourceId = 'book') {
  const source = sourceSeedOptions.find((item) => item.id === sourceId) || sourceSeedOptions[0]
  const cleanSeed = String(seed || source.seed).trim()
  const id = `virtual-${sourceId}-${Date.now()}`
  const shortName = cleanSeed.slice(0, 2).replace(/\s/g, '') || '新'
  return {
    id,
    name: `${source.label}用户`,
    avatarText: shortName,
    source: `${source.label} · ${cleanSeed}`,
    archetype: '模拟生成用户',
    currentAge: 27,
    status: '刚进入问题拆解流程',
    baseNeed: '希望把一个模糊的卡点拆成可以学习和行动的路径。',
    trigger: cleanSeed,
    problem: inferProblemFromSeed(cleanSeed),
    problemCaseId: inferCaseIdFromSeed(cleanSeed),
    traits: inferTraitsFromSeed(cleanSeed),
    growth: {
      awareness: 32,
      agency: 28,
      expression: 30,
      evidence: 25,
    },
    timeline: [
      '由页面模拟生成，还没有经历完整圆桌。',
      '第一轮目标是把原始处境说清楚。',
    ],
  }
}

export function createVirtualUserFromRawProblem({ rawText, sceneId = 'relationship', name = '' }) {
  const cleanText = String(rawText || '').trim()
  const scene = problemSceneOptions.find((item) => item.id === sceneId) || problemSceneOptions[0]
  const id = `real-problem-${scene.id}-${Date.now()}`
  const displayName = String(name || '').trim() || `${scene.label}用户`
  const avatarText = displayName.slice(0, 1) || '真'

  return {
    id,
    name: displayName,
    avatarText,
    source: `真实问题入口 · ${scene.label}`,
    archetype: '真实问题建模',
    currentAge: null,
    status: '刚把真实原话放到圆桌上',
    baseNeed: `希望先把“${scene.label}”里的卡点说清楚，再决定要学习、行动还是转成内容。`,
    trigger: scene.hint,
    problem: cleanText || scene.hint,
    problemCaseId: inferProblemCaseIdFromRawProblem(cleanText, scene),
    traits: inferTraitsFromSeed(cleanText),
    privacyLevel: 'local-only',
    growth: {
      awareness: 38,
      agency: 30,
      expression: 36,
      evidence: 22,
    },
    timeline: [
      '由真实问题入口生成，默认只作为本地页面里的工作假设。',
      '第一轮先命名卡点，不把用户材料诊断化或写死。',
    ],
  }
}

function inferProblemFromSeed(seed) {
  if (/王熙凤|控制|预算|接管|拍板|授权|救火|能人|补丁/.test(seed)) return '我发现所有紧急项目最后都会回到我这里。只要我不盯，局面就像要散；但团队越来越沉默，我也越来越累。'
  if (/团队|会议|管理|真话/.test(seed)) return '我想让团队说真话，但不知道怎样开口才不会让大家更防御。'
  if (/升学|学校|专业|选择|经验帖/.test(seed)) return '我被太多建议推着走，不知道怎样做一个属于自己的选择。'
  if (/关系|沟通|表达|心理|情绪/.test(seed)) return '我知道自己有感受，但一开口就像在解释、证明或指责。'
  return '我有一个模糊的卡点，感觉需要被重新命名，才知道下一步怎么做。'
}

function inferProblemCaseIdFromRawProblem(rawText, scene) {
  if (/王熙凤|控制|预算|接管|拍板|授权|救火|能人|补丁|单点依赖|系统/.test(rawText)) return 'control-hub-dependency'
  if (/团队|会议|管理|下属|员工|协作|真话|复盘/.test(rawText)) return 'team-truth-silence'
  if (/学校|专业|升学|志愿|排名|选择|职业|转型|方向/.test(rawText)) return 'school-major-compare'
  if (/事实|讲道理|争|吵|指责|狡辩|否定/.test(rawText)) return 'facts-before-argument'
  if (/写|发|发布|内容|笔记|资料|输出|账号|小红书/.test(rawText)) return 'notes-to-writing'
  if (/关系|伴侣|朋友|家人|解释|误解|委屈|边界|需要/.test(rawText)) return 'relationship-trigger'
  return scene.problemCaseId
}

function inferCaseIdFromSeed(seed) {
  if (/王熙凤|控制|预算|接管|拍板|授权|救火|能人|补丁|单点依赖/.test(seed)) return 'control-hub-dependency'
  if (/团队|会议|管理|真话/.test(seed)) return 'team-truth-silence'
  if (/升学|学校|专业|选择|经验帖/.test(seed)) return 'school-major-compare'
  if (/关系|沟通|表达|心理|情绪/.test(seed)) return 'relationship-trigger'
  return 'notes-to-writing'
}

function inferTraitsFromSeed(seed) {
  const traits = []
  if (/焦虑|怕|担心/.test(seed)) traits.push('高焦虑')
  if (/表达|沟通|关系/.test(seed)) traits.push('关系敏感')
  if (/书|知识|内容|资料/.test(seed)) traits.push('资料依赖')
  if (/选择|升学|职业/.test(seed)) traits.push('选择压力')
  return traits.length ? traits : ['卡点模糊', '需要命名', '缺下一步']
}

// === Archetype Roundtable Presets ===
export const archetypeRoundtables = [
  {
    id: 'arch-01',
    title: '羞耻的两种修补方式',
    scene: '被当众指出错误后',
    participants: [
      { type: 'archetype', name: '阿Q', role: '精神胜利者', angle: '你错了？不，是他们错了。我是被误解的。' },
      { type: 'archetype', name: '地下室人', role: '自我羞辱者', angle: '我就是有问题——你先别说，我先说完。' },
      { type: 'thinker', name: '布迪厄', role: '结构分析', angle: '这种羞耻不是个人问题——是阶层评价体系内化的结果。这个体系让你以为自己的价值等于被认可的程度。' },
    ],
    moderatorQuestion: '同一个羞辱——一个往上翻，一个往下钻。这两种修补方式各自在保护什么？代价是什么？',
  },
  {
    id: 'arch-02',
    title: '控制的两种燃料',
    scene: '重要项目进入关键期，别人接手不放心',
    participants: [
      { type: 'archetype', name: '王熙凤', role: '控制中枢', angle: '我不盯就会塌——信任是风险的别名。我见过太多次"交给别人就出问题"。' },
      { type: 'archetype', name: '诸葛亮', role: '最后防线', angle: '你们都退，我来扛。责任比授权更可靠——我不怕累，我怕结果不在我手里。' },
      { type: 'thinker', name: '福柯', role: '权力分析', angle: '控制不来自个人——来自你已经内化的那条规则在替你执行。你以为自己在选择"盯"，其实是系统在要求你盯。' },
    ],
    moderatorQuestion: '一个是主动扩张控制边界，一个是被动扛起最后防线。同样是不放手——一个在追权力，一个在躲失败。它们底下的燃料一样吗？',
  },
  {
    id: 'arch-03',
    title: '沉默的四种方式',
    scene: '聚会中感到格格不入，选择不说话',
    participants: [
      { type: 'archetype', name: '默尔索', role: '情感隔离者', angle: '我不说不是因为不在乎——是你们的情绪剧本替不了我的感受。为什么人必须表现出"应该"的样子？' },
      { type: 'archetype', name: '林黛玉', role: '敏感探测者', angle: '他们一个眼神我就知道——不说比说更安全。我说的话会被拿去解读、传开、指责。不如沉默。' },
      { type: 'thinker', name: '欧文·戈夫曼', role: '印象管理', angle: '沉默也是一种表演——你在保护自己的前台不被看穿。不说话的人其实在用"不做动作"来表达：我不想扮演你们给我的角色。' },
    ],
    moderatorQuestion: '同一种沉默——"我不需要解释"vs"我不敢解释"。中间隔的是安全感还是权力感？',
  },
  {
    id: 'arch-04',
    title: '价值感崩塌',
    scene: '突然失去了证明自己价值的那个角色或平台',
    participants: [
      { type: 'archetype', name: '格里高尔', role: '供养者困境', angle: '当我对家人从资产变成负债——我还算什么？价值被功能取代，功能一消失，我存在都是为了给别人添麻烦。' },
      { type: 'archetype', name: '盖茨比', role: '成功代币者', angle: '只要我足够成功，她就会看到我的价值。我必须创造更多、证明更多——否则那些爱的可能性就会消失。' },
      { type: 'thinker', name: '阿兰·德波顿', role: '身份焦虑', angle: '这不是个人失败——是身份焦虑把你放在了一个你不想待的评价体系里。你突然看见了自己在体系中的脆弱位置。' },
    ],
    moderatorQuestion: '一个被功能消失压垮，一个被成功焦虑驱赶——他们的价值感挂在同一个钩子上吗？那个钩子是什么？',
  },
  {
    id: 'arch-05',
    title: '关系里的追与逃',
    scene: '伴侣越沉默你越追问，越追问对方越撤退',
    participants: [
      { type: 'archetype', name: '奥赛罗', role: '嫉妒吞没者', angle: '你证明给我看——你和那个人到底是什么关系？我需要确凿无疑的证据。沉默对我来说就是默认。' },
      { type: 'archetype', name: '凯瑟琳·恩萧', role: '身份融合者', angle: '我就是希斯克利夫——我爱他就像爱我自己。你问我边界在哪里？我们的边界本就不该存在。' },
      { type: 'thinker', name: '苏珊·约翰逊', role: '依恋分析', angle: '追和逃底下是同一种东西——恐惧失去连接的信号。一个用靠近来抵抗恐慌，一个用后退来保护关系。他们都在说同一句话：别丢下我。' },
    ],
    moderatorQuestion: '一个追问到底，一个沉默以对——看似相反的动作，底下是不是都在怕同一件事？',
  },
]
