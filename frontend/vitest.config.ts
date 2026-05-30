import { defineConfig } from 'vitest/config'
import { fileURLToPath, URL } from 'node:url'

// Kept separate from vite.config.ts so the Vite 8 plugin types don't clash with
// the Vite version Vitest bundles. Vitest transforms JSX via esbuild, so the
// React plugin isn't needed here.
export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    css: true,
  },
})
