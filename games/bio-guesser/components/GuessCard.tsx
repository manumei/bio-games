"use client";

import Button from "@/components/ui/Button";
import { Linnaeus } from "./Linnaeus";

export interface GuessCardProps {
  guess: {
    id: string;
    name: string;
    commonName?: string | null;
    image: string | null;
  };
  confidence: number; // 0..1
  onConfirm: () => void;
  onReject: () => void;
  disabled?: boolean;
}

export function GuessCard({
  guess,
  confidence,
  onConfirm,
  onReject,
  disabled = false,
}: GuessCardProps) {
  const percent = Math.round(confidence * 100);

  return (
    <div className="flex w-full max-w-xl flex-col items-center gap-5">
      <Linnaeus
        mood="confident"
        speech={
          <div>
            <p className="text-xs uppercase tracking-wider text-amber-300">
              Eureka! The classification is clear:
            </p>
            <p className="text-base font-bold text-white">
              I believe you are thinking of…
            </p>
          </div>
        }
      />

      {/* Organism display card */}
      <div className="flex w-full flex-col items-center rounded-2xl border-2 border-emerald-500/50 bg-slate-900/90 p-5 shadow-2xl text-center">
        {guess.image ? (
          <div className="relative mb-3 aspect-square w-48 overflow-hidden rounded-xl border border-slate-700 bg-slate-950 sm:w-56">
            {/* eslint-disable-next-line @next/next/no-img-element -- pre-optimized Taxo organism WebPs */}
            <img
              src={guess.image}
              alt={guess.name}
              className="h-full w-full object-cover"
            />
          </div>
        ) : (
          <div className="mb-3 flex h-40 w-40 items-center justify-center rounded-xl bg-slate-800 text-5xl">
            🐾
          </div>
        )}

        {guess.commonName && (
          <h3 className="text-xl sm:text-2xl font-extrabold text-white">
            {guess.commonName}
          </h3>
        )}

        <p
          className={`font-serif italic text-amber-300 ${
            guess.commonName ? "text-sm sm:text-base mt-0.5" : "text-xl sm:text-2xl font-bold"
          }`}
        >
          {guess.name}
        </p>

        <span className="mt-2 inline-flex items-center rounded-full bg-emerald-500/20 px-3 py-1 font-mono text-xs font-semibold text-emerald-300">
          {percent}% certainty
        </span>

        {/* Buttons: Yes! / Nope */}
        <div className="mt-6 flex w-full max-w-xs justify-center gap-4">
          <Button
            variant="primary"
            disabled={disabled}
            onClick={onConfirm}
            className="flex-1 text-base font-bold"
          >
            Yes! 🎉
          </Button>
          <Button
            variant="danger"
            disabled={disabled}
            onClick={onReject}
            className="flex-1 text-base font-bold"
          >
            Nope
          </Button>
        </div>
      </div>
    </div>
  );
}

