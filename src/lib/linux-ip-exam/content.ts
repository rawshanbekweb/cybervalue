// Public content of the Linux terminal and IP addressing exam. Answer keys
// live in grading.ts and must never be imported here.

export const LINUX_IP_EXAM_PATH = "/resources/linux-ip-exam";
export const LINUX_IP_EXAM_MINUTES = 120;

export type LipTopic = "linux" | "ip";

export const TOPIC_LABELS: Record<LipTopic, string> = {
  linux: "Linux terminal buyruqlari",
  ip: "IP manzil va subnetlar",
};

export type LipChoice = {
  id: string;
  topic: LipTopic;
  points: number;
  prompt: string;
  /** A terminal or config snippet shown under the question. */
  scene?: string;
  options: string[];
};

export type LipOpen = {
  id: string;
  topic: LipTopic;
  points: number;
  prompt: string;
  scene?: string;
  kind: "command" | "text";
  placeholder: string;
};

export const CHOICES: LipChoice[] = [
  // --- Linux ---------------------------------------------------------------------------
  {
    id: "l1",
    topic: "linux",
    points: 0.9,
    prompt: "`pwd` buyrug‘i nima qiladi?",
    options: [
      "Parolni o‘zgartiradi",
      "Joriy papkaning to‘liq yo‘lini ko‘rsatadi",
      "Papkadagi fayllar ro‘yxatini chiqaradi",
      "Jarayonlarni ko‘rsatadi",
    ],
  },
  {
    id: "l2",
    topic: "linux",
    points: 0.9,
    prompt:
      "Papkadagi barcha fayllarni, yashirinlarini ham qo‘shib, batafsil (huquqlar, egasi, hajmi) ko‘rsatadigan buyruq?",
    options: ["ls", "ls -l", "ls -la", "dir -h"],
  },
  {
    id: "l3",
    topic: "linux",
    points: 1,
    prompt:
      "`/home/ali/docs` papkasida turibsiz. `cd ..` dan keyin qayerda bo‘lasiz?",
    options: ["/home/ali/docs", "/home", "/", "/home/ali"],
  },
  {
    id: "l4",
    topic: "linux",
    points: 1,
    prompt: "`mkdir -p loyiha/src/utils` buyrug‘idagi `-p` nima qiladi?",
    options: [
      "Mavjud bo‘lmagan oraliq papkalarni ham yaratadi",
      "Papkani faqat o‘qish uchun yaratadi",
      "Papkani yashirin qiladi",
      "Papkani parol bilan himoyalaydi",
    ],
  },
  {
    id: "l5",
    topic: "linux",
    points: 0.9,
    prompt: "`cat notes.txt` nima qiladi?",
    options: [
      "Faylni o‘chiradi",
      "Fayl nomini o‘zgartiradi",
      "Bo‘sh fayl yaratadi",
      "Fayl mazmunini terminalga chiqaradi",
    ],
  },
  {
    id: "l6",
    topic: "linux",
    points: 1,
    prompt: "`cp -r site/ backup/` buyrug‘ida `-r` nima uchun kerak?",
    options: [
      "Faylni o‘chirib, keyin nusxalaydi",
      "Papkani ichidagi hamma narsa bilan birga nusxalaydi",
      "Faqat yangi fayllarni nusxalaydi",
      "Nusxani faqat o‘qish uchun qiladi",
    ],
  },
  {
    id: "l7",
    topic: "linux",
    points: 2,
    prompt:
      "Bir papkaning ichida `mv hisobot.txt hisobot_eski.txt` bajarildi. Natija?",
    options: [
      "Ikki xil fayl paydo bo‘ladi",
      "hisobot.txt o‘chiriladi, yangi fayl bo‘sh bo‘ladi",
      "Fayl qayta nomlanadi, mazmuni o‘zgarmaydi",
      "Xato chiqadi: mv faqat papkalar uchun",
    ],
  },
  {
    id: "l8",
    topic: "linux",
    points: 2,
    prompt: "`chmod 644 index.html` dan keyin huquqlar qanday bo‘ladi?",
    options: [
      "Egasi: o‘qish va yozish; guruh va boshqalar: faqat o‘qish",
      "Hamma: o‘qish, yozish va bajarish",
      "Egasi: faqat bajarish; boshqalar: hech narsa",
      "Egasi va guruh: o‘qish va yozish; boshqalar: hech narsa",
    ],
  },
  {
    id: "l9",
    topic: "linux",
    points: 2,
    prompt: "`sudo chown ali:dev app.log` nima qiladi?",
    options: [
      "Faylni ali va dev papkalariga nusxalaydi",
      "Fayl egasini ali, guruhini dev qiladi",
      "Faylga ali va dev uchun parol qo‘yadi",
      "ali va dev foydalanuvchilarini yaratadi",
    ],
  },
  {
    id: "l10",
    topic: "linux",
    points: 1,
    prompt: "`grep -i error app.log` buyrug‘ida `-i` nima qiladi?",
    options: [
      "Faqat birinchi topilgan qatorni ko‘rsatadi",
      "Mos kelmagan qatorlarni ko‘rsatadi",
      "Qator raqamlarini qo‘shadi",
      "Katta-kichik harfni farqlamaydi: error, ERROR, Error",
    ],
  },
  {
    id: "l11",
    topic: "linux",
    points: 2,
    prompt: "`ps aux | grep nginx` buyrug‘idagi `|` (pipe) nima qiladi?",
    options: [
      "Ikkala buyruqni bir vaqtda alohida ishga tushiradi",
      "Birinchi buyruq chiqishini ikkinchisiga kirish qilib beradi",
      "Natijani nginx fayliga yozadi",
      "Ikkinchi buyruqni faqat birinchisi xato bersa ishga tushiradi",
    ],
  },
  {
    id: "l12",
    topic: "linux",
    points: 2,
    prompt: "`kill -9 4321` nima qiladi?",
    options: [
      "4321-jarayonni majburan, darhol to‘xtatadi (SIGKILL)",
      "4321-jarayonni 9 soniyadan keyin to‘xtatadi",
      "4321-jarayonga 9 ta signal yuboradi",
      "4321-portni yopadi",
    ],
  },
  {
    id: "l13",
    topic: "linux",
    points: 3,
    prompt: "`./backup.sh > out.log 2>&1` bajarildi. Nima bo‘ladi?",
    options: [
      "Faqat xatolar out.log ga yoziladi",
      "Natija ekranga, xatolar out.log ga chiqadi",
      "Oddiy chiqish ham, xatolar ham out.log ga yoziladi",
      "out.log oxiriga qo‘shiladi, eski mazmun saqlanadi",
    ],
  },
  {
    id: "l14",
    topic: "linux",
    points: 0.9,
    prompt: "`sudo apt update` dagi `sudo` nima uchun kerak?",
    options: [
      "Buyruqni tezroq bajarish uchun",
      "Internetga ulanish uchun",
      "Buyruqni administrator (root) huquqi bilan bajarish uchun",
      "Natijani saqlash uchun",
    ],
  },
  {
    id: "l15",
    topic: "linux",
    points: 2,
    prompt:
      "Diskda qancha bo‘sh joy qolganini qulay o‘lchovda (GB, MB) ko‘rsatadigan buyruq?",
    options: ["du -sh", "df -h", "free -h", "ls -sh"],
  },
  {
    id: "l16",
    topic: "linux",
    points: 3,
    prompt: '`find /var/log -name "*.log" -mtime -1` nimani topadi?',
    options: [
      "/var/log ichida 1 kundan eski .log fayllarni",
      "/var/log ichida hajmi 1 MB dan kichik .log fayllarni",
      "/var/log ichida oxirgi 24 soatda o‘zgargan .log fayllarni",
      "Faqat /var/log dagi birinchi .log faylni",
    ],
  },
  {
    id: "l17",
    topic: "linux",
    points: 0.9,
    prompt:
      "Buyruq haqida to‘liq qo‘llanmani qanday ochasiz (masalan, `ls` uchun)?",
    options: ["help ls", "info --ls", "ls ?", "man ls"],
  },
  {
    id: "l18",
    topic: "linux",
    points: 3,
    prompt:
      "`ls -l run.sh` natijasi quyida. dev guruhidagi (egasi bo‘lmagan) foydalanuvchi nima qila oladi?",
    scene: "-rwxr-x--- 1 ali dev 512 Oct 30 09:14 run.sh",
    options: [
      "O‘qiy va bajara oladi, lekin o‘zgartira olmaydi",
      "O‘qiy, o‘zgartira va bajara oladi",
      "Faqat o‘qiy oladi",
      "Hech narsa qila olmaydi",
    ],
  },
  {
    id: "l19",
    topic: "linux",
    points: 2,
    prompt: "`tail -f /var/log/syslog` dagi `-f` nima qiladi?",
    options: [
      "Faylning birinchi qatorlarini ko‘rsatadi",
      "Yangi qatorlar qo‘shilishi bilan ularni ko‘rsatib boradi",
      "Faylni majburan o‘chiradi",
      "Faylni filtrlaydi",
    ],
  },
  {
    id: "l20",
    topic: "linux",
    points: 3,
    prompt:
      "Terminalda `python3` yozganda aynan qaysi fayl ishga tushishini qanday bilasiz?",
    options: ["echo python3", "cat python3", "which python3", "pwd python3"],
  },

  // --- IP ------------------------------------------------------------------------------
  {
    id: "n1",
    topic: "ip",
    points: 0.9,
    prompt: "IPv4 manzil necha bitdan iborat?",
    options: ["16", "32", "64", "128"],
  },
  {
    id: "n2",
    topic: "ip",
    points: 0.9,
    prompt: "Qaysi biri to‘g‘ri IPv4 manzil?",
    options: ["192.168.1.256", "172.16.1", "10.0.0.1", "300.1.1.1"],
  },
  {
    id: "n3",
    topic: "ip",
    points: 0.9,
    prompt: "/24 prefiksining maskasi qanday?",
    options: ["255.255.0.0", "255.255.255.0", "255.255.255.255", "255.0.0.0"],
  },
  {
    id: "n4",
    topic: "ip",
    points: 1,
    prompt: "Qaysi manzil xususiy (private) tarmoqqa tegishli?",
    options: ["8.8.8.8", "1.1.1.1", "172.32.0.1", "172.20.5.4"],
  },
  {
    id: "n5",
    topic: "ip",
    points: 0.9,
    prompt: "127.0.0.1 manzili nimani bildiradi?",
    options: [
      "Routerning manzilini",
      "Kompyuterning o‘zini (loopback)",
      "DNS serverni",
      "Internetdagi birinchi serverni",
    ],
  },
  {
    id: "n6",
    topic: "ip",
    points: 1,
    prompt: "DHCP serverning asosiy vazifasi nima?",
    options: [
      "Qurilmalarga IP manzil va tarmoq sozlamalarini avtomatik berish",
      "Domen nomini IP ga aylantirish",
      "Trafikni shifrlash",
      "Saytlarni bloklash",
    ],
  },
  {
    id: "n7",
    topic: "ip",
    points: 1,
    prompt: "Default gateway nima?",
    options: [
      "Kompyuterning o‘z IP manzili",
      "Tarmoqdagi eng tez kompyuter",
      "Boshqa tarmoqlarga (internetga) chiqish uchun routerning manzili",
      "DNS yozuvining turi",
    ],
  },
  {
    id: "n8",
    topic: "ip",
    points: 2,
    prompt:
      "/26 tarmog‘ida nechta foydalanish mumkin bo‘lgan host manzili bor?",
    options: ["64", "62", "30", "126"],
  },
  {
    id: "n9",
    topic: "ip",
    points: 2,
    prompt: "192.168.1.130/25 manzilining tarmoq manzili qaysi?",
    options: ["192.168.1.0", "192.168.1.130", "192.168.1.128", "192.168.1.255"],
  },
  {
    id: "n10",
    topic: "ip",
    points: 2,
    prompt: "255.255.255.240 maskasi qaysi prefiksga teng?",
    options: ["/26", "/27", "/29", "/28"],
  },
  {
    id: "n11",
    topic: "ip",
    points: 2,
    prompt: "10.1.1.10/24 va 10.1.2.10/24 qurilmalari bir tarmoqdami?",
    options: [
      "Ha, ikkalasi ham 10.x.x.x",
      "Yo‘q, ular turli /24 tarmoqlarda — orasida router kerak",
      "Ha, chunki oxirgi oktet bir xil",
      "Faqat Wi‑Fi orqali ulansa",
    ],
  },
  {
    id: "n12",
    topic: "ip",
    points: 1,
    prompt: "Linuxda `ip a` (`ip addr`) buyrug‘i nimani ko‘rsatadi?",
    options: [
      "Ochiq portlarni",
      "Tarmoq interfeyslari va ularning IP manzillarini",
      "DNS keshini",
      "Internet tezligini",
    ],
  },
  {
    id: "n13",
    topic: "ip",
    points: 2,
    prompt: "`ping` buyrug‘i qaysi protokoldan foydalanadi?",
    options: ["HTTP", "ICMP", "FTP", "SMTP"],
  },
  {
    id: "n14",
    topic: "ip",
    points: 2,
    prompt: "DNS nima qiladi?",
    options: [
      "IP manzillarni avtomatik tarqatadi",
      "Paketlarni shifrlaydi",
      "Domen nomini (masalan, cybervalue.uz) IP manzilga aylantiradi",
      "Kompyuterni viruslardan himoyalaydi",
    ],
  },
  {
    id: "n15",
    topic: "ip",
    points: 3,
    prompt:
      "Noutbuk 169.254.37.12 manzilini oldi va internet ishlamayapti. Eng ehtimolli sabab?",
    options: [
      "Provayder yangi manzil berdi",
      "DHCP serverdan javob kelmadi, qurilma o‘ziga link-local manzil oldi",
      "Bu manzil faqat IPv6 uchun",
      "DNS server ishlamayapti, IP to‘g‘ri",
    ],
  },
  {
    id: "n16",
    topic: "ip",
    points: 3,
    prompt:
      "172.16.0.0/16 tarmog‘ini 4 ta teng subnetga bo‘lsak, har birining prefiksi qanday bo‘ladi?",
    options: ["/17", "/20", "/18", "/24"],
  },
  {
    id: "n17",
    topic: "ip",
    points: 3,
    prompt:
      "192.168.5.0/29 tarmog‘idagi oxirgi foydalanish mumkin bo‘lgan host?",
    options: ["192.168.5.7", "192.168.5.8", "192.168.5.254", "192.168.5.6"],
  },
  {
    id: "n18",
    topic: "ip",
    points: 0.9,
    prompt: "IPv6 manzil necha bitdan iborat?",
    options: ["32", "64", "128", "256"],
  },
  {
    id: "n19",
    topic: "ip",
    points: 3,
    prompt: "Uydagi routerda NAT nima qiladi?",
    options: [
      "Ichki xususiy manzillarni bitta ochiq manzil orqali internetga chiqaradi",
      "Wi‑Fi parolini shifrlaydi",
      "Domen nomlarini IP ga aylantiradi",
      "Har bir qurilmaga ochiq IP beradi",
    ],
  },
  {
    id: "n20",
    topic: "ip",
    points: 3,
    prompt:
      "`traceroute 8.8.8.8` natijasida 3-qadamda `* * *`, 4–9-qadamlar esa javob bergan. Bu nimani bildiradi?",
    scene:
      " 1  192.168.1.1  1.2 ms\n 2  10.20.0.1  4.8 ms\n 3  * * *\n 4  95.214.10.5  12.1 ms\n …\n 9  8.8.8.8  23.4 ms",
    options: [
      "Internet 3-qadamda uzilgan",
      "8.8.8.8 ishlamayapti",
      "Kompyuterning tarmoq kartasi buzilgan",
      "3-qadamdagi router javob bermaydi (ICMP yopiq bo‘lishi mumkin), lekin yo‘l ishlayapti",
    ],
  },
];

