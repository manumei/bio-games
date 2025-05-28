import Image from "next/image";

export default function Header() {
  return (
    <header className="flex p-5 justify-center items-center bg-custom-1 border-b-[0.04rem] border-custom-4">
      <a href="/" className="flex items-center gap-2 text-4xl font-bold">
        <p>
          <span className="text-transparent bg-gradient-to-b from-secondary to-primary bg-clip-text">
            BIO
          </span>
          GAMES
        </p>
        <Image width={40} height={40} src="/assets/img/icons/biogames.png" alt="BioGames" />
      </a>
    </header>
  );
}
