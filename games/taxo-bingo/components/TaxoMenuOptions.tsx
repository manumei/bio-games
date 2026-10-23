"use client";

import HardModeToggle from "@/components/ui/HardModeToggle";
import SegmentedControl from "@/components/ui/SegmentedControl";
import {
  HARD_MODE_TIMER,
  TIMER_OPTIONS,
  type TimerOption,
} from "@/games/taxo-bingo/config";

export interface TaxoMenuOptionsProps {
  timer: TimerOption;
  hardMode: boolean;
  onTimerChange: (timer: TimerOption) => void;
}

export function TaxoHardModeButton({
  hardMode,
  onToggle,
}: {
  hardMode: boolean;
  onToggle: () => void;
}) {
  return <HardModeToggle hardMode={hardMode} onToggle={onToggle} />;
}

export default function TaxoMenuOptions({
  timer,
  hardMode,
  onTimerChange,
}: TaxoMenuOptionsProps) {
  const options = TIMER_OPTIONS.map((opt) => ({
    value: opt,
    label: opt === null ? "No Timer" : `${opt}s`,
    disabled: hardMode && opt !== HARD_MODE_TIMER,
    disabledReason: "Disabled for Hard Mode",
  }));

  return (
    <SegmentedControl
      label="Select your timer below:"
      options={options}
      value={timer}
      onChange={onTimerChange}
    />
  );
}
