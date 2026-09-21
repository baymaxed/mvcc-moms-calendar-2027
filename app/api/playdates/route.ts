import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { isValidCode } from "@/lib/requireCode";
import type { PlaydateInput } from "@/types/playdate";

// Create a new playdate. Public reads happen directly against Supabase from
// the browser (see lib/supabaseClient.ts + RLS policy) - this route only
// ever handles the write.
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });

  const { code, ...fields } = body as { code: string } & PlaydateInput;

  if (!isValidCode(code)) {
    return NextResponse.json({ ok: false, error: "Not authorized." }, { status: 401 });
  }

  const required = ["title", "date", "start_time", "host_name"] as const;
  for (const key of required) {
    if (!fields[key]) {
      return NextResponse.json({ ok: false, error: `Missing ${key}.` }, { status: 400 });
    }
  }

  const { data, error } = await supabaseAdmin
    .from("playdates")
    .insert({
      title: fields.title,
      date: fields.date,
      start_time: fields.start_time,
      end_time: fields.end_time ?? null,
      host_name: fields.host_name,
      location_name: fields.location_name ?? null,
      address: fields.address ?? null,
      info: fields.info ?? null,
      weather_status: fields.weather_status ?? null,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  await supabaseAdmin.from("playdate_history").insert({
    playdate_id: data.id,
    action: "created",
    actor_name: fields.host_name,
    before: null,
    after: data,
  });

  return NextResponse.json({ ok: true, playdate: data });
}
