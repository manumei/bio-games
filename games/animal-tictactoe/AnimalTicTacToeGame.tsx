"use client";

import Link from "next/link";
import { useCallback, useEffect, useReducer, useState } from "react";
import GameMenu from "@/components/game/GameMenu";
import GameOverModal from "@/components/game/GameOverModal";
import GiveUpButton from "@/components/game/GiveUpButton";
import NextDailyCountdown from "@/components/game/NextDailyCountdown";
import ShareButton from "@/components/game/ShareButton";
import StatsPanel, { type StatsBucket } from "@/components/game/StatsPanel";
import Autocomplete from "@/components/ui/Autocomplete";
import Button from "@/components/ui/Button";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import Modal from "@/components/ui/Modal";
import Spinner from "@/components/ui/Spinner";
import Toast, { useToast } from "@/components/ui/Toast";
import { getGame } from "@/games/registry";
import { dailySeed, getDayKey, puzzleNumber } from "@/lib/daily";
import { useCountdown } from "@/lib/hooks/useCountdown";
import { useHasMounted } from "@/lib/hooks/useHasMounted";
import { randomSeed } from "@/lib/rng";
import { loadStats, type GameStats } from "@/lib/stats";
import { AnimalList } from "./components/AnimalList";
import { TicTacGrid } from "./components/TicTacGrid";
import { TicTacMenuOptions } from "./components/TicTacMenuOptions";
import {
  GRID_CELL_COUNT,
  HARD_GUESSES,
  NORMAL_GUESSES,
  VERSUS_TURN_SECONDS,
} from "./config";
import {
  ANIMALS,
  getAnimal,
  type SearchableAnimal,
} from "./data/animals";
import {
  TICTAC_SLUG,
  createDailyState,
  loadSavedTicTacDaily,
  recordTicTacDailyStats,
  restoreDailyState,
  saveTicTacDaily,
  type TicTacDailyState,
} from "./logic/daily";
import {
  HARD_MODE_ANIMAL_LIST_TOOLTIP,
  getTicTacFollowUpMessage,
  pickTicTacEndMessage,
} from "./logic/messages";
import { createInitialState, ticTacReducer } from "./logic/reducer";
import { formatTicTacShare } from "./logic/share";
import {
  createVersusState,
  markSymbol,
  versusReducer,
} from "./logic/versus";
import type { TicTacState } from "./types";

const TICTAC_META = getGame("animal-tictactoe");

const TICTAC_BUCKETS: readonly StatsBucket[] = [
  { key: "0", label: "0" },
  { key: "1", label: "1" },
  { key: "2", label: "2" },
  { key: "3", label: "3" },
  { key: "4", label: "4" },
  { key: "5", label: "5" },
  { key: "6", label: "6" },
  { key: "7", label: "7" },
  { key: "8", label: "8" },
  { key: "9", label: "9 🏆" },
];

interface HydratedBundle {
  gameState: TicTacState;
  dailyState: TicTacDailyState | null;
  stats: GameStats;
}

function hydrateInitialBundle(): HydratedBundle {
  const todayKey = getDayKey();
  const now = Date.now();
  const saved = loadSavedTicTacDaily();
  const restored = restoreDailyState(saved, todayKey, now);

  if (restored.abandonedState && restored.mustRecord) {
    saveTicTacDaily(restored.abandonedState);
    recordTicTacDailyStats(restored.abandonedState);
  }

  const stats = loadStats(TICTAC_SLUG);
  const daily = restored.state;

  if (daily) {
    const budget = daily.options.hardMode ? HARD_GUESSES : NORMAL_GUESSES;
    const guessesLeft = Math.max(0, budget - daily.guessesUsed);
    const seed = dailySeed(TICTAC_SLUG, daily.dayKey);
    const filledCount = daily.cells.filter((c) => c !== null).length;
    const isOver = daily.status === "won" || daily.status === "lost";
    const won = daily.status === "won";

    return {
      dailyState: daily,
      stats,
      gameState: {
        phase: isOver ? "over" : "playing",
        options: {
          hardMode: daily.options.hardMode,
          daily: true,
          versus: false,
          versusTimer: false,
        },
        seed,
        rows: daily.rows,
        cols: daily.cols,
        cells: daily.cells,
        guessesLeft,
        guessesUsed: daily.guessesUsed,
        used: daily.used,
        pending: null,
        message: null,
        outcome: isOver
          ? daily.endReason ?? (won ? "completed" : "failed")
          : null,
        endMessage: isOver
          ? pickTicTacEndMessage(won, filledCount, daily.guessesUsed, seed)
          : null,
        hardModeNotice: isOver
          ? getTicTacFollowUpMessage(won, daily.options.hardMode)
          : null,
      },
    };
  }

  return {
    dailyState: null,
    stats,
    gameState: createInitialState(),
  };
}

