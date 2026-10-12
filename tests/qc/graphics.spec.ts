import { enterLauncher } from './helpers';
import {test,expect} from '@playwright/test';
import {mockSupabase} from '../auth/backend';

test.beforeEach(async({context})=>{await mockSupabase().install(context);});
for(const viewport of [{width:1440,height:900},{width:390,height:844}])test(`Arcade launcher ${viewport.width}: search, favorite and launch remain usable`,async({page})=>{
  await page.setViewportSize(viewport);await page.goto('/');await enterLauncher(page);
  await page.locator('#input-search-games').fill('2048');
  await expect(page.locator('[id^="game-card-"]')).toHaveCount(1);
  await page.locator('#btn-fav-card-tile-2048').click();
  const selected=await page.locator('#btn-fav-card-tile-2048').getAttribute('aria-pressed');
  await page.reload();await enterLauncher(page);await page.locator('#input-search-games').fill('2048');
  await expect(page.locator('#btn-fav-card-tile-2048')).toHaveAttribute('aria-pressed',selected!);
  await page.locator('#btn-play-tile-2048').click();await expect(page.locator('#tile-2048-board')).toBeVisible();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
  const pause=page.locator('#btn-game-pause');const b=(await pause.boundingBox())!;
  expect(await page.evaluate(({x,y})=>document.getElementById('btn-game-pause')?.contains(document.elementFromPoint(x,y)),{x:b.x+b.width/2,y:b.y+b.height/2})).toBe(true);
  await pause.click();await expect(page.getByRole('button',{name:'Trò chuyện',exact:true})).toBeVisible();
  await page.getByRole('button',{name:'Trò chuyện',exact:true}).click();await expect(page.getByPlaceholder(/Nhập tin nhắn/i)).toBeVisible();
});
test('Featured recommendation stays stable with reduced motion and opens details or starts its game',async({page})=>{
  await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/');await enterLauncher(page);
  const hero=page.locator('.launcher-welcome');await expect(hero.locator('h2')).toHaveText('Car Escape');
  await page.waitForTimeout(4500);await expect(hero.locator('h2')).toHaveText('Car Escape');
  await hero.getByRole('button',{name:'Khám phá Car Escape',exact:true}).click();
  await expect(page.locator('#game-detail-modal-overlay')).toBeVisible();
  await expect(page.locator('#game-detail-modal-overlay')).toContainText('Car Escape');
  await page.keyboard.press('Escape');await expect(page.locator('#game-detail-modal-overlay')).toHaveCount(0);
  await page.locator('#btn-launch-featured').click();
  await page.locator('#car-level-1').click();
  await expect(page.locator('#game-viewport-stage .arcade-board')).toBeVisible();
  await page.locator('#btn-game-pause').click();await expect(page.locator('#btn-pause-save-exit')).toBeVisible();
});

for(const viewport of [{width:1440,height:900},{width:390,height:844}]) {
  test(`Shikaku ${viewport.width}: square board leaves its toolbar accessible`,async({page})=>{
    await page.setViewportSize(viewport);await page.goto('/');await enterLauncher(page);await page.locator('#btn-play-shikaku').click();const stage=page.locator('#game-viewport-stage');
    await stage.getByRole('button',{name:'Zen Mode',exact:true}).click();const board=stage.locator('.arcade-board');await expect(board).toBeVisible();
    const box=(await board.boundingBox())!,header=(await stage.locator('header').boundingBox())!;
    expect(Math.abs(box.width-box.height)).toBeLessThan(1);expect(box.y).toBeGreaterThanOrEqual(header.y+header.height);expect(box.y+box.height).toBeLessThan(viewport.height);
  });
  test(`Mummy ${viewport.width}: board and directional controls fit on entry`,async({page})=>{
    await page.setViewportSize(viewport);await page.goto('/');await enterLauncher(page);await page.locator('#btn-play-mummy-escape').click();
    await expect(page.locator('#dpad-down')).toBeVisible();
    for(const selector of ['.mummy-board-shell .arcade-board','#dpad-down']){const b=(await page.locator(selector).boundingBox())!;expect(b.y).toBeGreaterThanOrEqual(48);expect(b.y+b.height).toBeLessThanOrEqual(viewport.height);}
  });
}
