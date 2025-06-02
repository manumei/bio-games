"use client";
import { useState, ReactNode } from "react";
import Image from "next/image";

export type TimerOption = null | 120 | 180;

interface MenuScreenProps {
  title: ReactNode;
  imgSource: string;
  description: ReactNode;
  onStart: (timer: TimerOption, hardMode: boolean) => void;
}

export default function MenuScreen({
  title,
  imgSource,
  description,
  onStart,
}: MenuScreenProps) {
  const [selectedTimer, setSelectedTimer] = useState<TimerOption>(180);
  const [hardMode, setHardMode] = useState(false);

  return (
    <div className="menu-container p-6 rounded-xl border-2 border-green-600 md:w-185 lg:w-200 mx-auto text-white bg-custom-3">
      <h2 className="text-3xl font-bold text-center mb-6">{title}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center justify-items-center">
        <Image
          width={500}
          height={500}
          src={imgSource}
          alt="Game Cover"
          className="w-full h-auto rounded-md shadow-lg"
        />

        <div className="flex-1 space-y-4 text-sm md:text-base max-w-xl">
          {description}

          {/* Timer Buttons */}
          <div className="space-y-1">
            <p>Select your timer below:</p>
            <div className="flex gap-2">
              {[null, 120, 180].map((timer) => {
                const isDisabled = hardMode && timer !== 120;
                return (
                  <button
                    key={timer}
                    onClick={() =>
                      !isDisabled && setSelectedTimer(timer as TimerOption)
                    }
                    className={`px-4 py-2 rounded transition duration-200 ${
                      selectedTimer === timer
                        ? "bg-[#00C8FF] text-black hover:opacity-80"
                        : isDisabled
                        ? "bg-gray-700 opacity-50 cursor-not-allowed"
                        : "bg-gray-700 hover:bg-gray-600 cursor-pointer"
                    }`}
                    title={isDisabled ? "Disabled for Hard Mode" : ""}
                    disabled={isDisabled}
                  >
                    {timer === null ? "No Timer" : `${timer}s`}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 mt-4">
            <button
              onClick={() => onStart(selectedTimer, hardMode)}
              className="bg-green-300 hover:bg-green-500 text-black py-2 px-4 rounded transition-transform transform hover:scale-105 cursor-pointer"
            >
              Start Game
            </button>
            <button
              onClick={() => {
                const isHard = !hardMode;
                setHardMode(isHard);
                if (isHard) setSelectedTimer(120); // Force 120s on hard mode
              }}
              className={`py-2 px-4 rounded transition duration-300 ${
                hardMode
                  ? "font-bold bg-[#ff0000] text-white"
                  : "bg-red-200 text-black"
              } hover:opacity-80 cursor-pointer`}
            >
              Hard Mode {hardMode ? "✔" : "✖"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
