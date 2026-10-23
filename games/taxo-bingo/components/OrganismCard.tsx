"use client";

import { useState } from "react";
import TimerDisplay from "@/components/game/TimerDisplay";
import Spinner from "@/components/ui/Spinner";
import type { Organism } from "@/data/organisms";
import { toStandardGalactic } from "@/games/taxo-bingo/logic/sga";
import { useWindowKeydown } from "@/lib/hooks/useWindowKeydown";

export interface OrganismCardProps {
  organism: Organism | null;
  hardMode: boolean;
  onSkip: () => void;
  timeLeft?: number | null;
  disabled?: boolean;
  isImageLoaded: boolean;
  onImageLoad: () => void;
  onImageError: () => void;
  showCheatSheetButton?: boolean;
  onCheatSheetClick?: () => void;
}

function renderOrganismName(name: string, hardMode: boolean) {
  if (hardMode) {
    return <em className="text-xs">{toStandardGalactic(name)}</em>;
  }
  return name;
}

export default function OrganismCard({
  organism,
  hardMode,
  onSkip,
  timeLeft = null,
  disabled = false,
  isImageLoaded,
  onImageLoad,
  onImageError,
  showCheatSheetButton = true,
  onCheatSheetClick,
}: OrganismCardProps) {
  const [zoomedOrganismId, setZoomedOrganismId] = useState<string | null>(null);
  const zoomed = organism !== null && zoomedOrganismId === organism.id;

  useWindowKeydown(
    (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        setZoomedOrganismId(null);
      }
    },
    zoomed
  );

  if (!organism) return null;

  return (
    <>
      <div
        className={`grid grid-cols-3 gap-2 items-center justify-items-center ${
          disabled ? "opacity-50 pointer-events-none" : ""
        }`}
      >
        {/* Cheat Sheet Button */}
        {showCheatSheetButton && (
          <div>
            <button
              type="button"
              onClick={() => {
                if (!hardMode && onCheatSheetClick) onCheatSheetClick();
              }}
              title={
                hardMode
                  ? "Wouldn't be 'Hard Mode' if you could see the Cheat Sheet..."
                  : "View helpful category descriptions"
              }
              className={`font-bold py-2 px-3 w-16 sm:w-30 text-sm sm:text-base rounded transition ${
                hardMode
                  ? "bg-green-200 text-black opacity-50 cursor-not-allowed"
                  : "bg-green-300 text-black hover:bg-green-400 cursor-pointer"
              }`}
            >
              Cheat Sheet
            </button>
          </div>
        )}

        {/* Image + Name */}
        <div className="flex flex-col items-center text-center w-32 sm:w-64 relative">
          <div
            className="relative sm:w-48 sm:h-48 cursor-zoom-in"
            onClick={() => setZoomedOrganismId(organism.id)}
          >
            {!isImageLoaded && (
              <div
                className={`absolute sm:w-48 sm:h-48 inset-0 flex items-center justify-center bg-surface ${
                  organism.image ? "" : "hidden"
                }`}
              >
                <Spinner />
              </div>
            )}
            {/* eslint-disable-next-line @next/next/no-img-element -- 546 organism WebPs are pre-optimized in public/ to avoid Vercel Image Optimization quota (E2) */}
            <img
              key={organism.id}
              src={organism.image}
              alt={organism.name}
              className="object-cover rounded w-32 h-32 sm:w-full sm:h-full"
              onLoad={onImageLoad}
              onError={onImageError}
              title="Click to zoom"
            />
            {isImageLoaded && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setZoomedOrganismId(organism.id);
                }}
                className="w-7.5 h-7.5 absolute -top-3 -right-2.5 bg-[rgba(255,255,255,0.8)] text-black rounded-full z-1 shadow-md flex items-center justify-center hover:bg-[rgba(255,255,255,0.6)] transition duration-300 cursor-pointer"
                title="Zoom Image"
                aria-label="Zoom Image"
              >
                ⛶
              </button>
            )}
          </div>
          <p className="hidden sm:block mt-1 font-bold text-sm sm:text-base text-wrap max-w-full">
            {renderOrganismName(organism.name, hardMode)}
          </p>
        </div>

        {/* Controls (Skip + Timer) */}
        <div className="flex flex-col items-center gap-2">
          <button
            type="button"
            onClick={onSkip}
            disabled={disabled || !isImageLoaded}
            className={`bg-orange-400 text-black font-bold text-sm sm:text-base py-2 px-3 sm:py-2 sm:px-4 rounded transition duration-300 transform cursor-pointer hover:bg-orange-500 ${
              disabled || !isImageLoaded ? "opacity-50 pointer-events-none" : ""
            }`}
          >
            Skip
            <span className="hidden sm:inline text-xs font-normal opacity-80">
              {" "}
              (Space)
            </span>
          </button>
          <TimerDisplay secondsLeft={timeLeft ?? null} />
        </div>
      </div>

      <p
        className={`block sm:hidden font-bold text-lg my-2 sm:text-base text-wrap max-w-full ${
          disabled ? "opacity-50" : ""
        }`}
      >
        {renderOrganismName(organism.name, hardMode)}
      </p>

      {/* Zoom Overlay */}
      {zoomed && (
        <div
          className="fixed inset-0 bg-[#000000df] flex justify-center items-center z-[999]"
          onClick={() => setZoomedOrganismId(null)}
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- pre-optimized organism WebP (E2) */}
          <img
            src={organism.image}
            alt={organism.name}
            className="w-[80vw] h-[80vh] object-contain rounded-md p-2 cursor-zoom-out animate-zoomFade"
          />
        </div>
      )}
    </>
  );
}
