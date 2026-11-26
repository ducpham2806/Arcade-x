import { expect, test, type BrowserContext, type Locator, type Page } from '@playwright/test';
import { TRIALS, TRIAL_STAGE_COUNT, TRIAL_STAGE_SIZE, TRIAL_SAVE_KEY, type TrialCourse } from '../../src/games/snake-legend/src/trials';
import { mockSupabase } from '../auth/backend';
import { observeEngine } from './ui-driver';

const campaignKey = 'snake-legend:r01-blockout:v1';
const checkpointKey = 'snake-legend:r01-checkpoint:v1';
const readSave = (page: Page, key: string) => page.evaluate(key => localStorage.getItem(key), key);

async function openTrials(page: Page, context: BrowserContext) {
  await mockSupabase().install(context);
  await page.goto('/');
  await page.locator('#btn-play-snake-legend').click();
  await expect(page.locator('.snake-journey')).toBeVisible();
  await page.locator('[data-action="trials"]').click();
  await expect(page.locator('.snake-trials')).toBeVisible();
}

async function finishTrial(page: Page, course: Locator, trial: TrialCourse) {
  const probe = () => page.evaluate(() => (window as typeof window & {
    __snakeUiProbe?: { engineId: number; status: string; pos: { x: number; y: number } };
  }).__snakeUiProbe);
  const previousEngine = (await probe())?.engineId ?? 0;
  await expect(course.locator('h1')).toHaveText(trial.arena.name);
  await expect(course.locator('[data-action="pause"]')).toHaveText('Bắt đầu');
  await course.locator('[data-action="resume"]').click();
  const stick = (await course.locator('.joystick').boundingBox())!;
  const center = { x: stick.x + stick.width / 2, y: stick.y + stick.height / 2 };
  await page.mouse.move(center.x, center.y);
  await page.mouse.down();
  let waypoint = 0;
  const { guide } = trial;
  try {
    await expect.poll(async () => (await probe())?.engineId ?? 0).toBeGreaterThan(previousEngine);
    const deadline = Date.now() + 65_000;
    while (Date.now() < deadline) {
      const state = (await probe())!;
      if (state.status !== 'running') break;
      const target = guide[waypoint];
      const x = target.x - state.pos.x, y = target.y - state.pos.y;
      const length = Math.hypot(x, y);
      if (length < .53 && waypoint < guide.length - 1) waypoint++;
      else if (length > 0) await page.mouse.move(center.x + x / length * stick.width * .38, center.y + y / length * stick.height * .38);
      await page.waitForTimeout(30);
    }
  } finally { await page.mouse.up(); }
  expect((await probe())?.status, trial.arena.name).toBe('won');
  await expect(course.locator('h1')).toHaveText('Hoàn thành!');
  await expect(course.locator('[data-action="pause"]')).toHaveText('Chơi lại');
  await expect(course.locator('.trial-result')).toContainText('Kỷ lục');
}

for (let stage = 0; stage < TRIAL_STAGE_COUNT; stage++) {
  test(`public guest completes stage ${stage + 1} and reloads its records without changing R01`, async ({ page, context }, info) => {
    test.setTimeout(120_000);
    const errors: string[] = [];
    const legacyBest = [17, 20, 24];
    page.on('pageerror', error => errors.push(error.message));
    if (stage === 1) {
      await page.addInitScript(({ key, best }) => {
        if (!localStorage.getItem(key)) localStorage.setItem(key, JSON.stringify({ version: 1, arena: 1, best }));
      }, { key: TRIAL_SAVE_KEY, best: legacyBest });
    }
    await openTrials(page, context);
    await observeEngine(page);
    const before = await Promise.all([campaignKey, checkpointKey].map(key => readSave(page, key)));
    const course = page.locator('.snake-trials');
    const stageSwitch = course.locator('[data-action="trial-stage"]');
    if (stage > 0) {
      await expect(course.locator('.best')).toHaveText('20.0s');
      await stageSwitch.click();
    }
    const start = stage * TRIAL_STAGE_SIZE;
    const group = TRIALS.slice(start, start + TRIAL_STAGE_SIZE);
    await expect(course.locator('.arenas [data-arena]:visible')).toHaveCount(group.length);
    await page.screenshot({ path: info.outputPath('trial-select-desktop.png') });
    const next = course.locator('[data-action="next-trial"]');
    for (const [index, trial] of group.entries()) {
      await finishTrial(page, course, trial);
      await page.screenshot({ path: info.outputPath(`trial-finish-${start + index + 1}-desktop.png`) });
      if (index < group.length - 1) await next.click();
    }
    const best: (number | null)[] = JSON.parse((await readSave(page, TRIAL_SAVE_KEY)) ?? '{}').best;
    expect(best).toHaveLength(TRIALS.length);
    if (stage === 1) expect(best.slice(0, TRIAL_STAGE_SIZE)).toEqual(legacyBest);
    const stageBest = best.slice(start, start + group.length);
    for (const seconds of stageBest) expect(seconds).toBeGreaterThan(0);
    if (stage === 0) {
      await expect(next).toHaveText('Sang chặng 2');
      await next.click();
      await expect(course.locator('h1')).toHaveText(TRIALS[TRIAL_STAGE_SIZE].arena.name);
    } else await expect(next).toBeHidden();
    await course.locator('[data-action="trial-return"]').click();
    await expect(page.locator('.journey-clears')).toHaveText('0/10 màn');
    expect(await Promise.all([campaignKey, checkpointKey].map(key => readSave(page, key)))).toEqual(before);
    await page.reload();
    await page.locator('#btn-play-snake-legend').click();
    await page.locator('[data-action="trials"]').click();
    await expect(course.locator('.arenas')).toHaveAttribute('aria-label', 'Đường thử · Chặng 2 trên 2');
    if (stage === 0) await stageSwitch.click();
    for (const [index, seconds] of stageBest.entries()) {
      await course.locator(`[data-arena="${start + index}"]`).click();
      await expect(course.locator('.best')).toHaveText(`${seconds!.toFixed(1)}s`);
      await expect(course.locator('.trial-result')).toContainText(`Kỷ lục ${seconds!.toFixed(1).replace('.', ',')} giây`);
    }
    expect(errors).toEqual([]);
  });
}

