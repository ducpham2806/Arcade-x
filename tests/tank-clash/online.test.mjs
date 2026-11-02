import test from 'node:test';
import assert from 'node:assert/strict';
import { WebSocket, WebSocketServer } from '../../server/tank-clash/node_modules/ws/wrapper.mjs';
import { createRoomServer } from '../../server/tank-clash/server.mjs';
import { TankRoomClient, roomEndpoint } from '../../src/games/tank-clash/online-client.ts';
import { PROTOCOL, packGame } from '../../src/games/tank-clash/protocol.ts';
import { neutral } from '../../src/games/tank-clash/engine.ts';
const delay=ms=>new Promise(r=>setTimeout(r,ms));
async function until(predicate,ms=5000){const end=performance.now()+ms;while(performance.now()<end){if(predicate())return;await delay(10);}throw new Error('Timed out: '+predicate);}
const memory=()=>{const map=new Map();return{getItem:k=>map.get(k)||null,setItem:(k,v)=>map.set(k,v),removeItem:k=>map.delete(k)};};
const makeClient=(url,storage=memory())=>new TankRoomClient({endpoint:url,storage,socketFactory:(url,p)=>new WebSocket(url,p)});
test('client: endpoint normalization rejects URL credentials, query tokens, and invalid schemes',()=>{
 assert.equal(roomEndpoint('http://localhost:3000'),'ws://localhost:3000/room');
 for(const value of ['https://user:pass@host/room','ws://host/?token=secret','file:///room','ws://host/#secret'])assert.throws(()=>roomEndpoint(value));
});
test('real WebSocket: join, B controls B, resync walls, resume same HP, rematch, leave and clean shutdown',async()=>{
 const server=await createRoomServer({review:true,roomOptions:{countdownMs:50}});const storage=memory(),a=makeClient(server.url,storage),b=makeClient(server.url);let a2;
 try{
  assert.equal((await (await fetch(server.httpUrl+'/health')).json()).review,true);
  a.connect('create','','Anh A');await until(()=>a.room?.code);b.connect('join',a.room.code,'Anh B');await until(()=>a.room?.players.length===2&&b.status==='connected');assert.equal(b.id,'b');
  await Promise.all([a.command('ready',true),b.command('ready',true)]);await until(()=>a.room?.phase==='playing'&&b.room?.phase==='playing');
  const bx=b.authority.tanks[1].x,ay=a.authority.tanks[0].y;
  for(let i=0;i<24;i++){a.sample({...neutral(),y:-1});b.sample({...neutral(),x:-1});await delay(17);}
  await delay(200);assert.ok(b.authority.tanks[1].x<bx-20);assert.ok(a.authority.tanks[0].y<ay-20);
  // Missing wall revisions request a full snapshot rather than predicting through old terrain.
  a.wallsRevision=-123;await until(()=>a.wallsRevision===server.manager.rooms.get(a.room.code).wallsRevision);
  const session=server.manager.rooms.get(a.room.code);session.game.tanks[0].hp=1;await until(()=>a.authority.tanks[0].hp===1);
  a.close();a2=makeClient(server.url,storage);a2.connect('resume');await until(()=>a2.status==='connected');assert.equal(a2.id,'a');assert.equal(a2.authority.tanks[0].hp,1);
  server.manager.finish(session,'finished','normal',0);await until(()=>a2.room.phase==='finished'&&b.room.phase==='finished');
  assert.deepEqual(packGame(a2.authority),packGame(b.authority));
  await a2.command('rematch',true);assert.equal(session.phase,'finished');await b.command('rematch',true);await until(()=>session.phase==='playing'&&b.room.phase==='playing');assert.equal(session.game.tanks[0].hp,3);
  await b.leave();await until(()=>a2.room.phase==='finished');assert.equal(a2.authority.winner,0);assert.equal(a2.room.reason,'forfeit');assert.equal(a2.room.players.length,1);
  await server.close();await until(()=>a2.status==='error');assert.match(a2.notice,/Máy chủ/);
 }finally{a.close();b.close();a2?.close();await server.close();}
});
// Application-level fault proxy: delay both directions, jitter, duplicate commands, drop selected snapshots.
// TCP itself remains reliable; this intentionally tests stale/lost application snapshots.
async function faultProxy(target,{rtt,loss}){
 let seed=123456789,seen=0,dropped=0;const timers=new Set(),sockets=new Set(),random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/2**32;};
 const wss=new WebSocketServer({port:0,host:'127.0.0.1',handleProtocols:p=>p.has(PROTOCOL)?PROTOCOL:false});await new Promise(r=>wss.once('listening',r));
 const later=(ws,data,extra=0)=>{const timer=setTimeout(()=>{timers.delete(timer);if(ws.readyState===1)ws.send(data);},Math.max(0,rtt/2+(random()-.5)*60+extra));timers.add(timer);};
 wss.on('connection',front=>{const back=new WebSocket(target,PROTOCOL),queue=[];sockets.add(front);sockets.add(back);
  back.on('open',()=>{for(const data of queue)later(back,data);});
  front.on('message',data=>{const text=data.toString();if(back.readyState===1)later(back,text);else queue.push(text);if(text.includes('"type":"command"'))later(back,text,80);});
  back.on('message',data=>{const text=data.toString(),msg=JSON.parse(text);if(msg.type==='state'){seen++;if(random()<loss){dropped++;return;}}later(front,text);});
  front.on('close',()=>back.close());back.on('close',()=>front.close());front.on('error',()=>{});back.on('error',()=>{});
 });
 return{url:`ws://127.0.0.1:${wss.address().port}/room`,stats:()=>({seen,dropped}),async close(){for(const t of timers)clearTimeout(t);for(const ws of sockets)ws.terminate();await new Promise(r=>wss.close(r));}};
}
for(const [rtt,loss]of [[80,.01],[150,.02],[250,.03]])test(`fault network: ${rtt}ms RTT ±30ms per hop, ${loss*100}% snapshot loss; clients converge`,async()=>{
 const server=await createRoomServer({review:true,roomOptions:{countdownMs:400}}),proxy=await faultProxy(server.url,{rtt,loss}),a=makeClient(proxy.url),b=makeClient(proxy.url);
 try{
  a.connect('create');await until(()=>a.room);b.connect('join',a.room.code);await until(()=>b.status==='connected'&&b.room?.players.length===2);await Promise.all([a.command('ready',true),b.command('ready',true)]);await until(()=>a.room.phase==='playing'&&b.room.phase==='playing');
  const room=server.manager.rooms.get(a.room.code),started=performance.now(),bytesAtStart=server.metrics.sentBytes;
  for(let i=0;i<90;i++){a.sample({...neutral(),x:i<45?1:-1,aim:0,fire:i%40===0});b.sample({...neutral(),y:i<45?-1:1,aim:Math.PI,shield:i===25});await delay(17);}
  a.neutralize();b.neutralize();await delay(550);server.manager.finish(room,'finished','normal',null);
  await until(()=>a.room.phase==='finished'&&b.room.phase==='finished');assert.deepEqual(packGame(a.authority),packGame(b.authority));assert.equal(server.manager.metrics.matches,1);assert.equal(a.status,'connected');assert.equal(b.status,'connected');
  console.log(JSON.stringify({scenario:'local application fault proxy',rtt,loss,elapsedMs:Math.round(performance.now()-started),snapshotProxy:proxy.stats(),rttMeasured:Math.round(a.rtt),corrections:a.metrics.corrections,maxCorrection:Math.round(a.metrics.maxCorrection),outboundBytes:server.metrics.sentBytes,windowKBpsPerClient:Number(((server.metrics.sentBytes-bytesAtStart)/2/((performance.now()-started)/1000)/1024).toFixed(2))}));
 }finally{a.close();b.close();await proxy.close();await server.close();}
});
test('server: production admission fails closed; wrong origin rejected; malformed JSON values do not crash server',async()=>{
 await assert.rejects(createRoomServer(),/verification/);const server=await createRoomServer({review:true});
 try{
  const denied=new WebSocket(server.url,PROTOCOL,{origin:'https://untrusted.example'});await new Promise(r=>denied.once('error',r));
  const ws=new WebSocket(server.url,PROTOCOL);await new Promise(r=>ws.once('open',r));const messages=[];ws.on('message',d=>messages.push(JSON.parse(d)));
  ws.send('null');ws.send('[]');ws.send(JSON.stringify({type:'hello',protocol:PROTOCOL,action:'create'}));await until(()=>messages.some(m=>m.type==='welcome'));assert.ok(messages.some(m=>m.code==='BAD_REQUEST'));ws.close();
 }finally{await server.close();}
});
test('client: an interrupted transport reconnects automatically without replaying a queued shot',async()=>{
 const server=await createRoomServer({review:true,roomOptions:{countdownMs:40}}),sockets=[],storage=memory();
 const a=new TankRoomClient({endpoint:server.url,storage,socketFactory:(url,p)=>{const ws=new WebSocket(url,p);sockets.push(ws);return ws;}}),b=makeClient(server.url);
 try{
  a.connect('create');await until(()=>a.status==='connected');b.connect('join',a.room.code);await until(()=>b.status==='connected');await Promise.all([a.command('ready',true),b.command('ready',true)]);await until(()=>a.room.phase==='playing');
  const room=server.manager.rooms.get(a.room.code);room.game.tanks[0].hp=2;a.sample({...neutral(),fire:true});await delay(80);const shots=room.game.statsByPlayer.a.shots;
  sockets[0].terminate();await until(()=>a.metrics.reconnects===1);assert.equal(room.game.tanks[0].hp,2);await delay(150);assert.equal(room.game.statsByPlayer.a.shots,shots);assert.equal(room.seats.size,2);
  assert.ok(!storage.getItem('tank-clash:p2').includes('accessToken'));assert.ok(!a.inviteLink().includes('resumeToken'));
 }finally{a.close();b.close();await server.close();}
});
