"use client";

import type { TileEval } from "@/games/bio-wordle/types";
import { cn } from "@/lib/cn";

export interface KeyboardProps {
  keyStates: Readonly<Record<string, TileEval>>;
  disabled?: boolean;
  onLetter: (letter: string) => void;
  onBackspace: () => void;
  onEnter: () => void;
}

const KEY_ROWS: readonly (readonly string[])[] = [
  ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"],
  ["a", "s", "d", "f", "g", "h", "j", "k", "l"],
  ["ENTER", "z", "x", "c", "v", "b", "n", "m", "⌫"],
];

const KEY_STATE_CLASSES: Readonly<Record<TileEval, string>> = {
  correct: "bg-[#228101] text-white hover:bg-[#1b6901]",
  present: "bg-[#c9a227] text-white hover:bg-[#b08d20]",
  absent: "bg-slate-800 text-gray-400 hover:bg-slate-700",
};

export default function Keyboard({
  keyStates,
  disabled = false,
  onLetter,
  onBackspace,
  onEnter,
}: KeyboardProps) {
  return (
    <div
      aria-label="On-screen keyboard"
      className="w-full max-w-lg px-1 sm:px-2 flex flex-col items-center gap-1.5 select-none"
    >
      {KEY_ROWS.map((row, rowIdx) => (
        <div
          key={rowIdx}
          className="flex items-center justify-center gap-1 sm:gap-1.5 w-full"
        >
          {row.map((key) => {
            const isAction = key === "ENTER" || key === "⌫";
            const state = !isAction ? keyStates[key] : undefined;

            return (
              <button
                key={key}
                type="button"
                disabled={disabled}
                aria-label={
                  key === "⌫"
                    ? "Backspace"
                    : key === "ENTER"
                    ? "Submit guess"
                    : key.toUpperCase()
                }
                onClick={() => {
                  if (disabled) return;
                  if (key === "ENTER") onEnter();
                  else if (key === "⌫") onBackspace();
                  else onLetter(key);
                }}
                className={cn(
                  "h-11 sm:h-12 rounded font-bold uppercase text-xs sm:text-sm flex items-center justify-center transition cursor-pointer disabled:opacity-50 disabled:pointer-events-none",
                  isAction ? "px-2 sm:px-3.5 min-w-[3.1rem] sm:min-w-[4rem]" : "flex-1 max-w-[2.6rem]",
                  state
                    ? KEY_STATE_CLASSES[state]
                    : "bg-slate-600 text-white hover:bg-slate-500"
                )}
              >
                {key}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}
