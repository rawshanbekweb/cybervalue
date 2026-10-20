// Academy · HTTP basics: how a browser and a server talk. Animated lessons
// built on the shared widgets (../anim-lab/types) plus three of the lab's
// own: sending forms, talking to a pretend server and reading the Network
// panel.
import {
  restoreLessons,
  type CommonWidget,
  type Lesson,
  type Question,
  type Text,
} from "../anim-lab/types";

export type NetRow = {
  method: string;
  path: string;
  status: number;
  type: string;
};

export type Widget =
  | CommonWidget
  | { type: "form" }
  | { type: "talk" }
  | { type: "netpanel"; rows: NetRow[]; questions: Question[] };

const t = (uz: string, en: string): Text => ({ uz, en });

const TALK = t("Veb qanday gaplashadi", "How the web talks");
const ANSWERS = t("Server javoblari", "Answers from the server");
const PRACTICE = t("Amaliyot", "Practice");

const BROWSER = {
  id: "browser",
  label: t("Brauzer", "Browser"),
  icon: "laptop",
} as const;
const SERVER = {
  id: "server",
  label: t("Server", "Server"),
  icon: "server",
} as const;

const ROWS: NetRow[] = [
  { method: "GET", path: "/", status: 200, type: "html" },
  { method: "GET", path: "/style.css", status: 200, type: "css" },
  { method: "GET", path: "/old-logo.png", status: 301, type: "redirect" },
  { method: "GET", path: "/logo.png", status: 404, type: "png" },
  { method: "GET", path: "/app.js", status: 200, type: "js" },
  { method: "GET", path: "/api/user", status: 401, type: "json" },
  { method: "POST", path: "/api/stats", status: 500, type: "json" },
];

const pathOptions = (paths: string[]) => paths.map((p) => t(p, p));

