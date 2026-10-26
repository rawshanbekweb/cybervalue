import type { VideoLesson } from "./types";

// Video lesson for the cryptography basics lab, narrated in Uzbek: the story
// of a leaked game database, told with Kibi and 3D shots.
export const CRYPTO_VIDEO: VideoLesson = {
  id: "crypto",
  title: "Kriptografiya asoslari",
  href: "/akademiya/crypto",
  chapters: [
    {
      title: "Baza sizib chiqdi",
      scenes: [
        {
          say: "Ertalab Ali telefonini ochdi va yangilikni ko‘rdi: u har kuni o‘ynaydigan o‘yin saytini xakerlar buzibdi. Bir million o‘yinchining login va parollari internetga chiqib ketibdi. Alining paroli esa juda oddiy edi: qwerty bir ikki uch. Va u shu parolni pochtasida ham ishlatardi!",
          visual: { kind: "3d", shot: "vault", stage: 0 },
          host: { mood: "shock" },
          sfx: [
            { at: 0.2, name: "whoosh" },
            { at: 0.55, name: "alarm" },
          ],
        },
        {
          say: "Bu bazani Jasur yuklab olgan. Uning ekranida minglab qatorlar: ism, pochta va parol. Sayt parollarni ochiq holda saqlagan edi. Jasurga hech narsani buzish kerak emas — u shunchaki o‘qiydi. Endi u Alining pochtasiga ham kira oladi.",
          visual: { kind: "3d", shot: "vault", stage: 0 },
          host: { mood: "sad" },
          sfx: [
            { at: 0.3, name: "type" },
            { at: 0.8, name: "alarm" },
          ],
        },
        {
          say: "Salom, men Kibi! Bugun kriptografiya dunyosiga sayohat qilamiz. Kodlash, hash, tuz, shifr va raqamli imzo nima ekanini o‘rganamiz. Dars oxirida sayt parollarni qanday saqlashi kerakligini va Ali qayerda xato qilganini aniq bilib olasiz.",
          visual: {
            kind: "host",
            title: "Kriptografiya asoslari",
            subtitle: "Kodlash, hash, shifr va raqamli imzo",
            mood: "happy",
          },
          sfx: [{ at: 0.05, name: "magic" }],
        },
        {
          say: "Lekin boshlashdan oldin bitta oddiy savol: kompyuter “Salom” degan so‘zni qanday ko‘radi? Kriptografiyaning hammasi shu savoldan boshlanadi. Ketdik!",
          visual: { kind: "3d", shot: "kibi" },
          host: { mood: "happy", hide: true },
          sfx: [{ at: 0.1, name: "whoosh" }],
        },
      ],
    },
    {
      title: "Matn — bu raqamlar",
      scenes: [
        {
          say: "Kompyuter harflarni bilmaydi. U faqat sonlarni, aniqrog‘i baytlarni biladi. Bir bayt — sakkizta bit, ya’ni sakkizta nol yoki bir. Bitta bayt noldan ikki yuz ellik beshgacha bo‘lgan sonni saqlaydi. Qarang, “Salom” so‘zining har bir harfi bittadan kubga aylanyapti.",
          visual: { kind: "3d", shot: "bytes" },
          host: { mood: "think" },
          sfx: [
            { at: 0.2, name: "pop" },
            { at: 0.4, name: "pop" },
            { at: 0.6, name: "pop" },
          ],
        },
        {
          say: "Katta S harfi sakson uch soniga teng, kichik a — to‘qson yetti. Ikkilik ko‘rinishda bu nol va birlar qatori. Kriptografiyada baytlar ko‘pincha o‘n oltilik, ya’ni hex ko‘rinishida yoziladi: har bir bayt ikki belgi bilan. Sakson uch hexda besh uch bo‘ladi.",
          visual: { kind: "3d", shot: "bytes" },
          host: { mood: "talk" },
        },
        {
          say: "O‘zbek tilidagi tutuq belgisi, kirill harflari va emojilar esa bir nechta bayt oladi. Harflarni baytga aylantirish qoidasi UTF-8 deb ataladi. Bu xuddi Morze alifbosiga o‘xshaydi: qoidani bilgan har bir kishi uni qaytadan o‘qiydi. Demak, matnni songa aylantirishda hech qanday sir yo‘q.",
          visual: { kind: "bytes", text: "o‘" },
          host: { mood: "wink" },
        },
      ],
    },
    {
      title: "Base64 — niqob emas",
      scenes: [
        {
          say: "Endi Base64 bilan tanishamiz. Base64 baytlarni faqat harflar, raqamlar va plyus, slesh, tenglik belgilari bilan yozadi. Har uchta bayt to‘rtta belgiga aylanadi. Uni elektron pochtadagi ilovalarda, sahifa ichidagi rasmlarda va tokenlarda ko‘rasiz.",
          visual: { kind: "base64", plain: "admin=false" },
          host: { mood: "talk" },
        },
        {
          say: "O‘sha o‘yin saytida yana bir xato bor edi. Sayt brauzerdagi cookie ichida “admin teng false” degan yozuvni Base64 bilan saqlagan. Dasturchi o‘ylagan: bu g‘alati harflarni hech kim tushunmaydi. Jasur esa cookie’ni ko‘rdi va kulib qo‘ydi.",
          visual: { kind: "3d", shot: "cookie" },
          host: { mood: "think" },
          sfx: [{ at: 0.6, name: "pop" }],
        },
        {
          say: "U cookie’ni Base64’dan ochdi, false so‘zini true deb o‘zgartirdi va qaytadan kodladi. Sahifani yangiladi — va u endi administrator! Base64’da kalit yo‘q, uni har kim bir soniyada ochadi. Shuning uchun server foydalanuvchidan kelgan bunday qiymatga hech qachon ishonmasligi kerak.",
          visual: { kind: "3d", shot: "cookie" },
          host: { mood: "shock" },
          sfx: [
            { at: 0.3, name: "type" },
            { at: 0.75, name: "alarm" },
          ],
        },
      ],
    },
    {
      title: "Uch yo‘l: kodlash, hash, shifr",
      scenes: [
        {
          say: "Uchta tushunchani hozir ajratib olamiz. Farqi bitta savolda: natijani qaytadan ochish mumkinmi va buning uchun kalit kerakmi? Birinchi yo‘l — kodlash. Bu tarjima lug‘ati: lug‘at hammada bor, shuning uchun har kim ochadi. Base64, hex va URL kodlash shunday.",
          visual: { kind: "3d", shot: "trio", stage: 0 },
          host: { mood: "talk" },
          sfx: [{ at: 0.6, name: "pop" }],
        },
        {
          say: "Ikkinchi yo‘l — hash. Bu barmoq izi: izdan odamni qayta yasab bo‘lmaydi, xuddi shunday hashdan matnni qaytarib bo‘lmaydi. Uchinchi yo‘l — shifrlash. Bu seyf: uni faqat kalit egasi ochadi. AES va RSA — shifrlash algoritmlari.",
          visual: { kind: "3d", shot: "trio", stage: 1 },
          host: { mood: "happy" },
          sfx: [
            { at: 0.15, name: "pop" },
            { at: 0.6, name: "pop" },
          ],
        },
        {
          say: "Keling, tekshiramiz! Base64 bilan “kodlangan” parolni kim ocha oladi?",
          visual: {
            kind: "quiz",
            question: "Base64 bilan kodlangan parolni kim ocha oladi?",
            options: [
              "Faqat kalit egasi",
              "Hech kim — u qaytarilmaydi",
              "Istalgan odam, kalit kerak emas",
            ],
            answer: 2,
          },
          host: { mood: "think" },
          hold: 5,
        },
      ],
    },
    {
      title: "Hash — raqamli barmoq izi",
      scenes: [
        {
          say: "Mana bu — hash mashinasi. Unga istalgan uzunlikdagi matnni solasiz, u esa qisqa va doim bir xil uzunlikdagi barmoq izini chiqaradi. SHA-256 natijasi har doim oltmish to‘rtta hex belgi. Bitta so‘z bo‘ladimi, butun kitob bo‘ladimi — farqi yo‘q.",
          visual: { kind: "3d", shot: "grinder", stage: 0 },
          host: { mood: "talk" },
          sfx: [
            { at: 0.2, name: "whoosh" },
            { at: 0.7, name: "ding" },
          ],
        },
        {
          say: "Go‘sht maydalagichni tasavvur qiling. Go‘shtdan qiyma bo‘ladi, lekin qiymadan go‘sht qaytmaydi. Bir xil go‘sht esa doim bir xil qiyma beradi. Hash ham shunday: bir xil matn har doim bir xil hash beradi, lekin hashdan matnni qaytarib bo‘lmaydi.",
          visual: { kind: "3d", shot: "grinder", stage: 0 },
          host: { mood: "wink" },
        },
        {
          say: "Endi qiziq tomoni. Mashinaga “salom” va katta harf bilan “Salom” so‘zlarini solamiz. Faqat bitta harf farq qiladi, lekin chiqqan hashlar butunlay boshqacha! Bu ko‘chki effekti deyiladi. Shuning uchun hashga qarab matnni taxmin qilib bo‘lmaydi.",
          visual: { kind: "3d", shot: "grinder", stage: 1 },
          host: { mood: "shock" },
          sfx: [
            { at: 0.25, name: "whoosh" },
            { at: 0.55, name: "whoosh" },
            { at: 0.8, name: "ding" },
          ],
        },
      ],
    },
    {
      title: "Fayl o‘zgarmaganmi?",
      scenes: [
        {
          say: "Hash amalda qayerda ishlatiladi? Ali o‘yinning yangi versiyasini yuklamoqchi. Fayl uchta oynada bor. Dastur yaratuvchilari rasmiy saytda faylning SHA-256 hashini e’lon qilgan. Ali har bir faylning hashini hisoblab, rasmiy hash bilan solishtiradi.",
          visual: { kind: "3d", shot: "mirrors" },
          host: { mood: "think" },
          sfx: [{ at: 0.3, name: "whoosh" }],
        },
        {
          say: "Ikkita fayl to‘g‘ri chiqdi. Uchinchisining hashi esa butunlay boshqa! Demak, kimdir faylga virus qo‘shgan. Bitta bayt o‘zgarsa ham hash butunlay o‘zgaradi. Linuxda buning uchun sha256sum, Windowsda certutil buyrug‘i bor. Faqat unutmang: hashni doim rasmiy saytdan oling.",
          visual: { kind: "3d", shot: "mirrors" },
          host: { mood: "shock" },
          sfx: [
            { at: 0.15, name: "ding" },
            { at: 0.35, name: "alarm" },
          ],
        },
        {
          say: "Terminalda bu juda oddiy ko‘rinadi. sha256sum buyrug‘ini yozasiz va fayl nomini berasiz. Natija — oltmish to‘rt belgili hash va fayl nomi. Uni rasmiy sahifadagi hash bilan belgima-belgi solishtiring. Bitta belgi farq qilsa ham, faylni ochmang.",
          visual: {
            kind: "terminal",
            lines: [
              { cmd: "sha256sum oyin-setup.exe" },
              { out: "9f2c1a…e41b  oyin-setup.exe" },
            ],
          },
          host: { mood: "talk" },
          sfx: [{ at: 0.1, name: "type" }],
        },
      ],
    },
    {
      title: "Parollar bazasi va tuz",
      scenes: [
        {
          say: "Endi o‘yin saytiga qaytamiz. Yaxshi sayt parolni ochiq saqlamaydi, u parolning hashini saqlaydi. Siz kirganingizda kiritgan parolingiz yana hashlanadi va saqlangan hash bilan solishtiriladi. Agar baza sizib chiqsa, Jasur faqat hashlarni ko‘radi.",
          visual: { kind: "3d", shot: "vault", stage: 1 },
          host: { mood: "happy" },
          sfx: [{ at: 0.4, name: "magic" }],
        },
        {
          say: "Lekin qarang: ikki qator qizarib ketdi. Ali va Dilnozaning hashlari bir xil! Demak, ularning paroli ham bir xil. Bir xil parol doim bir xil hash beradi. Jasur bitta parolni topsa, shu parolli hammani birdan topadi.",
          visual: { kind: "3d", shot: "vault", stage: 1 },
          host: { mood: "shock" },
          sfx: [{ at: 0.3, name: "alarm" }],
        },
        {
          say: "Buning yechimi — tuz. Tuz har bir foydalanuvchiga beriladigan tasodifiy qiymat. Server tuz va parolni birga hashlaydi, tuzni esa yonida ochiq saqlaydi. Endi bir xil parollar ham butunlay boshqa hash beradi. Bu xuddi har bir eshikka alohida qulf qo‘yishga o‘xshaydi.",
          visual: { kind: "3d", shot: "vault", stage: 2 },
          host: { mood: "happy" },
          sfx: [
            { at: 0.3, name: "magic" },
            { at: 0.7, name: "ding" },
          ],
        },
      ],
    },
    {
      title: "Lug‘at hujumi",
      scenes: [
        {
          say: "Hashni ochib bo‘lmaydi, lekin uni taxmin qilish mumkin. Jasur mashhur parollar ro‘yxatini oladi: bir ikki uch to‘rt, qwerty, parol, salom. Har birini hashlaydi va bazadagi hash bilan solishtiradi. Mos kelsa — parol topildi. Bu lug‘at hujumi deyiladi.",
          visual: { kind: "3d", shot: "wordlist" },
          host: { mood: "think" },
          sfx: [
            { at: 0.3, name: "type" },
            { at: 0.82, name: "alarm" },
          ],
        },
        {
          say: "Qarang, ro‘yxat aylanmoqda… va qwerty bir ikki uch topildi! Alining paroli bir soniya ham chidamadi. SHA-256 juda tez ishlaydi: oddiy videokarta soniyasiga milliardlab taxminni sinaydi. Ro‘yxatda bor parolni hech qanday hash qutqara olmaydi.",
          visual: { kind: "3d", shot: "wordlist" },
          host: { mood: "sad" },
          sfx: [{ at: 0.5, name: "alarm" }],
        },
        {
          say: "Shuning uchun parollarni saqlashda ataylab sekin algoritmlar ishlatiladi: bcrypt, scrypt yoki Argon2. Ular bitta taxminni minglab marta sekinlashtiradi. Siz uchun esa eng yaxshi himoya — uzun va tasodifiy parol, har bir saytga alohida. Parol menejeri buni osonlashtiradi.",
          visual: {
            kind: "points",
            heading: "Himoya",
            items: [
              "Parollar uchun sekin algoritm: bcrypt, Argon2",
              "Har bir foydalanuvchiga o‘z tuzi",
              "Uzun, tasodifiy, har saytga alohida parol",
              "Parol menejeri",
            ],
          },
          host: { mood: "talk" },
        },
        {
          say: "Savol! Ikki foydalanuvchining paroli bir xil. Tuz ishlatilgan bo‘lsa, ularning hashlari qanday bo‘ladi?",
          visual: {
            kind: "quiz",
            question:
              "Tuz ishlatilsa, bir xil parollarning hashlari qanday bo‘ladi?",
            options: ["Bir xil", "Har xil", "Hash umuman hosil bo‘lmaydi"],
            answer: 1,
          },
          host: { mood: "think" },
          hold: 5,
        },
      ],
    },
    {
      title: "Shifrlash: Sezardan XORgacha",
      scenes: [
        {
          say: "Endi seyf, ya’ni shifrlash haqida gaplashamiz. Ikki ming yil oldin Yuliy Sezar xatlarini shunday shifrlagan: har bir harfni alifboda uchta oldinga suradi. A harfi D bo‘ladi, B esa E. Bu yerda uch soni — kalit. Kalitni bilgan odam harflarni ortga surib, xatni o‘qiydi.",
          visual: { kind: "3d", shot: "caesar" },
          host: { mood: "talk" },
          sfx: [{ at: 0.3, name: "whoosh" }],
        },
        {
          say: "Lekin Sezar shifrida faqat yigirma beshta kalit bor. Jasur hammasini bir daqiqada sinab chiqadi. Zamonaviy shifrlar ancha murakkab, lekin ularning ichida ham oddiy g‘isht bor. Bu g‘isht — XOR amali. U ikki bitni solishtiradi: bitlar bir xil bo‘lsa nol, har xil bo‘lsa bir chiqadi.",
          visual: { kind: "3d", shot: "xor" },
          host: { mood: "think" },
          sfx: [{ at: 0.6, name: "pop" }],
        },
        {
          say: "Chiroq tugmalarini tasavvur qiling. Kalit biti bir bo‘lsa, chiroq holati almashadi, nol bo‘lsa, tegmaydi. Matnni kalit bilan XOR qilsak, shifr hosil bo‘ladi. Shifrni yana o‘sha kalit bilan XOR qilsak — asl matn qaytadi! Bitta kalit ham yopadi, ham ochadi. Buni simmetrik shifrlash deyishadi.",
          visual: { kind: "3d", shot: "xor" },
          host: { mood: "happy" },
          sfx: [
            { at: 0.35, name: "pop" },
            { at: 0.75, name: "magic" },
          ],
        },
      ],
    },
    {
      title: "Kalit qancha uzun bo‘lishi kerak?",
      scenes: [
        {
          say: "Yaxshi shifrni faqat bitta yo‘l bilan buzish mumkin: barcha kalitlarni birma-bir sinab chiqish. Bu kodli qulfga o‘xshaydi. Uch xonali kodni bir kechada topasiz. Har bir qo‘shimcha bit esa kalitlar sonini ikki baravar oshiradi.",
          visual: { kind: "3d", shot: "combo" },
          host: { mood: "think" },
          sfx: [{ at: 0.3, name: "type" }],
        },
        {
          say: "Qirq bitli kalit bir zumda topiladi. Ellik olti bitli eski DES shifrini bir necha kunda buzishgan. Bir yuz yigirma sakkiz bitli kalitni esa barcha kompyuterlar birga ishlasa ham koinot yoshidan ko‘proq vaqt kerak. Shuning uchun AES-128 va AES-256 xavfsiz hisoblanadi.",
          visual: { kind: "3d", shot: "combo" },
          host: { mood: "happy" },
          sfx: [{ at: 0.7, name: "ding" }],
        },
        {
          say: "Amalda zaiflik odatda kalit uzunligida emas, balki kalit qayerda saqlanganida bo‘ladi. Kalitni dastur kodiga yozib qo‘yish yoki parolni “qwerty bir ikki uch” qilish — eng kuchli qulfga kalitni eshik oldida qoldirishdek gap.",
          visual: { kind: "3d", shot: "combo" },
          host: { mood: "wink" },
        },
      ],
    },
    {
      title: "Raqamli imzo",
      scenes: [
        {
          say: "Oxirgi g‘oya — raqamli imzo. O‘yin sayti Aliga xat yubordi: “Parolingizni almashtiring”. Lekin bu xatni haqiqatan sayt yubordimi yoki Jasur? Raqamli imzo ikki narsani isbotlaydi: xabarni kim yuborgani va xabar yo‘lda o‘zgarmagani.",
          visual: { kind: "3d", shot: "stamp", stage: 0 },
          host: { mood: "think" },
          sfx: [{ at: 0.2, name: "whoosh" }],
        },
        {
          say: "Sayt xatning hashini oladi va uni o‘zining yopiq kaliti bilan imzolaydi. Bu xuddi muhr bosishga o‘xshaydi: muhrni faqat egasi bosadi. Ali esa saytning ochiq kaliti bilan imzoni tekshiradi. Muhr mos keldi — xat haqiqiy!",
          visual: { kind: "3d", shot: "stamp", stage: 0 },
          host: { mood: "happy" },
          sfx: [
            { at: 0.45, name: "pop" },
            { at: 0.85, name: "ding" },
          ],
        },
        {
          say: "Endi Jasur xatni yo‘lda tutib oldi va havolani o‘zining soxta saytiga almashtirdi. Lekin xat o‘zgargani uchun uning hashi ham o‘zgardi va imzo mos kelmay qoldi. Muhr qizarib ketdi — soxtalik darhol bilindi! HTTPS sertifikatlari va dastur yangilanishlari aynan shunday imzolanadi.",
          visual: { kind: "3d", shot: "stamp", stage: 1 },
          host: { mood: "shock" },
          sfx: [
            { at: 0.3, name: "type" },
            { at: 0.7, name: "alarm" },
          ],
        },
        {
          say: "Oxirgi savol! Raqamli imzo qaysi kalit bilan qo‘yiladi?",
          visual: {
            kind: "quiz",
            question: "Raqamli imzo qaysi kalit bilan qo‘yiladi?",
            options: [
              "Yuboruvchining yopiq kaliti",
              "Qabul qiluvchining ochiq kaliti",
              "Base64 bilan",
            ],
            answer: 0,
          },
          host: { mood: "think" },
          hold: 5,
        },
      ],
    },
    {
      title: "Xulosa",
      scenes: [
        {
          say: "Ali o‘sha kuni barcha parollarini almashtirdi. Endi uning har bir saytda alohida, uzun parol bor, ularni parol menejeri saqlaydi. O‘yin sayti esa parollarni tuz va bcrypt bilan saqlashni boshladi. Jasurning keyingi urinishi hech narsa bermadi.",
          visual: { kind: "3d", shot: "vault", stage: 2 },
          host: { mood: "happy" },
          sfx: [{ at: 0.6, name: "ding" }],
        },
        {
          say: "Keling, xulosa qilamiz. Kodlash — tarjima, uni har kim ochadi. Hash — barmoq izi, u qaytarilmaydi. Tuz bir xil parollarni har xil qiladi. Shifr — seyf, uni faqat kalit ochadi. Imzo — muhr, u kim yuborganini va xabar o‘zgarmaganini isbotlaydi.",
          visual: {
            kind: "points",
            heading: "Esda tuting",
            items: [
              "Kodlash — tarjima",
              "Hash — barmoq izi",
              "Tuz — har kimga o‘z qulfi",
              "Shifr — seyf",
              "Imzo — muhr",
            ],
          },
          host: { mood: "talk" },
        },
        {
          say: "Endi laboratoriyaga o‘ting va har bir g‘oyani o‘zingiz sinab ko‘ring: Base64 cookie yasang, hashni o‘zgartiring, lug‘at hujumini ishga tushiring va xabarni imzolang. Oxirida nazorat testidan o‘tsangiz, sertifikat olasiz. Men sizni kutaman. Omad!",
          visual: {
            kind: "host",
            title: "Endi amaliyot!",
            subtitle: "Laboratoriya · nazorat testi · sertifikat",
            mood: "wink",
          },
          host: { hide: true },
          sfx: [{ at: 0.1, name: "magic" }],
        },
      ],
    },
  ],
};
