import { defineConfig } from '@playwright/test';
// Pure-logic Blossom suites (engine, levels, save): no web server and no browser, so they
// run inside `npm run test:fast`. The browser suites use the root playwright.config.ts.
export default defineConfig({
  testDir: '.',
  testMatch: ['engine.test.ts'],
  workers: 1,
  reporter: 'list',
  outputDir: '../../test-results/blossom-unit',
});
