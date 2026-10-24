import {assertSchema} from './schema';
import {checkpointSchema} from './contracts';
import {Engine,T,type V} from './core';
import {STORY_LEVELS} from './story-data';
import type {StorageLike} from './story-save';
export const CHECKPOINT_KEY='snake-legend:r01-checkpoint:v1';
const scalars=['heading','previousHeading','filtered','tick','energy','regenDelay','exhausted','dashing','hearts','length','collected','hits','selfHits','invulnerable','stun','selfCooldown','distanceTravelled','dashDistance','wallContacts','foodScore','combo','lastPickup','goalReady','flowers','poisonHits','poisonTint','switchOn','secret'] as const;
const encounterScalars=['spawnSerial','phase','hits','totalHits','state','timer','weakPending','contact','debounce','misses','anchorTicks','anchorArmed','tutorialPending'] as const;
const xy=(p:V)=>({x:p.x,y:p.y});
function hash(s:string){let h=2166136261;for(let i=0;i<s.length;i++)h=Math.imul(h^s.charCodeAt(i),16777619);return (h>>>0).toString(16);}
// Bump mechanics revision when simulation rules change. Layout/tuning changes invalidate automatically.
export const CONTENT_SIGNATURE=hash(JSON.stringify({mechanics:1,levels:STORY_LEVELS,tuning:T}));
export function capture(e:Engine,runId:string,seen:number[]=[]){
 if(!e.arena.story||e.status!=='running')throw Error('Only active Story runs can resume');
 const a=e.encounters;
 return {version:1 as const,content:CONTENT_SIGNATURE,level:e.arena.story.id,runId,seen:[...seen],state:Object.fromEntries(scalars.map(k=>[k,e[k]])),pos:xy(e.pos),path:e.path.snapshot(),previous:e.previous.map(xy),eaten:[...e.eaten],respawns:[...e.respawns],passed:[...e.passed],bridgeEntry:[...e.bridgeEntry],lastEvent:e.lastEvent,encounter:a?{state:Object.fromEntries(encounterScalars.map(k=>[k,a[k]])),spiders:a.spiders.map(s=>({...s,previous:xy(s.previous)})),trapped:[...a.trapped],anchors:[...a.anchors],shot:{from:xy(a.shot.from),to:xy(a.shot.to)}}:null};
}
export type Snapshot=ReturnType<typeof capture>;
function need(ok:unknown):asserts ok{if(!ok)throw Error('Bản lưu giữa màn không hợp lệ.');}
function object(x:unknown):asserts x is Record<string,any>{need(x!==null&&typeof x==='object'&&!Array.isArray(x));}
function exact(x:unknown,keys:string[]){object(x);need(Object.keys(x).length===keys.length&&keys.every(k=>Object.hasOwn(x,k)));}
function num(x:unknown,min=-1e9,max=1e9,int=false):asserts x is number{need(typeof x==='number'&&Number.isFinite(x)&&x>=min&&x<=max&&(!int||Number.isSafeInteger(x)));}
function vector(p:unknown){exact(p,['x','y']);const v=p as V;num(v.x,-1000,1000);num(v.y,-1000,1000);}
function strings(a:unknown,allowed:(s:string)=>boolean,max:number):asserts a is string[]{need(Array.isArray(a)&&a.length<=max&&new Set(a).size===a.length&&a.every(s=>typeof s==='string'&&allowed(s)));}
function scalarShape(d:Record<string,any>,base:Record<string,any>){exact(d,Object.keys(base));for(const k of Object.keys(base)){if(typeof base[k]==='number')num(d[k]);else need(typeof d[k]===typeof base[k]);}}
export function decode(raw:string):{engine:Engine;snapshot:Snapshot}{
 need(raw.length<=262144);const d=JSON.parse(raw);assertSchema(checkpointSchema,d);object(d);need(d.version===1);if(d.content!==CONTENT_SIGNATURE)throw Error('Bản lưu thuộc phiên bản màn khác. Anh có thể chơi lại màn.');
 const index=STORY_LEVELS.findIndex(a=>a.story!.id===d.level);need(index>=0);const e=new Engine(STORY_LEVELS[index]),base=capture(e,'validation');exact(d,Object.keys(base));
 need(typeof d.runId==='string'&&d.runId.length>0&&d.runId.length<100);need(typeof d.lastEvent==='string'&&d.lastEvent.length<=300);
 need(Array.isArray(d.seen)&&d.seen.length<=e.arena.story!.beats.length&&new Set(d.seen).size===d.seen.length);for(const n of d.seen)num(n,0,e.arena.story!.beats.length-1,true);
 scalarShape(d.state,base.state);const s=d.state;
 for(const k of ['tick','collected','hits','selfHits','wallContacts','foodScore','flowers','poisonHits'])num(s[k],0,100000000,true);
 num(s.length,3,150,true);num(s.hearts,1,3,true);num(s.combo,0,5,true);num(s.energy,0,100);num(s.regenDelay,0,.5);num(s.invulnerable,0,1.5);num(s.stun,0,.5);num(s.selfCooldown,0,2);num(s.poisonTint,0,5);num(s.distanceTravelled,0);num(s.dashDistance,0,s.distanceTravelled+1e-6);num(s.lastPickup,-100,s.tick/60);
 vector(d.pos);num(d.pos.x,0,e.arena.w);num(d.pos.y,0,e.arena.h);
 const p=d.path;exact(p,['points','total','head','carry','cursor']);vector(p.head);num(p.total,0);num(p.carry,0,T.sample);need(Array.isArray(p.points)&&p.points.length>0&&p.points.length<=1600);num(p.cursor,0,p.points.length-1,true);let last=-1;
 for(const point of p.points){exact(point,['x','y','s']);vector({x:point.x,y:point.y});num(point.s,0,p.total+1e-6);need(point.s>last);last=point.s;}
 need(Math.hypot(p.head.x-d.pos.x,p.head.y-d.pos.y)<1e-9);need(p.total-p.points.at(-1).s<=T.sample+1e-5);need(p.total-p.points[p.cursor].s<=93);
 need(Array.isArray(d.previous)&&d.previous.length>=3&&d.previous.length<=150);d.previous.forEach(vector);
 const foods=e.arena.story!.foods,bridges=e.arena.story!.bridges??[];
 strings(d.eaten,id=>foods.some(f=>f.id===id),foods.length);strings(d.passed,id=>bridges.some(b=>b.id===id),bridges.length);
 function pairs(a:unknown,max:number,check:(v:any[])=>void){need(Array.isArray(a)&&a.length<=max);const ids=new Set();for(const v of a){need(Array.isArray(v)&&v.length===2&&!ids.has(v[0]));ids.add(v[0]);check(v);}}
 pairs(d.respawns,foods.length,v=>{need(d.eaten.includes(v[0])&&foods.some(f=>f.id===v[0]&&f.respawnSeconds));num(v[1],0,s.tick+7200,true);});
 pairs(d.bridgeEntry,bridges.length,v=>{need(bridges.some(b=>b.id===v[0])&&[-1,1].includes(v[1]));});
 if(e.encounters){const a=d.encounter;need(a!==null);exact(a,['state','spiders','trapped','anchors','shot']);scalarShape(a.state,base.encounter!.state);const q=a.state;
  for(const k of ['spawnSerial','timer','debounce','misses','anchorTicks'])num(q[k],0,100000000,true);
  num(q.phase,1,3,true);num(q.hits,0,2,true);num(q.totalHits,0,6,true);need(['idle','telegraph','attack','recovery','weak','hurt','phase_change','defeated'].includes(q.state));
  if(e.encounters.boss)need(q.totalHits===(q.phase-1)*2+q.hits);
  const validId=(id:string)=>e.encounters!.spec.spiders.some(v=>v.id===id)||(/^add-[1-9]\d*$/.test(id)&&Number(id.slice(4))<=q.spawnSerial);
  strings(a.trapped,validId,50000);need(Array.isArray(a.spiders)&&a.spiders.length<=16&&new Set(a.spiders.map((v:any)=>v.id)).size===a.spiders.length);
  for(const spider of a.spiders){object(spider);need(Object.keys(spider).every(k=>['id','x','y','previous','mode','timer','afterTrap'].includes(k)));need(typeof spider.id==='string'&&validId(spider.id));vector({x:spider.x,y:spider.y});vector(spider.previous);need(['waiting','warning','chasing','trapped'].includes(spider.mode));num(spider.timer,0,100000000,true);need(spider.afterTrap===undefined||typeof spider.afterTrap==='boolean');}
  need(Array.isArray(a.anchors)&&a.anchors.length===2&&a.anchors.every((b:unknown)=>typeof b==='boolean'));exact(a.shot,['from','to']);vector(a.shot.from);vector(a.shot.to);
  Object.assign(e.encounters,a.state,{spiders:a.spiders,trapped:new Set(a.trapped),anchors:a.anchors,shot:a.shot});
 }else need(d.encounter===null);
 Object.assign(e,d.state,{pos:d.pos,previous:d.previous,eaten:new Set(d.eaten),respawns:new Map(d.respawns),passed:new Set(d.passed),bridgeEntry:new Map(d.bridgeEntry),lastEvent:d.lastEvent});e.path.restore(p);e.body=e.path.body(e.length);
 return {engine:e,snapshot:d as Snapshot};
}
export class Checkpoints{
 error='';private lastRaw:string|null=null;private stamp='';private blocked=false;
 constructor(private store:StorageLike){}
 load(){try{this.lastRaw=this.store.getItem(CHECKPOINT_KEY);if(!this.lastRaw)return null;const d=JSON.parse(this.lastRaw);if(d?.version===1&&d.empty===true&&Object.keys(d).length===2)return null;return decode(this.lastRaw);}catch(e){this.blocked=true;this.error=(e instanceof Error&&e.message.startsWith('Bản lưu')?e.message:'Không đọc được bản lưu giữa màn.')+' Bản cũ được giữ nguyên; có thể bắt đầu lượt mới.';return null;}}
 // Explicit new run may replace an incompatible checkpoint; passive mount never does.
 start(){this.blocked=false;this.stamp='';try{this.lastRaw=this.store.getItem(CHECKPOINT_KEY);}catch{this.error='Chưa đọc được bộ nhớ thiết bị.';return;}this.clear();}
 save(e:Engine,runId:string,seen:number[]){if(this.blocked||e.status!=='running')return false;const stamp=runId+':'+e.tick+':'+seen.join(',')+':'+e.encounters?.tutorialPending;if(stamp===this.stamp)return true;try{if(this.store.getItem(CHECKPOINT_KEY)!==this.lastRaw){this.blocked=true;this.error='Màn đang chơi đã được lưu ở cửa sổ khác. Bản đó được giữ nguyên; hãy tải lại để tiếp tục.';return false;}const raw=JSON.stringify(capture(e,runId,seen));need(raw.length<=262144);this.store.setItem(CHECKPOINT_KEY,raw);this.lastRaw=raw;this.stamp=stamp;this.error='';return true;}catch{this.error='Chưa lưu được màn đang chơi. Anh vẫn chơi được; hãy thử lưu lại khi tạm dừng.';return false;}}
 clear(){if(this.blocked)return;const raw='{"version":1,"empty":true}';if(this.lastRaw===raw)return;try{if(this.store.getItem(CHECKPOINT_KEY)!==this.lastRaw){this.blocked=true;this.error='Màn đang chơi đã đổi ở cửa sổ khác. Bản đó được giữ nguyên.';return;}this.store.setItem(CHECKPOINT_KEY,raw);this.lastRaw=raw;this.stamp='';this.error='';}catch{this.error='Chưa xóa được mốc chơi cũ trên thiết bị.';}}
}
