// Academy Intermediate · Cryptography, module 2: symmetric encryption. The
// lessons use a toy block cipher standing in for AES (./tools.ts): a picture
// encrypted in ECB, CBC and CTR, two messages under one nonce, and a payment
// whose sum is changed without the key.
import type { CommonWidget, Lesson, Text } from "../anim-lab/types";

export type Widget =
  CommonWidget | { type: "ecb" } | { type: "nonce" } | { type: "tamper" };

export const PROGRESS_KEY = "cybervalue:symmetric:progress:v1";

const t = (uz: string, en: string): Text => ({ uz, en });
const code = (s: string) => t(s, s);

const BASICS = t("Bitta kalit", "One key");
const MODES = t("Shifrlash rejimlari", "Modes of operation");
const KEYS = t("Kalitlarni boshqarish", "Looking after keys");

export const LESSONS: Lesson<Widget>[] = [
  {
    id: 1,
    group: BASICS,
    title: t("Bitta kalit, ikki tomon", "One key, both ways"),
    minutes: 6,
    intro: t(
      "Simmetrik shifrlashda bitta kalit ham shifrlaydi, ham ochadi. U tez ishlaydi, shuning uchun disklar, Wi-Fi, VPN va HTTPS ichidagi ma’lumotlar shu usulda shifrlanadi. Bugungi standart — AES va ChaCha20.",
      "In symmetric encryption one key both locks and unlocks. It is fast, so disks, Wi-Fi, VPNs and the data inside HTTPS are encrypted this way. Today’s standards are AES and ChaCha20.",
    ),
    analogy: t(
      "Uy kaliti: eshikni qulflagan kalit bilan ochasiz. Kalit nusxasi kimda bo‘lsa, u ham kiradi.",
      "A house key: the key that locks the door opens it. Whoever has a copy gets in too.",
    ),
    theory: [
      t(
        "Asosiy muammo — kalitni ikkinchi tomonga xavfsiz yetkazish. Buni ochiq kalitli kriptografiya hal qiladi (4-modul).",
        "The main problem is getting the key safely to the other side. Public-key cryptography solves that (module 4).",
      ),
      t(
        "Kodlash (Base64) va xesh (SHA-256) shifrlash emas: birinchisida kalit yo‘q, ikkinchisini ochib bo‘lmaydi.",
        "Encoding (Base64) and hashing (SHA-256) are not encryption: the first has no key, the second cannot be undone.",
      ),
    ],
    task: t(
      "Har birini ajrating: simmetrik shifrmi yoki boshqa narsami?",
      "Sort each one: is it a symmetric cipher or something else?",
    ),
    hint: t(
      "Bitta kalit bilan shifrlab, o‘sha kalit bilan ochiladigani — simmetrik.",
      "If one key encrypts and the same key decrypts, it is symmetric.",
    ),
    widget: {
      type: "sort",
      buckets: [
        { id: "sym", label: t("Simmetrik shifr", "Symmetric cipher") },
        { id: "other", label: t("Boshqa narsa", "Something else") },
      ],
      items: [
        { label: code("AES-256"), code: true, bucket: "sym" },
        { label: code("ChaCha20"), code: true, bucket: "sym" },
        { label: code("RSA"), code: true, bucket: "other" },
        { label: code("SHA-256"), code: true, bucket: "other" },
        { label: code("Base64"), code: true, bucket: "other" },
        { label: code("DES (56-bit)"), code: true, bucket: "sym" },
      ],
    },
  },
  {
    id: 2,
    group: BASICS,
    title: t("Blok shifr va kalit uzunligi", "Block ciphers and key length"),
    minutes: 6,
    intro: t(
      "AES — blok shifr: u ma’lumotni 128 bitli (16 baytli) bloklarga bo‘lib shifrlaydi. Kaliti 128, 192 yoki 256 bit. Eski DES ning 56 bitli kaliti 1998-yildayoq bir necha kunda topilgan.",
      "AES is a block cipher: it encrypts data in 128-bit (16-byte) blocks. Its key is 128, 192 or 256 bits. The old DES had a 56-bit key, found in a few days as early as 1998.",
    ),
    analogy: t(
      "Xatni bir xil o‘lchamdagi konvertlarga bo‘lib, har birini bitta qulf bilan yopish.",
      "Splitting a letter into envelopes of one size and sealing each with the same lock.",
    ),
    theory: [
      t(
        "Har bir qo‘shimcha bit kalitlar sonini ikki baravar oshiradi: 128 bit — 2¹²⁸ variant.",
        "Each extra bit doubles the number of keys: 128 bits means 2¹²⁸ choices.",
      ),
      t(
        "Bu labda AES o‘rnida 8 baytli o‘yinchoq shifr ishlatiladi — u rejimlarning xatti-harakatini xuddi AES kabi ko‘rsatadi, lekin himoya uchun emas.",
        "This lab uses a toy 8-byte cipher in place of AES — it shows how the modes behave just as AES would, but it is not for real protection.",
      ),
    ],
    task: t("Savollarga javob bering.", "Answer the questions."),
    hint: t("AES bloki — 16 bayt.", "An AES block is 16 bytes."),
    widget: {
      type: "quiz",
      questions: [
        {
          ask: t("AES blokining o‘lchami?", "The size of an AES block?"),
          options: [code("128 bit"), code("56 bit"), code("2048 bit")],
          answer: 0,
          explain: t(
            "Kalit uzunligi o‘zgaradi (128/192/256), blok esa doim 128 bit.",
            "The key length varies (128/192/256); the block is always 128 bits.",
          ),
        },
        {
          ask: t("Nega DES bugun ishlatilmaydi?", "Why is DES not used today?"),
          options: [
            t(
              "56 bitli kalitni tez sinab chiqish mumkin",
              "Its 56-bit key can be searched quickly",
            ),
            t("U juda sekin", "It is too slow"),
            t("U faqat raqamlarni shifrlaydi", "It encrypts digits only"),
          ],
          answer: 0,
          explain: t(
            "1998-yilda maxsus qurilma DES kalitini 56 soatda topgan.",
            "In 1998 a purpose-built machine found a DES key in 56 hours.",
          ),
        },
      ],
    },
  },
  {
    id: 3,
    group: MODES,
    title: t("ECB pingvini", "The ECB penguin"),
    minutes: 10,
    intro: t(
      "Blok shifr bitta blokni shifrlaydi. Uzun ma’lumot uchun rejim kerak. Eng oddiysi — ECB: har bir blok alohida, bir xil kalit bilan. Natijada bir xil bloklar bir xil shifrga aylanadi va rasmning shakli ko‘rinib qoladi.",
      "A block cipher encrypts one block. Longer data needs a mode. The simplest is ECB: each block on its own, with the same key. Identical blocks then give identical ciphertext, and a picture’s outline shows through.",
    ),
    analogy: t(
      "Har bir so‘zni lug‘atdan bir xil kod bilan almashtirish: “va” har doim “X7” bo‘lsa, matnning tuzilishi ko‘rinib turadi.",
      "Replacing each word with a fixed code from a book: if “and” is always “X7”, the text’s shape shows.",
    ),
    theory: [
      t(
        "CBC har bir blokni oldingi shifr bloki bilan aralashtiradi (boshida IV). CTR esa hisoblagichdan kalit oqimi yasaydi.",
        "CBC mixes each block with the previous ciphertext block (an IV at the start). CTR builds a keystream from a counter.",
      ),
      t(
        "Mashhur misol: ECB bilan shifrlangan Linux pingvini rasmi — uni hamon tanib olish mumkin.",
        "The famous example: a picture of the Linux penguin encrypted with ECB — still easy to recognise.",
      ),
    ],
    task: t(
      "Qulf rasmini ECB bilan shifrlang va shakl ko‘rinishini toping. Keyin shaklni yashiradigan rejimni tanlang.",
      "Encrypt the padlock picture with ECB and see the outline. Then choose a mode that hides it.",
    ),
    hint: t(
      "CBC yoki CTR — takrorlangan bloklar yo‘qoladi.",
      "CBC or CTR — the repeated blocks disappear.",
    ),
    widget: { type: "ecb" },
  },
  {
    id: 4,
    group: MODES,
    title: t("Bir nonce — bir xabar", "One nonce, one message"),
    minutes: 10,
    intro: t(
      "CTR (va GCM) rejimida shifr — ochiq matn XOR kalit oqimi. Kalit oqimi kalit va nonce’dan yasaladi. Ikki xabar bir xil kalit va bir xil nonce bilan shifrlansa, kalit oqimi takrorlanadi: bir xabarni bilgan odam ikkinchisini ham o‘qiydi.",
      "In CTR (and GCM) the ciphertext is the plain text XOR a keystream, built from the key and a nonce. Encrypt two messages with the same key and nonce and the keystream repeats: whoever knows one message reads the other.",
    ),
    analogy: t(
      "One-time pad varag‘ini ikki marta ishlatish — 1-moduldagi xatoning zamonaviy shakli.",
      "Using a one-time pad page twice — the modern form of module 1’s mistake.",
    ),
    theory: [
      t(
        "Nonce — “bir marta ishlatiladigan son”. U maxfiy emas, lekin bitta kalit bilan hech qachon takrorlanmasligi kerak.",
        "A nonce is a “number used once”. It is not secret, but it must never repeat under one key.",
      ),
      t(
        "Odatda nonce tasodifiy yoki hisoblagich bo‘ladi va shifr matni bilan birga yuboriladi.",
        "It is usually random or a counter, and is sent along with the ciphertext.",
      ),
    ],
    task: t(
      "Ikkala xabar bir nonce bilan shifrlanganda ikkinchisi qanday tiklanishini ko‘ring. Keyin har bir xabarga yangi nonce bering.",
      "See how the second message is recovered when both use one nonce. Then give each message a fresh nonce.",
    ),
    hint: t(
      "“Har bir xabarga yangi nonce” ni yoqing.",
      "Switch on “A fresh nonce for each message”.",
    ),
    widget: { type: "nonce" },
  },
  {
    id: 5,
    group: MODES,
    title: t("Shifr — imzo emas", "Encryption is not a seal"),
    minutes: 10,
    intro: t(
      "Shifrlash ma’lumotni yashiradi, lekin o‘zgartirilmaganini kafolatlamaydi. CTR’da shifr matnidagi bitni almashtirsangiz, ochiq matndagi xuddi o‘sha bit almashadi. Hujumchi kalitni bilmasdan ham to‘lov summasini o‘zgartira oladi.",
      "Encryption hides data but does not prove it was not changed. In CTR, flip a bit of the ciphertext and the same bit of the plain text flips. An attacker can change a payment’s sum without knowing the key.",
    ),
    analogy: t(
      "Shaffof bo‘lmagan konvert: ichini ko‘rmaysiz, lekin kimdir uni ochmasdan ichidagi raqamni sezdirmay o‘zgartira oladi — agar muhr bo‘lmasa.",
      "An opaque envelope: you cannot see inside, but someone can change the number in it without opening it — unless there is a seal.",
    ),
    theory: [
      t(
        "AEAD rejimlari (AES-GCM, ChaCha20-Poly1305) shifr bilan birga autentifikatsiya tegi hisoblaydi. Bir bit o‘zgarsa, teg mos kelmaydi va xabar rad etiladi.",
        "AEAD modes (AES-GCM, ChaCha20-Poly1305) compute an authentication tag along with the ciphertext. Change one bit and the tag fails, so the message is refused.",
      ),
      t(
        "Bugun yangi tizimlarda faqat AEAD ishlatiladi: shifrlash va yaxlitlik birga.",
        "New systems today use AEAD only: encryption and integrity together.",
      ),
    ],
    task: t(
      "Hujumchi summani o‘zgartirganini ko‘ring. Keyin autentifikatsiya tegini (GCM) yoqing — soxta xabar rad etilsin.",
      "See the attacker change the sum. Then switch on the authentication tag (GCM) so the forged message is refused.",
    ),
    hint: t(
      "AEAD — shifr va teg birga.",
      "AEAD is the cipher and the tag together.",
    ),
    widget: { type: "tamper" },
  },
  {
    id: 6,
    group: KEYS,
    title: t("Kalit qayerda turadi", "Where the key lives"),
    minutes: 6,
    intro: t(
      "Eng kuchli shifr ham kalit sizib chiqsa, hech narsani himoya qilmaydi. Kalit tasodifiy yaratiladi, alohida saqlanadi va muntazam almashtiriladi.",
      "The strongest cipher protects nothing once the key leaks. Keys are made at random, kept apart from the data and rotated regularly.",
    ),
    analogy: t(
      "Seyf kalitini seyf ustiga qo‘yish — seyfni umuman qulflamaslik bilan teng.",
      "Leaving the safe key on top of the safe is the same as not locking it.",
    ),
    theory: [
      t(
        "Paroldan kalit yasash kerak bo‘lsa, PBKDF2, scrypt yoki Argon2 kabi sekin funksiyalardan foydalaning.",
        "When a key must come from a password, use a slow function such as PBKDF2, scrypt or Argon2.",
      ),
      t(
        "Katta tizimlarda kalitlar KMS yoki HSM’da saqlanadi: dastur kalitni ko‘rmaydi, faqat “shifrla/och” deb so‘raydi.",
        "Large systems keep keys in a KMS or HSM: the program never sees the key, it only asks to encrypt or decrypt.",
      ),
    ],
    task: t(
      "Har bir amalni ajrating: to‘g‘rimi yoki xavflimi?",
      "Sort each practice: sound or risky?",
    ),
    hint: t(
      "Kalit ma’lumot yonida yoki kod ichida turmasligi kerak.",
      "The key must not sit next to the data or inside the code.",
    ),
    widget: {
      type: "sort",
      buckets: [
        { id: "ok", label: t("To‘g‘ri", "Sound") },
        { id: "risk", label: t("Xavfli", "Risky") },
      ],
      items: [
        {
          label: t(
            "Kalit kriptografik tasodifiy generator bilan yaratilgan",
            "The key comes from a cryptographic random generator",
          ),
          bucket: "ok",
        },
        {
          label: t(
            "Kalit dastur kodida yozilgan",
            "The key is written in the program’s code",
          ),
          bucket: "risk",
        },
        {
          label: t(
            "Kalit KMS’da, ma’lumotlar bazadan alohida",
            "The key is in a KMS, apart from the database",
          ),
          bucket: "ok",
        },
        {
          label: t(
            "Shifrlangan zaxira va kalit bitta arxivda",
            "The encrypted backup and its key are in one archive",
          ),
          bucket: "risk",
        },
        {
          label: t(
            "Kalit har yili almashtiriladi",
            "The key is rotated every year",
          ),
          bucket: "ok",
        },
        {
          label: t(
            "Kalit sifatida “admin123” paroli ishlatilgan",
            "The password “admin123” is used as the key",
          ),
          bucket: "risk",
        },
      ],
    },
  },
  {
    id: 7,
    group: KEYS,
    title: t("To‘g‘ri tanlov", "Choosing right"),
    minutes: 6,
    intro: t(
      "Amalda siz shifr yozmaysiz — kutubxonadan to‘g‘ri funksiyani tanlaysiz. Xato tanlov ham shifrni zaiflashtiradi.",
      "In practice you do not write a cipher — you pick the right function from a library. A wrong pick weakens it too.",
    ),
    analogy: t(
      "Yaxshi qulf sotib olish yetmaydi — uni eshikka to‘g‘ri o‘rnatish kerak.",
      "Buying a good lock is not enough — it has to be fitted to the door properly.",
    ),
    theory: [
      t(
        "Standart tanlov: AES-256-GCM yoki ChaCha20-Poly1305, har bir xabarga yangi nonce.",
        "The standard choice: AES-256-GCM or ChaCha20-Poly1305, with a fresh nonce for each message.",
      ),
    ],
    task: t("Savollarga javob bering.", "Answer the questions."),
    hint: t(
      "AEAD, yangi nonce, alohida saqlangan kalit.",
      "AEAD, a fresh nonce, a key kept apart.",
    ),
    widget: {
      type: "quiz",
      questions: [
        {
          ask: t(
            "Yangi tizim uchun qaysi tanlov to‘g‘ri?",
            "Which choice is right for a new system?",
          ),
          options: [code("AES-256-GCM"), code("AES-256-ECB"), code("DES-CBC")],
          answer: 0,
          explain: t(
            "GCM — AEAD: shifrlaydi va o‘zgartirishni aniqlaydi.",
            "GCM is AEAD: it encrypts and detects changes.",
          ),
        },
        {
          ask: t(
            "Paroldan shifrlash kaliti qanday yasaladi?",
            "How is an encryption key made from a password?",
          ),
          options: [
            t(
              "Argon2 yoki PBKDF2 bilan, tuz qo‘shib",
              "With Argon2 or PBKDF2, salted",
            ),
            t(
              "Parolning o‘zini kalit qilib",
              "Using the password itself as the key",
            ),
            t("Parolni Base64 bilan kodlab", "Encoding the password in Base64"),
          ],
          answer: 0,
          explain: t(
            "Sekin funksiya parolni taxmin qilishni qimmatlashtiradi.",
            "A slow function makes guessing the password expensive.",
          ),
        },
      ],
    },
  },
  {
    id: 8,
    group: KEYS,
    title: t("Yakuniy savollar", "Final questions"),
    minutes: 6,
    intro: t(
      "Modulni takrorlaymiz: bitta kalit, blok va kalit o‘lchami, ECB’ning zaifligi, nonce’ni qayta ishlatmaslik, AEAD va kalitlarni saqlash.",
      "A review of the module: one key, block and key size, ECB’s weakness, never reusing a nonce, AEAD and keeping keys.",
    ),
    analogy: t(
      "Yaxshi shifr — mustahkam qulf, to‘g‘ri rejim — to‘g‘ri o‘rnatish, kalitni saqlash — kalitni cho‘ntakda emas, seyfda tutish.",
      "A good cipher is a strong lock, the right mode is fitting it properly, and key care is keeping the key in a safe, not a pocket.",
    ),
    theory: [
      t(
        "AES’ning o‘zi buzilmagan — muammolar deyarli har doim rejim, nonce yoki kalitni noto‘g‘ri ishlatishdan.",
        "AES itself is unbroken — the trouble almost always comes from misusing the mode, the nonce or the key.",
      ),
    ],
    task: t(
      "Barcha savollarga to‘g‘ri javob bering.",
      "Answer every question correctly.",
    ),
    hint: t(
      "Har bir xato qaysi rejim yoki qoidaga tegishli ekanini eslang.",
      "Remember which mode or rule each mistake belongs to.",
    ),
    widget: {
      type: "quiz",
      questions: [
        {
          ask: t(
            "ECB bilan shifrlangan rasmda shakl nega ko‘rinadi?",
            "Why does a picture encrypted with ECB still show its outline?",
          ),
          options: [
            t(
              "Bir xil bloklar bir xil shifrga aylanadi",
              "Identical blocks give identical ciphertext",
            ),
            t("ECB rasmni shifrlamaydi", "ECB does not encrypt pictures"),
            t("Kalit juda qisqa", "The key is too short"),
          ],
          answer: 0,
          explain: t(
            "Takrorlanish naqshni saqlab qoladi.",
            "The repetition keeps the pattern.",
          ),
        },
        {
          ask: t(
            "Ikki xabar bir kalit va bir nonce bilan CTR’da shifrlandi. Nima bo‘ladi?",
            "Two messages were encrypted in CTR with one key and one nonce. What happens?",
          ),
          options: [
            t(
              "Birini bilgan odam ikkinchisini o‘qiy oladi",
              "Whoever knows one can read the other",
            ),
            t(
              "Hech narsa, nonce maxfiy emas",
              "Nothing, the nonce is not secret",
            ),
            t("Ikkalasi ham ochilmay qoladi", "Neither can be decrypted"),
          ],
          answer: 0,
          explain: t(
            "Kalit oqimi takrorlanadi va XOR uni yo‘qotadi.",
            "The keystream repeats and XOR cancels it.",
          ),
        },
        {
          ask: t(
            "Shifr matnidagi summani o‘zgartirishni nima aniqlaydi?",
            "What detects a changed sum in the ciphertext?",
          ),
          options: [
            t("Autentifikatsiya tegi (AEAD)", "An authentication tag (AEAD)"),
            t("Uzunroq kalit", "A longer key"),
            t("Shifrni ikki marta qo‘llash", "Encrypting twice"),
          ],
          answer: 0,
          explain: t(
            "Teg bitta bit o‘zgarsa ham mos kelmay qoladi.",
            "The tag stops matching when even one bit changes.",
          ),
        },
        {
          ask: t(
            "Shifrlangan zaxira bilan birga qaysi narsa saqlanmasligi kerak?",
            "What must not be stored together with an encrypted backup?",
          ),
          options: [
            t("Uning kaliti", "Its key"),
            t("Uning nonce’i", "Its nonce"),
            t("Uning sanasi", "Its date"),
          ],
          answer: 0,
          explain: t(
            "Nonce ochiq bo‘lishi mumkin; kalit esa alohida saqlanadi.",
            "The nonce may be public; the key is kept apart.",
          ),
        },
      ],
    },
  },
];
