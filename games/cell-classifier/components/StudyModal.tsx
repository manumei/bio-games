"use client";

import { useState } from "react";
import Modal from "@/components/ui/Modal";
import { CELL_LABELS } from "../config";
import { partsForCell, type CellType } from "../data/parts";
import { CellDiagram } from "../diagrams/CellDiagram";

export interface StudyModalProps {
  open: boolean;
  onClose: () => void;
}

const TABS: readonly CellType[] = ["animal", "plant", "bacteria"];

export function StudyModal({ open, onClose }: StudyModalProps) {
  const [tab, setTab] = useState<CellType>("animal");
  const [highlightId, setHighlightId] = useState<string | null>(null);

  if (!open) return null;

  const parts = partsForCell(tab, 3);

  return (
    <Modal
      onClose={onClose}
      title="📖 Study Diagrams (Cheat Sheet)"
      showCloseButton
      dismissible
      className="bg-slate-900 p-6 text-white"
    >
      <div className="flex flex-col gap-4">
        {/* Tabs */}
        <div className="flex items-center justify-center gap-2">
          {TABS.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => {
                setTab(t);
                setHighlightId(null);
              }}
              className={`rounded-lg px-3.5 py-1.5 text-xs font-bold transition sm:text-sm ${
                tab === t
                  ? "bg-cyan-500 text-slate-950"
                  : "bg-slate-800 text-slate-200 hover:bg-slate-700"
              }`}
            >
              {CELL_LABELS[t]}
            </button>
          ))}
        </div>

        {/* Diagram with showLabels */}
        <div className="flex flex-col items-center rounded-xl border border-slate-800 bg-slate-950/80 p-3">
          <CellDiagram
            cell={tab}
            showLabels
            highlight={highlightId}
            onPartClick={(id) =>
              setHighlightId((prev) => (prev === id ? null : id))
            }
          />
          <p className="mt-1 text-[11px] text-slate-400">
            Click any structure or legend entry below to highlight it on the{" "}
            {CELL_LABELS[tab].toLowerCase()}.
          </p>
        </div>

        {/* Legend list of name: fn */}
        <ul className="max-h-60 space-y-1.5 overflow-y-auto pr-1 text-left text-xs">
          {parts.map((part) => {
            const active = highlightId === part.id;
            return (
              <li key={part.id}>
                <button
                  type="button"
                  onClick={() =>
                    setHighlightId((prev) => (prev === part.id ? null : part.id))
                  }
                  className={`w-full rounded-lg border px-3 py-2 text-left transition ${
                    active
                      ? "border-amber-400 bg-amber-500/15 text-amber-100"
                      : "border-slate-800 bg-slate-800/60 text-slate-200 hover:bg-slate-800"
                  }`}
                >
                  <strong className="text-cyan-300">{part.name}:</strong>{" "}
                  <span>{part.fn}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </Modal>
  );
}

