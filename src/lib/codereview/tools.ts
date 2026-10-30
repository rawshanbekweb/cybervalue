// Academy Intermediate · Secure code review: a ten-line pull request with
// four security problems to flag, and four findings to rate by impact and
// likelihood. Simplified, but the mistakes are the ones reviews catch.
import type { Text } from "../anim-lab/types";

const t = (uz: string, en: string): Text => ({ uz, en });

// --- The diff --------------------------------------------------------------------------

export type DiffLine = { no: number; code: string; issue?: Text };

export const DIFF: DiffLine[] = [
  { no: 1, code: 'app.get("/orders/:id", requireLogin, async (req, res) => {' },
  {
    no: 2,
    code: "  const order = await db.orders.findById(req.params.id);",
    issue: t(
      "Buyurtma egasi tekshirilmaydi: istalgan foydalanuvchi boshqaning buyurtmasini ko‘radi (IDOR).",
      "The order’s owner isn’t checked: any user can read anyone’s order (IDOR).",
    ),
  },
  { no: 3, code: "  res.json(order);" },
  { no: 4, code: "});" },
  {
    no: 5,
    code: "const SESSION_TTL = 60 * 60 * 24 * 365; // seconds",
    issue: t(
      "Bir yillik sessiya: o‘g‘irlangan cookie bir yil ishlaydi.",
      "A year-long session: a stolen cookie works for a year.",
    ),
  },
  {
    no: 6,
    code: "app.use(cors({ origin: true, credentials: true }));",
    issue: t(
      "Har qanday sayt foydalanuvchi cookie’lari bilan so‘rov yubora oladi.",
      "Any website can send requests with the user’s cookies.",
    ),
  },
  { no: 7, code: 'logger.info("order viewed", { userId: req.user.id });' },
  {
    no: 8,
    code: 'if (user.role = "admin") {',
    issue: t(
      "= taqqoslash emas, qiymat beradi: shart har doim rost, hamma admin bo‘ladi.",
      "= assigns instead of comparing: the condition is always true and everyone is admin.",
    ),
  },
  { no: 9, code: "  return showAdminPanel(res);" },
  { no: 10, code: "}" },
];

export const FLAGGED = DIFF.filter((l) => l.issue).map((l) => l.no);

export const reviewRight = (picked: Iterable<number>) => {
  const set = new Set(picked);
  return set.size === FLAGGED.length && FLAGGED.every((n) => set.has(n));
};

// --- Rating ----------------------------------------------------------------------------

export const LEVELS = ["critical", "high", "medium", "low"] as const;
export type Level = (typeof LEVELS)[number];

export const LEVEL_NAMES: Record<Level, Text> = {
  critical: t("Kritik", "Critical"),
  high: t("Yuqori", "High"),
  medium: t("O‘rta", "Medium"),
  low: t("Past", "Low"),
};

export type Rated = { id: string; text: Text; level: Level; why: Text };

export const RATED: Rated[] = [
  {
    id: "role",
    text: t(
      "Rol tekshiruvidagi = tufayli har qanday foydalanuvchi admin paneliga kiradi",
      "Because of = in the role check, any user gets into the admin panel",
    ),
    level: "critical",
    why: t(
      "Ta’sir eng katta, hujum uchun hech narsa kerak emas.",
      "The biggest impact, and the attack needs nothing at all.",
    ),
  },
  {
    id: "idor",
    text: t(
      "ID ni o‘zgartirib, boshqa mijozlarning buyurtma va manzillarini ko‘rish",
      "Changing the ID shows other customers’ orders and addresses",
    ),
    level: "high",
    why: t(
      "Shaxsiy ma’lumot sizadi; faqat login va raqam kerak.",
      "Personal data leaks; it takes only a login and a number.",
    ),
  },
  {
    id: "ttl",
    text: t(
      "Sessiya cookie’si bir yil amal qiladi",
      "The session cookie stays valid for a year",
    ),
    level: "medium",
    why: t(
      "Zarar katta bo‘lishi mumkin, lekin avval cookie o‘g‘irlanishi kerak.",
      "The damage could be large, but the cookie has to be stolen first.",
    ),
  },
  {
    id: "header",
    text: t(
      "Javobda X-Powered-By: Express sarlavhasi",
      "The response sends an X-Powered-By: Express header",
    ),
    level: "low",
    why: t(
      "Hujumchiga ozgina ma’lumot beradi, o‘zi hech narsani ochmaydi.",
      "It tells an attacker a little but opens nothing by itself.",
    ),
  },
];

export type Ratings = Partial<Record<string, Level>>;

export const ratingRight = (r: Ratings) =>
  RATED.every((f) => r[f.id] === f.level);
