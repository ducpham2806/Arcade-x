/** Keep keyboard navigation inside the visible game dialog. Native button,
 * select and slider behavior is left to the browser. The owner's AbortSignal
 * releases the handler when this screen is destroyed. */
export function modalFocus(root: HTMLElement, signal: AbortSignal) {
  let active: HTMLElement | null = null;
  const controls = () => active ? [...active.querySelectorAll<HTMLElement>(
    'button:not(:disabled),select:not(:disabled),input:not(:disabled),a[href],[tabindex]',
  )].filter(el => el.tabIndex >= 0 && el.getClientRects().length > 0) : [];

  root.addEventListener('keydown', event => {
    if (event.key !== 'Tab' || !active) return;
    const items = controls(), first = items[0], last = items.at(-1);
    if (!first) { event.preventDefault(); return; }
    if (!active.contains(document.activeElement) ||
        event.shiftKey && document.activeElement === first ||
        !event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      (event.shiftKey ? last : first)?.focus();
    }
  }, { signal });

  return (dialog: HTMLElement | null, preferred?: HTMLElement) => {
    const changed = active !== dialog;
    active = dialog;
    if (dialog && (changed || !dialog.contains(document.activeElement))) {
      (preferred && dialog.contains(preferred) && !preferred.matches(':disabled') ? preferred : controls()[0])?.focus();
    }
  };
}
