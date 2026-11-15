import React,{useCallback,useEffect,useMemo,useRef,useState} from 'react';
import {ArrowLeft,ArrowRight,BookOpen,ChevronRight,Home,Leaf,LockKeyhole,Pause,Play,RotateCcw,ShoppingBag,Users} from 'lucide-react';
import type {GameComponentProps} from '../../types';
import {applyMatchReward,loadFolkProfile,type FolkProfileSave} from '../folk-duel/economy';
import {FolkShopModal} from '../folk-duel/FolkShopModal';
import {FolkSoundEngine} from '../folk-duel/sfx';
import {getSkinById} from '../folk-duel/skins-catalog';
import type {FolkSeat} from '../folk-duel/types';
import {chooseOaqBotMove,type OaqBotLevel} from './ai';
import {OAQ_SCENE_URL,OAQ_PROPS_URL,OAQ_HANDS_URL,PROP_RECTS,HAND_RECTS,HAND_FRAMES,loadOaqArtwork,type OaqArtwork} from './art';
import {OaqDialog} from './OaqDialog';
import {BOARD_H,BOARD_W,getOaqCellRects,renderOAnQuanBoard,renderOaqShopPreview} from './renderer';
import {applyOaqMove,createInitialOaqState,getOwnRange,previewOaqLandingCell,type OaqDirection,type OaqState} from './rules';
import '../folk-duel/folk-duel.css';
import './oaq.css';

type Match={id:string;kind:'easy'|'hard'|'local'};
const makeMatch=(kind:Match['kind']):Match=>({kind,id:`oaq_${kind}_${crypto.randomUUID()}`});
function Prop({frame,className=''}:{frame:number;className?:string}){
 const [x,y,w,h]=PROP_RECTS[frame];return <svg aria-hidden="true" className={`oaq-prop ${className}`} viewBox={`${x} ${y} ${w} ${h}`}><image href={OAQ_PROPS_URL} width="1254" height="1254"/></svg>;
}

