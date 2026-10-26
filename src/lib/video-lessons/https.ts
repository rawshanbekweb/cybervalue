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
          say: "Shifrlash — matnni kalit yordamida tushunarsiz ko‘rinishga keltirish. Eng oddiy misol — Sezar shifri: har bir harf alifbo bo‘yicha bir necha qadam suriladi. Kalit uch bo‘lsa, a harfi d ga, b harfi e ga aylanadi.",
          visual: { kind: "caesar", plain: "parol", key: 3 },
        },
        {
          say: "Bu simmetrik shifrlash: bitta kalit bilan qulflanadi va o‘sha kalit bilan ochiladi. Haqiqiy tizimlarda AES kabi kuchli algoritmlar ishlatiladi. Lekin bitta muammo qoladi: ikki tomon shu kalitni qanday qilib xavfsiz kelishib oladi? Axir kalitni ochiq tarmoq orqali yuborsak, uni ham tinglab olishadi.",
          visual: {
            kind: "points",
            heading: "Simmetrik shifrlash",
            items: [
              "Bitta kalit qulflaydi va ochadi",
              "Tez ishlaydi: AES",
              "Muammo: kalitni qanday kelishish?",
            ],
          },
        },
      ],
    },
    {
      title: "Kalitni kelishish",
      scenes: [
        {
          say: "Bu muammoni ochiq kalitli kriptografiya hal qiladi. Serverda ikkita kalit bor. Ochiq kalit — bu qulf, uni hammaga berish mumkin. Yopiq kalit — qulfni ochadigan kalitning o‘zi, u serverdan hech qachon chiqmaydi.",
          visual: {
            kind: "analogy",
            icon: "lock",
            heading: "Ochiq qulf va yashirin kalit",
            text: "Qulfni hammaga tarqatasiz, kalitni esa faqat o‘zingiz saqlaysiz.",
          },
        },
        {
          say: "Brauzer server bergan qulf yordamida umumiy maxfiy kalitni xavfsiz kelishadi. Yo‘ldagi kuzatuvchi qulfni ko‘rsa ham, yopiq kalitsiz hech narsani ocha olmaydi. Keyin butun suhbat o‘sha umumiy kalit bilan tez simmetrik shifrlanadi.",
          visual: {
            kind: "exchange",
            left: "Brauzer",
            right: "bank.uz",
            steps: [
              {
                dir: "left",
                label: "ochiq kalit",
                note: "qulfni hammaga beradi",
              },
              {
                dir: "right",
                label: "kalit ulushi",
                note: "faqat server ochadi",
              },
              {
                dir: "right",
                label: "▓▓▓▓▓▓",
                note: "endi hammasi shifrlangan",
              },
            ],
          },
        },
      ],
    },
    {
      title: "TLS qo‘l siqishuvi",
      scenes: [
        {
          say: "HTTPS ulanish boshida brauzer va server qo‘l siqishadi. Avval brauzer ClientHello yuboradi: o‘zi biladigan TLS versiyalari va shifrlar ro‘yxatini. Server ServerHello bilan javob beradi: bittasini tanlaydi va o‘z sertifikatini yuboradi.",
          visual: {
            kind: "exchange",
            left: "Brauzer",
            right: "bank.uz",
            steps: [
              {
                dir: "right",
                label: "ClientHello",
                note: "versiyalar, shifrlar",
              },
              { dir: "left", label: "ServerHello", note: "tanlangan shifr" },
              { dir: "left", label: "Sertifikat", note: "ochiq kalit + imzo" },
              { dir: "right", label: "Kalit almashuvi", note: "umumiy kalit" },
              {
                dir: "right",
                label: "Finished",
                note: "shifrlangan kanal tayyor",
              },
            ],
          },
        },
        {
          say: "Brauzer sertifikatni tekshiradi, keyin ikki tomon umumiy kalitni kelishadi. Shundan so‘ng shifrlangan kanal tayyor bo‘ladi va oddiy HTTP so‘rovlar shu kanal ichida yuboriladi. Bularning barchasi soniyaning bir qismida bo‘lib o‘tadi.",
          visual: {
            kind: "points",
            heading: "Qo‘l siqishuv bosqichlari",
            items: [
              "ClientHello — taklif",
              "ServerHello va sertifikat",
              "Sertifikatni tekshirish",
              "Umumiy kalit → shifrlangan kanal",
            ],
          },
        },
      ],
    },
    {
      title: "HTTPS nimani yashiradi?",
      scenes: [
        {
          say: "Endi o‘sha kafeni yana ko‘ramiz, lekin bu safar HTTPS bilan. Kuzatuvchi faqat tushunarsiz baytlarni ko‘radi. Sahifa manzili, sarlavhalar, cookie’lar, parol va sahifa mazmuni shifrlangan.",
          visual: { kind: "eavesdrop", secure: true },
        },
        {
          say: "Lekin hamma narsa yashirilmaydi. Qaysi saytga, ya’ni qaysi domen va IP manzilga ulanayotganingiz, qachon va qancha ma’lumot yuborganingiz ko‘rinib turadi. HTTPS mazmunni himoya qiladi, lekin qayerga borayotganingizni to‘liq yashirmaydi.",
          visual: {
            kind: "points",
            heading: "HTTPS bilan",
            items: [
              "Yashirin: yo‘l, sarlavhalar, cookie, parol, mazmun",
              "Ko‘rinadi: domen va IP manzil",
              "Ko‘rinadi: vaqt va hajm",
            ],
          },
        },
      ],
    },
    {
      title: "Sertifikat va ishonch zanjiri",
      scenes: [
        {
          say: "Sertifikat — saytning raqamli pasporti. Unda sertifikat qaysi domen uchun berilgani, kim tomonidan imzolangani, amal qilish muddati, saytning ochiq kaliti va imzo bor. Yopiq kalit esa sertifikat ichida hech qachon bo‘lmaydi.",
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
        },
        {
          say: "Brauzer sertifikatga nega ishonadi? Sayt sertifikatini oraliq sertifikat markazi imzolagan, uni esa ildiz sertifikat markazi imzolagan. Ildiz markazlar ro‘yxati brauzer va operatsion tizimga oldindan o‘rnatilgan. Zanjirning har bir halqasi tekshiriladi.",
          visual: { kind: "chain" },
        },
      ],
    },
    {
      title: "Ogohlantirishlarni o‘qish",
      scenes: [
        {
          say: "Agar tekshiruv o‘tmasa, brauzer qizil ogohlantirish ko‘rsatadi. Asosiy sabablar: sertifikat muddati tugagan, boshqa domen uchun berilgan, o‘z-o‘zini imzolagan yoki noma’lum markazdan. Bunday paytda to‘xtang va parol yoki karta ma’lumotlarini kiritmang.",
          visual: { kind: "warning" },
        },
        {
          say: "Yana bir muhim narsa: qulf belgisi sayt halol ekanini kafolatlamaydi. Firibgar ham o‘z domeni uchun bepul sertifikat ola oladi. Qulf faqat ulanish shifrlanganini bildiradi. Shuning uchun manzil qatoridagi domenni har doim diqqat bilan o‘qing.",
          visual: {
            kind: "analogy",
            icon: "warning",
            heading: "Qulf ≠ halollik",
            text: "bank.uz va bank-uz.top — ikkalasida ham qulf bo‘lishi mumkin.",
          },
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
        },
      ],
    },
    {
      title: "Xulosa",
      scenes: [
        {
          say: "Xulosa qilamiz. HTTPS — bu TLS tunneli ichidagi HTTP. Ochiq kalit bilan umumiy kalit kelishiladi, keyin hammasi tez shifrlanadi. Sertifikat saytning kimligini isbotlaydi, ishonch zanjiri esa ildiz markazgacha tekshiriladi. Ogohlantirishni hech qachon e’tiborsiz qoldirmang.",
          visual: {
            kind: "points",
            heading: "Esda tuting",
            items: [
              "HTTPS = HTTP + TLS",
              "Ochiq kalit → umumiy kalit → shifr",
              "Sertifikat — saytning pasporti",
              "Ogohlantirishda to‘xtang",
              "Qulf ≠ halol sayt",
            ],
          },
        },
        {
          say: "Endi laboratoriyaga o‘ting: kafedagi kuzatuvchini ko‘ring, shifrni o‘zingiz oching, sertifikat zanjirini tekshiring va ogohlantirishlarni o‘qishni mashq qiling. Oxirida nazorat testidan o‘ting va sertifikat oling. Omad!",
          visual: {
            kind: "title",
            title: "Endi amaliyot!",
            subtitle: "Laboratoriya · nazorat testi · sertifikat",
          },
        },
      ],
    },
  ],
};
