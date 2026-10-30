// Server-only grading for the Linux and IP exam. Never import this module
// from client components: it holds the answer keys. The route handler is its
// only consumer.
import {
  CHOICES,
  MAX_OPEN,
  MAX_TEST,
  MAX_TOTAL,
  OPENS,
  type LipAnswers,
  type LipItemResult,
  type LipResult,
} from "./content";

const CHOICE_KEYS: Record<string, { answer: number; explain: string }> = {
  l1: {
    answer: 1,
    explain: "pwd — print working directory: joriy papka yo‘li.",
  },
  l2: {
    answer: 2,
    explain:
      "-l batafsil, -a yashirin (nuqta bilan boshlanadigan) fayllarni ham ko‘rsatadi.",
  },
  l3: { answer: 3, explain: ".. — bir daraja yuqori papka." },
  l4: {
    answer: 0,
    explain:
      "-p (parents) yo‘lda yo‘q papkalarni ham yaratadi va papka mavjud bo‘lsa xato bermaydi.",
  },
  l5: { answer: 3, explain: "cat fayl mazmunini standart chiqishga yozadi." },
  l6: {
    answer: 1,
    explain: "-r (recursive) papkani ichidagi hamma narsa bilan nusxalaydi.",
  },
  l7: { answer: 2, explain: "Bir papka ichida mv faylni qayta nomlaydi." },
  l8: {
    answer: 0,
    explain: "6 = rw-, 4 = r--: egasi rw, guruh r, boshqalar r.",
  },
  l9: {
    answer: 1,
    explain: "chown egasi:guruh fayl — egasi va guruhini o‘zgartiradi.",
  },
  l10: {
    answer: 3,
    explain: "-i (ignore case) katta-kichik harfni farqlamaydi.",
  },
  l11: {
    answer: 1,
    explain: "Pipe chap buyruq chiqishini o‘ng buyruq kirishiga uzatadi.",
  },
  l12: {
    answer: 0,
    explain: "9 — SIGKILL: jarayon darhol, tozalashsiz to‘xtatiladi.",
  },
  l13: {
    answer: 2,
    explain:
      "> stdout ni faylga yo‘naltiradi, 2>&1 esa stderr ni ham o‘sha joyga yuboradi.",
  },
  l14: { answer: 2, explain: "sudo buyruqni root huquqi bilan bajaradi." },
  l15: {
    answer: 1,
    explain:
      "df -h — fayl tizimlaridagi bo‘sh joy; du — papka hajmi; free — xotira.",
  },
  l16: {
    answer: 2,
    explain: "-mtime -1 — oxirgi 1 kun (24 soat) ichida o‘zgargan.",
  },
  l17: { answer: 3, explain: "man — qo‘llanma (manual) sahifasi." },
  l18: {
    answer: 0,
    explain: "Guruh qismi r-x: o‘qish va bajarish bor, yozish yo‘q.",
  },
  l19: {
    answer: 1,
    explain: "-f (follow) faylga qo‘shilayotgan qatorlarni jonli ko‘rsatadi.",
  },
  l20: {
    answer: 2,
    explain: "which PATH bo‘yicha qaysi fayl ishga tushishini ko‘rsatadi.",
  },
  n1: { answer: 1, explain: "IPv4 — 32 bit, 8 bitdan 4 ta oktet." },
  n2: { answer: 2, explain: "Har oktet 0–255; 4 ta oktet bo‘lishi shart." },
  n3: { answer: 1, explain: "/24 — 24 ta 1 bit: 255.255.255.0." },
  n4: {
    answer: 3,
    explain:
      "Xususiy diapazonlar: 10.0.0.0/8, 172.16.0.0/12 (172.16–172.31), 192.168.0.0/16.",
  },
  n5: { answer: 1, explain: "127.0.0.0/8 — loopback, kompyuterning o‘zi." },
  n6: {
    answer: 0,
    explain: "DHCP IP, maska, gateway va DNS sozlamalarini avtomatik beradi.",
  },
  n7: {
    answer: 2,
    explain: "Gateway — tarmoqdan tashqariga chiqish uchun router manzili.",
  },
  n8: {
    answer: 1,
    explain: "/26 → 2^6 = 64 manzil, tarmoq va broadcast ayirilsa 62 host.",
  },
  n9: {
    answer: 2,
    explain:
      "/25 blok 128: 130 → 128–255 oralig‘i, tarmoq manzili 192.168.1.128.",
  },
  n10: { answer: 3, explain: "240 = 11110000 → 24 + 4 = /28." },
  n11: {
    answer: 1,
    explain:
      "/24 da uchinchi oktet farq qilsa — turli tarmoqlar; ular router orqali bog‘lanadi.",
  },
  n12: {
    answer: 1,
    explain: "ip a interfeyslar va ularning manzillarini ko‘rsatadi.",
  },
  n13: { answer: 1, explain: "ping ICMP echo request/reply ishlatadi." },
  n14: { answer: 2, explain: "DNS nomni IP manzilga aylantiradi." },
  n15: {
    answer: 1,
    explain:
      "169.254.0.0/16 — APIPA (link-local): DHCP javob bermaganda olinadi.",
  },
  n16: { answer: 2, explain: "4 ta subnet uchun 2 bit kerak: /16 + 2 = /18." },
  n17: {
    answer: 3,
    explain: "/29 — 8 manzil: .0 tarmoq, .7 broadcast, oxirgi host .6.",
  },
  n18: { answer: 2, explain: "IPv6 — 128 bit." },
  n19: {
    answer: 0,
    explain:
      "NAT ichki xususiy manzillarni routerning ochiq manziliga almashtiradi.",
  },
  n20: {
    answer: 3,
    explain:
      "* * * — shu router ICMP javobini yubormadi; keyingi qadamlar javob bersa, yo‘l ishlayapti.",
  },
};

