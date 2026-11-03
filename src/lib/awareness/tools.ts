// Academy Intermediate · Awareness programmes: eight choices in an invented
// team's awareness plan, four of which backfire.
import type { Text } from "../anim-lab/types";

const t = (uz: string, en: string): Text => ({ uz, en });

export type Choice = {
  text: Text;
  backfires: boolean;
  why: Text;
};

export const PLAN: Choice[] = [
  {
    text: t(
      "Har oy 10 daqiqalik qisqa mashg‘ulot",
      "A short 10-minute session every month",
    ),
    backfires: false,
    why: t(
      "Qisqa va muntazam — yaxshi eslab qolinadi.",
      "Short and regular sticks best.",
    ),
  },
  {
    text: t(
      "Simulyatsiyada bosganlarni umumiy chatda nomma-nom aytish",
      "Naming people who clicked a simulation in the team chat",
    ),
    backfires: true,
    why: t(
      "Uyaltirish xabar berishni to‘xtatadi va ishonchni buzadi.",
      "Shaming stops reporting and breaks trust.",
    ),
  },
  {
    text: t(
      "Simulyatsiyadan keyin darhol qisqa tushuntirish sahifasi",
      "A short explanation page right after a simulation",
    ),
    backfires: false,
    why: t(
      "Xato paytida o‘rganish eng samarali.",
      "Learning at the moment of the mistake works best.",
    ),
  },
  {
    text: t("Faqat bosish foizini o‘lchash", "Measuring only the click rate"),
    backfires: true,
    why: t(
      "Xabar berish foizi va tezligi ham muhim — ular haqiqiy himoya.",
      "Report rate and speed matter too — they are the real defence.",
    ),
  },
  {
    text: t(
      "Yagona mashg‘ulot — yiliga bir marta 3 soatlik slaydlar",
      "The only training: a 3-hour slide lecture once a year",
    ),
    backfires: true,
    why: t(
      "Bir oyda ko‘pi unutiladi.",
      "Most of it is forgotten within a month.",
    ),
  },
  {
    text: t(
      "Jamoaning o‘z vositalari va xabarlaridan misollar",
      "Examples from the team’s own tools and messages",
    ),
    backfires: false,
    why: t(
      "Tanish misollar haqiqiy holatga o‘xshaydi.",
      "Familiar examples look like the real thing.",
    ),
  },
  {
    text: t(
      "Pochtada bir bosishli “Xabar berish” tugmasi",
      "A one-click “Report” button in the mail app",
    ),
    backfires: false,
    why: t(
      "Xabar berish qanchalik oson bo‘lsa, shuncha ko‘p bo‘ladi.",
      "The easier reporting is, the more it happens.",
    ),
  },
  {
    text: t(
      "“Ishdan bo‘shatish ro‘yxati” mavzusidagi simulyatsiya",
      "A simulation themed “the redundancy list”",
    ),
    backfires: true,
    why: t(
      "Qo‘rqituvchi mavzular odamlarni jarohatlaydi va jamoani dasturga qarshi qiladi.",
      "Frightening themes hurt people and turn the team against the programme.",
    ),
  },
];

export const BACKFIRES = PLAN.flatMap((c, i) => (c.backfires ? [i] : []));

export const planRight = (picked: Iterable<number>) => {
  const set = new Set(picked);
  return set.size === BACKFIRES.length && BACKFIRES.every((i) => set.has(i));
};
