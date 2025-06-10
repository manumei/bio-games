"use client";
import { useEffect, useState } from "react";

// Global Game Imports
import { TimerOption } from "@/app/components/MenuHard";
import GiveUpButton from "@/app/components/GiveUpButton";
import GiveUpPopup from "@/app/components/GiveUpPopup";
import GameOver from "@/app/components/GameOver";
import { useCountdownTimer } from "@/app/hooks/useCountdownTimer";

interface GameScreenProps {
  timer: number | null;
  hardMode: boolean;
}

export default function GameScreen({ timer, hardMode }: GameScreenProps) {
  const [gameOver, setGameOver] = useState(false);
  const [showGameOverPopup, setShowGameOverPopup] = useState(false);
  const { timeLeft, expired } = useCountdownTimer(timer, !gameOver);

  useEffect(() => {
    if (expired) {
      setGameOver(true);
      setShowGameOverPopup(true);
    }
  }, [expired]);

  return (
    <main className="min-h-[90vh] bg-custom-2 py-2">
      <div className="flex flex-col items-center justify-center h-full space-y-4">
        <h1 className="text-2xl font-bold text-center">
          Bio Wordle is coming soon! Stay tuned!
        </h1>

        {/* Timer */}
        {timeLeft !== null && (
          <div className="text-yellow-300 font-bold text-sm sm:text-base text-center">
            <span className="hidden sm:inline">Time Left:</span>
            <span className="inline sm:hidden">Timer:</span>
            <span> {timeLeft}s</span>
          </div>
        )}
      </div>
    </main>
  );
}
