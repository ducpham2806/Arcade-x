/** Reproducible P2 checks. Virtual soak is not a wall-clock/Internet/device benchmark. */
import assert from 'node:assert/strict';
import { writeFile } from 'node:fs/promises';
import { monitorEventLoopDelay, performance } from 'node:perf_hooks';
import { createTankRoomServer } from '../server/tank-clash-room/server.mjs';
import { createRoomHost } from '../src/games/tank-clash/room.ts';
import { connectTankRoom } from '../src/games/tank-clash/net-client.ts';
import { PROTOCOL, NET } from '../src/games/tank-clash/protocol.ts';
const args=process.argv.slice(2),arg=(name,fallback)=>{const i=args.indexOf('--'+name);return i<0?fallback:args[i+1];};
const virtual=args.includes('--virtual'),rooms=Number(arg('rooms',virtual?8:16)),seconds=Number(arg('seconds',virtual?1800:60));
if(!Number.isInteger(rooms)||rooms<1||rooms>NET.maxRooms||!Number.isFinite(seconds)||seconds<1||seconds>3600)throw new Error('Use --rooms 1..64, --seconds 1..3600.');
const pause=ms=>new Promise(r=>setTimeout(r,ms));
const pulse=(phase,team)=>({x:0,y:Math.sin(phase/45+team)>0?1:-1,aim:team?Math.PI:0,fire:phase%25===0,shield:phase%250===0});
let report;
if(virtual){
 let time=1_000_000,serial=0,resumes=0,results=0;const seen=new Set();
 const host=createRoomHost({now:()=>time,onResult:r=>{assert.ok(!seen.has(r.matchId),'result must only occur once');seen.add(r.matchId);results++;}});
 const pairs=[];
 for(let i=0;i<rooms;i++){
  const pair=[];for(let team=0;team<2;team++){const c={id:`peer-${serial++}`,token:null,room:null,epoch:null,seq:0,result:null};c.handler={send:m=>{if(m.type==='joined'){c.token=m.resumeToken;c.room=m.room;c.seq=m.nextSeq;}if(m.type==='room')c.room=m.room;if(m.type==='start'||m.type==='snapshot')c.epoch=m.snapshot.epoch;if(m.type==='result'){c.result=m.result;c.room=m.room;}},close:()=>{}};host.connect(c.id,c.handler);pair.push(c);}
  host.message(pair[0].id,{type:'create',protocol:PROTOCOL});host.message(pair[1].id,{type:'join',protocol:PROTOCOL,code:pair[0].room.code});pairs.push(pair);
 }
 const id=()=>globalThis.crypto.getRandomValues(new Uint8Array(16)).reduce((s,n)=>s+n.toString(16).padStart(2,'0'),'');
 globalThis.gc?.();const heapBefore=process.memoryUsage().heapUsed,started=performance.now();
 for(let elapsed=0;elapsed<seconds*1000;elapsed+=100){
  time+=100;
  for(const pair of pairs){
   for(let team=0;team<2;team++){const c=pair[team];
    if(['lobby','finished'].includes(c.room.phase)&&!c.room.seats.find(s=>s.id===(team?'b':'a')).ready)host.message(c.id,{type:'ready',ready:true,context:c.room.matchId,opId:id()});
    if(c.room.phase==='playing')host.message(c.id,{type:'input',epoch:c.epoch,seq:c.seq,inputs:Array.from({length:4},(_,n)=>pulse(elapsed/16+n,team))});
    c.seq+=4;
   }
   if(pair[0].room.phase==='finished'&&pair[1].room.phase==='finished')assert.deepEqual(pair[0].result,pair[1].result);
  }
  host.advance(time);
  if(elapsed>0&&elapsed%60_000===0){const c=pairs[(elapsed/60_000)%pairs.length][0],before=host.inspect(c.room.code)?.tanks[0].hp;host.disconnect(c.id);c.id=`peer-${serial++}`;host.connect(c.id,c.handler);host.message(c.id,{type:'resume',protocol:PROTOCOL,code:c.room.code,resumeToken:c.token});assert.equal(host.inspect(c.room.code)?.tanks[0].hp,before);resumes++;}
  if(elapsed%10_000===0)await new Promise(r=>setImmediate(r));
 }
 host.shutdown();for(const pair of pairs)for(const c of pair)host.disconnect(c.id);await new Promise(r=>setImmediate(r));assert.equal(host.rooms().length,0);globalThis.gc?.();
 report={mode:'accelerated-authority-soak',virtualSeconds:seconds,rooms,realSeconds:+((performance.now()-started)/1000).toFixed(2),results,resumes,roomsAfterCleanup:host.rooms().length,
  heapBefore,heapAfterCleanup:process.memoryUsage().heapUsed,gcAvailable:!!globalThis.gc,metrics:host.metrics,limits:'Virtual time and synthetic inputs; not a real 30-minute wall-clock soak, mobile FPS or capacity certification.'};
}else{
 const server=await createTankRoomServer(),clients=[],pairs=[];let ticker;
 const until=async fn=>{const end=performance.now()+8000;while(!fn()){if(performance.now()>end)throw new Error('Admission/start timed out');await pause(10);}};
 try{
  for(let i=0;i<rooms;i++){const a=connectTankRoom(server.url,{storage:null}),b=connectTankRoom(server.url,{storage:null});clients.push(a,b);a.session.create();await until(()=>a.session.code);b.session.join(a.session.code);await until(()=>b.session.seat);a.session.ready(true);b.session.ready(true);pairs.push([a,b]);}
  await until(()=>pairs.every(p=>p[0].session.room.phase==='playing'));
  const lag=monitorEventLoopDelay({resolution:10});lag.enable();const started=performance.now(),cpu=process.cpuUsage(),bytes=server.transport.bytesOut;let phase=0;
  ticker=setInterval(()=>{phase++;for(const pair of pairs)for(let team=0;team<2;team++){const c=pair[team];if(c.session.room.phase==='finished'&&!c.session.room.seats.find(s=>s.id===c.session.seat).ready)c.session.ready(true);c.session.tick(pulse(phase,team));}},1000/60);
  await pause(seconds*1000);clearInterval(ticker);ticker=null;
  for(const pair of pairs){const[a,b]=pair;if(a.session.result&&b.session.result&&a.session.result.matchId===b.session.result.matchId)assert.deepEqual(a.session.result,b.session.result);assert.equal(a.status,'open');assert.equal(b.status,'open');}
  const elapsed=performance.now()-started,used=process.cpuUsage(cpu);lag.disable();
  report={mode:'real-websocket-loopback',seconds:+(elapsed/1000).toFixed(2),rooms,clients:clients.length,jsonOutboundKiBpsPerClient:+((server.transport.bytesOut-bytes)/1024/(elapsed/1000)/clients.length).toFixed(2),
   rssBytes:process.memoryUsage().rss,cpuPercent:+(((used.user+used.system)/1000)/elapsed*100).toFixed(2),eventLoopP95Ms:+(lag.percentile(95)/1e6).toFixed(2),metrics:server.roomHost.metrics,
   limits:'Server and load clients share one process/host. No Internet/TLS, independent-generator capacity or human/device claim.'};
 }finally{clearInterval(ticker);clients.forEach(c=>c.close());await server.close();assert.equal(server.roomHost.rooms().length,0);}
}
console.log(JSON.stringify(report,null,2));if(arg('output',null))await writeFile(arg('output',null),JSON.stringify(report,null,2)+'\n');
