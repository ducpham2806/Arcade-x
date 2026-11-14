import {createContext,useContext,useEffect} from 'react';
import type {ChatStore,Channel,ChatTransport} from './chat-store';
export type ChatPlayer={id:string;name:string;avatar?:string};
export type ChatRoom={id:string;selfId:string;players:ChatPlayer[];transport?:ChatTransport;unavailable?:string};
export type ChatContextValue={store:ChatStore;room:ChatRoom|null;setRoom:(room:ChatRoom|null)=>void;channel:Channel;select:(c:Channel)=>void;expanded:boolean;expand:()=>void;compact:()=>void;open:(c?:Channel)=>void;close:()=>void;unread:boolean;speechEnabled:boolean;setSpeechEnabled:(on:boolean)=>void};
export const ChatContext=createContext<ChatContextValue|null>(null);
export const useChat=()=>useContext(ChatContext);
export function useChatRoom(room:ChatRoom|null){
 const ctx=useChat(),setRoom=ctx?.setRoom;
 const fingerprint=room?JSON.stringify({id:room.id,selfId:room.selfId,players:room.players,unavailable:room.unavailable}):'';
 useEffect(()=>{if(!setRoom||!room)return;setRoom(room);return()=>setRoom(null);},[setRoom,fingerprint,room?.transport]);
}
