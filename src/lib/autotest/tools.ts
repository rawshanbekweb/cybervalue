// Academy Intermediate · Automated security testing: six findings from a
// static analyser to triage into real problems and false alarms, and five
// problems to match to the pipeline check that catches them. The rules
// and checks are simplified versions of what Semgrep, CodeQL, npm audit,
// gitleaks and ZAP report.
import type { Text } from "../anim-lab/types";

const t = (uz: string, en: string): Text => ({ uz, en });

// --- SAST triage -----------------------------------------------------------------------

export type Finding = {
  id: string;
  rule: string;
  file: string;
  code: string;
  real: boolean;
  why: Text;
};

export const FINDINGS: Finding[] = [
  {
    id: "sqli",
    rule: "sql-injection",
    file: "src/routes/users.js:14",
    code: 'db.query("SELECT * FROM users WHERE id = " + req.params.id)',
    real: true,
    why: t(
      "Foydalanuvchi kiritmasi so‘rov matniga qo‘shilyapti.",
      "User input is joined into the query text.",
    ),
  },
  {
    id: "xss",
    rule: "reflected-xss",
    file: "src/routes/search.js:9",
    code: "res.send(`<h1>${req.query.q}</h1>`)",
    real: true,
    why: t(
      "So‘rov parametri ekranlanmasdan HTML’ga tushyapti.",
      "A query parameter lands in HTML unescaped.",
    ),
  },
  {
    id: "fixture",
    rule: "hardcoded-password",
    file: "tests/fixtures/login.json:3",
    code: '"password": "test-password-123"',
    real: false,
    why: t(
      "Test fayli: haqiqiy hisob emas. Qoidadan istisno qo‘shiladi.",
      "A test fixture, not a real account. Add an exception to the rule.",
    ),
  },
  {
    id: "random",
    rule: "insecure-random",
    file: "src/ui/confetti.js:22",
    code: "const delay = Math.random() * 300;",
    real: false,
    why: t(
      "Animatsiya kechikishi: sir yoki token emas.",
      "An animation delay, not a secret or a token.",
    ),
  },
  {
    id: "eval",
    rule: "eval-injection",
    file: "src/tools/calc.js:5",
    code: "return eval(req.body.expression);",
    real: true,
    why: t(
      "Foydalanuvchi yuborgan matn kod sifatida bajariladi.",
      "Text the user sent is run as code.",
    ),
  },
  {
    id: "exec",
    rule: "command-injection",
    file: "scripts/build.js:11",
    code: 'execSync("rm -rf " + path.join(__dirname, "dist"));',
    real: false,
    why: t(
      "Yo‘l koddagi konstantalardan yasalgan; foydalanuvchi unga tegolmaydi.",
      "The path is built from constants in the code; no user can touch it.",
    ),
  },
];

export type Calls = Partial<Record<string, boolean>>;

/** true = a real problem. */
export const triageRight = (calls: Calls) =>
  FINDINGS.every((f) => calls[f.id] === f.real);

// --- Which check catches it ------------------------------------------------------------

export const CHECKS = ["sast", "sca", "secrets", "dast"] as const;
export type Check = (typeof CHECKS)[number];

export const CHECK_NAMES: Record<Check, Text> = {
  sast: t("SAST — kodni o‘qiydi", "SAST — reads the code"),
  sca: t("SCA — kutubxonalarni tekshiradi", "SCA — checks dependencies"),
  secrets: t("Sirlarni qidirish", "Secret scanning"),
  dast: t(
    "DAST — ishlayotgan saytni sinaydi",
    "DAST — probes the running site",
  ),
};

export type Problem = { id: string; text: Text; check: Check };

export const PROBLEMS: Problem[] = [
  {
    id: "key",
    text: t(
      "Commit’da AWS kirish kaliti qolib ketgan",
      "An AWS access key left in a commit",
    ),
    check: "secrets",
  },
  {
    id: "lodash",
    text: t(
      "package-lock.json’da lodash 4.17.15",
      "lodash 4.17.15 in package-lock.json",
    ),
    check: "sca",
  },
  {
    id: "concat",
    text: t(
      "SQL so‘rovi satrlarni qo‘shib yasalgan",
      "A SQL query built by joining strings",
    ),
    check: "sast",
  },
  {
    id: "header",
    text: t(
      "Staging saytida Content-Security-Policy sarlavhasi yo‘q",
      "The staging site sends no Content-Security-Policy header",
    ),
    check: "dast",
  },
  {
    id: "cookie",
    text: t(
      "Login cookie’si HttpOnly va Secure’siz qaytadi",
      "The login cookie comes back without HttpOnly and Secure",
    ),
    check: "dast",
  },
];

export type Picks = Partial<Record<string, Check>>;

export const pipelineRight = (picks: Picks) =>
  PROBLEMS.every((p) => picks[p.id] === p.check);
