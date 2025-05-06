interface Organism {
  name: string;
  imagePath: string;
  categories: string[];
}

interface Props {
  organism: Organism | null;
  onUseOrganism: (org: Organism) => void;
}

export default function BingoGrid({ organism, onUseOrganism }: Props) {
  return (
    <div className="grid grid-cols-4 gap-4 mt-8">
      {[...Array(12)].map((_, i) => (
        <div
          key={i}
          className="w-40 h-28 bg-gray-700 text-white rounded flex items-center justify-center text-center font-bold p-2 cursor-pointer hover:bg-green-600"
          onClick={() => {
            if (organism) {
              onUseOrganism(organism);
            }
          }}
        >
          Category {i + 1}
        </div>
      ))}
    </div>
  );
}
