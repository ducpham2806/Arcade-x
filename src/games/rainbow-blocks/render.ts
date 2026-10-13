import {asset} from './assets';
import {cells,KINDS,type Kind,type Piece} from './core/pieces';
import {STEP,type State,type RainbowEngine} from './core/engine';
export type VisualSettings={ghost:boolean;grid:boolean;colorblind:boolean;quality:'high'|'medium'|'low'|'off';reducedMotion:boolean};
const colors:Record<Kind,string>={I:'#1ec8f0',O:'#ffc61a',T:'#b03ac8',S:'#5ccb2e',Z:'#e8283c',J:'#2858e0',L:'#ff8a1e'};
export class Renderer {
 images:Record<string,HTMLImageElement>={};private lastEvent=0;private particles:{x:number;y:number;vx:number;vy:number;born:number;life:number;name:string;size:number;angle:number}[]=[];
 async preload(){const names=[...KINDS.flatMap(k=>[`blocks/block_${k.toLowerCase()}_base.svg`,`blocks/ghost_${k.toLowerCase()}.svg`,`blocks/cb_symbol_${k.toLowerCase()}.svg`]),'blocks/block_dim.svg','blocks/block_locked_flash.svg','board/board_bg.svg','fx/fx_streak_h.svg','fx/fx_streak_v.svg','fx/fx_rainbow_sweep.svg','fx/fx_ring.svg','fx/fx_star.svg','fx/fx_spark.svg','fx/fx_shard_01.svg','fx/fx_shard_02.svg','fx/fx_shard_03.svg',...Array.from({length:6},(_,i)=>`fx/fx_confetti_rect_${i+1}.svg`)];await Promise.all(names.map(name=>new Promise<void>(resolve=>{const im=new Image();im.onload=()=>{this.images[name]=im;resolve();};im.onerror=()=>resolve();im.src=asset(name);})));}
 reset(){this.lastEvent=0;this.particles=[];}
 draw(canvas:HTMLCanvasElement,e:RainbowEngine,v:VisualSettings,visualTick=e.s.tick){
  const s=e.s,w=300,h=600,dpr=Math.min(2,window.devicePixelRatio||1),c=w/10;
  if(canvas.width!==w*dpr||canvas.height!==h*dpr){canvas.width=w*dpr;canvas.height=h*dpr;}
  const ctx=canvas.getContext('2d')!;ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,w,h);
  const img=(name:string,x:number,y:number,width:number,height=width)=>{const im=this.images[name];if(im)ctx.drawImage(im,x,y,width,height);};
  ctx.fillStyle='#0d1224';ctx.fillRect(0,0,w,h);img('board/board_bg.svg',0,0,w,h);
  if(v.grid){ctx.strokeStyle='#ffffff0e';ctx.lineWidth=.5;ctx.beginPath();for(let x=0;x<=10;x++){ctx.moveTo(x*c,0);ctx.lineTo(x*c,h);}for(let y=0;y<=20;y++){ctx.moveTo(0,y*c);ctx.lineTo(w,y*c);}ctx.stroke();}
  const block=(kind:Kind,x:number,y:number,ghost=false)=>{if(y<2)return;const px=x*c,py=(y-2)*c;ctx.fillStyle=colors[kind];if(!this.images[`blocks/block_${kind.toLowerCase()}_base.svg`]&&!ghost)ctx.fillRect(px+1,py+1,c-2,c-2);img(`blocks/${ghost?'ghost_':'block_'}${kind.toLowerCase()}${ghost?'':'_base'}.svg`,px,py,c);if(v.colorblind&&!ghost)img(`blocks/cb_symbol_${kind.toLowerCase()}.svg`,px+5,py+5,c-10);};
  for(let y=2;y<22;y++)for(let x=0;x<10;x++)if(s.board[y][x]){block(s.board[y][x]!,x,y);if(s.phase==='over'){ctx.fillStyle='#0d12249c';ctx.fillRect(x*c,(y-2)*c,c,c);}}
  const drawPiece=(p:Piece|null,ghost=false)=>{if(p)for(const [x,y]of cells(p))block(p.kind,x,y,ghost);};
  if(v.ghost&&s.phase==='playing')drawPiece(e.ghost(),true);if(s.phase==='playing')drawPiece(s.active);
  if(e.grounded()&&s.active){ctx.globalAlpha=.12;for(const [x,y]of cells(s.active))if(y>=2)img('blocks/block_locked_flash.svg',x*c,(y-2)*c,c);ctx.globalAlpha=1;}
  for(const ev of s.events){const age=(visualTick-ev.tick)*STEP;
   if(ev.id>this.lastEvent){this.lastEvent=ev.id;if(ev.type==='clear'&&v.quality!=='off'&&!v.reducedMotion){const count=v.quality==='high'?80:v.quality==='medium'?40:16;for(let i=0;i<count;i++){const row=ev.rows[i%ev.rows.length];const n=(i*37+ev.id*17)%97/97;this.particles.push({x:n*w,y:(row-2+.5)*c,vx:(n-.5)*.23,vy:-.08-(i%7)*.025,born:ev.tick,life:ev.rows.length===4?1500:650,size:4+i%7,angle:i,name:ev.rows.length===4?`fx/fx_confetti_rect_${i%6+1}.svg`:`fx/fx_shard_0${i%3+1}.svg`});}this.particles=this.particles.slice(-150);}}
   if(v.quality==='off')continue;
   if(ev.type==='drop'&&ev.piece&&age<160&&!v.reducedMotion){ctx.globalAlpha=(1-age/160)*.65;for(const [x,y]of cells(ev.piece))if(y>=2)img('fx/fx_streak_v.svg',x*c,Math.max(0,(ev.fromY!-2)*c),c,Math.max(c,(y-ev.fromY!)*c));ctx.globalAlpha=1;}
   if(ev.type==='lock'&&ev.piece&&age<80){ctx.globalAlpha=.55*(1-age/80);for(const [x,y]of cells(ev.piece))if(y>=2)img('blocks/block_locked_flash.svg',x*c,(y-2)*c,c);ctx.globalAlpha=1;}
   if(ev.type==='clear'&&age<600){ctx.globalAlpha=Math.max(0,1-age/650);for(const row of ev.rows){const y=(row-2)*c;img(ev.rows.length===4?'fx/fx_rainbow_sweep.svg':'fx/fx_streak_h.svg',v.reducedMotion?0:(age/600*w-w),y,w*2,c);if(ev.rows.length>1)img('fx/fx_ring.svg',w/2-age/3,y+c/2-age/3,age*2/3);}ctx.globalAlpha=1;}
  }
  this.particles=this.particles.filter(p=>(visualTick-p.born)*STEP<p.life);
  for(const p of this.particles){const age=(visualTick-p.born)*STEP;ctx.save();ctx.globalAlpha=1-age/p.life;ctx.translate(p.x+p.vx*age,p.y+p.vy*age+.00009*age*age);ctx.rotate(p.angle+age*.004);img(p.name,-p.size/2,-p.size/2,p.size);ctx.restore();}
 }
}
