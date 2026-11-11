import React from 'react';
import {useAds} from './AdProvider';
import {AdSlot} from './AdSlot';
import {placementAllowed} from './policy';
import './placements.css';

const previewEnabled = import.meta.env.DEV && new URLSearchParams(location.search).get('ads-preview') === '1';
export function LauncherAdPlacement({slot, blocked = false}: {slot: 'L1' | 'L2'; blocked?: boolean}) {
  const {snapshot} = useAds();
  if (!previewEnabled) return <AdSlot placement={slot} blocked={blocked}/>;
  if (blocked || !placementAllowed(snapshot.context, slot)) return null;
  return <aside className={`ad-placement-preview ad-placement-${slot.toLowerCase()}`} data-ad-preview={slot} aria-label={`Vị trí quảng cáo mẫu ${slot}`}>
    <span>QUẢNG CÁO · BẢN XEM TRƯỚC</span><p>Vị trí {slot} · quảng cáo chưa được bật</p>
  </aside>;
}
