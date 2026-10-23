import { describe, expect, it } from "vitest";
import { validateFeedbackRequest, validateNextRequest } from "./validate";

describe("validateNextRequest", () => {
  it("accepts valid next requests", () => {
    const valid = {
      answers: [
        { questionId: "is_animalia", answer: "yes" },
        { questionId: "is_chordata", answer: "probably" },
      ],
      rejectedGuesses: ["panthera_leo"],
    };
    expect(validateNextRequest(valid)).toEqual(valid);
  });

  it("rejects non-object or missing fields", () => {
    expect(validateNextRequest(null)).toBeNull();
    expect(validateNextRequest("string")).toBeNull();
    expect(validateNextRequest({})).toBeNull();
    expect(validateNextRequest({ answers: [] })).toBeNull();
  });

  it("rejects invalid answers enum or invalid question IDs", () => {
    expect(
      validateNextRequest({
        answers: [{ questionId: "is_animalia", answer: "maybe" }],
        rejectedGuesses: [],
      }),
    ).toBeNull();

    expect(
      validateNextRequest({
        answers: [{ questionId: "IS_ANIMALIA!", answer: "yes" }],
        rejectedGuesses: [],
      }),
    ).toBeNull();
  });

  it("rejects arrays exceeding limits", () => {
    const hugeAnswers = Array.from({ length: 101 }, (_, i) => ({
      questionId: `q_${i}`,
      answer: "yes",
    }));
    expect(
      validateNextRequest({
        answers: hugeAnswers,
        rejectedGuesses: [],
      }),
    ).toBeNull();

    const hugeRejections = Array.from({ length: 21 }, (_, i) => `org_${i}`);
    expect(
      validateNextRequest({
        answers: [],
        rejectedGuesses: hugeRejections,
      }),
    ).toBeNull();
  });
});

describe("validateFeedbackRequest", () => {
  it("accepts valid feedback requests with id or name actual", () => {
    expect(
      validateFeedbackRequest({
        answers: [],
        rejectedGuesses: [],
        outcome: "guessed",
        finalGuessId: "panthera_leo",
        actual: { id: "panthera_leo" },
      }),
    ).toBeTruthy();

    expect(
      validateFeedbackRequest({
        answers: [],
        rejectedGuesses: [],
        outcome: "not_guessed",
        finalGuessId: null,
        actual: { name: "Loch Ness Monster" },
      }),
    ).toBeTruthy();
  });

  it("rejects invalid feedback outcome or name > 80 chars", () => {
    expect(
      validateFeedbackRequest({
        answers: [],
        rejectedGuesses: [],
        outcome: "unknown_outcome",
        finalGuessId: null,
        actual: null,
      }),
    ).toBeNull();

    expect(
      validateFeedbackRequest({
        answers: [],
        rejectedGuesses: [],
        outcome: "not_guessed",
        finalGuessId: null,
        actual: { name: "A".repeat(81) },
      }),
    ).toBeNull();
  });
});

