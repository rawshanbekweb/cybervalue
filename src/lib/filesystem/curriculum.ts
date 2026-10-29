// Academy Intermediate · Digital forensics, module 2: File systems. The
// lessons use ./tools.ts: MACB timestamps, file signatures for carving, and
// a timeline built from sources in different time zones.
import type { CommonWidget, Lesson, Text } from "../anim-lab/types";

export type Widget = CommonWidget | { type: "macb" } | { type: "timeline" };

export const PROGRESS_KEY = "cybervalue:filesystem:progress:v1";

const t = (uz: string, en: string): Text => ({ uz, en });
const code = (s: string): Text => ({ uz: s, en: s });

const STAMPS = t("Vaqt belgilari", "Timestamps");
const DELETED = t("O‘chirilgan fayllar", "Deleted files");
const TIMELINE = t("Xronologiya", "Timelines");

export const LESSONS: Lesson<Widget>[] = [
  {
    id: 1,
    group: STAMPS,
    title: t("stat nimani aytadi", "What stat tells you"),
    minutes: 6,
    intro: t(
      "Har bir fayl haqidagi ma’lumot (metama’lumot) inode’da saqlanadi: hajmi, egasi, ruxsatlari va to‘rtta vaqt belgisi — MACB: Modify (mazmun o‘zgardi), Access (o‘qildi), Change (inode o‘zgardi: ruxsat, nom, egasi) va Birth (yaratildi). Linux’da ularni stat buyrug‘i ko‘rsatadi.",
      "What the system knows about a file (its metadata) lives in its inode: size, owner, permissions and four timestamps — MACB: Modify (content changed), Access (read), Change (inode changed: permissions, name, owner) and Birth (created). On Linux the stat command shows them.",
    ),
    analogy: t(
      "Kutubxona kitobining kartochkasi: qachon kelgani, oxirgi marta kim olgani, qachon ta’mirlangani — kitobning o‘zini ochmasdan.",
      "A library book’s card: when it arrived, when it was last borrowed, when it was repaired — without opening the book.",
    ),
    theory: [
      t(
        "Change ≠ yaratilish: ko‘pchilik ctime’ni “creation time” deb adashadi. Yaratilish vaqti — Birth (crtime).",
        "Change is not creation: many people mistake ctime for “creation time”. Creation is Birth (crtime).",
      ),
    ],
    task: t(
      "stat chiqishining har bir qismini bosib, nima ekanini o‘qing.",
      "Click each part of the stat output and read what it is.",
    ),
    hint: t("Hammasi bo‘lib oltita qism.", "Six parts in all."),
    widget: {
      type: "anatomy",
      lines: [
        [{ text: "  File: report.xlsx" }],
        [
          { text: "  Size: 48213", id: "size" },
          { text: "   " },
          { text: "Inode: 1310742", id: "inode" },
        ],
        [{ text: "Access: 2026-10-03 09:41:17 +0500", id: "a" }],
        [{ text: "Modify: 2026-10-02 18:05:44 +0500", id: "m" }],
        [{ text: "Change: 2026-10-02 18:05:44 +0500", id: "c" }],
        [{ text: " Birth: 2026-09-14 11:20:03 +0500", id: "b" }],
      ],
      parts: [
        {
          id: "size",
          title: t("Hajm", "Size"),
          body: t(
            "Baytlarda. Kutilmaganda katta yoki kichik fayl — e’tibor berish kerak.",
            "In bytes. A file unexpectedly large or small is worth a look.",
          ),
        },
        {
          id: "inode",
          title: t("Inode raqami", "Inode number"),
          body: t(
            "Fayl tizimidagi yozuv raqami. Nom o‘zgarsa ham, inode o‘sha qoladi.",
            "The record’s number in the file system. It stays the same when the name changes.",
          ),
        },
        {
          id: "a",
          title: t("Access — oxirgi o‘qilgan", "Access — last read"),
          body: t(
            "Ko‘p tizimlar uni har o‘qishda emas, sutkada bir marta yangilaydi (relatime) — ehtiyotkorlik bilan ishoning.",
            "Many systems update it at most once a day (relatime), not on every read — trust it with care.",
          ),
        },
        {
          id: "m",
          title: t("Modify — mazmun o‘zgargan", "Modify — content changed"),
          body: t(
            "Faylga yozilgan oxirgi vaqt.",
            "The last time data was written to the file.",
          ),
        },
        {
          id: "c",
          title: t("Change — inode o‘zgargan", "Change — inode changed"),
          body: t(
            "Mazmun, ruxsat, nom yoki egasi o‘zgarganda yangilanadi. Uni oddiy buyruq bilan orqaga qaytarib bo‘lmaydi.",
            "Updated when the content, permissions, name or owner change. Ordinary commands can’t set it back.",
          ),
        },
        {
          id: "b",
          title: t("Birth — yaratilgan", "Birth — created"),
          body: t(
            "Fayl shu fayl tizimida paydo bo‘lgan vaqt. ext4, NTFS va APFS saqlaydi; eski FAT esa faqat sanani.",
            "When the file appeared on this file system. ext4, NTFS and APFS keep it; old FAT keeps only the date.",
          ),
        },
      ],
    },
  },
  {
    id: 2,
    group: STAMPS,
    title: t(
      "Qaysi amal qaysi belgini o‘zgartiradi",
      "Which action changes which stamp",
    ),
    minutes: 10,
    intro: t(
      "Tergovchi vaqt belgilaridan nima bo‘lganini “orqaga” o‘qiydi. Buning uchun har bir amal qaysi belgini o‘zgartirishini bilish kerak: fayl o‘qilsa, mazmuni yozilsa, ruxsati o‘zgartirilsa yoki nomi o‘zgartirilsa.",
      "An investigator reads what happened “backwards” from the timestamps. That takes knowing which stamp each action changes: reading a file, writing its content, changing its permissions, renaming it.",
    ),
    analogy: t(
      "Qor ustidagi izlar: oyoq izi kimdir o‘tganini, g‘ildirak izi mashina o‘tganini aytadi.",
      "Tracks in snow: footprints say someone walked by, tyre tracks that a car did.",
    ),
    theory: [
      t(
        "Bu jadval ext4’da strictatime uchun. relatime (ko‘p tizimlarda standart) bilan atime har o‘qishda yangilanmaydi.",
        "This table is for ext4 with strictatime. With relatime (the default on many systems) atime is not updated on every read.",
      ),
    ],
    task: t(
      "Har bir amal uchun o‘zgaradigan vaqt belgilarini belgilang.",
      "Tick the timestamps each action changes.",
    ),
    hint: t(
      "O‘qish — A; yozish — M va C; chmod va mv — faqat C.",
      "Read: A; write: M and C; chmod and mv: C only.",
    ),
    widget: { type: "macb" },
  },
  {
    id: 3,
    group: DELETED,
    title: t("O‘chirilgan fayl qayerga ketadi", "Where a deleted file goes"),
    minutes: 6,
    intro: t(
      "Faylni o‘chirish uning ma’lumotini o‘chirmaydi: fayl tizimi faqat nomini olib tashlab, bloklarni “bo‘sh” deb belgilaydi. Ma’lumot yangi fayl ustidan yozilguncha diskda qoladi — shuning uchun disk imkon qadar tez tasvirga olinadi. SSD’da esa TRIM bo‘sh bloklarni tez orada haqiqatan tozalaydi.",
      "Deleting a file doesn’t erase its data: the file system only removes the name and marks the blocks “free”. The data stays on the disk until a new file is written over it — which is why the disk is imaged as soon as possible. On an SSD, TRIM soon wipes free blocks for real.",
    ),
    analogy: t(
      "Kitobning mundarijasidan bobni o‘chirish: sahifalar hali kitobda, faqat ularni topish qiyinroq.",
      "Crossing a chapter out of a book’s contents page: the pages are still in the book, just harder to find.",
    ),
    theory: [
      t(
        "Slack space — fayl oxiri va blok oxiri orasidagi joy; unda eski ma’lumot qoldiqlari bo‘lishi mumkin.",
        "Slack space is the gap between the end of a file and the end of its block; it may hold scraps of older data.",
      ),
    ],
    task: t("Savollarga javob bering.", "Answer the questions."),
    hint: t(
      "O‘chirish — nomni olib tashlash; ustidan yozish — ma’lumotni yo‘qotish.",
      "Deleting removes the name; overwriting loses the data.",
    ),
    widget: {
      type: "quiz",
      questions: [
        {
          ask: t(
            "Gumondor HDD’dagi faylni o‘chirib, savatni tozaladi. Fayl tiklanadimi?",
            "A suspect deleted a file on an HDD and emptied the bin. Can it be recovered?",
          ),
          options: [
            t(
              "Ko‘pincha ha — bloklar ustidan yozilmagan bo‘lsa",
              "Often yes — if the blocks haven’t been overwritten",
            ),
            t("Yo‘q, hech qachon", "No, never"),
            t("Faqat parol bilan", "Only with a password"),
          ],
          answer: 0,
          explain: t(
            "Ma’lumot yangi fayl yozilguncha diskda qoladi.",
            "The data stays on the disk until a new file is written there.",
          ),
        },
        {
          ask: t(
            "Nega SSD’dan o‘chirilgan faylni tiklash qiyinroq?",
            "Why is a deleted file harder to recover from an SSD?",
          ),
          options: [
            t(
              "TRIM bo‘sh bloklarni tez orada tozalaydi",
              "TRIM soon wipes the free blocks",
            ),
            t("SSD fayllarni shifrlaydi", "An SSD encrypts files"),
            t("SSD’da fayllar yo‘q", "SSDs have no files"),
          ],
          answer: 0,
          explain: t(
            "Shuning uchun SSD’ni iloji boricha tez tasvirga olish kerak.",
            "That is why an SSD is imaged as quickly as possible.",
          ),
        },
        {
          ask: t(
            "Disk tasviri nega o‘chirilgan fayllarni ham saqlaydi?",
            "Why does a disk image keep deleted files too?",
          ),
          options: [
            t(
              "U bo‘sh deb belgilangan bloklarni ham bit-ma-bit nusxalaydi",
              "It copies the blocks marked free bit for bit as well",
            ),
            t("U savatni tiklaydi", "It restores the bin"),
            t("Saqlamaydi", "It doesn’t"),
          ],
          answer: 0,
          explain: t(
            "Fayl nusxasi bo‘sh bloklarni tashlab ketadi; tasvir — yo‘q.",
            "A file copy leaves free blocks behind; an image doesn’t.",
          ),
        },
      ],
    },
  },
  {
    id: 4,
    group: DELETED,
    title: t(
      "Fayllarni birinchi baytlaridan tanish",
      "Knowing files by their first bytes",
    ),
    minutes: 8,
    intro: t(
      "Fayl nomi va kengaytmasi yo‘qolgan bo‘lsa ham, uning turi birinchi baytlaridan (“magic number”) bilinadi. Carving vositalari (foremost, PhotoRec) bo‘sh joydan aynan shu imzolarni qidirib, fayllarni tiklaydi. Imzo kengaytma bilan mos kelmasa — yashirishga urinish belgisi.",
      "Even with the name and extension gone, a file’s type shows in its first bytes (its “magic number”). Carving tools (foremost, PhotoRec) search free space for exactly these signatures to recover files. A signature that doesn’t match the extension is a sign of hiding.",
    ),
    analogy: t(
      "Yorlig‘i yirtilgan konserva bankasi: shaklidan va qopqog‘idan ichida nima borligini taxmin qilasiz.",
      "A tin with its label torn off: you tell what is inside from its shape and lid.",
    ),
    theory: [
      t(
        "DOCX, XLSX va APK aslida ZIP arxivlar — shuning uchun ular ham 50 4B 03 04 bilan boshlanadi.",
        "DOCX, XLSX and APK are really ZIP archives — so they start with 50 4B 03 04 too.",
      ),
    ],
    task: t(
      "Har bir boshlanishni fayl turiga moslang.",
      "Match each start of a file to its type.",
    ),
    hint: t(
      "25 50 44 46 — “%PDF”; 4D 5A — “MZ”.",
      "25 50 44 46 is “%PDF”; 4D 5A is “MZ”.",
    ),
    widget: {
      type: "sort",
      buckets: [
        { id: "jpeg", label: t("JPEG rasm", "JPEG image") },
        { id: "pdf", label: t("PDF hujjat", "PDF document") },
        { id: "zip", label: t("ZIP / DOCX", "ZIP / DOCX") },
        {
          id: "exe",
          label: t("Windows dasturi (EXE)", "Windows program (EXE)"),
        },
      ],
      items: [
        { label: code("FF D8 FF E0"), code: true, bucket: "jpeg" },
        { label: code("25 50 44 46 2D 31 2E 37"), code: true, bucket: "pdf" },
        { label: code("50 4B 03 04 14 00"), code: true, bucket: "zip" },
        { label: code("4D 5A 90 00"), code: true, bucket: "exe" },
        {
          label: t(
            "holiday.jpg, lekin 4D 5A bilan boshlanadi",
            "holiday.jpg, but it starts with 4D 5A",
          ),
          bucket: "exe",
        },
        {
          label: t("salary.docx — 50 4B 03 04", "salary.docx — 50 4B 03 04"),
          bucket: "zip",
        },
      ],
    },
  },
  {
    id: 5,
    group: TIMELINE,
    title: t("Vaqt zonalari bilan xronologiya", "A timeline across time zones"),
    minutes: 12,
    intro: t(
      "Buzilgan serverdan ikki manba bor: veb-server loglari mahalliy vaqtda (Toshkent, UTC+5) va fayl tizimi vaqt belgilari UTC’da. Ularni yozilgan soat bo‘yicha tartiblasangiz, hujum “orqaga” ketganday ko‘rinadi. Avval hammasini bitta vaqt zonasiga (odatda UTC) keltirish kerak.",
      "A hacked server gives two sources: web server logs in local time (Tashkent, UTC+5) and file system timestamps in UTC. Sort them by the clock as written and the attack seems to run backwards. First bring everything to one time zone (usually UTC).",
    ),
    analogy: t(
      "Ikki shahardagi guvohlarning soatlari: “soat 7 da” va “soat 2 da” bir vaqtni anglatishi mumkin.",
      "Witnesses in two cities: “at 7” and “at 2” may mean the same moment.",
    ),
    theory: [
      t(
        "Xronologiya vositalari (plaso/log2timeline) hamma manbani UTC’ga keltiradi. Hisobotda vaqt zonasi doim ko‘rsatiladi.",
        "Timeline tools (plaso/log2timeline) bring every source to UTC. A report always states the time zone.",
      ),
    ],
    task: t(
      "Hodisalarni haqiqiy ketma-ketlikda tartiblang.",
      "Put the events in their real order.",
    ),
    hint: t(
      "Veb-log soatlaridan 5 soat ayiring.",
      "Take 5 hours off the web log clocks.",
    ),
    widget: { type: "timeline" },
  },
  {
    id: 6,
    group: TIMELINE,
    title: t("Soxtalashtirilgan vaqtlar", "Faked timestamps"),
    minutes: 6,
    intro: t(
      "Hujumchi izlarini yashirish uchun vaqt belgilarini o‘zgartirishi mumkin (timestomping): touch -d bilan mtime’ni bir yil oldinga qo‘yadi. Lekin ctime’ni oddiy buyruq bilan qaytarib bo‘lmaydi, NTFS’da esa $FILE_NAME atributidagi vaqtlar $STANDARD_INFORMATION’dagidan farq qilib qoladi.",
      "To hide their tracks an attacker may change timestamps (timestomping): touch -d sets mtime back a year. But ctime can’t be set back with ordinary commands, and on NTFS the times in the $FILE_NAME attribute stop matching those in $STANDARD_INFORMATION.",
    ),
    analogy: t(
      "Hujjatdagi sanani o‘chirib, qayta yozish: qog‘ozdagi iz baribir qoladi.",
      "Rubbing out a date on a document and writing a new one: the paper still shows the mark.",
    ),
    theory: [
      t(
        "Shubhali belgilar: mtime birth’dan oldin, ctime mtime’dan ancha keyin, yoki soniya kasrlari aynan .0000000.",
        "Warning signs: mtime before birth, ctime long after mtime, or fractions of a second that are exactly .0000000.",
      ),
    ],
    task: t("Savollarga javob bering.", "Answer the questions."),
    hint: t("ctime’ni touch o‘zgartira olmaydi.", "touch can’t change ctime."),
    widget: {
      type: "quiz",
      questions: [
        {
          ask: t(
            "shell.php: Modify 2025-01-10, Change 2026-10-03 02:11, Birth 2026-10-03 02:11. Bu nimani bildiradi?",
            "shell.php: Modify 2025-01-10, Change 2026-10-03 02:11, Birth 2026-10-03 02:11. What does it suggest?",
          ),
          options: [
            t(
              "mtime orqaga surilgan — fayl aslida 2026-10-03 da paydo bo‘lgan",
              "The mtime was set back — the file really appeared on 2026-10-03",
            ),
            t(
              "Fayl 2025-yildan beri o‘zgarmagan",
              "The file hasn’t changed since 2025",
            ),
            t("Disk buzilgan", "The disk is broken"),
          ],
          answer: 0,
          explain: t(
            "Fayl yaratilishidan oldin o‘zgartirilgan bo‘lishi mumkin emas.",
            "A file can’t be modified before it was created.",
          ),
        },
        {
          ask: t(
            "Hujumchi touch -d bilan qaysi vaqtni o‘zgartira olmaydi?",
            "Which timestamp can’t an attacker set with touch -d?",
          ),
          options: [
            t("ctime (Change)", "ctime (Change)"),
            t("mtime (Modify)", "mtime (Modify)"),
            t("atime (Access)", "atime (Access)"),
          ],
          answer: 0,
          explain: t(
            "touch’ning o‘zi inode’ni o‘zgartiradi — ctime “hozir” bo‘lib qoladi.",
            "touch itself changes the inode — so ctime becomes “now”.",
          ),
        },
      ],
    },
  },
  {
    id: 7,
    group: TIMELINE,
    title: t("Ma’lum fayllarni chetga olish", "Setting known files aside"),
    minutes: 6,
    intro: t(
      "Diskda yuz minglab fayl bor, ularning ko‘pchiligi — operatsion tizim va dasturlarning o‘zgarmagan fayllari. Ularning xeshlari NSRL kabi bazalarda bor: mos kelganlarni chetga olib, faqat noma’lum yoki shubhali fayllarni ko‘rib chiqasiz. Aksincha, ma’lum zararli fayllar xeshlari bilan qidirib, ularni darhol topasiz.",
      "A disk holds hundreds of thousands of files, most of them unchanged operating system and program files. Their hashes are in databases such as the NSRL: set the matches aside and look only at what is unknown or suspicious. The other way round, hashes of known malware find it at once.",
    ),
    analogy: t(
      "Pichan ichidan igna qidirish: avval pichanni olib tashlaysiz.",
      "Looking for a needle in a haystack: first you take the hay away.",
    ),
    theory: [
      t(
        "Bitta bayt o‘zgargan tizim fayli NSRL bilan mos kelmaydi — shuning uchun u e’tiborga tushadi.",
        "A system file with one changed byte won’t match the NSRL — which is exactly why it gets noticed.",
      ),
    ],
    task: t("Savollarga javob bering.", "Answer the questions."),
    hint: t(
      "Ma’lum yaxshi — chetga; ma’lum yomon — darhol belgilash.",
      "Known good: set aside; known bad: flag at once.",
    ),
    widget: {
      type: "quiz",
      questions: [
        {
          ask: t(
            "C:\\Windows\\System32\\svchost.exe xeshi NSRL’dagi hech bir versiyaga mos kelmaydi. Nima qilasiz?",
            "The hash of C:\\Windows\\System32\\svchost.exe matches no version in the NSRL. What do you do?",
          ),
          options: [
            t(
              "Chuqur tekshiraman — bu almashtirilgan fayl bo‘lishi mumkin",
              "Examine it closely — it may be a replaced file",
            ),
            t(
              "E’tibor bermayman — bu tizim fayli",
              "Ignore it — it is a system file",
            ),
            t("O‘chirib tashlayman", "Delete it"),
          ],
          answer: 0,
          explain: t(
            "Zararli dasturlar ko‘pincha tizim fayllari nomini oladi.",
            "Malware often borrows system file names.",
          ),
        },
        {
          ask: t(
            "NSRL kabi “ma’lum yaxshi” bazalar nimaga kerak?",
            "What are “known good” sets such as the NSRL for?",
          ),
          options: [
            t(
              "O‘zgarmagan tizim fayllarini tahlildan chetga olish uchun",
              "To set unchanged system files aside from the analysis",
            ),
            t("Parollarni tiklash uchun", "To recover passwords"),
            t("Diskni shifrlash uchun", "To encrypt the disk"),
          ],
          answer: 0,
          explain: t(
            "Ko‘rib chiqiladigan fayllar soni o‘nlab marta kamayadi.",
            "The number of files to review falls by orders of magnitude.",
          ),
        },
      ],
    },
  },
  {
    id: 8,
    group: TIMELINE,
    title: t("Yakuniy savollar", "Final questions"),
    minutes: 6,
    intro: t(
      "Modulni takrorlaymiz: MACB, o‘chirilgan fayllar, imzolar, vaqt zonalari, timestomping va ma’lum fayllar.",
      "A review of the module: MACB, deleted files, signatures, time zones, timestomping and known files.",
    ),
    analogy: t(
      "Fayl tizimi — kundalik: kim, qachon, nima qilganini yozib boradi, hatto o‘chirilganini ham.",
      "A file system is a diary: it notes who did what and when, even what was deleted.",
    ),
    theory: [
      t(
        "Keyingi modul — loglar va artefaktlar: kirish loglari, Windows hodisalari va brauzer tarixi.",
        "The next module is logs and artefacts: login logs, Windows events and browser history.",
      ),
    ],
    task: t(
      "Barcha savollarga to‘g‘ri javob bering.",
      "Answer every question correctly.",
    ),
    hint: t("Change — yaratilish emas.", "Change is not creation."),
    widget: {
      type: "quiz",
      questions: [
        {
          ask: t(
            "chmod 600 secret.txt qaysi vaqt belgisini o‘zgartiradi?",
            "Which timestamp does chmod 600 secret.txt change?",
          ),
          options: [code("ctime"), code("mtime"), code("crtime (birth)")],
          answer: 0,
          explain: t(
            "Ruxsat inode’da — mazmun o‘zgarmaydi.",
            "Permissions live in the inode — the content doesn’t change.",
          ),
        },
        {
          ask: t(
            "“invoice.pdf” 4D 5A bilan boshlanadi. Bu?",
            "“invoice.pdf” starts with 4D 5A. This is?",
          ),
          options: [
            t(
              "PDF niqobidagi Windows dasturi",
              "A Windows program dressed up as a PDF",
            ),
            t("Oddiy PDF", "An ordinary PDF"),
            t("Rasm", "An image"),
          ],
          answer: 0,
          explain: t(
            "PDF 25 50 44 46 (%PDF) bilan boshlanadi.",
            "A PDF starts with 25 50 44 46 (%PDF).",
          ),
        },
        {
          ask: t(
            "Veb-log 07:11 (UTC+5), fayl yaratilishi 02:11 (UTC). Qaysi biri oldin?",
            "Web log at 07:11 (UTC+5), file created at 02:11 (UTC). Which came first?",
          ),
          options: [
            t(
              "Bir vaqtda — ikkalasi 02:11 UTC",
              "At the same moment — both are 02:11 UTC",
            ),
            t("Fayl, 5 soat oldin", "The file, 5 hours earlier"),
            t("Veb-log, 5 soat oldin", "The web log, 5 hours earlier"),
          ],
          answer: 0,
          explain: t(
            "07:11 − 5 soat = 02:11 UTC.",
            "07:11 minus 5 hours is 02:11 UTC.",
          ),
        },
        {
          ask: t(
            "O‘chirilgan faylni tiklash imkoniyatini nima eng ko‘p kamaytiradi?",
            "What most reduces the chance of recovering a deleted file?",
          ),
          options: [
            t(
              "Kompyuterdan foydalanishni davom ettirish",
              "Carrying on using the computer",
            ),
            t("Diskni darhol tasvirga olish", "Imaging the disk at once"),
            t("Write blocker ishlatish", "Using a write blocker"),
          ],
          answer: 0,
          explain: t(
            "Yangi fayllar bo‘sh bloklar ustidan yoziladi.",
            "New files get written over the free blocks.",
          ),
        },
      ],
    },
  },
];
