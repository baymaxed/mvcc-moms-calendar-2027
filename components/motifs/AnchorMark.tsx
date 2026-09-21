// A bolder, flat-painted anchor mark — the group's own brand shape rendered
// as a single silhouette, with an optional rope-wrap accent in a second
// color. Used for the header/brand mark and as the List View control; the
// small inline AnchorIcon stays separate for tight spaces like status rows.
export function AnchorMark({
  className = "w-8 h-8",
  color = "currentColor",
  ropeColor,
}: {
  className?: string;
  color?: string;
  ropeColor?: string;
}) {
  return (
    <svg viewBox="0 0 120 140" className={className} aria-hidden="true">
      {/* ring */}
      <circle cx="60" cy="23" r="13" fill="none" stroke={color} strokeWidth="9" />
      {/* shank */}
      <rect x="54.5" y="33" width="11" height="74" rx="5.5" fill={color} />
      {/* stock (crossbar) */}
      <rect x="29" y="50" width="62" height="9.5" rx="4.75" fill={color} />
      {/* arms + flukes, drawn as thick rounded strokes with a triangular fluke tip */}
      <path
        d="M60 100c0 14 -8 24 -21 27.5c-9 2.4 -16.5 -1 -21 -7.5"
        fill="none"
        stroke={color}
        strokeWidth="10"
        strokeLinecap="round"
      />
      <path d="M12 106 L23 118 L8 124 Z" fill={color} />
      <path
        d="M60 100c0 14 8 24 21 27.5c9 2.4 16.5 -1 21 -7.5"
        fill="none"
        stroke={color}
        strokeWidth="10"
        strokeLinecap="round"
      />
      <path d="M108 106 L97 118 L112 124 Z" fill={color} />
      {/* rope wrap accent — a single loose loop across the shank */}
      {ropeColor && (
        <path
          d="M50 27c-9 8 -9 20 0 28c9 8 9 20 0 28c-7 6.5 -8.5 15 -5 22"
          fill="none"
          stroke={ropeColor}
          strokeWidth="3.5"
          strokeLinecap="round"
          opacity="0.85"
        />
      )}
    </svg>
  );
}
