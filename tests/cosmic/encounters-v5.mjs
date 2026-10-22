import test from 'node:test';import assert from 'node:assert/strict';
import {LEVELS,levelFor} from '../../src/games/cosmic-defense/content.ts';
import {createSimulation,step,pickup,replaySimulation,resultFor,EMPTY_UPGRADES} from '../../src/games/cosmic-defense/engine.ts';
import * as v4 from '../../src/games/cosmic-defense/legacy-v4-engine.ts';
const config=(level,version=5)=>({version,level,seed:42,mode:'campaign',upgrades:{...EMPTY_UPGRADES},integrity:100,boosters:[],mutators:[]});
const input={x:90,y:268,mask:0};
test('100 v5 missions retain IDs, with four teaching/combine/recovery phrases outside boss stages',()=>{
 assert.equal(LEVELS.length,100);for(const l of LEVELS){assert.equal(l.id,levelFor(l.id,4).id);assert.equal(l.designVersion,5);assert.ok(l.lesson.length>10);if(l.stage===10)continue;assert.equal(l.phases.length,4);assert.ok(l.phases.every(p=>p.rest>=3));assert.ok(l.waves.every(w=>w.phase>=0&&w.phase<4));assert.ok(l.waves.every(w=>w.t<l.duration));}
 assert.equal(new Set(LEVELS.map(l=>JSON.stringify(l.waves))).size,100);
});
test('v4 active saves/replays stay on the exact frozen engine',()=>{
 const c=config(29,4),a=createSimulation(c),b=v4.createSimulation(c);for(let f=0;f<900;f++){step(a,input);v4.step(b,input);}assert.deepEqual(a,b);assert.deepEqual(resultFor(replaySimulation(c,a.replay,a.frame)),v4.resultFor(b));
});
test('learning phrases wait for hostile projectiles and then provide a bounded safe rest',()=>{
 const s=createSimulation(config(1));s.invincible=999999;let rested=false;for(let f=0;f<12000&&s.status==='playing';f++){
  s.enemies.forEach(e=>e.hp=0);s.bullets=[];s.hazards=[];for(const item of s.pickups)pickup(s,item.kind);s.pickups=[];step(s,input);
  if(s.directorState==='rest'){rested=true;const until=s.restUntil,phase=s.directorPhase;while(s.frame<until-1){s.invincible=999999;step(s,input);assert.equal(s.enemies.length,0);assert.ok(s.bullets.every(b=>b.player));assert.equal(s.directorPhase,phase);}break;}
 }assert.ok(rested,'First teaching phrase must reach an actual rest');
});
