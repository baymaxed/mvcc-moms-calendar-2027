// A quiet corner spray of leaves and small blooms, in the same flat,
// hand-painted style as the group's artwork. Deliberately low-contrast and
// positioned to the edge — this decorates the header without ever sitting
// behind text or competing with it for attention.
export function FloralSpray({ className = "w-28 h-28", flip = false }: { className?: string; flip?: boolean }) {
  return (
    <svg
      viewBox="0 0 160 160"
      className={className}
      style={flip ? { transform: "scaleX(-1)" } : undefined}
      aria-hidden="true"
    >
      {/* stems */}
      <path d="M8 150C30 120 34 90 26 60" fill="none" stroke="#7C9C86" strokeWidth="3" strokeLinecap="round" opacity="0.55" />
      <path d="M20 150C44 128 52 100 46 74" fill="none" stroke="#7C9C86" strokeWidth="2.5" strokeLinecap="round" opacity="0.5" />
      {/* leaves */}
      <path d="M26 60c8 2 14 9 15 18-9-1-16-8-15-18Z" fill="#7C9C86" opacity="0.6" />
      <path d="M46 74c9 1 16 8 16 17-9 0-17-7-16-17Z" fill="#23402F" opacity="0.45" />
      <path d="M22 92c-9-2-16-10-15-19 9 1 16 9 15 19Z" fill="#7C9C86" opacity="0.55" />
      <path d="M36 112c-9-1-17-8-17-17 9 0 17 7 17 17Z" fill="#23402F" opacity="0.4" />
      {/* small blooms */}
      <circle cx="14" cy="46" r="5.5" fill="#C97B5C" opacity="0.55" />
      <circle cx="34" cy="54" r="4" fill="#BED9EC" opacity="0.7" />
      <circle cx="10" cy="60" r="3" fill="#BED9EC" opacity="0.6" />
      <circle cx="42" cy="40" r="3.5" fill="#C97B5C" opacity="0.4" />
    </svg>
  );
}
