import React from 'react';
/** A single sweep owns its ping, so sound and the visible antenna never drift apart. */
export function Radar({coordinate,paused=false,reduced=false,onSweep}:{coordinate:string;paused?:boolean;reduced?:boolean;onSweep:()=>void}){
 return <div className="bs-coordinate bs-radar" data-paused={paused?'true':'false'} data-reduced={reduced?'true':'false'} aria-label={`Radar tìm kiếm · ${coordinate}`}>
  <svg className="bs-radar-grid" viewBox="0 0 240 112" aria-hidden="true"><g fill="none" stroke="currentColor" strokeWidth=".7"><circle cx="120" cy="56" r="20"/><circle cx="120" cy="56" r="39"/><circle cx="120" cy="56" r="55"/><path d="M0 56h240M120 0v112M80 16l80 80M160 16 80 96"/></g></svg>
  <i className="bs-radar-sweep" aria-hidden="true" onAnimationIteration={e=>{if(e.animationName==='bs-radar-turn'&&!paused)onSweep();}}/>
  <span className="bs-radar-coordinate">{coordinate}</span>
  <small className="bs-radar-label">{paused?'TẠM DỪNG':'QUÉT MỤC TIÊU'}</small>
 </div>;
}
