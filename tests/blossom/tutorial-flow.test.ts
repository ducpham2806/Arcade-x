import { test, expect } from '@playwright/test';
import { createRun, groups, neighbors } from '../../src/games/hex-match/blossom/engine';
import { LEVELS } from '../../src/games/hex-match/blossom/levels';
import { defaultSave } from '../../src/games/hex-match/blossom/save';
import { lessonsFor } from '../../src/games/hex-match/blossom/tutorials';
import { skipLessons } from './ui-helpers';
async function load(page: any, save = defaultSave()) {
  await page.goto('/blossom-review.html');
  await page.evaluate((s: any) => localStorage.setItem('arcadex_blossom_review_v1', JSON.stringify(s)), save);
  await page.reload();
}
async function active(page: any) {
  return page.evaluate(() => JSON.parse(localStorage.getItem('arcadex_blossom_review_v1')!).active);
}
for (const [width,height] of [[320,568],[390,844],[768,1024]]) {
  test(`read card centered on shaded board, controls in viewport ${width}x${height}`, async ({page}) => {
    await page.setViewportSize({width,height});
    const save = defaultSave(); save.active=createRun(LEVELS[0],3149624575);
    await load(page,save);
    const dialog=page.getByRole('dialog',{name:'Hướng dẫn cơ chế mới'});
    await expect(dialog).toBeVisible();
    await expect.poll(async () => { const c=await dialog.boundingBox(), b=await page.locator('.bb-board-wrap').boundingBox(); return Math.abs(c!.y+c!.height/2-b!.y-b!.height/2); }).toBeLessThan(2);
    const card=await dialog.boundingBox(), board=await page.locator('.bb-board-wrap').boundingBox();
    expect(Math.abs(card!.x+card!.width/2-board!.x-board!.width/2)).toBeLessThan(2);
    expect(Math.abs(card!.y+card!.height/2-board!.y-board!.height/2)).toBeLessThan(2);
    expect(card!.y).toBeGreaterThanOrEqual(0); expect(card!.y+card!.height).toBeLessThanOrEqual(height);
    await expect(page.locator('.bb-tutorial-shade')).toBeVisible();
    await expect(page.locator('.bb-tools button').first()).toBeDisabled();
    expect(await page.locator('.bb-cell:enabled').count()).toBe(0);
    const before=await active(page);
    await page.locator('.bb-cell').first().evaluate((e: HTMLButtonElement)=>e.click());
    expect((await active(page)).turns).toBe(before.turns);
    await page.getByRole('button',{name:'Thử trên bàn',exact:true}).click();
    await expect(dialog).toHaveCount(0);
    await expect(page.locator('.bb-practice-cue')).toBeVisible();
    const practiceBoard=await page.locator('.bb-board').boundingBox();
    expect(practiceBoard!.y+practiceBoard!.height).toBeLessThanOrEqual(height);
    expect(await page.locator('.bb-cell:enabled').count()).toBeGreaterThan(0);
    await expect(page.locator('.bb-cell:not(.bb-tutorial-cell)').first()).toBeDisabled();
    await expect(page.locator('.bb-tools button').first()).toBeDisabled();
    await page.screenshot({path:`tests/blossom/screenshots/v5-practice-${width}.png`});
    await page.getByRole('button',{name:'Xem lại',exact:true}).click();
    await expect(dialog).toBeVisible();
    await expect.poll(()=>page.locator('.bb-coach').evaluate(e=>getComputedStyle(e).opacity)).toBe('1');
    await page.screenshot({path:`tests/blossom/screenshots/v5-reading-${width}.png`});
    expect(await page.locator('.bb-cell:enabled').count()).toBe(0);
    await page.getByRole('button',{name:'Thử trên bàn',exact:true}).click();
    await page.locator('.bb-tutorial-cell:enabled').first().click();
    expect((await active(page)).moves).toBe(before.moves-1);
    await expect(page.getByRole('heading',{name:'Mục tiêu điểm',exact:true})).toBeVisible();
    await skipLessons(page);
    await expect(page.locator('.bb-coach,.bb-practice-cue')).toHaveCount(0);
    expect(await page.locator('.bb-cell:enabled').count()).toBe(25);
  });
}
test('tutorial tools cannot enter combine mode; reload restores reading; focus stays in card', async ({page}) => {
  const save=defaultSave();save.active=createRun(LEVELS[0],3149624575);
  save.tutorials=['tap-4-way','goal-score'];
  await load(page,save);
  const coach=page.locator('.bb-coach');
  await expect(coach).toContainText('Bibi và gợi ý');
  await page.locator('.bb-tools button').first().evaluate((e: HTMLButtonElement)=>e.click());
  await expect(page.locator('.bb-instruction')).toHaveCount(0);
  await page.keyboard.press('Tab');
  expect(await coach.evaluate(e=>e.contains(document.activeElement))).toBe(true);
  await page.reload();
  await expect(coach).toBeVisible();
  await skipLessons(page);
  await expect(page.locator('.bb-tools button').first()).toBeDisabled();
});
test('adjacent specials enable combine and cancellation never spends a move', async ({page}) => {
  const save=defaultSave(),run=createRun(LEVELS[4],9);
  run.board[0].special='bee_h';run.board[1].special='bloom_bomb';
  save.active=run;save.tutorials=lessonsFor(run,[]).map(l=>l.id);
  await load(page,save);
  const combine=page.locator('.bb-tools button').first();await expect(combine).toBeEnabled();
  await combine.click();await expect(page.locator('.bb-instruction')).toContainText('special thứ nhất');
  await page.locator('.bb-cell[data-cell="0"]').click();
  await expect(page.locator('.bb-instruction')).toContainText('special thứ hai');
  await page.getByRole('button',{name:'Hủy chọn',exact:true}).click();
  await expect(page.locator('.bb-instruction')).toHaveCount(0);
  expect((await active(page)).moves).toBe(run.moves);
  await combine.click(); await page.locator('.bb-cell[data-cell="0"]').click(); await page.locator('.bb-cell[data-cell="1"]').click();
  expect((await active(page)).moves).toBe(run.moves-1);
});
test('hazard practice only enables a legal neighboring flower group', async ({page}) => {
  const save=defaultSave(),run=createRun(LEVELS[0],9);
  const group=groups(run)[0], blocker=group.flatMap(i=>neighbors(run,i)).find(i=>!group.includes(i))!;
  run.board[blocker].hazard='weed'; run.board[blocker].hp=1;
  const all=lessonsFor(run,[]),hazard=all.find(l=>l.id.startsWith('hazard-') && l.practice)!;
  expect(hazard).toBeDefined();
  expect(hazard.cells!.every(i=>groups(run).some(g=>g.includes(i)))).toBe(true);
  save.active=run;save.tutorials=all.filter(l=>l.id!==hazard.id).map(l=>l.id);
  await load(page,save);await page.getByRole('button',{name:'Thử trên bàn',exact:true}).click();
  await page.locator('.bb-tutorial-cell:enabled').first().click();
  expect((await active(page)).turns).toBe(1);
});

test('long mechanic explanation and landscape reading stay inside the viewport', async ({page}) => {
  for (const [width,height] of [[320,568],[844,390]]) {
    await page.setViewportSize({width,height});
    const save=defaultSave(), run=createRun(LEVELS[99],9);
    const all=lessonsFor(run,[]), longest=all.sort((a,b)=>b.body.length-a.body.length)[0];
    save.active=run;save.tutorials=all.filter(l=>l.id!==longest.id).map(l=>l.id);
    await load(page,save);
    const card=page.locator('.bb-coach');await expect(card).toBeVisible();
    await expect.poll(async()=> {const c=await card.boundingBox();return c!.y+c!.height;}).toBeLessThanOrEqual(height);
    const b=await card.boundingBox(); expect(b!.y).toBeGreaterThanOrEqual(0);
    expect(b!.x).toBeGreaterThanOrEqual(0);expect(b!.x+b!.width).toBeLessThanOrEqual(width);
    await page.screenshot({path:`tests/blossom/screenshots/v5-long-${width}.png`});
  }
});
