const {chromium}=require('playwright');
const {spawn}=require('node:child_process');
const fs=require('node:fs');
const assert=require('node:assert/strict');
const {gzipSync}=require('node:zlib');
const checkPreviewMedia=require('./preview-media.cjs');
const PORT=4342,origin=`http://127.0.0.1:${PORT}`;
const evidence='test-results/snake-baseline';
(async()=>{
 const server=spawn(process.execPath,['node_modules/vite/bin/vite.js','preview','--port',String(PORT),'--strictPort'],{stdio:'pipe'});
 let browser;const report={checks:[],views:[]};fs.mkdirSync(evidence,{recursive:true});
 try{
  for(let n=0;n<100;n++){try{if((await fetch(origin)).ok)break;}catch{}await new Promise(resolve=>setTimeout(resolve,100));}
  const {readSnakePreviewProfile}=await import('../../scripts/snake-preview-baseline.mjs');const profile=readSnakePreviewProfile();
  browser=await chromium.launch({executablePath:process.env.CHROMIUM_EXECUTABLE||(fs.existsSync('/usr/bin/chromium')?'/usr/bin/chromium':undefined),args:['--no-sandbox','--no-proxy-server','--host-resolver-rules=MAP * ~NOTFOUND, EXCLUDE localhost, EXCLUDE 127.0.0.1']});
  async function pageFor(viewport){
   const context=await browser.newContext({viewport});
   // Prevent production Auth/data writes; this is a guest-route baseline, not a live save test.
   await context.route('**/*',route=>new URL(route.request().url()).origin===origin?route.continue():route.abort());
   return {context,page:await context.newPage()};
  }
  for(const viewport of [{width:320,height:740},{width:390,height:844},{width:844,height:390},{width:1440,height:900}]){
   const {context,page}=await pageFor(viewport);const errors=[],badResources=[],scripts=[],pending=[];
   page.on('pageerror',error=>errors.push(error.message));
   page.on('response',response=>{
    if(!response.url().startsWith(origin))return;
    if(response.status()>=400)badResources.push({url:response.url(),status:response.status()});
    if(response.request().resourceType()==='script')pending.push(response.body().then(bytes=>scripts.push({file:new URL(response.url()).pathname,raw:bytes.length,gzipEstimate:gzipSync(bytes).length})).catch(()=>{}));
   });
   await page.goto(origin+'/preview/snake/',{waitUntil:'networkidle'});await page.locator('#snake-preview-title').waitFor();
   await page.locator('.snake-preview-banner').evaluate(image=>image.decode());
   await page.locator('.snake-preview-cover img').evaluate(image=>image.decode());
   assert.equal(await page.locator('h1').innerText(),'Rắn Săn Mồi');
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,'horizontal overflow');
   const button=page.getByRole('button',{name:'Đăng nhập để chơi thử'});const box=await button.boundingBox();
   assert.ok(box&&box.x>=0&&box.x+box.width<=viewport.width+1,'CTA must fit viewport');
   assert.equal(await button.locator('svg').count(),1,'CTA direction icon must not depend on a font glyph');
   // A defined observation window includes idle imports, not just static manifest edges.
   await page.waitForTimeout(2000);
   await Promise.all(pending);
   assert.ok(scripts.length>0);assert.ok(!scripts.some(value=>value.file.endsWith(profile.game.file.split('/').at(-1))),'guest must not load Snake engine');
   assert.ok(!scripts.some(value=>value.file.includes('GameWrapper-')),'guest must not load wrapper');
   assert.equal(await page.evaluate(async()=>(await navigator.serviceWorker.getRegistrations()).length),0,'preview must not install a second worker');
   report.views.push({viewport,stage:'guest landing: networkidle + decoded art + 2s observation',scripts:scripts.map(value=>({...value})),scriptRaw:scripts.reduce((sum,value)=>sum+value.raw,0),gzipEstimate:scripts.reduce((sum,value)=>sum+value.gzipEstimate,0)});
   assert(report.views.at(-1).gzipEstimate<=400*1024,'Guest landing exceeds the 400 KiB JS budget');
   await page.screenshot({path:`${evidence}/landing-${viewport.width}x${viewport.height}.png`,fullPage:true});
   await page.reload({waitUntil:'networkidle'});await page.locator('#snake-preview-title').waitFor();
   await button.click();await page.locator('input[type=password]').waitFor();
   await page.screenshot({path:`${evidence}/login-${viewport.width}x${viewport.height}.png`});
   await Promise.all(pending);
   assert.ok(!scripts.some(value=>value.file.endsWith(profile.game.file.split('/').at(-1))||value.file.includes('GameWrapper-')),'login prompt must keep gameplay deferred');
   assert.deepEqual(errors,[]);assert.deepEqual(badResources,[]);
   report.checks.push(`guest landing/reload/login/layout ${viewport.width}x${viewport.height}`);await context.close();
  }
  const {context,page}=await pageFor({width:1280,height:860});
  await page.goto(origin+'/',{waitUntil:'networkidle'});await page.locator('#game-library').waitFor();
  await page.waitForFunction(async()=>!!(await navigator.serviceWorker.ready).active,null,{timeout:30000});
  await page.reload({waitUntil:'networkidle'});await page.waitForFunction(()=>!!navigator.serviceWorker.controller);
  await page.goto(origin+'/preview/snake/',{waitUntil:'networkidle'});await page.locator('#snake-preview-title').waitFor();
  assert.equal(await page.locator('#game-library').count(),0,'root worker must not rewrite preview to launcher');
  const workers=await page.evaluate(async()=>(await navigator.serviceWorker.getRegistrations()).map(value=>value.active?.scriptURL));
  assert.equal(workers.length,1);assert.equal(new URL(workers[0]).pathname,'/sw.js');
  report.checks.push('root service worker preserves deep preview route without a duplicate registration');
  await context.close();
  report.media=await checkPreviewMedia(browser,origin,evidence);
  report.checks.push('built registered preview stages media, renders during delay, retries one WAV and aborts on exit');
  report.status='PASS';console.log(JSON.stringify({status:report.status,checks:report.checks,initialJs:report.views.map(({viewport,scriptRaw,gzipEstimate})=>({viewport,scriptRaw,gzipEstimate}))}));
 }finally{
  await browser?.close();server.kill();fs.writeFileSync(`${evidence}/runtime-profile.json`,JSON.stringify(report,null,2)+'\n');
 }
})().catch(error=>{console.error(error);process.exitCode=1;});
