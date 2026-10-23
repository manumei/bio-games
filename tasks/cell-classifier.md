# Cell Classifier

> **Audience:** coding agent. **Status:** not started.
> **Read first:** `docs/ARCHITECTURE.md`, `CLAUDE.md`, `tasks/shared-game-features.md`.
> **Replaces:** `tasks/cell.txt`. Original note (Spanish), translated: *"A new game where you have to know how to classify cell components. Both: you have to say which component is the one highlighted, and you have to be able to mark the components you're asked for."*
> **Shared pieces needed:** `Autocomplete` + `lib/text.ts` (hard mode), `Toast`, daily pattern, `StatsPanel`, `StreakBadge`, `ShareButton`, `NextDailyCountdown`. Build any that are missing per `shared-game-features.md` §4.

---

## 1. Concept

A 10-question quiz on **interactive cell diagrams** (animal, plant, bacterium), mixing the two question types from the original note:
- **Name it:** a structure is highlighted; say what it is.
- **Find it:** "Click the **Golgi apparatus**"; click the right structure on the diagram.

After every answer, a one-line function fact teaches you what the structure does. Score out of 10.

**Player-facing description (menu):**
> How well do you know your organelles? Each round has **10 questions** on animal and plant cells:
> **Name it**: a structure lights up, you pick its name. **Find it**: we name a structure, you click it on the cell.
> Score 8 or more to keep your streak alive. 🔥
> **Hard Mode**: type the names yourself, add bacteria and the tiny organelles, and no study diagrams.

Registry: slug `cell-classifier`, title "Cell Classifier", brand `["CELL", "CLASSIFIER"]`, `daily: true`.

**Brainstormed additions:** labeled "Study diagrams" as the Cheat Sheet; the mandatory *powerhouse of the cell* meme; a stretch "Which cell is it?" round that makes the name literal (classify the cell type from its parts).

---

## 2. Diagrams (the core asset): authored as React SVG components

There are no images for this game in the repo, so **you author the diagrams** as SVG React components. That's what makes highlighting and hit-testing trivial.

`games/cell-classifier/diagrams/AnimalCell.tsx`, `PlantCell.tsx`, `BacterialCell.tsx`, sharing one props contract:
```ts
interface CellDiagramProps {
  highlight?: string | null;   // part id to glow (Name-it question)
  correct?: string | null;     // part id flashed green after an answer
  wrong?: string | null;       // part id flashed red (the player's wrong click)
  onPartClick?: (partId: string) => void;   // Find-it mode; undefined = not clickable
  showLabels?: boolean;        // Study mode only
}
```
**Contract (document it in a comment at the top of each file, so the user or an artist can redraw the art later):** every structure is a `<g data-part="<partId>">`; repeated structures (several mitochondria, many ribosomes) share the same `data-part`, and highlighting applies to all of them.

Art direction:
- `viewBox="0 0 400 300"`, scales to container width (max ~520px), and looks good on the dark navy page background.
- Flat, friendly, textbook-like shapes. One distinct color per structure type. Highlight = bright outline + glow (`drop-shadow` filter) + slight pulse; respect `prefers-reduced-motion`.
- **Animal cell:** irregular rounded membrane; nucleus with nucleolus + nuclear envelope; rough ER (dotted with ribosomes) wrapping the nucleus; smooth ER (tubes); Golgi stack; several mitochondria (with cristae squiggles); lysosomes; free ribosome dots; a pair of centrioles; vesicles; peroxisome.
- **Plant cell:** rounded-rectangle cell wall around the membrane; big central vacuole; several chloroplasts (with thylakoid stacks); nucleus etc.; plasmodesmata as small gaps/channels in the wall.
- **Bacterium:** rod/capsule shape: capsule (outer halo), cell wall, plasma membrane, coiled nucleoid DNA, 1–2 small plasmid rings, ribosome dots, a long flagellum, short pili.
- **Hit-testing:** organelles are drawn above the cytoplasm, so clicking empty interior = cytoplasm. Membrane/wall/capsule outlines get invisible wide-stroke hit paths (≥ 12px). Tiny parts (ribosomes, centrioles, plasmids, pili) get invisible enlarged hit shapes (≥ 24px at mobile scale).
- Labels (Study mode): leader lines + text in a legend layout that doesn't cover parts.

