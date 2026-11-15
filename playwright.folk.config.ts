import {defineConfig} from '@playwright/test';
import base from './playwright.config';
export default defineConfig({
 ...base,
 testMatch:'**/folk-duel/*.browser.ts',
 use:{...base.use,baseURL:'http://127.0.0.1:4370'},
 webServer:{command:'npm run dev -- --mode folk-preview --port 4370 --strictPort',url:'http://127.0.0.1:4370',reuseExistingServer:false},
});
