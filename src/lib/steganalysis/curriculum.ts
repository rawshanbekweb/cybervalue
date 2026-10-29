// Academy Intermediate · Steganography, module 5: Steganalysis. The lessons
// use ./tools.ts: two photos' histograms, one with the even pairs that LSB
// embedding leaves behind.
import type { CommonWidget, Lesson, Text } from "../anim-lab/types";

export type Widget = CommonWidget | { type: "pairs" };

export const PROGRESS_KEY = "cybervalue:steganalysis:progress:v1";

const t = (uz: string, en: string): Text => ({ uz, en });
const code = (s: string): Text => ({ uz: s, en: s });

const SIGNS = t("Belgilar", "The signs");
const STATS = t("Statistika", "Statistics");
const WORK = t("Ish tartibi", "The workflow");

export const LESSONS: Lesson<Widget>[] = [
  {
    id: 1,
    group: SIGNS,
    title: t("Shubhali belgilar", "Warning signs"),
    minutes: 6,
    intro: t(
      "Steganaliz — fayl ichida yashirin narsa borligini aniqlash. Yashirilgan xabarni darhol o‘qish shart emas: avval “bu fayl g‘alati” degan belgilarni topish kerak. Ba’zi belgilar kuchli, ba’zilari esa oddiy faylda ham uchraydi.",
      "Steganalysis is telling that a file carries something hidden. You don’t have to read the message straight away: first look for the signs that “this file is odd”. Some signs are strong; others turn up in ordinary files too.",
    ),
    analogy: t(
      "Bojxona: har bir chamadonni ochmaydi, lekin og‘irligi g‘alati yoki rentgenda soyasi bo‘lganini ochadi.",
      "Customs doesn’t open every suitcase — just the one that weighs too much or casts an odd shadow on the X-ray.",
    ),
    theory: [
      t(
        "Bitta belgi — dalil emas; bir nechta belgi birga — tekshirishga sabab.",
        "One sign isn’t proof; several together are a reason to look closer.",
      ),
    ],
    task: t(
      "Har biri yashirishning kuchli belgisimi yoki oddiy holatmi?",
      "Is each one a strong sign of hiding, or ordinary?",
    ),
    hint: t(
      "Kutilmagan hajm va tartibli LSB — kuchli belgilar.",
      "Unexpected size and structured LSBs are strong signs.",
    ),
    widget: {
      type: "sort",
      buckets: [
        { id: "strong", label: t("Kuchli belgi", "Strong sign") },
        { id: "ordinary", label: t("Oddiy holat", "Ordinary") },
      ],
      items: [
        {
          label: t(
            "800×600 PNG, lekin hajmi 12 MB",
            "An 800×600 PNG weighing 12 MB",
          ),
          bucket: "strong",
        },
        {
          label: t(
            "binwalk rasm ichida ikkinchi faylni topdi",
            "binwalk finds a second file inside a picture",
          ),
          bucket: "strong",
        },
        {
          label: t(
            "0-bit tekisligida harflar ko‘rinadi",
            "Letters show up in the bit-0 plane",
          ),
          bucket: "strong",
        },
        {
          label: t("Rasmda EXIF umuman yo‘q", "The picture has no EXIF at all"),
          bucket: "ordinary",
        },
        {
          label: t("JPEG sifati 85%", "JPEG quality is 85%"),
          bucket: "ordinary",
        },
        {
          label: t("Fayl nomi IMG_2041.jpg", "The file is called IMG_2041.jpg"),
          bucket: "ordinary",
        },
      ],
    },
  },
  {
    id: 2,
    group: STATS,
    title: t("Juftliklar juda teng", "Pairs that are too even"),
    minutes: 12,
    intro: t(
      "Tabiiy rasmda 100 va 101 qiymatli piksellar soni tasodifan farq qiladi — ba’zan ancha. LSB’ga tasodifiy bitlar (shifrlangan xabar) yozilsa, har bir juftlik (2k, 2k+1) piksellarni deyarli teng bo‘lib oladi. Gistogrammada bu “zinapoya” ko‘rinishida chiqadi — chi-kvadrat hujumi aynan shuni o‘lchaydi.",
      "In a natural picture, the number of pixels at 100 and at 101 differs by chance — sometimes a lot. Write random bits (an encrypted message) into the LSBs and each pair (2k, 2k+1) ends up sharing its pixels almost evenly. In a histogram this shows as a “staircase” — exactly what the chi-square attack measures.",
    ),
    analogy: t(
      "Sinfdagi o‘g‘il va qizlar soni har bir partada aniq teng bo‘lsa — buni kimdir ataylab o‘tqazgan.",
      "If every desk in a class has exactly one boy and one girl, someone seated them that way on purpose.",
    ),
    theory: [
      t(
        "Bu yerda o‘lchov: juftliklar orasidagi o‘rtacha farq ulushi. 0 ga yaqin — juda teng, shubhali.",
        "The measure here is the average share by which pairs differ. Close to 0 means too even — suspicious.",
      ),
    ],
    task: t(
      "Ikki rasmdan qaysi biri LSB’da ma’lumot olib yuradi?",
      "Which of the two photos carries data in its LSBs?",
    ),
    hint: t(
      "Qo‘shni ustunlar jufti deyarli bir xil balandlikda bo‘lgan rasm.",
      "The one whose neighbouring bars come in near-equal pairs.",
    ),
    widget: { type: "pairs" },
  },
  {
    id: 3,
    group: STATS,
    title: t(
      "Statistik testlarning chegarasi",
      "The limits of statistical tests",
    ),
    minutes: 6,
    intro: t(
      "Statistik testlar ehtimol aytadi, kafolat emas. Kichik payload kam iz qoldiradi; ba’zi tabiiy rasmlar (masalan, kuchli siqilgan yoki sun’iy grafikalar) yolg‘on signal beradi. Zamonaviy usullar (F5, adaptiv yashirish) bu testlardan qochish uchun yaratilgan.",
      "Statistical tests give odds, not certainty. A small payload leaves few traces; some natural pictures (heavily compressed or computer-drawn ones) raise false alarms. Modern methods (F5, adaptive embedding) were built to dodge these tests.",
    ),
    analogy: t(
      "Yolg‘on detektori: foydali, lekin sudda yagona dalil bo‘la olmaydi.",
      "A lie detector: useful, but not enough on its own in court.",
    ),
    theory: [
      t(
        "Shuning uchun tahlilchi bir nechta usulni birlashtiradi: statistika, vizual bit tekisliklari, fayl tuzilmasi.",
        "So analysts combine methods: statistics, a visual look at bit planes, the file’s structure.",
      ),
    ],
    task: t("Savollarga javob bering.", "Answer the questions."),
    hint: t(
      "Kichik payload — kichik iz.",
      "A small payload leaves a small trace.",
    ),
    widget: {
      type: "quiz",
      questions: [
        {
          ask: t(
            "Chi-kvadrat testi rasmni “toza” dedi. Bu nimani bildiradi?",
            "The chi-square test calls a picture “clean”. What does that mean?",
          ),
          options: [
            t(
              "Katta LSB payload ehtimoli kam — lekin kichik yoki boshqa usul istisno emas",
              "A large LSB payload is unlikely — but a small one or another method isn’t ruled out",
            ),
            t(
              "Rasmda hech narsa yo‘q — aniq",
              "There is definitely nothing in it",
            ),
            t("Rasm shifrlangan", "The picture is encrypted"),
          ],
          answer: 0,
          explain: t(
            "Test faqat o‘zi qidirgan izni ko‘radi.",
            "A test sees only the trace it looks for.",
          ),
        },
        {
          ask: t(
            "Nega kichik payload aniqlash qiyin?",
            "Why is a small payload hard to detect?",
          ),
          options: [
            t(
              "Juda kam piksel o‘zgaradi — statistika deyarli siljimaydi",
              "Very few pixels change — the statistics barely move",
            ),
            t("U shifrlangan", "It is encrypted"),
            t("Qiyin emas", "It isn’t"),
          ],
          answer: 0,
          explain: t(
            "Sig‘im va yashirinlik orasidagi muvozanat yana.",
            "The capacity-stealth trade-off again.",
          ),
        },
      ],
    },
  },
  {
    id: 4,
    group: WORK,
    title: t("Qaysi faylga qaysi vosita", "Which tool for which file"),
    minutes: 8,
    intro: t(
      "Har bir belgi keyingi qadamni aytadi. G‘ayritabiiy hajm — binwalk; g‘alati metama’lumot — exiftool; PNG/BMP piksellari — zsteg yoki stegsolve; ovozdagi shovqin — spektrogramma; steghide izi bor JPEG — stegseek bilan parolni lug‘atdan sinash.",
      "Each sign points to the next step. Odd size: binwalk. Odd metadata: exiftool. PNG/BMP pixels: zsteg or stegsolve. Noise in a sound: a spectrogram. A JPEG with steghide traces: stegseek, trying passphrases from a wordlist.",
    ),
    analogy: t(
      "Shifokor alomatga qarab tahlil buyuradi: isitma — qon tahlili, singan suyak — rentgen.",
      "A doctor orders tests by symptom: a fever gets a blood test, a broken bone an X-ray.",
    ),
    theory: [
      t(
        "stegseek rockyou.txt kabi lug‘at bilan steghide parolini soniyalarda topishi mumkin — zaif parol yashirishni befoyda qiladi.",
        "stegseek with a wordlist such as rockyou.txt can find a steghide passphrase in seconds — a weak passphrase makes hiding pointless.",
      ),
    ],
    task: t(
      "Har bir faylga birinchi qaysi vosita kerak?",
      "Which tool does each file need first?",
    ),
    hint: t(
      "Belgiga qarang: hajm, metama’lumot, piksellar, ovoz, parol.",
      "Look at the sign: size, metadata, pixels, sound, passphrase.",
    ),
    widget: {
      type: "sort",
      buckets: [
        { id: "binwalk", label: code("binwalk") },
        { id: "exiftool", label: code("exiftool") },
        { id: "zsteg", label: code("zsteg / stegsolve") },
        { id: "stegseek", label: code("stegseek") },
      ],
      items: [
        {
          label: t(
            "holiday.jpg — 40 KB bo‘lishi kerak edi, 3 MB",
            "holiday.jpg — should be 40 KB, weighs 3 MB",
          ),
          bucket: "binwalk",
        },
        {
          label: t(
            "invoice.pdf — muallif o‘rniga noma’lum ism",
            "invoice.pdf — an unknown name as the author",
          ),
          bucket: "exiftool",
        },
        {
          label: t(
            "logo.png — 0-bit tekisligi tartibli ko‘rinadi",
            "logo.png — its bit-0 plane looks structured",
          ),
          bucket: "zsteg",
        },
        {
          label: t(
            "cat.jpg — steghide info “embedded data” deydi, parol so‘raydi",
            "cat.jpg — steghide info says “embedded data” and asks for a passphrase",
          ),
          bucket: "stegseek",
        },
      ],
    },
  },
  {
    id: 5,
    group: WORK,
    title: t("zsteg chiqishi", "zsteg output"),
    minutes: 6,
    intro: t(
      "zsteg PNG va BMP fayllarda bit, kanal va o‘qish tartibining barcha kombinatsiyalarini sinab, ma’noli narsani qidiradi. Har bir qatorning boshida u qanday o‘qiganini yozadi.",
      "zsteg tries every combination of bit, channel and reading order in PNG and BMP files, looking for anything meaningful. Each line starts by saying how it read the data.",
    ),
    analogy: t(
      "Qulfni har bir kalit bilan sinab ko‘rish — lekin bir soniyada mingtasini.",
      "Trying every key on a lock — a thousand of them a second.",
    ),
    theory: [
      t(
        "zsteg -a barcha usullarni sinaydi; topilgan natijani zsteg -E bilan chiqarib olasiz.",
        "zsteg -a tries every method; zsteg -E extracts what it finds.",
      ),
    ],
    task: t(
      "Chiqishning har bir qismini bosib, nima ekanini o‘qing.",
      "Click each part of the output and read what it is.",
    ),
    hint: t("Hammasi bo‘lib beshta qism.", "Five parts in all."),
    widget: {
      type: "anatomy",
      lines: [
        [{ text: "$ zsteg logo.png" }],
        [
          { text: "b1", id: "bits" },
          { text: "," },
          { text: "rgb", id: "channels" },
          { text: "," },
          { text: "lsb", id: "order" },
          { text: "," },
          { text: "xy", id: "scan" },
          { text: "   .. " },
          { text: 'text: "flag{pixels_tell_tales}"', id: "found" },
        ],
      ],
      parts: [
        {
          id: "bits",
          title: t("b1 — bitlar soni", "b1 — bits per value"),
          body: t(
            "Har bir qiymatdan 1 ta bit o‘qilgan. b2 — ikkita.",
            "One bit read from each value. b2 would be two.",
          ),
        },
        {
          id: "channels",
          title: t("rgb — kanallar", "rgb — channels"),
          body: t(
            "Qizil, yashil va ko‘k ketma-ket. Faqat b bo‘lsa — faqat ko‘k.",
            "Red, green and blue in turn. Just b would be blue only.",
          ),
        },
        {
          id: "order",
          title: t("lsb — bit tartibi", "lsb — bit order"),
          body: t(
            "Eng kichik bitdan boshlab. msb — eng kattasidan.",
            "Starting from the least significant bit. msb starts from the top.",
          ),
        },
        {
          id: "scan",
          title: t("xy — o‘qish yo‘nalishi", "xy — scan order"),
          body: t(
            "Chapdan o‘ngga, yuqoridan pastga. yx — ustunma-ustun.",
            "Left to right, top to bottom. yx would go column by column.",
          ),
        },
        {
          id: "found",
          title: t("Topilgan matn", "What was found"),
          body: t(
            "O‘qilgan bitlar ma’noli ASCII matn bo‘lib chiqdi — yashirin xabar.",
            "The bits read out as meaningful ASCII text — the hidden message.",
          ),
        },
      ],
    },
  },
  {
    id: 6,
    group: WORK,
    title: t("Parolni topish va etika", "Cracking passphrases, and ethics"),
    minutes: 6,
    intro: t(
      "steghide payloadni parol bilan shifrlaydi. stegseek bu parolni lug‘atdan juda tez sinaydi. Bu — CTF va tergovda kuchli vosita, lekin boshqalarning fayllarida ruxsatsiz ishlatish qonunbuzarlik.",
      "steghide encrypts the payload with a passphrase. stegseek tries passphrases from a wordlist very fast. It is a powerful tool for CTFs and investigations — and using it on other people’s files without permission is against the law.",
    ),
    analogy: t(
      "Qulf ochuvchi usta: o‘z eshigingizda — xizmat, birovnikida — o‘g‘irlik.",
      "A locksmith: on your own door it is a service, on someone else’s it is burglary.",
    ),
    theory: [
      t(
        "Himoya tomoni uchun xulosa: yashirish xavfsizligi parolga bog‘liq — uzun, tasodifiy parol ishlating.",
        "The lesson for defenders: hiding is only as safe as its passphrase — use a long, random one.",
      ),
    ],
    task: t("Savollarga javob bering.", "Answer the questions."),
    hint: t(
      "Zaif parol — lug‘atda bor parol.",
      "A weak passphrase is one in a wordlist.",
    ),
    widget: {
      type: "quiz",
      questions: [
        {
          ask: t(
            "stegseek steghide parolini soniyalarda topdi. Nega?",
            "stegseek found a steghide passphrase in seconds. Why?",
          ),
          options: [
            t(
              "Parol mashhur lug‘atda bor edi",
              "The passphrase was in a well-known wordlist",
            ),
            t("steghide shifrlamaydi", "steghide doesn’t encrypt"),
            t("Rasm juda katta edi", "The picture was too big"),
          ],
          answer: 0,
          explain: t(
            "Uzun, tasodifiy parol lug‘atda bo‘lmaydi.",
            "A long random passphrase isn’t in any wordlist.",
          ),
        },
        {
          ask: t(
            "Hamkasbning shaxsiy rasmlarini stegseek bilan tekshirish mumkinmi?",
            "May you run stegseek on a colleague’s private photos?",
          ),
          options: [
            t(
              "Yo‘q — faqat ruxsat yoki rasmiy tergov doirasida",
              "No — only with permission or within an official investigation",
            ),
            t("Ha, agar qiziq bo‘lsa", "Yes, if you’re curious"),
            t("Ha, ish vaqtida", "Yes, during working hours"),
          ],
          answer: 0,
          explain: t(
            "Ruxsatsiz kirish — qonunbuzarlik.",
            "Access without permission is against the law.",
          ),
        },
      ],
    },
  },
  {
    id: 7,
    group: WORK,
    title: t("Tartibli tekshiruv", "A methodical check"),
    minutes: 6,
    intro: t(
      "Shubhali faylga tartib bilan yondashiladi: 1) file va xesh — nima ekanini bilish va o‘zgartirmaslik; 2) exiftool — metama’lumot; 3) strings va binwalk — ichidagi matn va fayllar; 4) zsteg/stegsolve yoki spektrogramma — piksellar va ovoz; 5) steghide/stegseek — parolli yashirish. Har bir qadam yoziladi.",
      "A suspect file is handled in order: 1) file and a hash — know what it is and don’t change it; 2) exiftool — the metadata; 3) strings and binwalk — the text and files inside; 4) zsteg/stegsolve or a spectrogram — pixels and sound; 5) steghide/stegseek — hiding with a passphrase. Every step is written down.",
    ),
    analogy: t(
      "Uchuvchining nazorat ro‘yxati: har safar bir xil tartibda, hech narsa unutilmasin.",
      "A pilot’s checklist: the same order every time, so nothing is forgotten.",
    ),
    theory: [
      t(
        "Avval xesh — keyingi tahlil faylni o‘zgartirmaganini isbotlash uchun (kriminalistika domeni).",
        "Hash first — to show later that the analysis didn’t change the file (the forensics domain).",
      ),
    ],
    task: t("Savollarga javob bering.", "Answer the questions."),
    hint: t(
      "Arzon va tez tekshiruvlar — birinchi.",
      "Cheap, fast checks come first.",
    ),
    widget: {
      type: "quiz",
      questions: [
        {
          ask: t(
            "Shubhali fayl bilan birinchi qadam?",
            "The first step with a suspect file?",
          ),
          options: [
            t("file va SHA-256 xesh", "file and a SHA-256 hash"),
            t(
              "stegseek bilan parol sinash",
              "Trying passphrases with stegseek",
            ),
            t("Faylni tahrirlash", "Editing the file"),
          ],
          answer: 0,
          explain: t(
            "Nima ekanini bilib, o‘zgarmaganini qayd etasiz.",
            "You learn what it is and record that it is unchanged.",
          ),
        },
        {
          ask: t(
            "Nega har bir qadam yoziladi?",
            "Why is every step written down?",
          ),
          options: [
            t(
              "Natijani boshqalar takrorlay olishi va tekshira olishi uchun",
              "So others can repeat and check the result",
            ),
            t("Vaqt o‘tkazish uchun", "To pass the time"),
            t("Yozilmaydi", "It isn’t"),
          ],
          answer: 0,
          explain: t(
            "Takrorlanadigan natija — ishonchli natija.",
            "A repeatable result is a trustworthy one.",
          ),
        },
      ],
    },
  },
  {
    id: 8,
    group: WORK,
    title: t("Yakuniy savollar", "Final questions"),
    minutes: 6,
    intro: t(
      "Modulni va butun Steganografiya domenini takrorlaymiz: belgilar, juftliklar statistikasi, testlar chegarasi, vositalar, zsteg, parollar va ish tartibi.",
      "A review of the module and of the whole Steganography domain: the signs, pair statistics, the limits of tests, the tools, zsteg, passphrases and the workflow.",
    ),
    analogy: t(
      "Yashirgan ham, qidirgan ham bir xil qoidalarni biladi — farqi kim tartibliroq.",
      "The hider and the seeker know the same rules — the difference is who is more methodical.",
    ),
    theory: [
      t(
        "Tabriklaymiz: Steganografiya domeni tugadi.",
        "Congratulations: the Steganography domain is done.",
      ),
    ],
    task: t(
      "Barcha savollarga to‘g‘ri javob bering.",
      "Answer every question correctly.",
    ),
    hint: t("Teng juftliklar — LSB izi.", "Even pairs are the LSB trace."),
    widget: {
      type: "quiz",
      questions: [
        {
          ask: t(
            "LSB yashirish gistogrammada qanday iz qoldiradi?",
            "What trace does LSB hiding leave in a histogram?",
          ),
          options: [
            t(
              "2k va 2k+1 juftliklari deyarli tenglashadi",
              "The pairs 2k and 2k+1 become nearly equal",
            ),
            t("Gistogramma yo‘qoladi", "The histogram disappears"),
            t("Hech qanday", "None"),
          ],
          answer: 0,
          explain: t(
            "Chi-kvadrat hujumi shuni o‘lchaydi.",
            "The chi-square attack measures exactly this.",
          ),
        },
        {
          ask: t(
            "800×600 PNG 12 MB bo‘lsa, birinchi vosita?",
            "An 800×600 PNG is 12 MB. The first tool?",
          ),
          options: [code("binwalk"), code("stegseek"), code("ping")],
          answer: 0,
          explain: t(
            "Ortiqcha hajm — ichida boshqa fayl bo‘lishi mumkin.",
            "Extra size may mean another file inside.",
          ),
        },
        {
          ask: t(
            "zsteg’dagi “b1,rgb,lsb,xy” nimani bildiradi?",
            "What does “b1,rgb,lsb,xy” mean in zsteg?",
          ),
          options: [
            t(
              "Har R, G, B qiymatidan 1 ta eng kichik bit, chapdan o‘ngga",
              "One lowest bit from each R, G, B value, left to right",
            ),
            t("Rasm o‘lchami", "The picture size"),
            t("Fayl formati", "The file format"),
          ],
          answer: 0,
          explain: t(
            "b1 — 1 bit, rgb — kanallar, lsb — tartib, xy — yo‘nalish.",
            "b1 is one bit, rgb the channels, lsb the order, xy the scan.",
          ),
        },
        {
          ask: t(
            "steghide bilan yashirilgan ma’lumotni nima himoya qiladi?",
            "What protects data hidden with steghide?",
          ),
          options: [
            t("Uzun, tasodifiy parol", "A long, random passphrase"),
            t("Fayl nomi", "The file name"),
            t("JPEG sifati", "The JPEG quality"),
          ],
          answer: 0,
          explain: t(
            "Lug‘atdagi parol stegseek uchun soniyalik ish.",
            "A wordlist passphrase takes stegseek seconds.",
          ),
        },
      ],
    },
  },
];
