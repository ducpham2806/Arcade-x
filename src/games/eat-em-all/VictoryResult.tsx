import React,{useEffect,useRef,useState} from 'react';
import type {CampaignStage} from './campaign';
import type {GameMode,ItemType} from './types';
import {Art} from './ArtIcon';
import {eatAudio} from './audio';
import {countUp,resultTiming,visibleStars,RESULT_ROW_SECONDS,RESULT_COUNT_SECONDS,STAR_INTERVAL_SECONDS} from './victory';
interface Props {
 hint?:string;won:boolean;mode:GameMode;stage:CampaignStage;counts:Partial<Record<ItemType,number>>;bossHits:number;eaten:number;
 score:number;stars:number;reward:{coins:number;xp:number;earnedStars:number};paused:boolean;
 onNext:()=>void;onMap:()=>void;onStory:()=>void;onExit:()=>void;
}
const names:Record<string,string>={ice:'Băng',fire:'Lửa',star:'Sao',gem:'Linh hồn',armor:'Giáp',eaten:'Đã ăn'};
export const VictoryResult:React.FC<Props>=(p)=>{
 const rows=p.mode==='target'?[...Object.entries(p.stage.targetItems).map(([key,goal])=>({key,icon:key,goal:goal||0,value:Math.min(goal||0,p.counts[key as ItemType]||0)})),...(p.stage.objective==='boss'?[{key:'armor',icon:'power_shield',goal:p.stage.bossHits||0,value:Math.min(p.stage.bossHits||0,p.bossHits)}]:[])]:[{key:'eaten',icon:'gem',goal:p.eaten,value:p.eaten}];
 const awarded=p.won&&p.mode==='target'?p.stars:0;
 const timing=resultTiming(rows.length,awarded);
 const [elapsed,setElapsed]=useState(0);
 const done=elapsed>=timing.total;
 const starCount=visibleStars(elapsed,rows.length,awarded);
 const sounded=useRef(0);
 useEffect(()=>{
  if(p.paused||done)return;
  let last=performance.now();
  const id=window.setInterval(()=>{const now=performance.now();const dt=Math.min(.1,(now-last)/1000);last=now;if(!document.hidden)setElapsed(v=>Math.min(timing.total,v+dt));},32);
  return()=>window.clearInterval(id);
 },[p.paused,done,timing.total]);
 useEffect(()=>{if(starCount>sounded.current){sounded.current=starCount;eatAudio.playComboTier(starCount+1);}},[starCount]);
 const progress=(start:number,duration:number)=>Math.max(0,Math.min(1,(elapsed-start)/duration));
 const next=p.mode==='target'&&p.won&&p.stage.id<24;
 return <div className="eat-overlay eat-result-overlay"><section className="eat-result eat-sequence-result" role="dialog" aria-label={p.won?'Hoàn thành màn':'Thử lại'} data-result-complete={done}>
  <Art name={p.won?'nom-dual-happy':'nom-dual-hurt'} size={95}/><h2>{p.won?'HOÀN THÀNH!':'THỬ LẠI NHÉ'}</h2>
  <div className="eat-result-targets" aria-label="Mục tiêu đã đạt">{rows.map((row,i)=>{const start=.15+i*RESULT_ROW_SECONDS;const phase=progress(start,RESULT_COUNT_SECONDS);return <div key={row.key} data-target={row.key} data-count={countUp(row.value,phase)} className={`eat-target-tally ${elapsed>=start?'revealed':''} ${phase>=1?'counted':''}`} style={{'--tally-progress':`${phase*100}%`} as React.CSSProperties}><Art name={row.icon} size={27}/><span>{names[row.key]}</span><b>{countUp(row.value,phase)}<small>/{row.goal}</small></b>{phase>=1&&row.value>=row.goal?<Art name="check" size={20}/>:<span className="eat-tally-placeholder"/>}</div>;})}</div>
  <div className={`eat-result-score ${elapsed>=timing.scoreStart?'revealed':''}`} aria-label="Điểm tổng kết"><Art name="crown" size={25}/><b data-score={countUp(p.score,progress(timing.scoreStart,.46))}>{countUp(p.score,progress(timing.scoreStart,.46)).toLocaleString()}</b></div>
  {(p.reward.coins>0||p.reward.earnedStars>0)&&<div className={`eat-rewards ${elapsed>=timing.rewardStart?'revealed':''}`} aria-label="Phần thưởng"><span title="Sao mới"><Art name="star" size={23}/>+{countUp(p.reward.earnedStars,progress(timing.rewardStart,.4))}</span><span title="Xu Arcade-x"><Art name="coin" size={23}/>+{countUp(p.reward.coins,progress(timing.rewardStart,.4))}</span><span title="Kinh nghiệm">XP +{countUp(p.reward.xp,progress(timing.rewardStart,.4))}</span></div>}
  {p.won&&p.mode==='target'&&<div className="eat-result-stars eat-sequence-stars" aria-label={`${starCount}/${awarded} sao đã hiển thị`}>{[1,2,3].map(n=><span key={n} className={`eat-star-slot ${n<=starCount?'earned':''}`} data-star={n} data-earned={n<=starCount} style={{'--star-age':`${Math.max(0,elapsed-timing.starStart-(n-1)*STAR_INTERVAL_SECONDS)}s`} as React.CSSProperties}><Art name="star" size={43} className={n<=starCount?'':'empty'}/>{n<=starCount&&<span className="eat-star-sparks" aria-hidden="true">{Array.from({length:8},(_,i)=><i key={i} style={{'--spark-angle':`${i*45}deg`} as React.CSSProperties}/>)}</span>}</span>)}</div>}
  {!p.won&&p.hint&&<p className="eat-retry-hint">{p.hint}</p>}
  <div className="eat-result-actions"><button className="eat-primary" aria-label={next?'Màn tiếp theo':'Chơi lại'} onClick={p.onNext}><Art name={next?'arrow':'play'} size={27}/>{next?'TIẾP':'CHƠI LẠI'}</button>{!done&&<button className="eat-skip-tally" aria-label="Hiển thị ngay kết quả" title="Hiển thị ngay kết quả" onClick={()=>setElapsed(timing.total)}><Art name="arrow" size={19}/><Art name="arrow" size={19}/></button>}</div>
  <div className="eat-result-options"><button className="eat-icon-btn" aria-label="Về bản đồ" title="Bản đồ" onClick={p.onMap}><Art name="map" size={25}/></button><button className="eat-icon-btn" aria-label="Xem câu chuyện" title="Câu chuyện" onClick={p.onStory}><Art name="book" size={25}/></button><button className="eat-icon-btn" aria-label="Kết thúc lượt" title="Kết thúc lượt" onClick={p.onExit}><Art name="close" size={23}/></button></div>
 </section></div>;
};
