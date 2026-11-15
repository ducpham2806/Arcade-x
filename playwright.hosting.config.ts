import { defineConfig } from '@playwright/test';
import base from './playwright.config';

// The catalog route is opt-in in dev. Keep this dedicated suite out of generic
// test discovery so it cannot silently run against the default catalog mode.
export default defineConfig({
  ...base,
  testMatch: '**/ux/hosting-safe-area.browser.ts',
  use: { ...base.use, baseURL: 'http://127.0.0.1:4360' },
  webServer: {
    command: 'npm run dev -- --mode snake-catalog --port 4360 --strictPort',
    url: 'http://127.0.0.1:4360',
    reuseExistingServer: false,
  },
});
