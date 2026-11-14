import {useEffect,useMemo,useReducer} from 'react';
import type {NetSession} from '../games/tank-clash/net-client';
import {useChatRoom} from './ChatContext';
import type {ChatTransport} from './chat-store';
import type {SocialMessage} from '../services/social';
export function useTankChat(session:NetSession|null){
 const [,render]=useReducer(n=>n+1,0);useEffect(()=>session?.subscribeChat(render),[session]);
 const room=session?.room;
 const transport=useMemo<ChatTransport>(()=>{
  const messages=():SocialMessage[]=>(session?.room&&session.room.code===room?.code?session.room.chat||[]:[]).map(m=>({id:m.id,sender:m.sender,text:m.text,created_at:new Date(m.at).toISOString(),profile:{id:m.sender,username:m.name,avatar:'🎮',level:0,bio:'',favorite:'',online:true}}));
  return {read:async()=>messages(),subscribe:receive=>session?.subscribeChat(()=>receive(messages()))||(()=>{}),send:async text=>{if(!session||session.room?.code!==room?.code)throw new Error('Phòng chat đã đổi.');await session.chat(text);}};
 },[session,room?.code]);
 useChatRoom(room&&session?{id:'tank-clash:'+room.code,selfId:room.seats.find(s=>s.id===session.seat)?.chatId||'',players:room.seats.filter(s=>s.connected&&!s.forfeited).map(s=>({id:s.chatId||'',name:s.name})),transport,unavailable:session.role==='spectator'?'Chế độ xem trận không gửi chat trận.':room.chatVersion===1?undefined:'Máy chủ Tank chưa hỗ trợ chat trận. Bạn vẫn có thể dùng kênh Game.'}:null);
}
