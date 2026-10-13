import Link from "next/link";
import { ArrowUpRight, Award, Check } from "lucide-react";
import { getAdminTranslator } from "@/lib/i18n/server";
import { requireStudent } from "@/lib/student/session";
import {
  isEntranceExam,
  studentOverview,
  type TestStats,
} from "@/lib/student/materials";
import { isLevel, LEVEL_LABEL } from "@/lib/student/levels";
import { getDb } from "@/lib/db";
import { formatCertificateCode } from "@/lib/student/certificate";
import { Constellation } from "@/components/student/constellation";
import type { MaterialKind } from "@/generated/prisma/client";

export async function generateMetadata() {
  const t = await getAdminTranslator();
  return { title: t("Student area") };
}

const SECTIONS: { id: string; kind: MaterialKind; label: string }[] = [
  { id: "lessons", kind: "LESSON", label: "Lessons" },
  { id: "labs", kind: "LAB", label: "Labs" },
  { id: "practice", kind: "PRACTICE", label: "Practice" },
  { id: "tests", kind: "QUIZ", label: "Tests" },
];

// Interactive modules that already exist on the site, linked from the lab section.
const OPEN_LABS = [
  { href: "/playground/web-security-lab", title: "Web Security Lab" },
  { href: "/playground/linux-basics", title: "Linux foundations lab" },
  { href: "/playground/network-basics", title: "IP addressing lab" },
  { href: "/playground/ctf", title: "00:17 CTF investigation" },
  { href: "/playground/missions", title: "Investigation missions" },
  { href: "/playground/html-basics", title: "HTML Basics" },
  { href: "/playground/studio", title: "HTML & CSS project studio" },
];

type Overview = Awaited<ReturnType<typeof studentOverview>>;
type Item = Overview["materials"][number];
type T = Awaited<ReturnType<typeof getAdminTranslator>>;

// One line under a test: best score and attempts used, or the attempts on offer.
function testStatus(t: T, item: Item, stats: TestStats | undefined) {
  if (!stats)
    return item.maxAttempts > 0
      ? t("{count} attempts", { count: item.maxAttempts })
      : t("Unlimited attempts");
  const best = t("Best {percent}%", { percent: stats.best });
  const used =
    item.maxAttempts > 0
      ? t("{used} of {max} attempts", {
          used: stats.attempts,
          max: item.maxAttempts,
        })
      : t("{count} attempts", { count: stats.attempts });
  return `${best} · ${used}`;
}

function MaterialItem({
  item,
  done,
  status,
  doneLabel,
}: {
  item: Item;
  done: boolean;
  status?: string;
  doneLabel: string;
}) {
  return (
    <li>
      <Link href={`/student/m/${item.slug}`} className="student-item">
        <span className="student-item-title">{item.title}</span>
        {item.summary && (
          <span className="student-item-summary">{item.summary}</span>
        )}
        {(done || status) && (
          <span className="student-item-status">
            {done && (
              <span className="student-done">
                <Check size={14} aria-hidden="true" />
                {doneLabel}
              </span>
            )}
            {status && <span>{status}</span>}
          </span>
        )}
      </Link>
    </li>
  );
}

