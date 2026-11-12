/** Opt-in existing disposable fixture only. No signup/grant/admin/SQL/flag changes. */
import {chromium,expect,type Browser,type BrowserContext} from '@playwright/test';
import {createClient} from '@supabase/supabase-js';
import {createServer,type ViteDevServer} from 'vite';
import {existsSync,readFileSync} from 'node:fs';
import {loginSnake,observeEngine,openFirstLevel,openSnakeJourney,winFirstLevel,platformWallet} from './ui-driver';

export async function run({live,waitForExpiry}:{live:boolean;waitForExpiry:boolean}){
 const report=(stage:string,extra:Record<string,unknown>={})=>console.log(JSON.stringify({stage,...extra}));
 const email=process.env.SNAKE_LIVE_EMAIL,password=process.env.SNAKE_LIVE_PASSWORD,owner=process.env.SNAKE_LIVE_ACTOR_ID;
 const missing=['SNAKE_LIVE_EMAIL','SNAKE_LIVE_PASSWORD','SNAKE_LIVE_ACTOR_ID','SNAKE_LIVE_GRANT_CONFIRMED'].filter(key=>!process.env[key]);
 if(missing.length){report('WAITING_BINDINGS',{missing});process.exitCode=2;return;}
 if(!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(owner!)||process.env.SNAKE_LIVE_GRANT_CONFIRMED!=='1')throw Error('Invalid fixture binding');
 // Vite overrides would invalidate the owner/backend binding validated below.
 if(['VITE_SUPABASE_URL','VITE_SUPABASE_PUBLISHABLE_KEY','VITE_SUPABASE_ANON_KEY'].some(key=>process.env[key]))throw Error('Backend overrides not supported');
 const config=JSON.parse(readFileSync('src/config/public-backend.json','utf8'));
 const fetcher:typeof fetch=(input,init)=>fetch(input,{...init,signal:init?.signal??AbortSignal.timeout(15000)});
 report('NETWORK_PREFLIGHT');
 let settings:Response;try{settings=await fetcher(config.url+'/auth/v1/settings',{headers:{apikey:config.publishableKey}});}catch{report('WAITING_NETWORK');process.exitCode=2;return;}
 if(!settings.ok){report('WAITING_NETWORK',{httpStatus:settings.status});process.exitCode=2;return;}
 if(!live){report('PREFLIGHT_PASSED',{authenticated:false,grantVerified:false});return;}
 const client=createClient(config.url,config.publishableKey,{global:{fetch:fetcher},auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false}});
 let browser:Browser|undefined,server:ViteDevServer|undefined;const contexts:BrowserContext[]=[];
 try{
  report('VERIFY_EXISTING_FIXTURE');
  const signed=await client.auth.signInWithPassword({email:email!,password:password!});
  if(signed.error||signed.data.user?.id!==owner||signed.data.user.is_anonymous)throw Error('Fixture identity mismatch');
  const stateResponse=await fetcher(config.url+'/functions/v1/snake-complete',{method:'POST',headers:{apikey:config.publishableKey,authorization:'Bearer '+signed.data.session!.access_token,'content-type':'application/json'},body:JSON.stringify({action:'state',actorId:owner})});
  if(!stateResponse.ok)throw Error('Existing grant unavailable');const baseline=await stateResponse.json();
  if(baseline.revision!==0||Object.keys(baseline.levels||{}).length||baseline.wallet?.snake_gold!==0||baseline.wallet?.snake_gem!==0)throw Error('Requires empty disposable fixture');
  await client.auth.signOut({scope:'local'});
  server=await createServer({envFile:false,server:{host:'127.0.0.1',port:3002,strictPort:true},logLevel:'silent'});await server.listen();
  browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_EXECUTABLE||(existsSync('/usr/bin/chromium')?'/usr/bin/chromium':undefined),args:['--no-sandbox']});
  const context=await browser.newContext({baseURL:'http://127.0.0.1:3002',serviceWorkers:'block'});contexts.push(context);
  const page=await context.newPage();page.setDefaultTimeout(35000);const user={email:email!,password:password!,name:'Snake QA'};
  // Standalone contexts: no trace, video, HAR, reporter or login screenshots.
  report('UI_LOGIN');await loginSnake(page,user);await observeEngine(page);await openFirstLevel(page);
  if(waitForExpiry){
   const expiry=()=>page.evaluate(()=>{const key=Object.keys(localStorage).find(key=>/^sb-.*-auth-token$/.test(key));return key?Number(JSON.parse(localStorage.getItem(key)!).expires_at):0;});
   const original=await expiry();if(original*1000<=Date.now()||original*1000-Date.now()>600000)throw Error('Issuer expiry outside ten-minute budget');
   report('WAITING_REAL_ISSUER_EXPIRY',{expiresAt:original});
   while(Date.now()<=original*1000+1000)await page.waitForTimeout(1000);
   await page.getByRole('button',{name:'Tải lại tiến trình'}).click();await expect.poll(expiry,{timeout:30000}).toBeGreaterThan(original);
   report('REAL_ISSUER_EXPIRY_REFRESH_PASSED');
  }
  report('UI_PLAY_WIN_SAVE');const wallet=await platformWallet(page);await winFirstLevel(page);
  await expect(page.locator('.cloud-message')).toContainText('Đã lưu kết quả trực tuyến',{timeout:35000});
  await expect(page.locator('[role="status"]').filter({hasText:'Bản 1'})).toBeVisible();expect(await platformWallet(page)).toEqual(wallet);
  await page.reload();await openSnakeJourney(page);await page.locator('[data-level="0"]').click();await expect(page.locator('.journey-best')).toContainText('Thành tích tốt nhất');
  await context.close();
  const fresh=await browser.newContext({baseURL:'http://127.0.0.1:3002',serviceWorkers:'block'});contexts.push(fresh);
  const device=await fresh.newPage();device.setDefaultTimeout(35000);await loginSnake(device,user);await openSnakeJourney(device);await device.locator('[data-level="0"]').click();
  await expect(device.locator('.journey-best')).toContainText('Thành tích tốt nhất');
  await expect(device.locator('[role="status"]').filter({hasText:'Snake Gold 0'})).toBeVisible();
  await device.goto('/preview/snake/');await device.getByRole('button',{name:'Đổi tài khoản'}).click();
  report('LIVE_UI_PASSED',{issuerExpiry:waitForExpiry?'passed':'not_tested',faultsAndConcurrency:'local_fixture_only',cleanup:'operator_required'});
 }finally{
  // Revoke only sessions created here; never log raw errors or delete fixture data.
  for(const context of contexts){for(const page of context.pages()){
   let timer:ReturnType<typeof setTimeout>|undefined;
   try{await Promise.race([page.evaluate(async()=>{const path='/src/services/supabaseClient.ts';const {supabase}=await import(path);await supabase?.auth.signOut({scope:'local'});}),new Promise((_,reject)=>{timer=setTimeout(()=>reject(Error('Cleanup timeout')),10000);})]);}catch{}finally{clearTimeout(timer);}
  }await context.close().catch(()=>{});}
  await browser?.close();await server?.close();await client.auth.signOut({scope:'local'}).catch(()=>{});
  report('CLEANUP_REQUIRED',{target:'only the prebound disposable actor; operator runbook'});
 }
}
