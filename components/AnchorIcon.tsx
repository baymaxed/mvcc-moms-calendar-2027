// A quiet, hand-drawn-feeling anchor mark - used as a small recurring motif
// (header, empty states, loading) rather than literal illustration.
export function AnchorIcon({ className = "w-5 h-5", strokeWidth = 1.6 }: { className?: string; strokeWidth?: number }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <circle cx="12" cy="5" r="2.1" />
      <line x1="12" y1="7.2" x2="12" y2="19" />
      <path d="M6 10c0 1 .6 1.6 1.2 1.6H9" />
      <path d="M18 10c0 1-.6 1.6-1.2 1.6H15" />
      <path d="M5 15a7 7 0 0 0 14 0" />
    </svg>
  );
}
