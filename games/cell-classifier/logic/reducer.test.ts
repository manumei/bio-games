import { describe, expect, it } from "vitest";
import { PASS_SCORE } from "../config";
import { UNKNOWN_PART_TOAST } from "./messages";
import type { CellQuestion } from "./questions";
import { cellReducer, createInitialCellState } from "./reducer";

const MOCK_QUESTIONS: CellQuestion[] = [
  {
    type: "name",
    cell: "animal",
    partId: "golgi",
    options: ["golgi", "nucleus", "mitochondrion", "lysosome"],
  },
  {
    type: "find",
    cell: "plant",
    partId: "chloroplast",
    options: [],
  },
  {
    type: "classify",
    cell: "bacteria",
    partId: "nucleoid",
    options: ["animal", "plant", "bacteria"],
    cluePartIds: ["nucleoid", "plasmid", "flagellum"],
  },
];

describe("cellReducer", () => {
  it("handles multiple-choice and find-it answers and waits for NEXT_QUESTION", () => {
    let s = cellReducer(createInitialCellState(), {
      type: "START_ROUND",
      seed: 1,
      questions: MOCK_QUESTIONS,
    });

    // Q0: Name it (correct)
    s = cellReducer(s, { type: "ANSWER_PART", partId: "golgi" });
    expect(s.awaitingNext).toBe(true);
    expect(s.score).toBe(1);
    expect(s.feedback).toContain("✅ Golgi apparatus:");

    s = cellReducer(s, { type: "NEXT_QUESTION" });
    expect(s.currentIndex).toBe(1);
    expect(s.awaitingNext).toBe(false);

    // Q1: Find it (wrong)
    s = cellReducer(s, { type: "ANSWER_PART", partId: "nucleus" });
    expect(s.awaitingNext).toBe(true);
    expect(s.score).toBe(1);
    expect(s.feedback).toContain("❌ It was the Chloroplast:");

    s = cellReducer(s, { type: "NEXT_QUESTION" });
    expect(s.currentIndex).toBe(2);

    // Q2: Classify cell (correct)
    s = cellReducer(s, { type: "ANSWER_CELL", cell: "bacteria" });
    expect(s.awaitingNext).toBe(true);
    expect(s.score).toBe(2);

    s = cellReducer(s, { type: "NEXT_QUESTION" });
    expect(s.phase).toBe("over");
  });

  it("accepts normalized aliases in hard mode and does not penalize unknown text", () => {
    let s = cellReducer(createInitialCellState({ hardMode: true }), {
      type: "START_ROUND",
      seed: 2,
      options: { hardMode: true },
      questions: MOCK_QUESTIONS,
    });

    // Unknown text -> toast, no penalty
    s = cellReducer(s, { type: "ANSWER_TEXT", text: "midichlorians" });
    expect(s.awaitingNext).toBe(false);
    expect(s.answers).toHaveLength(0);
    expect(s.toastMessage).toBe(UNKNOWN_PART_TOAST);

    // Alias "Golgi body" -> matches golgi!
    s = cellReducer(s, { type: "ANSWER_TEXT", text: "  Golgi Body " });
    expect(s.awaitingNext).toBe(true);
    expect(s.score).toBe(1);
    expect(s.answers[0]).toEqual({ correct: true, given: "golgi" });
  });

  it("marks unanswered questions as wrong on GIVE_UP and enforces PASS_SCORE = 8", () => {
    const tenQuestions: CellQuestion[] = Array.from({ length: 10 }, () => ({
      type: "find",
      cell: "animal",
      partId: "mitochondrion",
      options: [],
    }));

    let s = cellReducer(createInitialCellState(), {
      type: "START_ROUND",
      seed: 3,
      questions: tenQuestions,
    });

    // Answer 8 correctly, then 2 wrong -> passed!
    for (let i = 0; i < 10; i++) {
      s = cellReducer(s, {
        type: "ANSWER_PART",
        partId: i < PASS_SCORE ? "mitochondrion" : "nucleus",
      });
      s = cellReducer(s, { type: "NEXT_QUESTION" });
    }
    expect(s.phase).toBe("over");
    expect(s.score).toBe(8);
    expect(s.passed).toBe(true);
    expect(s.outcome).toBe("completed");

    // Start again, answer 1, then give up
    let s2 = cellReducer(createInitialCellState(), {
      type: "START_ROUND",
      seed: 4,
      questions: tenQuestions,
    });
    s2 = cellReducer(s2, { type: "ANSWER_PART", partId: "mitochondrion" });
    s2 = cellReducer(s2, { type: "GIVE_UP" });
    expect(s2.phase).toBe("over");
    expect(s2.outcome).toBe("gave-up");
    expect(s2.answers).toHaveLength(10);
    expect(s2.answers[0].correct).toBe(true);
    expect(s2.answers[9]).toEqual({ correct: false, given: null });
  });
});

