// Server-only grading. Never import this module from client components:
// it holds the answer keys. The route handler is its only consumer.
import {
  CHOICES,
  CHOICE_POINTS,
  MAX_PRACTICE,
  MAX_TEST,
  MAX_TOTAL,
  TASKS,
  type ExamAnswers,
  type ExamItemResult,
  type ExamResult,
} from "./content";

const CHOICE_KEYS: Record<string, { answer: number; explain: string }> = {
  w1: {
    answer: 1,
    explain:
      "Rol aloqaga bog‘liq: browser so‘raganda application server, bazaga so‘rov yuborganda esa client bo‘ladi.",
  },
  w2: {
    answer: 2,
    explain:
      "Bitta sayt ochilmasligi hamma xizmat ishdan chiqqanini isbotlamaydi: dalil yig‘ib muammoni toraytiring.",
  },
  w3: {
    answer: 1,
    explain:
      "DHCP IP, prefix, gateway va DNS resolver sozlamalarini beradi (DORA). Nomni IPga DNS aylantiradi.",
  },
  w4: {
    answer: 2,
    explain:
      "Har oktet 8 bit, ya’ni 0–255 oralig‘ida. 300 bu chegaradan oshadi.",
  },
  w5: {
    answer: 2,
    explain:
      "NAT ≠ firewall: NAT manzilni translyatsiya qiladi, ruxsatni esa firewall qoidalari belgilaydi.",
  },
  w6: {
    answer: 3,
    explain:
      "TTL har foydalanishda boshidan boshlanmaydi: 300 − 120 = taxminan 180 soniya qoladi.",
  },
  w7: {
    answer: 1,
    explain:
      "CNAME boshqa domen nomiga ishora qiladi. IPv4 qiymati A yozuviga tegishli.",
  },
  w8: {
    answer: 3,
    explain:
      "UDP yetkazish va tartib kafolatini o‘zi bermaydi; HTTP/3 QUIC orqali UDP ustida ishlaydi. DNS TCPdan ham foydalanadi.",
  },
  w9: {
    answer: 1,
    explain:
      "HttpOnly JavaScriptning cookieni o‘qishini cheklaydi. Cookie tegishli requestlarda baribir yuboriladi.",
  },
  w10: {
    answer: 3,
    explain:
      "Authentication — kim kirdi; authorization — unga nima mumkin. Har requestda resursga ruxsat serverda tekshiriladi.",
  },
  l1: {
    answer: 1,
    explain:
      "Shell tarjimon: buyruqni yadro tushunadigan tizim chaqiruviga aylantiradi, yadro esa apparatni boshqaradi.",
  },
  l2: {
    answer: 1,
    explain:
      "Qurilmalar (/dev/sda) va jarayon/xotira ma’lumotlari (/proc) ham fayl ko‘rinishida beriladi.",
  },
  l3: {
    answer: 2,
    explain:
      "Kali xavfsizlik sinovlari uchun asboblar qutisi; o‘rganish va kundalik ish uchun Ubuntu/Debian qulayroq.",
  },
  l4: {
    answer: 1,
    explain: "Ubuntu/Debian/Kali — apt, Alpine — apk, RHEL/Rocky — dnf.",
  },
  l5: {
    answer: 1,
    explain:
      "/var o‘zgaruvchan ma’lumotlarni saqlaydi; xatolar uchun /var/log ga qaraladi.",
  },
  l6: {
    answer: 2,
    explain: "root foydalanuvchisining papkasi /home/root emas, /root.",
  },
  l7: {
    answer: 2,
    explain:
      "/proc — virtual tizim oynasi: haqiqiy diskda joy olmaydi, uni nano bilan tahrirlab bo‘lmaydi.",
  },
  l8: {
    answer: 2,
    explain:
      "Slesh bilan boshlanmagan yo‘l nisbiy: joriy papkadan boshlab qidiriladi.",
  },
  l9: {
    answer: 2,
    explain: ">> oxiriga qo‘shadi, > esa eski mazmunni o‘chirib qayta yozadi.",
  },
  l10: {
    answer: 3,
    explain: "find hajm, vaqt va tur bo‘yicha qidiradi: find / -size +500M.",
  },
};

const norm = (value: string) =>
  value
    .replace(/ /g, " ")
    .trim()
    .replace(/^\$\s*/, "")
    .replace(/\s+/g, " ");
const lower = (value: string) => norm(value).toLowerCase();

