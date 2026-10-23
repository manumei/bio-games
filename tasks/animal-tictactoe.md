# Animal Tic-Tac-Toe

> **Audience:** coding agent. **Status:** not started.
> **Read first:** `docs/ARCHITECTURE.md`, `CLAUDE.md`, `tasks/shared-game-features.md`.
> **Replaces:** `tasks/tictac.txt` (plus the old note "add images that aren't contained within the animalia/ folder of taxo" from `public/assets/img/games/tictac-extra/deleteme.txt`).
> **Shared pieces needed:** `Autocomplete` + `lib/text.ts`, `Toast`, daily pattern, `StatsPanel`, `StreakBadge`, `ShareButton`, `NextDailyCountdown`. Build any that are missing per `shared-game-features.md` §4.
> Inspired by the futbol-11.com grid (credited in the site footer) / Immaculate Grid, with animals.

---

## 1. Concept

A 3×3 grid; each row and each column has an **animal trait** ("Lays eggs", "Lives in the ocean", "Mammal", "Apex predator", "Carnivore"…). Type an animal that matches **both** its row and column trait to fill that cell. Fill all 9 to win.

**Player-facing description (menu), from the original notes:**
> Enter animals that match both the row and column trait combinations. Fill the 3×3 grid with the right animal names: write the animal's name and press **Enter** to submit it.
> If one fits multiple cells, choose the cell by clicking on it. Fill the whole grid to win!
> You have **15 guesses**. **Hard Mode**: 10 guesses, no repeated animals, no animal list.

Registry: slug `animal-tictactoe`, title "Animal Tic-Tac-Toe", brand `["ANIMAL", "TIC-TAC-TOE"]`, `daily: true`.

**Brainstormed additions:**
- A **guess budget**, so the daily can't be brute-forced through autocomplete. The original notes had unlimited attempts; this is a deliberate change, see §7.
- A solvability-checked grid generator (every cell has ≥ 3 answers).
- Animal images reused from the Taxo Bingo dataset.
- A post-game reveal of example answers.
- Trait definitions on hover.
- **Versus mode**: actual tic-tac-toe for two players on one device (stretch, Step 9).

---

## 2. Rules (precise)

- Grid: 3 row traits × 3 column traits, 6 distinct traits.
- Submitting text (Enter or Submit):
  1. Text that isn't a known animal (`findExact` over names + aliases) → message **"{text} isn't in our animal list"**. **No guess consumed.**
  2. Known animal, Hard Mode, already used → **"Already used {Animal}"**. No guess consumed.
  3. Known animal, fits **no empty cell** (including when it only fits already-filled cells) → **"{Animal} does not fit the grid"**. Guess consumed.
  4. Fits **exactly one** empty cell → fill it, **"{Animal} has been added!"**. Guess consumed.
  5. Fits **several** empty cells → highlight the candidate cells, **"{Animal} fits {k} cells, click one to place it"**. Clicking a candidate fills it (guess consumed); Esc or a "Cancel" chip cancels (no guess consumed). Other input is disabled while picking.
- Repeats: allowed in normal mode (as in the original notes: the same animal can fill several cells over several submissions), forbidden in Hard Mode.
- Guess budget: `NORMAL_GUESSES = 15`, `HARD_GUESSES = 10` (in `config.ts`). Shown as "Guesses left: 12".
- Win: all 9 filled. Loss: guesses run out with empty cells, or **Give up** (🏳️ + confirm).
- The notes' Step 3A temporary message ("you have submitted {animal_name}, nice testing!") was a dev scaffold. Don't ship it.

---

## 3. Data

### 3.1 Traits: `games/animal-tictactoe/data/traits.ts`
```ts
type TraitGroup = "class" | "diet" | "habitat" | "continent" | "body" | "behavior";
interface Trait {
  id: string; label: string; emoji: string; group: TraitGroup;
  description: string;      // precise definition, shown on hover/tap. This is the rule, so be exact.
  exclusive?: boolean;      // true for groups where an animal has exactly one value (class, diet)
  implies?: string[];       // e.g. mammal → ["warm_blooded"]
}
```
Suggested set (~35). Each definition must make classification unambiguous:
- **class** (exclusive): Mammal 🐾, Bird 🐦, Reptile 🦎, Amphibian 🐸, Fish 🐟, Insect 🐞, Arachnid 🕷️, Crustacean 🦀, Mollusk 🐚
- **diet** (exclusive): Carnivore 🥩, Herbivore 🌿, Omnivore 🍽️ ("mostly eats…" definitions)
- **habitat**: Ocean 🌊 ("spends most of its life in saltwater"), Freshwater 🏞️, Desert 🏜️, Rainforest 🌴, Arctic/Tundra ❄️, Savanna/Grassland 🦒, Mountains ⛰️
- **continent** (native range only): Africa, Asia, Australia/Oceania, South America, North America, Europe
- **body**: Warm-blooded 🌡️, Lays eggs 🥚, Venomous ☠️ ("injects venom by bite or sting; poisonous-to-eat doesn't count"), Can fly 🪽 ("powered flight; gliding doesn't count"), Has a shell 🐢
- **behavior**: Nocturnal 🌙, Apex predator 👑 ("adults have no natural predators"), Hibernates 💤, Migrates 🧭, Lives in groups 👥

