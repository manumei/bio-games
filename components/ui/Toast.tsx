"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export interface ToastState {
  id: number;
  message: string;
}

export function useToast() {
  const [toast, setToast] = useState<ToastState | null>(null);
  const timeoutRef = useRef<number | null>(null);
  const idCounterRef = useRef(0);

  useEffect(() => {
    return () => {
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const show = useCallback((message: string, ms: number = 1500) => {
    if (timeoutRef.current !== null) {
      window.clearTimeout(timeoutRef.current);
    }
    idCounterRef.current += 1;
    setToast({ id: idCounterRef.current, message });
    timeoutRef.current = window.setTimeout(() => {
      setToast(null);
      timeoutRef.current = null;
    }, ms);
  }, []);

  return { toast, show };
}

export default function Toast({ toast }: { toast: ToastState | null }) {
  return (
    <div
      aria-live="polite"
      aria-atomic="true"
      className="fixed top-16 left-1/2 -translate-x-1/2 z-[1100] pointer-events-none"
    >
      {toast && (
        <div
          key={toast.id}
          className="bg-accent text-black font-extrabold text-sm sm:text-base px-4 py-2 rounded-lg shadow-lg border-2 border-black"
        >
          {toast.message}
        </div>
      )}
    </div>
  );
}
