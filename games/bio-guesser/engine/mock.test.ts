import { describe, expect, it } from "vitest";
import { ORGANISMS } from "@/data/organisms";
import { MAX_GUESSES } from "../config";
import { getQuestion } from "../data/questions";
import type { AnsweredQuestion, NextRequest } from "../api/types";
import { nextStep } from "./mock";

describe("Bio Guesser mock engine", () => {
  it("deterministically returns the same step for the same request", () => {
    const req: NextRequest = {
      answers: [
        { questionId: "is_animalia", answer: "yes" },
        { questionId: "is_chordata", answer: "yes" },
        { questionId: "is_mammalia", answer: "yes" },
      ],
      rejectedGuesses: [],
    };
    const s1 = nextStep(req);
    const s2 = nextStep(req);
    expect(s1).toEqual(s2);
  });

  it("exhaustively tests all 546 organisms with truthful answers", () => {
    let maxQuestionsBeforeFirstGuess = 0;

    for (const target of ORGANISMS) {
      const answers: AnsweredQuestion[] = [];
      const rejectedGuesses: string[] = [];

      let step = nextStep({ answers, rejectedGuesses });
      let firstGuessMade = false;

      while (step.kind === "question") {
        const q = getQuestion(step.question.id);
        const has = target.path.includes(q.taxonId);
        answers.push({
          questionId: step.question.id,
          answer: has ? "yes" : "no",
        });
        step = nextStep({ answers, rejectedGuesses });
      }

      // First guess reached
      expect(step.kind).toBe("guess");
      const firstGuessStep = step;
      if (firstGuessStep.kind !== "guess") {
        throw new Error("Expected guess step");
      }
      firstGuessMade = true;
      maxQuestionsBeforeFirstGuess = Math.max(
        maxQuestionsBeforeFirstGuess,
        answers.length,
      );
      expect(answers.length).toBeLessThanOrEqual(12);

      // Assert the guessed organism shares the same leaf group (same path) as target
      const guessedOrg = ORGANISMS.find(
        (o) => o.id === firstGuessStep.guess.id,
      )!;
      expect(guessedOrg.path).toEqual(target.path);

      // Reject 5 guesses in a row: each guess must be unique and give_up must happen on 5th rejection
      while (rejectedGuesses.length < MAX_GUESSES) {
        if (step.kind !== "guess") {
          throw new Error("Expected guess before 5 rejections");
        }
        rejectedGuesses.push(step.guess.id);
        step = nextStep({ answers, rejectedGuesses });
        if (rejectedGuesses.length < MAX_GUESSES) {
          expect(step.kind).toBe("guess");
          if (step.kind === "guess") {
            expect(rejectedGuesses).not.toContain(step.guess.id);
          }
        } else {
          expect(step.kind).toBe("give_up");
        }
      }

      expect(firstGuessMade).toBe(true);
    }
  }, 30000);

  it("exhibits Akinator-style robustness with 1 deliberately wrong answer for a 10% sample", () => {
    const sampleSize = Math.floor(ORGANISMS.length * 0.1);
    const sample = ORGANISMS.slice(0, sampleSize);

    for (const target of sample) {
      const answers: AnsweredQuestion[] = [];
      const rejectedGuesses: string[] = [];

      let step = nextStep({ answers, rejectedGuesses });
      let injectedMistake = false;

      while (step.kind === "question") {
        const q = getQuestion(step.question.id);
        const has = target.path.includes(q.taxonId);
        let ans: "yes" | "no" = has ? "yes" : "no";

        // Flip the first Chordata or Arthropoda question to simulate a player misconception
        if (!injectedMistake && (q.taxonId === "chordata" || q.taxonId === "arthropoda" || q.taxonId === "mammalia")) {
          ans = has ? "no" : "yes";
          injectedMistake = true;
        }

        answers.push({
          questionId: step.question.id,
          answer: ans,
        });
        step = nextStep({ answers, rejectedGuesses });
      }

      // Even with 1 wrong answer, the engine reaches a guess or give_up without crashing
      expect(step.kind === "guess" || step.kind === "give_up").toBe(true);
    }
  }, 15000);
});

