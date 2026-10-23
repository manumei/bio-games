"use client";

import { cn } from "@/lib/cn";

export interface HardModeToggleProps {
  hardMode: boolean;
  onToggle: () => void;
  disabled?: boolean;
  disabledReason?: string;
  className?: string;
}

export default function HardModeToggle({
  hardMode,
  onToggle,
  disabled = false,
  disabledReason,
  className,
}: HardModeToggleProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      title={disabled ? disabledReason : "Toggle Hard Mode"}
      onClick={onToggle}
      className={cn(
        "inline-flex items-center justify-center gap-2 h-10 px-4 rounded font-bold text-sm sm:text-base transition duration-200 select-none",
        hardMode
          ? "bg-red-600 hover:bg-red-700 text-white shadow-md ring-2 ring-red-400 cursor-pointer"
          : "bg-slate-700 hover:bg-slate-600 text-slate-200 border border-slate-500 cursor-pointer",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
    >
      <span>💀 Hard Mode</span>
      <span
        className={cn(
          "text-xs px-1.5 py-0.5 rounded font-extrabold uppercase tracking-wider",
          hardMode ? "bg-white text-red-700" : "bg-slate-800 text-slate-400"
        )}
      >
        {hardMode ? "ON" : "OFF"}
      </span>
    </button>
  );
}

