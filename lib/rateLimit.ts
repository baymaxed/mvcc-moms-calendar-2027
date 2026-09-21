import { supabaseAdmin } from "@/lib/supabaseAdmin";

const WINDOW_MINUTES = 15;
const MAX_ATTEMPTS = 5;

// Simple table-backed rate limit for the passcode endpoint: blocks an IP
// after MAX_ATTEMPTS failed tries inside WINDOW_MINUTES. Deliberately
// table-backed rather than in-memory since serverless functions don't share
// memory between invocations.
export async function isRateLimited(ip: string): Promise<boolean> {
  const since = new Date(Date.now() - WINDOW_MINUTES * 60 * 1000).toISOString();

  const { count, error } = await supabaseAdmin
    .from("login_attempts")
    .select("id", { count: "exact", head: true })
    .eq("ip_address", ip)
    .eq("success", false)
    .gte("attempted_at", since);

  if (error) {
    // Fail closed on the safe side is tempting, but a Supabase hiccup
    // shouldn't lock every DGL out - fail open and log.
    console.error("rate limit check failed", error);
    return false;
  }

  return (count ?? 0) >= MAX_ATTEMPTS;
}

export async function recordAttempt(ip: string, success: boolean) {
  await supabaseAdmin.from("login_attempts").insert({ ip_address: ip, success });
}

export function getClientIp(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return headers.get("x-real-ip") || "unknown";
}
