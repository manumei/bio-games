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
import { playHardModeCelebration, stopCelebration } from "@/lib/audio";
import { getDayKey, puzzleNumber } from "@/lib/daily";
import { useHasMounted } from "@/lib/hooks/useHasMounted";
import { randomSeed } from "@/lib/rng";
import { loadStats, type GameStats } from "@/lib/stats";
import { AnswerFeedback } from "./components/AnswerFeedback";
import { CellMenuOptions } from "./components/CellMenuOptions";
import { ChoiceButtons } from "./components/ChoiceButtons";
import { QuestionBanner } from "./components/QuestionBanner";
import { RoundRecap } from "./components/RoundRecap";
import { StudyModal } from "./components/StudyModal";
import { CELL_LABELS, PASS_SCORE, ROUND_SIZE } from "./config";
import { PARTS, getPart, type CellPart, type CellType } from "./data/parts";
import { CellDiagram } from "./diagrams/CellDiagram";
import {
  CELL_SLUG,
  cellDailySeed,
  createDailyState,
  loadSavedCellDaily,
  recordCellDailyStats,
  restoreDailyState,
  saveCellDaily,
  type CellDailyState,
} from "./logic/daily";
import {
  HARD_MODE_STUDY_TOOLTIP,
  getCellFollowUpMessage,
  pickCellEndMessage,
} from "./logic/messages";
import {
  cellReducer,
  createInitialCellState,
  type CellState,
} from "./logic/reducer";
import { formatCellShare } from "./logic/share";

const CELL_META = getGame("cell-classifier");

const CELL_BUCKETS: readonly StatsBucket[] = [
  { key: "0", label: "0" },
  { key: "1", label: "1" },
  { key: "2", label: "2" },
  { key: "3", label: "3" },
  { key: "4", label: "4" },
  { key: "5", label: "5" },
  { key: "6", label: "6" },
  { key: "7", label: "7" },
  { key: "8", label: "8 🔥" },
  { key: "9", label: "9 🔥" },
  { key: "10", label: "10 🏆" },
];

interface HydratedCellBundle {
  gameState: CellState;
  dailyState: CellDailyState | null;
  stats: GameStats;
}

function hydrateCellBundle(): HydratedCellBundle {
  const todayKey = getDayKey();
  const now = Date.now();
  const saved = loadSavedCellDaily();
  const restored = restoreDailyState(saved, todayKey, now);

  if (restored.abandonedState && restored.mustRecord) {
    saveCellDaily(restored.abandonedState);
    recordCellDailyStats(restored.abandonedState);
  }

  const stats = loadStats(CELL_SLUG);
  const daily = restored.state;

  if (daily) {
    const seed = cellDailySeed(daily.dayKey, daily.options.hardMode);
    const score = daily.answers.filter((a) => a.correct).length;
    const passed = score >= PASS_SCORE;
    const isOver = daily.status === "won" || daily.status === "lost";
    const currentIndex = isOver
      ? Math.max(0, daily.questions.length - 1)
      : Math.min(daily.answers.length, daily.questions.length - 1);

    return {
      dailyState: daily,
      stats,
      gameState: {
        phase: isOver ? "over" : "playing",
        options: {
          hardMode: daily.options.hardMode,
          daily: true,
        },
        seed,
        questions: daily.questions,
        currentIndex,
        answers: daily.answers,
        awaitingNext: false,
        feedback: null,
        toastMessage: null,
        score,
        passed,
        outcome: isOver
          ? daily.endReason ?? (passed ? "completed" : "failed")
          : null,
        endMessage: isOver ? pickCellEndMessage(score, seed) : null,
        hardModeNotice: isOver
          ? getCellFollowUpMessage(passed, daily.options.hardMode)
          : null,
      },
    };
  }

  return {
    dailyState: null,
    stats,
    gameState: createInitialCellState(),
  };
}

export default function CellClassifierGame() {
  const hasMounted = useHasMounted();
  if (!hasMounted) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Spinner />
      </div>
    );
  }
  return <CellClassifierClient />;
}

