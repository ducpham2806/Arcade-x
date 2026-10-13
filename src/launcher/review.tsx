import React from 'react';
import {createRoot} from 'react-dom/client';
import App from '../App';
import {useGame} from '../context/GameContext';
import {useAuth} from '../context/AuthContext';
function ReviewControls(){
 const {setActiveModal,openChat,openGameDetail,openShareModal}=useGame();const {openEntry}=useAuth();
 return <aside className="launcher-review-tools"><span>BẢN DUYỆT UI · Dữ liệu trên thiết bị</span><select aria-label="Xem màn hình launcher" defaultValue="" onChange={e=>{
  const v=e.target.value;e.target.value='';
  if(v==='chat')openChat();else if(v==='detail')openGameDetail('tile-2048');else if(v==='share')openShareModal({type:'score',gameId:'tile-2048',score:2048,title:'Kỷ lục 2048',description:'Kết quả mẫu để duyệt giao diện'});else if(v==='login')openEntry('login');else if(v)setActiveModal(v as any);
 }}><option value="">Xem màn hình…</option><option value="profile">Tài khoản</option><option value="settings">Cài đặt</option><option value="leaderboard">Bảng xếp hạng</option><option value="pvpHistory">Lịch sử PvP</option><option value="detail">Chi tiết game</option><option value="share">Chia sẻ kết quả mẫu</option><option value="chat">Chat</option><option value="login">Đăng nhập</option></select></aside>;
}
createRoot(document.getElementById('root')!).render(<App reviewControls={<ReviewControls/>}/>);
