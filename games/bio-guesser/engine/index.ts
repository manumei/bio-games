import "server-only";

import { ENGINE_TIMEOUT_MS } from "../config";
import type { FeedbackRequest, NextRequest, NextResponse } from "../api/types";
import { nextStep } from "./mock";

export async function processNextRequest(
  req: NextRequest,
): Promise<{ status: number; body: NextResponse | { error: string } }> {
  const engineUrl = process.env.BIO_GUESSER_ENGINE_URL?.trim();

  if (engineUrl) {
    try {
      const target = `${engineUrl.replace(/\/+$/, "")}/next`;
      const res = await fetch(target, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(req),
        signal: AbortSignal.timeout(ENGINE_TIMEOUT_MS),
      });

      if (!res.ok) {
        return {
          status: 502,
          body: { error: "engine_unavailable" },
        };
      }

      const data = (await res.json()) as NextResponse;
      return { status: 200, body: data };
    } catch {
      return {
        status: 502,
        body: { error: "engine_unavailable" },
      };
    }
  }

  // Use TypeScript mock engine
  const result = nextStep(req);
  return { status: 200, body: result };
}

export async function processFeedbackRequest(
  req: FeedbackRequest,
): Promise<{ status: number; body?: { error: string } }> {
  const engineUrl = process.env.BIO_GUESSER_ENGINE_URL?.trim();

  if (engineUrl) {
    try {
      const target = `${engineUrl.replace(/\/+$/, "")}/feedback`;
      const res = await fetch(target, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(req),
        signal: AbortSignal.timeout(ENGINE_TIMEOUT_MS),
      });

      if (!res.ok) {
        return { status: 502, body: { error: "engine_unavailable" } };
      }

      return { status: 204 };
    } catch {
      return { status: 502, body: { error: "engine_unavailable" } };
    }
  }

  // Log in dev
  if (process.env.NODE_ENV !== "production") {
    console.log("[BioGuesser Feedback]", req);
  }

  return { status: 204 };
}

