import React from 'react';
import {createRoot} from 'react-dom/client';
import TankClash from '../../src/games/tank-clash';
import type {GameComponentProps} from '../../src/types';
const root=createRoot(document.getElementById('app')!);
const forbidden=()=>{throw Error('Tank Clash must not grant rewards or save through the launcher bridge in this release');};
const props:GameComponentProps={isPaused:false,isMuted:true,onGameOver:forbidden,onRestart(){},bridge:{
 submitScore:async()=>forbidden(),grantExp:forbidden,grantCoins:forbidden,grantGems:forbidden,
 reportProgress:forbidden,reportQuest:forbidden,triggerLootRoll:forbidden,playSound(){},
 getEquippedSkin:()=>'',getSkin:()=>'',saveGameState:forbidden,loadGameState:()=>null,
}};
root.render(<TankClash {...props}/>);
(window as any).unmountTankFixture=()=>root.unmount();
