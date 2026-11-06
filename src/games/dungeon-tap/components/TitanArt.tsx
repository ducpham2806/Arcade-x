import React,{useState} from 'react';
import {ART,PROFESSIONS,ENEMY_NAMES,RasterSprite} from './RasterSprite';
const ACTOR_SHEETS=[...ART.bosses,...ART.party,...ART.enemies,...ART.extras];
export function actorFrame(pose:string,clock:number,boss:boolean,party:boolean){
 if(boss)return ({idle:0,walk:1,step:2,windup:3,attack:4,recovery:5,exposed:6,hurt:6,defeat:7} as Record<string,number>)[pose]??0;
 if(party)return ({idle:0,walk:0,windup:1,attack:2,hurt:3,exposed:3,defeat:3} as Record<string,number>)[pose]??0;
 return ['attack','windup'].includes(pose)?1:0;
}
export function TitanArt({chapter=1,boss=false,kind='scout',pose='idle',hero=false,profession='',small=false,clock=0,monsterName='',enemyVariant,facing}:{chapter?:number;boss?:boolean;kind?:string;pose?:string;hero?:boolean;profession?:string;small?:boolean;clock?:number;monsterName?:string;enemyVariant?:number;facing?:'left'|'right'}){
 const ch=Math.max(0,Math.min(7,chapter-1)),party=hero||!!profession,frame=actorFrame(pose,clock,boss,party);
 let src=ART.bosses[ch],index=frame,cols=4,rows=2;
 // Atlas direction: v6 extra troops already face left; v5 party faces right.
 let nativeLeft=boss&&(ch===4&&[1,2,3,5,7].includes(frame)||ch===2&&frame===4);
 if(party){const p=hero?0:Math.max(1,PROFESSIONS.indexOf(profession));src=ART.party[p<4?0:1];rows=p<4?4:3;index=(p<4?p:p-4)*4+frame;}
 else if(!boss){let variant=enemyVariant??ENEMY_NAMES[ch].findIndex(n=>monsterName.includes(n));if(monsterName.includes('Quỷ Rừng'))variant=2;if(variant<0)variant=['armor','elite','gauntlet'].includes(kind)?1:['caster','rest'].includes(kind)?2:0;src=ART.enemies[Math.floor(ch/2)];cols=ch>=4&&ch<=5?4:2;rows=ch>=4&&ch<=5?3:6;index=((ch%2)*3+variant)*2+frame;nativeLeft=variant>=3||ch===3;if(variant>=3){src=ART.extras[ch];cols=3;rows=2;index=variant-3+frame*3;}}
 const mirrored=!!facing&&((facing==='left')!==nativeLeft);
 const current={src,index,cols,rows,mirrored,key:`${ACTOR_SHEETS.indexOf(src)}:${cols}:${rows}:${index}:${mirrored}`};
 // Keep only the last pose. The browser blends atlas changes between simulation ticks.
 const [frames,setFrames]=useState<{current:typeof current;previous:typeof current|null}>(()=>({current,previous:null}));
 if(frames.current.key!==current.key)setFrames({current,previous:frames.current});
 const layer=(f:typeof current,previous=false)=><RasterSprite key={`${previous?'old':'new'}:${f.key}`} src={f.src} index={f.index} cols={f.cols} rows={f.rows} className={`dt-actor-frame ${previous?'dt-frame-previous':`dt-frame-current ${frames.previous?'dt-frame-blend':''}`}`} style={{scale:f.mirrored?'-1 1':'1 1'}}/>;
 return <RasterSprite src={src} index={index} cols={cols} rows={rows} data-facing={facing} label={hero?'Kiếm sĩ':profession?`Đồng đội ${profession}`:boss?'Titan thủ lĩnh':monsterName||`Quái ${kind}`} data-actor={party?hero?'hero':profession:boss?`boss-${chapter}`:`enemy-${chapter}`} data-pose={pose} style={{backgroundImage:'none'}} className={`dt-actor dt-layered ${small?'dt-small':''} dt-pose-${pose} ${mirrored?'dt-face-mirrored':''}`}><span className="dt-actor-motion" aria-hidden="true">{frames.previous&&layer(frames.previous,true)}{layer(frames.current)}</span></RasterSprite>;
}
