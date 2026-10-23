# BioGames: Structural Update (audit + refactor plan)

> **Audience:** an autonomous coding agent running in a fresh session.
> **Goal:** turn a hand-built learning project into a clean, typed, tested and modular Next.js codebase **without changing what the player sees or how Taxo Bingo plays**. The only behavior changes allowed are the bug fixes listed below.
> **After this pass,** other agents will implement new games from the specs in `tasks/*.md`. Those specs assume the architecture defined in **§4**. Your final deliverable includes `docs/ARCHITECTURE.md` (as-built reference) and `CLAUDE.md`. Future agents read those first, so they must be accurate.

---

## 0. How to use this document

1. Read the whole file before touching code. Findings (§3) have IDs (`A1`, `D2`, …). The execution plan (§5) references them.
2. Work on a new branch: `git checkout -b refactor/structure`. Commit at the end of every phase with a descriptive message. **Do not push** and do not open a PR unless the user asks.
3. After every phase, run the verification commands listed for it. Don't start the next phase with a red build.
4. If something in this document turns out to be wrong (a line number moved, a library API changed), trust the code and the official docs over this file, and note the discrepancy in your final report.
5. Items marked **[USER DECISION]** must not be decided by you. Use the documented default and list the item in your final report.
6. End with the acceptance checklist (§7) and the final report (§9).

---

## 1. Project snapshot (measured 2026-10-23)

| Item | Value |
|---|---|
| What | "BioGames": biology browser games. One live game (**Taxo Bingo**); five "coming soon" cards on the home page. |
| Live URL | https://bio-games.vercel.app/ (Vercel, deploys from GitHub `manumei/bio-games`, branch `main`) |
| Framework | Next.js **15.3.1** (App Router), React **19.1.0**, TypeScript **5.8.3** (strict), Tailwind CSS **4.1.4** (via `@tailwindcss/postcss`) |
| Analytics | Google Analytics `G-SR2881QNM3` (inline `next/script`) + `@vercel/analytics` |
| Baseline | `npm ci` OK · `npx tsc --noEmit` OK (0 errors) · `npx next build` OK (routes `/`, `/taxo-bingo`, `/bio-wordle`, all static; first-load JS: `/` 105 kB, `/taxo-bingo` 114 kB, shared 101 kB) |
| Lint | **No ESLint config exists.** `npm run lint` → `next lint` (removed in Next 16). |
| Tests | **None.** |
| `npm audit --omit=dev` | **critical**: `next` (~30 advisories, including *RCE in React flight protocol* GHSA-9qr9-h5gf-34mp, cache poisoning, SSRF, DoS); **high**: `nanoid` (transitive) |
| `npm outdated` (latest) | next 16.4.2 (15.x latest: 15.5.28) · react/react-dom 19.3.1 · tailwindcss 4.3.3 · @vercel/analytics 2.0.1 · typescript 7.0.2 (stay on 5.x, see A1) |
| Git pack size | **1.76 GiB**, almost all of it original PNGs inside `public/` (see E1) |
| Data | 546 organisms in `public/assets/data/taxonomy.csv`, one WebP each (84 MB total, unresized) |

### Current file map

| Path | Role | Verdict |
|---|---|---|
| `app/layout.ts` | Exports `metadata`, re-exports default from `layout-client.tsx` | Replace with one server `app/layout.tsx` (B1) |
| `app/layout-client.tsx` | `"use client"` root layout: font, GA script, Header/Footer, Vercel Analytics | Merge into `app/layout.tsx` (B1) |
| `app/page.tsx` | Home: 6 hardcoded `<Panel>` | Render from game registry (B5) |
| `app/globals.css` | Tailwind import, `custom-1..6` color tokens, 2 keyframes | Semantic tokens (G1) |
| `app/components/Header.tsx` | Logo/title, `<a href="/">` | Move to `components/layout/`, use `Link` (B3) |
| `app/components/Footer.tsx` | Placeholder social links, email, credits | Move to `components/layout/`, driven by site config (B4) |
| `app/components/Panel.tsx` | Home game card | Replace with `components/home/GameCard.tsx` (B6) |
| `app/components/MenuScreen.tsx` | "Shared" pre-game menu, actually Taxo-specific | Generic `GameMenu` + Taxo options (C1) |
| `app/components/GameOver.tsx` | "Shared" end-game popup with Taxo copy | Generic `Modal` + `GameOverModal` (C2) |
| `app/components/GiveUpPopup.tsx` | Confirm dialog that always navigates home | Generic `ConfirmDialog` (C3) |
| `app/components/GiveUpButton.tsx` | 🏳️ button | Keep, move to `components/game/`, a11y label (C4) |
| `app/taxo-bingo/page.tsx` | Menu ↔ game switch | Thin server route + `games/taxo-bingo/TaxoBingoGame.tsx` |
| `app/taxo-bingo/components/GameScreen.tsx` | 335 lines: data fetch, grid generation, deck, timer, input, win/loss, messages, modals | Split into pure logic + components (D1–D12) |
| `app/taxo-bingo/components/BingoGrid.tsx` | Grid of `<div onClick>` cells | Accessible buttons, catalog labels (D15) |
| `app/taxo-bingo/components/OrganismCard.tsx` | Image, zoom, skip, timer, SGA "hard mode" name | Keep behavior, clean up (D4, D16) |
| `app/taxo-bingo/components/CheatSheet.tsx` | Hardcoded category → description dict | Generate from taxonomy catalog (D8) |
| `app/bio-wordle/**` | Stub: copy-pasted Taxo menu, placeholder screen, two **empty** files | Delete (B10) |
| `test/paste.tsx` | Copy of the cheat-sheet dict; not a test | Delete (H1) |
| `src/*.py`, `src/wordvec.ipynb` | Python data/asset tooling | Move to `scripts/`, make CLIs (F1–F6) |
| `public/assets/data/taxonomy.csv` | The only data file the app reads | Replace with generated `data/organisms.json` (D10) |
| `public/assets/data/taxonomy.txt`, `taxo_organisms.txt` | Legacy, byte-identical, 266 rows, unused | Delete (E3) |
| `public/assets/data/friaxonomy.csv` | 5-row scratch file, unused | Delete (E3) |
| `public/assets/data/bio_words.txt` | 1,106 words for future Bio Wordle (noisy) | Keep untouched; `tasks/bio-wordle.md` curates it (E4) |
| `public/assets/img/games/taxo/**` | **1.7 GB** of original PNGs, never referenced by the app | Move out of `public/` (E1) |
| `public/assets/webp/games/taxo/**` | 546 WebPs used by the game | Re-encode smaller (E2) |
| `public/assets/**/deleteme.txt`, `deleme.txt`, `idk/idk.txt` | Placeholder notes | Delete (E5) |
| `public/favicon_io/site.webmanifest` | Broken icon paths, empty names | Fix or replace with `app/manifest.ts` (B8) |
| `tasks/*.md` | Game specs for later sessions | Do not modify, except to fix references if you rename something |

---

## 2. Things you must preserve (behavior contract)

This is a refactor, not a redesign. After your changes, a player must find Taxo Bingo identical except for the fixed bugs:

