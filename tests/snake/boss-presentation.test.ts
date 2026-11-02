import assert from 'node:assert/strict';
import {Engine,T} from '../../src/games/snake-legend/src/core';
import {STORY_LEVELS} from '../../src/games/snake-legend/src/story-data';
import {B01,type BossState} from '../../src/games/snake-legend/src/encounters';
import {bossCue,bossPose} from '../../src/games/snake-legend/src/boss-presentation';
import {drawBoss,drawBossTargets} from '../../src/games/snake-legend/src/boss-render';
import {capture} from '../../src/games/snake-legend/src/checkpoint';
const engine=new Engine(STORY_LEVELS[9]),e=engine.encounters!;
// Real encounter transitions give the cue exactly the engine's countdown.
e.timer=1;e.before(engine);assert.equal(e.state,'telegraph');assert.equal(bossCue(e,16).remaining,B01.telegraph[0]);
const lockedShot=structuredClone(e.shot);engine.pos.x+=8;
for(let i=0;i<Math.round(B01.telegraph[0]*T.hz)-1;i++)e.before(engine);
assert.equal(bossCue(e,16).remaining,T.dt);assert.deepEqual(e.shot,lockedShot);
e.before(engine);assert.equal(e.state,'attack');assert.equal(bossCue(e,16).remaining,B01.attack);
for(let i=0;i<Math.round(B01.attack*T.hz);i++)e.before(engine);
assert.equal(e.state,'recovery');for(let i=0;i<B01.recovery*T.hz;i++)e.before(engine);
assert.equal(e.state,'weak');assert.equal(bossCue(e,16).fraction,1);e.timer=60;assert.equal(bossCue(e,16).fraction,.5);
// Every state renders without mutating any checkpoint/simulation fields.
let depth=0;const strokes:any[]=[];const context:any={measureText:(s:string)=>({width:s.length*.25}),save(){depth++;},restore(){depth--;assert(depth>=0);},stroke(){strokes.push({width:this.lineWidth,cap:this.lineCap});}};
for(const method of ['beginPath','arc','ellipse','moveTo','lineTo','fill','translate','rotate','scale','setLineDash','roundRect','fillText','fillRect'])context[method]=()=>{};
const states:BossState[]=['idle','telegraph','attack','recovery','weak','hurt','phase_change','defeated'];
for(const phase of [1,2,3])for(const state of states){e.state=state;e.phase=phase;e.timer=30;e.totalHits=(phase-1)*2;e.anchorTicks=7;e.anchors=[true,false];
 const before=capture(engine,'render-purity',[]);let sprites=0;drawBoss(context,e,engine.time,true,false,()=>sprites++);drawBossTargets(context,e,engine.length,true,()=>sprites++);
 assert.deepEqual(capture(engine,'render-purity',[]),before);assert.equal(depth,0);assert.equal(sprites,3);assert(bossCue(e,engine.length).label.length>0);
 drawBoss(context,e,engine.time,false,true,()=>{throw Error('fallback must not request sprite');});assert.equal(depth,0);
}
assert(strokes.some(s=>s.width===1.3&&s.cap==='round'),'danger ribbon matches .65u capsule');
e.state='idle';assert.deepEqual(bossPose(e,0,true),bossPose(e,999,true));e.state='hurt';assert.deepEqual(bossPose(e,0,true),bossPose(e,999,true));
e.phase=3;e.state='idle';e.anchorTicks=Math.round(B01.hold*T.hz);assert.equal(bossCue(e,16).hold,1);assert.match(bossCue(e,12).label,/12\/16/);
e.state='weak';e.timer=-1;assert.equal(bossCue(e,16).fraction,0);e.timer=9999;assert.equal(bossCue(e,16).fraction,1);
console.log('PASS boss presentation: real tick transitions, locked aim, countdown, all 24 phase/state combinations, checkpoint purity, round shot radius, fallback, reduced motion, bounded meters');
