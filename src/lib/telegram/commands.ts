import "server-only";
import type { PrismaClient } from "@/generated/prisma/client";
import { site } from "../site";
import { studentAssignments } from "../student/assignment-data";
import {
  dueLabel,
  formatDue,
  targetHref,
  targetName,
  visibleSince,
} from "../student/assignments";
import { loadStandings } from "../student/standing";
import { WEEKLY_GOAL } from "../student/xp";
import { createTranslator } from "../i18n";
import { escapeHtml as e } from "./escape";
import { parentText } from "./events";

const uz = createTranslator("uz");
const DAY = 86_400_000;
const absolute = (path: string) => `${site.url.replace(/\/$/, "")}${path}`;

// The menu Telegram shows next to the message box (setMyCommands).
export const BOT_COMMANDS = [
  { command: "topshiriqlar", description: "Muddatli topshiriqlarim" },
  { command: "natija", description: "Darajam, XP va haftalik natijam" },
  { command: "hisobot", description: "Farzandimning hisoboti (ota-onalar)" },
  { command: "bugun", description: "Sinf holati bugun (o‘qituvchi)" },
  { command: "yordam", description: "Buyruqlar ro‘yxati" },
  { command: "stop", description: "Bildirishnomalarni to‘xtatish" },
];

type Subject = {
  kind: "teacher" | "student" | "parent";
  id: string;
  of?: string;
};

function parse(subject: string): Subject | null {
  const [kind, a, b] = subject.split(":");
  if (kind === "teacher" || kind === "student") return { kind, id: a };
  if (kind === "parent" && b) return { kind, id: b, of: a };
  return null;
}

export function helpText(subjects: Subject[]) {
  const roles = new Set(subjects.map((s) => s.kind));
  const lines = ["<b>Cybervalue boti</b>"];
  if (!roles.size)
    lines.push(
      "Bu chat hali ulanmagan. O‘qituvchi bergan yoki saytdagi havolani oching va Start tugmasini bosing.",
    );
  if (roles.has("student"))
    lines.push(
      "",
      "<b>O‘quvchi</b>",
      "/topshiriqlar — muddatli topshiriqlaringiz",
      "/natija — darajangiz, XP va shu haftadagi natijangiz",
    );
  if (roles.has("parent"))
    lines.push(
      "",
      "<b>Ota-ona</b>",
      "/hisobot — farzandingizning hozirgi natijalari va to‘liq hisobot havolasi",
    );
  if (roles.has("teacher"))
    lines.push(
      "",
      "<b>O‘qituvchi</b>",
      "/bugun — bugungi faollik, tekshiruv kutayotgan javoblar va o‘tkazilgan muddatlar",
    );
  lines.push("", "/stop — bu chatga xabar yuborishni to‘xtatish");
  return lines.join("\n");
}

async function assignmentsText(
  db: PrismaClient,
  studentId: string,
  now: number,
) {
  const student = await db.student.findUnique({
    where: { id: studentId },
    select: { id: true, name: true, group: true, active: true },
  });
  if (!student?.active) return "Akkaunt topilmadi yoki yopilgan.";
  const list = await studentAssignments(db, student, visibleSince(now), now);
  const pending = list.filter(
    (a) => a.status === "open" || a.status === "missed",
  );
  if (!pending.length)
    return `<b>${e(student.name)}</b>: hozir bajarilmagan topshiriq yo‘q. Barakalla!`;
  return [
    `<b>${e(student.name)}: topshiriqlar</b>`,
    ...pending.map((a) => {
      const due = dueLabel(a.dueAt, now);
      const when =
        a.status === "missed"
          ? "muddati o‘tgan"
          : uz(due.text, { days: due.days ?? 0 }).toLowerCase();
      return `• <a href="${e(absolute(targetHref(a.target, a.material?.slug)))}">${e(a.title)}</a> — ${e(targetName(a, "uz", uz))}\n   ${e(formatDue(a.dueAt, "uz"))} · ${when}`;
    }),
  ].join("\n");
}

