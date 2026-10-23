"use client";

import Spinner from "@/components/ui/Spinner";

export interface LinnaeusProps {
  speech: React.ReactNode;
  loading?: boolean;
  mood?: "thinking" | "questioning" | "confident" | "stumped" | "sleeping";
}

export function Linnaeus({
  speech,
  loading = false,
  mood = "questioning",
}: LinnaeusProps) {
  const moodEmoji =
    mood === "confident"
      ? "🧔📜✨"
      : mood === "stumped"
      ? "🧔🥀"
      : mood === "sleeping"
      ? "🧔😴"
      : mood === "thinking"
      ? "🧔🤔"
      : "🧔📜";

  return (
    <div className="flex w-full max-w-xl flex-col items-center gap-4 sm:flex-row sm:items-start">
      {/* Linnaeus Avatar Badge */}
      <div className="flex flex-col items-center shrink-0">
        <div className="flex h-20 w-20 items-center justify-center rounded-full border-2 border-amber-300/60 bg-gradient-to-br from-amber-900/40 via-slate-900 to-slate-950 text-3xl shadow-lg ring-4 ring-amber-500/20">
          <span role="img" aria-label="Carl Linnaeus">
            {moodEmoji}
          </span>
        </div>
        <span className="mt-1 text-xs font-bold tracking-wider text-amber-200">
          C. Linnaeus
        </span>
        <span className="text-[10px] text-slate-400">Father of Taxonomy</span>
      </div>

      {/* Speech Bubble */}
      <div className="relative flex-1 rounded-2xl border-2 border-amber-500/30 bg-slate-900/90 p-4 shadow-xl text-left text-slate-100">
        {/* Left triangle pointer for desktop */}
        <div className="hidden sm:block absolute -left-2.5 top-6 h-4 w-4 rotate-45 border-l-2 border-b-2 border-amber-500/30 bg-slate-900/90" />

        {loading ? (
          <div className="flex items-center gap-3 py-2 text-sm text-amber-200">
            <Spinner />
            <span>Consulting my <em>Systema Naturae</em>…</span>
          </div>
        ) : (
          <div className="space-y-1.5">{speech}</div>
        )}
      </div>
    </div>
  );
}

