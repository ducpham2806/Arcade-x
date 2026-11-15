import {test,expect,type Page} from '@playwright/test';
import {snakeUiFixture} from './ui-fixture';
import {loginSnake,observeEngine,openFirstLevel} from './ui-driver';
import {observeSnakeResources,snakeResources} from './runtime-probe';
test.describe.configure({timeout:60000});
const probe=(page:Page)=>page.evaluate(()=>(window as any).__snakeUiProbe);
async function start(page:Page){await page.locator('.story-app [data-action="primary"]').click();await expect.poll(async()=>!!(await probe(page))?.tick).toBe(true);}

test('lab pagehide clears held keyboard input and requires explicit resume',async({page,context})=>{
 const fixture=await snakeUiFixture();await fixture.install(context);await loginSnake(page,fixture.user('lab-hide'));await observeEngine(page);
 await page.getByRole('button',{name:'Chơi bản preview'}).click();await page.locator('[data-action="lab"]').click();await page.locator('[data-action="resume"]').click();
 await page.keyboard.down('ArrowUp');await page.keyboard.down('Space');await expect.poll(async()=>(await probe(page))?.input.dash).toBe(true);
 // Lifecycle injection exercises BFCache/pagehide independently of blur/visibility.
 await page.evaluate(()=>window.dispatchEvent(new PageTransitionEvent('pagehide',{persisted:true})));
 await expect(page.locator('.snake-app .overlay')).toBeVisible();const tick=(await probe(page)).tick;await page.waitForTimeout(250);expect((await probe(page)).tick).toBe(tick);
 await page.locator('[data-action="resume"]').click();await expect.poll(async()=>(await probe(page)).input).toMatchObject({x:0,y:0,dash:false});await page.keyboard.up('ArrowUp');await page.keyboard.up('Space');
});

test('repeated play/settings/exit releases Snake listeners, render loops, observers and audio',async({page,context},info)=>{
 test.setTimeout(120000);await observeSnakeResources(page);const fixture=await snakeUiFixture();await fixture.install(context);await loginSnake(page,fixture.user('resources'));await observeEngine(page);
 const errors:string[]=[];page.on('pageerror',error=>errors.push(error.name));const samples=[];
 for(let cycle=0;cycle<3;cycle++){
  await openFirstLevel(page);await page.locator('.story-app [data-action="settings"]').click();await page.locator('[data-setting="sound"]').check();
  await page.locator('[data-action="test-sound"]').click();await expect.poll(async()=>(await snakeResources(page)).audioStates).toEqual(['running']);
  if(cycle===0)await page.screenshot({path:info.outputPath('audio-settings.png')});
  await page.locator('[data-action="close-settings"]').click();await start(page);await page.evaluate(()=>(window as any).__snakeResources.resetTimings());await page.waitForTimeout(1500);
  const active=await snakeResources(page);expect(active.raf).toBe(1);expect(active.resizeObservers).toBe(1);expect(active.audioContexts).toBe(1);expect(active.globalListeners).toBeGreaterThan(0);expect(active.renderFrames).toBeGreaterThan(10);samples.push(active);
  await page.locator('#btn-game-exit').click();await page.locator('#btn-exit-confirm').click();await expect(page.getByRole('button',{name:'Chơi bản preview'})).toBeVisible();
  await expect.poll(async()=>{const s=await snakeResources(page);return {raf:s.raf,resizeObservers:s.resizeObservers,globalListeners:s.globalListeners,audioContexts:s.audioContexts};}).toEqual({raf:0,resizeObservers:0,globalListeners:0,audioContexts:0});
 }
 expect(errors).toEqual([]);await info.attach('resource-observations',{body:Buffer.from(JSON.stringify({cycles:3,samples,scope:'Chromium loopback; no heap or physical device claim'},null,2)),contentType:'application/json'});
});

