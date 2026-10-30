// Launches every registered game from the launcher on a production build: the game frame must
// appear, the game must render content inside the stage, no uncaught page error may occur while
// it runs and receives taps/keys for a few seconds, and exiting must return to the library.
// Usage: npm run build && node tests/smoke/all-games.cjs [--outDir=DIR] [--only=id,id]
const { chromium } = require('playwright');
const { spawn } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const PORT = 4324;
const outDir = process.argv.find(a => a.startsWith('--outDir='))?.split('=')[1];
const only = process.argv.find(a => a.startsWith('--only='))?.split('=')[1]?.split(',');

(async () => {
  const server = spawn(process.execPath, [path.join(__dirname, '../../node_modules/vite/bin/vite.js'), 'preview', '--port', String(PORT), '--strictPort', ...(outDir ? ['--outDir', outDir] : [])], { stdio: 'pipe' });
  let ready = false;
  server.stdout.on('data', d => { if (String(d).includes(String(PORT))) ready = true; });
  for (let i = 0; i < 100 && !ready; i++) await new Promise(r => setTimeout(r, 200));
  const executablePath = process.env.CHROMIUM_EXECUTABLE || ['/usr/bin/chromium', '/opt/pw-browsers/chromium'].find(fs.existsSync);
  const browser = await chromium.launch({ executablePath, args: ['--no-sandbox', '--autoplay-policy=no-user-gesture-required'] });
  const failures = [];
  let passed = 0;
  try {
    const page = await browser.newPage({ viewport: { width: 1280, height: 860 } });
    const errors = [];
    page.on('pageerror', e => errors.push(String(e).split('\n')[0]));
    await page.goto(`http://127.0.0.1:${PORT}/`, { waitUntil: 'networkidle' });
    await page.locator('#game-library').waitFor({ timeout: 15000 });
    const ids = (await page.locator('[id^="btn-play-"]:not([id^="btn-play-ai-"]):not([id^="btn-play-recent-"])').evaluateAll(els => els.map(e => e.id.slice('btn-play-'.length))))
      .filter(id => !only || only.includes(id));
    for (const id of ids) {
      errors.length = 0;
      const started = Date.now();
      try {
        await page.locator(`#btn-play-${id}`).click();
        await page.locator(`#game-wrapper-viewport[data-game="${id}"]`).waitFor({ timeout: 20000 });
        // Wait until the game (not the loading fallback) has put content into the stage.
        await page.waitForFunction(() => {
          const stage = document.querySelector('#game-viewport-stage');
          if (!stage || stage.querySelector('[role="status"]')?.textContent?.includes('Đang tải')) return false;
          return stage.querySelectorAll('*').length > 10 || !!stage.querySelector('canvas,iframe');
        }, null, { timeout: 30000 });
        // Generic play input: taps on the stage and the common keys, so game loops and input
        // handlers actually run before the checks.
        const stage = await page.locator('#game-viewport-stage').boundingBox();
        for (const [fx, fy] of [[0.5, 0.5], [0.3, 0.6], [0.7, 0.4]]) {
          await page.mouse.click(stage.x + stage.width * fx, stage.y + stage.height * fy);
          await page.waitForTimeout(250);
        }
        for (const key of ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Space', 'Enter']) {
          await page.keyboard.press(key);
          await page.waitForTimeout(120);
        }
        await page.waitForTimeout(2000);
        const crashed = await page.locator('#game-viewport-stage').getByText(/Đã xảy ra lỗi|Something went wrong|Không tải được game/i).count();
        if (crashed) throw new Error('game shows an error screen');
        if (errors.length) throw new Error('page error: ' + errors[0]);
        // A tap may start a game's own fullscreen mode (Neon Run); leave it like a player would.
        await page.evaluate(() => document.fullscreenElement && document.exitFullscreen()).catch(() => {});
        await page.locator('#btn-game-exit').click();
        const confirm = page.locator('#btn-exit-confirm');
        if (await confirm.isVisible().catch(() => false)) await confirm.click();
        await page.locator('#game-library').waitFor({ timeout: 15000 });
        passed++;
        console.log(`PASS ${id} (${((Date.now() - started) / 1000).toFixed(1)}s)`);
      } catch (e) {
        failures.push(`${id}: ${e.message.split('\n')[0]}`);
        console.log(`FAIL ${id}: ${e.message.split('\n')[0]}`);
        await page.goto(`http://127.0.0.1:${PORT}/`, { waitUntil: 'networkidle' });
        await page.locator('#game-library').waitFor({ timeout: 15000 });
      }
    }
    console.log(`all games: ${passed}/${ids.length} launched and exited cleanly`);
    if (!ids.length || failures.length) process.exitCode = 1;
  } finally {
    await browser.close();
    server.kill();
  }
})();
