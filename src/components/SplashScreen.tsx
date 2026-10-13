import React, { useEffect, useRef, useState } from 'react';
import { Gamepad2 } from 'lucide-react';
import { CURRENT_APP_VERSION, isAutoUpdateEnabled, setStoredVersion } from '../services/updateService';
import { checkForUpdate, installUpdate, pwaState } from '../services/pwaLifecycle';
export const SplashScreen: React.FC<{ ready?: boolean; onComplete?: () => void; forceUpdateMode?: boolean; onGuest?: () => void }>  = ({ ready = true, onComplete, forceUpdateMode = false, onGuest }) => {
  const [phase, setPhase] = useState({ ...pwaState });
  const [checked, setChecked] = useState(false);
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(0);
  const callback = useRef(onComplete); callback.current = onComplete;
  useEffect(() => {
    let alive = true;
    const listener = () => { if (alive) setPhase({ ...pwaState }); };
    window.addEventListener('arcadex:boot_progress', listener);
    setChecked(false); setError('');
    void checkForUpdate().then(async () => {
      if (!alive) return;
      if (window.__arcadex_sw_update_pending && (forceUpdateMode || isAutoUpdateEnabled())) await installUpdate();
      if (alive) setChecked(true);
    }).catch(e => { if (alive) setError(e.message || 'Chưa kiểm tra được cập nhật.'); });
    return () => { alive = false; window.removeEventListener('arcadex:boot_progress', listener); };
  }, [attempt, forceUpdateMode]);
  useEffect(() => {
    if (!ready || !checked || error) return;
    const timer = setTimeout(() => { setStoredVersion(CURRENT_APP_VERSION); sessionStorage.setItem('arcadex_splash_completed', 'true'); callback.current?.(); }, 200);
    return () => clearTimeout(timer);
  }, [ready, checked, error]);
  const progress = ready && checked ? 100 : ready ? phase.progress : Math.min(phase.progress, 65);
  return <main id="splash-screen" className="fixed inset-0 z-[9999] bg-[#080b12] text-slate-200 flex items-center justify-center p-6">
    <div className="absolute w-72 h-72 rounded-full bg-indigo-600/20 blur-[100px] pointer-events-none"/>
    <section className="relative w-full max-w-md text-center space-y-7"><div className="w-24 h-24 mx-auto grid place-items-center rounded-3xl border border-lime-300/30 bg-lime-300/5 shadow-xl"><Gamepad2 size={48} className="text-lime-300"/></div><div><h1 className="text-4xl font-black tracking-wider text-white">ARCADEX</h1><p className="text-sm text-slate-500 mt-2">Chọn game. Bắt đầu chơi. · v{CURRENT_APP_VERSION}</p></div>
      <div className="space-y-3"><div className="flex justify-between gap-3 text-sm"><span role="status">{error || (!ready ? 'Đang chuẩn bị hồ sơ trên thiết bị…' : phase.message)}</span><span>{progress}%</span></div><div role="progressbar" aria-label="Tiến trình khởi động" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress} className="h-2 bg-white/10 rounded-full overflow-hidden"><div className="h-full bg-gradient-to-r from-indigo-500 to-lime-300 transition-[width] duration-300" style={{width:`${progress}%`}}/></div><p className="text-xs text-slate-500">Tiến trình theo các bước khởi động và kiểm tra cập nhật.</p></div>
      {!ready && onGuest && <button id="btn-auth-loading-guest" className="simple-secondary-button w-full justify-center" onClick={onGuest}>Chơi như khách</button>}
      {error && <div className="space-y-3"><p role="alert" className="text-sm text-rose-300">{error}</p><button className="simple-primary-button w-full justify-center" onClick={()=>setAttempt(v=>v+1)}>Thử lại cập nhật</button><button className="simple-secondary-button w-full justify-center" onClick={()=>{setError('');setChecked(true);}}>Tiếp tục dùng bản hiện tại</button></div>}
    </section>
  </main>;
};

