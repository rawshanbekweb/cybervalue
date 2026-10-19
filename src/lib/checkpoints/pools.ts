// Fixed question pools for the HTML Basics and Web Security labs. Each item
// lists the right option first; the checkpoint shuffles them per seed.
import type { Text } from "../network/ip";

export type PoolItem = {
  ask: Text;
  code?: string;
  right: Text;
  wrong: Text[];
  explain: Text;
};

const same = (text: string): Text => ({ uz: text, en: text });

export const HTML_POOL: PoolItem[] = [
  {
    ask: {
      uz: "Sahifaning brauzer yorlig‘ida ko‘rinadigan nomi qaysi teg ichida yoziladi?",
      en: "Which tag holds the page name shown on the browser tab?",
    },
    right: same("<title> (inside <head>)"),
    wrong: [
      same("<h1> (inside <body>)"),
      same("<header>"),
      same("<meta name>"),
    ],
    explain: {
      uz: "<title> <head> ichida turadi va yorliqda, qidiruv natijalarida ko‘rinadi.",
      en: "<title> lives in <head> and shows on the tab and in search results.",
    },
  },
  {
    ask: {
      uz: "Foydalanuvchi ko‘radigan barcha kontent qaysi element ichida bo‘ladi?",
      en: "Which element holds all the content the user sees?",
    },
    right: same("<body>"),
    wrong: [same("<head>"), same("<html lang>"), same("<!DOCTYPE html>")],
    explain: {
      uz: "<head> — sahifa haqidagi ma’lumot, <body> — ko‘rinadigan kontent.",
      en: "<head> is information about the page; <body> is what is shown.",
    },
  },
  {
    ask: {
      uz: "Bir sahifada odatda nechta <h1> sarlavha bo‘lishi tavsiya etiladi?",
      en: "How many <h1> headings should a page usually have?",
    },
    right: {
      uz: "Bitta — sahifaning asosiy sarlavhasi",
      en: "One — the page's main heading",
    },
    wrong: [
      { uz: "Har bir paragraf uchun bittadan", en: "One per paragraph" },
      { uz: "Kamida uchta", en: "At least three" },
      { uz: "Umuman kerak emas", en: "None at all" },
    ],
    explain: {
      uz: "<h1> sahifaning asosiy mavzusi; qolgan bo‘limlar <h2>–<h6> bilan belgilanadi.",
      en: "<h1> is the page's main topic; sections below use <h2>–<h6>.",
    },
  },
  {
    ask: {
      uz: "Matnni ma’no jihatdan muhim deb belgilash uchun qaysi teg to‘g‘ri?",
      en: "Which tag marks text as important in meaning?",
    },
    right: same("<strong>"),
    wrong: [same("<b>"), same("<span>"), same("<big>")],
    explain: {
      uz: "<strong> muhimlikni bildiradi (ekran o‘quvchilar ham sezadi); <b> faqat qalin ko‘rinish.",
      en: "<strong> means importance (screen readers notice it); <b> is only bold styling.",
    },
  },
  {
    ask: {
      uz: "Tartibi muhim bo‘lgan qadamlar ro‘yxati uchun qaysi tuzilma to‘g‘ri?",
      en: "Which structure fits a list of steps whose order matters?",
    },
    right: same("<ol><li>…</li></ol>"),
    wrong: [
      same("<ul><li>…</li></ul>"),
      same("<ol><p>…</p></ol>"),
      same("<li><ol>…</ol></li>"),
    ],
    explain: {
      uz: "<ol> raqamlangan ro‘yxat, ichida faqat <li> elementlari bo‘ladi.",
      en: "<ol> is a numbered list and contains only <li> items.",
    },
  },
  {
    ask: {
      uz: "Havolani yangi yorliqda xavfsiz ochish uchun qaysi atributlar kerak?",
      en: "Which attributes open a link safely in a new tab?",
    },
    right: same('target="_blank" rel="noopener"'),
    wrong: [
      same('href="_blank"'),
      same('target="new"'),
      same('rel="external" only'),
    ],
    explain: {
      uz: 'target="_blank" yangi yorliq ochadi, rel="noopener" esa yangi sahifaga eski sahifani boshqarish imkonini bermaydi.',
      en: 'target="_blank" opens a new tab; rel="noopener" stops the new page from controlling the old one.',
    },
  },
  {
    ask: {
      uz: "<img> uchun alt atributi nima uchun kerak?",
      en: "Why does <img> need an alt attribute?",
    },
    right: {
      uz: "Rasm ko‘rinmaganda yoki ekran o‘quvchi uchun uning ma’nosini aytadi",
      en: "It says what the image means when it cannot be seen or for screen readers",
    },
    wrong: [
      { uz: "Rasmni tezroq yuklaydi", en: "It loads the image faster" },
      { uz: "Rasm o‘lchamini belgilaydi", en: "It sets the image size" },
      { uz: "Rasmga havola qo‘shadi", en: "It turns the image into a link" },
    ],
    explain: {
      uz: "alt — rasmning matnli muqobili: kirish imkoniyati va rasm yuklanmaganda kerak.",
      en: "alt is the text alternative: needed for accessibility and when the image fails to load.",
    },
  },
  {
    ask: {
      uz: "Jadval sarlavha katagi uchun qaysi teg ishlatiladi?",
      en: "Which tag is used for a table header cell?",
    },
    right: same("<th>"),
    wrong: [same("<td>"), same("<thead> alone"), same("<caption>")],
    explain: {
      uz: "<th> ustun yoki qator sarlavhasi; oddiy ma’lumot katagi <td>.",
      en: "<th> is a column or row header; a normal data cell is <td>.",
    },
  },
  {
    ask: {
      uz: "Label bosilganda maydon tanlanishi uchun nima mos kelishi kerak?",
      en: "What must match so clicking a label focuses its field?",
    },
    code: '<label for="?">Email</label>\n<input id="email" type="email">',
    right: {
      uz: "label for qiymati va input id si",
      en: "The label's for and the input's id",
    },
    wrong: [
      { uz: "label va input class lari", en: "The label's and input's class" },
      {
        uz: "input name va label matni",
        en: "The input name and the label text",
      },
      { uz: "Hech narsa, bu avtomatik", en: "Nothing, it is automatic" },
    ],
    explain: {
      uz: 'for="email" va id="email" bir xil bo‘lsa, label o‘sha maydonga bog‘lanadi.',
      en: 'With for="email" and id="email" the label belongs to that field.',
    },
  },
  {
    ask: {
      uz: "Email kiritiladigan maydon uchun eng mos input turi qaysi?",
      en: "Which input type fits an email field best?",
    },
    right: same('type="email"'),
    wrong: [same('type="text"'), same('type="mail"'), same('type="string"')],
    explain: {
      uz: 'type="email" brauzerda format tekshiruvi va telefonda mos klaviaturani beradi.',
      en: 'type="email" gives a format check and the right phone keyboard.',
    },
  },
  {
    ask: {
      uz: "Sahifaning asosiy, takrorlanmaydigan kontenti uchun qaysi semantik teg mos?",
      en: "Which semantic tag fits the page's main, unique content?",
    },
    right: same("<main>"),
    wrong: [same("<section>"), same('<div class="main">'), same("<aside>")],
    explain: {
      uz: "<main> sahifada bitta bo‘ladi va asosiy kontentni belgilaydi.",
      en: "<main> appears once and marks the main content.",
    },
  },
  {
    ask: {
      uz: "<div> va <span> farqi nimada?",
      en: "What is the difference between <div> and <span>?",
    },
    right: {
      uz: "<div> blok element, <span> qator ichidagi element",
      en: "<div> is a block element, <span> is inline",
    },
    wrong: [
      { uz: "<span> faqat rasmlar uchun", en: "<span> is only for images" },
      { uz: "Hech qanday farq yo‘q", en: "There is no difference" },
      {
        uz: "<div> faqat jadval ichida ishlaydi",
        en: "<div> works only in tables",
      },
    ],
    explain: {
      uz: "Ikkalasi ham ma’nosiz konteyner; <div> yangi qatordan boshlanadi, <span> matn ichida qoladi.",
      en: "Both are meaningless containers; <div> starts a new line, <span> stays inside text.",
    },
  },
  {
    ask: {
      uz: "id va class ning asosiy farqi nima?",
      en: "What is the main difference between id and class?",
    },
    right: {
      uz: "id sahifada bitta elementga, class ko‘p elementga beriladi",
      en: "An id is for one element on the page, a class for many",
    },
    wrong: [
      { uz: "class faqat <div> uchun", en: "class is only for <div>" },
      { uz: "id CSS da ishlamaydi", en: "id does not work in CSS" },
      { uz: "Ular bir xil", en: "They are the same" },
    ],
    explain: {
      uz: "id noyob bo‘lishi kerak; bir xil uslub bir nechta elementga class orqali beriladi.",
      en: "An id must be unique; shared styling goes on a class.",
    },
  },
  {
    ask: {
      uz: "Sahifada aynan “<p>” matnini ko‘rsatish uchun qanday yoziladi?",
      en: "How do you show the literal text “<p>” on a page?",
    },
    right: same("&lt;p&gt;"),
    wrong: [same("<p>"), same("&p;"), same("\\<p\\>")],
    explain: {
      uz: "&lt; va &gt; maxsus belgilar: brauzer ularni teg emas, matn sifatida chiqaradi.",
      en: "&lt; and &gt; are entities: the browser shows them as text, not as a tag.",
    },
  },
];

