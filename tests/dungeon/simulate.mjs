import {build} from 'esbuild';
import fs from 'node:fs';
await build({entryPoints:['src/games/dungeon-tap/engine.ts','src/games/dungeon-tap/director.ts','src/games/dungeon-tap/utils/upgradeMath.ts'],bundle:true,platform:'node',format:'esm',outdir:'/tmp/dungeon-sim'});
const {freshState,reduceDungeon:r,statsFor,markCost}=await import('/tmp/dungeon-sim/engine.js');
const {bossPhase,runeCost}=await import('/tmp/dungeon-sim/director.js');
const {calculateHeroUpgradeCost,calculateMaxHeroLevels,calculateAllyUpgradeCost}=await import('/tmp/dungeon-sim/utils/upgradeMath.js');
const configs=[{id:'Casual',minutes:5,taps:1,parry:false},{id:'Core',minutes:15,taps:4,parry:true},{id:'Grinder',minutes:30,taps:8,parry:true},{id:'Spender (no paid power)',minutes:15,taps:4,parry:true}];
const results=[];
for(const [profile,config] of configs.entries()){
 let s=freshState(profile===3?902:900+profile),tapBudget=0;const rows=[];let firstBoss=null;
 for(let day=1;day<=90;day++){
  const beforeGold=s.gold,beforeEarn=s.earned,beforeSpend=s.spent,startStage=s.stage;
  for(let frame=0;frame<config.minutes*60*8;frame++){
   s=r(s,{type:'tick',dt:.125});tapBudget+=config.taps*.125;
   while(tapBudget>=1){s=r({...s,elapsed:s.elapsed+.001},{type:'tap'});tapBudget--;}
   if(config.parry&&s.monster.isBoss){const phase=bossPhase(s.encounterTime,1,s.stage);if(phase.canParry)s=r(s,{type:'parry'});}
   // Deterministic bot invests every 2s; its policy is a hypothesis, not a player forecast.
   if(frame%16===0){
    s=r(s,{type:'best'});s=r(s,{type:'best',ally:true});
    const budget=s.gold*.65,max=calculateMaxHeroLevels(s.heroLevel,budget);if(max.count>0)s=r(s,{type:'hero',count:Math.min(10,max.count)});
    const ally=s.allies.filter(a=>a.level<1000).map(a=>({a,cost:a.unlocked?calculateAllyUpgradeCost(a.baseCost,a.level,1):a.upgradeCost})).sort((a,b)=>a.cost-b.cost)[0];
    if(ally&&ally.cost<s.gold*.5)s=r(s,{type:'ally',id:ally.a.id,count:1});
    for(const k of s.skills)if(k.level<10&&k.upgradeCost<s.gold*.1)s=r(s,{type:'skill',id:k.id,count:1});
    for(const it of Object.values(s.equipped))if(it&&it.level<20&&it.upgradeCost<s.gold*.15)s=r(s,{type:'upgradeItem',id:it.id,count:1});
    for(const branch of ['blade','legion','fortune'])if(s.runeRanks[branch]<10&&s.runes>=runeCost(s.runeRanks[branch]))s=r(s,{type:'rune',branch});
   }
   // Use burst skills on boss/elite, buffs otherwise. Reserve enough mana to preserve pacing.
   if(frame%8===0)for(const k of s.skills)if(s.heroLevel>=k.unlockLevel&&k.currentCooldown<=0&&s.mana>=k.manaCost&&(s.monster.isBoss||k.duration>0))s=r(s,{type:'cast',id:k.id});
   if(s.farming&&frame%40===0)s=r(s,{type:'boss'});
   if(s.maxStageReached>=200&&markCost(s)<s.gold*.35)s=r(s,{type:'mark'});
   if(s.inventory.length>60)s=r(s,{type:'sellAll'});
   if(s.allyInventory.length>60)s=r(s,{type:'sellAll',ally:true});
   if(firstBoss===null&&s.bossesSlain>0)firstBoss={day,activeSeconds:s.elapsed};
   if(!Number.isFinite(s.gold)||s.gold<0||!Number.isFinite(statsFor(s).tap))throw Error('invalid economy');
  }
  const earned=s.earned-beforeEarn,spent=s.spent-beforeSpend;
  rows.push({day,stage:s.stage,maxStage:s.maxStageReached,heroLevel:s.heroLevel,legacyMarks:s.legacyMarks,earned,spent,balance:s.gold,flowRatio:spent?earned/spent:null,reconciles:Math.abs((beforeGold+earned-spent)-s.gold)/Math.max(1,s.gold)<1e-8});
 }
 const result={profile:config,firstBoss,day30:rows[29],day90:rows[89],allReconciled:rows.every(r=>r.reconciles),rows};results.push(result);console.log(config.id,JSON.stringify({firstBoss,day30:result.day30,day90:result.day90,allReconciled:result.allReconciled}));
}
fs.writeFileSync('docs/dungeon-titan/economy-90-days.json',JSON.stringify({version:3,days:90,status:'PLACEHOLDER simulation; no human playtest or monetization',results},null,2));
