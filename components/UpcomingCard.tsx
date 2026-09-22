import type { Playdate } from "@/types/playdate";
import { formatDuration } from "@/lib/format";

const CARD_FILL: Record<Playdate["status"], string> = {
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

// "Sat, Jan 2" — short weekday + short month + day, distinct from the
// detail sheet's fuller "Saturday, January 2".
function shortDateLabel(dateStr: string): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export function UpcomingCard({
  playdate,
  onSelect,
  showDate = true,
}: {
  playdate: Playdate;
  onSelect: (p: Playdate) => void;
  showDate?: boolean;
}) {
  const p = playdate;
  return (
    <button
      onClick={() => onSelect(p)}
      className={`w-full text-left rounded-card px-4 py-3 transition-transform active:scale-[0.98] ${CARD_FILL[p.status]}`}
    >
      <div className="flex items-start justify-between gap-2">
        {showDate ? (
          <p className={`text-[11px] font-bold uppercase tracking-wide ${CARD_TEXT[p.status]} opacity-70`}>
            {shortDateLabel(p.date)}
          </p>
        ) : (
          <span />
        )}
        {BADGE_LABEL[p.status] && (
          <span className="shrink-0 rounded-full bg-white px-2.5 py-0.5 text-[10px] font-bold text-ink/70">
            {BADGE_LABEL[p.status]}
          </span>
        )}
      </div>
      <p className={`font-serif font-semibold text-lg leading-snug mt-0.5 ${CARD_TEXT[p.status]}`}>{p.title}</p>
      <p className={`text-[13px] font-medium mt-1 ${CARD_TEXT[p.status]} opacity-80`}>
        {formatDuration(p.start_time, p.end_time)}
        {p.location_name ? ` · ${p.location_name}` : ""}
      </p>
    </button>
  );
}
