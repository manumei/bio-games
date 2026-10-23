"use client";

import Modal from "@/components/ui/Modal";
import {
  DISEASE_CATEGORIES,
  type DiseaseCategory,
} from "@/games/symptoms-link/config";
import { DISEASES } from "@/games/symptoms-link/data/diseases";

export interface GlossaryProps {
  onClose: () => void;
}

export default function Glossary({ onClose }: GlossaryProps) {
  const categoryKeys = Object.keys(DISEASE_CATEGORIES) as DiseaseCategory[];

  return (
    <Modal
      title="📖 Disease Glossary"
      showCloseButton
      onClose={onClose}
      className="sm:w-[36rem]"
    >
      <div className="space-y-4 text-left text-sm">
        <p className="text-xs sm:text-sm text-gray-700">
          Every disease in <strong>Symptoms Link</strong>, grouped by category:
        </p>

        {categoryKeys.map((cat) => {
          const info = DISEASE_CATEGORIES[cat];
          const group = DISEASES.filter((d) => d.category === cat).sort((a, b) =>
            a.name.localeCompare(b.name)
          );
          if (group.length === 0) return null;

          return (
            <div key={cat} className="bg-white/80 rounded-lg p-3 space-y-1.5">
              <h3 className="font-extrabold text-sm sm:text-base text-panel">
                {info.emoji} {info.label} ({group.length})
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {group.map((d) => (
                  <span
                    key={d.id}
                    className="px-2 py-0.5 rounded bg-gray-200 text-gray-900 text-xs font-semibold"
                  >
                    {d.name}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </Modal>
  );
}

