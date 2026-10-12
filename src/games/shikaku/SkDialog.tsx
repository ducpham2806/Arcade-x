import React, { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
export function SkDialog({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  const close = useRef<HTMLButtonElement>(null);
  const [opener] = useState(() => document.activeElement as HTMLElement);
  useEffect(() => {
    close.current?.focus();
    return () => opener?.focus();
  }, []);
  return (
    <div
      className="sk-dialog"
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onKeyDown={(e) => {
        if (e.key === "Escape") {
          e.stopPropagation();
          onClose();
        }
        if (e.key === "Tab") {
          const nodes = Array.from(
            e.currentTarget.querySelectorAll<HTMLElement>(
              'button:not(:disabled),input:not(:disabled),select:not(:disabled),[tabindex="0"]',
            ),
          );
          const first = nodes[0],
            last = nodes[nodes.length - 1];
          if (e.shiftKey && document.activeElement === first) {
            e.preventDefault();
            last.focus();
          } else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }}
    >
      <header>
        <h2>{title}</h2>
        <button ref={close} aria-label={`Đóng ${title}`} onClick={onClose}>
          <X />
        </button>
      </header>
      <div className="sk-dialog-body">{children}</div>
    </div>
  );
}
