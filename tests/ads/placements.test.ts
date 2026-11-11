import {test, expect} from '@playwright/test';
import {setOffline} from '../helpers/network-state.cjs';

test('default launcher has content links and no ad preview', async ({page}) => {
  await page.goto('/');
  await expect(page.locator('#heading-game-library')).toBeVisible();
  await expect(page.locator('[data-ad-preview]')).toHaveCount(0);
  await page.getByRole('navigation', {name:'Thông tin ArcadeX'}).getByRole('link', {name:'Hướng dẫn chơi'}).click();
  await expect(page.getByRole('heading', {level:1})).toHaveText('Hướng dẫn chơi ArcadeX');
  expect(await page.locator('script').count()).toBe(0);
});

test('preview respects breakpoints, card placement, search, modal, chat, offline and game entry', async ({page}) => {
  const googleRequests:string[] = [];
  page.on('request', request => { if (/googlesyndication|doubleclick|googleadservices/.test(request.url())) googleRequests.push(request.url()); });
  await page.goto('/?ads-preview=1');
  await expect(page.locator('#heading-game-library')).toBeVisible();
  for (const width of [320,390,768,1280,1440]) {
    await page.setViewportSize({width,height:900});
    const slot = page.locator(`[data-ad-preview="${width<768?'L2':'L1'}"]`);
    await expect(slot).toBeVisible();
    await expect(page.locator(`[data-ad-preview="${width<768?'L1':'L2'}"]`)).toBeHidden();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    const box = await slot.boundingBox();
    expect(box!.x).toBeGreaterThanOrEqual(0); expect(box!.x+box!.width).toBeLessThanOrEqual(width+1);
    await page.screenshot({path:`test-results/ads/launcher-${width}.png`,fullPage:true});
  }
  await page.setViewportSize({width:390,height:844});
  expect(await page.locator('[data-ad-preview="L2"]').evaluate(el => [...el.parentElement!.children].indexOf(el))).toBe(8);
  await page.locator('#input-search-games').fill('word');
  await expect(page.locator('[data-ad-preview="L2"]')).toHaveCount(0);
  await page.locator('#input-search-games').fill('');
  await page.locator('.launcher-categories').getByRole('button', {name:'Yêu thích',exact:true}).click();
  await expect(page.locator('[data-ad-preview="L2"]')).toHaveCount(0);
  await page.getByRole('button', {name:'Tất Cả Game',exact:true}).click();
  await expect(page.locator('[data-ad-preview="L2"]')).toBeVisible();
  await page.getByRole('button', {name:'Cài đặt',exact:true}).click();
  await expect(page.locator('[data-ad-preview]')).toHaveCount(0);
  await page.getByRole('button', {name:'Đóng cài đặt'}).click();
  await page.locator('#mobile-nav-chat').click();
  await expect(page.locator('[data-ad-preview]')).toHaveCount(0);
  await expect(page.getByRole('dialog').last()).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.locator('[data-ad-preview="L2"]')).toBeVisible();
  await setOffline(page.context(),page,true);
  await expect(page.locator('[data-ad-preview]')).toHaveCount(0);
  await setOffline(page.context(),page,false);
  await page.locator('#btn-play-tile-2048').scrollIntoViewIfNeeded();
  await page.locator('#btn-play-tile-2048').click();
  await expect(page.locator('#btn-game-exit')).toBeVisible();
  await expect(page.locator('[data-ad-preview]')).toHaveCount(0);
  expect(googleRequests).toEqual([]);
});

test('direct public pages return real HTML and unknown content paths return 404', async ({request}) => {
  const response = await request.get('/huong-dan/word-cross/');
  expect(response.status()).toBe(200);
  const html = await response.text();
  expect(html).toContain('Word Cross: tìm từ trong bảng chữ');
  expect(html).not.toContain('/src/main.tsx');
  expect((await request.get('/huong-dan/missing/')).status()).toBe(404);
});
