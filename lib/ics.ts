import type { Playdate } from "@/types/playdate";

// Builds a minimal, valid .ics file for a single playdate so it can be
// dropped into any calendar app. No external library needed for a single
// VEVENT.
export function buildIcs(p: Playdate): string {
  const toIcsDateTime = (date: string, time: string) => {
    // date: "YYYY-MM-DD", time: "HH:MM:SS" -> "YYYYMMDDTHHMMSS"
    return `${date.replace(/-/g, "")}T${time.replace(/:/g, "")}`;
  };

  const dtStart = toIcsDateTime(p.date, p.start_time);
  const dtEnd = p.end_time
    ? toIcsDateTime(p.date, p.end_time)
    : toIcsDateTime(p.date, p.start_time); // zero-length fallback

  const escapeText = (s: string) =>
    s.replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/,/g, "\\,").replace(/;/g, "\\;");

  const descriptionParts = [
    p.host_name ? `Hosted by ${p.host_name}` : "",
    p.info || "",
  ].filter(Boolean);

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//MVCC Moms Connect//Playdate Calendar//EN",
    "BEGIN:VEVENT",
    `UID:${p.id}@mvcc-moms-connect`,
    `DTSTAMP:${toIcsDateTime(p.date, p.start_time)}Z`,
    `DTSTART:${dtStart}`,
    `DTEND:${dtEnd}`,
    `SUMMARY:${escapeText(p.title)}`,
    p.location_name || p.address
      ? `LOCATION:${escapeText([p.location_name, p.address].filter(Boolean).join(", "))}`
      : "",
    descriptionParts.length
      ? `DESCRIPTION:${escapeText(descriptionParts.join("\\n\\n"))}`
      : "",
    "END:VEVENT",
    "END:VCALENDAR",
  ].filter(Boolean);

  return lines.join("\r\n");
}

// Google Calendar's "quick add via URL" template - no OAuth needed.
export function googleCalendarUrl(p: Playdate): string {
  const toGDate = (date: string, time: string) =>
    `${date.replace(/-/g, "")}T${time.replace(/:/g, "")}`;

  const start = toGDate(p.date, p.start_time);
  const end = p.end_time ? toGDate(p.date, p.end_time) : start;

  const details = [
    p.host_name ? `Hosted by ${p.host_name}` : "",
    p.info || "",
  ]
    .filter(Boolean)
    .join("\n\n");

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: p.title,
    dates: `${start}/${end}`,
    details,
    location: [p.location_name, p.address].filter(Boolean).join(", "),
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export function mapsUrl(address: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
}
