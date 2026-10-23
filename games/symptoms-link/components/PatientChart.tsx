import { DISEASE_CATEGORIES, HINT_STAGE } from "@/games/symptoms-link/config";
import SymptomPanel from "@/games/symptoms-link/components/SymptomPanel";
import type { Disease } from "@/games/symptoms-link/data/diseases";
import { HARD_MODE_GLOSSARY_TOOLTIP } from "@/games/symptoms-link/logic/messages";

export interface PatientChartProps {
  patientLabel: string;
  disease: Disease;
  stage: number;
  hardMode: boolean;
  isGameOver: boolean;
  onOpenGlossary: () => void;
}

export default function PatientChart({
  patientLabel,
  disease,
  stage,
  hardMode,
  isGameOver,
  onOpenGlossary,
}: PatientChartProps) {
  const showCategoryHint = !hardMode && (stage >= HINT_STAGE || isGameOver);
  const categoryInfo = DISEASE_CATEGORIES[disease.category];

  return (
    <div className="w-full max-w-xl bg-panel rounded-xl border-2 border-green-600 p-4 sm:p-6 space-y-4 shadow-lg">
      {/* Header row */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-700 pb-3">
        <div className="flex items-center gap-2">
          <span className="text-lg sm:text-xl font-extrabold text-accent">
            🩺 {patientLabel}
          </span>
          {hardMode && (
            <span className="bg-red-600 text-white px-2 py-0.5 rounded text-xs font-bold">
              💀 Hard
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={() => {
            if (!hardMode) onOpenGlossary();
          }}
          title={
            hardMode
              ? HARD_MODE_GLOSSARY_TOOLTIP
              : "Browse all diseases by category"
          }
          className={`px-3 py-1.5 rounded font-bold text-xs sm:text-sm transition ${
            hardMode
              ? "bg-green-200 text-black opacity-50 cursor-not-allowed"
              : "bg-green-300 text-black hover:bg-green-400 cursor-pointer"
          }`}
        >
          📖 Disease Glossary
        </button>
      </div>

      {/* Mystery card */}
      <div className="bg-surface/80 rounded-lg p-3 text-center space-y-1.5 border border-slate-600">
        <p className="text-base sm:text-lg font-extrabold text-white">
          {isGameOver
            ? `${disease.emoji} ${disease.name}`
            : "❓ Mystery disease"}
        </p>
        {showCategoryHint && (
          <div className="flex justify-center">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-panel text-accent border border-accent/40">
              {categoryInfo.emoji} {categoryInfo.label}
            </span>
          </div>
        )}
      </div>

      {/* 5 symptom panels */}
      <div className="space-y-2">
        {disease.symptoms.map((symptom, idx) => (
          <SymptomPanel
            key={idx}
            index={idx + 1}
            symptom={symptom}
            revealed={idx + 1 <= stage}
          />
        ))}
      </div>
    </div>
  );
}

