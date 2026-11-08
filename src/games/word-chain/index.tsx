import React,{useCallback,useEffect,useRef,useState} from 'react';
import type {GameComponentProps} from '../../types';
import {MatchView,type Reward} from './MatchView';
import {botMove,type BotLevel} from './bot';
import {getLexicon,loadLexicon,type Lexicon} from './lexicon';
import {advanceTime,createMatch,forfeit,setReady,standings,submitWord,type Match,type Seat} from './rules';
import {WordChainSound} from './sound';
import {WORD_CHAIN_ONLINE} from './config';
import {OnlineRoom,type OnlineMode} from './OnlineRoom';
import type {WordChainClient} from './online-client';
import './word-chain.css';

const BOTS=[{name:'Mèo Mun',avatar:'🐱'},{name:'Cú Bông',avatar:'🦉'},{name:'Sóc Nâu',avatar:'🐿️'}];
const seeded=(seed:number)=>{let x=seed>>>0;return()=>{x+=0x6D2B79F5;let t=Math.imul(x^(x>>>15),1|x);t^=t+Math.imul(t^(t>>>7),61|t);return((t^(t>>>14))>>>0)/4294967296;};};
// Automated UI tests pin the match seed (turn order, opener, bot choices) through this global.
const testSeed=()=>(globalThis as {__WORD_CHAIN_TEST_SEED__?:number}).__WORD_CHAIN_TEST_SEED__;
type OnlineConnection={client:WordChainClient;resumeKey?:string;dispose?:()=>void};
type Screen={kind:'home'}|{kind:'setup'}|{kind:'practice';bots:number;level:BotLevel;seed:number}|{kind:'online';mode:OnlineMode};