function CellClassifierClient() {
  const [initial] = useState<HydratedCellBundle>(hydrateCellBundle);
  const [state, dispatch] = useReducer(cellReducer, initial.gameState);
  const [dailyState, setDailyState] = useState<CellDailyState | null>(
    initial.dailyState,
  );
  const [stats, setStats] = useState<GameStats>(initial.stats);
  const [studyOpen, setStudyOpen] = useState(false);
  const [statsOpen, setStatsOpen] = useState(false);
  const [confirmGiveUpOpen, setConfirmGiveUpOpen] = useState(false);
  const [gameOverModalOpen, setGameOverModalOpen] = useState(
    initial.gameState.phase === "over",
  );
  const [recapInspectIndex, setRecapInspectIndex] = useState<number>(0);

  const { toast, show: showToast } = useToast();

  const todayKey = getDayKey();
  const todayNum = puzzleNumber(todayKey);

  const persistDaily = useCallback(
    (nextState: CellState, prevDaily: CellDailyState | null) => {
      if (!nextState.options.daily) return;
      const baseDaily =
        prevDaily ??
        createDailyState(
          todayKey,
          { hardMode: nextState.options.hardMode },
          Date.now(),
        );
      const isOver = nextState.phase === "over";
      const won = isOver && nextState.passed && nextState.outcome !== "gave-up";
      const updatedDaily: CellDailyState = {
        ...baseDaily,
        questions: nextState.questions,
        answers: nextState.answers,
        status: isOver ? (won ? "won" : "lost") : "playing",
        endedAt: isOver ? (baseDaily.endedAt ?? Date.now()) : null,
        endReason: isOver ? (nextState.outcome ?? "failed") : null,
      };
      saveCellDaily(updatedDaily);
      setDailyState(updatedDaily);
      if (isOver && baseDaily.status === "playing") {
        const nextStats = recordCellDailyStats(updatedDaily);
        setStats(nextStats);
      }
    },
    [todayKey],
  );

  const handleStartPractice = () => {
    const seed = randomSeed();
    dispatch({
      type: "START_ROUND",
      seed,
      options: { ...state.options, daily: false },
    });
    setGameOverModalOpen(false);
    setRecapInspectIndex(0);
  };

  const handleStartDaily = () => {
    if (dailyState && dailyState.dayKey === todayKey) {
      const seed = cellDailySeed(dailyState.dayKey, dailyState.options.hardMode);
      const score = dailyState.answers.filter((a) => a.correct).length;
      const passed = score >= PASS_SCORE;
      const isOver =
        dailyState.status === "won" || dailyState.status === "lost";
      const currentIndex = isOver
        ? Math.max(0, dailyState.questions.length - 1)
        : Math.min(dailyState.answers.length, dailyState.questions.length - 1);

      dispatch({
        type: "HYDRATE_STATE",
        state: {
          phase: isOver ? "over" : "playing",
          options: {
            hardMode: dailyState.options.hardMode,
            daily: true,
          },
          seed,
          questions: dailyState.questions,
          currentIndex,
          answers: dailyState.answers,
          awaitingNext: false,
          feedback: null,
          toastMessage: null,
          score,
          passed,
          outcome: isOver
            ? dailyState.endReason ?? (passed ? "completed" : "failed")
            : null,
          endMessage: isOver ? pickCellEndMessage(score, seed) : null,
          hardModeNotice: isOver
            ? getCellFollowUpMessage(passed, dailyState.options.hardMode)
            : null,
        },
      });
      setGameOverModalOpen(isOver);
      setRecapInspectIndex(0);
      return;
    }

    const freshDaily = createDailyState(
      todayKey,
      { hardMode: state.options.hardMode },
      Date.now(),
    );
    saveCellDaily(freshDaily);
    setDailyState(freshDaily);
    const seed = cellDailySeed(todayKey, state.options.hardMode);
    const nextState = cellReducer(state, {
      type: "START_ROUND",
      seed,
      options: { hardMode: state.options.hardMode, daily: true },
      questions: freshDaily.questions,
    });
    dispatch({ type: "HYDRATE_STATE", state: nextState });
    setGameOverModalOpen(false);
    setRecapInspectIndex(0);
  };

  const handleAnswerPart = (partId: string) => {
    const nextState = cellReducer(state, { type: "ANSWER_PART", partId });
    dispatch({ type: "HYDRATE_STATE", state: nextState });
    persistDaily(nextState, dailyState);
  };

  const handleAnswerCell = (cell: CellType) => {
    const nextState = cellReducer(state, { type: "ANSWER_CELL", cell });
    dispatch({ type: "HYDRATE_STATE", state: nextState });
    persistDaily(nextState, dailyState);
  };

  const handleAnswerText = (_picked: CellPart | null, rawText: string) => {
    const nextState = cellReducer(state, {
      type: "ANSWER_TEXT",
      text: rawText,
    });
    dispatch({ type: "HYDRATE_STATE", state: nextState });
    if (nextState.toastMessage) {
      showToast(nextState.toastMessage);
    } else {
      persistDaily(nextState, dailyState);
    }
  };

  const handleNextQuestion = () => {
    const nextState = cellReducer(state, { type: "NEXT_QUESTION" });
    dispatch({ type: "HYDRATE_STATE", state: nextState });
    persistDaily(nextState, dailyState);
    if (nextState.phase === "over") {
      setGameOverModalOpen(true);
    }
  };

  const handleConfirmGiveUp = () => {
    setConfirmGiveUpOpen(false);
    const nextState = cellReducer(state, { type: "GIVE_UP" });
    dispatch({ type: "HYDRATE_STATE", state: nextState });
    persistDaily(nextState, dailyState);
    setGameOverModalOpen(true);
  };

  const currentQuestion = state.questions[state.currentIndex];
  const latestAnswer = state.awaitingNext
    ? state.answers[state.currentIndex] ?? null
    : null;
  const inspectedQuestion =
    state.questions[recapInspectIndex] ?? state.questions[0];

  const shareText = state.options.daily
    ? formatCellShare({
        dayKey: dailyState?.dayKey ?? todayKey,
        answers: state.answers,
        hardMode: state.options.hardMode,
      })
    : "";

  useEffect(() => {
    if (state.phase === "over" && state.score >= 8 && state.options.hardMode) {
      playHardModeCelebration();
    }
    return () => {
      stopCelebration();
    };
  }, [state.phase, state.score, state.options.hardMode]);

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col items-center px-3 py-4 sm:px-6">
      <Toast toast={toast} />

      {state.phase === "menu" && (
        <div className="flex w-full flex-col items-center gap-4">
          <GameMenu
            brand={CELL_META.brand}
            coverSrc={CELL_META.cover!.menu}
            startLabel="Start Practice"
            onStart={handleStartPractice}
            description={
              <div className="space-y-2 text-sm sm:text-base">
                <p>
                  How well do you know your organelles? Each round has{" "}
                  <strong>{ROUND_SIZE} questions</strong> on animal and plant
                  cells:
                </p>
                <p>
                  <strong>Name it</strong>: a structure lights up, you pick its
                  name. <strong>Find it</strong>: we name a structure, you click
                  it on the cell.
                </p>
                <p>
                  Score {PASS_SCORE} or more to keep your streak alive. 🔥
                </p>
                <p>
                  <strong>Hard Mode</strong>: type the names yourself, add
                  bacteria and the tiny organelles, and no study diagrams.
                </p>
              </div>
            }
            options={
              <CellMenuOptions
                hardMode={state.options.hardMode}
                onToggleHardMode={() =>
                  dispatch({
                    type: "SET_OPTIONS",
                    options: { hardMode: !state.options.hardMode },
                  })
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
            <Button variant="secondary" onClick={() => setStatsOpen(true)}>
              📊 Daily Stats
            </Button>
            <Button variant="secondary" onClick={() => setStudyOpen(true)}>
              📖 Study diagrams
            </Button>
          </div>
        </div>
      )}

      {state.phase === "playing" && currentQuestion && (
        <div className="flex w-full flex-col items-center gap-4">
          {/* Top toolbar */}
          <div className="flex w-full max-w-xl flex-wrap items-center justify-between gap-2">
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
                    ? HARD_MODE_STUDY_TOOLTIP
                    : "Open labeled cell study diagrams"
                }
                onClick={() => !state.options.hardMode && setStudyOpen(true)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                  state.options.hardMode
                    ? "cursor-not-allowed bg-slate-800/50 text-slate-500"
                    : "bg-slate-800 text-slate-200 hover:bg-slate-700"
                }`}
              >
                📖 Study diagrams
              </button>
              <button
                type="button"
                onClick={() => setStatsOpen(true)}
                className="rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-slate-700"
              >
                📊 Stats
              </button>
              <GiveUpButton onClick={() => setConfirmGiveUpOpen(true)} />
            </div>
          </div>

          <QuestionBanner
            question={currentQuestion}
            index={state.currentIndex}
            score={state.score}
          />

          {/* Cell diagram (shown for name & find, and after answering classify) */}
          {(currentQuestion.type !== "classify" || state.awaitingNext) && (
            <div className="flex w-full max-w-xl flex-col items-center rounded-2xl border border-slate-800 bg-slate-950/85 p-3 shadow-lg sm:p-5">
              <CellDiagram
                cell={currentQuestion.cell}
                highlight={
                  !state.awaitingNext && currentQuestion.type === "name"
                    ? currentQuestion.partId
                    : null
                }
                correct={state.awaitingNext ? currentQuestion.partId : null}
                wrong={
                  state.awaitingNext &&
                  latestAnswer &&
                  !latestAnswer.correct &&
                  currentQuestion.type !== "classify"
                    ? latestAnswer.given
                    : null
                }
                onPartClick={
                  !state.awaitingNext && currentQuestion.type === "find"
                    ? handleAnswerPart
                    : undefined
                }
              />
            </div>
          )}

          {/* Answer controls */}
          {currentQuestion.type === "name" && !state.options.hardMode && (
            <ChoiceButtons
              question={currentQuestion}
              disabled={state.awaitingNext}
              selectedOption={latestAnswer?.given ?? null}
              onSelectPart={handleAnswerPart}
              onSelectCell={handleAnswerCell}
            />
          )}

          {currentQuestion.type === "name" &&
            state.options.hardMode &&
            !state.awaitingNext && (
              <div className="flex w-full max-w-md flex-col items-center gap-2">
                <Autocomplete<CellPart>
                  items={PARTS}
                  suggestions={false}
                  onSubmit={handleAnswerText}
                  placeholder="Type the structure name and press Enter..."
                />
              </div>
            )}

          {currentQuestion.type === "classify" && (
            <ChoiceButtons
              question={currentQuestion}
              disabled={state.awaitingNext}
              selectedOption={latestAnswer?.given ?? null}
              onSelectPart={handleAnswerPart}
              onSelectCell={handleAnswerCell}
            />
          )}

          {state.awaitingNext && state.feedback && (
            <AnswerFeedback
              feedback={state.feedback}
              isLast={state.currentIndex + 1 >= state.questions.length}
              onNext={handleNextQuestion}
            />
          )}
        </div>
      )}

      {state.phase === "over" && (
        <div className="flex w-full max-w-xl flex-col items-center gap-4">
          <div className="flex w-full flex-wrap items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => dispatch({ type: "BACK_TO_MENU" })}
              className="rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-slate-700"
            >
              ← Menu
            </button>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setStudyOpen(true)}
                className="rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-slate-700"
              >
                📖 Study diagrams
              </button>
              <Button
                variant="primary"
                onClick={() => setGameOverModalOpen(true)}
              >
                📋 Round Summary
              </Button>
            </div>
          </div>

          {inspectedQuestion && (
            <div className="flex w-full flex-col items-center gap-2 rounded-2xl border border-slate-800 bg-slate-950/85 p-4">
              <p className="text-xs font-bold text-cyan-300">
                Inspecting Q{recapInspectIndex + 1}:{" "}
                {getPart(inspectedQuestion.partId).name} (
                {CELL_LABELS[inspectedQuestion.cell]})
              </p>
              <CellDiagram
                cell={inspectedQuestion.cell}
                highlight={inspectedQuestion.partId}
              />
              <p className="text-center text-xs text-slate-300">
                {getPart(inspectedQuestion.partId).fn}
              </p>
            </div>
          )}

          <div className="w-full rounded-xl bg-slate-200 p-4 text-slate-900">
            <RoundRecap
              questions={state.questions}
              answers={state.answers}
              selectedIndex={recapInspectIndex}
              onSelectQuestion={(idx) => setRecapInspectIndex(idx)}
            />
          </div>
        </div>
      )}

      {/* Study Modal */}
      <StudyModal open={studyOpen} onClose={() => setStudyOpen(false)} />

      {/* Daily Stats Modal */}
      {statsOpen && (
        <Modal
          onClose={() => setStatsOpen(false)}
          title="Cell Classifier — Daily Stats"
          showCloseButton
          dismissible
          className="bg-slate-900 p-6 text-white"
        >
          <StatsPanel stats={stats} buckets={CELL_BUCKETS} />
        </Modal>
      )}

      {/* Give up confirmation */}
      {confirmGiveUpOpen && (
        <ConfirmDialog
          title="Give up on this round?"
          message="Unanswered questions will count as wrong and the round will end."
          confirmLabel="Give up"
          tone="danger"
          onConfirm={handleConfirmGiveUp}
          onCancel={() => setConfirmGiveUpOpen(false)}
        />
      )}

      {/* Game Over Modal */}
      {state.phase === "over" && gameOverModalOpen && (
        <GameOverModal
          won={state.passed && state.outcome !== "gave-up"}
          title={
            state.passed && state.outcome !== "gave-up"
              ? "You Won! 🎉"
              : "You Lost 🥀"
          }
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
            <p className="text-lg font-extrabold">
              Score: {state.score} / {ROUND_SIZE}
            </p>
            {state.endMessage && (
              <p className="text-sm font-bold">{state.endMessage}</p>
            )}
            {state.hardModeNotice && (
              <p className="text-xs italic opacity-85">
                {state.hardModeNotice}
              </p>
            )}

            <RoundRecap
              questions={state.questions}
              answers={state.answers}
              selectedIndex={recapInspectIndex}
              onSelectQuestion={(idx) => {
                setRecapInspectIndex(idx);
                setGameOverModalOpen(false);
              }}
            />

            {state.options.daily && (
              <div className="flex w-full flex-col items-center gap-3 rounded-xl bg-slate-900 p-4 text-white">
                <ShareButton getText={() => shareText} />
                <StatsPanel
                  stats={stats}
                  buckets={CELL_BUCKETS}
                  highlightKey={String(state.score)}
                />
                <NextDailyCountdown gameTitle={CELL_META.title} />
              </div>
            )}
          </div>
        </GameOverModal>
      )}
    </div>
  );
}

