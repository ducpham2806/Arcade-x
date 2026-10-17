import assert from 'node:assert/strict';
import {CAMPAIGN_STAGES} from '../../src/games/eat-em-all/campaign';
import {bossPhase,planDrop,safeDropLane,retryHint} from '../../src/games/eat-em-all/encounters';
import type {AirspaceItem} from '../../src/games/eat-em-all/encounters';
const stages=CAMPAIGN_STAGES;
const example=stages[16];
const plans=Array.from({length:144},(_,i)=>planDrop(example,i,{},i*.6));
assert.ok(new Set(plans.map(p=>p.speed.toFixed(3))).size>60,'individual fall speeds vary');
assert.equal(new Set(plans.map(p=>p.speedClass)).size,4);
assert.ok(Math.max(...plans.map(p=>p.intervalMs))>Math.min(...plans.map(p=>p.intervalMs))*3,'burst/recovery contrast');
assert.ok(plans.every(p=>p.flightSeconds>=1.25));
assert.ok(plans.filter(p=>p.speedClass==='rush').every(p=>p.warningSeconds>=.5));
for(let i=0;i<plans.length;i++)assert.deepEqual(plans[i],planDrop(example,i,{},i*.6),'retry pattern stable');
let overtakes=0;
for(const s of stages.filter(s=>s.id>=3))for(let i=0;i<120;i++){
 const first=planDrop(s,i,{},i*.6);if(first.trick!=='overtake-lead')continue;
 const second=planDrop(s,i+1,{},i*.6+first.intervalMs/1000);
 assert.equal(second.trick,'overtake-pass');assert.equal(first.lane,second.lane);
 if(s.objective!=='boss'){
  assert.equal(first.type,second.type,'overtaking pair must not force impossible element switch');
  assert.ok(second.flightSeconds+second.warningSeconds+first.intervalMs/1000<first.flightSeconds+first.warningSeconds,'later item arrives first');overtakes++;
 }
}
assert.ok(overtakes>20);
for(const s of stages.slice(0,2))for(let i=0;i<80;i++)assert.ok(!['bomb','poison'].includes(planDrop(s,i,{},i).type));
const signatures=[1,2,3,4].map(c=>Array.from({length:150},(_,i)=>bossPhase(i*.1,c).phase).join(','));assert.equal(new Set(signatures).size,4);
assert.equal(bossPhase(5,4).element,'ice');assert.equal(bossPhase(6,4).element,'fire');assert.equal(bossPhase(5.1,4).switchSoon,true);
assert.ok(retryHint(stages[0],{ice:12,star:6},0).includes('2 Băng'));
// Collision-free lane availability over the authored schedule, at mobile/desktop widths.
let simulations=0,deferrals=0;
for(const s of stages)for(const [width,height] of [[360,480],[900,540]]){
 const catchY=height-86,margin=40,dt=1/30,radius=36,grid=41;
 const positions=Array.from({length:grid},(_,i)=>margin+(width-2*margin)*i/(grid-1));
 const move=Math.max(420,width*1.2)*dt;
 let reachable=positions.map((_,i)=>i===20),items:AirspaceItem[]=[],next=.65,seq=0;
 for(let frame=0;frame<Math.round(60*30);frame++){
  const time=frame*dt;
  // Counts advance only for pressure modeling; this is an avoidance feasibility test.
  const completion=Math.min(.95,time/55);
  const counts=Object.fromEntries(Object.entries(s.targetItems).map(([k,n])=>[k,Math.floor((n||0)*completion)]));
  if(time>=next){const p=planDrop(s,seq,counts,time);const lane=safeDropLane(p,time,catchY,width,margin,items);
   if(lane===null){next=time+.15;deferrals++;}else{items.push({type:p.type,x:margin+(width-2*margin)*lane/4,y:-30,vx:p.drift*35,vy:(catchY+30)/p.flightSeconds,warningLeft:p.warningSeconds});next=time+p.intervalMs/1000;seq++;}
  }
  for(const it of items){if((it.warningLeft||0)>0){it.warningLeft=Math.max(0,(it.warningLeft||0)-dt);continue;}it.y+=it.vy*dt;it.x=Math.max(30,Math.min(width-30,it.x+it.vx*dt));}
  items=items.filter(it=>it.y<height+40);
  const hazards=items.filter(it=>['bomb','poison'].includes(it.type)&&!it.warningLeft&&Math.abs(it.y-catchY)<30);
  const nextReachable=positions.map((x,i)=>!hazards.some(it=>Math.abs(it.x-x)<radius)&&positions.some((prior,j)=>reachable[j]&&Math.abs(prior-x)<=move));
  assert.ok(nextReachable.some(Boolean),`No escape path stage ${s.id} ${width}px at ${time.toFixed(2)}s`);reachable=nextReachable;
 }
 simulations++;
}
console.log(`PASS: per-item speeds, four classes, learnable beats, ${overtakes} overtake pairs, four boss cycles, ${simulations} mobile/desktop hazard-escape schedules (${deferrals} safe deferrals).`);
