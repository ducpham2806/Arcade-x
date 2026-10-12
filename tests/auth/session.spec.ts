import { test, expect } from '@playwright/test';
import { mockSupabase } from './backend';

test('An expired stored session refreshes before restoring the same account', async ({page,context}) => {
  const backend=mockSupabase();await backend.install(context);await page.goto('/');
  await page.locator('#tab-auth-register').click();await page.locator('#input-reg-email').fill('refresh@example.com');await page.locator('#input-reg-password').fill('TestPassword123!');await page.locator('#input-reg-confirm-password').fill('TestPassword123!');await page.locator('#btn-submit-register').click();
  await page.locator('#input-setup-name').fill('Refresh Hero');await page.locator('#btn-complete-profile').click();await expect(page.locator('#game-library')).toBeVisible();
  const owner=await page.evaluate(()=>JSON.parse(localStorage.getItem('arcadex_current_user')!).id);
  let refreshed=0;await page.route('**/auth/v1/token*',route=>{ if(new URL(route.request().url()).searchParams.get('grant_type')==='refresh_token')refreshed++;return route.fallback(); });
  await page.evaluate(()=>{const key=Object.keys(localStorage).find(k=>k.startsWith('sb-')&&k.endsWith('-auth-token'))!;const session=JSON.parse(localStorage.getItem(key)!);session.expires_at=1;localStorage.setItem(key,JSON.stringify(session));});
  await page.reload();await expect(page.locator('#btn-entry-continue')).toBeVisible();await page.locator('#btn-entry-continue').click();await expect(page.locator('#btn-header-profile')).toContainText('Refresh Hero');
  expect(refreshed).toBeGreaterThan(0);expect(await page.evaluate(()=>JSON.parse(localStorage.getItem('arcadex_current_user')!).id)).toBe(owner);
});
test('An expired confirmation link shows actionable feedback without exposing callback errors', async ({page,context}) => {
  await mockSupabase().install(context);await page.goto('/?auth=confirmation&error=access_denied&error_code=otp_expired&error_description=private-value');
  await expect(page.locator('#auth-entry-screen')).toBeVisible();await expect(page.getByRole('status')).toContainText('Link xác nhận đã hết hạn');
  expect(page.url()).not.toContain('private-value');await expect(page.locator('#game-library')).toHaveCount(0);
});
