# Shared Game Features (read before implementing any game spec)

> **Audience:** a coding agent implementing one of the game specs in `tasks/`.
> **Precondition:** the structural update (`tasks/00-structural-update.md`) has been completed and merged. If `docs/ARCHITECTURE.md` does not exist, **stop** and tell the user that the structural update must run first.
> **Authority order when things disagree:** the actual code > `docs/ARCHITECTURE.md` > this file > the game spec.

This file defines things several games need, so they're built **once** and look and behave the same everywhere. Each game spec lists which of these it needs. **If a piece already exists, reuse or extend it. Never create a second version.** If it doesn't exist yet, build it exactly where and how it's described here, then add it to `docs/ARCHITECTURE.md`.

---

## 1. Platform pieces that already exist (from the structural update)

Look them up in `docs/ARCHITECTURE.md` for the real signatures:

- `lib/rng.ts`: `createRng`, `shuffle`, `pick`, `sample`, `randomSeed`, `hashString`
- `lib/daily.ts`: `getDayKey`, `dayNumber`, `msUntilNextDay`, `dailySeed`
- `lib/storage.ts`: `storageKey`, `readJSON`, `writeJSON`, `removeItem`, `isStorageAvailable`
- `lib/stats.ts`: `GameStats`, `emptyStats`, `applyResult`, `loadStats`, `saveStats`
- `lib/hooks/`: `useCountdown`, `useWindowKeydown`, `useHasMounted`
- `components/ui/`: `Button`, `Modal`, `ConfirmDialog`, `SegmentedControl`, `Spinner`, `BrandTitle`
- `components/game/`: `GameMenu`, `GameOverModal`, `GiveUpButton`, `TimerDisplay`
- `games/registry.ts`: `GAMES`, `getGame`, `gameMetadata`
- `data/organisms.ts` (546 organisms with images), `data/taxonomy.ts` (50 taxa with emoji + description)
- Game root pattern: `phase: "menu" | "playing" | "over"`, `useReducer`, pure logic in `games/<slug>/logic/`.

---

## 2. Tone & copy guide (the BioGames vibe)

The creator wrote every line by hand, and the jokes are the point. Match the voice:

- Casual, self-aware, a bit chaotic; internet humor and memes; occasional Spanish ("vayan a estudiar"). Emojis in titles (🎉, 🥀, 🔥).
- Existing references to stay consistent with: Chernobyl ("not great, not terrible"), "put the fries in the bag lil bro", Minecraft enchanting-table alphabet for Hard Mode, 💩 for flatworms, "I literally made this game by hand".
- Loss messages scale with how close the player got, and losing near the end gets a sympathetic or teasing line. Win messages are hype.
- Hard Mode always exists, is chosen **before** starting, is locked for that game, and gets its own win line ("…you are the greatest biological mind I've ever known") and loss line ("Don't give up! Hard mode is tough…").
- Every game has a **Cheat Sheet**-style learning aid in normal mode that Hard Mode disables, with a cheeky tooltip.
- Biology content must be **accurate**: jokes in the copy, never in the facts.
- Draft new copy in this voice. Put all game copy in `games/<slug>/logic/messages.ts` (or `copy.ts`) so the user can tweak it in one place. In your final report, list every new joke line so the user can review them.

---

## 3. Daily challenge pattern

Use this for any game marked `daily: true` in the registry.

**Persistence answer (this was an open question in the original Taxo notes):** use `localStorage` through `lib/storage.ts`. It's per browser profile on a device, needs no accounts or server, and it's what NYT Wordle did for years. It's lost in incognito or when site data is cleared, which is acceptable. IP-based tracking is unreliable (shared/changing IPs) and needs a server; "Google profile" persistence would mean real accounts. Browser sync doesn't sync `localStorage` across devices, so progress is per device.

