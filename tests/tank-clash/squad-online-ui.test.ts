import { reviewURL } from '../helpers/review-url';
import { test, expect, type Page, type Browser, type BrowserContext } from '@playwright/test';
import { execFileSync, spawn, type ChildProcess } from 'node:child_process';
import path from 'node:path';
const PREVIEW = path.resolve('preview/tank-clash/index.html'), PORT = 3292;
let server: ChildProcess, privateServer: ChildProcess;
const contexts: BrowserContext[] = [];
const errors: string[] = [];
// Chrome can retain a stale compositor tile immediately after an orientation change.
const shot = async (page: Page, name: string) => { await page.waitForTimeout(150); return page.screenshot({ path: `test-results/tank-clash-p3d/${name}.png` }); };
test.beforeAll(async () => {
  execFileSync(process.execPath, ['scripts/export-tank-review.mjs'], { stdio: 'ignore' });
  // Guest queue is explicitly a local test facility. Production still requires signed-in accounts.
  server = spawn(process.execPath, ['server/tank-clash-room/server.mjs'], { env: { ...process.env, SUPABASE_URL: '', SUPABASE_ANON_KEY: '', PORT: String(PORT), NODE_ENV: 'development', TANK_QUEUE_GUESTS: '1' }, stdio: 'ignore' });
  await expect.poll(async () => { try { return (await fetch(`http://127.0.0.1:${PORT}/health`)).ok; } catch { return false; } }).toBe(true);
});
test.afterAll(() => { server?.kill(); privateServer?.kill(); });
test.afterEach(async () => { await Promise.all(contexts.splice(0).map(c => c.close())); expect(errors.splice(0)).toEqual([]); });
async function open(browser: Browser, name: string, viewport = { width: 1280, height: 760 }) {
  const context = await browser.newContext({ viewport }); contexts.push(context);
  const page = await context.newPage(); page.on('pageerror', e => errors.push(e.message));
  await page.goto(reviewURL(test.info(), PREVIEW, { server: `ws://127.0.0.1:${PORT}/tank` }));
  await page.locator('.tc-card-online').click(); await page.locator('.tc-name').fill(name);
  return page;
}
async function restore(browser: Browser, name: string, saved: string) {
  const context=await browser.newContext({viewport:{width:1280,height:760}});contexts.push(context);
  await context.addInitScript(saved=>sessionStorage.setItem('tank-clash.seat',saved),saved);
  const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
  await page.goto(reviewURL(test.info(), PREVIEW, { server: `ws://127.0.0.1:${PORT}/tank` }));await page.locator('.tc-card-online').click();return page;
}

const roomCode = async (p: Page) => (await p.locator('.tc-roomcode').innerText()).replace(' ', '');
async function join(p: Page, code: string, watch = false) { await p.locator('.tc-code').fill(code); await p.getByRole('button', { name: watch ? 'Vào xem' : 'Vào phòng', exact: true }).click(); }
async function leaveMatch(p: Page) { await p.locator('[data-action="menu"]').click(); await p.getByRole('button', { name: 'Rời trận (xử thua)' }).click(); }
async function snap(p: Page) { return p.evaluate(() => (window as unknown as { __tankClash: { snapshot(): { tanks: { id: string; hp: number; x: number; y: number }[]; tick: number; mode: string } } }).__tankClash.snapshot()); }
async function fits(p: Page) {
  const bounds = await p.locator('.tc-dialog').boundingBox(); const viewport = p.viewportSize()!;
  expect(bounds!.x).toBeGreaterThanOrEqual(0); expect(bounds!.y).toBeGreaterThanOrEqual(0);
  expect(bounds!.width).toBeLessThanOrEqual(viewport.width); expect(bounds!.height).toBeLessThanOrEqual(viewport.height);
  // The standard lobby must fit without inner scrolling; all footer actions remain visible.
  const overflow = await p.locator('.tc-online-content').evaluate(el => el.scrollHeight - el.clientHeight);
  expect(overflow).toBeLessThanOrEqual(2);
  for (const b of await p.locator('.tc-dialogfoot button:visible').all()) { const box = (await b.boundingBox())!; expect(box.y + box.height).toBeLessThanOrEqual(viewport.height); }
}

