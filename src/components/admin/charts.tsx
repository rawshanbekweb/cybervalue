import { DAY, heatLevel, signed } from "@/lib/admin/activity";

// Small charts for the admin, drawn on the server with plain HTML. Every
// chart has a hidden table with the same numbers, and every mark can be
// focused to show its value, so nothing depends on hovering.

type Translate = (
  key: string,
  values?: Record<string, string | number>,
) => string;

const short = (at: number, locale: "uz" | "en") =>
  new Intl.DateTimeFormat(locale === "uz" ? "uz-Latn" : "en-GB", {
    day: "numeric",
    month: "short",
    timeZone: "Asia/Tashkent",
  }).format(at);

/** One number with its change against the previous period. */
export function StatTile({
  label,
  value,
  previous,
  t,
}: {
  label: string;
  value: number;
  previous: number;
  t: Translate;
}) {
  const change = value - previous;
  return (
    <div className="admin-card admin-stat">
      <span className="eyebrow">{label}</span>
      <strong>{value.toLocaleString("en-US")}</strong>
      <span className="muted">
        <span aria-hidden="true">
          {change > 0 ? "↑ " : change < 0 ? "↓ " : ""}
        </span>
        {t("{change} vs the 7 days before", { change: signed(change) })}
      </span>
    </div>
  );
}

/** Columns for the last weeks, oldest first; the current week is partial. */
export function WeeklyColumns({
  title,
  caption,
  values,
  from,
  locale,
  t,
}: {
  title: string;
  caption: string;
  values: number[];
  from: number;
  locale: "uz" | "en";
  t: Translate;
}) {
  const peak = Math.max(1, ...values);
  const label = (i: number) => short(from + i * 7 * DAY, locale);
  const last = values.length - 1;
  return (
    <figure className="admin-activity admin-chart">
      <figcaption className="admin-chart-title">
        <strong>{title}</strong>
        <span className="muted">{caption}</span>
      </figcaption>
      <div className="admin-activity-bars admin-chart-bars">
        {values.map((count, i) => (
          <span
            key={i}
            className={`admin-activity-bar ${i === last ? "is-current" : ""}`}
            role="img"
            tabIndex={0}
            aria-label={`${t("Week of {date}", { date: label(i) })}: ${count}`}
            data-tip={`${t("Week of {date}", { date: label(i) })}: ${count}`}
            style={{
              height: count > 0 ? `${Math.max(2, (count / peak) * 100)}%` : 0,
            }}
          >
            {(i === last || (count === peak && count > 0)) && (
              <span className="admin-chart-value" aria-hidden="true">
                {count}
              </span>
            )}
          </span>
        ))}
      </div>
      <div className="admin-activity-axis" aria-hidden="true">
        <span>{label(0)}</span>
        <span>{t("This week")}</span>
      </div>
      <table className="visually-hidden">
        <caption>{title}</caption>
        <tbody>
          {values.map((count, i) => (
            <tr key={i}>
              <th scope="row">{t("Week of {date}", { date: label(i) })}</th>
              <td>{count}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}

/** 12 weeks × 7 days, one hue: darker cells are busier days. */
export function DayHeat({
  title,
  days,
  from,
  locale,
  t,
}: {
  title: string;
  days: number[];
  from: number;
  locale: "uz" | "en";
  t: Translate;
}) {
  const peak = Math.max(0, ...days);
  const weeks = Math.ceil(days.length / 7);
  const active = days.filter((d) => d > 0).length;
  return (
    <figure className="admin-heat">
      <figcaption className="admin-chart-title">
        <strong>{title}</strong>
        <span className="muted">
          {t("{days} active days in the last 12 weeks", { days: active })}
        </span>
      </figcaption>
      <div className="admin-heat-grid">
        {days.map((count, i) => {
          const date = short(from + i * DAY, locale);
          return (
            <span
              key={i}
              className={`admin-heat-cell level-${heatLevel(count, peak)}`}
              style={{
                gridColumn: Math.floor(i / 7) + 1,
                gridRow: (i % 7) + 1,
              }}
              role="img"
              tabIndex={count > 0 ? 0 : -1}
              aria-label={`${date}: ${count}`}
              data-tip={`${date}: ${count}`}
            />
          );
        })}
      </div>
      <div className="admin-heat-legend" aria-hidden="true">
        <span>{t("Less")}</span>
        {[0, 1, 2, 3, 4].map((l) => (
          <span key={l} className={`admin-heat-cell level-${l}`} />
        ))}
        <span>{t("More")}</span>
      </div>
      <table className="visually-hidden">
        <caption>{title}</caption>
        <tbody>
          {Array.from({ length: weeks }, (_, w) => (
            <tr key={w}>
              <th scope="row">
                {t("Week of {date}", {
                  date: short(from + w * 7 * DAY, locale),
                })}
              </th>
              <td>{days.slice(w * 7, w * 7 + 7).reduce((a, b) => a + b, 0)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}

/** A thin bar for a value out of a maximum, with the number beside it. */
export function Meter({
  value,
  max,
  text,
}: {
  value: number;
  max: number;
  text: string;
}) {
  const width = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  return (
    <span className="admin-inline-meter">
      <span className="admin-inline-meter-track" aria-hidden="true">
        <span style={{ width: `${width}%` }} />
      </span>
      <span>{text}</span>
    </span>
  );
}
