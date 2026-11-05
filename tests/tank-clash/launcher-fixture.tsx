import React from 'react';
import {createRoot} from 'react-dom/client';
import TankClash from '../../src/games/tank-clash';
import type {GameComponentProps} from '../../src/types';
const root=createRoot(document.getElementById('app')!);
root.render(<TankClash {...{isPaused:false,isMuted:true,bridge:{},onGameOver(){},onRestart(){}} as GameComponentProps}/>);
(window as any).unmountTankFixture=()=>root.unmount();