- **Home:** title "Select the game you want to play:", grid of game cards (2 cols mobile / 3 cols ≥sm), Taxo Bingo card with a yellow **NEW** badge, other games as "Coming Soon" cards. Hover effect on the live card: green gradient + image scale.
- **Header:** "**BIO**GAMES" (BIO in green gradient `from-secondary to-primary`) + logo icon, gold bottom border. **Footer:** "Follow Us", icons, email `biogames435@gmail.com`, "Created by Manuel Meiriño" (LinkedIn), "Inspired by futbol-11.com".
- **Taxo menu:** title "**TAXO** BINGO" (gradient on TAXO), cover image, the same 3 description paragraphs, timer choice **No Timer / 120s / 180s (default 180s)**, **Hard Mode** toggle (`Hard Mode ✔/✖`). Turning Hard Mode on **forces 120s** and disables the other timer buttons (tooltip "Disabled for Hard Mode"). "Start Game" button.
- **Grid composition:** 12 cells = 1 domain (Bacteria | Eukaryota) + 1 of [Animalia, Plantae, Chordata, Arthropoda] + **Angiospermae always** + 9 random from the remaining pool. Positions shuffled. 3 columns on mobile, 4 at `md`.
- **Organism card:** image with loading spinner, click/⛶ button to zoom (dark overlay, `animate-zoomFade`), **Skip** button, **Space** key skips, timer shown as "Time Left: Ns" (desktop) / "Timer: Ns" (mobile).
- **Hard mode:** organism name rendered in the **Standard Galactic Alphabet** (Minecraft enchanting-table glyphs, `sgaMap` in `OrganismCard.tsx:33-60`), italic small text. Cheat Sheet button disabled with tooltip *"Wouldn't be 'Hard Mode' if you could see the Cheat Sheet..."*. Keep this feature exactly.
- **Placing:** clicking a matching cell fills it with the organism image and a small category label overlay; a wrong cell plays the red `shake-wrong` animation (~0.5–0.7 s).
- **Cheat Sheet:** modal listing every category with emoji + description (same texts as `CheatSheet.tsx:7-67`, including the 💩 for Platyhelminthes).
- **Give up:** 🏳️ button under the grid → "Are you sure you want to give up?" Yes/No. (Bug fix D7: "Yes" now shows the **You Lost** screen instead of navigating home.)
- **Game over:** "You Won! 🎉" / "You Lost 🥀"; the win line *"Congratulations on beating Taxo Bingo [you're awesome]"*; the **exact** loss messages from `GameScreen.tsx:223-240`; the hard-mode/normal follow-up lines from `GameOver.tsx:56-75`; ✖ closes the popup to show the final board; "Go back to home" button.
- **Tone:** keep every joke, meme, emoji and Spanish line as written ("vayan a estudiar", "not great, not terrible", 💩, 🥀). Do **not** "professionalize" copy.

---

## 3. Findings

Severity: **P0** = broken/security, fix first · **P1** = structural, must fix in this pass · **P2** = quality, fix if cheap, otherwise list in the report.

### A. Tooling, dependencies, security

- **A1 (P0) Vulnerable framework version.** `next@15.3.1` matches ~30 advisories, including a critical RCE in the React flight protocol. `npm audit` lists the vulnerable range up to `16.3.0-preview.10`, so upgrade to the **latest Next 16.x** (16.4.2 at time of writing) and matching `react`/`react-dom` (19.3.x), `eslint-config-next`, `@next/third-parties` (if used).
  - Use the official upgrade guide/codemod (`npx @next/codemod@latest upgrade latest`) and read the Next 16 upgrade notes. Changes that touch this repo: `next lint` is removed (→ A3); Turbopack is the default for `dev`/`build` (drop the `--turbopack` flag); `images.domains` is deprecated (→ B6 removes the need for it entirely); Node ≥ 20.9 is required.
  - Also bump `tailwindcss` + `@tailwindcss/postcss` to latest 4.x, `@types/*` to match. For `@vercel/analytics` 2.x, check the changelog. If the `@vercel/analytics/next` `<Analytics />` API is unchanged, upgrade; otherwise use latest 1.x.
  - **Stay on TypeScript 5.x** (latest 5.9.x) unless Next's docs explicitly support TS 7.
  - Target: `npm audit --omit=dev` shows **0 critical / 0 high**. If something remains unfixable, list it in the report.
  - **[USER DECISION]** Vercel's project Node.js version must be ≥ 20.9. Mention this in the report; you can't check it.
- **A2 (P1) Unused dependencies.** `react-router-dom` (package.json:18) and `react-ga4` (package.json:16) are never imported (verified by grep). Remove both.
- **A3 (P1) No linting.** Add ESLint 9 flat config (`eslint.config.mjs`) with `eslint-config-next` (core-web-vitals + typescript presets, following the current Next docs). Script: `"lint": "eslint ."`. Fix all errors; warnings are OK only with a justification comment.
- **A4 (P1) No tests.** Add **Vitest** (node environment) for pure logic and data integrity. Config `vitest.config.ts` with the `@/` alias resolving to the repo root (matching `tsconfig.json` `paths`). Colocate tests as `*.test.ts` next to the module. Component tests are optional; don't add jsdom/RTL unless you write some.
- **A5 (P1) Scripts.** `package.json` scripts should be: `dev`, `build`, `start`, `lint`, `typecheck` (`tsc --noEmit`), `test` (`vitest run`), `check` (lint + typecheck + test). Keep it boring.
- **A6 (P2) Formatting.** The code is mostly double quotes + semicolons + 2 spaces, but `app/layout.ts` has no semicolons. Optional: add Prettier with defaults and format once **in its own commit** (so the refactor diffs stay readable). Skip it if it bloats the diff.
- **A7 (P2)** `tsconfig.json` has `allowJs: true` with no JS sources. Harmless; leave it unless you need the change.

### B. App shell (layout, header, footer, home)

- **B1 (P1) Root layout is a client component.** `app/layout.ts` exports metadata and re-exports `app/layout-client.tsx`, which is `"use client"` (line 1). Nothing in it needs to be client-side. That forces Header/Footer onto the client and is a hack around the metadata rule.
  → One **server** `app/layout.tsx`: `next/font/google` Figtree (CSS variable `--font-figtree-sans`), `metadata` (with `title: { default: "BioGames", template: "%s | BioGames" }`), Header, `<main>` slot, Footer, `<Analytics />`, Google Analytics.
  → GA: use `@next/third-parties/google` `<GoogleAnalytics gaId=… />` (or `next/script` in the server layout). Keep the ID `G-SR2881QNM3` as a constant in `lib/site.ts`. **Render analytics only when `process.env.NODE_ENV === "production"`.**
