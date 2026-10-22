import React,{useEffect,useRef,useState} from 'react';
import type {DungeonState} from '../engine';
import {bossPattern,bossPhase} from '../director';
import {getStoryChapterForStage} from '../storyChapters';
import {TitanArt} from './TitanArt';
import {ART,RasterSprite} from './RasterSprite';

export function bossArtPose(s:DungeonState){
 const p=bossPhase(s.encounterTime,1,s.stage),pattern=bossPattern(s.stage),age=p.t-pattern.strikeAt;
 if(s.exposed>0||s.parriedCycle===p.cycle&&p.phase!=='guard')return 'exposed';
 if(p.phase==='windup')return 'windup';
 if(age>=0&&age<.28)return 'attack';
 if(age>=.28&&age<.65)return 'recovery';
 if(p.phase==='exposed')return 'exposed';
 return p.t<.5?'walk':p.t<1?'step':'idle';
}
export function AllyActor({ally,clock,facing}:{facing?:'left'|'right';ally:DungeonState['allies'][number];clock:number}){
 const seen=useRef(ally.currentSkillIndex),last=useRef(-10);
 useEffect(()=>{if(seen.current!==ally.currentSkillIndex){last.current=clock;seen.current=ally.currentSkillIndex;}},[ally.currentSkillIndex,clock]);
 const skill=ally.skills[ally.currentSkillIndex||0],age=clock-last.current;
 const pose=age<.35?'attack':skill&&skill.currentCooldown<.45?'windup':ally.currentDmg>0&&clock%1.8<.2?'attack':'idle';
 return <TitanArt profession={ally.profession} pose={pose} clock={clock} facing={facing}/>;
}
export function DefeatEcho({s}:{s:DungeonState}){
 const previous=useRef({id:s.monster.id,chapter:getStoryChapterForStage(s.stage).id,boss:s.monster.isBoss,name:s.monster.name,slain:s.monstersSlain});
 const [echo,setEcho]=useState<{chapter:number;boss:boolean;name:string;at:number}|null>(null);
 useEffect(()=>{const p=previous.current;if(p.id!==s.monster.id&&s.monstersSlain>p.slain)setEcho({...p,at:s.elapsed});previous.current={id:s.monster.id,chapter:getStoryChapterForStage(s.stage).id,boss:s.monster.isBoss,name:s.monster.name,slain:s.monstersSlain};},[s.monster.id,s.monstersSlain,s.stage]);
 if(!echo||s.elapsed-echo.at>.55)return null;
 return <div className={`dt-defeat-echo ${echo.boss?'was-boss':''}`} aria-hidden="true" style={{opacity:Math.max(0,1-(s.elapsed-echo.at)/.55)}}><TitanArt chapter={echo.chapter} boss={echo.boss} monsterName={echo.name} pose="defeat"/></div>;
}
export function CombatFX({s}:{s:DungeonState}){
 const stamp=useRef({id:-1,at:-10});
 useEffect(()=>{if(s.event.kind==='parry'&&stamp.current.id!==s.event.id)stamp.current={id:s.event.id,at:s.elapsed};},[s.event.id,s.event.kind,s.elapsed]);
 let age=s.elapsed-s.lastTap,row=0;
 const spell=s.skills.find(k=>k.currentCooldown>0&&k.currentCooldown>k.cooldown-.32);
 if(spell){row=2;age=spell.cooldown-spell.currentCooldown;}
 if(s.elapsed-stamp.current.at<.32){row=1;age=s.elapsed-stamp.current.at;}
 if(age<0||age>=.32)return null;
 return <RasterSprite src={ART.fx} cols={4} rows={3} index={row*4+Math.min(3,Math.floor(age/.08))} className="dt-combat-fx"/>;
}
