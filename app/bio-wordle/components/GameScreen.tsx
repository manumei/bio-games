"use client";
import { useEffect, useState } from "react";

// Global Game Imports
import { TimerOption } from "@/app/components/MenuHard";
import GiveUpButton from "@/app/components/GiveUpButton";
import GiveUpPopup from "@/app/components/GiveUpPopup";
import GameOver from "@/app/components/GameOver";
import { useCountdownTimer } from "@/app/hooks/useCountdownTimer";

// Bio-Wordle Imports
import GuessRows from "./GuessRows";

interface GameScreenProps {
  timer: number | null;
  hardMode: boolean;
}

export default function GameScreen({ timer, hardMode }: GameScreenProps) {
  const [gameOver, setGameOver] = useState(false);
  const [showGameOverPopup, setShowGameOverPopup] = useState(false);
  const { timeLeft, expired } = useCountdownTimer(timer, !gameOver);

  const [wordLength, setWordLength] = useState<number>(5); // temporary default para despues cambiarlo bien
  const [guesses, setGuesses] = useState<string[]>([]);
  const [currentGuess, setCurrentGuess] = useState<string>("");

  useEffect(() => {
    const randomLength = Math.floor(Math.random() * 4) + 4; // 4 to 7
    setWordLength(randomLength);
  }, []);

  useEffect(() => {
    if (expired) {
      setGameOver(true);
      setShowGameOverPopup(true);
    }
  }, [expired]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (gameOver) return;

      const key = e.key;

      if (key === "Backspace") {
        setCurrentGuess(prev => prev.slice(0, -1));
      } else if (key === "Enter") {
        if (currentGuess.length === wordLength) {
          setGuesses(prev => [...prev, currentGuess]);
          setCurrentGuess("");
        }
      } else if (/^[a-zA-Z]$/.test(key)) {
        if (currentGuess.length < wordLength) {
          setCurrentGuess(prev => prev + key.toUpperCase());
        }
      }
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [currentGuess, gameOver, wordLength]);

  return (
    <main className="min-h-[90vh] bg-custom-2 py-2">
      <div className="flex flex-col items-center justify-center h-full space-y-4">

        {/* Timer */}
        {timeLeft !== null && (
          <div className="text-yellow-300 font-bold text-sm sm:text-base text-center">
            <span className="hidden sm:inline">Time Left:</span>
            <span className="inline sm:hidden">Timer:</span>
            <span> {timeLeft}s</span>
          </div>
        )}

        {/* Guess Rows */}
        <GuessRows
          wordLength={wordLength}
          guesses={guesses}
          currentGuess={currentGuess}
        />

      </div>
    </main>
  );
}
