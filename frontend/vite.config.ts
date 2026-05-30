import { defineConfig } from 'vite'
import { fileURLToPath, URL } from 'node:url'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// The backend issues an HTTP-only JWT cookie. Proxying /api keeps the browser
// on a single origin in development, so the cookie is sent without any CORS
// or SameSite friction. Test configuration lives in vitest.config.ts.
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
      // Locally stored uploads (e.g. avatars) are served by the backend; proxy
      // them so image URLs like /uploads/avatars/<id>.png resolve in dev.
      '/uploads': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
})
