interface Organism {
  name: string;
  imagePath: string;
  categories: string[];
}

interface Props {
  categories: string[];
  disabled?: boolean;
  onCellClick: (category: string) => void;
}

export default function BingoGrid({ categories, disabled = false, onCellClick }: Props) {
  return (
    <div className={`grid grid-cols-4 gap-4 ${disabled ? 'opacity-50 pointer-events-none' : ''}`}>
      {categories.map((category, i) => (
        <div
          key={i}
          className="border-2 border-solid border-[rgb(47,37,81)] w-40 h-28 bg-custom-3 text-white rounded flex items-center justify-center text-center font-bold p-2 cursor-pointer transition duration-300 hover:opacity-80"
          onClick={() => onCellClick(category)}>
          {category}
        </div>
      ))}
    </div>
  );
}









