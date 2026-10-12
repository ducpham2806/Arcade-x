import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useGame } from '../context/GameContext';
import { Gamepad2, LogIn, UserPlus } from 'lucide-react';
export function AccountEntry() {
  const { isGuest, setAuthModalMode, continueAsGuest, notice, dismissNotice } = useAuth();
  const { setActiveModal } = useGame();
  const [dismissed, setDismissed] = useState(() => sessionStorage.getItem('arcadex_guest_entry_dismissed') === 'true');
  const open = (mode: 'login' | 'register') => { setAuthModalMode(mode); setActiveModal('auth'); };
  return <div className="arcade-account-entry w-full max-w-7xl mx-auto px-3 sm:px-6">
    {notice && <div role="status" className="my-3 rounded-xl border border-indigo-500/30 bg-indigo-500/10 p-3 flex justify-between items-start gap-3 text-sm text-indigo-200"><span>{notice}</span><button type="button" onClick={dismissNotice} aria-label="Đóng thông báo" className="px-2 font-bold">×</button></div>}
    {isGuest && !dismissed && <section aria-label="Chọn cách chơi" className="arcade-account-panel my-4 rounded-2xl bg-gradient-to-r from-indigo-950/50 to-[#12121d] border border-indigo-500/25 p-4 sm:p-5">
      <h2 className="font-bold text-white text-lg">Chơi theo cách của bạn</h2>
      <p className="mt-1 text-sm text-slate-400">Chơi ngay như khách. Đăng ký để giữ tiến trình trong tài khoản của bạn.</p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mt-4">
        <button id="btn-entry-guest" type="button" onClick={() => { setDismissed(true); sessionStorage.setItem('arcadex_guest_entry_dismissed','true'); void continueAsGuest(); }} className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 py-3 font-bold text-white"><Gamepad2 size={18}/>Chơi như khách</button>
        <button id="btn-entry-login" type="button" onClick={() => open('login')} className="flex items-center justify-center gap-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 py-3 font-semibold text-slate-200"><LogIn size={18}/>Đăng nhập</button>
        <button id="btn-entry-register" type="button" onClick={() => open('register')} className="flex items-center justify-center gap-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 py-3 font-semibold text-slate-200"><UserPlus size={18}/>Đăng ký</button>
      </div>
    </section>}
  </div>;
}
