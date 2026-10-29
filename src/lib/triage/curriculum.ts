// Academy Intermediate · Blue team, module 3: Alert triage. The lessons use
// ./tools.ts: a queue of five alerts with context, each to be escalated,
// closed or sent back to tune its rule.
import type { CommonWidget, Lesson, Text } from "../anim-lab/types";

export type Widget = CommonWidget | { type: "queue" };

export const PROGRESS_KEY = "cybervalue:triage:progress:v1";

const t = (uz: string, en: string): Text => ({ uz, en });

const ORDER = t("Tartib", "Order");
const JUDGE = t("Baholash", "Judging");
const HAND = t("Topshirish", "Handing over");

export const LESSONS: Lesson<Widget>[] = [
  {
    id: 1,
    group: ORDER,
    title: t("Nimadan boshlash", "What comes first"),
    minutes: 6,
    intro: t(
      "Triage — ogohlantirishlarni tez ko‘rib, qaysi biri haqiqiy va qaysi biri birinchi navbatda ekanini hal qilish. Ustuvorlik faqat qoida jiddiyligiga emas, aktiv qiymatiga ham bog‘liq: domen kontrolleridagi “o‘rta” ogohlantirish test virtual mashinasidagi “yuqori”dan muhimroq bo‘lishi mumkin.",
      "Triage means looking at alerts quickly and deciding which are real and which come first. Priority depends not only on the rule’s severity but on the asset’s value: a “medium” on the domain controller can matter more than a “high” on a test VM.",
    ),
    analogy: t(
      "Shoshilinch yordam bo‘limi: hamshira bemorlarni kelgan tartibda emas, holatining og‘irligiga qarab qabul qildiradi.",
      "An emergency room: the nurse sees patients by how serious they are, not by when they arrived.",
    ),
    theory: [
      t(
        "Ustuvorlik ≈ jiddiylik × aktiv qiymati × hujum davom etayotgani.",
        "Priority ≈ severity × asset value × whether the attack is still going on.",
      ),
    ],
    task: t(
      "Har bir ogohlantirishni hozir ko‘rish kerakmi yoki kutishi mumkinmi?",
      "Does each alert need looking at now, or can it wait?",
    ),
    hint: t(
      "Muhim server va davom etayotgan harakat — hozir.",
      "Important servers and activity still under way come now.",
    ),
    widget: {
      type: "sort",
      buckets: [
        { id: "now", label: t("Hozir", "Now") },
        { id: "wait", label: t("Kutishi mumkin", "Can wait") },
      ],
      items: [
        {
          label: t(
            "Fayl serverida fayllar ommaviy shifrlanmoqda",
            "Files on the file server are being encrypted en masse",
          ),
          bucket: "now",
        },
        {
          label: t(
            "Domen kontrollerida yangi administrator hisobi",
            "A new administrator account on the domain controller",
          ),
          bucket: "now",
        },
        {
          label: t(
            "Moliya direktori noutbukida zararli makros ishga tushdi",
            "A malicious macro ran on the finance director’s laptop",
          ),
          bucket: "now",
        },
        {
          label: t(
            "Internetdan veb-saytga port skanerlash",
            "A port scan of the website from the internet",
          ),
          bucket: "wait",
        },
        {
          label: t(
            "Test virtual mashinasida bir necha muvaffaqiyatsiz kirish",
            "A few failed logins on a test VM",
          ),
          bucket: "wait",
        },
      ],
    },
  },
  {
    id: 2,
    group: ORDER,
    title: t("Ogohlantirish tuzilishi", "Anatomy of an alert"),
    minutes: 6,
    intro: t(
      "Yaxshi ogohlantirish tahlilchiga birinchi savollarga javobni darhol beradi: nima bo‘ldi, qayerda, kim bilan, qanday dalil bor va bu hujumning qaysi bosqichi. Qolgan kontekstni tahlilchi o‘zi qo‘shadi (enrichment).",
      "A good alert answers the analyst’s first questions straight away: what happened, where, to whom, on what evidence, and which stage of an attack it is. The analyst adds the rest of the context (enrichment).",
    ),
    analogy: t(
      "Tez yordamga qo‘ng‘iroq: manzil, kim, nima bo‘ldi, hozir qanday — shundan keyin yo‘lga chiqiladi.",
      "A call to an ambulance: the address, who, what happened, how they are now — then the crew sets off.",
    ),
    theory: [
      t(
        "Enrichment misollari: IP obro‘si, foydalanuvchi bo‘limi, aktiv egasi, so‘nggi o‘zgarish so‘rovlari.",
        "Enrichment examples: IP reputation, the user’s department, the asset’s owner, recent change requests.",
      ),
    ],
    task: t(
      "Ogohlantirishning har bir qismini bosib, nima ekanini o‘qing.",
      "Click each part of the alert and read what it is.",
    ),
    hint: t("Hammasi bo‘lib beshta qism.", "Five parts in all."),
    widget: {
      type: "anatomy",
      lines: [
        [
          { text: "[HIGH]", id: "severity" },
          { text: " Office spawned encoded PowerShell" },
        ],
        [{ text: "host=HR-PC-07  user=dilnoza", id: "who" }],
        [{ text: "time=2026-10-29T08:41:07Z", id: "time" }],
        [
          {
            text: "evidence: WINWORD.EXE → powershell.exe -nop -w hidden -enc …",
            id: "evidence",
          },
        ],
        [{ text: "mitre: T1059.001 (PowerShell)", id: "mitre" }],
      ],
      parts: [
        {
          id: "severity",
          title: t("Jiddiylik", "Severity"),
          body: t(
            "Qoida muallifi belgilagan. Ustuvorlik uchun boshlang‘ich nuqta, yakuniy javob emas.",
            "Set by the rule’s author. A starting point for priority, not the final word.",
          ),
        },
        {
          id: "who",
          title: t("Qayerda va kim", "Where and who"),
          body: t(
            "Kompyuter va hisob — aktiv qiymati va foydalanuvchi kontekstini shu yerdan qidirasiz.",
            "The machine and the account — where you look up the asset’s value and the user’s context.",
          ),
        },
        {
          id: "time",
          title: t("Vaqt (UTC)", "Time (UTC)"),
          body: t(
            "Boshqa loglarda “oldin va keyin nima bo‘ldi” deb qidirish uchun.",
            "To search the other logs for what happened just before and after.",
          ),
        },
        {
          id: "evidence",
          title: t("Dalil", "Evidence"),
          body: t(
            "Qoidani ishga tushirgan aniq hodisa — tahlilchi uni o‘z ko‘zi bilan ko‘radi.",
            "The exact event that fired the rule — the analyst sees it with their own eyes.",
          ),
        },
        {
          id: "mitre",
          title: t("MITRE ATT&CK", "MITRE ATT&CK"),
          body: t(
            "Hujumning qaysi texnikasi. Keyingi qadamni taxmin qilishga yordam beradi.",
            "Which attack technique it is. It helps guess the next step.",
          ),
        },
      ],
    },
  },
  {
    id: 3,
    group: JUDGE,
    title: t("Navbatni saralash", "Working the queue"),
    minutes: 12,
    intro: t(
      "Har bir ogohlantirish uchta natijadan biriga olib keladi: zararli — yuqoriga (IR guruhiga) uzatish; xavfsiz — yopish (kerak bo‘lsa, IT’ga so‘rov); yolg‘on — yopish va qoidani sozlash. Qaror kontekstdan chiqadi, sarlavhadan emas.",
      "Every alert ends in one of three ways: malicious — escalate to incident response; benign — close it (with a ticket to IT if needed); false positive — close it and tune the rule. The decision comes from the context, not the headline.",
    ),
    analogy: t(
      "Signalizatsiya chalindi: o‘g‘ri (politsiya chaqiriladi), mushuk (o‘chiriladi) yoki buzilgan datchik (ta’mirlanadi).",
      "The burglar alarm goes off: a burglar (call the police), the cat (switch it off) or a faulty sensor (get it fixed).",
    ),
    theory: [
      t(
        "“Benign” — qoida to‘g‘ri ishladi, lekin harakat xavfsiz. “False positive” — qoidaning o‘zi noto‘g‘ri narsani ushladi.",
        "Benign means the rule worked but the activity was harmless. A false positive means the rule itself caught the wrong thing.",
      ),
    ],
    task: t(
      "Beshala ogohlantirish uchun to‘g‘ri qaror qabul qiling.",
      "Make the right call on all five alerts.",
    ),
    hint: t(
      "Karantin hujumning oxiri degani emas.",
      "Quarantine doesn’t mean the attack is over.",
    ),
    widget: { type: "queue" },
  },
  {
    id: 4,
    group: JUDGE,
    title: t("Shoshilmasdan, lekin tez", "Fast, without rushing"),
    minutes: 6,
    intro: t(
      "Triage’da ikki xavf bor: haqiqiy hujumni “yana yolg‘on” deb yopish va har bir mayda narsani uzatib, IR guruhini band qilish. Har bir yopilgan ogohlantirishga qisqa sabab yoziladi — keyinroq kimdir “nega yopilgan?” deb so‘raydi.",
      "Triage has two dangers: closing a real attack as “another false alarm”, and escalating every small thing until incident response drowns. Every closed alert gets a short reason — later someone will ask why it was closed.",
    ),
    analogy: t(
      "Bo‘ri keldi deb qichqirgan bola haqidagi ertak — lekin bu yerda bo‘ri haqiqatan kelishi mumkin.",
      "The boy who cried wolf — except here the wolf may really come.",
    ),
    theory: [
      t(
        "Shubha bo‘lsa — uzating. Yopishdan oldin “bu hujum bo‘lsa, qanday ko‘rinardi?” deb so‘rang.",
        "When in doubt, escalate. Before closing, ask: “if this were an attack, what would it look like?”",
      ),
    ],
    task: t("Savollarga javob bering.", "Answer the questions."),
    hint: t(
      "Sabab yozilmagan yopish — iz qoldirmagan qaror.",
      "Closing with no reason leaves no trail.",
    ),
    widget: {
      type: "quiz",
      questions: [
        {
          ask: t(
            "Qoida o‘tgan hafta 30 marta yolg‘on chiqdi. Bugun yana chiqdi. Nima qilasiz?",
            "A rule was wrong 30 times last week. It fired again today. What do you do?",
          ),
          options: [
            t(
              "Baribir kontekstni tekshirasiz, keyin qoidani sozlashni so‘raysiz",
              "Check the context anyway, then ask for the rule to be tuned",
            ),
            t("Ko‘rmasdan yopasiz", "Close it without looking"),
            t("Qoidani o‘zingiz o‘chirasiz", "Switch the rule off yourself"),
          ],
          answer: 0,
          explain: t(
            "31-chisi haqiqiy bo‘lishi mumkin.",
            "The 31st may be the real one.",
          ),
        },
        {
          ask: t(
            "Ogohlantirishni yopganda nima yoziladi?",
            "What do you write when closing an alert?",
          ),
          options: [
            t(
              "Nima tekshirildi va nega xavfsiz deb topildi",
              "What was checked and why it was judged harmless",
            ),
            t("Hech narsa", "Nothing"),
            t("Faqat “OK”", "Just “OK”"),
          ],
          answer: 0,
          explain: t(
            "Keyingi tahlilchi va auditor shuni o‘qiydi.",
            "The next analyst and the auditor will read it.",
          ),
        },
        {
          ask: t(
            "Ishonchingiz komil emas: hujummi yoki yo‘q. Nima qilasiz?",
            "You aren’t sure whether it is an attack. What do you do?",
          ),
          options: [
            t(
              "Topilgan faktlar bilan yuqoriga uzatasiz",
              "Escalate, with the facts you found",
            ),
            t("Yopasiz", "Close it"),
            t("Ertagacha kutasiz", "Wait until tomorrow"),
          ],
          answer: 0,
          explain: t(
            "O‘tkazib yuborilgan hujum bir ortiqcha uzatishdan qimmat.",
            "A missed attack costs more than one extra escalation.",
          ),
        },
      ],
    },
  },
  {
    id: 5,
    group: HAND,
    title: t("Yaxshi uzatish xati", "A good escalation"),
    minutes: 6,
    intro: t(
      "Uzatishda IR guruhi qayta tekshirmasdan ishlay boshlashi kerak. Unga faktlar kerak: nima, qachon (UTC), qaysi kompyuter va hisob, qanday dalil, siz nima qildingiz va nimani so‘rayapsiz. Taxminlar va hissiyotlar emas.",
      "An escalation should let incident response start work without re-checking everything. They need facts: what, when (UTC), which machine and account, what evidence, what you already did and what you are asking for. Not guesses or feelings.",
    ),
    analogy: t(
      "Smena almashganda hamshira keyingisiga bemor haqida qisqa va aniq ma’lumot beradi.",
      "At shift change a nurse hands over each patient in a few clear facts.",
    ),
    theory: [
      t(
        "Parol yoki maxfiy ma’lumotni chiptaga hech qachon yozmang.",
        "Never put a password or secret in a ticket.",
      ),
    ],
    task: t(
      "Har bir jumla uzatish xatiga kiradimi?",
      "Does each line belong in the escalation?",
    ),
    hint: t(
      "Fakt, vaqt, dalil, qilingan ish — ha.",
      "Facts, times, evidence and actions taken — yes.",
    ),
    widget: {
      type: "sort",
      buckets: [
        { id: "in", label: t("Kiradi", "Goes in") },
        { id: "out", label: t("Kirmaydi", "Stays out") },
      ],
      items: [
        {
          label: t(
            "08:41:07 UTC, HR-PC-07, dilnoza: WINWORD.EXE powershell -enc ni ishga tushirdi",
            "08:41:07 UTC, HR-PC-07, dilnoza: WINWORD.EXE started powershell -enc",
          ),
          bucket: "in",
        },
        {
          label: t(
            "Kompyuter 3 kunlik domenga ulandi (manzil ilova qilingan)",
            "The PC connected to a 3-day-old domain (address attached)",
          ),
          bucket: "in",
        },
        {
          label: t(
            "So‘rov: kompyuterni tarmoqdan izolyatsiya qilish",
            "Request: isolate the PC from the network",
          ),
          bucket: "in",
        },
        {
          label: t(
            "Menimcha, bu yana hech narsa emas",
            "I think it’s probably nothing again",
          ),
          bucket: "out",
        },
        {
          label: t(
            "dilnozaning paroli: Kuz2026!",
            "dilnoza’s password: Kuz2026!",
          ),
          bucket: "out",
        },
      ],
    },
  },
  {
    id: 6,
    group: HAND,
    title: t("Kim nima qiladi", "Who does what"),
    minutes: 6,
    intro: t(
      "Ko‘p SOC’lar bosqichli: 1-daraja tahlilchi navbatni saralaydi va playbook bo‘yicha birinchi qadamlarni qiladi; 2-daraja chuqurroq tekshiradi; IR guruhi hodisani boshqaradi — izolyatsiya, tozalash, tiklash. Playbook — har bir ogohlantirish turi uchun yozilgan qadamlar.",
      "Many SOCs work in tiers: a level-1 analyst works the queue and takes the first playbook steps; level 2 digs deeper; the incident response team runs the incident — isolating, cleaning, recovering. A playbook is the written steps for each kind of alert.",
    ),
    analogy: t(
      "Poliklinika: navbatchi hamshira, keyin shifokor, og‘ir holatda — jarroh.",
      "A clinic: the duty nurse, then the doctor, and for serious cases, the surgeon.",
    ),
    theory: [
      t(
        "Playbook qadamlarini avtomatlashtiradigan tizimlar SOAR deyiladi.",
        "Systems that automate playbook steps are called SOAR.",
      ),
    ],
    task: t("Savollarga javob bering.", "Answer the questions."),
    hint: t(
      "Birinchi daraja — tez saralash va playbook.",
      "Level 1 means fast sorting and the playbook.",
    ),
    widget: {
      type: "quiz",
      questions: [
        {
          ask: t("Playbook nima?", "What is a playbook?"),
          options: [
            t(
              "Ogohlantirish turi uchun yozilgan qadamlar ro‘yxati",
              "The written steps for one kind of alert",
            ),
            t("Hujumchining rejasi", "The attacker’s plan"),
            t("SIEM litsenziyasi", "A SIEM licence"),
          ],
          answer: 0,
          explain: t(
            "Hamma bir xil, tekshirilgan tartibda ishlaydi.",
            "Everyone works the same, tested way.",
          ),
        },
        {
          ask: t(
            "Buzilgan serverni tiklashni kim boshqaradi?",
            "Who runs the recovery of a breached server?",
          ),
          options: [
            t("IR guruhi", "The incident response team"),
            t("1-daraja tahlilchi yolg‘iz", "A level-1 analyst alone"),
            t("Hech kim", "Nobody"),
          ],
          answer: 0,
          explain: t(
            "1-daraja aniqlaydi va uzatadi.",
            "Level 1 finds it and hands it over.",
          ),
        },
        {
          ask: t(
            "IP obro‘sini tekshirish va chipta ochishni avtomatlashtiradigan tizim?",
            "A system that automates IP reputation checks and opening tickets?",
          ),
          options: [t("SOAR", "SOAR"), t("DNS", "DNS"), t("VPN", "VPN")],
          answer: 0,
          explain: t(
            "Security Orchestration, Automation and Response.",
            "Security Orchestration, Automation and Response.",
          ),
        },
      ],
    },
  },
  {
    id: 7,
    group: HAND,
    title: t("SOC ko‘rsatkichlari", "SOC metrics"),
    minutes: 6,
    intro: t(
      "SOC ishini raqamlar bilan o‘lchaydi: MTTD — hujum boshlanishidan aniqlashgacha o‘rtacha vaqt; MTTR — aniqlashdan bartaraf etishgacha; yolg‘on ogohlantirishlar ulushi. Raqamlar qoidalar va jarayonlarni yaxshilash uchun, tahlilchilarni jazolash uchun emas.",
      "A SOC measures its work in numbers: MTTD — the mean time from an attack starting to its detection; MTTR — from detection to resolution; the share of false alarms. The numbers are for improving rules and processes, not for punishing analysts.",
    ),
    analogy: t(
      "O‘t o‘chiruvchilar qo‘ng‘iroqdan yetib kelishgacha vaqtni o‘lchaydi — tezroq bo‘lish uchun.",
      "Fire crews measure the time from the call to arrival — to get faster.",
    ),
    theory: [
      t(
        "“Yopilgan ogohlantirishlar soni”ni maqsad qilsangiz, tahlilchilar tekshirmasdan yopa boshlaydi.",
        "Make “alerts closed” the target and analysts start closing without checking.",
      ),
    ],
    task: t("Savollarga javob bering.", "Answer the questions."),
    hint: t("D — detect, R — respond.", "D is for detect, R for respond."),
    widget: {
      type: "quiz",
      questions: [
        {
          ask: t("MTTD nimani o‘lchaydi?", "What does MTTD measure?"),
          options: [
            t(
              "Hujum boshlanishidan aniqlanishigacha o‘rtacha vaqt",
              "The mean time from an attack starting to its detection",
            ),
            t("Tahlilchilar soni", "The number of analysts"),
            t("Disk hajmi", "Disk size"),
          ],
          answer: 0,
          explain: t("Mean Time To Detect.", "Mean Time To Detect."),
        },
        {
          ask: t(
            "Yolg‘on ogohlantirishlar ulushi 90% bo‘lsa?",
            "If 90% of alerts are false alarms?",
          ),
          options: [
            t("Qoidalarni sozlash vaqti keldi", "It’s time to tune the rules"),
            t("Hammasi yaxshi", "All is well"),
            t(
              "Ko‘proq tahlilchi yollash yetarli",
              "Hiring more analysts is enough",
            ),
          ],
          answer: 0,
          explain: t(
            "Shovqin haqiqiy hujumlarni yashiradi.",
            "Noise hides real attacks.",
          ),
        },
      ],
    },
  },
  {
    id: 8,
    group: HAND,
    title: t("Yakuniy savollar", "Final questions"),
    minutes: 6,
    intro: t(
      "Modulni takrorlaymiz: ustuvorlik, ogohlantirish tuzilishi, navbatni saralash, ehtiyotkorlik, uzatish, rollar va ko‘rsatkichlar.",
      "A review of the module: priority, alert anatomy, working the queue, caution, escalation, roles and metrics.",
    ),
    analogy: t(
      "Yaxshi tahlilchi — yaxshi navbatchi shifokor: tez, tartibli va faktlarga tayanadi.",
      "A good analyst is a good duty doctor: quick, orderly and led by facts.",
    ),
    theory: [
      t(
        "Keyingi modulda ogohlantirishni kutmasdan, o‘zimiz tahdid izlaymiz.",
        "In the next module we stop waiting for alerts and hunt for threats ourselves.",
      ),
    ],
    task: t(
      "Barcha savollarga to‘g‘ri javob bering.",
      "Answer every question correctly.",
    ),
    hint: t("Kontekst qarorni belgilaydi.", "Context decides the call."),
    widget: {
      type: "quiz",
      questions: [
        {
          ask: t(
            "Antivirus Mimikatz’ni karantinga oldi. Ogohlantirishni yopasizmi?",
            "Antivirus quarantined Mimikatz. Do you close the alert?",
          ),
          options: [
            t(
              "Yo‘q — kim va qanday tushirganini aniqlash uchun uzataman",
              "No — I escalate to find out who dropped it and how",
            ),
            t("Ha, karantin yetarli", "Yes, quarantine is enough"),
            t("Antivirusni o‘chiraman", "I switch the antivirus off"),
          ],
          answer: 0,
          explain: t(
            "Vosita to‘xtatildi, hujumchi emas.",
            "The tool was stopped, not the attacker.",
          ),
        },
        {
          ask: t(
            "Benign va false positive farqi?",
            "The difference between benign and a false positive?",
          ),
          options: [
            t(
              "Benign — qoida to‘g‘ri, harakat xavfsiz; false positive — qoida noto‘g‘ri narsani ushladi",
              "Benign: the rule worked, the activity was harmless; false positive: the rule caught the wrong thing",
            ),
            t("Farqi yo‘q", "There is none"),
            t("Benign — hujum", "Benign means an attack"),
          ],
          answer: 0,
          explain: t(
            "False positive qoidani sozlashni talab qiladi.",
            "A false positive calls for tuning the rule.",
          ),
        },
        {
          ask: t("Ustuvorlikni nima belgilaydi?", "What sets priority?"),
          options: [
            t(
              "Jiddiylik, aktiv qiymati va hujum davom etayotgani",
              "Severity, the asset’s value and whether it is still going on",
            ),
            t("Faqat kelgan vaqti", "Only when it arrived"),
            t("Sarlavha uzunligi", "The length of its title"),
          ],
          answer: 0,
          explain: t(
            "Test VM’dagi “yuqori” domen kontrollerdagi “o‘rta”dan pastroq bo‘lishi mumkin.",
            "A “high” on a test VM can rank below a “medium” on the domain controller.",
          ),
        },
        {
          ask: t(
            "Uzatish xatiga nima yozilmaydi?",
            "What never goes into an escalation?",
          ),
          options: [
            t("Foydalanuvchi paroli", "A user’s password"),
            t("UTC vaqt", "The UTC time"),
            t("Kompyuter nomi", "The machine name"),
          ],
          answer: 0,
          explain: t(
            "Chiptalarni ko‘p odam o‘qiydi.",
            "Many people read tickets.",
          ),
        },
      ],
    },
  },
];
