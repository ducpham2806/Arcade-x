import React, { useEffect, useRef } from 'react';
import type { GameComponentProps } from '../../types';
import { mountTankClash } from './runtime';
import type { TankController } from './runtime';
import './tank-clash.css';

/** Review adapter only. No bridge.submitScore/grant* calls or persisted rewards. */
export default function TankClashGame({ isPaused }: GameComponentProps) {
  const root = useRef<HTMLDivElement>(null), controller = useRef<TankController | null>(null);
  useEffect(() => { if (!root.current) return; const c = mountTankClash(root.current, { paused: isPaused }); controller.current = c; return () => { c.destroy(); controller.current = null; }; }, []);
  useEffect(() => controller.current?.setPaused(isPaused), [isPaused]);
  return <div ref={root} style={{ width: '100%', height: '100%', minHeight: 280 }} />;
}
