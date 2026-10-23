"use client";

import HardModeToggle from "@/components/ui/HardModeToggle";

export function WordleHardModeButton({
  hardMode,
  onToggle,
}: {
  hardMode: boolean;
  onToggle: () => void;
}) {
  return <HardModeToggle hardMode={hardMode} onToggle={onToggle} />;
}

