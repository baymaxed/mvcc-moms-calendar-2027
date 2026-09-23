import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { isValidCode } from "@/lib/requireCode";

const COLUMNS = [
  "id",
  "title",
  "date",
  "start_time",
  "end_time",
  "host_name",
  "host_phone",
  "location_name",
  "address",
  "info",
  "status",
  "weather_status",
  "original_date",
  "original_start_time",
  "original_end_time",
  "moved_note",
  "is_deleted",
  "deleted_at",
  "deleted_by",
  "created_at",
  "updated_at",
] as const;

function toCsvValue(value: unknown): string {
  if (value === null || value === undefined) return "";
  const str = String(value);
  if (/[",\n]/.test(str)) return `"${str.replace(/"/g, '""')}"`;
  return str;
}

// Manual backup export - includes soft-deleted rows so nothing is silently
// missing from a backup. Requires the DGL code, passed as a query param
// since this is triggered by a simple link/button rather than a form POST.
export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  if (!isValidCode(code)) {
    return NextResponse.json({ ok: false, error: "Not authorized." }, { status: 401 });
  }

  const { data, error } = await supabaseAdmin
    .from("playdates")
    .select(COLUMNS.join(","))
    .order("date", { ascending: true });

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  const rows = (data ?? []) as unknown as Record<string, unknown>[];
  const header = COLUMNS.join(",");
  const body = rows.map((row) => COLUMNS.map((col) => toCsvValue(row[col])).join(","));
  const csv = [header, ...body].join("\r\n");

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="playdates-backup-${new Date()
        .toISOString()
        .slice(0, 10)}.csv"`,
    },
  });
}
