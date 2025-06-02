import { useState, useEffect } from "react";

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
  isImageLoaded?: boolean;
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
  isImageLoaded,
  setIsImageLoaded,
  showCheatSheetButton,
  onCheatSheetClick,
}: Props) {
  const [zoomed, setZoomed] = useState(false);

  const sgaMap = {
    a: "ᔑ",
    b: "ʖ",
    c: "ᓵ",
    d: "↸",
    e: "ᒷ",
    f: "⎓",
    g: "⊣",
    h: "⍑",
    i: "╎",
    j: "⋮",
    k: "ꖌ",
    l: "ꖎ",
    m: "ᒲ",
    n: "リ",
    o: "𝙹",
    p: "!¡",
    q: "ᑑ",
    r: "∷",
    s: "ᓭ",
    t: "ℸ ̣",
    u: "⚍",
    v: "⍊",
    w: "∴",
    x: " ̇/",
    y: "||",
    z: "⨅",
  };

  const convertToSga = (text: string) => {
    return text
      .toLowerCase()
      .split("")
      .map((char: string) => sgaMap[char as keyof typeof sgaMap] || char)
      .join("");
  };

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
        <div className="flex flex-col items-center text-center w-32 sm:w-64 relative">
          <div
            className="relative sm:w-48 sm:h-48 cursor-zoom-in"
            onClick={() => setZoomed(true)}
          >
            {/* Loading Spinner */}
            {!isImageLoaded && (
              <div
                className={`absolute sm:w-48 sm:h-48 inset-0 flex items-center justify-center bg-custom-1 ${
                  organism.imagePath ? "" : "hidden"
                }`}
              >
                <div className="w-8 h-8 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
              </div>
            )}
            <img
              src={organism.imagePath}
              alt={organism.name}
              className="object-cover rounded w-32 h-32 sm:w-full sm:h-full"
              onLoad={() => setIsImageLoaded(true)}
              title="Click to zoom"
            />
            {isImageLoaded && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setZoomed(true);
                }}
                className="w-7.5 h-7.5 absolute -top-3 -right-2.5 bg-[rgba(255,255,255,0.8)] text-black rounded-full 
              z-1 shadow-md flex items-center justify-center hover:bg-[rgba(255,255,255,0.6)] transition duration-300 cursor-pointer"
                title="Zoom Image"
              >
                ⛶
              </button>
            )}
          </div>
          <p className="hidden sm:block mt-1 font-bold text-sm sm:text-base text-wrap max-w-full">
            {hardMode ? (
              <em className="text-xs">{convertToSga(organism.name)}</em>
            ) : (
              organism.name
            )}
          </p>
        </div>

        {/* Controls (Skip + Timer) */}
        <div className="flex flex-col items-center gap-2">
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
            <div className="text-yellow-300 font-bold text-sm sm:text-base text-center">
              <span className="hidden sm:inline">Time Left:</span>
              <span className="inline sm:hidden">Timer:</span>
              <span> {timeLeft}s</span>
            </div>
          )}
        </div>
      </div>
      <p
        className={`block sm:hidden font-bold text-lg my-2 sm:text-base text-wrap max-w-full ${
          disabled ? "opacity-50" : ""
        }`}
      >
        {hardMode ? (
          <em className="text-xs">{convertToSga(organism.name)}</em>
        ) : (
          organism.name
        )}
      </p>

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
