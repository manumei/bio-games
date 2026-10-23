# CLAUDE.md

Read `docs/ARCHITECTURE.md` before changing structure; game specs live in `tasks/`.

## Commands

```bash
npm run dev        # Start Next.js dev server (Turbopack)
npm run check      # Run ESLint + tsc --noEmit + Vitest unit/data tests
npm run build      # Production Next.js build
npm test           # Run Vitest suite only
python scripts/build_taxo_dataset.py          # Build Taxo WebPs + data/organisms.json
python scripts/build_taxo_dataset.py --force  # Re-encode all 546 WebPs (max 1024px)
```

## Structure Summary

- `app/` — Thin Next.js App Router server routes (`layout.tsx`, `page.tsx`, `<slug>/page.tsx`) + `globals.css`.
- `components/layout/` — `Header.tsx` and `Footer.tsx`.
- `components/home/` — `GameCard.tsx` rendered from `GAMES`.
- `components/ui/` — Generic UI primitives (`Button`, `Modal`, `ConfirmDialog`, `SegmentedControl`, `Spinner`, `BrandTitle`).
- `components/game/` — Shared game shells (`GameMenu`, `GameOverModal`, `GiveUpButton`, `TimerDisplay`).
- `games/registry.ts` — Single source of truth (`GAMES`, `getGame`, `gameMetadata`).
- `games/<slug>/` — Game module: `<Game>Game.tsx` (`"use client"` root), `config.ts`, `types.ts`, `components/`, `logic/` (`+ *.test.ts`).
- `data/` — Shared datasets (`organisms.json`, `organisms.ts`, `taxonomy.ts`, `data.test.ts`).
- `lib/` — Pure platform primitives (`rng.ts`, `daily.ts`, `storage.ts`, `stats.ts`, `site.ts`, `cn.ts`) + `lib/hooks/`.
- `scripts/` — Python CLI asset/dataset tooling reading from `raw-assets/taxo/`.

## Key Conventions

- **Pure logic:** `games/<slug>/logic/**` and `lib/**` (except `lib/hooks/**`) must be pure TypeScript — no React/DOM, no `Math.random()` outside `lib/rng.ts` (pass an `Rng`), and no `Date.now()` inside reducers (pass `now` via actions).
- **Client boundary:** Keep `"use client"` on game roots and interactive UI components, never on `app/**` layouts or route pages.
- **Shared UI:** Never put game-specific copy or rules inside `components/ui/**` or `components/game/**`.
- **Assets:** Always use absolute paths (`/assets/...`). Render the 546 organism WebPs with plain `<img>` (pre-optimized to ≤1024px) to avoid Vercel Image Optimizer quota.
- **Tone:** Keep all existing humor, memes, emojis, and Spanish lines verbatim.
