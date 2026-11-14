import {releaseChatInput} from './input';
import React,{Suspense,useEffect,useRef,useState} from 'react';
import {MessageCircle,Minus,Maximize2,Scaling,Pin} from 'lucide-react';
import {useChat} from './ChatContext';
import {useGameSession,useLauncherUi} from '../context/GameContext';
import {usePlayer} from '../context/PlayerContext';
import {SocialChatThread} from '../components/SocialChatThread';
import {useChatDrag} from './useChatDrag';
import {useDialogFocus} from '../launcher/useDialogFocus';
import {protectedBoxes,overlaps} from './placement';
import {ChatSpeeches} from './ChatSpeeches';
import '../components/social.css';
import './chat.css';
const Community=React.lazy(()=>import('../components/GlobalChat').then(m=>({default:m.GlobalChat})));
export function ChatInputBoundary({children}:{children:React.ReactNode}){
 const chat=useChat();
 return <div data-chat-ui="true" className="chat-input-boundary" onFocusCapture={releaseChatInput} onKeyDownCapture={e=>{if(e.key==='Escape'){e.preventDefault();chat?.close();}e.stopPropagation();}} onKeyUpCapture={e=>e.stopPropagation()} onPointerDown={e=>e.stopPropagation()}>{children}</div>;
}
export function ChatShell(){
 const chat=useChat()!,{activeGameId}=useGameSession(),{isChatOpen,activeModal}=useLauncherUi(),{profile}=usePlayer();
 const [geometry,setGeometry]=useState({width:innerWidth,height:innerHeight,left:16,full:!!activeGameId&&innerWidth<740}),[large,setLarge]=useState(false);
 const bubble=useChatDrag(`${profile.id}:lobby`,false),panelDrag=useChatDrag(`${profile.id}:${activeGameId||'lobby'}:panel`,false,Math.min(320,innerWidth-24));
 const section=useDialogFocus(chat.close,isChatOpen&&!chat.expanded&&geometry.full),root=useRef<HTMLDivElement>(null);
 useEffect(()=>{const layout=()=>{
  const width=window.visualViewport?.width||innerWidth,height=window.visualViewport?.height||innerHeight;
  let left=16,full=width<740&&(!!activeGameId||height<innerHeight-100);
  if(activeGameId&&!full){const boxes=protectedBoxes();const choices=[16,width-336];const top=80,h=Math.min(large?440:360,height-104);const safe=choices.find(x=>!boxes.some(b=>overlaps({x,y:top},320,h,b)));if(safe===undefined)full=true;else left=safe;}
  setGeometry({width,height,left,full});
 };layout();const resize=new ResizeObserver(layout);const game=document.getElementById('game-viewport-stage');if(game)resize.observe(game);window.addEventListener('resize',layout);window.visualViewport?.addEventListener('resize',layout);return()=>{resize.disconnect();window.removeEventListener('resize',layout);window.visualViewport?.removeEventListener('resize',layout);};},[activeGameId,isChatOpen,large,chat.expanded]);
 useEffect(()=>{if(!isChatOpen||chat.expanded||geometry.full||!panelDrag.position)return;const r=root.current?.querySelector('section')?.getBoundingClientRect();if(r&&activeGameId&&protectedBoxes().some(b=>overlaps({x:r.left,y:r.top},r.width,r.height,b)))panelDrag.reset();},[panelDrag.position,isChatOpen]);
 const channel=chat.channel;
 const roomChannel=chat.room&&!chat.room.unavailable?{scope:'room' as const,target:chat.room.id,selfId:chat.room.selfId,transport:chat.room.transport,maxLength:chat.room.transport?500:1000}:null;
 if(activeModal!=='none')return <ChatSpeeches/>;
 const tabs=[...(roomChannel?[{label:'Trận',channel:roomChannel}]:[]),{label:'Sảnh',channel:{scope:'global' as const,target:''}},...(activeGameId?[{label:'Game',channel:{scope:'game' as const,target:activeGameId}}]:[])];
 const title=channel.scope==='room'?'Trận':channel.scope==='game'?'Game':channel.scope==='dm'?'Tin riêng':'Sảnh';
 const position=panelDrag.position;
 return <><ChatSpeeches/>{!activeGameId&&!isChatOpen&&<button type="button" data-chat-ui="true" className="chat-launcher-bubble" aria-label={`Mở chat${chat.unread?' · Có tin chưa đọc':''} · Kéo để di chuyển`} style={bubble.style} {...bubble.events} onClick={()=>{if(bubble.clicked())chat.open();}}><MessageCircle size={23}/>{chat.unread&&<span className="chat-unread-dot"/>}</button>}
 {isChatOpen&&<ChatInputBoundary>{chat.expanded?<Suspense fallback={<div className="chat-loading" role="status">Đang mở cộng đồng…</div>}><Community isOpen onToggle={chat.close} onCompact={chat.compact}/></Suspense>:<div ref={root} style={geometry.full?{height:geometry.height,top:window.visualViewport?.offsetTop||0}:undefined} className={`chat-surface${activeGameId?' chat-in-game':''}${geometry.full?' chat-fullscreen':''}`}>
 <section data-readability="off" ref={section} role={geometry.full?'dialog':'region'} aria-modal={geometry.full||undefined} aria-label="Chat nổi" className={`chat-floating-panel${large?' chat-panel-large':''}`} style={geometry.full?undefined:{left:position?.x??geometry.left,top:position?.y??(activeGameId?80:undefined),bottom:position?undefined:activeGameId?undefined:82,maxHeight:geometry.height-(position?.y??(activeGameId?80:100))-16}}>
  <header className="chat-panel-header"><span className="chat-drag-handle" {...(geometry.full?{}:panelDrag.events)}>Chat · {title}</span><button type="button" aria-label="Về vị trí mặc định" onClick={()=>{panelDrag.reset();bubble.reset();}}><Pin size={16}/></button><button type="button" aria-label="Tăng hoặc giảm khung chat" onClick={()=>setLarge(v=>!v)}><Scaling size={17}/></button><button type="button" aria-label="Phóng lớn chat và bạn bè" onClick={chat.expand}><Maximize2 size={17}/></button><button type="button" aria-label="Thu chat về bubble" onClick={chat.close}><Minus size={20}/></button></header>
  <nav className="chat-channel-tabs" aria-label="Kênh chat">{tabs.map(t=><button type="button" key={t.label} aria-pressed={channel.scope===t.channel.scope} onClick={()=>chat.select(t.channel)}>{t.label}{chat.store.state(t.channel).unread.length>0&&<span className="chat-tab-dot" aria-label="Có tin chưa đọc"/>}</button>)}<button type="button" onClick={()=>{chat.select({scope:'inbox',target:''});chat.expand();}}>Inbox{chat.store.state({scope:'inbox',target:''}).unread.length>0&&<span className="chat-tab-dot" aria-label="Có tin chưa đọc"/>}</button></nav>
  {activeGameId&&<p className="chat-context-note">{chat.room?.unavailable|| (roomChannel?'Trận vẫn đang diễn ra.':'Kênh Game dành cho mọi người chơi game này.')}</p>}
  <SocialChatThread key={`${channel.scope}:${channel.target}`} scope={channel.scope} target={channel.target} channel={channel}/>
  <footer className="chat-panel-footer"><label><input type="checkbox" checked={chat.speechEnabled} onChange={e=>chat.setSpeechEnabled(e.target.checked)}/> Lời nổi cạnh avatar</label></footer>
 </section></div>}</ChatInputBoundary>}
 </>;
}
