// Academy Intermediate · Cryptography, module 4: public-key cryptography.
// The lessons use real arithmetic on small numbers (./tools.ts): a
// Diffie–Hellman exchange Eve tries to break, an RSA key from two primes,
// and a man in the middle stopped by a signed public value.
import type { CommonWidget, Lesson, Text } from "../anim-lab/types";

export type Widget =
  CommonWidget | { type: "dh" } | { type: "rsa" } | { type: "mitm" };

export const PROGRESS_KEY = "cybervalue:pubkey:progress:v1";

const t = (uz: string, en: string): Text => ({ uz, en });

const TWO = t("Ikki kalit", "Two keys");
const MATH = t("Matematika ichida", "Inside the maths");
const TRUST = t("Kimga ishonamiz", "Whom to trust");

export const LESSONS: Lesson<Widget>[] = [
  {
    id: 1,
    group: TWO,
    title: t("Ochiq va yopiq kalit", "The public and the private key"),
    minutes: 6,
    intro: t(
      "Simmetrik shifrlashda kalitni oldindan yetkazish kerak edi. Ochiq kalitli kriptografiyada har kimda ikki kalit bor: ochig‘ini hammaga beradi, yopig‘ini hech kimga bermaydi. Ochiq kalit bilan shifrlangani faqat yopiq kalit bilan ochiladi, yopiq kalit bilan qo‘yilgan imzo esa ochiq kalit bilan tekshiriladi.",
      "Symmetric encryption needed the key delivered in advance. In public-key cryptography everyone has two keys: the public one they hand to all, the private one to nobody. What the public key encrypts only the private key opens, and a signature made with the private key is checked with the public one.",
    ),
    analogy: t(
      "Ochiq qulflar to‘plami: istalgan odam qulfni olib, qutini yopishi mumkin, lekin kalit faqat egasida. Imzo esa — faqat egasi qo‘ya oladigan, hamma tanib oladigan muhr.",
      "A pile of open padlocks: anyone may take one and lock a box, but only the owner has the key. A signature is a seal only the owner can make and anyone can recognise.",
    ),
    theory: [
      t(
        "Ochiq kalitli amallar sekin, shuning uchun amalda ular kalit almashish va imzo uchun ishlatiladi; ma’lumot AES bilan shifrlanadi.",
        "Public-key operations are slow, so in practice they agree keys and sign; the data itself is encrypted with AES.",
      ),
    ],
    task: t(
      "Har bir amalda qaysi kalit ishlatiladi?",
      "Which key does each action use?",
    ),
    hint: t(
      "Shifrlash — qabul qiluvchining ochiq kaliti; imzo — yuboruvchining yopiq kaliti.",
      "Encrypt with the recipient’s public key; sign with the sender’s private key.",
    ),
    widget: {
      type: "sort",
      buckets: [
        { id: "pub", label: t("Ochiq kalit", "Public key") },
        { id: "priv", label: t("Yopiq kalit", "Private key") },
      ],
      items: [
        {
          label: t(
            "Bobga faqat u o‘qiy oladigan xat yuborish",
            "Send Bob a letter only he can read",
          ),
          bucket: "pub",
        },
        {
          label: t(
            "Bob o‘ziga kelgan shifrlangan xatni ochadi",
            "Bob opens the encrypted letter he received",
          ),
          bucket: "priv",
        },
        {
          label: t(
            "Bob shartnomaga raqamli imzo qo‘yadi",
            "Bob puts a digital signature on a contract",
          ),
          bucket: "priv",
        },
        {
          label: t(
            "Alisa imzo haqiqatan Bobniki ekanini tekshiradi",
            "Alice checks the signature is really Bob’s",
          ),
          bucket: "pub",
        },
        {
          label: t(
            "Bob kalitini veb-saytida e’lon qiladi",
            "Bob publishes his key on his website",
          ),
          bucket: "pub",
        },
      ],
    },
  },
  {
    id: 2,
    group: TWO,
    title: t(
      "Diffie–Hellman: ochiq joyda umumiy sir",
      "Diffie–Hellman: a shared secret in the open",
    ),
    minutes: 10,
    intro: t(
      "Alisa va Bob hamma eshitib turgan kanalda umumiy kalit kelishib oladi. Ular ochiq p va g sonlarini tanlaydi, har biri maxfiy son o‘ylaydi va gᵃ mod p, gᵇ mod p ni almashadi. Har biri boshqasining qiymatini o‘z sirining darajasiga ko‘taradi — ikkalasida bir xil kalit chiqadi. Eve faqat ochiq sonlarni ko‘radi.",
      "Alice and Bob agree a key over a channel everyone hears. They pick public numbers p and g, each thinks of a secret and they swap gᵃ mod p and gᵇ mod p. Each raises the other’s value to their own secret — both get the same key. Eve sees only the public numbers.",
    ),
    analogy: t(
      "Bo‘yoq aralashtirish: umumiy sariq rangga har biri o‘z maxfiy rangini qo‘shib almashadi, keyin yana o‘zinikini qo‘shadi. Ikkalasida bir xil jigarrang chiqadi, aralashmadan esa maxfiy rangni ajratib bo‘lmaydi.",
      "Mixing paint: each adds a secret colour to a shared yellow and swaps, then adds their own again. Both end with the same brown, and nobody can unmix the secret colours.",
    ),
    theory: [
      t(
        "Eve gᵃ mod p dan a ni topishi kerak — bu diskret logarifm masalasi. Kichik p da u barcha sonlarni sinab chiqadi; 2048 bitli p da bu amalda imkonsiz.",
        "Eve must find a from gᵃ mod p — the discrete logarithm problem. With a small p she tries every number; with a 2048-bit p that is impossible in practice.",
      ),
      t(
        "Bugun ko‘pincha elliptik egri chiziqli variant — ECDH (X25519) ishlatiladi: kalitlar qisqaroq, tezroq.",
        "Today the elliptic-curve version, ECDH (X25519), is common: shorter keys, faster.",
      ),
    ],
    task: t(
      "Kalitlar mos kelishini ko‘ring va Eve qaysi guruhda sirni topishini kuzating. Keyin Eve topa olmaydigan guruhni tanlang.",
      "See the keys match and watch in which group Eve finds the secret. Then pick a group she cannot search.",
    ),
    hint: t("p = 2⁶¹ − 1 ni tanlang.", "Choose p = 2⁶¹ − 1."),
    widget: { type: "dh" },
  },
  {
    id: 3,
    group: MATH,
    title: t("RSA kalitini yasash", "Building an RSA key"),
    minutes: 10,
    intro: t(
      "RSA ikki tub sondan boshlanadi: p va q. n = p·q ochiq, φ = (p−1)(q−1) maxfiy. Ochiq ko‘rsatkich e (bu yerda 17), maxfiy d — e·d ≡ 1 (mod φ) bo‘ladigan son. Shifrlash: c = mᵉ mod n; ochish: m = cᵈ mod n.",
      "RSA starts from two primes, p and q. n = p·q is public, φ = (p−1)(q−1) is secret. The public exponent is e (17 here); the secret d is the number with e·d ≡ 1 (mod φ). Encrypt: c = mᵉ mod n; decrypt: m = cᵈ mod n.",
    ),
    analogy: t(
      "Ikki sonni ko‘paytirish oson, ko‘paytmadan ularni qaytarib topish — juda qiyin. RSA aynan shu notenglikka tayanadi.",
      "Multiplying two numbers is easy; finding them again from the product is very hard. RSA rests on exactly that.",
    ),
    theory: [
      t(
        "n ni ko‘paytuvchilarga ajratgan odam φ ni va d ni hisoblaydi. Shuning uchun haqiqiy n kamida 2048 bit (600+ raqam).",
        "Whoever factors n can compute φ and d. That is why real n has at least 2048 bits (600+ digits).",
      ),
      t(
        "Bu labdagi sonlar kichik — ularni bir zumda ajratish mumkin. Arifmetika esa haqiqiy RSA bilan bir xil.",
        "The numbers in this lab are small and factor at once. The arithmetic is the same as real RSA.",
      ),
    ],
    task: t(
      "Ikki tub sonni tanlang, 42 sonini ochiq kalit bilan shifrlang va yopiq kalit bilan qaytaring.",
      "Pick two primes, encrypt the number 42 with the public key and get it back with the private key.",
    ),
    hint: t(
      "p va q har xil bo‘lsin; n 42 dan katta bo‘lishi kerak.",
      "Make p and q different; n must be larger than 42.",
    ),
    widget: { type: "rsa" },
  },
  {
    id: 4,
    group: MATH,
    title: t("Kalit uzunligi va kelajak", "Key sizes and the future"),
    minutes: 6,
    intro: t(
      "Ochiq kalitli kalitlar simmetrik kalitlardan ancha uzun: 128 bitli AES taxminan 3072 bitli RSA yoki 256 bitli elliptik kalitga teng. Kvant kompyuterlar RSA va ECC ni buzishi mumkinligi uchun yangi, kvantga chidamli algoritmlar (ML-KEM, ML-DSA) joriy qilinmoqda.",
      "Public keys are much longer than symmetric ones: 128-bit AES is about as strong as 3072-bit RSA or a 256-bit elliptic-curve key. Since quantum computers could break RSA and ECC, new quantum-resistant algorithms (ML-KEM, ML-DSA) are being rolled out.",
    ),
    analogy: t(
      "Ikki xil qulf: biri kichik, lekin pishiq po‘latdan; ikkinchisi katta, lekin yumshoqroq metalldan. Bir xil mustahkamlik uchun ikkinchisi kattaroq bo‘lishi kerak.",
      "Two locks: one small but of hard steel, one large but of softer metal. For the same strength the second must be bigger.",
    ),
    theory: [
      t(
        "RSA uchun bugun kamida 2048 bit, yangi tizimlarda 3072 bit. ECC uchun P-256 yoki Curve25519.",
        "For RSA today at least 2048 bits, 3072 for new systems. For ECC, P-256 or Curve25519.",
      ),
    ],
    task: t("Savollarga javob bering.", "Answer the questions."),
    hint: t(
      "ECC kaliti qisqaroq, lekin teng darajada kuchli.",
      "An ECC key is shorter but just as strong.",
    ),
    widget: {
      type: "quiz",
      questions: [
        {
          ask: t(
            "128 bitli AES ga taxminan teng RSA kaliti?",
            "An RSA key roughly as strong as 128-bit AES?",
          ),
          options: [
            t("3072 bit", "3072 bits"),
            t("128 bit", "128 bits"),
            t("512 bit", "512 bits"),
          ],
          answer: 0,
          explain: t(
            "Ochiq kalitli kalitlar bir xil kuch uchun ancha uzun bo‘ladi.",
            "Public keys need many more bits for the same strength.",
          ),
        },
        {
          ask: t(
            "RSA ning xavfsizligi qaysi masalaga tayanadi?",
            "Which problem does RSA’s security rest on?",
          ),
          options: [
            t(
              "Katta sonni ko‘paytuvchilarga ajratish",
              "Factoring a large number",
            ),
            t("Parolni eslab qolish", "Remembering a password"),
            t("Xesh to‘qnashuvini topish", "Finding a hash collision"),
          ],
          answer: 0,
          explain: t(
            "n = p·q dan p va q ni topgan odam yopiq kalitni hisoblaydi.",
            "Whoever finds p and q from n = p·q can compute the private key.",
          ),
        },
        {
          ask: t(
            "Kvant kompyuterlar xavfi sababli nima joriy qilinmoqda?",
            "What is being rolled out because of quantum computers?",
          ),
          options: [
            t(
              "Kvantga chidamli algoritmlar (ML-KEM)",
              "Quantum-resistant algorithms (ML-KEM)",
            ),
            t("Uzunroq parollar", "Longer passwords"),
            t("MD5 ga qaytish", "A return to MD5"),
          ],
          answer: 0,
          explain: t(
            "Yangi algoritmlar kvant kompyuter ham yecha olmaydigan masalalarga asoslanadi.",
            "The new algorithms rest on problems a quantum computer cannot solve either.",
          ),
        },
      ],
    },
  },
  {
    id: 5,
    group: TRUST,
    title: t("O‘rtadagi odam", "The man in the middle"),
    minutes: 10,
    intro: t(
      "Diffie–Hellman Eve tinglashidan himoya qiladi, lekin Mallory xabarlarni o‘zgartira oladi: u Alisaga o‘z qiymatini Bobniki deb, Bobga esa Alisaniki deb yuboradi. Natijada Alisa ham, Bob ham Mallory bilan kalit kelishadi va u hamma narsani o‘qiydi.",
      "Diffie–Hellman protects against Eve listening, but Mallory can change the messages: she sends Alice her own value as if it were Bob’s, and Bob hers as if it were Alice’s. Alice and Bob each agree a key with Mallory, and she reads everything.",
    ),
    analogy: t(
      "Pochtachi har ikki tomonning xatini ochib, o‘z qulfi bilan qayta yopib yuboradi — ikkalasi ham hech narsani sezmaydi.",
      "A postman who opens each side’s letters and relocks them with his own padlock — neither side notices.",
    ),
    theory: [
      t(
        "Himoya — Bobning ochiq qiymati u ishonchli deb tasdiqlangan kalit bilan imzolanishi. Mallory bu imzoni soxtalashtira olmaydi.",
        "The defence is for Bob’s public value to be signed with a key Alice already trusts. Mallory cannot forge that signature.",
      ),
      t(
        "HTTPS’da aynan shunday: server o‘z qiymatini sertifikatdagi kalit bilan imzolaydi, brauzer sertifikatni tekshiradi (keyingi modul).",
        "HTTPS does exactly this: the server signs its value with the key in its certificate, and the browser checks the certificate (next module).",
      ),
    ],
    task: t(
      "Imzosiz almashishda Mallory ikkala tomonni ham o‘qiy olishini ko‘ring. Keyin Bob o‘z qiymatini imzolasin.",
      "See that Mallory reads both sides when nothing is signed. Then have Bob sign his value.",
    ),
    hint: t(
      "“Bob o‘z qiymatini imzolaydi” ni yoqing.",
      "Switch on “Bob signs his value”.",
    ),
    widget: { type: "mitm" },
  },
  {
    id: 6,
    group: TRUST,
    title: t("Raqamli imzo nimani isbotlaydi", "What a signature proves"),
    minutes: 6,
    intro: t(
      "Raqamli imzo uch narsani isbotlaydi: xabar yopiq kalit egasidan kelgan (haqiqiylik), yo‘lda o‘zgarmagan (yaxlitlik) va egasi buni keyin inkor eta olmaydi. Odatda xabarning xeshi imzolanadi.",
      "A digital signature proves three things: the message came from the private key’s owner (authenticity), it was not changed on the way (integrity), and the owner cannot deny it later. Usually the message’s hash is what gets signed.",
    ),
    analogy: t(
      "Notarial tasdiq: kim imzolagani, hujjat o‘zgarmagani va keyin “men imzolamaganman” deyolmasligi.",
      "A notarised document: who signed, that it was not changed, and that they cannot later say “I never signed”.",
    ),
    theory: [
      t(
        "Imzo maxfiylik bermaydi: imzolangan xabarni hamma o‘qiy oladi. Maxfiylik uchun shifrlash kerak.",
        "A signature gives no secrecy: anyone can read a signed message. Secrecy needs encryption.",
      ),
      t(
        "Dasturiy ta’minot yangilanishlari, Git commit’lari va hujjatlar imzolanadi — imzo noto‘g‘ri bo‘lsa, o‘rnatilmaydi.",
        "Software updates, Git commits and documents are signed — a bad signature means no install.",
      ),
    ],
    task: t("Savollarga javob bering.", "Answer the questions."),
    hint: t(
      "Imzo — haqiqiylik va yaxlitlik, maxfiylik emas.",
      "A signature is authenticity and integrity, not secrecy.",
    ),
    widget: {
      type: "quiz",
      questions: [
        {
          ask: t(
            "Raqamli imzo nimani bermaydi?",
            "What does a digital signature not give?",
          ),
          options: [
            t("Maxfiylik", "Secrecy"),
            t("Haqiqiylik", "Authenticity"),
            t("Yaxlitlik", "Integrity"),
          ],
          answer: 0,
          explain: t(
            "Imzolangan xabar ochiq qoladi.",
            "A signed message stays readable.",
          ),
        },
        {
          ask: t(
            "Imzolangan yangilanishda bitta bayt o‘zgartirildi. Nima bo‘ladi?",
            "One byte of a signed update was changed. What happens?",
          ),
          options: [
            t(
              "Imzo tekshiruvi muvaffaqiyatsiz bo‘ladi",
              "The signature check fails",
            ),
            t(
              "Hech narsa, imzo faqat nomni tekshiradi",
              "Nothing, it only checks the name",
            ),
            t("Yangilanish tezroq o‘rnatiladi", "The update installs faster"),
          ],
          answer: 0,
          explain: t(
            "Imzo xeshga qo‘yilgan; bir bayt xeshni butunlay o‘zgartiradi.",
            "The signature covers the hash; one byte changes the hash entirely.",
          ),
        },
      ],
    },
  },
  {
    id: 7,
    group: TRUST,
    title: t("Gibrid shifrlash", "Hybrid encryption"),
    minutes: 6,
    intro: t(
      "Amalda ochiq kalit va simmetrik shifr birga ishlaydi. Ochiq kalit (ECDH yoki RSA) bilan har bir seans uchun yangi AES kaliti kelishiladi, keyin barcha ma’lumot shu AES-GCM kaliti bilan shifrlanadi. TLS, Signal va PGP shunday ishlaydi.",
      "In practice public keys and symmetric ciphers work together. A public-key method (ECDH or RSA) agrees a fresh AES key for each session, and then all the data is encrypted with that AES-GCM key. TLS, Signal and PGP all work this way.",
    ),
    analogy: t(
      "Seyf kalitini qimmat, xavfsiz kuryer bilan yuborib, keyin oddiy yuk mashinalari bilan seyflarda yuk tashish.",
      "Sending the safe key once by an expensive, secure courier, then shipping goods in safes by ordinary lorries.",
    ),
    theory: [
      t(
        "Forward secrecy: har bir seans uchun yangi DH kaliti. Server kaliti keyin o‘g‘irlansa ham, eski yozilgan trafik ochilmaydi.",
        "Forward secrecy: a fresh DH key for each session. Even if the server’s key is stolen later, old recorded traffic stays closed.",
      ),
    ],
    task: t("Savollarga javob bering.", "Answer the questions."),
    hint: t(
      "Ochiq kalit — kalit kelishish uchun, AES — ma’lumot uchun.",
      "Public keys agree the key; AES carries the data.",
    ),
    widget: {
      type: "quiz",
      questions: [
        {
          ask: t(
            "Nega katta faylni to‘g‘ridan-to‘g‘ri RSA bilan shifrlamaymiz?",
            "Why not encrypt a large file directly with RSA?",
          ),
          options: [
            t(
              "RSA sekin va kichik bloklar uchun; ma’lumotni AES shifrlaydi",
              "RSA is slow and works on small blocks; AES encrypts the data",
            ),
            t(
              "RSA fayllarni shifrlay olmaydi",
              "RSA cannot encrypt files at all",
            ),
            t("RSA kalitini hamma biladi", "Everyone knows the RSA key"),
          ],
          answer: 0,
          explain: t(
            "Gibrid sxema ikkala dunyoning yaxshi tomonini oladi.",
            "A hybrid scheme takes the best of both.",
          ),
        },
        {
          ask: t(
            "Forward secrecy nimani kafolatlaydi?",
            "What does forward secrecy guarantee?",
          ),
          options: [
            t(
              "Server kaliti keyin o‘g‘irlansa ham eski seanslar ochilmaydi",
              "Old sessions stay closed even if the server key is stolen later",
            ),
            t("Parollar hech qachon eskirmaydi", "Passwords never expire"),
            t("Sertifikat abadiy amal qiladi", "The certificate lasts forever"),
          ],
          answer: 0,
          explain: t(
            "Har bir seans kaliti alohida va keyin o‘chiriladi.",
            "Each session key is separate and then discarded.",
          ),
        },
      ],
    },
  },
  {
    id: 8,
    group: TRUST,
    title: t("Yakuniy savollar", "Final questions"),
    minutes: 6,
    intro: t(
      "Modulni takrorlaymiz: ochiq va yopiq kalit, Diffie–Hellman, RSA, kalit uzunligi, o‘rtadagi odam va imzolar.",
      "A review of the module: public and private keys, Diffie–Hellman, RSA, key sizes, the man in the middle and signatures.",
    ),
    analogy: t(
      "Ochiq kalit — manzil, yopiq kalit — uy kaliti, imzo — muhr, sertifikat — muhr kimniki ekanini tasdiqlovchi hujjat.",
      "The public key is an address, the private key a house key, a signature a seal, and a certificate the paper saying whose seal it is.",
    ),
    theory: [
      t(
        "Matematika kuchli; muammolar odatda ochiq kalit kimniki ekanini tekshirmaslikdan kelib chiqadi.",
        "The maths is strong; problems usually come from not checking whose public key it is.",
      ),
    ],
    task: t(
      "Barcha savollarga to‘g‘ri javob bering.",
      "Answer every question correctly.",
    ),
    hint: t(
      "Har bir kalit qaysi amal uchun ekanini eslang.",
      "Remember which key each action uses.",
    ),
    widget: {
      type: "quiz",
      questions: [
        {
          ask: t(
            "Bobga maxfiy xat yuborish uchun qaysi kalit kerak?",
            "Which key do you need to send Bob a secret letter?",
          ),
          options: [
            t("Bobning ochiq kaliti", "Bob’s public key"),
            t("Bobning yopiq kaliti", "Bob’s private key"),
            t("Sizning yopiq kalitingiz", "Your private key"),
          ],
          answer: 0,
          explain: t(
            "Faqat Bobning yopiq kaliti uni ochadi.",
            "Only Bob’s private key opens it.",
          ),
        },
        {
          ask: t(
            "Diffie–Hellman’da Eve nimani ko‘radi?",
            "What does Eve see in Diffie–Hellman?",
          ),
          options: [
            t(
              "p, g, A va B — lekin umumiy kalitni emas",
              "p, g, A and B — but not the shared key",
            ),
            t("Alisa va Bobning maxfiy sonlarini", "Alice’s and Bob’s secrets"),
            t("Umumiy kalitni", "The shared key"),
          ],
          answer: 0,
          explain: t(
            "Katta p da A dan a ni topish amalda imkonsiz.",
            "With a large p, finding a from A is impossible in practice.",
          ),
        },
        {
          ask: t(
            "RSA’ning n sonini kim ko‘paytuvchilarga ajratsa, nima qila oladi?",
            "Whoever factors RSA’s n can do what?",
          ),
          options: [
            t("Yopiq kalitni hisoblaydi", "Compute the private key"),
            t("Faqat ochiq kalitni ko‘radi", "Only see the public key"),
            t("Hech narsa", "Nothing"),
          ],
          answer: 0,
          explain: t(
            "p va q dan φ, undan d topiladi.",
            "From p and q comes φ, and from φ comes d.",
          ),
        },
        {
          ask: t(
            "O‘rtadagi odam hujumini nima to‘xtatadi?",
            "What stops a man-in-the-middle attack?",
          ),
          options: [
            t(
              "Ochiq qiymatni ishonchli kalit bilan imzolash (sertifikat)",
              "Signing the public value with a trusted key (a certificate)",
            ),
            t("Uzunroq parol", "A longer password"),
            t("Kalitni ikki marta almashish", "Swapping keys twice"),
          ],
          answer: 0,
          explain: t(
            "Mallory ishonchli kalit bilan imzo yasay olmaydi.",
            "Mallory cannot make a signature with the trusted key.",
          ),
        },
      ],
    },
  },
];