/** `roomClient` lets the review lab inject a local room server; normally the deployed one is used. */
export function WordChainGame({bridge,isPaused=false,isMuted=false,roomClient}:GameComponentProps&{roomClient?:()=>Promise<OnlineConnection>}){
 const [lex,setLex]=useState<Lexicon|null>(getLexicon()),[error,setError]=useState('');
 const [screen,setScreen]=useState<Screen>({kind:'home'}),[bots,setBots]=useState(2),[level,setLevel]=useState<BotLevel>('easy'),[help,setHelp]=useState(false);
 const [online,setOnline]=useState<OnlineConnection|null>(null),[onlineError,setOnlineError]=useState('');
 const muted=useRef(isMuted);muted.current=isMuted;
 const canOnline=WORD_CHAIN_ONLINE||!!roomClient;
 // Own one connection per online visit; discard late account/connection results.
 useEffect(()=>{
  if(screen.kind!=='online'||!canOnline){setOnline(null);return;}
  let active=true,connection:OnlineConnection|null=null;setOnlineError('');setOnline(null);
  (roomClient?roomClient():import('./online-platform').then(p=>p.platformWordChainClient())).then(runtime=>{
   if(!active){runtime.dispose?.();runtime.client.close();return;}
   connection=runtime;setOnline(runtime);
  }).catch(e=>{if(active)setOnlineError(e instanceof Error?e.message:'Không kết nối được phòng online.');});
  return()=>{
   active=false;
   if(connection){const runtime=connection;
    // Launcher Exit/unmount also releases a connected chair. Network failure keeps
    // the resume key and lets the authoritative 90-second absence rule settle it.
    void runtime.client.leave().then(left=>{
     if(left&&runtime.resumeKey)try{localStorage.removeItem(runtime.resumeKey);}catch{/* optional */}
    }).finally(()=>{runtime.dispose?.();runtime.client.close();});
   }
  };
 },[screen.kind]);
 const sound=useRef<WordChainSound|null>(null);sound.current??=new WordChainSound(()=>muted.current);
 useEffect(()=>()=>sound.current?.dispose(),[]);
 useEffect(()=>{if(!lex)loadLexicon().then(setLex).catch(()=>setError('Không tải được từ điển. Kiểm tra kết nối rồi thử lại.'));},[lex]);
 if(!lex)return <div className="nt-game nt-loading"><div className="nt-logo"><span>NỐI</span><span>TỪ</span></div><p>{error||'Đang mở từ điển…'}</p>{error&&<button className="nt-primary" onClick={()=>{setError('');setLex(null);loadLexicon().then(setLex).catch(()=>setError('Vẫn chưa tải được từ điển.'));}}>Thử lại</button>}</div>;
 if(screen.kind==='practice')return <div className="nt-game"><Practice key={screen.seed} lex={lex} bots={screen.bots} level={screen.level} seed={screen.seed} sound={sound.current} bridge={bridge} isPaused={isPaused}
  onExit={()=>setScreen({kind:'home'})} onRematch={()=>setScreen({...screen,seed:Date.now()})}/></div>;
 if(screen.kind==='online'&&online)return <div className="nt-game"><OnlineRoom key={screen.mode} client={online.client} resumeKey={online.resumeKey} mode={screen.mode} lex={lex} sound={sound.current} onExit={()=>setScreen({kind:'home'})}/></div>;
 return <div className="nt-game nt-home">
  <div className="nt-home-inner">
   <div className="nt-logo" aria-label="Nối Từ"><span>NỐI</span><span>TỪ</span></div>
   <p className="nt-lead">Đấu trí từ ngữ 2–4 người. Nối âm tiết cuối, ai bí từ hay hết giờ thì bị loại.</p>
   <div className="nt-demo" aria-hidden="true"><span>con mèo</span><i>→</i><span>mèo con</span><i>→</i><span>con người</span></div>
   {screen.kind==='setup'?<div className="nt-card nt-setup">
    <h2>Luyện với bot</h2>
    <fieldset><legend>Số bot</legend><div className="nt-seg">{[1,2,3].map(n=><button key={n} aria-pressed={bots===n} onClick={()=>setBots(n)}>{n} bot</button>)}</div></fieldset>
    <fieldset><legend>Mức độ</legend><div className="nt-seg">{(['easy','hard'] as const).map(l=><button key={l} aria-pressed={level===l} onClick={()=>setLevel(l)}>{l==='easy'?'Dễ':'Khó'}</button>)}</div></fieldset>
    <p className="nt-note">{level==='easy'?'Bot Dễ dùng từ quen thuộc, nghĩ lâu và đôi khi bí từ.':'Bot Khó trả lời nhanh và hay chọn từ làm đối thủ khó nối.'}</p>
    <button className="nt-primary" data-testid="nt-start-practice" onClick={()=>setScreen({kind:'practice',bots,level,seed:testSeed()??Date.now()})}>VÀO TRẬN</button>
    <button onClick={()=>setScreen({kind:'home'})}>Quay lại</button>
   </div>:screen.kind==='online'?<div className="nt-card"><h2>Đấu online</h2>
    <p>{!canOnline?'Phòng online (ghép trận, tạo phòng, nhập mã) đang chờ bật máy chủ. Trong lúc đó anh có thể luyện với bot.':onlineError||'Đang kết nối phòng…'}</p>
    <button className="nt-primary" onClick={()=>setScreen({kind:'setup'})}>Luyện với bot</button><button onClick={()=>setScreen({kind:'home'})}>Quay lại</button>
   </div>:<div className="nt-menu">
    <button className="nt-primary" data-testid="nt-practice" onClick={()=>setScreen({kind:'setup'})}>LUYỆN VỚI BOT</button>
    {canOnline?<><button data-testid="nt-match" onClick={()=>setScreen({kind:'online',mode:'match'})}>GHÉP TRẬN<small>2–4 người</small></button>
    <div className="nt-pair"><button data-testid="nt-create" onClick={()=>setScreen({kind:'online',mode:'create'})}>TẠO PHÒNG</button><button data-testid="nt-join" onClick={()=>setScreen({kind:'online',mode:'join'})}>NHẬP MÃ</button></div></>:<p className="nt-note">Đấu online sắp có. Thử sức cùng bot trước nhé.</p>}
    <button className="nt-link" onClick={()=>setHelp(true)}>Cách chơi</button>
   </div>}
   <p className="nt-credit">Từ điển {lex.words.length.toLocaleString('vi-VN')} từ: Wiktionary (CC BY-SA 4.0), qua Kaikki/which-dialect</p>
  </div>
  {help&&<Help onClose={()=>setHelp(false)}/>}
 </div>;
}

