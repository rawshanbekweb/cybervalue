import type { Text } from "./logic";
import {
  atbash,
  caesar,
  lettersOnly,
  morseEncode,
  polybiusEncrypt,
  scytaleEncrypt,
  vigenere,
  type AnswerFormat,
} from "./ciphers";
import { enigma } from "./enigma";

// The Junior "Cipher room": ten ciphers in the order they were invented, each
// with a short story, a fun fact and homework. Every text is a { uz, en }
// pair. Answers are computed with the cipher functions, never typed by hand,
// so an exercise cannot carry a wrong key.

export type CipherId =
  | "atbash"
  | "scytale"
  | "polybius"
  | "caesar"
  | "frequency"
  | "pigpen"
  | "vigenere"
  | "morse"
  | "enigma"
  | "publickey";

export type Exercise = {
  task: Text;
  /** What the student works from: ciphertext, plaintext or Morse. */
  given: string;
  /** Show `given` as pigpen symbols instead of text. */
  glyphs?: boolean;
  key?: string;
  answer: string;
  format: AnswerFormat;
  /** Multiple choice: the answer is the index of the right option. */
  options?: Text[];
  hint?: Text;
};

export type Cipher = {
  id: CipherId;
  number: number;
  title: Text;
  /** When it appeared, as shown on the timeline. */
  when: Text;
  /** Sort year for the timeline (negative = BC). */
  year: number;
  /** 1–3 stars. */
  level: 1 | 2 | 3;
  tagline: Text;
  story: Text[];
  fact: Text;
  how: Text;
  exercises: Exercise[];
};

const t = (uz: string, en: string): Text => ({ uz, en });

const ENCODE = t("Shifrlang", "Encrypt");
const DECODE = t("Shifrni oching", "Decrypt");