async function standingText(db: PrismaClient, studentId: string, now: number) {
  const student = await db.student.findUnique({
    where: { id: studentId },
    select: {
      id: true,
      name: true,
      group: true,
      level: true,
      bonusXp: true,
      active: true,
    },
  });
  if (!student?.active) return "Akkaunt topilmadi yoki yopilgan.";
  const s = (await loadStandings(db, [student], now)).get(student.id)!;
  return [
    `<b>${e(student.name)}</b>`,
    `Daraja: ${e(s.rank.title.uz)} · ${s.xp} XP`,
    s.next
      ? `Keyingi darajagacha: ${s.next.xp - s.xp} XP`
      : "Eng yuqori daraja!",
    `Shu hafta: +${s.weekXp} XP, ${s.week}/${WEEKLY_GOAL} faoliyat`,
    `Bajarilgan materiallar: ${s.done}/${s.available}`,
    s.average !== null ? `Testlar o‘rtachasi: ${s.average}%` : "",
  ]
    .filter(Boolean)
    .join("\n");
}

async function todayText(db: PrismaClient, now: number) {
  const since = new Date(now - DAY);
  const [active, juniors, pending, missed, errors] = await Promise.all([
    db.student.count({ where: { active: true, lastLoginAt: { gte: since } } }),
    db.juniorMember.count({
      where: { active: true, lastActiveAt: { gte: since } },
    }),
    db.studentSubmission.count({
      where: { reviewedAt: null, material: { kind: "PRACTICE" } },
    }),
    db.studentAssignment.count({
      where: { dueAt: { gte: since, lt: new Date(now) } },
    }),
    db.errorEvent.count({ where: { resolvedAt: null } }),
  ]);
  return [
    "<b>Bugun, oxirgi 24 soat</b>",
    `Kirgan o‘quvchilar: ${active}`,
    `Faol Junior a’zolari: ${juniors}`,
    `Tekshiruv kutayotgan javoblar: ${pending}`,
    `Muddati tugagan topshiriqlar: ${missed}`,
    errors ? `Saytdagi ochiq xatolar: ${errors}` : "",
    `<a href="${e(absolute("/admin"))}">Admin panel</a>`,
  ]
    .filter(Boolean)
    .join("\n");
}

/**
 * Answers a command from a linked chat, or null when the text is not one.
 * Replies are Telegram HTML.
 */
export async function runCommand(
  db: PrismaClient,
  chatId: string,
  text: string,
  now = Date.now(),
): Promise<string | null> {
  const command = /^\/([a-z_]+)(?:@\w+)?\b/i.exec(text)?.[1]?.toLowerCase();
  if (!command) return null;
  const chats = await db.telegramChat.findMany({
    where: { chatId },
    select: { subject: true },
  });
  const subjects = chats.flatMap((c) => parse(c.subject) ?? []);
  const of = (kind: Subject["kind"]) => subjects.filter((s) => s.kind === kind);
  switch (command) {
    case "start":
    case "yordam":
    case "help":
      return helpText(subjects);
    case "topshiriqlar":
      if (!of("student").length)
        return "Bu buyruq o‘quvchilar uchun. Saytdagi sahifangizdan Telegramni ulang.";
      return (
        await Promise.all(
          of("student").map((s) => assignmentsText(db, s.id, now)),
        )
      ).join("\n\n");
    case "natija": {
      const ids = [
        ...of("student").map((s) => s.id),
        ...of("parent")
          .filter((s) => s.of === "student")
          .map((s) => s.id),
      ];
      if (!ids.length) return helpText(subjects);
      return (
        await Promise.all(ids.map((id) => standingText(db, id, now)))
      ).join("\n\n");
    }
    case "hisobot": {
      const parents = of("parent");
      if (!parents.length)
        return "Bu buyruq ota-onalar uchun. O‘qituvchidan ota-ona havolasini so‘rang.";
      const texts = await Promise.all(
        parents.map((p) => parentText(db, p.of!, p.id, now)),
      );
      return (
        texts.filter(Boolean).join("\n\n") ||
        "Hisobot havolasi o‘chirilgan. O‘qituvchidan yangisini so‘rang."
      );
    }
    case "bugun":
      if (!of("teacher").length) return "Bu buyruq o‘qituvchi uchun.";
      return todayText(db, now);
    default:
      return helpText(subjects);
  }
}
