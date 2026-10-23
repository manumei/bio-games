import { getOrganism } from "@/data/organisms";
import { DISEASE_CATEGORIES } from "@/games/symptoms-link/config";
import type { Disease, OrganismLink } from "@/games/symptoms-link/data/diseases";

export interface DiagnosisCardProps {
  disease: Disease;
  revealedStage: number;
}

function OrganismTieInBadge({
  roleLabel,
  link,
}: {
  roleLabel: string;
  link: OrganismLink;
}) {
  const organism = link.organismId ? getOrganism(link.organismId) : null;

  return (
    <div className="flex items-center gap-3 bg-surface/90 rounded-lg p-2.5 border border-slate-600 text-left">
      {organism && (
        /* eslint-disable-next-line @next/next/no-img-element -- pre-optimized Taxo organism WebP (E2) */
        <img
          src={organism.image}
          alt={organism.name}
          className="w-12 h-12 rounded object-cover shrink-0 border border-accent"
        />
      )}
      <div className="text-xs sm:text-sm">
        <span className="text-gray-300 font-semibold">{roleLabel}: </span>
        <em className="text-accent font-bold">
          {organism ? organism.name : link.label}
        </em>
      </div>
    </div>
  );
}

export default function DiagnosisCard({
  disease,
  revealedStage,
}: DiagnosisCardProps) {
  const categoryInfo = DISEASE_CATEGORIES[disease.category];

  return (
    <div className="bg-panel text-white rounded-xl p-4 space-y-3 border-2 border-primary shadow-md text-left">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-lg sm:text-xl font-extrabold text-accent">
          {disease.emoji} {disease.name}
        </h3>
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-surface text-accent border border-accent/40">
          {categoryInfo.emoji} {categoryInfo.label}
        </span>
      </div>

      {/* All 5 symptoms, marking unseen ones */}
      <ul className="space-y-1 text-xs sm:text-sm">
        {disease.symptoms.map((sym, idx) => {
          const unseen = idx + 1 > revealedStage;
          return (
            <li key={idx} className="flex items-center justify-between gap-2">
              <span>
                <strong>{idx + 1}.</strong> {sym}
              </span>
              {unseen && (
                <span className="text-[10px] uppercase px-1.5 py-0.5 rounded bg-slate-700 text-gray-300 shrink-0">
                  unseen
                </span>
              )}
            </li>
          );
        })}
      </ul>

      {/* Cause / Vector with Taxo Bingo organism image tie-in */}
      {(disease.cause || disease.vector) && (
        <div className="space-y-2 pt-1">
          {disease.cause && (
            <OrganismTieInBadge roleLabel="Caused by" link={disease.cause} />
          )}
          {disease.vector && (
            <OrganismTieInBadge roleLabel="Spread by" link={disease.vector} />
          )}
        </div>
      )}

      <p className="text-xs sm:text-sm text-gray-200 border-t border-slate-700 pt-2">
        💡 {disease.fact}
      </p>
    </div>
  );
}
