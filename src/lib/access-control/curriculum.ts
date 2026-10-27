// Academy Intermediate · Web application security, module 4: access control.
// The lessons use pretend services (./tools.ts): an orders API that may skip
// the owner check, a JWT checker with a simplified signature, and a sign-in
// whose second factor is weighed against common attacks.
import type { CommonWidget, Lesson, Text } from "../anim-lab/types";

export type Widget =
  CommonWidget | { type: "idor" } | { type: "jwt" } | { type: "mfa" };

export const PROGRESS_KEY = "cybervalue:access:progress:v1";

const t = (uz: string, en: string): Text => ({ uz, en });
const code = (s: string) => t(s, s);

const WHO = t("Kim va nimaga ruxsat", "Who, and allowed to what");
const TOKENS = t("Tokenlar", "Tokens");
const SIGNIN = t("Tizimga kirish", "Signing in");

export const LESSONS: Lesson<Widget>[] = [
  {
    id: 1,
    group: WHO,
    title: t("Ikki xil savol", "Two different questions"),
    minutes: 6,
    intro: t(
      "Har bir so‘rovda server ikki savolga javob beradi. Autentifikatsiya: “Siz kimsiz?” — parol, kod yoki kalit bilan isbotlanadi. Avtorizatsiya: “Sizga bunga ruxsat bormi?” — rol, egalik va qoidalar bilan tekshiriladi.",
      "On every request a server answers two questions. Authentication: “Who are you?” — proven with a password, a code or a key. Authorization: “Are you allowed to do this?” — checked with roles, ownership and rules.",
    ),
    analogy: t(
      "Mehmonxonada pasport ko‘rsatasiz — bu kimligingiz. Kalit kartangiz faqat o‘z xonangizni ochadi — bu ruxsatingiz.",
      "At a hotel you show your passport — that is who you are. Your key card opens only your own room — that is what you may do.",
    ),
    theory: [
      t(
        "Ko‘p zaifliklar ikkinchi savol unutilganda paydo bo‘ladi: foydalanuvchi tizimga kirgan, lekin server u so‘ragan narsa unikimi yoki yo‘qmi tekshirmaydi.",
        "Many weaknesses come from forgetting the second question: the user is signed in, but the server does not check that what they asked for is theirs.",
      ),
      t(
        "OWASP Top 10 ro‘yxatida “Broken Access Control” birinchi o‘rinda turadi.",
        "“Broken Access Control” is first on the OWASP Top 10.",
      ),
    ],
    task: t(
      "Har bir tekshiruvni joyiga ajrating: u “kim?” savoliga javob beradimi yoki “ruxsat bormi?” savoliga?",
      "Sort each check: does it answer “who?” or “allowed?”",
    ),
    hint: t(
      "Parol, kod va kalit — kimlik. Rol va egalik — ruxsat.",
      "Passwords, codes and keys are identity. Roles and ownership are permission.",
    ),
    widget: {
      type: "sort",
      buckets: [
        {
          id: "authn",
          label: t("Kim? (autentifikatsiya)", "Who? (authentication)"),
        },
        {
          id: "authz",
          label: t("Ruxsat bormi? (avtorizatsiya)", "Allowed? (authorization)"),
        },
      ],
      items: [
        {
          label: t(
            "Parol bazadagi xesh bilan solishtiriladi",
            "The password is compared with the stored hash",
          ),
          bucket: "authn",
        },
        {
          label: t(
            "Admin sahifasi uchun rol tekshiriladi",
            "The role is checked for the admin page",
          ),
          bucket: "authz",
        },
        {
          label: t(
            "Ilovadagi 6 xonali kod tekshiriladi",
            "The 6-digit app code is checked",
          ),
          bucket: "authn",
        },
        {
          label: t(
            "Buyurtma shu foydalanuvchinikimi?",
            "Does this order belong to this user?",
          ),
          bucket: "authz",
        },
        {
          label: t(
            "Sessiya cookie’si haqiqiymi?",
            "Is the session cookie genuine?",
          ),
          bucket: "authn",
        },
        {
          label: t(
            "O‘qituvchi faqat o‘z guruhining baholarini o‘zgartira oladimi?",
            "May a teacher change grades only in their own group?",
          ),
          bucket: "authz",
        },
      ],
    },
  },
  {
    id: 2,
    group: WHO,
    title: t("Boshqaning buyurtmasi", "Someone else’s order"),
    minutes: 10,
    intro: t(
      "Siz do‘konga Ali sifatida kirgansiz. Buyurtmangiz manzili /api/orders/1041. Raqamni o‘zgartirsangiz nima bo‘ladi? Agar server faqat “tizimga kirganmi?” deb tekshirsa, boshqa odamning buyurtmasini ko‘rsatadi. Bu IDOR (insecure direct object reference) deyiladi.",
      "You are signed in to a shop as Ali. Your order is at /api/orders/1041. What if you change the number? If the server only checks “signed in?”, it shows someone else’s order. This is IDOR (insecure direct object reference).",
    ),
    analogy: t(
      "Garderobda raqamli jeton berishadi. Agar xodim jetonni emas, faqat raqamni so‘rasa, istalgan raqamni aytib boshqaning paltosini olish mumkin.",
      "A cloakroom gives you a numbered tag. If the attendant asks only for the number, not the tag, anyone can name a number and take another coat.",
    ),
    theory: [
      t(
        "Himoya — har bir so‘rovda egalikni serverda tekshirish: WHERE id = ? AND owner = ? yoki shunga teng qoida.",
        "The defence is to check ownership on the server on every request: WHERE id = ? AND owner = ?, or an equal rule.",
      ),
      t(
        "Boshqaning yozuvi uchun 403 emas, 404 qaytarish ham mumkin — shunda javob bunday yozuv borligini ham bildirmaydi.",
        "For another person’s record a 404 can be returned instead of 403, so the reply does not even tell that it exists.",
      ),
      t(
        "Tasodifiy, taxmin qilib bo‘lmaydigan ID’lar (UUID) hujumni qiyinlashtiradi, lekin tekshiruv o‘rnini bosmaydi: havola baribir sizib chiqishi mumkin.",
        "Random, unguessable IDs (UUIDs) make the attack harder but do not replace the check: a link can still leak.",
      ),
    ],
    task: t(
      "Raqamni o‘zgartirib, boshqa odamning buyurtmasi ko‘rinishini toping. Keyin serverda egalik tekshiruvini yoqing va o‘sha so‘rov rad etilishini ko‘ring.",
      "Change the number until someone else’s order shows. Then switch on the owner check on the server and see that same request refused.",
    ),
    hint: t(
      "Masalan, 1042 ni sinab ko‘ring — keyin “Egalikni tekshirish” ni yoqing.",
      "Try 1042, for example — then switch on “Check the owner”.",
    ),
    widget: { type: "idor" },
  },
  {
    id: 3,
    group: WHO,
    title: t("Yashirilgan tugma — qulf emas", "A hidden button is not a lock"),
    minutes: 6,
    intro: t(
      "Ilovada “Foydalanuvchilarni o‘chirish” tugmasi faqat adminlarga ko‘rsatiladi. Lekin tugma ortidagi API manzil hammaga ochiq bo‘lsa, oddiy foydalanuvchi so‘rovni o‘zi yuborishi mumkin. Brauzerdagi hamma narsani foydalanuvchi o‘zgartira oladi.",
      "An app shows the “Delete users” button to admins only. But if the API address behind it is open to everyone, an ordinary user can send the request themselves. Everything in the browser can be changed by the user.",
    ),
    analogy: t(
      "Xonaning eshigiga “Faqat xodimlar uchun” deb yozib qo‘yish — qulf o‘rnatish emas.",
      "Writing “Staff only” on a door is not the same as putting a lock on it.",
    ),
    theory: [
      t(
        "Ruxsat har doim serverda tekshiriladi. Interfeysdagi yashirish faqat qulaylik uchun.",
        "Permission is always checked on the server. Hiding things in the interface is only for convenience.",
      ),
      t(
        "“Deny by default”: har bir yangi yo‘l avvaldan yopiq bo‘lsin, ruxsat aniq qoida bilan beriladi. Shunda unutilgan yo‘l ochiq qolmaydi.",
        "“Deny by default”: every new route starts closed and is opened by an explicit rule, so a forgotten route does not stay open.",
      ),
      t(
        "Eng kam huquq tamoyili: har bir foydalanuvchi va xizmat faqat o‘ziga kerakli narsaga ruxsat oladi.",
        "Least privilege: every user and service gets only what it needs.",
      ),
    ],
    task: t(
      "Qaysi choralar haqiqatan himoya qiladi, qaysilari himoya qilmaydi?",
      "Which measures really protect, and which do not?",
    ),
    hint: t(
      "Brauzerda bajariladigan narsa — himoya emas.",
      "Anything done in the browser is not protection.",
    ),
    widget: {
      type: "sort",
      buckets: [
        { id: "yes", label: t("Himoya qiladi", "Protects") },
        { id: "no", label: t("Himoya qilmaydi", "Does not protect") },
      ],
      items: [
        {
          label: t(
            "Admin menyusini oddiy foydalanuvchidan yashirish",
            "Hiding the admin menu from ordinary users",
          ),
          bucket: "no",
        },
        {
          label: t(
            "Server /api/admin/users da rolni tekshiradi",
            "The server checks the role on /api/admin/users",
          ),
          bucket: "yes",
        },
        { label: code("<button disabled>"), code: true, bucket: "no" },
        {
          label: t(
            'Brauzer JavaScript’ida if (user.role === "admin")',
            'if (user.role === "admin") in the browser’s JavaScript',
          ),
          bucket: "no",
        },
        {
          label: t(
            "Barcha yo‘llar uchun “avval yopiq” middleware",
            "A “closed unless allowed” middleware on every route",
          ),
          bucket: "yes",
        },
        {
          label: code("WHERE id = ? AND owner = ?"),
          code: true,
          bucket: "yes",
        },
      ],
    },
  },
  {
    id: 4,
    group: TOKENS,
    title: t("JWT ichida nima bor", "What is inside a JWT"),
    minutes: 8,
    intro: t(
      "Ko‘p API’lar sessiya o‘rniga JSON Web Token (JWT) beradi. U nuqtalar bilan ajratilgan uch qismdan iborat: sarlavha, ma’lumot (payload) va imzo. Birinchi ikki qism shifrlanmagan — faqat Base64URL bilan yozilgan, uni har kim o‘qiy oladi.",
      "Many APIs hand out a JSON Web Token (JWT) instead of a session. It has three parts separated by dots: a header, the data (payload) and a signature. The first two are not encrypted — only written in Base64URL, so anyone can read them.",
    ),
    analogy: t(
      "Muhrlangan ochiq xat: matnini har kim o‘qiy oladi, lekin muhrni faqat egasi qo‘ya oladi. Muhr — matn o‘zgartirilmaganining isboti.",
      "An open letter with a wax seal: anyone can read it, but only the owner can make the seal. The seal proves the text was not changed.",
    ),
    theory: [
      t(
        "Imzo sarlavha va payload’dan server siri bilan hisoblanadi. Bir harf o‘zgarsa, imzo mos kelmaydi.",
        "The signature is computed from the header and payload with the server’s secret. Change one character and it no longer matches.",
      ),
      t(
        "exp — tokenning amal qilish muddati. Muddatsiz token o‘g‘irlansa, abadiy ishlaydi.",
        "exp is when the token expires. A token without one works forever once stolen.",
      ),
    ],
    task: t(
      "Tokenning har bir qismini bosib, nima ekanini o‘qing.",
      "Click each part of the token and read what it is.",
    ),
    hint: t("Hammasi bo‘lib beshta qism.", "Five parts in all."),
    widget: {
      type: "anatomy",
      lines: [
        [
          { text: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9", id: "header" },
          { text: "." },
        ],
        [
          {
            text: "eyJzdWIiOiJhbGkiLCJyb2xlIjoic3R1ZGVudCIsImV4cCI6MTgwMDAwMzYwMH0",
            id: "payload",
          },
          { text: "." },
        ],
        [{ text: "Q2lZbWQ0T…", id: "signature" }],
        [{ text: '{ "alg": "HS256", "typ": "JWT" }', id: "alg" }],
        [
          {
            text: '{ "sub": "ali", "role": "student", "exp": 1800003600 }',
            id: "claims",
          },
        ],
      ],
      parts: [
        {
          id: "header",
          title: t("Sarlavha (Base64URL)", "Header (Base64URL)"),
          body: t(
            "Tokenning birinchi qismi. Uni ochsangiz, pastdagi JSON chiqadi — shifr yo‘q.",
            "The first part of the token. Decode it and you get the JSON below — no encryption.",
          ),
        },
        {
          id: "payload",
          title: t("Payload (Base64URL)", "Payload (Base64URL)"),
          body: t(
            "Foydalanuvchi haqidagi da’volar (claims). Har kim o‘qiy oladi, shuning uchun bu yerga sir yozilmaydi.",
            "The claims about the user. Anyone can read them, so no secrets go here.",
          ),
        },
        {
          id: "signature",
          title: t("Imzo", "Signature"),
          body: t(
            "Sarlavha va payload server siri bilan imzolangan. Siri bo‘lmagan odam to‘g‘ri imzo yasay olmaydi.",
            "The header and payload signed with the server’s secret. Without the secret nobody can make a valid one.",
          ),
        },
        {
          id: "alg",
          title: t("alg — imzo algoritmi", "alg — the signing algorithm"),
          body: t(
            "HS256 — umumiy sir bilan HMAC-SHA256. Server algoritmni tokendan emas, o‘z sozlamasidan olishi kerak.",
            "HS256 is HMAC-SHA256 with a shared secret. The server must take the algorithm from its own settings, not from the token.",
          ),
        },
        {
          id: "claims",
          title: t("sub, role, exp", "sub, role, exp"),
          body: t(
            "sub — kim; role — qaysi huquqlar; exp — qachongacha (Unix vaqt, soniyalarda).",
            "sub is who; role is which rights; exp is until when (Unix time, in seconds).",
          ),
        },
      ],
    },
  },
  {
    id: 5,
    group: TOKENS,
    title: t("Soxta token", "A forged token"),
    minutes: 10,
    intro: t(
      "Ali o‘z tokenidagi role ni “admin” ga o‘zgartirdi. Ikki usulni sinaydi: eski imzoni qoldirish va sarlavhaga alg: none yozib, imzoni olib tashlash. Server qanday sozlangan bo‘lsa, ular o‘tadi?",
      "Ali changed the role in his token to “admin”. He tries two ways: keeping the old signature, and writing alg: none in the header with no signature. How must the server be set up so neither gets through?",
    ),
    analogy: t(
      "Ruxsatnomadagi lavozimni ruchka bilan o‘zgartirish — qorovul muhrga qarasa, darhol bilinadi. Lekin qorovul “muhr kerak emas” degan yozuvga ishonsa, bilinmaydi.",
      "Changing the job title on a pass with a pen shows as soon as the guard checks the seal — unless the guard believes a note saying “no seal needed”.",
    ),
    theory: [
      t(
        "Tokenni faqat decode qilish (o‘qish) yetarli emas — imzo har safar tekshiriladi.",
        "Only decoding (reading) a token is not enough — the signature is checked every time.",
      ),
      t(
        "alg: none — “imzo yo‘q” degani. Server algoritmni tokendan olsa, hujumchi uni o‘zi tanlaydi. Ruxsat etilgan algoritmlar ro‘yxatini serverda belgilang.",
        "alg: none means “no signature”. If the server takes the algorithm from the token, the attacker chooses it. Fix the allowed algorithms on the server.",
      ),
      t(
        'Ishonchli kutubxonadan foydalaning va uni algorithms: ["HS256"] kabi aniq sozlang.',
        'Use a well-known library and configure it explicitly, such as algorithms: ["HS256"].',
      ),
    ],
    task: t(
      "Serverni shunday sozlangki, Alining haqiqiy tokeni ishlasin, ikkala soxta token esa rad etilsin.",
      "Set up the server so Ali’s real token works and both forged tokens are refused.",
    ),
    hint: t(
      "Imzoni tekshirishni yoqing va alg: none ni qabul qilishni o‘chiring.",
      "Switch on signature checking and switch off accepting alg: none.",
    ),
    widget: { type: "jwt" },
  },
  {
    id: 6,
    group: TOKENS,
    title: t("Tokenga nima yoziladi", "What goes in a token"),
    minutes: 6,
    intro: t(
      "Payload’ni har kim o‘qiy oladi: token brauzerda, loglarda va ba’zan manzil qatorida saqlanadi. Shuning uchun unga faqat ruxsat uchun kerakli va oshkor bo‘lishi xavfsiz ma’lumot yoziladi.",
      "Anyone can read the payload: tokens sit in the browser, in logs and sometimes in the address bar. So it holds only what access needs and what is safe to reveal.",
    ),
    analogy: t(
      "Bejikka ismingiz va bo‘limingiz yoziladi, lekin bank kartangiz PIN-kodi emas.",
      "A name badge shows your name and department, not your bank card PIN.",
    ),
    theory: [
      t(
        "Qisqa muddat (exp) va yangilash tokeni o‘g‘irlangan tokenning zararini kamaytiradi.",
        "A short lifetime (exp) with a refresh token limits the harm of a stolen token.",
      ),
      t(
        "JWT’ni serverda bekor qilish qiyin: kerak bo‘lsa, bekor qilinganlar ro‘yxatini yoki qisqa muddatni ishlating.",
        "A JWT is hard to revoke on the server: use a deny list or short lifetimes when you need to.",
      ),
    ],
    task: t(
      "Qaysi ma’lumot tokenga yozilishi mumkin, qaysi biri hech qachon yozilmaydi?",
      "Which data may go in the token, and which must never go there?",
    ),
    hint: t(
      "Sir yoki shaxsiy ma’lumot — tokenga emas.",
      "Secrets and private data do not go in the token.",
    ),
    widget: {
      type: "sort",
      buckets: [
        { id: "ok", label: t("Yozish mumkin", "May go in") },
        { id: "never", label: t("Hech qachon", "Never") },
      ],
      items: [
        {
          label: t("Foydalanuvchi ID (sub)", "The user ID (sub)"),
          bucket: "ok",
        },
        { label: t("Rol: student", "Role: student"), bucket: "ok" },
        {
          label: t("Amal qilish muddati (exp)", "The expiry time (exp)"),
          bucket: "ok",
        },
        {
          label: t("Foydalanuvchi paroli", "The user’s password"),
          bucket: "never",
        },
        {
          label: t("Bank kartasi raqami", "A bank card number"),
          bucket: "never",
        },
        {
          label: t(
            "Tokenni imzolaydigan server siri",
            "The server secret that signs tokens",
          ),
          bucket: "never",
        },
      ],
    },
  },
  {
    id: 7,
    group: SIGNIN,
    title: t("Ikkinchi omil", "The second factor"),
    minutes: 8,
    intro: t(
      "Parol sizib chiqishi yoki taxmin qilinishi mumkin. Ko‘p faktorli autentifikatsiya (MFA) ikkinchi isbot so‘raydi: telefon, ilova yoki kalit. Lekin har bir omil har bir hujumni to‘xtatmaydi.",
      "Passwords leak and get guessed. Multi-factor authentication (MFA) asks for a second proof: a phone, an app or a key. But not every factor stops every attack.",
    ),
    analogy: t(
      "Uy kaliti va signalizatsiya kodi: kalitni yo‘qotsangiz ham, o‘g‘ri kodni bilmaydi. Lekin kodni so‘rab qo‘ng‘iroq qilgan “ustaga” aytib qo‘ysangiz — foydasi yo‘q.",
      "A house key and an alarm code: lose the key and a thief still lacks the code — unless you read the code out to a “repairman” who phones you.",
    ),
    theory: [
      t(
        "SMS kod SIM almashtirish (operatorni aldab raqamni boshqa kartaga o‘tkazish) bilan o‘g‘irlanishi mumkin.",
        "An SMS code can be stolen by a SIM swap — tricking the operator into moving your number to another card.",
      ),
      t(
        "TOTP ilovasidagi kod telefonda yaratiladi, lekin soxta sahifaga yozilsa, u darhol haqiqiy saytga uzatiladi.",
        "A TOTP app makes the code on your phone, but if you type it into a fake page it is passed to the real site at once.",
      ),
      t(
        "Xavfsizlik kaliti yoki passkey saytning haqiqiy manzili uchun imzo qo‘yadi: soxta sahifa uzatadigan hech narsa olmaydi.",
        "A security key or passkey signs for the site’s real address, so a fake page gets nothing it can pass on.",
      ),
    ],
    task: t(
      "Bank xodimining hisobi uchun kirish usulini tanlang: u jadvaldagi to‘rtala hujumni ham to‘xtatsin.",
      "Choose how a bank employee signs in so that all four attacks in the table are stopped.",
    ),
    hint: t(
      "Soxta sahifani faqat sayt manzilini tekshiradigan omil to‘xtatadi.",
      "Only a factor that checks the site’s address stops a fake page.",
    ),
    widget: { type: "mfa" },
  },
  {
    id: 8,
    group: SIGNIN,
    title: t("Kirish sahifasini mustahkamlash", "Hardening the sign-in page"),
    minutes: 6,
    intro: t(
      "Kirish sahifasi — hujumchilar eng ko‘p uradigan joy. Bir nechta oddiy qoida uni ancha mustahkam qiladi: parolni to‘g‘ri saqlash, urinishlarni cheklash va xato xabarida ortiqcha narsa aytmaslik.",
      "The sign-in page is where attackers knock most. A few plain rules harden it a lot: store passwords properly, limit attempts and say nothing extra in error messages.",
    ),
    analogy: t(
      "Seyf: kalit nusxasi saqlanmaydi, uch marta xato kod — kutish, va “kod noto‘g‘ri” deyiladi, “uchinchi raqam xato” emas.",
      "A safe: no copy of the key is kept, three wrong codes mean a wait, and it says “wrong code”, not “the third digit is wrong”.",
    ),
    theory: [
      t(
        "Parollar sekin xesh funksiyasi (Argon2, bcrypt) va tuz bilan saqlanadi — hech qachon ochiq yoki oddiy SHA-256 bilan emas.",
        "Passwords are stored with a slow hash (Argon2, bcrypt) and a salt — never in plain text or with plain SHA-256.",
      ),
      t(
        "“Email yoki parol noto‘g‘ri” — bitta umumiy xabar. Aks holda hujumchi qaysi email ro‘yxatdan o‘tganini bilib oladi.",
        "“Wrong email or password” — one message for both. Otherwise an attacker learns which emails are registered.",
      ),
      t(
        "Parolni tiklash havolasi bir martalik, tasodifiy va qisqa muddatli bo‘ladi.",
        "A password reset link is single-use, random and short-lived.",
      ),
    ],
    task: t("Savollarga javob bering.", "Answer the questions."),
    hint: t(
      "Har bir javobda hujumchiga kamroq ma’lumot va kamroq urinish qolishi kerak.",
      "Each answer should leave the attacker less to learn and fewer tries.",
    ),
    widget: {
      type: "quiz",
      questions: [
        {
          ask: t(
            "Parollarni qanday saqlash kerak?",
            "How should passwords be stored?",
          ),
          options: [
            t(
              "Argon2 yoki bcrypt bilan, tuz qo‘shib",
              "With Argon2 or bcrypt, salted",
            ),
            t("Base64 bilan kodlab", "Encoded in Base64"),
            t("Bitta SHA-256 xesh bilan", "As a single SHA-256 hash"),
          ],
          answer: 0,
          explain: t(
            "Sekin xesh har bir taxminni qimmatlashtiradi; Base64 — shifr emas.",
            "A slow hash makes every guess expensive; Base64 is not encryption.",
          ),
        },
        {
          ask: t(
            "Kirish xato bo‘lganda qaysi xabar to‘g‘ri?",
            "Which message is right after a failed sign-in?",
          ),
          options: [
            t("Email yoki parol noto‘g‘ri", "Wrong email or password"),
            t("Bunday email ro‘yxatdan o‘tmagan", "No account with this email"),
            t(
              "Parol noto‘g‘ri, email to‘g‘ri",
              "Wrong password, the email is right",
            ),
          ],
          answer: 0,
          explain: t(
            "Umumiy xabar qaysi hisoblar mavjudligini oshkor qilmaydi.",
            "A shared message does not reveal which accounts exist.",
          ),
        },
        {
          ask: t(
            "Parolni ketma-ket taxmin qilishni nima sekinlashtiradi?",
            "What slows down guessing passwords one after another?",
          ),
          options: [
            t(
              "Urinishlarni cheklash (rate limiting)",
              "Limiting attempts (rate limiting)",
            ),
            t("Parol maydonini yashirish", "Hiding the password field"),
            t("Sahifani HTTPS ga o‘tkazish", "Moving the page to HTTPS"),
          ],
          answer: 0,
          explain: t(
            "Bir manzil yoki hisob uchun vaqt birligidagi urinishlar soni cheklanadi.",
            "The number of attempts per address or account in a time window is capped.",
          ),
        },
      ],
    },
  },
  {
    id: 9,
    group: SIGNIN,
    title: t("Yakuniy savollar", "Final questions"),
    minutes: 6,
    intro: t(
      "Modulni takrorlaymiz: kimlik va ruxsat, egalikni tekshirish, server tomonidagi qoidalar, tokenlar va ikkinchi omil.",
      "A review of the module: identity and permission, ownership checks, server-side rules, tokens and the second factor.",
    ),
    analogy: t(
      "Bino xavfsizligi: kirishda hujjat (kim), har bir eshikda qulf (ruxsat), muhrlangan ruxsatnoma (token) va ikkinchi kalit (MFA).",
      "Building security: an ID at the entrance (who), a lock on every door (permission), a sealed pass (the token) and a second key (MFA).",
    ),
    theory: [
      t(
        "Avval “kim?”, keyin har bir so‘rovda “bunga ruxsat bormi?” — va har doim serverda.",
        "First “who?”, then on every request “allowed to this?” — and always on the server.",
      ),
    ],
    task: t(
      "Barcha savollarga to‘g‘ri javob bering.",
      "Answer every question correctly.",
    ),
    hint: t(
      "Har bir himoya qaysi savolga javob berishini eslang.",
      "Remember which question each defence answers.",
    ),
    widget: {
      type: "quiz",
      questions: [
        {
          ask: t(
            "/api/orders/1042 Alining buyurtmasi emas, lekin server uni ko‘rsatdi. Bu qanday zaiflik?",
            "/api/orders/1042 is not Ali’s order, yet the server showed it. Which weakness is this?",
          ),
          options: [code("IDOR"), code("XSS"), code("CSRF")],
          answer: 0,
          explain: t(
            "Server faqat kirganini tekshirdi, egalikni tekshirmadi.",
            "The server checked sign-in only, not ownership.",
          ),
        },
        {
          ask: t(
            "Ruxsat qayerda tekshirilishi kerak?",
            "Where must permission be checked?",
          ),
          options: [
            t("Serverda, har bir so‘rovda", "On the server, on every request"),
            t(
              "Brauzerda, tugmani yashirib",
              "In the browser, by hiding the button",
            ),
            t("Faqat kirish sahifasida", "Only on the sign-in page"),
          ],
          answer: 0,
          explain: t(
            "Brauzerdagi narsalarni foydalanuvchi o‘zgartira oladi.",
            "The user can change anything in the browser.",
          ),
        },
        {
          ask: t(
            "JWT payload’ini kim o‘qiy oladi?",
            "Who can read a JWT payload?",
          ),
          options: [
            t("Tokenni qo‘lga kiritgan har kim", "Anyone who has the token"),
            t("Faqat server", "Only the server"),
            t("Hech kim — u shifrlangan", "Nobody — it is encrypted"),
          ],
          answer: 0,
          explain: t(
            "Payload faqat Base64URL bilan yozilgan; imzo uni o‘zgartirishdan himoya qiladi, o‘qishdan emas.",
            "The payload is only Base64URL; the signature guards against changes, not against reading.",
          ),
        },
        {
          ask: t(
            "Qaysi ikkinchi omil soxta kirish sahifasidan ham himoya qiladi?",
            "Which second factor also protects against a fake sign-in page?",
          ),
          options: [
            t("Xavfsizlik kaliti / passkey", "A security key / passkey"),
            t("SMS kod", "An SMS code"),
            t("Ilovadagi 6 xonali kod", "A 6-digit app code"),
          ],
          answer: 0,
          explain: t(
            "Kalit saytning haqiqiy manzili uchun imzo qo‘yadi.",
            "The key signs for the site’s real address.",
          ),
        },
      ],
    },
  },
];
