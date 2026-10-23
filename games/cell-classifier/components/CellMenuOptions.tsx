"use client";

export interface CellMenuOptionsProps {
  hardMode: boolean;
  onToggleHardMode: () => void;
}

export function CellMenuOptions({
  hardMode,
  onToggleHardMode,
}: CellMenuOptionsProps) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      <button
        type="button"
        onClick={onToggleHardMode}
        className={`cursor-pointer rounded px-4 py-2 transition duration-300 ${
          hardMode ? "bg-[#ff0000] font-bold text-white" : "bg-red-200 text-black"
        } hover:opacity-80`}
      >
        Hard Mode {hardMode ? "✔" : "✖"}
      </button>
    </div>
  );
}

