// Checkpoint tests for the open labs. Every question set is built from a
// seed, so the server can rebuild exactly what a student saw and grade it
// without trusting the browser. Generated questions reuse the lab's own
// arithmetic; concept questions come from fixed pools.
import {
  classify,
  formatIp,
  prefixToMask,
  sameSubnet,
  subnet,
  type Kind,
  type Text,
} from "../network/ip";
import {
  classifyExercise,
  int,
  maskExercise,
  pick,
  random,
  rangeExercise,
  shuffle,
  subnetExercise,
  type Random,
} from "../network/practice";
import { LESSONS as LINUX_LESSONS } from "../linux/curriculum";
import { checkpointMeta, type CheckpointMeta } from "./meta";
import {
  HTML_POOL,
  HTTP_POOL,
  INPUT_POOL,
  BROWSER_POOL,
  ACCESS_POOL,
  API_POOL,
  CLASSIC_POOL,
  SYMMETRIC_POOL,
  HASHES_POOL,
  PUBKEY_POOL,
  TLS_POOL,
  TCPIP_POOL,
  TRAFFIC_POOL,
  FIREWALL_POOL,
  CONNECTIONS_POOL,
  IDS_POOL,
  EVIDENCE_POOL,
  FILESYSTEM_POOL,
  LOGS_POOL,
  RESPONSE_POOL,
  REPORT_POOL,
  STEGO_POOL,
  LSB_POOL,
  METADATA_POOL,
  FORMATS_POOL,
  STEGANALYSIS_POOL,
  SIEM_POOL,
  DETECTION_POOL,
  TRIAGE_POOL,
  HUNTING_POOL,
  PHISHING_POOL,
  ETHICS_POOL,
  SEARCH_POOL,
  INFRA_POOL,
  GEO_POOL,
  FOOTPRINT_POOL,
  STRIDE_POOL,
  SECURECODE_POOL,
  SUPPLYCHAIN_POOL,
  SECURITY_EXTRA,
  type PoolItem,
} from "./pools";
import {
  BASH_POOL,
  CRYPTO_POOL,
  HTTP_BASICS_POOL,
  HTTPS_POOL,
  SSH_POOL,
} from "./foundation-pools";
import { QUIZ as SECURITY_QUIZ } from "../../components/playground/security-lab/lessons.data";
import { createTranslator } from "../i18n";

export type Question = {
  ask: Text;
  // Monospace text shown under the question (an address, output, a command).
  code?: string;
  options: Text[];
  answer: number;
  explain: Text;
};

export type Checkpoint = CheckpointMeta & {
  build: (r: Random) => Question[];
};

const same = (text: string): Text => ({ uz: text, en: text });

// Puts the right option among the wrong ones in a seeded order. Duplicate
// wrong options (generators can collide) are dropped.
function choice(
  r: Random,
  ask: Text,
  right: Text,
  wrong: Text[],
  explain: Text,
  code?: string,
): Question {
  const seen = new Set([right.en]);
  const others = wrong.filter((w) => !seen.has(w.en) && seen.add(w.en));
  const options = shuffle(r, [right, ...others.slice(0, 3)]);
  return {
    ask,
    ...(code ? { code } : {}),
    options,
    answer: options.indexOf(right),
    explain,
  };
}

const bin = (n: number) => n.toString(2).padStart(8, "0");
const mask = (prefix: number) => formatIp(prefixToMask(prefix));

// --- IP addressing, lessons 1–6 --------------------------------------------

function octetToBinary(r: Random) {
  const n = int(r, 17, 254);
  const flip = (bit: number) => n ^ (1 << bit);
  return choice(
    r,
    {
      uz: `${n} soni ikkilik ko‘rinishda qanday yoziladi?`,
      en: `How is ${n} written in binary?`,
    },
    same(bin(n)),
    [flip(int(r, 0, 2)), flip(int(r, 3, 5)), flip(int(r, 6, 7))].map((v) =>
      same(bin(v)),
    ),
    {
      uz: "Bitlar og‘irligi 128, 64, 32, 16, 8, 4, 2, 1. Eng kattasidan boshlab ayirib boring.",
      en: "The bit weights are 128, 64, 32, 16, 8, 4, 2, 1. Subtract from the largest down.",
    },
  );
}

