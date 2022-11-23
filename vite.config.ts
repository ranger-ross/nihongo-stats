import {defineConfig} from 'vitest/config'
import react from '@vitejs/plugin-react'
import checker from 'vite-plugin-checker'

// Set timezone to UTC so unit tests are predicable regardless of timezone.
process.env.TZ = 'UTC'

let appVersion = process.env.APP_VERSION;
if (!appVersion) {
    appVersion = 'local-dev';
}
console.log(`Using ${appVersion} as the app version`)

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
    define: {
        APP_VERSION: JSON.stringify(appVersion),
    },
    esbuild: {
        legalComments: 'none'
    },
    test: {
        include: ["src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts}"],
        environment: "jsdom",
    }
})
