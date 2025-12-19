import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        entryFileNames: `assets/[name]-[hash].js`,
        chunkFileNames: `assets/[name]-[hash].js`,
        assetFileNames: `assets/[name]-[hash][extname]`
      }
    }
  },
  server: {
    host: '0.0.0.0',
    port: 2095,
    open: false,
    proxy: {
      '/api': {
        target: 'http://localhost:2086',
        changeOrigin: true
      }
    }
  },
  preview: {
    host: '0.0.0.0',
    port: 2096,
    open: false
  }
})
