"use client";

import { useHasMounted } from "@/lib/hooks/useHasMounted";
import { loadStats } from "@/lib/stats";

export interface StreakBadgeProps {
  slug: string;
}

export default function StreakBadge({ slug }: StreakBadgeProps) {
  const hasMounted = useHasMounted();
  if (!hasMounted) return null;

  const stats = loadStats(slug);
  if (stats.currentStreak < 3) return null;

  return (
    <span
      title={`${stats.currentStreak} day winning streak`}
      aria-label={`${stats.currentStreak} day winning streak`}
      className="absolute z-10 px-2 py-1 text-sm font-bold text-black rounded-md -top-3 -right-2 sm:-right-3 bg-accent"
    >
      🔥{stats.currentStreak}
    </span>
  );
}

