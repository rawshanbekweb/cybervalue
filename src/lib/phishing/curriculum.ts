// Academy Intermediate · Blue team, module 5: Phishing analysis. The lessons
// use ./tools.ts: the headers of a fake bank email and six links whose text
// and real address may not agree.
import type { CommonWidget, Lesson, Text } from "../anim-lab/types";

export type Widget = CommonWidget | { type: "headers" } | { type: "links" };

export const PROGRESS_KEY = "cybervalue:phishing:progress:v1";

const t = (uz: string, en: string): Text => ({ uz, en });
const code = (s: string): Text => ({ uz: s, en: s });

const LOOK = t("Ko‘rinish", "The surface");
const HEAD = t("Sarlavhalar", "The headers");
const ACT = t("Harakat", "Acting on it");

export const LESSONS: Lesson<Widget>[] = [
  {
    id: 1,
    group: LOOK,
    title: t("Fishing belgilari", "The signs of phishing"),
    minutes: 6,
    intro: t(
      "Fishing — o‘zini ishonchli tashkilot qilib ko‘rsatib, parol, pul yoki kirish huquqini so‘raydigan xat. U odatda shoshiltiradi, qo‘rqitadi yoki juda yaxshi taklif beradi — o‘ylab ko‘rishga vaqt qoldirmaslik uchun. SOC’ga xodimlar “shubhali xat” deb yuboradi va tahlilchi hukm chiqaradi.",
      "Phishing is an email that poses as a trusted organisation to get a password, money or access. It usually rushes, scares or tempts you — so there is no time to think. Staff report “suspicious emails” to the SOC and an analyst gives the verdict.",
    ),
    analogy: t(
      "Telefon firibgari: “Bankdan qo‘ng‘iroq qilyapmiz, kartangiz bloklanadi, kodni ayting — hozir!”",
      "A phone scammer: “This is your bank, your card is being blocked, read me the code — now!”",
    ),
    theory: [
      t(
        "Bitta belgi — shubha; bir nechtasi birga — deyarli aniq.",
        "One sign raises suspicion; several together make it almost certain.",
      ),
    ],
    task: t(
      "Har biri fishing belgisimi yoki oddiy xat xususiyatimi?",
      "Is each one a sign of phishing, or an ordinary email trait?",
    ),
    hint: t(
      "Shoshiltirish, nomuvofiq manzil, parol so‘rash — belgilar.",
      "Rushing, a mismatched address and asking for a password are signs.",
    ),
    widget: {
      type: "sort",
      buckets: [
        { id: "sign", label: t("Fishing belgisi", "Sign of phishing") },
        { id: "normal", label: t("Oddiy", "Ordinary") },
      ],
      items: [
        {
          label: t(
            "“24 soat ichida tasdiqlamasangiz, karta bloklanadi”",
            "“Confirm within 24 hours or your card will be blocked”",
          ),
          bucket: "sign",
        },
        {
          label: t(
            "Javob manzili (Reply-To) boshqa domenda",
            "The Reply-To address is on another domain",
          ),
          bucket: "sign",
        },
        {
          label: t(
            "Havoladan kirib parolni kiritish so‘raladi",
            "It asks you to log in through a link and enter your password",
          ),
          bucket: "sign",
        },
        {
          label: t(
            "Ilova: hisob.docm — makrosli Word fayli",
            "An attachment, invoice.docm — a Word file with macros",
          ),
          bucket: "sign",
        },
        {
          label: t(
            "Xat ismingiz bilan boshlanadi",
            "The email starts with your name",
          ),
          bucket: "normal",
        },
        {
          label: t(
            "Pastda obunadan chiqish havolasi bor",
            "There is an unsubscribe link at the bottom",
          ),
          bucket: "normal",
        },
      ],
    },
  },
  {
    id: 2,
    group: HEAD,
    title: t("Sarlavhalar tuzilishi", "Anatomy of the headers"),
    minutes: 6,
    intro: t(
      "Xatning ko‘rinadigan “Kimdan” qismi — oddiy matn, uni istalgancha yozish mumkin. Haqiqatni sarlavhalar aytadi: xat qaysi serverlardan o‘tgani (Received), javob qayerga ketishi (Reply-To), qaytgan xatlar qayerga borishi (Return-Path) va qabul qiluvchi server tekshiruvlari natijasi (Authentication-Results).",
      "The visible “From” is just text and can say anything. The headers tell the truth: which servers the email passed through (Received), where replies go (Reply-To), where bounces go (Return-Path) and what the receiving server’s checks found (Authentication-Results).",
    ),
    analogy: t(
      "Konvertdagi pochta muhrlari: qaysi shahardan, qachon yuborilgani — qaytuvchi manzilda nima yozilganidan qat’i nazar.",
      "The postmarks on an envelope: which town it came through and when — whatever the return address claims.",
    ),
    theory: [
      t(
        "Outlook’da: Fayl → Xususiyatlar → Internet sarlavhalari; Gmail’da: “Aslini ko‘rsatish”.",
        "In Outlook: File → Properties → Internet headers. In Gmail: “Show original”.",
      ),
    ],
    task: t(
      "Har bir sarlavhani bosib, nima ekanini o‘qing.",
      "Click each header and read what it is.",
    ),
    hint: t("Hammasi bo‘lib beshta qism.", "Five parts in all."),
    widget: {
      type: "anatomy",
      lines: [
        [{ text: "Received: from … by …; <date>", id: "received" }],
        [{ text: "Authentication-Results: spf=… dkim=… dmarc=…", id: "auth" }],
        [{ text: "Return-Path: <bounce@…>", id: "return" }],
        [{ text: 'From: "Name" <address>', id: "from" }],
        [{ text: "Reply-To: <address>", id: "reply" }],
      ],
      parts: [
        {
          id: "received",
          title: t("Received", "Received"),
          body: t(
            "Har bir server tepaga bittadan qo‘shadi. Eng pastdagisi — birinchi server, xat boshlangan joy.",
            "Every server adds one on top. The bottom one is the first server, where the email started.",
          ),
        },
        {
          id: "auth",
          title: t("Authentication-Results", "Authentication-Results"),
          body: t(
            "Qabul qiluvchi serverning SPF, DKIM va DMARC tekshiruvlari natijasi.",
            "The receiving server’s SPF, DKIM and DMARC results.",
          ),
        },
        {
          id: "return",
          title: t("Return-Path", "Return-Path"),
          body: t(
            "Yetkazilmagan xatlar qaytadigan manzil — SPF aynan shu domenni tekshiradi.",
            "Where bounces go — the domain SPF actually checks.",
          ),
        },
        {
          id: "from",
          title: t("From", "From"),
          body: t(
            "Foydalanuvchi ko‘radigan yuboruvchi. Uni soxtalashtirish oson — DMARC shuni himoya qiladi.",
            "The sender the user sees. Easy to fake — which is what DMARC protects.",
          ),
        },
        {
          id: "reply",
          title: t("Reply-To", "Reply-To"),
          body: t(
            "“Javob berish”ni bosganda xat ketadigan joy. From’dan boshqa domen bo‘lsa — ogohlik belgisi.",
            "Where your reply goes. On a different domain from From, it is a warning sign.",
          ),
        },
      ],
    },
  },
  {
    id: 3,
    group: HEAD,
    title: t("Xat qayerdan kelgan", "Where the email came from"),
    minutes: 10,
    intro: t(
      "“Navroz Bank Security” nomidan xat keldi. Received zanjirini pastdan yuqoriga o‘qing: birinchi server kim edi? Keyin Reply-To’ga qarang: javob berilsa, xat kimga ketadi?",
      "An email arrived from “Navroz Bank Security”. Read the Received chain from the bottom up: which server was first? Then look at Reply-To: if someone replies, who gets it?",
    ),
    analogy: t(
      "Posilka yo‘li: oxirgi omborni emas, birinchi jo‘natilgan joyni qidirasiz.",
      "A parcel’s route: you want where it was first sent from, not the last depot.",
    ),
    theory: [
      t(
        "Pastdagi Received sarlavhalarini hujumchi o‘zi yozishi mumkin; faqat o‘zingizning serveringiz qo‘shganiga to‘liq ishonasiz. Bu yerda zanjir qisqa va izchil.",
        "An attacker can forge the lower Received headers; only the ones your own servers added are fully trustworthy. Here the chain is short and consistent.",
      ),
    ],
    task: t(
      "Birinchi serverning IP manzilini va javoblar ketadigan domenni toping.",
      "Find the first server’s IP address and the domain replies go to.",
    ),
    hint: t(
      "Eng pastdagi Received — birinchi server.",
      "The bottom Received is the first server.",
    ),
    widget: { type: "headers" },
  },
  {
    id: 4,
    group: HEAD,
    title: t("SPF, DKIM va DMARC", "SPF, DKIM and DMARC"),
    minutes: 8,
    intro: t(
      "SPF — domen egasi DNS’da “mening nomimdan qaysi serverlar xat yubora oladi” deb e’lon qiladi. DKIM — yuboruvchi server xatni kalit bilan imzolaydi, qabul qiluvchi DNS’dagi ochiq kalit bilan tekshiradi. DMARC — From domeni SPF yoki DKIM bilan mos kelishini talab qiladi va mos kelmasa nima qilishni aytadi: none, quarantine yoki reject.",
      "SPF: the domain owner publishes in DNS which servers may send mail in its name. DKIM: the sending server signs the email with a key, and the receiver checks it with the public key in DNS. DMARC: requires the From domain to line up with SPF or DKIM, and says what to do when it doesn’t: none, quarantine or reject.",
    ),
    analogy: t(
      "SPF — ruxsat etilgan kuryerlar ro‘yxati; DKIM — konvertdagi muhr; DMARC — “muhrsiz yoki begona kuryer olib kelsa, qaytaring” degan qoida.",
      "SPF is the list of approved couriers; DKIM the wax seal; DMARC the rule “refuse it if the seal or the courier doesn’t match”.",
    ),
    theory: [
      t(
        "SPF pass bo‘lishi xat xavfsiz degani emas: hujumchi o‘z domenidan SPF va DKIM’ni to‘g‘ri sozlashi mumkin. Muhimi — From domeni bilan moslik.",
        "An SPF pass doesn’t make an email safe: attackers set up SPF and DKIM on their own domains too. What matters is alignment with the From domain.",
      ),
    ],
    task: t("Savollarga javob bering.", "Answer the questions."),
    hint: t(
      "DMARC From domenini himoya qiladi.",
      "DMARC protects the From domain.",
    ),
    widget: {
      type: "quiz",
      questions: [
        {
          ask: t(
            "Natija: spf=fail, dkim=none, dmarc=fail (p=reject). Bu nimani bildiradi?",
            "The result: spf=fail, dkim=none, dmarc=fail (p=reject). What does it mean?",
          ),
          options: [
            t(
              "Xat From domeni nomidan yuborishga ruxsatsiz — domen egasi rad etishni so‘ragan",
              "The email wasn’t allowed to use the From domain — its owner asks for it to be rejected",
            ),
            t("Xat xavfsiz", "The email is safe"),
            t("Xat shifrlangan", "The email is encrypted"),
          ],
          answer: 0,
          explain: t(
            "Bu yerda server rad etishi kerak edi — demak, pochta sozlamasi ham tekshirilsin.",
            "The server should have rejected it — so the mail setup needs checking too.",
          ),
        },
        {
          ask: t(
            "Xat secure-navroz.example’dan, SPF va DKIM pass. Bu xavfsizmi?",
            "An email from secure-navroz.example passes SPF and DKIM. Is it safe?",
          ),
          options: [
            t(
              "Yo‘q — bu faqat o‘sha domendan kelganini isbotlaydi, domenning o‘zi soxta bo‘lishi mumkin",
              "No — it only proves it came from that domain, and the domain may be the fake",
            ),
            t("Ha, ikkala test o‘tdi", "Yes, both checks passed"),
            t("Ha, agar logo bo‘lsa", "Yes, if it has a logo"),
          ],
          answer: 0,
          explain: t(
            "Hujumchilar o‘xshash domen ochib, uni to‘g‘ri sozlaydi.",
            "Attackers register look-alike domains and set them up properly.",
          ),
        },
        {
          ask: t("DKIM nimani tekshiradi?", "What does DKIM check?"),
          options: [
            t(
              "Xat imzolangan va yo‘lda o‘zgarmagan",
              "The email was signed and not changed on the way",
            ),
            t("Yuboruvchining IP manzili", "The sender’s IP address"),
            t("Xatda virus yo‘qligi", "That it has no virus"),
          ],
          answer: 0,
          explain: t(
            "IP manzilni SPF tekshiradi.",
            "SPF checks the IP address.",
          ),
        },
      ],
    },
  },
  {
    id: 5,
    group: ACT,
    title: t("Havola matni va manzili", "A link’s text and its address"),
    minutes: 10,
    intro: t(
      "Havolada ikki narsa bor: ko‘rinadigan matn va haqiqiy manzil. Matnda bitta manzil, ichida boshqasi bo‘lishi mumkin. Usullar: domen nomini subdomen sifatida yashirish (bank.uz.yomon.example), bitta harfni almashtirish (paypa1), kirill harflari (punycode: xn--…) va ikki kengaytma (invoice.pdf.exe).",
      "A link has two parts: the text you see and the real address. The text can show one address while the link goes to another. The tricks: hiding a brand as a subdomain (bank.uz.evil.example), swapping one letter (paypa1), Cyrillic look-alike letters (punycode: xn--…) and double extensions (invoice.pdf.exe).",
    ),
    analogy: t(
      "Do‘kon peshtaxtasidagi yozuv va ichidagi mol: yozuvga emas, ichiga qarang.",
      "The sign over a shop and what is inside: look inside, not at the sign.",
    ),
    theory: [
      t(
        "Haqiqiy domen — xost nomining oxiridagi qism: my.bank.uz.secure-login.example’da u secure-login.example.",
        "The real domain is the end of the host name: in my.bank.uz.secure-login.example it is secure-login.example.",
      ),
    ],
    task: t(
      "Har bir havolaning haqiqiy manzilini ochib, xavfsiz yoki shubhali deb belgilang.",
      "Reveal each link’s real address and mark it safe or suspicious.",
    ),
    hint: t("Ikkitasi xavfsiz.", "Two of them are safe."),
    widget: { type: "links" },
  },
  {
    id: 6,
    group: ACT,
    title: t("Ilovalar", "Attachments"),
    minutes: 6,
    intro: t(
      "Ko‘p hujumlar ilova bilan boshlanadi. Eng xavfli turlar kod ishga tushira oladi: makrosli Office fayllari (.docm, .xlsm), yorliqlar (.lnk), skriptlar (.js, .vbs), disk tasvirlari (.iso, .img — ichidagi fayl ogohlantirishsiz ochiladi) va login formasi bor HTML fayllar. Shubhali ilovani o‘z kompyuteringizda emas, sandbox’da oching.",
      "Many attacks start with an attachment. The riskiest types can run code: Office files with macros (.docm, .xlsm), shortcuts (.lnk), scripts (.js, .vbs), disk images (.iso, .img — what is inside opens without warnings) and HTML files with a login form. Open a suspect attachment in a sandbox, not on your own computer.",
    ),
    analogy: t(
      "Notanish odam bergan qutini uyda emas, maxsus xonada ochishadi.",
      "A box from a stranger is opened in a special room, not at home.",
    ),
    theory: [
      t(
        "Sandbox — ajratilgan virtual muhit: fayl u yerda nima qilishini (tarmoq, fayllar, jarayonlar) kuzatib, hisobot beradi.",
        "A sandbox is an isolated virtual machine: it watches what the file does there (network, files, processes) and reports.",
      ),
    ],
    task: t(
      "Har bir ilova xavfi yuqorimi yoki pastroqmi?",
      "Is each attachment high risk or lower risk?",
    ),
    hint: t(
      "Kod ishga tushira oladigan — yuqori xavf.",
      "Anything that can run code is high risk.",
    ),
    widget: {
      type: "sort",
      buckets: [
        { id: "high", label: t("Yuqori xavf", "High risk") },
        { id: "lower", label: t("Pastroq xavf", "Lower risk") },
      ],
      items: [
        { label: code("invoice.docm"), bucket: "high" },
        { label: code("scan_2026.iso"), bucket: "high" },
        { label: code("payment.pdf.lnk"), bucket: "high" },
        { label: code("login.html"), bucket: "high" },
        { label: code("photo.png"), bucket: "lower" },
        { label: code("notes.txt"), bucket: "lower" },
      ],
    },
  },
  {
    id: 7,
    group: ACT,
    title: t("Hukmdan keyin", "After the verdict"),
    minutes: 6,
    intro: t(
      "Xat fishing ekani tasdiqlandi. Endi: boshqa kimlar shu xatni olganini qidirish va ularning pochtasidan o‘chirish; yuboruvchi, domen va havolalarni bloklash; havolani bosgan yoki parol kiritganlarning parolini almashtirish va sessiyalarini yopish; xabar bergan xodimga rahmat aytish.",
      "The email is confirmed phishing. Now: find who else got it and remove it from their mailboxes; block the sender, domain and links; reset the password and end the sessions of anyone who clicked or typed a password; thank the person who reported it.",
    ),
    analogy: t(
      "Bitta qalbaki pul topilsa, kassalardagi qolganini ham qidirishadi.",
      "Find one fake note and you check every till for the rest.",
    ),
    theory: [
      t(
        "Xabar bergan xodimga rahmat — keyingi safar ham xabar berishi uchun. Bosib qo‘yganni ayblash — keyingi safar yashirishiga olib keladi.",
        "Thanking the reporter makes them report next time. Blaming the one who clicked makes the next one hide it.",
      ),
    ],
    task: t("Savollarga javob bering.", "Answer the questions."),
    hint: t(
      "Bitta xat — odatda ko‘p qabul qiluvchi.",
      "One email usually has many recipients.",
    ),
    widget: {
      type: "quiz",
      questions: [
        {
          ask: t(
            "Fishing tasdiqlandi. Birinchi qaysi qadam?",
            "Phishing confirmed. Which step first?",
          ),
          options: [
            t(
              "Boshqa qabul qiluvchilarni topib, xatni pochtalardan olib tashlash",
              "Find the other recipients and pull the email from their mailboxes",
            ),
            t("Hech narsa — bitta xodim edi", "Nothing — it was one person"),
            t("Xatni hamkasblarga yuborish", "Forward it to colleagues"),
          ],
          answer: 0,
          explain: t(
            "Hali hech kim bosmagan bo‘lsa, ulgurasiz.",
            "If nobody has clicked yet, you are in time.",
          ),
        },
        {
          ask: t(
            "Xodim havolada parolini kiritdi. Nima qilasiz?",
            "A worker typed their password on the link. What do you do?",
          ),
          options: [
            t(
              "Parolni almashtirib, barcha sessiyalarini yopasiz va kirishlarni tekshirasiz",
              "Reset the password, end all sessions and check the logins",
            ),
            t("Xodimni ishdan bo‘shatasiz", "Fire them"),
            t("Kutasiz", "Wait"),
          ],
          answer: 0,
          explain: t(
            "Hujumchi parolni darhol ishlatishi mumkin.",
            "The attacker may use the password straight away.",
          ),
        },
        {
          ask: t(
            "Shubhali ilovani qayerda ochasiz?",
            "Where do you open a suspect attachment?",
          ),
          options: [
            t("Sandbox’da", "In a sandbox"),
            t("O‘z ish kompyuteringizda", "On your own work PC"),
            t("Direktorning kompyuterida", "On the director’s PC"),
          ],
          answer: 0,
          explain: t(
            "Ajratilgan muhit — tarmoqqa zarar yetmaydi.",
            "An isolated machine keeps the network safe.",
          ),
        },
      ],
    },
  },
  {
    id: 8,
    group: ACT,
    title: t("Yakuniy savollar", "Final questions"),
    minutes: 6,
    intro: t(
      "Modulni va butun Blue team domenini takrorlaymiz: fishing belgilari, sarlavhalar, Received zanjiri, SPF/DKIM/DMARC, havolalar, ilovalar va hukmdan keyingi qadamlar.",
      "A review of the module and the whole Blue team domain: phishing signs, headers, the Received chain, SPF/DKIM/DMARC, links, attachments and what follows the verdict.",
    ),
    analogy: t(
      "Yaxshi tahlilchi konvertni ochishdan oldin muhrga, manzilga va pochta belgisiga qaraydi.",
      "A good analyst checks the seal, the address and the postmark before opening the envelope.",
    ),
    theory: [
      t(
        "Tabriklaymiz: Blue team domeni tugadi.",
        "Congratulations: the Blue team domain is done.",
      ),
    ],
    task: t(
      "Barcha savollarga to‘g‘ri javob bering.",
      "Answer every question correctly.",
    ),
    hint: t(
      "From — matn; sarlavhalar — dalil.",
      "From is text; the headers are evidence.",
    ),
    widget: {
      type: "quiz",
      questions: [
        {
          ask: t(
            "Received zanjirida birinchi server qaysi?",
            "In the Received chain, which is the first server?",
          ),
          options: [
            t("Eng pastdagisi", "The bottom one"),
            t("Eng tepadagisi", "The top one"),
            t("O‘rtadagisi", "The middle one"),
          ],
          answer: 0,
          explain: t(
            "Har bir server tepaga qo‘shadi.",
            "Each server adds on top.",
          ),
        },
        {
          ask: t(
            "my.bank.uz.secure-login.example’ning haqiqiy domeni?",
            "The real domain of my.bank.uz.secure-login.example?",
          ),
          options: [
            code("secure-login.example"),
            code("bank.uz"),
            code("my.bank.uz"),
          ],
          answer: 0,
          explain: t(
            "Domen xost nomining oxirida.",
            "The domain is at the end of the host name.",
          ),
        },
        {
          ask: t("DMARC nimani himoya qiladi?", "What does DMARC protect?"),
          options: [
            t(
              "From domenini soxtalashtirishdan",
              "The From domain from spoofing",
            ),
            t("Parollarni", "Passwords"),
            t("Ilovalarni", "Attachments"),
          ],
          answer: 0,
          explain: t(
            "U SPF/DKIM’ni From bilan moslashtiradi.",
            "It ties SPF and DKIM to the From domain.",
          ),
        },
        {
          ask: t("Qaysi ilova eng xavfli?", "Which attachment is riskiest?"),
          options: [
            code("payment.pdf.lnk"),
            code("photo.png"),
            code("notes.txt"),
          ],
          answer: 0,
          explain: t(
            "Yorliq buyruq ishga tushiradi; .pdf — niqob.",
            "A shortcut runs a command; .pdf is the disguise.",
          ),
        },
      ],
    },
  },
];
