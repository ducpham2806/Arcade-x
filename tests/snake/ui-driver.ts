import {expect,type Page} from '@playwright/test';
export async function loginSnake(page:Page,user:{email:string;password:string;name:string}){
 await page.goto('/preview/snake/');await page.getByRole('button',{name:'Đăng nhập để chơi thử'}).click();
 await page.locator('#input-login-identifier').fill(user.email);await page.locator('#input-login-password').fill(user.password);
 await page.locator('#btn-submit-login').click();
 const setup=page.locator('#input-setup-name');
 await expect(page.getByRole('button',{name:'Chơi bản preview'}).or(setup)).toBeVisible({timeout:30000});
 if(await setup.isVisible()){await setup.fill(user.name);await page.locator('#btn-complete-profile').click();}
 await expect(page.getByRole('button',{name:'Chơi bản preview'})).toBeVisible({timeout:30000});
}
export async function observeEngine(page:Page){
 await page.evaluate(async()=>{
  // Read-only observation; input still comes through real pointer controls and real frame time.
  const modulePath='/src/games/snake-legend/src/core.ts';
  const {Engine}=await import(modulePath);
  const original=Engine.prototype.step;const ids=new WeakMap<object,number>();let serial=0;
  Engine.prototype.step=function(input){const result=original.call(this,input);if(!ids.has(this))ids.set(this,++serial);(window as any).__snakeUiProbe={engineId:ids.get(this),status:this.status,pos:{...this.pos},tick:this.tick,time:this.time,hearts:this.hearts,score:this.score,guide:this.arena.story?.guide};return result;};
 });
}
export async function openFirstLevel(page:Page){
 await page.bringToFront();await page.getByRole('button',{name:'Chơi bản preview'}).click();await expect(page.locator('.snake-journey')).toBeVisible({timeout:30000});
 await page.locator('.snake-journey [data-level="0"]').click();
 await page.locator('[data-action="play"]').click();await expect(page.locator('.story-app')).toBeVisible();

}
export async function winFirstLevel(page:Page,onProgress?:(probe:any)=>Promise<void>){
 await resumeSnakeHost(page);
 const resume=page.locator('.story-app [data-action="primary"]');await resume.click();
 await page.waitForFunction(()=>!!(window as any).__snakeUiProbe?.tick);
 const stick=page.locator('.joystick'),box=(await stick.boundingBox())!;const center={x:box.x+box.width/2,y:box.y+box.height/2};
 await page.mouse.move(center.x,center.y);await page.mouse.down();let waypoint=1;const deadline=Date.now()+60000;
 try{
  while(Date.now()<deadline){
   const probe=await page.evaluate(()=>(window as any).__snakeUiProbe);if(probe.status!=='running'){expect(probe.status,JSON.stringify(probe)).toBe('won');return probe;}
   await onProgress?.(probe);
   const target=probe.guide[waypoint];if(Math.hypot(probe.pos.x-target.x,probe.pos.y-target.y)<.6&&waypoint<probe.guide.length-1){waypoint++;continue;}
   const dx=target.x-probe.pos.x,dy=target.y-probe.pos.y,d=Math.hypot(dx,dy)||1;
   await page.mouse.move(center.x+dx/d*box.width*.38,center.y+dy/d*box.height*.38);
   await page.waitForTimeout(35);
  }
  throw Error('Real-input playthrough did not finish within60s');
 }finally{await page.mouse.up();}
}

export function pendingSnake(page:Page,owner:string){return page.evaluate(owner=>JSON.parse(localStorage.getItem('snake-legend:verified-outbox:v1:'+owner)||'{"pending":[]}').pending.length,owner);}
export function platformWallet(page:Page){return page.evaluate(async()=>{const path='/src/services/storage/index.ts';const {StorageService}=await import(path);const p=StorageService.loadProfile();return {coins:p.coins,gems:p.gems,exp:p.exp,level:p.level};});}
export async function openSnakeJourney(page:Page){await page.getByRole('button',{name:'Chơi bản preview'}).click();await expect(page.locator('.snake-journey')).toBeVisible({timeout:30000});}

export async function resumeSnakeHost(page:Page){
 await page.bringToFront();const pause=page.locator('#btn-game-pause');
 if(await pause.getAttribute('aria-label')==='Tiếp tục chơi'){await pause.click();await expect(pause).toHaveAttribute('aria-label','Tạm dừng',{timeout:7000});await expect(page.locator('.story-app .overlay')).toBeVisible();}
}

/** Expired synthetic cache only; never a substitute for real issuer expiry. */
export async function expireFixtureSession(page:Page){
 await page.evaluate(()=>{
  const key=Object.keys(localStorage).find(key=>/^sb-.*-auth-token$/.test(key));if(!key)throw Error('Missing fixture session');
  const session=JSON.parse(localStorage.getItem(key)!);const [header,encoded]=session.access_token.split('.');
  const payload=JSON.parse(atob(encoded.replace(/-/g,'+').replace(/_/g,'/')));payload.exp=1;
  const expired=btoa(JSON.stringify(payload)).replace(/=/g,'').replace(/\+/g,'-').replace(/\//g,'_');
  session.access_token=header+'.'+expired+'.test';session.expires_at=1;localStorage.setItem(key,JSON.stringify(session));
 });
}
