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
}

export default function OrganismCard({
  organism,
  hardMode,
  onSkip,
  timeLeft = null,
  disabled = false,
}: Props) {
  const [zoomed, setZoomed] = useState(false);
  if (!organism) return null;

  return (
    <>
      <div className={`grid grid-cols-[1fr_auto_1fr] items-center justify-items-center ${disabled ? 'opacity-50 pointer-events-none' : ''}`}>
        {/* Image + Name */}
        <div className="flex flex-col items-center text-center col-start-2 w-64 relative">
          <div
            className="relative w-48 h-48 cursor-zoom-in"
            onClick={() => !disabled && setZoomed(true)}
          >
            <img
              src={organism.imagePath}
              alt={organism.name}
              className="object-cover rounded w-full h-full"
            />
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (!disabled) setZoomed(true);
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
            className={`bg-orange-400 text-black font-bold py-2 px-4 rounded transition duration-300 transform cursor-pointer hover:bg-orange-500 ${disabled ? 'opacity-50 pointer-events-none' : ''}`}
          >
            Skip
          </button>
          {timeLeft !== null && (
            <div className="text-yellow-300 font-bold text-lg min-w-[11ch] text-center">
              Time Left: <span>{timeLeft}s</span>
            </div>
          )}
        </div>
      </div>
  
      {/* Zoom Overlay */}
      {zoomed && !disabled && (
        <div
          id="zoom-overlay"
          className="fixed inset-0 bg-black bg-opacity-65 flex justify-center items-center z-[999]"
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
