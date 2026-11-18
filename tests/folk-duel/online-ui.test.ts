import { test, expect, type Browser, type BrowserContext, type Page } from '@playwright/test';
import { PGlite } from '@electric-sql/pglite';
import { build } from 'esbuild';
import { createRequire } from 'node:module';
import { spawn, type ChildProcess } from 'node:child_process';
import { mkdtempSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import type { FolkOnlineRoom, FolkRequest } from '../../src/games/folk-duel/online-protocol';

const port = 4361;
const base = `http://127.0.0.1:${port}`;
const api = 'https://folk.example';
const contexts: BrowserContext[] = [];
const errors: string[] = [];
let vite: ChildProcess;
let db: PGlite;
let originalFetch: typeof fetch;
let handle: (req: Request, env: object, now?: number) => Promise<Response>;
let advance = 0;
let last: Record<string, FolkOnlineRoom> = {};
let dropNext = false;
let dropped: FolkRequest | null = null;
let replayed = false;
const uuid = (n: number) => `00000000-0000-4000-8000-${String(n).padStart(12, '0')}`;

test.beforeAll(async () => {
  db = new PGlite();
  await db.waitReady;
  await db.exec('create role anon; create role authenticated; create role service_role bypassrls;');
  await db.exec(readFileSync('supabase/folk-duel/schema.sql', 'utf8'));
  originalFetch = globalThis.fetch;
  globalThis.fetch = async (input, init) => {
    const url = String(input);
    const headers = new Headers(init?.headers);
    if (url === api + '/auth/v1/user') {
      const payload = JSON.parse(Buffer.from(headers.get('Authorization')!.split('.')[1], 'base64url').toString());
      return Response.json({ id: payload.sub, is_anonymous: false });
    }
    const rpc = url.match(/\/rpc\/(folk_room_\w+)$/)?.[1];
    if (!rpc) return originalFetch(input, init);
    const args = JSON.parse(String(init?.body));
    const keys = Object.keys(args);
    try {
      const response = await db.query<{ doc: unknown }>(`select public.${rpc}(${keys.map((key, i) => `${key} => $${i + 1}`).join(',')}) doc`,
        keys.map(key => typeof args[key] === 'object' && args[key] !== null ? JSON.stringify(args[key]) : args[key]));
      return Response.json(response.rows[0]?.doc ?? null);
    } catch (error) { return Response.json({ message: (error as Error).message }, { status: 400 }); }
  };
  const temp = mkdtempSync(join(tmpdir(), 'folk-online-ui-'));
  const outfile = join(temp, 'edge.cjs');
  await build({ entryPoints: ['supabase/functions/folk-duel-room/index.ts'], outfile, bundle: true, format: 'cjs', platform: 'node' });
  handle = createRequire(import.meta.url)(outfile).handleFolkRequest;
  vite = spawn(process.execPath, ['node_modules/vite/bin/vite.js', '--host', '127.0.0.1', '--port', String(port), '--strictPort'], {
    stdio: 'ignore', env: { ...process.env, VITE_SUPABASE_URL: api, VITE_SUPABASE_PUBLISHABLE_KEY: 'sb_publishable_fixture', VITE_FOLK_ONLINE: '1' },
  });
  await expect.poll(async () => { try { return (await originalFetch(base)).ok; } catch { return false; } }).toBe(true);
});

test.afterEach(async () => {
  await Promise.all(contexts.splice(0).map(context => context.close()));
  expect(errors.splice(0)).toEqual([]);
  advance = 0;
  last = {};
});

test.afterAll(async () => {
  vite?.kill();
  globalThis.fetch = originalFetch;
  await db?.close();
});

async function player(browser: Browser, n: number, game: string, phone = false) {
  const context = await browser.newContext({ viewport: phone ? { width: 390, height: 844 } : { width: 1280, height: 900 }, serviceWorkers: 'block' });
  contexts.push(context);
  const page = await context.newPage();
  page.on('pageerror', error => errors.push(error.message));
  const user = { id: uuid(n), aud: 'authenticated', is_anonymous: false, email: `tester${n}@arcadex.test`,
    app_metadata: {}, user_metadata: { username: `Tester ${n}` }, created_at: '2026-11-18T00:00:00Z' };
  const exp = Math.floor(Date.now() / 1000) + 3600;
  const token = `eyJhbGciOiJIUzI1NiJ9.${Buffer.from(JSON.stringify({ sub: user.id, exp })).toString('base64url')}.fixture`;
  await page.addInitScript(({ user, exp, token }) => {
    localStorage.setItem('sb-folk-auth-token', JSON.stringify({
      access_token: token, refresh_token: 'fixture', expires_at: exp, expires_in: 3600, token_type: 'bearer', user,
    }));
  }, { user, exp, token });

  await page.route('**/*', async route => {
    const req = route.request();
    const url = new URL(req.url());
    if (url.origin === base) return route.continue();
    if (url.origin !== api) return route.abort();
    if (url.pathname === '/auth/v1/user') return route.fulfill({ json: user });
    if (url.pathname === '/functions/v1/folk-duel-room') {
      const body = req.postDataJSON() as FolkRequest;
      const response = await handle(new Request(req.url(), { method: req.method(), headers: req.headers(), body: req.postData() }),
        { url: api, key: 'fixture-service' }, Date.now() + advance);
      const reply = await response.json();
      if (reply.room && (!last[user.id] || last[user.id].roomId !== reply.room.roomId || last[user.id].version <= reply.room.version)) last[user.id] = reply.room;
      if (dropNext && body.type === 'command') {
        dropped = body;
        dropNext = false;
        return route.abort();
      }
      if (dropped && body.type === 'command' && body.actionId === (dropped as { actionId: string }).actionId) {
        expect(body).toEqual(dropped);
        replayed = true;
      }
      return route.fulfill({ status: response.status, json: reply });
    }
    if (url.pathname.endsWith('/arcadex_get_identity')) return route.fulfill({ json: { display_name: user.user_metadata.username, avatar: '🎮' } });
    return route.fulfill({ json: [] });
  });
  await page.goto(base + '/?review=' + game);
  await expect(page.locator('#game-wrapper-viewport')).toBeVisible({ timeout: 20000 });
  const collapse = page.getByRole('button', { name: 'Thu chat về bubble' });
  if (await collapse.isVisible()) await collapse.click();
  return page;
}

async function enter(a: Page, b: Page) {
  await a.getByRole('button', { name: /Tạo Phòng Riêng/ }).click();
  const code = await a.getByTestId('folk-room-code').innerText();
  await b.getByRole('button', { name: /Nhập Mã Vào Phòng/ }).click();
  await b.getByLabel('Mã phòng 6 ký tự').fill(code);
  await b.getByRole('button', { name: 'Vào Phòng', exact: true }).click();
  await expect(a.locator('.fd-board-stage')).toBeVisible({ timeout: 10000 });
  await expect(b.locator('.fd-board-stage')).toBeVisible({ timeout: 10000 });
}

async function chat(a: Page, b: Page, text: string) {
  await a.getByRole('button', { name: /^Mở chat/ }).click();
  await expect(a.getByRole('button', { name: 'Trận', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await a.getByLabel('Nội dung tin nhắn').fill(text);
  await a.getByRole('button', { name: 'Gửi ↗', exact: true }).click();
  await expect(a.locator('.social-message p').filter({ hasText: text })).toHaveCount(1);
  await a.getByRole('button', { name: 'Thu chat về bubble' }).click();
  await expect(b.locator('.chat-unread-dot')).toBeVisible({ timeout: 8000 });
  const speech = b.locator('.chat-opponent-speech');
  await expect(speech).toContainText(text);
  const overlapsBoard = await speech.evaluate(element => {
    const speechBox = element.getBoundingClientRect();
    return [...document.querySelectorAll('.fd-oaq-board, .fd-court canvas, .fd-room-status')].some(board => {
      const box = board.getBoundingClientRect();
      return speechBox.left < box.right && speechBox.right > box.left && speechBox.top < box.bottom && speechBox.bottom > box.top;
    });
  });
  expect(overlapsBoard).toBe(false);
  await b.getByRole('button', { name: /^Mở chat/ }).click();
  await expect(b.locator('.social-message p').filter({ hasText: text })).toHaveCount(1);
  await b.getByRole('button', { name: 'Thu chat về bubble' }).click();
}

test('Ô Ăn Quan online · chat hai chiều, gửi lặp, vào lại, hết giờ và đấu lại', async ({ browser }) => {
  test.setTimeout(90000);
  const a = await player(browser, 1, 'o-an-quan');
  const b = await player(browser, 2, 'o-an-quan', true);
  await enter(a, b);
  const id = last[uuid(1)].roomId;
  await chat(a, b, 'Chào từ Sân Đình A');
  await chat(b, a, 'Chào từ Sân Đình B');
  await a.locator('[data-folk-cell="1"]').click();
  dropNext = true;
  await a.getByRole('button', { name: /Rải Phải/ }).click();
  await expect(a.getByRole('button', { name: 'Gửi lại thao tác' })).toBeVisible();
  await a.getByRole('button', { name: 'Gửi lại thao tác' }).click();
  await expect.poll(() => replayed).toBe(true);
  await expect.poll(() => last[uuid(1)]?.state.turnNumber).toBe(2);
  await expect(b.locator('[data-folk-seat="P2"]')).toContainText('Đến lượt');
  const skip = a.getByRole('button', { name: 'Bỏ qua hiệu ứng' });
  if (await skip.isVisible()) await skip.click();
  await a.reload();
  await a.getByRole('button', { name: 'Tiếp tục phòng online' }).click();
  await expect(a.locator('.oaq-stage')).toBeVisible();
  expect(last[uuid(1)].roomId).toBe(id);
  await a.getByRole('button', { name: /Lịch sử lượt đi/ }).click();
  await expect(a.getByRole('dialog')).toContainText('ô 1');
  await a.keyboard.press('Escape');
  advance = last[uuid(1)].deadlineAt - Date.now() + 500;
  await expect(a.getByRole('heading', { name: /thắng!/ })).toBeVisible({ timeout: 8000 });
  await expect(a.locator('.fd-reward')).toHaveCount(0);
  await a.getByRole('button', { name: 'Đấu Lại', exact: true }).click();
  await b.getByRole('button', { name: 'Đấu Lại', exact: true }).click();
  await expect(a.locator('.oaq-stage')).toBeVisible({ timeout: 10000 });
  await expect.poll(() => last[uuid(1)]?.matchId).not.toBe(id + '/1');
  expect(last[uuid(1)].state.turn).toBe('P2');
  await expect(a.locator('[data-folk-seat="P2"]')).toContainText('Đến lượt');
  await expect(b.locator('[data-folk-seat="P2"]')).toContainText('Đến lượt');
  await a.screenshot({ path: 'test-results/folk-online/oaq-online.png' });
  await b.screenshot({ path: 'test-results/folk-online/oaq-phone.png' });
  await a.getByRole('button', { name: 'Rời phòng', exact: true }).click();
  await expect(a.getByRole('button', { name: /Tạo Phòng Riêng/ })).toBeVisible();
  await expect(b.locator('.fd-room-status')).toContainText('đã rời trận');
  await expect(b.locator('.chat-opponent-speech')).toHaveCount(0);
});

test('Nhảy Lò Cò online · thảy, từng bước nhảy, nhặt Chàm, đổi lượt và chat', async ({ browser }) => {
  test.setTimeout(90000);
  const a = await player(browser, 3, 'nhay-lo-co');
  const b = await player(browser, 4, 'nhay-lo-co', true);
  await enter(a, b);
  await chat(a, b, 'Cùng nhảy Ngõ Nhỏ');
  // Click at the center of the server-aligned timing meter.
  async function center(page: Page, name: RegExp) {
    await page.getByRole('button', { name }).evaluate(button => new Promise<void>((resolve, reject) => {
      const deadline = performance.now() + 6000;
      function check() {
        const power = Number(document.querySelector<HTMLElement>('[data-folk-power]')?.dataset.folkPower);
        if (!(button as HTMLButtonElement).disabled && power >= 44 && power <= 55) { (button as HTMLButtonElement).click(); resolve(); }
        else if (performance.now() > deadline) reject(new Error('Không canh được vùng lực.'));
        else requestAnimationFrame(check);
      }
      check();
    }));
  }
  await center(a, /THẢY CHÀM/);
  await expect(a.getByRole('button', { name: /1 CHÂN/, exact: false })).toBeVisible();
  for (let i = 0; i < 20 && last[uuid(3)].state.turn === 'P1'; i++) {
    const version = last[uuid(3)].version;
    await expect(a.locator('.fd-board-stage')).toHaveAttribute('data-folk-version', String(version));
    if (last[uuid(3)].nlc?.phase === 'PICKUP') {
      await center(a, /NHẶT CHÀM/);
    } else {
      const court = a.locator('.fd-court');
      const hint = await court.innerText();
      const two = /\(2 CHÂN\)/.test(hint);
      await a.getByRole('button', { name: two ? /2 CHÂN/ : /1 CHÂN/ }).click();
    }
    await expect.poll(() => last[uuid(3)]?.version).toBeGreaterThan(version);
  }
  expect(last[uuid(3)].state.turn).toBe('P2');
  expect((last[uuid(3)].state as { houses: Record<number, string> }).houses[1]).toBe('P1');
  await expect(b.getByRole('button', { name: /THẢY CHÀM/ })).toBeVisible();
  await chat(b, a, 'Đã tới lượt bên xanh');
  await a.screenshot({ path: 'test-results/folk-online/nlc-online.png' });
  await b.screenshot({ path: 'test-results/folk-online/nlc-phone.png' });
  await b.reload();
  await b.getByRole('button', { name: 'Tiếp tục phòng online' }).click();
  await expect(b.getByRole('button', { name: /THẢY CHÀM/ })).toBeVisible();
});
