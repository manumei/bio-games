"use client";

import { cn } from "@/lib/cn";

export interface SegmentedOption<T> {
  value: T;
  label: string;
  disabled?: boolean;
  disabledReason?: string;
}

export interface SegmentedControlProps<T> {
  label?: string;
  options: readonly SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
}

export default function SegmentedControl<T>({
  label,
  options,
  value,
  onChange,
}: SegmentedControlProps<T>) {
  return (
    <div className="space-y-1">
      {label && <p>{label}</p>}
      <div className="flex gap-2">
        {options.map((option) => {
          const isSelected = option.value === value;
          const isDisabled = Boolean(option.disabled);
          return (
            <button
              key={String(option.value)}
              type="button"
              onClick={() => {
                if (!isDisabled) onChange(option.value);
              }}
              className={cn(
                "px-4 py-2 rounded transition duration-200",
                isSelected
                  ? "bg-[#00C8FF] text-black hover:opacity-80"
                  : isDisabled
                  ? "bg-gray-700 opacity-50 cursor-not-allowed"
                  : "bg-gray-700 hover:bg-gray-600 cursor-pointer"
              )}
              title={isDisabled ? option.disabledReason ?? "" : ""}
              disabled={isDisabled}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
