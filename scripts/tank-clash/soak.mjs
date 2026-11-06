// Real-time, separate-process loopback measurement. Does not call any Supabase endpoint.
import { fork } from 'node:child_process';
import { mkdirSync, writeFileSync, appendFileSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { createHash } from 'node:crypto';
import os from 'node:os';
import assert from 'node:assert/strict';
import { connectTankRoom } from '../../src/games/tank-clash/net-client.ts';
import { neutral } from '../../src/games/tank-clash/engine.ts';
const arg = (name, fallback) => process.argv.find(x => x.startsWith(`--${name}=`))?.slice(name.length + 3) ?? fallback;
const duration = Number(arg('duration', '1800')), peak = Number(arg('peak', '10'));
assert(duration >= 20 && duration <= 7200 && Number.isInteger(peak) && peak >= 1 && peak <= 10, 'duration 20..7200 s; peak 1..10 rooms of EACH format');
const output = resolve(arg('output', 'test-results/tank-tc2-soak.json')); mkdirSync(dirname(output), { recursive: true });
const samplesFile = output.replace(/\.json$/, '') + '.jsonl';writeFileSync(samplesFile, '');
const files = ['server/tank-clash-room/server.mjs', 'server/tank-clash-room/config.mjs', 'src/games/tank-clash/room.ts', 'src/games/tank-clash/net-client.ts', 'scripts/tank-clash/soak.mjs', 'scripts/tank-clash/ops-worker.mjs', 'src/games/tank-clash/engine.ts', 'src/games/tank-clash/maps.ts', 'src/games/tank-clash/protocol.ts'];
const sourceDigest = createHash('sha256').update(files.map(f => readFileSync(f)).join('\n')).digest('hex');
const worker = fork(new URL('./ops-worker.mjs', import.meta.url), [], { execArgv: ['--expose-gc'], stdio: ['ignore', 'ignore', 'inherit', 'ipc'] });
const delay = ms => new Promise(r => setTimeout(r, ms));
let nextRequest = 0, url, crashed, stop = false, failure = null, id = 0, squadGroups = 0, lastTick = performance.now(), accumulator = 0, tick = 0, balancing = false;
const pending = new Map(), groups = [], samples = [], matched = { '1v1': 0, '2v2': 0, queue2v2: 0 }, results = new Set(), failures = [];
worker.on('message', msg => { if (msg.type === 'ready') url = msg.url; else if (msg.type === 'stats') { pending.get(msg.id)?.(msg.value);pending.delete(msg.id); } });
worker.on('exit', code => { if (!stop) crashed = Error(`benchmark server exited (${code})`); });
async function until(check, ms = 10000) { const deadline = performance.now() + ms;while(performance.now() < deadline){if(crashed)throw crashed;if(check())return;await delay(15);}throw Error('benchmark condition timed out'); }
async function stats(gc = false) {const id=++nextRequest;return Promise.race([new Promise(r=>{pending.set(id,r);worker.send({type:'stats',id,gc});}),delay(5000).then(()=>{throw Error('metrics timed out');})]);}
function input(c, phase) {
 const s=c.session.view();if(!s)return neutral();const me=s.tanks[0],foes=s.tanks.filter(t=>t.team!==me.team&&t.hp>0);if(!foes.length)return neutral(me.aim);
 const foe=foes.reduce((a,b)=>Math.hypot(a.x-me.x,a.y-me.y)<Math.hypot(b.x-me.x,b.y-me.y)?a:b);
 return {x:Math.cos(tick/53+phase),y:Math.sin(tick/41+phase*2),aim:Math.atan2(foe.y-me.y,foe.x-me.x)+Math.sin(tick/37+phase)*.15,fire:(tick+phase*7)%23===0,shield:tick%400===120};
}
async function createGroup(format) {
 const n=format==='1v1'?2:4,queue=format==='2v2'&&++squadGroups%2===0,g={format,queue,cs:[],closing:false,pinging:0};groups.push(g);const number=++id;
 try {
  g.cs=Array.from({length:n},(_,i)=>connectTankRoom(url,{name:`Test ${number}-${i}`,token:()=>`local-soak-${number}-${i}`,storage:null}));
  await until(()=>g.cs.every(c=>c.status==='open'));
  if(queue){for(const c of g.cs){c.session.queue();await until(()=>c.session.queueStatus||c.session.room);}}
  else{g.cs[0].session.create(undefined,format);await until(()=>g.cs[0].session.code);for(const c of g.cs.slice(1)){c.session.join(g.cs[0].session.code);await until(()=>c.session.seat);}g.cs.forEach(c=>c.session.ready(true));}
  await until(()=>g.cs.every(c=>c.session.room?.phase==='playing'));
  assert.equal(new Set(g.cs.map(c=>c.session.code)).size,1);return g;
 } catch(e){g.closing=true;g.cs.forEach(c=>c.close());groups.splice(groups.indexOf(g),1);throw e;}
}
async function retire(g, completed) {
 g.closing=true;
 if(completed){const rs=g.cs.map(c=>c.session.result);assert(rs.every(Boolean));for(const r of rs)assert.deepEqual(r,rs[0]);assert(!results.has(rs[0].matchId),'duplicate match completion');results.add(rs[0].matchId);matched[g.format]++;if(g.queue)matched.queue2v2++;}
 g.cs.forEach(c=>c.session.leave());await until(()=>g.cs.every(c=>!c.session.room&&!c.session.queueStatus),3000);g.cs.forEach(c=>c.close());groups.splice(groups.indexOf(g),1);
}
const targetAt = seconds => seconds < duration*.16 ? Math.min(2,peak) : seconds < duration*.33 ? Math.min(5,peak) : seconds < duration*.75 ? peak : Math.min(2,peak);
let timer;
const began=performance.now();let nextSample=0,nextLog=0;
try {
 await until(()=>url);
 timer=setInterval(()=>{
  try{const now=performance.now();accumulator=Math.min(.1,accumulator+(now-lastTick)/1000);lastTick=now;while(accumulator>=1/60){tick++;for(const g of groups)if(!g.closing)g.cs.forEach((c,i)=>c.session.tick(input(c,i)));accumulator-=1/60;}}
  catch(e){failure=e;}
 },8);
 while((performance.now()-began)/1000<duration){
  if(failure||crashed)throw failure||crashed;
  const elapsed=(performance.now()-began)/1000;
  for(const g of [...groups])if(!g.closing&&g.cs.length&&g.cs.every(c=>c.session.result))await retire(g,true);
  const target=targetAt(elapsed);
  for(const format of ['1v1','2v2']){
   const current=groups.filter(g=>g.format===format&&!g.closing);
   if(current.length>target)await retire(current.at(-1),false);
   else if(current.length<target)await createGroup(format);
  }
  for(const g of groups)if(elapsed-g.pinging>=1){g.cs.forEach(c=>c.session.ping());g.pinging=elapsed;}
  if(elapsed>=nextSample){const sample={elapsed:+elapsed.toFixed(2),targetPerFormat:target,matches:{...matched},...(await stats(true))};samples.push(sample);appendFileSync(samplesFile,JSON.stringify(sample)+'\n');nextSample=elapsed+10;}
  if(elapsed>=nextLog){const s=samples.at(-1);console.log(JSON.stringify({seconds:Math.round(elapsed),players:s.transport.open,rooms:s.rooms,matches:matched,rssMiB:+(s.memory.rss/1048576).toFixed(1),loopP95Ms:+s.eventLoopP95Ms.toFixed(2)}));nextLog=elapsed+60;}
  await delay(100);
 }
 clearInterval(timer);
 for(const g of [...groups])await retire(g,false);
 await until(()=>groups.length===0);let final=await stats(true);for(let i=0;i<30&&final.transport.open;i++){await delay(100);final=await stats(true);}
 assert.deepEqual(final.retained,{rooms:0,peers:0,users:0,queueEntries:0,queuedUsers:0},'closed clients must free every live entry');assert.equal(final.transport.open,0);
 if(duration>=1800){assert(matched['1v1']>=10&&matched['2v2']>=10,'30-minute run needs at least 10 completed matches per format');assert(matched.queue2v2>0,'queue matches must be exercised');}
 const listenerCounts=new Set(samples.map(s=>s.listeners));assert.equal(listenerCounts.size,1,'connection listeners must not accumulate');
 const cpu=samples.slice(1).map((s,i)=>(s.cpuMicros.user+s.cpuMicros.system-samples[i].cpuMicros.user-samples[i].cpuMicros.system)/((s.elapsed-samples[i].elapsed)*10000));
 const report={scope:'Real-time loopback, scripted clients, separate Node server; fixture identities; not VPS/mobile/Internet/Auth acceptance',sourceDigest,durationSeconds:+((performance.now()-began)/1000).toFixed(1),host:{platform:os.platform(),arch:os.arch(),cpus:os.cpus().length,node:process.version},completed:matched,maxPlayers:Math.max(...samples.map(s=>s.transport.open)),maxRooms:Math.max(...samples.map(s=>s.rooms)),maxRssMiB:+(Math.max(...samples.map(s=>s.memory.rss))/1048576).toFixed(1),maxCpuPercentOneCore:+Math.max(0,...cpu).toFixed(1),eventLoopP95Ms:+final.eventLoopP95Ms.toFixed(2),finalRetained:final.retained,samples:samples.length,failures};
 writeFileSync(output,JSON.stringify(report,null,2)+'\n');console.log('PASS '+JSON.stringify(report));
} catch(e){failure=e;failures.push(e.message);writeFileSync(output,JSON.stringify({sourceDigest,failures,samples},null,2)+'\n');console.error(e);process.exitCode=1;}
finally{stop=true;clearInterval(timer);for(const g of groups)g.cs.forEach(c=>c.close());if(worker.connected)worker.send({type:'stop'});const timeout=setTimeout(()=>worker.kill('SIGKILL'),3000);timeout.unref();}
