// Build-level regression: every registered game retains its authored motion under launcher CSS,
// including after other games' lazy styles load. OS reduced motion still applies to launcher
// decoration; games own their accessibility policy. Canvas/iframe loops get separate paint checks.
const { chromium } = require('playwright');
const { spawn } = require('node:child_process');
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const ids = Object.keys(JSON.parse(fs.readFileSync('src/games/packageAssets.json'))).sort();
const only = process.argv.find(v=>v.startsWith('--only='))?.slice(7).split(',');
const modes = process.argv.includes('--reduce-only') ? ['reduce'] : ['no-preference', 'reduce'];
const PORT = 4330, report = [], failures = [];
function instrument() {
  window.__motionPaint = 0;
  for (const name of ['clearRect','drawImage','fillRect']) {
    const original = CanvasRenderingContext2D.prototype[name];
    CanvasRenderingContext2D.prototype[name] = function(...args) { window.__motionPaint++; return original.apply(this,args); };
  }
}
async function probe(page, selector) {
  return page.evaluate(async selector => {
    const host = document.querySelector(selector); if (!host) throw Error('motion host missing: '+selector);
    const style = document.createElement('style');
    style.textContent='@keyframes ax-motion-regression{from{transform:translateX(0px);opacity:.4}to{transform:translateX(40px);opacity:1}}.ax-motion-regression{position:absolute;pointer-events:none;width:2px;height:2px;animation:ax-motion-regression 2s linear infinite}.ax-motion-regression::before{content:"";display:block;animation:ax-motion-regression 2s linear infinite}';
    const el = document.createElement('i'); el.className='ax-motion-regression'; host.append(style,el);
    const a = el.getAnimations()[0]; if (a) await a.ready;
    const before = a?.currentTime;
    const start = getComputedStyle(el).transform;
    await new Promise(r=>setTimeout(r,180));
    const result={duration:getComputedStyle(el).animationDuration,iterations:getComputedStyle(el).animationIterationCount,pseudoDuration:getComputedStyle(el,'::before').animationDuration,advanced:!!a&&Number(a.currentTime)>Number(before)+40,changed:getComputedStyle(el).transform!==start};
    el.remove(); style.remove(); return result;
  }, selector);
}
async function authoredAnimations(page) {
  return page.evaluate(async () => {
    const root=document.querySelector('#game-viewport-stage');
    const elements=[...root.querySelectorAll('*')].filter(el=>el.getClientRects().length&&getComputedStyle(el).animationName!=='none'&&getComputedStyle(el).animationIterationCount.split(',').includes('infinite'));
    const animations=elements.flatMap(el=>el.getAnimations().filter(a=>a.playState==='running').map(a=>({a,time:Number(a.currentTime),el})));
    await new Promise(r=>setTimeout(r,160));
    return {declared:elements.length,running:animations.length,advanced:animations.filter(x=>x.el.isConnected&&Number(x.a.currentTime)>x.time+25).length};
  });
}
async function startCanvasGame(page,id) {
  if(id==='rainbow-blocks')await page.locator('#rb-play').click();
  if(id==='cosmic-defense')await page.locator('#cd-quick-play').click();
  if(id==='eat-em-all')await page.getByRole('button',{name:'Chơi màn 1',exact:true}).click();
  if(id==='boom-buddies') { await page.locator('#boom-continue').click(); await page.locator('#boom-start').click(); await page.getByRole('button',{name:'Bỏ qua',exact:true}).click(); }
  if(id==='neon-runner') { const f=page.frames().find(f=>f.url().includes('/standalone/neon-run/')); await f.locator('#continueCampaign').click(); }
  if(id==='brick-breaker') { const f=page.frames().find(f=>f.url().includes('/chronicles-realms/')); await f.locator('[data-action="continue"]').click(); await f.locator('[data-action="start"]').click(); }
  // Chronicles and some games have their own menu. A continuously drawn menu is also a live
  // renderer; input/physics are covered by test:games and each game's engine suites.
}
(async()=>{
 const server=spawn(process.execPath,[path.resolve('node_modules/vite/bin/vite.js'),'preview','--port',String(PORT),'--strictPort'],{stdio:'pipe'});
 let browser;
 try {
  for(let n=0;n<80;n++){try{if((await fetch(`http://127.0.0.1:${PORT}`)).ok)break;}catch{}await new Promise(r=>setTimeout(r,100));}
  browser=await chromium.launch({executablePath:process.env.CHROMIUM_EXECUTABLE||['/usr/bin/chromium','/opt/pw-browsers/chromium'].find(fs.existsSync),args:['--no-sandbox','--autoplay-policy=no-user-gesture-required']});
  for(const mode of modes){
   const context=await browser.newContext({viewport:{width:1440,height:900},reducedMotion:mode,serviceWorkers:'block'});
   await context.route('**/*',route=>{const u=new URL(route.request().url());return ['127.0.0.1','localhost'].includes(u.hostname)?route.continue():route.abort();});
   await context.addInitScript(instrument); const page=await context.newPage(); const errors=[]; page.on('pageerror',e=>errors.push(e.message));
   await page.goto(`http://127.0.0.1:${PORT}/`);await page.locator('#game-library').waitFor({timeout:20000});
   const catalog=await page.locator('[id^="btn-play-"]:not([id^="btn-play-ai-"]):not([id^="btn-play-recent-"])').evaluateAll(es=>es.map(e=>e.id.slice(9)).sort());
   assert.deepEqual(catalog,ids,'every bundled engine must be tested; no success from a partial server catalog');
   const launcher=await probe(page,'.arcade-launcher');
   assert.equal(launcher.duration,mode==='reduce'?'1e-05s':'2s','launcher decoration respects the OS preference');
   for(const id of ids.filter(id=>!only||only.includes(id))){
    errors.length=0;
    try {
     await page.locator('#btn-play-'+id).click();await page.locator(`#game-wrapper-viewport[data-game="${id}"]`).waitFor({timeout:20000});
     await page.waitForFunction(()=>{const s=document.querySelector('#game-viewport-stage');return s&&(s.querySelector('canvas,iframe')||s.children.length&&s.querySelectorAll('*').length>10)&&!s.textContent.includes('Đang tải game…');},null,{timeout:20000});
     await page.waitForTimeout(450); // launcher entrance/lazy save gate must settle before attaching a probe
     const css=await probe(page,'#game-viewport-stage');
     assert.equal(css.duration,'2s',id+': launcher CSS truncates gameplay animation');assert.equal(css.pseudoDuration,'2s',id+': launcher CSS truncates pseudo animation');assert.equal(css.iterations,'infinite');assert.ok(css.advanced&&css.changed,id+': animation must visibly progress, not just exist '+JSON.stringify(css));
     const continuous=['rainbow-blocks','cosmic-defense','cyber-slice','eat-em-all','neon-runner','brick-breaker','boom-buddies'].includes(id);
     let painting=null;
     if(continuous){
      await startCanvasGame(page,id);await page.waitForTimeout(600);
      const frames=page.frames();const before=await Promise.all(frames.map(f=>f.evaluate(()=>window.__motionPaint||0)));
      await page.waitForTimeout(350);
      const after=await Promise.all(frames.map(f=>f.evaluate(()=>window.__motionPaint||0)));
      painting=after.reduce((sum,n,i)=>sum+n-before[i],0);assert.ok(painting>0,id+': Canvas/iframe stopped painting');
     }
     const authored=mode==='no-preference'?await authoredAnimations(page):null;
     if(authored?.declared)assert.ok(authored.advanced>0,id+': authored infinite animations are frozen '+JSON.stringify(authored));
     assert.deepEqual(errors,[],id+': page errors');
     report.push({id,mode,css,authored,canvasPaintCalls:painting});console.log('PASS',mode,id,painting===null?'CSS contract':'CSS + Canvas '+painting);
     fs.mkdirSync('test-results/desktop-motion-screenshots',{recursive:true});
     await page.screenshot({path:`test-results/desktop-motion-screenshots/${mode}-${id}.png`});
     await page.evaluate(()=>document.fullscreenElement&&document.exitFullscreen());
     await page.locator('#btn-game-exit').click();if(await page.locator('#btn-exit-confirm').isVisible().catch(()=>false))await page.locator('#btn-exit-confirm').click();
     await page.locator('#game-library').waitFor();
    }catch(e){failures.push({id,mode,error:e.message});console.log('FAIL',mode,id,e.message.split('\n')[0]);await page.goto(`http://127.0.0.1:${PORT}/`);await page.locator('#game-library').waitFor();}
   }
   await context.close();
  }
 }finally{await browser?.close();server.kill();fs.mkdirSync('test-results',{recursive:true});fs.writeFileSync('test-results/desktop-motion.json',JSON.stringify({tested:report.length,expected:ids.length*modes.length,report,failures},null,2));}
 assert.deepEqual(failures,[],'desktop motion regressions');
 console.log(`desktop motion: ${report.length}/${ids.filter(id=>!only||only.includes(id)).length*modes.length} passed`);
})().catch(e=>{console.error(e);process.exitCode=1;});
