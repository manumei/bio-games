"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useReducer, useState } from "react";
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
import DiagnosisCard from "@/games/symptoms-link/components/DiagnosisCard";
import Glossary from "@/games/symptoms-link/components/Glossary";
import { LinkHardModeButton } from "@/games/symptoms-link/components/LinkMenuOptions";
import PatientChart from "@/games/symptoms-link/components/PatientChart";
import WrongGuesses from "@/games/symptoms-link/components/WrongGuesses";
import { MAX_STAGE } from "@/games/symptoms-link/config";
import { DISEASES, getDisease } from "@/games/symptoms-link/data/diseases";
import {
  LINK_SLUG,
  createDailyState,
  loadSavedLinkDaily,
  recordLinkDailyStats,
  restoreDailyState,
  saveLinkDaily,
  type LinkDailyState,
} from "@/games/symptoms-link/logic/daily";
import {
  getLinkFollowUpMessage,
  pickLinkLossMessage,
  pickLinkWinMessage,
} from "@/games/symptoms-link/logic/messages";
import {
  createInitialLinkState,
  evaluateDiseaseSubmission,
  linkReducer,
} from "@/games/symptoms-link/logic/reducer";
import {
  diseaseFor,
  pickPracticeDisease,
} from "@/games/symptoms-link/logic/schedule";
import { buildShareText } from "@/games/symptoms-link/logic/share";
import type { LinkGameState } from "@/games/symptoms-link/types";
import { dailySeed, getDayKey, puzzleNumber } from "@/lib/daily";
import { useHasMounted } from "@/lib/hooks/useHasMounted";
import { createRng, randomSeed } from "@/lib/rng";
import { loadStats } from "@/lib/stats";

const LINK_META = getGame("symptoms-link");

const LINK_BUCKETS: readonly StatsBucket[] = [
  { key: "1", label: "1" },
  { key: "2", label: "2" },
  { key: "3", label: "3" },
  { key: "4", label: "4" },
  { key: "5", label: "5" },
  { key: "X", label: "X" },
];

function initLinkClientState(): LinkGameState {
  const base = createInitialLinkState();
  const todayKey = getDayKey();
  const now = Date.now();
  const saved = loadSavedLinkDaily();
  const restored = restoreDailyState(saved, todayKey, now);

  if (restored.abandonedState && restored.mustRecord) {
    saveLinkDaily(restored.abandonedState);
    recordLinkDailyStats(restored.abandonedState);
  }

  if (restored.state) {
    const disease = getDisease(restored.state.diseaseId);
    const seed = dailySeed(LINK_SLUG, restored.state.dayKey);
    return linkReducer(base, {
      type: "HYDRATE_DAILY",
      dailyState: restored.state,
      disease,
      seed,
    });
  }

  return {
    ...base,
    dayKey: todayKey,
    seed: dailySeed(LINK_SLUG, todayKey),
    disease: diseaseFor(todayKey),
  };
}

function buildDailySnapshot(state: LinkGameState): LinkDailyState {
  const dayKey = state.dayKey ?? getDayKey();
  return {
    version: 1,
    dayKey,
    options: state.options,
    status:
      state.phase === "playing" ? "playing" : state.won ? "won" : "lost",
    startedAt: Date.now(),
    deadline: null,
    endedAt: state.endedAt,
    endReason:
      state.phase === "playing"
        ? null
        : state.won
        ? "completed"
        : "failed",
    diseaseId: state.disease.id,
    stage: state.stage,
    log: state.log,
  };
}

export default function SymptomsLinkGame() {
  const hasMounted = useHasMounted();
  if (!hasMounted) {
    return (
      <main className="min-h-[80vh] bg-page flex items-center justify-center">
        <Spinner />
      </main>
    );
  }
  return <SymptomsLinkClient />;
}

