"use client";

import { CELL_LABELS, ROUND_SIZE } from "../config";
import { getPart } from "../data/parts";
import type { CellQuestion } from "../logic/questions";

export interface QuestionBannerProps {
  question: CellQuestion;
  index: number;
  score: number;
}

export function QuestionBanner({
  question,
  index,
  score,
}: QuestionBannerProps) {
  const part = getPart(question.partId);
  const cellLabel = CELL_LABELS[question.cell];

  return (
    <div className="flex w-full max-w-xl flex-col items-center gap-2 rounded-xl border border-slate-700/80 bg-slate-900/90 px-4 py-3 text-center shadow-md">
      <div className="flex w-full items-center justify-between text-xs font-semibold text-slate-400">
        <span>
          Question <strong className="text-white">{index + 1}</strong> /{" "}
          {ROUND_SIZE}
        </span>
        {question.type !== "classify" && (
          <span className="rounded-full bg-cyan-500/20 px-2.5 py-0.5 text-cyan-300">
            {cellLabel}
          </span>
        )}
        <span>
          Score: <strong className="text-emerald-400">{score}</strong>
        </span>
      </div>

      {question.type === "find" && (
        <p className="text-sm font-medium text-slate-100 sm:text-base">
          🔎 Click the{" "}
          <strong className="text-amber-300 underline decoration-amber-400/60 underline-offset-4">
            {part.name}
          </strong>
        </p>
      )}

      {question.type === "name" && (
        <p className="text-sm font-medium text-slate-100 sm:text-base">
          ✨ What is the{" "}
          <strong className="text-amber-300">highlighted structure</strong>?
        </p>
      )}

      {question.type === "classify" && (
        <div className="flex flex-col items-center gap-2">
          <p className="text-sm font-medium text-slate-100 sm:text-base">
            🧬 <strong>Which cell is it?</strong> Identify the cell type that
            contains all three structures:
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {(question.cluePartIds ?? [question.partId]).map((id) => (
              <span
                key={id}
                className="rounded-lg border border-emerald-500/40 bg-emerald-500/15 px-3 py-1 text-xs font-bold text-emerald-200 sm:text-sm"
              >
                {getPart(id).name}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

