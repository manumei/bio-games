import "server-only";

import { ORGANISMS, type Organism } from "@/data/organisms";
import { ANIMALS } from "@/games/animal-tictactoe/data/animals";
import { GUESS_THRESHOLD, MAX_GUESSES, MAX_QUESTIONS } from "../config";
import { QUESTIONS, getQuestion, type TaxonQuestion } from "../data/questions";
import type { Answer, NextRequest, NextResponse } from "../api/types";
import { createRng, hashString, shuffle } from "@/lib/rng";

const COMMON_NAMES = new Map<string, string>();
for (const a of ANIMALS) {
  if (a.scientificName) {
    COMMON_NAMES.set(a.scientificName.toLowerCase(), a.name);
  }
}

const WEIGHT_MULTIPLIERS: Record<Answer, { hasTrue: number; hasFalse: number }> = {
  yes: { hasTrue: 1.0, hasFalse: 0.02 },
  no: { hasTrue: 0.02, hasFalse: 1.0 },
  probably: { hasTrue: 0.8, hasFalse: 0.25 },
  probably_not: { hasTrue: 0.25, hasFalse: 0.8 },
  dont_know: { hasTrue: 1.0, hasFalse: 1.0 },
};

function computeNormalizedEntropy(probs: ArrayLike<number>, n: number): number {
  if (n <= 1) return 1;
  const maxEntropy = Math.log(n);
  let entropy = 0;
  for (let i = 0; i < probs.length; i++) {
    const p = probs[i];
    if (p > 0) {
      entropy -= p * Math.log(p);
    }
  }
  const normalized = 1 - entropy / maxEntropy;
  return Math.min(1, Math.max(0, normalized));
}

export function nextStep(req: NextRequest): NextResponse {
  if (req.rejectedGuesses.length >= MAX_GUESSES) {
    return { kind: "give_up" };
  }

  const rejectedSet = new Set(req.rejectedGuesses);
  const askedQuestionIds = new Set(req.answers.map((a) => a.questionId));

  // 1. Compute unnormalized weights
  const weights = new Float64Array(ORGANISMS.length);
  for (let i = 0; i < ORGANISMS.length; i++) {
    const org = ORGANISMS[i];
    if (rejectedSet.has(org.id)) {
      weights[i] = 0;
      continue;
    }

    let w = 1.0;
    for (const ans of req.answers) {
      const q = getQuestion(ans.questionId);
      const has = org.path.includes(q.taxonId);
      const mult = WEIGHT_MULTIPLIERS[ans.answer];
      w *= has ? mult.hasTrue : mult.hasFalse;
    }
    weights[i] = w;
  }

  // 2. Normalize
  let totalWeight = 0;
  for (let i = 0; i < weights.length; i++) {
    totalWeight += weights[i];
  }

  if (totalWeight <= 0) {
    return { kind: "give_up" };
  }

  const probs = new Float64Array(weights.length);
  let maxProb = -1;
  for (let i = 0; i < weights.length; i++) {
    const p = weights[i] / totalWeight;
    probs[i] = p;
    if (p > maxProb) {
      maxProb = p;
    }
  }

  // 3. Check for candidate questions
  const unaskedQuestions = QUESTIONS.filter((q) => !askedQuestionIds.has(q.id));
  const candidateQuestions: { question: TaxonQuestion; p: number; diff: number }[] = [];

  for (const q of unaskedQuestions) {
    let mass = 0;
    for (let i = 0; i < ORGANISMS.length; i++) {
      if (ORGANISMS[i].path.includes(q.taxonId)) {
        mass += probs[i];
      }
    }
    if (mass > 0.05 && mass < 0.95) {
      candidateQuestions.push({
        question: q,
        p: mass,
        diff: Math.abs(mass - 0.5),
      });
    }
  }

  candidateQuestions.sort((a, b) => {
    if (Math.abs(a.diff - b.diff) > 1e-9) {
      return a.diff - b.diff;
    }
    return a.question.id.localeCompare(b.question.id);
  });

  const progress = computeNormalizedEntropy(probs, ORGANISMS.length);

  // 4. Decide whether to guess
  const shouldGuess =
    candidateQuestions.length === 0 ||
    maxProb >= GUESS_THRESHOLD ||
    req.answers.length >= MAX_QUESTIONS;

  if (shouldGuess) {
    // Find all organisms with maxProb (allowing tiny float epsilon)
    const topIndices: number[] = [];
    for (let i = 0; i < probs.length; i++) {
      if (probs[i] >= maxProb - 1e-9) {
        topIndices.push(i);
      }
    }

    const rngSeed = hashString(JSON.stringify(req));
    const rng = createRng(rngSeed);
    const chosenIndex = shuffle(topIndices, rng)[0];
    const topOrg: Organism = ORGANISMS[chosenIndex];

    const commonName = COMMON_NAMES.get(topOrg.name.toLowerCase()) ?? null;

    return {
      kind: "guess",
      guess: {
        id: topOrg.id,
        name: topOrg.name,
        commonName,
        image: topOrg.image,
      },
      confidence: Math.min(1, Math.max(0, maxProb)),
    };
  }

  // 5. Ask best question
  const best = candidateQuestions[0].question;
  return {
    kind: "question",
    question: {
      id: best.id,
      text: best.text,
    },
    progress,
  };
}

