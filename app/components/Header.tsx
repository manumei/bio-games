import Image from "next/image";

export default function Header() {
  return (
    <header className="flex p-5 justify-center items-center bg-[rgb(8,28,58)] border-b-[0.04rem] border-[#f7cf4f]">
      <a
        href="index.html"
        className="flex items-center gap-2 text-4xl font-bold"
      >
        <p>
          <span className="bg-gradient-to-b from-secondary to-primary bg-clip-text text-transparent">
            BIO
          </span>
          GAMES
        </p>
        <Image width={40} height={40} src="/icon.png" alt="BioGames" />
      </a>
    </header>
  );
}
