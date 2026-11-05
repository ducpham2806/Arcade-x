import {test,expect} from '@playwright/test';

test('launcher opens Tank Clash, training moves, platform pause holds play and exit cleans the game',async({page})=>{
 await page.route('**/*',route=>['127.0.0.1','localhost'].includes(new URL(route.request().url()).hostname)?route.continue():route.abort());
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('/');await page.locator('#game-library').waitFor();
 await page.locator('#btn-play-tank-clash').click();
 await expect(page.locator('.tc-dialog')).toContainText('Đọc góc bắn.');
 await page.locator('[data-action="training"]').click();
 const canvas=page.locator('.tc canvas');
 const before=await canvas.evaluate((c:HTMLCanvasElement)=>c.toDataURL());
 await page.keyboard.down('d');await page.waitForTimeout(350);await page.keyboard.up('d');
 expect(await canvas.evaluate((c:HTMLCanvasElement)=>c.toDataURL())).not.toBe(before);
 await page.locator('#btn-game-pause').click();
 await expect(page.locator('#btn-pause-resume')).toBeVisible();
 await page.waitForTimeout(100);
 const paused=await canvas.evaluate((c:HTMLCanvasElement)=>c.toDataURL());
 await page.keyboard.down('d');await page.waitForTimeout(250);await page.keyboard.up('d');
 expect(await canvas.evaluate((c:HTMLCanvasElement)=>c.toDataURL())).toBe(paused);
 await page.locator('#btn-game-exit').click();
 const confirm=page.locator('#btn-exit-confirm');if(await confirm.isVisible())await confirm.click();
 await expect(page.locator('#game-library')).toBeVisible();await expect(page.locator('.tc')).toHaveCount(0);
 await page.locator('#btn-play-tank-clash').click();
 await page.locator('[data-action="online"]').click();
 await expect(page.locator('#auth-entry-screen')).toBeVisible();
 expect(errors).toEqual([]);
});

test('ArcadeX adapter waits for Auth, binds token to configured WSS and releases the room on logout',async({page})=>{
 const {spawn}=await import('node:child_process');
 const {default:WS}=await import('../../server/tank-clash-room/node_modules/ws/index.js');
 const child=spawn(process.execPath,['--input-type=module','-e',`import{createTankRoomServer}from'./server/tank-clash-room/server.mjs';await createTankRoomServer({port:3295,authenticate:(token,name)=>token==='fixture-arcadex-token'?{userId:'fixture-account',name,guest:false}:null});`],{stdio:'ignore'});
 const base='http://127.0.0.1:3295',urls:string[]=[],tokens:string[]=[];
 try{
  await expect.poll(async()=>{try{return(await fetch(base+'/health')).ok;}catch{return false;}}).toBe(true);
  await page.route('**/src/services/supabaseClient.ts*',route=>route.fulfill({contentType:'text/javascript',body:`let listener;export const supabase={auth:{getSession:async()=>{await new Promise(r=>setTimeout(r,100));return {data:{session:{access_token:'fixture-arcadex-token',user:{id:'fixture-account',is_anonymous:false}}}}},onAuthStateChange:fn=>{listener=fn;const signout=()=>listener('SIGNED_OUT',null);addEventListener('fixture:signout',signout);return{data:{subscription:{unsubscribe:()=>removeEventListener('fixture:signout',signout)}}}}}};`}));
  await page.routeWebSocket('**/tank',socket=>{
   urls.push(socket.url());const upstream=new WS('ws://127.0.0.1:3295/tank');const waiting:(string|Buffer)[]=[];
   socket.onMessage(message=>{const msg=JSON.parse(String(message));if(msg.token)tokens.push(msg.token);if(upstream.readyState===WS.OPEN)upstream.send(message);else waiting.push(message);});
   upstream.on('open',()=>waiting.splice(0).forEach(m=>upstream.send(m)));upstream.on('message',m=>socket.send(String(m)));upstream.on('error',()=>{});
   socket.onClose(()=>upstream.close());upstream.on('close',()=>{void socket.close();});
  });
  await page.goto('/tests/tank-clash/launcher-fixture.html?server=wss://evil.invalid/tank');
  await page.locator('[data-action="online"]').click();await expect(page.locator('.tc-advanced')).toHaveCount(0);
  await page.getByRole('button',{name:'Tạo phòng mới · 1v1',exact:true}).click();await expect(page.locator('.tc-roomcode')).toBeVisible();
  expect(urls).toEqual(['wss://arcadex-tank-staging.onrender.com/tank']);expect(tokens).toContain('fixture-arcadex-token');
  await page.evaluate(()=>window.dispatchEvent(new Event('fixture:signout')));
  await expect.poll(async()=>(await(await fetch(base+'/health')).json()).rooms).toBe(0);
  expect(await page.evaluate(()=>sessionStorage.getItem('tank-clash.seat'))).toBeNull();
  await page.evaluate(()=>(window as any).unmountTankFixture());await expect(page.locator('.tc')).toHaveCount(0);
 }finally{child.kill();}
});