export const OPENS: LipOpen[] = [
  {
    id: "o1",
    topic: "linux",
    points: 2,
    prompt:
      "/etc/passwd faylining oxirgi 5 qatorini ko‘rsatuvchi buyruqni yozing.",
    kind: "command",
    placeholder: "buyruq",
  },
  {
    id: "o2",
    topic: "ip",
    points: 2,
    prompt:
      "192.168.10.0/27 tarmog‘ida nechta foydalanish mumkin bo‘lgan host manzili bor?",
    kind: "text",
    placeholder: "son",
  },
  {
    id: "o3",
    topic: "linux",
    points: 2,
    prompt:
      "script.sh fayliga: egasiga o‘qish, yozish va bajarish; guruhga o‘qish va bajarish; boshqalarga hech qanday huquq bermaydigan buyruqni yozing.",
    kind: "command",
    placeholder: "buyruq",
  },
  {
    id: "o4",
    topic: "linux",
    points: 3,
    prompt:
      "/var/log/auth.log faylida “Failed password” so‘zi qatnashgan qatorlar sonini chiqaradigan buyruqni yozing.",
    kind: "command",
    placeholder: "buyruq",
  },
  {
    id: "o5",
    topic: "ip",
    points: 3,
    prompt: "172.16.45.130/20 manzilining tarmoq manzilini yozing.",
    kind: "text",
    placeholder: "masalan 10.0.0.0",
  },
  {
    id: "o6",
    topic: "ip",
    points: 3,
    prompt:
      "192.168.1.77/27 manzili joylashgan tarmoqning broadcast manzilini yozing.",
    kind: "text",
    placeholder: "masalan 10.0.0.255",
  },
  {
    id: "o7",
    topic: "ip",
    points: 3,
    prompt: "Quyidagi IPv6 manzilni eng qisqa shaklda yozing.",
    scene: "2001:0db8:0000:0000:0000:ff00:0042:8329",
    kind: "text",
    placeholder: "qisqa shakl",
  },
  {
    id: "o8",
    topic: "ip",
    points: 4,
    prompt:
      "Har bir subnetda kamida 1000 ta host bo‘lishi kerak. Buning uchun eng kichik (eng tejamkor) prefiks qaysi? (/xx shaklida yozing)",
    kind: "text",
    placeholder: "/xx",
  },
  {
    id: "o9",
    topic: "linux",
    points: 4,
    prompt:
      "Serverda 8080-portni qaysi jarayon tinglayotganini ko‘rsatadigan buyruqni yozing.",
    kind: "command",
    placeholder: "buyruq",
  },
  {
    id: "o10",
    topic: "linux",
    points: 4,
    prompt:
      "Joriy papka va uning ichki papkalaridagi 7 kundan eski barcha .log fayllarni topib o‘chiradigan bitta buyruqni yozing.",
    kind: "command",
    placeholder: "buyruq",
  },
];

