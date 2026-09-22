"use client";

import type { Playdate } from "@/types/playdate";
import { dominantStatus } from "@/components/StatusBadge";

// The month grid's only job is orientation: "does this date have a
// playdate, and roughly what's its status." No titles, no times, nothing
// that can wrap or truncate — just a number, optionally sitting in a
// colored circle. Tapping a date with playdates opens the soonest one.
const DOT_FILL: Record<Playdate["status"], string> = {
  active: "bg-confirmed text-white",
  moved: "bg-moved text-white",
  cancelled: "bg-cancelled text-white",
};

export function DayCell({
  day,
  isToday,
  items,
  onSelect,
}: {
  day: number;
  isToday: boolean;
  items: Playdate[];
  onSelect: (p: Playdate) => void;
}) {
  const status = items.length > 0 ? dominantStatus(items.map((p) => p.status)) : null;

  function handleClick() {
    if (items.length === 0) return;
    const soonest = [...items].sort((a, b) => a.start_time.localeCompare(b.start_time))[0];
    onSelect(soonest);
  }

  return (
    <button
      onClick={handleClick}
      disabled={items.length === 0}
      className="flex items-center justify-center py-1.5"
      aria-label={items.length > 0 ? `${items.length} playdate(s) on day ${day}` : undefined}
    >
      <span
        className={`relative flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-full text-sm sm:text-[15px] font-semibold transition-transform active:scale-90 ${
          status ? DOT_FILL[status] : isToday ? "text-white ring-1 ring-white/70" : "text-white/75"
        } ${isToday && status ? "ring-2 ring-white/80" : ""}`}
      >
        {day}
      </span>
    </button>
  );
}
