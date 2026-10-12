import { enterLauncher } from './helpers';
import {test, expect} from '@playwright/test';
import {mockSupabase} from '../auth/backend';
import {inspectState} from './helpers';

test.beforeEach(async ({context, page}) => {
  await mockSupabase().install(context);
  await inspectState(page);
  await context.addInitScript(() => localStorage.removeItem('arcadex_onboarding_completed_v1'));
});
const retired = /\bEXP\b|\bXP\b|Lv\.|Cấp \d|Kho Đồ|Lò Rèn|Phúc Lợi|Điểm Danh|Vòng Quay|Rương Thưởng|Danh Hiệu|Nhiệm Vụ|Cửa Hàng|Arcade Coins/i;
for (const viewport of [{width:1440,height:900},{width:390,height:844}]) {
  test(`Simple launcher ${viewport.width}: fresh guest sees games without RPG prompts`, async ({page}, info) => {
    await page.setViewportSize(viewport); const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
    await page.goto('/');await enterLauncher(page);await expect(page.locator('#game-card-word-cross')).toBeVisible();
    await page.waitForTimeout(1200);
    await expect(page.locator('.arcade-launcher')).not.toContainText(retired);
    await expect(page.locator('[role="dialog"], #onboarding-overlay')).toHaveCount(0);
    await expect(page.locator('#recent-games')).toHaveCount(0);
    await expect(page.locator('#header-arcade-coins, #nav-desktop-inventory, #quick-hub-bar, #btn-global-chat-launcher')).toHaveCount(0);
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
    await page.screenshot({path:info.outputPath('launcher.png')});
    await page.locator('#btn-play-tile-2048').click();await expect(page.locator('#tile-2048-board')).toBeVisible();
    await page.locator('#btn-game-pause').click();await expect(page.getByText('Nhiệm Vụ / Báo Cáo',{exact:true})).toHaveCount(0);
    await page.locator('#btn-pause-save-exit').click();await expect(page.locator('#paused-game-banner')).toBeVisible();
    await expect(page.locator('#recent-games')).toContainText('2048');
    expect(errors).toEqual([]);
  });
  test(`Basic profile ${viewport.width}: edit identity without changing saved progress`, async ({page},info) => {
    await page.setViewportSize(viewport);await page.goto('/');await enterLauncher(page);await page.locator('#btn-header-profile').click();
    const profile=page.locator('#profile-modal');await expect(profile).toBeVisible();await expect(profile).not.toContainText(retired);
    const before=await page.evaluate(()=>(window as any).qcContext('addExp').profile.stats);
    await page.locator('#profile-name').fill('Người chơi mới');await page.locator('#btn-save-profile-name').click();
    await expect(profile.getByRole('status')).toHaveText('Đã lưu hồ sơ.');
    await profile.getByRole('button',{name:'Chọn ảnh đại diện 🦊',exact:true}).click();
    await expect(profile.getByRole('button',{name:'Chọn ảnh đại diện 🦊',exact:true})).toHaveAttribute('aria-pressed','true');
    await page.screenshot({path:info.outputPath('profile.png')});
    await page.reload();await enterLauncher(page);await expect(page.locator('#btn-header-profile')).toContainText('Người chơi mới');await page.locator('#btn-header-profile').click();
    await expect(page.locator('#profile-name')).toHaveValue('Người chơi mới');
    expect(await page.evaluate(()=>(window as any).qcContext('addExp').profile.stats)).toEqual(before);
    expect(await page.evaluate(()=>(window as any).qcContext('addExp').profile.avatar)).toBe('🦊');
    await page.keyboard.press('Escape');await expect(profile).toHaveCount(0);
    if(viewport.width<768){await page.locator('#mobile-nav-favorites').click();await expect(page.getByText('Chưa có trò chơi yêu thích',{exact:true})).toBeVisible();await page.locator('#mobile-nav-games').click();}
    await page.locator('#input-search-games').fill('2048');await page.locator('#btn-play-tile-2048').click();await expect(page.locator('#tile-2048-board')).toBeVisible();
  });
}
test('Retired reward notifications cannot reappear after returning to launcher',async({page})=>{
  await page.goto('/');await enterLauncher(page);await page.locator('#game-card-word-cross').waitFor();
  await page.evaluate(()=>{
    window.dispatchEvent(new CustomEvent('arcadex:show_toast',{detail:{type:'level_up',levelUpInfo:{newLevel:99,rewardCoins:999,rewardGems:99}}}));
    window.dispatchEvent(new CustomEvent('arcadex:show_toast',{detail:{type:'achievement_reward',achievement:{id:'old',title:'OLD REWARD',icon:'🏆',rewardCoins:99,rewardGems:99,rewardExp:99}}}));
    window.dispatchEvent(new CustomEvent('arcadex:open_modal',{detail:{modal:'dailyReward'}}));
  });
  await expect(page.locator('[role="dialog"]')).toHaveCount(0);await expect(page.locator('#non-intrusive-toast-container')).toBeEmpty();
  expect(await page.evaluate(()=>(window as any).qcContext('setActiveModal').activeModal)).toBe('none');
});
for(const gameId of ['blocker','tile-2048']) test(`${gameId}: details contain only play information, controls and personal record`,async({page})=>{
  await page.goto('/');await enterLauncher(page);await page.locator(`#btn-detail-card-${gameId}`).click();
  const detail=page.locator('#game-detail-modal-overlay');await expect(detail).toBeVisible();await expect(detail).toContainText('Cách chơi');
  await expect(detail).not.toContainText(retired);await expect(detail).not.toContainText(/rớt ngọc|rơi ngọc|Ngọc Quý|Thưởng lớn/i);await expect(detail.locator('#tab-detail-challenge')).toHaveCount(0);
  await page.locator('#btn-detail-launch-game').click();await expect(page.locator('#game-viewport-stage')).toBeVisible();
});
test('Logged-in user can edit the basic profile and sign out from it',async({page})=>{
  await page.goto('/');await enterLauncher(page);await page.locator('#btn-header-profile').click();await page.locator('#btn-profile-register').click();await page.locator('#tab-auth-register').click();
  await page.locator('#input-reg-email').fill('simple-profile@example.com');
  await page.locator('#input-reg-password').fill('TestPassword123!');await page.locator('#input-reg-confirm-password').fill('TestPassword123!');await page.locator('#btn-submit-register').click();await page.locator('#input-setup-name').fill('Người chơi');await page.locator('#btn-complete-profile').click();
  await expect(page.locator('#btn-header-profile')).toContainText('Người chơi');await page.locator('#btn-header-profile').click();
  await expect(page.locator('#profile-modal')).toContainText('simple-profile@example.com');await expect(page.locator('#profile-modal')).not.toContainText(retired);
  await page.locator('#profile-name').fill('Tên mới');await page.locator('#btn-save-profile-name').click();
  await page.locator('#btn-logout-profile').click();await expect(page.locator('#profile-modal')).toHaveCount(0);
  await expect.poll(()=>page.evaluate(()=>JSON.parse(localStorage.getItem('arcadex_current_user')||'null'))).toBeNull();
  await page.locator('#tab-auth-login').click();await page.locator('#input-login-identifier').fill('simple-profile@example.com');await page.locator('#input-login-password').fill('TestPassword123!');await page.locator('#btn-submit-login').click();await expect(page.locator('#btn-header-profile')).toContainText('Tên mới');
  await page.locator('#btn-play-tile-2048').click();await expect(page.locator('#tile-2048-board')).toBeVisible();
});
