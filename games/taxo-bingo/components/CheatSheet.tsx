"use client";

import Modal from "@/components/ui/Modal";
import { TAXONOMY } from "@/data/taxonomy";

export interface CheatSheetProps {
  onClose: () => void;
}

export default function CheatSheet({ onClose }: CheatSheetProps) {
  return (
    <Modal
      title="Taxo Cheat Sheet"
      showCloseButton
      closeButtonTitle="Close"
      dismissible
      onClose={onClose}
      className="max-w-[80vw] md:max-w-[45rem] w-full max-h-[70vh] p-6 text-left"
    >
      <ul className="text-sm md:text-base leading-relaxed space-y-2">
        {TAXONOMY.map((taxon) => (
          <li key={taxon.id}>
            <strong>
              {taxon.label} {taxon.emoji}
            </strong>
            : {taxon.description}
          </li>
        ))}
      </ul>
    </Modal>
  );
}
