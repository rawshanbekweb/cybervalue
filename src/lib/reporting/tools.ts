// Academy Intermediate · Reporting incidents: eight things someone might put
// in a first report about a suspicious email; five belong there.
import type { Text } from "../anim-lab/types";

const t = (uz: string, en: string): Text => ({ uz, en });

export type Detail = {
  text: Text;
  belongs: boolean;
  why: Text;
};

export const DETAILS: Detail[] = [
  {
    text: t(
      "Nima bo‘lganini o‘z so‘zlaringiz bilan",
      "What happened, in your own words",
    ),
    belongs: true,
    why: t(
      "Qisqa va oddiy — texnik atamalar shart emas.",
      "Short and plain — no jargon needed.",
    ),
  },
  {
    text: t("Qachon bo‘lgani (taxminiy vaqt)", "When it happened (roughly)"),
    belongs: true,
    why: t(
      "Vaqt bo‘yicha loglarni topish oson.",
      "The time makes logs easy to find.",
    ),
  },
  {
    text: t("Qaysi qurilma va qaysi hisob", "Which device and which account"),
    belongs: true,
    why: t(
      "Jamoa nimani tekshirishni biladi.",
      "The team knows what to check.",
    ),
  },
  {
    text: t("Sizning parolingiz", "Your password"),
    belongs: false,
    why: t(
      "Parol hech qachon, hech kimga yuborilmaydi — xavfsizlik jamoasiga ham.",
      "A password is never sent to anyone — not even the security team.",
    ),
  },
  {
    text: t(
      "Shubhali xatning o‘zi (ilova sifatida yoki “Report” tugmasi bilan)",
      "The suspicious email itself (as an attachment or via the Report button)",
    ),
    belongs: true,
    why: t(
      "Sarlavhalar va havolalar tahlil uchun kerak.",
      "Headers and links are needed for analysis.",
    ),
  },
  {
    text: t(
      "Kim aybdor ekani haqidagi taxmin",
      "A guess about whose fault it was",
    ),
    belongs: false,
    why: t(
      "Xabar — faktlar uchun; ayb qidirish keyingi xabarlarni to‘xtatadi.",
      "A report is for facts; hunting for blame stops future reports.",
    ),
  },
  {
    text: t(
      "Siz allaqachon nima qilgansiz (bosdingiz, parol kiritdingiz)",
      "What you already did (clicked, typed a password)",
    ),
    belongs: true,
    why: t(
      "Bu eng muhim qism: jamoa qaysi qadamlarni darhol qilishni biladi.",
      "This matters most: the team knows which steps to take at once.",
    ),
  },
  {
    text: t(
      "Hamkasblarning shaxsiy yozishmalari skrinshotlari",
      "Screenshots of colleagues’ private messages",
    ),
    belongs: false,
    why: t(
      "Hodisaga aloqasi yo‘q shaxsiy ma’lumot yuborilmaydi.",
      "Unrelated personal data doesn’t get sent.",
    ),
  },
];

export const BELONG = DETAILS.flatMap((d, i) => (d.belongs ? [i] : []));

export const reportRight = (picked: Iterable<number>) => {
  const set = new Set(picked);
  return set.size === BELONG.length && BELONG.every((i) => set.has(i));
};
