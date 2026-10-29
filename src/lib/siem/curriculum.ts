// Academy Intermediate · Blue team, module 1: Logs and SIEM. The lessons use
// ./tools.ts: three sources' versions of one failed login, and a search over
// normalised events that finds a password-spraying attack.
import type { CommonWidget, Lesson, Text } from "../anim-lab/types";

export type Widget = CommonWidget | { type: "normalise" } | { type: "search" };

export const PROGRESS_KEY = "cybervalue:siem:progress:v1";

const t = (uz: string, en: string): Text => ({ uz, en });
const code = (s: string): Text => ({ uz: s, en: s });

const COLLECT = t("Yig‘ish", "Collecting");
const SEARCH = t("Qidirish", "Searching");
const RUN = t("Ishlatish", "Running it");

export const LESSONS: Lesson<Widget>[] = [
  {
    id: 1,
    group: COLLECT,
    title: t("Qaysi log nimani aytadi", "What each log tells you"),
    minutes: 6,
    intro: t(
      "SOC (xavfsizlik operatsiyalari markazi) tashkilotdagi hodisalarni loglar orqali ko‘radi. Har bir manba o‘z savoliga javob beradi: tizim va autentifikatsiya loglari — kim kirdi; tarmoq loglari (firewall, DNS, proxy) — qayerga ulandi; ilova loglari — ilova ichida nima qildi.",
      "A SOC (security operations centre) sees what happens in an organisation through its logs. Each source answers its own question: system and authentication logs say who logged in; network logs (firewall, DNS, proxy) say where a machine connected; application logs say what was done inside an app.",
    ),
    analogy: t(
      "Bino xavfsizligi: eshikdagi kartochka o‘quvchi, koridordagi kamera va kassadagi chek — har biri boshqa narsani ko‘radi.",
      "Building security: the badge reader at the door, the camera in the corridor and the till receipt each see something different.",
    ),
    theory: [
      t(
        "Hamma narsani yig‘ish qimmat. Avval savollardan boshlang: qaysi hujumni ko‘rishimiz kerak — va qaysi log uni ko‘rsatadi?",
        "Collecting everything is expensive. Start from the questions: which attacks must we see, and which log shows them?",
      ),
    ],
    task: t(
      "Har bir savolga qaysi log manbasi javob beradi?",
      "Which log source answers each question?",
    ),
    hint: t(
      "Kirish — autentifikatsiya; ulanish — tarmoq; ilova ichidagi amal — ilova.",
      "Logging in: authentication. Connecting: network. Actions in an app: the application.",
    ),
    widget: {
      type: "sort",
      buckets: [
        { id: "auth", label: t("Tizim va kirish", "System and auth") },
        { id: "network", label: t("Tarmoq", "Network") },
        { id: "app", label: t("Ilova", "Application") },
      ],
      items: [
        {
          label: t(
            "Kim tunda serverga SSH bilan kirdi?",
            "Who logged into the server over SSH at night?",
          ),
          bucket: "auth",
        },
        {
          label: t(
            "Qaysi kompyuter yangi administrator hisobini yaratdi?",
            "Which computer created a new administrator account?",
          ),
          bucket: "auth",
        },
        {
          label: t(
            "Noutbuk qaysi g‘alati domenni so‘radi?",
            "Which odd domain did a laptop look up?",
          ),
          bucket: "network",
        },
        {
          label: t(
            "Ichkaridan tashqariga 2 GB yuborildimi?",
            "Were 2 GB sent from inside to the outside?",
          ),
          bucket: "network",
        },
        {
          label: t(
            "Kim do‘kon saytida mahsulot narxini o‘zgartirdi?",
            "Who changed a product’s price on the shop site?",
          ),
          bucket: "app",
        },
        {
          label: t(
            "Qaysi hisob mijozlar ro‘yxatini eksport qildi?",
            "Which account exported the customer list?",
          ),
          bucket: "app",
        },
      ],
    },
  },
  {
    id: 2,
    group: COLLECT,
    title: t("Bitta hodisa, uch format", "One event, three formats"),
    minutes: 10,
    intro: t(
      "SIEM (Security Information and Event Management) loglarni bir joyga yig‘adi. Lekin har bir manba o‘z formatida yozadi: sshd — oddiy matn, veb-ilova — JSON, Windows — EventID va maydonlar. Normallashtirish — har biridan bir xil ma’noli qiymatni olib, umumiy nomli maydonga yozish.",
      "A SIEM (Security Information and Event Management) brings logs together in one place. But each source writes its own format: sshd plain text, the web app JSON, Windows an EventID with fields. Normalisation means taking the value that means the same thing from each and writing it into a field with a shared name.",
    ),
    analogy: t(
      "Uch tilda yozilgan anketa: “ism”, “name”, “имя” — barchasini bitta “ism” ustuniga yozasiz.",
      "A form filled in three languages: “ism”, “name”, “имя” all go into one “name” column.",
    ),
    theory: [
      t(
        "Bu yerda Elastic Common Schema (ECS) nomlari: source.ip — ulanish kelgan manzil, user.name — hisob nomi.",
        "The names here come from the Elastic Common Schema (ECS): source.ip is the address the connection came from, user.name the account.",
      ),
    ],
    task: t(
      "Har bir qatordan source.ip va user.name qiymatlarini tanlang.",
      "Pick the source.ip and user.name values from each line.",
    ),
    hint: t(
      "Windows’da hisob — TargetUserName, manzil — IpAddress.",
      "On Windows the account is TargetUserName and the address IpAddress.",
    ),
    widget: { type: "normalise" },
  },
  {
    id: 3,
    group: COLLECT,
    title: t("Vaqt, soat va yaxlitlik", "Time, clocks and integrity"),
    minutes: 6,
    intro: t(
      "Turli manbalarni birlashtirish uchun vaqt bir xil bo‘lishi kerak: barcha tizimlar NTP bilan sinxronlanadi va SIEM vaqtni UTC’da saqlaydi. Loglar tezda markaziy serverga yuboriladi — hujumchi kompyuterdagi logni o‘chirsa ham, nusxasi qoladi.",
      "To join sources, time must agree: every system syncs over NTP and the SIEM stores time in UTC. Logs are forwarded to a central server quickly, so even if an attacker wipes the log on a machine, the copy survives.",
    ),
    analogy: t(
      "Guvohlar soati 5 daqiqa farq qilsa, kim birinchi kelganini aniqlab bo‘lmaydi.",
      "If the witnesses’ watches differ by 5 minutes, you can’t tell who arrived first.",
    ),
    theory: [
      t(
        "Saqlash muddati (retention) qonun va tergov ehtiyojiga qarab belgilanadi: hujumlar ko‘pincha oylar o‘tib aniqlanadi.",
        "Retention is set by law and by what investigations need: attacks are often found months later.",
      ),
    ],
    task: t("Savollarga javob bering.", "Answer the questions."),
    hint: t(
      "Bitta vaqt zonasi, bitta aniq soat, nusxa boshqa joyda.",
      "One time zone, one accurate clock, a copy somewhere else.",
    ),
    widget: {
      type: "quiz",
      questions: [
        {
          ask: t(
            "Veb-server UTC+5, domen kontrolleri UTC’da yozadi. SIEM nima qilishi kerak?",
            "The web server logs in UTC+5, the domain controller in UTC. What should the SIEM do?",
          ),
          options: [
            t(
              "Hammasini UTC’ga o‘tkazib saqlash",
              "Convert everything to UTC and store that",
            ),
            t("Har birini o‘z vaqtida qoldirish", "Keep each in its own time"),
            t("Vaqtni olib tashlash", "Drop the time"),
          ],
          answer: 0,
          explain: t(
            "Bitta vaqt o‘qi bo‘lmasa, hodisalar tartibi buziladi.",
            "Without one timeline the order of events falls apart.",
          ),
        },
        {
          ask: t(
            "Nega loglar markaziy serverga darhol yuboriladi?",
            "Why are logs forwarded to a central server straight away?",
          ),
          options: [
            t(
              "Hujumchi kompyuterdagi logni o‘chirsa ham, nusxa qoladi",
              "If an attacker wipes the local log, the copy remains",
            ),
            t("Disk joyini tejash uchun", "To save disk space"),
            t("Tarmoqni tezlashtirish uchun", "To speed up the network"),
          ],
          answer: 0,
          explain: t(
            "Izlarni o‘chirish — hujumchining odatiy qadami (ATT&CK T1070).",
            "Wiping traces is a standard attacker step (ATT&CK T1070).",
          ),
        },
        {
          ask: t(
            "Bir server soati 7 daqiqa orqada. Oqibati?",
            "One server’s clock is 7 minutes behind. The result?",
          ),
          options: [
            t(
              "Uning hodisalari boshqa manbalar bilan noto‘g‘ri tartibda chiqadi",
              "Its events line up in the wrong order against other sources",
            ),
            t("Hech narsa", "Nothing"),
            t("Loglar shifrlanadi", "Its logs get encrypted"),
          ],
          answer: 0,
          explain: t(
            "Shuning uchun hamma joyda NTP.",
            "That is why NTP runs everywhere.",
          ),
        },
      ],
    },
  },
  {
    id: 4,
    group: SEARCH,
    title: t("Manbalar bo‘ylab qidiruv", "Searching across sources"),
    minutes: 12,
    intro: t(
      "Normallashtirilgan loglarda bitta so‘rov hamma manbani qamraydi. Password spraying hujumida hujumchi har bir hisobga bir-ikki marta urinadi — har bir tizimda alohida qaraganda bu sezilmaydi. Lekin source.ip bo‘yicha guruhlasangiz, bitta manzil hamma joyda ko‘rinadi.",
      "With normalised logs, one search covers every source. In a password-spraying attack the attacker tries each account only once or twice, which looks like nothing on any single system. Group by source.ip, though, and one address shows up everywhere.",
    ),
    analogy: t(
      "Bitta odam har bir do‘konga bitta qalbaki pul beradi: hech bir kassir sezmaydi, lekin bank hammasini birga ko‘radi.",
      "One person hands each shop a single fake note: no cashier notices, but the bank sees them all together.",
    ),
    theory: [
      t(
        "Bir xil manzildan ko‘p hisob va ko‘p tizimga urinish — spraying belgisi. Undan keyin kelgan “success” — buzilgan hisob.",
        "Many accounts and many systems tried from one address is the spraying sign. A “success” after it is the breached account.",
      ),
    ],
    task: t(
      "Hujumchining manzilini va u kirib olgan hisobni toping.",
      "Find the attacker’s address and the account they got into.",
    ),
    hint: t(
      "Muvaffaqiyatsizlarni source.ip bo‘yicha guruhlang, keyin muvaffaqiyatlilarni ko‘ring.",
      "Group the failures by source.ip, then look at the successes.",
    ),
    widget: { type: "search" },
  },
  {
    id: 5,
    group: SEARCH,
    title: t("SIEM so‘rovi tuzilishi", "Anatomy of a SIEM query"),
    minutes: 6,
    intro: t(
      "Splunk SPL’da so‘rov quvur (|) orqali qadamlardan iborat: avval qaysi hodisalar, keyin hisoblash, keyin saralash. Quyidagi so‘rov oxirgi 15 daqiqada 5 tadan ortiq turli hisobga urinib ko‘rgan manzillarni topadi.",
      "In Splunk’s SPL a search is a chain of steps joined by pipes (|): first which events, then the counting, then the filtering. The search below finds the addresses that tried more than 5 different accounts in the last 15 minutes.",
    ),
    analogy: t(
      "Oshxonadagi zanjir: sabzavotni tanlash, to‘g‘rash, keyin faqat kerakli bo‘laklarni qozonga solish.",
      "A kitchen line: pick the vegetables, chop them, then put only the pieces you need in the pot.",
    ),
    theory: [
      t(
        "Boshqa SIEM’lar (Elastic KQL/ES|QL, Microsoft Sentinel KQL) sintaksisi boshqa, lekin g‘oya bir xil: filtr, guruhlash, chegara.",
        "Other SIEMs (Elastic KQL/ES|QL, Microsoft Sentinel KQL) spell it differently, but the idea is the same: filter, group, threshold.",
      ),
    ],
    task: t(
      "So‘rovning har bir qismini bosib, nima ekanini o‘qing.",
      "Click each part of the search and read what it does.",
    ),
    hint: t("Hammasi bo‘lib beshta qism.", "Five parts in all."),
    widget: {
      type: "anatomy",
      lines: [
        [
          { text: "index=auth", id: "index" },
          { text: " " },
          { text: "action=failure", id: "filter" },
          { text: " " },
          { text: "earliest=-15m", id: "window" },
        ],
        [
          { text: "| " },
          { text: "stats dc(user) as users by src_ip", id: "stats" },
        ],
        [{ text: "| " }, { text: "where users > 5", id: "where" }],
      ],
      parts: [
        {
          id: "index",
          title: t("index — qayerdan", "index — where from"),
          body: t(
            "Qidiruv faqat autentifikatsiya loglari saqlanadigan indeksda.",
            "Search only the index that holds authentication logs.",
          ),
        },
        {
          id: "filter",
          title: t("Filtr", "The filter"),
          body: t("Faqat muvaffaqiyatsiz kirishlar.", "Only failed logins."),
        },
        {
          id: "window",
          title: t("Vaqt oynasi", "The time window"),
          body: t(
            "Oxirgi 15 daqiqa. Oyna qanchalik kichik bo‘lsa, so‘rov shunchalik tez.",
            "The last 15 minutes. The smaller the window, the faster the search.",
          ),
        },
        {
          id: "stats",
          title: t("stats — guruhlash", "stats — grouping"),
          body: t(
            "Har bir manzil uchun turli hisoblar soni (dc — distinct count).",
            "For each address, the number of different accounts (dc is distinct count).",
          ),
        },
        {
          id: "where",
          title: t("where — chegara", "where — the threshold"),
          body: t(
            "Faqat 5 tadan ortiq hisobga uringan manzillar qoladi.",
            "Only the addresses that tried more than 5 accounts remain.",
          ),
        },
      ],
    },
  },
  {
    id: 6,
    group: RUN,
    title: t("Foydali dashboard", "A useful dashboard"),
    minutes: 6,
    intro: t(
      "Dashboard tahlilchiga “hozir nima g‘alati?” degan savolga tez javob berishi kerak. Chiroyli, lekin harakatga undamaydigan panellar e’tiborni chalg‘itadi. Yaxshi panel o‘zgarishni ko‘rsatadi va bosilganda tafsilotga olib boradi.",
      "A dashboard should quickly answer an analyst’s question: “what is odd right now?” Pretty panels that lead to no action only distract. A good panel shows change and leads to detail when clicked.",
    ),
    analogy: t(
      "Mashina asboblar paneli: tezlik va yonilg‘i ko‘rsatkichi — kerak; radio rangi — emas.",
      "A car’s dashboard: the speed and fuel gauges matter; the colour of the radio doesn’t.",
    ),
    theory: [
      t(
        "Har bir panelga savol bering: “Bu raqam o‘zgarsa, men nima qilaman?” Javob bo‘lmasa — panel kerak emas.",
        "Ask each panel: “If this number changes, what do I do?” If there is no answer, drop the panel.",
      ),
    ],
    task: t(
      "Har bir panel SOC uchun foydalimi yoki shovqinmi?",
      "Is each panel useful to a SOC, or noise?",
    ),
    hint: t(
      "Foydali panel g‘ayritabiiy holatni ko‘rsatadi.",
      "A useful panel shows what is out of the ordinary.",
    ),
    widget: {
      type: "sort",
      buckets: [
        { id: "useful", label: t("Foydali", "Useful") },
        { id: "noise", label: t("Shovqin", "Noise") },
      ],
      items: [
        {
          label: t(
            "Bir manzildan ko‘p hisobga urinishlar",
            "Many accounts tried from one address",
          ),
          bucket: "useful",
        },
        {
          label: t(
            "Yangi yaratilgan administrator hisoblari",
            "Newly created administrator accounts",
          ),
          bucket: "useful",
        },
        {
          label: t(
            "Loglarni yubormay qo‘ygan manbalar",
            "Sources that stopped sending logs",
          ),
          bucket: "useful",
        },
        {
          label: t(
            "Bugun yig‘ilgan jami loglar soni",
            "The total number of logs collected today",
          ),
          bucket: "noise",
        },
        {
          label: t(
            "Hujum qilgan mamlakatlar aylanadigan 3D globusi",
            "A spinning 3D globe of attacking countries",
          ),
          bucket: "noise",
        },
      ],
    },
  },
  {
    id: 7,
    group: RUN,
    title: t("Manbalar sog‘ligi", "Keeping the sources healthy"),
    minutes: 6,
    intro: t(
      "SIEM faqat unga kelgan loglarni ko‘radi. Agent o‘chib qolsa, disk to‘lsa yoki format o‘zgarib parser buzilsa, SIEM jim turadi — va jimlik “hammasi joyida”dek ko‘rinadi. Shuning uchun manbalar oqimining o‘zi ham kuzatiladi.",
      "A SIEM sees only the logs that reach it. If an agent dies, a disk fills or a format changes and the parser breaks, the SIEM goes quiet — and quiet looks like “all fine”. So the flow from each source is watched too.",
    ),
    analogy: t(
      "Tutun detektorining batareyasi tugasa, u jim turadi — yong‘in yo‘qligi uchun emas.",
      "A smoke alarm with a dead battery stays silent — not because there is no fire.",
    ),
    theory: [
      t(
        "Hujumchilar ham buni biladi: log xizmatini to‘xtatish yoki audit siyosatini o‘chirish — tanish qadam.",
        "Attackers know it too: stopping the log service or switching off the audit policy is a familiar step.",
      ),
    ],
    task: t("Savollarga javob bering.", "Answer the questions."),
    hint: t("Jimlik ham signal.", "Silence is a signal too."),
    widget: {
      type: "quiz",
      questions: [
        {
          ask: t(
            "Domen kontrolleridan 2 soatdir log kelmayapti. Bu nima?",
            "No logs have come from the domain controller for 2 hours. What is that?",
          ),
          options: [
            t(
              "Tekshirish kerak bo‘lgan ogohlantirish",
              "An alert worth checking",
            ),
            t("Yaxshi belgi — hujum yo‘q", "A good sign — no attacks"),
            t("Oddiy holat", "Normal"),
          ],
          answer: 0,
          explain: t(
            "Agent nosozligi yoki ataylab o‘chirilgan bo‘lishi mumkin.",
            "It may be a broken agent, or someone switched it off.",
          ),
        },
        {
          ask: t(
            "Ilova yangilangach, log formati o‘zgardi va user.name bo‘sh qoldi. Oqibati?",
            "After an app update its log format changed and user.name came out empty. The result?",
          ),
          options: [
            t(
              "Shu maydonga tayangan qoidalar ishlamay qoladi",
              "Rules that rely on that field stop working",
            ),
            t("Hech narsa", "Nothing"),
            t("SIEM o‘zi tuzatadi", "The SIEM fixes it itself"),
          ],
          answer: 0,
          explain: t(
            "Parserlar ham test qilinadi va kuzatiladi.",
            "Parsers get tested and watched too.",
          ),
        },
      ],
    },
  },
  {
    id: 8,
    group: RUN,
    title: t("Yakuniy savollar", "Final questions"),
    minutes: 6,
    intro: t(
      "Modulni takrorlaymiz: log manbalari, normallashtirish, vaqt va yaxlitlik, manbalar bo‘ylab qidiruv, so‘rov tuzilishi, dashboard va manbalar sog‘ligi.",
      "A review of the module: log sources, normalisation, time and integrity, searching across sources, query anatomy, dashboards and source health.",
    ),
    analogy: t(
      "Yaxshi SIEM — yaxshi kutubxona: kitoblar bir xil tartibda, katalog aniq, yo‘qolgani darhol seziladi.",
      "A good SIEM is a good library: the books are shelved one way, the catalogue is accurate, and a missing one is noticed at once.",
    ),
    theory: [
      t(
        "Keyingi modulda shu loglar ustiga aniqlash qoidalarini yozamiz.",
        "In the next module we write detection rules on top of these logs.",
      ),
    ],
    task: t(
      "Barcha savollarga to‘g‘ri javob bering.",
      "Answer every question correctly.",
    ),
    hint: t(
      "Normallashtirish — bir xil ma’no, bir xil maydon.",
      "Normalisation: same meaning, same field.",
    ),
    widget: {
      type: "quiz",
      questions: [
        {
          ask: t(
            "Normallashtirish nima beradi?",
            "What does normalisation give you?",
          ),
          options: [
            t(
              "Bitta so‘rov barcha manbalarda ishlaydi",
              "One search works across every source",
            ),
            t("Loglar kichrayadi", "Smaller logs"),
            t("Loglar shifrlanadi", "Encrypted logs"),
          ],
          answer: 0,
          explain: t(
            "source.ip har joyda source.ip.",
            "source.ip means source.ip everywhere.",
          ),
        },
        {
          ask: t(
            "Password spraying qaysi guruhlashda ko‘rinadi?",
            "Which grouping shows password spraying?",
          ),
          options: [code("source.ip"), code("user.name"), code("host.name")],
          answer: 0,
          explain: t(
            "Har bir hisobga kam urinish, lekin bitta manzil ko‘p hisobga.",
            "Few tries per account, but one address against many accounts.",
          ),
        },
        {
          ask: t(
            "SIEM vaqtni qaysi zonada saqlashi kerak?",
            "Which time zone should a SIEM store times in?",
          ),
          options: [
            code("UTC"),
            t("Har bir serverning o‘z zonasi", "Each server’s own zone"),
            t("Tahlilchining zonasi", "The analyst’s zone"),
          ],
          answer: 0,
          explain: t(
            "Bitta vaqt o‘qi — bitta haqiqat.",
            "One timeline, one truth.",
          ),
        },
        {
          ask: t(
            "Windows’da muvaffaqiyatsiz kirish qaysi EventID?",
            "Which Windows EventID is a failed logon?",
          ),
          options: [code("4625"), code("4624"), code("4720")],
          answer: 0,
          explain: t(
            "4624 — muvaffaqiyatli kirish, 4720 — yangi hisob.",
            "4624 is a successful logon, 4720 a new account.",
          ),
        },
      ],
    },
  },
];
