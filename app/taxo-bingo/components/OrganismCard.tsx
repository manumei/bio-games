interface Organism {
  name: string;
  imagePath: string;
}

interface Props {
  organism: Organism | null;
  hardMode: boolean;
  onSkip: () => void;
}

export default function OrganismCard({ organism, hardMode, onSkip }: Props) {
  if (!organism) return null;

  return (
    <div className="flex items-center gap-8">
      <div className="relative w-64 h-64">
        <img
          src={organism.imagePath}
          alt={organism.name}
          className="object-cover rounded w-full h-full"
        />
      </div>
      <div className="flex flex-col gap-2">
        <p className="text-xl font-bold text-center">
          {hardMode ? <em>❓❓❓</em> : organism.name}
        </p>
        <button
          onClick={onSkip}
          className="bg-orange-400 hover:bg-orange-500 text-black font-bold py-2 px-4 rounded"
        >
          Skip
        </button>
      </div>
    </div>
  );
}
