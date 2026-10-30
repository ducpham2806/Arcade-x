import {build} from 'esbuild';import fs from 'node:fs';import assert from 'node:assert/strict';
await build({stdin:{contents:`export {bossArtPose} from './src/games/dungeon-tap/components/CombatArt';export {actorFrame} from './src/games/dungeon-tap/components/TitanArt';export {freshState,reduceDungeon} from './src/games/dungeon-tap/engine';`,resolveDir:process.cwd(),loader:'ts'},bundle:true,platform:'node',format:'esm',outfile:'.art-v5-build/art-test.mjs',loader:{'.webp':'dataurl'}});
const {bossArtPose,actorFrame,freshState,reduceDungeon}=await import('../../.art-v5-build/art-test.mjs');
const stages=[10,30,50,70,90,110,140,170];const strikes=[4.5,4.75,4.25,4.75,5,4.75,4,4.5];
for(let i=0;i<stages.length;i++){
 let s=freshState();s.maxStageReached=stages[i];s=reduceDungeon(s,{type:'stage',stage:stages[i]});s.exposed=0;s.parriedCycle=-1;
 for(const [time,pose] of [[1.2,'idle'],[strikes[i]-.5,'windup'],[strikes[i]+.1,'attack'],[strikes[i]+.4,'recovery'],[strikes[i]+1,'exposed']]){s.encounterTime=time;assert.equal(bossArtPose(s),pose,`chapter${i+1} at ${time}`);}
 s.encounterTime=strikes[i]-.2;s.parriedCycle=0;s.exposed=1;assert.equal(bossArtPose(s),'exposed','Parry must expose before attack');
}
assert.equal(actorFrame('defeat',0,true,false),7);assert.equal(actorFrame('attack',0,false,true),2);assert.equal(actorFrame('attack',0,false,false),1);
const manifest=JSON.parse(fs.readFileSync('art/dungeon-titan/source-v5/atlas-manifest.json'));assert.equal(manifest.length,26);assert.equal(manifest.reduce((n,a)=>n+a.cols*a.rows,0),245);assert.ok(manifest.reduce((n,a)=>n+a.bytes,0)<8*1024*1024);
console.log('PASS eight chapter boss windup/strike/recovery/exposed timing, parry override, distinct authored frames, complete 245-cell roster and <8MiB budget.');
