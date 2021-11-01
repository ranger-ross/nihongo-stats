import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const apiBase = 'https://bunpro.jp/api';
// const apiBase = 'https://jsonplaceholder.typicode.com';


// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: apiBase,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  }
})
