// Academy Intermediate · OSINT, module 3: Domains and infrastructure. The
// lessons use ./tools.ts: an invented company's DNS records and
// certificate-transparency entries.
import type { CommonWidget, Lesson, Text } from "../anim-lab/types";

export type Widget = CommonWidget | { type: "dns" } | { type: "ct" };

export const PROGRESS_KEY = "cybervalue:infra:progress:v1";

const t = (uz: string, en: string): Text => ({ uz, en });
const code = (s: string): Text => ({ uz: s, en: s });

const NAMES = t("Domenlar", "Domains");
const RECS = t("Yozuvlar", "Records");
const MAP = t("Xarita", "The map");

export const LESSONS: Lesson<Widget>[] = [
  {
    id: 1,
    group: NAMES,
    title: t("WHOIS va RDAP", "WHOIS and RDAP"),
    minutes: 6,
    intro: t(
      "WHOIS (va uning zamonaviy o‘rinbosari RDAP) domen haqida ochiq ma’lumot beradi: registrator, ro‘yxatdan o‘tgan va tugaydigan sana, nom serverlari. Egasining ismi va manzili bugun ko‘pincha yashiriladi (GDPR tufayli), lekin sanalar va nom serverlari baribir ko‘p narsani aytadi: 3 kun oldin ochilgan “bank” domeni — shubhali.",
      "WHOIS (and its modern successor, RDAP) gives public facts about a domain: the registrar, when it was registered and expires, and its name servers. The owner’s name and address are usually redacted today (because of the GDPR), but the dates and name servers still say a lot: a “bank” domain created three days ago is suspicious.",
    ),
    analogy: t(
      "Mashina raqami bo‘yicha ochiq ma’lumot: egasining ismi yo‘q, lekin markasi va ro‘yxatdan o‘tgan yili bor.",
      "Public facts from a number plate: no owner’s name, but the make and the year it was registered.",
    ),
    theory: [
      t(
        "Bir xil nom serverlari yoki ro‘yxatdan o‘tish vaqti bir guruh domenlarni bog‘lashi mumkin.",
        "Shared name servers or registration times can tie a group of domains together.",
      ),
    ],
    task: t(
      "Yozuvning har bir qismini bosib, nima ekanini o‘qing.",
      "Click each part of the record and read what it is.",
    ),
    hint: t("Hammasi bo‘lib beshta qism.", "Five parts in all."),
    widget: {
      type: "anatomy",
      lines: [
        [{ text: "Domain Name: SARBON-LOGISTICS.EXAMPLE" }],
        [{ text: "Registrar: Hostline Registrar LLC", id: "registrar" }],
        [{ text: "Creation Date: 2014-03-11T08:22:10Z", id: "created" }],
        [{ text: "Registry Expiry Date: 2027-03-11T08:22:10Z", id: "expiry" }],
        [{ text: "Registrant: REDACTED FOR PRIVACY", id: "registrant" }],
        [{ text: "Name Server: NS1.HOSTLINE.EXAMPLE", id: "ns" }],
      ],
      parts: [
        {
          id: "registrar",
          title: t("Registrator", "Registrar"),
          body: t(
            "Domen qayerdan sotib olingan — suiiste’mol haqida shu yerga xabar beriladi.",
            "Where the domain was bought — abuse reports go here.",
          ),
        },
        {
          id: "created",
          title: t("Yaratilgan sana", "Creation date"),
          body: t(
            "Eski domen — barqaror tashkilot belgisi; bir necha kunlik — fishingda ko‘p uchraydi.",
            "An old domain suggests an established organisation; days-old ones are common in phishing.",
          ),
        },
        {
          id: "expiry",
          title: t("Tugash sanasi", "Expiry date"),
          body: t(
            "Uzaytirilmasa, domen bo‘shab qoladi va boshqasi sotib olishi mumkin.",
            "If not renewed, the domain lapses and someone else can buy it.",
          ),
        },
        {
          id: "registrant",
          title: t("Egasi", "Registrant"),
          body: t(
            "Odatda maxfiylik uchun yashirilgan.",
            "Usually redacted for privacy.",
          ),
        },
        {
          id: "ns",
          title: t("Nom serverlari", "Name servers"),
          body: t(
            "DNS kim tomonidan boshqariladi — hosting provayderga ishora.",
            "Who runs the DNS — a hint at the hosting provider.",
          ),
        },
      ],
    },
  },
  {
    id: 2,
    group: RECS,
    title: t("DNS yozuvlari nimani aytadi", "What DNS records tell you"),
    minutes: 6,
    intro: t(
      "DNS — ochiq telefon kitobi. A yozuvi — IP manzil; MX — pochta serveri; TXT — SPF, domen tasdiqlash kodlari (qaysi xizmatlardan foydalanishini ko‘rsatadi); CNAME — boshqa nomga taxallus (ko‘pincha bulut xizmatiga); NS — DNS’ni kim yuritadi. Bularning hammasi passiv: so‘rov ochiq DNS serverlariga yuboriladi.",
      "DNS is a public phone book. An A record is an IP address; MX is the mail server; TXT holds SPF and domain-verification codes (which show the services in use); CNAME is an alias to another name (often a cloud service); NS says who runs the DNS. All of it is passive: the questions go to public DNS servers.",
    ),
    analogy: t(
      "Bino ro‘yxati: qaysi qavatda kim, qaysi xona pochta uchun.",
      "A building directory: who is on which floor, which room takes the post.",
    ),
    theory: [
      t(
        "dig sarbon-logistics.example MX yoki nslookup -type=TXT — tayyor buyruqlar.",
        "dig sarbon-logistics.example MX or nslookup -type=TXT are the commands.",
      ),
    ],
    task: t(
      "Har bir yozuv nima haqida gapiradi?",
      "What does each record tell you about?",
    ),
    hint: t(
      "MX va SPF — pochta; A va CNAME — sayt; NS va tasdiqlash kodlari — boshqaruv va xizmatlar.",
      "MX and SPF are mail; A and CNAME are the website; NS and verification codes are management and services.",
    ),
    widget: {
      type: "sort",
      buckets: [
        { id: "mail", label: t("Pochta", "Email") },
        { id: "web", label: t("Sayt", "Website") },
        {
          id: "admin",
          label: t("Boshqaruv va xizmatlar", "Management and services"),
        },
      ],
      items: [
        { label: code("MX 1 aspmx.l.google.com."), bucket: "mail" },
        {
          label: code('TXT "v=spf1 include:_spf.google.com ~all"'),
          bucket: "mail",
        },
        { label: code("A 203.0.113.40"), bucket: "web" },
        { label: code("www CNAME sarbon-logistics.example."), bucket: "web" },
        { label: code("NS ns1.hostline.example."), bucket: "admin" },
        { label: code('TXT "google-site-verification=…"'), bucket: "admin" },
      ],
    },
  },
  {
    id: 3,
    group: RECS,
    title: t("Yozuvlarni o‘qish", "Reading the records"),
    minutes: 10,
    intro: t(
      "Sarbon Logistics’ning DNS yozuvlari oldingizda. Ulardan kompaniya pochtani qaysi xizmatda yuritishini, onlayn do‘koni qayerda ishlashini va qaysi subdomen o‘chirilgan xizmatga ishora qilib qolganini aniqlang. Oxirgisi — “subdomain takeover” xavfi: kimdir o‘sha xizmatda xuddi shu nomni ochib, kompaniya subdomenida o‘z sahifasini ko‘rsata oladi.",
      "Sarbon Logistics’ DNS records are in front of you. Work out which service runs its email, where its online shop runs and which subdomain still points at a deleted service. That last one is a subdomain-takeover risk: someone could claim the same name on that service and serve their own page on the company’s subdomain.",
    ),
    analogy: t(
      "Do‘kon ko‘chib ketgan, lekin eski manzildagi “bizning do‘kon” yozuvi qolgan — u binoni ijaraga olgan har kim uchun reklama.",
      "A shop has moved out, but the “our shop” sign is still over the old door — free advertising for whoever rents the place.",
    ),
    theory: [
      t(
        "NXDOMAIN — “bunday nom yo‘q”: CNAME ko‘rsatgan manzil endi mavjud emas.",
        "NXDOMAIN means “no such name”: the target of the CNAME no longer exists.",
      ),
    ],
    task: t(
      "Uchala savolga yozuvlardan javob toping.",
      "Answer all three questions from the records.",
    ),
    hint: t(
      "MX va SPF bir xil xizmatni ko‘rsatadi.",
      "MX and SPF point at the same service.",
    ),
    widget: { type: "dns" },
  },
  {
    id: 4,
    group: MAP,
    title: t("Sertifikat jurnallari", "Certificate transparency"),
    minutes: 10,
    intro: t(
      "Har bir ochiq TLS sertifikati Certificate Transparency jurnallariga yoziladi — hamma o‘qiy oladi (crt.sh, Censys). Sertifikat qaysi nomlar uchun berilgani yozilgani sababli, jurnallar kompaniyaning subdomenlarini, hatto “yashirin” test serverlarini ham oshkor qiladi.",
      "Every public TLS certificate is written to Certificate Transparency logs that anyone can read (crt.sh, Censys). Because each certificate lists the names it covers, the logs give away a company’s subdomains — even its “hidden” test servers.",
    ),
    analogy: t(
      "Har bir yangi eshik qulfi ochiq daftarga yoziladi — daftardan binodagi barcha eshiklarni sanab chiqish mumkin.",
      "Every new lock is written in a public ledger — so the ledger lists every door in the building.",
    ),
    theory: [
      t(
        "Wildcard (*.domen) nomlari subdomen ko‘rsatmaydi — ularni ro‘yxatdan chiqaring.",
        "Wildcard (*.domain) names don’t reveal a subdomain — leave them out of the list.",
      ),
    ],
    task: t(
      "Jurnaldan subdomenlarni yig‘ing va internetga chiqmasligi kerak bo‘lgan qurish va test tizimlarini belgilang.",
      "Collect the subdomains from the log and mark the build and test systems that shouldn’t face the internet.",
    ),
    hint: t(
      "CI serveri, staging va dev API.",
      "The CI server, staging and the dev API.",
    ),
    widget: { type: "ct" },
  },
  {
    id: 5,
    group: MAP,
    title: t("IP, ASN va passiv skanerlar", "IPs, ASNs and passive scanners"),
    minutes: 6,
    intro: t(
      "IP manzildan uning qaysi tarmoqqa (ASN) va qaysi provayderga tegishli ekanini bilish mumkin. Shodan va Censys kabi xizmatlar internetni o‘zlari skanerlaydi — ulardan qidirish sizning tomoningizdan passiv: qaysi portlar ochiq, qaysi dastur versiyasi, qachon ko‘rilgan. Reverse DNS esa IP’ga bog‘langan nomni ko‘rsatadi.",
      "From an IP address you can learn which network (ASN) and provider it belongs to. Services such as Shodan and Censys scan the internet themselves — searching them is passive on your side: which ports are open, which software version, when it was seen. Reverse DNS shows the name tied to an IP.",
    ),
    analogy: t(
      "Shahar xaritasi tayyor: siz ko‘chalarni o‘zingiz yurib chiqmaysiz.",
      "The city map is already drawn: you don’t walk every street yourself.",
    ),
    theory: [
      t(
        "Shodan ma’lumoti eskirgan bo‘lishi mumkin — “oxirgi ko‘rilgan” sanaga qarang.",
        "Shodan data can be stale — check the “last seen” date.",
      ),
    ],
    task: t("Savollarga javob bering.", "Answer the questions."),
    hint: t(
      "Birov skanerlagan — siz faqat o‘qiysiz.",
      "Someone else scanned; you only read.",
    ),
    widget: {
      type: "quiz",
      questions: [
        {
          ask: t(
            "Shodan’da qidirish passivmi?",
            "Is searching Shodan passive?",
          ),
          options: [
            t(
              "Ha — siz maqsadga tegmaysiz, Shodan yig‘gan ma’lumotni o‘qiysiz",
              "Yes — you don’t touch the target, you read what Shodan collected",
            ),
            t("Yo‘q, bu port skanerlash", "No, it is port scanning"),
            t("Bu noqonuniy", "It is illegal"),
          ],
          answer: 0,
          explain: t(
            "Lekin topilgan xizmatga ulanish — faol.",
            "Connecting to the service you found would be active.",
          ),
        },
        {
          ask: t("ASN nimani bildiradi?", "What does an ASN tell you?"),
          options: [
            t(
              "IP manzil qaysi tarmoq va tashkilotga tegishli",
              "Which network and organisation an IP belongs to",
            ),
            t("Saytning paroli", "The site’s password"),
            t("Domen tugash sanasi", "The domain’s expiry"),
          ],
          answer: 0,
          explain: t("Autonomous System Number.", "Autonomous System Number."),
        },
      ],
    },
  },
  {
    id: 6,
    group: MAP,
    title: t(
      "Kimniki va kimga tegish mumkin",
      "Whose is it, and what may be touched",
    ),
    minutes: 6,
    intro: t(
      "Xaritadagi hamma narsa ham mijozniki emas. shop.* Shopify’da, pochta Google’da, CDN boshqa kompaniyada. Ularni xaritaga yozasiz, lekin bu uchinchi tomon tizimlarini tekshirish uchun mijozning ruxsati yetmaydi — xizmat egasining qoidalari (masalan, bug bounty dasturi) kerak.",
      "Not everything on the map belongs to the client. shop.* runs on Shopify, mail on Google, the CDN at another company. They go on the map, but the client’s authorisation isn’t enough to test those third-party systems — that needs the provider’s own rules (a bug bounty programme, say).",
    ),
    analogy: t(
      "Ijaraga olingan ofisni tekshirish uchun ijarachi rozi bo‘lsa ham, bino egasining ruxsati kerak.",
      "Inspecting a rented office needs the landlord’s say-so, not only the tenant’s.",
    ),
    theory: [
      t(
        "Xaritada har bir aktiv yonida “egasi” ustuni bo‘lsin: mijoz yoki uchinchi tomon.",
        "Give every asset on the map an “owner” column: client or third party.",
      ),
    ],
    task: t("Savollarga javob bering.", "Answer the questions."),
    hint: t(
      "Ruxsat — tizim egasidan.",
      "Permission comes from the system’s owner.",
    ),
    widget: {
      type: "quiz",
      questions: [
        {
          ask: t(
            "shop.sarbon-logistics.example Shopify’ga CNAME. Uni faol tekshirish mumkinmi?",
            "shop.sarbon-logistics.example is a CNAME to Shopify. May you actively test it?",
          ),
          options: [
            t(
              "Faqat Shopify qoidalari ruxsat bergan doirada",
              "Only as far as Shopify’s own rules allow",
            ),
            t("Ha, mijoz ruxsat bergan", "Yes, the client agreed"),
            t("Ha, nomi mijozniki", "Yes, the name is the client’s"),
          ],
          answer: 0,
          explain: t("Server Shopify’niki.", "The servers are Shopify’s."),
        },
        {
          ask: t(
            "blog.* CNAME o‘chirilgan xizmatga ishora qilyapti. Nima qilasiz?",
            "blog.* points at a deleted service. What do you do?",
          ),
          options: [
            t(
              "Topilma sifatida yozib, mijozga yozuvni o‘chirishni tavsiya qilasiz",
              "Report it and advise the client to remove the record",
            ),
            t(
              "O‘zingiz o‘sha nomni ochib, sahifa joylaysiz",
              "Claim the name yourself and host a page",
            ),
            t("E’tibor bermaysiz", "Ignore it"),
          ],
          answer: 0,
          explain: t(
            "Takeover’ni isbotlash ham ruxsatsiz bo‘lishi mumkin — tavsiya yetarli.",
            "Proving the takeover may itself be unauthorised — the recommendation is enough.",
          ),
        },
      ],
    },
  },
  {
    id: 7,
    group: MAP,
    title: t("Xaritani yig‘ish", "Putting the map together"),
    minutes: 6,
    intro: t(
      "Yakuniy natija — infratuzilma xaritasi: domenlar va subdomenlar, ularning IP’lari va provayderlari, qaysi xizmat qaysi uchinchi tomonda, ochiq portlar va har biri qayerdan topilgani. Mijoz uchun eng foydali qismi — xavfli topilmalar: internetga chiqqan test serverlari, osilib qolgan yozuvlar, eskirgan dasturlar.",
      "The end result is an infrastructure map: domains and subdomains, their IPs and providers, which service sits with which third party, open ports, and where each fact came from. The part the client values most is the risky findings: test servers facing the internet, dangling records, outdated software.",
    ),
    analogy: t(
      "Uyni sotib olishdan oldingi ko‘rik: xonalar ro‘yxati va “tom oqyapti” degan yozuv.",
      "A survey before buying a house: the list of rooms, and the note that says “the roof leaks”.",
    ),
    theory: [
      t(
        "Har bir qatorda manba va sana: “crt.sh, 2026-03-20”.",
        "Every row carries its source and date: “crt.sh, 2026-03-20”.",
      ),
    ],
    task: t("Savollarga javob bering.", "Answer the questions."),
    hint: t("Xavfli topilma — birinchi.", "Risky findings come first."),
    widget: {
      type: "quiz",
      questions: [
        {
          ask: t(
            "Mijoz uchun xaritaning eng muhim qismi?",
            "The part of the map the client needs most?",
          ),
          options: [
            t(
              "Xavfli topilmalar va ularni tuzatish tavsiyalari",
              "The risky findings and how to fix them",
            ),
            t("Subdomenlar soni", "The count of subdomains"),
            t("Chiroyli diagramma", "A pretty diagram"),
          ],
          answer: 0,
          explain: t(
            "Xarita — vosita, maqsad emas.",
            "The map is a tool, not the goal.",
          ),
        },
        {
          ask: t(
            "jenkins.* internetdan ochiq. Nega bu xavfli?",
            "jenkins.* is reachable from the internet. Why is that risky?",
          ),
          options: [
            t(
              "CI serveri kodga, kalitlarga va serverlarga yo‘l ochishi mumkin",
              "A CI server can lead to code, keys and servers",
            ),
            t("Xavfli emas", "It isn’t"),
            t("Sayt sekinlashadi", "The site slows down"),
          ],
          answer: 0,
          explain: t(
            "Qurish tizimlari ko‘pincha eng ko‘p sirni saqlaydi.",
            "Build systems often hold the most secrets.",
          ),
        },
      ],
    },
  },
  {
    id: 8,
    group: MAP,
    title: t("Yakuniy savollar", "Final questions"),
    minutes: 6,
    intro: t(
      "Modulni takrorlaymiz: WHOIS, DNS yozuvlari, subdomain takeover, sertifikat jurnallari, IP va ASN, egalik va xarita.",
      "A review of the module: WHOIS, DNS records, subdomain takeover, certificate logs, IPs and ASNs, ownership and the map.",
    ),
    analogy: t(
      "Yaxshi xarita bo‘lmagan joyda yurib bo‘lmaydi — himoya ham shunday.",
      "You can’t find your way without a good map — nor defend.",
    ),
    theory: [
      t(
        "Keyingi modulda rasmlardan joylashuvni aniqlaymiz.",
        "In the next module we work out locations from photos.",
      ),
    ],
    task: t(
      "Barcha savollarga to‘g‘ri javob bering.",
      "Answer every question correctly.",
    ),
    hint: t(
      "CT jurnallari — subdomenlar manbai.",
      "CT logs are where subdomains come from.",
    ),
    widget: {
      type: "quiz",
      questions: [
        {
          ask: t(
            "Qaysi yozuv pochta serverini ko‘rsatadi?",
            "Which record names the mail server?",
          ),
          options: [code("MX"), code("A"), code("NS")],
          answer: 0,
          explain: t("Mail eXchanger.", "Mail eXchanger."),
        },
        {
          ask: t(
            "Subdomenlarni passiv topishning eng yaxshi manbai?",
            "The best passive source of subdomains?",
          ),
          options: [
            t("Sertifikat jurnallari (crt.sh)", "Certificate logs (crt.sh)"),
            t("Port skanerlash", "A port scan"),
            t("Xodimga qo‘ng‘iroq", "Phoning staff"),
          ],
          answer: 0,
          explain: t(
            "Har bir sertifikat nomlarini ochiq yozadi.",
            "Every certificate lists its names publicly.",
          ),
        },
        {
          ask: t(
            "CNAME NXDOMAIN’ga ishora qiladi. Xavf?",
            "A CNAME points at an NXDOMAIN. The risk?",
          ),
          options: [
            t("Subdomain takeover", "Subdomain takeover"),
            t("DDoS", "DDoS"),
            t("Xavf yo‘q", "None"),
          ],
          answer: 0,
          explain: t(
            "Nomni boshqa odam egallashi mumkin.",
            "Someone else could claim the name.",
          ),
        },
        {
          ask: t(
            "3 kun oldin ro‘yxatdan o‘tgan “bank” domeni — bu?",
            "A “bank” domain registered three days ago is?",
          ),
          options: [
            t("Shubhali belgi", "A warning sign"),
            t("Ishonchli belgi", "A sign of trust"),
            t("Ahamiyatsiz", "Meaningless"),
          ],
          answer: 0,
          explain: t(
            "Fishing domenlari odatda yangi.",
            "Phishing domains are usually new.",
          ),
        },
      ],
    },
  },
];
