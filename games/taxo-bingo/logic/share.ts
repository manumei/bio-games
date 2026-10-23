import { GRID_SIZE } from "@/games/taxo-bingo/config";
import type { TaxoDailyState } from "@/games/taxo-bingo/logic/daily";
import { puzzleNumber } from "@/lib/daily";
import { SITE_CONFIG } from "@/lib/site";

export interface ShareTextOptions {
  dayNumber?: number;
  url?: string;
}

/**
 * Build spoiler-free share text for a completed Taxo Bingo daily puzzle.
 * Matches the 4-column desktop layout (3 rows of 4 cells).
 */
export function buildShareText(
  state: TaxoDailyState,
  opts?: ShareTextOptions
): string {
  const num = opts?.dayNumber ?? puzzleNumber(state.dayKey);
  const url = opts?.url ?? `${SITE_CONFIG.url}/taxo-bingo`;
  const filledCount = Object.keys(state.placements).length;

  const headerLine = `Taxo Bingo #${num} 🧬 ${filledCount}/${GRID_SIZE}${
    state.options.hardMode ? " 💀 Hard" : ""
  }`;

  const mistakesText = `❌ ${state.mistakes} wrong ${
    state.mistakes === 1 ? "click" : "clicks"
  }`;

  let timerSegment: string | null = null;
  if (state.endReason === "timeout") {
    timerSegment = "time's up ⏰";
  } else if (
    state.options.timer !== null &&
    state.deadline !== null &&
    state.endedAt !== null
  ) {
    const secsLeft = Math.max(
      0,
      Math.round((state.deadline - state.endedAt) / 1000)
    );
    timerSegment = `⏱️ ${secsLeft}s left`;
  } else if (state.endReason === "gave-up") {
    timerSegment = "gave up 🏳️";
  }

  const lines: string[] = [headerLine];
  if (timerSegment !== null) {
    lines.push(`${timerSegment} · ${mistakesText}`);
  } else if (state.options.timer !== null || state.mistakes > 0) {
    lines.push(mistakesText);
  }

  // 3 rows of 4 cells matching the 4-column desktop grid
  const cells = state.gridIds.map((id) => (state.placements[id] ? "🟩" : "⬛"));
  for (let row = 0; row < 3; row++) {
    lines.push(cells.slice(row * 4, row * 4 + 4).join(""));
  }

  lines.push(url);
  return lines.join("\n");
}
