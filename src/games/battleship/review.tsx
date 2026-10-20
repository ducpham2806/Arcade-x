import React from 'react';
import {createRoot} from 'react-dom/client';
import {BattleshipGame} from './index';
import type {GameComponentProps} from '../../types';
const props={bridge:{} as GameComponentProps['bridge'],isPaused:false,isMuted:true,onGameOver:()=>{},onRestart:()=>{}};
createRoot(document.getElementById('root')!).render(<BattleshipGame {...props}/>);
