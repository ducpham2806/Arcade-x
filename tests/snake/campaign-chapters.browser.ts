import { expect, test, type Page } from '@playwright/test';
import { mockSupabase } from '../auth/backend';
import { observeEngine, winFirstLevel } from './ui-driver';

const r01Key = 'snake-legend:r01-blockout:v1';
const amberKey = 'snake-legend:amber-5-v1:progress:v1';
const amberCheckpoint = 'snake-legend:amber-5-v1:checkpoint:v1';
const dawnKey = 'snake-legend:dawn-5-v1:progress:v1';

function completed(chapter: number, lastLevel: number, contentVersion: string) {
  return JSON.stringify({
    version: 1, contentVersion, secrets: [], receipts: [],
    levels: Object.fromEntries(Array.from({ length: lastLevel }, (_, i) => [
      `${chapter}-${i + 1}`, { stars: [true, true, false], bestTime: 30, bestScore: 100 },
    ])),
  });
}

async function openJourney(page: Page) {
  await page.locator('#btn-play-snake-legend').click();
  await expect(page.locator('.snake-journey')).toBeVisible();
}

test('chapter gates, real Amber clear and separate checkpoint on a small viewport', async ({ page, context }, info) => {
  test.setTimeout(110_000);
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await mockSupabase().install(context);
  await page.setViewportSize({ width: 320, height: 568 });
  await page.goto('/');
  await openJourney(page);
  await expect(page.locator('[data-chapter="1"]')).toBeDisabled();
  await expect(page.locator('[data-chapter="2"]')).toBeDisabled();
  await expect(page.locator('.journey-trials')).toBeVisible();
  const r01 = completed(1, 10, 'r01-10-v1');
  await page.evaluate(({ key, value }) => localStorage.setItem(key, value), { key: r01Key, value: r01 });
  await page.reload();
  await observeEngine(page);
  await openJourney(page);
  await expect(page.locator('[data-chapter="1"]')).toHaveAttribute('aria-current', 'true');
  await expect(page.locator('[data-chapter="2"]')).toBeDisabled();
  await page.locator('[data-chapter="0"]').click();
  await page.locator('[data-action="next-chapter"]').click();
  await expect(page.locator('[data-chapter="1"]')).toBeFocused();
  await expect(page.locator('.journey-play')).toHaveText('Bắt đầu màn 2-1');
  await expect(page.locator('.journey-play')).toBeInViewport({ ratio: 1 });
  await page.screenshot({ path: info.outputPath('amber-journey-phone.png') });
  await page.locator('.journey-play').click();
  await page.locator('.story-app [data-action="primary"]').click();
  await expect(page.locator('.story-app .overlay')).toBeHidden();
  await expect(page.locator('.joystick')).toBeInViewport({ ratio: 1 });
  await expect(page.locator('.dash')).toBeInViewport({ ratio: 1 });
  await page.screenshot({ path: info.outputPath('amber-play-phone.png') });
  await page.locator('.story-app [data-action="journey"]').click();
  await expect(page.locator('.journey-resume')).toHaveText('Tiếp tục màn 2-1');
  await expect.poll(() => page.evaluate(key => JSON.parse(localStorage.getItem(key) || '{}').level, amberCheckpoint)).toBe('2-1');
  await page.reload();
  await observeEngine(page);
  await openJourney(page);
  await expect(page.locator('.journey-resume')).toHaveText('Tiếp tục màn 2-1');
  await page.locator('.journey-resume').click();
  await expect(page.locator('.checkpoint-message')).toContainText('Đã khôi phục');
  await winFirstLevel(page);
  await expect(page.locator('.save-message')).toContainText('Đã lưu');
  await expect(page.locator('.story-app [data-level="1"]')).toBeEnabled();
  await page.locator('.story-app [data-action="journey"]').click();
  await expect(page.locator('.journey-play')).toHaveText('Bắt đầu màn 2-2');
  expect(await page.evaluate(key => localStorage.getItem(key), r01Key)).toBe(r01);
  expect(await page.evaluate(key => Object.keys(JSON.parse(localStorage.getItem(key)!).levels), amberKey)).toEqual(['2-1']);
  expect(errors).toEqual([]);
});

test('Dawn chapter shows the finale after the complete campaign and keeps previous chapters replayable', async ({ page, context }, info) => {
  await mockSupabase().install(context);
  await page.setViewportSize({ width: 1024, height: 720 });
  await page.goto('/');
  await page.evaluate(entries => {
    for (const [key, value] of entries) localStorage.setItem(key, value);
  }, [
    [r01Key, completed(1, 10, 'r01-10-v1')],
    [amberKey, completed(2, 5, 'amber-5-v1')],
    [dawnKey, completed(3, 5, 'dawn-5-v1')],
  ]);
  await page.reload();
  await openJourney(page);
  await expect(page.locator('[data-chapter="2"]')).toHaveAttribute('aria-current', 'true');
  await expect(page.locator('.chapter-ending h2')).toHaveText('Ánh sáng trở về');
  await expect(page.locator('.chapter-story')).toContainText('Hành trình của Tiểu Xà đã hoàn thành');
  await expect(page.locator('.journey-clears')).toHaveText('5/5 màn');
  await expect(page.locator('.journey-stars')).toHaveText('★ 10/15 sao');
  await page.screenshot({ path: info.outputPath('dawn-finale-desktop.png') });
  await page.locator('[data-chapter="1"]').click();
  await expect(page.locator('.chapter-ending h2')).toHaveText('Suối Hổ Phách lại chảy');
  await page.locator('[data-action="next-chapter"]').click();
  await expect(page.locator('[data-chapter="2"]')).toBeFocused();
  await page.locator('[data-action="mastery"]').click();
  await expect(page.locator('.journey-eyebrow')).toHaveText('MÀN 3-1');
  await expect(page.locator('.journey-play')).toHaveText('Chơi lại màn này');
});
