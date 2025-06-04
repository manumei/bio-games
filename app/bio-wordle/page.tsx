"use client";
import { useState } from "react";
import MenuScreen, { TimerOption } from "@/app/components/MenuScreen";
import GameScreen from "./components/GameScreen";

export default function TaxoBingoPage() {
  const [gameStarted, setGameStarted] = useState(false);
  const [timer, setTimer] = useState<TimerOption>(180);

  if (!gameStarted) {
    return (
      <main className="min-h-[80vh] bg-custom-2 px-4 md:px-0 py-10">
        <MenuScreen
          title={
            <>
              <span className="text-transparent bg-gradient-to-b from-secondary to-primary bg-clip-text">
                BIO
              </span>{" "}
              WORDLE
            </>
          }
          imgSource="/assets/img/covers/menu/taxo.png"
          description={
            <div>
              <p>
                Fill the bingo grid organisms matching the 12 taxonomic
                categories given.
              </p>
              <p>
                When an organism appears, click a category where it fits, or
                skip to the next. Fill the whole grid to win!
              </p>
              <p>
                <strong>Hard Mode</strong> hides the names, giving you only the
                image of the organism for your guess.
              </p>
            </div>
          }
          onStart={(selectedTimer) => {
            setTimer(selectedTimer);
            setGameStarted(true);
          }}
        />
      </main>
    );
  }

  return (
    <main className="min-h-[90vh] bg-custom-2 py-2">
      <GameScreen />
    </main>
  );
}
