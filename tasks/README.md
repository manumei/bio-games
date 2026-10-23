# tasks/: specs for coding agents

| File | What | Run order |
|---|---|---|
| `00-structural-update.md` | Audit of the current codebase + refactor plan (security upgrade, architecture, Taxo Bingo bug fixes, platform primitives, docs) | **1st, alone** |
| `shared-game-features.md` | Shared conventions + components every game spec relies on (daily pattern, stats, share, autocomplete, tone guide, definition of done) | read by every game spec |
| `taxo-bingo.md` | Taxo Bingo phase 2: daily challenge, stats histogram, streaks 🔥, practice, share, reveal | 2nd (builds the shared daily UI) |
| `bio-wordle.md` | Bio Wordle: 4–7 letter biology words, count-aware hints, hard mode, topic hint | 3rd |
| `symptoms-link.md` | Symptoms Link: guess the disease from up to 5 symptoms | 4th (builds the shared Autocomplete) |
| `animal-tictactoe.md` | Animal Tic-Tac-Toe: 3×3 trait grid, autocomplete, versus mode (stretch) | 5th |
| `cell-classifier.md` | Cell Classifier: name-it / find-it on SVG cell diagrams | 6th |
| `bio-guesser.md` | Bio Guesser: Akinator for organisms, mock engine + API contract for a future Python engine | 7th |

"Bio Top 8" is on the home page as coming soon but has no spec yet.

Authority when docs disagree: actual code > `docs/ARCHITECTURE.md` (written by the structural update) > `shared-game-features.md` > individual game spec.
