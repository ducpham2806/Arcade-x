// Offline check for the launcher shell: after the service worker precaches, the launcher must
// reload with the network off and still open the lazily loaded panels (settings, game detail)
// and a game played once online (Word Cross, including its separately served lexicon).
// Usage: npm run build && node tests/smoke/offline-shell.cjs [--outDir=DIR]
const { chromium } = require('playwright');
const { spawn } = require('node:child_process');
const { existsSync } = require('node:fs');
const path = require('node:path');

const PORT = 4322;
const outDir = process.argv.find(a => a.startsWith('--outDir='))?.split('=')[1];

(async () => {
  const server = spawn(process.execPath, [path.join(__dirname, '../../node_modules/vite/bin/vite.js'), 'preview', '--port', String(PORT), '--strictPort', ...(outDir ? ['--outDir', outDir] : [])], { stdio: 'pipe' });
  let ready = false;
  server.stdout.on('data', d => { if (String(d).includes(String(PORT))) ready = true; });
  for (let i = 0; i < 100 && !ready; i++) await new Promise(r => setTimeout(r, 200));
  const executablePath = process.env.CHROMIUM_EXECUTABLE || ['/usr/bin/chromium', '/opt/pw-browsers/chromium'].find(existsSync);
  const browser = await chromium.launch({ executablePath, args: ['--no-sandbox'] });
  try {
    const context = await browser.newContext({ viewport: { width: 1280, height: 860 } });
    const page = await context.newPage();
    await page.goto(`http://127.0.0.1:${PORT}/`, { waitUntil: 'networkidle' });
    await page.locator('#game-library').waitFor({ timeout: 15000 });
    // Wait until the precache holds the lazily loaded settings panel.
    await page.waitForFunction(async () => {
      await navigator.serviceWorker.ready;
      for (const key of await caches.keys()) {
        if (!key.includes('precache')) continue;
        const urls = (await (await caches.open(key)).keys()).map(r => r.url);
        if (urls.some(u => u.includes('/assets/SettingsModal-'))) return true;
      }
      return false;
    }, null, { timeout: 30000, polling: 500 });
    const exitGame = async () => {
      await page.locator('#btn-game-exit').click();
      const confirm = page.locator('#btn-exit-confirm');
      if (await confirm.isVisible().catch(() => false)) await confirm.click();
      await page.locator('#game-library').waitFor({ timeout: 15000 });
    };
    const wordCount = async () => {
      const label = page.getByText(/từ tiếng Anh offline/).first();
      await label.waitFor({ timeout: 20000 });
      return Number((await label.innerText()).match(/([\d.,]+)\s*từ tiếng Anh/)[1].replace(/[.,]/g, ''));
    };
    // A first visit is not yet controlled by the service worker; reload so it is (as on any
    // later visit), then play Word Cross once online so its package (JS + lexicon) is cached.
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForFunction(() => !!navigator.serviceWorker.controller, null, { timeout: 15000 });
    await page.locator('#game-library').waitFor({ timeout: 15000 });
    await page.locator('#btn-play-word-cross').click();
    if (!(await wordCount() > 10000)) throw new Error('lexicon missing online');
    await exitGame();
    await page.waitForTimeout(1500);
    await context.setOffline(true);
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.locator('#game-library').waitFor({ timeout: 15000 });
    console.log('PASS launcher reloads offline');
    await page.getByRole('button', { name: 'Cài đặt', exact: true }).click();
    await page.locator('#settings-modal-overlay').waitFor({ timeout: 10000 });
    await page.getByRole('button', { name: 'Đóng cài đặt' }).click();
    console.log('PASS settings opens offline');
    await page.locator('#btn-detail-card-tile-2048').click();
    await page.locator('#game-detail-modal-overlay').waitFor({ timeout: 10000 });
    await page.keyboard.press('Escape');
    console.log('PASS game detail opens offline');
    await page.locator('#btn-play-word-cross').click();
    if (!(await wordCount() > 10000)) throw new Error('lexicon missing offline');
    console.log('PASS Word Cross starts offline with its lexicon');
    console.log('offline shell: 4 checks passed');
  } catch (e) {
    console.error('FAIL:', e.message.split('\n')[0]);
    process.exitCode = 1;
  } finally {
    await browser.close();
    server.kill();
  }
})();
