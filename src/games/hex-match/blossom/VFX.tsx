import React, { useEffect, useMemo, useRef, useState } from "react";
import { Run, Effect } from "./types";
import { asset, pieceAsset } from "./assets";
import type { TurnFeedback } from "./turnFeedback";

export const FX_COLORS = ["#ff6487", "#ffdc4b", "#c080ff", "#69bdff", "#8de46d", "#ffa457"];
const IMPACT_COLORS: Record<Effect["type"], string> = {
  pop: "#fff0af", bee_h: "#ffe878", bee_v: "#ffe878",
  bloom_bomb: "#ff95ad", sun: "#fff59c", rainbow_orb: "#f3d6ff",
  merge: "#ffe296", portal: "#d9bcff",
};
const boardPoint = (cell: number, columns: number) => ({
  x: (cell % columns) * 100 + 50,
  y: Math.floor(cell / columns) * 100 + 50,
});

function BoardLink({ from, to, columns, kind }: { from: number; to: number; columns: number; kind: 'merge' | 'portal' }) {
  const a = boardPoint(from, columns), b = boardPoint(to, columns);
  const curve = kind === 'portal' ? `Q ${(a.x+b.x)/2+40} ${(a.y+b.y)/2-55} ${b.x} ${b.y}` : `L ${b.x} ${b.y}`;
  const path = `M ${a.x} ${a.y} ${curve}`;
  return <g className={`bb-board-link bb-board-link-${kind}`} data-link={kind} data-from={from} data-to={to}>
    <path d={path} className="bb-link-shadow" />
    <path d={path} pathLength="1" className="bb-link-line" />
    <circle cx={a.x} cy={a.y} r="33" className="bb-link-source" />
    <circle cx={b.x} cy={b.y} r="39" className="bb-link-destination" />
  </g>;
}