function Practice({lex,bots,level,seed,sound,bridge,isPaused,onExit,onRematch}:{lex:Lexicon;bots:number;level:BotLevel;seed:number;sound:WordChainSound;bridge:GameComponentProps['bridge'];isPaused:boolean;onExit:()=>void;onRematch:()=>void}){
 const avatars:Record<string,string>={P1:'🙂',...Object.fromEntries(BOTS.slice(0,bots).map((b,i)=>[`P${i+2}`,b.avatar]))};
 const [m,setM]=useState<Match>(()=>createMatch([{seat:'P1',name:'Bạn'},...BOTS.slice(0,bots).map((b,i)=>({seat:`P${i+2}` as Seat,name:b.name}))],Date.now(),seed));
 const [now,setNow]=useState(Date.now()),[reward,setReward]=useState<Reward>(null);
 const random=useRef(seeded(seed^0x9e3779b9)),pausedAt=useRef<number|null>(null),reported=useRef(false);
 // Clock: advance deadlines; while paused, push every deadline back by the pause length.
 useEffect(()=>{const t=setInterval(()=>{const n=Date.now();setNow(n);if(!pausedAt.current)setM(s=>advanceTime(s,n,lex));},150);return()=>clearInterval(t);},[lex]);
 useEffect(()=>{if(isPaused){pausedAt.current=Date.now();return;}if(pausedAt.current!==null){const shift=Date.now()-pausedAt.current;pausedAt.current=null;setM(s=>s.phase==='finished'?s:{...s,deadline:s.deadline+shift});}},[isPaused]);
 // Bots get ready after a moment.
 useEffect(()=>{const timers=m.players.filter(p=>p.seat!=='P1').map(p=>setTimeout(()=>setM(s=>s.phase==='ready'&&!pausedAt.current?setReady(s,p.seat,true,Date.now(),lex):s),700+random.current()*2300));return()=>timers.forEach(clearTimeout);},[]);
 // Bot turns: think, then answer (or stay silent and time out).
 useEffect(()=>{if(m.phase!=='turn'||m.turn==='P1'||isPaused)return;const turn=m.turnNumber,seat=m.turn!,mv=botMove(m,lex,level,random.current);if(!mv.word)return;
  const t=setTimeout(()=>setM(s=>s.phase==='turn'&&s.turnNumber===turn&&s.turn===seat&&!pausedAt.current?submitWord(s,seat,mv.word!,Date.now(),lex).match:s),mv.delayMs);return()=>clearTimeout(t);},[m.turnNumber,m.phase,isPaused]);
 // Rewards once per match: placement-based score through the launcher bridge (XP, coins, quests).
 useEffect(()=>{if(m.phase!=='finished'||reported.current||m.reason!=='last-standing')return;reported.current=true;
  const me=standings(m).find(r=>r.seat==='P1'),place=me?.place??m.players.length,won=m.winner==='P1';
  const score=(me?.words??0)*20+(m.order.length-place)*40+(won?120:0);
  bridge.submitScore(score,{won:won?1:0,isWin:won?1:0,place,words:me?.words??0,players:m.order.length}).then(r=>setReward({xp:r.expEarned,coins:r.coinsEarned})).catch(()=>{});},[m.phase]);
 const latest=useRef(m);latest.current=m;
 const submit=useCallback((raw:string)=>{const r=submitWord(latest.current,'P1',raw,Date.now(),lex);latest.current=r.match;setM(r.match);return r.result;},[lex]);
 return <MatchView match={m} me="P1" now={now} lex={lex} avatars={avatars} sound={sound} reward={reward} subtitle={m.phase==='turn'?undefined:`Luyện với ${bots} bot · ${level==='easy'?'Dễ':'Khó'}`}
  onReady={r=>setM(s=>setReady(s,'P1',r,Date.now(),lex))} onSubmit={submit} onForfeit={()=>setM(s=>forfeit(s,'P1','forfeit',Date.now(),lex))} onExit={onExit} onRematch={onRematch}/>;
}

function Help({onClose}:{onClose:()=>void}){
 return <div className="nt-overlay"><div className="nt-card nt-help" role="dialog" aria-modal="true" aria-labelledby="nt-help-title">
  <h2 id="nt-help-title">Cách chơi Nối Từ</h2>
  <ol><li>2–4 người vào phòng. Trong 30 giây chuẩn bị, mọi người bấm <b>Sẵn sàng</b>; đủ cả là đếm 3-2-1.</li>
   <li>Hệ thống đưa từ mở màn. Lần lượt từng người gõ một từ <b>2 âm tiết</b> bắt đầu bằng âm tiết cuối của từ trước: <em>con mèo → mèo con → con người</em>.</li>
   <li>Từ phải có trong từ điển và chưa ai dùng trong trận. Gõ sai được gõ lại trong thời gian còn lại.</li>
   <li>Mỗi lượt 30 giây (từ vòng 4 còn 20 giây, từ vòng 7 còn 15 giây). Hết giờ là bị loại. Người cuối cùng còn lại thắng.</li></ol>
  <p>Gõ có dấu bằng Telex/VNI hoặc bàn phím điện thoại; "hoà" và "hòa" đều được. Âm tiết cần nối được điền sẵn, anh chỉ cần gõ tiếp.</p>
  <button className="nt-primary" onClick={onClose}>ĐÃ HIỂU</button></div></div>;
}
export default WordChainGame;