export const CIPHERS: readonly Cipher[] = [
  {
    id: "atbash",
    number: 1,
    title: t("Atbash — ko‘zgu shifri", "Atbash — the mirror cipher"),
    when: t("Mil. avv. ~600-yil", "~600 BC"),
    year: -600,
    level: 1,
    tagline: t(
      "Alifboni ko‘zguga tuting: A — Z, B — Y bo‘ladi.",
      "Hold the alphabet up to a mirror: A becomes Z, B becomes Y.",
    ),
    story: [
      t(
        "Atbash dunyodagi eng qadimgi shifrlardan biri. Uni taxminan 2600 yil oldin qadimgi yahudiy mirzolari ishlatgan. Nomi ibroniy alifbosidagi harflardan olingan: birinchi harf (alef) oxirgisi (tav) bilan, ikkinchisi (bet) oxiridan ikkinchisi (shin) bilan almashadi — «At-Bash».",
        "Atbash is one of the oldest ciphers in the world. Hebrew scribes used it about 2,600 years ago. Its name comes from the Hebrew alphabet: the first letter (aleph) swaps with the last (tav), the second (bet) with the second-to-last (shin) — “At-Bash”.",
      ),
      t(
        "Qadimgi kitoblarda shahar nomlari shu usulda yashirilgan. Lekin Atbashda kalit yo‘q: qoidani bilgan har kim xabarni o‘qiy oladi.",
        "Ancient books hid city names this way. But Atbash has no key: anyone who knows the rule can read the message.",
      ),
    ],
    fact: t(
      "Atbashni ikki marta qo‘llasangiz, asl matn qaytadi. Shifrlash va ochish — bir xil amal!",
      "Apply Atbash twice and you get the original text back. Encrypting and decrypting are the same step!",
    ),
    how: t(
      "Yuqori qatordagi har bir harf pastdagi juftiga almashadi. Harf ustiga bosing yoki matn yozing.",
      "Each letter in the top row swaps with its partner below. Tap a letter or type a message.",
    ),
    exercises: [
      {
        task: ENCODE,
        given: "SALOM",
        answer: atbash("SALOM"),
        format: "letters",
      },
      {
        task: DECODE,
        given: atbash("KITOB"),
        answer: "KITOB",
        format: "letters",
      },
      {
        task: DECODE,
        given: atbash("ILM KUCH"),
        answer: "ILM KUCH",
        format: "letters",
      },
      {
        task: ENCODE,
        given: "SECRET",
        answer: atbash("SECRET"),
        format: "letters",
      },
      {
        task: DECODE,
        given: atbash("MAKTAB OLDIDA"),
        answer: "MAKTAB OLDIDA",
        format: "letters",
        hint: t(
          "Ikkinchi so‘z joyni bildiradi.",
          "The second word is a place.",
        ),
      },
      {
        task: t(
          "Qaysi so‘z Atbashda o‘zgarmay qoladi? (Qiziq savol!)",
          "Which word stays the same in Atbash? (Trick question!)",
        ),
        given: "",
        answer: "2",
        format: "choice",
        options: [
          t("ABBA", "ABBA"),
          t("ZOO", "ZOO"),
          t("Bunday so‘z yo‘q", "No such word"),
        ],
        hint: t(
          "Har bir harf boshqa harfga almashadi. Biror harf o‘ziga almashadimi?",
          "Every letter swaps with a different one. Does any letter map to itself?",
        ),
      },
    ],
  },
  {
    id: "scytale",
    number: 2,
    title: t("Skital — Sparta tayoqchasi", "The Spartan scytale"),
    when: t("Mil. avv. ~400-yil", "~400 BC"),
    year: -400,
    level: 1,
    tagline: t(
      "Harflar o‘zgarmaydi — faqat o‘rni almashadi.",
      "The letters stay the same — only their order changes.",
    ),
    story: [
      t(
        "Qadimgi Spartada sarkardalar xabarni charm tasmaga yozishgan. Tasma tayoqchaga o‘ralar, xabar tayoqcha bo‘ylab yozilardi. Tasma yechilsa, harflar aralash-quralash bo‘lib qolardi.",
        "In ancient Sparta, commanders wrote messages on a leather strip. The strip was wound around a rod and the message written along it. Unwound, the strip was a jumble of letters.",
      ),
      t(
        "Xabarni o‘qish uchun xuddi shunday yo‘g‘onlikdagi tayoqcha kerak edi. Demak, kalit — tayoqchaning o‘zi! Chopar tasmani kamar qilib taqib yurgan, degan rivoyat ham bor.",
        "To read it you needed a rod of exactly the same thickness. The key was the rod itself! Legend says messengers wore the strip as a belt.",
      ),
    ],
    fact: t(
      "Bu «o‘rin almashtirish» shifri: harflar o‘sha-o‘sha, faqat tartibi boshqa. Sezar esa «almashtirish» shifri — harflarning o‘zi o‘zgaradi.",
      "This is a transposition cipher: same letters, new order. Caesar is a substitution cipher — the letters themselves change.",
    ),
    how: t(
      "Xabar tayoqcha bo‘ylab qatorma-qator yoziladi. Tasma yechilganda harflar ustunma-ustun o‘qiladi. Qatorlar sonini o‘zgartirib ko‘ring.",
      "The message is written along the rod line by line. Unwound, the strip reads column by column. Try changing the number of lines.",
    ),
    exercises: [
      {
        task: t("Shifrlang (3 qator)", "Encrypt (3 lines)"),
        given: "HUJUMTONGDA",
        key: "3",
        answer: scytaleEncrypt("HUJUMTONGDA", 3),
        format: "letters",
        hint: t("Oxiri X bilan to‘ldiriladi.", "The end is padded with X."),
      },
      {
        task: t("Shifrni oching (2 qator)", "Decrypt (2 lines)"),
        given: scytaleEncrypt("BUXORO", 2),
        key: "2",
        answer: "BUXORO",
        format: "letters",
      },
      {
        task: t("Shifrni oching (3 qator)", "Decrypt (3 lines)"),
        given: scytaleEncrypt("SAMARQAND", 3),
        key: "3",
        answer: "SAMARQAND",
        format: "letters",
      },
      {
        task: t("Shifrni oching (4 qator)", "Decrypt (4 lines)"),
        given: scytaleEncrypt("ATTACKATDAWN", 4),
        key: "4",
        answer: "ATTACKATDAWN",
        format: "letters",
      },
      {
        task: t("Shifrlang (2 qator)", "Encrypt (2 lines)"),
        given: "TOSHKENT",
        key: "2",
        answer: scytaleEncrypt("TOSHKENT", 2),
        format: "letters",
      },
    ],
  },
  {
    id: "polybius",
    number: 3,
    title: t("Polibiy kvadrati", "The Polybius square"),
    when: t("Mil. avv. ~150-yil", "~150 BC"),
    year: -150,
    level: 1,
    tagline: t(
      "Har bir harf — ikki raqam: qator va ustun.",
      "Every letter becomes two digits: row and column.",
    ),
    story: [
      t(
        "Yunon tarixchisi Polibiy harflarni 5 × 5 jadvalga joylashtirishni taklif qilgan. Tunda tepaliklardagi qorovullar mash’alalar bilan xabar uzatishgan: chap qo‘ldagi mash’alalar soni — qator, o‘ngdagisi — ustun.",
        "The Greek historian Polybius put the letters in a 5 × 5 grid. At night, watchmen on hilltops signalled with torches: the torches in the left hand gave the row, the right hand the column.",
      ),
      t(
        "Alifboda 26 harf bor, jadvalda esa 25 katak. Shuning uchun I va J bitta katakda yashaydi.",
        "The alphabet has 26 letters but the grid has 25 cells, so I and J share one.",
      ),
    ],
    fact: t(
      "Qamoqdagi asirlar bir-biri bilan devorni taqillatib gaplashishgan: avval qator soni, keyin ustun soni. Bu «taqillatish kodi» deyiladi.",
      "Prisoners talked through walls by knocking: first the row number, then the column. It is called the tap code.",
    ),
    how: t(
      "Jadvalda harfni toping: avval qator raqami, keyin ustun raqami. «Taqillatish» tugmasi kodni ovoz bilan beradi.",
      "Find the letter in the grid: row number first, then column number. The “Knock” button plays it as taps.",
    ),
    exercises: [
      {
        task: ENCODE,
        given: "OLMA",
        answer: polybiusEncrypt("OLMA"),
        format: "digits",
      },
      {
        task: DECODE,
        given: polybiusEncrypt("VATAN"),
        answer: "VATAN",
        format: "letters",
      },
      {
        task: DECODE,
        given: polybiusEncrypt("HELLO"),
        answer: "HELLO",
        format: "letters",
      },
      {
        task: ENCODE,
        given: "ROBOT",
        answer: polybiusEncrypt("ROBOT"),
        format: "digits",
      },
      {
        task: DECODE,
        given: polybiusEncrypt("SIR SAQLA"),
        answer: "SIR SAQLA",
        format: "letters",
        hint: t(
          "Ikki so‘z: «sir» va nima qilish kerakligi.",
          "Two words: “secret” and what to do with it.",
        ),
      },
    ],
  },
  {
    id: "caesar",
    number: 4,
    title: t("Sezar shifri", "The Caesar cipher"),
    when: t("Mil. avv. ~50-yil", "~50 BC"),
    year: -50,
    level: 1,
    tagline: t(
      "Har bir harf alifboda bir necha qadam suriladi.",
      "Every letter moves a few steps along the alphabet.",
    ),
    story: [
      t(
        "Rim imperatori Yuliy Sezar harbiy maktublarini shu usulda yozgan. Tarixchi Svetoniyning yozishicha, u har bir harfni 3 qadam surgan: A → D, B → E.",
        "The Roman general Julius Caesar wrote his military letters this way. The historian Suetonius says he shifted each letter by 3: A → D, B → E.",
      ),
      t(
        "Uning merosxo‘ri Avgust esa atigi 1 qadam surgan. O‘sha davrda ko‘pchilik o‘qishni bilmagani uchun bu yetarli edi. Bugun kompyuter 26 ta variantni bir zumda sinab chiqadi.",
        "His heir Augustus shifted by just 1. Back then most people could not read, so it was enough. Today a computer tries all 26 options in an instant.",
      ),
    ],
    fact: t(
      "Internetda kino syujetini oshkor qilmaslik uchun ROT13 ishlatiladi — bu 13 qadamli Sezar. Uni ikki marta qo‘llasangiz, asl matn qaytadi.",
      "Online, people hide film spoilers with ROT13 — a Caesar shift of 13. Apply it twice and you are back to the original.",
    ),
    how: t(
      "Ichki g‘ildirakni aylantiring: tashqi harf — asl matn, ichki harf — shifr.",
      "Turn the inner wheel: the outer letter is the plaintext, the inner one is the ciphertext.",
    ),
    exercises: [
      {
        task: ENCODE,
        given: "XIVA",
        key: "3",
        answer: caesar("XIVA", 3),
        format: "letters",
      },
      {
        task: DECODE,
        given: caesar("QALAM", 5),
        key: "5",
        answer: "QALAM",
        format: "letters",
      },
      {
        task: DECODE,
        given: caesar("PIZZA", 1),
        key: "1",
        answer: "PIZZA",
        format: "letters",
      },
      {
        task: ENCODE,
        given: "DRAGON",
        key: "13",
        answer: caesar("DRAGON", 13),
        format: "letters",
      },
      {
        task: t(
          "Kalitsiz oching: 26 ta variantdan birini toping",
          "Break it without the key: try the 26 shifts",
        ),
        given: caesar("YULDUZ", 10),
        answer: "YULDUZ",
        format: "letters",
        hint: t("Osmonda kechasi ko‘rinadi.", "You see it in the night sky."),
      },
      {
        task: t("Kalitsiz oching", "Break it without the key"),
        given: caesar("KALIT TOPILDI", 7),
        answer: "KALIT TOPILDI",
        format: "letters",
        hint: t(
          "Birinchi so‘z eshikni ochadi.",
          "The first word opens a door.",
        ),
      },
    ],
  },
  {
    id: "frequency",
    number: 5,
    title: t(
      "Al-Kindiy va chastota tahlili",
      "Al-Kindi and frequency analysis",
    ),
    when: t("~850-yil, Bag‘dod", "~850 AD, Baghdad"),
    year: 850,
    level: 2,
    tagline: t(
      "Shifrni kalitsiz ochishning birinchi ilmiy usuli.",
      "The first scientific way to break a cipher without the key.",
    ),
    story: [
      t(
        "IX asrda Bag‘doddagi «Bayt ul-Hikma» (Donishmandlar uyi) dunyoning eng katta ilm markazi edi. U yerda xorazmlik olim Muhammad al-Xorazmiy ishlagan — «algoritm» so‘zi uning nomidan kelib chiqqan!",
        "In the 9th century, Baghdad’s House of Wisdom was the greatest centre of learning in the world. The scholar Muhammad al-Khwarizmi from Khorezm (today’s Uzbekistan) worked there — the word “algorithm” comes from his name!",
      ),
      t(
        "Xuddi shu davrda faylasuf Al-Kindiy shifrlarni ochish haqida kitob yozgan. U payqagan: har bir tilda ba’zi harflar juda ko‘p uchraydi. O‘zbek tilida A va I eng ko‘p, ingliz tilida E. Shifrdagi eng ko‘p uchraydigan belgi, ehtimol, shu harflardan biri.",
        "In the same era the philosopher Al-Kindi wrote a book on breaking ciphers. He noticed that in every language some letters are very common: A and I in Uzbek, E in English. The most common symbol in a ciphertext is probably one of them.",
      ),
    ],
    fact: t(
      "Al-Kindiy usuli 1000 yil davomida deyarli barcha oddiy shifrlarni yengib kelgan — Shotlandiya qirolichasi Meri Styuartning yashirin maktublarini ham.",
      "Al-Kindi’s method beat almost every simple cipher for 1,000 years — including the secret letters of Mary, Queen of Scots.",
    ),
    how: t(
      "Shifrlangan matnni kiriting. Ustunlar har bir harf necha marta uchrashini ko‘rsatadi. Ularni til chastotasi bilan solishtiring yoki «Avtomatik buzish»ni bosing.",
      "Enter a ciphertext. The bars show how often each letter appears. Compare them with the language, or press “Crack it”.",
    ),
    exercises: [
      {
        task: t(
          "Sezar siljishini toping va oching",
          "Find the Caesar shift and decrypt",
        ),
        given: caesar(
          "AL XORAZMIY BAGDODDA ISHLAGAN VA ALGEBRA FANINI YARATGAN",
          9,
        ),
        answer: "AL XORAZMIY BAGDODDA ISHLAGAN VA ALGEBRA FANINI YARATGAN",
        format: "letters",
        hint: t(
          "Eng ko‘p uchragan harf, ehtimol, A.",
          "The most common letter is probably A.",
        ),
      },
      {
        task: t(
          "Sezar siljishini toping va oching",
          "Find the Caesar shift and decrypt",
        ),
        given: caesar(
          "MEET ME AT THE OLD TREE WHEN THE BELL RINGS THREE TIMES",
          4,
        ),
        answer: "MEET ME AT THE OLD TREE WHEN THE BELL RINGS THREE TIMES",
        format: "letters",
        hint: t(
          "Ingliz tilida eng ko‘p uchraydigan harf — E.",
          "The most common English letter is E.",
        ),
      },
      {
        task: t(
          "O‘zbek matnida qaysi harf odatda eng ko‘p uchraydi?",
          "Which letter is usually the most common in Uzbek text?",
        ),
        given: "",
        answer: "0",
        format: "choice",
        options: [t("A", "A"), t("Z", "Z"), t("Q", "Q")],
      },
      {
        task: t(
          "Nega chastota tahlili qisqa xabarda yomon ishlaydi?",
          "Why does frequency analysis work badly on a short message?",
        ),
        given: "",
        answer: "1",
        format: "choice",
        options: [
          t(
            "Qisqa xabarlar shifrlanmaydi",
            "Short messages are never encrypted",
          ),
          t(
            "Harflar statistikani ko‘rsatishga yetmaydi",
            "There are too few letters to show the pattern",
          ),
          t(
            "Kompyuter qisqa matnni o‘qiy olmaydi",
            "Computers cannot read short text",
          ),
        ],
      },
    ],
  },
  {
    id: "vigenere",
    number: 6,
    title: t("Vijener shifri", "The Vigenère cipher"),
    when: t("1553-yil", "1553"),
    year: 1553,
    level: 2,
    tagline: t(
      "Har bir harf boshqacha siljiydi — kalit so‘z bo‘yicha.",
      "Every letter shifts differently, following a key word.",
    ),
    story: [
      t(
        "1553-yilda italyan Jovan Battista Bellazo kalit so‘z bilan ishlaydigan shifrni yozdi. Keyinchalik u fransuz Blez de Vijener nomi bilan mashhur bo‘ldi.",
        "In 1553 the Italian Giovan Battista Bellaso described a cipher driven by a key word. It later became famous under the name of the Frenchman Blaise de Vigenère.",
      ),
      t(
        "300 yil davomida uni «ochib bo‘lmaydigan shifr» deb atashgan. Faqat XIX asrda ingliz Charlz Bebbij va nemis Fridrix Kasiski kalit uzunligini topish usulini kashf etib, uni buzishdi.",
        "For 300 years it was called “the indecipherable cipher”. Only in the 1800s did Charles Babbage and Friedrich Kasiski find a way to guess the key length and break it.",
      ),
    ],
    fact: t(
      "Bir xil harf har safar boshqacha shifrlanadi, shuning uchun oddiy chastota tahlili ishlamaydi. Kalit qanchalik uzun bo‘lsa, shuncha kuchli.",
      "The same letter encrypts differently each time, so plain frequency analysis fails. The longer the key, the stronger it is.",
    ),
    how: t(
      "Kalit so‘z xabar ostida takrorlanadi. Har bir kalit harfi — siljish: A = 0, B = 1, C = 2 … Matn harfi + kalit harfi = shifr harfi.",
      "The key word repeats under the message. Each key letter is a shift: A = 0, B = 1, C = 2 … Message letter + key letter = cipher letter.",
    ),
    exercises: [
      {
        task: ENCODE,
        given: "SALOM",
        key: "BIR",
        answer: vigenere("SALOM", "BIR"),
        format: "letters",
      },
      {
        task: DECODE,
        given: vigenere("HIMOYA", "KOD"),
        key: "KOD",
        answer: "HIMOYA",
        format: "letters",
      },
      {
        task: ENCODE,
        given: "ATTACK",
        key: "LEMON",
        answer: vigenere("ATTACK", "LEMON"),
        format: "letters",
      },
      {
        task: DECODE,
        given: vigenere("BUGUN SOAT BESHDA", "SIR"),
        key: "SIR",
        answer: "BUGUN SOAT BESHDA",
        format: "letters",
      },
      {
        task: t(
          "«AAAA» ni «KEY» kaliti bilan shifrlasangiz nima chiqadi?",
          "What do you get when you encrypt “AAAA” with the key “KEY”?",
        ),
        given: "AAAA",
        key: "KEY",
        answer: vigenere("AAAA", "KEY"),
        format: "letters",
        hint: t(
          "A = 0, demak hech narsa qo‘shilmaydi…",
          "A = 0, so nothing is added…",
        ),
      },
    ],
  },
  {
    id: "pigpen",
    number: 7,
    title: t("Masonlar shifri (Pigpen)", "The pigpen cipher"),
    when: t("XVIII asr", "1700s"),
    year: 1700,
    level: 1,
    tagline: t(
      "Harflar o‘rniga — panjaralar va nuqtalar.",
      "Letters become little fences and dots.",
    ),
    story: [
      t(
        "XVIII asrda masonlar jamiyati a’zolari yozishmalarini shu belgilarda olib borishgan. Har bir harf — panjaradagi katakning shakli. Ikkinchi panjarada katakchalarga nuqta qo‘shiladi.",
        "In the 1700s, Freemasons kept their records in these symbols. Each letter is the shape of its cell in a grid; the second grid adds a dot.",
      ),
      t(
        "Nyu-Yorkdagi Trinity cherkovi qabristonida 1794-yilgi qabrtosh bor — undagi yozuv shu shifrda: «Remember death» (O‘limni yodda tut).",
        "In New York’s Trinity Churchyard there is a gravestone from 1794 with an inscription in this cipher: “Remember death”.",
      ),
    ],
    fact: t(
      "Belgilar sirli ko‘rinadi, lekin bu oddiy almashtirish shifri. Al-Kindiyning chastota tahlili uni ham osongina ochadi!",
      "The symbols look mysterious, but it is a plain substitution cipher. Al-Kindi’s frequency analysis breaks it just as easily!",
    ),
    how: t(
      "Kalit-jadval: A–I # panjarada, J–R nuqtali # panjarada, S–V X shaklida, W–Z nuqtali X da. Matn yozing — belgilarga aylanadi.",
      "The key: A–I in a # grid, J–R in a dotted # grid, S–V in an X, W–Z in a dotted X. Type a message to see it in symbols.",
    ),
    exercises: [
      {
        task: DECODE,
        given: "SIR",
        glyphs: true,
        answer: "SIR",
        format: "letters",
      },
      {
        task: DECODE,
        given: "ANOR",
        glyphs: true,
        answer: "ANOR",
        format: "letters",
      },
      {
        task: DECODE,
        given: "ROBOT",
        glyphs: true,
        answer: "ROBOT",
        format: "letters",
      },
      {
        task: DECODE,
        given: "WIZARD",
        glyphs: true,
        answer: "WIZARD",
        format: "letters",
      },
      {
        task: DECODE,
        given: "REMEMBER DEATH",
        glyphs: true,
        answer: "REMEMBER DEATH",
        format: "letters",
        hint: t(
          "Trinity qabristonidagi yozuv.",
          "The Trinity Churchyard inscription.",
        ),
      },
    ],
  },
  {
    id: "morse",
    number: 8,
    title: t("Morze alifbosi", "Morse code"),
    when: t("1838-yil", "1838"),
    year: 1838,
    level: 1,
    tagline: t(
      "Nuqta va tirelar: yorug‘lik, ovoz yoki taqillatish bilan.",
      "Dots and dashes: by light, sound or knocking.",
    ),
    story: [
      t(
        "Samuel Morze va Alfred Veyl telegraf uchun harflarni qisqa va uzun signallarga aylantirishdi. 1844-yilda birinchi uzoq masofali xabar Vashingtondan Baltimorga yuborildi.",
        "Samuel Morse and Alfred Vail turned letters into short and long signals for the telegraph. In 1844 the first long-distance message went from Washington to Baltimore.",
      ),
      t(
        "Veyl eng ko‘p ishlatiladigan harflarga eng qisqa kodlarni berish uchun bosmaxonadagi harf qutilarini sanagan. Shuning uchun E — bitta nuqta. Bu ham chastota tahlili!",
        "Vail counted the letter boxes in a printer’s shop to give the most common letters the shortest codes. That is why E is a single dot — frequency analysis again!",
      ),
    ],
    fact: t(
      "Morze — shifr emas, kodlash. Jadval hammaga ochiq, sir kaliti yo‘q. Mashhur SOS (··· −−− ···) qisqartma emas: shunchaki adashtirib bo‘lmaydigan signal.",
      "Morse is an encoding, not a cipher: the table is public and there is no secret key. The famous SOS (··· −−− ···) is not an abbreviation — just a signal you cannot mistake.",
    ),
    how: t(
      "Matn yozing va «Eshitish»ni bosing: chiroq va ovoz kodni beradi. Harflar orasida bo‘sh joy, so‘zlar orasida « / ».",
      "Type a message and press “Listen”: the lamp and the beep play the code. A space between letters, “ / ” between words.",
    ),
    exercises: [
      {
        task: DECODE,
        given: morseEncode("SOS"),
        answer: "SOS",
        format: "letters",
      },
      {
        task: DECODE,
        given: morseEncode("SALOM"),
        answer: "SALOM",
        format: "letters",
      },
      {
        task: ENCODE,
        given: "OLMA",
        answer: morseEncode("OLMA"),
        format: "morse",
      },
      {
        task: DECODE,
        given: morseEncode("HELLO WORLD"),
        answer: "HELLO WORLD",
        format: "letters",
      },
      {
        task: ENCODE,
        given: "ILM NUR",
        answer: morseEncode("ILM NUR"),
        format: "morse",
      },
      {
        task: t(
          "Morze nima uchun shifr emas?",
          "Why is Morse code not a cipher?",
        ),
        given: "",
        answer: "0",
        format: "choice",
        options: [
          t(
            "Jadval hammaga ochiq, sir kalit yo‘q",
            "The table is public; there is no secret key",
          ),
          t("U juda eski", "It is too old"),
          t("Unda raqamlar yo‘q", "It has no digits"),
        ],
      },
    ],
  },
  {
    id: "enigma",
    number: 9,
    title: t("Enigma mashinasi", "The Enigma machine"),
    when: t("1939–1945", "1939–1945"),
    year: 1939,
    level: 3,
    tagline: t(
      "Har bir tugma bosilganda shifr o‘zgaradi.",
      "The cipher changes with every key you press.",
    ),
    story: [
      t(
        "Enigmani nemis muhandisi Artur Sherbius 1918-yilda ixtiro qilgan. Ikkinchi jahon urushida nemis armiyasi barcha maxfiy buyruqlarini shu mashinada shifrlagan. Ichidagi aylanuvchi g‘ildiraklar (rotorlar) har bir harfdan keyin buriladi, shuning uchun bir xil harf har safar boshqacha chiqadi.",
        "The German engineer Arthur Scherbius invented Enigma in 1918. In the Second World War the German military enciphered its secret orders with it. Spinning wheels (rotors) inside turn after every letter, so the same letter comes out differently each time.",
      ),
      t(
        "1932-yilda polshalik yosh matematik Marian Rejevskiy va do‘stlari Enigmani birinchi bo‘lib buzishdi. 1939-yilda ular sirni inglizlarga berishdi. Bletchli-Parkda Alan Tyuring va uning jamoasi «Bomba» degan mashina qurib, har kuni yangi kalitni topishgan. Tarixchilar bu urushni taxminan ikki yilga qisqartirgan deb hisoblashadi.",
        "In 1932 the young Polish mathematician Marian Rejewski and his friends were the first to break Enigma. In 1939 they handed the secret to the British. At Bletchley Park, Alan Turing and his team built a machine called the Bombe that found the new key every day. Historians think this shortened the war by about two years.",
      ),
    ],
    fact: t(
      "Enigmada harf hech qachon o‘zi bo‘lib shifrlanmaydi: A hech qachon A bo‘lmaydi. Shu kichik zaiflik buzuvchilarga katta yordam bergan. Haqiqiy mashinada 158 kvintilliondan ortiq sozlash bo‘lgan!",
      "Enigma never enciphers a letter as itself: A never becomes A. That tiny weakness helped the codebreakers enormously. The real machine had more than 158 quintillion settings!",
    ),
    how: t(
      "Rotorlarning boshlang‘ich holatini tanlang va klaviaturadagi harfni bosing: chiroq yonadi, o‘ng rotor buriladi. Signal yo‘li pastda ko‘rinadi. Ochish uchun xuddi o‘sha holatdan boshlab shifrni qayta tering — Enigma o‘zini o‘zi ochadi.",
      "Set the rotors’ start position and press a key: a lamp lights and the right rotor turns. The signal’s path is shown below. To decrypt, start from the same position and type the ciphertext — Enigma undoes itself.",
    ),
    exercises: [
      {
        task: t("Shifrni oching (boshlanish: AAA)", "Decrypt (start: AAA)"),
        given: enigma("SALOM", "AAA"),
        key: "AAA",
        answer: "SALOM",
        format: "letters",
      },
      {
        task: t("Shifrlang (boshlanish: BCD)", "Encrypt (start: BCD)"),
        given: "HUJUM",
        key: "BCD",
        answer: enigma("HUJUM", "BCD"),
        format: "letters",
      },
      {
        task: t("Shifrni oching (boshlanish: QEV)", "Decrypt (start: QEV)"),
        given: enigma("BLETCHLEY PARK", "QEV"),
        key: "QEV",
        answer: "BLETCHLEY PARK",
        format: "letters",
        hint: t(
          "Tyuring ishlagan joyning nomi.",
          "The name of the place where Turing worked.",
        ),
      },
      {
        task: t("Shifrni oching (boshlanish: AAA)", "Decrypt (start: AAA)"),
        given: enigma("AAAAA", "AAA"),
        key: "AAA",
        answer: "AAAAA",
        format: "letters",
        hint: t(
          "Bir xil harf besh marta — lekin shifrda hammasi har xil!",
          "The same letter five times — yet every cipher letter differs!",
        ),
      },
      {
        task: t(
          "Enigmani birinchi bo‘lib kimlar buzgan?",
          "Who were the first to break Enigma?",
        ),
        given: "",
        answer: "1",
        format: "choice",
        options: [
          t("Yuliy Sezar", "Julius Caesar"),
          t("Polshalik matematiklar", "Polish mathematicians"),
          t("Samuel Morze", "Samuel Morse"),
        ],
      },
      {
        task: t(
          "Enigmaning qaysi xususiyati buzuvchilarga yordam bergan?",
          "Which property of Enigma helped the codebreakers?",
        ),
        given: "",
        answer: "0",
        format: "choice",
        options: [
          t(
            "Harf hech qachon o‘zi bo‘lib shifrlanmaydi",
            "A letter is never enciphered as itself",
          ),
          t("U juda og‘ir edi", "It was very heavy"),
          t("Unda faqat 10 ta harf bor edi", "It had only 10 letters"),
        ],
      },
    ],
  },
  {
    id: "publickey",
    number: 10,
    title: t("Ochiq kalit sehri", "The magic of public keys"),
    when: t("1976-yil", "1976"),
    year: 1976,
    level: 3,
    tagline: t(
      "Hech qachon uchrashmagan ikki kishi umumiy sirga qanday ega bo‘ladi?",
      "How can two people who never met share a secret?",
    ),
    story: [
      t(
        "Avvalgi barcha shifrlarda bitta muammo bor: kalitni oldindan yashirincha almashish kerak. 1976-yilda Uitfild Diffi va Martin Xellman bu muammoni hal qilishdi — kalitni hamma ko‘rib turgan kanal orqali «yasash» mumkin!",
        "Every cipher so far has one problem: you must swap the key in secret first. In 1976 Whitfield Diffie and Martin Hellman solved it — you can build a shared key over a channel everyone can see!",
      ),
      t(
        "Keyinroq ma’lum bo‘ldiki, Britaniya razvedkasi olimlari bu g‘oyani biroz oldinroq topishgan, lekin u 1997-yilgacha sir saqlangan.",
        "Later it emerged that British intelligence scientists had found the idea a little earlier, but it stayed secret until 1997.",
      ),
    ],
    fact: t(
      "Brauzerda qulf belgisini (https) ko‘rganingizda, xuddi shunday kalit almashinuvi sodir bo‘ladi — har kuni milliardlab marta.",
      "Whenever you see the padlock (https) in your browser, a key exchange like this happens — billions of times a day.",
    ),
    how: t(
      "Bo‘yoqlar bilan tasavvur qiling: ochiq rang hammaga ma’lum. Ali va Vali o‘z maxfiy rangini qo‘shib, aralashmani almashadi, keyin yana o‘z sirini qo‘shadi. Ikkalasida bir xil rang chiqadi, Eva esa uni yasay olmaydi — aralashmani qayta ajratib bo‘lmaydi.",
      "Think of paint: the public colour is known to everyone. Ali and Vali each mix in a secret colour, swap the mixtures, then add their own secret again. Both end up with the same colour, but Eve cannot make it — you cannot un-mix paint.",
    ),
    exercises: [
      {
        task: t(
          "Eva qaysi ranglarni ko‘ra oladi?",
          "Which colours can Eve see?",
        ),
        given: "",
        answer: "1",
        format: "choice",
        options: [
          t(
            "Ali va Valining maxfiy ranglarini",
            "Ali’s and Vali’s secret colours",
          ),
          t(
            "Ochiq rang va ikkala aralashmani",
            "The public colour and both mixtures",
          ),
          t("Yakuniy umumiy rangni", "The final shared colour"),
        ],
      },
      {
        task: t(
          "Nega Eva umumiy rangni yasay olmaydi?",
          "Why can’t Eve make the shared colour?",
        ),
        given: "",
        answer: "2",
        format: "choice",
        options: [
          t("U bo‘yoq sotib ololmaydi", "She cannot buy paint"),
          t(
            "Aralashmalar juda tez yuboriladi",
            "The mixtures are sent too fast",
          ),
          t(
            "Aralashmadan maxfiy rangni ajratib olib bo‘lmaydi",
            "You cannot pull the secret colour back out of a mixture",
          ),
        ],
      },
      {
        task: t(
          "Bu g‘oya bugun qayerda ishlatiladi?",
          "Where is this idea used today?",
        ),
        given: "",
        answer: "0",
        format: "choice",
        options: [
          t(
            "Https saytlar va messenjerlarda",
            "In https websites and messengers",
          ),
          t("Faqat muzeylarda", "Only in museums"),
          t("Hech qayerda", "Nowhere"),
        ],
      },
    ],
  },
];

