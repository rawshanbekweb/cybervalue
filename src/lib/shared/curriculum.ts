// Academy Intermediate · Cloud security, module 1: Shared responsibility.
// The lessons use ./tools.ts: who owns each layer under IaaS, PaaS and SaaS.
import type { CommonWidget, Lesson, Text } from "../anim-lab/types";
import type { Model } from "./tools";

export type Widget = CommonWidget | { type: "split"; model: Model };

export const PROGRESS_KEY = "cybervalue:shared:progress:v1";

const t = (uz: string, en: string): Text => ({ uz, en });

const MODELS = t("Xizmat modellari", "Service models");
const PRACTICE = t("Amalda", "In practice");

export const LESSONS: Lesson<Widget>[] = [
  {
    id: 1,
    group: MODELS,
    title: t("IaaS, PaaS, SaaS", "IaaS, PaaS, SaaS"),
    minutes: 6,
    intro: t(
      "Bulut — boshqa birovning ma’lumotlar markazidagi kompyuterlarni ijaraga olish. Uch asosiy model bor. IaaS (Infrastructure as a Service): virtual server, disk va tarmoq olasiz, operatsion tizimdan yuqorisi sizniki. PaaS (Platform as a Service): kodingizni yuklaysiz, server va OS’ni provayder boshqaradi. SaaS (Software as a Service): tayyor dasturdan foydalanasiz — pochta, hujjatlar, CRM.",
      "The cloud means renting computers in someone else’s data centre. There are three main models. IaaS (Infrastructure as a Service): you get virtual servers, disks and networks, and everything from the operating system up is yours. PaaS (Platform as a Service): you upload your code, and the provider runs the servers and the OS. SaaS (Software as a Service): you use finished software — email, documents, a CRM.",
    ),
    analogy: t(
      "IaaS — bo‘sh kvartirani ijaraga olish, PaaS — mebelli kvartira, SaaS — mehmonxona xonasi.",
      "IaaS is renting an empty flat, PaaS a furnished one, SaaS a hotel room.",
    ),
    theory: [
      t(
        "Model qanchalik “tayyor” bo‘lsa, siz shuncha kam narsani boshqarasiz — va shuncha kam narsani sozlay olasiz.",
        "The more finished the model, the less you manage — and the less you can tune.",
      ),
    ],
    task: t(
      "Har bir xizmatni modelga ajrating.",
      "Sort each service into its model.",
    ),
    hint: t(
      "Server sizdami, platformami yoki tayyor dasturmi?",
      "Is it a server, a platform or finished software?",
    ),
    widget: {
      type: "sort",
      buckets: [
        { id: "iaas", label: t("IaaS", "IaaS") },
        { id: "paas", label: t("PaaS", "PaaS") },
        { id: "saas", label: t("SaaS", "SaaS") },
      ],
      items: [
        {
          label: t("AWS EC2 virtual serveri", "An AWS EC2 virtual machine"),
          bucket: "iaas",
        },
        {
          label: t("Google Workspace pochta", "Google Workspace email"),
          bucket: "saas",
        },
        {
          label: t(
            "Kod yuklanadigan Heroku yoki App Engine",
            "Heroku or App Engine, where you push code",
          ),
          bucket: "paas",
        },
        {
          label: t(
            "Azure’dagi virtual tarmoq va disklar",
            "Virtual networks and disks on Azure",
          ),
          bucket: "iaas",
        },
        { label: t("Microsoft 365", "Microsoft 365"), bucket: "saas" },
        {
          label: t(
            "Boshqariladigan ma’lumotlar bazasi (RDS, Cloud SQL)",
            "A managed database (RDS, Cloud SQL)",
          ),
          bucket: "paas",
        },
      ],
    },
  },
  {
    id: 2,
    group: MODELS,
    title: t("Mas’uliyat chizig‘i", "The responsibility line"),
    minutes: 5,
    intro: t(
      "Shared responsibility modeli oddiy qoida: provayder bulutning xavfsizligi uchun (security OF the cloud) — binolar, uskunalar, virtualizatsiya — javob beradi, siz esa buluttagi narsalaringiz xavfsizligi uchun (security IN the cloud) — sozlamalar, ma’lumotlar, foydalanuvchilar. Chiziq modelga qarab siljiydi, lekin ma’lumotlaringiz va ularga kim kirishi har doim sizning javobgarligingizda qoladi.",
      "The shared responsibility model is a simple rule: the provider is responsible for security OF the cloud — buildings, hardware, virtualisation — and you are responsible for security IN the cloud — your settings, data and users. The line moves with the model, but your data, and who can reach it, always stays your responsibility.",
    ),
    analogy: t(
      "Bank seyfini ijaraga oldingiz: bank binoni qo‘riqlaydi, kalitni kimga berishni esa siz hal qilasiz.",
      "You rent a bank safe-deposit box: the bank guards the building, you decide who gets the key.",
    ),
    theory: [
      t(
        "Har bir provayder o‘z chizig‘ini hujjatda chizadi: AWS, Azure va Google’ning “shared responsibility” sahifalarini o‘qing.",
        "Each provider draws its own line in writing: read the AWS, Azure and Google “shared responsibility” pages.",
      ),
    ],
    task: t("Savollarga javob bering.", "Answer the questions."),
    hint: t("Ma’lumot — har doim sizniki.", "The data is always yours."),
    widget: {
      type: "quiz",
      questions: [
        {
          ask: t(
            "Qaysi biri SaaS’da ham mijoz javobgarligida qoladi?",
            "Which stays the customer’s job even with SaaS?",
          ),
          options: [
            t(
              "Kim kirishi va MFA yoqilgani",
              "Who has access, and whether MFA is on",
            ),
            t("Ma’lumotlar markazi qo‘riqchilari", "The data centre guards"),
            t("Server uskunasi", "The server hardware"),
          ],
          answer: 0,
          explain: t(
            "Eng mustahkam xizmat ham zaif parolni himoya qilmaydi.",
            "The strongest service can’t protect a weak password.",
          ),
        },
        {
          ask: t(
            "“Security OF the cloud” uchun kim javobgar?",
            "Who is responsible for “security OF the cloud”?",
          ),
          options: [
            t("Provayder", "The provider"),
            t("Mijoz", "The customer"),
            t("Hech kim", "Nobody"),
          ],
          answer: 0,
          explain: t(
            "“IN the cloud” — mijozniki.",
            "“IN the cloud” is the customer’s.",
          ),
        },
      ],
    },
  },
  {
    id: 3,
    group: MODELS,
    title: t("IaaS’da kim nima qiladi", "Who does what with IaaS"),
    minutes: 7,
    intro: t(
      "Kompaniya veb-saytini EC2 virtual serverida ishlatadi. Har bir qatlam uchun kim javobgar: provayder (AWS) yoki kompaniyaning o‘zi?",
      "A company runs its website on an EC2 virtual server. For each layer, who is responsible: the provider (AWS) or the company itself?",
    ),
    analogy: t(
      "Bo‘sh kvartira: devor va quvurlar egasiniki, qulf, mebel va kimni kiritish — sizniki.",
      "An empty flat: the walls and pipes are the landlord’s; the lock, the furniture and who you let in are yours.",
    ),
    theory: [
      t(
        "IaaS’da OS yangilanishlari ham sizda — “bulutda” degani “yamalgan” degani emas.",
        "With IaaS the OS patches are yours too — “in the cloud” doesn’t mean “patched”.",
      ),
    ],
    task: t(
      "Har bir qatlam uchun egasini tanlang.",
      "Choose the owner of each layer.",
    ),
    hint: t(
      "Virtualizatsiyadan pasti — provayder, yuqorisi — siz.",
      "Below the virtualisation is the provider; above it is you.",
    ),
    widget: { type: "split", model: "iaas" },
  },
  {
    id: 4,
    group: MODELS,
    title: t("SaaS’da kim nima qiladi", "Who does what with SaaS"),
    minutes: 6,
    intro: t(
      "Endi xuddi shu kompaniya pochta va hujjatlar uchun Google Workspace ishlatadi. Chiziq qanchalik siljiydi? Qaysi qatlam hali ham kompaniyaning o‘zida qoladi?",
      "Now the same company uses Google Workspace for email and documents. How far does the line move? Which layer is still the company’s own?",
    ),
    analogy: t(
      "Mehmonxona: tozalash, isitish va qo‘riqlash — mehmonxonaniki; xona kalitini kimga berishingiz — o‘zingizniki.",
      "A hotel: cleaning, heating and security are the hotel’s; who you give your room key to is yours.",
    ),
    theory: [
      t(
        "SaaS buzilishlarining ko‘pi — o‘g‘irlangan parol va MFA’siz hisoblar, provayder xatosi emas.",
        "Most SaaS breaches are stolen passwords and accounts without MFA, not provider failures.",
      ),
    ],
    task: t(
      "Har bir qatlam uchun egasini tanlang.",
      "Choose the owner of each layer.",
    ),
    hint: t("Faqat bittasi sizda qoladi.", "Only one stays with you."),
    widget: { type: "split", model: "saas" },
  },
  {
    id: 5,
    group: PRACTICE,
    title: t("Hodisalar kimning aybi", "Whose fault was it"),
    minutes: 6,
    intro: t(
      "Bulutdagi ma’lum buzilishlarning ko‘pchiligi provayderning emas, mijozning sozlama xatosidan kelib chiqadi: hammaga ochiq qoldirilgan saqlash bucket’i, internetga ochiq ma’lumotlar bazasi, GitHub’ga tushib qolgan kirish kaliti, juda keng huquqli rol. Gartner bulut buzilishlarining aksariyati mijoz xatosi bo‘lishini bashorat qilgan. Shuning uchun keyingi modullar aynan shu sozlamalarga bag‘ishlangan.",
      "Most well-known cloud breaches come from customer configuration mistakes, not the provider: a storage bucket left public, a database open to the internet, an access key pushed to GitHub, a role with far too many rights. Gartner predicted the great majority of cloud breaches would be the customer’s fault. That is why the next modules focus on exactly those settings.",
    ),
    analogy: t(
      "Eng yaxshi qulfli eshik ham, ochiq qoldirilsa, foydasiz.",
      "The best lock is useless on a door left open.",
    ),
    theory: [
      t(
        "Provayderlar xavfsiz sukut qiymatlarini kuchaytirmoqda: masalan, yangi S3 bucket’lar endi sukut bo‘yicha yopiq.",
        "Providers keep tightening defaults: new S3 buckets, for example, are now private by default.",
      ),
    ],
    task: t("Savollarga javob bering.", "Answer the questions."),
    hint: t("Sozlamani kim tanladi?", "Who chose the setting?"),
    widget: {
      type: "quiz",
      questions: [
        {
          ask: t(
            "Kompaniya bucket’ini hammaga ochiq qilib qo‘ydi va mijozlar fayllari sizdi. Kimning javobgarligi?",
            "A company set its bucket to public and customer files leaked. Whose responsibility?",
          ),
          options: [
            t("Kompaniyaning (mijozning)", "The company’s (the customer’s)"),
            t("Bulut provayderining", "The cloud provider’s"),
            t("Hech kimning", "Nobody’s"),
          ],
          answer: 0,
          explain: t(
            "Bucket sozlamasi — “security IN the cloud”.",
            "Bucket settings are “security IN the cloud”.",
          ),
        },
        {
          ask: t(
            "Bulut buzilishlarining eng ko‘p sababi?",
            "The most common cause of cloud breaches?",
          ),
          options: [
            t("Mijozning sozlama xatolari", "Customer misconfiguration"),
            t(
              "Ma’lumotlar markaziga jismoniy bostirib kirish",
              "Physical break-ins at data centres",
            ),
            t("Uskuna nosozligi", "Hardware failure"),
          ],
          answer: 0,
          explain: t(
            "Shuning uchun sozlamalarni avtomatik tekshirish muhim.",
            "Which is why settings are checked automatically.",
          ),
        },
      ],
    },
  },
  {
    id: 6,
    group: PRACTICE,
    title: t("Provayderni tanlash", "Choosing a provider"),
    minutes: 5,
    intro: t(
      "Provayder o‘z qismini yaxshi bajarishiga qanday ishonasiz? Mustaqil auditlar orqali: ISO/IEC 27001 (axborot xavfsizligi boshqaruvi), SOC 2 Type II (nazoratlar vaqt davomida ishlagani), PCI DSS (karta to‘lovlari). Shuningdek, ma’lumotlar qaysi mamlakatda saqlanishini tekshiring: O‘zbekiston qonuni ba’zi shaxsiy ma’lumotlar respublika hududida saqlanishini talab qiladi.",
      "How do you trust that a provider does its part well? Through independent audits: ISO/IEC 27001 (information security management), SOC 2 Type II (controls that worked over time), PCI DSS (card payments). Also check which country the data is stored in: Uzbek law requires some personal data to be kept within the republic.",
    ),
    analogy: t(
      "Restoran tanlashda sanitariya sertifikatiga qarash.",
      "Checking a restaurant’s hygiene certificate before you eat.",
    ),
    theory: [
      t(
        "Sertifikat provayderning qismini tasdiqlaydi — sizning sozlamalaringizni emas.",
        "A certificate vouches for the provider’s part — not your settings.",
      ),
    ],
    task: t("Savollarga javob bering.", "Answer the questions."),
    hint: t("Mustaqil audit.", "Independent audit."),
    widget: {
      type: "quiz",
      questions: [
        {
          ask: t(
            "Provayder nazoratlari bir yil davomida ishlaganini qaysi hisobot ko‘rsatadi?",
            "Which report shows a provider’s controls worked over a whole year?",
          ),
          options: [
            t("SOC 2 Type II", "SOC 2 Type II"),
            t("Marketing taqdimoti", "A marketing deck"),
            t("Narxlar ro‘yxati", "A price list"),
          ],
          answer: 0,
          explain: t(
            "Type I — bir lahzadagi holat, Type II — vaqt davomida.",
            "Type I is a snapshot; Type II covers a period.",
          ),
        },
        {
          ask: t(
            "Provayder ISO 27001 sertifikatiga ega. Bucket’ingiz endi avtomatik xavfsizmi?",
            "The provider is ISO 27001 certified. Is your bucket now safe automatically?",
          ),
          options: [
            t(
              "Yo‘q: bucket sozlamasi sizning qismingiz",
              "No: the bucket setting is your part",
            ),
            t("Ha", "Yes"),
            t("Faqat Yevropada", "Only in Europe"),
          ],
          answer: 0,
          explain: t(
            "Sertifikat chiziqning faqat bir tomonini qamraydi.",
            "A certificate covers only one side of the line.",
          ),
        },
      ],
    },
  },
  {
    id: 7,
    group: PRACTICE,
    title: t("Birinchi kun ro‘yxati", "A day-one checklist"),
    minutes: 5,
    intro: t(
      "Yangi bulut hisobini ochganda birinchi kunda bajariladigan ishlar: root/bosh hisobga MFA qo‘yish va uni kundalik ishda ishlatmaslik; har bir odamga alohida hisob; audit loglarini yoqish (CloudTrail, Azure Activity Log); xarajat ogohlantirishlari (o‘g‘irlangan kalit ko‘pincha kripto-mayning uchun ishlatiladi); va saqlash xizmatlari uchun “ommaviy kirishni bloklash” sozlamasi.",
      "When a new cloud account is opened, these come on day one: MFA on the root/owner account, which then isn’t used for daily work; a separate account for every person; audit logs switched on (CloudTrail, Azure Activity Log); billing alerts (a stolen key is often used for crypto-mining); and the “block public access” setting for storage.",
    ),
    analogy: t(
      "Yangi uyga ko‘chganda birinchi navbatda qulfni almashtirish.",
      "Changing the locks on the day you move into a new house.",
    ),
    theory: [
      t(
        "Kutilmagan katta hisob ko‘pincha buzilishning birinchi belgisi.",
        "An unexpectedly large bill is often the first sign of a breach.",
      ),
    ],
    task: t("Bu birinchi kun ro‘yxatidami?", "Is this on the day-one list?"),
    hint: t(
      "Kirish, loglar, pul, ommaviylik.",
      "Access, logs, money, public exposure.",
    ),
    widget: {
      type: "sort",
      buckets: [
        { id: "yes", label: t("Birinchi kunda", "Day one") },
        { id: "no", label: t("Xato amaliyot", "A bad practice") },
      ],
      items: [
        {
          label: t(
            "Root hisobga MFA qo‘yish",
            "Putting MFA on the root account",
          ),
          bucket: "yes",
        },
        {
          label: t(
            "Jamoaga bitta umumiy admin hisob berish",
            "Giving the team one shared admin account",
          ),
          bucket: "no",
        },
        {
          label: t("Audit loglarini yoqish", "Switching on audit logs"),
          bucket: "yes",
        },
        {
          label: t(
            "Xarajat ogohlantirishini sozlash",
            "Setting up a billing alert",
          ),
          bucket: "yes",
        },
        {
          label: t(
            "Root hisob bilan har kuni ishlash",
            "Working as root every day",
          ),
          bucket: "no",
        },
      ],
    },
  },
  {
    id: 8,
    group: PRACTICE,
    title: t("Yakuniy savollar", "Final questions"),
    minutes: 5,
    intro: t(
      "Bulutga o‘tish xavfsizlik ishini yo‘qotmaydi — uni boshqa joyga ko‘chiradi. Provayder pastki qatlamlarni oladi, siz esa sozlamalar, kirish va ma’lumotlar uchun javob berasiz. Keyingi modullar aynan shu qismni ko‘rib chiqadi: IAM, saqlash va sirlar, konteynerlar va Kubernetes.",
      "Moving to the cloud doesn’t remove security work — it moves it. The provider takes the lower layers, and you answer for the settings, the access and the data. The next modules look at exactly that part: IAM, storage and secrets, containers and Kubernetes.",
    ),
    analogy: t(
      "Taksiga o‘tirdingiz: haydash haydovchiniki, lekin manzilni va kamarni taqishni siz hal qilasiz.",
      "In a taxi the driving is the driver’s, but the destination and your seatbelt are yours.",
    ),
    theory: [
      t(
        "Har bir yangi bulut xizmati uchun so‘rang: chiziq qayerda?",
        "For each new cloud service, ask: where is the line?",
      ),
    ],
    task: t("Savollarga javob bering.", "Answer the questions."),
    hint: t("Model va chiziq.", "The model and the line."),
    widget: {
      type: "quiz",
      questions: [
        {
          ask: t(
            "Qaysi modelda mijoz eng ko‘p qatlam uchun javobgar?",
            "In which model does the customer own the most layers?",
          ),
          options: [t("IaaS", "IaaS"), t("PaaS", "PaaS"), t("SaaS", "SaaS")],
          answer: 0,
          explain: t(
            "OS’dan yuqorisi hammasi — sizniki.",
            "Everything from the OS up is yours.",
          ),
        },
        {
          ask: t(
            "Barcha modellarda mijozda qoladigan qatlam?",
            "The layer the customer keeps in every model?",
          ),
          options: [
            t("Ma’lumotlar va kirish", "Data and access"),
            t("Uskunalar", "Hardware"),
            t("Bino", "The building"),
          ],
          answer: 0,
          explain: t(
            "Shuning uchun IAM — keyingi modul.",
            "That’s why IAM is the next module.",
          ),
        },
      ],
    },
  },
];
