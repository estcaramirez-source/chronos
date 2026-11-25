// Pruebas de aceptación E2E (C5). En CI se ejecutan contra el contenedor de staging.
const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
    testDir: './e2e',
    timeout: 30000,
    retries: 0,
    workers: 1,
    reporter: [
        ['list'],
        ['json', { outputFile: 'reports/e2e-results.json' }],
        ['junit', { outputFile: 'reports/e2e-junit.xml' }],
        ['html', { outputFolder: 'reports/e2e-html', open: 'never' }]
    ],
    use: {
        baseURL: process.env.BASE_URL || 'http://localhost:8080',
        screenshot: 'on',
        trace: 'retain-on-failure'
    },
    projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }]
});
