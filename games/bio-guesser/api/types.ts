export type Answer =
  | "yes"
  | "no"
  | "probably"
  | "probably_not"
  | "dont_know";

export interface AnsweredQuestion {
  questionId: string;
  answer: Answer;
}

export interface NextRequest {
  answers: AnsweredQuestion[];
  rejectedGuesses: string[];
}

export type NextResponse =
  | {
      kind: "question";
      question: { id: string; text: string };
      progress: number;
    }
  | {
      kind: "guess";
      guess: {
        id: string;
        name: string;
        commonName?: string | null;
        image: string | null;
      };
      confidence: number;
    }
  | { kind: "give_up" };

export interface FeedbackRequest {
  answers: AnsweredQuestion[];
  rejectedGuesses: string[];
  outcome: "guessed" | "not_guessed";
  finalGuessId: string | null;
  actual: { id: string } | { name: string } | null;
}

