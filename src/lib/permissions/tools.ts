// Academy Intermediate · App permissions and sandboxing: eight permission
// requests from invented apps, four of which the app has no reason to need.
import type { Text } from "../anim-lab/types";

const t = (uz: string, en: string): Text => ({ uz, en });

export type Request = {
  app: Text;
  asks: Text;
  excessive: boolean;
  why: Text;
};

export const REQUESTS: Request[] = [
  {
    app: t("Xarita ilovasi", "A maps app"),
    asks: t(
      "Joylashuv (faqat ilova ochiq paytda)",
      "Location (only while the app is open)",
    ),
    excessive: false,
    why: t(
      "Yo‘l ko‘rsatish uchun kerak — va faqat ishlatayotganda.",
      "Needed for directions — and only while in use.",
    ),
  },
  {
    app: t("Fonar ilovasi", "A torch app"),
    asks: t("Kontaktlar va SMS", "Contacts and SMS"),
    excessive: true,
    why: t(
      "Chiroq yoqish uchun kontakt va SMS kerak emas.",
      "Turning on a light needs neither contacts nor SMS.",
    ),
  },
  {
    app: t("Video qo‘ng‘iroq ilovasi", "A video-call app"),
    asks: t("Kamera va mikrofon", "Camera and microphone"),
    excessive: false,
    why: t("Qo‘ng‘iroqning o‘zi shu.", "That is what a call is."),
  },
  {
    app: t("Kalkulyator", "A calculator"),
    asks: t(
      "Doimiy joylashuv (fonda ham)",
      "Location all the time (even in the background)",
    ),
    excessive: true,
    why: t(
      "Hisoblash uchun joylashuv kerak emas, ayniqsa fonda.",
      "Arithmetic needs no location, least of all in the background.",
    ),
  },
  {
    app: t("Fotosurat muharriri", "A photo editor"),
    asks: t("Siz tanlagan rasmlar", "The photos you pick"),
    excessive: false,
    why: t(
      "Faqat tanlangan rasmlar — eng kam huquq.",
      "Only the chosen photos — least privilege.",
    ),
  },
  {
    app: t("Ob-havo vidjeti", "A weather widget"),
    asks: t(
      "Accessibility (ekrandagi hamma narsani o‘qish va bosish)",
      "Accessibility (read and tap everything on screen)",
    ),
    excessive: true,
    why: t(
      "Bu huquq butun telefonni boshqarishga imkon beradi — ob-havoga kerak emas.",
      "This permission lets an app control the whole phone — weather doesn’t need it.",
    ),
  },
  {
    app: t("Musiqa pleyeri", "A music player"),
    asks: t("Bildirishnomalar", "Notifications"),
    excessive: false,
    why: t(
      "Ijro boshqaruvini ko‘rsatish uchun.",
      "To show the playback controls.",
    ),
  },
  {
    app: t(
      "Brauzer kengaytmasi “Kupon topuvchi”",
      "A “coupon finder” browser extension",
    ),
    asks: t(
      "Barcha saytlardagi ma’lumotlarni o‘qish va o‘zgartirish",
      "Read and change your data on all websites",
    ),
    excessive: true,
    why: t(
      "Bu huquq bilan bank va pochta sahifalari ham o‘qiladi.",
      "With this it can read your bank and email pages too.",
    ),
  },
];

export const EXCESSIVE = REQUESTS.flatMap((r, i) => (r.excessive ? [i] : []));

export const requestsRight = (picked: Iterable<number>) => {
  const set = new Set(picked);
  return set.size === EXCESSIVE.length && EXCESSIVE.every((i) => set.has(i));
};
