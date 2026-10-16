// Telegram texts, in Uzbek like the classes. HTML parse mode: every value
// from the database goes through escapeHtml.
import { escapeHtml as e } from "./escape";

const link = (url: string, label: string) =>
  `<a href="${e(url)}">${e(label)}</a>`;

export function newAssignmentText(a: {
  title: string;
  what: string;
  due: string;
  note: string;
  url: string;
}) {
  return [
    `<b>Yangi topshiriq:</b> ${e(a.title)}`,
    `Nima qilish kerak: ${e(a.what)}`,
    `Muddat: ${e(a.due)}`,
    a.note && `Izoh: ${e(a.note)}`,
    link(a.url, "Ochish"),
  ]
    .filter(Boolean)
    .join("\n");
}

export function reminderText(a: {
  title: string;
  what: string;
  due: string;
  url: string;
}) {
  return [
    `<b>Eslatma:</b> “${e(a.title)}” topshirig‘i muddati yaqin.`,
    `${e(a.what)} — ${e(a.due)} gacha.`,
    link(a.url, "Hozir bajarish"),
  ].join("\n");
}

export function practiceText(a: {
  student: string;
  group: string;
  material: string;
  url: string;
}) {
  return [
    `<b>Yangi javob:</b> ${e(a.student)}${a.group ? ` (${e(a.group)})` : ""}`,
    `“${e(a.material)}” amaliyoti tekshiruvni kutmoqda.`,
    link(a.url, "Tekshirish"),
  ].join("\n");
}

export function missedText(
  rows: { title: string; group: string; names: string[] }[],
  url: string,
) {
  return [
    "<b>Muddati o‘tgan topshiriqlar</b>",
    ...rows.map(
      (r) =>
        `• ${e(r.title)}${r.group ? ` (${e(r.group)})` : ""}: ${e(
          r.names.slice(0, 15).join(", "),
        )}${r.names.length > 15 ? ` va yana ${r.names.length - 15} kishi` : ""}`,
    ),
    link(url, "Sinf paneli"),
  ].join("\n");
}

export function parentStudentText(a: {
  name: string;
  rank: string;
  xp: number;
  week: number;
  goal: number;
  done: number;
  available: number;
  average: number | null;
  missed: number;
  url: string;
}) {
  return [
    `<b>${e(a.name)}: haftalik hisobot</b>`,
    `Daraja: ${e(a.rank)} · ${a.xp} XP`,
    `O‘tgan hafta: ${a.week} ta faoliyat (maqsad ${a.goal})`,
    `Bajarilgan materiallar: ${a.done}/${a.available}`,
    a.average !== null && `Testlar o‘rtachasi: ${a.average}%`,
    a.missed > 0 && `Topshirilmagan topshiriqlar: ${a.missed}`,
    link(a.url, "To‘liq hisobot"),
  ]
    .filter(Boolean)
    .join("\n");
}

export function parentJuniorText(a: {
  name: string;
  rank: string;
  xp: number;
  missions: string;
  exercises: string;
  url: string;
}) {
  return [
    `<b>${e(a.name)}: Academy Junior haftalik hisoboti</b>`,
    `Unvon: ${e(a.rank)} · ${a.xp} XP`,
    `Missiyalar: ${a.missions}`,
    `Mashqlar: ${a.exercises}`,
    link(a.url, "To‘liq hisobot"),
  ].join("\n");
}
