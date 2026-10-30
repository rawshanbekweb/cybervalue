// Academy Intermediate · OSINT, module 4: Images and location. The lessons
// use ./tools.ts: reverse-image-search hits for a recycled photo and a drawn
// street scene full of clues.
import type { CommonWidget, Lesson, Text } from "../anim-lab/types";

export type Widget = CommonWidget | { type: "reverse" } | { type: "scene" };

export const PROGRESS_KEY = "cybervalue:geo:progress:v1";

const t = (uz: string, en: string): Text => ({ uz, en });

const WHEN = t("Qachon", "When");
const WHERE = t("Qayerda", "Where");
const CARE = t("Ehtiyot", "With care");

export const LESSONS: Lesson<Widget>[] = [
  {
    id: 1,
    group: WHEN,
    title: t("Teskari rasm qidiruvi", "Reverse image search"),
    minutes: 6,
    intro: t(
      "Teskari qidiruvda matn emas, rasmning o‘zi yuboriladi va tizim o‘xshash rasmlarni topadi. Google Lens, Bing, Yandex va TinEye — har biri boshqa narsani yaxshi topadi: Yandex yuzlar va binolarni, TinEye esa aynan shu rasmning eng eski nusxasini. Rasmni kesib, faqat qiziq qismini (bino, yozuv) qidirish ko‘pincha yaxshiroq ishlaydi.",
      "A reverse search sends the picture itself, not words, and the engine finds similar images. Google Lens, Bing, Yandex and TinEye are each good at something different: Yandex at buildings and faces, TinEye at the oldest copy of exactly this image. Cropping to the interesting part (a building, a sign) often works better.",
    ),
    analogy: t(
      "Qo‘shiqni so‘zlari bilan emas, kuyini xirgoyi qilib topish.",
      "Finding a song by humming the tune instead of typing the words.",
    ),
    theory: [
      t(
        "Ijtimoiy tarmoqlar rasmni qayta siqadi va metama’lumotni o‘chiradi — shuning uchun rasmning o‘zi asosiy dalil bo‘ladi.",
        "Social networks recompress images and strip their metadata — so the picture itself becomes the main evidence.",
      ),
    ],
    task: t("Savollarga javob bering.", "Answer the questions."),
    hint: t(
      "Bir nechta tizim, kesilgan qism.",
      "Several engines, a cropped detail.",
    ),
    widget: {
      type: "quiz",
      questions: [
        {
          ask: t(
            "Rasmning eng eski nusxasini topish uchun qaysi vosita yaxshi?",
            "Which tool is good at finding the oldest copy of an image?",
          ),
          options: [
            t("TinEye", "TinEye"),
            t("Kalkulyator", "A calculator"),
            t("Port skaneri", "A port scanner"),
          ],
          answer: 0,
          explain: t(
            "U natijalarni sana bo‘yicha saralay oladi.",
            "It can sort results by date.",
          ),
        },
        {
          ask: t(
            "Butun rasm hech narsa topmadi. Keyin?",
            "The whole image found nothing. Then?",
          ),
          options: [
            t(
              "Bino yoki yozuvni kesib, alohida qidirish",
              "Crop a building or sign and search that",
            ),
            t("To‘xtash", "Give up"),
            t("Rasmni kattalashtirib qayta yuborish", "Upscale and resend"),
          ],
          answer: 0,
          explain: t(
            "Kichik, o‘ziga xos qism osonroq topiladi.",
            "A small distinctive detail matches more easily.",
          ),
        },
      ],
    },
  },
  {
    id: 2,
    group: WHEN,
    title: t("Eski rasm, yangi yolg‘on", "Old photo, new lie"),
    minutes: 10,
    intro: t(
      "Telegram kanalida “bugun shaharni suv bosdi” degan surat tarqalyapti. Teskari qidiruv natijalarini sana bo‘yicha ko‘ring: eng eski nusxa qayerda va qachon chiqqan? Agar u yillar oldin bo‘lsa, “bugun” degan da’vo yolg‘on.",
      "A Telegram channel is spreading a photo captioned “the city flooded today”. Look at the reverse-search hits by date: where and when did the oldest copy appear? If that was years ago, the “today” claim is false.",
    ),
    analogy: t(
      "Eski gazetadagi suratni bugungi sana bilan qayta chop etish.",
      "Reprinting a photo from an old newspaper under today’s date.",
    ),
    theory: [
      t(
        "Eng eski topilgan nusxa — asl manba bo‘lishi ehtimoli eng yuqori, lekin kafolat emas: undan ham eskisi indekslanmagan bo‘lishi mumkin.",
        "The oldest copy found is the most likely original, but not guaranteed: an older one may simply not be indexed.",
      ),
    ],
    task: t(
      "Asl manbani tanlang va hukm chiqaring.",
      "Pick the original source and give your verdict.",
    ),
    hint: t("Sanalarni solishtiring.", "Compare the dates."),
    widget: { type: "reverse" },
  },
  {
    id: 3,
    group: WHERE,
    title: t("Rasmdagi belgilar", "Clues in a picture"),
    minutes: 6,
    intro: t(
      "Geolokatsiya — rasm qayerda olinganini undagi belgilardan aniqlash. Kuchli belgilar: yozuvlar va til, mashina raqamlari, yo‘l belgilari, telefon kodlari, mashhur binolar. Kuchsizlari: ob-havo, daraxtlar, umumiy me’morchilik — ular hududni toraytiradi, lekin aniq joyni aytmaydi.",
      "Geolocation means working out where a photo was taken from what is in it. Strong clues: signs and language, number plates, road signs, phone codes, landmarks. Weaker ones: weather, trees, general architecture — they narrow the region but don’t pin the spot.",
    ),
    analogy: t(
      "Detektiv mehmonning poyabzalidagi loydan qaysi ko‘chadan kelganini aytadi.",
      "A detective tells which street a visitor came from by the mud on their shoes.",
    ),
    theory: [
      t(
        "Bir nechta kuchsiz belgi birgalikda kuchli bo‘lishi mumkin.",
        "Several weak clues together can make a strong one.",
      ),
    ],
    task: t(
      "Har bir belgi joyni aniq ko‘rsatadimi yoki faqat hududni toraytiradimi?",
      "Does each clue pin the place, or only narrow the region?",
    ),
    hint: t(
      "Yozuv, raqam va mashhur bino — kuchli.",
      "Text, plates and landmarks are strong.",
    ),
    widget: {
      type: "sort",
      buckets: [
        { id: "strong", label: t("Aniq ko‘rsatadi", "Pins it down") },
        { id: "weak", label: t("Hududni toraytiradi", "Narrows the region") },
      ],
      items: [
        {
          label: t(
            "Telefon raqami +998 71 … bilan do‘kon yozuvi",
            "A shop sign with a phone number +998 71 …",
          ),
          bucket: "strong",
        },
        {
          label: t(
            "Ko‘cha nomi yozilgan lavha",
            "A plate with the street name",
          ),
          bucket: "strong",
        },
        {
          label: t(
            "Fonda Toshkent teleminorasi",
            "The Tashkent TV tower in the background",
          ),
          bucket: "strong",
        },
        {
          label: t("Chinor daraxtlari", "Plane trees"),
          bucket: "weak",
        },
        {
          label: t("Qorli tog‘lar uzoqda", "Snowy mountains in the distance"),
          bucket: "weak",
        },
        {
          label: t(
            "Mashinalar yo‘lning o‘ng tomonida",
            "Cars on the right-hand side of the road",
          ),
          bucket: "weak",
        },
      ],
    },
  },
  {
    id: 4,
    group: WHERE,
    title: t("Ko‘chani o‘qish", "Reading the street"),
    minutes: 10,
    intro: t(
      "Quyidagi chizilgan ko‘chada to‘rtta belgi bor. Har birini bosib o‘qing, keyin shaharni tanlang. Bitta belgi bilan emas, bir nechtasi bir-birini tasdiqlaganda xulosa chiqaring.",
      "The drawn street below holds four clues. Open each one, then choose the city. Don’t decide on one clue — wait until several agree.",
    ),
    analogy: t(
      "Jumboq: har bir bo‘lak rasmning bir qismini ko‘rsatadi.",
      "A jigsaw: each piece shows part of the picture.",
    ),
    theory: [
      t(
        "Haqiqiy ishda keyingi qadam — aniq ko‘chani xaritadan (Google Street View, Yandex Panorama) topib, burchakni solishtirish.",
        "In real work the next step is finding the exact street on a map (Google Street View, Yandex Panoramas) and matching the angle.",
      ),
    ],
    task: t(
      "Kamida uchta belgini ochib, shaharni tanlang.",
      "Open at least three clues and choose the city.",
    ),
    hint: t(
      "Raqamdagi 01 — shahar kodi.",
      "The 01 on the plate is a city code.",
    ),
    widget: { type: "scene" },
  },
  {
    id: 5,
    group: WHERE,
    title: t("Vaqtni aniqlash", "Working out the time"),
    minutes: 6,
    intro: t(
      "Xronolokatsiya — rasm qachon olinganini aniqlash. Soyalar quyosh qayerdaligini (va taxminiy soatni) ko‘rsatadi; ob-havo arxivlari o‘sha kuni yomg‘ir yoki qor bo‘lganini tasdiqlaydi; afishalar, qurilish va do‘kon vitrinalari davrni aytadi. SunCalc kabi vositalar soya yo‘nalishidan vaqtni hisoblaydi.",
      "Chronolocation means working out when a photo was taken. Shadows show where the sun was (and roughly the hour); weather archives confirm whether it rained or snowed that day; posters, building work and shop windows give the period. Tools such as SunCalc turn a shadow’s direction into a time.",
    ),
    analogy: t(
      "Quyosh soati: soya qayerga tushsa, soat shu.",
      "A sundial: where the shadow falls, that is the time.",
    ),
    theory: [
      t(
        "Shimoliy yarimsharda tushda soya shimolga tushadi.",
        "In the northern hemisphere, the midday shadow points north.",
      ),
    ],
    task: t("Savollarga javob bering.", "Answer the questions."),
    hint: t(
      "Soya — quyoshning teskarisi.",
      "A shadow points away from the sun.",
    ),
    widget: {
      type: "quiz",
      questions: [
        {
          ask: t(
            "Toshkentda soya g‘arbga tushyapti. Kunning qaysi vaqti?",
            "In Tashkent, shadows point west. What time of day?",
          ),
          options: [
            t("Ertalab — quyosh sharqda", "Morning — the sun is in the east"),
            t("Kechqurun", "Evening"),
            t("Tush payti", "Midday"),
          ],
          answer: 0,
          explain: t(
            "Quyosh sharqdan chiqadi, soya teskari tomonga tushadi.",
            "The sun rises in the east; the shadow falls the other way.",
          ),
        },
        {
          ask: t(
            "“Kecha olingan” rasmda qor bor, ob-havo arxivida esa kecha +25° va quyoshli. Xulosa?",
            "A photo “taken yesterday” shows snow; the weather archive says yesterday was +25° and sunny. Conclusion?",
          ),
          options: [
            t("Rasm kecha olinmagan", "The photo wasn’t taken yesterday"),
            t("Arxiv xato", "The archive is wrong"),
            t("Hech narsa", "Nothing"),
          ],
          answer: 0,
          explain: t(
            "Mustaqil manba da’voni rad etadi.",
            "An independent source refutes the claim.",
          ),
        },
      ],
    },
  },
  {
    id: 6,
    group: CARE,
    title: t("Metama’lumot va uning yo‘qligi", "Metadata, and its absence"),
    minutes: 6,
    intro: t(
      "Asl fayl EXIF’da GPS koordinatasi va vaqtni saqlashi mumkin (Steganografiya domenidagi Metadata moduli). Lekin Telegram, Instagram va boshqa tarmoqlar yuklanganda uni o‘chiradi. Metama’lumot yo‘qligi — g‘alati emas; borligi esa — tekshirish kerak bo‘lgan da’vo, chunki uni tahrirlash oson.",
      "An original file may carry GPS coordinates and a time in its EXIF (see the Metadata module in the Steganography domain). But Telegram, Instagram and most networks strip it on upload. Missing metadata isn’t odd; present metadata is a claim to check, because it is easy to edit.",
    ),
    analogy: t(
      "Konvertdagi muhr: yo‘qligi shubhali emas, bor bo‘lsa ham qalbaki bo‘lishi mumkin.",
      "A postmark: missing isn’t suspicious, and even a present one might be forged.",
    ),
    theory: [
      t(
        "exiftool -DateTimeOriginal=… bir buyruq bilan sanani o‘zgartiradi.",
        "exiftool -DateTimeOriginal=… changes the date in one command.",
      ),
    ],
    task: t("Savollarga javob bering.", "Answer the questions."),
    hint: t(
      "Metama’lumot — da’vo, dalil emas.",
      "Metadata is a claim, not proof.",
    ),
    widget: {
      type: "quiz",
      questions: [
        {
          ask: t(
            "Telegram’dan yuklangan rasmda EXIF yo‘q. Bu nimani bildiradi?",
            "A photo downloaded from Telegram has no EXIF. What does that mean?",
          ),
          options: [
            t(
              "Tarmoq uni o‘chirgan — odatiy holat",
              "The network stripped it — normal",
            ),
            t("Rasm soxta", "The photo is fake"),
            t("Rasm shifrlangan", "The photo is encrypted"),
          ],
          answer: 0,
          explain: t(
            "Asl faylni muallifdan so‘rash mumkin.",
            "You can ask the author for the original file.",
          ),
        },
        {
          ask: t(
            "EXIF’dagi GPS Samarqandni ko‘rsatadi, rasmda esa Toshkent teleminorasi. Nimaga ishonasiz?",
            "The EXIF GPS says Samarkand; the picture shows the Tashkent TV tower. What do you trust?",
          ),
          options: [
            t(
              "Ko‘rinadigan belgilarga — EXIF tahrirlangan bo‘lishi mumkin",
              "The visible clues — the EXIF may have been edited",
            ),
            t("EXIF’ga", "The EXIF"),
            t("Hech biriga", "Neither"),
          ],
          answer: 0,
          explain: t(
            "Teleminorani ko‘chirib bo‘lmaydi.",
            "Nobody can move a TV tower.",
          ),
        },
      ],
    },
  },
  {
    id: 7,
    group: CARE,
    title: t("Kimni qidirish mumkin emas", "Who not to locate"),
    minutes: 6,
    intro: t(
      "Bir xil usullar bilan oddiy odamning uyini, maktabini yoki ish joyini topish mumkin — bu ta’qib va xavfga olib keladi. Geolokatsiya faqat qonuniy maqsadda: yangiliklarni tekshirish, ruxsat etilgan tekshiruv, sud dalillari. Shaxsiy odamning joyini hech qachon e’lon qilmang.",
      "The same methods can find an ordinary person’s home, school or workplace — which leads to stalking and danger. Geolocate only for lawful purposes: verifying news, an authorised assessment, court evidence. Never publish a private person’s whereabouts.",
    ),
    analogy: t(
      "Qulf ochishni bilish — uy egasiga yordam berish uchun, birovning uyiga kirish uchun emas.",
      "Knowing how to open locks is for helping owners, not for walking into other people’s homes.",
    ),
    theory: [
      t(
        "Shubha bo‘lsa: “Agar bu meni haqimda bo‘lsa, rozi bo‘larmidim?”",
        "When in doubt: “Would I be fine with this if it were about me?”",
      ),
    ],
    task: t("Savollarga javob bering.", "Answer the questions."),
    hint: t("Maqsad va rozilik.", "Purpose and consent."),
    widget: {
      type: "quiz",
      questions: [
        {
          ask: t(
            "Kimdir sizdan ijtimoiy tarmoqdagi bir odamning uyi qayerdaligini topishni so‘radi. Nima qilasiz?",
            "Someone asks you to find where a person on social media lives. What do you do?",
          ),
          options: [
            t(
              "Rad etaman — bu ta’qibga yordam berish",
              "Refuse — it would help a stalker",
            ),
            t("Topib beraman", "Find it for them"),
            t("Pulga topib beraman", "Find it for a fee"),
          ],
          answer: 0,
          explain: t(
            "Qonuniy maqsad va rozilik yo‘q.",
            "No lawful purpose and no consent.",
          ),
        },
        {
          ask: t(
            "Yangiliklardagi rasmni tekshirish uchun geolokatsiya qilish mumkinmi?",
            "May you geolocate a news photo to verify it?",
          ),
          options: [
            t("Ha — bu jurnalistik tekshiruv", "Yes — that is fact-checking"),
            t("Yo‘q, hech qachon", "No, never"),
            t("Faqat tunda", "Only at night"),
          ],
          answer: 0,
          explain: t(
            "Lekin rasmdagi oddiy odamlarning yuzini yashiring.",
            "But blur the faces of private people in it.",
          ),
        },
      ],
    },
  },
  {
    id: 8,
    group: CARE,
    title: t("Yakuniy savollar", "Final questions"),
    minutes: 6,
    intro: t(
      "Modulni takrorlaymiz: teskari qidiruv, eski rasmni fosh qilish, belgilar, ko‘chani o‘qish, vaqtni aniqlash, metama’lumot va axloq.",
      "A review of the module: reverse search, exposing a recycled photo, clues, reading a street, working out the time, metadata and ethics.",
    ),
    analogy: t(
      "Har bir rasm — guvoh. Uni to‘g‘ri so‘roq qilish kerak.",
      "Every photo is a witness. You have to question it properly.",
    ),
    theory: [
      t(
        "Keyingi modulda o‘z raqamli izingizni tekshiramiz.",
        "In the next module we audit your own digital footprint.",
      ),
    ],
    task: t(
      "Barcha savollarga to‘g‘ri javob bering.",
      "Answer every question correctly.",
    ),
    hint: t(
      "Eng eski nusxa — asl manbaga eng yaqin.",
      "The oldest copy is closest to the original.",
    ),
    widget: {
      type: "quiz",
      questions: [
        {
          ask: t(
            "“Bugungi” rasmning eng eski nusxasi 2019-yilda chiqqan. Xulosa?",
            "The oldest copy of a “today” photo appeared in 2019. Conclusion?",
          ),
          options: [
            t(
              "Rasm eski, da’vo yolg‘on",
              "The photo is old; the claim is false",
            ),
            t("Rasm bugungi", "The photo is from today"),
            t("Aniqlab bo‘lmaydi", "Impossible to say"),
          ],
          answer: 0,
          explain: t(
            "Bugun olingan rasm 2019-yilda chiqa olmaydi.",
            "A photo taken today can’t appear in 2019.",
          ),
        },
        {
          ask: t("Qaysi belgi eng kuchli?", "Which clue is strongest?"),
          options: [
            t("Ko‘cha nomi yozilgan lavha", "A street-name plate"),
            t("Bulutlar", "Clouds"),
            t("Daraxtlar", "Trees"),
          ],
          answer: 0,
          explain: t(
            "Yozuv joyni to‘g‘ridan-to‘g‘ri aytadi.",
            "Text names the place directly.",
          ),
        },
        {
          ask: t(
            "O‘zbekiston raqamidagi 01 nimani bildiradi?",
            "What does 01 on an Uzbek number plate mean?",
          ),
          options: [
            t("Toshkent shahri", "The city of Tashkent"),
            t("Mashina yili", "The car’s year"),
            t("Egasining yoshi", "The owner’s age"),
          ],
          answer: 0,
          explain: t(
            "Har bir hududning o‘z kodi bor.",
            "Each region has its own code.",
          ),
        },
        {
          ask: t(
            "Ijtimoiy tarmoqdagi rasmda EXIF yo‘q. Bu?",
            "A social media photo has no EXIF. That is?",
          ),
          options: [
            t("Odatiy — tarmoq o‘chiradi", "Normal — networks strip it"),
            t("Soxtalik belgisi", "A sign of forgery"),
            t("Shifrlash belgisi", "A sign of encryption"),
          ],
          answer: 0,
          explain: t(
            "Yo‘qligi hech narsani isbotlamaydi.",
            "Its absence proves nothing.",
          ),
        },
      ],
    },
  },
];
