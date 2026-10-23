# Taxo Bingo: Phase 2 (Daily Challenge, Stats, Streaks)

> **Audience:** coding agent. **Status:** game is live; this spec adds the daily-challenge layer.
> **Read first:** `docs/ARCHITECTURE.md`, `CLAUDE.md`, `tasks/shared-game-features.md`.
> **Replaces:** `tasks/taxo2.txt` (original notes, Steps 6–12).
> **Recommended first game spec to run**, since it builds the shared daily/stats/share UI the other games reuse.

---

## 1. Where things stand

The original notes had Steps 6–12. After the structural update:

| Original step | Status |
|---|---|
| 6 Game timer | **Done.** Options are No Timer / 120s / 180s (default 180s). The notes said 90/120 with 120 default; the creator later changed it. Keep the current values. |
| 7 Hard Mode | **Done**, and extended: names shown in Standard Galactic Alphabet, Cheat Sheet disabled, timer locked to 120s. |
| 8 Give up | **Done** (the structural update fixed it so it shows the "You Lost" screen). |
| 9 Game-over messages | **Done**, but the shipped texts differ from the notes. See Step 16 below (message pools keep both). |
| 10 Progress saved per day | **To do** |
| 11 Win/loss stats + histogram | **To do** |
| 12 Winning streaks + 🔥 on home | **To do** |

Brainstormed additions in the same spirit (Steps 13–16): practice mode, share + next-puzzle countdown, post-game reveal + mistake counter, message pools.

---

## 2. Game recap (unchanged rules)

12-cell grid of taxonomic categories (1 domain + 1 of Animalia/Plantae/Chordata/Arthropoda + Angiospermae + 9 random). Organisms appear one at a time; click a cell whose category contains the organism, or Skip (Space). Fill all 12 to win. Timer optional; Hard Mode hides the names (SGA glyphs) and the Cheat Sheet, and locks 120s.

Data: `data/organisms.ts` + `data/taxonomy.ts`. Game logic: `games/taxo-bingo/logic/` (`grid.ts` with `generateGrid(rng)`, `deck.ts`, reducer, `messages.ts`).

---

## 3. Implementation steps

### Step 10: Daily challenge with saved progress
Follow `shared-game-features.md` §3 exactly. Taxo specifics:

- Registry: `daily: true`.
- Today's grid = `generateGrid(createRng(dailySeed("taxo-bingo", dayKey)))`. Store the resulting `gridIds` in the state anyway. If the dataset or catalog changes mid-day and a stored id becomes unknown, regenerate and reset that day's progress (log a warning).
- **The organism deck is not seeded**, because skipping is free and unlimited, so a seeded order adds nothing. Persist only what matters.
- State (`storageKey("taxo-bingo", "daily")`):
  ```ts
  interface TaxoDailyState extends DailyStateBase<{ timer: TimerOption; hardMode: boolean }> {
    gridIds: string[];                       // 12 taxon ids in display order
    placements: Record<string, string>;      // taxonId → organismId
    mistakes: number;                        // wrong-cell clicks (Step 15)
    skips: number;
  }
  ```
- Menu: shows "Daily #N" and the date. Timer + Hard Mode choices work as today and are locked once started. While today's daily is in progress, opening `/taxo-bingo` goes straight to the board with the timer still running from the original deadline (closing the tab doesn't pause it, which is the original requirement).
- When today's game is finished, opening the page shows the final board + game-over modal.
- An abandoned game from a previous day becomes a loss with its filled count (shared rule, **[USER DECISION]** flag).
- On a page reload mid-game the deck reshuffles. That's fine.

### Step 11: Stats + histogram
- Buckets `"0"` … `"12"`; a win is exactly bucket `"12"`. Recording follows the shared pattern (`applyResult`, once per daily).
- The game-over modal for a daily shows the existing title + message, then `StatsPanel` (shared §4.1) with buckets 0–12 (labels "0"…"12"), highlighting today's count. The original note asked for a bar graph with x = cells filled (0–12) and y = number of games. Vertical bars are fine on desktop; horizontal rows are acceptable on mobile.
- A "📊 Stats" button on the menu opens the same panel in a `Modal`.

### Step 12: Winning streaks + 🔥 on the home page
- The streak rule is already in `lib/stats.ts`: win +1, loss → 0, not playing → unchanged.
- Build `StreakBadge` (shared §4.2). It shows a 🔥 with the number at the top corner of the Taxo Bingo card on the home page **only when the streak is ≥ 3**.
- Also show the current streak in the stats panel and, if ≥ 3, a small 🔥N next to "Daily #N" on the menu.

### Step 13: Practice mode
- After the daily is finished, the game-over modal gets a **"Practice round"** button; the menu also offers "Practice" if the daily is done.
- Practice = today's rules with `randomSeed()`, any timer/hard-mode choice, never saved, never counted. Clearly labeled "Practice" (no number).
- This also covers "play again", which isn't possible today without navigating away.

### Step 14: Share + next-puzzle countdown
- `ShareButton` (shared §4.3) in the daily game-over modal. Text example:
  ```
  Taxo Bingo #42 🧬 10/12 💀 Hard
  ⏱️ 37s left · ❌ 2 wrong clicks
  🟩🟩⬛🟩
  🟩🟩🟩🟩
  🟩⬛🟩🟩
  https://bio-games.vercel.app/taxo-bingo
  ```
  The grid layout matches the 4-column desktop grid (3 rows of 4). Filled = 🟩, empty = ⬛. Omit the timer line when there was no timer; show "gave up 🏳️" or "time's up ⏰" when relevant. No category names (spoilers).
