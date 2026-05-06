import fs from 'node:fs/promises'
import path from 'node:path'

const workspaceRoot = path.resolve(process.cwd(), '../../../..')
const sourcePath = path.join(
  workspaceRoot,
  '04_operations/02_content_and_planning/planning/05_release_command_center/data/release_registry.csv',
)
const outputPath = path.resolve(process.cwd(), 'src/data/contentOpsReleaseRegistry.generated.json')

function parseCsv(text) {
  const rows = []
  let row = []
  let cell = ''
  let inQuotes = false

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i]
    const next = text[i + 1]

    if (char === '"') {
      if (inQuotes && next === '"') {
        cell += '"'
        i += 1
      } else {
        inQuotes = !inQuotes
      }
      continue
    }

    if (char === ',' && !inQuotes) {
      row.push(cell)
      cell = ''
      continue
    }

    if ((char === '\n' || char === '\r') && !inQuotes) {
      if (char === '\r' && next === '\n') i += 1
      row.push(cell)
      if (row.some((value) => value.trim())) rows.push(row)
      row = []
      cell = ''
      continue
    }

    cell += char
  }

  row.push(cell)
  if (row.some((value) => value.trim())) rows.push(row)
  return rows
}

function countBy(items, key) {
  return items.reduce((acc, item) => {
    const value = item[key] || 'unknown'
    acc[value] = (acc[value] || 0) + 1
    return acc
  }, {})
}

function normalizeRow(row) {
  return Object.fromEntries(
    Object.entries(row).map(([key, value]) => [key, typeof value === 'string' ? value.trim() : value]),
  )
}

const csvText = await fs.readFile(sourcePath, 'utf8')
const [headers, ...records] = parseCsv(csvText)
const items = records
  .map((record) => Object.fromEntries(headers.map((header, index) => [header.trim(), record[index] || ''])))
  .map(normalizeRow)
  .filter((item) => item.id)

const generated = {
  generatedAt: new Date().toISOString(),
  sourcePath: path.relative(workspaceRoot, sourcePath).replaceAll(path.sep, '/'),
  summary: {
    total: items.length,
    byStatus: countBy(items, 'status'),
    byPriority: countBy(items, 'priority'),
    bySeries: countBy(items, 'series'),
  },
  items,
}

await fs.writeFile(outputPath, `${JSON.stringify(generated, null, 2)}\n`, 'utf8')
console.log(`Generated ${path.relative(process.cwd(), outputPath)} from ${items.length} release rows.`)
