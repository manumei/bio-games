import Image from "next/image";
import Link from "next/link";
import BrandTitle from "@/components/ui/BrandTitle";

export default function Header() {
  return (
    <header className="flex p-5 justify-center items-center bg-surface border-b-[0.04rem] border-accent">
      <Link href="/" className="flex items-center gap-2 text-4xl font-bold">
        <p>
          <BrandTitle brand={["BIO", "GAMES"]} separator="" />
        </p>
        <Image
          width={40}
          height={40}
          src="/assets/img/icons/biogames-128.webp"
          alt="BioGames"
          priority
        />
      </Link>
    </header>
  );
}
