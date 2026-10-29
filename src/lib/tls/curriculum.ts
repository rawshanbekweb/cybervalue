// Academy Intermediate · Cryptography, module 5: TLS and certificates. The
// lessons use the browser's certificate checks, a TLS setup grade and an
// SSL-stripping attack against redirects, HSTS and preloading (./tools.ts).
import type { CommonWidget, Lesson, Text } from "../anim-lab/types";

export type Widget =
  CommonWidget | { type: "chain" } | { type: "grade" } | { type: "hsts" };

export const PROGRESS_KEY = "cybervalue:tls:progress:v1";

const t = (uz: string, en: string): Text => ({ uz, en });
const code = (s: string) => t(s, s);

const CERTS = t("Sertifikatlar", "Certificates");
const SETUP = t("Server sozlamasi", "Setting up the server");
const ATTACKS = t("Hujum va himoya", "Attacks and defences");

export const LESSONS: Lesson<Widget>[] = [
  {
    id: 1,
    group: CERTS,
    title: t("TLS nimani himoya qiladi", "What TLS protects"),
    minutes: 6,
    intro: t(
      "TLS (HTTPS dagi “S”) avvalgi modullardagi hamma narsani birlashtiradi: kalit almashish (ECDH), sertifikat va imzo bilan serverni tanish, AES-GCM bilan ma’lumotni shifrlash. Lekin u hamma narsani yashirmaydi.",
      "TLS (the “S” in HTTPS) brings together everything from the earlier modules: key exchange (ECDH), recognising the server by a certificate and signature, and encrypting data with AES-GCM. But it does not hide everything.",
    ),
    analogy: t(
      "Zirhli mashina: ichidagi yuk ko‘rinmaydi va o‘zgartirib bo‘lmaydi, lekin mashinaning qaysi bankka borayotgani ko‘chada ko‘rinib turadi.",
      "An armoured van: the cargo cannot be seen or changed, but which bank it drives to is visible from the street.",
    ),
    theory: [
      t(
        "Himoyalanadi: sahifalar, parollar, cookie’lar, manzilning yo‘li (/login?..). Ko‘rinadi: IP manzil, ulanish vaqti va hajmi, ko‘pincha domen nomi (SNI orqali).",
        "Protected: pages, passwords, cookies, the URL path (/login?..). Visible: the IP address, timing and size, and often the domain name (through SNI).",
      ),
      t(
        "TLS qurilmaning o‘zidagi zararli dasturdan yoki fishing saytdan himoya qilmaydi: fishing sayt ham HTTPS bo‘lishi mumkin.",
        "TLS does not protect against malware on the device or a phishing site: phishing sites use HTTPS too.",
      ),
    ],
    task: t(
      "Har birini ajrating: TLS uni yashiradimi yoki yo‘qmi?",
      "Sort each item: does TLS hide it or not?",
    ),
    hint: t(
      "Ulanishning ichidagi hamma narsa — yashirin; ulanishning o‘zi — ko‘rinadi.",
      "Everything inside the connection is hidden; the connection itself is visible.",
    ),
    widget: {
      type: "sort",
      buckets: [
        { id: "hidden", label: t("Yashirin", "Hidden") },
        { id: "seen", label: t("Ko‘rinadi", "Visible") },
      ],
      items: [
        {
          label: t("Kiritilgan parol", "The password typed in"),
          bucket: "hidden",
        },
        {
          label: code("/orders/1043?status=paid"),
          code: true,
          bucket: "hidden",
        },
        {
          label: t("Sessiya cookie’si", "The session cookie"),
          bucket: "hidden",
        },
        {
          label: t("Server IP manzili", "The server’s IP address"),
          bucket: "seen",
        },
        {
          label: t("Domen nomi (SNI)", "The domain name (SNI)"),
          bucket: "seen",
        },
        {
          label: t("Qancha ma’lumot yuborilgani", "How much data was sent"),
          bucket: "seen",
        },
      ],
    },
  },
  {
    id: 2,
    group: CERTS,
    title: t("Sertifikatdagi nomlar", "The names on a certificate"),
    minutes: 6,
    intro: t(
      "Sertifikat qaysi saytlar uchun ekanini SAN (Subject Alternative Name) ro‘yxati aytadi. Yulduzcha (*) chap tomondagi faqat bitta qismni almashtiradi: *.shop.uz pay.shop.uz ni qamraydi, lekin shop.uz ni ham, a.pay.shop.uz ni ham qamramaydi.",
      "The SAN (Subject Alternative Name) list says which sites a certificate is for. A wildcard (*) stands for exactly one label on the left: *.shop.uz covers pay.shop.uz, but neither shop.uz nor a.pay.shop.uz.",
    ),
    analogy: t(
      "“3-qavatdagi istalgan xona” degan ruxsatnoma 3-qavatning o‘zi uchun ham, 3-qavatdagi xona ichidagi omborxona uchun ham emas.",
      "A pass for “any room on floor 3” is neither for floor 3’s lobby nor for a cupboard inside one of those rooms.",
    ),
    theory: [
      t(
        "Brauzer manzil satridagi nomni SAN ro‘yxati bilan solishtiradi. Mos kelmasa — NET::ERR_CERT_COMMON_NAME_INVALID.",
        "The browser compares the name in the address bar with the SAN list. No match means NET::ERR_CERT_COMMON_NAME_INVALID.",
      ),
    ],
    task: t(
      "*.shop.uz sertifikati qaysi manzillar uchun amal qiladi?",
      "Which addresses does a *.shop.uz certificate cover?",
    ),
    hint: t(
      "Yulduzcha — bitta nuqtasiz qism.",
      "The wildcard is one label with no dot in it.",
    ),
    widget: {
      type: "sort",
      buckets: [
        { id: "yes", label: t("Amal qiladi", "Covered") },
        { id: "no", label: t("Amal qilmaydi", "Not covered") },
      ],
      items: [
        { label: code("pay.shop.uz"), code: true, bucket: "yes" },
        { label: code("www.shop.uz"), code: true, bucket: "yes" },
        { label: code("shop.uz"), code: true, bucket: "no" },
        { label: code("a.pay.shop.uz"), code: true, bucket: "no" },
        { label: code("shop.uz.evil.example"), code: true, bucket: "no" },
        { label: code("PAY.SHOP.UZ"), code: true, bucket: "yes" },
      ],
    },
  },
  {
    id: 3,
    group: CERTS,
    title: t(
      "Brauzer sertifikatni qanday tekshiradi",
      "How a browser checks a certificate",
    ),
    minutes: 10,
    intro: t(
      "Brauzer to‘rt narsani tekshiradi: zanjir ishonchli ildizgacha yetadimi, server oraliq sertifikatni ham yuborganmi, muddati o‘tmaganmi va nom mosmi. Bittasi bajarilmasa, foydalanuvchi qizil ogohlantirishni ko‘radi.",
      "The browser checks four things: does the chain reach a trusted root, did the server send the intermediate certificate, has it expired, and does the name match. If one fails, the user sees a red warning.",
    ),
    analogy: t(
      "Pasport tekshiruvi: davlat tan olinganmi, muhrlar to‘liqmi, muddati o‘tmaganmi va rasm egasiga o‘xshaydimi.",
      "A passport check: is the issuing state recognised, are the stamps complete, is it in date, and does the photo match the holder.",
    ),
    theory: [
      t(
        "Zanjir: sayt sertifikati ← oraliq (masalan, Let’s Encrypt R11) ← ildiz (ISRG Root X1). Ildiz brauzerda oldindan bor, oraliqni server yuborishi kerak.",
        "The chain: the site’s certificate ← an intermediate (for example Let’s Encrypt R11) ← the root (ISRG Root X1). The root is built into the browser; the server must send the intermediate.",
      ),
      t(
        "O‘zi imzolagan sertifikat ichki sinovlar uchun yaroqli, lekin ochiq saytda brauzer unga ishonmaydi.",
        "A self-signed certificate is fine for internal testing, but browsers do not trust it on a public site.",
      ),
    ],
    task: t(
      "Server sozlamasini shunday tuzatingki, brauzer pay.shop.uz ni ogohlantirishsiz ochsin.",
      "Fix the server’s setup so the browser opens pay.shop.uz without a warning.",
    ),
    hint: t(
      "Ommaviy CA, oraliq sertifikat, yangi muddat va *.shop.uz yoki pay.shop.uz nomi.",
      "A public CA, the intermediate, a fresh date, and the name *.shop.uz or pay.shop.uz.",
    ),
    widget: { type: "chain" },
  },
  {
    id: 4,
    group: CERTS,
    title: t("Ishonch tizimi (PKI)", "The trust system (PKI)"),
    minutes: 6,
    intro: t(
      "Sertifikatni sertifikat markazi (CA) beradi: avval u domen sizniki ekanini tekshiradi. Let’s Encrypt bepul va avtomatik sertifikatlar beradi. Barcha berilgan sertifikatlar ochiq Certificate Transparency jurnallariga yoziladi — kimdir sizning domeningizga soxta sertifikat olsa, buni ko‘rish mumkin.",
      "A certificate authority (CA) issues certificates after checking the domain is yours. Let’s Encrypt issues them for free and automatically. Every issued certificate is written to public Certificate Transparency logs — if someone gets a fake one for your domain, it shows.",
    ),
    analogy: t(
      "Notarius: u sizni tanib, hujjatni tasdiqlaydi; barcha tasdiqlar esa ochiq reyestrga yoziladi.",
      "A notary: they check who you are and certify the paper, and every certification goes into a public register.",
    ),
    theory: [
      t(
        "Sertifikat muddati qisqa (90 kun va undan kam): kalit o‘g‘irlansa, zarar uzoq davom etmaydi. Shuning uchun yangilash avtomatlashtiriladi (ACME, certbot).",
        "Certificates are short-lived (90 days or less): a stolen key does harm for a short time. So renewal is automated (ACME, certbot).",
      ),
    ],
    task: t("Savollarga javob bering.", "Answer the questions."),
    hint: t(
      "CT jurnallari — hamma ko‘radigan ro‘yxat.",
      "CT logs are a list anyone can read.",
    ),
    widget: {
      type: "quiz",
      questions: [
        {
          ask: t(
            "Sizning domeningizga kimdir soxta sertifikat olganini qanday bilish mumkin?",
            "How can you tell someone got a fake certificate for your domain?",
          ),
          options: [
            t(
              "Certificate Transparency jurnallarini kuzatib",
              "By watching the Certificate Transparency logs",
            ),
            t("Parolni almashtirib", "By changing your password"),
            t("Buni bilib bo‘lmaydi", "There is no way to know"),
          ],
          answer: 0,
          explain: t(
            "Har bir sertifikat ochiq jurnalga yoziladi; crt.sh kabi saytlarda qidirish mumkin.",
            "Every certificate is logged publicly; sites like crt.sh let you search them.",
          ),
        },
        {
          ask: t(
            "Nega sertifikatlar qisqa muddatga beriladi?",
            "Why are certificates issued for short periods?",
          ),
          options: [
            t(
              "Kalit o‘g‘irlansa, zarar qisqa vaqt davom etadi",
              "A stolen key does harm for less time",
            ),
            t("CA ko‘proq pul olishi uchun", "So the CA earns more"),
            t(
              "Brauzerlar uzun sertifikatni o‘qiy olmaydi",
              "Browsers cannot read long ones",
            ),
          ],
          answer: 0,
          explain: t(
            "Yangilash avtomatik bo‘lgani uchun qisqa muddat qo‘shimcha ish talab qilmaydi.",
            "With automated renewal, a short life costs no extra work.",
          ),
        },
      ],
    },
  },
  {
    id: 5,
    group: SETUP,
    title: t("HTTPS sozlamasiga baho", "Grading an HTTPS setup"),
    minutes: 10,
    intro: t(
      "SSL Labs kabi skanerlar serverni A+ dan F gacha baholaydi. Eski protokollar (TLS 1.0/1.1), zaif shifrlar (RC4, 3DES), forward secrecy’siz RSA kalit almashinuvi va qisqa kalitlar bahoni tushiradi.",
      "Scanners such as SSL Labs grade a server from A+ to F. Old protocols (TLS 1.0/1.1), weak ciphers (RC4, 3DES), RSA key exchange without forward secrecy and short keys pull the grade down.",
    ),
    analogy: t(
      "Texnik ko‘rik: bitta yaroqsiz tormoz butun mashinani o‘tkazmaydi, qolgani qanchalik yaxshi bo‘lmasin.",
      "A vehicle inspection: one bad brake fails the whole car, however good the rest is.",
    ),
    theory: [
      t(
        "Bugungi tavsiya: faqat TLS 1.2 va 1.3, ECDHE kalit almashinuvi, AES-GCM yoki ChaCha20, kamida 2048 bitli RSA yoki ECDSA kalit va HSTS.",
        "Today’s advice: TLS 1.2 and 1.3 only, ECDHE key exchange, AES-GCM or ChaCha20, an RSA key of at least 2048 bits or ECDSA, and HSTS.",
      ),
    ],
    task: t(
      "Server sozlamasini A+ bahoga yetkazing.",
      "Bring the server’s setup up to an A+.",
    ),
    hint: t(
      "Eski protokol va zaif shifrlarni o‘chiring, TLS 1.3 va HSTS ni yoqing.",
      "Switch off old protocols and weak ciphers, switch on TLS 1.3 and HSTS.",
    ),
    widget: { type: "grade" },
  },
  {
    id: 6,
    group: ATTACKS,
    title: t("SSL stripping va HSTS", "SSL stripping and HSTS"),
    minutes: 10,
    intro: t(
      "Foydalanuvchi kafeda manzil satriga shunchaki shop.uz yozadi. Brauzer avval oddiy http:// so‘rov yuboradi. Wi-Fi’ni boshqaradigan hujumchi aynan shu so‘rovga javob beradi va foydalanuvchini HTTPS’siz nusxada qoldiradi — bu SSL stripping. HTTPS’ga yo‘naltirish (redirect) yetarli emas: yo‘naltirishning o‘zi ham shifrlanmagan.",
      "In a café, the user just types shop.uz. The browser first sends a plain http:// request. An attacker running the Wi-Fi answers exactly that request and keeps the user on a copy without HTTPS — this is SSL stripping. A redirect to HTTPS is not enough: the redirect itself travels unencrypted.",
    ),
    analogy: t(
      "Bankka borish yo‘lida “bank ko‘chib ketdi, shu yerga keling” degan soxta yozuv. Faqat bankning to‘g‘ri manzilini oldindan bilgan odam aldanmaydi.",
      "A fake sign on the way to the bank: “we have moved, come here”. Only someone who already knows the bank’s real address is not fooled.",
    ),
    theory: [
      t(
        "HSTS sarlavhasi (Strict-Transport-Security) brauzerga “bu saytga faqat HTTPS orqali kel” deydi. Lekin brauzer uni birinchi HTTPS tashrifda ko‘radi.",
        "The HSTS header (Strict-Transport-Security) tells the browser “only ever come here over HTTPS”. But the browser only sees it on a first HTTPS visit.",
      ),
      t(
        "HSTS preload ro‘yxati brauzer ichiga kiritilgan: ro‘yxatdagi saytlar birinchi tashrifdan boshlab faqat HTTPS orqali ochiladi.",
        "The HSTS preload list is built into browsers: sites on it are opened over HTTPS only, from the very first visit.",
      ),
    ],
    task: t(
      "Saytni shunday sozlangki, birinchi tashrif ham, keyingilari ham SSL stripping’dan himoyalansin.",
      "Set the site up so both the first visit and later ones are safe from SSL stripping.",
    ),
    hint: t(
      "HSTS va preload — ikkalasi ham kerak.",
      "HSTS and preload — both are needed.",
    ),
    widget: { type: "hsts" },
  },
  {
    id: 7,
    group: ATTACKS,
    title: t("Tez-tez uchraydigan xatolar", "Common mistakes"),
    minutes: 6,
    intro: t(
      "Kuchli shifrlar ham noto‘g‘ri ishlatilsa foyda bermaydi. Eng ko‘p uchraydigan TLS xatolari — texnik emas, tashkiliy: unutilgan yangilash, sizib chiqqan kalit, aralash kontent.",
      "Strong ciphers do not help when misused. The most common TLS mistakes are organisational rather than technical: a forgotten renewal, a leaked key, mixed content.",
    ),
    analogy: t(
      "Mustahkam eshik, lekin kalit gilam ostida va qulfning kafolati o‘tib ketgan.",
      "A strong door, but the key is under the mat and the lock’s warranty has run out.",
    ),
    theory: [
      t(
        "Aralash kontent: HTTPS sahifa HTTP orqali skript yuklasa, hujumchi aynan o‘sha skriptni almashtiradi. Brauzerlar uni bloklaydi.",
        "Mixed content: if an HTTPS page loads a script over HTTP, an attacker swaps that script. Browsers block it.",
      ),
    ],
    task: t(
      "Har bir holatni ajrating: to‘g‘rimi yoki muammo?",
      "Sort each case: sound, or a problem?",
    ),
    hint: t(
      "Yopiq kalit hech qachon ochiq joyda turmaydi.",
      "A private key never sits anywhere public.",
    ),
    widget: {
      type: "sort",
      buckets: [
        { id: "ok", label: t("To‘g‘ri", "Sound") },
        { id: "bad", label: t("Muammo", "Problem") },
      ],
      items: [
        {
          label: t(
            "Sertifikat certbot bilan avtomatik yangilanadi",
            "The certificate renews automatically with certbot",
          ),
          bucket: "ok",
        },
        {
          label: t(
            "Yopiq kalit Git repozitoriyasida",
            "The private key is in the Git repository",
          ),
          bucket: "bad",
        },
        {
          label: code('<script src="http://cdn.example/app.js">'),
          code: true,
          bucket: "bad",
        },
        {
          label: t(
            "Muddati o‘tishidan 30 kun oldin ogohlantirish",
            "An alert 30 days before expiry",
          ),
          bucket: "ok",
        },
        {
          label: t(
            "Mobil ilova sertifikat xatolarini e’tiborsiz qoldiradi",
            "The mobile app ignores certificate errors",
          ),
          bucket: "bad",
        },
        {
          label: t(
            "Strict-Transport-Security sarlavhasi bor",
            "A Strict-Transport-Security header is sent",
          ),
          bucket: "ok",
        },
      ],
    },
  },
  {
    id: 8,
    group: ATTACKS,
    title: t("Yakuniy savollar", "Final questions"),
    minutes: 6,
    intro: t(
      "Modulni takrorlaymiz: TLS nimani himoya qiladi, sertifikat tekshiruvi, PKI, server sozlamasi va HSTS. Bu bilan Kriptografiya yo‘nalishi yakunlanadi.",
      "A review of the module: what TLS protects, certificate checks, PKI, the server setup and HSTS. This completes the Cryptography domain.",
    ),
    analogy: t(
      "Qulf (shifr), kalit almashish (DH), muhr (imzo) va kimning muhri ekanini tasdiqlovchi notarius (CA) — barchasi bitta ulanishda.",
      "A lock (the cipher), key exchange (DH), a seal (the signature) and the notary who says whose seal it is (the CA) — all in one connection.",
    ),
    theory: [
      t(
        "TLS’dagi muammolar deyarli doim sozlamada: eski protokollar, unutilgan yangilash yoki HSTS yo‘qligi.",
        "TLS problems are almost always in the setup: old protocols, a forgotten renewal or no HSTS.",
      ),
    ],
    task: t(
      "Barcha savollarga to‘g‘ri javob bering.",
      "Answer every question correctly.",
    ),
    hint: t(
      "Har bir tekshiruv qaysi xatoni ushlashini eslang.",
      "Remember which mistake each check catches.",
    ),
    widget: {
      type: "quiz",
      questions: [
        {
          ask: t(
            "Brauzer NET::ERR_CERT_COMMON_NAME_INVALID ko‘rsatdi. Sabab?",
            "The browser shows NET::ERR_CERT_COMMON_NAME_INVALID. The cause?",
          ),
          options: [
            t(
              "Sertifikatdagi nomlar manzilga mos emas",
              "The certificate’s names do not match the address",
            ),
            t("Sertifikat muddati o‘tgan", "The certificate has expired"),
            t("Server sekin", "The server is slow"),
          ],
          answer: 0,
          explain: t(
            "Muddat uchun boshqa xato bor: ERR_CERT_DATE_INVALID.",
            "Expiry has its own error: ERR_CERT_DATE_INVALID.",
          ),
        },
        {
          ask: t(
            "Sertifikat to‘g‘ri, lekin ba’zi qurilmalar unga ishonmaydi. Ehtimoliy sabab?",
            "The certificate is fine, but some devices distrust it. The likely cause?",
          ),
          options: [
            t(
              "Server oraliq sertifikatni yubormayapti",
              "The server is not sending the intermediate",
            ),
            t("Domen juda uzun", "The domain is too long"),
            t("HSTS yoqilgan", "HSTS is on"),
          ],
          answer: 0,
          explain: t(
            "Ba’zi brauzerlar yetishmayotgan oraliqni o‘zi topadi, boshqalari — yo‘q.",
            "Some browsers fetch a missing intermediate themselves; others do not.",
          ),
        },
        {
          ask: t(
            "Birinchi tashrifni ham SSL stripping’dan nima himoya qiladi?",
            "What protects even the first visit from SSL stripping?",
          ),
          options: [
            t("HSTS preload ro‘yxati", "The HSTS preload list"),
            t(
              "HTTP dan HTTPS ga yo‘naltirish",
              "A redirect from HTTP to HTTPS",
            ),
            t("Uzunroq sertifikat kaliti", "A longer certificate key"),
          ],
          answer: 0,
          explain: t(
            "Brauzer ro‘yxatdagi saytga hech qachon oddiy HTTP so‘rov yubormaydi.",
            "The browser never sends a plain HTTP request to a site on the list.",
          ),
        },
        {
          ask: t(
            "Qaysi protokollarni yoqib qo‘yish kerak?",
            "Which protocols should be switched on?",
          ),
          options: [
            code("TLS 1.2 va/and TLS 1.3"),
            code("SSL 3.0 va/and TLS 1.0"),
            code("TLS 1.0 va/and TLS 1.1"),
          ],
          answer: 0,
          explain: t(
            "Eski protokollarda ma’lum zaifliklar bor (POODLE, BEAST).",
            "The old protocols have known weaknesses (POODLE, BEAST).",
          ),
        },
      ],
    },
  },
];
