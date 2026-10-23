# Bio Guesser — Guessing Engine API Specification

This document defines the stateless HTTP API contract between the BioGames Next.js frontend and the Bio Guesser guessing engine (implemented in Python / FastAPI or equivalent).

---

## 1. Architecture & Protocol

The guessing engine is completely **stateless**. The frontend transmits the entire conversation history (all answered questions and rejected organism IDs) in every request payload. This design guarantees resilience across serverless lambdas, worker restarts, and horizontal autoscaling.

```
+--------------------+        POST /api/bio-guesser/next         +--------------------+
|                    | ----------------------------------------> |                    |
|   Next.js Client   |                                           |   Next.js API      |
|  (BioGuesserGame)  | <---------------------------------------- |   Route Handler    |
|                    |             NextResponse JSON             |                    |
+--------------------+                                           +--------------------+
                                                                            |
                                                    Proxy if env var set    |
                                              (BIO_GUESSER_ENGINE_URL)      v
                                                                 +--------------------+
                                                                 |   External Engine  |
                                                                 |  (Python / FastAPI)|
                                                                 +--------------------+
```

- When `BIO_GUESSER_ENGINE_URL` is configured in the environment, the Next.js Route Handler proxies requests to `${BIO_GUESSER_ENGINE_URL}/next` and `${BIO_GUESSER_ENGINE_URL}/feedback` with an 8-second timeout (`AbortSignal.timeout(8000)`).
- When `BIO_GUESSER_ENGINE_URL` is unset, the Next.js layer executes the built-in pure TypeScript mock engine (`games/bio-guesser/engine/mock.ts`).

---

## 2. Endpoints

### 2.1 Next Step: `POST /next`

Calculates the next step: either ask a question, make an organism guess, or give up.

#### Request Headers
```http
Content-Type: application/json
```

#### Request Body (`NextRequest`)
```json
{
  "answers": [
    { "questionId": "is_animalia", "answer": "yes" },
    { "questionId": "is_chordata", "answer": "yes" },
    { "questionId": "is_mammalia", "answer": "probably" }
  ],
  "rejectedGuesses": [
    "canis_lupus"
  ]
}
```

- `answers`: Array of `≤ 100` answered questions in chronological order.
  - `questionId`: Alphanumeric slug `^[a-z0-9_]{1,64}$`.
  - `answer`: One of `"yes" | "no" | "probably" | "probably_not" | "dont_know"`.
- `rejectedGuesses`: Array of `≤ 20` organism IDs that the player previously rejected with "Nope".

#### Response 1: Ask Question (`kind: "question"`, HTTP 200)
```json
{
  "kind": "question",
  "question": {
    "id": "is_carnivora",
    "text": "Is it a carnivoran mammal with sharp claws and teeth, like a cat, dog, bear, or seal?"
  },
  "progress": 0.65
}
```
- `progress`: Number between `0.0` and `1.0` representing normalized certainty (entropy reduction).

#### Response 2: Make Guess (`kind: "guess"`, HTTP 200)
```json
{
  "kind": "guess",
  "guess": {
    "id": "panthera_leo",
    "name": "Panthera leo",
    "commonName": "Lion",
    "image": "/assets/webp/taxo/animalia/chordata/mammalia/carnivora/panthera_leo.webp"
  },
  "confidence": 0.82
}
```
- `id`: Unique organism ID matching Taxo / BioGames dataset.
- `name`: Scientific binomial name.
- `commonName`: Optional English common name (e.g. "Lion", "Tiger").
- `image`: URL or relative path under `/assets/webp/` to the organism image, or `null`.
- `confidence`: Number between `0.0` and `1.0` representing engine confidence in the guess.

#### Response 3: Give Up (`kind: "give_up"`, HTTP 200)
Returned when `rejectedGuesses.length >= 5` or when the engine has exhausted candidate traits without reaching confidence:
```json
{
  "kind": "give_up"
}
```

---

### 2.2 Submit Feedback: `POST /feedback`

Called when a game concludes (either guessed correctly or player revealed the secret organism).

#### Request Body (`FeedbackRequest`)
```json
{
  "answers": [
    { "questionId": "is_animalia", "answer": "yes" },
    { "questionId": "is_chordata", "answer": "yes" }
  ],
  "rejectedGuesses": ["canis_lupus"],
  "outcome": "guessed",
  "finalGuessId": "panthera_leo",
  "actual": { "id": "panthera_leo" }
}
```

If the player stumped the engine and typed a custom name:
```json
{
  "answers": [...],
  "rejectedGuesses": [...],
  "outcome": "not_guessed",
  "finalGuessId": null,
  "actual": { "name": "Platypus" }
}
```

If the player skipped revealing:
```json
{
  "answers": [...],
  "rejectedGuesses": [...],
  "outcome": "not_guessed",
  "finalGuessId": null,
  "actual": null
}
```

#### Response
HTTP 204 No Content.

---

## 3. Answer Semantics & Soft Weighting

To prevent a single erroneous player answer from eliminating the true target (Akinator-style robustness), the engine uses soft probabilistic Bayesian weighting rather than hard boolean filtering:

| Answer | Has Trait = True | Has Trait = False |
|---|---|---|
| `yes` | × 1.00 | × 0.02 |
| `no` | × 0.02 | × 1.00 |
| `probably` | × 0.80 | × 0.25 |
| `probably_not` | × 0.25 | × 0.80 |
| `dont_know` | × 1.00 | × 1.00 |

Rejected guesses receive weight `0.0`.

---

## 4. Performance & SLA

- **Target latency**: `< 200 ms` for local engine; `< 1500 ms` for external cloud services.
- **Timeout**: The Next.js API route aborts upstream requests after `8000 ms` (8 seconds) and returns HTTP 502 `{ "error": "engine_unavailable" }`.

---

## 5. Local Development & Testing

1. Start your Python backend on port 8000:
   ```bash
   uvicorn main:app --port 8000
   ```
2. In `.env.local` in this repo, set:
   ```env
   BIO_GUESSER_ENGINE_URL=http://localhost:8000
   ```
3. Run the Next.js dev server:
   ```bash
   npm run dev
   ```
4. If you leave `BIO_GUESSER_ENGINE_URL` empty or unset, the site automatically falls back to the built-in TypeScript mock engine (`games/bio-guesser/engine/mock.ts`).

