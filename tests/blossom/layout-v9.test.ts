import { test, expect, Page } from '@playwright/test';
import { createRun } from '../../src/games/hex-match/blossom/engine';
import { LEVELS } from '../../src/games/hex-match/blossom/levels';
import { defaultSave } from '../../src/games/hex-match/blossom/save';
import { lessonsFor } from '../../src/games/hex-match/blossom/tutorials';

// Play layout v9: the HUD, the whole board and the tools fit the frame without scrolling;
// wide, short frames put the board left of the HUD; no launcher readability surface
// (#111c2d) lands on Blossom text; the debug seed line stays out of the player build.
const VIEWPORTS: [number, number][] = [[320, 568], [390, 844], [844, 390], [1280, 760]];

async function fits(page: Page, height: number) {
  const box = async (s: string) => (await page.locator(s).first().boundingBox())!;
  const board = await box('.bb-board-wrap'), tools = await box('.bb-tools'), hud = await box('.bb-hud');
  expect(board.y).toBeGreaterThanOrEqual(0);
  expect(board.y + board.height).toBeLessThanOrEqual(height + 1);
  expect(tools.y + tools.height).toBeLessThanOrEqual(height + 1);
  expect(hud.y).toBeGreaterThanOrEqual(0);
  return { board, hud };
}

for (const [width, height] of VIEWPORTS) {
  test(`launcher play fits ${width}x${height} without dark text boxes or debug line`, async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', e => errors.push(String(e)));
    await page.setViewportSize({ width, height });
    await page.goto('/');
    await page.locator('#btn-play-hex-match').click();
    await page.locator('.blossom .bb-hero .bb-primary').click();
    await expect(page.locator('.bb-board')).toBeVisible({ timeout: 30000 });
    const surfaced = () => page.evaluate(() => [...document.querySelectorAll('.blossom [data-ax-readable]')]
      .filter(e => getComputedStyle(e).backgroundColor === 'rgb(17, 28, 45)').map(e => e.textContent?.trim()));
    await expect.poll(surfaced).toEqual([]);
    await expect(page.locator('.bb-run-note')).toHaveCount(0);
    const { board, hud } = await fits(page, height);
    if (width > height) {
      expect(board.x + board.width).toBeLessThanOrEqual(hud.x);
      expect(board.width).toBeGreaterThanOrEqual(height < 500 ? 280 : 520);
    } else expect(board.width).toBeGreaterThanOrEqual(width < 360 ? 200 : 340);
    expect(errors).toEqual([]);
  });
}

for (const index of [9, 22, 99]) {
  test(`level ${index + 1} (${LEVELS[index].rows}x${LEVELS[index].cols}${LEVELS[index].bossHP ? ', boss' : ''}) fits phone, landscape and desktop`, async ({ page }) => {
    for (const [width, height] of VIEWPORTS.slice(1)) {
      await page.setViewportSize({ width, height });
      const save = defaultSave(), run = createRun(LEVELS[index], 7);
      save.active = run; save.tutorials = lessonsFor(run, []).map(l => l.id);
      await page.goto('/blossom-review.html');
      await page.evaluate((s: unknown) => localStorage.setItem('arcadex_blossom_review_v1', JSON.stringify(s)), save);
      await page.reload();
      await expect(page.locator('.bb-board')).toBeVisible();
      await fits(page, height);
    }
  });
}
