import React from "react";
import { createPortal } from "react-dom";
import { useDialogFocus } from "../../launcher/useDialogFocus";
export function CosmicDialog({
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
    <div className="cd-overlay">
      <section
        className="cd-dialog"
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby="cd-dialog-title"
        tabIndex={-1}
      >
        <header>
          <h2 id="cd-dialog-title">{title}</h2>
          <button onClick={onClose} aria-label="Đóng cửa sổ">
            ✕
          </button>
        </header>
        <div className="cd-dialog-body">{children}</div>
        <footer>{footer || <button onClick={onClose}>Quay lại</button>}</footer>
      </section>
    </div>,
    document.body,
  );
}
