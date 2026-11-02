import React, {useEffect,useRef} from 'react';
import {cellsOf,lengthOf,type Ship,type Seat,viewFor} from './engine';
import type {Art} from './art';
import {boardCamera,cellAt,BOARD_CANVAS} from './projection';
import {cellWidth,drawHaze,drawSea,layer,quad,ring,shipSprite,type ShipPose} from './scene';
type View=ReturnType<typeof viewFor>;
type Props={view:View;own:boolean;art:Art;faction:'us'|'jp';selected:{row:number;col:number}|null;ghost:Ship|null;ghostValid:boolean;reduced:boolean;paused:boolean;viewerSeat?:Seat;clockOffset?:number;viewerTeam?:0|1;interactive?:boolean;
 /** Top-down overview (the small switch board); the main board is drawn in perspective. */ flat?:boolean;onCursor?:(row:number,col:number)=>void;onCell:(row:number,col:number)=>void};
type Cache={sea:{key?:string;canvas?:HTMLCanvasElement};board:{key?:string;canvas?:HTMLCanvasElement};haze:{key?:string;canvas?:HTMLCanvasElement}};
type Live=Omit<Props,'onCursor'|'interactive'|'flat'>&{viewerSeat:Seat;viewerTeam:0|1;clockOffset:number};
const cam=boardCamera();
// Deck height in cells: big ships stand taller above the water.
const DECK:Record<string,number>={carrier:.44,battleship:.48,'heavy-cruiser':.38,'light-cruiser':.34,destroyer:.28};
const SINK_MS=2200,TRAVEL_MS=720;
const shipImage=(p:Live,ship:Ship)=>p.art.images[(p.own?p.faction:p.faction==='us'?'jp':'us')+'-'+ship.type];
/** When each ship on the shown board went down (from the sinking shot), if it has. */
function sunkAt(p:Live,target:number){const m=new Map<string,number>();for(const s of p.view.shots)if(s.target===target&&s.sunk)m.set(s.sunk,s.at);return m;}

export function Board({view,own,art,faction,selected,ghost,ghostValid,reduced,paused,onCell,onCursor,interactive=true,flat=false,viewerTeam=0,viewerSeat='A1',clockOffset=0}:Props){
 const ref=useRef<HTMLCanvasElement>(null),live=useRef<Live>(null!);live.current={view,own,art,faction,selected,ghost,ghostValid,reduced,paused,onCell,viewerSeat,viewerTeam,clockOffset};
 useEffect(()=>{const canvas=ref.current!,ctx=canvas.getContext('2d')!;let raf=0,alive=true,frameTime=0;
  const cache:Cache={sea:{},board:{},haze:{}};
  const render=(t:number)=>{if(!alive)return;raf=requestAnimationFrame(render);if(t-frameTime<32)return;frameTime=t;if(flat)renderFlat(ctx,live.current,t);else render3D(ctx,live.current,t,cache);};
  raf=requestAnimationFrame(render);return()=>{alive=false;cancelAnimationFrame(raf);};
 },[flat]);
 const choose=(e:React.MouseEvent<HTMLCanvasElement>)=>{const b=e.currentTarget.getBoundingClientRect();
  if(flat){const x=(e.clientX-b.left)*800/b.width,y=(e.clientY-b.top)*800/b.height;if(x>=34&&x<766&&y>=34&&y<766)onCell(Math.floor((y-34)/(732/view.size)),Math.floor((x-34)/(732/view.size)));return;}
  const hit=cellAt(cam,(e.clientX-b.left)*cam.width/b.width,(e.clientY-b.top)*cam.height/b.height,view.size);if(hit)onCell(hit.row,hit.col);};
 const w=flat?800:BOARD_CANVAS.width,h=flat?800:BOARD_CANVAS.height;
 return <canvas ref={ref} width={w} height={h} data-perspective={flat?undefined:'true'} onClick={interactive?choose:undefined} tabIndex={interactive?0:-1} aria-label={own?'Hạm đội của bạn. Dùng mũi tên để chọn ô.':'Bàn mục tiêu. Chạm ô để bắn; dùng mũi tên để ngắm, Enter để bắn.'} onKeyDown={e=>{if(!interactive)return;if(e.key==='Enter'||e.key===' '){e.preventDefault();if(selected)onCell(selected.row,selected.col);return;}const keys=['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'];if(!keys.includes(e.key))return;e.preventDefault();const r=selected?.row??0,c=selected?.col??0;(onCursor||onCell)(Math.max(0,Math.min(view.size-1,r+(e.key==='ArrowDown'?1:e.key==='ArrowUp'?-1:0))),Math.max(0,Math.min(view.size-1,c+(e.key==='ArrowRight'?1:e.key==='ArrowLeft'?-1:0))));}}/>;
}

