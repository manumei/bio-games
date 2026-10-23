"use client";

import { Linnaeus } from "./Linnaeus";

export interface QuestionCardProps {
  questionNumber: number;
  questionText: string;
  progress: number; // 0..1
  thoughtLine: string;
  loading: boolean;
}

export function QuestionCard({
  questionNumber,
  questionText,
  progress,
  thoughtLine,
  loading,
}: QuestionCardProps) {
  const percentage = Math.round(progress * 100);

  return (
    <div className="flex w-full max-w-xl flex-col items-center gap-4">
      {/* Progress Bar & Counter */}
      <div className="flex w-full items-center justify-between gap-3 text-xs font-semibold text-slate-300">
        <span>Question {questionNumber}</span>
        <div className="flex flex-1 items-center gap-2 max-w-xs">
          <span className="text-[11px] text-slate-400">Certainty:</span>
          <div className="h-2.5 flex-1 rounded-full bg-slate-800 overflow-hidden border border-slate-700">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-emerald-400 transition-all duration-300"
              style={{ width: `${Math.max(5, percentage)}%` }}
            />
          </div>
          <span className="font-mono text-[11px] text-amber-300">
            {percentage}%
          </span>
        </div>
      </div>

      {/* Linnaeus Speech */}
      <Linnaeus
        loading={loading}
        mood="questioning"
        speech={
          <>
            <p className="text-xs italic text-amber-300/90">&ldquo;{thoughtLine}&rdquo;</p>
            <p className="text-base sm:text-lg font-bold leading-snug text-white">
              {questionText}
            </p>
          </>
        }
      />
    </div>
  );
}

