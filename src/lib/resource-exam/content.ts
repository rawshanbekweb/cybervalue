// Public exam content. Answer keys live in grading.ts and must never be imported here.
export type ExamGroup = "web" | "linux";

export const EXAM_PATH = "/resources/exam";
export const EXAM_MINUTES = 60;
export const CHOICE_POINTS = 2;

export const GROUP_LABELS: Record<ExamGroup, string> = {
  web: "Web qanday ishlaydi? (1–75 slayd)",
  linux: "Linux va Tarmoq Asoslari (1–20 slayd)",
};

export type ExamChoice = {
  id: string;
  group: ExamGroup;
  slide: string;
  prompt: string;
  options: string[];
};

export type ExamInput = {
  id: string;
  label: string;
  kind: "text" | "select" | "command" | "request";
  options?: string[];
  placeholder?: string;
  points: number;
};

export type ExamTask = {
  id: string;
  group: ExamGroup;
  slide: string;
  title: string;
  brief: string;
  scene?: string;
  inputs: ExamInput[];
};

export const CHOICES: ExamChoice[] = [
  {
    id: "w1",
    group: "web",
    slide: "02.2",
    prompt:
      "Browser web application bilan, application esa database bilan gaplashmoqda. Application qaysi rollarda?",
    options: [
      "Ikkala aloqada ham server",
      "Browser uchun server, database uchun client",
      "Browser uchun client, database uchun server",
      "Ikkala aloqada ham client",
    ],
  },
  {
    id: "w2",
    group: "web",
    slide: "03.1",
    prompt:
      "Faqat bitta sayt ochilmayapti, boshqa saytlar ochilmoqda. Qaysi xulosa to‘g‘ri?",
    options: [
      "Internet butunlay uzilgan",
      "Barcha web xizmatlar ishdan chiqqan",
      "Boshqa saytlarga web aloqa bor; muammo shu saytning serveri yoki nomini topish bilan bog‘liq bo‘lishi mumkin",
      "Kompyuterning Wi‑Fi moduli albatta buzilgan",
    ],
  },
  {
    id: "w3",
    group: "web",
    slide: "05.1–05.2",
    prompt: "DHCP qurilmaga nima beradi?",
    options: [
      "Domen nomining IP manzilini topib beradi",
      "IP, gateway va DNS resolver kabi sozlamalarni avtomatik beradi",
      "Saytga HTTPS sertifikat beradi",
      "Paketlarni shifrlaydi",
    ],
  },
  {
    id: "w4",
    group: "web",
    slide: "06.1",
    prompt: "192.168.1.300 nima uchun to‘g‘ri IPv4 manzil emas?",
    options: [
      "IPv4 manzilda 192 dan keyin 168 kelmaydi",
      "IPv4 manzil nuqtalarsiz yoziladi",
      "Har bir qism 8 bit, ya’ni 0–255 oralig‘ida bo‘lishi kerak; 300 undan katta",
      "Oxirgi qism doim 1 bo‘lishi kerak",
    ],
  },
  {
    id: "w5",
    group: "web",
    slide: "07 / 07.2",
    prompt: "NAT va firewall o‘rtasidagi farq qaysi javobda to‘g‘ri?",
    options: [
      "NAT firewallning boshqa nomi",
      "NAT bo‘lsa, firewall kerak emas",
      "NAT manzilni translyatsiya qiladi; trafikka ruxsatni firewall qoidalari boshqaradi",
      "NAT private IPni DNS yozuviga aylantiradi",
    ],
  },
  {
    id: "w6",
    group: "web",
    slide: "09.2",
    prompt:
      "Resolver A yozuvini TTL = 300 soniya bilan oldi. 120 soniyadan keyin odatda nima deyish to‘g‘ri?",
    options: [
      "TTL har foydalanishda qaytadan 300 soniyadan boshlanadi",
      "Yozuv cache’dan o‘chib ketgan",
      "TTL cache’ga emas, faqat serverga tegishli",
      "Yozuv taxminan 180 soniya yaroqli",
    ],
  },
  {
    id: "w7",
    group: "web",
    slide: "10 / 10.1",
    prompt: "CNAME yozuvining qiymati nima bo‘ladi?",
    options: [
      "IPv4 manzil",
      "Boshqa domen nomi",
      "Email serverining porti",
      "MAC manzil",
    ],
  },
  {
    id: "w8",
    group: "web",
    slide: "15 / 15.2 / 15.3",
    prompt: "TCP va UDP haqida qaysi gap to‘g‘ri?",
    options: [
      "UDP har doim TCPdan yaxshiroq",
      "Web hech qachon UDPdan foydalanmaydi",
      "DNS faqat UDP ishlatadi, TCPdan foydalana olmaydi",
      "UDP o‘zi yetkazish va tartib kafolatini bermaydi; HTTP/3 esa QUIC orqali UDP ustida ishlaydi",
    ],
  },
  {
    id: "w9",
    group: "web",
    slide: "21.2",
    prompt:
      "Set-Cookie: sid=demo123; Secure; HttpOnly; SameSite=Lax. HttpOnly nimani cheklaydi?",
    options: [
      "Cookieni serverga yuborishni",
      "JavaScriptning document.cookie orqali cookieni o‘qishini",
      "Cookie faqat HTTP (HTTPS emas) orqali ketishini",
      "Cookie muddatini",
    ],
  },
  {
    id: "w10",
    group: "web",
    slide: "25.1–25.2",
    prompt:
      "User 42 tizimga kirdi va GET /profile/43 yubordi. Server nima qilishi kerak?",
    options: [
      "Login bo‘lgani uchun ruxsat beradi",
      "Frontend tugmani yashirgan bo‘lsa, tekshirmaydi",
      "HTTPS ishlatilgani uchun ruxsat tekshiruvini o‘tkazib yuboradi",
      "Autentifikatsiyadan tashqari, 43-profilga ruxsatni alohida tekshiradi",
    ],
  },
  {
    id: "l1",
    group: "linux",
    slide: "01.2",
    prompt: "Shell qanday vazifani bajaradi?",
    options: [
      "Apparat resurslarini bevosita boshqaradi",
      "Buyruqni tahlil qilib, yadro tushunadigan ko‘rinishga o‘tkazuvchi vositachi",
      "Fayllarni diskda saqlaydi",
      "Faqat tarmoq ulanishini ta’minlaydi",
    ],
  },
  {
    id: "l2",
    group: "linux",
    slide: "01.1 / 04.3",
    prompt: "Linuxda «hamma narsa fayl» qoidasi nimani anglatadi?",
    options: [
      "Faqat matn fayllari mavjud bo‘ladi",
      "Qurilmalar va jarayon ma’lumotlari ham fayl ko‘rinishida beriladi (masalan /dev/sda, /proc)",
      "Katalog tushunchasi yo‘q",
      "Barcha fayllar bitta papkada saqlanadi",
    ],
  },
  {
    id: "l3",
    group: "linux",
    slide: "03.1",
    prompt:
      "O‘rganishni boshlash uchun nima sababdan Kali emas, Ubuntu tavsiya etiladi?",
    options: [
      "Kali Linux yadrosiga asoslanmagan",
      "Kalida terminal yo‘q",
      "Kali xavfsizlik sinovlari uchun mo‘ljallangan, kundalik ish va o‘rganishga optimallashtirilmagan",
      "Ubuntuda yadro yo‘q",
    ],
  },
  {
    id: "l4",
    group: "linux",
    slide: "03 / 03.1",
    prompt: "Qaysi distro — paket menejeri juftligi to‘g‘ri?",
    options: [
      "Ubuntu — dnf, Rocky — apt",
      "Alpine — apk, Rocky/RHEL — dnf",
      "Kali — apk, Alpine — apt",
      "Debian — dnf, Ubuntu — apk",
    ],
  },
  {
    id: "l5",
    group: "linux",
    slide: "04.1",
    prompt:
      "Dastur xato ishlay boshladi. Sababini topish uchun birinchi navbatda qaysi katalogga qaraysiz?",
    options: ["/etc/ssh", "/var/log", "/dev", "/proc/meminfo"],
  },
  {
    id: "l6",
    group: "linux",
    slide: "04.2",
    prompt: "root foydalanuvchisining uy papkasi qayerda?",
    options: ["/home/root", "/etc/root", "/root", "~/root"],
  },
  {
    id: "l7",
    group: "linux",
    slide: "04.3",
    prompt: "/proc ichidagi fayllar haqida qaysi gap to‘g‘ri?",
    options: [
      "Oddiy fayllar; ularni nano bilan tahrirlab tizimni sozlaymiz",
      "Faqat foydalanuvchi hujjatlari saqlanadi",
      "Virtual fayllar: jarayon va xotira ma’lumotini ko‘rsatadi, diskda joy olmaydi",
      "Faqat qurilma fayllari saqlanadi",
    ],
  },
  {
    id: "l8",
    group: "linux",
    slide: "05.1",
    prompt:
      "/home/ali papkasida turib «cd etc» (boshida slesh yo‘q) yozsangiz nima bo‘ladi?",
    options: [
      "Doim /etc ga o‘tadi",
      "Ildiz katalogga qaytadi",
      "/home/ali/etc nisbiy yo‘l sifatida qidiriladi; bunday papka bo‘lmasa, xato beradi",
      "Uy papkasini o‘chiradi",
    ],
  },
  {
    id: "l9",
    group: "linux",
    slide: "06.1",
    prompt:
      "Log faylning eski yozuvlarini saqlab, oxiriga yangi qator qo‘shish uchun qaysi belgi kerak?",
    options: [
      "> (qayta yozish)",
      "| (pipe)",
      ">> (oxiriga qo‘shish)",
      "!! (oxirgi buyruqni takrorlash)",
    ],
  },
  {
    id: "l10",
    group: "linux",
    slide: "06.2",
    prompt:
      "Server diskida joy tugadi. Yarim gigabaytdan katta fayllarni topish uchun qaysi buyruq mos?",
    options: [
      "grep -r 500M /",
      "ls > size",
      "cd /size/500M",
      "find / -size +500M",
    ],
  },
];

