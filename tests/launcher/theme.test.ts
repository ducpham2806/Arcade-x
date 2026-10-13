import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {test,expect} from '@playwright/test';
import {enterLauncher,inspectState} from '../qc/helpers';
async function launch(page:any){await page.route('**/*',(r:any)=>new URL(r.request().url()).hostname==='127.0.0.1'?r.continue():r.abort());await inspectState(page);await page.goto('/');await enterLauncher(page);}
for(const [width,height] of [[320,568],[390,844],[1280,900]])test(`launcher screens use the light theme ${width}`,async({page})=>{
 await page.setViewportSize({width,height});await launch(page);
 for(const modal of ['profile','settings','leaderboard','pvpHistory']){
  await page.evaluate(modal=>window.dispatchEvent(new CustomEvent('arcadex:open_modal',{detail:{modal}})),modal);
  const panel=page.locator('.cd-dialog,.wc-dialog,.car-dialog,.arcadex-modal-container,.launcher-dialog,[class*="max-w-lg"][class*="flex-col"]').last();await expect(panel).toBeVisible();
  const style=await panel.evaluate(e=>({bg:getComputedStyle(e).backgroundColor,ink:getComputedStyle(e).color,width:e.getBoundingClientRect().width,height:e.getBoundingClientRect().height}));
  expect(style.bg).toBe('rgb(255, 255, 255)');expect(style.ink).not.toBe('rgb(255, 255, 255)');expect(style.width).toBeLessThanOrEqual(width);expect(style.height).toBeLessThanOrEqual(height);
  await expect(panel).toHaveCSS("opacity","1");
  await page.screenshot({path:`tests/launcher/screenshots/${modal}-${width}.png`});
  if(modal==='leaderboard'){for(const game of ['car-escape','cosmic-defense','tile-2048']){await page.locator('#leaderboard-game').selectOption(game);const ranking=page.locator('.cd-dialog,.wc-dialog,.car-dialog,.arcadex-modal-container').last();await expect(ranking).toBeVisible();await expect(ranking).toHaveCSS('background-color','rgb(255, 255, 255)');}}
  if(modal==='profile'){await expect(page.locator('#profile-name')).toHaveCSS('background-color','rgb(255, 255, 255)');await expect(page.locator('#btn-save-profile-name')).toHaveCSS('color','rgb(255, 255, 255)');}
  await page.evaluate(()=>window.dispatchEvent(new CustomEvent('arcadex:open_modal',{detail:{modal:'none'}})));
 }
 await page.evaluate(()=> (window as any).qcContext('openChat').openChat());
 const chat=page.locator('#window-global-chat');await expect(chat).toBeVisible();await expect(chat).toHaveCSS('background-color','rgb(255, 255, 255)');
 await expect(page.locator('#input-chat-message')).toHaveCSS('color','rgb(35, 48, 69)');
 await page.screenshot({path:`tests/launcher/screenshots/chat-${width}.png`});await page.locator('#btn-close-chat').click();
 await page.evaluate(()=> (window as any).qcContext('openShareModal').openShareModal({type:'score',gameId:'tile-2048',score:2048}));
 const share=page.locator('.platform-ui.fixed > [class*="max-w-lg"]').last();await expect(share).toBeVisible();await expect(share).toHaveCSS('background-color','rgb(255, 255, 255)');
 await page.screenshot({path:`tests/launcher/screenshots/share-${width}.png`});
 await page.evaluate(()=>window.dispatchEvent(new CustomEvent('arcadex:open_modal',{detail:{modal:'none'}})));
 await page.evaluate(()=> (window as any).qcContext('openGameDetail').openGameDetail('tile-2048'));
 await expect(page.locator('#game-detail-modal-overlay')).toBeVisible();await expect(page.locator('#btn-detail-launch-game')).toHaveCSS('color','rgb(255, 255, 255)');
 await page.screenshot({path:`tests/launcher/screenshots/detail-${width}.png`});
});
test('downloadable launcher review works offline and opens the themed account',async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 await page.route('https://**/*',r=>r.abort());await page.route('http://**/*',r=>r.abort());
 await page.goto(pathToFileURL(path.resolve(process.cwd(),'../arcadex-launcher-review.html')).href);
 expect(errors).toEqual([]);
 await enterLauncher(page);
 await page.getByRole('combobox',{name:'Xem màn hình launcher'}).selectOption('profile');
 await expect(page.locator('#profile-modal')).toBeVisible();await expect(page.locator('#profile-modal')).toHaveCSS('background-color','rgb(255, 255, 255)');
 expect(errors).toEqual([]);
});
