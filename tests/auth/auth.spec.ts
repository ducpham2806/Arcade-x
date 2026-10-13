import { enterLauncher } from '../qc/helpers';
import { test, expect, type Page } from '@playwright/test';
import { mockSupabase } from './backend';
async function openAuth(page: Page, mode: 'login'|'register'='login') {
  if (!await page.locator('#auth-entry-screen').isVisible()) await page.evaluate(() => window.dispatchEvent(new CustomEvent('arcadex:open_modal',{detail:{modal:'auth'}})));
  await page.locator(`#tab-auth-${mode}`).click();
}
async function register(page: Page, email: string, keep=true) {
  await openAuth(page,'register');
  await page.locator('#input-reg-email').fill(email);
  await page.locator('#input-reg-password').fill('TestPassword123!');
  await page.locator('#input-reg-confirm-password').fill('TestPassword123!');
  await page.locator('#input-keep-guest-data').setChecked(keep);
  await page.locator('#btn-submit-register').click();
  await expect.poll(async () => await page.locator('#input-setup-name').isVisible() || (await page.locator('#auth-entry-screen').innerText().catch(()=>'' )).includes('Hãy mở email')).toBe(true);
  if (await page.locator('#input-setup-name').isVisible()) { await page.locator('#input-setup-name').fill(email==='player-b@example.com' ? 'Game thủ thứ hai' : 'Game thủ thử nghiệm'); await page.locator('#btn-complete-profile').click(); await page.locator('#game-library').waitFor(); }
}
async function login(page: Page,email:string,password='TestPassword123!') {
  await openAuth(page);await page.locator('#input-login-identifier').fill(email);await page.locator('#input-login-password').fill(password);await page.locator('#btn-submit-login').click();
}
async function profile(page: Page) { return page.evaluate(()=>JSON.parse(localStorage.getItem('arcadex_player_profile')!)); }
async function current(page: Page) { return page.evaluate(()=>JSON.parse(localStorage.getItem('arcadex_current_user')||'null')); }
async function logout(page: Page) { await page.locator('#game-card-tile-2048').waitFor(); await page.evaluate(()=>window.dispatchEvent(new CustomEvent('arcadex:open_modal',{detail:{modal:'auth'}})));await page.locator('#btn-logout-account').click();await expect.poll(()=>current(page)).toBeNull();await enterLauncher(page);await page.locator('#game-card-tile-2048').waitFor(); }
async function seed(page: Page,coins:number,progress:string) {
  await page.evaluate(({coins,progress})=>{
    const root=document.querySelector('#root') as any;
    let fiber=root[Object.keys(root).find(k=>k.startsWith('__reactContainer$'))!];
    if(fiber.stateNode?.current)fiber=fiber.stateNode.current;
    let player:any;
    function visit(f:any){if(!f||player)return;if(f.memoizedProps?.value?.addCoins){player=f.memoizedProps.value;return;}visit(f.child);visit(f.sibling);}
    visit(fiber);if(!player)throw new Error('Player context not ready');
    const delta=coins-player.profile.coins;
    if(delta>0)player.addCoins(delta);else if(delta<0)player.spendCoins(-delta);
    localStorage.setItem('car-escape-progress-v2',progress);
  }, {coins,progress});
  await expect.poll(async()=> (await profile(page)).coins).toBe(coins);
}

test('Guest can play without registering; forms validate passwords',async({page,context})=>{
  const backend=mockSupabase();await backend.install(context);await page.goto('/');await page.locator('#tab-auth-register').click();
  await page.locator('#input-reg-email').fill('guest@example.com');
  await page.locator('#input-reg-password').fill('Password123');await page.locator('#input-reg-confirm-password').fill('Different123');await page.locator('#btn-submit-register').click();
  await expect(page.getByRole('alert')).toContainText('không trùng khớp');await page.locator('#btn-auth-play-guest').click();
  await expect.poll(()=>current(page)).toBeNull();await page.locator('button[id^="btn-play-"][id$="tile-2048"]').first().click();
  await expect(page.locator('#game-viewport-stage')).toBeVisible();await page.keyboard.press('ArrowLeft');
  await expect(page.locator('#game-viewport-stage')).toContainText(/điểm số/i);
});

test('Confirmed signup, logout and login isolate guest and account data',async({page,context})=>{
  const backend=mockSupabase();await backend.install(context);await page.goto('/');await enterLauncher(page);
  await seed(page,777,'17');await register(page,'player-a@example.com');
  await expect.poll(async()=> (await current(page))?.email).toBe('player-a@example.com');
  expect((await profile(page)).username).toBe('Game thủ thử nghiệm');expect((await profile(page)).coins).toBe(777);
  await seed(page,444,'88');await page.evaluate(async()=>{const source='/src/services/auth.ts';const{AuthService}=await import(source);await AuthService.checkpoint();});
  await logout(page);expect((await profile(page)).coins).toBe(777);
  expect(await page.evaluate(()=>localStorage.getItem('car-escape-progress-v2'))).toBe('17');
  await login(page,'player-a@example.com','WrongPassword123');await expect(page.getByRole('alert')).toContainText('Email hoặc mật khẩu');
  await page.locator('#input-login-password').fill('TestPassword123!');await page.locator('#btn-submit-login').click();
  await expect.poll(async()=> (await current(page))?.email).toBe('player-a@example.com');expect((await profile(page)).coins).toBe(444);
  expect(await page.evaluate(()=>localStorage.getItem('car-escape-progress-v2'))).toBe('88');
  const stored=await page.evaluate(()=>Object.values(localStorage).join(' '));expect(stored).not.toContain('TestPassword123!');expect(stored).not.toContain('passwordHash');
  await logout(page);await register(page,'player-b@example.com',false);
  await expect.poll(async()=> (await current(page))?.email).toBe('player-b@example.com');expect((await profile(page)).coins).toBe(200);
  expect(await page.evaluate(()=>localStorage.getItem('car-escape-progress-v2'))).toBeNull();
});