function render3D(ctx:CanvasRenderingContext2D,p:Live,t:number,cache:Cache){
 const n=p.view.size,cell=1/n,now=Date.now()+p.clockOffset,animate=!p.reduced&&!p.paused,W=cam.width,H=cam.height;
 const c=(r:number,col:number)=>({u:(col+.5)*cell,v:(r+.5)*cell});
 // Water moves slowly, so it is re-rendered eight times a second rather than every frame.
 ctx.drawImage(layer(animate?String(Math.floor(t/125)):'still',W,H,x=>drawSea(x,cam,p.art,Math.floor(t/125)*125,animate),cache.sea),0,0);
 ctx.drawImage(layer(`${n}|${p.view.mode}|${p.own}|${p.view.phase}|${p.viewerSeat}`,W,H,x=>drawBoard(x,p,n),cache.board),0,0);
 const target=p.own?p.viewerTeam:p.viewerTeam===0?1:0,shots=p.view.shots.filter(q=>q.target===target),sunk=sunkAt(p,target);
 // Flat shot marks on the water under everything else.
 for(const shot of shots){const age=now-shot.at;if(age<(p.reduced?0:TRAVEL_MS))continue;const {u,v}=c(shot.row,shot.col);
  if(shot.hit){ctx.save();ring(ctx,cam,u,v,cell*.34);ctx.fillStyle='#ff7b3a38';ctx.fill();ctx.strokeStyle='#ffb36b';ctx.lineWidth=2.5;ctx.stroke();ctx.restore();}
  else{ctx.save();ring(ctx,cam,u,v,cell*.26);ctx.strokeStyle='#e6f3fbcc';ctx.lineWidth=2.5;ctx.stroke();ring(ctx,cam,u,v,cell*.07);ctx.fillStyle='#e6f3fb';ctx.fill();ctx.restore();}}
 if(p.selected){const {row,col}=p.selected;ctx.save();quad(ctx,cam,col*cell,row*cell,(col+1)*cell,(row+1)*cell);ctx.fillStyle='#f7d28f26';ctx.fill();ctx.strokeStyle='#ffe2a8';ctx.lineWidth=5;ctx.globalAlpha=.35;ctx.stroke();ctx.globalAlpha=1;ctx.strokeStyle='#f7d28f';ctx.lineWidth=2.5;ctx.stroke();ctx.restore();}
 if(p.ghost&&p.own)for(const g of cellsOf(p.ghost)){if(g.row<0||g.col<0||g.row>=n||g.col>=n)continue;quad(ctx,cam,g.col*cell,g.row*cell,(g.col+1)*cell,(g.row+1)*cell);ctx.fillStyle=p.ghostValid?'#6fcdb85c':'#fa776b66';ctx.fill();}
 // Ships, fire and smoke sorted far to near so nearer things overlap farther ones.
 type Item={depth:number;draw:()=>void};const items:Item[]=[];
 const blit=(pose:ShipPose,afloat:boolean)=>{const sp=shipSprite(cam,pose),phase=(pose.row*7+pose.col*3)%11,bob=animate&&afloat?Math.sin(t*.0014+phase)*cellWidth(cam,.5,(pose.row+.5)*cell,n)*.035:0;ctx.drawImage(sp.canvas,sp.x,sp.y+bob);};
 const ships=p.own?p.view.own:p.view.revealedEnemy;
 for(const ship of ships){const at=sunk.get(ship.id),sink=at===undefined?0:p.reduced?1:Math.min(1,Math.max(0,(now-at-TRAVEL_MS)/SINK_MS)),len=lengthOf(ship);
  items.push({depth:(ship.row+(ship.horizontal?1:len))*cell,draw:()=>blit({img:shipImage(p,ship),n,row:ship.row,col:ship.col,length:len,horizontal:ship.horizontal,height:DECK[ship.type]??.4,sink,foamColor:p.own&&p.view.mode==='squad'&&ship.owner!==p.viewerSeat?'#7fe3ff':undefined},sink===0)});}
 if(p.ghost&&p.own){const g=p.ghost;items.push({depth:2,draw:()=>blit({img:shipImage(p,g),n,row:g.row,col:g.col,length:lengthOf(g),horizontal:g.horizontal,height:DECK[g.type]??.4,alpha:.62,ghost:true},false)});}
 const fx=(name:string,age:number,u:number,v:number,h:number,size:number,loop=false,alpha=1)=>{const f=p.art.fx[name],i=loop?Math.floor(age/f.ms)%f.sequence.length:Math.min(f.sequence.length-1,Math.floor(age/f.ms)),q=cam.project(u,v,h),sz=cellWidth(cam,u,v,n)*size;ctx.save();ctx.globalAlpha=alpha;ctx.drawImage(f.frames[f.sequence[Math.max(0,i)]],q.x-sz*141/276,q.y-sz*.78,sz,sz);ctx.restore();};
 for(const shot of shots){const age=Math.max(0,now-shot.at),{u,v}=c(shot.row,shot.col);
  if(!p.reduced&&age<TRAVEL_MS){// Missile arcs in from behind the camera, over the near edge.
   const path=(k:number)=>{const su=.5+(u-.5)*.2,sv=1.35;return {u:su+(u-su)*k,v:sv+(v-sv)*k,h:Math.sin(Math.PI*k)*.32+(1-k)*.05};};
   const k=age/TRAVEL_MS,a=path(k),b=path(Math.min(1,k+.02)),q=cam.project(a.u,a.v,a.h),q2=cam.project(b.u,b.v,b.h),sz=cellWidth(cam,a.u,Math.min(1,a.v),n)*1.25;
   items.push({depth:9,draw:()=>{ctx.save();ctx.translate(q.x,q.y);ctx.rotate(Math.atan2(q2.y-q.y,q2.x-q.x)+Math.PI/2);ctx.drawImage(p.art.images.missile,-sz*.2,-sz*.5,sz*.4,sz);ctx.restore();}});continue;}
  if(!p.reduced&&age<TRAVEL_MS+600)items.push({depth:v+.001,draw:()=>fx(shot.hit?'explosion':'splash',age-TRAVEL_MS,u,v,shot.hit?.02:0,shot.hit?2.3:2)});
 }
 if(!p.reduced)for(const shot of shots.filter(q=>q.hit).slice(-6)){const age=now-shot.at;if(age<TRAVEL_MS+600)continue;const {u,v}=c(shot.row,shot.col),a=p.paused?0:age;
  items.push({depth:v+.002,draw:()=>{fx('fire',a,u,v,.03,1.25,true);fx('smoke',a,u,v-cell*.1,.12,1.6,true,.5);}});}
 items.sort((a,b)=>a.depth-b.depth);for(const it of items)it.draw();
 ctx.drawImage(layer('haze',W,H,x=>drawHaze(x,cam,cam.project(.5,0).y+40),cache.haze),0,0);
}
/** Static board layer: plate, brass rim, grid, team divider and coordinates. */
function drawBoard(ctx:CanvasRenderingContext2D,p:Live,n:number){const cell=1/n;
 ctx.save();quad(ctx,cam,0,0,1,1);ctx.fillStyle='#02101a59';ctx.fill();ctx.shadowColor='#e7c27a77';ctx.shadowBlur=18;ctx.strokeStyle='#d9b673';ctx.lineWidth=3;ctx.stroke();ctx.restore();
 ctx.strokeStyle='#cfe6f238';ctx.lineWidth=1;ctx.beginPath();
 for(let i=1;i<n;i++){let a=cam.project(i*cell,0),b=cam.project(i*cell,1);ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);a=cam.project(0,i*cell);b=cam.project(1,i*cell);ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);}
 ctx.stroke();
 if(p.own&&p.view.mode==='squad'){ctx.save();ctx.strokeStyle='#9fd6ea';ctx.lineWidth=3;ctx.setLineDash([12,8]);const a=cam.project(0,7*cell),b=cam.project(1,7*cell);ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();ctx.restore();
  if(p.view.phase==='placement'){const top=p.viewerSeat.endsWith('1')?7:0;quad(ctx,cam,0,top*cell,1,(top+7)*cell);ctx.fillStyle='#020a1466';ctx.fill();}}
 ctx.font='600 17px system-ui';ctx.textAlign='center';ctx.textBaseline='middle';
 for(let i=0;i<n;i++){const col=cam.project((i+.5)*cell,1),row=cam.project(0,(i+.5)*cell),cw=Math.max(18,cellWidth(cam,(i+.5)*cell,1,n)*.62);
  plate(ctx,col.x,col.y+26,cw,24);plate(ctx,row.x-30,row.y,26,22);ctx.fillStyle='#e8f0f4';
  ctx.fillText(String(i+1),col.x,col.y+27); // readable-canvas: drawn on the solid #0b1820 plate just above (13.9:1)
  ctx.fillText(String.fromCharCode(65+i),row.x-30,row.y+1); // readable-canvas: drawn on the solid #0b1820 plate just above (13.9:1)
 }
}
function plate(ctx:CanvasRenderingContext2D,x:number,y:number,w:number,h:number){ctx.fillStyle='#0b1820';ctx.beginPath();ctx.roundRect(x-w/2,y-h/2,w,h,5);ctx.fill();}

