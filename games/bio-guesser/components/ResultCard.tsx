"use client";

import Link from "next/link";
import Button from "@/components/ui/Button";
import { getOrganism, type Organism } from "@/data/organisms";
import { Linnaeus } from "./Linnaeus";

export interface ResultCardProps {
  winner: "linnaeus" | "player";
  headline: string;
  record: { linnaeus: number; player: number };
  organismId?: string | null;
  organismName?: string | null;
  onPlayAgain: () => void;
}

export function ResultCard({
  winner,
  headline,
  record,
  organismId,
  organismName,
  onPlayAgain,
}: ResultCardProps) {
  let org: Organism | null = null;
  if (organismId) {
    try {
      org = getOrganism(organismId);
    } catch {
      org = null;
    }
  }

  const displayName = org?.name ?? organismName;

  return (
    <div className="flex w-full max-w-xl flex-col items-center gap-5 text-center">
      <Linnaeus
        mood={winner === "linnaeus" ? "confident" : "stumped"}
        speech={
          <div>
            <p className="text-xs uppercase tracking-wider text-amber-300">
              {winner === "linnaeus" ? "Classification Complete!" : "Match Concluded"}
            </p>
            <p className="text-base font-bold text-white">
              &ldquo;{headline}&rdquo;
            </p>
          </div>
        }
      />

      <div className="flex w-full flex-col items-center gap-4 rounded-2xl border-2 border-slate-700 bg-slate-900/95 p-6 shadow-2xl">
        <h2 className="text-2xl font-black text-white">
          {winner === "linnaeus" ? "Linnaeus Wins! 📜" : "You Win! 🏆"}
        </h2>

        {displayName && (
          <div className="flex flex-col items-center gap-2 rounded-xl bg-slate-950/70 p-3 border border-slate-800 w-full max-w-sm">
            {org?.image && (
              <div className="h-32 w-32 overflow-hidden rounded-lg border border-slate-700">
                {/* eslint-disable-next-line @next/next/no-img-element -- pre-optimized Taxo WebP */}
                <img
                  src={org.image}
                  alt={displayName}
                  className="h-full w-full object-cover"
                />
              </div>
            )}
            <p className="font-serif italic text-amber-200 text-lg">
              {displayName}
            </p>
          </div>
        )}

        {/* Local Head-to-Head Record */}
        <div className="flex items-center justify-center gap-3 rounded-lg bg-slate-800/80 px-4 py-2 font-mono text-sm text-slate-200 border border-slate-700">
          <span className="font-bold text-amber-300">Linnaeus {record.linnaeus}</span>
          <span className="text-slate-500">—</span>
          <span className="font-bold text-emerald-300">{record.player} You</span>
        </div>

        <div className="mt-2 flex flex-wrap justify-center gap-3">
          <Button variant="primary" onClick={onPlayAgain}>
            Play Again
          </Button>
          <Link
            href="/"
            className="inline-block cursor-pointer rounded bg-[#6574fd] px-6 py-2 font-bold text-white transition-colors duration-300 hover:bg-[#4755d4]"
          >
            Go back to home
          </Link>
        </div>
      </div>
    </div>
  );
}

