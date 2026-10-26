import {distance,sweepCircle,sweepRect,T,type V,type Rect} from './core';
import type {Engine} from './core';
export type Web=V&{id:string;r:number};
export type SpiderSpec=V&{id:string;afterTrap?:boolean};
export type Spider=SpiderSpec&{previous:V;mode:'waiting'|'warning'|'chasing'|'trapped';timer:number};
export type BossSpec={center:V;weak:V;posts:[V,V]};
export type EncounterSpec={webs:Web[];spiders:SpiderSpec[];boss?:BossSpec};
export type BossState='idle'|'telegraph'|'attack'|'recovery'|'weak'|'hurt'|'phase_change'|'defeated';
const ticks=(s:number)=>Math.round(s*T.hz);
export const B01={phaseHits:[2,2,2],telegraph:[.9,.85,.8],attack:.45,recovery:1,weak:2,debounce:.6,hold:.35};
export class Encounters{
 spiders:Spider[]=[];trapped=new Set<string>();spawnSerial=0;
 phase=1;hits=0;totalHits=0;state:BossState='idle';timer=ticks(3);weakPending=false;contact=false;debounce=0;misses=0;anchors=[false,false];anchorTicks=0;anchorArmed=true;shot={from:{x:0,y:0},to:{x:0,y:0}};tutorialPending=false;
 constructor(public spec:EncounterSpec){this.spiders=spec.spiders.map(s=>({...s,previous:{...s},mode:'waiting',timer:0}));}
 get boss(){return this.spec.boss;}
 get weakOpen(){return this.state==='weak';}
 get posts():Rect[]{return this.boss?this.boss.posts.map(p=>({x:p.x-.35,y:p.y-.35,w:.7,h:.7})):[];}
 get instruction(){if(!this.boss)return 'Dụ nhện theo qua vùng tơ màu trắng.';if(this.state==='defeated')return 'Nhện Mẹ đã thua · đi vào cổng';if(this.state==='weak')return 'ĐIỂM YẾU MỞ · giữ Dash húc vòng ngọc';return this.phase===1?'Né đường bắn tơ; chờ bụng lộ vòng ngọc.':this.phase===2?'Dụ nhện con vào tơ để mở điểm yếu.':'Dài ≥16: thân nối hai cột cùng 0,35 giây, rồi Dash vào vòng ngọc.';}
 private set(state:BossState,seconds:number){this.state=state;this.timer=ticks(seconds);if(state==='weak'&&this.phase===2)this.spiders=[];}
 private addSpiders(){if(!this.boss)return;for(const old of this.spiders)if(old.mode==='trapped')old.timer++;this.spiders=this.spiders.filter(s=>s.mode!=='trapped');const live=this.spiders.length;for(let i=live;i<2;i++){const p={x:this.boss.center.x+(i?8:-8),y:this.boss.center.y};this.spiders.push({...p,id:`add-${++this.spawnSerial}`,previous:{...p},mode:'warning',timer:ticks(.9)});}}
 private aim(e:Engine){const from=this.boss!.center,dx=e.pos.x-from.x,dy=e.pos.y-from.y,len=Math.hypot(dx,dy)||1;let delta={x:dx/len*24,y:dy/len*24},f=1;for(const b of this.posts){const hit=sweepRect(from,delta,.2,b);if(hit)f=Math.min(f,hit.t);}this.shot={from:{...from},to:{x:from.x+delta.x*f,y:from.y+delta.y*f}};}
 before(e:Engine){if(this.tutorialPending)return;this.debounce=Math.max(0,this.debounce-1);
  for(const s of this.spiders){s.previous={x:s.x,y:s.y};if(s.mode==='trapped')continue;if(s.afterTrap&&this.trapped.size===0)continue;
   if(s.mode==='waiting'){if(distance(s,e.pos)<12){s.mode='warning';s.timer=ticks(.9);}continue;}if(s.mode==='warning'){if(--s.timer<=0)s.mode='chasing';continue;}
   const d=distance(s,e.pos)||1,move={x:(e.pos.x-s.x)/d*2*T.dt,y:(e.pos.y-s.y)/d*2*T.dt};let f=1;for(const b of [...e.arena.walls,...this.posts]){const hit=sweepRect(s,move,.45,b);if(hit)f=Math.min(f,Math.max(0,hit.t-1e-5));}s.x+=move.x*f;s.y+=move.y*f;
   if(this.spec.webs.some(w=>!!sweepCircle(s.previous,{x:s.x-s.previous.x,y:s.y-s.previous.y},w,w.r+.45))){s.mode='trapped';this.trapped.add(s.id);e.lastEvent='Nhện mắc tơ · hãy tận dụng đường vòng';if(this.boss&&this.phase===2)this.weakPending=true;}
  }
  if(!this.boss||this.state==='defeated')return;
  if(this.phase===3){this.anchors=this.boss.posts.map(p=>e.body.slice(1).some(b=>distance(b,p)<=.8+T.bodyRadius));const both=e.length>=16&&this.anchors.every(Boolean);if(!both){this.anchorTicks=0;if(!['weak','hurt'].includes(this.state))this.anchorArmed=true;}else if(this.anchorArmed&&!['weak','hurt','phase_change'].includes(this.state)){this.anchorTicks++;if(this.anchorTicks>=ticks(B01.hold)){this.weakPending=true;this.anchorArmed=false;this.anchorTicks=0;}}}
  if(this.state==='idle'&&this.weakPending){this.weakPending=false;this.set('weak',B01.weak);e.lastEvent=this.instruction;return;}
  if(--this.timer>0)return;
  switch(this.state){
   case'idle':this.aim(e);this.set('telegraph',B01.telegraph[this.phase-1]);break;
   case'telegraph':this.set('attack',B01.attack);break;
   case'attack':this.set('recovery',B01.recovery);break;
   case'recovery':if(this.phase===1||this.weakPending){this.weakPending=false;this.set('weak',B01.weak);e.lastEvent=this.instruction;}else{if(this.phase===2)this.addSpiders();this.set('idle',2);}break;
   case'weak':this.misses++;if(this.misses>=2)e.lastEvent='Gợi ý: '+this.instruction;if(this.phase===2)this.addSpiders();this.set('idle',2.5);this.anchorTicks=0;break;
   case'hurt':if(this.hits>=2){if(this.phase===3){this.set('defeated',0);e.lastEvent='Nhện Mẹ đã bị đánh bại · đến cổng';}else{this.phase++;this.hits=0;this.spiders=[];this.weakPending=false;this.anchors=[false,false];this.anchorTicks=0;this.anchorArmed=true;this.set('phase_change',1);}}else{if(this.phase===2)this.addSpiders();this.set('idle',3);}break;
   case'phase_change':this.tutorialPending=true;this.set('idle',3);if(this.phase===2)this.addSpiders();break;
  }
 }
 after(e:Engine,segments:{p:V;d:V}[]){if(this.tutorialPending)return;
  const near=this.boss?segments.some(s=>!!sweepCircle(s.p,s.d,this.boss!.weak,.85+T.headRadius)):false;
  const newContact=near&&!this.contact;this.contact=near;
  if(this.boss&&this.state==='weak'&&newContact&&e.dashing&&this.debounce===0){this.hits++;this.totalHits++;this.debounce=ticks(B01.debounce);this.misses=0;this.set('hurt',.6);e.invulnerable=Math.max(e.invulnerable,1.5);e.lastEvent=`Húc trúng điểm yếu · ${this.totalHits}/6`;return;}
  let hazard=false;
  for(const s of this.spiders)if(s.mode==='chasing')for(const seg of segments)if(sweepCircle(seg.p,{x:seg.d.x-(s.x-s.previous.x),y:seg.d.y-(s.y-s.previous.y)},s.previous,.45+T.headRadius))hazard=true;
  if(this.boss&&this.state!=='defeated'){
   if(segments.some(s=>!!sweepCircle(s.p,s.d,this.boss!.center,1.8+T.headRadius)))hazard=true;
   if(this.state==='attack'){const {from,to}=this.shot;for(const seg of segments){if(sweepCircle(from,{x:to.x-from.x,y:to.y-from.y},seg.p,.65+T.headRadius)||sweepCircle(from,{x:to.x-from.x,y:to.y-from.y},{x:seg.p.x+seg.d.x,y:seg.p.y+seg.d.y},.65+T.headRadius))hazard=true;}}
  }
  if(hazard){const hearts=e.hearts;e.damage();if(e.hearts<hearts)e.lastEvent='Nhện / tơ bắn · mất 1 tim';}
 }
}
