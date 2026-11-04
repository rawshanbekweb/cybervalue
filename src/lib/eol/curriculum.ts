// Academy Intermediate · Software and trust, module 4: End-of-life software.
// The lessons use ./tools.ts: a software inventory to check.
import type { CommonWidget, Lesson, Text } from "../anim-lab/types";

export type Widget = CommonWidget | { type: "inventory" };

export const PROGRESS_KEY = "cybervalue:eol:progress:v1";

const t = (uz: string, en: string): Text => ({ uz, en });

const KNOWING = t("Bilish", "Knowing");
const ACTING = t("Harakat", "Acting");

export const LESSONS: Lesson<Widget>[] = [
  {
    id: 1,
    group: KNOWING,
    title: t("Muddati tugash nima", "What end of life means"),
    minutes: 5,
    intro: t(
      "Har bir dasturning hayot sikli bor. Ishlab chiqaruvchi uni ma’lum muddat qo‘llab-quvvatlaydi: xatolarni va xavfsizlik zaifliklarini tuzatadi. Muddat tugagach (end of life, EOL), yangi zaiflik topilsa ham tuzatish chiqmaydi — u abadiy ochiq qoladi. Hujumchilar eski versiyalarni ataylab qidiradi, chunki ularning zaifliklari ma’lum va hech qachon yopilmaydi.",
      "Every piece of software has a life cycle. Its maker supports it for a set time, fixing bugs and security flaws. Once that ends (end of life, EOL), new flaws still get found but never get fixed — they stay open for good. Attackers deliberately look for old versions, because their flaws are known and will never be closed.",
    ),
    analogy: t(
      "Kafolati tugagan mashina: buzilsa, zavod endi tuzatmaydi.",
      "A car whose warranty has ended — and whose maker no longer makes parts.",
    ),
    theory: [
      t(
        "Ba’zi ishlab chiqaruvchilar pullik kengaytirilgan qo‘llab-quvvatlash (ESU) beradi — bu vaqtinchalik yechim.",
        "Some vendors sell extended support (ESU) — a stopgap, not a plan.",
      ),
    ],
    task: t("Savollarga javob bering.", "Answer the questions."),
    hint: t("Tuzatishlar to‘xtaydi.", "Fixes stop coming."),
    widget: {
      type: "quiz",
      questions: [
        {
          ask: t(
            "Dastur EOL bo‘lgach nima o‘zgaradi?",
            "What changes once software reaches end of life?",
          ),
          options: [
            t(
              "Yangi zaifliklar endi tuzatilmaydi",
              "New flaws no longer get fixed",
            ),
            t("Dastur darhol o‘chadi", "The program stops at once"),
            t("Hech narsa", "Nothing"),
          ],
          answer: 0,
          explain: t(
            "U ishlashda davom etadi, lekin himoyasiz.",
            "It keeps running, but unprotected.",
          ),
        },
        {
          ask: t(
            "Nega hujumchilar eski versiyalarni qidiradi?",
            "Why do attackers look for old versions?",
          ),
          options: [
            t(
              "Zaifliklari ma’lum va yopilmaydi",
              "Their flaws are known and never closed",
            ),
            t("Ular tezroq ishlaydi", "They run faster"),
            t("Ular bepul", "They are free"),
          ],
          answer: 0,
          explain: t(
            "Tayyor hujum vositalari ham ko‘pincha mavjud.",
            "Ready-made attack tools often exist too.",
          ),
        },
      ],
    },
  },
  {
    id: 2,
    group: KNOWING,
    title: t("Dasturlar ro‘yxati", "Software inventory"),
    minutes: 6,
    intro: t(
      "Bilmagan narsangizni himoya qila olmaysiz. Shuning uchun kompaniya o‘zida qaysi dastur, qaysi versiya va qayerda ishlayotganini ro‘yxatga oladi: operatsion tizimlar, serverdagi dasturlar, kutubxonalar, routerlar va printerlar ham. Ro‘yxat avtomatik yangilansa (MDM, inventarizatsiya agentlari, SBOM) yaxshi. Har bir yozuvga egasi va qo‘llab-quvvatlash muddati qo‘shiladi.",
      "You can’t protect what you don’t know about. So a company keeps a list of what software runs where, and in which version: operating systems, server software, libraries, and routers and printers too. It is best when the list updates itself (MDM, inventory agents, SBOMs). Each entry gets an owner and a support end date.",
    ),
    analogy: t(
      "Ombor daftari: nima bor, qayerda va yaroqlilik muddati qachon.",
      "A stock book: what you have, where it is, and when it expires.",
    ),
    theory: [
      t(
        "endoflife.date sayti yuzlab mahsulotlarning qo‘llab-quvvatlash muddatlarini jamlaydi.",
        "The endoflife.date site collects support dates for hundreds of products.",
      ),
    ],
    task: t("Savollarga javob bering.", "Answer the questions."),
    hint: t(
      "Nima, qaysi versiya, qayerda, kimniki.",
      "What, which version, where, whose.",
    ),
    widget: {
      type: "quiz",
      questions: [
        {
          ask: t(
            "Dasturlar ro‘yxatida nima bo‘lishi kerak?",
            "What belongs in a software inventory?",
          ),
          options: [
            t(
              "Nomi, versiyasi, joyi, egasi va muddati",
              "Name, version, location, owner and support end date",
            ),
            t("Faqat nomi", "Just the name"),
            t("Faqat narxi", "Just the price"),
          ],
          answer: 0,
          explain: t(
            "Shunda muddati yaqinlashganini ko‘rasiz.",
            "Then you can see what is about to expire.",
          ),
        },
        {
          ask: t(
            "Router va printerlar ro‘yxatga kiradimi?",
            "Do routers and printers belong in the inventory?",
          ),
          options: [
            t("Ha, ularda ham dastur bor", "Yes, they run software too"),
            t("Yo‘q", "No"),
            t("Faqat yangi bo‘lsa", "Only if they are new"),
          ],
          answer: 0,
          explain: t(
            "Ko‘p hujumlar aynan unutilgan qurilmalardan boshlanadi.",
            "Many attacks start on forgotten devices.",
          ),
        },
      ],
    },
  },
  {
    id: 3,
    group: KNOWING,
    title: t("Ro‘yxatni tekshirish", "Checking the inventory"),
    minutes: 8,
    intro: t(
      "Quyida kichik kompaniyaning dasturlar ro‘yxati (2026-yil oxiri holatiga). Har bir qatorda dastur, u qayerda ishlashi va qo‘llab-quvvatlash holati bor. To‘rttasi endi xavfsizlik yangilanishlarini olmaydi. Qaysilari?",
      "Below is a small company’s software inventory (as of late 2026). Each row shows the software, where it runs and its support status. Four no longer receive security updates. Which ones?",
    ),
    analogy: t(
      "Muzlatgichni tekshirish: muddati o‘tganlarni ajratish.",
      "Going through the fridge and pulling out what’s past its date.",
    ),
    theory: [
      t(
        "Internetga ochiq va muhim tizimlardagi EOL dasturlar birinchi navbatda almashtiriladi.",
        "EOL software on internet-facing or critical systems is replaced first.",
      ),
    ],
    task: t(
      "Qo‘llab-quvvatlanmaydiganlarni belgilang.",
      "Tick the ones that are out of support.",
    ),
    hint: t(
      "“Tugagan” va “yangilanish chiqarmaydi” degan qatorlar.",
      "The rows that say “ended” or “stopped releasing updates”.",
    ),
    widget: { type: "inventory" },
  },
  {
    id: 4,
    group: ACTING,
    title: t("Muddatlarni o‘qish", "Reading support dates"),
    minutes: 5,
    intro: t(
      "Ko‘p loyihalar LTS (long-term support) versiyalar chiqaradi: masalan Ubuntu LTS 5 yil standart qo‘llab-quvvatlanadi, oddiy versiyalar esa atigi 9 oy. Python har bir versiyani taxminan 5 yil, PHP esa 2 yil faol va 1 yil faqat xavfsizlik tuzatishlari bilan qo‘llab-quvvatlaydi. Yangi tizim qurayotganda doim muddati eng uzoq versiyani tanlang.",
      "Many projects publish LTS (long-term support) releases: Ubuntu LTS gets 5 years of standard support, for example, while interim releases get only 9 months. Python supports each version for about 5 years; PHP gives 2 years of active support plus 1 year of security fixes only. When building something new, always pick the version with the longest support ahead of it.",
    ),
    analogy: t(
      "Uzoq kafolatli mahsulotni tanlash.",
      "Choosing the product with the longer warranty.",
    ),
    theory: [
      t(
        "Muddatni kalendarga va ro‘yxatga yozib qo‘ying — 6 oy oldin eslatma.",
        "Put the date in the calendar and the inventory — with a reminder 6 months ahead.",
      ),
    ],
    task: t("Savollarga javob bering.", "Answer the questions."),
    hint: t("LTS — uzoq muddat.", "LTS means long-term."),
    widget: {
      type: "quiz",
      questions: [
        {
          ask: t(
            "Yangi server uchun qaysi Ubuntu versiyasi yaxshi?",
            "Which Ubuntu release suits a new server?",
          ),
          options: [
            t("Eng so‘nggi LTS", "The latest LTS"),
            t("9 oylik oraliq versiya", "A 9-month interim release"),
            t("Eng eski versiya", "The oldest release"),
          ],
          answer: 0,
          explain: t(
            "LTS bir necha yil yangilanish oladi.",
            "LTS gets updates for years.",
          ),
        },
        {
          ask: t(
            "Muddat tugashiga qachon tayyorlanish kerak?",
            "When should you prepare for an end-of-life date?",
          ),
          options: [
            t("Bir necha oy oldin", "Months ahead"),
            t("Tugagan kuni", "On the day it ends"),
            t("Hujumdan keyin", "After an attack"),
          ],
          answer: 0,
          explain: t(
            "Yangilash sinov va reja talab qiladi.",
            "Upgrades need testing and planning.",
          ),
        },
      ],
    },
  },
  {
    id: 5,
    group: ACTING,
    title: t("Yangilab bo‘lmasa", "When you can’t upgrade yet"),
    minutes: 6,
    intro: t(
      "Ba’zan eski dasturni darhol almashtirib bo‘lmaydi: qimmat uskunani boshqaradi yoki yangi versiyasi yo‘q. Unda xavfni kamaytiruvchi choralar ko‘riladi: qurilmani alohida tarmoqqa ajratish, internetdan uzish, kirish huquqini qisqartirish, kuzatishni kuchaytirish va almashtirish sanasini belgilash. Lekin bu choralar vaqtinchalik — reja bo‘lmasa, “vaqtinchalik” yillarga cho‘ziladi. Har bir harakatni to‘g‘ri guruhga ajrating.",
      "Sometimes old software can’t be replaced right away: it runs expensive equipment, or there is no newer version. Then you reduce the risk: move the device to its own network segment, cut it off from the internet, limit who can reach it, watch it more closely, and set a replacement date. These measures are temporary — without a plan, “temporary” stretches into years. Sort each action into the right group.",
    ),
    analogy: t(
      "Eski, lekin kerakli uskuna — alohida xonada, qulf ostida va kuzatuvda.",
      "Old but needed equipment: in its own room, locked, and watched.",
    ),
    theory: [
      t(
        "Qabul qilingan xavf hujjatlashtiriladi va rahbar tomonidan imzolanadi.",
        "An accepted risk is written down and signed off by a manager.",
      ),
    ],
    task: t("Harakatlarni ajrating.", "Sort the actions."),
    hint: t(
      "Ajratish va reja — to‘g‘ri; unutish — yo‘q.",
      "Isolating and planning are right; forgetting is not.",
    ),
    widget: {
      type: "sort",
      buckets: [
        { id: "good", label: t("To‘g‘ri", "Right") },
        { id: "bad", label: t("Noto‘g‘ri", "Wrong") },
      ],
      items: [
        {
          label: t(
            "Qurilmani alohida tarmoq segmentiga o‘tkazish",
            "Moving the device to its own network segment",
          ),
          bucket: "good",
        },
        {
          label: t(
            "Almashtirish sanasini belgilash",
            "Setting a replacement date",
          ),
          bucket: "good",
        },
        {
          label: t(
            "Unga kirishni bir nechta odam bilan cheklash",
            "Limiting access to a few people",
          ),
          bucket: "good",
        },
        {
          label: t(
            "Masofaviy kirish uchun internetga ochish",
            "Opening it to the internet for remote access",
          ),
          bucket: "bad",
        },
        {
          label: t(
            "Ro‘yxatdan o‘chirib, unutish",
            "Taking it off the inventory and forgetting it",
          ),
          bucket: "bad",
        },
        {
          label: t(
            "Hech kimga aytmasdan qoldirish",
            "Leaving it without telling anyone",
          ),
          bucket: "bad",
        },
      ],
    },
  },
  {
    id: 6,
    group: ACTING,
    title: t("Yangilashni rejalash", "Planning upgrades"),
    minutes: 5,
    intro: t(
      "Yaxshi yangilash rejasi oddiy: ro‘yxatdan muddati 12 oy ichida tugaydiganlarni ajrating, ularni muhimligi bo‘yicha tartiblang (internetga ochiq va maxfiy ma’lumotli — birinchi), sinov muhitida yangi versiyani tekshiring, zaxira oling, yangilang va ro‘yxatni yangilang. Byudjet ham oldindan rejalashtiriladi — eski qurilmani almashtirish pul talab qiladi.",
      "A good upgrade plan is simple: take everything in the inventory whose support ends within 12 months, rank it by importance (internet-facing and sensitive data first), test the new version somewhere safe, take a backup, upgrade, and update the inventory. Budget for it too — replacing old hardware costs money.",
    ),
    analogy: t(
      "Mashina texnik ko‘rigini oldindan rejalashtirish.",
      "Booking the car’s service before it breaks down.",
    ),
    theory: [
      t(
        "Yangilashdan oldin zaxira va qaytish rejasi (rollback) — majburiy.",
        "A backup and a rollback plan before upgrading are a must.",
      ),
    ],
    task: t("Savollarga javob bering.", "Answer the questions."),
    hint: t(
      "Muhimi birinchi, sinov va zaxira bilan.",
      "Most important first, with a test and a backup.",
    ),
    widget: {
      type: "quiz",
      questions: [
        {
          ask: t(
            "Qaysi EOL tizim birinchi yangilanadi?",
            "Which end-of-life system is upgraded first?",
          ),
          options: [
            t(
              "Internetga ochiq kompaniya sayti",
              "The internet-facing company website",
            ),
            t("Ombordagi o‘chiq kompyuter", "A switched-off PC in storage"),
            t("Farqi yo‘q", "It doesn’t matter"),
          ],
          answer: 0,
          explain: t(
            "Ochiq va muhim — eng xavfli.",
            "Exposed and important is the riskiest.",
          ),
        },
        {
          ask: t(
            "Yangilashdan oldin nima qilinadi?",
            "What do you do before upgrading?",
          ),
          options: [
            t("Sinov va zaxira", "Test and back up"),
            t("Hech narsa", "Nothing"),
            t("Loglarni o‘chirish", "Delete the logs"),
          ],
          answer: 0,
          explain: t(
            "Muammo bo‘lsa, qaytish mumkin.",
            "If it goes wrong, you can go back.",
          ),
        },
      ],
    },
  },
  {
    id: 7,
    group: ACTING,
    title: t("Qurilmalar va proshivka", "Devices and firmware"),
    minutes: 5,
    intro: t(
      "Router, kamera, printer va “aqlli” qurilmalar ichida ham dastur — proshivka (firmware) bor. Ular ko‘pincha unutiladi: zavod paroli bilan qoladi va yillab yangilanmaydi. Sotib olishdan oldin ishlab chiqaruvchi necha yil yangilanish va’da qilishini tekshiring, avtomatik yangilanishni yoqing va qo‘llab-quvvatlash tugagan qurilmani almashtiring.",
      "Routers, cameras, printers and “smart” devices run software too — firmware. They are often forgotten: left on the factory password and never updated for years. Before buying, check how many years of updates the maker promises; turn on automatic updates; and replace devices whose support has ended.",
    ),
    analogy: t(
      "Uy eshigidagi qulf ham vaqti-vaqti bilan almashtiriladi.",
      "Even the lock on the front door gets replaced in time.",
    ),
    theory: [
      t(
        "Ba’zi mamlakatlar qonunlari ishlab chiqaruvchidan yangilanish muddatini e’lon qilishni talab qiladi.",
        "Some countries now require makers to state how long updates will last.",
      ),
    ],
    task: t("Savollarga javob bering.", "Answer the questions."),
    hint: t("Proshivka ham dastur.", "Firmware is software too."),
    widget: {
      type: "quiz",
      questions: [
        {
          ask: t(
            "Router sotib olishdan oldin nimani tekshirish kerak?",
            "What should you check before buying a router?",
          ),
          options: [
            t(
              "Ishlab chiqaruvchi necha yil yangilanish beradi",
              "How many years of updates the maker promises",
            ),
            t("Faqat rangini", "Only its colour"),
            t("Antennalar sonini", "How many antennas it has"),
          ],
          answer: 0,
          explain: t(
            "Yangilanmaydigan router — tarmoqning ochiq eshigi.",
            "An unpatched router is an open door to the network.",
          ),
        },
        {
          ask: t(
            "Ishlab chiqaruvchi kamera proshivkasini yangilashni to‘xtatdi. Nima qilasiz?",
            "The maker stopped updating a camera’s firmware. What do you do?",
          ),
          options: [
            t(
              "Almashtiraman, hozircha ajratilgan tarmoqda ushlayman",
              "Replace it, keeping it on an isolated network meanwhile",
            ),
            t("Internetga ochaman", "Expose it to the internet"),
            t("Hech narsa", "Nothing"),
          ],
          answer: 0,
          explain: t(
            "Ajratish — vaqtinchalik, almashtirish — yechim.",
            "Isolation is temporary; replacement is the fix.",
          ),
        },
      ],
    },
  },
  {
    id: 8,
    group: ACTING,
    title: t("Yakuniy savollar", "Final questions"),
    minutes: 5,
    intro: t(
      "Muddati o‘tgan dasturlar — tuzatilmaydigan zaifliklar. Ro‘yxatni yuriting, har bir dasturning muddatini biling, muhimlarini oldindan yangilang va almashtirib bo‘lmaydiganini ajratib, sana belgilang. Keyingi modul — fayllarni xavfsiz ochish: hujjatlar, arxivlar va makroslar.",
      "Software past its end of life means flaws that will never be fixed. Keep an inventory, know each item’s support date, upgrade the important ones ahead of time, and isolate what you can’t replace yet — with a date. Next module: opening files safely — documents, archives and macros.",
    ),
    analogy: t(
      "Dorilar qutisini tekshirib, muddati o‘tganlarini tashlash.",
      "Going through the medicine cabinet and throwing out what’s expired.",
    ),
    theory: [
      t(
        "Har chorakda ro‘yxatni muddatlar bo‘yicha tekshiring.",
        "Check the inventory against support dates every quarter.",
      ),
    ],
    task: t("Savollarga javob bering.", "Answer the questions."),
    hint: t(
      "Ro‘yxat, muddat, reja, ajratish.",
      "Inventory, dates, plan, isolate.",
    ),
    widget: {
      type: "quiz",
      questions: [
        {
          ask: t(
            "Windows 7 bilan ishlayotgan kompyuter — bu?",
            "A PC still running Windows 7 is?",
          ),
          options: [
            t(
              "Qo‘llab-quvvatlanmaydi — almashtirish kerak",
              "Out of support — replace it",
            ),
            t("Xavfsiz, agar ishlasa", "Safe as long as it works"),
            t("Eng yangi tizim", "The newest system"),
          ],
          answer: 0,
          explain: t(
            "Qo‘llab-quvvatlash 2020-yilda tugagan.",
            "Its support ended in 2020.",
          ),
        },
        {
          ask: t(
            "Nega dasturlar ro‘yxati kerak?",
            "Why keep a software inventory?",
          ),
          options: [
            t(
              "Bilmagan narsani himoya qila olmaysiz",
              "You can’t protect what you don’t know about",
            ),
            t("Soliq uchun xolos", "Only for taxes"),
            t("Kerak emas", "You don’t need one"),
          ],
          answer: 0,
          explain: t(
            "Ro‘yxat — har qanday rejaning boshi.",
            "The inventory is where every plan starts.",
          ),
        },
      ],
    },
  },
];