/** Tidy an answer: drop a leading prompt, unify quotes and spaces. */
export function norm(value: string) {
  return value
    .replace(/ /g, " ")
    .replace(/[“”«»]/g, '"')
    .replace(/[‘’]/g, "'")
    .trim()
    .replace(/^\$\s*/, "")
    .replace(/\s+/g, " ")
    .replace(/(?<!\\);$/, "")
    .trim();
}

const unquote = (s: string) => s.replace(/["']/g, "");

type OpenKey = {
  check: (answer: string) => boolean;
  expected: string;
  explain: string;
};

const OPEN_KEYS: Record<string, OpenKey> = {
  o1: {
    check: (a) =>
      /^tail (-n ?5|-5|--lines=5) \/etc\/passwd$/.test(a) ||
      /^tail \/etc\/passwd -n ?5$/.test(a),
    expected: "tail -n 5 /etc/passwd",
    explain: "tail faylning oxirini ko‘rsatadi, -n 5 — oxirgi 5 qator.",
  },
  o2: {
    check: (a) => a === "30",
    expected: "30",
    explain: "/27 → 32 manzil, tarmoq va broadcast ayirilsa 30 host.",
  },
  o3: {
    check: (a) => {
      const m = a.match(/^chmod (\S+) (\.\/)?script\.sh$/);
      if (!m) return false;
      if (m[1] === "750" || m[1] === "0750") return true;
      const parts = m[1].split(",").sort();
      return (
        parts.join(",") === "g=rx,o=,u=rwx" ||
        parts.join(",") === "g=rx,o-rwx,u=rwx" ||
        parts.join(",") === "g=xr,o=,u=rwx"
      );
    },
    expected: "chmod 750 script.sh",
    explain: "7 = rwx, 5 = r-x, 0 = ---.",
  },
  o4: {
    check: (a) => {
      const s = unquote(a);
      return (
        (/^grep -c Failed password \/var\/log\/auth\.log$/.test(s) ||
          /^grep Failed password \/var\/log\/auth\.log \| wc -l$/.test(s) ||
          /^cat \/var\/log\/auth\.log \| grep Failed password \| wc -l$/.test(
            s,
          ) ||
          /^cat \/var\/log\/auth\.log \| grep -c Failed password$/.test(s)) &&
        /["']Failed password["']/.test(a)
      );
    },
    expected: 'grep -c "Failed password" /var/log/auth.log',
    explain:
      "grep -c mos qatorlar sonini chiqaradi; | wc -l ham ishlaydi. Ibora probel bilan bo‘lgani uchun qo‘shtirnoq kerak.",
  },
  o5: {
    check: (a) => a.replace(/\/20$/, "") === "172.16.32.0",
    expected: "172.16.32.0",
    explain:
      "/20 da uchinchi oktet 16 lik bloklarga bo‘linadi: 45 → 32–47 oralig‘i.",
  },
  o6: {
    check: (a) => a === "192.168.1.95",
    expected: "192.168.1.95",
    explain: "/27 — 32 lik bloklar: 77 → 64–95 oralig‘i, broadcast .95.",
  },
  o7: {
    check: (a) => a.toLowerCase() === "2001:db8::ff00:42:8329",
    expected: "2001:db8::ff00:42:8329",
    explain:
      "Boshidagi nollar tashlanadi, ketma-ket nol bloklar bir marta :: bilan almashtiriladi.",
  },
  o8: {
    check: (a) => ["/22", "22", "255.255.252.0"].includes(a),
    expected: "/22",
    explain: "/22 → 2^10 = 1024 manzil, 1022 host. /23 da atigi 510 host.",
  },
  o9: {
    check: (a) => {
      const s = a.replace(/^sudo /, "");
      const sockets = s.match(/^(ss|netstat) -([a-z]+)(?: \| grep :?8080)?$/);
      if (sockets) return ["l", "p"].every((f) => sockets[2].includes(f));
      return /^lsof -i ?(tcp)?:8080$/.test(s) || /^fuser 8080\/tcp$/.test(s);
    },
    expected: "sudo ss -tlnp | grep 8080",
    explain:
      "ss (yoki netstat) -l tinglayotgan, -p jarayon nomini ko‘rsatadi; lsof -i :8080 ham to‘g‘ri.",
  },
  o10: {
    check: (a) => {
      if (!/^find \.(\/)? /.test(a)) return false;
      const s = unquote(a);
      return (
        /-i?name \*\.log( |$)/.test(s) &&
        /-mtime \+7( |$)/.test(s) &&
        (/-delete$/.test(s) || /-exec rm (-f )?\{\} (\\;|\+)$/.test(s))
      );
    },
    expected: 'find . -name "*.log" -mtime +7 -delete',
    explain:
      "-mtime +7 — 7 kundan eski; -delete yoki -exec rm {} \\; topilganlarni o‘chiradi.",
  },
};

const round = (n: number) => Math.round(n * 10) / 10;

export function gradeLinuxIp(answers: LipAnswers): LipResult {
  const items: LipItemResult[] = [];
  let test = 0;
  let open = 0;
  for (const c of CHOICES) {
    const key = CHOICE_KEYS[c.id];
    const ok = answers[c.id] === String(key.answer);
    const score = ok ? c.points : 0;
    test += score;
    items.push({
      id: c.id,
      score,
      max: c.points,
      expected: c.options[key.answer],
      explain: key.explain,
    });
  }
  for (const o of OPENS) {
    const key = OPEN_KEYS[o.id];
    const ok = key.check(norm(answers[o.id] ?? ""));
    const score = ok ? o.points : 0;
    open += score;
    items.push({
      id: o.id,
      score,
      max: o.points,
      expected: key.expected,
      explain: key.explain,
    });
  }
  return {
    total: round(test + open),
    max: MAX_TOTAL,
    test: { score: round(test), max: MAX_TEST },
    open: { score: round(open), max: MAX_OPEN },
    items,
  };
}

/** Every question has a key — checked by the tests. */
export const keyIds = () => [
  ...Object.keys(CHOICE_KEYS),
  ...Object.keys(OPEN_KEYS),
];
