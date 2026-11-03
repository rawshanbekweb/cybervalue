// Academy Intermediate · Social engineering, module 4: Reporting incidents.
// The lessons use ./tools.ts: what belongs in a first report.
import type { CommonWidget, Lesson, Text } from "../anim-lab/types";

export type Widget = CommonWidget | { type: "report" };

export const PROGRESS_KEY = "cybervalue:reporting:progress:v1";

const t = (uz: string, en: string): Text => ({ uz, en });

const NOTICING = t("Sezish", "Noticing");
const REPORTING = t("Xabar berish", "Reporting");

export const LESSONS: Lesson<Widget>[] = [
  {
    id: 1,
    group: NOTICING,
    title: t("Hodisa nima", "What counts as an incident"),
    minutes: 5,
    intro: t(
      "Xavfsizlik hodisasi — ma’lumot yoki tizimlarga zarar yetkazishi mumkin bo‘lgan har qanday narsa: shubhali xat yoki qo‘ng‘iroq, bosilgan phishing havolasi, yo‘qolgan noutbuk yoki telefon, noto‘g‘ri odamga yuborilgan fayl, siz kirmagan paytdagi kirish xabarnomasi, kompyuterning g‘alati ishlashi. Hodisa ekanligiga ishonchingiz komil bo‘lishi shart emas — shubhaning o‘zi xabar berish uchun yetarli.",
      "A security incident is anything that could harm data or systems: a suspicious email or call, a phishing link you clicked, a lost laptop or phone, a file sent to the wrong person, a sign-in alert when you weren’t signing in, a computer acting strangely. You don’t need to be sure it’s an incident — suspicion alone is enough to report.",
    ),
    analogy: t(
      "Gaz hidini sezsangiz, oqish ekaniga ishonch hosil qilishni kutmaysiz — qo‘ng‘iroq qilasiz.",
      "If you smell gas, you don’t wait to be sure it’s a leak — you call.",
    ),
    theory: [
      t(
        "Noto‘g‘ri xabar (false alarm) — muammo emas; xabar bermaslik — muammo.",
        "A false alarm isn’t a problem; not reporting is.",
      ),
    ],
    task: t("Savollarga javob bering.", "Answer the questions."),
    hint: t("Shubha yetarli.", "Suspicion is enough."),
    widget: {
      type: "quiz",
      questions: [
        {
          ask: t("Qaysi biri hodisa?", "Which of these is an incident?"),
          options: [
            t(
              "Ish faylini noto‘g‘ri odamga yuborib qo‘yish",
              "Sending a work file to the wrong person",
            ),
            t("Yig‘ilishning kechikishi", "A meeting running late"),
            t("Printerda qog‘oz tugashi", "The printer running out of paper"),
          ],
          answer: 0,
          explain: t(
            "Ma’lumot noto‘g‘ri joyga chiqdi.",
            "Data went somewhere it shouldn’t.",
          ),
        },
        {
          ask: t(
            "Hodisa ekaniga ishonchingiz komil emas. Nima qilasiz?",
            "You aren’t sure it’s an incident. What do you do?",
          ),
          options: [
            t("Baribir xabar beraman", "Report it anyway"),
            t("Ishonch hosil bo‘lguncha kutaman", "Wait until I’m sure"),
            t("Hech narsa", "Nothing"),
          ],
          answer: 0,
          explain: t(
            "Tekshirish — xavfsizlik jamoasining ishi.",
            "Checking is the security team’s job.",
          ),
        },
      ],
    },
  },
  {
    id: 2,
    group: NOTICING,
    title: t("Tezlik muhim", "Speed matters"),
    minutes: 5,
    intro: t(
      "Hujumchi parolni olgandan keyin odatda bir necha daqiqa yoki soat ichida harakat qiladi. Shuning uchun birinchi soat hal qiluvchi: tez xabar berilsa, jamoa parolni bekor qiladi, sessiyalarni yopadi, xatni boshqa pochtalardan o‘chiradi va zarar kichik bo‘lib qoladi. Kechikkan har bir soat hujumchiga ko‘proq vaqt beradi. Xijolat bo‘lib kutish — eng qimmat xato.",
      "Once an attacker has a password, they usually act within minutes or hours. That makes the first hour decisive: report quickly and the team can revoke the password, end sessions, pull the email from other inboxes, and the damage stays small. Every hour of delay gives the attacker more time. Waiting out of embarrassment is the most expensive mistake.",
    ),
    analogy: t(
      "Kichik yong‘inni bir chelak suv o‘chiradi; bir soatdan keyin esa o‘t o‘chirish brigadasi kerak.",
      "A bucket of water puts out a small fire; an hour later you need the fire brigade.",
    ),
    theory: [
      t(
        "Ko‘p tashkilotlar xabar berishni soatlab emas, daqiqalab o‘lchaydi.",
        "Many organisations measure reporting in minutes, not hours.",
      ),
    ],
    task: t("Savollarga javob bering.", "Answer the questions."),
    hint: t("Birinchi soat.", "The first hour."),
    widget: {
      type: "quiz",
      questions: [
        {
          ask: t(
            "Nega tez xabar berish muhim?",
            "Why does reporting fast matter?",
          ),
          options: [
            t(
              "Jamoa hujumchi harakat qilishidan oldin to‘xtata oladi",
              "The team can act before the attacker does",
            ),
            t("Hisobot chiroyliroq chiqadi", "The report looks nicer"),
            t("Muhim emas", "It doesn’t"),
          ],
          answer: 0,
          explain: t(
            "Har bir soat hujumchiga vaqt beradi.",
            "Every hour gives the attacker time.",
          ),
        },
        {
          ask: t(
            "Kechqurun havolani bosganingizni angladingiz. Qachon xabar berasiz?",
            "In the evening you realise you clicked a link. When do you report?",
          ),
          options: [
            t(
              "Hozir, navbatchi kanal orqali",
              "Now, through the out-of-hours channel",
            ),
            t("Dushanba kuni", "On Monday"),
            t("Hech qachon", "Never"),
          ],
          answer: 0,
          explain: t(
            "Hujumchilar dam olish kunlarini yaxshi ko‘radi.",
            "Attackers love weekends.",
          ),
        },
      ],
    },
  },
  {
    id: 3,
    group: REPORTING,
    title: t("Kimga va qanday", "Who and how"),
    minutes: 5,
    intro: t(
      "Har bir jamoa xabar berish yo‘lini oldindan bilishi kerak: pochtadagi “Report” tugmasi, xavfsizlik email manzili (masalan, security@), yordam xizmati raqami va ish vaqtidan tashqari navbatchi raqam. Agar hisobingiz buzilgan deb o‘ylasangiz, xabarni boshqa qurilma yoki telefon orqali yuboring. Shubhali xatni hamkasblarga “qaranglar” deb tarqatmang — faqat xavfsizlik jamoasiga.",
      "Every team should know the reporting routes in advance: the mail app’s “Report” button, a security email address (security@, say), the help desk number and an out-of-hours number. If you think your account is compromised, report from another device or by phone. Don’t forward a suspicious email to colleagues saying “look at this” — send it only to security.",
    ),
    analogy: t(
      "Favqulodda raqamni yong‘in boshlanganda emas, oldindan bilish kerak.",
      "You learn the emergency number before the fire, not during it.",
    ),
    theory: [
      t(
        "Xabar berish yo‘llari intranetda va har bir yangi xodimga birinchi kunda ko‘rsatiladi.",
        "Reporting routes go on the intranet and are shown to every new starter on day one.",
      ),
    ],
    task: t("Savollarga javob bering.", "Answer the questions."),
    hint: t(
      "Oldindan ma’lum yo‘l, faqat xavfsizlik jamoasiga.",
      "A known route, to security only.",
    ),
    widget: {
      type: "quiz",
      questions: [
        {
          ask: t(
            "Pochtangiz buzilgan deb o‘ylaysiz. Qanday xabar berasiz?",
            "You think your email is compromised. How do you report?",
          ),
          options: [
            t(
              "Telefon yoki boshqa qurilma orqali",
              "By phone or from another device",
            ),
            t("O‘sha pochtadan", "From that same mailbox"),
            t("Umumiy chatga yozib", "By posting in the team chat"),
          ],
          answer: 0,
          explain: t(
            "Hujumchi buzilgan pochtani o‘qishi mumkin.",
            "The attacker may be reading that mailbox.",
          ),
        },
        {
          ask: t(
            "Shubhali xatni hamkasblarga yuborish to‘g‘rimi?",
            "Should you forward a suspicious email to colleagues?",
          ),
          options: [
            t("Yo‘q, faqat xavfsizlik jamoasiga", "No, only to security"),
            t("Ha, hamma bilsin", "Yes, so everyone knows"),
            t("Faqat do‘stlarga", "Only to friends"),
          ],
          answer: 0,
          explain: t(
            "Kimdir uni tasodifan bosib qo‘yishi mumkin.",
            "Someone may click it by accident.",
          ),
        },
      ],
    },
  },
  {
    id: 4,
    group: REPORTING,
    title: t("Birinchi xabar", "The first report"),
    minutes: 7,
    intro: t(
      "Yaxshi birinchi xabar qisqa va faktlarga asoslangan: nima bo‘ldi, qachon, qaysi qurilma va hisob, xatning o‘zi va siz allaqachon nima qilganingiz. Unda bo‘lmasligi kerak bo‘lgan narsalar ham bor. Quyidagi sakkiz banddan qaysilari birinchi xabarga kiradi?",
      "A good first report is short and factual: what happened, when, which device and account, the email itself, and what you already did. Some things don’t belong in it. Which of these eight items go into the first report?",
    ),
    analogy: t(
      "Shifokorga: qayeri og‘riydi, qachondan beri, nima ichdingiz — taxminlarsiz.",
      "Telling a doctor: where it hurts, since when, what you took — no guesswork.",
    ),
    theory: [
      t(
        "Mukammal xabar yozish uchun kutmang — qisqa xabar, keyin qo‘shimcha.",
        "Don’t wait to write a perfect report — send a short one, then add more.",
      ),
    ],
    task: t(
      "Birinchi xabarga kiradiganlarni belgilang.",
      "Tick what belongs in the first report.",
    ),
    hint: t(
      "Faktlar ha; parol, ayb va begona ma’lumot yo‘q.",
      "Facts yes; passwords, blame and unrelated data no.",
    ),
    widget: { type: "report" },
  },
  {
    id: 5,
    group: REPORTING,
    title: t("Nima qilish va nima qilmaslik", "Do and don’t"),
    minutes: 5,
    intro: t(
      "Xabar bergandan keyin xavfsizlik jamoasining ko‘rsatmasiga amal qiling. Ko‘pincha so‘raladi: parolni boshqa qurilmadan o‘zgartirish, kompyuterni tarmoqdan uzish (lekin o‘chirmaslik — xotiradagi izlar yo‘qoladi). Xatni o‘chirish, “tozalash” yoki o‘zingiz tekshirib ko‘rishga urinish esa dalillarni yo‘q qiladi. Har bir harakatni to‘g‘ri guruhga ajrating.",
      "After reporting, follow the security team’s instructions. Often they’ll ask you to change the password from another device and disconnect the computer from the network (but not switch it off — evidence in memory would be lost). Deleting the email, “cleaning up” or trying to investigate yourself destroys evidence. Sort each action into the right group.",
    ),
    analogy: t(
      "Voqea joyini politsiya kelguncha o‘zgartirmaslik.",
      "Leaving a crime scene untouched until the police arrive.",
    ),
    theory: [
      t(
        "Dalil — loglar, xat sarlavhalari, fayllar — tergov uchun zarur.",
        "Evidence — logs, email headers, files — is essential to the investigation.",
      ),
    ],
    task: t("Harakatlarni ajrating.", "Sort the actions."),
    hint: t("Uzish ha, o‘chirish yo‘q.", "Disconnect yes, delete no."),
    widget: {
      type: "sort",
      buckets: [
        { id: "do", label: t("Qiling", "Do") },
        { id: "dont", label: t("Qilmang", "Don’t") },
      ],
      items: [
        {
          label: t(
            "Parolni boshqa qurilmadan o‘zgartirish",
            "Change the password from another device",
          ),
          bucket: "do",
        },
        {
          label: t(
            "Kompyuterni tarmoqdan uzish",
            "Disconnect the computer from the network",
          ),
          bucket: "do",
        },
        {
          label: t(
            "Xavfsizlik jamoasi ko‘rsatmasiga amal qilish",
            "Follow the security team’s instructions",
          ),
          bucket: "do",
        },
        {
          label: t(
            "Shubhali xatni o‘chirib tashlash",
            "Delete the suspicious email",
          ),
          bucket: "dont",
        },
        {
          label: t(
            "Kompyuterni darhol o‘chirish",
            "Switch the computer off straight away",
          ),
          bucket: "dont",
        },
        {
          label: t(
            "Havolani yana ochib, o‘zim tekshirib ko‘rish",
            "Open the link again to investigate myself",
          ),
          bucket: "dont",
        },
      ],
    },
  },
  {
    id: 6,
    group: REPORTING,
    title: t("Ayblovsiz madaniyat", "Blameless culture"),
    minutes: 5,
    intro: t(
      "Odamlar jazodan qo‘rqsa, xato qilganini yashiradi — va kichik hodisa katta inqirozga aylanadi. Ayblovsiz madaniyatda savol “kim aybdor?” emas, “nima bo‘ldi va tizimni qanday yaxshilaymiz?”. Xabar bergan odamga rahmat aytiladi, hatto u o‘zi bosgan bo‘lsa ham. Bu beparvolikni oqlash emas: maqsad — xatolarni erta ko‘rish va jarayonlarni tuzatish.",
      "When people fear punishment, they hide mistakes — and a small incident becomes a crisis. In a blameless culture the question isn’t “whose fault?” but “what happened, and how do we improve the system?”. Whoever reports is thanked, even if they clicked. This isn’t excusing carelessness: the aim is to see mistakes early and fix the process.",
    ),
    analogy: t(
      "Aviatsiyada uchuvchilar xatolarini jazosiz xabar qiladi — shuning uchun samolyotlar xavfsiz.",
      "In aviation pilots report mistakes without punishment — that’s why flying is safe.",
    ),
    theory: [
      t(
        "Hodisadan keyingi tahlil (post-mortem) tizimdagi zaif joylarni topadi, odamlarni emas.",
        "A post-incident review looks for weak spots in the system, not in people.",
      ),
    ],
    task: t("Savollarga javob bering.", "Answer the questions."),
    hint: t("Tizim, odam emas.", "The system, not the person."),
    widget: {
      type: "quiz",
      questions: [
        {
          ask: t(
            "Ayblovsiz madaniyatdagi asosiy savol?",
            "The main question in a blameless culture?",
          ),
          options: [
            t(
              "Nima bo‘ldi va tizimni qanday yaxshilaymiz?",
              "What happened, and how do we improve the system?",
            ),
            t("Kim aybdor?", "Whose fault is it?"),
            t("Kimni jazolaymiz?", "Whom do we punish?"),
          ],
          answer: 0,
          explain: t(
            "Jarayonni tuzatish — takrorlanishning oldini oladi.",
            "Fixing the process prevents a repeat.",
          ),
        },
        {
          ask: t(
            "Jazodan qo‘rqqan odamlar nima qiladi?",
            "What do people who fear punishment do?",
          ),
          options: [
            t("Xatolarni yashiradi", "Hide their mistakes"),
            t("Ko‘proq xabar beradi", "Report more"),
            t("Hech narsa o‘zgarmaydi", "Nothing changes"),
          ],
          answer: 0,
          explain: t(
            "Yashirilgan hodisa kattalashadi.",
            "A hidden incident grows.",
          ),
        },
      ],
    },
  },
  {
    id: 7,
    group: REPORTING,
    title: t("Xabar berish tartibini yozish", "Writing the procedure"),
    minutes: 6,
    intro: t(
      "Kichik jamoa uchun bir sahifalik tartib yetarli: 1) nima hodisa hisoblanadi (misollar bilan), 2) kimga va qanday xabar berish (ish vaqti va undan tashqari), 3) birinchi xabarga nima kiradi, 4) darhol nima qilish va nima qilmaslik, 5) xabar bergan odam jazolanmasligi haqida aniq va’da. Tartibni yiliga bir marta mashq qiling — masalan, stol ustidagi mashq (tabletop) bilan.",
      "For a small team one page is enough: 1) what counts as an incident (with examples), 2) whom to tell and how (in and out of hours), 3) what goes into the first report, 4) what to do and not do right away, 5) a clear promise that people who report won’t be punished. Practise it once a year — with a tabletop exercise, for example.",
    ),
    analogy: t(
      "Evakuatsiya rejasi devorda osilgan va mashq qilingan bo‘lishi kerak.",
      "An evacuation plan should hang on the wall and be practised.",
    ),
    theory: [
      t(
        "Tabletop — stol atrofida “agar shunday bo‘lsa, nima qilamiz?” deb o‘ynash.",
        "A tabletop is walking through “what if this happened?” around a table.",
      ),
    ],
    task: t("Savollarga javob bering.", "Answer the questions."),
    hint: t("Bir sahifa va mashq.", "One page, and practice."),
    widget: {
      type: "quiz",
      questions: [
        {
          ask: t(
            "Xabar berish tartibida bo‘lishi shart bo‘lgan narsa?",
            "What must a reporting procedure include?",
          ),
          options: [
            t(
              "Ish vaqtidan tashqari ham ishlaydigan xabar berish yo‘li",
              "A reporting route that works out of hours too",
            ),
            t("Jarimalar ro‘yxati", "A list of fines"),
            t("Barcha xodimlarning parollari", "Everyone’s passwords"),
          ],
          answer: 0,
          explain: t(
            "Hodisalar ish vaqtini tanlamaydi.",
            "Incidents don’t keep office hours.",
          ),
        },
        {
          ask: t(
            "Tartib ishlashini qanday tekshirasiz?",
            "How do you check the procedure works?",
          ),
          options: [
            t("Tabletop mashqi bilan", "With a tabletop exercise"),
            t("Haqiqiy hodisani kutib", "By waiting for a real incident"),
            t("Hech qanday", "You can’t"),
          ],
          answer: 0,
          explain: t(
            "Mashqda topilgan teshik — haqiqiy hodisadagidan arzon.",
            "A gap found in practice is cheaper than one found for real.",
          ),
        },
      ],
    },
  },
  {
    id: 8,
    group: REPORTING,
    title: t("Yakuniy savollar", "Final questions"),
    minutes: 5,
    intro: t(
      "Hodisa haqida xabar berish to‘rt so‘zga sig‘adi: tez, oldindan ma’lum yo‘l orqali, faktlar bilan va ayblovsiz. Shubha bo‘lsa — xabar bering, dalillarni saqlang va xavfsizlik jamoasi ko‘rsatmasiga amal qiling. Bu Ijtimoiy muhandislik va xavfsizlik madaniyati yo‘nalishining oxirgi moduli.",
      "Reporting an incident fits in four words: fast, through a known route, factual and blameless. If in doubt, report, keep the evidence and follow the security team’s instructions. This is the last module of the Social engineering and security culture track.",
    ),
    analogy: t(
      "Yaxshi qo‘shni: g‘alati narsani ko‘rsa, darhol aytadi va hech kimni ayblamaydi.",
      "A good neighbour: sees something odd, says so at once, and blames no one.",
    ),
    theory: [
      t(
        "Har bir xabar — tashkilot uchun bepul ogohlantirish.",
        "Every report is a free early warning for the organisation.",
      ),
    ],
    task: t("Savollarga javob bering.", "Answer the questions."),
    hint: t(
      "Tez, ma’lum yo‘l, faktlar, ayblovsiz.",
      "Fast, a known route, facts, no blame.",
    ),
    widget: {
      type: "quiz",
      questions: [
        {
          ask: t(
            "Xabarga parolingizni qo‘shasizmi?",
            "Do you include your password in the report?",
          ),
          options: [
            t("Hech qachon", "Never"),
            t("Ha, tekshirish uchun", "Yes, so they can check"),
            t("Faqat so‘rashsa", "Only if asked"),
          ],
          answer: 0,
          explain: t(
            "Parolni so‘ragan “xavfsizlik jamoasi” — o‘zi aldov.",
            "A “security team” that asks for your password is itself a scam.",
          ),
        },
        {
          ask: t(
            "Hodisadan keyin kompyuterni nima qilasiz?",
            "What do you do with the computer after an incident?",
          ),
          options: [
            t(
              "Tarmoqdan uzaman, lekin o‘chirmayman",
              "Disconnect it, but don’t switch it off",
            ),
            t("Darhol o‘chiraman", "Switch it off at once"),
            t("Qayta o‘rnataman", "Reinstall it"),
          ],
          answer: 0,
          explain: t(
            "Xotiradagi dalillar saqlanadi.",
            "Evidence in memory is kept.",
          ),
        },
      ],
    },
  },
];
