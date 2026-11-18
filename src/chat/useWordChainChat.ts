import {useMemo} from 'react';
import type {WordChainClient} from '../games/word-chain/online-client';
import {useChatRoom} from './ChatContext';
import type {ChatTransport} from './chat-store';
import type {SocialMessage} from '../services/social';
export function useWordChainChat(client:WordChainClient){
 const room=client.snapshot;
 const transport=useMemo<ChatTransport>(()=>{
  const messages=():SocialMessage[]=>(client.snapshot?.id===room?.id?client.snapshot?.chat||[]:[]).map(m=>({id:m.id,sender:m.sender,text:m.text,created_at:new Date(m.at).toISOString(),profile:{id:m.sender,username:m.name,avatar:'🎮',level:0,bio:'',favorite:'',online:true}}));
  return {read:async()=>messages(),subscribe:receive=>client.subscribe(()=>receive(messages())),send:async text=>{if(client.snapshot?.id!==room?.id)throw new Error('Phòng chat đã đổi.');const pending=client.pending;if(pending?.type==='command'&&pending.command.type==='chat'&&pending.command.text===text){if(!await client.retry())throw new Error(client.error||client.notice||'Chưa xác nhận gửi tin.');return;}if(client.busy||client.pending)throw new Error('Đợi thao tác trong trận hoàn tất rồi gửi tin.');if(!await client.command({type:'chat',text}))throw new Error(client.error||client.notice||'Chưa gửi được tin nhắn.');}};
 },[client,room?.id]);
 useChatRoom(room&&room.status!=='closed'&&!['NOT_MEMBER','LEFT_ROOM','NOT_FOUND'].includes(client.lastErrorCode)?{id:'word-chain:'+room.id,selfId:room.roster.find(p=>p.seat===room.seat)?.chatId||'',players:room.roster.filter(p=>p.present).map(p=>({id:p.chatId,name:p.name})),transport,unavailable:room.chatVersion===1?undefined:'Máy chủ Nối Từ chưa hỗ trợ chat trận. Bạn vẫn có thể dùng kênh Game.'}:null);
 return room?Object.fromEntries(room.roster.map(p=>[p.seat,p.chatId])):{};
}
