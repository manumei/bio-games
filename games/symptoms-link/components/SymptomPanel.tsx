import { cn } from "@/lib/cn";

export interface SymptomPanelProps {
  index: number; // 1..5
  symptom: string;
  revealed: boolean;
}

export default function SymptomPanel({
  index,
  symptom,
  revealed,
}: SymptomPanelProps) {
  return (
    <div
      className={cn(
        "w-full rounded-lg px-4 py-3 border-2 flex items-center gap-3 transition-all duration-300",
        revealed
          ? "bg-surface border-primary text-white shadow-sm"
          : "bg-panel/60 border-slate-700 text-gray-400"
      )}
    >
      <span
        className={cn(
          "w-7 h-7 rounded-full flex items-center justify-center font-extrabold text-xs shrink-0",
          revealed ? "bg-primary text-white" : "bg-slate-800 text-gray-400"
        )}
      >
        {index}
      </span>

      {revealed ? (
        <p className="text-sm sm:text-base font-semibold text-left">
          {symptom}
        </p>
      ) : (
        <p className="text-sm sm:text-base italic text-gray-400">
          🔒 Symptom {index}
        </p>
      )}
    </div>
  );
}

