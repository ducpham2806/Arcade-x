import {test,expect} from '@playwright/test';
import {createRun,hint} from '../../src/games/hex-match/blossom/engine';
import {LEVELS} from '../../src/games/hex-match/blossom/levels';
import {defaultSave} from '../../src/games/hex-match/blossom/save';
import {lessonsFor} from '../../src/games/hex-match/blossom/tutorials';
// Old sprite tests ran in a standalone review, outside .arcade-app; they could not catch
// launcher CSS erasing an otherwise healthy effect. These tests use the actual launcher.
for(const mode of ['no-preference','reduce'] as const)for(const special of ['bee_h','bee_v','sun','bloom_bomb','rainbow_orb','pop'] as const){
 test(`Chrome PC launcher: Blossom ${special} is visible and advances with OS motion=${mode}`,async({page})=>{
  await page.emulateMedia({reducedMotion:mode});await page.setViewportSize({width:1440,height:900});
  await page.route('**/*.supabase.co/**',route=>route.abort());
  const save=defaultSave(),run=createRun(LEVELS[4],9);run.level.goals=[{kind:'score',target:9999999}];
  if(special!=='pop')run.board[14].special=special;
  save.active=run;save.tutorials=lessonsFor(run,[]).map(l=>l.id);
  await page.addInitScript(save=>localStorage.setItem('arcadex_blossom_v1',JSON.stringify(save)),save);
  await page.goto('/');await page.locator('#btn-play-hex-match').click();
  await page.locator(`[data-cell="${special==='pop'?hint(run)[0]:14}"]`).click();
  const sheet=page.locator('.bb-fx-sheet').first();await expect(sheet).toBeAttached();
  const sample=await sheet.evaluate(async el=>{
   const strip=el.querySelector('.bb-fx-strip')!;
   const image=new Image();image.src=strip.getAttribute('href')!;await image.decode();
   const animations=el.getAnimations({subtree:true});await Promise.all(animations.map(a=>a.ready));
   const before=strip.getAnimations()[0]?.currentTime;
   await new Promise(r=>setTimeout(r,100));
   const progressed=Number(strip.getAnimations()[0]?.currentTime)>Number(before)+30;
   // Seek inside the visible interval to check actual opacity and flipbook frames,
   // rather than merely asserting that invisible SVG nodes exist.
   for(const a of animations){a.pause();a.currentTime=100;}
   const first=getComputedStyle(strip).transform,opacity=getComputedStyle(el).opacity;
   for(const a of animations)a.currentTime=220;
   return {progressed,opacity:Number(opacity),first,second:getComputedStyle(strip).transform,duration:getComputedStyle(strip).animationDuration};
  });
  expect(sample.duration).not.toBe('1e-05s');expect(sample.progressed).toBe(true);expect(sample.opacity).toBeGreaterThan(.5);expect(sample.first).not.toBe(sample.second);
  await page.screenshot({path:`test-results/blossom-vfx-${mode}-${special}.png`});
 });
}
for(const reduced of [false,true])for(const hit of [false,true])test(`Battleship ${hit?'explosion':'splash'} feedback is drawn (reduced=${reduced})`,async({page})=>{
 await page.addInitScript(()=>{
  const original=CanvasRenderingContext2D.prototype.drawImage;
  (window as unknown as {__battleFX:string[]}).__battleFX=[];
  CanvasRenderingContext2D.prototype.drawImage=function(...args:Parameters<CanvasRenderingContext2D['drawImage']>){
   const source=args[0];if(source instanceof HTMLImageElement&&/\/(explosion|splash|missile|fire|smoke)[-\.]/.test(source.src)){
    const samples=(window as unknown as {__battleFX:string[]}).__battleFX;samples.push(source.src.split('/').at(-1)!);if(samples.length>1000)samples.shift();
   }
   return (original as Function).apply(this,args);
  } as CanvasRenderingContext2D['drawImage'];
 });
 await page.goto('/tests/motion/battleship-fixture.html');await expect(page.locator('canvas')).toBeVisible();
 if(reduced)await page.getByRole('checkbox',{name:'Giảm chuyển động'}).check();
 await page.getByRole('button',{name:hit?'Hit':'Miss',exact:true}).click();
 // Poll the sprite source submitted to the real Canvas renderer, not a DOM placeholder.
 await expect.poll(()=>page.evaluate(prefix=>(window as unknown as {__battleFX:string[]}).__battleFX.filter(n=>n.startsWith(prefix)),hit?'explosion':'splash'),{timeout:3000}).not.toHaveLength(0);
 await page.waitForTimeout(160);
 if(!reduced&&hit)await page.waitForTimeout(700);
 const samples=await page.evaluate(()=>(window as unknown as {__battleFX:string[]}).__battleFX);
 if(!reduced){expect(samples.some(n=>n.startsWith('missile'))).toBe(true);expect(new Set(samples.filter(n=>n.startsWith(hit?'explosion':'splash'))).size).toBeGreaterThan(1);if(hit){expect(samples.some(n=>n.startsWith('fire'))).toBe(true);expect(samples.some(n=>n.startsWith('smoke'))).toBe(true);}}
 if(reduced){expect(samples.some(n=>n.startsWith('missile'))).toBe(false);expect(new Set(samples.filter(n=>n.startsWith(hit?'explosion':'splash'))).size).toBe(1);}
 await page.screenshot({path:`test-results/battleship-vfx-${reduced?'reduced':'full'}-${hit?'hit':'miss'}.png`});
});
