import React,{useEffect,useRef,useState} from 'react';
import {MessageCircle,Pin} from 'lucide-react';
import {useGame} from '../context/GameContext';
import './social.css';
type Point={x:number;y:number};
const clamp=(p:Point):Point=>({x:Math.max(6,Math.min(innerWidth-50,p.x)),y:Math.max(6,Math.min(innerHeight-50,p.y))});
/** Starts in the reserved toolbar slot, away from the board and touch controls. */
export function GameChatBubble(){
 const {openChat,isChatOpen}=useGame();
 const [position,setPosition]=useState<Point|null>(null);
 const drag=useRef<{x:number;y:number;origin:Point}|null>(null),moved=useRef(false);
 useEffect(()=>{const resize=()=>setPosition(p=>p?clamp(p):null);window.addEventListener('resize',resize);return()=>window.removeEventListener('resize',resize);},[]);
 return <span className="game-chat-dock">
  {position&&<button className="game-chat-redock" type="button" aria-label="Đưa chat về thanh công cụ" title="Đưa chat về thanh công cụ" onClick={()=>setPosition(null)}><Pin size={15}/></button>}
  <button type="button" className={`game-chat-bubble${position?' floating':''}`} aria-label="Mở chat — kéo để di chuyển" aria-expanded={isChatOpen} title="Chat · Kéo để di chuyển" style={position?{position:'fixed',left:position.x,top:position.y}:undefined}
   onPointerDown={e=>{if(e.button!==0)return;const r=e.currentTarget.getBoundingClientRect();drag.current={x:e.clientX,y:e.clientY,origin:{x:r.left,y:r.top}};moved.current=false;e.currentTarget.setPointerCapture(e.pointerId);e.stopPropagation();}}
   onPointerMove={e=>{const d=drag.current;if(!d)return;const dx=e.clientX-d.x,dy=e.clientY-d.y;if(Math.hypot(dx,dy)>6)moved.current=true;if(moved.current)setPosition(clamp({x:d.origin.x+dx,y:d.origin.y+dy}));e.stopPropagation();}}
   onPointerUp={e=>{drag.current=null;e.stopPropagation();}}
   onPointerCancel={()=>{drag.current=null;moved.current=true;}}
   onClick={e=>{e.stopPropagation();if(!moved.current)openChat();moved.current=false;}}
   onKeyDown={e=>{if(e.key==='Escape'&&position){e.preventDefault();setPosition(null);}}}
  ><MessageCircle size={19}/></button>
 </span>;
}
