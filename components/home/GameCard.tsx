import Image from "next/image";
import Link from "next/link";
import StreakBadge from "@/components/home/StreakBadge";
import type { GameMeta } from "@/games/registry";
import { cn } from "@/lib/cn";

const COMING_SOON_COVER = "/assets/img/covers/coming-soon.svg";

export interface GameCardProps {
  game: GameMeta;
}

export default function GameCard({ game }: GameCardProps) {
  const isLive = game.status === "live";
  const coverSrc = game.cover?.card ?? COMING_SOON_COVER;

  const cardClasses = cn(
    "relative w-35 sm:w-40 bg-gradient-to-b from-panel to-panel p-2 font-bold flex flex-col items-center text-center gap-2 rounded-md transition group",
    isLive
      ? "hover:from-secondary hover:to-primary cursor-pointer"
      : "cursor-not-allowed"
  );

  const cardInner = (
    <>
      {game.isNew && (
        <span className="absolute z-10 px-2 py-1 text-sm font-bold text-black rounded-md -top-3 -left-2 sm:-left-3 bg-accent">
          NEW
        </span>
      )}

      {game.daily && <StreakBadge slug={game.slug} />}

      <Image
        src={coverSrc}
        width={500}
        height={500}
        alt={isLive ? `${game.title} cover` : `${game.title} (Coming Soon)`}
        className={cn(
          "w-40 scale-90 transition-all duration-300 ease-in-out rounded-md",
          isLive && "group-hover:scale-100"
        )}
      />

      <p className="text-xl">{isLive ? "PLAY" : "Coming Soon"}</p>
      <p>{game.title}</p>
    </>
  );

  if (isLive) {
    return (
      <Link href={`/${game.slug}`} className={cardClasses}>
        {cardInner}
      </Link>
    );
  }

  return (
    <div aria-disabled="true" className={cardClasses}>
      {cardInner}
    </div>
  );
}