test('private 2v2: four seats, host/team controls, spectator, surrender, result and four-player rematch', async ({ browser }) => {
  test.setTimeout(90_000);
  const [a, b, c, d, watcher] = await Promise.all(['An', 'Bình', 'Chi', 'Dũng', 'Khán giả'].map(n => open(browser, n)));
  await a.getByRole('button', { name: 'Tạo phòng 2v2', exact: true }).click();
  const code = await roomCode(a); await join(b, code);
  await a.getByRole('button', { name: 'Chuyển Bình sang đội A' }).click();
  await expect(b.locator('.tc-seat[data-seat="a2"]')).toContainText('Bình (anh)');
  await expect(a.locator('.tc-party-queue')).toBeVisible();
  await b.getByRole('button', { name: 'Sang đội kia' }).click();
  await expect(b.locator('.tc-seat[data-seat="b"]')).toContainText('Bình (anh)');
  await join(c, code); await join(d, code); await join(watcher, code, true);
  for (const p of [a, b, c, d]) { await expect(p.locator('.tc-seat')).toHaveCount(4); await expect(p.locator('.tc-seats')).not.toContainText('BOT'); await fits(p); }
  await expect(watcher.locator('.tc-ready')).toBeHidden();
  await expect(a.locator('.tc-spectators')).toContainText('1 người xem');
  for (const viewport of [{ width: 1280, height: 760 }, { width: 390, height: 844 }, { width: 844, height: 390 }]) {
    await a.setViewportSize(viewport); await fits(a); await shot(a, `lobby-${viewport.width}x${viewport.height}`);
  }
  await a.setViewportSize({ width: 1280, height: 760 });
  // Frequent room messages preserve focus on the actual control being used.
  await a.locator('.tc-ready').focus(); await b.locator('.tc-ready').click();
  await expect(a.locator('.tc-ready')).toBeFocused();
  for (const p of [a, c, d]) await p.locator('.tc-ready').click();
  for (const p of [a, b, c, d, watcher]) await expect(p.locator('.tc-overlay')).toBeHidden({ timeout: 8000 });
  for (const p of [a, b, c, d]) { await expect(p.locator('.tc-mode')).toHaveText('ONLINE 2v2 · HIỆP 1'); await expect(p.locator('.tc-tank-hp')).toHaveCount(4); }
  await expect(watcher.locator('.tc-task')).toContainText('ĐANG XEM');
  await expect(watcher.locator('.tc-move')).toBeHidden();
  for(const viewport of [{width:1280,height:760},{width:390,height:844},{width:844,height:390}]){
    await a.setViewportSize(viewport);await shot(a,`match-${viewport.width}x${viewport.height}`);
    const field=(await a.locator('canvas').boundingBox())!;expect(field.width).toBeGreaterThan(100);expect(field.height).toBeGreaterThan(60);
  }
  await a.setViewportSize({width:1280,height:760});
  const start = await snap(a); await a.keyboard.down('s'); await a.waitForTimeout(400); await a.keyboard.up('s');
  await expect.poll(async () => (await snap(b)).tanks.find(t => t.id === 'a')!.y).toBeGreaterThan(start.tanks.find(t => t.id === 'a')!.y + 10);
  // A cannot surrender with a live team-mate. C leaves; A gets a nonblocking toast and can now confirm surrender.
  await a.locator('[data-action="menu"]').click(); await expect(a.locator('[data-action="ask-surrender"]')).toBeHidden(); await a.getByRole('button', { name: 'Quay lại trận' }).click();
  await leaveMatch(c); await expect(a.locator('.tc-net-toast')).toContainText('Chi');
  await expect(a.locator('.tc-overlay')).toBeHidden();
  await a.locator('[data-action="menu"]').click(); await a.getByRole('button', { name: 'Đầu hàng', exact: true }).click();
  await expect(a.locator('#tc-dialog-title')).toHaveText('Xác nhận đầu hàng?');
  await a.getByRole('button', { name: 'Xác nhận đầu hàng', exact: true }).click();
  await expect(a.locator('#tc-dialog-title')).toHaveText('Đội đối thủ thắng.');
  await expect(b.locator('#tc-dialog-title')).toHaveText('Đội anh thắng!');
  await expect(watcher.locator('#tc-dialog-title')).toHaveText('Đội B thắng!');
  await expect(a.locator('.tc-result-players')).toContainText('Đã bỏ trận'); await shot(a, 'result-1280x760');
  await c.locator('.tc-card-online').click(); await c.locator('.tc-name').fill('Chi'); await join(c, code);
  for (const p of [a, b, c, d]) await p.locator('.tc-ready').click();
  for (const p of [a, b, c, d]) await expect(p.locator('.tc-overlay')).toBeHidden({ timeout: 8000 });
  expect((await snap(a)).tanks.every(t => t.hp === 3)).toBe(true);
});

