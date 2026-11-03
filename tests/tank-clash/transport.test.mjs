import test from 'node:test';
import assert from 'node:assert/strict';
import { createTankRoomServer } from '../../server/tank-clash-room/server.mjs';
import { WebSocket } from '../../server/tank-clash-room/node_modules/ws/wrapper.mjs';
import { connectTankRoom } from '../../src/games/tank-clash/net-client.ts';
import { NET } from '../../src/games/tank-clash/protocol.ts';
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
async function until(fn,ms=5000){const end=performance.now()+ms;while(performance.now()<end){if(fn())return;await sleep(10);}assert.fail('timeout: '+fn);}
function memory(){const map=new Map();return{getItem:k=>map.get(k)||null,setItem:(k,v)=>map.set(k,v),removeItem:k=>map.delete(k),all:()=>[...map.values()].join()};}
test('untrusted invite endpoint is rejected before any account token is requested',()=>{
 let tokens=0,sockets=0;assert.throws(()=>connectTankRoom('wss://evil.example/tank',{token:()=>{tokens++;return'secret';},trustedServerUrl:'wss://good.example/tank',socketFactory:()=>{sockets++;}}));assert.equal(tokens,0);assert.equal(sockets,0);
});
test('resume storage is bound to endpoint and cannot attach a seat on a different server',async()=>{
 const one=await createTankRoomServer(),two=await createTankRoomServer(),store=memory(),a=connectTankRoom(one.url,{storage:store});let b;
 try{a.session.create();await until(()=>a.session.seat);a.close();b=connectTankRoom(two.url,{storage:store});await until(()=>b.status==='open');assert.equal(b.session.code,null);assert.equal(two.roomHost.rooms().length,0);b.session.create();await until(()=>b.session.code);assert.equal(two.roomHost.rooms().length,1);assert.ok(!store.all().includes('access_token'));}
 finally{a.close();b?.close();await one.close();await two.close();}
});
test('fresh token is fetched per admission and reconnect; no JWT is persisted or replayed from a queue',async()=>{
 let tokens=0;const seen=[],server=await createTankRoomServer({authenticate:async token=>{seen.push(token);return token?.startsWith('fresh-')?{userId:'one',guest:false,name:'A'}:null;}}),store=memory();
 const a=connectTankRoom(server.url,{storage:store,trustedServerUrl:server.url,token:async()=>`fresh-${++tokens}`});
 try{a.session.create();await until(()=>a.session.seat);const code=a.session.code;[...server.wss.clients][0].terminate();await until(()=>seen.length===2&&a.status==='open'&&a.session.room?.seats[0].connected);assert.equal(a.session.code,code);assert.deepEqual(seen,['fresh-1','fresh-2']);assert.ok(!store.all().includes('fresh-'));}
 finally{a.close();await server.close();}
});
test('a silent application stream reconnects even if TCP never completes a close handshake',async()=>{
 const server=await createTankRoomServer(),sockets=[];let shift=0;const a=connectTankRoom(server.url,{storage:null,now:()=>performance.now()+shift,socketFactory:url=>{const socket=new WebSocket(url);sockets.push(socket);return socket;}});
 try{a.session.create();await until(()=>a.session.seat);const code=a.session.code;sockets[0].onmessage=null;sockets[0].close=()=>{};shift+=NET.clientStaleMs+100;await until(()=>sockets.length===2&&a.status==='open'&&a.session.room.seats[0].connected);assert.equal(a.session.code,code);assert.equal(server.roomHost.rooms().length,1);}
 finally{a.close();for(const socket of sockets)socket.terminate();await server.close();}
});
test('failed connection is bounded, failed resume never silently creates a new room',async()=>{
 let shift=0;const fake={readyState:0,bufferedAmount:0,close(){},send(){}};
 const noServer=connectTankRoom('ws://localhost:3223/tank',{storage:null,now:()=>performance.now()+shift,socketFactory:()=>fake});shift+=NET.connectTimeoutMs+1;await until(()=>noServer.status==='closed');noServer.close();
 const server=await createTankRoomServer(),store=memory();store.setItem('tank-clash.seat:v2',JSON.stringify({protocol:'tank-clash.p2.v2',endpoint:server.url,code:'ABCDEF',resumeToken:'a'.repeat(48)}));
 const invalid=connectTankRoom(server.url,{storage:store});try{await until(()=>invalid.status==='closed');assert.equal(server.roomHost.rooms().length,0);assert.equal(store.all(),'');}finally{invalid.close();await server.close();}
});
test('maintenance cancels the active match on both clients and stops automatic reconnect',async()=>{
 const server=await createTankRoomServer(),a=connectTankRoom(server.url,{storage:null}),b=connectTankRoom(server.url,{storage:null});
 try{a.session.create();await until(()=>a.session.code);b.session.join(a.session.code);await until(()=>b.session.seat);a.session.ready(true);b.session.ready(true);await until(()=>a.session.room.phase==='playing',4500);
 const health=await (await fetch(server.url.replace('ws:','http:').replace('/tank','/ready'))).json();assert.equal(health.ready,true);
 await server.close();await until(()=>a.status==='closed'&&b.status==='closed');assert.equal(a.session.result.reason,'cancelled');assert.equal(b.session.result.winner,null);assert.equal(a.session.error.code,'SERVER_RESTART');assert.equal(a.session.result.matchId,b.session.result.matchId);}
 finally{a.close();b.close();await server.close();}
});
test('public bind requires explicit origins and guest review authorization',async()=>{
 await assert.rejects(createTankRoomServer({host:'0.0.0.0'}),/ORIGINS/);
 await assert.rejects(createTankRoomServer({host:'0.0.0.0',allowedOrigins:['https://review.example']}),/review mode/);
});
test('staging HTTP serves only the built preview, injects public Auth config safely and has readiness',async()=>{
 const{mkdtemp,writeFile,rm}=await import('node:fs/promises'),{tmpdir}=await import('node:os'),{join}=await import('node:path');
 const dir=await mkdtemp(join(tmpdir(),'tank-preview-'));await writeFile(join(dir,'index.html'),'<!doctype html><!--TANK_CONFIG--><div id="app"></div>');
 const key='sb_publishable_test</script><script>unsafe';
 const server=await createTankRoomServer({staticDirectory:dir,publicAuth:{url:'https://staging.example',publishableKey:key}});
 try{const base=server.url.replace('ws:','http:').replace('/tank','');const response=await fetch(base+'/');const html=await response.text();assert.equal(response.status,200);assert.ok(!html.includes('</script><script>unsafe'));
 const config=JSON.parse(html.match(/type="application\/json">(.*?)<\/script>/)[1]);assert.equal(config.auth.publishableKey,key);assert.equal(config.auth.url,'https://staging.example');
 assert.ok(response.headers.get('content-security-policy').includes('https://staging.example'));assert.equal((await fetch(base+'/server.mjs')).status,404);assert.equal((await (await fetch(base+'/ready')).json()).protocol,'tank-clash.p2.v2');}
 finally{await server.close();await rm(dir,{recursive:true,force:true});}
});
