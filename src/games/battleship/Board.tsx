import React, {useEffect,useRef} from 'react';
import {cellsOf,lengthOf,type Ship,type Shot,type State,viewFor} from './engine';
import type {Art} from './art';
type View=ReturnType<typeof viewFor>;
type Props={view:View;own:boolean;art:Art;faction:'us'|'jp';selected:{row:number;col:number}|null;ghost:Ship|null;ghostValid:boolean;reduced:boolean;paused:boolean;interactive?:boolean;onCursor?:(row:number,col:number)=>void;onCell:(row:number,col:number)=>void};
export function Board({view,own,art,faction,selected,ghost,ghostValid,reduced,paused,onCell,onCursor,interactive=true}:Props){
 const ref=useRef<HTMLCanvasElement>(null),live=useRef({view,own,art,faction,selected,ghost,ghostValid,reduced,paused,onCell});live.current={view,own,art,faction,selected,ghost,ghostValid,reduced,paused,onCell};
 useEffect(()=>{const canvas=ref.current!,ctx=canvas.getContext('2d')!;let raf=0,alive=true,frameTime=0;const size=800,pad=34,extent=732;
  const render=(t:number)=>{if(!alive)return;raf=requestAnimationFrame(render);if(t-frameTime<32)return;frameTime=t;const p=live.current,n=p.view.size,s=extent/n,now=Date.now();
   const cell=(r:number,c:number)=>({x:pad+(c+.5)*s,y:pad+(r+.5)*s});
   ctx.fillStyle='#101a22';ctx.fillRect(0,0,size,size);const sea=p.art.images.ocean;
   for(let y=0;y<extent;y+=12){const shift=p.reduced||p.paused?0:Math.sin(y*.02+t*.0006)*4;ctx.drawImage(sea,40+shift,40+y/extent*920,940,16,pad,pad+y,extent,13);}
   ctx.fillStyle='#00142145';ctx.fillRect(pad,pad,extent,extent);ctx.strokeStyle='#d0e3ed4d';ctx.lineWidth=1;
   for(let i=0;i<=n;i++){ctx.beginPath();ctx.moveTo(pad+i*s,pad);ctx.lineTo(pad+i*s,pad+extent);ctx.moveTo(pad,pad+i*s);ctx.lineTo(pad+extent,pad+i*s);ctx.stroke();}
   ctx.font='14px system-ui';ctx.textAlign='center';ctx.fillStyle='#d0dfe8';for(let i=0;i<n;i++){ctx.fillText(String(i+1),pad+(i+.5)*s,22);ctx.fillText(String.fromCharCode(65+i),16,pad+(i+.5)*s+4);}
   const hull=(ship:Ship,alpha=1)=>{const a=cell(ship.row,ship.col),length=lengthOf(ship),im=p.art.images[(p.own?p.faction:p.faction==='us'?'jp':'us')+'-'+ship.type];ctx.save();ctx.globalAlpha=alpha;ctx.translate(a.x+(ship.horizontal?(length-1)*s/2:0),a.y+(!ship.horizontal?(length-1)*s/2:0));if(ship.horizontal)ctx.rotate(Math.PI/2);ctx.fillStyle='#1223309c';ctx.fillRect(-s*.42,-length*s*.48,s*.84,length*s*.96);const scale=Math.min(s*.9/im.width,length*s*.92/im.height);ctx.drawImage(im,-im.width*scale/2,-im.height*scale/2,im.width*scale,im.height*scale);ctx.strokeStyle='#b5c5cb8a';ctx.lineWidth=1;ctx.strokeRect(-s*.42,-length*s*.48,s*.84,length*s*.96);ctx.restore();};
   for(const ship of p.own?p.view.own:p.view.revealedEnemy)hull(ship,p.own?1:.6);
   if(p.ghost&&p.own){hull(p.ghost,.55);for(const c of cellsOf(p.ghost)){if(c.row<0||c.col<0||c.row>=n||c.col>=n)continue;const a=cell(c.row,c.col);ctx.fillStyle=p.ghostValid?'#6fcdb867':'#fa776b77';ctx.fillRect(a.x-s*.47,a.y-s*.47,s*.94,s*.94);}}
   const target=p.own?0:1,shots=p.view.shots.filter(q=>q.target===target);const drawFX=(name:string,age:number,x:number,y:number,sz:number,loop=false,alpha=1)=>{const f=p.art.fx[name],position=loop?Math.floor(age/f.ms)%f.sequence.length:Math.min(f.sequence.length-1,Math.floor(age/f.ms));ctx.save();ctx.globalAlpha=alpha;ctx.drawImage(f.frames[f.sequence[Math.max(0,position)]],x-sz*141/276,y-sz*135/276,sz,sz);ctx.restore();};
   for(const shot of shots){const a=cell(shot.row,shot.col),age=Math.max(0,now-shot.at),travel=p.reduced?0:720;
    if(age<travel){const u=age/travel,sx=size*.55,sy=790,cx=a.x+80,cy=a.y+130,x=(1-u)**2*sx+2*(1-u)*u*cx+u*u*a.x,y=(1-u)**2*sy+2*(1-u)*u*cy+u*u*a.y,dx=2*(1-u)*(cx-sx)+2*u*(a.x-cx),dy=2*(1-u)*(cy-sy)+2*u*(a.y-cy);ctx.save();ctx.translate(x,y);ctx.rotate(Math.atan2(dy,dx)+Math.PI/2);ctx.drawImage(p.art.images.missile,-s*.12,-s*.5,s*.24,s);ctx.restore();continue;}
    ctx.fillStyle=shot.hit?'#ffc078':'#e1eef7';ctx.font=`bold ${Math.max(17,s*.44)}px system-ui`;ctx.fillText(shot.hit?'✕':'○',a.x,a.y+s*.15);
    if(!p.reduced&&age<travel+600)drawFX(shot.hit?'explosion':'splash',age-travel,a.x,a.y,s*1.9);
   }
   if(!p.reduced)for(const shot of shots.filter(q=>q.hit).slice(-4)){const age=now-shot.at;if(age<1320)continue;const a=cell(shot.row,shot.col);drawFX('fire',p.paused?0:age,a.x,a.y,s*1.1,true);drawFX('smoke',p.paused?0:age,a.x,a.y-s*.2,s*1.3,true,.45);}
   if(p.selected){const a=cell(p.selected.row,p.selected.col);ctx.strokeStyle='#f7d28f';ctx.lineWidth=3;ctx.strokeRect(a.x-s*.46,a.y-s*.46,s*.92,s*.92);ctx.strokeStyle='#fff0c9';ctx.beginPath();ctx.arc(a.x,a.y,s*.22,0,Math.PI*2);ctx.stroke();}
  };raf=requestAnimationFrame(render);return()=>{alive=false;cancelAnimationFrame(raf);};
 },[]);
 const choose=(e:React.MouseEvent<HTMLCanvasElement>)=>{const b=e.currentTarget.getBoundingClientRect(),x=(e.clientX-b.left)*800/b.width,y=(e.clientY-b.top)*800/b.height;if(x>=34&&x<766&&y>=34&&y<766)onCell(Math.floor((y-34)/(732/view.size)),Math.floor((x-34)/(732/view.size)));};
 return <canvas ref={ref} width={800} height={800} onClick={interactive?choose:undefined} tabIndex={interactive?0:-1} aria-label={own?'Hạm đội của bạn. Dùng mũi tên để chọn ô.':'Bàn mục tiêu. Chạm ô để bắn; dùng mũi tên để ngắm, Enter để bắn.'} onKeyDown={e=>{if(!interactive)return;if(e.key==='Enter'||e.key===' '){e.preventDefault();if(selected)onCell(selected.row,selected.col);return;}const keys=['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'];if(!keys.includes(e.key))return;e.preventDefault();const r=selected?.row??0,c=selected?.col??0;(onCursor||onCell)(Math.max(0,Math.min(view.size-1,r+(e.key==='ArrowDown'?1:e.key==='ArrowUp'?-1:0))),Math.max(0,Math.min(view.size-1,c+(e.key==='ArrowRight'?1:e.key==='ArrowLeft'?-1:0))));}}/>;
}