test('solo queue: running clock, 60-second choice, cancel releases the place and bot practice is local', async ({ browser }) => {
  const p = await open(browser, 'Chờ trận', { width: 390, height: 844 });
  await p.clock.install(); await p.getByRole('button', { name: 'Tìm trận 2v2', exact: true }).click();
  await expect(p.locator('.tc-queue-size')).toContainText('1 người');
  await p.clock.fastForward(61_000); await expect(p.locator('.tc-queue-hint')).toBeVisible();
  await expect(p.locator('.tc-queue-wait')).toHaveText('01:01');
  for(const viewport of [{width:1280,height:760},{width:390,height:844},{width:844,height:390}]){await p.setViewportSize(viewport);await shot(p,`queue-${viewport.width}x${viewport.height}`);await expect(p.getByRole('button',{name:'Hủy tìm trận',exact:true})).toBeInViewport();}
  await p.setViewportSize({width:390,height:844});
  await p.getByRole('button', { name: 'Tiếp tục đợi' }).click(); await p.clock.runFor(200);
  await expect(p.locator('.tc-queue-hint')).toBeHidden();
  await p.getByRole('button', { name: 'Hủy tìm trận' }).click();
  await expect(p.locator('.tc-name')).toBeVisible();
  await expect.poll(async () => (await (await fetch(`http://127.0.0.1:${PORT}/health`)).json()).queued).toBe(0);
  await p.getByRole('button', { name: 'Tìm trận 2v2', exact: true }).click();
  await expect(p.locator('.tc-queue-size')).toContainText('1 người'); await p.clock.fastForward(61_000);
  await p.getByRole('button', { name: 'Luyện với bot' }).click(); await p.clock.resume();
  await expect(p.locator('.tc-mode')).toHaveText('2v2 VỚI BOT · HIỆP 1');
  await expect.poll(async () => (await (await fetch(`http://127.0.0.1:${PORT}/health`)).json()).queued).toBe(0);
  expect((await snap(p)).mode).toBe('squad');
});

