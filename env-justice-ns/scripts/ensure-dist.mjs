import { existsSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const indexHtml = join(root, 'dist', 'index.html')

if (existsSync(indexHtml)) {
  process.exit(0)
}

console.error('[env-justice-ns] dist/ missing — running npm run build …')
const result = spawnSync('npm', ['run', 'build'], {
  cwd: root,
  stdio: 'inherit',
  shell: true,
})
process.exit(result.status ?? 1)
