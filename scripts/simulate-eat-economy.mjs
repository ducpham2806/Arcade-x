import {build} from 'esbuild';
import {mkdir,writeFile,rm} from 'node:fs/promises';
import {pathToFileURL} from 'node:url';
import path from 'node:path';
const temporary=path.resolve('.eat-economy-sim.mjs');
await build({entryPoints:['src/games/eat-em-all/economy.ts'],bundle:true,platform:'node',format:'esm',outfile:temporary});
try{
 const {AURAS,clearReward,normalizeEconomy,purchaseAura,starWallet,totalStars}=await import(pathToFileURL(temporary).href);
 const profiles=[{id:'casual',sessions:1,attempts:3,win:.65,one:.22,two:.58},{id:'core',sessions:3,attempts:4,win:.8,one:.1,two:.45},{id:'grinder',sessions:6,attempts:5,win:.9,one:.03,two:.27},{id:'spender',sessions:3,attempts:4,win:.8,one:.1,two:.45}];
 const users=1000,days=90;const result=[];
 const average=a=>Math.round(a.reduce((s,v)=>s+v,0)/a.length*100)/100;
 const percentile=(a,p)=>[...a].sort((x,y)=>x-y)[Math.floor((a.length-1)*p)];
 for(const profile of profiles){const stats=[];
  for(let user=0;user<users;user++){
   let seed=user+777;const random=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296);
   let stars={},economy=normalizeEconomy(null,stars),unlocked=1,clearDay=91,firstAuraDay=91;const timeline={};
   for(let day=1;day<=days;day++){
    for(let attempt=0;attempt<profile.sessions*profile.attempts;attempt++){
     const remaining=Array.from({length:24},(_,i)=>i+1).filter(id=>(stars[id]||0)<3);
     if(!remaining.length)break;
     const level=stars[24]?remaining[Math.floor(random()*remaining.length)]:unlocked;
     if(random()>profile.win)continue;
     const roll=random();const rating=roll<profile.one?1:roll<profile.one+profile.two?2:3;
     const reward=clearReward(level,stars[level]||0,rating,economy);
     stars={...stars,[level]:Math.max(stars[level]||0,rating)};
     economy={...economy,coinsGranted:economy.coinsGranted+reward.coins,xpGranted:economy.xpGranted+reward.xp};
     unlocked=Math.min(24,Math.max(unlocked,level+1));
     if(stars[24]&&clearDay===91)clearDay=day;
     for(const aura of AURAS){if(economy.ownedAuras.includes(aura.id))continue;const bought=purchaseAura(stars,economy,aura.id);if(bought){economy=bought;if(firstAuraDay===91)firstAuraDay=day;}else break;}
    }
    if([7,30,90].includes(day))timeline[day]={wallet:starWallet(stars,economy.ownedAuras),earned:totalStars(stars),spent:AURAS.filter(a=>economy.ownedAuras.includes(a.id)).reduce((s,a)=>s+a.cost,0)};
   }
   if(economy.coinsGranted>3900||economy.xpGranted>2100||totalStars(stars)>72)throw Error('Inflation');
   stats.push({clearDay,firstAuraDay,coins:economy.coinsGranted,xp:economy.xpGranted,auras:economy.ownedAuras.length,timeline});
  }
  result.push({profile:profile.id,parameters:profile,firstAuraDayMedian:percentile(stats.map(s=>s.firstAuraDay),.5),campaignClearDayMedian:percentile(stats.map(s=>s.clearDay),.5),day90MeanCoins:average(stats.map(s=>s.coins)),day90MeanXp:average(stats.map(s=>s.xp)),day90MeanAuras:average(stats.map(s=>s.auras)),cohorts:[7,30,90].map(day=>({day,meanEarned:average(stats.map(s=>s.timeline[day].earned)),meanSpent:average(stats.map(s=>s.timeline[day].spent)),walletMedian:percentile(stats.map(s=>s.timeline[day].wallet),.5),walletP90:percentile(stats.map(s=>s.timeline[day].wallet),.9)}))});
 }
 const report={version:4,days,usersPerProfile:users,totalUsers:users*profiles.length,seed:777,scope:'Campaign reward grants only; excludes generic launcher score rewards and other games. No IAP; spender profile intentionally matches core.',hypothesis:'Synthetic play model, not observed player behavior.',profiles:result};
 await mkdir('docs',{recursive:true});await writeFile('docs/EAT-ECONOMY-SIMULATION.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));
}finally{await rm(temporary,{force:true});}