test('Email confirmation keeps guest playable until verified',async({page,context})=>{
  const backend=mockSupabase();await backend.install(context);await page.goto('/');await enterLauncher(page);
  await seed(page,333,'19');await register(page,'needs-confirm@example.com');
  await expect(page.locator('#auth-entry-screen')).toContainText('Hãy mở email xác nhận');expect(await current(page)).toBeNull();
  await page.locator('#tab-auth-login').click();await page.locator('#input-login-identifier').fill('needs-confirm@example.com');await page.locator('#input-login-password').fill('TestPassword123!');await page.locator('#btn-submit-login').click();
  await expect(page.getByRole('alert')).toContainText('cần xác nhận email');
  backend.confirm('needs-confirm@example.com');await page.locator('#btn-submit-login').click();await page.locator('#input-setup-name').fill('Confirmed player');await page.locator('#btn-complete-profile').click();await page.locator('#game-library').waitFor();
  await expect.poll(async()=> (await current(page))?.email).toBe('needs-confirm@example.com');expect((await profile(page)).coins).toBe(333);
});

test('New device restores account progress; offline logout restores guest',async({page,context,browser})=>{
  const backend=mockSupabase();await backend.install(context);await page.goto('/');await enterLauncher(page);await register(page,'cross-device@example.com',false);
  await expect.poll(async()=> (await current(page))?.email).toBe('cross-device@example.com');await seed(page,654,'42');
  await page.evaluate(async()=>{const source='/src/services/auth.ts';const{AuthService}=await import(source);await AuthService.checkpoint();});
  const other=await browser.newContext({viewport:{width:390,height:844}});await backend.install(other);const mobile=await other.newPage();
  await mobile.goto('/');await mobile.locator('#tab-auth-login').click();await mobile.locator('#input-login-identifier').fill('cross-device@example.com');await mobile.locator('#input-login-password').fill('TestPassword123!');await mobile.locator('#btn-submit-login').click();
  await expect.poll(async()=> (await current(mobile))?.email).toBe('cross-device@example.com');expect((await profile(mobile)).coins).toBe(654);
  expect(await mobile.evaluate(()=>localStorage.getItem('car-escape-progress-v2'))).toBe('42');
  await mobile.reload();await enterLauncher(mobile);await expect.poll(async()=> (await current(mobile))?.email).toBe('cross-device@example.com');expect((await profile(mobile)).coins).toBe(654);
  await other.setOffline(true);await logout(mobile);expect((await profile(mobile)).id).toMatch(/^guest_/);expect((await profile(mobile)).coins).toBe(200);await other.close();
});

test('Cloud restore failure never overwrites account and allows guest escape',async({page,context})=>{
  const backend=mockSupabase();await backend.install(context);await page.goto('/');await enterLauncher(page);
  await register(page,'restore@example.com',false);await expect.poll(async()=> (await current(page))?.email).toBe('restore@example.com');await logout(page);
  await page.evaluate(()=>{for(const k of Object.keys(localStorage))if(k.startsWith('arcadex_auth_slot_v2_')&&!k.includes('guest_'))localStorage.removeItem(k)});
  const uid=[...backend.users.values()].find(u=>u.email==='restore@example.com')!.id;
  const records=()=>JSON.stringify([...backend.documents.values()].filter(d=>d.path.startsWith('players/'+uid)));
  const original=records();backend.failReads(true);await login(page,'restore@example.com');
  await expect(page.locator('#btn-auth-loading-guest')).toBeVisible();expect(records()).toBe(original);
  await page.locator('#btn-auth-loading-guest').click();await page.locator('#game-card-tile-2048').waitFor();expect(await current(page)).toBeNull();
});


test('Choosing guest while a saved account loads cancels late hydration',async({page,context})=>{
  const backend=mockSupabase();await backend.install(context);await page.goto('/');await enterLauncher(page);
  await register(page,'late-restore@example.com',false);await expect.poll(async()=> (await current(page))?.email).toBe('late-restore@example.com');
  await seed(page,888,'35');await page.evaluate(async()=>{const source='/src/services/auth.ts';const{AuthService}=await import(source);await AuthService.checkpoint();});
  backend.readDelay(1000);await page.reload();await page.locator('#btn-auth-loading-guest').click();await page.locator('#game-card-tile-2048').waitFor();
  await page.waitForTimeout(1600);expect(await current(page)).toBeNull();expect((await profile(page)).id).toMatch(/^guest_/);expect((await profile(page)).coins).toBe(200);
});

