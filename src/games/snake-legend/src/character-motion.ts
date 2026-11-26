import type {Engine,V} from './core';
import {clamp,T} from './core';
import {B01,type Encounters} from './encounters';

type Frame={x:number;y:number;w:number;h:number};
const TAU=Math.PI*2;
const ease=(n:number)=>{const t=clamp(n,0,1);return t*t*(3-2*t);};

// A presentation rig on the existing painted master, not generated video frames.
// All phases read simulation time; no wall clock, timers, randomness or engine writes.
export function snakeExpression(e:Engine,reduced=false){
 const age=e.time-e.lastPickup,chew=age>=0&&age<.3?Math.sin(age/.3*Math.PI):0;
 const cycle=e.time%3.2,blink=cycle>2.95?Math.sin((cycle-2.95)/.25*Math.PI):0;
 const flick=e.time%1.2,tongue=flick>.94?Math.sin((flick-.94)/.26*Math.PI):0;
 return {blink:e.status==='lost'?1:reduced?0:blink,tongue:reduced||e.status!=='running'||e.dashing||chew>0?0:tongue,chew:reduced?0:chew,determined:e.dashing,won:e.status==='won'};
}

export function drawSnakeExpression(c:CanvasRenderingContext2D,e:Engine,image:CanvasImageSource,frame:Frame,p:V,size:number,angle:number,reduced=false){
 const pose=snakeExpression(e,reduced);
 c.save();c.translate(p.x,p.y);c.rotate(angle);c.scale(size,size);
 // The neck/root stays fixed. Chewing affects only the head silhouette, never the body path.
 c.scale(1+pose.chew*.035,1-pose.chew*.035);
 c.drawImage(image,frame.x,frame.y,frame.w,frame.h,-.5,-.5,1,1);
 if(pose.blink>.1){
  c.fillStyle='#709d79';c.strokeStyle='#275d50';c.lineWidth=.018;
  for(const y of [-.19,.18]){c.beginPath();c.ellipse(.273,y,.068,.087*pose.blink,0,0,TAU);c.fill();if(pose.blink>.8){c.beginPath();c.moveTo(.22,y);c.quadraticCurveTo(.273,y+.02,.326,y);c.stroke();}}
 }
 if(pose.determined){c.strokeStyle='#325e4a';c.lineWidth=.025;c.lineCap='round';for(const side of [-1,1]){c.beginPath();c.moveTo(.22,.27*side);c.lineTo(.33,.22*side);c.stroke();}}
 if(pose.tongue>0){c.strokeStyle='#b75d65';c.lineWidth=.025;c.lineCap='round';const tip=.44+pose.tongue*.18;c.beginPath();c.moveTo(.43,0);c.lineTo(tip,0);c.moveTo(tip,0);c.lineTo(tip+.035,-.027);c.moveTo(tip,0);c.lineTo(tip+.035,.027);c.stroke();}
 if(pose.won){c.strokeStyle='#315e4b';c.lineWidth=.018;c.beginPath();c.moveTo(.32,-.035);c.quadraticCurveTo(.4,.035,.43,-.015);c.stroke();}
 c.restore();
}

// Eight separately registered limbs. The body mask hides the roots, not the tips.
// Source slices retain their authored pixel scale and share the master pivot (.5,.3).
export const MOTHER_LIMBS=[
 {y:.105,h:.255,rootX:.33,rootY:.24},
 {y:.36,h:.185,rootX:.32,rootY:.445},
 {y:.545,h:.16,rootX:.35,rootY:.60},
 {y:.705,h:.20,rootX:.39,rootY:.745},
] as const;
export function motherLegAngle(e:Encounters,time:number,pair:number,side:number,reduced=false){
 if(reduced)return 0;
 const sign=pair%2?1:-1;
 if(e.state==='defeated')return side*(pair<2?-.14:.14);
 if(e.state==='telegraph'){const p=1-clamp(e.timer/(B01.telegraph[e.phase-1]*T.hz),0,1);return side*sign*.12*ease(p);}
 if(e.state==='attack')return side*sign*(.12-.20*Math.sin(ease(1-e.timer/(B01.attack*T.hz))*Math.PI));
 if(e.state==='recovery')return side*sign*.12*(1-ease(1-e.timer/(B01.recovery*T.hz)));
 if(e.state==='hurt')return side*sign*.12*Math.sin(clamp(1-e.timer/(.6*T.hz),0,1)*Math.PI*3);
 return side*sign*Math.sin(time*TAU/1.6+pair*.8)*(e.state==='weak'?.025:.055);
}

export function drawMotherRig(c:CanvasRenderingContext2D,e:Encounters,time:number,image:CanvasImageSource,frame:Frame,p:V,size:number,reduced=false){
 c.save();c.translate(p.x,p.y);c.scale(size,size);c.translate(-.5,-.3);
 if(reduced){c.drawImage(image,frame.x,frame.y,frame.w,frame.h,0,0,1,1);c.restore();return;}
 for(const side of [-1,1])for(let pair=0;pair<MOTHER_LIMBS.length;pair++){
  const part=MOTHER_LIMBS[pair],x=side===-1?0:.64,rootX=side===-1?part.rootX:1-part.rootX;
  c.save();c.translate(rootX,part.rootY);c.rotate(motherLegAngle(e,time,pair,side));c.translate(-rootX,-part.rootY);
  c.drawImage(image,frame.x+x*frame.w,frame.y+part.y*frame.h,frame.w*.36,part.h*frame.h,x,part.y,.36,part.h);c.restore();
 }
 // Restore the central abdomen and face over the limb roots at the fixed anchor.
 c.save();c.beginPath();c.moveTo(.5,.105);
 c.bezierCurveTo(.75,.105,.79,.36,.69,.565);c.bezierCurveTo(.67,.61,.68,.66,.72,.705);
 c.bezierCurveTo(.78,.84,.64,.905,.5,.905);c.bezierCurveTo(.36,.905,.22,.84,.28,.705);
 c.bezierCurveTo(.32,.66,.33,.61,.31,.565);c.bezierCurveTo(.21,.36,.25,.105,.5,.105);
 c.closePath();c.clip();c.drawImage(image,frame.x,frame.y,frame.w,frame.h,0,0,1,1);c.restore();c.restore();
}
