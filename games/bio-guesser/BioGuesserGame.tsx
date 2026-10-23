"use client";

import { useCallback, useState } from "react";
import GameMenu from "@/components/game/GameMenu";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import Spinner from "@/components/ui/Spinner";
import { getGame } from "@/games/registry";
import { useHasMounted } from "@/lib/hooks/useHasMounted";
import { randomSeed } from "@/lib/rng";
import { readJSON, storageKey, writeJSON } from "@/lib/storage";
import { fetchNext, sendFeedback } from "./api/client";
import type { Answer, AnsweredQuestion, NextResponse } from "./api/types";
import { AnswerButtons } from "./components/AnswerButtons";
import { GiveUpForm } from "./components/GiveUpForm";
import { GuessCard } from "./components/GuessCard";
import { QuestionCard } from "./components/QuestionCard";
import { ResultCard } from "./components/ResultCard";
import { STORAGE_RECORD_KEY } from "./config";
import {
  pickLinnaeusWinLine,
  pickPlayerWinLine,
  pickThinkingLine,
  pickWrongGuessLine,
} from "./logic/messages";

const GUESSER_META = getGame("bio-guesser");

export interface GuesserRecord {
  version: 1;
  linnaeus: number;
  player: number;
}

function loadGuesserRecord(): GuesserRecord {
  return readJSON<GuesserRecord>(
    storageKey("bio-guesser", STORAGE_RECORD_KEY),
    { version: 1, linnaeus: 0, player: 0 },
  );
}

function saveGuesserRecord(record: GuesserRecord): void {
  writeJSON(storageKey("bio-guesser", STORAGE_RECORD_KEY), record);
}

type Phase = "intro" | "asking" | "guessing" | "give_up" | "result";

export default function BioGuesserGame() {
  const hasMounted = useHasMounted();
  if (!hasMounted) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Spinner />
      </div>
    );
  }
  return <BioGuesserClient />;
}

