import React, { useEffect, useRef } from 'react';
import type { GameComponentProps } from '../../types';
import { mountTankClash } from './runtime';
import type { TankController } from './runtime';
import './tank-clash.css';
import onlineConfig from './online-config.json';
import { supabase } from '../../services/supabaseClient';
import { registeredTokenProvider } from './access';

/** Review adapter only. It never calls bridge.submitScore/grant* or persists rewards. */
export default function TankClashGame({ isPaused }: GameComponentProps) {
  const root = useRef<HTMLDivElement>(null), controller = useRef<TankController | null>(null);
  useEffect(() => { if (!root.current) return; const c = mountTankClash(root.current, { paused: isPaused, onlineEnabled: onlineConfig.enabled, serverUrl: onlineConfig.serverUrl || undefined, getToken: onlineConfig.enabled && onlineConfig.requireAccount ? registeredTokenProvider(supabase) : undefined }); controller.current = c; return () => { c.destroy(); controller.current = null; }; }, []);
  useEffect(() => controller.current?.setPaused(isPaused), [isPaused]);
  return <div ref={root} style={{ width: '100%', height: '100%', minHeight: 280 }} />;
}
