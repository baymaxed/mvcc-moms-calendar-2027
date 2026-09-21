import "server-only";
import { createClient } from "@supabase/supabase-js";

// Server-only client using the service-role key, which bypasses Row Level
// Security entirely. Only ever import this inside app/api/** route handlers.
// The `server-only` import above makes it a build error to accidentally
// pull this into a client component.
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
);
