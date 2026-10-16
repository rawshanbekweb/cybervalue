import type { MissionId } from "./content";
import type { Text } from "./logic";

// Junior's story campaign: someone tried to break into the Cybervalue cyber
// headquarters. Every finished mission adds one piece of evidence to the case
// file; with all six, the recruit names the attacker among three suspects.

export const STORY_KEY = "cybervalue:junior:story:v1";

export const STORY_INTRO: Text = {
  uz: "Tungi soat 02:17. Cybervalue kiber-shtabining tizimiga kimdir kirishga urindi. Shtab boshlig‘i sizga topshiriq berdi: oltita missiyani bajaring, har birida bitta dalil toping va hujumchini fosh qiling.",
  en: "02:17 at night. Someone tried to break into the Cybervalue cyber headquarters. The chief has a job for you: finish six missions, find one piece of evidence in each, and unmask the attacker.",
};

export const EVIDENCE: Record<MissionId, Text> = {
  password: {
    uz: "Kirish jurnalida «qwerty123», «parol123» kabi yuzlab urinish bor. Hujumchi mashhur parollar ro‘yxatini sinagan.",
    en: "The login log shows hundreds of tries like “qwerty123” and “password1”. The attacker used a list of common passwords.",
  },
  phishing: {
    uz: "Xodimlarga «bank» nomidan soxta xat kelgan. Jo‘natuvchi manzili .xyz bilan tugaydi.",
    en: "Staff received a fake “bank” email. The sender’s address ends in .xyz.",
  },
  cipher: {
    uz: "Ushlangan xabar Sezar shifrida yozilgan. Hujumchi eski, oddiy shifrlarni yaxshi ko‘radi.",
    en: "An intercepted message was written in a Caesar cipher. The attacker likes old, simple ciphers.",
  },
  footprint: {
    uz: "Hujumchi xodimning ochiq postidan uning maktabi va uy hayvonining ismini bilib olgan. U ijtimoiy tarmoqlarni kuzatadi.",
    en: "The attacker learned an employee’s school and pet’s name from a public post. They watch social media.",
  },
  ctf: {
    uz: "Sayt kodidagi izohda hujumchi imzo qoldirgan: «grey_fox».",
    en: "In a comment in the site’s code the attacker left a signature: “grey_fox”.",
  },
  ethics: {
    uz: "Hujumchi hech qanday ruxsatsiz ishlagan va topgan xatosini hech kimga xabar qilmagan.",
    en: "The attacker worked without any permission and reported the weakness to no one.",
  },
};

export type Suspect = {
  id: string;
  name: Text;
  /** The online handle each suspect signs with. */
  handle: string;
  facts: Text[];
  culprit: boolean;
  verdict: Text;
};

export const SUSPECTS: readonly Suspect[] = [
  {
    id: "owl",
    name: { uz: "Tun Boyqushi", en: "Night Owl" },
    handle: "night_owl",
    facts: [
      {
        uz: "Rasmiy «bug bounty» dasturlarida qatnashadi",
        en: "Takes part in official bug bounty programmes",
      },
      {
        uz: "Har doim egasidan yozma ruxsat oladi",
        en: "Always gets written permission first",
      },
      {
        uz: "Zamonaviy shifrlashdan foydalanadi",
        en: "Uses modern encryption",
      },
      {
        uz: "Topgan xatolarini kompaniyaga xabar qiladi",
        en: "Reports every bug to the company",
      },
    ],
    culprit: false,
    verdict: {
      uz: "Yo‘q. Tun Boyqushi — etik xaker: u ruxsat bilan ishlaydi va xatolarni xabar qiladi. Dalillar boshqasini ko‘rsatyapti.",
      en: "No. Night Owl is an ethical hacker who works with permission and reports bugs. The evidence points elsewhere.",
    },
  },
  {
    id: "fox",
    name: { uz: "Kulrang Tulki", en: "Grey Fox" },
    handle: "grey_fox",
    facts: [
      {
        uz: "Xatlarini .xyz domenidan yuboradi",
        en: "Sends emails from a .xyz domain",
      },
      {
        uz: "Sezar shifrini «klassika» deb ataydi",
        en: "Calls the Caesar cipher “a classic”",
      },
      {
        uz: "Odamlarning ochiq profillarini soatlab o‘rganadi",
        en: "Studies people’s public profiles for hours",
      },
      { uz: "Hech qachon ruxsat so‘ramaydi", en: "Never asks for permission" },
    ],
    culprit: true,
    verdict: {
      uz: "Topdingiz! Barcha dalillar mos: mashhur parollar, .xyz xatlar, Sezar shifri, ijtimoiy tarmoqlar, «grey_fox» imzosi va ruxsatsiz hujum. Kulrang Tulki fosh qilindi — shtab xavfsiz!",
      en: "Got it! Every clue fits: common passwords, .xyz emails, the Caesar cipher, social media, the “grey_fox” signature and no permission. Grey Fox is unmasked — HQ is safe!",
    },
  },
  {
    id: "dragon",
    name: { uz: "Qizil Ajdar", en: "Red Dragon" },
    handle: "red_dragon",
    facts: [
      {
        uz: "Faqat murakkab, zamonaviy shifrlarni ishlatadi",
        en: "Only uses complex modern ciphers",
      },
      {
        uz: "Ijtimoiy tarmoqlarda umuman yo‘q",
        en: "Has no social media at all",
      },
      {
        uz: "Xat yubormaydi, to‘g‘ridan-to‘g‘ri serverlarga hujum qiladi",
        en: "Sends no emails, attacks servers directly",
      },
      { uz: "Imzosi — «red_dragon»", en: "Signs as “red_dragon”" },
    ],
    culprit: false,
    verdict: {
      uz: "Yo‘q. Qizil Ajdar Sezar shifrini ishlatmaydi, ijtimoiy tarmoqlarda yo‘q va imzosi boshqa. Dalillarni qayta o‘qing.",
      en: "No. Red Dragon doesn’t use Caesar, has no social media and signs differently. Read the evidence again.",
    },
  },
];

export function restoreStory(raw: unknown) {
  return Boolean(
    raw &&
    typeof raw === "object" &&
    (raw as Record<string, unknown>).solved === true,
  );
}
