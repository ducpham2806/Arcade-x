import {test,expect,type BrowserContext,type Page} from '@playwright/test';
import {PGlite} from '@electric-sql/pglite';
import {build} from 'esbuild';
import {createRequire} from 'node:module';
import {execFileSync,spawn,type ChildProcess} from 'node:child_process';
import {readFileSync,mkdtempSync} from 'node:fs';
import {tmpdir} from 'node:os';import {join} from 'node:path';
const PORT=3296,BASE=`http://127.0.0.1:${PORT}`,contexts:BrowserContext[]=[],errors:string[]=[];
let processServer:ChildProcess,db:PGlite,battleship:(request:Request)=>Promise<Response>,wordChain:any,originalFetch:typeof fetch;
const temp=mkdtempSync(join(tmpdir(),'chat-native-ui-'));
const user=(n:number)=>`00000000-0000-4000-8000-${String(n).padStart(12,'0')}`;
test.beforeAll(async()=>{
 execFileSync(process.execPath,['scripts/chat-staging-preview.mjs',join(temp,'review.html')],{stdio:'ignore'});
 db=new PGlite();await db.waitReady;await db.exec('create role anon;create role authenticated;create role service_role bypassrls;');
 for(const file of ['supabase/word-chain/schema.sql',...['schema','presence','matchmaking','rematch'].map(n=>`supabase/battleship/${n}.sql`)])await db.exec(readFileSync(file,'utf8'));
 await db.exec('set role service_role');
 for(const [name,entry]of [['word','supabase/functions/word-chain-room/index.ts'],['battle','supabase/functions/battleship-room/index.ts']])await build({entryPoints:[entry],bundle:true,platform:'node',format:'cjs',outfile:join(temp,name+'.cjs')});
 (globalThis as any).Deno={env:{get:(key:string)=>({SUPABASE_URL:'https://fixture.invalid',SUPABASE_SERVICE_ROLE_KEY:'fixture-service'})[key]},serve:(fn:any)=>{battleship=fn;}};
 originalFetch=globalThis.fetch;
 globalThis.fetch=async(input:any,init:any)=>{
  const url=String(input);
  if(url==='https://fixture.invalid/auth/v1/user'){
   try{const payload=JSON.parse(Buffer.from(init.headers.Authorization.split('.')[1],'base64url').toString());return new Response(JSON.stringify({id:payload.sub,is_anonymous:false,user_metadata:{display_name:payload.name}}),{status:payload.fixture==='chat-ui'?200:401});}catch{return new Response('{}',{status:401});}
  }
  if(url.startsWith('https://fixture.invalid/rest/v1/rpc/')){
   const name=url.split('/').at(-1)!;if(!/^(wc|bs)_room_[a-z_]+$/.test(name))throw Error('Unexpected RPC');
   const args=JSON.parse(init.body),keys=Object.keys(args);if(!keys.every(k=>/^p_[a-z_]+$/.test(k)))throw Error('Bad RPC args');
   try{const result=await db.query(`select public.${name}(${keys.map((k,i)=>`${k} => $${i+1}`).join(',')}) as doc`,keys.map(k=>typeof args[k]==='object'?JSON.stringify(args[k]):args[k]));return new Response(JSON.stringify(name.endsWith('_due')?result.rows.map((r:any)=>r.doc):(result.rows[0] as any)?.doc??null));}catch(e){return new Response(JSON.stringify({message:(e as Error).message}),{status:500});}
  }
  return originalFetch(input,init);
 };
 const require=createRequire(import.meta.url),deno=(globalThis as any).Deno;require(join(temp,'battle.cjs'));delete (globalThis as any).Deno;wordChain=require(join(temp,'word.cjs')).handle;(globalThis as any).Deno=deno;
 const source=`import{createTankRoomServer}from'./server/tank-clash-room/server.mjs';import{readFileSync,readdirSync}from'node:fs';import{join,extname}from'node:path';const assets=new Map();for(const dir of ['public/games/battleship','public/games/word-chain'])for(const r of readdirSync(dir,{recursive:true})){const f=join(dir,r),ext=extname(f),type={'.json':'application/json','.webp':'image/webp','.png':'image/png','.svg':'image/svg+xml'}[ext];if(type)assets.set('/'+f.slice(7),{bytes:readFileSync(f),type});}await createTankRoomServer({port:${PORT},allowedOrigins:['${BASE}'],allowMissingOrigin:false,allowLocalOrigins:false,review:{html:readFileSync(${JSON.stringify(join(temp,'review.html'))},'utf8'),supabaseUrl:'https://khqipuipeawzlkqmdzdg.supabase.co',publishableKey:'sb_publishable_fixture',assets},authenticate:(token,name)=>{try{const p=JSON.parse(Buffer.from(token.split('.')[1],'base64url'));return p.fixture==='chat-ui'?{userId:p.sub,name,guest:false}:null;}catch{return null;}}});`;
 processServer=spawn(process.execPath,['--input-type=module','-e',source],{stdio:'ignore'});
 await expect.poll(async()=>{try{return(await originalFetch(BASE+'/health')).ok;}catch{return false;}}).toBe(true);
});
test.afterEach(async()=>{await Promise.all(contexts.splice(0).map(c=>c.close()));expect(errors.splice(0)).toEqual([]);});
test.afterAll(async()=>{processServer?.kill();globalThis.fetch=originalFetch;delete (globalThis as any).Deno;await db?.close();});
async function login(browser:any,n:number,phone=false){
 const context=await browser.newContext({viewport:phone?{width:390,height:844}:{width:1366,height:900}});contexts.push(context);const page:Page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
 await page.route('https://khqipuipeawzlkqmdzdg.supabase.co/**',async route=>{
  const req=route.request(),url=new URL(req.url());
  if(url.pathname==='/auth/v1/token'){
   const exp=Math.floor(Date.now()/1000)+3600,payload={fixture:'chat-ui',sub:user(n),name:'Tester '+n,exp},token=`eyJhbGciOiJIUzI1NiJ9.${Buffer.from(JSON.stringify(payload)).toString('base64url')}.Zml4dHVyZQ`;
   return route.fulfill({contentType:'application/json',body:JSON.stringify({access_token:token,refresh_token:'fixture-refresh-'+n,expires_in:3600,expires_at:exp,token_type:'bearer',user:{id:user(n),email:`tester${n}@arcadex.test`,is_anonymous:false,app_metadata:{},user_metadata:{display_name:payload.name},aud:'authenticated',created_at:'2026-11-15T00:00:00Z'}})});
  }
  if(url.pathname==='/auth/v1/logout')return route.fulfill({status:204});
  const request=new Request(req.url(),{method:req.method(),headers:{...req.headers(),origin:BASE},body:req.postData()||undefined});
  const response=url.pathname.endsWith('/word-chain-room')?await wordChain(request,{url:'https://fixture.invalid',key:'fixture-service',origins:[BASE]}):await battleship(request);
  return route.fulfill({status:response.status,headers:Object.fromEntries(response.headers),body:await response.text()});
 });
 await page.goto(BASE+'/review');await page.getByLabel('Email',{exact:true}).fill(`tester${n}@arcadex.test`);await page.getByLabel('Mật khẩu',{exact:true}).fill('fixture-password');await page.getByRole('button',{name:'Đăng nhập',exact:true}).click();await expect(page.getByRole('heading',{name:'Kiểm chat trận'})).toBeVisible();
 expect(await page.evaluate(()=>JSON.stringify(localStorage))).not.toContain('access_token');return page;
}
async function openChat(page:Page){await page.getByRole('button',{name:/Mở chat.*Kéo/}).click();await expect(page.getByRole('region',{name:'Chat nổi'}).or(page.getByRole('dialog',{name:'Chat nổi'}))).toBeVisible();}
async function send(page:Page,text:string){await page.getByLabel('Nội dung tin nhắn').fill(text);await page.getByRole('button',{name:'Gửi ↗',exact:true}).click();await expect(page.locator('.social-message p').filter({hasText:text})).toHaveCount(1);}
async function closeChat(page:Page){await page.getByRole('button',{name:'Thu chat về bubble'}).click();}
async function exchange(a:Page,b:Page,title:string){
 await openChat(a);await expect(a.getByRole('button',{name:'Trận',exact:true})).toBeVisible();await send(a,`Chào ${title} A`);await closeChat(a);
 await b.bringToFront();await expect(b.locator('.chat-unread-dot')).toBeVisible({timeout:10000});await openChat(b);await expect(b.locator('.social-message p')).toHaveText([`Chào ${title} A`]);await send(b,`Chào ${title} B`);await closeChat(b);
 await a.bringToFront();await expect(a.locator('.chat-unread-dot')).toBeVisible({timeout:10000});await expect(a.locator('.chat-opponent-speech')).toContainText(`Chào ${title} B`,{timeout:5000});const collisions=await a.locator('.chat-opponent-speech').evaluate(el=>{const r=el.getBoundingClientRect();return [...document.querySelectorAll('.tc-field canvas,.tc-stick,.tc-shield,.tc-clock,.nt-stage,.nt-answer,.nt-timer,.bs-clock,.bs-combat')].filter(e=>{const b=e.getBoundingClientRect();return b.width>0&&b.height>0&&r.left<b.right&&r.right>b.left&&r.top<b.bottom&&r.bottom>b.top;}).map(e=>e.className);});expect(collisions).toEqual([]);await a.screenshot({path:`test-results/chat-native/${title}-speech.png`});await openChat(a);await expect(a.locator('.social-message')).toHaveCount(2);await a.getByLabel('Nội dung tin nhắn').fill('Nháp còn giữ');await closeChat(a);await openChat(a);await expect(a.getByLabel('Nội dung tin nhắn')).toHaveValue('Nháp còn giữ');await a.screenshot({path:`test-results/chat-native/${title}.png`});await closeChat(a);
}

