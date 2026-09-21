import type { Playdate } from "@/types/playdate";
import { formatDateShort } from "@/lib/format";

const WEATHER_LABEL: Record<string, string> = {
  weather_permitting: "Weather Permitting",
  weather_pending: "Weather Pending",
  confirmed: "Confirmed",
  cancelled_due_to_weather: "Cancelled (Weather)",
};

// Plain-language explanation of what an admin action just did and how it
// will read on the public calendar - shown right after the action instead
// of a raw "Success" toast. V1 has no visible history trail in the DGL UI;
// this is the substitute for "what did that actually do?"
export function describeAction(action: string, playdate: Playdate): string {
  const title = playdate.title;

  switch (action) {
    case "created":
      return `"${title}" has been added to ${formatDateShort(playdate.date)}.`;

    case "cancelled":
      return `"${title}" is now marked Cancelled. It will stay visible on ${formatDateShort(
        playdate.date
      )} with a cancelled label so moms who saved the date aren't confused — it won't disappear from the calendar.`;

    case "reactivated":
      return `"${title}" is active again and will show normally on ${formatDateShort(playdate.date)}.`;

    case "moved": {
      const from = playdate.original_date ? formatDateShort(playdate.original_date) : "its original date";
      const to = formatDateShort(playdate.date);
      return `"${title}" has been moved from ${from} → ${to}. On ${from}, the calendar will now show a small "Moved to ${to}" note linking forward. The full event details now live on ${to} with a Moved label.`;
    }

    case "weather_updated": {
      const label = WEATHER_LABEL[playdate.weather_status ?? ""] ?? playdate.weather_status ?? "";
      if (playdate.weather_status === "cancelled_due_to_weather") {
        return `"${title}" is now marked Cancelled (Weather). Status has also been set to Cancelled so it reads clearly on the calendar.`;
      }
      return `"${title}" weather status is now "${label}".`;
    }

    case "edited":
      return `"${title}" has been updated.`;

    case "deleted":
      return `"${title}" has been removed from the calendar entirely. This is meant for genuine mistakes — for a real event that's no longer happening, Cancelled is almost always the better choice.`;

    default:
      return `"${title}" has been updated.`;
  }
}
