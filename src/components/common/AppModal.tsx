import React from 'react';
import { useDialogFocus } from '../../launcher/useDialogFocus';

interface AppModalProps {
  onClose: () => void;
  /** Id of the visible title element; or pass `label` when there is none. */
  labelledBy?: string;
  label?: string;
  /** Fixed areas above (header, then tabs) and below (footer) the scrolling body. */
  header?: React.ReactNode;
  tabs?: React.ReactNode;
  footer?: React.ReactNode;
  children: React.ReactNode;
  /** Skin for the frame (background, border, padding, text color); size is fixed by `.app-modal`. */
  className?: string;
  bodyClassName?: string;
  overlayClassName?: string;
  /** Stacking order of the overlay, for modals opened above a game or another overlay. */
  zIndex?: number;
  id?: string;
  /** Id for the dialog panel itself (the overlay gets `id`). */
  panelId?: string;
  closeOnBackdrop?: boolean;
  /** Render children directly in the frame when they already lay out a fixed header/footer and
   *  their own `flex-1 min-h-0 overflow-y-auto` body. */
  bare?: boolean;
}

/**
 * Content modal frame required by AGENTS.md (lists, tabs, forms, menus). The frame keeps one
 * size across tabs; only the body scrolls. Small confirmations and result popups stay compact
 * and do not use this component.
 */
export function AppModal({
  onClose, labelledBy, label, header, tabs, footer, children,
  className = '', bodyClassName = '', overlayClassName = '', zIndex = 50, id, panelId, closeOnBackdrop = true, bare = false,
}: AppModalProps) {
  const panel = useDialogFocus(onClose);
  return (
    <div
      id={id}
      className={`app-modal-overlay ${overlayClassName}`}
      style={{ zIndex }}
      onClick={closeOnBackdrop ? onClose : undefined}
    >
      <section
        id={panelId}
        ref={panel as React.RefObject<HTMLElement>}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        aria-label={labelledBy ? undefined : label}
        tabIndex={-1}
        data-app-modal=""
        // The caller supplies the skin, so launcher-theme recoloring of dialogs must not apply.
        data-modal-skin="authored"
        className={`app-modal ${className}`}
        onClick={event => event.stopPropagation()}
      >
        {bare ? children : <>
          {header && <div className="shrink-0">{header}</div>}
          {tabs && <div className="shrink-0">{tabs}</div>}
          <div data-app-modal-body="" className={`flex-1 overflow-y-auto min-h-0 custom-scrollbar ${bodyClassName}`}>{children}</div>
          {footer && <div className="shrink-0">{footer}</div>}
        </>}
      </section>
    </div>
  );
}
