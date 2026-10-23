"use client";

import { useMemo } from "react";
import Autocomplete from "@/components/ui/Autocomplete";
import { ORGANISMS } from "@/data/organisms";
import { Linnaeus } from "./Linnaeus";

export interface GiveUpFormProps {
  onSubmit: (actual: { id: string } | { name: string }) => void;
  onSkip: () => void;
  disabled?: boolean;
}

export function GiveUpForm({
  onSubmit,
  onSkip,
  disabled = false,
}: GiveUpFormProps) {
  const searchable = useMemo(
    () =>
      ORGANISMS.map((o) => ({
        id: o.id,
        label: o.name,
      })),
    [],
  );

  const handleSubmit = (
    picked: { id: string; label: string } | null,
    rawText: string,
  ) => {
    const trimmed = rawText.trim();
    if (picked) {
      onSubmit({ id: picked.id });
    } else if (trimmed) {
      onSubmit({ name: trimmed });
    }
  };

  return (
    <div className="flex w-full max-w-xl flex-col items-center gap-5 text-center">
      <Linnaeus
        mood="stumped"
        speech={
          <div>
            <p className="text-base sm:text-lg font-bold text-white">
              You&apos;ve stumped me!
            </p>
            <p className="text-xs text-slate-300">
              What organism were you thinking of? Help me update my taxonomy.
            </p>
          </div>
        }
      />

      <div className="flex w-full flex-col items-center gap-3 rounded-2xl border border-slate-700 bg-slate-900/90 p-5 shadow-xl">
        <div className="w-full max-w-md">
          <Autocomplete
            items={searchable}
            onSubmit={handleSubmit}
            disabled={disabled}
            placeholder="Type organism name (or enter your own)..."
            submitLabel="Reveal"
          />
        </div>

        <button
          type="button"
          disabled={disabled}
          onClick={onSkip}
          className="text-xs text-slate-400 hover:text-amber-300 hover:underline transition"
        >
          Skip (keep it a secret)
        </button>
      </div>
    </div>
  );
}

