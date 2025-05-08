"use client";
import { useEffect, useState } from "react";
import BingoGrid from "./BingoGrid";
import OrganismCard from "./OrganismCard";
import { TimerOption } from "@/app/components/MenuScreen";

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
  const [gameOver, setGameOver] = useState(false);

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
      setCurrent(available[Math.floor(Math.random() * available.length)]);
    }
  }, [available]);

  useEffect(() => {
    if (timer !== null) {
      setTimeLeft(timer);

      const interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev === null) return null;
          if (prev <= 1) {
            clearInterval(interval);
            setGameOver(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [timer]);

  const skipOrganism = () => {
    if (available.length > 1 && current) {
      const filtered = available.filter((o) => o !== current);
      setAvailable(filtered);
    }
  };

  return (
    <>
      <div className="text-white flex flex-col items-center gap-8 mt-5 mb-5">
        <OrganismCard
          organism={current}
          hardMode={hardMode}
          onSkip={skipOrganism}
          timeLeft={timeLeft}
        />
        <BingoGrid
          organism={current}
          onUseOrganism={(org) => {
            setAvailable((prev) => prev.filter((o) => o !== org));
            setCurrent(null); // will be reset on available update
          }}
        />
      </div>

      {gameOver && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[rgb(207,200,200,0.85)] text-black p-8 rounded-lg shadow-lg z-[1000] text-center">
          Game Over
        </div>
      )}
    </>
  );
}
