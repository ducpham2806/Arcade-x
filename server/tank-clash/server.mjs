import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { randomUUID } from 'node:crypto';
import { WebSocketServer, WebSocket } from 'ws';
import { TankRooms, RoomError } from './rooms.mjs';
import { PROTOCOL } from '../../src/games/tank-clash/protocol.ts';
import { makeAccountVerifier } from './auth.mjs';
const folder = dirname(fileURLToPath(import.meta.url));

export async function createRoomServer({ port=0, host='127.0.0.1', review=false, authenticate,
  allowedOrigins=[], staticDirectory=resolve(folder,'../../preview/tank-clash'), roomOptions={} }={}) {
  if (!review && typeof authenticate!=='function') throw new Error('Account verification is required outside review mode.');
  if (!review && !allowedOrigins.length) throw new Error('Explicit allowedOrigins is required outside review mode.');
  const manager=new TankRooms({...roomOptions,review}), connections=new Map(), sessions=new Map();
  const metrics={sentBytes:0,receivedBytes:0,snapshots:0,backpressureCloses:0};
  let stopped=false,actualPort=port;
  const send=(ws,message)=>{
    if(ws.readyState!==WebSocket.OPEN)return false;
    if(ws.bufferedAmount>65536){metrics.backpressureCloses++;ws.close(1013,'Resync required');return false;}
    const text=JSON.stringify(message);metrics.sentBytes+=Buffer.byteLength(text);ws.send(text);return true;
  };
  const broadcast=(room,full=false)=>{
    if(!manager.rooms.has(room.code))return; room.seq++;
    for(const seat of room.seats.values())if(seat.connected){const ws=connections.get(seat.connection);if(ws&&send(ws,manager.packet(room,seat,full)))metrics.snapshots++;}
  };
  const http=createServer(async(req,res)=>{
    const pathname=new URL(req.url,'http://local').pathname;
    if(pathname==='/health'){res.writeHead(200,{'Content-Type':'application/json','Cache-Control':'no-store'});res.end(JSON.stringify({protocol:PROTOCOL,review,rooms:manager.rooms.size}));return;}
    const name=pathname==='/'||pathname==='/index.html'?'index.html':['/room-lab.html','/devices.html'].includes(pathname)?pathname.slice(1):null;
    if(!name||req.method!=='GET'){res.writeHead(404);res.end('Not found');return;}
    try{const html=await readFile(resolve(staticDirectory,name));res.writeHead(200,{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer'});res.end(html);}
    catch{res.writeHead(503,{'Content-Type':'text/plain; charset=utf-8'});res.end('Bản thử chưa được build. Chạy node scripts/export-tank-review.mjs.');}
  });
  const wss=new WebSocketServer({noServer:true,maxPayload:16384,perMessageDeflate:false,handleProtocols:protocols=>protocols.has(PROTOCOL)?PROTOCOL:false});
  http.on('upgrade',(req,socket,head)=>{
    const origin=req.headers.origin,localOrigins=[`http://localhost:${actualPort}`,`http://127.0.0.1:${actualPort}`];
    const permitted=origin?allowedOrigins.includes(origin)||(review&&localOrigins.includes(origin)):review;
    if(stopped||new URL(req.url,'http://local').pathname!=='/room'||!permitted||connections.size>=160){socket.write('HTTP/1.1 403 Forbidden\r\nConnection: close\r\n\r\n');socket.destroy();return;}
    wss.handleUpgrade(req,socket,head,ws=>wss.emit('connection',ws,req));
  });
  wss.on('connection',ws=>{
    const connection=randomUUID();connections.set(connection,ws);let session=null,handshaking=false,lastHeard=performance.now(),windowAt=lastHeard,packets=0;
    const fail=(error,fatal=false)=>{send(ws,{type:'error',code:error instanceof RoomError?error.code:typeof error?.message==='string'&&['AUTH_REQUIRED','ACCESS_DENIED'].includes(error.message)?error.message:'BAD_REQUEST',fatal});if(fatal)ws.close(1008,'Admission failed');};
    const handshakeTimer=setTimeout(()=>{if(!session)ws.close(1008,'Handshake timeout');},5000);
    ws.on('pong',()=>lastHeard=performance.now());
    ws.on('message',async raw=>{
      lastHeard=performance.now();metrics.receivedBytes+=raw.length;
      if(lastHeard-windowAt>=1000){windowAt=lastHeard;packets=0;}if(++packets>90){ws.close(1008,'Rate limit');return;}
      let msg;try{msg=JSON.parse(raw.toString());}catch{fail(new RoomError('BAD_REQUEST'));return;}
      if(!msg||typeof msg!=='object'||Array.isArray(msg)){fail(new RoomError('BAD_REQUEST'));return;}
      if(!session){
        if(handshaking)return;
        if(msg.type!=='hello'||msg.protocol!==PROTOCOL||ws.protocol!==PROTOCOL){fail(new RoomError('PROTOCOL_MISMATCH'),true);return;}
        handshaking=true;
        try{
          const user=review?null:await authenticate(msg.accessToken);
          if(stopped||ws.readyState!==WebSocket.OPEN)return;
          if(msg.action==='create')session=manager.create(user,msg.name);
          else if(msg.action==='join')session=manager.join(user,msg.code,msg.name);
          else if(msg.action==='resume')session=manager.resume(user,msg.code,msg.resumeToken);
          else throw new RoomError('BAD_REQUEST');
          const old=manager.bind(session,connection),oldSocket=connections.get(old);
          if(oldSocket){send(oldSocket,{type:'error',code:'SESSION_REPLACED',fatal:true});oldSocket.close(1008,'Session replaced');}
          sessions.set(connection,session);clearTimeout(handshakeTimer);
          session.room.seq++;
          send(ws,{type:'welcome',protocol:PROTOCOL,id:session.seat.id,resumeToken:session.token,nextSeq:session.seat.receivedSeq+1,state:manager.packet(session.room,session.seat,true)});
          broadcast(session.room,true);
        }catch(e){fail(e,true);}finally{handshaking=false;}
        return;
      }
      if(session.seat.connection!==connection){ws.close(1008,'Superseded');return;}
      if(msg.type==='ping'&&Number.isFinite(msg.at)){if(Number.isSafeInteger(msg.wallsAck)&&msg.wallsAck<=session.room.wallsRevision)session.seat.wallAck=msg.wallsAck;send(ws,{type:'pong',at:msg.at,serverNow:manager.now()});return;}
      if(msg.type==='input'){manager.input(session,msg);return;}
      if(msg.type==='sync'){session.room.seq++;send(ws,manager.packet(session.room,session.seat,true));return;}
      if(msg.type==='command'){
        const ack=manager.command(session,msg.opId,msg.action,msg.value);send(ws,ack);broadcast(session.room,true);
        if(msg.action==='leave'&&ack.ok){sessions.delete(connection);ws.close(1000,'Left room');}
        return;
      }
      fail(new RoomError('BAD_REQUEST'));
    });
    ws.on('close',()=>{clearTimeout(handshakeTimer);connections.delete(connection);sessions.delete(connection);if(session){manager.disconnected(session,connection);broadcast(session.room);}});
    ws.on('error',()=>{});
    ws.isAlive=()=>performance.now()-lastHeard<10000;
  });
  let snapshotAt=performance.now(),heartbeatAt=snapshotAt;
  const timer=setInterval(()=>{
    manager.advance();const now=performance.now();
    if(now-snapshotAt>=1000/12){snapshotAt=now;for(const room of manager.rooms.values())broadcast(room);}
    for(const [key,session]of sessions)if(!manager.rooms.has(session.room.code)){const ws=connections.get(key);if(ws){send(ws,{type:'error',code:'ROOM_EXPIRED',fatal:true});ws.close(1008,'Room expired');}}
    if(now-heartbeatAt>=3000){heartbeatAt=now;for(const ws of connections.values()){if(!ws.isAlive())ws.terminate();else if(ws.readyState===WebSocket.OPEN)ws.ping();}}
  },8);
  await new Promise((resolve,reject)=>{http.once('error',reject);http.listen(port,host,resolve);});actualPort=http.address().port;
  return{manager,metrics,port:actualPort,url:`ws://127.0.0.1:${actualPort}/room`,httpUrl:`http://127.0.0.1:${actualPort}`,
    async close(){if(stopped)return;stopped=true;clearInterval(timer);for(const room of manager.rooms.values()){manager.finish(room,'aborted','server_stop');broadcast(room,true);}for(const ws of connections.values()){send(ws,{type:'shutdown'});ws.close(1012,'Server restart');}const cutoff=setTimeout(()=>{for(const ws of connections.values())ws.terminate();},300);await new Promise(r=>wss.close(r));clearTimeout(cutoff);http.closeAllConnections();await new Promise(r=>http.close(r));} };
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
  const review=process.env.TANK_REVIEW_MODE==='1';
  const authenticate=review?undefined:makeAccountVerifier({url:process.env.SUPABASE_URL,publishableKey:process.env.SUPABASE_PUBLISHABLE_KEY,allowedUserIds:(process.env.TANK_ALLOWED_USER_IDS||'').split(',').map(s=>s.trim()).filter(Boolean)});
  const server=await createRoomServer({port:Number(process.env.PORT||3000),host:process.env.HOST||'127.0.0.1',review,authenticate,allowedOrigins:(process.env.TANK_ALLOWED_ORIGINS||'').split(',').filter(Boolean)});
  console.log(`Tank Clash ${review?'REVIEW':'ACCOUNT-GATED'} server ready on port ${server.port}`);
  let closing=false;const close=()=>{if(!closing){closing=true;server.close().then(()=>process.exit(0));}};process.on('SIGINT',close);process.on('SIGTERM',close);
}
