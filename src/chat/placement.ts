/** Hosting chrome reserves a bottom strip outside the game/modal viewport. */
export function chatBottomInset(){const value=parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--arcadex-host-bottom-inset'));return Number.isFinite(value)?Math.max(0,Math.min(innerHeight-100,value)):0;}
export type Point={x:number;y:number};
export type Box={left:number;top:number;right:number;bottom:number};
export const clampPoint=(p:Point,w:number,h:number,size=48):Point=>({x:Math.max(6,Math.min(w-size-6,p.x)),y:Math.max(6,Math.min(h-size-6,p.y))});
export function overlaps(p:Point,w:number,h:number,b:Box){return p.x<b.right+4&&p.x+w>b.left-4&&p.y<b.bottom+4&&p.y+h>b.top-4;}
export function protectedBoxes():Box[]{
 const viewport=document.getElementById('game-wrapper-viewport');
 if(!viewport)return [];
 const elements=viewport.querySelectorAll<HTMLElement>('[data-chat-protect],canvas,iframe,.arcade-board,.nt-stage,.nt-answer,.nt-players,button');
 return [...elements].filter(e=>!e.closest('[data-chat-ui]')).map(e=>e.getBoundingClientRect()).filter(r=>r.width>0&&r.height>0);
}
export function safeBubble(p:Point,width:number,height:number,boxes:Box[],size=48):Point|null{
 const preferred=clampPoint(p,width,height,size),valid=(q:Point)=>!boxes.some(b=>overlaps(q,size,size,b));
 if(valid(preferred))return preferred;
 // Nearest legal position on the perimeter, then the toolbar slot (null).
 const candidates:Point[]=[];for(let y=6;y<=height-size-6;y+=size+8){candidates.push({x:6,y},{x:width-size-6,y});}for(let x=6;x<=width-size-6;x+=size+8)candidates.push({x,y:6});
 return candidates.filter(valid).sort((a,b)=>Math.hypot(a.x-p.x,a.y-p.y)-Math.hypot(b.x-p.x,b.y-p.y))[0]||null;
}
/** Find the nearest free space around a HUD/avatar using the caption's measured size. */
export function speechPosition(target:Box,width:number,height:number,viewportWidth:number,viewportHeight:number,boxes:Box[]):Point|null{
 const cx=(target.left+target.right)/2,cy=(target.top+target.bottom)/2;
 const xs=[target.left,target.right-width,cx-width/2,target.right+8,target.left-width-8];
 const ys=[target.top-height-8,target.bottom+8,cy-height/2];
 for(const b of boxes){xs.push(b.left-width-8,b.right+8);ys.push(b.top-height-8,b.bottom+8);}
 const candidates=xs.flatMap(x=>ys.map(y=>({x:Math.max(12,Math.min(viewportWidth-width-12,x)),y:Math.max(60,Math.min(viewportHeight-height-12,y))})));
 const distance=(p:Point)=>Math.hypot(p.x+width/2-cx,p.y+height/2-cy);
 return candidates.filter(p=>distance(p)<Math.max(280,width+80)&&!boxes.some(b=>overlaps(p,width,height,b))).sort((a,b)=>distance(a)-distance(b))[0]||null;
}
