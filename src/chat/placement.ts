export type Point={x:number;y:number};
export type Box={left:number;top:number;right:number;bottom:number};
export const clampPoint=(p:Point,w:number,h:number,size=48):Point=>({x:Math.max(6,Math.min(w-size-6,p.x)),y:Math.max(6,Math.min(h-size-6,p.y))});
export function overlaps(p:Point,w:number,h:number,b:Box){return p.x<b.right+4&&p.x+w>b.left-4&&p.y<b.bottom+4&&p.y+h>b.top-4;}
export function protectedBoxes():Box[]{return [...document.querySelectorAll<HTMLElement>('#game-wrapper-viewport [data-chat-protect],#game-wrapper-viewport canvas,#game-wrapper-viewport .arcade-board,#game-wrapper-viewport .nt-stage,#game-wrapper-viewport .nt-answer,#game-wrapper-viewport .nt-players,#game-wrapper-viewport button:not(.game-chat-bubble):not(.game-chat-redock)')].filter(e=>!e.closest('[data-chat-ui]')).map(e=>e.getBoundingClientRect()).filter(r=>r.width>0&&r.height>0);}
export function safeBubble(p:Point,width:number,height:number,boxes:Box[],size=48):Point|null{
 const preferred=clampPoint(p,width,height,size),valid=(q:Point)=>!boxes.some(b=>overlaps(q,size,size,b));
 if(valid(preferred))return preferred;
 // Nearest legal position on the perimeter, then the toolbar slot (null).
 const candidates:Point[]=[];for(let y=6;y<=height-size-6;y+=size+8){candidates.push({x:6,y},{x:width-size-6,y});}for(let x=6;x<=width-size-6;x+=size+8)candidates.push({x,y:6});
 return candidates.filter(valid).sort((a,b)=>Math.hypot(a.x-p.x,a.y-p.y)-Math.hypot(b.x-p.x,b.y-p.y))[0]||null;
}
