import React,{useEffect,useRef,useState} from 'react';
import type {Seat} from './engine';
import {BattleshipAudio,SoundTracker,type SoundView} from './sound';
const preference='arcadex:battleship:soundOff:v1';
export function useBattleAudio(view:SoundView|null,key:string,seat:Seat,control:Seat,options:{isMuted?:boolean;paused?:boolean;active?:boolean;now?:number;reduced?:boolean}={}){
 const [localMuted,setLocalMuted]=useState(()=>{try{return localStorage.getItem(preference)==='1';}catch{return false;}}),[hidden,setHidden]=useState(()=>document.hidden),[status,setStatus]=useState('locked');
 const controller=useRef<BattleshipAudio|null>(null),tracker=useRef(new SoundTracker());if(!controller.current)controller.current=new BattleshipAudio();
 const sound=controller.current,allowed=!options.isMuted&&!localMuted&&!options.paused&&options.active!==false&&!hidden;
 const live=useRef({allowed,options,localMuted});live.current={allowed,options,localMuted};
 useEffect(()=>{sound.configure(allowed);setStatus(sound.status);},[sound,allowed]);
 useEffect(()=>{const visibility=()=>{setHidden(document.hidden);if(document.hidden){sound.configure(false);setStatus(sound.status);}};document.addEventListener('visibilitychange',visibility);return()=>document.removeEventListener('visibilitychange',visibility);},[sound]);
 useEffect(()=>{sound.activate();return()=>sound.dispose();},[sound]);
 useEffect(()=>{const cues=tracker.current.update(view,key,seat,control,options.now??Date.now(),allowed,options.reduced);for(const cue of cues)sound.emit(cue);},[view,key,seat,control,allowed,options.now,options.reduced,sound]);
 const gesture=()=>{sound.configure(live.current.allowed);void sound.unlock().then(()=>setStatus(sound.status));};
 const toggle=()=>{if(options.isMuted)return;if(!localMuted&&status==='suspended'){sound.configure(!options.paused&&options.active!==false&&!document.hidden);void sound.unlock().then(()=>setStatus(sound.status));return;}const next=!localMuted;setLocalMuted(next);try{localStorage.setItem(preference,next?'1':'0');}catch{}sound.configure(!next&&!options.paused&&options.active!==false&&!document.hidden);void sound.unlock().then(()=>setStatus(sound.status));};
 const button=<button className="bs-icon" type="button" aria-label={options.isMuted?'Âm thanh đã tắt ở sảnh Arcade-x':localMuted?'Bật âm thanh':status==='suspended'?'Tiếp tục âm thanh':'Tắt âm thanh'} title={options.isMuted?'Bật âm thanh trong cài đặt Arcade-x':status==='unavailable'?'Trình duyệt không hỗ trợ âm thanh':undefined} aria-pressed={!options.isMuted&&!localMuted} disabled={options.isMuted} data-audio-state={status} onClick={toggle}>{options.isMuted||localMuted?'🔇':'🔊'}</button>;
 return {gesture,button};
}
