import React,{Suspense,useEffect,useMemo,useRef,useState} from 'react';
import type {GameBridgeAPI} from '../types';
import {finishTrial,saveTrial,type TrialRun} from './store-api';
import './access-admin.css';
const TileGame=React.lazy(()=>import('../games/tile-2048').then(m=>({default:m.Tile2048Game})));
class TrialBoundary extends React.Component<{children:React.ReactNode;onExit:()=>void},{failed:boolean}>{
 state={failed:false};
 static getDerivedStateFromError(){return {failed:true}}
 render(){return this.state.failed?<div role="alert"><p>Chưa tải hoặc chạy được game. Quay lại cửa hàng rồi mở lại để lấy bàn đã lưu trên máy chủ.</p><button onClick={this.props.onExit}>Quay lại cửa hàng</button></div>:this.props.children}
}
export function TrialExperience({run,onClose}:{run:TrialRun;onClose:()=>void}){
 const [error,setError]=useState('');const [busy,setBusy]=useState(false);const [hidden,setHidden]=useState(document.hidden);const [done,setDone]=useState(false);const [score,setScore]=useState(0);
 const revision=useRef(run.revision);const pending=useRef<unknown>(null);const inFlight=useRef<Promise<void>|null>(null);const lastSaved=useRef(JSON.stringify(run.saved_state));const timer=useRef<ReturnType<typeof setTimeout>|null>(null);const alive=useRef(true);const ending=useRef(false);
 async function flush(){
  if(inFlight.current)return inFlight.current;
  const task=(async()=>{while(pending.current!==null){const snapshot=pending.current;const text=JSON.stringify(snapshot);if(text===lastSaved.current){pending.current=null;continue;}
   try{const next=await saveTrial(run.id,revision.current,snapshot);revision.current=next;lastSaved.current=text;if(pending.current===snapshot)pending.current=null;}
   catch(e){if(alive.current)setError(e instanceof Error?e.message:'Chưa lưu được bàn chơi.');throw e;}
  }})();inFlight.current=task;try{await task;}finally{inFlight.current=null;}
 }
 useEffect(()=>{alive.current=true;window.dispatchEvent(new CustomEvent('arcadex:trial-active',{detail:true}));const visibility=()=>setHidden(document.hidden);const before=(e:BeforeUnloadEvent)=>{if(pending.current!==null){e.preventDefault();e.returnValue='';}};document.addEventListener('visibilitychange',visibility);window.addEventListener('beforeunload',before);return()=>{alive.current=false;if(timer.current)clearTimeout(timer.current);document.removeEventListener('visibilitychange',visibility);window.removeEventListener('beforeunload',before);window.dispatchEvent(new CustomEvent('arcadex:trial-active',{detail:false}));}},[]);
 const bridge=useMemo<GameBridgeAPI>(()=>({
  submitScore:async()=>({isNewHighScore:false}),grantExp:()=>{},grantCoins:()=>{},grantGems:()=>{},reportProgress:()=>{},reportQuest:()=>{},triggerLootRoll:()=>null,playSound:()=>{},getEquippedSkin:()=> 'default',getSkin:()=> 'default',
  loadGameState:<T,>()=>run.saved_state as T|null,
  saveGameState:(value)=>{if(ending.current)return;pending.current=value;if(timer.current)clearTimeout(timer.current);timer.current=setTimeout(()=>void flush().catch(()=>{}),400);},
 }),[run.id]);
 async function leave(){if(busy)return;setBusy(true);try{await flush();if(done)await finishTrial(run.id);onClose()}catch{}finally{if(alive.current)setBusy(false)}}
 async function complete(finalScore:number){if(ending.current)return;ending.current=true;setScore(finalScore);setDone(true);setBusy(true);try{await flush();await finishTrial(run.id)}catch(e){setError(e instanceof Error?e.message:'Chưa xác nhận kết thúc.')}finally{setBusy(false)}}
 return <div className="trial-experience">
  <header><div><strong>2048 · Chơi thử</strong><p>Một ván cổ điển · Không ghi bảng xếp hạng</p></div><button className="launcher-secondary" disabled={busy} onClick={()=>void leave()}>Lưu & quay lại</button></header>
  <p className="trial-info">Có thể tiếp tục bàn này đến {new Date(run.resume_until).toLocaleString('vi-VN')}. Hạn này giới hạn việc mở lại, không cắt ngang ván đang chơi.</p>
  {error&&<div role="alert" className="trial-error"><p>{error}</p><button disabled={busy} onClick={async()=>{setBusy(true);try{await flush();if(done)await finishTrial(run.id);setError('')}catch{}finally{setBusy(false)}}}>Thử lưu lại</button><p>Nếu báo thay đổi ở tab khác, hãy đóng tab này và mở lại bản đã lưu.</p></div>}
  {done?<section className="trial-result"><h3>Đã hoàn thành lượt chơi thử</h3><strong>{score.toLocaleString('vi-VN')} điểm</strong><p>Bàn chơi được lưu trong tài khoản. Xem gói để tiếp tục trải nghiệm đầy đủ khi cửa hàng mở bán.</p><button disabled={busy||!!error} className="launcher-secondary" onClick={onClose}>Xem gói game</button></section>:<TrialBoundary onExit={()=>void leave()}><Suspense fallback={<p role="status">Đang tải 2048…</p>}><TileGame trialMode initialState={run.saved_state??undefined} bridge={bridge} isPaused={hidden||busy||!!error} isMuted onGameOver={score=>void complete(score)} onRestart={()=>{}}/></Suspense></TrialBoundary>}
 </div>
}