function BioGuesserClient() {
  const [phase, setPhase] = useState<Phase>("intro");
  const [record, setRecord] = useState<GuesserRecord>(loadGuesserRecord);
  const [answers, setAnswers] = useState<AnsweredQuestion[]>([]);
  const [rejectedGuesses, setRejectedGuesses] = useState<string[]>([]);

  const [currentQuestion, setCurrentQuestion] = useState<{
    id: string;
    text: string;
  } | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const [thoughtLine, setThoughtLine] = useState<string>("Hmm…");

  const [currentGuess, setCurrentGuess] = useState<{
    id: string;
    name: string;
    commonName?: string | null;
    image: string | null;
    confidence: number;
  } | null>(null);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [confirmRestartOpen, setConfirmRestartOpen] = useState(false);

  // Result state
  const [resultWinner, setResultWinner] = useState<"linnaeus" | "player">(
    "linnaeus",
  );
  const [resultHeadline, setResultHeadline] = useState("");
  const [resultOrgId, setResultOrgId] = useState<string | null>(null);
  const [resultOrgName, setResultOrgName] = useState<string | null>(null);

  const applyNextResponse = useCallback((resp: NextResponse) => {
    if (resp.kind === "question") {
      setCurrentQuestion(resp.question);
      setProgress(resp.progress);
      setThoughtLine(pickThinkingLine(randomSeed()));
      setCurrentGuess(null);
      setPhase("asking");
    } else if (resp.kind === "guess") {
      setCurrentGuess({
        id: resp.guess.id,
        name: resp.guess.name,
        commonName: resp.guess.commonName,
        image: resp.guess.image,
        confidence: resp.confidence,
      });
      setPhase("guessing");
    } else {
      setPhase("give_up");
    }
  }, []);

  const handleStartGame = async () => {
    setAnswers([]);
    setRejectedGuesses([]);
    setErrorMsg(null);
    setLoading(true);

    const res = await fetchNext({ answers: [], rejectedGuesses: [] });
    setLoading(false);

    if (!res.ok) {
      setErrorMsg("Linnaeus fell asleep 😴 Could not contact engine.");
      return;
    }

    applyNextResponse(res.data);
  };

  const handleAnswer = async (answer: Answer) => {
    if (!currentQuestion) return;
    const nextAnswers = [
      ...answers,
      { questionId: currentQuestion.id, answer },
    ];
    setAnswers(nextAnswers);
    setErrorMsg(null);
    setLoading(true);

    const res = await fetchNext({
      answers: nextAnswers,
      rejectedGuesses,
    });
    setLoading(false);

    if (!res.ok) {
      setErrorMsg("Linnaeus fell asleep 😴 Check connection or try again.");
      return;
    }

    applyNextResponse(res.data);
  };

  const handleUndo = async () => {
    if (answers.length === 0) return;
    const poppedAnswers = answers.slice(0, -1);
    setAnswers(poppedAnswers);
    setErrorMsg(null);
    setLoading(true);

    const res = await fetchNext({
      answers: poppedAnswers,
      rejectedGuesses,
    });
    setLoading(false);

    if (!res.ok) {
      setErrorMsg("Linnaeus fell asleep 😴 Check connection or try again.");
      return;
    }

    applyNextResponse(res.data);
  };

  const handleConfirmGuess = () => {
    if (!currentGuess) return;
    const nextRecord: GuesserRecord = {
      ...record,
      linnaeus: record.linnaeus + 1,
    };
    saveGuesserRecord(nextRecord);
    setRecord(nextRecord);

    sendFeedback({
      answers,
      rejectedGuesses,
      outcome: "guessed",
      finalGuessId: currentGuess.id,
      actual: { id: currentGuess.id },
    });

    setResultWinner("linnaeus");
    setResultHeadline(pickLinnaeusWinLine(randomSeed()));
    setResultOrgId(currentGuess.id);
    setResultOrgName(currentGuess.name);
    setPhase("result");
  };

  const handleRejectGuess = async () => {
    if (!currentGuess) return;
    const nextRejected = [...rejectedGuesses, currentGuess.id];
    setRejectedGuesses(nextRejected);
    setErrorMsg(null);
    setLoading(true);
    setThoughtLine(pickWrongGuessLine(randomSeed()));

    const res = await fetchNext({
      answers,
      rejectedGuesses: nextRejected,
    });
    setLoading(false);

    if (!res.ok) {
      setErrorMsg("Linnaeus fell asleep 😴 Check connection or try again.");
      return;
    }

    applyNextResponse(res.data);
  };

  const handleGiveUpSubmit = (actual: { id: string } | { name: string }) => {
    const nextRecord: GuesserRecord = {
      ...record,
      player: record.player + 1,
    };
    saveGuesserRecord(nextRecord);
    setRecord(nextRecord);

    sendFeedback({
      answers,
      rejectedGuesses,
      outcome: "not_guessed",
      finalGuessId: null,
      actual,
    });

    setResultWinner("player");
    setResultHeadline(pickPlayerWinLine(randomSeed()));
    if ("id" in actual) {
      setResultOrgId(actual.id);
      setResultOrgName(null);
    } else {
      setResultOrgId(null);
      setResultOrgName(actual.name);
    }
    setPhase("result");
  };

  const handleGiveUpSkip = () => {
    const nextRecord: GuesserRecord = {
      ...record,
      player: record.player + 1,
    };
    saveGuesserRecord(nextRecord);
    setRecord(nextRecord);

    sendFeedback({
      answers,
      rejectedGuesses,
      outcome: "not_guessed",
      finalGuessId: null,
      actual: null,
    });

    setResultWinner("player");
    setResultHeadline(pickPlayerWinLine(randomSeed()));
    setResultOrgId(null);
    setResultOrgName(null);
    setPhase("result");
  };

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col items-center px-3 py-6 sm:px-6">
      {/* Intro Phase */}
      {phase === "intro" && (
        <div className="flex w-full flex-col items-center gap-5">
          <GameMenu
            brand={GUESSER_META.brand}
            coverSrc={GUESSER_META.cover!.menu}
            startLabel="Start Consulting Linnaeus"
            onStart={handleStartGame}
            description={
              <div className="space-y-3 text-sm sm:text-base">
                <p>
                  Think of a living organism: any animal, plant, fungus, protist
                  or bacterium. Keep it secret!
                </p>
                <p>
                  <strong>Linnaeus</strong>, the father of taxonomy, will ask
                  you questions and try to guess it. Answer honestly… he can
                  tell. (He can&apos;t. But please.)
                </p>
                <div className="mt-4 flex items-center justify-center gap-3 rounded-lg bg-slate-900/80 px-4 py-2 font-mono text-sm text-slate-200 border border-slate-700">
                  <span className="text-slate-400">Head-to-Head:</span>
                  <span className="font-bold text-amber-300">
                    Linnaeus {record.linnaeus}
                  </span>
                  <span className="text-slate-500">—</span>
                  <span className="font-bold text-emerald-300">
                    {record.player} You
                  </span>
                </div>
              </div>
            }
          />
        </div>
      )}

      {/* In-game Top Toolbar */}
      {phase !== "intro" && phase !== "result" && (
        <div className="mb-6 flex w-full max-w-xl items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => setPhase("intro")}
            className="rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-slate-700 transition"
          >
            ← Menu
          </button>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-slate-400">
              Linnaeus {record.linnaeus} – {record.player} You
            </span>
          </div>
          <button
            type="button"
            onClick={() => setConfirmRestartOpen(true)}
            className="rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-slate-700 transition"
          >
            🔄 Restart
          </button>
        </div>
      )}

      {/* Error / Offline Banner */}
      {errorMsg && (
        <div className="mb-4 flex w-full max-w-xl items-center justify-between rounded-xl border border-red-500/50 bg-red-950/80 p-3 text-xs text-red-200">
          <span>{errorMsg}</span>
          <button
            type="button"
            onClick={() => {
              setErrorMsg(null);
              if (phase === "asking") {
                fetchNext({ answers, rejectedGuesses }).then((res) => {
                  if (res.ok) applyNextResponse(res.data);
                  else setErrorMsg("Linnaeus fell asleep 😴");
                });
              }
            }}
            className="rounded bg-red-800 px-2.5 py-1 font-bold text-white hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      )}

      {/* Asking Phase */}
      {phase === "asking" && currentQuestion && (
        <div className="flex w-full flex-col items-center gap-6">
          <QuestionCard
            questionNumber={answers.length + 1}
            questionText={currentQuestion.text}
            progress={progress}
            thoughtLine={thoughtLine}
            loading={loading}
          />

          <AnswerButtons
            disabled={loading}
            canUndo={answers.length > 0}
            onAnswer={handleAnswer}
            onUndo={handleUndo}
          />
        </div>
      )}

      {/* Guessing Phase */}
      {phase === "guessing" && currentGuess && (
        <GuessCard
          guess={currentGuess}
          confidence={currentGuess.confidence}
          disabled={loading}
          onConfirm={handleConfirmGuess}
          onReject={handleRejectGuess}
        />
      )}

      {/* Give Up Phase */}
      {phase === "give_up" && (
        <GiveUpForm
          disabled={loading}
          onSubmit={handleGiveUpSubmit}
          onSkip={handleGiveUpSkip}
        />
      )}

      {/* Result Phase */}
      {phase === "result" && (
        <ResultCard
          winner={resultWinner}
          headline={resultHeadline}
          record={record}
          organismId={resultOrgId}
          organismName={resultOrgName}
          onPlayAgain={handleStartGame}
        />
      )}

      {/* Confirm Restart Dialog */}
      {confirmRestartOpen && (
        <ConfirmDialog
          title="Restart this game?"
          message="Your current secret organism and Linnaeus' questions will be reset."
          confirmLabel="Restart"
          onConfirm={() => {
            setConfirmRestartOpen(false);
            handleStartGame();
          }}
          onCancel={() => setConfirmRestartOpen(false)}
        />
      )}
    </div>
  );
}

