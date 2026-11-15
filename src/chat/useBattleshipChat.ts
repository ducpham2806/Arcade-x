import {useMemo} from 'react';
import type {RoomClient} from '../games/battleship/online-client';
import {useChatRoom} from './ChatContext';
import type {ChatTransport} from './chat-store';
import type {SocialMessage} from '../services/social';

export function useBattleshipChat(client:RoomClient|null){
 const room=client?.snapshot;
 const transport=useMemo<ChatTransport>(()=>{
  const messages=():SocialMessage[]=>(client?.snapshot?.id===room?.id?client?.snapshot?.chat||[]:[]).map(m=>({id:m.id,sender:m.sender,text:m.text,created_at:new Date(m.at).toISOString(),profile:{id:m.sender,username:m.name,avatar:'⚓',level:0,bio:'',favorite:'',online:true}}));
  return {read:async()=>messages(),subscribe:receive=>client?.subscribe(()=>receive(messages()))||(()=>{}),send:async text=>{
   if(!client||client.snapshot?.id!==room?.id)throw new Error('Phòng chat đã đổi.');
   const pending=client.pending;
   if(pending?.type==='command'&&pending.command.type==='chat'&&pending.command.text===text){if(!await client.retry())throw new Error(client.notice||'Chưa xác nhận gửi tin.');return;}
   if(client.busy||pending)throw new Error('Đợi thao tác trong trận hoàn tất rồi gửi tin.');
   if(!await client.command({type:'chat',text}))throw new Error(client.notice||'Chưa gửi được tin nhắn.');
  }};
 },[client,room?.id]);
 useChatRoom(room&&room.status!=='closed'&&!room.left&&!['NOT_MEMBER','LEFT_ROOM','NOT_FOUND','AUTH_REQUIRED','UNAUTHORIZED'].includes(client?.lastErrorCode||'')?{id:'battleship:'+room.id,selfId:room.roster.find(p=>p.seat===room.seat)?.chatId||'',players:room.roster.filter(p=>p.occupied&&!p.left).map(p=>({id:p.chatId,name:`Thuyền trưởng ${p.seat}`,avatar:'⚓'})),transport,unavailable:room.chatVersion===1?undefined:'Máy chủ Hải Chiến chưa hỗ trợ chat trận. Bạn vẫn có thể dùng kênh Game.'}:null);
}
