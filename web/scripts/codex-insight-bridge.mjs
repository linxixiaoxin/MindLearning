import { createServer } from 'node:http'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.resolve(__dirname, '..')
const inboxDir = path.resolve(projectRoot, 'codex-inbox')
const latestPath = path.join(inboxDir, 'thought-partner-latest.json')
const responsePath = path.join(inboxDir, 'thought-partner-response.json')
const port = Number(process.env.CODEX_BRIDGE_PORT || 8787)

const server = createServer(async (request, response) => {
  setCorsHeaders(response)

  if (request.method === 'OPTIONS') {
    response.writeHead(204)
    response.end()
    return
  }

  if (request.method === 'GET' && request.url === '/status') {
    const latestRequest = await readJsonFile(latestPath)
    const latestResponse = await readJsonFile(responsePath)
    writeJson(response, 200, {
      ok: true,
      service: 'codex-insight-bridge',
      started: true,
      port,
      inboxPath: latestPath,
      responsePath,
      latestRequestAt: latestRequest?.receivedAt || null,
      latestResponseAt: latestResponse?.receivedAt || latestResponse?.generatedAt || null,
      latestResponseSource: latestResponse?.source || null,
    })
    return
  }

  if (request.method === 'GET' && request.url === '/thought-partner/response') {
    try {
      const responseBody = await readFile(responsePath, 'utf8')
      writeJson(response, 200, JSON.parse(stripBom(responseBody)))
    } catch {
      writeJson(response, 404, { error: 'No Codex response yet' })
    }
    return
  }

  if (request.method === 'POST' && request.url === '/thought-partner/response') {
    try {
      const body = await readBody(request)
      const payload = JSON.parse(body || '{}')
      const record = {
        receivedAt: new Date().toISOString(),
        ...payload,
      }
      await mkdir(inboxDir, { recursive: true })
      await writeFile(responsePath, JSON.stringify(record, null, 2), 'utf8')
      writeJson(response, 200, { ok: true, responsePath, receivedAt: record.receivedAt })
    } catch (error) {
      writeJson(response, 500, { error: error.message || 'Failed to write Codex response' })
    }
    return
  }

  if (request.method !== 'POST' || request.url !== '/thought-partner/inbox') {
    writeJson(response, 404, { error: 'Not found' })
    return
  }

  try {
    const body = await readBody(request)
    const payload = JSON.parse(body || '{}')
    const record = {
      receivedAt: new Date().toISOString(),
      source: 'book-kb-multi local webpage',
      payload,
    }

    await mkdir(inboxDir, { recursive: true })
    await writeFile(latestPath, JSON.stringify(record, null, 2), 'utf8')

    writeJson(response, 200, {
      ok: true,
      inboxPath: latestPath,
      receivedAt: record.receivedAt,
    })
  } catch (error) {
    writeJson(response, 500, {
      error: error.message || 'Failed to write Codex inbox',
    })
  }
})

server.listen(port, '127.0.0.1', () => {
  console.log(`Codex insight bridge listening on http://127.0.0.1:${port}`)
  console.log(`Latest inbox file: ${latestPath}`)
  console.log(`Latest response file: ${responsePath}`)
})

function setCorsHeaders(response) {
  response.setHeader('Access-Control-Allow-Origin', '*')
  response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  response.setHeader('Cache-Control', 'no-store')
}

function stripBom(value) {
  return value.charCodeAt(0) === 0xfeff ? value.slice(1) : value
}

async function readJsonFile(filePath) {
  try {
    const content = await readFile(filePath, 'utf8')
    return JSON.parse(stripBom(content))
  } catch {
    return null
  }
}

function writeJson(response, statusCode, body) {
  response.writeHead(statusCode, { 'Content-Type': 'application/json; charset=utf-8' })
  response.end(JSON.stringify(body))
}

function readBody(request) {
  return new Promise((resolve, reject) => {
    let body = ''
    request.setEncoding('utf8')
    request.on('data', (chunk) => {
      body += chunk
      if (body.length > 1_000_000) {
        request.destroy()
        reject(new Error('Request body too large'))
      }
    })
    request.on('end', () => resolve(body))
    request.on('error', reject)
  })
}
