import assert from 'node:assert/strict';
import { CAMPAIGN_STAGES, CHAPTERS } from '../../src/games/eat-em-all/campaign';
import { bossPhase, planDrop, quotaProgress, stageComplete } from '../../src/games/eat-em-all/encounters';
import type { ItemType } from '../../src/games/eat-em-all/types';

assert.equal(CAMPAIGN_STAGES.length,24);
assert.equal(CHAPTERS.length,4);
for(const s of CAMPAIGN_STAGES) {
  assert.equal(s.id,CAMPAIGN_STAGES.indexOf(s)+1);
  assert.equal(s.targetCount,Object.values(s.targetItems).reduce((a,b)=>a+(b||0),0));
  assert.ok(s.story&&s.resolution&&s.timeLimit);
  assert.ok(s.fallSpeedMultiplier<=1.65);
  assert.equal(stageComplete(s,{},0),false);
  // Overcollecting one food must never satisfy another food's quota.
  const onlyOne={ [Object.keys(s.targetItems)[0]]:999 };
  assert.equal(stageComplete(s,onlyOne,999),false);
  assert.equal(quotaProgress(s,s.targetItems),s.targetCount);
  assert.equal(stageComplete(s,s.targetItems,s.bossHits||0),true);
  if(s.objective==='boss')assert.equal(stageComplete(s,s.targetItems,0),false);
  // A reference collector catches every edible drop. Include flight time and boss
  // shield transitions; this proves resource/time feasibility, not human balance.
  for(const frameRate of [30,60,120]) {
    let now=0,seq=0,hits=0;const counts:Partial<Record<ItemType,number>>={};
    let nextSpawn=.65;
    const falling:{at:number;type:ItemType}[]=[];
    while(now<s.timeLimit&&!stageComplete(s,counts,hits)) {
      now+=1/frameRate;
      if(now>=nextSpawn){
        const p=planDrop(s,seq++,counts,now);
        assert.ok(p.lane>=0&&p.lane<=4);
        assert.ok(Math.abs(p.drift)<=.75);
        if(s.bombChance+s.poisonChance===0)assert.ok(!['bomb','poison'].includes(p.type));
        falling.push({at:now+p.warningSeconds+p.flightSeconds,type:p.type});
        nextSpawn=now+p.intervalMs/1000;
      }
      for(let i=falling.length-1;i>=0;i--){
        const item=falling[i];if(item.at>now)continue;falling.splice(i,1);
        if(['bomb','poison'].includes(item.type)||item.type.startsWith('power_'))continue;
        counts[item.type]=(counts[item.type]||0)+1;
        const phase=bossPhase(now,s.chapter);
        if(s.objective==='boss'&&phase.vulnerable&&item.type===phase.element)hits++;
      }
    }
    assert.ok(stageComplete(s,counts,hits),`Stage ${s.id} resource starvation at ${frameRate}fps`);
    assert.ok(now<s.timeLimit*.8,`Stage ${s.id} lacks retry margin: ${now}s`);
  }
}
assert.equal(bossPhase(2.99).vulnerable,false);
assert.equal(bossPhase(3).vulnerable,true);
assert.equal(bossPhase(10).element,'fire');
assert.equal(bossPhase(20).element,'ice');
const signatures=CAMPAIGN_STAGES.filter(s=>s.objective!=='boss').map(s=>Array.from({length:12},(_,i)=>planDrop(s,i,{},i).lane).join(','));
assert.ok(new Set(signatures).size>=5);
console.log('PASS: 24 levels × 3 frame rates; quotas, boss phases, resource reachability, tutorial safety, six patterns.');
