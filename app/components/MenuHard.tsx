"use client";
import { useState, ReactNode } from "react";
import Image from "next/image";

export type TimerOption = null | 120;

interface MenuHardProps {
  title: ReactNode;
  imgSource: string;
  description: ReactNode;
  onStart: (timer: TimerOption, hardMode: boolean) => void;
}

export default function MenuHard({
  title,
  imgSource,
  description,
  onStart,
}: MenuHardProps) {
  const [hardMode, setHardMode] = useState(false);

  return (
    <div className="menu-container p-6 rounded-xl border-2 border-blue-600 md:w-185 lg:w-200 mx-auto text-white bg-custom-3">
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

          {/* Action Buttons */}
          <div className="flex gap-4 mt-4">
            {/* Start Game */}
            <button
              onClick={() => onStart(hardMode ? 120 : null, hardMode)}
              className="bg-green-300 hover:bg-green-500 hover:font-medium text-black py-2 px-4 rounded transition-transform transform hover:scale-105 cursor-pointer"
            >
              Start Game
            </button>
            {/* Hard Mode */}
            <button
              onClick={() => setHardMode((prev) => !prev)}
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
