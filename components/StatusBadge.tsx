import type { PlaydateStatus, WeatherStatus } from "@/types/playdate";

// Status is always shown, including the good-news case — a glance at the
// calendar should tell a busy mom what's going on without a click.
const STATUS_CONFIG: Record<PlaydateStatus, { label: string; className: string }> = {
  active: { label: "Confirmed", className: "bg-confirmedtint text-confirmed" },
  moved: { label: "Moved", className: "bg-movedtint text-moved" },
  cancelled: { label: "Cancelled", className: "bg-cancelledtint text-cancelled" },
};

const WEATHER_CONFIG: Record<NonNullable<WeatherStatus>, { label: string; className: string }> = {
  weather_permitting: { label: "Weather permitting", className: "bg-weathertint text-weather" },
  weather_pending: { label: "Weather pending", className: "bg-weathertint text-weather" },
  confirmed: { label: "Confirmed", className: "bg-confirmedtint text-confirmed" },
  cancelled_due_to_weather: { label: "Cancelled — weather", className: "bg-cancelledtint text-cancelled" },
};

function Badge({ className, children }: { className: string; children: React.ReactNode }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold ${className}`}>
      {children}
    </span>
  );
}

export function StatusBadge({
  status,
  weatherStatus,
}: {
  status: PlaydateStatus;
  weatherStatus?: WeatherStatus;
}) {
  const s = STATUS_CONFIG[status];
  // Skip a redundant weather badge if it says the same thing status already does
  const showWeather =
    weatherStatus && !(status === "cancelled" && weatherStatus === "cancelled_due_to_weather");

  return (
    <span className="inline-flex flex-wrap gap-1.5">
      <Badge className={s.className}>{s.label}</Badge>
      {showWeather && (
        <Badge className={WEATHER_CONFIG[weatherStatus].className}>
          {WEATHER_CONFIG[weatherStatus].label}
        </Badge>
      )}
    </span>
  );
}

// Small color dot used inside tight spaces (calendar chips) where a full
// badge won't fit.
export function statusDotColor(status: PlaydateStatus): string {
  return { active: "bg-confirmed", moved: "bg-moved", cancelled: "bg-cancelled" }[status];
}
