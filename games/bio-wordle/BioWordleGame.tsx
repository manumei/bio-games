"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useReducer, useState } from "react";
import GameMenu from "@/components/game/GameMenu";
import GameOverModal from "@/components/game/GameOverModal";
import NextDailyCountdown from "@/components/game/NextDailyCountdown";
import ShareButton from "@/components/game/ShareButton";
import StatsPanel, { type StatsBucket } from "@/components/game/StatsPanel";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import Spinner from "@/components/ui/Spinner";
import Toast, { useToast } from "@/components/ui/Toast";
import { getGame } from "@/games/registry";
import { playHardModeCelebration, stopCelebration } from "@/lib/audio";
import Board from "@/games/bio-wordle/components/Board";
import Keyboard from "@/games/bio-wordle/components/Keyboard";
import WordCard from "@/games/bio-wordle/components/WordCard";
import { WordleHardModeButton } from "@/games/bio-wordle/components/WordleMenuOptions";
import { HINT_AFTER, TOPICS } from "@/games/bio-wordle/config";
import { getAnswer } from "@/games/bio-wordle/data/answers";
import {
  WORDLE_SLUG,
  createDailyState,
  loadSavedWordleDaily,
  recordWordleDailyStats,
  restoreDailyState,
  saveWordleDaily,
  type WordleDailyState,
} from "@/games/bio-wordle/logic/daily";
import {
  HARD_MODE_HINT_TOOLTIP,
  getWordleFollowUpMessage,
  pickWordleLossMessage,
  pickWordleWinMessage,
} from "@/games/bio-wordle/logic/messages";
import {
  createInitialWordleState,
  validateCurrentGuess,
  wordleReducer,
} from "@/games/bio-wordle/logic/reducer";
import { answerFor, pickPracticeAnswer } from "@/games/bio-wordle/logic/schedule";
import { mergeKeyStates } from "@/games/bio-wordle/logic/score";
import { buildShareText } from "@/games/bio-wordle/logic/share";
import type { TileEval, WordleGameState } from "@/games/bio-wordle/types";
import { dailySeed, getDayKey, puzzleNumber } from "@/lib/daily";
import { useHasMounted } from "@/lib/hooks/useHasMounted";
import { useWindowKeydown } from "@/lib/hooks/useWindowKeydown";
import { createRng, randomSeed } from "@/lib/rng";
import { loadStats } from "@/lib/stats";

const WORDLE_META = getGame("bio-wordle");

const WORDLE_BUCKETS: readonly StatsBucket[] = [
  { key: "1", label: "1" },
  { key: "2", label: "2" },
  { key: "3", label: "3" },
  { key: "4", label: "4" },
  { key: "5", label: "5" },
  { key: "6", label: "6" },
  { key: "X", label: "X" },
];

const ALLOWED_SET_CACHE = new Map<number, ReadonlySet<string>>();

function initWordleClientState(): WordleGameState {
  const base = createInitialWordleState();
  const todayKey = getDayKey();
  const now = Date.now();
  const saved = loadSavedWordleDaily();
  const restored = restoreDailyState(saved, todayKey, now);

  if (restored.abandonedState && restored.mustRecord) {
    saveWordleDaily(restored.abandonedState);
    recordWordleDailyStats(restored.abandonedState);
  }

  if (restored.state) {
    const answer = getAnswer(restored.state.answer) ?? answerFor(restored.state.dayKey);
    const seed = dailySeed(WORDLE_SLUG, restored.state.dayKey);
    return wordleReducer(base, {
      type: "HYDRATE_DAILY",
      dailyState: restored.state,
      answer,
      seed,
    });
  }

  return {
    ...base,
    dayKey: todayKey,
    seed: dailySeed(WORDLE_SLUG, todayKey),
    answer: answerFor(todayKey),
  };
}

