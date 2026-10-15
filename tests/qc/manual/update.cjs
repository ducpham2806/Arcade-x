// Real Chromium service-worker upgrade on a disposable local HTTP origin.
const { chromium, expect } = require('@playwright/test');
const fs = require('node:fs'), path = require('node:path'), http = require('node:http'), crypto = require('node:crypto');
const root = path.resolve('dist');
const artifacts = process.env.QC_ARTIFACTS || path.resolve('test-results/update');fs.mkdirSync(artifacts,{recursive:true});
let release = 1, failWorker = false;
const index = r => fs.readFileSync(path.join(root,'index.html'),'utf8').replace(/<link[^>]+https:\/\/fonts[^>]+>/g, '').replace('</head>',`<meta name="qc-release" content="${r}"></head>`);
const worker = r => fs.readFileSync(path.join(root,'sw.js'),'utf8').replace(/(url:"index.html",revision:")[^"]+/, '$1'+crypto.createHash('md5').update(index(r)).digest('hex'));
const types={'.html':'text/html','.js':'application/javascript','.css':'text/css','.png':'image/png','.svg':'image/svg+xml','.webmanifest':'application/manifest+json'};
const server=http.createServer((req,res)=>{
  const url=new URL(req.url,'http://127.0.0.1');const file=url.pathname==='/'?'index.html':url.pathname.slice(1);
  if (file.includes('..')) {res.writeHead(400).end();return;}
  if (file==='sw.js' && failWorker) {res.writeHead(503).end('temporarily unavailable');return;}
  res.setHeader('Content-Type',types[path.extname(file)]||'application/octet-stream');res.setHeader('Cache-Control','no-store');
  try {res.end(file==='index.html'?index(release):file==='sw.js'?worker(release):fs.readFileSync(path.join(root,file)));}catch{res.writeHead(404).end();}
});
(async()=>{
  await new Promise(r=>server.listen(0,'127.0.0.1',r));const origin=`http://127.0.0.1:${server.address().port}`;
  const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});const ctx=await browser.newContext();
  await ctx.route('**/*',r=>new URL(r.request().url()).origin===origin?r.continue():r.abort());
  const page=await ctx.newPage();page.on('console',m=>console.log('BROWSER',m.type(),m.text()));page.on('framenavigated',f=>{if(f===page.mainFrame())console.log('NAV',f.url());});page.on('requestfailed',r=>console.log('FAILED',r.url(),r.failure()?.errorText));page.on('dialog',async d=>{console.log('DIALOG',d.message());await d.accept();});const errors=[];page.on('pageerror',e=>errors.push(e.message));page.setDefaultTimeout(30000);
  try {
    await page.goto(origin);await expect(page.locator('#game-library')).toBeVisible();await page.evaluate(()=>navigator.serviceWorker.ready);
    await page.reload();await expect(page.locator('#game-library')).toBeVisible();await expect.poll(()=>page.evaluate(()=>!!navigator.serviceWorker.controller)).toBe(true);
    await page.locator('#btn-play-tile-2048').click();await page.locator('#btn-pregame-start').click();await expect(page.locator('#tile-2048-board')).toBeVisible();
    release=2;
    await page.evaluate(async()=>{const reg=await navigator.serviceWorker.getRegistration();await reg.update();});
    await expect.poll(()=>page.evaluate(()=>!!window.__arcadex_sw_update_pending),{timeout:20000}).toBe(true);
    await page.waitForTimeout(600);await expect(page.locator('#force-update-modal-overlay')).toHaveCount(0);
    expect(await page.locator('meta[name="qc-release"]').getAttribute('content')).toBe('1');
    await page.screenshot({path:path.join(artifacts,'update-deferred-in-game.png')});
    await page.locator('#btn-game-pause').click();await page.locator('#btn-pause-save-exit').click();await expect(page.locator('#force-update-modal-overlay')).toBeVisible();
    await page.screenshot({path:path.join(artifacts,'update-ready.png')});
    await page.locator('#btn-force-update-action').click();await expect(page.locator('#game-library')).toBeVisible({timeout:25000});
    await expect(page.locator('meta[name="qc-release"]')).toHaveAttribute('content','2');
    await expect(page.locator('#game-library')).toBeVisible();await expect(page.locator('#paused-game-banner')).toBeVisible();
    // Re-open while an update is waiting: splash auto-installs before the entry screen.
    release=3;await page.evaluate(async()=>{const reg=await navigator.serviceWorker.getRegistration();await reg.update();});await expect.poll(()=>page.evaluate(()=>!!window.__arcadex_sw_update_pending)).toBe(true);
    await page.reload();await expect(page.locator('#game-library')).toBeVisible({timeout:25000});await expect(page.locator('meta[name="qc-release"]')).toHaveAttribute('content','3');
    // Update failure must automatically continue to entry without blocking play.
    failWorker=true;await page.reload();await expect(page.locator('#game-library')).toBeVisible({timeout:10000});await expect(page.locator('#game-library')).toBeVisible();
    expect(await page.locator('meta[name="qc-release"]').getAttribute('content')).toBe('3');
    failWorker=false;await ctx.setOffline(true);await page.reload();await expect(page.locator('#game-library')).toBeVisible();await expect(page.locator('#paused-game-banner')).toBeVisible();
    await page.locator('#btn-resume-paused-game').click();await expect(page.locator('#tile-2048-board')).toBeVisible();
    const result={realWorkerUpgrade:true,inGameDeferred:true,manualActivation:true,startupAutoUpdate:true,updateFailureRecovery:true,offlineResume:true,errors};
    fs.writeFileSync(path.join(artifacts,'update.json'),JSON.stringify(result,null,2));console.log(JSON.stringify(result));expect(errors).toEqual([]);
  } catch (error) {console.error('UPDATE DEBUG', await page.evaluate(async()=>{const r=await navigator.serviceWorker.getRegistration();return {url:location.href,waiting:r?.waiting?.state,active:r?.active?.state,installing:r?.installing?.state,controller:navigator.serviceWorker.controller?.state,pending:window.__arcadex_sw_update_pending,text:document.querySelector('#force-update-modal-overlay')?.textContent};}));throw error;} finally {await browser.close();server.close();}
})().catch(e=>{console.error(e);server.close();process.exitCode=1;});
