import React, { useEffect, useState } from 'react';
import { useGame } from '../context/GameContext';
import { checkForUpdate, installUpdate } from '../services/pwaLifecycle';
export const ForceUpdateModal: React.FC = () => {
  const { activeGameId } = useGame();
  const [pending, setPending] = useState(!!window.__arcadex_sw_update_pending);
  const [trialActive,setTrialActive]=useState(false);
  useEffect(()=>{const update=(e:Event)=>setTrialActive((e as CustomEvent<boolean>).detail);window.addEventListener('arcadex:trial-active',update);return()=>window.removeEventListener('arcadex:trial-active',update)},[]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => { const check = () => setPending(!!window.__arcadex_sw_update_pending); window.addEventListener('arcadex:pwa_need_refresh',check); window.addEventListener('arcadex:boot_progress',check); return () => {window.removeEventListener('arcadex:pwa_need_refresh',check);window.removeEventListener('arcadex:boot_progress',check);}; }, []);
  if (!pending || activeGameId !== null || trialActive) return null;
  return <div id="force-update-modal-overlay" role="dialog" aria-modal="true" aria-label="Cập nhật Launcher" className="platform-ui fixed inset-0 z-[9999] bg-black/90 grid place-items-center p-6"><section className="max-w-md rounded-3xl bg-[#101621] border border-white/15 p-8 space-y-5 text-slate-200"><h2 className="text-2xl font-bold text-white">Có bản cập nhật mới</h2><p className="text-sm text-slate-400">Bản mới đã tải xong. Lưu tiến trình và khởi động lại để sử dụng.</p>{error && <p role="alert" className="text-rose-300 text-sm">{error}</p>}<button id="btn-force-update-action" disabled={busy} className="simple-primary-button w-full justify-center" onClick={async()=>{setBusy(true);setError('');try{await installUpdate();await checkForUpdate();setPending(!!window.__arcadex_sw_update_pending);}catch(e){setError(e instanceof Error?e.message:'Chưa cập nhật được.');}finally{setBusy(false);}}}>{busy?'Đang lưu và kích hoạt…':'Cập nhật & khởi động lại'}</button></section></div>;
};


