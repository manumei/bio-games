import { describe, expect, it } from "vitest";
import { formatTicTacShare } from "./share";

describe("formatTicTacShare", () => {
  it("matches the spec worked example for hard mode win", () => {
    const shareText = formatTicTacShare({
      dayKey: "2026-01-07",
      cells: Array(9).fill("lion"),
      guessesUsed: 11,
      hardMode: true,
    });
    expect(shareText).toBe(
      [
        "Animal Tic-Tac-Toe #7 🐾 9/9 · 11 guesses 💀 Hard",
        "🟩🟩🟩",
        "🟩🟩🟩",
        "🟩🟩🟩",
        "https://bio-games.vercel.app/animal-tictactoe",
      ].join("\n"),
    );
  });

  it("renders ⬛ for empty cells and omits 💀 Hard in normal mode", () => {
    const shareText = formatTicTacShare({
      dayKey: "2026-01-01",
      cells: ["lion", null, "koala", null, "macaw", null, null, null, null],
      guessesUsed: 6,
      hardMode: false,
    });
    expect(shareText).toBe(
      [
        "Animal Tic-Tac-Toe #1 🐾 3/9 · 6 guesses",
        "🟩⬛🟩",
        "⬛🟩⬛",
        "⬛⬛⬛",
        "https://bio-games.vercel.app/animal-tictactoe",
      ].join("\n"),
    );
  });
});

