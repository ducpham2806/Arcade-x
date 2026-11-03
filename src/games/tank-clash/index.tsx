import React, { useEffect, useRef } from 'react';
import type { GameComponentProps } from '../../types';
import { supabase } from '../../services/supabaseClient';
import { mountTankClash } from './runtime';
import type { TankController } from './runtime';
import { parseTrustedServers } from './trust';
import './tank-clash.css';

const TRUSTED_SERVERS = parseTrustedServers(import.meta.env.VITE_TANK_CLASH_SERVERS);

/**
 * Review adapter only. P2 never calls bridge.submitScore/grant* or persists rewards.
 * Online rooms read the current Supabase session token (no forced sign-in); the runtime only sends it
 * to servers listed in VITE_TANK_CLASH_SERVERS or to a loopback dev server.
 */
export default function TankClashGame({ isPaused }: GameComponentProps) {
  const root = useRef<HTMLDivElement>(null), controller = useRef<TankController | null>(null), token = useRef<string | undefined>(undefined);
  useEffect(() => {
    if (!supabase) return;
    let alive = true;
    supabase.auth.getSession().then(({ data }) => { if (alive) token.current = data.session?.access_token; }).catch(() => {});
    const { data } = supabase.auth.onAuthStateChange((_event, session) => { token.current = session?.access_token; });
    return () => { alive = false; data.subscription.unsubscribe(); };
  }, []);
  useEffect(() => {
    if (!root.current) return;
    const c = mountTankClash(root.current, { paused: isPaused, getToken: () => token.current, trustedServers: TRUSTED_SERVERS });
    controller.current = c;
    return () => { c.destroy(); controller.current = null; };
  }, []);
  useEffect(() => controller.current?.setPaused(isPaused), [isPaused]);
  return <div ref={root} style={{ width: '100%', height: '100%', minHeight: 280 }} />;
}