export const CIPHER_IDS = CIPHERS.map((cipher) => cipher.id);

// Homework generator ---------------------------------------------------------

const WORDS: Record<"uz" | "en", string[]> = {
  uz: [
    "SALOM",
    "KITOB",
    "MAKTAB",
    "VATAN",
    "QALAM",
    "BAYROQ",
    "SAMARQAND",
    "BUXORO",
    "XIVA",
    "TOSHKENT",
    "BILIM",
    "HIMOYA",
    "PAROL",
    "XAKER",
    "ROBOT",
    "OLMA",
    "ANOR",
    "QUYOSH",
    "OSMON",
    "YULDUZ",
    "DARYO",
    "KALIT",
    "SHIFR",
    "TARIX",
    "SAYYORA",
    "DENGIZ",
    "ARSLON",
    "BURGUT",
    "LOLA",
    "SHAXMAT",
    "FUTBOL",
    "INTERNET",
    "KOMPYUTER",
    "ILM KUCH",
    "SIR SAQLA",
    "KUTUBXONA",
    "BAHOR",
    "QOR",
    "UYQU",
    "MUSIQA",
  ],
  en: [
    "HELLO",
    "SECRET",
    "CASTLE",
    "DRAGON",
    "PLANET",
    "ROCKET",
    "GARDEN",
    "SCHOOL",
    "PUZZLE",
    "SHIELD",
    "AGENT",
    "MISSION",
    "TIGER",
    "WINTER",
    "MUSIC",
    "OCEAN",
    "ROBOT",
    "PIRATE",
    "TREASURE",
    "COMPUTER",
    "MEET AT NOON",
    "TRUST NO ONE",
    "KEY IS HIDDEN",
    "GOOD LUCK",
    "STAY SAFE",
  ],
};

