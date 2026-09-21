// The app only ever covers January–May 2027. This decides which month to
// open to, per spec: before the season, default to January; during it,
// default to the current month; after, default to May.

export const SEASON_YEAR = 2027;
export const SEASON_START_MONTH = 1; // January
export const SEASON_END_MONTH = 5; // May

export function getDefaultMonth(now: Date = new Date()): {
  year: number;
  month: number; // 1-12
} {
  const year = now.getFullYear();
  const month = now.getMonth() + 1;

  const beforeSeason =
    year < SEASON_YEAR ||
    (year === SEASON_YEAR && month < SEASON_START_MONTH);
  const afterSeason =
    year > SEASON_YEAR ||
    (year === SEASON_YEAR && month > SEASON_END_MONTH);

  if (beforeSeason) return { year: SEASON_YEAR, month: SEASON_START_MONTH };
  if (afterSeason) return { year: SEASON_YEAR, month: SEASON_END_MONTH };
  return { year: SEASON_YEAR, month };
}

export function canGoPrev(year: number, month: number) {
  return !(year === SEASON_YEAR && month <= SEASON_START_MONTH);
}

export function canGoNext(year: number, month: number) {
  return !(year === SEASON_YEAR && month >= SEASON_END_MONTH);
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

// The full season's bounds — used by List View to know how far forward to
// query, independent of whatever month the grid happens to be showing.
export function seasonBounds() {
  return {
    start: `${SEASON_YEAR}-01-01`,
    end: `${SEASON_YEAR}-05-31`,
  };
}

// Where List View's "upcoming" window should start: today, clamped into the
// season. Before the season, that's day one of January; after it ends,
// there's nothing left to show (the list will render its empty state).
export function upcomingListStart(now: Date = new Date()): string {
  const { start, end } = seasonBounds();
  const todayStr = now.toISOString().slice(0, 10);
  if (todayStr < start) return start;
  if (todayStr > end) return end;
  return todayStr;
}
