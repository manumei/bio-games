"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";
import { cn } from "@/lib/cn";

export interface ModalProps {
  title?: ReactNode;
  ariaLabel?: string;
  dismissible?: boolean;
  showCloseButton?: boolean;
  closeButtonTitle?: string;
  onClose?: () => void;
  className?: string;
  children: ReactNode;
}

export default function Modal({
  title,
  ariaLabel,
  dismissible = true,
  showCloseButton = false,
  closeButtonTitle = "Close",
  onClose,
  className,
  children,
}: ModalProps) {
  const titleId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    const previouslyFocused =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;

    const dialog = dialogRef.current;
    if (dialog) {
      const firstFocusable = dialog.querySelector<HTMLElement>(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      (firstFocusable ?? dialog).focus();
    }

    return () => {
      previouslyFocused?.focus?.();
    };
  }, []);

  useEffect(() => {
    if (!dismissible) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onCloseRef.current?.();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [dismissible]);

  return (
    <div
      className="fixed inset-0 z-[999] flex items-center justify-center bg-[#0000006f] p-4"
      onClick={() => {
        if (dismissible) onClose?.();
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        aria-label={!title ? ariaLabel : undefined}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        className={cn(
          "relative z-[1000] max-h-[75vh] w-[85vw] sm:w-[30rem] overflow-y-auto rounded-xl bg-[rgb(241,234,234)] p-6 sm:p-8 text-black shadow-lg outline-none",
          className
        )}
      >
        {showCloseButton && onClose && (
          <button
            type="button"
            onClick={onClose}
            className="absolute top-2 right-4 text-red-600 text-2xl sm:text-3xl hover:text-red-800 transition cursor-pointer"
            title={closeButtonTitle}
            aria-label={closeButtonTitle}
          >
            ✖
          </button>
        )}

        {title && (
          <h2 id={titleId} className="text-2xl sm:text-3xl font-bold mb-4">
            {title}
          </h2>
        )}

        {children}
      </div>
    </div>
  );
}