function flagLetters(tokens: string[]) {
  const letters = new Set<string>();
  const words = new Set<string>();
  const rest: string[] = [];
  for (const token of tokens) {
    if (token.startsWith("--")) words.add(token);
    else if (token.startsWith("-") && token.length > 1)
      for (const char of token.slice(1)) letters.add(char);
    else rest.push(token);
  }
  return { letters, words, rest };
}

function simulateFs(input: string) {
  const home = "/home/ali";
  let cwd = home;
  const dirs = new Set<string>(["/", "/home", home]);
  const files = new Set<string>();
  const resolve = (path: string) => {
    const full = path.startsWith("~")
      ? home + path.slice(1)
      : path.startsWith("/")
        ? path
        : `${cwd}/${path}`;
    const parts: string[] = [];
    for (const part of full.split("/")) {
      if (!part || part === ".") continue;
      if (part === "..") parts.pop();
      else parts.push(part);
    }
    return `/${parts.join("/")}`;
  };
  const parent = (path: string) => path.replace(/\/[^/]*$/, "") || "/";
  const commands = input
    .split(/\n|&&|;/)
    .map(norm)
    .filter(Boolean);
  for (const command of commands.slice(0, 20)) {
    const [name, ...args] = command.split(" ");
    const { letters, rest } = flagLetters(args);
    if (name === "mkdir")
      for (const arg of rest) {
        const path = resolve(arg);
        if (letters.has("p") || dirs.has(parent(path))) {
          let walk = "";
          for (const part of path.split("/").filter(Boolean)) {
            walk += `/${part}`;
            if (letters.has("p") || walk === path) dirs.add(walk);
          }
        }
      }
    else if (name === "touch")
      for (const arg of rest) {
        const path = resolve(arg);
        if (dirs.has(parent(path)) && !dirs.has(path)) files.add(path);
      }
    else if (name === "cd") {
      const path = rest[0] ? resolve(rest[0]) : home;
      if (dirs.has(path)) cwd = path;
    }
  }
  return { dirs, files };
}

type InputKey = { grade: (value: string) => number; expected: string };
const exact =
  (expected: string, points: number) =>
  (value: string): number =>
    lower(value) === expected.toLowerCase() ? points : 0;

