"use client";

import { useEffect, useRef, useState } from "react";

function computeSecondsLeft(deadline: number): number {
  return Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
}

/**
 * Deadline-based countdown hook (epoch ms).
 * Recomputes from Date.now() every 250ms and calls onExpire once when reaching 0.
 */
export function useCountdown(
  deadline: number | null,
  onExpire?: () => void
): number | null {
  const [, setTick] = useState(0);
  const onExpireRef = useRef(onExpire);
  const expiredDeadlineRef = useRef<number | null>(null);

  useEffect(() => {
    onExpireRef.current = onExpire;
  }, [onExpire]);

  useEffect(() => {
    if (deadline === null) {
      expiredDeadlineRef.current = null;
      return;
    }

    const check = () => {
      const remaining = computeSecondsLeft(deadline);
      setTick((prev) => prev + 1);
      if (remaining <= 0 && expiredDeadlineRef.current !== deadline) {
        expiredDeadlineRef.current = deadline;
        onExpireRef.current?.();
      }
    };

    check();
    const interval = window.setInterval(check, 250);
    return () => window.clearInterval(interval);
  }, [deadline]);

  if (deadline === null) {
    return null;
  }
  return computeSecondsLeft(deadline);
}
