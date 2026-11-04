// Academy Intermediate · Signed software and updates: eight downloads and
// updates an invented company's staff came across, four of which should not
// be installed.
import type { Text } from "../anim-lab/types";

const t = (uz: string, en: string): Text => ({ uz, en });

export type Download = {
  name: string;
  source: Text;
  check: Text;
  unsafe: boolean;
  why: Text;
};

export const DOWNLOADS: Download[] = [
  {
    name: "Firefox 133.0 (update)",
    source: t("Brauzerning o‘z yangilagichi", "The browser’s own updater"),
    check: t("Mozilla imzosi tasdiqlandi", "Mozilla signature verified"),
    unsafe: false,
    why: t(
      "Rasmiy yangilagich imzoni o‘zi tekshiradi.",
      "The official updater checks the signature itself.",
    ),
  },
  {
    name: "invoice_viewer.exe",
    source: t("Emaildagi ilova", "An email attachment"),
    check: t(
      "Imzo yo‘q · noma’lum nashriyotchi",
      "Unsigned · unknown publisher",
    ),
    unsafe: true,
    why: t(
      "Kutilmagan xatdan kelgan imzosiz dastur — o‘rnatilmaydi.",
      "An unsigned program from an unexpected email — don’t install it.",
    ),
  },
  {
    name: "vlc-3.0.21-win64.exe",
    source: t("videolan.org", "videolan.org"),
    check: t(
      "SHA-256 sayt e’lon qilgan bilan bir xil",
      "SHA-256 matches the one published on the site",
    ),
    unsafe: false,
    why: t(
      "Rasmiy sayt va mos xesh — fayl o‘zgartirilmagan.",
      "Official site and a matching hash — the file wasn’t altered.",
    ),
  },
  {
    name: "Zoom-Setup-Free.exe",
    source: t(
      "Reklamadagi “bepul yuklab olish” sayti",
      "A “free download” site from an ad",
    ),
    check: t(
      "Imzo: “Fast Soft Ltd” (Zoom emas)",
      "Signed by “Fast Soft Ltd” (not Zoom)",
    ),
    unsafe: true,
    why: t(
      "Imzo bor, lekin boshqa kompaniyaniki — bu qayta qadoqlangan dastur.",
      "It is signed, but by someone else — a repackaged installer.",
    ),
  },
  {
    name: "apt upgrade (openssl)",
    source: t("Ubuntu rasmiy repozitoriysi", "The official Ubuntu repository"),
    check: t(
      "Repo GPG kaliti bilan imzolangan",
      "Signed with the repo’s GPG key",
    ),
    unsafe: false,
    why: t(
      "Paket menejeri har bir paketni repo kaliti bilan tekshiradi.",
      "The package manager checks every package against the repo key.",
    ),
  },
  {
    name: "driver_update.zip",
    source: t("Forumdagi havola", "A link on a forum"),
    check: t(
      "Xesh e’lon qilinganiga mos emas",
      "Hash doesn’t match the published one",
    ),
    unsafe: true,
    why: t(
      "Xesh mos kelmasa, fayl o‘zgartirilgan yoki buzilgan.",
      "A hash mismatch means the file was altered or corrupted.",
    ),
  },
  {
    name: "Slack 4.41 (update)",
    source: t("Microsoft Store", "The Microsoft Store"),
    check: t("Do‘kon imzosi tasdiqlandi", "Store signature verified"),
    unsafe: false,
    why: t(
      "Rasmiy do‘kon ilovalarni tekshiradi va imzolaydi.",
      "The official store checks and signs apps.",
    ),
  },
  {
    name: "chrome_update.js",
    source: t(
      "Saytdagi “brauzeringiz eskirgan” oynasi",
      "A “your browser is out of date” pop-up on a website",
    ),
    check: t("Skript fayl, imzosiz", "A script file, unsigned"),
    unsafe: true,
    why: t(
      "Brauzerlar o‘zini sayt orqali yangilamaydi — bu soxta yangilanish.",
      "Browsers never update through a website pop-up — it’s a fake update.",
    ),
  },
];

export const UNSAFE = DOWNLOADS.flatMap((d, i) => (d.unsafe ? [i] : []));

export const downloadsRight = (picked: Iterable<number>) => {
  const set = new Set(picked);
  return set.size === UNSAFE.length && UNSAFE.every((i) => set.has(i));
};
