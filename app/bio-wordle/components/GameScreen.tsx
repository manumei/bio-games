"use client";
import { useEffect, useState, useRef, useCallback } from "react";

// Global Game Imports
import { TimerOption } from "@/app/components/MenuHard";
import GiveUpButton from "@/app/components/GiveUpButton";
import GiveUpPopup from "@/app/components/GiveUpPopup";
import GameOver from "@/app/components/GameOver";
import { useCountdownTimer } from "@/app/hooks/useCountdownTimer";

interface GameScreenProps {
  hardMode: boolean;
}

export default function GameScreen() {
  return (
    <main className="min-h-[90vh] bg-custom-2 py-2">
      <div className="flex items-center justify-center h-full">
        <h1 className="text-2xl font-bold text-center">
          Bio Wordle is coming soon! Stay tuned!
        </h1>
      </div>
    </main>
  );
}
