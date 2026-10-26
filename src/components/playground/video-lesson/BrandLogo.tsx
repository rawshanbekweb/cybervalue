// The Cybervalue emblem (ring, corner brackets, shield, "CV") drawn as SVG.
// `p` (0…1) draws it in: the ring, then the brackets and shield, then the
// letters and the crosshair dots. At p = 1 it is the finished logo.

const clamp = (x: number) => Math.min(1, Math.max(0, x));
const seg = (p: number, a: number, b: number) => clamp((p - a) / (b - a));

/** Stroke drawn from 0 to the full length as x goes 0…1. */
const draw = (x: number, length: number) => ({
  strokeDasharray: length,
  strokeDashoffset: length * (1 - x),
});

export function BrandLogo({
  p = 1,
  className,
}: {
  p?: number;
  className?: string;
}) {
  const ring = seg(p, 0, 0.35);
  const corners = seg(p, 0.2, 0.45);
  const shield = seg(p, 0.3, 0.6);
  const letters = seg(p, 0.55, 0.75);
  const dots = seg(p, 0.65, 0.85);
  return (
    <svg
      viewBox="0 0 640 640"
      className={className}
      role="img"
      aria-label="Cybervalue"
    >
      <circle cx="320" cy="320" r="304" fill="#0b1a2b" opacity={ring} />
      <circle
        cx="320"
        cy="320"
        r="304"
        fill="none"
        stroke="#3b8be0"
        strokeWidth="5"
        transform="rotate(-90 320 320)"
        style={draw(ring, 1910)}
      />
      <circle
        cx="320"
        cy="320"
        r="276"
        fill="none"
        stroke="#2c4763"
        strokeWidth="2"
        opacity={ring}
      />
      <g
        fill="none"
        stroke="#3b8be0"
        strokeWidth="4"
        style={{ opacity: corners }}
      >
        <path d="M100 150V100h50" style={draw(corners, 100)} />
        <path d="M490 100h50v50" style={draw(corners, 100)} />
        <path d="M100 490v50h50" style={draw(corners, 100)} />
        <path d="M490 540h50v-50" style={draw(corners, 100)} />
      </g>
      <g strokeLinejoin="round">
        <path
          d="M320 160l110 55v105L320 445 210 320V215z"
          fill="#132e4d"
          fillOpacity={shield}
          stroke="#9cc3ee"
          strokeWidth="3"
          style={draw(shield, 860)}
        />
        <path
          d="M320 193l80 42v95l-80 82-80-82v-95z"
          fill="none"
          stroke="#3b8be0"
          strokeWidth="3"
          style={draw(shield, 680)}
        />
      </g>
      <text
        x="320"
        y="358"
        textAnchor="middle"
        fontFamily="Inter, Arial, sans-serif"
        fontWeight="700"
        fontSize="104"
        fill="#eaf2fb"
        opacity={letters}
      >
        CV
      </text>
      <g opacity={dots}>
        <g stroke="#5b7896" strokeWidth="2">
          <path d="M320 140v20M320 455v40M140 320h42M458 320h42" />
        </g>
        <g fill="#3b8be0">
          <circle cx="320" cy="131" r="6" />
          <circle cx="320" cy="508" r="6" />
          <circle cx="131" cy="320" r="6" />
          <circle cx="508" cy="320" r="6" />
        </g>
      </g>
    </svg>
  );
}
