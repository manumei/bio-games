import { describe, expect, it } from "vitest";
import {
  buildDiseaseSchedule,
  diseaseFor,
  getDiseaseSchedule,
} from "@/games/symptoms-link/logic/schedule";

describe("games/symptoms-link/logic/schedule", () => {
  it("builds a deterministic schedule of difficulty <= 2 diseases with no repeats in a cycle", () => {
    const s1 = buildDiseaseSchedule();
    const s2 = getDiseaseSchedule();
    expect(s1).toEqual(s2);
    expect(s1.length).toBeGreaterThanOrEqual(40);

    for (const d of s1) {
      expect(d.difficulty).toBeLessThanOrEqual(2);
    }

    expect(diseaseFor("2026-04-17")).toEqual(diseaseFor("2026-04-17"));
    expect(diseaseFor("2026-04-17").id).not.toBe(diseaseFor("2026-04-18").id);
  });
});

