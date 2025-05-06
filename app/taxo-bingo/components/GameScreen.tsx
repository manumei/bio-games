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

  const skipOrganism = () => {
    if (available.length > 1 && current) {
      const filtered = available.filter((o) => o !== current);
      setAvailable(filtered);
    }
  };

  return (
    <div className="text-white flex flex-col items-center gap-8 mt-5">
      <OrganismCard
        organism={current}
        hardMode={hardMode}
        onSkip={skipOrganism}
        timeLeft={timer}
      />
      <BingoGrid
        organism={current}
        onUseOrganism={(org) => {
          setAvailable((prev) => prev.filter((o) => o !== org));
          setCurrent(null); // will be reset on available update
        }}
      />
    </div>
  );
}
