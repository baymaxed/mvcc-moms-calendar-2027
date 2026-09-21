"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import type { Playdate } from "@/types/playdate";
import {
  getDefaultMonth,
  monthRange,
  monthLabel,
  canGoPrev,
  canGoNext,
} from "@/lib/dateDefaults";
import { AnchorIcon } from "@/components/AnchorIcon";
import { AnchorMark } from "@/components/motifs/AnchorMark";
import { FloralSpray } from "@/components/motifs/FloralSpray";
import { DayCell } from "@/components/DayCell";
import { PlaydateDetailSheet } from "@/components/PlaydateDetailSheet";
import { ListView } from "@/components/ListView";

interface MovedStub {
  playdateId: string;
  title: string;
  currentDate: string;
}

const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function Calendar() {
  const [view, setView] = useState<"month" | "list">("month");
  const [{ year, month }, setYearMonth] = useState(() => getDefaultMonth());
  const [direction, setDirection] = useState<"left" | "right" | null>(null);
  const [playdates, setPlaydates] = useState<Playdate[]>([]);
  const [stubsByDate, setStubsByDate] = useState<Record<string, MovedStub[]>>({});
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Playdate | null>(null);
  const todayStr = useMemo(() => new Date().toISOString().slice(0, 10), []);

  useEffect(() => {
    if (view !== "month") return;
    let cancelled = false;
    setLoading(true);

    const { start, end } = monthRange(year, month);

    async function load() {
      const [primaryRes, stubRes] = await Promise.all([
        supabase
          .from("playdates")
          .select("*")
          .gte("date", start)
          .lte("date", end)
          .order("start_time", { ascending: true }),
        supabase
          .from("playdates")
          .select("id, title, date, original_date")
          .eq("status", "moved")
          .gte("original_date", start)
          .lte("original_date", end),
      ]);

      if (cancelled) return;

      setPlaydates((primaryRes.data as Playdate[]) ?? []);

      const stubs: Record<string, MovedStub[]> = {};
      for (const row of stubRes.data ?? []) {
        if (row.original_date === row.date) continue;
        const key = row.original_date as string;
        (stubs[key] ??= []).push({
          playdateId: row.id,
          title: row.title,
          currentDate: row.date,
        });
      }
      setStubsByDate(stubs);
      setLoading(false);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [year, month, view]);

  const playdatesByDate = useMemo(() => {
    const map: Record<string, Playdate[]> = {};
    for (const p of playdates) {
      (map[p.date] ??= []).push(p);
    }
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
    setDirection("left");
    setYearMonth({ year, month: month - 1 });
  }

  function goNext() {
    if (!canGoNext(year, month)) return;
    setDirection("right");
    setYearMonth({ year, month: month + 1 });
  }

  function jumpToDate(dateStr: string) {
    const [y, m] = dateStr.split("-").map(Number);
    setView("month");
    setDirection(m > month || y > year ? "right" : "left");
    setYearMonth({ year: y, month: m });
  }

  const animationClass =
    direction === "right" ? "animate-slide-from-right" : direction === "left" ? "animate-slide-from-left" : "";

  return (
    <div className="min-h-screen flex flex-col">
      <div className="max-w-md sm:max-w-2xl lg:max-w-5xl mx-auto w-full flex-1 pb-28">
        <header className="bloom-backdrop paper-grain pt-10 pb-6 px-4 text-center rounded-b-[32px] mb-5 relative overflow-hidden">
          <FloralSpray className="absolute -left-4 -top-4 w-24 h-24 sm:w-28 sm:h-28 pointer-events-none" />
          <FloralSpray flip className="absolute -right-4 -top-4 w-24 h-24 sm:w-28 sm:h-28 pointer-events-none" />
          <p className="flex items-center justify-center gap-1.5 text-teal font-bold text-xs uppercase tracking-[0.12em] mb-2 relative">
            <AnchorIcon className="w-3.5 h-3.5" /> MVCC Moms Connect
          </p>
          <h1 className="font-serif font-semibold text-3xl sm:text-4xl text-pine tracking-tight relative">
            Anchored in Christ
          </h1>
          <p className="text-sm font-medium text-teal/70 mt-1 relative">Playdate Calendar · 2027 Season</p>
        </header>

        {view === "month" ? (
          <div className="px-4">
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={goPrev}
                disabled={!canGoPrev(year, month)}
                className="w-10 h-10 rounded-full flex items-center justify-center text-teal text-xl font-bold bg-white shadow-sm disabled:opacity-20 active:scale-90 transition-transform"
                aria-label="Previous month"
              >
                ‹
              </button>
              <h2 className="font-serif font-semibold text-xl sm:text-2xl text-pine tracking-tight">
                {monthLabel(year, month)}
              </h2>
              <button
                onClick={goNext}
                disabled={!canGoNext(year, month)}
                className="w-10 h-10 rounded-full flex items-center justify-center text-teal text-xl font-bold bg-white shadow-sm disabled:opacity-20 active:scale-90 transition-transform"
                aria-label="Next month"
              >
                ›
              </button>
            </div>

            <div className="grid grid-cols-7 text-center text-[11px] sm:text-xs font-bold text-teal/60 mb-2">
              {WEEKDAY_LABELS.map((d, i) => (
                <div key={i}>{d}</div>
              ))}
            </div>

            <div key={`${year}-${month}`} className={`grid grid-cols-7 gap-1.5 sm:gap-2 ${animationClass}`}>
              {cells.map((cell, i) => {
                if (!cell.dateStr) return <div key={i} />;
                return (
                  <DayCell
                    key={i}
                    day={cell.day!}
                    isToday={cell.dateStr === todayStr}
                    items={playdatesByDate[cell.dateStr] ?? []}
                    stubs={stubsByDate[cell.dateStr] ?? []}
                    onSelect={setSelected}
                    onJump={jumpToDate}
                  />
                );
              })}
            </div>

            {loading && <p className="text-center text-sm text-ink/40 mt-5">Loading playdates…</p>}
            {!loading && playdates.length === 0 && (
              <p className="text-center text-sm text-ink/40 mt-6">
                No playdates on the calendar yet this month.
              </p>
            )}
          </div>
        ) : (
          <ListView onSelect={setSelected} />
        )}
      </div>

      <ViewSwitcher view={view} onChange={setView} />

      {selected && <PlaydateDetailSheet playdate={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}

function ViewSwitcher({
  view,
  onChange,
}: {
  view: "month" | "list";
  onChange: (v: "month" | "list") => void;
}) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 flex justify-center pb-safe pt-3 px-4 bg-gradient-to-t from-cream via-cream/95 to-transparent">
      <div className="flex items-center gap-1 bg-white rounded-full shadow-lg border border-sky/40 p-1.5">
        <button
          onClick={() => onChange("month")}
          aria-current={view === "month"}
          className={`flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-bold transition-colors ${
            view === "month" ? "bg-teal text-white" : "text-teal/70"
          }`}
        >
          <GridIcon className="w-4 h-4" />
          Calendar
        </button>
        <button
          onClick={() => onChange("list")}
          aria-current={view === "list"}
          className={`flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-bold transition-colors ${
            view === "list" ? "bg-teal text-white" : "text-teal/70"
          }`}
        >
          <AnchorMark
            className="w-4 h-4"
            color={view === "list" ? "#ffffff" : "#3F6B7A"}
            ropeColor={view === "list" ? "#F8D68F" : undefined}
          />
          Upcoming
        </button>
      </div>
    </nav>
  );
}

function GridIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className={className} aria-hidden="true">
      <rect x="3" y="4" width="18" height="17" rx="3" />
      <line x1="3" y1="9.5" x2="21" y2="9.5" />
      <line x1="8.5" y1="4" x2="8.5" y2="21" />
      <line x1="15.5" y1="4" x2="15.5" y2="21" />
    </svg>
  );
}
