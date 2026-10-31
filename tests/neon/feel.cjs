// Neon Run feel/UX layer (public/standalone/neon-run/fx.js) in a real browser through the
// launcher: sound effects fire on play events, hit-stop and shake on damage, world music runs
// while playing and stops with the launcher mute, the closed-gate hint names the requirement,
// the on-screen pad hides for keyboard play and fades when idle on short landscape phones.
// Usage: npm run build && node tests/neon/feel.cjs
const { chromium } = require('playwright');
const { spawn } = require('node:child_process');
const { existsSync } = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');

const PORT = 4325;
(async () => {
  const server = spawn(process.execPath, [path.join(__dirname, '../../node_modules/vite/bin/vite.js'), 'preview', '--port', String(PORT), '--strictPort'], { stdio: 'pipe' });
  let ready = false; server.stdout.on('data', d => { if (String(d).includes(String(PORT))) ready = true; });
  for (let i = 0; i < 100 && !ready; i++) await new Promise(r => setTimeout(r, 200));
  const executablePath = process.env.CHROMIUM_EXECUTABLE || ['/usr/bin/chromium', '/opt/pw-browsers/chromium'].find(existsSync);
  const browser = await chromium.launch({ executablePath, args: ['--no-sandbox', '--autoplay-policy=no-user-gesture-required'] });
  let checks = 0; const check = (name) => { checks++; console.log('PASS', name); };
  const errors = [];
  async function openNeon(viewport, mobile) {
    const page = await browser.newPage({ viewport, isMobile: mobile, hasTouch: mobile });
    page.on('pageerror', e => errors.push(String(e)));
    await page.goto(`http://127.0.0.1:${PORT}/`, { waitUntil: 'networkidle' });
    await page.locator('#btn-play-neon-runner').click();
    let frame; for (let i = 0; i < 60 && !frame; i++) { frame = page.frames().find(f => f.url().includes('standalone/neon-run')); if (!frame) await page.waitForTimeout(250); }
    await frame.waitForFunction(() => typeof L !== 'undefined' && L && window.nrFx, null, { timeout: 30000 });
    return { page, frame };
  }
  async function enterLevel(page, frame) {
    await frame.getByRole('button', { name: /BẮT ĐẦU HÀNH TRÌNH/i }).first().click();
    for (let i = 0; i < 20 && await frame.evaluate(() => !!narrative.active || !!globalThis.neonMenuOpen); i++) { await page.keyboard.press('Enter'); await page.waitForTimeout(250); }
    await frame.waitForFunction(() => !narrative.active && !globalThis.neonMenuOpen, null, { timeout: 10000 });
  }
  try {
    const { page, frame } = await openNeon({ width: 1280, height: 760 }, false);
    await enterLevel(page, frame);
    await frame.evaluate(() => { window.__sfx = []; const original = nrFx.sfx; nrFx.sfx = name => { __sfx.push(name); original(name); }; });

    await page.keyboard.press('ArrowRight');
    assert.equal(await frame.evaluate(() => document.documentElement.dataset.input), 'keyboard');
    assert.equal(await frame.evaluate(() => getComputedStyle(document.querySelector('.controls')).visibility), 'hidden');
    check('desktop keyboard play hides the on-screen pad');

    await page.keyboard.down('ArrowRight');
    for (let i = 0; i < 8; i++) { await page.keyboard.down('Space'); await page.waitForTimeout(220); await page.keyboard.up('Space'); await page.waitForTimeout(260); }
    await page.keyboard.up('ArrowRight');
    const heard = await frame.evaluate(() => [...new Set(__sfx)]);
    for (const name of ['jump', 'land', 'coin']) assert.ok(heard.includes(name), `missing ${name} (heard ${heard})`);
    check(`play events make sound (${heard.join(', ')})`);

    const st = await frame.evaluate(() => nrFx.status());
    assert.equal(st.audio, 'running'); assert.equal(st.music, true); assert.equal(st.world, 1);
    check('world music plays during a level');

    const hurt = await frame.evaluate(async () => { p.inv = 0; damage(); const holding = nrFx.holding(); await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))); return { holding, translate: document.getElementById('game').style.translate, sfx: __sfx.at(-1), hp: p.hp }; });
    assert.equal(hurt.holding, true); assert.notEqual(hurt.translate, ''); assert.equal(hurt.sfx, 'hurt');
    check('damage triggers hit-stop, screen shake and the hurt sound');

    const gate = await frame.evaluate(() => L.gates.find(g => !gateOpen(g)));
    await frame.evaluate(g => { p.x = g.x - 60; p.y = 300; p.vy = 0; }, gate);
    await page.keyboard.down('ArrowRight'); await page.waitForTimeout(900); await page.keyboard.up('ArrowRight');
    const message = await frame.evaluate(() => document.querySelector('#message').textContent);
    assert.match(message, /Cổng khoá — cần bật .+/);
    assert.ok((await frame.evaluate(() => __sfx)).includes('blocked'));
    check(`a closed gate says what it needs ("${message}")`);

    // Starting a level enters the game's own fullscreen; leave it (Esc) to reach the launcher bar.
    await page.evaluate(() => document.fullscreenElement && document.exitFullscreen()).catch(() => {});
    await page.getByRole('button', { name: 'Tắt âm thanh' }).click();
    await frame.waitForFunction(() => window.__ARCADEX_MUTED__ === true, null, { timeout: 5000 });
    await page.waitForTimeout(300);
    assert.equal((await frame.evaluate(() => nrFx.status())).music, false);
    check('the launcher sound toggle silences effects and music');
    await page.close();

    const phone = await openNeon({ width: 844, height: 390 }, true);
    await phone.frame.getByRole('button', { name: /BẮT ĐẦU HÀNH TRÌNH/i }).first().tap();
    await phone.page.waitForTimeout(400);
    const ui = await phone.frame.evaluate(() => ({ input: document.documentElement.dataset.input, opacity: getComputedStyle(document.querySelector('#vpad')).opacity, visibility: getComputedStyle(document.querySelector('.controls')).visibility }));
    assert.equal(ui.input, 'touch'); assert.equal(ui.visibility, 'visible'); assert.equal(Number(ui.opacity), 0.45);
    check('touch play keeps the pad, faded while idle on a short landscape phone');

    assert.deepEqual(errors, []);
    console.log(`neon feel: ${checks} checks passed`);
  } catch (e) {
    console.error('FAIL:', e.message.split('\n')[0]); if (errors.length) console.error(errors);
    process.exitCode = 1;
  } finally { await browser.close(); server.kill(); }
})();