// The Web Security Lab's own final quiz comes from its lesson data; these add
// questions on the lessons the quiz does not cover.
export const SECURITY_EXTRA: PoolItem[] = [
  {
    ask: {
      uz: "Foydalanuvchi tizimga kirgan, lekin sahifaga ruxsati yo‘q. Server qaysi kodni qaytaradi?",
      en: "The user is signed in but not allowed to see the page. Which status should the server return?",
    },
    right: same("403 Forbidden"),
    wrong: [same("401 Unauthorized"), same("404 Not Found"), same("200 OK")],
    explain: {
      uz: "401 — kim ekaningiz noma’lum; 403 — kim ekaningiz ma’lum, lekin ruxsat yo‘q.",
      en: "401 means you are not identified; 403 means you are, but you lack permission.",
    },
  },
  {
    ask: {
      uz: "Ma’lumotni o‘zgartiradigan amal uchun qaysi HTTP metodi mos?",
      en: "Which HTTP method fits an action that changes data?",
    },
    right: same("POST"),
    wrong: [same("GET"), same("HEAD"), same("OPTIONS")],
    explain: {
      uz: "GET faqat o‘qish uchun; o‘zgartirish POST/PUT/DELETE orqali bo‘ladi.",
      en: "GET only reads; changes go through POST, PUT or DELETE.",
    },
  },
  {
    ask: {
      uz: "SQL Injection dan eng ishonchli himoya qaysi?",
      en: "What is the most reliable defense against SQL injection?",
    },
    right: {
      uz: "Parametrlangan so‘rovlar (prepared statements)",
      en: "Parameterized queries (prepared statements)",
    },
    wrong: [
      { uz: "Frontendda tekshirish", en: "Checking it in the frontend" },
      { uz: "Tirnoqlarni qo‘lda o‘chirish", en: "Removing quotes by hand" },
      { uz: "Xatolarni yashirish", en: "Hiding error messages" },
    ],
    explain: {
      uz: "Parametrlar ma’lumotni so‘rov kodidan ajratadi, shuning uchun kiritilgan matn buyruqqa aylanmaydi.",
      en: "Parameters keep data apart from query code, so input never becomes a command.",
    },
  },
  {
    ask: {
      uz: "?id=124 ni ?id=125 ga o‘zgartirib, boshqa birovning buyurtmasini ko‘rish qanday zaiflik?",
      en: "Changing ?id=124 to ?id=125 shows someone else's order. Which weakness is it?",
    },
    right: same("IDOR (Broken Access Control)"),
    wrong: [same("XSS"), same("SQL Injection"), same("CSRF")],
    explain: {
      uz: "Server obyekt kimga tegishli ekanini tekshirmayapti — bu ruxsat nazoratining buzilishi.",
      en: "The server does not check who owns the object — broken access control.",
    },
  },
  {
    ask: {
      uz: "Sessiya cookie si JavaScript orqali o‘qilmasligi uchun qaysi belgi qo‘yiladi?",
      en: "Which flag stops JavaScript from reading a session cookie?",
    },
    right: same("HttpOnly"),
    wrong: [same("Secure"), same("SameSite=None"), same("Max-Age")],
    explain: {
      uz: "HttpOnly cookie ni document.cookie dan yashiradi, XSS bo‘lsa ham sessiya o‘g‘irlanishi qiyinlashadi.",
      en: "HttpOnly hides the cookie from document.cookie, so XSS cannot simply steal the session.",
    },
  },
  {
    ask: {
      uz: "XSS dan himoyaning asosiy usuli qaysi?",
      en: "What is the main defense against XSS?",
    },
    right: {
      uz: "Foydalanuvchi matnini chiqarishda escape qilish",
      en: "Escaping user text when it is output",
    },
    wrong: [
      { uz: "Parolni uzunroq qilish", en: "Making passwords longer" },
      { uz: "HTTP o‘rniga FTP ishlatish", en: "Using FTP instead of HTTP" },
      { uz: "Ma’lumotlar bazasini shifrlash", en: "Encrypting the database" },
    ],
    explain: {
      uz: "Escape qilingan matn brauzerda kod sifatida bajarilmaydi, faqat matn bo‘lib ko‘rinadi.",
      en: "Escaped text is shown as text and never runs as code in the browser.",
    },
  },
];

