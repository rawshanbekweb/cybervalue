// Academy Intermediate · OSINT, module 1: Ethics and law. The lessons use
// ./tools.ts: an authorisation letter and research actions to check against
// its scope, methods and dates.
import type { CommonWidget, Lesson, Text } from "../anim-lab/types";

export type Widget = CommonWidget | { type: "scope" };

export const PROGRESS_KEY = "cybervalue:ethics:progress:v1";

const t = (uz: string, en: string): Text => ({ uz, en });

const OPEN = t("Ochiq manba", "Open sources");
const RULES = t("Qoidalar", "The rules");
const CRAFT = t("Ish odobi", "Good practice");

export const LESSONS: Lesson<Widget>[] = [
  {
    id: 1,
    group: OPEN,
    title: t("Ochiq manba nima", "What counts as open"),
    minutes: 6,
    intro: t(
      "OSINT (open-source intelligence) — hamma qonuniy ravishda ko‘ra oladigan ma’lumotlardan xulosa chiqarish: saytlar, ochiq ijtimoiy tarmoq sahifalari, DNS va sertifikat yozuvlari, davlat reyestrlari, arxivlar. Parolni buzib, birovning akkauntiga kirib yoki o‘g‘irlangan bazadan olingan ma’lumot ochiq manba emas.",
      "OSINT (open-source intelligence) means drawing conclusions from information anyone can lawfully see: websites, public social media pages, DNS and certificate records, government registers, archives. Information taken by cracking a password, getting into someone’s account or out of a stolen database is not open source.",
    ),
    analogy: t(
      "Kutubxonadagi kitobni o‘qish — OSINT. Qo‘shnining pochta qutisini ochish — yo‘q.",
      "Reading a library book is OSINT. Opening your neighbour’s post is not.",
    ),
    theory: [
      t(
        "“Internetda bor” degani “olish mumkin” degani emas: sizib chiqqan baza ham internetda bor.",
        "“It’s on the internet” doesn’t mean “it’s fair to take”: leaked databases are on the internet too.",
      ),
    ],
    task: t(
      "Har bir manba ochiqmi yoki yo‘qmi?",
      "Is each source open, or not?",
    ),
    hint: t(
      "Login, buzish yoki o‘g‘irlik kerak bo‘lsa — ochiq emas.",
      "If it needs a login you don’t own, a break-in or theft, it isn’t open.",
    ),
    widget: {
      type: "sort",
      buckets: [
        { id: "open", label: t("Ochiq manba", "Open source") },
        { id: "closed", label: t("Ochiq emas", "Not open") },
      ],
      items: [
        {
          label: t(
            "Kompaniya saytidagi “Biz haqimizda” sahifasi",
            "A company’s “About us” page",
          ),
          bucket: "open",
        },
        {
          label: t(
            "Domenning WHOIS va DNS yozuvlari",
            "A domain’s WHOIS and DNS records",
          ),
          bucket: "open",
        },
        {
          label: t(
            "Yuridik shaxslar davlat reyestri",
            "The government register of companies",
          ),
          bucket: "open",
        },
        {
          label: t(
            "Forumda sotilayotgan sizib chiqqan mijozlar bazasi",
            "A leaked customer database sold on a forum",
          ),
          bucket: "closed",
        },
        {
          label: t(
            "Xodimning taxmin qilingan paroli bilan ochilgan pochta",
            "A worker’s mailbox opened with a guessed password",
          ),
          bucket: "closed",
        },
        {
          label: t(
            "Yopiq Telegram guruhiga soxta ism bilan kirib olingan xabarlar",
            "Messages from a private Telegram group joined under false pretences",
          ),
          bucket: "closed",
        },
      ],
    },
  },
  {
    id: 2,
    group: RULES,
    title: t("Qonun nima deydi", "What the law says"),
    minutes: 8,
    intro: t(
      "O‘zbekistonda “Shaxsga doir ma’lumotlar to‘g‘risida”gi Qonun (2019) shaxsiy ma’lumotlarni yig‘ish va ishlatishni tartibga soladi: maqsad aniq bo‘lishi, faqat kerakli ma’lumot olinishi va himoyalanishi kerak. Jinoyat kodeksi esa kompyuter tizimiga ruxsatsiz kirishni jinoyat deb belgilaydi. Yevropada GDPR shunga o‘xshash qoidalar qo‘yadi.",
      "In Uzbekistan, the Law “On Personal Data” (2019) governs collecting and using personal data: the purpose must be clear, only what is needed may be gathered, and it must be protected. The Criminal Code makes unauthorised access to a computer system a crime. In Europe, the GDPR sets similar rules.",
    ),
    analogy: t(
      "Fotograf ko‘chada suratga olishi mumkin, lekin derazadan uyga qarab turishi mumkin emas.",
      "A photographer may shoot in the street, but not stand peering through someone’s window.",
    ),
    theory: [
      t(
        "Bu kurs huquqiy maslahat emas. Haqiqiy ishdan oldin tashkilotingiz yuristi bilan maslahatlashing.",
        "This course isn’t legal advice. Before real work, check with your organisation’s lawyer.",
      ),
    ],
    task: t("Savollarga javob bering.", "Answer the questions."),
    hint: t(
      "Ochiq bo‘lsa ham — shaxsiy ma’lumot himoyalanadi.",
      "Even when public, personal data is protected.",
    ),
    widget: {
      type: "quiz",
      questions: [
        {
          ask: t(
            "Odamning ochiq profilidagi ma’lumotni yig‘ib, sotish mumkinmi?",
            "May you collect data from a person’s public profile and sell it?",
          ),
          options: [
            t(
              "Yo‘q — shaxsiy ma’lumot ochiq bo‘lsa ham qonun bilan himoyalangan",
              "No — personal data is protected by law even when public",
            ),
            t("Ha, u ochiq", "Yes, it’s public"),
            t("Ha, agar arzon bo‘lsa", "Yes, if the price is low"),
          ],
          answer: 0,
          explain: t(
            "Maqsad va asos kerak.",
            "You need a purpose and a lawful basis.",
          ),
        },
        {
          ask: t(
            "Taxmin qilingan parol bilan birovning akkauntiga “faqat qarash uchun” kirish?",
            "Logging into someone’s account with a guessed password “just to look”?",
          ),
          options: [
            t("Ruxsatsiz kirish — jinoyat", "Unauthorised access — a crime"),
            t("OSINT usuli", "An OSINT technique"),
            t(
              "Ruxsat etilgan, agar hech narsa o‘zgartirilmasa",
              "Fine if nothing is changed",
            ),
          ],
          answer: 0,
          explain: t(
            "Niyat emas, harakat muhim.",
            "The act matters, not the intention.",
          ),
        },
        {
          ask: t(
            "Ma’lumotlarni minimallashtirish nimani bildiradi?",
            "What does data minimisation mean?",
          ),
          options: [
            t(
              "Faqat maqsad uchun kerakli ma’lumotni yig‘ish",
              "Collecting only what the purpose needs",
            ),
            t("Fayllarni siqish", "Compressing files"),
            t(
              "Hamma narsani yig‘ish, keyin saralash",
              "Collecting everything, sorting later",
            ),
          ],
          answer: 0,
          explain: t(
            "Yig‘ilmagan ma’lumot sizib chiqmaydi.",
            "Data you never collected can’t leak.",
          ),
        },
      ],
    },
  },
  {
    id: 3,
    group: RULES,
    title: t("Ruxsat doirasi", "Scope and authorisation"),
    minutes: 10,
    intro: t(
      "Professional OSINT ishi yozma ruxsat bilan boshlanadi: mijoz kim, nimani tekshirish mumkin (in scope), nimani mumkin emas (out of scope), qaysi usullar va qaysi sanalarda. Har bir harakatdan oldin uchta savol: maqsad doirada mi? Usul ruxsat etilganmi? Sana muddat ichidami?",
      "Professional OSINT work starts with a written authorisation: who the client is, what may be examined (in scope), what may not (out of scope), which methods and on which dates. Before every action, three questions: is the target in scope? Is the method allowed? Is the date inside the window?",
    ),
    analogy: t(
      "Ta’mirchi ruxsatnomasi: qaysi kvartira, qaysi xonalar va qaysi kunlari — boshqa xonaga kirish huquqi yo‘q.",
      "A builder’s work order: which flat, which rooms, which days — no right to walk into other rooms.",
    ),
    theory: [
      t(
        "Shubha bo‘lsa — to‘xtang va mijozdan yozma tasdiq so‘rang.",
        "When in doubt, stop and ask the client for written confirmation.",
      ),
    ],
    task: t(
      "Ruxsat xatini o‘qib, har bir harakat ruxsat etilganmi yoki yo‘qligini belgilang.",
      "Read the authorisation and mark whether each action is allowed.",
    ),
    hint: t(
      "Maqsad, usul va sana — uchalasi ham mos kelishi kerak.",
      "Target, method and date must all fit.",
    ),
    widget: { type: "scope" },
  },
  {
    id: 4,
    group: RULES,
    title: t("Passiv va faol", "Passive and active"),
    minutes: 6,
    intro: t(
      "Passiv razvedka maqsad bilan to‘g‘ridan-to‘g‘ri aloqa qilmaydi: ochiq yozuvlar, arxivlar, qidiruv tizimlari. Faol razvedka maqsadga tegadi: skanerlash, qo‘ng‘iroq qilish, xat yuborish. Faol ishlar odatda alohida ruxsat talab qiladi va maqsad buni sezishi mumkin.",
      "Passive reconnaissance never touches the target directly: public records, archives, search engines. Active reconnaissance does: scanning, phoning, emailing. Active work usually needs separate permission, and the target may notice.",
    ),
    analogy: t(
      "Uyni ko‘chadan kuzatish — passiv; eshik qo‘ng‘irog‘ini bosib ko‘rish — faol.",
      "Looking at a house from the street is passive; ringing the doorbell is active.",
    ),
    theory: [
      t(
        "Sertifikat jurnallari va DNS tarixi passiv: ma’lumot uchinchi tomon serverlaridan olinadi.",
        "Certificate logs and DNS history are passive: the data comes from third-party servers.",
      ),
    ],
    task: t(
      "Har bir harakat passivmi yoki faolmi?",
      "Is each action passive or active?",
    ),
    hint: t(
      "Maqsadning serveri yoki xodimi bilan aloqa — faol.",
      "Any contact with the target’s servers or staff is active.",
    ),
    widget: {
      type: "sort",
      buckets: [
        { id: "passive", label: t("Passiv", "Passive") },
        { id: "active", label: t("Faol", "Active") },
      ],
      items: [
        {
          label: t(
            "crt.sh’da sertifikatlarni qidirish",
            "Searching certificates on crt.sh",
          ),
          bucket: "passive",
        },
        {
          label: t(
            "Wayback Machine’da eski sahifalarni ko‘rish",
            "Reading old pages on the Wayback Machine",
          ),
          bucket: "passive",
        },
        {
          label: t(
            "Qidiruv tizimida site: operatori bilan qidirish",
            "Searching with the site: operator in a search engine",
          ),
          bucket: "passive",
        },
        {
          label: t(
            "Kompaniya serverlarini port bo‘yicha skanerlash",
            "Port-scanning the company’s servers",
          ),
          bucket: "active",
        },
        {
          label: t(
            "IT xodim deb qo‘ng‘iroq qilib, parol so‘rash",
            "Phoning staff as “IT” and asking for a password",
          ),
          bucket: "active",
        },
      ],
    },
  },
  {
    id: 5,
    group: CRAFT,
    title: t("Zarar keltirmaslik", "Doing no harm"),
    minutes: 6,
    intro: t(
      "OSINT natijasi odamlarga zarar yetkazishi mumkin: doxxing (shaxsiy ma’lumotni ommaga chiqarish), ta’qib, firibgarlik. Professional qoida: faqat vazifa uchun kerakli narsani yig‘ish, oila va bolalarni hech qachon nishonga olmaslik, hisobotda shaxsiy tafsilotlarni yashirish va topilmalarni xavfsiz saqlash.",
      "OSINT results can hurt people: doxxing (publishing someone’s personal details), stalking, fraud. The professional rule: collect only what the task needs, never target families and children, redact personal details in reports, and store findings securely.",
    ),
    analogy: t(
      "Shifokor bemor siri bilan ishlaydi — lekin uni hech kimga aytmaydi.",
      "A doctor handles patients’ secrets — and tells no one.",
    ),
    theory: [
      t(
        "Savol: “Bu ma’lumot hisobotda bo‘lmasa, xulosa o‘zgaradimi?” Yo‘q bo‘lsa — yig‘mang.",
        "Ask: “Would the conclusion change without this detail?” If not, don’t collect it.",
      ),
    ],
    task: t("Savollarga javob bering.", "Answer the questions."),
    hint: t(
      "Kerak bo‘lmagan ma’lumot — xavf.",
      "Data you don’t need is a liability.",
    ),
    widget: {
      type: "quiz",
      questions: [
        {
          ask: t("Doxxing nima?", "What is doxxing?"),
          options: [
            t(
              "Birovning shaxsiy ma’lumotlarini roziligisiz ommaga chiqarish",
              "Publishing someone’s personal details without consent",
            ),
            t("Hujjat formatlash", "Formatting documents"),
            t("Domen ro‘yxatdan o‘tkazish", "Registering a domain"),
          ],
          answer: 0,
          explain: t(
            "U ta’qib va tahdidga yo‘l ochadi.",
            "It opens the door to stalking and threats.",
          ),
        },
        {
          ask: t(
            "Hisobotda xodimning shaxsiy telefon raqami topildi. Nima qilasiz?",
            "A worker’s private phone number turned up. What goes in the report?",
          ),
          options: [
            t(
              "“Shaxsiy raqam ochiq topildi” deb yozib, raqamning o‘zini yashiraman",
              "“A private number is publicly findable”, with the number itself redacted",
            ),
            t("Raqamni to‘liq yozaman", "The full number"),
            t("Raqamga qo‘ng‘iroq qilib tekshiraman", "I ring it to check"),
          ],
          answer: 0,
          explain: t(
            "Xulosa muhim, tafsilot emas.",
            "The finding matters, not the detail.",
          ),
        },
      ],
    },
  },
  {
    id: 6,
    group: CRAFT,
    title: t("Tadqiqotchi xavfsizligi", "The researcher’s OPSEC"),
    minutes: 6,
    intro: t(
      "Siz maqsadni o‘rganayotganda, maqsad ham sizni ko‘rishi mumkin: LinkedIn kim ko‘rganini ko‘rsatadi, sayt egasi IP manzillarni loglarda ko‘radi. Shuning uchun tadqiqot alohida virtual mashinada, alohida brauzer profilida va ishga bog‘liq bo‘lmagan tarmoqdan olib boriladi. Soxta shaxs (sock puppet) faqat ruxsat bo‘lsa va qonun doirasida ishlatiladi.",
      "While you study the target, the target may see you: LinkedIn shows who viewed a profile, site owners see IP addresses in their logs. So research runs in a separate virtual machine, a separate browser profile and from a network not tied to your work. A fake persona (sock puppet) is used only when allowed and within the law.",
    ),
    analogy: t(
      "Kuzatuvchi detektiv o‘z mashinasida emas, oddiy, e’tiborni tortmaydigan mashinada yuradi.",
      "A detective on surveillance drives a plain car, not their own.",
    ),
    theory: [
      t(
        "OPSEC (operational security) — o‘z izingizni boshqarish.",
        "OPSEC (operational security) means managing your own footprint.",
      ),
    ],
    task: t("Savollarga javob bering.", "Answer the questions."),
    hint: t("Maqsad sizni sezmasin.", "Don’t tip the target off."),
    widget: {
      type: "quiz",
      questions: [
        {
          ask: t(
            "Nega shaxsiy LinkedIn akkauntingiz bilan maqsad xodimlari profillarini ko‘rmaslik kerak?",
            "Why not view target staff profiles from your own LinkedIn account?",
          ),
          options: [
            t(
              "Ular kim ko‘rganini ko‘radi va tekshiruvni sezadi",
              "They can see who viewed them and notice the assessment",
            ),
            t("LinkedIn ishlamaydi", "LinkedIn won’t work"),
            t("Farqi yo‘q", "It makes no difference"),
          ],
          answer: 0,
          explain: t(
            "Bu “tipping off” — maqsadni ogohlantirish.",
            "That is tipping off the target.",
          ),
        },
        {
          ask: t(
            "Tadqiqot uchun eng yaxshi muhit?",
            "The best setup for research?",
          ),
          options: [
            t(
              "Alohida VM va brauzer profili, ishga bog‘liq bo‘lmagan tarmoq",
              "A separate VM and browser profile on a network not tied to work",
            ),
            t("Ish kompyuteri va ish pochtasi", "Your work PC and work email"),
            t("Do‘stning telefoni", "A friend’s phone"),
          ],
          answer: 0,
          explain: t(
            "Izlar ajratilgan va tozalanadi.",
            "Traces stay separate and can be wiped.",
          ),
        },
      ],
    },
  },
  {
    id: 7,
    group: CRAFT,
    title: t("Topilmani qayd etish", "Recording a finding"),
    minutes: 6,
    intro: t(
      "Internetdagi sahifa ertaga yo‘qolishi mumkin. Shuning uchun har bir topilma manba, vaqt (UTC), arxiv nusxasi, skrinshot xeshi va ishonch darajasi bilan yoziladi. Shunda boshqa tahlilchi uni tekshira oladi va hisobot sudda ham ishonchli bo‘ladi.",
      "A page online can vanish tomorrow. So every finding is recorded with its source, the time (UTC), an archived copy, a hash of the screenshot and a confidence level. Then another analyst can check it, and the report holds up even in court.",
    ),
    analogy: t(
      "Jurnalist manbasini yozib qo‘yadi — keyin “qayerdan bildingiz?” degan savolga javob bor.",
      "A journalist notes their source — so “how do you know?” always has an answer.",
    ),
    theory: [
      t(
        "Bu kriminalistikadagi dalil zanjiriga o‘xshaydi.",
        "It is the OSINT version of the forensic chain of custody.",
      ),
    ],
    task: t(
      "Yozuvning har bir qismini bosib, nima ekanini o‘qing.",
      "Click each part of the record and read what it is.",
    ),
    hint: t("Hammasi bo‘lib beshta qism.", "Five parts in all."),
    widget: {
      type: "anatomy",
      lines: [
        [
          {
            text: "source: https://git.sarbon-logistics.example/infra/.env",
            id: "source",
          },
        ],
        [{ text: "seen: 2026-11-04T09:12Z", id: "seen" }],
        [
          {
            text: "archive: https://web.archive.org/web/20261104091300/…",
            id: "archive",
          },
        ],
        [{ text: "sha256(screenshot): 3f9c…e1a7", id: "hash" }],
        [
          {
            text: "confidence: high — file in the company’s own org",
            id: "confidence",
          },
        ],
      ],
      parts: [
        {
          id: "source",
          title: t("Manba", "Source"),
          body: t(
            "Aniq manzil — boshqa odam xuddi shu joyni topa olishi uchun.",
            "The exact address — so someone else can find the same place.",
          ),
        },
        {
          id: "seen",
          title: t("Vaqt (UTC)", "Time (UTC)"),
          body: t(
            "Qachon ko‘rilgani: sahifa keyin o‘zgarishi mumkin.",
            "When it was seen: the page may change later.",
          ),
        },
        {
          id: "archive",
          title: t("Arxiv nusxasi", "Archived copy"),
          body: t(
            "Asl sahifa o‘chirilsa ham, dalil qoladi.",
            "The evidence survives even if the original is deleted.",
          ),
        },
        {
          id: "hash",
          title: t("Skrinshot xeshi", "Screenshot hash"),
          body: t(
            "Skrinshot keyin o‘zgartirilmaganini isbotlaydi.",
            "Proves the screenshot wasn’t altered later.",
          ),
        },
        {
          id: "confidence",
          title: t("Ishonch darajasi", "Confidence"),
          body: t(
            "Qanchalik ishonchli va nima uchun — o‘quvchi xulosani to‘g‘ri baholashi uchun.",
            "How sure you are and why — so the reader weighs the finding correctly.",
          ),
        },
      ],
    },
  },
  {
    id: 8,
    group: CRAFT,
    title: t("Yakuniy savollar", "Final questions"),
    minutes: 6,
    intro: t(
      "Modulni takrorlaymiz: ochiq manba, qonun, ruxsat doirasi, passiv va faol razvedka, zarar keltirmaslik, OPSEC va topilmani qayd etish.",
      "A review of the module: open sources, the law, scope, passive and active reconnaissance, doing no harm, OPSEC and recording findings.",
    ),
    analogy: t(
      "Yaxshi tadqiqotchi — yaxshi mehmon: faqat ruxsat etilgan xonalarga kiradi va hech narsani olib ketmaydi.",
      "A good researcher is a good guest: enters only the rooms they are invited into and takes nothing.",
    ),
    theory: [
      t(
        "Keyingi modulda qidiruv texnikasini o‘rganamiz.",
        "In the next module we learn search technique.",
      ),
    ],
    task: t(
      "Barcha savollarga to‘g‘ri javob bering.",
      "Answer every question correctly.",
    ),
    hint: t("Maqsad, usul, sana.", "Target, method, date."),
    widget: {
      type: "quiz",
      questions: [
        {
          ask: t(
            "Sizib chiqqan baza internetda ochiq turibdi. U OSINT manbami?",
            "A leaked database sits openly online. Is it an OSINT source?",
          ),
          options: [
            t(
              "Yo‘q — o‘g‘irlangan ma’lumot ochiq manba emas",
              "No — stolen data isn’t open source",
            ),
            t("Ha, u ochiq", "Yes, it’s out there"),
            t("Ha, agar bepul bo‘lsa", "Yes, if it’s free"),
          ],
          answer: 0,
          explain: t(
            "Mavjudligi qonuniyligini anglatmaydi.",
            "Being available doesn’t make it lawful.",
          ),
        },
        {
          ask: t(
            "Ruxsat 2-noyabrdan. Ishni 30-oktabrda boshlash mumkinmi?",
            "The authorisation starts on 2 November. May you start on 30 October?",
          ),
          options: [
            t("Yo‘q", "No"),
            t("Ha, passiv bo‘lsa", "Yes, if it’s passive"),
            t("Ha, ertaroq yaxshi", "Yes, earlier is better"),
          ],
          answer: 0,
          explain: t(
            "Muddatdan tashqari ish — ruxsatsiz ish.",
            "Work outside the window is unauthorised.",
          ),
        },
        {
          ask: t(
            "Port skanerlash qaysi turga kiradi?",
            "Which kind is port scanning?",
          ),
          options: [
            t("Faol", "Active"),
            t("Passiv", "Passive"),
            t("Hech qaysi", "Neither"),
          ],
          answer: 0,
          explain: t(
            "U maqsad serverlariga tegadi.",
            "It touches the target’s servers.",
          ),
        },
        {
          ask: t(
            "Topilmani qayd etishda nima shart?",
            "What must a recorded finding include?",
          ),
          options: [
            t(
              "Manba, UTC vaqt, arxiv nusxasi va ishonch darajasi",
              "Source, UTC time, an archived copy and a confidence level",
            ),
            t("Faqat skrinshot", "Just a screenshot"),
            t("Hech narsa", "Nothing"),
          ],
          answer: 0,
          explain: t(
            "Boshqalar tekshira olishi kerak.",
            "Others must be able to check it.",
          ),
        },
      ],
    },
  },
];
