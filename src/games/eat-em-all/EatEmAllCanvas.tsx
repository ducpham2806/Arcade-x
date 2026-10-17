import React, { useEffect, useRef, useState } from 'react';
import type { ActivePowerUps, BackgroundTheme, ElementMode, FallingItem, ItemType, PowerUpType } from './types';
import type { CampaignStage } from './campaign';
import { bossPhase, planDrop } from './encounters';
import { ART_SOURCES, artUrl, worldUrl } from './art';
import { eatAudio } from './audio';
import {AURAS} from './economy';
import type {AuraId} from './economy';

interface EatEmAllCanvasProps {
  celebrating?:boolean; celebrationProgress?:number; celebrationPaused?:boolean; playerMode:ElementMode; onSwitchMode:()=>void; isPaused:boolean; isGameOver:boolean; isMuted:boolean; lives:number;
  furyActive:boolean; speedMultiplier:number; spawnIntervalMs:number; bombChance:number; poisonChance:number;
  powerUpChance?:number; combo:number; comboMultiplier:number; comboDecayRatio:number; activePowerUps:ActivePowerUps;
  auraId?:AuraId|null; currentTheme:BackgroundTheme; onEatItem:(item:FallingItem)=>void; onHitHazard:(item:FallingItem)=>void;
  onCollectPowerUp:(type:PowerUpType)=>void; onConsumeShield:()=>void; targetItems?:Partial<Record<ItemType,number>>;
  remainingTargets?:Partial<Record<ItemType,number>>; skinId?:string; campaignStage?:CampaignStage; stageElapsed?:number;
}
type Mote={x:number;y:number;vx:number;vy:number;age:number;ttl:number;color:string;size:number};
type Label={x:number;y:number;age:number;text:string;color:string};
const imageCache=new Map<string,Promise<HTMLImageElement>>();
function loadImage(key:string):Promise<HTMLImageElement>{
  let promise=imageCache.get(key);if(!promise){promise=new Promise((resolve,reject)=>{const image=new Image();image.onload=()=>resolve(image);image.onerror=reject;image.src=key==='world'?worldUrl:artUrl(key);});imageCache.set(key,promise);}return promise;
}
const palette=['#79d7b2','#e8a565','#9dc6ec','#c4a2e4'];
const MAX_PARTICLES=96,MAX_ITEMS=32,MAX_LABELS=12;
export const EatEmAllCanvas:React.FC<EatEmAllCanvasProps>=(props)=>{
  const canvasRef=useRef<HTMLCanvasElement>(null),containerRef=useRef<HTMLDivElement>(null);
  const live=useRef(props);live.current=props;
  const [assetState,setAssetState]=useState<'loading'|'ready'|'fallback'>('loading');
  const artRef=useRef<Record<string,CanvasImageSource>>({});
  const body=useRef({x:180,target:180,y:360,r:42,chew:0,hurt:0,turn:0,prevElement:props.playerMode});
  const game=useRef({time:0,lastSpawn:0,sequence:0,nextId:1,items:[] as FallingItem[],motes:[] as Mote[],labels:[] as Label[],keys:new Set<string>(),lastBossHits:0,bossHit:0,celebrationTime:0});

  useEffect(()=>{eatAudio.setMuted(props.isMuted);},[props.isMuted]);
  useEffect(()=>{
    let alive=true;
    const keys=Object.keys(ART_SOURCES);
    // SVG sources are decoded once, then rasterized at bounded sizes.
    Promise.allSettled([...keys,'world'].map(async key=>{
      const image=await loadImage(key);
      if(!alive)return;
      if(key==='world'){artRef.current[key]=image;return;}
      const size=key.startsWith('guardian')?256:key.startsWith('nom')?192:96;
      const bitmap=document.createElement('canvas');bitmap.width=size;bitmap.height=size;
      bitmap.getContext('2d')?.drawImage(image,0,0,size,size);artRef.current[key]=bitmap;
    })).then(results=>{if(alive)setAssetState(results.some(x=>x.status==='rejected')?'fallback':'ready');});
    return()=>{alive=false;};
  },[]);
  useEffect(()=>{
    const el=containerRef.current,canvas=canvasRef.current;if(!el||!canvas)return;
    const resize=()=>{const {width,height}=el.getBoundingClientRect();if(width<1||height<1)return;const dpr=Math.min(2,window.devicePixelRatio||1);canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);canvas.style.width=`${width}px`;canvas.style.height=`${height}px`;body.current.r=Math.max(32,Math.min(44,width*.105));body.current.y=height-Math.max(66,Math.min(95,height*.18));body.current.x=Math.min(width-38,Math.max(38,body.current.x));body.current.target=Math.min(width-38,Math.max(38,body.current.target));};
    resize();const observer=new ResizeObserver(resize);observer.observe(el);return()=>observer.disconnect();
  },[]);
  useEffect(()=>{
    const down=(e:KeyboardEvent)=>{const p=live.current;if(p.isPaused||p.isGameOver)return;if(['Space','ArrowUp','KeyW','ArrowLeft','ArrowRight','KeyA','KeyD'].includes(e.code))e.preventDefault();game.current.keys.add(e.code);if(!e.repeat&&['Space','ArrowUp','KeyW'].includes(e.code)){p.onSwitchMode();eatAudio.playSwitch();}};
    const up=(e:KeyboardEvent)=>game.current.keys.delete(e.code);
    const blur=()=>game.current.keys.clear();window.addEventListener('keydown',down);window.addEventListener('keyup',up);window.addEventListener('blur',blur);
    return()=>{window.removeEventListener('keydown',down);window.removeEventListener('keyup',up);window.removeEventListener('blur',blur);};
  },[]);
  useEffect(()=>{
    let raf=0,last=performance.now();
    const media=window.matchMedia?.('(prefers-reduced-motion: reduce)');
    const sprite=(ctx:CanvasRenderingContext2D,key:string,x:number,y:number,w:number,h=w)=>{
      const image=artRef.current[key];if(image)ctx.drawImage(image,x-w/2,y-h/2,w,h);
      else {ctx.fillStyle=key==='bomb'?'#354850':key==='fire'?'#f7b15b':'#92dfdc';ctx.beginPath();ctx.arc(x,y,w*.32,0,Math.PI*2);ctx.fill();}
    };
    const burst=(x:number,y:number,color:string,count=12)=>{const g=game.current;for(let i=0;i<count&&g.motes.length<MAX_PARTICLES;i++){const a=i/count*Math.PI*2;g.motes.push({x,y,vx:Math.cos(a)*(25+Math.random()*70),vy:Math.sin(a)*(25+Math.random()*70)-20,age:0,ttl:.4+Math.random()*.25,color,size:2+Math.random()*3});}};
    const label=(x:number,y:number,text:string,color='#fff1be')=>{const list=game.current.labels;if(list.length>=MAX_LABELS)list.shift();list.push({x,y,age:0,text,color});};
    const spawn=(width:number,height:number,p:EatEmAllCanvasProps)=>{
      const g=game.current;if(g.items.length>=MAX_ITEMS)return;
      let type:ItemType='ice',lane=2,drift=0,speed=p.speedMultiplier;
      if(p.campaignStage){const counts=Object.fromEntries(Object.entries(p.campaignStage.targetItems).map(([k,n])=>[k,(n||0)-(p.remainingTargets?.[k as ItemType]||0)]));const plan=planDrop(p.campaignStage,g.sequence,counts,p.stageElapsed||0);type=plan.type;lane=plan.lane;drift=plan.drift;speed=plan.speed;}
      else {const roll=Math.random();if(roll<p.bombChance)type='bomb';else if(roll<p.bombChance+p.poisonChance)type='poison';else if(roll<p.bombChance+p.poisonChance+(p.powerUpChance||.045))type=(['power_shield','power_magnet','power_speed','power_slowmo'] as ItemType[])[Math.floor(Math.random()*4)];else type=(['ice','fire','star','gem','fury_pill','heart'] as ItemType[])[Math.random()<.8?Math.floor(Math.random()*2):2+Math.floor(Math.random()*4)];lane=g.sequence%5;drift=(Math.random()-.5)*.3;}
      const margin=Math.max(38,body.current.r);const x=margin+(width-margin*2)*lane/4;
      // Flight includes the top entry zone; bosses are scenery, never collidable.
      g.items.push({id:g.nextId++,x,y:-30,vx:drift*35,vy:(height-70)/3.1*speed,radius:type==='bomb'?23:20,type,rotation:0,rotSpeed:(g.sequence%2?1:-1)*.25,wobble:g.sequence, wobbleSpeed:1,scale:1,isEaten:false,alpha:1});g.sequence++;
    };
    const draw=(now:number)=>{
      raf=requestAnimationFrame(draw);const dt=Math.min(.05,(now-last)/1000);last=now;
      const canvas=canvasRef.current;if(!canvas)return;const ctx=canvas.getContext('2d');if(!ctx)return;
      const dpr=Math.min(2,window.devicePixelRatio||1),width=canvas.width/dpr,height=canvas.height/dpr;
      if(width<1||height<1)return;
      const p=live.current,b=body.current,g=game.current;
      const active=!p.isPaused&&!p.isGameOver&&!document.hidden;
      const reduced=media?.matches||false;
      if(p.celebrating&&!p.celebrationPaused&&!document.hidden)g.celebrationTime=Math.min(1.5,g.celebrationTime+dt);
      if(!p.celebrating)g.celebrationTime=0;
      const victoryProgress=g.celebrationTime/1.5;
      const victoryHop=p.celebrating&&!reduced?Math.abs(Math.sin(victoryProgress*Math.PI*2))*27*(1-victoryProgress*.3):0;
      if(!active)g.keys.clear();
      if(active){
        g.time+=dt;
        const move=(p.activePowerUps.speedTimer>0?1.3:1)*Math.max(420,width*1.2);
        if(g.keys.has('KeyA')||g.keys.has('ArrowLeft'))b.target-=move*dt;
        if(g.keys.has('KeyD')||g.keys.has('ArrowRight'))b.target+=move*dt;
        b.target=Math.max(b.r,Math.min(width-b.r,b.target));b.x+=(b.target-b.x)*(1-Math.exp(-dt*18));
        b.chew=Math.max(0,b.chew-dt);b.hurt=Math.max(0,b.hurt-dt);b.turn=Math.max(0,b.turn-dt);g.bossHit=Math.max(0,g.bossHit-dt);
        if(b.prevElement!==p.playerMode){b.turn=.3;b.prevElement=p.playerMode;burst(b.x,b.y,p.playerMode==='ice'?'#b7f8ed':'#ffca83',10);}
        if(g.time-g.lastSpawn>p.spawnIntervalMs/1000){spawn(width,height,p);g.lastSpawn=g.time;}
        for(let i=g.items.length-1;i>=0;i--){
          const it=g.items[i],slow=p.activePowerUps.slowmoTimer>0?.48:1;
          const edible=p.furyActive||it.type===p.playerMode||['star','gem','heart','fury_pill'].includes(it.type)||it.type.startsWith('power_');
          if(p.activePowerUps.magnetTimer>0&&edible){const dx=b.x-it.x,dy=b.y-it.y,dist=Math.max(1,Math.hypot(dx,dy));if(dist<200){it.x+=dx/dist*170*dt;it.y+=dy/dist*170*dt;}}
          it.y+=it.vy*slow*dt;it.x=Math.max(30,Math.min(width-30,it.x+it.vx*dt));it.rotation+=it.rotSpeed*dt;
          const caught=Math.abs(it.y-b.y)<30&&Math.abs(it.x-b.x)<b.r*.55+it.radius*.65;
          if(caught){
            b.chew=.25;
            if(it.type.startsWith('power_')){p.onCollectPowerUp(it.type.replace('power_','') as PowerUpType);eatAudio.playPowerUp();burst(it.x,it.y,'#d6b9fa',18);label(b.x,b.y-62,'BẢO HỘ!');}
            else if(edible){p.onEatItem(it);eatAudio.playMunch(it.type==='gem'||p.furyActive);burst(it.x,it.y,it.type==='fire'?'#ffd19b':it.type==='ice'?'#b4ffff':'#f6d993');label(b.x,b.y-60,it.type==='heart'?'+1 ♥':p.furyActive?'FURY!':it.type==='gem'&&p.campaignStage?.objective==='rescue'?'ĐÃ GIẢI CỨU!':`+${(it.type==='star'?50:it.type==='gem'?100:20)*p.comboMultiplier}`);
              if(p.campaignStage?.objective==='boss'){const phase=bossPhase(p.stageElapsed||0);if(phase.vulnerable&&it.type===phase.element){g.bossHit=.35;burst(width/2,height*.2,'#fff0ba',20);}}
            }else if(p.activePowerUps.shield){p.onConsumeShield();burst(b.x,b.y,'#b9eaf2',20);eatAudio.playShieldBlock();label(b.x,b.y-62,'KHIÊN CHẶN!');}
            else if(b.hurt<=0){b.hurt=1.25;p.onHitHazard(it);eatAudio.playHurt();burst(b.x,b.y,'#f2aaa1',16);label(b.x,b.y-62,'−1 ♥','#ffc2b3');}
            g.items.splice(i,1);
          }else if(it.y>height+40)g.items.splice(i,1);
        }
        for(let i=g.motes.length-1;i>=0;i--){const m=g.motes[i];m.age+=dt;m.x+=m.vx*dt;m.y+=m.vy*dt;m.vy+=100*dt;if(m.age>=m.ttl)g.motes.splice(i,1);}
        for(let i=g.labels.length-1;i>=0;i--){const l=g.labels[i];l.age+=dt;l.y-=32*dt;if(l.age>1)g.labels.splice(i,1);}
      }
      ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,width,height);
      const chapter=p.campaignStage?.chapter||({day:1,sunset:2,night:3,space:4,solar:2}[p.currentTheme]);
      const accent=palette[chapter-1];
      ctx.fillStyle=['#143c37','#44382d','#1e344d','#30283e'][chapter-1];ctx.fillRect(0,0,width,height);
      const bg=artRef.current.world as HTMLImageElement|undefined;
      if(bg){const sw=Math.min(bg.width,bg.height*width/height);const sx=Math.max(0,Math.min(bg.width-sw,((chapter-.5)/4)*bg.width-sw/2));ctx.drawImage(bg,sx,0,sw,bg.height,0,0,width,height);}
      ctx.fillStyle='rgba(8,29,32,.68)';ctx.fillRect(0,0,width,height);
      // Quiet guide lanes: scenery is deliberately behind opaque, outlined food.
      for(let lane=0;lane<5;lane++){const x=b.r+(width-b.r*2)*lane/4;ctx.fillStyle=lane%2?'#ddf5d905':'#ddf5d909';ctx.fillRect(x-17,0,34,b.y+25);}
      if(!reduced){for(let i=0;i<10;i++){ctx.fillStyle=accent;ctx.globalAlpha=.15+.13*Math.sin(g.time+i);ctx.beginPath();ctx.arc((i*67.9+Math.sin(g.time*.3+i)*12)%width,((i*91+g.time*7)%height),1.5,0,Math.PI*2);ctx.fill();}ctx.globalAlpha=1;}
      // A shallow foreground ledge anchors Nốm without hiding his feet.
      const ledge=ctx.createLinearGradient(0,b.y+35,0,height);ledge.addColorStop(0,'#273f32');ledge.addColorStop(1,'#0b2526');ctx.fillStyle=ledge;ctx.beginPath();ctx.moveTo(0,b.y+51);ctx.quadraticCurveTo(width*.5,b.y+39,width,b.y+51);ctx.lineTo(width,height);ctx.lineTo(0,height);ctx.closePath();ctx.fill();ctx.strokeStyle='#a4ac6e66';ctx.lineWidth=2;ctx.stroke();
      const boss=p.campaignStage?.objective==='boss';
      if(boss){const phase=bossPhase(p.stageElapsed||0);const size=Math.max(108,Math.min(176,width*.32,height*.32));const y=Math.max(83,height*.22);const breathe=reduced?0:Math.sin(g.time*1.7)*3;const attack=phase.warning;ctx.save();ctx.globalAlpha=.9;ctx.fillStyle=phase.element==='ice'?'#8edddd25':'#f6bc7825';ctx.beginPath();ctx.ellipse(width/2,y,size*.52,size*.45,0,0,Math.PI*2);ctx.fill();const recoil=g.bossHit>0&&!reduced?Math.sin(g.bossHit*50)*4:0;sprite(ctx,`guardian-${chapter}-${g.bossHit>0?'hurt':attack?'attack':'idle'}`,width/2+recoil,y+breathe,size);ctx.restore();if(phase.vulnerable){sprite(ctx,phase.element,width/2,y+size*.25,28);}}
      // Cosmetic auras sit behind the hero and never cover falling items.
      const aura=AURAS.find(a=>a.id===p.auraId);
      if(aura){ctx.save();ctx.strokeStyle=aura.color+'88';ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(b.x,b.y+15,b.r*1.25,b.r*.6,0,0,Math.PI*2);ctx.stroke();for(let i=0;i<2;i++){const angle=i*Math.PI+(reduced?0:g.time*.9);sprite(ctx,aura.icon,b.x+Math.cos(angle)*b.r*1.15,b.y-5+Math.sin(angle)*b.r*.55,19);}ctx.restore();}
      ctx.save();ctx.translate(b.x,b.y-victoryHop);
      if(p.celebrating&&!reduced)ctx.rotate(Math.sin(victoryProgress*Math.PI*4)*.1);
      const bob=reduced?0:Math.sin(g.time*3.3)*2;
      if(p.furyActive){ctx.strokeStyle='#f9d27d';ctx.lineWidth=3;ctx.beginPath();ctx.ellipse(0,4,b.r*1.35,b.r*.9,0,0,Math.PI*2);ctx.stroke();}
      if(p.activePowerUps.shield){ctx.strokeStyle='#b6efdbb0';ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,-5,b.r*1.2,0,Math.PI*2);ctx.stroke();}
      const pose=p.celebrating?'happy':b.hurt>0?'hurt':p.isGameOver?'happy':p.furyActive?'fury':b.chew>0?'eat':p.isPaused?'sleep':'idle';
      if(b.hurt>0&&!reduced&&!p.celebrating)ctx.globalAlpha=.55+.45*Math.abs(Math.sin(g.time*25));
      const stretch=reduced?0:p.celebrating?Math.sin(victoryProgress*Math.PI*4)*.07:b.chew>0?Math.sin(b.chew/.25*Math.PI)*.09:b.turn>0?Math.sin(b.turn/.3*Math.PI)*-.08:0;
      ctx.scale(1-stretch,1+stretch);
      if(p.skinId?.includes('neon')){ctx.shadowColor='#a0f3d7';ctx.shadowBlur=12;}
      if(p.skinId?.includes('dragon'))ctx.filter='saturate(1.4) hue-rotate(18deg)';
      if(p.skinId?.includes('cyber'))ctx.filter='saturate(.65)';
      sprite(ctx,`nom-${p.playerMode}-${pose}`,0,bob,b.r*2.6);ctx.restore();
      // Foreground gameplay items must stay above the hero, including near misses.
      for(const it of g.items){
        if(p.celebrating&&victoryProgress>.35)continue;
        if(['bomb','poison'].includes(it.type)&&it.y<60){ctx.strokeStyle='#f9bd8c';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(it.x-6,15);ctx.lineTo(it.x,5);ctx.lineTo(it.x+6,15);ctx.stroke();}
        ctx.save();if(p.celebrating)ctx.globalAlpha=Math.max(0,1-victoryProgress/.35);ctx.translate(it.x,it.y);ctx.rotate(it.rotation);
        // Ice uses facets; fire uses curved flame. Both are readable at 40px.
        const selected=it.type===p.playerMode||p.furyActive;
        if(selected){ctx.strokeStyle=p.playerMode==='ice'?'#a9f4e688':'#ffcc8b88';ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(0,0,it.radius+5,0,Math.PI*2);ctx.stroke();}
        sprite(ctx,it.type,0,0,it.radius*2.5);
        if(it.type==='gem'&&p.campaignStage?.objective==='rescue'){ctx.fillStyle='#fff7d5';ctx.beginPath();ctx.ellipse(-5,0,2,3,0,0,Math.PI*2);ctx.ellipse(5,0,2,3,0,0,Math.PI*2);ctx.fill();}
        ctx.restore();
      }
      if(p.celebrating){
        sprite(ctx,'crown',b.x,b.y-b.r*1.8-victoryHop,34);
        if(!reduced){for(let i=0;i<24;i++){const phase=Math.min(1,(victoryProgress+i*.009)%1);const angle=i/24*Math.PI*2;const distance=22+phase*110;const x=b.x+Math.cos(angle)*distance;const y=b.y-45+Math.sin(angle)*distance+phase*55;ctx.save();ctx.globalAlpha=(1-phase)*.9;ctx.translate(x,y);ctx.rotate(phase*6+i);if(i%4===0)sprite(ctx,'star',0,0,13);else{ctx.fillStyle=['#f6d78c','#b0e6d1','#edb2a2','#afc9f0'][i%4];ctx.fillRect(-2,-4,4,8);}ctx.restore();}}
      }
      for(const m of g.motes){ctx.globalAlpha=Math.max(0,1-m.age/m.ttl);ctx.fillStyle=m.color;ctx.beginPath();ctx.arc(m.x,m.y,m.size,0,Math.PI*2);ctx.fill();}ctx.globalAlpha=1;
      for(const l of g.labels){ctx.save();ctx.globalAlpha=Math.max(0,1-l.age);ctx.font='800 13px system-ui, sans-serif';ctx.textAlign='center';ctx.strokeStyle='#12302f';ctx.lineWidth=4;ctx.strokeText(l.text,Math.max(58,Math.min(width-58,l.x)),l.y);ctx.fillStyle=l.color;ctx.fillText(l.text,Math.max(58,Math.min(width-58,l.x)),l.y);ctx.restore();}
      if(p.combo>=5){ctx.font='900 13px system-ui';ctx.textAlign='center';ctx.fillStyle='#ffe6a2';ctx.fillText(`×${p.comboMultiplier} · ${p.combo} CHUỖI`,width/2,height-24);ctx.fillStyle='#eadcb333';ctx.fillRect(width/2-46,height-16,92,3);ctx.fillStyle=accent;ctx.fillRect(width/2-46,height-16,92*p.comboDecayRatio,3);}
      if(p.furyActive){ctx.strokeStyle='#f6cf79';ctx.lineWidth=5;ctx.strokeRect(2.5,2.5,width-5,height-5);}
    };
    raf=requestAnimationFrame(draw);return()=>cancelAnimationFrame(raf);
  },[]);
  const point=(event:React.PointerEvent<HTMLCanvasElement>)=>{if(live.current.isPaused||live.current.isGameOver)return;const rect=event.currentTarget.getBoundingClientRect();body.current.target=Math.max(body.current.r,Math.min(rect.width-body.current.r,event.clientX-rect.left));};
  return <div className="eat-canvas" ref={containerRef}><canvas ref={canvasRef} aria-label="Sân hứng nguyên tố. Kéo ngang để di chuyển; Space đổi hệ; F dùng Fury." onPointerDown={e=>{e.currentTarget.setPointerCapture?.(e.pointerId);point(e);}} onPointerMove={point}/>{assetState==='loading'&&<span className="eat-asset-loading" role="status">Đang đánh thức khu rừng…</span>}</div>;
};
