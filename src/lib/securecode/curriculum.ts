// Academy Intermediate · AppSec, module 2: Secure coding. The lessons use
// ./tools.ts: an allowlist beside a denylist, and a handler with five
// mistakes to fix.
import type { CommonWidget, Lesson, Text } from "../anim-lab/types";

export type Widget = CommonWidget | { type: "filter" } | { type: "fix" };

export const PROGRESS_KEY = "cybervalue:securecode:progress:v1";

const t = (uz: string, en: string): Text => ({ uz, en });

const INPUT = t("Kiritma", "Input");
const CODE = t("Kod", "The code");
const HABITS = t("Odatlar", "Habits");

export const LESSONS: Lesson<Widget>[] = [
  {
    id: 1,
    group: INPUT,
    title: t("Nimaga ishonmaslik kerak", "What not to trust"),
    minutes: 6,
    intro: t(
      "Xavfsiz kodning birinchi qoidasi: tashqaridan kelgan har qanday ma’lumot — dushman bo‘lishi mumkin. Forma maydonlari, URL parametrlari, sarlavhalar, cookie’lar, yuklangan fayllar va hatto boshqa xizmatning API javobi — hammasini foydalanuvchi o‘zgartira oladi yoki u buzilgan bo‘lishi mumkin. Faqat kodning o‘zidagi konstantalar va administrator sozlagan konfiguratsiyaga ishonasiz.",
      "The first rule of secure code: anything from outside may be hostile. Form fields, URL parameters, headers, cookies, uploaded files and even another service’s API response — a user can change them, or they may be compromised. You trust only constants in your own code and configuration set by your operators.",
    ),
    analogy: t(
      "Bankdagi kassir: mijoz qo‘lidagi har bir pulni tekshiradi, hatto u tanish bo‘lsa ham.",
      "A bank cashier checks every note a customer hands over — even from a regular.",
    ),
    theory: [
      t(
        "Brauzerdagi tekshiruv — qulaylik uchun; xavfsizlik uchun tekshiruv serverda bo‘ladi.",
        "Checks in the browser are for convenience; checks for security happen on the server.",
      ),
    ],
    task: t(
      "Har bir manba ishonchlimi yoki tekshirilishi kerakmi?",
      "Is each source trusted, or does it need checking?",
    ),
    hint: t(
      "Foydalanuvchi yoki boshqa tizim tegishi mumkin bo‘lsa — tekshiring.",
      "If a user or another system can touch it, check it.",
    ),
    widget: {
      type: "sort",
      buckets: [
        { id: "check", label: t("Tekshirish kerak", "Needs checking") },
        { id: "trusted", label: t("Ishonchli", "Trusted") },
      ],
      items: [
        { label: t("Forma maydoni", "A form field"), bucket: "check" },
        { label: t("Cookie qiymati", "A cookie value"), bucket: "check" },
        {
          label: t("User-Agent sarlavhasi", "The User-Agent header"),
          bucket: "check",
        },
        {
          label: t("Hamkor API’ning javobi", "A partner API’s response"),
          bucket: "check",
        },
        {
          label: t(
            "Koddagi MAX_UPLOAD = 5 MB",
            "MAX_UPLOAD = 5 MB in the code",
          ),
          bucket: "trusted",
        },
        {
          label: t(
            "Administrator o‘rnatgan muhit o‘zgaruvchisi",
            "An environment variable set by the operators",
          ),
          bucket: "trusted",
        },
      ],
    },
  },
  {
    id: 2,
    group: INPUT,
    title: t("Ruxsat ro‘yxati va taqiq ro‘yxati", "Allowlists and denylists"),
    minutes: 10,
    intro: t(
      "Denylist (taqiq ro‘yxati) yomon narsalarni sanab, ularni to‘xtatadi — lekin hujumchi siz o‘ylamagan variantni topadi. Allowlist (ruxsat ro‘yxati) faqat yaxshi ko‘rinishni qabul qiladi: ism — faqat harflar, apostrof, probel va chiziqcha, 40 tagacha. Quyidagi beshta kiritmani ikkalasidan o‘tkazing.",
      "A denylist lists bad things and blocks them — but attackers find the variant you didn’t think of. An allowlist accepts only what good looks like: a name is letters, apostrophes, spaces and hyphens, up to 40. Run the five inputs below through both.",
    ),
    analogy: t(
      "Klub eshigi: “bular kirmaydi” ro‘yxati o‘rniga “faqat taklifnomasi borlar”.",
      "A club door: instead of a “these may not enter” list, “invitation holders only”.",
    ),
    theory: [
      t(
        "Allowlist ham yetarli emas: chiqishda HTML’ni ekranlash kerak (Untrusted input moduli).",
        "An allowlist alone isn’t enough: HTML still has to be escaped on output (the Untrusted input module).",
      ),
    ],
    task: t(
      "Taqiq ro‘yxatidan o‘tib ketadigan hujum kiritmalarini belgilang.",
      "Tick the attack inputs that get past the denylist.",
    ),
    hint: t(
      "Taqiq ro‘yxati faqat aynan “<script>” ni qidiradi.",
      "The denylist only looks for exactly “<script>”.",
    ),
    widget: { type: "filter" },
  },
  {
    id: 3,
    group: CODE,
    title: t("Kodni tuzatish", "Fixing the handler"),
    minutes: 12,
    intro: t(
      "Quyidagi profilni yangilash handlerida beshta odatiy xato bor: kodga yozilgan kalit, SQL’ga yopishtirilgan kiritma, logga yozilgan parol, tekshirilmagan butun req.body va foydalanuvchiga ko‘rsatilgan stack trace. Har bir qatorga to‘g‘ri tuzatishni tanlang.",
      "The profile-update handler below has five classic mistakes: a key written into the code, input glued into SQL, a password written to the log, the whole req.body saved unchecked, and a stack trace shown to the user. Pick the right fix for each line.",
    ),
    analogy: t(
      "Uyda beshta ochiq deraza: har biriga o‘z qulfi kerak.",
      "Five open windows in a house: each needs its own latch.",
    ),
    theory: [
      t(
        'req.body’ni to‘g‘ridan-to‘g‘ri saqlash — “mass assignment”: foydalanuvchi { role: "admin" } qo‘shib yuborishi mumkin.',
        'Saving req.body as-is is mass assignment: a user can slip in { role: "admin" }.',
      ),
    ],
    task: t(
      "Beshta qatorning har biriga to‘g‘ri tuzatishni tanlang.",
      "Choose the right fix for all five lines.",
    ),
    hint: t(
      "Har bir tuzatish bir marta ishlatiladi.",
      "Each fix is used once.",
    ),
    widget: { type: "fix" },
  },
  {
    id: 4,
    group: CODE,
    title: t("Xatolarni boshqarish", "Handling errors"),
    minutes: 6,
    intro: t(
      "Xato xabari hujumchiga xarita bo‘lmasin: stack trace, SQL so‘rovi, fayl yo‘llari va dastur versiyalari faqat ichki logga yoziladi, foydalanuvchiga esa “Nimadir xato ketdi, kod: 7F3A” kabi umumiy xabar va so‘rov identifikatori. Xato bo‘lganda tizim “yopiq” holatga o‘tishi kerak (fail closed): tekshiruv ishlamasa — ruxsat berilmaydi.",
      "An error message mustn’t be a map for attackers: stack traces, SQL, file paths and versions go only to the internal log, while the user gets a generic message and a request ID, such as “Something went wrong, code 7F3A”. On error the system must fail closed: if a check can’t run, access is denied.",
    ),
    analogy: t(
      "Elektron qulf buzilsa, eshik ochiq qolmasligi kerak.",
      "If an electronic lock breaks, the door mustn’t be left open.",
    ),
    theory: [
      t(
        "So‘rov identifikatori qo‘llab-quvvatlash xizmatiga logdagi aniq yozuvni topishga yordam beradi.",
        "The request ID lets support find the exact log entry.",
      ),
    ],
    task: t("Savollarga javob bering.", "Answer the questions."),
    hint: t(
      "Tafsilot — logga; foydalanuvchiga — umumiy xabar.",
      "Details to the log; a generic message to the user.",
    ),
    widget: {
      type: "quiz",
      questions: [
        {
          ask: t(
            "Ruxsatni tekshiradigan xizmat javob bermadi. Kod nima qilishi kerak?",
            "The permission-check service didn’t answer. What should the code do?",
          ),
          options: [
            t("Ruxsat bermaslik (fail closed)", "Deny access (fail closed)"),
            t("Ruxsat berish", "Allow access"),
            t("Tasodifiy tanlash", "Pick at random"),
          ],
          answer: 0,
          explain: t(
            "Aks holda hujumchi xizmatni to‘xtatib, ichkariga kiradi.",
            "Otherwise an attacker knocks the service over and walks in.",
          ),
        },
        {
          ask: t(
            "Foydalanuvchiga qaysi xabar to‘g‘ri?",
            "Which message is right for the user?",
          ),
          options: [
            t(
              "“Nimadir xato ketdi, kod: 7F3A”",
              "“Something went wrong, code 7F3A”",
            ),
            t(
              "“PG::SyntaxError at users.rb:42”",
              "“PG::SyntaxError at users.rb:42”",
            ),
            t("Butun stack trace", "The whole stack trace"),
          ],
          answer: 0,
          explain: t(
            "Kod bo‘yicha logdan tafsilot topiladi.",
            "The code finds the details in the log.",
          ),
        },
      ],
    },
  },
  {
    id: 5,
    group: CODE,
    title: t("Sirlar", "Secrets"),
    minutes: 6,
    intro: t(
      "API kalitlari, baza parollari va tokenlar kodga yozilmaydi: ular muhit o‘zgaruvchilari yoki sirlar omborida (Vault, cloud secret manager) saqlanadi. Git tarixi hamma narsani eslaydi — kalitni keyingi commit’da o‘chirish yetmaydi, uni almashtirish (rotate) kerak. GitHub secret scanning va gitleaks kabi vositalar commit’dan oldin ogohlantiradi.",
      "API keys, database passwords and tokens never go in the code: they live in environment variables or a secret store (Vault, a cloud secret manager). Git history remembers everything — deleting a key in the next commit isn’t enough; it must be rotated. Tools such as GitHub secret scanning and gitleaks warn before the commit lands.",
    ),
    analogy: t(
      "Kalitni eshik ostiga qo‘ysangiz, “olib qo‘ydim” deyish kech: kimdir nusxa olgan bo‘lishi mumkin — qulfni almashtiring.",
      "Once a key has sat under the doormat, taking it back is too late: someone may have copied it — change the lock.",
    ),
    theory: [
      t(
        ".env faylini .gitignore’ga qo‘shing va .env.example’da faqat bo‘sh nomlarni qoldiring.",
        "Put .env in .gitignore and keep only empty names in .env.example.",
      ),
    ],
    task: t("Savollarga javob bering.", "Answer the questions."),
    hint: t(
      "Sizib chiqqan kalit — almashtiriladi.",
      "A leaked key gets rotated.",
    ),
    widget: {
      type: "quiz",
      questions: [
        {
          ask: t(
            "Kalit ochiq repoga commit qilindi. To‘g‘ri qadam?",
            "A key was committed to a public repo. The right step?",
          ),
          options: [
            t(
              "Kalitni darhol almashtirib, eskisini o‘chirish",
              "Rotate the key at once and revoke the old one",
            ),
            t(
              "Keyingi commit’da faylni o‘chirish",
              "Delete the file in the next commit",
            ),
            t("Repo nomini o‘zgartirish", "Rename the repo"),
          ],
          answer: 0,
          explain: t(
            "Botlar ochiq repolarni soniyalar ichida skanerlaydi.",
            "Bots scan public repos within seconds.",
          ),
        },
        {
          ask: t("Sirlarni qayerda saqlash kerak?", "Where do secrets belong?"),
          options: [
            t(
              "Muhit o‘zgaruvchisi yoki sirlar omborida",
              "In an environment variable or a secret store",
            ),
            t("Kod ichida", "In the code"),
            t("README’da", "In the README"),
          ],
          answer: 0,
          explain: t(
            "Kod — ochiq; sir — yopiq.",
            "Code gets shared; secrets mustn’t.",
          ),
        },
      ],
    },
  },
  {
    id: 6,
    group: HABITS,
    title: t("Nimani logga yozish", "What to log"),
    minutes: 6,
    intro: t(
      "Yaxshi log hujumni ko‘rsatadi va o‘zi sir sizdirmaydi. Yozing: muvaffaqiyatsiz kirishlar, ruxsat rad etilishi, administrator o‘zgarishlari, kiritma tekshiruvi xatolari — kim, qachon, qayerdan. Hech qachon yozmang: parollar, to‘liq karta raqamlari, sessiya tokenlari, shaxsiy hujjat raqamlari.",
      "A good log shows attacks and leaks nothing itself. Log failed logins, denied access, admin changes and validation failures — who, when, from where. Never log passwords, full card numbers, session tokens or personal document numbers.",
    ),
    analogy: t(
      "Bino jurnali: kim qachon kirgan — ha; kirish kodi — yo‘q.",
      "A building’s visitor book: who came in and when — yes; the door code — no.",
    ),
    theory: [
      t(
        "Logni ham kimdir o‘qiydi: tahlilchi, provayder, hujumchi.",
        "Somebody reads the log too: an analyst, a provider, an attacker.",
      ),
    ],
    task: t(
      "Har biri logga yoziladimi yoki hech qachonmi?",
      "Does each one go in the log, or never?",
    ),
    hint: t("Hodisa — ha; sir — yo‘q.", "Events yes; secrets no."),
    widget: {
      type: "sort",
      buckets: [
        { id: "log", label: t("Yoziladi", "Log it") },
        { id: "never", label: t("Hech qachon", "Never") },
      ],
      items: [
        {
          label: t("Muvaffaqiyatsiz kirish va IP", "A failed login and its IP"),
          bucket: "log",
        },
        {
          label: t("Ruxsat rad etildi: /admin", "Access denied: /admin"),
          bucket: "log",
        },
        {
          label: t(
            "Administrator rolni o‘zgartirdi",
            "An admin changed a role",
          ),
          bucket: "log",
        },
        {
          label: t("Foydalanuvchi paroli", "The user’s password"),
          bucket: "never",
        },
        { label: t("Sessiya tokeni", "The session token"), bucket: "never" },
        {
          label: t("To‘liq karta raqami", "The full card number"),
          bucket: "never",
        },
      ],
    },
  },
  {
    id: 7,
    group: HABITS,
    title: t("Tamoyillar", "Principles"),
    minutes: 6,
    intro: t(
      "Bir nechta tamoyil ko‘p xatoning oldini oladi. Eng kam huquq: har bir komponent faqat kerakli narsaga kira oladi. Chuqur himoya: bitta himoya qatlami buzilsa, keyingisi to‘xtatadi. Xavfsiz standart: yangi funksiya yopiq holda boshlanadi. Soddalik: murakkab kodda xato yashirinadi.",
      "A few principles prevent many mistakes. Least privilege: each component reaches only what it needs. Defence in depth: if one layer fails, the next one stops the attack. Secure defaults: a new feature starts switched off. Simplicity: bugs hide in complex code.",
    ),
    analogy: t(
      "Qal’a: xandaq, devor, darvoza va qo‘riqchi — bittasi yetmasa, boshqasi bor.",
      "A castle: moat, wall, gate and guards — if one fails, there is another.",
    ),
    theory: [
      t(
        "Baza foydalanuvchisi faqat o‘ziga kerakli jadvallarga huquqqa ega bo‘lsin — DROP huquqisiz.",
        "The app’s database user gets only the tables it needs — and no DROP rights.",
      ),
    ],
    task: t("Savollarga javob bering.", "Answer the questions."),
    hint: t("Kerakli minimum.", "The minimum needed."),
    widget: {
      type: "quiz",
      questions: [
        {
          ask: t(
            "Ilova bazaga administrator hisobi bilan ulanadi. Qaysi tamoyil buzilgan?",
            "The app connects to the database as an admin. Which principle is broken?",
          ),
          options: [
            t("Eng kam huquq", "Least privilege"),
            t("Soddalik", "Simplicity"),
            t("Hech qaysi", "None"),
          ],
          answer: 0,
          explain: t(
            "SQL injection bo‘lsa, butun baza ketadi.",
            "With one SQL injection, the whole database goes.",
          ),
        },
        {
          ask: t(
            "Parametrli so‘rov ham, WAF ham, kam huquqli baza foydalanuvchisi ham. Bu?",
            "Parameterised queries, a WAF and a low-privilege DB user. That is?",
          ),
          options: [
            t("Chuqur himoya", "Defence in depth"),
            t("Ortiqcha ish", "Wasted effort"),
            t("Xavfsiz standart", "Secure defaults"),
          ],
          answer: 0,
          explain: t(
            "Bir qatlam yiqilsa, boshqasi ushlaydi.",
            "If one layer falls, another holds.",
          ),
        },
      ],
    },
  },
  {
    id: 8,
    group: HABITS,
    title: t("Yakuniy savollar", "Final questions"),
    minutes: 6,
    intro: t(
      "Modulni takrorlaymiz: ishonchsiz kiritma, allowlist, odatiy xatolar va tuzatishlar, xatolar, sirlar, log va tamoyillar.",
      "A review of the module: untrusted input, allowlists, common mistakes and fixes, errors, secrets, logging and principles.",
    ),
    analogy: t(
      "Xavfsiz kod — yaxshi odat: har kuni, har bir qatorda.",
      "Secure code is a habit: every day, every line.",
    ),
    theory: [
      t(
        "Keyingi modulda boshqalar yozgan kod — kutubxonalar va ta’minot zanjiri.",
        "In the next module: code other people wrote — dependencies and the supply chain.",
      ),
    ],
    task: t(
      "Barcha savollarga to‘g‘ri javob bering.",
      "Answer every question correctly.",
    ),
    hint: t(
      "Yaxshini qabul qiling, yomonni sanamang.",
      "Accept the good; don’t try to list the bad.",
    ),
    widget: {
      type: "quiz",
      questions: [
        {
          ask: t(
            "Nega allowlist denylist’dan yaxshi?",
            "Why is an allowlist better than a denylist?",
          ),
          options: [
            t(
              "Hujumchi o‘ylanmagan variantni topa olmaydi",
              "The attacker can’t use a variant nobody thought of",
            ),
            t("U tezroq", "It is faster"),
            t("Farqi yo‘q", "No difference"),
          ],
          answer: 0,
          explain: t(
            "<ScRiPt> denylist’dan o‘tdi.",
            "<ScRiPt> got past the denylist.",
          ),
        },
        {
          ask: t(
            '"SELECT … WHERE id = " + req.params.id — tuzatish?',
            '"SELECT … WHERE id = " + req.params.id — the fix?',
          ),
          options: [
            t("Parametrli so‘rov", "A parameterised query"),
            t("Uzunroq parol", "A longer password"),
            t("Kesh", "A cache"),
          ],
          answer: 0,
          explain: t(
            "Kiritma ma’lumot bo‘lib qoladi, kod emas.",
            "The input stays data, not code.",
          ),
        },
        {
          ask: t(
            "req.body’ni to‘g‘ridan-to‘g‘ri saqlash xavfi?",
            "The danger of saving req.body as-is?",
          ),
          options: [
            t(
              "Mass assignment — foydalanuvchi role kabi maydonni qo‘shadi",
              "Mass assignment — a user adds a field such as role",
            ),
            t("Xavf yo‘q", "None"),
            t("Sekinlik", "Slowness"),
          ],
          answer: 0,
          explain: t(
            "Faqat ruxsat etilgan maydonlarni oling.",
            "Take only the allowed fields.",
          ),
        },
        {
          ask: t("Logga nima yozilmaydi?", "What never goes in a log?"),
          options: [
            t("Sessiya tokeni", "A session token"),
            t("Muvaffaqiyatsiz kirish", "A failed login"),
            t("Ruxsat rad etilishi", "An access denial"),
          ],
          answer: 0,
          explain: t(
            "Token bilan sessiyani o‘g‘irlash mumkin.",
            "A token can hijack the session.",
          ),
        },
      ],
    },
  },
];
