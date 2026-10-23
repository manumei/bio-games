# Symptoms Link

> **Audience:** coding agent. **Status:** not started.
> **Read first:** `docs/ARCHITECTURE.md`, `CLAUDE.md`, `tasks/shared-game-features.md`.
> **Replaces:** `tasks/link.txt` (plus the old note "add icons for the diseases and the symptoms" from `public/assets/img/games/symptoms/deleteme.txt`).
> **Shared pieces needed:** `Autocomplete` + `lib/text.ts`, `Toast`, daily pattern, `StatsPanel`, `StreakBadge`, `ShareButton`, `NextDailyCountdown`. Build any that are missing per `shared-game-features.md` §4.

---

## 1. Concept

Guess the **disease** that links all the symptoms. Five symptom panels; only the first is visible at the start. Each wrong guess, or a **Skip**, reveals the next symptom. Once all five are visible, Skip turns into **Give up**, and you get one final guess: wrong (or giving up) means you lose. Fewer symptoms needed = better.

**Player-facing description (menu), from the original notes, lightly edited:**
> In **Symptoms Link** you must prove your diagnosing skills: guess the **disease** that connects all the given symptoms.
> The game starts by showing one symptom. You can guess a disease or skip to see more. Once all five symptoms are revealed, you have one final guess to make.
> **Hard Mode**: no disease-category hint and no glossary.
> *For learning and fun, not medical advice.*

Registry: slug `symptoms-link`, title "Symptoms Link", brand `["SYMPTOMS", "LINK"]`, `daily: true`.

**Brainstormed additions:** symptoms ordered from vague to telltale so early guesses feel like real deduction; a category hint after symptom 3; a "Diagnosis" card at the end showing the cause **with its image from the Taxo Bingo dataset** (*Yersinia pestis* for plague, *Ixodes scapularis* as the Lyme vector); Dr. House jokes ("It's never lupus"); a Framed-style share line.

---

## 2. Rules (precise)

