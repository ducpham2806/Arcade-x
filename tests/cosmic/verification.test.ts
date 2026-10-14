import {test, expect} from '@playwright/test';
import {createSimulation, step, encodeReplay, resultFor, EMPTY_UPGRADES} from '../../src/games/cosmic-defense/engine';
import {verifyReplay} from '../../supabase/functions/cosmic-verify/verify';
import type {RunConfig} from '../../src/games/cosmic-defense/types';

const now = Date.parse('2026-10-14T00:00:00Z');
for (const version of [2, 3] as const) {
  test(`server verifies completed v${version} run with identical score`, () => {
    const config: RunConfig = {version, level:91, seed:42, mode:'endless', upgrades:{...EMPTY_UPGRADES}, integrity:100, boosters:[], mutators:[]};
    const sim = createSimulation(config);
    for(let i=0;i<36000 && sim.status==='playing';i++) step(sim,{x:90,y:268,mask:0});
    expect(['won','lost']).toContain(sim.status);
    const ticket = {pack_version:version,config,started_at:new Date(now-601000).toISOString()};
    const replay = encodeReplay(sim.replay);
    expect(verifyReplay(ticket,replay,sim.frame,now).result).toEqual(resultFor(sim));
    expect(()=>verifyReplay({...ticket,pack_version:version===2?3:2},replay,sim.frame,now)).toThrow('version');
    expect(()=>verifyReplay({...ticket,started_at:new Date(now-86400001).toISOString()},replay,sim.frame,now)).toThrow('expired');
    expect(()=>verifyReplay({...ticket,started_at:new Date(now).toISOString()},replay,sim.frame,now)).toThrow('time');
    expect(()=>verifyReplay(ticket,replay,sim.frame+1,now)).toThrow('Incomplete');
  });
}
test('server rejects malformed, incomplete and oversized submissions',()=>{
  const config:RunConfig={version:3,level:1,seed:1,mode:'daily',upgrades:{...EMPTY_UPGRADES},integrity:100,boosters:[],mutators:[]};
  const ticket={pack_version:3,config,started_at:new Date(now-601000).toISOString()};
  for(const frames of [0,-1,1.5,36001,NaN,'100']) expect(()=>verifyReplay(ticket,'',frames,now)).toThrow();
  expect(()=>verifyReplay(ticket,'A'.repeat(100001),100,now)).toThrow('size');
  expect(()=>verifyReplay(ticket,{},100,now)).toThrow('size');
  expect(()=>verifyReplay(ticket,encodeReplay([]),1,now)).toThrow('Incomplete');
  expect(()=>verifyReplay({...ticket,pack_version:4},'',1,now)).toThrow('version');
});
