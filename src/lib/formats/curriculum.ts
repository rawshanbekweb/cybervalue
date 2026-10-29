// Academy Intermediate · Steganography, module 4: Audio and file formats.
// The lessons use ./tools.ts: a JPEG with a ZIP after its end marker and a
// sound whose spectrogram spells a word.
import type { CommonWidget, Lesson, Text } from "../anim-lab/types";

export type Widget =
  CommonWidget | { type: "appended" } | { type: "spectrogram" };

export const PROGRESS_KEY = "cybervalue:formats:progress:v1";

const t = (uz: string, en: string): Text => ({ uz, en });
const code = (s: string): Text => ({ uz: s, en: s });

const FILES = t("Fayl ichida", "Inside a file");
const SOUND = t("Ovoz", "Sound");
const TOOLS = t("Vositalar", "Tools");

export const LESSONS: Lesson<Widget>[] = [
  {
    id: 1,
    group: FILES,
    title: t("binwalk nimani topadi", "What binwalk finds"),
    minutes: 6,
    intro: t(
      "binwalk faylni boshidan oxirigacha o‘qib, ichidagi tanish imzolarni qidiradi. Oddiy rasmda bitta natija bo‘ladi — JPEG. Ikkinchi natija chiqsa, fayl ichida yana bir fayl bor.",
      "binwalk reads a file from start to end looking for familiar signatures inside it. An ordinary picture gives one result — the JPEG. A second result means there is another file inside.",
    ),
    analogy: t(
      "Matryoshka: bitta qo‘g‘irchoq ichida yana biri.",
      "A matryoshka doll: one doll inside another.",
    ),
    theory: [
      t(
        "binwalk -e topilganlarini alohida papkaga chiqarib oladi.",
        "binwalk -e extracts whatever it finds into a separate folder.",
      ),
    ],
    task: t(
      "Chiqishning har bir qismini bosib, nima ekanini o‘qing.",
      "Click each part of the output and read what it is.",
    ),
    hint: t("Hammasi bo‘lib to‘rtta qism.", "Four parts in all."),
    widget: {
      type: "anatomy",
      lines: [
        [{ text: "$ binwalk cat.jpg" }],
        [{ text: "DECIMAL   HEXADECIMAL   DESCRIPTION", id: "head" }],
        [
          {
            text: "0         0x0           JPEG image data, JFIF standard 1.01",
            id: "jpeg",
          },
        ],
        [
          { text: "48203     0xBC4B", id: "offset" },
          { text: "        " },
          { text: "Zip archive data, name: plan.txt", id: "zip" },
        ],
      ],
      parts: [
        {
          id: "head",
          title: t("Ustunlar", "Columns"),
          body: t(
            "Fayl boshidan hisoblangan joy (o‘nlik va o‘n oltilik) va topilgan narsa.",
            "The position from the start of the file (in decimal and hex) and what was found.",
          ),
        },
        {
          id: "jpeg",
          title: t("JPEG — 0 dan", "JPEG — at 0"),
          body: t(
            "Fayl rasm bilan boshlanadi: FF D8 FF E0 … JFIF. Bu kutilgan natija.",
            "The file starts as a picture: FF D8 FF E0 … JFIF. That is expected.",
          ),
        },
        {
          id: "offset",
          title: t("48203-baytda", "At byte 48203"),
          body: t(
            "Rasm FF D9 bilan tugaydi — undan keyingi bayt shu yerda.",
            "The picture ends with FF D9 — this is the byte right after it.",
          ),
        },
        {
          id: "zip",
          title: t("Yashirin ZIP", "A hidden ZIP"),
          body: t(
            "Rasm ko‘ruvchilar FF D9 dan keyingi hamma narsani e’tiborsiz qoldiradi — shuning uchun rasm oddiy ochiladi.",
            "Picture viewers ignore everything after FF D9 — so the picture opens normally.",
          ),
        },
      ],
    },
  },
  {
    id: 2,
    group: FILES,
    title: t("Rasmdan keyin nima bor", "What comes after the picture"),
    minutes: 10,
    intro: t(
      "JPEG har doim FF D8 bilan boshlanadi va FF D9 bilan tugaydi. Bu belgidan keyin yozilgan narsa rasm ko‘ruvchiga ko‘rinmaydi, lekin faylning ichida turadi. Eng oddiy usul: copy /b cat.jpg+plan.zip out.jpg (Windows) yoki cat cat.jpg plan.zip > out.jpg (Linux).",
      "A JPEG always starts with FF D8 and ends with FF D9. Whatever is written after that marker doesn’t show in a picture viewer, but it is still in the file. The simplest trick: copy /b cat.jpg+plan.zip out.jpg (Windows) or cat cat.jpg plan.zip > out.jpg (Linux).",
    ),
    analogy: t(
      "Kitobning oxirgi sahifasidan keyin muqovaga yopishtirilgan qo‘shimcha varaq.",
      "An extra sheet glued inside the back cover, after the book’s last page.",
    ),
    theory: [
      t(
        "ZIP o‘z mundarijasini fayl oxirida saqlaydi — shuning uchun unzip bunday faylni ham ochadi.",
        "A ZIP keeps its directory at the end of the file — which is why unzip opens such a file too.",
      ),
    ],
    task: t(
      "Rasm qayerda tugaydi va undan keyin qanday fayl yashiringan?",
      "Where does the picture end, and what kind of file is hidden after it?",
    ),
    hint: t(
      "FF D9 ni qidiring; 50 4B 03 04 — “PK”, ZIP imzosi.",
      "Look for FF D9; 50 4B 03 04 is “PK”, the ZIP signature.",
    ),
    widget: { type: "appended" },
  },
  {
    id: 3,
    group: FILES,
    title: t("Polyglot fayllar", "Polyglot files"),
    minutes: 6,
    intro: t(
      "Polyglot — bir vaqtda ikki xil fayl sifatida to‘g‘ri o‘qiladigan fayl: rasm ko‘ruvchida rasm, arxivatorda arxiv. Hujumchilar bundan filtrlardan o‘tish uchun foydalanadi: “bu rasm” deb tekshirilgan fayl aslida skriptni ham olib yuradi.",
      "A polyglot is a file that reads correctly as two different types at once: a picture in a viewer, an archive in an unzipper. Attackers use them to slip past filters: a file checked as “a picture” also carries a script.",
    ),
    analogy: t(
      "Ikki tomonlama kitob: bir tomondan o‘qisangiz ertak, teskari ag‘darsangiz — boshqa kitob.",
      "A flip book: read it one way and it is a fairy tale, turn it over and it is another book.",
    ),
    theory: [
      t(
        "Yuklangan fayllarni faqat imzo bo‘yicha emas, qayta kodlab (re-encode) tekshirish — qo‘shimcha ma’lumotni yo‘q qiladi.",
        "Re-encoding uploaded pictures, not just checking their signature, strips whatever was appended.",
      ),
    ],
    task: t("Savollarga javob bering.", "Answer the questions."),
    hint: t(
      "Ko‘ruvchi FF D9 da to‘xtaydi; unzip oxiridan o‘qiydi.",
      "A viewer stops at FF D9; unzip reads from the end.",
    ),
    widget: {
      type: "quiz",
      questions: [
        {
          ask: t(
            "Oxiriga ZIP qo‘shilgan JPEG nega oddiy rasm sifatida ochiladi?",
            "Why does a JPEG with a ZIP on the end still open as a normal picture?",
          ),
          options: [
            t(
              "Ko‘ruvchi FF D9 dan keyingi baytlarni o‘qimaydi",
              "The viewer doesn’t read past FF D9",
            ),
            t("ZIP rasmni shifrlaydi", "The ZIP encrypts the picture"),
            t("Ochilmaydi", "It doesn’t open"),
          ],
          answer: 0,
          explain: t(
            "Qo‘shimcha ma’lumot ko‘rinmaydi, lekin fayl hajmi kattalashadi.",
            "The extra data doesn’t show, but the file grows.",
          ),
        },
        {
          ask: t(
            "Saytga yuklangan rasmlardan bunday qo‘shimchalarni qanday olib tashlash mumkin?",
            "How can a website strip such extras from uploaded pictures?",
          ),
          options: [
            t(
              "Rasmni qayta kodlab (re-encode) saqlash",
              "Re-encode the picture before storing it",
            ),
            t("Fayl nomini o‘zgartirish", "Rename the file"),
            t("Kengaytmani tekshirish", "Check the extension"),
          ],
          answer: 0,
          explain: t(
            "Qayta kodlash faqat piksellarni saqlaydi.",
            "Re-encoding keeps only the pixels.",
          ),
        },
      ],
    },
  },
  {
    id: 4,
    group: SOUND,
    title: t("Spektrogrammadagi xabar", "A message in a spectrogram"),
    minutes: 10,
    intro: t(
      "Ovozni ikki xil ko‘rish mumkin: to‘lqin shakli (vaqt bo‘yicha balandlik) va spektrogramma (vaqt bo‘yicha har bir chastota kuchi). Musiqachilar va CTF mualliflari baland chastotalarga rasm yoki so‘z “chizadi” — quloqqa shovqin, spektrogrammada aniq yozuv.",
      "Sound can be seen two ways: the waveform (loudness over time) and the spectrogram (the strength of each frequency over time). Musicians and CTF authors “draw” pictures or words into the high frequencies — noise to the ear, plain writing in a spectrogram.",
    ),
    analogy: t(
      "Ko‘rinmas siyoh: oddiy ko‘zga — bo‘sh qog‘oz, ultrabinafsha nurda — matn.",
      "Invisible ink: a blank page to the eye, text under ultraviolet light.",
    ),
    theory: [
      t(
        "Audacity va Sonic Visualiser’da spektrogramma ko‘rinishini yoqish bir necha soniya.",
        "In Audacity or Sonic Visualiser, switching on the spectrogram view takes seconds.",
      ),
    ],
    task: t(
      "Ovoz faylidagi yashirin so‘zni toping.",
      "Find the word hidden in the sound file.",
    ),
    hint: t(
      "To‘lqin shaklida emas — spektrogrammada.",
      "Not in the waveform — in the spectrogram.",
    ),
    widget: { type: "spectrogram" },
  },
  {
    id: 5,
    group: SOUND,
    title: t("Ovozga yashirish usullari", "Ways to hide in sound"),
    minutes: 6,
    intro: t(
      "Ovoz ham rasm kabi raqamlar ketma-ketligi. Spektrogramma rasmi va Morze signallari ko‘zga ko‘rinadi; WAV namunalarining LSB’i va steghide esa maxsus vositasiz topilmaydi.",
      "Sound, like a picture, is a run of numbers. Spectrogram pictures and Morse tones can be seen; the LSBs of WAV samples or steghide can’t be found without special tools.",
    ),
    analogy: t(
      "Ba’zi yashirin narsalar xonani yoritsangiz ko‘rinadi, ba’zilari esa faqat devorni ochganda.",
      "Some hidden things show when you switch the light on; others only when you open the wall.",
    ),
    theory: [
      t(
        "MP3 kabi lossy siqish LSB’larni buzadi — xuddi JPEG rasmda bo‘lgani kabi.",
        "Lossy compression such as MP3 wrecks LSBs — just as JPEG does with pictures.",
      ),
    ],
    task: t(
      "Har bir usul spektrogrammada ko‘rinadimi?",
      "Does each method show in a spectrogram?",
    ),
    hint: t(
      "Chastotadagi naqsh — ko‘rinadi; bitlardagi — yo‘q.",
      "A pattern in frequency shows; one in the bits doesn’t.",
    ),
    widget: {
      type: "sort",
      buckets: [
        {
          id: "seen",
          label: t("Spektrogrammada ko‘rinadi", "Shows in a spectrogram"),
        },
        { id: "tools", label: t("Boshqa vosita kerak", "Needs other tools") },
      ],
      items: [
        {
          label: t(
            "Baland chastotaga chizilgan so‘z",
            "A word drawn in high frequencies",
          ),
          bucket: "seen",
        },
        {
          label: t(
            "Juda baland ovozdagi Morze kodi",
            "Morse code in a very high tone",
          ),
          bucket: "seen",
        },
        {
          label: t(
            "Chastotalarga chizilgan QR kod",
            "A QR code drawn in the frequencies",
          ),
          bucket: "seen",
        },
        {
          label: t(
            "WAV namunalarining LSB’idagi matn",
            "Text in the LSBs of WAV samples",
          ),
          bucket: "tools",
        },
        {
          label: t(
            "steghide bilan WAV’ga yashirilgan fayl",
            "A file hidden in a WAV with steghide",
          ),
          bucket: "tools",
        },
        {
          label: t("WAV oxiriga qo‘shilgan ZIP", "A ZIP appended to a WAV"),
          bucket: "tools",
        },
      ],
    },
  },
  {
    id: 6,
    group: TOOLS,
    title: t("strings va file", "strings and file"),
    minutes: 6,
    intro: t(
      "Birinchi qadamda qimmat vosita kerak emas. file buyrug‘i faylning haqiqiy turini imzodan aytadi; strings esa binar fayl ichidagi o‘qiladigan matnlarni chiqaradi — parollar, URL’lar, “flag{…}” kabi satrlar ko‘pincha shu bilan topiladi.",
      "The first step needs no fancy tool. The file command tells a file’s real type from its signature; strings pulls the readable text out of a binary — passwords, URLs and “flag{…}” lines are often found that way.",
    ),
    analogy: t(
      "Qutini ochishdan oldin yorlig‘ini o‘qish va silkitib ko‘rish.",
      "Reading the label and shaking the box before opening it.",
    ),
    theory: [
      t(
        "strings -n 8 faqat 8 va undan uzun satrlarni ko‘rsatadi — shovqin kamayadi.",
        "strings -n 8 shows only runs of 8 or more characters — less noise.",
      ),
    ],
    task: t("Savollarga javob bering.", "Answer the questions."),
    hint: t(
      "file — tur; strings — matn; binwalk — ichidagi fayllar.",
      "file: the type; strings: the text; binwalk: the files inside.",
    ),
    widget: {
      type: "quiz",
      questions: [
        {
          ask: t(
            "report.pdf aslida nima ekanini qaysi buyruq tez aytadi?",
            "Which command quickly tells what report.pdf really is?",
          ),
          options: [
            code("file report.pdf"),
            code("ls report.pdf"),
            code("cd report.pdf"),
          ],
          answer: 0,
          explain: t(
            "file kengaytmaga emas, imzoga qaraydi.",
            "file looks at the signature, not the extension.",
          ),
        },
        {
          ask: t(
            "Binar fayl ichidagi o‘qiladigan matnlarni qaysi buyruq chiqaradi?",
            "Which command pulls the readable text out of a binary file?",
          ),
          options: [code("strings"), code("chmod"), code("ping")],
          answer: 0,
          explain: t(
            "U ketma-ket o‘qiladigan belgilarni topadi.",
            "It finds runs of printable characters.",
          ),
        },
      ],
    },
  },
  {
    id: 7,
    group: TOOLS,
    title: t("Qaysi vosita qachon", "Which tool when"),
    minutes: 6,
    intro: t(
      "Steganaliz — tartibli qidiruv: avval file va exiftool, keyin strings, binwalk, rasm uchun zsteg/stegsolve, ovoz uchun spektrogramma, parol bilan yashirilgan bo‘lsa — steghide va lug‘at.",
      "Steganalysis is a methodical search: file and exiftool first, then strings, binwalk, zsteg/stegsolve for pictures, a spectrogram for sound, and steghide with a wordlist if a passphrase was used.",
    ),
    analogy: t(
      "Yo‘qolgan kalitni qidirish: avval cho‘ntaklar, keyin sumka, keyin mashina.",
      "Looking for lost keys: pockets first, then the bag, then the car.",
    ),
    theory: [
      t(
        "Har bir topilma (yashirin fayl, satr) yangi qidiruvning boshlanishi bo‘lishi mumkin.",
        "Each find (a hidden file, a string) may start a new search.",
      ),
    ],
    task: t("Savollarga javob bering.", "Answer the questions."),
    hint: t(
      "Rasm piksellari — zsteg; fayl ichidagi fayl — binwalk.",
      "Picture pixels: zsteg; a file inside a file: binwalk.",
    ),
    widget: {
      type: "quiz",
      questions: [
        {
          ask: t(
            "PNG piksellarining LSB’larini avtomatik tekshiradigan vosita?",
            "Which tool checks a PNG’s pixel LSBs automatically?",
          ),
          options: [code("zsteg"), code("binwalk"), code("strings")],
          answer: 0,
          explain: t(
            "zsteg barcha kanal va bit tartiblarini sinaydi.",
            "zsteg tries every channel and bit order.",
          ),
        },
        {
          ask: t(
            "Fayl ichiga qo‘shilgan boshqa faylni ajratib olish uchun?",
            "To extract another file embedded inside a file?",
          ),
          options: [code("binwalk -e"), code("exiftool"), code("file")],
          answer: 0,
          explain: t(
            "-e topilganlarini alohida papkaga chiqaradi.",
            "-e extracts what it finds into a folder.",
          ),
        },
      ],
    },
  },
  {
    id: 8,
    group: TOOLS,
    title: t("Yakuniy savollar", "Final questions"),
    minutes: 6,
    intro: t(
      "Modulni takrorlaymiz: binwalk, fayl oxiridagi ma’lumot, polyglot, spektrogramma, ovozga yashirish va vositalar.",
      "A review of the module: binwalk, data after the end, polyglots, spectrograms, hiding in sound and the tools.",
    ),
    analogy: t(
      "Fayl — uy: xonalar, yerto‘la va chordoq; har birini alohida tekshirish kerak.",
      "A file is a house: rooms, a cellar and an attic, each to be checked in turn.",
    ),
    theory: [
      t(
        "Keyingi modul — steganaliz: yashirin narsa borligini belgilardan aniqlash.",
        "The next module is steganalysis: telling from the signs that something is hidden.",
      ),
    ],
    task: t(
      "Barcha savollarga to‘g‘ri javob bering.",
      "Answer every question correctly.",
    ),
    hint: t(
      "FF D9 — JPEG oxiri; PK — ZIP.",
      "FF D9 ends a JPEG; PK starts a ZIP.",
    ),
    widget: {
      type: "quiz",
      questions: [
        {
          ask: t(
            "JPEG qaysi baytlar bilan tugaydi?",
            "Which bytes end a JPEG?",
          ),
          options: [code("FF D9"), code("FF D8"), code("50 4B")],
          answer: 0,
          explain: t(
            "FF D8 — boshi, FF D9 — oxiri.",
            "FF D8 starts it, FF D9 ends it.",
          ),
        },
        {
          ask: t(
            "50 4B 03 04 qaysi fayl imzosi?",
            "Which file signature is 50 4B 03 04?",
          ),
          options: [code("ZIP"), code("PDF"), code("PNG")],
          answer: 0,
          explain: t(
            "ASCII’da “PK” — Phil Katz, ZIP muallifi.",
            "“PK” in ASCII — Phil Katz, who created ZIP.",
          ),
        },
        {
          ask: t(
            "Ovozga chizilgan so‘zni qanday ko‘rish mumkin?",
            "How can you see a word drawn into a sound?",
          ),
          options: [
            t("Spektrogrammada", "In a spectrogram"),
            t("To‘lqin shaklida", "In the waveform"),
            t("Fayl nomida", "In the file name"),
          ],
          answer: 0,
          explain: t(
            "Spektrogramma chastotalarni vaqt bo‘yicha ko‘rsatadi.",
            "A spectrogram shows frequencies over time.",
          ),
        },
        {
          ask: t(
            "Fayl hajmi rasm o‘lchamiga nisbatan juda katta. Birinchi tekshiruv?",
            "A file is far bigger than its picture size suggests. The first check?",
          ),
          options: [
            code("binwalk"),
            t("Rasmni kattalashtirish", "Zoom into the picture"),
            t("Faylni o‘chirish", "Delete the file"),
          ],
          answer: 0,
          explain: t(
            "Ortiqcha hajm — ichida yana nimadir borligi belgisi.",
            "Extra size hints that something else is inside.",
          ),
        },
      ],
    },
  },
];
