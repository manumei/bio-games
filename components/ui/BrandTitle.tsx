export interface BrandTitleProps {
  brand: readonly [accent: string, rest: string];
  separator?: string;
}

export default function BrandTitle({
  brand,
  separator = " ",
}: BrandTitleProps) {
  const [accent, rest] = brand;
  return (
    <>
      <span className="text-transparent bg-gradient-to-b from-secondary to-primary bg-clip-text">
        {accent}
      </span>
      {separator}
      {rest}
    </>
  );
}
