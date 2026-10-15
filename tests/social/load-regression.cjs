const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const ts=require('typescript');
function load(file,client,env={}){
 const exports={};const code=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
 vm.runInNewContext(code,{exports,require:()=>({supabase:client,ensureCloudIdentity:async()=>client}),setTimeout,clearTimeout,console,...env});return exports;
}
const settle=()=>new Promise(r=>setImmediate(r));
(async()=>{
 let commits=0,reads=0,delays=[];
 const client={rpc:async(name)=>name==='arcadex_read'?{data:[{path:'game_rooms/test',data:{move:reads},version:++reads}]}:{error:++commits<3?{code:'PT409'}:null}};
 const api=load('src/services/cloudStore.ts',client,{setTimeout:(fn,ms)=>{delays.push(ms);fn();}});
 const ref=api.doc(client,'game_rooms','test');
 await api.runTransaction(client,async tx=>{const s=await tx.get(ref);tx.update(ref,{move:s.data().move+1});});
 assert.equal(commits,3);assert.equal(reads,3,'conflict must reread fresh revision');assert.equal(delays.length,2);assert.ok(delays[1]>=300);
 await api.runTransaction(client,async tx=>{await tx.get(ref);});assert.equal(commits,3,'read-only transaction must not invoke commit');
 client.rpc=async()=>({error:{code:'PT409'}});commits=0;
 await assert.rejects(api.runTransaction(client,async tx=>{commits++;tx.update(ref,{move:2});}));assert.equal(commits,5,'conflict retries must be bounded');
 const win=new EventTarget(),document=new EventTarget();document.hidden=true;
 const timers=new Map();let next=0,calls=0,received=0;
 const social=load('src/services/social.ts',{}, {window:win,document,navigator:{onLine:true},setTimeout:(fn,ms)=>{timers.set(++next,{fn,ms});return next;},clearTimeout:id=>timers.delete(id)});
 const stop=social.watchSocial(async()=>{calls++;return [];},()=>received++,()=>{});
 await settle();assert.equal(calls,0,'hidden page must not poll');
 document.hidden=false;document.dispatchEvent(new Event('visibilitychange'));await settle();assert.equal(calls,1);assert.equal(received,1);
 document.hidden=true;const scheduled=[...timers.values()][0];scheduled.fn();await settle();assert.equal(calls,1,'background poll must stop');
 stop();document.hidden=false;win.dispatchEvent(new Event('focus'));await settle();assert.equal(calls,1,'cleanup removes listeners');
 console.log('PASS: bounded conflicts, fresh reads, no empty commits, hidden polling and cleanup');
})().catch(e=>{console.error(e);process.exitCode=1;});
