import type {Rect} from './core';
import {assetData} from './assets';
export type DeckPart={id:'bridge_start'|'bridge_mid'|'bridge_end';x:number;length:number;sourceFraction:number};
/** Half-open coverage intervals, fixed caps and a cropped final interior tile. */
export function bridgeParts(length:number,height:number):DeckPart[]{
 if(!Number.isFinite(length)||!Number.isFinite(height)||length<=0||height<=0)throw Error('Invalid bridge span');
 const cap=Math.min(height*.8,length/2),parts:DeckPart[]=[{id:'bridge_start',x:0,length:cap,sourceFraction:1}];let x=cap;const end=length-cap;
 while(x<end-1e-9){const size=Math.min(height*.8,end-x);parts.push({id:'bridge_mid',x,length:size,sourceFraction:size/(height*.8)});x+=size;}
 parts.push({id:'bridge_end',x:end,length:cap,sourceFraction:1});return parts;
}
export class TerrainPainter{
 private patterns=new Map<string,CanvasPattern>();private patternCanvases:HTMLCanvasElement[]=[];
 constructor(private ctx:CanvasRenderingContext2D,private image:HTMLImageElement){}
 private frame(id:string){return (assetData.r01_terrain.atlas.frames as Record<string,{frame:{x:number;y:number;w:number;h:number}}>)[id]?.frame;}
 private pattern(id:'grass'|'water'){
  if(this.patterns.has(id))return this.patterns.get(id)!;if(!this.image.complete||!this.image.naturalWidth)return null;
  const tile=document.createElement('canvas');tile.width=tile.height=256;const c=tile.getContext('2d')!,r=this.frame(id)!;
  for(const [x,y,flipX,flipY] of [[0,0,false,false],[128,0,true,false],[0,128,false,true],[128,128,true,true]] as const){c.save();c.translate(x+(flipX?128:0),y+(flipY?128:0));c.scale(flipX?-1:1,flipY?-1:1);c.drawImage(this.image,r.x,r.y,r.w,r.h,0,0,128,128);c.restore();}
  const p=this.ctx.createPattern(tile,'repeat');if(!p)return null;p.setTransform(new DOMMatrix().scale((id==='grass'?16:12)/256));this.patterns.set(id,p);this.patternCanvases.push(tile);return p;
 }
 grass(w:number,h:number){const p=this.pattern('grass');if(!p)return;this.ctx.fillStyle=p;this.ctx.fillRect(0,0,w,h);}
 water(b:Rect){const c=this.ctx,p=this.pattern('water');if(p){c.fillStyle=p;c.fillRect(b.x,b.y,b.w,b.h);}c.save();c.beginPath();c.rect(b.x,b.y,b.w,b.h);c.clip();c.strokeStyle='#c4be8b';c.lineWidth=.22;c.strokeRect(b.x+.11,b.y+.11,Math.max(0,b.w-.22),Math.max(0,b.h-.22));c.restore();}
 bridge(b:Rect){if(!this.image.complete||!this.image.naturalWidth)return;const c=this.ctx;c.fillStyle='#a77b42';c.fillRect(b.x,b.y,b.w,b.h);for(const part of bridgeParts(b.w,b.h)){const r=this.frame(part.id)!;c.drawImage(this.image,r.x,r.y,r.w*part.sourceFraction,r.h,b.x+part.x,b.y,part.length,b.h);} }
 fence(b:Rect){if(!this.image.complete||!this.image.naturalWidth)return false;const vertical=b.h>=b.w,long=Math.max(b.w,b.h),short=Math.min(b.w,b.h);if(long/short<2.5)return false;const r=this.frame('fence')!,c=this.ctx;c.save();if(vertical)c.translate(b.x,b.y);else{c.translate(b.x+b.w,b.y);c.rotate(Math.PI/2);}const cap=Math.min(short,long/2);c.drawImage(this.image,r.x,r.y,r.w,64,0,0,short,cap);let at=cap;while(at<long-cap-1e-9){const length=Math.min(short*2,long-cap-at);c.drawImage(this.image,r.x,r.y+64,r.w,128*length/(short*2),0,at,short,length);at+=length;}c.drawImage(this.image,r.x,r.y+192,r.w,64,0,long-cap,short,cap);c.restore();return true;}
 destroy(){this.patterns.clear();for(const c of this.patternCanvases)c.width=c.height=0;this.patternCanvases=[];}
}
