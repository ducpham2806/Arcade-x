import { useState, useSyncExternalStore } from 'react';

const QUERY = '(prefers-reduced-motion: reduce)';

function subscribeToMotion(onChange: () => void) {
  const media = window.matchMedia(QUERY);
  media.addEventListener('change', onChange);
  return () => media.removeEventListener('change', onChange);
}

function prefersMotion() {
  return !window.matchMedia(QUERY).matches;
}

export function useBoardMotion(game: 'chess' | 'xiangqi' | 'o-an-quan') {
  const key = `arcadex_${game}_motion`;
  const systemEnabled = useSyncExternalStore(subscribeToMotion, prefersMotion, () => false);
  const [preference, setPreference] = useState<boolean | null>(() => {
    try {
      const saved = localStorage.getItem(key);
      if (saved === 'on') return true;
      if (saved === 'off') return false;
    } catch {
      // The preference still works for the current session if storage is blocked.
    }
    return null;
  });
  const enabled = preference ?? systemEnabled;

  function toggle() {
    const next = !enabled;
    setPreference(next);
    try { localStorage.setItem(key, next ? 'on' : 'off'); } catch {}
  }

  return { enabled, toggle };
}

export function BoardMotionToggle({ enabled, toggle, className }: ReturnType<typeof useBoardMotion> & { className?: string }) {
  return (
    <button type="button" aria-label="Chuyển động quân cờ" aria-pressed={enabled} onClick={toggle} className={className}>
      Chuyển động: {enabled ? 'Bật' : 'Tắt'}
    </button>
  );
}
