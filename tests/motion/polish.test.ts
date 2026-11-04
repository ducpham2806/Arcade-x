import {test,expect,type Page} from '@playwright/test';
import {freshState,reduceDungeon} from '../../src/games/dungeon-tap/engine';
const localOnly=async(page:Page)=>{await page.route('**/*',route=>new URL(route.request().url()).hostname==='127.0.0.1'?route.continue():route.abort());};
async function noBlackTiles(page:Page){await expect.poll(()=>page.locator('.fx-root [data-ax-readable]').evaluateAll(es=>es.filter(e=>(e as HTMLElement).style.backgroundColor==='rgb(17, 28, 45)'&&e.getBoundingClientRect().width>0).map(e=>e.textContent))).toEqual([]);}
for(const mobile of [false,true])for(const reduced of [false,true])test(`Dungeon readable across 8 panels; background save; motion/pause (${mobile?'phone':'desktop'}, reduced=${reduced})`,async({page})=>{
 await localOnly(page);await page.setViewportSize(mobile?{width:390,height:844}:{width:1440,height:900});await page.emulateMedia({reducedMotion:reduced?'reduce':'no-preference'});
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('/');await page.locator('#btn-play-dungeon-tap').click();await expect(page.locator('.fx-root')).toBeVisible();await page.waitForTimeout(500);await noBlackTiles(page);
 // Native CSS motion must advance between simulation ticks, and OS reduction must stop it.
 const actor=page.locator('.v6-hero .dt-actor-motion');const movement=await actor.evaluate(async el=>{const a=getComputedStyle(el).transform;await new Promise(r=>setTimeout(r,110));return {a,b:getComputedStyle(el).transform};});
 if(reduced)expect(movement.b).toBe('none');else expect(movement.b).not.toBe(movement.a);
 await page.locator('.fx-nav').getByRole('button',{name:'Anh hùng',exact:true}).click();
 for(const label of ['Anh hùng','Đội hình','Túi đồ','Bản đồ','Ấn Titan']){
  await page.locator('.fx-modal-tabs').getByRole('button',{name:label,exact:true}).click();await page.waitForTimeout(220);await noBlackTiles(page);
  const art=page.locator('.fx-modal .dt-frame-current');if(await art.count())expect(await art.first().evaluate(el=>Number(getComputedStyle(el).opacity))).toBe(1);
 }
 await page.getByRole('button',{name:'Trở về trận đấu',exact:true}).click();await page.getByRole('button',{name:'Mở sách tuyệt kỹ',exact:true}).click();await page.waitForTimeout(220);await noBlackTiles(page);await page.getByRole('button',{name:'Trở về trận đấu',exact:true}).click();
 await page.getByRole('button',{name:'Menu',exact:true}).click();await page.waitForTimeout(220);await noBlackTiles(page);await page.getByRole('button',{name:'Cách chơi',exact:true}).click();await page.waitForTimeout(220);await noBlackTiles(page);
 const before=await actor.evaluate(el=>getComputedStyle(el).transform);await page.waitForTimeout(150);expect(await actor.evaluate(el=>getComputedStyle(el).transform)).toBe(before);
 await page.getByRole('button',{name:'Vào trận',exact:true}).click();
 for(const status of ['saving','synced']){await page.evaluate(status=>window.dispatchEvent(new CustomEvent('arcadex:cloud_sync',{detail:{gameId:'dungeon-tap',status,offline:true}})),status);await expect(page.locator('#cloud-sync-status-container')).toHaveCount(0);}
 for(const status of ['local','pending','synced']){await page.evaluate(status=>window.dispatchEvent(new CustomEvent('arcadex:save-status',{detail:{gameId:'dungeon-tap',status}})),status);await expect(page.locator('#game-save-status-slot')).toBeEmpty();}
 await page.evaluate(()=>window.dispatchEvent(new CustomEvent('arcadex:save-status',{detail:{gameId:'dungeon-tap',status:'error'}})));await expect(page.locator('#game-save-status-slot')).toContainText('Chưa lưu được');
 await page.evaluate(()=>window.dispatchEvent(new CustomEvent('arcadex:save-status',{detail:{gameId:'dungeon-tap',status:'synced'}})));await expect(page.locator('#game-save-status-slot')).toBeEmpty();
 const attack=page.locator('.fx-main-attack');await attack.dispatchEvent('pointerdown',{pointerId:1});await page.waitForTimeout(800);await attack.dispatchEvent('pointerup',{pointerId:1});
 await expect(page.locator('.v6-hero .dt-frame-previous')).toHaveCount(1);expect(await page.locator('.dt-actor-frame').count()).toBeLessThan(24);
 await page.getByRole('button',{name:'Menu',exact:true}).click();await page.getByRole('button',{name:'Lưu tiến trình',exact:true}).click();await expect(page.locator('#game-save-status-slot')).toBeEmpty();
 // A real save still takes place after removing success UI.
 expect(await page.evaluate(()=>Object.keys(localStorage).filter(k=>/dungeon/i.test(k)))).not.toEqual([]);
 await noBlackTiles(page);await page.screenshot({path:`test-results/dungeon-polish-${mobile?'phone':'desktop'}-${reduced?'reduced':'full'}.png`});expect(errors).toEqual([]);
});
test('Battleship sunk hulls: flames over deck and centred fleet strikes',async({page})=>{
 await localOnly(page);await page.setViewportSize({width:1280,height:900});
 await page.addInitScript(()=>{const original=CanvasRenderingContext2D.prototype.drawImage;(window as any).__draws=[];CanvasRenderingContext2D.prototype.drawImage=function(...args:any[]){if(this.canvas.hasAttribute('data-perspective')){const image=args[0];const a=(window as any).__draws;a.push(image instanceof HTMLCanvasElement?(image.width===1000&&image.height===820?'layer':'hull'):image.src?.split('/').at(-1));if(a.length>100)a.shift();}return (original as Function).apply(this,args);};});
 await page.goto('/tests/motion/battle-polish-fixture.html');await expect(page.locator('.bs-fleet-row li.sunk')).toHaveCount(2);await page.waitForTimeout(300);
 const draws:string[]=await page.evaluate(()=>(window as any).__draws);const fire=draws.findIndex(x=>x?.startsWith('fire'));expect(fire).toBeGreaterThan(-1);
 // Per frame: water + grid + 2 hulls, then all fire/smoke, then just haze.
 let checked=0;for(let i=0;i<draws.length;i++)if(draws[i]?.startsWith('fire')){const haze=draws.indexOf('layer',i);if(haze>i){expect(draws.slice(i,haze)).not.toContain('hull');checked++;}}expect(checked).toBeGreaterThan(0);
 const geometry=await page.locator('.bs-fleet-row li.sunk').evaluateAll(es=>es.map(el=>{const li=el.getBoundingClientRect(),img=el.querySelector('img')!.getBoundingClientRect(),strike=getComputedStyle(el,'::after');return {delta:Math.abs(img.y+img.height/2-(li.y+li.height/2)),strike:parseFloat(strike.top),height:li.height};}));
 for(const g of geometry){expect(g.delta).toBeLessThan(1);expect(Math.abs(g.strike-g.height/2)).toBeLessThan(1);}
 await page.screenshot({path:'test-results/battleship-polish.png'});
});
test('Radar rotates and emits double beep per sweep; mute/pause/unmount stop sound',async({page})=>{
 await localOnly(page);await page.addInitScript(()=>{const start=OscillatorNode.prototype.start;(window as any).__tones=0;OscillatorNode.prototype.start=function(...args:Parameters<OscillatorNode['start']>){(window as any).__tones++;return start.apply(this,args);};});
 await page.goto('/tests/motion/battle-polish-fixture.html');await expect(page.locator('.bs-radar-sweep')).toBeVisible();expect(await page.evaluate(()=>(window as any).__tones)).toBe(0);
 await page.locator('.bs-radar').click();await expect(page.locator('[data-audio-state]')).toHaveAttribute('data-audio-state','running');
 const beforePing=await page.evaluate(()=>(window as any).__tones);
 const afterPing=await page.locator('.bs-radar-sweep').evaluate(el=>new Promise<number>(resolve=>el.addEventListener('animationiteration',()=>setTimeout(()=>resolve((window as any).__tones),0),{once:true})));
 expect(afterPing-beforePing).toBe(2);
 const sweep=page.locator('.bs-radar-sweep');const a=await sweep.evaluate(el=>getComputedStyle(el).transform);await page.waitForTimeout(120);expect(await sweep.evaluate(el=>getComputedStyle(el).transform)).not.toBe(a);
 await page.getByRole('button',{name:'Pause radar',exact:true}).click();const b=await sweep.evaluate(async el=>{await Promise.all(el.getAnimations().map(a=>a.ready));await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));return getComputedStyle(el).transform;});await page.waitForTimeout(200);expect(await sweep.evaluate(el=>getComputedStyle(el).transform)).toBe(b);
 await page.getByRole('button',{name:'Pause radar',exact:true}).click();
 await expect(page.locator('[data-audio-state]')).toHaveAttribute('data-audio-state',/^(running|suspended)$/);
 const resume=page.getByRole('button',{name:'Tiếp tục âm thanh',exact:true});if(await resume.isVisible())await resume.click();
 await expect(page.locator('[data-audio-state]')).toHaveAttribute('data-audio-state','running');await page.getByRole('button',{name:'Tắt âm thanh',exact:true}).click();await expect(page.getByRole('button',{name:'Bật âm thanh',exact:true})).toBeVisible();const muted=await page.evaluate(()=>(window as any).__tones);await page.waitForTimeout(3300);expect(await page.evaluate(()=>(window as any).__tones)).toBe(muted);
 await page.getByRole('button',{name:'Bật âm thanh',exact:true}).click();await page.getByRole('button',{name:'Toggle radar',exact:true}).click();const exited=await page.evaluate(()=>(window as any).__tones);await page.waitForTimeout(3300);expect(await page.evaluate(()=>(window as any).__tones)).toBe(exited);
});

