import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const workspaceRoot = path.resolve(fileURLToPath(new URL('../../../../', import.meta.url)))
const localHotEventsPath = path.join(workspaceRoot, '01_sources', '06_hot_events', 'latest_hot_events.json')

// https://vite.dev/config/
export default defineConfig({
  server: {
    proxy: {
      '/.netlify/functions': {
        target: 'http://127.0.0.1:8888',
        changeOrigin: true,
      },
    },
  },
  plugins: [
    vue(),
    {
      name: 'local-hot-events',
      configureServer(server) {
        server.middlewares.use('/api/local-hot-events', async (_req, res) => {
          try {
            const content = await readFile(localHotEventsPath, 'utf8')
            res.setHeader('Content-Type', 'application/json; charset=utf-8')
            res.end(content)
          } catch (error) {
            res.statusCode = 404
            res.setHeader('Content-Type', 'application/json; charset=utf-8')
            res.end(JSON.stringify({
              error: 'Local hot event snapshot was not found. Run 04_operations/06_ops_runtime/scripts/fetch_hot_events_to_local.mjs first.',
              detail: error.message || '',
              items: [],
            }))
          }
        })
      },
    },
  ],
})
