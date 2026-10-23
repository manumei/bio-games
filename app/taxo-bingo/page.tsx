"use client";

import { useState } from "react";
import GameMenu from "@/components/game/GameMenu";
import { getGame } from "@/games/registry";
import TaxoMenuOptions, {
  TaxoHardModeButton,
} from "@/games/taxo-bingo/components/TaxoMenuOptions";
import {
  DEFAULT_TIMER,
  resolveTimerForHardMode,
  type TimerOption,
} from "@/games/taxo-bingo/config";
import GameScreen from "./components/GameScreen";

const TAXO_META = getGame("taxo-bingo");

export default function TaxoBingoPage() {
  const [gameStarted, setGameStarted] = useState(false);
  const [timer, setTimer] = useState<TimerOption>(DEFAULT_TIMER);
  const [hardMode, setHardMode] = useState(false);

  if (!gameStarted) {
    return (
      <main className="min-h-[80vh] bg-page px-4 md:px-0 py-10">
        <GameMenu
          brand={TAXO_META.brand}
          coverSrc={TAXO_META.cover!.menu}
          description={
            <div className="space-y-2">
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
          options={
            <TaxoMenuOptions
              timer={timer}
              hardMode={hardMode}
              onTimerChange={setTimer}
            />
          }
          extraActions={
            <TaxoHardModeButton
              hardMode={hardMode}
              onToggle={() => {
                const nextHard = !hardMode;
                setHardMode(nextHard);
                setTimer((prev) => resolveTimerForHardMode(prev, nextHard));
              }}
            />
          }
          onStart={() => setGameStarted(true)}
        />
      </main>
    );
  }

  return (
    <main className="min-h-[90vh] bg-page py-2">
      <GameScreen timer={timer} hardMode={hardMode} />
    </main>
  );
}
