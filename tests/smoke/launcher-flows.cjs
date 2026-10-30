// Browser smoke test for the launcher flows wired through GameContext: favorites, game
// detail, settings audio toggles, community chat, launching/exiting a game, Word Cross
// loading its lexicon file and the recently played row. Runs against a production build served by `vite preview`.
// Usage: npm run build && node tests/smoke/launcher-flows.cjs [--outDir=DIR]
const { chromium } = require('playwright');
const { spawn } = require('node:child_process');
const { existsSync } = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');

const PORT = 4320;
const outDir = process.argv.find(a => a.startsWith('--outDir='))?.split('=')[1];

(async () => {
  const server = spawn(process.execPath, [path.join(__dirname, '../../node_modules/vite/bin/vite.js'), 'preview', '--port', String(PORT), '--strictPort', ...(outDir ? ['--outDir', outDir] : [])], { stdio: 'pipe' });
  let ready = false;
  server.stdout.on('data', d => { if (String(d).includes(String(PORT))) ready = true; });
  for (let i = 0; i < 100 && !ready; i++) await new Promise(r => setTimeout(r, 200));
  const executablePath = process.env.CHROMIUM_EXECUTABLE || ['/usr/bin/chromium', '/opt/pw-browsers/chromium'].find(existsSync);
  const browser = await chromium.launch({ executablePath, args: ['--no-sandbox'] });
  const errors = [];
  let passed = 0;
  const check = async (name, fn) => { await fn(); passed++; console.log('PASS ' + name); };
  try {
    const page = await browser.newPage({ viewport: { width: 1280, height: 860 } });
    page.on('pageerror', e => errors.push(String(e)));
    await page.goto(`http://127.0.0.1:${PORT}/`, { waitUntil: 'networkidle' });
    await page.locator('#game-library').waitFor({ timeout: 15000 });

    await check('favorite toggles from the card and shows in the Yêu thích filter', async () => {
      await page.locator('#btn-fav-card-tile-2048').click();
      await page.locator('#btn-fav-card-tile-2048[aria-label^="Bỏ yêu thích"]').waitFor();
      await page.locator('#btn-filter-yêu-thích').click();
      await page.locator('#game-card-tile-2048').waitFor();
      assert.equal(await page.locator('[id^="game-card-"]').count(), 1);
      await page.locator('#btn-filter-tất-cả').click();
    });

    await check('game detail opens, reflects favorite state and closes', async () => {
      await page.locator('#btn-detail-card-tile-2048').click();
      await page.locator('#game-detail-modal-overlay').waitFor();
      const fav = await page.locator('#btn-detail-favorite').getAttribute('aria-pressed') ?? await page.locator('#btn-detail-favorite').innerText();
      assert.ok(fav, 'favorite control present');
      await page.keyboard.press('Escape');
      await page.locator('#game-detail-modal-overlay').waitFor({ state: 'detached' });
    });

    await check('settings toggles game sound and keeps the choice after reopening', async () => {
      await page.getByRole('button', { name: 'Cài đặt', exact: true }).click();
      await page.locator('#settings-modal-overlay').waitFor();
      const sound = page.getByRole('switch', { name: 'Hiệu ứng game' }).or(page.locator('#btn-settings-toggle-sound')).first();
      const before = await sound.getAttribute('aria-checked') ?? await sound.getAttribute('aria-pressed');
      await sound.click();
      const after = await sound.getAttribute('aria-checked') ?? await sound.getAttribute('aria-pressed');
      assert.notEqual(after, before, 'sound toggle changes state');
      await page.getByRole('button', { name: 'Đóng cài đặt' }).click();
      await page.locator('#settings-modal-overlay').waitFor({ state: 'detached' });
      await page.getByRole('button', { name: 'Cài đặt', exact: true }).click();
      const reopened = await sound.getAttribute('aria-checked') ?? await sound.getAttribute('aria-pressed');
      assert.equal(reopened, after, 'sound choice persists');
      await sound.click();
      await page.getByRole('button', { name: 'Đóng cài đặt' }).click();
    });

    await check('community chat opens from the header and closes', async () => {
      await page.getByRole('button', { name: 'Mở cộng đồng, chat và bạn bè' }).click();
      const dialog = page.getByRole('dialog').last();
      await dialog.waitFor();
      await page.keyboard.press('Escape');
      await dialog.waitFor({ state: 'hidden' });
    });

    await check('launching a game shows the game frame and exiting returns to the library', async () => {
      await page.locator('#btn-play-tile-2048').click();
      await page.locator('#btn-game-exit').waitFor({ timeout: 20000 });
      assert.equal(await page.locator('#game-library').count(), 0, 'library hidden while playing');
      await page.locator('#btn-game-exit').click();
      const confirm = page.locator('#btn-exit-confirm');
      if (await confirm.isVisible().catch(() => false)) await confirm.click();
      await page.locator('#game-library').waitFor({ timeout: 15000 });
    });

    await check('Word Cross loads its lexicon file before showing the level map', async () => {
      await page.locator('#btn-play-word-cross').click();
      const count = page.getByText(/từ tiếng Anh offline/).first();
      await count.waitFor({ timeout: 20000 });
      const words = Number((await count.innerText()).match(/([\d.,]+)\s*từ tiếng Anh/)[1].replace(/[.,]/g, ''));
      assert.ok(words > 10000, `lexicon loaded (${words} words)`);
      await page.locator('#btn-game-exit').click();
      const confirm = page.locator('#btn-exit-confirm');
      if (await confirm.isVisible().catch(() => false)) await confirm.click();
      await page.locator('#game-library').waitFor({ timeout: 15000 });
    });

    await check('recently played lists the game that was just played', async () => {
      await page.locator('#btn-play-recent-tile-2048').waitFor({ timeout: 5000 });
    });

    assert.deepEqual(errors, [], 'no uncaught page errors');
    console.log(`launcher smoke: ${passed} flows passed`);
  } catch (e) {
    console.error('FAIL after ' + passed + ' flows:', e.message);
    if (errors.length) console.error('page errors:', errors);
    process.exitCode = 1;
  } finally {
    await browser.close();
    server.kill();
  }
})();
