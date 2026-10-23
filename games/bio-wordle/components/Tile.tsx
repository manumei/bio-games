"use client";

import type { TileVisualState } from "@/games/bio-wordle/types";
import { cn } from "@/lib/cn";

export interface TileProps {
  letter: string;
  state: TileVisualState;
  colIndex?: number;
}

const STATE_CLASSES: Readonly<Record<TileVisualState, string>> = {
  empty: "bg-surface/60 border-2 border-slate-600 text-white",
  typed: "bg-surface border-2 border-accent text-white scale-105",
  correct: "bg-[#228101] border-2 border-[#228101] text-white",
  present: "bg-[#c9a227] border-2 border-[#c9a227] text-white",
  absent: "bg-slate-800 border-2 border-slate-700 text-gray-300",
};

export default function Tile({ letter, state, colIndex = 0 }: TileProps) {
  const isEvaluated =
    state === "correct" || state === "present" || state === "absent";

  return (
    <div
      style={
        isEvaluated
          ? { transitionDelay: `${colIndex * 120}ms` }
          : undefined
      }
      aria-label={
        letter ? `${letter.toUpperCase()} (${state})` : "empty tile"
      }
      className={cn(
        "w-10 h-10 xs:w-11 xs:h-11 sm:w-13 sm:h-13 rounded-md flex items-center justify-center font-extrabold text-lg sm:text-2xl uppercase select-none transition-all duration-300 motion-reduce:transition-none",
        STATE_CLASSES[state]
      )}
    >
      {letter}
    </div>
  );
}
