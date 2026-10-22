import {PIP_HEAD_TOPS} from './pip-v4-rig.js';
// Pip's art clocks use game time/distance, so pause and blocked movement do not slide feet.
export const PIP_ROOT='art-v4/';
export const PIP_DIRECTIONS=['down','up','left','right'];
export const PIP_ACTIONS=['idle','run','place','hit','victory','defeat'];
export function pipVisual(player,status,time){
 const dir=PIP_DIRECTIONS.includes(player.dir)?player.dir:'down';
 if(status==='lost')return {action:'defeat',dir,clock:0};
 if(status==='exiting'||status==='won')return {action:'victory',dir,clock:time};
 if(Number.isFinite(player.hurtAt)&&time-player.hurtAt>=0&&time-player.hurtAt<280)return {action:'hit',dir,clock:time-player.hurtAt};
 if(Number.isFinite(player.placedAt)&&time-player.placedAt>=0&&time-player.placedAt<320)return {action:'place',dir,clock:time-player.placedAt};
 if(player.moving)return {action:'run',dir,clock:Math.max(0,player.walkDistance||0)};
 return {action:'idle',dir,clock:time};
}
export function pipFrame(action,dir,clock){
 const row=Math.max(0,PIP_DIRECTIONS.indexOf(dir));
 if(action==='idle'||action==='run')return {file:PIP_ROOT+'pip-move.webp',cols:4,rows:4,row,col:action==='idle'?0:[1,2,3,0][Math.floor(Math.max(0,clock)/.28)%4]};
 const col={place:clock<140?0:1,hit:2,victory:3,defeat:4}[action];
 return {file:PIP_ROOT+'pip-actions.webp',cols:5,rows:4,row,col:col??0};
}
export function pipSprite(renderer,ctx,key,x,y,w,h,clock){
 const match=key.match(/^pip_(?:bare|default)\/(idle|run|place|hit|victory|defeat)_(down|up|left|right)$/);if(!match)return false;
 let frame=pipFrame(match[1],match[2],clock),image=renderer.get(frame.file);if(!image&&match[1]!=='idle'&&match[1]!=='run'){frame=pipFrame('idle',match[2],0);image=renderer.get(frame.file);}if(!image)return false;
 const cw=image.naturalWidth/frame.cols,ch=image.naturalHeight/frame.rows;
 ctx.save();ctx.imageSmoothingEnabled=false;
 ctx.drawImage(image,frame.col*cw,frame.row*ch,cw,ch,x,y,w,h);
 ctx.restore();return true;
}
export const PIP_WEAR_DOWN={back:[-.02,.24,1.04,.58],outfit:[.23,.45,.54,.34],shoes:[.25,.74,.5,.16],hair:[.2,.08,.6,.28],face:[.29,.27,.42,.15],hat:[.15,.025,.7,.34]};
export function pipWearAnchor(slot,dir,visual={action:'idle',clock:0}){
 const base=PIP_WEAR_DOWN[slot];if(!base)return null;const a=[...base],side=dir==='left'||dir==='right';
 if(side){
  if(slot==='outfit'){a[0]=.31;a[2]=.38;}
  if(slot==='hat'||slot==='hair'){a[0]+=.06;a[2]-=.12;}
  if(slot==='face'){a[0]=dir==='left'?.22:.6;a[2]=.18;}
  if(slot==='back'){a[0]=dir==='left'?.55:-.08;a[1]=.36;a[2]=.53;a[3]=.42;}
 }
 if(dir==='up'&&slot==='back'){a[0]=.12;a[1]=.34;a[2]=.76;a[3]=.46;}
 // Frame landmarks keep hats attached when the head lowers during crouch/defeat.
 const f=pipFrame(visual.action,dir,visual.clock),landmarks=f.cols===4?PIP_HEAD_TOPS.move:PIP_HEAD_TOPS.actions;
 const headTop=landmarks[f.row*f.cols+f.col]+(visual.action==='victory'?.065:0);
 const shift=headTop-PIP_HEAD_TOPS.move[0];
 if(['hat','hair','face'].includes(slot))a[1]+=shift;
 else if(slot==='outfit'){a[1]+=shift*.82;a[3]=Math.max(.12,a[3]-shift*.66);}
 else if(slot==='back'){a[1]+=shift*.7;a[3]*=Math.max(.55,1-shift);}
 else if(slot==='shoes'){a[1]+=shift*.15;a[3]*=Math.max(.65,1-shift*.5);}
 return a;
}
export function drawPipGround(ctx,x,y,w,h,visual){
 ctx.save();ctx.fillStyle='#10192855';ctx.beginPath();ctx.ellipse(x+w/2,y+h*.9,w*.23,h*.045,0,0,Math.PI*2);ctx.fill();
 if(visual.action!=='defeat'){ctx.strokeStyle='#ffe1a4b3';ctx.lineWidth=1.25;ctx.beginPath();ctx.ellipse(x+w/2,y+h*.915,w*.27,h*.055,0,0,Math.PI);ctx.stroke();}
 ctx.restore();
}