function binaryToAddress(r: Random) {
  const parts = [
    int(r, 10, 223),
    int(r, 0, 255),
    int(r, 0, 255),
    int(r, 1, 254),
  ];
  const address = parts.join(".");
  const off = (i: number, delta: number) =>
    parts.map((p, j) => (j === i ? (p + delta + 256) % 256 : p)).join(".");
  return choice(
    r,
    { uz: "Bu qaysi IP manzil?", en: "Which IP address is this?" },
    same(address),
    [off(0, 1), off(1, 16), off(3, 2), off(2, -4)].map(same),
    {
      uz: "Har bir 8 bitni alohida o‘nlik songa aylantiring.",
      en: "Convert each group of 8 bits to a decimal number on its own.",
    },
    parts.map(bin).join("."),
  );
}

function prefixToDotted(r: Random) {
  const prefix = int(r, 17, 30);
  return choice(
    r,
    {
      uz: `/${prefix} prefiksli mask o‘nlik ko‘rinishda qanday yoziladi?`,
      en: `What is the /${prefix} mask in dotted decimal?`,
    },
    same(mask(prefix)),
    [prefix - 1, prefix + 1, prefix - 8 > 8 ? prefix - 8 : prefix + 2].map(
      (p) => same(mask(p)),
    ),
    {
      uz: `/${prefix} — chapdan ${prefix} ta bir. To‘liq oktetlar 255, qolgan birlar og‘irliklar yig‘indisi.`,
      en: `/${prefix} means ${prefix} ones from the left. Full octets are 255; the rest add up the bit weights.`,
    },
  );
}

function hostCount(r: Random) {
  const prefix = int(r, 22, 30);
  const bits = 32 - prefix;
  return choice(
    r,
    {
      uz: `/${prefix} tarmoqda qurilmalarga nechta manzil berish mumkin?`,
      en: `How many addresses can be given to devices in a /${prefix} network?`,
    },
    same(String(2 ** bits - 2)),
    [2 ** bits, 2 ** (bits - 1) - 2, 2 ** (bits + 1) - 2].map((n) =>
      same(String(n)),
    ),
    {
      uz: `Host bitlari 32 − ${prefix} = ${bits}. 2^${bits} − 2: tarmoq manzili va broadcast band.`,
      en: `Host bits: 32 − ${prefix} = ${bits}. 2^${bits} − 2: the network and broadcast addresses are taken.`,
    },
  );
}

function smallestMask(r: Random) {
  let task = maskExercise(r);
  while (task.prefix < 23) task = maskExercise(r);
  const { hosts, prefix } = task;
  const label = (p: number) => same(`/${p} (${2 ** (32 - p) - 2})`);
  return choice(
    r,
    {
      uz: `Xonada ${hosts} ta qurilma bor. Hammasi sig‘adigan ENG KICHIK tarmoq qaysi?`,
      en: `A room has ${hosts} devices. What is the SMALLEST network that fits them all?`,
    },
    label(prefix),
    [prefix - 1, prefix + 1, prefix + 2].filter((p) => p <= 30).map(label),
    {
      uz: "Qavs ichida — qurilmalar uchun joy. Yetarli bo‘lganlarning eng kichigini tanlang.",
      en: "The number in brackets is room for devices. Pick the smallest one that is enough.",
    },
  );
}

