import { afterEach, describe, expect, it } from "vitest";
import { POST as nextHandler } from "./next/route";
import { POST as feedbackHandler } from "./feedback/route";

describe("Bio Guesser Route Handlers", () => {
  const originalEnv = process.env.BIO_GUESSER_ENGINE_URL;

  afterEach(() => {
    if (originalEnv === undefined) {
      delete process.env.BIO_GUESSER_ENGINE_URL;
    } else {
      process.env.BIO_GUESSER_ENGINE_URL = originalEnv;
    }
  });

  it("POST /api/bio-guesser/next returns 200 with a question on first step", async () => {
    const req = new Request("http://localhost:3000/api/bio-guesser/next", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ answers: [], rejectedGuesses: [] }),
    });
    const res = await nextHandler(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.kind).toBe("question");
    expect(data.question.id).toMatch(/^is_/);
    expect(typeof data.progress).toBe("number");
  });

  it("POST /api/bio-guesser/next returns 400 on malformed input", async () => {
    const req = new Request("http://localhost:3000/api/bio-guesser/next", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ answers: "not an array" }),
    });
    const res = await nextHandler(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBe("bad_request");
  });

  it("POST /api/bio-guesser/feedback returns 204 on valid feedback", async () => {
    const req = new Request("http://localhost:3000/api/bio-guesser/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        answers: [],
        rejectedGuesses: [],
        outcome: "guessed",
        finalGuessId: "panthera_leo",
        actual: { id: "panthera_leo" },
      }),
    });
    const res = await feedbackHandler(req);
    expect(res.status).toBe(204);
  });

  it("returns 502 in proxy mode when engine is unreachable", async () => {
    // Port 9 is discard protocol / nothing listening
    process.env.BIO_GUESSER_ENGINE_URL = "http://127.0.0.1:9";
    const req = new Request("http://localhost:3000/api/bio-guesser/next", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ answers: [], rejectedGuesses: [] }),
    });
    const res = await nextHandler(req);
    expect(res.status).toBe(502);
    const data = await res.json();
    expect(data.error).toBe("engine_unavailable");
  });
});