function SymptomsLinkClient() {
  const [state, dispatch] = useReducer(
    linkReducer,
    undefined,
    initLinkClientState
  );
  const [showGlossary, setShowGlossary] = useState(false);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [showGiveUpConfirm, setShowGiveUpConfirm] = useState(false);
  const { toast, show: showToast } = useToast();

  const searchableItems = useMemo(
    () =>
      DISEASES.map((d) => ({
        id: d.id,
        label: d.name,
        aliases: d.aliases,
      })),
    []
  );

  // Persist daily progress and stats
  useEffect(() => {
    if (state.mode !== "daily" || state.phase === "menu") return;
    const snapshot = buildDailySnapshot(state);
    saveLinkDaily(snapshot);
    if (state.phase === "over") {
      recordLinkDailyStats(snapshot);
    }
  }, [state]);

  const todayKey = state.dayKey ?? getDayKey();
  const dailyNumber = puzzleNumber(todayKey);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- Preserved for Daily Challenge re-enablement
  const handleStartDaily = useCallback(() => {
    const dayKey = getDayKey();
    const initialDaily = createDailyState(dayKey, state.options, Date.now());
    saveLinkDaily(initialDaily);
    const disease = getDisease(initialDaily.diseaseId);
    const seed = dailySeed(LINK_SLUG, dayKey);
    dispatch({
      type: "HYDRATE_DAILY",
      dailyState: initialDaily,
      disease,
      seed,
    });
  }, [state.options]);

  const handleStartPractice = useCallback(() => {
    const seed = randomSeed();
    const rng = createRng(seed);
    const disease = pickPracticeDisease(rng);
    dispatch({
      type: "START",
      mode: "practice",
      dayKey: null,
      seed,
      disease,
    });
  }, []);

  const isGameOver = state.phase === "over";

  useEffect(() => {
    if (isGameOver && state.won && state.options.hardMode) {
      playHardModeCelebration();
    }
    return () => {
      stopCelebration();
    };
  }, [isGameOver, state.won, state.options.hardMode]);

  if (state.mode === "daily" && state.phase === "over") {
    recordLinkDailyStats(buildDailySnapshot(state));
  }
  const currentStats = loadStats(LINK_SLUG);

  if (state.phase === "menu") {
    return (
      <main className="min-h-[80vh] bg-page px-4 md:px-0 py-10">
        <GameMenu
          brand={LINK_META.brand}
          coverSrc={LINK_META.cover!.menu}
          startLabel="Start Game"
          onStart={handleStartPractice}
          description={
            <div className="space-y-2">
              <p>
                In <strong>Symptoms Link</strong> you must prove your diagnosing
                skills: guess the <strong>disease</strong> that connects all the
                given symptoms.
              </p>
              <p>
                The game starts by showing one symptom. You can guess a disease
                or skip to see more. Once all five symptoms are revealed, you
                have one final guess to make.
              </p>
              <p>
                <strong>Hard Mode</strong>: no disease-category hint and no
                glossary.
              </p>
              <p className="text-xs italic text-gray-300">
                For learning and fun, not medical advice.
              </p>
            </div>
          }
          extraActions={
            <div className="flex flex-wrap gap-2 items-center">
              <LinkHardModeButton
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
            title="Symptoms Link Stats"
            showCloseButton
            onClose={() => setShowStatsModal(false)}
          >
            <StatsPanel stats={currentStats} buckets={LINK_BUCKETS} />
          </Modal>
        )}
      </main>
    );
  }

  const patientLabel =
    state.mode === "daily" ? `Patient #${dailyNumber}` : "Practice patient";
  const primaryMessage = state.won
    ? pickLinkWinMessage(state.stage, state.seed)
    : pickLinkLossMessage(state.disease.id, state.disease.name, state.seed);
  const followUpMessage = getLinkFollowUpMessage(
    state.won,
    state.options.hardMode
  );
  const highlightKey = state.won ? String(state.stage) : "X";

  return (
    <main className="min-h-[90vh] bg-page py-4 px-3 flex flex-col items-center">
      <Toast toast={toast} />

      <div className="text-white flex flex-col items-center gap-4 w-full max-w-xl">
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
            <span>Case Analysis</span>
            {state.options.hardMode && (
              <span className="bg-red-600 text-white px-2 py-0.5 rounded text-xs">
                💀 Hard
              </span>
            )}
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setShowGlossary(true)}
          >
            📖 Glossary
          </Button>
        </div>

        <PatientChart
          patientLabel={patientLabel}
          disease={state.disease}
          stage={state.stage}
          hardMode={state.options.hardMode}
          isGameOver={isGameOver}
          onOpenGlossary={() => setShowGlossary(true)}
        />

        {!isGameOver ? (
          <div className="w-full flex flex-col sm:flex-row items-center justify-center gap-3">
            <Autocomplete
              items={searchableItems}
              placeholder="Type a disease name (3+ letters)..."
              minChars={3}
              disabled={isGameOver}
              onSubmit={(picked, rawText) => {
                const evaluation = evaluateDiseaseSubmission(
                  state,
                  picked?.id ?? null,
                  rawText
                );
                if (evaluation.toast) {
                  showToast(evaluation.toast);
                }
                if (evaluation.status === "accepted") {
                  dispatch({
                    type: "GUESS",
                    diseaseId: evaluation.disease.id,
                    now: Date.now(),
                  });
                }
              }}
            />

            {state.stage < MAX_STAGE ? (
              <Button
                variant="secondary"
                onClick={() => dispatch({ type: "SKIP" })}
              >
                Skip ⏭️
              </Button>
            ) : (
              <GiveUpButton onClick={() => setShowGiveUpConfirm(true)} />
            )}
          </div>
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

        <WrongGuesses log={state.log} />
      </div>

      {showGiveUpConfirm && (
        <ConfirmDialog
          message="Quit this case? Your progress will be reset."
          tone="danger"
          onConfirm={() => {
            setShowGiveUpConfirm(false);
            stopCelebration();
            dispatch({ type: "RESET_TO_MENU" });
          }}
          onCancel={() => setShowGiveUpConfirm(false)}
        />
      )}

      {showGlossary && <Glossary onClose={() => setShowGlossary(false)} />}

      {isGameOver && state.modalOpen && (
        <GameOverModal
          won={state.won}
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
          <DiagnosisCard
            disease={state.disease}
            revealedStage={state.stage}
          />
          <p className="text-base sm:text-lg font-medium">{primaryMessage}</p>
          <p className="text-sm sm:text-base font-medium">{followUpMessage}</p>

          {state.mode === "daily" && (
            <>
              <StatsPanel
                stats={currentStats}
                buckets={LINK_BUCKETS}
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
                <NextDailyCountdown gameTitle="Symptoms Link" />
              </div>
            </>
          )}
        </GameOverModal>
      )}
    </main>
  );
}

