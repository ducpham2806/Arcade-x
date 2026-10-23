const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),ts=require('typescript');
const real=JSON.parse(fs.readFileSync('src/games/packageAssets.json','utf8'));
const persistent=new Map();
function harness(manifests=real){
 const requested=[],timers=new Map(),compiled=new Map();let next=0,failed=false;
 const storage={match:async url=>persistent.get(url)?.clone(),put:async(url,response)=>{persistent.set(url,response);},delete:async url=>persistent.delete(url)};
 const globals={AbortController,DOMException,Promise,Response,console,caches:{open:async()=>storage},
 setTimeout(fn,ms){const id=++next;timers.set(id,{fn,ms});return id;},clearTimeout(id){timers.delete(id);},
 fetch:async(url,{signal})=>{requested.push(url);if(signal.aborted)throw new DOMException('Aborted','AbortError');if(failed)throw Error('offline');return new Response('asset',{headers:{'Content-Type':'image/png'}});}};
 function load(file){if(compiled.has(file))return compiled.get(file);const result={};compiled.set(file,result);const code=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText;
 vm.runInNewContext(code,{...globals,exports:result,require(name){if(name==='react')return{lazy:loader=>({loader})};if(name==='./packageAssets.json')return manifests;if(name==='./GameWrapper')return{};if(name==='./startupAssets')return load('src/games/startupAssets.ts');if(name==='./packageCache')return load('src/games/packageCache.ts');throw Error(name);}});return result;}
 return {api:load('src/games/gamePackages.tsx'),plan:load('src/games/startupAssets.ts'),requested,timers,setFailed:value=>failed=value};
}
const tick=()=>new Promise(resolve=>setImmediate(resolve));
(async()=>{
 const h=harness({alpha:['/alpha/one.png','/alpha/two.png'],beta:['/beta/one.png'],big:Array.from({length:30},(_,i)=>'/big/'+i+'.png')});
 let a=0,b=0;
 h.api.packageLazy('alpha',async()=>{a++;return{default:()=>null};});h.api.packageLazy('beta',async()=>{b++;return{default:()=>null};});
 assert.equal(h.requested.length,0);assert.equal(a,0);
 let phases=[];await h.api.prepareGamePackage('alpha',new AbortController().signal,p=>phases.push(p));
 assert.equal(a,1);assert.equal(b,0);assert.deepEqual(h.requested.sort(),['/alpha/one.png','/alpha/two.png']);assert.equal(phases.at(-1).progress,100);
 h.requested.length=0;await h.api.prepareGamePackage('alpha',new AbortController().signal,()=>{});assert.equal(h.requested.length,0);assert.equal(a,1);
 h.setFailed(true);await assert.rejects(h.api.prepareGamePackage('beta',new AbortController().signal,()=>{}));h.setFailed(false);
 await h.api.prepareGamePackage('beta',new AbortController().signal,()=>{});assert.equal(b,1);
 let resolveModule;h.api.packageLazy('big',()=>new Promise(resolve=>{resolveModule=resolve;}));h.requested.length=0;phases=[];
 const controller=new AbortController(),pending=h.api.prepareGamePackage('big',controller.signal,p=>phases.push(p));
 await tick();assert.ok(h.requested.length>0,'assets load while JS is pending');assert.ok(h.requested.length<=8,'full pack must not block first screen');assert.ok(phases.every(p=>p.progress<100));
 resolveModule({default:()=>null});await pending;assert.equal(phases.at(-1).progress,100);assert.ok(phases.every((p,i)=>!i||p.progress>=phases[i-1].progress));
 assert.equal(h.requested.length,8,'ready before later assets download');
 for(const [id,timer] of h.timers)if(timer.ms===2000){h.timers.delete(id);timer.fn();}
 for(let i=0;i<30;i++)await tick();assert.equal(h.requested.length,30,'background still completes selected pack');
 const warm=harness({big:Array.from({length:30},(_,i)=>'/big/'+i+'.png')});warm.api.packageLazy('big',async()=>({default:()=>null}));
 await warm.api.prepareGamePackage('big',new AbortController().signal,()=>{});assert.equal(warm.requested.length,0,'cache persists across reloads');
 h.api.packageLazy('slow',()=>new Promise(()=>{}));const abort=new AbortController();const slow=h.api.prepareGamePackage('slow',abort.signal,()=>{});abort.abort();await assert.rejects(slow,error=>error.name==='AbortError');
 persistent.set('/bad/one.png',new Response('<html>fallback</html>',{headers:{'Content-Type':'text/html'}}));
 const bad=harness({bad:['/bad/one.png']});bad.api.packageLazy('bad',async()=>({default:()=>null}));await bad.api.prepareGamePackage('bad',new AbortController().signal,()=>{});assert.equal(bad.requested.length,1,'discard a cached SPA fallback and fetch the image again');
 const plans=harness();let total=0,boot=0;
 for(const [id,urls] of Object.entries(real)){const selected=plans.plan.startupAssets(id,urls);assert.ok(selected.length<=16);assert.ok(selected.every(u=>urls.includes(u)));assert.ok(selected.includes(urls.find(url=>url.startsWith('/game-art/icons/'))));total+=urls.length;boot+=selected.length;}
 assert.ok(plans.plan.startupAssets('boom-buddies',real['boom-buddies']).length<20);
 const gate=fs.readFileSync('src/components/GamePackageGate.tsx','utf8'),cards=fs.readFileSync('src/components/common/LazyGameCard.tsx','utf8');
 assert.match(gate,/gameId=\{game.id\} variant="icon"/);assert.match(cards,/gameId=\{game.id\} variant="icon"/);assert.ok(!gate.includes('state.completed}'));assert.ok(!gate.includes('setInterval'));
 assert.match(fs.readFileSync('src/App.tsx','utf8'),/<GamePackageGate[^>]*>[\s\S]*?<GameWrapper/);
 console.log('PASS: concurrent code/art; startup-only gating; background completion; persistent cache after reload; monotonic 0–100%; failure retry; immediate abort; correct icons.');
 console.log(JSON.stringify({fullPackageResources:total,blockingStartupResources:boot,boom:{before:real['boom-buddies'].length,after:plans.plan.startupAssets('boom-buddies',real['boom-buddies']).length}}));
})().catch(error=>{console.error(error);process.exitCode=1;});
