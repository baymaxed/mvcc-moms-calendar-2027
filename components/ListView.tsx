"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import type { Playdate } from "@/types/playdate";
import { formatDateLong, formatDuration } from "@/lib/format";
import { seasonBounds, upcomingListStart } from "@/lib/dateDefaults";
import { AnchorMark } from "@/components/motifs/AnchorMark";

const CARD_STYLES: Record<Playdate["status"], string> = {
  active: "bg-confirmedtint",
  moved: "bg-movedtint",
  cancelled: "bg-cancelledtint",
};

const CARD_TEXT: Record<Playdate["status"], string> = {
  active: "text-confirmed",
  moved: "text-moved",
  cancelled: "text-cancelled",
};

const BADGE_LABEL: Partial<Record<Playdate["status"], string>> = {
  moved: "MOVED",
  cancelled: "CANCELLED",
};

export function ListView({ onSelect }: { onSelect: (p: Playdate) => void }) {
  const [playdates, setPlaydates] = useState<Playdate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    async function load() {
      const start = upcomingListStart();
      const { end } = seasonBounds();
      const { data } = await supabase
        .from("playdates")
        .select("*")
        .gte("date", start)
        .lte("date", end)
        .order("date", { ascending: true })
        .order("start_time", { ascending: true });
      if (cancelled) return;
      setPlaydates((data as Playdate[]) ?? []);
      setLoading(false);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const groups = useMemo(() => {
    const byMonth: { label: string; key: string; days: { dateStr: string; items: Playdate[] }[] }[] = [];
    const monthIndex = new Map<string, number>();
    const dayIndex = new Map<string, number>();

    for (const p of playdates) {
      const [y, m] = p.date.split("-");
      const monthKey = `${y}-${m}`;
      if (!monthIndex.has(monthKey)) {
        const label = new Date(Number(y), Number(m) - 1, 1).toLocaleDateString("en-US", {
          month: "long",
        });
        monthIndex.set(monthKey, byMonth.length);
        byMonth.push({ label: label.toUpperCase(), key: monthKey, days: [] });
      }
      const month = byMonth[monthIndex.get(monthKey)!];
      const dayKey = `${monthKey}-${p.date}`;
      if (!dayIndex.has(dayKey)) {
        dayIndex.set(dayKey, month.days.length);
        month.days.push({ dateStr: p.date, items: [] });
      }
      month.days[dayIndex.get(dayKey)!].items.push(p);
    }
    return byMonth;
  }, [playdates]);

  if (loading) {
    return <p className="text-center text-sm text-ink/40 mt-10">Loading upcoming playdates…</p>;
  }

  if (groups.length === 0) {
    return (
      <div className="text-center px-6 pt-10">
        <AnchorMark className="w-10 h-10 mx-auto mb-3 text-teal/30" />
        <p className="text-sm font-medium text-ink/50">
          No upcoming playdates on the books yet — check back soon, or peek at the calendar for
          the full season.
        </p>
      </div>
    );
  }

  return (
    <div className="px-4 pb-8 space-y-7">
      {groups.map((month) => (
        <section key={month.key}>
          <h3 className="font-serif font-semibold text-sm tracking-[0.14em] text-sage mb-3 pl-1">
            {month.label}
          </h3>
          <div className="space-y-4">
            {month.days.map((day) => (
              <div key={day.dateStr}>
                <p className="text-xs font-bold text-pine/70 mb-2 pl-1">{formatDateLong(day.dateStr)}</p>
                <div className="space-y-2">
                  {day.items.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => onSelect(p)}
                      className={`w-full text-left rounded-card px-4 py-3.5 transition-transform active:scale-[0.98] ${CARD_STYLES[p.status]}`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className={`font-serif font-semibold text-base leading-snug ${CARD_TEXT[p.status]}`}>
                          {p.title}
                        </p>
                        {BADGE_LABEL[p.status] && (
                          <span className="shrink-0 rounded-full bg-white px-2.5 py-0.5 text-[10px] font-bold text-ink/70">
                            {BADGE_LABEL[p.status]}
                          </span>
                        )}
                      </div>
                      <p className={`text-sm font-semibold mt-0.5 ${CARD_TEXT[p.status]} opacity-90`}>
                        {formatDuration(p.start_time, p.end_time)}
                      </p>
                      <p className="text-xs font-medium text-ink/60 mt-1">
                        {p.host_name}
                        {p.location_name ? ` · ${p.location_name}` : ""}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
