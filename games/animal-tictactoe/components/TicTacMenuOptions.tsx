"use client";

import type { TicTacOptions } from "../types";

export interface TicTacMenuOptionsProps {
  options: TicTacOptions;
  onChange: (next: Partial<TicTacOptions>) => void;
}

export function TicTacMenuOptions({
  options,
  onChange,
}: TicTacMenuOptionsProps) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      <button
        type="button"
        onClick={() =>
          onChange({
            hardMode: !options.hardMode,
            versus: false,
          })
        }
        className={`cursor-pointer rounded px-4 py-2 transition duration-300 ${
          options.hardMode && !options.versus
            ? "bg-[#ff0000] font-bold text-white"
            : "bg-red-200 text-black"
        } hover:opacity-80`}
      >
        Hard Mode {options.hardMode && !options.versus ? "✔" : "✖"}
      </button>

      <button
        type="button"
        onClick={() =>
          onChange({
            versus: !options.versus,
            daily: false,
          })
        }
        className={`cursor-pointer rounded px-4 py-2 transition duration-300 ${
          options.versus
            ? "bg-amber-500 font-bold text-slate-950"
            : "bg-slate-700 text-slate-100"
        } hover:opacity-80`}
      >
        Versus (2P ❌/⭕) {options.versus ? "✔" : "✖"}
      </button>

      {options.versus && (
        <button
          type="button"
          onClick={() => onChange({ versusTimer: !options.versusTimer })}
          className={`cursor-pointer rounded px-3 py-2 text-sm transition duration-300 ${
            options.versusTimer
              ? "bg-cyan-500 font-bold text-slate-950"
              : "bg-slate-800 text-slate-200"
          } hover:opacity-80`}
        >
          20s Turn Timer {options.versusTimer ? "✔" : "✖"}
        </button>
      )}
    </div>
  );
}

