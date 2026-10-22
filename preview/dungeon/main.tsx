import React from 'react';
import { createRoot } from 'react-dom/client';
import { DungeonTitanCore as DungeonTapGame } from '../../src/games/dungeon-tap/DungeonTitanCore';
import { freshState, reduceDungeon } from '../../src/games/dungeon-tap/engine';
import {ArtGallery} from './ArtGallery';
const KEY='dungeon_titan_v6_review_isolated';
let pendingFixture:unknown=null;
let audio:AudioContext|undefined,muted=true;
const bridge={
 loadGameState:()=>{if(pendingFixture){const fixture=pendingFixture;pendingFixture=null;return fixture;}try{return JSON.parse(localStorage.getItem(KEY)||localStorage.getItem('dungeon_titan_v5_review_isolated')||localStorage.getItem('dungeon_titan_v4_review_isolated')||localStorage.getItem('dungeon_titan_v3_review_isolated')||'null')}catch{return null}},
 saveGameState:(s:unknown)=>localStorage.setItem(KEY,JSON.stringify(s)),
 playSound:(kind:string)=>{if(muted)return;try{audio||=new AudioContext();void audio.resume();const osc=audio.createOscillator(),gain=audio.createGain();osc.type='sine';osc.frequency.value=kind==='parry'?680:kind==='win'?440:kind==='coin'?550:180;gain.gain.setValueAtTime(.025,audio.currentTime);gain.gain.exponentialRampToValueAtTime(.001,audio.currentTime+.09);osc.connect(gain);gain.connect(audio.destination);osc.start();osc.stop(audio.currentTime+.1)}catch{}},
 reportProgress:()=>{},
};
function App(){const [mode,setMode]=React.useState('play'),[key,setKey]=React.useState(0),[pause,setPause]=React.useState(false),[sound,setSound]=React.useState(false),[summary,setSummary]=React.useState('');
 const fixture=(stage:number)=>{let s=freshState(18417);s.heroLevel=stage===10?5:Math.max(5,stage-3);s.gold=stage===10?3200:Math.round(100*Math.pow(1.17,stage));s.maxStageReached=stage;s=reduceDungeon(s,{type:'stage',stage});pendingFixture=s;setKey(k=>k+1);setSummary('');};
 return <>
 {mode==='art'?<ArtGallery onBack={()=>setMode('play')} onBattle={stage=>{fixture(stage);setMode('play')}}/>:<DungeonTapGame key={key} bridge={bridge as any} isPaused={pause} isMuted={!sound} onRestart={()=>{setKey(k=>k+1)}} reviewTools={{sound,onSound:()=>{muted=sound;setSound(!sound)},onFixture:fixture,onArt:()=>setMode('art'),onNew:()=>{if(confirm('Chơi mới bản thử v6?')){pendingFixture=freshState();localStorage.removeItem(KEY);setKey(k=>k+1);setPause(false);setSummary('');}}}} onGameOver={(score,stats)=>{setSummary(`Tầng cao nhất: ${score}`);setPause(true)}}/>}
 {summary&&<div className="summary"><h2>HOÀN THÀNH PHIÊN CHƠI</h2><p>{summary}</p><button onClick={()=>{setSummary('');setPause(false)}}>Tiếp tục hành trình</button></div>}</>;
}
createRoot(document.getElementById('root')!).render(<App/>);
