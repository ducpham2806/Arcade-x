// Hosting chrome is outside React. Reserve space for its visible badge without
// changing the provider's iframe, branding, links or dismissal policy.
const PROPERTY = '--arcadex-host-bottom-inset';
const GAP = 8;

export function installHostingSafeArea(): () => void {
  const root = document.documentElement;
  const previous = root.style.getPropertyValue(PROPERTY);
  let frame: HTMLIFrameElement | null = null;
  let pending = 0;
  let disposed = false;

  const measure = () => {
    pending = 0;
    let inset = 0;
    if (frame?.isConnected && frame.dataset.nlReady === '1') {
      const style = getComputedStyle(frame);
      const rect = frame.getBoundingClientRect();
      if (style.display !== 'none' && style.visibility === 'visible' && Number(style.opacity) > 0 && rect.width > 0 && rect.height > 0 && rect.top < innerHeight && rect.bottom > 0) {
        let top = rect.top;
        try {
          // The public HUD uses a same-origin srcdoc. Measure only the badge,
          // so opening its optional popover does not shrink the game further.
          const badge = frame.contentDocument?.querySelector('.nl-badge');
          if (badge) {
            const box = badge.getBoundingClientRect();
            top = box.width && box.height ? Math.max(rect.top, rect.top + box.top) : innerHeight;
          }
        } catch { /* A cross-origin replacement can only expose its outer bounds. */ }
        if (top < innerHeight) inset = Math.ceil(Math.min(innerHeight, innerHeight - top + GAP));
      }
    }
    const value = inset ? `${inset}px` : '';
    if (root.style.getPropertyValue(PROPERTY) !== value) {
      if (value) root.style.setProperty(PROPERTY, value);
      else root.style.removeProperty(PROPERTY);
    }
  };
  const schedule = () => {
    if (!disposed && !pending) pending = requestAnimationFrame(measure);
  };
  const attributes = new MutationObserver(schedule);
  const size = new ResizeObserver(schedule);
  const connect = () => {
    const candidate = document.getElementById('nl-badge-frame');
    const next = candidate instanceof HTMLIFrameElement ? candidate : null;
    if (frame !== next) {
      frame?.removeEventListener('load', schedule);
      attributes.disconnect();
      size.disconnect();
      frame = next;
      if (frame) {
        frame.addEventListener('load', schedule);
        attributes.observe(frame, { attributes: true, attributeFilter: ['style', 'class', 'hidden', 'data-nl-ready'] });
        size.observe(frame);
      }
    }
    schedule();
  };
  // Netlify appends the iframe directly to body. Avoid observing gameplay's
  // subtree: its per-frame DOM updates must not schedule layout measurements.
  const children = new MutationObserver(connect);
  children.observe(document.body, { childList: true });
  window.addEventListener('resize', schedule);
  connect();

  return () => {
    disposed = true;
    cancelAnimationFrame(pending);
    children.disconnect();
    attributes.disconnect();
    size.disconnect();
    frame?.removeEventListener('load', schedule);
    window.removeEventListener('resize', schedule);
    if (previous) root.style.setProperty(PROPERTY, previous);
    else root.style.removeProperty(PROPERTY);
  };
}
