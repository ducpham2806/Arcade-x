import test from 'node:test';
import assert from 'node:assert/strict';
import {build} from 'esbuild';
const settle=async()=>{for(let i=0;i<20;i++)await Promise.resolve();};
async function load(entry,stubs={}){
 const {outputFiles}=await build({entryPoints:[entry],bundle:true,write:false,platform:'node',format:'esm',plugins:[{name:'fixtures',setup(b){b.onResolve({filter:/.*/},args=>Object.hasOwn(stubs,args.path)?{path:args.path,namespace:'stub'}:undefined);b.onLoad({filter:/.*/,namespace:'stub'},args=>({contents:stubs[args.path],loader:'ts'}));}}]});
 return import('data:text/javascript;base64,'+Buffer.from(outputFiles[0].text).toString('base64')+'#'+Math.random());
}
const {latestWriter}=await load('src/services/syncPolicy.ts');
function clock(t){t.mock.timers.enable({apis:['setTimeout','setInterval','Date'],now:1_000_000});}
test('600 rapid autosaves upload only the latest snapshot at a fixed deadline',async t=>{
 clock(t);const writes=[];const q=latestWriter(async v=>writes.push(v),30_000);
 for(let i=0;i<600;i++){q.enqueue(i);t.mock.timers.tick(49);await settle();}
 assert.equal(writes.length,0);t.mock.timers.tick(600);await settle();assert.deepEqual(writes,[599]);q.cancel();
});
test('explicit flush serializes a new save behind an in-flight older save',async t=>{
 clock(t);const writes=[];let release;const q=latestWriter(async v=>{writes.push(v);if(v===1)await new Promise(r=>release=r);},30_000);
 q.enqueue(1);const first=q.flush();await settle();q.enqueue(2);const final=q.flush();assert.deepEqual(writes,[1]);release();await first;await final;assert.deepEqual(writes,[1,2]);q.cancel();
});
test('failed upload retries newest value and cancellation prevents stale resurrection',async t=>{
 clock(t);const writes=[];let reject;const q=latestWriter(async v=>{writes.push(v);if(v===1)await new Promise((_,r)=>reject=r);},30_000);
 q.enqueue(1);const first=q.flush();await settle();q.enqueue(2);reject(Error('offline'));await first;t.mock.timers.tick(30_000);await settle();assert.deepEqual(writes,[1,2]);q.cancel();
 let fail;const old=latestWriter(()=>new Promise((_,r)=>fail=r),30_000);old.enqueue(3);const pending=old.flush();await settle();old.cancel();fail(Error('switched'));await pending;assert.equal(old.busy,false);t.mock.timers.tick(60_000);await settle();assert.equal(old.busy,false);
});
function environment(t){
 clock(t);const values=new Map([['arcadex_player_profile','{"id":"owner-a"}']]);
 Object.defineProperty(globalThis,'localStorage',{configurable:true,value:{getItem:k=>values.get(k)??null,setItem:(k,v)=>values.set(k,v)}});
 Object.defineProperty(globalThis,'window',{configurable:true,value:new EventTarget()});
 Object.defineProperty(globalThis,'document',{configurable:true,value:Object.assign(new EventTarget(),{hidden:false})});
 Object.defineProperty(globalThis,'navigator',{configurable:true,value:{onLine:true}});
 const db={reads:0,commits:0,channels:[],row:{path:'players/owner-a',version:1,data:{score:1}},async rpc(name){if(name==='arcadex_read'){this.reads++;return {data:[structuredClone(this.row)]};}this.commits++;return {};},channel(){const channel={on(_kind,_filter,fn){this.invalidate=fn;return this;},subscribe(fn){this.status=fn;return this;}};this.channels.push(channel);return channel;},removeChannel(channel){channel.removed=true;}};
 globalThis.__syncDB=db;return db;
}
const cloudStubs={'./supabaseClient':'export const supabase=globalThis.__syncDB; export const ensureCloudIdentity=async()=>supabase;'};
test('duplicate subscribers/readers share RPC and channel; realtime edits still arrive',async t=>{
 const db=environment(t);const c=await load('src/services/cloudStore.ts',cloudStubs);const ref=c.doc(db,'players','owner-a');const a=[],b=[];
 const stopA=c.onSnapshot(ref,s=>a.push(s.data().score));const stopB=c.onSnapshot(ref,s=>b.push(s.data().score));const initial=c.getDoc(ref);await initial;await settle();
 assert.equal(db.reads,1);assert.equal(db.channels.length,1);assert.deepEqual(a,[1]);assert.deepEqual(b,[1]);
 db.row={...db.row,version:2,data:{score:2}};for(let i=0;i<100;i++)db.channels[0].invalidate();t.mock.timers.tick(250);await settle();assert.equal(db.reads,2);assert.deepEqual(a,[1,2]);
 stopA();assert.equal(db.channels[0].removed,undefined);stopB();assert.equal(db.channels[0].removed,true);t.mock.timers.tick(300_000);await settle();assert.equal(db.reads,2);
});
test('healthy rooms use realtime immediately and 30s recovery; degraded rooms recover in 5s',async t=>{
 const db=environment(t);db.row.path='game_rooms/room';const c=await load('src/services/cloudStore.ts',cloudStubs);const stop=c.onSnapshot(c.doc(db,'game_rooms','room'),()=>{});await settle();const channel=db.channels[0];channel.status('SUBSCRIBED');t.mock.timers.tick(1);await settle();const initial=db.reads;
 t.mock.timers.tick(25_000);await settle();assert.equal(db.reads,initial);t.mock.timers.tick(10_000);await settle();assert.equal(db.reads,initial+1);
 channel.invalidate();t.mock.timers.tick(1);await settle();assert.equal(db.reads,initial+2);
 channel.status('CHANNEL_ERROR');t.mock.timers.tick(1);await settle();const degraded=db.reads;t.mock.timers.tick(10_000);await settle();assert.ok(db.reads>degraded);stop();
});
test('background tabs do no recovery reads; returning resumes, account snapshots stay separate',async t=>{
 const db=environment(t);const c=await load('src/services/cloudStore.ts',cloudStubs);const ref=c.doc(db,'players','owner-a');const stop=c.onSnapshot(ref,()=>{});await settle();document.hidden=true;t.mock.timers.tick(300_000);await settle();assert.equal(db.reads,1);
 document.hidden=false;document.dispatchEvent(new Event('visibilitychange'));t.mock.timers.tick(250);await settle();assert.equal(db.reads,2);
 localStorage.setItem('arcadex_player_profile','{"id":"owner-b"}');const stopB=c.onSnapshot(ref,()=>{});await settle();assert.equal(db.channels.length,2);stop();stopB();
});
test('transactions bypass shared reads and retain version checks',async t=>{
 const db=environment(t);const c=await load('src/services/cloudStore.ts',cloudStubs);const ref=c.doc(db,'players','owner-a');await c.runTransaction(db,async tx=>{await tx.get(ref);await tx.get(ref);tx.update(ref,{score:2});});assert.equal(db.reads,2);assert.equal(db.commits,1);
});
test('repeated read failures back off instead of spinning on realtime events',async t=>{
 const db=environment(t);db.rpc=async()=>{db.reads++;return {error:Error('offline')};};const c=await load('src/services/cloudStore.ts',cloudStubs);const stop=c.onSnapshot(c.doc(db,'players','owner-a'),()=>{},()=>{});await settle();assert.equal(db.reads,1);
 for(let i=0;i<30;i++)window.dispatchEvent(new Event('focus'));t.mock.timers.tick(1000);await settle();assert.equal(db.reads,1);t.mock.timers.tick(1000);await settle();assert.equal(db.reads,2);stop();
});
test('game save uploader shares concurrent checkpoints and preserves edits during upload',async t=>{
 environment(t);const store=new Map([['arcadex_player_profile',JSON.stringify({id:'owner-a'})],['arcadex_save_v1_test',JSON.stringify({schemaVersion:1,payload:{n:1},baseVersion:0,dirty:true})]]);
 Object.defineProperty(globalThis,'localStorage',{configurable:true,value:new Proxy({getItem:k=>store.get(k)??null,setItem:(k,v)=>store.set(k,v)},{ownKeys:()=>[...store.keys()],getOwnPropertyDescriptor:()=>({enumerable:true,configurable:true})})});
 let reads=0,commits=0;let release;const db={async rpc(name){if(name==='arcadex_read'){reads++;if(reads===1){await new Promise(r=>release=r);return {data:[]};}return {data:[{version:1,data:{payload:{n:1}}}]};}commits++;localStorage.setItem('arcadex_save_v1_test',JSON.stringify({schemaVersion:1,payload:{n:2},baseVersion:0,dirty:true}));return {};}};
 globalThis.__syncDB=db;const s=await load('src/services/gameSaves.ts',{'./supabaseClient':'export const supabase=globalThis.__syncDB;'});const first=s.syncGameSaves('owner-a');const duplicate=s.syncGameSaves('owner-a');assert.equal(first,duplicate);release();await first;assert.equal(reads,2);assert.equal(commits,1);const saved=JSON.parse(localStorage.getItem('arcadex_save_v1_test'));assert.equal(saved.payload.n,2);assert.equal(saved.dirty,true);assert.equal(saved.baseVersion,1);
});
test('Battleship successful command needs no redundant snapshot request',async()=>{
 const {RoomClient}=await load('src/games/battleship/online-client.ts');const calls=[];const snapshot={id:'r',version:1,seat:'A1',status:'active',serverNow:1000};const client=new RoomClient({request:async body=>{calls.push(body.type);return {...snapshot,version:2};}},()=>1000,()=> 'id');await client.refresh('r');await client.command({type:'ready',ready:true});assert.deepEqual(calls,['snapshot','command']);client.close();
});