/** Top-down overview used by the small switch board. */
function renderFlat(ctx:CanvasRenderingContext2D,p:Live,t:number){
 const size=800,pad=34,extent=732,n=p.view.size,s=extent/n,now=Date.now()+p.clockOffset;
 const cell=(r:number,c:number)=>({x:pad+(c+.5)*s,y:pad+(r+.5)*s});
 ctx.fillStyle='#0b1820';ctx.fillRect(0,0,size,size);const sea=p.art.images.ocean;
 for(let y=0;y<extent;y+=12){const shift=p.reduced||p.paused?0:Math.sin(y*.02+t*.0006)*4;ctx.drawImage(sea,40+shift,40+y/extent*920,940,16,pad,pad+y,extent,13);}
 ctx.fillStyle='#00142155';ctx.fillRect(pad,pad,extent,extent);ctx.strokeStyle='#d9b67399';ctx.lineWidth=4;ctx.strokeRect(pad,pad,extent,extent);ctx.strokeStyle='#d0e3ed40';ctx.lineWidth=1;
 for(let i=1;i<n;i++){ctx.beginPath();ctx.moveTo(pad+i*s,pad);ctx.lineTo(pad+i*s,pad+extent);ctx.moveTo(pad,pad+i*s);ctx.lineTo(pad+extent,pad+i*s);ctx.stroke();}
 for(const ship of p.own?p.view.own:p.view.revealedEnemy){const a=cell(ship.row,ship.col),length=lengthOf(ship),im=shipImage(p,ship);ctx.save();ctx.globalAlpha=p.own?1:.7;ctx.translate(a.x+(ship.horizontal?(length-1)*s/2:0),a.y+(!ship.horizontal?(length-1)*s/2:0));if(ship.horizontal)ctx.rotate(Math.PI/2);const sx=Math.min(s*1.15,length*s*.96*im.width/im.height)/im.width,sy=length*s*.96/im.height;ctx.drawImage(im,-im.width*sx/2,-im.height*sy/2,im.width*sx,im.height*sy);ctx.restore();}
 const target=p.own?p.viewerTeam:p.viewerTeam===0?1:0;
 for(const shot of p.view.shots.filter(q=>q.target===target)){if(now-shot.at<(p.reduced?0:TRAVEL_MS))continue;const a=cell(shot.row,shot.col);ctx.beginPath();ctx.arc(a.x,a.y,s*.26,0,Math.PI*2);ctx.fillStyle=shot.hit?'#ff8a3d':'#e1eef7aa';ctx.fill();}
}