function networkAddress(r: Random) {
  const task = rangeExercise(r);
  const [address, p] = task.cidr.split("/");
  const prefix = Number(p);
  const s = subnet(
    address.split(".").reduce((a, o) => a * 256 + Number(o), 0),
    prefix,
  );
  const size = s.size;
  return choice(
    r,
    {
      uz: `${task.cidr} qaysi tarmoqqa tegishli (tarmoq manzili)?`,
      en: `Which network does ${task.cidr} belong to (network address)?`,
    },
    same(task.network),
    [s.network + size, s.network - size, s.network + 1, s.ip]
      .filter((n) => n >= 0 && n < 2 ** 32)
      .map((n) => same(formatIp(n))),
    {
      uz: `Blok hajmi 2^(32 − ${prefix}) = ${size}. Manzil turgan blokning boshi — tarmoq manzili.`,
      en: `Block size is 2^(32 − ${prefix}) = ${size}. The start of the address's block is the network address.`,
    },
  );
}

function broadcastAddress(r: Random) {
  const task = rangeExercise(r);
  const prefix = Number(task.cidr.split("/")[1]);
  const size = 2 ** (32 - prefix);
  const b = task.broadcast.split(".").reduce((a, o) => a * 256 + Number(o), 0);
  return choice(
    r,
    {
      uz: `${task.cidr} tarmog‘ining broadcast manzili qaysi?`,
      en: `What is the broadcast address of ${task.cidr}?`,
    },
    same(task.broadcast),
    [b - 1, b + 1, b - size + 1, b + size]
      .filter((n) => n >= 0 && n < 2 ** 32)
      .map((n) => same(formatIp(n))),
    {
      uz: "Broadcast — blokning oxirgi manzili: tarmoq manzili + blok hajmi − 1.",
      en: "The broadcast is the block's last address: network + block size − 1.",
    },
  );
}

function neighbour(r: Random) {
  const prefix = int(r, 25, 29);
  const s = subnet(
    ((10 * 256 + int(r, 0, 255)) * 256 + int(r, 0, 255)) * 256 + int(r, 0, 255),
    prefix,
  );
  const pc = int(r, s.firstHost, s.lastHost);
  let mate = int(r, s.firstHost, s.lastHost);
  while (mate === pc && s.lastHost > s.firstHost)
    mate = int(r, s.firstHost, s.lastHost);
  const outside = [
    s.network - int(r, 1, 6),
    s.broadcast + int(r, 1, 6),
    s.broadcast + s.size + int(r, 1, 6),
    s.network - s.size - int(r, 1, 6),
  ].filter((n) => !sameSubnet(n, pc, prefix));
  return choice(
    r,
    {
      uz: `Kompyuter ${formatIp(pc)}/${prefix}. Qaysi qurilma u bilan BIR TARMOQDA?`,
      en: `A computer is ${formatIp(pc)}/${prefix}. Which device is on the SAME network?`,
    },
    same(formatIp(mate)),
    shuffle(r, outside).map((n) => same(formatIp(n))),
    {
      uz: `Blok hajmi ${s.size}: kompyuter ${formatIp(s.network)} — ${formatIp(s.broadcast)} blokida. Shu blokdagi manzil — qo‘shni.`,
      en: `Block size ${s.size}: the computer is in ${formatIp(s.network)} – ${formatIp(s.broadcast)}. An address in that block is a neighbour.`,
    },
  );
}

function validGateway(r: Random) {
  const third = int(r, 0, 254);
  const pc = `192.168.${third}.${int(r, 2, 200)}`;
  const gateway = `192.168.${third}.${pick(r, [1, 254])}`;
  return choice(
    r,
    {
      uz: `Kompyuter ${pc}/24. Qaysi manzil default gateway bo‘la OLADI?`,
      en: `A computer is ${pc}/24. Which address CAN be its default gateway?`,
    },
    same(gateway),
    [
      same(`192.168.${third + 1}.1`),
      same(`192.168.${third}.255`),
      same(`10.0.${third}.1`),
    ],
    {
      uz: "Gateway kompyuter bilan bir tarmoqda bo‘lishi va oddiy host manzili bo‘lishi kerak (.255 — broadcast).",
      en: "The gateway must be on the computer's network and be an ordinary host address (.255 is the broadcast).",
    },
  );
}

