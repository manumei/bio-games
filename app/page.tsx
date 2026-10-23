import GameCard from "@/components/home/GameCard";
import { GAMES } from "@/games/registry";

export default function Home() {
  return (
    <main className="min-h-[80vh] flex flex-col">
      <h2 className="px-2 sm:px-0 mt-8 mb-4 text-md sm:text-xl font-thin text-center">
        Select the game you want to play:
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-8 p-2 sm:p-5 mx-auto w-fit">
        {GAMES.map((game) => (
          <GameCard key={game.slug} game={game} />
        ))}
      </div>
    </main>
  );
}
