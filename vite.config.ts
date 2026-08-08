import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'node:url'

// Замените 'kopir' на точное имя вашего GitHub-репозитория.
// Если сайт будет на username.github.io (репозиторий называется именно так)
// или на своём домене — поставьте base: '/'.
const REPO_NAME = 'AITK-Fest-2026_Hackathon'

export default defineConfig({
  base: process.env.NODE_ENV === 'production' ? `/${REPO_NAME}/` : '/',
  plugins: [react()],
  server: {
    port: 5173,
    open: true
  },
  build: {
    rollupOptions: {
      input: {
        main: fileURLToPath(new URL('./index.html', import.meta.url)),
        check: fileURLToPath(new URL('./check.html', import.meta.url)),
        dashboard: fileURLToPath(new URL('./dashboard.html', import.meta.url))
      }
    }
  }
})

