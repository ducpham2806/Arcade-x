const {chromium} = require('playwright');
const {spawn} = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const {setOffline} = require('../helpers/network-state.cjs');
const origin = 'http://127.0.0.1:4325';
(async () => {
  const server = spawn(process.execPath, ['node_modules/vite/bin/vite.js','preview','--port','4325','--strictPort'], {stdio:'pipe'});
  let browser;
  try {
    for (let n=0;n<80;n++) { try { if ((await fetch(origin)).ok) break; } catch {} await new Promise(resolve=>setTimeout(resolve,100)); }
    assert.equal(fs.existsSync('dist/tests/ads'),false,'local fake harness must not ship');
    const {sitePages} = await import('../../scripts/site-pages.mjs');
    for (const [route] of sitePages()) {
      const response = await fetch(origin+route);
      assert.equal(response.status,200,route);
      const html = await response.text(); assert.match(html,/<main><h1>/); assert.doesNotMatch(html,/<script/);
      assert.equal(html,fs.readFileSync(path.join('dist',route,'index.html'),'utf8'));
    }
    assert.match(fs.readFileSync('dist/_redirects','utf8'), /\/huong-dan\/\* \/404.html 404/);
    assert.match(fs.readFileSync('dist/404.html','utf8'), /noindex/);
    console.log('PASS 10 built public pages return static HTML; Netlify content 404 rules emitted (CDN not exercised)');
    browser = await chromium.launch({executablePath:process.env.CHROMIUM_EXECUTABLE||(fs.existsSync('/usr/bin/chromium')?'/usr/bin/chromium':undefined),args:['--no-sandbox']});
    const context = await browser.newContext({viewport:{width:390,height:844}});
    await context.route('**/*', route => new URL(route.request().url()).origin === origin ? route.continue() : route.abort());
    const page = await context.newPage(); const google=[]; const errors=[];
    page.on('request', req => {if (/googlesyndication|doubleclick|googleadservices/.test(req.url())) google.push(req.url());});
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(origin+'/?ads-preview=1');
    await page.locator('#heading-game-library').waitFor();
    assert.equal(await page.locator('[data-ad-preview]').count(),0);
    await page.waitForFunction(async () => {
      await navigator.serviceWorker.ready;
      for (const key of await caches.keys()) {
        if (!key.includes('precache')) continue;
        if (await (await caches.open(key)).match('/huong-dan/word-cross/index.html')) return true;
      }
      return false;
    },null,{timeout:30000});
    await page.reload(); await page.waitForFunction(() => !!navigator.serviceWorker.controller);
    await setOffline(context,page,true);
    for (const route of ['/huong-dan/word-cross/','/thong-tin/quyen-rieng-tu/']) {
      await page.goto(origin+route);
      assert.equal(await page.locator('h1').count(),1);
      assert.equal(await page.locator('#root,script').count(),0,'must serve the content page, not SPA fallback');
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    }
    console.log('PASS service worker serves guide and privacy offline without launcher fallback');
    await setOffline(context,page,false);
    for (const width of [390,1440]) {
      await page.setViewportSize({width,height:900}); await page.goto(origin+'/huong-dan/word-cross/');
      fs.mkdirSync('test-results/ads',{recursive:true});
      await page.screenshot({path:`test-results/ads/guide-${width}.png`,fullPage:true});
    }
    assert.deepEqual(google,[]); assert.deepEqual(errors,[]);
    console.log('PASS production query cannot enable previews; zero Google ads requests or page errors');
  } finally { await browser?.close(); server.kill(); }
})().catch(error => {console.error(error);process.exitCode=1;});
