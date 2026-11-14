import {test,expect} from '@playwright/test';

test('R01 rig renders all boss states and freezes exactly at a chosen simulation tick',async({page},info)=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 await page.setViewportSize({width:960,height:680});await page.goto('/tests/snake/content-review.html');
 await page.waitForFunction(()=>(window as any).review?.ready);await page.evaluate(()=>(window as any).review.ready());
 for(const state of ['idle','telegraph','attack','recovery','weak','hurt','phase_change','defeated']){
  await page.evaluate(state=>(window as any).review.renderAt(.4,state),state);
  await page.locator('canvas').screenshot({path:info.outputPath(`mother-${state}.png`)});
 }
 const pixels=async()=>page.locator('canvas').evaluate(c=>(c as HTMLCanvasElement).toDataURL());
 await page.evaluate(()=>(window as any).review.renderAt(0));const first=await pixels();
 await page.evaluate(()=>(window as any).review.renderAt(.4));const next=await pixels();expect(next).not.toBe(first);
 await page.waitForTimeout(250);expect(await pixels()).toBe(next);
 await page.evaluate(()=>(window as any).review.renderAt(.4));expect(await pixels()).toBe(next);
 await page.emulateMedia({reducedMotion:'reduce'});await page.evaluate(()=>(window as any).review.renderAt(.4));
 await page.locator('canvas').screenshot({path:info.outputPath('mother-reduced.png')});
 await page.setViewportSize({width:390,height:844});await page.waitForFunction(()=>{const c=document.querySelector('canvas')!;return c.width===Math.round(c.getBoundingClientRect().width*Math.min(devicePixelRatio,2));});await page.evaluate(()=>(window as any).review.renderAt(.4,'weak'));
 expect(await page.locator('canvas').evaluate(c=>(c as HTMLCanvasElement).getContext('2d')!.getImageData(0,0,1,1).data[3])).toBe(255);await page.screenshot({path:info.outputPath('mother-phone.png')});
 await page.setViewportSize({width:960,height:680});await page.goto('/tests/snake/content-review.html?sizes=1');await page.waitForFunction(()=>(window as any).review?.ready);
 await page.locator('canvas').screenshot({path:info.outputPath('character-native-24-48-96.png')});expect(errors).toEqual([]);
});

test('chapter ending reflects earned stars and secret; replay preserves the campaign',async({page},info)=>{
 for(const viewport of [{width:1440,height:900},{width:390,height:844},{width:568,height:320}]){
  await page.setViewportSize(viewport);await page.goto('/tests/snake/content-review.html?journey=1&complete=1');
  await expect(page.locator('.chapter-ending')).toBeVisible();await expect(page.locator('.chapter-ending h2')).toBeInViewport({ratio:1});await expect(page.locator('.chapter-replay')).toContainText('29/30');await expect(page.locator('.chapter-collection')).toContainText('vẫn chờ');
  const save=await page.evaluate(()=>(window as any).review.save());
  await page.locator('[data-action="mastery"]').click();await expect(page.locator('.journey-eyebrow')).toContainText('1-7');await expect(page.locator('.journey-play')).toBeFocused();
  await page.locator('.journey-field-notes summary').click();await expect(page.locator('.journey-read')).toContainText('Ba cầu');
  await page.locator('.journey-play').click();expect(await page.evaluate(()=>(window as any).review.choice)).toEqual({level:6,resume:false});
  expect(await page.evaluate(()=>(window as any).review.save())).toBe(save);
  await page.locator('.journey-node[data-level="2"]').click();await expect(page.locator('.journey-eyebrow')).toContainText('1-3');await expect(page.locator('.journey-level-name')).toBeInViewport({ratio:1});
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
  await page.screenshot({path:info.outputPath(`chapter-mastery-${viewport.width}.png`)});
 }
 await page.setViewportSize({width:1440,height:900});await page.goto('/tests/snake/content-review.html?journey=1&complete=1&perfect=1');
 await expect(page.locator('.chapter-ending h2')).toHaveText('Thảo Nguyên đã tỏa sáng!');await expect(page.locator('.chapter-collection')).toContainText('Đã tìm thấy');await page.screenshot({path:info.outputPath('chapter-perfect.png')});
 await page.goto('/tests/snake/content-review.html?journey=1');await expect(page.locator('.chapter-ending')).toBeHidden();await expect(page.locator('.journey-clears')).toHaveText('0/10 màn');
});


test('final chapter navigation waits for a durable clear after quota failure',async({page})=>{
 // Synthetic terminal state isolates result/navigation; full campaign proves actual wins separately.
 await page.goto('/tests/snake/content-review.html?finale=1');await page.waitForFunction(()=>(window as any).review?.ready);
 await page.locator('.story-app [data-action="primary"]').click();await page.waitForTimeout(150);await page.evaluate(()=>(window as any).review.finish());
 await expect(page.locator('.save-message')).toContainText('Chưa lưu được');
 const button=page.locator('.story-app [data-action="primary"]');await expect(button).not.toHaveText('Hiện đủ kết quả');await button.click();
 expect(await page.evaluate(()=>(window as any).review.journeyCalls)).toBe(0);
 expect(Object.keys(JSON.parse(await page.evaluate(()=>(window as any).review.save())).levels)).toHaveLength(9);
 await page.evaluate(()=>(window as any).review.unblock());await button.click();
 await expect.poll(()=>page.evaluate(()=>(window as any).review.journeyCalls)).toBe(1);
 expect(Object.keys(JSON.parse(await page.evaluate(()=>(window as any).review.save())).levels)).toHaveLength(10);
});
