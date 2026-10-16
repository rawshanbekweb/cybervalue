import { CalendarClock, Check } from "lucide-react";
import {
  dueLabel,
  formatDue,
  isUrgent,
  STATUS_TEXT,
  targetHref,
  targetName,
  type AssignmentStatus,
  type Target,
} from "@/lib/student/assignments";

type T = (source: string, values?: Record<string, string | number>) => string;

export type StudentAssignment = {
  id: string;
  title: string;
  note: string;
  dueAt: Date;
  target: Target;
  material: { title: string; slug: string } | null;
  status: AssignmentStatus;
};

// The teacher's assignments at the top of the student page: open work due
// this week and anything missed first, then the rest.
export function AssignmentsSection({
  assignments,
  now,
  t,
  locale,
}: {
  assignments: StudentAssignment[];
  now: number;
  t: T;
  locale: "uz" | "en";
}) {
  const urgent = assignments.filter((a) => isUrgent(a.status, a.dueAt, now));
  const rest = assignments.filter((a) => !urgent.includes(a));
  const ordered = [...urgent, ...rest];
  return (
    <section
      id="assignments"
      className="student-section"
      aria-labelledby="assignments-title"
    >
      <div className="student-section-head">
        <h2 id="assignments-title" className="student-section-title">
          {t("Assignments")}
        </h2>
        <p className="student-quiet">
          {urgent.length
            ? t("{count} to hand in this week", { count: urgent.length })
            : t("Nothing due this week. Well done.")}
        </p>
      </div>
      <ul className="student-list student-assignments">
        {ordered.map((a) => {
          const due = dueLabel(a.dueAt, now);
          const finished = a.status === "done" || a.status === "late";
          return (
            <li key={a.id}>
              <a
                href={targetHref(a.target, a.material?.slug)}
                className={`student-item student-assignment is-${a.status}`}
              >
                <span className="student-item-title">{a.title}</span>
                <span className="student-item-summary">
                  {targetName(a, locale, t)}
                  {a.note && ` — ${a.note}`}
                </span>
                <span className="student-item-status">
                  {finished ? (
                    <span className="student-done">
                      <Check size={14} aria-hidden="true" />
                      {t(STATUS_TEXT[a.status])}
                    </span>
                  ) : (
                    <span
                      className={`student-pill ${a.status === "missed" ? "warn" : ""}`}
                    >
                      {a.status === "missed"
                        ? t(STATUS_TEXT.missed)
                        : t(due.text, { days: due.days ?? 0 })}
                    </span>
                  )}
                  <span>
                    <CalendarClock size={13} aria-hidden="true" />{" "}
                    {formatDue(a.dueAt, locale)}
                  </span>
                </span>
              </a>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
