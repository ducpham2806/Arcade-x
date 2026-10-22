import React,{useState,useRef,useEffect,useCallback} from 'react';
import type {GameComponentProps} from '../../types';
import {freshState,restoreState,reduceDungeon,Action,DungeonState} from './engine';
import {FantasyHUD,ReviewTools} from './components/FantasyHUD';

const LEGACY_KEY='tap_titans_dungeon_save_v2';
export type DungeonProgress=Pick<DungeonState,'stage'|'maxStageReached'|'heroLevel'|'bossesSlain'|'monstersSlain'>;
export const DungeonTitanCore:React.FC<GameComponentProps & {onOpenLeaderboard?:()=>void;onProgress?:(progress:DungeonProgress)=>void;reviewTools?:ReviewTools}>=({bridge,isPaused,onGameOver,onOpenLeaderboard,onProgress,reviewTools})=>{
 const [s,setS]=useState<DungeonState>(()=>freshState()),[ready,setReady]=useState(false),[localPause,setLocalPause]=useState(false),[hidden,setHidden]=useState(false),[notice,setNotice]=useState(''),[saveError,setSaveError]=useState(false),[legacy,setLegacy]=useState(false);
 const live=useRef(s);live.current=s;
 const hold=useRef(false),holdClock=useRef(0),overlay=useRef(false),lastSound=useRef(0),saved=useRef(false),lastReport=useRef(0),startKills=useRef(0),soundBridge=useRef(bridge);soundBridge.current=bridge;
 const paused=!!isPaused||localPause||hidden||!ready,pausedRef=useRef(paused);pausedRef.current=paused;
 const stop=useCallback(()=>{hold.current=false;holdClock.current=0;},[]);
 const overlayChanged=useCallback((open:boolean)=>{overlay.current=open;if(open)stop();},[stop]);
 const send=useCallback((action:Action)=>{if(pausedRef.current)return;if(overlay.current&&['tap','parry','tick'].includes(action.type))return;setS(prev=>reduceDungeon(prev,action));},[]);
 useEffect(()=>{let cancelled=false;setReady(false);saved.current=false;stop();
  Promise.resolve().then(()=>bridge.loadGameState<unknown>()).then(raw=>{if(cancelled)return;const restored=restoreState(raw);startKills.current=restored.monstersSlain+restored.bossesSlain;live.current=restored;setS(restored);setReady(true);saved.current=true;try{setLegacy(!raw&&!!localStorage.getItem(LEGACY_KEY));}catch{}}).catch((error:unknown)=>{if(!cancelled){setNotice(error instanceof Error?error.message:'Không đọc được tiến trình. Dữ liệu được giữ nguyên.');setSaveError(true);}});
  return()=>{cancelled=true;};
 },[bridge,stop]);
 const persist=useCallback(()=>{if(!saved.current)return;try{Promise.resolve(bridge.saveGameState(live.current)).then(()=>setSaveError(false)).catch(()=>setSaveError(true));}catch{setSaveError(true);}},[bridge]);
 useEffect(()=>{const timer=setInterval(persist,5000),hide=()=>{setHidden(document.hidden);stop();persist();};window.addEventListener('pagehide',persist);document.addEventListener('visibilitychange',hide);return()=>{clearInterval(timer);window.removeEventListener('pagehide',persist);document.removeEventListener('visibilitychange',hide);persist();};},[persist,stop]);
 useEffect(()=>{let last=performance.now();const timer=setInterval(()=>{const now=performance.now(),dt=Math.min(.25,(now-last)/1000);last=now;if(pausedRef.current||overlay.current)return;
   let tap=false;if(hold.current){holdClock.current+=dt;if(holdClock.current>=.25){holdClock.current%=.25;tap=true;}}
   setS(prev=>{const next=reduceDungeon(prev,{type:'tick',dt});return tap?reduceDungeon(next,{type:'tap'}):next;});
  },100);return()=>clearInterval(timer);},[]);
 useEffect(()=>{if(paused)stop();},[paused,stop]);
 useEffect(()=>{if(!ready||!s.event.id)return;const now=performance.now();if(now-lastSound.current<140)return;lastSound.current=now;try{soundBridge.current.playSound(s.event.kind==='win'?'win':s.event.kind==='loot'?'coin':s.event.kind==='parry'?'parry':s.event.kind==='crit'?'combo':'hit');}catch{}},[s.event.id,ready]);
 useEffect(()=>{if(ready&&s.maxStageReached>lastReport.current){lastReport.current=s.maxStageReached;if(s.maxStageReached>=5)bridge.reportProgress('ach-dungeon-floor-5',s.maxStageReached,true);}},[s.maxStageReached,ready,bridge]);
 useEffect(()=>{if(ready)onProgress?.({stage:s.stage,maxStageReached:s.maxStageReached,heroLevel:s.heroLevel,bossesSlain:s.bossesSlain,monstersSlain:s.monstersSlain});},[ready,s.stage,s.maxStageReached,s.heroLevel,s.bossesSlain,s.monstersSlain,onProgress]);
 const held=()=>{if(pausedRef.current||overlay.current)return;hold.current=true;holdClock.current=0;send({type:'tap'});};
 const importLegacy=()=>{try{const raw=localStorage.getItem(LEGACY_KEY);if(!raw)return;const next=restoreState(JSON.parse(raw));setS(next);live.current=next;setLegacy(false);setNotice('Đã nhập tiến trình. Bản lưu cũ vẫn được giữ.');}catch(e){setNotice(e instanceof Error?e.message:'Không đọc được bản lưu cũ.');}};
 const finish=()=>{persist();const kills=s.monstersSlain+s.bossesSlain-startKills.current;if(kills<1){setNotice('Hoàn thành một trận trước khi tổng kết.');return;}onGameOver?.(s.maxStageReached,{stage:s.stage,maxStageReached:s.maxStageReached,bossesSlain:s.bossesSlain,monstersSlain:s.monstersSlain,gold:s.gold});startKills.current=s.monstersSlain+s.bossesSlain;};
 return <FantasyHUD s={s} send={send} paused={paused} ready={ready} localPause={localPause} onPause={()=>setLocalPause(p=>!p)} held={held} stop={stop} persist={persist} finish={finish} notice={notice} clearNotice={()=>setNotice('')} saveError={saveError} legacy={legacy} importLegacy={importLegacy} dismissLegacy={()=>setLegacy(false)} onOpenLeaderboard={onOpenLeaderboard} overlayChanged={overlayChanged} reviewTools={reviewTools}/>;
};
