import {defineConfig} from '@playwright/test';
import base from '../../playwright.config';
const appServer = Array.isArray(base.webServer) ? base.webServer[0] : {};
const rawServers = Array.isArray(base.webServer) ? base.webServer.slice(1) : [];
export default defineConfig({...base,testDir:'..',outputDir:'../../test-results/tank-release',use:{...base.use,baseURL:'http://127.0.0.1:3010'},webServer:[{...appServer,command:'npm run dev -- --port 3010 --strictPort',url:'http://127.0.0.1:3010',reuseExistingServer:false},...rawServers]});
