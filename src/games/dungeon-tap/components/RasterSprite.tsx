import React from 'react';
const goblin = "/games/dungeon-tap/assets/art-v5/goblin.webp";
const skeleton = "/games/dungeon-tap/assets/art-v5/skeleton.webp";
const spider = "/games/dungeon-tap/assets/art-v5/spider.webp";
const vampire = "/games/dungeon-tap/assets/art-v5/vampire.webp";
const dragon = "/games/dungeon-tap/assets/art-v5/dragon.webp";
const frost = "/games/dungeon-tap/assets/art-v5/frost.webp";
const thunder = "/games/dungeon-tap/assets/art-v5/thunder.webp";
const voidLord = "/games/dungeon-tap/assets/art-v5/void.webp";
const partyA = "/games/dungeon-tap/assets/art-v5/party-a.webp";
const partyB = "/games/dungeon-tap/assets/art-v5/party-b.webp";
const enemiesA = "/games/dungeon-tap/assets/art-v5/enemies-a.webp";
const enemiesB = "/games/dungeon-tap/assets/art-v5/enemies-b.webp";
const enemiesC = "/games/dungeon-tap/assets/art-v5/enemies-c.webp";
const enemiesD = "/games/dungeon-tap/assets/art-v5/enemies-d.webp";
const gear = "/games/dungeon-tap/assets/art-v5/gear.webp";
const spells = "/games/dungeon-tap/assets/art-v5/spells.webp";
const ui = "/games/dungeon-tap/assets/art-v5/ui.webp";
const fx = "/games/dungeon-tap/assets/art-v5/fx.webp";
const world1 = "/games/dungeon-tap/assets/art-v5/world-1.webp";
const world2 = "/games/dungeon-tap/assets/art-v5/world-2.webp";
const world3 = "/games/dungeon-tap/assets/art-v5/world-3.webp";
const world4 = "/games/dungeon-tap/assets/art-v5/world-4.webp";
const world5 = "/games/dungeon-tap/assets/art-v5/world-5.webp";
const world6 = "/games/dungeon-tap/assets/art-v5/world-6.webp";
const world7 = "/games/dungeon-tap/assets/art-v5/world-7.webp";
const world8 = "/games/dungeon-tap/assets/art-v5/world-8.webp";

const extra1 = "/games/dungeon-tap/assets/art-v6/extra-1.webp";
const extra2 = "/games/dungeon-tap/assets/art-v6/extra-2.webp";
const extra3 = "/games/dungeon-tap/assets/art-v6/extra-3.webp";
const extra4 = "/games/dungeon-tap/assets/art-v6/extra-4.webp";
const extra5 = "/games/dungeon-tap/assets/art-v6/extra-5.webp";
const extra6 = "/games/dungeon-tap/assets/art-v6/extra-6.webp";
const extra7 = "/games/dungeon-tap/assets/art-v6/extra-7.webp";
const extra8 = "/games/dungeon-tap/assets/art-v6/extra-8.webp";
import {ENEMY_ROSTER} from '../enemyRoster';
export const ART={bosses:[goblin,skeleton,spider,vampire,dragon,frost,thunder,voidLord],party:[partyA,partyB],enemies:[enemiesA,enemiesB,enemiesC,enemiesD],extras:[extra1,extra2,extra3,extra4,extra5,extra6,extra7,extra8],gear,spells,ui,fx,worlds:[world1,world2,world3,world4,world5,world6,world7,world8]};
export const PROFESSIONS=['','archer','mage','golem','assassin','priestess','dragon_knight'];
export const ENEMY_NAMES=ENEMY_ROSTER;
export const spritePosition=(index:number,cols:number,rows:number)=>`${cols===1?0:(index%cols)/(cols-1)*100}% ${rows===1?0:Math.floor(index/cols)/(rows-1)*100}%`;
export function RasterSprite({src,index=0,cols=1,rows=1,className='',label,style,...rest}:{src:string;index?:number;cols?:number;rows?:number;className?:string;label?:string;style?:React.CSSProperties}&React.HTMLAttributes<HTMLSpanElement>){
 return <span {...rest} role={label?'img':undefined} aria-label={label} aria-hidden={label?undefined:true} data-frame={index} className={`dt-raster ${className}`} style={{backgroundImage:`url("${src}")`,backgroundSize:`${cols*100}% ${rows*100}%`,backgroundPosition:spritePosition(index,cols,rows),...style}}/>;
}
export function WorldArt({chapter,className=''}:{chapter:number;className?:string}){const n=Math.max(0,Math.min(7,chapter-1));return <RasterSprite src={ART.worlds[n]} style={{backgroundSize:'cover',backgroundPosition:'center 60%'}} className={`dt-world ${className}`}/>;}
export const SKILL_IDS=['heavenly_strike','berserker_rage','hand_of_midas','shadow_clone','blade_storm','war_cry','radiant_slash','skill-archer-rain','skill-archer-frost','skill-archer-sniper','skill-mage-meteor','skill-mage-blizzard','skill-mage-thunder','skill-golem-quake','skill-golem-shield','skill-golem-slam','skill-assassin-deathstrike','skill-assassin-poison','skill-assassin-shadow','skill-priestess-blessing','skill-priestess-cleanse','skill-priestess-miracle','skill-dragon-roar','skill-dragon-rage','skill-dragon-cataclysm'];
export function SkillArt({id}:{id:string}){return <RasterSprite src={ART.spells} index={Math.max(0,SKILL_IDS.indexOf(id))} cols={5} rows={5} className="fx-icon dt-skill-art"/>;}
export function GearArt({slot,profession}:{slot:string;profession?:string}){const prof=PROFESSIONS.indexOf(profession||'');const i=profession&&prof>0?5+(prof-1)*3+Math.max(0,['ally_weapon','ally_armor','ally_accessory'].indexOf(slot)):Math.max(0,['weapon','armor','helmet','cloak','ring'].indexOf(slot));return <RasterSprite src={ART.gear} index={i} cols={6} rows={4} className="fx-icon dt-gear-art"/>;}