const INPUT_KEYS: Record<string, InputKey> = {
  "url-scheme": {
    expected: "https",
    grade: (v) => exact("https", 1)(lower(v).replace(/:?\/*$/, "")),
  },
  "url-host": {
    expected: "shop.example.com",
    grade: exact("shop.example.com", 1),
  },
  "url-port": { expected: "8443", grade: exact("8443", 1) },
  "url-path": { expected: "/search", grade: exact("/search", 1) },
  "url-query": {
    expected: "q=network&page=2",
    grade: (v) => exact("q=network&page=2", 1)(norm(v).replace(/^\?/, "")),
  },
  "url-fragment": {
    expected: "results",
    grade: (v) => exact("results", 1)(norm(v).replace(/^#/, "")),
  },
  "subnet-network": {
    expected: "192.168.1.0/25",
    grade: (v) => exact("192.168.1.0/25", 2)(v.replace(/\s/g, "")),
  },
  "subnet-last": {
    expected: "192.168.1.126",
    grade: (v) => exact("192.168.1.126", 2)(v.replace(/\s/g, "")),
  },
  "subnet-same": {
    expected: "Yo‘q, boshqa /25 subnetda",
    grade: exact("Yo‘q, boshqa /25 subnetda", 2),
  },
  "route-1": { expected: "Router B", grade: exact("Router B", 2) },
  "route-2": { expected: "Router A", grade: exact("Router A", 2) },
  "route-3": { expected: "ISP gateway", grade: exact("ISP gateway", 2) },
  "dns-1": { expected: "A", grade: exact("A", 1) },
  "dns-2": { expected: "AAAA", grade: exact("AAAA", 1) },
  "dns-3": { expected: "CNAME", grade: exact("CNAME", 1) },
  "dns-4": { expected: "MX", grade: exact("MX", 1) },
  "dns-5": { expected: "NS", grade: exact("NS", 1) },
  "dns-6": { expected: "PTR", grade: exact("PTR", 1) },
  "status-1": { expected: "401", grade: exact("401", 2) },
  "status-2": { expected: "403", grade: exact("403", 2) },
  "status-3": { expected: "500", grade: exact("500", 2) },
  "http-request": {
    expected:
      "GET /products?limit=5 HTTP/1.1\nHost: example.com\nAccept: application/json",
    grade(value) {
      const lines = value
        .replace(/\r/g, "")
        .split("\n")
        .map((l) => l.trim());
      while (lines.length && !lines[0]) lines.shift();
      const first = (lines.shift() ?? "").replace(/\s+/g, " ");
      const blank = lines.findIndex((line) => !line);
      const headers = blank < 0 ? lines : lines.slice(0, blank);
      const body = blank < 0 ? [] : lines.slice(blank + 1).filter(Boolean);
      const firstOk = /^GET \/products\?limit=5 HTTP\/1\.1$/.test(first);
      let score = firstOk ? 3 : 0;
      if (headers.some((h) => /^host:\s*example\.com$/i.test(h))) score += 2;
      if (headers.some((h) => /^accept:\s*application\/json$/i.test(h)))
        score += 2;
      if (
        firstOk &&
        body.length === 0 &&
        !headers.some((h) => /^content-(length|type):/i.test(h))
      )
        score += 1;
      return score;
    },
  },
  "cmd-cd": {
    expected: "cd /var/log",
    grade: (v) => (/^cd \/var\/log\/?$/.test(norm(v)) ? 3 : 0),
  },
  "cmd-ls": {
    expected: "ls -la",
    grade(v) {
      const [name, ...args] = norm(v).split(" ");
      if (name !== "ls") return 0;
      const { letters, words, rest } = flagLetters(args);
      const hidden = letters.has("a") || letters.has("A") || words.has("--all");
      const dirOk = rest.every((r) => r === "." || r === "./");
      return letters.has("l") && hidden && dirOk ? 3 : 0;
    },
  },
  "cmd-make": {
    expected: "mkdir loyiha\ntouch loyiha/notes.txt",
    grade(v) {
      const { dirs, files } = simulateFs(v);
      return (
        (dirs.has("/home/ali/loyiha") ? 2 : 0) +
        (files.has("/home/ali/loyiha/notes.txt") ? 2 : 0)
      );
    },
  },
  "cmd-append": {
    expected: 'echo "Boshlandi" >> app.log',
    grade: (v) =>
      /^echo (?:(["'])boshlandi\1|boshlandi) ?>> ?(?:\.\/)?app\.log$/i.test(
        norm(v),
      )
        ? 4
        : 0,
  },
  "cmd-find": {
    expected: "find /home -size +50M",
    grade: (v) =>
      /^find \/home\/? (?:-type f )?-size \+50M(?: -type f)?$/.test(norm(v))
        ? 4
        : 0,
  },
  "cmd-sudo": {
    expected: "sudo !!",
    grade: (v) => (norm(v) === "sudo !!" ? 2 : 0),
  },
  "cmd-rm": {
    expected: "rm -r loyiha_papka",
    grade(v) {
      const [name, ...args] = norm(v).split(" ");
      if (name !== "rm") return 0;
      const { letters, words, rest } = flagLetters(args);
      const recursive =
        letters.has("r") || letters.has("R") || words.has("--recursive");
      const target =
        rest.length === 1 &&
        /^(?:\.\/|\/home\/ali\/)?loyiha_papka\/?$/.test(rest[0]);
      return recursive && target ? 2 : 0;
    },
  },
};

export function inputKeyIds() {
  return Object.keys(INPUT_KEYS);
}

export function gradeExam(answers: ExamAnswers): ExamResult {
  const items: ExamItemResult[] = [];
  let test = 0;
  let practice = 0;
  for (const choice of CHOICES) {
    const key = CHOICE_KEYS[choice.id];
    const raw = answers[choice.id];
    const score =
      raw !== undefined && /^\d$/.test(raw) && Number(raw) === key.answer
        ? CHOICE_POINTS
        : 0;
    test += score;
    items.push({
      id: choice.id,
      score,
      max: CHOICE_POINTS,
      expected: score ? undefined : choice.options[key.answer],
      explain: key.explain,
    });
  }
  for (const task of TASKS) {
    for (const input of task.inputs) {
      const key = INPUT_KEYS[input.id];
      const score = Math.min(
        input.points,
        Math.max(0, key.grade(answers[input.id] ?? "")),
      );
      practice += score;
      items.push({
        id: input.id,
        score,
        max: input.points,
        expected: score === input.points ? undefined : key.expected,
      });
    }
  }
  return {
    total: test + practice,
    max: MAX_TOTAL,
    test: { score: test, max: MAX_TEST },
    practice: { score: practice, max: MAX_PRACTICE },
    items,
  };
}
