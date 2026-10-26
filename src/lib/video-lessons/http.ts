import type { VideoLesson } from "./types";

// Video lesson for the HTTP basics lab, narrated in Uzbek.
export const HTTP_VIDEO: VideoLesson = {
  id: "httpbasics",
  title: "HTTP protokoli",
  href: "/akademiya/http-basics",
  chapters: [
    {
      title: "Kirish",
      scenes: [
        {
          say: "Assalomu alaykum! Cybervalue Akademiyasiga xush kelibsiz. Bugun internetning asosiy tili — HTTP protokolini o‘rganamiz. Brauzerda istalgan saytni ochganingizda, orqa fonda aynan HTTP ishlaydi. Veb-xavfsizlikni tushunish uchun avval shu tilni bilish kerak.",
          visual: {
            kind: "title",
            title: "HTTP protokoli",
            subtitle: "So‘rov, javob, metod va holat kodi",
          },
        },
        {
          say: "Bu darsda mijoz va server nima ekanini, so‘rov va javob ichida nima borligini, GET va POST metodlarining farqini, holat kodlarini va brauzerdagi Network panelini ko‘rib chiqamiz.",
          visual: {
            kind: "points",
            heading: "Bugun nimani o‘rganamiz",
            items: [
              "Mijoz va server",
              "So‘rov ichida nima bor",
              "GET va POST",
              "Javob va holat kodlari",
              "Network paneli",
            ],
          },
        },
      ],
    },
    {
      title: "Mijoz va server",
      scenes: [
        {
          say: "Internetdagi har bir suhbatda ikki tomon bor. Mijoz — bu so‘rov yuboradigan dastur, ko‘pincha brauzeringiz. Server esa saytni saqlaydigan va javob qaytaradigan kompyuter. Suhbatni har doim mijoz boshlaydi: u so‘rov yuboradi, server javob beradi.",
          visual: {
            kind: "exchange",
            left: "Brauzer",
            right: "shop.uz",
            steps: [
              { dir: "right", label: "GET /", note: "Bosh sahifani bering" },
              { dir: "left", label: "200 OK", note: "Mana, HTML sahifa" },
            ],
          },
        },
        {
          say: "Buni restoranga o‘xshatish mumkin. Siz ofitsiantga buyurtma berasiz, oshxona taomni tayyorlaydi va ofitsiant olib keladi. Siz so‘ramaguningizcha oshxona o‘zi hech narsa yubormaydi. Bitta sahifa ochilganda esa brauzer o‘nlab shunday buyurtma beradi: rasmlar, uslublar, skriptlar uchun.",
          visual: {
            kind: "analogy",
            icon: "bell",
            heading: "Restoran va ofitsiant",
            text: "Buyurtma — so‘rov, olib kelingan taom — javob.",
          },
        },
      ],
    },
    {
      title: "So‘rov ichida nima bor",
      scenes: [
        {
          say: "Endi so‘rovning ichiga qaraymiz. Birinchi qatorda uchta narsa bor: metod, yo‘l va protokol versiyasi. Bu misolda metod POST, yo‘l slesh login, versiya HTTP bir nuqta bir. Ya’ni brauzer login sahifasiga ma’lumot yubormoqda.",
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
              { text: "", note: "bo‘sh qator" },
              { text: "user=ali&pass=Qwerty-2026", note: "tana" },
            ],
          },
        },
        {
          say: "Keyin sarlavhalar keladi. Host — so‘rov qaysi sayt uchun ekanini aytadi, chunki bitta serverda ko‘p sayt bo‘lishi mumkin. User-Agent — brauzeringiz nomi. Sarlavhalardan keyin bitta bo‘sh qator turadi. Undan keyin esa tana, ya’ni formaga kiritilgan ma’lumot yuboriladi.",
          visual: {
            kind: "points",
            heading: "So‘rovning qismlari",
            items: [
              "Birinchi qator: metod, yo‘l, versiya",
              "Sarlavhalar: Host, User-Agent…",
              "Bo‘sh qator",
              "Tana: forma ma’lumotlari",
            ],
          },
        },
      ],
    },
    {
      title: "GET va POST",
      scenes: [
        {
          say: "Eng ko‘p ishlatiladigan ikki metod — GET va POST. GET ma’lumotni olish uchun: sahifani ochish, mahsulotlar ro‘yxatini ko‘rish. U hech narsani o‘zgartirmasligi kerak. POST esa ma’lumot yuborish uchun: ro‘yxatdan o‘tish, kirish, buyurtma berish.",
          visual: {
            kind: "methods",
          },
        },
        {
          say: "Muhim farq bor. GET parametrlari manzil qatoriga yoziladi. Agar parolni GET bilan yuborsangiz, u brauzer tarixida, server jurnallarida va ulashilgan havolalarda qolib ketadi. Shuning uchun parol va maxfiy ma’lumotlar faqat POST so‘rovining tanasida yuboriladi.",
          visual: {
            kind: "terminal",
            lines: [
              { cmd: "GET /login?user=ali&pass=Qwerty-2026" },
              { out: "⚠ parol manzilda: tarix, jurnallar, havolalar" },
              { cmd: "POST /login   (tana: user=ali&pass=…)" },
              { out: "✓ parol so‘rov tanasida" },
            ],
          },
        },
      ],
    },
    {
      title: "Javob ichida nima bor",
      scenes: [
        {
          say: "Server javobi ham xuddi shunday tuzilgan. Birinchi qatorda versiya va holat kodi turadi, masalan, ikki yuz OK. Keyin sarlavhalar: Content-Type tana qanday ma’lumot ekanini aytadi, Set-Cookie esa brauzerga eslab qolish uchun qiymat beradi. Oxirida tana — sahifaning o‘zi.",
          visual: {
            kind: "message",
            title: "Javob",
            lines: [
              { text: "HTTP/1.1 200 OK", note: "versiya · holat kodi" },
              {
                text: "Content-Type: text/html; charset=utf-8",
                note: "tana turi",
              },
              { text: "Content-Length: 46", note: "tana hajmi" },
              {
                text: "Set-Cookie: session=7f2a; HttpOnly; Secure",
                note: "cookie",
              },
              { text: "", note: "bo‘sh qator" },
              { text: "<h1>Xush kelibsiz, Ali!</h1>", note: "tana" },
            ],
          },
        },
        {
          say: "Cookie haqida alohida aytish kerak. HTTP o‘zi hech narsani eslab qolmaydi, har bir so‘rov alohida. Cookie tufayli server sizni keyingi so‘rovlarda taniydi, masalan, tizimga kirganingizni biladi. Shuning uchun sessiya cookie’si parol kabi qimmatli: uni o‘g‘irlagan odam sizning nomingizdan kira oladi.",
          visual: {
            kind: "analogy",
            icon: "id",
            heading: "Cookie — kirish chiptasi",
            text: "Bir marta tekshiriladi, keyin har safar ko‘rsatiladi. Yo‘qotsangiz, boshqa odam foydalanadi.",
          },
        },
      ],
    },
    {
      title: "Holat kodlari",
      scenes: [
        {
          say: "Holat kodi so‘rov qanday yakunlanganini bitta raqam bilan aytadi. Ular beshta oilaga bo‘linadi. Ikki yuzlar — muvaffaqiyat. Uch yuzlar — boshqa manzilga yo‘naltirish. To‘rt yuzlar — mijoz tomonidagi xato. Besh yuzlar — server xatosi.",
          visual: { kind: "families" },
        },
        {
          say: "Eng ko‘p uchraydiganlarini eslab qoling. Ikki yuz — hammasi joyida. Uch yuz bir — sahifa butunlay ko‘chgan. To‘rt yuz bir — avval tizimga kiring. To‘rt yuz uch — ruxsat yo‘q. To‘rt yuz to‘rt — bunday sahifa yo‘q. Besh yuz — serverning o‘zida xato yuz berdi.",
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
        },
      ],
    },
    {
      title: "Network paneli",
      scenes: [
        {
          say: "Bularning hammasini o‘z ko‘zingiz bilan ko‘rishingiz mumkin. Brauzerda F12 tugmasini bosing va Network bo‘limini oching. Sahifani yangilasangiz, har bir so‘rov ro‘yxatda paydo bo‘ladi: metod, manzil, holat kodi, turi va qancha vaqt ketgani.",
          visual: { kind: "devtools" },
        },
        {
          say: "Istalgan qatorni bossangiz, so‘rov va javobning barcha sarlavhalarini ko‘rasiz. Xavfsizlik mutaxassislari aynan shu yerdan boshlaydi: sayt qanday so‘rovlar yuborayotganini, qaysi cookie’lar borligini va server nima qaytarayotganini ko‘radi.",
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
        },
      ],
    },
    {
      title: "HTTP va xavfsizlik",
      scenes: [
        {
          say: "Xavfsizlik nuqtai nazaridan eng muhim qoida: so‘rovning har bir qismi foydalanuvchi qo‘lida. Brauzer yuborgan metod, yo‘l, sarlavhalar, cookie va tana — hammasini maxsus dasturlar bilan istalgancha o‘zgartirish mumkin. Masalan, narx maydonini kamaytirish yoki boshqa foydalanuvchining raqamini yozish.",
          visual: {
            kind: "terminal",
            lines: [
              { cmd: "POST /api/cart   price=150000" },
              { out: "asl so‘rov" },
              { cmd: "POST /api/cart   price=1" },
              { out: "hujumchi o‘zgartirgan so‘rov" },
            ],
          },
        },
        {
          say: "Shuning uchun server mijozdan kelgan hech bir qiymatga ko‘r-ko‘rona ishonmasligi kerak. Narx, ruxsat va foydalanuvchi huquqlari har doim server tomonida tekshiriladi. Keyingi darslarda aynan shu xatolardan kelib chiqadigan hujumlarni o‘rganamiz.",
          visual: {
            kind: "analogy",
            icon: "guard",
            heading: "Server — qo‘riqchi",
            text: "Mijoz nima desa ham, qaror server tomonida qabul qilinadi.",
          },
        },
      ],
    },
    {
      title: "Xulosa",
      scenes: [
        {
          say: "Xulosa qilamiz. Mijoz so‘raydi, server javob beradi. So‘rovda metod, yo‘l, sarlavhalar va tana bor. GET oladi, POST yuboradi, parol esa faqat POST bilan ketadi. Holat kodi natijani aytadi: ikki yuz — muvaffaqiyat, to‘rt yuz to‘rt — topilmadi, besh yuz — server xatosi.",
          visual: {
            kind: "points",
            heading: "Esda tuting",
            items: [
              "Mijoz so‘raydi, server javob beradi",
              "Metod · yo‘l · sarlavhalar · tana",
              "GET oladi, POST yuboradi",
              "2xx · 3xx · 4xx · 5xx",
            ],
          },
        },
        {
          say: "Endi laboratoriyaga o‘ting: so‘rov va javobni qismlarga ajrating, metodni tanlang, serverga o‘zingiz so‘rov yuboring va Network panelini o‘rganing. Oxirida nazorat testidan o‘ting. Keyingi darsda esa HTTPS va shifrlashni ko‘ramiz. Omad!",
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
