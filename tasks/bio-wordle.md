# Bio Wordle

> **Audience:** coding agent. **Status:** not started (the old stub was deleted in the structural update).
> **Read first:** `docs/ARCHITECTURE.md`, `CLAUDE.md`, `tasks/shared-game-features.md`.
> **Replaces:** `tasks/wordle.txt`.
> **Shared pieces needed:** daily pattern (§3), `StatsPanel`, `StreakBadge`, `ShareButton`, `NextDailyCountdown`, `Toast`. Build any that are missing per `shared-game-features.md`.

---

## 1. Concept

NYT Wordle with a biology twist:
- The answer is always a **biology word**; guesses can be any valid English word (otherwise the game is too hard).
- The word length varies per game, **4 to 7 letters**; the tile row shows how many.
- 6 guesses. 🟩 right letter, right spot · 🟨 in the word, wrong spot · ⬛ not in the word (count-aware, see Step 4).
- Daily puzzle (same for everyone that local day) + unlimited practice.

**Player-facing description (menu):**
> Guess the hidden **biology** word in 6 tries. It's 4 to 7 letters long, and the length changes every day!
> After each guess the tiles change color: 🟩 right letter, right spot · 🟨 in the word but in the wrong spot · ⬛ not in the word.
> Any real English word counts as a guess, but the answer is always biology.
> **Hard Mode**: any revealed hints must be used in your next guesses, and no topic hint.

Registry: slug `bio-wordle`, title "Bio Wordle", brand `["BIO", "WORDLE"]`, `daily: true`.

**Brainstormed additions** (in the spirit of the original notes): a definition card after every game (you learn the word), a 💡 topic hint for when you're stuck, NYT-style Hard Mode, share grid, stats + streaks.

---

## 2. Implementation steps

The original notes' numbering is kept for Steps 1–5.

### Step 1: Dataset (curate the answers)
The notes said this was done: `public/assets/data/bio_words.txt` has 1,106 words. It's **not usable as-is**: it has truncated tokens (`mitosi`, `meiosi`, `collag`, `glucos`, `insuli`, `amylas`, `bacter`, `reptil`, `dopami`, `toxopl`, …), non-biology words (`drive`, `mars`, `brunei`, `memory`, `energy`, `gable`, `grotto`, `klippe`, `turkey`, …), Latin genus names (`apium`, `thuja`, `abies`, `morus`, `fucus`, `cervus`, …), acronyms (`aids`) and CRLF endings. Length split today: 4→148, 5→342, 6→481, 7→135.

1. Move the raw list out of `public/` to `scripts/data/bio_words_raw.txt` (the app never serves it).
2. Build the curated answer list `games/bio-wordle/data/answers.json`:
   ```ts
   type Topic = "cell" | "molecule" | "genetics" | "anatomy" | "organism" | "plant" | "disease" | "ecology";
   interface Answer { word: string; topic: Topic; definition: string }  // word: ^[a-z]{4,7}$
   ```
   Topic labels + emoji live in `games/bio-wordle/config.ts`: cell 🧫 "Cell biology", molecule 🧪 "Molecules", genetics 🧬 "Genetics", anatomy 🫀 "Anatomy", organism 🐾 "Organisms", plant 🌿 "Plants", disease 🦠 "Disease", ecology 🌍 "Ecology & evolution".
