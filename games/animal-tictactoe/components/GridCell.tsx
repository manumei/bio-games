"use client";

import { cn } from "@/lib/cn";
import { getAnimal, type Animal } from "../data/animals";
import { TRAITS } from "../data/traits";
import { resolveAnimalImage } from "../logic/images";
import { markSymbol, type VersusMark } from "../logic/versus";

const CLASS_EMOJI_BY_ID = new Map<string, string>(
  TRAITS.filter((t) => t.group === "class").map((t) => [t.id, t.emoji]),
);

function getAnimalClassEmoji(animal: Animal): string {
  for (const t of animal.traits) {
    const emoji = CLASS_EMOJI_BY_ID.get(t);
    if (emoji) return emoji;
  }
  return "🐾";
}

export interface GridCellProps {
  index: number;
  rowLabel: string;
  colLabel: string;
  animalId: string | null;
  mark?: VersusMark | null;
  isCandidate?: boolean;
  isSelected?: boolean;
  isWinningCell?: boolean;
  clickable?: boolean;
  revealExamples?: readonly Animal[];
  onClick?: (index: number) => void;
}

export function GridCell({
  index,
  rowLabel,
  colLabel,
  animalId,
  mark = null,
  isCandidate = false,
  isSelected = false,
  isWinningCell = false,
  clickable = false,
  revealExamples,
  onClick,
}: GridCellProps) {
  const animal = animalId ? getAnimal(animalId) : null;
  const imageSrc = animal ? resolveAnimalImage(animal) : null;

  return (
    <button
      type="button"
      disabled={!clickable}
      onClick={() => clickable && onClick?.(index)}
      aria-label={
        animal
          ? `${rowLabel} × ${colLabel}: ${animal.name}${mark ? ` (${markSymbol(mark)})` : ""}`
          : `${rowLabel} × ${colLabel}: empty`
      }
      className={cn(
        "relative flex aspect-square min-h-[5.5rem] w-full flex-col items-center justify-center overflow-hidden rounded-xl border-2 p-1.5 text-center transition duration-200 sm:min-h-[6.5rem]",
        animal
          ? "border-emerald-500/60 bg-slate-900"
          : "border-slate-700/80 bg-slate-900/60",
        isCandidate &&
          "animate-pulse cursor-pointer border-amber-400 bg-amber-500/15 ring-2 ring-amber-400/70 hover:bg-amber-500/25",
        isSelected &&
          "border-cyan-400 bg-cyan-500/15 ring-2 ring-cyan-400/70",
        isWinningCell && "border-emerald-400 ring-2 ring-emerald-400",
        clickable && !isCandidate && !isSelected && "cursor-pointer hover:border-slate-500",
        !clickable && "cursor-default",
      )}
    >
      {animal ? (
        <div className="relative flex h-full w-full flex-col items-center justify-center">
          {imageSrc ? (
            /* eslint-disable-next-line @next/next/no-img-element -- pre-optimized organism WebP assets */
            <img
              src={imageSrc}
              alt={animal.name}
              className="h-full w-full rounded-lg object-cover"
            />
          ) : (
            <div className="flex flex-col items-center justify-center gap-1 px-1">
              <span className="text-2xl sm:text-3xl" aria-hidden="true">
                {getAnimalClassEmoji(animal)}
              </span>
              <span className="text-xs font-bold leading-tight text-white sm:text-sm">
                {animal.name}
              </span>
            </div>
          )}

          {imageSrc && (
            <div className="absolute inset-x-1 bottom-1 truncate rounded bg-black/70 px-1.5 py-0.5 text-[11px] font-semibold text-white backdrop-blur-xs sm:text-xs">
              {animal.name}
            </div>
          )}

          {mark && (
            <div className="absolute top-1 right-1 rounded-full bg-slate-950/85 px-1.5 py-0.5 text-xs shadow">
              {markSymbol(mark)}
            </div>
          )}
        </div>
      ) : isCandidate ? (
        <div className="flex flex-col items-center gap-1 text-amber-200">
          <span className="text-lg font-bold">Place here</span>
          <span className="text-[11px] opacity-80">Click to select</span>
        </div>
      ) : revealExamples && revealExamples.length > 0 ? (
        <div className="flex flex-col items-center justify-center gap-0.5 px-1 text-[10px] leading-tight text-slate-400/85 sm:text-xs">
          <span className="font-semibold uppercase tracking-wider text-slate-500">
            e.g.
          </span>
          {revealExamples.slice(0, 3).map((ex) => (
            <span key={ex.id} className="line-clamp-1">
              {ex.name}
            </span>
          ))}
        </div>
      ) : (
        <span className="text-xs text-slate-600">
          {isSelected ? "Selected" : "—"}
        </span>
      )}
    </button>
  );
}

