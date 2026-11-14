import React from 'react';
import {createRoot} from 'react-dom/client';
import {FixtureProvider,useGameSession} from './fixture-context';
import {ChatProvider} from '../../src/chat/ChatProvider';
import {useChatRoom} from '../../src/chat/ChatContext';
import {ChatShell} from '../../src/chat/ChatShell';
import {GameChatBubble} from '../../src/components/GameChatBubble';
function Scene(){const {activeGameId}=useGameSession();useChatRoom(activeGameId?{id:'review-room',selfId:'review-A',players:[{id:'review-B',name:'Bình',avatar:'🐱'}]}:null);
 return <><div id={activeGameId?'game-wrapper-viewport':'fixture-lobby'}><header className="fixture-game-header"><span>{activeGameId==='tank-clash'?'Tank Clash':activeGameId?'Caro PvP':'ArcadeX · Thư viện game'}</span>{activeGameId&&<GameChatBubble/>}</header>{activeGameId?<div className="fixture-stage"><div className="fixture-player"><span data-chat-player="review-B">🐱 Bình</span><span>01:42 · Trận vẫn chạy</span></div><div className="arcade-board" data-chat-protect="true">{activeGameId==='tank-clash'?'Đấu trường · vùng điều khiển':'Bàn Caro · vùng chơi'}</div></div>:<div className="fixture-library">{['Caro','Cờ vua','Tank Clash','Nối Từ'].map(t=><div key={t}>{t}<small>Chơi cùng bạn</small></div>)}</div>}</div><ChatShell/></>;
}
createRoot(document.getElementById('root')!).render(<React.StrictMode><FixtureProvider><ChatProvider><Scene/></ChatProvider></FixtureProvider></React.StrictMode>);
