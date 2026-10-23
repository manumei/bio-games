"use client";

import { useEffect } from "react";
import type { Answer } from "../api/types";

export interface AnswerButtonsProps {
  disabled: boolean;
  canUndo: boolean;
  onAnswer: (answer: Answer) => void;
  onUndo: () => void;
}

const BUTTONS: readonly {
  answer: Answer;
  label: string;
  keyHint: string;
  style: string;
}[] = [
  {
    answer: "yes",
    label: "Yes",
    keyHint: "1 / Y",
    style: "bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-400",
  },
  {
    answer: "no",
    label: "No",
    keyHint: "2 / N",
    style: "bg-red-600 hover:bg-red-500 text-white border-red-400",
  },
  {
    answer: "dont_know",
    label: "Don't know",
    keyHint: "3",
    style: "bg-slate-700 hover:bg-slate-600 text-slate-100 border-slate-500",
  },
  {
    answer: "probably",
    label: "Probably",
    keyHint: "4",
    style: "bg-teal-700 hover:bg-teal-600 text-teal-100 border-teal-500",
  },
  {
    answer: "probably_not",
    label: "Probably not",
    keyHint: "5",
    style: "bg-rose-800 hover:bg-rose-700 text-rose-100 border-rose-500",
  },
];

export function AnswerButtons({
  disabled,
  canUndo,
  onAnswer,
  onUndo,
}: AnswerButtonsProps) {
  useEffect(() => {
    if (disabled) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }
      const k = e.key.toLowerCase();
      if (k === "1" || k === "y") {
        e.preventDefault();
        onAnswer("yes");
      } else if (k === "2" || k === "n") {
        e.preventDefault();
        onAnswer("no");
      } else if (k === "3") {
        e.preventDefault();
        onAnswer("dont_know");
      } else if (k === "4") {
        e.preventDefault();
        onAnswer("probably");
      } else if (k === "5") {
        e.preventDefault();
        onAnswer("probably_not");
      } else if (k === "z" && (e.ctrlKey || e.metaKey)) {
        if (canUndo) {
          e.preventDefault();
          onUndo();
        }
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [disabled, canUndo, onAnswer, onUndo]);

  return (
    <div className="flex w-full max-w-xl flex-col items-center gap-3">
      <div className="grid w-full grid-cols-2 gap-2.5 sm:grid-cols-5">
        {BUTTONS.map((btn) => (
          <button
            key={btn.answer}
            type="button"
            disabled={disabled}
            onClick={() => onAnswer(btn.answer)}
            className={`flex flex-col items-center justify-center rounded-xl border-2 px-3 py-2.5 text-center font-bold shadow transition active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${btn.style}`}
          >
            <span className="text-sm sm:text-base leading-tight">{btn.label}</span>
            <span className="mt-0.5 text-[10px] font-mono opacity-80">
              [{btn.keyHint}]
            </span>
          </button>
        ))}
      </div>

      <div className="flex items-center gap-4 text-xs">
        <button
          type="button"
          disabled={disabled || !canUndo}
          onClick={onUndo}
          className="rounded-lg bg-slate-800 px-3 py-1.5 font-semibold text-slate-300 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
        >
          ↩ Undo last answer
        </button>
      </div>
    </div>
  );
}

