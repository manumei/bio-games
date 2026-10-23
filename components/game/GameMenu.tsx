"use client";

import Image from "next/image";
import type { ReactNode } from "react";
import BrandTitle from "@/components/ui/BrandTitle";
import Button from "@/components/ui/Button";

export interface GameMenuProps {
  brand: readonly [accent: string, rest: string];
  coverSrc: string;
  coverAlt?: string;
  description: ReactNode;
  options?: ReactNode;
  extraActions?: ReactNode;
  startLabel?: string;
  onStart: () => void;
}

export default function GameMenu({
  brand,
  coverSrc,
  coverAlt = "Game Cover",
  description,
  options,
  extraActions,
  startLabel = "Start Game",
  onStart,
}: GameMenuProps) {
  return (
    <div className="p-6 rounded-xl border-2 border-green-600 md:w-185 lg:w-200 mx-auto text-white bg-panel">
      <h2 className="text-3xl font-bold text-center mb-6">
        <BrandTitle brand={brand} />
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center justify-items-center">
        <Image
          width={500}
          height={500}
          src={coverSrc}
          alt={coverAlt}
          priority
          className="w-full h-auto rounded-md shadow-lg"
        />

        <div className="flex-1 space-y-4 text-sm md:text-base max-w-xl">
          {description}

          {options}

          <div className="flex gap-4 mt-4">
            <Button variant="primary" onClick={onStart}>
              {startLabel}
            </Button>
            {extraActions}
          </div>
        </div>
      </div>
    </div>
  );
}
