interface ButtonProps {
  title: string;
  coming_soon?: boolean;
}

export default function Button({ title, coming_soon }: ButtonProps) {
  return (
    <button
      className={`w-40 bg-[#1d2a3d] p-2 flex flex-col gap-2 rounded ${
        coming_soon
          ? "hover:none cursor-not-allowed"
          : "hover:bg-amber-400 hover:text-[#1d2a3d] cursor-pointer"
      } transition-all duration-300 ease-in-out font-bold`}
    >
      <img
        src="https://placehold.co/500"
        width={500}
        height={500}
        alt="Image"
        className="w-40"
      />
      <p className="text-xl">{coming_soon ? "Coming Soon" : "Play"}</p>
      <p>{title}</p>
    </button>
  );
}
