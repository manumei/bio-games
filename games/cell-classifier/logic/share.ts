import { puzzleNumber } from "@/lib/daily";
import { ROUND_SIZE } from "../config";
import type { CellAnswerRecord } from "./reducer";

export interface FormatCellShareArgs {
  dayKey: string;
  answers: readonly CellAnswerRecord[];
  hardMode: boolean;
}

export function formatCellShare({
  dayKey,
  answers,
  hardMode,
}: FormatCellShareArgs): string {
  const num = puzzleNumber(dayKey);
  const score = answers.filter((a) => a.correct).length;
  const hardSuffix = hardMode ? " 💀 Hard" : "";
  const header = `Cell Classifier #${num} 🔬 ${score}/${ROUND_SIZE}${hardSuffix}`;

  let bar = "";
  for (let i = 0; i < ROUND_SIZE; i++) {
    const rec = answers[i];
    if (!rec || rec.given === null) {
      bar += "⬛";
    } else if (rec.correct) {
      bar += "🟩";
    } else {
      bar += "🟥";
    }
  }

  return [header, bar, "https://bio-games.vercel.app/cell-classifier"].join("\n");
}

