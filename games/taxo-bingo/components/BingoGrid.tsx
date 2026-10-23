"use client";

import { getOrganism, type Organism } from "@/data/organisms";
import { getTaxon, type TaxonId } from "@/data/taxonomy";
import { toStandardGalactic } from "@/games/taxo-bingo/logic/sga";
import type { MisplacedCellState } from "@/games/taxo-bingo/types";
import { cn } from "@/lib/cn";

export interface BingoGridProps {
  categories: readonly TaxonId[];
  disabled?: boolean;
  hardMode?: boolean;
  filledCells: Readonly<Record<TaxonId, string>>;
  revealedExamples?: Readonly<Record<TaxonId, Organism>>;
  misplacedCell?: MisplacedCellState | null;
  onCellClick: (taxonId: TaxonId) => void;
}

export default function BingoGrid({
  categories,
  disabled = false,
  hardMode = false,
  filledCells,
  revealedExamples,
  misplacedCell,
  onCellClick,
}: BingoGridProps) {
  return (
    <div
      className={cn(
        "grid grid-cols-3 md:grid-cols-4 gap-2 sm:gap-4 px-2 sm:px-0"
      )}
    >
      {categories.map((taxonId) => {
        const taxon = getTaxon(taxonId);
        const filledOrganismId = filledCells[taxonId];
        const filledOrganism = filledOrganismId
          ? getOrganism(filledOrganismId)
          : null;
        const exampleOrganism =
          !filledOrganism && revealedExamples
            ? revealedExamples[taxonId] ?? null
            : null;
        const isShaking = misplacedCell?.taxonId === taxonId;
        const shakeKey = isShaking
          ? `${taxonId}-shake-${misplacedCell.nonce}`
          : taxonId;
        const isCellDisabled = disabled || Boolean(filledOrganism);

        return (
          <button
            key={shakeKey}
            type="button"
            disabled={isCellDisabled}
            aria-label={
              filledOrganism
                ? `${taxon.label}: filled with ${filledOrganism.name}`
                : exampleOrganism
                ? `${taxon.label}: example ${exampleOrganism.name}`
                : taxon.label
            }
            onClick={() => onCellClick(taxonId)}
            className={cn(
              "border-2 border-solid border-[rgb(29,35,73)] sm:h-28 aspect-square sm:aspect-[10/7] bg-cell text-xs sm:text-base text-white rounded flex items-center justify-center text-center font-bold p-2 transition duration-300 overflow-hidden",
              isCellDisabled
                ? "cursor-default pointer-events-none"
                : "cursor-pointer hover:ring-2 ring-blue-400",
              isShaking && "shake-wrong"
            )}
          >
            {filledOrganism ? (
              <div className="relative w-full h-full flex flex-col items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element -- 546 organism WebPs are pre-optimized in public/ to avoid Vercel Image Optimization quota (E2) */}
                <img
                  src={filledOrganism.image}
                  alt={filledOrganism.name}
                  className="w-full h-full object-cover rounded aspect-square sm:aspect-[10/7]"
                />
                <div className="absolute top-1 left-1 backdrop-blur bg-black/50 text-white text-xs sm:text-sm px-1 rounded max-w-[80%] text-ellipsis overflow-hidden font-medium">
                  {taxon.label}
                </div>
              </div>
            ) : exampleOrganism ? (
              <div className="relative w-full h-full flex flex-col items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element -- pre-optimized organism WebP (E2) */}
                <img
                  src={exampleOrganism.image}
                  alt={exampleOrganism.name}
                  className="w-full h-full object-cover rounded aspect-square sm:aspect-[10/7] opacity-30"
                />
                <div className="absolute inset-0 flex flex-col items-center justify-center p-1 bg-black/40 rounded">
                  <p className="max-w-full break-words hyphens-auto text-xs sm:text-sm font-bold">
                    {taxon.label}
                  </p>
                  <p className="text-[10px] sm:text-xs text-gray-200 opacity-85 mt-0.5 leading-tight line-clamp-2">
                    e.g.{" "}
                    <em>
                      {hardMode
                        ? toStandardGalactic(exampleOrganism.name)
                        : exampleOrganism.name}
                    </em>
                  </p>
                </div>
              </div>
            ) : (
              <p className="max-w-full break-words hyphens-auto">
                {taxon.label}
              </p>
            )}
          </button>
        );
      })}
    </div>
  );
}
