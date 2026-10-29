// Academy Intermediate · Digital footprint: what a self-audit turns up about
// an invented student, and the right step for each finding — lock it down,
// secure the account, or leave it. Every name, handle and number is
// invented.
import type { Text } from "../anim-lab/types";

const t = (uz: string, en: string): Text => ({ uz, en });

export const ACTIONS = ["hide", "secure", "keep"] as const;
export type Action = (typeof ACTIONS)[number];

export type Finding = {
  id: string;
  where: string;
  what: Text;
  action: Action;
  why: Text;
};

export const FINDINGS: Finding[] = [
  {
    id: "geotags",
    where: "Instagram @sardor_2009",
    what: t(
      "Ochiq profil: maktab formasidagi suratlar va har kuni bir joyda geoteg",
      "A public profile: photos in school uniform and the same geotag every day",
    ),
    action: "hide",
    why: t(
      "Maktab va kundalik yo‘l — begonaga sizni qayerdan topishni aytadi. Profilni yoping, geoteglarni o‘chiring.",
      "School and a daily route tell a stranger where to find you. Make the profile private and remove the geotags.",
    ),
  },
  {
    id: "breach",
    where: "haveibeenpwned",
    what: t(
      "Email 2024-yilgi o‘yin forumi sizib chiqishida bor — o‘sha parol hozir ham ishlatiladi",
      "Your email is in a 2024 gaming-forum breach — and that password is still in use",
    ),
    action: "secure",
    why: t(
      "Parolni hamma joyda almashtiring, har sayt uchun alohida parol va 2FA yoqing.",
      "Change that password everywhere, use a different one per site and turn on 2FA.",
    ),
  },
  {
    id: "phone",
    where: "Telegram",
    what: t(
      "Telefon raqamingiz ochiq guruhda hammaga ko‘rinadi",
      "Your phone number is visible to everyone in a public group",
    ),
    action: "hide",
    why: t(
      "Maxfiylik sozlamalarida raqamni “Hech kim” qiling — raqam firibgarlik va SIM almashtirishga yo‘l ochadi.",
      "Set your number to “Nobody” in privacy settings — a number invites scams and SIM swapping.",
    ),
  },
  {
    id: "reuse",
    where: "forum.example, github.example, game.example",
    what: t(
      "Bir xil “sardor_2009” nomi uchta saytda — biri eski forumdagi parolingiz bilan",
      "The same “sardor_2009” name on three sites — one with your old forum password",
    ),
    action: "secure",
    why: t(
      "Bir xil nom akkauntlarni bog‘laydi. Eski akkauntlarni yoping yoki parolini almashtiring, keraksizini o‘chiring.",
      "One handle links the accounts. Close the old ones or change their passwords, delete what you don’t use.",
    ),
  },
  {
    id: "olympiad",
    where: "school.example/news",
    what: t(
      "Maktab sayti: “Sardor matematika olimpiadasida 2-o‘rinni oldi”",
      "The school site: “Sardor took 2nd place in the maths olympiad”",
    ),
    action: "keep",
    why: t(
      "Yutuq haqidagi ochiq xabar — yaxshi iz. Unda manzil yoki telefon yo‘q.",
      "A public note of an achievement is a good trace. There is no address or phone in it.",
    ),
  },
  {
    id: "github",
    where: "github.example/sardor-dev",
    what: t(
      "O‘quv loyihalaringiz ochiq repolarda",
      "Your study projects in public repos",
    ),
    action: "keep",
    why: t(
      "Portfolio — ish beruvchiga foydali. Faqat repolarda parol yoki kalit qolmaganini tekshiring.",
      "A portfolio helps with employers. Just check no passwords or keys are left in the repos.",
    ),
  },
];

export type Calls = Partial<Record<string, Action>>;

export const auditRight = (calls: Calls) =>
  FINDINGS.every((f) => calls[f.id] === f.action);
