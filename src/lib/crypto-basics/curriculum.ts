// Academy · Cryptography basics: encoding, hashing and encryption told
// apart, with the lab's own widgets (bytes, Base64, hashing, salt, a
// dictionary attack, XOR, key space and a toy signature) next to the shared
// sort and quiz widgets (../anim-lab/types).
import {
  restoreLessons,
  type CommonWidget,
  type Lesson,
  type Text,
} from "../anim-lab/types";

export type Widget =
  | CommonWidget
  | { type: "bytes" }
  | { type: "base64" }
  | { type: "avalanche" }
  | { type: "integrity" }
  | { type: "salt" }
  | { type: "crack" }
  | { type: "xor" }
  | { type: "keyspace" }
  | { type: "signature" };

const t = (uz: string, en: string): Text => ({ uz, en });

const ENCODING = t("Kodlash", "Encoding");
const HASHING = t("Hash", "Hashing");
const ENCRYPTION = t("Shifrlash va imzo", "Encryption and signatures");

export const LESSONS: Lesson<Widget>[] = [
  {
    id: 1,
    group: ENCODING,
    title: t("Matn — bu raqamlar", "Text is numbers"),
    minutes: 5,
    intro: t(
      "Kompyuter harflarni bilmaydi — faqat baytlarni (0 dan 255 gacha sonlar). Har bir belgi bir yoki bir nechta baytga aylantiriladi. Bu qoidani UTF-8 deyiladi.",
      "Computers do not know letters — only bytes (numbers from 0 to 255). Every character becomes one or more bytes. The rule for this is called UTF-8.",
    ),
    analogy: t(
      "Morze alifbosi kabi: harf o‘rniga belgilangan nuqta va chiziqlar. Qoidani bilgan har kim uni qaytadan o‘qiydi — hech qanday sir yo‘q.",
      "Like Morse code: dots and dashes stand for letters. Anyone who knows the rule reads it back — there is no secret.",
    ),
    theory: [
      t(
        "Lotin harflari, raqamlar va oddiy belgilar bittadan bayt oladi: “A” = 65 = 0x41 = 01000001. Bir bayt — 8 bit.",
        "Latin letters, digits and plain punctuation take one byte each: “A” = 65 = 0x41 = 01000001. One byte is 8 bits.",
      ),
      t(
        "O‘zbek tilidagi “‘” belgisi, kirill harflari va emoji bir nechta bayt oladi. Shuning uchun “o‘” ikki belgi bo‘lsa ham, to‘rt bayt bo‘ladi.",
        "The Uzbek “‘” mark, Cyrillic letters and emoji take several bytes. That is why “o‘” is two characters but four bytes.",
      ),
      t(
        "Hex (o‘n oltilik) — baytlarni qisqa yozish usuli: har bir bayt ikki belgi, 00 dan ff gacha. Kriptografiyada natijalar odatda hex bilan ko‘rsatiladi.",
        "Hex (base 16) is a short way to write bytes: two characters per byte, 00 to ff. Cryptography usually shows its results in hex.",
      ),
    ],
    task: t(
      "So‘z yozib, uning baytlarini ko‘ring. So‘ng “‘” belgisi UTF-8 da necha bayt olishini toping.",
      "Type a word and look at its bytes. Then find how many bytes the “‘” mark takes in UTF-8.",
    ),
    hint: t(
      "Maydonga “o‘” deb yozing va “‘” belgisi ostidagi baytlarni sanang.",
      "Type “o‘” in the box and count the bytes under the “‘” mark.",
    ),
    widget: { type: "bytes" },
  },
  {
    id: 2,
    group: ENCODING,
    title: t("Base64: kalitsiz qulf yo‘q", "Base64: no key, no lock"),
    minutes: 7,
    intro: t(
      "Base64 baytlarni faqat harf, raqam va “+ / =” belgilari bilan yozadi. U email ilovalari, rasmlarni matn ichida berish va tokenlarda ishlatiladi. Lekin u hech narsani yashirmaydi.",
      "Base64 writes bytes using only letters, digits and “+ / =”. It carries email attachments, images inside text and tokens. But it hides nothing.",
    ),
    analogy: t(
      "Xatni boshqa alifboga ko‘chirib yozish kabi: o‘qish biroz noqulay, lekin alifboni bilgan har kim o‘qiydi.",
      "Like copying a letter into another alphabet: a little awkward to read, but anyone who knows the alphabet can.",
    ),
    theory: [
      t(
        "Har 3 bayt 4 ta Base64 belgisiga aylanadi. Oxiridagi “=” — to‘ldiruvchi: baytlar soni 3 ga bo‘linmaganda qo‘shiladi.",
        "Every 3 bytes become 4 Base64 characters. A trailing “=” is padding, added when the byte count is not a multiple of 3.",
      ),
      t(
        "Kodlashda kalit yo‘q. Shuning uchun brauzerdagi Base64 cookie’ni har kim ochadi, o‘zgartiradi va qaytadan kodlaydi. Server bunday qiymatga ishonmasligi kerak.",
        "Encoding has no key. So anyone can open a Base64 cookie in the browser, change it and encode it again. A server must not trust such a value.",
      ),
    ],
    task: t(
      "Saytning cookie qiymatini oching, so‘ng “admin=true” ni Base64 qilib, soxta cookie yasang.",
      "Open the site’s cookie value, then encode “admin=true” in Base64 to forge a cookie.",
    ),
    hint: t(
      "Avval cookie qiymatini “Ochish” maydoniga qo‘ying. Keyin “Kodlash” maydoniga admin=true yozib, natijani soxta cookie maydoniga ko‘chiring.",
      "First paste the cookie value into “Decode”. Then type admin=true into “Encode” and copy the result into the forged cookie box.",
    ),
    widget: { type: "base64" },
  },
  {
    id: 3,
    group: ENCODING,
    title: t("Kodlash, hash yoki shifr?", "Encoding, hash or cipher?"),
    minutes: 5,
    intro: t(
      "Uchta tushuncha ko‘p chalkashtiriladi. Farqi bitta savolda: uni qaytadan ochish mumkinmi va buning uchun kalit kerakmi?",
      "Three ideas get mixed up all the time. The difference is one question: can it be turned back, and does that need a key?",
    ),
    analogy: t(
      "Kodlash — tarjima (lug‘at hammada bor). Hash — barmoq izi (izdan odamni qayta yasab bo‘lmaydi). Shifrlash — seyf (faqat kalit egasi ochadi).",
      "Encoding is a translation (everyone has the dictionary). A hash is a fingerprint (you cannot rebuild a person from it). Encryption is a safe (only the key holder opens it).",
    ),
    theory: [
      t(
        "Kodlash: kalitsiz, har kim ochadi — Base64, hex, URL kodlash. Hash: umuman ochilmaydi, uzunligi doim bir xil — SHA-256, bcrypt. Shifrlash: faqat kalit bilan ochiladi — AES, RSA.",
        "Encoding: no key, anyone reverses it — Base64, hex, URL encoding. Hashing: never reversed, always the same length — SHA-256, bcrypt. Encryption: reversed only with the key — AES, RSA.",
      ),
    ],
    task: t(
      "Har bir qiymatni to‘g‘ri guruhga joylang.",
      "Put every value into the right group.",
    ),
    hint: t(
      "64 ta hex belgi — SHA-256. “$2b$” bilan boshlansa — bcrypt. “U2FsdGVkX1” — OpenSSL shifri.",
      "64 hex characters is SHA-256. “$2b$” at the start is bcrypt. “U2FsdGVkX1” is an OpenSSL cipher.",
    ),
    widget: {
      type: "sort",
      buckets: [
        { id: "encoding", label: t("Kodlash", "Encoding") },
        { id: "hash", label: t("Hash", "Hash") },
        { id: "cipher", label: t("Shifr", "Cipher") },
      ],
      items: [
        { label: t("c2Fsb20=", "c2Fsb20="), code: true, bucket: "encoding" },
        {
          label: t("73616c6f6d", "73616c6f6d"),
          code: true,
          bucket: "encoding",
        },
        {
          label: t("salom%20dunyo", "salom%20dunyo"),
          code: true,
          bucket: "encoding",
        },
        {
          label: t(
            "038f270ca678c66f5bf393f958e8eebcf98b049e5a0d32a69cabf46b576cabbf",
            "038f270ca678c66f5bf393f958e8eebcf98b049e5a0d32a69cabf46b576cabbf",
          ),
          code: true,
          bucket: "hash",
        },
        {
          label: t(
            "$2b$12$KIX1Jx3h0J0v8u5Q5QJx9e…",
            "$2b$12$KIX1Jx3h0J0v8u5Q5QJx9e…",
          ),
          code: true,
          bucket: "hash",
        },
        {
          label: t("U2FsdGVkX1+q8N3vR2ZkT0lQ…", "U2FsdGVkX1+q8N3vR2ZkT0lQ…"),
          code: true,
          bucket: "cipher",
        },
        {
          label: t(
            "Kalit bilan ochiladigan disk (BitLocker)",
            "A disk opened with a key (BitLocker)",
          ),
          bucket: "cipher",
        },
        {
          label: t(
            "Parolning “barmoq izi” bazada",
            "A password’s “fingerprint” in a database",
          ),
          bucket: "hash",
        },
      ],
    },
  },
  {
    id: 4,
    group: HASHING,
    title: t("Hash — raqamli barmoq izi", "A hash is a digital fingerprint"),
    minutes: 6,
    intro: t(
      "Hash funksiyasi istalgan uzunlikdagi matndan qisqa, doim bir xil uzunlikdagi “barmoq izi” yasaydi. SHA-256 natijasi har doim 256 bit — 64 ta hex belgi.",
      "A hash function turns text of any length into a short fingerprint of fixed length. A SHA-256 result is always 256 bits — 64 hex characters.",
    ),
    analogy: t(
      "Go‘sht maydalagich: go‘shtdan qiyma bo‘ladi, qiymadan go‘sht qaytmaydi. Bir xil go‘sht doim bir xil qiyma beradi.",
      "A meat grinder: meat becomes mince, mince never becomes meat again. The same meat always gives the same mince.",
    ),
    theory: [
      t(
        "Bir xil kirish — doim bir xil natija. Lekin bitta harf o‘zgarsa, natijaning taxminan yarmi (128 bitga yaqini) o‘zgaradi. Buni ko‘chki effekti deyiladi.",
        "The same input always gives the same result. But change one letter and about half the result (around 128 bits) changes. This is the avalanche effect.",
      ),
      t(
        "Hashdan asl matnni hisoblab bo‘lmaydi va bir xil hashli ikki xil matnni topish amalda imkonsiz. Shuning uchun hash yaxlitlikni tekshirish va parol saqlash uchun ishlatiladi.",
        "You cannot compute the text back from a hash, and finding two texts with the same hash is practically impossible. That is why hashes check integrity and store passwords.",
      ),
    ],
    task: t(
      "Ikkinchi maydondagi matnni birinchisidan faqat bitta belgi bilan farq qiladigan qiling va hashlar qancha farq qilishini ko‘ring.",
      "Make the second text differ from the first by exactly one character and see how much the hashes differ.",
    ),
    hint: t(
      "Masalan, “salom” va “Salom”: bitta harf katta.",
      "For example “salom” and “Salom”: one capital letter.",
    ),
    widget: { type: "avalanche" },
  },
  {
    id: 5,
    group: HASHING,
    title: t("Fayl o‘zgarmaganmi?", "Has the file been changed?"),
    minutes: 5,
    intro: t(
      "Dastur yaratuvchilari rasmiy saytda fayl bilan birga uning SHA-256 hashini e’lon qiladi. Faylni qayerdan yuklasangiz ham, uning hashini hisoblab, e’lon qilingani bilan solishtirasiz.",
      "Software makers publish a file’s SHA-256 hash next to the file on their official site. Wherever you download the file, you hash it and compare with the published value.",
    ),
    analogy: t(
      "Posilka ustidagi muhr: muhr butun bo‘lsa — ichini hech kim ochmagan.",
      "A seal on a parcel: if the seal is intact, nobody has opened it.",
    ),
    theory: [
      t(
        "Bitta bayt, hatto ko‘rinmaydigan bo‘sh joy ham hashni butunlay o‘zgartiradi. Shuning uchun hash teng bo‘lsa, fayl bayt-bayt bir xil.",
        "A single byte, even an invisible space, changes the hash completely. So if the hashes match, the files match byte for byte.",
      ),
      t(
        "Terminalda: Linux’da “sha256sum fayl”, Windows’da “certutil -hashfile fayl SHA256”. Hashni faqat rasmiy saytdan oling — yuklab olingan sahifadagi hash ham soxta bo‘lishi mumkin.",
        "In a terminal: “sha256sum file” on Linux, “certutil -hashfile file SHA256” on Windows. Take the hash only from the official site — one on the download page could be forged too.",
      ),
    ],
    task: t(
      "Uchta oynadan yuklangan fayllardan qaysi biri rasmiy nashr bilan bayt-bayt bir xil ekanini toping.",
      "Find which of the three mirror downloads is byte-for-byte the official release.",
    ),
    hint: t(
      "Har bir fayl hashining boshidagi va oxiridagi belgilarni rasmiy hash bilan solishtiring.",
      "Compare the first and last characters of each hash with the official one.",
    ),
    widget: { type: "integrity" },
  },
  {
    id: 6,
    group: HASHING,
    title: t(
      "Tuz: bir xil parol, har xil hash",
      "Salt: same password, different hash",
    ),
    minutes: 7,
    intro: t(
      "Sayt parollarni ochiq saqlamaydi — ularning hashini saqlaydi. Lekin oddiy hashda bir xil parollar bir xil hash beradi va bu sizib chiqqan bazada darhol ko‘rinadi.",
      "Sites do not store passwords — they store their hashes. But with a plain hash, equal passwords give equal hashes, and that shows at once in a leaked database.",
    ),
    analogy: t(
      "Bir xil kalitli eshiklar: bittasining kalitini topgan o‘g‘ri hammasini ochadi. Tuz — har bir eshikka o‘z qulfini qo‘yish.",
      "Doors sharing one key: a thief who finds one key opens them all. Salt gives every door its own lock.",
    ),
    theory: [
      t(
        "Tuz (salt) — har bir foydalanuvchiga beriladigan tasodifiy qiymat. Server hash(tuz + parol) ni saqlaydi, tuzni esa yonida ochiq saqlaydi.",
        "A salt is a random value given to each user. The server stores hash(salt + password), with the salt kept openly beside it.",
      ),
      t(
        "Tuz bilan bir xil parollar har xil hash beradi, oldindan hisoblangan jadvallar (rainbow tables) ishlamaydi va hujumchi har bir foydalanuvchi uchun alohida taxmin qilishga majbur.",
        "With salt, equal passwords give different hashes, precomputed tables (rainbow tables) stop working, and an attacker must guess for every user separately.",
      ),
    ],
    task: t(
      "Sizib chiqqan jadvalda qaysi ikki foydalanuvchining paroli bir xil ekanini toping, so‘ng tuz qo‘shilganda nima bo‘lishini ko‘ring.",
      "Find the two users in the leaked table who share a password, then see what changes with salt.",
    ),
    hint: t(
      "Bir xil boshlanadigan ikki hashni qidiring.",
      "Look for two hashes that start the same way.",
    ),
    widget: { type: "salt" },
  },
  {
    id: 7,
    group: HASHING,
    title: t("Lug‘at hujumi", "A dictionary attack"),
    minutes: 6,
    intro: t(
      "Hashni ochib bo‘lmaydi, lekin taxmin qilsa bo‘ladi: mashhur parollarni birma-bir hashlab, natijani sizib chiqqan hash bilan solishtirish. Bu lug‘at hujumi.",
      "A hash cannot be reversed, but it can be guessed: hash popular passwords one by one and compare with the leaked hash. That is a dictionary attack.",
    ),
    analogy: t(
      "Qulfga kalit dastasini birma-bir sinash: dastada to‘g‘ri kalit bo‘lsa, qulf albatta ochiladi.",
      "Trying a bunch of keys on a lock one by one: if the right key is on the ring, the lock will open.",
    ),
    theory: [
      t(
        "SHA-256 juda tez: oddiy videokarta soniyasiga milliardlab taxminni sinaydi. Sizib chiqqan parollarning mashhur ro‘yxatlarida o‘n millionlab parol bor — ular bir soniyada tekshiriladi.",
        "SHA-256 is very fast: an ordinary graphics card tries billions of guesses a second. Well-known lists of leaked passwords hold tens of millions — checked in a second.",
      ),
      t(
        "Shuning uchun parollar uchun ataylab sekin algoritmlar ishlatiladi: bcrypt, scrypt, Argon2. Ular bilan bitta taxmin millisekundlar oladi va hujum yillarga cho‘ziladi. Lekin ro‘yxatdagi zaif parolni ular ham qutqarmaydi.",
        "That is why passwords use deliberately slow algorithms: bcrypt, scrypt, Argon2. With them one guess takes milliseconds and the attack stretches into years. But even they cannot save a weak password that is on the list.",
      ),
    ],
    task: t(
      "Hujumni ishga tushiring, sizib chiqqan hashga mos parolni toping va uni yozing.",
      "Run the attack, find the password behind the leaked hash and type it in.",
    ),
    hint: t(
      "“Hujumni boshlash” tugmasini bosing va yashil qatorni kuting.",
      "Press “Start the attack” and wait for the green row.",
    ),
    widget: { type: "crack" },
  },
  {
    id: 8,
    group: ENCRYPTION,
    title: t("XOR: shifrlashning g‘ishti", "XOR: a building block of ciphers"),
    minutes: 6,
    intro: t(
      "XOR (istisnoli yoki) — ikki bitni solishtiradi: bir xil bo‘lsa 0, har xil bo‘lsa 1. Ko‘p shifrlar, jumladan AES, ichida XOR ishlatadi.",
      "XOR (exclusive or) compares two bits: 0 when they match, 1 when they differ. Many ciphers, AES among them, use XOR inside.",
    ),
    analogy: t(
      "Chiroq tugmasi: kalit biti 1 bo‘lsa — holatni almashtiradi, 0 bo‘lsa — tegmaydi. Ikki marta bossangiz, avvalgi holatga qaytadi.",
      "A light switch: a key bit of 1 flips the state, 0 leaves it. Press twice and you are back where you started.",
    ),
    theory: [
      t(
        "Matn XOR kalit = shifr. Shifr XOR shu kalit = asl matn. Bir xil kalit ham shifrlaydi, ham ochadi — bu simmetrik shifrlash.",
        "Text XOR key = cipher. Cipher XOR the same key = the text again. One key both locks and unlocks — that is symmetric encryption.",
      ),
      t(
        "Bir baytli kalitda atigi 256 variant bor — kompyuter ularni bir zumda sinaydi. Haqiqiy shifrlar 128 yoki 256 bitli kalit ishlatadi.",
        "A one-byte key has only 256 options — a computer tries them in an instant. Real ciphers use 128- or 256-bit keys.",
      ),
    ],
    task: t(
      "Kalit bitlarini 00101010 (0x2a) qilib qo‘ying va shifrlangan bayt qaysi harfga ochilishini ko‘ring.",
      "Set the key bits to 00101010 (0x2a) and see which letter the encrypted byte opens to.",
    ),
    hint: t(
      "Bitlarni chapdan sanang: 3-, 5- va 7-bitlar 1 bo‘lishi kerak.",
      "Count bits from the left: the 3rd, 5th and 7th must be 1.",
    ),
    widget: { type: "xor" },
  },
  {
    id: 9,
    group: ENCRYPTION,
    title: t("Kalit qancha uzun bo‘lishi kerak?", "How long must a key be?"),
    minutes: 5,
    intro: t(
      "Yaxshi shifrni faqat bitta yo‘l bilan buzish mumkin: barcha kalitlarni sinab chiqish (brute force). Har bir qo‘shimcha bit kalitlar sonini ikki baravar oshiradi.",
      "A good cipher can only be broken one way: by trying every key (brute force). Every extra bit doubles the number of keys.",
    ),
    analogy: t(
      "Kodli qulf: 3 xonali kodni bir kechada topasiz, 30 xonalisini esa butun umr ham yetmaydi.",
      "A combination lock: a 3-digit code falls in an evening, a 30-digit one would outlast your life.",
    ),
    theory: [
      t(
        "n bitli kalitda 2^n ta variant bor. 40 bit — bir zumda, 56 bit (eski DES) — bir necha kunda buzilgan. 128 bit — hozirgi hisoblash quvvati bilan amalda imkonsiz.",
        "An n-bit key has 2^n options. 40 bits falls instantly; 56 bits (old DES) was broken in days. 128 bits is practically impossible with today’s computing.",
      ),
      t(
        "Shuning uchun AES-128 va AES-256 xavfsiz hisoblanadi: zaiflik odatda kalit uzunligida emas, kalit qanday saqlangani va parol qanchalik kuchli ekanida bo‘ladi.",
        "That is why AES-128 and AES-256 count as safe: the weak spot is usually not key length but how the key is stored and how strong the password is.",
      ),
    ],
    task: t(
      "Soniyasiga trillion kalitni sinaydigan hujumchi uchun 1 million yil ham yetmaydigan eng qisqa kalit uzunligini toping.",
      "Find the shortest key length that a trillion-keys-a-second attacker could not search in a million years.",
    ),
    hint: t(
      "Slayderni suring: vaqt 1 million yildan oshgan birinchi bit soni — javob.",
      "Move the slider: the first bit count where the time passes a million years is the answer.",
    ),
    widget: { type: "keyspace" },
  },
  {
    id: 10,
    group: ENCRYPTION,
    title: t("Raqamli imzo", "Digital signatures"),
    minutes: 7,
    intro: t(
      "Raqamli imzo ikki narsani isbotlaydi: xabarni kim yuborgani va u yo‘lda o‘zgarmagani. U yopiq kalit bilan qo‘yiladi va ochiq kalit bilan tekshiriladi.",
      "A digital signature proves two things: who sent a message and that it did not change on the way. It is made with the private key and checked with the public key.",
    ),
    analogy: t(
      "Muhr va imzo: muhrni faqat egasi bosadi, lekin uni hamma namunaga solishtirib tekshiradi. Hujjatdagi bitta raqam o‘zgarsa, imzo mos kelmay qoladi.",
      "A stamp and a signature: only the owner can stamp, but anyone can check it against the sample. Change one figure in the document and the signature no longer fits.",
    ),
    theory: [
      t(
        "Imzolash: xabarning hashi olinadi va yopiq kalit bilan “qulflanadi”. Tekshirish: imzo ochiq kalit bilan ochiladi va xabarning yangi hashi bilan solishtiriladi.",
        "Signing: the message is hashed and the hash is “locked” with the private key. Verifying: the signature is opened with the public key and compared with a fresh hash of the message.",
      ),
      t(
        "Bu yerdagi kalit o‘yinchoq: n = 61 × 53 = 3233. Haqiqiy RSA kalitlari yuzlab xonali tub sonlardan quriladi, lekin matematika aynan shu. HTTPS sertifikatlari, dastur yangilanishlari va elektron hujjatlar shunday imzolanadi.",
        "The key here is a toy: n = 61 × 53 = 3233. Real RSA keys are built from primes hundreds of digits long, but the maths is the same. HTTPS certificates, software updates and e-documents are signed this way.",
      ),
    ],
    task: t(
      "Bank xabarini imzolang va imzo to‘g‘riligini tekshiring. So‘ng hujumchi kabi summani o‘zgartirib, yana tekshiring.",
      "Sign the bank’s message and verify the signature. Then change the amount like an attacker and verify again.",
    ),
    hint: t(
      "“Imzolash” → “Tekshirish”, keyin xabardagi 100 ni 900 ga o‘zgartirib, yana “Tekshirish”.",
      "“Sign” → “Verify”, then change 100 to 900 in the message and press “Verify” again.",
    ),
    widget: { type: "signature" },
  },
  {
    id: 11,
    group: ENCRYPTION,
    title: t("Yakuniy test", "Final quiz"),
    minutes: 6,
    intro: t(
      "Laboratoriyadagi asosiy g‘oyalarni tekshiring.",
      "Check the lab’s main ideas.",
    ),
    analogy: t(
      "Kodlash — tarjima, hash — barmoq izi, shifr — seyf, imzo — muhr.",
      "Encoding is a translation, a hash a fingerprint, a cipher a safe, a signature a stamp.",
    ),
    theory: [
      t(
        "Oldingi darslar saqlanib qoladi — ularga qaytishingiz mumkin.",
        "Earlier lessons stay saved — you can go back to them.",
      ),
    ],
    task: t(
      "Barcha savollarga to‘g‘ri javob bering.",
      "Answer every question correctly.",
    ),
    hint: t(
      "Xato javobdan keyin izohni o‘qing va yana urinib ko‘ring.",
      "Read the explanation after a wrong answer and try again.",
    ),
    widget: {
      type: "quiz",
      questions: [
        {
          ask: t(
            "Cookie qiymati “dXNlcj1hbGk=”. Bu haqda to‘g‘ri gap qaysi?",
            "A cookie value is “dXNlcj1hbGk=”. Which statement is right?",
          ),
          options: [
            t(
              "U shifrlangan, kalitsiz ochilmaydi",
              "It is encrypted and cannot be opened without a key",
            ),
            t(
              "U Base64 — har kim ochadi va o‘zgartiradi",
              "It is Base64 — anyone can open and change it",
            ),
            t(
              "U hash — umuman ochilmaydi",
              "It is a hash — it cannot be opened at all",
            ),
          ],
          answer: 1,
          explain: t(
            "Bu Base64: “user=ali”. Kodlash hech narsani yashirmaydi.",
            "It is Base64 for “user=ali”. Encoding hides nothing.",
          ),
        },
        {
          ask: t(
            "Bitta harfi o‘zgargan matnning SHA-256 hashi qanday o‘zgaradi?",
            "How does the SHA-256 hash change when one letter of the text changes?",
          ),
          options: [
            t("Faqat oxirgi belgisi", "Only its last character"),
            t(
              "Taxminan yarmi, butunlay boshqacha ko‘rinadi",
              "About half of it — it looks completely different",
            ),
            t("O‘zgarmaydi", "It does not change"),
          ],
          answer: 1,
          explain: t(
            "Bu ko‘chki effekti: natijaning 128 bitga yaqini o‘zgaradi.",
            "That is the avalanche effect: around 128 bits of the result change.",
          ),
        },
        {
          ask: t(
            "Nima uchun parol hashiga tuz qo‘shiladi?",
            "Why is salt added to a password hash?",
          ),
          options: [
            t("Hashni qisqartirish uchun", "To make the hash shorter"),
            t(
              "Bir xil parollar har xil hash berishi va tayyor jadvallar ishlamasligi uchun",
              "So equal passwords give different hashes and precomputed tables fail",
            ),
            t(
              "Parolni keyin ochish uchun",
              "So the password can be opened later",
            ),
          ],
          answer: 1,
          explain: t(
            "Tuz har bir foydalanuvchini alohida taxmin qilishga majbur qiladi.",
            "Salt forces an attacker to guess for each user separately.",
          ),
        },
        {
          ask: t(
            "Parollarni saqlash uchun qaysi algoritm to‘g‘ri tanlov?",
            "Which algorithm is the right choice for storing passwords?",
          ),
          options: [
            t("MD5", "MD5"),
            t("Base64", "Base64"),
            t("Argon2id yoki bcrypt", "Argon2id or bcrypt"),
          ],
          answer: 2,
          explain: t(
            "Ular ataylab sekin va tuzli. MD5 tez va buzilgan, Base64 esa umuman himoya emas.",
            "They are deliberately slow and salted. MD5 is fast and broken; Base64 is no protection at all.",
          ),
        },
        {
          ask: t(
            "Kalitga bitta bit qo‘shilsa, brute force vaqti qanday o‘zgaradi?",
            "How does brute-force time change when one bit is added to a key?",
          ),
          options: [
            t(
              "Bir bit qo‘shiladi, deyarli o‘zgarmaydi",
              "Barely — it is just one bit",
            ),
            t("Ikki baravar oshadi", "It doubles"),
            t("O‘n baravar oshadi", "It grows tenfold"),
          ],
          answer: 1,
          explain: t(
            "n bitda 2^n kalit bor: har bir bit sonni ikki baravar oshiradi.",
            "n bits give 2^n keys: every bit doubles the count.",
          ),
        },
        {
          ask: t(
            "Raqamli imzo qaysi kalit bilan qo‘yiladi va qaysi biri bilan tekshiriladi?",
            "Which key makes a digital signature and which checks it?",
          ),
          options: [
            t(
              "Ochiq kalit bilan qo‘yiladi, yopiq kalit bilan tekshiriladi",
              "Made with the public key, checked with the private key",
            ),
            t(
              "Yopiq kalit bilan qo‘yiladi, ochiq kalit bilan tekshiriladi",
              "Made with the private key, checked with the public key",
            ),
            t(
              "Ikkalasi ham bitta umumiy kalit bilan",
              "Both with one shared key",
            ),
          ],
          answer: 1,
          explain: t(
            "Imzoni faqat yopiq kalit egasi qo‘ya oladi, tekshirishni esa hamma ochiq kalit bilan qiladi.",
            "Only the private key holder can sign; anyone checks with the public key.",
          ),
        },
      ],
    },
  },
];

export const PROGRESS_KEY = "cybervalue:crypto:progress:v1";

export const restoreProgress = (raw: unknown) => restoreLessons(raw, LESSONS);
