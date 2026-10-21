/** REVIEW ONLY: local simulation; excluded from the launcher entrypoint. No actual online service. */
import React,{useEffect,useMemo,useState} from 'react';
import {RoomServer,type Room,type RoomStore} from './server';
import {RoomClient,TransportError,type RoomTransport} from './online-client';
import {OnlineGame} from './OnlineGame';
import {loadArt,type Art} from './art';
class LocalStore implements RoomStore{
 private rooms=new Map<string,Room>();
 async create(room:Room){const old=this.rooms.get(room.id);if(old)return structuredClone(old);if([...this.rooms.values()].some(r=>r.status!=='closed'&&Object.values(r.members).includes(room.members.A1)))throw new Error('Bạn đã có phòng đang mở.');this.rooms.set(room.id,structuredClone(room));return structuredClone(room);}
 async read(id:string){return structuredClone(this.rooms.get(id)||null);}
 async byCode(code:string){return structuredClone([...this.rooms.values()].find(r=>r.code===code)||null);}
 async cas(version:number,next:Room){if(this.rooms.get(next.id)?.version!==version)return null;if(next.status!=='closed'&&[...this.rooms.values()].some(r=>r.id!==next.id&&r.status!=='closed'&&Object.values(r.members).some(uid=>Object.values(next.members).includes(uid))))throw new Error('Bạn đã có phòng đang mở.');this.rooms.set(next.id,structuredClone(next));return structuredClone(next);}
 async due(now:number){return structuredClone([...this.rooms.values()].filter(r=>r.status!=='closed'&&(r.state?r.state.deadline:r.createdAt+600000)<=now));}
}
export function RoomLab({onClose}:{onClose:()=>void}){
 const [art,setArt]=useState<Art|null>(null),[error,setError]=useState(''),[player,setPlayer]=useState(0),[offline,setOffline]=useState(false);
 const session=useMemo(()=>{const server=new RoomServer(new LocalStore(),()=>0),network={offline:false};const factory=(uid:string)=>async()=>{const transport:RoomTransport={async request(body){if(network.offline)throw new TransportError('NETWORK','Mất kết nối thử nghiệm.',true);try{const now=Date.now();const result=body.type==='create'?await server.create(uid,body.requestId,Array.from(crypto.getRandomValues(new Uint8Array(6)),n=>'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'[n%32]).join(''),now):body.type==='join'?await server.join(uid,body.code,now):body.type==='snapshot'?await server.snapshot(uid,body.roomId,now):await server.command(uid,body.roomId,body.version,body.actionId,body.command,now);return {...result,serverNow:Date.now()};}catch(e){throw new TransportError((e as any).code||'INVALID_MOVE',(e as Error).message);}}};return {client:new RoomClient(transport)};};return {server,network,factories:[factory('lab-player-a'),factory('lab-player-b')]};},[]);
 useEffect(()=>{loadArt().then(setArt).catch(()=>setError('Không tải được hạm đội.'));const timer=setInterval(()=>void session.server.tick(Date.now()),1000);return()=>clearInterval(timer);},[session]);
 return <div className="bs-room-lab"><header className="bs-lab-header"><strong>PHÒNG THỬ NGHIỆM · KHÔNG PHẢI ONLINE</strong><p>Hai người mô phỏng trên cùng thiết bị. Chọn Người A để tạo phòng, Người B nhập mã đang hiển thị. Bộ xử lý phòng dùng cùng luật server; bản thử này không kết nối Supabase.</p><div><button onClick={()=>setPlayer(0)} aria-pressed={player===0}>Người A</button><button onClick={()=>setPlayer(1)} aria-pressed={player===1}>Người B</button><button aria-pressed={offline} onClick={()=>{session.network.offline=!offline;setOffline(!offline);}}>{offline?'Nối lại mạng thử':'Ngắt mạng thử'}</button><button onClick={onClose}>Thoát thử nghiệm</button></div></header>{error&&<p>{error}</p>}{art&&<div className="bs-lab-players">{session.factories.map((connect,i)=><section key={i} className={player===i?'active':''} aria-label={`Người ${i===0?'A':'B'}`}><OnlineGame art={art} lab connect={connect} onClose={onClose}/></section>)}</div>}</div>;
}
