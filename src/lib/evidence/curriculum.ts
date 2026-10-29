// Academy Intermediate · Digital forensics, module 1: Handling evidence.
// The lessons use ./tools.ts: the steps of a sound acquisition, copies
// checked against the acquisition hash, and a chain of custody with a gap.
import type { CommonWidget, Lesson, Text } from "../anim-lab/types";

export type Widget =
  CommonWidget | { type: "acquire" } | { type: "hashes" } | { type: "custody" };

export const PROGRESS_KEY = "cybervalue:evidence:progress:v1";

const t = (uz: string, en: string): Text => ({ uz, en });

const SCENE = t("Hodisa joyida", "At the scene");
const IMAGE = t("Tasvir olish", "Imaging");
const PROOF = t("Isbotlash", "Proving it");

export const LESSONS: Lesson<Widget>[] = [
  {
    id: 1,
    group: SCENE,
    title: t("O‘zgaruvchanlik tartibi", "The order of volatility"),
    minutes: 6,
    intro: t(
      "Raqamli dalillarning bir qismi kompyuter o‘chirilishi bilan yo‘qoladi: operativ xotira (RAM), ochiq tarmoq ulanishlari, ishlayotgan jarayonlar. Disk va zaxira nusxalari esa kutib turadi. Shuning uchun dalil eng tez yo‘qoladiganidan boshlab yig‘iladi (RFC 3227).",
      "Some digital evidence is gone the moment the computer turns off: memory (RAM), open network connections, running processes. Disks and backups can wait. So evidence is collected from the most volatile first (RFC 3227).",
    ),
    analogy: t(
      "Qordagi izlar va devordagi rasm: avval erib ketadiganini suratga olasiz.",
      "Footprints in snow and a painting on the wall: you photograph what will melt first.",
    ),
    theory: [
      t(
        "RAM’da shifrlash kalitlari, parollar va faqat xotirada yashaydigan zararli dasturlar bo‘lishi mumkin. Kompyuterni o‘chirish — ularni yo‘qotish.",
        "RAM may hold encryption keys, passwords and malware that lives only in memory. Pulling the plug loses them.",
      ),
    ],
    task: t(
      "Nimani darhol, nimani keyinroq yig‘ish mumkin?",
      "What must be collected at once, and what can wait?",
    ),
    hint: t(
      "Elektr uzilsa yo‘qoladigan hamma narsa — birinchi.",
      "Whatever a power cut would erase comes first.",
    ),
    widget: {
      type: "sort",
      buckets: [
        { id: "now", label: t("Darhol", "At once") },
        { id: "later", label: t("Keyinroq", "Later") },
      ],
      items: [
        { label: t("Operativ xotira (RAM)", "Memory (RAM)"), bucket: "now" },
        {
          label: t("Ochiq tarmoq ulanishlari", "Open network connections"),
          bucket: "now",
        },
        {
          label: t(
            "Ishlayotgan jarayonlar ro‘yxati",
            "The list of running processes",
          ),
          bucket: "now",
        },
        { label: t("Qattiq disk", "The hard disk"), bucket: "later" },
        {
          label: t("Tungi zaxira nusxa lentasi", "Last night’s backup tape"),
          bucket: "later",
        },
        {
          label: t("Arxivlangan eski loglar", "Archived old logs"),
          bucket: "later",
        },
      ],
    },
  },
  {
    id: 2,
    group: SCENE,
    title: t("Hodisa joyida nima qilinadi", "What to do at the scene"),
    minutes: 6,
    intro: t(
      "Birinchi kelgan odamning harakati dalilni saqlab qoladi yoki buzadi. Ekranni suratga olish, qurilmani belgilash va muhrlash — to‘g‘ri. Shubhali kompyuterda antivirus ishga tushirish, fayllarni “bir ko‘rib qo‘yish” yoki uni qayta yuklash — dalilni o‘zgartiradi.",
      "What the first person on the scene does keeps evidence or spoils it. Photographing the screen, labelling and sealing the device are right. Running antivirus on the suspect machine, “just having a look” at files, or rebooting it all change the evidence.",
    ),
    analogy: t(
      "Jinoyat joyida tergovchi hech narsaga qo‘l tekkizmaydi — avval suratga oladi va o‘lchaydi.",
      "At a crime scene the detective touches nothing — first they photograph and measure.",
    ),
    theory: [
      t(
        "Har bir harakat vaqti bilan yoziladi: kim, qachon, nima qildi. Bu yozuv keyin sudda so‘raladi.",
        "Every action is written down with its time: who did what, when. That record is asked for later in court.",
      ),
    ],
    task: t("Har bir harakatni ajrating.", "Sort each action."),
    hint: t(
      "Diskka yoki xotiraga yozadigan har qanday harakat — xato.",
      "Anything that writes to the disk or memory is a mistake.",
    ),
    widget: {
      type: "sort",
      buckets: [
        { id: "do", label: t("To‘g‘ri", "Do") },
        { id: "dont", label: t("Xato", "Don’t") },
      ],
      items: [
        {
          label: t(
            "Ekranni telefon bilan suratga olish",
            "Photograph the screen with a phone",
          ),
          bucket: "do",
        },
        {
          label: t(
            "Qurilmani raqamli paketga solib muhrlash",
            "Seal the device in a numbered bag",
          ),
          bucket: "do",
        },
        {
          label: t(
            "Har bir harakatni vaqti bilan yozib borish",
            "Write down every action with its time",
          ),
          bucket: "do",
        },
        {
          label: t(
            "Shubhali kompyuterda antivirus ishga tushirish",
            "Run antivirus on the suspect computer",
          ),
          bucket: "dont",
        },
        {
          label: t(
            "Fayllarni ochib, “nima borligini” ko‘rish",
            "Open files to “see what is there”",
          ),
          bucket: "dont",
        },
        {
          label: t(
            "Sekin ishlayotgani uchun qayta yuklash",
            "Reboot it because it is slow",
          ),
          bucket: "dont",
        },
      ],
    },
  },
  {
    id: 3,
    group: IMAGE,
    title: t("Disk tasvirini olish", "Taking a disk image"),
    minutes: 10,
    intro: t(
      "Disk bilan to‘g‘ridan-to‘g‘ri ishlanmaydi. Uni write blocker orqali ulab, asl diskning xeshi olinadi, bit-ma-bit tasvir (image) yaratiladi, tasvirning xeshi asl bilan solishtiriladi — va tahlil faqat tasvirning nusxasida olib boriladi.",
      "Nobody works on the disk itself. It is connected through a write blocker, the original is hashed, a bit-for-bit image is made, the image’s hash is compared with the original’s — and the analysis runs only on a copy of the image.",
    ),
    analogy: t(
      "Qadimiy qo‘lyozmani o‘qish uchun uning nusxasi olinadi; asli esa seyfda qoladi.",
      "To study an ancient manuscript you make a copy; the original stays in the vault.",
    ),
    theory: [
      t(
        "Write blocker — faqat o‘qishga ruxsat beradigan qurilma: tizim diskka hech narsa yoza olmaydi.",
        "A write blocker is a device that only allows reading: the system can’t write anything to the disk.",
      ),
      t(
        "Bit-ma-bit tasvir (dd, FTK Imager, E01) o‘chirilgan fayllarni va bo‘sh joyni ham saqlaydi — oddiy nusxa esa yo‘q.",
        "A bit-for-bit image (dd, FTK Imager, E01) keeps deleted files and free space too — a plain file copy does not.",
      ),
    ],
    task: t(
      "Tasvir dalil sifatida qabul qilinishi uchun barcha kerakli qadamlarni tanlang.",
      "Pick every step needed for the image to stand up as evidence.",
    ),
    hint: t("Beshta qadamning hammasi kerak.", "All five steps are needed."),
    widget: { type: "acquire" },
  },
  {
    id: 4,
    group: IMAGE,
    title: t("dd va sha256sum", "dd and sha256sum"),
    minutes: 6,
    intro: t(
      "Linux’da tasvir dd bilan olinadi va xesh sha256sum bilan hisoblanadi. Buyruqning har bir qismi muhim: noto‘g‘ri if/of — dalilning ustidan yozish demakdir.",
      "On Linux an image is taken with dd and hashed with sha256sum. Every part of the command matters: swapping if and of means writing over the evidence.",
    ),
    analogy: t(
      "Nusxa ko‘chirish mashinasi: qaysi qog‘oz asl, qaysi biri bo‘sh — adashsangiz, aslni bo‘yab yuborasiz.",
      "A photocopier: mix up which sheet is the original and which is blank, and you print over the original.",
    ),
    theory: [
      t(
        "conv=noerror,sync — o‘qib bo‘lmaydigan sektorda to‘xtamaslik va uni nollar bilan to‘ldirish, shunda tasvir hajmi asl bilan bir xil qoladi.",
        "conv=noerror,sync keeps going past unreadable sectors and fills them with zeros, so the image stays the same size as the original.",
      ),
    ],
    task: t(
      "Buyruqlarning har bir qismini bosib, nima ekanini o‘qing.",
      "Click each part of the commands and read what it is.",
    ),
    hint: t("Hammasi bo‘lib oltita qism.", "Six parts in all."),
    widget: {
      type: "anatomy",
      lines: [
        [
          { text: "dd " },
          { text: "if=/dev/sdb", id: "if" },
          { text: " " },
          { text: "of=/cases/0417/disk.img", id: "of" },
          { text: " " },
          { text: "bs=4M", id: "bs" },
          { text: " " },
          { text: "conv=noerror,sync", id: "conv" },
        ],
        [
          { text: "sha256sum " },
          { text: "/dev/sdb", id: "hashsrc" },
          { text: " " },
          { text: "/cases/0417/disk.img", id: "hashimg" },
        ],
      ],
      parts: [
        {
          id: "if",
          title: t("if — kirish (asl disk)", "if — input (the original disk)"),
          body: t(
            "Write blocker orqali ulangan shubhali disk. Undan faqat o‘qiladi.",
            "The suspect disk, connected through the write blocker. It is only read.",
          ),
        },
        {
          id: "of",
          title: t(
            "of — chiqish (tasvir fayli)",
            "of — output (the image file)",
          ),
          body: t(
            "Ish raqami bo‘yicha papkaga yoziladi. if va of ni almashtirib yuborish — dalilni o‘chirish.",
            "Written to the case’s folder. Swapping if and of would wipe the evidence.",
          ),
        },
        {
          id: "bs",
          title: t("bs — blok hajmi", "bs — block size"),
          body: t(
            "Bir martada 4 MB o‘qiladi — tezroq ishlaydi, natijaga ta’sir qilmaydi.",
            "Reads 4 MB at a time — faster, with no effect on the result.",
          ),
        },
        {
          id: "conv",
          title: t("conv=noerror,sync", "conv=noerror,sync"),
          body: t(
            "Buzilgan sektorda to‘xtamaydi va uni nollar bilan to‘ldiradi.",
            "Doesn’t stop at a bad sector and fills it with zeros.",
          ),
        },
        {
          id: "hashsrc",
          title: t("Asl diskning xeshi", "Hash of the original"),
          body: t(
            "Tasvirdan oldin yoki keyin olinadi va hisobotga yoziladi.",
            "Taken before or after imaging and written in the report.",
          ),
        },
        {
          id: "hashimg",
          title: t("Tasvirning xeshi", "Hash of the image"),
          body: t(
            "Asl disk xeshi bilan bir xil bo‘lishi kerak — bu tasvir aniq nusxa ekanining isboti.",
            "Must equal the original’s hash — the proof the image is an exact copy.",
          ),
        },
      ],
    },
  },
  {
    id: 5,
    group: PROOF,
    title: t("Nusxalarni tekshirish", "Checking the copies"),
    minutes: 8,
    intro: t(
      "Tasvirdan bir nechta nusxa olindi: laboratoriya uchun, sud uchun, tahlilchining USB diskida. Qaysi biri hali ham aniq nusxa? Bunga faqat xesh javob beradi: hisobotdagi SHA-256 bilan har bir belgisi mos kelishi kerak. Bitta bayt o‘zgarsa, xesh butunlay boshqacha bo‘ladi.",
      "Several copies were made of the image: for the lab, for court, on an analyst’s USB disk. Which are still exact copies? Only the hash can tell: it must match the SHA-256 in the report in every character. Change one byte and the hash is completely different.",
    ),
    analogy: t(
      "Barmoq izi: o‘xshash bo‘lish yetmaydi, to‘liq mos kelishi kerak.",
      "A fingerprint: looking alike is not enough, it must match exactly.",
    ),
    theory: [
      t(
        "MD5 va SHA-1 dalil uchun eskirgan (to‘qnashuvlar topilgan); SHA-256 ishlatiladi, ko‘pincha MD5 bilan birga eski tizimlar uchun.",
        "MD5 and SHA-1 are out of date for evidence (collisions exist); SHA-256 is used, often alongside MD5 for older tools.",
      ),
    ],
    task: t(
      "Har bir nusxani hisobotdagi xesh bilan solishtiring.",
      "Compare each copy with the hash in the report.",
    ),
    hint: t(
      "Boshi va oxiri o‘xshash bo‘lsa ham, o‘rtasini tekshiring.",
      "Even when the start and end look alike, check the middle.",
    ),
    widget: { type: "hashes" },
  },
  {
    id: 6,
    group: PROOF,
    title: t("Saqlash zanjiri", "The chain of custody"),
    minutes: 10,
    intro: t(
      "Saqlash zanjiri (chain of custody) — dalilni kim, qachon, kimdan olgani va kimga berganining uzluksiz yozuvi. Har bir topshiriq oldingisi tugagan joydan boshlanishi kerak. Bitta bo‘shliq bo‘lsa, himoyachi “bu vaqtda dalil bilan nima bo‘lgani noma’lum” deydi — va dalil rad etilishi mumkin.",
      "The chain of custody is an unbroken record of who took the evidence from whom, and when, and who they gave it to. Each hand-over must start where the last one ended. One gap, and the defence says “nobody knows what happened to it in between” — and the evidence may be thrown out.",
    ),
    analogy: t(
      "Estafeta tayoqchasi: agar u bir qo‘ldan boshqasiga o‘tganini hech kim ko‘rmagan bo‘lsa, poyga hisoblanmaydi.",
      "A relay baton: if nobody saw it pass from one hand to the next, the race doesn’t count.",
    ),
    theory: [
      t(
        "Har bir yozuvda: sana va vaqt, kimdan, kimga, sabab, muhr holati va ikkala imzo.",
        "Each entry holds the date and time, from whom, to whom, why, the state of the seal and both signatures.",
      ),
    ],
    task: t("Zanjir qaysi yozuvda uziladi?", "Where does the chain break?"),
    hint: t(
      "Har bir yozuvning “kimdan”ini oldingisining “kimga”si bilan solishtiring.",
      "Compare each entry’s “from” with the “to” of the one before.",
    ),
    widget: { type: "custody" },
  },
  {
    id: 7,
    group: PROOF,
    title: t("Jonli yoki o‘chirilgan tizim", "Live or powered-off systems"),
    minutes: 6,
    intro: t(
      "Kompyuter yoniq bo‘lsa — u “jonli”. Uni o‘chirishdan oldin RAM tasvirini olish kerakmi? Disk BitLocker yoki FileVault bilan shifrlangan bo‘lsa, kalit faqat xotirada bo‘lishi mumkin — o‘chirish uni yo‘qotadi. Boshqa tomondan, jonli tizimda har bir buyruq iz qoldiradi.",
      "A computer that is on is “live”. Should its RAM be imaged before it is turned off? If the disk is encrypted with BitLocker or FileVault, the key may exist only in memory — switching off loses it. On the other hand, every command on a live system leaves a trace.",
    ),
    analogy: t(
      "Yonayotgan shamni suratga olish: o‘chirgandan keyin olovni qayta ko‘rsatib bo‘lmaydi.",
      "Photographing a burning candle: once blown out, the flame can’t be shown again.",
    ),
    theory: [
      t(
        "Jonli tizimda ishlatilgan har bir vosita (masalan, xotira dump dasturi) va uning vaqti hisobotga yoziladi.",
        "Every tool used on a live system (a memory dumper, say) and when it ran goes into the report.",
      ),
    ],
    task: t("Savollarga javob bering.", "Answer the questions."),
    hint: t(
      "Shifrlangan disk — avval xotira.",
      "An encrypted disk means memory first.",
    ),
    widget: {
      type: "quiz",
      questions: [
        {
          ask: t(
            "Noutbuk yoniq, disk BitLocker bilan shifrlangan. Birinchi qadam?",
            "A laptop is on and its disk is encrypted with BitLocker. The first step?",
          ),
          options: [
            t(
              "RAM tasvirini olish — kalit xotirada bo‘lishi mumkin",
              "Image the RAM — the key may be in memory",
            ),
            t("Darhol o‘chirish", "Turn it off at once"),
            t(
              "Diskni chiqarib, boshqa kompyuterga ulash",
              "Pull the disk and plug it into another computer",
            ),
          ],
          answer: 0,
          explain: t(
            "O‘chirilgan shifrlangan disk kalitsiz o‘qilmaydi.",
            "A powered-off encrypted disk can’t be read without the key.",
          ),
        },
        {
          ask: t(
            "Nega asl disk bilan to‘g‘ridan-to‘g‘ri ishlanmaydi?",
            "Why is the original disk never worked on directly?",
          ),
          options: [
            t(
              "Har qanday o‘zgarish dalilni shubha ostiga qo‘yadi",
              "Any change puts the evidence in doubt",
            ),
            t("U juda sekin", "It is too slow"),
            t("Bu taqiqlanmagan", "Nothing forbids it"),
          ],
          answer: 0,
          explain: t(
            "Tahlil tasvirning nusxasida; asl muhrlangan holda saqlanadi.",
            "Analysis runs on a copy of the image; the original stays sealed.",
          ),
        },
        {
          ask: t(
            "Dalil xeshi uchun qaysi algoritm tavsiya etiladi?",
            "Which algorithm is recommended for hashing evidence?",
          ),
          options: [code("SHA-256"), code("MD5"), code("CRC32")],
          answer: 0,
          explain: t(
            "MD5 to‘qnashuvlari topilgan; CRC32 — xatoni aniqlash uchun, xavfsizlik uchun emas.",
            "MD5 has known collisions; CRC32 detects errors, it isn’t built for security.",
          ),
        },
      ],
    },
  },
  {
    id: 8,
    group: PROOF,
    title: t("Yakuniy savollar", "Final questions"),
    minutes: 6,
    intro: t(
      "Modulni takrorlaymiz: o‘zgaruvchanlik tartibi, hodisa joyidagi harakatlar, tasvir olish, xeshlar, saqlash zanjiri va jonli tizimlar.",
      "A review of the module: the order of volatility, actions at the scene, imaging, hashes, the chain of custody and live systems.",
    ),
    analogy: t(
      "Yaxshi dalil — yaxshi hikoya: har bir qadami yozilgan va tekshirilgan.",
      "Good evidence tells a good story: every step written down and checked.",
    ),
    theory: [
      t(
        "Keyingi modul — fayl tizimlari: vaqt belgilari, o‘chirilgan fayllar va voqealar xronologiyasi.",
        "The next module is file systems: timestamps, deleted files and building a timeline.",
      ),
    ],
    task: t(
      "Barcha savollarga to‘g‘ri javob bering.",
      "Answer every question correctly.",
    ),
    hint: t(
      "Dalil o‘zgarmaganini xesh va zanjir isbotlaydi.",
      "Hashes and the chain prove the evidence didn’t change.",
    ),
    widget: {
      type: "quiz",
      questions: [
        {
          ask: t("Qaysi biri birinchi yig‘iladi?", "Which is collected first?"),
          options: [
            t("Ochiq tarmoq ulanishlari", "Open network connections"),
            t("Zaxira nusxa lentasi", "The backup tape"),
            t("Qattiq disk", "The hard disk"),
          ],
          answer: 0,
          explain: t(
            "Ular kompyuter o‘chishi bilan yo‘qoladi.",
            "They vanish when the computer turns off.",
          ),
        },
        {
          ask: t(
            "Write blocker nima uchun kerak?",
            "What is a write blocker for?",
          ),
          options: [
            t(
              "Tizim diskka hech narsa yoza olmasligi uchun",
              "So the system can’t write anything to the disk",
            ),
            t("Diskni shifrlash uchun", "To encrypt the disk"),
            t("Tasvirni tezlashtirish uchun", "To speed up imaging"),
          ],
          answer: 0,
          explain: t(
            "Aks holda kirish vaqtlari va jurnallar o‘zgaradi.",
            "Otherwise access times and journals change.",
          ),
        },
        {
          ask: t(
            "Tasvir xeshi hisobotdagidan bitta belgiga farq qiladi. Bu nimani bildiradi?",
            "An image’s hash differs from the report’s by one character. What does it mean?",
          ),
          options: [
            t(
              "Tasvir o‘zgargan — u endi aniq nusxa emas",
              "The image has changed — it is no longer an exact copy",
            ),
            t("Arzimas farq, ishlatish mumkin", "A trifle, it can be used"),
            t("Xesh dasturi xato qildi", "The hash tool made a mistake"),
          ],
          answer: 0,
          explain: t(
            "Bitta bayt o‘zgarsa ham, xesh boshqacha bo‘ladi.",
            "Even one changed byte gives a different hash.",
          ),
        },
        {
          ask: t(
            "Saqlash zanjirida 18:00 dan ertasi 09:00 gacha yozuv yo‘q. Oqibati?",
            "The chain of custody has no entry from 18:00 to 09:00 the next day. The consequence?",
          ),
          options: [
            t(
              "Dalil sudda rad etilishi mumkin",
              "The evidence may be thrown out in court",
            ),
            t("Hech narsa, tun edi", "Nothing, it was night"),
            t("Faqat jarima", "Just a fine"),
          ],
          answer: 0,
          explain: t(
            "Bo‘shliqda dalil bilan nima bo‘lganini hech kim isbotlay olmaydi.",
            "Nobody can show what happened to the evidence in the gap.",
          ),
        },
      ],
    },
  },
];

function code(s: string): Text {
  return { uz: s, en: s };
}
