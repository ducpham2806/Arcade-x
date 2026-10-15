// Deterministic browser-API regressions; no live account or production writes.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
const {parseHTML} = require('linkedom');
const compile = (source, fileName) => ts.transpileModule(source, {fileName, compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true,target:ts.ScriptTarget.ES2022}}).outputText;
function lifecycle(reg, {online=true, checkpoint=async()=>{}}={}) {
  const win = new EventTarget(); win.location={reload(){ win.reloaded=true; }};
  const exports={};
  const code=fs.readFileSync('src/services/pwaLifecycle.ts','utf8').replace('import.meta.env.DEV','false');
  vm.runInNewContext(compile(code,'pwaLifecycle.ts'),{exports,require(){return {AuthService:{checkpoint}}},window:win,navigator:{onLine:online,serviceWorker:{getRegistration:async()=>reg}},sessionStorage:{removeItem(){}},Event,setTimeout,clearTimeout});
  return {api:exports,win};
}
const pause=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{
  let calls=0;
  const delayed={update(){calls++; return new Promise(()=>{});}};
  const slow=lifecycle(delayed);const started=Date.now();
  await Promise.all([slow.api.checkForUpdate(),slow.api.checkForUpdate()]);
  assert.equal(calls,1); assert.ok(Date.now()-started<3200); assert.equal(slow.api.pwaState.progress,80);
  const failed=lifecycle({update:async()=>{throw new Error('Failed to update a ServiceWorker');}});
  await failed.api.checkForUpdate();assert.equal(failed.api.pwaState.progress,80);assert.equal(failed.api.pwaState.error,undefined);
  const loading=lifecycle({installing:{state:'installing'},update(){throw Error('Must not restart installation');}});
  await loading.api.checkForUpdate();assert.match(loading.api.pwaState.message,/trong nền/);
  const offline=lifecycle({update(){throw Error('Offline update should not run');}},{online:false});await offline.api.checkForUpdate();
  const worker=new EventTarget();worker.state='installed';worker.postMessage=()=>{worker.state='activated';worker.dispatchEvent(new Event('statechange'));};
  const ready=lifecycle({waiting:worker});await ready.api.checkForUpdate();assert.equal(ready.win.__arcadex_sw_update_pending,true);
  await Promise.all([ready.api.installUpdate(),ready.api.installUpdate()]);assert.equal(ready.win.reloaded,true);
  const denied=lifecycle({waiting:worker},{checkpoint:async()=>{throw Error('Save failed');}});await assert.rejects(denied.api.installUpdate());assert.equal(denied.win.reloaded,undefined);

  const {window}=parseHTML('<html><body><div id="root"></div></body></html>');
  global.window=window;global.document=window.document;global.navigator={userAgent:'test'};global.IS_REACT_ACT_ENVIRONMENT=true;
  global.sessionStorage={setItem(){}};
  const React=require('react');const {createRoot}=require('react-dom/client');const {act}=React;
  let finish; const check=new Promise(r=>{finish=r;});
  const state={progress:50,message:'Đang kiểm tra phiên bản…'};let completed=0;
  const exports={}; const source=fs.readFileSync('src/components/SplashScreen.tsx','utf8');
  vm.runInNewContext(compile(source,'SplashScreen.tsx'),{exports,require(name){if(name.endsWith('.css'))return {};if(name.includes('updateService'))return {CURRENT_APP_VERSION:'test',isAutoUpdateEnabled:()=>true,setStoredVersion(){}};if(name.includes('pwaLifecycle'))return {pwaState:state,checkForUpdate:()=>check,installUpdate:async()=>{}};return require(name);},window,sessionStorage:global.sessionStorage,setTimeout,clearTimeout,setInterval,clearInterval});
  const root=createRoot(document.getElementById('root'));
  const render=ready=>root.render(React.createElement(exports.SplashScreen,{ready,onComplete:()=>completed++}));
  await act(async()=>{render(false);});
  const initial=+document.querySelector('[role=progressbar]').getAttribute('aria-valuenow');
  await act(async()=>{await pause(900);});
  const later=+document.querySelector('[role=progressbar]').getAttribute('aria-valuenow');assert.ok(later>initial && later<100);assert.ok(document.querySelector('.arcadex-boot-orbit'));
  await act(async()=>{finish();await pause(10);});assert.equal(completed,0);
  await act(async()=>{render(true);});
  assert.equal(document.querySelector('[role=progressbar]').getAttribute('aria-valuenow'),'100');
  await act(async()=>{await pause(400);});assert.equal(completed,1);
  await act(async()=>{root.unmount();});
  const css=fs.readFileSync('src/components/splash.css','utf8');assert.match(css,/prefers-reduced-motion/);
  console.log('PASS: slow/failed SW, single-flight, background install, offline, safe activation/checkpoint, animated progress, readiness and completion.');
})().catch(error=>{console.error(error);process.exitCode=1;});
