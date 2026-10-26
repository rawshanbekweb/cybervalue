import type { VideoLesson } from "./types";

// Video lesson for the HTTPS and TLS lab, narrated in Uzbek.
export const HTTPS_VIDEO: VideoLesson = {
  id: "https",
  title: "HTTPS va TLS",
  href: "/akademiya/https",
  chapters: [
    {
      title: "Kafedagi voqea",
      scenes: [
        {
          say: "Bu Ali. U kafeda qahva ichib o‘tiribdi va bank saytiga kirmoqchi. Kafening Wi-Fi’i ochiq, parol ham so‘ramaydi. Juda qulay, to‘g‘rimi? Ali loginini yozadi, parolini kiritadi…",
          visual: { kind: "cafe", mode: "intro" },
          host: { mood: "happy" },
          sfx: [
            { at: 0.25, name: "type" },
            { at: 0.88, name: "pop" },
          ],
        },
        {
          say: "Lekin burchakdagi stolda Jasur o‘tiribdi. U shu tarmoqdagi barcha trafikni tinglayapti. Ali kirish tugmasini bosdi. Paket Wi-Fi routerga uchdi… va bir soniyadan keyin Alining paroli Jasurning ekranida paydo bo‘ldi!",
          visual: { kind: "cafe", mode: "attack" },
          host: { mood: "shock" },
          sfx: [
            { at: 0.3, name: "whoosh" },
            { at: 0.5, name: "whoosh" },
            { at: 0.72, name: "alarm" },
          ],
        },
        {
          say: "Salom, men Kibi — Cybervalue’ning yordamchi robotiman! Bugun Ali bilan nima bo‘lganini birga tushunamiz va bunday holat siz bilan sodir bo‘lmasligi uchun HTTPS qanday himoya qilishini ko‘ramiz.",
          visual: {
            kind: "host",
            title: "HTTPS va TLS",
            subtitle: "Shifrlash, kalitlar va sertifikatlar",
            mood: "happy",
          },
          sfx: [{ at: 0.05, name: "magic" }],
        },
      ],
    },
    {
      title: "Internet ichiga sayohat",
      scenes: [
        {
          say: "Salom! Men Kibi. Bugun siz bilan internetning ichiga sayohat qilamiz va parolingiz kafedan bankkacha qanday yo‘l bosishini o‘z ko‘zimiz bilan ko‘ramiz. Tayyormisiz? Ketdik!",
          visual: { kind: "3d", shot: "kibi" },
          host: { mood: "happy", hide: true },
          sfx: [{ at: 0.05, name: "magic" }],
        },
        {
          say: "Mana bu — tarmoq. Alining noutbukidan chiqqan paket avval kafe routeriga, keyin provayderga, so‘ng bank serveriga boradi. Agar ulanish oddiy HTTP bo‘lsa, paket ochiq holda uchadi va yo‘ldagi xakerning antennasi uni bemalol o‘qiydi.",
          visual: { kind: "3d", shot: "network" },
          host: { mood: "think" },
          sfx: [
            { at: 0.2, name: "whoosh" },
            { at: 0.75, name: "alarm" },
          ],
        },
        {
          say: "Endi HTTPS’ni yoqamiz. Brauzer va server o‘rtasida TLS tunneli quriladi. Paketlar shu shifrlangan tunnel ichida uchadi. Xaker yana urinib ko‘radi, lekin uning nuri tunnel devoridan qaytadi: ichidagi ma’lumotni o‘qib bo‘lmaydi.",
          visual: { kind: "3d", shot: "tunnel" },
          host: { mood: "happy" },
          sfx: [
            { at: 0.1, name: "whoosh" },
            { at: 0.7, name: "ding" },
          ],
        },
        {
          say: "Bu tunnelning siri — kalitlar. Ochiq kalit qulfni yopadi, yopiq kalit esa faqat serverda turadi va qulfni faqat u ochadi. Keyingi qismda bu qanday ishlashini batafsil ko‘ramiz.",
          visual: { kind: "3d", shot: "lock" },
          host: { mood: "wink" },
          sfx: [
            { at: 0.3, name: "pop" },
            { at: 0.7, name: "magic" },
          ],
        },
      ],
    },
    {
      title: "Nega parol ko‘rindi?",
      scenes: [
        {
          say: "Ali kirgan sayt oddiy HTTP’da ishlagan. HTTP — bu ochiq otkritka. U Alidan bankkacha ko‘p qo‘ldan o‘tadi: kafe routeri, internet provayder, oraliq serverlar. Yo‘ldagi har bir kishi otkritkani o‘qiy oladi.",
          visual: { kind: "postcard" },
          host: { mood: "think" },
          sfx: [{ at: 0.1, name: "whoosh" }],
        },
        {
          say: "Keling, tekshirib ko‘ramiz! Ochiq Wi-Fi’da HTTP orqali yuborilgan parolni kim ko‘ra oladi? Javobni tanlang.",
          visual: {
            kind: "quiz",
            question:
              "Ochiq Wi-Fi’da HTTP orqali yuborilgan parolni kim ko‘ra oladi?",
            options: [
              "Faqat bank sayti",
              "Shu tarmoqdagi istalgan odam",
              "Hech kim — Wi-Fi o‘zi himoyalaydi",
            ],
            answer: 1,
          },
          host: { mood: "wink" },
          hold: 5,
          sfx: [{ at: 0.02, name: "pop" }],
        },
        {
          say: "To‘g‘ri javob: shu tarmoqdagi istalgan odam. Endi xuddi shu voqeani HTTPS bilan ko‘ramiz. Ali yana kiradi… Paket yana Jasurga yetib boradi, lekin uning ekranida faqat tushunarsiz belgilar! Jasur hayron. Qanday qilib? Keling, ichkariga qaraymiz.",
          visual: { kind: "cafe", mode: "secure" },
          host: { mood: "happy" },
          sfx: [
            { at: 0.3, name: "whoosh" },
            { at: 0.72, name: "ding" },
          ],
        },
      ],
    },
    {
      title: "Shifrlash g‘oyasi",
      scenes: [
        {
          say: "Shifrlash g‘oyasi juda qadimiy. Ikki ming yil avval Yuliy Sezar xatlaridagi har bir harfni alifbo bo‘yicha uch qadam surib yozgan. A harfi D ga, B harfi E ga aylanadi. Bu g‘ildirakda tashqi halqa — oddiy alifbo, ichki halqa esa surilgan alifbo. Kalitni bilgan odam g‘ildirakni teskari aylantirib, xatni o‘qiydi.",
          visual: { kind: "3d", shot: "caesar" },
          host: { mood: "think" },
          sfx: [{ at: 0.1, name: "whoosh" }],
        },
        {
          say: "Lekin Sezar shifrida atigi yigirma oltita kalit bor. Kompyuter ularning hammasini bir zumda sinab ko‘radi. Shuning uchun bugungi shifrlar, masalan AES, yuz yigirma sakkiz yoki ikki yuz ellik olti bitli kalitlardan foydalanadi. Bunday kalitni birma-bir sinab topish uchun koinotning yoshi ham yetmaydi.",
          visual: { kind: "keylen" },
          host: { mood: "talk" },
        },
        {
          say: "Sezar ham, AES ham simmetrik shifrlar: bitta kalit bilan qulflanadi va o‘sha kalit bilan ochiladi. Demak, Ali va bank bir xil kalitga ega bo‘lishi kerak. Lekin bu kalitni bir-biriga qanday yetkazishadi? Axir kafedagi Jasur hamma narsani eshitib turibdi!",
          visual: { kind: "3d", shot: "lock" },
          host: { mood: "think" },
        },
        {
          say: "Savol! Simmetrik shifrlashda nechta kalit ishlatiladi? Javobni tanlang.",
          visual: {
            kind: "quiz",
            question: "Simmetrik shifrlashda nechta kalit ishlatiladi?",
            options: [
              "Bitta umumiy kalit — ham qulflaydi, ham ochadi",
              "Ikkita: ochiq va yopiq",
              "Kalit kerak emas",
            ],
            answer: 0,
          },
          host: { mood: "wink" },
          hold: 5,
          sfx: [{ at: 0.02, name: "pop" }],
        },
      ],
    },
    {
      title: "Bo‘yoq sehri: kalitni kelishish",
      scenes: [
        {
          say: "Bu muammoni 1976-yilda Diffi va Xellman ajoyib usul bilan hal qilishdi. Keling, uni bo‘yoqlar bilan tushuntiramiz. Ali va bank ochiq joyda bitta umumiy rangni — sariq bo‘yoqni kelishib olishadi. Jasur ham buni ko‘radi, bu muammo emas.",
          visual: { kind: "3d", shot: "paint", stage: 0 },
          host: { mood: "happy" },
          sfx: [{ at: 0.4, name: "pop" }],
        },
        {
          say: "Endi har biri o‘zining yashirin rangini tanlaydi: Ali — qizil, bank — ko‘k. Bu ranglarni hech kimga aytishmaydi. Har biri yashirin rangini umumiy sariq bilan aralashtiradi va hosil bo‘lgan aralashmani ochiq yuboradi: Alidan to‘q sariq, bankdan yashil.",
          visual: { kind: "3d", shot: "paint", stage: 1 },
          host: { mood: "think" },
          sfx: [
            { at: 0.45, name: "pop" },
            { at: 0.7, name: "whoosh" },
          ],
        },
        {
          say: "Endi sehr boshlanadi. Ali bankdan kelgan yashil aralashmaga o‘zining qizil rangini qo‘shadi. Bank esa Alidan kelgan to‘q sariqqa o‘zining ko‘k rangini qo‘shadi. Ikkalasida ham bir xil jigarrang hosil bo‘ladi! Jasur faqat aralashmalarni ko‘rdi. Bo‘yoqni qaytadan ajratib bo‘lmaydi, shuning uchun u jigarrangni topa olmaydi.",
          visual: { kind: "3d", shot: "paint", stage: 2 },
          host: { mood: "happy" },
          sfx: [{ at: 0.55, name: "magic" }],
        },
        {
          say: "Haqiqiy TLS’da bo‘yoq o‘rniga juda katta sonlar va matematik amallar ishlatiladi, lekin g‘oya aynan shu. Natijada Ali va bank hech qachon tarmoq orqali yubormagan umumiy maxfiy kalitga ega bo‘lishadi. Endi butun suhbat shu kalit bilan shifrlangan tunnel ichida yuradi.",
          visual: { kind: "3d", shot: "tunnel" },
          host: { mood: "talk" },
          sfx: [{ at: 0.1, name: "whoosh" }],
        },
      ],
    },
    {
      title: "TLS qo‘l siqishuvi",
      scenes: [
        {
          say: "Bularning hammasi TLS qo‘l siqishuvi paytida bo‘ladi. Avval brauzer ClientHello yuboradi: «Salom, men TLS bir nuqta uchni bilaman, mana mening bo‘yoq aralashmam». Server ServerHello bilan javob beradi: «Salom, TLS bir nuqta uchni tanladim, mana mening aralashmam va sertifikatim».",
          visual: { kind: "3d", shot: "handshake", stage: 0 },
          host: { mood: "talk" },
          sfx: [
            { at: 0.25, name: "whoosh" },
            { at: 0.6, name: "whoosh" },
          ],
        },
        {
          say: "Brauzer sertifikatni tekshiradi, ikki tomon umumiy kalitni hisoblaydi va Finished xabarlarini almashadi. Hammasi sekundning o‘ndan biridan ham kam vaqtda tugaydi. Shundan keyin oddiy HTTP so‘rovlar shifrlangan tunnel ichida yuboriladi va manzil qatorida qulf paydo bo‘ladi.",
          visual: { kind: "3d", shot: "handshake", stage: 1 },
          host: { mood: "happy" },
          sfx: [
            { at: 0.3, name: "whoosh" },
            { at: 0.75, name: "ding" },
          ],
        },
        {
          say: "Keling, qo‘l siqishuvni yana bir bor ketma-ket ko‘ramiz. ClientHello — taklif. ServerHello — tanlov. Sertifikat — server kimligini isbotlaydi. Kalit almashuvi — har ikki tomon umumiy kalitni hisoblaydi. Finished — hammasi joyida, endi shifrlangan suhbat boshlanadi.",
          visual: {
            kind: "exchange",
            left: "Brauzer",
            right: "bank.uz",
            steps: [
              {
                dir: "right",
                label: "ClientHello",
                note: "versiyalar, shifrlar, aralashma",
              },
              {
                dir: "left",
                label: "ServerHello",
                note: "tanlangan shifr, aralashma",
              },
              { dir: "left", label: "Sertifikat", note: "ochiq kalit + imzo" },
              { dir: "right", label: "Finished", note: "umumiy kalit tayyor" },
              {
                dir: "left",
                label: "Finished",
                note: "shifrlangan kanal ochiq",
              },
            ],
          },
          host: { mood: "talk" },
        },
      ],
    },
    {
      title: "Jasurning rentgeni",
      scenes: [
        {
          say: "Endi Jasurning rentgeniga qaraymiz. HTTPS paketini muhrlangan konvertga o‘xshatish mumkin. Konvert ichidagi hamma narsa — sahifa manzili, cookie, parol va sahifa mazmuni — shifrlangan. Jasurning rentgeni ichini ko‘ra olmaydi, faqat tushunarsiz belgilarni ko‘radi.",
          visual: { kind: "3d", shot: "xray", stage: 0 },
          host: { mood: "happy" },
          sfx: [{ at: 0.35, name: "whoosh" }],
        },
        {
          say: "Lekin konvert sirtidagi yozuv ko‘rinadi: qaysi domen va qaysi IP manzilga ketayotgani, qachon va qancha ma’lumot yuborilgani. Shuning uchun HTTPS mazmunni yashiradi, lekin qayerga borayotganingizni to‘liq yashirmaydi.",
          visual: { kind: "3d", shot: "xray", stage: 1 },
          host: { mood: "think" },
        },
        {
          say: "Savol! HTTPS bilan kafedagi Jasur nimani ko‘ra oladi? Javobni tanlang.",
          visual: {
            kind: "quiz",
            question: "HTTPS bilan kafedagi Jasur nimani ko‘ra oladi?",
            options: [
              "Alining parolini",
              "Ali qaysi saytga ulanayotganini",
              "Sahifadagi xabarlarni",
            ],
            answer: 1,
          },
          host: { mood: "wink" },
          hold: 5,
          sfx: [{ at: 0.02, name: "pop" }],
        },
      ],
    },
    {
      title: "Saytning pasporti",
      scenes: [
        {
          say: "Lekin bitta savol qoldi: Ali haqiqatan bank bilan gaplashayotganini qayerdan biladi? Balki Jasur o‘zini bank qilib ko‘rsatayotgandir? Bu yerda sertifikat yordam beradi. Sertifikat — saytning raqamli pasporti.",
          visual: { kind: "3d", shot: "passport", stage: 0 },
          host: { mood: "think" },
          sfx: [{ at: 0.3, name: "magic" }],
        },
        {
          say: "Pasportda saytning nomi — bank.uz, uni bergan tashkilot, amal qilish muddati va saytning ochiq kaliti yozilgan. Eng muhimi — imzo. Pasportni ishonchli sertifikat markazi imzolagan, uni soxtalashtirib bo‘lmaydi. Yopiq kalit esa hech qachon pasportda bo‘lmaydi, u faqat serverda turadi.",
          visual: { kind: "3d", shot: "passport", stage: 1 },
          host: { mood: "talk" },
          sfx: [{ at: 0.6, name: "pop" }],
        },
        {
          say: "Brauzer imzoni tekshiradi. Sayt sertifikatini oraliq markaz imzolagan, oraliq markazni esa ildiz markaz. Ildiz markazlar ro‘yxati brauzeringiz ichida, maxsus seyfda saqlanadi. Zanjirning har bir halqasi to‘g‘ri bo‘lsa, manzil qatorida qulf paydo bo‘ladi.",
          visual: { kind: "3d", shot: "chain" },
          host: { mood: "happy" },
          sfx: [
            { at: 0.3, name: "ding" },
            { at: 0.55, name: "ding" },
            { at: 0.8, name: "ding" },
          ],
        },
        {
          say: "Buni o‘zingiz ham tekshira olasiz. Brauzerda manzil qatoridagi qulf belgisini bosing, keyin «Ulanish xavfsiz» va «Sertifikat» bo‘limini oching. U yerda sertifikat kimga berilgani, kim imzolagani va qachongacha amal qilishini ko‘rasiz.",
          visual: {
            kind: "message",
            title: "Sertifikat",
            lines: [
              { text: "Subject: CN=bank.uz", note: "kimga berilgan" },
              { text: "SAN: bank.uz, www.bank.uz", note: "qaysi domenlar" },
              { text: "Issuer: R3 Intermediate CA", note: "kim imzolagan" },
              { text: "Valid: 2026-09-01 → 2026-11-30", note: "muddati" },
              { text: "Public key: EC P-256 04:8f:3a:…", note: "ochiq kalit" },
              { text: "Signature: sha256-ECDSA 30:45:…", note: "imzo" },
            ],
          },
          host: { mood: "talk" },
        },
      ],
    },
    {
      title: "Ogohlantirishlar va firibgarlar",
      scenes: [
        {
          say: "Agar zanjirdagi biror halqa noto‘g‘ri bo‘lsa, brauzer qizil ogohlantirish ko‘rsatadi. Asosiy sabablar: sertifikat muddati tugagan, boshqa domen uchun berilgan, o‘z-o‘zini imzolagan yoki noma’lum markazdan. Bunday paytda to‘xtang va parol yoki karta ma’lumotlarini kiritmang.",
          visual: { kind: "warning" },
          host: { mood: "shock" },
          sfx: [{ at: 0.08, name: "alarm" }],
        },
        {
          say: "Endi eng ayyor hiylani ko‘ramiz. Jasur bank-uz.top degan domen sotib oladi va unga bepul sertifikat oladi. Uning saytida ham qulf bor! Chunki qulf faqat ulanish shifrlanganini bildiradi, sayt halol ekanini emas. Ikki peshtaxtani solishtiring: farq faqat domen nomida.",
          visual: { kind: "3d", shot: "storefront" },
          host: { mood: "think" },
        },
        {
          say: "Savol! Qaysi biri haqiqiy bank sayti? Javobni tanlang.",
          visual: {
            kind: "quiz",
            question: "Qaysi biri haqiqiy bank sayti?",
            options: [
              "bank-uz.top — qulfi bor",
              "bank.uz — bankning rasmiy domeni",
              "Ikkalasi ham, chunki ikkalasida qulf bor",
            ],
            answer: 1,
          },
          host: { mood: "wink" },
          hold: 5,
          sfx: [{ at: 0.02, name: "pop" }],
        },
        {
          say: "Amalda uchta odatni shakllantiring. Parol yoki karta kiritishdan oldin manzil https bilan boshlanayotganini va domen to‘g‘ri yozilganini tekshiring. Brauzer sozlamalarida faqat HTTPS rejimini yoqing. Ochiq Wi-Fi’da muhim ishlarni qilmang yoki ishonchli VPN ishlating.",
          visual: {
            kind: "points",
            heading: "Uchta odat",
            items: [
              "https:// va domenni tekshiring",
              "Brauzerda “faqat HTTPS” rejimi",
              "Ochiq Wi-Fi’da ehtiyot bo‘ling",
            ],
          },
          host: { mood: "talk" },
        },
      ],
    },
    {
      title: "Xulosa",
      scenes: [
        {
          say: "Xulosa qilamiz. HTTPS — bu TLS tunneli ichidagi HTTP. Bo‘yoq sehri kabi kalit almashuvi bilan umumiy kalit kelishiladi, keyin hammasi tez shifrlanadi. Sertifikat saytning pasporti, ishonch zanjiri esa ildiz markazgacha tekshiriladi. Qulf halollik belgisi emas, domenni har doim o‘zingiz tekshiring.",
          visual: {
            kind: "points",
            heading: "Esda tuting",
            items: [
              "HTTPS = HTTP + TLS",
              "Kalit almashuvi → umumiy kalit → shifr",
              "Sertifikat — saytning pasporti",
              "Ogohlantirishda to‘xtang",
              "Qulf ≠ halol sayt",
            ],
          },
          host: { mood: "talk" },
        },
        {
          say: "Ali endi kafeda ham xotirjam: u https’ni va domenni tekshiradi, ogohlantirishlarga e’tibor beradi. Siz ham laboratoriyaga o‘ting: kuzatuvchini ko‘ring, shifrni o‘zingiz oching, sertifikat zanjirini tekshiring va nazorat testidan o‘tib sertifikat oling. Men Kibi edim, keyingi darsda ko‘rishguncha!",
          visual: { kind: "3d", shot: "kibi" },
          host: { hide: true },
          sfx: [{ at: 0.85, name: "magic" }],
        },
      ],
    },
  ],
};