Original-note examples that must exist: "lays eggs", "warm blooded", "lives in tundra", "mammal", "insect", "apex predator", "lives in ocean", "carnivorous".

### 3.2 Animals: `games/animal-tictactoe/data/animals.json`
```ts
interface Animal {
  id: string;               // snake_case common name: "red_panda" (the image naming convention from the notes)
  name: string;             // "Red Panda"
  aliases: string[];        // ["Lesser Panda"]: also catches "Orca" vs "Killer Whale"
  scientificName?: string;  // "Ailurus fulgens": links to Taxo images
  traits: string[];         // trait ids
  image?: string;           // dedicated image path if one exists (see 3.3)
}
```
- **≥ 200 well-known animals**, diverse across all trait groups (not 150 mammals). Common names, since the notes asked for common names with autocomplete to avoid naming disputes.
- Trait assignments must be defensible; when an animal is borderline for a trait, **leave the trait off** (a missing trait only costs one valid answer; a wrong one makes the game feel broken).
- The class and diet groups need exactly one value per animal; validate it in tests.

### 3.3 Images (the notes' Step 4, improved)
The notes planned to probe `assets/webp/tictac/<animal_name>.webp` at runtime and fall back to text. Probing causes 404 noise, flicker and extra requests, so resolve images **ahead of time** instead:
1. Dedicated image `public/assets/webp/games/animal-tictactoe/<id>.webp` → recorded in `animal.image`.
2. Else the Taxo organism whose id is `snake_case(scientificName)` (`getOrganism`). Taxo has ~435 animals (e.g. *Ailurus fulgens*, *Panthera tigris*, *Ursus maritimus*). This is exactly what the old "tictac-extra" note intended: reuse the Taxo animals and add extras only for missing ones.
3. Else render the name as text (the notes' fallback).

Pure `resolveAnimalImage(animal): string | null`. A data test verifies every `image` path exists. In the report, list how many animals have an image, and which popular ones don't (so the user knows what art to add). **Note:** the notes mention "hundreds of animal images" in an old `assets/webp/tictac/` folder; it isn't in this repo. Ask the user about it in the report.

---

## 4. Grid generation (`logic/grid.ts`, pure)
```ts
generateGrid(rng: Rng, animals, traits): { rows: string[]; cols: string[] }
```
- Sample 6 distinct traits → 3 rows + 3 cols.
- Reject the attempt if any of these hold:
  - any of the 9 cells has fewer than `MIN_ANSWERS = 3` animals
  - a row/col pair where one trait `implies` the other (Mammal × Warm-blooded is trivial)
  - more than 2 of the 6 traits come from the same group
- Retry up to 1,000 times with the same rng stream. If that still fails, throw in tests; in production fall back to a small hand-made list of known-good grids in `data/fallbackGrids.ts`.
- Test: for 500 seeds, the grid is valid and deterministic per seed.
- `answersFor(rowId, colId)` gives the example answers for the post-game reveal.

---

## 5. Implementation steps

Steps 1–6 keep the original notes' numbering.

### Step 1: Database
§3.1 + §3.2 + integrity tests (unique ids, known trait ids, exactly one class + one diet, aliases don't collide with other animals' names, ≥ 200 animals, image paths exist).

### Step 2: Grid base
A 4×4 layout: the top-left corner shows the guesses-left counter (or 🐾); the first row has the 3 column traits; the first column has the 3 row traits; the bottom-right 3×3 are the cells. Trait headers show emoji + label + an ⓘ that opens the definition (tooltip on hover, popover on tap). Use the generator from §4.

### Step 3: Inputs (3A + 3B)
The shared `Autocomplete` (Submit button to its right, Enter submits) below the grid, with a message line under it. Implement §2 in a pure reducer. Filled cells become disabled.

### Step 4: Images instead of names
Filled cells show `resolveAnimalImage(animal)` (cover-fit, rounded) with the name in a small overlay label (same style as Taxo's filled cells), or the name as text when there's no image.

### Step 5: Name predictions
The shared `Autocomplete` already implements the notes' rule: after **3+ letters**, suggest every animal where **any name part starts with** the typed letters ("pan" → Red Panda, Giant Panda, Panther…; "red" → Red Panda). Aliases are searched too.

### Step 6: Filling the grid wins
→ `GameOverModal` "You Won! 🎉". Also handle the loss paths from §2.

### Step 7: Animal list (cheat sheet), Hard Mode, post-game reveal
- **🐾 Animal list** button (normal mode): `Modal` with every animal name alphabetically (names only, no traits). In Hard Mode it's disabled with tooltip *"You're supposed to know animals. That's the whole game."*
- **Hard Mode** (menu toggle, locked): `HARD_GUESSES`, no repeats, no animal list.
- **Reveal:** when the game ends, each empty cell shows up to 3 example answers (`answersFor`, deterministic order) in faded text.
- Message pools in `logic/messages.ts` (list them in the report), e.g. win: "9/9. David Attenborough just followed you." · win with zero wasted guesses: "Perfect grid, zero wasted guesses. Are you a zookeeper?" · loss with 7–8 filled: "So close. That last cell is still out there, roaming free." · loss with 0–2: "Vayan a estudiar (zoología)." Plus the Taxo-style hard-mode follow-ups.

### Step 8: Daily challenge, stats, streak, share
- Follow `shared-game-features.md` §3. Grid = `generateGrid(createRng(dailySeed("animal-tictactoe", dayKey)))`. State:
  ```ts
  interface TicTacDailyState extends DailyStateBase<{ hardMode: boolean }> {
    rows: string[]; cols: string[];
    cells: (string | null)[];   // 9 animal ids, row-major
    guessesUsed: number;
    used: string[];             // animal ids used (hard mode check)
  }
  ```
- Stats buckets `"0"`…`"9"` (cells filled); win = 9.
- Share:
  ```
  Animal Tic-Tac-Toe #7 🐾 9/9 · 11 guesses 💀 Hard
  🟩🟩🟩
  🟩🟩🟩
  🟩🟩🟩
  https://bio-games.vercel.app/animal-tictactoe
  ```
  ⬛ for empty cells; no animal or trait names.

### Step 9 (stretch): Versus mode (local, 2 players)
Only after Steps 1–8 are solid. A menu option "Versus (2 players)":
- Players ❌ and ⭕ alternate on one device. On your turn: click an empty cell, then type an animal. Valid for that cell → you claim it (animal image + your mark badge). Invalid or unknown → the turn passes (toast "Wrong! ⭕'s turn").
- No repeated animals in the whole match. Three of your marks in a row/column/diagonal wins; a full board without a line is a draw.
- Optional 20-second turn timer (`useCountdown`); timeout passes the turn.
- Random grid (`randomSeed()`), never saved, no stats. "Rematch" button.

---

## 6. Files
```
app/animal-tictactoe/page.tsx
games/animal-tictactoe/
  AnimalTicTacToeGame.tsx
  config.ts                     # NORMAL_GUESSES, HARD_GUESSES, MIN_ANSWERS, MAX_SAME_GROUP
  data/traits.ts, animals.json, animals.ts, fallbackGrids.ts
  logic/grid.ts, reducer.ts, images.ts, daily.ts, share.ts, messages.ts, versus.ts  (+ tests)
  components/TraitHeader.tsx, GridCell.tsx, TicTacGrid.tsx, AnimalList.tsx, TicTacMenuOptions.tsx
public/assets/webp/games/animal-tictactoe/       # dedicated images (may start empty: add a .gitkeep)
public/assets/img/covers/{card,menu}/animal-tictactoe.svg   # placeholder art if none provided
```

## 7. Tests & acceptance
- Reducer: all five submit outcomes in §2; multi-cell pick + cancel; budget exhaustion → loss; give up; hard-mode repeat rule; no input after game over.
- Grid generator properties (§4); `resolveAnimalImage` order; share text.
- Manual: "pan" shows Red Panda + Giant Panda + Panther; an animal fitting 2 cells highlights both and fills the clicked one; "does not fit" consumes a guess; unknown text doesn't; reload mid-game resumes; the reveal shows examples.

## 8. [USER DECISION] items to flag
- **Guess budget** (15 / 10) replacing the original unlimited attempts.
- Review `animals.json` trait assignments and the trait definitions.
- The old `assets/webp/tictac/` image collection mentioned in the notes. Where is it?
- New joke lines.
