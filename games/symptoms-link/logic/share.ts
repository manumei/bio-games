import { MAX_STAGE } from "@/games/symptoms-link/config";
import type { LinkDailyState } from "@/games/symptoms-link/logic/daily";
import { puzzleNumber } from "@/lib/daily";
import { SITE_CONFIG } from "@/lib/site";

export interface LinkShareOptions {
  dayNumber?: number;
  url?: string;
}

/**
 * Build spoiler-free share text for Symptoms Link matching Step 9.
 * 🟥 wrong guess, 🟨 skip, 🟩 solved, ⬜ never needed.
 */
export function buildShareText(
  state: LinkDailyState,
  opts?: LinkShareOptions
): string {
  const num = opts?.dayNumber ?? puzzleNumber(state.dayKey);
  const url = opts?.url ?? `${SITE_CONFIG.url}/symptoms-link`;
  const score =
    state.status === "won" ? `${state.stage}/${MAX_STAGE}` : `X/${MAX_STAGE}`;

  const header = `Symptoms Link #${num} 🩺 ${score}${
    state.options.hardMode ? " 💀 Hard" : ""
  }`;

  const squares: string[] = [];
  for (let i = 0; i < MAX_STAGE; i++) {
    const entry = state.log[i];
    if (entry) {
      squares.push(entry.kind === "wrong" ? "🟥" : "🟨");
    } else if (state.status === "won" && i === state.stage - 1) {
      squares.push("🟩");
    } else if (state.status === "lost") {
      squares.push("🟨");
    } else {
      squares.push("⬜");
    }
  }

  return [header, squares.join(""), url].join("\n");
}

