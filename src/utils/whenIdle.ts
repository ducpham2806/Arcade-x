/** Runs `task` once the browser is idle (or after a short delay); returns a cancel function. */
export function whenIdle(task: () => void, timeout = 4000): () => void {
  if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
    const handle = window.requestIdleCallback(task, { timeout });
    return () => window.cancelIdleCallback(handle);
  }
  const handle = setTimeout(task, Math.min(timeout, 2500));
  return () => clearTimeout(handle);
}
