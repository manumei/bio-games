import { describe, expect, it } from "vitest";
import type { WordleDailyState } from "@/games/bio-wordle/logic/daily";
import { buildShareText } from "@/games/bio-wordle/logic/share";

describe("games/bio-wordle/logic/share", () => {
  it("matches the Step 6 share format verbatim", () => {
    // Answer: "enzyme" (6 letters)
    // Row 1: ⬛🟨⬛⬛⬛⬛ -> "xexxxx" (e at pos 2 is present)
    // Row 2: 🟨⬛🟩⬛⬛🟨 -> "yxxzxx" -> wait: e(0)=present, n(1)=absent? No: n(0)=present, x(1)=absent, z(2)=correct, x(3)=absent, x(4)=absent, e(5)=correct? No, m(5)=present -> "nxzxxm"
    // Row 3: 🟩🟩🟩⬛🟩🟩 -> "enzxme"
    // Row 4: 🟩🟩🟩🟩🟩🟩 -> "enzyme"
    const state: WordleDailyState = {
      version: 1,
      dayKey: "2026-02-11",
      options: { hardMode: true },
      status: "won",
      startedAt: 1000,
      deadline: null,
      endedAt: 2000,
      endReason: "completed",
      answer: "enzyme",
      guesses: ["xexxxx", "nxzxxm", "enzxme", "enzyme"],
      hintUsed: true,
    };

    const text = buildShareText(state, {
      dayNumber: 42,
      url: "https://bio-games.vercel.app/bio-wordle",
    });

    expect(text).toBe(
      [
        "Bio Wordle #42 4/6 · 6 letters 💀 Hard 💡",
        "⬛🟨⬛⬛⬛⬛",
        "🟨⬛🟩⬛⬛🟨",
        "🟩🟩🟩⬛🟩🟩",
        "🟩🟩🟩🟩🟩🟩",
        "https://bio-games.vercel.app/bio-wordle",
      ].join("\n")
    );
  });

  it("formats X/6 on loss and omits optional badges when not used", () => {
    const state: WordleDailyState = {
      version: 1,
      dayKey: "2026-02-11",
      options: { hardMode: false },
      status: "lost",
      startedAt: 1000,
      deadline: null,
      endedAt: 2000,
      endReason: "failed",
      answer: "cell",
      guesses: ["xxxx", "xxxx", "xxxx", "xxxx", "xxxx", "xxxx"],
      hintUsed: false,
    };

    const text = buildShareText(state, { dayNumber: 7 });
    expect(text.split("\n")[0]).toBe("Bio Wordle #7 X/6 · 4 letters");
  });
});

