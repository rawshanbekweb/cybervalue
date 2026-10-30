import Link from "next/link";
import { ArrowUpRight, Award, Check } from "lucide-react";
import { getAdminLocale, getAdminTranslator } from "@/lib/i18n/server";
import { loadStandings } from "@/lib/student/standing";
import { heroes, publicName } from "@/lib/student/xp";
import {
  AchievementsSection,
  StandingCard,
  type RankingEntry,
} from "@/components/student/standing-panel";
import { requireStudent } from "@/lib/student/session";
import { studentAssignments } from "@/lib/student/assignment-data";
import { visibleSince } from "@/lib/student/assignments";
import { HtmlExamCard } from "@/components/student/html-exam";
import { AssignmentsSection } from "@/components/student/assignments-panel";
import { deepLink, telegramConfig } from "@/lib/telegram/api";
import { signLink } from "@/lib/telegram/link";
import { linkSecret } from "@/lib/telegram/webhook";
import {
  isEntranceExam,
  studentOverview,
  type TestStats,
} from "@/lib/student/materials";
import { isLevel, LEVEL_LABEL, opensIntermediate } from "@/lib/student/levels";
import { getDb } from "@/lib/db";
import { nextStep } from "@/lib/student/next-step";
import { getSiteConfig } from "@/lib/site-config-server";
import { closedSection } from "@/lib/site-config";
import { NextStepCard } from "@/components/student/next-step";
import {
  isLabId,
  LAB_META,
  LAB_PROGRESS,
  lessonList,
  type LabId,
} from "@/lib/lab-progress";
import { getLearningTracks } from "@/lib/learning";
import { CHECKPOINT_META } from "@/lib/checkpoints/meta";
import { AWARD_RULES } from "@/lib/student/award-rules";
import { PathSection, type PathLab } from "@/components/student/path-section";
import { formatCertificateCode } from "@/lib/student/certificate";
import { Constellation } from "@/components/student/constellation";
import { Constellation as ParticlePortrait } from "@/components/constellation";
import { PortraitUploadForm } from "@/components/portrait-upload";
import { isPortraitData } from "@/lib/portrait-data";
import {
  removeStudentPortraitAction,
  saveStudentPortraitAction,
} from "../actions";
import type { MaterialKind } from "@/generated/prisma/client";

export async function generateMetadata() {
  const t = await getAdminTranslator();
  return { title: t("Student area") };
}

const SECTIONS: { id: string; kind: MaterialKind; label: string }[] = [
  { id: "lessons", kind: "LESSON", label: "Lessons" },
  { id: "labs", kind: "LAB", label: "Labs" },
  { id: "practice", kind: "PRACTICE", label: "Practice" },
  { id: "tests", kind: "QUIZ", label: "Tests and exams" },
];

// Every other way to be tested, listed with the teacher's tests so students
// find all of them in one place.
const EXAMS = [
  {
    href: "#path",
    title: "Lab checkpoints",
    summary:
      "Short tests at the end of each lab. They and your best score are on each lab’s card under My path.",
  },
  {
    href: "/akademiya/html-basics/assessment",
    title: "HTML exam",
    summary:
      "A timed, graded HTML exam. It needs its own code from your teacher.",
  },
  {
    href: "/resources/exam",
    title: "Resources exam",
    summary:
      "A self-check on the Web basics and Linux slides. You see the result at once; it is not sent to the teacher.",
  },
  {
    href: "/resources/linux-ip-exam",
    title: "Linux and IP exam",
    summary:
      "40 tests and 10 open questions on Linux commands and IP addressing, 2 hours. Copying and screenshots are off; the result shows at once and is not sent to the teacher.",
  },
];

