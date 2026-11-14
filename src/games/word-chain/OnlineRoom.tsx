import {useWordChainChat} from '../../chat/useWordChainChat';
import React,{useEffect,useReducer,useState} from 'react';
import {ConnectionNotice} from '../duel/ConnectionNotice';
import {MatchView,SEAT_COLOR} from './MatchView';
import type {Lexicon} from './lexicon';
import type {WordChainClient} from './online-client';
import {type Check,type Seat} from './rules';
import type {WordChainSound} from './sound';

export type OnlineMode='match'|'create'|'join';
const REACTIONS=['👏','😂','😮','🔥','😭','🤯'];
const seconds=(ms:number)=>Math.max(0,Math.ceil(ms/1000));
const CLOSE_TEXT:Record<string,string>={abandoned:'Mọi người đã rời phòng.',expired:'Phòng chờ quá 10 phút nên đã đóng.',finished:'Hết thời gian tái đấu.'};

/** Online room screens: entry (create / join / queue), lobby, match (shared MatchView), results. */
export function OnlineRoom({client,mode,lex,sound,resumeKey,onExit}:{client:WordChainClient;mode:OnlineMode;lex:Lexicon;sound:WordChainSound;resumeKey?:string;onExit:()=>void}){
 const [,render]=useReducer((n:number)=>n+1,0);
 const [capacity,setCapacity]=useState(4),[code,setCode]=useState(''),[copied,setCopied]=useState(false),[leaving,setLeaving]=useState(false);
 useEffect(()=>client.subscribe(render),[client]);
 const chatPlayers=useWordChainChat(client);
 const s=client.snapshot,m=s?.match??null,live=!!m&&m.phase!=='finished';
 // Resume a room after a reload; queue straight away in matchmaking mode.
 useEffect(()=>{let resume:string|null=null;try{resume=resumeKey?localStorage.getItem(resumeKey):null;}catch{/* optional */}
  if(resume&&!client.snapshot)void client.refresh(resume);else if(mode==='match'&&!client.snapshot)void client.match();},[]);
 useEffect(()=>{if(!resumeKey)return;try{if(s&&s.status!=='closed')localStorage.setItem(resumeKey,s.id);else if(s?.status==='closed'||['NOT_MEMBER','LEFT_ROOM','NOT_FOUND'].includes(client.lastErrorCode))localStorage.removeItem(resumeKey);}catch{/* optional */}},[s?.id,s?.status,client.lastErrorCode]);
 // Poll: every second while something is timed, every 3 s otherwise; also on focus / reconnect.
 const fast=!!s&&s.status!=='closed'&&(live||!!s.autoStartAt||!!s.rematch);
 useEffect(()=>{if(!s||s.status==='closed')return;const tick=()=>{if(document.visibilityState==='visible'&&navigator.onLine!==false)void(client.pending?client.retry():client.refresh());};
  const t=setInterval(tick,fast?1000:3000);const wake=()=>tick();document.addEventListener('visibilitychange',wake);window.addEventListener('online',wake);
  return()=>{clearInterval(t);document.removeEventListener('visibilitychange',wake);window.removeEventListener('online',wake);};},[s?.id,s?.status,fast]);
 // Local clock for countdowns between polls.
 const [,setTick]=useState(0);useEffect(()=>{if(!fast)return;const t=setInterval(()=>setTick(n=>n+1),250);return()=>clearInterval(t);},[fast]);
 // Pilot PK has no shared XP/coin claim until a server-verified reward receipt exists.
 async function leave(){
  if(leaving)return;setLeaving(true);
  try{if(await client.leave()){
   try{if(resumeKey)localStorage.removeItem(resumeKey);}catch{/* optional */}
   onExit();
  }}finally{setLeaving(false);}
 }
 const avatars:Record<string,string>=Object.fromEntries((s?.roster??[]).map(r=>[r.seat,r.name.slice(0,1).toUpperCase()]));
 const busy=client.busy||!!client.pending||leaving;
 const status=<>
  <ConnectionNotice active={live}/>
  {client.error&&<p className="nt-feedback bad" role="alert">{client.error}</p>}
  <p className="nt-note">Trận online hiện chưa có thưởng XP/xu.</p>
  {client.notice&&<p className="nt-sync" role="status">{client.notice}{client.pending&&<button className="nt-link" onClick={()=>void client.retry()}>Thử lại</button>}</p>}
  {s&&m&&<Reactions items={s.reactions} me={s.seat} now={client.now} onReact={e=>void client.command({type:'react',emoji:e})} spectator={!!m.players.find(p=>p.seat===s.seat)?.out||m.phase==='finished'}/>}
 </>;

 if(!s)return <div className="nt-home nt-online-entry"><div className="nt-home-inner"><div className="nt-card">
  {mode==='match'?<><h2>Ghép trận</h2><div className="nt-spinner" aria-hidden="true"/><p>{busy?'Đang tìm phòng 2–4 người…':client.error||client.notice||'Đang kết nối…'}</p>{!busy&&<button className="nt-primary" onClick={()=>void client.match()}>Tìm lại</button>}</>
  :mode==='create'?<><h2>Tạo phòng</h2><fieldset><legend>Số người tối đa</legend><div className="nt-seg">{[2,3,4].map(n=><button key={n} aria-pressed={capacity===n} onClick={()=>setCapacity(n)}>{n} người</button>)}</div></fieldset>
   <p className="nt-note">Phòng đủ người là vào chuẩn bị; chủ phòng cũng có thể bắt đầu sớm khi có từ 2 người.</p>
   <button className="nt-primary" data-testid="nt-create-room" disabled={busy} onClick={()=>void client.create(capacity)}>{busy?'Đang tạo…':'TẠO PHÒNG'}</button></>
  :<><h2>Nhập mã phòng</h2><label className="nt-code-input"><span>Mã 6 ký tự</span><input value={code} maxLength={6} autoCapitalize="characters" autoComplete="off" spellCheck={false} data-no-swipe="true" onChange={e=>setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g,''))} onKeyDown={e=>{if(e.key==='Enter'&&code.length===6)void client.join(code);}}/></label>
   <button className="nt-primary" data-testid="nt-join-room" disabled={busy||code.length!==6} onClick={()=>void client.join(code)}>{busy?'Đang vào…':'VÀO PHÒNG'}</button></>}
  {client.error&&<p className="nt-feedback bad" role="alert">{client.error}</p>}
  {client.notice&&<p role="status">{client.notice}</p>}
  {client.pending&&<button disabled={client.busy||leaving} onClick={()=>void client.retry()}>Thử lại</button>}
  <button disabled={leaving} onClick={()=>void leave()}>{leaving?'Đang rời…':'Quay lại'}</button>
 </div></div></div>;

 if(s.status==='closed')return <div className="nt-home"><div className="nt-home-inner"><div className="nt-card"><h2>Phòng đã đóng</h2><p>{CLOSE_TEXT[s.closeReason??'']??'Phòng không còn hoạt động.'}</p><button className="nt-primary" onClick={()=>{client.forget();onExit();}}>Về sảnh Nối Từ</button></div></div></div>;

 if(s.status==='waiting'||!m){const seats=Array.from({length:s.capacity},(_,i)=>`P${i+1}` as Seat),present=s.roster.filter(r=>r.present);
  return <div className="nt-match nt-lobby">
   <header className="nt-top"><button className="nt-icon" aria-label="Rời phòng" disabled={leaving} onClick={()=>void leave()}>✕</button><div className="nt-title"><b>NỐI TỪ</b><small>{s.public?'Ghép trận':'Phòng riêng'} · {present.length}/{s.capacity} người</small></div><span/></header>
   {status}
   {s.public?<div className="nt-card nt-queue"><div className="nt-spinner" aria-hidden="true"/><h2>Đang ghép người chơi</h2>
    <p>{s.autoStartAt?<>Trận tự bắt đầu sau <b>{seconds(s.autoStartAt-client.now)} giây</b> nếu chưa đủ 4 người.</>:'Chờ thêm ít nhất một người nữa.'}</p><button disabled={leaving} onClick={()=>void leave()}>{leaving?'Đang hủy…':'Hủy tìm trận'}</button></div>
   :<div className="nt-card nt-room-code"><small>MÃ PHÒNG</small><b data-testid="nt-room-code">{s.code}</b>
    <button onClick={()=>{void navigator.clipboard?.writeText(s.code).then(()=>{setCopied(true);setTimeout(()=>setCopied(false),1500);}).catch(()=>{});}}>{copied?'Đã sao chép ✓':'Sao chép mã'}</button>
    <p>Gửi mã cho bạn bè, họ chọn <b>Nhập mã</b> để vào phòng.</p></div>}
   <ul className="nt-seats">{seats.map(seat=>{const r=s.roster.find(x=>x.seat===seat&&x.present);return <li key={seat} className={r?'on':''} style={{'--c':SEAT_COLOR[seat]} as React.CSSProperties}>
    {r?<><span className="nt-avatar">{avatars[seat]}</span><b>{seat===s.seat?'Bạn':r.name}</b><small>{seat===s.host?'Chủ phòng':'Đã vào'}</small></>:<><span className="nt-avatar empty">?</span><b>Ghế trống</b><small>Đang chờ…</small></>}</li>;})}</ul>
   {!s.public&&s.seat===s.host&&<button className="nt-primary" data-testid="nt-host-start" disabled={present.length<2||busy} onClick={()=>void client.command({type:'start'})}>{present.length<2?'Cần ít nhất 2 người':`BẮT ĐẦU · ${present.length} NGƯỜI`}</button>}
   {!s.public&&s.seat!==s.host&&<p className="nt-note">Chờ chủ phòng bắt đầu hoặc đủ {s.capacity} người.</p>}
  </div>;}

 const votes=s.rematch?.votes.length??0,inRoom=s.roster.filter(r=>r.present).length;
 return <MatchView chatPlayers={chatPlayers} match={m} me={s.seat} now={client.now} lex={lex} avatars={avatars} sound={sound} status={status}
  subtitle={m.phase==='turn'?undefined:`${s.public?'Ghép trận':'Phòng '+s.code} · ${m.order.length||m.players.length} người`}
  onReady={r=>void client.command({type:'ready',ready:r})}
  onSubmit={async(raw):Promise<Check>=>{await client.command({type:'submit',word:raw,turn:m.turnNumber});if(client.lastResult)return client.lastResult;throw new Error(client.error||client.notice||'Không gửi được, thử lại.');}}
  onForfeit={()=>{}} onExit={()=>void leave()}
  onRematch={s.rematch&&inRoom>=2?()=>void client.command({type:'rematch'}):undefined}
  rematchLabel={s.rematch?`${s.rematch.votes.includes(s.seat)?'ĐÃ BỎ PHIẾU':'TÁI ĐẤU'} · ${votes}/${inRoom} · ${seconds(s.rematch.until-client.now)}s`:undefined}/>;
}

function Reactions({items,me,now,onReact,spectator}:{items:{seat:Seat;emoji:string;at:number}[];me:Seat;now:number;onReact:(e:string)=>void;spectator:boolean}){
 const recent=items.filter(r=>now-r.at<5000);
 return <div className="nt-reactions">
  <div className="nt-reaction-feed" aria-live="polite">{recent.map(r=><span key={r.seat+r.at} style={{'--c':SEAT_COLOR[r.seat]} as React.CSSProperties} title={r.seat===me?'Bạn':r.seat}>{r.emoji}</span>)}</div>
  {spectator&&<div className="nt-reaction-bar" role="group" aria-label="Thả biểu cảm">{REACTIONS.map(e=><button key={e} onClick={()=>onReact(e)} aria-label={`Thả ${e}`}>{e}</button>)}</div>}
 </div>;
}
