"use client";

import { useMemo, useState } from "react";
import Modal from "@/components/ui/Modal";
import { normalizeText } from "@/lib/text";
import { ANIMALS } from "../data/animals";

export interface AnimalListProps {
  open: boolean;
  onClose: () => void;
}

const SORTED_ANIMALS = [...ANIMALS].sort((a, b) =>
  a.name.localeCompare(b.name),
);

export function AnimalList({ open, onClose }: AnimalListProps) {
  const [filter, setFilter] = useState("");

  const filtered = useMemo(() => {
    const q = normalizeText(filter);
    if (!q) return SORTED_ANIMALS;
    return SORTED_ANIMALS.filter(
      (a) =>
        normalizeText(a.name).includes(q) ||
        a.aliases.some((al) => normalizeText(al).includes(q)),
    );
  }, [filter]);

  if (!open) return null;

  return (
    <Modal
      onClose={onClose}
      title="🐾 Animal List"
      showCloseButton
      dismissible
      className="bg-slate-900 p-6 text-white"
    >
      <div className="flex flex-col gap-3">
        <p className="text-xs text-slate-300">
          All {SORTED_ANIMALS.length} animals recognized by Animal Tic-Tac-Toe
          (alphabetical, no traits shown).
        </p>

        <input
          type="search"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="Filter animals..."
          aria-label="Filter animals"
          className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white placeholder-slate-400 focus:border-emerald-400 focus:outline-none"
        />

        <ul className="grid max-h-80 grid-cols-2 gap-1.5 overflow-y-auto pr-1 text-left text-xs text-slate-200 sm:grid-cols-3">
          {filtered.map((animal) => (
            <li
              key={animal.id}
              className="truncate rounded bg-slate-800/70 px-2 py-1"
              title={animal.name}
            >
              {animal.name}
            </li>
          ))}
        </ul>

        {filtered.length === 0 && (
          <p className="py-4 text-center text-xs text-slate-400">
            No animals match &ldquo;{filter}&rdquo;.
          </p>
        )}
      </div>
    </Modal>
  );
}