const GATEWAY_CONCEPTS: ((r: Random) => Question)[] = [
  (r) =>
    choice(
      r,
      {
        uz: "Printerga ping o‘tadi, lekin 8.8.8.8 ga o‘tmaydi. Eng ehtimolli sabab?",
        en: "Pinging the printer works but 8.8.8.8 does not. The most likely cause?",
      },
      {
        uz: "Default gateway yozilmagan yoki noto‘g‘ri",
        en: "The default gateway is missing or wrong",
      },
      [
        { uz: "DNS server ishlamayapti", en: "The DNS server is down" },
        { uz: "Kabel uzilgan", en: "The cable is unplugged" },
        {
          uz: "Printer internetni band qilgan",
          en: "The printer is hogging the internet",
        },
      ],
      {
        uz: "Ichkarida hammasi ishlaydi — faqat tashqariga chiqish yo‘q. Bu gateway’ning ishi. DNS aloqasiz: raqamni ping qildik.",
        en: "Everything inside works, only the way out fails — that is the gateway's job. DNS is irrelevant: we pinged a number.",
      },
    ),
  (r) =>
    choice(
      r,
      {
        uz: "Ikki qurilmaga bir xil IP berilsa nima bo‘ladi?",
        en: "What happens when two devices get the same IP?",
      },
      {
        uz: "Ikkalasining ham aloqasi buziladi",
        en: "Both of them lose a reliable connection",
      },
      [
        {
          uz: "Yuklama ikkiga bo‘linadi",
          en: "The load is shared between them",
        },
        {
          uz: "Faqat ikkinchisi ishlamaydi",
          en: "Only the second one stops working",
        },
        {
          uz: "Router biriga yangi manzil beradi",
          en: "The router gives one a new address",
        },
      ],
      {
        uz: "Javoblar goh biriga, goh boshqasiga ketadi. Qo‘lda sozlanganda router hech narsani o‘zgartirmaydi.",
        en: "Replies go to one or the other. With manual settings the router changes nothing.",
      },
    ),
  (r) =>
    choice(
      r,
      {
        uz: "Kompyuter 8.8.8.8 ga paket yuboryapti. Kadrda qabul qiluvchi MAC va IP qanday?",
        en: "A computer sends a packet to 8.8.8.8. What are the destination MAC and IP in the frame?",
      },
      {
        uz: "MAC — routerniki, IP — 8.8.8.8",
        en: "MAC: the router's, IP: 8.8.8.8",
      },
      [
        {
          uz: "MAC — 8.8.8.8 serveriniki, IP — 8.8.8.8",
          en: "MAC: the 8.8.8.8 server's, IP: 8.8.8.8",
        },
        {
          uz: "MAC — routerniki, IP — routerniki",
          en: "MAC: the router's, IP: the router's",
        },
        {
          uz: "MAC — broadcast, IP — 8.8.8.8",
          en: "MAC: broadcast, IP: 8.8.8.8",
        },
      ],
      {
        uz: "MAC faqat keyingi sakrashgacha ishlaydi, IP esa oxirgi manzil bo‘lib qoladi.",
        en: "A MAC only reaches the next hop; the IP stays the final destination.",
      },
    ),
  (r) =>
    choice(
      r,
      {
        uz: "ARP so‘rovi nima uchun kerak?",
        en: "What is an ARP request for?",
      },
      {
        uz: "Shu tarmoqdagi IP’ning MAC manzilini bilish",
        en: "Finding the MAC address of an IP on this network",
      },
      [
        { uz: "Nomni IP’ga aylantirish", en: "Turning a name into an IP" },
        { uz: "Avtomatik IP olish", en: "Getting an IP automatically" },
        { uz: "Paket yo‘lini ko‘rish", en: "Seeing a packet's route" },
      ],
      {
        uz: "Nom → IP — DNS, avtomatik IP — DHCP, yo‘l — traceroute.",
        en: "Name → IP is DNS, automatic IPs are DHCP, the route is traceroute.",
      },
    ),
];

// --- IP addressing, lessons 7–12 -------------------------------------------

