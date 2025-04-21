interface ButtonProps {
  title: string;
  isNew?: boolean;
  coming_soon?: boolean;
}

export default function Button({ title, isNew, coming_soon }: ButtonProps) {
  return (
    <button
      className={`relative w-40 bg-gradient-to-b from-custom-3 to-custom-3 p-2 font-bold flex flex-col gap-2 rounded-md transition ${
        coming_soon
          ? "hover:none cursor-not-allowed"
          : "hover:from-secondary hover:to-primary cursor-pointer"
      } group`}
    >
      {isNew && (
        <span className="absolute z-10 px-2 py-1 text-sm font-bold text-white rounded-md -top-3 -left-3 bg-custom-4">
          NEW
        </span>
      )}
      <img
        src={`https://placehold.co/500/?text=${
          coming_soon ? "Coming Soon" : title
        }`}
        width={500}
        height={500}
        alt="Image"
        className={`w-40 scale-90 ${
          !coming_soon && "group-hover:scale-100"
        } transition-all duration-300 ease-in-out rounded-md`}
      />
      <p className="text-xl">{coming_soon ? "Coming Soon" : "PLAY"}</p>
      <p>{title}</p>
    </button>
  );
}
