import Link from "next/link";
import { ArrowUpRight, Check } from "lucide-react";
import { getAdminTranslator } from "@/lib/i18n/server";
import { requireStudent } from "@/lib/student/session";
import { studentOverview } from "@/lib/student/materials";
import { Constellation } from "@/components/student/constellation";
import type { MaterialKind } from "@/generated/prisma/client";

export const metadata = { title: "Student area" };

const SECTIONS: {
  id: string;
  kind: MaterialKind;
  label: string;
  title: string;
  empty: string;
}[] = [
  {
    id: "lessons",
    kind: "LESSON",
    label: "Lessons",
    title: "Materials that stay inside the class.",
    empty: "No private lessons yet.",
  },
  {
    id: "labs",
    kind: "LAB",
    label: "Labs",
    title: "Hands-on labs.",
    empty: "No private labs yet.",
  },
  {
    id: "practice",
    kind: "PRACTICE",
    label: "Practice",
    title: "Practice your teacher reviews.",
    empty: "No practice tasks yet.",
  },
  {
    id: "tests",
    kind: "QUIZ",
    label: "Tests",
    title: "Tests graded on the server.",
    empty: "No tests yet.",
  },
];

// Interactive modules that already exist on the site, linked from the lab section.
const OPEN_LABS = [
  { href: "/playground/web-security-lab", title: "Web Security Lab" },
  { href: "/playground/linux-basics", title: "Linux foundations lab" },
  { href: "/playground/ctf", title: "00:17 CTF investigation" },
  { href: "/playground/missions", title: "Investigation missions" },
  { href: "/playground/html-basics", title: "HTML Basics" },
  { href: "/playground/studio", title: "HTML & CSS project studio" },
];

export default async function StudentHomePage() {
  const t = await getAdminTranslator();
  const student = await requireStudent();
  const { materials, done } = await studentOverview(student);
  const finished = materials.filter((m) => done.has(m.id)).length;
  return (
    <>
      <section className="student-hero">
        <div className="student-hero-copy">
          <p className="student-label">
            {student.group
              ? t("Group {group}", { group: student.group })
              : t("Student area")}
          </p>
          <h1 className="student-display">
            {t("Hello, {name}.", { name: student.name.split(" ")[0] })}
          </h1>
          <p className="student-lead">
            {materials.length
              ? t("You have finished {done} of {total} materials.", {
                  done: finished,
                  total: materials.length,
                })
              : t(
                  "Your teacher has not published materials yet. Meanwhile, the open labs below are ready.",
                )}
          </p>
          {materials.length > 0 && (
            <div
              className="student-progress"
              role="progressbar"
              aria-label={t("Progress")}
              aria-valuemin={0}
              aria-valuemax={materials.length}
              aria-valuenow={finished}
            >
              <span
                style={{
                  width: `${Math.round((finished / materials.length) * 100)}%`,
                }}
              />
            </div>
          )}
        </div>
        <Constellation className="student-hero-art" seed={11} />
      </section>

      {SECTIONS.map((section) => {
        // Personal labs sit with the other labs.
        const items = materials.filter(
          (m) =>
            m.kind === section.kind ||
            (section.kind === "LAB" && m.kind === "CHALLENGE"),
        );
        return (
          <section
            key={section.id}
            id={section.id}
            className="student-section"
            aria-labelledby={`${section.id}-title`}
          >
            <div className="student-section-head">
              <p className="student-label">{t(section.label)}</p>
              <h2 id={`${section.id}-title`} className="student-heading">
                {t(section.title)}
              </h2>
            </div>
            <div>
              {items.length === 0 && section.kind !== "LAB" && (
                <p className="student-quiet">{t(section.empty)}</p>
              )}
              <ul className="student-list">
                {items.map((item) => (
                  <li key={item.id}>
                    <Link
                      href={`/student/m/${item.slug}`}
                      className="student-item"
                    >
                      <span className="student-item-title">
                        {item.title}
                        {done.has(item.id) && (
                          <span className="student-done">
                            <Check size={14} aria-hidden="true" />
                            {t("Done")}
                          </span>
                        )}
                      </span>
                      {item.summary && (
                        <span className="student-item-summary">
                          {item.summary}
                        </span>
                      )}
                    </Link>
                  </li>
                ))}
                {section.kind === "LAB" &&
                  OPEN_LABS.map((lab) => (
                    <li key={lab.href}>
                      <a href={lab.href} className="student-item">
                        <span className="student-item-title">
                          {t(lab.title)}
                          <ArrowUpRight size={18} aria-hidden="true" />
                        </span>
                        <span className="student-item-summary">
                          {t("Open interactive lab")}
                        </span>
                      </a>
                    </li>
                  ))}
              </ul>
            </div>
          </section>
        );
      })}
    </>
  );
}
