import { WORD_LENGTHS, type Topic, type WordLength } from "@/games/bio-wordle/config";
import rawAnswers from "@/games/bio-wordle/data/answers.json";

export interface Answer {
  word: string;
  topic: Topic;
  definition: string;
}

export const WORDLE_ANSWERS: readonly Answer[] = rawAnswers as Answer[];

export const ANSWERS_BY_LENGTH: Readonly<Record<WordLength, readonly Answer[]>> = {
  4: WORDLE_ANSWERS.filter((a) => a.word.length === 4),
  5: WORDLE_ANSWERS.filter((a) => a.word.length === 5),
  6: WORDLE_ANSWERS.filter((a) => a.word.length === 6),
  7: WORDLE_ANSWERS.filter((a) => a.word.length === 7),
};

const ANSWER_MAP = new Map<string, Answer>(
  WORDLE_ANSWERS.map((ans) => [ans.word.toLowerCase(), ans])
);

export function getAnswer(word: string): Answer | undefined {
  return ANSWER_MAP.get(word.toLowerCase());
}

export function isSupportedLength(len: number): len is WordLength {
  return (WORD_LENGTHS as readonly number[]).includes(len);
}

