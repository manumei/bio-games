import { describe, expect, it } from "vitest";
import { getDisease } from "@/games/symptoms-link/data/diseases";
import {
  createInitialLinkState,
  evaluateDiseaseSubmission,
  linkReducer,
} from "@/games/symptoms-link/logic/reducer";

describe("games/symptoms-link/logic/reducer", () => {
  const target = getDisease("tuberculosis");

  it("enforces all §2 rules: unknown/duplicate no-penalty, lupus toast, skip up to 5, win, and stage-5 loss", () => {
    let state = linkReducer(createInitialLinkState(), {
      type: "START",
      mode: "practice",
      dayKey: null,
      seed: 42,
      disease: target,
    });

    expect(state.stage).toBe(1);

    // Unknown disease -> toast "Not in our disease list", no stage change
    const unknownEval = evaluateDiseaseSubmission(state, null, "fakeitis");
    expect(unknownEval).toEqual({
      status: "unknown",
      toast: "Not in our disease list",
    });

    // Wrong guess of Lupus -> "It's never lupus." toast and stage advances to 2
    const lupusEval = evaluateDiseaseSubmission(state, null, "Lupus");
    expect(lupusEval.status).toBe("accepted");
    expect(lupusEval.toast).toBe("It's never lupus.");
    state = linkReducer(state, {
      type: "GUESS",
      diseaseId: "lupus",
      now: 1000,
    });
    expect(state.stage).toBe(2);

    // Duplicate wrong guess -> "Already tried that one", no penalty
    const dupEval = evaluateDiseaseSubmission(state, "lupus", "Lupus");
    expect(dupEval).toEqual({
      status: "duplicate",
      toast: "Already tried that one",
    });

    // Normal wrong guess -> "Incorrect" toast and stage advances to 3
    const wrongEval = evaluateDiseaseSubmission(state, null, "Malaria");
    expect(wrongEval.toast).toBe("Incorrect");
    state = linkReducer(state, {
      type: "GUESS",
      diseaseId: "malaria",
      now: 2000,
    });
    expect(state.stage).toBe(3);

    // Skip twice -> stage reaches 5; further SKIP does nothing (becomes Give up at stage 5)
    state = linkReducer(state, { type: "SKIP" });
    expect(state.stage).toBe(4);
    state = linkReducer(state, { type: "SKIP" });
    expect(state.stage).toBe(5);
    expect(linkReducer(state, { type: "SKIP" }).stage).toBe(5);

    // Winning at stage 5
    const winState = linkReducer(state, {
      type: "GUESS",
      diseaseId: "tuberculosis",
      now: 3000,
    });
    expect(winState.phase).toBe("over");
    expect(winState.won).toBe(true);

    // Losing at stage 5 via wrong final guess
    const lossState = linkReducer(state, {
      type: "GUESS",
      diseaseId: "cholera",
      now: 3000,
    });
    expect(lossState.phase).toBe("over");
    expect(lossState.won).toBe(false);

    // Input ignored after game over
    expect(
      linkReducer(lossState, {
        type: "GUESS",
        diseaseId: "tuberculosis",
        now: 4000,
      }).won
    ).toBe(false);
  });
});
