import {defineConfig} from 'vite'
import react from '@vitejs/plugin-react'
import checker from 'vite-plugin-checker'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        react({
            fastRefresh: process.env.NODE_ENV !== 'test'
        }),
        checker({
            typescript: true
        })
    ],
    server: {
        watch: {
            usePolling: true
        }
    },
    esbuild: {
        legalComments: 'none'
    }
})