// Academy Intermediate · HTTP in depth.
export const HTTP_POOL: PoolItem[] = [
  {
    ask: {
      uz: "HTTP/1.1 so‘rovida qaysi sarlavha majburiy?",
      en: "Which header is required in an HTTP/1.1 request?",
    },
    right: same("Host"),
    wrong: [same("Cookie"), same("User-Agent"), same("Content-Type")],
    explain: {
      uz: "Bitta serverda ko‘p sayt bo‘lishi mumkin; Host qaysi biri kerakligini aytadi.",
      en: "One server can hold many sites; Host says which one is meant.",
    },
  },
  {
    ask: {
      uz: "Javob “HTTP/1.1 301 Moved Permanently”. Yangi manzil qayerda yoziladi?",
      en: "The response is “HTTP/1.1 301 Moved Permanently”. Where is the new address?",
    },
    right: same("Location"),
    wrong: [same("Referer"), same("Origin"), same("Host")],
    explain: {
      uz: "Location sarlavhasi brauzerga qayerga o‘tishni aytadi.",
      en: "The Location header tells the browser where to go.",
    },
  },
  {
    ask: {
      uz: "Kirgan, lekin huquqi yo‘q foydalanuvchiga qaysi kod qaytariladi?",
      en: "Which code goes to a signed-in user who lacks the rights?",
    },
    right: same("403 Forbidden"),
    wrong: [same("401 Unauthorized"), same("404 Not Found"), same("200 OK")],
    explain: {
      uz: "401 — kimligi noma’lum, 403 — kimligi ma’lum, lekin ruxsat yo‘q.",
      en: "401: identity unknown; 403: known, but not allowed.",
    },
  },
  {
    ask: {
      uz: "Server foydalanuvchini keyingi so‘rovlarda qanday taniydi?",
      en: "How does the server recognise the user on later requests?",
    },
    right: {
      uz: "Brauzer Cookie sarlavhasida sessiya identifikatorini yuboradi",
      en: "The browser sends the session id in a Cookie header",
    },
    wrong: [
      { uz: "IP manzilga qarab", en: "By the IP address" },
      { uz: "HTTP o‘zi eslab qoladi", en: "HTTP remembers by itself" },
      { uz: "User-Agent sarlavhasiga qarab", en: "By the User-Agent header" },
    ],
    explain: {
      uz: "HTTP xotirasiz; holat cookie’dagi sessiya identifikatori orqali saqlanadi.",
      en: "HTTP is stateless; state lives in the session id inside a cookie.",
    },
  },
  {
    ask: {
      uz: "Qaysi cookie bayrog‘i JavaScript’ga cookie’ni o‘qishga ruxsat bermaydi?",
      en: "Which cookie flag stops JavaScript from reading the cookie?",
    },
    right: same("HttpOnly"),
    wrong: [same("Secure"), same("SameSite=Lax"), same("Path=/")],
    explain: {
      uz: "HttpOnly XSS bo‘lganda ham sessiyani o‘g‘irlashni qiyinlashtiradi.",
      en: "HttpOnly makes stealing the session hard even with XSS.",
    },
  },
  {
    ask: {
      uz: "Qaysi bayroq cookie’ni faqat HTTPS orqali yuborishni ta’minlaydi?",
      en: "Which flag makes the cookie travel over HTTPS only?",
    },
    right: same("Secure"),
    wrong: [same("HttpOnly"), same("Domain"), same("Max-Age")],
    explain: {
      uz: "Secure bo‘lmasa, cookie shifrlanmagan tarmoqda ochiq ketishi mumkin.",
      en: "Without Secure the cookie may cross an unencrypted network in the clear.",
    },
  },
  {
    ask: {
      uz: "SameSite=Lax qaysi hujumga qarshi yordam beradi?",
      en: "Which attack does SameSite=Lax help against?",
    },
    right: same("CSRF"),
    wrong: [same("SQL injection"), same("Brute force"), same("DNS spoofing")],
    explain: {
      uz: "Boshqa saytdan kelgan so‘rovlarga cookie qo‘shilmaydi, shuning uchun soxta so‘rov sizning nomingizdan ishlamaydi.",
      en: "Cookies are left off requests from other sites, so a forged request does not act as you.",
    },
  },
  {
    ask: {
      uz: "https://shop.uz bilan qaysi manzil bir xil manbaga ega?",
      en: "Which address has the same origin as https://shop.uz?",
    },
    right: same("https://shop.uz/profil?tab=2"),
    wrong: [
      same("http://shop.uz/"),
      same("https://api.shop.uz/"),
      same("https://shop.uz:8443/"),
    ],
    explain: {
      uz: "Manba = sxema + host + port; yo‘l va parametrlar hisobga kirmaydi.",
      en: "Origin = scheme + host + port; the path and query don’t count.",
    },
  },
  {
    ask: {
      uz: "CORS nimani himoya qiladi?",
      en: "What does CORS protect?",
    },
    right: {
      uz: "Brauzerdagi foydalanuvchi ma’lumotini boshqa saytlarning o‘qishidan",
      en: "The user’s data in the browser from being read by other sites",
    },
    wrong: [
      {
        uz: "Serverni har qanday so‘rovdan",
        en: "The server from any request",
      },
      { uz: "Parollarni shifrlaydi", en: "It encrypts passwords" },
      { uz: "Saytni DDoS’dan", en: "The site from DDoS" },
    ],
    explain: {
      uz: "curl kabi vositalar CORS’ga bo‘ysunmaydi; server o‘zi tekshirishi shart.",
      en: "Tools like curl ignore CORS; the server must check by itself.",
    },
  },
  {
    ask: {
      uz: "Brauzer murakkab kross-manba so‘rovdan oldin qaysi metod bilan ruxsat so‘raydi?",
      en: "With which method does a browser ask before a complex cross-origin request?",
    },
    right: same("OPTIONS"),
    wrong: [same("HEAD"), same("GET"), same("TRACE")],
    explain: {
      uz: "Bu “oldindan so‘rov” (preflight) deyiladi.",
      en: "It is called a preflight request.",
    },
  },
  {
    ask: {
      uz: "Cookie bilan ishlaydigan API uchun qaysi CORS sozlamasi xavfli?",
      en: "Which CORS setting is risky for an API that uses cookies?",
    },
    right: same("Access-Control-Allow-Origin: * (or reflecting any Origin)"),
    wrong: [
      same("Access-Control-Allow-Origin: https://app.example.uz"),
      same("Vary: Origin"),
      same("No CORS headers at all"),
    ],
    explain: {
      uz: "Har qanday manbaga ruxsat berish begona saytga foydalanuvchi ma’lumotini o‘qish imkonini beradi.",
      en: "Allowing any origin lets a foreign site read the user’s data.",
    },
  },
  {
    ask: {
      uz: "Sahifani boshqa saytga ramka ichiga qo‘yishni (clickjacking) qaysi sarlavha taqiqlaydi?",
      en: "Which header stops other sites framing the page (clickjacking)?",
    },
    right: same("X-Frame-Options: DENY"),
    wrong: [
      same("X-Powered-By: Express"),
      same("Cache-Control: no-store"),
      same("Server: nginx"),
    ],
    explain: {
      uz: "Zamonaviy usul — CSP’dagi frame-ancestors; X-Frame-Options ham keng qo‘llanadi.",
      en: "The modern way is CSP frame-ancestors; X-Frame-Options is still widely used.",
    },
  },
  {
    ask: {
      uz: "Content-Security-Policy asosan qaysi hujumning ta’sirini kamaytiradi?",
      en: "Content-Security-Policy mainly limits the damage of which attack?",
    },
    right: same("XSS"),
    wrong: [same("CSRF"), same("Brute force"), same("Clickjacking only")],
    explain: {
      uz: "CSP qaysi skriptlar ishlashi mumkinligini belgilaydi.",
      en: "CSP decides which scripts may run.",
    },
  },
  {
    ask: {
      uz: "Server admin huquqini Referer sarlavhasiga qarab beradi. Bu nega xato?",
      en: "A server grants admin rights based on the Referer header. Why is that wrong?",
    },
    right: {
      uz: "Barcha sarlavhalarni foydalanuvchi o‘zi yozishi mumkin",
      en: "The user can write every header themselves",
    },
    wrong: [
      { uz: "Referer har doim bo‘sh keladi", en: "Referer is always empty" },
      {
        uz: "Referer faqat HTTPS’da ishlaydi",
        en: "Referer only works over HTTPS",
      },
      { uz: "Xato emas, bu xavfsiz", en: "It is not wrong; it is safe" },
    ],
    explain: {
      uz: "Huquq faqat server tomonidagi sessiya va ruxsatlar bilan tekshiriladi.",
      en: "Rights are checked only against the server-side session and permissions.",
    },
  },
];
