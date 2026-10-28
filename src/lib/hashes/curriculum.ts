// Academy Intermediate · Cryptography, module 3: hashes and passwords. The
// lessons use real SHA-256 and HMAC (./tools.ts): a leaked user table with
// and without salt, the cost of bcrypt against a graphics card, and a
// webhook signed with a plain hash or an HMAC.
import type { CommonWidget, Lesson, Text } from "../anim-lab/types";

export type Widget =
  CommonWidget | { type: "salt" } | { type: "cost" } | { type: "hmac" };

export const PROGRESS_KEY = "cybervalue:hashes:progress:v1";

const t = (uz: string, en: string): Text => ({ uz, en });
const code = (s: string) => t(s, s);

const HASH = t("Xesh nima kafolatlaydi", "What a hash promises");
const STORE = t("Parollarni saqlash", "Storing passwords");
const SIGN = t("Xesh va kalit", "Hashes with a key");

export const LESSONS: Lesson<Widget>[] = [
  {
    id: 1,
    group: HASH,
    title: t("Xeshning xossalari", "What makes a hash"),
    minutes: 6,
    intro: t(
      "Kriptografik xesh (SHA-256 kabi) istalgan uzunlikdagi ma’lumotdan qisqa, doim bir xil uzunlikdagi “barmoq izi” yasaydi. Uni orqaga qaytarib bo‘lmaydi, bitta harf o‘zgarsa natija butunlay o‘zgaradi, va bir xil xeshli ikki xil ma’lumotni topish amalda imkonsiz.",
      "A cryptographic hash such as SHA-256 turns data of any length into a short fingerprint of fixed length. It cannot be reversed, one changed letter changes the whole result, and finding two inputs with the same hash is impossible in practice.",
    ),
    analogy: t(
      "Go‘sht maydalagich: go‘shtdan qiyma qilish oson, qiymadan go‘shtni qaytarish — yo‘q.",
      "A mincer: turning meat into mince is easy; turning mince back into meat is not.",
    ),
    theory: [
      t(
        "Xesh shifr emas: kalit yo‘q va uni ochib bo‘lmaydi. U yaxlitlikni tekshirish va parollarni saqlash uchun ishlatiladi.",
        "A hash is not a cipher: there is no key and nothing to decrypt. It checks integrity and stores passwords.",
      ),
      t(
        "MD5 va SHA-1 da to‘qnashuvlar topilgan — ular xavfsizlik uchun yaroqsiz. SHA-256 va SHA-3 bugun ishonchli.",
        "Collisions have been found in MD5 and SHA-1 — they are unfit for security. SHA-256 and SHA-3 are trusted today.",
      ),
    ],
    task: t(
      "Har bir da’voni ajrating: SHA-256 haqida to‘g‘rimi yoki noto‘g‘ri?",
      "Sort each claim about SHA-256: true or false?",
    ),
    hint: t("Xeshni “ochib” bo‘lmaydi.", "A hash cannot be “decrypted”."),
    widget: {
      type: "sort",
      buckets: [
        { id: "true", label: t("To‘g‘ri", "True") },
        { id: "false", label: t("Noto‘g‘ri", "False") },
      ],
      items: [
        {
          label: t(
            "Natija doim 256 bit, matn qancha uzun bo‘lmasin",
            "The result is always 256 bits, however long the text",
          ),
          bucket: "true",
        },
        {
          label: t(
            "Bir harf o‘zgarsa, xeshning yarmiga yaqin biti o‘zgaradi",
            "Changing one letter changes about half of the hash’s bits",
          ),
          bucket: "true",
        },
        {
          label: t(
            "Kalit bilan xeshdan asl matnni qaytarish mumkin",
            "With a key, the original text can be recovered from the hash",
          ),
          bucket: "false",
        },
        {
          label: t(
            "Bir xil matn har doim bir xil xesh beradi",
            "The same text always gives the same hash",
          ),
          bucket: "true",
        },
        {
          label: t(
            "MD5 parollar uchun hali ham xavfsiz",
            "MD5 is still safe for passwords",
          ),
          bucket: "false",
        },
      ],
    },
  },
  {
    id: 2,
    group: STORE,
    title: t("Bir xil parol — bir xil xesh", "Same password, same hash"),
    minutes: 10,
    intro: t(
      "Sayt bazasi sizib chiqdi. Parollar ochiq emas, SHA-256 xeshi saqlangan. Lekin hujumchida keng tarqalgan parollar va ularning xeshlari jadvali bor (rainbow table). Bir xil parol bir xil xesh berganidan, u jadvaldan bir zumda topadi — va bir xil parolli foydalanuvchilarni ham ko‘radi.",
      "A site’s database has leaked. The passwords are not in plain text: their SHA-256 hashes are. But the attacker has a table of common passwords and their hashes (a rainbow table). Since one password always gives one hash, it finds matches at once — and sees which users share a password.",
    ),
    analogy: t(
      "Barcha qulflar uchun bitta kalitlar dastasi: bir marta yasalgan dasta minglab eshikni ochadi.",
      "One bunch of keys for every lock: made once, it opens thousands of doors.",
    ),
    theory: [
      t(
        "Salt — har bir foydalanuvchi uchun tasodifiy qo‘shimcha. Xesh parol + salt’dan hisoblanadi. Salt maxfiy emas, xesh yonida saqlanadi.",
        "A salt is a random value added for each user. The hash is taken over password plus salt. The salt is not secret and sits next to the hash.",
      ),
      t(
        "Salt bilan oldindan tayyorlangan jadval ishlamaydi va bir xil parollar bir xil ko‘rinmaydi.",
        "With a salt, a precomputed table is useless and equal passwords no longer look equal.",
      ),
    ],
    task: t(
      "Sizib chiqqan jadvalda nechta parol topilganini ko‘ring. Keyin salt qo‘shing va natijani solishtiring.",
      "See how many passwords the leaked table gives away. Then add a salt and compare.",
    ),
    hint: t(
      "“Har bir foydalanuvchiga salt” ni yoqing.",
      "Switch on “A salt for each user”.",
    ),
    widget: { type: "salt" },
  },
  {
    id: 3,
    group: STORE,
    title: t("Sekin xesh — yaxshi xesh", "A slow hash is a good hash"),
    minutes: 10,
    intro: t(
      "SHA-256 juda tez: bitta videokarta soniyasiga o‘n milliardlab xesh hisoblaydi. Bu fayllar uchun yaxshi, parollar uchun yomon — salt bo‘lsa ham, hujumchi har bir parolni tez sinaydi. bcrypt, scrypt va Argon2 ataylab sekin; “cost” parametri har bir qo‘shimcha birlikda ishni ikki baravar oshiradi.",
      "SHA-256 is very fast: one graphics card computes tens of billions of hashes a second. Good for files, bad for passwords — even with a salt, the attacker tries each password quickly. bcrypt, scrypt and Argon2 are slow on purpose; each step of their “cost” doubles the work.",
    ),
    analogy: t(
      "Har bir urinishdan keyin bir daqiqa kutadigan qulf: egasi uchun farqi yo‘q, ming marta sinaydigan o‘g‘ri uchun — juda katta.",
      "A lock that makes you wait a minute after each try: nothing to its owner, a lot to a thief trying a thousand times.",
    ),
    theory: [
      t(
        "Foydalanuvchi bir marta kiradi — 0,1 soniya sezilmaydi. Hujumchi milliardlab marta sinaydi — har bir urinish qimmatlashadi.",
        "A user signs in once — a tenth of a second goes unnoticed. An attacker tries billions of times — each try gets expensive.",
      ),
      t(
        "Argon2id xotirani ham talab qiladi, shuning uchun videokartalarda yanada qimmat. Yangi tizimlar uchun u tavsiya etiladi.",
        "Argon2id also needs memory, which makes it costlier on graphics cards. It is the recommendation for new systems.",
      ),
    ],
    task: t(
      "Algoritm va cost ni tanlang: 8 belgili parollarning hammasini sinash bir yildan oshsin, foydalanuvchi esa bir soniyadan kam kutsin.",
      "Choose the algorithm and cost so that trying every 8-character password takes over a year, while a user waits under a second.",
    ),
    hint: t("bcrypt, cost 10 atrofida.", "bcrypt, a cost around 10."),
    widget: { type: "cost" },
  },
  {
    id: 4,
    group: STORE,
    title: t(
      "Parolni nima bilan saqlash kerak",
      "What to store passwords with",
    ),
    minutes: 6,
    intro: t(
      "Parol saqlashning to‘g‘ri yo‘li — maxsus sekin funksiya, tuz bilan. Qolgan hamma usullar — tez xesh, kodlash yoki qaytariladigan shifr — sizib chiqishda parollarni ochib beradi.",
      "The right way to keep passwords is a purpose-made slow function with a salt. Everything else — a fast hash, an encoding or a reversible cipher — gives the passwords away in a leak.",
    ),
    analogy: t(
      "Seyf o‘rniga gazetaga o‘rab qo‘yish: ko‘rinmaydi, lekin himoyalanmagan.",
      "Wrapping it in newspaper instead of a safe: out of sight, but not protected.",
    ),
    theory: [
      t(
        "Parolni shifrlab saqlamang: kalit ham sizib chiqsa, barcha parollar ochiladi. Xesh qaytarilmaydi.",
        "Do not encrypt passwords: if the key leaks too, every password opens. A hash cannot be reversed.",
      ),
      t(
        "Tekshiruvda saqlangan salt va cost bilan yana xesh hisoblanadi va natijalar solishtiriladi.",
        "To check a password, the stored salt and cost are used to hash again, and the results are compared.",
      ),
    ],
    task: t(
      "Har bir usulni ajrating: parol uchun yaroqlimi yoki yo‘q?",
      "Sort each method: fit for passwords or not?",
    ),
    hint: t(
      "Faqat maxsus sekin funksiyalar.",
      "Only the purpose-made slow functions.",
    ),
    widget: {
      type: "sort",
      buckets: [
        { id: "ok", label: t("Yaroqli", "Fit") },
        { id: "no", label: t("Yaroqsiz", "Unfit") },
      ],
      items: [
        { label: code("Argon2id"), code: true, bucket: "ok" },
        { label: code("bcrypt (cost 12)"), code: true, bucket: "ok" },
        { label: code("scrypt"), code: true, bucket: "ok" },
        { label: code("MD5"), code: true, bucket: "no" },
        { label: code("SHA-256 + salt"), code: true, bucket: "no" },
        { label: code("AES-256"), code: true, bucket: "no" },
        { label: code("Base64"), code: true, bucket: "no" },
      ],
    },
  },
  {
    id: 5,
    group: SIGN,
    title: t("Xeshni har kim qayta hisoblaydi", "Anyone can redo a hash"),
    minutes: 10,
    intro: t(
      "To‘lov xizmati do‘konga “1043-buyurtma to‘landi” degan xabar (webhook) yuboradi va unga imzo qo‘shadi. Agar imzo shunchaki SHA-256 bo‘lsa, hujumchi summani o‘zgartirib, yangi xeshni o‘zi hisoblaydi. HMAC esa xeshni maxfiy kalit bilan hisoblaydi — kalitsiz to‘g‘ri imzo yasab bo‘lmaydi.",
      "A payment service tells the shop “order 1043 is paid” with a message (a webhook) and adds a signature. If the signature is just SHA-256, an attacker changes the amount and computes the new hash itself. HMAC computes the hash with a secret key — without the key nobody can make a valid signature.",
    ),
    analogy: t(
      "Hujjatga barmoq izini qo‘shish har kimning qo‘lidan keladi; notarius muhrini esa faqat notarius qo‘yadi.",
      "Anyone can add a fingerprint to a document; only the notary can add the notary’s seal.",
    ),
    theory: [
      t(
        "HMAC-SHA256 = SHA-256 ichiga kalit maxsus usulda qo‘shiladi (RFC 2104). Shunchaki sha256(kalit + xabar) yozish ham xato — u ba’zi hujumlarga ochiq.",
        "HMAC-SHA256 mixes the key into SHA-256 in a set way (RFC 2104). Just writing sha256(key + message) is also wrong — it is open to some attacks.",
      ),
      t(
        "Imzoni solishtirishda vaqt bo‘yicha xavfsiz taqqoslash (timingSafeEqual) ishlating, oddiy === emas.",
        "Compare signatures with a constant-time check (timingSafeEqual), not a plain ===.",
      ),
    ],
    task: t(
      "Oddiy xesh bilan soxta xabar qabul qilinishini ko‘ring. Keyin HMAC’ni yoqing — soxta xabar rad etilsin.",
      "See a forged message accepted with a plain hash. Then switch on HMAC so it is refused.",
    ),
    hint: t(
      "“HMAC bilan imzolash (maxfiy kalit)” ni yoqing.",
      "Switch on “Sign with HMAC (a secret key)”.",
    ),
    widget: { type: "hmac" },
  },
  {
    id: 6,
    group: SIGN,
    title: t("Yaxshi parol siyosati", "A good password policy"),
    minutes: 6,
    intro: t(
      "Xeshlash — himoyaning oxirgi qatori. Undan oldin parollar o‘zi yaxshi bo‘lishi kerak. Zamonaviy tavsiyalar (NIST SP 800-63B) ko‘pchilik o‘ylagandan boshqacha: uzunlik muhim, majburiy belgilar va har 90 kunda almashtirish — yo‘q.",
      "Hashing is the last line. Before it, the passwords themselves should be good. Modern guidance (NIST SP 800-63B) differs from what many expect: length matters; forced symbols and changing every 90 days do not.",
    ),
    analogy: t(
      "Uzun jumla “P@ss1!” dan ko‘ra eslash oson va buzish qiyin.",
      "A long sentence is easier to remember and harder to break than “P@ss1!”.",
    ),
    theory: [
      t(
        "Kamida 8, yaxshisi 12+ belgi; parol ma’lum sizib chiqqanlar ro‘yxatida bo‘lmasin; parol menejerlari va uzun iboralarga ruxsat bering.",
        "At least 8, better 12+ characters; reject passwords on known breach lists; allow password managers and long passphrases.",
      ),
      t(
        "Parolni faqat sizib chiqqanligi aniqlanganda almashtirishni so‘rang. MFA qo‘shing.",
        "Ask for a change only when a password is known to have leaked. Add MFA.",
      ),
    ],
    task: t("Savollarga javob bering.", "Answer the questions."),
    hint: t(
      "Uzunlik va sizib chiqqanlar ro‘yxati.",
      "Length, and the breach list.",
    ),
    widget: {
      type: "quiz",
      questions: [
        {
          ask: t("Qaysi parol kuchliroq?", "Which password is stronger?"),
          options: [
            code("tog-ustida-uchta-qizil-olma"),
            code("P@ss1!"),
            code("Qwerty123!"),
          ],
          answer: 0,
          explain: t(
            "Uzunlik variantlar sonini keskin oshiradi; qisqa “murakkab” parollar ro‘yxatlarda bor.",
            "Length multiplies the number of choices; short “complex” passwords are on the lists.",
          ),
        },
        {
          ask: t(
            "NIST tavsiyasiga ko‘ra parolni qachon almashtirish kerak?",
            "Under NIST guidance, when should a password be changed?",
          ),
          options: [
            t(
              "Sizib chiqqanligi aniqlanganda",
              "When it is known to have leaked",
            ),
            t("Har 30 kunda", "Every 30 days"),
            t("Hech qachon", "Never"),
          ],
          answer: 0,
          explain: t(
            "Majburiy tez-tez almashtirish odamlarni oson parollarga undaydi.",
            "Frequent forced changes push people to weak passwords.",
          ),
        },
        {
          ask: t(
            "Ro‘yxatdan o‘tishda parolni nima bilan tekshirish foydali?",
            "What is a useful check on a password at sign-up?",
          ),
          options: [
            t(
              "Sizib chiqqan parollar ro‘yxati bilan",
              "Against a list of leaked passwords",
            ),
            t(
              "Kamida bitta emoji borligi bilan",
              "That it has at least one emoji",
            ),
            t(
              "Foydalanuvchi ismiga o‘xshashligi bilan",
              "That it looks like the user’s name",
            ),
          ],
          answer: 0,
          explain: t(
            "Ro‘yxatdagi parollarni hujumchilar birinchi bo‘lib sinaydi.",
            "Attackers try the listed passwords first.",
          ),
        },
      ],
    },
  },
  {
    id: 7,
    group: SIGN,
    title: t("Xesh qayerda ishlatiladi", "Where hashes are used"),
    minutes: 6,
    intro: t(
      "Xesh faqat parol uchun emas. Fayl yuklab olinganda uning o‘zgarmaganini tekshirish, Git’dagi commit’lar, raqamli imzolar va blokcheyn — hammasi xeshga tayanadi. Har bir vazifa uchun to‘g‘ri vosita bor.",
      "Hashes are not only for passwords. Checking a download was not changed, Git commits, digital signatures and blockchains all rest on hashes. Each job has its right tool.",
    ),
    analogy: t(
      "Bitta pichoq — non uchun, boshqasi — baliq uchun: ikkalasi ham pichoq, lekin vazifasi boshqa.",
      "One knife for bread, another for fish: both knives, different jobs.",
    ),
    theory: [
      t(
        "Fayl yaxlitligi — SHA-256. Parol — Argon2id/bcrypt. Xabar haqiqiyligi (umumiy kalit) — HMAC. Kim yuborganini isbotlash — raqamli imzo (keyingi modul).",
        "File integrity — SHA-256. Passwords — Argon2id/bcrypt. Message authenticity with a shared key — HMAC. Proving who sent it — a digital signature (next module).",
      ),
    ],
    task: t(
      "Har bir vazifaga mos vositani tanlang.",
      "Pick the right tool for each job.",
    ),
    hint: t(
      "Kalit kerakmi? Sekinlik kerakmi?",
      "Is a key needed? Is slowness needed?",
    ),
    widget: {
      type: "quiz",
      questions: [
        {
          ask: t(
            "Yuklab olingan ISO fayl o‘zgarmaganini tekshirish uchun?",
            "To check a downloaded ISO file was not changed?",
          ),
          options: [code("SHA-256"), code("bcrypt"), code("Base64")],
          answer: 0,
          explain: t(
            "Fayl uchun tez xesh yetarli; uni sayt e’lon qilgan xesh bilan solishtirasiz.",
            "A fast hash suits a file; compare it with the hash the site publishes.",
          ),
        },
        {
          ask: t(
            "API so‘rovi umumiy kalitni biladigan hamkordan kelganini tekshirish uchun?",
            "To check an API request came from a partner who shares a key with you?",
          ),
          options: [code("HMAC-SHA256"), code("MD5"), code("Argon2id")],
          answer: 0,
          explain: t(
            "HMAC kalit bilan imzolaydi va o‘zgartirishni aniqlaydi.",
            "HMAC signs with the key and detects changes.",
          ),
        },
      ],
    },
  },
  {
    id: 8,
    group: SIGN,
    title: t("Yakuniy savollar", "Final questions"),
    minutes: 6,
    intro: t(
      "Modulni takrorlaymiz: xesh xossalari, salt, sekin xeshlar, to‘g‘ri algoritm, HMAC va parol siyosati.",
      "A review of the module: hash properties, salts, slow hashes, the right algorithm, HMAC and password policy.",
    ),
    analogy: t(
      "Parol himoyasi — zanjir: yaxshi parol, sekin xesh, salt va MFA. Eng zaif halqa butun zanjirni belgilaydi.",
      "Password protection is a chain: a good password, a slow hash, a salt and MFA. The weakest link sets the whole chain.",
    ),
    theory: [
      t(
        "Sizib chiqish bo‘lishi mumkin deb faraz qiling — va shunday saqlangki, sizib chiqqanda ham parollar ochilmasin.",
        "Assume a leak will happen — and store passwords so that even then they stay closed.",
      ),
    ],
    task: t(
      "Barcha savollarga to‘g‘ri javob bering.",
      "Answer every question correctly.",
    ),
    hint: t(
      "Salt — bir xillikka qarshi, sekinlik — taxminlarga qarshi, kalit — soxtalikka qarshi.",
      "A salt fights sameness, slowness fights guessing, a key fights forgery.",
    ),
    widget: {
      type: "quiz",
      questions: [
        {
          ask: t(
            "Salt nimadan himoya qiladi?",
            "What does a salt protect against?",
          ),
          options: [
            t(
              "Oldindan tayyorlangan jadvallar va bir xil parollarning ko‘rinishidan",
              "Precomputed tables and equal passwords showing as equal",
            ),
            t(
              "Parolni har qanday taxmin qilishdan",
              "Any guessing of the password",
            ),
            t("Bazaning sizib chiqishidan", "The database leaking"),
          ],
          answer: 0,
          explain: t(
            "Salt maxfiy emas; taxminlarni sekin xesh qimmatlashtiradi.",
            "A salt is not secret; a slow hash is what makes guessing expensive.",
          ),
        },
        {
          ask: t(
            "Nega SHA-256 parol uchun yaroqsiz, salt bo‘lsa ham?",
            "Why is SHA-256 unfit for passwords, even with a salt?",
          ),
          options: [
            t(
              "U juda tez — taxminlar arzon",
              "It is too fast — guesses are cheap",
            ),
            t("Uni orqaga qaytarish mumkin", "It can be reversed"),
            t("U faqat raqamlarni qabul qiladi", "It accepts digits only"),
          ],
          answer: 0,
          explain: t(
            "Videokarta soniyasiga milliardlab SHA-256 hisoblaydi.",
            "A graphics card computes billions of SHA-256 hashes a second.",
          ),
        },
        {
          ask: t(
            "bcrypt’da cost 10 dan 11 ga oshirilsa nima bo‘ladi?",
            "What happens when bcrypt’s cost goes from 10 to 11?",
          ),
          options: [
            t(
              "Har bir xesh ikki baravar sekinlashadi",
              "Each hash takes twice as long",
            ),
            t(
              "Xesh uzunligi ikki baravar oshadi",
              "The hash gets twice as long",
            ),
            t("Hech narsa o‘zgarmaydi", "Nothing changes"),
          ],
          answer: 0,
          explain: t(
            "Cost — ikki darajasi: har bir birlik ishni ikki baravar oshiradi.",
            "The cost is a power of two: each step doubles the work.",
          ),
        },
        {
          ask: t(
            "Webhook imzosi uchun qaysi biri to‘g‘ri?",
            "Which is right for signing a webhook?",
          ),
          options: [
            code("HMAC-SHA256(secret, body)"),
            code("SHA-256(body)"),
            code("Base64(body)"),
          ],
          answer: 0,
          explain: t(
            "Kalitsiz imzoni hujumchi o‘zi qayta hisoblaydi.",
            "Without a key, the attacker recomputes the signature itself.",
          ),
        },
      ],
    },
  },
];
