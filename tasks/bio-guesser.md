# Bio Guesser

> **Audience:** coding agent. **Status:** not started.
> **Read first:** `docs/ARCHITECTURE.md`, `CLAUDE.md`, `tasks/shared-game-features.md`.
> **Replaces:** `tasks/guesser.txt` (the description was cut off mid-sentence and the steps were empty, so this spec completes them).
> **Shared pieces needed:** `Autocomplete` + `lib/text.ts`, `Toast`. **Not** daily, no stats or streaks.

---

## 1. Concept

**Akinator for living organisms.** The player secretly thinks of an organism; the guesser asks yes/no-style questions until it's confident, then makes a guess. The player says whether it was right. The original notes describe it as *"not a competitive game, just a fun side game to try out"*.

**Scope split (from the original notes):** the creator will build the real **guessing engine in Python** later. This spec covers the **frontend**, the **Next.js API layer** ("the React backend"), a **mock engine in TypeScript** so the game works end-to-end today, and a written **API contract** the Python engine must implement. Switching to the real engine later is an env-var change.

**Persona (brainstormed): Linnaeus.** Carl Linnaeus, the father of taxonomy, is the guesser, which fits a taxonomy-driven engine. Slightly smug, very 18th-century-botanist.

**Player-facing description (menu):**
> Think of a living organism: any animal, plant, fungus, protist or bacterium. Keep it secret!
> **Linnaeus**, the father of taxonomy, will ask you questions and try to guess it. Answer honestly… he can tell. (He can't. But please.)

Registry: add `bio-guesser`, title "Bio Guesser", brand `["BIO", "GUESSER"]`, `daily: false`. Place it after Cell Classifier. Start as `coming-soon` and flip to `live` at the end.

---

## 2. API contract (stateless, so it's Vercel- and Python-friendly)

The client sends the **full answer history on every call**; the server keeps no session. That makes the Python engine a pure function `history → next step`, and nothing breaks across serverless instances.

```ts
// games/bio-guesser/api/types.ts  (shared by client, route handlers, mock engine)
export type Answer = "yes" | "no" | "probably" | "probably_not" | "dont_know";
export interface AnsweredQuestion { questionId: string; answer: Answer }

export interface NextRequest {
  answers: AnsweredQuestion[];     // ≤ 100, in order
  rejectedGuesses: string[];       // organism ids the player said "no" to, ≤ 20
}
export type NextResponse =
  | { kind: "question"; question: { id: string; text: string }; progress: number }  // progress 0..1
  | { kind: "guess"; guess: { id: string; name: string; image: string | null }; confidence: number } // 0..1
  | { kind: "give_up" };

export interface FeedbackRequest {
  answers: AnsweredQuestion[];
  rejectedGuesses: string[];
  outcome: "guessed" | "not_guessed";
  finalGuessId: string | null;
  actual: { id: string } | { name: string } | null;  // known organism id, or free text
}
```

Endpoints (Next.js Route Handlers):
- `POST /api/bio-guesser/next` → `NextResponse` (200) · invalid body → 400 `{ error: "bad_request" }` · engine failure → 502 `{ error: "engine_unavailable" }`.
- `POST /api/bio-guesser/feedback` → 204. The mock logs in development and otherwise does nothing; the Python engine will store it for learning.

Validation (hand-written, no new dependency): ids match `^[a-z0-9_]{1,64}$`; `answer` is in the enum; array limits as above; free-text `actual.name` ≤ 80 chars. Reject anything else with 400.

Engine selection (`games/bio-guesser/engine/index.ts`, server-only):
- If `process.env.BIO_GUESSER_ENGINE_URL` is set → proxy to `${URL}/next` and `${URL}/feedback` with the same JSON (`fetch` + `AbortSignal.timeout(8000)`); on network error, timeout or non-2xx → 502.
- Otherwise → the TypeScript mock engine (§3).
- Import `"server-only"` in engine files so they never end up in the client bundle.

Write **`docs/bio-guesser-engine-api.md`** for the creator's Python work: the types above as JSON examples, the stateless semantics, the meaning of each answer value with the mock's weights (§3) as a starting point, the expected latency (< 2 s), and how to test locally (run the Python service on `http://localhost:8000`, put `BIO_GUESSER_ENGINE_URL=http://localhost:8000` in `.env.local`, `npm run dev`). Also note that the deployed site needs the env var set in Vercel.

---

## 3. Mock engine (TypeScript, pure, tested)

The knowledge is the existing dataset: `ORGANISMS` (546, each with a taxonomy `path`) + `TAXONOMY` (50 taxa). The questions are taxon membership questions.

**Question bank** `games/bio-guesser/data/questions.ts`: one question per taxon: `{ id: "is_" + taxonId, taxonId, text }`. Write natural, kid-friendly texts with examples, for instance:
- bacteria: "Is it a bacterium?"
- animalia: "Is it an animal?" · plantae: "Is it a plant?" · fungi: "Is it a fungus, like a mushroom or mold?" · protista: "Is it a protist? (a mostly single-celled eukaryote like an amoeba, or a seaweed/alga)"
- chordata: "Does it have a backbone?" · arthropoda: "Does it have an exoskeleton and jointed legs?"
- arachnida: "Does it have eight legs?" · myriapoda: "Does it have MANY legs, like a centipede?"
- marsupialia: "Does it carry its babies in a pouch?" · angiospermae: "Does it have flowers?" · gymnospermae: "Does it make cones instead of flowers (like a pine)?"
- …one for every taxon in `TAXONOMY` (skip `eukaryota`, since it's the complement of bacteria in this dataset).

Note on the dataset: birds (`aves`) sit directly under Chordata, not under Reptilia. "Is it a reptile?" → a bird is "no". That's consistent with how players answer.

**Algorithm** (`engine/mock.ts`, `nextStep(req: NextRequest): NextResponse`, deterministic):
1. Every organism starts with weight 1. For each answer to question with taxon `t`, let `has = organism.path.includes(t)` and multiply its weight:
   | answer | has = true | has = false |
   |---|---|---|
   | yes | 1 | 0.02 |
   | no | 0.02 | 1 |
   | probably | 0.8 | 0.25 |
   | probably_not | 0.25 | 0.8 |
   | dont_know | 1 | 1 |
   Soft factors (never 0), so one wrong answer doesn't make the target impossible (Akinator-style robustness). Rejected guesses → weight 0.
2. Normalize the weights. For each **unasked** question, compute `p` = weight mass with `has = true`. Candidate questions have `0.05 < p < 0.95`. Ask the one with `p` closest to 0.5 (max information). Ties → lowest question id.
3. **Guess** when any of these holds: no candidate question remains, or the top organism's share ≥ `GUESS_THRESHOLD = 0.5`, or `answers.length ≥ MAX_QUESTIONS = 25`. Guess the top-weighted organism; break ties deterministically with `createRng(hashString(JSON.stringify(req)))`.
4. `rejectedGuesses.length ≥ MAX_GUESSES = 5` → `{ kind: "give_up" }`.
5. `progress` = `1 − H(weights) / H(uniform)` (normalized entropy), clamped 0..1. `confidence` = top share.

**Known limitation (say so in `docs/bio-guesser-engine-api.md`):** the dataset only goes down to order level, so the mock can narrow things to e.g. "a carnivoran" (16 organisms) but can't tell a tiger from a lion. It then guesses within that group. That's fine for a mock; the Python engine will add real traits.

---

## 4. Frontend

`games/bio-guesser/BioGuesserGame.tsx`, a phase machine: `intro → asking → guessing → result`.

- **Intro:** `GameMenu` with no options; shows the description and the local record "Linnaeus 12 – 5 You" (`storageKey("bio-guesser", "record")`, `{ version: 1, linnaeus: number, player: number }`). Start button.
- **Asking:** Linnaeus avatar (emoji 🧔📜 or a simple SVG portrait) with a speech bubble containing the question; "Question 7"; a progress bar labeled "Linnaeus' certainty". Five answer buttons: **Yes · No · Don't know · Probably · Probably not**; keyboard `1`–`5` (and `Y`/`N`). **↩ Undo** removes the last answer and refetches. **Restart** (with confirm).
- **Loading:** while a request is in flight, buttons disabled, bubble shows "Hmm… consulting my *Systema Naturae*…" with a `Spinner`. On a 502/network error: "Linnaeus fell asleep 😴" + Retry.
- **Guessing:** "I think it's…" + the organism image (large; images are the main recognizer because names are scientific) + name in italics + "(82% sure)". Buttons **"Yes! 🎉"** / **"Nope"**.
  - Yes → result "Linnaeus wins" → record +1 for Linnaeus → POST feedback `{ outcome: "guessed", finalGuessId }`.
  - Nope → add to `rejectedGuesses`, call `/next` again (it may ask more questions or guess again).
- **Give up (engine):** "You've stumped me! What was it?" → `Autocomplete` over `ORGANISMS` (label = name), which also accepts free text not in the list → submit → POST feedback `{ outcome: "not_guessed", actual }` → result "You win!" → record +1 for the player. A "Skip" link lets the player not say.
- **Result:** the line from the pools below, the final organism card (if known), the record, **Play again**, **Go back to home**.
- The player can also end early with 🏳️ ("I give up on you, Linnaeus") → counts as nothing, back to intro.

All API calls go through one client module `games/bio-guesser/api/client.ts` (`fetchNext`, `sendFeedback`). Feedback is fire-and-forget; failures are ignored silently.

**Linnaeus lines** (`logic/messages.ts`; pick deterministically per question/guess; list them in the report):
- Thinking: "Hmm…", "Interesting…", "Ah, a classic.", "Let me consult my notes…"
- After a wrong guess: "Impossible. Did that organism evolve in the last five minutes?", "Fine. FINE. Next question.", "A minor taxonomic hiccup."
- Linnaeus wins: "Of course. I literally invented binomial nomenclature.", "Classified. Next."
- Player wins: "You've stumped me. I'll add it to the next edition of *Systema Naturae*.", "Well played. Even I didn't see that one evolving."
- Accuracy: Linnaeus did publish *Systema Naturae* (1st edition 1735) and popularized binomial nomenclature. Keep the jokes consistent with that.

No Hard Mode: it's a non-competitive side game (an intentional exception to the usual pattern).

---

## 5. Implementation steps

1. **Types + validation**: `api/types.ts`, `api/validate.ts` (+ tests for accept/reject cases).
2. **Mock engine**: `data/questions.ts` (one per taxon, integrity test), `engine/mock.ts` (+ tests, §6).
3. **Route handlers**: `app/api/bio-guesser/next/route.ts`, `app/api/bio-guesser/feedback/route.ts`, `engine/index.ts` with env-based selection (+ tests calling the exported `POST` with a `Request`; proxy mode tested with a mocked `fetch`).
4. **Frontend phases**: intro → asking (with undo) → guessing → result, loading/error states, keyboard shortcuts.
5. **Give-up flow** with `Autocomplete` + feedback.
6. **Record**, copy, polish; registry entry flipped to `live`, cover art (placeholder SVG: a quill + magnifying glass, or Linnaeus' wig).
7. **Docs**: `docs/bio-guesser-engine-api.md`, a line in `docs/ARCHITECTURE.md` about API routes (the site is no longer purely static).

---

## 6. Tests & acceptance
- **Mock engine, exhaustive:** for **every** organism in `ORGANISMS`, simulate truthful answers (yes iff the taxon is in its path). Assert:
  - at the first guess, the target is among the top-weighted (tied) candidates, i.e. the engine narrowed to the target's leaf group (every leaf group has ≥ 7 organisms, so the mock can't do better)
  - each rejection leads to a guess of a *different* member of the same leaf group (or more questions), and `give_up` comes exactly after `MAX_GUESSES` rejections
  - the number of questions before the first guess is ≤ 12 for every organism (estimated worst case is ~10; if it fails, report the real maximum instead of loosening the algorithm silently).
- Robustness: one deliberately wrong answer for a random 10% of organisms → the target still ends up in the top 5 candidates.
- Determinism: same request → same response.
- Validation: a bad answer enum, an oversized array or an id with uppercase/spaces → 400.
- Manual: think of a tiger → questions narrow to "carnivoran" → guesses among the cats; undo works; "Nope" ×5 → give-up screen → autocomplete "panthera" → submit → result; `BIO_GUESSER_ENGINE_URL=http://localhost:9` (nothing listening) → "Linnaeus fell asleep" + Retry.

## 7. Files
```
app/bio-guesser/page.tsx
app/api/bio-guesser/next/route.ts
app/api/bio-guesser/feedback/route.ts
games/bio-guesser/
  BioGuesserGame.tsx
  config.ts                      # GUESS_THRESHOLD, MAX_QUESTIONS, MAX_GUESSES, timeouts
  api/types.ts, api/validate.ts, api/client.ts
  engine/index.ts, engine/mock.ts            (server-only)
  data/questions.ts
  logic/messages.ts
  components/Linnaeus.tsx, QuestionCard.tsx, AnswerButtons.tsx, GuessCard.tsx, GiveUpForm.tsx, ResultCard.tsx
docs/bio-guesser-engine-api.md
public/assets/img/covers/{card,menu}/bio-guesser.svg
```

## 8. [USER DECISION] items to flag
- The Linnaeus persona and his lines.
- Whether the feedback endpoint should actually persist data before the Python engine exists (default: no, log only in dev).
- Common names: the dataset only has scientific names. If the Animal Tic-Tac-Toe spec has already added `scientificName ↔ common name` data, show the common name on guess cards. Otherwise list it as a follow-up.
