# Daily Challenge System & Re-enablement Guide

This document preserves the architecture of the **Daily Challenge** mode across BioGames and details the exact steps to bring it back in a future release.

---

## 1. Overview & Current Archived State

To give players unlimited free play without lockouts, the **Daily Challenge mode is temporarily archived in the UI**. All games are currently freely playable:
- Players can start and restart games without any daily lockout.
- Games reset cleanly whenever a player quits or navigates away.
- In `games/registry.ts`, `daily: false` is set across all games to hide streak badges on game cards.

**The underlying deterministic daily logic, schedules, and test suites are fully preserved** in the codebase and remain 100% active and tested.

---

## 2. Preserved Daily Architecture

Each game has a dedicated `logic/daily.ts` (and where applicable, `schedule.ts`) module implementing:
1. **Deterministic UTC Seeds**:
   - Uses `getDayKey(date)` (`YYYY-MM-DD` in UTC) and `dailySeed(gameSlug, dayKey)` in `lib/daily.ts`.
   - Generates the exact same challenge for all global players on any given day.
2. **Deterministic Schedules**:
   - `games/bio-wordle/logic/schedule.ts`: Cycles word lengths 4–7 deterministically.
   - `games/symptoms-link/logic/schedule.ts`: Cycles 120+ diseases without repetition over multi-month windows.
   - `games/animal-tictactoe/logic/daily.ts`: Generates solvable 3×3 trait grids from daily seeds.
   - `games/taxo-bingo/logic/daily.ts`: Generates reproducible daily 12-category bingo cards.
3. **Storage & Streaks**:
   - Persists state under `taxo_bingo_daily_v1`, `bio_wordle_daily_v1`, `symptoms_link_daily_v1`, and `animal_tictactoe_daily_v1`.
   - Records stats (games played, win rates, streak counts, guess distribution histograms) in `lib/stats.ts`.
4. **Share Grids & Countdowns**:
   - `buildShareText()` generates Wordle-style emoji grids.
   - `<NextDailyCountdown />` displays a live countdown to the next midnight UTC.

---

## 3. Step-by-Step Guide to Re-enable Daily Challenges

When ready to launch Daily Challenges in a future update:

### Step 3.1: Enable Daily Flag in Registry
In [`games/registry.ts`](file:///c:/Users/manue/Desktop/manum/repos/bio-games/games/registry.ts):
```ts
// Set daily: true for games featuring daily challenges
export const GAMES: readonly GameMeta[] = [
  { slug: "taxo-bingo", ..., daily: true },
  { slug: "bio-wordle", ..., daily: true },
  { slug: "symptoms-link", ..., daily: true },
  { slug: "animal-tictactoe", ..., daily: true },
  ...
];
```
This automatically restores the `StreakBadge` ("🔥 N day streak") on the home page cards via `components/home/GameCard.tsx`.

### Step 3.2: Reinstate Daily Start Handlers in Game Views
In each game view:
- **Taxo Bingo** ([`games/taxo-bingo/TaxoBingoGame.tsx`](file:///c:/Users/manue/Desktop/manum/repos/bio-games/games/taxo-bingo/TaxoBingoGame.tsx)):
  - Change `onStart` back to `state.dailyFinishedForToday ? handleStartPractice : handleStartDaily`.
  - Set `startLabel` to `state.dailyFinishedForToday ? "Practice Round" : "Start Daily"`.
  - Add back the Daily streak badge header in `description`.
- **Bio Wordle** ([`games/bio-wordle/BioWordleGame.tsx`](file:///c:/Users/manue/Desktop/manum/repos/bio-games/games/bio-wordle/BioWordleGame.tsx)):
  - Change `onStart` back to `state.dailyFinishedForToday ? handleStartPractice : handleStartDaily`.
- **Symptoms Link** ([`games/symptoms-link/SymptomsLinkGame.tsx`](file:///c:/Users/manue/Desktop/manum/repos/bio-games/games/symptoms-link/SymptomsLinkGame.tsx)):
  - Change `onStart` back to `state.dailyFinishedForToday ? handleStartPractice : handleStartDaily`.
- **Animal Tic-Tac-Toe** ([`games/animal-tictactoe/AnimalTicTacToeGame.tsx`](file:///c:/Users/manue/Desktop/manum/repos/bio-games/games/animal-tictactoe/AnimalTicTacToeGame.tsx)):
  - Restore the `📅 Daily #{todayNum}` button to launch `handleStartDaily()`.

### Step 3.3: Re-enable Daily Post-Game Panels
In each game's `GameOverModal`, restore the daily-specific stats and countdown block:
```tsx
{state.options.daily && (
  <>
    <ShareButton getText={() => shareText} />
    <StatsPanel stats={stats} buckets={BUCKETS} />
    <NextDailyCountdown gameTitle={META.title} />
  </>
)}
```

