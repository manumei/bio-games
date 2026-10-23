"use client";

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
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`py-2 px-4 rounded transition duration-300 ${
        hardMode ? "font-bold bg-[#ff0000] text-white" : "bg-red-200 text-black"
      } hover:opacity-80 cursor-pointer`}
    >
      Hard Mode {hardMode ? "✔" : "✖"}
    </button>
  );
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
