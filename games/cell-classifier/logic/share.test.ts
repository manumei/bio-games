import { describe, expect, it } from "vitest";
import { formatCellShare } from "./share";

describe("formatCellShare", () => {
  it("matches the spec worked example for hard mode", () => {
    const answers = Array.from({ length: 10 }, (_, idx) => ({
      correct: idx !== 2,
      given: "golgi",
    }));
    const text = formatCellShare({
      dayKey: "2026-01-05",
      answers,
      hardMode: true,
    });
    expect(text).toBe(
      [
        "Cell Classifier #5 🔬 9/10 💀 Hard",
        "🟩🟩🟥🟩🟩🟩🟩🟩🟩🟩",
        "https://bio-games.vercel.app/cell-classifier",
      ].join("\n"),
    );
  });
});

