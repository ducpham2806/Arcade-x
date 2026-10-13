import React from 'react';
import {createRoot} from 'react-dom/client';
import RainbowBlocks from './index';
import type {GameBridgeAPI} from '../../types';
const saveKey='rainbow-review-session';
let initialState:unknown;try{initialState=JSON.parse(localStorage.getItem(saveKey)||'null');}catch{}
const bridge:GameBridgeAPI={submitScore:async()=>({isNewHighScore:false}),grantExp:()=>{},grantCoins:()=>{},grantGems:()=>{},reportProgress:()=>{},reportQuest:()=>{},triggerLootRoll:()=>null,playSound:()=>{},getEquippedSkin:()=>'',getSkin:()=>'',saveGameState:data=>{try{localStorage.setItem(saveKey,JSON.stringify(data));}catch{}},loadGameState:()=>null,recordMove:()=>{},updateSessionState:()=>{}};
createRoot(document.getElementById('root')!).render(<RainbowBlocks bridge={bridge} initialState={initialState} isPaused={false} isMuted={false} onGameOver={()=>{}} onRestart={()=>{}}/>);
