import React,{useRef,useEffect,useState} from 'react';
import {DungeonState,Action} from '../engine';
import {getStoryChapterForStage} from '../storyChapters';
import {ROLE_LABELS} from '../enemyRoster';
import {TitanArt} from './TitanArt';
import {AllyActor,CombatFX,bossArtPose} from './CombatArt';
import {FantasyIcon as Icon} from './FantasyIcon';

export function useDamageRate(s:DungeonState){
 const [rate,setRate]=useState(0),samples=useRef<{at:number;total:number}[]>([]);
 useEffect(()=>{const q=samples.current;if(!q.length||s.elapsed<q[q.length-1].at){q.length=0;q.push({at:s.elapsed,total:s.damageTotal});setRate(0);return;}q.push({at:s.elapsed,total:s.damageTotal});while(q.length>2&&q[1].at<s.elapsed-3)q.shift();const first=q[0],duration=s.elapsed-first.at;setRate(duration>.2?Math.max(0,(s.damageTotal-first.total)/duration):0);},[s.elapsed,s.damageTotal]);
 return rate;
}
export function BattlefieldV6({s,send,paused,hold,stop,openHero,openAlly}:{s:DungeonState;send:(a:Action)=>void;paused:boolean;hold:()=>void;stop:()=>void;openHero:()=>void;openAlly:(id:string)=>void}){
 const chapter=getStoryChapterForStage(s.stage).id,boss=s.monster.isBoss,target=s.monster.id,units=s.enemies;
 const press=(e:React.PointerEvent,id?:string)=>{e.currentTarget.setPointerCapture?.(e.pointerId);if(id)send({type:'target',id});hold();};
 const prev=useRef({id:target,slain:s.monstersSlain+s.bossesSlain,unit:s.enemies.find(e=>e.id===target),at:0});
 const [fallen,setFallen]=useState<{unit:DungeonState['enemies'][number];at:number}|null>(null);
 useEffect(()=>{const p=prev.current;if(p.id!==target&&s.monstersSlain+s.bossesSlain>p.slain&&p.unit)setFallen({unit:p.unit,at:s.elapsed});prev.current={id:target,slain:s.monstersSlain+s.bossesSlain,unit:s.enemies.find(e=>e.id===target),at:s.elapsed};},[target,s.monstersSlain,s.bossesSlain]);
 return <>
 <div className="v6-tap-field" role="button" tabIndex={0} aria-label="Giữ sân đấu để chém" onPointerDown={e=>press(e)} onPointerUp={stop} onPointerCancel={stop} onLostPointerCapture={stop} onKeyDown={e=>{if([' ','Enter'].includes(e.key)&&!e.repeat){e.preventDefault();hold();}}} onKeyUp={stop} onBlur={stop}/>
 <div className="v6-platform v6-platform-left"/><div className="v6-platform v6-platform-right"/><div className="v6-ground"/>
 <button className="v6-hero" aria-label="Mở anh hùng" onClick={openHero}><TitanArt hero facing="right" pose={s.elapsed-s.lastTap<.2?'attack':'idle'}/><span className="v6-hero-level">{s.heroLevel}</span></button>
 <div className="v6-companions">{s.allies.filter(a=>a.unlocked).map((a,i)=><button key={a.id} className={`v6-companion v6-seat-${i}`} onClick={()=>openAlly(a.id)} aria-label={`Xem ${a.name}`}><AllyActor ally={a} clock={s.elapsed} facing={[2,3,5].includes(i)?'left':'right'}/></button>)}</div>
 <div className={`v6-enemy-line ${boss?'v6-boss-line':''}`} aria-label="Đội hình địch">{units.map((unit,i)=>{const selected=unit.id===target;return <button key={unit.id} data-enemy-id={unit.id} data-species={unit.species} data-role={unit.role} aria-label={`${unit.name}, ${ROLE_LABELS[unit.role]}, ${Math.ceil(unit.hp/unit.maxHp*100)}% máu`} aria-pressed={selected} disabled={paused} className={`v6-enemy ${unit.isBoss?'v6-enemy-boss':''} ${unit.rank==='champion'?'v6-champion':''} ${selected?'is-target':''} v6-enemy-seat-${i} ${unit.role==='caster'&&s.casterPulse>=4?'v6-channeling':''} ${unit.role==='flyer'?'is-flying':''}`} onPointerDown={e=>press(e,unit.id)} onPointerUp={stop} onPointerCancel={stop} onLostPointerCapture={stop} onClick={e=>{if(e.detail===0){send({type:'target',id:unit.id});send({type:'tap'});}}}>
 <TitanArt facing="left" chapter={chapter} boss={unit.rank==='titan'} enemyVariant={unit.species} monsterName={unit.name} pose={unit.isBoss?bossArtPose(s):selected&&s.elapsed-s.lastTap<.16?'hurt':(s.encounterTime+i*.4)%2.6<.28?'attack':'idle'}/>
 {!unit.isBoss&&<><span className="v6-unit-health"><i style={{width:`${unit.hp/unit.maxHp*100}%`}}/></span><span className={`v6-role v6-role-${unit.role}`}><Icon name={unit.role==='guard'?'shield':unit.role==='caster'?'staff':unit.role==='flyer'?'bolt':'sword'}/></span></>}
 {selected&&<><i className="v6-target-marker"/><CombatFX s={s}/></>}
 </button>})}</div>
 {fallen&&s.elapsed-fallen.at<.5&&<div className="v6-fallen" style={{opacity:1-(s.elapsed-fallen.at)/.5}}><TitanArt facing="left" chapter={chapter} boss={fallen.unit.rank==='titan'} enemyVariant={fallen.unit.species} monsterName={fallen.unit.name} pose="defeat"/></div>}
 </>;
}
