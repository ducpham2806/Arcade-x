import React,{useEffect,useRef} from 'react';
import type {Art} from './art';
import {FLEET,type ShipType} from './engine';
import {createCamera} from './projection';
import {drawHaze,drawSea,shipSprite} from './scene';

const LENGTH=Object.fromEntries(FLEET.map(f=>[f.type,f.length])) as Record<ShipType,number>;
const reducedMotion=()=>typeof matchMedia==='function'&&matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Lobby backdrop: the fleet afloat in the same pseudo-3D renderer as the battle board. */
export function HeroScene({art,faction}:{art:Art;faction:'us'|'jp'}){
 const ref=useRef<HTMLCanvasElement>(null);
 useEffect(()=>{const c=ref.current!,ctx=c.getContext('2d')!,still=reducedMotion();let raf=0,last=0;
  const cam=createCamera({width:c.width,height:c.height,pitchDeg:38,distance:1.4,margin:{top:300,right:-60,bottom:-60,left:-60}});
  const enemy=faction==='us'?'jp':'us',n=9;
  // Ships keep to the sides and the near water so the menu column stays readable.
  const fleet=[{img:art.images[`${enemy}-battleship`],row:.6,col:5.4,length:4,height:.5},{img:art.images[`${enemy}-destroyer`],row:1.6,col:.4,length:2,height:.32},
   {img:art.images[`${faction}-heavy-cruiser`],row:5.2,col:6.6,length:3,height:.42},{img:art.images[`${faction}-carrier`],row:7.2,col:-.6,length:5,height:.5}];
  const draw=(t:number)=>{raf=still?0:requestAnimationFrame(draw);if(t-last<40&&!still)return;last=t;
   drawSea(ctx,cam,art,t,!still);
   for(const s of fleet){const sp=shipSprite(cam,{img:s.img,n,row:s.row,col:s.col,length:s.length,horizontal:true,height:s.height}),bob=still?0:Math.sin(t*.0012+s.row)*3;ctx.drawImage(sp.canvas,sp.x,sp.y+bob);}
   drawHaze(ctx,cam,c.height*.42);};
  raf=requestAnimationFrame(draw);return()=>cancelAnimationFrame(raf);
 },[art,faction]);
 return <canvas ref={ref} className="bs-hero-scene" width={1280} height={760} aria-hidden="true"/>;
}

/** A ship drawn at the board's camera angle for fleet cards (static). */
export function ShipThumb({art,image,type,className}:{art:Art;image:string;type:ShipType;className?:string}){
 const ref=useRef<HTMLCanvasElement>(null);
 useEffect(()=>{const c=ref.current!,ctx=c.getContext('2d')!,len=LENGTH[type],n=len+.6;
  const cam=createCamera({width:c.width,height:c.height,pitchDeg:34,distance:1.5,margin:{top:-200,right:4,bottom:-200,left:4}});
  const sp=shipSprite(cam,{img:art.images[image],n,row:(n-1)/2,col:.3,length:len,horizontal:true,height:.6,ghost:true});
  const mid=cam.project(.5,.5).y;ctx.clearRect(0,0,c.width,c.height);ctx.drawImage(sp.canvas,sp.x,sp.y+(c.height/2-mid));
 },[art,image,type]);
 return <canvas ref={ref} className={className} width={220} height={96} aria-hidden="true"/>;
}