function ImpactCells({ effect, columns, delay, origin, reduced }: {
  effect: Effect; columns: number; delay: number; origin?: number; reduced: boolean;
}) {
  const start = boardPoint(origin ?? effect.cell, columns);
  const cells = [...new Set(effect.cells ?? [effect.cell])];
  const strength = effect.type === 'pop' ? 'petal' : 'special';
  return <g className={`bb-impact-cells bb-impact-${strength}`}>
    {cells.map(cell => {
      const { x, y } = boardPoint(cell, columns);
      const travel = reduced ? 0 : Math.min(180, (Math.abs(start.x-x) + Math.abs(start.y-y)) * .24);
      const color = effect.type === 'pop' ? FX_COLORS[effect.color ?? 0] : IMPACT_COLORS[effect.type];
      return <rect key={cell} data-impact-cell={cell} className="bb-impact-cell" x={x-44} y={y-44}
        width="88" height="88" rx="16" style={{ color, animationDelay: `${delay + travel}ms` }} />;
    })}
  </g>;
}
export function effectTimeline(effects: Effect[], reduced = false) {
  let chain = 0;
  const main = effects.map(e => {
    const delay = e.bonusIndex ? 0 : e.type === "pop" || e.type === "portal" ? 0 : chain++ * 180;
    const duration = e.type === "rainbow_orb" ? 1100 : e.type === "sun" ? 900 : e.type === "pop" ? 500 : 750;
    return { effect: e, delay, duration };
  });
  const mainEnd = Math.max(650, ...main.filter(x=>!x.effect.bonusIndex).map(x=>x.delay+x.duration));
  return main.map(x => ({ ...x, delay: reduced ? 0 : x.effect.bonusIndex ? mainEnd + 250 + (x.effect.bonusIndex-1)*350 : x.delay, duration: reduced ? 180 : x.duration }));
}
export function effectDuration(run: Run, reduced = false) {
  return Math.max(reduced ? 650 : 750, ...effectTimeline(run.effects, reduced).map(x=>x.delay+x.duration));
}
function EffectBatch({ run, feedback, reduced, onComplete }: { run: Run; feedback?: TurnFeedback | null; reduced: boolean; onComplete?: () => void }) {
  const root = useRef<HTMLDivElement>(null), done = useRef(onComplete);
  done.current = onComplete;
  const stamp = `${run.id}:${run.log.length}`;
  const timeline = useMemo(()=>effectTimeline(run.effects,reduced),[stamp,reduced]);
  useEffect(() => {
    let live = true, timer: number;
    const duration=effectDuration(run,reduced);
    // Wait for actual CSS animations, including their staggered starts; minimum covers tile falling.
    const frame=requestAnimationFrame(()=> {
      const animations=root.current?.getAnimations({subtree:true}) || [];
      void Promise.allSettled([
        ...animations.map(a=>a.finished),
        new Promise(resolve=>{ timer = window.setTimeout(resolve,duration+40); }),
      ]).then(()=>{ if(live) done.current?.(); });
    });
    return ()=>{live=false;cancelAnimationFrame(frame);window.clearTimeout(timer);};
  },[stamp,reduced]);
  const w=run.level.cols, h=run.level.rows;
  const action = run.log.at(-1)?.action;
  const portal = run.portalMoves?.[0];
  return <div ref={root} className="bb-vfx-layer bb-sprite-fx" aria-hidden="true" key={stamp}>
    <svg viewBox={`0 0 ${w*100} ${h*100}`} preserveAspectRatio="none">
      {portal && <BoardLink from={portal.from} to={portal.to} columns={w} kind="portal" />}
      {timeline.map(({effect:e,delay,duration},k)=> {
        const { x, y } = boardPoint(e.cell, w);
        const cells=e.cells || [e.cell], targets=e.targets || [{cell:e.cell,color:e.color??0}];
        const local=(ms:number)=>reduced?0:ms;
        const isPair = e.type === 'merge' && !e.bonusIndex && action?.type === 'merge' && action.cell === e.cell;
        const stride = Math.ceil(targets.length / 16) || 1;
        const style={'--fx-delay':`${delay}ms`,'--fx-duration':`${duration}ms`} as React.CSSProperties;
        const sprite=(name:string,cx:number,cy:number,size:number,start=0,frames=10,cell=256)=>
          <Sheet key={`${name}:${cx}:${cy}:${start}`} name={name} x={cx} y={cy} size={size} delay={delay+local(start)} frames={frames} cell={cell} reduced={reduced}/>;
        const burst=(i:number,c:number,start:number,size=115)=>sprite(`blast_${COLOR_NAMES[c]||'yellow'}`,(i%w)*100+50,Math.floor(i/w)*100+50,size,start,7,192);
        const beam=(axis:'h'|'v',line:number,start=80)=> {
          const horizontal=axis==='h',length=(horizontal?w:h)*100;
          return <g key={`${axis}:${line}`} data-beam-axis={axis} data-beam-line={line} transform={horizontal?`translate(0 ${line*100+50})`:`translate(${line*100+50} 0) rotate(90)`}>
            <g className="bb-sprite-beam" style={{'--beam-origin':`${horizontal?x:y}px 0px`,'--beam-delay':`${delay+local(start)}ms`,'--beam-duration':`${reduced?180:560}ms`} as React.CSSProperties}>
              <path className="bb-beam-guide" d={`M 0 0 H ${length}`} />
              <image href={asset('png/vfx_fx/vfx_beam_gold.png')} x="0" y="-15" width={length} height="30" preserveAspectRatio="none" opacity=".65"/>
              <image href={asset('png/vfx_fx/vfx_petal_sweep_v8.png')} x="0" y="-45" width={length} height="90" preserveAspectRatio="none"/>
            </g>
          </g>;
        };
        const rows=Array.from({length:h},(_,r)=>r).filter(r=>Array.from({length:w},(_,c)=>r*w+c).every(i=>cells.includes(i)));
        const cols=Array.from({length:w},(_,c)=>c).filter(c=>Array.from({length:h},(_,r)=>r*w+c).every(i=>cells.includes(i)));
        return <g key={k} className={`bb-sprite-event fx-${e.type}`} data-effect={e.type} data-color={e.color} data-bonus={e.bonusIndex} style={style}>
          <ImpactCells effect={e} columns={w} delay={delay} reduced={reduced}
            origin={e.type === 'pop' && action?.type === 'tap' ? action.cell : undefined} />
          {e.type==='pop' ? <>
            {burst(e.cell,e.color??0,0,128)}
            {action?.type === 'tap' && action.cell === e.cell && <Petals x={x} y={y} color={e.color??0} delay={delay} reduced={reduced}/>}
          </> : e.type==='rainbow_orb' ? <>
            {sprite('rainbow_burst',x,y,170,0)}
            {targets.filter(t=>t.cell!==e.cell).map((t,n)=> {
              const tx=(t.cell%w)*100+50,ty=Math.floor(t.cell/w)*100+50;
              const hit=300+Math.min(220,n*12);
              return <g key={t.cell} data-target-cell={t.cell}>
                {n % stride === 0 && !reduced && <>
                  <path className="bb-rainbow-thread" d={`M ${x} ${y} Q ${(x+tx)/2+30} ${y-60} ${tx} ${ty}`} stroke={FX_COLORS[t.color]} pathLength="1" style={{'--link-delay':`${delay+120+Math.min(200,n*8)}ms`,'--link-duration':'400ms'} as React.CSSProperties}/>
                  <image className="bb-rainbow-flower" href={pieceAsset({id:0,color:t.color},run.level.chapter)} x={tx-34} y={ty-34} width="68" height="68" style={{'--target-delay':`${delay}ms`,'--target-duration':`${hit+200}ms`,'--target-color':FX_COLORS[t.color]} as React.CSSProperties}/>
                  {sprite('rainbow_burst',tx,ty,108,hit)}
                  {burst(t.cell,t.color,hit+80,92)}
                </>}
              </g>;
            })}
          </> : e.type==='sun' || e.type.startsWith('bee') ? <>
            <g className="bb-sun-rays">{rows.map(r=>beam('h',r))}{cols.map(c=>beam('v',c))}</g>
            {sprite(e.type==='sun'?'sun_burst':'chain_spark',x,y,e.type==='sun'?210:150,0,e.type==='sun'?10:6,e.type==='sun'?256:128)}
            {targets.map((t,n)=><g key={t.cell} data-target-cell={t.cell}>{n % stride === 0 && !reduced && burst(t.cell,t.color,120+Math.min(300,Math.hypot(t.cell%w-e.cell%w,Math.floor(t.cell/w)-Math.floor(e.cell/w))*35),105)}</g>)}
          </> : e.type==='bloom_bomb' ? <>
            {sprite('bloom_bomb',x,y,Math.min(540,Math.max(280,Math.sqrt(cells.length)*100)),0)}
            {targets.map((t,n)=><g key={t.cell} data-target-cell={t.cell}>{n % stride === 0 && !reduced && burst(t.cell,t.color,90+Math.min(240,Math.hypot(t.cell%w-e.cell%w,Math.floor(t.cell/w)-Math.floor(e.cell/w))*40),108)}</g>)}
            <Petals x={x} y={y} color={0} delay={delay+local(80)} reduced={reduced} large/>
          </> : e.type === 'portal' ? (
            <GardenSheet name="portal" x={x} y={y} size={188} delay={delay+local(e.cell === run.portals[0] ? 0 : 80)} reduced={reduced} />
          ) : <>
            {isPair && <BoardLink from={action.other} to={e.cell} columns={w} kind="merge" />}
            {sprite('special_merge',x,y,isPair?180:145,0,8,256)}
            <GardenSheet name="merge-ring" x={x} y={y} size={isPair?220:170} delay={delay+local(85)} reduced={reduced} />
          </>}
        </g>;
      })}
      {feedback?.spawnedSpecials.map(cell => {
        const { x, y } = boardPoint(cell, w);
        return <g key={cell} data-spawned-special={cell}>
          <circle className="bb-special-crown" cx={x} cy={y} r="43" />
          <GardenSheet name="bloom" x={x} y={y-16} size={190} delay={reduced?0:200} reduced={reduced} />
        </g>;
      })}
    </svg>
  </div>;
}
const COLOR_NAMES=['red','yellow','purple','blue','green','orange'];
function Sheet({name,x,y,size,delay,frames,cell,reduced,path,duration=frames/30*1000,still=Math.floor((frames-1)/2)}:{name:string;x:number;y:number;size:number;delay:number;frames:number;cell:number;reduced:boolean;path?:string;duration?:number;still?:number}) {
 return <svg data-sprite={name} x={x-size/2} y={y-size/2} width={size} height={size} viewBox={`0 0 ${cell} ${cell}`} overflow="hidden" className="bb-fx-sheet" style={{'--sheet-delay':`${delay}ms`,'--sheet-duration':`${duration}ms`,'--sheet-steps':frames,'--sheet-end':`${-frames*cell}px`} as React.CSSProperties}>
   <image href={asset(path ?? `png/anim/anim_fx_${name}.png`)} width={frames*cell} height={cell} className="bb-fx-strip" style={reduced?{transform:`translateX(${-still*cell}px)`}:undefined}/>
 </svg>;
}
const GARDEN_SHEETS = {
  bloom: { path: 'vfx/bloom.webp', duration: 600, still: 6 },
  'merge-ring': { path: 'vfx/merge-ring.webp', duration: 490, still: 4 },
  portal: { path: 'vfx/portal.webp', duration: 550, still: 6 },
};
function GardenSheet({name,...position}: {name:keyof typeof GARDEN_SHEETS;x:number;y:number;size:number;delay:number;reduced:boolean}) {
 return <Sheet {...position} name={name} frames={16} cell={128} {...GARDEN_SHEETS[name]} />;
}
function Petals({x,y,color,delay,reduced,large=false}:{x:number;y:number;color:number;delay:number;reduced:boolean;large?:boolean}) {
 const shapes=['heart','star','flower','drop','leaf','orange'];
 return <g>{Array.from({length:reduced?0:6},(_,i)=> {
  const angle=i*Math.PI/3+.3,reach=large?160:65;
  return <image key={i} href={asset(`png/vfx/vfx_petal_${shapes[color]||'flower'}.png`)} x={x-9} y={y-9} width={large?27:18} height={large?27:18} className="bb-flying-petal" style={{'--petal-delay':`${delay}ms`,'--petal-x':`${Math.cos(angle)*reach}px`,'--petal-y':`${Math.sin(angle)*reach+35}px`,'--petal-angle':`${i*67}deg`,'transformOrigin':`${x}px ${y}px`} as React.CSSProperties}/>;
 })}</g>;
}

// Preserve overlapping moves so the final result waits for every outstanding batch.
export function BlossomVFX({ run, feedback, reduced, onComplete }: { run: Run; feedback?: TurnFeedback | null; reduced: boolean; onComplete?: () => void }) {
  const stamp = `${run.id}:${run.log.length}`;
  const [batches, setBatches] = useState([{ stamp, run, feedback }]);
  const latest = useRef(stamp), done = useRef(onComplete);
  latest.current = stamp; done.current = onComplete;
  useEffect(() => {
    setBatches(old => [...old.filter(batch => batch.stamp !== stamp), { stamp, run, feedback }]);
  }, [stamp]);
  const pending = useRef(new Set<string>());
  const registered = useRef<string | undefined>(undefined);
  if (registered.current !== stamp) { pending.current.add(stamp); registered.current = stamp; }
  function complete(id: string) {
    pending.current.delete(id);
    setBatches(old => old.filter(batch => batch.stamp !== id));
    if (!pending.current.has(latest.current) && pending.current.size === 0) done.current?.();
  }
  return <>{batches.map(batch => <EffectBatch key={batch.stamp} run={batch.run} feedback={batch.feedback} reduced={reduced} onComplete={() => complete(batch.stamp)} />)}</>;
}
