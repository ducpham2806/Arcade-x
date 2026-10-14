import {test,expect} from '@playwright/test';
import {launch,enterLauncher} from '../qc/helpers';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
for (const [width,height] of [[390,844],[1440,900]]) for(const offline of [false,true]) test(`${width}: Cosmic campaign loads art and controls ${offline?'offline':'in launcher'}`,async({page})=>{
  const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await page.setViewportSize({width,height});
  await page.addInitScript(()=>{sessionStorage.setItem('arcadex_splash_completed','true');localStorage.setItem('arcadex_onboarding_completed_v1','true');localStorage.setItem('arcadex_skip_pregame_loading','true');});
  await page.route('**/*',r=>{const u=new URL(r.request().url());return !['http:','https:'].includes(u.protocol)||(!offline&&u.hostname==='127.0.0.1')?r.continue():r.abort();});
  if(offline){await page.goto(pathToFileURL(path.resolve('../arcadex-launcher-review.html')).href);await enterLauncher(page);await page.locator('#game-card-cosmic-defense').scrollIntoViewIfNeeded();await page.locator('button[id^="btn-play-"][id$="cosmic-defense"]').first().click();}
  else await launch(page,'cosmic-defense');
  await page.getByRole('button',{name:'KHÁM PHÁ THIÊN HÀ'}).click();await page.getByRole('button',{name:/01 · Asteria/}).click();await page.locator('#cd-level-1').click();
  await expect(page.getByRole('dialog')).toBeVisible();await page.getByRole('button',{name:'Đóng cửa sổ'}).click();
  await expect(page.locator('#cd-launch')).toBeEnabled();await page.locator('#cd-launch').click();await expect(page.locator('#cd-canvas')).toBeVisible();
  await expect(page.getByRole('button',{name:'Ⅱ Tạm dừng'})).toBeInViewport();await page.waitForTimeout(3500);
  const pixels=await page.locator('#cd-canvas').evaluate((c:HTMLCanvasElement)=>{const d=c.getContext('2d')!.getImageData(0,0,c.width,c.height).data;return new Set(Array.from(d).filter((_,i)=>i%4!==3)).size;});expect(pixels).toBeGreaterThan(20);
  await page.screenshot({path:`tests/cosmic/screenshots/${width}-${offline?'offline':'launcher'}.png`});expect(errors).toEqual([]);
});

test('miniboss warning shapes remain distinct in the canvas renderer',async({page})=>{
  await page.goto('/');
  const frames=await page.evaluate(async()=>{
    const enginePath='/src/games/cosmic-defense/engine.ts',artPath='/src/games/cosmic-defense/art.tsx',savePath='/src/games/cosmic-defense/save.ts';
    const {createSimulation,step,EMPTY_UPGRADES}=await import(enginePath);
    const {drawGame,loadArt}=await import(artPath);
    const {emptySave}=await import(savePath);
    const art=await loadArt();const s=createSimulation({version:3,level:5,seed:42,mode:'practice',practiceEnemy:'commander',practiceCount:1,practicePath:7,integrity:100,upgrades:EMPTY_UPGRADES,boosters:[],mutators:[]});
    for(let i=0;i<240;i++){s.cloak=100;step(s,{x:90,y:268,mask:0});}s.bullets=[];
    const c=document.createElement('canvas');c.width=180;c.height=320;document.body.replaceChildren(c);c.style.cssText='width:540px;height:960px;image-rendering:pixelated';
    const output:string[]=[];for(let i=0;i<3;i++){const e=s.enemies[0];e.tele=s.frame+40;e.attackPattern=i;drawGame(c.getContext('2d')!,art,s,emptySave().settings);output.push(c.toDataURL());}
    return output;
  });expect(new Set(frames).size).toBe(3);await page.screenshot({path:'tests/cosmic/screenshots/mini-ring.png'});
});
