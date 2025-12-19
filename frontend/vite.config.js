import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const isDev = process.env.NODE_ENV === 'development'

// Load SSL certificates if they exist
const sslDir = path.join(__dirname, '..', 'ssl')
const certFile = path.join(sslDir, 'itc.in.th.crt')
const keyFile = path.join(sslDir, 'itc.in.th.key')
const hasSSL = fs.existsSync(certFile) && fs.existsSync(keyFile)

const httpsConfig = hasSSL ? {
  cert: fs.readFileSync(certFile),
  key: fs.readFileSync(keyFile)
} : true

export default defineConfig({
  plugins: [react()],
  build: {
    // Force rebuild with new hash on each build
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
    port: isDev ? 3000 : 12443,
    open: isDev ? true : false,
    https: isDev ? false : httpsConfig
  },
  preview: {
    host: '0.0.0.0',
    port: 12443,
    open: false,
    https: httpsConfig,
    allowedHosts: [
      'localhost',
      '127.0.0.1',
      '172.16.0.22',
      'www.itc.in.th',
      'itc.in.th',
      'drive.itc.in.th',
      'drive.itc-group.co.th',
      'drive.refritech.co.th'
    ]
  }
})
