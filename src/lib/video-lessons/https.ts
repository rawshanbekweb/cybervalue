import type { VideoLesson } from "./types";

// Video lesson for the HTTPS and TLS lab, narrated in Uzbek.
export const HTTPS_VIDEO: VideoLesson = {
  id: "https",
  title: "HTTPS va TLS",
  href: "/akademiya/https",
  chapters: [
    {
      title: "Kirish",
      scenes: [
        {
          say: "Assalomu alaykum! Cybervalue Akademiyasiga xush kelibsiz. Oldingi darsda HTTP protokolini o‘rgandik. Bugun uning himoyalangan varianti — HTTPS haqida gaplashamiz: shifrlash nima uchun kerak, TLS qanday ishlaydi va brauzer saytga nega ishonadi.",
          visual: {
            kind: "title",
            title: "HTTPS va TLS",
            subtitle: "Shifrlash, kalitlar va sertifikatlar",
          },
        },
        {
          say: "Bu darsda ochiq Wi-Fi xavfini, shifrlash g‘oyasini, kalitni qanday kelishishni, TLS qo‘l siqishuvini, sertifikat va ishonch zanjirini hamda brauzer ogohlantirishlarini ko‘rib chiqamiz.",
          visual: {
            kind: "points",
            heading: "Bugun nimani o‘rganamiz",
            items: [
              "Ochiq Wi-Fi xavfi",
              "Shifrlash va kalitlar",
              "TLS qo‘l siqishuvi",
              "Sertifikat va ishonch zanjiri",
              "Ogohlantirishlarni o‘qish",
            ],
          },
        },
      ],
    },
    {
      title: "Kafedagi Wi-Fi",
      scenes: [
        {
          say: "Tasavvur qiling, kafedagi ochiq Wi-Fi’ga ulandingiz va oddiy HTTP saytga parol kiritdingiz. HTTP — ochiq matn. Shu tarmoqdagi istalgan odam maxsus dastur bilan trafikni tinglasa, parolingizni xuddi qog‘ozdagidek o‘qiydi.",
          visual: { kind: "eavesdrop", secure: false },
        },
        {
          say: "HTTP — bu ochiq otkritka. Pochtachi ham, qo‘shni ham uni o‘qiy oladi. HTTPS esa yopiq, muhrlangan konvert: yo‘ldagi hech kim ichini ko‘rmaydi. HTTPS — bu HTTP’ning o‘zi, faqat TLS deb ataluvchi shifrlangan tunnel ichida yuboriladi.",
          visual: {
            kind: "analogy",
            icon: "mail",
            heading: "Otkritka va muhrlangan konvert",
            text: "HTTP — hamma o‘qiydigan otkritka. HTTPS — faqat oluvchi ochadigan konvert.",
          },
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
