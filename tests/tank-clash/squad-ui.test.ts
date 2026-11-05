import { test, expect, type Page } from '@playwright/test';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
// Local 2v2 (P3a): player + BOT team-mate vs 2 BOTs on a seeded Crossfire arena; pause → surrender → result → rematch.
const PREVIEW = path.resolve('preview/tank-clash/index.html');
type Snap = { mode: string; width: number; height: number; map?: { seed: number }; status: string; round: number; tanks: { id: string; team: number; kind: string; x: number; y: number; hp: number }[] };
const state = (page: Page) => page.evaluate(() => (window as unknown as { __tankClash: { snapshot(): Snap } }).__tankClash.snapshot());
test.beforeAll(() => { execFileSync(process.execPath, ['scripts/export-tank-review.mjs'], { stdio: 'ignore' }); });

for (const viewport of [{ width: 1280, height: 760 }, { width: 844, height: 390 }]) {
  test(`2v2 with bots at ${viewport.width}×${viewport.height}: start, play, surrender, rematch`, async ({ page }) => {
    const errors: string[] = []; page.on('pageerror', e => errors.push(e.message));
    await page.setViewportSize(viewport);
    await page.goto(`file://${PREVIEW}`);
    await page.getByRole('button', { name: /Bạn \+ 1 bot vs 2 bot/ }).click();
    await expect(page.locator('.tc-overlay')).toBeHidden();
    await expect(page.locator('.tc-mode')).toHaveText('2v2 VỚI BOT · HIỆP 1');
    await expect(page.locator('.tc-player')).toContainText('ĐỘI A · BẠN + BOT');
    const first = await state(page);
    expect(first.mode).toBe('squad'); expect([first.width, first.height]).toEqual([1040, 624]);
    expect(first.tanks.map(t => `${t.id}:${t.team}:${t.kind}`)).toEqual(['a:0:player', 'a2:0:bot', 'b:1:bot', 'b2:1:bot']);
    // Drive for a moment: bots move and the arena keeps running.
    await page.keyboard.down('d'); await page.waitForTimeout(700); await page.keyboard.up('d');
    const later = await state(page);
    expect(later.tanks[0].x).toBeGreaterThan(first.tanks[0].x);
    expect(later.tanks.slice(1).some((t, i) => t.x !== first.tanks[i + 1].x || t.y !== first.tanks[i + 1].y)).toBe(true);
    await page.keyboard.press('Escape');
    await expect(page.locator('#tc-dialog-title')).toHaveText('Nghỉ một nhịp.');
    await page.getByRole('button', { name: 'Đầu hàng' }).click();
    await expect(page.locator('#tc-dialog-title')).toHaveText('Đội anh đã đầu hàng.');
    await expect(page.locator('.tc-dialog')).toContainText(`mã sân ${first.map!.seed}`);
    await page.getByRole('button', { name: 'Đấu lại' }).click();
    await expect(page.locator('.tc-overlay')).toBeHidden();
    const again = await state(page);
    expect(again.status).toBe('playing'); expect(again.mode).toBe('squad'); expect(again.map!.seed).not.toBe(first.map!.seed);
    expect(errors).toEqual([]);
  });
}
