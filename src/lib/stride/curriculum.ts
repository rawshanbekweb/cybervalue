// Academy Intermediate · AppSec, module 1: Threat modelling. The lessons use
// ./tools.ts: a school grades app as a data-flow diagram with trust zones,
// and six threats to sort into STRIDE.
import type { CommonWidget, Lesson, Text } from "../anim-lab/types";

export type Widget = CommonWidget | { type: "boundary" } | { type: "stride" };

export const PROGRESS_KEY = "cybervalue:stride:progress:v1";

const t = (uz: string, en: string): Text => ({ uz, en });
const code = (s: string): Text => ({ uz: s, en: s });

const DRAW = t("Chizish", "Drawing it");
const FIND = t("Topish", "Finding threats");
const ACT = t("Harakat", "Acting on it");

export const LESSONS: Lesson<Widget>[] = [
  {
    id: 1,
    group: DRAW,
    title: t("To‘rt savol", "Four questions"),
    minutes: 6,
    intro: t(
      "Tahdid modeli — dastur yozilishidan oldin “nima noto‘g‘ri ketishi mumkin?” deb so‘rash. Uning asosi to‘rtta savol: Biz nima qurayapmiz? Nima noto‘g‘ri ketishi mumkin? Bunga qarshi nima qilamiz? Yaxshi ish qildikmi? Loyiha bosqichida topilgan xato kod yozilgandan keyin topilganidan o‘nlab marta arzon.",
      "Threat modelling means asking “what can go wrong?” before the code is written. It rests on four questions: What are we working on? What can go wrong? What are we going to do about it? Did we do a good job? A flaw found at design time costs a fraction of one found after release.",
    ),
    analogy: t(
      "Uy qurishdan oldin chizmaga qarab: “o‘g‘ri qayerdan kirishi mumkin?” deb so‘rash — devor qurilgandan keyin emas.",
      "Asking “where could a burglar get in?” over the blueprints, not after the walls are up.",
    ),
    theory: [
      t(
        "Tahdid modeli bir marta emas: har bir katta o‘zgarishda yangilanadi.",
        "A threat model isn’t a one-off: it is updated with every big change.",
      ),
    ],
    task: t("Savollarga javob bering.", "Answer the questions."),
    hint: t("Erta — arzon.", "Early is cheap."),
    widget: {
      type: "quiz",
      questions: [
        {
          ask: t(
            "Tahdid modelini qachon qilish eng foydali?",
            "When is threat modelling most useful?",
          ),
          options: [
            t("Loyiha bosqichida", "At design time"),
            t("Buzilishdan keyin", "After a breach"),
            t("Hech qachon", "Never"),
          ],
          answer: 0,
          explain: t(
            "Chizmadagi xatoni tuzatish arzon.",
            "A flaw on the drawing is cheap to fix.",
          ),
        },
        {
          ask: t(
            "To‘rt savolning ikkinchisi?",
            "The second of the four questions?",
          ),
          options: [
            t("Nima noto‘g‘ri ketishi mumkin?", "What can go wrong?"),
            t("Kim aybdor?", "Who is to blame?"),
            t("Qancha turadi?", "How much does it cost?"),
          ],
          answer: 0,
          explain: t(
            "Avval nima qurilayotgani, keyin nima buzilishi mumkinligi.",
            "First what you are building, then what can break.",
          ),
        },
      ],
    },
  },
  {
    id: 2,
    group: DRAW,
    title: t("Ma’lumot oqimi diagrammasi", "The data-flow diagram"),
    minutes: 6,
    intro: t(
      "Tizimni to‘rt xil element bilan chizamiz: tashqi obyekt (foydalanuvchi, tashqi xizmat), jarayon (sizning kodingiz), ma’lumot ombori (baza, fayl) va ma’lumot oqimi (so‘rov, javob). Bu diagramma — DFD — tahdidlar qayerda paydo bo‘lishini ko‘rsatadi.",
      "We draw the system with four kinds of element: external entities (users, outside services), processes (your code), data stores (databases, files) and data flows (requests, responses). This data-flow diagram — a DFD — shows where threats can appear.",
    ),
    analogy: t(
      "Shahar suv tarmog‘i chizmasi: manba, nasos stansiyasi, suv ombori va quvurlar.",
      "A city’s water map: the source, the pumping stations, the reservoirs and the pipes.",
    ),
    theory: [
      t(
        "Chizish uchun OWASP Threat Dragon yoki Microsoft Threat Modeling Tool bepul.",
        "OWASP Threat Dragon and the Microsoft Threat Modeling Tool are free for drawing them.",
      ),
    ],
    task: t(
      "Har bir narsa DFD’da qaysi element?",
      "Which DFD element is each thing?",
    ),
    hint: t(
      "Kod — jarayon; baza — ombor; foydalanuvchi — tashqi.",
      "Code is a process; a database is a store; a user is external.",
    ),
    widget: {
      type: "sort",
      buckets: [
        { id: "external", label: t("Tashqi obyekt", "External entity") },
        { id: "process", label: t("Jarayon", "Process") },
        { id: "store", label: t("Ombor", "Data store") },
        { id: "flow", label: t("Oqim", "Data flow") },
      ],
      items: [
        {
          label: t("O‘quvchi brauzeri", "The student’s browser"),
          bucket: "external",
        },
        { label: t("SMS provayderi", "The SMS provider"), bucket: "external" },
        { label: t("Baholar API’si", "The grades API"), bucket: "process" },
        {
          label: t("PostgreSQL bazasi", "The PostgreSQL database"),
          bucket: "store",
        },
        { label: code("POST /api/grades"), bucket: "flow" },
      ],
    },
  },
  {
    id: 3,
    group: DRAW,
    title: t("Ishonch chegaralari", "Trust boundaries"),
    minutes: 10,
    intro: t(
      "Ishonch chegarasi — ma’lumot bir ishonch darajasidan boshqasiga o‘tadigan joy: internetdan DMZ’ga, DMZ’dan ichki tarmoqqa, sizning tizimingizdan tashqi xizmatga. Hujumlar ko‘pincha aynan shu chegaralarda bo‘ladi, shuning uchun har bir kesib o‘tuvchi oqim tekshiriladi: kim yubordi, nima keldi, shifrlanganmi?",
      "A trust boundary is where data moves from one level of trust to another: from the internet into the DMZ, from the DMZ into the internal network, from your system out to a third party. Attacks happen at these boundaries, so every flow that crosses one is checked: who sent it, what arrived, is it encrypted?",
    ),
    analogy: t(
      "Aeroportdagi chegara: pasport nazorati faqat bir zonadan boshqasiga o‘tishda.",
      "Passport control at an airport: you are checked only where you pass from one zone to the next.",
    ),
    theory: [
      t(
        "Bir zona ichidagi oqimlar ham xavfsiz emas, lekin chegaradagilar — birinchi navbatda.",
        "Flows inside one zone aren’t automatically safe, but the ones at a boundary come first.",
      ),
    ],
    task: t(
      "Diagrammadagi qaysi oqimlar ishonch chegarasini kesib o‘tadi?",
      "Which flows in the diagram cross a trust boundary?",
    ),
    hint: t(
      "Ikki uchi turli zonada bo‘lgan oqim.",
      "A flow whose two ends sit in different zones.",
    ),
    widget: { type: "boundary" },
  },
  {
    id: 4,
    group: FIND,
    title: t("STRIDE", "STRIDE"),
    minutes: 6,
    intro: t(
      "STRIDE — tahdidlarni oltita turga ajratadigan mnemonika. Har bir tur bitta xavfsizlik xususiyatini buzadi: Spoofing — autentifikatsiya; Tampering — yaxlitlik; Repudiation — inkor qilib bo‘lmaslik; Information disclosure — maxfiylik; Denial of service — mavjudlik; Elevation of privilege — avtorizatsiya.",
      "STRIDE is a mnemonic that sorts threats into six kinds. Each breaks one security property: Spoofing breaks authentication; Tampering, integrity; Repudiation, non-repudiation; Information disclosure, confidentiality; Denial of service, availability; Elevation of privilege, authorisation.",
    ),
    analogy: t(
      "Shifokorning tekshiruv ro‘yxati: yurak, o‘pka, qon — hech narsa unutilmasin.",
      "A doctor’s checklist: heart, lungs, blood — so nothing is forgotten.",
    ),
    theory: [
      t(
        "DFD’ning har bir elementi va chegaradagi har bir oqim uchun oltita harfni ketma-ket so‘rang.",
        "Ask all six letters for every element of the DFD and every flow at a boundary.",
      ),
    ],
    task: t("Savollarga javob bering.", "Answer the questions."),
    hint: t("Har bir harf — bitta xususiyat.", "Each letter is one property."),
    widget: {
      type: "quiz",
      questions: [
        {
          ask: t(
            "Tampering qaysi xususiyatni buzadi?",
            "Which property does tampering break?",
          ),
          options: [
            t("Yaxlitlik", "Integrity"),
            t("Mavjudlik", "Availability"),
            t("Maxfiylik", "Confidentiality"),
          ],
          answer: 0,
          explain: t(
            "Ma’lumot yo‘lda o‘zgartiriladi.",
            "Data is changed on the way.",
          ),
        },
        {
          ask: t(
            "Denial of service qaysi xususiyatni buzadi?",
            "Which property does denial of service break?",
          ),
          options: [
            t("Mavjudlik", "Availability"),
            t("Autentifikatsiya", "Authentication"),
            t("Yaxlitlik", "Integrity"),
          ],
          answer: 0,
          explain: t(
            "Tizim foydalanuvchilar uchun ishlamay qoladi.",
            "The system stops working for its users.",
          ),
        },
        {
          ask: t(
            "Repudiation’ga qarshi asosiy chora?",
            "The main defence against repudiation?",
          ),
          options: [
            t(
              "Kim, nima, qachon qilganini yozib boradigan audit logi",
              "An audit log of who did what and when",
            ),
            t("Firewall", "A firewall"),
            t("Shifrlash", "Encryption"),
          ],
          answer: 0,
          explain: t(
            "Yozuv bo‘lsa, inkor qilib bo‘lmaydi.",
            "With a record, nobody can deny it.",
          ),
        },
      ],
    },
  },
  {
    id: 5,
    group: FIND,
    title: t("Tahdidlarni saralash", "Sorting the threats"),
    minutes: 10,
    intro: t(
      "Baholar ilovasi uchun yig‘ilgan oltita tahdid quyida. Har biriga STRIDE harfini bering. Ba’zi tahdidlar ikki turga o‘xshaydi — qaysi xususiyat birinchi buzilayotganiga qarang.",
      "Below are six threats gathered for the grades app. Give each one its STRIDE letter. Some look like two kinds — ask which property breaks first.",
    ),
    analogy: t(
      "Kasalliklarni tashxis bo‘yicha ajratish: alomat bir xil bo‘lishi mumkin, sabab boshqa.",
      "Sorting illnesses by diagnosis: the symptoms may match, the causes differ.",
    ),
    theory: [
      t(
        "STRIDE — fikrlash vositasi, qat’iy tasnif emas: muhimi, tahdid topilgani.",
        "STRIDE is a thinking aid, not a strict taxonomy: what matters is that the threat is found.",
      ),
    ],
    task: t(
      "Oltita tahdidning har biriga to‘g‘ri harfni tanlang.",
      "Give each of the six threats the right letter.",
    ),
    hint: t("Har bir harf bir marta ishlatiladi.", "Each letter is used once."),
    widget: { type: "stride" },
  },
  {
    id: 6,
    group: ACT,
    title: t("Choralar", "Mitigations"),
    minutes: 6,
    intro: t(
      "Har bir tahdidga chora tanlanadi: kamaytirish (masalan, MFA), yo‘q qilish (funksiyani olib tashlash), o‘tkazish (sug‘urta, provayder) yoki qabul qilish (xavf kichik, hujjatlashtiriladi). Odatiy choralar: Spoofing — MFA; Tampering — serverda tekshirish va imzo; Repudiation — audit log; Disclosure — faqat kerakli maydonlarni qaytarish; DoS — rate limit; EoP — har bir so‘rovda ruxsatni tekshirish.",
      "Each threat gets a response: reduce it (MFA, say), remove it (drop the feature), transfer it (insurance, a provider) or accept it (small risk, written down). Typical controls: Spoofing — MFA; Tampering — server-side validation and signatures; Repudiation — an audit log; Disclosure — return only the fields needed; DoS — rate limiting; EoP — an authorisation check on every request.",
    ),
    analogy: t(
      "Uydagi har bir xavfga o‘z chorasi: eshikka qulf, oshxonaga o‘t o‘chirgich, derazaga panjara.",
      "Each risk at home gets its own fix: a lock for the door, an extinguisher for the kitchen, bars for the window.",
    ),
    theory: [
      t(
        "Qabul qilingan xavf ham yoziladi: kim, nima uchun va qachon qayta ko‘riladi.",
        "An accepted risk is written down too: who accepted it, why, and when it is reviewed.",
      ),
    ],
    task: t("Savollarga javob bering.", "Answer the questions."),
    hint: t(
      "Harfga mos xususiyatni tiklang.",
      "Restore the property the letter breaks.",
    ),
    widget: {
      type: "quiz",
      questions: [
        {
          ask: t(
            "“O‘quvchi so‘rovdagi bahoni o‘zgartiradi” — chora?",
            "“A student edits the grade in the request” — the control?",
          ),
          options: [
            t(
              "Serverda kim bahoni o‘zgartirishi mumkinligini tekshirish",
              "Check on the server who may change a grade",
            ),
            t("Formani chiroyli qilish", "Make the form prettier"),
            t(
              "Brauzerda JavaScript tekshiruvi",
              "A JavaScript check in the browser",
            ),
          ],
          answer: 0,
          explain: t(
            "Brauzerdagi tekshiruvni chetlab o‘tish oson.",
            "Browser checks are easy to bypass.",
          ),
        },
        {
          ask: t(
            "“Bot sekundiga 10 000 so‘rov yuboradi” — chora?",
            "“A bot sends 10,000 requests a second” — the control?",
          ),
          options: [
            t("Rate limiting", "Rate limiting"),
            t("Uzunroq parol", "Longer passwords"),
            t("Audit log", "An audit log"),
          ],
          answer: 0,
          explain: t(
            "Bir manzildan keladigan so‘rovlar soni cheklanadi.",
            "Requests from one source are capped.",
          ),
        },
        {
          ask: t(
            "Xavf kichik, tuzatish qimmat. Nima qilasiz?",
            "The risk is small and the fix expensive. What do you do?",
          ),
          options: [
            t(
              "Qabul qilib, sababi va qayta ko‘rish sanasini yozasiz",
              "Accept it, writing down why and when to review it",
            ),
            t("Unutasiz", "Forget it"),
            t("Yashirasiz", "Hide it"),
          ],
          answer: 0,
          explain: t(
            "Qabul qilish — ongli qaror, e’tiborsizlik emas.",
            "Accepting is a decision, not neglect.",
          ),
        },
      ],
    },
  },
  {
    id: 7,
    group: ACT,
    title: t("Ustuvorlik", "Prioritising"),
    minutes: 6,
    intro: t(
      "Hamma tahdidni bir vaqtda tuzatib bo‘lmaydi. Xavf ≈ ehtimollik × ta’sir: o‘quvchilar o‘z bahosini o‘zgartira olishi (ehtimol yuqori, ta’sir katta) log formatidagi kichik xatodan oldin. Ko‘p jamoalar DREAD yoki CVSS kabi shkalalardan foydalanadi.",
      "You can’t fix every threat at once. Risk ≈ likelihood × impact: students able to change their own grades (likely, high impact) comes before a small log-format slip. Many teams use scales such as DREAD or CVSS.",
    ),
    analogy: t(
      "Tom oqsa va eshik g‘ichirlasa — avval tom.",
      "If the roof leaks and the door squeaks, fix the roof first.",
    ),
    theory: [
      t(
        "Natija — ro‘yxat: tahdid, xavf darajasi, chora, egasi, muddat.",
        "The output is a list: threat, risk level, control, owner, due date.",
      ),
    ],
    task: t("Savollarga javob bering.", "Answer the questions."),
    hint: t(
      "Ehtimollik va ta’sir — ikkalasi ham.",
      "Likelihood and impact — both.",
    ),
    widget: {
      type: "quiz",
      questions: [
        {
          ask: t(
            "Qaysi tahdid birinchi tuzatiladi?",
            "Which threat gets fixed first?",
          ),
          options: [
            t(
              "Har qanday o‘quvchi admin API’ni chaqira oladi",
              "Any student can call the admin API",
            ),
            t("Log vaqti bir soniya noaniq", "Log times are off by a second"),
            t("Xato sahifasi dizayni eski", "The error page design is dated"),
          ],
          answer: 0,
          explain: t("Oson va zarari katta.", "Easy to do and very damaging."),
        },
        {
          ask: t(
            "Tahdid ro‘yxatidagi har bir qatorga nima kerak?",
            "What does each row of the threat list need?",
          ),
          options: [
            t(
              "Xavf darajasi, chora, egasi va muddat",
              "A risk level, control, owner and due date",
            ),
            t("Faqat nomi", "Just a name"),
            t("Hech narsa", "Nothing"),
          ],
          answer: 0,
          explain: t(
            "Egasiz vazifa bajarilmaydi.",
            "A task without an owner doesn’t get done.",
          ),
        },
      ],
    },
  },
  {
    id: 8,
    group: ACT,
    title: t("Yakuniy savollar", "Final questions"),
    minutes: 6,
    intro: t(
      "Modulni takrorlaymiz: to‘rt savol, DFD elementlari, ishonch chegaralari, STRIDE, choralar va ustuvorlik.",
      "A review of the module: the four questions, DFD elements, trust boundaries, STRIDE, controls and priorities.",
    ),
    analogy: t(
      "Yaxshi tahdid modeli — yaxshi xarita: qayerda xavf borligini oldindan ko‘rsatadi.",
      "A good threat model is a good map: it shows the danger before you get there.",
    ),
    theory: [
      t(
        "Keyingi modulda xavfsiz kod yozishni o‘rganamiz.",
        "In the next module we learn to write secure code.",
      ),
    ],
    task: t(
      "Barcha savollarga to‘g‘ri javob bering.",
      "Answer every question correctly.",
    ),
    hint: t("S-T-R-I-D-E.", "S-T-R-I-D-E."),
    widget: {
      type: "quiz",
      questions: [
        {
          ask: t(
            "“O‘quvchi /api/admin/grades ni chaqira oladi” — STRIDE’ning qaysi harfi?",
            "“A student can call /api/admin/grades” — which STRIDE letter?",
          ),
          options: [code("E"), code("S"), code("D")],
          answer: 0,
          explain: t(
            "Elevation of privilege — ruxsatsiz huquq olish.",
            "Elevation of privilege — gaining rights you shouldn’t have.",
          ),
        },
        {
          ask: t("Ishonch chegarasi nima?", "What is a trust boundary?"),
          options: [
            t(
              "Ma’lumot bir ishonch darajasidan boshqasiga o‘tadigan joy",
              "Where data passes from one level of trust to another",
            ),
            t("Saytning chekkasi", "The edge of the page"),
            t("Parol uzunligi chegarasi", "A password-length limit"),
          ],
          answer: 0,
          explain: t(
            "Hujumlar aynan shu yerda bo‘ladi.",
            "That is where attacks happen.",
          ),
        },
        {
          ask: t(
            "DFD’da PostgreSQL bazasi qaysi element?",
            "In a DFD, which element is a PostgreSQL database?",
          ),
          options: [
            t("Ma’lumot ombori", "A data store"),
            t("Jarayon", "A process"),
            t("Tashqi obyekt", "An external entity"),
          ],
          answer: 0,
          explain: t("Ma’lumot saqlanadigan joy.", "Where data rests."),
        },
        {
          ask: t(
            "Information disclosure’ga qarshi odatiy chora?",
            "A typical control for information disclosure?",
          ),
          options: [
            t(
              "Javobda faqat kerakli maydonlarni qaytarish",
              "Return only the fields that are needed",
            ),
            t("Rate limiting", "Rate limiting"),
            t("Audit log", "An audit log"),
          ],
          answer: 0,
          explain: t(
            "Qaytarilmagan ma’lumot sizmaydi.",
            "Data never sent can’t leak.",
          ),
        },
      ],
    },
  },
];
