// Academy Intermediate · Digital forensics, module 5: Writing the report.
// The lessons use ./tools.ts: the order of a report's sections and one
// finding built from the right pieces.
import type { CommonWidget, Lesson, Text } from "../anim-lab/types";

export type Widget = CommonWidget | { type: "outline" } | { type: "finding" };

export const PROGRESS_KEY = "cybervalue:report:progress:v1";

const t = (uz: string, en: string): Text => ({ uz, en });

const READERS = t("O‘quvchilar", "The readers");
const WRITING = t("Yozish", "Writing");
const SHARING = t("Topshirish", "Handing it over");

export const LESSONS: Lesson<Widget>[] = [
  {
    id: 1,
    group: READERS,
    title: t("Hisobotni kim o‘qiydi", "Who reads the report"),
    minutes: 6,
    intro: t(
      "Bitta hisobotni turli odamlar turli maqsadda o‘qiydi. Rahbar bir sahifada qaror qabul qilmoqchi; muhandis nimani tuzatishni bilmoqchi; yurist esa dalil qanday olingani va saqlanganini tekshiradi. Yaxshi hisobot har biriga kerakli bo‘limni beradi.",
      "Different people read the same report for different reasons. A manager wants to decide from one page; an engineer wants to know what to fix; a lawyer checks how the evidence was taken and kept. A good report gives each of them the section they need.",
    ),
    analogy: t(
      "Gazeta: sarlavhani hamma o‘qiydi, maqolani — qiziqqanlar, jadvallarni — mutaxassislar.",
      "A newspaper: everyone reads the headline, the interested read the article, specialists read the tables.",
    ),
    theory: [
      t(
        "Qisqacha xulosa oxirida yoziladi, lekin birinchi turadi.",
        "The executive summary is written last but comes first.",
      ),
    ],
    task: t(
      "Har bir o‘quvchi birinchi navbatda qaysi bo‘limni o‘qiydi?",
      "Which section does each reader turn to first?",
    ),
    hint: t(
      "Rahbar — xulosa; muhandis — topilma va tavsiya; yurist — dalillar.",
      "Manager: summary; engineer: findings and recommendations; lawyer: evidence.",
    ),
    widget: {
      type: "sort",
      buckets: [
        { id: "summary", label: t("Qisqacha xulosa", "Executive summary") },
        {
          id: "technical",
          label: t("Topilmalar va tavsiyalar", "Findings and recommendations"),
        },
        { id: "evidence", label: t("Dalillar ilovasi", "Evidence appendix") },
      ],
      items: [
        { label: t("Bosh direktor", "The chief executive"), bucket: "summary" },
        { label: t("Kengash a’zosi", "A board member"), bucket: "summary" },
        {
          label: t("Tizim administratori", "The system administrator"),
          bucket: "technical",
        },
        {
          label: t("Dasturchilar jamoasi", "The development team"),
          bucket: "technical",
        },
        {
          label: t("Kompaniya yuristi", "The company lawyer"),
          bucket: "evidence",
        },
        {
          label: t("Sud eksperti", "A court-appointed expert"),
          bucket: "evidence",
        },
      ],
    },
  },
  {
    id: 2,
    group: READERS,
    title: t("Bo‘limlar tartibi", "The order of sections"),
    minutes: 10,
    intro: t(
      "Hisobot odatda shunday tuziladi: qisqacha xulosa, qamrov va usullar, xronologiya, topilmalar, tavsiyalar va ilovalar. O‘quvchi yuqoridan pastga o‘qiydi va istalgan joyda to‘xtashi mumkin — eng muhimi tepada.",
      "A report is usually laid out like this: executive summary, scope and method, timeline, findings, recommendations and appendices. Readers go from the top and may stop anywhere — so the most important part comes first.",
    ),
    analogy: t(
      "Teskari piramida: avval asosiy xabar, keyin tafsilotlar, eng oxirida — ma’lumotnoma.",
      "An inverted pyramid: the main news first, then the details, and the reference material last.",
    ),
    theory: [
      t(
        "Qamrov bo‘limi “nima tekshirilmadi”ni ham yozadi — bu keyingi bahslarning oldini oladi.",
        "The scope section also says what was not examined — that heads off arguments later.",
      ),
    ],
    task: t(
      "Qoralamadagi bo‘limlarni to‘g‘ri tartibga qo‘ying.",
      "Put the draft’s sections in the right order.",
    ),
    hint: t(
      "Xulosa → qamrov → xronologiya → topilmalar → tavsiyalar → ilovalar.",
      "Summary → scope → timeline → findings → recommendations → appendices.",
    ),
    widget: { type: "outline" },
  },
  {
    id: 3,
    group: WRITING,
    title: t("Fakt va fikr", "Fact and opinion"),
    minutes: 8,
    intro: t(
      "Topilma — dalil bilan tasdiqlangan fakt. “Ehtimol”, “menimcha”, “aniq shu odam” kabi so‘zlar alohida belgilanadi yoki umuman yozilmaydi. Bitta asossiz da’vo butun hisobotga bo‘lgan ishonchni yo‘q qiladi.",
      "A finding is a fact backed by evidence. Words like “probably”, “I think” or “definitely this person” are labelled as such or left out. One unfounded claim destroys trust in the whole report.",
    ),
    analogy: t(
      "Sudda guvoh “ko‘rdim” va “shunday deb o‘ylayman”ni farqlashi kerak.",
      "In court a witness must keep “I saw” apart from “I think”.",
    ),
    theory: [
      t(
        "Atribusiya (kim hujum qilgan) — eng qiyin savol. IP manzil odamni emas, qurilmani ko‘rsatadi, u ham VPN yoki buzilgan kompyuter bo‘lishi mumkin.",
        "Attribution (who attacked) is the hardest question. An IP address points to a device, not a person — and that may be a VPN or a hacked computer.",
      ),
    ],
    task: t(
      "Har bir jumla — fakt yoki tekshirilmagan fikr?",
      "Is each sentence a fact or an unchecked opinion?",
    ),
    hint: t("Dalilga havola bormi?", "Does it point to evidence?"),
    widget: {
      type: "sort",
      buckets: [
        { id: "fact", label: t("Fakt", "Fact") },
        {
          id: "opinion",
          label: t(
            "Fikr — belgilash yoki olib tashlash",
            "Opinion — label it or drop it",
          ),
        },
      ],
      items: [
        {
          label: t(
            "auth.log’da 02:13:55 UTC da root kirishi bor (E-03)",
            "auth.log shows a root login at 02:13:55 UTC (E-03)",
          ),
          bucket: "fact",
        },
        {
          label: t(
            "shell.php fayli 02:11:03 UTC da yaratilgan (E-05)",
            "shell.php was created at 02:11:03 UTC (E-05)",
          ),
          bucket: "fact",
        },
        {
          label: t(
            "/etc/crontab’ga miner qatori qo‘shilgan (E-07)",
            "A miner line was added to /etc/crontab (E-07)",
          ),
          bucket: "fact",
        },
        {
          label: t(
            "Hujumchi juda tajribali bo‘lsa kerak",
            "The attacker must be very experienced",
          ),
          bucket: "opinion",
        },
        {
          label: t(
            "Buni ishdan ketgan sobiq xodim qilgan",
            "A former employee who left did this",
          ),
          bucket: "opinion",
        },
        {
          label: t(
            "203.0.113.7 — hujumchining uy manzili",
            "203.0.113.7 is the attacker’s home address",
          ),
          bucket: "opinion",
        },
      ],
    },
  },
  {
    id: 4,
    group: WRITING,
    title: t("Bitta topilmani yozish", "Writing one finding"),
    minutes: 12,
    intro: t(
      "Yaxshi topilma to‘rt qismdan iborat: nima bo‘lgan (vaqt UTC’da), dalil havolasi, ta’siri oddiy tilda va aniq tavsiya. Taxminlar va maxfiy ma’lumotlar (parollar, shaxsiy ma’lumotlar) unga kirmaydi.",
      "A good finding has four parts: what happened (with the time in UTC), a pointer to the evidence, the impact in plain words and a concrete recommendation. Guesses and secrets (passwords, personal data) stay out.",
    ),
    analogy: t(
      "Shifokor xulosasi: tashxis, tahlil natijasi, bemor uchun nimani anglatadi va davolash.",
      "A doctor’s note: the diagnosis, the test result, what it means for the patient, and the treatment.",
    ),
    theory: [
      t(
        "Har bir dalilga raqam beriladi (E-01, E-02…) va ilovada xeshi bilan ro‘yxatlanadi.",
        "Every item of evidence gets a number (E-01, E-02…) and is listed with its hash in an appendix.",
      ),
    ],
    task: t(
      "Topilmaga faqat kerakli qismlarni qo‘shing.",
      "Add only the parts that belong in the finding.",
    ),
    hint: t(
      "Nima, dalil, ta’sir, tavsiya — ha; taxmin va parol — yo‘q.",
      "What, evidence, impact, recommendation — yes; the guess and the password — no.",
    ),
    widget: { type: "finding" },
  },
  {
    id: 5,
    group: WRITING,
    title: t(
      "Bajarsa bo‘ladigan tavsiyalar",
      "Recommendations people can act on",
    ),
    minutes: 6,
    intro: t(
      "“Xavfsizlikni yaxshilash” — tavsiya emas. Tavsiya kimdir ertaga bajara oladigan aniq harakat: nima, kim va qachongacha. Eng muhimlari birinchi, va har biri topilmaga bog‘langan.",
      "“Improve security” is not a recommendation. A recommendation is a concrete action someone can start tomorrow: what, who and by when. The most important come first, and each one ties back to a finding.",
    ),
    analogy: t(
      "“Sog‘lom ovqatlaning” va “har kuni kechki ovqatga sabzavot qo‘shing” — ikkinchisini bajarish oson.",
      "“Eat healthily” versus “add vegetables to dinner every day” — the second is easy to act on.",
    ),
    theory: [
      t(
        "Qisqa muddatli (shu hafta) va uzoq muddatli (chorak) tavsiyalarni ajrating.",
        "Separate short-term (this week) from long-term (this quarter) recommendations.",
      ),
    ],
    task: t("Har bir tavsiyani ajrating.", "Sort each recommendation."),
    hint: t("Mas’ul va muddat bormi?", "Is there an owner and a date?"),
    widget: {
      type: "sort",
      buckets: [
        { id: "good", label: t("Bajarsa bo‘ladi", "Actionable") },
        { id: "vague", label: t("Juda umumiy", "Too vague") },
      ],
      items: [
        {
          label: t(
            "VPN’ga MFA yoqish — IT, 15-noyabrgacha",
            "Turn on MFA for the VPN — IT, by 15 November",
          ),
          bucket: "good",
        },
        {
          label: t(
            "upload.php’da fayl turini tekshirish — dasturchilar, 2 hafta",
            "Check file types in upload.php — developers, 2 weeks",
          ),
          bucket: "good",
        },
        {
          label: t(
            "Loglarni SIEM’ga yuborish — SOC, dekabr oxirigacha",
            "Ship logs to the SIEM — SOC, by the end of December",
          ),
          bucket: "good",
        },
        {
          label: t("Xavfsizlikni yaxshilash", "Improve security"),
          bucket: "vague",
        },
        {
          label: t("Ko‘proq ehtiyot bo‘lish", "Be more careful"),
          bucket: "vague",
        },
        {
          label: t("Yaxshiroq firewall olish", "Get a better firewall"),
          bucket: "vague",
        },
      ],
    },
  },
  {
    id: 6,
    group: SHARING,
    title: t("Qisqacha xulosa", "The executive summary"),
    minutes: 6,
    intro: t(
      "Rahbar ko‘pincha faqat birinchi sahifani o‘qiydi. Unda texnik jargon emas, javoblar bo‘lishi kerak: nima bo‘ldi, biznesga qanday ta’sir qildi, hozir holat qanday va rahbariyatdan nima kerak (qaror, byudjet, ruxsat).",
      "A manager often reads only the first page. It should hold answers, not jargon: what happened, how it affected the business, where things stand now and what is needed from management (a decision, a budget, an approval).",
    ),
    analogy: t(
      "Liftda 30 soniyalik suhbat: asosiy fikrni qisqa va aniq aytasiz.",
      "A 30-second chat in a lift: you say the main point, short and clear.",
    ),
    theory: [
      t(
        "Raqamlar yordam beradi: “23 ta ish stansiyasi, 6 soat to‘xtash, mijoz ma’lumotlari sizmagan”.",
        "Numbers help: “23 workstations, 6 hours of downtime, no customer data leaked”.",
      ),
    ],
    task: t("Savollarga javob bering.", "Answer the questions."),
    hint: t(
      "Ta’sir, holat va nima kerak.",
      "Impact, status and what is needed.",
    ),
    widget: {
      type: "quiz",
      questions: [
        {
          ask: t(
            "Qaysi biri yaxshi qisqacha xulosaning boshlanishi?",
            "Which is a good start to an executive summary?",
          ),
          options: [
            t(
              "“3-oktabrda web01 serveri buzildi; mijoz ma’lumotlari sizmagan, server 6 soatda tiklandi; MFA uchun byudjet kerak.”",
              "“On 3 October web01 was hacked; no customer data leaked, the server was back in 6 hours; MFA needs a budget.”",
            ),
            t(
              "“sshd[2211] PAM orqali root uchun session ochdi, keyin useradd UID=0 bilan…”",
              "“sshd[2211] opened a PAM session for root, then useradd with UID=0…”",
            ),
            t(
              "“Hammasi yaxshi, xavotirga o‘rin yo‘q.”",
              "“All is well, nothing to worry about.”",
            ),
          ],
          answer: 0,
          explain: t(
            "Nima, ta’sir, holat va so‘rov — bir necha jumlada.",
            "What, the impact, the status and the ask — in a few sentences.",
          ),
        },
        {
          ask: t(
            "Qisqacha xulosa qachon yoziladi?",
            "When is the executive summary written?",
          ),
          options: [
            t(
              "Oxirida, qolgan hammasi tayyor bo‘lgach",
              "Last, once everything else is ready",
            ),
            t("Birinchi, tahlildan oldin", "First, before the analysis"),
            t("Hech qachon", "Never"),
          ],
          answer: 0,
          explain: t(
            "Xulosa yozish uchun avval topilmalar kerak.",
            "You need the findings before you can sum them up.",
          ),
        },
      ],
    },
  },
  {
    id: 7,
    group: SHARING,
    title: t("Hisobotni xavfsiz topshirish", "Handing the report over safely"),
    minutes: 6,
    intro: t(
      "Hisobotda zaifliklar, IP manzillar va ichki tizimlar nomlari bor — u o‘zi maxfiy hujjat. U shifrlangan holda, faqat kerakli odamlarga yuboriladi. TLP (Traffic Light Protocol) belgisi uni qanchalik keng ulashish mumkinligini aytadi: RED — faqat qabul qiluvchi, AMBER — tashkilot ichida, GREEN — hamjamiyat, CLEAR — hamma.",
      "A report holds weaknesses, IP addresses and internal system names — it is a confidential document in itself. It goes out encrypted, only to the people who need it. A TLP (Traffic Light Protocol) label says how widely it may be shared: RED — the recipient only, AMBER — within the organisation, GREEN — the community, CLEAR — anyone.",
    ),
    analogy: t(
      "Bank seyfining sxemasi: uni e’lonlar taxtasiga osib qo‘ymaysiz.",
      "The plans of a bank vault: you don’t pin them to the notice board.",
    ),
    theory: [
      t(
        "Har bir versiya raqamlanadi va o‘zgarishlar jurnali yuritiladi.",
        "Every version is numbered and a change log is kept.",
      ),
    ],
    task: t("Savollarga javob bering.", "Answer the questions."),
    hint: t(
      "TLP:AMBER — faqat tashkilot ichida.",
      "TLP:AMBER is for inside the organisation only.",
    ),
    widget: {
      type: "quiz",
      questions: [
        {
          ask: t(
            "Hisobotda TLP:AMBER yozilgan. Uni hamkor kompaniyaning bloggeriga yuborish mumkinmi?",
            "The report is marked TLP:AMBER. May it be sent to a partner company’s blogger?",
          ),
          options: [
            t(
              "Yo‘q — faqat tashkilot ichida",
              "No — inside the organisation only",
            ),
            t("Ha, istalgan kishiga", "Yes, to anyone"),
            t("Ha, agar u so‘rasa", "Yes, if they ask"),
          ],
          answer: 0,
          explain: t(
            "CLEAR bo‘lsagina hamma bilan ulashiladi.",
            "Only CLEAR may be shared with everyone.",
          ),
        },
        {
          ask: t(
            "Hisobotni qanday yuborish to‘g‘ri?",
            "What is the right way to send the report?",
          ),
          options: [
            t(
              "Shifrlangan holda, faqat kerakli qabul qiluvchilarga",
              "Encrypted, only to the recipients who need it",
            ),
            t("Umumiy chatga yuklab", "Uploaded to the general chat"),
            t("Ochiq havola orqali", "Through a public link"),
          ],
          answer: 0,
          explain: t(
            "Hisobot — hujumchi uchun yo‘l xaritasi ham.",
            "A report is also a road map for an attacker.",
          ),
        },
      ],
    },
  },
  {
    id: 8,
    group: SHARING,
    title: t("Yakuniy savollar", "Final questions"),
    minutes: 6,
    intro: t(
      "Modulni va butun Raqamli kriminalistika domenini takrorlaymiz: o‘quvchilar, bo‘limlar, fakt va fikr, topilma, tavsiyalar, xulosa va xavfsiz topshirish.",
      "A review of the module and of the whole Digital forensics domain: readers, sections, fact and opinion, findings, recommendations, the summary and safe hand-over.",
    ),
    analogy: t(
      "Tergov — hikoya; hisobot — uni boshqalar tushunadigan va tekshira oladigan qilib aytib berish.",
      "An investigation is a story; the report tells it so others can understand and check it.",
    ),
    theory: [
      t(
        "Tabriklaymiz: Raqamli kriminalistika domeni tugadi.",
        "Congratulations: the Digital forensics domain is done.",
      ),
    ],
    task: t(
      "Barcha savollarga to‘g‘ri javob bering.",
      "Answer every question correctly.",
    ),
    hint: t("Dalil, ta’sir, harakat.", "Evidence, impact, action."),
    widget: {
      type: "quiz",
      questions: [
        {
          ask: t(
            "Hisobotning birinchi bo‘limi?",
            "The report’s first section?",
          ),
          options: [
            t("Qisqacha xulosa", "The executive summary"),
            t("Ilovalar", "The appendices"),
            t("Topilmalar", "The findings"),
          ],
          answer: 0,
          explain: t(
            "Rahbar ko‘pincha faqat uni o‘qiydi.",
            "Managers often read only that.",
          ),
        },
        {
          ask: t(
            "Topilmada nima bo‘lmasligi kerak?",
            "What should a finding leave out?",
          ),
          options: [
            t("Dalilsiz taxmin va parollar", "Unfounded guesses and passwords"),
            t("Dalil havolasi", "The evidence reference"),
            t("UTC vaqt", "The UTC time"),
          ],
          answer: 0,
          explain: t(
            "Taxmin ishonchni buzadi, parol esa xavfli.",
            "Guesses break trust; passwords are dangerous.",
          ),
        },
        {
          ask: t(
            "Qaysi tavsiya yaxshi yozilgan?",
            "Which recommendation is well written?",
          ),
          options: [
            t(
              "“Root’ga parol bilan kirishni o‘chirish — IT, 10-noyabrgacha”",
              "“Turn off root password logins — IT, by 10 November”",
            ),
            t("“Xavfsizlikni oshirish”", "“Raise security”"),
            t("“Diqqatli bo‘lish”", "“Pay attention”"),
          ],
          answer: 0,
          explain: t("Nima, kim va qachongacha.", "What, who and by when."),
        },
        {
          ask: t(
            "“203.0.113.7 — hujumchining uyi” — nega bunday yozib bo‘lmaydi?",
            "“203.0.113.7 is the attacker’s home” — why can’t you write that?",
          ),
          options: [
            t(
              "IP qurilmani ko‘rsatadi, odamni emas — u VPN yoki buzilgan kompyuter bo‘lishi mumkin",
              "An IP points to a device, not a person — it may be a VPN or a hacked computer",
            ),
            t("IP manzillar sir", "IP addresses are secret"),
            t("Yozish mumkin", "You can write that"),
          ],
          answer: 0,
          explain: t(
            "Atribusiya qo‘shimcha dalil talab qiladi.",
            "Attribution needs more evidence.",
          ),
        },
      ],
    },
  },
];