export const OAnQuanGame:React.FC<GameComponentProps>=({bridge,isMuted=false,isPaused=false})=>{
 const [profile,setProfile]=useState<FolkProfileSave>(()=>loadFolkProfile(bridge));
 const [match,setMatch]=useState<Match|null>(null),[shop,setShop]=useState(false),[rules,setRules]=useState(false);
 const [art,setArt]=useState<OaqArtwork>({scene:null,props:null,hands:null,boards:null});
 const muted=useRef(isMuted);muted.current=isMuted;
 const sound=useRef<FolkSoundEngine|null>(null);sound.current??=new FolkSoundEngine(()=>muted.current);
 const play=useRef<HTMLButtonElement>(null);
 useEffect(()=>{let mounted=true;void loadOaqArtwork().then(v=>{if(mounted)setArt(v);});return()=>{mounted=false;sound.current?.dispose();};},[]);
 useEffect(()=>{if(!match)play.current?.focus();},[match]);
 const closeRules=useCallback(()=>setRules(false),[]);
 const blocked=isPaused||shop||rules;
 return <div className="fd-shell oaq" data-art-ready={!!art.props}>
  <header className="oaq-header"><button className="oaq-brand" onClick={()=>setMatch(null)} aria-label="Về sảnh Ô Ăn Quan"><Leaf/><span>Ô ĂN QUAN<small>Nắng sân đình</small></span></button><div className="oaq-header-actions"><span className="oaq-wallet"><i/> {profile.candyTokens}<span> Kẹo</span></span><button className="oaq-shop-link" onClick={()=>setShop(true)} aria-label="Tiệm Tạp Hóa"><ShoppingBag/><span>Tiệm Tạp Hóa</span></button><button className="oaq-icon-button" onClick={()=>setRules(true)} aria-label="Luật Chơi Nhanh"><BookOpen/></button></div></header>
  {!match?<main className="oaq-home">
   <div className="oaq-home-art" aria-hidden="true"><img src={OAQ_SCENE_URL} alt="" onError={e=>{e.currentTarget.style.display='none';}}/></div>
   <section className="oaq-welcome"><span className="oaq-eyebrow"><span/> TRÒ CHƠI DÂN GIAN VIỆT NAM</span><h1>Một nắm sỏi.<br/>Cả trời <em>tuổi thơ.</em></h1><p>Về sân đình, chọn một ô, rải từng viên sỏi.<br className="oaq-desktop-break"/> Tính một nước hay, vui trọn một ván.</p>
    <div className="oaq-play-card"><div className="oaq-card-heading"><Prop frame={1}/><div><h2>Mời bạn vào sân</h2><p>Chọn cách chơi của bạn</p></div><span className="oaq-local-label">Chơi offline</span></div>
     <button ref={play} className="oaq-primary" onClick={()=>setMatch(makeMatch('easy'))}><Play/><span>Luyện với Bot Tí Sún<small>Dễ · Làm quen từng nước rải</small></span><ChevronRight/></button>
     <div className="oaq-mode-row"><button onClick={()=>setMatch(makeMatch('hard'))}><span className="oaq-mode-letter">B</span><span>Bot Bờm<small>Khó · Tính nước sâu hơn</small></span><ChevronRight/></button><button onClick={()=>setMatch(makeMatch('local'))}><Users/><span>2 Người Chung Máy<small>Cùng ngồi, cùng tính nước</small></span><ChevronRight/></button></div>
     <div className="oaq-online"><LockKeyhole/><span>Kết nối bạn bè <small>Sắp có</small></span><div>{['Ghép Trận','Tạo Phòng','Nhập Mã'].map(t=><button key={t} disabled>{t}</button>)}</div></div>
    </div>
    <footer className="oaq-home-footer"><span><Prop frame={0}/> 10 ô Dân</span><span><Prop frame={1}/> 2 ô Quan</span><button onClick={()=>setRules(true)}>Học cách chơi <ArrowRight/></button></footer>
   </section><div className="oaq-scene-caption"><span>SÂN ĐÌNH · BUỔI CHIỀU</span><p>Rải sỏi, tính nước, giữ chút bình yên.</p></div>
  </main>:<MatchBoard key={match.id} match={match} profile={profile} art={art} sound={sound.current} bridge={bridge} blocked={blocked} onProfile={setProfile} onExit={()=>setMatch(null)} onRematch={()=>setMatch(makeMatch(match.kind))}/>}
  {rules&&<OaqDialog title="Rải sỏi, tính một nước hay" onClose={closeRules}><div className="oaq-rules-lead"><Prop frame={0}/><p>Mỗi bên có 5 ô Dân, mỗi ô 5 viên. Hai ô Quan ở hai đầu, mỗi Quan trị giá 10 điểm.</p></div><ol className="oaq-rules-steps"><li><b>Chọn ô của mình</b><span>P1 chơi hàng dưới, P2 chơi hàng trên. Chạm ô hoặc dùng Tab và Enter để chọn.</span></li><li><b>Chọn hướng rải</b><span>Rải Trái hoặc Rải Phải. Ô sáng trên bàn cho biết điểm dừng dự kiến; thử hướng trước khi đi.</span></li><li><b>Ăn quân, giữ Quan</b><span>Gặp một ô trống rồi một ô có quân: ăn quân ở ô tiếp theo. Hai lượt đầu bảo vệ Quan chưa có Dân đi kèm.</span></li><li><b>Tính điểm cuối ván</b><span>Cả hai Quan hết: hốt quân còn lại, trừ nợ rải sinh. Ai nhiều điểm hơn thắng; bằng điểm là hòa.</span></li></ol><p className="oaq-tip">Hết Dân trên sân của mình? Bàn tự rải sinh 5 quân từ điểm tích lũy; phần thiếu được ghi nợ.</p><button className="oaq-primary" onClick={closeRules}><Play/> Đã hiểu, vào sân</button></OaqDialog>}
  {shop&&<FolkShopModal game="o-an-quan" profile={profile} bridge={bridge} onProfileChange={setProfile} onClose={()=>setShop(false)} renderPreview={(canvas,item,tick)=>renderOaqShopPreview(canvas,item,tick,art)}/>}
 </div>;
};