**Rules:**
- A "day" is the player's **local** calendar day (`getDayKey()`); new puzzle at local 00:00.
- The daily puzzle is a pure function of `dailySeed(slug, dayKey)`. Everyone with the same local date gets the same puzzle.
- The puzzle number shown to players is `dayNumber(dayKey) + 1` ("Taxo Bingo #42"), with epoch `2026-01-01` unless ARCHITECTURE.md says otherwise.
- Options chosen in the menu (timer, hard mode) are **locked for the day** once the daily starts.
- Progress is saved on **every** state change: `writeJSON(storageKey(slug, "daily"), state)`.
- Timers are stored as an absolute `deadline` (epoch ms). Closing the tab does **not** pause them (anti-cheat, the user asked for this). On load, `now >= deadline` → finalize as a loss.
- On page load:
  - saved `dayKey === today` and `status === "playing"` → skip the menu and resume directly.
  - saved `dayKey === today` and finished → show the frozen board + game-over modal (with stats/share/countdown).
  - saved `dayKey !== today` and `status === "playing"` (abandoned) → finalize it as a **loss** for its own `dayKey` (score = progress at abandonment), record stats, then show today's menu. This prevents "start, peek, abandon" to protect a streak. **[USER DECISION]** flag this rule in your report.
  - nothing saved / an older finished game → today's menu.
- If the page stays open across midnight, the running game keeps its original `dayKey`. The next load picks up the new day.
- Every saved object has `version: 1`. On an unknown version or invalid shape, discard it (`readJSON` with a validator) and start fresh. Never crash.
- If storage is unavailable, the game is fully playable; just nothing persists.
- **Hydration:** anything that depends on `localStorage` renders only after `useHasMounted()` is true. Before that, show a `Spinner` so the server HTML never mismatches.

**Standard daily state shape** (extend it per game). Export it from `lib/daily.ts`; add it there if it isn't already:

```ts
interface DailyStateBase<TOptions> {
  version: 1;
  dayKey: string;
  options: TOptions;          // locked menu choices
  status: "playing" | "won" | "lost";
  startedAt: number;          // epoch ms
  deadline: number | null;    // epoch ms, null = no timer
  endedAt: number | null;
  endReason: "completed" | "timeout" | "gave-up" | "failed" | "abandoned" | null;
}
```

**Practice mode:** after the daily is finished (or from a "Practice" link on the menu), the player can play unlimited rounds with `randomSeed()`. Practice games are **never** saved and **never** touch stats or streaks. The UI labels them clearly ("Practice", no puzzle number).

**Recording results:** when a daily ends, call `applyResult(loadStats(slug), { dayKey, won, bucket })` once, then `saveStats`. `applyResult` is idempotent per `dayKey`, but don't rely on that: guard with the saved status too.

---

## 4. Shared components to build if missing

### 4.1 `components/game/StatsPanel.tsx`: stats summary + histogram
- Props: `{ stats: GameStats; buckets: { key: string; label: string }[]; highlightKey?: string; title?: string }`.
- Top row: 4 numbers, **Played · Win % · Current streak 🔥 · Max streak**.
- Histogram: one row or column per bucket, in the given order. Bar length ∝ count / max count, with a minimum visible width so 0s still show "0". Count label on each bar. Today's bucket highlighted (`highlightKey`) in `primary`.
- Pure divs + Tailwind. **No chart library.** Accessible: each bar has an `aria-label` ("10 cells: 3 games").
- Usually rendered inside `GameOverModal` for daily games, and from a small "📊 Stats" button on the game menu.

### 4.2 `components/home/StreakBadge.tsx` + home integration
- Client component. Reads `loadStats(slug)` after mount. Renders **only when `currentStreak >= 3`**: a small 🔥 with the number, absolutely positioned at the top-right corner of the game card (mirroring the NEW badge on the top-left).
- `GameCard` renders `<StreakBadge slug=… />` for games with `daily: true`. The home page stays a server component.

### 4.3 `lib/share.ts` + `components/game/ShareButton.tsx`
```ts
export async function shareText(text: string): Promise<"shared" | "copied" | "failed">;
// Uses navigator.share on touch devices when available, else navigator.clipboard.writeText,
// else a hidden-textarea + execCommand('copy') fallback.
```
- `ShareButton` props: `{ getText: () => string }`. It shows transient feedback ("Copied! 📋") for ~2 s.
- Share text format, first line: `<Game Title> #<n>` + result + `💀 Hard` if hard mode; then the game's emoji grid; last line: the site URL (`lib/site.ts`). **No spoilers** in share text.

