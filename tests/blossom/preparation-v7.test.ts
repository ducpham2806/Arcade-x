import { test, expect } from '@playwright/test';
import { createRun,hint,act } from '../../src/games/hex-match/blossom/engine';
import { LEVELS } from '../../src/games/hex-match/blossom/levels';
import { defaultSave } from '../../src/games/hex-match/blossom/save';
import { lessonsFor } from '../../src/games/hex-match/blossom/tutorials';
for (const [width,height] of [[320,568],[390,700],[768,400]]) test(`preparation fits without scrolling ${width}x${height}`,async({page})=>{
 await page.setViewportSize({width,height});await page.goto('/blossom-review.html');
 await page.getByRole('button',{name:/Hồ sơ test/}).click();
 await page.locator('.bb-node').first().click();
 const popup=page.locator('.bb-preparation');await expect(popup).toBeVisible();
 await expect(popup.locator('.bb-companions')).toHaveCount(0);
 const geometry=await popup.evaluate(e=>{
  const b=e.getBoundingClientRect(),body=e.querySelector('.bb-modal-body')!;
  return {top:b.top,bottom:b.bottom,height:innerHeight,overflow:body.scrollHeight-body.clientHeight,wide:e.scrollWidth-e.clientWidth};
 });
 await page.screenshot({path:`tests/blossom/screenshots/v7-prep-${width}.png`});
 expect(geometry.top).toBeGreaterThanOrEqual(0);expect(geometry.bottom).toBeLessThanOrEqual(height);
 expect(geometry.overflow).toBeLessThanOrEqual(1);expect(geometry.wide).toBeLessThanOrEqual(1);
 await expect(popup.getByRole('button',{name:/Bắt đầu/})).toBeInViewport({ratio:1});
 await page.screenshot({path:`tests/blossom/screenshots/v7-prep-${width}.png`});
});
test('rapid ordinary moves remain enabled and undimmed while effect batches overlap',async({page})=>{
 const s=defaultSave(),r=createRun(LEVELS[0],9);r.level.goals=[{kind:'score',target:9999999}];r.moves=30;
 s.active=r;s.tutorials=lessonsFor(r,[]).map(x=>x.id);
 await page.goto('/blossom-review.html');await page.evaluate(s=>localStorage.setItem('arcadex_blossom_review_v1',JSON.stringify(s)),s);await page.reload();
 const first=hint(r)[0],next=act(r,{type:'tap',cell:first},Date.now()).run,second=hint(next)[0];
 await page.locator(`[data-cell="${first}"]`).click();
 await expect(page.locator(`[data-cell="${second}"]`)).toBeEnabled();
 await expect(page.locator(`[data-cell="${second}"]`)).toHaveCSS('opacity','1');
 await expect(page.locator('.bb-animation-status')).toHaveCount(0);
 await page.locator(`[data-cell="${second}"]`).dispatchEvent('click');
 const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('arcadex_blossom_review_v1')!).active);
 expect(saved.turns).toBe(2);
 expect(await page.locator('.bb-vfx-layer').count()).toBeGreaterThanOrEqual(2);
 await expect(page.locator('.bb-vfx-layer')).toHaveCount(0,{timeout:10000});
});

test('all campaign preparation layouts fit and companions follow regions',async({page})=>{
 await page.setViewportSize({width:320,height:568});await page.goto('/blossom-review.html');
 await page.getByRole('button',{name:/Hồ sơ test/}).click();
 for(let chapter=1;chapter<=10;chapter++) {
  for(let n=0;n<10;n++) {
   await page.locator('.bb-node').nth(n).click();
   const popup=page.locator('.bb-preparation');
   await expect(popup.getByRole('button',{name:/Bắt đầu/})).toBeInViewport({ratio:1});
   await popup.getByRole('tab',{name:'Hỗ trợ trong ván'}).click();
   await expect(popup.getByRole('button',{name:/Bắt đầu/})).toBeInViewport({ratio:1});
   await popup.getByRole('button',{name:'Đóng',exact:true}).click();
  }
  if(chapter<10)await page.getByRole('button',{name:'Cụm sau'}).click();
 }
});
test('starting a region ignores previously selected companion',async({page})=>{
 for(const [chapter,expected] of [[1,'bibi'],[3,'pip'],[5,'bunny'],[8,'owl'],[10,'turtle']] as const){
  await page.goto('/blossom-review.html');await page.evaluate(()=>localStorage.clear());await page.reload();
  for(let n=1;n<chapter;n++)await page.getByRole('button',{name:'Cụm sau'}).click();
  await page.locator('.bb-node').first().click();
  await page.locator('.bb-preparation').getByRole('button',{name:/Bắt đầu/}).click();
  expect(await page.evaluate(()=>JSON.parse(localStorage.getItem('arcadex_blossom_review_v1')!).active.companion)).toBe(expected);
 }
});
