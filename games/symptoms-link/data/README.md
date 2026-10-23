# Symptoms Link Dataset (`diseases.json`)

This file documents the content rules for `games/symptoms-link/data/diseases.json` so you can review or add diseases later.

## Schema

```ts
interface Disease {
  id: string;                     // snake_case identifier, e.g. "tuberculosis"
  name: string;                   // Display name, e.g. "Tuberculosis"
  aliases: string[];              // Common abbreviations & lay names, e.g. ["TB", "consumption"]
  category: DiseaseCategory;
  emoji: string;                  // Shown on the diagnosis card
  symptoms: [string, string, string, string, string]; // 5 symptoms ordered VAGUE -> TELLTALE
  cause?: { label: string; organismId?: string };     // organismId references data/organisms.ts
  vector?: { label: string; organismId?: string };
  fact: string;                   // One-line educational summary shown after the game
  difficulty: 1 | 2 | 3;          // 1 = general knowledge, 2 = bio student, 3 = med-student territory
  icon?: string;                  // Optional custom art path
}
```

## Content Rules

1. **Textbook presentations only:** Use well-established clinical features.
2. **Ordered vague → telltale:**
   - Symptom 1 is broad and shared by many conditions (`"High fever and chills"`, `"Chronic fatigue"`).
   - Symptoms 2–4 progressively narrow down the organ system and mechanism.
   - Symptom 5 is the classic textbook hallmark (`"Expanding bull's-eye skin rash"`, `"White spots inside cheek (Koplik spots)"`, `"Profuse rice-water diarrhea"`).
3. **No giveaways in symptoms:** No symptom may contain the disease `name` or any of its `aliases` (normalized substring check enforced in `diseases.test.ts`).
4. **Concise phrasing:** Each symptom must be `≤ 45` characters, in plain language with medical terms in parentheses when helpful.
5. **Taxo Bingo organism links:** Whenever a pathogen or vector exists in `data/organisms.json`, set `organismId` so the post-game Diagnosis Card displays its photo and binomial name.
