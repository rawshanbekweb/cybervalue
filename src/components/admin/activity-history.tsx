import type { HistoryItem } from "@/lib/admin/analytics";
import { formatDue } from "@/lib/student/assignments";
import { DayHeat } from "./charts";

type Translate = (
  key: string,
  values?: Record<string, string | number>,
) => string;

const KIND: Record<HistoryItem["kind"], string> = {
  answer: "Answer sent",
  completed: "Completed",
  checkpoint: "Checkpoint attempt",
  certificate: "Certificate issued",
  lab: "Lab progress saved",
};

/** A student's activity: busy days over 12 weeks and the latest events. */
export function ActivityHistory({
  days,
  from,
  items,
  locale,
  t,
}: {
  days: number[];
  from: number;
  items: HistoryItem[];
  locale: "uz" | "en";
  t: Translate;
}) {
  return (
    <section aria-labelledby="activity-history">
      <h2 id="activity-history">{t("Activity history")}</h2>
      <DayHeat
        title={t("Active days")}
        days={days}
        from={from}
        locale={locale}
        t={t}
      />
      {items.length === 0 ? (
        <p className="muted">{t("No activity yet")}</p>
      ) : (
        <ol className="admin-history">
          {items.map((item, i) => (
            <li key={i}>
              <time dateTime={item.at.toISOString()}>
                {formatDue(item.at, locale)}
              </time>
              <span>
                <strong>{t(KIND[item.kind])}</strong> · {item.title}
                {item.detail && (
                  <span className="muted">
                    {" · "}
                    {item.kind === "lab"
                      ? t("{count} lessons done", { count: item.detail })
                      : item.detail}
                  </span>
                )}
              </span>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
