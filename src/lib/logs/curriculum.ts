// Academy Intermediate · Digital forensics, module 3: Logs and artefacts.
// The lessons use ./tools.ts: grepping auth.log for a break-in and reading
// timestamps in the epoch each source uses.
import type { CommonWidget, Lesson, Text } from "../anim-lab/types";

export type Widget = CommonWidget | { type: "grep" } | { type: "epoch" };

export const PROGRESS_KEY = "cybervalue:logs:progress:v1";

const t = (uz: string, en: string): Text => ({ uz, en });
const code = (s: string): Text => ({ uz: s, en: s });

const LINUX = t("Linux loglari", "Linux logs");
const WINDOWS = t("Windows va brauzer", "Windows and browsers");
const TIME = t("Vaqt va bog‘lash", "Time and correlation");

export const LESSONS: Lesson<Widget>[] = [
  {
    id: 1,
    group: LINUX,
    title: t("auth.log qatori", "A line of auth.log"),
    minutes: 6,
    intro: t(
      "Linux’da kirishlar, sudo va yangi foydalanuvchilar /var/log/auth.log (Debian, Ubuntu) yoki /var/log/secure (RHEL) fayliga yoziladi. Har bir qator: vaqt, xost, dastur va uning jarayon raqami, keyin voqea.",
      "On Linux, logins, sudo and new users go to /var/log/auth.log (Debian, Ubuntu) or /var/log/secure (RHEL). Each line holds the time, the host, the program and its process ID, then the event.",
    ),
    analogy: t(
      "Bino kirish jurnali: soat, eshik, kim va qanday kirgani.",
      "A building’s sign-in book: the hour, the door, who, and how they got in.",
    ),
    theory: [
      t(
        "Klassik syslog vaqtida yil ham, vaqt zonasi ham yo‘q — ularni server sozlamasidan bilib olish kerak.",
        "Classic syslog times carry neither a year nor a time zone — you have to learn them from the server’s settings.",
      ),
    ],
    task: t(
      "Qatorning har bir qismini bosib, nima ekanini o‘qing.",
      "Click each part of the line and read what it is.",
    ),
    hint: t("Hammasi bo‘lib oltita qism.", "Six parts in all."),
    widget: {
      type: "anatomy",
      lines: [
        [
          { text: "Oct  3 07:13:55", id: "time" },
          { text: " " },
          { text: "web01", id: "host" },
          { text: " " },
          { text: "sshd[2211]:", id: "proc" },
        ],
        [
          { text: "Accepted password", id: "event" },
          { text: " for " },
          { text: "root", id: "user" },
          { text: " from " },
          { text: "203.0.113.7 port 51290", id: "src" },
          { text: " ssh2" },
        ],
      ],
      parts: [
        {
          id: "time",
          title: t("Vaqt", "Time"),
          body: t(
            "Mahalliy vaqt, yilsiz va zonasiz. Bu serverda — Toshkent, UTC+5.",
            "Local time, with no year or zone. On this server: Tashkent, UTC+5.",
          ),
        },
        {
          id: "host",
          title: t("Xost nomi", "Host name"),
          body: t(
            "Loglar markaziy serverga yig‘ilganda qaysi mashinadan kelganini bildiradi.",
            "Tells which machine a line came from once logs are gathered centrally.",
          ),
        },
        {
          id: "proc",
          title: t("Dastur va PID", "Program and PID"),
          body: t(
            "sshd, jarayon 2211. Bitta seansning barcha qatorlari bir xil PID’ga ega — ularni shu bilan bog‘laysiz.",
            "sshd, process 2211. Every line of one session shares the PID — that is how you tie them together.",
          ),
        },
        {
          id: "event",
          title: t("Voqea", "Event"),
          body: t(
            "Accepted password — parol bilan muvaffaqiyatli kirish. Failed password — xato; Accepted publickey — kalit bilan.",
            "Accepted password is a successful password login. Failed password is a miss; Accepted publickey is a key login.",
          ),
        },
        {
          id: "user",
          title: t("Foydalanuvchi", "User"),
          body: t(
            "root — tizimning to‘liq egasi. root’ga parol bilan kirish umuman yoqilmagan bo‘lishi kerak edi.",
            "root owns the whole system. Password logins as root should never have been allowed.",
          ),
        },
        {
          id: "src",
          title: t("Manba IP va port", "Source IP and port"),
          body: t(
            "Kim ulangan. Shu IP’ni boshqa loglarda (firewall, veb-server) qidirasiz.",
            "Who connected. You then look for this IP in other logs (firewall, web server).",
          ),
        },
      ],
    },
  },
  {
    id: 2,
    group: LINUX,
    title: t("grep bilan qidirish", "Searching with grep"),
    minutes: 12,
    intro: t(
      "Haqiqiy auth.log’da kuniga o‘n minglab qator bo‘ladi. grep kerakli qatorlarni ajratadi: grep 'Accepted' — muvaffaqiyatli kirishlar, grep -v 'deploy' — deploy’dan boshqalari, grep -i — katta-kichik harfsiz. Bu logda kimdir parol taxmin qilib, oxiri kirgan va o‘ziga eshik qoldirgan.",
      "A real auth.log has tens of thousands of lines a day. grep picks the ones you need: grep 'Accepted' for successful logins, grep -v 'deploy' for everything but deploy, grep -i to ignore case. In this log someone guessed passwords, finally got in, and left themselves a back door.",
    ),
    analogy: t(
      "Kitobdan kerakli so‘zni qidirish: har bir sahifani o‘qimasdan, faqat shu so‘z bor sahifalarni ochasiz.",
      "Finding a word in a book: instead of reading every page, you open only the pages that have it.",
    ),
    theory: [
      t(
        "UID=0 — root huquqi. Yangi UID=0 foydalanuvchi — klassik “orqa eshik”.",
        "UID=0 means root rights. A new user with UID=0 is a classic back door.",
      ),
    ],
    task: t(
      "Hujumchining IP manzilini va u yaratgan hisobni toping.",
      "Find the attacker’s IP address and the account they created.",
    ),
    hint: t(
      "Avval 'Accepted', keyin 'new user' ni qidiring.",
      "Search for 'Accepted' first, then 'new user'.",
    ),
    widget: { type: "grep" },
  },
  {
    id: 3,
    group: WINDOWS,
    title: t("Windows hodisa ID’lari", "Windows event IDs"),
    minutes: 8,
    intro: t(
      "Windows xavfsizlik hodisalari Security.evtx jurnaliga raqamli ID bilan yoziladi. Tahlilchi eng muhimlarini yoddan biladi: 4624 — muvaffaqiyatli kirish, 4625 — muvaffaqiyatsiz, 4720 — yangi hisob, 4732 — guruhga qo‘shildi, 7045 — yangi xizmat o‘rnatildi, 1102 — jurnal tozalandi.",
      "Windows security events go to the Security.evtx log with a numeric ID. Analysts know the key ones by heart: 4624 successful logon, 4625 failed logon, 4720 account created, 4732 added to a group, 7045 service installed, 1102 audit log cleared.",
    ),
    analogy: t(
      "Shifoxona kodlari: “kod 4624” — hamma tushunadigan qisqa belgi.",
      "Hospital codes: “code 4624” is shorthand everyone understands.",
    ),
    theory: [
      t(
        "4624’ning Logon Type maydoni muhim: 2 — klaviaturadan, 3 — tarmoqdan, 10 — RDP orqali.",
        "The Logon Type field of 4624 matters: 2 is at the keyboard, 3 over the network, 10 through RDP.",
      ),
    ],
    task: t(
      "Har bir hodisa ID’sini guruhiga ajrating.",
      "Sort each event ID into its group.",
    ),
    hint: t(
      "46xx — kirish; 47xx — hisoblar; 1102 va 7045 — qizil bayroq.",
      "46xx are logons; 47xx accounts; 1102 and 7045 are red flags.",
    ),
    widget: {
      type: "sort",
      buckets: [
        { id: "logon", label: t("Kirish", "Logons") },
        { id: "account", label: t("Hisob o‘zgarishlari", "Account changes") },
        { id: "flag", label: t("Qizil bayroq", "Red flags") },
      ],
      items: [
        {
          label: t("4624 — muvaffaqiyatli kirish", "4624 — logon succeeded"),
          bucket: "logon",
        },
        {
          label: t("4625 — muvaffaqiyatsiz kirish", "4625 — logon failed"),
          bucket: "logon",
        },
        {
          label: t("4720 — hisob yaratildi", "4720 — account created"),
          bucket: "account",
        },
        {
          label: t(
            "4732 — Administrators guruhiga qo‘shildi",
            "4732 — added to Administrators",
          ),
          bucket: "account",
        },
        {
          label: t("1102 — jurnal tozalandi", "1102 — audit log cleared"),
          bucket: "flag",
        },
        {
          label: t(
            "7045 — yangi xizmat o‘rnatildi",
            "7045 — new service installed",
          ),
          bucket: "flag",
        },
      ],
    },
  },
  {
    id: 4,
    group: WINDOWS,
    title: t("Tashrif yoki ishga tushirish", "A visit or a program run"),
    minutes: 6,
    intro: t(
      "Turli artefaktlar turli savolga javob beradi. Brauzer tarixi, cookie va kesh — qaysi saytga kirilganini; Prefetch, Amcache va .bash_history — qaysi dastur yoki buyruq ishga tushirilganini ko‘rsatadi.",
      "Different artefacts answer different questions. Browser history, cookies and cache show which sites were visited; Prefetch, Amcache and .bash_history show which programs or commands were run.",
    ),
    analogy: t(
      "Chiptalar — qayerga borganingizni; kassadagi chek — nima sotib olganingizni aytadi.",
      "Tickets say where you went; a till receipt says what you bought.",
    ),
    theory: [
      t(
        "Prefetch (C:\\Windows\\Prefetch) dastur birinchi va oxirgi marta qachon ishga tushganini va necha marta ishlaganini saqlaydi.",
        "Prefetch (C:\\Windows\\Prefetch) keeps when a program first and last ran and how many times.",
      ),
    ],
    task: t(
      "Har bir artefakt nimani isbotlaydi?",
      "What does each artefact prove?",
    ),
    hint: t(
      "Brauzer — tashrif; tizim — ishga tushirish.",
      "Browser artefacts mean a visit; system ones a program run.",
    ),
    widget: {
      type: "sort",
      buckets: [
        { id: "visit", label: t("Saytga kirilgan", "A site was visited") },
        { id: "run", label: t("Dastur ishga tushgan", "A program was run") },
      ],
      items: [
        {
          label: t("Chrome History bazasi", "The Chrome History database"),
          bucket: "visit",
        },
        {
          label: t("Saytning cookie fayli", "A site’s cookie"),
          bucket: "visit",
        },
        {
          label: t("Brauzer keshidagi sahifa", "A page in the browser cache"),
          bucket: "visit",
        },
        {
          label: code("MINER.EXE-1A2B3C4D.pf (Prefetch)"),
          code: true,
          bucket: "run",
        },
        {
          label: t("Amcache.hve yozuvi", "An Amcache.hve entry"),
          bucket: "run",
        },
        {
          label: code("~/.bash_history: ./miner -o pool:3333"),
          code: true,
          bucket: "run",
        },
      ],
    },
  },
  {
    id: 5,
    group: TIME,
    title: t("Epoch: vaqt raqam sifatida", "Epochs: time as a number"),
    minutes: 10,
    intro: t(
      "Ko‘p dasturlar vaqtni sana emas, raqam sifatida saqlaydi — biror “boshlang‘ich nuqta”dan (epoch) beri o‘tgan vaqt. Unix: 1970-01-01 dan beri soniyalar (yoki millisoniyalar). Chrome va Windows: 1601-01-01 dan beri mikrosoniyalar yoki 100 nanosoniyalar. Noto‘g‘ri format tanlansa, sana 1970 yoki 1601 yilga tushib qoladi.",
      "Many programs store time not as a date but as a number — the time since some starting point (an epoch). Unix counts seconds (or milliseconds) since 1970-01-01. Chrome and Windows count microseconds or 100-nanosecond steps since 1601-01-01. Pick the wrong format and the date lands in 1970 or 1601.",
    ),
    analogy: t(
      "“120 dan keyin” — 120 nima? Daqiqa, soniya yoki kun — bilmasangiz, vaqtni topolmaysiz.",
      "“120 from now” — 120 what? Minutes, seconds or days — without knowing, you can’t find the time.",
    ),
    theory: [
      t(
        "Raqam uzunligi yordam beradi: 10 xona — Unix soniya, 13 — millisoniya, 17 — Chrome mikrosoniya, 18 — Windows FILETIME.",
        "The length helps: 10 digits is Unix seconds, 13 milliseconds, 17 Chrome microseconds, 18 a Windows FILETIME.",
      ),
    ],
    task: t(
      "Har bir raqam uchun formatni shunday tanlangki, uchalasi ham bir lahzani ko‘rsatsin.",
      "Pick the format for each number so all three show the same moment.",
    ),
    hint: t(
      "Xonalar sonini sanang: 10, 13 va 17.",
      "Count the digits: 10, 13 and 17.",
    ),
    widget: { type: "epoch" },
  },
  {
    id: 6,
    group: TIME,
    title: t("Izlarni o‘chirishga urinish", "Covering tracks"),
    minutes: 6,
    intro: t(
      "Tajribali hujumchi loglarni tozalaydi: Windows’da wevtutil cl Security (hodisa 1102 qoladi), Linux’da auth.log’ni bo‘shatadi yoki wtmp’ni tahrirlaydi. Himoya — loglarni darhol markaziy serverga (SIEM) yuborish: u yerga hujumchining qo‘li yetmaydi.",
      "A careful attacker clears the logs: on Windows wevtutil cl Security (which leaves event 1102), on Linux they empty auth.log or edit wtmp. The defence is shipping logs straight to a central server (a SIEM) the attacker can’t reach.",
    ),
    analogy: t(
      "Kundalikdan sahifani yirtish: yirtilgan joy baribir ko‘rinadi, nusxasi esa boshqa joyda saqlangan.",
      "Tearing a page out of a diary: the tear still shows, and a copy is kept elsewhere.",
    ),
    theory: [
      t(
        "Bo‘sh yoki keskin uzilgan log — o‘zi dalil: “bu yerda kimdir nimanidir yashirgan”.",
        "An empty or abruptly cut log is evidence in itself: “someone hid something here”.",
      ),
    ],
    task: t("Savollarga javob bering.", "Answer the questions."),
    hint: t(
      "Markaziy loglar — buzilgan serverdan tashqarida.",
      "Central logs live outside the hacked server.",
    ),
    widget: {
      type: "quiz",
      questions: [
        {
          ask: t(
            "Security jurnalida faqat bitta yozuv bor: 1102, bugun 02:20. Bu nimani bildiradi?",
            "The Security log holds a single entry: 1102, today at 02:20. What does it mean?",
          ),
          options: [
            t(
              "Kimdir 02:20 da jurnalni tozalagan — undan oldingi hodisalarni boshqa joydan qidirish kerak",
              "Someone cleared the log at 02:20 — look for the earlier events elsewhere",
            ),
            t("Server yangi o‘rnatilgan", "The server was just installed"),
            t("Hech narsa bo‘lmagan", "Nothing happened"),
          ],
          answer: 0,
          explain: t(
            "1102 tozalashning o‘zini qayd etadi.",
            "1102 records the clearing itself.",
          ),
        },
        {
          ask: t(
            "Loglarni o‘chirishdan eng yaxshi himoya?",
            "The best protection against deleted logs?",
          ),
          options: [
            t(
              "Loglarni real vaqtda markaziy serverga yuborish",
              "Sending logs to a central server in real time",
            ),
            t("Log fayllarini yashirin qilish", "Making the log files hidden"),
            t("Loglarni yozmaslik", "Not writing logs"),
          ],
          answer: 0,
          explain: t(
            "Hujumchi markaziy serverga yeta olmaydi.",
            "The attacker can’t reach the central server.",
          ),
        },
      ],
    },
  },
  {
    id: 7,
    group: TIME,
    title: t("Kim qildi?", "Who did it?"),
    minutes: 6,
    intro: t(
      "Log “root 203.0.113.7 dan kirdi” deydi — lekin root’ni kim ishlatgan? Umumiy hisoblar, NAT ortidagi IP’lar va noto‘g‘ri sozlangan soatlar “kim” savolini qiyinlashtiradi. Har bir xodimning o‘z hisobi, sinxron soatlar (NTP) va bir nechta manbani bog‘lash — javobning kaliti.",
      "The log says “root logged in from 203.0.113.7” — but who used root? Shared accounts, IPs behind NAT and badly set clocks make “who” hard. Everyone’s own account, synchronised clocks (NTP) and tying several sources together are the key to the answer.",
    ),
    analogy: t(
      "Butun ofisga bitta kalit: eshik ochilgani ma’lum, lekin kim ochgani — yo‘q.",
      "One key for the whole office: you know the door opened, not who opened it.",
    ),
    theory: [
      t(
        "Soatlari 3 daqiqa farq qiladigan ikki server loglari voqealarni noto‘g‘ri tartibda ko‘rsatadi.",
        "Logs from two servers whose clocks are 3 minutes apart show events in the wrong order.",
      ),
    ],
    task: t("Savollarga javob bering.", "Answer the questions."),
    hint: t("Shaxsiy hisob va NTP.", "Personal accounts and NTP."),
    widget: {
      type: "quiz",
      questions: [
        {
          ask: t(
            "Barcha adminlar “admin” degan bitta hisobdan foydalanadi. Tergovda bu nimaga xalaqit beradi?",
            "Every admin uses one shared “admin” account. How does it hurt an investigation?",
          ),
          options: [
            t(
              "Qaysi odam qaysi amalni bajarganini bilib bo‘lmaydi",
              "You can’t tell which person did what",
            ),
            t("Hech narsaga", "It doesn’t"),
            t("Loglar shifrlanadi", "The logs get encrypted"),
          ],
          answer: 0,
          explain: t(
            "Har bir odamga o‘z hisobi — har bir amalga o‘z egasi.",
            "Everyone their own account — every action its own owner.",
          ),
        },
        {
          ask: t(
            "Nega barcha serverlarda NTP yoqilgan bo‘lishi kerak?",
            "Why should every server run NTP?",
          ),
          options: [
            t(
              "Turli loglardagi vaqtlarni ishonchli solishtirish uchun",
              "So times in different logs can be compared reliably",
            ),
            t("Internet tezligi uchun", "For internet speed"),
            t("Parollar uchun", "For passwords"),
          ],
          answer: 0,
          explain: t(
            "Soatlar mos kelmasa, xronologiya buziladi.",
            "With clocks out of step, the timeline falls apart.",
          ),
        },
      ],
    },
  },
  {
    id: 8,
    group: TIME,
    title: t("Yakuniy savollar", "Final questions"),
    minutes: 6,
    intro: t(
      "Modulni takrorlaymiz: auth.log, grep, Windows hodisa ID’lari, brauzer va tizim artefaktlari, epoch formatlari, loglarni tozalash va “kim” savoli.",
      "A review of the module: auth.log, grep, Windows event IDs, browser and system artefacts, epoch formats, cleared logs and the question of “who”.",
    ),
    analogy: t(
      "Loglar — guvohlar: biri adashishi mumkin, lekin bir nechtasi bir xil gapirsa, ishonsa bo‘ladi.",
      "Logs are witnesses: one may be wrong, but when several agree you can trust them.",
    ),
    theory: [
      t(
        "Keyingi modul — hodisaga javob: aniqlashdan tiklanishgacha bosqichlar.",
        "The next module is incident response: the stages from detection to recovery.",
      ),
    ],
    task: t(
      "Barcha savollarga to‘g‘ri javob bering.",
      "Answer every question correctly.",
    ),
    hint: t(
      "4625 — muvaffaqiyatsiz; 13 xona — millisoniya.",
      "4625 is a failure; 13 digits are milliseconds.",
    ),
    widget: {
      type: "quiz",
      questions: [
        {
          ask: t(
            "Qaysi buyruq auth.log’dan faqat muvaffaqiyatli SSH kirishlarini ko‘rsatadi?",
            "Which command shows only successful SSH logins from auth.log?",
          ),
          options: [
            code("grep 'Accepted' /var/log/auth.log"),
            code("grep 'Failed' /var/log/auth.log"),
            code("grep -v 'sshd' /var/log/auth.log"),
          ],
          answer: 0,
          explain: t(
            "Accepted — muvaffaqiyatli; Failed — xato.",
            "Accepted means success; Failed a miss.",
          ),
        },
        {
          ask: t(
            "Windows’da 4625 hodisalari ko‘payib, keyin 4624 Logon Type 10 keldi. Bu?",
            "On Windows a burst of 4625 events is followed by a 4624 with Logon Type 10. This is?",
          ),
          options: [
            t(
              "RDP orqali parol taxmin qilib kirish",
              "A password-guessing break-in over RDP",
            ),
            t("Oddiy ish kuni", "An ordinary working day"),
            t("Printer xatosi", "A printer fault"),
          ],
          answer: 0,
          explain: t(
            "Logon Type 10 — RemoteInteractive (RDP).",
            "Logon Type 10 is RemoteInteractive (RDP).",
          ),
        },
        {
          ask: t(
            "1791000000000 qaysi format?",
            "Which format is 1791000000000?",
          ),
          options: [
            t("Unix millisoniya (13 xona)", "Unix milliseconds (13 digits)"),
            t("Unix soniya", "Unix seconds"),
            t("Chrome mikrosoniya", "Chrome microseconds"),
          ],
          answer: 0,
          explain: t(
            "10 xona — soniya, 13 — millisoniya, 17 — Chrome.",
            "10 digits are seconds, 13 milliseconds, 17 Chrome.",
          ),
        },
        {
          ask: t(
            "Qaysi artefakt dastur ishga tushganini isbotlaydi?",
            "Which artefact proves a program ran?",
          ),
          options: [
            t("Prefetch fayli", "A Prefetch file"),
            t("Brauzer cookie’si", "A browser cookie"),
            t("Kesh sahifasi", "A cached page"),
          ],
          answer: 0,
          explain: t(
            "Prefetch dastur ishga tushganda yaratiladi.",
            "Prefetch is created when a program runs.",
          ),
        },
      ],
    },
  },
];
