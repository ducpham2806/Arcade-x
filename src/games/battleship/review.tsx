import React,{useState} from 'react';
import {RoomLab} from './RoomLab';
import {createRoot} from 'react-dom/client';
import {BattleshipGame} from './index';
import type {GameComponentProps} from '../../types';
const props={bridge:{} as GameComponentProps['bridge'],isPaused:false,isMuted:false,onGameOver:()=>{},onRestart:()=>{}};
function Review(){const [lab,setLab]=useState(false);return lab?<RoomLab onClose={()=>setLab(false)}/>:<BattleshipGame {...props} onRoomLab={()=>setLab(true)}/>;}
createRoot(document.getElementById('root')!).render(<Review/>);
