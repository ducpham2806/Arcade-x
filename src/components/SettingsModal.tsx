import {audioManager} from '../services/audio';
import React,{useState} from 'react';
import {X,Download,RefreshCw} from 'lucide-react';
import {useGame} from '../context/GameContext';
import {hapticService} from '../services/haptics';
import {CURRENT_APP_VERSION,isAutoUpdateEnabled,setAutoUpdateEnabled} from '../services/updateService';
import {checkForUpdate} from '../services/pwaLifecycle';
import {useDialogFocus} from '../launcher/useDialogFocus';
export const SettingsModal:React.FC=()=>{
 const {setActiveModal,isSoundMuted,toggleSound,soundVolume,setSoundVolume,isMusicMuted,toggleMusic,musicVolume,setMusicVolume}=useGame();
 const [automatic,setAutomatic]=useState(isAutoUpdateEnabled);const [vibration,setVibration]=useState(()=>hapticService.isEnabled());const [message,setMessage]=useState('');const [checking,setChecking]=useState(false);
 const close=()=>setActiveModal('none');const ref=useDialogFocus(close);
 return <div id="settings-modal-overlay" className="launcher-dialog-overlay" onClick={close}><section className="launcher-dialog" role="dialog" aria-modal="true" aria-labelledby="settings-title" ref={ref} tabIndex={-1} onClick={e=>e.stopPropagation()}>
  <header><div><p className="launcher-eyebrow">THEO CÁCH CỦA BẠN</p><h2 id="settings-title">Cài đặt</h2></div><button className="launcher-icon" aria-label="Đóng cài đặt" onClick={close}><X size={21}/></button></header>
  <div className="launcher-dialog-body settings-body">
   <section><h3>Âm thanh</h3><button type="button" className="launcher-secondary" onClick={()=>audioManager.setAllMuted(true)}>Tắt toàn bộ âm thanh</button><div className="setting-row"><div><strong>Hiệu ứng game</strong><p>Âm thanh khi chạm, ghi điểm và hoàn thành ván.</p></div><button id="btn-settings-toggle-sound" role="switch" aria-checked={!isSoundMuted} aria-label="Hiệu ứng game" onClick={toggleSound} className="setting-switch">{isSoundMuted?'Tắt':'Bật'}</button></div><label className="setting-slider">Âm lượng hiệu ứng <input aria-label="Âm lượng hiệu ứng" type="range" min="0" max="1" step="0.05" value={soundVolume} onChange={e=>setSoundVolume(Number(e.target.value))}/><span>{Math.round(soundVolume*100)}%</span></label>
    <div className="setting-row"><div><strong>Nhạc nền</strong><p>Nhạc trong launcher và trò chơi.</p></div><button role="switch" aria-checked={!isMusicMuted} aria-label="Nhạc nền" onClick={toggleMusic} className="setting-switch">{isMusicMuted?'Tắt':'Bật'}</button></div><label className="setting-slider">Âm lượng nhạc <input aria-label="Âm lượng nhạc" type="range" min="0" max="1" step="0.05" value={musicVolume} onChange={e=>setMusicVolume(Number(e.target.value))}/><span>{Math.round(musicVolume*100)}%</span></label>
   </section>
   <section><h3>Trải nghiệm</h3><div className="setting-row"><div><strong>Rung phản hồi</strong><p>{hapticService.isSupported()?'Phản hồi nhẹ khi tương tác.':'Trình duyệt này không hỗ trợ rung.'}</p></div><button className="setting-switch" role="switch" aria-label="Rung phản hồi" aria-checked={vibration} disabled={!hapticService.isSupported()} onClick={()=>{const next=!vibration;setVibration(next);hapticService.setEnabled(next);}}>{vibration?'Bật':'Tắt'}</button></div><p className="launcher-small">Hiệu ứng launcher tự giảm khi bạn bật “Giảm chuyển động” trong cài đặt thiết bị.</p></section>
   <section><h3>Ứng dụng & cập nhật</h3><div className="setting-row"><div><strong>Tự cập nhật lúc khởi động</strong><p>Bản cập nhật không cắt ngang ván đang chơi.</p></div><button className="setting-switch" role="switch" aria-label="Tự cập nhật" aria-checked={automatic} onClick={()=>{setAutoUpdateEnabled(!automatic);setAutomatic(!automatic);}}>{automatic?'Bật':'Tắt'}</button></div><div className="flex flex-wrap gap-3 mt-4"><button className="launcher-secondary" disabled={checking} onClick={async()=>{setChecking(true);try{await checkForUpdate();setMessage(window.__arcadex_sw_update_pending?'Có bản cập nhật mới. Về thư viện để cài đặt.':'Bạn đang dùng bản mới nhất có sẵn.');}catch{setMessage('Chưa kiểm tra được cập nhật. Hãy thử lại khi có mạng.');}finally{setChecking(false);}}}><RefreshCw size={17}/>{checking?'Đang kiểm tra…':'Kiểm tra cập nhật'}</button><button className="launcher-secondary" onClick={()=>window.dispatchEvent(new CustomEvent('arcadex:trigger_pwa_install'))}><Download size={17}/>Cài ứng dụng</button></div><p role="status" className="mt-3 text-sm">{message}</p></section>
  </div><footer><p className="launcher-small">ArcadeX · {CURRENT_APP_VERSION}. Thay đổi được lưu tự động trên thiết bị.</p></footer>
 </section></div>;
};