3. Curation rules for answers:
   - A real word a high-school or early-university biology student would recognize (`xylem`, `phloem`, `enzyme`, `mitosis`, `retina`, `larva`, `codon`, `virus`, `spleen`, `cilia`).
   - No truncations, proper nouns, acronyms, Latin genus names (allowed as *guesses* if they're in the dictionary, never as answers), or obscure jargon.
   - Prefer singular base forms (`larva` over `larvae`), unless the plural is the standard term (`cilia`, `villi`).
   - Plain-language `definition`, ≤ 120 characters, factually correct. Example: `phloem` → "Plant tissue that carries sugars from the leaves to the rest of the plant."
   - **Target ≥ 75 words per length (4, 5, 6, 7), ideally ~100 each.** Start from the raw list; add well-known biology words where a length bucket is thin (7-letter will be).
4. Write `scripts/data/bio_words_rejected.txt` (`word<TAB>reason`) so the user can rescue words they liked.

### Step 2: Game UI
`games/bio-wordle/components/`:
- `Board`: 6 rows × N tiles. Tile states: `empty | typed | correct | present | absent`. The typed letter pops slightly; on submit the row reveals left to right (flip, ~250 ms stagger; `prefers-reduced-motion` → no animation).
- `Keyboard`: QWERTY rows `qwertyuiop` / `asdfghjkl` / `ENTER zxcvbnm ⌫` (Enter left, Backspace right, like NYT). Each key is colored with its best known state (🟩 > 🟨 > ⬛). Click = type.
- Physical keyboard via `useWindowKeydown`: a–z type, Backspace deletes, Enter submits. Ignore events with Ctrl/Meta/Alt, and ignore input once the game is over.
- Header above the board: "Daily #N · 6 letters" (or "Practice · 6 letters").
- Invalid submissions shake the current row and show a toast: **"Not enough letters"** or **"Not in word list"** (Step 3), or the hard-mode message (Step 7). Invalid submissions don't consume a guess.
- Mobile: tiles scale to fit 7 columns on a 360px-wide screen; the keyboard sits at the bottom with no horizontal scroll.

### Step 3: Only valid words
**Answer to the original question ("What library does Wordle use?"):** none. NYT Wordle ships two hard-coded lists in its JavaScript: ~2.3k curated answers and ~10–13k allowed guesses. We do the same thing per length:

- Source: the **ENABLE** word list (`enable1.txt`, public domain, widely mirrored on GitHub). If you can't download it, **stop and ask the user**. Don't silently pick a list with unknown licensing.
- `scripts/build_wordle_lists.py`: filter `^[a-z]{4,7}$`, **union with all answers**, sort, and write `public/assets/data/wordle/allowed-4.txt` … `allowed-7.txt` (newline-separated). Record the source URL + license in `scripts/README.md`. Report the word counts per length (expect roughly 50k total).
- At game start, fetch only the file for today's length into a `Set`. Show a spinner while loading. **If the fetch fails, accept any `^[a-z]{N}$` guess** (with `console.warn`) so the game stays playable.
- Pure `isValidGuess(guess, allowedSet)`.

### Step 4: Hint colors (count-aware)
Pure `scoreGuess(guess: string, answer: string): ("correct" | "present" | "absent")[]`, the standard two-pass algorithm:
1. First pass: mark exact position matches as `correct` and count the **remaining** (unmatched) answer letters.
2. Second pass, left to right: for each non-correct guess letter, if the remaining count for it is > 0 → `present` and decrement; else → `absent`.

Keyboard state: `mergeKeyStates(prev, guess, result)`, where a key's state only upgrades (absent < present < correct).

**Required test cases: the creator's own examples, answer `allele`** (`X` = a letter not in the word):

| Guess | Expected |
|---|---|
| `xeexxx` | both E's `present` (allele has 2 E's): `[a, p, p, a, a, a]` |
| `eeexxx` | first two E's `present`, third `absent`: `[p, p, a, a, a, a]` |
| `xlxlxl` | pos 2 L `correct`, the other two L's `present` (allele has 3 L's): `[a, c, a, p, a, p]` |
| `eexexx` | pos 4 E `correct`; one remaining E → first E `present`, second `absent`: `[p, a, a, c, a, a]` |

(`c` = correct, `p` = present, `a` = absent.) Add the classic edge cases too: all correct; no overlap; repeated letter in the guess where the answer has one copy and that copy is green elsewhere (`absent`).