test('Tank: two clients exchange private chat in a live match, UTC speech and room cleanup',async({browser})=>{
 test.setTimeout(90000);const a=await login(browser,1),b=await login(browser,2);
 for(const [i,p]of [a,b].entries()){await p.getByRole('button',{name:'Tank Clash',exact:true}).click();await p.locator('.tc-card-online').click();await p.locator('.tc-name').fill('Tester '+(i+1));}
 await a.getByRole('button',{name:'Tạo phòng mới · 1v1',exact:true}).click();const code=(await a.locator('.tc-roomcode').innerText()).replaceAll(' ','');await b.locator('.tc-code').fill(code);await b.getByRole('button',{name:'Vào phòng',exact:true}).click();
 for(const p of [a,b])await p.getByRole('button',{name:'Sẵn sàng',exact:true}).click();for(const p of [a,b])await expect(p.locator('.tc-online-dialog')).toBeHidden();
 await exchange(a,b,'Tank');await a.getByRole('button',{name:'Đổi game'}).click();await expect(a.getByRole('heading',{name:'Kiểm chat trận'})).toBeVisible();await expect(a.locator('.chat-unread-dot')).toHaveCount(0);
});

test('Nối Từ: room chat and word turn stay synchronized without stealing chat focus',async({browser})=>{
 test.setTimeout(90000);const a=await login(browser,3),b=await login(browser,4);
 for(const p of [a,b])await p.getByRole('button',{name:'Nối Từ',exact:true}).click();
 await a.getByTestId('nt-create').click();await a.getByRole('button',{name:'2 người',exact:true}).click();await a.getByTestId('nt-create-room').click();await expect(a.getByTestId('nt-room-code')).toBeVisible({timeout:10000});const code=await a.getByTestId('nt-room-code').innerText();await b.getByTestId('nt-join').click();await b.locator('.nt-code-input input').fill(code);await b.getByTestId('nt-join-room').click();
 for(const p of [a,b]){await expect(p.locator('.nt-ready')).toBeVisible();await p.getByTestId('nt-ready').click();}
 await expect(a.locator('.nt-match')).toHaveAttribute('data-phase','turn',{timeout:10000});await exchange(a,b,'NoiTu');
 await openChat(a);await a.getByLabel('Nội dung tin nhắn').fill('Giữ focus');await a.waitForTimeout(3300);await expect(a.getByLabel('Nội dung tin nhắn')).toBeFocused();await closeChat(a);
});

