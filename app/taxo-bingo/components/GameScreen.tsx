"use client";
import { useEffect, useState } from "react";
import BingoGrid from "./BingoGrid";
import OrganismCard from "./OrganismCard";
import { TimerOption } from "@/app/components/MenuScreen";
import GiveUpButton from '@/app/components/GiveUpButton';
import GiveUpPopup from '@/app/components/GiveUpPopup';
import GameOver from '@/app/components/GameOver';

interface Organism {
  name: string;
  imagePath: string;
  categories: string[];
}

interface GameScreenProps {
  timer: TimerOption;
  hardMode: boolean;
}

export default function GameScreen({ timer, hardMode }: GameScreenProps) {
  const [organisms, setOrganisms] = useState<Organism[]>([]);
  const [available, setAvailable] = useState<Organism[]>([]);
  const [current, setCurrent] = useState<Organism | null>(null);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [showGiveUp, setShowGiveUp] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [showGameOverPopup, setShowGameOverPopup] = useState(false); 
  const [queue, setQueue] = useState<Organism[]>([]);
  const [isImageLoaded, setIsImageLoaded] = useState(false);

  useEffect(() => {
    fetch("/assets/data/taxonomy.csv")
      .then((res) => res.text())
      .then((text) => {
        const lines = text.trim().split("\n");
        lines.shift(); // remove header
        const data = lines.map((line) => {
          const [name, catString, imagePath] = line.split(",");
          return {
            name: name.trim(),
            imagePath: imagePath.trim(),
            categories: catString.split(";").map((c) => c.trim().toLowerCase()),
          };
        });
        setOrganisms(data);
        setAvailable([...data]);
      });
  }, []);

  useEffect(() => {
    if (available.length > 0) {
      const initialQueue = Array.from({ length: 5 }, preloadOrganism).filter(Boolean) as Organism[];
      setQueue(initialQueue);
      setCurrent(initialQueue[0]);
      setIsImageLoaded(false);
    }
  }, [available]);

  useEffect(() => {
    if (timer !== null && !gameOver) {
      setTimeLeft(timer);

      const interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev === null) return null;
          if (prev <= 1) {
            clearInterval(interval);
            setGameOver(true);
            setShowGameOverPopup(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [timer, gameOver]);

  const skipOrganism = () => {
    if (!isImageLoaded) return; // prevent skipping before image is loaded

    const filtered = available.filter((o) => o !== current);
    setAvailable(filtered);
    showNextOrganism();
  };

  const preloadOrganism = (): Organism | null => {
    if (available.length === 0) return null;
    const org = available[Math.floor(Math.random() * available.length)];
    const img = new Image();
    img.src = org.imagePath;
    return org;
  };

  const showNextOrganism = () => {
  const next = queue[0];
  setQueue((prev) => [...prev.slice(1), preloadOrganism()].filter(Boolean) as Organism[]);
  setCurrent(next);
  setIsImageLoaded(false);
  };

  return (
    <>
      <div className="text-white flex flex-col items-center gap-8 mt-5 mb-5 relative">
        <OrganismCard
          organism={current}
          hardMode={hardMode}
          onSkip={skipOrganism}
          timeLeft={timeLeft}
          disabled={gameOver}
          setIsImageLoaded={setIsImageLoaded}
        />
  
        <BingoGrid
          organism={current}
          disabled={gameOver}
          onUseOrganism={(org) => {
            setAvailable((prev) => prev.filter((o) => o !== org));
            showNextOrganism();
          }}
        />

        {/* Give Up Button */}
        <GiveUpButton onClick={() => setShowGiveUp(true)} disabled={gameOver} />
  
        {/* Give Up Popup */}
        {showGiveUp && (
          <GiveUpPopup
            onConfirm={() => {
              setShowGiveUp(false);
              setGameOver(true);
            }}
            onCancel={() => setShowGiveUp(false)}
          />
        )}
      </div>
  
      {/* Game Over Popup */}
      {gameOver && (
        <GameOver
          won={false}
          message="You tried your best! Remember, failure is just the first step toward greatness."
          onClose={() => setShowGameOverPopup(false)} // ✅ closes popup only, game stays over
        />
      )}
    </>
  );
}
