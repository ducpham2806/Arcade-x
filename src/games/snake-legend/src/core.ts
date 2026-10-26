import {Encounters} from './encounters';
import type {Story} from './story-data';
/** Deterministic, renderer-independent simulation. Units are world units, seconds. */
export type V = {x:number;y:number};
export type Rect = {x:number;y:number;w:number;h:number};
export type Hit = {t:number;normal:V};
export const T = Object.freeze({hz:60,dt:1/60,maxSteps:5,speed:3.5,dashSpeed:6,spacing:.6,sample:.1,headRadius:.42,bodyRadius:.38,maxLength:150});
export const clamp=(v:number,a:number,b:number)=>Math.max(a,Math.min(b,v));
export const distance=(a:V,b:V)=>Math.hypot(a.x-b.x,a.y-b.y);
export const angleDelta=(a:number,b:number)=>Math.atan2(Math.sin(b-a),Math.cos(b-a));
export function sweepCircle(p:V,d:V,c:V,r:number):Hit|null {
 const x=p.x-c.x,y=p.y-c.y,A=d.x*d.x+d.y*d.y,C=x*x+y*y-r*r;
 if(C< -1e-8){const l=Math.hypot(x,y)||1;return {t:0,normal:{x:x/l,y:y/l}};}
 if(A<1e-14)return null;
 const B=2*(x*d.x+y*d.y),disc=B*B-4*A*C;
 if(disc<0)return null; const t=(-B-Math.sqrt(disc))/(2*A);
 if(t< -1e-8||t>1||B>=0)return null;
 const q={x:x+d.x*Math.max(0,t),y:y+d.y*Math.max(0,t)},l=Math.hypot(q.x,q.y)||1;
 return {t:Math.max(0,t),normal:{x:q.x/l,y:q.y/l}};
}
/** Exact circle/axis-aligned rectangle sweep, including rounded Minkowski corners. */
export function sweepRect(p:V,d:V,r:number,b:Rect):Hit|null {
 let best:Hit|null=null;const offer=(h:Hit|null)=>{if(h&&(!best||h.t<best.t))best=h;};
 const near={x:clamp(p.x,b.x,b.x+b.w),y:clamp(p.y,b.y,b.y+b.h)};
 if(distance(p,near)<r-1e-8){let nx=p.x-near.x,ny=p.y-near.y,l=Math.hypot(nx,ny);if(l<1e-9){const faces=[{v:p.x-b.x,x:-1,y:0},{v:b.x+b.w-p.x,x:1,y:0},{v:p.y-b.y,x:0,y:-1},{v:b.y+b.h-p.y,x:0,y:1}].sort((a,c)=>a.v-c.v);nx=faces[0].x;ny=faces[0].y;l=1;}return {t:0,normal:{x:nx/l,y:ny/l}};}
 for(const [axis,value,lo,hi,n] of [ ['x',b.x-r,b.y,b.y+b.h,{x:-1,y:0}],['x',b.x+b.w+r,b.y,b.y+b.h,{x:1,y:0}],['y',b.y-r,b.x,b.x+b.w,{x:0,y:-1}],['y',b.y+b.h+r,b.x,b.x+b.w,{x:0,y:1}] ] as const){
  const other=axis==='x'?'y':'x';if(Math.abs(d[axis])<1e-12||d.x*n.x+d.y*n.y>=0)continue;
  const t=(value-p[axis])/d[axis],v=p[other]+t*d[other];if(t>=-1e-8&&t<=1&&v>=lo&&v<=hi)offer({t:Math.max(0,t),normal:n});
 }
 for(const x of [b.x,b.x+b.w])for(const y of [b.y,b.y+b.h])offer(sweepCircle(p,d,{x,y},r));
 return best;
}
export class Path {
 points:(V&{s:number})[]=[];total=0;head:V;private carry=0;private cursor=0;
 constructor(history:V[]){this.head={...history[0]};this.points=[{...history[0],s:0}];for(const p of history.slice(1))this.append(p);}
 append(p:V){const from=this.head,len=distance(from,p);if(len<1e-12)return;let along=T.sample-this.carry;
  while(along<=len+1e-9){this.points.push({x:from.x+(p.x-from.x)*along/len,y:from.y+(p.y-from.y)*along/len,s:this.total+along});along+=T.sample;}
  this.carry=(this.carry+len)%T.sample;if(this.carry<1e-9||T.sample-this.carry<1e-9)this.carry=0;
  this.total+=len;this.head={...p};while(this.cursor+1<this.points.length&&this.points[this.cursor+1].s<this.total-92)this.cursor++;
  if(this.cursor>512){this.points=this.points.slice(this.cursor);this.cursor=0;}
 }
 at(back:number):V {const s=this.total-back;let lo=this.cursor,hi=this.points.length-1;if(s<=this.points[lo].s)return {...this.points[lo]};
  while(lo<hi){const mid=Math.ceil((lo+hi)/2);if(this.points[mid].s<=s)lo=mid;else hi=mid-1;}
  const a=this.points[lo],b=this.points[lo+1]??{...this.head,s:this.total},f=clamp((s-a.s)/(b.s-a.s||1),0,1);return {x:a.x+(b.x-a.x)*f,y:a.y+(b.y-a.y)*f};
 }
 snapshot(){return {points:this.points.map(p=>({...p})),total:this.total,head:{...this.head},carry:this.carry,cursor:this.cursor};}
 restore(d:ReturnType<Path["snapshot"]>){this.points=d.points.map(p=>({...p}));this.total=d.total;this.head={...d.head};this.carry=d.carry;this.cursor=d.cursor;}
 body(n:number):V[]{return Array.from({length:n},(_,i)=>this.at(i*T.spacing));}
}
export type Arena={id:number;name:string;subtitle:string;w:number;h:number;length:number;start:V;heading:number;walls:Rect[];water:Rect[];spikes:Rect[];route:V[];duration?:number;patrols?:number;story?:Story};
export const ARENAS:Arena[]=[
 {id:0,name:'Vườn đường cong',subtitle:'Thu 8 quả theo thứ tự · tập lái và giữ hướng',w:30,h:26,length:6,start:{x:5,y:21},heading:0,walls:[{x:10,y:9,w:2,h:10},{x:20,y:7,w:2,h:10}],water:[],spikes:[],route:[{x:8,y:21},{x:15,y:21},{x:16,y:15},{x:16,y:7},{x:25,y:5},{x:26,y:12},{x:25,y:21},{x:17,y:23}]},
 {id:1,name:'Cầu & hành lang',subtitle:'Căn thẳng trước khi Dash · cầu rộng 2,2 u',w:34,h:26,length:12,start:{x:8,y:13},heading:0,walls:[{x:22,y:4,w:1,h:5},{x:22,y:17,w:1,h:5}],water:[{x:13,y:0,w:8,h:11.9},{x:13,y:14.1,w:8,h:11.9}],spikes:[{x:29,y:5,w:.22,h:5},{x:29,y:16,w:.22,h:5}],route:[{x:10,y:13},{x:17,y:13},{x:24,y:13},{x:26,y:7},{x:25,y:20},{x:24,y:13},{x:17,y:13},{x:7,y:13}]},
 {id:2,name:'Vòng dài 150 đốt',subtitle:'Giữ an toàn 60 giây · 20 vật cản chuyển động',w:44,h:40,length:150,start:{x:38,y:20},heading:Math.PI/2,walls:[],water:[],spikes:[],route:[],duration:60,patrols:20}
];
export type Input={x:number;y:number;dash:boolean;steering?:number};
export class SpatialHash {
 private cells=new Map<string,V[]>();
 rebuild(points:V[]){this.cells.clear();for(const p of points){const k=`${Math.floor(p.x/2)},${Math.floor(p.y/2)}`;let c=this.cells.get(k);if(!c)this.cells.set(k,c=[]);c.push(p);}}
 query(p:V,d:V,r:number){const out:V[]=[];for(let x=Math.floor((Math.min(p.x,p.x+d.x)-r)/2);x<=Math.floor((Math.max(p.x,p.x+d.x)+r)/2);x++)for(let y=Math.floor((Math.min(p.y,p.y+d.y)-r)/2);y<=Math.floor((Math.max(p.y,p.y+d.y)+r)/2);y++)out.push(...(this.cells.get(`${x},${y}`)??[]));return out;}
}
export class Engine {
 arena:Arena;path:Path;body:V[];previous:V[];pos:V;heading:number;previousHeading:number;filtered:number;
 tick=0;energy=100;regenDelay=0;exhausted=false;dashing=false;hearts=3;length:number;collected=0;hits=0;selfHits=0;invulnerable=0;stun=0;selfCooldown=0;distanceTravelled=0;dashDistance=0;wallContacts=0;
 eaten=new Set<string>();foodScore=0;combo=0;lastPickup=-100;goalReady=false;flowers=0;poisonHits=0;poisonTint=0;switchOn=false;respawns=new Map<string,number>();
 encounters?:Encounters;passed=new Set<string>();bridgeEntry=new Map<string,number>();secret=false;
 status:'running'|'won'|'lost'='running';lastEvent='';grid=new SpatialHash();
 constructor(id:number|Arena=0){this.arena=typeof id==='number'?(ARENAS[id]??ARENAS[0]):id;const a=this.arena;this.pos={...a.start};this.heading=this.previousHeading=this.filtered=a.heading;this.length=a.length;if(a.story?.encounter)this.encounters=new Encounters(a.story.encounter);
  const history:V[]=[];if(a.id===2){for(let s=-91;s<=0.001;s+=.05)history.push({x:22+16*Math.cos(s/16),y:20+16*Math.sin(s/16)});history.push({...this.pos});}
  else{for(let x=.5;x<a.start.x;x+=.05)history.push({x,y:a.start.y});history.push({...this.pos});}
  this.path=new Path(history);this.body=this.path.body(this.length);this.previous=this.body.map(p=>({...p}));
 }
 get stars():[boolean,boolean,boolean]{const s=this.arena.story;if(!s||this.status!=='won')return [false,false,false];return [true,this.hearts>=2,s.star3.kind==='secret'?this.secret:s.star3.kind==='trap'?(this.encounters?.trapped.size??0)>=s.star3.value:s.star3.kind==='noPoison'?this.poisonHits===0:s.star3.kind==='time'?this.time<=s.star3.value:s.star3.kind==='dash'?this.dashDistance>=s.star3.value:this.selfHits<=s.star3.value];}
 foodAvailable(id:string){const food=this.arena.story?.foods.find(f=>f.id===id);if(food?.readyAt!==undefined&&this.tick<Math.ceil(food.readyAt*T.hz))return false;return !this.eaten.has(id)||(this.respawns.has(id)&&this.tick>=this.respawns.get(id)!);}
 get objectiveTarget():V|undefined{const s=this.arena.story;if(!s)return undefined;if(this.goalReady)return s.exit;if(s.goal==='puzzle')return s.switch;if(s.goal==='boss')return (this.encounters?.weakOpen||this.encounters?.phase===1)?s.encounter!.boss!.weak:this.encounters?.phase===3?s.encounter!.boss!.posts[this.encounters.anchors[0]?1:0]:s.encounter!.webs[0];if(s.goal==='pass'){const b=s.bridges!.find(b=>!this.passed.has(b.id));return b?{x:this.pos.x<b.x-2?b.x-4:b.x+b.w+4,y:b.y+b.h/2}:s.exit;}return s.foods.filter(f=>this.foodAvailable(f.id)&&f.kind!=='poison'&&(s.goal!=='collect'||f.kind==='flower')).sort((a,b)=>distance(this.pos,a)-distance(this.pos,b))[0];}
 get score(){return this.length*10+this.foodScore+Math.floor(Math.max(0,(this.arena.story?.parSeconds??0)-this.time)*5);}
 get time(){return this.tick*T.dt;}
 patrols(time=this.time):V[]{return Array.from({length:this.arena.patrols??0},(_,i)=>({x:10+(i%5)*6+Math.sin(time*.75+i)*1.2,y:8+Math.floor(i/5)*8+Math.cos(time*.6+i*2)*1.2}));}
 damage(){if(this.invulnerable>0||this.status!=='running')return;this.hearts--;this.hits++;this.combo=0;this.lastPickup=-100;this.invulnerable=1.5;this.length=Math.max(3,this.length-Math.min(8,Math.max(3,Math.ceil(this.length*.2))));this.lastEvent='Chạm gai · mất 1 tim';if(this.hearts<=0)this.status='lost';}
 step(input:Input){if(this.status!=='running'||this.encounters?.tutorialPending)return;this.previous=this.body.map(p=>({...p}));this.previousHeading=this.heading;this.tick++;this.encounters?.before(this);if(this.encounters?.tutorialPending)return;this.poisonTint=Math.max(0,this.poisonTint-T.dt);
  this.invulnerable=Math.max(0,this.invulnerable-T.dt);this.stun=Math.max(0,this.stun-T.dt);this.selfCooldown=Math.max(0,this.selfCooldown-T.dt);
  const mag=Math.hypot(input.x,input.y);if(mag>.1){const target=Math.atan2(input.y,input.x);this.filtered+=angleDelta(this.filtered,target)*(1-Math.exp(-T.dt/(.06/clamp(input.steering??1,.5,2))));const rate=(this.length<10?360:this.length<=30?270:200)*Math.PI/180*T.dt;this.heading+=clamp(angleDelta(this.heading,this.filtered),-rate,rate);}else this.filtered=this.heading;
  if(!input.dash)this.exhausted=false;
  this.dashing=input.dash&&!this.exhausted&&this.energy>0&&this.stun<=0;
  if(this.dashing){this.energy=Math.max(0,this.energy-50*T.dt);this.regenDelay=.5;if(this.energy<=1e-8){this.energy=0;this.exhausted=true;}}
  else{this.regenDelay=Math.max(0,this.regenDelay-T.dt);if(this.regenDelay<=0)this.energy=Math.min(100,this.energy+20*T.dt);}
  const speed=this.stun>0?0:(this.dashing?T.dashSpeed:T.speed),delta={x:Math.cos(this.heading)*speed*T.dt,y:Math.sin(this.heading)*speed*T.dt};
  const a=this.arena,wall=[...a.walls,...(this.encounters?.posts??[]),...(a.story?.gate&&!this.switchOn?[a.story.gate]:[]),{x:-2,y:-2,w:2,h:a.h+4},{x:a.w,y:-2,w:2,h:a.h+4},{x:-2,y:-2,w:a.w+4,h:2},{x:-2,y:a.h,w:a.w+4,h:2}];
  const traversed:{p:V;d:V}[]=[];let rest=delta;
  for(let iter=0;iter<3;iter++){if(Math.hypot(rest.x,rest.y)<1e-10)break;let hit:Hit|null=null;for(const b of wall){const h=sweepRect(this.pos,rest,T.headRadius,b);if(h&&(!hit||h.t<hit.t))hit=h;}
   const f=hit?Math.max(0,hit.t-1e-6):1,travel={x:rest.x*f,y:rest.y*f};traversed.push({p:{...this.pos},d:travel});this.pos={x:this.pos.x+travel.x,y:this.pos.y+travel.y};this.path.append(this.pos);const len=Math.hypot(travel.x,travel.y);this.distanceTravelled+=len;if(this.dashing)this.dashDistance+=len;
   if(!hit)break;this.wallContacts++;const remain={x:rest.x*(1-f),y:rest.y*(1-f)},dot=remain.x*hit.normal.x+remain.y*hit.normal.y;rest={x:remain.x-Math.min(0,dot)*hit.normal.x,y:remain.y-Math.min(0,dot)*hit.normal.y};
  }
  if(!traversed.length)traversed.push({p:{...this.pos},d:{x:0,y:0}});
  // Hazard resolution precedes collectibles / success. Water tests only the head.
  let water=false,danger=false;const now=this.patrols(),prev=this.patrols(this.time-T.dt);
  for(const seg of traversed){for(const b of a.water)if(sweepRect(seg.p,seg.d,T.headRadius,b))water=true;for(const b of a.spikes)if(sweepRect(seg.p,seg.d,T.headRadius,b))danger=true;
   for(let i=0;i<now.length;i++){const rel={x:seg.d.x-(now[i].x-prev[i].x),y:seg.d.y-(now[i].y-prev[i].y)};if(sweepCircle(seg.p,rel,prev[i],.42+T.headRadius))danger=true;}
  }
  if(water){this.hearts=0;this.status='lost';this.lastEvent='Rơi khỏi cầu · hãy căn hướng trước khi Dash';}
  else if(danger)this.damage();
  if(this.status==='running')this.encounters?.after(this,traversed);
  if(this.status==='running'){
   this.grid.rebuild(this.body.slice(9));if(this.selfCooldown<=0&&this.stun<=0){outer:for(const seg of traversed)for(const p of this.grid.query(seg.p,seg.d,.8)){if(sweepCircle(seg.p,seg.d,p,T.headRadius+T.bodyRadius)){this.stun=.5;this.selfCooldown=2;this.selfHits++;this.lastEvent='Chạm thân · choáng 0,5 giây';break outer;}}}
   if(a.story){
    for(const food of a.story.foods){if(!this.foodAvailable(food.id)||!traversed.some(seg=>sweepCircle(seg.p,seg.d,food,.8)))continue;
     const first=!this.eaten.has(food.id);this.eaten.add(food.id);if(food.respawnSeconds)this.respawns.set(food.id,this.tick+Math.ceil(food.respawnSeconds*T.hz));if(food.kind==='jade'){this.secret=true;this.lastEvent='Đã tìm mảnh ngọc bí mật vùng 1';continue;}if(food.kind==='poison'){this.poisonHits++;this.poisonTint=5;this.length=Math.max(3,this.length-2);this.combo=0;this.lastPickup=-100;this.lastEvent='Quả độc · −2 đốt, không mất tim';continue;}if(food.kind==='flower'){this.flowers++;this.lastEvent=`Hoa ${this.flowers}/${a.story.target} · không tăng chiều dài`;continue;}this.collected++;this.length=Math.min(T.maxLength,this.length+(food.kind==='gold'?3:1));this.combo=this.time-this.lastPickup<=2?Math.min(5,this.combo+1):1;this.lastPickup=this.time;this.foodScore+=first?(food.kind==='gold'?30:10)*this.combo:0;this.lastEvent=food.kind==='gold'?'Quả vàng · +3 đốt':'Táo · +1 đốt';
    }
    if(a.story.switch&&!this.switchOn&&traversed.some(seg=>sweepCircle(seg.p,seg.d,a.story!.switch!,1))){this.switchOn=true;this.lastEvent='Công tắc đã chốt · cửa mở vĩnh viễn trong lượt';}
    for(const b of a.story.bridges??[]){if(this.passed.has(b.id))continue;const side=this.pos.x<b.x-T.headRadius?-1:this.pos.x>b.x+b.w+T.headRadius?1:0;if(side&&!this.bridgeEntry.has(b.id))this.bridgeEntry.set(b.id,side);if(side&&this.bridgeEntry.get(b.id)===-side){this.passed.add(b.id);this.lastEvent=`Đã qua ${this.passed.size}/${a.story.bridges!.length} cầu`;}}
    const ready=a.story.goal==='pass'?this.passed.size>=a.story.target:a.story.goal==='boss'?this.encounters?.state==='defeated':a.story.goal==='timed_collect'?false:a.story.goal==='puzzle'?this.switchOn:a.story.goal==='collect'?this.flowers>=a.story.target:a.story.goal==='eat'?this.collected>=a.story.target:this.length>=a.story.target;
    if(ready&&!this.goalReady)this.lastEvent='Cổng đã mở · đi vào vòng sáng để hoàn thành';this.goalReady=ready;
    if(a.story.goal==='timed_collect'&&this.tick>=Math.round(a.story.durationSeconds!*T.hz)){this.status='won';this.lastEvent=`Hết 45 giây · thu ${this.collected} quả vàng`;}
    if(ready&&traversed.some(seg=>sweepCircle(seg.p,seg.d,a.story!.exit,1))){this.status='won';this.lastEvent='Hoàn thành '+a.story.id;}
   }else{
   const target=a.route[this.collected];if(target&&traversed.some(s=>sweepCircle(s.p,s.d,target,.8))){this.collected++;this.length=Math.min(T.maxLength,this.length+1);this.lastEvent=`Đã thu ${this.collected}/${a.route.length} quả`;}
   if((a.route.length>0&&this.collected===a.route.length)||(a.duration&&this.time>=a.duration)){this.status='won';this.lastEvent='Hoàn thành sân thử';}
   }
  }
  this.body=this.path.body(this.length);
 }
}
export class FixedClock {accumulator=0;dropped=0;advance(seconds:number,step:()=>void){this.accumulator+=Math.max(0,Math.min(seconds,.25));let n=0;while(this.accumulator+1e-10>=T.dt&&n<T.maxSteps){step();this.accumulator-=T.dt;n++;}if(this.accumulator>=T.dt){this.dropped+=Math.floor(this.accumulator/T.dt);this.accumulator%=T.dt;}return clamp(this.accumulator/T.dt,0,1);}reset(){this.accumulator=0;}}
