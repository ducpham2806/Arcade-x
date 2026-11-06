import React,{useState} from 'react';
import {createRoot} from 'react-dom/client';
import {TitanArt} from '../../src/games/dungeon-tap/components/TitanArt';
import {ENEMY_NAMES} from '../../src/games/dungeon-tap/components/RasterSprite';
import '../../src/games/dungeon-tap/fantasy.css';
import '../../src/games/dungeon-tap/unified-v6-2.css';
import '../../src/games/dungeon-tap/polish.css';
function Fixture(){const [extra,setExtra]=useState(false);return <div className="fx-root"><button onClick={()=>setExtra(v=>!v)}>Đổi quân</button><div style={{position:'relative',width:240,height:240}}><TitanArt chapter={1} monsterName={ENEMY_NAMES[0][extra?3:0]}/></div></div>;}
createRoot(document.getElementById('root')!).render(<Fixture/>);
