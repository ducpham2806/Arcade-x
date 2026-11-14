import { test, expect, type Page, type BrowserContext } from '@playwright/test';
import { mockSupabase } from '../auth/backend';
import { observeEngine, winFirstLevel } from './ui-driver';

const campaignKey = 'snake-legend:r01-blockout:v1';
const checkpointKey = 'snake-legend:r01-checkpoint:v1';
const settingsKey = 'snake-legend:prototype-m1:v1';
const a = { id: '10000000-0000-4000-8000-000000000001', email: 'snake-a@example.test' };
const b = { id: '10000000-0000-4000-8000-000000000002', email: 'snake-b@example.test' };
const password = 'SnakePlayer123!';
const scope = (owner: string, key: string) => `snake-legend:account:${owner}:${key}`;
const guest = JSON.stringify({ version: 1, contentVersion: 'r01-10-v1', levels: { '1-1': { stars: [true, true, true], bestTime: 99, bestScore: 777 } }, secrets: [], receipts: ['guest-before-account'] });
const read = (page: Page, key: string) => page.evaluate(key => localStorage.getItem(key), key);

async function setup(page: Page, context: BrowserContext) {
  const backend = mockSupabase();
  for (const actor of [a, b]) backend.users.set(actor.id, { ...actor, password, is_anonymous: false, confirmed: true, user_metadata: {} });
  await backend.install(context);
  await page.goto('/');
  await expect(page.locator('#game-library')).toBeVisible();
  await page.evaluate(({ key, value }) => localStorage.setItem(key, value), { key: campaignKey, value: guest });
}
async function login(page: Page, actor: typeof a) {
  await page.locator('#btn-header-profile').click();
  await page.locator('#btn-profile-login').click();
  await page.locator('#input-login-identifier').fill(actor.email);
  await page.locator('#input-login-password').fill(password);
  await page.locator('#btn-submit-login').click();
  await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem('arcadex_current_user') || 'null')?.id)).toBe(actor.id);
  const setupName = page.locator('#input-setup-name');
  if (await setupName.isVisible()) { await setupName.fill(actor === a ? 'Snake Actor A' : 'Snake Actor B'); await page.locator('#btn-complete-profile').click(); }
  await expect(page.locator('#btn-submit-login')).toBeHidden();
}
async function openStory(page: Page) {
  await page.locator('#btn-play-snake-legend').click();
  await expect(page.locator('.snake-journey')).toBeVisible();
  await page.locator('.snake-journey [data-level="0"]').click();
  await page.locator('.journey-play').click();
  await expect(page.locator('.story-app')).toBeVisible();
}
async function exit(page: Page) {
  await page.locator('#btn-game-exit').click();
  await page.locator('#btn-exit-confirm').click();
  await expect(page.locator('#game-library')).toBeVisible();
}
async function logout(page: Page) {
  await page.locator('#btn-header-profile').click();
  await page.locator('#btn-logout-profile').click();
  await expect(page.locator('#btn-logout-profile')).toBeHidden();
}

test('public account gameplay, settings and checkpoint use the same owner as journey', async ({ page, context }, info) => {
  await setup(page, context); await login(page, a); await observeEngine(page); await openStory(page);
  await expect(page.locator('.story-app [data-level="1"]')).toBeDisabled();
  await expect(page.locator('.story-app [data-level="0"] .level-stars')).toHaveText('☆☆☆');
  await page.locator('.story-app [data-action="primary"]').click();
  await expect.poll(() => page.evaluate(() => (window as any).__snakeUiProbe?.tick || 0)).toBeGreaterThan(2);
  await page.locator('.story-app [data-action="settings"]').click();
  await page.locator('[data-setting="hand"]').selectOption('right');
  await expect.poll(() => read(page, scope(a.id, checkpointKey))).not.toBeNull();
  expect(JSON.parse((await read(page, scope(a.id, settingsKey)))!).hand).toBe('right');
  expect(await read(page, checkpointKey)).toBeNull(); expect(await read(page, settingsKey)).toBeNull();
  await page.locator('[data-action="close-settings"]').click(); await exit(page);
  await page.locator('#btn-play-snake-legend').click();
  await expect(page.locator('.journey-resume')).toHaveText('Tiếp tục màn 1-1');
  await page.locator('.journey-play').click();
  await expect(page.locator('.checkpoint-message')).toContainText('Đã khôi phục');
  await expect(page.locator('.story-app')).toHaveClass(/right-hand/);
  await page.screenshot({ path: info.outputPath('account-checkpoint-restored.png') });
  expect(await read(page, campaignKey)).toBe(guest);
});

