/** Opt-in live smoke test. Creates one reserved Auth fixture only after confirming
 * email autoconfirm is on; never sends mail or enables global Snake flags.
 * A maintainer must grant the fixture via the existing service-only test-actor
 * function, then remove it and its data after this process signs out.
 * Credentials/tokens stay in this process, not in files or stdout. */
import assert from 'node:assert/strict';
import {createClient} from '@supabase/supabase-js';
import {readFileSync} from 'node:fs';
import {createInterface} from 'node:readline';
import {randomUUID,randomBytes} from 'node:crypto';
import {Engine,type Input} from '../../src/games/snake-legend/src/core';
import {STORY_LEVELS} from '../../src/games/snake-legend/src/story-data';
import {LauncherSnakeBinding} from '../../src/games/snake-legend/integration/launcher-binding';
import {CAMPAIGN_KEY,parseCampaign} from '../../src/games/snake-legend/src/story-save';
import {SNAKE_SAVE_TIMEOUT_MS} from '../../src/games/snake-legend/integration/save-policy';
import {committedResult} from '../../src/games/snake-legend/integration/verified-result';

if(!process.argv.includes('--live'))throw Error('Explicit --live required');
if(!process.stdin.isTTY)throw Error('Use an interactive TTY so test-actor authorization can be supplied');
const config=JSON.parse(readFileSync('src/config/public-backend.json','utf8'));
assert.equal(config.url,'https://whjatkhhupeqfngakmee.supabase.co');
const timedFetch:typeof fetch=(url,init)=>fetch(url,{...init,signal:init?.signal??AbortSignal.timeout(15000)});
const settingsResponse=await timedFetch(config.url+'/auth/v1/settings',{headers:{apikey:config.publishableKey}});
assert.equal(settingsResponse.status,200);const settings=await settingsResponse.json();
assert.equal(settings.mailer_autoconfirm,true,'Never create a fixture when email would be sent');
assert.equal(settings.disable_signup,false);
// Exercise the real engine first; a bad fixture must not create a remote user.
const engine=new Engine(STORY_LEVELS[0]),inputs:Input[]=[];let waypoint=1;
while(engine.status==='running'&&inputs.length<20000){
 const guide=engine.arena.story!.guide,target=guide[waypoint];
 if(Math.hypot(engine.pos.x-target.x,engine.pos.y-target.y)<.6&&waypoint<guide.length-1){waypoint++;continue;}
 const x=target.x-engine.pos.x,y=target.y-engine.pos.y,n=Math.hypot(x,y)||1;
 const input={x:x/n,y:y/n,dash:false};inputs.push(input);engine.step(input);
}
assert.equal(engine.status,'won');
const client=createClient(config.url,config.publishableKey,{global:{fetch:timedFetch},auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false}});
const job=randomUUID(),email=`snake-save-qa-${job}@example.invalid`;
const signup=await client.auth.signUp({email,password:randomBytes(32).toString('base64url')+'aA1!'});
if(signup.error)throw signup.error;
assert(signup.data.session&&signup.data.user&&!signup.data.user.is_anonymous);
const owner=signup.data.user.id;let current:string|null=owner;
assert((signup.data.session.expires_at??0)>Date.now()/1000);
console.log(JSON.stringify({authExpiresInSeconds:(signup.data.session.expires_at??0)-Date.now()/1000}));
console.log(JSON.stringify({status:'AWAIT_ACTOR',owner,job,email}));
const bindings:LauncherSnakeBinding[]=[];
try{
 const lines=createInterface({input:process.stdin});
 const proceed=await new Promise<boolean>(resolve=>{const timer=setTimeout(()=>{lines.close();resolve(false);},180000);lines.once('line',line=>{clearTimeout(timer);lines.close();resolve(line.trim()==='go');});});
 assert(proceed,'Test actor authorization not supplied');
 const memory=()=>{const data=new Map<string,string>();return {getItem:(k:string)=>data.get(k)??null,setItem:(k:string,v:string)=>{data.set(k,v);}};};
 const device=memory();let offline=false,loseAck=true,networkCalls=0;
 const fetcher:typeof fetch=async(url,init)=>{
  if(offline)throw TypeError('Injected offline');
  networkCalls++;const body=JSON.parse(String(init?.body)),action=body.action;const sent=Date.now();
  let response:Response;try{response=await timedFetch(url,init);}catch(e){console.log(JSON.stringify({httpAction:action,error:e instanceof Error?e.message:'transport failure',ms:Date.now()-sent}));throw e;}
  console.log(JSON.stringify({httpAction:action,status:response.status,ms:Date.now()-sent}));
  if(action==='complete'&&response.ok){try{committedResult(await response.clone().json(),body.request);}catch(e){console.log('ACK_VALIDATION',e instanceof Error?e.message:'failed');}}
  if(action==='complete'&&response.ok&&loseAck){loseAck=false;await response.arrayBuffer();throw TypeError('Injected lost acknowledgement after real commit');}
  return response;
 };
 const make=(store:ReturnType<typeof memory>)=>{
  const binding=new LauncherSnakeBinding({actorId:owner,auth:client.auth,hostOwner:()=>current,endpoint:config.url+'/functions/v1/snake-complete',publishableKey:config.publishableKey,fetcher,timeoutMs:SNAKE_SAVE_TIMEOUT_MS});
  bindings.push(binding);binding.connect();return {binding,hooks:binding.createSaveSession(store)};
 };
 let {binding,hooks}=make(device);
 await binding.refreshState();assert.equal(binding.getView().status,'ready');assert.equal(binding.getView().snapshot!.revision,0);
 hooks.newRun('1-1');assert(await hooks.prepare(),'Real ticket must be issued');
 console.log(JSON.stringify({status:"PLAYING",seconds:engine.time}));
 await new Promise(resolve=>setTimeout(resolve,Math.ceil(engine.time*1000)));
 for(const input of inputs)hooks.input(input);
 hooks.complete({runId:randomUUID(),levelId:'1-1',time:engine.time,score:engine.score,stars:engine.stars,secret:engine.secret});
 await hooks.retry();assert(hooks.status().canRetry);assert.equal(hooks.status().pending,1);
 console.log('PASS real engine win → real endpoint commit → lost acknowledgement leaves durable outbox');
 binding.destroy();({binding,hooks}=make(device));
 assert.equal(hooks.status().pending,1);await hooks.retry();console.log('RETRY_STATUS',JSON.stringify(hooks.status()),'BINDING',binding.getView().status);assert.equal(hooks.status().pending,0);
 const snapshot=binding.getView().snapshot!;assert.equal(snapshot.revision,1);assert(snapshot.levels['1-1']);assert.deepEqual(snapshot.wallet,{snake_gold:0,snake_gem:0});
 await hooks.retry();await binding.refreshState();assert.equal(binding.getView().snapshot!.revision,1);
 console.log('PASS reopen → retry same ticket → one revision, zero rewards');
 const remote=make(memory());await remote.binding.refreshState();
 const restored=parseCampaign(remote.hooks.storage.getItem(CAMPAIGN_KEY));
 assert.deepEqual(restored.levels['1-1'],snapshot.levels['1-1']);assert.equal(remote.binding.getView().snapshot!.revision,1);
 console.log('PASS second device storage restores real server campaign');
 offline=true;await binding.refreshState();assert.equal(binding.getView().status,'error');assert.equal(binding.getView().snapshot!.revision,1);
 offline=false;await binding.refreshState();assert.equal(binding.getView().status,'ready');
 console.log('PASS offline read preserves progress → explicit retry recovers');
 const factory=binding.createSaveSession;
 const refreshed=await client.auth.refreshSession();if(refreshed.error)throw refreshed.error;
 assert.equal(refreshed.data.user!.id,owner);await binding.refreshState();assert.equal(binding.createSaveSession,factory);
 console.log('PASS real Auth refresh keeps owner/factory and reads same progress');
 const logout=await client.auth.signOut();if(logout.error)throw logout.error;current=null;
 assert.equal(binding.getView().status,'closed');const calls=networkCalls;await binding.refreshState();assert.equal(networkCalls,calls);
 console.log('PASS real sign-out clears snapshot and prevents further state requests');
 console.log(JSON.stringify({status:'PASS',owner,job,revision:snapshot.revision,ticks:inputs.length,limits:['Transport faults injected around real HTTP','Full launcher DOM not exercised','Actual JWT wall-clock expiry not exercised']}));
}finally{
 for(const b of bindings)b.destroy();await client.auth.signOut().catch(()=>{});
 console.log(JSON.stringify({status:'CLEANUP_REQUIRED',owner,job}));
}