test.describe('touch viewport',()=>{
 test.use({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
 test('portrait and landscape retain reachable controls and no horizontal overflow',async({page,context},info)=>{
  const fixture=await snakeUiFixture();await fixture.install(context);await loginSnake(page,fixture.user('layout'));await openFirstLevel(page);
  for(const size of [{width:390,height:844},{width:844,height:390},{width:320,height:568},{width:667,height:375},{width:568,height:320}]){
   await page.setViewportSize(size);
   for(const selector of ['.joystick','.dash','.story-app canvas']){const el=page.locator(selector);await expect(el).toBeInViewport({ratio:1});const box=(await el.boundingBox())!;expect(box.width).toBeGreaterThanOrEqual(44);expect(box.height).toBeGreaterThanOrEqual(44);}
   expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
   const selected=(await page.locator('.arenas [aria-current="true"]').boundingBox())!,label=(await page.locator('.arenas [aria-current="true"]>div').boundingBox())!;expect(label.y).toBeGreaterThanOrEqual(selected.y);expect(label.y+label.height).toBeLessThanOrEqual(selected.y+selected.height);
   const primary=page.locator('.story-app [data-action="primary"]');await primary.scrollIntoViewIfNeeded();await expect(primary).toBeInViewport({ratio:1});
   await page.screenshot({path:info.outputPath(`controls-${size.width}x${size.height}.png`)});
  }
  const session=await context.newCDPSession(page);try{
   for(const size of [{width:390,height:844,insets:{top:47,bottom:34,left:0,right:0}},{width:844,height:390,insets:{top:0,bottom:21,left:44,right:44}}]){
    await page.setViewportSize({width:size.width,height:size.height});await session.send('Emulation.setSafeAreaInsetsOverride',{insets:size.insets});
    await expect.poll(async()=>{const box=(await page.locator('#game-wrapper-viewport>header').boundingBox())!;return box.y;}).toBeGreaterThanOrEqual(size.insets.top);
    for(const selector of ['.joystick','.dash']){await expect(page.locator(selector)).toBeInViewport({ratio:1});const box=(await page.locator(selector).boundingBox())!;expect(box.x).toBeGreaterThanOrEqual(size.insets.left);expect(box.x+box.width).toBeLessThanOrEqual(size.width-size.insets.right);expect(box.y+box.height).toBeLessThanOrEqual(size.height-size.insets.bottom);}
    await page.screenshot({path:info.outputPath(`safe-area-${size.width}x${size.height}.png`)});
   }
  }finally{await session.send('Emulation.setSafeAreaInsetsOverride',{insets:{top:0,bottom:0,left:0,right:0}});await session.detach();}
  await page.locator('.story-app [data-action="settings"]').click();await page.locator('[data-setting="hand"]').selectOption('right');await page.locator('[data-action="close-settings"]').click();
  expect((await page.locator('.joystick').boundingBox())!.x).toBeGreaterThan((await page.locator('.dash').boundingBox())!.x);
 });

 test('two native touch pointers steer and Dash independently, cancellation pauses safely',async({page,context},info)=>{
  const fixture=await snakeUiFixture();await fixture.install(context);await loginSnake(page,fixture.user('touch'));await observeEngine(page);await openFirstLevel(page);await start(page);
  const stick=(await page.locator('.joystick').boundingBox())!,dash=(await page.locator('.dash').boundingBox())!;
  const a={id:1,x:stick.x+stick.width*.8,y:stick.y+stick.height/2},b={id:2,x:dash.x+dash.width/2,y:dash.y+dash.height/2};
  const session=await context.newCDPSession(page);try{
   await session.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[a]});await session.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[a,b]});
   await expect.poll(async()=>(await probe(page)).input.dash).toBe(true);expect((await probe(page)).input.x).toBeGreaterThan(.5);
   await session.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[b]});await expect.poll(async()=>(await probe(page)).input.dash).toBe(false);expect((await probe(page)).input.x).toBeGreaterThan(.5);
   await session.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await expect.poll(async()=>(await probe(page)).input).toMatchObject({x:0,y:0,dash:false});await expect(page.locator('.story-app .overlay')).toBeHidden();
   await session.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[a,b]});await expect(page.locator('.dash')).toHaveClass(/held/);
   await session.send('Input.dispatchTouchEvent',{type:'touchCancel',touchPoints:[]});await expect(page.locator('.story-app .overlay')).toBeVisible();await expect(page.locator('.dash')).not.toHaveClass(/held/);
   const tick=(await probe(page)).tick;await page.waitForTimeout(250);expect((await probe(page)).tick).toBe(tick);await page.screenshot({path:info.outputPath('touch-cancel-paused.png')});
   await start(page);await expect.poll(async()=>(await probe(page)).input).toMatchObject({x:0,y:0,dash:false});
   const id=(await probe(page)).engineId;await session.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[a,b]});
   await session.send('Emulation.setDeviceMetricsOverride',{width:844,height:390,deviceScaleFactor:1,mobile:true,screenOrientation:{type:'landscapePrimary',angle:90}});
   await expect(page.locator('.story-app .overlay')).toBeVisible();await expect(page.locator('.dash')).not.toHaveClass(/held/);expect((await probe(page)).engineId).toBe(id);
   await session.send('Input.dispatchTouchEvent',{type:'touchCancel',touchPoints:[]});await start(page);await expect.poll(async()=>(await probe(page)).input).toMatchObject({x:0,y:0,dash:false});
  }finally{await session.send('Input.dispatchTouchEvent',{type:'touchCancel',touchPoints:[]}).catch(()=>{});await session.detach();}
 });
});

test('training settings preserve the same owner Story audio preferences',async({page,context})=>{
 const fixture=await snakeUiFixture();await fixture.install(context);await loginSnake(page,fixture.user('lab-settings'));await openFirstLevel(page);
 await page.locator('.story-app [data-action="settings"]').click();
 await page.locator('[data-setting="sound"]').check();
 const volume=page.locator('[data-setting="volume"]');await volume.focus();await page.keyboard.press('Home');
 for(let i=0;i<27;i++)await page.keyboard.press('ArrowRight');
 await expect(volume).toHaveValue('27');
 await page.locator('[data-action="close-settings"]').click();await page.locator('.story-app [data-action="journey"]').click();
 await page.locator('[data-action="lab"]').click();await page.locator('[data-action="settings"]').click();
 await page.locator('[data-setting="hand"]').selectOption('right');await page.locator('[data-action="close-settings"]').click();
 await page.getByRole('button',{name:'Về hành trình',exact:true}).click();
 await page.locator('.snake-journey [data-level="0"]').click();await page.locator('.journey-play').click();
 await page.locator('.story-app [data-action="settings"]').click();
 await expect(page.locator('[data-setting="sound"]')).toBeChecked();await expect(page.locator('[data-setting="volume"]')).toHaveValue('27');
 await expect(page.locator('[data-setting="hand"]')).toHaveValue('right');
});