export default async function StudentHomePage() {
  const t = await getAdminTranslator();
  const student = await requireStudent();
  const [{ materials, done, tests }, certificates] = await Promise.all([
    studentOverview(student),
    getDb()?.studentCertificate.findMany({
      where: { studentId: student.id, revokedAt: null },
      orderBy: { issuedAt: "desc" },
      select: { code: true, title: true },
    }) ?? [],
  ]);
  const finished = materials.filter((m) => done.has(m.id)).length;
  const entrance = materials.filter((m) => isEntranceExam(m.slug));
  const entranceDone = entrance.filter((m) => done.has(m.id)).length;
  // Personal labs sit with the other labs; the entrance exam has its own
  // section. Empty sections are left out, except Labs with the open labs.
  const sections = SECTIONS.map((section) => ({
    ...section,
    items: materials.filter(
      (m) =>
        !isEntranceExam(m.slug) &&
        (m.kind === section.kind ||
          (section.kind === "LAB" && m.kind === "CHALLENGE")),
    ),
  })).filter((s) => s.items.length > 0 || s.kind === "LAB");
  const jumps = [
    ...(certificates.length
      ? [
          {
            id: "certificates",
            label: "Certificates",
            count: certificates.length,
          },
        ]
      : []),
    ...(entrance.length
      ? [{ id: "entrance", label: "Entrance exam", count: entrance.length }]
      : []),
    ...sections.map((s) => ({
      id: s.id,
      label: s.label,
      count: s.items.length + (s.kind === "LAB" ? OPEN_LABS.length : 0),
    })),
  ];
  const renderItem = (item: Item) => (
    <MaterialItem
      key={item.id}
      item={item}
      done={done.has(item.id)}
      status={
        item.kind === "QUIZ"
          ? testStatus(t, item, tests.get(item.id))
          : undefined
      }
      doneLabel={t("Done")}
    />
  );
  return (
    <>
      <section className="student-hero">
        <div className="student-hero-copy">
          <p className="student-label">
            {student.group
              ? t("Group {group}", { group: student.group })
              : t("Student area")}
            {isLevel(student.level) &&
              ` · ${t("Level: {level}", { level: t(LEVEL_LABEL[student.level]) })}`}
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

      <nav className="student-jump" aria-label={t("Sections")}>
        {jumps.map((jump) => (
          <a key={jump.id} href={`#${jump.id}`}>
            {t(jump.label)}
            <span>{jump.count}</span>
          </a>
        ))}
      </nav>

      {certificates.length > 0 && (
        <section
          id="certificates"
          className="student-section"
          aria-labelledby="certificates-title"
        >
          <div className="student-section-head">
            <h2 id="certificates-title" className="student-section-title">
              {t("Certificates")}
            </h2>
          </div>
          <ul className="student-list">
            {certificates.map((c) => (
              <li key={c.code}>
                <Link
                  href={`/student/certificate/${formatCertificateCode(c.code)}`}
                  className="student-item"
                >
                  <span className="student-item-title">
                    {c.title}
                    <Award size={16} aria-hidden="true" />
                  </span>
                  <span className="student-item-summary">
                    {t("Open, print or save as PDF")}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {entrance.length > 0 && (
        <section
          id="entrance"
          className="student-section"
          aria-labelledby="entrance-title"
        >
          <div className="student-section-head">
            <h2 id="entrance-title" className="student-section-title">
              {t("Entrance exam")}
            </h2>
            <p className="student-quiet">
              {t(
                "Take the parts in order. Your teacher uses the results to choose where your lessons start.",
              )}{" "}
              {t("Finished: {done} of {total}.", {
                done: entranceDone,
                total: entrance.length,
              })}
            </p>
          </div>
          <ul className="student-list">{entrance.map(renderItem)}</ul>
        </section>
      )}

      {sections.map((section) => (
        <section
          key={section.id}
          id={section.id}
          className="student-section"
          aria-labelledby={`${section.id}-title`}
        >
          <div className="student-section-head">
            <h2 id={`${section.id}-title`} className="student-section-title">
              {t(section.label)}
            </h2>
          </div>
          {section.items.length > 0 && (
            <ul className="student-list">{section.items.map(renderItem)}</ul>
          )}
          {section.kind === "LAB" && (
            <div className="student-open-labs">
              <p className="student-field-label">
                {t("Open interactive labs")}
              </p>
              <ul>
                {OPEN_LABS.map((lab) => (
                  <li key={lab.href}>
                    <a href={lab.href}>
                      {t(lab.title)}
                      <ArrowUpRight size={14} aria-hidden="true" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      ))}
    </>
  );
}
