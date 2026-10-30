// Checks the AGENTS.md modal frame on a production build: launcher content modals fill the
// screen on phones and use the fixed 92vh (max 900px) / 4xl–5xl frame on larger screens, and
// switching tabs never resizes the frame; also an in-game modal (Mummy Escape map). Forbids the
// small bottom-sheet patterns in source.
// Usage: npm run build && node tests/ux/modal-frame.cjs [--outDir=DIR]
const { chromium } = require('playwright');
const { spawn } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');

const PORT = 4323;
const outDir = process.argv.find(a => a.startsWith('--outDir='))?.split('=')[1];

// Source policy: content modals use AppModal / the shared frame classes, never ad-hoc short sheets.
function sourcePolicy() {
  const offenders = [];
  const walk = dir => {
    for (const d of fs.readdirSync(dir, { withFileTypes: true })) {
      const f = path.join(dir, d.name);
      if (d.isDirectory()) walk(f);
      else if (/\.tsx$/.test(f)) fs.readFileSync(f, 'utf8').split('\n').forEach((line, i) => {
        if (/max-h-\[(?:[1-8]\d)vh\]|\bh-\[(?:[1-8]\d)vh\]/.test(line)) offenders.push(`${f}:${i + 1}`);
      });
    }
  };
  walk('src');
  assert.deepEqual(offenders, [], 'short modal sheets (max-h/h below 90vh) found; use AppModal');
  console.log('PASS no short modal sheets (h/max-h < 90vh) in src');
}

const viewports = [
  { name: 'phone', width: 390, height: 844 },
  { name: 'tablet', width: 820, height: 1100 },
  { name: 'desktop', width: 1440, height: 900 },
];
const panels = [
  { name: 'settings', open: page => page.getByRole('button', { name: 'Cài đặt', exact: true }).click() },
  { name: 'game detail', open: page => page.locator('#btn-detail-card-tile-2048').click() },
  { name: 'profile', open: page => page.evaluate(() => window.dispatchEvent(new CustomEvent('arcadex:open_modal', { detail: { modal: 'profile' } }))) },
  { name: 'leaderboard', open: page => page.evaluate(() => window.dispatchEvent(new CustomEvent('arcadex:open_modal', { detail: { modal: 'leaderboard' } }))) },
  { name: 'pvp history', open: page => page.evaluate(() => window.dispatchEvent(new CustomEvent('arcadex:open_modal', { detail: { modal: 'pvpHistory' } }))) },
  { name: 'community', open: page => page.evaluate(() => window.dispatchEvent(new CustomEvent('arcadex:open_modal', { detail: { modal: 'friends' } }))), tabs: true },
];

// In a running game the frame sits below the game header (48 px, 56 px from sm) and fits the rest.
function expectFrame(box, vp, label, inGame = false) {
  const header = inGame ? (vp.width < 640 ? 48 : 56) : 0;
  if (vp.width < 640) {
    assert.ok(Math.abs(box.width - vp.width) <= 2 && Math.abs(box.height - (vp.height - header)) <= 2, `${label}: ${box.width}x${box.height} should fill ${vp.width}x${vp.height - header}`);
    return;
  }
  const maxWidth = vp.width >= 1024 ? 1024 : 896;
  const pad = vp.width >= 1024 ? 24 : 16;
  const height = Math.min(vp.height * 0.92, 900, inGame ? vp.height - header - 2 * pad : Infinity);
  assert.ok(Math.abs(box.height - height) <= 2, `${label}: height ${box.height}, expected ${height}`);
  assert.ok(box.width <= maxWidth + 2 && box.width >= Math.min(maxWidth, vp.width - 48) - 2, `${label}: width ${box.width}, expected up to ${maxWidth}`);
}

(async () => {
  sourcePolicy();
  const server = spawn(process.execPath, [path.join(__dirname, '../../node_modules/vite/bin/vite.js'), 'preview', '--port', String(PORT), '--strictPort', ...(outDir ? ['--outDir', outDir] : [])], { stdio: 'pipe' });
  let ready = false;
  server.stdout.on('data', d => { if (String(d).includes(String(PORT))) ready = true; });
  for (let i = 0; i < 100 && !ready; i++) await new Promise(r => setTimeout(r, 200));
  const executablePath = process.env.CHROMIUM_EXECUTABLE || ['/usr/bin/chromium', '/opt/pw-browsers/chromium'].find(fs.existsSync);
  const browser = await chromium.launch({ executablePath, args: ['--no-sandbox'] });
  let checks = 1;
  try {
    for (const vp of viewports) {
      const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } });
      await page.goto(`http://127.0.0.1:${PORT}/`, { waitUntil: 'networkidle' });
      await page.locator('#game-library').waitFor({ timeout: 15000 });
      for (const panel of panels) {
        await panel.open(page);
        const dialog = page.locator('[role="dialog"][aria-modal="true"]').last();
        await dialog.waitFor({ timeout: 10000 });
        await page.waitForTimeout(400); // let entry animations settle
        const box = await dialog.boundingBox();
        expectFrame(box, vp, `${vp.name} ${panel.name}`);
        if (panel.tabs) {
          for (const tab of await dialog.getByRole('tab').all()) {
            await tab.click();
            await page.waitForTimeout(150);
            const after = await dialog.boundingBox();
            assert.ok(Math.abs(after.width - box.width) <= 1 && Math.abs(after.height - box.height) <= 1, `${vp.name} ${panel.name}: tab "${await tab.innerText()}" resized the frame`);
          }
        }
        await page.keyboard.press('Escape');
        await dialog.waitFor({ state: 'hidden', timeout: 5000 });
        checks++;
        console.log(`PASS ${vp.name} ${panel.name} ${Math.round(box.width)}x${Math.round(box.height)}${panel.tabs ? ' (stable across tabs)' : ''}`);
      }
      // An in-game content modal: Mummy Escape's pyramid map (formerly a max-h-[85vh] sheet).
      await page.locator('#btn-play-mummy-escape').click();
      const enter = page.getByRole('button', { name: /Bước Vào Lăng Mộ/i });
      await enter.waitFor({ timeout: 30000 });
      await enter.click();
      const map = page.locator('#btn-mummy-world-map');
      await map.waitFor({ timeout: 10000 });
      await map.click();
      const sheet = page.getByRole('dialog', { name: 'Bản đồ kim tự tháp' });
      await sheet.waitFor({ timeout: 10000 });
      expectFrame(await sheet.boundingBox(), vp, `${vp.name} mummy map`, true);
      await page.keyboard.press('Escape');
      await sheet.waitFor({ state: 'hidden', timeout: 5000 });
      checks++;
      console.log(`PASS ${vp.name} mummy-escape pyramid map`);
      await page.close();
    }
    console.log(`modal frame: ${checks} checks passed`);
  } catch (e) {
    console.error('FAIL:', e.message.split('\n')[0]);
    process.exitCode = 1;
  } finally {
    await browser.close();
    server.kill();
  }
})();
