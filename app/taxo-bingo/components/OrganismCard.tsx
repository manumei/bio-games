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
}

export default function OrganismCard({
  organism,
  hardMode,
  onSkip,
  timeLeft = null,
}: Props) {
  const [zoomed, setZoomed] = useState(false);
  if (!organism) return null;

  return (
    <div className="grid grid-cols-[1fr_auto_1fr] items-center justify-items-center">
      {/* Image + Name */}
      <div className="flex flex-col items-center text-center col-start-2 w-64 relative">
        <div
          className="relative w-48 h-48 cursor-zoom-in"
          onClick={() => setZoomed(true)}
        >
          <img
            src={organism.imagePath}
            alt={organism.name}
            className="object-cover rounded w-full h-full"
          />
          <button
            onClick={(e) => {
              e.stopPropagation();
              setZoomed(true);
            }}
            className="w-7.5 h-7.5 absolute -top-3 -right-2.5 bg-[rgba(255,255,255,0.8)] text-black rounded-full z-1 flex items-center justify-center hover:bg-[rgba(255,255,255,0.6)] transition duration-300 cursor-pointer"
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
          className="bg-orange-400 text-black font-bold py-2 px-4 rounded transition duration-300 transform cursor-pointer hover:bg-orange-500"
        >
          Skip
        </button>
        {timeLeft !== null && (
          <div className="text-yellow-300 font-bold text-lg">
            Time Left: <span>{timeLeft}s</span>
          </div>
        )}
      </div>
    </div>
  );
}