test('two parties: either member cancels; matchmaking keeps teams; drop in countdown returns to queue', async ({ browser }) => {
  test.setTimeout(60_000);
  const [a, b, c, d] = await Promise.all(['Tổ A1', 'Tổ A2', 'Tổ B1', 'Tổ B2'].map(n => open(browser, n)));
  for (const [host, mate] of [[a, b], [c, d]]) {
    await host.getByRole('button', { name: 'Tạo phòng 2v2', exact: true }).click(); await join(mate, await roomCode(host));
    await mate.getByRole('button', { name: 'Sang đội kia' }).click();
    await expect(host.locator('.tc-party-queue')).toBeVisible();
  }
  await a.locator('.tc-party-queue').click();
  for (const p of [a, b]) await expect(p.locator('.tc-queue-size')).toContainText('2 người');
  await b.getByRole('button', { name: 'Hủy tìm trận' }).click();
  for (const p of [a, b]) await expect(p.locator('.tc-roomcode')).toBeVisible();
  await a.locator('.tc-party-queue').click(); await c.locator('.tc-party-queue').click();
  for (const p of [a, b, c, d]) await expect(p.locator('.tc-lobby-hint')).toContainText('Đã đủ bốn người');
  await d.getByRole('button', { name: 'Rời phòng', exact: true }).click();
  for (const p of [a, b, c]) await expect(p.locator('.tc-queue-wait')).toBeVisible();
  await a.getByRole('button', { name: 'Hủy tìm trận' }).click(); await c.getByRole('button', { name: 'Hủy tìm trận' }).click();
  for (const p of [a, b, c]) await expect(p.locator('.tc-roomcode')).toBeVisible();
});


test('matched party + two solos: all four see result; rematch clock advances then returns party together without requeue',async({browser})=>{
 test.setTimeout(65_000);
 const [a,mate,b,d]=await Promise.all(['Tổ trưởng','Đồng đội','Lẻ B','Lẻ D'].map(n=>open(browser,n)));
 await a.getByRole('button',{name:'Tạo phòng 2v2',exact:true}).click();await join(mate,await roomCode(a));await mate.getByRole('button',{name:'Sang đội kia',exact:true}).click();
 await a.locator('.tc-party-queue').click();for(const p of [b,d])await p.getByRole('button',{name:'Tìm trận 2v2',exact:true}).click();
 for(const p of [a,mate,b,d])await expect(p.locator('.tc-overlay')).toBeHidden({timeout:8000});
 await expect(a.locator('.tc-tank-hp')).toHaveCount(4);await expect(b.locator('.tc-player')).toContainText('ĐỘI ANH');
 const saved=await mate.evaluate(()=>sessionStorage.getItem('tank-clash.seat'));expect(saved).toBeTruthy();
 const hp=(await snap(mate)).tanks.find(t=>t.id==='a2')!.hp;await mate.close();
 await expect(a.locator('.tc-net-toast')).toContainText('mất kết nối');await expect(a.locator('.tc-overlay')).toBeHidden();
 const reconnected=await restore(browser,'Đồng đội',saved!);await expect(reconnected.locator('.tc-overlay')).toBeHidden();expect((await snap(reconnected)).tanks.find(t=>t.id==='a2')!.hp).toBe(hp);await expect(a.locator('.tc-net-toast')).toContainText('đã kết nối lại');await reconnected.close();await expect(a.locator('.tc-net-toast')).toContainText('mất kết nối');
 await a.locator('[data-action="menu"]').click();await a.getByRole('button',{name:'Đầu hàng',exact:true}).click();await a.getByRole('button',{name:'Xác nhận đầu hàng',exact:true}).click();
 const again=await restore(browser,'Đồng đội',saved!);await expect(again.locator('#tc-dialog-title')).toHaveText('Đội đối thủ thắng.');
 const ids=await Promise.all([a,again,b,d].map(p=>p.locator('.tc-note').filter({hasText:'Mã trận'}).innerText()));expect(new Set(ids).size).toBe(1);
 await expect(b.locator('#tc-dialog-title')).toHaveText('Đội anh thắng!');await expect(d.locator('#tc-dialog-title')).toHaveText('Đội anh thắng!');
 const initial=await a.locator('.tc-rematch-time').innerText();await a.waitForTimeout(1200);await expect(a.locator('.tc-rematch-time')).not.toHaveText(initial);
 for(const viewport of [{width:1280,height:760},{width:390,height:844},{width:844,height:390}]){
  await a.setViewportSize(viewport);await shot(a,`result-${viewport.width}x${viewport.height}`);
  for(const button of await a.locator('.tc-dialogfoot button:visible').all()){const r=(await button.boundingBox())!;expect(r.y+r.height).toBeLessThanOrEqual(viewport.height);}
 }
 await a.setViewportSize({width:1280,height:760});await a.locator('.tc-ready').click();
 // A single vote cannot hold the room forever. Let the real server's 20-second window expire.
 await expect(a.locator('.tc-party-queue')).toBeVisible({timeout:23000});await expect(again.locator('.tc-roomcode')).toHaveText(await a.locator('.tc-roomcode').innerText());
 for(const p of [b,d])await expect(p.locator('.tc-name')).toBeVisible();
 for(const p of [a,again]){await expect(p.locator('.tc-seat:not(.tc-seat-empty)')).toHaveCount(2);await expect(p.locator('.tc-queue-wait')).toHaveCount(0);}
 expect((await(await fetch(`http://127.0.0.1:${PORT}/health`)).json()).queued).toBe(0);
});

