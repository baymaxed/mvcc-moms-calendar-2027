import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { isValidCode } from "@/lib/requireCode";
import type { Playdate } from "@/types/playdate";

interface PatchBody {
  code: string;
  actorName: string;
  updates: Partial<
    Pick<
      Playdate,
      | "title"
      | "date"
      | "start_time"
      | "end_time"
      | "host_name"
      | "location_name"
      | "address"
      | "info"
      | "status"
      | "weather_status"
      | "moved_note"
    >
  >;
}

// Handles edits, moves, cancellations, reactivations, and weather updates -
// all through one endpoint, since they're all "change some fields on this
// row" and the interesting logic is in figuring out WHICH kind of change
// happened, for the history log and the original_date bookkeeping.
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const body = (await req.json().catch(() => null)) as PatchBody | null;
  if (!body) return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });

  const { code, actorName, updates } = body;
  if (!isValidCode(code)) {
    return NextResponse.json({ ok: false, error: "Not authorized." }, { status: 401 });
  }
  if (!actorName) {
    return NextResponse.json({ ok: false, error: "Missing actor name." }, { status: 400 });
  }

  const { data: current, error: fetchError } = await supabaseAdmin
    .from("playdates")
    .select("*")
    .eq("id", params.id)
    .single();

  if (fetchError || !current) {
    return NextResponse.json({ ok: false, error: "Playdate not found." }, { status: 404 });
  }

  const patch: Record<string, unknown> = { ...updates, updated_at: new Date().toISOString() };
  let action: string = "edited";
  let note: string | null = null;

  const dateChanging =
    (updates.date && updates.date !== current.date) ||
    (updates.start_time && updates.start_time !== current.start_time) ||
    (updates.end_time !== undefined && updates.end_time !== current.end_time);

  if (dateChanging) {
    action = "moved";
    // Only capture the ORIGINAL date/time once - a second move must not
    // overwrite the first-ever announced date.
    if (!current.original_date) {
      patch.original_date = current.date;
      patch.original_start_time = current.start_time;
      patch.original_end_time = current.end_time;
    }
    patch.status = "moved";
    note = updates.moved_note ?? null;
  } else if (updates.status === "cancelled" && current.status !== "cancelled") {
    action = "cancelled";
  } else if (updates.status === "active" && current.status === "cancelled") {
    action = "reactivated";
  } else if (
    updates.weather_status !== undefined &&
    updates.weather_status !== current.weather_status
  ) {
    action = "weather_updated";
    // A weather cancellation is also a real cancellation - keep the two
    // fields consistent in one action rather than requiring a second step.
    if (updates.weather_status === "cancelled_due_to_weather") {
      patch.status = "cancelled";
    }
  }

  const { data: updated, error: updateError } = await supabaseAdmin
    .from("playdates")
    .update(patch)
    .eq("id", params.id)
    .select()
    .single();

  if (updateError) {
    return NextResponse.json({ ok: false, error: updateError.message }, { status: 500 });
  }

  await supabaseAdmin.from("playdate_history").insert({
    playdate_id: params.id,
    action,
    actor_name: actorName,
    before: current,
    after: updated,
    note,
  });

  return NextResponse.json({ ok: true, playdate: updated, action });
}

// Soft delete only - a real SQL DELETE is never issued. Reserved for genuine
// mistakes; DGLs are instructed to use "Cancelled" for real cancellations.
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const { code, actorName } = (await req.json().catch(() => ({}))) as {
    code?: string;
    actorName?: string;
  };

  if (!isValidCode(code)) {
    return NextResponse.json({ ok: false, error: "Not authorized." }, { status: 401 });
  }
  if (!actorName) {
    return NextResponse.json({ ok: false, error: "Missing actor name." }, { status: 400 });
  }

  const { data: current, error: fetchError } = await supabaseAdmin
    .from("playdates")
    .select("*")
    .eq("id", params.id)
    .single();

  if (fetchError || !current) {
    return NextResponse.json({ ok: false, error: "Playdate not found." }, { status: 404 });
  }

  const { data: updated, error: updateError } = await supabaseAdmin
    .from("playdates")
    .update({
      is_deleted: true,
      deleted_at: new Date().toISOString(),
      deleted_by: actorName,
    })
    .eq("id", params.id)
    .select()
    .single();

  if (updateError) {
    return NextResponse.json({ ok: false, error: updateError.message }, { status: 500 });
  }

  await supabaseAdmin.from("playdate_history").insert({
    playdate_id: params.id,
    action: "deleted",
    actor_name: actorName,
    before: current,
    after: updated,
  });

  return NextResponse.json({ ok: true });
}
