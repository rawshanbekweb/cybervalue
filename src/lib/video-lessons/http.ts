import type { VideoLesson } from "./types";

// Video lesson for the HTTP basics lab, narrated in Uzbek: Ali buys a
// phone on shop.uz while Kibi follows every request.
export const HTTP_VIDEO: VideoLesson = {
  id: "httpbasics",
  title: "HTTP protokoli",
  href: "/akademiya/http-basics",
  chapters: [
    {
      title: "Ali do‘konga kiradi",
      scenes: [
        {
          say: "Salom, men Kibi! Bugun do‘stimiz Ali yangi telefon sotib olmoqchi. U brauzerni ochadi va manzil qatoriga shop.uz deb yozadi. Bir soniyadan keyin do‘kon sahifasi ochiladi. Lekin shu bir soniya ichida nima bo‘ldi? Keling, bilib olamiz!",
          visual: { kind: "3d", shot: "kibi" },
          host: { hide: true },
          sfx: [{ at: 0.05, name: "magic" }],
        },
        {
          say: "Bu darsda HTTP protokolini o‘rganamiz. HTTP — internetning asosiy tili. Brauzer va server aynan shu tilda gaplashadi. Biz so‘rov va javob ichiga qaraymiz, GET va POST metodlarini, holat kodlarini va Network panelini ko‘ramiz. Oxirida esa xaker Jasur do‘konni qanday aldamoqchi bo‘lganini bilib olamiz.",
          visual: {
            kind: "host",
            title: "HTTP protokoli",
            subtitle: "So‘rov, javob, metod va holat kodi",
            mood: "happy",
          },
        },
      ],
    },
    {
      title: "DNS: manzilni topish",
      scenes: [
        {
          say: "Lekin brauzer shop.uz qayerda joylashganini qayerdan biladi? Kompyuterlar nomlar bilan emas, IP manzillar bilan ishlaydi. Shuning uchun brauzer avval DNS serveridan so‘raydi: «shop.uz ning IP manzili qanday?» DNS javob beradi: «203.0.113.25». Faqat shundan keyin brauzer do‘kon serveriga ulanadi.",
          visual: {
            kind: "exchange",
            left: "Brauzer",
            right: "DNS",
            steps: [
              { dir: "right", label: "shop.uz ?", note: "IP manzil qanday?" },
              { dir: "left", label: "203.0.113.25", note: "mana, manzil" },
            ],
          },
          host: { mood: "think" },
          sfx: [{ at: 0.3, name: "whoosh" }],
        },
        {
          say: "DNS — internetning telefon kitobiga o‘xshaydi. Siz do‘stingizning ismini bilasiz, telefon kitobi esa uning raqamini aytadi. Brauzer javobni bir muddat eslab qoladi, shuning uchun keyingi safar sayt tezroq ochiladi.",
          visual: {
            kind: "analogy",
            icon: "book",
            heading: "Internetning telefon kitobi",
            text: "Ism — shop.uz, raqam — 203.0.113.25.",
          },
          host: { mood: "talk" },
        },
      ],
    },
    {
      title: "Restoran: mijoz va server",
      scenes: [
        {
          say: "HTTP’ni restoranga o‘xshatish mumkin. Ali — mehmon, uning brauzeri — mijoz. Server — oshxona. Men esa ofitsiantman: buyurtmani oshxonaga olib boraman va taomni qaytarib keltiraman. Muhim qoida: suhbatni har doim mijoz boshlaydi. Oshxona hech qachon o‘zi taom yubormaydi.",
          visual: { kind: "3d", shot: "restaurant" },
          host: { mood: "happy" },
          sfx: [
            { at: 0.3, name: "whoosh" },
            { at: 0.7, name: "whoosh" },
          ],
        },
        {
          say: "Brauzer buyurtmani so‘rov deb ataydi, oshxonaning javobi esa javob deyiladi. Bitta sahifa ochilganda brauzer o‘nlab so‘rov yuboradi: sahifaning o‘zi uchun, rasmlar, uslublar va skriptlar uchun. Har birining o‘z javobi bor.",
          visual: {
            kind: "exchange",
            left: "Brauzer",
            right: "shop.uz",
            steps: [
              { dir: "right", label: "GET /", note: "Bosh sahifani bering" },
              { dir: "left", label: "200 OK", note: "Mana, HTML sahifa" },
              { dir: "right", label: "GET /logo.png", note: "Logotip kerak" },
              { dir: "left", label: "200 OK", note: "Mana, rasm" },
            ],
          },
          host: { mood: "talk" },
        },
      ],
    },
    {
      title: "URL tarkibi",
      scenes: [
        {
          say: "Manzil qatoridagi yozuv URL deyiladi va u ham qismlardan iborat. Masalan: https, ikki nuqta, ikki slesh, shop.uz, slesh phones, so‘roq belgisi, brand teng samsung. Boshida sxema — qaysi protokol. Keyin domen — qaysi sayt. Undan keyin yo‘l — sayt ichidagi qaysi sahifa.",
          visual: {
            kind: "message",
            title: "URL",
            lines: [
              { text: "https://", note: "sxema — protokol" },
              { text: "shop.uz", note: "domen — qaysi sayt" },
              { text: ":443", note: "port (odatda yashirin)" },
              { text: "/phones", note: "yo‘l — qaysi sahifa" },
              { text: "?brand=samsung", note: "so‘rov parametrlari" },
              { text: "#reviews", note: "sahifa ichidagi joy" },
            ],
          },
          host: { mood: "talk" },
        },
        {
          say: "So‘roq belgisidan keyingi qism — parametrlar. Ular serverga qo‘shimcha ma’lumot beradi: qaysi brend, qaysi sahifa, qanday saralash. Panjara belgisidan keyingi qism esa serverga umuman yuborilmaydi, u faqat brauzerga sahifaning qaysi joyiga o‘tishni aytadi.",
          visual: {
            kind: "points",
            heading: "Parametrlar",
            items: [
              "?brand=samsung — filtr",
              "&page=2 — ikkinchi sahifa",
              "#reviews — faqat brauzer uchun",
            ],
          },
          host: { mood: "think" },
        },
      ],
    },
    {
      title: "Xatning ichida nima bor",
      scenes: [
        {
          say: "Endi so‘rovni xat kabi ochib ko‘ramiz. Birinchi qatorda uchta narsa bor: metod, yo‘l va versiya. Masalan, POST slesh login HTTP bir nuqta bir. Keyin sarlavhalar keladi. Host — qaysi saytga, User-Agent — qaysi brauzerdan. Undan keyin bitta bo‘sh qator va oxirida tana — formaga yozilgan ma’lumot.",
          visual: { kind: "3d", shot: "letter", stage: 0 },
          host: { mood: "think" },
          sfx: [{ at: 0.15, name: "pop" }],
        },
        {
          say: "Sarlavhalarni batafsilroq ko‘raylik. Bitta serverda ko‘p sayt bo‘lishi mumkin, shuning uchun Host juda muhim. Content-Type tana qanday ma’lumot ekanini aytadi. Cookie sarlavhasi esa server oldin bergan qiymatni qaytaradi — shu orqali server Alini taniydi.",
          visual: {
            kind: "message",
            title: "So‘rov",
            lines: [
              { text: "POST /login HTTP/1.1", note: "metod · yo‘l · versiya" },
              { text: "Host: shop.uz", note: "qaysi sayt" },
              { text: "User-Agent: Firefox/131", note: "qaysi brauzer" },
              {
                text: "Content-Type: application/x-www-form-urlencoded",
                note: "tana turi",
              },
              { text: "Cookie: session=7f2a", note: "server bergan cookie" },
              { text: "", note: "bo‘sh qator" },
              { text: "user=ali&pass=Qwerty-2026", note: "tana" },
            ],
          },
          host: { mood: "talk" },
        },
        {
          say: "Savol! So‘rovning birinchi qatorida qaysi uch qism bor? Javobni tanlang.",
          visual: {
            kind: "quiz",
            question: "So‘rovning birinchi qatorida qaysi uch qism bor?",
            options: [
              "Metod, yo‘l va versiya",
              "Holat kodi, sarlavha va tana",
              "Domen, port va parol",
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
      title: "GET va POST",
      scenes: [
        {
          say: "Ali telefonlar ro‘yxatini ochdi. Bu GET so‘rovi: GET ma’lumotni faqat oladi, hech narsani o‘zgartirmaydi. Xuddi do‘kon javonidan mahsulotni ko‘rish kabi. Keyin Ali buyurtma tugmasini bosdi. Bu POST: POST serverga yangi ma’lumot yuboradi — xuddi pochta qutisiga posilka tashlash kabi.",
          visual: { kind: "3d", shot: "methods" },
          host: { mood: "talk" },
          sfx: [
            { at: 0.3, name: "pop" },
            { at: 0.7, name: "whoosh" },
          ],
        },
        {
          say: "Bir muhim farqni yodda tuting. GET parametrlari manzil qatoriga yoziladi. Agar parol GET bilan yuborilsa, u brauzer tarixida, server jurnallarida va ulashilgan havolalarda qolib ketadi. Shuning uchun parol va maxfiy ma’lumotlar faqat POST so‘rovining tanasida yuboriladi.",
          visual: {
            kind: "terminal",
            lines: [
              { cmd: "GET /login?user=ali&pass=Qwerty-2026" },
              { out: "⚠ parol manzilda: tarix, jurnallar, havolalar" },
              { cmd: "POST /login   (tana: user=ali&pass=…)" },
              { out: "✓ parol so‘rov tanasida" },
            ],
          },
          host: { mood: "think" },
        },
        {
          say: "GET va POST’dan tashqari boshqa metodlar ham bor. PUT mavjud narsani yangilaydi, DELETE esa o‘chiradi. Masalan, Ali savatdagi telefonni o‘chirsa, brauzer DELETE so‘rovini yuborishi mumkin. Lekin eng ko‘p uchraydigani baribir GET va POST.",
          visual: {
            kind: "points",
            heading: "HTTP metodlari",
            items: [
              "GET — olish",
              "POST — yangi narsa yuborish",
              "PUT — yangilash",
              "DELETE — o‘chirish",
            ],
          },
          host: { mood: "talk" },
        },
      ],
    },
    {
      title: "Oshxonadan kelgan javob",
      scenes: [
        {
          say: "Endi oshxonadan kelgan javobni ochamiz. Birinchi qatorda versiya va holat kodi turadi, masalan ikki yuz OK. Keyin sarlavhalar: Content-Type — bu HTML sahifa, Set-Cookie — brauzer eslab qolishi kerak bo‘lgan qiymat. Oxirida tana — sahifaning o‘zi.",
          visual: { kind: "3d", shot: "letter", stage: 1 },
          host: { mood: "talk" },
          sfx: [{ at: 0.15, name: "pop" }],
        },
        {
          say: "Cookie haqida alohida aytish kerak. HTTP o‘zi hech narsani eslab qolmaydi: har bir so‘rov alohida. Cookie tufayli server Alini keyingi so‘rovlarda taniydi, masalan tizimga kirganini biladi. Shuning uchun sessiya cookie’si parol kabi qimmatli: uni o‘g‘irlagan odam Alining nomidan kira oladi.",
          visual: {
            kind: "analogy",
            icon: "id",
            heading: "Cookie — kirish chiptasi",
            text: "Bir marta tekshiriladi, keyin har safar ko‘rsatiladi. Yo‘qotsangiz, boshqa odam foydalanadi.",
          },
          host: { mood: "think" },
        },
      ],
    },
    {
      title: "Holat kodlari svetofori",
      scenes: [
        {
          say: "Holat kodi so‘rov qanday yakunlanganini bitta raqam bilan aytadi. Ularni svetoforga o‘xshataman. Ikki yuzlar — yashil chiroq, hammasi joyida. Uch yuzlar — ko‘k, boshqa manzilga o‘ting. To‘rt yuzlar — sariq, mijoz xato qildi. Besh yuzlar — qizil, serverning o‘zida muammo.",
          visual: { kind: "3d", shot: "status" },
          host: { mood: "happy" },
          sfx: [
            { at: 0.3, name: "ding" },
            { at: 0.45, name: "ding" },
            { at: 0.6, name: "ding" },
            { at: 0.75, name: "alarm" },
          ],
        },
        {
          say: "Eng ko‘p uchraydiganlarini eslab qoling. Ikki yuz — muvaffaqiyat. Uch yuz bir — sahifa butunlay ko‘chgan. To‘rt yuz bir — avval tizimga kiring. To‘rt yuz uch — ruxsat yo‘q. To‘rt yuz to‘rt — bunday sahifa yo‘q. Besh yuz — serverda xato yuz berdi.",
          visual: {
            kind: "points",
            heading: "Eng muhim kodlar",
            items: [
              "200 OK — muvaffaqiyat",
              "301 — sahifa ko‘chgan",
              "401 / 403 — kirish yoki ruxsat yo‘q",
              "404 — topilmadi",
              "500 — server xatosi",
            ],
          },
          host: { mood: "talk" },
        },
        {
          say: "Uch yuzlar haqida bir misol. Ali shop.uz deb yozib, http bilan kirsa, server uch yuz bir kodini va Location sarlavhasini qaytaradi: «Bu sahifa endi https manzilda». Brauzer avtomatik ravishda yangi manzilga o‘tadi. Uch yuz to‘rt esa «o‘zgarmagan» degani: brauzer rasmni qayta yuklamaydi, xotirasidagi nusxadan foydalanadi.",
          visual: {
            kind: "exchange",
            left: "Brauzer",
            right: "shop.uz",
            steps: [
              { dir: "right", label: "GET http://shop.uz", note: "oddiy HTTP" },
              {
                dir: "left",
                label: "301 → https",
                note: "Location: https://shop.uz",
              },
              {
                dir: "right",
                label: "GET https://shop.uz",
                note: "yangi manzil",
              },
              { dir: "left", label: "200 OK", note: "sahifa" },
            ],
          },
          host: { mood: "talk" },
        },
        {
          say: "Savol! Ali mavjud bo‘lmagan sahifani ochmoqchi bo‘ldi. Server qaysi kodni qaytaradi? Javobni tanlang.",
          visual: {
            kind: "quiz",
            question:
              "Mavjud bo‘lmagan sahifa uchun server qaysi kodni qaytaradi?",
            options: ["200 OK", "404 Not Found", "500 Internal Server Error"],
            answer: 1,
          },
          host: { mood: "wink" },
          hold: 5,
          sfx: [{ at: 0.02, name: "pop" }],
        },
      ],
    },
    {
      title: "Network paneli",
      scenes: [
        {
          say: "Bularning hammasini o‘z ko‘zingiz bilan ko‘rishingiz mumkin. Brauzerda F12 tugmasini bosing va Network bo‘limini oching. Sahifani yangilasangiz, har bir so‘rov ro‘yxatda paydo bo‘ladi: metod, manzil, holat kodi, turi va qancha vaqt ketgani.",
          visual: { kind: "devtools" },
          host: { mood: "talk" },
        },
        {
          say: "Istalgan qatorni bossangiz, so‘rov va javobning barcha sarlavhalarini ko‘rasiz. Xavfsizlik mutaxassislari aynan shu yerdan boshlaydi: sayt qanday so‘rovlar yuborayotganini, qaysi cookie’lar borligini va server nima qaytarayotganini o‘rganadi.",
          visual: {
            kind: "points",
            heading: "Network panelida",
            items: [
              "F12 → Network",
              "Har bir so‘rov: metod, yo‘l, kod",
              "Sarlavhalar va cookie’lar",
              "Javob tanasi",
            ],
          },
          host: { mood: "happy" },
        },
      ],
    },
    {
      title: "Jasurning hiylasi",
      scenes: [
        {
          say: "Endi xaker Jasur sahnaga chiqadi. U ham shop.uz’dan telefon olmoqchi, lekin pul to‘lashni istamaydi. Jasur maxsus dastur bilan o‘z so‘rovini ushlab qoladi va narx maydonini bir million besh yuz ming so‘mdan bir so‘mga o‘zgartiradi. Keyin so‘rovni serverga jo‘natadi.",
          visual: { kind: "3d", shot: "tamper", stage: 0 },
          host: { mood: "shock" },
          sfx: [
            { at: 0.4, name: "type" },
            { at: 0.75, name: "whoosh" },
          ],
        },
        {
          say: "Lekin yaxshi server ahmoq emas. U mijozdan kelgan narxga ishonmaydi va narxni o‘zining bazasidan oladi. Jasurning so‘rovi rad etiladi. Mana, eng muhim qoida: so‘rovning har bir qismi foydalanuvchi qo‘lida, shuning uchun narx, ruxsat va huquqlar doim server tomonida tekshiriladi.",
          visual: { kind: "3d", shot: "tamper", stage: 1 },
          host: { mood: "happy" },
          sfx: [{ at: 0.5, name: "alarm" }],
        },
        {
          say: "Jasur to‘xtamaydi. Endi u buyurtmalar sahifasidagi manzilni o‘zgartiradi: order slesh bir yuz bir o‘rniga bir yuz ikki deb yozadi. Agar server bu buyurtma kimniki ekanini tekshirmasa, Jasur boshqa odamning buyurtmasini, manzili va telefon raqamini ko‘rib qoladi. Bu xato juda keng tarqalgan va keyingi darslarda uni batafsil o‘rganamiz.",
          visual: {
            kind: "terminal",
            lines: [
              { cmd: "GET /order/101" },
              { out: "Jasurning buyurtmasi" },
              { cmd: "GET /order/102" },
              { out: "⚠ boshqa mijozning manzili va telefoni!" },
            ],
          },
          host: { mood: "shock" },
          sfx: [{ at: 0.7, name: "alarm" }],
        },
        {
          say: "Savol! Do‘kon serveri narxni qayerdan olishi kerak? Javobni tanlang.",
          visual: {
            kind: "quiz",
            question: "Do‘kon serveri narxni qayerdan olishi kerak?",
            options: [
              "Brauzer yuborgan so‘rovdan",
              "O‘zining ma’lumotlar bazasidan",
              "Cookie ichidan",
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
      title: "Xulosa",
      scenes: [
        {
          say: "Xulosa qilamiz. Mijoz so‘raydi, server javob beradi. So‘rovda metod, yo‘l, sarlavhalar va tana bor. GET oladi, POST yuboradi, parol esa faqat POST bilan ketadi. Holat kodi natijani aytadi. Va eng muhimi: server mijozdan kelgan hech narsaga ko‘r-ko‘rona ishonmaydi.",
          visual: {
            kind: "points",
            heading: "Esda tuting",
            items: [
              "Mijoz so‘raydi, server javob beradi",
              "Metod · yo‘l · sarlavhalar · tana",
              "GET oladi, POST yuboradi",
              "2xx · 3xx · 4xx · 5xx",
              "Server mijozga ishonmaydi",
            ],
          },
          host: { mood: "talk" },
        },
        {
          say: "Ali telefonini oldi, Jasur esa quruq qoldi. Endi siz laboratoriyaga o‘ting: so‘rov va javobni qismlarga ajrating, metodni tanlang, serverga o‘zingiz so‘rov yuboring va Network panelini o‘rganing. Keyingi darsda HTTPS va shifrlashni ko‘ramiz. Men Kibi edim, ko‘rishguncha!",
          visual: { kind: "3d", shot: "kibi" },
          host: { hide: true },
          sfx: [{ at: 0.85, name: "magic" }],
        },
      ],
    },
  ],
};
