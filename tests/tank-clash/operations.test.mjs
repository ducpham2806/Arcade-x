import { test } from 'node:test';
import assert from 'node:assert/strict';
import WS from '../../server/tank-clash-room/node_modules/ws/index.js';
import { loadServerConfig } from '../../server/tank-clash-room/config.mjs';
import { createTankRoomServer, supabaseAuthenticator } from '../../server/tank-clash-room/server.mjs';
import { connectTankRoom } from '../../src/games/tank-clash/net-client.ts';
import { preflight } from '../../scripts/tank-clash/preflight.mjs';
import { prepare } from '../../scripts/tank-clash/package.mjs';
import { mkdtempSync, cpSync, writeFileSync, rmSync, readFileSync, readdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
const uid='00000000-0000-4000-8000-000000000001',origin='https://arcade-x.netlify.app',metricsToken='a'.repeat(40);
const env={NODE_ENV:'production',TANK_ENV:'staging',HOST:'127.0.0.1',PORT:'0',SUPABASE_URL:'https://staging.example.supabase.co',SUPABASE_PUBLISHABLE_KEY:'public-test-key',TANK_ALLOWED_ORIGINS:origin,TANK_ALLOWED_USERS:uid,TANK_METRICS_TOKEN:metricsToken};
const delay=ms=>new Promise(r=>setTimeout(r,ms));
async function until(check,ms=6000){const end=performance.now()+ms;while(performance.now()<end){if(check())return;await delay(10);}assert.fail('condition timed out');}
async function connect(url,from){return new Promise(resolve=>{const ws=new WS(url,from===undefined?{}:{origin:from});ws.once('open',()=>resolve(ws));ws.once('unexpected-response',(_q,res)=>{res.resume();resolve(res.statusCode);});ws.on('error',()=>{});});}

test('production config requires authentication, exact HTTPS origins, tester IDs and metrics secret; staging cannot target production',()=>{
 const c=loadServerConfig(env);assert.equal(c.maxConnections,64);assert.deepEqual(c.allowedUserIds,[uid]);assert.equal(c.guestQueue,false);
 for(const key of ['SUPABASE_URL','SUPABASE_PUBLISHABLE_KEY','TANK_ALLOWED_ORIGINS','TANK_ALLOWED_USERS','TANK_METRICS_TOKEN'])assert.throws(()=>loadServerConfig({...env,[key]:''}),Error,key);
 for(const key of ['TANK_ALLOW_GUESTS','TANK_QUEUE_GUESTS'])assert.throws(()=>loadServerConfig({...env,[key]:'1'}),/Guest/);
 for(const value of ['*','null','http://review.example.com','https://review.example.com/path','https://user:pass@review.example.com'])assert.throws(()=>loadServerConfig({...env,TANK_ALLOWED_ORIGINS:value}));
 assert.throws(()=>loadServerConfig({...env,SUPABASE_URL:'https://whjatkhhupeqfngakmee.supabase.co'}),/production project/);
 assert.throws(()=>loadServerConfig({NODE_ENV:'development',HOST:'0.0.0.0'}),/loopback/);
 assert.equal(loadServerConfig({NODE_ENV:'development',TANK_QUEUE_GUESTS:'1'}).guestQueue,true);
});

test('Auth authorization uses the verified ID and anonymous flag, not editable metadata; cache cannot outlive JWT exp',async()=>{
 let now=100000,calls=0;
 const jwt=exp=>`test.${Buffer.from(JSON.stringify({exp})).toString('base64url')}.test`;
 const auth=supabaseAuthenticator({url:env.SUPABASE_URL,anonKey:'public',allowedUserIds:[uid],requireRegistered:true,now:()=>now,
  fetchImpl:async(_url,init)=>{calls++;assert.equal(init.redirect,'error');const token=init.headers.Authorization.slice(7);return{ok:true,json:async()=>({id:token==='unlisted'?'another-user':uid,is_anonymous:token==='anonymous'?true:token==='missing'?undefined:false,user_metadata:{role:'admin',allowed:true}})};}});
 assert.equal(await auth('unlisted'),null);assert.equal(await auth('anonymous'),null);assert.equal(await auth('missing'),null);
 const token=jwt(102);assert.equal((await auth(token)).userId,uid);const count=calls;await auth(token);assert.equal(calls,count);
 now=103000;assert.equal(await auth(token),null);assert.equal(calls,count+1,'expired cache must not grant entry');
 const rejected=supabaseAuthenticator({url:env.SUPABASE_URL,anonKey:'public',fetchImpl:async()=>({ok:false})});assert.equal(await rejected('bad'),null);
});

test('strict production-style origin allowlist rejects missing, null and localhost; capacity recovers after disconnect',async()=>{
 const s=await createTankRoomServer({allowedOrigins:[origin],allowLocalOrigins:false,allowMissingOrigin:false,maxConnections:2});const sockets=[];
 try{
  for(const from of [undefined,'null','http://localhost:3000','https://foreign.example','http://arcade-x.netlify.app','https://arcade-x.netlify.app.evil.example','https://deploy-preview-1--arcade-x.netlify.app'])assert.equal(await connect(s.url,from),403);
  const a=await connect(s.url,origin),b=await connect(s.url,origin);sockets.push(a,b);assert.equal(await connect(s.url,origin),503);
  a.close();await until(()=>s.transport.open===1);const c=await connect(s.url,origin);sockets.push(c);assert(c instanceof WS);assert.equal(s.stats().transport.open,2);
 }finally{sockets.forEach(x=>x.close());await s.close();}
});

test('public health hides metrics; authenticated metrics contain counts only and are not cached',async()=>{
 const s=await createTankRoomServer({detailedHealth:false,metricsToken});const base=s.url.replace('ws:','http:').replace('/tank','');
 try{const health=await fetch(base+'/health');const h=await health.json();assert.deepEqual(Object.keys(h).sort(),['instance','ok','protocol']);assert.equal(health.headers.get('cache-control'),'no-store');
  assert.equal((await fetch(base+'/metrics')).status,401);const response=await fetch(base+'/metrics',{headers:{Authorization:`Bearer ${metricsToken}`}}),text=await response.text(),m=JSON.parse(text);assert.equal(response.status,200);assert.equal(m.retained.peers,0);assert.equal(m.memory.rss>0,true);assert(!text.includes(metricsToken));
  assert.equal((await fetch(base+'/health',{method:'POST'})).status,405);
 }finally{await s.close();}
});

test('Auth failures, invalid JSON and upstream timeout fail closed',async()=>{
 for(const fetchImpl of [async()=>{throw Error('offline');},async()=>({ok:true,json:async()=>{throw Error('not JSON');}}),(_u,{signal})=>new Promise((_r,reject)=>signal.addEventListener('abort',()=>reject(signal.reason)))]){
  const auth=supabaseAuthenticator({url:env.SUPABASE_URL,anonKey:'public',fetchImpl,timeoutMs:5});assert.equal(await auth('test'),null);
 }
});

test('pilot preflight rejects placeholders, external bind and secret keys; output contains counts only',()=>{
 const valid={...env,PORT:'3223',SUPABASE_URL:'https://testproject123.supabase.co',TANK_ALLOWED_ORIGINS:'https://review.arcadex.test'};
 const result=JSON.stringify(preflight(valid));assert(!result.includes(uid));assert(!result.includes(metricsToken));assert(!result.includes(valid.SUPABASE_PUBLISHABLE_KEY));
 assert.throws(()=>preflight({...valid,HOST:'0.0.0.0'}),/loopback/);
 assert.throws(()=>preflight({...valid,SUPABASE_PUBLISHABLE_KEY:'REPLACE_WITH_PUBLIC_KEY'}),/template/);
 assert.throws(()=>preflight({...valid,SUPABASE_PUBLISHABLE_KEY:'sb_secret_fake'}),/publishable/);
});

test('Render pilot starts behind managed TLS with public metrics disabled; VPS binding rules stay strict',async()=>{
 const settings={...env,PORT:'10000',SUPABASE_URL:'https://testproject123.supabase.co',TANK_ALLOWED_ORIGINS:origin,RENDER:'true',HOST:'0.0.0.0',TANK_METRICS_ENABLED:'0'};
 assert.equal(preflight(settings).ok,true);
 assert.throws(()=>preflight({...settings,TANK_METRICS_ENABLED:'1'}),/metrics/);
 assert.throws(()=>preflight({...settings,RENDER:''}),/loopback/);
 assert.throws(()=>loadServerConfig({...settings,TANK_METRICS_ENABLED:'false'}),/0 or 1/);
 const s=await createTankRoomServer({metricsEnabled:false,metricsToken,detailedHealth:false});const base=s.url.replace('ws:','http:').replace('/tank','');
 try{for(const method of ['GET','HEAD'])for(const headers of [{},{Authorization:`Bearer ${metricsToken}`}])assert.equal((await fetch(base+'/metrics',{method,headers})).status,404);assert.equal((await fetch(base+'/health')).status,200);}
 finally{await s.close();}
});

test('review is opt-in staging only; Render adds exactly its own HTTPS origin',async()=>{
 const settings={...env,TANK_REVIEW_ENABLED:'1',RENDER:'true',RENDER_EXTERNAL_URL:'https://arcadex-tank-staging.onrender.com'};
 assert.deepEqual(loadServerConfig(settings).allowedOrigins,[origin,'https://arcadex-tank-staging.onrender.com']);
 assert.throws(()=>loadServerConfig({...settings,TANK_ENV:'production'}),/staging only/);
 for(const url of ['http://arcadex-tank-staging.onrender.com','https://arcadex-tank-staging.onrender.com.evil.example','https://arcadex-tank-staging.onrender.com/path'])assert.throws(()=>loadServerConfig({...settings,RENDER_EXTERNAL_URL:url}));
 const off=await createTankRoomServer();const on=await createTankRoomServer({review:{html:'<!doctype html><p>Review</p>',supabaseUrl:env.SUPABASE_URL,publishableKey:'sb_publishable_fixture'}});
 try{const base=s=>s.url.replace('ws:','http:').replace('/tank','');assert.equal((await fetch(base(off)+'/review')).status,404);assert.equal((await fetch(base(off)+'/review/config')).status,404);
  const response=await fetch(base(on)+'/review');assert.equal(response.status,200);assert.match(response.headers.get('content-type'),/text\/html/);assert.equal(response.headers.get('cache-control'),'no-store');assert.match(await response.text(),/Review/);
  assert.deepEqual(await (await fetch(base(on)+'/review/config')).json(),{supabaseUrl:env.SUPABASE_URL,publishableKey:'sb_publishable_fixture'});
 }finally{await off.close();await on.close();}
});

test('isolated minimal release boots with only shipped simulation files and ws; package refuses stray env files',async()=>{
 const out=mkdtempSync(join(tmpdir(),'arcadex-tank-release-'));let child;
 try{
  prepare(out);const manifest=JSON.parse(readFileSync(join(out,'manifest.json'),'utf8'));assert.equal(manifest.files.length,13);
  assert(!manifest.files.some(f=>f.path.endsWith('/.env')||f.path.includes('node_modules')));
  assert(!readdirSync(out).includes('.env'));
  cpSync('server/tank-clash-room/node_modules/ws',join(out,'server/tank-clash-room/node_modules/ws'),{recursive:true});
  child=spawn(process.execPath,['server/tank-clash-room/server.mjs'],{cwd:out,env:{PATH:process.env.PATH,...env,PORT:'0'},stdio:['ignore','pipe','pipe']});
  let output='';child.stdout.on('data',b=>output+=b);child.stderr.on('data',b=>output+=b);
  await until(()=>output.includes('on ws://')||child.exitCode!==null);assert.equal(child.exitCode,null,output);
  const url=output.match(/on (ws:\/\/\S+)/)[1].replace('ws:','http:').replace('/tank','/health');assert.equal((await fetch(url)).status,200);
  const exited=once(child,'exit');child.kill('SIGTERM');assert.equal((await exited)[0],0);
  writeFileSync(join(out,'.env'),'SHOULD_NOT_SHIP=example');assert.throws(()=>prepare(out),/unexpected files/);
 }finally{if(child?.exitCode===null){const exited=once(child,'exit');child.kill('SIGKILL');await exited;}rmSync(out,{recursive:true,force:true});}
});

test('maintenance clears solo queue and room clients; restart loses RAM state and rejects the old resume token',async()=>{
 const s=await createTankRoomServer({guestQueue:true});
 const a=connectTankRoom(s.url,{storage:null}),q=connectTankRoom(s.url,{storage:null});let replacement;
 try{await until(()=>a.status==='open'&&q.status==='open');a.session.create();q.session.queue();await until(()=>a.session.code&&q.session.queueStatus);
  const saved={code:a.session.code,resumeToken:a.session.resumeToken},oldInstance=s.stats().instance;
  const closing=s.close({notify:true});assert.equal(s.close({notify:true}),closing);await closing;
  await until(()=>a.status==='closed'&&q.status==='closed');assert.equal(a.session.room,null);assert.equal(q.session.queueStatus,null);assert.match(q.session.error.message,/khởi động lại/);
  replacement=await createTankRoomServer({port:s.port});assert.notEqual(replacement.stats().instance,oldInstance);assert.equal(replacement.stats().rooms,0);
  const again=connectTankRoom(replacement.url,{storage:null});again.session.restore(saved);await until(()=>again.status==='open'&&again.session.error);assert.equal(again.session.error.code,'ROOM_NOT_FOUND');assert.equal(again.session.room,null);again.close();
 }finally{a.close();q.close();await s.close();await replacement?.close();}
});

test('lifecycle, result and resume logs never contain the access or seat tokens',async()=>{
 const tokens=['private-access-a-'.repeat(4),'private-access-b-'.repeat(4)],logs=[];
 const s=await createTankRoomServer({authenticate:(token,name)=>tokens.includes(token)?{userId:`tester-${tokens.indexOf(token)}`,name,guest:false}:null,
  log:(event,data)=>logs.push({event,...data}),onResult:result=>logs.push({event:'persist-result',...result})});
 const a=connectTankRoom(s.url,{storage:null,token:()=>tokens[0]}),b=connectTankRoom(s.url,{storage:null,token:()=>tokens[1]});let resumed;
 try{
  await until(()=>a.status==='open'&&b.status==='open');a.session.create();await until(()=>a.session.code);b.session.join(a.session.code);await until(()=>b.session.seat);
  const saved={code:a.session.code,resumeToken:a.session.resumeToken},seatTokens=[a.session.resumeToken,b.session.resumeToken];
  a.session.ready(true);b.session.ready(true);await until(()=>a.session.room?.phase==='playing');a.session.surrender();await until(()=>a.session.result&&b.session.result);
  a.close();await until(()=>s.transport.open===1);resumed=connectTankRoom(s.url,{storage:null,token:()=>tokens[0]});resumed.session.restore(saved);await until(()=>resumed.session.seat==='a');
  const text=JSON.stringify(logs);for(const token of [...tokens,...seatTokens])assert(!text.includes(token),'logs must omit credential values');
  for(const event of ['room.created','room.joined','match.start','match.end','persist-result','seat.resumed'])assert(logs.some(l=>l.event===event),event);
 }finally{a.close();b.close();resumed?.close();await s.close();}
});


test('public registered-free mode is explicit, production-only and pinned to ArcadeX Auth; staging keeps tester allowlist',async()=>{
 const settings={...env,PORT:'10000',RENDER:'true',HOST:'0.0.0.0',TANK_METRICS_ENABLED:'0',TANK_ENV:'production',TANK_ACCESS_MODE:'registered-free',SUPABASE_URL:'https://whjatkhhupeqfngakmee.supabase.co',TANK_ALLOWED_USERS:''};
 const config=loadServerConfig(settings);assert.equal(config.allowedUserIds,undefined);assert.equal(preflight(settings).auth,'ArcadeX registered free play');
 assert.throws(()=>loadServerConfig({...settings,TANK_ENV:'staging'}),/explicit production/);
 assert.throws(()=>loadServerConfig({...settings,SUPABASE_URL:env.SUPABASE_URL}),/ArcadeX accounts/);
 assert.throws(()=>loadServerConfig({...settings,TANK_ACCESS_MODE:'guest'}),/Unknown/);
 assert.throws(()=>loadServerConfig({...settings,TANK_REVIEW_ENABLED:'1'}),/staging only/);
 assert.throws(()=>loadServerConfig({...env,TANK_ALLOWED_USERS:''}),/TANK_ALLOWED_USERS/);
 const auth=supabaseAuthenticator({url:config.supabaseUrl,anonKey:'public',requireRegistered:true,allowedUserIds:config.allowedUserIds,
  fetchImpl:async(url,init)=>{assert.equal(url,config.supabaseUrl+'/auth/v1/user');return {ok:init.headers.Authorization!=='Bearer invalid',json:async()=>({id:init.headers.Authorization,is_anonymous:init.headers.Authorization==='Bearer anonymous'})};}});
 assert.equal(await auth('invalid'),null);assert.equal(await auth('anonymous'),null);
 assert.notEqual((await auth('account-a')).userId,(await auth('account-b')).userId,'all registered ArcadeX accounts may play, without sharing identity');
});
