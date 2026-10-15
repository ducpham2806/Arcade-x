import test from 'node:test';
import assert from 'node:assert/strict';
import {LEVELS, levelFor} from '../../src/games/cosmic-defense/content.ts';
import {LEVELS_V3} from '../../src/games/cosmic-defense/legacy-v3-content.ts';
import {createSimulation, step, replaySimulation, resultFor, EMPTY_UPGRADES} from '../../src/games/cosmic-defense/engine.ts';
import * as v3 from '../../src/games/cosmic-defense/legacy-v3-engine.ts';
import * as v2 from '../../src/games/cosmic-defense/legacy-engine.ts';
const config = (level, seed = 42, version = 4) => ({version, level, seed, mode:'campaign', upgrades:{...EMPTY_UPGRADES}, integrity:100, boosters:[], mutators:[]});
const input = {x:90, y:268, mask:0};

test('100 authored missions preserve IDs/objectives, finish launches, and contain distinct encounter roles', () => {
  assert.equal(LEVELS.length, 100);
  for (const l of LEVELS) {
    const old = levelFor(l.id, 2);
    assert.deepEqual([l.id,l.planet,l.stage,l.objective], [old.id,old.planet,old.stage,old.objective]);
    assert.ok(new Set(l.waves.map(w=>w.enemy)).size >= 4, `roster ${l.id}`);
    assert.ok(new Set(l.waves.map(w=>w.path)).size >= 4, `routes ${l.id}`);
    let end = 0;
    for (const w of l.waves) {
      assert.ok(w.t >= end - .011, `serial queue ${l.id}`);
      end = w.t + (w.count + Math.ceil(w.count * .5)) * w.delay;
      assert.ok(end < l.duration - 3, `late launch ${l.id}`);
    }
    if (l.stage !== 10) {
      assert.ok(l.waves.reduce((n,w)=>n+w.count,0) >= 90, `thin level ${l.id}`);
      assert.ok(l.waves.some((w,i)=>i && w.t-(l.waves[i-1].t+l.waves[i-1].count*l.waves[i-1].delay)>3), `no respite ${l.id}`);
    }
    if(l.objective==='kills') assert.ok(l.target < l.waves.reduce((n,w)=>n+w.count,0) * .5);
    if(l.objective==='generators') assert.equal(l.waves.filter(w=>w.enemy==='generator').length,l.target);
    if(l.objective==='mini') assert.equal(l.waves.filter(w=>w.enemy==='commander').length,1);
  }
  assert.equal(new Set(LEVELS.map(l=>JSON.stringify(l.waves))).size,100);
});

test('all campaign queues deliver their full authored budget with kills, including objective targets', () => {
  for(const l of LEVELS.filter(l=>l.stage!==10)) for(const seed of [3,42,9001]) {
    const s=createSimulation(config(l.id,seed));
    // A kill oracle checks scheduling, not human difficulty or achievable DPS.
    for(let i=0;i<l.duration*60;i++) {
      s.invincible=100;s.cloak=100;
      for(const e of s.enemies) e.hp=0;
      step(s,input);
    }
    assert.equal(s.waveIndex,l.waves.length,`stranded queue ${l.id}/${seed}`);
    assert.ok(s.spawned>=l.waves.reduce((n,w)=>n+w.count,0));
    if(l.objective==='generators') assert.equal(s.generators,l.target);
    if(l.objective==='mini') assert.ok(s.miniKilled);
    if(l.objective==='kills') assert.equal(s.status,'won');
    assert.ok(s.supplyDrops<=5+Math.floor((l.planet-1)/3));
  }
});

test('crowds stay separated and supplies never appear without kills across all sectors', () => {
  for(let p=1;p<=10;p++) for(const seed of [3,42,9001]) {
    const s=createSimulation(config((p-1)*10+9,seed));let worst=0;
    for(let i=0;i<levelFor(s.config.level).duration*60;i++) {
      s.invincible=100;s.cloak=100;step(s,input);
      if(i%6) continue;
      for(let a=0;a<s.enemies.length;a++)for(let b=a+1;b<s.enemies.length;b++) {
        const x=s.enemies[a],y=s.enemies[b];if(x.y<0||y.y<0)continue;
        worst=Math.max(worst,x.radius+y.radius-Math.hypot(x.x-y.x,x.y-y.y));
      }
    }
    assert.ok(worst<1,`body overlap ${p}/${seed}: ${worst}`);
    assert.equal(s.kills,0);assert.equal(s.pickups.length,0);
  }
});

test('bosses expose a recovery beat and do not receive ambient arena hazards', () => {
  for(let p=1;p<=10;p++) {
    const s=createSimulation(config(p*10));let recovery=false;
    for(let i=0;i<1800;i++) {
      s.invincible=100;s.cloak=100;step(s,input);
      recovery ||= s.message.startsWith('LỘ LÕI');
    }
    assert.ok(recovery,`boss ${p} has no recovery`);
    assert.equal(s.lastHazard,0);
  }
});

test('v2/v3 saved runs still use frozen rules; v4 replay reproduces combat exactly', () => {
  assert.deepEqual(levelFor(49,3),LEVELS_V3[48]);
  for(const version of [2,3,4]) {
    const c={...config(9,42,version),mode:'practice'};
    const s=createSimulation(c);
    for(let i=0;i<1800;i++)step(s,{x:Math.round(90+Math.sin(i/90)*70),y:260,mask:0});
    const r=replaySimulation(c,s.replay,s.frame);
    assert.deepEqual(resultFor(r),resultFor(s));
    assert.deepEqual(r.enemies,s.enemies);assert.deepEqual(r.bullets,s.bullets);
    if(version<4) assert.deepEqual(r,(version===2?v2:v3).replaySimulation(c,s.replay,s.frame));
  }
});

test('escort uses three marked assault squads; ordinary flybys cannot damage the convoy', () => {
  for(let p=1;p<=10;p++) {
    const l=levelFor((p-1)*10+6), assaults=l.waves.filter(w=>w.escortThreat);
    assert.equal(assaults.length,3);assert.equal(assaults.reduce((n,w)=>n+w.count,0),18);
    const s=createSimulation(config(l.id));
    for(let i=0;i<l.duration*60;i++) {
      s.invincible=100;s.cloak=100;
      for(const e of s.enemies)if(e.escortThreat)e.hp=0;
      step(s,input);
    }
    assert.equal(s.escortHp,12);assert.equal(s.status,'won');
  }
});

test('v4 local saves validate while server tickets continue to require their issued version', async () => {
  const {validConfig,hydrateSave,emptySave}=await import('../../src/games/cosmic-defense/save.ts');
  const {verifyReplay}=await import('../../supabase/functions/cosmic-verify/verify.ts');
  const {encodeReplay,endRun}=await import('../../src/games/cosmic-defense/engine.ts');
  assert.ok(validConfig(config(1)));
  const s=createSimulation(config(1));for(let i=0;i<120;i++)step(s,input);
  const save=emptySave();save.run={config:s.config,replay:s.replay,frame:s.frame};
  assert.deepEqual(hydrateSave(save).run.config,s.config);
  for(const version of [2,3]) {
    const c=config(1,42,version), run=createSimulation(c);
    for(let i=0;i<120;i++)step(run,input);endRun(run);
    const now=Date.now(),ticket={pack_version:version,config:c,started_at:new Date(now-3000).toISOString()};
    assert.deepEqual(verifyReplay(ticket,encodeReplay(run.replay),run.frame,now).result,resultFor(run));
    assert.throws(()=>verifyReplay({...ticket,pack_version:4},'',1,now),/version/);
  }
});
