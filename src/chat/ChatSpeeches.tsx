import {protectedBoxes,overlaps} from './placement';
import React,{useEffect,useState} from 'react';
import {createPortal} from 'react-dom';
import {useChat} from './ChatContext';
import type {Channel} from './chat-store';
export function ChatSpeeches(){
 const chat=useChat(),room=chat?.room;
 const [anchor,setAnchor]=useState<{x:number;y:number}|null>(null),[expired,setExpired]=useState(''),[muted,setMuted]=useState<string[]>([]);
 const channel:Channel={scope:'room',target:room?.id||'',selfId:room?.selfId,transport:room?.transport,maxLength:room?.transport?500:1000};
 const message=room&&!room.unavailable?chat?.store.state(channel).speech:null;
 const member=room?.players.find(p=>p.id===message?.sender&&p.id!==room.selfId);
 useEffect(()=>{setExpired('');setMuted([]);},[room?.id]);
 useEffect(()=>{if(!message||!member||!chat?.speechEnabled)return;const update=()=>{const target=[...document.querySelectorAll<HTMLElement>('[data-chat-player]')].find(e=>e.dataset.chatPlayer===member.id&&e.getBoundingClientRect().width>0);if(!target){setAnchor(null);return;}const r=target.getBoundingClientRect();const width=Math.min(240,innerWidth-24);const candidates=[{x:r.left,y:r.top-88},{x:r.right+8,y:r.top},{x:r.left-width-8,y:r.top}].map(p=>({x:Math.max(12,Math.min(innerWidth-width-12,p.x)),y:Math.max(60,Math.min(innerHeight-110,p.y))}));const boxes=protectedBoxes();setAnchor(candidates.find(p=>!boxes.some(b=>overlaps(p,width,80,b)))||null);};update();const resize=new ResizeObserver(update);document.querySelectorAll('[data-chat-player]').forEach(e=>resize.observe(e));window.addEventListener('resize',update);window.addEventListener('scroll',update,true);const timer=setTimeout(()=>setExpired(message.id),4000);return()=>{resize.disconnect();window.removeEventListener('resize',update);window.removeEventListener('scroll',update,true);clearTimeout(timer);};},[message?.id,member?.id,chat?.speechEnabled]);
 if(!chat||!message||!member||!anchor||!chat.speechEnabled||expired===message.id||muted.includes(member.id)||Date.now()-Date.parse(message.created_at)>11000)return null;
 return createPortal(<div className="chat-opponent-speech" data-chat-ui="true" style={{left:anchor.x,top:anchor.y}}><button type="button" className="chat-speech-content" onClick={()=>chat.open(channel)} aria-label={`${member.name}: ${message.text}. Mở chat trận`}><small>{member.name}</small><span>{message.text.slice(0,80)}{message.text.length>80?'…':''}</span></button><button type="button" className="chat-speech-mute" aria-label={`Ẩn lời nổi của ${member.name} trong trận này`} onClick={()=>setMuted(v=>[...v,member.id])}>×</button></div>,document.body);
}
