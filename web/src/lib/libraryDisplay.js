export const bookFilterRules = [
  { key: 'all', label: '全部', terms: [] },
  { key: 'systems', label: '系统思考', terms: ['系统思考', '认知决策', '系统', '第五项', '变革', '最小阻力', '有效管理'] },
  { key: 'coaching', label: '教练带人', terms: ['教练', '领导', '团队', '高绩效', '带人', '组织'] },
  { key: 'conversation', label: '沟通对话', terms: ['沟通', '对话', '关键对话', '安全感'] },
  { key: 'therapy', label: '心理疗愈', terms: ['心理疗愈', '自我探索', '霍妮', '情绪', '神经症', '冲突'] },
  { key: 'development', label: '成人发展', terms: ['成人发展', '发展', '心智', '意识进化', '凯根'] },
  { key: 'essay', label: '散文哲学', terms: ['散文哲学', '现代生活', '德波顿', '旅行', '身份焦虑'] },
]

export function statusLabel(status) {
  if (status === 'active') return '已接入'
  if (status === 'light') return '轻量版'
  if (status === 'draft') return '草稿'
  if (status === 'seed') return '种子入口'
  if (status === 'mvp') return 'MVP'
  if (status === 'prototype') return 'Prototype'
  return '准备中'
}

export function matchesBookFilter(book, filterKey) {
  const rule = bookFilterRules.find((item) => item.key === filterKey)
  if (!rule || rule.key === 'all') return true

  const text = normalizeBookText(book)
  return rule.terms.some((term) => text.includes(term.toLowerCase()))
}

export function bookScore(book) {
  let score = 0
  if (book.status === 'active') score += 40
  if (book.status === 'light') score += 30
  if (book.status === 'seed') score += 18
  if (book.coverImage) score += 5
  score += (book.entryTopics?.length || 0) * 8
  score += (book.stats?.length || 0)
  if (book.slug === 'mindset-traps') score += 18
  return score
}

function normalizeBookText(book) {
  return [
    book.title,
    book.shortTitle,
    book.author,
    book.primaryCategory,
    book.secondaryCategory,
    book.status,
    book.description,
    ...(book.entryTopics || []),
    ...(book.stats || []).flatMap((stat) => [stat.label, stat.value]),
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
}
