export function formatTime(time: string): string {
  // "14:30:00" -> "2:30 PM"
  const [hStr, m] = time.split(":");
  let h = parseInt(hStr, 10);
  const ampm = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  return `${h}:${m} ${ampm}`;
}

// A very compact time label for tight spaces, e.g. mobile month-grid chips:
// "14:00:00" -> "2p", "14:30:00" -> "2:30p". Never includes a space, so it
// can sit next to a truncated title on one line without extra width cost.
export function formatTimeCompact(time: string): string {
  const [hStr, m] = time.split(":");
  let h = parseInt(hStr, 10);
  const ampm = h >= 12 ? "p" : "a";
  h = h % 12 || 12;
  return m === "00" ? `${h}${ampm}` : `${h}:${m}${ampm}`;
}

export function formatDuration(start: string, end: string | null): string {
  if (!end) return formatTime(start);
  return `${formatTime(start)} – ${formatTime(end)}`;
}

export function formatDateLong(dateStr: string): string {
  // "2027-03-14" -> "Sunday, March 14"
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

export function formatDateShort(dateStr: string): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}