// Practice that is not a lesson-by-lesson lab, listed under My path.
const EXTRAS = [
  { href: "/akademiya/ctf", title: "00:17 CTF investigation" },
  { href: "/akademiya/missions", title: "Investigation missions" },
  { href: "/akademiya/studio", title: "HTML & CSS project studio" },
  { href: "/akademiya/defend", title: "Build & Defend" },
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
  const locale = await getAdminLocale();
  const student = await requireStudent();
  const db = getDb();
  // Classmates for the ranking: active students of the same group.
  const classmates =
    db && student.group
      ? await db.student.findMany({
          where: { group: student.group, active: true },
          select: {
            id: true,
            name: true,
            group: true,
            level: true,
            bonusXp: true,
          },
          take: 200,
        })
      : [
          {
            id: student.id,
            name: student.name,
            group: student.group,
            level: student.level,
            bonusXp: student.bonusXp,
          },
        ];
  const now = new Date().getTime();
  const config = await getSiteConfig();
  // Labs whose page is switched off in the site settings are not offered.
  const opens = (href: string) => !closedSection(config, href);
  const extras = EXTRAS.filter((lab) => opens(lab.href));
  const [
    { materials, done, tests, returned, closed },
    certificates,
    saved,
    standings,
    assignments,
    htmlExams,
    labRows,
  ] = await Promise.all([
    studentOverview(student),
    getDb()?.studentCertificate.findMany({
      where: { studentId: student.id, revokedAt: null },
      orderBy: { issuedAt: "desc" },
      select: { code: true, title: true, rule: true },
    }) ?? [],
    getDb()?.student.findUnique({
      where: { id: student.id },
      select: { portrait: true },
    }),
    db ? loadStandings(db, classmates) : new Map(),
    db ? studentAssignments(db, student, visibleSince(now), now) : [],
    db
      ? db.htmlCandidate.findMany({
          where: {
            accountId: student.id,
            OR: [{ exam: { closed: false } }, { submittedAt: { not: null } }],
          },
          orderBy: { createdAt: "desc" },
          take: 10,
          include: { exam: { select: { title: true, minutes: true } } },
        })
      : [],
    db
      ? db.studentLabProgress.findMany({
          where: { studentId: student.id },
          select: { lab: true, lessons: true },
        })
      : [],
  ]);
  const standing = standings.get(student.id);
  const ordered = classmates
    .map((c) => ({ ...c, xp: standings.get(c.id)?.xp ?? 0 }))
    .sort((a, b) => b.xp - a.xp || a.name.localeCompare(b.name));
  const ranking: RankingEntry[] = ordered
    .map((c, i) => ({
      place: i + 1,
      name: publicName(c.name),
      xp: c.xp,
      rank: standings.get(c.id)!.rank.title,
      me: c.id === student.id,
    }))
    .filter((row, i) => i < 10 || row.me);
  const bot = telegramConfig();
  const secret = linkSecret();
  const telegram =
    bot && secret
      ? deepLink(bot.username, signLink(secret, "s", student.id))
      : null;
  // The week's race inside the group: XP earned since Monday.
  const weekRows = classmates.map((c) => ({
    name: publicName(c.name),
    me: c.id === student.id,
    xp: standings.get(c.id)?.weekXp ?? 0,
    last: standings.get(c.id)?.lastWeekXp ?? 0,
  }));
  const weekHeroes = heroes(weekRows);
  const lastHero =
    heroes(
      weekRows.map((r) => ({ ...r, xp: r.last })),
      1,
    )[0] ?? null;
  // This week's CTF: the newest personal lab published in the last two weeks.
  const weekly = materials
    .filter(
      (m) =>
        m.kind === "CHALLENGE" && now - m.createdAt.getTime() < 14 * 86_400_000,
    )
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0];
  const weeklySolved =
    weekly && db
      ? await db.studentProgress.count({
          where: {
            materialId: weekly.id,
            studentId: { in: classmates.map((c) => c.id) },
          },
        })
      : 0;
  const finished = materials.filter((m) => done.has(m.id)).length;
  const portrait = isPortraitData(saved?.portrait) ? saved.portrait : null;
  const entrance = materials.filter((m) => isEntranceExam(m.slug));
  const entranceDone = entrance.filter((m) => done.has(m.id)).length;
  const labDone = Object.fromEntries(
    labRows
      .filter((r) => isLabId(r.lab))
      .map((r) => [
        r.lab,
        lessonList(r.lessons, LAB_PROGRESS[r.lab as LabId].total).length,
      ]),
  ) as Partial<Record<LabId, number>>;
  // Every lab of the catalog that is switched on, as a card with its
  // checkpoints and certificate, in the catalog's order.
  const intermediateOpen = opensIntermediate(student.level);
  const pathLabs: PathLab[] = getLearningTracks()
    .filter((track) => isLabId(track.id) && opens(track.href))
    .map((track) => {
      const id = track.id as LabId;
      const rule = `lab-${id}`;
      return {
        id,
        title: LAB_META.find((l) => l.id === id)!.title,
        category: t(track.category),
        href: track.href,
        done: labDone[id] ?? 0,
        total: LAB_PROGRESS[id].total,
        checkpoints: CHECKPOINT_META.filter(
          (c) => c.href.split("#")[0] === track.href,
        ).map((c) => ({ ...c, best: standing?.checkpoints[c.id] })),
        certificate: certificates.find((c) => c.rule === rule)?.code ?? null,
        awards: AWARD_RULES.some((r) => r.id === rule),
      };
    });
  const isIntermediate = (lab: PathLab) =>
    LAB_META.find((l) => l.id === lab.id)?.intermediate;
  const next = nextStep({
    level: student.level,
    opens,
    assignments,
    entrance,
    materials: materials.filter(
      (m) => !isEntranceExam(m.slug) && !closed.has(m.id),
    ),
    done,
    labs: labDone,
  });
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
  })).filter(
    (s) =>
      s.items.length > 0 || s.kind === "QUIZ" || (s.kind === "LAB" && weekly),
  );
  const jumps = [
    ...(assignments.length
      ? [
          {
            id: "assignments",
            label: "Assignments",
            count: assignments.length,
          },
        ]
      : []),
    {
      id: "path",
      label: "My path",
      // The labs on the cards: Intermediate ones only once they are open.
      count: pathLabs.filter((lab) => intermediateOpen || !isIntermediate(lab))
        .length,
    },
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
      count: s.items.length + (s.kind === "QUIZ" ? EXAMS.length : 0),
    })),
    ...(standing
      ? [
          {
            id: "achievements",
            label: "Achievements",
            count: standing.badges.length,
          },
        ]
      : []),
  ];
  const renderItem = (item: Item) => (
    <MaterialItem
      key={item.id}
      item={item}
      done={done.has(item.id)}
      status={
        item.kind === "QUIZ"
          ? testStatus(t, item, tests.get(item.id))
          : returned.has(item.id)
            ? t("Returned for rework")
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
          {opensIntermediate(student.level) && (
            <p>
              <Link
                href="/student/continue?to=/intermediate"
                className="student-ghost"
              >
                {t("Academy Intermediate is open for you")} →
              </Link>
            </p>
          )}
          <NextStepCard step={next} t={t} locale={locale} />
          {standing && (
            <StandingCard standing={standing} t={t} locale={locale} />
          )}
        </div>
        <div className="student-portrait">
          {portrait ? (
            <ParticlePortrait
              className="student-portrait-canvas"
              layout="card"
              data={portrait}
            />
          ) : (
            <Constellation className="student-hero-art" seed={11} />
          )}
          <details className="student-portrait-edit">
            <summary>
              {portrait ? t("Change your photo") : t("Add your photo")}
            </summary>
            <PortraitUploadForm
              action={saveStudentPortraitAction}
              variant="student"
              label={t("Your photo")}
            />
            {portrait && (
              <form action={removeStudentPortraitAction}>
                <button type="submit" className="student-ghost">
                  {t("Remove portrait")}
                </button>
              </form>
            )}
          </details>
        </div>
      </section>

      <nav className="student-jump" aria-label={t("Sections")}>
        {jumps.map((jump) => (
          <a key={jump.id} href={`#${jump.id}`}>
            {t(jump.label)}
            <span>{jump.count}</span>
          </a>
        ))}
      </nav>

      {telegram && (
        <p className="student-telegram">
          <a href={telegram} target="_blank" rel="noreferrer">
            {t("Get assignment reminders in Telegram")}
            <ArrowUpRight size={14} aria-hidden="true" />
          </a>
        </p>
      )}

      {assignments.length > 0 && (
        <AssignmentsSection
          assignments={assignments}
          now={now}
          t={t}
          locale={locale}
        />
      )}

      <PathSection
        labs={pathLabs.filter((lab) => !isIntermediate(lab))}
        intermediate={pathLabs.filter((lab) => isIntermediate(lab))}
        intermediateOpen={intermediateOpen}
        extras={extras}
        next={next.kind === "lab" ? next.lab : null}
        t={t}
        locale={locale}
      />

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
          {section.kind === "QUIZ" && htmlExams.length > 0 && (
            <ul className="student-list">
              {htmlExams.map((c) => (
                <HtmlExamCard
                  key={c.id}
                  exam={{
                    id: c.id,
                    title: c.exam.title,
                    minutes: c.exam.minutes,
                    state:
                      c.submittedAt ||
                      (c.deadline && c.deadline.getTime() < now)
                        ? "done"
                        : c.startedAt
                          ? "running"
                          : "ready",
                    score: c.submittedAt ? c.autoScore : null,
                  }}
                />
              ))}
            </ul>
          )}
          {section.kind === "QUIZ" && (
            <ul className="student-list student-exams">
              {EXAMS.map((exam) => (
                <li key={exam.href}>
                  <a href={exam.href} className="student-item">
                    <span className="student-item-title">
                      {t(exam.title)}
                      <ArrowUpRight size={16} aria-hidden="true" />
                    </span>
                    <span className="student-item-summary">
                      {t(exam.summary)}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          )}
          {section.kind === "LAB" && weekly && (
            <Link
              href={`/student/m/${weekly.slug}`}
              className="student-weekly-ctf"
            >
              <span className="student-label">{t("This week’s CTF")}</span>
              <span className="student-item-title">{weekly.title}</span>
              <span className="student-item-summary">
                {done.has(weekly.id)
                  ? t("Solved. Well done.")
                  : weeklySolved > 0
                    ? t("{count} in your group already solved it.", {
                        count: weeklySolved,
                      })
                    : t("Nobody in your group has solved it yet. Be first.")}
              </span>
            </Link>
          )}
        </section>
      ))}

      {standing && (
        <AchievementsSection
          standing={standing}
          ranking={ranking}
          group={student.group}
          heroes={student.group ? weekHeroes : []}
          lastHero={student.group ? lastHero : null}
          t={t}
          locale={locale}
        />
      )}
    </>
  );
}