const KIND_TEXT: Record<Kind, Text> = {
  private: { uz: "Xususiy (private)", en: "Private" },
  public: { uz: "Ommaviy (public)", en: "Public" },
  loopback: { uz: "Loopback", en: "Loopback" },
  "link-local": { uz: "APIPA (link-local)", en: "APIPA (link-local)" },
  special: { uz: "Maxsus", en: "Special" },
};

function addressKind(r: Random) {
  const address = pick(r, classifyExercise(r));
  const value = address.split(".").reduce((a, o) => a * 256 + Number(o), 0);
  const kind = classify(value);
  return choice(
    r,
    {
      uz: "Bu manzil qaysi turga kiradi?",
      en: "What kind of address is this?",
    },
    KIND_TEXT[kind],
    (["private", "public", "loopback", "link-local"] as Kind[])
      .filter((k) => k !== kind)
      .map((k) => KIND_TEXT[k]),
    {
      uz: "Xususiy: 10.x, 172.16–31.x, 192.168.x. Loopback: 127.x. APIPA: 169.254.x. Qolganlari — ommaviy.",
      en: "Private: 10.x, 172.16–31.x, 192.168.x. Loopback: 127.x. APIPA: 169.254.x. The rest are public.",
    },
    address,
  );
}

function subnetting(r: Random) {
  const task = subnetExercise(r);
  const size = 2 ** (32 - task.prefix);
  const base = task.base.split(".").reduce((a, o) => a * 256 + Number(o), 0);
  const answer = base + (task.ask - 1) * size;
  return choice(
    r,
    {
      uz: `${task.base}/24 tarmog‘i ${task.departments} ta bo‘limga teng /${task.prefix} bo‘laklarga bo‘lindi. ${task.ask}-bo‘lim tarmog‘ining manzili qaysi?`,
      en: `${task.base}/24 is split into equal /${task.prefix} subnets for ${task.departments} departments. What is department ${task.ask}'s network address?`,
    },
    same(task.answer),
    [answer + size, answer - size, answer + 1, base + task.ask * 16]
      .filter((n) => n >= base)
      .map((n) => same(formatIp(n))),
    {
      uz: `Har bo‘lak ${size} talik. ${task.ask}-bo‘lim: ${task.base} + (${task.ask} − 1) × ${size}.`,
      en: `Each subnet holds ${size}. Department ${task.ask}: ${task.base} + (${task.ask} − 1) × ${size}.`,
    },
  );
}

