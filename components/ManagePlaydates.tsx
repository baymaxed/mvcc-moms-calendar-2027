"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useAdminAuth } from "@/lib/adminAuth";
import type { Playdate, WeatherStatus } from "@/types/playdate";
import { formatDateShort, formatDuration } from "@/lib/format";
import { StatusBadge } from "@/components/StatusBadge";
import { PlaydateForm } from "@/components/PlaydateForm";
import { describeAction } from "@/lib/confirmations";

const WEATHER_OPTIONS: { value: WeatherStatus; label: string }[] = [
  { value: null, label: "No weather flag" },
  { value: "weather_permitting", label: "Weather permitting" },
  { value: "weather_pending", label: "Weather pending" },
  { value: "confirmed", label: "Confirmed" },
  { value: "cancelled_due_to_weather", label: "Cancelled due to weather" },
];

export function ManagePlaydates() {
  const { code, actorName } = useAdminAuth();
  const [playdates, setPlaydates] = useState<Playdate[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [movingId, setMovingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmation, setConfirmation] = useState<string | null>(null);

  async function refresh() {
    setLoading(true);
    const { data } = await supabase
      .from("playdates")
      .select("*")
      .order("date", { ascending: true });
    setPlaydates((data as Playdate[]) ?? []);
    setLoading(false);
  }

  useEffect(() => {
    refresh();
  }, []);

  function handleUpdated(playdate: Playdate, action: string) {
    setConfirmation(describeAction(action, playdate));
    setEditingId(null);
    setMovingId(null);
    refresh();
  }

  async function patchStatus(p: Playdate, status: "cancelled" | "active") {
    const res = await fetch(`/api/playdates/${p.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, actorName: actorName || p.host_name, updates: { status } }),
    });
    const data = await res.json();
    if (data.ok) handleUpdated(data.playdate, data.action);
  }

  async function patchWeather(p: Playdate, weather_status: WeatherStatus) {
    const res = await fetch(`/api/playdates/${p.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        code,
        actorName: actorName || p.host_name,
        updates: { weather_status },
      }),
    });
    const data = await res.json();
    if (data.ok) handleUpdated(data.playdate, data.action);
  }

  async function confirmDelete(p: Playdate) {
    const res = await fetch(`/api/playdates/${p.id}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, actorName: actorName || p.host_name }),
    });
    const data = await res.json();
    setDeletingId(null);
    if (data.ok) {
      setConfirmation(describeAction("deleted", p));
      refresh();
    }
  }

  if (loading) return <p className="text-sm font-medium text-ink/40 text-center py-10">Loading…</p>;

  return (
    <div className="space-y-3">
      {confirmation && (
        <div className="bg-confirmedtint text-confirmed text-sm font-semibold rounded-2xl px-4 py-3 flex justify-between gap-2 animate-pop-in">
          <span>{confirmation}</span>
          <button onClick={() => setConfirmation(null)} className="shrink-0 opacity-60">
            ×
          </button>
        </div>
      )}

      {playdates.length === 0 && (
        <p className="text-sm font-medium text-ink/40 text-center py-10">No playdates yet.</p>
      )}

      {playdates.map((p) => (
        <div key={p.id} className="rounded-card p-4 bg-white shadow-sm">
          {editingId === p.id ? (
            <PlaydateForm existing={p} onSaved={handleUpdated} onCancel={() => setEditingId(null)} />
          ) : movingId === p.id ? (
            <MoveForm playdate={p} onSaved={handleUpdated} onCancel={() => setMovingId(null)} />
          ) : (
            <>
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <p className="font-serif font-semibold text-lg text-pine leading-snug tracking-tight">
                    {p.title}
                  </p>
                  <p className="text-xs font-medium text-ink/50">
                    {formatDateShort(p.date)} · {formatDuration(p.start_time, p.end_time)} · hosted by{" "}
                    {p.host_name}
                  </p>
                </div>
                <StatusBadge status={p.status} weatherStatus={p.weather_status} />
              </div>

              <div className="flex flex-wrap gap-2 mt-3 text-xs font-bold">
                <button onClick={() => setEditingId(p.id)} className={pillNeutral}>
                  Edit details
                </button>
                <button onClick={() => setMovingId(p.id)} className={pillAmber}>
                  Move
                </button>
                {p.status === "cancelled" ? (
                  <button onClick={() => patchStatus(p, "active")} className={pillGreen}>
                    Reactivate
                  </button>
                ) : (
                  <button onClick={() => patchStatus(p, "cancelled")} className={pillRed}>
                    Mark cancelled
                  </button>
                )}
                <select
                  value={p.weather_status ?? ""}
                  onChange={(e) => patchWeather(p, (e.target.value || null) as WeatherStatus)}
                  className="rounded-full border-2 border-sky/60 px-3 py-1.5 text-xs font-bold bg-white"
                >
                  {WEATHER_OPTIONS.map((opt) => (
                    <option key={opt.label} value={opt.value ?? ""}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <button onClick={() => setDeletingId(p.id)} className={pillRedOutline}>
                  Delete
                </button>
              </div>

              {deletingId === p.id && (
                <div className="mt-3 bg-cancelledtint rounded-xl p-3.5 text-sm">
                  <p className="text-cancelled font-medium mb-2.5">
                    Delete removes this permanently from the calendar. If the event was real and is
                    no longer happening, use <strong>Mark cancelled</strong> instead — it keeps the
                    playdate visible with a cancelled label so moms don't get confused.
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setDeletingId(null)}
                      className="flex-1 rounded-full border-2 border-cancelled text-cancelled py-2 font-bold active:scale-95 transition-transform"
                    >
                      Keep it
                    </button>
                    <button
                      onClick={() => confirmDelete(p)}
                      className="flex-1 rounded-full bg-cancelled text-white py-2 font-bold active:scale-95 transition-transform"
                    >
                      Delete anyway
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      ))}
    </div>
  );
}

const pillBase = "rounded-full px-3.5 py-1.5 active:scale-95 transition-transform";
const pillNeutral = `${pillBase} border-2 border-sky/60 text-teal`;
const pillAmber = `${pillBase} bg-movedtint text-moved`;
const pillGreen = `${pillBase} bg-confirmedtint text-confirmed`;
const pillRed = `${pillBase} bg-cancelledtint text-cancelled`;
const pillRedOutline = `${pillBase} border-2 border-cancelled/40 text-cancelled`;

function MoveForm({
  playdate,
  onSaved,
  onCancel,
}: {
  playdate: Playdate;
  onSaved: (p: Playdate, action: string) => void;
  onCancel: () => void;
}) {
  const { code, actorName } = useAdminAuth();
  const [date, setDate] = useState(playdate.date);
  const [startTime, setStartTime] = useState(playdate.start_time.slice(0, 5));
  const [endTime, setEndTime] = useState(playdate.end_time?.slice(0, 5) ?? "");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    const res = await fetch(`/api/playdates/${playdate.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        code,
        actorName: actorName || playdate.host_name,
        updates: {
          date,
          start_time: `${startTime}:00`,
          end_time: endTime ? `${endTime}:00` : null,
          moved_note: note || null,
        },
      }),
    });
    const data = await res.json();
    setSubmitting(false);
    if (data.ok) onSaved(data.playdate, data.action);
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <p className="text-sm font-medium text-ink/70">
        Moving <strong className="text-pine">{playdate.title}</strong> from{" "}
        {formatDateShort(playdate.date)}. The original date will keep a note pointing forward to
        the new one.
      </p>
      <div className="grid grid-cols-3 gap-2">
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} min="2027-01-01" max="2027-05-31" className="rounded-xl border-2 border-sky/60 px-2 py-2 text-sm font-medium" />
        <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="rounded-xl border-2 border-sky/60 px-2 py-2 text-sm font-medium" />
        <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} className="rounded-xl border-2 border-sky/60 px-2 py-2 text-sm font-medium" />
      </div>
      <input
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Optional note (e.g. venue conflict)"
        className="w-full rounded-xl border-2 border-sky/60 px-3.5 py-2 text-sm font-medium"
      />
      <div className="flex gap-2">
        <button type="button" onClick={onCancel} className="flex-1 rounded-full border-2 border-sky text-teal py-2.5 text-sm font-bold active:scale-95 transition-transform">
          Cancel
        </button>
        <button type="submit" disabled={submitting} className="flex-1 rounded-full bg-moved text-white py-2.5 text-sm font-bold disabled:opacity-40 active:scale-95 transition-transform">
          {submitting ? "Moving…" : "Confirm move"}
        </button>
      </div>
    </form>
  );
}
