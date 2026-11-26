import { expect, test, type BrowserContext, type Page } from '@playwright/test';
import { TRIALS } from '../../src/games/snake-legend/src/trials';
import { mockSupabase } from '../auth/backend';
import { observeEngine } from './ui-driver';

const trialKey = 'snake-legend:meadow-trials:v1';
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

test('public guest completes a real course, saves the time and returns to the same R01 journey', async ({ page, context }, info) => {
  test.setTimeout(120_000);
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await openTrials(page, context);
  await observeEngine(page);
  const before = await Promise.all([campaignKey, checkpointKey].map(key => readSave(page, key)));
  const course = page.locator('.snake-trials');
  await expect(course.locator('.arenas button')).toHaveCount(3);
  await expect(course.locator('h1')).toHaveText(TRIALS[0].arena.name);
  await page.screenshot({ path: info.outputPath('trial-select-desktop.png') });
  await course.locator('[data-action="resume"]').click();
  const stick = (await course.locator('.joystick').boundingBox())!;
  const center = { x: stick.x + stick.width / 2, y: stick.y + stick.height / 2 };
  await page.mouse.move(center.x, center.y);
  await page.mouse.down();
  const probe = () => page.evaluate(() => (window as typeof window & {
    __snakeUiProbe?: { status: string; pos: { x: number; y: number }; tick: number };
  }).__snakeUiProbe);
  let waypoint = 0;
  const guide = TRIALS[0].guide;
  try {
    await expect.poll(async () => (await probe())?.tick ?? 0).toBeGreaterThan(0);
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
  expect((await probe())?.status).toBe('won');
  await expect(course.locator('h1')).toHaveText('Hoàn thành!');
  await expect(course.locator('.trial-result')).toContainText('Kỷ lục');
  const record = await readSave(page, trialKey);
  expect(record).not.toBeNull();
  await page.screenshot({ path: info.outputPath('trial-finish-desktop.png') });
  await course.locator('[data-action="next-trial"]').click();
  await expect(course.locator('h1')).toHaveText(TRIALS[1].arena.name);
  await course.locator('[data-action="trial-return"]').click();
  await expect(page.locator('.journey-clears')).toHaveText('0/10 màn');
  expect(await Promise.all([campaignKey, checkpointKey].map(key => readSave(page, key)))).toEqual(before);
  await page.reload();
  await page.locator('#btn-play-snake-legend').click();
  await page.locator('[data-action="trials"]').click();
  await expect(course).toBeVisible();
  await course.locator('[data-arena="0"]').click();
  await expect(course.locator('.best')).not.toHaveText('—');
  expect(errors).toEqual([]);
});

test.describe('touch courses', () => {
  test.use({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, reducedMotion: 'reduce' });

  test('three courses and both controls fit in portrait and short landscape', async ({ page, context }, info) => {
    await openTrials(page, context);
    const course = page.locator('.snake-trials');
    const viewports = [
      { width: 320, height: 568 }, { width: 390, height: 844 }, { width: 568, height: 320 },
    ];
    for (const [index, viewport] of viewports.entries()) {
      await page.setViewportSize(viewport);
      await course.locator(`[data-arena="${index}"]`).tap();
      await expect(course.locator('h1')).toHaveText(TRIALS[index].arena.name);
      await course.locator('[data-action="resume"]').tap();
      await expect(course.locator('.overlay')).toBeHidden();
      for (const selector of ['canvas', '.joystick', '.dash']) {
        await expect(course.locator(selector)).toBeInViewport({ ratio: 1 });
      }
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
      await page.screenshot({ path: info.outputPath(`trial-${viewport.width}x${viewport.height}.png`) });
      await course.locator('[data-action="pause"]').tap();
      await expect(course.locator('.overlay')).toBeVisible();
      await course.locator('[data-action="settings"]').tap();
      const settings = course.locator('.settings-card');
      await expect(settings).toBeVisible();
      const frame = (await course.boundingBox())!, dialog = (await settings.boundingBox())!;
      expect(Math.abs(dialog.height - frame.height)).toBeLessThanOrEqual(1);
      expect(Math.abs(dialog.width - frame.width)).toBeLessThanOrEqual(1);
      await course.locator('[data-action="close-settings"]').tap();
      await expect(settings).toBeHidden();
    }
  });
});
