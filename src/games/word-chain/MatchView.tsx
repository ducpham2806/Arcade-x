import React,{useEffect,useMemo,useRef,useState} from 'react';
import {checkWord,need,REJECTION_TEXT,standings,turnMs,type Check,type Match,type Seat} from './rules';
import type {Lexicon} from './lexicon';
import type {WordChainSound} from './sound';

export const SEAT_COLOR:Record<Seat,string>={P1:'#ff7a59',P2:'#2fc7a8',P3:'#ffbe3d',P4:'#a98bff'};
export type Reward={xp?:number;coins?:number}|null;
type Props={match:Match;me:Seat;now:number;lex:Lexicon;avatars:Record<string,string>;sound:WordChainSound;
 onReady:(ready:boolean)=>void;onSubmit:(raw:string)=>Check|Promise<Check>;onForfeit:()=>void;onExit:()=>void;onRematch?:()=>void;
 reward?:Reward;status?:React.ReactNode;subtitle?:string;rematchLabel?:string};

const seconds=(ms:number)=>Math.max(0,Math.ceil(ms/1000));
/** Shared match screen (practice and online): players, current word, chain, answer box, overlays. */
export function MatchView({match:m,me,now,lex,avatars,sound,onReady,onSubmit,onForfeit,onExit,onRematch,reward,status,subtitle,rematchLabel}:Props){
 const mine=m.players.find(p=>p.seat===me)!,myTurn=m.phase==='turn'&&m.turn===me,left=m.deadline-now;
 const [text,setText]=useState(''),[feedback,setFeedback]=useState<{ok:boolean;text:string}|null>(null),[shake,setShake]=useState(0),[sending,setSending]=useState(false),[confirmLeave,setConfirmLeave]=useState(false);
 const [toast,setToast]=useState<string|null>(null);
 const input=useRef<HTMLInputElement>(null),composing=useRef(false),chainEnd=useRef<HTMLLIElement>(null),prev=useRef<Match|null>(null);
 const name=(seat:Seat|'SYS')=>seat==='SYS'?'Hệ thống':seat===me?'Bạn':m.players.find(p=>p.seat===seat)?.name??seat;

 // Turn start: prefill the syllable to chain from so only the second syllable needs typing.
 useEffect(()=>{if(!myTurn){setText('');return;}if(myTurn){setText(need(m)+' ');setFeedback(null);requestAnimationFrame(()=>{const el=input.current;if(el){el.focus();el.setSelectionRange(el.value.length,el.value.length);}});}},[myTurn,m.turnNumber]);
 // Events from state changes: accepted words, eliminations, phase changes.
 useEffect(()=>{const p=prev.current;prev.current=m;if(!p)return;
  for(const pl of m.players){const before=p.players.find(x=>x.seat===pl.seat);if(pl.out&&!before?.out&&pl.out.reason!=='unready'){setToast(`${name(pl.seat)} bị loại · ${pl.out.reason==='timeout'?'hết giờ':pl.out.reason==='absent'?'mất kết nối':'bỏ cuộc'}`);sound.play('out');}}
  if(m.words.length>p.words.length&&m.words.at(-1)!.seat!==me)sound.play('ok');
  if(p.phase==='countdown'&&m.phase==='turn')sound.play('go');
  if(p.phase!=='finished'&&m.phase==='finished'&&m.reason==='last-standing')sound.play(m.winner===me?'win':'lose');
 },[m]);
 useEffect(()=>{if(!toast)return;const t=setTimeout(()=>setToast(null),2600);return()=>clearTimeout(t);},[toast]);
 useEffect(()=>{chainEnd.current?.scrollIntoView({block:'nearest',inline:'end',behavior:'smooth'});},[m.words.length]);
 // Last five seconds of your own turn tick.
 const sec=seconds(left);useEffect(()=>{if(myTurn&&sec<=5&&sec>0)sound.play('tick');},[myTurn,sec]);

 const live=useMemo(()=>{const parts=text.trim().split(/\s+/).filter(Boolean);if(!myTurn||parts.length<2)return null;return checkWord(m,text,lex);},[text,myTurn,m,lex]);
 async function submit(){if(!myTurn||sending||!text.trim())return;setSending(true);
  try{const r=await onSubmit(text);if(r.ok){setFeedback({ok:true,text:`"${r.word}" ✓`});sound.play('ok');setText('');}else{setFeedback({ok:false,text:REJECTION_TEXT[r.reason!](r.need!)});setShake(n=>n+1);sound.play('bad');}}
  catch(e){setFeedback({ok:false,text:e instanceof Error?e.message:'Không gửi được, thử lại.'});}
  finally{setSending(false);requestAnimationFrame(()=>input.current?.focus());}}

 const current=m.words.at(-1),[first,second]=(current?.word??'… …').split(' ');
 const limit=m.phase==='turn'?turnMs(m.round):1,ratio=Math.max(0,Math.min(1,left/limit));
 const active=m.phase==='turn'?m.turn:null,order=m.order.length?m.order:m.players.map(p=>p.seat);
 return <div className="nt-match" data-phase={m.phase}>
  <header className="nt-top"><button className="nt-icon" aria-label="Rời trận" onClick={()=>m.phase==='finished'||m.phase==='ready'&&!mine.ready?onExit():setConfirmLeave(true)}>✕</button>
   <div className="nt-title"><b>NỐI TỪ</b><small>{subtitle??(m.phase==='turn'?`Vòng ${m.round} · ${turnMs(m.round)/1000} giây/lượt`:m.phase==='ready'?'Chuẩn bị':m.phase==='countdown'?'Sắp bắt đầu':'Kết thúc')}</small></div>
   <div className="nt-words-count" aria-label={`${m.words.length} từ trong chuỗi`}>{m.words.length}<small>từ</small></div></header>
  {status}
  <ul className="nt-players" aria-label="Người chơi">{order.map(seat=>{const p=m.players.find(x=>x.seat===seat)!,on=active===seat;
   return <li key={seat} className={`${on?'active':''} ${p.out?'out':''}`} style={{'--c':SEAT_COLOR[seat],'--p':on?ratio:0} as React.CSSProperties} data-seat={seat}>
    <span className="nt-avatar" aria-hidden="true">{avatars[seat]??p.name[0]}</span><span className="nt-name">{seat===me?'Bạn':p.name}</span>
    <small>{p.out?(p.out.reason==='unready'?'Rời phòng':`Hạng ${p.out.place}`):m.phase==='ready'?(p.ready?'Sẵn sàng':'Đang chờ'):on?`${seconds(left)}s`:m.winner===seat?'Thắng':''}</small></li>;})}</ul>
  <section className="nt-stage" aria-live="polite">
   <p className="nt-prompt">{m.phase==='turn'&&mine.out&&mine.out.reason!=='unready'?<span className="nt-out-note">Bạn đã bị loại · đang xem · </span>:null}{m.phase==='turn'?(myTurn?<>Lượt của <b>Bạn</b> · nối từ <b>“{second}”</b></>:<><b>{name(m.turn!)}</b> đang nghĩ<span className="nt-dots"/></>):m.phase==='countdown'?'Từ mở màn':m.phase==='finished'?'Chuỗi từ của trận':'Từ mở màn sẽ hiện khi bắt đầu'}</p>
   <div className="nt-current" key={m.words.length}><span className="nt-tile">{m.phase==='ready'?'?':first}</span><span className="nt-arrow" aria-hidden="true">→</span><span className="nt-tile hot">{m.phase==='ready'?'?':second}</span></div>
   {m.phase==='turn'&&<div className={`nt-timer ${sec<=5?'urgent':''}`} role="timer" aria-label={`Còn ${sec} giây`}><i style={{transform:`scaleX(${ratio})`}}/><b>{sec}s</b></div>}
  </section>
  <ol className="nt-chain" aria-label="Chuỗi từ">{m.words.map((w,i)=><li key={w.key+i} ref={i===m.words.length-1?chainEnd:undefined} style={{'--c':w.seat==='SYS'?'#e7dcc4':SEAT_COLOR[w.seat]} as React.CSSProperties} title={name(w.seat)}>{w.word}</li>)}</ol>
  <form className={`nt-answer ${myTurn?'mine':''}`} onSubmit={e=>{e.preventDefault();void submit();}} key={shake} data-shake={shake?1:0}>
   <input ref={input} value={text} disabled={!myTurn} lang="vi" inputMode="text" autoComplete="off" autoCorrect="off" autoCapitalize="none" spellCheck={false} data-no-swipe="true" maxLength={40}
    aria-label="Gõ từ nối tiếp" placeholder={myTurn?`${second} …`:m.phase==='turn'?'Chờ đến lượt của bạn':'—'} className={live?(live.ok?'valid':'invalid'):''}
    onChange={e=>{setText(e.target.value);if(feedback&&!feedback.ok)setFeedback(null);}} onCompositionStart={()=>{composing.current=true;}} onCompositionEnd={e=>{composing.current=false;setText((e.target as HTMLInputElement).value);}}
    onKeyDown={e=>{if(e.key==='Enter'&&(composing.current||e.nativeEvent.isComposing)){e.preventDefault();}}}/>
   <button type="submit" className="nt-send" disabled={!myTurn||sending||!text.trim()}>GỬI</button>
  </form>
  <p className={`nt-feedback ${feedback?.ok===false?'bad':feedback?.ok?'good':''}`} role="status">{feedback?.text??(live&&!live.ok&&live.reason!=='format'?REJECTION_TEXT[live.reason!](live.need!):live?.ok?'Từ hợp lệ · nhấn Enter để gửi':' ')}</p>
  {toast&&<div className="nt-toast" role="status">{toast}</div>}
  {m.phase==='ready'&&<div className="nt-overlay"><div className="nt-card nt-ready">
   <div className="nt-ring" style={{'--p':Math.max(0,left)/30000} as React.CSSProperties}><b>{seconds(left)}</b><small>giây</small></div>
   <h2>Chuẩn bị</h2><p>Mọi người bấm Sẵn sàng là bắt đầu ngay. Hết giờ, ai chưa sẵn sàng sẽ phải rời phòng.</p>
   <ul className="nt-ready-list">{m.players.filter(p=>!p.out).map(p=><li key={p.seat} className={p.ready?'on':''} style={{'--c':SEAT_COLOR[p.seat]} as React.CSSProperties}><span className="nt-avatar">{avatars[p.seat]??p.name[0]}</span>{p.seat===me?'Bạn':p.name}<b>{p.ready?'✓':'…'}</b></li>)}</ul>
   <button className={`nt-primary ${mine.ready?'off':''}`} data-testid="nt-ready" disabled={!!mine.out} onClick={()=>onReady(!mine.ready)}>{mine.ready?'HỦY SẴN SÀNG':'SẴN SÀNG'}</button>
  </div></div>}
  {m.phase==='countdown'&&<div className="nt-overlay nt-countdown" aria-live="assertive"><b key={seconds(left)}>{seconds(left)||'BẮT ĐẦU!'}</b><span>Từ mở màn: <em>{current?.word}</em></span></div>}
  {m.phase==='finished'&&<Results m={m} me={me} avatars={avatars} reward={reward} onExit={onExit} onRematch={onRematch} rematchLabel={rematchLabel} source={lex.source}/>}
  {confirmLeave&&<div className="nt-overlay"><div className="nt-card"><h2>Rời trận?</h2><p>Rời giữa trận được tính là bỏ cuộc.</p><button className="nt-primary" onClick={()=>{setConfirmLeave(false);onForfeit();onExit();}}>Bỏ cuộc và rời</button><button onClick={()=>setConfirmLeave(false)}>Ở lại</button></div></div>}
 </div>;
}

