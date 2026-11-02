import type {Engine,Rect,V} from './core';
import type {StoryPropId} from './story-prop-assets';
type Sprite=(id:StoryPropId,p:V,size:number)=>boolean;
export function propStates(e:Engine){const s=e.arena.story;return {exit:s&&s.goal!=='timed_collect'?(e.goalReady?'exit_ready':'exit_closed') as StoryPropId:null,switch:s?.switch?(e.switchOn?'switch_on':'switch_off') as StoryPropId:null,barrier:s?.gate?(e.switchOn?'open':'closed'):null};}
const circle=(c:CanvasRenderingContext2D,p:V,r:number)=>{c.beginPath();c.arc(p.x,p.y,r,0,Math.PI*2);};
export function drawStoryProps(c:CanvasRenderingContext2D,e:Engine,sprite:Sprite,fence:(b:Rect)=>boolean,reducedMotion:boolean){
 const s=e.arena.story;if(!s)return;const state=propStates(e);c.save();
 if(s.gate){const b=s.gate;if(!e.switchOn){if(!fence(b)){c.fillStyle='#bd8a3c';c.fillRect(b.x,b.y,b.w,b.h);}c.strokeStyle='#825521';c.lineWidth=.1;c.strokeRect(b.x,b.y,b.w,b.h);}else{c.strokeStyle='#507961';c.lineWidth=.06;c.setLineDash([.2,.2]);c.strokeRect(b.x,b.y,b.w,b.h);c.setLineDash([]);}}
 if(s.switch){const p=s.switch;if(!sprite(state.switch!,p,2.5)){c.fillStyle=e.switchOn?'#e8bb54':'#236c7c';c.fillRect(p.x-.85,p.y-.85,1.7,1.7);}c.strokeStyle=e.switchOn?'#8b6425':'#2a6358';c.lineWidth=.08;circle(c,p,1);c.stroke();}
 if(state.exit){const p=s.exit;c.fillStyle=e.goalReady?'#ffe4a0':'#789b7088';circle(c,p,1);c.fill();c.lineWidth=e.goalReady?.1:.06;c.strokeStyle=e.goalReady?'#977025':'#52725b';c.setLineDash(e.goalReady?[]:[.15,.15]);circle(c,p,1);c.stroke();c.setLineDash([]);sprite(state.exit,p,3.25);
  if(e.goalReady){c.lineWidth=.055;c.strokeStyle='#a97e2a';circle(c,p,reducedMotion?1.55:1.5+Math.sin(e.time*3)*.06);c.stroke();}
 }
 c.restore();
}
export function drawStoryPropLabels(c:CanvasRenderingContext2D,e:Engine,minFont=0){const s=e.arena.story;if(!s)return;c.save();
 const label=(text:string,p:V,ready:boolean)=>{const size=Math.max(.4,minFont);c.font=`700 ${size}px system-ui`;c.textAlign='center';const w=c.measureText(text).width+.4;c.fillStyle=ready?'#f9edbb':'#f0f2df';c.beginPath();c.roundRect(p.x-w/2,p.y-size,w,size*1.5,.13);c.fill();c.fillStyle=ready?'#71531f':'#345c48';c.fillText(text,p.x,p.y);}; // readable-canvas: opaque label backing; ready and locked color pairs measure 6.04:1 and 6.67:1
 if(s.goal!=='timed_collect')label(e.goalReady?'VÀO CỔNG':'CỔNG KHÓA',{x:s.exit.x,y:s.exit.y-1.85},e.goalReady);
 if(s.switch)label(e.switchOn?'ĐÃ CHỐT ✓':'CHẠM CÔNG TẮC',{x:s.switch.x,y:s.switch.y-1.65},e.switchOn);
 if(s.gate)label(e.switchOn?'ĐƯỜNG ĐÃ MỞ':'CỬA KHÓA',{x:s.gate.x+s.gate.w/2,y:s.gate.y-.5},e.switchOn);
 c.restore();
}
