"use client";

import { useCallback, useEffect, useReducer, useRef, useState } from "react";
import GameMenu from "@/components/game/GameMenu";
import GameOverModal from "@/components/game/GameOverModal";
import GiveUpButton from "@/components/game/GiveUpButton";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { getOrganism } from "@/data/organisms";
import { getTaxon } from "@/data/taxonomy";
import { getGame } from "@/games/registry";
import BingoGrid from "@/games/taxo-bingo/components/BingoGrid";
import CheatSheet from "@/games/taxo-bingo/components/CheatSheet";
import OrganismCard from "@/games/taxo-bingo/components/OrganismCard";
import TaxoMenuOptions, {
  TaxoHardModeButton,
} from "@/games/taxo-bingo/components/TaxoMenuOptions";
import { PRELOAD_COUNT, SHAKE_MS } from "@/games/taxo-bingo/config";
import {
  currentOrganismId,
  preloadImageUrls,
} from "@/games/taxo-bingo/logic/deck";
import {
  getFollowUpMessage,
  getLossMessage,
} from "@/games/taxo-bingo/logic/messages";
import {
  createInitialTaxoState,
  taxoReducer,
} from "@/games/taxo-bingo/logic/reducer";
import { useCountdown } from "@/lib/hooks/useCountdown";
import { useWindowKeydown } from "@/lib/hooks/useWindowKeydown";
import { createRng, randomSeed, type Rng } from "@/lib/rng";

const TAXO_META = getGame("taxo-bingo");

