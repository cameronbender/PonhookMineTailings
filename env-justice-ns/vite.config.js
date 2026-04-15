import { copyFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const __dirname = dirname(fileURLToPath(import.meta.url))

// https://vite.dev/config/
// Production builds must use "/" so assets and fetch("/api/content") work on Vercel, Render,
// and local `vite build` (NODE_ENV=production) even when host env vars are unset at build time.
// Override with VITE_BASE for GitHub Pages project sites (e.g. "/repo-name/").
export default defineConfig({
  base: process.env.VITE_BASE ?? (process.env.NODE_ENV === 'production' ? '/' : './'),
  plugins: [
    react(),
    {
      name: 'copy-index-to-404',
      closeBundle() {
        const dist = join(__dirname, 'dist')
        try {
          copyFileSync(join(dist, 'index.html'), join(dist, '404.html'))
        } catch {
          /* dist may be empty on failed build */
        }
      },
    },
  ],
  server: {
    fs: { allow: ['.', '..'] },
    proxy: {
      '/api': { target: 'http://localhost:3782', changeOrigin: true },
    },
  },
})
