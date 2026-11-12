const assert = require('node:assert/strict');
const { spawn } = require('node:child_process');
const fs = require('node:fs');
const { gzipSync } = require('node:zlib');
const { build } = require('esbuild');
const { chromium, expect } = require('@playwright/test');
const { setOffline, syncNetworkState } = require('../helpers/network-state.cjs');

const dir = 'dist';
const disabledDir = 'test-results/snake-disabled-build';
const origin = 'http://127.0.0.1:4343';
const defaultOrigin = 'http://127.0.0.1:4344';
const evidence = 'test-results/snake-catalog';
const saveKey = 'snake-legend:r01-blockout:v1';
const storedClear = stars => ({
  version: 1,
  contentVersion: 'r01-10-v1',
  levels: { '1-1': { stars, bestTime: 30, bestScore: 300 } },
  secrets: [],
  receipts: [],
});

async function ready(url) {
  for (let tries = 0; tries < 80; tries++) {
    if (await fetch(url).then(response => response.ok).catch(() => false)) return;
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  throw new Error('Vite preview did not start at ' + url);
}

async function run() {
  const assets = JSON.parse(fs.readFileSync(dir + '/snake-offline-package.json', 'utf8'));
  const manifest = JSON.parse(fs.readFileSync(dir + '/.vite/manifest.json', 'utf8'));
  const [gameKey, game] = Object.entries(manifest).find(([key]) => key.endsWith('/SnakeLegendCatalog.tsx'));
  const entryKey = Object.keys(manifest).find(key => manifest[key].isEntry);
  const initial = new Set();
  const visit = key => {
    if (initial.has(key)) return;
    initial.add(key);
    for (const imported of manifest[key].imports ?? []) visit(imported);
  };
  visit(entryKey);
  assert(!initial.has(gameKey), 'Catalog game stays outside the initial JS graph');
  const initialGzip = [...initial].reduce((total, key) => total + gzipSync(fs.readFileSync(dir + '/' + manifest[key].file)).length, 0);
  assert(initialGzip <= 400 * 1024, 'Catalog launcher JS gzip budget');
  const chunkSizes = fs.readdirSync(dir + '/assets').filter(file => file.endsWith('.js')).map(file => fs.statSync(dir + '/assets/' + file).size);
  assert(Math.max(...chunkSizes) <= 500 * 1024, 'Catalog 500 KiB JS chunk budget');
  assert(assets.code.includes('/' + game.file));
  assert(game.css.every(file => assets.code.includes('/' + file)));
  assert.equal(assets.media.length, 20);
  for (const file of [...assets.code, ...assets.media]) assert(fs.statSync(dir + file).isFile(), file);
  for (const source of ['icon', 'banner']) {
    const art = manifest['src/preview/snake/art/' + source + '.webp'];
    assert(art && !fs.existsSync(disabledDir + '/' + art.file), 'Default build must exclude Snake ' + source);
  }
  assert.deepEqual(new Set(assets.media), new Set(game.assets.filter(file => file.startsWith('assets/snake-')).map(file => '/' + file)));
  assert(!fs.existsSync(disabledDir + '/snake-offline-package.json'));
  assert(!fs.readdirSync(disabledDir + '/assets').some(file => /SnakeLegend|^snake-/.test(file)));
  fs.mkdirSync(evidence, { recursive: true });

  const compiled = await build({ entryPoints: ['tests/auth/backend.ts'], bundle: true, format: 'esm', platform: 'node', write: false });
  const { mockSupabase } = await import('data:text/javascript;base64,' + Buffer.from(compiled.outputFiles[0].contents).toString('base64'));
  const servers = [
    ['production', '4343'],
    ['snake-disabled', '4344'],
  ].map(([mode, port]) => spawn(process.execPath, ['node_modules/vite/bin/vite.js', 'preview', '--mode', mode, '--host', '127.0.0.1', '--port', port, '--strictPort'], { stdio: 'ignore' }));
  let browser;
  try {
    await Promise.all([ready(origin), ready(defaultOrigin)]);
    browser = await chromium.launch({
      executablePath: process.env.CHROMIUM_EXECUTABLE || (fs.existsSync('/usr/bin/chromium') ? '/usr/bin/chromium' : undefined),
      args: ['--no-proxy-server', '--host-resolver-rules=MAP * ~NOTFOUND, EXCLUDE localhost, EXCLUDE 127.0.0.1'],
    });
    const production = await browser.newContext({ serviceWorkers: 'block' });
    await mockSupabase().install(production);
    const publicPage = await production.newPage();
    await publicPage.goto(defaultOrigin);
    await expect(publicPage.locator('#game-library')).toBeVisible();
    await expect(publicPage.locator('#game-card-snake-legend')).toHaveCount(0);
    await expect(publicPage.locator('#game-card-word-chain')).toBeVisible();
    await production.close();

    const context = await browser.newContext({ viewport: { width: 1280, height: 860 } });
    const auth = mockSupabase();
    const actor = {
      id: '00000000-0000-4000-8000-000000000123',
      email: 'snake-catalog@example.invalid',
      password: 'CatalogLocal123!',
      is_anonymous: false,
      confirmed: true,
      user_metadata: {},
    };
    auth.users.set(actor.id, actor);
    await auth.install(context);
    await context.addInitScript(() => {
      window.renderedSnakeArt = [];
      const original = CanvasRenderingContext2D.prototype.drawImage;
      CanvasRenderingContext2D.prototype.drawImage = function (image, ...args) {
        if (this.canvas.closest('.story-app') && typeof image.src === 'string' &&
            image.src.includes('/assets/snake-') && !window.renderedSnakeArt.includes(image.src)) {
          window.renderedSnakeArt.push(image.src);
        }
        return original.call(this, image, ...args);
      };
    });

    const page = await context.newPage();
    const errors = [];
    const requests = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('request', request => requests.push(request.url()));
    await page.goto(origin);
    await expect(page.locator('#game-library')).toBeVisible();
    await page.evaluate(async () => { await navigator.serviceWorker.ready; });
    await page.reload();
    await page.waitForFunction(() => !!navigator.serviceWorker.controller);

    const precacheUrls = await page.evaluate(async () => {
      const name = (await caches.keys()).find(key => key.startsWith('workbox-precache'));
      return name ? (await (await caches.open(name)).keys()).map(request => request.url) : [];
    });
    assert(precacheUrls.length > 0);
    assert(!precacheUrls.some(url => url.includes(game.file) || /\/assets\/snake-/.test(url)));

    const card = page.locator('#game-card-snake-legend');
    await expect(card).toHaveCount(1);
    await expect(page.locator('#game-card-word-chain')).toBeVisible();
    await card.scrollIntoViewIfNeeded();
    await expect(card.locator('img')).toBeVisible();
    await card.locator('img').evaluate(image => image.decode());
    await page.locator('#btn-fav-card-snake-legend').click();
    await expect(page.locator('#btn-fav-card-snake-legend')).toHaveAttribute('aria-pressed', 'true');
    await page.screenshot({ path: evidence + '/catalog-desktop.png' });
    await page.setViewportSize({ width: 390, height: 844 });
    await page.locator('#btn-detail-card-snake-legend').click();
    const detail = page.getByRole('dialog', { name: 'Rắn Săn Mồi' });
    await expect(detail).toBeVisible();
    await detail.locator('img').first().evaluate(image => image.decode());
    const download = detail.getByRole('button', { name: 'Tải gói chơi ngoại tuyến' });
    await expect(download).toBeVisible();
    assert(!requests.some(url => url.includes(game.file) || /\/assets\/snake-/.test(url)));
    await download.scrollIntoViewIfNeeded();
    await page.screenshot({ path: evidence + '/catalog-detail-mobile.png' });
    await page.evaluate(file => {
      const original = window.fetch.bind(window);
      window.fetch = (url, options) => {
        if (String(url) === file) {
          window.fetch = original;
          return Promise.resolve(new Response(null, { status: 503 }));
        }
        return original(url, options);
      };
    }, assets.media[0]);
    await download.click();
    await expect(detail.getByRole('status')).toContainText('Chưa tải xong gói');
    await download.click();
    await expect(detail.getByRole('status')).toHaveText('Đã lưu gói chơi ngoại tuyến.', { timeout: 30000 });
    const saved = await page.evaluate(async ({ code, media }) => {
      const has = async (name, files) => {
        const cache = await caches.open(name);
        return Promise.all(files.map(async file => (await cache.match(file))?.ok === true));
      };
      return [...await has('arcadex-offline-package-code-2.12.2', code), ...await has('arcadex-game-assets-2.12.2', media)];
    }, assets);
    assert(saved.every(Boolean), 'Offline download must persist every listed resource');

    await page.evaluate(({ key, value }) => localStorage.setItem(key, JSON.stringify(value)), { key: saveKey, value: storedClear([true, true, true]) });
    await setOffline(context, page, true);
    await page.reload({ waitUntil: 'domcontentloaded' });
    await syncNetworkState(page, true);
    assert.equal(await page.evaluate(async () => {
      try { return (await fetch('/__snake-offline-check?' + crypto.randomUUID(), { cache: 'no-store' })).ok; } catch { return false; }
    }), false);
    await expect(page.locator('#btn-fav-card-snake-legend')).toHaveAttribute('aria-pressed', 'true');
    await page.locator('#btn-play-snake-legend').click();
    await expect(page.locator('.snake-journey')).toBeVisible();
    await expect(page.locator('.journey-stars')).toHaveText('★ 3/30 sao');
    await expect(page.locator('[data-action=lab]')).toHaveCount(0);
    await page.locator('.snake-journey [data-level="0"]').click();
    await page.locator('.journey-play').click();
    await expect(page.locator('.story-app canvas')).toBeVisible();
    await expect(page.locator('[data-action=debug], [data-action=art]')).toHaveCount(0);
    await page.locator('.story-app .overlay [data-action="primary"]').click();
    await expect.poll(async () => parseFloat(await page.locator('.story-app .timer').innerText())).toBeGreaterThan(0);
    await page.waitForFunction(() => window.renderedSnakeArt.some(url => url.includes('snake-a1_master-')));
    for (const selector of ['.joystick', '.dash']) {
      assert(await page.locator(selector).evaluate(element => {
        const rect = element.getBoundingClientRect();
        return element.contains(document.elementFromPoint(rect.x + rect.width / 2, rect.y + rect.height / 2));
      }), 'Offline controls must remain reachable: ' + selector);
    }
    await page.screenshot({ path: evidence + '/catalog-offline-play.png' });
    await page.locator('.story-app [data-action="settings"]').click();
    await page.getByRole('checkbox', { name: 'Bật âm thanh' }).check();
    await page.getByRole('button', { name: 'Nghe thử' }).click();
    await expect(page.locator('.audio-status')).toContainText('Đã phát âm thử');
    await page.getByRole('button', { name: 'Xong' }).click();
    await page.locator('#btn-game-exit').click();
    await page.locator('#btn-exit-confirm').click();
    await expect(page.locator('#btn-play-recent-snake-legend')).toBeVisible();

    await setOffline(context, page, false);
    await page.setViewportSize({ width: 1280, height: 860 });
    await page.locator('#btn-header-profile').click();
    await page.locator('#btn-profile-login').click();
    await page.locator('#input-login-identifier').fill(actor.email);
    await page.locator('#input-login-password').fill(actor.password);
    await page.locator('#btn-submit-login').click();
    await expect(page.locator('#game-library')).toBeVisible();
    const scopedKey = 'snake-legend:account:' + actor.id + ':' + saveKey;
    await page.evaluate(({ key, value }) => localStorage.setItem(key, JSON.stringify(value)), { key: scopedKey, value: storedClear([true, true, false]) });
    await page.locator('#btn-play-snake-legend').click();
    await expect(page.locator('.journey-stars')).toHaveText('★ 2/30 sao');
    await page.locator('#btn-game-exit').click();
    await page.locator('#btn-exit-confirm').click();
    await page.locator('#btn-header-profile').click();
    await page.locator('#btn-logout-profile').click();
    await page.locator('#btn-play-snake-legend').click();
    await expect(page.locator('.journey-stars')).toHaveText('★ 3/30 sao');
    assert(!requests.some(url => url.includes('/functions/v1/snake-complete')));
    assert.deepEqual(errors, []);

    const report = { status: 'PASS', initialGzip, maxChunk: Math.max(...chunkSizes), gameBytes: fs.statSync(dir + '/' + game.file).size,
      codeFiles: assets.code.length, mediaFiles: assets.media.length, checks: ['rollback catalog excludes Snake', 'card/favorite/detail/art', 'retry failed package then real offline reload/play/audio', 'recent/exit', 'guest/account save isolation'] };
    fs.writeFileSync(evidence + '/catalog-report.json', JSON.stringify(report, null, 2) + '\n');
    console.log(JSON.stringify(report));
  } finally {
    await browser?.close();
    servers.forEach(server => server.kill());
  }
}

run().catch(error => { console.error(error); process.exitCode = 1; });
