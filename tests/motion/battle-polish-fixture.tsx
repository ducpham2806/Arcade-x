import React,{useState} from 'react';
import {createRoot} from 'react-dom/client';
import {Board} from '../../src/games/battleship/Board';
import {FleetStatus} from '../../src/games/battleship/FleetStatus';
import {Radar} from '../../src/games/battleship/Radar';
import {useBattleAudio} from '../../src/games/battleship/useBattleAudio';
import {loadArt,type Art} from '../../src/games/battleship/art';
import {autoPlace,createState,setReady,seeded,fire,viewFor,cellsOf,placeShip,activeSeat} from '../../src/games/battleship/engine';
import '../../src/index.css';
import '../../src/games/battleship/battleship.css';
function sunkFleet(){const at=Date.now()-5000;let s=createState('duel',at,0);
 s=placeShip(s,{id:'B1:carrier',owner:'B1',type:'carrier',row:0,col:2,horizontal:false});
 s=placeShip(s,{id:'B1:battleship',owner:'B1',type:'battleship',row:5,col:5,horizontal:true});
 for(const seat of s.seats){s=autoPlace(s,seat,seeded(seat==='A1'?19:29));s=setReady(s,seat,true,at);}
 const targets=s.boards[1].filter(x=>['carrier','battleship'].includes(x.type)).flatMap(cellsOf),own=s.boards[0].flatMap(cellsOf);
 const misses=Array.from({length:100},(_,i)=>({row:Math.floor(i/10),col:i%10})).filter(p=>!own.some(c=>c.row===p.row&&c.col===p.col));
 for(const [i,p]of targets.entries()){
  if(activeSeat(s)==='B1')s=fire(s,'B1',misses[i].row,misses[i].col,at,s.turn,`reply-${i}`);
  s=fire(s,'A1',p.row,p.col,at,s.turn,`hit-${i}`);
 }
 return viewFor(s,'A1');
}
function Fixture({art}:{art:Art}){const [view]=useState(sunkFleet),[paused,setPaused]=useState(false),[reduced,setReduced]=useState(false),[show,setShow]=useState(true);
 const audio=useBattleAudio(null,'radar-fixture','A1','A1',{paused,active:show});
 return <div className="arcade-app bs-game" onPointerDownCapture={audio.gesture}>
  <button onClick={()=>setPaused(v=>!v)}>Pause radar</button><button onClick={()=>setShow(v=>!v)}>Toggle radar</button>{audio.button}<label><input type="checkbox" checked={reduced} onChange={e=>setReduced(e.target.checked)}/>Giảm chuyển động</label>
  <div style={{display:'flex',gap:20}}><div style={{width:800}}><Board view={view} own={false} art={art} faction="us" selected={null} ghost={null} ghostValid reduced={reduced} paused={paused} onCell={()=>{}}/></div><aside style={{width:290}}>{show&&<Radar coordinate="C3" paused={paused} reduced={reduced} onSweep={audio.radar}/>}<FleetStatus art={art} faction="us" view={view} team={0}/></aside></div>
 </div>;
}
loadArt().then(art=>createRoot(document.getElementById('root')!).render(<Fixture art={art}/>));
