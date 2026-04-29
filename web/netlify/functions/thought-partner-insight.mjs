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

export async function handler(event) {
  if (event.httpMethod !== 'POST') {
    return jsonResponse(405, { error: 'Method not allowed' })
  }

  if (!process.env.OPENAI_API_KEY) {
    return jsonResponse(503, { error: 'OPENAI_API_KEY is not configured' })
  }

  let payload
  try {
    payload = JSON.parse(event.body || '{}')
  } catch {
    return jsonResponse(400, { error: 'Invalid JSON body' })
  }

  const feedback = String(payload.feedback || '').trim()
  if (!feedback) {
    return jsonResponse(400, { error: 'feedback is required' })
  }

  try {
    const response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || 'gpt-4.1-mini',
        input: [
          {
            role: 'system',
            content: [
              {
                type: 'input_text',
                text: [
                  '你是一个温和、具体、非诊断化的思想伙伴产品分析器。',
                  '你的任务是基于用户选择的困境、思想伙伴组合、最小行动和行动后的真实反馈，生成一张中文洞察卡。',
                  '不要做心理疾病诊断，不要夸大结论，不要给医疗、法律、金融建议。',
                  '输出必须适合展示在卡片上：短、准、可行动。',
                ].join('\n'),
              },
            ],
          },
          {
            role: 'user',
            content: [
              {
                type: 'input_text',
                text: JSON.stringify(
                  {
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
                  },
                  null,
                  2,
                ),
              },
            ],
          },
        ],
        text: {
          format: {
            type: 'json_schema',
            name: 'thought_partner_feedback_insight',
            strict: true,
            schema,
          },
        },
      }),
    })

    const data = await response.json()
    if (!response.ok) {
      return jsonResponse(response.status, {
        error: data?.error?.message || 'OpenAI request failed',
      })
    }

    const text = data.output_text || data.output?.flatMap((item) => item.content || [])
      .find((item) => item.type === 'output_text')?.text

    if (!text) {
      return jsonResponse(502, { error: 'OpenAI response did not include output_text' })
    }

    return jsonResponse(200, { insight: JSON.parse(text), source: 'ai' })
  } catch (error) {
    return jsonResponse(500, { error: error.message || 'Unexpected server error' })
  }
}

function jsonResponse(statusCode, body) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
    },
    body: JSON.stringify(body),
  }
}
