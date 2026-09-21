"use client";

import { useState } from "react";
import type { Playdate } from "@/types/playdate";
import { formatTime, formatTimeCompact } from "@/lib/format";
import { statusDotColor } from "@/components/StatusBadge";

interface MovedStub {
  playdateId: string;
  title: string;
  currentDate: string;
}

const CHIP_STYLES: Record<Playdate["status"], string> = {
  active: "bg-confirmedtint text-confirmed",
  moved: "bg-movedtint text-moved",
  cancelled: "bg-cancelledtint text-cancelled line-through decoration-2",
};

const VISIBLE_LIMIT = 3;

export function DayCell({
  day,
  isToday,
  items,
  stubs,
  onSelect,
  onJump,
}: {
  day: number;
  isToday: boolean;
  items: Playdate[];
  stubs: MovedStub[];
  onSelect: (p: Playdate) => void;
  onJump: (dateStr: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const visibleItems = expanded ? items : items.slice(0, VISIBLE_LIMIT);
  const hiddenCount = items.length - visibleItems.length;

  return (
    <div
      className={`min-h-[88px] sm:min-h-[116px] lg:min-h-[136px] rounded-card p-1.5 sm:p-2 text-left transition-colors ${
        isToday ? "bg-white ring-2 ring-terracotta" : "bg-white/70"
      }`}
    >
      <p
        className={`inline-flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 rounded-full text-[11px] sm:text-xs font-bold mb-1 font-serif ${
          isToday ? "bg-terracotta text-white" : "text-ink/50"
        }`}
      >
        {day}
      </p>

      <div className="space-y-1 sm:space-y-1.5">
        {visibleItems.map((p) => (
          <button
            key={p.id}
            onClick={() => onSelect(p)}
            title={p.title}
            className={`block w-full text-left rounded-lg px-1.5 py-1 transition-transform active:scale-95 ${CHIP_STYLES[p.status]}`}
          >
            {/* Mobile: one compact, never-wrapping line — dot + short time +
                truncated title. This is the fix for titles breaking letter
                by letter in a 7-column grid: `truncate` clips with an
                ellipsis and never wraps, no matter how long the title is. */}
            <span className="flex sm:hidden items-center gap-1 min-w-0">
              <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${statusDotColor(p.status)}`} />
              <span className="shrink-0 text-[9px] font-bold tabular-nums opacity-80">
                {formatTimeCompact(p.start_time)}
              </span>
              <span className="min-w-0 flex-1 truncate text-[10.5px] font-semibold">{p.title}</span>
            </span>

            {/* Tablet/desktop: more room, so show a bit more — the title can
                wrap up to two lines, plus the full time. Still bounded with
                line-clamp so a very long title is truncated with an
                ellipsis rather than growing the cell unpredictably. */}
            <span className="hidden sm:flex items-start gap-1.5 min-w-0">
              <span className={`mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 ${statusDotColor(p.status)}`} />
              <span className="min-w-0 flex-1">
                <span className="block text-xs lg:text-[13px] font-semibold leading-snug line-clamp-2">
                  {p.title}
                </span>
                <span className="block text-[10px] lg:text-[11px] font-medium opacity-70 leading-tight mt-0.5">
                  {formatTime(p.start_time)}
                </span>
              </span>
            </span>
          </button>
        ))}

        {stubs.map((s) => (
          <button
            key={s.playdateId}
            onClick={() => onJump(s.currentDate)}
            className="block w-full text-left rounded-lg px-1.5 py-1 text-[10px] sm:text-[11px] font-semibold text-teal/70 italic leading-tight transition-transform active:scale-95"
          >
            → moved
          </button>
        ))}

        {hiddenCount > 0 && (
          <button
            onClick={() => setExpanded(true)}
            className="block w-full text-left rounded-lg px-1.5 py-0.5 text-[10px] sm:text-[11px] font-bold text-teal"
          >
            +{hiddenCount} more
          </button>
        )}
      </div>
    </div>
  );
}
