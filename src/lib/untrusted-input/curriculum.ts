// Academy Intermediate · Web application security, module 2: untrusted
// input. The lessons break a pretend back end (./tools.ts) with SQL injection
// and a file path, then fix it with parameters, allowlists and output
// encoding. The shared sort and quiz widgets come from ../anim-lab/types.
import type { CommonWidget, Lesson, Text } from "../anim-lab/types";

export type Widget =
  | CommonWidget
  | { type: "sql"; goal: "error" | "bypass" }
  | { type: "param" }
  | { type: "path"; filter: boolean }
  | { type: "regex" }
  | { type: "encode" };

export const PROGRESS_KEY = "cybervalue:input:progress:v1";

const t = (uz: string, en: string): Text => ({ uz, en });
const code = (s: string) => t(s, s);

const DATA = t("Ishonchsiz ma’lumot", "Untrusted data");
const INJECTION = t("Inyeksiya", "Injection");
const FILES = t("Fayllar va tekshiruv", "Files and validation");
const OUTPUT = t("Chiqishni kodlash", "Output encoding");

export const LESSONS: Lesson<Widget>[] = [
  {
    id: 1,
    group: DATA,
    title: t("Kim nazorat qiladi?", "Who controls it?"),
    minutes: 6,
    intro: t(
      "Server so‘rovning har bir qismini mijozdan oladi: manzil, parametrlar, sarlavhalar, cookie, forma va JSON tanasi. Bularning barchasini foydalanuvchi — yoki hujumchi — o‘zgartira oladi.",
      "The server gets every part of a request from the client: the address, parameters, headers, cookies, the form and the JSON body. The user — or an attacker — can change all of them.",
    ),
    analogy: t(
      "Pochtaga kelgan konvertdagi “Bank tomonidan” yozuviga o‘xshaydi: uni istalgan odam yozishi mumkin. Ishonchni faqat o‘zingiz tekshirgan narsaga bering.",
      "It is like “From your bank” written on an envelope: anyone can write that. Trust only what you have checked yourself.",
    ),
    theory: [
      t(
        "Yashirin forma maydoni, select ro‘yxati yoki JavaScript tekshiruvi himoya emas: brauzer vositalari yoki curl bilan istalgan qiymat yuboriladi.",
        "A hidden form field, a select list or a JavaScript check is not a defence: browser tools or curl send any value.",
      ),
      t(
        "User-Agent, Referer va X-Forwarded-For ham oddiy matn. Ular jurnal (log) va statistikaga yozilganda ham xavf tug‘diradi.",
        "User-Agent, Referer and X-Forwarded-For are plain text too. They are dangerous even when only written to logs and statistics.",
      ),
      t(
        "Serverning o‘zida saqlangan narsa — sessiya ma’lumotlari, konfiguratsiya, kod ichidagi doimiylar — mijoz nazoratida emas.",
        "What the server keeps itself — session data, configuration, constants in the code — is out of the client’s reach.",
      ),
    ],
    task: t(
      "Har bir qiymatni joyiga ajrating: uni hujumchi o‘zgartira oladimi yoki faqat server?",
      "Sort every value: can an attacker change it, or only the server?",
    ),
    hint: t(
      "So‘rov ichida kelgan hamma narsani — hatto yashirin maydon va cookie’ni ham — hujumchi o‘zgartiradi.",
      "Everything that arrives inside the request — even a hidden field and a cookie — is the attacker’s to change.",
    ),
    widget: {
      type: "sort",
      buckets: [
        {
          id: "client",
          label: t("Hujumchi o‘zgartiradi", "Attacker controls"),
        },
        { id: "server", label: t("Faqat server", "Server only") },
      ],
      items: [
        { label: code("/search?q=telefon"), code: true, bucket: "client" },
        {
          label: code('<input type="hidden" name="price" value="9900">'),
          code: true,
          bucket: "client",
        },
        { label: code("Cookie: theme=dark"), code: true, bucket: "client" },
        {
          label: code("User-Agent: Mozilla/5.0"),
          code: true,
          bucket: "client",
        },
        {
          label: t(
            "Sessiyada saqlangan foydalanuvchi ID",
            "The user ID stored in the session",
          ),
          bucket: "server",
        },
        { label: code('{"role": "admin"}'), code: true, bucket: "client" },
        {
          label: t(
            "Serverdagi .env faylidagi kalit",
            "A key in the server’s .env file",
          ),
          bucket: "server",
        },
        {
          label: t("Yuklangan faylning nomi", "An uploaded file’s name"),
          bucket: "client",
        },
      ],
    },
  },
  {
    id: 2,
    group: INJECTION,
    title: t("Bitta qo‘shtirnoq so‘rovni buzadi", "One quote breaks the query"),
    minutes: 7,
    intro: t(
      "Kirish formasi SQL so‘rovini matnni ulab (konkatenatsiya) quradi: foydalanuvchi yozgan nom va parol to‘g‘ridan-to‘g‘ri qo‘shtirnoqlar orasiga qo‘yiladi.",
      "The login form builds its SQL query by gluing text together (concatenation): the name and password the user types go straight between quotes.",
    ),
    analogy: t(
      "Qo‘lda to‘ldiriladigan buyruq: “Kassir, ____ ga 10 so‘m bering”. Bo‘sh joyga “Aliga, va menga 1 000 000” deb yozilsa, buyruqning o‘zi o‘zgaradi.",
      "A fill-in order: “Cashier, pay ____ 10 som”. Write “Ali, and pay me 1 000 000” in the blank and the order itself changes.",
    ),
    theory: [
      t(
        "Ma’lumot va kod bitta qatorda aralashsa, ma’lumot ichidagi maxsus belgi (masalan ') kodning chegarasini o‘zgartiradi.",
        "When data and code share one string, a special character inside the data (such as ') moves the code’s boundaries.",
      ),
      t(
        "Tester odatda birinchi bo‘lib bitta ' yuboradi. Sintaksis xatosi kelsa, kiritilgan matn so‘rov ichiga tushayotgani ma’lum bo‘ladi.",
        "A tester usually sends a single ' first. A syntax error shows that the input lands inside the query.",
      ),
      t(
        "Foydalanuvchiga xom ma’lumotlar bazasi xatosini ko‘rsatish ham zaiflik: u jadval va ustun nomlarini oshkor qiladi.",
        "Showing users the raw database error is a weakness of its own: it reveals table and column names.",
      ),
    ],
    task: t(
      "Nom yoki parol maydoniga shunday matn yozingki, ma’lumotlar bazasi sintaksis xatosi qaytarsin.",
      "Type something into the name or password field that makes the database return a syntax error.",
    ),
    hint: t(
      "Nom maydoniga bitta qo‘shtirnoq yozing: '",
      "Type a single quote into the name field: '",
    ),
    widget: { type: "sql", goal: "error" },
  },
  {
    id: 3,
    group: INJECTION,
    title: t("Parolsiz kirish", "Signing in without a password"),
    minutes: 9,
    intro: t(
      "Qo‘shtirnoqni yopib, o‘zingizning SQL qismingizni qo‘shsangiz, WHERE sharti siz xohlagan ma’noni oladi. Bu SQL inyeksiyasi — OWASP Top 10 dagi eng mashhur zaiflik.",
      "Close the quote and add SQL of your own, and the WHERE clause means whatever you want. This is SQL injection, the best-known weakness in the OWASP Top 10.",
    ),
    analogy: t(
      "Qo‘riqchiga “Men Aliman, va parolni tekshirmang” deyishga o‘xshaydi — qo‘riqchi esa gapning hammasini buyruq deb bajaradi.",
      "Like telling a guard “I am Ali, and skip the password check” — and the guard follows the whole sentence as an order.",
    ),
    theory: [
      t(
        "SQL’da -- dan keyingi hamma narsa izoh: so‘rovning qolgan qismi, jumladan parol tekshiruvi, o‘chib ketadi.",
        "In SQL everything after -- is a comment: the rest of the query, password check included, disappears.",
      ),
      t(
        "OR '1'='1' doim to‘g‘ri bo‘lgan shart qo‘shadi. AND OR dan oldin bajarilishini unutmang — shuning uchun ba’zan ikkala maydon ham kerak bo‘ladi.",
        "OR '1'='1' adds a condition that is always true. Remember that AND binds before OR — that is why both fields are sometimes needed.",
      ),
      t(
        "Ko‘p kod birinchi topilgan qatorni kirgan foydalanuvchi deb oladi. Jadvalda birinchi turgan odatda admin.",
        "Much code treats the first row found as the signed-in user. The first row in the table is usually the admin.",
      ),
    ],
    task: t(
      "Admin parolini bilmasdan admin sifatida kiring.",
      "Sign in as admin without knowing the admin’s password.",
    ),
    hint: t(
      "Nom maydoniga yozing: admin'--  (parol maydoniga istalgan narsa)",
      "Type into the name field: admin'--  (anything in the password field)",
    ),
    widget: { type: "sql", goal: "bypass" },
  },
  {
    id: 4,
    group: INJECTION,
    title: t("Parametrli so‘rovlar", "Parameterized queries"),
    minutes: 7,
    intro: t(
      "To‘g‘ri himoya — qiymatlarni so‘rov matniga umuman qo‘shmaslik. So‘rov ? belgilari bilan oldindan tayyorlanadi, qiymatlar esa alohida, ma’lumot sifatida yuboriladi.",
      "The right defence is never to put values into the query text at all. The query is prepared with ? placeholders and the values are sent separately, as data.",
    ),
    analogy: t(
      "Bo‘sh joyli buyruq o‘rniga kassirga tayyor blanka berasiz: “Kimga” katagiga nima yozilsa ham, u faqat ism bo‘lib qoladi.",
      "Instead of a fill-in order the cashier gets a printed form: whatever goes in the “Pay to” box stays a name.",
    ),
    theory: [
      t(
        "Ma’lumotlar bazasi so‘rov tuzilishini qiymatlarni ko‘rishdan oldin tahlil qiladi. Keyin kelgan ' belgisi shunchaki belgi.",
        "The database parses the query’s structure before it ever sees the values. A ' that arrives later is just a character.",
      ),
      t(
        "Qo‘lda “qochirish” (escaping) yoki ' ni o‘chirish ishonchsiz: kodlash, raqamli maydonlar va turli ma’lumotlar bazalari uni aylanib o‘tadi.",
        "Hand-made escaping or stripping ' is unreliable: encodings, numeric fields and different databases get around it.",
      ),
      t(
        "Jadval yoki ustun nomini parametr qilib bo‘lmaydi. Ular uchun ruxsat etilgan nomlar ro‘yxatidan (allowlist) foydalaning.",
        "A table or column name cannot be a parameter. Use an allowlist of permitted names for those.",
      ),
    ],
    task: t(
      "Parametrlarni yoqing va o‘tgan darsdagi hujum matnini qayta yuboring. Eski kod kirib ketadi, yangisi esa yo‘q.",
      "Turn parameters on and send the previous lesson’s attack again. The old code lets it in, the new one does not.",
    ),
    hint: t(
      "Nom: admin'--  · “Parametrli so‘rov” ni belgilang va “Kirish” ni bosing.",
      "Name: admin'--  · tick “Parameterized query” and press “Sign in”.",
    ),
    widget: { type: "param" },
  },
  {
    id: 5,
    group: FILES,
    title: t("Fayl yo‘lini tekshirish", "Checking a file path"),
    minutes: 8,
    intro: t(
      "Yuklab olish sahifasi fayl nomini parametrdan olib, /srv/files papkasiga qo‘shadi. Nom ichidagi .. “bir papka yuqoriga” degani — tekshiruvsiz kod papkadan tashqaridagi faylni ham beradi.",
      "A download page takes the file name from a parameter and joins it to the /srv/files folder. A .. in the name means “one folder up” — code without a check also serves files outside the folder.",
    ),
    analogy: t(
      "Kutubxonachiga “3-javondagi kitob” o‘rniga “3-javondan chiqib, direktor xonasidagi papka” deyishga o‘xshaydi. Yaxshi kutubxonachi avval manzil qaysi xonaga olib borishini tekshiradi.",
      "Like asking a librarian not for “the book on shelf 3” but for “out of shelf 3 and into the director’s office”. A good librarian first checks which room the path leads to.",
    ),
    theory: [
      t(
        "Bu zaiflik path traversal deyiladi. U konfiguratsiya fayllari, kalitlar va parollarni oshkor qiladi.",
        "This weakness is called path traversal. It exposes configuration files, keys and passwords.",
      ),
      t(
        "To‘g‘ri tekshiruv: yo‘lni oxirigacha hal qiling (normalize), keyin u ruxsat etilgan papka bilan boshlanishini tekshiring.",
        "The right check: resolve the path completely (normalize), then confirm it still starts with the allowed folder.",
      ),
      t(
        "Bundan ham yaxshisi — foydalanuvchidan yo‘l emas, ID qabul qilish va faylni server o‘zi jadvaldan topishi.",
        "Better still: accept an ID instead of a path, and let the server look the file up itself.",
      ),
    ],
    task: t(
      "Server hal qilgan yo‘l /srv/files papkasidan tashqariga chiqadigan nom yuboring va himoyalangan kod uni qanday rad etishini ko‘ring.",
      "Send a name whose resolved path leaves /srv/files, and see how the protected code refuses it.",
    ),
    hint: t(
      "Nomni .. bilan boshlang: u bir papka yuqoriga ko‘taradi.",
      "Start the name with .. — it goes one folder up.",
    ),
    widget: { type: "path", filter: false },
  },
  {
    id: 6,
    group: FILES,
    title: t("Taqiqlar ro‘yxati nega yetmaydi", "Why blocklists fall short"),
    minutes: 7,
    intro: t(
      "Dasturchi tuzatish sifatida nomdan “../” ni o‘chirib tashlaydigan filtr qo‘shdi. Taqiqlar ro‘yxati (blocklist) faqat oldindan o‘ylangan shaklni to‘xtatadi.",
      "As a fix, the developer added a filter that deletes “../” from the name. A blocklist only stops the shapes someone thought of in advance.",
    ),
    analogy: t(
      "Eshikka “itlar kirmasin” deb yozish kabi: mushuk, tulki va yashirib olib kirilgan it baribir kiradi.",
      "Like a “no dogs” sign on a door: cats, foxes and a dog in a bag still get in.",
    ),
    theory: [
      t(
        "Filtr bir marta ishlaydi: o‘chirilgandan keyin qolgan belgilar yangi “../” hosil qilishi mumkin.",
        "The filter runs once: what is left after a deletion can form a new “../”.",
      ),
      t(
        "Allowlist teskarisini qiladi: faqat ma’lum, xavfsiz shaklni qabul qiladi va qolganini rad etadi.",
        "An allowlist does the opposite: it accepts only a known safe shape and refuses the rest.",
      ),
      t(
        "Qoida: tozalashga emas, tekshirishga tayaning. Noto‘g‘ri qiymatni “tuzatmang”, rad eting.",
        "Rule: rely on checking, not cleaning. Do not “repair” a bad value — refuse it.",
      ),
    ],
    task: t(
      "Filtrdan keyin ham /srv/files dan tashqariga chiqadigan nom toping. Pastdagi tekshiruv uni baribir ushlaydi.",
      "Find a name that still leaves /srv/files after the filter. The check below catches it anyway.",
    ),
    hint: t(
      "Filtr “../” ni o‘chirgandan keyin qolgan belgilar yana “../” bo‘lib qolsin.",
      "Make the characters left after the filter deletes “../” form “../” again.",
    ),
    widget: { type: "path", filter: true },
  },
  {
    id: 7,
    group: FILES,
    title: t("Allowlist bilan tekshirish", "Validating with an allowlist"),
    minutes: 9,
    intro: t(
      "Foydalanuvchi nomi uchun qoida yozing: faqat ruxsat etilgan belgilar va uzunlik. Muntazam ifoda (regex) kiritilgan qiymatni to‘liq tekshirishi kerak, faqat bir qismini emas.",
      "Write the rule for a username: only allowed characters and length. The regular expression must check the whole value, not just part of it.",
    ),
    analogy: t(
      "Mehmonlar ro‘yxati bilan eshik oldida turgan qorovul: ro‘yxatda bo‘lmasang, sabab so‘ralmaydi — kirmaysan.",
      "A guard at the door with a guest list: if you are not on it, no reasons are asked — you do not get in.",
    ),
    theory: [
      t(
        "^ satr boshini, $ oxirini bildiradi. Ularsiz regex qiymat ichidagi istalgan mos bo‘lakni qabul qiladi.",
        "^ marks the start and $ the end. Without them a regex accepts any matching piece inside the value.",
      ),
      t(
        "[a-z0-9_] — ruxsat etilgan belgilar to‘plami, {3,16} — necha marta takrorlanishi.",
        "[a-z0-9_] is the set of allowed characters, {3,16} how many times it repeats.",
      ),
      t(
        "Tekshiruv har doim serverda bo‘lsin. Brauzerdagi tekshiruv — faqat foydalanuvchiga qulaylik.",
        "Validation always belongs on the server. A check in the browser is only a convenience for the user.",
      ),
    ],
    task: t(
      "Barcha to‘g‘ri nomlarni qabul qiladigan va qolganlarini rad etadigan regex yozing.",
      "Write a regex that accepts every valid name and refuses all the others.",
    ),
    hint: t(
      "Shakl: ^[ruxsat etilgan belgilar]{eng kam,eng ko‘p}$",
      "Shape: ^[allowed characters]{min,max}$",
    ),
    widget: { type: "regex" },
  },
  {
    id: 8,
    group: OUTPUT,
    title: t("Kodlash kontekstga bog‘liq", "Encoding depends on context"),
    minutes: 9,
    intro: t(
      "Ism sahifaga ikki joyda chiqadi: matn ichida va input’ning value atributida. Har bir joyning o‘z maxsus belgilari bor, shuning uchun kodlash ham joyga mos bo‘lishi kerak.",
      "A name appears on the page in two places: inside text and inside an input’s value attribute. Each place has its own special characters, so the encoding must fit the place.",
    ),
    analogy: t(
      "Bir xil gapni SMS, rasmiy xat va telegrammada boshqacha yozasiz — har birining o‘z qoidasi bor.",
      "You write the same sentence differently in a text message, a formal letter and a telegram — each has its own rules.",
    ),
    theory: [
      t(
        "Matn ichida < va > xavfli: ular yangi teg boshlaydi. Atribut ichida esa qo‘shtirnoq qiymatni yopadi.",
        "Inside text, < and > are dangerous: they start a new tag. Inside an attribute, a quote closes the value.",
      ),
      t(
        "To‘liq HTML kodlash & < > \" ' belgilarining hammasini almashtiradi. Faqat < va > ni almashtirish atribut uchun yetmaydi.",
        "Full HTML encoding replaces all of & < > \" '. Replacing only < and > is not enough for an attribute.",
      ),
      t(
        "Zamonaviy shablonlar (React, Jinja, Twig) avtomatik kodlaydi. Xavf ularni chetlab o‘tganda paydo bo‘ladi: innerHTML, dangerouslySetInnerHTML, |safe.",
        "Modern templates (React, Jinja, Twig) encode automatically. The risk appears when they are bypassed: innerHTML, dangerouslySetInnerHTML, |safe.",
      ),
    ],
    task: t(
      "Shunday ism yozingki, “faqat < va >” kodlashi bilan ham atributdan chiqib ketsin. Keyin to‘liq kodlash uni qanday to‘xtatishini ko‘ring.",
      "Type a name that escapes the attribute even with “only < and >” encoding. Then see how full encoding stops it.",
    ),
    hint: t(
      "Atribut qiymati qo‘shtirnoq bilan yopiladi.",
      "An attribute value is closed by a quote.",
    ),
    widget: { type: "encode" },
  },
  {
    id: 9,
    group: OUTPUT,
    title: t("Yakuniy savollar", "Final questions"),
    minutes: 6,
    intro: t(
      "Modulning asosiy qoidalarini takrorlaymiz: ma’lumot va kodni ajratish, tekshirish va kodlash.",
      "A review of the module’s main rules: keep data apart from code, validate, and encode.",
    ),
    analogy: t(
      "Uch qatlamli himoya: eshik qulfi (tekshiruv), seyf (parametrlar) va signalizatsiya (kodlash).",
      "Three layers of defence: the door lock (validation), the safe (parameters) and the alarm (encoding).",
    ),
    theory: [
      t(
        "Inyeksiya ma’lumot kod sifatida talqin qilinganda paydo bo‘ladi. Himoya — ularni hech qachon bitta matnga aralashtirmaslik.",
        "Injection happens when data is read as code. The defence is never to mix them into one string.",
      ),
      t(
        "Tekshiruv kirishda, kodlash chiqishda: ikkalasi ham kerak, biri ikkinchisining o‘rnini bosmaydi.",
        "Validate on the way in, encode on the way out: both are needed, and neither replaces the other.",
      ),
    ],
    task: t(
      "Barcha savollarga to‘g‘ri javob bering.",
      "Answer every question correctly.",
    ),
    hint: t(
      "Har bir variantni “ma’lumot kodga aylanadimi?” degan savol bilan tekshiring.",
      "Test each option with the question “does data turn into code here?”",
    ),
    widget: {
      type: "quiz",
      questions: [
        {
          ask: t(
            "SQL inyeksiyasidan eng ishonchli himoya qaysi?",
            "Which is the most reliable defence against SQL injection?",
          ),
          options: [
            t("Parametrli so‘rovlar", "Parameterized queries"),
            t("' belgisini o‘chirish", "Deleting the ' character"),
            t(
              "Brauzerda JavaScript tekshiruvi",
              "A JavaScript check in the browser",
            ),
            t("Xatolarni yashirish", "Hiding the errors"),
          ],
          answer: 0,
          explain: t(
            "Parametrlar qiymatni so‘rov tuzilishidan butunlay ajratadi.",
            "Parameters keep the value completely apart from the query’s structure.",
          ),
        },
        {
          ask: t(
            "Yashirin forma maydonidagi narx haqida nima to‘g‘ri?",
            "What is true about a price in a hidden form field?",
          ),
          options: [
            t("Foydalanuvchi uni o‘zgartira oladi", "The user can change it"),
            t("Uni faqat server o‘zgartiradi", "Only the server can change it"),
            t("HTTPS uni himoya qiladi", "HTTPS protects it"),
          ],
          answer: 0,
          explain: t(
            "So‘rov ichida kelgan hamma narsa mijoz nazoratida. Narxni serverdagi ma’lumotdan oling.",
            "Everything inside the request is the client’s to change. Take the price from the server’s data.",
          ),
        },
        {
          ask: t(
            "Fayl yo‘li uchun to‘g‘ri tekshiruv qaysi?",
            "Which check is right for a file path?",
          ),
          options: [
            t(
              "Yo‘lni hal qilib, ruxsat etilgan papka bilan boshlanishini tekshirish",
              "Resolve the path, then check it starts with the allowed folder",
            ),
            t("“../” ni bir marta o‘chirish", "Delete “../” once"),
            t("Fayl kengaytmasini tekshirish", "Check the file extension"),
          ],
          answer: 0,
          explain: t(
            "Faqat oxirigacha hal qilingan yo‘lni tekshirish ishonchli.",
            "Only checking the fully resolved path is reliable.",
          ),
        },
        {
          ask: t(
            'Ism value="…" atributiga chiqadi. Qaysi kodlash kerak?',
            'A name goes into a value="…" attribute. Which encoding is needed?',
          ),
          options: [
            t(
              "To‘liq HTML kodlash, qo‘shtirnoqlar bilan",
              "Full HTML encoding, quotes included",
            ),
            t("Faqat < va > ni almashtirish", "Replacing only < and >"),
            t("Base64", "Base64"),
          ],
          answer: 0,
          explain: t(
            "Atribut ichida qiymatni qo‘shtirnoq yopadi, shuning uchun u ham kodlanishi kerak.",
            "Inside an attribute a quote closes the value, so it must be encoded too.",
          ),
        },
        {
          ask: t(
            "Nega regex’da ^ va $ kerak?",
            "Why does a validation regex need ^ and $?",
          ),
          options: [
            t(
              "Ular butun qiymatni tekshirishga majbur qiladi",
              "They force the whole value to be checked",
            ),
            t("Ular regex’ni tezlashtiradi", "They make the regex faster"),
            t("Ular katta harflarni taqiqlaydi", "They forbid capital letters"),
          ],
          answer: 0,
          explain: t(
            "Ularsiz qiymat ichidagi mos bo‘lak ham qabul qilinadi.",
            "Without them a matching piece inside the value is accepted too.",
          ),
        },
      ],
    },
  },
];
