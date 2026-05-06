const schema = {
  type: 'object',
  additionalProperties: false,
  properties: {
    pattern: {
      type: 'string',
      description: '用户行动反馈里呈现出的心理、关系、行动或环境模式。',
    },
    reading: {
      type: 'string',
      description: '对这个模式的解释，要温和、具体，避免诊断化。',
    },
    nextAction: {
      type: 'string',
      description: '一个比原行动更小、更具体、可在24小时内尝试的新建议。',
    },
    tags: {
      type: 'array',
      description: '3到5个短标签。',
      minItems: 3,
      maxItems: 5,
      items: { type: 'string' },
    },
  },
  required: ['pattern', 'reading', 'nextAction', 'tags'],
}

export default async function thoughtPartnerInsight(request) {
  if (request.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed' }, { status: 405 })
  }

  let payload
  try {
    payload = await request.json()
  } catch {
    return jsonResponse({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const provider = resolveProvider(payload.aiConfig)
  const mode = String(payload.mode || (payload.message ? 'chat' : 'insight')).toLowerCase()
  if (!provider.apiKey) {
    return jsonResponse({
      error: `${provider.keyLabel} is not configured`,
      provider: provider.id,
    }, { status: 503 })
  }

  if (!provider.baseUrl) {
    return jsonResponse({
      error: `${provider.baseUrlLabel} is not configured`,
      provider: provider.id,
    }, { status: 503 })
  }

  if (mode === 'chat') {
    const message = String(payload.message || payload.feedback || '').trim()
    if (!message) {
      return jsonResponse({ error: 'message is required' }, { status: 400 })
    }

    try {
      const requestBody = buildChatReplyBody(provider, payload, message)
      let response = await fetch(`${provider.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${provider.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      })

      let data = await response.json()
      if (!response.ok) {
        return jsonResponse({
          error: data?.error?.message || 'OpenAI request failed',
          provider: provider.id,
        }, { status: response.status })
      }

      const text = data.choices?.[0]?.message?.content
      if (!text) {
        return jsonResponse({
          error: 'AI response did not include message content',
          provider: provider.id,
        }, { status: 502 })
      }

      return jsonResponse({
        reply: text.trim(),
        source: 'ai',
        provider: provider.id,
        model: provider.model,
      })
    } catch (error) {
      return jsonResponse({ error: error.message || 'Unexpected server error' }, { status: 500 })
    }
  }

  const feedback = String(payload.feedback || '').trim()
  if (!feedback) {
    return jsonResponse({ error: 'feedback is required' }, { status: 400 })
  }

  try {
    const requestBody = buildChatCompletionBody(provider, payload, feedback, true)
    let response = await fetch(`${provider.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${provider.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    })

    let data = await response.json()
    if (!response.ok && response.status === 400 && requestBody.response_format) {
      response = await fetch(`${provider.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${provider.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(buildChatCompletionBody(provider, payload, feedback, false)),
      })
      data = await response.json()
    }

    if (!response.ok) {
      return jsonResponse({
        error: data?.error?.message || 'OpenAI request failed',
        provider: provider.id,
      }, { status: response.status })
    }

    const text = data.choices?.[0]?.message?.content
    if (!text) {
      return jsonResponse({
        error: 'AI response did not include message content',
        provider: provider.id,
      }, { status: 502 })
    }

    return jsonResponse({
      insight: normalizeInsightJson(text),
      source: 'ai',
      provider: provider.id,
      model: provider.model,
    })
  } catch (error) {
    return jsonResponse({ error: error.message || 'Unexpected server error' }, { status: 500 })
  }
}

export const config = {
  method: ['POST'],
}

function getNetlifyEnv(key) {
  return process.env[key] || ''
}

function jsonResponse(body, init = {}) {
  return new Response(JSON.stringify(body), {
    status: init.status || 200,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      ...init.headers,
    },
  })
}

function resolveProvider(aiConfig = null) {
  const id = String(getNetlifyEnv('AI_PROVIDER') || 'openai').toLowerCase()
  const genericApiKey = getNetlifyEnv('AI_API_KEY')
  const genericBaseUrl = trimTrailingSlash(getNetlifyEnv('AI_BASE_URL') || getNetlifyEnv('AI_API_BASE_URL'))
  const genericModel = getNetlifyEnv('AI_MODEL')
  const override = normalizeAiConfig(aiConfig)
  const useOverride = Boolean(override?.useLocalAiConfig)

  const providers = {
    openai: {
      id: 'openai',
      apiKey: (useOverride ? override.apiKey : '') || genericApiKey || getNetlifyEnv('OPENAI_API_KEY'),
      keyLabel: 'OPENAI_API_KEY or AI_API_KEY',
      baseUrl: (useOverride ? override.baseUrl : '') || genericBaseUrl || 'https://api.openai.com/v1',
      baseUrlLabel: 'AI_BASE_URL',
      model: (useOverride ? override.model : '') || genericModel || getNetlifyEnv('OPENAI_MODEL') || 'gpt-4.1-mini',
      jsonMode: true,
    },
    deepseek: {
      id: 'deepseek',
      apiKey: (useOverride ? override.apiKey : '') || genericApiKey || getNetlifyEnv('DEEPSEEK_API_KEY'),
      keyLabel: 'DEEPSEEK_API_KEY or AI_API_KEY',
      baseUrl: (useOverride ? override.baseUrl : '') || genericBaseUrl || 'https://api.deepseek.com',
      baseUrlLabel: 'AI_BASE_URL',
      model: (useOverride ? override.model : '') || genericModel || getNetlifyEnv('DEEPSEEK_MODEL') || 'deepseek-chat',
      jsonMode: true,
    },
    kimi: {
      id: 'kimi',
      apiKey: (useOverride ? override.apiKey : '') || genericApiKey || getNetlifyEnv('KIMI_API_KEY') || getNetlifyEnv('MOONSHOT_API_KEY'),
      keyLabel: 'KIMI_API_KEY, MOONSHOT_API_KEY, or AI_API_KEY',
      baseUrl: (useOverride ? override.baseUrl : '') || genericBaseUrl || 'https://api.moonshot.ai/v1',
      baseUrlLabel: 'AI_BASE_URL',
      model: (useOverride ? override.model : '') || genericModel || getNetlifyEnv('KIMI_MODEL') || getNetlifyEnv('MOONSHOT_MODEL') || 'kimi-k2.6',
      jsonMode: true,
    },
    moonshot: {
      id: 'kimi',
      apiKey: (useOverride ? override.apiKey : '') || genericApiKey || getNetlifyEnv('KIMI_API_KEY') || getNetlifyEnv('MOONSHOT_API_KEY'),
      keyLabel: 'KIMI_API_KEY, MOONSHOT_API_KEY, or AI_API_KEY',
      baseUrl: (useOverride ? override.baseUrl : '') || genericBaseUrl || 'https://api.moonshot.ai/v1',
      baseUrlLabel: 'AI_BASE_URL',
      model: (useOverride ? override.model : '') || genericModel || getNetlifyEnv('KIMI_MODEL') || getNetlifyEnv('MOONSHOT_MODEL') || 'kimi-k2.6',
      jsonMode: true,
    },
    xiaomi: {
      id: 'xiaomi',
      apiKey: (useOverride ? override.apiKey : '') || genericApiKey || getNetlifyEnv('XIAOMI_API_KEY'),
      keyLabel: 'XIAOMI_API_KEY or AI_API_KEY',
      baseUrl: (useOverride ? override.baseUrl : '') || genericBaseUrl || trimTrailingSlash(getNetlifyEnv('XIAOMI_BASE_URL')),
      baseUrlLabel: 'XIAOMI_BASE_URL or AI_BASE_URL',
      model: (useOverride ? override.model : '') || genericModel || getNetlifyEnv('XIAOMI_MODEL') || '',
      jsonMode: true,
    },
  }

  return providers[id] || providers.openai
}

function normalizeAiConfig(aiConfig) {
  if (!aiConfig || typeof aiConfig !== 'object') return null
  return {
    useLocalAiConfig: Boolean(aiConfig.useLocalAiConfig),
    apiKey: String(aiConfig.apiKey || '').trim(),
    baseUrl: trimTrailingSlash(aiConfig.baseUrl || ''),
    model: String(aiConfig.model || '').trim(),
  }
}

function buildChatCompletionBody(provider, payload, feedback, useJsonMode) {
  const body = {
    model: provider.model,
    temperature: 0.4,
    messages: [
      {
        role: 'system',
        content: [
          '你是一个温和、具体、非诊断化的思想伙伴产品分析器。',
          '你的任务是基于用户选择的困境、思想伙伴组合、最小行动和行动后的真实反馈，生成一张中文洞察卡。',
          '不要做心理疾病诊断，不要夸大结论，不要给医疗、法律、金融建议。',
          '输出必须适合展示在卡片上：短、准、可行动。',
          '只输出 JSON，不要 Markdown，不要解释文字。',
          `JSON Schema: ${JSON.stringify(schema)}`,
        ].join('\n'),
      },
      {
        role: 'user',
        content: JSON.stringify({
          sceneTitle: payload.sceneTitle,
          displayedProblem: payload.displayedProblem,
          primaryAxis: payload.primaryAxis,
          supportNeed: payload.supportNeed,
          expressionTaste: payload.expressionTaste,
          selectedGoal: payload.selectedGoal,
          lenses: payload.lenses,
          partners: payload.partners,
          minimumAction: payload.minimumAction,
          feedback,
        }, null, 2),
      },
    ],
  }

  if (provider.jsonMode && useJsonMode && getNetlifyEnv('AI_JSON_MODE') !== '0') {
    body.response_format = { type: 'json_object' }
  }

  return body
}

function buildChatReplyBody(provider, payload, message) {
  const conversation = Array.isArray(payload.conversation)
    ? payload.conversation.slice(-8).map((item) => ({
        role: item?.role === 'assistant' ? 'assistant' : 'user',
        content: String(item?.content || '').trim(),
      })).filter((item) => item.content)
    : []

  return {
    model: provider.model,
    temperature: 0.6,
    messages: [
      {
        role: 'system',
        content: [
          '你是一个温和、具体、能帮人把卡片内容继续往前推的思想伙伴。',
          '你要用中文回答，优先给出可执行、可复述、可继续追问的回应。',
          '不要做心理疾病诊断，不要使用抽象空话。',
          '你要结合页面里的当前场景上下文，但不要重复所有字段。',
          `当前上下文：${JSON.stringify(buildChatContext(payload), null, 2)}`,
        ].join('\n'),
      },
      ...conversation,
      {
        role: 'user',
        content: message,
      },
    ],
  }
}

function buildChatContext(payload) {
  return {
    sceneTitle: payload.sceneTitle,
    displayedProblem: payload.displayedProblem,
    primaryAxis: payload.primaryAxis,
    supportNeed: payload.supportNeed,
    expressionTaste: payload.expressionTaste,
    selectedGoal: payload.selectedGoal,
    minimumAction: payload.minimumAction,
  }
}

function normalizeInsightJson(text) {
  const parsed = parseJsonFromText(text)
  if (!parsed) throw new Error('AI response was not valid JSON')
  return {
    pattern: String(parsed.pattern || '').trim(),
    reading: String(parsed.reading || parsed.meaning || '').trim(),
    nextAction: String(parsed.nextAction || parsed.suggestion || '').trim(),
    tags: Array.isArray(parsed.tags) ? parsed.tags.slice(0, 5).map((tag) => String(tag).trim()).filter(Boolean) : [],
  }
}

function parseJsonFromText(value) {
  const text = String(value || '').trim()
  const candidates = [
    text,
    text.match(/```(?:json)?\s*([\s\S]*?)\s*```/i)?.[1],
    text.includes('{') ? text.slice(text.indexOf('{'), text.lastIndexOf('}') + 1) : '',
  ].filter(Boolean)

  for (const candidate of candidates) {
    try {
      return JSON.parse(candidate.trim())
    } catch {
      // Try the next candidate.
    }
  }
  return null
}

function trimTrailingSlash(value) {
  return String(value || '').replace(/\/+$/, '')
}
