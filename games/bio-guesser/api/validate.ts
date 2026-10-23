import type { Answer, FeedbackRequest, NextRequest } from "./types";

const ID_REGEX = /^[a-z0-9_]{1,64}$/;

const VALID_ANSWERS = new Set<Answer>([
  "yes",
  "no",
  "probably",
  "probably_not",
  "dont_know",
]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function validateNextRequest(body: unknown): NextRequest | null {
  if (!isRecord(body)) return null;

  const { answers, rejectedGuesses } = body;
  if (!Array.isArray(answers) || answers.length > 100) return null;
  if (!Array.isArray(rejectedGuesses) || rejectedGuesses.length > 20) return null;

  for (const item of answers) {
    if (!isRecord(item)) return null;
    if (typeof item.questionId !== "string" || !ID_REGEX.test(item.questionId)) {
      return null;
    }
    if (typeof item.answer !== "string" || !VALID_ANSWERS.has(item.answer as Answer)) {
      return null;
    }
  }

  for (const id of rejectedGuesses) {
    if (typeof id !== "string" || !ID_REGEX.test(id)) {
      return null;
    }
  }

  return {
    answers: answers as NextRequest["answers"],
    rejectedGuesses: rejectedGuesses as string[],
  };
}

export function validateFeedbackRequest(body: unknown): FeedbackRequest | null {
  if (!isRecord(body)) return null;

  const { answers, rejectedGuesses, outcome, finalGuessId, actual } = body;
  if (!Array.isArray(answers) || answers.length > 100) return null;
  if (!Array.isArray(rejectedGuesses) || rejectedGuesses.length > 20) return null;

  for (const item of answers) {
    if (!isRecord(item)) return null;
    if (typeof item.questionId !== "string" || !ID_REGEX.test(item.questionId)) {
      return null;
    }
    if (typeof item.answer !== "string" || !VALID_ANSWERS.has(item.answer as Answer)) {
      return null;
    }
  }

  for (const id of rejectedGuesses) {
    if (typeof id !== "string" || !ID_REGEX.test(id)) {
      return null;
    }
  }

  if (outcome !== "guessed" && outcome !== "not_guessed") {
    return null;
  }

  if (
    finalGuessId !== null &&
    (typeof finalGuessId !== "string" || !ID_REGEX.test(finalGuessId))
  ) {
    return null;
  }

  if (actual !== null) {
    if (!isRecord(actual)) return null;
    if ("id" in actual) {
      if (typeof actual.id !== "string" || !ID_REGEX.test(actual.id)) {
        return null;
      }
    } else if ("name" in actual) {
      if (
        typeof actual.name !== "string" ||
        actual.name.trim().length === 0 ||
        actual.name.length > 80
      ) {
        return null;
      }
    } else {
      return null;
    }
  }

  return {
    answers: answers as FeedbackRequest["answers"],
    rejectedGuesses: rejectedGuesses as string[],
    outcome,
    finalGuessId: finalGuessId as string | null,
    actual: actual as FeedbackRequest["actual"],
  };
}

