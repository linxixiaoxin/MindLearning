import http from 'node:http'
import thoughtPartnerInsight from '../netlify/functions/thought-partner-insight.js'
import adminUsers from '../netlify/functions/admin-users.js'
import userProfile from '../netlify/functions/user-profile.js'

const port = Number(process.env.THOUGHT_PARTNER_API_PORT || 8888)

const functionRoutes = {
  '/.netlify/functions/thought-partner-insight': thoughtPartnerInsight,
  '/.netlify/functions/admin-users': adminUsers,
  '/.netlify/functions/user-profile': userProfile,
}

const server = http.createServer(async (req, res) => {
  setCorsHeaders(res)

  if (req.method === 'OPTIONS') {
    res.writeHead(204)
    res.end()
    return
  }

  if (req.method === 'GET' && req.url === '/status') {
    sendJson(res, 200, {
      ok: true,
      service: 'thought-partner-api-proxy',
      port,
    })
    return
  }

  const fnModule = functionRoutes[req.url]
  if (fnModule) {
    try {
      const body = await readRequestBody(req)
      const request = new Request(`http://127.0.0.1:${port}${req.url}`, {
        method: req.method,
        headers: buildHeaders(req.headers),
        body,
      })
      const response = await fnModule(request)
      await pipeResponse(res, response)
      return
    } catch (error) {
      sendJson(res, 500, {
        error: error.message || 'Proxy error',
      })
      return
    }
  }

  sendJson(res, 404, {
    error: 'Not found',
  })
})

server.listen(port, '127.0.0.1', () => {
  console.log(`[thought-partner-api-proxy] listening on http://127.0.0.1:${port}`)
  console.log(`[thought-partner-api-proxy] routes: ${Object.keys(functionRoutes).join(', ')}`)
})

function buildHeaders(headers) {
  const result = new Headers()
  for (const [key, value] of Object.entries(headers || {})) {
    if (typeof value === 'undefined') continue
    if (Array.isArray(value)) {
      result.set(key, value.join(', '))
    } else {
      result.set(key, String(value))
    }
  }
  return result
}

function setCorsHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS')
}

async function readRequestBody(req) {
  const chunks = []
  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk))
  }
  if (!chunks.length) return undefined
  return Buffer.concat(chunks)
}

async function pipeResponse(res, response) {
  res.statusCode = response.status
  response.headers.forEach((value, key) => {
    res.setHeader(key, value)
  })
  const body = await response.arrayBuffer()
  res.end(Buffer.from(body))
}

function sendJson(res, status, body) {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.end(JSON.stringify(body))
}
