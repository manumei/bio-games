"use client";
import { useState, ReactNode } from "react";

export type TimerOption = "None" | "90s" | "150s";

interface MenuScreenProps {
  title: ReactNode;
  imageSrc: string;
  description: ReactNode;
  onStart: (timer: TimerOption, hardMode: boolean) => void;
}

export default function MenuScreen({
  title,
  imageSrc,
  description,
  onStart,
}: MenuScreenProps) {
  const [selectedTimer, setSelectedTimer] = useState<TimerOption>("150s");
  const [hardMode, setHardMode] = useState(false);

  return (
    <div className="menu-container p-6 rounded-xl border-2 border-green-600 max-w-2xl mx-auto mt-10 text-white bg-custom-3">
      <h2 className="text-3xl font-bold text-center mb-6">{title}</h2>

      <div className="flex flex-col md:flex-row gap-6 items-center justify-center">
        <img
          src="/assets/img/taxo-cover.png"
          alt="Game Cover"
          className="w-72 h-auto rounded-md shadow-lg"
        />

        <div className="flex-1 space-y-4 text-sm md:text-base max-w-xl">
          {description}

          {/* Timer Buttons */}
          <div className="space-y-1">
            <p>Select your timer below:</p>
            <div className="flex gap-2">
              {["None", "90s", "150s"].map((timer) => (
                <button
                  key={timer}
                  onClick={() => setSelectedTimer(timer as TimerOption)}
                  className={`px-4 py-1 rounded ${
                    selectedTimer === timer
                      ? "bg-blue-400 text-black font-bold transition-opacity hover:opacity-80"
                      : "bg-gray-700 hover:bg-gray-600"
                  }`}
                >
                  {timer}
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 mt-4">
            <button
              onClick={() => onStart(selectedTimer, hardMode)}
              className="bg-green-500 hover:bg-green-600 text-black font-bold py-2 px-4 rounded"
            >
              Start Game
            </button>
            <button
              onClick={() => setHardMode(!hardMode)}
              className={`py-2 px-4 rounded font-bold transition-opacity ${
                hardMode ? "bg-red-500 text-white" : "bg-red-200 text-black"
              } hover:opacity-80`}
            >
              Hard Mode {hardMode ? "✔" : "✖"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
