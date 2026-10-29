// Academy Intermediate · Steganography, module 1: The idea. The lessons use
// ./tools.ts: an acrostic poem and a chat message carrying zero-width bits.
import type { CommonWidget, Lesson, Text } from "../anim-lab/types";

export type Widget =
  CommonWidget | { type: "acrostic" } | { type: "zerowidth" };

export const PROGRESS_KEY = "cybervalue:stego:progress:v1";

const t = (uz: string, en: string): Text => ({ uz, en });

const IDEA = t("G‘oya", "The idea");
const TEXT = t("Matn ichida", "Inside text");
const USES = t("Qo‘llanishi", "Where it is used");

export const LESSONS: Lesson<Widget>[] = [
  {
    id: 1,
    group: IDEA,
    title: t("Yashirish va shifrlash", "Hiding versus encrypting"),
    minutes: 6,
    intro: t(
      "Shifrlash xabarni o‘qib bo‘lmaydigan qiladi, lekin xabar borligi ko‘rinib turadi. Steganografiya esa xabar borligining o‘zini yashiradi: u oddiy rasm, matn yoki ovoz ichida turadi. Ko‘pincha ikkalasi birga ishlatiladi: avval shifrlanadi, keyin yashiriladi.",
      "Encryption makes a message unreadable, but anyone can see a message is there. Steganography hides the fact that there is a message at all: it sits inside an ordinary picture, text or sound. Often both are used together: encrypt first, then hide.",
    ),
    analogy: t(
      "Seyf — hamma ko‘radi, lekin ocholmaydi. Kitob javonidagi yashirin bo‘lma — hech kim borligini bilmaydi.",
      "A safe: everyone sees it, nobody opens it. A secret compartment in a bookshelf: nobody knows it is there.",
    ),
    theory: [
      t(
        "Atamalar: cover (qoplama) — oddiy fayl; payload — yashirin xabar; stego-ob’ekt — xabar yashirilgan fayl.",
        "The terms: the cover is the ordinary file; the payload is the hidden message; the stego object is the file with the message inside.",
      ),
    ],
    task: t(
      "Har bir usul nima qiladi: yashiradi, shifrlaydi yoki ikkalasi?",
      "What does each method do: hide, encrypt, or both?",
    ),
    hint: t("Xabar borligi ko‘rinadimi?", "Can you see that a message exists?"),
    widget: {
      type: "sort",
      buckets: [
        { id: "hide", label: t("Yashiradi", "Hides") },
        { id: "encrypt", label: t("Shifrlaydi", "Encrypts") },
        { id: "both", label: t("Ikkalasi", "Both") },
      ],
      items: [
        {
          label: t(
            "Ko‘rinmas siyoh bilan yozilgan xat",
            "A letter in invisible ink",
          ),
          bucket: "hide",
        },
        {
          label: t(
            "Mushuk rasmi piksellarida yashirilgan matn",
            "Text hidden in the pixels of a cat photo",
          ),
          bucket: "hide",
        },
        {
          label: t("AES bilan shifrlangan arxiv", "An AES-encrypted archive"),
          bucket: "encrypt",
        },
        {
          label: t(
            "HTTPS orqali yuborilgan parol",
            "A password sent over HTTPS",
          ),
          bucket: "encrypt",
        },
        {
          label: t(
            "Avval shifrlangan, keyin rasmga yashirilgan fayl",
            "A file encrypted first, then hidden in a picture",
          ),
          bucket: "both",
        },
        {
          label: t(
            "steghide parol bilan (u payloadni shifrlab yashiradi)",
            "steghide with a passphrase (it encrypts the payload as it hides it)",
          ),
          bucket: "both",
        },
      ],
    },
  },
  {
    id: 2,
    group: TEXT,
    title: t("Akrostix", "An acrostic"),
    minutes: 8,
    intro: t(
      "Eng qadimgi usullardan biri: xabar har bir qatorning birinchi harfida. She’r oddiy ko‘rinadi, lekin bilgan odam uni boshqacha o‘qiydi. Asosiy shart — qoplama tabiiy ko‘rinishi kerak, aks holda shubha uyg‘otadi.",
      "One of the oldest methods: the message is in the first letter of each line. The poem looks ordinary, but someone who knows reads it differently. The key requirement is that the cover looks natural — otherwise it draws suspicion.",
    ),
    analogy: t(
      "Do‘stlar orasidagi “kod so‘z”: boshqalar uchun oddiy gap.",
      "A code word between friends: ordinary talk to everyone else.",
    ),
    theory: [
      t(
        "Matn steganografiyasining sig‘imi kichik: uzun she’r — bir necha harf.",
        "Text steganography carries little: a long poem holds only a few letters.",
      ),
    ],
    task: t(
      "She’rda qaysi so‘z yashirilgan?",
      "Which word is hidden in the poem?",
    ),
    hint: t(
      "Har bir qatorning birinchi harfini o‘qing.",
      "Read the first letter of each line.",
    ),
    widget: { type: "acrostic" },
  },
  {
    id: 3,
    group: TEXT,
    title: t("Ko‘rinmas belgilar", "Invisible characters"),
    minutes: 10,
    intro: t(
      "Unicode’da ekranda hech narsa ko‘rsatmaydigan belgilar bor: zero-width space (U+200B) va zero-width non-joiner (U+200C). Birini 0, ikkinchisini 1 deb olsak, oddiy chat xabariga istalgan matnni ko‘rinmas holda qo‘shish mumkin. Xabar uzunligi esa o‘zgaradi — bu uni fosh qiladi.",
      "Unicode has characters that show nothing on screen: the zero-width space (U+200B) and the zero-width non-joiner (U+200C). Take one as 0 and the other as 1, and any text can ride invisibly inside an ordinary chat message. The message’s length changes, though — and that gives it away.",
    ),
    analogy: t(
      "Qog‘ozga limon sharbati bilan yozish: ko‘zga ko‘rinmaydi, lekin qog‘oz og‘irroq.",
      "Writing on paper in lemon juice: the eye sees nothing, but the paper is heavier.",
    ),
    theory: [
      t(
        "Har bir belgi 8 bitda: “1” harfi = 00110001. Shuning uchun 5 belgilik sir 40 ta ko‘rinmas belgi bo‘ladi.",
        "Each character takes 8 bits: “1” is 00110001. So a five-character secret becomes 40 invisible characters.",
      ),
    ],
    task: t(
      "Xabardagi yashirin matnni toping va yozing.",
      "Find the hidden text in the message and type it.",
    ),
    hint: t(
      "Ko‘rinmas belgilarni ko‘rsating, keyin bitlarni oching.",
      "Show the invisible characters, then decode the bits.",
    ),
    widget: { type: "zerowidth" },
  },
  {
    id: 4,
    group: IDEA,
    title: t("steghide buyrug‘i", "The steghide command"),
    minutes: 6,
    intro: t(
      "steghide — JPEG va WAV fayllarga ma’lumot yashiradigan mashhur vosita. U payloadni parol bilan shifrlaydi va cover faylga joylaydi; tashqi ko‘rinishi deyarli o‘zgarmaydi.",
      "steghide is a well-known tool that hides data in JPEG and WAV files. It encrypts the payload with a passphrase and places it in the cover file; the file looks almost exactly the same.",
    ),
    analogy: t(
      "Konvertni kitob muqovasi ichiga yopishtirish: kitob o‘sha, faqat biroz qalinroq.",
      "Gluing an envelope inside a book’s cover: the same book, just a little thicker.",
    ),
    theory: [
      t(
        "Chiqarish: steghide extract -sf cat.jpg -p kalit123. Parol bo‘lmasa, payloadni olib bo‘lmaydi.",
        "Extracting: steghide extract -sf cat.jpg -p kalit123. Without the passphrase the payload can’t be taken out.",
      ),
    ],
    task: t(
      "Buyruqning har bir qismini bosib, nima ekanini o‘qing.",
      "Click each part of the command and read what it is.",
    ),
    hint: t("Hammasi bo‘lib to‘rtta qism.", "Four parts in all."),
    widget: {
      type: "anatomy",
      lines: [
        [
          { text: "steghide " },
          { text: "embed", id: "cmd" },
          { text: " " },
          { text: "-cf cat.jpg", id: "cover" },
          { text: " " },
          { text: "-ef plan.txt", id: "payload" },
          { text: " " },
          { text: '-p "kalit123"', id: "key" },
        ],
      ],
      parts: [
        {
          id: "cmd",
          title: t("embed — yashirish", "embed — hide"),
          body: t(
            "Teskarisi extract. info esa faylda nimadir borligini tekshiradi.",
            "The reverse is extract; info checks whether a file carries something.",
          ),
        },
        {
          id: "cover",
          title: t("-cf — cover fayl", "-cf — the cover file"),
          body: t(
            "Oddiy rasm. U joyida o‘zgartiriladi — asl nusxani saqlab qo‘ymasangiz, u yo‘qoladi.",
            "An ordinary photo. It is changed in place — keep no copy and the original is gone.",
          ),
        },
        {
          id: "payload",
          title: t("-ef — payload", "-ef — the payload"),
          body: t(
            "Yashiriladigan fayl. U cover sig‘imidan katta bo‘lsa, steghide rad etadi.",
            "The file to hide. If it is larger than the cover can carry, steghide refuses.",
          ),
        },
        {
          id: "key",
          title: t("-p — parol", "-p — the passphrase"),
          body: t(
            "Payload shu bilan shifrlanadi. Buyruq qatoridagi parol shell tarixiga yoziladi — ehtiyot bo‘ling.",
            "The payload is encrypted with it. A passphrase on the command line lands in shell history — careful.",
          ),
        },
      ],
    },
  },
  {
    id: 5,
    group: USES,
    title: t("Yaxshi va yomon maqsadlar", "Good and bad uses"),
    minutes: 6,
    intro: t(
      "Steganografiya o‘zi yaxshi ham, yomon ham emas. Rasm va filmlarda ko‘rinmas suv belgisi (watermark) mualliflik huquqini himoya qiladi, rangli printerlar har bir sahifaga sezilmas sariq nuqtalar qo‘yadi. Zararli dasturlar esa buyruqlarni oddiy rasmlarga yashirib yuboradi yoki o‘g‘irlangan ma’lumotni rasmlarda olib chiqadi.",
      "Steganography is neither good nor bad in itself. Invisible watermarks in pictures and films protect copyright, and colour printers put barely visible yellow dots on every page. Malware, on the other hand, hides its commands in ordinary pictures or carries stolen data out inside them.",
    ),
    analogy: t(
      "Pul qog‘ozidagi suv belgisi — himoya; o‘g‘irlangan narsani chamadon tagida olib o‘tish — jinoyat.",
      "The watermark on a banknote protects; smuggling stolen goods in a suitcase lining is a crime.",
    ),
    theory: [
      t(
        "Himoyachi uchun: chiquvchi trafikdagi “oddiy” rasmlar ham ma’lumot olib chiqishi mumkin.",
        "For defenders: even “ordinary” pictures in outbound traffic may be carrying data out.",
      ),
    ],
    task: t("Har bir qo‘llanishni ajrating.", "Sort each use."),
    hint: t(
      "Mualliflik va kuzatuv — qonuniy; buyruq va o‘g‘irlik — zararli.",
      "Copyright and tracing are legitimate; commands and theft are malicious.",
    ),
    widget: {
      type: "sort",
      buckets: [
        { id: "legit", label: t("Qonuniy", "Legitimate") },
        { id: "bad", label: t("Zararli", "Malicious") },
      ],
      items: [
        {
          label: t(
            "Fotosuratga ko‘rinmas mualliflik belgisi",
            "An invisible copyright mark in a photograph",
          ),
          bucket: "legit",
        },
        {
          label: t(
            "Printerning sahifadagi sariq kuzatuv nuqtalari",
            "A printer’s yellow tracking dots on the page",
          ),
          bucket: "legit",
        },
        {
          label: t(
            "Film nusxasiga xaridor raqamini yashirish",
            "Hiding the buyer’s number in a copy of a film",
          ),
          bucket: "legit",
        },
        {
          label: t(
            "Zararli dastur buyruqlarini mem-rasmdan o‘qiydi",
            "Malware reads its commands from a meme image",
          ),
          bucket: "bad",
        },
        {
          label: t(
            "Mijozlar bazasini rasmlar ichida tashqariga yuborish",
            "Sending the customer database out inside pictures",
          ),
          bucket: "bad",
        },
        {
          label: t(
            "Fishing sahifasining skriptini favicon ichiga yashirish",
            "Hiding a phishing page’s script inside its favicon",
          ),
          bucket: "bad",
        },
      ],
    },
  },
  {
    id: 6,
    group: USES,
    title: t("Uni qanday sezish mumkin", "How it can be noticed"),
    minutes: 6,
    intro: t(
      "Yaxshi yashirilgan xabarni ko‘z bilan ko‘rib bo‘lmaydi, lekin izlar qoladi: fayl hajmi kutilganidan katta, asl nusxa bilan solishtirganda farq bor, statistik xususiyatlar g‘alati yoki fayl oxirida ortiqcha ma’lumot bor. Keyingi modullarda har birini ko‘rib chiqamiz.",
      "A well-hidden message can’t be seen by eye, but traces remain: the file is bigger than expected, it differs from the original, its statistics look odd, or there is extra data at the end. The next modules look at each of these.",
    ),
    analogy: t(
      "Yashirin bo‘lmali chamadon: tashqaridan oddiy, lekin og‘irligi va o‘lchami mos kelmaydi.",
      "A suitcase with a false bottom: ordinary outside, but its weight and size don’t add up.",
    ),
    theory: [
      t(
        "Kerkhoffs tamoyili stegoga ham tegishli: usul ma’lum deb hisoblang — xavfsizlik faqat kalitda.",
        "Kerckhoffs’s principle applies to stego too: assume the method is known — security rests on the key alone.",
      ),
    ],
    task: t("Savollarga javob bering.", "Answer the questions."),
    hint: t(
      "Hajm, asl bilan farq, statistika, fayl oxiri.",
      "Size, difference from the original, statistics, the end of the file.",
    ),
    widget: {
      type: "quiz",
      questions: [
        {
          ask: t(
            "Chat xabari 60 belgidek ko‘rinadi, lekin uzunligi 100 belgi. Bu nimani bildirishi mumkin?",
            "A chat message looks like 60 characters but is 100 long. What might that mean?",
          ),
          options: [
            t(
              "Ko‘rinmas belgilar yashirilgan",
              "Invisible characters are hidden in it",
            ),
            t("Shrift katta", "The font is big"),
            t("Internet sekin", "The internet is slow"),
          ],
          answer: 0,
          explain: t(
            "Zero-width belgilar uzunlikni oshiradi, lekin ko‘rinmaydi.",
            "Zero-width characters add length but don’t show.",
          ),
        },
        {
          ask: t(
            "Kerkhoffs tamoyiliga ko‘ra stego tizimining xavfsizligi nimaga tayanishi kerak?",
            "By Kerckhoffs’s principle, what should a stego system’s security rest on?",
          ),
          options: [
            t("Faqat kalitga", "The key alone"),
            t("Usul sir bo‘lishiga", "Keeping the method secret"),
            t("Fayl nomiga", "The file name"),
          ],
          answer: 0,
          explain: t(
            "Usul oshkor bo‘lsa ham, kalitsiz payloadni olib bo‘lmasligi kerak.",
            "Even with the method known, the payload must stay out of reach without the key.",
          ),
        },
      ],
    },
  },
  {
    id: 7,
    group: USES,
    title: t("Sig‘im va yashirinlik", "Capacity and stealth"),
    minutes: 6,
    intro: t(
      "Qancha ko‘p ma’lumot yashirilsa, cover shuncha ko‘p o‘zgaradi va shuncha oson aniqlanadi. Shuning uchun katta payload uchun katta cover kerak: kichik ikonkaga kitob sig‘maydi, sig‘dirilsa — sezilarli bo‘ladi.",
      "The more data you hide, the more the cover changes and the easier it is to detect. So a big payload needs a big cover: a book won’t fit in a small icon, and if forced in, it shows.",
    ),
    analogy: t(
      "Kichik sumkaga ko‘p narsa tiqilsa, u bo‘rtib qoladi.",
      "Stuff too much into a small bag and it bulges.",
    ),
    theory: [
      t(
        "Siqilgan yoki shifrlangan payload tasodifiyga o‘xshaydi — bu yashirishga yordam beradi, lekin statistik tahlilda ham ko‘rinishi mumkin.",
        "A compressed or encrypted payload looks random — which helps hiding, but can also show up in statistical analysis.",
      ),
    ],
    task: t("Savollarga javob bering.", "Answer the questions."),
    hint: t("Ko‘proq ma’lumot — ko‘proq o‘zgarish.", "More data, more change."),
    widget: {
      type: "quiz",
      questions: [
        {
          ask: t(
            "2 MB faylni qaysi coverga yashirish kamroq seziladi?",
            "Which cover hides a 2 MB file least noticeably?",
          ),
          options: [
            t("40 MB video", "A 40 MB video"),
            t("16×16 piksel ikonka", "A 16×16 pixel icon"),
            t("Bir qatorli SMS", "A one-line text message"),
          ],
          answer: 0,
          explain: t(
            "Katta coverda o‘zgarish ulushi kichik.",
            "In a big cover the share that changes is small.",
          ),
        },
        {
          ask: t(
            "Payloadni yashirishdan oldin shifrlash nima beradi?",
            "What does encrypting the payload before hiding it give you?",
          ),
          options: [
            t(
              "Topilsa ham, kalitsiz o‘qib bo‘lmaydi",
              "Even if found, it can’t be read without the key",
            ),
            t("Fayl kichrayadi", "The file gets smaller"),
            t("Hech narsa", "Nothing"),
          ],
          answer: 0,
          explain: t(
            "Yashirish va shifrlash — ikki qatlamli himoya.",
            "Hiding plus encrypting means two layers of protection.",
          ),
        },
      ],
    },
  },
  {
    id: 8,
    group: USES,
    title: t("Yakuniy savollar", "Final questions"),
    minutes: 6,
    intro: t(
      "Modulni takrorlaymiz: yashirish va shifrlash farqi, akrostix, ko‘rinmas belgilar, steghide, qo‘llanishlar va aniqlash belgilari.",
      "A review of the module: hiding versus encrypting, acrostics, invisible characters, steghide, uses and the signs of hiding.",
    ),
    analogy: t(
      "Yaxshi yashiringan narsa — ko‘zga tashlanmaydigan, lekin izi qolgan narsa.",
      "Something well hidden is something you don’t notice — though it still leaves a trace.",
    ),
    theory: [
      t(
        "Keyingi modul — rasm ichida: piksellar va LSB.",
        "The next module goes inside images: pixels and LSB.",
      ),
    ],
    task: t(
      "Barcha savollarga to‘g‘ri javob bering.",
      "Answer every question correctly.",
    ),
    hint: t(
      "Stego borligini yashiradi; kripto mazmunini.",
      "Stego hides that it exists; crypto hides what it says.",
    ),
    widget: {
      type: "quiz",
      questions: [
        {
          ask: t(
            "Steganografiya shifrlashdan nimasi bilan farq qiladi?",
            "How does steganography differ from encryption?",
          ),
          options: [
            t(
              "Xabar borligining o‘zini yashiradi",
              "It hides that there is a message at all",
            ),
            t("U kuchliroq shifr", "It is a stronger cipher"),
            t("Farqi yo‘q", "There is no difference"),
          ],
          answer: 0,
          explain: t(
            "Shifrlangan xabar ko‘rinadi, lekin o‘qilmaydi.",
            "An encrypted message is visible but unreadable.",
          ),
        },
        {
          ask: t("steghide’da -cf nima?", "In steghide, what is -cf?"),
          options: [
            t("Cover fayl", "The cover file"),
            t("Payload", "The payload"),
            t("Parol", "The passphrase"),
          ],
          answer: 0,
          explain: t(
            "-ef — payload, -p — parol.",
            "-ef is the payload, -p the passphrase.",
          ),
        },
        {
          ask: t(
            "Zero-width belgilarni nima fosh qiladi?",
            "What gives zero-width characters away?",
          ),
          options: [
            t(
              "Matn uzunligi ko‘rinadiganidan katta",
              "The text is longer than it looks",
            ),
            t("Ular rangli", "They are coloured"),
            t("Hech narsa", "Nothing"),
          ],
          answer: 0,
          explain: t(
            "Belgilar sanog‘i ko‘rinadigan matndan oshadi.",
            "The character count exceeds the visible text.",
          ),
        },
        {
          ask: t(
            "Qaysi biri steganografiyaning qonuniy qo‘llanishi?",
            "Which is a legitimate use of steganography?",
          ),
          options: [
            t("Mualliflik suv belgisi", "A copyright watermark"),
            t("Zararli dastur buyruqlari", "Malware commands"),
            t("Ma’lumot o‘g‘irlash", "Data theft"),
          ],
          answer: 0,
          explain: t(
            "Watermark asar egasini ko‘rsatadi.",
            "A watermark shows who owns the work.",
          ),
        },
      ],
    },
  },
];
