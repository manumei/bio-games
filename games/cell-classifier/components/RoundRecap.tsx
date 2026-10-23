"use client";

import { CELL_LABELS } from "../config";
import { getPart } from "../data/parts";
import type { CellQuestion } from "../logic/questions";
import type { CellAnswerRecord } from "../logic/reducer";

export interface RoundRecapProps {
  questions: readonly CellQuestion[];
  answers: readonly CellAnswerRecord[];
  selectedIndex: number | null;
  onSelectQuestion: (index: number) => void;
}

export function RoundRecap({
  questions,
  answers,
  selectedIndex,
  onSelectQuestion,
}: RoundRecapProps) {
  return (
    <div className="flex w-full flex-col gap-1.5 text-left">
      <p className="text-xs font-semibold text-slate-700">
        Round Recap (click a question to inspect it on the cell diagram):
      </p>
      <ul className="max-h-56 space-y-1 overflow-y-auto rounded-lg bg-slate-900 p-2 text-xs text-slate-100">
        {questions.map((q, idx) => {
          const rec = answers[idx];
          const part = getPart(q.partId);
          const cellLabel = CELL_LABELS[q.cell];
          const isSelected = selectedIndex === idx;

          return (
            <li key={`${idx}-${q.cell}-${q.partId}`}>
              <button
                type="button"
                onClick={() => onSelectQuestion(idx)}
                className={`flex w-full items-center justify-between gap-2 rounded-md px-2.5 py-1.5 text-left transition ${
                  isSelected
                    ? "bg-cyan-500/25 ring-1 ring-cyan-400"
                    : "hover:bg-slate-800"
                }`}
              >
                <span className="flex items-center gap-2">
                  <span>{rec?.correct ? "✅" : "❌"}</span>
                  <span className="font-semibold">{part.name}</span>
                  <span className="text-[11px] text-slate-400">
                    ({cellLabel} ·{" "}
                    {q.type === "find"
                      ? "Find it"
                      : q.type === "name"
                      ? "Name it"
                      : "Which cell?"}
                    )
                  </span>
                </span>
                <span className="text-[10px] text-cyan-300">Inspect</span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

