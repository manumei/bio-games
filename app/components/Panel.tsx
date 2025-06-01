import Link from "next/link";

interface PanelProps {
  title: string;
  isNew?: boolean;
  route?: string;
  imgSrc?: string;
  coming_soon?: boolean;
}

export default function Panel({
  title,
  route,
  isNew,
  imgSrc,
  coming_soon,
}: PanelProps) {
  const imageSource =
    imgSrc ||
    `https://placehold.co/500/?text=${coming_soon ? "Coming Soon" : title}`;

  const panelButton = (
    <button
      className={`relative w-35 sm:w-40 bg-gradient-to-b from-custom-3 to-custom-3 p-2 font-bold flex flex-col gap-2 rounded-md transition ${
        coming_soon
          ? "hover:none cursor-not-allowed"
          : "hover:from-secondary hover:to-primary cursor-pointer"
      } group`}
    >
      {isNew && (
        <span className="absolute z-10 px-2 py-1 text-sm font-bold text-black rounded-md -top-3 -left-3 bg-custom-4">
          NEW
        </span>
      )}

      <img
        src={imageSource}
        width={500}
        height={500}
        alt="Imag"
        className={`w-40 scale-90 ${
          !coming_soon && "group-hover:scale-100"
        } transition-all duration-300 ease-in-out rounded-md`}
      />

      <p className="text-xl">{coming_soon ? "Coming Soon" : "PLAY"}</p>
      <p>{title}</p>
    </button>
  );

  return !coming_soon && route ? (
    <Link href={route}>{panelButton}</Link>
  ) : (
    panelButton
  );
}
