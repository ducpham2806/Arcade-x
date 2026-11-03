import { test, expect, type Page, type Browser } from '@playwright/test';
import { execFileSync, spawn, type ChildProcess } from 'node:child_process';
import path from 'node:path';
// P3d: four real browser pages (+ a spectator) through the real room server on loopback (guest dev server, so guests may queue).
const PREVIEW = path.resolve('preview/tank-clash/index.html'), PORT = 3292;
let server: ChildProcess;
test.beforeAll(async () => {
  execFileSync(process.execPath, ['scripts/export-tank-review.mjs'], { stdio: 'ignore' });
  server = spawn(process.execPath, ['server/tank-clash-room/server.mjs'], { env: { ...process.env, PORT: String(PORT), NODE_ENV: 'development' }, stdio: 'ignore' });
  for (let i = 0; i < 50; i++) { try { if ((await fetch(`http://127.0.0.1:${PORT}/health`)).ok) return; } catch { /* starting */ } await new Promise(r => setTimeout(r, 100)); }
  throw new Error('room server did not start');
});
test.afterAll(() => { server?.kill(); });
// Pages opened here live in their own contexts: close them so they cannot keep focus (a blurred game pauses) in later tests.
const opened: Page[] = [];
test.afterEach(async () => { await Promise.all(opened.splice(0).map(p => p.context().close().catch(() => {}))); });
type Snap = { mode: string; width: number; tanks: { id: string; team: number }[] };
const state = (page: Page) => page.evaluate(() => (window as unknown as { __tankClash: { snapshot(): Snap } }).__tankClash.snapshot());
async function open(browser: Browser, name: string, size = { width: 1280, height: 760 }) {
  const page = await browser.newPage({ viewport: size }); opened.push(page);
  const errors: string[] = []; page.on('pageerror', e => errors.push(e.message)); (page as unknown as { errors: string[] }).errors = errors;
  await page.goto(`file://${PREVIEW}?server=ws://127.0.0.1:${PORT}/tank`);
  await page.getByRole('button', { name: /Phòng riêng/ }).click();
  await page.locator('.tc-name').fill(name);
  return page;
}
const noErrors = (pages: Page[]) => { for (const p of pages) expect((p as unknown as { errors: string[] }).errors).toEqual([]); };

test('private 2v2: team switch, spectator, match start, team-mate leaves, last player surrenders', async ({ browser }) => {
  const [pa, pb, pc, pd] = await Promise.all(['An', 'Bình', 'Chi', 'Dũng'].map(n => open(browser, n)));
  await pa.getByLabel('2v2').check(); await pa.getByRole('button', { name: 'Tạo phòng mới' }).click();
  await expect(pa.locator('.tc-lobby-eyebrow')).toHaveText('PHÒNG RIÊNG · 2v2');
  await expect(pa.locator('.tc-team')).toHaveCount(2);
  const code = (await pa.locator('.tc-roomcode').innerText()).replace(' ', '');
  await pb.locator('.tc-code').fill(code); await pb.getByRole('button', { name: 'Vào phòng' }).click();
  await expect(pb.locator('.tc-team-us')).toContainText('Bình (anh)');
  await expect(pa.locator('.tc-team-them')).toContainText('Bình');                   // filled on team B first
  await pb.getByRole('button', { name: 'Sang đội kia' }).click();
  await expect(pa.locator('.tc-team-us')).toContainText('Bình');                     // now An's team-mate
  for (const p of [pc, pd]) { await p.locator('.tc-code').fill(code); await p.getByRole('button', { name: 'Vào phòng' }).click(); await expect(p.locator('.tc-roomcode')).toBeVisible(); }
  await expect(pa.locator('.tc-team-them .tc-seat:not(.tc-seat-empty)')).toHaveCount(2);
  const ps = await open(browser, 'Xem');
  await ps.locator('.tc-code').fill(code); await ps.getByRole('button', { name: 'Xem trận' }).click();
  await expect(ps.locator('.tc-lobby-eyebrow')).toHaveText('ĐANG XEM · 2v2');
  await expect(ps.locator('.tc-ready')).toBeHidden();
  await expect(pa.locator('.tc-watchers')).toHaveText('1 người đang xem');
  for (const p of [pa, pb, pc, pd]) await p.locator('.tc-ready').click();
  for (const p of [pa, pb, pc, pd, ps]) await expect(p.locator('.tc-overlay')).toBeHidden({ timeout: 8000 });
  await expect(pa.locator('.tc-mode')).toHaveText('ONLINE 2v2 · HIỆP 1');
  await expect(ps.locator('.tc-mode')).toHaveText('ĐANG XEM · ONLINE 2v2 · HIỆP 1');
  await expect(ps.locator('.tc-shield')).toBeHidden();                              // spectators get no controls
  await expect(pa.locator('.tc-player')).toContainText('BẠN + BÌNH');
  const snap = await state(pa); expect(snap.mode).toBe('squad'); expect(snap.width).toBe(1040); expect(snap.tanks.map(t => t.id)[0]).toBe('a');
  // With a live team-mate there is no surrender, and leaving only takes your own tank out.
  await pa.locator('canvas').click({ position: { x: 5, y: 5 } }).catch(() => {}); await pa.keyboard.press('Escape');
  await expect(pa.getByRole('button', { name: 'Đầu hàng' })).toHaveCount(0);
  await expect(pa.getByRole('button', { name: 'Rời trận (xe bị loại)' })).toBeVisible();
  await pa.getByRole('button', { name: 'Quay lại trận' }).click();
  await pb.keyboard.press('Escape'); await pb.getByRole('button', { name: 'Rời trận (xe bị loại)' }).click();
  await expect(pa.locator('.tc-tip')).toContainText('Đồng đội Bình đã rời trận');
  await expect(pa.locator('.tc-overlay')).toBeHidden();                              // the note never blocks play
  await pa.keyboard.press('Escape'); await pa.getByRole('button', { name: 'Đầu hàng' }).click();
  await expect(pa.locator('#tc-dialog-title')).toHaveText('Đội đối thủ thắng trận này.', { timeout: 5000 });
  await expect(pa.locator('.tc-dialog')).toContainText('Đội anh đã đầu hàng.');
  await expect(pc.locator('#tc-dialog-title')).toHaveText('Đội anh thắng trận!');
  await expect(pc.locator('.tc-dialog')).toContainText('Đội đối thủ đã đầu hàng.');
  await expect(ps.locator('#tc-dialog-title')).toHaveText('Đội B thắng trận.');
  await expect(ps.locator('.tc-leave')).toHaveText('Ngừng xem');
  noErrors([pa, pb, pc, pd, ps]);
});

