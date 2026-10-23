import { cn } from "@/lib/cn";
import type { GameStats } from "@/lib/stats";

export interface StatsBucket {
  key: string;
  label: string;
}

export interface StatsPanelProps {
  stats: GameStats;
  buckets: readonly StatsBucket[];
  highlightKey?: string;
  title?: string;
}

export default function StatsPanel({
  stats,
  buckets,
  highlightKey,
  title = "Statistics",
}: StatsPanelProps) {
  const winPercentage =
    stats.played > 0 ? Math.round((stats.wins / stats.played) * 100) : 0;

  const counts = buckets.map((bucket) => stats.histogram[bucket.key] ?? 0);
  const maxCount = Math.max(1, ...counts);

  return (
    <section className="w-full text-black bg-white/70 rounded-lg p-3 sm:p-4 space-y-3 text-left">
      <h3 className="text-sm sm:text-base font-bold uppercase tracking-wide text-center text-gray-800">
        {title}
      </h3>

      {/* Top row: Played · Win % · Current streak 🔥 · Max streak */}
      <div className="grid grid-cols-4 gap-2 text-center">
        <div className="flex flex-col items-center">
          <span className="text-xl sm:text-2xl font-extrabold">
            {stats.played}
          </span>
          <span className="text-[11px] sm:text-xs text-gray-700">Played</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-xl sm:text-2xl font-extrabold">
            {winPercentage}%
          </span>
          <span className="text-[11px] sm:text-xs text-gray-700">Win %</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-xl sm:text-2xl font-extrabold">
            {stats.currentStreak} 🔥
          </span>
          <span className="text-[11px] sm:text-xs text-gray-700">
            Current streak
          </span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-xl sm:text-2xl font-extrabold">
            {stats.maxStreak}
          </span>
          <span className="text-[11px] sm:text-xs text-gray-700">
            Max streak
          </span>
        </div>
      </div>

      {/* Histogram */}
      {buckets.length > 0 && (
        <div className="space-y-1 pt-1">
          <p className="text-xs font-bold uppercase tracking-wide text-gray-700 text-center mb-1">
            Distribution
          </p>
          <div className="space-y-1">
            {buckets.map((bucket) => {
              const count = stats.histogram[bucket.key] ?? 0;
              const isHighlighted =
                highlightKey !== undefined && bucket.key === highlightKey;
              const widthPercent =
                count === 0 ? 7 : Math.max(7, Math.round((count / maxCount) * 100));

              return (
                <div
                  key={bucket.key}
                  aria-label={`${bucket.label}: ${count} ${
                    count === 1 ? "game" : "games"
                  }`}
                  className="flex items-center gap-2 text-xs font-semibold"
                >
                  <span className="w-7 text-right shrink-0 text-gray-800">
                    {bucket.label}
                  </span>
                  <div className="flex-1 bg-gray-200 rounded overflow-hidden">
                    <div
                      style={{ width: `${widthPercent}%` }}
                      className={cn(
                        "px-2 py-0.5 text-right rounded transition-all duration-300 min-w-[1.75rem]",
                        isHighlighted
                          ? "bg-primary text-white font-bold"
                          : count > 0
                          ? "bg-panel text-white"
                          : "bg-gray-300 text-gray-700"
                      )}
                    >
                      {count}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}
