import { NextResponse } from "next/server";
import { validateNextRequest } from "@/games/bio-guesser/api/validate";
import { processNextRequest } from "@/games/bio-guesser/engine";

export async function POST(request: Request): Promise<NextResponse> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  const valid = validateNextRequest(body);
  if (!valid) {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  const result = await processNextRequest(valid);
  return NextResponse.json(result.body, { status: result.status });
}

