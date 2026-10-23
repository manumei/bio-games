"use client";

export function LinkHardModeButton({
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
