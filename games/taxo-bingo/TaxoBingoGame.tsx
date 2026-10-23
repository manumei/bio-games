"use client";

import Link from "next/link";
import { useCallback, useEffect, useReducer, useRef, useState } from "react";
import GameMenu from "@/components/game/GameMenu";
import GameOverModal from "@/components/game/GameOverModal";
import GiveUpButton from "@/components/game/GiveUpButton";
import NextDailyCountdown from "@/components/game/NextDailyCountdown";
import ShareButton from "@/components/game/ShareButton";
import StatsPanel, { type StatsBucket } from "@/components/game/StatsPanel";
import Button from "@/components/ui/Button";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import Modal from "@/components/ui/Modal";
import Spinner from "@/components/ui/Spinner";
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
  TAXO_SLUG,
  createDailyState,
  loadSavedTaxoDaily,
  recordTaxoDailyStats,
  restoreDailyState,
  saveTaxoDaily,
  type TaxoDailyState,
} from "@/games/taxo-bingo/logic/daily";
import {
  currentOrganismId,
  preloadImageUrls,
} from "@/games/taxo-bingo/logic/deck";
import {
  ZERO_MISTAKES_MESSAGE,
  getFollowUpMessage,
  pickLossMessage,
} from "@/games/taxo-bingo/logic/messages";
import {
  createInitialTaxoState,
  taxoReducer,
} from "@/games/taxo-bingo/logic/reducer";
import { revealExamples } from "@/games/taxo-bingo/logic/reveal";
import { buildShareText } from "@/games/taxo-bingo/logic/share";
import type { TaxoGameState } from "@/games/taxo-bingo/types";
import { dailySeed, getDayKey, puzzleNumber } from "@/lib/daily";
import { useCountdown } from "@/lib/hooks/useCountdown";
import { useHasMounted } from "@/lib/hooks/useHasMounted";
import { useWindowKeydown } from "@/lib/hooks/useWindowKeydown";
import { createRng, randomSeed, type Rng } from "@/lib/rng";
import { loadStats } from "@/lib/stats";

const TAXO_META = getGame("taxo-bingo");

const TAXO_BUCKETS: readonly StatsBucket[] = Array.from(
  { length: 13 },
  (_, idx) => ({
    key: String(idx),
    label: String(idx),
  })
);

function initTaxoClientState(): TaxoGameState {
  const base = createInitialTaxoState();
  const todayKey = getDayKey();
  const now = Date.now();
  const saved = loadSavedTaxoDaily();
  const restored = restoreDailyState(saved, todayKey, now);

  if (restored.abandonedState && restored.mustRecord) {
    saveTaxoDaily(restored.abandonedState);
    recordTaxoDailyStats(restored.abandonedState);
  }

  if (restored.state) {
    if (restored.mustRecord) {
      saveTaxoDaily(restored.state);
      recordTaxoDailyStats(restored.state);
    }
    const seed = dailySeed(TAXO_SLUG, restored.state.dayKey);
    return taxoReducer(base, {
      type: "HYDRATE_DAILY",
      dailyState: restored.state,
      rng: createRng(randomSeed()),
      seed,
    });
  }

  return {
    ...base,
    dayKey: todayKey,
    seed: dailySeed(TAXO_SLUG, todayKey),
  };
}

function buildDailyStateSnapshot(state: TaxoGameState): TaxoDailyState {
  const dayKey = state.dayKey ?? getDayKey();
  return {
    version: 1,
    dayKey,
    options: state.options,
    status:
      state.phase === "playing"
        ? "playing"
        : state.endReason === "won"
        ? "won"
        : "lost",
    startedAt: state.startedAt ?? Date.now(),
    deadline: state.deadline,
    endedAt: state.endedAt,
    endReason:
      state.phase === "playing"
        ? null
        : state.endReason === "won"
        ? "completed"
        : state.endReason,
    gridIds: state.grid,
    placements: state.filled,
    mistakes: state.mistakes,
    skips: state.skips,
  };
}

export default function TaxoBingoGame() {
  const hasMounted = useHasMounted();

  if (!hasMounted) {
    return (
      <main className="min-h-[80vh] bg-page flex items-center justify-center">
        <Spinner />
      </main>
    );
  }

  return <TaxoBingoClient />;
}

