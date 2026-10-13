import { test, expect, type Page } from '@playwright/test';
import { mockSupabase } from './backend';
async function signup(page: Page, email: string) {
  await page.locator('#tab-auth-register').click();
  await page.locator('#input-reg-email').fill(email);
  await page.locator('#input-reg-password').fill('TestPassword123!');
  await page.locator('#input-reg-confirm-password').fill('TestPassword123!');
  await page.locator('#btn-submit-register').click();
}
async function complete(page: Page, name: string) {
  await page.locator('#input-setup-name').fill(name);
  await page.locator('#btn-complete-profile').click();
}
for (const viewport of [{width:1440,height:900},{width:390,height:844},{width:320,height:568}]) test(`Entry ${viewport.width}: mandatory choice, guest and splash`, async ({page,context},info) => {
  await mockSupabase().install(context);await page.setViewportSize(viewport);
  await page.goto('/');await expect(page.locator('#auth-entry-screen')).toBeVisible();
  await expect(page.locator('#game-library')).toHaveCount(0);
  await page.keyboard.press('Escape');await expect(page.locator('#auth-entry-screen')).toBeVisible();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
  if (viewport.width === 390) { const guest = await page.locator('#btn-auth-play-guest').boundingBox(); expect(guest!.y + guest!.height).toBeLessThanOrEqual(viewport.height); }
  await page.screenshot({path:info.outputPath('entry.png'),fullPage:true});
  await page.locator('#btn-auth-play-guest').click();await expect(page.locator('#game-library')).toBeVisible();
  await page.reload();await expect(page.locator('#auth-entry-screen')).toBeVisible();await expect(page.locator('#game-library')).toHaveCount(0);
});
test('First login requires persistent unique name; edits cannot steal another name', async ({page,context,browser},info) => {
  const backend=mockSupabase();await backend.install(context);await page.goto('/');await signup(page,'first@example.com');
  await expect(page.locator('#input-setup-name')).toBeVisible();await expect(page.locator('#game-library')).toHaveCount(0);
  await page.screenshot({path:info.outputPath('first-profile.png')});
  await complete(page,'Arcade Hero');await expect(page.locator('#btn-header-profile')).toContainText('Arcade Hero');
  const other=await browser.newContext();await backend.install(other);const second=await other.newPage();await second.goto('/');await signup(second,'second@example.com');
  await complete(second,'arcade hero');await expect(second.getByRole('alert')).toContainText('đã được sử dụng');await expect(second.locator('#game-library')).toHaveCount(0);
  await complete(second,'Another Hero');await expect(second.locator('#game-library')).toBeVisible();
  await second.locator('#btn-header-profile').click();await second.locator('#profile-name').fill('ARCADE HERO');await second.locator('#btn-save-profile-name').click();await expect(second.getByRole('status')).toContainText('đã được sử dụng');
  expect(await second.evaluate(()=>JSON.parse(localStorage.getItem('arcadex_current_user')!).username)).toBe('Another Hero');
  await page.reload();await expect(page.locator('#btn-entry-continue')).toBeVisible();await expect(page.locator('#input-setup-name')).toHaveCount(0);await page.locator('#btn-entry-continue').click();await expect(page.locator('#btn-header-profile')).toContainText('Arcade Hero');
  await other.close();
});
test('Unfinished setup survives reload; two simultaneous claims produce one winner', async ({page,context,browser}) => {
  const backend=mockSupabase();await backend.install(context);await page.goto('/');await signup(page,'race-a@example.com');await expect(page.locator('#input-setup-name')).toBeVisible();
  await page.reload();await expect(page.locator('#input-setup-name')).toBeVisible();await expect(page.locator('#game-library')).toHaveCount(0);
  const other=await browser.newContext();await backend.install(other);const second=await other.newPage();await second.goto('/');await signup(second,'race-b@example.com');
  await page.locator('#input-setup-name').fill('Race Hero');await second.locator('#input-setup-name').fill('Race Hero');
  await Promise.all([page.locator('#btn-complete-profile').click(),second.locator('#btn-complete-profile').click()]);
  await expect.poll(async()=>Number(await page.locator('#game-library').isVisible())+Number(await second.locator('#game-library').isVisible())).toBe(1);
  const loser=await page.locator('#game-library').isVisible()?second:page;await expect(loser.getByRole('alert')).toContainText('đã được sử dụng');await other.close();
});
test('Failed cloud save leaves onboarding incomplete and allows guest play', async ({page,context}) => {
  await mockSupabase().install(context);await page.goto('/');await signup(page,'failed-save@example.com');await expect(page.locator('#input-setup-name')).toBeVisible();
  await page.route('**/rest/v1/rpc/arcadex_save_identity',r=>r.fulfill({status:503,contentType:'application/json',body:JSON.stringify({message:'Máy chủ tạm ngừng'})}));
  await complete(page,'Unsaved Hero');await expect(page.getByRole('alert')).toBeVisible();await expect(page.locator('#game-library')).toHaveCount(0);
  expect(await page.evaluate(()=>JSON.parse(localStorage.getItem('arcadex_current_user')!).profileCompleted)).toBe(false);
  await page.locator('#btn-auth-play-guest').click();await expect(page.locator('#game-library')).toBeVisible();
});

test('Profile uses normalized server name immediately and keeps an unsaved name draft on avatar edits', async ({page,context}) => {
  await mockSupabase().install(context);await page.goto('/');await signup(page,'normalized@example.com');await complete(page,'Original Hero');await page.locator('#btn-header-profile').click();
  await page.locator('#profile-name').fill('  Clean   Hero  ');await page.locator('#btn-save-profile-name').click();await expect(page.locator('#profile-name')).toHaveValue('Clean Hero');
  await page.locator('#btn-close-profile').click();await expect(page.locator('#btn-header-profile')).toContainText('Clean Hero');await page.locator('#btn-header-profile').click();
  await page.locator('#profile-name').fill('Unsaved Draft');await page.getByRole('button',{name:'Chọn ảnh đại diện 🦊',exact:true}).click();await expect(page.getByRole('button',{name:'Chọn ảnh đại diện 🦊',exact:true})).toHaveAttribute('aria-pressed','true');await expect(page.locator('#profile-name')).toHaveValue('Unsaved Draft');
  expect(await page.evaluate(()=>JSON.parse(localStorage.getItem('arcadex_current_user')!).username)).toBe('Clean Hero');
  await page.reload();await page.locator('#btn-entry-continue').click();await expect(page.locator('#btn-header-profile')).toContainText('Clean Hero');
});
test('Missing profile schema explains setup is pending and still allows guest entry', async ({page,context}) => {
  await mockSupabase().install(context);await page.route('**/rest/v1/rpc/arcadex_get_identity',r=>r.fulfill({status:404,contentType:'application/json',body:JSON.stringify({code:'PGRST202',message:'Could not find the function'})}));
  await page.goto('/');await signup(page,'pending-schema@example.com');await expect(page.getByRole('status')).toContainText('Hệ thống tài khoản chưa được nâng cấp');await expect(page.locator('#game-library')).toHaveCount(0);await page.locator('#btn-auth-loading-guest').click();await expect(page.locator('#game-library')).toBeVisible();
});

