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
  if (!organism) return null;

  return (
    <div className="grid grid-cols-[1fr_auto_1fr] items-center justify-items-center">
      {/* Image + Name */}
      <div className="flex flex-col items-center text-center col-start-2 w-64">
        <div className="relative w-48 h-48">
          <img
            src={organism.imagePath}
            alt={organism.name}
            className="object-cover rounded w-full h-full"
          />
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