const KEYWORDS: Record<"uz" | "en", string[]> = {
  uz: ["SIR", "KOD", "BIR", "OY", "NUR", "ILM", "TOG"],
  en: ["KEY", "SUN", "CAT", "LEMON", "SPY", "OWL"],
};

/** A fresh exercise for printable or extra homework; `random` is in [0, 1). */
export function generateExercise(
  id: CipherId,
  locale: "uz" | "en",
  random: () => number,
): Exercise | null {
  const pick = <T>(list: readonly T[]) =>
    list[Math.floor(random() * list.length)];
  const words = WORDS[locale];
  const encode = random() < 0.5;
  const word = pick(words);
  switch (id) {
    case "atbash":
      return encode
        ? { task: ENCODE, given: word, answer: atbash(word), format: "letters" }
        : {
            task: DECODE,
            given: atbash(word),
            answer: word,
            format: "letters",
          };
    case "caesar": {
      const shift = 1 + Math.floor(random() * 25);
      return encode
        ? {
            task: ENCODE,
            given: word,
            key: String(shift),
            answer: caesar(word, shift),
            format: "letters",
          }
        : {
            task: DECODE,
            given: caesar(word, shift),
            key: String(shift),
            answer: word,
            format: "letters",
          };
    }
    case "scytale": {
      const choices = words
        .map((w) => ({
          w,
          rows: [2, 3, 4].filter(
            (r) => lettersOnly(w).length % r === 0 && lettersOnly(w).length > r,
          ),
        }))
        .filter((item) => item.rows.length);
      const { w, rows } = pick(choices);
      const r = pick(rows);
      const task = encode
        ? t(`Shifrlang (${r} qator)`, `Encrypt (${r} lines)`)
        : t(`Shifrni oching (${r} qator)`, `Decrypt (${r} lines)`);
      return encode
        ? {
            task,
            given: lettersOnly(w),
            key: String(r),
            answer: scytaleEncrypt(w, r),
            format: "letters",
          }
        : {
            task,
            given: scytaleEncrypt(w, r),
            key: String(r),
            answer: lettersOnly(w),
            format: "letters",
          };
    }
    case "polybius": {
      const w = pick(words.filter((item) => !item.includes("J")));
      return encode
        ? {
            task: ENCODE,
            given: w,
            answer: polybiusEncrypt(w),
            format: "digits",
          }
        : {
            task: DECODE,
            given: polybiusEncrypt(w),
            answer: w,
            format: "letters",
          };
    }
    case "frequency": {
      const shift = 1 + Math.floor(random() * 25);
      const sentence = [pick(words), pick(words), pick(words)].join(" ");
      return {
        task: t("Kalitsiz oching (Sezar)", "Break it without the key (Caesar)"),
        given: caesar(sentence, shift),
        answer: sentence,
        format: "letters",
      };
    }
    case "pigpen":
      return {
        task: DECODE,
        given: word,
        glyphs: true,
        answer: word,
        format: "letters",
      };
    case "vigenere": {
      const key = pick(KEYWORDS[locale]);
      return encode
        ? {
            task: ENCODE,
            given: word,
            key,
            answer: vigenere(word, key),
            format: "letters",
          }
        : {
            task: DECODE,
            given: vigenere(word, key),
            key,
            answer: word,
            format: "letters",
          };
    }
    case "enigma": {
      const start = Array.from({ length: 3 }, () =>
        String.fromCharCode(65 + Math.floor(random() * 26)),
      ).join("");
      const task = encode
        ? t(`Shifrlang (boshlanish: ${start})`, `Encrypt (start: ${start})`)
        : t(
            `Shifrni oching (boshlanish: ${start})`,
            `Decrypt (start: ${start})`,
          );
      return encode
        ? {
            task,
            given: word,
            key: start,
            answer: enigma(word, start),
            format: "letters",
          }
        : {
            task,
            given: enigma(word, start),
            key: start,
            answer: word,
            format: "letters",
          };
    }
    case "morse":
      return encode
        ? {
            task: ENCODE,
            given: word,
            answer: morseEncode(word),
            format: "morse",
          }
        : {
            task: DECODE,
            given: morseEncode(word),
            answer: word,
            format: "letters",
          };
    default:
      return null;
  }
}

/** Ciphers whose homework can be generated (the paint lesson is conceptual). */
export const GENERATED: readonly CipherId[] = CIPHER_IDS.filter(
  (id) => id !== "publickey",
);

export const CIPHER_PROGRESS_KEY = "cybervalue:junior:ciphers:v1";

export type CipherProgress = Partial<Record<CipherId, number[]>>;

// Browser storage is untrusted: keep known ciphers and valid exercise indexes.
export function restoreCipherProgress(raw: unknown): CipherProgress {
  const result: CipherProgress = {};
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return result;
  for (const cipher of CIPHERS) {
    const value = (raw as Record<string, unknown>)[cipher.id];
    if (!Array.isArray(value)) continue;
    const solved = [
      ...new Set(
        value.filter(
          (n): n is number =>
            Number.isInteger(n) && n >= 0 && n < cipher.exercises.length,
        ),
      ),
    ].sort((a, b) => a - b);
    if (solved.length) result[cipher.id] = solved;
  }
  return result;
}

export const TOTAL_EXERCISES = CIPHERS.reduce(
  (sum, cipher) => sum + cipher.exercises.length,
  0,
);