const ROUTES = `10.20.0.0/16   -> Router B
10.0.0.0/8     -> Router A
0.0.0.0/0      -> ISP gateway`;

export const TASKS: ExamTask[] = [
  {
    id: "url",
    group: "web",
    slide: "08.2",
    title: "URLni qismlarga ajrating",
    brief: "Quyidagi URLning har bir qismini yozing.",
    scene: "https://shop.example.com:8443/search?q=network&page=2#results",
    inputs: [
      {
        id: "url-scheme",
        label: "Scheme",
        kind: "text",
        placeholder: "…",
        points: 1,
      },
      {
        id: "url-host",
        label: "Host",
        kind: "text",
        placeholder: "…",
        points: 1,
      },
      {
        id: "url-port",
        label: "Port",
        kind: "text",
        placeholder: "…",
        points: 1,
      },
      {
        id: "url-path",
        label: "Path",
        kind: "text",
        placeholder: "/…",
        points: 1,
      },
      {
        id: "url-query",
        label: "Query",
        kind: "text",
        placeholder: "…",
        points: 1,
      },
      {
        id: "url-fragment",
        label: "Fragment",
        kind: "text",
        placeholder: "…",
        points: 1,
      },
    ],
  },
  {
    id: "subnet",
    group: "web",
    slide: "06.2–06.3",
    title: "Subnetni hisoblang",
    brief:
      "Qurilmaning manzili quyida berilgan. Tarmoq manzilini (prefix bilan) va oxirgi odatdagi host manzilini toping, so‘ng 192.168.1.200 shu subnetdami, ayting.",
    scene: "IP address: 192.168.1.90/25",
    inputs: [
      {
        id: "subnet-network",
        label: "Tarmoq manzili (masalan 10.0.0.0/8 ko‘rinishida)",
        kind: "text",
        placeholder: "x.x.x.x/yy",
        points: 2,
      },
      {
        id: "subnet-last",
        label: "Oxirgi odatdagi host manzili",
        kind: "text",
        placeholder: "x.x.x.x",
        points: 2,
      },
      {
        id: "subnet-same",
        label: "192.168.1.200 shu qurilma bilan bir subnetdami?",
        kind: "select",
        options: ["Ha, bir subnetda", "Yo‘q, boshqa /25 subnetda"],
        points: 2,
      },
    ],
  },
  {
    id: "routing",
    group: "web",
    slide: "11.2",
    title: "Eng aniq yo‘lni tanlang",
    brief:
      "Router jadvaldagi eng uzun mos prefixni tanlaydi. Har bir destination uchun next hopni belgilang.",
    scene: ROUTES,
    inputs: [
      {
        id: "route-1",
        label: "10.20.5.8 →",
        kind: "select",
        options: ["Router A", "Router B", "ISP gateway"],
        points: 2,
      },
      {
        id: "route-2",
        label: "10.30.5.8 →",
        kind: "select",
        options: ["Router A", "Router B", "ISP gateway"],
        points: 2,
      },
      {
        id: "route-3",
        label: "8.8.8.8 →",
        kind: "select",
        options: ["Router A", "Router B", "ISP gateway"],
        points: 2,
      },
    ],
  },
  {
    id: "dns",
    group: "web",
    slide: "10 / 10.1",
    title: "Vazifaga mos DNS recordni tanlang",
    brief: "Har bir ehtiyoj uchun bitta record turini belgilang.",
    inputs: [
      ["dns-1", "Domenning IPv4 manzilini olish"],
      ["dns-2", "Domenning IPv6 manzilini olish"],
      ["dns-3", "www.example.com nomini example.com ga alias qilish"],
      ["dns-4", "Domen uchun email qabul qiladigan serverlarni ko‘rsatish"],
      ["dns-5", "Zonaga mas’ul DNS serverlarni ko‘rsatish"],
      ["dns-6", "IP manzildan domen nomini topish (reverse DNS)"],
    ].map(([id, label]) => ({
      id,
      label,
      kind: "select" as const,
      options: ["A", "AAAA", "CNAME", "MX", "NS", "PTR", "TXT"],
      points: 1,
    })),
  },
  {
    id: "http",
    group: "web",
    slide: "18.1",
    title: "HTTP request yozing",
    brief:
      "example.com serveridagi /products resursini limit=5 parametri bilan so‘rang. Javobni JSON formatda kutayotganingizni bildiring. Faqat HTTP/1.1 request matnini yozing (GET, body yo‘q).",
    inputs: [
      {
        id: "http-request",
        label: "Request matni",
        kind: "request",
        placeholder: "METHOD /path HTTP/1.1\nHeader: qiymat",
        points: 8,
      },
    ],
  },
  {
    id: "status",
    group: "web",
    slide: "20 / 20.1",
    title: "Vaziyatga mos status kodni tanlang",
    brief: "Har bir vaziyat uchun eng mos HTTP status kodini belgilang.",
    inputs: [
      ["status-1", "Session yaroqsiz — login talab qilinadi"],
      [
        "status-2",
        "Foydalanuvchi tizimga kirgan, lekin boshqa odamning buyurtmasini o‘chirishga ruxsati yo‘q",
      ],
      ["status-3", "Application ichida kutilmagan umumiy xato yuz berdi"],
    ].map(([id, label]) => ({
      id,
      label,
      kind: "select" as const,
      options: ["200", "301", "401", "403", "404", "500", "503"],
      points: 2,
    })),
  },
  {
    id: "cmd-nav",
    group: "linux",
    slide: "04.2 / 05 / 05.1",
    title: "Katalog bo‘ylab yurish",
    brief:
      "Siz /home/ali katalogidasiz. Har bir vazifa uchun bitta buyruq yozing.",
    scene: "ali@cybervalue:/home/ali$",
    inputs: [
      {
        id: "cmd-cd",
        label: "/var/log katalogiga mutlaq yo‘l bilan o‘ting",
        kind: "command",
        placeholder: "buyruq",
        points: 3,
      },
      {
        id: "cmd-ls",
        label:
          "Joriy katalogdagi yashirin fayllarni ham, uzun formatda ko‘rsating",
        kind: "command",
        placeholder: "buyruq",
        points: 3,
      },
    ],
  },
  {
    id: "cmd-make",
    group: "linux",
    slide: "05",
    title: "Katalog va fayl yaratish",
    brief:
      "Siz /home/ali katalogidasiz. `loyiha` nomli katalog yarating va uning ichida bo‘sh `notes.txt` fayl hosil qiling. Bir nechta buyruqni alohida qatorlarga yoki && bilan yozing.",
    scene: "ali@cybervalue:/home/ali$",
    inputs: [
      {
        id: "cmd-make",
        label: "Buyruqlar",
        kind: "command",
        placeholder: "buyruqlar (har biri alohida qatorda)",
        points: 4,
      },
    ],
  },
  {
    id: "cmd-write",
    group: "linux",
    slide: "06.1",
    title: "Faylga yozish",
    brief:
      "app.log faylining eski mazmunini o‘chirmasdan, oxiriga Boshlandi matnini qo‘shing.",
    scene: "ali@cybervalue:/home/ali$",
    inputs: [
      {
        id: "cmd-append",
        label: "Buyruq",
        kind: "command",
        placeholder: "buyruq",
        points: 4,
      },
    ],
  },
  {
    id: "cmd-find",
    group: "linux",
    slide: "06.2",
    title: "Hajm bo‘yicha qidirish",
    brief: "/home ichidan 50 MB dan katta fayllarni toping.",
    scene: "ali@cybervalue:/home/ali$",
    inputs: [
      {
        id: "cmd-find",
        label: "Buyruq",
        kind: "command",
        placeholder: "buyruq",
        points: 4,
      },
    ],
  },
  {
    id: "cmd-history",
    group: "linux",
    slide: "05.2 / 05.3",
    title: "Terminal xotirasi va o‘chirish",
    brief:
      "`apt update` buyrug‘i “Permission denied” berdi. Keyin /home/ali ichidagi `loyiha_papka` katalogi va uning ichidagi hamma narsani o‘chirish kerak.",
    scene:
      "ali@cybervalue:/home/ali$ apt update\nE: Could not open lock file - Permission denied",
    inputs: [
      {
        id: "cmd-sudo",
        label:
          "Oxirgi buyruqni qayta yozmasdan, sudo bilan takrorlang (tarix chaqiruvi)",
        kind: "command",
        placeholder: "buyruq",
        points: 2,
      },
      {
        id: "cmd-rm",
        label: "loyiha_papka katalogini ichidagilari bilan o‘chiring",
        kind: "command",
        placeholder: "buyruq",
        points: 2,
      },
    ],
  },
];

export const MAX_TEST = CHOICES.length * CHOICE_POINTS;
export const MAX_PRACTICE = TASKS.reduce(
  (sum, task) => sum + task.inputs.reduce((s, i) => s + i.points, 0),
  0,
);
export const MAX_TOTAL = MAX_TEST + MAX_PRACTICE;

export type ExamAnswers = Record<string, string>;

export type ExamItemResult = {
  id: string;
  score: number;
  max: number;
  expected?: string;
  explain?: string;
};

export type ExamResult = {
  total: number;
  max: number;
  test: { score: number; max: number };
  practice: { score: number; max: number };
  items: ExamItemResult[];
};
