const assert = require('node:assert/strict');
const { build } = require('esbuild');
const { expect } = require('@playwright/test');

module.exports = async function checkPreviewMedia(browser, origin, evidence) {
  const result = await build({
    entryPoints: ['tests/snake/ui-fixture.ts'],
    bundle: true,
    format: 'esm',
    platform: 'node',
    write: false,
  });
  const { snakeUiFixture } = await import('data:text/javascript;base64,' + Buffer.from(result.outputFiles[0].contents).toString('base64'));
  const fixture = await snakeUiFixture();
  const user = fixture.user('AssetQA');
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 }, serviceWorkers: 'block' });
  await fixture.install(context);

  let releaseArt, releaseAudio;
  const art = new Promise(resolve => { releaseArt = resolve; });
  const audio = new Promise(resolve => { releaseAudio = resolve; });
  const requests = [];
  let holdAudio = false;
  let failSound = true;
  await context.route(url => url.origin === origin && /\/assets\/snake-/.test(url.pathname), async route => {
    const file = new URL(route.request().url()).pathname.split('/').at(-1);
    requests.push(file);
    if (/\.(png|webp)$/.test(file)) await art;
    if (file.endsWith('.wav') && holdAudio) await audio;
    if (file.startsWith('snake-sfx_dash_air-') && failSound) {
      failSound = false;
      await route.fulfill({ status: 503 });
    } else {
      await route.continue().catch(() => {}); // The client may abort before the route is released.
    }
  });
  await context.addInitScript(() => {
    const status = window.snakeMediaProbe = { drawn: [], fallback: [], aborted: 0 };
    const canvas = CanvasRenderingContext2D.prototype;
    const drawImage = canvas.drawImage;
    canvas.drawImage = function (image, ...args) {
      if (this.canvas.closest('.story-app') && /\/assets\/snake-/.test(image.src ?? '') && !status.drawn.includes(image.src)) {
        status.drawn.push(image.src);
      }
      return drawImage.call(this, image, ...args);
    };
    const fill = canvas.fill;
    canvas.fill = function (...args) {
      if (this.canvas.closest('.story-app') && ['#1b6049', '#bd473e'].includes(this.fillStyle) && !status.fallback.includes(this.fillStyle)) {
        status.fallback.push(this.fillStyle);
      }
      return fill.apply(this, args);
    };
    const fetchResource = window.fetch.bind(window);
    window.fetch = (url, options) => {
      if (/\/assets\/snake-.*\.wav$/.test(String(url))) {
        options?.signal?.addEventListener('abort', () => status.aborted++, { once: true });
      }
      return fetchResource(url, options);
    };
  });

  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  async function openStory() {
    await page.getByRole('button', { name: 'Chơi bản preview' }).click();
    await expect(page.locator('.snake-journey')).toBeVisible();
    assert.deepEqual(requests.filter(file => !file.endsWith('.wav')), [], 'Journey must not request gameplay art');
    await page.locator('.journey-play').click();
    await expect(page.locator('.story-app canvas')).toBeVisible();
  }
  const wavRequests = () => requests.filter(file => file.endsWith('.wav'));
  const settings = page.locator('.story-app [role="dialog"]');
  const sound = settings.getByRole('checkbox', { name: 'Bật âm thanh' });
  const exit = async () => {
    await page.locator('#btn-game-exit').click();
    await page.locator('#btn-exit-confirm').click();
    await expect(page.getByRole('button', { name: 'Chơi bản preview' })).toBeVisible();
  };

  try {
    await page.goto(origin + '/preview/snake/');
    await page.getByRole('button', { name: 'Đăng nhập để chơi thử' }).click();
    await page.locator('#input-login-identifier').fill(user.email);
    await page.locator('#input-login-password').fill(user.password);
    await page.locator('#btn-submit-login').click();
    await expect(page.getByRole('button', { name: 'Chơi bản preview' })).toBeVisible();
    assert.deepEqual(requests, [], 'Landing and Auth must not request gameplay media');

    await openStory();
    await page.locator('.story-app .overlay [data-action="primary"]').click();
    await expect(page.locator('.story-app .overlay')).toBeHidden();
    await page.waitForFunction(() => window.snakeMediaProbe.fallback.length === 2);
    await page.screenshot({ path: evidence + '/media-art-pending.png' });
    releaseArt();
    await page.waitForFunction(() => ['a1_master', 'food'].every(name =>
      window.snakeMediaProbe.drawn.some(url => url.includes('snake-' + name + '-'))));
    await page.screenshot({ path: evidence + '/media-art-loaded.png' });
    const storyArt = [...new Set(requests)];
    assert.equal(storyArt.length, 4);
    assert(storyArt.every(file => /^snake-(a1_master|food|r01_props|r01_terrain)-/.test(file)));
    assert.deepEqual(wavRequests(), [], 'A new game keeps sound off until opt-in');

    await page.locator('.story-app [data-action="settings"]').click();
    await sound.check();
    await expect(settings.locator('.audio-status')).toContainText('Chưa phát được âm thanh');
    assert.equal(wavRequests().length, 14);
    await settings.getByRole('button', { name: 'Nghe thử' }).click();
    await expect(settings.locator('.audio-status')).toContainText('Đã phát âm thử');
    assert.equal(wavRequests().length, 15, 'Only the failed WAV should be fetched again');
    await page.screenshot({ path: evidence + '/media-audio-retry.png' });
    await settings.getByRole('button', { name: 'Xong' }).click();
    await exit();

    requests.length = 0;
    holdAudio = true;
    await openStory();
    await page.locator('.story-app [data-action="settings"]').click();
    await sound.uncheck();
    await sound.check();
    await expect.poll(() => wavRequests().length).toBe(14);
    const abortedBefore = await page.evaluate(() => window.snakeMediaProbe.aborted);
    await settings.getByRole('button', { name: 'Xong' }).click();
    await exit();
    await page.waitForFunction(before => window.snakeMediaProbe.aborted >= before + 14, abortedBefore);
    assert.deepEqual(errors, []);
    return { storyArt, audioFiles: 14, retriedWavs: 1, abortedWavsOnExit: 14 };
  } finally {
    releaseArt();
    releaseAudio();
    await context.close();
  }
};
