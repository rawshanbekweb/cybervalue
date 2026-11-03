// Academy Intermediate · Manipulation tactics: an invented phishing email
// split into eight parts, five of them warning signs.
import type { Text } from "../anim-lab/types";

const t = (uz: string, en: string): Text => ({ uz, en });

export type Part = {
  text: Text;
  sign: boolean;
  why: Text;
};

export const EMAIL: Part[] = [
  {
    text: t(
      "Kimdan: “IT Support” <it-support@acme-helpdesk.co>",
      "From: “IT Support” <it-support@acme-helpdesk.co>",
    ),
    sign: true,
    why: t(
      "Kompaniya domeni acme.uz, bu esa unga o‘xshatilgan boshqa domen.",
      "The company’s domain is acme.uz; this is a look-alike.",
    ),
  },
  {
    text: t(
      "Mavzu: SHOSHILINCH: pochtangiz 2 soatda o‘chiriladi",
      "Subject: URGENT: your mailbox will be deleted in 2 hours",
    ),
    sign: true,
    why: t(
      "Shoshiltirish o‘ylashga vaqt qoldirmaydi.",
      "Urgency leaves no time to think.",
    ),
  },
  {
    text: t("Salom, Dilnoza,", "Hello Dilnoza,"),
    sign: false,
    why: t(
      "Ism ochiq manbalardan olinishi mumkin — o‘zi belgi emas.",
      "A name is easy to find — on its own it isn’t a sign.",
    ),
  },
  {
    text: t(
      "Hisobingiz 2021-yilda yaratilgan.",
      "Our records show your account was created in 2021.",
    ),
    sign: false,
    why: t("Oddiy ma’lumot.", "Ordinary information."),
  },
  {
    text: t(
      "Parolingizni shu yerda tasdiqlang: http://acme-login.verify-account.ru",
      "Confirm your password here: http://acme-login.verify-account.ru",
    ),
    sign: true,
    why: t(
      "Havola boshqa domenga olib boradi va parol so‘raydi. IT hech qachon parol so‘ramaydi.",
      "The link goes to another domain and asks for a password. IT never asks for passwords.",
    ),
  },
  {
    text: t(
      "Direktor bugun hammadan buni bajarishni so‘radi.",
      "The Director has asked everyone to do this today.",
    ),
    sign: true,
    why: t(
      "Obro‘ga tayanish — rad etishni qiyinlashtiradi.",
      "Leaning on authority makes saying no harder.",
    ),
  },
  {
    text: t(
      "Yordam xizmatiga qo‘ng‘iroq qilmang, ular band.",
      "Please don’t call the help desk, they are busy.",
    ),
    sign: true,
    why: t(
      "Tekshirish yo‘lini yopish — eng aniq belgi.",
      "Cutting off the way to check is the clearest sign of all.",
    ),
  },
  {
    text: t(
      "Hurmat bilan, IT Support jamoasi",
      "Kind regards, the IT Support team",
    ),
    sign: false,
    why: t("Oddiy imzo.", "An ordinary sign-off."),
  },
];

export const SIGNS = EMAIL.flatMap((p, i) => (p.sign ? [i] : []));

export const signsRight = (picked: Iterable<number>) => {
  const set = new Set(picked);
  return set.size === SIGNS.length && SIGNS.every((i) => set.has(i));
};
