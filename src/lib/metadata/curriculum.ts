// Academy Intermediate · Steganography, module 3: Metadata. The lessons use
// ./tools.ts: a photo's EXIF with GPS to locate, and the tags to strip
// before publishing.
import type { CommonWidget, Lesson, Text } from "../anim-lab/types";

export type Widget = CommonWidget | { type: "exif" } | { type: "strip" };

export const PROGRESS_KEY = "cybervalue:metadata:progress:v1";

const t = (uz: string, en: string): Text => ({ uz, en });

const PHOTOS = t("Fotosuratlar", "Photos");
const DOCS = t("Hujjatlar", "Documents");
const CLEAN = t("Tozalash", "Cleaning");

export const LESSONS: Lesson<Widget>[] = [
  {
    id: 1,
    group: PHOTOS,
    title: t("Metama’lumot nima aytadi", "What metadata tells"),
    minutes: 6,
    intro: t(
      "Metama’lumot — fayl haqidagi ma’lumot: rasm qachon va qanday kamera bilan olingani, hujjatni kim yozgani. U fayl ichida, ko‘zga ko‘rinmaydigan joyda saqlanadi va fayl bilan birga yuboriladi. Ba’zi maydonlar shunchaki texnik, ba’zilari esa egasi haqida ko‘p narsa aytadi.",
      "Metadata is data about the file: when and with what camera a picture was taken, who wrote a document. It is stored inside the file, out of sight, and travels with it. Some fields are just technical; others say a lot about the owner.",
    ),
    analogy: t(
      "Konvertdagi pochta shtampi: xatni ochmasdan ham qayerdan va qachon yuborilgani ko‘rinadi.",
      "A postmark on an envelope: without opening the letter you see where and when it was sent.",
    ),
    theory: [
      t(
        "JPEG va HEIC rasmlarda EXIF, PDF va Office hujjatlarida — muallif, kompaniya va tahrir tarixi.",
        "JPEG and HEIC photos carry EXIF; PDF and Office documents carry the author, company and edit history.",
      ),
    ],
    task: t(
      "Har bir maydon egasi haqida biror narsa oshkor qiladimi?",
      "Does each field give something away about the owner?",
    ),
    hint: t(
      "Kim, qayerda, qachon, qaysi qurilma — shaxsiy.",
      "Who, where, when and which device are personal.",
    ),
    widget: {
      type: "sort",
      buckets: [
        { id: "private", label: t("Shaxsiy ma’lumot", "Personal information") },
        { id: "technical", label: t("Texnik", "Technical") },
      ],
      items: [
        {
          label: t("GPS koordinatalari", "GPS coordinates"),
          bucket: "private",
        },
        {
          label: t("Kamera seriya raqami", "The camera’s serial number"),
          bucket: "private",
        },
        {
          label: t("Artist (egasining ismi)", "Artist (the owner’s name)"),
          bucket: "private",
        },
        {
          label: t("Rasm kengligi va balandligi", "Image width and height"),
          bucket: "technical",
        },
        {
          label: t("Rang maydoni (sRGB)", "Colour space (sRGB)"),
          bucket: "technical",
        },
        { label: t("Siqish usuli", "Compression method"), bucket: "technical" },
      ],
    },
  },
  {
    id: 2,
    group: PHOTOS,
    title: t("Rasm qayerda olingan", "Where the photo was taken"),
    minutes: 12,
    intro: t(
      "Telefon GPS’ni yoqilgan bo‘lsa, har bir rasmga koordinatalarni yozadi — graduslar, daqiqalar va soniyalar (DMS). Ularni o‘nlik graduslarga aylantirib, xaritadan joyni topish mumkin: o‘nlik = gradus + daqiqa ÷ 60 + soniya ÷ 3600.",
      "With location on, a phone writes coordinates into every photo — degrees, minutes and seconds (DMS). Turn them into decimal degrees and the place shows on a map: decimal = degrees + minutes ÷ 60 + seconds ÷ 3600.",
    ),
    analogy: t(
      "Har bir rasm orqasiga manzilni yozib qo‘yish — va uni kimga bersangiz, manzil ham ketadi.",
      "Writing your address on the back of every photo — and whoever you give it to gets the address too.",
    ),
    theory: [
      t(
        "OSINT tadqiqotchilari bu bilan rasm qayerda olinganini tasdiqlaydi; bezorilar esa — qurbon qayerda yashashini bilib oladi.",
        "OSINT researchers use this to confirm where a picture was taken; stalkers use it to learn where a victim lives.",
      ),
    ],
    task: t(
      "EXIF’dan rasm olingan shaharni toping.",
      "Find the city the photo was taken in from its EXIF.",
    ),
    hint: t("39.65 shimol, 66.98 sharq.", "39.65 north, 66.98 east."),
    widget: { type: "exif" },
  },
  {
    id: 3,
    group: DOCS,
    title: t("Hujjat xususiyatlari", "Document properties"),
    minutes: 6,
    intro: t(
      "Word, Excel va PDF fayllar muallif ismini, kompaniyani, oxirgi tahrir qilgan odamni, tahrirlar sonini va hatto shablon yo‘lini saqlaydi. “Anonim” xat yuborgan odam ko‘pincha aynan shu tufayli topiladi.",
      "Word, Excel and PDF files keep the author’s name, the company, who last edited them, the number of revisions and even the template’s path. Many “anonymous” letters have been traced back exactly this way.",
    ),
    analogy: t(
      "Imzosiz xat, lekin konvertda qaytish manzili.",
      "An unsigned letter with a return address on the envelope.",
    ),
    theory: [
      t(
        "Template yo‘li (C:\\Users\\<ism>\\…) foydalanuvchi nomini va papka tuzilishini oshkor qiladi.",
        "A template path (C:\\Users\\<name>\\…) gives away the user name and folder layout.",
      ),
    ],
    task: t(
      "exiftool chiqishining har bir qismini bosib, nima ekanini o‘qing.",
      "Click each part of the exiftool output and read what it is.",
    ),
    hint: t("Hammasi bo‘lib beshta qism.", "Five parts in all."),
    widget: {
      type: "anatomy",
      lines: [
        [{ text: "$ exiftool complaint.docx" }],
        [{ text: "Creator          : Bobur Saidov", id: "creator" }],
        [{ text: "Last Modified By : b.saidov", id: "modified" }],
        [{ text: "Company          : Shop LLC", id: "company" }],
        [{ text: "Revision Number  : 14", id: "revision" }],
        [
          {
            text: "Template         : C:\\Users\\bsaidov\\Templates\\Normal.dotm",
            id: "template",
          },
        ],
      ],
      parts: [
        {
          id: "creator",
          title: t("Muallif", "Creator"),
          body: t(
            "Office o‘rnatilganda kiritilgan ism. “Anonim” xatda ham saqlanadi.",
            "The name entered when Office was installed. It stays even in an “anonymous” letter.",
          ),
        },
        {
          id: "modified",
          title: t("Oxirgi tahrir qilgan", "Last modified by"),
          body: t(
            "Fayl kimning kompyuterida oxirgi marta saqlangan — ko‘pincha login nomi.",
            "Whose computer last saved the file — often the login name.",
          ),
        },
        {
          id: "company",
          title: t("Kompaniya", "Company"),
          body: t(
            "Ish kompyuterida yozilganini ko‘rsatadi.",
            "Shows it was written on a work computer.",
          ),
        },
        {
          id: "revision",
          title: t("Tahrirlar soni", "Revision number"),
          body: t(
            "14 marta saqlangan — hujjat uzoq tayyorlangan.",
            "Saved 14 times — the document took a while to prepare.",
          ),
        },
        {
          id: "template",
          title: t("Shablon yo‘li", "Template path"),
          body: t(
            "Windows foydalanuvchi nomi: bsaidov. Muallifni tasdiqlaydi.",
            "The Windows user name: bsaidov. It confirms the author.",
          ),
        },
      ],
    },
  },
  {
    id: 4,
    group: CLEAN,
    title: t("Nashrdan oldin tozalash", "Cleaning before publishing"),
    minutes: 10,
    intro: t(
      "Rasmni saytga qo‘yishdan oldin shaxsiy maydonlarni olib tashlash kerak. Lekin hammasini o‘chirish ham xato: Orientation maydoni bo‘lmasa, telefonda tik olingan rasm yonboshlab ko‘rinadi, rang maydoni bo‘lmasa — ranglar xira.",
      "Before a photo goes on a website, the personal fields have to go. Deleting everything is a mistake too, though: without Orientation, a photo taken upright shows on its side, and without the colour space the colours go dull.",
    ),
    analogy: t(
      "Xatdan qaytish manzilini o‘chirish — lekin qabul qiluvchining manzilini qoldirish.",
      "Removing the return address from a letter — but leaving the recipient’s address on.",
    ),
    theory: [
      t(
        "exiftool -gps:all= -Artist= -SerialNumber= photo.jpg — aniq maydonlarni olib tashlaydi; exiftool -all= — hammasini.",
        "exiftool -gps:all= -Artist= -SerialNumber= photo.jpg removes specific fields; exiftool -all= removes everything.",
      ),
    ],
    task: t(
      "Shaxsiy maydonlarni olib tashlang, ko‘rsatish uchun keraklilarini qoldiring.",
      "Remove the personal fields and keep the ones needed for display.",
    ),
    hint: t(
      "Orientation va rang maydoni qoladi.",
      "Orientation and the colour space stay.",
    ),
    widget: { type: "strip" },
  },
  {
    id: 5,
    group: CLEAN,
    title: t("Nima tozalaydi, nima yo‘q", "What cleans and what doesn’t"),
    minutes: 6,
    intro: t(
      "Metama’lumotni olib tashlash uchun maxsus vositalar bor: exiftool, mat2. Faylning nomini o‘zgartirish yoki arxivga solish esa hech narsani o‘chirmaydi — metama’lumot fayl ichida qoladi.",
      "There are tools made for removing metadata: exiftool, mat2. Renaming the file or zipping it removes nothing — the metadata stays inside the file.",
    ),
    analogy: t(
      "Konvertni boshqa sumkaga solish — shtamp baribir joyida.",
      "Putting the envelope in a different bag — the postmark is still on it.",
    ),
    theory: [
      t(
        "Ekran rasmi (screenshot) yangi fayl yaratadi — asl EXIF unga o‘tmaydi, lekin rasm sifati pasayadi.",
        "A screenshot makes a new file — the original EXIF doesn’t carry over, though quality drops.",
      ),
    ],
    task: t(
      "Har bir harakat metama’lumotni olib tashlaydimi?",
      "Does each action remove the metadata?",
    ),
    hint: t(
      "Fayl ichini o‘zgartiradigan vosita — ha; tashqi o‘rov — yo‘q.",
      "A tool that rewrites the file’s insides, yes; an outer wrapper, no.",
    ),
    widget: {
      type: "sort",
      buckets: [
        { id: "yes", label: t("Olib tashlaydi", "Removes it") },
        { id: "no", label: t("Olib tashlamaydi", "Doesn’t") },
      ],
      items: [
        {
          label: {
            uz: "exiftool -all= photo.jpg",
            en: "exiftool -all= photo.jpg",
          },
          code: true,
          bucket: "yes",
        },
        {
          label: { uz: "mat2 report.pdf", en: "mat2 report.pdf" },
          code: true,
          bucket: "yes",
        },
        {
          label: t(
            "Rasmning ekran rasmini olish",
            "Taking a screenshot of the photo",
          ),
          bucket: "yes",
        },
        {
          label: t("Fayl nomini o‘zgartirish", "Renaming the file"),
          bucket: "no",
        },
        {
          label: t("Faylni ZIP’ga solish", "Putting the file in a ZIP"),
          bucket: "no",
        },
        {
          label: t(
            "Faylni boshqa papkaga ko‘chirish",
            "Moving the file to another folder",
          ),
          bucket: "no",
        },
      ],
    },
  },
  {
    id: 6,
    group: DOCS,
    title: t("Metama’lumot — dalil", "Metadata as evidence"),
    minutes: 6,
    intro: t(
      "Tergovchi uchun metama’lumot — oltin: rasm olingan vaqt va vaqt zonasi, tahrir dasturi (Software: Adobe Photoshop), asl rasmning kichik nusxasi (thumbnail). Rasm “o‘zgartirilmagan” deyilsa-yu, EXIF’da Photoshop ko‘rinsa — savol tug‘iladi.",
      "For an investigator metadata is gold: when a photo was taken and in which time zone, the editing software (Software: Adobe Photoshop), and a small copy of the original picture (the thumbnail). If a photo is called “unedited” yet its EXIF names Photoshop, questions follow.",
    ),
    analogy: t(
      "Hujjat ostidagi qalam izi: o‘chirilgan bo‘lsa ham, qog‘oz bosimni eslab qoladi.",
      "Pen marks under a document: even rubbed out, the paper remembers the pressure.",
    ),
    theory: [
      t(
        "Metama’lumotni soxtalashtirish oson — shuning uchun u boshqa dalillar bilan tasdiqlanadi.",
        "Metadata is easy to fake — so it is confirmed against other evidence.",
      ),
    ],
    task: t("Savollarga javob bering.", "Answer the questions."),
    hint: t(
      "Software maydoni va thumbnail.",
      "The Software field and the thumbnail.",
    ),
    widget: {
      type: "quiz",
      questions: [
        {
          ask: t(
            "“Tahrirlanmagan” deb taqdim etilgan rasm EXIF’ida “Software: Adobe Photoshop 25.0” bor. Bu nimani bildiradi?",
            "A photo presented as “unedited” has “Software: Adobe Photoshop 25.0” in its EXIF. What does it suggest?",
          ),
          options: [
            t(
              "Rasm Photoshop’da ochilib saqlangan — uni tekshirish kerak",
              "It was opened and saved in Photoshop — it needs checking",
            ),
            t("Rasm albatta asl", "It is certainly original"),
            t("Kamera Photoshop bilan ishlaydi", "The camera runs Photoshop"),
          ],
          answer: 0,
          explain: t(
            "Kamera bunday yozuv qoldirmaydi.",
            "A camera doesn’t leave that tag.",
          ),
        },
        {
          ask: t(
            "Nega metama’lumot yagona dalil sifatida yetarli emas?",
            "Why isn’t metadata enough as the only evidence?",
          ),
          options: [
            t("Uni soxtalashtirish oson", "It is easy to fake"),
            t("U hech qachon to‘g‘ri emas", "It is never right"),
            t("U shifrlangan", "It is encrypted"),
          ],
          answer: 0,
          explain: t(
            "exiftool bilan istalgan maydonni yozish mumkin.",
            "exiftool can write any field.",
          ),
        },
      ],
    },
  },
  {
    id: 7,
    group: CLEAN,
    title: t("Haqiqiy voqealar", "Real cases"),
    minutes: 6,
    intro: t(
      "2012-yilda jurnalistlar qochib yurgan odam bilan intervyu olib, uning telefon rasmini e’lon qilishdi. EXIF’dagi GPS uning qaysi mamlakatda ekanini ko‘rsatdi va u tez orada topildi. Shu kabi xatolar faollar, jurnalistlar va oddiy foydalanuvchilarni ham xavf ostiga qo‘yadi.",
      "In 2012 journalists interviewed a man on the run and published a phone photo of him. The GPS in its EXIF showed which country he was in, and he was found soon after. Mistakes like this put activists, journalists and ordinary users at risk too.",
    ),
    analogy: t(
      "Yashiringan joyingizdan “salom” deb otkritka yuborish — markasida shahar nomi bilan.",
      "Sending a postcard from your hiding place — with the town’s name on the stamp.",
    ),
    theory: [
      t(
        "Telefon kamerasida joylashuvni o‘chirib qo‘yish — eng oddiy himoya.",
        "Turning off location for the phone camera is the simplest protection.",
      ),
    ],
    task: t("Savollarga javob bering.", "Answer the questions."),
    hint: t(
      "Oldindan himoya — joylashuvni o‘chirish; keyin — tozalash.",
      "Prevention: turn location off; afterwards: clean.",
    ),
    widget: {
      type: "quiz",
      questions: [
        {
          ask: t(
            "Telefon rasmlariga GPS yozilmasligi uchun eng oddiy yo‘l?",
            "The simplest way to stop GPS being written into phone photos?",
          ),
          options: [
            t(
              "Kamera uchun joylashuv ruxsatini o‘chirish",
              "Turn off location permission for the camera",
            ),
            t("Rasmlarni kichraytirish", "Make the photos smaller"),
            t("Telefonni qayta yuklash", "Restart the phone"),
          ],
          answer: 0,
          explain: t(
            "Ruxsat bo‘lmasa, kamera koordinata yozmaydi.",
            "Without permission the camera writes no coordinates.",
          ),
        },
        {
          ask: t(
            "Faol inson norozilik mitingidan rasm yubormoqchi. Nima qilishi kerak?",
            "An activist wants to share a photo from a protest. What should they do?",
          ),
          options: [
            t(
              "Yuborishdan oldin metama’lumotni tozalash (va yuzlarni yashirish)",
              "Clean the metadata before sending (and blur faces)",
            ),
            t("Hech narsa — rasm xavfsiz", "Nothing — the photo is safe"),
            t("Faylni qayta nomlash", "Rename the file"),
          ],
          answer: 0,
          explain: t(
            "GPS va vaqt odamni va joyni ko‘rsatadi.",
            "GPS and time point to the person and the place.",
          ),
        },
      ],
    },
  },
  {
    id: 8,
    group: CLEAN,
    title: t("Yakuniy savollar", "Final questions"),
    minutes: 6,
    intro: t(
      "Modulni takrorlaymiz: EXIF, GPS, hujjat xususiyatlari, tozalash, vositalar va dalil sifatida metama’lumot.",
      "A review of the module: EXIF, GPS, document properties, cleaning, tools and metadata as evidence.",
    ),
    analogy: t(
      "Fayl — chamadon; metama’lumot — undagi bagaj yorliqlari.",
      "A file is a suitcase; metadata is the luggage tags on it.",
    ),
    theory: [
      t(
        "Keyingi modul — ovoz va fayl formatlari: spektrogramma va fayl oxiriga qo‘shilgan ma’lumot.",
        "The next module is audio and file formats: spectrograms and data appended to files.",
      ),
    ],
    task: t(
      "Barcha savollarga to‘g‘ri javob bering.",
      "Answer every question correctly.",
    ),
    hint: t(
      "Gradus + daqiqa/60 + soniya/3600.",
      "Degrees + minutes/60 + seconds/3600.",
    ),
    widget: {
      type: "quiz",
      questions: [
        {
          ask: t(
            "41° 18′ 0″ N o‘nlik graduslarda?",
            "What is 41° 18′ 0″ N in decimal degrees?",
          ),
          options: [
            { uz: "41.3", en: "41.3" },
            { uz: "41.18", en: "41.18" },
            { uz: "4118", en: "4118" },
          ],
          answer: 0,
          explain: t("41 + 18/60 = 41.3.", "41 + 18/60 = 41.3."),
        },
        {
          ask: t(
            "Qaysi EXIF maydonini o‘chirsangiz, tik rasm yonboshlab ko‘rinadi?",
            "Which EXIF field, if removed, makes an upright photo show on its side?",
          ),
          options: [
            { uz: "Orientation", en: "Orientation" },
            { uz: "Artist", en: "Artist" },
            { uz: "GPS Latitude", en: "GPS Latitude" },
          ],
          answer: 0,
          explain: t(
            "Orientation ko‘rsatish uchun kerak.",
            "Orientation is needed for display.",
          ),
        },
        {
          ask: t(
            "Fayl nomini o‘zgartirish metama’lumotni o‘chiradimi?",
            "Does renaming a file remove its metadata?",
          ),
          options: [
            t("Yo‘q", "No"),
            t("Ha", "Yes"),
            t("Faqat GPS’ni", "Only the GPS"),
          ],
          answer: 0,
          explain: t(
            "Metama’lumot fayl ichida.",
            "Metadata lives inside the file.",
          ),
        },
        {
          ask: t(
            "Word hujjatidagi “Template: C:\\Users\\bsaidov\\…” nimani oshkor qiladi?",
            "What does “Template: C:\\Users\\bsaidov\\…” in a Word document give away?",
          ),
          options: [
            t("Windows foydalanuvchi nomini", "The Windows user name"),
            t("Parolni", "The password"),
            t("Hech narsani", "Nothing"),
          ],
          answer: 0,
          explain: t(
            "Yo‘lda foydalanuvchi papkasi nomi bor.",
            "The path holds the user’s folder name.",
          ),
        },
      ],
    },
  },
];