test('account backup retains legacy-only progress without uploading versioned mirrors or backups twice',async()=>{
 const {accountUploadValues}=await load('src/services/syncPolicy.ts');
 const values={arcadex_player_profile:'profile',arcadex_save_v1_chess:'envelope',arcadex_gamestate_chess:'mirror',arcadex_save_backup_chess_1:'backup',arcadex_gamestate_sudoku:'legacy'};
 assert.deepEqual(accountUploadValues(values),{arcadex_player_profile:'profile',arcadex_gamestate_sudoku:'legacy'});
});
test('catalog reads share in-flight work and a 5 minute cache; access remains checked on server',async t=>{
 environment(t);let reads=0,access=0;const raw={schemaVersion:1,games:[],support:{enabled:false},commerceEnabled:false};
 globalThis.__catalogDB={rpc(name){if(name==='launcher_catalog')reads++;else access++;return {abortSignal:async()=>({data:name==='launcher_catalog'?raw:{allowed:false,reason:'locked'}})};}};
 const r=await load('src/launcher/repository.ts',{
  '../services/supabaseClient':'export const supabase=globalThis.__catalogDB;',
  '../commerce/api':'export const accessPreviewEnabled=false;',
  './catalog':'export const bundledCatalog={schemaVersion:1,games:[]};export const parseCatalog=x=>x?.schemaVersion===1?x:null;export const isLocalReviewGame=()=>false;'
 });
 await Promise.all([r.fetchCatalog(),r.fetchCatalog()]);assert.equal(reads,1);t.mock.timers.tick(299_000);await r.fetchCatalog();assert.equal(reads,1);t.mock.timers.tick(1001);await r.fetchCatalog();assert.equal(reads,2);
 const game={id:'premium',availability:'published',accessModel:'premium',supportsOffline:false};assert.equal((await r.checkAccess(game)).allowed,false);assert.equal((await r.checkAccess(game)).allowed,false);assert.equal(access,2);
});
test('pending save/clear survive reload, and only their matching upload removes the outbox receipt',async t=>{
 environment(t);const {sessionWriter}=await load('src/services/sessionSync.ts');const receipts=new Map();const storage={getItem:k=>receipts.get(k)??null,setItem:(k,v)=>receipts.set(k,v),removeItem:k=>receipts.delete(k)};
 let local={savedAt:1};const writes=[];let release;
 const opts={owner:'owner-a',activeOwner:()=> 'owner-a',readLocal:()=>local,storage,upload:async v=>{writes.push(v);return true;}};
 const original=sessionWriter(opts);original.enqueue(local);original.cancel();assert.equal(receipts.size,1);
 const restored=sessionWriter(opts);restored.restore();await restored.flush();assert.deepEqual(writes,[{savedAt:1}]);assert.equal(receipts.size,0);
 const slow=sessionWriter({...opts,upload:async v=>{writes.push(v);await new Promise(r=>release=r);return true;}});slow.enqueue(local);const flight=slow.flush();await settle();local={savedAt:2};slow.enqueue(local);release();await flight;assert.equal(receipts.size,1);slow.cancel();
 const cleared=sessionWriter(opts);local=null;cleared.enqueue(null);cleared.cancel();const reopened=sessionWriter(opts);reopened.restore();await reopened.flush();assert.equal(writes.at(-1),null);assert.equal(receipts.size,0);
});
test('another account cannot restore or acknowledge a pending session',async t=>{
 environment(t);const {sessionWriter}=await load('src/services/sessionSync.ts');const receipts=new Map();const storage={getItem:k=>receipts.get(k)??null,setItem:(k,v)=>receipts.set(k,v),removeItem:k=>receipts.delete(k)};let uploads=0;
 const opts={owner:'a',activeOwner:()=> 'a',readLocal:()=>({savedAt:1}),storage,upload:async()=>{uploads++;return true;}};
 const a=sessionWriter(opts);a.enqueue({savedAt:1});a.cancel();const b=sessionWriter({...opts,owner:'b',activeOwner:()=> 'b'});b.restore();await b.flush();assert.equal(uploads,0);assert.equal(receipts.size,1);b.cancel();
});
