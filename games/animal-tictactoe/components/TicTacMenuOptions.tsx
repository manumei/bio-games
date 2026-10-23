"use client";

import HardModeToggle from "@/components/ui/HardModeToggle";
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
    <div className="flex flex-wrap items-center justify-center gap-3">
      <HardModeToggle
        hardMode={options.hardMode && !options.versus}
        disabled={options.versus}
        disabledReason="Disabled in Versus mode"
        onToggle={() =>
          onChange({
            hardMode: !options.hardMode,
            versus: false,
          })
        }
      />

      <button
        type="button"
        onClick={() =>
          onChange({
            versus: !options.versus,
            daily: false,
          })
        }
        className={`inline-flex items-center justify-center h-10 px-4 rounded font-bold text-sm sm:text-base transition duration-200 cursor-pointer ${
          options.versus
            ? "bg-amber-500 hover:bg-amber-400 font-bold text-slate-950 shadow-md ring-2 ring-amber-300"
            : "bg-slate-700 hover:bg-slate-600 text-slate-200 border border-slate-500"
        }`}
      >
        <span>Versus (2P ❌/⭕)</span>
        <span
          className={`ml-2 text-xs px-1.5 py-0.5 rounded font-extrabold uppercase ${
            options.versus
              ? "bg-slate-950 text-amber-400"
              : "bg-slate-800 text-slate-400"
          }`}
        >
          {options.versus ? "ON" : "OFF"}
        </span>
      </button>

      {options.versus && (
        <button
          type="button"
          onClick={() => onChange({ versusTimer: !options.versusTimer })}
          className={`inline-flex items-center justify-center h-10 px-3 rounded font-bold text-sm transition duration-200 cursor-pointer ${
            options.versusTimer
              ? "bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-md ring-2 ring-cyan-300"
              : "bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-600"
          }`}
        >
          <span>20s Timer</span>
          <span
            className={`ml-1.5 text-xs px-1 py-0.5 rounded font-bold uppercase ${
              options.versusTimer
                ? "bg-slate-950 text-cyan-300"
                : "bg-slate-900 text-slate-400"
            }`}
          >
            {options.versusTimer ? "ON" : "OFF"}
          </span>
        </button>
      )}
    </div>
  );
}

