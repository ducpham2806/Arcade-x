// Test-only deterministic board. Uses the real renderer, engine, sprites and launcher stylesheet.
import React,{useState} from 'react';
import {createRoot} from 'react-dom/client';
import {Board} from '../../src/games/battleship/Board';
import {loadArt,type Art} from '../../src/games/battleship/art';
import {autoPlace,createState,setReady,seeded,fire,viewFor,cellsOf} from '../../src/games/battleship/engine';
import '../../src/index.css';
import '../../src/games/battleship/battleship.css';
function ready(){let s=createState('duel',Date.now(),0);for(const seat of s.seats){s=autoPlace(s,seat,seeded(seat==='A1'?19:29));s=setReady(s,seat,true,Date.now());}return s;}
function Fixture({art}:{art:Art}){
 const [s,setS]=useState(ready),[reduced,setReduced]=useState(false);
 function shoot(hit:boolean){let next=ready();const occupied=next.boards[1].flatMap(cellsOf);let row=occupied[0].row,col=occupied[0].col;
  if(!hit){for(let i=0;i<100;i++)if(!occupied.some(p=>p.row===Math.floor(i/10)&&p.col===i%10)){row=Math.floor(i/10);col=i%10;break;}}
  next=fire(next,'A1',row,col,Date.now(),next.turn,'vfx-test');setS(next);
 }
 return <div className="arcade-app"><label><input type="checkbox" checked={reduced} onChange={e=>setReduced(e.target.checked)}/>Giảm chuyển động</label><button onClick={()=>shoot(true)}>Hit</button><button onClick={()=>shoot(false)}>Miss</button><div style={{width:800}}><Board view={viewFor(s,'A1')} own={false} art={art} faction="us" selected={null} ghost={null} ghostValid reduced={reduced} paused={false} onCell={()=>{}}/></div></div>;
}
loadArt().then(art=>createRoot(document.getElementById('root')!).render(<Fixture art={art}/>));
