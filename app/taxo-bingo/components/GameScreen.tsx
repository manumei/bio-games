"use client";
import { useEffect, useState, useRef } from "react";
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

const tx_Domains = ["Bacteria", "Eukaryota"];
const tx_Kingdoms = ["Animalia", "Plantae", "Fungi", "Protista"];
const tx_PhylaAnimalia = ["Porifera", "Cnidaria", "Platyhelminthes", "Nematoda", 
                        "Annelida", "Chordata", "Arthropoda", "Echinodermata", "Mollusca"];
const tx_PhylaPlantae = ["Bryophyta", "Pteridophyta", "Gymnospermae"]; // anGOATspermae ya esta puesta sola
const tx_ClassesChordata = ["Mammalia", "Aves", "Reptilia", "Amphibia", "Chondrichthyes", "Osteichthyes"];
const tx_ClassesArthropoda = ["Arachnida", "Insecta", "Crustacea", "Myriapoda"];
// const tx_ClassesMollusca = ["Gastropoda", "Bivalvia", "Cephalopoda"];
const tx_OrdersArachnida = ["Araneae", "Scorpiones", "Acari"];
const tx_OrdersInsecta = ["Coleoptera", "Lepidoptera", "Diptera", "Hymenoptera", "Hemiptera", "Dictyoptera"];
const tx_OrdersReptilia = ["Squamata", "Testudines", "Crocodilia"];
const tx_OrdersMammalia = ["Primates", "Carnivora", "Rodentia", "Artiodactyla", "Perissodactyla", "Chiroptera", "Cetacea", "Marsupialia", "Pilosa"]; // eulipotyphla, la de rabbits, etc.
const angiosperma = "Angiospermae";

const domainCategory = tx_Domains[Math.floor(Math.random() * tx_Domains.length)];
const kingdomCategory = tx_Kingdoms[Math.floor(Math.random() * tx_Kingdoms.length)];

const remainingCategories = [
  ...tx_PhylaAnimalia,
  ...tx_PhylaPlantae,
  ...tx_ClassesChordata,
  ...tx_ClassesArthropoda,
  ...tx_OrdersArachnida,
  ...tx_OrdersInsecta,
  ...tx_OrdersReptilia,
  ...tx_OrdersMammalia,
];

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
  const [gridCategories, setGridCategories] = useState<string[]>([]);
  const [filledCells, setFilledCells] = useState<{ [category: string]: Organism }>({});
  const categoriesInitialized = useRef(false);

  const generateBingoGridCategories = (): string[] => {
    const shuffled = remainingCategories.sort(() => 0.5 - Math.random());
    const selectedCategories = shuffled.slice(0, 9);
    const finalCategories = [domainCategory, kingdomCategory, angiosperma, ...selectedCategories];
    return finalCategories.sort(() => 0.5 - Math.random());
  };

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
    if (available.length > 0 && !categoriesInitialized.current) {
      setGridCategories(generateBingoGridCategories());
      categoriesInitialized.current = true;
    }

    if (available.length > 0) {
      const initialQueue = Array.from({ length: 5 }, preloadOrganism).filter(Boolean) as Organism[];
      setQueue(initialQueue);
      setCurrent(initialQueue[0]);
      setIsImageLoaded(false);
    }
  }, [available]);

  useEffect(() => {
    if (timer !== null && !gameOver) {
      const targetTime = Date.now() + timer * 1000;

      const interval = setInterval(() => {
        const diff = Math.round((targetTime - Date.now()) / 1000);
        if (diff <= 0) {
          clearInterval(interval);
          setTimeLeft(0);
          setGameOver(true);
          setShowGameOverPopup(true);
        } else {
          setTimeLeft(diff);
        }
      }, 500);

      return () => clearInterval(interval);
    }
  }, [timer, gameOver]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !gameOver && isImageLoaded) {
        e.preventDefault(); // prevent page scroll
        skipOrganism();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameOver, isImageLoaded, skipOrganism]);

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
          categories={gridCategories}
          disabled={gameOver}
          filledCells={filledCells}
          onCellClick={(category) => {
            if (!current || !isImageLoaded) return;
            if (filledCells[category]) return; // already filled

            const categoryNormalized = category.toLowerCase();
            if (current.categories.includes(categoryNormalized)) {
              setFilledCells((prev) => ({
                ...prev,
                [category]: current,
              }));
              setAvailable((prev) => prev.filter((o) => o !== current));
              showNextOrganism();
              // Optional: Check win condition here
            } else {
              // TODO: Trigger shake effect on the cell (handled in BingoGrid)
            }
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