Visual check: if a browser tool is available, screenshot all three diagrams and fix anything unreadable. Otherwise flag "diagrams not visually verified" in the report.

---

## 3. Data: `games/cell-classifier/data/parts.ts`

```ts
type CellType = "animal" | "plant" | "bacteria";
interface CellPart {
  id: string;            // "golgi"
  name: string;          // "Golgi apparatus"
  aliases: string[];     // ["golgi", "golgi body", "golgi complex"]
  cells: CellType[];     // which diagrams contain it
  difficulty: 1 | 2 | 3;
  fn: string;            // one-line function, accurate, ≤ 110 chars
}
```
Starting set (verify each `fn` for accuracy; numbers are difficulty):

| id | name | cells | diff |
|---|---|---|---|
| cell_membrane | Cell membrane (plasma membrane) | animal, plant, bacteria | 1 |
| cytoplasm | Cytoplasm | all | 1 |
| nucleus | Nucleus | animal, plant | 1 |
| nucleolus | Nucleolus | animal, plant | 2 |
| nuclear_envelope | Nuclear envelope | animal, plant | 2 |
| mitochondrion | Mitochondrion | animal, plant | 1 |
| rough_er | Rough endoplasmic reticulum | animal, plant | 2 |
| smooth_er | Smooth endoplasmic reticulum | animal, plant | 2 |
| golgi | Golgi apparatus | animal, plant | 1 |
| lysosome | Lysosome | animal | 2 |
| ribosome | Ribosome | all | 2 |
| centriole | Centrioles | animal | 3 |
| vesicle | Vesicle | animal, plant | 3 |
| peroxisome | Peroxisome | animal, plant | 3 |
| cell_wall | Cell wall | plant, bacteria | 1 |
| chloroplast | Chloroplast | plant | 1 |
| central_vacuole | Central vacuole | plant | 1 |
| plasmodesmata | Plasmodesmata | plant | 3 |
| capsule | Capsule | bacteria | 2 |
| nucleoid | Nucleoid | bacteria | 2 |
| plasmid | Plasmid | bacteria | 2 |
| flagellum | Flagellum | bacteria | 1 |
| pili | Pili | bacteria | 3 |

Mandatory meme: `mitochondrion.fn` = "Produces most of the cell's ATP through cellular respiration: the powerhouse of the cell ⚡".

