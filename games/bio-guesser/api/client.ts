import type { FeedbackRequest, NextRequest, NextResponse } from "./types";

export type ClientFetchResult =
  | { ok: true; data: NextResponse }
  | { ok: false; error: "engine_unavailable" | "bad_request" | "network_error" };

export async function fetchNext(req: NextRequest): Promise<ClientFetchResult> {
  try {
    const res = await fetch("/api/bio-guesser/next", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req),
    });

    if (res.status === 400) {
      return { ok: false, error: "bad_request" };
    }

    if (res.status === 502 || !res.ok) {
      return { ok: false, error: "engine_unavailable" };
    }

    const data = (await res.json()) as NextResponse;
    return { ok: true, data };
  } catch {
    return { ok: false, error: "network_error" };
  }
}

export async function sendFeedback(req: FeedbackRequest): Promise<void> {
  try {
    await fetch("/api/bio-guesser/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req),
    });
  } catch {
    // Fire-and-forget; silently ignore
  }
}