const ORIGIN_CONCEPTS: ((r: Random) => Question)[] = [
  (r) =>
    choice(
      r,
      {
        uz: "ipconfig natijasida IP 169.254.37.12 chiqdi. Bu nimani bildiradi?",
        en: "ipconfig shows the IP 169.254.37.12. What does it mean?",
      },
      {
        uz: "DHCP serverdan manzil olinmagan",
        en: "No address came from a DHCP server",
      },
      [
        { uz: "Internet juda tez ishlayapti", en: "The internet is very fast" },
        {
          uz: "Bu provayder bergan ommaviy manzil",
          en: "It is a public address from the ISP",
        },
        { uz: "Kompyuterda IP to‘qnashuvi bor", en: "There is an IP conflict" },
      ],
      {
        uz: "169.254.x.x (APIPA) — DHCP javob bermaganda kompyuter o‘ziga o‘zi beradigan manzil.",
        en: "169.254.x.x (APIPA) is what a computer picks for itself when DHCP does not answer.",
      },
    ),
  (r) =>
    choice(
      r,
      {
        uz: "DHCP xabarlarining to‘g‘ri tartibi qaysi?",
        en: "What is the right order of DHCP messages?",
      },
      same("DISCOVER → OFFER → REQUEST → ACK"),
      [
        same("REQUEST → OFFER → DISCOVER → ACK"),
        same("OFFER → DISCOVER → ACK → REQUEST"),
        same("DISCOVER → REQUEST → ACK → OFFER"),
      ],
      {
        uz: "DORA: mijoz qidiradi, server taklif qiladi, mijoz so‘raydi, server tasdiqlaydi.",
        en: "DORA: the client looks, a server offers, the client requests, the server acknowledges.",
      },
    ),
  (r) =>
    choice(
      r,
      { uz: "DNS nima qiladi?", en: "What does DNS do?" },
      {
        uz: "Domen nomini IP manzilga aylantiradi",
        en: "Turns a domain name into an IP address",
      },
      [
        { uz: "Qurilmalarga IP beradi", en: "Gives devices IP addresses" },
        {
          uz: "Xususiy manzilni ommaviyga almashtiradi",
          en: "Swaps private addresses for a public one",
        },
        { uz: "Paketlarni shifrlaydi", en: "Encrypts packets" },
      ],
      {
        uz: "IP berish — DHCP, manzil almashtirish — NAT, shifrlash — TLS.",
        en: "Giving IPs is DHCP, swapping addresses is NAT, encryption is TLS.",
      },
    ),
  (r) =>
    choice(
      r,
      {
        uz: "Uydagi 5 ta qurilma internetga bitta ommaviy IP orqali chiqadi. Buni nima ta’minlaydi?",
        en: "Five home devices reach the internet through one public IP. What makes that work?",
      },
      same("NAT"),
      [same("DNS"), same("ARP"), same("DHCP")],
      {
        uz: "Router NAT jadvalida qaysi ulanish qaysi qurilmaniki ekanini eslab qoladi.",
        en: "The router's NAT table remembers which connection belongs to which device.",
      },
    ),
  (r) =>
    choice(
      r,
      {
        uz: "DNS javobi keshda saqlanadi. Bundan foyda nima?",
        en: "A DNS answer is cached. What is the benefit?",
      },
      {
        uz: "Keyingi so‘rovga tezroq javob beriladi (TTL tugaguncha)",
        en: "The next lookup is answered faster (until the TTL runs out)",
      },
      [
        { uz: "Sayt xavfsizroq bo‘ladi", en: "The site becomes safer" },
        {
          uz: "Manzil hech qachon o‘zgarmaydi",
          en: "The address never changes",
        },
        {
          uz: "Internetsiz ham sayt ochiladi",
          en: "The site opens without internet",
        },
      ],
      {
        uz: "Kesh TTL davomida ishlaydi; keyin javob qaytadan so‘raladi.",
        en: "The cache lasts for the TTL; after that the answer is looked up again.",
      },
    ),
];

// --- Linux ------------------------------------------------------------------

function linuxQuestions(r: Random) {
  return shuffle(
    r,
    LINUX_LESSONS.map((lesson) => lesson.quiz),
  )
    .slice(0, 10)
    .map((quiz) => {
      const right = quiz.choices[quiz.answer];
      return choice(
        r,
        quiz.question,
        right,
        quiz.choices.filter((_, i) => i !== quiz.answer),
        quiz.explanation,
      );
    });
}

// --- HTML Basics and Web Security -------------------------------------------

const fromPool = (r: Random, item: PoolItem) =>
  choice(r, item.ask, item.right, item.wrong, item.explain, item.code);

// Ten questions from a pool, for the animated Academy labs.
const tenFrom = (r: Random, pool: PoolItem[]) =>
  shuffle(r, pool)
    .slice(0, 10)
    .map((item) => fromPool(r, item));

// The Web Security Lab's final quiz is written in English with Uzbek in the
// shared dictionary; both languages come from there.
const uz = createTranslator("uz");
const both = (text: string): Text => ({ uz: uz(text), en: text });
const SECURITY_POOL: PoolItem[] = [
  ...SECURITY_QUIZ.map((q) => ({
    ask: both(q.q),
    right: both(q.a[q.correct]),
    wrong: q.a.filter((_, i) => i !== q.correct).map(both),
    explain: both(q.why),
  })),
  ...SECURITY_EXTRA,
];