function Results({m,me,avatars,reward,onExit,onRematch,rematchLabel,source}:{m:Match;me:Seat;avatars:Record<string,string>;reward?:Reward;onExit:()=>void;onRematch?:()=>void;rematchLabel?:string;source:string}){
 const rows=standings(m),won=m.winner===me;
 return <div className="nt-overlay"><div className="nt-card nt-results" role="dialog" aria-modal="true" aria-labelledby="nt-result-title">
  <small>{m.reason==='not-enough-ready'?'TRẬN KHÔNG DIỄN RA':'KẾT THÚC'}</small>
  <h2 id="nt-result-title" className={won?'win':''}>{m.reason==='not-enough-ready'?'Chưa đủ người sẵn sàng':won?'CHIẾN THẮNG!':`Hạng ${rows.find(r=>r.seat===me)?.place??'-'}`}</h2>
  {rows.length>0&&<ol className="nt-podium">{rows.map(r=><li key={r.seat} className={r.seat===me?'me':''} style={{'--c':SEAT_COLOR[r.seat]} as React.CSSProperties}><b>{r.place}</b><span className="nt-avatar">{avatars[r.seat]??r.name[0]}</span><span>{r.seat===me?'Bạn':r.name}</span><small>{r.words} từ</small></li>)}</ol>}
  <p className="nt-chain-total">Chuỗi dài {m.words.length} từ{m.words.length>1?<> · từ cuối: <b>{m.words.at(-1)!.word}</b></>:null}</p>
  {reward&&(reward.xp||reward.coins)?<p className="nt-reward">+{reward.xp??0} XP · +{reward.coins??0} xu</p>:null}
  {onRematch?<button className="nt-primary" data-testid="nt-rematch" onClick={onRematch}>{rematchLabel??'CHƠI LẠI'}</button>:rematchLabel?<p className="nt-note">{rematchLabel}</p>:null}<button onClick={onExit}>Về sảnh Nối Từ</button>
  <p className="nt-credit">Từ điển: Wiktionary (CC BY-SA 4.0), qua which-dialect · {source.split(' ')[0]}</p>
 </div></div>;
}
