import React, { useEffect, useMemo, useRef, useState } from "react";
import { Run, Effect } from "./types";
import { asset, pieceAsset } from "./assets";
export const FX_COLORS = ["#ff6487", "#ffdc4b", "#c080ff", "#69bdff", "#8de46d", "#ffa457"];
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
  return Math.max(reduced ? 200 : 750, ...effectTimeline(run.effects, reduced).map(x=>x.delay+x.duration));
}
function EffectBatch({ run, reduced, onComplete }: { run: Run; reduced: boolean; onComplete?: () => void }) {
  const root = useRef<HTMLDivElement>(null), done = useRef(onComplete);
  done.current = onComplete;
  const stamp = `${run.id}:${run.log.length}`;
  const timeline = useMemo(()=>effectTimeline(run.effects,reduced),[stamp,reduced]);
  useEffect(() => {
    let live = true, frame: number;
    const duration=effectDuration(run,reduced);
    // Wait for actual CSS animations, including their staggered starts; minimum covers tile falling.
    frame=requestAnimationFrame(()=> {
      const animations=root.current?.getAnimations({subtree:true}) || [];
      void Promise.allSettled([
        ...animations.map(a=>a.finished),
        new Promise(resolve=>setTimeout(resolve,duration+40)),
      ]).then(()=>{ if(live) done.current?.(); });
    });
    return ()=>{live=false;cancelAnimationFrame(frame);};
  },[stamp,reduced]);
  const w=run.level.cols, h=run.level.rows;
  return <div ref={root} className="bb-vfx-layer bb-sprite-fx" aria-hidden="true" key={stamp}>
    <svg viewBox={`0 0 ${w*100} ${h*100}`} preserveAspectRatio="none">
      {timeline.map(({effect:e,delay,duration},k)=> {
        const x=(e.cell%w)*100+50, y=Math.floor(e.cell/w)*100+50;
        const cells=e.cells || [e.cell], targets=e.targets || [{cell:e.cell,color:e.color??0}];
        const local=(ms:number)=>reduced?0:ms;
        const style={'--fx-delay':`${delay}ms`,'--fx-duration':`${duration}ms`} as React.CSSProperties;
        const sprite=(name:string,cx:number,cy:number,size:number,start=0,frames=10,cell=256)=>
          <Sheet key={`${name}:${cx}:${cy}:${start}`} name={name} x={cx} y={cy} size={size} delay={delay+local(start)} frames={frames} cell={cell} reduced={reduced}/>;
        const burst=(i:number,c:number,start:number,size=115)=>sprite(`blast_${COLOR_NAMES[c]||'yellow'}`,(i%w)*100+50,Math.floor(i/w)*100+50,size,start,7,192);
        const beam=(axis:'h'|'v',line:number,start=80)=> {
          const horizontal=axis==='h',length=(horizontal?w:h)*100;
          return <g key={`${axis}:${line}`} data-beam-axis={axis} data-beam-line={line} transform={horizontal?`translate(0 ${line*100+50})`:`translate(${line*100+50} 0) rotate(90)`}>
            <g className="bb-sprite-beam" style={{'--beam-origin':`${horizontal?x:y}px 0px`,'--beam-delay':`${delay+local(start)}ms`,'--beam-duration':`${reduced?180:560}ms`} as React.CSSProperties}>
              <image href={asset('png/vfx_fx/vfx_beam_gold.png')} x="0" y="-15" width={length} height="30" preserveAspectRatio="none" opacity=".65"/>
              <image href={asset('png/vfx_fx/vfx_petal_sweep_v8.png')} x="0" y="-45" width={length} height="90" preserveAspectRatio="none"/>
            </g>
          </g>;
        };
        const rows=Array.from({length:h},(_,r)=>r).filter(r=>Array.from({length:w},(_,c)=>r*w+c).every(i=>cells.includes(i)));
        const cols=Array.from({length:w},(_,c)=>c).filter(c=>Array.from({length:h},(_,r)=>r*w+c).every(i=>cells.includes(i)));
        return <g key={k} className={`bb-sprite-event fx-${e.type}`} data-effect={e.type} data-color={e.color} data-bonus={e.bonusIndex} style={style}>
          {e.type==='pop' ? <>
            {burst(e.cell,e.color??0,0,145)}
            <Petals x={x} y={y} color={e.color??0} delay={delay} reduced={reduced}/>
          </> : e.type==='rainbow_orb' ? <>
            {sprite('rainbow_burst',x,y,170,0)}
            {targets.filter(t=>t.cell!==e.cell).map((t,n)=> {
              const tx=(t.cell%w)*100+50,ty=Math.floor(t.cell/w)*100+50;
              const hit=300+Math.min(220,n*12);
              return <g key={t.cell} data-target-cell={t.cell}>
                <path className="bb-rainbow-thread" d={`M ${x} ${y} Q ${(x+tx)/2+30} ${y-60} ${tx} ${ty}`} stroke={FX_COLORS[t.color]} pathLength="1" style={{'--link-delay':`${delay+local(120+n*8)}ms`,'--link-duration':`${reduced?120:400}ms`} as React.CSSProperties}/>
                <image className="bb-rainbow-flower" href={pieceAsset({id:0,color:t.color},run.level.chapter)} x={tx-34} y={ty-34} width="68" height="68" style={{'--target-delay':`${delay}ms`,'--target-duration':`${reduced?180:hit+200}ms`,'--target-color':FX_COLORS[t.color]} as React.CSSProperties}/>
                {sprite('rainbow_burst',tx,ty,120,hit)}
                {burst(t.cell,t.color,hit+80,100)}
              </g>;
            })}
          </> : e.type==='sun' || e.type.startsWith('bee') ? <>
            <g className="bb-sun-rays">{rows.map(r=>beam('h',r))}{cols.map(c=>beam('v',c))}</g>
            {sprite(e.type==='sun'?'sun_burst':'chain_spark',x,y,e.type==='sun'?210:150,0,e.type==='sun'?10:6,e.type==='sun'?256:128)}
            {targets.map(t=><g key={t.cell} data-target-cell={t.cell}>{burst(t.cell,t.color,120+Math.min(300,Math.hypot(t.cell%w-e.cell%w,Math.floor(t.cell/w)-Math.floor(e.cell/w))*35),105)}</g>)}
          </> : e.type==='bloom_bomb' ? <>
            {sprite('bloom_bomb',x,y,Math.min(540,Math.max(280,Math.sqrt(cells.length)*100)),0)}
            {targets.map(t=><g key={t.cell} data-target-cell={t.cell}>{burst(t.cell,t.color,90+Math.min(240,Math.hypot(t.cell%w-e.cell%w,Math.floor(t.cell/w)-Math.floor(e.cell/w))*40),120)}</g>)}
            <Petals x={x} y={y} color={0} delay={delay+local(80)} reduced={reduced} large/>
          </> : sprite(e.type==='merge'?'special_merge':'chain_spark',x,y,e.type==='merge'?210:110,0,e.type==='merge'?8:6,e.type==='merge'?256:128)}
        </g>;
      })}
    </svg>
  </div>;
}
const COLOR_NAMES=['red','yellow','purple','blue','green','orange'];
function Sheet({name,x,y,size,delay,frames,cell,reduced}:{name:string;x:number;y:number;size:number;delay:number;frames:number;cell:number;reduced:boolean}) {
 return <svg data-sprite={name} x={x-size/2} y={y-size/2} width={size} height={size} viewBox={`0 0 ${cell} ${cell}`} overflow="hidden" className="bb-fx-sheet" style={{'--sheet-delay':`${delay}ms`,'--sheet-duration':`${reduced?150:frames/30*1000}ms`,'--sheet-steps':frames-1,'--sheet-end':`${-(frames-1)*cell}px`} as React.CSSProperties}>
   <image href={asset(`png/anim/anim_fx_${name}.png`)} width={frames*cell} height={cell} className="bb-fx-strip"/>
 </svg>;
}
function Petals({x,y,color,delay,reduced,large=false}:{x:number;y:number;color:number;delay:number;reduced:boolean;large?:boolean}) {
 const shapes=['heart','star','flower','drop','leaf','orange'];
 return <g>{Array.from({length:reduced?0:6},(_,i)=> {
  const angle=i*Math.PI/3+.3,reach=large?160:65;
  return <image key={i} href={asset(`png/vfx/vfx_petal_${shapes[color]||'flower'}.png`)} x={x-9} y={y-9} width={large?27:18} height={large?27:18} className="bb-flying-petal" style={{'--petal-delay':`${delay}ms`,'--petal-x':`${Math.cos(angle)*reach}px`,'--petal-y':`${Math.sin(angle)*reach+35}px`,'--petal-angle':`${i*67}deg`,'transformOrigin':`${x}px ${y}px`} as React.CSSProperties}/>;
 })}</g>;
}

// Preserve overlapping moves so the final result waits for every outstanding batch.
export function BlossomVFX({ run, reduced, onComplete }: { run: Run; reduced: boolean; onComplete?: () => void }) {
  const stamp = `${run.id}:${run.log.length}`;
  const [batches, setBatches] = useState<Run[]>([run]);
  const latest = useRef(stamp), done = useRef(onComplete);
  latest.current = stamp; done.current = onComplete;
  useEffect(() => {
    setBatches(old => [...old.filter(r => r.id === run.id && `${r.id}:${r.log.length}` !== stamp), run]);
  }, [stamp]);
  const pending = useRef(new Set<string>());
  const registered = useRef<string | undefined>(undefined);
  if (registered.current !== stamp) { pending.current.add(stamp); registered.current = stamp; }
  function complete(batch: Run) {
    const id = `${batch.id}:${batch.log.length}`;
    pending.current.delete(id);
    setBatches(old => old.filter(r => `${r.id}:${r.log.length}` !== id));
    if (!pending.current.has(latest.current) && pending.current.size === 0) done.current?.();
  }
  return <>{batches.map(batch => <EffectBatch key={`${batch.id}:${batch.log.length}`} run={batch} reduced={reduced} onComplete={() => complete(batch)} />)}</>;
}
