import { test, expect, type Page } from '@playwright/test';
import { execFileSync, spawn, type ChildProcess } from 'node:child_process';
import path from 'node:path';
// Two real browser pages play an online 1v1 through the real room server (loopback):
// create → join by code → ready → countdown → both drive → leave mid-match → forfeit result.
const PREVIEW = path.resolve('preview/tank-clash/index.html'), PORT = 3291;
let server: ChildProcess;
test.beforeAll(async () => {
  execFileSync(process.execPath, ['scripts/export-tank-review.mjs'], { stdio: 'ignore' });
  server = spawn(process.execPath, ['server/tank-clash-room/server.mjs'], { env: { ...process.env, PORT: String(PORT), NODE_ENV: 'development' }, stdio: 'ignore' });
  for (let i = 0; i < 50; i++) { try { if ((await fetch(`http://127.0.0.1:${PORT}/health`)).ok) return; } catch { /* starting */ } await new Promise(r => setTimeout(r, 100)); }
  throw new Error('room server did not start');
});
test.afterAll(() => { server?.kill(); });
const state = (page: Page) => page.evaluate(() => (window as unknown as { __tankClash: { snapshot(): { tanks: { id: string; x: number; y: number; hp: number }[]; round: number } } }).__tankClash.snapshot());
async function open(page: Page, name: string) {
  await page.setViewportSize({ width: 1280, height: 760 });
  await page.goto(`file://${PREVIEW}?server=ws://127.0.0.1:${PORT}/tank`);
  await page.getByRole('button', { name: /Phòng riêng/ }).click();
  await page.locator('.tc-name').fill(name);
}

test('online 1v1: room code, ready, server-driven match, leave = forfeit', async ({ browser }) => {
  test.setTimeout(60_000);
  const errors: string[] = [];
  const pa = await (await browser.newContext()).newPage(), pb = await (await browser.newContext()).newPage();
  for (const p of [pa, pb]) p.on('pageerror', e => errors.push(String(e)));
  await open(pa, 'An'); await open(pb, 'Bình');
  await pa.getByRole('button', { name: 'Tạo phòng mới' }).click();
  await expect(pa.locator('.tc-roomcode')).toHaveText(/^[A-Z2-9]{3} [A-Z2-9]{3}$/);
  const code = (await pa.locator('.tc-roomcode').innerText()).replace(' ', '');
  await pb.locator('.tc-code').fill(code.toLowerCase()); await pb.locator('.tc-code').press('Enter');
  await expect(pa.locator('.tc-seat')).toHaveCount(2); await expect(pa.locator('.tc-seats')).toContainText('Bình');
  await expect(pb.locator('.tc-seats')).toContainText('Bình (anh)');
  await pa.locator('.tc-ready').click(); await pb.locator('.tc-ready').click();
  await expect(pa.locator('.tc-ready')).toContainText('Bắt đầu sau');
  await expect(pa.locator('.tc-overlay')).toBeHidden({ timeout: 8000 }); await expect(pb.locator('.tc-overlay')).toBeHidden({ timeout: 8000 });
  await expect(pa.locator('.tc-mode')).toHaveText('ONLINE 1v1 · HIỆP 1');
  await expect(pb.locator('.tc-player')).toContainText('B · BẠN');
  // A drives right with the keyboard; both pages see A move (A predicted locally, B via snapshots).
  const a0 = (await state(pa)).tanks[0].x, b0 = (await state(pb)).tanks.find(t => t.id === 'a')!.x;
  await pa.locator('canvas').click({ position: { x: 5, y: 5 } }).catch(() => {});
  await pa.keyboard.down('s'); await pa.waitForTimeout(700); await pa.keyboard.up('s');
  await pa.keyboard.down('d'); await pa.waitForTimeout(900); await pa.keyboard.up('d');
  await expect.poll(async () => (await state(pa)).tanks[0].x - a0, { timeout: 3000 }).toBeGreaterThan(40);
  await expect.poll(async () => (await state(pb)).tanks.find(t => t.id === 'a')!.x - b0, { timeout: 3000 }).toBeGreaterThan(40);
  await expect(pa.locator('.tc-fps')).toContainText('ONLINE');
  // B pauses: online cannot pause; leaving now is a forfeit.
  await pb.keyboard.press('Escape');
  await expect(pb.locator('#tc-dialog-title')).toHaveText('Trận không tạm dừng được.');
  await pb.getByRole('button', { name: 'Rời trận (xử thua)' }).click();
  await expect(pa.locator('#tc-dialog-title')).toHaveText('Anh thắng trận!', { timeout: 5000 });
  await expect(pa.locator('.tc-overlay')).toContainText('Đối thủ rời trận');
  await expect(pb.locator('.tc-card-online')).toBeVisible();
  expect(errors).toEqual([]);
});
