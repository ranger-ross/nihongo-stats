import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'


const bunProApiBaseUrl = 'https://bunpro.jp/api';


// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/bunProApi': {
        target: bunProApiBaseUrl,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/bunProApi/, '')
      }
    }
  }
})
