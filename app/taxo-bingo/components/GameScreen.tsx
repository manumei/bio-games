"use client";
import { useEffect, useState, useRef, useCallback } from "react";

// Global Game Imports
import { TimerOption } from "@/app/components/MenuScreen";
import GiveUpButton from "@/app/components/GiveUpButton";
import GiveUpPopup from "@/app/components/GiveUpPopup";
import GameOver from "@/app/components/GameOver";

// Taxo Imports
import BingoGrid from "./BingoGrid";
import OrganismCard from "./OrganismCard";
import CheatSheet from "./CheatSheet";

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
const tx_big_Kingdoms_and_classes = [
  "Animalia",
  "Plantae",
  "Chordata",
  "Arthropoda",
];
const tx_PhylaAnimalia_and_small_kingdoms = [
  "Porifera",
  "Cnidaria",
  "Platyhelminthes",
  "Nematoda",
  "Annelida",
  "Fungi", // chordata
  "Protista", // arthropoda
  "Echinodermata",
  "Mollusca",
];
const tx_PhylaPlantae = ["Bryophyta", "Pteridophyta", "Gymnospermae"]; // anGOATspermae ya esta puesta sola
const tx_ClassesChordata = [
  "Mammalia",
  "Aves",
  "Reptilia",
  "Amphibia",
  "Chondrichthyes",
  "Osteichthyes",
];
const tx_ClassesArthropoda = ["Arachnida", "Insecta", "Crustacea", "Myriapoda"];
// const tx_ClassesMollusca = ["Gastropoda", "Bivalvia", "Cephalopoda"];
const tx_OrdersArachnida = ["Araneae", "Scorpiones", "Acari"];
const tx_OrdersInsecta = [
  "Coleoptera",
  "Lepidoptera",
  "Diptera",
  "Hymenoptera",
  "Hemiptera",
  "Dictyoptera",
];
const tx_OrdersReptilia = ["Squamata", "Testudines", "Crocodilia"];
const tx_OrdersMammalia = [
  "Primates",
  "Carnivora",
  "Rodentia",
  "Artiodactyla",
  "Perissodactyla",
  "Chiroptera",
  "Cetacea",
  "Marsupialia",
  "Pilosa",
]; // eulipotyphla, la de rabbits, etc.
const angiosperma = "Angiospermae";

const domainCategory =
  tx_Domains[Math.floor(Math.random() * tx_Domains.length)];
const kingdomCategory =
  tx_big_Kingdoms_and_classes[
    Math.floor(Math.random() * tx_big_Kingdoms_and_classes.length)
  ];

const remainingCategories = [
  ...tx_PhylaAnimalia_and_small_kingdoms,
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
  const [filledCells, setFilledCells] = useState<{
    [category: string]: Organism;
  }>({});
  const categoriesInitialized = useRef(false);
  const [shakingCell, setShakingCell] = useState<string | null>(null);
  const [showCheatSheet, setShowCheatSheet] = useState(false);

  const generateBingoGridCategories = (): string[] => {
    const shuffled = remainingCategories.sort(() => 0.5 - Math.random());
    const selectedCategories = shuffled.slice(0, 9);
    const finalCategories = [
      domainCategory,
      kingdomCategory,
      angiosperma,
      ...selectedCategories,
    ];
    // const finalCategories = ["Eukaryota", "Animalia", "Plantae", "Chordata", "Arthropoda", "Mammalia", "Insecta", "Reptilia", "Arachnida", "Aves", "Angiospermae", "Fungi"];
    return finalCategories.sort(() => 0.5 - Math.random());
  };

  const skipOrganism = useCallback(() => {
    if (!isImageLoaded) return; // prevent skipping before image is loaded

    const filtered = available.filter((o) => o !== current);
    setAvailable(filtered);
    showNextOrganism();
  }, [available, current, isImageLoaded]);

  const preloadOrganism = (): Organism | null => {
    if (available.length === 0) return null;
    const org = available[Math.floor(Math.random() * available.length)];
    const img = new Image();
    img.src = org.imagePath;
    return org;
  };

  const showNextOrganism = () => {
    const next = queue[0];
    setQueue(
      (prev) =>
        [...prev.slice(1), preloadOrganism()].filter(Boolean) as Organism[]
    );
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
      const initialQueue = Array.from({ length: 4 }, preloadOrganism).filter(
        Boolean
      ) as Organism[];
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
      if (e.code === "Space" && !gameOver && isImageLoaded) {
        e.preventDefault(); // prevent page scroll
        skipOrganism();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [gameOver, isImageLoaded, skipOrganism]);

  const filledCount = Object.keys(filledCells).length;
  const unfilledCategory = gridCategories.find((cat) => !filledCells[cat]);

  const lossMessage = (() => {
    if (filledCount === 11 && unfilledCategory) {
      return `ikr, that one "${unfilledCategory}" you probably skimmed through or just didn't wanna show up`;
    }
    if (filledCount >= 9) {
      return "You came quite close, even I couldn't do all 12 cells at first, and I made this game by hand";
    }
    if (filledCount >= 6) {
      return `${filledCount} cells... not great, not terrible`;
    }
    if (filledCount >= 3) {
      return `${filledCount} out of 12, tough luck I guess, im sure it's just a warm up gamr tho`;
    }
    if (filledCount >= 1) {
      return `${filledCount}/12, I guess it was a pretty hard game, maybe check out the Cheat Sheet`;
    }
    return "0 out of 12, vayan a estudiar";
  })();

  const gameWon = Object.keys(filledCells).length === 12;

  return (
    <>
      <div className="text-white flex flex-col items-center sm:gap-8 mt-5 mb-5 relative">
        <OrganismCard
          organism={current}
          hardMode={hardMode}
          onSkip={skipOrganism}
          timeLeft={timeLeft}
          disabled={gameOver}
          isImageLoaded={isImageLoaded}
          setIsImageLoaded={setIsImageLoaded}
          showCheatSheetButton={true}
          onCheatSheetClick={() => setShowCheatSheet(true)}
        />

        <BingoGrid
          categories={gridCategories}
          disabled={gameOver}
          filledCells={filledCells}
          shakingCell={shakingCell}
          onCellClick={(category) => {
            if (!current || !isImageLoaded) return;
            if (filledCells[category]) return; // already filled

            const categoryNormalized = category.toLowerCase();

            if (current.categories.includes(categoryNormalized)) {
              const newFilled = { ...filledCells, [category]: current };
              setFilledCells(newFilled);
              setAvailable((prev) => prev.filter((o) => o !== current));

              if (Object.keys(newFilled).length === 12) {
                setGameOver(true);
                setShowGameOverPopup(true);
              } else {
                showNextOrganism();
              }
            } else {
              setShakingCell(category);
              setTimeout(() => setShakingCell(null), 700); // Clear shake after 0.7s
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
      {gameOver && showGameOverPopup && (
        <GameOver
          won={gameWon}
          hard={hardMode}
          message={
            gameWon ? (
              <>
                Congratulations on beating Taxo Bingo{" "}
                <a
                  href="https://iamawesome.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline text-blue-700 hover:text-blue-900"
                >
                  you're awesome
                </a>
              </>
            ) : (
              lossMessage
            )
          }
          onClose={() => setShowGameOverPopup(false)}
        />
      )}

      {/* Cheat Sheet Show */}
      {showCheatSheet && (
        <CheatSheet onClose={() => setShowCheatSheet(false)} />
      )}
    </>
  );
}