const BUILDERS: Record<string, (r: Random) => Question[]> = {
  "network-1": (r) => [
    octetToBinary(r),
    binaryToAddress(r),
    prefixToDotted(r),
    hostCount(r),
    smallestMask(r),
    networkAddress(r),
    broadcastAddress(r),
    neighbour(r),
    validGateway(r),
    ...shuffle(r, GATEWAY_CONCEPTS)
      .slice(0, 3)
      .map((make) => make(r)),
  ],
  "network-2": (r) => [
    addressKind(r),
    addressKind(r),
    subnetting(r),
    subnetting(r),
    ...shuffle(r, ORIGIN_CONCEPTS).map((make) => make(r)),
    validGateway(r),
  ],
  "linux-1": linuxQuestions,
  "html-1": (r) =>
    shuffle(r, HTML_POOL)
      .slice(0, 10)
      .map((item) => fromPool(r, item)),
  "security-1": (r) =>
    shuffle(r, SECURITY_POOL)
      .slice(0, 12)
      .map((item) => fromPool(r, item)),
  "httpbasics-1": (r) => tenFrom(r, HTTP_BASICS_POOL),
  "https-1": (r) => tenFrom(r, HTTPS_POOL),
  "bash-1": (r) => tenFrom(r, BASH_POOL),
  "ssh-1": (r) => tenFrom(r, SSH_POOL),
  "crypto-1": (r) => tenFrom(r, CRYPTO_POOL),
  "http-1": (r) =>
    shuffle(r, HTTP_POOL)
      .slice(0, 12)
      .map((item) => fromPool(r, item)),
  "input-1": (r) =>
    shuffle(r, INPUT_POOL)
      .slice(0, 10)
      .map((item) => fromPool(r, item)),
  "browser-1": (r) =>
    shuffle(r, BROWSER_POOL)
      .slice(0, 10)
      .map((item) => fromPool(r, item)),
  "access-1": (r) =>
    shuffle(r, ACCESS_POOL)
      .slice(0, 10)
      .map((item) => fromPool(r, item)),
  "api-1": (r) =>
    shuffle(r, API_POOL)
      .slice(0, 10)
      .map((item) => fromPool(r, item)),
  "classic-1": (r) =>
    shuffle(r, CLASSIC_POOL)
      .slice(0, 10)
      .map((item) => fromPool(r, item)),
  "symmetric-1": (r) =>
    shuffle(r, SYMMETRIC_POOL)
      .slice(0, 10)
      .map((item) => fromPool(r, item)),
  "hashes-1": (r) =>
    shuffle(r, HASHES_POOL)
      .slice(0, 10)
      .map((item) => fromPool(r, item)),
  "pubkey-1": (r) =>
    shuffle(r, PUBKEY_POOL)
      .slice(0, 10)
      .map((item) => fromPool(r, item)),
  "tls-1": (r) =>
    shuffle(r, TLS_POOL)
      .slice(0, 10)
      .map((item) => fromPool(r, item)),
  "tcpip-1": (r) =>
    shuffle(r, TCPIP_POOL)
      .slice(0, 10)
      .map((item) => fromPool(r, item)),
  "traffic-1": (r) =>
    shuffle(r, TRAFFIC_POOL)
      .slice(0, 10)
      .map((item) => fromPool(r, item)),
  "firewall-1": (r) =>
    shuffle(r, FIREWALL_POOL)
      .slice(0, 10)
      .map((item) => fromPool(r, item)),
  "connections-1": (r) =>
    shuffle(r, CONNECTIONS_POOL)
      .slice(0, 10)
      .map((item) => fromPool(r, item)),
  "ids-1": (r) =>
    shuffle(r, IDS_POOL)
      .slice(0, 10)
      .map((item) => fromPool(r, item)),
  "evidence-1": (r) =>
    shuffle(r, EVIDENCE_POOL)
      .slice(0, 10)
      .map((item) => fromPool(r, item)),
  "filesystem-1": (r) =>
    shuffle(r, FILESYSTEM_POOL)
      .slice(0, 10)
      .map((item) => fromPool(r, item)),
  "logs-1": (r) =>
    shuffle(r, LOGS_POOL)
      .slice(0, 10)
      .map((item) => fromPool(r, item)),
  "response-1": (r) =>
    shuffle(r, RESPONSE_POOL)
      .slice(0, 10)
      .map((item) => fromPool(r, item)),
  "report-1": (r) =>
    shuffle(r, REPORT_POOL)
      .slice(0, 10)
      .map((item) => fromPool(r, item)),
  "stego-1": (r) =>
    shuffle(r, STEGO_POOL)
      .slice(0, 10)
      .map((item) => fromPool(r, item)),
  "lsb-1": (r) =>
    shuffle(r, LSB_POOL)
      .slice(0, 10)
      .map((item) => fromPool(r, item)),
  "metadata-1": (r) =>
    shuffle(r, METADATA_POOL)
      .slice(0, 10)
      .map((item) => fromPool(r, item)),
  "formats-1": (r) =>
    shuffle(r, FORMATS_POOL)
      .slice(0, 10)
      .map((item) => fromPool(r, item)),
  "steganalysis-1": (r) =>
    shuffle(r, STEGANALYSIS_POOL)
      .slice(0, 10)
      .map((item) => fromPool(r, item)),
  "siem-1": (r) =>
    shuffle(r, SIEM_POOL)
      .slice(0, 10)
      .map((item) => fromPool(r, item)),
  "detection-1": (r) =>
    shuffle(r, DETECTION_POOL)
      .slice(0, 10)
      .map((item) => fromPool(r, item)),
  "triage-1": (r) =>
    shuffle(r, TRIAGE_POOL)
      .slice(0, 10)
      .map((item) => fromPool(r, item)),
  "hunting-1": (r) =>
    shuffle(r, HUNTING_POOL)
      .slice(0, 10)
      .map((item) => fromPool(r, item)),
  "phishing-1": (r) =>
    shuffle(r, PHISHING_POOL)
      .slice(0, 10)
      .map((item) => fromPool(r, item)),
  "ethics-1": (r) =>
    shuffle(r, ETHICS_POOL)
      .slice(0, 10)
      .map((item) => fromPool(r, item)),
  "search-1": (r) =>
    shuffle(r, SEARCH_POOL)
      .slice(0, 10)
      .map((item) => fromPool(r, item)),
  "infra-1": (r) =>
    shuffle(r, INFRA_POOL)
      .slice(0, 10)
      .map((item) => fromPool(r, item)),
  "geo-1": (r) =>
    shuffle(r, GEO_POOL)
      .slice(0, 10)
      .map((item) => fromPool(r, item)),
  "footprint-1": (r) =>
    shuffle(r, FOOTPRINT_POOL)
      .slice(0, 10)
      .map((item) => fromPool(r, item)),
  "stride-1": (r) =>
    shuffle(r, STRIDE_POOL)
      .slice(0, 10)
      .map((item) => fromPool(r, item)),
  "securecode-1": (r) =>
    shuffle(r, SECURECODE_POOL)
      .slice(0, 10)
      .map((item) => fromPool(r, item)),
  "supplychain-1": (r) =>
    shuffle(r, SUPPLYCHAIN_POOL)
      .slice(0, 10)
      .map((item) => fromPool(r, item)),
};

export const CHECKPOINTS: readonly Checkpoint[] = Object.keys(BUILDERS).map(
  (id) => ({ ...checkpointMeta(id)!, build: BUILDERS[id] }),
);

export const checkpointById = (id: string) =>
  CHECKPOINTS.find((c) => c.id === id) ?? null;

export const questionsFor = (checkpoint: Checkpoint, seed: number) =>
  checkpoint.build(random(seed));

/** Grades answers against the questions rebuilt from the same seed. */
export function grade(questions: Question[], answers: unknown) {
  const picked = Array.isArray(answers) ? answers : [];
  const correct = questions.map((q, i) => picked[i] === q.answer);
  const score = correct.filter(Boolean).length;
  return {
    score,
    total: questions.length,
    percent: Math.round((score / questions.length) * 100),
    correct,
  };
}