test('2v2 queue: a party of two and two solo players are matched, teams kept, match starts without ready', async ({ browser }) => {
  const [pa, pb, pc, pd] = await Promise.all(['Anh', 'Bảo', 'Cúc', 'Duy'].map(n => open(browser, n)));
  await pa.getByLabel('2v2').check(); await pa.getByRole('button', { name: 'Tạo phòng mới' }).click();
  const code = (await pa.locator('.tc-roomcode').innerText()).replace(' ', '');
  await pb.locator('.tc-code').fill(code); await pb.getByRole('button', { name: 'Vào phòng' }).click();
  await expect(pa.locator('.tc-seat:not(.tc-seat-empty)')).toHaveCount(2);
  await expect(pb.locator('.tc-find-party')).toBeHidden();                           // only the host can queue the party
  await pa.locator('.tc-find-party').click();
  await expect(pa.locator('.tc-lobby-hint')).toContainText('Đang tìm trận 2v2');
  await expect(pb.locator('.tc-cancel-find')).toBeVisible(); await expect(pb.locator('.tc-ready')).toBeHidden();
  await pc.getByRole('button', { name: 'Tìm trận 2v2', exact: true }).click();
  await expect(pc.locator('#tc-dialog-title')).toHaveText('Đang tìm trận…');
  await expect(pc.locator('.tc-queue-timer')).toHaveText(/^0:0\d$/);
  await pd.getByRole('button', { name: 'Tìm trận 2v2', exact: true }).click();
  for (const p of [pa, pb, pc, pd]) await expect(p.locator('.tc-lobby-eyebrow')).toHaveText('TRẬN GHÉP · 2v2');
  await expect(pc.locator('.tc-lobby-hint')).toContainText('Đã ghép trận!');
  await expect(pa.locator('.tc-team-us')).toContainText('Bảo'); await expect(pc.locator('.tc-team-us')).toContainText('Duy');
  await expect(pa.locator('.tc-ready')).toBeHidden(); await expect(pa.locator('.tc-invite')).toBeHidden();
  for (const p of [pa, pb, pc, pd]) await expect(p.locator('.tc-overlay')).toBeHidden({ timeout: 9000 });
  await expect(pd.locator('.tc-mode')).toHaveText('ONLINE 2v2 · HIỆP 1');
  noErrors([pa, pb, pc, pd]);
});

test('waiting alone: after a minute the queue offers bot practice, which leaves the queue and starts local 2v2', async ({ browser }) => {
  const page = await browser.newPage({ viewport: { width: 844, height: 390 } }); opened.push(page);
  await page.clock.install();
  await page.goto(`file://${PREVIEW}?server=ws://127.0.0.1:${PORT}/tank`);
  await page.getByRole('button', { name: /Phòng riêng/ }).click(); await page.locator('.tc-name').fill('Một');
  await page.getByRole('button', { name: 'Tìm trận 2v2', exact: true }).click();
  await expect(page.locator('#tc-dialog-title')).toHaveText('Đang tìm trận…');
  await expect(page.locator('.tc-queue-hint')).toBeHidden();
  await page.clock.fastForward(61_000); await page.clock.runFor(200);
  await expect(page.locator('.tc-queue-hint')).toBeVisible();
  await page.getByRole('button', { name: 'Tiếp tục đợi' }).click(); await page.clock.runFor(200);
  await expect(page.locator('.tc-queue-hint')).toBeHidden();
  await page.getByRole('button', { name: 'Hủy tìm trận' }).click();
  await expect(page.locator('#tc-dialog-title')).toHaveText('Đấu với người thật.');
  await page.getByRole('button', { name: 'Tìm trận 2v2', exact: true }).click();
  await expect(page.locator('#tc-dialog-title')).toHaveText('Đang tìm trận…');      // the wait is timed from when the queue screen appears
  await page.clock.fastForward(61_000); await page.clock.runFor(200);
  await page.getByRole('button', { name: 'Luyện 2v2 với bot' }).click(); await page.clock.runFor(500);
  await expect(page.locator('.tc-mode')).toHaveText('2v2 VỚI BOT · HIỆP 1');
  const health = await (await fetch(`http://127.0.0.1:${PORT}/health`)).json(); expect(health.queued).toBe(0);
});
