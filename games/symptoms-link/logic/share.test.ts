import { describe, expect, it } from "vitest";
import type { LinkDailyState } from "@/games/symptoms-link/logic/daily";
import { buildShareText } from "@/games/symptoms-link/logic/share";

describe("games/symptoms-link/logic/share", () => {
  it("matches the Step 9 share text example verbatim", () => {
    const state: LinkDailyState = {
      version: 1,
      dayKey: "2026-01-12",
      options: { hardMode: true },
      status: "won",
      startedAt: 1000,
      deadline: null,
      endedAt: 2000,
      endReason: "completed",
      diseaseId: "tuberculosis",
      stage: 3,
      log: [{ kind: "wrong", diseaseId: "malaria" }, { kind: "skip" }],
    };

    const text = buildShareText(state, {
      dayNumber: 12,
      url: "https://bio-games.vercel.app/symptoms-link",
    });

    expect(text).toBe(
      [
        "Symptoms Link #12 🩺 3/5 💀 Hard",
        "🟥🟨🟩⬜⬜",
        "https://bio-games.vercel.app/symptoms-link",
      ].join("\n")
    );
  });

  it("formats X/5 and five non-green squares on loss", () => {
    const lostState: LinkDailyState = {
      version: 1,
      dayKey: "2026-01-12",
      options: { hardMode: false },
      status: "lost",
      startedAt: 1000,
      deadline: null,
      endedAt: 2000,
      endReason: "failed",
      diseaseId: "tuberculosis",
      stage: 5,
      log: [
        { kind: "wrong", diseaseId: "malaria" },
        { kind: "skip" },
        { kind: "wrong", diseaseId: "cholera" },
        { kind: "skip" },
        { kind: "wrong", diseaseId: "rabies" },
      ],
    };

    const text = buildShareText(lostState, { dayNumber: 12 });
    const lines = text.split("\n");
    expect(lines[0]).toBe("Symptoms Link #12 🩺 X/5");
    expect(lines[1]).toBe("🟥🟨🟥🟨🟥");
    expect(lines[1]).not.toContain("🟩");
  });
});

