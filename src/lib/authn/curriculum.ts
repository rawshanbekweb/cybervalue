// Academy Intermediate · System security, module 4: Authentication. The
// lessons use ./tools.ts: a modern password policy checked on six
// candidates.
import type { CommonWidget, Lesson, Text } from "../anim-lab/types";

export type Widget = CommonWidget | { type: "policy" };

export const PROGRESS_KEY = "cybervalue:authn:progress:v1";

const t = (uz: string, en: string): Text => ({ uz, en });

const PASSWORDS = t("Parollar", "Passwords");
const BEYOND = t("Paroldan tashqari", "Beyond passwords");

export const LESSONS: Lesson<Widget>[] = [
  {
    id: 1,
    group: PASSWORDS,
    title: t("Uchta omil", "The three factors"),
    minutes: 5,
    intro: t(
      "Autentifikatsiya — “siz haqiqatan kimsiz?” degan savolga javob. Isbot uch xil bo‘ladi: siz biladigan narsa (parol, PIN), sizda bor narsa (telefon, xavfsizlik kaliti, smart-karta) va siz o‘zingiz (barmoq izi, yuz). Ko‘p omilli autentifikatsiya (MFA) — kamida ikki xil turdan foydalanish: parol o‘g‘irlansa ham, hujumchida sizning telefoningiz yo‘q.",
      "Authentication answers “are you really who you say?”. Proof comes in three kinds: something you know (a password, a PIN), something you have (a phone, a security key, a smart card) and something you are (a fingerprint, a face). Multi-factor authentication (MFA) uses at least two different kinds: even if the password is stolen, the attacker doesn’t have your phone.",
    ),
    analogy: t(
      "Bankomat: karta (sizda bor) va PIN (siz bilasiz).",
      "A cash machine: the card (something you have) and the PIN (something you know).",
    ),
    theory: [
      t(
        "Ikki parol — ikki omil emas: ikkalasi ham “bilish” turidan.",
        "Two passwords aren’t two factors: both are things you know.",
      ),
    ],
    task: t("Har birini omil turiga ajrating.", "Sort each into its factor."),
    hint: t(
      "Bilasizmi, ushlab turasizmi yoki o‘zingizmi?",
      "Do you know it, hold it, or are you it?",
    ),
    widget: {
      type: "sort",
      buckets: [
        { id: "know", label: t("Bilish", "Know") },
        { id: "have", label: t("Ega bo‘lish", "Have") },
        { id: "are", label: t("O‘zingiz", "Are") },
      ],
      items: [
        { label: t("Parol", "A password"), bucket: "know" },
        {
          label: t("USB xavfsizlik kaliti", "A USB security key"),
          bucket: "have",
        },
        { label: t("Barmoq izi", "A fingerprint"), bucket: "are" },
        { label: t("Telefon PIN kodi", "A phone PIN"), bucket: "know" },
        {
          label: t(
            "Authenticator ilovasi o‘rnatilgan telefon",
            "A phone with an authenticator app",
          ),
          bucket: "have",
        },
        { label: t("Yuzni tanish", "Face recognition"), bucket: "are" },
      ],
    },
  },
  {
    id: 2,
    group: PASSWORDS,
    title: t("Zamonaviy parol siyosati", "A modern password policy"),
    minutes: 6,
    intro: t(
      "Eski qoidalar — “katta harf, raqam, belgi va har 90 kunda almashtiring” — odamlarni `Parol2024!` → `Parol2025!` kabi bashorat qilinadigan parollarga undaydi. Bugungi tavsiyalar (masalan, NIST SP 800-63B): uzunlik muhimroq (kamida 12 belgi, gap ham bo‘ladi), sizib chiqqan parollar ro‘yxati bilan solishtiring, majburiy davriy almashtirish yo‘q — faqat sizib chiqqanda, va parol menejeri ishlatishga ruxsat bering (joylashtirish bloklanmaydi).",
      "Old rules — “a capital, a digit, a symbol, and change it every 90 days” — push people towards predictable passwords like `Parol2024!` → `Parol2025!`. Current guidance (such as NIST SP 800-63B): length matters more (at least 12 characters; a sentence is fine), check against a list of breached passwords, no forced periodic changes — only when there is a leak — and allow password managers (don’t block pasting).",
    ),
    analogy: t(
      "Uzun yo‘l, murakkab yo‘ldan qiyinroq bosib o‘tiladi.",
      "A long road is harder to walk than a twisty short one.",
    ),
    theory: [
      t(
        "Har bir sayt uchun alohida parol: bitta sizib chiqsa, qolganlari xavfsiz qoladi.",
        "A different password for every site: one leak doesn’t open the rest.",
      ),
    ],
    task: t("Savollarga javob bering.", "Answer the questions."),
    hint: t("Uzunlik va ro‘yxat.", "Length and the list."),
    widget: {
      type: "quiz",
      questions: [
        {
          ask: t(
            "Qaysi parol taxmin qilishga chidamliroq?",
            "Which password stands up better to guessing?",
          ),
          options: [
            t("olma-tog‘-daryo-osmon", "olma-tog‘-daryo-osmon"),
            t("P@ssw0rd", "P@ssw0rd"),
            t("Qw3rty!", "Qw3rty!"),
          ],
          answer: 0,
          explain: t(
            "To‘rtta tasodifiy so‘z — uzun va lug‘atdagi naqshlarga o‘xshamaydi.",
            "Four random words: long, and unlike any dictionary pattern.",
          ),
        },
        {
          ask: t(
            "Parolni qachon majburan almashtirish kerak?",
            "When should a password be forcibly changed?",
          ),
          options: [
            t(
              "Sizib chiqqani yoki buzilgani ma’lum bo‘lganda",
              "When it is known to have leaked or been compromised",
            ),
            t("Har 30 kunda", "Every 30 days"),
            t("Hech qachon", "Never"),
          ],
          answer: 0,
          explain: t(
            "Tez-tez almashtirish zaif, bashorat qilinadigan parollarga olib keladi.",
            "Frequent forced changes breed weak, predictable passwords.",
          ),
        },
      ],
    },
  },
  {
    id: 3,
    group: PASSWORDS,
    title: t("Siyosatni qo‘llash", "Applying the policy"),
    minutes: 8,
    intro: t(
      "Siyosat: kamida 12 belgi, sizib chiqqan parollar ro‘yxatida yo‘q va foydalanuvchi nomini o‘z ichiga olmaydi. Foydalanuvchi `dilnoza` oltita parolni sinab ko‘rdi. Qaysilari qabul qilinadi? Har birini o‘zingiz qaror qiling, keyin sabab ko‘rinadi.",
      "The policy: at least 12 characters, not on the breached list and not containing the username. The user `dilnoza` tried six passwords. Which are accepted? Decide each one yourself; the reason then appears.",
    ),
    analogy: t(
      "Klub eshigidagi qoidalar: yosh, ro‘yxat va kiyim — uchalasi ham.",
      "A club door’s rules: age, the list and the dress code — all three.",
    ),
    theory: [
      t(
        "Murakkablik talabi yo‘q: `correct horse battery staple` faqat kichik harf va bo‘shliqdan iborat, lekin kuchli.",
        "There is no complexity rule: `correct horse battery staple` is lower case and spaces, yet strong.",
      ),
    ],
    task: t(
      "Har bir parolni qabul qiling yoki rad eting.",
      "Accept or reject each password.",
    ),
    hint: t("Avval uzunlikni sanang.", "Count the length first."),
    widget: { type: "policy" },
  },
  {
    id: 4,
    group: PASSWORDS,
    title: t("Parollarni saqlash", "Storing passwords"),
    minutes: 6,
    intro: t(
      "Server parolning o‘zini hech qachon saqlamaydi: faqat sekin, tuzlangan (salt) xeshini. Argon2id, bcrypt yoki scrypt ataylab sekin ishlaydi — bitta tekshiruv uchun millisekundlar, lekin milliardlab taxmin uchun yillar. Har bir foydalanuvchining o‘z tasodifiy tuzi bir xil parollarning bir xil xeshga aylanishiga yo‘l qo‘ymaydi. MD5 yoki SHA-256 ning o‘zi parol uchun yaramaydi: ular juda tez.",
      "A server never stores the password itself — only a slow, salted hash of it. Argon2id, bcrypt and scrypt are slow on purpose: milliseconds for one check, years for billions of guesses. A random salt per user stops identical passwords from producing identical hashes. Plain MD5 or SHA-256 won’t do for passwords: they are far too fast.",
    ),
    analogy: t(
      "Seyf qulfi: to‘g‘ri kodni kiritish bir soniya, hammasini sinab chiqish asrlar.",
      "A safe’s dial: the right code takes a second; trying them all takes centuries.",
    ),
    theory: [
      t(
        "Xeshlash — shifrlash emas: xeshdan parolni qaytarib olib bo‘lmaydi.",
        "Hashing isn’t encryption: you can’t turn a hash back into the password.",
      ),
    ],
    task: t("Savollarga javob bering.", "Answer the questions."),
    hint: t("Sekin va tuzli.", "Slow and salted."),
    widget: {
      type: "quiz",
      questions: [
        {
          ask: t(
            "Parol saqlash uchun qaysi biri to‘g‘ri?",
            "Which is right for storing passwords?",
          ),
          options: [
            t(
              "Argon2id, har foydalanuvchiga tuz bilan",
              "Argon2id with a salt per user",
            ),
            t("MD5", "MD5"),
            t("Parolni ochiq matnda", "The password in plain text"),
          ],
          answer: 0,
          explain: t(
            "Sekin algoritm taxminlarni juda qimmat qiladi.",
            "A slow algorithm makes guessing very expensive.",
          ),
        },
        {
          ask: t("Tuz (salt) nima uchun kerak?", "What is the salt for?"),
          options: [
            t(
              "Bir xil parollar har xil xesh berishi uchun",
              "So identical passwords give different hashes",
            ),
            t("Parolni qisqartirish uchun", "To shorten the password"),
            t("Xeshni shifrlash uchun", "To encrypt the hash"),
          ],
          answer: 0,
          explain: t(
            "Oldindan hisoblangan jadvallar ham ishlamay qoladi.",
            "Precomputed tables stop working too.",
          ),
        },
      ],
    },
  },
  {
    id: 5,
    group: BEYOND,
    title: t("MFA kuchi", "How strong is the MFA"),
    minutes: 6,
    intro: t(
      "Har qanday MFA paroldan yaxshi, lekin ular teng emas. Xavfsizlik kaliti va passkey (FIDO2/WebAuthn) faqat haqiqiy sayt bilan ishlaydi — soxta sahifaga hech narsa bermaydi, shuning uchun fishingga chidamli. Authenticator ilovasidagi 6 raqamli kod yaxshi, lekin uni fishing sahifasiga terib yuborish mumkin. SMS kodni SIM almashtirish (SIM swap) bilan ushlab olish mumkin. “Onangizning qizlik familiyasi” kabi maxfiy savollar — ijtimoiy tarmoqdan topiladi.",
      "Any MFA beats a password alone, but they aren’t equal. Security keys and passkeys (FIDO2/WebAuthn) work only with the real site — they give nothing to a fake page, so they resist phishing. A 6-digit code from an authenticator app is good, but it can be typed into a phishing page. An SMS code can be intercepted with a SIM swap. Security questions like “your mother’s maiden name” can be found on social media.",
    ),
    analogy: t(
      "Kalit faqat o‘z qulfiga mos: soxta eshikka tiqib bo‘lmaydi.",
      "A key fits only its own lock: it won’t go into a fake door.",
    ),
    theory: [
      t(
        "Push bildirishnomani doim “Tasdiqlash” deb bosish — “MFA charchoq” hujumi; raqam moslash buni to‘xtatadi.",
        "Pressing “Approve” on every push is the “MFA fatigue” attack; number matching stops it.",
      ),
    ],
    task: t(
      "Har bir usulni kuchi bo‘yicha ajrating.",
      "Sort each method by strength.",
    ),
    hint: t(
      "Fishing sahifasi buni ushlab qola oladimi?",
      "Could a phishing page capture it?",
    ),
    widget: {
      type: "sort",
      buckets: [
        { id: "strong", label: t("Fishingga chidamli", "Phishing-resistant") },
        { id: "good", label: t("Yaxshi", "Good") },
        { id: "weak", label: t("Zaif", "Weak") },
      ],
      items: [
        {
          label: t(
            "USB xavfsizlik kaliti (FIDO2)",
            "A USB security key (FIDO2)",
          ),
          bucket: "strong",
        },
        { label: t("Passkey", "A passkey"), bucket: "strong" },
        {
          label: t(
            "Authenticator ilovasidagi kod",
            "An authenticator app code",
          ),
          bucket: "good",
        },
        {
          label: t(
            "Raqam moslashli push bildirishnoma",
            "A push prompt with number matching",
          ),
          bucket: "good",
        },
        { label: t("SMS kod", "An SMS code"), bucket: "weak" },
        {
          label: t("Maxfiy savol", "A security question"),
          bucket: "weak",
        },
      ],
    },
  },
  {
    id: 6,
    group: BEYOND,
    title: t("SSH kalitlari", "SSH keys"),
    minutes: 6,
    intro: t(
      "Serverlarga parol emas, kalit bilan kiriladi. `ssh-keygen -t ed25519` ikki fayl yaratadi: shaxsiy kalit (`~/.ssh/id_ed25519`) — kompyuteringizdan hech qachon chiqmaydi va parol iborasi (passphrase) bilan himoyalanadi; ochiq kalit (`.pub`) — serverdagi `~/.ssh/authorized_keys` ga qo‘yiladi. Har bir odam va qurilma uchun alohida kalit: kimdir ketsa, faqat uning qatori o‘chiriladi. Ishdan ketgan xodimning kalitlarini olib tashlash — offboarding ro‘yxatining bir qismi.",
      "Servers are entered with keys, not passwords. `ssh-keygen -t ed25519` makes two files: the private key (`~/.ssh/id_ed25519`) never leaves your computer and is protected by a passphrase; the public key (`.pub`) goes into `~/.ssh/authorized_keys` on the server. One key per person and device: when someone leaves, only their line is removed. Removing a leaver’s keys belongs on the offboarding checklist.",
    ),
    analogy: t(
      "Ochiq kalit — qulf, uni istalgan eshikka o‘rnatasiz; shaxsiy kalit — kalitning o‘zi, faqat cho‘ntagingizda.",
      "The public key is a lock you can fit on any door; the private key is the key, and it stays in your pocket.",
    ),
    theory: [
      t(
        "`ssh-copy-id user@server` ochiq kalitni to‘g‘ri joyga qo‘yadi.",
        "`ssh-copy-id user@server` puts the public key in the right place.",
      ),
    ],
    task: t("Savollarga javob bering.", "Answer the questions."),
    hint: t(
      "Shaxsiy — hech kimga, ochiq — serverga.",
      "Private to no one, public to the server.",
    ),
    widget: {
      type: "quiz",
      questions: [
        {
          ask: t(
            "Hamkasbingiz serverga kirish uchun kalit so‘radi. Unga nima berasiz?",
            "A colleague needs access to a server. What do you give them?",
          ),
          options: [
            t(
              "Hech narsa: u o‘z kalitini yaratib, ochiq qismini yuboradi",
              "Nothing: they make their own key and send its public part",
            ),
            t("Sizning shaxsiy kalitingiz", "Your private key"),
            t("Root paroli", "The root password"),
          ],
          answer: 0,
          explain: t(
            "Shaxsiy kalit — faqat egasida; har kimning o‘z kaliti.",
            "A private key stays with its owner; everyone has their own.",
          ),
        },
        {
          ask: t(
            "Noutbuk o‘g‘irlandi. Shaxsiy kalitni nima himoya qiladi?",
            "A laptop was stolen. What protects the private key on it?",
          ),
          options: [
            t("Kalitning parol iborasi (passphrase)", "The key’s passphrase"),
            t("Fayl nomi", "Its file name"),
            t("Hech narsa", "Nothing"),
          ],
          answer: 0,
          explain: t(
            "Baribir kalitni serverlardan darhol olib tashlang.",
            "Still remove that key from the servers at once.",
          ),
        },
      ],
    },
  },
  {
    id: 7,
    group: BEYOND,
    title: t("Kirishni kuzatish", "Watching sign-ins"),
    minutes: 6,
    intro: t(
      "Yaxshi autentifikatsiya kirishni kuzatadi ham. Bir manzildan ko‘p xato urinishlar sekinlashtiriladi (rate limiting); hisobni butunlay bloklash esa hujumchiga boshqalarni chiqarib yuborish imkonini beradi, shuning uchun vaqtinchalik kechiktirish afzal. Shubhali belgilar: imkonsiz sayohat (10 daqiqada Toshkent va Braziliya), yangi qurilma, tunda admin kirishi, ko‘p hisobga bitta parol bilan urinish (password spraying). Foydalanuvchiga “yangi kirish” xabari ham yuboriladi.",
      "Good authentication also watches sign-ins. Many failures from one address are slowed down (rate limiting); locking an account outright lets an attacker shut others out, so a temporary delay is better. Warning signs: impossible travel (Tashkent and Brazil ten minutes apart), a new device, an admin signing in at night, one password tried against many accounts (password spraying). The user gets a “new sign-in” notice too.",
    ),
    analogy: t(
      "Bank kartangiz bir soatda ikki mamlakatda ishlatilsa, bank qo‘ng‘iroq qiladi.",
      "If your card is used in two countries within an hour, the bank calls you.",
    ),
    theory: [
      t(
        "Password spraying bitta hisobni bloklamaydi: u ko‘p hisobga bittadan urinadi.",
        "Password spraying stays under lockout limits: one try against many accounts.",
      ),
    ],
    task: t("Savollarga javob bering.", "Answer the questions."),
    hint: t("Naqsh, bitta urinish emas.", "The pattern, not a single try."),
    widget: {
      type: "quiz",
      questions: [
        {
          ask: t(
            "Bitta IP 300 xil hisobga `Spring2026!` bilan urinmoqda. Bu nima?",
            "One IP tries `Spring2026!` against 300 accounts. What is it?",
          ),
          options: [
            t("Password spraying", "Password spraying"),
            t("Odatiy kirish", "Normal logins"),
            t("Zaxira nusxa", "A backup"),
          ],
          answer: 0,
          explain: t(
            "Hisob bo‘yicha emas, manba bo‘yicha kuzating.",
            "Watch by source, not just by account.",
          ),
        },
        {
          ask: t(
            "Nega 5 xatodan keyin hisobni butunlay bloklash har doim ham yaxshi emas?",
            "Why isn’t locking an account for good after 5 failures always good?",
          ),
          options: [
            t(
              "Hujumchi ataylab xato kiritib, odamlarni tizimdan chiqaradi",
              "An attacker can fail on purpose and lock people out",
            ),
            t("Server sekinlashadi", "The server slows down"),
            t("Parol uzayadi", "The password gets longer"),
          ],
          answer: 0,
          explain: t(
            "Vaqtinchalik kechiktirish va MFA — muvozanatli yechim.",
            "A temporary delay plus MFA is the balanced answer.",
          ),
        },
      ],
    },
  },
  {
    id: 8,
    group: BEYOND,
    title: t("Yakuniy savollar", "Final questions"),
    minutes: 6,
    intro: t(
      "Kuchli autentifikatsiya qatlamlardan iborat: uzun, noyob parollar va parol menejeri; sekin, tuzli xeshlar; fishingga chidamli MFA; serverlar uchun kalitlar; va shubhali kirishlarni kuzatish. Ularning hech biri yolg‘iz yetarli emas.",
      "Strong authentication is layered: long, unique passwords and a password manager; slow, salted hashes; phishing-resistant MFA; keys for servers; and watching for odd sign-ins. None of them is enough on its own.",
    ),
    analogy: t(
      "Uy: qulf, signalizatsiya, kamera va qo‘shnilar.",
      "A house: the lock, the alarm, the camera and the neighbours.",
    ),
    theory: [
      t(
        "Admin hisoblar uchun fishingga chidamli MFA birinchi navbatda joriy qilinadi.",
        "Phishing-resistant MFA goes on admin accounts first.",
      ),
    ],
    task: t("Savollarga javob bering.", "Answer the questions."),
    hint: t("Qatlamlar.", "Layers."),
    widget: {
      type: "quiz",
      questions: [
        {
          ask: t(
            "Qaysi juftlik haqiqiy ikki omilli autentifikatsiya?",
            "Which pair is real two-factor authentication?",
          ),
          options: [
            t("Parol va xavfsizlik kaliti", "A password and a security key"),
            t("Parol va maxfiy savol", "A password and a security question"),
            t("Ikki xil parol", "Two different passwords"),
          ],
          answer: 0,
          explain: t(
            "Bilish + ega bo‘lish — ikki xil tur.",
            "Know plus have: two different kinds.",
          ),
        },
        {
          ask: t(
            "Admin hisoblar uchun eng yaxshi MFA?",
            "The best MFA for admin accounts?",
          ),
          options: [
            t("Xavfsizlik kaliti yoki passkey", "A security key or passkey"),
            t("SMS kod", "An SMS code"),
            t("Maxfiy savol", "A security question"),
          ],
          answer: 0,
          explain: t(
            "Fishing sahifasi undan hech narsa ololmaydi.",
            "A phishing page gets nothing from it.",
          ),
        },
      ],
    },
  },
];
