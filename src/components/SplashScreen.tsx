import React, { useEffect, useRef, useState } from 'react';
import { Gamepad2 } from 'lucide-react';
import { CURRENT_APP_VERSION, isAutoUpdateEnabled, setStoredVersion } from '../services/updateService';
import { checkForUpdate, installUpdate, pwaState } from '../services/pwaLifecycle';
import './splash.css';

export const SplashScreen: React.FC<{ ready?: boolean; onComplete?: () => void; forceUpdateMode?: boolean; onGuest?: () => void }> = ({ ready = true, onComplete, forceUpdateMode = false, onGuest }) => {
  const [phase, setPhase] = useState({ ...pwaState });
  const [checked, setChecked] = useState(false);
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(0);
  const [displayProgress, setDisplayProgress] = useState(12);
  const [elapsed, setElapsed] = useState(0);
  const [activating, setActivating] = useState(false);
  const activation = useRef(false);
  const cancelled = useRef(false);
  const callback = useRef(onComplete); callback.current = onComplete;
  useEffect(() => {
    let alive = true;
    const listener = () => { if (alive) setPhase({ ...pwaState }); };
    window.addEventListener('arcadex:boot_progress', listener);
    setChecked(false); setError(''); setElapsed(0); cancelled.current = false;
    void checkForUpdate().then(async () => {
      if (!alive || cancelled.current) return;
      if (window.__arcadex_sw_update_pending && (forceUpdateMode || isAutoUpdateEnabled())) {
        activation.current = true; setActivating(true);
        try { await installUpdate(); } finally { activation.current = false; if (alive) setActivating(false); }
      }
      if (alive) setChecked(true);
    }).catch(() => {
      if (!alive) return;
      if (forceUpdateMode) setError('Chưa tải được cập nhật. Bạn có thể thử lại hoặc tiếp tục dùng bản hiện tại.');
      else setChecked(true);
    });
    return () => { alive = false; window.removeEventListener('arcadex:boot_progress', listener); };
  }, [attempt, forceUpdateMode]);
  useEffect(() => {
    const timer = setInterval(() => setElapsed(value => value + 1), 1000);
    return () => clearInterval(timer);
  }, [attempt]);
  useEffect(() => {
    if (ready && checked && !error) { setDisplayProgress(100); return; }
    if (error) return;
    const timer = setInterval(() => setDisplayProgress(value => {
      const target = Math.min(92, Math.max(20, phase.progress));
      // Estimated startup progress: advance smoothly, then slow down; never finish before ready.
      return Math.min(94, value + (value < target ? Math.max(0.4, (target - value) * 0.12) : (94 - value) * 0.012));
    }), 200);
    return () => clearInterval(timer);
  }, [ready, checked, error, phase.progress]);
  useEffect(() => {
    if (!ready || !checked || error) return;
    const timer = setTimeout(() => {
      setStoredVersion(CURRENT_APP_VERSION);
      try { sessionStorage.setItem('arcadex_splash_completed', 'true'); } catch { /* Private storage. */ }
      callback.current?.();
    }, 350);
    return () => clearTimeout(timer);
  }, [ready, checked, error]);
  const progress = Math.floor(displayProgress);
  return <main id="splash-screen" aria-busy={!error} className="fixed inset-0 z-[9999] bg-[#080b12] text-slate-200 flex items-center justify-center p-6">
    <div className="absolute w-72 h-72 rounded-full bg-indigo-600/20 blur-[100px] pointer-events-none"/>
    <section className="relative w-full max-w-md text-center space-y-7">
      <div className={`arcadex-boot-logo ${error ? 'arcadex-boot-paused' : ''} w-24 h-24 mx-auto grid place-items-center rounded-3xl border border-lime-300/30 bg-lime-300/5 shadow-xl`}><Gamepad2 size={48} className="text-lime-300"/><span className="arcadex-boot-orbit" aria-hidden="true"/></div>
      <div><h1 className="text-4xl font-black tracking-wider text-white">ARCADEX</h1><p className="text-sm text-slate-500 mt-2">Chọn game. Bắt đầu chơi. · v{CURRENT_APP_VERSION}</p></div>
      <div className="space-y-3">
        <div className="flex justify-between gap-3 text-sm"><span role="status" aria-live="polite">{error ? 'Cập nhật chưa sẵn sàng' : !ready ? 'Đang chuẩn bị hồ sơ trên thiết bị…' : phase.message}</span><span className="tabular-nums">{progress}%</span></div>
        <div role="progressbar" aria-label="Tiến trình khởi động ước tính" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress} className="h-2 bg-white/10 rounded-full overflow-hidden"><div className={`arcadex-boot-bar ${error ? 'arcadex-boot-paused' : ''} h-full bg-gradient-to-r from-indigo-500 to-lime-300 transition-[width] duration-300`} style={{width:`${displayProgress}%`}}/></div>
        <p className="text-xs text-slate-500">{elapsed >= 5 ? 'Ứng dụng vẫn đang hoạt động. Kết nối chậm có thể cần thêm chút thời gian.' : 'Đang chuẩn bị launcher · Tiến trình ước tính'}</p>
      </div>
      {!ready && onGuest && <button id="btn-auth-loading-guest" className="simple-secondary-button w-full justify-center" disabled={activating} onClick={() => { if (!activation.current) { cancelled.current = true; onGuest?.(); } }}>{activating ? 'Đang hoàn tất cập nhật…' : 'Chơi như khách'}</button>}
      {error && <div className="space-y-3"><p role="alert" className="text-sm text-rose-300">{error}</p><button className="simple-primary-button w-full justify-center" onClick={()=>setAttempt(v=>v+1)}>Thử lại cập nhật</button><button className="simple-secondary-button w-full justify-center" onClick={()=>{setError('');setChecked(true);}}>Tiếp tục dùng bản hiện tại</button></div>}
    </section>
  </main>;
};
