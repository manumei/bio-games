"use client";

import { useEffect } from "react";
import Button from "@/components/ui/Button";

export interface AnswerFeedbackProps {
  feedback: string;
  isLast: boolean;
  onNext: () => void;
}

export function AnswerFeedback({
  feedback,
  isLast,
  onNext,
}: AnswerFeedbackProps) {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        onNext();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onNext]);

  const isCorrect = feedback.startsWith("✅");

  return (
    <div
      role="status"
      className={`flex w-full max-w-xl flex-col items-center justify-between gap-3 rounded-xl border-2 px-4 py-3 sm:flex-row ${
        isCorrect
          ? "border-emerald-500/60 bg-emerald-950/60 text-emerald-100"
          : "border-red-500/60 bg-red-950/60 text-red-100"
      }`}
    >
      <p className="text-left text-xs leading-relaxed sm:text-sm">{feedback}</p>
      <Button variant="primary" onClick={onNext}>
        {isLast ? "Finish ▶" : "Next ▶"}
      </Button>
    </div>
  );
}

