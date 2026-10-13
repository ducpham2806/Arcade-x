import { useEffect } from 'react';

/**
 * Custom hook to lock body scrolling when a modal / popup is active
 */
export function useScrollLock(isLocked: boolean = true) {
  useEffect(() => {
    if (!isLocked) return;
    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, [isLocked]);
}

