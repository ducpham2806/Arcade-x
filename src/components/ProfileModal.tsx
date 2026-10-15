import {ProfileDetails} from './ProfileDetails';
import React, { useEffect, useState } from 'react';
import {useDialogFocus} from '../launcher/useDialogFocus';
import { LogIn, UserPlus, LogOut, Check, Settings } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import { useAuth } from '../context/AuthContext';
import { useGame } from '../context/GameContext';
import { AccountAvatar } from './AccountAvatar';
import { CloseButton } from './common/CloseButton';

const AVATARS = ['🎮', '🐱', '🦊', '🤖', '🚀', '⚡'];
export const ProfileModal: React.FC = () => {
  const { profile, updateUsername, updateAvatar } = usePlayer();
  const { currentUser, isLoggedIn, logout, setAuthModalMode, saveIdentity, requestPasswordReset } = useAuth();
  const { setActiveModal } = useGame();
  const [name, setName] = useState(profile.username);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const close = () => setActiveModal('none');
  const dialogRef=useDialogFocus(close);
  useEffect(() => { const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setActiveModal('none'); }; window.addEventListener('keydown', handler); return () => window.removeEventListener('keydown', handler); }, [setActiveModal]);
  const save = async (nextName: string, nextAvatar: string) => {
    if (busy) return; setBusy(true); setMessage('');
    try {
      let savedName = nextName;
      let savedAvatar = nextAvatar;
      if (isLoggedIn) {
        const result = await saveIdentity(nextName, nextAvatar);
        if (!result.success) { setMessage(result.error || 'Chưa lưu được hồ sơ.'); return; }
        savedName = result.user?.username || nextName;
        savedAvatar = result.user?.avatar || nextAvatar;
      }
      updateUsername(savedName); updateAvatar(savedAvatar);
      if (nextName === name.trim()) setName(savedName);
      setMessage('Đã lưu hồ sơ.');
    } finally { setBusy(false); }
  };
  const openAuth = (mode: 'login' | 'register') => { setAuthModalMode(mode); setActiveModal('auth'); };
  return <div className="platform-ui arcadex-modal-overlay" onClick={close}>
    <section ref={dialogRef} tabIndex={-1} id="profile-modal" role="dialog" aria-modal="true" aria-labelledby="profile-title" className="arcadex-modal-container simple-profile-panel p-4 sm:p-6" onClick={e => e.stopPropagation()}>
      <header className="flex items-center justify-between gap-3 pb-4 border-b border-white/10 shrink-0">
        <div><h2 id="profile-title" className="text-xl font-bold text-white">Tài khoản của bạn</h2><p className="text-sm text-slate-400 mt-1">Thông tin cơ bản để chơi và lưu tiến trình.</p></div>
        <CloseButton id="btn-close-profile" onClose={close}/>
      </header>
      <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar py-6">
        <div className="max-w-xl mx-auto space-y-6">
          <div className="flex items-center gap-4"><div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/15 grid place-items-center text-3xl" aria-label="Ảnh đại diện"><AccountAvatar avatar={profile.avatar}/></div><div className="min-w-0"><h3 className="font-bold text-lg text-white truncate">{profile.username}</h3><p className="text-sm text-slate-400 break-all">{isLoggedIn ? currentUser?.email : 'Đang chơi như khách'}</p></div></div>
          <p className="rounded-xl p-4 bg-indigo-500/10 border border-indigo-500/20 text-sm text-slate-300">{isLoggedIn ? 'Tiến trình được lưu trên thiết bị và đồng bộ với tài khoản khi có kết nối.' : 'Bạn có thể chơi ngay. Tiến trình của khách được lưu trên trình duyệt này; đăng ký để lưu vào tài khoản.'}</p>
          <form onSubmit={e => { e.preventDefault(); void save(name.trim(), profile.avatar); }} className="space-y-3">
            <label htmlFor="profile-name" className="block text-sm font-semibold text-slate-200">Tên hiển thị</label>
            <div className="flex gap-2"><input id="profile-name" value={name} onChange={e => setName(e.target.value)} minLength={3} maxLength={24} disabled={busy} required className="min-w-0 flex-1 rounded-xl px-3 py-2.5 border border-white/15 bg-slate-950 text-white"/><button id="btn-save-profile-name" type="submit" disabled={busy} className="simple-primary-button px-4"><Check size={17}/><span>Lưu</span></button></div>
            {message && <p role="status" className="text-sm text-indigo-200">{message}</p>}
          </form>
          <ProfileDetails/>
          <fieldset><legend className="text-sm font-semibold text-slate-200 mb-3">Ảnh đại diện</legend><div className="flex flex-wrap gap-2">{AVATARS.map(avatar => <button key={avatar} type="button" aria-label={`Chọn ảnh đại diện ${avatar}`} aria-pressed={profile.avatar === avatar} disabled={busy} onClick={() => { void save(profile.username, avatar); }} className={`w-11 h-11 rounded-xl text-xl border ${profile.avatar === avatar ? 'border-lime-300 bg-lime-300/10' : 'border-white/10 bg-white/5 hover:bg-white/10'}`}>{avatar}</button>)}</div></fieldset>
          <div className="flex flex-wrap gap-3 pt-4 border-t border-white/10">
            {isLoggedIn ? <button id="btn-logout-profile" type="button" disabled={busy} className="simple-secondary-button" onClick={async () => { setBusy(true); try { const result = await logout(); if (result.success) setActiveModal('none'); else setMessage(result.error || 'Chưa đăng xuất được.'); } finally { setBusy(false); } }}><LogOut size={17}/>{busy ? 'Đang đăng xuất…' : 'Đăng xuất'}</button> : <><button id="btn-profile-login" type="button" className="simple-primary-button" onClick={() => openAuth('login')}><LogIn size={17}/>Đăng nhập</button><button id="btn-profile-register" type="button" className="simple-secondary-button" onClick={() => openAuth('register')}><UserPlus size={17}/>Đăng ký</button></>}
            <>{isLoggedIn && currentUser?.email && <button id="btn-change-password-email" type="button" disabled={busy} className="simple-secondary-button" onClick={async () => { setBusy(true); try { const result = await requestPasswordReset(currentUser.email!); setMessage(result.message || result.error || "Chưa gửi được email."); } finally { setBusy(false); } }}>Gửi email đổi mật khẩu</button>}</>
            <button id="btn-profile-settings" type="button" className="simple-secondary-button" onClick={() => setActiveModal('settings')}><Settings size={17}/>Cài đặt</button>
          </div>
        </div>
      </div>
      <footer className="shrink-0 border-t border-white/10 pt-4"><button type="button" onClick={close} className="simple-primary-button w-full justify-center"><span>Quay lại chơi game</span></button></footer>
    </section>
  </div>;
};

