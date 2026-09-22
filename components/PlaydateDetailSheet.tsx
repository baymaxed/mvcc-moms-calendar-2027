"use client";

import { useEffect } from "react";
import type { Playdate } from "@/types/playdate";
import { StatusBadge } from "@/components/StatusBadge";
import { formatDateLong, formatDuration } from "@/lib/format";
import { buildIcs, googleCalendarUrl, mapsUrl } from "@/lib/ics";

export function PlaydateDetailSheet({
  playdate,
  onClose,
}: {
  playdate: Playdate;
  onClose: () => void;
}) {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const downloadIcs = () => {
    const blob = new Blob([buildIcs(playdate)], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${playdate.title.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}.ics`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const wasMoved = playdate.original_date && playdate.original_date !== playdate.date;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center sm:justify-center">
      <button
        aria-label="Close"
        className="absolute inset-0 bg-ink/40 animate-fade-in"
        onClick={onClose}
      />
      <div className="relative w-full sm:max-w-md bg-white rounded-t-sheet sm:rounded-sheet shadow-2xl max-h-[88vh] overflow-y-auto animate-slide-up">
        <div className="sticky top-0 bg-white px-6 pt-6 pb-4 flex items-start justify-between gap-4">
          <div>
            <p className="text-teal font-bold text-xs uppercase tracking-wide mb-1.5">
              {formatDateLong(playdate.date)}
            </p>
            <h2 className="font-serif font-semibold text-2xl text-pine leading-snug tracking-tight">
              {playdate.title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="shrink-0 w-8 h-8 rounded-full bg-sky/30 text-teal text-lg leading-none active:scale-90 transition-transform"
            aria-label="Close details"
          >
            ×
          </button>
        </div>

        <div className="px-6 pb-6 space-y-4">
          <StatusBadge status={playdate.status} weatherStatus={playdate.weather_status} />

          {wasMoved && (
            <p className="text-sm bg-movedtint text-moved font-medium rounded-xl px-3.5 py-2.5">
              Originally scheduled for {formatDateLong(playdate.original_date!)}
              {playdate.moved_note ? ` — ${playdate.moved_note}` : ""}.
            </p>
          )}

          <div className="text-sm">
            <p className="font-bold text-ink text-base">
              {formatDuration(playdate.start_time, playdate.end_time)}
            </p>
            <p className="text-ink/60 font-medium">Hosted by {playdate.host_name}</p>
          </div>

          {(playdate.location_name || playdate.address) && (
            <div className="text-sm bg-skytint rounded-xl px-3.5 py-3">
              {playdate.location_name && (
                <p className="font-bold text-ink">{playdate.location_name}</p>
              )}
              {playdate.address && (
                <a
                  href={mapsUrl(playdate.address)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-teal font-semibold underline underline-offset-2"
                >
                  {playdate.address}
                </a>
              )}
            </div>
          )}

          {playdate.info && (
            <p className="text-sm text-ink/90 whitespace-pre-wrap leading-relaxed">
              {playdate.info}
            </p>
          )}

          <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
            <button
              onClick={downloadIcs}
              className="flex-1 rounded-full border-2 border-teal text-teal py-3 text-sm font-bold active:scale-95 transition-transform"
            >
              Add to calendar
            </button>
            <a
              href={googleCalendarUrl(playdate)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 text-center rounded-full bg-teal text-white py-3 text-sm font-bold active:scale-95 transition-transform"
            >
              Add to Google Calendar
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
