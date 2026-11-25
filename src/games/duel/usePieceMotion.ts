import { useCallback, useEffect, useRef, useState } from 'react';

export function usePieceMotion<Move>() {
  const [moving, setMoving] = useState<Move>();
  const [capture, setCapture] = useState<Move>();
  const travelTimer = useRef<number | undefined>(undefined);
  const captureTimer = useRef<number | undefined>(undefined);

  const clearTimers = useCallback(() => {
    window.clearTimeout(travelTimer.current);
    window.clearTimeout(captureTimer.current);
  }, []);

  useEffect(() => clearTimers, [clearTimers]);

  const stop = useCallback(() => {
    clearTimers();
    setMoving(undefined);
    setCapture(undefined);
  }, [clearTimers]);

  const play = useCallback((move: Move, travelMs: number, captureMs?: number) => {
    window.clearTimeout(travelTimer.current);
    setMoving(move);
    travelTimer.current = window.setTimeout(() => setMoving(undefined), travelMs);
    if (captureMs === undefined) return;

    window.clearTimeout(captureTimer.current);
    setCapture(move);
    captureTimer.current = window.setTimeout(() => setCapture(undefined), captureMs);
  }, []);

  return { moving, capture, play, stop };
}
