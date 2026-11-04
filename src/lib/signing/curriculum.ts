// Academy Intermediate · Software and trust, module 2: Signed software and
// updates. The lessons use ./tools.ts: eight downloads to judge.
import type { CommonWidget, Lesson, Text } from "../anim-lab/types";

export type Widget = CommonWidget | { type: "downloads" };

export const PROGRESS_KEY = "cybervalue:signing:progress:v1";

const t = (uz: string, en: string): Text => ({ uz, en });

const TRUST = t("Ishonch", "Trust");
const UPDATES = t("Yangilanishlar", "Updates");

export const LESSONS: Lesson<Widget>[] = [
  {
    id: 1,
    group: TRUST,
    title: t("Dasturga qanday ishonamiz", "How we trust software"),
    minutes: 5,
    intro: t(
      "Dastur o‘rnatganingizda uning muallifiga kompyuteringizdagi deyarli hamma narsani ishonib topshirasiz. Shuning uchun ikki savol muhim: dastur haqiqatan kimdan kelgan (kelib chiqishi) va yo‘lda o‘zgartirilmaganmi (yaxlitligi)? Bu savollarga kriptografik xesh va raqamli imzo javob beradi — yangi narsa emas, kriptografiya modulida ko‘rgan vositalar.",
      "When you install a program you trust its author with almost everything on your computer. So two questions matter: did it really come from who it says (origin), and was it changed on the way (integrity)? Cryptographic hashes and digital signatures answer them — the same tools you met in the cryptography modules.",
    ),
    analogy: t(
      "Dorixonadagi muhrlangan quti: ishlab chiqaruvchi nomi va buzilmagan muhr.",
      "A sealed box at the pharmacy: the maker’s name and an unbroken seal.",
    ),
    theory: [
      t(
        "Xesh — yaxlitlik, imzo — kelib chiqish va yaxlitlik birga.",
        "A hash proves integrity; a signature proves origin and integrity together.",
      ),
    ],
    task: t("Savollarga javob bering.", "Answer the questions."),
    hint: t("Kimdan va o‘zgarmaganmi.", "From whom, and unchanged?"),
    widget: {
      type: "quiz",
      questions: [
        {
          ask: t(
            "Dasturni o‘rnatishdan oldin qaysi ikki savol muhim?",
            "Which two questions matter before installing software?",
          ),
          options: [
            t(
              "Kimdan kelgan va o‘zgartirilmaganmi",
              "Who it came from, and whether it was changed",
            ),
            t("Rangi va o‘lchami", "Its colour and size"),
            t("Narxi va reytingi", "Its price and rating"),
          ],
          answer: 0,
          explain: t("Kelib chiqish va yaxlitlik.", "Origin and integrity."),
        },
        {
          ask: t(
            "Raqamli imzo nimani isbotlaydi?",
            "What does a digital signature prove?",
          ),
          options: [
            t(
              "Kim imzolagani va fayl o‘zgarmaganini",
              "Who signed it and that the file is unchanged",
            ),
            t("Dasturda xato yo‘qligini", "That the program has no bugs"),
            t("Dastur tezligini", "How fast the program is"),
          ],
          answer: 0,
          explain: t(
            "Imzo — sifat kafolati emas, kelib chiqish kafolati.",
            "A signature vouches for origin, not quality.",
          ),
        },
      ],
    },
  },
  {
    id: 2,
    group: TRUST,
    title: t("Xesh bilan tekshirish", "Checking a hash"),
    minutes: 6,
    intro: t(
      "Ko‘p loyihalar yuklab olish sahifasida faylning SHA-256 xeshini e’lon qiladi. Faylni yuklab, o‘zingiz xeshini hisoblaysiz (`sha256sum fayl` yoki Windows’da `Get-FileHash`) va solishtirasiz. Bitta belgi farq qilsa ham fayl boshqa. Lekin e’tibor bering: xesh va fayl bitta buzilgan saytdan kelsa, hujumchi ikkalasini almashtirishi mumkin — shuning uchun imzo kuchliroq.",
      "Many projects publish a file’s SHA-256 hash on the download page. You download the file, compute its hash yourself (`sha256sum file`, or `Get-FileHash` on Windows) and compare. If even one character differs, the file is different. But note: if the hash and the file come from the same compromised site, an attacker can swap both — which is why a signature is stronger.",
    ),
    analogy: t(
      "Barmoq izi: ikki odamniki hech qachon bir xil bo‘lmaydi.",
      "A fingerprint: no two people share one.",
    ),
    theory: [
      t(
        "MD5 va SHA-1 endi ishonchli emas: SHA-256 yoki undan kuchlisini ishlating.",
        "MD5 and SHA-1 are no longer trustworthy: use SHA-256 or stronger.",
      ),
    ],
    task: t("Savollarga javob bering.", "Answer the questions."),
    hint: t(
      "Bitta belgi — boshqa fayl.",
      "One character off means a different file.",
    ),
    widget: {
      type: "quiz",
      questions: [
        {
          ask: t(
            "Linux’da fayl xeshini qaysi buyruq hisoblaydi?",
            "Which Linux command computes a file’s hash?",
          ),
          options: [
            t("sha256sum", "sha256sum"),
            t("chmod", "chmod"),
            t("ping", "ping"),
          ],
          answer: 0,
          explain: t("Windows’da — Get-FileHash.", "On Windows, Get-FileHash."),
        },
        {
          ask: t(
            "Hisoblangan xesh e’lon qilinganidan farq qiladi. Nima qilasiz?",
            "Your hash differs from the published one. What do you do?",
          ),
          options: [
            t("Faylni o‘rnatmayman", "Don’t install the file"),
            t("Baribir o‘rnataman", "Install it anyway"),
            t("Fayl nomini o‘zgartiraman", "Rename the file"),
          ],
          answer: 0,
          explain: t(
            "Fayl o‘zgartirilgan yoki buzilgan.",
            "The file was altered or corrupted.",
          ),
        },
      ],
    },
  },
  {
    id: 3,
    group: TRUST,
    title: t("Kod imzolash", "Code signing"),
    minutes: 6,
    intro: t(
      "Kod imzolashda nashriyotchi dasturni o‘zining maxfiy kaliti bilan imzolaydi, sertifikat esa bu kalit kimga tegishli ekanini tasdiqlaydi. Windows “Publisher: Mozilla Corporation” kabi ma’lumotni ko‘rsatadi, macOS Gatekeeper va notarizatsiyadan foydalanadi, Linux paket menejerlari repo GPG kalitlarini tekshiradi. Imzo bo‘lishi yetarli emas: imzolovchi kutilgan kompaniya ekanini ham tekshiring.",
      "In code signing, the publisher signs the program with its private key, and a certificate confirms who that key belongs to. Windows shows details like “Publisher: Mozilla Corporation”, macOS uses Gatekeeper and notarisation, and Linux package managers check the repository’s GPG keys. Being signed isn’t enough: check the signer is the company you expect.",
    ),
    analogy: t(
      "Hujjatdagi muhr: muhr bor-yo‘qligi emas, kimning muhri ekani muhim.",
      "A stamp on a document: what matters is whose stamp, not just that there is one.",
    ),
    theory: [
      t(
        "Imzolash kaliti o‘g‘irlansa, sertifikat bekor qilinadi (revocation).",
        "If a signing key is stolen, its certificate is revoked.",
      ),
    ],
    task: t("Savollarga javob bering.", "Answer the questions."),
    hint: t("Kim imzolagan?", "Who signed it?"),
    widget: {
      type: "quiz",
      questions: [
        {
          ask: t(
            "Zoom o‘rnatuvchisini “Fast Soft Ltd” imzolagan. Bu xavfsizmi?",
            "A Zoom installer is signed by “Fast Soft Ltd”. Is it safe?",
          ),
          options: [
            t("Yo‘q — imzolovchi Zoom emas", "No — the signer isn’t Zoom"),
            t("Ha, imzo bor-ku", "Yes, it’s signed"),
            t("Farqi yo‘q", "It makes no difference"),
          ],
          answer: 0,
          explain: t(
            "Imzolovchi nomini kutilgan nashriyotchi bilan solishtiring.",
            "Compare the signer with the publisher you expect.",
          ),
        },
        {
          ask: t(
            "Linux’da apt paketlarni nima bilan tekshiradi?",
            "What does apt check packages against on Linux?",
          ),
          options: [
            t("Repozitoriyning GPG kaliti", "The repository’s GPG key"),
            t("Fayl nomi", "The file name"),
            t("Yuklab olish tezligi", "The download speed"),
          ],
          answer: 0,
          explain: t(
            "Noma’lum repo qo‘shish — uning kalitiga ishonish demak.",
            "Adding an unknown repo means trusting its key.",
          ),
        },
      ],
    },
  },
  {
    id: 4,
    group: UPDATES,
    title: t("Yuklamalarni baholash", "Judging downloads"),
    minutes: 8,
    intro: t(
      "Quyida xodimlar bir haftada duch kelgan sakkizta yuklama va yangilanish: har birining manbai va imzo yoki xesh tekshiruvi natijasi. To‘rttasini o‘rnatmaslik kerak. Qaysilari?",
      "Below are eight downloads and updates staff came across in one week, each with its source and the result of a signature or hash check. Four of them should not be installed. Which ones?",
    ),
    analogy: t(
      "Bozordagi mahsulot: qayerdan kelgan, muhri butunmi, ishlab chiqaruvchi kimligini tekshirasiz.",
      "Goods at a market: where they came from, whether the seal is intact, who made them.",
    ),
    theory: [
      t(
        "Eng xavfsiz manba — dasturning o‘z yangilagichi yoki rasmiy do‘kon.",
        "The safest source is the program’s own updater or an official store.",
      ),
    ],
    task: t(
      "O‘rnatmaslik kerak bo‘lganlarni belgilang.",
      "Tick the ones not to install.",
    ),
    hint: t(
      "Imzosiz, boshqa imzolovchi, mos kelmagan xesh, soxta yangilanish.",
      "Unsigned, the wrong signer, a mismatched hash, a fake update.",
    ),
    widget: { type: "downloads" },
  },
  {
    id: 5,
    group: UPDATES,
    title: t("Yangilanishlar qanday ishlaydi", "How updates work"),
    minutes: 5,
    intro: t(
      "Yaxshi yangilash tizimi uch narsani qiladi: yangilanishni faqat HTTPS orqali yuklaydi, imzosini nashriyotchi kaliti bilan tekshiradi va eski, zaif versiyaga qaytarishga (downgrade) yo‘l qo‘ymaydi. Brauzerlar, operatsion tizimlar va do‘konlar shunday ishlaydi. Shuning uchun dasturni o‘zining yangilagichi orqali yangilash xavfsiz, “brauzeringiz eskirgan” degan sayt oynasi esa doim soxta.",
      "A good update system does three things: it downloads updates only over HTTPS, verifies the signature with the publisher’s key, and refuses to roll back to an older, vulnerable version (a downgrade). Browsers, operating systems and app stores work this way. That’s why updating a program through its own updater is safe, while a website pop-up saying “your browser is out of date” is always fake.",
    ),
    analogy: t(
      "Bankdan kelgan yangi karta — pochta orqali, muhrlangan va eski karta bekor qilinadi.",
      "A new bank card: sent by post, sealed, and the old one cancelled.",
    ),
    theory: [
      t(
        "Ko‘p ilovalarda avtomatik yangilanishni yoqish eng oddiy himoya.",
        "Turning on automatic updates is the simplest protection for most apps.",
      ),
    ],
    task: t("Savollarga javob bering.", "Answer the questions."),
    hint: t(
      "HTTPS, imzo, orqaga qaytmaslik.",
      "HTTPS, a signature, no rollback.",
    ),
    widget: {
      type: "quiz",
      questions: [
        {
          ask: t(
            "Sayt “Chrome eskirgan, shu faylni yuklang” deydi. Bu?",
            "A site says “Chrome is out of date, download this file”. It is?",
          ),
          options: [
            t("Soxta yangilanish", "A fake update"),
            t("Rasmiy yangilanish", "An official update"),
            t("Muhim xavfsizlik tuzatishi", "An important security fix"),
          ],
          answer: 0,
          explain: t(
            "Brauzer o‘zini o‘zi yangilaydi.",
            "The browser updates itself.",
          ),
        },
        {
          ask: t("Downgrade hujumi nima?", "What is a downgrade attack?"),
          options: [
            t(
              "Eski, zaif versiyani o‘rnatishga majburlash",
              "Forcing an older, vulnerable version to install",
            ),
            t("Tezlikni kamaytirish", "Slowing a program down"),
            t("Ekranni xiralashtirish", "Dimming the screen"),
          ],
          answer: 0,
          explain: t(
            "Yaxshi yangilagich eski versiyani rad etadi.",
            "A good updater refuses older versions.",
          ),
        },
      ],
    },
  },
  {
    id: 6,
    group: UPDATES,
    title: t("Xavfsiz va xavfli odatlar", "Safe and risky habits"),
    minutes: 5,
    intro: t(
      "Dastur o‘rnatish va yangilash odatlari kompyuter xavfsizligini ko‘p jihatdan belgilaydi. Har bir odatni to‘g‘ri guruhga ajrating.",
      "Habits around installing and updating software decide a lot about a computer’s security. Sort each habit into the right group.",
    ),
    analogy: t(
      "Ovqatni ishonchli do‘kondan olish va yaroqlilik muddatini tekshirish.",
      "Buying food from a trusted shop and checking the use-by date.",
    ),
    theory: [
      t(
        "Kompaniyalarda xodimlar faqat ruxsat etilgan ro‘yxatdan dastur o‘rnatadi.",
        "In companies, staff install software only from an approved list.",
      ),
    ],
    task: t("Odatlarni ajrating.", "Sort the habits."),
    hint: t(
      "Rasmiy manba va tekshiruv — xavfsiz.",
      "Official sources and checks are safe.",
    ),
    widget: {
      type: "sort",
      buckets: [
        { id: "safe", label: t("Xavfsiz", "Safe") },
        { id: "risky", label: t("Xavfli", "Risky") },
      ],
      items: [
        {
          label: t(
            "Avtomatik yangilanishni yoqish",
            "Turning on automatic updates",
          ),
          bucket: "safe",
        },
        {
          label: t(
            "Rasmiy saytdan yuklab, xeshni tekshirish",
            "Downloading from the official site and checking the hash",
          ),
          bucket: "safe",
        },
        {
          label: t(
            "Imzolovchi nomini tekshirish",
            "Checking the signer’s name",
          ),
          bucket: "safe",
        },
        {
          label: t(
            "“Crack” qilingan pullik dasturni o‘rnatish",
            "Installing a “cracked” copy of paid software",
          ),
          bucket: "risky",
        },
        {
          label: t(
            "Imzo ogohlantirishini e’tiborsiz qoldirish",
            "Clicking past a signature warning",
          ),
          bucket: "risky",
        },
        {
          label: t(
            "Reklamadagi “bepul yuklab olish” tugmasi",
            "A “free download” button in an ad",
          ),
          bucket: "risky",
        },
      ],
    },
  },
  {
    id: 7,
    group: UPDATES,
    title: t("Ta’minot zanjiri va imzolar", "Supply chain and signing"),
    minutes: 5,
    intro: t(
      "Ba’zan hujumchilar dastur ishlab chiqaruvchining o‘zini buzadi va zararli kodni rasmiy, imzolangan yangilanishga qo‘shadi (masalan, SolarWinds hodisasi). Imzo bunday holatda ham “to‘g‘ri” ko‘rinadi. Shuning uchun imzo — zarur, lekin yagona himoya emas: eng kam huquq, tarmoqni ajratish, xatti-harakatni kuzatish va tez yangilanish rejasi ham kerak.",
      "Sometimes attackers break into the software maker itself and add harmful code to an official, signed update (the SolarWinds incident, for example). The signature still looks “right” in that case. So signing is necessary but not the only defence: least privilege, network segmentation, behaviour monitoring and a quick patch plan are needed too.",
    ),
    analogy: t(
      "Zavodning o‘zida ifloslangan mahsulot — muhr butun, lekin ichi buzuq.",
      "A product contaminated at the factory: the seal is fine, the contents aren’t.",
    ),
    theory: [
      t(
        "Reproducible builds va SBOM nima qurilganini mustaqil tekshirishga yordam beradi.",
        "Reproducible builds and SBOMs help check independently what was built.",
      ),
    ],
    task: t("Savollarga javob bering.", "Answer the questions."),
    hint: t(
      "Imzo — zarur, yetarli emas.",
      "Signing is necessary, not sufficient.",
    ),
    widget: {
      type: "quiz",
      questions: [
        {
          ask: t(
            "Ishlab chiqaruvchi buzilsa, imzo nimani kafolatlaydi?",
            "If the maker is compromised, what does a signature guarantee?",
          ),
          options: [
            t(
              "Faqat fayl o‘sha ishlab chiqaruvchidan kelganini",
              "Only that the file came from that maker",
            ),
            t(
              "Faylda zararli kod yo‘qligini",
              "That the file has no harmful code",
            ),
            t("Hech narsani", "Nothing at all"),
          ],
          answer: 0,
          explain: t(
            "Imzo kelib chiqishni ko‘rsatadi, xavfsizlikni emas.",
            "A signature shows origin, not safety.",
          ),
        },
        {
          ask: t(
            "Imzodan tashqari qaysi himoya yordam beradi?",
            "Besides signing, which defence helps?",
          ),
          options: [
            t(
              "Eng kam huquq va xatti-harakatni kuzatish",
              "Least privilege and behaviour monitoring",
            ),
            t("Yangilanishni o‘chirish", "Turning updates off"),
            t("Parolni ekranga yozish", "Writing the password on the screen"),
          ],
          answer: 0,
          explain: t(
            "Bir nechta qatlam — bitta nuqtaga tayanmaslik.",
            "Layers mean no single point of failure.",
          ),
        },
      ],
    },
  },
  {
    id: 8,
    group: UPDATES,
    title: t("Yakuniy savollar", "Final questions"),
    minutes: 5,
    intro: t(
      "Dasturga ishonch: rasmiy manba, mos xesh, kutilgan imzolovchi va dasturning o‘z yangilagichi. Imzosiz fayllar, boshqa kompaniya imzosi, mos kelmagan xesh va saytdagi “yangilanish” oynalari — to‘xtash belgilari. Keyingi modul — dastur ishlamay qolganda: crash hisobotlari va loglarni o‘qish.",
      "Trusting software means an official source, a matching hash, the expected signer and the program’s own updater. Unsigned files, a different company’s signature, a mismatched hash and website “update” pop-ups are stop signs. Next module: when software breaks — reading crash reports and logs.",
    ),
    analogy: t(
      "Pochta posilkasi: jo‘natuvchi, muhr va kuzatuv raqami.",
      "A parcel: the sender, the seal and the tracking number.",
    ),
    theory: [
      t(
        "Shubha bo‘lsa — o‘rnatmang va IT bo‘limidan so‘rang.",
        "When in doubt, don’t install — ask IT.",
      ),
    ],
    task: t("Savollarga javob bering.", "Answer the questions."),
    hint: t(
      "Manba, xesh, imzolovchi, yangilagich.",
      "Source, hash, signer, updater.",
    ),
    widget: {
      type: "quiz",
      questions: [
        {
          ask: t(
            "Dasturni yangilashning eng xavfsiz yo‘li?",
            "The safest way to update a program?",
          ),
          options: [
            t(
              "Dasturning o‘z yangilagichi yoki rasmiy do‘kon",
              "Its own updater or an official store",
            ),
            t("Forumdagi havola", "A link on a forum"),
            t("Emaildagi ilova", "An email attachment"),
          ],
          answer: 0,
          explain: t(
            "Ular imzoni avtomatik tekshiradi.",
            "They check the signature automatically.",
          ),
        },
        {
          ask: t(
            "Qaysi xesh algoritmi bugun ishonchli?",
            "Which hash algorithm is trustworthy today?",
          ),
          options: [
            t("SHA-256", "SHA-256"),
            t("MD5", "MD5"),
            t("SHA-1", "SHA-1"),
          ],
          answer: 0,
          explain: t(
            "MD5 va SHA-1 da to‘qnashuvlar topilgan.",
            "Collisions have been found in MD5 and SHA-1.",
          ),
        },
      ],
    },
  },
];
