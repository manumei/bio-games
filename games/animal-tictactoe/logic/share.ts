import { puzzleNumber } from "@/lib/daily";

export interface FormatTicTacShareArgs {
  dayKey: string;
  cells: readonly (string | null)[];
  guessesUsed: number;
  hardMode: boolean;
}

export function formatTicTacShare({
  dayKey,
  cells,
  guessesUsed,
  hardMode,
}: FormatTicTacShareArgs): string {
  const num = puzzleNumber(dayKey);
  const filled = cells.filter((c) => c !== null).length;
  const guessWord = guessesUsed === 1 ? "guess" : "guesses";
  const hardSuffix = hardMode ? " 💀 Hard" : "";

  const header = `Animal Tic-Tac-Toe #${num} 🐾 ${filled}/9 · ${guessesUsed} ${guessWord}${hardSuffix}`;

  const gridLines: string[] = [];
  for (let r = 0; r < 3; r++) {
    let rowStr = "";
    for (let c = 0; c < 3; c++) {
      rowStr += cells[r * 3 + c] !== null ? "🟩" : "⬛";
    }
    gridLines.push(rowStr);
  }

  return [header, ...gridLines, "https://bio-games.vercel.app/animal-tictactoe"].join("\n");
}

