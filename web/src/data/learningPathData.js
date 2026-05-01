export const learningPathSchemaVersion = 'ProblemLearningPath.v0.1'
export const defaultLearningPathId = 'notes-to-writing'

export const learningPathSamples = [
  {
    id: 'notes-to-writing',
    status: 'seed',
    phaseLabel: '学习路径 Seed',
    shortTitle: '笔记到输出',
    title: '为什么记了很多笔记，还是写不出来',
    audience: '学习笔记 / AI 知识系统 / 内容输出',
    reframe: '你可能不是缺更多笔记，而是缺一条从输入、结构、判断到表达的转化路径。',
    currentBlock: '笔记停在收集层，没有变成可调用的概念关系和表达任务。',
    learningQuestion: '这批笔记共同回答了哪个问题，它们之间是什么关系，最后要产出什么？',
    primaryBook: {
      title: '最小阻力之路',
      slug: 'path-of-least-resistance',
      role: '主书',
      reason: '先把“写不出来”从意志问题改写成结构问题：目标、现状和反馈之间没有形成稳定张力。',
    },
    axes: [
      {
        id: 'action',
        label: '行动',
        question: '今天能把哪 3 条笔记变成一个可交付的小作品？',
        color: '#204f67',
      },
      {
        id: 'narrative',
        label: '叙事',
        question: '这些笔记之间是因果、对比、递进，还是反证关系？',
        color: '#bf6f3f',
      },
      {
        id: 'seeing',
        label: '观看',
        question: '我是不是把“写不出来”误看成了自律不足？',
        color: '#5f7356',
      },
    ],
    stages: [
      {
        level: 'L0',
        title: '问题定向',
        userQuestion: '我到底在学什么？',
        learningGoal: '把“写不出来”改写为“笔记没有形成输出结构”。',
        completionSignal: '能用一句话说出这批笔记正在回答的问题。',
        resources: [],
      },
      {
        level: 'L1',
        title: '根概念',
        userQuestion: '这个问题最关键的概念是什么？',
        learningGoal: '先抓住结构性张力、创造周期、成果导向和反证过滤这几个底层抓手。',
        completionSignal: '能分清：问题、概念、例子、结论分别是什么。',
        resources: [
          {
            label: '结构性张力',
            type: '站内节点',
            slug: 'path-of-least-resistance',
            nodeId: '第09章 结构性张力',
          },
          {
            label: '成果导向',
            type: '站内节点',
            slug: 'effective-executive',
            nodeId: '成果导向',
          },
          {
            label: '反证过滤',
            type: '站内节点',
            slug: 'mindset-traps',
            nodeId: '反证过滤',
          },
        ],
      },
      {
        level: 'L2',
        title: '主书路径',
        userQuestion: '哪本书最适合先打开？',
        learningGoal: '先用《最小阻力之路》建立“作品不是资料堆积，而是结构生成”的基本框架。',
        completionSignal: '能说出目标、现状、下一步反馈之间的差距。',
        resources: [
          {
            label: '打开主书',
            type: '书籍',
            slug: 'path-of-least-resistance',
          },
          {
            label: '创造与问题无关',
            type: '站内节点',
            slug: 'path-of-least-resistance',
            nodeId: '第04章 创造与问题无关',
          },
          {
            label: '将概念化成愿景',
            type: '站内节点',
            slug: 'path-of-least-resistance',
            nodeId: '第10章 将概念化成愿景',
          },
        ],
      },
      {
        level: 'L3',
        title: '校正路径',
        userQuestion: '我最容易误读成什么？',
        learningGoal: '不要把“写不出来”太快归因为懒、散、没天赋；先检查问题定义、结构关系和输出场景。',
        completionSignal: '能写出 2 个替代解释，而不是只责备自己。',
        resources: [
          {
            label: '简化故事',
            type: '站内节点',
            slug: 'mindset-traps',
            nodeId: '简化故事',
          },
          {
            label: '感觉正确',
            type: '站内节点',
            slug: 'mindset-traps',
            nodeId: '感觉正确',
          },
        ],
      },
      {
        level: 'L4',
        title: '练习路径',
        userQuestion: '我今天能怎样验证？',
        learningGoal: '从一堆笔记里只选 3 条，强行组成一张问题卡，验证它们是否能共同服务一个表达任务。',
        completionSignal: '15 分钟内产出一张“问题-概念-例子-结论”卡。',
        resources: [
          {
            label: '全书主动作',
            type: '站内节点',
            slug: 'effective-executive',
            nodeId: '全书主动作',
          },
        ],
      },
      {
        level: 'L5',
        title: '输出路径',
        userQuestion: '我怎样把学习变成自己的东西？',
        learningGoal: '把学习从“继续整理资料”推进到“发布一张能被别人理解的卡片”。',
        completionSignal: '得到一张可发布、可复盘、可继续迭代的内容卡。',
        resources: [
          {
            label: '好好思考 / 模型思维 / 思考，快与慢',
            type: '待接入资产',
            note: '作为后续 100+ 本扩容时的思维线优先接入候选。',
          },
        ],
      },
    ],
    practice: {
      title: '3 条笔记成卡练习',
      time: '15 分钟',
      steps: [
        '只选 3 条最有触动的笔记，先不要继续补资料。',
        '给它们写一个共同问题：它们到底一起回答了什么？',
        '判断 3 条笔记之间的关系：因果、对比、递进、例证或反证。',
        '写出一句话结论，哪怕粗糙，也要能对别人说清楚。',
      ],
    },
    outputTask: {
      title: '问题-概念-例子-一句话结论卡',
      format: [
        '问题：我想解释什么？',
        '概念：哪一个概念最能撑住这个解释？',
        '例子：一个真实场景是什么？',
        '结论：我现在能给出的最小判断是什么？',
      ],
    },
    calibrator: {
      title: '校正镜头',
      text: '写不出来通常不是因为你笔记不够多，而是因为笔记还没有被组织成一个能承受表达压力的结构。',
    },
    nextDecision: '三条静态样张已补齐后，下一步是观察哪条最适合接入思想伙伴的具体困境结果。',
  },
  {
    id: 'team-truth-silence',
    status: 'seed',
    phaseLabel: '学习路径 Seed',
    shortTitle: '沉默到真话',
    title: '团队没人说真话，通常不是大家没想法',
    audience: '团队沟通 / 管理教练 / 组织学习',
    reframe: '你可能不是缺更多发言机会，而是缺一个让真实顾虑能够安全进入讨论、被承接并落到行动的对话容器。',
    currentBlock: '团队把分歧藏在会后、私聊和执行拖延里，会议上只剩表面共识。',
    learningQuestion: '这场沉默背后，大家在保护什么，又缺少哪一种安全感和行动出口？',
    primaryBook: {
      title: '关键对话',
      slug: 'key-conversations',
      role: '主书',
      reason: '先修复共享意义池和安全感，再谈观点、事实和方案，否则真话只会被理解成攻击。',
    },
    axes: [
      {
        id: 'relationship',
        label: '关系',
        question: '什么信号让大家觉得说真话不安全、不划算或没用？',
        color: '#204f67',
      },
      {
        id: 'system',
        label: '系统',
        question: '哪些会议规则、角色关系或激励结构正在奖励沉默？',
        color: '#5f7356',
      },
      {
        id: 'action',
        label: '行动',
        question: '下一次讨论能设计哪一个低风险真话入口？',
        color: '#bf6f3f',
      },
    ],
    stages: [
      {
        level: 'L0',
        title: '问题定向',
        userQuestion: '我到底在学什么？',
        learningGoal: '把“没人说真话”改写为“共享意义池不安全、不完整、没有行动出口”。',
        completionSignal: '能说清沉默是在保护面子、关系、绩效风险，还是保护对权威的安全距离。',
        resources: [],
      },
      {
        level: 'L1',
        title: '根概念',
        userQuestion: '这个问题最关键的概念是什么？',
        learningGoal: '先抓住安全感、共享意义池、沉默与暴力、渴求共识和团队学习。',
        completionSignal: '能识别团队是在真共识、假共识，还是用沉默躲避冲突。',
        resources: [
          {
            label: '安全感',
            type: '站内节点',
            slug: 'key-conversations',
            nodeId: '安全感',
          },
          {
            label: '共享意义池',
            type: '站内节点',
            slug: 'key-conversations',
            nodeId: '共享意义池',
          },
          {
            label: '沉默与暴力',
            type: '站内节点',
            slug: 'key-conversations',
            nodeId: '沉默与暴力',
          },
          {
            label: '渴求共识',
            type: '站内节点',
            slug: 'mindset-traps',
            nodeId: '渴求共识',
          },
        ],
      },
      {
        level: 'L2',
        title: '主书路径',
        userQuestion: '哪本书最适合先打开？',
        learningGoal: '先用《关键对话》搭出“安全感 -> 事实与观点 -> 行动收束”的对话骨架。',
        completionSignal: '能判断当前讨论卡在识别偏轨、修复安全，还是行动收束。',
        resources: [
          {
            label: '打开主书',
            type: '书籍',
            slug: 'key-conversations',
          },
          {
            label: '安全感先于技巧：让对话回到可谈状态',
            type: '站内节点',
            slug: 'key-conversations',
            nodeId: '安全感先于技巧：让对话回到可谈状态',
          },
          {
            label: '第05章 保证安全',
            type: '站内节点',
            slug: 'key-conversations',
            nodeId: '第05章 保证安全',
          },
          {
            label: '第09章 开始行动',
            type: '站内节点',
            slug: 'key-conversations',
            nodeId: '第09章 开始行动',
          },
        ],
      },
      {
        level: 'L3',
        title: '校正路径',
        userQuestion: '我最容易误读成什么？',
        learningGoal: '不要把沉默简单归因为“大家没想法”或“没有担当”；先看系统是否让真话没有容器。',
        completionSignal: '能写出 2 个系统原因：会议结构、权力距离、惩罚经验、目标不清或反馈无效。',
        resources: [
          {
            label: '团队学习',
            type: '站内节点',
            slug: 'fifth-discipline',
            nodeId: '团队学习',
          },
          {
            label: '发展型会议',
            type: '站内节点',
            slug: 'leadership-evolution',
            nodeId: '发展型会议',
          },
          {
            label: '工作即成长场',
            type: '站内节点',
            slug: 'leadership-evolution',
            nodeId: '工作即成长场',
          },
        ],
      },
      {
        level: 'L4',
        title: '练习路径',
        userQuestion: '我今天能怎样验证？',
        learningGoal: '设计一轮 10 分钟低风险真话入口，让每个人只说一个“我还看不清/仍担心/不同意”的点。',
        completionSignal: '会议结束前至少收回 3 个真实顾虑，并明确哪一个进入下一步处理。',
        resources: [
          {
            label: 'GROW模型',
            type: '站内节点',
            slug: 'performance-coaching',
            nodeId: 'GROW模型',
          },
          {
            label: '倾听',
            type: '站内节点',
            slug: 'performance-coaching',
            nodeId: '倾听',
          },
          {
            label: 'AMPP倾听法',
            type: '站内节点',
            slug: 'key-conversations',
            nodeId: 'AMPP倾听法',
          },
        ],
      },
      {
        level: 'L5',
        title: '输出路径',
        userQuestion: '我怎样把学习变成自己的东西？',
        learningGoal: '把一次团队沉默复盘成“安全感-顾虑-系统原因-下一步动作”卡。',
        completionSignal: '得到一张能指导下次会议设计的复盘卡，而不是只留下“大家不主动”的抱怨。',
        resources: [
          {
            label: '用「渴求共识的心智误区」处理关键问题',
            type: '站内节点',
            slug: 'mindset-traps',
            nodeId: '用「渴求共识的心智误区」处理关键问题',
          },
          {
            label: '反馈后学习',
            type: '站内节点',
            slug: 'leadership-evolution',
            nodeId: '反馈后学习',
          },
        ],
      },
    ],
    practice: {
      title: '10 分钟真话入口',
      time: '10 分钟',
      steps: [
        '先声明共同目的：这轮不是追责，而是补齐我们看不见的信息。',
        '每个人只回答一句：我现在仍然担心什么，或哪个地方还不同意？',
        '主持人只复述和确认，不解释、不反驳、不马上给方案。',
        '最后选一个顾虑进入下一步动作：谁确认事实，谁补材料，什么时候回来更新。',
      ],
    },
    outputTask: {
      title: '安全感-顾虑-系统原因-下一步动作卡',
      format: [
        '安全感：这次讨论哪里让人不敢说？',
        '顾虑：大家真正担心的是什么？',
        '系统原因：哪个规则、角色或节奏让沉默合理？',
        '下一步：下一次会议只改哪一个设计？',
      ],
    },
    calibrator: {
      title: '校正镜头',
      text: '团队不说真话，常常不是因为没有观点，而是因为说真话的风险太高、收益太低、出口太模糊。',
    },
    nextDecision: '这条路径适合接入思想伙伴里的“关系/组织/行动”类困境，后续再做具体困境匹配。',
  },
  {
    id: 'facts-before-argument',
    status: 'seed',
    phaseLabel: '学习路径 Seed',
    shortTitle: '摆事实前',
    title: '对方不讲道理时，先别急着摆事实',
    audience: '关系误听 / 关键对话 / 事实与故事拆分',
    reframe: '你可能不是缺更有力的事实，而是缺一条把事实、故事、安全感和对方处境重新拆开的对话路径。',
    currentBlock: '你越急着证明事实，对方越觉得被否定；对方越防御，你越确信他不讲道理。',
    learningQuestion: '我看到的是事实，还是我已经把事实编成了一个关于对方的故事？',
    primaryBook: {
      title: '关键对话',
      slug: 'key-conversations',
      role: '主书',
      reason: '先拆事实、故事和情绪，再用安全感把对方请回共享意义池，事实才有机会被听见。',
    },
    axes: [
      {
        id: 'seeing',
        label: '观看',
        question: '我现在有没有把“我感觉很对”误当成“事实很清楚”？',
        color: '#5f7356',
      },
      {
        id: 'relationship',
        label: '关系',
        question: '对方防御的不是事实本身，还是被否定、被压制、被羞辱的感觉？',
        color: '#204f67',
      },
      {
        id: 'narrative',
        label: '叙事',
        question: '这件事里，我和对方各自编了什么故事？',
        color: '#bf6f3f',
      },
    ],
    stages: [
      {
        level: 'L0',
        title: '问题定向',
        userQuestion: '我到底在学什么？',
        learningGoal: '把“对方不讲道理”改写为“事实、故事、情绪和安全感纠缠在一起”。',
        completionSignal: '能先暂停证明冲动，写出自己看到的事实和自己补出来的故事。',
        resources: [],
      },
      {
        level: 'L1',
        title: '根概念',
        userQuestion: '这个问题最关键的概念是什么？',
        learningGoal: '先抓住从事实到故事、感觉正确、为了学习而倾听、安全感和社会疼痛。',
        completionSignal: '能分清：我观察到了什么、我解释成什么、我因此产生了什么情绪。',
        resources: [
          {
            label: '从事实到故事',
            type: '站内节点',
            slug: 'key-conversations',
            nodeId: '从事实到故事',
          },
          {
            label: '感觉正确',
            type: '站内节点',
            slug: 'mindset-traps',
            nodeId: '感觉正确',
          },
          {
            label: '为了学习而倾听',
            type: '站内节点',
            slug: 'mindset-traps',
            nodeId: '为了学习而倾听',
          },
          {
            label: '社会疼痛',
            type: '站内节点',
            slug: 'mindset-traps',
            nodeId: '社会疼痛',
          },
        ],
      },
      {
        level: 'L2',
        title: '主书路径',
        userQuestion: '哪本书最适合先打开？',
        learningGoal: '先用《关键对话》练习把事实、故事、感受和请求拆开，避免被脑补推着说话。',
        completionSignal: '能把一句指责改写成“事实 + 我的理解 + 我想确认”的表达。',
        resources: [
          {
            label: '打开主书',
            type: '书籍',
            slug: 'key-conversations',
          },
          {
            label: '很多争吵，输在从事实跳到故事太快',
            type: '站内节点',
            slug: 'key-conversations',
            nodeId: '很多争吵，输在从事实跳到故事太快',
          },
          {
            label: '第06章 控制想法',
            type: '站内节点',
            slug: 'key-conversations',
            nodeId: '第06章 控制想法',
          },
          {
            label: 'STATE表达法',
            type: '站内节点',
            slug: 'key-conversations',
            nodeId: 'STATE表达法',
          },
        ],
      },
      {
        level: 'L3',
        title: '校正路径',
        userQuestion: '我最容易误读成什么？',
        learningGoal: '不要太快把对方归类为“不讲道理”；先检查自己是否陷入简化故事、默认正确感和赢辩论模式。',
        completionSignal: '能写出 2 个替代解释：一个关于对方处境，一个关于关系安全，一个关于信息缺口。',
        resources: [
          {
            label: '简化故事',
            type: '站内节点',
            slug: 'mindset-traps',
            nodeId: '简化故事',
          },
          {
            label: '默认正确感',
            type: '站内节点',
            slug: 'mindset-traps',
            nodeId: '默认正确感',
          },
          {
            label: '释放评判',
            type: '站内节点',
            slug: 'coaching-essence',
            nodeId: '释放评判',
          },
        ],
      },
      {
        level: 'L4',
        title: '练习路径',
        userQuestion: '我今天能怎样验证？',
        learningGoal: '用 3 句式替代摆事实：我看到的事实是、我脑中出现的故事是、我想先确认的是。',
        completionSignal: '完成一次低火力确认，对方至少愿意补充自己的版本。',
        resources: [
          {
            label: 'AMPP倾听法',
            type: '站内节点',
            slug: 'key-conversations',
            nodeId: 'AMPP倾听法',
          },
          {
            label: '第09章 接收信息（不只是倾听）',
            type: '站内节点',
            slug: 'coaching-essence',
            nodeId: '第09章 接收信息（不只是倾听）',
          },
        ],
      },
      {
        level: 'L5',
        title: '输出路径',
        userQuestion: '我怎样把学习变成自己的东西？',
        learningGoal: '把一次冲突整理成“事实-故事-安全感-下一句话”卡，下一次先用卡片降温。',
        completionSignal: '得到一张可复用的对话前准备卡，而不是只记住“对方不讲理”。',
        resources: [
          {
            label: '第05章 保证安全',
            type: '站内节点',
            slug: 'key-conversations',
            nodeId: '第05章 保证安全',
          },
          {
            label: '非暴力沟通',
            type: '待接入资产',
            note: '后续扩书后补入感受、需要、请求相关节点。',
          },
        ],
      },
    ],
    practice: {
      title: '摆事实前三句式',
      time: '8 分钟',
      steps: [
        '先写下可观察事实：对方说了什么、做了什么，去掉动机判断。',
        '再写下自己脑中出现的故事：我把这件事解释成了什么？',
        '补一句安全感声明：我不是要否定你，我想先确认我有没有理解错。',
        '最后只问一个学习型问题：你当时是怎么想的，或你最担心什么？',
      ],
    },
    outputTask: {
      title: '事实-故事-安全感-下一句话卡',
      format: [
        '事实：我能共同验证的观察是什么？',
        '故事：我脑中自动补出的解释是什么？',
        '安全感：我需要先保护对方哪一种尊严或处境？',
        '下一句话：我下一次可以怎样问，而不是怎样证明？',
      ],
    },
    calibrator: {
      title: '校正镜头',
      text: '事实不是越早丢出去越有用。关系处在威胁状态时，事实会被听成攻击；先降威胁，事实才有进入对话的空间。',
    },
    nextDecision: '这条路径适合承接关系误听、争论升级、事实与故事拆分相关选题。',
  },
]

