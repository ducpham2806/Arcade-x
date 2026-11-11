import React, {useLayoutEffect, useRef, useState} from 'react';
import {useAds} from './AdProvider';
import type {AdPlacement} from './config';
import {canRequestAd} from './policy';
import type {AdOutcome} from './runtime';
import './placements.css';

function hasLayout(element: HTMLElement) {
  return element.isConnected && element.getClientRects().length > 0 && element.getBoundingClientRect().width > 0 && getComputedStyle(element).visibility !== 'hidden';
}
export function AdSlot({placement, blocked = false}: {placement: AdPlacement; blocked?: boolean}) {
  const {snapshot, current, runtime} = useAds();
  const element = useRef<HTMLModElement>(null);
  const [layout, setLayout] = useState(0);
  const [outcome, setOutcome] = useState<AdOutcome | 'loading'>('loading');
  const eligible = !blocked && canRequestAd(snapshot.config, snapshot.consent, snapshot.context, placement);
  const unit = snapshot.config.units[placement];
  const client = snapshot.config.client;
  useLayoutEffect(() => {
    const node = element.current;
    if (!eligible || !node) return;
    const abort = new AbortController();
    const allowed = () => {
      const next = current();
      return !abort.signal.aborted && next.config.client === client && next.config.units[placement] === unit && canRequestAd(next.config, next.consent, next.context, placement) && hasLayout(node);
    };
    // Hidden/zero-width containers may become measurable later; no polling or ad refresh.
    let previousWidth = node.getBoundingClientRect().width;
    const observer = new ResizeObserver(() => {
      const width = node.getBoundingClientRect().width;
      if (width !== previousWidth) { previousWidth = width; if (!runtime.exhausted()) setLayout(value => value+1); }
    });
    observer.observe(node);
    if (allowed() && !runtime.exhausted()) {
      void runtime.load(client).then(async () => {
        if (!allowed() || runtime.consumed()) return;
        const result = await runtime.request(node, placement, abort.signal);
        if (!abort.signal.aborted) setOutcome(result);
      }).catch(() => { if (!abort.signal.aborted) setOutcome('error'); });
    }
    return () => { abort.abort(); observer.disconnect(); };
  }, [eligible, client, unit, placement, layout, current, runtime]);
  if (!eligible || (runtime.exhausted() && !element.current)) return null;
  return <aside className="ad-display-slot" aria-label="Quảng cáo" data-ad-outcome={outcome}>
    <span>Quảng cáo</span>
    <ins ref={element} className="adsbygoogle" style={{display:'block', width:'100%'}} data-ad-client={client} data-ad-slot={unit} data-ad-format="auto" data-full-width-responsive="true"/>
  </aside>;
}
