import React, { useState } from 'react';
import { AuthService } from '../services/auth';
import type { RecoveryState } from '../services/authRecovery';

export function PasswordRecoveryScreen({ state, onComplete, onCancel }: { state: RecoveryState; onComplete: () => Promise<void>; onCancel: () => Promise<void> }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const input = 'w-full rounded-xl border border-white/15 bg-black/30 px-4 py-3 text-white focus:border-lime-300 outline-none';
  const submit = async (event: React.FormEvent) => {
    event.preventDefault(); setError(''); setMessage('');
    if (state.status === 'ready' && password !== confirm) { setError('Mật khẩu xác nhận không trùng khớp.'); return; }
    setBusy(true);
    try {
      const result = state.status === 'ready' ? await AuthService.updateRecoveryPassword(password) : await AuthService.requestPasswordReset(email);
      if (!result.success) setError(result.error || 'Phiên tài khoản đã thay đổi. Hãy thử lại.');
      else { setMessage(result.message || 'Đã gửi yêu cầu.'); if (state.status === 'ready') { setPassword(''); setConfirm(''); await onComplete(); } }
    } finally { setBusy(false); }
  };
  return <main id="password-recovery-screen" className="platform-ui min-h-dvh bg-[#080b12] text-slate-200 flex items-center justify-center p-4 sm:p-8">
    <section className="w-full max-w-lg rounded-3xl border border-white/10 bg-[#101621] p-6 sm:p-10 space-y-5" aria-labelledby="recovery-title">
      <p className="text-xs font-bold tracking-widest text-lime-300">ARCADEX · TÀI KHOẢN</p>
      <h1 id="recovery-title" className="text-2xl font-bold text-white">{state.status === 'ready' ? 'Đặt mật khẩu mới' : 'Khôi phục tài khoản'}</h1>
      {state.status === 'pending' ? <p role="status">Đang xác minh link khôi phục…</p> : <form onSubmit={submit} className="space-y-4">
        {state.status === 'ready' ? <>
          <p className="text-sm text-slate-400">Dùng ít nhất 8 ký tự. Tiến trình sẽ được tải sau khi đổi mật khẩu.</p>
          <div><label htmlFor="input-recovery-password" className="block text-sm mb-2">Mật khẩu mới</label><input id="input-recovery-password" type="password" autoComplete="new-password" minLength={8} required disabled={busy} className={input} value={password} onChange={e => setPassword(e.target.value)}/></div>
          <div><label htmlFor="input-recovery-confirm" className="block text-sm mb-2">Nhập lại mật khẩu mới</label><input id="input-recovery-confirm" type="password" autoComplete="new-password" minLength={8} required disabled={busy} className={input} value={confirm} onChange={e => setConfirm(e.target.value)}/></div>
        </> : <>
          <p role="alert" className="text-sm text-rose-300">{state.error}</p>
          <label htmlFor="input-recovery-email" className="block text-sm">Email tài khoản</label><input id="input-recovery-email" type="email" autoComplete="email" required disabled={busy} className={input} value={email} onChange={e => setEmail(e.target.value)}/>
        </>}
        <button id="btn-recovery-submit" disabled={busy} className="simple-primary-button w-full py-3 justify-center">{busy ? 'Đang xử lý…' : state.status === 'ready' ? 'Lưu mật khẩu mới' : 'Yêu cầu link mới'}</button>
      </form>}
      {error && <p role="alert" className="text-sm text-rose-300">{error}</p>}{message && <p role="status" className="text-sm text-emerald-300">{message}</p>}
      <button id="btn-recovery-cancel" disabled={busy} onClick={() => void onCancel()} className="simple-secondary-button w-full py-3 justify-center">Quay về đăng nhập</button>
    </section>
  </main>;
}
