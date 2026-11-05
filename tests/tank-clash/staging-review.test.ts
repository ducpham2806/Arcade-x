import { test, expect, type Browser, type BrowserContext } from '@playwright/test';
import { execFileSync, spawn, type ChildProcess } from 'node:child_process';
const PORT=3294, BASE=`http://127.0.0.1:${PORT}`;
let server:ChildProcess;const contexts:BrowserContext[]=[],errors:string[]=[];
test.beforeAll(async()=>{
  execFileSync(process.execPath,['scripts/export-tank-staging-review.mjs'],{stdio:'ignore'});
  const source=`import{createTankRoomServer}from'./server/tank-clash-room/server.mjs';import{readFileSync}from'node:fs';await createTankRoomServer({port:${PORT},review:{html:readFileSync('deliverables/tank-clash-staging-review.html','utf8'),supabaseUrl:'https://khqipuipeawzlkqmdzdg.supabase.co',publishableKey:'sb_publishable_fixture'},authenticate:(token,name)=>{try{const p=JSON.parse(Buffer.from(token.split('.')[1],'base64url'));return p.fixture==='tc2'?{userId:p.sub,name,guest:false}:null;}catch{return null;}}});`;
  server=spawn(process.execPath,['--input-type=module','-e',source],{stdio:'ignore'});
  await expect.poll(async()=>{try{return(await fetch(BASE+'/health')).ok;}catch{return false;}}).toBe(true);
});
test.afterAll(()=>server?.kill());
test.afterEach(async()=>{await Promise.all(contexts.splice(0).map(c=>c.close()));expect(errors.splice(0)).toEqual([]);});
async function open(browser:Browser,n:number,viewport={width:1280,height:760}){
  const context=await browser.newContext({viewport});contexts.push(context);const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
  await page.route('https://*.supabase.co/**',async route=>{
    const request=route.request();
    if(new URL(request.url()).pathname==='/auth/v1/token'){
      const body=request.postDataJSON();
      if(body.password==='wrong')return route.fulfill({status:400,contentType:'application/json',body:JSON.stringify({error_code:'invalid_credentials',msg:'Invalid login credentials'})});
      const account=Number(body.email.match(/tester(\d+)/)?.[1]||n),id=`00000000-0000-4000-8000-${String(account).padStart(12,'0')}`,exp=Math.floor(Date.now()/1000)+3600;
      const token=`eyJhbGciOiJIUzI1NiJ9.${Buffer.from(JSON.stringify({sub:id,exp,role:'authenticated',fixture:'tc2'})).toString('base64url')}.Zml4dHVyZQ`;
      return route.fulfill({contentType:'application/json',body:JSON.stringify({access_token:token,refresh_token:`fixture-refresh-${n}`,expires_in:3600,expires_at:exp,token_type:'bearer',user:{id,email:body.email,is_anonymous:false,app_metadata:{},user_metadata:{},aud:'authenticated',created_at:'2026-11-05T00:00:00Z'}})});
    }
    if(new URL(request.url()).pathname==='/auth/v1/logout')return route.fulfill({status:204});
    throw Error(`Unexpected backend request: ${new URL(request.url()).pathname}`);
  });
  await page.goto(BASE+'/review');await expect(page.getByRole('button',{name:'Đăng nhập',exact:true})).toBeEnabled();return page;
}
async function signIn(page:Awaited<ReturnType<typeof open>>,n:number){await page.getByLabel('Email',{exact:true}).fill(`tester${n}@arcadex.test`);await page.getByLabel('Mật khẩu',{exact:true}).fill('fixture-good-password');await page.getByRole('button',{name:'Đăng nhập',exact:true}).click();await expect(page.locator('.tc-stage-session')).toBeVisible();}

test('staging login handles failure, keeps credentials out of storage, and signs out cleanly',async({browser})=>{
  const page=await open(browser,1,{width:390,height:844});await page.getByLabel('Email',{exact:true}).fill('tester1@arcadex.test');await page.getByLabel('Mật khẩu',{exact:true}).fill('wrong');await page.getByRole('button',{name:'Đăng nhập',exact:true}).click();
  await expect(page.getByRole('status')).toContainText('Chưa đăng nhập được');await expect(page.getByLabel('Mật khẩu',{exact:true})).toHaveValue('');await signIn(page,1);
  expect(await page.evaluate(()=>JSON.stringify(localStorage))).not.toContain('access_token');expect(await page.evaluate(()=>JSON.stringify(localStorage))).not.toContain('fixture-refresh');
  await page.screenshot({path:'test-results/tank-staging/mobile-menu.png'});await page.locator('.tc-card-online').click();await page.getByRole('button',{name:'Tạo phòng mới · 1v1',exact:true}).click();await expect(page.locator('.tc-roomcode')).toBeVisible();
  await page.getByRole('button',{name:'Đăng xuất',exact:true}).click();await expect(page.locator('.tc-stage-login')).toBeVisible();await expect(page.locator('.tc')).toHaveCount(0);
  await expect.poll(async()=>(await(await fetch(BASE+'/health')).json()).rooms).toBe(0);
  expect(await page.evaluate(()=>sessionStorage.getItem('tank-clash.seat'))).toBeNull();
  await signIn(page,2);await page.locator('.tc-card-online').click();await page.getByRole('button',{name:'Tạo phòng mới · 1v1',exact:true}).click();await expect(page.locator('.tc-roomcode')).toBeVisible();await page.getByRole('button',{name:'Đăng xuất',exact:true}).click();
  await page.setViewportSize({width:844,height:390});await page.getByRole('button',{name:'Đăng nhập',exact:true}).scrollIntoViewIfNeeded();await expect(page.getByRole('button',{name:'Đăng nhập',exact:true})).toBeInViewport();
});

test('four separate staging logins reach one authenticated 2v2 room over real sockets',async({browser})=>{
  test.setTimeout(60_000);const pages=await Promise.all([1,2,3,4].map(n=>open(browser,n)));await pages[0].goto(BASE+'/review?server=ws://127.0.0.1:1/tank');await Promise.all(pages.map((p,i)=>signIn(p,i+1)));
  for(const [i,p]of pages.entries()){await p.locator('.tc-card-online').click();await p.locator('.tc-name').fill(`Tester ${i+1}`);}
  await pages[0].getByRole('button',{name:'Tạo phòng 2v2',exact:true}).click();const code=(await pages[0].locator('.tc-roomcode').innerText()).replace(' ','');
  for(const p of pages.slice(1)){await p.locator('.tc-code').fill(code);await p.getByRole('button',{name:'Vào phòng',exact:true}).click();}
  for(const p of pages){await expect(p.locator('.tc-seats')).toContainText('Tester 4');await p.getByRole('button',{name:'Sẵn sàng',exact:true}).click();}
  for(const p of pages){await expect(p.locator('.tc-online-dialog')).toBeHidden();await expect(p.locator('.tc-mode')).toHaveText('ONLINE 2v2 · HIỆP 1');await expect(p.locator('.tc-tank-hp')).toHaveCount(4);}
  await pages[0].screenshot({path:'test-results/tank-staging/desktop-2v2.png'});
});
