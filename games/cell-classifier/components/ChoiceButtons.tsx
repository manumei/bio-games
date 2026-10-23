"use client";

import { useEffect } from "react";
import { CELL_LABELS } from "../config";
import { getPart, type CellType } from "../data/parts";
import type { CellQuestion } from "../logic/questions";

export interface ChoiceButtonsProps {
  question: CellQuestion;
  disabled: boolean;
  selectedOption: string | null;
  onSelectPart: (partId: string) => void;
  onSelectCell: (cell: CellType) => void;
}

export function ChoiceButtons({
  question,
  disabled,
  selectedOption,
  onSelectPart,
  onSelectCell,
}: ChoiceButtonsProps) {
  const options = question.options;

  useEffect(() => {
    if (disabled) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }
      const num = Number(e.key);
      if (num >= 1 && num <= options.length) {
        const picked = options[num - 1];
        if (!picked) return;
        e.preventDefault();
        if (question.type === "classify") {
          onSelectCell(picked as CellType);
        } else {
          onSelectPart(picked);
        }
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [disabled, options, question.type, onSelectPart, onSelectCell]);

  return (
    <div className="grid w-full max-w-xl grid-cols-1 gap-2 sm:grid-cols-2">
      {options.map((optId, idx) => {
        const isCorrectTarget =
          question.type === "classify"
            ? optId === question.cell
            : optId === question.partId;
        const isSelected = selectedOption === optId;

        let style =
          "border-slate-700 bg-slate-900/90 text-slate-100 hover:border-cyan-400 hover:bg-slate-800";
        if (disabled) {
          if (isCorrectTarget) {
            style =
              "border-emerald-400 bg-emerald-500/25 text-emerald-100 font-bold";
          } else if (isSelected) {
            style = "border-red-400 bg-red-500/25 text-red-100";
          } else {
            style = "border-slate-800 bg-slate-900/40 text-slate-500";
          }
        }

        const label =
          question.type === "classify"
            ? CELL_LABELS[optId as CellType]
            : getPart(optId).name;

        return (
          <button
            key={optId}
            type="button"
            disabled={disabled}
            onClick={() =>
              question.type === "classify"
                ? onSelectCell(optId as CellType)
                : onSelectPart(optId)
            }
            className={`flex items-center gap-2.5 rounded-xl border-2 px-4 py-2.5 text-left text-sm transition ${style} ${
              disabled ? "cursor-default" : "cursor-pointer"
            }`}
          >
            <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-slate-800 font-mono text-xs font-bold text-cyan-300">
              {idx + 1}
            </span>
            <span className="flex-1">{label}</span>
          </button>
        );
      })}
    </div>
  );
}

