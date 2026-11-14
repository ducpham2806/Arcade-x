// Full wall-clock R01 journey through the shipped UI and pointer controls.
// Engine instrumentation is read-only; no wins, health, clocks or save data are injected.
import { chromium, expect } from '@playwright/test';
import { spawn } from 'node:child_process';
import { existsSync, mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import { mockSupabase } from '../auth/backend.ts';
import { observeSnakeResources, snakeResources } from './runtime-probe.ts';

const port = 4364, origin = `http://127.0.0.1:${port}`;
const evidence = process.env.SNAKE_CAMPAIGN_EVIDENCE || 'test-results/snake-campaign-browser';
const count = Number(process.argv.find(a => a.startsWith('--levels='))?.split('=')[1] || 10);
if (!Number.isInteger(count) || count < 1 || count > 10) throw Error('levels must be 1–10');
mkdirSync(evidence, { recursive: true });
const resume = process.argv.includes('--resume');
let browser, page;
const previous = resume ? JSON.parse(readFileSync(`${evidence}/report.json`, 'utf8')) : null;
const report = previous || { scope: 'Chromium desktop, real frame time and native pointer controls, local Auth fixture; no human or physical-device claim', levels: [], pageErrors: [] };
if (previous?.error) { report.attempts = [...(report.attempts || []), { error: previous.error }]; delete report.error; }
const startIndex = report.levels.length;
const server = spawn(process.execPath, ['node_modules/vite/bin/vite.js', '--mode', 'snake-catalog', '--host', '127.0.0.1', '--port', String(port), '--strictPort'], { stdio: 'pipe' });
try {
  let ready = false;
  for (let n = 0; n < 100; n++) { try { if ((await fetch(origin)).ok) { ready = true; break; } } catch {} await new Promise(r => setTimeout(r, 100)); }
  if (!ready) throw Error('Vite campaign server did not start');
  browser = await chromium.launch({ executablePath: process.env.CHROMIUM_EXECUTABLE || (existsSync('/usr/bin/chromium') ? '/usr/bin/chromium' : undefined), args: ['--no-sandbox'] });
  const context = await browser.newContext({ viewport: { width: 1280, height: 860 }, ...(resume ? { storageState: `${evidence}/browser-state.json` } : {}) });
  const backend = mockSupabase();
  if (resume) for (const entry of JSON.parse(readFileSync(`${evidence}/browser-state.json`, 'utf8')).origins.flatMap(o => o.localStorage)) {
    if (/^sb-.*-auth-token$/.test(entry.name)) { const session = JSON.parse(entry.value); if (session?.user) backend.users.set(session.user.id, { ...session.user, confirmed: true }); }
  }
  await backend.install(context); page = await context.newPage();
  await observeSnakeResources(page);
  page.on('pageerror', e => report.pageErrors.push(e.message));
  await page.goto(origin); await expect(page.locator('#game-library')).toBeVisible();
  await page.evaluate(async () => {
    const { Engine, T } = await import('/src/games/snake-legend/src/core.ts');
    const { bossSteering, bonusRoute, steer } = await import('/tests/snake/campaign-driver.ts');
    const step = Engine.prototype.step;
    Engine.prototype.step = function(input) {
      const result = step.call(this, input);
      if (window.__campaignProbe?.engine !== this) {
        const index = Number(this.arena.story.id.split('-')[1]) - 1;
        const route = index === 7 ? bonusRoute : this.arena.story.guide.slice(1);
        const boss = index === 9 ? bossSteering(this) : null;
        let waypoint = 0;
        window.__campaignProbe = { engine: this, input: () => {
          if (boss) return boss();
          if (waypoint < route.length - 1 && Math.hypot(this.pos.x - route[waypoint].x, this.pos.y - route[waypoint].y) < .6) waypoint++;
          return steer(this, route[waypoint], index === 1 && (this.tick < T.hz * 2 || this.goalReady && this.energy > 80));
        }};
      }
      return result;
    };
  });
  await page.locator('#btn-play-snake-legend').click(); await page.locator(`.snake-journey [data-level="${startIndex}"]`).click(); await page.locator('.journey-play').click();
  for (let index = startIndex; index < count; index++) {
    const expected = `1-${index + 1}`, tutorials = [], hits = [], started = Date.now();
    await page.locator('.story-app .overlay [data-action="primary"]').click();
    await page.waitForFunction(id => window.__campaignProbe?.engine.arena.story.id === id, expected);
    await page.evaluate(() => window.__snakeResources.resetTimings());
    let holding = false, sentDash = false, stickBox, center;
    const release = async () => { await page.mouse.up(); if (sentDash) await page.keyboard.up('Space'); sentDash = false; holding = false; };
    const hold = async () => {
      stickBox = await page.locator('.joystick').boundingBox();
      center = { x: stickBox.x + stickBox.width / 2, y: stickBox.y + stickBox.height / 2 };
      await page.mouse.move(center.x, center.y); await page.mouse.down(); holding = true;
    };
    await hold();
    let last, previousHearts = 3, previousTick = 0, maxInputGapTicks = 0;
    try {
      while (Date.now() - started < 210000) {
        last = await page.evaluate(() => { const { engine: e, input } = window.__campaignProbe; return { status: e.status, tick: e.tick, time: e.time, hearts: e.hearts, stars: e.stars, event: e.lastEvent, tutorial: e.encounters?.tutorialPending, phase: e.encounters?.phase, bossHits: e.encounters?.totalHits, pos: { ...e.pos }, state: e.encounters?.state, input: input() }; });
        if (previousTick) maxInputGapTicks = Math.max(maxInputGapTicks, last.tick - previousTick); previousTick = last.tick;
        if (last.hearts < previousHearts) { hits.push({ tick: last.tick, phase: last.phase, event: last.event, pos: last.pos, bossHits: last.bossHits }); previousHearts = last.hearts; }
        if (last.status !== 'running') break;
        if (last.tutorial) {
          await release(); tutorials.push(last.phase);
          await expect(page.locator('.story-app .overlay')).toBeVisible();
          await page.screenshot({ path: `${evidence}/boss-tutorial-${last.phase}.png` });
          await page.locator('.story-app .overlay [data-action="primary"]').click(); await hold(); continue;
        }
        await page.mouse.move(center.x + last.input.x * stickBox.width * .38, center.y + last.input.y * stickBox.height * .38);
        if (last.input.dash !== sentDash) { if (last.input.dash) await page.keyboard.down('Space'); else await page.keyboard.up('Space'); sentDash = last.input.dash; }
        await page.waitForTimeout(8);
      }
    } finally { if (holding) await release(); }
    if (last?.status !== 'won') { report.currentFailure = { level: expected, ...last, hits, tutorials }; throw Error(`${expected} did not clear through controls: ${JSON.stringify(last)}`); }
    await expect(page.locator('.story-app .overlay')).toBeVisible();
    await expect(page.locator('.story-app [data-action="primary"]')).toHaveText(index === 9 ? 'Chơi lại chương' : 'Màn tiếp theo');
    const stored = await page.evaluate(() => JSON.parse(localStorage.getItem('snake-legend:r01-blockout:v1')));
    if (!stored.levels[expected]?.stars[0] || stored.receipts.length !== index + 1) throw Error('Clear was not saved exactly once: ' + expected);
    const resources = await snakeResources(page);
    const entry = { level: expected, seconds: last.time, wallSeconds: (Date.now() - started) / 1000, hearts: last.hearts, stars: last.stars.filter(Boolean).length, bossHits: last.bossHits, tutorials, hits, maxInputGapTicks, resources };
    report.levels.push(entry); await context.storageState({ path: `${evidence}/browser-state.json` }); console.log(JSON.stringify(entry));
    await page.screenshot({ path: `${evidence}/clear-${expected}.png` });
    writeFileSync(`${evidence}/report.json`, JSON.stringify(report, null, 2));
    if (index < count - 1) await page.locator('.story-app .overlay [data-action="primary"]').click();
  }
  await page.locator('.story-app [data-action="journey"]').click();
  await expect(page.locator('.journey-clears')).toHaveText(`${count}/10 màn`);
  await page.screenshot({ path: `${evidence}/journey-complete.png` });
  await page.reload(); await page.locator('#btn-play-snake-legend').click();
  await expect(page.locator('.journey-clears')).toHaveText(`${count}/10 màn`);
  await page.locator('#btn-game-exit').click(); await page.locator('#btn-exit-confirm').click();
  await expect.poll(async () => { const s = await snakeResources(page); return [s.raf, s.resizeObservers, s.globalListeners, s.audioContexts]; }).toEqual([0, 0, 0, 0]);
  if (report.pageErrors.length) throw Error(JSON.stringify(report.pageErrors));
  delete report.currentFailure; report.status = 'PASS'; report.restoredAfterReload = true; report.cleanedUp = true;
  console.log(JSON.stringify({ status: report.status, levels: report.levels.length }));
} catch (error) {
  report.status = 'FAIL'; report.error = error.message;
  if (page) await page.screenshot({ path: `${evidence}/failure-${(report.attempts?.length || 0) + 1}.png` }).catch(() => {});
  console.error(error); process.exitCode = 1;
} finally {
  writeFileSync(`${evidence}/report.json`, JSON.stringify(report, null, 2));
  await browser?.close(); server.kill();
}
