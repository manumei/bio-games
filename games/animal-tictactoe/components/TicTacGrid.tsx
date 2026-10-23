"use client";

import { Fragment } from "react";
import { getTrait } from "../data/traits";
import { answersFor } from "../logic/grid";
import type { VersusMark } from "../logic/versus";
import { GridCell } from "./GridCell";
import { TraitHeader } from "./TraitHeader";

export interface TicTacGridProps {
  rows: readonly [string, string, string];
  cols: readonly [string, string, string];
  cells: readonly (string | null)[];
  marks?: readonly (VersusMark | null)[];
  candidateCells?: readonly number[];
  selectedCell?: number | null;
  winningLine?: readonly number[] | null;
  revealOnEmpty?: boolean;
  allowEmptyCellClick?: boolean;
  cornerContent: React.ReactNode;
  onCellClick?: (index: number) => void;
}

export function TicTacGrid({
  rows,
  cols,
  cells,
  marks,
  candidateCells = [],
  selectedCell = null,
  winningLine = null,
  revealOnEmpty = false,
  allowEmptyCellClick = false,
  cornerContent,
  onCellClick,
}: TicTacGridProps) {
  const rowTraits = rows.map((id) => getTrait(id));
  const colTraits = cols.map((id) => getTrait(id));

  return (
    <div className="mx-auto grid w-full max-w-2xl grid-cols-4 gap-2 sm:gap-3">
      {/* Top-left corner */}
      <div className="flex flex-col items-center justify-center rounded-xl border border-slate-800 bg-slate-900/60 p-2 text-center">
        {cornerContent}
      </div>

      {/* Column headers */}
      {colTraits.map((colTrait) => (
        <TraitHeader key={colTrait.id} trait={colTrait} axis="col" />
      ))}

      {/* 3 rows of (Row header + 3 cells) */}
      {rowTraits.map((rowTrait, r) => (
        <Fragment key={rowTrait.id}>
          <TraitHeader trait={rowTrait} axis="row" />
          {colTraits.map((colTrait, c) => {
            const idx = r * 3 + c;
            const animalId = cells[idx] ?? null;
            const isCandidate = candidateCells.includes(idx);
            const isSelected = selectedCell === idx;
            const isWinningCell = winningLine?.includes(idx) ?? false;
            const clickable =
              isCandidate || (allowEmptyCellClick && animalId === null);
            const revealExamples =
              revealOnEmpty && animalId === null
                ? answersFor(rowTrait.id, colTrait.id).slice(0, 3)
                : undefined;

            return (
              <GridCell
                key={`${rowTrait.id}-${colTrait.id}`}
                index={idx}
                rowLabel={rowTrait.label}
                colLabel={colTrait.label}
                animalId={animalId}
                mark={marks?.[idx] ?? null}
                isCandidate={isCandidate}
                isSelected={isSelected}
                isWinningCell={isWinningCell}
                clickable={clickable}
                revealExamples={revealExamples}
                onClick={onCellClick}
              />
            );
          })}
        </Fragment>
      ))}
    </div>
  );
}

