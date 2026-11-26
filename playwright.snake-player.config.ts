import { defineConfig } from '@playwright/test';
import catalog from './playwright.hosting.config';

export default defineConfig({
  ...catalog,
  testMatch: ['**/snake/catalog-player.browser.ts','**/snake/content.browser.ts','**/snake/trials.browser.ts','**/snake/campaign-chapters.browser.ts'],
});
