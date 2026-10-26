import type { VideoLesson } from "./types";

// Video lesson for the cryptography basics lab, narrated in Uzbek.
export const CRYPTO_VIDEO: VideoLesson = {
  id: "crypto",
  title: "Kriptografiya asoslari",
  href: "/akademiya/crypto",
  chapters: [
    {
      title: "Kirish",
      scenes: [
        {
          say: "Assalomu alaykum! Cybervalue Akademiyasiga xush kelibsiz. Bugun kriptografiya asoslarini o‘rganamiz. Har kuni telefoningizda parol kiritasiz, xabar yuborasiz, bank ilovasini ochasiz. Bularning barchasini kriptografiya himoya qiladi.",
          visual: {
            kind: "title",
            title: "Kriptografiya asoslari",
            subtitle: "Kodlash, hash, shifr va raqamli imzo",
            icon: "lock",
          },
        },
        {
          say: "Bu darsda to‘rtta asosiy g‘oyani ajratib olamiz: kodlash, hash, shifrlash va raqamli imzo. Ular ko‘p chalkashtiriladi, lekin dars oxirida qaysi biri qachon ishlatilishini aniq bilib olasiz. Keling, eng boshidan, kompyuter matnni qanday ko‘rishidan boshlaymiz.",
          visual: {
            kind: "points",
            heading: "Bugun nimani o‘rganamiz",
            items: [
              "Matn — bu raqamlar",
              "Kodlash: Base64",
              "Hash — raqamli barmoq izi",
              "Tuz va lug‘at hujumi",
              "XOR va kalit uzunligi",
              "Raqamli imzo",
            ],
          },
        },
      ],
    },
    {
      title: "Matn — bu raqamlar",
      scenes: [
        {
          say: "Kompyuter harflarni bilmaydi. U faqat sonlarni, aniqrog‘i baytlarni biladi. Bir bayt — sakkizta bit, ya’ni sakkizta nol yoki bir. Bitta bayt noldan ikki yuz ellik beshgacha bo‘lgan sonni saqlaydi.",
          visual: { kind: "bytes", text: "Salom" },
        },
        {
          say: "Har bir harfga bitta son mos keladi. Masalan, katta A harfi oltmish besh soniga teng. Ikkilik ko‘rinishda bu nol, bir, va oltita nol, oxirida bir. Kriptografiyada baytlar ko‘pincha o‘n oltilik, ya’ni hex ko‘rinishida yoziladi: har bir bayt ikki belgi bilan.",
          visual: { kind: "bytes", text: "A" },
        },
        {
          say: "O‘zbek tilidagi tutuq belgisi, kirill harflari va emojilar esa bir nechta bayt oladi. Harflarni baytga aylantirish qoidasi UTF-8 deb ataladi. Shuning uchun “o‘” ikki belgidan iborat bo‘lsa ham, to‘rt bayt joy egallaydi.",
          visual: { kind: "bytes", text: "o‘" },
        },
        {
          say: "Bu xuddi Morze alifbosiga o‘xshaydi: harf o‘rniga nuqta va chiziqlar. Qoidani bilgan har bir kishi uni qaytadan o‘qiydi. Demak, matnni raqamga aylantirishda hech qanday sir yo‘q.",
          visual: {
            kind: "analogy",
            icon: "book",
            heading: "Morze alifbosi kabi",
            text: "Qoidani bilgan har kim qaytadan o‘qiydi — bu yerda sir yo‘q.",
          },
        },
      ],
    },
    {
      title: "Base64: kalitsiz qulf yo‘q",
      scenes: [
        {
          say: "Endi Base64 bilan tanishamiz. Base64 baytlarni faqat harflar, raqamlar va plyus, slesh, tenglik belgilari bilan yozadi. Uni elektron pochtadagi ilovalarda, sahifa ichidagi rasmlarda va tokenlarda ko‘rasiz.",
          visual: { kind: "base64", plain: "admin=false" },
        },
        {
          say: "Qoida oddiy: har uchta bayt to‘rtta Base64 belgisiga aylanadi. Oxirida tenglik belgisi ko‘rinsa, bu to‘ldiruvchi. U baytlar soni uchga bo‘linmaganda qo‘shiladi.",
          visual: { kind: "base64", plain: "Hi!" },
        },
        {
          say: "Eng muhimi: Base64 hech narsani yashirmaydi. Unda kalit yo‘q. Tasavvur qiling, sayt cookie ichida “admin teng false” degan qiymatni Base64 bilan saqlagan. Hujumchi uni ochadi, “true” deb o‘zgartiradi va qaytadan kodlaydi. Agar server bunga ishonsa, hujumchi administrator bo‘lib qoladi.",
          visual: {
            kind: "points",
            heading: "Base64 — shifr emas",
            items: [
              "Kalit yo‘q — har kim ochadi",
              "Cookie: admin=false → admin=true",
              "Server bunday qiymatga ishonmasligi kerak",
            ],
          },
        },
      ],
    },
    {
      title: "Kodlash, hash yoki shifr?",
      scenes: [
        {
          say: "Uchta tushunchani hozir ajratib olamiz. Farqi bitta savolda: natijani qaytadan ochish mumkinmi va buning uchun kalit kerakmi? Kodlash — bu tarjima. Lug‘at hammada bor, shuning uchun har kim ochadi. Base64, hex va URL kodlash shunday.",
          visual: { kind: "three" },
        },
        {
          say: "Hash — barmoq izi. Izdan odamni qayta yasab bo‘lmaydi, xuddi shunday hashdan matnni qaytarib bo‘lmaydi. Shifrlash esa seyf: uni faqat kalit egasi ochadi. AES va RSA — shifrlash algoritmlari.",
          visual: {
            kind: "points",
            heading: "Bitta savol: qaytadan ochiladimi?",
            items: [
              "Kodlash — ha, kalitsiz (Base64, hex)",
              "Hash — yo‘q, hech qachon (SHA-256, bcrypt)",
              "Shifr — ha, faqat kalit bilan (AES, RSA)",
            ],
          },
        },
      ],
    },
    {
      title: "Hash — raqamli barmoq izi",
      scenes: [
        {
          say: "Hash funksiyasi istalgan uzunlikdagi matndan qisqa va doim bir xil uzunlikdagi barmoq izini yasaydi. Masalan, SHA-256 natijasi har doim ikki yuz ellik olti bit, ya’ni oltmish to‘rtta hex belgi. Bitta so‘z bo‘ladimi, butun kitob bo‘ladimi — farqi yo‘q.",
          visual: { kind: "hash", a: "salom", b: "salom" },
        },
        {
          say: "Go‘sht maydalagichni tasavvur qiling. Go‘shtdan qiyma bo‘ladi, lekin qiymadan go‘sht qaytmaydi. Bir xil go‘sht esa doim bir xil qiyma beradi. Hash ham shunday: bir xil matn har doim bir xil hash beradi.",
          visual: {
            kind: "analogy",
            icon: "grinder",
            heading: "Go‘sht maydalagich",
            text: "Go‘shtdan qiyma bo‘ladi, qiymadan go‘sht qaytmaydi.",
          },
        },
        {
          say: "Endi qiziq tomoni. “salom” va katta harf bilan “Salom” so‘zlarini solishtiramiz. Faqat bitta harf farq qiladi, lekin hashlarning taxminan yarmi butunlay boshqacha bo‘lib ketadi. Buni ko‘chki effekti deyishadi. Shuning uchun hashga qarab matnni taxmin qilib bo‘lmaydi.",
          visual: { kind: "hash", a: "salom", b: "Salom" },
        },
      ],
    },
    {
      title: "Fayl o‘zgarmaganmi?",
      scenes: [
        {
          say: "Hash amalda qayerda ishlatiladi? Dastur yaratuvchilari rasmiy saytda fayl bilan birga uning SHA-256 hashini e’lon qiladi. Siz faylni qaysi oynadan yuklasangiz ham, uning hashini hisoblab, rasmiy hash bilan solishtirasiz.",
          visual: { kind: "mirrors" },
        },
        {
          say: "Bitta bayt, hatto ko‘rinmaydigan bo‘sh joy ham hashni butunlay o‘zgartiradi. Demak, hash mos kelsa, fayl bayt-baytigacha bir xil. Linuxda buning uchun sha256sum buyrug‘i, Windowsda esa certutil buyrug‘i bor. Faqat bir narsani unutmang: hashni doim rasmiy saytdan oling.",
          visual: {
            kind: "terminal",
            lines: [
              { cmd: "sha256sum installer.iso" },
              { out: "9f2c1a…e41b  installer.iso" },
            ],
          },
        },
      ],
    },
    {
      title: "Tuz: bir xil parol, har xil hash",
      scenes: [
        {
          say: "Yaxshi sayt parolingizni ochiq holda saqlamaydi. U parolning hashini saqlaydi. Siz kirganingizda kiritilgan parol yana hashlanadi va saqlangan hash bilan solishtiriladi. Lekin bir muammo bor: bir xil parollar bir xil hash beradi.",
          visual: { kind: "salt" },
        },
        {
          say: "Agar baza sizib chiqsa, hujumchi bir xil hashlarni darhol ko‘radi va bir xil parolli foydalanuvchilarni topadi. Buning yechimi — tuz. Tuz har bir foydalanuvchiga beriladigan tasodifiy qiymat. Server tuz va parolni birga hashlaydi, tuzni esa yonida ochiq saqlaydi.",
          visual: {
            kind: "analogy",
            icon: "doors",
            heading: "Har bir eshikka o‘z qulfi",
            text: "Bir xil kalitli eshiklarni bitta kalit ochadi. Tuz — har bir eshikka alohida qulf.",
          },
        },
      ],
    },
    {
      title: "Lug‘at hujumi",
      scenes: [
        {
          say: "Hashni ochib bo‘lmaydi, lekin uni taxmin qilish mumkin. Hujumchi mashhur parollar ro‘yxatini oladi, har birini birma-bir hashlaydi va natijani sizib chiqqan hash bilan solishtiradi. Mos kelsa — parol topildi. Bu lug‘at hujumi deyiladi.",
          visual: { kind: "dictionary" },
        },
        {
          say: "SHA-256 juda tez ishlaydi. Oddiy videokarta soniyasiga milliardlab taxminni sinaydi. Shuning uchun parollarni saqlashda ataylab sekin algoritmlar ishlatiladi: bcrypt, scrypt yoki Argon2. Lekin ro‘yxatda bor zaif parolni ular ham qutqara olmaydi. Eng yaxshi himoya — uzun va tasodifiy parol.",
          visual: {
            kind: "points",
            heading: "Himoya",
            items: [
              "Parollar uchun sekin algoritm: bcrypt, Argon2",
              "Har bir foydalanuvchiga o‘z tuzi",
              "Uzun, tasodifiy, ro‘yxatda yo‘q parol",
            ],
          },
        },
      ],
    },
    {
      title: "XOR: shifrlashning g‘ishti",
      scenes: [
        {
          say: "Endi shifrlashning ichiga kiramiz. Ko‘p shifrlar, jumladan AES ham, ichida XOR amalini ishlatadi. XOR ikki bitni solishtiradi: bitlar bir xil bo‘lsa nol, har xil bo‘lsa bir chiqadi.",
          visual: { kind: "xor", plain: 72, key: 42 },
        },
        {
          say: "Chiroq tugmasini tasavvur qiling. Kalit biti bir bo‘lsa, holat almashadi, nol bo‘lsa, tegmaydi. Ikki marta bossangiz, avvalgi holatga qaytasiz. Xuddi shunday, matnni kalit bilan XOR qilsak shifr hosil bo‘ladi, shifrni yana o‘sha kalit bilan XOR qilsak — asl matn qaytadi. Bitta kalit ham shifrlaydi, ham ochadi. Buni simmetrik shifrlash deyishadi.",
          visual: {
            kind: "analogy",
            icon: "switch",
            heading: "Chiroq tugmasi",
            text: "Kalit biti 1 — holat almashadi. Ikki marta bossangiz, joyiga qaytadi.",
          },
        },
      ],
    },
    {
      title: "Kalit qancha uzun bo‘lishi kerak?",
      scenes: [
        {
          say: "Yaxshi shifrni faqat bitta yo‘l bilan buzish mumkin: barcha kalitlarni birma-bir sinab chiqish. Har bir qo‘shimcha bit kalitlar sonini ikki baravar oshiradi. Qirq bitli kalit bir zumda topiladi. Ellik olti bitli eski DES shifri bir necha kunda buzilgan.",
          visual: { kind: "keylen" },
        },
        {
          say: "Bir yuz yigirma sakkiz bitli kalitni esa hozirgi kompyuterlar bilan topishning iloji yo‘q. Shuning uchun AES-128 va AES-256 xavfsiz hisoblanadi. Amalda zaiflik odatda kalit uzunligida emas, balki kalit qanday saqlanganida va parol qanchalik kuchli ekanida bo‘ladi.",
          visual: {
            kind: "analogy",
            icon: "key",
            heading: "Kodli qulf",
            text: "3 xonali kodni bir kechada topasiz, 30 xonalisiga butun umr yetmaydi.",
          },
        },
      ],
    },
    {
      title: "Raqamli imzo",
      scenes: [
        {
          say: "Oxirgi g‘oya — raqamli imzo. U ikki narsani isbotlaydi: xabarni kim yuborgani va xabar yo‘lda o‘zgarmagani. Imzo yopiq kalit bilan qo‘yiladi va ochiq kalit bilan tekshiriladi.",
          visual: { kind: "signature" },
        },
        {
          say: "Muhr va imzoni eslang. Muhrni faqat egasi bosadi, lekin uni har kim namunaga solishtirib tekshira oladi. Agar bank xabaridagi yuz so‘m to‘qqiz yuz so‘mga o‘zgartirilsa, imzo mos kelmay qoladi va soxtalik darhol bilinadi. HTTPS sertifikatlari, dastur yangilanishlari va elektron hujjatlar aynan shunday imzolanadi.",
          visual: {
            kind: "analogy",
            icon: "stamp",
            heading: "Muhr va imzo",
            text: "Muhrni faqat egasi bosadi, tekshirishni esa har kim qila oladi.",
          },
        },
      ],
    },
    {
      title: "Xulosa",
      scenes: [
        {
          say: "Keling, xulosa qilamiz. Kodlash — tarjima, uni har kim ochadi. Hash — barmoq izi, u qaytarilmaydi. Shifr — seyf, uni faqat kalit ochadi. Imzo — muhr, u kim yuborganini va xabar o‘zgarmaganini isbotlaydi.",
          visual: {
            kind: "points",
            heading: "Esda tuting",
            items: [
              "Kodlash — tarjima",
              "Hash — barmoq izi",
              "Shifr — seyf",
              "Imzo — muhr",
            ],
          },
        },
        {
          say: "Endi laboratoriyaga o‘ting va har bir g‘oyani o‘zingiz sinab ko‘ring: Base64 cookie yasang, hashni o‘zgartiring, lug‘at hujumini ishga tushiring va xabarni imzolang. Oxirida nazorat testidan o‘tsangiz, sertifikat olasiz. Omad!",
          visual: {
            kind: "title",
            title: "Endi amaliyot!",
            subtitle: "Laboratoriya · nazorat testi · sertifikat",
            icon: "check",
          },
        },
      ],
    },
  ],
};
