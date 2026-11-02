import {T,type V} from './core';
import {bossCue,bossPose} from './boss-presentation';
import type {Encounters} from './encounters';
type Sprite=(id:string,position:V,size:number)=>void;
const circle=(c:CanvasRenderingContext2D,p:V,r:number)=>{c.beginPath();c.arc(p.x,p.y,r,0,Math.PI*2);};
const path=(c:CanvasRenderingContext2D,from:V,to:V)=>{c.beginPath();c.moveTo(from.x,from.y);c.lineTo(to.x,to.y);};

export function drawBoss(c:CanvasRenderingContext2D,e:Encounters,time:number,masterArt:boolean,reducedMotion:boolean,sprite:Sprite){
 const b=e.boss;if(!b)return;c.save();
 if(e.state==='telegraph'||e.state==='attack'){
  const attacking=e.state==='attack',cue=bossCue(e,0),{from,to}=e.shot;
  // Exact .65u shot radius, including its round endcaps, as used by Encounters.after.
  c.lineCap='round';c.lineWidth=1.3;c.strokeStyle=attacking?'#ac354cdc':'#eeb34c70';path(c,from,to);c.stroke();
  c.lineWidth=.09;c.strokeStyle=attacking?'#fff2d3':'#81511b';c.setLineDash(attacking?[]:[.22,.22]);path(c,from,to);c.stroke();c.setLineDash([]);
  // Chevrons carry direction without relying on color or flashing.
  const dx=to.x-from.x,dy=to.y-from.y,len=Math.hypot(dx,dy),angle=Math.atan2(dy,dx);
  c.save();c.translate(from.x,from.y);c.rotate(angle);c.lineWidth=.12;c.strokeStyle=attacking?'#fff5da':'#69451c';
  for(let d=3;d<len-.7;d+=3){c.beginPath();c.moveTo(d-.25,-.24);c.lineTo(d,0);c.lineTo(d-.25,.24);c.stroke();}c.restore();
  c.lineWidth=.12;c.strokeStyle=attacking?'#fff5da':'#805122';circle(c,to,.65);c.stroke();
  if(!attacking){c.lineWidth=.16;circle(c,from,2.05);c.strokeStyle='#805122';c.stroke();c.beginPath();c.arc(from.x,from.y,2.05,-Math.PI/2,-Math.PI/2+Math.PI*2*(1-cue.fraction));c.strokeStyle='#ffe39e';c.stroke();}
 }
 c.fillStyle='#193f3c38';c.beginPath();c.ellipse(b.center.x,b.center.y+.85,2.5,1.3,0,0,Math.PI*2);c.fill();
 // The contact rim stays fixed while the cosmetic pose moves within .12u.
 c.lineWidth=.1;c.strokeStyle=e.state==='defeated'?'#829281':'#63465c';c.setLineDash([.18,.18]);circle(c,b.center,1.8);c.stroke();c.setLineDash([]);
 if(masterArt){const p=bossPose(e,time,reducedMotion);c.save();c.globalAlpha=p.opacity;c.translate(b.center.x+p.x,b.center.y+p.y);c.scale(p.scaleX,p.scaleY);sprite('spider_mother',{x:0,y:0},7.2);c.restore();}
 else{c.fillStyle=e.state==='defeated'?'#a1ad95':e.state==='hurt'?'#d9c07b':'#765073';circle(c,b.center,1.8);c.fill();}
 if(e.state==='hurt'){const remaining=Math.max(0,Math.min(1,e.timer/(.6*T.hz)));c.globalAlpha=remaining;c.strokeStyle='#fff6bf';c.lineWidth=.16;circle(c,b.weak,.9+(1-remaining)*.9);c.stroke();}
 c.restore();
}

// Foreground cues remain above snake/terrain; one fixed set, no particle allocations.
export function drawBossTargets(c:CanvasRenderingContext2D,e:Encounters,length:number,masterArt:boolean,sprite:Sprite){
 const b=e.boss;if(!b)return;c.save();
 const text=(s:string,p:V,size:number,ink:string,paper:string)=>{c.font=`700 ${size}px system-ui`;c.textAlign='center';const w=c.measureText(s).width+.4;c.fillStyle=paper;c.beginPath();c.roundRect(p.x-w/2,p.y-size,w,size*1.45,.15);c.fill();c.fillStyle=ink;c.fillText(s,p.x,p.y);}; // readable-canvas: opaque label backing; post and DASH color pairs measure 8.24:1 and 7.62:1
 b.posts.forEach((p,i)=>{if(masterArt)sprite('pillar',p,.85);else{c.fillStyle='#56705e';c.fillRect(p.x-.35,p.y-.35,.7,.7);}c.strokeStyle=e.phase===3&&e.anchors[i]?'#b08424':'#396b5e';c.lineWidth=.12;circle(c,p,.8);c.stroke();text((i?'B':'A')+(e.phase===3&&e.anchors[i]?' ✓':''),{x:p.x,y:p.y+1.55},.45,'#244f44','#faf2d8');});
 if(e.phase===3&&e.state!=='defeated'){
  c.strokeStyle='#426e61';c.lineWidth=.09;c.setLineDash([.18,.18]);path(c,{x:b.posts[0].x,y:b.posts[0].y+1},{x:b.posts[1].x,y:b.posts[1].y+1});c.stroke();c.setLineDash([]);
  const hold=bossCue(e,length).hold;if(hold>0){c.lineWidth=.16;c.strokeStyle='#c69a32';path(c,b.posts[0],{x:b.posts[0].x+(b.posts[1].x-b.posts[0].x)*hold,y:b.posts[0].y});c.stroke();}
 }
 if(e.state!=='defeated'){
  c.fillStyle=e.weakOpen?'#ffe6a0':'#dce5d2';c.strokeStyle=e.weakOpen?'#176958':'#667769';c.lineWidth=.13;circle(c,b.weak,.85);c.fill();c.stroke();
  if(e.weakOpen){c.lineWidth=.17;c.strokeStyle='#176958';c.beginPath();c.arc(b.weak.x,b.weak.y,1.05,-Math.PI/2,-Math.PI/2+Math.PI*2*bossCue(e,length).fraction);c.stroke();text('DASH',{x:b.weak.x,y:b.weak.y+.16},.4,'#194f43','#ffe6a0');}
  else{c.strokeStyle='#4c6557';c.lineWidth=.1;c.beginPath();c.roundRect(b.weak.x-.22,b.weak.y-.1,.44,.35,.05);c.stroke();c.beginPath();c.arc(b.weak.x,b.weak.y-.1,.16,Math.PI,0);c.stroke();}
 }
 c.restore();
}
