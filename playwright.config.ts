import { defineConfig } from '@playwright/test';
import { existsSync } from 'node:fs';
export default defineConfig({
  testDir: './tests', workers: 1, timeout: 45000,
  reporter: [['list'], ['json', { outputFile: process.env.QC_REPORT_PATH || 'test-results/qc-results.json' }], ['html', { open: 'never', outputFolder: process.env.QC_HTML_PATH || 'playwright-report' }]],
  use: { baseURL: 'http://127.0.0.1:3000', headless: true, screenshot: 'only-on-failure', trace: 'retain-on-failure',
    launchOptions: { executablePath: process.env.CHROMIUM_EXECUTABLE || (existsSync('/usr/bin/chromium') ? '/usr/bin/chromium' : undefined), args: ['--no-sandbox'] },
  },
  webServer: { command: 'npm run dev -- --port 3000', url: 'http://127.0.0.1:3000', reuseExistingServer: !process.env.CI },
});
