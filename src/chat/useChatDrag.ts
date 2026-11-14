import {useEffect,useRef,useState} from 'react';
import {clampPoint,protectedBoxes,safeBubble,type Point} from './placement';
export function useChatDrag(key:string,inGame:boolean,size=48){
 const [position,setPosition]=useState<Point|null>(null),drag=useRef<{start:Point;origin:Point;id:number}|null>(null),moved=useRef(false);
 const storageKey=()=>`arcadex.chat.position.v1:${key}:${innerWidth>innerHeight?'landscape':'portrait'}`;
 const safe=(p:Point)=>inGame?safeBubble(p,innerWidth,innerHeight,protectedBoxes(),size):clampPoint(p,innerWidth,innerHeight,size);
 const persist=(p:Point|null)=>{try{localStorage.setItem(storageKey(),JSON.stringify(p?{x:p.x/innerWidth,y:p.y/innerHeight}:null));}catch{/* optional */}};
 useEffect(()=>{const restore=()=>{try{const p=JSON.parse(localStorage.getItem(storageKey())||'null');setPosition(p&&Number.isFinite(p.x)&&Number.isFinite(p.y)?safe({x:p.x*innerWidth,y:p.y*innerHeight}):null);}catch{setPosition(null);}};restore();window.addEventListener('resize',restore);return()=>window.removeEventListener('resize',restore);},[key,inGame]);
 const reset=()=>{setPosition(null);persist(null);};
 return {position,reset,style:position?{position:'fixed' as const,left:position.x,top:position.y}:undefined,events:{
  onPointerDown:(e:React.PointerEvent<HTMLElement>)=>{if(e.button!==0)return;const r=(e.currentTarget.closest('.chat-floating-panel')||e.currentTarget).getBoundingClientRect();drag.current={start:{x:e.clientX,y:e.clientY},origin:{x:r.left,y:r.top},id:e.pointerId};moved.current=false;e.currentTarget.setPointerCapture(e.pointerId);e.stopPropagation();},
  onPointerMove:(e:React.PointerEvent<HTMLElement>)=>{const d=drag.current;if(!d)return;const dx=e.clientX-d.start.x,dy=e.clientY-d.start.y;if(Math.hypot(dx,dy)>7)moved.current=true;if(moved.current)setPosition(clampPoint({x:d.origin.x+dx,y:d.origin.y+dy},innerWidth,innerHeight,size));e.stopPropagation();},
  onPointerUp:(e:React.PointerEvent<HTMLElement>)=>{if(drag.current&&moved.current){const d=drag.current,p=safe({x:d.origin.x+e.clientX-d.start.x,y:d.origin.y+e.clientY-d.start.y});setPosition(p);persist(p);}drag.current=null;e.stopPropagation();},
  onPointerCancel:()=>{drag.current=null;moved.current=true;reset();},
  onKeyDown:(e:React.KeyboardEvent<HTMLElement>)=>{if(e.key==='Escape'&&position){e.preventDefault();reset();}if(!e.key.startsWith('Arrow'))return;e.preventDefault();const r=e.currentTarget.getBoundingClientRect(),p=safe({x:r.left+(e.key==='ArrowLeft'?-24:e.key==='ArrowRight'?24:0),y:r.top+(e.key==='ArrowUp'?-24:e.key==='ArrowDown'?24:0)});setPosition(p);persist(p);},
 },clicked:()=>{const value=!moved.current;moved.current=false;return value;}};
}
