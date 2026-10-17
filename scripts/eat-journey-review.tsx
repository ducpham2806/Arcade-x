import React from 'react';
import {createRoot} from 'react-dom/client';
import {EatEmAllGame} from '../src/games/eat-em-all';
import type {GameBridgeAPI} from '../src/types';
const noop=()=>{};
const bridge:GameBridgeAPI={grantCoins:noop,grantExp:noop,grantGems:noop,reportProgress:noop,reportQuest:noop,playSound:noop,recordMove:noop,triggerLootRoll:()=>null,getEquippedSkin:()=> 'default',getSkin:()=> 'default',saveGameState:noop,loadGameState:()=>null,submitScore:async()=>({isNewHighScore:false})};
function Review(){const [key,setKey]=React.useState(0);const [muted,setMuted]=React.useState(true);return <><button onClick={()=>setMuted(!muted)} style={{position:'fixed',right:12,top:6,zIndex:50,background:'#182b3e',color:'white',border:'1px solid #7a92a9',borderRadius:8,padding:7,fontSize:10}}>{muted?'🔇 Bật âm':'🔊 Tắt âm'}</button><div style={{height:'100%',paddingTop:34}}><EatEmAllGame key={key} bridge={bridge} isPaused={false} isMuted={muted} onRestart={()=>setKey(n=>n+1)} onGameOver={()=>setKey(n=>n+1)}/></div></>};
createRoot(document.getElementById('root')!).render(<Review/>);