const round = (n: number) => Math.round(n * 10) / 10;

export const MAX_TEST = round(CHOICES.reduce((s, c) => s + c.points, 0));
export const MAX_OPEN = round(OPENS.reduce((s, o) => s + o.points, 0));
export const MAX_TOTAL = round(MAX_TEST + MAX_OPEN);

export type LipAnswers = Record<string, string>;

export type LipItemResult = {
  id: string;
  score: number;
  max: number;
  expected: string;
  /** What the student picked or typed; "" when left blank. */
  answer: string;
  /** The score of an open question was set by the teacher. */
  reviewed?: boolean;
  /** Added when an approved result is shown. */
  explain?: string;
};

export type LipResult = {
  total: number;
  max: number;
  test: { score: number; max: number };
  open: { score: number; max: number };
  items: LipItemResult[];
};

/** Answers sent after the deadline still count for this long (slow networks). */
export const LINUX_IP_EXAM_GRACE_MS = 2 * 60000;

/** What the exam page knows about the signed-in student's attempt. */
export type LipState =
  | { kind: "signed-out" }
  | { kind: "new" }
  | {
      kind: "running";
      /** Milliseconds left on the server's clock. */
      remaining: number;
      answers: LipAnswers;
      leaves: number;
    }
  | { kind: "pending" }
  | { kind: "approved"; result: LipResult; leaves: number; note: string };