export const LESSONS: Lesson<Widget>[] = [
  {
    id: 1,
    group: TALK,
    title: t("Mijoz va server", "Client and server"),
    minutes: 5,
    intro: t(
      "Saytni ochganingizda brauzeringiz (mijoz) uzoqdagi kompyuterga — serverga — xat yuboradi va javob kutadi. Bu xat almashuvining qoidalari HTTP deb ataladi.",
      "When you open a site, your browser (the client) sends a message to a faraway computer — the server — and waits for an answer. The rules of that exchange are called HTTP.",
    ),
    analogy: t(
      "Restoranni tasavvur qiling: siz ofitsiantga buyurtma berasiz (so‘rov), oshxona taomni tayyorlab qaytaradi (javob). Siz oshxonaga kirmaysiz — faqat buyurtma va javob almashinadi.",
      "Think of a restaurant: you give the waiter an order (a request) and the kitchen sends the dish back (a response). You never walk into the kitchen — only orders and answers travel.",
    ),
    theory: [
      t(
        "HTTP — HyperText Transfer Protocol. U so‘rov va javob tartibida ishlaydi: har doim mijoz boshlaydi, server javob beradi.",
        "HTTP stands for HyperText Transfer Protocol. It works as request and response: the client always starts, the server answers.",
      ),
      t(
        "Bitta sahifa uchun brauzer bir nechta so‘rov yuboradi: avval HTML, keyin undagi uslub (CSS), rasm va skriptlar uchun alohida-alohida.",
        "One page takes several requests: first the HTML, then separate ones for the styles (CSS), images and scripts it mentions.",
      ),
    ],
    task: t(
      "Animatsiyani ishga tushiring va sahifa yuklanguncha barcha xabarlarni kuzating.",
      "Play the animation and follow every message until the page has loaded.",
    ),
    hint: t(
      "“Ijro” tugmasini bosing yoki “Keyingi qadam” bilan bittalab o‘ting.",
      "Press Play, or step through with Next step.",
    ),
    widget: {
      type: "sequence",
      actors: [BROWSER, SERVER],
      steps: [
        {
          from: "browser",
          to: "server",
          label: "GET /",
          detail: t(
            "Brauzer bosh sahifani so‘raydi.",
            "The browser asks for the home page.",
          ),
        },
        {
          from: "server",
          to: "browser",
          label: "200 OK · HTML",
          tone: "ok",
          detail: t(
            "Server HTML yuboradi. Unda style.css va logo.png kerakligi yozilgan.",
            "The server sends the HTML. It says style.css and logo.png are needed too.",
          ),
        },
        {
          from: "browser",
          to: "server",
          label: "GET /style.css",
          detail: t(
            "Brauzer sahifa uslubini alohida so‘raydi.",
            "The browser asks for the page’s styles separately.",
          ),
        },
        {
          from: "server",
          to: "browser",
          label: "200 OK · CSS",
          tone: "ok",
          detail: t("Ranglar va shriftlar keldi.", "Colours and fonts arrive."),
        },
        {
          from: "browser",
          to: "server",
          label: "GET /logo.png",
          detail: t("Endi rasm so‘raladi.", "Now the image is requested."),
        },
        {
          from: "server",
          to: "browser",
          label: "200 OK · PNG",
          tone: "ok",
          detail: t(
            "Rasm keldi — sahifa to‘liq tayyor. Bitta sahifa = uchta so‘rov.",
            "The image arrives — the page is complete. One page = three requests.",
          ),
        },
      ],
    },
  },
  {
    id: 2,
    group: TALK,
    title: t("So‘rov ichida nima bor", "Inside a request"),
    minutes: 6,
    intro: t(
      "HTTP so‘rovi — oddiy matn. Uning birinchi qatori nima kerakligini aytadi, keyingi qatorlar (sarlavhalar) qo‘shimcha ma’lumot beradi.",
      "An HTTP request is plain text. Its first line says what is wanted; the next lines (headers) add details.",
    ),
    analogy: t(
      "Konvertdagi xatga o‘xshaydi: ustida kimga va nima haqida ekani yozilgan, ichida esa asosiy matn.",
      "It is like a letter in an envelope: the outside says who it is for and what it is about, the inside holds the main text.",
    ),
    theory: [
      t(
        "Birinchi qator: METOD (nima qilish), YO‘L (qaysi sahifa) va HTTP versiyasi.",
        "First line: the METHOD (what to do), the PATH (which page) and the HTTP version.",
      ),
      t(
        "Sarlavhalar “Nomi: qiymati” ko‘rinishida bo‘ladi. Host — qaysi sayt, User-Agent — qaysi brauzer, Cookie — avval berilgan kalitlar.",
        "Headers look like “Name: value”. Host is which site, User-Agent which browser, Cookie the keys handed out earlier.",
      ),
      t(
        "Bo‘sh qator sarlavhalar tugaganini bildiradi. Undan keyin tana (body) keladi — masalan, formaga yozilgan ma’lumot.",
        "An empty line ends the headers. The body comes after it — for example what was typed into a form.",
      ),
    ],
    task: t(
      "So‘rovning har bir belgilangan qismini bosib, nima ekanini o‘qing.",
      "Click every highlighted part of the request and read what it is.",
    ),
    hint: t(
      "Siyohrang ramkadagi qismlar bosiladi. Pastdagi hisoblagich nechtasi qolganini ko‘rsatadi.",
      "The purple-framed parts can be clicked. The counter below shows how many are left.",
    ),
    widget: {
      type: "anatomy",
      lines: [
        [
          { text: "POST", id: "method" },
          { text: " " },
          { text: "/login", id: "path" },
          { text: " " },
          { text: "HTTP/1.1", id: "version" },
        ],
        [{ text: "Host: shop.uz", id: "host" }],
        [{ text: "User-Agent: Firefox/131", id: "agent" }],
        [
          {
            text: "Content-Type: application/x-www-form-urlencoded",
            id: "type",
          },
        ],
        [{ text: "(bo‘sh qator · empty line)", id: "blank" }],
        [{ text: "user=ali&pass=Qwerty-2026", id: "body" }],
      ],
      parts: [
        {
          id: "method",
          title: t("Metod", "Method"),
          body: t(
            "Nima qilish kerakligi. POST — ma’lumot yuborish, GET — sahifani olish.",
            "What to do. POST sends data, GET fetches a page.",
          ),
        },
        {
          id: "path",
          title: t("Yo‘l", "Path"),
          body: t(
            "Saytning qaysi sahifasi yoki manbasi kerak.",
            "Which page or resource of the site is wanted.",
          ),
        },
        {
          id: "version",
          title: t("Protokol versiyasi", "Protocol version"),
          body: t(
            "Qaysi HTTP qoidalari ishlatilayotgani. Bugun HTTP/1.1, HTTP/2 va HTTP/3 keng tarqalgan.",
            "Which HTTP rules are used. HTTP/1.1, HTTP/2 and HTTP/3 are common today.",
          ),
        },
        {
          id: "host",
          title: t("Host sarlavhasi", "Host header"),
          body: t(
            "Qaysi saytga so‘rov ketayotgani. Bitta serverda ko‘p sayt bo‘lishi mumkin, Host ularni ajratadi.",
            "Which site the request is for. One server can host many sites; Host tells them apart.",
          ),
        },
        {
          id: "agent",
          title: t("User-Agent", "User-Agent"),
          body: t(
            "Brauzer o‘zini tanishtiradi: nomi va versiyasi.",
            "The browser introduces itself: its name and version.",
          ),
        },
        {
          id: "type",
          title: t("Content-Type", "Content-Type"),
          body: t(
            "Tanadagi ma’lumot qanday formatda ekanini aytadi. Bu yerda — forma maydonlari.",
            "Says what format the body is in. Here: form fields.",
          ),
        },
        {
          id: "blank",
          title: t("Bo‘sh qator", "Empty line"),
          body: t(
            "Sarlavhalar tugadi, endi tana boshlanadi, degan belgi.",
            "The sign that headers are over and the body begins.",
          ),
        },
        {
          id: "body",
          title: t("Tana (body)", "Body"),
          body: t(
            "Yuborilayotgan ma’lumot: login va parol. Shu sababli bunday sahifalar faqat HTTPS orqali ishlashi shart — keyingi laboratoriyada ko‘ramiz.",
            "The data being sent: a login and password. That is why such pages must only work over HTTPS — the next lab shows why.",
          ),
        },
      ],
    },
  },
  {
    id: 3,
    group: TALK,
    title: t("GET va POST", "GET and POST"),
    minutes: 6,
    intro: t(
      "Eng ko‘p ishlatiladigan ikki metod: GET narsani olish uchun, POST esa ma’lumot yuborish uchun.",
      "The two most used methods: GET to fetch something, POST to send data.",
    ),
    analogy: t(
      "GET — kutubxonachidan kitob so‘rash: nima kerakligini ochiq aytasiz. POST — pochta qutisiga yopiq konvert tashlash: ichidagi matn ko‘rinmaydi.",
      "GET is asking a librarian for a book: you say openly what you want. POST is dropping a sealed envelope in a postbox: the text inside is not on show.",
    ),
    theory: [
      t(
        "GET so‘rovida ma’lumot manzilning o‘zida yuboriladi: /search?q=mushuk. U brauzer tarixida, xatcho‘plarda va server jurnallarida qoladi.",
        "A GET request carries data in the address itself: /search?q=cat. It stays in browser history, bookmarks and server logs.",
      ),
      t(
        "POST so‘rovida ma’lumot tanada ketadi — manzil toza qoladi. Parol, xabar, to‘lov kabi narsalar uchun POST ishlatiladi.",
        "A POST request carries data in the body — the address stays clean. Passwords, messages and payments use POST.",
      ),
      t(
        "Diqqat: POST ma’lumotni shifrlamaydi! U faqat manzilga yozmaydi. Himoyani HTTPS beradi.",
        "Careful: POST does not encrypt anything! It only keeps the data out of the address. HTTPS provides the protection.",
      ),
    ],
    task: t(
      "Ikkala formani ham yuboring va ma’lumot qayerga tushishini solishtiring.",
      "Submit both forms and compare where the data ends up.",
    ),
    hint: t(
      "Qidiruv formasi GET, kirish formasi POST bilan ishlaydi. Har biridagi “Yuborish” tugmasini bosing.",
      "The search form uses GET and the sign-in form POST. Press Send on each.",
    ),
    widget: { type: "form" },
  },
  {
    id: 4,
    group: TALK,
    title: t("Qaysi metod kerak?", "Which method?"),
    minutes: 5,
    intro: t(
      "GET va POSTdan tashqari boshqa metodlar ham bor. Masalan DELETE — o‘chirish uchun, PUT — almashtirish uchun.",
      "There are more methods than GET and POST. DELETE removes something, PUT replaces it.",
    ),
    analogy: t(
      "Metod — fe’l: “ber”, “yubor”, “o‘chir”. Yo‘l esa — ot: qaysi narsa bilan ishlash kerak.",
      "A method is a verb: “give”, “send”, “delete”. The path is the noun: what to act on.",
    ),
    theory: [
      t(
        "GET hech narsani o‘zgartirmasligi kerak — uni qayta-qayta yuborish xavfsiz. POST yangi narsa yaratadi yoki ma’lumot yuboradi.",
        "GET should never change anything — sending it again is safe. POST creates something or submits data.",
      ),
      t(
        "DELETE resursni o‘chiradi. Server har bir metodga ruxsat berishi shart emas: ruxsat bo‘lmasa 405 javobini qaytaradi.",
        "DELETE removes a resource. A server need not allow every method: if not, it answers 405.",
      ),
    ],
    task: t(
      "Har bir harakatni to‘g‘ri metodga joylang.",
      "Put every action under the right method.",
    ),
    hint: t(
      "O‘zingizdan so‘rang: bu harakat narsani oladimi, yuboradimi yoki o‘chiradimi?",
      "Ask yourself: does the action fetch, send or delete?",
    ),
    widget: {
      type: "sort",
      buckets: [
        { id: "GET", label: t("GET · olish", "GET · fetch") },
        { id: "POST", label: t("POST · yuborish", "POST · send") },
        { id: "DELETE", label: t("DELETE · o‘chirish", "DELETE · delete") },
      ],
      items: [
        {
          label: t("Yangiliklar sahifasini ochish", "Open the news page"),
          bucket: "GET",
        },
        {
          label: t(
            "Login va parol bilan kirish",
            "Sign in with a login and password",
          ),
          bucket: "POST",
        },
        {
          label: t(
            "Savatdagi mahsulotni olib tashlash",
            "Remove an item from the cart",
          ),
          bucket: "DELETE",
        },
        { label: t("Rasmni yuklab ko‘rish", "Load a picture"), bucket: "GET" },
        { label: t("Izoh qoldirish", "Post a comment"), bucket: "POST" },
        {
          label: t("Qidiruvda “mushuk” deb izlash", "Search for “cat”"),
          bucket: "GET",
        },
        {
          label: t(
            "Akkauntni butunlay o‘chirish",
            "Delete the account for good",
          ),
          bucket: "DELETE",
        },
        {
          label: t("Ro‘yxatdan o‘tish formasi", "Submit a sign-up form"),
          bucket: "POST",
        },
      ],
    },
  },
  {
    id: 5,
    group: ANSWERS,
    title: t("Javob ichida nima bor", "Inside a response"),
    minutes: 6,
    intro: t(
      "Server ham matn bilan javob beradi: birinchi qatorda holat kodi, keyin sarlavhalar va sahifaning o‘zi.",
      "The server also answers in text: a status code on the first line, then headers and the page itself.",
    ),
    analogy: t(
      "Buyurtma qaytgan qutiga o‘xshaydi: ustidagi yorliq “yetkazildi” yoki “topilmadi” deydi, ichida esa narsaning o‘zi.",
      "Like a returned parcel: the label says “delivered” or “not found”, and the item is inside.",
    ),
    theory: [
      t(
        "Holat qatori: versiya, uch xonali kod va qisqa izoh. 200 OK — hammasi joyida.",
        "The status line: version, a three-digit code and a short reason. 200 OK means all is well.",
      ),
      t(
        "Javob sarlavhalari: Content-Type (qanday fayl), Content-Length (hajmi), Set-Cookie (brauzerga kalit berish).",
        "Response headers: Content-Type (what kind of file), Content-Length (its size), Set-Cookie (giving the browser a key).",
      ),
    ],
    task: t(
      "Javobning har bir belgilangan qismini bosib, nima ekanini o‘qing.",
      "Click every highlighted part of the response and read what it is.",
    ),
    hint: t(
      "Hammasi bo‘lib yettita qism bor.",
      "There are seven parts in all.",
    ),
    widget: {
      type: "anatomy",
      lines: [
        [
          { text: "HTTP/1.1", id: "version" },
          { text: " " },
          { text: "200 OK", id: "status" },
        ],
        [{ text: "Content-Type: text/html; charset=utf-8", id: "type" }],
        [{ text: "Content-Length: 46", id: "length" }],
        [{ text: "Set-Cookie: session=7f2a; HttpOnly; Secure", id: "cookie" }],
        [{ text: "(bo‘sh qator · empty line)" }],
        [{ text: "<h1>Xush kelibsiz, Ali!</h1>", id: "body" }],
        [{ text: "<p>Buyurtmalar: 3</p>", id: "body2" }],
      ],
      parts: [
        {
          id: "version",
          title: t("Versiya", "Version"),
          body: t(
            "Server ham qaysi HTTP versiyasida gapirayotganini aytadi.",
            "The server also says which HTTP version it speaks.",
          ),
        },
        {
          id: "status",
          title: t("Holat kodi", "Status code"),
          body: t(
            "So‘rov bilan nima bo‘lganini bildiradi. 200 — muvaffaqiyat. Keyingi darsda kodlarning barcha oilalarini ko‘ramiz.",
            "Tells what happened to the request. 200 means success. The next lesson covers every family of codes.",
          ),
        },
        {
          id: "type",
          title: t("Content-Type", "Content-Type"),
          body: t(
            "Brauzerga nima kelganini aytadi: HTML sahifa, rasm, JSON… Brauzer shunga qarab uni ko‘rsatadi.",
            "Tells the browser what arrived: an HTML page, an image, JSON… The browser shows it accordingly.",
          ),
        },
        {
          id: "length",
          title: t("Content-Length", "Content-Length"),
          body: t(
            "Tananing hajmi baytlarda — brauzer javob qachon tugashini biladi.",
            "The body’s size in bytes — so the browser knows when the answer ends.",
          ),
        },
        {
          id: "cookie",
          title: t("Set-Cookie", "Set-Cookie"),
          body: t(
            "Server brauzerga kalit beradi. Brauzer keyingi so‘rovlarda uni qaytaradi — shu tufayli sayt sizni “eslab qoladi”.",
            "The server hands the browser a key. The browser returns it with later requests — that is how a site “remembers” you.",
          ),
        },
        {
          id: "body",
          title: t("Tana", "Body"),
          body: t(
            "Sahifaning o‘zi. Brauzer bu HTMLni chizib, siz ko‘radigan sahifaga aylantiradi.",
            "The page itself. The browser draws this HTML into the page you see.",
          ),
        },
        {
          id: "body2",
          title: t("Tana davomi", "More body"),
          body: t(
            "Tana bir necha qator bo‘lishi mumkin; Content-Length hammasini hisoblaydi.",
            "The body can span many lines; Content-Length counts them all.",
          ),
        },
      ],
    },
  },
  {
    id: 6,
    group: ANSWERS,
    title: t("Holat kodlari oilalari", "Status code families"),
    minutes: 7,
    intro: t(
      "Holat kodining birinchi raqami uning oilasini bildiradi. Kodni yodlash shart emas — oilasini bilsangiz, nima bo‘lganini tushunasiz.",
      "The first digit of a status code is its family. You need not memorise codes — knowing the family tells you what happened.",
    ),
    analogy: t(
      "Svetoforga o‘xshaydi: 2xx — yashil (hammasi joyida), 3xx — “boshqa yo‘ldan yuring”, 4xx — siz xato qildingiz, 5xx — server buzildi.",
      "Like traffic lights: 2xx green (all fine), 3xx “take another road”, 4xx you made a mistake, 5xx the server broke.",
    ),
    theory: [
      t(
        "2xx — muvaffaqiyat: 200 OK, 201 Created (yaratildi), 204 No Content (bajarildi, ko‘rsatadigan narsa yo‘q).",
        "2xx success: 200 OK, 201 Created, 204 No Content (done, nothing to show).",
      ),
      t(
        "3xx — yo‘naltirish: 301 (butunlay ko‘chdi), 302 (vaqtincha boshqa joyda), 304 (o‘zgarmagan — eski nusxadan foydalaning).",
        "3xx redirect: 301 (moved for good), 302 (temporarily elsewhere), 304 (not modified — use your copy).",
      ),
      t(
        "4xx — mijoz xatosi: 400 (noto‘g‘ri so‘rov), 401 (avval kiring), 403 (ruxsat yo‘q), 404 (topilmadi), 405 (bu metod mumkin emas).",
        "4xx client error: 400 (bad request), 401 (sign in first), 403 (not allowed), 404 (not found), 405 (method not allowed).",
      ),
      t(
        "5xx — server xatosi: 500 (serverda ichki xato), 502 (bog‘langan server javob bermadi), 503 (server band yoki ta’mirda).",
        "5xx server error: 500 (internal error), 502 (an upstream server failed), 503 (busy or under maintenance).",
      ),
    ],
    task: t(
      "Har bir kodni o‘z oilasiga joylang.",
      "Put every code in its family.",
    ),
    hint: t("Faqat birinchi raqamga qarang.", "Look only at the first digit."),
    widget: {
      type: "sort",
      buckets: [
        { id: "2", label: t("2xx · muvaffaqiyat", "2xx · success") },
        { id: "3", label: t("3xx · yo‘naltirish", "3xx · redirect") },
        { id: "4", label: t("4xx · mijoz xatosi", "4xx · client error") },
        { id: "5", label: t("5xx · server xatosi", "5xx · server error") },
      ],
      items: [
        { label: t("404 Not Found", "404 Not Found"), code: true, bucket: "4" },
        { label: t("200 OK", "200 OK"), code: true, bucket: "2" },
        {
          label: t("301 Moved Permanently", "301 Moved Permanently"),
          code: true,
          bucket: "3",
        },
        {
          label: t("500 Internal Server Error", "500 Internal Server Error"),
          code: true,
          bucket: "5",
        },
        { label: t("403 Forbidden", "403 Forbidden"), code: true, bucket: "4" },
        { label: t("201 Created", "201 Created"), code: true, bucket: "2" },
        {
          label: t("503 Service Unavailable", "503 Service Unavailable"),
          code: true,
          bucket: "5",
        },
        { label: t("302 Found", "302 Found"), code: true, bucket: "3" },
        {
          label: t("401 Unauthorized", "401 Unauthorized"),
          code: true,
          bucket: "4",
        },
        {
          label: t("304 Not Modified", "304 Not Modified"),
          code: true,
          bucket: "3",
        },
      ],
    },
  },
  {
    id: 7,
    group: ANSWERS,
    title: t("Server bilan gaplashing", "Talk to a server"),
    minutes: 7,
    intro: t(
      "Endi o‘zingiz so‘rov yuboring. Bu o‘quv sayti har bir sahifada boshqacha javob beradi.",
      "Now send requests yourself. This practice site answers differently on every page.",
    ),
    analogy: t(
      "Turli eshiklarni taqillatayotgandek: biri ochiladi, biri “boshqa eshikka boring” deydi, biri esa umuman yo‘q.",
      "Like knocking on different doors: one opens, one says “try the next door”, and one does not exist at all.",
    ),
    theory: [
      t(
        "Metod va yo‘lni tanlang, so‘ng “Yuborish”ni bosing. So‘rov serverga uchib boradi va javob kodi bilan qaytadi.",
        "Pick a method and a path, then press Send. The request flies to the server and comes back with a status code.",
      ),
      t(
        "Bir xil yo‘l turli metod bilan boshqacha javob berishi mumkin: bosh sahifa GET bilan ochiladi, POST bilan esa 405 qaytaradi.",
        "The same path can answer differently per method: the home page opens with GET but returns 405 for POST.",
      ),
    ],
    task: t(
      "To‘rtta oilaning har biridan kamida bitta javob oling: 2xx, 3xx, 4xx va 5xx.",
      "Get at least one answer from each of the four families: 2xx, 3xx, 4xx and 5xx.",
    ),
    hint: t(
      "/old-page yo‘naltiradi, /missing topilmaydi, /crash esa serverni buzadi.",
      "/old-page redirects, /missing is not found and /crash breaks the server.",
    ),
    widget: { type: "talk" },
  },
  {
    id: 8,
    group: PRACTICE,
    title: t("Network paneli", "The Network panel"),
    minutes: 7,
    intro: t(
      "Har bir brauzerda dasturchi vositalari bor (F12). Ularning Network bo‘limida sahifa yuborgan barcha so‘rovlar va javoblar ko‘rinadi.",
      "Every browser has developer tools (F12). Their Network tab lists every request a page made and every answer.",
    ),
    analogy: t(
      "Kuryerlik xizmatining jurnaliga o‘xshaydi: qaysi posilka qachon, qayerga ketgani va yetib borgan-bormagani.",
      "Like a courier’s logbook: which parcel went where, and whether it arrived.",
    ),
    theory: [
      t(
        "Sahifa sekin yoki noto‘g‘ri ishlasa, birinchi qadam — Network panelini ochib, qizil (4xx/5xx) qatorlarni izlash.",
        "When a page is slow or broken, the first step is opening the Network panel and looking for red (4xx/5xx) rows.",
      ),
      t(
        "Xavfsizlik mutaxassislari ham shu paneldan boshlaydi: sayt qanday so‘rovlar yuborayotgani uning qanday ishlashini ko‘rsatadi.",
        "Security testers start here too: the requests a site makes reveal how it works.",
      ),
    ],
    task: t(
      "Sahifani yangilang, jurnalni o‘qing va savollarga javob bering.",
      "Reload the page, read the log and answer the questions.",
    ),
    hint: t(
      "Holat kodlariga va metodlarga qarang. 401 — kirish kerak, 404 — topilmadi, 500 — server xatosi.",
      "Look at the status codes and methods. 401 needs sign-in, 404 is not found, 500 is a server error.",
    ),
    widget: {
      type: "netpanel",
      rows: ROWS,
      questions: [
        {
          ask: t(
            "Qaysi fayl serverda yo‘q?",
            "Which file does not exist on the server?",
          ),
          options: pathOptions(["/style.css", "/logo.png", "/app.js"]),
          answer: 1,
          explain: t("404 — topilmadi.", "404 means not found."),
        },
        {
          ask: t(
            "Qaysi so‘rov uchun avval tizimga kirish kerak?",
            "Which request needs the user to sign in first?",
          ),
          options: pathOptions(["/api/user", "/api/stats", "/old-logo.png"]),
          answer: 0,
          explain: t("401 — avval kiring.", "401 means sign in first."),
        },
        {
          ask: t(
            "Qaysi so‘rovda xato serverning o‘zida?",
            "In which request is the fault on the server itself?",
          ),
          options: pathOptions(["/logo.png", "/api/user", "/api/stats"]),
          answer: 2,
          explain: t(
            "500 — serverdagi ichki xato; mijoz aybdor emas.",
            "500 is an internal server error; the client is not at fault.",
          ),
        },
        {
          ask: t(
            "Qaysi manzil boshqa joyga yo‘naltirdi?",
            "Which address redirected somewhere else?",
          ),
          options: pathOptions(["/", "/old-logo.png", "/app.js"]),
          answer: 1,
          explain: t(
            "301 — butunlay ko‘chgan; brauzer yangi manzilga o‘zi o‘tadi.",
            "301 means moved for good; the browser follows to the new address itself.",
          ),
        },
      ],
    },
  },
  {
    id: 9,
    group: PRACTICE,
    title: t("Yakuniy takrorlash", "Final review"),
    minutes: 6,
    intro: t(
      "O‘rganganlaringizni tekshiring. Har bir to‘g‘ri javobdan keyin qisqa izoh chiqadi.",
      "Check what you have learned. A short explanation follows every right answer.",
    ),
    analogy: t(
      "Haydovchilik imtihonidagi nazariy savollarga o‘xshaydi — qoidani bilsangiz, javob oson.",
      "Like the theory part of a driving test — know the rule and the answer is easy.",
    ),
    theory: [
      t(
        "Asosiy g‘oya: mijoz so‘raydi, server javob beradi. Metod — nima qilish, yo‘l — nima bilan, kod — natija.",
        "The core idea: the client asks, the server answers. The method is what to do, the path what to do it to, the code the result.",
      ),
    ],
    task: t(
      "Barcha savollarga to‘g‘ri javob bering.",
      "Answer every question correctly.",
    ),
    hint: t(
      "Shubhalansangiz, oldingi darslarga qayting — ular saqlanib qoladi.",
      "Unsure? Go back to earlier lessons — your progress stays.",
    ),
    widget: {
      type: "quiz",
      questions: [
        {
          ask: t("HTTPda kim birinchi gapiradi?", "In HTTP, who speaks first?"),
          options: [
            t("Server", "The server"),
            t("Mijoz (brauzer)", "The client (browser)"),
            t("Ikkalasi bir vaqtda", "Both at once"),
          ],
          answer: 1,
          explain: t(
            "Har doim mijoz so‘raydi, server javob beradi.",
            "The client always asks; the server answers.",
          ),
        },
        {
          ask: t(
            "Parol qaysi metod bilan yuborilishi kerak?",
            "Which method should send a password?",
          ),
          options: [t("GET", "GET"), t("POST", "POST"), t("DELETE", "DELETE")],
          answer: 1,
          explain: t(
            "POST ma’lumotni manzilga emas, tanaga joylaydi (va albatta HTTPS orqali).",
            "POST puts the data in the body, not the address (and always over HTTPS).",
          ),
        },
        {
          ask: t(
            "“403 Forbidden” nimani bildiradi?",
            "What does “403 Forbidden” mean?",
          ),
          options: [
            t("Sahifa topilmadi", "The page was not found"),
            t(
              "Sizda bu sahifaga ruxsat yo‘q",
              "You are not allowed to see this page",
            ),
            t("Server buzildi", "The server broke"),
          ],
          answer: 1,
          explain: t(
            "4xx — mijoz tomoni; 403 — ruxsat yo‘q.",
            "4xx is the client side; 403 means not allowed.",
          ),
        },
        {
          ask: t(
            "So‘rovdagi qaysi sarlavha saytni ko‘rsatadi?",
            "Which request header names the site?",
          ),
          options: [
            t("Host", "Host"),
            t("User-Agent", "User-Agent"),
            t("Content-Length", "Content-Length"),
          ],
          answer: 0,
          explain: t(
            "Host — qaysi sayt; bitta serverda ko‘p sayt bo‘lishi mumkin.",
            "Host is which site; one server can host many.",
          ),
        },
        {
          ask: t(
            "Server qaysi sarlavha bilan brauzerga cookie beradi?",
            "Which header does a server use to give the browser a cookie?",
          ),
          options: [
            t("Cookie", "Cookie"),
            t("Set-Cookie", "Set-Cookie"),
            t("Location", "Location"),
          ],
          answer: 1,
          explain: t(
            "Server Set-Cookie bilan beradi, brauzer Cookie bilan qaytaradi.",
            "The server sends Set-Cookie; the browser returns it as Cookie.",
          ),
        },
        {
          ask: t(
            "Sahifa 502 qaytardi. Kim aybdor?",
            "A page returns 502. Whose fault is it?",
          ),
          options: [
            t("Foydalanuvchi", "The user"),
            t("Server tomoni", "The server side"),
            t("Brauzer", "The browser"),
          ],
          answer: 1,
          explain: t(
            "5xx — server tomonidagi muammo.",
            "5xx is a server-side problem.",
          ),
        },
      ],
    },
  },
];

export const PROGRESS_KEY = "cybervalue:http-basics:progress:v1";

export const restoreProgress = (raw: unknown) => restoreLessons(raw, LESSONS);
