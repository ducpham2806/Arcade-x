// Review-only: four players on one screen, each a full WordChainGame talking to the real room
// server (server.ts) through an in-browser store with the SQL contract (CAS, one active room per
// identity, presence guard, N-seat matchmaking). Imported only by review.tsx, never by the game.
import React,{useEffect,useMemo,useState} from 'react';
import {WordChainGame} from './index';
import {loadLexicon,type Lexicon} from './lexicon';
import {WordChainClient,RoomTransportError,type RoomRequest,type RoomSnapshot,type RoomTransport} from './online-client';
import {RoomError,WordChainRoomServer,type Room,type RoomStore} from './server';
import type {GameComponentProps} from '../../types';

const SEATS=['P1','P2','P3','P4'];
export class LocalRoomStore implements RoomStore{
 rooms=new Map<string,Room>();
 private copy=<T,>(v:T):T=>JSON.parse(JSON.stringify(v));
 private active(uid:string,except?:string){return [...this.rooms.values()].some(r=>r.status!=='closed'&&r.id!==except&&Object.values(r.members).includes(uid));}
 async create(room:Room){const e=this.rooms.get(room.id);if(e)return this.copy(e);if(this.active(room.members.P1!))throw new RoomError('ACTIVE_ROOM','Bạn đang ở một phòng khác.');this.rooms.set(room.id,this.copy(room));return this.copy(room);}
 async read(id:string){const r=this.rooms.get(id);return r?this.copy(r):null;}
 async byCode(code:string){const r=[...this.rooms.values()].find(x=>x.code===code);return r?this.copy(r):null;}
 async cas(version:number,next:Room){
  next=this.copy(next);const cur=this.rooms.get(next.id);
  if(!cur||cur.version!==version||next.version!==version+1)return null;
  if(next.expiryGuard?.seats.some(s=>((cur.lastSeen as Record<string,number>)[s]??cur.createdAt)>next.expiryGuard!.cutoff))return null;
  next.lastSeen=Object.fromEntries(Object.keys(next.members).map(k=>[k,Math.max((cur.lastSeen as Record<string,number>)[k]??cur.createdAt,(next.lastSeen as Record<string,number>)[k]??next.createdAt)]));
  delete next.expiryGuard;
  if(next.status!=='closed'&&Object.values(next.members).some(uid=>this.active(uid!,next.id)))throw new RoomError('ACTIVE_ROOM','Bạn đang ở một phòng khác.');
  this.rooms.set(next.id,this.copy(next));return this.copy(next);
 }
 async touch(id:string,uid:string,now:number){const r=this.rooms.get(id);if(!r)return null;const seat=Object.entries(r.members).find(([,m])=>m===uid)?.[0] as keyof Room['lastSeen']|undefined;
  if(seat&&r.status!=='closed'&&(r.lastSeen[seat]??r.createdAt)>now-90000&&now-(r.lastSeen[seat]??0)>=5000)r.lastSeen={...r.lastSeen,[seat]:now};return this.copy(r);}
 async due(){return [...this.rooms.values()].filter(r=>r.status!=='closed').map(r=>this.copy(r));}
 async match(uid:string,fresh:Room,name:string,now:number){
  const mine=[...this.rooms.values()].find(r=>r.status!=='closed'&&Object.values(r.members).includes(uid));if(mine)return this.copy(mine);
  const open=[...this.rooms.values()].filter(r=>r.status==='waiting'&&r.public&&r.createdAt>now-600000&&Object.keys(r.members).length<r.capacity&&Object.keys(r.members).some(s=>((r.lastSeen as Record<string,number>)[s]??r.createdAt)>now-90000)).sort((a,b)=>a.createdAt-b.createdAt)[0];
  if(!open)return this.create(fresh);
  const seat=SEATS.find(s=>!(open.members as Record<string,string>)[s])!;
  const next:Room={...open,version:open.version+1,members:{...open.members,[seat]:uid},names:{...open.names,[seat]:name},lastSeen:{...open.lastSeen,[seat]:now}};
  if(Object.keys(next.members).length>=2&&next.pairAt===undefined)next.pairAt=now;
  this.rooms.set(next.id,this.copy(next));return this.copy(next);
 }
}
const code=()=>Array.from(crypto.getRandomValues(new Uint8Array(6)),n=>'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'[n%32]).join('');
/** Calls the room server directly as `uid`, with the Edge handler's error mapping. */
export function localTransport(server:WordChainRoomServer,uid:string,name:string):RoomTransport{
 return {async request(body:RoomRequest):Promise<RoomSnapshot>{
  const now=Date.now();
  try{
   const r=body.type==='create'?await server.create(uid,body.requestId,code(),name,body.capacity,now)
    :body.type==='match'?await server.match(uid,body.requestId,code(),name,now)
    :body.type==='join'?await server.join(uid,body.code,name,now)
    :body.type==='snapshot'?await server.snapshot(uid,body.roomId,now)
    :await server.command(uid,body.roomId,body.version,body.actionId,body.command,now);
   return {...r,serverNow:Date.now()} as RoomSnapshot;
  }catch(e){
   if(e instanceof RoomError)throw new RoomTransportError(e.code,e.message);
   if(e instanceof Error&&e.name==='RuleError')throw new RoomTransportError('NOT_YOUR_TURN',e.message);
   throw new RoomTransportError('SERVER_ERROR','Lỗi máy chủ thử nghiệm.',true);
  }
 }};
}
const PLAYERS=[{uid:'lab-an',name:'An'},{uid:'lab-binh',name:'Bình'},{uid:'lab-chi',name:'Chi'},{uid:'lab-dung',name:'Dũng'}];
const bridge={submitScore:async()=>({isNewHighScore:false,expEarned:0,coinsEarned:0})} as unknown as GameComponentProps['bridge'];

export function RoomLab(){
 const [lex,setLex]=useState<Lexicon|null>(null),[active,setActive]=useState(0);
 useEffect(()=>{void loadLexicon().then(setLex);},[]);
 const server=useMemo(()=>lex?new WordChainRoomServer(new LocalRoomStore(),lex):null,[lex]);
 // The scheduler: settle deadlines once a second, like pg_cron calling `tick`.
 useEffect(()=>{if(!server)return;const t=setInterval(()=>void server.tick(Date.now()),1000);return()=>clearInterval(t);},[server]);
 const clients=useMemo(()=>server?PLAYERS.map(p=>new WordChainClient(localTransport(server,p.uid,p.name))):[],[server]);
 if(!server)return <div className="nt-lab-loading">Đang mở từ điển…</div>;
 return <div className="nt-lab">
  <header className="nt-lab-head"><b>Nối Từ · Phòng thử 4 người</b><span>Máy chủ phòng thật chạy trong trình duyệt. Mỗi ô là một người chơi: một người Tạo phòng rồi những người khác Nhập mã, hoặc tất cả bấm Ghép trận.</span>
   <nav>{PLAYERS.map((p,i)=><button key={p.uid} aria-pressed={active===i} onClick={()=>setActive(i)}>{p.name}</button>)}</nav></header>
  <div className="nt-lab-panes">{PLAYERS.map((p,i)=><section key={p.uid} className={`nt-lab-pane ${active===i?'active':''}`} aria-label={`Người chơi ${p.name}`} data-player={p.name}>
   <div className="nt-lab-name">{p.name}</div>
   <WordChainGame bridge={bridge} isPaused={false} isMuted onGameOver={()=>{}} onRestart={()=>{}} roomClient={async()=>({client:clients[i]})}/>
  </section>)}</div>
 </div>;
}
