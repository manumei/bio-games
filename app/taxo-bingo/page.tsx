"use client";
import { useState } from "react";
import MenuScreen, { TimerOption } from "@/app/components/MenuScreen";

export default function TaxoBingoPage() {
  const [gameStarted, setGameStarted] = useState(false);
  const [timer, setTimer] = useState<TimerOption>("150s");
  const [hardMode, setHardMode] = useState(false);

  if (!gameStarted) {
    return (
      <MenuScreen
        title={
          <>
            <span className="text-transparent bg-gradient-to-b from-secondary to-primary bg-clip-text">
              TAXO
            </span>{" "}
            BINGO
          </>
        }
        imageSrc="/assets/img/taxo-cover.png"
        description={
          <>
            <p>
              Fill the bingo grid organisms matching the 12 taxonomic categories
              given.
            </p>
            <p>
              When an organism appears, click a category where it fits, or skip
              to the next. Fill the whole grid to win!
            </p>
            <p>
              <strong>Hard Mode</strong> hides the names, giving you only the
              image of the organism for your guess.
            </p>
          </>
        }
        onStart={(selectedTimer, selectedHardMode) => {
          setTimer(selectedTimer);
          setHardMode(selectedHardMode);
          setGameStarted(true);
        }}
      />
    );
  }

  return (
    <div className="text-white text-center mt-20">
      GameScreen will go here...
    </div>
  );
}
