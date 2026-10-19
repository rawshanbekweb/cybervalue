import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { LAB_META } from "@/lib/lab-progress";
import { formatDue } from "@/lib/student/assignments";
import type { NextStep } from "@/lib/student/next-step";

type Translate = (
  key: string,
  values?: Record<string, string | number>,
) => string;

function labLabel(step: Extract<NextStep, { kind: "lab" }>, t: Translate) {
  return step.done > 0
    ? t("Lesson {lesson} of {total}", {
        lesson: step.done + 1,
        total: step.total,
      })
    : t("A good first lab");
}

/** One clear call to action at the top of the student page. */
export function NextStepCard({
  step,
  t,
  locale,
}: {
  step: NextStep;
  t: Translate;
  locale: "uz" | "en";
}) {
  if (step.kind === "done")
    return (
      <div className="student-next is-done">
        <CheckCircle2 size={20} aria-hidden="true" />
        <p>
          {t(
            "Everything is done for now. Your teacher will add new work soon; meanwhile try the CTF or the project studio.",
          )}
        </p>
      </div>
    );
  const label =
    step.kind === "assignment"
      ? t("Due {date}", { date: formatDue(step.dueAt, locale) })
      : step.kind === "entrance"
        ? t("Entrance exam")
        : step.kind === "material"
          ? t("From your teacher")
          : labLabel(step, t);
  const title =
    step.kind === "lab"
      ? LAB_META.find((l) => l.id === step.lab)!.title[locale]
      : step.title;
  const action =
    step.kind === "lab" && step.done > 0 ? t("Continue") : t("Start");
  return (
    <Link href={step.href} className="student-next">
      <span className="student-next-eyebrow">{t("Your next step")}</span>
      <span className="student-next-title">{title}</span>
      <span className="student-next-meta">{label}</span>
      <span className="student-next-action">
        {action}
        <ArrowRight size={16} aria-hidden="true" />
      </span>
    </Link>
  );
}