function MatchBoard({match,profile,art,sound,bridge,blocked,onProfile,onExit,onRematch}:{match:Match;profile:FolkProfileSave;art:OaqArtwork;sound:FolkSoundEngine;bridge:GameComponentProps['bridge'];blocked:boolean;onProfile:(p:FolkProfileSave)=>void;onExit:()=>void;onRematch:()=>void}){
 const [state,setState]=useState<OaqState>(createInitialOaqState),[selected,setSelected]=useState<number|null>(null),[notice,setNotice]=useState('Chọn một ô Dân ở hàng dưới để bắt đầu.'),[localPause,setLocalPause]=useState(false);
 const [reward,setReward]=useState<number|null>(null);
 const canvas=useRef<HTMLCanvasElement>(null),done=useRef(false),firstPit=useRef<HTMLButtonElement>(null);
 const bot=match.kind!=='local',botName=match.kind==='easy'?'Bot Tí Sún':'Bot Bờm';
 const disabled=blocked||localPause;
 const activeSeat=bot?'P1':state.turn;
 const canPlay=!disabled&&!state.finished&&state.turn===activeSeat;
 const own=getOwnRange(activeSeat);
 useEffect(()=>{if(!bot||state.turn==='P1')firstPit.current?.focus();},[state.turn,bot]);
 const previews=useMemo(()=>selected===null?[]:(['CW','CCW'] as const).map(direction=>previewOaqLandingCell(state,{cellIndex:selected,direction})).filter((v):v is number=>v!==null),[state,selected]);
 useEffect(()=>{const ctx=canvas.current?.getContext('2d');if(ctx)renderOAnQuanBoard(ctx,state,profile.equippedSkins,selected,previews,art);},[state,profile.equippedSkins,selected,previews,art]);
 useEffect(()=>{
  if(disabled||!bot||state.finished||state.turn!=='P2')return;
  const timer=setTimeout(()=>{
   const move=chooseOaqBotMove(state,'P2',match.kind as OaqBotLevel);if(!move)return;
   const out=applyOaqMove(state,'P2',move);if(!out.ok)return;
   setState(out.nextState);sound.playDropStone(2,getSkinById(profile.equippedSkins.oaq_stones).sfxProfile);
   setNotice(out.nextState.lastCapturedPoints?`${botName} vừa ăn ${out.nextState.lastCapturedPoints} điểm. Đến lượt bạn.`:'Đến lượt của bạn!');
  },650);return()=>clearTimeout(timer);
 },[disabled,bot,state,match.kind,botName,sound,profile.equippedSkins.oaq_stones]);
 useEffect(()=>{
  if(!state.finished||done.current)return;done.current=true;sound.playWin();
  const out=applyMatchReward(profile,{matchId:match.id,game:'o-an-quan',mode:match.kind==='local'?'local_2p':match.kind==='easy'?'bot_easy':'bot_hard',won:state.winner==='P1',isDraw:state.winner==='DRAW',skillBonuses:state.quanCaptured.P1,score:state.scores.P1},bridge);
  onProfile(out.profile);if(!out.alreadyClaimed)setReward(out.candy);
 },[state.finished]);
 const choose=(idx:number)=>{if(canPlay&&own.includes(idx)&&state.cells[idx]>0){setSelected(idx);setNotice(`Đã chọn ô ${idx}. Chọn hướng rải sỏi.`);}};
 const move=(direction:OaqDirection)=>{
  if(!canPlay||selected===null)return;const out=applyOaqMove(state,activeSeat,{cellIndex:selected,direction});
  if(!out.ok){setNotice(out.error??'Nước đi không hợp lệ.');return;}
  sound.playDropStone(0,getSkinById(profile.equippedSkins.oaq_stones).sfxProfile);
  if(out.nextState.lastCapturedPoints)sound.playCapture(out.nextState.lastCapturedPoints>=10);
  setState(out.nextState);setSelected(null);
  setNotice(out.nextState.lastCapturedPoints?`${activeSeat} ăn ${out.nextState.lastCapturedPoints} điểm${out.nextState.lastComboCount>1?' · Ăn kép!':'.'}`:bot?'Đang chờ đối thủ…':`Đến lượt ${out.nextState.turn==='P1'?'Người 1':'Người 2'}.`);
 };
 const rects=getOaqCellRects();
 const panel=(seat:FolkSeat)=> <div className={`fd-hud-strip oaq-player ${state.turn===seat&&!state.finished?'is-active':''}`} data-seat={seat} data-score={state.scores[seat]}><div className="oaq-player-avatar">{seat==='P1'?'1':bot?'B':'2'}</div><div><strong>{seat==='P1'?(bot?'Bạn':'Người chơi 1'):bot?botName:'Người chơi 2'}</strong><small>{state.finished?'Đã kết thúc':state.turn===seat?(bot&&seat==='P2'?'Đang tính nước…':`Đến lượt ${seat==='P1'&&bot?'bạn':seat}`):'Chờ lượt'}{state.debt[seat]>0?` · Nợ ${state.debt[seat]}`:''}</small></div><div className="oaq-player-score"><svg className="oaq-score-tray" aria-hidden="true" viewBox={HAND_RECTS[(HAND_FRAMES[profile.equippedSkins.oaq_hand]??HAND_FRAMES.hand_student)[1]].join(' ')}><image href={OAQ_HANDS_URL} width="1254" height="1254"/></svg><b>{state.scores[seat]}</b><span>điểm</span></div></div>;
 return <main className="oaq-match" data-turn={state.turn} data-turn-number={state.turnNumber}>
  <div className="oaq-match-toolbar"><button className="oaq-text-button" onClick={onExit}><ArrowLeft/> Về sân</button><span>Ván {match.kind==='local'?'hai người':'luyện tập'} <i/> Lượt {state.turnNumber}</span><button className="oaq-text-button" onClick={()=>setLocalPause(true)}><Pause/> Tạm dừng</button></div>
  <div className="oaq-table-wrap">{panel('P2')}<div className="oaq-board-wrap"><canvas ref={canvas} width={BOARD_W} height={BOARD_H} className="fd-pixel-canvas" aria-label="Bàn Ô Ăn Quan: hàng trên P2, hàng dưới P1"/>
   <div className="oaq-pit-inputs">{rects.map(r=><React.Fragment key={r.idx}><span className="oaq-cell-count" aria-hidden="true" style={{left:`${(r.x+6)/BOARD_W*100}%`,top:`${(r.y+6)/BOARD_H*100}%`}}>{r.isQuan&&state.quanAlive[r.idx===0?0:1]?(state.cells[r.idx]?`${state.cells[r.idx]}+Q`:'Q'):state.cells[r.idx]}</span>{!r.isQuan&&<button ref={r.idx===own.find(i=>state.cells[i]>0)?firstPit:undefined} className={`oaq-pit-hit ${selected===r.idx?'is-selected':''}`} style={{left:`${r.x/BOARD_W*100}%`,top:`${r.y/BOARD_H*100}%`,width:`${r.w/BOARD_W*100}%`,height:`${r.h/BOARD_H*100}%`}} disabled={!canPlay||!own.includes(r.idx)||state.cells[r.idx]===0} onClick={()=>choose(r.idx)} aria-label={`Ô ${r.idx}, ${state.cells[r.idx]} quân, ${r.idx<6?'P1':'P2'}`} aria-pressed={selected===r.idx}/>}</React.Fragment>)}</div>
  </div>{panel('P1')}</div>
  <div className="fd-controls-bar oaq-move-controls"><p aria-live="polite">{notice}</p><div><button className="oaq-direction" disabled={selected===null||!canPlay} onClick={()=>move('CCW')}><ArrowLeft/> Rải Trái</button><label className="oaq-selection"><span>Ô Dân của {activeSeat}</span><select aria-label="Chọn ô Dân" disabled={!canPlay} value={selected??''} onChange={e=>choose(Number(e.target.value))}><option value="" disabled>Chọn ô Dân</option>{own.filter(i=>state.cells[i]>0).map(i=><option key={i} value={i}>Ô {i} · {state.cells[i]} quân</option>)}</select></label><button className="oaq-direction" disabled={selected===null||!canPlay} onClick={()=>move('CW')}>Rải Phải <ArrowRight/></button></div></div>
  {state.finished&&<OaqDialog title={state.winner==='DRAW'?'Một ván hòa đẹp!':match.kind==='local'?`Người ${state.winner==='P1'?'1':'2'} thắng!`:state.winner==='P1'?'Bạn đã thắng!':'Hẹn bạn ván sau!'} onClose={onExit}><div className="oaq-result"><Prop frame={1}/><h3>{state.scores.P1} <span>—</span> {state.scores.P2}</h3><p>{match.kind==='local'?'Người 1 · Người 2':`Bạn · ${botName}`}</p>{reward!==null&&<p>Nhận {reward} Kẹo Mạch Nha</p>}<button className="oaq-primary" onClick={onRematch}><RotateCcw/> Đấu Lại</button><button className="oaq-secondary" onClick={onExit}><Home/> Về Sảnh Game</button></div></OaqDialog>}
  {localPause&&<OaqDialog title="Nghỉ tay một chút" onClose={()=>setLocalPause(false)}><p className="oaq-tip">Ván cờ đang chờ bạn. Bot và các thao tác rải đều tạm dừng.</p><button className="oaq-primary" onClick={()=>setLocalPause(false)}><Play/> Chơi tiếp</button><button className="oaq-secondary" onClick={onExit}><Home/> Về sân</button></OaqDialog>}
 </main>;
}
export default OAnQuanGame;
