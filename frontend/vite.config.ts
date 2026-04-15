import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'

// En Docker el backend se llama "backend"; fuera de Docker es localhost
const apiTarget = process.env.VITE_API_URL || 'http://localhost:8080'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  server: {
    port: 5173,
    host: true,
    proxy: {
      '/api': {
        target: apiTarget,
        changeOrigin: true
      }
    }
  }
})
