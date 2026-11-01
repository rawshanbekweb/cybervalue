// The leaders' score over time as a step chart: a plain SVG, drawn on the
// server, with a legend and a text summary for screen readers.
const COLORS = [
  "#8052ff",
  "#2fbf8f",
  "#ffb829",
  "#ff6b6b",
  "#4cc9f0",
  "#f78c6b",
  "#c77dff",
  "#90be6d",
  "#f9c74f",
  "#adb5bd",
];

type Series = { name: string; points: { at: number; score: number }[] };

export function ScoreChart({
  series,
  start,
  end,
}: {
  series: Series[];
  start: number;
  end: number;
}) {
  const W = 760;
  const H = 260;
  const pad = { l: 44, r: 12, t: 12, b: 24 };
  const span = Math.max(1, end - start);
  const max = Math.max(
    1,
    ...series.flatMap((s) => s.points.map((p) => p.score)),
  );
  const x = (at: number) =>
    pad.l +
    ((Math.min(Math.max(at, start), end) - start) / span) * (W - pad.l - pad.r);
  const y = (score: number) => H - pad.b - (score / max) * (H - pad.t - pad.b);
  const path = (s: Series) => {
    let d = `M${x(start)},${y(0)}`;
    let last = 0;
    for (const p of s.points) {
      d += ` H${x(p.at).toFixed(1)} V${y(p.score).toFixed(1)}`;
      last = p.score;
    }
    return `${d} H${x(end).toFixed(1)} V${y(last).toFixed(1)}`;
  };
  return (
    <figure className="ctf-chart">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-labelledby="ctf-chart-desc"
      >
        <desc id="ctf-chart-desc">
          {series
            .map((s) => `${s.name}: ${s.points.at(-1)?.score ?? 0}`)
            .join("; ")}
        </desc>
        {[0, 0.5, 1].map((f) => (
          <g key={f}>
            <line
              x1={pad.l}
              x2={W - pad.r}
              y1={y(max * f)}
              y2={y(max * f)}
              stroke="#26262e"
            />
            <text
              x={pad.l - 6}
              y={y(max * f) + 4}
              textAnchor="end"
              fontSize="11"
              fill="#a3a3ad"
            >
              {Math.round(max * f)}
            </text>
          </g>
        ))}
        {series.map((s, i) => (
          <path
            key={s.name}
            d={path(s)}
            fill="none"
            stroke={COLORS[i % COLORS.length]}
            strokeWidth="2"
          />
        ))}
      </svg>
      <figcaption className="ctf-legend">
        {series.map((s, i) => (
          <span key={s.name}>
            <i
              style={{ background: COLORS[i % COLORS.length] }}
              aria-hidden="true"
            />
            {s.name}
          </span>
        ))}
      </figcaption>
    </figure>
  );
}