test('failed queue cancellation stays online; retry cancels before local bot practice',async({browser})=>{
 const context=await browser.newContext({viewport:{width:390,height:844}});contexts.push(context);let reject=true;
 await context.routeWebSocket(`ws://127.0.0.1:${PORT}/tank`,socket=>{const backend=socket.connectToServer();socket.onMessage(data=>{
  if(JSON.parse(String(data)).type==='unqueue'&&reject){reject=false;socket.send(JSON.stringify({type:'error',code:'WRONG_PHASE',message:'Chưa hủy được, thử lại.',fatal:false}));}else backend.send(data);
 });});
 const p=await context.newPage();p.on('pageerror',e=>errors.push(e.message));await p.goto(reviewURL(test.info(), PREVIEW, { server: `ws://127.0.0.1:${PORT}/tank` }));await p.locator('.tc-card-online').click();await p.locator('.tc-name').fill('Thử hủy');await p.clock.install();
 await p.getByRole('button',{name:'Tìm trận 2v2',exact:true}).click();await expect(p.locator('.tc-queue-wait')).toBeVisible();await p.clock.fastForward(61000);await p.getByRole('button',{name:'Luyện với bot',exact:true}).click();await p.clock.runFor(200);
 await expect(p.locator('.tc-net-status')).toContainText('Chưa hủy được');await expect(p.locator('.tc-queue-wait')).toBeVisible();
 await p.getByRole('button',{name:'Luyện với bot',exact:true}).click();await p.clock.resume();await expect(p.locator('.tc-mode')).toHaveText('2v2 VỚI BOT · HIỆP 1');await expect.poll(async()=>(await(await fetch(`http://127.0.0.1:${PORT}/health`)).json()).queued).toBe(0);
});

test('public queue requires login on the normal server; private 2v2 remains available',async({browser})=>{
 privateServer=spawn(process.execPath,['server/tank-clash-room/server.mjs'],{env:{...process.env,SUPABASE_URL:'',SUPABASE_ANON_KEY:'',PORT:String(PORT+1),NODE_ENV:'development',TANK_QUEUE_GUESTS:'0'},stdio:'ignore'});
 await expect.poll(async()=>{try{return(await fetch(`http://127.0.0.1:${PORT+1}/health`)).ok;}catch{return false;}}).toBe(true);
 const p=await open(browser,'Khách');await p.locator('.tc-advanced summary').click();await p.locator('.tc-server').fill(`ws://127.0.0.1:${PORT+1}/tank`);await p.getByRole('button',{name:'Tìm trận 2v2',exact:true}).click();await expect(p.locator('.tc-net-status')).toContainText('Cần đăng nhập');await expect(p.locator('.tc-queue-wait')).toHaveCount(0);
 await p.getByRole('button',{name:'Tạo phòng 2v2',exact:true}).click();await expect(p.locator('.tc-roomcode')).toBeVisible();await expect(p.locator('.tc-seat-empty')).toHaveCount(3);
});
