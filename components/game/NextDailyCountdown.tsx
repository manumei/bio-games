"use client";

import { useEffect, useState } from "react";
import { msUntilNextDay } from "@/lib/daily";
import { useHasMounted } from "@/lib/hooks/useHasMounted";

export interface NextDailyCountdownProps {
  gameTitle: string;
}

function formatHMS(ms: number): string {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return [hours, minutes, seconds]
    .map((val) => String(val).padStart(2, "0"))
    .join(":");
}

export default function NextDailyCountdown({
  gameTitle,
}: NextDailyCountdownProps) {
  const hasMounted = useHasMounted();
  const [msLeft, setMsLeft] = useState<number>(() => msUntilNextDay());

  useEffect(() => {
    const interval = window.setInterval(() => {
      const remaining = msUntilNextDay();
      setMsLeft(remaining);
    }, 1000);
    return () => window.clearInterval(interval);
  }, []);

  if (!hasMounted) {
    return (
      <p className="text-xs sm:text-sm font-semibold text-gray-700">
        Next {gameTitle} in --:--:--
      </p>
    );
  }

  if (msLeft <= 0) {
    return (
      <p className="text-xs sm:text-sm font-bold text-primary">
        New puzzle available, refresh! 🔄
      </p>
    );
  }

  return (
    <p className="text-xs sm:text-sm font-semibold text-gray-700 font-mono">
      Next {gameTitle} in {formatHMS(msLeft)}
    </p>
  );
}

