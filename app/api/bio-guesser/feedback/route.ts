import { NextResponse } from "next/server";
import { validateFeedbackRequest } from "@/games/bio-guesser/api/validate";
import { processFeedbackRequest } from "@/games/bio-guesser/engine";

export async function POST(request: Request): Promise<Response> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  const valid = validateFeedbackRequest(body);
  if (!valid) {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  const result = await processFeedbackRequest(valid);
  if (result.status === 502) {
    return NextResponse.json({ error: "engine_unavailable" }, { status: 502 });
  }

  return new Response(null, { status: 204 });
}