function VersusTurnTimer({
  seconds,
  onExpire,
}: {
  seconds: number;
  onExpire: () => void;
}) {
  const [deadline] = useState(() => Date.now() + seconds * 1000);
  const left = useCountdown(deadline, onExpire);
  return (
    <span className="rounded-full bg-cyan-500/20 px-2.5 py-0.5 font-mono text-xs font-bold text-cyan-300">
      ⏱️ {left ?? seconds}s
    </span>
  );
}

export default function AnimalTicTacToeGame() {
  const hasMounted = useHasMounted();
  if (!hasMounted) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Spinner />
      </div>
    );
  }
  return <AnimalTicTacToeClient />;
}

function AnimalTicTacToeClient() {
  const [initial] = useState<HydratedBundle>(hydrateInitialBundle);
  const [state, dispatch] = useReducer(ticTacReducer, initial.gameState);
  const [dailyState, setDailyState] = useState<TicTacDailyState | null>(
    initial.dailyState,
  );
  const [stats, setStats] = useState<GameStats>(initial.stats);
  const [versusState, dispatchVersus] = useReducer(
    versusReducer,
    1,
    (seed) => createVersusState(seed),
  );

  const [animalListOpen, setAnimalListOpen] = useState(false);
  const [statsModalOpen, setStatsModalOpen] = useState(false);
  const [confirmGiveUpOpen, setConfirmGiveUpOpen] = useState(false);
  const [gameOverModalOpen, setGameOverModalOpen] = useState(
    initial.gameState.phase === "over",
  );
  const { toast, show: showToast } = useToast();

  const todayKey = getDayKey();
  const todayNum = puzzleNumber(todayKey);

  // Sync Escape key to cancel multi-cell selection
  useEffect(() => {
    if (!state.pending) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        dispatch({ type: "CANCEL_PICK" });
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [state.pending]);

  const persistProgress = useCallback(
    (nextState: TicTacState, prevDaily: TicTacDailyState | null) => {
      if (!nextState.options.daily) return;
      const baseDaily =
        prevDaily ??
        createDailyState(
          todayKey,
          { hardMode: nextState.options.hardMode },
          Date.now(),
        );
      const isOver = nextState.phase === "over";
      const won = nextState.outcome === "completed";
      const updatedDaily: TicTacDailyState = {
        ...baseDaily,
        rows: nextState.rows,
        cols: nextState.cols,
        cells: nextState.cells,
        guessesUsed: nextState.guessesUsed,
        used: nextState.used,
        status: isOver ? (won ? "won" : "lost") : "playing",
        endedAt: isOver ? (baseDaily.endedAt ?? Date.now()) : null,
        endReason: isOver ? (nextState.outcome ?? "failed") : null,
      };
      saveTicTacDaily(updatedDaily);
      setDailyState(updatedDaily);
      if (isOver && baseDaily.status === "playing") {
        const nextStats = recordTicTacDailyStats(updatedDaily);
        setStats(nextStats);
      }
    },
    [todayKey],
  );

  const handleStartPractice = () => {
    if (state.options.versus) {
      const seed = randomSeed();
      dispatchVersus({ type: "START_VERSUS", seed });
      dispatch({
        type: "START_GAME",
        seed,
        options: { ...state.options, daily: false },
      });
      return;
    }
    const seed = randomSeed();
    dispatch({
      type: "START_GAME",
      seed,
      options: { ...state.options, daily: false, versus: false },
    });
    setGameOverModalOpen(false);
  };

  const handleStartDaily = () => {
    if (dailyState && dailyState.dayKey === todayKey) {
      const budget = dailyState.options.hardMode
        ? HARD_GUESSES
        : NORMAL_GUESSES;
      const seed = dailySeed(TICTAC_SLUG, todayKey);
      const isOver =
        dailyState.status === "won" || dailyState.status === "lost";
      const won = dailyState.status === "won";
      const filledCount = dailyState.cells.filter((c) => c !== null).length;
      dispatch({
        type: "HYDRATE_STATE",
        state: {
          phase: isOver ? "over" : "playing",
          options: {
            hardMode: dailyState.options.hardMode,
            daily: true,
            versus: false,
            versusTimer: false,
          },
          seed,
          rows: dailyState.rows,
          cols: dailyState.cols,
          cells: dailyState.cells,
          guessesLeft: Math.max(0, budget - dailyState.guessesUsed),
          guessesUsed: dailyState.guessesUsed,
          used: dailyState.used,
          pending: null,
          message: null,
          outcome: isOver
            ? dailyState.endReason ?? (won ? "completed" : "failed")
            : null,
          endMessage: isOver
            ? pickTicTacEndMessage(
                won,
                filledCount,
                dailyState.guessesUsed,
                seed,
              )
            : null,
          hardModeNotice: isOver
            ? getTicTacFollowUpMessage(won, dailyState.options.hardMode)
            : null,
        },
      });
      setGameOverModalOpen(isOver);
      return;
    }

    const freshDaily = createDailyState(
      todayKey,
      { hardMode: state.options.hardMode },
      Date.now(),
    );
    saveTicTacDaily(freshDaily);
    setDailyState(freshDaily);
    const seed = dailySeed(TICTAC_SLUG, todayKey);
    const nextState = ticTacReducer(state, {
      type: "START_GAME",
      seed,
      rows: freshDaily.rows,
      cols: freshDaily.cols,
      options: {
        hardMode: state.options.hardMode,
        daily: true,
        versus: false,
        versusTimer: false,
      },
    });
    dispatch({ type: "HYDRATE_STATE", state: nextState });
    setGameOverModalOpen(false);
  };

  const handleSubmitGuess = (
    picked: SearchableAnimal | null,
    rawText: string,
  ) => {
    const text = picked ? picked.name : rawText.trim();
    if (!text) return;
    const nextState = ticTacReducer(state, {
      type: "SUBMIT_GUESS",
      text,
    });
    dispatch({ type: "HYDRATE_STATE", state: nextState });
    if (nextState.message) {
      showToast(nextState.message);
    }
    persistProgress(nextState, dailyState);
    if (nextState.phase === "over") {
      setGameOverModalOpen(true);
    }
  };

  const handleCellClick = (cellIndex: number) => {
    if (!state.pending) return;
    const nextState = ticTacReducer(state, {
      type: "PICK_CELL",
      cellIndex,
    });
    dispatch({ type: "HYDRATE_STATE", state: nextState });
    if (nextState.message) {
      showToast(nextState.message);
    }
    persistProgress(nextState, dailyState);
    if (nextState.phase === "over") {
      setGameOverModalOpen(true);
    }
  };

  const handleConfirmGiveUp = () => {
    setConfirmGiveUpOpen(false);
    const nextState = ticTacReducer(state, { type: "GIVE_UP" });
    dispatch({ type: "HYDRATE_STATE", state: nextState });
    persistProgress(nextState, dailyState);
    setGameOverModalOpen(true);
  };

  const handleVersusSubmit = (
    picked: SearchableAnimal | null,
    rawText: string,
  ) => {
    const trimmed = picked ? picked.name : rawText.trim();
    if (!trimmed) return;
    const nextV = versusReducer(versusState, {
      type: "SUBMIT_VERSUS",
      text: trimmed,
    });
    dispatchVersus({ type: "SUBMIT_VERSUS", text: trimmed });
    if (nextV.message) {
      showToast(nextV.message);
    }
  };

  const handleVersusTimeout = useCallback(() => {
    dispatchVersus({ type: "TIMEOUT_TURN" });
    showToast("Time's up! Turn passed.");
  }, [showToast]);

  const filledCount = state.cells.filter((c) => c !== null).length;
  const shareText = state.options.daily
    ? formatTicTacShare({
        dayKey: dailyState?.dayKey ?? todayKey,
        cells: state.cells,
        guessesUsed: state.guessesUsed,
        hardMode: state.options.hardMode,
      })
    : "";

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col items-center px-3 py-4 sm:px-6">
      <Toast toast={toast} />

      {state.phase === "menu" && (
        <div className="flex w-full flex-col items-center gap-4">
          <GameMenu
            brand={TICTAC_META.brand}
            coverSrc={TICTAC_META.cover!.menu}
            startLabel={
              state.options.versus ? "Start Versus Match" : "Start Practice"
            }
            onStart={handleStartPractice}
            description={
              <div className="space-y-2 text-sm sm:text-base">
                <p>
                  Enter animals that match both the row and column trait
                  combinations. Fill the 3×3 grid with the right animal names:
                  write the animal&apos;s name and press <strong>Enter</strong>{" "}
                  to submit it.
                </p>
                <p>
                  If one fits multiple cells, choose the cell by clicking on it.
                  Fill the whole grid to win!
                </p>
                <p>
                  You have <strong>{NORMAL_GUESSES} guesses</strong>.{" "}
                  <strong>Hard Mode</strong>: {HARD_GUESSES} guesses, no
                  repeated animals, no animal list.
                </p>
              </div>
            }
            options={
              <TicTacMenuOptions
                options={state.options}
                onChange={(opts) =>
                  dispatch({ type: "SET_OPTIONS", options: opts })
                }
              />
            }
          />

          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button variant="primary" onClick={handleStartDaily}>
              📅 Daily #{todayNum}
              {dailyState?.dayKey === todayKey
                ? dailyState.status === "playing"
                  ? " (Resume)"
                  : " (Completed)"
                : ""}
            </Button>
            <Button
              variant="secondary"
              onClick={() => setStatsModalOpen(true)}
            >
              📊 Daily Stats
            </Button>
            <Button
              variant="secondary"
              onClick={() => setAnimalListOpen(true)}
            >
              🐾 Animal List ({ANIMALS.length})
            </Button>
          </div>
        </div>
      )}

      {state.phase === "versus" && (
        <div className="flex w-full flex-col items-center gap-4">
          <div className="flex w-full max-w-2xl flex-wrap items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => dispatch({ type: "BACK_TO_MENU" })}
              className="rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-slate-700"
            >
              ← Menu
            </button>
            <div className="flex items-center gap-2">
              <span className="rounded-lg bg-amber-500/20 px-3 py-1 text-xs font-bold text-amber-300">
                Versus Mode (2 Players)
              </span>
              {state.options.versusTimer && versusState.winner === null && (
                <VersusTurnTimer
                  key={versusState.turnCount}
                  seconds={VERSUS_TURN_SECONDS}
                  onExpire={handleVersusTimeout}
                />
              )}
            </div>
            <button
              type="button"
              onClick={() => {
                dispatchVersus({
                  type: "START_VERSUS",
                  seed: randomSeed(),
                });
              }}
              className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-500"
            >
              🔄 Rematch
            </button>
          </div>

          <TicTacGrid
            rows={versusState.rows}
            cols={versusState.cols}
            cells={versusState.cells.map((c) => c?.animalId ?? null)}
            marks={versusState.cells.map((c) => c?.mark ?? null)}
            selectedCell={versusState.selectedCell}
            winningLine={versusState.winningLine}
            revealOnEmpty={versusState.winner !== null}
            allowEmptyCellClick={versusState.winner === null}
            onCellClick={(idx) =>
              dispatchVersus({ type: "SELECT_CELL", cellIndex: idx })
            }
            cornerContent={
              <div className="flex flex-col items-center">
                <span className="text-[11px] uppercase tracking-wider text-slate-400">
                  {versusState.winner ? "Match Over" : "Turn"}
                </span>
                <span className="mt-0.5 text-2xl font-extrabold">
                  {versusState.winner === "draw"
                    ? "🤝"
                    : markSymbol(versusState.winner ?? versusState.turn)}
                </span>
              </div>
            }
          />

          <p className="min-h-[1.5rem] text-center text-sm font-medium text-amber-200">
            {versusState.message}
          </p>

          {versusState.winner === null && (
            <div className="flex w-full max-w-md items-center justify-center">
              <Autocomplete<SearchableAnimal>
                items={ANIMALS}
                onSubmit={handleVersusSubmit}
                minChars={3}
                disabled={versusState.selectedCell === null}
                submitLabel="Claim"
                placeholder={
                  versusState.selectedCell === null
                    ? "Click an empty cell first..."
                    : `Player ${markSymbol(versusState.turn)}: type an animal...`
                }
              />
            </div>
          )}
        </div>
      )}

      {(state.phase === "playing" || state.phase === "over") && (
        <div className="flex w-full flex-col items-center gap-4">
          {/* Top toolbar */}
          <div className="flex w-full max-w-2xl flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => dispatch({ type: "BACK_TO_MENU" })}
                className="rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-slate-700"
              >
                ← Menu
              </button>
              <Link
                href="/"
                className="rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-slate-700"
              >
                🏠 Home
              </Link>
              {state.options.daily && (
                <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-xs font-bold text-emerald-300">
                  Daily #{todayNum}
                </span>
              )}
              {state.options.hardMode && (
                <span className="rounded-full bg-red-500/20 px-2.5 py-0.5 text-xs font-bold text-red-300">
                  💀 Hard Mode
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={state.options.hardMode}
                title={
                  state.options.hardMode
                    ? HARD_MODE_ANIMAL_LIST_TOOLTIP
                    : "View alphabetical animal list"
                }
                onClick={() => !state.options.hardMode && setAnimalListOpen(true)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                  state.options.hardMode
                    ? "cursor-not-allowed bg-slate-800/50 text-slate-500"
                    : "bg-slate-800 text-slate-200 hover:bg-slate-700"
                }`}
              >
                🐾 Animal list
              </button>

              <button
                type="button"
                onClick={() => setStatsModalOpen(true)}
                className="rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-slate-700"
              >
                📊 Stats
              </button>

              {state.phase === "playing" && (
                <GiveUpButton onClick={() => setConfirmGiveUpOpen(true)} />
              )}

              {state.phase === "over" && (
                <Button
                  variant="primary"
                  onClick={() => setGameOverModalOpen(true)}
                >
                  📋 Results
                </Button>
              )}
            </div>
          </div>

          {/* 4x4 Grid */}
          <TicTacGrid
            rows={state.rows}
            cols={state.cols}
            cells={state.cells}
            candidateCells={state.pending?.candidateCells ?? []}
            revealOnEmpty={state.phase === "over"}
            onCellClick={handleCellClick}
            cornerContent={
              <div className="flex flex-col items-center">
                <span className="text-lg" aria-hidden="true">
                  🐾
                </span>
                <span className="text-[11px] font-medium text-slate-300">
                  Guesses left:{" "}
                  <strong className="text-emerald-300">
                    {state.guessesLeft}
                  </strong>
                </span>
                <span className="text-[10px] text-slate-400">
                  Filled: {filledCount}/{GRID_CELL_COUNT}
                </span>
              </div>
            }
          />

          {/* Multi-cell pending prompt */}
          {state.pending && (
            <div className="flex flex-wrap items-center justify-center gap-3 rounded-xl border border-amber-400/50 bg-amber-500/15 px-4 py-2 text-sm text-amber-200">
              <span>
                <strong>{getAnimal(state.pending.animalId).name}</strong> fits{" "}
                {state.pending.candidateCells.length} cells — click a
                highlighted cell to place it.
              </span>
              <button
                type="button"
                onClick={() => dispatch({ type: "CANCEL_PICK" })}
                className="rounded-lg bg-slate-900 px-2.5 py-1 text-xs font-bold text-slate-200 hover:bg-slate-800"
              >
                ✕ Cancel (Esc)
              </button>
            </div>
          )}

          {/* Input bar */}
          {state.phase === "playing" && (
            <div className="flex w-full max-w-md flex-col items-center gap-2">
              <Autocomplete<SearchableAnimal>
                items={ANIMALS}
                onSubmit={handleSubmitGuess}
                minChars={3}
                disabled={state.pending !== null}
                placeholder="Type an animal name (3+ letters)..."
              />
              {state.message && (
                <p
                  role="status"
                  className="text-center text-xs font-medium text-slate-300 sm:text-sm"
                >
                  {state.message}
                </p>
              )}
            </div>
          )}

          {state.phase === "over" && (
            <p className="text-center text-xs text-slate-400">
              Empty cells show up to 3 example animals that match both traits.
            </p>
          )}
        </div>
      )}

      {/* Animal list modal */}
      <AnimalList
        open={animalListOpen}
        onClose={() => setAnimalListOpen(false)}
      />

      {/* Daily stats modal */}
      {statsModalOpen && (
        <Modal
          onClose={() => setStatsModalOpen(false)}
          title="Animal Tic-Tac-Toe — Daily Stats"
          showCloseButton
          dismissible
          className="bg-slate-900 p-6 text-white"
        >
          <StatsPanel stats={stats} buckets={TICTAC_BUCKETS} />
        </Modal>
      )}

      {/* Give up confirmation */}
      {confirmGiveUpOpen && (
        <ConfirmDialog
          title="Give up on this grid?"
          message="Empty cells will reveal example answers and the game will count as a loss."
          confirmLabel="Give up"
          tone="danger"
          onConfirm={handleConfirmGiveUp}
          onCancel={() => setConfirmGiveUpOpen(false)}
        />
      )}

      {/* Game Over Modal */}
      {state.phase === "over" && gameOverModalOpen && (
        <GameOverModal
          won={state.outcome === "completed"}
          title={state.outcome === "completed" ? "You Won! 🎉" : "Game Over"}
          onClose={() => setGameOverModalOpen(false)}
          actions={
            <div className="flex flex-wrap justify-center gap-3">
              <Button variant="primary" onClick={handleStartPractice}>
                {state.options.daily ? "Practice Unlimited" : "Play Again"}
              </Button>
              <Link
                href="/"
                className="inline-block cursor-pointer rounded bg-[#6574fd] px-6 py-2 font-bold text-white transition-colors duration-300 hover:bg-[#4755d4]"
              >
                Go back to home
              </Link>
            </div>
          }
        >
          <div className="flex flex-col items-center gap-4 text-slate-900">
            {state.endMessage && (
              <p className="text-base font-bold">{state.endMessage}</p>
            )}
            {state.hardModeNotice && (
              <p className="text-xs italic opacity-85">
                {state.hardModeNotice}
              </p>
            )}
            <p className="text-xs">
              Filled <strong>{filledCount}/9</strong> cells in{" "}
              <strong>{state.guessesUsed}</strong>{" "}
              {state.guessesUsed === 1 ? "guess" : "guesses"}.
            </p>

            {state.options.daily && (
              <div className="flex w-full flex-col items-center gap-3 rounded-xl bg-slate-900 p-4 text-white">
                <ShareButton getText={() => shareText} />
                <StatsPanel
                  stats={stats}
                  buckets={TICTAC_BUCKETS}
                  highlightKey={String(filledCount)}
                />
                <NextDailyCountdown gameTitle={TICTAC_META.title} />
              </div>
            )}
          </div>
        </GameOverModal>
      )}
    </div>
  );
}
