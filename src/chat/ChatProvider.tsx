import React,{useEffect,useMemo,useRef,useState,useSyncExternalStore} from 'react';
import {usePlayer} from '../context/PlayerContext';
import {useGameSession,useLauncherUi} from '../context/GameContext';
import {ChatContext,type ChatContextValue,type ChatGame,type ChatRoom} from './ChatContext';
import {ChatStore,channelKey,type Channel} from './chat-store';
import {releaseChatInput} from './input';
export function ChatProvider({children,previewGame}:{children:React.ReactNode;previewGame?:ChatGame}){
 const {profile}=usePlayer(),{activeGameId}=useGameSession();
 return <OwnerChatProvider key={profile.id} owner={profile.id} activeGameId={previewGame?.id??activeGameId} previewGame={previewGame}>{children}</OwnerChatProvider>;
}
function OwnerChatProvider({owner,activeGameId,previewGame,children}:{owner:string;activeGameId:string|null;previewGame?:ChatGame;children:React.ReactNode}){
 const {isChatOpen,openChat,toggleChat}=useLauncherUi();
 const [room,setRoom]=useState<ChatRoom|null>(null),[selected,select]=useState<Channel|null>(null),[expanded,setExpanded]=useState(false),[speechEnabled,setSpeechEnabled]=useState(true);
 const store=useMemo(()=>new ChatStore(owner),[owner]);useSyncExternalStore(store.subscribe,store.snapshot,store.snapshot);
 const previous=useRef<string|null|undefined>(undefined);
 const base:Channel=room&&!room.unavailable?{scope:'room',target:room.id,selfId:room.selfId,transport:room.transport,maxLength:room.transport?500:1000}:activeGameId?{scope:'game',target:activeGameId}:{scope:'global',target:''};
 const channel=selected||base;
 useEffect(()=>{if(previous.current===activeGameId)return;previous.current=activeGameId;select(null);setExpanded(false);if(activeGameId){if(isChatOpen)toggleChat();}else if(!isChatOpen)openChat();},[activeGameId]);
 useEffect(()=>{select(null);const previous=room?{scope:'room' as const,target:room.id}:null;return()=>{if(previous)store.forget(previous);};},[room?.id,store]);
 useEffect(()=>store.retain(base),[store,channelKey(base),base.transport]);
 useEffect(()=>selected&&selected.scope!=='inbox'?store.retain(selected):undefined,[store,selected?channelKey(selected):'',selected?.transport]);
 useEffect(()=>store.retain({scope:'inbox',target:''}),[store]);
 useEffect(()=>()=>store.dispose(),[store]);
 const close=()=>{if(selected?.scope==='inbox')select(null);setExpanded(false);if(isChatOpen)toggleChat();requestAnimationFrame(()=>document.querySelector<HTMLElement>('.game-chat-bubble,.chat-launcher-bubble')?.focus({preventScroll:true}));};
 const open=(c?:Channel)=>{releaseChatInput();if(c)select(c);if(!isChatOpen)openChat();};
 const value:ChatContextValue={activeGameId,previewGame,store,room,setRoom,channel,select,expanded,expand:()=>{releaseChatInput();setExpanded(true);if(!isChatOpen)openChat();},compact:()=>{if(selected?.scope==='inbox')select(null);setExpanded(false);},open,close,unread:store.unread(),speechEnabled,setSpeechEnabled};
 return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}
