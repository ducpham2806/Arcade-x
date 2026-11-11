import React, {useEffect, useState} from 'react';
import {useGameSession, useLauncherUi} from '../context/GameContext';
import './placements.css';

// Layout review only. Production bundles cannot enable this via query parameters.
// No Google SDK, unit IDs, consent storage or ad requests are installed here.
const previewEnabled = import.meta.env.DEV && new URLSearchParams(location.search).get('ads-preview') === '1';
export function AdPlacementPreview({slot, blocked = false}: {slot: 'L1' | 'L2'; blocked?: boolean}) {
  const {activeGameId} = useGameSession();
  const {activeModal, isChatOpen} = useLauncherUi();
  const [online, setOnline] = useState(navigator.onLine);
  useEffect(() => {
    if (!previewEnabled) return;
    const update = () => setOnline(navigator.onLine);
    window.addEventListener('online', update); window.addEventListener('offline', update);
    return () => { window.removeEventListener('online', update); window.removeEventListener('offline', update); };
  }, []);
  if (!previewEnabled || blocked || !online || activeGameId || activeModal !== 'none' || isChatOpen) return null;
  return <aside className={`ad-placement-preview ad-placement-${slot.toLowerCase()}`} data-ad-preview={slot} aria-label={`Vị trí quảng cáo mẫu ${slot}`}>
    <span>QUẢNG CÁO · BẢN XEM TRƯỚC</span>
    <p>Vị trí {slot} · quảng cáo chưa được bật</p>
  </aside>;
}