test('Hải Chiến: phone chat never stops the authoritative timer or exposes enemy hulls',async({browser})=>{
 test.setTimeout(90000);const a=await login(browser,5,true),b=await login(browser,6,true);
 for(const p of [a,b])await p.getByRole('button',{name:'Hải Chiến',exact:true}).click();await a.getByRole('button',{name:'TẠO PHÒNG',exact:true}).click();await expect(a.getByTestId('room-code')).toBeVisible({timeout:10000});const code=await a.getByTestId('room-code').innerText();await b.getByLabel('Mã phòng',{exact:true}).fill(code);await b.getByRole('button',{name:'VÀO PHÒNG',exact:true}).click();
 await expect(a.getByTestId('online-ready')).toBeVisible();await a.getByRole('button',{name:'Tự đặt phần thiếu',exact:true}).click();await expect(a.locator('.bs-panel h2')).toContainText('5/5');await a.getByTestId('online-ready').click();await expect(a.getByTestId('online-ready')).toContainText('HỦY SẴN SÀNG');
 const version=await a.getByTestId('battleship-online').getAttribute('data-room-version');await expect(b.getByTestId('battleship-online')).toHaveAttribute('data-room-version',version!);await b.getByRole('button',{name:'Tự đặt phần thiếu',exact:true}).click();await expect(b.locator('.bs-panel h2')).toContainText('5/5');await b.getByTestId('online-ready').click();
 await expect(a.locator('.bs-turnbar')).not.toContainText('CHUẨN BỊ');for(const p of [a,b])await p.locator('.bs-header').scrollIntoViewIfNeeded();await exchange(a,b,'HaiChien');
 await openChat(a);const before=await a.locator('.bs-clock').innerText();await expect.poll(()=>a.locator('.bs-clock').innerText(),{timeout:6000}).not.toBe(before);const box=await a.getByRole('dialog',{name:'Chat nổi'}).boundingBox();expect(box!.width).toBeLessThanOrEqual(390);await closeChat(a);await expect(a.locator('.bs-chat-hud [data-chat-player]')).toHaveCount(2);
});
