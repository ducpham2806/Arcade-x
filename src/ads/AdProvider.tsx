import React, {createContext, useContext, useEffect, useRef, useState} from 'react';
import {disabledAdsConfig, type AdsConfig} from './config';
import {unknownConsent, type AdContext, type AdsConsent} from './policy';
import {createGoogleAdapter} from './google';
import {createAdsRuntime, type AdsRuntime, type DisplayAdsAdapter} from './runtime';

// Keep local adapter code synchronous up to SDK insertion. Deferring it through an
// import could start a third-party request after the eligibility check was revoked.
interface Snapshot {config: AdsConfig; consent: AdsConsent; context: AdContext}
interface AdsState {snapshot: Snapshot; current: () => Snapshot; runtime: AdsRuntime}
const Context = createContext<AdsState | null>(null);
export function AdProvider({children, config = disabledAdsConfig, consent = unknownConsent, activeGameId = null, blocked = false, hasContent = false, adapter}: {
  children: React.ReactNode; config?: AdsConfig; consent?: AdsConsent; activeGameId?: string | null; blocked?: boolean; hasContent?: boolean; adapter?: DisplayAdsAdapter;
}) {
  const [runtime] = useState(() => createAdsRuntime(adapter || createGoogleAdapter(document), document));
  const [environment, setEnvironment] = useState(() => readEnvironment());
  function readEnvironment() { return {online:navigator.onLine, visible:document.visibilityState === 'visible', mobile:!matchMedia('(min-width: 768px)').matches, updatePending:!!window.__arcadex_sw_update_pending}; }
  useEffect(() => {
    const update = () => setEnvironment(readEnvironment());
    const media = matchMedia('(min-width: 768px)');
    for (const event of ['online','offline','arcadex:pwa_need_refresh','arcadex:boot_progress']) window.addEventListener(event, update);
    document.addEventListener('visibilitychange', update); media.addEventListener('change', update);
    update();
    return () => { for (const event of ['online','offline','arcadex:pwa_need_refresh','arcadex:boot_progress']) window.removeEventListener(event, update); document.removeEventListener('visibilitychange', update); media.removeEventListener('change', update); };
  }, []);
  const snapshot: Snapshot = {config, consent, context:{activeGameId, hasContent, blocked:blocked || environment.updatePending, ...environment}};
  const ref = useRef(snapshot); ref.current = snapshot;
  const [current] = useState(() => () => {
    const env = readEnvironment();
    return {...ref.current, context:{...ref.current.context, ...env, blocked:ref.current.context.blocked || env.updatePending}};
  });
  return <Context.Provider value={{snapshot,current,runtime}}>{children}</Context.Provider>;
}
export function useAds() {
  const state = useContext(Context);
  if (!state) throw new Error('AdSlot requires AdProvider');
  return state;
}
