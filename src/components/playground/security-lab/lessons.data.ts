export type LessonType =
  | "flow"
  | "order"
  | "classify"
  | "match"
  | "frontend"
  | "auth"
  | "request"
  | "status"
  | "validate"
  | "jwt"
  | "cookies"
  | "database"
  | "sqlcrud"
  | "sql"
  | "xss"
  | "idor"
  | "surface"
  | "investigate"
  | "tasks"
  | "quiz"
  | "checkout"
  | "finalquiz"
  | "worksheet"
  | "teachback";

export interface Lesson {
  id: number;
  title: string;
  type: LessonType;
  minutes: number;
  heading: string;
  intro: string;
  task: string;
  mission: string;
  result: string;
  principle: string;
  theory: string[];
  teacher: string;
  question: string;
  real?: boolean;
  db?: boolean;
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  endpoint?: string;
  body?: Record<string, unknown>;
  mode?: "vulnerable" | "safe";
}

export interface LessonGroup {
  title: string;
  from: number;
  to: number;
}

export interface QuizQuestion {
  q: string;
  a: string[];
  correct: number;
  why: string;
}

export const GROUPS: LessonGroup[] = [
  { title: "01 · Asoslar va arxitektura", from: 1, to: 6 },
  { title: "02 · HTTP va API", from: 7, to: 14 },
  { title: "03 · Backend va identity", from: 15, to: 19 },
  { title: "04 · Database va zaifliklar", from: 20, to: 26 },
  { title: "05 · Tahlil va mustahkamlash", from: 27, to: 36 },
];

