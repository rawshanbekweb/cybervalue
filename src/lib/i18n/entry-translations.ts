// Translations for CMS-authored entries, keyed by slug. The database holds the
// source text (English, apart from one Uzbek title). A translation is shown only
// while the entry is unchanged since TRANSLATED_AT, so an edit made later in the
// CMS is never hidden behind stale text; see lib/i18n/entries.ts.
// Uzbek copy is machine-assisted and awaits review by a native speaker.
import type { Locale } from ".";

export const TRANSLATED_AT = Date.parse("2026-10-02T23:59:59Z");

export type EntryTranslation = {
  title?: string;
  summary?: string;
  body?: string;
  project?: Partial<
    Record<
      | "problem"
      | "objective"
      | "architecture"
      | "securityConsiderations"
      | "challenges"
      | "solution"
      | "result"
      | "lessonsLearned"
      | "projectStatus",
      string
    >
  >;
  lab?: Partial<
    Record<
      | "objective"
      | "methodology"
      | "discovery"
      | "analysis"
      | "impact"
      | "remediation"
      | "lessonsLearned"
      | "environment",
      string
    >
  >;
};

export const entryTranslations: Record<
  string,
  Partial<Record<Locale, EntryTranslation>>
> = {
  "cybervalue-platformasi": {
    uz: {
      title: "CyberValue: portfel va o‘quv platformasi",
      summary:
        "Loyihalar, laboratoriya qo‘llanmalari, maqolalar va yuklab olinadigan resurslarni yagona kontent boshqaruv panelidan e’lon qiluvchi platforma.",
      body: `CyberValue dasturiy ta’minot ishlab chiqish va kiberxavfsizlik bo‘yicha ishlarni hujjatlashtiradi hamda amaliy o‘quv materiallarini taqdim etadi. Ushbu sharh repozitoriyda amalga oshirilgan imkoniyatlarni tavsiflaydi.

## Platforma bilan tanishing

“Loyihalar” bo‘limida loyiha tahlillari, “Laboratoriyalar”da nazoratli mashqlar, “Tadqiqotlar”da texnik maqolalar joylashgan. “Resurslar” alohida resurs sahifalari orqali yuklab olinadigan materiallarni taqdim etadi. [Amaliyot](/playground) bo‘limi brauzerda bajariladigan amaliy mashqlarni beradi.`,
      project: {
        problem:
          "Loyiha tavsiflari, o‘quv tajribalari va fayllar turli vositalarga tarqalib ketganda, ularni topish va yangilab turish qiyinlashadi.",
        objective:
          "Kontentni har bir tur uchun mos maydonlar bilan saqlash, qidirish va boshqarish hamda ommaviy sahifalarda faqat e’lon qilingan yozuvlarni ko‘rsatish.",
        architecture:
          "Sahifalarni Next.js App Router taqdim etadi. PostgreSQL va Prisma umumiy Content yozuvini Project, Lab, ResearchArticle, CTFEvent va Resource tafsilotlari bilan bog‘laydi. Kiritilgan ma’lumotlarni Zod tekshiradi.",
        securityConsiderations:
          "Admin kirishi parol va ma’lumotlar bazasida saqlanadigan sessiyalarga tayanadi. Markdown tozalanadi. Fayl va rasm yo‘llari tekshiriladi, ommaviy yuklab olishlarda e’lon holati hisobga olinadi. Bu choralar mustaqil xavfsizlik auditi o‘rnini bosmaydi.",
        challenges:
          "Turli kontent turlari, fayl havolalari va e’lon holatlariga yagona qoidalarni qo‘llash, shu bilan birga yuklangan fayllarning joylashtirishlar orasida saqlanib qolishini ta’minlash.",
        solution:
          "Admin paneli va CLI umumiy tekshiruv hamda tranzaksiyali yozuvlardan foydalanadi. Admin interfeysi orqali yuklangan fayllar PostgreSQLda saqlanadi.",
        result:
          "Amalga oshirilgan tizim kontentni yaratish, tahrirlash, e’lon qilish, arxivlash va qidirishni, shuningdek fayllarni boshqarishni qo‘llab-quvvatlaydi. Foydalanuvchilar soni yoki tijoriy ko‘rsatkichlar haqida da’vo qilinmaydi.",
        lessonsLearned:
          "E’lon holatini arxiv sahifalarida emas, tafsilot sahifalari, qidiruv natijalari va yuklab olishlarda ham tekshirish kerak. Keshlangan sahifalar uchun ham aniq yangilash strategiyasi zarur.",
        projectStatus: "Ishlaydigan ilova; faol rivojlantirilmoqda",
      },
    },
    en: {},
  },
  "html-basics-va-baholash": {
    uz: {
      title: "HTML asoslari: amaliyotdan baholashgacha",
      summary:
        "Brauzerda HTML yozish va ko‘rib chiqish uchun o‘quv moduli; so‘ngra o‘qituvchi bergan kod bilan kiriladigan vaqt chegaralangan amaliy baholash.",
      body: `[HTML asoslari](/playground/html-basics) hujjat tuzilmasi, sarlavhalar, havolalar va boshqa asoslarni amaliy mashqlar orqali o‘rgatadi. O‘quvchilar boshlang‘ich kodni tahrirlaydi va natijani ko‘rib chiqish oynasida tekshiradi.

## Ikki xil o‘quv jarayoni

Oddiy darslar erkin mashq qilish imkonini beradi. [Baholash](/playground/html-basics/assessment) esa o‘qituvchi bergan kod bilan boshlanadigan, server tomonida belgilangan muddatga ega alohida urinishdir.`,
      project: {
        problem:
          "Tayyor HTML namunasini o‘qish o‘quvchi sahifani mustaqil yarata olishini ko‘rsatmaydi.",
        objective:
          "Mashq, ko‘rib chiqish va fikr-mulohazani birlashtirish, so‘ng topshirilgan kodni ham, uning ortidagi mulohazani ham baholash.",
        architecture:
          "Interaktiv mashqlar React komponentlarida ishlaydi. Baholash API urinishlar va muddatlarni PostgreSQLda saqlaydi. Server topshirilgan HTML tuzilmasini parse5 yordamida tahlil qiladi.",
        securityConsiderations:
          "Kirish kodlari xesh ko‘rinishida saqlanadi. Faol urinishni HttpOnly cookie aniqlaydi. Bajariladigan skriptlar va ruxsat etilmagan resurslar baholash qoidalarini buzadi. Brauzerdagi faollik signallari tashqi yordamni ishonchli aniqlay olmaydi.",
        challenges:
          "Brauzer soatiga tayanmaslik, bir vaqtda bir nechta urinish yaratilishining oldini olish va bir necha oynadan kelgan qarama-qarshi tahrirlarni hal qilish.",
        solution:
          "Muddatni server belgilaydi, kirish kodlari atomar sarflanadi va saqlash tahrirlari tekshiriladi. Savollar 30 ball, amaliy mezonlar 60 ball, o‘qituvchi ko‘rib chiqadigan izohlar 10 ball beradi.",
        result:
          "Tizim shaxsiy kirish kodlari, avtomatik saqlash, HTML tekshiruvlari, o‘qituvchi tomonidan ko‘rib chiqish va CSV eksportini o‘z ichiga oladi. Ta’lim natijalari bo‘yicha statistik tadqiqot da’vo qilinmaydi.",
        lessonsLearned:
          "Avtomatik tekshiruvlar tuzilmani baholay oladi, lekin ma’no va qaror sabablarini baholash hamon o‘qituvchi mulohazasini talab qiladi.",
        projectStatus: "Ishlaydigan ilova; faol rivojlantirilmoqda",
      },
    },
    en: {},
  },
  "web-security-lab": {
    uz: {
      title: "Veb-xavfsizlik laboratoriyasi: so‘rovlardan himoyagacha",
      summary:
        "HTTP, autentifikatsiya, ma’lumotlar bazalari va xavfsizlik zaifliklarini 36 ta dars orqali o‘rganadigan interaktiv o‘quv laboratoriyasi.",
      body: `[Veb-xavfsizlik laboratoriyasi](/playground/web-security-lab) brauzer → server → ma’lumotlar bazasi yo‘lini kuzatadi. Darslar nazariya, topshiriqlar va tushuntirishlarni birlashtiradi.

## O‘quv muhiti

SQL misollari uchta sintetik foydalanuvchidan iborat SQLite bazasida bajariladi va har bir chaqiruv uchun qayta yaratiladi. Bu ma’lumotlar portfel va admin paneli ishlatadigan PostgreSQL bazasidan alohida. Zaif va xavfsiz rejimlar xatti-harakatni shu o‘quv muhiti doirasida ko‘rsatadi.`,
      project: {
        problem:
          "Ta’riflarning o‘zi server HTTP yoki xavfsizlik qarorini aynan qayerda qabul qilishini yashirib qo‘yishi mumkin.",
        objective:
          "So‘rov va javoblarni kuzatish, autentifikatsiyani avtorizatsiyadan ajratish hamda zaif va himoyalangan so‘rovlarni qayta ishlashni solishtirish.",
        architecture:
          "Darslarni React interfeysi taqdim etadi. /api/lab ostidagi Next.js marshrutlari so‘rovlarni qayta ishlaydi. SQL darslari vaqtinchalik xotiradagi bazani ochish uchun node:sqlite dan foydalanadi.",
        securityConsiderations:
          "Sintetik hisoblar va ataylab zaif rejimlar o‘qitish uchun mavjud. Ularni haqiqiy foydalanuvchi ma’lumotlari bilan ishlaydigan xizmatda qayta ishlatmaslik kerak.",
        challenges:
          "Haqiqiy HTTP javoblarini ko‘rsatish, shu bilan birga tajribalarni asl kontent bazasidan ajratib turish.",
        solution:
          "Har bir SQL so‘rovi yangi xotiradagi bazani ochadi va yopadi. API o‘quv javoblariga no-store sarlavhasini qo‘shadi. Xavfsiz va zaif rejimlar o‘quvchiga avtorizatsiya xatti-harakatini solishtirish imkonini beradi.",
        result:
          "Tizim 36 ta dars, so‘rov mashqlari, SQL, IDOR va XSS mavzulari hamda takrorlash savollarini o‘z ichiga oladi. Loyiha tashqi tizimda zaiflik topilganini da’vo qilmaydi.",
        lessonsLearned:
          "Yaxshi mashq natijani shunchaki kuzatish emas, balki qaysi server tomonidagi tekshiruv natijani o‘zgartirganini tushuntirishni so‘raydi.",
        projectStatus: "Ishlaydigan ilova; faol rivojlantirilmoqda",
      },
    },
    en: {},
  },
  "sql-parametrli-sorov-laboratoriyasi": {
    uz: {
      title: "SQL laboratoriyasi: qatorlarni birlashtirish va parametrli so‘rovlar",
      summary:
        "O‘quv laboratoriyasi ichida SQL matniga qo‘shilgan qiymatlarni bog‘langan parametrlar bilan solishtirish bo‘yicha amaliy qo‘llanma.",
      body: `Ushbu qo‘llanma CyberValue ichidagi SQL darsiga hamroh bo‘ladi. Undagi xulosalar endpoint amalga oshirilishidan kutiladigan xatti-harakatni tavsiflaydi.

SQL darsini [Veb-xavfsizlik laboratoriyasi](/playground/web-security-lab)da oching. Har bir urinish uchun rejimni, kiritilgan qiymatni va qaytarilgan qatorlar sonini yonma-yon yozib boring.`,
      lab: {
        objective:
          "Foydalanuvchi kiritgan qiymat SQL buyrug‘i matnidan qachon alohida saqlanishini tushuntiring.",
        methodology: `1. Oddiy ali qiymatini ikkala rejimda yuboring.
2. Dars interfeysidagi sinov kiritmasini avval zaif, so‘ng xavfsiz rejimda sinab ko‘ring.
3. query, parameters va count maydonlarini solishtiring.
4. Farqni so‘rov tuzilmasi nuqtai nazaridan tushuntiring.`,
        discovery:
          "Zaif endpoint tarmog‘i foydalanuvchi nomini SQL qatoriga qo‘shadi. Xavfsiz tarmoq WHERE username = ? ni tayyorlaydi va qiymatni alohida bog‘laydi.",
        analysis:
          "Birinchi yondashuvda kiritilgan belgilar so‘rov sintaksisiga ta’sir qilishi mumkin. Ikkinchisida xuddi shu kiritma yagona parametr qiymati sifatida qaraladi. Xotiradagi baza har bir chaqiruv uchun qayta yaratiladi.",
        impact:
          "Mashq doirasida noto‘g‘ri filtrlash sintetik jadvaldan kerakli miqdordan ko‘proq qator qaytarishi mumkin. Bu mashq haqiqiy tizimga ta’sirni o‘lchamaydi.",
        remediation:
          "Qiymatlarni so‘rov parametrlari orqali uzating. Foydalanuvchi matnini jadval yoki ustun nomlari kabi dinamik SQL identifikatorlariga to‘g‘ridan-to‘g‘ri qo‘shmang; kerak bo‘lsa, oldindan belgilangan ruxsat etilgan variantlardan tanlang.",
        lessonsLearned:
          "Himoyalangan rejimning xuddi shu kiritmaga javobini zaif natija yonida yozib qo‘ying.",
        environment: "CyberValue veb-xavfsizlik laboratoriyasi; sintetik ma’lumotlar",
      },
    },
    en: {},
  },
  "idor-ruxsat-tekshiruvi": {
    uz: {
      title: "IDOR laboratoriyasi: foydalanuvchi ID’lari va obyekt darajasidagi avtorizatsiya",
      summary:
        "O‘quv laboratoriyasida o‘z profilingizga va boshqa sintetik foydalanuvchi profiliga kirishni solishtirib, obyekt darajasidagi avtorizatsiyani tushuning.",
      body: `Ushbu mashq faqat [Veb-xavfsizlik laboratoriyasi](/playground/web-security-lab) ichidagi sintetik hisoblardan foydalanadi. U resurs ID’sini bilish uni o‘qishga ruxsat bermasligini ko‘rsatadi.

Amalga oshirilgan qoida oddiy: xavfsiz rejimda foydalanuvchi so‘ralgan yozuvga egalik qilishi yoki admin roliga ega bo‘lishi kerak.`,
      lab: {
        objective:
          "Tizimga kirishni muayyan profilni o‘qishga ruxsatga ega bo‘lishdan farqlang.",
        methodology: `1. Laboratoriyada ko‘rsatilgan oddiy foydalanuvchi hisobi bilan kiring.
2. Xavfsiz rejimda o‘z profilingizni so‘rang.
3. Xavfsiz rejimda ikkinchi sintetik foydalanuvchining ID’sini so‘rang.
4. Xuddi shu ID’ni zaif rejimda solishtiring.
5. HTTP holatini va authorization_checked maydonini yozib oling.`,
        discovery:
          "Xavfsiz tarmoq maqsad ID’ni sessiya foydalanuvchisi ID’si bilan solishtiradi va admin rolini tekshiradi. Zaif rejim aynan shu tekshiruvni o‘tkazib yuboradi.",
        analysis:
          "Oddiy foydalanuvchi xavfsiz rejimda boshqa foydalanuvchi ID’sini so‘rasa, kod 403 qaytaradi. Zaif rejim mavjud sintetik profilni qaytarishi mumkin. Ikkala tarmoq ham foydalanuvchining tizimga kirgan bo‘lishini talab qiladi.",
        impact:
          "Mashq boshqa sintetik foydalanuvchi profiliga kirish orqali yetishmayotgan avtorizatsiyani ko‘rsatadi. U tashqi xizmatlar yoki haqiqiy hisoblarni sinamaydi.",
        remediation:
          "Har bir resurs amalidan oldin serverda egalikni yoki tegishli ruxsatni tekshiring. Frontend tugmasini yashirish bu tekshiruv o‘rnini bosmaydi.",
        lessonsLearned:
          "Avtorizatsiya testlari kamida uchta holatni qamrab olishi kerak: foydalanuvchining o‘z resursi, boshqa foydalanuvchining resursi va autentifikatsiyasiz so‘rov.",
        environment: "CyberValue veb-xavfsizlik laboratoriyasi; sintetik ma’lumotlar",
      },
    },
    en: {},
  },
  "semantik-html-tuzilmasi": {
    uz: {
      title: "Semantik HTML: ma’noni yetkazadigan tuzilma",
      summary:
        "header, nav, main va footer elementlarini vazifasiga ko‘ra tanlash va HTML asoslarida hujjat tuzilmasini ko‘rib chiqish bo‘yicha qisqa qo‘llanma.",
      body: `## Asosiy g‘oya

HTML elementlarini kontentdagi vazifasiga ko‘ra tanlang. Asosiy kontent uchun main, asosiy navigatsiya uchun nav, mustaqil maqola uchun article ishlating. Sarlavhalar bo‘limlar orasidagi bog‘liqlikni bildiradi.

## Amaliyot

HTML asoslarida sahifa sarlavhasi, navigatsiya, asosiy dars mazmuni va pastda muallif izohi bo‘lgan qisqa dars sahifasini yarating. So‘ng vizual bezakni chetga qo‘yib, elementlar tartibi mazmunni hamon aniq yetkazayotganini tekshiring.

## Takrorlash savollari

- Asosiy kontentni topish osonmi?
- Har bir havola matni uning manzilini tushuntiradimi?
- Bo‘lim sarlavhalari mazmunini ifodalaydimi?

Bu kirish xarakteridagi o‘quv eslatmasi, to‘liq qulaylik auditi emas.

## Manba

[MDN: Hujjatlarni tuzish](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Structuring_content/Structuring_documents).`,
    },
    en: {},
  },
  "autentifikatsiya-va-avtorizatsiya": {
    uz: {
      title: "Autentifikatsiya va avtorizatsiya: ikki alohida savol",
      summary:
        "Foydalanuvchini aniqlash bilan muayyan resursga kirishni tekshirish o‘rtasidagi farqni profil so‘rovi orqali tushuning.",
      body: `## Foydalanuvchini aniqlash

Autentifikatsiya so‘rovni kim yuborayotganini aniqlaydi. Avtorizatsiya esa bu foydalanuvchi so‘ralgan amalni bajara olishini belgilaydi. Muvaffaqiyatli kirish har bir resursga ruxsat berilishini anglatmaydi.

## CyberValue misoli

O‘rnatilgan laboratoriyada oddiy foydalanuvchi o‘z profilini ocha oladi. Boshqa sintetik foydalanuvchi ID’si so‘ralganda, xavfsiz rejim egalikni yoki admin rolini tekshiradi. Bu holatlarni solishtirish uchun IDOR qo‘llanmasidan foydalaning.

## Takrorlash savollari

- So‘ralgan identifikatorga kim egalik qiladi?
- Amal o‘qishmi, yangilashmi yoki o‘chirishmi?
- Server har bir so‘rov uchun ruxsatni tekshiradimi?
- Aniq ruxsat bo‘lmasa, kirish rad etiladimi?

## Manba

[OWASP: Authorization Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html).`,
    },
    en: {},
  },
  "sql-kod-va-malumot": {
    uz: {
      title: "SQL xavfsizligi: buyruqlarni ma’lumotdan ajratib saqlash",
      summary:
        "CyberValue’ning SQL o‘quv laboratoriyasidagi ikki kod yo‘li yordamida parametrli so‘rovlar bilan tanishtirish.",
      body: `## Muammo qayerdan boshlanadi

Foydalanuvchi matnini SQL buyrug‘iga qo‘shish ma’lumot bilan ko‘rsatma o‘rtasidagi chegarani xiralashtirishi mumkin. Parametrli so‘rovlar qiymatlarni so‘rov tuzilmasidan alohida saqlaydi.

## Amalga oshirishdan misol

CyberValue laboratoriyasida xavfsiz rejim WHERE username = ? ni tayyorlaydi va foydalanuvchi nomini alohida uzatadi. Zaif rejim qiymatni SQL qatoriga qo‘shadi. Har bir chaqiruv faqat vaqtinchalik sintetik jadvalda ishlaydi.

## Qamrov va cheklovlar

Parametrlar odatda qiymatlarni ifodalaydi. Dinamik jadval yoki ustun nomlari oldindan belgilangan ruxsat etilgan variantlardan olinishi kerak bo‘lishi mumkin. Parametrli so‘rovlar foydalanuvchining obyektga kirish ruxsatini tekshirishni almashtirmaydi.

## Amaliyot

SQL qo‘llanmasidagi kuzatuv jadvalini to‘ldiring: rejim, kiritma, parametrlar va qaytarilgan qatorlar soni. Farq sababini ikki gapda tushuntiring.

## Manba

[OWASP: SQL Injection Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html).`,
    },
    en: {},
  },
  "html-tekshiruv-royxati": {
    uz: {
      title: "HTML sahifani tekshirish ro‘yxati",
      summary:
        "HTML mashqini topshirishdan oldin hujjat tuzilmasi, matn va navigatsiyani tekshirish uchun yuklab olinadigan Markdown ro‘yxati.",
      body: `## Ushbu resurs haqida

HTML mashqini topshirishdan oldin hujjat tuzilmasi, matn va navigatsiyani tekshirish uchun yuklab olinadigan Markdown ro‘yxati.

Fayl UTF-8 formatidagi Markdown hujjati. Izoh qoldirish yoki chop etish uchun uni matn muharririda oching.

## Qanday foydalaniladi

1. Resursni yuklab oling.
2. Tegishli amaliyot mashqini oching.
3. Ro‘yxat yoki ko‘rsatmalarga amal qiling.
4. Natijalaringizni o‘z qaydlaringiz bilan saqlang.

Til: ingliz tili. Versiya: 1.0.`,
    },
    en: {},
  },
  "xavfsizlik-lab-qaydnomasi": {
    uz: {
      title: "Xavfsizlik laboratoriyasi qaydnomasi",
      summary:
        "SQL va IDOR mashqlari davomida so‘rovlar, kutilgan javoblar, kuzatilgan natijalar va xulosalarni yozib borish uchun Markdown shabloni.",
      body: `## Ushbu resurs haqida

SQL va IDOR mashqlari davomida so‘rovlar, kutilgan javoblar, kuzatilgan natijalar va xulosalarni yozib borish uchun Markdown shabloni.

Fayl UTF-8 formatidagi Markdown hujjati. Izoh qoldirish yoki chop etish uchun uni matn muharririda oching.

## Qanday foydalaniladi

1. Resursni yuklab oling.
2. Tegishli amaliyot mashqini oching.
3. Ro‘yxat yoki ko‘rsatmalarga amal qiling.
4. Natijalaringizni o‘z qaydlaringiz bilan saqlang.

Til: ingliz tili. Versiya: 1.0.`,
    },
    en: {},
  },
  "html-sinov-oqituvchi-qollanmasi": {
    uz: {
      title: "HTML baholash: o‘qituvchilar uchun qisqa qo‘llanma",
      summary:
        "Kirish kodlarini tarqatish, vaqt chegaralangan urinishlarni boshqarish va yakuniy baholash natijalarini ko‘rib chiqish bo‘yicha yuklab olinadigan qo‘llanma.",
      body: `## Ushbu resurs haqida

Kirish kodlarini tarqatish, vaqt chegaralangan urinishlarni boshqarish va yakuniy baholash natijalarini ko‘rib chiqish bo‘yicha yuklab olinadigan qo‘llanma.

Fayl UTF-8 formatidagi Markdown hujjati. Izoh qoldirish yoki chop etish uchun uni matn muharririda oching.

## Qanday foydalaniladi

1. Resursni yuklab oling.
2. Tegishli amaliyot mashqini oching.
3. Ro‘yxat yoki ko‘rsatmalarga amal qiling.
4. Natijalaringizni o‘z qaydlaringiz bilan saqlang.

Til: ingliz tili. Versiya: 1.0.`,
    },
    en: {},
  },
  "linux-va-tarmoq-qollanma": {
    uz: {
      summary:
        "Linux fayl tizimi, buyruqlar, OSI/TCP-IP modellari, portlar hamda Wireshark va Nmap kabi tarmoq asoslarini qamrab oluvchi yuklab olinadigan Markdown qo‘llanma.",
      body: `## Ushbu resurs haqida

Linux fayl tizimi, buyruqlar, OSI/TCP-IP modellari, portlar hamda Wireshark va Nmap kabi tarmoq asoslarini qamrab oluvchi yuklab olinadigan Markdown qo‘llanma.

Fayl UTF-8 formatidagi Markdown hujjati. Izoh qoldirish yoki chop etish uchun uni matn muharririda oching.

## Qanday foydalaniladi

1. Resursni yuklab oling.
2. Tegishli taqdimotni oching.
3. Ro‘yxat yoki ko‘rsatmalarga amal qiling.
4. Natijalaringizni o‘z qaydlaringiz bilan saqlang.

Til: o‘zbek tili. Versiya: 1.0.`,
    },
    en: {
      title: "Linux and Networking Fundamentals: A Complete Beginner’s Textbook",
      body: `## About this resource

A downloadable Markdown guide covering Linux filesystem, commands, OSI/TCP-IP models, ports, and networking basics like Wireshark and Nmap.

The file is a UTF-8 Markdown document. Open it in a text editor to annotate or print it.

## How to use it

1. Download the resource.
2. Open the corresponding presentation.
3. Follow the checklist or instructions.
4. Save your results with your own notes.

Language: Uzbek. Version: 1.0.`,
    },
  },
};

// Names are replaced only while they still match the source spelling.
export const tagTranslations: Record<
  string,
  { from: string } & Partial<Record<Locale, string>>
> = {
  "full-stack": { from: "Full-stack", uz: "Full-stack" },
  cms: { from: "CMS", uz: "CMS" },
  html: { from: "HTML", uz: "HTML" },
  education: { from: "Education", uz: "Ta’lim" },
  "web-security": { from: "Web security", uz: "Veb-xavfsizlik" },
  lab: { from: "Lab", uz: "Laboratoriya" },
};

export const categoryTranslations: Record<
  string,
  { from: string } & Partial<Record<Locale, string>>
> = {
  "web-development-security": {
    from: "Web Development and Security",
    uz: "Veb-dasturlash va xavfsizlik",
  },
};