export const upcomingLearningPaths = [
  {
    title: '补 Mermaid 学习路径结构图 POC',
    status: '下一步',
    reason: '在现有 L0-L5 数据上生成一张结构图，让路径比文字列表更像“地图”。',
  },
  {
    title: '回头补思想伙伴 PNG 与 fallback 验收',
    status: '下一步',
    reason: '学习路径第一批已成型，公开小测前仍要把结果卡导出和行动反馈降级链路测完。',
  },
]

export const thoughtPartnerSceneLearningPathMap = {
  'xhs-life-envy': 'facts-before-argument',
  'not-chosen-love': 'facts-before-argument',
  'self-exploitation': 'notes-to-writing',
  'room-not-home': 'notes-to-writing',
  'social-performance': 'facts-before-argument',
  'news-anxiety': 'notes-to-writing',
  'old-script': 'notes-to-writing',
  'knowing-not-doing': 'notes-to-writing',
}

export function resolveLearningPathId(pathId) {
  if (learningPathSamples.some((path) => path.id === pathId)) return pathId
  return defaultLearningPathId
}

export function learningPathIdForThoughtPartnerScene(scene = {}) {
  if (scene.learningPathId) return resolveLearningPathId(scene.learningPathId)
  if (thoughtPartnerSceneLearningPathMap[scene.id]) return thoughtPartnerSceneLearningPathMap[scene.id]

  const searchableText = [
    scene.title,
    scene.description,
    ...(scene.lenses || []),
    ...(scene.nextPaths || []),
  ].join(' ')

  if (/团队|组织|会议|共识|协作|反馈/.test(searchableText)) return 'team-truth-silence'
  if (/关系|恋爱|社交|对话|故事|事实|误解|被选择/.test(searchableText)) return 'facts-before-argument'
  return defaultLearningPathId
}
