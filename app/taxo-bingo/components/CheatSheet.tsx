"use client";

interface Props {
  onClose: () => void;
}

export default function CheatSheet({ onClose }: Props) {
  return (
    <div
      onClick={onClose}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[999]"
    >
      <div
        className="bg-[rgb(241,234,234)] text-black p-6 rounded-lg shadow-lg max-w-[40rem] w-full relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-2 right-3 text-red-600 text-xl font-bold"
        >
          ✖
        </button>
        <h2 className="text-2xl font-bold mb-4">🧠 Cheat Sheet</h2>
        <p className="text-sm leading-relaxed">
          (Write your cheat sheet here)<br /><br />
          <strong>Chordata</strong>: Animals with a notochord<br />
          <strong>Angiospermae</strong>: Flowering plants<br />
          <strong>Arthropoda</strong>: Invertebrates with exoskeletons<br />
          ...etc
        </p>
      </div>
    </div>
  );
}
