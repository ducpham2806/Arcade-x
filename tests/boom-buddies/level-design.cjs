const fs=require('node:fs');const vm=require('node:vm');const assert=require('node:assert/strict');
const source=fs.readFileSync('src/games/boom-buddies/runtime.js','utf8');
const data=source.match(/  var Hh = .*\n/)[0];
const engine=source.slice(source.indexOf('  var Ke = { up:'),source.indexOf('  // Continuous world coordinates'));
const ctx=vm.createContext({});vm.runInContext(data+`;var oa=Array.from({length:10},()=>({id:'boss',hp_hits:9}));var Ve=Array.from({length:10},()=>({enemies:['enemy_slime','enemy_rat']}));`+engine+';this.api={levels:Hh,create:Gh};',ctx);
let runs=0;
for(const level of ctx.api.levels)for(let seed=1;seed<=100;seed++){
 const run=ctx.api.create(level,seed);const w=level.width,h=level.height;
 const cell=(x,y)=>run.cells[y*w+x];
 for(const xy of run.layout.refuge){const[x,y]=xy.split(',').map(Number);assert.equal(cell(x,y).wall,'none',`${level.id} refuge ${xy}`);assert(!cell(x,y).terrain);}
 const seen=new Set(['1,1']),q=[[1,1]];
 while(q.length){const[x,y]=q.shift();for(const[dx,dy]of[[1,0],[-1,0],[0,1],[0,-1]]){const xx=x+dx,yy=y+dy,key=`${xx},${yy}`;if(xx>0&&xx<w-1&&yy>0&&yy<h-1&&!seen.has(key)&&!['hard','mirror'].includes(cell(xx,yy).wall)){seen.add(key);q.push([xx,yy]);}}}
 assert(seen.has(`${run.gate.x},${run.gate.y}`),`gate ${level.id}`);
 assert([0,2].includes(run.cells.filter(t=>t.terrain==='teleport').length));
 const visits=level.goals.find(g=>g.kind==='visit')?.target||0;assert(run.cells.filter(t=>t.wall==='none'&&t.terrain==='bridge').length>=visits);
 const counts={};for(let i=0;i<run.cells.length;i++){const t=run.cells[i];if(!['none','hard','mirror'].includes(t.wall))counts.wall=(counts.wall||0)+1;if(t.item==='gem')counts.collect=(counts.collect||0)+1;if(t.switch)counts.switch=(counts.switch||0)+1;const kind={cage:'rescue',barrel:'barrel',ice:'ice',machine:'machine'}[t.wall];if(kind)counts[kind]=(counts[kind]||0)+1;if(t.switch||t.item==='gem'||kind)assert(seen.has(`${i%w},${Math.floor(i/w)}`),`objective ${level.id}`);}
 for(const g of level.goals)if(g.kind in counts||['collect','rescue','wall','switch','ice','barrel','machine'].includes(g.kind))assert((counts[g.kind]||0)>=g.target,`quota ${level.id} ${g.kind}: ${counts[g.kind]}/${g.target}`);
 if(level.stage!==8){assert.equal(run.enemies.length,level.enemies,`enemy quota ${level.id}`);assert.equal(new Set(run.enemies.map(e=>`${e.x},${e.y}`)).size,run.enemies.length);for(const e of run.enemies)assert(Math.abs(e.x-1)+Math.abs(e.y-1)>4);}
 else for(let y=1;y<h-1;y++)for(let x=1;x<w-1;x++)if((x<=2||x>=6||y<=2||y>=6)&&!(x===run.gate.x&&y===run.gate.y))assert.equal(cell(x,y).wall,'none');
 assert.equal(JSON.stringify(run.cells),JSON.stringify(ctx.api.create(level,seed).cells));runs++;
}
console.log(`PASS ${runs} campaign layouts: refuge, reachability, objective quotas, enemy counts/spacing, boss perimeter, deterministic seeds`);
