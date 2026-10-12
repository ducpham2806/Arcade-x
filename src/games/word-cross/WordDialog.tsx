import React from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { useDialogFocus } from "../../launcher/useDialogFocus";
export function WordDialog({
  title,
  onClose,
  children,
  footer,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  const ref = useDialogFocus(onClose);
  return createPortal(
    <div className="wc-modal-overlay">
      <section
        className="wc-dialog"
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby="wc-dialog-title"
        tabIndex={-1}
      >
        <header>
          <h2 id="wc-dialog-title">{title}</h2>
          <button onClick={onClose} aria-label="Đóng cửa sổ">
            <X />
          </button>
        </header>
        <div className="wc-dialog-body">{children}</div>
        <footer>
          {footer || (
            <button className="wc-primary" onClick={onClose}>
              Quay lại
            </button>
          )}
        </footer>
      </section>
    </div>,
    document.body,
  );
}
