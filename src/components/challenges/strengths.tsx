// Category strength charts for the CTF scoreboard and entrant pages: plain
// SVG and CSS drawn on the server. The animations (challenges.css) play when
// a page first opens; the scoreboard's auto-refresh keeps the same nodes, so
// they don't replay every few seconds, and reduced motion turns them off.
import Link from "next/link";
import type { CategoryStat } from "@/lib/challenges/strengths";

type T = (key: string, values?: Record<string, string | number>) => string;

const COLORS: Record<string, string> = {
  Crypto: "#8052ff",
  Web: "#4cc9f0",
  Forensics: "#2fbf8f",
  OSINT: "#ffb829",
  Stego: "#f78c6b",
  Reverse: "#c77dff",
  Pwn: "#ff6b6b",
  Misc: "#90be6d",
};
export const categoryColor = (category: string) =>
  COLORS[category] ?? "#adb5bd";

const pct = (share: number) => Math.round(share * 100);

/** A thin stacked bar of where a row's points came from. */
export function CategoryStrip({ stats, t }: { stats: CategoryStat[]; t: T }) {
  const scored = stats.filter((s) => s.points > 0);
  const total = scored.reduce((sum, s) => sum + s.points, 0);
  if (!total) return <span className="ctf-muted">—</span>;
  const label = scored.map((s) => `${s.category} ${s.points}`).join(", ");
  return (
    <span
      className="ctf-strip"
      role="img"
      aria-label={t("Points by category: {list}", { list: label })}
      title={label}
    >
      {scored.map((s) => (
        <i
          key={s.category}
          style={{
            flexGrow: s.points,
            background: categoryColor(s.category),
          }}
        />
      ))}
    </span>
  );
}

/** A radar of the share won in each category (needs three or more). */
export function StrengthRadar({
  stats,
  label,
}: {
  stats: CategoryStat[];
  label: string;
}) {
  const n = stats.length;
  if (n < 3) return null;
  const size = 320;
  const c = size / 2;
  const r = 112;
  const at = (i: number, f: number) => {
    const a = -Math.PI / 2 + (2 * Math.PI * i) / n;
    return [c + Math.cos(a) * r * f, c + Math.sin(a) * r * f] as const;
  };
  const ring = (f: number) =>
    stats
      .map((_, i) =>
        at(i, f)
          .map((v) => v.toFixed(1))
          .join(","),
      )
      .join(" ");
  // A sliver even at 0, so the shape is always visible.
  const shape = stats
    .map((s, i) =>
      at(i, Math.max(0.04, s.share))
        .map((v) => v.toFixed(1))
        .join(","),
    )
    .join(" ");
  return (
    <figure className="ctf-radar">
      <svg
        // Room on every side for the category labels outside the rings.
        viewBox={`-80 -24 ${size + 160} ${size + 48}`}
        role="img"
        aria-label={label}
      >
        {[0.25, 0.5, 0.75, 1].map((f) => (
          <polygon
            key={f}
            points={ring(f)}
            fill="none"
            stroke="#26262e"
            strokeWidth={f === 1 ? 1.5 : 1}
          />
        ))}
        {stats.map((s, i) => {
          const [x, y] = at(i, 1);
          return (
            <line
              key={s.category}
              x1={c}
              y1={c}
              x2={x}
              y2={y}
              stroke="#26262e"
            />
          );
        })}
        <g
          className="ctf-radar-shape"
          style={{ transformOrigin: `${c}px ${c}px` }}
        >
          <polygon
            points={shape}
            fill="rgba(128, 82, 255, 0.28)"
            stroke="#a68bff"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          {stats.map((s, i) => {
            const [x, y] = at(i, Math.max(0.04, s.share));
            return (
              <circle
                key={s.category}
                cx={x}
                cy={y}
                r="4.5"
                fill={categoryColor(s.category)}
                stroke="#0b0b10"
                strokeWidth="1.5"
              />
            );
          })}
        </g>
        {stats.map((s, i) => {
          const [x, y] = at(i, 1.2);
          return (
            <text
              key={s.category}
              x={x}
              y={y + 4}
              textAnchor={x < c - 4 ? "end" : x > c + 4 ? "start" : "middle"}
              fontSize="13"
              fontWeight="600"
              fill={categoryColor(s.category)}
            >
              {s.category} {pct(s.share)}%
            </text>
          );
        })}
      </svg>
    </figure>
  );
}

/** One animated bar per category: share won, points and challenges. */
export function StrengthBars({ stats, t }: { stats: CategoryStat[]; t: T }) {
  return (
    <ul className="ctf-bars">
      {stats.map((s, i) => (
        <li key={s.category}>
          <span className="ctf-bars-name">
            <i style={{ background: categoryColor(s.category) }} />
            {s.category}
          </span>
          <span className="ctf-bars-track" aria-hidden="true">
            <span
              className="ctf-bars-fill"
              style={{
                width: `${pct(s.share)}%`,
                background: categoryColor(s.category),
                animationDelay: `${i * 90}ms`,
              }}
            />
          </span>
          <span className="ctf-bars-value">
            <b>{pct(s.share)}%</b>{" "}
            <span className="ctf-muted ctf-small">
              {t("{points} of {possible} pts · {solved}/{total}", {
                points: s.points,
                possible: s.possible,
                solved: s.solved,
                total: s.total,
              })}
            </span>
          </span>
        </li>
      ))}
    </ul>
  );
}

type PodiumRow = {
  entrantId: string;
  name: string;
  score: number;
  solved: number;
  team: boolean;
};

/** The top three as a podium: second, first, third. */
export function Podium({
  rows,
  slug,
  t,
}: {
  rows: PodiumRow[];
  slug: string;
  t: T;
}) {
  const top = rows.slice(0, 3).filter((r) => r.score > 0);
  if (!top.length) return null;
  const places = [
    { row: top[1], place: 2 },
    { row: top[0], place: 1 },
    { row: top[2], place: 3 },
  ].filter((p) => p.row);
  return (
    <ol className="ctf-podium" aria-label={t("Top three")}>
      {places.map(({ row, place }) => (
        <li key={row.entrantId} className={`ctf-podium-place is-${place}`}>
          <span className="ctf-podium-medal" aria-hidden="true">
            {place === 1 ? "🥇" : place === 2 ? "🥈" : "🥉"}
          </span>
          <Link
            href={`/challenges/${slug}/entrant/${row.entrantId}`}
            className="ctf-podium-name"
          >
            {row.name}
          </Link>
          <span className="ctf-podium-score">
            {t("{score} points", { score: row.score })}
          </span>
          <span className="ctf-muted ctf-small">
            {row.team ? t("team") : t("solo")} ·{" "}
            {t("{count} solved", { count: row.solved })}
          </span>
          <span className="ctf-podium-step" aria-hidden="true">
            {place}
          </span>
        </li>
      ))}
    </ol>
  );
}
