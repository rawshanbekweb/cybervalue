// Academy Intermediate · OSINT, module 2: Search technique. The lessons use
// ./tools.ts: a small search engine with real operators over twelve
// invented pages.
import type { CommonWidget, Lesson, Text } from "../anim-lab/types";

export type Widget = CommonWidget | { type: "operators" };

export const PROGRESS_KEY = "cybervalue:search:progress:v1";

const t = (uz: string, en: string): Text => ({ uz, en });
const code = (s: string): Text => ({ uz: s, en: s });

const FIND = t("Topish", "Finding");
const PAST = t("O‘tmish", "The past");
const CHECK = t("Tasdiqlash", "Checking");

export const LESSONS: Lesson<Widget>[] = [
  {
    id: 1,
    group: FIND,
    title: t("Qidiruv tizimi nimani ko‘radi", "What a search engine sees"),
    minutes: 6,
    intro: t(
      "Qidiruv tizimi butun internetni emas, o‘zi indekslagan sahifalarni ko‘rsatadi. Login ortidagi sahifalar, robots.txt bilan yopilganlar va yangi sahifalar odatda chiqmaydi. Har bir tizim (Google, Bing, Yandex, DuckDuckGo) boshqacha indekslaydi — shuning uchun tahlilchi bir nechtasidan foydalanadi.",
      "A search engine shows only the pages it has indexed, not the whole internet. Pages behind logins, pages blocked by robots.txt and very new pages usually don’t appear. Each engine (Google, Bing, Yandex, DuckDuckGo) indexes differently — so analysts use several.",
    ),
    analogy: t(
      "Kutubxona katalogi: kitob kutubxonada bo‘lsa ham, katalogga kiritilmagan bo‘lsa, topa olmaysiz.",
      "A library catalogue: if a book never made it into the catalogue, you won’t find it, even if it is on a shelf.",
    ),
    theory: [
      t(
        "robots.txt — qidiruv robotlariga iltimos, qulf emas. Uni ochib o‘qish mumkin va u ko‘pincha “yashirin” papkalarni ko‘rsatib qo‘yadi.",
        "robots.txt is a request to crawlers, not a lock. Anyone can read it — and it often points at the “hidden” folders.",
      ),
    ],
    task: t("Savollarga javob bering.", "Answer the questions."),
    hint: t("Indekslanmagan — topilmaydi.", "Not indexed means not found."),
    widget: {
      type: "quiz",
      questions: [
        {
          ask: t(
            "Nega bitta qidiruv tizimi yetarli emas?",
            "Why isn’t one search engine enough?",
          ),
          options: [
            t(
              "Har biri boshqa sahifalarni indekslaydi va boshqa tartibda ko‘rsatadi",
              "Each indexes different pages and ranks them differently",
            ),
            t("Ular bir xil", "They are all the same"),
            t("Faqat bittasi qonuniy", "Only one is legal"),
          ],
          answer: 0,
          explain: t(
            "Yandex, masalan, MDH saytlarini yaxshiroq indekslaydi.",
            "Yandex, for one, indexes CIS sites better.",
          ),
        },
        {
          ask: t(
            "robots.txt’da “Disallow: /backup/” yozilgan. Bu nimani bildiradi?",
            "robots.txt says “Disallow: /backup/”. What does that mean?",
          ),
          options: [
            t(
              "Robotlardan indekslamaslikni so‘rash — papka baribir mavjud bo‘lishi mumkin",
              "Crawlers are asked not to index it — the folder may still exist",
            ),
            t("Papka qulflangan", "The folder is locked"),
            t("Papka o‘chirilgan", "The folder was deleted"),
          ],
          answer: 0,
          explain: t(
            "Bu himoya emas — va qiziq joyni ko‘rsatib qo‘yadi.",
            "It isn’t protection — and it points at something interesting.",
          ),
        },
      ],
    },
  },
  {
    id: 2,
    group: FIND,
    title: t("Operatorlar", "Search operators"),
    minutes: 6,
    intro: t(
      "Operatorlar qidiruvni toraytiradi. site: — faqat bitta domen (va uning subdomenlari); filetype: — fayl turi; intitle: — sarlavhadagi so‘z; qo‘shtirnoq — aynan shu ibora; minus — bu so‘z bo‘lmasin. Ularni birlashtirib yozish “dorking” deyiladi.",
      "Operators narrow a search. site: limits it to one domain (and its subdomains); filetype: to a file type; intitle: to a word in the title; quotes mean this exact phrase; a minus means leave this word out. Combining them is called dorking.",
    ),
    analogy: t(
      "Do‘konda: “faqat shu bo‘lim, faqat shu brend, faqat qizil, lekin chegirmasiz”.",
      "In a shop: “only this department, only this brand, only red, but not on sale”.",
    ),
    theory: [
      t(
        "Google Hacking Database (GHDB) — ochiq qolgan fayl va panellarni topadigan tayyor so‘rovlar to‘plami.",
        "The Google Hacking Database (GHDB) collects ready-made queries that find exposed files and panels.",
      ),
    ],
    task: t(
      "So‘rovning har bir qismini bosib, nima ekanini o‘qing.",
      "Click each part of the query and read what it does.",
    ),
    hint: t("Hammasi bo‘lib beshta qism.", "Five parts in all."),
    widget: {
      type: "anatomy",
      lines: [
        [
          { text: "site:sarbon-logistics.example", id: "site" },
          { text: " " },
          { text: "filetype:pdf", id: "filetype" },
          { text: " " },
          { text: "intitle:price", id: "intitle" },
          { text: " " },
          { text: '"price list"', id: "phrase" },
          { text: " " },
          { text: "-draft", id: "exclude" },
        ],
      ],
      parts: [
        {
          id: "site",
          title: code("site:"),
          body: t(
            "Faqat shu domen va uning subdomenlari (cdn., mail. va hokazo).",
            "Only this domain and its subdomains (cdn., mail. and so on).",
          ),
        },
        {
          id: "filetype",
          title: code("filetype:"),
          body: t(
            "Faqat shu kengaytmali fayllar: pdf, docx, xlsx, sql, env…",
            "Only files with this extension: pdf, docx, xlsx, sql, env…",
          ),
        },
        {
          id: "intitle",
          title: code("intitle:"),
          body: t(
            "So‘z sahifa sarlavhasida bo‘lishi kerak.",
            "The word must be in the page title.",
          ),
        },
        {
          id: "phrase",
          title: t("Qo‘shtirnoq", "Quotes"),
          body: t(
            "Aynan shu ibora, shu tartibda.",
            "This exact phrase, in this order.",
          ),
        },
        {
          id: "exclude",
          title: t("Minus", "Minus"),
          body: t(
            "Bu so‘z bo‘lgan natijalarni olib tashlaydi.",
            "Drops results containing this word.",
          ),
        },
      ],
    },
  },
  {
    id: 3,
    group: FIND,
    title: t("Ochiq qolgan faylni topish", "Finding the exposed file"),
    minutes: 12,
    intro: t(
      "Sarbon Logistics ruxsat bergan tekshiruvda bitta xavotir bor: ichki narxlar ro‘yxati internetga chiqib qolgan bo‘lishi mumkin. Oddiy “price list” qidiruvi forum, raqib va yangiliklarni ham chiqaradi. Operatorlar bilan natijani aynan bitta faylgacha toraytiring.",
      "In an authorised assessment for Sarbon Logistics there is one worry: the internal price list may have leaked online. A plain “price list” search also brings up a forum, a competitor and the news. Use operators to narrow the results to exactly that one file.",
    ),
    analogy: t(
      "Pichan g‘aramidagi igna: avval g‘aramni kichraytirasiz.",
      "A needle in a haystack: first you make the haystack smaller.",
    ),
    theory: [
      t(
        "Topilgan maxfiy faylni yuklab tarqatmang: manzil va vaqtni yozib, mijozga darhol xabar bering.",
        "Don’t download and pass around a confidential file you find: record the address and time and tell the client at once.",
      ),
    ],
    task: t(
      "Natijada faqat ichki narxlar ro‘yxati qoladigan so‘rov yozing.",
      "Write a query whose only result is the internal price list.",
    ),
    hint: t(
      "site:, filetype:pdf va qoralamani chiqarib tashlash.",
      "site:, filetype:pdf and leaving out the draft.",
    ),
    widget: { type: "operators" },
  },
  {
    id: 4,
    group: PAST,
    title: t("Arxivlar", "Archives"),
    minutes: 6,
    intro: t(
      "O‘chirilgan sahifa ko‘pincha arxivda qoladi. Wayback Machine (web.archive.org) saytlarni yillar davomida saqlaydi; archive.today alohida sahifalarni saqlaydi. Eski “Jamoa” sahifasi sobiq xodimlarni, eski robots.txt esa yopilgan papkalarni ko‘rsatishi mumkin.",
      "A deleted page often survives in an archive. The Wayback Machine (web.archive.org) keeps sites over the years; archive.today saves single pages. An old “Team” page can name former staff, an old robots.txt the folders since hidden.",
    ),
    analogy: t(
      "Eski gazeta tikilgan papka: bugun inkor qilingan gap o‘sha kungi sonda bor.",
      "Bound back issues of a newspaper: what is denied today is printed in that day’s edition.",
    ),
    theory: [
      t(
        "Wayback havolasida sana bor: web.archive.org/web/20210315…/ — 2021-yil 15-mart.",
        "A Wayback link carries the date: web.archive.org/web/20210315…/ means 15 March 2021.",
      ),
    ],
    task: t("Savollarga javob bering.", "Answer the questions."),
    hint: t("Sana havolaning o‘zida.", "The date is in the link itself."),
    widget: {
      type: "quiz",
      questions: [
        {
          ask: t(
            "web.archive.org/web/20190704120000/https://sarbon-logistics.example/team — bu nusxa qachongi?",
            "web.archive.org/web/20190704120000/https://sarbon-logistics.example/team — when is this copy from?",
          ),
          options: [
            t("2019-yil 4-iyul", "4 July 2019"),
            t("2020-yil 7-aprel", "7 April 2020"),
            t("Bugun", "Today"),
          ],
          answer: 0,
          explain: t(
            "YYYYMMDDhhmmss — yil, oy, kun, soat.",
            "YYYYMMDDhhmmss: year, month, day, time.",
          ),
        },
        {
          ask: t(
            "Kompaniya sahifadan xodimlar ro‘yxatini o‘chirdi. Uni qayerdan topish mumkin?",
            "The company removed its staff list from its site. Where might it still be?",
          ),
          options: [
            t("Veb-arxivlarda", "In web archives"),
            t("Hech qayerda", "Nowhere"),
            t("Faqat kompaniya serverida", "Only on the company’s server"),
          ],
          answer: 0,
          explain: t(
            "Internetdagi narsa kamdan-kam butunlay yo‘qoladi.",
            "What goes online rarely disappears completely.",
          ),
        },
      ],
    },
  },
  {
    id: 5,
    group: CHECK,
    title: t("Manba ishonchliligi", "How far to trust a source"),
    minutes: 6,
    intro: t(
      "Har bir manba bir xil ishonchli emas. Birlamchi manbalar — davlat reyestri, kompaniyaning o‘z rasmiy hujjati, sud qarori — eng kuchli. Ikkilamchi — yangiliklar, ma’lumotnomalar. Anonim forum, ijtimoiy tarmoqdagi post va “bir tanish aytdi” — boshqa manba bilan tasdiqlanmaguncha faqat taxmin.",
      "Not every source is equally trustworthy. Primary sources — a government register, the company’s own official filing, a court ruling — are strongest. Secondary ones are news and reference works. An anonymous forum, a social media post or “a friend said” stays a guess until something else confirms it.",
    ),
    analogy: t(
      "Pasport va qo‘shnining gapi: ikkalasi ham yosh haqida gapiradi, lekin biriga ko‘proq ishonasiz.",
      "A passport and a neighbour’s word: both tell you someone’s age, but you trust one more.",
    ),
    theory: [
      t(
        "Har bir topilmaga ishonch darajasi yoziladi: yuqori, o‘rta, past — va sababi.",
        "Every finding gets a confidence level — high, medium or low — and the reason.",
      ),
    ],
    task: t(
      "Har bir manba o‘zi yetarlimi yoki tasdiq kerakmi?",
      "Can each source stand on its own, or does it need confirming?",
    ),
    hint: t("Rasmiy va birlamchi — kuchli.", "Official and primary is strong."),
    widget: {
      type: "sort",
      buckets: [
        { id: "strong", label: t("Kuchli manba", "Strong source") },
        { id: "confirm", label: t("Tasdiq kerak", "Needs confirming") },
      ],
      items: [
        {
          label: t(
            "Davlat reyestridagi kompaniya rahbari yozuvi",
            "The director listed in the government company register",
          ),
          bucket: "strong",
        },
        {
          label: t(
            "Kompaniyaning rasmiy yillik hisoboti",
            "The company’s official annual report",
          ),
          bucket: "strong",
        },
        {
          label: t(
            "Anonim forumdagi “men u yerda ishlaganman” posti",
            "An anonymous forum post: “I used to work there”",
          ),
          bucket: "confirm",
        },
        {
          label: t(
            "Telegram kanalidagi manbasiz skrinshot",
            "An unsourced screenshot in a Telegram channel",
          ),
          bucket: "confirm",
        },
        {
          label: t(
            "Bir xil press-relizni qayta chop etgan uchta sayt",
            "Three sites reprinting the same press release",
          ),
          bucket: "confirm",
        },
      ],
    },
  },
  {
    id: 6,
    group: CHECK,
    title: t("Mustaqil tasdiq", "Independent confirmation"),
    minutes: 6,
    intro: t(
      "Topilma ikki yoki undan ortiq mustaqil manba bilan tasdiqlanganda ishonchli bo‘ladi. “Mustaqil” — bir-biridan ko‘chirilmagan degani. Bitta press-relizni qayta yozgan o‘nta sayt — baribir bitta manba. Sanaga ham qarang: 2019-yildagi “rahbar” bugun boshqa bo‘lishi mumkin.",
      "A finding is solid when two or more independent sources confirm it. Independent means not copied from each other: ten sites rewriting one press release are still one source. Watch the dates too: the 2019 “director” may not be the director today.",
    ),
    analogy: t(
      "Bir guvohning gapini uch kishi takrorlasa, guvohlar uchta bo‘lmaydi.",
      "Three people repeating one witness don’t make three witnesses.",
    ),
    theory: [
      t(
        "Tasdiqlash tuzog‘i: o‘z taxminingizni tasdiqlaydigan narsani qidirib, qarshi dalilni ko‘rmay qolish.",
        "The confirmation trap: looking only for what backs your guess and missing what contradicts it.",
      ),
    ],
    task: t("Savollarga javob bering.", "Answer the questions."),
    hint: t(
      "Mustaqil — boshqa yo‘l bilan bilgan.",
      "Independent means found out another way.",
    ),
    widget: {
      type: "quiz",
      questions: [
        {
          ask: t(
            "Beshta yangilik sayti bitta press-relizga tayanadi. Necha mustaqil manba?",
            "Five news sites all rely on one press release. How many independent sources?",
          ),
          options: [code("1"), code("5"), code("6")],
          answer: 0,
          explain: t(
            "Hammasi bir joydan ko‘chirilgan.",
            "They all copied one origin.",
          ),
        },
        {
          ask: t(
            "Reyestrda rahbar — A, 2021-yilgi maqolada — B. Nima qilasiz?",
            "The register names A as director; a 2021 article names B. What do you do?",
          ),
          options: [
            t(
              "Sanalarni solishtirib, eng yangi rasmiy manbaga tayanasiz va farqni qayd etasiz",
              "Compare the dates, rely on the newest official source and note the difference",
            ),
            t("Maqolaga ishonasiz", "Trust the article"),
            t("Ikkalasini ham tashlaysiz", "Drop both"),
          ],
          answer: 0,
          explain: t(
            "Rahbar o‘zgargan bo‘lishi mumkin.",
            "The director may simply have changed.",
          ),
        },
        {
          ask: t(
            "Tasdiqlash tuzog‘idan qanday qochish mumkin?",
            "How do you avoid the confirmation trap?",
          ),
          options: [
            t(
              "Taxminingizga qarshi dalilni ataylab qidirish",
              "Deliberately search for evidence against your guess",
            ),
            t("Faqat mos dalilni yig‘ish", "Collect only what fits"),
            t("Tezroq ishlash", "Work faster"),
          ],
          answer: 0,
          explain: t(
            "Yaxshi tahlilchi o‘zini noto‘g‘ri chiqarishga harakat qiladi.",
            "A good analyst tries to prove themselves wrong.",
          ),
        },
      ],
    },
  },
  {
    id: 7,
    group: CHECK,
    title: t("Mahalliy manbalar", "Local sources"),
    minutes: 6,
    intro: t(
      "O‘zbekistondagi tashkilot haqida ma’lumot ko‘pincha o‘zbek va rus tillarida, mahalliy saytlarda bo‘ladi: davlat xizmatlari portali, yuridik shaxslar reyestri, davlat xaridlari, mahalliy yangiliklar va Telegram kanallari. Faqat ingliz tilida qidirsangiz, ko‘p narsani o‘tkazib yuborasiz.",
      "Information about an organisation in Uzbekistan is often in Uzbek and Russian, on local sites: the government services portal, the company register, public procurement, local news and Telegram channels. Search only in English and you miss most of it.",
    ),
    analogy: t(
      "Mahalla haqida eng ko‘p narsani mahalla choyxonasida eshitasiz, xorijiy gazetada emas.",
      "You learn most about a neighbourhood in its own tea house, not in a foreign newspaper.",
    ),
    theory: [
      t(
        "Kompaniya nomini lotin, kirill va inglizcha yozuvda qidiring: Sarbon, Сарбон, Sarbon Logistics.",
        "Search a company’s name in Latin, Cyrillic and English spellings: Sarbon, Сарбон, Sarbon Logistics.",
      ),
    ],
    task: t("Savollarga javob bering.", "Answer the questions."),
    hint: t(
      "Til va yozuv ham qidiruv parametri.",
      "Language and script are search settings too.",
    ),
    widget: {
      type: "quiz",
      questions: [
        {
          ask: t(
            "O‘zbek kompaniyasini qidirganda qaysi yozuvlarni sinash kerak?",
            "Which spellings should you try for an Uzbek company?",
          ),
          options: [
            t("Lotin, kirill va inglizcha", "Latin, Cyrillic and English"),
            t("Faqat inglizcha", "English only"),
            t("Faqat lotin", "Latin only"),
          ],
          answer: 0,
          explain: t(
            "Eski hujjatlar ko‘pincha kirillda.",
            "Older records are often in Cyrillic.",
          ),
        },
        {
          ask: t(
            "Kompaniya qaysi davlat tenderlarida qatnashganini qayerdan ko‘rish mumkin?",
            "Where can you see which public tenders a company took part in?",
          ),
          options: [
            t(
              "Davlat xaridlari portalidan",
              "On the public procurement portal",
            ),
            t("Faqat kompaniyaning o‘zidan", "Only from the company itself"),
            t("Hech qayerdan", "Nowhere"),
          ],
          answer: 0,
          explain: t(
            "Xaridlar ochiq e’lon qilinadi.",
            "Procurement is published openly.",
          ),
        },
      ],
    },
  },
  {
    id: 8,
    group: CHECK,
    title: t("Yakuniy savollar", "Final questions"),
    minutes: 6,
    intro: t(
      "Modulni takrorlaymiz: indeks chegaralari, operatorlar, toraytirib qidirish, arxivlar, manba ishonchliligi, mustaqil tasdiq va mahalliy manbalar.",
      "A review of the module: what indexes miss, operators, narrowing a search, archives, source reliability, independent confirmation and local sources.",
    ),
    analogy: t(
      "Yaxshi qidiruvchi — yaxshi kutubxonachi: qayerdan izlashni ham, nimaga ishonishni ham biladi.",
      "A good searcher is a good librarian: knows both where to look and what to believe.",
    ),
    theory: [
      t(
        "Keyingi modulda domenlar va infratuzilma xaritasini tuzamiz.",
        "In the next module we map domains and infrastructure.",
      ),
    ],
    task: t(
      "Barcha savollarga to‘g‘ri javob bering.",
      "Answer every question correctly.",
    ),
    hint: t(
      "Bitta manba — taxmin; ikki mustaqil — dalil.",
      "One source is a guess; two independent ones are evidence.",
    ),
    widget: {
      type: "quiz",
      questions: [
        {
          ask: t(
            "Faqat sarbon-logistics.example’dagi PDF’lar uchun operatorlar?",
            "Operators for PDFs on sarbon-logistics.example only?",
          ),
          options: [
            code("site:sarbon-logistics.example filetype:pdf"),
            code("intitle:pdf sarbon"),
            code('"sarbon" -pdf'),
          ],
          answer: 0,
          explain: t(
            "site: — domen, filetype: — tur.",
            "site: for the domain, filetype: for the type.",
          ),
        },
        {
          ask: t(
            "Minus operatori nima qiladi?",
            "What does the minus operator do?",
          ),
          options: [
            t(
              "So‘zli natijalarni olib tashlaydi",
              "Drops results with the word",
            ),
            t("Natijalarni kamaytirib saralaydi", "Sorts results descending"),
            t("Sonni ayiradi", "Subtracts numbers"),
          ],
          answer: 0,
          explain: t("-draft — qoralamalarsiz.", "-draft means no drafts."),
        },
        {
          ask: t(
            "robots.txt papkani himoya qiladimi?",
            "Does robots.txt protect a folder?",
          ),
          options: [
            t("Yo‘q, bu faqat iltimos", "No, it is only a request"),
            t("Ha, parol qo‘yadi", "Yes, it adds a password"),
            t("Ha, shifrlaydi", "Yes, it encrypts it"),
          ],
          answer: 0,
          explain: t("Hamma o‘qiy oladi.", "Anyone can read it."),
        },
        {
          ask: t("Mustaqil manba nima?", "What is an independent source?"),
          options: [
            t(
              "Boshqa manbadan ko‘chirilmagan, o‘z yo‘li bilan bilgan",
              "One that found out its own way, not copied",
            ),
            t("Eng mashhur sayt", "The most popular site"),
            t("Eng yangi post", "The newest post"),
          ],
          answer: 0,
          explain: t(
            "Bitta press-reliz — bitta manba.",
            "One press release is one source.",
          ),
        },
      ],
    },
  },
];
