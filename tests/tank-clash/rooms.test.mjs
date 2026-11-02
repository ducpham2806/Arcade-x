import test from 'node:test';
import assert from 'node:assert/strict';
import { TankRooms } from '../../server/tank-clash/rooms.mjs';
import { makeAccountVerifier } from '../../server/tank-clash/auth.mjs';
import { neutral, CONFIG } from '../../src/games/tank-clash/engine.ts';
import { packGame, unpackGame } from '../../src/games/tank-clash/protocol.ts';
function fixture(options={}) {
  let now=1000;const rooms=new TankRooms({review:true,now:()=>now,...options});
  const a=rooms.create(null,'A'),b=rooms.join(null,a.room.code,'B');rooms.bind(a,'A');rooms.bind(b,'B');
  const advance=ms=>{for(let end=now+ms;now<end;){now=Math.min(end,now+17);rooms.advance();}};
  const begin=()=>{rooms.command(a,'ready_a_01','ready',true);rooms.command(b,'ready_b_01','ready',true);advance(3001);assert.equal(a.room.phase,'playing');};
  return{rooms,a,b,advance,begin,now:()=>now};
}
const throws=(fn,code)=>assert.throws(fn,e=>e.code===code);
test('rooms: codes, capacity, isolation, host transfer, and untrusted labels',()=>{
 const f=fixture();assert.match(f.a.room.code,/^[A-Z2-9]{6}$/);throws(()=>f.rooms.join(null,f.a.room.code,'C'),'ROOM_FULL');
 const other=f.rooms.create(null,'<script>');assert.equal(other.seat.name,'script');assert.notEqual(other.room,f.a.room);
 f.rooms.command(f.a,'leave_a_01','leave');assert.equal(f.b.room.host,'b');assert.equal(f.b.room.seats.size,1);
 const newA=f.rooms.join(null,f.b.room.code,'new A');assert.equal(newA.seat.id,'a');assert.equal(other.room.seats.size,1);
});
test('rooms: ready is idempotent, disconnected countdown cancels, both rematch votes required',()=>{
 const f=fixture();const ack=f.rooms.command(f.a,'ready_a_01','ready',true);f.rooms.command(f.a,'ready_a_01','ready',false);assert.equal(f.a.seat.ready,true);
 assert.deepEqual(f.rooms.command(f.a,'ready_a_01','ready',true),ack);f.rooms.command(f.b,'ready_b_01','ready',true);assert.equal(f.a.room.phase,'countdown');
 f.rooms.disconnected(f.b,'B');assert.equal(f.a.room.phase,'lobby');assert.equal(f.a.seat.ready,false);
 f.rooms.resume(null,f.b.room.code,f.b.token);f.rooms.bind(f.b,'B2');f.rooms.command(f.a,'ready_a_02','ready',true);f.rooms.command(f.b,'ready_b_02','ready',true);f.advance(3001);
 f.rooms.finish(f.a.room,'finished','normal',0);f.rooms.command(f.a,'rematch_a1','rematch',true);assert.equal(f.a.room.phase,'finished');
 f.rooms.command(f.b,'rematch_b1','rematch',true);assert.equal(f.a.room.phase,'countdown');assert.equal(f.rooms.metrics.matches,3);assert.deepEqual(f.a.room.game.scores,[0,0]);
});
test('rooms: authority rejects forged position and stale epochs; duplicate input cannot accelerate simulation',()=>{
 const f=fixture();f.begin();const s=f.a.room.game,startX=s.tanks[0].x;
 assert.equal(f.rooms.input(f.a,{epoch:f.a.room.epoch,frames:[{seq:0,input:{...neutral(),x:1,hp:999}}]}),false);
 assert.equal(f.rooms.input(f.a,{epoch:'old',frames:[{seq:0,input:neutral()}]}),false);
 assert.equal(f.rooms.input(f.a,{epoch:f.a.room.epoch,frames:[{seq:1000,input:neutral()}]}),false);
 const frames=Array.from({length:6},(_,seq)=>({seq,input:{...neutral(),x:1}}));
 f.rooms.input(f.a,{epoch:f.a.room.epoch,frames});f.rooms.input(f.a,{epoch:f.a.room.epoch,frames});assert.equal(f.a.seat.queue.length,6);
 f.rooms.advance();assert.equal(s.tanks[0].x,startX);f.advance(120);assert.ok(s.tanks[0].x-startX<=CONFIG.speed*.12);assert.equal(f.a.seat.ack,5);assert.equal(s.tanks[1].hp,3);
});
test('rooms: resume retains HP, old connection close ignored, token is bound to room and verified user',()=>{
 const f=fixture();f.begin();f.a.room.game.tanks[0].hp=1;f.rooms.disconnected(f.a,'A');f.advance(1000);
 const resumed=f.rooms.resume(null,f.a.room.code,f.a.token);f.rooms.bind(resumed,'newA');f.rooms.disconnected(f.a,'A');assert.equal(resumed.seat.connected,true);assert.equal(resumed.room.game.tanks[0].hp,1);
 throws(()=>f.rooms.resume(null,f.b.room.code,'f'.repeat(64)),'RESUME_EXPIRED');
 const secure=new TankRooms();throws(()=>secure.create(null,'x'),'AUTH_REQUIRED');const user={userId:'one'},session=secure.create(user,'x');
 throws(()=>secure.create(user,'again'),'ALREADY_IN_ROOM');throws(()=>secure.resume({userId:'two'},session.room.code,session.token),'RESUME_EXPIRED');
 assert.equal(secure.resume(user,session.room.code,session.token).seat,session.seat);
});
test('rooms: reconnect grace forfeits once; both absent abort; result seats eventually release',()=>{
 const f=fixture();f.begin();f.rooms.disconnected(f.a,'A');f.advance(19980);assert.equal(f.a.room.phase,'playing');f.advance(40);
 assert.equal(f.a.room.phase,'finished');assert.equal(f.a.room.game.winner,1);assert.equal(f.a.room.reason,'disconnect');f.advance(30);assert.equal(f.a.room.seats.size,1);
 const g=fixture();g.begin();g.rooms.disconnected(g.a,'A');g.rooms.disconnected(g.b,'B');g.advance(20010);assert.equal(g.a.room.phase,'aborted');assert.equal(g.a.room.game.winner,null);
});
test('rooms: input queues clear on round changes; packet roundtrip preserves both stats and wall destruction',()=>{
 const f=fixture();f.begin();const old=f.a.room.epoch;f.a.room.game.remaining=.001;f.advance(34);assert.equal(f.a.room.game.status,'roundEnd');
 f.rooms.input(f.a,{epoch:old,frames:[{seq:0,input:{...neutral(),fire:true}}]});f.advance(2100);assert.notEqual(f.a.room.epoch,old);assert.equal(f.a.seat.queue.length,0);assert.equal(f.a.seat.ack,-1);
 const s=f.a.room.game;s.statsByPlayer.b.shots=4;s.walls.find(w=>w.kind==='brick').hp=0;f.a.room.seq++;
 const restored=unpackGame(f.rooms.packet(f.a.room,f.b.seat,true),null);assert.deepEqual(packGame(restored),packGame(s));assert.equal(restored.walls.find(w=>w.kind==='brick').hp,0);
});
test('rooms: explicit leave forfeits; malformed commands cannot mutate state; idle room expires',()=>{
 const f=fixture();assert.equal(f.rooms.command(f.a,'x','ready',true).ok,false);f.begin();f.rooms.command(f.b,'leave_b_01','leave');assert.equal(f.a.room.game.winner,0);assert.equal(f.a.room.reason,'forfeit');
 const g=fixture();g.advance(600100);assert.equal(g.rooms.rooms.size,0);
});
test('auth: verified getUser identity and allowlist, never self-reported metadata',async()=>{
 assert.throws(()=>makeAccountVerifier({allowedUserIds:[]}));let tokenSeen;
 const verify=makeAccountVerifier({allowedUserIds:['good'],client:{auth:{getUser:async token=>{tokenSeen=token;return token==='jwt-good'?{data:{user:{id:'good'}},error:null}:token==='spoof'?{data:{user:{id:'bad',user_metadata:{admin:true}}},error:null}:{data:null,error:new Error()};}}}});
 assert.deepEqual(await verify('jwt-good'),{userId:'good'});assert.equal(tokenSeen,'jwt-good');
 await assert.rejects(verify('spoof'),/ACCESS_DENIED/);await assert.rejects(verify('invalid'),/AUTH_REQUIRED/);await assert.rejects(verify(''),/AUTH_REQUIRED/);
});
