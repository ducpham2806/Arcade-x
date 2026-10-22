import {test, expect} from '@playwright/test';
import {createSimulation, step, replaySimulation, useSlot, resultFor, EMPTY_UPGRADES} from '../../src/games/cosmic-defense/engine';
import * as legacy from '../../src/games/cosmic-defense/legacy-engine';
import {LEVELS_V3 as LEVELS, levelFor} from '../../src/games/cosmic-defense/legacy-v3-content';
import {validConfig} from '../../src/games/cosmic-defense/save';
import type {RunConfig} from '../../src/games/cosmic-defense/types';
const config = (level = 1, seed = 42): RunConfig => ({version:3, level, seed, mode:'campaign', upgrades:{...EMPTY_UPGRADES}, integrity:100, boosters:[], mutators:[]});
const input = {x:90,y:268,mask:0};

test('all 100 missions have reachable objectives, varied rosters/routes and denser pacing',()=>{
  for (const l of LEVELS) {
    expect(l.waves.every(w => w.t < l.duration && w.count > 0 && w.delay > 0)).toBe(true);
    expect(new Set(l.waves.map(w => w.enemy)).size).toBeGreaterThanOrEqual(l.stage === 10 ? 4 : 4);
    expect(new Set(l.waves.map(w => w.path)).size).toBeGreaterThanOrEqual(4);
    if (l.objective === 'kills') expect(l.waves.reduce((n,w)=>n+w.count,0)).toBeGreaterThan(l.target);
    if (l.objective === 'generators') expect(l.waves.filter(w=>w.enemy==='generator').length).toBe(l.target);
    if (l.objective === 'mini') expect(l.waves.some(w=>w.enemy==='commander')).toBe(true);
  }
  expect(LEVELS[0].waves.reduce((n,w)=>n+w.count,0)).toBeGreaterThan(80);
  expect(JSON.stringify(LEVELS[0].waves)).not.toBe(JSON.stringify(LEVELS[1].waves));
});

test('live spawn pace is denser, each seed reproducible and retries differ',()=>{
  function sample(seed:number, version:2|3=3){const c={...config(1,seed),version};const s=createSimulation(c);const entries:any[]=[];for(let i=0;i<1800;i++){s.invincible=100;s.cloak=100;step(s,input);if(i%60===0)entries.push(s.enemies.map(e=>[e.kind,e.path,e.x,e.flightSpeed]));}return {spawned:s.spawned,entries};}
  const a=sample(42);expect(a.spawned).toBeGreaterThan(sample(42,2).spawned * 1.5);
  expect(sample(42)).toEqual(a);expect(sample(43).entries).not.toEqual(a.entries);
});

test('dense waves do not stack enemy bodies and use different flight speeds',()=>{
  const s=createSimulation(config(49));const speeds=new Set<number>();let worst=0;
  for(let i=0;i<3600;i++) {s.invincible=100;s.cloak=100;step(s,input);for(const e of s.enemies)speeds.add(e.flightSpeed!);
    for(let a=0;a<s.enemies.length;a++)for(let b=a+1;b<s.enemies.length;b++){const x=s.enemies[a],y=s.enemies[b];if(x.y<0||y.y<0||x.hp<=0||y.hp<=0)continue;worst=Math.max(worst,x.radius+y.radius-Math.hypot(x.x-y.x,x.y-y.y));}}
  expect(speeds.size).toBeGreaterThan(20);expect(worst).toBeLessThan(1);
});

test('crowd spacing survives every planet and several retry seeds',()=>{
  for (let planet=1;planet<=10;planet++) for(const seed of [3,42,9001]) {
    const s=createSimulation(config((planet-1)*10+7,seed));let worst=0;
    for(let i=0;i<3600;i++){s.invincible=100;s.cloak=100;step(s,input);
      for(let a=0;a<s.enemies.length;a++)for(let b=a+1;b<s.enemies.length;b++){const x=s.enemies[a],y=s.enemies[b];if(x.y<0||y.y<0||x.hp<=0||y.hp<=0)continue;worst=Math.max(worst,x.radius+y.radius-Math.hypot(x.x-y.x,x.y-y.y));}}
    expect(worst,`planet ${planet}, seed ${seed}`).toBeLessThan(1);
  }
});

test('no free sky supplies without kills, including purchased repair reserve',()=>{
  const c=config(2);c.boosters=['nano'];const s=createSimulation(c);
  for(let i=0;i<levelFor(2).duration*60;i++){s.invincible=100;s.cloak=100;step(s,input);}
  expect(s.kills).toBe(0);expect(s.pickups).toEqual([]);expect(s.itemsCollected).toBe(0);expect(s.reserveDropped).toBe(false);
});

test('kill drops have a level budget, cooldown and repair reserve requires a kill',()=>{
  const c=config(2);c.boosters=['nano','lucky'];const s=createSimulation(c);const frames:number[]=[];
  for(let i=0;i<levelFor(2).duration*60;i++){s.invincible=100;s.cloak=100;const before=s.supplyDrops;for(const e of s.enemies)e.hp=0;step(s,input);if(s.supplyDrops!==before)frames.push(s.frame);}
  expect(s.supplyDrops).toBeLessThanOrEqual(5);expect(s.reserveDropped).toBe(true);
  for(let i=1;i<frames.length;i++)expect(frames[i]-frames[i-1]).toBeGreaterThanOrEqual(480);
});

test('miniboss survives a bomb, stays until defeated, telegraphs three distinct attacks and enrages',()=>{
  const c={...config(5),mode:'practice' as const,practiceEnemy:'commander' as const,practiceCount:1,practicePath:7};const s=createSimulation(c);step(s,input);
  const e=s.enemies[0];const hp=e.hp;s.slots[0]='bomb';useSlot(s,0);expect(e.hp).toBeGreaterThan(hp*.7);
  const patterns=new Set<number>();const counts=new Set<number>();
  for(let i=0;i<1300;i++){s.invincible=100;s.cloak=100;const previous=e.attackPattern;step(s,input);if(e.tele>s.frame){expect(e.tele-s.frame).toBeLessThanOrEqual(54);patterns.add(e.attackPattern!%3);}if(e.attackPattern!==previous)counts.add(s.bullets.filter(b=>!b.player).length);}
  expect(patterns.size).toBe(3);expect(counts.size).toBeGreaterThan(1);expect(s.enemies.some(v=>v.id===e.id)).toBe(true);
  e.hp=e.maxHp*.4;while(!e.tele){s.invincible=100;s.cloak=100;step(s,input);}while(e.tele){s.invincible=100;s.cloak=100;step(s,input);}expect(e.fire-s.frame).toBe(72);
});

for(const version of [2,3] as const)test(`v${version} replay remains exact and resumes valid configs`,()=>{
  const c={...config(5),version,mode:'practice' as const};expect(validConfig(c)).toBe(true);const s=createSimulation(c);
  for(let i=0;i<1800;i++)step(s,{x:Math.round(90+Math.sin(i/70)*65),y:260,mask:i%400<3?1:0});
  const r=replaySimulation(c,s.replay,s.frame);expect(r.enemies).toEqual(s.enemies);expect(r.pickups).toEqual(s.pickups);expect(resultFor(r)).toEqual(resultFor(s));
  if(version===2){const old=legacy.replaySimulation(c,s.replay,s.frame);expect(r).toEqual(old);}
});