### 4.4 `components/game/NextDailyCountdown.tsx`
- "Next <Game> in HH:MM:SS", ticking every second via `msUntilNextDay()`. At zero, show "New puzzle available, refresh! 🔄" (don't auto-reload mid-modal).

### 4.5 `components/ui/Autocomplete.tsx` + `lib/text.ts`
Needed by Symptoms Link, Animal Tic-Tac-Toe, Cell Classifier (hard mode) and Bio Guesser.

```ts
// lib/text.ts
export function normalizeText(s: string): string;
// lowercase, trim, strip diacritics (NFD + remove \p{M}), "-" and "_" → space, drop other punctuation, collapse spaces

export interface Searchable { id: string; label: string; aliases?: string[] }
export function prefixSearch<T extends Searchable>(items: readonly T[], query: string, opts?: { minChars?: number; limit?: number }): T[];
// Matches when ANY whitespace-separated word of the label or of an alias STARTS WITH the normalized query
// (multi-word queries: every query word must prefix-match some word, in order).
// minChars default 3 (the original Tic-Tac-Toe spec), limit default 8.
// Ranking: label starts with query > first word of label matches > alias match > other word match; ties alphabetical.
export function findExact<T extends Searchable>(items: readonly T[], input: string): T | null;
// normalized equality against label or any alias
```

`Autocomplete` component:
- Props: `{ items: Searchable[]; onSubmit: (item: Searchable | null, rawText: string) => void; placeholder?; minChars?; disabled?; autoFocus?; submitLabel? = "Submit" }`.
- Text input + **Submit** button to the right (the original Tic-Tac-Toe spec). Enter submits.
- Suggestion list below the input appears when `query.length >= minChars`. ↑/↓ move the highlight, Enter picks the highlighted suggestion (or submits the raw text if none is highlighted), Esc closes the list, mouse click picks. Clears the input after submit.
- `onSubmit` receives the matched item (`findExact` on raw text when nothing was picked) or `null` plus the raw text, so the game decides the message ("not in our list").
- ARIA combobox pattern (`role="combobox"`, `aria-expanded`, `aria-activedescendant`, `role="listbox"`/`option`).
- A prop to hide suggestions entirely, for hard modes that want typing without help: `suggestions?: boolean` (default true).

### 4.6 `components/ui/Toast.tsx` (lightweight)
- For transient messages ("Not enough letters", "Already used"). A `useToast()` hook returning `show(message, ms = 1500)`, rendering one toast at the top-center (`fixed`, `aria-live="polite"`). No library.

### 4.7 Cover art for new games
- Each game needs `cover.card` (square, ~500×500) and `cover.menu` (~734×596). If the user hasn't provided art, create **simple SVG placeholders** in the brand style (navy panel background `#0A2144`, green gradient accents `#b1ff06 → #228101`, gold `#f7cf4f`, one big emoji or simple shapes representing the game) at `public/assets/img/covers/{card,menu}/<slug>.svg`. List them in the report so the user knows to replace them.

---

## 5. Definition of done (every game)

1. Registry entry: `status: "live"`, `isNew: true` (and remove `isNew` from the previously newest game, so only the newest has the NEW badge), `daily` as the spec says, cover paths.
2. `app/<slug>/page.tsx` thin route with `gameMetadata(slug)`.
3. `games/<slug>/`: root component, `config.ts`, `logic/` with tests, `components/`, `data/` if game-specific.
4. Data-integrity tests for any new dataset (unique ids, valid references, image files exist, minimum sizes the generator needs).
5. Pure-logic coverage for every rule in the spec. Include the spec's worked examples as test cases verbatim.
6. `npm run check` and `npm run build` pass.
7. Manual playthrough of the spec's acceptance scenarios if a browser tool is available; otherwise say so explicitly.
8. Update `docs/ARCHITECTURE.md` (new shared pieces, the game's folder) and the README game list.
9. Commit on a feature branch: `feat/<slug>` when implementing a single spec; when running several specs in one session, use one branch `feat/games` with at least one commit per game. Do not push unless asked.
10. Final report: what was built, deviations from the spec and why, new copy lines for review, **[USER DECISION]** items, content that needs the user's review (datasets).
