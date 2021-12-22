export default {
    preset: 'vite-jest',

    setupFilesAfterEnv: ['<rootDir>/test.config.js'],
    testMatch: [
        '<rootDir>/src/**/__tests__/**/*.{js,jsx,ts,tsx}',
        '<rootDir>/src/**/*.{spec,test}.{js,jsx,ts,tsx}',
    ],
    testEnvironment: 'jest-environment-jsdom'
}