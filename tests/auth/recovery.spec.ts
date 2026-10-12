import { test, expect, type Page } from '@playwright/test';
import { mockSupabase } from './backend';

async function signup(page: Page, email = 'recover@example.com') {
  await page.goto('/'); await page.locator('#tab-auth-register').click();
  await page.locator('#input-reg-email').fill(email);
  await page.locator('#input-reg-password').fill('OldPassword123!');
  await page.locator('#input-reg-confirm-password').fill('OldPassword123!');
  await page.locator('#btn-submit-register').click();
}
test('Forgot password uses same-origin recovery redirect, preserves guest data and rate limits duplicate sends', async ({page,context}) => {
  await mockSupabase().install(context); await page.goto('/');
  await page.evaluate(() => localStorage.setItem('arcadex_test_guest_progress','42'));
  let sends = 0;
  await page.route('**/auth/v1/recover*', async route => {
    sends++; expect(new URL(route.request().url()).searchParams.get('redirect_to')).toBe('http://127.0.0.1:3000/?auth=recovery');
    expect(route.request().postDataJSON().email).toBe('player@example.com');
    await route.fulfill({status:200,contentType:'application/json',body:'{}'});
  });
  await page.locator('#btn-forgot-password').click(); await page.locator('#input-reg-email').fill('player@example.com');
  await page.locator('#btn-submit-forgot').click(); await expect(page.getByRole('status')).toContainText('Nếu email này đủ điều kiện');
  await expect(page.locator('#btn-submit-forgot')).toBeDisabled();
  const result = await page.evaluate(async () => { const path='/src/services/auth.ts'; const {AuthService}=await import(path); return AuthService.requestPasswordReset('player@example.com'); });
  expect(result.success).toBe(false); expect(sends).toBe(1);
  expect(await page.evaluate(() => localStorage.getItem('arcadex_test_guest_progress'))).toBe('42');
});
test('Unconfirmed login exposes resend and successful request starts cooldown', async ({page,context}) => {
  await mockSupabase().install(context); await signup(page,'confirm@example.com');
  await expect(page.locator('#btn-resend-confirmation')).toBeVisible();
  await page.locator('#btn-resend-confirmation').click(); await expect(page.locator('#btn-resend-confirmation')).toBeDisabled();
  await page.locator('#input-login-identifier').fill('confirm@example.com');await page.locator('#input-login-password').fill('OldPassword123!');
  await page.locator('#btn-submit-login').click();await expect(page.getByRole('alert')).toContainText('xác nhận email');
});
test('Expired recovery never shows password update or writes a save; callback error is scrubbed', async ({page,context}) => {
  await mockSupabase().install(context);let writes=0;
  await page.route('**/rest/v1/rpc/arcadex_commit',r=>{writes++;return r.fulfill({status:200,body:'null'});});
  await page.goto('/?auth=recovery&error=access_denied&error_code=otp_expired&error_description=secret');
  await expect(page.locator('#password-recovery-screen')).toBeVisible();await expect(page.getByRole('alert')).toContainText('hết hạn');
  await expect(page.locator('#input-recovery-password')).toHaveCount(0);await expect(page.locator('#game-library')).toHaveCount(0);
  expect(page.url()).not.toContain('error_description');expect(writes).toBe(0);
  await page.locator('#btn-recovery-cancel').click();await expect(page.locator('#auth-entry-screen')).toBeVisible();
});
test('Valid recovery blocks game sync, validates confirmation and changes only the recovered password', async ({page,context}) => {
  const backend=mockSupabase();await backend.install(context);await signup(page);
  await expect(page.locator('#input-setup-name')).toBeVisible();
  let updates=0;
  await page.route('**/auth/v1/user*', async route => {
    if(route.request().method()!=='PUT')return route.fallback();
    updates++;expect(route.request().postDataJSON().password).toBe('NewPassword123!');return route.fallback();
  });
  await page.goto('/?auth=recovery'+backend.recovery('recover@example.com'));
  await expect(page.locator('#input-recovery-password')).toBeVisible();await expect(page.locator('#game-library')).toHaveCount(0);
  expect(page.url()).not.toContain('access_token');
  await page.locator('#input-recovery-password').fill('NewPassword123!');await page.locator('#input-recovery-confirm').fill('Mismatch123!');
  await page.locator('#btn-recovery-submit').click();await expect(page.getByRole('alert')).toContainText('không trùng');expect(updates).toBe(0);
  await page.reload();await expect(page.locator('#input-recovery-password')).toBeVisible();
  await page.locator('#input-recovery-password').fill('NewPassword123!');await page.locator('#input-recovery-confirm').fill('NewPassword123!');
  await page.locator('#btn-recovery-submit').click();await expect(page.locator('#input-setup-name')).toBeVisible();expect(updates).toBe(1);
  expect([...backend.users.values()].find(u=>u.email==='recover@example.com')?.password).toBe('NewPassword123!');
});
test('A bare recovery marker cannot authorize changing an existing session password', async ({page,context}) => {
  const backend=mockSupabase();await backend.install(context);await signup(page,'existing@example.com');
  await expect(page.locator('#input-setup-name')).toBeVisible();await page.goto('/?auth=recovery');
  await expect(page.locator('#input-recovery-email')).toBeVisible();await expect(page.locator('#input-recovery-password')).toHaveCount(0);
});
for (const width of [320,390]) test(`Recovery mobile ${width}: form fits and retains a rejected password draft`, async ({page,context},info) => {
  const backend=mockSupabase();await backend.install(context);await page.setViewportSize({width,height:844});await signup(page);
  await expect(page.locator('#input-setup-name')).toBeVisible();await page.goto('/?auth=recovery'+backend.recovery('recover@example.com'));
  await expect(page.locator('#input-recovery-password')).toBeVisible();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  await page.route('**/auth/v1/user*', async route => route.request().method()==='PUT' ? route.fulfill({status:422,contentType:'application/json',body:JSON.stringify({code:'weak_password',error_code:'weak_password',message:'Weak password'})}) : route.fallback());
  await page.locator('#input-recovery-password').fill('WeakPassword123!');await page.locator('#input-recovery-confirm').fill('WeakPassword123!');await page.locator('#btn-recovery-submit').click();
  await expect(page.getByRole('alert')).toContainText('chưa đủ mạnh');await expect(page.locator('#input-recovery-password')).toHaveValue('WeakPassword123!');
  await page.screenshot({path:info.outputPath(`recovery-${width}.png`)});
});
