import { createClient } from "@supabase/supabase-js";

// Public, browser-safe client. Uses the anon key, which is restricted by
// Row Level Security to reading non-deleted playdates only (see
// supabase/schema.sql). Never import supabaseAdmin.ts into client code.
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
