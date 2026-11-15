import {test,expect,type Page} from '@playwright/test';
import {mockSupabase} from '../auth/backend';

// Same-origin srcdoc contract observed from Netlify's public HUD. No provider
// code, requests or dismissal state is copied; keep the visible branding intact.
async function attachBadge(page:Page,opaque=false){
 await page.evaluate(opaque=>{
  const frame=document.createElement('iframe');frame.id='nl-badge-frame';frame.title='Powered by Netlify';
  frame.style.cssText='position:fixed;bottom:0;right:0;width:194px;height:64px;border:0;z-index:2147483645';
  if(opaque)frame.sandbox.add('allow-scripts');
  frame.srcdoc='<style>html,body{margin:0;height:100%;background:transparent}.nl-badge{position:absolute;bottom:18px;left:8px;height:38px;box-sizing:border-box;display:flex;align-items:center;background:#142b34;color:white;border-radius:24px;padding:0 12px;font:13px sans-serif}</style><a class="nl-badge" href="https://www.netlify.com/" target="_blank">Powered by Netlify</a>';
  frame.addEventListener('load',()=>{frame.dataset.nlReady='1';});document.body.appendChild(frame);
 },opaque);
 await expect(page.locator('#nl-badge-frame')).toHaveAttribute('data-nl-ready','1');
}
const inset=(page:Page)=>page.evaluate(()=>parseFloat(document.documentElement.style.getPropertyValue('--arcadex-host-bottom-inset'))||0);
async function aboveBadge(page:Page,selector:string){
 return page.locator(selector).evaluate(el=>{
  const frame=document.getElementById('nl-badge-frame') as HTMLIFrameElement,r=frame.getBoundingClientRect();
  const badge=frame.contentDocument?.querySelector('.nl-badge')?.getBoundingClientRect();
  const top=r.top+(badge?.top??0),box=el.getBoundingClientRect();
  return {above:box.bottom<=top-5,bottom:box.bottom,badgeTop:top};
 });
}

for(const viewport of [{width:320,height:740},{width:390,height:844},{width:844,height:390},{width:1440,height:900}]){
 test(`hosting badge keeps detail and full Snake controls clear at ${viewport.width}x${viewport.height}`,async({page,context},info)=>{
  test.setTimeout(60000);await page.setViewportSize(viewport);await mockSupabase().install(context);await page.goto('/');
  await expect(page.locator('#game-library')).toBeVisible();expect(await inset(page)).toBe(0);
  await page.locator('#btn-detail-card-snake-legend').click();const dialog=page.getByRole('dialog',{name:'Rắn Săn Mồi'});await expect(dialog).toBeVisible();
  const original=await dialog.boundingBox();
  await attachBadge(page);await expect.poll(async()=>(await aboveBadge(page,'#btn-detail-launch-game')).above).toBe(true);
  await expect.poll(()=>inset(page)).toBe(64);await page.screenshot({path:info.outputPath('detail-with-badge.png')});
  const reserved=await inset(page);
  await page.evaluate(()=>{document.getElementById('nl-badge-frame')!.style.height='320px';});
  // Let ResizeObserver and its scheduled measurement finish before asserting a
  // value that should stay unchanged; an immediate poll could read stale state.
  await page.evaluate(()=>new Promise<void>(resolve=>requestAnimationFrame(()=>requestAnimationFrame(()=>requestAnimationFrame(()=>resolve())))));
  await expect.poll(()=>inset(page)).toBe(reserved); // Optional popover grows upward; badge stays at the bottom.
  await page.evaluate(()=>{document.getElementById('nl-badge-frame')!.style.height='64px';});
  await page.locator('#btn-detail-launch-game').click();await expect(page.locator('.snake-journey')).toBeVisible();
  await page.locator('.snake-journey [data-level="0"]').click();await page.locator('.journey-play').click();
  await page.locator('.story-app .overlay [data-action="primary"]').click();
  await expect.poll(async()=>parseFloat(await page.locator('.story-app .timer').innerText())).toBeGreaterThan(0);
  for(const selector of ['.stick-zone','.dash-zone'])await expect.poll(async()=>(await aboveBadge(page,selector)).above).toBe(true);
  await expect.poll(async()=>{const frame=await page.locator('#game-wrapper-viewport').boundingBox();return Math.round(frame!.y+frame!.height);}).toBe(viewport.height-reserved);
  await page.screenshot({path:info.outputPath('play-with-badge.png')});
  await expect(page.frameLocator('#nl-badge-frame').getByRole('link',{name:'Powered by Netlify'})).toBeVisible();
  await page.evaluate(()=>{document.getElementById('nl-badge-frame')!.style.display='none';});await expect.poll(()=>inset(page)).toBe(0);
  await page.evaluate(()=>{document.getElementById('nl-badge-frame')!.style.display='block';});await expect.poll(()=>inset(page)).toBe(64);
  await page.evaluate(()=>document.getElementById('nl-badge-frame')!.remove());await expect.poll(()=>inset(page)).toBe(0);
  await page.locator('#btn-game-exit').click();await page.locator('#btn-exit-confirm').click();await expect(page.locator('#game-library')).toBeVisible();
  await page.locator('#btn-detail-card-snake-legend').click();await expect(dialog).toBeVisible();
  const restored=await dialog.boundingBox();expect(Math.abs(restored!.height-original!.height)).toBeLessThanOrEqual(1);
 });
}

test('opaque hosting iframe uses its outer bounds and clears after removal',async({page,context})=>{
 await page.setViewportSize({width:390,height:844});await mockSupabase().install(context);await page.goto('/');await expect(page.locator('#game-library')).toBeVisible();
 await attachBadge(page,true);await expect.poll(()=>inset(page)).toBe(72);
 await page.locator('#btn-detail-card-snake-legend').click();await expect.poll(async()=>(await aboveBadge(page,'#btn-detail-launch-game')).above).toBe(true);
 await page.evaluate(()=>document.getElementById('nl-badge-frame')!.remove());await expect.poll(()=>inset(page)).toBe(0);
});
