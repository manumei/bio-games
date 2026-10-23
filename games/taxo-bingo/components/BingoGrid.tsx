"use client";

import { getOrganism } from "@/data/organisms";
import { getTaxon, type TaxonId } from "@/data/taxonomy";
import type { MisplacedCellState } from "@/games/taxo-bingo/types";
import { cn } from "@/lib/cn";

export interface BingoGridProps {
  categories: readonly TaxonId[];
  disabled?: boolean;
  filledCells: Readonly<Record<TaxonId, string>>;
  misplacedCell?: MisplacedCellState | null;
  onCellClick: (taxonId: TaxonId) => void;
}

export default function BingoGrid({
  categories,
  disabled = false,
  filledCells,
  misplacedCell,
  onCellClick,
}: BingoGridProps) {
  return (
    <div
      className={cn(
        "grid grid-cols-3 md:grid-cols-4 gap-2 sm:gap-4 px-2 sm:px-0",
        disabled && "opacity-50 pointer-events-none"
      )}
    >
      {categories.map((taxonId) => {
        const taxon = getTaxon(taxonId);
        const filledOrganismId = filledCells[taxonId];
        const filledOrganism = filledOrganismId
          ? getOrganism(filledOrganismId)
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
                : taxon.label
            }
            onClick={() => onCellClick(taxonId)}
            className={cn(
              "border-2 border-solid border-[rgb(29,35,73)] sm:h-28 aspect-square sm:aspect-[10/7] bg-cell text-xs sm:text-base text-white rounded flex items-center justify-center text-center font-bold p-2 transition duration-300",
              isCellDisabled
                ? "cursor-default pointer-events-none"
                : "cursor-pointer hover:ring-2 ring-blue-400",
              isShaking && "shake-wrong"
            )}
          >
            {filledOrganism ? (
              <div className="relative w-full flex flex-col items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element -- 546 organism WebPs are pre-optimized in public/ to avoid Vercel Image Optimization quota (E2) */}
                <img
                  src={filledOrganism.image}
                  alt={filledOrganism.name}
                  className="w-full object-cover rounded aspect-square sm:aspect-[10/7]"
                />
                <div className="absolute top-1 left-1 backdrop-blur bg-black/50 text-white text-xs sm:text-sm px-1 rounded max-w-[80%] text-ellipsis overflow-hidden font-medium">
                  {taxon.label}
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