- **B2 (P1) Body background bug.** `globals.css:23-27` sets `body { background: var(--background) }` (`#0a0a0a`). That rule is **unlayered**, and Tailwind v4 utilities live in `@layer utilities`, so it beats the `bg-custom-2` class on `<body>` (`layout-client.tsx:36`). The real page background is `#0a0a0a`, and only wrapper divs paint the intended navy. → Body background = the page token (G1); remove the redundant `bg-custom-2` wrappers.
- **B3 (P1) Header.** `Header.tsx:6` uses `<a href="/">`, which forces a full page reload. Use `next/link`. The logo source `assets/img/icons/biogames.png` is 1024² / 1.5 MB, displayed at 40px (next/image optimizes it, but also commit a small 128px WebP/PNG and use that).
- **B4 (P2) Footer placeholders.** `Footer.tsx:11-37` links to `https://instagram.com`, `https://x.com`, `https://discord.com` (homepages, not accounts) and uses the old Twitter bird icon for X. Move links into `lib/site.ts` as optional URLs and only render the ones that are set. **[USER DECISION]** real handles. Default: keep the three placeholders exactly as they are (don't remove them silently) and flag them. Use `rel="noopener noreferrer"` on external links.
- **B5 (P1) Hardcoded game list.** `app/page.tsx:10-20` hardcodes six panels; titles drift from the README ("Taxo-Bingo" vs "Taxo Bingo", "Animal Tic-Tac-Toe"). → Create `games/registry.ts` (§4.3), the single source of truth for home cards, route metadata and menu branding. Include these entries, in today's order, with **exactly these slugs** (the game specs depend on them): `taxo-bingo` "Taxo Bingo" (live, `isNew`), `bio-wordle` "Bio Wordle", `symptoms-link` "Symptoms Link", `animal-tictactoe` "Animal Tic-Tac-Toe", `bio-top8` "Bio Top 8", `cell-classifier` "Cell Classifier" (all `coming-soon`). (`bio-guesser` is added later by its own spec.)
- **B6 (P1) `Panel.tsx` problems.** `<Link>` wraps a `<button>` (lines 51-55, invalid interactive nesting). Raw `<img>` loads `https://placehold.co/…` for coming-soon cards (lines 18-20, an external dependency plus layout shift). `alt="Imag"` (line 40). `hover:none` is not a class (line 26). Mixed `coming_soon`/`isNew` prop casing.
  → `components/home/GameCard.tsx`: a single `Link` styled as a card when live, a non-interactive `div` (`aria-disabled`) when coming soon. Local placeholder art instead of placehold.co (a CSS/SVG "Coming Soon" tile in brand colors, e.g. `public/assets/img/covers/coming-soon.svg`). `next/image` for covers with a real `alt`. Then delete `images.domains` from `next.config.ts`.
- **B7 (P2) Metadata.** Every page is titled "BioGames". Add per-route `metadata` built from the registry (`title`, `description`). Add an Open Graph image: make a 1200×630 WebP/PNG (< 300 KB) from `public/assets/img/covers/biogames-cover.png` (2.7 MB, 1536×1024; keep the original for the README).
- **B8 (P2) Web manifest broken.** `public/favicon_io/site.webmanifest` has empty `name`/`short_name`, icon `src`s pointing to `/android-chrome-*.png` (files are in `/favicon_io/`), and white theme colors on a dark site. → Replace with `app/manifest.ts` (name "BioGames", correct icon paths, `theme_color`/`background_color` = page token) or fix the file. Update `metadata.manifest` accordingly.
- **B9 (P2)** Optional themed `app/not-found.tsx` ("This page went extinct 🦤" + link home). Keep it tiny.
- **B10 (P1) `/bio-wordle` stub is live in production.** The route is reachable even though the home card says "Coming soon". It shows **Taxo Bingo's** description and cover (`app/bio-wordle/page.tsx:22-38`), its component is named `TaxoBingoPage` (line 6), `components/GameScreen.tsx` nests `<main>` inside `<main>`, and `GuessRows.tsx` / `Keyboard.tsx` are **0-byte files**. Nothing is reusable. → Delete `app/bio-wordle/` entirely. `tasks/bio-wordle.md` builds it properly later.

### C. "Shared" components that are actually Taxo-specific

- **C1 (P1) `MenuScreen.tsx`.** It exports `TimerOption = null | 120 | 180` (line 5) from a UI file, defaults to 180 (line 20), hard-wires the hard-mode-forces-120 rule (lines 43, 79), and always renders the Hard Mode button. `key={timer}` with `timer = null` produces a missing-key warning (line 46). `menu-container` is an unused class (line 24).
  → `components/game/GameMenu.tsx`: generic layout (brand title, cover, description, an **options slot**, Start button). Taxo's timer + hard-mode controls live in `games/taxo-bingo/components/TaxoMenuOptions.tsx`, built from a generic `components/ui/SegmentedControl.tsx` + `Button`. Timer values, default and hard-mode rule live in `games/taxo-bingo/config.ts`.
- **C2 (P1) `GameOver.tsx`.**
  - Contains Taxo hard-mode copy and a `hard` prop (lines 7, 56-75). → Generic `components/game/GameOverModal.tsx` (`won`, `title?`, `children` body, `actions?`, `onClose`). Taxo passes its own lines (keep the texts verbatim).
  - Uses `absolute top-1/2 left-1/2` (line 36). It's rendered outside any positioned ancestor (`GameScreen.tsx:304`), so it centers on the **document**, not the viewport. On a scrolled mobile page it can be off-screen. Same for `CheatSheet.tsx:77` and `GiveUpPopup.tsx:40`. → All overlays go through one `components/ui/Modal.tsx` using `fixed` positioning.
  - A window `keydown` listener calls `preventDefault()` on **every** key (lines 21-27). That blocks Tab/Enter/Space on the modal's own buttons, so keyboard users can't press "Go back to home". → Remove it. Disabling game input is the game's job (it already checks `gameOver`).
  - `Modal` requirements: `role="dialog"`, `aria-modal`, labelled title, overlay click + **Escape** close when `dismissible`, focus moved into the dialog on open and restored on close, body scroll lock optional. No new dependency needed.
- **C3 (P1) `GiveUpPopup.tsx` always navigates home.** `handleConfirm` (lines 26-29) runs `onConfirm` and then `router.push("/")`, so the "You Lost" screen never shows. That contradicts the original spec (give up → "You Lost" screen) and makes `GameScreen`'s `setGameOver(true)` pointless. Yes/No have identical styling (lines 47, 54); `giveup-opt-btn` is an unused class.
  → `components/ui/ConfirmDialog.tsx` (`title`, `message`, `confirmLabel`, `cancelLabel`, `tone: "danger" | "default"`, `onConfirm`, `onCancel`) with **no navigation**. The confirm button is visually distinct (danger).
- **C4 (P2) `GiveUpButton.tsx`.** Emoji-only content (line 22). Add `aria-label="Give up"`; keep the 🏳️ look.
- **C5 (P2)** Four hand-rolled overlays with different colors/z-indexes (`#0000006f`, `#00000064`, `#0000004f`, `#000000df`). Use one Modal + one zoom overlay (`components/ui/ImageZoom.tsx` or inside `OrganismCard`). Light popups on a dark site are the current look, so keep the light panel style but make it consistent across modals.

### D. Taxo Bingo logic & structure

File: `app/taxo-bingo/components/GameScreen.tsx` unless noted.

- **D1 (P0) The organism queue/preload is broken and only works by accident.**
  - The effect at lines 172-186 depends on `available` and **regenerates the whole queue and `current`** every time `available` changes. Both skip (lines 127-133) and a correct placement (line 273) call `setAvailable`, so the effect throws away whatever `showNextOrganism` just did.
  - `showNextOrganism` (lines 143-151) sets `current = queue[0]`, but `queue[0]` **is** the current organism (the effect sets `setCurrent(initialQueue[0])` at line 183). Without the effect masking it, Skip would re-show the same organism. Its `src` wouldn't change, so `onLoad` would never fire and the game would soft-lock (`isImageLoaded` stays false).
  - Every action fires 4 new `new Image()` preloads (lines 135-141, 179). With images up to 1.9 MB (E2) that wastes bandwidth, especially on mobile. Picks are with replacement, so duplicates are possible.
  - → Replace with a **deck** in pure logic (`games/taxo-bingo/logic/deck.ts`): a shuffled array of organism ids + cursor. `next()` advances, `preload(n)` returns the next n image URLs, placed organisms are removed, skipped ones go back to the end. Unit-tested.
- **D2 (P0) Skipping permanently removes organisms, so the game can become unwinnable or soft-lock.** `skipOrganism` filters the current organism out of `available` forever (lines 130-131). Small categories make the grid unwinnable once their members are skipped (Nematoda has 7 organisms, Acari 8, Platyhelminthes 8, Porifera 9). With "No Timer", 546 skips empty the pool: `current` becomes `undefined`, `OrganismCard` returns `null` (`OrganismCard.tsx:70`), the Skip button disappears, and the game is stuck.
  → Skipped organisms are recycled (back of the deck, reshuffle on wrap-around). Only placed organisms leave the deck. Test: "after skipping N > deck size times, `current` is always defined" and "a category's members are never exhausted by skipping".
- **D3 (P0) Randomness at module scope + biased, mutating shuffle.**
  - `domainCategory` and `kingdomCategory` (lines 78-83) are computed **once per JS module load**. Playing again via client-side navigation (Home → Taxo Bingo, no reload) reuses the same domain and kingdom picks.
  - `remainingCategories.sort(...)` (line 115) **mutates** the module-level array.
  - `sort(() => 0.5 - Math.random())` (lines 115, 124) is a biased shuffle.
  - → Pure `generateGrid(rng: Rng): TaxonId[]` in `games/taxo-bingo/logic/grid.ts` using Fisher–Yates from `lib/rng.ts` with an **injectable RNG**. That's required later for the daily challenge (`tasks/taxo-bingo.md`). Tests: always 12 unique ids, exactly one domain, exactly one from the kingdom slot, Angiospermae present, deterministic for a fixed seed, and **every generated category has ≥ 5 organisms in the dataset** (solvability guard).
- **D4 (P1) Image failure soft-lock.** `isImageLoaded` is only set by `onLoad` (`OrganismCard.tsx:122`); there is no `onError`. A missing or failed image blocks both Skip (line 128) and placement (line 265) forever. → On error, auto-advance to the next organism (log a `console.warn` with the id) and never block input indefinitely. Key the `<img>` by organism id so a remount always fires load events.
- **D5 (P1) Timer starts before the game is ready.** The countdown starts on mount (lines 188-206), before the CSV fetch and the first image load, so slow connections lose seconds. → Start when the first organism image is ready. Implement with `lib/hooks/useCountdown.ts` (deadline-based, see §4.4), not ad-hoc intervals. Store the **deadline timestamp** in state; that's what makes persistence possible later.
- **D6 (P1) Magic numbers.** `12` hardcoded in the win check (lines 242, 275) and implicitly in the loss messages (lines 223-240). Grid composition hardcoded (lines 117-122). Preload count 4 (line 179). Shake 700 ms (line 283). → `games/taxo-bingo/config.ts`: `GRID_SIZE` (derived from composition), `TIMER_OPTIONS = [null, 120, 180]`, `DEFAULT_TIMER = 180`, `HARD_MODE_TIMER = 120`, `PRELOAD_COUNT = 4`, `SHAKE_MS`, `MIN_ORGANISMS_PER_CATEGORY = 5`.
- **D7 (P1) Give-up flow.** Lines 292-300 set `gameOver` but not `showGameOverPopup`, and the popup navigates home anyway (C3). → Confirm → game over with `endReason: "gave-up"` → show the loss `GameOverModal`.
- **D8 (P1) Category data scattered and inconsistent.**
  - Category lists live in `GameScreen.tsx:26-76` with misleading names: `tx_big_Kingdoms_and_classes` contains phyla (Chordata, Arthropoda); `tx_PhylaAnimalia_and_small_kingdoms` mixes in Fungi/Protista with stale comments `// chordata`, `// arthropoda` (lines 39-40). There's also a Spanish leftover comment (line 44), commented Mollusca classes (line 54) and a commented test grid (line 123).
  - Emojis + descriptions live separately in `CheatSheet.tsx:7-67` (keyed by `"Name emoji"` strings) and are duplicated in `test/paste.tsx`.
  - → One typed **taxonomy catalog** `data/taxonomy.ts`: `{ id, label, rank, parent, emoji, description }` for all 50 categories (§4.5). The Cheat Sheet, grid labels and grid generator all read from it. Taxo's slot/pool definitions (domain slot, kingdom slot, always-included, random pool) go in `games/taxo-bingo/config.ts` and reference catalog ids.
- **D9 (P1) Duplicate types.** `interface Organism` is declared three times (`GameScreen.tsx:15-19`, `BingoGrid.tsx:1-5`, `OrganismCard.tsx:3-6`). → One `Organism` type in `data/organisms.ts`.
- **D10 (P1) Runtime CSV fetch + naive parsing.** Lines 153-170: `fetch("/assets/data/taxonomy.csv")` + `line.split(",")`. Any comma in a name breaks parsing. There's no error handling (a failed fetch leaves a blank screen forever) and no loading state. Image paths are **relative without a leading slash** (`assets/webp/...`), which only resolves because the route sits at `/taxo-bingo`; it breaks under any nested route or `trailingSlash`.
  → The Python pipeline (F3) generates `data/organisms.json` with **absolute** image paths. `data/organisms.ts` imports it statically (~60 KB, no fetch, no parse, typed) and exports `ORGANISMS`, `getOrganism(id)`, `organismsInTaxon(taxonId)`.
- **D11 (P2) Stringly-typed matching.** Categories are lowercased on parse (line 164) and compared via `category.toLowerCase()` (line 268). → Compare catalog ids.
- **D12 (P2) Shake timer.** `setTimeout` without cleanup (line 283); re-clicking the same wrong cell during the shake doesn't restart the animation. → Clear on unmount; restart via a key or nonce.
- **D13 (P2)** Space-to-skip is undocumented. Add a subtle "(Space)" hint on the Skip button at ≥sm.
- **D14 (P2) [USER DECISION]** The win message links "you're awesome" to `https://iamawesome.com` (lines 312-319), an unknown third-party domain. Default: keep it as is and flag it.
- **D15 (P1) `BingoGrid.tsx`.** Cells are `<div onClick>` (lines 32-40), not keyboard-accessible. `cursor-pointer` shows even when disabled. `key={i}` (line 28). → `<button>` cells with `aria-label` (category, plus the organism name when filled), `disabled` when filled or game over, `key={taxonId}`, label from the catalog. Visual output stays the same (adding the catalog emoji to cell labels is **not** part of this pass).
- **D16 (P2) `OrganismCard.tsx`.** The name renders twice for responsive layout (lines 139-145 and 168-178). `sgaMap` is rebuilt every render (lines 33-60). → Move SGA conversion to `games/taxo-bingo/logic/sga.ts` (`toStandardGalactic(text)`, tested). Keep both responsive placements if that's the simplest way to keep the layout, but render them from one helper.
- **D17 (P2) Data-name quality.** Display names come from file names via Python `.title()`, so species epithets are capitalized ("Panthera Tigris" instead of "Panthera tigris") and genus-only entries read "Geastrum Spp". Some names are misspelled; spotted so far: `Streptococcus Pneumonae` (pneumoniae), `Treponema Palidium` (pallidum), `Neisseria Gonorrhea` (gonorrhoeae), `Glossin Morsitans` (Glossina), `Meloidgyne Spp` (Meloidogyne), `Coidum Fragile` (Codium), `Aphrodia Aculeata` (Aphrodita).
  → In the pipeline, format names in binomial style (`Genus species`, `Genus spp.`) and support a `scripts/data/name_overrides.json` (id → corrected display name) instead of renaming image files. Fix the typos above in the overrides. Also produce a short list of other names you **suspect** are misspelled, and put it in the report instead of auto-fixing them.

### E. Data & assets

- **E1 (P0) 1.7 GB of unused originals in `public/`.** `public/assets/img/games/taxo/**` (546 PNGs, 1.7 GB) is never referenced by the app but ships with every deployment and makes the repo 1.76 GiB. → `git mv public/assets/img/games/taxo raw-assets/taxo` (a rename, so no new git weight) and point the pipeline at it. **Do not rewrite git history. Do not delete the originals.** **[USER DECISION]** whether to later untrack them (gitignore + `git rm --cached`), move them to Git LFS or move them to external storage. Mention this in the report.
- **E2 (P1) WebPs are unresized.** 546 files, 84 MB. Longest side: median ~1185px, max 4032px, 170 files > 1500px, largest 1.9 MB (`giraffa_camelopardalis.webp`). They're displayed at ≤ 192px (card), ~200px (grid cell) and 80vw (zoom).
  → The pipeline resizes to **max 1024px longest side**, WebP quality ~75, never upscaling. Re-encode all 546 from the PNG originals. Expect ~10–20 MB total; report the actual numbers. Organism images are pre-optimized, so render them with plain `<img>` (with an ESLint disable comment explaining why) or `next/image` with `unoptimized`. Don't push 546 images through Vercel's image optimizer (quota).
- **E3 (P1) Legacy data.** Delete `public/assets/data/taxonomy.txt`, `taxo_organisms.txt` (byte-identical) and `friaxonomy.csv`. Delete `taxonomy.csv` once `data/organisms.json` replaces it (keep the pipeline able to regenerate both if you like, but the app must not read the CSV).
- **E4 (P2) `bio_words.txt`.** Not used by the app yet. It has CRLF line endings, truncated tokens (`mitosi`, `meiosi`, `collag`, `glucos`, `insuli`, `amylas`, `bacter`, `reptil`, `dopami`, `toxopl`, …) and non-biology words (`drive`, `mars`, `brunei`, `memory`, `energy`, `gable`, `grotto`, `klippe`, …). **Leave the file as is**; `tasks/bio-wordle.md` owns its curation.
- **E5 (P2) Placeholder files.** Delete `public/assets/img/games/symptoms/deleteme.txt` ("add icons for the diseases and the symptoms"), `public/assets/img/games/tictac-extra/deleteme.txt` ("add images that arent contained within the animalia/ folder of taxo"), `public/assets/webp/games/top8/deleme.txt` (empty) and `public/assets/webp/idk/idk.txt` (empty), plus their now-empty folders. Their notes are already captured in `tasks/symptoms-link.md` and `tasks/animal-tictactoe.md`.
- **E6 (P2) Covers.** `covers/home/taxo.png` (886², 400 KB) is rendered via raw `<img>` at 160px; `covers/menu/taxo.png` is 734×596. Switch to `next/image`. Converting to WebP is optional.
- **E7 (P1) Asset path convention.** Every asset URL in code and data is absolute (`/assets/...`). Add a data-integrity test (§4.6) that fails on relative paths or missing files.

### F. Python tooling (`src/`)

- **F1 (P1)** In Next.js, `src/` is the conventional home of app code (`src/app`), so Python there is confusing. → Move to `scripts/` with `scripts/README.md` (what each script does, how to run it, Python version) and `scripts/requirements.txt` (`Pillow`; `wordfreq` only for the notebook; drop `colorama` or list it).
- **F2 (P1) Scripts run on import.** Module-level calls with commented-out toggles (`image_editing.py:25`, `taxoTranscriber.py:50`, `webping.py:103-112`). → Proper CLIs (`argparse`, `if __name__ == "__main__":`).
- **F3 (P1) Merge the taxo pipeline.** `webping.py` (PNG → WebP) and `taxoTranscriber.py` (folder walk → CSV) become one `scripts/build_taxo_dataset.py`:
  1. walk `raw-assets/taxo/<path...>/<file>.png` (the folder path *is* the taxonomy path; leaf folders only, same as today)
  2. resize + encode to `public/assets/webp/games/taxo/<path...>/<file>.webp` (skip if up to date unless `--force`)
  3. write `data/organisms.json`, sorted by id: `[{ "id", "name", "path": [...], "image": "/assets/..." }]`, applying `name_overrides.json`
  4. print a summary: counts per category, total bytes before/after, and failures (non-zero exit on failure).
  Bug to drop: `webping.py:34` builds `assets/webp/taxo/...` (missing `games/`). It was only printed, but it's wrong.
- **F4 (P2)** `image_editing.py` + `img_utils.py`: `squeeze_image_to_square` **stretches** non-square images (aspect distortion). Keep it as a small CLI (`scripts/square_cover.py`), add a `--mode pad|crop|stretch` flag (default `pad`), and document it.
- **F5 (P2)** `wordvec.ipynb` needs files not in the repo (`bioword.vec.bin`, `desc2025.xml`), and cell 2 uses `KeyedVectors`, whose import is commented out in cell 0. Move it to `scripts/notebooks/wordvec.ipynb` and add a README note: "historical, not runnable without external files". Don't try to fix it.
- **F6 (P2)** `src/testing.py` only prints the length of a list. Delete it.

### G. Styling

- **G1 (P1) Non-semantic tokens.** `globals.css:15-20` defines `custom-1`…`custom-6`; `--test` (line 6) and `custom-5` are unused; `--background`/`--foreground` conflict with the actual theme. → Semantic tokens in `@theme`. Suggested mapping (verify usages before renaming):
  `custom-1 #081c3a` → `surface` (header/footer) · `custom-2 #08162b` → `page` · `custom-3 #0A2144` → `panel` (cards, menu) · `custom-4 #f7cf4f` → `accent` (gold border, NEW badge) · `custom-6 #0a1d38be` → `cell` (bingo cells) · keep `primary #228101`, `secondary #b1ff06`. Delete `custom-5`, `--test`, `--background`, `--foreground` (or make them alias the new tokens). The site is dark-only; don't add a light theme.
- **G2 (P2) Inline hex colors.** `bg-[#00C8FF]` (timer selected), `bg-[#6574fd]`/`#4755d4` (home button), `bg-[#73f5ce]`/`#4ec7a0` (give-up buttons), `bg-[rgb(207,200,200)]`/`bg-[rgb(241,234,234)]` (modal panels), `border-[rgb(29,35,73)]` (cells), `bg-[#335833a6]`, `bg-[#ff0000]`. → Fold into `Button` variants / tokens where it's natural; pixel-identical output is not required, but keep the look.
- **G3 (P2) Dead selectors.** `menu-container`, `giveup-opt-btn`, `zoomed-image`, `id="zoom-overlay"` are unused. Remove them.
- **G4 (P2)** `.animate-zoomFade` and `.shake-wrong` keyframes stay global (they're shared UI). Optionally register them as Tailwind v4 `--animate-*` theme values.

### H. Repo hygiene & docs

- **H1 (P1)** Delete `test/paste.tsx` (duplicate dict, not a test) and the `test/` folder.
- **H2 (P1)** Update `README.md`: game list (from the registry), dev commands (`npm run dev|check|build`), project structure summary, a link to `docs/ARCHITECTURE.md`, and the Python pipeline in one line. Keep the cover image and credits.
- **H3 (P2)** Add `.gitattributes` with `* text=auto eol=lf` (the repo mixes CRLF/LF). Don't mass-renormalize binary files.
- **H4 (P1)** Write `docs/ARCHITECTURE.md` and `CLAUDE.md` (requirements in §8).

---

## 4. Target architecture

Names below are the **contract** the game specs rely on. If you have a strong reason to deviate, do it, and document the actual names in `docs/ARCHITECTURE.md`.

### 4.1 Directory layout

```
app/                              # Next.js routes ONLY: thin files
  layout.tsx                      # server; font, metadata, Header/Footer, analytics
  page.tsx                        # home: GAMES registry → <GameCard/>
  not-found.tsx                   # optional (B9)
  manifest.ts                     # optional (B8)
  globals.css                     # Tailwind v4 + semantic tokens + shared keyframes
  taxo-bingo/page.tsx             # export metadata; render <TaxoBingoGame/>
components/
  layout/Header.tsx, Footer.tsx
  home/GameCard.tsx
  ui/Button.tsx, Modal.tsx, ConfirmDialog.tsx, SegmentedControl.tsx, Spinner.tsx, BrandTitle.tsx
  game/GameMenu.tsx, GameOverModal.tsx, GiveUpButton.tsx, TimerDisplay.tsx
games/
  registry.ts                     # GAMES: GameMeta[], getGame(slug)
  taxo-bingo/
    TaxoBingoGame.tsx             # "use client" root: phase machine menu → playing → over
    config.ts                     # all tunables (D6) + slot/pool definitions (D8)
    types.ts                      # game-local types (GameState, EndReason, …)
    components/BingoGrid.tsx, OrganismCard.tsx, CheatSheet.tsx, TaxoMenuOptions.tsx
    logic/grid.ts, deck.ts, messages.ts, sga.ts   (+ *.test.ts)
data/                             # shared biology datasets (used by several games later)
  organisms.json                  # GENERATED by scripts/build_taxo_dataset.py, do not hand-edit
  organisms.ts                    # Organism type, ORGANISMS, getOrganism, organismsInTaxon
  taxonomy.ts                     # taxonomy catalog (50 categories)
  data.test.ts                    # data-integrity tests (§4.6)
lib/
  site.ts                         # site name, GA id, contact email, social URLs, credits
  cn.ts                           # tiny className joiner (no dependency needed)
  rng.ts, daily.ts, storage.ts, stats.ts           (+ *.test.ts)
  hooks/useCountdown.ts, useWindowKeydown.ts, useHasMounted.ts
scripts/                          # Python tooling (was src/)
  README.md, requirements.txt, build_taxo_dataset.py, square_cover.py
  data/name_overrides.json
  notebooks/wordvec.ipynb
raw-assets/taxo/**                # PNG originals (moved out of public/)
public/assets/...                 # only files the site actually serves
docs/ARCHITECTURE.md
CLAUDE.md
tasks/                            # specs for future sessions (leave alone)
```

Rules:
- `app/**` files stay thin: route metadata + one component. Client components are marked `"use client"` at the **lowest** sensible level (the game root, interactive UI), not in layouts.
- `games/<slug>/logic/**` and `lib/**` (except hooks) are **pure TypeScript**: no React, no DOM, no `Math.random()` (take an `Rng`), no `Date.now()` inside logic (take `now` as a parameter). This is what makes them testable and daily-seedable.
- Shared UI never contains game-specific copy.
- Assets: absolute URLs only.

### 4.2 Game root pattern

Every game's root component follows the same shape (Taxo is the first and the reference):

```ts
type Phase = "menu" | "playing" | "over";
// state: { phase, options, ...gameState }, built with useReducer when it has > 3 interacting fields
// menu   → <GameMenu brand=… cover=… description=… options={<XMenuOptions/>} onStart={start} />
// playing→ game UI (+ <GiveUpButton/> + <ConfirmDialog/>)
// over   → game UI frozen + <GameOverModal/> (closable to inspect the final board)
```

For Taxo, use a `useReducer` with explicit actions (`START`, `NEXT_READY`, `PLACE`, `MISPLACE`, `SKIP`, `TICK_EXPIRED`, `GIVE_UP`, `CLOSE_MODAL`). The reducer lives in `games/taxo-bingo/logic/` and is unit-tested. Side effects (preloading, countdown) live in the component/hooks.

### 4.3 Registry contract (`games/registry.ts`)

```ts
export type GameStatus = "live" | "coming-soon";
export interface GameMeta {
  slug: string;                    // route segment: "taxo-bingo"
  title: string;                   // "Taxo Bingo"
  brand: [accent: string, rest: string]; // ["TAXO", "BINGO"]: accent gets the green gradient
  description: string;             // one sentence for cards + <meta>
  status: GameStatus;
  isNew?: boolean;
  cover?: { card: string; menu: string };  // absolute public paths
  daily?: boolean;                 // game has a daily challenge (used later by streak badges)
}
export const GAMES: readonly GameMeta[];
export function getGame(slug: string): GameMeta;          // throws on unknown slug
export function gameMetadata(slug: string): Metadata;     // for app/<slug>/page.tsx
```

### 4.4 Platform primitives (`lib/`). Build all of these now, with tests.

The refactor itself only needs `rng` and `useCountdown`. The rest are tiny, and **every game spec depends on them**, so they belong to the platform layer and are built here once.

```ts
// lib/rng.ts
export type Rng = () => number;                         // uniform [0, 1)
export function hashString(input: string): number;     // stable 32-bit hash (e.g. cyrb53 truncated or FNV-1a)
export function createRng(seed: number | string): Rng;  // mulberry32 (string seeds hashed first)
export function randomSeed(): number;                   // from crypto.getRandomValues when available
export function randomInt(min: number, maxInclusive: number, rng: Rng): number;
export function pick<T>(items: readonly T[], rng: Rng): T;               // throws on empty
export function shuffle<T>(items: readonly T[], rng: Rng): T[];          // Fisher–Yates, NON-mutating
export function sample<T>(items: readonly T[], n: number, rng: Rng): T[];// n unique items

// lib/daily.ts   (all "days" are in the player's LOCAL timezone, reset at local 00:00, like NYT Wordle)
export function getDayKey(date?: Date): string;                  // "YYYY-MM-DD" (local)
export function dayNumber(dayKey: string, epochKey?: string): number; // whole days since epoch (default "2026-01-01"); DST-safe (use Date.UTC on the components)
export function msUntilNextDay(now?: Date): number;
export function dailySeed(gameSlug: string, dayKey: string): number;  // hashString(`${gameSlug}:${dayKey}`)

// lib/storage.ts (localStorage, SSR-safe, never throws: private mode / quota / disabled storage)
export function storageKey(gameSlug: string, key: string): string;    // "biogames:<slug>:<key>"
export function readJSON<T>(key: string, fallback: T, isValid?: (v: unknown) => v is T): T;
export function writeJSON(key: string, value: unknown): boolean;      // false if unavailable
export function removeItem(key: string): void;
export function isStorageAvailable(): boolean;

// lib/stats.ts (pure; persistence via storage.ts helpers)
export interface GameStats {
  version: 1;
  played: number;
  wins: number;
  currentStreak: number;
  maxStreak: number;
  histogram: Record<string, number>;  // game-defined buckets, e.g. "0".."12" or "1".."6" + "X"
  lastRecordedDayKey: string | null;
}
export function emptyStats(): GameStats;
// Streak rule (decided by the user for Taxo, applies to all games):
// win → currentStreak + 1; loss → 0; days without playing → unchanged.
// Idempotent: if result.dayKey === stats.lastRecordedDayKey, return stats unchanged.
export function applyResult(stats: GameStats, result: { dayKey: string; won: boolean; bucket: string }): GameStats;
export function loadStats(gameSlug: string): GameStats;
export function saveStats(gameSlug: string, stats: GameStats): void;

// lib/hooks/useCountdown.ts
// Deadline-based (epoch ms). Recomputes from Date.now() on an interval (~250 ms),
// so it survives re-renders and can be restored from storage. Calls onExpire once.
export function useCountdown(deadline: number | null, onExpire?: () => void): number | null; // whole seconds left

// lib/hooks/useWindowKeydown.ts
export function useWindowKeydown(handler: (e: KeyboardEvent) => void, enabled?: boolean): void; // ignores events from <input>/<textarea>, latest-handler ref

// lib/hooks/useHasMounted.ts
export function useHasMounted(): boolean; // for UI that reads localStorage (avoid hydration mismatch)
```

### 4.5 Shared data contracts (`data/`)

```ts
// data/taxonomy.ts
export type TaxonRank = "domain" | "kingdom" | "phylum" | "class" | "order";
export interface Taxon {
  id: string;            // lowercase, matches organism path segments: "chordata"
  label: string;         // "Chordata"
  rank: TaxonRank;       // be honest: Chordata/Arthropoda are phyla, Protista is an informal kingdom (note it)
  parent: string | null; // "animalia"
  emoji: string;         // from CheatSheet.tsx
  description: string;   // from CheatSheet.tsx, verbatim
}
export const TAXONOMY: readonly Taxon[];  // all 50 categories present in the dataset
export function getTaxon(id: string): Taxon;

// data/organisms.ts
export interface Organism {
  id: string;        // file stem: "panthera_tigris"
  name: string;      // display: "Panthera tigris"
  path: string[];    // taxon ids root→leaf: ["eukaryota","animalia","chordata","mammalia","carnivora"]
  image: string;     // "/assets/webp/games/taxo/eukaryota/.../panthera_tigris.webp"
}
export const ORGANISMS: readonly Organism[];
export function getOrganism(id: string): Organism;
export function organismsInTaxon(taxonId: string): Organism[];
```

Note: Aves sits directly under Chordata in this dataset (not under Reptilia). Keep the dataset's structure; don't "fix" phylogeny.

### 4.6 Tests that must exist at the end

- `lib/rng.test.ts`: determinism per seed, `shuffle` is a permutation and doesn't mutate, `sample` uniqueness, `pick` on empty throws.
- `lib/daily.test.ts`: `getDayKey` formatting, `dayNumber` across a DST change and a year boundary, `msUntilNextDay` bounds.
- `lib/stats.test.ts`: win/loss/skip-day streak semantics, `maxStreak`, histogram increments, idempotency per `dayKey`.
- `lib/storage.test.ts`: works with a fake `localStorage`; returns the fallback when storage throws or the JSON is corrupted.
- `games/taxo-bingo/logic/*.test.ts`: grid rules (D3), deck recycling (D1, D2), reducer transitions (win at 12, give-up → loss, timeout → loss, misplace doesn't change cells), loss-message brackets (exact strings, every count 0–11), SGA conversion.
- `data/data.test.ts`: every organism image path is absolute **and exists** under `public/`; every path segment is a known taxon; ids are unique; every taxon in Taxo's grid pools has ≥ `MIN_ORGANISMS_PER_CATEGORY` organisms.

---

## 5. Execution plan

Each phase ends with: `npm run check` (from Phase 1 on) + `npm run build` green → commit.

### Phase 0: Baseline
1. `git checkout -b refactor/structure`. `npm ci`. Record `npx tsc --noEmit`, `npx next build`, `npm audit --omit=dev` outputs for the report.
2. If a browser tool is available, play one Taxo Bingo round (menu → place a few → give up) to see the current behavior. Otherwise read §2 carefully.

### Phase 1: Tooling & dependency upgrade (A1–A6)
1. Upgrade Next/React/Tailwind/types per A1; remove `react-router-dom`, `react-ga4` (A2); drop `--turbopack` from `dev`.
2. ESLint flat config + scripts (A3, A5); Vitest + config with `@/` alias (A4). Add a trivial passing test so `npm test` is green.
3. Fix whatever the upgrade breaks. `next.config.ts` keeps `reactStrictMode: true`. The `images.domains` entry is removed in Phase 4 (once placehold.co is gone); if Next 16 errors on it, convert it to `remotePatterns` temporarily.
4. Verify: `npm run check`, `npm run build`, `npm audit --omit=dev`. Commit: `chore: upgrade Next 16, add ESLint + Vitest, drop unused deps`.

### Phase 2: Repo, asset and data pipeline (E1–E7, F1–F6, H1, H3)
1. `git mv src scripts` (then restructure per F1–F6). `git mv public/assets/img/games/taxo raw-assets/taxo` (E1). Delete legacy data (E3) and placeholders (E5), `test/` (H1).
2. Write `scripts/build_taxo_dataset.py` (F3) + `name_overrides.json` (D17). Run it: re-encode the WebPs (E2) and generate `data/organisms.json`. Python with Pillow is available on this machine (`python -c "import PIL"` works). Check that the generated organism count is still **546** and the per-category counts match §1's distribution.
3. Add `.gitattributes` (H3).
4. Verify: Python script exits 0; `git status` shows renames (not delete+add) for the PNG move; the image byte total dropped. Commit in two parts so the big binary change is isolated: `chore: move Python tooling to scripts/, move raw PNGs out of public/` then `perf: re-encode organism WebPs (max 1024px) and generate data/organisms.json`.

### Phase 3: Platform primitives (§4.4, §4.5)
1. `lib/rng.ts`, `lib/daily.ts`, `lib/storage.ts`, `lib/stats.ts`, hooks, `lib/site.ts`, `lib/cn.ts`, with tests.
2. `data/taxonomy.ts` (from `CheatSheet.tsx` texts + ranks/parents), `data/organisms.ts`, `data/data.test.ts`.
3. Verify `npm run check`. Commit: `feat(lib): rng, daily, storage, stats primitives and shared data layer`.

### Phase 4: App shell + shared UI (B1–B9, C1–C5, G1–G4)
1. `components/ui/*`, `components/game/*`, `components/layout/*`, `components/home/GameCard.tsx`, `games/registry.ts`.
2. New `app/layout.tsx` (delete `layout.ts` + `layout-client.tsx`), `app/page.tsx` from the registry, tokens in `globals.css`, manifest, metadata, OG image, coming-soon art. Remove `images.domains`.
3. Delete `app/bio-wordle/` (B10) and the old `app/components/`. Make sure nothing still imports them.
4. Verify visually if you can (home, header, footer); otherwise compare class names carefully. Commit: `refactor: server layout, game registry, shared UI kit, semantic theme tokens`.

### Phase 5: Taxo Bingo restructure + bug fixes (D1–D17)
1. Pure logic first: `config.ts`, `logic/grid.ts`, `logic/deck.ts`, reducer, `logic/messages.ts` (exact strings from `GameScreen.tsx:223-240` and `GameOver.tsx:56-75`), `logic/sga.ts`, with tests.
2. Components: `TaxoBingoGame.tsx`, `BingoGrid`, `OrganismCard`, `CheatSheet` (from `TAXONOMY`), `TaxoMenuOptions`. `app/taxo-bingo/page.tsx` becomes a thin server file with `metadata`.
3. Walk through §2 line by line and confirm each behavior is preserved, plus the fixes: give-up shows the loss modal; skipping never exhausts the deck; an image error never soft-locks; the timer starts when the first organism is shown; modals are viewport-centered and keyboard-usable.
4. Commit: `refactor(taxo-bingo): pure logic + reducer, fix deck/skip/timer/give-up bugs`.

### Phase 6: Docs & final verification (H2, H4, §7, §9)
1. `docs/ARCHITECTURE.md`, `CLAUDE.md`, `README.md`.
2. Run everything in §7. If a browser tool is available, play a full round of each scenario in §7; otherwise say so in the report.
3. Commit: `docs: architecture reference, CLAUDE.md, README refresh`.

---

## 6. Guardrails (do not)

- Do **not** change game rules, texts, jokes, Spanish lines, emojis, the timer options, or the hard-mode behavior. Bug fixes in §3 are the only exceptions.
- Do **not** rewrite git history, force-push, push, or delete the PNG originals.
- Do **not** add a database, auth, a state-management library, a CSS-in-JS library, or a UI kit. React state + `useReducer` + Tailwind is enough.
- Do **not** start implementing new games or the Taxo daily challenge. Those are in `tasks/*.md` for later sessions. Building the `lib/` primitives they need **is** in scope.
- Do **not** edit `public/assets/data/bio_words.txt`.
- Do **not** modify `tasks/*.md`, except to update a path reference you renamed.
- Avoid new runtime dependencies. Allowed if genuinely needed: `@next/third-parties`. Dev deps: `vitest`, `eslint`, `eslint-config-next`, `prettier` (optional).

---

## 7. Acceptance checklist

- [ ] `npm run lint`, `npm run typecheck`, `npm test`, `npm run build` all pass; `npm audit --omit=dev` has 0 critical/high (or exceptions explained).
- [ ] No file under `app/` except `layout.tsx`, `page.tsx`, `globals.css`, `not-found.tsx`, `manifest.ts`, and `taxo-bingo/page.tsx` (plus any OG image file).
- [ ] `grep -r "use client" app/` only matches nothing or route-level leaf components that genuinely need it (ideally nothing).
- [ ] No `Math.random()` outside `lib/rng.ts`. No organism or category data hardcoded in components.
- [ ] `public/` contains no unused files: no PNG originals, no legacy data, no placeholder txts. `du -sh public` reported.
- [ ] Home renders 6 cards from `GAMES`, with Taxo Bingo live + NEW. `/bio-wordle` returns 404.
- [ ] Taxo Bingo, verified by tests or manual play:
  - [ ] grid has 12 unique cells following the composition rule; a second game started via client-side navigation gets a fresh domain/kingdom pick
  - [ ] correct click fills; wrong click shakes; win at 12 shows "You Won! 🎉"
  - [ ] Skip / Space works; skipping 600 times never empties the deck
  - [ ] timer options and hard-mode lock (120s) as before; timer starts when the first organism appears; timeout → loss modal
  - [ ] Give up → confirm → **loss modal** (no navigation); "Go back to home" works; ✖ shows the final board
  - [ ] hard mode shows SGA names and disables the Cheat Sheet with the same tooltip
  - [ ] all modals are centered in the viewport when scrolled, close with Escape (game-over and cheat sheet), and are keyboard-operable
  - [ ] loss messages identical for every filled count 0–11
- [ ] `docs/ARCHITECTURE.md` and `CLAUDE.md` exist and match the code.

---

## 8. Required docs

### `docs/ARCHITECTURE.md` (as-built; future agents' primary reference)
Must contain:
1. Directory map (actual, not planned) with one line per folder.
2. Conventions: client/server boundary, pure-logic rule, absolute asset paths, naming, tests location, commit style.
3. API reference for everything in `lib/`, `data/`, `components/ui`, `components/game`, `games/registry.ts`: signatures + one-line purpose each (copy the real signatures).
4. **"How to add a new game"** checklist: registry entry → `app/<slug>/page.tsx` → `games/<slug>/` (root, config, logic, components) → cover art → tests → flip status to `live`.
5. Daily/persistence conventions: storage key naming (`biogames:<slug>:<key>`), local-midnight reset, stats/streak rule, `useHasMounted` for storage-dependent UI.
6. Data pipeline: how to add an organism (drop a PNG into `raw-assets/taxo/<path>/`, run `python scripts/build_taxo_dataset.py`, commit the WebP + JSON).
7. Known limitations / leftovers (anything from §3 you didn't do, and why).

### `CLAUDE.md` (short, ≤ 60 lines)
Commands (`npm run dev|check|build`, the Python pipeline), a 10-line structure summary, the key conventions (pure logic, no `Math.random` outside `lib/rng.ts`, shared UI has no game copy, keep the user's humor/tone verbatim), and a pointer: "Read docs/ARCHITECTURE.md before changing structure; game specs live in tasks/."

---

## 9. Final report (your last message)

1. Phase-by-phase summary with commit hashes.
2. Before/after numbers: `npm audit` counts, `public/` size, WebP total size, first-load JS for `/` and `/taxo-bingo`, test count.
3. Every finding ID you **did not** fully complete, with the reason.
4. **[USER DECISION]** items: E1 (what to do with `raw-assets/` long-term), B4 (social links), D14 (iamawesome.com link), A1 (Vercel Node version ≥ 20.9), plus the suspected misspelled organism names (D17).
5. Anything in this document that turned out to be wrong.
