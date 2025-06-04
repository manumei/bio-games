"use client";
import { useState } from "react";
import MenuTimerHard, { TimerOption } from "@/app/components/MenuTimerHard";
import GameScreen from "./components/GameScreen";

export default function TaxoBingoPage() {
  const [gameStarted, setGameStarted] = useState(false);
  const [timer, setTimer] = useState<TimerOption>(180);
  const [hardMode, setHardMode] = useState(false);

  if (!gameStarted) {
    return (
      <main className="min-h-[80vh] bg-custom-2 px-4 md:px-0 py-10">
        <MenuTimerHard
          title={
            <>
              <span className="text-transparent bg-gradient-to-b from-secondary to-primary bg-clip-text">
                TAXO
              </span>{" "}
              BINGO
            </>
          }
          imgSource="/assets/img/covers/menu/taxo.png"
          description={
            <div>
              <p>
                Fill the bingo grid by matching organisms with the 12 taxonomic
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
          onStart={(selectedTimer, selectedHardMode) => {
            setTimer(selectedTimer);
            setHardMode(selectedHardMode);
            setGameStarted(true);
          }}
        />
      </main>
    );
  }

  return (
    <main className="min-h-[90vh] bg-custom-2 py-2">
      <GameScreen timer={timer} hardMode={hardMode} />
    </main>
  );
}
