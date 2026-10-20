import { FLEET, enemyOf, type Seat, type Shot, type State, type ShipType, type Team } from './engine';
/** Bot input deliberately cannot contain any unrevealed hull coordinates. */
export type BotKnowledge = {size: number; target: Team; shots: readonly Shot[]; remaining: ShipType[]};
export function knowledgeFor(state: Pick<State,'size'|'shots'|'mode'>, seat: Seat): BotKnowledge {
  const target=enemyOf(seat),sunk=state.shots.filter(s=>s.target===target&&s.sunk).map(s=>s.sunk!);
  const remaining=(state.mode==='squad'?[...FLEET,...FLEET]:FLEET).map(f=>f.type);
  for(const id of sunk){const type=id.split(':')[1] as ShipType;const idx=remaining.indexOf(type);if(idx>=0)remaining.splice(idx,1);}
  return {size:state.size,target,shots:state.shots.filter(s=>s.target===target).map(s=>({...s})),remaining};
}
export function chooseShot(info: BotKnowledge, difficulty: 'easy'|'normal'='normal', rng=Math.random): {row:number;col:number} {
  const n=info.size,seen=new Map(info.shots.map(s=>[`${s.row},${s.col}`,s]));
  const available=Array.from({length:n*n},(_,i)=>({row:Math.floor(i/n),col:i%n})).filter(c=>!seen.has(`${c.row},${c.col}`));
  if(!available.length)throw new Error('Bot không còn ô để bắn.');
  const hits=info.shots.filter(s=>s.hit);
  // Sunk footprints are public. Adjacent cells remain legal because ships may touch.
  const sunkCells=new Set(info.shots.filter(s=>s.sunk).flatMap(s=>s.revealedCells||[]).map(c=>`${c.row},${c.col}`));
  const liveHits=hits.filter(s=>!sunkCells.has(`${s.row},${s.col}`));
  if(difficulty==='easy'){
    const nearby=available.filter(c=>liveHits.some(h=>Math.abs(h.row-c.row)+Math.abs(h.col-c.col)===1));
    const pool=nearby.length&&rng()>.3?nearby:available;return pool[Math.min(pool.length-1,Math.floor(rng()*pool.length))];
  }
  const scores=new Map(available.map(c=>[`${c.row},${c.col}`,0]));
  for(const type of info.remaining){const len=FLEET.find(f=>f.type===type)!.length;
    for(let row=0;row<n;row++)for(let col=0;col<n;col++)for(const horizontal of [true,false]){
      const cells=Array.from({length:len},(_,i)=>({row:row+(horizontal?0:i),col:col+(horizontal?i:0)}));
      if(cells.some(c=>c.row>=n||c.col>=n||seen.get(`${c.row},${c.col}`)?.hit===false||sunkCells.has(`${c.row},${c.col}`)))continue;
      const found=cells.filter(c=>liveHits.some(h=>h.row===c.row&&h.col===c.col)).length;
      const weight=1+found*100;
      for(const c of cells){const k=`${c.row},${c.col}`;if(scores.has(k))scores.set(k,scores.get(k)!+weight);}
    }
  }
  let best=-Infinity,pool: typeof available=[];
  for(const c of available){const score=scores.get(`${c.row},${c.col}`)!;if(score>best){best=score;pool=[c];}else if(score===best)pool.push(c);}
  return pool[Math.min(pool.length-1,Math.floor(rng()*pool.length))];
}
