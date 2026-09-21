import { NextRequest, NextResponse } from "next/server";
import { isRateLimited, recordAttempt, getClientIp } from "@/lib/rateLimit";

// Checks a submitted passcode against the server-only DGL_PASSCODE env var.
// This never returns a reusable token - the client just re-sends the code
// on every write, and every write route re-validates it independently.
// localStorage on the client only remembers "this device entered the code
// before" for convenience; it is not treated as authentication anywhere.
export async function POST(req: NextRequest) {
  const ip = getClientIp(req.headers);

  if (await isRateLimited(ip)) {
    return NextResponse.json(
      { ok: false, error: "Too many attempts. Try again in a few minutes." },
      { status: 429 }
    );
  }

  const { code } = await req.json().catch(() => ({ code: "" }));
  const valid = typeof code === "string" && code === process.env.DGL_PASSCODE;

  await recordAttempt(ip, valid);

  if (!valid) {
    return NextResponse.json({ ok: false, error: "Incorrect code." }, { status: 401 });
  }

  return NextResponse.json({ ok: true });
}
