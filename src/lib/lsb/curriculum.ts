// Academy Intermediate · Steganography, module 2: Inside images. The lessons
// use ./tools.ts: flipping one bit of a colour, reading the red LSBs of a
// row of pixels, and looking at an image one bit plane at a time.
import type { CommonWidget, Lesson, Text } from "../anim-lab/types";

export type Widget =
  CommonWidget | { type: "flip" } | { type: "row" } | { type: "planes" };

export const PROGRESS_KEY = "cybervalue:lsb:progress:v1";

const t = (uz: string, en: string): Text => ({ uz, en });
const code = (s: string): Text => ({ uz: s, en: s });

const PIXELS = t("Piksellar", "Pixels");
const LSB = t("Eng kichik bit", "The least significant bit");
const FIND = t("Topish", "Finding it");

export const LESSONS: Lesson<Widget>[] = [
  {
    id: 1,
    group: PIXELS,
    title: t("Piksel ichida nima bor", "What a pixel holds"),
    minutes: 6,
    intro: t(
      "Rangli rasm piksellardan iborat, har bir piksel uchta son: qizil (R), yashil (G) va ko‘k (B), har biri 0 dan 255 gacha — ya’ni 8 bit. Chapdagi bit (MSB) rangni keskin o‘zgartiradi, o‘ngdagi (LSB) esa deyarli sezilmaydi.",
      "A colour picture is made of pixels, and each pixel is three numbers: red (R), green (G) and blue (B), each from 0 to 255 — that is, 8 bits. The leftmost bit (the MSB) changes the colour sharply; the rightmost (the LSB) barely at all.",
    ),
    analogy: t(
      "Narx 200 000 so‘m: birinchi raqamni o‘zgartirsangiz — katta farq, oxirgi tiyinni — hech kim sezmaydi.",
      "A price of 200 000: change the first digit and it matters a lot; change the last one and nobody notices.",
    ),
    theory: [
      t(
        "Bit qiymatlari: 128, 64, 32, 16, 8, 4, 2, 1. Eng chapdagisini o‘zgartirish — 128 qadam, eng o‘ngdagisini — 1 qadam.",
        "The bit values are 128, 64, 32, 16, 8, 4, 2, 1. Flipping the leftmost moves the value 128 steps; the rightmost, 1 step.",
      ),
    ],
    task: t(
      "Pikselning har bir qismini bosib, nima ekanini o‘qing.",
      "Click each part of the pixel and read what it is.",
    ),
    hint: t("Hammasi bo‘lib beshta qism.", "Five parts in all."),
    widget: {
      type: "anatomy",
      lines: [
        [
          { text: "rgb(" },
          { text: "200", id: "r" },
          { text: ", " },
          { text: "120", id: "g" },
          { text: ", " },
          { text: "80", id: "b" },
          { text: ")" },
        ],
        [
          { text: "R = " },
          { text: "1", id: "msb" },
          { text: "100100" },
          { text: "0", id: "lsb" },
        ],
      ],
      parts: [
        {
          id: "r",
          title: t("Qizil kanal", "Red channel"),
          body: t(
            "0 — qizil yo‘q, 255 — to‘liq qizil.",
            "0 means no red, 255 full red.",
          ),
        },
        {
          id: "g",
          title: t("Yashil kanal", "Green channel"),
          body: t(
            "Ko‘z yashilga eng sezgir — shuning uchun yashirishda ehtiyotkorlik kerak.",
            "The eye is most sensitive to green — so hiding there takes more care.",
          ),
        },
        {
          id: "b",
          title: t("Ko‘k kanal", "Blue channel"),
          body: t(
            "Ko‘z ko‘kka eng kam sezgir — yashirish uchun qulay joy.",
            "The eye is least sensitive to blue — a handy place to hide.",
          ),
        },
        {
          id: "msb",
          title: t("MSB — eng katta bit", "MSB — most significant bit"),
          body: t(
            "128 ga teng. Uni o‘zgartirish rangni yarmiga o‘zgartiradi — darhol ko‘rinadi.",
            "Worth 128. Flipping it shifts the colour by half its range — instantly visible.",
          ),
        },
        {
          id: "lsb",
          title: t("LSB — eng kichik bit", "LSB — least significant bit"),
          body: t(
            "1 ga teng. Uni o‘zgartirish ko‘zga ko‘rinmaydi — LSB steganografiyasi aynan shunga asoslangan.",
            "Worth 1. Flipping it can’t be seen — exactly what LSB steganography relies on.",
          ),
        },
      ],
    },
  },
  {
    id: 2,
    group: PIXELS,
    title: t("Qaysi bitni o‘zgartirish mumkin", "Which bit can change unseen"),
    minutes: 8,
    intro: t(
      "Qizil kanalning har bir bitini o‘zgartirib ko‘ring va ikki rangni solishtiring. Qaysi bitni o‘zgartirsangiz, rang ko‘zga bir xil qoladi?",
      "Flip each bit of the red channel in turn and compare the two colours. Which bit can you flip and still see the same colour?",
    ),
    analogy: t(
      "Qum soatidan bitta zarrani olib qo‘yish: vaqt o‘zgarmaganday ko‘rinadi.",
      "Taking a single grain out of an hourglass: the time looks no different.",
    ),
    theory: [
      t(
        "Inson ko‘zi 1–2 qadamlik farqni sezmaydi; 8 va undan katta farq ko‘rinadi.",
        "The human eye can’t tell 1–2 steps apart; 8 or more shows.",
      ),
    ],
    task: t(
      "Rangni ko‘rinmas o‘zgartiradigan bitni toping.",
      "Find the bit that changes the colour invisibly.",
    ),
    hint: t("Eng o‘ngdagi bit.", "The rightmost bit."),
    widget: { type: "flip" },
  },
  {
    id: 3,
    group: LSB,
    title: t("Piksellardan xabar o‘qish", "Reading a message from pixels"),
    minutes: 10,
    intro: t(
      "LSB usuli: har bir pikselning qizil kanalidagi eng kichik bit — xabarning bitta biti. 8 piksel — bitta harf. Rasmning o‘zi o‘zgarmaganday ko‘rinadi, lekin bitlarni ketma-ket o‘qisangiz, xabar chiqadi.",
      "The LSB method: the lowest bit of each pixel’s red channel is one bit of the message. Eight pixels make one letter. The picture looks untouched, but read the bits in order and the message comes out.",
    ),
    analogy: t(
      "Har bir kitobdan bitta harf: javondagi kitoblar oddiy, lekin birinchi harflari ketma-ket so‘z hosil qiladi.",
      "One letter from each book: the shelf looks ordinary, but the letters in order spell a word.",
    ),
    theory: [
      t(
        "zsteg va stegsolve kabi vositalar bu ishni avtomatik qiladi: barcha kanal va tartiblarni sinab chiqadi.",
        "Tools such as zsteg and stegsolve do this automatically, trying every channel and order.",
      ),
    ],
    task: t(
      "Qizil LSB’lardan xabarni oching va yozing.",
      "Decode the message from the red LSBs and type it.",
    ),
    hint: t(
      "Har 8 bit — bitta ASCII belgi.",
      "Every 8 bits is one ASCII character.",
    ),
    widget: { type: "row" },
  },
  {
    id: 4,
    group: LSB,
    title: t("Qancha sig‘adi", "How much fits"),
    minutes: 6,
    intro: t(
      "Har bir kanalga bitta bit yashirilsa, har piksel 3 bit beradi. 1920×1080 rasm — 6 220 800 bit, ya’ni taxminan 760 KB. Bu — butun kitob! Lekin qancha ko‘p yashirsangiz, statistika shuncha ko‘p o‘zgaradi.",
      "With one bit per channel, each pixel carries 3 bits. A 1920×1080 picture is 6 220 800 bits — about 760 KB. That is a whole book! But the more you hide, the more the statistics change.",
    ),
    analogy: t(
      "Har bir g‘ishtning ichiga bitta tanga: g‘isht ko‘p bo‘lsa, xazina katta.",
      "A coin inside every brick: with enough bricks, it is a treasure.",
    ),
    theory: [
      t(
        "Ikki LSB ishlatilsa, sig‘im ikki barobar, lekin rang 3 qadamgacha o‘zgaradi va aniqlash osonlashadi.",
        "Using two LSBs doubles the capacity, but colours shift by up to 3 steps and detection gets easier.",
      ),
    ],
    task: t("Savollarga javob bering.", "Answer the questions."),
    hint: t(
      "Piksellar × kanallar × bitlar ÷ 8.",
      "Pixels × channels × bits ÷ 8.",
    ),
    widget: {
      type: "quiz",
      questions: [
        {
          ask: t(
            "100×100 rasmda, har kanalga 1 bit (RGB) — necha bayt sig‘adi?",
            "In a 100×100 picture with 1 bit per channel (RGB), how many bytes fit?",
          ),
          options: [code("3 750"), code("10 000"), code("30 000")],
          answer: 0,
          explain: t(
            "100 × 100 × 3 ÷ 8 = 3 750 bayt.",
            "100 × 100 × 3 ÷ 8 = 3 750 bytes.",
          ),
        },
        {
          ask: t(
            "Nega ko‘pincha faqat 1 ta LSB ishlatiladi?",
            "Why is usually only 1 LSB used?",
          ),
          options: [
            t(
              "O‘zgarish eng kichik — ko‘z ham, statistika ham kam sezadi",
              "The change is smallest — both the eye and statistics notice least",
            ),
            t("Ko‘proq bit ishlatib bo‘lmaydi", "More bits can’t be used"),
            t("Rasm buziladi", "The picture breaks"),
          ],
          answer: 0,
          explain: t(
            "Sig‘im va yashirinlik orasidagi muvozanat.",
            "A balance between capacity and stealth.",
          ),
        },
      ],
    },
  },
  {
    id: 5,
    group: FIND,
    title: t("Bit tekisliklari", "Bit planes"),
    minutes: 10,
    intro: t(
      "Bit tekisligi — rasmning faqat bitta kanalining bitta biti, oq-qora ko‘rinishda. Yuqori bitlar rasmning shaklini ko‘rsatadi; eng kichik bit esa odatda shovqinga o‘xshaydi. Agar u yerda harf yoki shakl ko‘rinsa — kimdir unga nimadir yozgan.",
      "A bit plane is one bit of one channel of an image, shown in black and white. The high bits show the picture’s shapes; the lowest bit usually looks like noise. If letters or shapes appear there, someone wrote something into it.",
    ),
    analogy: t(
      "Rasmni rentgendan o‘tkazish: ustidagi bo‘yoq ostida boshqa chizma ko‘rinadi.",
      "X-raying a painting: beneath the paint, another drawing shows.",
    ),
    theory: [
      t(
        "stegsolve’da “Blue plane 0” — aynan shu ko‘rinish.",
        "In stegsolve, “Blue plane 0” is exactly this view.",
      ),
    ],
    task: t(
      "Rasmdagi yashirin so‘zni toping va yozing.",
      "Find the word hidden in the picture and type it.",
    ),
    hint: t("Ko‘k kanal, 0-bit.", "The blue channel, bit 0."),
    widget: { type: "planes" },
  },
  {
    id: 6,
    group: FIND,
    title: t("Qaysi format LSB’ni saqlaydi", "Which formats keep the LSBs"),
    minutes: 6,
    intro: t(
      "PNG va BMP piksellarni aynan saqlaydi (lossless) — LSB xabari omon qoladi. JPEG esa rasmni siqishda piksellarni biroz o‘zgartiradi (lossy) — LSB’dagi xabar yo‘qoladi. Ijtimoiy tarmoqlar ham rasmlarni qayta siqadi.",
      "PNG and BMP store pixels exactly (lossless), so an LSB message survives. JPEG nudges pixels slightly as it compresses (lossy), so a message in the LSBs is lost. Social networks recompress pictures too.",
    ),
    analogy: t(
      "Qog‘oz xatni nusxa ko‘chirish mashinasidan o‘tkazish: ko‘zga bir xil, lekin nozik izlar yo‘qoladi.",
      "Running a letter through a photocopier: it looks the same, but the faint marks are gone.",
    ),
    theory: [
      t(
        "JPEG uchun boshqa usullar bor (masalan, DCT koeffitsiyentlariga yashirish — steghide, F5).",
        "JPEG has its own methods (hiding in DCT coefficients — steghide, F5).",
      ),
    ],
    task: t(
      "LSB xabari har bir holatda saqlanadimi?",
      "Does an LSB message survive each case?",
    ),
    hint: t(
      "Lossless — saqlanadi; lossy yoki qayta siqish — yo‘qoladi.",
      "Lossless keeps it; lossy or recompression loses it.",
    ),
    widget: {
      type: "sort",
      buckets: [
        { id: "kept", label: t("Saqlanadi", "Survives") },
        { id: "lost", label: t("Yo‘qoladi", "Lost") },
      ],
      items: [
        { label: t("PNG sifatida saqlash", "Saving as PNG"), bucket: "kept" },
        { label: t("BMP sifatida saqlash", "Saving as BMP"), bucket: "kept" },
        {
          label: t(
            "Faylni o‘zgartirmasdan email’da yuborish",
            "Emailing the file untouched",
          ),
          bucket: "kept",
        },
        { label: t("JPEG sifatida saqlash", "Saving as JPEG"), bucket: "lost" },
        {
          label: t(
            "Ijtimoiy tarmoqqa yuklash",
            "Uploading to a social network",
          ),
          bucket: "lost",
        },
        {
          label: t("Rasmni kichraytirish (resize)", "Resizing the picture"),
          bucket: "lost",
        },
      ],
    },
  },
  {
    id: 7,
    group: FIND,
    title: t("LSB’ni aniqlash", "Detecting LSB hiding"),
    minutes: 6,
    intro: t(
      "Ko‘z sezmasa ham, statistika sezadi. Tabiiy rasmlarda qo‘shni qiymatlar juftliklari (2k va 2k+1) har xil chastotada uchraydi; LSB yashirish ularni tenglashtiradi. Chi-kvadrat testi va RS-tahlil aynan shuni o‘lchaydi.",
      "The eye may not notice, but statistics do. In natural pictures, pairs of neighbouring values (2k and 2k+1) occur at different rates; LSB hiding evens them out. The chi-square test and RS analysis measure exactly that.",
    ),
    analogy: t(
      "Tasodifan tashlangan tangalar — har doim ham aniq yarmi gerb emas; “juda teng” natija shubhali.",
      "Coins tossed by chance aren’t always exactly half heads; a result that is “too even” is suspicious.",
    ),
    theory: [
      t(
        "Asl rasm topilsa, eng oson yo‘l — ikkalasini piksel-ma-piksel solishtirish.",
        "If the original can be found, the easiest way is to compare the two pixel by pixel.",
      ),
    ],
    task: t("Savollarga javob bering.", "Answer the questions."),
    hint: t("Statistika va asl nusxa.", "Statistics and the original."),
    widget: {
      type: "quiz",
      questions: [
        {
          ask: t(
            "LSB yashirishni statistik jihatdan nima fosh qiladi?",
            "What gives LSB hiding away statistically?",
          ),
          options: [
            t(
              "2k va 2k+1 qiymatlar juftliklari g‘ayritabiiy darajada tenglashadi",
              "Pairs of values 2k and 2k+1 become unnaturally even",
            ),
            t("Rasm qorayadi", "The picture gets darker"),
            t("Fayl nomi o‘zgaradi", "The file name changes"),
          ],
          answer: 0,
          explain: t(
            "Chi-kvadrat testi shu tenglikni o‘lchaydi.",
            "The chi-square test measures that evenness.",
          ),
        },
        {
          ask: t(
            "Shubhali rasmning asl nusxasi internetda topildi. Eng oson tekshiruv?",
            "The suspect picture’s original is found online. The easiest check?",
          ),
          options: [
            t(
              "Ikkalasini piksel-ma-piksel solishtirish",
              "Compare the two pixel by pixel",
            ),
            t("Rasmga diqqat bilan qarash", "Look at it closely"),
            t("Fayl nomini solishtirish", "Compare the file names"),
          ],
          answer: 0,
          explain: t(
            "Farq qilgan piksellar — yashirilgan ma’lumot joyi.",
            "The pixels that differ are where the data was hidden.",
          ),
        },
      ],
    },
  },
  {
    id: 8,
    group: FIND,
    title: t("Yakuniy savollar", "Final questions"),
    minutes: 6,
    intro: t(
      "Modulni takrorlaymiz: piksel va bitlar, LSB, xabar o‘qish, sig‘im, bit tekisliklari, formatlar va aniqlash.",
      "A review of the module: pixels and bits, the LSB, reading a message, capacity, bit planes, formats and detection.",
    ),
    analogy: t(
      "Rasm — ming so‘z; ba’zan esa yashirin ming bitta.",
      "A picture is worth a thousand words — and sometimes a thousand hidden bits.",
    ),
    theory: [
      t(
        "Keyingi modul — metama’lumotlar: EXIF, GPS va hujjat xususiyatlari.",
        "The next module is metadata: EXIF, GPS and document properties.",
      ),
    ],
    task: t(
      "Barcha savollarga to‘g‘ri javob bering.",
      "Answer every question correctly.",
    ),
    hint: t(
      "LSB — 1 qadam; JPEG — LSB’ni buzadi.",
      "The LSB is 1 step; JPEG wrecks LSBs.",
    ),
    widget: {
      type: "quiz",
      questions: [
        {
          ask: t(
            "200 ning LSB’ini o‘zgartirsangiz, qanday qiymat chiqadi?",
            "Flip the LSB of 200 and what value do you get?",
          ),
          options: [code("201"), code("72"), code("100")],
          answer: 0,
          explain: t(
            "200 = 11001000; oxirgi bit 1 bo‘lsa — 201.",
            "200 is 11001000; set the last bit and it is 201.",
          ),
        },
        {
          ask: t(
            "Qaysi formatda LSB xabari saqlanadi?",
            "Which format keeps an LSB message?",
          ),
          options: [code("PNG"), code("JPEG"), code("WebP (lossy)")],
          answer: 0,
          explain: t(
            "PNG lossless — piksellar aynan saqlanadi.",
            "PNG is lossless — pixels are stored exactly.",
          ),
        },
        {
          ask: t(
            "Bit tekisligida harflar ko‘rindi. Bu nimani bildiradi?",
            "Letters show up in a bit plane. What does it mean?",
          ),
          options: [
            t(
              "U bitga ataylab ma’lumot yozilgan",
              "Data was written into that bit on purpose",
            ),
            t("Rasm sifatsiz", "The picture is low quality"),
            t("Monitor buzilgan", "The monitor is broken"),
          ],
          answer: 0,
          explain: t(
            "Tabiiy rasmning eng kichik biti shovqinga o‘xshaydi.",
            "A natural picture’s lowest bit looks like noise.",
          ),
        },
        {
          ask: t(
            "8 ta pikselning qizil LSB’lari: 01001000. Bu qaysi harf?",
            "The red LSBs of 8 pixels read 01001000. Which letter is it?",
          ),
          options: [code("H"), code("A"), code("Z")],
          answer: 0,
          explain: t("01001000 = 72 = “H”.", "01001000 is 72, which is “H”."),
        },
      ],
    },
  },
];
