import React from 'react';
import {MessageCircle,Pin} from 'lucide-react';
import { useLauncherUi } from '../context/GameContext';
import './social.css';
import {useChat} from '../chat/ChatContext';
import {useChatDrag} from '../chat/useChatDrag';
import {useGameSession} from '../context/GameContext';
import {usePlayer} from '../context/PlayerContext';
/** Starts in the reserved toolbar slot, away from the board and touch controls. */
export function GameChatBubble(){
 const {openChat,isChatOpen} = useLauncherUi();
 const chat=useChat(),{activeGameId}=useGameSession(),{profile}=usePlayer();
 const drag=useChatDrag(`${profile.id}:${activeGameId}`,true);
 return <span className="game-chat-dock" data-chat-ui="true">
  {drag.position&&<button className="game-chat-redock" type="button" aria-label="Đưa chat về thanh công cụ" title="Đưa chat về thanh công cụ" onClick={drag.reset}><Pin size={15}/></button>}
  <button type="button" className={`game-chat-bubble${drag.position?' floating':''}`} aria-label={`Mở chat${chat?.unread?' · Có tin chưa đọc':''} · Kéo để di chuyển`} aria-expanded={isChatOpen} title="Chat · Kéo để di chuyển · Phím mũi tên đổi vị trí" style={drag.style} {...drag.events}
   onClick={e=>{e.stopPropagation();if(drag.clicked()){if(chat){if(isChatOpen)chat.close();else chat.open();}else openChat();}}}
  ><MessageCircle size={19}/>{chat?.unread&&<span className="chat-unread-dot"/>}</button>
 </span>;
}