### Step 5: Win / lose pop-ups
Reuse the shared `GameOverModal` (that's the "reuse from my other game" the notes asked for). Content:
- Title "You Won! 🎉" / "You Lost 🥀".
- **Word card:** the answer in tiles, topic emoji + label, definition. This is the learning moment, and it's shown win or lose.
- A message from the pools below, then the hard-mode line pattern from Taxo ("And you even beat it on Hard Mode!…" / "Don't give up! Hard mode is tough…"; adapt them, keep the voice).
- Daily: `StatsPanel` (buckets `1`–`6` + `X`, highlight today), `ShareButton`, `NextDailyCountdown`, "Practice round", "Go back to home".

Draft message pools (put them in `logic/messages.ts`, list them in the report for review):
- Win in 1: "First try?? Either you're a genius or you read the source code 👀"
- Win in 2: "Two guesses. Darwin would've taken notes."
- Win in 3: "Textbook. Literally."
- Win in 4: "Right in the middle of the bell curve, very natural selection of you."
- Win in 5: "Sweating a bit there, huh?"
- Win in 6: "Clutch. Survival of the fittest, but barely."
- Loss: "It was {WORD}. Vayan a estudiar." · "{WORD}. Not even a mitochondrion could power you through that one." · "The word was {WORD}. Not great, not terrible… ok it was terrible."

### Step 6: Daily challenge, stats, streak, share
- Follow `shared-game-features.md` §3. State:
  ```ts
  interface WordleDailyState extends DailyStateBase<{ hardMode: boolean }> {
    answer: string;
    guesses: string[];   // submitted, valid guesses only
    hintUsed: boolean;
  }
  ```
- **Answer schedule** (pure, `logic/schedule.ts`): honors the "random length 4–7 each game" idea with even lengths and no repeats.
  ```
  rng = createRng("bio-wordle:schedule:v1")
  buckets[L] = shuffle(answers of length L, rng) for L in 4..7
  schedule = []
  for round r = 0, 1, 2, …: for L in shuffle([4,5,6,7], rng): if buckets[L][r] exists → schedule.push(it)
  answerFor(dayKey) = schedule[dayNumber(dayKey) mod schedule.length]
  ```
  Deterministic, no repeats within a cycle, and lengths rotate evenly. Changing `answers.json` reshuffles future days; that's acceptable, and the saved state stores `answer`, so today's game never changes mid-day.
- Practice: random length 4–7 (uniform), then a random answer of that length.
- Stats buckets: `"1"`…`"6"`, `"X"` (loss). Win = solved.
- Share text:
  ```
  Bio Wordle #42 4/6 · 6 letters 💀 Hard 💡
  ⬛🟨⬛⬛⬛⬛
  🟨⬛🟩⬛⬛🟨
  🟩🟩🟩⬛🟩🟩
  🟩🟩🟩🟩🟩🟩
  https://bio-games.vercel.app/bio-wordle
  ```
  `X/6` on a loss; `💡` only if the hint was used; `💀 Hard` only in hard mode.

### Step 7: Hard Mode (NYT rules)
- Chosen on the menu (`Hard Mode ✔/✖` toggle, same style as Taxo), locked for the game.
- Pure `checkHardMode(guess, previousGuesses, previousResults): string | null` (null = OK, else an error message):
  - Every `correct` letter must stay in its position → "4th letter must be E".
  - Every `present`/`correct` letter must appear, count-aware: required count of a letter = max over previous guesses of (`correct` + `present` tiles of that letter in that guess) → "Guess must contain L" (or "…contain 2 L's").
- The topic hint is disabled in hard mode, with a tooltip in the Cheat-Sheet voice: *"Hints? In Hard Mode? Bold of you to assume."*

### Step 8: 💡 Topic hint (normal mode)
- After the 3rd wrong guess, a "💡 Hint" button appears. Clicking it reveals the topic chip ("🌿 Plants") above the board for the rest of the game. `hintUsed = true` (shown in share text).

---

## 3. Files

```
app/bio-wordle/page.tsx
games/bio-wordle/
  BioWordleGame.tsx           # "use client" root (menu → playing → over)
  config.ts                   # MAX_GUESSES=6, LENGTHS=[4,5,6,7], topics, HINT_AFTER=3
  data/answers.json, data/answers.ts (typed loader + byLength)
  logic/score.ts, validate.ts, hardMode.ts, schedule.ts, daily.ts, share.ts, messages.ts, reducer.ts  (+ tests)
  components/Board.tsx, Tile.tsx, Keyboard.tsx, WordCard.tsx, WordleMenuOptions.tsx
public/assets/data/wordle/allowed-{4,5,6,7}.txt     # generated
scripts/build_wordle_lists.py, scripts/data/bio_words_raw.txt, scripts/data/bio_words_rejected.txt
public/assets/img/covers/{card,menu}/bio-wordle.svg  # placeholder art if none provided
```

---

## 4. Tests & acceptance

Unit tests: `scoreGuess` (the table above verbatim + edge cases), `mergeKeyStates`, `checkHardMode` (green position, yellow inclusion, count-aware), `schedule` (deterministic, no repeat within a cycle, every length appears in each round), reducer (6 wrong → loss, invalid guesses don't consume, input ignored after game over), daily restore (resume, finished, abandoned), `buildShareText`.

Data tests: every answer matches `^[a-z]{4,7}$`, unique, has a topic + definition ≤ 120 chars, and appears in its `allowed-N.txt`; each length has ≥ 75 answers.

Manual scenarios: type with mouse and keyboard; "Not enough letters"; "Not in word list"; duplicate-letter coloring on screen matches the table; win on guess 3 → modal, stats, share copied; lose → word card; reload mid-game resumes; hard-mode violation message; hint after guess 3; 7-letter board fits at 360px width.

## 5. [USER DECISION] items to flag
- Review `answers.json` (words + definitions) and `bio_words_rejected.txt`.
- The new message lines and the hard-mode hint tooltip.
- Word-list source confirmation (ENABLE).
