import { defineConfig } from '@playwright/test';
import catalog from './playwright.hosting.config';

export default defineConfig({
  ...catalog,
  testMatch: '**/snake/catalog-player.browser.ts',
});