- `NextDailyCountdown` (shared §4.4) in the daily game-over modal.

### Step 15: Post-game reveal + mistake counter
- **Reveal:** after a daily or practice game ends, every **unfilled** cell shows a faded "e.g. *Lumbricus terrestris*" with that organism's image at low opacity. Pick the example deterministically (`pick(organismsInTaxon(id), createRng(seed + id))`) so a reload shows the same one. This is the learning moment: "oh, an earthworm was an annelid". In hard mode the example names also render in SGA. The reveal appears only after the game ends.
- **Mistakes:** count wrong-cell clicks (`mistakes`) and skips. Show "❌ N wrong clicks · ⏭️ N skips" in the game-over modal. Win with 0 mistakes adds a bonus line: *"Zero wrong clicks. Linnaeus is shaking."* (keep it, or write a better one in the same voice).

### Step 16: Message pools (restore the original lines without losing the new ones)
The notes' Step 9 messages and the shipped messages differ. Keep **both** as a pool per bracket, and pick one deterministically per game (`pick(pool, createRng(seed))`, so a reload shows the same line). Exact strings (`{cat}` = the single unfilled category label, `{n}` = filled count):

| Filled | Shipped (keep verbatim) | From the original notes (add verbatim) |
|---|---|---|
| 11 | `ikr, that one "{cat}" you probably skimmed through or just didn't wanna show up` | `AAA ikr, that one {cat} you probably skimmed through or just didn't wanna show up` |
| 9–10 | `You came quite close, even I couldn't do all 12 cells at first, and I made this game by hand` | `You came quite close, even I couldn't do all 12 cells at first, and I literally made this game by hand` |
| 6–8 | `{n} cells... not great, not terrible` | `{n} Roentgen, not great, not terrible` |
| 3–5 | `{n} out of 12, tough luck I guess, im sure it's just a warm up gamr tho` | `Warm Up game fr, I'm sure you'll do better next time` |
| 1–2 | `{n}/12, I guess it was a pretty hard game, maybe check out the Cheat Sheet` | `vayan a estudiar` |
| 0 | `0 out of 12, vayan a estudiar` | `dont even blame the RNG, just put the fries in the bag lil bro` |

- In **hard mode**, exclude lines that recommend the Cheat Sheet (it's disabled there).
- The 11 and 9–10 pairs are near-duplicates. Keep both anyway; the user can prune.
- Add 1–2 extra lines per bracket in the same voice **only if** you're confident they fit, and list them for review.

---

## 4. UI notes

- The game-over modal for a daily, top to bottom: title (🎉/🥀) → message (+ hard-mode line) → mistakes line → `StatsPanel` → `ShareButton` + `NextDailyCountdown` → buttons (`Practice round`, `Go back to home`). ✖ still closes it to inspect the board (with the reveal). Add a small "Show results" button under the grid to reopen it.
- The modal will grow. Make it scroll internally (`max-h-[85vh] overflow-y-auto`) and keep it mobile-friendly.
- Keep all existing visuals; the new elements use the existing tokens and `Button` variants.

---

## 5. Logic & tests

Pure modules (in `games/taxo-bingo/logic/`) with tests:
- `daily.ts`: `createDailyState(dayKey, options, now)`, `restoreDailyState(saved, todayKey, now)` → `{ state, mustRecord: boolean }` (handles same-day resume, finished, timeout-while-away, abandoned previous day, invalid/unknown version).
- `share.ts`: `buildShareText(state, { dayNumber, url })`, tested with the example in Step 14.
- `reveal.ts`: `revealExamples(gridIds, placements, seed)`, deterministic.
- `messages.ts`: pools + `pickLossMessage(filled, unfilledLabel, hardMode, seed)`. Assert every original string appears verbatim.

Scenarios to test (unit tests on `restoreDailyState` + reducer, plus manual if a browser tool is available):
1. Fresh day → menu shows "Daily #N"; start → state saved.
2. Reload mid-game → resumes directly on the board, same grid, same placements, timer continues from the original deadline.
3. Close the tab, wait past the deadline, reopen → loss (timeout) recorded once; board + modal shown.
4. Win → stats: played +1, wins +1, streak +1, histogram["12"] +1; reload → nothing double-counted.
5. Give up with 7 filled → loss, histogram["7"] +1, streak 0.
6. Next day → new grid and menu; yesterday's finished game untouched; an unfinished one from yesterday is finalized as a loss.
7. Streak 3 → 🔥3 badge on the home card; streak 2 → no badge.
8. Practice round → doesn't change stats or the saved daily.
9. Storage unavailable (simulate a throwing `localStorage`) → the game is still playable; no crash; no badge.
10. Same `dayKey` → same grid across two "devices" (two different empty storages).

---

## 6. Out of scope

- Accounts, server-side storage or leaderboards.
- Changing the grid composition, timer options, or hard-mode rules.
- New organisms or categories (data pipeline only).

## 7. [USER DECISION] items to flag in the report
- The abandoned-previous-day = loss rule.
- New copy lines (the "Linnaeus is shaking" line, any extra pool lines).
- Whether to keep both near-duplicate lines in the 11 and 9–10 pools.
