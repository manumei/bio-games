interface Organism {
  name: string;
  imagePath: string;
  categories: string[];
}

interface Props {
  categories: string[];
  disabled?: boolean;
  filledCells: { [category: string]: Organism };
  onCellClick: (category: string) => void;
  shakingCell?: string | null;
}

export default function BingoGrid({
  categories,
  disabled = false,
  filledCells,
  onCellClick,
  shakingCell,
}: Props) {
  return (
    <div
      className={`grid grid-cols-4 gap-4 ${
        disabled ? "opacity-50 pointer-events-none" : ""
      }`}
    >
      {categories.map((category, i) => {
        const filled = filledCells[category];
        const isShaking = shakingCell === category;
        return (
          <div
            key={i}
            className={`border-2 border-solid border-[rgb(47,37,81)] w-40 h-28 bg-custom-3 text-white rounded flex items-center justify-center text-center font-bold p-2 cursor-pointer transition duration-300 hover:opacity-80 ${
              filled ? "pointer-events-none opacity-70" : ""
            } ${isShaking ? "shake-wrong" : ""}`}
            onClick={() => onCellClick(category)}
          >
            {filled ? (
              <div className="relative w-full h-full flex flex-col items-center justify-center">
                <img
                  src={filled.imagePath}
                  alt={filled.name}
                  className="w-full h-full object-cover rounded"
                />
                <div className="absolute top-1 left-1 bg-white bg-opacity-80 text-black text-xs px-1 rounded">
                  {category}
                </div>
              </div>
            ) : (
              category
            )}
          </div>
        );
      })}
    </div>
  );
}
