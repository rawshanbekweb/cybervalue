// Academy Intermediate · Digital forensics, module 4: Incident response. The
// lessons use ./tools.ts: ranking incidents by severity and containing
// ransomware without losing the evidence.
import type { CommonWidget, Lesson, Text } from "../anim-lab/types";

export type Widget = CommonWidget | { type: "triage" } | { type: "contain" };

export const PROGRESS_KEY = "cybervalue:response:progress:v1";

const t = (uz: string, en: string): Text => ({ uz, en });

const PLAN = t("Jarayon", "The process");
const ACT = t("Harakat", "Acting");
const AFTER = t("Keyin", "Afterwards");

export const LESSONS: Lesson<Widget>[] = [
  {
    id: 1,
    group: PLAN,
    title: t("NIST hayot sikli", "The NIST lifecycle"),
    minutes: 8,
    intro: t(
      "NIST SP 800-61 hodisaga javobni to‘rt bosqichga bo‘ladi: tayyorgarlik; aniqlash va tahlil; cheklash, yo‘q qilish va tiklash; hodisadan keyingi faoliyat (saboqlar). Eng ko‘p ish birinchi bosqichda — hodisa sodir bo‘lishidan oldin qilinadi.",
      "NIST SP 800-61 splits incident response into four phases: preparation; detection and analysis; containment, eradication and recovery; post-incident activity (lessons learned). The most work goes into the first phase — before anything has happened.",
    ),
    analogy: t(
      "Yong‘in xavfsizligi: o‘t o‘chirgich va evakuatsiya rejasi oldindan; tutunni sezish; o‘tni o‘chirish va binoni tiklash; keyin — nima uchun yonganini tahlil qilish.",
      "Fire safety: extinguishers and an evacuation plan in advance; noticing the smoke; putting it out and repairing the building; then working out why it started.",
    ),
    theory: [
      t(
        "Bosqichlar sikl: saboqlar keyingi tayyorgarlikni yaxshilaydi.",
        "The phases form a loop: the lessons feed the next round of preparation.",
      ),
    ],
    task: t(
      "Har bir harakatni o‘z bosqichiga ajrating.",
      "Sort each action into its phase.",
    ),
    hint: t("Oldin, paytida va keyin.", "Before, during and after."),
    widget: {
      type: "sort",
      buckets: [
        { id: "prep", label: t("Tayyorgarlik", "Preparation") },
        {
          id: "detect",
          label: t("Aniqlash va tahlil", "Detection and analysis"),
        },
        {
          id: "contain",
          label: t("Cheklash va tiklash", "Containment and recovery"),
        },
        { id: "post", label: t("Saboqlar", "Lessons learned") },
      ],
      items: [
        {
          label: t(
            "Javob rejasi va aloqa ro‘yxatini yozish",
            "Writing the response plan and contact list",
          ),
          bucket: "prep",
        },
        {
          label: t("Markaziy loglashni sozlash", "Setting up central logging"),
          bucket: "prep",
        },
        {
          label: t(
            "Signal haqiqiy ekanini tekshirish",
            "Checking whether an alert is real",
          ),
          bucket: "detect",
        },
        {
          label: t(
            "Qaysi xostlar zararlanganini aniqlash",
            "Working out which hosts are infected",
          ),
          bucket: "detect",
        },
        {
          label: t(
            "Zararlangan serverni tarmoqdan uzish",
            "Cutting the infected server off the network",
          ),
          bucket: "contain",
        },
        {
          label: t("Toza zaxiradan tiklash", "Restoring from a clean backup"),
          bucket: "contain",
        },
        {
          label: t(
            "Hodisadan bir hafta o‘tib tahlil yig‘ilishi",
            "A review meeting a week after the incident",
          ),
          bucket: "post",
        },
      ],
    },
  },
  {
    id: 2,
    group: PLAN,
    title: t("Nimadan boshlash", "What to handle first"),
    minutes: 10,
    intro: t(
      "Bir vaqtda bir nechta hodisa kelishi mumkin, jamoa esa kichik. Ular kelgan tartibda emas, jiddiyligi bo‘yicha ko‘riladi: ta’sir (qanchalik yomon bo‘lishi mumkin) va shoshilinchlik (qanchalik tez yomonlashyapti).",
      "Several incidents can arrive at once, and the team is small. They are handled not in the order they came in but by severity: impact (how bad it could get) and urgency (how fast it is getting worse).",
    ),
    analogy: t(
      "Shoshilinch yordam bo‘limi: navbatda birinchi turgan emas, eng og‘ir bemor birinchi ko‘riladi.",
      "An emergency room: not the first in the queue but the most serious patient is seen first.",
    ),
    theory: [
      t(
        "Bu yerda jiddiylik = ta’sir × shoshilinchlik, har biri 1 dan 3 gacha.",
        "Here severity = impact × urgency, each from 1 to 3.",
      ),
    ],
    task: t(
      "Hodisalarni eng jiddiysidan boshlab tartiblang.",
      "Order the incidents from the most severe down.",
    ),
    hint: t(
      "Tarqalayotgan ransomware — birinchi; shifrlangan yo‘qolgan noutbuk — oxirgi.",
      "Spreading ransomware first; an encrypted lost laptop last.",
    ),
    widget: { type: "triage" },
  },
  {
    id: 3,
    group: ACT,
    title: t("Ransomware’ni cheklash", "Containing ransomware"),
    minutes: 12,
    intro: t(
      "Soat 02:30, ransomware fayl serverida tarqalmoqda. Cheklash — zararni to‘xtatish, lekin dalillarni saqlab qolgan holda va hujumchini ogohlantirmasdan. Shoshilib qilingan to‘g‘ri tuyulgan harakat (hammasini o‘chirish, darhol qayta o‘rnatish) keyin qimmatga tushadi.",
      "02:30, ransomware is spreading on the file server. Containment means stopping the damage — while keeping the evidence and without warning the attacker. A hasty move that feels right (switching everything off, reinstalling at once) costs dearly later.",
    ),
    analogy: t(
      "Suv toshqini: avval kranni yopasiz, keyin quvurni almashtirasiz — butun uyni buzmaysiz.",
      "A burst pipe: first you shut the valve, then replace the pipe — you don’t knock the house down.",
    ),
    theory: [
      t(
        "Aloqa — tashqi kanalda (telefon, alohida messenjer): hujumchi korporativ pochta va chatni o‘qiyotgan bo‘lishi mumkin.",
        "Talk out of band (phone, a separate messenger): the attacker may be reading corporate mail and chat.",
      ),
    ],
    task: t(
      "Faqat to‘g‘ri cheklash harakatlarini tanlang.",
      "Pick only the right containment moves.",
    ),
    hint: t(
      "Uzish, xotira, hisob — ha; o‘chirish, qayta o‘rnatish, chat — yo‘q.",
      "Isolate, memory, account — yes; power off, reinstall, chat — no.",
    ),
    widget: { type: "contain" },
  },
  {
    id: 4,
    group: ACT,
    title: t("Hodisa kartasi", "The incident ticket"),
    minutes: 6,
    intro: t(
      "Har bir hodisa uchun karta (ticket) ochiladi: raqam, jiddiylik, qachon aniqlangan, qamrov, qilingan harakatlar va mas’ul. Bu — jamoaning umumiy xotirasi va keyingi hisobotning asosi.",
      "Each incident gets a ticket: an ID, the severity, when it was detected, the scope, the actions taken and an owner. It is the team’s shared memory and the basis of the report later.",
    ),
    analogy: t(
      "Shifokorning kasallik tarixi: har bir tekshiruv va dori vaqti bilan yoziladi.",
      "A doctor’s case notes: every test and every dose written down with its time.",
    ),
    theory: [
      t(
        "Vaqtlar UTC’da va har bir harakat kim tomonidan qilinganini ko‘rsatgan holda yoziladi.",
        "Times go in UTC, with who did each action.",
      ),
    ],
    task: t(
      "Kartaning har bir qismini bosib, nima ekanini o‘qing.",
      "Click each part of the ticket and read what it is.",
    ),
    hint: t("Hammasi bo‘lib oltita qism.", "Six parts in all."),
    widget: {
      type: "anatomy",
      lines: [
        [
          { text: "INC-2026-0417", id: "id" },
          { text: "   " },
          { text: "SEV-1", id: "sev" },
        ],
        [
          {
            text: "Detected: 2026-10-03 02:31 UTC (EDR alert)",
            id: "detected",
          },
        ],
        [
          {
            text: "Scope: FS01, 23 workstations, user a.karimova",
            id: "scope",
          },
        ],
        [
          {
            text: "02:38 isolated FS01 · 02:41 RAM of WS-114 · 02:44 a.karimova disabled",
            id: "actions",
          },
        ],
        [{ text: "Owner: N. Usmonov (IR lead)", id: "owner" }],
      ],
      parts: [
        {
          id: "id",
          title: t("Hodisa raqami", "Incident ID"),
          body: t(
            "Barcha xatlar, loglar va dalillar shu raqam bilan bog‘lanadi.",
            "All mail, logs and evidence are tied to this number.",
          ),
        },
        {
          id: "sev",
          title: t("Jiddiylik", "Severity"),
          body: t(
            "SEV-1 — eng yuqori: rahbariyat darhol xabardor qilinadi, jamoa kechayu kunduz ishlaydi.",
            "SEV-1 is the highest: management is told at once and the team works around the clock.",
          ),
        },
        {
          id: "detected",
          title: t("Aniqlangan vaqt va manba", "When and how it was detected"),
          body: t(
            "Hujum boshlanishi bilan aniqlanishi orasidagi vaqt (dwell time) keyin tahlil qilinadi.",
            "The gap between the attack starting and its detection (the dwell time) is analysed later.",
          ),
        },
        {
          id: "scope",
          title: t("Qamrov", "Scope"),
          body: t(
            "Qaysi tizimlar va hisoblar zararlangan. Qamrov tahlil davomida o‘zgarishi mumkin.",
            "Which systems and accounts are affected. The scope may change as the analysis goes on.",
          ),
        },
        {
          id: "actions",
          title: t("Harakatlar jurnali", "Action log"),
          body: t(
            "Har bir harakat vaqti bilan: keyin “nima qildingiz va qachon?” savoliga javob shu.",
            "Every action with its time: the answer, later, to “what did you do and when?”.",
          ),
        },
        {
          id: "owner",
          title: t("Mas’ul", "Owner"),
          body: t(
            "Bitta odam qaror qabul qiladi va hammani muvofiqlashtiradi.",
            "One person makes the calls and coordinates everyone.",
          ),
        },
      ],
    },
  },
  {
    id: 5,
    group: ACT,
    title: t("Yo‘q qilish va tiklash", "Eradication and recovery"),
    minutes: 6,
    intro: t(
      "Cheklashdan keyin hujumchining barcha izlari yo‘q qilinadi: zararli fayllar, orqa eshik hisoblari, rejalashtirilgan vazifalar. Keyin tizimlar toza zaxiradan tiklanadi, parollar almashtiriladi va kirish yo‘li (masalan, yamalmagan zaiflik) yopiladi. So‘ng — kuzatuv: hujumchi qaytishga urinadimi?",
      "After containment every trace of the attacker is removed: malware, back-door accounts, scheduled tasks. Then systems are restored from a clean backup, passwords are changed and the way in (an unpatched flaw, say) is closed. Then you watch: does the attacker try to come back?",
    ),
    analogy: t(
      "O‘g‘ri kirgan uyda qulfni almashtirmasdan narsalarni joyiga qo‘yish — u ertaga yana keladi.",
      "Tidying a burgled house without changing the lock — the burglar is back tomorrow.",
    ),
    theory: [
      t(
        "Zaxira ham zararlangan bo‘lishi mumkin: hujum boshlanishidan oldingi va tekshirilgan nusxani tanlang.",
        "Backups can be infected too: pick one from before the attack began, and check it.",
      ),
    ],
    task: t("Savollarga javob bering.", "Answer the questions."),
    hint: t(
      "Ildiz sababini yopmasdan tiklash — qayta hujumga taklif.",
      "Recovering without closing the root cause invites the next attack.",
    ),
    widget: {
      type: "quiz",
      questions: [
        {
          ask: t(
            "Hujum 1-oktabrda boshlangan, 3-oktabrda aniqlangan. Qaysi zaxiradan tiklaysiz?",
            "The attack began on 1 October and was found on 3 October. Which backup do you restore?",
          ),
          options: [
            t(
              "30-sentyabrdagi, tekshirilgan nusxadan",
              "The one from 30 September, after checking it",
            ),
            t("Eng oxirgi, 3-oktabrdagi", "The latest, from 3 October"),
            t("Zaxira kerak emas", "No backup is needed"),
          ],
          answer: 0,
          explain: t(
            "1-oktabrdan keyingi nusxalarda hujumchining izlari bo‘lishi mumkin.",
            "Copies after 1 October may carry the attacker’s traces.",
          ),
        },
        {
          ask: t(
            "Tizimlar tiklandi. Yana nima shart?",
            "The systems are restored. What else is a must?",
          ),
          options: [
            t(
              "Parollarni almashtirish va kirish yo‘lini yopish",
              "Changing passwords and closing the way in",
            ),
            t("Hech narsa, ish tugadi", "Nothing, the job is done"),
            t("Firewall’ni o‘chirish", "Turning off the firewall"),
          ],
          answer: 0,
          explain: t(
            "Aks holda hujumchi o‘sha yo‘l bilan qaytadi.",
            "Otherwise the attacker returns the same way.",
          ),
        },
      ],
    },
  },
  {
    id: 6,
    group: AFTER,
    title: t("Kimga va qanday xabar berish", "Who to tell, and how"),
    minutes: 6,
    intro: t(
      "Hodisa — faqat texnik masala emas. Rahbariyat qaror qabul qiladi, yuristlar qonuniy majburiyatlarni ko‘radi, shaxsiy ma’lumotlar sizgan bo‘lsa — nazorat organi va jabrlanganlar belgilangan muddatda xabardor qilinadi. Jurnalistlar bilan faqat tayinlangan odam gaplashadi.",
      "An incident is not only a technical matter. Management makes decisions, lawyers look at legal duties, and if personal data leaked, the regulator and the people affected are told within the set deadline. Only the appointed person talks to journalists.",
    ),
    analogy: t(
      "Samolyotdagi favqulodda holat: uchuvchi yo‘lovchilarga bitta, aniq va xotirjam e’lon qiladi.",
      "An emergency on a plane: the pilot makes one clear, calm announcement to the passengers.",
    ),
    theory: [
      t(
        "Aloqa ro‘yxati (kim, telefon, zaxira kanal) tayyorgarlik bosqichida tuziladi — hodisa paytida emas.",
        "The contact list (who, phone, backup channel) is drawn up during preparation — not mid-incident.",
      ),
    ],
    task: t("Savollarga javob bering.", "Answer the questions."),
    hint: t(
      "Tashqi kanal va tayinlangan vakil.",
      "An out-of-band channel and an appointed spokesperson.",
    ),
    widget: {
      type: "quiz",
      questions: [
        {
          ask: t(
            "Hujumchi korporativ pochtani o‘qiyotgan bo‘lishi mumkin. Jamoa qanday aloqa qiladi?",
            "The attacker may be reading corporate mail. How does the team talk?",
          ),
          options: [
            t(
              "Oldindan kelishilgan tashqi kanal orqali (telefon, alohida messenjer)",
              "Over an agreed out-of-band channel (phone, a separate messenger)",
            ),
            t("Korporativ pochta orqali", "Over corporate mail"),
            t("Umumiy chatda", "In the general chat"),
          ],
          answer: 0,
          explain: t(
            "Aks holda hujumchi har bir qadamingizni oldindan biladi.",
            "Otherwise the attacker knows every move before you make it.",
          ),
        },
        {
          ask: t(
            "Mijozlarning shaxsiy ma’lumotlari sizgani tasdiqlandi. Nima qilinadi?",
            "A leak of customers’ personal data is confirmed. What happens?",
          ),
          options: [
            t(
              "Yuristlar bilan nazorat organi va mijozlarga belgilangan muddatda xabar beriladi",
              "With the lawyers, the regulator and customers are told within the deadline",
            ),
            t("Hech kimga aytilmaydi", "Nobody is told"),
            t(
              "Faqat ijtimoiy tarmoqda yoziladi",
              "It is only posted on social media",
            ),
          ],
          answer: 0,
          explain: t(
            "Yashirish qonuniy javobgarlikni oshiradi va ishonchni yo‘qotadi.",
            "Hiding it adds legal liability and loses trust.",
          ),
        },
      ],
    },
  },
  {
    id: 7,
    group: AFTER,
    title: t("Saboqlar yig‘ilishi", "The lessons-learned meeting"),
    minutes: 6,
    intro: t(
      "Hodisadan keyin jamoa yig‘iladi: nima bo‘ldi, nima yaxshi ishladi, nima ishlamadi va nimani o‘zgartiramiz. Maqsad — aybdor qidirish emas (blameless), balki tizimni yaxshilash: har bir xulosaga mas’ul va muddat.",
      "After the incident the team meets: what happened, what worked, what didn’t and what to change. The aim is not finding someone to blame (blameless) but fixing the system: an owner and a date for every action.",
    ),
    analogy: t(
      "Futbol jamoasi o‘yindan keyin videoni ko‘radi — kimnidir jazolash uchun emas, keyingi o‘yinda yutish uchun.",
      "A football team watches the match video afterwards — not to punish anyone, but to win the next game.",
    ),
    theory: [
      t(
        "Odam xato qilsa, savol — “tizim nega bu xatoga yo‘l qo‘ydi?”",
        "When a person makes a mistake, the question is “why did the system let that mistake happen?”",
      ),
    ],
    task: t(
      "Har birini ajrating: foydali yoki zararli?",
      "Sort each one: helpful or harmful?",
    ),
    hint: t(
      "Aniq harakat, mas’ul, muddat — foydali.",
      "A concrete action, an owner, a date — helpful.",
    ),
    widget: {
      type: "sort",
      buckets: [
        { id: "good", label: t("Foydali", "Helpful") },
        { id: "bad", label: t("Zararli", "Harmful") },
      ],
      items: [
        {
          label: t(
            "“VPN’ga MFA — mas’ul: A. Saidov, 15-noyabrgacha”",
            "“MFA on the VPN — owner: A. Saidov, by 15 November”",
          ),
          bucket: "good",
        },
        {
          label: t(
            "Aniqlashgacha o‘tgan vaqtni (dwell time) o‘lchash",
            "Measuring the time to detection (dwell time)",
          ),
          bucket: "good",
        },
        {
          label: t(
            "Javob rejasini yig‘ilish natijasida yangilash",
            "Updating the response plan from what was learned",
          ),
          bucket: "good",
        },
        {
          label: t(
            "Fishing havolasini bosgan xodimni ishdan bo‘shatish",
            "Firing the employee who clicked the phishing link",
          ),
          bucket: "bad",
        },
        {
          label: t(
            "“Hammasi joyida, keyingi safar ehtiyot bo‘lamiz” — va boshqa hech narsa",
            "“All fine, we’ll be careful next time” — and nothing else",
          ),
          bucket: "bad",
        },
        {
          label: t(
            "Yig‘ilishni o‘tkazmaslik — “vaqt yo‘q”",
            "Skipping the meeting — “no time”",
          ),
          bucket: "bad",
        },
      ],
    },
  },
  {
    id: 8,
    group: AFTER,
    title: t("Yakuniy savollar", "Final questions"),
    minutes: 6,
    intro: t(
      "Modulni takrorlaymiz: NIST bosqichlari, jiddiylik, cheklash, hodisa kartasi, tiklash, aloqa va saboqlar.",
      "A review of the module: the NIST phases, severity, containment, the ticket, recovery, communication and lessons learned.",
    ),
    analogy: t(
      "Yaxshi javob — yaxshi mashq qilingan o‘t o‘chiruvchilar: hamma o‘z vazifasini biladi.",
      "Good response is like well-drilled firefighters: everyone knows their job.",
    ),
    theory: [
      t(
        "Keyingi modul — hisobot yozish: topilmalar, dalillar va tavsiyalar.",
        "The next module is writing the report: findings, evidence and recommendations.",
      ),
    ],
    task: t(
      "Barcha savollarga to‘g‘ri javob bering.",
      "Answer every question correctly.",
    ),
    hint: t(
      "Cheklashda dalilni saqlang; keyin ildiz sababni yoping.",
      "Keep the evidence while containing; then close the root cause.",
    ),
    widget: {
      type: "quiz",
      questions: [
        {
          ask: t(
            "Javob rejasi qaysi bosqichda yoziladi?",
            "In which phase is the response plan written?",
          ),
          options: [
            t("Tayyorgarlik", "Preparation"),
            t("Aniqlash", "Detection"),
            t("Saboqlar", "Lessons learned"),
          ],
          answer: 0,
          explain: t(
            "Hodisa paytida reja yozishga vaqt yo‘q.",
            "There is no time to write a plan mid-incident.",
          ),
        },
        {
          ask: t(
            "Ransomware tarqalmoqda. Birinchi cheklash harakati?",
            "Ransomware is spreading. The first containment move?",
          ),
          options: [
            t(
              "Zararlangan xostlarni tarmoqdan uzish",
              "Cut infected hosts off the network",
            ),
            t("Hamma kompyuterni o‘chirish", "Power off every computer"),
            t("To‘lovni to‘lash", "Pay the ransom"),
          ],
          answer: 0,
          explain: t(
            "Uzish tarqalishni to‘xtatadi va xotiradagi dalilni saqlaydi.",
            "Isolating stops the spread and keeps the evidence in memory.",
          ),
        },
        {
          ask: t(
            "Nega zararlangan mashinalarni darhol qayta o‘rnatish xato?",
            "Why is reinstalling infected machines at once a mistake?",
          ),
          options: [
            t(
              "Hujumchi qanday kirganini bilib bo‘lmaydi — u yana qaytadi",
              "Nobody can learn how the attacker got in — so they come back",
            ),
            t("Bu juda qimmat", "It is too expensive"),
            t("Xato emas", "It isn’t"),
          ],
          answer: 0,
          explain: t(
            "Avval dalil va ildiz sabab, keyin tozalash.",
            "First the evidence and the root cause, then the clean-up.",
          ),
        },
        {
          ask: t(
            "Blameless saboqlar yig‘ilishining maqsadi?",
            "The point of a blameless lessons-learned meeting?",
          ),
          options: [
            t(
              "Tizimni yaxshilash — mas’ul va muddati bilan",
              "Fixing the system — with owners and dates",
            ),
            t("Aybdorni topish", "Finding the culprit"),
            t("Hisobot uchun vaqt o‘tkazish", "Passing time for the report"),
          ],
          answer: 0,
          explain: t(
            "Odamlar xatolarini yashirmasa, tizim tezroq yaxshilanadi.",
            "When people don’t hide mistakes, the system improves faster.",
          ),
        },
      ],
    },
  },
];