Integrity tests: every part id appears as a `data-part` in each diagram listed in its `cells` (parse the components' rendered markup with `react-dom/server` `renderToStaticMarkup`), and diagrams have no unknown `data-part`s. Aliases are unique across parts.

---

## 4. Rules & question generation (`logic/questions.ts`, pure)

- Round = `ROUND_SIZE = 10` questions, each `{ type: "name" | "find"; cell: CellType; partId: string }`.
- Pool: normal mode = animal + plant, difficulty ≤ 2. Hard mode = all three cells, all difficulties.
- Generation with an `Rng`: about half "name" and half "find" (5/5 ± 1); no repeated `(cell, partId)` pair; a part appears at most twice per round; spread across cell types.
- **Name it, normal:** 4 multiple-choice buttons = correct + 3 distractors from the same cell's parts (prefer similar difficulty). Keys `1`–`4` select.
- **Name it, hard:** typed answer with `Autocomplete` **with suggestions off** (`suggestions={false}`). Accepted if `findExact` matches the name or an alias (normalized, case/diacritics-insensitive). Unknown text → toast "That's not a cell part we know", no penalty, try again.
- **Find it:** the diagram's `onPartClick`; clicking the right `data-part` = correct.
- After each answer: correct → green flash + "✅ {name}: {fn}"; wrong → red flash on the wrong pick, the correct part glows green, "❌ It was the {name}: {fn}". A "Next ▶" button (Enter/Space) advances; no auto-advance (people should read the fact).
- Score = correct answers. **Win (for stats/streak) = score ≥ `PASS_SCORE = 8`.**
- Give up (🏳️ + confirm) ends the round; unanswered questions count as wrong.

---

## 5. Implementation steps

### Step 1: Parts catalog + diagrams
`parts.ts`, the three diagram components, a dev-only preview of all three with labels on (Study mode doubles as this), and the integrity tests from §3.

### Step 2: Find it
One hardcoded question, then a generated round of find-only questions: prompt banner ("🔎 Click the **Golgi apparatus**"), click handling, feedback, Next, score. Pure reducer in `logic/reducer.ts`.

### Step 3: Name it (multiple choice)
Highlight + 4 options; mixed rounds via `logic/questions.ts`.

### Step 4: End of round
`GameOverModal`: title "You Won! 🎉" for ≥ 8, otherwise "You Lost 🥀" (consistent with the other games). Score, a per-question recap list (✅/❌ + part name, click to re-highlight it), message from the pools:
- 10: "Perfect. Mitochondria is the powerhouse of the cell and you are the powerhouse of this quiz."
- 8–9: "Cellular excellence. Only a few ribosomes out of place."
- 5–7: "Mid. Your cell is functional, just not thriving."
- 1–4: "Your organelles are in shambles. Vayan a estudiar."
- 0: "0/10. Are you sure you're not a virus? They don't have cells either."
- Plus the Taxo-style hard-mode follow-ups, adapted.

### Step 5: Study diagrams (Cheat Sheet) + Hard Mode
- "📖 Study diagrams" button: a `Modal` with tabs Animal / Plant / Bacterium, each `showLabels`, plus a legend list of `name: fn`.
- Hard Mode toggle on the menu (locked per round): typed Name-it, bacteria + difficulty 3, Study disabled with tooltip *"Your Golgi apparatus should have packaged this knowledge already."*

### Step 6: Daily challenge, stats, streak, share
- `shared-game-features.md` §3. Questions = `generateRound(createRng(dailySeed("cell-classifier", dayKey)), hardMode)`. Hard and normal dailies differ; that's fine, they're seeded by mode too (append `:hard` to the seed string).
- State:
  ```ts
  interface CellDailyState extends DailyStateBase<{ hardMode: boolean }> {
    questions: { type: "name" | "find"; cell: string; partId: string }[];
    answers: { correct: boolean; given: string | null }[];   // per answered question
  }
  ```
- Stats buckets `"0"`…`"10"`; won = score ≥ 8.
- Share:
  ```
  Cell Classifier #5 🔬 9/10 💀 Hard
  🟩🟩🟥🟩🟩🟩🟩🟩🟩🟩
  https://bio-games.vercel.app/cell-classifier
  ```

### Step 7 (stretch): "Which cell is it?" bonus question type
Show a list of 3 structures (e.g. Cell wall · Chloroplast · Nucleus) → answer Animal / Plant / Bacterium. Generate only combinations whose answer is **unique** under the catalog (cell wall + nucleus → plant; nucleoid → bacteria; centrioles + lysosome → animal). Unit-test the uniqueness check. Add it to rounds as 1–2 of the 10 questions only after Steps 1–6 are solid.

---

## 6. Files
```
app/cell-classifier/page.tsx
games/cell-classifier/
  CellClassifierGame.tsx
  config.ts                         # ROUND_SIZE, PASS_SCORE, pools per mode
  data/parts.ts
  diagrams/AnimalCell.tsx, PlantCell.tsx, BacterialCell.tsx, CellDiagram.tsx (switch by type), diagrams.test.tsx
  logic/questions.ts, reducer.ts, daily.ts, share.ts, messages.ts  (+ tests)
  components/QuestionBanner.tsx, ChoiceButtons.tsx, AnswerFeedback.tsx, RoundRecap.tsx, StudyModal.tsx, CellMenuOptions.tsx
public/assets/img/covers/{card,menu}/cell-classifier.svg    # placeholder art (a mini version of the animal cell works well)
```

## 7. Tests & acceptance
- Question generation: size 10, type balance, no duplicate pairs, mode pools respected, deterministic per seed.
- Reducer: correct/incorrect for both types, typed-answer normalization + aliases, unknown text = no penalty, give up, final score, win threshold.
- Diagram/catalog integrity (§3).
- Manual: every part in every diagram is clickable on a 360px-wide screen; the highlight is clearly visible; Study mode labels are readable; hard mode accepts "golgi body" for the Golgi apparatus.

## 8. [USER DECISION] items to flag
- The diagrams are agent-drawn placeholders; the user may want to commission or draw nicer art (same `data-part` contract).
- `PASS_SCORE = 8` as the "win" threshold.
- Review the `fn` texts and the new joke lines.