export const LESSONS: Lesson[] = [
  {
    id: 1,
    title: "Dars maqsadi",
    type: "flow",
    minutes: 3,
    heading: "Bitta so‘rovning sayohati",
    intro:
      "“Profilni ochish” tugmasidan boshlab ma’lumotning butun yo‘lini kuzating. Har bir qadamda qaysi qatlam ishlayotganini ko‘ring.",
    task: "So‘rov yo‘lini kuzating",
    mission:
      "Animatsiyani boshlang. Ma’lumot qayerda ko‘rsatilishini, tekshirilishini va saqlanishini aniqlang.",
    result: "Browser → backend → database → backend → browser oqimini tushuntira olasiz.",
    principle: "Frontend ko‘rsatadi. Backend qaror beradi. Database saqlaydi.",
    theory: [
      "Web application foydalanuvchi bilan server o‘rtasida ma’lumot almashadi. Ushbu kurs 36 kichik amaliyot orqali shu oqimni o‘rgatadi.",
      "Yakunida request va response’ni o‘qiysiz, authentication va authorizationni ajratasiz, SQLi, XSS va IDOR sababini tushuntirasiz.",
    ],
    teacher:
      "Boshlashdan oldin “Login tugmasi bosilgandan keyin nima bo‘ladi?” deb so‘rang. Dars oxirida shu savolga qayting.",
    question: "Ma’lumotni ko‘rsatish bilan uni berishga ruxsat berishning farqi nima?",
  },
  {
    id: 2,
    title: "Darsni boshlash",
    type: "order",
    minutes: 3,
    heading: "Zanjirni o‘zingiz yig‘ing",
    intro: "Quyidagi kartalarni bosib, profilni olish oqimini to‘g‘ri ketma-ketlikda joylashtiring.",
    task: "7 qadamli oqim",
    mission:
      "Browserdan boshlab javob qaytishigacha bo‘lgan zanjirni tuzing. Xato bo‘lsa, qayta boshlang.",
    result: "Request va response bir yo‘lning ikki yo‘nalishi ekanini ko‘rasiz.",
    principle: "Avval ma’lumot yo‘lini toping, keyin ishonch chegarasini tahlil qiling.",
    theory: [
      "Frontend odatda browser ichida ishlaydi; ular alohida ikkita server emas. Browser frontend kodi yordamida HTTP so‘rovini yuborishi mumkin.",
      "API backend bilan muloqot interfeysidir. Har bir request databasega murojaat qilishi shart emas.",
    ],
    teacher: "O‘quvchilarni juftliklarga ajrating. Biri request yo‘lini, ikkinchisi response yo‘lini aytsin.",
    question: "Database kerak bo‘lmaydigan requestga misol keltira olasizmi?",
  },
  {
    id: 3,
    title: "Web Application nima?",
    type: "classify",
    minutes: 3,
    heading: "Sahifami yoki application?",
    intro: "Har bir vaziyatni belgilang. Nomiga emas, foydalanuvchi qanday amal bajarayotganiga qarang.",
    task: "3 vaziyatni ajrating",
    mission: "Statik mazmun va server bilan interaktiv almashinuv orasidagi farqni toping.",
    result: "Web applicationni faqat tashqi ko‘rinishidan ajratib bo‘lmasligini tushunasiz.",
    principle: "Statik sayt ham JavaScript ishlatishi mumkin; “website” va “web app” chegarasi qat’iy emas.",
    theory: [
      "Web application browser orqali foydalaniladigan dasturdir. Ko‘p ilovalarda backend, API, ma’lumotlar ombori va business logic mavjud.",
      "Login, comment, buyurtma va profil tahrirlash serverga ma’lumot yuboradigan odatiy amallardir. Ayrim web ilovalar esa to‘liq clientda ishlaydi.",
    ],
    teacher: "Internet do‘koni mahsulot sahifasi va checkout sahifasini solishtiring.",
    question: "Faqat browserda ishlaydigan kalkulyator ham application bo‘lishi mumkinmi?",
  },
  {
    id: 4,
    title: "Uch asosiy qism",
    type: "match",
    minutes: 3,
    heading: "Vazifa qaysi qatlamniki?",
    intro: "Har bir vazifaga mos qatlamni tanlang va javobingizni tekshiring.",
    task: "Mas’uliyatni taqsimlang",
    mission: "Dizayn, ruxsat tekshiruvi va ma’lumot saqlash qayerga tegishli ekanini aniqlang.",
    result: "Frontend, backend va database vazifalarini chalkashtirmaysiz.",
    principle: "Ruxsat qarori foydalanuvchi boshqaradigan muhitda qolmasligi kerak.",
    theory: [
      "Frontend interfeysni chizadi va foydalanuvchi bilan ishlaydi. Backend input, identity, ruxsat va business logicni tekshiradi. Database ma’lumotni saqlaydi va query bajaradi.",
      "Bu konseptual arxitektura: real ilovalarda cache, CDN, queue va tashqi servislar ham bo‘lishi mumkin.",
    ],
    teacher: "Bir o‘quvchi frontend, biri backend, biri database bo‘lsin; qog‘ozda request uzating.",
    question: "Narxni hisoblashni qaysi qatlam yakuniy tekshirishi kerak?",
  },
  {
    id: 5,
    title: "Frontend",
    type: "frontend",
    minutes: 4,
    heading: "HTML, CSS va JavaScriptni ko‘ring",
    intro:
      "HTML matnini, CSS rangini va JavaScript interactionini o‘zgartiring. Yonida natijani darhol kuzating.",
    task: "Kichik login interfeysi",
    mission: "Sarlavhani almashtiring, rangni o‘zgartiring va tugmani bosing. Bu amallar serverga login qilmasligini kuzating.",
    result: "Structure, design va interaction farqi ko‘rinadi.",
    principle: "Browserdagi ko‘rinish va state foydalanuvchi nazoratida.",
    theory: [
      "HTML strukturani, CSS ko‘rinishni, JavaScript esa interaktiv xatti-harakatni belgilaydi.",
      "Password inputidagi type=\"password\" belgilarni yashiradi; bu transport shifrlanishi yoki serverdagi password hashing o‘rnini bosmaydi.",
    ],
    teacher: "DevTools → Elements orqali sarlavhani almashtiring. So‘ng sahifani yangilang.",
    question: "Button matnini “Admin” qilish sizga admin huquqini beradimi?",
  },
  {
    id: 6,
    title: "Yashirish — himoya emas",
    type: "auth",
    minutes: 5,
    heading: "Admin tugmasini ochib ko‘ring",
    intro:
      "Ali sifatida kiring. Frontenddagi admin tugmasini ko‘rsating va haqiqiy /api/admin endpointiga murojaat qiling.",
    task: "UI va ruxsatni solishtiring",
    mission: "Tugma ko‘rinsa ham server 403 qaytarishini kuzating. Keyin admin bilan kirib solishtiring.",
    result: "Frontend tekshiruvi backend authorization o‘rnini bosmasligini ko‘rasiz.",
    principle: "Admin panelini yashirish foydalanuvchi tajribasi; serverdagi permission tekshiruvi esa himoya.",
    theory: [
      'if (user.role === "admin") showAdminPanel() faqat UI holatini o‘zgartiradi. APIga UI orqali kirmasdan ham murojaat qilish mumkin.',
      "Backend har bir himoyalangan endpointda identity va tegishli ruxsatni tekshirishi kerak.",
    ],
    teacher: "O‘quvchidan tugmani ko‘rsatgandan keyin response statusini taxmin qilishni so‘rang.",
    question: "Button yashirilgan, lekin API ochiq bo‘lsa, muammo qayerda?",
  },
  {
    id: 7,
    title: "HTTP — aloqa ko‘prigi",
    type: "flow",
    real: true,
    minutes: 4,
    heading: "Request yuboring, yo‘lini ko‘ring",
    intro:
      "Haqiqiy /api/echo so‘rovi yuboriladi. Animatsiya browser va backend o‘rtasidagi almashinuvni bosqichma-bosqich tushuntiradi.",
    task: "Ikki yo‘nalishni kuzating",
    mission: "DevTools → Network’ni oching, so‘rovni yuboring va echo requestini toping.",
    result: "Animatsion tushuntirishni haqiqiy HTTP yozuvi bilan bog‘laysiz.",
    principle: "HTTPS uzatishdagi ma’lumotni himoya qiladi, serverdagi noto‘g‘ri ruxsatni tuzatmaydi.",
    theory: [
      "HTTP — client request va server response almashinadigan protokol. HTTPS — TLS bilan himoyalangan HTTP.",
      "Bu laboratoriya loopback HTTP orqali ishlaydi. Internetdagi login va session trafik uchun HTTPS kerak. Echo endpointi database ishlatmaydi.",
    ],
    teacher: "Network’da bitta requestni ochib, request URL va response statusini ko‘rsating.",
    question: "HTTPS ishlatsa ham IDOR bo‘lishi mumkinmi?",
  },
  {
    id: 8,
    title: "HTTP Request",
    type: "request",
    minutes: 5,
    method: "POST",
    endpoint: "/api/lab/echo",
    body: { username: "ali", action: "view_profile" },
    heading: "O‘z requestingizni tuzing",
    intro:
      "Method, endpoint, header va JSON body’ni o‘zgartiring. Backend aynan nimani qabul qilganini qaytaradi.",
    task: "Requestning 4 qismini toping",
    mission: "X-Lesson headerini va body ichidagi username’ni o‘zgartiring. Response’da ikkalasini ham toping.",
    result: "Method, URL, headers va body’ni alohida o‘qiy olasiz.",
    principle: "URL, headers, cookie va body — clientdan keladigan ma’lumotlar.",
    theory: [
      "Request method, URL va headerlardan iborat; ayrim metodlarda body ham bo‘ladi. Header metadata yuboradi, masalan Content-Type body formatini bildiradi.",
      "JSON body headerlardan bo‘sh qator bilan ajraladi. Ushbu panelda GET body yubormaydi; GET parametrlarini URLga yozing.",
    ],
    teacher: "Body’ga qo‘shimcha field qo‘shing. Keyin JSON vergulini buzib client xabari va server 400 javobini farqlating.",
    question: "Content-Type va Authorization bir xil vazifani bajaradimi?",
  },
  {
    id: 9,
    title: "HTTP Methods",
    type: "request",
    minutes: 7,
    method: "GET",
    endpoint: "/api/lab/posts",
    body: { title: "Yangi o‘quv posti" },
    heading: "Bitta resurs, beshta metod",
    intro: "Avval Ali sifatida kiring. So‘ng tayyor misollar yordamida post oling, yarating, yangilang va o‘chiring.",
    task: "CRUD siklini bajaring",
    mission: "POST javobidagi id’ni oling; PUT, PATCH va DELETE URLiga o‘sha id’ni qo‘ying. Oxirida GET bilan tekshiring.",
    result: "GET → POST → PUT/PATCH → DELETE amallarining natijasini ko‘rasiz.",
    principle: "Metod nomining o‘zi himoya emas. GET server holatini o‘zgartiruvchi amal uchun ishlatilmasligi kerak.",
    theory: [
      "GET resursni oladi. POST yangi resurs yaratishi yoki action bajarishi mumkin. PUT resursning yoziladigan ko‘rinishini almashtiradi; PATCH esa qisman o‘zgartiradi. DELETE resursni o‘chiradi.",
      "Bu post modelining yagona yoziladigan field’i title; id va owner_id server tomonidan boshqariladi. Shu sabab PUT hamda PATCH bu misolda o‘xshash javob beradi.",
    ],
    teacher: "201 javobidagi Location headerini toping. DELETE’dan keyin shu IDga GET yuboring.",
    question: "POST doimo yangi ma’lumot yaratadimi?",
  },
  {
    id: 10,
    title: "HTTP Response",
    type: "request",
    minutes: 4,
    method: "GET",
    endpoint: "/api/lab/profile",
    body: {},
    heading: "Javobni uch qismga ajrating",
    intro: "Avval login qilmay /api/profile’ga so‘rov yuboring. Keyin Ali sifatida kiring va qayta yuboring.",
    task: "Status, headers va body",
    mission: "Response panelidagi uchta tabni oching. 401 va 200 javoblarini solishtiring.",
    result: "Response faqat JSON emasligini tushunasiz.",
    principle: "Status umumiy natijani, headers metadata’ni, body esa kontentni olib keladi.",
    theory: [
      "HTTP response status, headers va ixtiyoriy body’dan iborat. JSON, HTML, rasm yoki bo‘sh body qaytishi mumkin.",
      "Browserdagi fetch HTTP 4xx/5xx javoblarida ham response beradi; ularni status yoki response.ok orqali tekshirish kerak.",
    ],
    teacher: "Response’da Content-Type va X-Lab-Mode headerini topishni topshiring.",
    question: "401 javobida ham JSON body bo‘lishi mumkinmi?",
  },
  {
    id: 11,
    title: "HTTP Status Codes",
    type: "status",
    minutes: 4,
    heading: "Server qaysi javobni qaytaradi?",
    intro:
      "Statusni tanlang va haqiqiy response oling. 301/302 tanlanganda browser redirectga ergashadi — zanjir Network’da ko‘rinadi.",
    task: "Status oilalarini o‘rganing",
    mission: "200, 400, 401, 403, 404 va 500 yuboring. So‘ng 302 ni yuborib redirectni kuzating.",
    result: "2xx, 3xx, 4xx va 5xx farqini izohlaysiz.",
    principle: "Status code signal beradi; xavfsizlik qarorining o‘zi server logic’ida bajariladi.",
    theory: [
      "1xx — oraliq ma’lumot, 2xx — muvaffaqiyat, 3xx — redirect, 4xx — client bilan bog‘liq xato, 5xx — server xatosi.",
      "Bu panel statuslarni ataylab hosil qiladi. Masalan 500 haqiqiy server nosozligi emas, darsdagi misoldir. 1xx yakuniy response sifatida bu panelda yuborilmaydi.",
    ],
    teacher: "O‘quvchilarga natijani ko‘rsatmasdan oldin status oilasini taxmin qildiring.",
    question: "Login kerak bo‘lganda 401mi yoki 500mi?",
  },
  {
    id: 12,
    title: "401 va 403 farqi",
    type: "auth",
    minutes: 5,
    heading: "Mehmon → user → admin",
    intro: "Uch holatda /api/admin so‘rovini yuboring: logout, Ali bilan login va admin bilan login.",
    task: "401 / 403 / 200 ni oling",
    mission: "Tizimdan chiqing va admin API’ni chaqiring. Keyin Ali, so‘ng admin bilan qaytaring.",
    result: "Bir endpoint turli identity uchun turli javob qaytarishini ko‘rasiz.",
    principle: "401 — yaroqli credentials yetishmaydi. 403 — server amalni bajarishni rad etdi.",
    theory: [
      "401 yaroqli authentication ma’lumoti yo‘qligini bildiradi; odatda WWW-Authenticate headeri bilan keladi.",
      "403 server so‘rovni tushungan, ammo bajarishni rad etganini bildiradi. Ko‘pincha ruxsat yetishmaydi; bu har doim foydalanuvchi albatta login qilgan degani emas. Resurs mavjudligini yashirish uchun ayrim tizimlar 404 qaytaradi.",
    ],
    teacher: "Jadval tuzing: guest → 401; ali → 403; admin → 200. Bu aynan bizning endpoint siyosatimiz ekanini ayting.",
    question: "401 nomi “Unauthorized” bo‘lsa ham nega authentication bilan bog‘liq?",
  },
  {
    id: 13,
    title: "Browser DevTools",
    type: "request",
    minutes: 5,
    method: "POST",
    endpoint: "/api/lab/echo?lesson=13",
    body: { message: "Network orqali meni toping" },
    heading: "Network detektivi",
    intro: "F12 → Network → Fetch/XHR. So‘rov yuboring va echo?lesson=13 yozuvini oching.",
    task: "7 ta dalilni toping",
    mission:
      "Method, URL, headers, payload, status, response va cookies bo‘limini tekshiring. Topganlaringizni shaxsiy qaydlarga yozing.",
    result: "Interfeys va tarmoqda ko‘rinayotgan ma’lumotni bog‘laysiz.",
    principle: "UI ma’lumotni yashirishi mumkin; browser qabul qilgan response esa foydalanuvchiga yetib kelgan.",
    theory: [
      "Network tab request va response’ni ko‘rsatadi. Reload yoki action request hosil qiladi. Preserve log redirectlarni kuzatishda foydali.",
      "HttpOnly cookie JavaScriptga ochilmaydi, lekin egasi DevTools’da ko‘rishi mumkin. Set-Cookie fetch orqali o‘qiladigan oddiy response header emas.",
    ],
    teacher: "Filter’ga echo yozing. Request Payload va Response tablarini adashtirmaslikni ko‘rsating.",
    question: "Response’da yashirin maydon qaytsa, uni frontendda chizmaslik himoyami?",
  },
  {
    id: 14,
    title: "API nima?",
    type: "request",
    minutes: 4,
    method: "GET",
    endpoint: "/api/lab/posts",
    body: {},
    heading: "Interfeys ortidagi interfeys",
    intro:
      "Postlar API’sini va himoyalangan profil API’sini chaqiring. URLni o‘zgartirib natijalarni taqqoslang.",
    task: "Ochiq va yopiq endpoint",
    mission: "/api/posts, /api/profile va /api/not-found manzillariga GET yuboring.",
    result: "Endpointning mavjudligi bilan unga kirish ruxsatini ajratasiz.",
    principle: "Har bir endpoint tekshirish kerak bo‘lgan kirish nuqtasi hisoblanadi.",
    theory: [
      "API — dastur bilan muloqot qilish uchun belgilangan interfeys. Web API ko‘pincha HTTP endpointlari orqali ishlaydi.",
      "API alohida server bo‘lishi shart emas; bu loyihada /api/* yo‘llarini bitta backend bajaradi.",
    ],
    teacher: "UI bo‘lmasa ham ushbu panel orqali API bilan ishlash mumkinligini ko‘rsating.",
    question: "API endpointini bilish uning ma’lumotiga ruxsat beradimi?",
  },
  {
    id: 15,
    title: "Backend",
    type: "validate",
    minutes: 4,
    heading: "Frontendni chetlab, serverni sinang",
    intro: "Yosh qiymatini JSON orqali yuboring. Browserdagi input cheklovlari backend o‘rnini bosa olmasligini ko‘ring.",
    task: "Input validation",
    mission: '25, -5 va "yigirma" qiymatlarini yuboring. Serverning status va xato xabarini taqqoslang.',
    result: "Noto‘g‘ri input backendda rad etilishini ko‘rasiz.",
    principle: "Tekshirilmagan input business logic yoki databasega o‘tmasligi kerak.",
    theory: [
      "Backend requestni qabul qiladi, inputni tekshiradi, authentication va authorizationni qo‘llaydi, business logicni bajaradi hamda response yuboradi.",
      "Validation input shakli va diapazonini tekshiradi. Authorization esa kim qaysi amalni bajarishi mumkinligini tekshiradi; ikkalasi alohida nazoratdir.",
    ],
    teacher: 'type="number" bo‘lsa ham to‘g‘ridan-to‘g‘ri JSON orqali matn yuborish mumkinligini ko‘rsating.',
    question: "Yosh to‘g‘ri formatda bo‘lishi profilni o‘zgartirishga ruxsat beradimi?",
  },
  {
    id: 16,
    title: "Authentication",
    type: "auth",
    minutes: 5,
    heading: "Backend sizni qanday taniydi?",
    intro: "Noto‘g‘ri parol, keyin to‘g‘ri parol bilan kiring. Login javobi va undan keyingi profil so‘rovini kuzating.",
    task: "Login sikli",
    mission: "ali / xato bilan, so‘ng ali / ali123 bilan kiring. /api/profile orqali identity’ni tekshiring.",
    result: "Credentials tekshiruvi va session yaratilishini ko‘rasiz.",
    principle: "Passwordlar qayta ochiladigan oddiy matn sifatida saqlanmasligi kerak.",
    theory: [
      "Authentication foydalanuvchining kimligini tekshiradi. Bu laboratoriya passwordni PBKDF2 hash bilan solishtiradi va vaqtinchalik cookie session hamda JWT yaratadi.",
      "Demo credentials hammaga ma’lum. Production tizimida noyob salt, mos password hashing parametrlari, MFA va mustahkam rate limiting kabi choralar ham kerak. Bu laboratoriyadagi limit faqat bir browser lab sessiyasi doirasida.",
    ],
    teacher: "5 marta xato kirib 429 holatini ko‘rsating. 30 soniyalik Retry-After mazmunini tushuntiring.",
    question: "Login muvaffaqiyatli bo‘lsa, istalgan resurs ochiladimi?",
  },
  {
    id: 17,
    title: "Authorization",
    type: "auth",
    minutes: 5,
    heading: "Bir xil amal, turli ruxsat",
    intro: "Ali va admin hisoblari orqali profile hamda admin endpointlarini chaqiring.",
    task: "Permission jadvalini tekshiring",
    mission: "Ali → profile, Ali → admin, admin → admin natijalarini yozing.",
    result: "Identity tekshiruvini ruxsat tekshiruvidan ajratasiz.",
    principle: "Ruxsatlar har requestda, kerak bo‘lsa aynan object darajasida tekshiriladi.",
    theory: [
      "Authorization foydalanuvchi qaysi resursga qanday amal bajara olishini tekshiradi. Role-based tekshiruvning o‘zi ownership talabi bo‘lgan resurslar uchun yetarli emas.",
      "Masalan admin barcha profillarni ko‘rishi mumkin, oddiy user esa faqat o‘z shaxsiy profilini. Siyosat application talablari bilan belgilanadi.",
    ],
    teacher: "“Kim?” va “Nima mumkin?” yozilgan ikkita ustun chizing.",
    question: "User roli borligi boshqa userning maxfiy profilini ochishga yetadimi?",
  },
  {
    id: 18,
    title: "JWT",
    type: "jwt",
    minutes: 6,
    heading: "Tokenni o‘qing va tekshiring",
    intro:
      "Login qilib haqiqiy imzolangan JWT oling. Payloadni o‘qing, keyin tokenning bir belgisini o‘zgartirib serverga yuboring.",
    task: "Decode ≠ verify",
    mission: "Asl token bilan 200, buzilgan token bilan 401 oling. Payload ichidagi exp va sub’ni toping.",
    result: "O‘qiladigan payload va tekshiriladigan imzoning farqini ko‘rasiz.",
    principle: "JWT token formati, cookie esa browserning saqlash/yuborish mexanizmi. JWT cookie ichida ham saqlanishi mumkin.",
    theory: [
      "Bu laboratoriya HS256 imzoli JWT ishlatadi: header.payload.signature. Header va payload base64url bilan kodlangan; bu shifrlash emas. JWT boshqa ko‘rinishlarda, jumladan shifrlangan shaklda ham bo‘lishi mumkin.",
      "Server algoritm, imzo, exp, issuer va audience’ni tekshiradi. Token kimlikni beradi; resource authorization alohida tekshiriladi. Logout cookie sessiyasini tugatadi, allaqachon berilgan JWT esa exp’gacha yaroqli qoladi.",
    ],
    teacher: "Payloadga role yozish bilan haqiqiy ruxsat berilmasligini tushuntiring. Bizning server rolni o‘z account ma’lumotidan oladi.",
    question: "Base64url decode qilish signature verify qilish deganimi?",
  },
  {
    id: 19,
    title: "Cookie",
    type: "cookies",
    minutes: 5,
    heading: "Browser sessionni o‘zi yuboradi",
    intro: "Login qiling va profil requestini yuboring. Authorization headerisiz ham cookie orqali identity aniqlanadi.",
    task: "Cookie flaglarini kuzating",
    mission: "DevTools → Application → Cookies va Network → login → Headers’ni oching. HttpOnly, SameSite va Max-Age’ni toping.",
    result: "Set-Cookie va Cookie headerlari turli yo‘nalishda ketishini ko‘rasiz.",
    principle: "HttpOnly XSSni yo‘qotmaydi. SameSite esa barcha holatda to‘liq CSRF himoyasi o‘rnini bosmaydi.",
    theory: [
      "Server Set-Cookie bilan cookie beradi. Browser domain, path, SameSite va boshqa qoidalarga mos kelganda uni Cookie headerida avtomatik yuboradi.",
      "HttpOnly JavaScript orqali o‘qishni cheklaydi. Secure HTTPS orqali yuborishni talab qiladi (localhost uchun browser istisnolari bo‘lishi mumkin). Bu HTTP labda Secure qo‘yilmagan. SameSite cross-site cookie yuborilishini cheklaydi.",
    ],
    teacher: "document.cookie’da session ko‘rinmasligi va Network’da yuborilishi mumkinligini solishtiring.",
    question: "Cookie va JWT o‘zaro muqobil bo‘lishi shartmi?",
  },
  {
    id: 20,
    title: "Database",
    type: "database",
    minutes: 3,
    heading: "Ma’lumotlar jadvaliga qarang",
    intro: "Backend orqali vaqtinchalik SQLite users jadvalini oling. Qator va ustunlarni ajrating.",
    task: "Schema’ni o‘qing",
    mission: "Ali foydalanuvchisining id, role va email maydonlarini toping. Bu ma’lumotlarni qaysi endpoint qaytarganini kuzating.",
    result: "Browser SQL emas, HTTP yuborayotganini ko‘rasiz.",
    principle: "Database credentials frontendga berilmaydi; ma’lumotga kirish backendda nazorat qilinadi.",
    theory: [
      "Database ma’lumotlarni saqlaydi va olishni tashkil qiladi. Relational bazalarda jadval, qator, ustun va munosabatlar ishlatiladi.",
      "MySQL, PostgreSQL va SQLite relational bazalar. MongoDB hujjatlar asosidagi boshqa modeldan foydalanadi. Ushbu demo jadvali har o‘qishda vaqtinchalik SQLite nusxasida yaratiladi.",
    ],
    teacher: "SQL ustun nomini JSON key va interfeysdagi table header bilan bog‘lang.",
    question: "Barcha database’lar SQL ishlatadimi?",
  },
  {
    id: 21,
    title: "SQL",
    type: "sqlcrud",
    minutes: 5,
    heading: "SELECT, INSERT, UPDATE, DELETE",
    intro: "Operatsiyani tanlang. Backend uni yangi SQLite nusxasida bajaradi va “oldin / keyin” jadvallarini qaytaradi.",
    task: "To‘rtta operatsiyani bajaring",
    mission: "INSERT’da yangi qator, UPDATE’da o‘zgargan username, DELETE’da yo‘qolgan qatorni toping.",
    result: "SQL ma’lumot ustida qanday amal bajarishini ko‘rasiz.",
    principle: "UPDATE va DELETE’da WHERE qaysi qatorlar o‘zgarishini belgilaydi.",
    theory: [
      "SELECT ma’lumotni oladi, INSERT qo‘shadi, UPDATE yangilaydi, DELETE o‘chiradi. WHERE shartni belgilaydi.",
      "Har bir tugma yangi fixture bazada ishlaydi: bu yerda amallar ketma-ket saqlanmaydi. HTTP methods bo‘limidagi postlar esa lab sessiyasi davomida saqlanadi.",
    ],
    teacher: "DELETE’da WHERE bo‘lmasa qanday oqibat bo‘lishini konseptual tushuntiring.",
    question: "SELECT va DELETE bir xil WHERE shartiga ega bo‘lsa ham nima farq qiladi?",
  },
  {
    id: 22,
    title: "Backend va Database",
    type: "flow",
    real: true,
    db: true,
    minutes: 4,
    heading: "HTTP SQLga qayerda aylanadi?",
    intro: "So‘rov yuboring. Backend SQLite jadvalidan ma’lumot olib JSON qaytaradi; animatsiya har bir chegarani ko‘rsatadi.",
    task: "Ikki xil protokol",
    mission: "Network’da /api/database’ni toping. Browser SQL connection ochmaganini tushuntiring.",
    result: "HTTP almashinuvi va backendning SQL query’sini ajratasiz.",
    principle: "Backend databasega kirishni boshqaradigan nazorat nuqtasi.",
    theory: [
      "Odatiy arxitekturada browser → HTTP → backend → SQL → database oqimi bor. Backend natijani JSON yoki HTML qilib qaytaradi.",
      "Databasega to‘g‘ridan-to‘g‘ri murojaat qilayotgandek ko‘ringan browser SDK’lari ham odatda boshqariladigan API va access policy orqali ishlaydi.",
    ],
    teacher: "Serverdagi SELECT va browserdagi GET turli darajadagi amallar ekanini ko‘rsating.",
    question: "Browserga qaytgan JSON asl SQL queryning o‘zi bo‘ladimi?",
  },
  {
    id: 23,
    title: "SQL Injection",
    type: "sql",
    mode: "vulnerable",
    minutes: 6,
    heading: "Input queryga aralashganda",
    intro: "Oddiy username va tayyor laboratoriya inputini sinang. Query tuzilishi hamda qaytgan qatorlar sonini solishtiring.",
    task: "Sababni ko‘ring",
    mission: "Zaif rejimda ali, keyin tayyor input bilan yuboring. So‘ng shu inputni himoyalangan rejimda qaytaring.",
    result: "Qiymat query strukturasiga aylanishi mumkinligini tushunasiz.",
    principle: "SQLi “database kasalligi” emas — queryni xavfsiz bo‘lmagan tarzda qurish oqibatidir.",
    theory: [
      "User input SQL matniga interpolatsiya qilinsa, ma’lumot query sintaksisiga aralashishi mumkin. Ushbu lab faqat sun’iy jadvalda SELECT bajaradi.",
      "Ta’sir query va database ruxsatlariga bog‘liq. Xato matnini production response’da ochish ham ma’lumot sizishiga sabab bo‘lishi mumkin.",
    ],
    teacher: "Querydagi yopuvchi quote va qolgan shartni rangsiz bo‘lsa ham alohida o‘qing.",
    question: "Nega input validationning o‘zi SQLi uchun asosiy kafolat emas?",
  },
  {
    id: 24,
    title: "SQL Injection’dan himoya",
    type: "sql",
    mode: "safe",
    minutes: 5,
    heading: "SQL va qiymatni ajrating",
    intro: "Prepared query’da ? placeholder va parameters alohida yuboriladi. Bir xil inputni ikkala rejimda taqqoslang.",
    task: "Parameterized query",
    mission: "Tayyor input himoyalangan rejimda nega 0 qator qaytarishini izohlang; ali bilan 1 qator oling.",
    result: "Query strukturasi o‘zgarmayotganini ko‘rasiz.",
    principle: "ORM ichidagi xavfsiz bo‘lmagan raw SQL ham SQLi keltirib chiqarishi mumkin.",
    theory: [
      "Parameterized query query strukturasini qiymatlardan ajratadi. Ushbu SQLite misoli db.execute(sql, (username,)) usulidan foydalanadi.",
      "Parametrlar odatda qiymatlar uchun; table yoki column nomlarini parametr o‘rniga qo‘yish mumkin emas. Dinamik identifikatorlar zarur bo‘lsa, ruxsat etilgan ro‘yxatdan tanlanadi.",
    ],
    teacher: "Query bir xil qolib, parameters maydoni o‘zgarishini ko‘rsating.",
    question: "ORM bor ekan, raw SQLni qanday yozishning farqi yo‘qmi?",
  },
  {
    id: 25,
    title: "XSS",
    type: "xss",
    minutes: 7,
    heading: "Matnmi yoki bajariladigan kontent?",
    intro: "Bitta inputni xavfsiz text render va zaif HTML render orqali solishtiring. Uchta XSS oqimini alohida tanlang.",
    task: "Source → sink yo‘lini toping",
    mission: "Tayyor zararsiz payloadni joylang. DOM, reflected va stored oqimlarini sinang; faqat sandbox oynasidagi natijani kuzating.",
    result: "Stored/reflected ma’lumot oqimini, DOM esa browserdagi xavfli sinkni ta’riflashini tushunasiz.",
    principle: "HTML kontekstida textContent va escaping; HTMLga ehtiyoj bo‘lsa mos sanitization. CSP qo‘shimcha qatlamdir.",
    theory: [
      "XSS attacker-controlled kontent script sifatida bajarilganda yuz beradi. Stored kontent avval saqlanadi, reflected requestdan responsega qaytadi, DOM-based esa client JavaScript xavfli DOM sink ishlatganda yuz beradi. Bu tasniflar kesishishi mumkin.",
      "Ushbu mashq alohida origin huquqisiz sandbox iframe ichida ishlaydi. Asosiy interfeys natijalarni textContent orqali chizadi. Oddiy escaping barcha kontekstlar uchun bir xil emas.",
    ],
    teacher: "Payloadni oddiy comment deb saqlash va keyin HTML sifatida ko‘rsatish orasidagi ishonch xatosini topishni so‘rang.",
    question: "Stored XSSda zararli matn databasega tushishi bilan script bajariladimi?",
  },
  {
    id: 26,
    title: "IDOR / Broken Access Control",
    type: "idor",
    minutes: 6,
    heading: "15 sizniki. 16-chi?",
    intro: "Ali sifatida kiring. Profil ID’sini o‘zgartiring va object-level authorization yoqilgan hamda o‘chirilgan rejimlarni taqqoslang.",
    task: "Object ruxsatini tekshiring",
    mission: "Ali bilan 15 → 200, 16 → 403 oling. Zaif rejimda 16 qaytishini kuzating.",
    result: "Boshqa ID mavjudligi ruxsat degani emasligini tushunasiz.",
    principle: "Tasodifiy UUID taxminni qiyinlashtiradi, lekin authorization o‘rnini bosmaydi.",
    theory: [
      "IDOR foydalanuvchi boshqaradigan object ID bo‘yicha kirishda ruxsat yetarli tekshirilmaganda yuz beradi. Bu Broken Access Controlning bir ko‘rinishi.",
      "Public profilni ko‘rishning o‘zi zaiflik emas: muammo amaldagi maxfiylik va ruxsat siyosati buzilishidadir. Bu labda profil ma’lumotlari faqat egasi yoki adminga ochiq bo‘lishi kerak.",
    ],
    teacher: "User ID’ni yashirish va serverda ownership tekshirish farqini muhokama qiling.",
    question: "Server “user login qilganmi?” deb tekshirishi yetadimi?",
  },
  {
    id: 27,
    title: "Attack Surface",
    type: "surface",
    minutes: 5,
    heading: "Ishonch chegaralari xaritasi",
    intro: "Kirish nuqtasini tanlang. Inputning yo‘li, ehtimoliy muammo va asosiy himoyani ko‘ring.",
    task: "4 kirish nuqtasini tahlil qiling",
    mission: "Comment, resource ID, login va search’ni oching. Har biriga “input → ishlatiladigan joy → himoya” zanjirini ayting.",
    result: "Zaiflikni bitta qatlamga qamab qo‘ymasdan oqim bo‘yicha ko‘rasiz.",
    principle: "XSS serverdagi renderingdan, SQLi backend query qurilishidan kelishi mumkin; oqimni to‘liq tekshiring.",
    theory: [
      "Attack surface — tizimga ta’sir qilish mumkin bo‘lgan kirish nuqtalari va chegaralar yig‘indisi. URL, JSON, headers, uploads, cookies hamda tashqi integratsiyalar kiradi.",
      "Zaifliklarning qatlamlarga taqsimoti qat’iy emas. Muammo ko‘pincha bir qatlam ma’lumotini keyingisi noto‘g‘ri talqin qilganda paydo bo‘ladi.",
    ],
    teacher: "Upload endpointi uchun o‘quvchilardan yangi zanjir tuzishni so‘rang: type, size, storage, rendering.",
    question: "Admin uchun yopiq endpoint ham attack surface’ga kiradimi?",
  },
  {
    id: 28,
    title: "Researcher qanday fikrlaydi?",
    type: "investigate",
    minutes: 4,
    heading: "Funksiyadan ishonch savoliga",
    intro: "Application funksiyasini tanlang va eng foydali tekshiruv savolini toping.",
    task: "To‘g‘ri savol bering",
    mission: "Login, comment va checkout vaziyatlarini yeching. Savol qaysi server tekshiruviga olib borishini izohlang.",
    result: "“Ishlayaptimi?” savolidan “Kimga va qanday shart bilan?” savoliga o‘tasiz.",
    principle: "Security tahlilida ruxsat, scope va sun’iy test ma’lumotlari aniq bo‘ladi.",
    theory: [
      "Security researcher ma’lumot manbai, transformatsiyasi, sink va ruxsat shartlarini kuzatadi. Inputni qabul qilishning o‘zi xato emas; undan qanday foydalanish muhim.",
      "Taxminni request/response dalili bilan tekshiring. Bu kursdagi tajribalar faqat lokal o‘quv muhitiga tegishli.",
    ],
    teacher: "Har bir guruhga bitta feature bering; kamida bitta authentication, authorization va data handling savoli chiqarsin.",
    question: "Checkoutda client yuborgan price’ga ishonish qanday muammo keltiradi?",
  },
  {
    id: 29,
    title: "Mini Social Network tahlili",
    type: "request",
    minutes: 8,
    method: "GET",
    endpoint: "/api/lab/posts",
    body: {},
    heading: "Kichik application auditi",
    intro: "Bitta lokal applicationning login, profile, posts, comments va admin endpointlarini tekshiring.",
    task: "Endpoint xaritasini tuzing",
    mission: "Ochiq endpointlarni, login talab qiladiganlarini va admin talab qiladiganlarini yozing. Har bir xulosaga status bilan dalil keltiring.",
    result: "Isolated misollarni bitta application oqimiga bog‘laysiz.",
    principle: "API qaytaradigan har bir field foydalanuvchiga oshkor bo‘lgan ma’lumotdir.",
    theory: [
      "Bu mini applicationda login, profile, users/:id, posts, comments va admin endpointlari bor. Register va file upload bu laboratoriya scope’iga kirmaydi.",
      "Postlar va commentlar browserga ajratilgan server xotirasida turadi. User katalogi sun’iy SQLite fixture; parollar va sessionlar unda qaytmaydi.",
    ],
    teacher: "Tahlil natijasini “endpoint, method, identity, status, xulosa” ustunlarida yozdiring.",
    question: "200 javobining o‘zi zaiflik isbotimi?",
  },
  {
    id: 30,
    title: "Amaliy mashg‘ulot",
    type: "tasks",
    minutes: 12,
    heading: "To‘rtta mustaqil missiya",
    intro: "Quyidagi mashqlarni yakunlang. Har biri tegishli laboratoriyaga olib boradi; natijani qaydlarga yozing.",
    task: "Dalil yig‘ing",
    mission: "Network, API, access control va data flow bo‘yicha bittadan natija yozing.",
    result: "Method, endpoint, status va izohdan iborat kichik hisobotga ega bo‘lasiz.",
    principle: "Kuzatish → taxmin → ruxsatli test → dalil → xulosa.",
    theory: [
      "Mashqlarda faqat ushbu localhost muhiti ishlatiladi. Har bir natijani request va response bilan bog‘lang.",
      "Murakkabroq amaliyot uchun o‘qituvchi OWASP Juice Shop kabi maxsus labni alohida tayyorlashi mumkin. Ushbu loyiha o‘zining kichik laboratoriyasini beradi.",
    ],
    teacher: "10 daqiqa ish, 2 daqiqa juftlikdagi hisobot. “Nimani kuzatdingiz?” savoliga aniq dalil so‘rang.",
    question: "Xulosangizni boshqa o‘quvchi qanday qayta tekshirishi mumkin?",
  },
  {
    id: 31,
    title: "Savol va javoblar",
    type: "quiz",
    minutes: 7,
    heading: "Bilimingizni tekshiring",
    intro: "10 savol. Javobni tanlaganingizdan so‘ng sababini o‘qing. Natija shu browserda saqlanadi.",
    task: "10 ta tushunchani mustahkamlang",
    mission: "Savollarga javob bering. Xato javob mavzusiga qaytib, amaliyotni qayta ko‘ring.",
    result: "Frontend, auth, SQLi, XSS va IDOR bo‘yicha o‘zingizni baholaysiz.",
    principle: "Termin yodlashdan ko‘ra sabab va himoyani tushuntirish muhim.",
    theory: [
      "Bu tekshiruv asosiy mental model va ishonch qarorlariga qaratilgan. Ball sizning hozirgi tushunishingizni ko‘rsatadi.",
      "Javobdan keyingi izohni o‘qing. Xato javob keyingi mashqni tanlash uchun yo‘l ko‘rsatadi.",
    ],
    teacher: "Javobni aytishdan oldin o‘quvchidan “Nega?” deb so‘rang.",
    question: "Qaysi tushunchani misol bilan tushuntirish sizga qiyin bo‘ldi?",
  },
  {
    id: 32,
    title: "Asosiy mental model",
    type: "match",
    minutes: 4,
    heading: "Kim qaysi savolga javob beradi?",
    intro: "Qatlamlar va ularning savollarini moslang. Keyin bitta login misolida izohlang.",
    task: "Modelni mustahkamlang",
    mission: '“Nimani ko‘rsataman?”, “Nima qilish mumkin?”, “Qayerda saqlanadi?” savollarini joylashtiring.',
    result: "Arxitekturani qisqa va aniq tushuntira olasiz.",
    principle: "Securityning markaziy savoli — kim nimaga, qaysi dalil asosida ishonadi?",
    theory: [
      "Frontend — ko‘rsatish va interaction; HTTP — aloqa; API — interfeys; backend — business logic va ruxsat; database — saqlash.",
      "Authentication identity, authorization esa resurs va amal ruxsatini tekshiradi. Bu ikki nazorat bir-birining o‘rnini bosmaydi.",
    ],
    teacher: "Doska tozalang va o‘quvchilardan diagrammani xotiradan chizishni so‘rang.",
    question: "Qaysi chegarada foydalanuvchi nazoratidagi ma’lumot serverga kiradi?",
  },
  {
    id: 33,
    title: "Never trust user input",
    type: "checkout",
    minutes: 5,
    heading: "Narxni 1 so‘m qilib yuboring",
    intro: "Client narxi va miqdorni o‘zgartiring. Backend narxni o‘z katalogidan olishini kuzating.",
    task: "Business logicni sinang",
    mission: "price=1 bilan, keyin quantity=-2 bilan yuboring. Birinchida to‘g‘ri jami, ikkinchida 400 javobini oling.",
    result: "Input shakli va business qoidalari alohida tekshirilishini ko‘rasiz.",
    principle: "“Ishonma” — hamma inputni rad etish emas; har bir qiymatni vazifasiga mos tekshirish.",
    theory: [
      "URL, headers, cookies, JSON, files va frontend state client nazoratida bo‘lishi mumkin. Har field’ga nima ma’noda ishonish mumkinligini aniq belgilang.",
      "Validate, authenticate, authorize, mos output encoding va xavfsiz database access bir-birini to‘ldiradi. Narx va rol kabi muhim qiymatlar server manbasidan olinadi.",
    ],
    teacher: "Narx format jihatdan to‘g‘ri bo‘lsa ham noto‘g‘ri bo‘lishi mumkinligini muhokama qiling.",
    question: "price=1 valid son. Nega backend undan hisoblamaydi?",
  },
  {
    id: 34,
    title: "Dars yakuniy xulosasi",
    type: "finalquiz",
    minutes: 4,
    heading: "Zaiflik → sabab → himoya",
    intro: "Uchta vaziyat uchun to‘g‘ri himoyani tanlang. Application oqimi bilan izohlang.",
    task: "3 ta himoyani joylashtiring",
    mission: "SQLi, XSS va IDOR misollariga mos asosiy himoyani toping.",
    result: "Zaiflik nomidan amaliy nazoratga o‘ta olasiz.",
    principle: "Himoya zaiflik yuzaga keladigan ishonch xatosini bartaraf etishi kerak.",
    theory: [
      "SQLi uchun query va qiymat ajratiladi. XSS uchun kontekstga mos xavfsiz rendering ishlatiladi. IDOR uchun har bir object bo‘yicha ruxsat tekshiriladi.",
      "Bu choralar to‘liq security dasturining faqat bir qismi: transport, session, dependency, monitoring va business logic nazoratlari ham muhim.",
    ],
    teacher: "Har bir himoya uchun “Nega aynan shu?” savolini bering.",
    question: "Parameterized query IDORni ham tuzatadimi?",
  },
  {
    id: 35,
    title: "Uyga vazifa",
    type: "worksheet",
    minutes: 10,
    heading: "O‘z arxitektura hisobotingiz",
    intro: "Ruxsat berilgan labni tanlang va shaklni to‘ldiring. Markdown fayl qilib yuklab olish mumkin.",
    task: "Mini tahlil yozing",
    mission: "Frontend, backend, API, database, auth, request, response va attack surface’ni yozing. Bilmagan joyga taxmin deb belgi qo‘ying.",
    result: "Tekshiriladigan dalillarga ega shaxsiy hisobot tayyor bo‘ladi.",
    principle: "Browserdan ko‘rinmagan backend texnologiyasini fakt deb yozmang; noma’lum deb belgilang.",
    theory: [
      "Hisobotda scope va ruxsat, kuzatilgan arxitektura, request/response dalillari hamda ehtimoliy risklar yoziladi.",
      "“Potential attack surface” tasdiqlangan vulnerability degani emas. Dalil bo‘lmasa, taxmin va keyingi tekshiruv savolini yozing.",
    ],
    teacher: "Baholash: oqim 3 ball, auth farqi 2 ball, HTTP dalili 3 ball, risk va himoya 2 ball.",
    question: "Hisobotingizda kuzatilgan fakt bilan taxmin aniq ajratilganmi?",
  },
  {
    id: 36,
    title: "O‘qituvchi uchun yakun",
    type: "teachback",
    minutes: 5,
    heading: "60 soniyada tushuntirib bering",
    intro: "Taymerni boshlang va web application oqimini ovoz chiqarib tushuntiring. Checklist orqali o‘zingizni baholang.",
    task: "Bilimni boshqaga yetkazing",
    mission: "Browserdan databasegacha oqim, ikki auth tushunchasi va bitta zaiflik sababini tushuntiring.",
    result: "O‘quvchi terminlarni emas, ishlash modelini tushuntirib bera oladi.",
    principle: "Avval application flow. Keyin shu flow ichidagi vulnerability.",
    theory: [
      "Darsning eng muhim natijasi — ma’lumot oqimi va ishonch chegaralari bo‘yicha barqaror mental model.",
      "Keyingi darslar SQLi, XSS, access control, session va boshqa mavzularni shu model ustida chuqurlashtirishi mumkin.",
    ],
    teacher: "Yakuniy teach-back’ni yozma yoki og‘zaki oling. Boshlang‘ich savolga qayting: “Login bosilgandan keyin nima bo‘ladi?”",
    question: "O‘quvchi oqimning qaysi qismida hali chalkashyapti?",
  },
];

