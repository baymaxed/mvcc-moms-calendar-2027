"use client";

import { useState } from "react";
import { useAdminAuth } from "@/lib/adminAuth";
import type { Playdate } from "@/types/playdate";

interface Props {
  existing?: Playdate;
  onSaved: (playdate: Playdate, action: string) => void;
  onCancel?: () => void;
}

export function PlaydateForm({ existing, onSaved, onCancel }: Props) {
  const { code, actorName, setActorName } = useAdminAuth();
  const [title, setTitle] = useState(existing?.title ?? "");
  const [date, setDate] = useState(existing?.date ?? "");
  const [startTime, setStartTime] = useState(existing?.start_time?.slice(0, 5) ?? "");
  const [endTime, setEndTime] = useState(existing?.end_time?.slice(0, 5) ?? "");
  const [hostName, setHostName] = useState(existing?.host_name ?? actorName);
  const [locationName, setLocationName] = useState(existing?.location_name ?? "");
  const [address, setAddress] = useState(existing?.address ?? "");
  const [info, setInfo] = useState(existing?.info ?? "");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const fields = {
      title,
      date,
      start_time: startTime ? `${startTime}:00` : "",
      end_time: endTime ? `${endTime}:00` : null,
      host_name: hostName,
      location_name: locationName || null,
      address: address || null,
      info: info || null,
    };

    try {
      const res = await fetch(
        existing ? `/api/playdates/${existing.id}` : "/api/playdates",
        {
          method: existing ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(
            existing
              ? { code, actorName: actorName || hostName, updates: fields }
              : { code, ...fields }
          ),
        }
      );
      const data = await res.json();
      if (!data.ok) {
        setError(data.error ?? "Something went wrong.");
        return;
      }
      if (!existing) setActorName(hostName);
      onSaved(data.playdate, data.action ?? "created");
    } catch {
      setError("Could not reach the server. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <Field label="Title">
        <input
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className={inputClass}
          placeholder="Park playdate"
        />
      </Field>

      <div className="grid grid-cols-3 gap-3">
        <Field label="Date" className="col-span-1">
          <input
            required
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className={inputClass}
          />
        </Field>
        <Field label="Start" className="col-span-1">
          <input
            required
            type="time"
            step="900"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className={inputClass}
          />
        </Field>
        <Field label="End" className="col-span-1">
          <input
            type="time"
            step="900"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            className={inputClass}
          />
        </Field>
      </div>

      <Field label="Host name">
        <input
          required
          value={hostName}
          onChange={(e) => setHostName(e.target.value)}
          className={inputClass}
          placeholder="Your name"
        />
      </Field>

      <Field label="Location name">
        <input
          value={locationName}
          onChange={(e) => setLocationName(e.target.value)}
          className={inputClass}
          placeholder="Sunset Park"
        />
      </Field>

      <Field label="Address">
        <input
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className={inputClass}
          placeholder="123 Main St, Frederick, MD"
        />
      </Field>

      <Field label="Info (what to bring, what's happening)">
        <textarea
          value={info}
          onChange={(e) => setInfo(e.target.value)}
          rows={4}
          className={inputClass}
        />
      </Field>

      {error && <p className="text-sm font-semibold text-cancelled">{error}</p>}

      <div className="flex gap-2.5 pt-1">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-full border-2 border-sky text-teal py-3 text-sm font-bold active:scale-95 transition-transform"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={submitting}
          className="flex-1 rounded-full bg-teal text-white py-3 text-sm font-bold disabled:opacity-40 active:scale-95 transition-transform"
        >
          {submitting ? "Saving…" : existing ? "Save changes" : "Add playdate"}
        </button>
      </div>
    </form>
  );
}

const inputClass =
  "w-full rounded-xl border-2 border-sky/60 px-3.5 py-2.5 text-sm font-medium focus:outline-none focus:border-teal bg-white transition-colors";

function Field({
  label,
  children,
  className = "",
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="block text-xs font-bold text-ink/50 uppercase tracking-wide mb-1.5">
        {label}
      </span>
      {children}
    </label>
  );
}
