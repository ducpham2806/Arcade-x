import React from 'react';
import type {Art} from './art';
import {FLEET,type viewFor} from './engine';
type View=ReturnType<typeof viewFor>;
/** Both fleets at a glance: every ship class, struck through once sunk. Enemy positions stay
 * hidden; only the classes already sunk (revealed by the engine) are marked. */
export function FleetStatus({art,faction,view,team}:{art:Art;faction:'us'|'jp';view:View;team:0|1}){
 const enemyFaction=faction==='us'?'jp':'us',copies=view.mode==='squad'?2:1;
 const ownSunk=new Set(view.shots.filter(s=>s.target===team&&s.sunk).map(s=>s.sunk));
 const enemyRows=FLEET.flatMap(f=>Array.from({length:copies},(_,i)=>({key:`${f.type}${i}`,type:f.type,label:f.label,sunk:view.revealedEnemy.filter(s=>s.type===f.type).length>i})));
 const ownRows=view.own.map(s=>({key:s.id,type:s.type,label:FLEET.find(f=>f.type===s.type)!.label,sunk:ownSunk.has(s.id)}));
 const row=(title:string,side:string,list:{key:string;type:string;label:string;sunk:boolean}[])=><div className="bs-fleet-row"><span>{title}<b>{list.filter(s=>!s.sunk).length}/{list.length}</b></span><ul>{list.map(s=><li key={s.key} className={s.sunk?'sunk':''} title={`${s.label}${s.sunk?' · đã chìm':''}`} aria-label={`${s.label}${s.sunk?' · đã chìm':''}`}><span className="bs-fleet-icon"><img src={art.images[`${side}-${s.type}`].src} alt=""/></span></li>)}</ul></div>;
 return <div className="bs-fleet-status" aria-label={`Hạm đội địch còn ${enemyRows.filter(s=>!s.sunk).length} tàu, hạm đội ta còn ${ownRows.filter(s=>!s.sunk).length} tàu`}>{row('HẠM ĐỘI ĐỊCH',enemyFaction,enemyRows)}{row('HẠM ĐỘI TA',faction,ownRows)}</div>;
}
