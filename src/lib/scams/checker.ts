// "Check a suspicious message": a rule-based look at pasted text, run in the
// visitor's browser. It never sends the text anywhere and never claims a
// message is safe — it only points at the signs scams in Uzbekistan share,
// in Uzbek (Latin and Cyrillic), Russian and English.
import type { Text } from "../network/ip";

const t = (uz: string, en: string): Text => ({ uz, en });

export type Flag = {
  id: string;
  title: Text;
  why: Text;
  /** How much this sign weighs: 3 is a near-certain scam on its own. */
  weight: 1 | 2 | 3;
};

type Rule = Flag & { test: (text: string) => string | null };

/** The first match of any pattern, as the words to highlight. */
const any =
  (...patterns: RegExp[]) =>
  (text: string) => {
    for (const p of patterns) {
      const m = p.exec(text);
      if (m) return m[0];
    }
    return null;
  };

// Lower-cased, with the Uzbek apostrophes made one character, so patterns
// stay short. Cyrillic is matched as written.
export function normalize(text: string) {
  return text
    .toLowerCase()
    .replace(/[‘’ʻʼ`´]/g, "'")
    .replace(/\s+/g, " ");
}

const RULES: Rule[] = [
  {
    id: "code",
    weight: 3,
    title: t("SMS kod so‘ralmoqda", "It asks for a code from an SMS"),
    why: t(
      "Bank, to‘lov ilovasi yoki operator hech qachon SMS kodni so‘ramaydi. Kodni aytgan odam kartangizni boshqara oladi.",
      "A bank, payment app or operator never asks for an SMS code. Whoever has the code can control your card.",
    ),
    test: any(
      /(sms|tasdiq\w*|bir martalik)[^.!?\n]{0,40}(kod|parol)/,
      /(kod|parol)\w*[^.!?\n]{0,30}(ayt|yubor|yoz|jo'nat|kirit)/,
      /(смс|sms)[^.!?\n]{0,30}код|код[^.!?\n]{0,30}(смс|sms|подтвержд)/,
      /(код|кодни)[^.!?\n]{0,25}(айт|юбор|ёз|назов|сообщ|отправ)/,
      /(verification|one-time|sms) code|send (me )?the code/,
    ),
  },
  {
    id: "card",
    weight: 3,
    title: t("Karta ma’lumotlari so‘ralmoqda", "It asks for card details"),
    why: t(
      "Pul olish uchun faqat karta raqami kifoya. Amal qilish muddati, CVV yoki PIN so‘rasa — bu o‘g‘irlik.",
      "Receiving money needs only the card number. A request for the expiry date, CVV or PIN is theft.",
    ),
    test: any(
      /\b(cvv|cvc|pin)\b/,
      /(amal qilish|muddat)\w*[^.!?\n]{0,30}(yoz|kirit|yubor)/,
      /(срок действия|cvv|пин-?код)/,
      /expiry date|card details/,
    ),
  },
  {
    id: "upfront",
    weight: 3,
    title: t("Oldindan to‘lov talab qilinmoqda", "It wants money first"),
    why: t(
      "Yutuq, ish, kredit yoki “qaytariladigan” pul uchun oldindan to‘lov so‘rash — eng keng tarqalgan firibgarlik.",
      "Paying first to get a prize, a job, a loan or a “refund” is the most common scam there is.",
    ),
    test: any(
      /(yetkazib berish|rasmiylashtirish|komissiya|sug'urta|depozit|garov)\w*[^.!?\n]{0,30}(to'la|uchun|so'm)/,
      /(oldindan|avval)\w*[^.!?\n]{0,20}to'la/,
      /(оплат[а-яё]* (доставк|комисси)|предоплат|залог|страховой взнос)/,
      /(processing|delivery|release) fee|pay (a )?(small )?fee/,
    ),
  },
  {
    id: "prize",
    weight: 2,
    title: t("Kutilmagan yutuq yoki sovg‘a", "An unexpected prize or gift"),
    why: t(
      "Siz qatnashmagan tanlovda yutib bo‘lmaydi. “Yutuq” odatda to‘lov yoki ma’lumot olish uchun bahona.",
      "You cannot win a draw you never entered. A “prize” is usually a pretext for a payment or your data.",
    ),
    test: any(
      /(yutib oldingiz|yutuq|g'olib|sovg'a|bonus|tabriklaymiz)/,
      /(ютуқ|ғолиб|совға|табриклаймиз)/,
      /(вы выиграли|выигрыш|приз|подарок|поздравляем)/,
      /(you('ve| have)? won|winner|congratulations|free gift)/,
    ),
  },
  {
    id: "urgent",
    weight: 1,
    title: t("Shoshiltirish va qo‘rqitish", "Pressure and threats"),
    why: t(
      "Firibgar o‘ylashga vaqt bermaydi: “hozir”, “30 daqiqada”, “karta bloklanadi”. Haqiqiy xizmatlar bunday bosim qilmaydi.",
      "A scammer leaves no time to think: “now”, “within 30 minutes”, “your card will be blocked”. Real services do not push like this.",
    ),
    test: any(
      /(shoshiling|tezroq|zudlik|darhol|hoziroq|\d+ (daqiqa|soat)\w* ichida|bugun oxirgi)/,
      /(bloklan|muzlatil|yopil)\w*/,
      /(шошилинг|тезроқ|дарҳол|блокла)/,
      /(срочно|немедленно|в течение \d+|заблокир)/,
      /(urgent|immediately|within \d+ (minutes|hours)|will be (blocked|suspended))/,
    ),
  },
  {
    id: "link",
    weight: 2,
    title: t("Shubhali havola", "A suspicious link"),
    why: t(
      "Qisqartirilgan havola, IP manzil yoki tanish nomga o‘xshatilgan domen sizni soxta sahifaga olib boradi. Ilovani o‘zingiz oching.",
      "A shortened link, a raw IP address or a domain dressed up as a familiar name leads to a fake page. Open the app yourself.",
    ),
    test: any(
      /\b(bit\.ly|tinyurl\.com|cutt\.ly|t\.co|goo\.gl|is\.gd|clck\.ru)\/\S+/,
      /https?:\/\/\d{1,3}(\.\d{1,3}){3}\S*/,
      // Cheap domains that throwaway scam pages favour.
      /https?:\/\/[^\s/]+\.(top|xyz|site|online|click|live|icu|shop|buzz|cfd|sbs)\b\S*/,
      // A familiar word glued to something else with a hyphen.
      /https?:\/\/[^\s/]*(-(bank|pay|bonus|login|secure|verify|gov)|(bank|pay|bonus|login|secure|verify)-)[^\s/]*\S*/,
      /https?:\/\/[^\s/]*xn--\S*/,
    ),
  },
  {
    id: "apk",
    weight: 3,
    title: t("Ilova fayli yuborilgan", "An app file was sent"),
    why: t(
      "Chatda yuborilgan .apk fayl telefoningizni to‘liq boshqarib, SMS kodlarni o‘qiy oladi. Ilovani faqat rasmiy do‘kondan o‘rnating.",
      "An .apk file sent in a chat can take over your phone and read your SMS codes. Install apps only from the official store.",
    ),
    test: any(/\S+\.apk\b/, /\b(apk|apk-fayl|apk файл)\b/),
  },
  {
    id: "official",
    weight: 2,
    title: t(
      "Rasmiy xizmat nomidan gapirmoqda",
      "It speaks for an official service",
    ),
    why: t(
      "“Bank xavfsizlik xizmati”, “IIB”, “soliq” deb tanishtirish ishonch uyg‘otish usuli. Rasmiy raqamga o‘zingiz qo‘ng‘iroq qilib tekshiring.",
      "“The bank’s security service”, “the police” or “the tax office” is a way to win trust. Check by calling the official number yourself.",
    ),
    test: any(
      /(xavfsizlik xizmati|bank xodimi|iib|militsiya|soliq qo'mitasi|prokuratura|davlat xizmati)/,
      /(хавфсизлик хизмати|банк ходими)/,
      /(служба безопасности|сотрудник банка|полици|налогов)/,
      /(security (team|department|service)|bank officer|police|tax office)/,
    ),
  },
  {
    id: "money",
    weight: 2,
    title: t("Tez va katta daromad va’dasi", "A promise of quick, big money"),
    why: t(
      "“Kuniga 500 ming, tajriba shart emas” yoki “oyiga 40% foyda” — bunday daromad bo‘lmaydi. Keyinchalik albatta to‘lov so‘raladi.",
      "“500,000 a day, no experience needed” or “40% a month” does not exist. A payment request always follows.",
    ),
    test: any(
      /(kuniga|kunlik|haftasiga)[^.!?\n]{0,25}\d[\d\s]*(ming|so'm|\$|dollar)/,
      /\d+\s?% (foyda|daromad)/,
      /(tajriba shart emas|uydan turib|like bosib|layk)/,
      /(в день|ежедневно)[^.!?\n]{0,20}\d|\d+\s?% (прибыл|доход)|без опыта/,
      /(per day|a day)[^.!?\n]{0,20}\$\s?\d|\d+\s?% (profit|return)|no experience/,
    ),
  },
  {
    id: "transfer",
    weight: 2,
    title: t("Pul o‘tkazish so‘ralmoqda", "It asks for a transfer"),
    why: t(
      "Tanishingiz nomidan “tez pul tashlab tur” degan xabar kelsa, unga boshqa yo‘l bilan — qo‘ng‘iroq qilib — tekshiring. Akkaunt buzilgan bo‘lishi mumkin.",
      "If a friend’s account asks you to “send money quickly”, check with them another way — call them. The account may be hacked.",
    ),
    test: any(
      /(pul|summa)[^.!?\n]{0,30}(tashla|o'tkaz|jo'nat)/,
      /(tashlab tur|qarz berib tur|kartaga tashla)/,
      /(переведи|скинь|займи)/,
      /(send|transfer) (me )?(some )?money/,
    ),
  },
];

export type CheckResult = {
  flags: (Flag & { match: string })[];
  score: number;
  verdict: "none" | "caution" | "danger";
};

/** Every sign found in the text, strongest first, and an overall verdict. */
export function checkMessage(raw: string): CheckResult {
  const text = normalize(raw.slice(0, 4000));
  const flags = RULES.flatMap(({ test, ...flag }) => {
    const match = test(text);
    return match ? [{ ...flag, match }] : [];
  }).sort((a, b) => b.weight - a.weight);
  const score = flags.reduce((sum, f) => sum + f.weight, 0);
  const verdict =
    flags.some((f) => f.weight === 3) || score >= 4
      ? "danger"
      : score > 0
        ? "caution"
        : "none";
  return { flags, score, verdict };
}

export const RULE_COUNT = RULES.length;
