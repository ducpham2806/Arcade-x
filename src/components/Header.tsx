import React from 'react';
import { Gamepad2, Settings, Download } from 'lucide-react';
import { AccountAvatar } from './AccountAvatar';
import { usePlayer } from '../context/PlayerContext';
import { useGame } from '../context/GameContext';

export const Header: React.FC = () => {
  const { profile } = usePlayer();
  const { setActiveModal } = useGame();
  return <header className="arcade-platform-header simple-launcher-header sticky top-0 z-50 border-b border-white/10 backdrop-blur-xl">
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-3 flex items-center justify-between gap-3">
      <button id="btn-header-home" type="button" aria-label="ArcadeX — thư viện game" className="flex items-center gap-2.5 text-white font-black tracking-wider" onClick={() => { setActiveModal('none'); window.dispatchEvent(new CustomEvent('arcadex:filter_games', { detail: 'Tất Cả' })); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
        <span className="rounded-xl p-2 bg-lime-300 text-slate-950"><Gamepad2 size={22}/></span><span>ARCADE<span className="text-lime-300">X</span></span>
      </button>
      <span className="hidden md:block text-sm text-slate-400">Chọn game. Bắt đầu chơi.</span>
      <div className="flex items-center gap-1.5 sm:gap-2">
        <button id="btn-header-install-pwa" type="button" aria-label="Cài ứng dụng" title="Cài ứng dụng" onClick={() => window.dispatchEvent(new CustomEvent('arcadex:trigger_pwa_install'))} className="simple-icon-button hidden sm:flex"><Download size={18}/></button>
        <button id="btn-header-settings" type="button" aria-label="Cài đặt" title="Cài đặt" onClick={() => setActiveModal('settings')} className="simple-icon-button"><Settings size={18}/></button>
        <button id="btn-header-profile" type="button" aria-label="Tài khoản của bạn" onClick={() => setActiveModal('profile')} className="simple-account-button flex items-center gap-2 px-3 py-2 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10">
          <span aria-hidden="true" className="text-lg w-6 h-6 inline-flex items-center justify-center shrink-0"><AccountAvatar avatar={profile.avatar}/></span><span className="text-sm font-semibold max-w-[110px] sm:max-w-[180px] truncate">{profile.username}</span>
        </button>
      </div>
    </div>
  </header>;
};
