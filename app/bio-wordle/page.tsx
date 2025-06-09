"use client";
import { useState } from "react";
import MenuHard, { TimerOption } from "@/app/components/MenuHard";
import GameScreen from "./components/GameScreen";

const NytWordleLink = (
  <a
    href="https://www.nytimes.com/games/wordle/index.html"
    target="_blank"
    rel="noopener noreferrer"
    className="text-blue-600 hover:underline cursor-pointer"
  >
    NYT's Wordle
  </a>
);

export default function BioWordlePage() {
  const [gameStarted, setGameStarted] = useState(false);
  const [hardMode, setHardMode] = useState(false);

  if (!gameStarted) {
    return (
      <main className="min-h-[80vh] bg-custom-2 px-4 md:px-0 py-10">
        <MenuHard
          title={
            <>
              <span className="text-transparent bg-gradient-to-b from-secondary to-primary bg-clip-text">
                BIO
              </span>{" "}
              WORDLE
            </>
          }
          imgSource="/assets/img/covers/menu/wordle.png"
          description={
            <div>
              <p>
                Take guesses to find the secret biology-related word. Inspired
                by {NytWordleLink}
              </p>
              <p>
                🟩 Green means the right letter in the right spot. <br></br>
                🟨 Yellow means correct letter, in the wrong spot.
              </p>
              <p>
                Only alphabetical characters are allowed, guesses must always be
                real english words.
              </p>
              <p>
                <br></br>
                <strong>Hard Mode</strong> gives you 1 less guess, and forces a
                120-second timer.
              </p>
            </div>
          }
          onStart={() => {
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
