import {defineConfig} from '@playwright/test';
import base from './playwright.config';
// Native review starts its own HTTP/WS server; no launcher/HMR server participates.
export default defineConfig({...base,webServer:undefined,testMatch:'tests/social/native-chat-ui.test.ts'});
