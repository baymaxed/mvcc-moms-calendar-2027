"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import type { Playdate } from "@/types/playdate";
import { formatDateLong } from "@/lib/format";
import { seasonBounds, upcomingListStart } from "@/lib/dateDefaults";
import { AnchorMark } from "@/components/motifs/AnchorMark";
import { UpcomingCard } from "@/components/UpcomingCard";

// How much of the sheet stays visible when collapsed — enough for the
// handle, the "Upcoming" label, and a couple of preview cards.
const PEEK_PX = 300;
const PREVIEW_COUNT = 3;

export function PlaydateSheet({ onSelect }: { onSelect: (p: Playdate) => void }) {
  const [playdates, setPlaydates] = useState<Playdate[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);
  const [dragPx, setDragPx] = useState<number | null>(null);

  const stageRef = useRef<HTMLDivElement | null>(null);
  const dragState = useRef<{ startY: number; startTranslate: number } | null>(null);
  const [stageHeight, setStageHeight] = useState(640);

  useLayoutEffect(() => {
    const stage = stageRef.current?.parentElement;
    if (!stage) return;
    setStageHeight(stage.getBoundingClientRect().height);
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) setStageHeight(entry.contentRect.height);
    });
    observer.observe(stage);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    let cancelled = false;
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

  const collapsedTranslate = Math.max(stageHeight - PEEK_PX, 0);

  const groups = useMemo(() => {
    const byMonth: { label: string; key: string; days: { dateStr: string; items: Playdate[] }[] }[] = [];
    const monthIndex = new Map<string, number>();
    const dayIndex = new Map<string, number>();
    for (const p of playdates) {
      const [y, m] = p.date.split("-");
      const monthKey = `${y}-${m}`;
      if (!monthIndex.has(monthKey)) {
        const label = new Date(Number(y), Number(m) - 1, 1).toLocaleDateString("en-US", { month: "long" });
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

  function restingTranslate() {
    return expanded ? 0 : collapsedTranslate;
  }

  function handlePointerDown(e: React.PointerEvent) {
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    dragState.current = { startY: e.clientY, startTranslate: restingTranslate() };
    setDragPx(restingTranslate());
  }

  function handlePointerMove(e: React.PointerEvent) {
    if (!dragState.current) return;
    const delta = e.clientY - dragState.current.startY;
    const next = Math.min(Math.max(dragState.current.startTranslate + delta, 0), collapsedTranslate);
    setDragPx(next);
  }

  function handlePointerUp() {
    if (dragPx !== null) {
      setExpanded(dragPx < collapsedTranslate / 2);
    }
    dragState.current = null;
    setDragPx(null);
  }

  const translateY = dragPx !== null ? dragPx : restingTranslate();
  const isDragging = dragPx !== null;

  const previewItems = playdates.slice(0, PREVIEW_COUNT);

  return (
    <div
      ref={stageRef}
      className={`absolute inset-x-0 bottom-0 top-0 rounded-t-sheet bg-cream shadow-[0_-8px_30px_rgba(35,64,47,0.18)] ${
        isDragging ? "" : "transition-transform duration-300 ease-out"
      }`}
      style={{ transform: `translateY(${translateY}px)` }}
    >
      {/* Handle zone — the anchor straddles the seam and is both a drag
          handle and a tap-to-toggle control */}
      <div
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className="relative flex flex-col items-center pt-0 pb-2 cursor-grab active:cursor-grabbing touch-none"
      >
        <button
          onClick={() => setExpanded((v) => !v)}
          aria-label={expanded ? "Collapse upcoming playdates" : "Expand upcoming playdates"}
          className="w-11 h-11 rounded-full bg-cream border-2 border-sky/60 shadow-md flex items-center justify-center -mt-5"
        >
          <AnchorMark className="w-5 h-5" color="#3F6B7A" ropeColor="#C97B5C" />
        </button>
        <h2 className="font-serif font-semibold text-lg text-pine mt-2">Upcoming</h2>
      </div>

      {/* Content: a short flat preview when collapsed, the full
          chronological season grouped by month when expanded */}
      <div className="overflow-y-auto px-4 pb-28" style={{ height: "calc(100% - 84px)" }}>
        {loading ? (
          <p className="text-center text-sm text-ink/40 mt-6">Loading playdates…</p>
        ) : playdates.length === 0 ? (
          <p className="text-center text-sm text-ink/50 mt-6 px-4">
            No upcoming playdates on the books yet — check back soon.
          </p>
        ) : !expanded ? (
          <div className="space-y-2.5">
            {previewItems.map((p) => (
              <UpcomingCard key={p.id} playdate={p} onSelect={onSelect} />
            ))}
          </div>
        ) : (
          <div className="space-y-6">
            {groups.map((month) => (
              <section key={month.key}>
                <h3 className="font-serif font-semibold text-xs tracking-[0.14em] text-sage mb-2.5 pl-1">
                  {month.label}
                </h3>
                <div className="space-y-4">
                  {month.days.map((day) => (
                    <div key={day.dateStr}>
                      <p className="text-[11px] font-bold text-pine/60 mb-1.5 pl-1">
                        {formatDateLong(day.dateStr)}
                      </p>
                      <div className="space-y-2">
                        {day.items.map((p) => (
                          <UpcomingCard key={p.id} playdate={p} onSelect={onSelect} showDate={false} />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
