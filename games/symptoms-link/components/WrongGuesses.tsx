import { getDisease } from "@/games/symptoms-link/data/diseases";
import type { LinkLogEntry } from "@/games/symptoms-link/types";

export interface WrongGuessesProps {
  log: readonly LinkLogEntry[];
}

export default function WrongGuesses({ log }: WrongGuessesProps) {
  const wrongEntries = log.filter(
    (entry): entry is { kind: "wrong"; diseaseId: string } =>
      entry.kind === "wrong" && typeof entry.diseaseId === "string"
  );

  if (wrongEntries.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center justify-center gap-2 max-w-xl">
      {wrongEntries.map((entry, idx) => {
        const disease = getDisease(entry.diseaseId);
        return (
          <span
            key={`${entry.diseaseId}-${idx}`}
            className="px-2.5 py-1 rounded-full bg-red-950/80 border border-red-500 text-red-200 text-xs sm:text-sm font-semibold line-through"
          >
            ✖ {disease.name}
          </span>
        );
      })}
    </div>
  );
}
