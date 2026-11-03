import test from 'node:test';
import assert from 'node:assert/strict';
import { tankEndpoint, accountEndpoint, registeredTokenProvider } from '../../src/games/tank-clash/access.ts';
import { admissionFromEnv, supabaseAuthenticator } from '../../server/tank-clash-room/auth.mjs';
import { createWorld, press } from './harness.mjs';
import { createRoomHost } from '../../src/games/tank-clash/room.ts';
import { NET, PROTOCOL, parseClientMessage } from '../../src/games/tank-clash/protocol.ts';
const jwt = exp => 'test.'+Buffer.from(JSON.stringify({exp})).toString('base64url')+'.test';
function match(){const world=createWorld(),a=world.client(),b=world.client();a.session.create();world.run(20);b.session.join(a.session.code);world.run(20);a.session.ready(true);b.session.ready(true);world.run(NET.countdownMs+50);return{world,a,b,s:world.host.inspect(a.session.code)};}
const output=session=>({data:{session},error:null});
test('account tokens only go to the exact configured endpoint over WSS or local development',()=>{
 assert.equal(accountEndpoint('wss://rooms.example/tank','wss://rooms.example/tank'),'wss://rooms.example/tank');
 assert.equal(accountEndpoint('ws://127.0.0.1:3223/tank','ws://127.0.0.1:3223/tank'),'ws://127.0.0.1:3223/tank');
 for(const [url,trusted]of [['wss://evil.example/tank','wss://rooms.example/tank'],['ws://rooms.example/tank','ws://rooms.example/tank'],['wss://rooms.example/tank',undefined]])assert.throws(()=>accountEndpoint(url,trusted));
 for(const url of ['wss://user:secret@rooms.example/tank','wss://rooms.example/tank?token=x','wss://rooms.example/tank#x','https://rooms.example/tank','wss://rooms.example/other'])assert.throws(()=>tankEndpoint(url));
});
test('registered token provider refreshes near expiry without anonymous sign-in or game writes',async()=>{
 let gets=0,refreshes=0;const user={id:'one',is_anonymous:false};
 const provider=registeredTokenProvider({auth:{getSession:async()=>{gets++;return output({access_token:'old',expires_at:1001,user});},refreshSession:async()=>{refreshes++;return output({access_token:'new',expires_at:2000,user});}}},()=>1_000_000);
 assert.equal(await provider(),'new');assert.equal(gets,1);assert.equal(refreshes,1);
});
test('registered token provider rejects signed-out, anonymous and failed-refresh sessions',async()=>{
 for(const session of [null,{access_token:'x',user:{id:'anon',is_anonymous:true}},{access_token:'x',expires_at:1,user:{id:'one'}}]){
 const provider=registeredTokenProvider({auth:{getSession:async()=>output(session),refreshSession:async()=>({data:{session:null},error:new Error('expired')})}},()=>1_000_000);await assert.rejects(provider());}
 await assert.rejects(registeredTokenProvider(null)());
});
test('production admission requires configured Auth plus testers and refuses guest bypass',()=>{
 for(const env of [{NODE_ENV:'production'},{NODE_ENV:'production',TANK_ALLOW_GUESTS:'1'},{NODE_ENV:'production',SUPABASE_URL:'https://x.supabase.co',SUPABASE_ANON_KEY:'anon'}])assert.throws(()=>admissionFromEnv(env));
 assert.equal(admissionFromEnv({}),undefined);
 assert.equal(typeof admissionFromEnv({NODE_ENV:'production',SUPABASE_URL:'https://x.supabase.co',SUPABASE_PUBLISHABLE_KEY:'sb_publishable_test',TANK_ALLOWED_USER_IDS:'one,two'}),'function');
});
test('Auth authorizes verified ID, denies editable admin metadata and anonymous identities',async()=>{
 const auth=supabaseAuthenticator({url:'https://staging.example',anonKey:'anon',allowedUserIds:['good'],fetchImpl:async(_url,init)=>({ok:true,json:async()=>init.headers.Authorization==='Bearer good'?{id:'good',is_anonymous:false}:{id:'bad',is_anonymous:init.headers.Authorization==='Bearer anonymous',user_metadata:{role:'admin',userId:'good'}}})});
 assert.equal((await auth('good')).userId,'good');assert.equal(await auth('bad'),null);assert.equal(await auth('anonymous'),null);
 const denyAll=supabaseAuthenticator({url:'https://staging.example',anonKey:'anon',allowedUserIds:[],fetchImpl:async()=>({ok:true,json:async()=>({id:'good'})})});assert.equal(await denyAll('good'),null);
});
test('Auth coalesces concurrent requests and never reuses a cached token beyond its expiry',async()=>{
 let now=1_000_000,calls=0;const token=jwt(1002),auth=supabaseAuthenticator({url:'https://staging.example',anonKey:'anon',now:()=>now,fetchImpl:async()=>{calls++;await new Promise(r=>setImmediate(r));return{ok:true,json:async()=>({id:'one'})};}});
 const identities=await Promise.all([auth(token),auth(token),auth(token)]);assert.equal(calls,1);assert.equal(identities[0].userId,'one');now=1_002_001;assert.equal(await auth(token),null);assert.equal(calls,1);
});
test('Auth times out, rejects secrets and never logs tokens in its error path',async()=>{
 const auth=supabaseAuthenticator({url:'https://staging.example',anonKey:'anon',timeoutMs:5,fetchImpl:(_url,init)=>new Promise((_,reject)=>init.signal.addEventListener('abort',()=>reject(new Error('abort'))))});assert.equal(await auth('private-jwt'),null);
 assert.throws(()=>supabaseAuthenticator({url:'https://staging.example',anonKey:'sb_secret_no'}));
 const service='x.'+Buffer.from(JSON.stringify({role:'service_role'})).toString('base64url')+'.x';assert.throws(()=>supabaseAuthenticator({url:'https://staging.example',anonKey:service}));
});
test('v2 rejects v1-shaped inputs, unknown envelope keys and prototype property message types',()=>{
 assert.equal(PROTOCOL,'tank-clash.p2.v2');
 for(const raw of [{type:'input',seq:0,inputs:[press()]},{type:'create',protocol:PROTOCOL,hp:99},{type:'__proto__'},{type:'constructor'},{type:'ready',ready:true}])assert.equal(parseClientMessage(raw),null);
});
test('late input from an earlier round cannot fire or move a tank in the next round',()=>{
 const{world,a,s}=match(),old=a.session.epoch;s.remaining=.001;world.run(2150);assert.equal(s.round,2);assert.notEqual(a.session.epoch,old);
 const before={x:s.tanks[0].x,shots:s.stats.shots};a.sendRaw({type:'input',epoch:old,seq:0,inputs:[press({x:1,fire:true})]});world.run(100);
 assert.equal(s.tanks[0].x,before.x);assert.equal(s.stats.shots,before.shots);assert.ok(world.host.metrics.staleInputs>0);
});
test('stale snapshot cannot restore destroyed walls, events or an earlier clock',()=>{
 const{world,a,s}=match(),old=structuredClone(a.last('start').snapshot);world.run(100);const current=structuredClone(a.last('snapshot').snapshot);
 current.walls=structuredClone(s.walls);current.walls.find(w=>w.kind==='brick').hp=0;current.tick+=1;a.session.receive({type:'snapshot',snapshot:current});
 const tick=a.session.view().tick;a.session.receive({type:'snapshot',snapshot:{...old,walls:s.walls,events:[{id:999999,type:'hit',x:0,y:0,time:999999}]}});
 assert.equal(a.session.view().tick,tick);assert.equal(a.session.view().walls.find(w=>w.kind==='brick').hp,0);assert.ok(!a.session.view().events.some(e=>e.id===999999));
 a.session.receive(a.last('start'));assert.equal(a.session.view().tick,tick);assert.equal(a.session.view().walls.find(w=>w.kind==='brick').hp,0);
});
test('ready/rematch receipt prevents duplicate commands from restarting countdown or voting in another match',()=>{
 const{world,a,b,s}=match();s.round=3;s.tanks[1].hp=0;world.run(40);assert.equal(a.session.room.phase,'finished');
 a.session.ready(true);world.run(20);const first=[...a.inbox].reverse().find(m=>m.type==='ack');const command={type:'ready',ready:true,opId:first.opId,context:a.session.room.matchId};
 b.session.ready(true);world.run(40);const countdown=a.session.room.countdownMs;world.run(50);a.sendRaw(command);world.run(20);assert.ok(a.session.room.countdownMs<=countdown);
 const oldStart=a.last('start');world.run(NET.countdownMs+30);const newId=a.session.matchId;a.session.receive(oldStart);assert.equal(a.session.matchId,newId);
 const next=world.host.inspect(a.session.code);next.round=3;next.tanks[1].hp=0;world.run(40);a.sendRaw(command);world.run(20);assert.equal(a.session.room.phase,'finished');assert.equal(a.session.room.seats.find(x=>x.id==='a').ready,false);
});
test('shutdown cancels an active match exactly once and closes all rooms',async()=>{
 const{world,a,b}=match();world.host.shutdown();world.run(20);assert.equal(a.last('result').result.reason,'cancelled');assert.equal(b.last('result').result.winner,null);assert.equal(world.host.rooms().length,0);assert.equal(world.host.metrics.results,1);world.host.shutdown();assert.equal(world.host.metrics.results,1);
 let resolve;const host=createRoomHost({authenticate:()=>new Promise(r=>{resolve=r;})});host.connect('pending',{send:()=>{}});
 const admission=host.message('pending',{type:'create',protocol:PROTOCOL,token:'valid'});host.shutdown();resolve({userId:'one',name:'One',guest:false});await admission;
 assert.equal(host.rooms().length,0);assert.equal(host.metrics.rooms,0);
});
