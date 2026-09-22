// The calendar now runs indefinitely — no fixed season window. It always
// opens to the current real-world month, and navigation is unrestricted in
// both directions.

export function getDefaultMonth(now: Date = new Date()): {
  year: number;
  month: number; // 1-12
} {
  return { year: now.getFullYear(), month: now.getMonth() + 1 };
}

export function canGoPrev(_year: number, _month: number) {
  return true;
}

export function canGoNext(_year: number, _month: number) {
  return true;
}

export function monthLabel(year: number, month: number) {
  return new Date(year, month - 1, 1).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
}

// Returns the first/last date (YYYY-MM-DD) of the given month, for
// building Supabase range queries.
export function monthRange(year: number, month: number) {
  const first = new Date(Date.UTC(year, month - 1, 1));
  const last = new Date(Date.UTC(year, month, 0));
  const fmt = (d: Date) => d.toISOString().slice(0, 10);
  return { start: fmt(first), end: fmt(last) };
}

// Where the Upcoming sheet's chronological window starts: today, with no
// end bound — it shows everything that's ever added, going forward.
export function upcomingListStart(now: Date = new Date()): string {
  return now.toISOString().slice(0, 10);
}