test.describe('touch courses', () => {
  test.use({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, reducedMotion: 'reduce' });

  test('map, touch controls and settings fit in portrait and short landscape', async ({ page, context }, info) => {
    await openTrials(page, context);
    await observeEngine(page);
    const course = page.locator('.snake-trials');
    const scout = course.locator('[data-action="scout"]');
    const closeScout = course.locator('[data-action="close-scout"]');
    const startScout = course.locator('[data-action="start-scout"]');
    const tick = () => page.evaluate(() => (window as unknown as {__snakeUiProbe?: {tick: number}}).__snakeUiProbe?.tick ?? 0);
    const viewports = [
      { width: 320, height: 568 }, { width: 390, height: 844 }, { width: 568, height: 320 },
    ];
    for (const [index, viewport] of viewports.entries()) {
      await page.setViewportSize(viewport);
      await course.locator(`[data-arena="${index}"]`).tap();
      await expect(course.locator('h1')).toHaveText(TRIALS[index].arena.name);
      await expect(course.locator('.trial-result')).toContainText('Chưa có kỷ lục');
      await scout.tap();
      const canvas = course.locator('canvas');
      await expect(course.locator('.trial-map-bar')).toBeVisible();
      await expect(canvas).toHaveAttribute('aria-label', new RegExp(`Bản đồ ${TRIALS[index].arena.name}`));
      await expect(canvas).toBeInViewport({ ratio: 1 });
      await expect(closeScout).toBeFocused();
      await expect(course.locator('.dock')).toBeHidden();
      if (viewport.width < viewport.height) {
        await expect(course.locator('.trial-map-notes strong')).toHaveCSS('color', 'rgb(255, 245, 216)');
      }
      await page.screenshot({ path: info.outputPath(`trial-map-${viewport.width}x${viewport.height}.png`) });
      if (index === 0) {
        await page.keyboard.press('Escape');
        await expect(scout).toBeFocused();
        expect(await tick()).toBe(0);
        await scout.tap();
      }
      await expect(startScout).toHaveText('Bắt đầu');
      await startScout.tap();
      await expect(course.locator('.overlay')).toBeHidden();
      await expect(course.locator('.trial-map-bar')).toBeHidden();
      await expect(canvas).toBeFocused();
      for (const selector of ['canvas', '.joystick', '.dash']) {
        await expect(course.locator(selector)).toBeInViewport({ ratio: 1 });
      }
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
      await page.screenshot({ path: info.outputPath(`trial-${viewport.width}x${viewport.height}.png`) });
      await course.locator('[data-action="pause"]').tap();
      await expect(course.locator('.overlay')).toBeVisible();
      await expect(course.locator('[data-action="pause"]')).toHaveText('Tiếp tục');
      if (index === 0) {
        await expect.poll(tick).toBeGreaterThan(0);
        const pausedTick = await tick();
        await scout.tap();
        await expect(startScout).toHaveText('Tiếp tục');
        await page.waitForTimeout(160);
        expect(await tick()).toBe(pausedTick);
        await closeScout.tap();
        await expect(scout).toBeFocused();
        await scout.tap();
        const hostPause = page.locator('#btn-game-pause');
        await hostPause.tap();
        await expect(course.locator('.trial-map-bar')).toBeHidden();
        expect(await tick()).toBe(pausedTick);
        await expect(course.locator('[data-action="pause"]')).toBeDisabled();
        await hostPause.tap();
        await expect(course.locator('[data-action="pause"]')).toBeEnabled();
      }
      await course.locator('[data-action="settings"]').tap();
      const settings = course.locator('.settings-card');
      await expect(settings).toBeVisible();
      const frame = (await course.boundingBox())!, dialog = (await settings.boundingBox())!;
      expect(Math.abs(dialog.height - frame.height)).toBeLessThanOrEqual(1);
      expect(Math.abs(dialog.width - frame.width)).toBeLessThanOrEqual(1);
      await course.locator('[data-action="close-settings"]').tap();
      await expect(settings).toBeHidden();
    }
    await page.setViewportSize({ width: 320, height: 568 });
    const stageSwitch = course.getByRole('button', {name: 'Sang chặng 2'});
    await expect(stageSwitch).toBeInViewport({ratio:1});
    await stageSwitch.tap();
    for (const trial of TRIALS.slice(TRIAL_STAGE_SIZE)) {
      await expect(course.getByRole('button', {name:trial.arena.name})).toBeInViewport({ratio:1});
    }
    const lastCourse = TRIALS.at(-1)!;
    await course.getByRole('button', {name:lastCourse.arena.name}).tap();
    await scout.tap();
    await expect(course.locator('canvas')).toHaveAttribute('aria-label', new RegExp(lastCourse.arena.name));
    await expect(startScout).toBeInViewport({ratio:1});
    await page.screenshot({path:info.outputPath('stage-two-map-320x568.png')});
  });
});
