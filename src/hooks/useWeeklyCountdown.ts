import { useEffect, useState } from 'react';
import { StorageService } from '../services/storage';
import type { WeeklyResetTimer } from '../types';

/**
 * Live countdown to the weekly reset. Kept out of GameContext so the per-second tick only
 * re-renders the component showing it; pass `paused` while a game is running.
 */
export function useWeeklyCountdown(paused = false): WeeklyResetTimer {
  const [countdown, setCountdown] = useState<WeeklyResetTimer>(() => StorageService.getWeeklyResetCountdown());
  useEffect(() => {
    if (paused) return;
    setCountdown(StorageService.getWeeklyResetCountdown());
    const timer = setInterval(() => {
      if (!document.hidden) setCountdown(StorageService.getWeeklyResetCountdown());
    }, 1000);
    return () => clearInterval(timer);
  }, [paused]);
  return countdown;
}
