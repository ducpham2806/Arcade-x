import {createPortal} from 'react-dom';
import React,{useState} from 'react';
import type {GameMetadata} from '../types';
import {GAME_ONBOARDING_DATA} from '../data/gameOnboardingData';
import {GameArtwork} from '../visuals/gameArt';
import {Play,ArrowLeft,Volume2,VolumeX} from 'lucide-react';
import {useDialogFocus} from '../launcher/useDialogFocus';
interface Props {gameMeta:GameMetadata;isDailyChallengeMode?:boolean;isPracticeMode?:boolean;highScore?:number;isSoundMuted?:boolean;onToggleSound?:()=>void;onStartGame:()=>void;onExit:()=>void}
export const PreGameLoadingScreen:React.FC<Props>=({gameMeta,isSoundMuted,onToggleSound,onStartGame,onExit})=>{
 const [remember,setRemember]=useState(true);const ref=useDialogFocus(onExit);const guide=GAME_ONBOARDING_DATA[gameMeta.id];
 const start=()=>{try{if(remember)localStorage.setItem(`launcher_guide_seen_${gameMeta.id}`,'true');}catch{}onStartGame();};
 return createPortal(<div className="launcher-dialog-overlay"><section ref={ref} role="dialog" aria-modal="true" aria-labelledby="pregame-title" tabIndex={-1} className="launcher-dialog">
  <header><div><p className="launcher-eyebrow">LẦN ĐẦU CHƠI TRÒ NÀY?</p><h2 id="pregame-title">{gameMeta.title}</h2></div><button aria-label={isSoundMuted?'Bật âm thanh':'Tắt âm thanh'} className="launcher-icon" onClick={onToggleSound}>{isSoundMuted?<VolumeX size={20}/>:<Volume2 size={20}/>}</button></header>
  <div className="launcher-dialog-body"><div className="guide-art"><GameArtwork gameId={gameMeta.id} variant="icon"/></div><p className="mb-4 font-semibold">{guide?.headlineObjective||gameMeta.shortDesc}</p><ul>{(guide?.rules||['Làm theo hướng dẫn bên trong trò chơi.']).slice(0,3).map(rule=><li key={rule}>{rule}</li>)}</ul><div className="guide-controls">{gameMeta.controls.slice(0,3).map((control,i)=><div key={i}><span>{control.action}</span><kbd>{control.key}</kbd></div>)}</div>{guide?.mobileGestures.slice(0,2).map((gesture,i)=><p className="launcher-small" key={i}>{gesture.gesture}: {gesture.action}</p>)}<label className="flex items-center gap-3 mt-6 text-sm"><input type="checkbox" checked={remember} onChange={e=>setRemember(e.target.checked)}/>Lần sau vào thẳng game này</label></div>
  <footer><button className="launcher-secondary" onClick={onExit}><ArrowLeft size={18}/>Thư viện</button><button id="btn-pregame-start" className="launcher-primary" onClick={start}><Play size={18} fill="currentColor"/>Bắt đầu chơi</button></footer>
 </section></div>,document.body);
};

