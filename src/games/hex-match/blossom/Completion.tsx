import React, { useEffect, useRef, useState } from "react";
import { Localized } from "./i18n";
import { Run } from "./types";
import { key } from "./engine";
import { GOAL_LABELS } from "./levels";
import { asset, pieceAsset } from "./assets";
export function Completion({run,reduced,language="vi",stars,reward,nextLabel,onDone,onMap}: {
  run:Run; reduced:boolean; language?:"vi"|"en"; stars:number; reward:number; nextLabel:string; onDone:()=>void; onMap:()=>void;
}) {
  const next=useRef<HTMLButtonElement>(null), won=run.status==='won';
  const [score,setScore]=useState(reduced?run.score:run.completion?.score??run.score);
  useEffect(()=> {
    next.current?.focus();
    if(reduced){setScore(run.score);return;}
    let frame:number; const from=run.completion?.score??run.score, start=performance.now();
    const tick=(now:number)=>{const p=Math.min(1,(now-start)/900);setScore(Math.round(from+(run.score-from)*(1-(1-p)**3)));if(p<1)frame=requestAnimationFrame(tick);};
    frame=requestAnimationFrame(tick);return()=>cancelAnimationFrame(frame);
  },[run.id,reduced]);
  return <Localized language={language}><div className="bb-shade bb-result-shade">
    <section className={`bb-completion bb-unified-result ${won?'won':'lost'}`} role="dialog" aria-modal="true" aria-label={won?'Hoàn thành mục tiêu':'Lý do kết thúc ván'}>
      <header><img src={asset(`png/characters/char_bibi_${won?'happy':'sad'}.png`)} alt="Bibi"/><div><p className="bb-kicker">MÀN {run.level.id}</p><h1>{won?'Đã hoàn thành mục tiêu!':'Ván chơi đã kết thúc'}</h1></div></header>
      <div className="bb-result-body">
        <div className="bb-result-stars" aria-label={`${stars} sao`}>{'★'.repeat(stars)}{'☆'.repeat(3-stars)}</div>
        <strong className="bb-final-score">{score.toLocaleString('en-US')} <small>điểm</small></strong>
        <div className="bb-completion-goals">{run.level.goals.map((g,i)=><div key={i}>
          {g.kind==='collect'&&<img src={pieceAsset({id:0,color:g.color!},run.level.chapter)} alt=""/>}
          <b>{won?'✓':'○'}</b><span>{g.kind==='score'?`${won?'':run.score.toLocaleString('en-US')+' / '}${g.target.toLocaleString('en-US')} điểm`:g.kind==='boss'?won?'Đã đánh bại boss':`Boss còn ${run.bossHP} HP`:`${won?'':(run.progress[key(g)]||0)+' / '}${g.target} ${GOAL_LABELS[g.kind].toLowerCase()}`}</span>
        </div>)}</div>
        {!won&&<p className="bb-result-reason">{run.reason}</p>}
        {won&&<div className="bb-reward-summary">
          <div><span>Thưởng lượt còn lại</span><b>{run.bonusMoves} lượt</b></div>
          <div><span>Điểm thưởng</span><b>+{Math.max(0,run.score-(run.completion?.score??run.score)).toLocaleString('en-US')}</b></div>
          <div><span>Tổng Xu nhận được</span><b>+{reward} Xu</b></div>
          {run.bonusMoves>0&&<small>Đã gồm {run.bonusMoves*5} Xu từ lượt dư.</small>}
        </div>}
        <p className="bb-note">Hỗ trợ chưa dùng đã được hoàn trả. Không mất mạng khi chơi lại.</p>
      </div>
      <footer><button onClick={onMap}>Hành trình</button><button ref={next} className="bb-primary" onClick={onDone}>{nextLabel}</button></footer>
    </section>
  </div></Localized>;
}