- `stage` = number of revealed symptoms, 1…5. Start at 1.
- **Guess** (stage s):
  - Input that doesn't match a known disease (label or alias, normalized) → toast **"Not in our disease list"**. No penalty.
  - Already-guessed disease → toast **"Already tried that one"**. No penalty.
  - Correct → **win** with score s.
  - Wrong and s < 5 → add to the wrong-guesses list, `stage = s + 1`, toast **"Incorrect"** (the notes' Step 2 message).
  - Wrong and s = 5 → **loss**.
- **Skip** (s < 5) → `stage = s + 1` (logged as a skip).
- At s = 5 the Skip button becomes **Give up** (🏳️) → `ConfirmDialog` → **loss**.
- Easter egg: a wrong guess of "Lupus" shows the toast **"It's never lupus."** instead of "Incorrect".
- No timer.

---

## 3. Data

`games/symptoms-link/data/diseases.json`, typed loader `diseases.ts`:

```ts
type DiseaseCategory =
  | "viral" | "bacterial" | "parasitic" | "fungal" | "genetic" | "autoimmune"
  | "metabolic" | "cardiovascular" | "respiratory" | "neurological" | "nutritional" | "other";

interface Disease {
  id: string;                     // "tuberculosis"
  name: string;                   // "Tuberculosis"
  aliases: string[];              // ["TB", "consumption"]
  category: DiseaseCategory;
  emoji: string;                  // shown on the diagnosis card
  symptoms: [string, string, string, string, string]; // ordered VAGUE → TELLTALE
  cause?: { label: string; organismId?: string };     // organismId = id in data/organisms.ts
  vector?: { label: string; organismId?: string };
  fact: string;                   // one line, shown after the game
  difficulty: 1 | 2 | 3;          // 1 = everyone knows it, 3 = med-student territory
  icon?: string;                  // optional future art: /assets/webp/games/symptoms-link/<id>.webp
}
```
Category labels + emoji live in `config.ts` (e.g. viral 🧬 "Viral infection", bacterial 🦠 "Bacterial infection", parasitic 🪱 "Parasitic disease", genetic 🧬 "Genetic disorder"…).

**Content rules (accuracy matters, this is a learning game):**
- Use well-established textbook features only. No rare presentations.
- Symptom 1 is generic and shared by many diseases (fever, fatigue, headache). Symptom 5 is the hallmark (Koplik spots → measles, rice-water diarrhea → cholera, bull's-eye rash → Lyme, lockjaw → tetanus, bloody sputum + night sweats → TB). Symptoms 2–4 narrow down gradually.
- No symptom may contain the disease name, its pathogen, or an obvious giveaway word (no "malarial", no "tubercles").
- Short wording (≤ 45 chars), plain language, with the medical term in parentheses when it teaches something: "Yellowing of the skin (jaundice)".
- Aliases: common abbreviations and lay names ("TB", "flu", "mono", "chickenpox"/"varicella", "heart attack"/"myocardial infarction").
- **Launch size: ≥ 60 diseases**, mixed categories, ~50% difficulty 1, ~35% difficulty 2, ~15% difficulty 3.

**Taxo tie-ins.** These pathogens/vectors already have images in `data/organisms.ts`; use their `organismId`s (verify the ids):
| Disease | Cause (organism in dataset) | Vector (in dataset) |
|---|---|---|
| Tuberculosis | *Mycobacterium tuberculosis* | |
| Leprosy | *Mycobacterium leprae* | |
| Anthrax | *Bacillus anthracis* | |
| Lyme disease | *Borrelia burgdorferi* | *Ixodes scapularis* (tick) |
| Rocky Mountain spotted fever | *Rickettsia rickettsii* | *Dermacentor variabilis* (tick) |
| Plague | *Yersinia pestis* | (rat flea, not in dataset, label only) |
| Cholera | *Vibrio cholerae* | |
| Tetanus / Botulism | *Clostridium tetani* / *C. botulinum* | |
| Syphilis / Gonorrhea | *Treponema pallidum* / *Neisseria gonorrhoeae* | |
| Legionnaires' disease | *Legionella pneumophila* | |
| Listeriosis | *Listeria monocytogenes* | |
| Typhoid fever | *Salmonella enterica* | |
| Shigellosis (dysentery) | *Shigella dysenteriae* | |
| Strep throat / Scarlet fever | *Streptococcus pyogenes* | |
| Pneumococcal pneumonia | *Streptococcus pneumoniae* | |
| C. diff colitis | *Clostridium difficile* | |
| Malaria | *Plasmodium falciparum* | *Anopheles gambiae* |
| African sleeping sickness | *Trypanosoma brucei* | *Glossina morsitans* (tsetse) |
| Toxoplasmosis | *Toxoplasma gondii* | |
| Primary amoebic meningoencephalitis | *Naegleria fowleri* | |
| Dengue / Yellow fever / Zika | (virus, label only) | *Aedes aegypti* |
| Ascariasis / Pinworm / Hookworm / Trichinosis | *Ascaris lumbricoides* / *Enterobius vermicularis* / *Ancylostoma duodenale* / *Trichinella spiralis* | |
| Schistosomiasis / Cysticercosis / Hydatid disease | *Schistosoma mansoni* / *Taenia solium* / *Echinococcus granulosus* | |
| Scabies | *Sarcoptes scabiei* | |
| River blindness | (Onchocerca volvulus, label only) | *Simulium damnosum* (black fly) |

Fill the rest with well-known non-infectious and viral conditions (measles, chickenpox, mumps, influenza, COVID-19, rabies, polio, HIV/AIDS, hepatitis A/B, mononucleosis, type 1 diabetes, hypothyroidism, Graves' disease, iron-deficiency anemia, sickle cell disease, cystic fibrosis, hemophilia, asthma, appendicitis, gout, migraine, Parkinson's, Alzheimer's, multiple sclerosis, **lupus** (needed for the joke), rheumatoid arthritis, celiac disease, scurvy, rickets, kidney stones, heart attack, stroke…).

Write `games/symptoms-link/data/README.md` with the content rules above, so the user can add diseases later.

---

## 4. Implementation steps

Steps 1–5 keep the original notes' numbering; Step 0 comes first because the layout needs data.

### Step 0: Dataset + loader + integrity tests
`diseases.json` per §3; tests: unique ids; exactly 5 symptoms, each ≤ 45 chars; no symptom contains the disease name or an alias (normalized substring check); every `organismId` exists in `ORGANISMS`; aliases don't collide across diseases; ≥ 60 entries.

### Step 1: Basic layout
- "Patient chart" look: a panel with header "🩺 Patient #N" (daily number; "Practice patient" in practice). A mystery card at the top: "❓ Mystery disease".
- Five numbered symptom panels stacked vertically. Revealed panels show the symptom text with a short fade-in; unrevealed panels are empty/locked ("🔒 Symptom 3").
- At start only symptom 1 shows.
- Below the panels: the input row and the Skip/Give-up button. Under that: wrong guesses as crossed-out chips.

### Step 2: Guessing reveals the next symptom
Implement the guess rules in §2 in a pure reducer (`logic/reducer.ts`). The "Incorrect" toast is the notes' placeholder message; keep it.

### Step 3: Skip button
Skip reveals the next symptom; at stage 5 it becomes **Give up** (🏳️ + label) with a confirm dialog.

### Step 4: Guessing correctly wins
→ `GameOverModal` "You Won! 🎉" (content in Step 8).

### Step 5: Losing
Wrong guess at stage 5, or a confirmed give-up → "You Lost 🥀".

### Step 6: Autocomplete
Use the shared `Autocomplete` with `items = diseases.map(d => ({ id, label: d.name, aliases: d.aliases }))`, `minChars: 3`. Unknown text → the "Not in our disease list" toast (§2).

### Step 7: Category hint, glossary, Hard Mode
- **Category hint** (normal mode): once stage ≥ 3, a chip appears under the mystery card: "🦠 Bacterial infection".
- **Disease glossary** (the Cheat Sheet equivalent): a button opens a `Modal` listing every disease name grouped by category (names only, no symptoms). It helps recall, and doesn't give answers away more than autocomplete does.
- **Hard Mode** (menu toggle, locked per game): no category hint, glossary button disabled with tooltip *"Real doctors don't get a cheat sheet either. Well… they have Google."*

### Step 8: Diagnosis card (end of game, win or lose)
Inside `GameOverModal`:
- Disease emoji + name + category chip.
- All 5 symptoms listed (the ones the player never saw are marked "unseen").
- **Cause / Vector**: if `organismId` is set, show the organism's image (from `getOrganism(id).image`) + its scientific name, e.g. "Caused by *Yersinia pestis*", "Spread by *Ixodes scapularis*". That's the cross-game link.
- `fact` line.
- Message pools (`logic/messages.ts`, list them in the report for review):
  - Win at 1: "Diagnosed from ONE symptom. Dr. House is unemployed now."
  - Win at 2: "Two symptoms and you already called it. Med school wants your number."
  - Win at 3: "Solid diagnosis, doctor."
  - Win at 4: "Took a few tests, but the patient lives."
  - Win at 5: "Last-second diagnosis. The patient was flatlining, but we take those."
  - Loss: "It was {Disease}. The patient did not make it 🥀" · "It was {Disease}. Vayan a estudiar (medicina)." · if the answer **is** lupus: "It's never lupus… except today it was."
  - Plus the Taxo-style hard-mode follow-up lines, adapted.

### Step 9: Daily challenge, stats, streak, share
- Follow `shared-game-features.md` §3. State:
  ```ts
  interface LinkDailyState extends DailyStateBase<{ hardMode: boolean }> {
    diseaseId: string;
    stage: number;                                         // 1..5
    log: { kind: "wrong" | "skip"; diseaseId?: string }[];  // in order
  }
  ```
- Schedule: `shuffle(diseases with difficulty ≤ 2, createRng("symptoms-link:schedule:v1"))`, day n → index `n mod length`. Practice: random from **all** diseases.
- Stats buckets `"1"`…`"5"`, `"X"`.
- Share text (🟥 wrong guess, 🟨 skip, 🟩 solved, ⬜ never needed):
  ```
  Symptoms Link #12 🩺 3/5 💀 Hard
  🟥🟨🟩⬜⬜
  https://bio-games.vercel.app/symptoms-link
  ```
  Loss: `X/5` and five non-green squares.

---

## 5. Files

```
app/symptoms-link/page.tsx
games/symptoms-link/
  SymptomsLinkGame.tsx
  config.ts                        # categories (label, emoji), HINT_STAGE=3, MAX_STAGE=5
  data/diseases.json, data/diseases.ts, data/README.md
  logic/reducer.ts, schedule.ts, daily.ts, share.ts, messages.ts  (+ tests)
  components/PatientChart.tsx, SymptomPanel.tsx, WrongGuesses.tsx, DiagnosisCard.tsx, Glossary.tsx, LinkMenuOptions.tsx
public/assets/img/covers/{card,menu}/symptoms-link.svg   # placeholder art if none provided
```

## 6. Tests & acceptance
- Reducer: every rule in §2 (including no-penalty cases, the lupus toast, Give up only at stage 5, no input after game over).
- Schedule determinism; daily restore (resume at the right stage, finished, abandoned → loss); share text examples above.
- Manual: guess wrong ×4 then right → win at 5; skip ×4 → Give up appears → confirm → loss; misspelled input → toast, no stage change; autocomplete with "tub" → Tuberculosis; diagnosis card shows the *Mycobacterium tuberculosis* image; hard mode hides the hint and glossary.

## 7. [USER DECISION] items to flag
- Review `diseases.json` (accuracy + symptom ordering). This is the most important review in this game.
- New joke lines.
- Whether the daily should include difficulty-3 diseases.