for(const mobile of [false,true])test(`Dungeon advanced progress: boss, unlocked skills and equipment text (${mobile?'phone':'desktop'})`,async({page})=>{
 await localOnly(page);await page.setViewportSize(mobile?{width:390,height:844}:{width:1440,height:900});
 let s=freshState(44);s.gold=1e12;s.heroLevel=100;s.runes=100;s.maxStageReached=200;s.allies=s.allies.map(a=>({...a,unlocked:true,level:20}));
 s.inventory=(['common','rare','epic','legendary'] as const).map((rarity,i)=>({...s.equipped.weapon!,id:'audit-'+i,name:'Kiếm thử '+rarity,rarity,level:10+i,tapDmgBonus:200,upgradeCost:100}));
 s.allyInventory=s.allies.map(a=>({...a.equippedWeapon!,id:'audit-'+a.id,name:'Vũ khí thử '+a.profession,rarity:'legendary'}));s=reduceDungeon(s,{type:'stage',stage:100});
 await page.addInitScript(s=>localStorage.setItem('arcadex_gamestate_dungeon-tap',JSON.stringify(s)),s);await page.goto('/');await page.locator('#btn-play-dungeon-tap').click();await expect(page.locator('.fx-root')).toBeVisible();await page.waitForTimeout(500);await noBlackTiles(page);
 for(const label of ['Anh hùng','Đội hình','Túi đồ','Bản đồ','Ấn Titan']){
  await page.locator('.fx-nav').getByRole('button',{name:label,exact:true}).click();await page.waitForTimeout(220);await noBlackTiles(page);
  if(label==='Đội hình'){await page.locator('.fx-ally-select').nth(2).click();await page.waitForTimeout(220);await noBlackTiles(page);}
  if(label==='Túi đồ'){await page.locator('.fx-inventory button').first().click();await page.waitForTimeout(220);await noBlackTiles(page);await page.locator('.fx-segment button').filter({hasText:'Đồng đội'}).click();await page.waitForTimeout(220);await noBlackTiles(page);}
  await page.getByRole('button',{name:'Trở về trận đấu',exact:true}).click();
 }
 await page.getByRole('button',{name:'Mở sách tuyệt kỹ',exact:true}).click();await page.locator('.fx-spell-select').first().click();await page.waitForTimeout(220);await noBlackTiles(page);await page.screenshot({path:`test-results/dungeon-rich-${mobile?'phone':'desktop'}.png`});
});

test('Dungeon changing troop atlas at the same frame displays the new character',async({page})=>{
 await localOnly(page);await page.goto('/tests/motion/dungeon-actor-fixture.html');const current=page.locator('.dt-frame-current');
 expect(await current.evaluate(el=>getComputedStyle(el).backgroundImage)).toContain('/art-v5/enemies-a.webp');
 await page.getByRole('button',{name:'Đổi quân',exact:true}).click();
 await expect.poll(()=>current.evaluate(el=>getComputedStyle(el).backgroundImage)).toContain('/art-v6/extra-1.webp');
 await page.waitForTimeout(120);expect(await current.evaluate(el=>Number(getComputedStyle(el).opacity))).toBe(1);await expect(page.locator('.dt-actor-frame')).toHaveCount(2);
 await page.getByRole('button',{name:'Đổi quân',exact:true}).click();await expect.poll(()=>current.evaluate(el=>getComputedStyle(el).backgroundImage)).toContain('/art-v5/enemies-a.webp');await expect(page.locator('.dt-actor-frame')).toHaveCount(2);
});
