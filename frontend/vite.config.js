import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const isDev = process.env.NODE_ENV === 'development'

export default defineConfig({
  plugins: [react()],
  server: {
    port: isDev ? 3000 : 12443,
    open: isDev ? true : false,
    https: false
  },
  preview: {
    port: 12443,
    open: false,
    https: false
  }
})
