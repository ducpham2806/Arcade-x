import React from 'react';
import {ART,RasterSprite} from './RasterSprite';
export const UI_ICONS=['sword','hero','allies','bag','map','rune','coin','shield','book','flame','bolt','clone','storm','horn','sun','lock','crown','check','close','menu','pause','up','plus','chest','bow','staff','armor','ring','cloak','settings','info','sound','health','mana','save','gate'];
export function FantasyIcon({name,className='',...rest}:{name:string;className?:string}&React.HTMLAttributes<HTMLSpanElement>){return <RasterSprite src={ART.ui} index={Math.max(0,UI_ICONS.indexOf(name))} cols={6} rows={6} className={`fx-icon ${className}`} {...rest}/>;}
export const skillIcon=(id:string)=>({heavenly_strike:'bolt',berserker_rage:'flame',hand_of_midas:'coin',shadow_clone:'clone',blade_storm:'storm',war_cry:'horn',radiant_slash:'sun'}[id]||'rune');
export const slotIcon=(slot:string)=>({weapon:'sword',armor:'armor',helmet:'crown',cloak:'cloak',ring:'ring',ally_weapon:'sword',ally_armor:'armor',ally_accessory:'ring'}[slot]||'rune');
