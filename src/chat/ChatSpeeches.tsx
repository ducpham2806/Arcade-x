import {protectedBoxes,speechPosition} from './placement';
import React,{useEffect,useLayoutEffect,useRef,useState} from 'react';
import {createPortal} from 'react-dom';
import {useChat} from './ChatContext';
import type {Channel} from './chat-store';
export function ChatSpeeches(){
 const chat=useChat(),room=chat?.room;
 const [anchor,setAnchor]=useState<{x:number;y:number}|null>(null),[expired,setExpired]=useState(''),[muted,setMuted]=useState<string[]>([]);
 const surface=useRef<HTMLDivElement>(null);
 const channel:Channel={scope:'room',target:room?.id||'',selfId:room?.selfId,transport:room?.transport,maxLength:room?.transport?500:1000};
 const message=room&&!room.unavailable?chat?.store.state(channel).speech:null;
 const member=room?.players.find(p=>p.id===message?.sender&&p.id!==room.selfId);
 useEffect(()=>{setExpired('');setMuted([]);},[room?.id]);
 useLayoutEffect(()=>{if(!message||!member||!chat?.speechEnabled)return;const update=()=>{const target=[...document.querySelectorAll<HTMLElement>('[data-chat-player]')].find(e=>e.dataset.chatPlayer===member.id&&e.getBoundingClientRect().width>0),caption=surface.current;if(!target||!caption){setAnchor(null);return;}const r=target.getBoundingClientRect(),size=caption.getBoundingClientRect();const boxes=[...protectedBoxes(),...[...document.querySelectorAll<HTMLElement>('[data-chat-player]')].map(e=>e.getBoundingClientRect()).filter(b=>b.width>0&&b.height>0)];setAnchor(speechPosition(r,size.width,size.height,innerWidth,innerHeight,boxes));};update();const resize=new ResizeObserver(update);document.querySelectorAll('[data-chat-player]').forEach(e=>resize.observe(e));if(surface.current)resize.observe(surface.current);window.addEventListener('resize',update);window.addEventListener('scroll',update,true);return()=>{resize.disconnect();window.removeEventListener('resize',update);window.removeEventListener('scroll',update,true);};},[message?.id,member?.id,chat?.speechEnabled]);
 useEffect(()=>{if(!message)return;const timer=setTimeout(()=>setExpired(message.id),4000);return()=>clearTimeout(timer);},[message?.id]);
 if(!chat||!message||!member||!chat.speechEnabled||expired===message.id||muted.includes(member.id)||Date.now()-Date.parse(message.created_at)>11000)return null;
 return createPortal(<div ref={surface} className="chat-opponent-speech" data-chat-ui="true" aria-hidden={!anchor||undefined} style={anchor?{left:anchor.x,top:anchor.y}:{left:-10000,top:-10000,visibility:'hidden'}}><button type="button" className="chat-speech-content" onClick={()=>chat.open(channel)} aria-label={`${member.name}: ${message.text}. Mở chat trận`}><small>{member.name}</small><span>{message.text.slice(0,80)}{message.text.length>80?'…':''}</span></button><button type="button" className="chat-speech-mute" aria-label={`Ẩn lời nổi của ${member.name} trong trận này`} onClick={()=>setMuted(v=>[...v,member.id])}>×</button></div>,document.body);
}
