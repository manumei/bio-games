"use client";

import HardModeToggle from "@/components/ui/HardModeToggle";

export interface CellMenuOptionsProps {
  hardMode: boolean;
  onToggleHardMode: () => void;
}

export function CellMenuOptions({
  hardMode,
  onToggleHardMode,
}: CellMenuOptionsProps) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      <HardModeToggle
        hardMode={hardMode}
        onToggle={onToggleHardMode}
      />
    </div>
  );
}

