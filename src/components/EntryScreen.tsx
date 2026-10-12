import React, { useState } from 'react';
import { Gamepad2, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const EntryScreen: React.FC<{ onEnter: () => void }> = ({ onEnter }) => {
  const { currentUser, login, register, continueAsGuest, saveIdentity, authModalMode, logout } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>(authModalMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState('🎮');
  const [keep, setKeep] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const setup = !!currentUser && !currentUser.profileCompleted;
  const run = async (operation: () => Promise<{ success: boolean; error?: string; needsEmailConfirmation?: boolean; message?: string; user?: { profileCompleted?: boolean } }>, enter: boolean) => {
    setBusy(true); setError(''); setMessage('');
    try {
      const result = await operation();
      if (!result.success) setError(result.error || 'Chưa thực hiện được. Hãy thử lại.');
      else if (result.needsEmailConfirmation) { setMessage(result.message || 'Kiểm tra email để xác nhận tài khoản.'); setMode('login'); setPassword(''); setConfirm(''); }
      else if (enter && (!result.user || result.user.profileCompleted)) onEnter();
    } catch { setError('Chưa kết nối được máy chủ. Hãy thử lại.'); }
    finally { setBusy(false); }
  };
  const input = 'w-full rounded-xl border border-white/15 bg-black/30 px-4 py-3 text-white outline-none focus:border-lime-300';
  return <main id="auth-entry-screen" className="entry-screen min-h-dvh bg-[#080b12] text-slate-200 flex items-center justify-center p-4 sm:p-8">
    <section className="entry-shell w-full max-w-5xl grid md:grid-cols-2 rounded-3xl border border-white/10 overflow-hidden shadow-2xl">
      <div className="entry-brand p-5 md:p-10 flex flex-col justify-between bg-gradient-to-br from-indigo-950 via-[#151d30] to-[#0e1723]">
        <div className="flex items-center gap-3 font-black tracking-wider text-xl text-white"><Gamepad2 className="text-lime-300" size={32}/>ARCADEX</div>
        <div className="mt-3 mb-0 md:my-16"><p className="text-lime-300 text-xs font-bold tracking-widest uppercase mb-0 md:mb-4">Chọn game. Bắt đầu chơi.</p><h1 className="sr-only md:not-sr-only text-3xl sm:text-5xl font-black text-white leading-tight">Một chút rảnh.<br/>Một cuộc vui.</h1><p className="hidden md:block mt-5 text-slate-400 leading-relaxed">Đăng nhập để mang theo tiến trình trên nhiều thiết bị. Hoặc chọn chơi khách để bắt đầu ngay.</p></div>
        <p className="hidden md:block text-xs text-slate-500">Thư viện game · Máy tính & điện thoại</p>
      </div>
      <div className="bg-[#101621] p-6 sm:p-10 space-y-5">
        <h2 className="text-2xl font-bold text-white">{setup ? 'Bạn muốn được gọi là gì?' : currentUser ? 'Chào mừng trở lại' : 'Bắt đầu với ArcadeX'}</h2>
        {setup ? <form className="space-y-4" onSubmit={e => { e.preventDefault(); void run(() => saveIdentity(name, avatar), true); }}>
          <p className="text-sm text-slate-400">Thêm một cái tên và ảnh đại diện để bạn bè nhận ra bạn. Bạn có thể sửa sau trong Tài khoản.</p>
          <p className="text-sm text-slate-300 break-all">{currentUser.email}</p>
          <label className="block text-sm" htmlFor="input-setup-name">Tên hiển thị</label><input id="input-setup-name" className={input} value={name} onChange={e => setName(e.target.value)} minLength={3} maxLength={24} autoComplete="nickname" required disabled={busy}/>
          <p className="text-xs text-slate-500">3–24 ký tự. Tên không phân biệt chữ hoa/chữ thường.</p>
          <fieldset disabled={busy}><legend className="mb-2 text-sm">Ảnh đại diện</legend><div className="grid grid-cols-3 min-[370px]:grid-cols-6 gap-2">{['🎮','🐱','🦊','🤖','🚀','⚡'].map(v => <button type="button" key={v} aria-label={`Chọn ảnh đại diện ${v}`} aria-pressed={avatar===v} onClick={() => setAvatar(v)} className={`text-xl rounded-xl border py-2 ${avatar===v?'border-lime-300 bg-lime-300/10':'border-white/10'}`}>{v}</button>)}</div></fieldset>
          <button id="btn-complete-profile" disabled={busy} className="simple-primary-button w-full justify-center py-3">{busy ? 'Đang kiểm tra và lưu…' : 'Lưu hồ sơ & vào chơi'}<ArrowRight size={18}/></button>
        </form> : currentUser ? <div className="space-y-4"><p className="text-slate-300">{currentUser.avatar} {currentUser.username}</p><p className="text-sm text-slate-400 break-all">{currentUser.email}</p><button id="btn-entry-continue" onClick={onEnter} className="simple-primary-button w-full justify-center py-3">Vào thư viện game<ArrowRight size={18}/></button><button id="btn-logout-account" disabled={busy} onClick={() => {void run(logout,false);}} className="simple-secondary-button w-full justify-center py-3">Đăng xuất / dùng tài khoản khác</button></div> : <>
          <div className="flex rounded-xl bg-black/30 p-1">{(['login','register'] as const).map(v => <button id={`tab-auth-${v}`} key={v} type="button" onClick={() => {setMode(v);setError('');setMessage('');}} disabled={busy} aria-pressed={mode===v} className={`flex-1 rounded-lg py-2.5 text-sm font-bold ${mode===v?'bg-indigo-600 text-white':'text-slate-400'}`}>{v==='login'?'Đăng nhập':'Đăng ký'}</button>)}</div>
          <form className="space-y-4" onSubmit={e => { e.preventDefault(); if (mode==='register' && password!==confirm) {setError('Mật khẩu xác nhận không trùng khớp.');return;} void run(() => mode==='login' ? login(email,password) : register({ email,password,keepGuestData:keep }),true); }}>
            <div><label className="block text-sm mb-2" htmlFor={mode==='login'?'input-login-identifier':'input-reg-email'}>Email</label><input id={mode==='login'?'input-login-identifier':'input-reg-email'} className={input} type="email" autoComplete="email" required value={email} onChange={e => setEmail(e.target.value)} disabled={busy}/></div>
            <div><label className="block text-sm mb-2" htmlFor={mode==='login'?'input-login-password':'input-reg-password'}>Mật khẩu</label><input id={mode==='login'?'input-login-password':'input-reg-password'} className={input} type="password" minLength={mode==='register'?8:undefined} autoComplete={mode==='login'?'current-password':'new-password'} required value={password} onChange={e => setPassword(e.target.value)} disabled={busy}/></div>
            {mode==='register' && <><div><label className="block text-sm mb-2" htmlFor="input-reg-confirm-password">Nhập lại mật khẩu</label><input id="input-reg-confirm-password" className={input} type="password" autoComplete="new-password" required value={confirm} onChange={e=>setConfirm(e.target.value)} disabled={busy}/></div><label className="flex gap-2 text-xs text-slate-400"><input id="input-keep-guest-data" type="checkbox" checked={keep} onChange={e=>setKeep(e.target.checked)} disabled={busy}/>Giữ tiến trình khách trên thiết bị này</label><p className="text-xs text-slate-500">Ít nhất 8 ký tự. Sau khi xác nhận email và đăng nhập, bạn sẽ đặt tên hiển thị.</p></>}
            <button id={`btn-submit-${mode}`} disabled={busy} className="simple-primary-button py-3 w-full justify-center">{busy?'Đang xử lý…':mode==='login'?'Đăng nhập':'Tạo tài khoản'}<ArrowRight size={18}/></button>
          </form>
        </>}
        {error && <p role="alert" className="text-sm text-rose-300">{error}</p>}{message && <p role="status" className="text-sm text-emerald-300">{message}</p>}
        <div className="border-t border-white/10 pt-4"><button id="btn-auth-play-guest" disabled={busy} type="button" onClick={() => {void run(continueAsGuest,true);}} className="simple-secondary-button w-full justify-center py-3">Chơi như khách</button><p className="mt-3 text-xs text-slate-500 text-center">Tiến trình khách chỉ lưu trên trình duyệt này.</p></div>
      </div>
    </section>
  </main>;
};
