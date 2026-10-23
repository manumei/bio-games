"use client";

import { MAX_GUESSES } from "@/games/bio-wordle/config";
import Tile from "@/games/bio-wordle/components/Tile";
import type { TileEval, TileVisualState } from "@/games/bio-wordle/types";
import { cn } from "@/lib/cn";

export interface BoardProps {
  wordLength: number;
  guesses: readonly string[];
  evaluations: readonly (readonly TileEval[])[];
  currentGuess: string;
  shakeNonce: number;
}

export default function Board({
  wordLength,
  guesses,
  evaluations,
  currentGuess,
  shakeNonce,
}: BoardProps) {
  const rows = Array.from({ length: MAX_GUESSES }, (_, rowIdx) => {
    const submittedGuess = guesses[rowIdx];
    const submittedEval = evaluations[rowIdx];
    const isCurrentRow = rowIdx === guesses.length;

    const tiles = Array.from({ length: wordLength }, (__, colIdx) => {
      if (submittedGuess !== undefined && submittedEval !== undefined) {
        return {
          letter: submittedGuess[colIdx] ?? "",
          state: (submittedEval[colIdx] ?? "absent") as TileVisualState,
        };
      }
      if (isCurrentRow) {
        const ch = currentGuess[colIdx] ?? "";
        return {
          letter: ch,
          state: (ch ? "typed" : "empty") as TileVisualState,
        };
      }
      return {
        letter: "",
        state: "empty" as TileVisualState,
      };
    });

    return { rowIdx, isCurrentRow, tiles };
  });

  return (
    <div className="flex flex-col items-center gap-1.5 sm:gap-2 my-2">
      {rows.map(({ rowIdx, isCurrentRow, tiles }) => {
        const rowKey =
          isCurrentRow && shakeNonce > 0
            ? `row-${rowIdx}-shake-${shakeNonce}`
            : `row-${rowIdx}`;

        return (
          <div
            key={rowKey}
            className={cn(
              "flex items-center justify-center gap-1.5 sm:gap-2",
              isCurrentRow && shakeNonce > 0 && "shake-wrong"
            )}
          >
            {tiles.map((tile, colIdx) => (
              <Tile
                key={colIdx}
                letter={tile.letter}
                state={tile.state}
                colIndex={colIdx}
              />
            ))}
          </div>
        );
      })}
    </div>
  );
}