test('a real public account clear survives reload without changing guest or another account', async ({ page, context }, info) => {
  test.setTimeout(120000);
  const errors: string[] = [], requests: string[] = [];
  page.on('pageerror', e => errors.push(e.message)); page.on('request', r => requests.push(r.url()));
  await setup(page, context); await login(page, a); await observeEngine(page); await openStory(page);
  await winFirstLevel(page);
  await expect.poll(() => read(page, scope(a.id, campaignKey))).not.toBeNull();
  const saved = JSON.parse((await read(page, scope(a.id, campaignKey)))!);
  expect(saved.levels['1-1'].stars[0]).toBe(true); expect(saved.receipts).toHaveLength(1);
  expect(await read(page, campaignKey)).toBe(guest);
  await page.screenshot({ path: info.outputPath('account-clear-saved.png') });
  await page.reload(); await page.locator('#btn-play-snake-legend').click();
  await expect(page.locator('.journey-clears')).toHaveText('1/10 màn');
  await expect(page.locator('.snake-journey [data-level="1"]')).toBeEnabled();
  await exit(page); await logout(page); await login(page, b);
  await page.locator('#btn-play-snake-legend').click();
  await expect(page.locator('.journey-clears')).toHaveText('0/10 màn');
  await expect(page.locator('.snake-journey [data-level="1"]')).toBeDisabled();
  await page.locator('.journey-play').click();
  await expect(page.locator('.story-app [data-level="1"]')).toBeDisabled();
  expect(await read(page, scope(b.id, campaignKey))).toBeNull();
  await exit(page); await logout(page); await page.locator('#btn-play-snake-legend').click();
  await expect(page.locator('.journey-stars')).toHaveText('★ 3/30 sao');
  expect(await read(page, campaignKey)).toBe(guest);
  expect(requests.some(url => url.includes('/functions/v1/snake-complete'))).toBe(false);
  expect(errors).toEqual([]);
});

test('keyboard starts the story and settings keep focus until Escape returns to pause', async ({ page, context }, info) => {
  await setup(page, context); await openStory(page);
  const primary = page.locator('.story-app .overlay [data-action="primary"]');
  await primary.focus(); await page.keyboard.press('Space');
  await expect(page.locator('.story-app .overlay')).toBeHidden();
  const settings = page.locator('.story-app [data-action="settings"]');
  await settings.focus(); await page.keyboard.press('Space');
  const dialog = page.getByRole('dialog', { name: 'Tùy chỉnh', exact: true });
  await expect(dialog).toBeVisible(); await expect(page.locator('[data-setting="hand"]')).toBeFocused();
  await page.locator('[data-action="close-settings"]').focus(); await page.keyboard.press('Tab');
  await expect(page.locator('[data-setting="hand"]')).toBeFocused();
  await page.keyboard.press('Shift+Tab'); await expect(page.locator('[data-action="close-settings"]')).toBeFocused();
  await page.keyboard.press('Escape'); await expect(dialog).toBeHidden();
  await expect(primary).toBeFocused(); await expect(primary).toHaveText('Tiếp tục');
  await page.screenshot({ path: info.outputPath('keyboard-pause-restored.png') });
  await page.keyboard.press('Space'); await expect(page.locator('.story-app .overlay')).toBeHidden();
});
