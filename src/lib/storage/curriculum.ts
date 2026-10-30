// Academy Intermediate · Cloud security, module 3: Storage and secrets.
// The lessons use ./tools.ts: five buckets to audit for exposure.
import type { CommonWidget, Lesson, Text } from "../anim-lab/types";

export type Widget = CommonWidget | { type: "buckets" };

export const PROGRESS_KEY = "cybervalue:storage:progress:v1";

const t = (uz: string, en: string): Text => ({ uz, en });

const STORAGE = t("Saqlash", "Storage");
const SECRETS = t("Sirlar", "Secrets");

export const LESSONS: Lesson<Widget>[] = [
  {
    id: 1,
    group: STORAGE,
    title: t("Obyekt saqlash", "Object storage"),
    minutes: 5,
    intro: t(
      "Bulutdagi fayllarning ko‘pi obyekt saqlashda yotadi: AWS S3, Azure Blob Storage, Google Cloud Storage. Fayllar (obyektlar) “bucket” yoki “container” ichida saqlanadi va har biriga URL orqali murojaat qilish mumkin. Bu juda qulay — sayt rasmlari, zaxira nusxalar, loglar, foydalanuvchi yuklagan fayllar — lekin bitta noto‘g‘ri sozlama butun bucket’ni internetga ochib qo‘yadi.",
      "Most files in the cloud live in object storage: AWS S3, Azure Blob Storage, Google Cloud Storage. Files (objects) sit inside a “bucket” or “container”, and each can be reached by URL. That makes it very handy — site images, backups, logs, user uploads — but one wrong setting opens the whole bucket to the internet.",
    ),
    analogy: t(
      "Bucket — ombor; har bir quti — obyekt; eshik ochiq qolsa, ko‘chadagi har kim kiradi.",
      "A bucket is a warehouse and each box an object; leave the door open and anyone walks in.",
    ),
    theory: [
      t(
        "Bucket nomlari global va taxmin qilinadigan bo‘ladi: “kompaniya-backups” ni skanerlar tez topadi.",
        "Bucket names are global and guessable: scanners quickly find “company-backups”.",
      ),
    ],
    task: t("Savollarga javob bering.", "Answer the questions."),
    hint: t("Bucket ichida obyektlar.", "Objects live inside buckets."),
    widget: {
      type: "quiz",
      questions: [
        {
          ask: t(
            "AWS’ning obyekt saqlash xizmati?",
            "AWS’s object storage service?",
          ),
          options: [t("S3", "S3"), t("EC2", "EC2"), t("Route 53", "Route 53")],
          answer: 0,
          explain: t(
            "Azure’da — Blob Storage, Google’da — Cloud Storage.",
            "On Azure it’s Blob Storage; on Google, Cloud Storage.",
          ),
        },
        {
          ask: t(
            "Nega bucket nomini sir deb hisoblab bo‘lmaydi?",
            "Why can’t a bucket name be treated as a secret?",
          ),
          options: [
            t(
              "Nomlar taxmin qilinadi va avtomatik skanerlanadi",
              "Names are guessable and scanned for automatically",
            ),
            t("Nomlar shifrlangan", "Names are encrypted"),
            t("Nomlar hech qayerda ko‘rinmaydi", "Names never appear anywhere"),
          ],
          answer: 0,
          explain: t(
            "Himoya — ruxsatlarda, nomda emas.",
            "Protection lives in the permissions, not the name.",
          ),
        },
      ],
    },
  },
  {
    id: 2,
    group: STORAGE,
    title: t("Ommaviy kirish", "Public access"),
    minutes: 6,
    intro: t(
      'Bucket uch yo‘l bilan ochilishi mumkin: obyekt ACL’i “public-read”, bucket siyosatida `"Principal": "*"` yoki hamma uchun ro‘yxatlash (list) huquqi. Ro‘yxatlash ayniqsa xavfli: hujumchi barcha fayl nomlarini ko‘radi. Shuning uchun hisob darajasida “Block Public Access” yoqiladi va ommaviy bo‘lishi kerak bo‘lgan yagona narsa — sayt fayllari — alohida bucket’da, iloji bo‘lsa CDN orqali beriladi.',
      'A bucket can be opened three ways: an object ACL of “public-read”, `"Principal": "*"` in the bucket policy, or list rights for everyone. Listing is especially bad: the attacker sees every file name. So “Block Public Access” is switched on at account level, and the one thing that must be public — the site’s files — goes in its own bucket, served through a CDN where possible.',
    ),
    analogy: t(
      "Do‘kon vitrinasi hammaga ochiq — ombor esa yo‘q.",
      "The shop window is open to all; the stockroom isn’t.",
    ),
    theory: [
      t(
        "AWS 2023 yildan beri yangi bucket’larda Block Public Access’ni sukut bo‘yicha yoqadi.",
        "Since 2023, AWS turns Block Public Access on by default for new buckets.",
      ),
    ],
    task: t("Savollarga javob bering.", "Answer the questions."),
    hint: t(
      "Faqat atayin ommaviy narsa ochiq.",
      "Only things meant for everyone are public.",
    ),
    widget: {
      type: "quiz",
      questions: [
        {
          ask: t(
            'Bucket siyosatidagi `"Principal": "*"` nimani bildiradi?',
            'What does `"Principal": "*"` in a bucket policy mean?',
          ),
          options: [
            t(
              "Hamma, internetdagi har kim",
              "Everyone, anyone on the internet",
            ),
            t("Faqat administratorlar", "Administrators only"),
            t("Hech kim", "Nobody"),
          ],
          answer: 0,
          explain: t(
            "Allow bilan birga — bucket ochiq.",
            "With an Allow, the bucket is public.",
          ),
        },
        {
          ask: t(
            "Sayt rasmlari ommaviy bo‘lishi kerak. Eng yaxshi yo‘l?",
            "The site’s images must be public. The best way?",
          ),
          options: [
            t(
              "Alohida bucket’da va CDN orqali",
              "In their own bucket, served through a CDN",
            ),
            t(
              "Zaxira nusxalar bilan bitta ochiq bucket’da",
              "In one public bucket with the backups",
            ),
            t(
              "Block Public Access’ni hamma joyda o‘chirish",
              "Turning Block Public Access off everywhere",
            ),
          ],
          answer: 0,
          explain: t(
            "Ommaviy va maxfiy narsalar hech qachon aralashmaydi.",
            "Public and private never share a bucket.",
          ),
        },
      ],
    },
  },
  {
    id: 3,
    group: STORAGE,
    title: t("Bucket’larni tekshirish", "Auditing buckets"),
    minutes: 8,
    intro: t(
      "Quyida kompaniyaning beshta bucket’i: har birida nima saqlanadi va kirish qanday. Ommaviy bo‘lish o‘z-o‘zidan xato emas — muhimi ichidagi narsa. Qaysi bucket’lar ko‘rinmasligi kerak bo‘lgan ma’lumotni ochib qo‘ygan?",
      "Below are a company’s five buckets: what each holds and how it can be reached. Being public isn’t a mistake in itself — what matters is what’s inside. Which buckets expose data that shouldn’t be seen?",
    ),
    analogy: t(
      "Ochiq kitob javoni — yaxshi; ochiq tibbiy kartalar javoni — yo‘q.",
      "An open bookshelf is fine; an open shelf of medical records isn’t.",
    ),
    theory: [
      t(
        "AWS Config, Azure Policy va CSPM vositalari ochiq bucket’larni avtomatik topadi.",
        "AWS Config, Azure Policy and CSPM tools find public buckets automatically.",
      ),
    ],
    task: t(
      "Ma’lumot sizdirayotgan bucket’larni belgilang.",
      "Tick the buckets that are leaking data.",
    ),
    hint: t(
      "Ichidagi narsa hammaga mo‘ljallanganmi?",
      "Is what’s inside meant for everyone?",
    ),
    widget: { type: "buckets" },
  },
  {
    id: 4,
    group: STORAGE,
    title: t("Shifrlash", "Encryption"),
    minutes: 6,
    intro: t(
      "Ikki xil shifrlash bor. Uzatishda (in transit) — TLS/HTTPS: ma’lumot tarmoqda o‘g‘irlanmasin. Saqlashda (at rest) — disk va obyektlar shifrlanadi: o‘g‘irlangan disk yoki zaxira o‘qilmasin. Bulutda kalitlarni KMS (Key Management Service) boshqaradi: kim kalitdan foydalana olishi IAM bilan cheklanadi va har bir foydalanish logga yoziladi. Esda tuting: shifrlash ochiq bucket’ni himoya qilmaydi — ruxsati bor har kim faylni ochiq holda oladi.",
      "There are two kinds of encryption. In transit — TLS/HTTPS — so data can’t be stolen on the network. At rest — disks and objects are encrypted — so a stolen disk or backup can’t be read. In the cloud, keys are managed by a KMS (Key Management Service): IAM limits who can use a key, and every use is logged. Remember: encryption doesn’t protect a public bucket — anyone allowed in gets the file decrypted.",
    ),
    analogy: t(
      "Seyf ichidagi hujjat: o‘g‘ri seyfni olib ketsa ham ocholmaydi — lekin kalitni bergan odamga seyf ochiladi.",
      "A document in a safe: a thief who takes the safe can’t open it — but whoever holds the key can.",
    ),
    theory: [
      t(
        "O‘z KMS kalitingiz (customer-managed key) kalitni o‘chirib, ma’lumotni darhol o‘qib bo‘lmas qilish imkonini beradi.",
        "A customer-managed KMS key lets you disable the key and make the data unreadable at once.",
      ),
    ],
    task: t("Savollarga javob bering.", "Answer the questions."),
    hint: t(
      "Shifrlash — kirish nazoratining o‘rnini bosmaydi.",
      "Encryption doesn’t replace access control.",
    ),
    widget: {
      type: "quiz",
      questions: [
        {
          ask: t(
            "Bucket ochiq, lekin SSE-KMS bilan shifrlangan. Ma’lumot himoyalanganmi?",
            "A bucket is public but encrypted with SSE-KMS. Is the data protected?",
          ),
          options: [
            t(
              "Yo‘q: ruxsat berilgan so‘rovga fayl ochiq holda beriladi",
              "No: an allowed request gets the file decrypted",
            ),
            t("Ha, to‘liq", "Yes, fully"),
            t("Faqat kechasi", "Only at night"),
          ],
          answer: 0,
          explain: t(
            "Saqlashdagi shifrlash o‘g‘irlangan diskdan himoya qiladi, ochiq eshikdan emas.",
            "Encryption at rest protects against stolen disks, not open doors.",
          ),
        },
        {
          ask: t(
            "Uzatishdagi shifrlash nima?",
            "What is encryption in transit?",
          ),
          options: [
            t("TLS/HTTPS", "TLS/HTTPS"),
            t("Diskni shifrlash", "Disk encryption"),
            t("Parol xeshlash", "Password hashing"),
          ],
          answer: 0,
          explain: t("Tarmoqdagi ma’lumot uchun.", "For data on the move."),
        },
      ],
    },
  },
  {
    id: 5,
    group: SECRETS,
    title: t("Sirlar qayerda turadi", "Where secrets live"),
    minutes: 6,
    intro: t(
      "Sirlar — baza parollari, API kalitlari, tokenlar, sertifikat kalitlari. Ular uchun xavfli joylar: kod, Git tarixi, Docker image qatlamlari, CI loglari, jamoa chati va wiki. Xavfsiz joy — sirlar ombori: AWS Secrets Manager, Azure Key Vault, Google Secret Manager yoki HashiCorp Vault. Ilova sirni ishga tushganda, o‘z roli orqali so‘rab oladi — sir hech qayerda fayl sifatida saqlanmaydi.",
      "Secrets are database passwords, API keys, tokens and certificate keys. Dangerous places for them: code, Git history, Docker image layers, CI logs, the team chat and the wiki. The safe place is a secret store: AWS Secrets Manager, Azure Key Vault, Google Secret Manager or HashiCorp Vault. The app asks for the secret at start-up, using its own role — the secret is never saved as a file anywhere.",
    ),
    analogy: t(
      "Pul — bankda, yostiq ostida emas.",
      "Money goes in the bank, not under the mattress.",
    ),
    theory: [
      t(
        "Docker image’dagi o‘chirilgan fayl oldingi qatlamda qoladi — sir ham shunday.",
        "A file deleted in a Docker image survives in an earlier layer — and so does a secret.",
      ),
    ],
    task: t(
      "Bu sir uchun xavfsiz joymi?",
      "Is this a safe place for a secret?",
    ),
    hint: t(
      "Odamlar va nusxalar ko‘p — xavfli.",
      "Many people or many copies means unsafe.",
    ),
    widget: {
      type: "sort",
      buckets: [
        { id: "safe", label: t("Xavfsiz", "Safe") },
        { id: "unsafe", label: t("Xavfli", "Unsafe") },
      ],
      items: [
        {
          label: t("AWS Secrets Manager", "AWS Secrets Manager"),
          bucket: "safe",
        },
        {
          label: t(
            "Dockerfile ichidagi ENV qatori",
            "An ENV line in the Dockerfile",
          ),
          bucket: "unsafe",
        },
        { label: t("Azure Key Vault", "Azure Key Vault"), bucket: "safe" },
        {
          label: t(
            "Jamoa Telegram guruhidagi xabar",
            "A message in the team’s Telegram group",
          ),
          bucket: "unsafe",
        },
        {
          label: t(
            "CI loglarida chop etilgan qiymat",
            "A value printed in the CI logs",
          ),
          bucket: "unsafe",
        },
        { label: t("HashiCorp Vault", "HashiCorp Vault"), bucket: "safe" },
      ],
    },
  },
  {
    id: 6,
    group: SECRETS,
    title: t("Almashtirish va kuzatish", "Rotation and monitoring"),
    minutes: 5,
    intro: t(
      "Eng yaxshi ombordagi sir ham bir kun sizishi mumkin, shuning uchun u muntazam almashtiriladi (rotation) — Secrets Manager baza parolini o‘zi almashtira oladi. Sir sizganda (masalan, GitHub’ga tushganda) tartib: avval bekor qilish va yangisini chiqarish, keyin kim va qachon ishlatganini loglardan tekshirish, so‘ng sababini tuzatish. Tarixdan o‘chirish — oxirgi qadam, birinchi emas.",
      "Even a secret in the best store can leak one day, so it is rotated regularly — Secrets Manager can rotate a database password itself. When a secret does leak (pushed to GitHub, say), the order is: revoke it and issue a new one first, then check the logs for who used it and when, then fix the cause. Scrubbing history is the last step, not the first.",
    ),
    analogy: t(
      "Kalit yo‘qolsa, avval qulfni almashtirasiz, keyin kalitni qidirasiz.",
      "Lose a key and you change the lock first, then look for the key.",
    ),
    theory: [
      t(
        "GitHub secret scanning ommaviy repozitoriydagi ko‘p turdagi kalitlarni provayderga avtomatik xabar qiladi.",
        "GitHub secret scanning reports many kinds of keys in public repositories to their provider automatically.",
      ),
    ],
    task: t("Savollarga javob bering.", "Answer the questions."),
    hint: t("Bekor qilish — birinchi.", "Revoke first."),
    widget: {
      type: "quiz",
      questions: [
        {
          ask: t(
            "Baza paroli GitHub’ga tushib qoldi. Birinchi qadam?",
            "A database password was pushed to GitHub. The first step?",
          ),
          options: [
            t("Parolni almashtirish", "Rotate the password"),
            t("Commit’ni o‘chirish", "Delete the commit"),
            t("Repozitoriyani yopiq qilish", "Make the repository private"),
          ],
          answer: 0,
          explain: t(
            "Botlar ommaviy repozitoriylarni bir necha daqiqada skanerlaydi.",
            "Bots scan public repositories within minutes.",
          ),
        },
        {
          ask: t(
            "Nega sirlar muntazam almashtiriladi?",
            "Why rotate secrets regularly?",
          ),
          options: [
            t(
              "Sizgan, lekin sezilmagan sir uzoq ishlab qolmasligi uchun",
              "So a leak nobody noticed doesn’t keep working",
            ),
            t("Xotira tejash uchun", "To save memory"),
            t("Sabab yo‘q", "There’s no reason"),
          ],
          answer: 0,
          explain: t(
            "Qisqa umr — kichik zarar.",
            "A short life means less damage.",
          ),
        },
      ],
    },
  },
  {
    id: 7,
    group: SECRETS,
    title: t("Zaxira va versiyalar", "Backups and versions"),
    minutes: 5,
    intro: t(
      "Ma’lumotni faqat o‘g‘irlikdan emas, yo‘qotishdan ham himoya qilish kerak. Versioning — o‘chirilgan yoki ustidan yozilgan obyektni qaytaradi. Object Lock (WORM) — belgilangan muddatgacha hech kim, hatto admin ham o‘chira olmaydi: ransomware’ga qarshi kuchli himoya. 3-2-1 qoidasi: 3 nusxa, 2 xil saqlash, 1 tasi boshqa hisob yoki hududda. Zaxirani tiklash muntazam sinab ko‘riladi — tiklanmaydigan zaxira zaxira emas.",
      "Data needs protecting from loss, not only theft. Versioning brings back an object that was deleted or overwritten. Object Lock (WORM) means nobody, not even an admin, can delete it before a set date — strong protection against ransomware. The 3-2-1 rule: 3 copies, on 2 kinds of storage, 1 of them in another account or region. Restores are tested regularly — a backup that won’t restore isn’t a backup.",
    ),
    analogy: t(
      "Muhim hujjatning nusxasini boshqa shahardagi seyfda saqlash.",
      "Keeping a copy of an important document in a safe in another city.",
    ),
    theory: [
      t(
        "Zaxira asosiy hisobdan alohida hisobda bo‘lsa, buzilgan admin uni o‘chira olmaydi.",
        "Backups in a separate account survive a compromised admin in the main one.",
      ),
    ],
    task: t("Savollarga javob bering.", "Answer the questions."),
    hint: t(
      "O‘chirib bo‘lmaydigan va boshqa joyda.",
      "Undeletable, and elsewhere.",
    ),
    widget: {
      type: "quiz",
      questions: [
        {
          ask: t(
            "Ransomware admin huquqi bilan barcha obyektlarni o‘chirmoqchi. Nima to‘xtatadi?",
            "Ransomware with admin rights tries to delete every object. What stops it?",
          ),
          options: [
            t("Object Lock (WORM)", "Object Lock (WORM)"),
            t("Kuchliroq parol", "A stronger password"),
            t("Bucket nomini almashtirish", "Renaming the bucket"),
          ],
          answer: 0,
          explain: t(
            "Muddat tugamaguncha hech kim o‘chira olmaydi.",
            "Nobody can delete it before the date.",
          ),
        },
        {
          ask: t(
            "Zaxira strategiyasining eng ko‘p unutiladigan qismi?",
            "The most often forgotten part of a backup plan?",
          ),
          options: [
            t("Tiklashni sinab ko‘rish", "Testing the restore"),
            t("Zaxira olish", "Taking the backup"),
            t("Zaxiraga nom berish", "Naming the backup"),
          ],
          answer: 0,
          explain: t(
            "Favqulodda vaziyatda bilib qolish — juda kech.",
            "Finding out during the emergency is too late.",
          ),
        },
      ],
    },
  },
  {
    id: 8,
    group: SECRETS,
    title: t("Yakuniy savollar", "Final questions"),
    minutes: 5,
    intro: t(
      "Saqlash va sirlar xavfsizligi to‘rt so‘zga sig‘adi: yopiq (sukut bo‘yicha), shifrlangan, almashtiriladigan va tiklanadigan. Ommaviy narsalar alohida, sirlar faqat omborda va zaxiralar boshqa joyda. Keyingi modul — konteynerlar: ilovalar qanday qadoqlanadi va ishga tushiriladi.",
      "Storage and secrets security fits in four words: private (by default), encrypted, rotated and restorable. Public things stay separate, secrets live only in a store, and backups are kept elsewhere. Next module: containers — how applications are packaged and run.",
    ),
    analogy: t(
      "Uydagi qimmatbaho narsalar: qulflangan, sug‘urtalangan va nusxasi bor.",
      "Valuables at home: locked up, insured, and with a copy somewhere else.",
    ),
    theory: [
      t(
        "Har oy so‘rang: qaysi bucket’lar ommaviy va nega?",
        "Every month, ask: which buckets are public, and why?",
      ),
    ],
    task: t("Savollarga javob bering.", "Answer the questions."),
    hint: t(
      "Yopiq, shifrlangan, almashtiriladigan, tiklanadigan.",
      "Private, encrypted, rotated, restorable.",
    ),
    widget: {
      type: "quiz",
      questions: [
        {
          ask: t(
            "Qaysi bucket ommaviy bo‘lishi mumkin?",
            "Which bucket may be public?",
          ),
          options: [
            t("Sayt rasmlari", "The website’s images"),
            t("Baza zaxiralari", "Database backups"),
            t("Xodimlar hujjatlari", "Staff documents"),
          ],
          answer: 0,
          explain: t(
            "Ular baribir har tashrifchiga beriladi.",
            "Every visitor gets them anyway.",
          ),
        },
        {
          ask: t(
            "Ilova baza parolini qayerdan olishi kerak?",
            "Where should an app get its database password?",
          ),
          options: [
            t(
              "O‘z roli orqali sirlar omboridan",
              "From the secret store, using its role",
            ),
            t("Kod ichidagi konstantadan", "From a constant in the code"),
            t("README fayldan", "From the README"),
          ],
          answer: 0,
          explain: t(
            "Sir hech qayerda fayl sifatida saqlanmaydi.",
            "The secret is never saved as a file.",
          ),
        },
      ],
    },
  },
];
