// Academy Intermediate · Blue team, module 4: Threat hunting. The lessons use
// ./tools.ts: a slice of the ATT&CK matrix to mark a threat report on, and
// scheduled tasks stacked across forty computers.
import type { CommonWidget, Lesson, Text } from "../anim-lab/types";

export type Widget = CommonWidget | { type: "matrix" } | { type: "stack" };

export const PROGRESS_KEY = "cybervalue:hunting:progress:v1";

const t = (uz: string, en: string): Text => ({ uz, en });
const code = (s: string): Text => ({ uz: s, en: s });

const IDEA = t("G‘oya", "The idea");
const MAP = t("ATT&CK", "ATT&CK");
const HUNT = t("Izlash", "The hunt");

export const LESSONS: Lesson<Widget>[] = [
  {
    id: 1,
    group: IDEA,
    title: t("Kutmasdan izlash", "Looking without waiting"),
    minutes: 6,
    intro: t(
      "Ogohlantirishlar faqat qoida bor narsani ko‘radi. Tahdid izlash (threat hunting) — qoidalar sezmagan hujumchi tarmoqda allaqachon bor deb faraz qilib, uni faol qidirish. Ovchi ogohlantirishni kutmaydi: savol qo‘yadi va ma’lumotlardan javob qidiradi.",
      "Alerts only see what a rule exists for. Threat hunting means assuming an attacker the rules missed is already inside, and actively looking for them. A hunter doesn’t wait for an alert: they ask a question and look for the answer in the data.",
    ),
    analogy: t(
      "Signalizatsiya chalinishini kutish o‘rniga, qo‘riqchi tunda binoni aylanib, ochiq qolgan derazalarni tekshiradi.",
      "Instead of waiting for the alarm, the guard walks the building at night checking for open windows.",
    ),
    theory: [
      t(
        "“Assume breach” — buzilish bo‘lgan deb hisoblash — ovchining asosiy tamoyili.",
        "“Assume breach” is the hunter’s starting point.",
      ),
    ],
    task: t(
      "Har biri tahdid izlashmi yoki ogohlantirishga javobmi?",
      "Is each one threat hunting, or answering an alert?",
    ),
    hint: t(
      "Ovchi savoldan boshlaydi; ogohlantirish qoidadan keladi.",
      "A hunter starts from a question; an alert comes from a rule.",
    ),
    widget: {
      type: "sort",
      buckets: [
        { id: "hunt", label: t("Tahdid izlash", "Threat hunting") },
        { id: "alert", label: t("Ogohlantirishga javob", "Alert handling") },
      ],
      items: [
        {
          label: t(
            "Hisobot o‘qib, “bizda ham shunday rejalashtirilgan vazifa bormi?” deb qidirish",
            "Reading a report and searching for “do we have that scheduled task too?”",
          ),
          bucket: "hunt",
        },
        {
          label: t(
            "Barcha kompyuterlardagi avtomatik ishga tushuvchi dasturlarni solishtirish",
            "Comparing the auto-start programs across every computer",
          ),
          bucket: "hunt",
        },
        {
          label: t(
            "Hech kim ishlatmaydigan eski hisoblar kirganini tekshirish",
            "Checking whether old, unused accounts have logged in",
          ),
          bucket: "hunt",
        },
        {
          label: t(
            "SIEM “brute force” ogohlantirishini ochib tekshirish",
            "Opening and checking a SIEM brute-force alert",
          ),
          bucket: "alert",
        },
        {
          label: t(
            "Antivirus xabar bergan faylni karantinda ko‘rish",
            "Looking at a file the antivirus quarantined",
          ),
          bucket: "alert",
        },
      ],
    },
  },
  {
    id: 2,
    group: IDEA,
    title: t("Gipoteza", "The hypothesis"),
    minutes: 6,
    intro: t(
      "Har bir izlash gipotezadan boshlanadi: aniq, tekshirib bo‘ladigan faraz. Yaxshi gipoteza nimani, qayerda va qaysi ma’lumotda qidirishni aytadi: “Agar hujumchi rejalashtirilgan vazifa bilan o‘rnashgan bo‘lsa, ishchi stansiyalarda C:\\Users\\Public’dan ishga tushadigan vazifa bor.”",
      "Every hunt starts from a hypothesis: a specific, testable guess. A good one says what to look for, where, and in which data: “If an attacker persisted with a scheduled task, a workstation has a task that runs from C:\\Users\\Public.”",
    ),
    analogy: t(
      "Detektiv: “kimdir aybdor” emas, “o‘g‘ri orqa eshikdan kirgan bo‘lsa, loyda iz qolgan” deydi — va borib ko‘radi.",
      "A detective doesn’t say “somebody did it” but “if the thief used the back door, there are prints in the mud” — and goes to look.",
    ),
    theory: [
      t(
        "Gipoteza manbalari: tahdid hisobotlari, ATT&CK, o‘tgan hodisalar, yangi zaifliklar.",
        "Hypotheses come from threat reports, ATT&CK, past incidents and new vulnerabilities.",
      ),
    ],
    task: t(
      "Har biri yaxshi gipotezami yoki noaniqmi?",
      "Is each one a good hypothesis, or too vague?",
    ),
    hint: t(
      "Yaxshisi — nima, qayerda, qaysi ma’lumot.",
      "A good one names what, where and which data.",
    ),
    widget: {
      type: "sort",
      buckets: [
        { id: "good", label: t("Yaxshi", "Good") },
        { id: "vague", label: t("Noaniq", "Too vague") },
      ],
      items: [
        {
          label: t(
            "Hujumchi RDP bilan harakatlangan bo‘lsa, ishchi stansiyalar orasida 4624 LogonType 10 kirishlar bor",
            "If an attacker moved over RDP, there are 4624 LogonType 10 logons between workstations",
          ),
          bucket: "good",
        },
        {
          label: t(
            "Ma’lumot bulutga chiqarilgan bo‘lsa, proxy loglarida bir kompyuterdan mega.nz’ga katta yuklash bor",
            "If data was sent to the cloud, the proxy logs show one PC uploading a lot to mega.nz",
          ),
          bucket: "good",
        },
        {
          label: t(
            "Bizni buzishgan bo‘lishi mumkin",
            "We might have been hacked",
          ),
          bucket: "vague",
        },
        {
          label: t(
            "Tarmoqda nimadir g‘alati",
            "Something on the network is odd",
          ),
          bucket: "vague",
        },
      ],
    },
  },
  {
    id: 3,
    group: MAP,
    title: t("Hisobotni xaritaga tushirish", "Mapping a report"),
    minutes: 10,
    intro: t(
      "MITRE ATT&CK — haqiqiy hujumlardan yig‘ilgan taktika (maqsad: “o‘rnashish”) va texnikalar (usul: “rejalashtirilgan vazifa”) bazasi. Tahdid hisobotidagi har bir harakatni ATT&CK texnikasiga aylantirsangiz, izlash rejasi tayyor: har bir texnika — bitta gipoteza.",
      "MITRE ATT&CK is a knowledge base of tactics (the goal, such as “persistence”) and techniques (the method, such as “scheduled task”) gathered from real attacks. Turn each behaviour in a threat report into an ATT&CK technique and you have a hunt plan: one technique, one hypothesis.",
    ),
    analogy: t(
      "Shaxmat ochilishlari kitobi: raqib qaysi ochilishni o‘ynashini bilsangiz, javobni oldindan tayyorlaysiz.",
      "A book of chess openings: know which opening your opponent plays and you prepare your answer in advance.",
    ),
    theory: [
      t(
        "ATT&CK Navigator’da texnikalarni rang bilan belgilab “qatlam” (layer) yasaladi — bu yerda ham xuddi shunday.",
        "In ATT&CK Navigator you colour techniques to make a “layer” — the same as here.",
      ),
    ],
    task: t(
      "Hisobotdagi to‘rtta harakatni matritsada belgilang.",
      "Mark the report’s four behaviours on the matrix.",
    ),
    hint: t("Har bir harakatga bitta texnika.", "One technique per behaviour."),
    widget: { type: "matrix" },
  },
  {
    id: 4,
    group: MAP,
    title: t("Texnika sahifasi", "A technique’s page"),
    minutes: 6,
    intro: t(
      "ATT&CK’dagi har bir texnikaning sahifasi bor: ID, qaysi taktikaga tegishli, qaysi guruhlar ishlatgan, qanday aniqlash mumkin (ma’lumot manbalari) va qanday oldini olish mumkin (himoya choralari). Ovchi uchun eng muhimi — ma’lumot manbalari: qayerdan qidirish.",
      "Every ATT&CK technique has a page: the ID, the tactic it belongs to, the groups known to use it, how to detect it (data sources) and how to prevent it (mitigations). For a hunter the key part is the data sources: where to look.",
    ),
    analogy: t(
      "Dori qo‘llanmasi: nomi, nimaga qarshi, nojo‘ya ta’siri, qanday tekshirish.",
      "A medicine leaflet: its name, what it treats, side effects, how to check it works.",
    ),
    theory: [
      t(
        "T1053 — texnika, .005 — subtexnika: rejalashtirilgan vazifalarning Windows Task Scheduler turi.",
        "T1053 is the technique and .005 the sub-technique: the Windows Task Scheduler kind of scheduled task.",
      ),
    ],
    task: t(
      "Sahifaning har bir qismini bosib, nima ekanini o‘qing.",
      "Click each part of the page and read what it is.",
    ),
    hint: t("Hammasi bo‘lib beshta qism.", "Five parts in all."),
    widget: {
      type: "anatomy",
      lines: [
        [
          { text: "T1053.005", id: "id" },
          { text: "  Scheduled Task/Job: Scheduled Task" },
        ],
        [
          {
            text: "Tactics: Execution, Persistence, Privilege Escalation",
            id: "tactics",
          },
        ],
        [
          {
            text: "Procedure examples: APT29, FIN7, Lazarus Group …",
            id: "groups",
          },
        ],
        [
          {
            text: "Data sources: Windows event 4698, Sysmon 1 (schtasks.exe), Task Scheduler files",
            id: "data",
          },
        ],
        [
          {
            text: "Mitigations: M1026 Privileged Account Management",
            id: "mitigation",
          },
        ],
      ],
      parts: [
        {
          id: "id",
          title: t("ID", "The ID"),
          body: t(
            "T1053 — texnika, .005 — subtexnika. Hisobotlar va qoidalar shu ID bilan bog‘lanadi.",
            "T1053 is the technique, .005 the sub-technique. Reports and rules link up through this ID.",
          ),
        },
        {
          id: "tactics",
          title: t("Taktikalar", "Tactics"),
          body: t(
            "Bitta texnika bir nechta maqsadga xizmat qilishi mumkin.",
            "One technique can serve several goals.",
          ),
        },
        {
          id: "groups",
          title: t("Guruhlar", "Groups"),
          body: t(
            "Buni ishlatgani ma’lum bo‘lgan hujumchi guruhlar — sizning sohangizga qaysi biri xavfli ekanini ko‘rasiz.",
            "Attacker groups known to use it — you see which ones matter to your sector.",
          ),
        },
        {
          id: "data",
          title: t("Ma’lumot manbalari", "Data sources"),
          body: t(
            "Ovchi uchun eng muhim qism: qaysi log va hodisalardan qidirish kerak.",
            "The hunter’s key part: which logs and events to search.",
          ),
        },
        {
          id: "mitigation",
          title: t("Himoya choralari", "Mitigations"),
          body: t(
            "Texnikani qiyinlashtiradigan sozlamalar — izlashdan keyin tavsiya sifatida.",
            "Settings that make the technique harder — for your recommendations after the hunt.",
          ),
        },
      ],
    },
  },
  {
    id: 5,
    group: HUNT,
    title: t("Kam uchraydiganini topish", "Finding the rare one"),
    minutes: 10,
    intro: t(
      "Stacking (yig‘ib sanash) — oddiy, lekin kuchli usul: barcha kompyuterlardan bir xil narsani (rejalashtirilgan vazifalar, avtoyuklanish, xizmatlar) yig‘ib, qiymat bo‘yicha sanaysiz. Hamma joyda bor narsa odatda oddiy; faqat bitta-ikkita kompyuterda bor narsa — tekshirishga arziydi.",
      "Stacking is simple but strong: collect the same thing (scheduled tasks, auto-starts, services) from every computer and count by value. What is everywhere is usually normal; what exists on only one or two machines is worth a look.",
    ),
    analogy: t(
      "Maktab formasidagi 400 o‘quvchi orasida qizil kurtkali bitta odamni ko‘rish oson.",
      "Among 400 pupils in school uniform, the one person in a red jacket is easy to spot.",
    ),
    theory: [
      t(
        "Nomga emas, buyruqqa qarang: hujumchilar vazifani “WindowsUpdate…” kabi tanish nom bilan yashiradi.",
        "Look at the command, not the name: attackers hide tasks under familiar names like “WindowsUpdate…”.",
      ),
    ],
    task: t(
      "40 ta kompyuterdagi vazifalar ichidan begonasini toping.",
      "Find the task that doesn’t belong among the forty computers.",
    ),
    hint: t(
      "Eng kam uchraydiganini, keyin uning buyrug‘ini ko‘ring.",
      "Take the rarest, then look at its command.",
    ),
    widget: { type: "stack" },
  },
  {
    id: 6,
    group: HUNT,
    title: t("Indikatorlar va almashish", "Indicators and sharing"),
    minutes: 6,
    intro: t(
      "Izlash davomida indikatorlar topiladi: fayl xeshi, domen, IP, vazifa nomi. IOC (indicator of compromise) — buzilish bo‘lganini ko‘rsatadi; IOA (indicator of attack) — hujum harakatini (masalan, Public papkasidan vazifa yaratish). Indikatorlar boshqa tashkilotlar bilan MISP yoki STIX/TAXII orqali almashiladi.",
      "Hunts turn up indicators: file hashes, domains, IPs, task names. An IOC (indicator of compromise) shows a breach happened; an IOA (indicator of attack) describes attacker behaviour (such as creating a task that runs from the Public folder). Indicators are shared with other organisations through MISP or STIX/TAXII.",
    ),
    analogy: t(
      "Qo‘shni do‘konlar firibgar suratini bir-biriga yuborishadi.",
      "Neighbouring shops pass a fraudster’s photo to one another.",
    ),
    theory: [
      t(
        "TLP (Traffic Light Protocol) belgisi ma’lumotni kim bilan bo‘lishish mumkinligini aytadi: TLP:RED — faqat qabul qilganlar, TLP:CLEAR — hammaga.",
        "A TLP (Traffic Light Protocol) label says who may see shared information: TLP:RED is for the named recipients only, TLP:CLEAR for everyone.",
      ),
    ],
    task: t("Savollarga javob bering.", "Answer the questions."),
    hint: t(
      "IOC — iz; IOA — harakat.",
      "An IOC is a trace; an IOA is a behaviour.",
    ),
    widget: {
      type: "quiz",
      questions: [
        {
          ask: t(
            "“C:\\Users\\Public’dan ishga tushadigan vazifa yaratish” — IOC yoki IOA?",
            "“Creating a task that runs from C:\\Users\\Public” — IOC or IOA?",
          ),
          options: [code("IOA"), code("IOC"), t("Hech qaysi", "Neither")],
          answer: 0,
          explain: t(
            "U aniq qiymat emas, harakatni tasvirlaydi.",
            "It describes a behaviour, not an exact value.",
          ),
        },
        {
          ask: t(
            "Hamkorlardan TLP:RED belgili hisobot oldingiz. Uni ommaviy blogda e’lon qilish mumkinmi?",
            "Partners sent you a report labelled TLP:RED. May you post it on a public blog?",
          ),
          options: [
            t(
              "Yo‘q — faqat nomlangan qabul qiluvchilar uchun",
              "No — it is for the named recipients only",
            ),
            t("Ha", "Yes"),
            t("Ha, ismlarni o‘chirsangiz", "Yes, with names removed"),
          ],
          answer: 0,
          explain: t(
            "TLP:CLEAR — hammaga ochiq.",
            "TLP:CLEAR is the one for everyone.",
          ),
        },
        {
          ask: t(
            "Indikatorlarni almashish uchun ochiq platforma?",
            "An open platform for sharing indicators?",
          ),
          options: [code("MISP"), code("RDP"), code("NTP")],
          answer: 0,
          explain: t(
            "STIX — format, TAXII — uzatish usuli.",
            "STIX is the format, TAXII the way it is sent.",
          ),
        },
      ],
    },
  },
  {
    id: 7,
    group: HUNT,
    title: t("Izlashdan keyin", "After the hunt"),
    minutes: 6,
    intro: t(
      "Izlash ikki xil tugaydi. Topildi — hodisa ochiladi va IR guruhiga topshiriladi. Topilmadi — bu ham natija: nima, qayerda va qaysi davrda tekshirilgani yoziladi. Har ikkala holatda ham izlash takrorlanadigan aniqlash qoidasiga aylantiriladi — keyingi safar ovchi emas, qoida topadi.",
      "A hunt ends in one of two ways. Found: an incident is opened and handed to incident response. Not found: that is a result too — write down what was checked, where and over which period. Either way, the hunt is turned into a repeatable detection rule, so next time a rule finds it, not a hunter.",
    ),
    analogy: t(
      "Shifokor tekshiruvi: kasallik topilmasa ham, nima tekshirilgani kartaga yoziladi.",
      "A medical check-up: even when nothing is found, the tests done go into the record.",
    ),
    theory: [
      t(
        "Izlash davomida log yetishmasa (masalan, Sysmon yo‘q), bu ham topilma — yig‘ishni yaxshilash tavsiyasi.",
        "If logs were missing during the hunt (no Sysmon, say), that is a finding too — a recommendation to collect better.",
      ),
    ],
    task: t("Savollarga javob bering.", "Answer the questions."),
    hint: t(
      "Topilmagan natija ham yoziladi.",
      "A null result gets written down too.",
    ),
    widget: {
      type: "quiz",
      questions: [
        {
          ask: t(
            "Izlash hech narsa topmadi. Nima qilasiz?",
            "The hunt found nothing. What do you do?",
          ),
          options: [
            t(
              "Nima, qayerda va qaysi davrda tekshirilganini yozib, qoidaga aylantiraman",
              "Write down what was checked, where and over what period, and turn it into a rule",
            ),
            t("Hech narsa yozmayman", "Write nothing"),
            t("Izlash befoyda edi deb hisoblayman", "Call the hunt a waste"),
          ],
          answer: 0,
          explain: t(
            "Salbiy natija ham ishonch beradi va takrorlanadi.",
            "A null result still gives confidence and can be repeated.",
          ),
        },
        {
          ask: t(
            "Izlash FIN-PC-12 da begona vazifani topdi. Birinchi qadam?",
            "The hunt found a rogue task on FIN-PC-12. The first step?",
          ),
          options: [
            t(
              "Hodisa ochib, IR guruhiga topshirish",
              "Open an incident and hand it to incident response",
            ),
            t("Vazifani o‘chirib, unutish", "Delete the task and forget it"),
            t("Kompyuter egasiga yozish", "Message the PC’s owner"),
          ],
          answer: 0,
          explain: t(
            "Dalillarni saqlash va hujum ko‘lamini aniqlash kerak.",
            "Evidence must be kept and the scope of the attack found.",
          ),
        },
      ],
    },
  },
  {
    id: 8,
    group: HUNT,
    title: t("Yakuniy savollar", "Final questions"),
    minutes: 6,
    intro: t(
      "Modulni takrorlaymiz: izlash va ogohlantirish farqi, gipoteza, ATT&CK matritsasi va texnika sahifasi, stacking, indikatorlar va izlashdan keyingi qadamlar.",
      "A review of the module: hunting versus alerts, hypotheses, the ATT&CK matrix and a technique’s page, stacking, indicators and what follows a hunt.",
    ),
    analogy: t(
      "Ovchi iz qidiradi, lekin har bir izni xaritaga tushiradi.",
      "A hunter follows tracks, and marks every one on the map.",
    ),
    theory: [
      t(
        "Keyingi modulda hamma narsa boshlanadigan joyga qaytamiz: fishing xati.",
        "In the next module we go back to where it so often starts: a phishing email.",
      ),
    ],
    task: t(
      "Barcha savollarga to‘g‘ri javob bering.",
      "Answer every question correctly.",
    ),
    hint: t(
      "Taktika — maqsad; texnika — usul.",
      "A tactic is the goal; a technique is the method.",
    ),
    widget: {
      type: "quiz",
      questions: [
        {
          ask: t(
            "ATT&CK’da taktika va texnika farqi?",
            "Tactic versus technique in ATT&CK?",
          ),
          options: [
            t(
              "Taktika — maqsad, texnika — unga erishish usuli",
              "A tactic is the goal, a technique the way to reach it",
            ),
            t("Farqi yo‘q", "No difference"),
            t("Taktika — dastur nomi", "A tactic is a program name"),
          ],
          answer: 0,
          explain: t(
            "Persistence — taktika, Scheduled Task — texnika.",
            "Persistence is a tactic; Scheduled Task is a technique.",
          ),
        },
        {
          ask: t(
            "Stacking’da nima shubhali?",
            "What is suspicious when stacking?",
          ),
          options: [
            t(
              "Faqat bitta-ikkita kompyuterda uchraydigan qiymat",
              "A value found on only one or two machines",
            ),
            t("Hamma kompyuterda bor qiymat", "A value on every machine"),
            t("Eng uzun nom", "The longest name"),
          ],
          answer: 0,
          explain: t(
            "Kam uchraydigan — tekshirishga arziydi.",
            "The rare one is worth a look.",
          ),
        },
        {
          ask: t(
            "Yaxshi gipoteza nimani aytadi?",
            "What does a good hypothesis say?",
          ),
          options: [
            t(
              "Nima, qayerda va qaysi ma’lumotda qidirishni",
              "What to look for, where, and in which data",
            ),
            t(
              "“Bizni buzishgan bo‘lishi mumkin”",
              "“We might have been hacked”",
            ),
            t("Hujumchi ismini", "The attacker’s name"),
          ],
          answer: 0,
          explain: t("Tekshirib bo‘ladigan faraz.", "A guess you can test."),
        },
        {
          ask: t(
            "Ovchi uchun texnika sahifasining eng muhim qismi?",
            "The most useful part of a technique’s page for a hunter?",
          ),
          options: [
            t("Ma’lumot manbalari", "The data sources"),
            t("Sahifa rangi", "The page colour"),
            t("Yaratilgan sana", "The date created"),
          ],
          answer: 0,
          explain: t("Qayerdan qidirishni aytadi.", "They say where to look."),
        },
      ],
    },
  },
];
