import "server-only";
import type { PrismaClient } from "@/generated/prisma/client";
import { createTranslator } from "../i18n";
import { site } from "../site";
import {
  kidsReport,
  reportPath,
  studentReport,
  juniorReport,
} from "../reports";
import { assignmentResults, loadAssignments } from "../student/assignment-data";
import { formatDue, targetHref, targetName } from "../student/assignments";
import { WEEKLY_GOAL, weekIndex } from "../student/xp";
import {
  missedText,
  newAssignmentText,
  parentJuniorText,
  parentKidsText,
  parentStudentText,
  certificateText,
  practiceText,
  reminderText,
} from "./messages";
import { notify, teacherSubjects } from "./notify";
import { awardCertificates } from "../student/awards";

const DAY = 86_400_000;
const uz = createTranslator("uz");
const absolute = (path: string) => `${site.url.replace(/\/$/, "")}${path}`;

type AssignmentLike = Parameters<typeof targetName>[0] & {
  id: string;
  title: string;
  note: string;
  group: string;
  dueAt: Date;
  material: { slug: string; title: string } | null;
};

const what = (a: AssignmentLike) => targetName(a, "uz", uz);
const url = (a: AssignmentLike) =>
  absolute(targetHref(a.target, a.material?.slug));

/** A new assignment goes to every linked student it applies to. */
export async function assignmentCreated(db: PrismaClient, id: string) {
  const [assignment] = (await loadAssignments(db)).filter((a) => a.id === id);
  if (!assignment) return;
  const students = await db.student.findMany({
    where: {
      active: true,
      ...(assignment.group ? { group: assignment.group } : {}),
    },
    select: { id: true },
  });
  await notify(
    db,
    students.map((s) => `student:${s.id}`),
    newAssignmentText({
      title: assignment.title,
      what: what(assignment),
      due: formatDue(assignment.dueAt, "uz"),
      note: assignment.note,
      url: url(assignment),
    }),
  );
}

/** A practice answer waiting for review goes to the teachers. */
export async function practiceSubmitted(
  db: PrismaClient,
  student: { name: string; group: string },
  material: { id: string; title: string },
) {
  await notify(
    db,
    await teacherSubjects(db),
    practiceText({
      student: student.name,
      group: student.group,
      material: material.title,
      url: absolute(`/teacher/materials/${material.id}`),
    }),
  );
}

/**
 * The daily job: reminders for work due within a day, the teacher's list of
 * deadlines missed since yesterday, and on Mondays the parents' weekly
 * summary. Each message is logged, so running twice sends nothing new.
 */
export async function daily(db: PrismaClient, now = Date.now()) {
  const counts = { reminders: 0, missed: 0, parents: 0 };
  const students = await db.student.findMany({
    where: { active: true },
    select: { id: true, name: true, group: true },
  });
  const assignments = await loadAssignments(db, {
    since: new Date(now - DAY),
  });
  const results = await assignmentResults(db, assignments, students, now);

  for (const a of results) {
    const due = a.dueAt.getTime();
    if (due > now && due - now <= DAY)
      for (const s of a.students.filter((s) => s.status === "open"))
        counts.reminders += await notify(
          db,
          [`student:${s.id}`],
          reminderText({
            title: a.title,
            what: what(a),
            due: formatDue(a.dueAt, "uz"),
            url: url(a),
          }),
          `remind:${a.id}:${s.id}`,
        );
  }
  const missed = results
    .filter((a) => a.dueAt.getTime() <= now)
    .map((a) => ({
      id: a.id,
      title: a.title,
      group: a.group,
      names: a.students.filter((s) => s.status === "missed").map((s) => s.name),
    }))
    .filter((a) => a.names.length > 0);
  if (missed.length)
    counts.missed += await notify(
      db,
      await teacherSubjects(db),
      missedText(missed, absolute("/teacher/class")),
      `missed:${missed.map((m) => m.id).join(",")}`.slice(0, 190),
    );

  // Monday in Tashkent.
  if (new Date(now + 5 * 3_600_000).getUTCDay() === 1) {
    const week = weekIndex(now);
    const chats = await db.telegramChat.findMany({
      where: { subject: { startsWith: "parent:" } },
      distinct: ["subject"],
      select: { subject: true },
    });
    for (const { subject } of chats) {
      const [, kind, id] = subject.split(":");
      const text = await parentText(db, kind, id, now);
      if (text)
        counts.parents += await notify(
          db,
          [subject],
          text,
          `weekly:${subject}:${week}`,
        );
    }
  }
  return counts;
}

export async function parentText(
  db: PrismaClient,
  kind: string,
  id: string,
  now: number,
) {
  const select = { reportToken: true };
  const token = (
    kind === "student"
      ? await db.student.findUnique({ where: { id }, select })
      : kind === "kids"
        ? await db.kidsMember.findUnique({ where: { id }, select })
        : await db.juniorMember.findUnique({ where: { id }, select })
  )?.reportToken;
  if (!token) return null;
  const link = absolute(reportPath(token));
  if (kind === "student") {
    const report = await studentReport(db, token, now);
    if (!report) return null;
    const s = report.standing;
    // Sent on Monday: the seven days before today (days ends with today).
    const week = s.days.slice(6, 13).reduce((a, b) => a + b, 0);
    return parentStudentText({
      name: report.name,
      rank: s.rank.title.uz,
      xp: s.xp,
      week,
      goal: WEEKLY_GOAL,
      done: s.done,
      available: s.available,
      average: s.average,
      missed: report.assignments.filter((a) => a.status === "missed").length,
      url: link,
    });
  }
  if (kind === "kids") {
    const report = await kidsReport(db, token);
    if (!report) return null;
    return parentKidsText({
      name: report.name,
      level: report.level.uz,
      xp: report.xp,
      missions: `${report.missions}/${report.missionTotal}`,
      url: link,
    });
  }
  const report = await juniorReport(db, token, now);
  if (!report) return null;
  return parentJuniorText({
    name: report.name,
    rank: report.rank.title.uz,
    xp: report.xp,
    missions: `${report.missions}/${report.missionTotal}`,
    exercises: `${report.exercises}/${report.exerciseTotal}`,
    url: link,
  });
}

/** Issues newly earned certificates and congratulates a linked student. */
export async function certificatesEarned(db: PrismaClient, studentId: string) {
  const titles = await awardCertificates(db, studentId);
  for (const title of titles)
    await notify(
      db,
      [`student:${studentId}`],
      certificateText({ title, url: absolute("/student#certificates") }),
    ).catch(() => 0);
  return titles;
}