export const QUIZ: QuizQuestion[] = [
  {
    q: "Nega frontendga xavfsizlik qarorini topshirib bo‘lmaydi?",
    a: ["Uni foydalanuvchi o‘zgartira oladi", "U faqat CSSdan iborat", "U internetga ulanmaydi"],
    correct: 0,
    why: "Frontend client qurilmasida ishlaydi. Requestlarni UI tekshiruvlarisiz ham yuborish mumkin.",
  },
  {
    q: "Authentication nimani aniqlaydi?",
    a: ["Qaysi rang chiroyli", "Foydalanuvchi kimligini", "SQL jadval nomini"],
    correct: 1,
    why: "Authentication identity’ni tekshiradi; authorization esa ruxsatni.",
  },
  {
    q: "Ali login qilgan, lekin /api/admin rad etildi. Qaysi nazorat ishladi?",
    a: ["CSS", "Authentication o‘chirildi", "Authorization"],
    correct: 2,
    why: "Identity mavjud, ammo admin amali uchun permission yo‘q.",
  },
  {
    q: "Yaroqli credentials yo‘q. Himoyalangan API uchun odatiy javob?",
    a: ["201", "401", "500"],
    correct: 1,
    why: "401 — yaroqli authentication credentials yetishmayapti.",
  },
  {
    q: "Database bilan odatda qaysi qism bevosita ishlaydi?",
    a: ["Backend", "CSS", "Browser address bar"],
    correct: 0,
    why: "Backend databasega query yuboradi va natijani HTTP response qiladi.",
  },
  {
    q: "SQL Injectionning asosiy sababi?",
    a: ["SQL juda tezligi", "Jadval katta ekanligi", "Inputning query strukturasiga aralashishi"],
    correct: 2,
    why: "Parameterized query qiymat va SQL tuzilishini ajratadi.",
  },
  {
    q: "XSS qachon yuz beradi?",
    a: [
      "Har qanday comment yozilganda",
      "Ishonchsiz kontent browserda executable script bo‘lganda",
      "Server 404 qaytarganda",
    ],
    correct: 1,
    why: "Kontent xavfli rendering sinkiga yetganda browser uni kod sifatida talqin qilishi mumkin.",
  },
  {
    q: "User 15 user 16 maxfiy profilini ko‘ryapti. Yetishmagan nazorat?",
    a: ["Object-level authorization", "Font o‘lchami", "GET o‘rniga POST"],
    correct: 0,
    why: "Server aynan shu resursni so‘ragan identity’ga berish mumkinligini tekshirishi kerak.",
  },
  {
    q: "JWT payloadini decode qilish nimani isbotlaydi?",
    a: ["Token albatta yaroqli", "User albatta admin", "Faqat payload o‘qilganini"],
    correct: 2,
    why: "Decode imzo, expiration, issuer yoki audience’ni tekshirmaydi.",
  },
  {
    q: "HttpOnly cookie nimani cheklaydi?",
    a: ["Databasega SQL yuborishni", "JavaScript orqali cookie o‘qishni", "Har qanday XSSni"],
    correct: 1,
    why: "HttpOnly cookie o‘qishni cheklaydi; XSS baribir foydalanuvchi nomidan amallar qilishi mumkin.",
  },
];

export const SOURCES: [string, string][] = [
  ["MDN · HTTP status codes", "https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status"],
  [
    "OWASP · SQL Injection Prevention",
    "https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html",
  ],
  [
    "OWASP · XSS Prevention",
    "https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html",
  ],
  [
    "OWASP · IDOR Prevention",
    "https://cheatsheetseries.owasp.org/cheatsheets/Insecure_Direct_Object_Reference_Prevention_Cheat_Sheet.html",
  ],
];

export function groupFor(lessonId: number): LessonGroup {
  return GROUPS.find((g) => lessonId >= g.from && lessonId <= g.to) ?? GROUPS[0];
}
