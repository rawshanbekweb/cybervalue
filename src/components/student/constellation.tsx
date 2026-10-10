// Decorative particle field from the design reference: small outlined
// triangles clustered into an organic, brain-like cloud. Deterministic, so the
// server and client markup always agree, and pure SVG/CSS with no script.
const COLORS = [
  "#8052ff",
  "#ffb829",
  "#15846e",
  "#d94fd6",
  "#4f8bff",
  "#a98bff",
];
// Overlapping lobes (cx, cy, rx, ry) that read as a cloud or brain outline.
const LOBES = [
  [200, 190, 150, 110],
  [130, 160, 85, 75],
  [270, 150, 95, 80],
  [205, 110, 105, 60],
  [165, 255, 90, 55],
  [270, 245, 70, 55],
];

function random(seed: number) {
  return () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };
}

export function Constellation({
  count = 320,
  seed = 7,
  className = "",
}: {
  count?: number;
  seed?: number;
  className?: string;
}) {
  const rand = random(seed);
  const particles = Array.from({ length: count }, (_, i) => {
    const ambient = i % 7 === 0;
    let x: number, y: number;
    if (ambient) {
      x = rand() * 400;
      y = rand() * 380;
    } else {
      const [cx, cy, rx, ry] = LOBES[Math.floor(rand() * LOBES.length)];
      // Square root keeps the density even across each lobe.
      const r = Math.sqrt(rand());
      const angle = rand() * Math.PI * 2;
      x = cx + Math.cos(angle) * rx * r;
      y = cy + Math.sin(angle) * ry * r;
    }
    const size = 2 + rand() * (ambient ? 3 : 4);
    const turn = rand() * 360;
    return {
      points: `0,${-size} ${size * 0.87},${size / 2} ${-size * 0.87},${size / 2}`,
      transform: `translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${turn.toFixed(0)})`,
      color: COLORS[Math.floor(rand() * COLORS.length)],
      opacity: ambient ? 0.35 : 0.6 + rand() * 0.4,
      delay: `${(rand() * 6).toFixed(2)}s`,
    };
  });
  return (
    <svg
      className={`student-constellation ${className}`}
      viewBox="0 0 400 380"
      aria-hidden="true"
      focusable="false"
    >
      {particles.map((p, i) => (
        <polygon
          key={i}
          points={p.points}
          transform={p.transform}
          fill="none"
          stroke={p.color}
          strokeWidth={0.9}
          opacity={p.opacity}
          style={{ animationDelay: p.delay }}
        />
      ))}
    </svg>
  );
}
