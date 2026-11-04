// Academy Intermediate · End-of-life software: an invented company's software
// inventory (as of late 2026), four items of which no longer get security
// updates.
import type { Text } from "../anim-lab/types";

const t = (uz: string, en: string): Text => ({ uz, en });

export type Item = {
  name: string;
  where: Text;
  support: Text;
  eol: boolean;
  why: Text;
};

export const INVENTORY: Item[] = [
  {
    name: "Windows 11 24H2",
    where: t("Xodimlar noutbuklari", "Staff laptops"),
    support: t("Qo‘llab-quvvatlanadi", "Supported"),
    eol: false,
    why: t(
      "Oylik xavfsizlik yangilanishlari kelmoqda.",
      "Monthly security updates are still arriving.",
    ),
  },
  {
    name: "Windows 7",
    where: t("Qabulxona kompyuteri", "The reception PC"),
    support: t(
      "Qo‘llab-quvvatlash 2020-yil yanvarida tugagan",
      "Support ended January 2020",
    ),
    eol: true,
    why: t(
      "Olti yildan beri tuzatish yo‘q — yangilash yoki almashtirish kerak.",
      "No fixes for six years — upgrade or replace it.",
    ),
  },
  {
    name: "Ubuntu 24.04 LTS",
    where: t("Veb-server", "The web server"),
    support: t(
      "Standart qo‘llab-quvvatlash 2029-yilgacha",
      "Standard support until 2029",
    ),
    eol: false,
    why: t(
      "LTS versiya — uzoq muddatli qo‘llab-quvvatlash.",
      "An LTS release — long-term support.",
    ),
  },
  {
    name: "PHP 7.4",
    where: t("Kompaniya sayti", "The company website"),
    support: t(
      "Qo‘llab-quvvatlash 2022-yil noyabrida tugagan",
      "Support ended November 2022",
    ),
    eol: true,
    why: t(
      "Internetga ochiq saytda tuzatilmaydigan zaifliklar to‘planadi.",
      "Unfixable flaws pile up on an internet-facing site.",
    ),
  },
  {
    name: "Python 3.12",
    where: t("Hisobot skriptlari", "Reporting scripts"),
    support: t(
      "Xavfsizlik tuzatishlari 2028-yilgacha",
      "Security fixes until 2028",
    ),
    eol: false,
    why: t(
      "Hali xavfsizlik tuzatishlari chiqadi.",
      "Security fixes are still released.",
    ),
  },
  {
    name: "Router firmware 1.0.4",
    where: t("Ofis routeri", "The office router"),
    support: t(
      "Ishlab chiqaruvchi 2021-yildan beri yangilanish chiqarmaydi",
      "The vendor stopped releasing updates in 2021",
    ),
    eol: true,
    why: t(
      "Butun tarmoq kirishi tuzatilmaydigan qurilmada — almashtirish kerak.",
      "The whole network’s gateway can’t be fixed — replace it.",
    ),
  },
  {
    name: "PostgreSQL 16",
    where: t("Ma’lumotlar bazasi", "The database"),
    support: t("Qo‘llab-quvvatlash 2028-yilgacha", "Supported until 2028"),
    eol: false,
    why: t(
      "Kichik versiyalarni o‘rnatib turish yetarli.",
      "Keeping up with minor releases is enough.",
    ),
  },
  {
    name: "Office 2013",
    where: t("Buxgalteriya", "Accounting"),
    support: t(
      "Qo‘llab-quvvatlash 2023-yil aprelida tugagan",
      "Support ended April 2023",
    ),
    eol: true,
    why: t(
      "Hujjat orqali keladigan hujumlarga qarshi tuzatishlar endi yo‘q.",
      "There are no more fixes for attacks that arrive in documents.",
    ),
  },
];

export const END_OF_LIFE = INVENTORY.flatMap((it, i) => (it.eol ? [i] : []));

export const inventoryRight = (picked: Iterable<number>) => {
  const set = new Set(picked);
  return (
    set.size === END_OF_LIFE.length && END_OF_LIFE.every((i) => set.has(i))
  );
};