export default function TaxoBingoGame() {
  const [state, dispatch] = useReducer(
    taxoReducer,
    undefined,
    createInitialTaxoState
  );
  const [showGiveUpConfirm, setShowGiveUpConfirm] = useState(false);
  const [showCheatSheet, setShowCheatSheet] = useState(false);

  const rngRef = useRef<Rng | null>(null);
  const preloadedUrlsRef = useRef<Set<string>>(new Set());

  const getRng = useCallback((): Rng => {
    if (!rngRef.current) {
      rngRef.current = createRng(randomSeed());
    }
    return rngRef.current;
  }, []);

  const handleStart = useCallback(() => {
    const freshRng = createRng(randomSeed());
    rngRef.current = freshRng;
    preloadedUrlsRef.current.clear();
    dispatch({ type: "START", rng: freshRng });
  }, []);

  const handleExpire = useCallback(() => {
    setShowGiveUpConfirm(false);
    dispatch({ type: "TICK_EXPIRED" });
  }, []);

  const secondsLeft = useCountdown(
    state.phase === "playing" ? state.deadline : null,
    handleExpire
  );

  const displayTimeLeft =
    state.options.timer === null
      ? null
      : state.deadline !== null
      ? secondsLeft
      : state.options.timer;

  // Preload upcoming organism images without duplicates
  useEffect(() => {
    if (state.phase !== "playing") return;
    const urls = preloadImageUrls(state.deck, PRELOAD_COUNT);
    for (const url of urls) {
      if (!preloadedUrlsRef.current.has(url)) {
        preloadedUrlsRef.current.add(url);
        const img = new Image();
        img.src = url;
      }
    }
  }, [state.phase, state.deck]);

  // Clear shake state after SHAKE_MS
  useEffect(() => {
    if (!state.misplacedCell) return;
    const timeout = window.setTimeout(() => {
      dispatch({ type: "CLEAR_MISPLACE" });
    }, SHAKE_MS);
    return () => window.clearTimeout(timeout);
  }, [state.misplacedCell]);

  const handleSkip = useCallback(() => {
    dispatch({ type: "SKIP", rng: getRng() });
  }, [getRng]);

  useWindowKeydown(
    (e) => {
      if (e.code === "Space") {
        e.preventDefault();
        handleSkip();
      }
    },
    state.phase === "playing" &&
      state.isImageReady &&
      !showGiveUpConfirm &&
      !showCheatSheet
  );

  if (state.phase === "menu") {
    return (
      <main className="min-h-[80vh] bg-page px-4 md:px-0 py-10">
        <GameMenu
          brand={TAXO_META.brand}
          coverSrc={TAXO_META.cover!.menu}
          description={
            <div className="space-y-2">
              <p>
                Fill the bingo grid organisms matching the 12 taxonomic
                categories given.
              </p>
              <p>
                When an organism appears, click a category where it fits, or
                skip to the next. Fill the whole grid to win!
              </p>
              <p>
                <strong>Hard Mode</strong> hides the names, giving you only the
                image of the organism for your guess.
              </p>
            </div>
          }
          options={
            <TaxoMenuOptions
              timer={state.options.timer}
              hardMode={state.options.hardMode}
              onTimerChange={(timer) =>
                dispatch({ type: "SET_OPTIONS", timer })
              }
            />
          }
          extraActions={
            <TaxoHardModeButton
              hardMode={state.options.hardMode}
              onToggle={() =>
                dispatch({
                  type: "SET_OPTIONS",
                  hardMode: !state.options.hardMode,
                })
              }
            />
          }
          onStart={handleStart}
        />
      </main>
    );
  }

  const currentId = currentOrganismId(state.deck);
  const currentOrganism = currentId ? getOrganism(currentId) : null;
  const isGameOver = state.phase === "over";
  const gameWon = state.endReason === "won";
  const filledCount = Object.keys(state.filled).length;
  const unfilledTaxonId = state.grid.find((id) => !state.filled[id]);
  const unfilledLabel = unfilledTaxonId
    ? getTaxon(unfilledTaxonId).label
    : undefined;
  const lossMessage = getLossMessage(filledCount, unfilledLabel);
  const followUpMessage = getFollowUpMessage(gameWon, state.options.hardMode);

  return (
    <main className="min-h-[90vh] bg-page py-2">
      <div className="text-white flex flex-col items-center sm:gap-8 mt-5 mb-5 relative">
        <OrganismCard
          organism={currentOrganism}
          hardMode={state.options.hardMode}
          onSkip={handleSkip}
          timeLeft={displayTimeLeft}
          disabled={isGameOver}
          isImageLoaded={state.isImageReady}
          onImageLoad={() =>
            dispatch({ type: "NEXT_READY", now: Date.now() })
          }
          onImageError={() => {
            if (currentOrganism) {
              console.warn(
                `[TaxoBingo] Failed to load image for organism "${currentOrganism.id}" (${currentOrganism.image}); auto-advancing.`
              );
            }
            dispatch({ type: "SKIP", rng: getRng(), force: true });
          }}
          showCheatSheetButton
          onCheatSheetClick={() => setShowCheatSheet(true)}
        />

        <BingoGrid
          categories={state.grid}
          disabled={isGameOver}
          filledCells={state.filled}
          misplacedCell={state.misplacedCell}
          onCellClick={(taxonId) =>
            dispatch({ type: "PLACE", taxonId, rng: getRng() })
          }
        />

        <GiveUpButton
          onClick={() => setShowGiveUpConfirm(true)}
          disabled={isGameOver}
        />

        {showGiveUpConfirm && (
          <ConfirmDialog
            message="Are you sure you want to give up?"
            tone="danger"
            onConfirm={() => {
              setShowGiveUpConfirm(false);
              dispatch({ type: "GIVE_UP" });
            }}
            onCancel={() => setShowGiveUpConfirm(false)}
          />
        )}
      </div>

      {isGameOver && state.modalOpen && (
        <GameOverModal
          won={gameWon}
          onClose={() => dispatch({ type: "CLOSE_MODAL" })}
        >
          <p className="text-base sm:text-lg font-medium">
            {gameWon ? (
              <>
                Congratulations on beating Taxo Bingo{" "}
                {/* [USER DECISION] Third-party link preserved per D14 */}
                <a
                  href="https://iamawesome.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline text-blue-700 hover:text-blue-900"
                >
                  you&apos;re awesome
                </a>
              </>
            ) : (
              lossMessage
            )}
          </p>
          <p className="text-base sm:text-lg font-medium">{followUpMessage}</p>
        </GameOverModal>
      )}

      {showCheatSheet && (
        <CheatSheet onClose={() => setShowCheatSheet(false)} />
      )}
    </main>
  );
}
