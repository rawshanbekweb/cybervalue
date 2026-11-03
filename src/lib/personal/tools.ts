// Academy Intermediate · Personal protection: eight of an invented person's
// security habits, four of which need fixing.
import type { Text } from "../anim-lab/types";

const t = (uz: string, en: string): Text => ({ uz, en });

export type Habit = {
  text: Text;
  fix: boolean;
  why: Text;
};

export const HABITS: Habit[] = [
  {
    text: t(
      "Email va internet-do‘kon uchun bir xil parol",
      "The same password for email and an online shop",
    ),
    fix: true,
    why: t(
      "Do‘kon sizib chiqsa, o‘sha parol bilan pochtaga ham kiriladi.",
      "If the shop leaks, the same password opens the email too.",
    ),
  },
  {
    text: t(
      "Uzun asosiy parol iborasi bilan parol menejeri",
      "A password manager with a long master passphrase",
    ),
    fix: false,
    why: t(
      "Har bir sayt uchun alohida, tasodifiy parol.",
      "A separate, random password for every site.",
    ),
  },
  {
    text: t("Pochtada MFA yoqilmagan", "No MFA on the email account"),
    fix: true,
    why: t(
      "Pochta — boshqa barcha hisoblarni tiklash kaliti.",
      "Email is the reset key for every other account.",
    ),
  },
  {
    text: t(
      "Telefon yangilanishlari 3 oydan beri kechiktirilgan",
      "Phone updates put off for three months",
    ),
    fix: true,
    why: t(
      "Yangilanishlar ma’lum zaifliklarni yopadi.",
      "Updates close known vulnerabilities.",
    ),
  },
  {
    text: t(
      "Rasmlar bulutga va tashqi diskka zaxiralanadi",
      "Photos backed up to the cloud and an external disk",
    ),
    fix: false,
    why: t(
      "Ikki joyda nusxa — biri boshqa joyda.",
      "Two copies, one of them somewhere else.",
    ),
  },
  {
    text: t(
      "Tiklash kodlari parol menejerida saqlangan",
      "Recovery codes saved in the password manager",
    ),
    fix: false,
    why: t(
      "Telefon yo‘qolsa ham hisobga qaytish mumkin.",
      "You can get back in even if the phone is lost.",
    ),
  },
  {
    text: t(
      "Uydagi Wi-Fi routerda hali ham admin/admin",
      "The home Wi-Fi router still uses admin/admin",
    ),
    fix: true,
    why: t(
      "Zavod paroli hammaga ma’lum.",
      "Factory passwords are known to everyone.",
    ),
  },
  {
    text: t(
      "Telefonda 6 raqamli PIN bilan ekran qulfi",
      "A screen lock with a 6-digit PIN",
    ),
    fix: false,
    why: t(
      "Yo‘qolgan telefon ochiq qolmaydi.",
      "A lost phone isn’t left open.",
    ),
  },
];

export const TO_FIX = HABITS.flatMap((h, i) => (h.fix ? [i] : []));

export const habitsRight = (picked: Iterable<number>) => {
  const set = new Set(picked);
  return set.size === TO_FIX.length && TO_FIX.every((i) => set.has(i));
};
