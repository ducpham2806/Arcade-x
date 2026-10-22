import React from 'react';
import { DungeonState, statsFor } from '../engine';
import { ROOM_RULES, roomFor, bossPhase, bossPattern } from '../director';
import { getStoryChapterForStage } from '../storyChapters';
import { formatNumber } from '../utils/upgradeMath';
import { TitanArt } from './TitanArt';
export function DungeonArenaV3({s,onTap,onParry,onRetreat,onBoss,onHold,stopHold,paused}:{s:DungeonState;onTap:()=>void;onParry:()=>void;onRetreat:()=>void;onBoss:()=>void;onHold:()=>void;stopHold:()=>void;paused:boolean}) {
 const chapter=getStoryChapterForStage(s.stage),boss=s.monster.isBoss,room=s.farming?'scout':roomFor(s.stage),rule=ROOM_RULES[room];
 const phase=bossPhase(s.encounterTime,1,s.stage),exposed=s.exposed>0||(boss&&phase.phase==='exposed');
 const pose=exposed?'exposed':boss&&phase.phase==='windup'?'windup':s.hitId>0&&s.elapsed-s.lastTap<.15?'hurt':'idle';
 const stat=statsFor(s),hp=s.monster.hp/s.monster.maxHp*100;
 return <section className={`dt-arena dt-biome-${(chapter.id-1)%8} ${boss?'dt-is-boss':''}`} aria-label="Đấu trường Titan">
  <div className="dt-arena-hud"><div className="dt-roomline"><span>{s.farming?'CÀY VÀNG':rule.name.toUpperCase()}{rule.waves>1?` · ĐỢT ${s.wave}/${rule.waves}`:''}</span><b>{boss?`${s.bossTimer.toFixed(1)} GIÂY`:`TẦNG ${s.stage}`}</b></div>
  <h2>{s.monster.name.replace(/\[CẤP \d+\] /,'').replace(/ \(T\d+\)/,'')}</h2>
  <div className="dt-health" role="progressbar" aria-label="Máu Titan" aria-valuenow={Math.round(hp)} aria-valuemin={0} aria-valuemax={100}><i style={{width:`${hp}%`}}/></div>
  <div className="dt-hp-caption"><span>{exposed?'LỘ LÕI · ×1.6 SÁT THƯƠNG':boss?'TITAN THỦ LĨNH':rule.hint}</span><span>{formatNumber(s.monster.hp)} / {formatNumber(s.monster.maxHp)}</span></div>
  </div>
  <svg className="dt-landscape" viewBox="0 0 700 430" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
   <circle cx="351" cy="105" r="68" fill="var(--dt-glow)" opacity=".1"/>
   <path d="M0 279L56 115L128 231L185 64L254 249L301 145L365 266L445 48L516 230L611 104L700 280V430H0Z" fill="var(--dt-rock)"/>
   <path d="M0 307L130 283L220 312L345 284L459 303L571 279L700 309V430H0Z" fill="#172632"/>
   <path d="M0 356L700 334V430H0Z" fill="#18232d"/>
   <path d="M0 387L700 362M135 347L84 430M315 345L307 430M497 340L542 430" stroke="#344448" strokeWidth="2"/>
   {chapter.id%3===1?<g fill="#203934"><path d="M38 291V121L0 198L36 184L3 241L39 222L23 277M631 287V102L691 185L648 169L700 241L650 216L686 278"/><path d="M83 298V190L52 253H75L52 286Z"/></g>:<g stroke="#435363" strokeWidth="5" fill="#1b293b"><path d="M74 306V72H110V301M597 301V71H634V299"/><path d="M110 94Q350 -59 597 94V124Q350 -27 110 124Z"/></g>}
   {chapter.id===5&&<path d="M0 325L181 348L263 339L418 389L700 360" fill="none" stroke="#f49b58" strokeWidth="7"/>}
   {chapter.id===6&&<g fill="#bceaf0" opacity=".6"><path d="M18 298L49 242L76 298M583 307L617 246L650 307M460 289L479 257L494 289"/></g>}
   <path d="M43 285V231M656 285V231" stroke="#9d7958" strokeWidth="8"/><path d="M33 232Q26 210 44 186Q62 214 52 234ZM646 231Q637 206 658 182Q674 212 666 233Z" fill="var(--dt-glow)"/>
  </svg>
  <button className="dt-titan-target" onClick={onTap} disabled={paused} aria-label="Tấn công Titan"><TitanArt chapter={chapter.id} boss={boss} kind={room} pose={pose}/>{exposed&&<span className="dt-weak-ring"/>}</button>
  <div className="dt-combo"><strong>{s.combo?`${s.combo} HIT`:'SẴN SÀNG'}</strong><span>Combo ×{(1+s.combo*.015).toFixed(2)}</span><i style={{width:`${s.comboTTL/1.4*100}%`}}/></div>
  {(boss||room==='armor')&&<div className="dt-breakmeter"><span>{exposed?'LÕI ĐÃ LỘ':'PHÁ GIÁP'}</span><b>{exposed?'×1.6':`${s.guardHits}/${boss?bossPattern(s.stage).guard:8}`}</b></div>}
  <div className={`dt-combat-message dt-${s.event.kind}`} key={s.event.id} aria-live="polite">{s.event.text}</div>
  {boss&&<div className={`dt-boss-read dt-${phase.phase}`}><b>{phase.phase==='guard'?'TITAN ĐANG THỦ':phase.phase==='windup'?bossPattern(s.stage).name.toUpperCase():'PHẢN CÔNG NGAY'}</b><span>{phase.canParry?'ĐỠ NGAY!':phase.phase==='windup'?'Chờ vòng đỡ sáng…':phase.phase==='exposed'?'Dùng tuyệt kỹ vào lõi Titan':bossPattern(s.stage).hint}</span></div>}
  <div className="dt-party"><div><TitanArt hero pose={s.elapsed-s.lastTap<.2?'attack':'idle'} small/><span>KIẾM SĨ · {s.heroLevel}</span></div>
   {s.allies.filter(a=>a.unlocked).map(a=><div key={a.id}><TitanArt profession={a.profession} chapter={chapter.id} small pose="idle"/><span>{a.name.split(' ')[0]} · {a.level}</span></div>)}
  </div>
  <div className="dt-combat-controls">
   <button className="dt-attack" disabled={paused} onPointerDown={e=>{e.currentTarget.setPointerCapture(e.pointerId);onHold();}} onPointerUp={stopHold} onPointerCancel={stopHold} onLostPointerCapture={stopHold} onKeyDown={e=>{if((e.key===' '||e.key==='Enter')&&!e.repeat){e.preventDefault();onHold();}}} onKeyUp={stopHold} onBlur={stopHold}><b>TẤN CÔNG</b><small>Giữ để tự chém · {formatNumber(stat.tap)}/đòn</small></button>
   {boss?<><button className={`dt-parry ${phase.canParry?'dt-parry-ready':''}`} disabled={paused||!phase.canParry||s.parriedCycle===phase.cycle} onClick={onParry}>ĐỠ ĐÒN<small>Phản công +10 MP</small></button><button className="dt-retreat" disabled={paused} onClick={onRetreat}>Rút lui</button></>:s.farming?<button className="dt-parry" disabled={paused} onClick={onBoss}>TÁI ĐẤU TITAN</button>:null}
  </div>
 </section>;
}
