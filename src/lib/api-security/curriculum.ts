// Academy Intermediate · Web application security, module 5: API security.
// The lessons use a pretend API (./tools.ts): a profile endpoint that may
// send too much, a profile update that may copy any field, an order schema
// and a sign-in endpoint under a rate limit.
import type { CommonWidget, Lesson, Text } from "../anim-lab/types";

export type Widget =
  CommonWidget | { type: "fields" } | { type: "mass" } | { type: "rate" };

export const PROGRESS_KEY = "cybervalue:api:progress:v1";

const t = (uz: string, en: string): Text => ({ uz, en });
const code = (s: string) => t(s, s);

const DATA = t("Ma’lumot oqimi", "What goes in and out");
const LIMITS = t("Chegaralar", "Limits");
const REVIEW = t("API’ni ko‘rib chiqish", "Reviewing an API");

export const LESSONS: Lesson<Widget>[] = [
  {
    id: 1,
    group: DATA,
    title: t("Javob ortiqcha gapiradi", "The reply says too much"),
    minutes: 8,
    intro: t(
      "Mobil ilova boshqa foydalanuvchining profil kartasini ko‘rsatadi: ism va rasm. API esa bazadagi butun yozuvni qaytaradi, ilova keraksizini shunchaki ko‘rsatmaydi. Lekin javobni har kim brauzer yoki proksi orqali to‘liq o‘qiy oladi.",
      "A mobile app shows another user’s profile card: a name and a picture. The API returns the whole database record and the app simply does not show the rest. But anyone can read the full reply through a browser or a proxy.",
    ),
    analogy: t(
      "Do‘kon kassiri chekda faqat narxni ko‘rsatish o‘rniga, xaridorning pasport ma’lumotlarini ham chop etib, “ko‘rmang” deb qo‘yganiga o‘xshaydi.",
      "Like a till printing the shopper’s passport details on the receipt next to the price and asking everyone not to look.",
    ),
    theory: [
      t(
        "Filtr serverda bo‘ladi: javobga faqat ekranga kerakli maydonlar yoziladi. Ilovadagi yashirish — himoya emas.",
        "Filtering happens on the server: the reply carries only the fields the screen needs. Hiding them in the app is not protection.",
      ),
      t(
        "Har bir endpoint uchun javob shaklini (DTO) aniq belgilang; bazadagi obyektni to‘g‘ridan-to‘g‘ri qaytarmang.",
        "Define the reply shape (a DTO) for each endpoint; never return the database object as it is.",
      ),
      t(
        "OWASP API Top 10 da bu “Broken Object Property Level Authorization” (API3) deb ataladi.",
        "On the OWASP API Top 10 this is “Broken Object Property Level Authorization” (API3).",
      ),
    ],
    task: t(
      "GET /api/users/7 javobida faqat profil kartasiga kerakli maydonlar qolsin.",
      "Leave only the fields the profile card needs in the GET /api/users/7 reply.",
    ),
    hint: t(
      "Karta uchun havola (id), ism va rasm yetarli.",
      "The card needs a link (id), a name and a picture.",
    ),
    widget: { type: "fields" },
  },
  {
    id: 2,
    group: DATA,
    title: t("Ortiqcha maydon yuborish", "Sending an extra field"),
    minutes: 10,
    intro: t(
      'Profilni tahrirlash formasi faqat ism va “o‘zim haqimda” maydonlarini yuboradi. Server kelgan JSON’ni foydalanuvchi yozuviga to‘liq ko‘chiradi. Ali so‘rovga o‘zi "role": "admin" qo‘shsa nima bo‘ladi? Bu mass assignment deyiladi.',
      'The profile form sends only a name and a bio. The server copies the incoming JSON onto the user record as it is. What if Ali adds "role": "admin" to the request himself? This is mass assignment.',
    ),
    analogy: t(
      "Anketada “Ism” va “Manzil” qatorlari bor, lekin kimdir pastiga “Lavozim: direktor” deb yozib qo‘ydi — va kadrlar bo‘limi uni ham kiritib qo‘ydi.",
      "A form has lines for “Name” and “Address”, but someone wrote “Job: director” at the bottom — and HR typed that in too.",
    ),
    theory: [
      t(
        "Himoya — ruxsat etilgan maydonlar ro‘yxati (allowlist): serverda faqat name va bio o‘qiladi, qolganlari e’tiborga olinmaydi yoki xato qaytariladi.",
        "The defence is an allowlist: the server reads only name and bio and ignores the rest or returns an error.",
      ),
      t(
        "Object.assign(user, req.body) yoki ORM’ning update(req.body) kabi qisqa yo‘llar aynan shu xatoni beradi.",
        "Shortcuts like Object.assign(user, req.body) or an ORM’s update(req.body) cause exactly this.",
      ),
    ],
    task: t(
      "So‘rovga role yoki balance maydonini qo‘shing va ruxsatsiz o‘zgarishni ko‘ring. Keyin ruxsat etilgan maydonlar ro‘yxatini yoqing.",
      "Add a role or balance field to the request and see the unauthorised change. Then switch on the allowlist.",
    ),
    hint: t(
      'Masalan: {"name": "Ali", "role": "admin"}',
      'For example: {"name": "Ali", "role": "admin"}',
    ),
    widget: { type: "mass" },
  },
  {
    id: 3,
    group: DATA,
    title: t(
      "Sxema — kirish eshigidagi tekshiruv",
      "A schema checks at the door",
    ),
    minutes: 8,
    intro: t(
      "POST /api/orders sxemasi: quantity — 1 dan 10 gacha butun son, coupon — ixtiyoriy, 20 belgigacha matn, boshqa maydon yo‘q. Sxemaga mos kelmagan so‘rov kod ishlamasdan oldin 400 bilan qaytariladi.",
      "The POST /api/orders schema: quantity is a whole number from 1 to 10, coupon an optional text of up to 20 characters, and no other fields. A request that does not match is answered with 400 before any code runs.",
    ),
    analogy: t(
      "Bagaj tarozisi va o‘lcham ramkasi: qoidaga sig‘magan chamadon samolyotga yetib bormaydi.",
      "A baggage scale and size frame: a case that does not fit never reaches the plane.",
    ),
    theory: [
      t(
        "Turini, oralig‘ini va uzunligini tekshiring. Kutilmagan maydonlarni rad eting (additionalProperties: false) — bu mass assignment’ni ham to‘xtatadi.",
        "Check types, ranges and lengths. Refuse unexpected fields (additionalProperties: false) — this stops mass assignment too.",
      ),
      t(
        "Narxni hech qachon mijozdan olmang: server uni o‘zi hisoblaydi.",
        "Never take the price from the client: the server works it out itself.",
      ),
    ],
    task: t(
      "Qaysi so‘rov tanalari sxemadan o‘tadi, qaysilari rad etiladi?",
      "Which request bodies pass the schema, and which are refused?",
    ),
    hint: t(
      '"3" — matn, son emas. price — sxemada yo‘q maydon.',
      '"3" is text, not a number. price is not in the schema.',
    ),
    widget: {
      type: "sort",
      buckets: [
        { id: "pass", label: t("O‘tadi", "Passes") },
        { id: "refuse", label: t("400 — rad etiladi", "400 — refused") },
      ],
      items: [
        { label: code('{"quantity": 3}'), code: true, bucket: "pass" },
        { label: code('{"quantity": -5}'), code: true, bucket: "refuse" },
        { label: code('{"quantity": "3"}'), code: true, bucket: "refuse" },
        {
          label: code('{"quantity": 2, "coupon": "YOZ25"}'),
          code: true,
          bucket: "pass",
        },
        {
          label: code('{"quantity": 2, "price": 0}'),
          code: true,
          bucket: "refuse",
        },
        { label: code('{"quantity": 1000000}'), code: true, bucket: "refuse" },
      ],
    },
  },
  {
    id: 4,
    group: LIMITS,
    title: t("Tezlikni cheklash", "Rate limiting"),
    minutes: 10,
    intro: t(
      "Hujumchida 50 ta IP manzil bor va u bitta hisob parolini ehtimoliy 10 000 ta parol ro‘yxatidan taxmin qilmoqchi. Cheklovsiz u buni bir necha daqiqada tugatadi. Cheklov qanday bo‘lsa, ro‘yxat kamida bir kun cho‘ziladi, lekin ikki marta xato yozgan haqiqiy foydalanuvchi bloklanmaydi?",
      "An attacker has 50 IP addresses and wants to guess one account’s password from a list of 10,000 likely ones. With no limit it takes minutes. Which limit makes the list take at least a day without blocking a real user who mistypes twice?",
    ),
    analogy: t(
      "Bankomat uch marta xato PIN’dan keyin kartani ushlab qoladi — qaysi bankomatdan urinishingiz muhim emas, karta bitta.",
      "A cash machine keeps the card after three wrong PINs — it does not matter which machine you try, the card is the same.",
    ),
    theory: [
      t(
        "Faqat IP bo‘yicha cheklov ko‘p manzilli hujumchini to‘xtatmaydi. Kirish uchun hisob bo‘yicha ham cheklang.",
        "A limit per IP alone does not stop an attacker with many addresses. For sign-in, limit per account too.",
      ),
      t(
        "Chegaradan oshganda 429 Too Many Requests va Retry-After sarlavhasi qaytariladi.",
        "Over the limit the server answers 429 Too Many Requests with a Retry-After header.",
      ),
      t(
        "Cheklov qimmat amallarni ham himoya qiladi: SMS yuborish, qidiruv, eksport — aks holda hisob yoki server sarflanadi.",
        "Limits also protect costly actions — sending SMS, search, export — that would otherwise drain money or the server.",
      ),
    ],
    task: t(
      "Cheklov va uning kalitini tanlang: ro‘yxat kamida 24 soat davom etsin, haqiqiy foydalanuvchi bloklanmasin.",
      "Choose a limit and what it counts by so the list takes at least 24 hours and the real user is not blocked.",
    ),
    hint: t(
      "Hisob bo‘yicha, daqiqasiga bir nechta urinish.",
      "Per account, a few tries a minute.",
    ),
    widget: { type: "rate" },
  },
  {
    id: 5,
    group: LIMITS,
    title: t("API kalitlari qayerda turadi", "Where API keys live"),
    minutes: 6,
    intro: t(
      "To‘lov yoki SMS xizmatining API kaliti — pul bilan teng. U sizib chiqsa, boshqalar sizning hisobingizdan foydalanadi. Kalitni qayerda saqlash va qanday yuborish muhim.",
      "An API key for a payment or SMS service is as good as money. If it leaks, others use your account. Where you keep it and how you send it matter.",
    ),
    analogy: t(
      "Seyf kalitini ofis eshigiga osib qo‘ymaysiz, lekin uni seyf yonidagi qulflangan qutida saqlaysiz.",
      "You do not hang the safe key on the office door; you keep it in a locked box next to the safe.",
    ),
    theory: [
      t(
        "Mobil ilova yoki brauzer kodiga qo‘yilgan kalitni har kim ajratib oladi. Bunday kalit faqat server tomonda ishlatiladi.",
        "A key placed in a mobile app or browser code can be pulled out by anyone. Such keys are used on the server only.",
      ),
      t(
        "Kalit Authorization sarlavhasida yuboriladi, manzil qatorida emas: manzillar loglarga va tarixga yoziladi.",
        "Send the key in the Authorization header, not in the URL: addresses end up in logs and history.",
      ),
      t(
        "Kalitga kerakli huquqlarnigina bering va muntazam almashtiring.",
        "Give a key only the rights it needs and rotate it regularly.",
      ),
    ],
    task: t(
      "Har bir joyni ajrating: kalit uchun xavfsizmi yoki yo‘q?",
      "Sort each place: is it safe for the key or not?",
    ),
    hint: t(
      "Foydalanuvchi qo‘liga yetib boradigan yoki loglarga yoziladigan joy — xavfli.",
      "Anywhere a user can reach, or that gets logged, is unsafe.",
    ),
    widget: {
      type: "sort",
      buckets: [
        { id: "safe", label: t("Xavfsiz", "Safe") },
        { id: "unsafe", label: t("Xavfli", "Unsafe") },
      ],
      items: [
        {
          label: t(
            "Serverdagi muhit o‘zgaruvchisi",
            "An environment variable on the server",
          ),
          bucket: "safe",
        },
        {
          label: t("Mobil ilova kodi", "The mobile app’s code"),
          bucket: "unsafe",
        },
        {
          label: t(
            "Git repozitoriyasidagi config fayl",
            "A config file in the git repository",
          ),
          bucket: "unsafe",
        },
        { label: code("Authorization: Bearer …"), code: true, bucket: "safe" },
        { label: code("GET /api/sms?key=…"), code: true, bucket: "unsafe" },
        {
          label: t(
            "Maxfiy ma’lumotlar ombori (secret manager)",
            "A secret manager",
          ),
          bucket: "safe",
        },
      ],
    },
  },
  {
    id: 6,
    group: REVIEW,
    title: t("Unutilgan eshiklar", "Forgotten doors"),
    minutes: 8,
    intro: t(
      "Yangi versiya /api/v2 himoyalangan, lekin eski /api/v1 hali ishlab turibdi va unda tekshiruv yo‘q. Boshqa endpoint foydalanuvchi bergan manzilga server nomidan so‘rov yuboradi. Bular API inventari va SSRF muammolari.",
      "The new /api/v2 is protected, but the old /api/v1 still runs without checks. Another endpoint fetches an address the user gives, from the server. These are API inventory and SSRF problems.",
    ),
    analogy: t(
      "Old eshikka yangi qulf qo‘yildi, lekin orqa eshik ochiq qoldi. Va qorovulga “shu manzildan posilka olib kel” deyishsa, u ichki omborga ham boradi.",
      "The front door got a new lock but the back door is open. And a guard told “fetch a parcel from this address” walks into the inner store too.",
    ),
    theory: [
      t(
        "Barcha endpoint va versiyalar ro‘yxatini yuriting; eskisini o‘chiring yoki bir xil himoya qiling.",
        "Keep a list of every endpoint and version; switch old ones off or protect them equally.",
      ),
      t(
        "SSRF: server foydalanuvchi bergan URL’ni ochsa, u ichki tarmoqqa (masalan, 169.254.169.254 bulut metadata manzili) so‘rov yuborishi mumkin. Ruxsat etilgan manzillar ro‘yxatini ishlating.",
        "SSRF: a server that opens a URL the user gives can be made to call the inside network (such as the cloud metadata address 169.254.169.254). Use an allowlist of hosts.",
      ),
      t(
        "CORS: Access-Control-Allow-Origin: * cookie bilan ishlamaydi; har qanday originni aks ettirish va credentials’ga ruxsat berish esa begona saytga ma’lumotni ochib beradi.",
        "CORS: Access-Control-Allow-Origin: * does not work with cookies; echoing any origin while allowing credentials hands data to foreign sites.",
      ),
    ],
    task: t("Savollarga javob bering.", "Answer the questions."),
    hint: t(
      "Har bir javobda hujumchi kira oladigan eshik yopilishi kerak.",
      "Each answer should close a door the attacker could use.",
    ),
    widget: {
      type: "quiz",
      questions: [
        {
          ask: t(
            "/api/v2/users himoyalangan, /api/v1/users esa yo‘q. To‘g‘ri yo‘l?",
            "/api/v2/users is protected, /api/v1/users is not. The right move?",
          ),
          options: [
            t(
              "v1 ni o‘chirish yoki unga ham bir xil tekshiruv qo‘yish",
              "Switch v1 off or give it the same checks",
            ),
            t(
              "v1 manzilini hech kimga aytmaslik",
              "Tell nobody the v1 address",
            ),
            t("Faqat ilovani yangilash", "Only update the app"),
          ],
          answer: 0,
          explain: t(
            "Yashirin manzil — himoya emas; skanerlar uni topadi.",
            "A hidden address is not protection; scanners find it.",
          ),
        },
        {
          ask: t(
            "“Rasmni URL orqali yuklash” endpoint’i qaysi manzilni ochmasligi kerak?",
            "Which address must an “upload a picture from a URL” endpoint refuse?",
          ),
          options: [
            code("http://169.254.169.254/latest/meta-data/"),
            code("https://images.example.uz/cat.png"),
            code("https://cdn.example.com/a.jpg"),
          ],
          answer: 0,
          explain: t(
            "Bu bulut serverining ichki metadata manzili — u yerda kalitlar bo‘lishi mumkin.",
            "That is the cloud server’s internal metadata address, which may hold keys.",
          ),
        },
        {
          ask: t(
            "Qaysi CORS sozlamasi xavfli?",
            "Which CORS setup is dangerous?",
          ),
          options: [
            t(
              "Har qanday Origin’ni aks ettirib, Allow-Credentials: true berish",
              "Echoing any Origin with Allow-Credentials: true",
            ),
            t(
              "Faqat https://app.cybervalue.uz ga ruxsat berish",
              "Allowing only https://app.cybervalue.uz",
            ),
            t(
              "CORS sarlavhalarini umuman bermaslik",
              "Sending no CORS headers at all",
            ),
          ],
          answer: 0,
          explain: t(
            "Shunda har qanday sayt foydalanuvchi cookie’si bilan javobni o‘qiy oladi.",
            "Then any site can read the reply with the user’s cookie.",
          ),
        },
      ],
    },
  },
  {
    id: 7,
    group: REVIEW,
    title: t(
      "API’ni tekshiruv ro‘yxati bilan ko‘rish",
      "Reviewing an API with a checklist",
    ),
    minutes: 8,
    intro: t(
      "Sizga yangi API’ning tavsifi berildi. Har bir bandni ro‘yxat bo‘yicha ko‘rib chiqing: bu kamchilikmi yoki to‘g‘ri yechimmi? Yakunda topilganlarni hisobotga yozasiz.",
      "You are given a new API’s description. Go through each point with the checklist: is it a gap or a sound choice? At the end the findings go into a report.",
    ),
    analogy: t(
      "Texnik ko‘rik: tormoz, chiroq, shinalar — har biri ro‘yxatdan o‘tadi, ko‘zga ko‘ringani emas.",
      "A vehicle inspection: brakes, lights, tyres — each goes down the list, not just what catches the eye.",
    ),
    theory: [
      t(
        "Ro‘yxat: kim? (autentifikatsiya), nimaga ruxsat? (obyekt va funksiya darajasida), qaysi maydonlar kiradi va chiqadi, qancha tez-tez, qaysi versiyalar ochiq.",
        "The list: who? (authentication), allowed to what? (object and function level), which fields go in and out, how often, which versions are open.",
      ),
      t(
        "Har bir topilma uchun: qayerda, qanday takrorlanadi, xavfi va tuzatish taklifi.",
        "For each finding: where, how to reproduce, the risk and a proposed fix.",
      ),
    ],
    task: t(
      "Tavsifdagi har bir bandni ajrating.",
      "Sort each point of the description.",
    ),
    hint: t(
      "Ortiqcha ma’lumot, cheklovsiz kirish va manzildagi kalit — kamchiliklar.",
      "Extra data, unlimited sign-in and a key in the URL are gaps.",
    ),
    widget: {
      type: "sort",
      buckets: [
        { id: "gap", label: t("Kamchilik", "Gap") },
        { id: "ok", label: t("To‘g‘ri", "Sound") },
      ],
      items: [
        {
          label: t(
            "GET /api/users/{id} passwordHash ni ham qaytaradi",
            "GET /api/users/{id} also returns passwordHash",
          ),
          bucket: "gap",
        },
        {
          label: t(
            "POST /api/login da urinishlar soni cheklanmagan",
            "POST /api/login has no limit on attempts",
          ),
          bucket: "gap",
        },
        {
          label: t(
            "Har bir so‘rov tanasi sxema bilan tekshiriladi",
            "Every request body is checked against a schema",
          ),
          bucket: "ok",
        },
        {
          label: t(
            "Hamkor kaliti ?api_key= orqali yuboriladi",
            "The partner key is sent as ?api_key=",
          ),
          bucket: "gap",
        },
        {
          label: t(
            "Buyurtma egasi har bir so‘rovda tekshiriladi",
            "The order owner is checked on every request",
          ),
          bucket: "ok",
        },
        {
          label: t(
            "Xatolarda stack trace foydalanuvchiga ko‘rsatiladi",
            "Errors show the stack trace to the user",
          ),
          bucket: "gap",
        },
      ],
    },
  },
  {
    id: 8,
    group: REVIEW,
    title: t("Yakuniy savollar", "Final questions"),
    minutes: 6,
    intro: t(
      "Modulni takrorlaymiz: javobdagi ortiqcha maydonlar, mass assignment, sxemalar, tezlikni cheklash, kalitlar va unutilgan endpointlar.",
      "A review of the module: extra fields in replies, mass assignment, schemas, rate limits, keys and forgotten endpoints.",
    ),
    analogy: t(
      "API — ekransiz eshik. Uni ham boshqa eshiklar kabi qulflash, ro‘yxatga olish va kuzatish kerak.",
      "An API is a door without a screen. It needs locking, listing and watching like any other door.",
    ),
    theory: [
      t(
        "API’ni har kim to‘g‘ridan-to‘g‘ri chaqira oladi: ilova cheklovlari serverda takrorlanishi shart.",
        "Anyone can call an API directly: every limit the app sets must be repeated on the server.",
      ),
    ],
    task: t(
      "Barcha savollarga to‘g‘ri javob bering.",
      "Answer every question correctly.",
    ),
    hint: t(
      "Har bir himoya qaysi kamchilikni yopishini eslang.",
      "Remember which gap each defence closes.",
    ),
    widget: {
      type: "quiz",
      questions: [
        {
          ask: t(
            "Profil javobidan passwordHash ni qanday olib tashlash kerak?",
            "How should passwordHash be kept out of the profile reply?",
          ),
          options: [
            t(
              "Serverda javob shaklini faqat kerakli maydonlar bilan belgilash",
              "Define the reply on the server with only the needed fields",
            ),
            t("Ilovada uni ko‘rsatmaslik", "Not showing it in the app"),
            t("Javobni Base64 bilan kodlash", "Encoding the reply in Base64"),
          ],
          answer: 0,
          explain: t(
            "Javobni har kim to‘liq o‘qiy oladi; filtr serverda bo‘ladi.",
            "Anyone can read the full reply; the filter lives on the server.",
          ),
        },
        {
          ask: t(
            '{"name": "Ali", "role": "admin"} yuborilganda Ali admin bo‘lib qoldi. Tuzatish?',
            'Sending {"name": "Ali", "role": "admin"} made Ali an admin. The fix?',
          ),
          options: [
            t(
              "Faqat name va bio ni o‘qiydigan allowlist",
              "An allowlist that reads only name and bio",
            ),
            t(
              "Formadan role maydonini olib tashlash",
              "Removing the role field from the form",
            ),
            t("role ni katta harf bilan yozish", "Writing role in capitals"),
          ],
          answer: 0,
          explain: t(
            "Forma bo‘lmasa ham, so‘rovni qo‘lda yuborish mumkin.",
            "Without the form the request can still be sent by hand.",
          ),
        },
        {
          ask: t(
            "Ko‘p IP’li hujumchi bitta hisobning parolini taxmin qilmoqda. Qaysi cheklov yordam beradi?",
            "An attacker with many IPs guesses one account’s password. Which limit helps?",
          ),
          options: [
            t("Hisob bo‘yicha cheklov", "A limit per account"),
            t("Faqat IP bo‘yicha cheklov", "A limit per IP only"),
            t(
              "Cheklov kerak emas, parol uzun",
              "No limit needed, the password is long",
            ),
          ],
          answer: 0,
          explain: t(
            "Hujumchi IP’larni almashtiradi, lekin hisob bitta.",
            "The attacker swaps IPs, but the account is one.",
          ),
        },
        {
          ask: t(
            "Chegaradan oshgan so‘rovga qaysi javob to‘g‘ri?",
            "Which reply suits a request over the limit?",
          ),
          options: [
            code("429 Too Many Requests"),
            code("200 OK"),
            code("500 Internal Server Error"),
          ],
          answer: 0,
          explain: t(
            "429 va Retry-After mijozga qachon qayta urinishni aytadi.",
            "429 with Retry-After tells the client when to try again.",
          ),
        },
      ],
    },
  },
];