function buildDailySnapshot(state: WordleGameState): WordleDailyState {
  const dayKey = state.dayKey ?? getDayKey();
  const lastGuess = state.guesses[state.guesses.length - 1];
  const won = state.phase === "over" && lastGuess === state.answer.word;

  return {
    version: 1,
    dayKey,
    options: state.options,
    status: state.phase === "playing" ? "playing" : won ? "won" : "lost",
    startedAt: Date.now(),
    deadline: null,
    endedAt: state.endedAt,
    endReason:
      state.phase === "playing" ? null : won ? "completed" : "failed",
    answer: state.answer.word,
    guesses: state.guesses,
    hintUsed: state.hintUsed,
  };
}

export default function BioWordleGame() {
  const hasMounted = useHasMounted();
  if (!hasMounted) {
    return (
      <main className="min-h-[80vh] bg-page flex items-center justify-center">
        <Spinner />
      </main>
    );
  }
  return <BioWordleClient />;
}

function BioWordleClient() {
  const [state, dispatch] = useReducer(
    wordleReducer,
    undefined,
    initWordleClientState
  );
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [loadedDict, setLoadedDict] = useState<{
    length: number;
    set: ReadonlySet<string> | null;
  } | null>(() => {
    const len = state.answer.word.length;
    const cached = ALLOWED_SET_CACHE.get(len);
    return cached ? { length: len, set: cached } : null;
  });
  const { toast, show: showToast } = useToast();

  const wordLength = state.answer.word.length;
  const isDictReady = loadedDict !== null && loadedDict.length === wordLength;
  const allowedSet = isDictReady ? loadedDict.set : null;

  // Fetch allowed-N.txt for current word length
  useEffect(() => {
    if (state.phase === "menu") return;
    const cached = ALLOWED_SET_CACHE.get(wordLength);
    if (cached) {
      return;
    }

    let cancelled = false;
    fetch(`/assets/data/wordle/allowed-${wordLength}.txt`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.text();
      })
      .then((text) => {
        if (cancelled) return;
        const set = new Set(
          text
            .split(/\r?\n/)
            .map((w) => w.trim().toLowerCase())
            .filter(Boolean)
        );
        ALLOWED_SET_CACHE.set(wordLength, set);
        setLoadedDict({ length: wordLength, set });
      })
      .catch((err) => {
        if (cancelled) return;
        console.warn(
          `[BioWordle] Failed to load allowed-${wordLength}.txt (${String(err)}); accepting any ${wordLength}-letter word.`
        );
        setLoadedDict({ length: wordLength, set: null });
      });

    return () => {
      cancelled = true;
    };
  }, [state.phase, wordLength]);

  // Persist daily progress and stats
  useEffect(() => {
    if (state.mode !== "daily" || state.phase === "menu") return;
    const snapshot = buildDailySnapshot(state);
    saveWordleDaily(snapshot);
    if (state.phase === "over") {
      recordWordleDailyStats(snapshot);
    }
  }, [state]);

  const todayKey = state.dayKey ?? getDayKey();
  const dailyNumber = puzzleNumber(todayKey);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- Preserved for Daily Challenge re-enablement
  const handleStartDaily = useCallback(() => {
    const dayKey = getDayKey();
    const initialDaily = createDailyState(dayKey, state.options, Date.now());
    saveWordleDaily(initialDaily);
    const ans = getAnswer(initialDaily.answer) ?? answerFor(dayKey);
    const seed = dailySeed(WORDLE_SLUG, dayKey);
    const cached = ALLOWED_SET_CACHE.get(ans.word.length);
    if (cached) {
      setLoadedDict({ length: ans.word.length, set: cached });
    }
    dispatch({
      type: "HYDRATE_DAILY",
      dailyState: initialDaily,
      answer: ans,
      seed,
    });
  }, [state.options]);

  const handleStartPractice = useCallback(() => {
    const seed = randomSeed();
    const rng = createRng(seed);
    const ans = pickPracticeAnswer(rng);
    const cached = ALLOWED_SET_CACHE.get(ans.word.length);
    if (cached) {
      setLoadedDict({ length: ans.word.length, set: cached });
    }
    dispatch({
      type: "START",
      mode: "practice",
      dayKey: null,
      seed,
      answer: ans,
    });
  }, []);

  const handleSubmit = useCallback(() => {
    if (state.phase !== "playing" || !isDictReady) return;
    const error = validateCurrentGuess(state, allowedSet);
    if (error) {
      showToast(error);
      dispatch({ type: "TRIGGER_SHAKE" });
      return;
    }
    dispatch({
      type: "SUBMIT_ACCEPTED",
      guess: state.currentGuess,
      now: Date.now(),
    });
  }, [state, isDictReady, allowedSet, showToast]);

  useWindowKeydown(
    (e) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (e.key === "Enter") {
        e.preventDefault();
        handleSubmit();
      } else if (e.key === "Backspace") {
        e.preventDefault();
        dispatch({ type: "BACKSPACE" });
      } else if (/^[a-zA-Z]$/.test(e.key)) {
        e.preventDefault();
        dispatch({ type: "TYPE_LETTER", letter: e.key });
      }
    },
    state.phase === "playing" && isDictReady && !showStatsModal
  );

  const keyStates = useMemo(() => {
    let map: Record<string, TileEval> = {};
    for (let i = 0; i < state.guesses.length; i++) {
      const g = state.guesses[i];
      const ev = state.evaluations[i];
      if (g && ev) {
        map = mergeKeyStates(map, g, ev);
      }
    }
    return map;
  }, [state.guesses, state.evaluations]);

  const isGameOver = state.phase === "over";
  const lastGuess = state.guesses[state.guesses.length - 1];
  const gameWon = isGameOver && lastGuess === state.answer.word;

  useEffect(() => {
    if (isGameOver && gameWon && state.options.hardMode) {
      playHardModeCelebration();
    }
    return () => {
      stopCelebration();
    };
  }, [isGameOver, gameWon, state.options.hardMode]);

  if (state.mode === "daily" && state.phase === "over") {
    recordWordleDailyStats(buildDailySnapshot(state));
  }
  const currentStats = loadStats(WORDLE_SLUG);

  if (state.phase === "menu") {
    return (
      <main className="min-h-[80vh] bg-page px-4 md:px-0 py-10">
        <GameMenu
          brand={WORDLE_META.brand}
          coverSrc={WORDLE_META.cover!.menu}
          startLabel="Start Game"
          onStart={handleStartPractice}
          description={
            <div className="space-y-2">
              <p>
                Guess the hidden <strong>biology</strong> word in 6 tries.
                It&apos;s 4 to 7 letters long, and the length changes every round!
              </p>
              <p>
                After each guess the tiles change color: 🟩 right letter, right
                spot · 🟨 in the word but in the wrong spot · ⬛ not in the
                word.
              </p>
              <p>
                Any real English word counts as a guess, but the answer is
                always biology.
              </p>
              <p>
                <strong>Hard Mode</strong>: any revealed hints must be used in
                your next guesses, and no topic hint.
              </p>
            </div>
          }
          extraActions={
            <div className="flex flex-wrap gap-2 items-center">
              <WordleHardModeButton
                hardMode={state.options.hardMode}
                onToggle={() =>
                  dispatch({
                    type: "SET_OPTIONS",
                    hardMode: !state.options.hardMode,
                  })
                }
              />
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
            title="Bio Wordle Stats"
            showCloseButton
            onClose={() => setShowStatsModal(false)}
          >
            <StatsPanel stats={currentStats} buckets={WORDLE_BUCKETS} />
          </Modal>
        )}
      </main>
    );
  }

  const showHintControl = state.guesses.length >= HINT_AFTER && !isGameOver;
  const topicInfo = TOPICS[state.answer.topic];
  const primaryMessage = gameWon
    ? pickWordleWinMessage(state.guesses.length, state.seed)
    : pickWordleLossMessage(state.answer.word, state.seed);
  const followUpMessage = getWordleFollowUpMessage(
    gameWon,
    state.options.hardMode
  );
  const highlightKey = gameWon ? String(state.guesses.length) : "X";

  return (
    <main className="min-h-[90vh] bg-page py-3 px-2 flex flex-col items-center">
      <Toast toast={toast} />

      <div className="text-white flex flex-col items-center gap-3 w-full max-w-xl">
        {/* Header */}
        <div className="flex w-full items-center justify-between px-2 text-sm sm:text-base font-bold text-accent">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              stopCelebration();
              dispatch({ type: "RESET_TO_MENU" });
            }}
          >
            ← Menu
          </Button>
          <div className="flex items-center gap-2">
            <span>{wordLength} letters</span>
            {state.options.hardMode && (
              <span className="bg-red-600 text-white px-2 py-0.5 rounded text-xs">
                💀 Hard
              </span>
            )}
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setShowStatsModal(true)}
          >
            📊 Stats
          </Button>
        </div>

        {/* Topic Hint Chip / Button */}
        {state.hintUsed && (
          <div className="px-3 py-1 rounded-full bg-panel border border-accent text-accent text-xs sm:text-sm font-bold">
            💡 Topic: {topicInfo.emoji} {topicInfo.label}
          </div>
        )}

        {showHintControl && !state.hintUsed && (
          <button
            type="button"
            onClick={() => {
              if (!state.options.hardMode) {
                dispatch({ type: "USE_HINT" });
              }
            }}
            title={
              state.options.hardMode
                ? HARD_MODE_HINT_TOOLTIP
                : "Reveal the biology topic of today's word"
            }
            className={`px-3 py-1 rounded font-bold text-xs sm:text-sm transition ${
              state.options.hardMode
                ? "bg-yellow-200 text-black opacity-50 cursor-not-allowed"
                : "bg-accent text-black hover:bg-yellow-300 cursor-pointer"
            }`}
          >
            💡 Hint
          </button>
        )}

        {!isDictReady ? (
          <div className="my-12">
            <Spinner />
          </div>
        ) : (
          <Board
            wordLength={wordLength}
            guesses={state.guesses}
            evaluations={state.evaluations}
            currentGuess={state.currentGuess}
            shakeNonce={state.shakeNonce}
          />
        )}

        <Keyboard
          keyStates={keyStates}
          disabled={isGameOver || !isDictReady}
          onLetter={(letter) => dispatch({ type: "TYPE_LETTER", letter })}
          onBackspace={() => dispatch({ type: "BACKSPACE" })}
          onEnter={handleSubmit}
        />

        {isGameOver && (
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
      </div>

      {isGameOver && state.modalOpen && (
        <GameOverModal
          won={gameWon}
          onClose={() => {
            stopCelebration();
            dispatch({ type: "CLOSE_MODAL" });
          }}
          actions={
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Button
                variant="primary"
                onClick={() => {
                  stopCelebration();
                  handleStartPractice();
                }}
              >
                Play Again
              </Button>
              <Button
                variant="secondary"
                onClick={() => {
                  stopCelebration();
                  dispatch({ type: "RESET_TO_MENU" });
                }}
              >
                Game Menu
              </Button>
              <Link
                href="/"
                onClick={stopCelebration}
                className="inline-block px-6 py-2 bg-[#6574fd] hover:bg-[#4755d4] text-white font-bold rounded cursor-pointer transition-colors duration-300"
              >
                Go back to home
              </Link>
            </div>
          }
        >
          <WordCard answer={state.answer} />
          <p className="text-base sm:text-lg font-medium">{primaryMessage}</p>
          <p className="text-sm sm:text-base font-medium">{followUpMessage}</p>

          {state.mode === "daily" && (
            <>
              <StatsPanel
                stats={currentStats}
                buckets={WORDLE_BUCKETS}
                highlightKey={highlightKey}
              />
              <div className="flex flex-col items-center gap-2 pt-1">
                <ShareButton
                  getText={() =>
                    buildShareText(buildDailySnapshot(state), {
                      dayNumber: dailyNumber,
                    })
                  }
                />
                <NextDailyCountdown gameTitle="Bio Wordle" />
              </div>
            </>
          )}
        </GameOverModal>
      )}
    </main>
  );
}

