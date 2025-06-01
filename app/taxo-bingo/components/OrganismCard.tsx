import { useState } from "react";

interface Organism {
  name: string;
  imagePath: string;
}

interface Props {
  organism: Organism | null;
  hardMode: boolean;
  onSkip: () => void;
  timeLeft?: number | null;
  disabled?: boolean;
  setIsImageLoaded: (loaded: boolean) => void;
  showCheatSheetButton?: boolean;
  onCheatSheetClick?: () => void;
}

export default function OrganismCard({
  organism,
  hardMode,
  onSkip,
  timeLeft = null,
  disabled = false,
  setIsImageLoaded,
  showCheatSheetButton,
  onCheatSheetClick,
}: Props) {
  const [zoomed, setZoomed] = useState(false);
  if (!organism) return null;

  return (
    <>
      <div
        className={`grid grid-cols-[1fr_auto_1fr] items-center justify-items-center ${
          disabled ? "opacity-50 pointer-events-none" : ""
        }`}
      >
        {/* Cheat Sheet Button */}
        {showCheatSheetButton && (
          <div className="col-start-1">
            <button
              onClick={() => {
                if (!hardMode && onCheatSheetClick) onCheatSheetClick();
              }}
              title={
                hardMode
                  ? "Wouldn't be 'Hard Mode' if you could see the Cheat Sheet..."
                  : "View helpful category descriptions"
              }
              className={`font-bold py-2 px-3 w-16 sm:w-30 text-sm sm:text-base rounded transition 
                ${
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
        <div className="flex flex-col items-center text-center col-start-2 w-32 sm:w-64 relative">
          <div
            className="relative sm:w-48 sm:h-48 cursor-zoom-in"
            onClick={() => setZoomed(true)}
          >
            <img
              src={organism.imagePath}
              alt={organism.name}
              className="object-cover rounded w-full h-full"
              onLoad={() => setIsImageLoaded(true)}
              title="Click to zoom"
            />
            <button
              onClick={(e) => {
                e.stopPropagation();
                setZoomed(true);
              }}
              className="w-7.5 h-7.5 absolute -top-3 -right-2.5 bg-[rgba(255,255,255,0.8)] text-black rounded-full z-1 shadow-md flex items-center justify-center hover:bg-[rgba(255,255,255,0.6)] transition duration-300 cursor-pointer"
              title="Zoom Image"
            >
              ⛶
            </button>
          </div>
          <p className="mt-1 font-bold text-[1.1rem] truncate max-w-full">
            {hardMode ? <em>❓❓❓</em> : organism.name}
          </p>
        </div>

        {/* Controls (Skip + Timer) */}
        <div className="flex flex-col items-center gap-2 col-start-3">
          <button
            onClick={onSkip}
            disabled={disabled}
            className={`bg-orange-400 text-black font-bold text-sm sm:text-base py-2 px-3 sm:py-2 sm:px-4 rounded transition duration-300 transform cursor-pointer hover:bg-orange-500 ${
              disabled ? "opacity-50 pointer-events-none" : ""
            }`}
          >
            Skip
          </button>
          {timeLeft !== null && (
            <div className="text-yellow-300 font-bold text-sm sm:text-base min-w-[11ch] text-center">
              Time Left: <span>{timeLeft}s</span>
            </div>
          )}
        </div>
      </div>

      {/* Zoom Overlay */}
      {zoomed && (
        <div
          id="zoom-overlay"
          className="fixed inset-0 bg-[#000000df] flex justify-center items-center z-[999]"
          onClick={() => setZoomed(false)}
        >
          <img
            src={organism.imagePath}
            alt={organism.name}
            className="zoomed-image w-[80vw] h-[80vh] object-contain rounded-md p-2 cursor-zoom-out animate-zoomFade"
          />
        </div>
      )}
    </>
  );
}
