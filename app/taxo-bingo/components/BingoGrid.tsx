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
      className={`grid grid-cols-3 md:grid-cols-4 gap-2 sm:gap-4 px-2 sm:px-0 ${
        disabled ? "opacity-50 pointer-events-none" : ""
      }`}
    >
      {categories.map((category, i) => {
        const filled = filledCells[category];
        const isShaking = shakingCell === category;
        return (
          <div
            key={i}
            className={`border-2 border-solid border-[rgb(29,35,73)] sm:h-28 aspect-square sm:aspect-[10/7] 
              bg-custom-6 text-xs sm:text-base text-white rounded flex items-center 
              justify-center text-center font-bold p-2
              cursor-pointer transition duration-300 hover:ring-2 ring-blue-400 ${
                filled ? "pointer-events-none" : ""
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
                <div className="absolute top-1 left-1 backdrop-blur bg-black/50 text-white text-xs sm:text-sm px-1 rounded max-w-[80%] text-ellipsis overflow-hidden font-medium">
                  {category}
                </div>
              </div>
            ) : (
              <p className="max-w-full break-words hyphens-auto">{category}</p>
            )}
          </div>
        );
      })}
    </div>
  );
}
