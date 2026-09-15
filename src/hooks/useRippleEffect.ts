import { useEffect } from 'react';

/**
 * Global CSS-based Ripple Animation Manager
 * Attaches a lightweight listener to capture click/pointer interactions
 * and renders a smooth radiating Material-style wave originating from the exact click coordinate.
 */
export function useRippleEffect() {
  useEffect(() => {
    const handlePointerDown = (e: MouseEvent | TouchEvent) => {
      // Find closest interactive element
      const target = (e.target as HTMLElement | null);
      if (!target) return;

      const interactiveEl = target.closest<HTMLElement>(
        'button, a, [role="button"], input[type="button"], input[type="submit"], [data-ripple], .btn, .interactive-card, .cursor-pointer'
      );

      if (!interactiveEl) return;

      // Skip if disabled or explicitly disabled ripple
      if (
        interactiveEl.hasAttribute('disabled') ||
        interactiveEl.getAttribute('aria-disabled') === 'true' ||
        interactiveEl.dataset.noRipple === 'true'
      ) {
        return;
      }

      const rect = interactiveEl.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;

      // Calculate click point relative to element
      let clientX = 0;
      let clientY = 0;

      if ('touches' in e && e.touches.length > 0) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      } else if ('clientX' in e) {
        clientX = e.clientX;
        clientY = e.clientY;
      } else {
        clientX = rect.left + rect.width / 2;
        clientY = rect.top + rect.height / 2;
      }

      const x = clientX - rect.left;
      const y = clientY - rect.top;

      // Calculate radius to cover the furthest corner
      const maxDistX = Math.max(x, rect.width - x);
      const maxDistY = Math.max(y, rect.height - y);
      const radius = Math.sqrt(maxDistX * maxDistX + maxDistY * maxDistY);
      const size = radius * 2;

      // Ensure container has relative positioning and hidden overflow
      const computedStyle = window.getComputedStyle(interactiveEl);
      if (computedStyle.position === 'static') {
        interactiveEl.style.position = 'relative';
      }
      interactiveEl.classList.add('ripple-container');

      // Create ripple wave element
      const ripple = document.createElement('span');
      ripple.className = 'ripple-wave';
      ripple.style.width = `${size}px`;
      ripple.style.height = `${size}px`;
      ripple.style.left = `${x - radius}px`;
      ripple.style.top = `${y - radius}px`;

      // Check for custom color hint
      if (interactiveEl.classList.contains('text-amber-400') || interactiveEl.classList.contains('bg-amber-500')) {
        ripple.classList.add('ripple-amber');
      } else if (interactiveEl.classList.contains('text-rose-400') || interactiveEl.classList.contains('bg-rose-600')) {
        ripple.classList.add('ripple-rose');
      } else if (interactiveEl.classList.contains('text-indigo-400') || interactiveEl.classList.contains('bg-indigo-600')) {
        ripple.classList.add('ripple-indigo');
      }

      interactiveEl.appendChild(ripple);

      // Clean up ripple element after animation finishes
      const cleanup = () => {
        ripple.remove();
        if (interactiveEl.querySelectorAll('.ripple-wave').length === 0) {
          interactiveEl.classList.remove('ripple-container');
        }
      };

      ripple.addEventListener('animationend', cleanup, { once: true });
      // Fallback timeout in case animationend fails
      setTimeout(cleanup, 650);
    };

    // Use passive listener for best scroll and click performance
    window.addEventListener('pointerdown', handlePointerDown as EventListener, { passive: true });

    return () => {
      window.removeEventListener('pointerdown', handlePointerDown as EventListener);
    };
  }, []);
}
