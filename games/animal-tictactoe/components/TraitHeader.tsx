"use client";

import { useState } from "react";
import type { Trait } from "../data/traits";

export interface TraitHeaderProps {
  trait: Trait;
  axis: "row" | "col";
}

export function TraitHeader({ trait, axis }: TraitHeaderProps) {
  const [open, setOpen] = useState(false);

  return (
    <div
      className={`group relative flex flex-col items-center justify-center rounded-xl border border-emerald-500/25 bg-slate-900/80 p-2 text-center shadow-sm ${
        axis === "row" ? "min-h-[5.5rem] sm:min-h-[6.5rem]" : "min-h-[4.25rem]"
      }`}
    >
      <span className="text-xl sm:text-2xl" aria-hidden="true">
        {trait.emoji}
      </span>
      <span className="mt-1 text-xs font-semibold leading-tight text-slate-100 sm:text-sm">
        {trait.label}
      </span>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        onBlur={() => setOpen(false)}
        aria-label={`Definition for ${trait.label}`}
        title={trait.description}
        className="mt-1 inline-flex h-4 w-4 items-center justify-center rounded-full bg-slate-800 text-[10px] font-bold text-emerald-300 hover:bg-emerald-500/20 focus:outline-none focus:ring-1 focus:ring-emerald-400"
      >
        ⓘ
      </button>

      <div
        role="tooltip"
        className={`pointer-events-none absolute z-30 w-52 rounded-lg border border-emerald-500/40 bg-slate-950/95 p-2.5 text-left text-xs leading-snug text-slate-200 shadow-xl transition-opacity duration-150 ${
          axis === "col" ? "top-full mt-1.5" : "left-full ml-1.5"
        } ${open ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}
      >
        <p className="font-semibold text-emerald-300">
          {trait.emoji} {trait.label}
        </p>
        <p className="mt-0.5 text-slate-300">{trait.description}</p>
      </div>
    </div>
  );
}

