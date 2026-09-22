"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import type { Playdate } from "@/types/playdate";
import { getDefaultMonth, monthRange, monthLabel, canGoPrev, canGoNext } from "@/lib/dateDefaults";
import { AnchorIcon } from "@/components/AnchorIcon";
import { DayCell } from "@/components/DayCell";
import { PlaydateDetailSheet } from "@/components/PlaydateDetailSheet";
import { PlaydateSheet } from "@/components/PlaydateSheet";

const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function Calendar() {
  const [{ year, month }, setYearMonth] = useState(() => getDefaultMonth());
  const [playdates, setPlaydates] = useState<Playdate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Playdate | null>(null);
  const todayStr = useMemo(() => new Date().toISOString().slice(0, 10), []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const { start, end } = monthRange(year, month);

    async function load() {
      const { data } = await supabase
        .from("playdates")
        .select("*")
        .gte("date", start)
        .lte("date", end)
        .order("start_time", { ascending: true });
      if (cancelled) return;
      setPlaydates((data as Playdate[]) ?? []);
      setLoading(false);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [year, month]);

  const playdatesByDate = useMemo(() => {
    const map: Record<string, Playdate[]> = {};
    for (const p of playdates) (map[p.date] ??= []).push(p);
    return map;
  }, [playdates]);

  const cells = useMemo(() => {
    const firstOfMonth = new Date(year, month - 1, 1);
    const daysInMonth = new Date(year, month, 0).getDate();
    const leadingBlanks = firstOfMonth.getDay();
    const list: { day: number | null; dateStr: string | null }[] = [];
    for (let i = 0; i < leadingBlanks; i++) list.push({ day: null, dateStr: null });
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      list.push({ day: d, dateStr });
    }
    while (list.length % 7 !== 0) list.push({ day: null, dateStr: null });
    return list;
  }, [year, month]);

  function goPrev() {
    if (!canGoPrev(year, month)) return;
    setYearMonth({ year, month: month - 1 });
  }

  function goNext() {
    if (!canGoNext(year, month)) return;
    setYearMonth({ year, month: month + 1 });
  }

  return (
    <div className="h-dvh flex flex-col bg-tealdeep overflow-hidden">
      {/* Header + month nav — always visible, never covered by the sheet */}
      <header className="pt-8 pb-3 px-5 text-center shrink-0">
        <p className="flex items-center justify-center gap-1.5 text-sky/80 font-bold text-[11px] uppercase tracking-[0.14em] mb-1">
          <AnchorIcon className="w-3.5 h-3.5" /> MVCC Moms Connect
        </p>
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={goPrev}
            disabled={!canGoPrev(year, month)}
            className="w-9 h-9 rounded-full flex items-center justify-center text-cream text-xl font-bold disabled:opacity-20 active:scale-90 transition-transform"
            aria-label="Previous month"
          >
            ‹
          </button>
          <h1 className="font-serif font-semibold text-3xl text-cream tracking-tight min-w-[9ch]">
            {monthLabel(year, month)}
          </h1>
          <button
            onClick={goNext}
            disabled={!canGoNext(year, month)}
            className="w-9 h-9 rounded-full flex items-center justify-center text-cream text-xl font-bold disabled:opacity-20 active:scale-90 transition-transform"
            aria-label="Next month"
          >
            ›
          </button>
        </div>
      </header>

      {/* Weekday labels — outside the overlay stage, always visible */}
      <div className="grid grid-cols-7 text-center text-[11px] font-bold text-sky/60 px-3 pb-1 shrink-0">
        {WEEKDAY_LABELS.map((d, i) => (
          <div key={i}>{d}</div>
        ))}
      </div>

      {/* Stage: the month grid sits here, and the Upcoming sheet overlays
          this region from the bottom (drag up to reveal more of it) */}
      <div className="relative flex-1 min-h-0 px-3">
        <div className="grid grid-cols-7">
          {cells.map((cell, i) => {
            if (!cell.dateStr) return <div key={i} />;
            return (
              <DayCell
                key={i}
                day={cell.day!}
                isToday={cell.dateStr === todayStr}
                items={playdatesByDate[cell.dateStr] ?? []}
                onSelect={setSelected}
              />
            );
          })}
        </div>

        {!loading && playdates.length === 0 && (
          <p className="text-center text-xs text-sky/50 mt-3">No playdates yet this month.</p>
        )}

        <PlaydateSheet onSelect={setSelected} />
      </div>

      {selected && <PlaydateDetailSheet playdate={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
