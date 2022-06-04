import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import checker from 'vite-plugin-checker'

// Set timezone to UTC so unit tests are predicable regardless of timezone.
process.env.TZ = 'UTC'

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
    },
    test: {
        include: ["src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts}"],
        environment: "jsdom",
    }
})