function TaxoBingoClient() {
  const [state, dispatch] = useReducer(
    taxoReducer,
    undefined,
    initTaxoClientState
  );
  const [showGiveUpConfirm, setShowGiveUpConfirm] = useState(false);
  const [showCheatSheet, setShowCheatSheet] = useState(false);
  const [showStatsModal, setShowStatsModal] = useState(false);

  const rngRef = useRef<Rng | null>(null);
  const preloadedUrlsRef = useRef<Set<string>>(new Set());

  const getRng = useCallback((): Rng => {
    if (!rngRef.current) {
      rngRef.current = createRng(randomSeed());
    }
    return rngRef.current;
  }, []);

  const todayKey = state.dayKey ?? getDayKey();
  const dailyNumber = puzzleNumber(todayKey);

  // Persist daily progress and record stats when a daily game finishes
  useEffect(() => {
    if (state.mode !== "daily" || state.phase === "menu") return;
    const snapshot = buildDailyStateSnapshot(state);
    saveTaxoDaily(snapshot);
    if (state.phase === "over") {
      recordTaxoDailyStats(snapshot);
    }
  }, [state]);

  const handleStartDaily = useCallback(() => {
    const dayKey = getDayKey();
    const now = Date.now();
    const initialDaily = createDailyState(dayKey, state.options, now);
    saveTaxoDaily(initialDaily);
    const seed = dailySeed(TAXO_SLUG, dayKey);
    const deckRng = createRng(randomSeed());
    rngRef.current = deckRng;
    preloadedUrlsRef.current.clear();
    dispatch({
      type: "HYDRATE_DAILY",
      dailyState: initialDaily,
      rng: deckRng,
      seed,
    });
  }, [state.options]);

  const handleStartPractice = useCallback(() => {
    const seed = randomSeed();
    const freshRng = createRng(seed);
    rngRef.current = freshRng;
    preloadedUrlsRef.current.clear();
    dispatch({
      type: "START",
      rng: freshRng,
      mode: "practice",
      dayKey: null,
      seed,
      now: Date.now(),
    });
  }, []);

  const handleExpire = useCallback(() => {
    setShowGiveUpConfirm(false);
    dispatch({ type: "TICK_EXPIRED", now: Date.now() });
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
      !showCheatSheet &&
      !showStatsModal
  );

  // If the daily finished during this render, ensure stats are up to date for display
  if (state.mode === "daily" && state.phase === "over") {
    const currentSnapshot = buildDailyStateSnapshot(state);
    recordTaxoDailyStats(currentSnapshot);
  }
  const currentStats = loadStats(TAXO_SLUG);

  if (state.phase === "menu") {
    return (
      <main className="min-h-[80vh] bg-page px-4 md:px-0 py-10">
        <GameMenu
          brand={TAXO_META.brand}
          coverSrc={TAXO_META.cover!.menu}
          startLabel={
            state.dailyFinishedForToday
              ? "Practice Round"
              : `Start Daily #${dailyNumber}`
          }
          onStart={
            state.dailyFinishedForToday ? handleStartPractice : handleStartDaily
          }
          description={
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2 text-accent font-bold">
                <span>
                  Daily #{dailyNumber} · {todayKey}
                </span>
                {currentStats.currentStreak >= 3 && (
                  <span className="bg-accent text-black px-2 py-0.5 rounded text-xs font-extrabold">
                    🔥{currentStats.currentStreak}
                  </span>
                )}
              </div>
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
            <div className="flex flex-wrap gap-2 items-center">
              <TaxoHardModeButton
                hardMode={state.options.hardMode}
                onToggle={() =>
                  dispatch({
                    type: "SET_OPTIONS",
                    hardMode: !state.options.hardMode,
                  })
                }
              />
              {!state.dailyFinishedForToday && (
                <Button variant="secondary" onClick={handleStartPractice}>
                  Practice
                </Button>
              )}
              <Button
                variant="secondary"
                onClick={() => setShowStatsModal(true)}
              >
                📊 Stats
              </Button>
            </div>
          }
        />

        {showStatsModal && (
          <Modal
            title="Taxo Bingo Stats"
            showCloseButton
            onClose={() => setShowStatsModal(false)}
          >
            <StatsPanel stats={currentStats} buckets={TAXO_BUCKETS} />
          </Modal>
        )}
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
  const lossMessage = pickLossMessage(
    filledCount,
    unfilledLabel,
    state.options.hardMode,
    state.seed
  );
  const followUpMessage = getFollowUpMessage(gameWon, state.options.hardMode);
  const revealed = isGameOver
    ? revealExamples(state.grid, state.filled, state.seed)
    : undefined;

  return (
    <main className="min-h-[90vh] bg-page py-2">
      <div className="text-white flex flex-col items-center sm:gap-6 mt-4 mb-5 relative">
        <div className="flex items-center gap-3 text-sm sm:text-base font-bold text-accent">
          {state.mode === "daily" ? (
            <span>
              Taxo Bingo · Daily #{dailyNumber} ({todayKey})
            </span>
          ) : (
            <span className="bg-surface px-3 py-1 rounded-full text-white border border-accent">
              Practice
            </span>
          )}
          {state.mode === "daily" && currentStats.currentStreak >= 3 && (
            <span className="bg-accent text-black px-2 py-0.5 rounded text-xs font-extrabold">
              🔥{currentStats.currentStreak}
            </span>
          )}
        </div>

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
          hardMode={state.options.hardMode}
          filledCells={state.filled}
          revealedExamples={revealed}
          misplacedCell={state.misplacedCell}
          onCellClick={(taxonId) =>
            dispatch({
              type: "PLACE",
              taxonId,
              rng: getRng(),
              now: Date.now(),
            })
          }
        />

        {!isGameOver ? (
          <GiveUpButton
            onClick={() => setShowGiveUpConfirm(true)}
            disabled={isGameOver}
          />
        ) : (
          <div className="flex flex-wrap gap-3 items-center justify-center mt-2">
            {!state.modalOpen && (
              <Button
                variant="primary"
                onClick={() => dispatch({ type: "OPEN_MODAL" })}
              >
                Show results
              </Button>
            )}
            <Button variant="secondary" onClick={handleStartPractice}>
              Practice round
            </Button>
          </div>
        )}

        {showGiveUpConfirm && (
          <ConfirmDialog
            message="Are you sure you want to give up?"
            tone="danger"
            onConfirm={() => {
              setShowGiveUpConfirm(false);
              dispatch({ type: "GIVE_UP", now: Date.now() });
            }}
            onCancel={() => setShowGiveUpConfirm(false)}
          />
        )}
      </div>

      {isGameOver && state.modalOpen && (
        <GameOverModal
          won={gameWon}
          onClose={() => dispatch({ type: "CLOSE_MODAL" })}
          actions={
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Button variant="secondary" onClick={handleStartPractice}>
                Practice round
              </Button>
              <Link
                href="/"
                className="inline-block px-6 py-2 bg-[#6574fd] hover:bg-[#4755d4] text-white font-bold rounded cursor-pointer transition-colors duration-300"
              >
                Go back to home
              </Link>
            </div>
          }
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
          {gameWon && state.mistakes === 0 && (
            <p className="text-sm sm:text-base font-bold text-green-800">
              {ZERO_MISTAKES_MESSAGE}
            </p>
          )}
          <p className="text-xs sm:text-sm font-semibold text-gray-700">
            ❌ {state.mistakes} wrong{" "}
            {state.mistakes === 1 ? "click" : "clicks"} · ⏭️ {state.skips}{" "}
            {state.skips === 1 ? "skip" : "skips"}
          </p>

          {state.mode === "daily" && (
            <>
              <StatsPanel
                stats={currentStats}
                buckets={TAXO_BUCKETS}
                highlightKey={String(filledCount)}
              />
              <div className="flex flex-col items-center gap-2 pt-1">
                <ShareButton
                  getText={() =>
                    buildShareText(buildDailyStateSnapshot(state), {
                      dayNumber: dailyNumber,
                    })
                  }
                />
                <NextDailyCountdown gameTitle="Taxo Bingo" />
              </div>
            </>
          )}
        </GameOverModal>
      )}

      {showCheatSheet && (
        <CheatSheet onClose={() => setShowCheatSheet(false)} />
      )}
    </main>
  );
}
