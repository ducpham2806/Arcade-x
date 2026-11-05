import React, { useEffect, useRef } from 'react';
import type { GameComponentProps } from '../../types';
import { supabase } from '../../services/supabaseClient';
import { mountTankClash, type TankController } from './runtime';
import './tank-clash.css';

// This deployment owns the verifier. Invitations cannot redirect an ArcadeX session elsewhere.
export const TANK_SERVER = 'wss://arcadex-tank-staging.onrender.com/tank';
export default function TankClashGame({ isPaused }: GameComponentProps) {
  const root = useRef<HTMLDivElement>(null), controller = useRef<TankController | null>(null);
  const paused = useRef(isPaused); paused.current = isPaused;
  useEffect(() => {
    if (!root.current) return;
    let alive = true, initialized = false, token: string | undefined, owner: string | undefined, revision = 0;
    const mount = () => {
      controller.current = mountTankClash(root.current!, { paused: paused.current, serverUrl: TANK_SERVER, fixedServer: true,
        trustedServers: [TANK_SERVER], getToken: () => token, requireAuthentication: true, inviteGameId: 'tank-clash',
        onAuthRequired: () => window.dispatchEvent(new CustomEvent('arcadex:open_modal', { detail: { modal: 'auth' } })) });
    };
    const applySession = (session: { access_token: string; user: { id: string; is_anonymous?: boolean } } | null) => {
      if (!alive) return;
      const next = session?.user.is_anonymous === false ? session.user.id : undefined;
      token = next ? session?.access_token : undefined;
      // Logout/account changes release the old seat before any new identity can use this tab.
      if (!initialized || owner !== next) {
        controller.current?.destroy({ leaveOnline: true });
        try { sessionStorage.removeItem('tank-clash.seat'); } catch { /* storage optional */ }
        owner = next; initialized = true; mount();
      }
    };
    // A previous staging tab or a different account must never donate a resume token.
    try { sessionStorage.removeItem('tank-clash.seat'); } catch { /* storage optional */ }
    const before = revision;
    if (!supabase) applySession(null);
    supabase?.auth.getSession().then(({data}) => { if (revision === before) applySession(data.session); }).catch(() => { if (!initialized) applySession(null); });
    const subscription = supabase?.auth.onAuthStateChange((_event, session) => { revision++; applySession(session); }).data.subscription;
    return () => { alive = false; token = undefined; subscription?.unsubscribe(); controller.current?.destroy({ leaveOnline: true }); controller.current = null;
      try { sessionStorage.removeItem('tank-clash.seat'); } catch { /* storage optional */ }
    };
  }, []);
  useEffect(() => controller.current?.setPaused(isPaused), [isPaused]);
  return <div ref={root} style={{ width: '100%', height: '100%', minHeight: 280 }} />;
}
