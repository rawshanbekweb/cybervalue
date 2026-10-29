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

// Academy Intermediate · Untrusted input.
export const INPUT_POOL: PoolItem[] = [
  {
    ask: {
      uz: "Qaysi qiymatni foydalanuvchi o‘zgartira olmaydi?",
      en: "Which value can the user not change?",
    },
    right: {
      uz: "Serverdagi sessiyada saqlangan foydalanuvchi ID",
      en: "The user ID stored in the server-side session",
    },
    wrong: [
      { uz: "Yashirin forma maydoni", en: "A hidden form field" },
      same("Cookie: role=user"),
      same("User-Agent"),
    ],
    explain: {
      uz: "So‘rov ichida kelgan hamma narsa mijoz nazoratida; sessiya ma’lumoti serverda qoladi.",
      en: "Everything inside the request is the client’s; session data stays on the server.",
    },
  },
  {
    ask: {
      uz: "Nom maydoniga bitta ' yuborilganda sintaksis xatosi keldi. Bu nimani bildiradi?",
      en: "Sending a single ' in the name field returns a syntax error. What does it show?",
    },
    right: {
      uz: "Kiritilgan matn SQL so‘rovi ichiga tushyapti",
      en: "The input lands inside the SQL query",
    },
    wrong: [
      { uz: "Server ishlamayapti", en: "The server is down" },
      { uz: "Parol noto‘g‘ri", en: "The password is wrong" },
      { uz: "So‘rov parametrli", en: "The query is parameterized" },
    ],
    explain: {
      uz: "Qo‘shtirnoq so‘rov chegarasini buzdi — ma’lumot kod bilan aralashgan.",
      en: "The quote broke the query’s boundary — data is mixed with code.",
    },
  },
  {
    ask: {
      uz: "SQL’da -- belgisi nima qiladi?",
      en: "What does -- do in SQL?",
    },
    right: {
      uz: "Satrning qolgan qismini izohga aylantiradi",
      en: "Turns the rest of the line into a comment",
    },
    wrong: [
      { uz: "Ikki qiymatni ayiradi", en: "Subtracts two values" },
      { uz: "So‘rovni tezlashtiradi", en: "Speeds the query up" },
      { uz: "Qatorni o‘chiradi", en: "Deletes a row" },
    ],
    explain: {
      uz: "Shuning uchun inyeksiyada parol tekshiruvi -- bilan “o‘chiriladi”.",
      en: "That is how an injection “switches off” the password check.",
    },
  },
  {
    ask: {
      uz: "SQL inyeksiyasidan eng ishonchli himoya qaysi?",
      en: "Which is the most reliable defence against SQL injection?",
    },
    right: { uz: "Parametrli so‘rovlar", en: "Parameterized queries" },
    wrong: [
      { uz: "' belgisini o‘chirish", en: "Deleting the ' character" },
      { uz: "Brauzerdagi tekshiruv", en: "A check in the browser" },
      { uz: "Xato xabarlarini yashirish", en: "Hiding error messages" },
    ],
    explain: {
      uz: "Parametrlar qiymatni so‘rov tuzilishidan butunlay ajratadi.",
      en: "Parameters keep the value completely apart from the query’s structure.",
    },
  },
  {
    ask: {
      uz: "Qaysi qismini parametr (?) qilib bo‘lmaydi?",
      en: "Which part cannot be a parameter (?)?",
    },
    right: {
      uz: "Jadval yoki ustun nomi (ORDER BY ustuni)",
      en: "A table or column name (the ORDER BY column)",
    },
    wrong: [
      { uz: "Foydalanuvchi nomi", en: "A username" },
      { uz: "Qidiruv so‘zi", en: "A search term" },
      { uz: "Mahsulot ID", en: "A product ID" },
    ],
    explain: {
      uz: "Nomlar so‘rov tuzilishining qismi; ular uchun allowlist ishlatiladi.",
      en: "Names are part of the query’s structure; use an allowlist for them.",
    },
  },
  {
    ask: {
      uz: "Fayl yo‘lini qanday tekshirish to‘g‘ri?",
      en: "What is the right way to check a file path?",
    },
    right: {
      uz: "Yo‘lni to‘liq hal qilib, ruxsat etilgan papka bilan boshlanishini tekshirish",
      en: "Resolve it fully, then check it starts with the allowed folder",
    },
    wrong: [
      { uz: "“../” ni bir marta o‘chirish", en: "Delete “../” once" },
      { uz: "Faqat kengaytmani tekshirish", en: "Check only the extension" },
      { uz: "Nomni katta harflarga o‘tkazish", en: "Upper-case the name" },
    ],
    explain: {
      uz: "Filtrlar aylanib o‘tiladi; faqat hal qilingan yo‘l ishonchli.",
      en: "Filters get bypassed; only the resolved path is reliable.",
    },
  },
  {
    ask: {
      uz: "/srv/files/../app/config.env yo‘li qayerga olib boradi?",
      en: "Where does /srv/files/../app/config.env lead?",
    },
    right: same("/srv/app/config.env"),
    wrong: [
      same("/srv/files/app/config.env"),
      same("/app/config.env"),
      same("/srv/files/config.env"),
    ],
    explain: {
      uz: ".. bir papka yuqoriga ko‘taradi: /srv/files → /srv.",
      en: ".. goes one folder up: /srv/files → /srv.",
    },
  },
  {
    ask: {
      uz: "Nega allowlist blocklistdan yaxshiroq?",
      en: "Why is an allowlist better than a blocklist?",
    },
    right: {
      uz: "U faqat ma’lum xavfsiz shaklni qabul qiladi, qolganini rad etadi",
      en: "It accepts only a known safe shape and refuses the rest",
    },
    wrong: [
      { uz: "U tezroq ishlaydi", en: "It runs faster" },
      { uz: "U kamroq kod talab qiladi", en: "It needs less code" },
      { uz: "U xatolarni yashiradi", en: "It hides errors" },
    ],
    explain: {
      uz: "Blocklist faqat oldindan o‘ylangan hujumlarni to‘xtatadi.",
      en: "A blocklist only stops the attacks someone thought of in advance.",
    },
  },
  {
    ask: {
      uz: "Qaysi regex “3–16 kichik harf, raqam yoki _” qoidasini to‘liq tekshiradi?",
      en: "Which regex fully checks “3–16 lowercase letters, digits or _”?",
    },
    right: same("^[a-z0-9_]{3,16}$"),
    wrong: [
      same("[a-z0-9_]{3,16}"),
      same("^[a-z0-9_]+"),
      same("^[a-zA-Z0-9_]{3,16}$"),
    ],
    explain: {
      uz: "^ va $ butun qiymatni tekshirishga majbur qiladi; to‘plamda katta harf yo‘q.",
      en: "^ and $ force the whole value to be checked; the set has no capitals.",
    },
  },
  {
    ask: {
      uz: "Kiritilgan qiymatni qayerda tekshirish shart?",
      en: "Where must input be validated?",
    },
    right: { uz: "Serverda", en: "On the server" },
    wrong: [
      { uz: "Faqat brauzerda", en: "Only in the browser" },
      { uz: "Faqat ma’lumotlar bazasida", en: "Only in the database" },
      {
        uz: "Hech qayerda, kodlash yetarli",
        en: "Nowhere; encoding is enough",
      },
    ],
    explain: {
      uz: "Brauzerdagi tekshiruvni chetlab o‘tish oson; u faqat qulaylik uchun.",
      en: "A browser check is easy to skip; it is only a convenience.",
    },
  },
  {
    ask: {
      uz: 'Qiymat value="…" atributiga chiqadi. Faqat < va > almashtirildi. Nima xavfli qoldi?',
      en: 'A value goes into value="…". Only < and > were replaced. What is still dangerous?',
    },
    right: { uz: 'Qo‘shtirnoq (")', en: 'The quote (")' },
    wrong: [
      { uz: "Probel", en: "A space" },
      { uz: "Raqamlar", en: "Digits" },
      { uz: "Hech narsa", en: "Nothing" },
    ],
    explain: {
      uz: "Qo‘shtirnoq atributni yopadi va yangi atribut boshlanadi.",
      en: "A quote closes the attribute and a new one begins.",
    },
  },
  {
    ask: {
      uz: "React’da qaysi yo‘l avtomatik kodlashni chetlab o‘tadi?",
      en: "Which path in React bypasses automatic encoding?",
    },
    right: same("dangerouslySetInnerHTML"),
    wrong: [same("{name}"), same("className"), same("useState")],
    explain: {
      uz: "{name} har doim matn sifatida kodlanadi; dangerouslySetInnerHTML esa HTML’ni o‘zgarishsiz qo‘yadi.",
      en: "{name} is always encoded as text; dangerouslySetInnerHTML inserts HTML unchanged.",
    },
  },
];

// Academy Intermediate · Browser-side risks.
export const BROWSER_POOL: PoolItem[] = [
  {
    ask: {
      uz: "XSS nima?",
      en: "What is XSS?",
    },
    right: {
      uz: "Begona kodning sizning sahifangizda ishga tushishi",
      en: "Foreign code running on your page",
    },
    wrong: [
      { uz: "Parolni taxmin qilish", en: "Guessing a password" },
      {
        uz: "Serverni so‘rovlar bilan to‘ldirish",
        en: "Flooding a server with requests",
      },
      { uz: "Bazadagi so‘rovni buzish", en: "Breaking a database query" },
    ],
    explain: {
      uz: "Skript sahifada sayt egasining huquqlari bilan ishlaydi.",
      en: "The script runs on the page with the site owner’s rights.",
    },
  },
  {
    ask: {
      uz: "Foydalanuvchi matnini sahifaga xavfsiz qo‘yish uchun nima ishlatiladi?",
      en: "What places user text on a page safely?",
    },
    right: same("element.textContent"),
    wrong: [
      same("element.innerHTML"),
      same("document.write()"),
      same("insertAdjacentHTML()"),
    ],
    explain: {
      uz: "textContent matnni hech qachon HTML sifatida o‘qimaydi.",
      en: "textContent never reads the text as HTML.",
    },
  },
  {
    ask: {
      uz: "Stored XSS reflected XSS dan nimasi bilan farq qiladi?",
      en: "How does stored XSS differ from reflected XSS?",
    },
    right: {
      uz: "U saqlanadi va sahifani ochgan har bir kishiga ko‘rsatiladi",
      en: "It is saved and shown to everyone who opens the page",
    },
    wrong: [
      { uz: "U faqat serverda ishlaydi", en: "It runs only on the server" },
      { uz: "U faqat HTTPS da ishlaydi", en: "It works only over HTTPS" },
      { uz: "Hech qanday farq yo‘q", en: "There is no difference" },
    ],
    explain: {
      uz: "Reflected XSS havolada bo‘ladi va faqat uni ochgan odamga ta’sir qiladi.",
      en: "Reflected XSS lives in a link and affects only whoever opens it.",
    },
  },
  {
    ask: {
      uz: "Profil havolasiga qaysi manzil qo‘yilmasligi kerak?",
      en: "Which address must not go into a profile link?",
    },
    right: same("javascript:…"),
    wrong: [
      same("https://kitob.uz/ali"),
      same("/profil/ali"),
      same("http://blog.example.uz"),
    ],
    explain: {
      uz: "javascript: sxemasi bosilganda kod ishga tushiradi; faqat http(s) ga ruxsat bering.",
      en: "The javascript: scheme runs code when clicked; allow only http(s).",
    },
  },
  {
    ask: {
      uz: "CSP’da qaysi qiymatdan qochish kerak?",
      en: "Which CSP value should be avoided?",
    },
    right: same("'unsafe-inline'"),
    wrong: [same("'self'"), same("'none'"), same("https://cdn.example")],
    explain: {
      uz: "U sahifa ichidagi skriptlarni ishga tushiradi — aynan XSS kodini.",
      en: "It runs scripts written in the page — exactly the XSS code.",
    },
  },
  {
    ask: {
      uz: "CSP’da script-src yozilmagan bo‘lsa, skriptlar uchun qaysi qoida ishlaydi?",
      en: "With no script-src in the CSP, which rule covers scripts?",
    },
    right: same("default-src"),
    wrong: [
      same("img-src"),
      { uz: "Hech qaysi", en: "None" },
      same("frame-ancestors"),
    ],
    explain: {
      uz: "default-src yozilmagan turlar uchun umumiy qoida.",
      en: "default-src is the fallback for types not listed.",
    },
  },
  {
    ask: {
      uz: "CSRF nima?",
      en: "What is CSRF?",
    },
    right: {
      uz: "Begona saytning sizning nomingizdan so‘rov yuborishi",
      en: "A foreign site sending requests in your name",
    },
    wrong: [
      { uz: "Sahifaga skript qo‘shish", en: "Adding a script to a page" },
      { uz: "Cookie’ni shifrlash", en: "Encrypting a cookie" },
      { uz: "Parolni o‘g‘irlash", en: "Stealing a password" },
    ],
    explain: {
      uz: "Brauzer cookie’ni o‘zi qo‘shadi, shuning uchun server so‘rovni sizniki deb o‘ylaydi.",
      en: "The browser adds the cookie itself, so the server thinks the request is yours.",
    },
  },
  {
    ask: {
      uz: "SameSite=Lax cookie boshqa saytdagi yashirin POST formasi bilan yuboriladimi?",
      en: "Is a SameSite=Lax cookie sent with a hidden POST form on another site?",
    },
    right: { uz: "Yo‘q", en: "No" },
    wrong: [
      { uz: "Ha, har doim", en: "Yes, always" },
      { uz: "Faqat HTTPS da", en: "Only over HTTPS" },
      { uz: "Faqat birinchi marta", en: "Only the first time" },
    ],
    explain: {
      uz: "Lax faqat oddiy o‘tishda (GET havola) yuboriladi.",
      en: "Lax is sent only on plain navigation (a GET link).",
    },
  },
  {
    ask: {
      uz: "CSRF tokeni nima uchun ishlaydi?",
      en: "Why does a CSRF token work?",
    },
    right: {
      uz: "Begona sayt uning qiymatini bila olmaydi",
      en: "A foreign site cannot know its value",
    },
    wrong: [
      { uz: "U cookie’ni shifrlaydi", en: "It encrypts the cookie" },
      { uz: "U so‘rovni tezlashtiradi", en: "It speeds up the request" },
      { uz: "U parolni almashtiradi", en: "It replaces the password" },
    ],
    explain: {
      uz: "Token faqat bankning o‘z formasida bo‘ladi va har bir so‘rovda tekshiriladi.",
      en: "The token exists only in the bank’s own form and is checked on every request.",
    },
  },
  {
    ask: {
      uz: "Nega ma’lumotni o‘zgartiradigan amallar GET bilan bo‘lmasligi kerak?",
      en: "Why must actions that change data never use GET?",
    },
    right: {
      uz: "Lax cookie boshqa saytdagi GET havolasida ham yuboriladi",
      en: "A Lax cookie is sent on a GET link from another site too",
    },
    wrong: [
      { uz: "GET sekin", en: "GET is slow" },
      { uz: "GET da sarlavha bo‘lmaydi", en: "GET has no headers" },
      { uz: "Brauzerlar GET ni bloklaydi", en: "Browsers block GET" },
    ],
    explain: {
      uz: "Shuning uchun pul o‘tkazish, o‘chirish va sozlash POST bilan bo‘lsin.",
      en: "So transfers, deletions and settings use POST.",
    },
  },
  {
    ask: {
      uz: "Clickjacking’dan qaysi sarlavha himoya qiladi?",
      en: "Which header protects against clickjacking?",
    },
    right: same("frame-ancestors 'none'"),
    wrong: [
      same("frame-src 'none'"),
      same("Access-Control-Allow-Origin: *"),
      same("Cache-Control: no-store"),
    ],
    explain: {
      uz: "frame-ancestors sahifani kim ramkaga olishi mumkinligini belgilaydi.",
      en: "frame-ancestors sets who may frame the page.",
    },
  },
  {
    ask: {
      uz: "HTML kerak bo‘lganda (formatlangan matn) uni qanday chiqarish kerak?",
      en: "When HTML is really needed (formatted text), how should it be shown?",
    },
    right: {
      uz: "Ruxsat etilgan teglar ro‘yxati bilan tozalovchi kutubxona orqali",
      en: "Through a sanitiser with an allowlist of tags",
    },
    wrong: [
      { uz: "To‘g‘ridan-to‘g‘ri innerHTML ga", en: "Straight into innerHTML" },
      { uz: "<script> so‘zini o‘chirib", en: "By deleting the word <script>" },
      { uz: "Base64 qilib", en: "As Base64" },
    ],
    explain: {
      uz: "Taqiqlar ro‘yxati aylanib o‘tiladi; faqat ruxsat etilgan teglarni qoldiring.",
      en: "Blocklists get bypassed; keep only allowed tags.",
    },
  },
];

export const ACCESS_POOL: PoolItem[] = [
  {
    ask: {
      uz: "Autentifikatsiya qaysi savolga javob beradi?",
      en: "Which question does authentication answer?",
    },
    right: { uz: "Siz kimsiz?", en: "Who are you?" },
    wrong: [
      { uz: "Sizga bunga ruxsat bormi?", en: "Are you allowed to do this?" },
      { uz: "So‘rov qayerdan keldi?", en: "Where did the request come from?" },
      { uz: "Ma’lumot shifrlanganmi?", en: "Is the data encrypted?" },
    ],
    explain: {
      uz: "Avtorizatsiya — “ruxsat bormi?”, autentifikatsiya — “kim?”.",
      en: "Authorization is “allowed?”, authentication is “who?”.",
    },
  },
  {
    ask: {
      uz: "Ali /api/orders/1042 ni ochdi va Valining buyurtmasini ko‘rdi. Server nimani tekshirmagan?",
      en: "Ali opened /api/orders/1042 and saw Vali’s order. What did the server not check?",
    },
    right: {
      uz: "Buyurtma shu foydalanuvchiga tegishli ekanini",
      en: "That the order belongs to this user",
    },
    wrong: [
      { uz: "Alining tizimga kirganini", en: "That Ali is signed in" },
      {
        uz: "So‘rov HTTPS orqali kelganini",
        en: "That the request came over HTTPS",
      },
      {
        uz: "Buyurtma raqami sonligini",
        en: "That the order number is a number",
      },
    ],
    explain: {
      uz: "Bu IDOR: egalik har bir so‘rovda serverda tekshirilishi kerak.",
      en: "This is IDOR: ownership must be checked on the server on every request.",
    },
  },
  {
    ask: {
      uz: "Egalik tekshiruvi bo‘lgan so‘rov qaysi?",
      en: "Which query checks ownership?",
    },
    right: same("SELECT * FROM orders WHERE id = ? AND owner = ?"),
    wrong: [
      same("SELECT * FROM orders WHERE id = ?"),
      same("SELECT * FROM orders WHERE owner LIKE '%'"),
      same("SELECT * FROM orders ORDER BY id"),
    ],
    explain: {
      uz: "Yozuv faqat egasi so‘raganda qaytadi.",
      en: "The record comes back only when its owner asks.",
    },
  },
  {
    ask: {
      uz: "Buyurtma raqamlarini tasodifiy UUID ga almashtirish IDOR ni to‘liq tuzatadimi?",
      en: "Does switching order numbers to random UUIDs fully fix IDOR?",
    },
    right: {
      uz: "Yo‘q: taxminni qiyinlashtiradi, lekin egalik tekshiruvi baribir kerak",
      en: "No: it makes guessing harder, but the ownership check is still needed",
    },
    wrong: [
      {
        uz: "Ha, UUID ni hech kim bilmaydi",
        en: "Yes, nobody can know a UUID",
      },
      { uz: "Ha, agar HTTPS bo‘lsa", en: "Yes, if HTTPS is used" },
      { uz: "Faqat adminlar uchun", en: "Only for admins" },
    ],
    explain: {
      uz: "Havola loglar yoki xatlar orqali sizib chiqishi mumkin.",
      en: "A link can leak through logs or messages.",
    },
  },
  {
    ask: {
      uz: "Admin tugmasi oddiy foydalanuvchilardan yashirilgan. Bu yetarlimi?",
      en: "The admin button is hidden from ordinary users. Is that enough?",
    },
    right: {
      uz: "Yo‘q: server API’da rolni tekshirishi kerak",
      en: "No: the server must check the role on the API",
    },
    wrong: [
      {
        uz: "Ha, tugma ko‘rinmasa, bosib bo‘lmaydi",
        en: "Yes, a button nobody sees cannot be clicked",
      },
      {
        uz: "Ha, agar tugma disabled bo‘lsa",
        en: "Yes, if the button is disabled",
      },
      {
        uz: "Ha, agar sahifa React’da bo‘lsa",
        en: "Yes, if the page uses React",
      },
    ],
    explain: {
      uz: "So‘rovni tugmasiz ham yuborish mumkin.",
      en: "The request can be sent without the button.",
    },
  },
  {
    ask: {
      uz: "“Deny by default” nimani anglatadi?",
      en: "What does “deny by default” mean?",
    },
    right: {
      uz: "Har bir yo‘l yopiq, ruxsat aniq qoida bilan beriladi",
      en: "Every route is closed until an explicit rule opens it",
    },
    wrong: [
      { uz: "Barcha so‘rovlar rad etiladi", en: "Every request is refused" },
      { uz: "Faqat adminlar kira oladi", en: "Only admins can get in" },
      {
        uz: "Xatolar foydalanuvchiga ko‘rsatilmaydi",
        en: "Errors are not shown to users",
      },
    ],
    explain: {
      uz: "Shunda unutilgan yo‘l ochiq qolmaydi.",
      en: "Then a forgotten route does not stay open.",
    },
  },
  {
    ask: {
      uz: "JWT necha qismdan iborat?",
      en: "How many parts does a JWT have?",
    },
    right: {
      uz: "Uch: sarlavha, payload va imzo",
      en: "Three: header, payload and signature",
    },
    wrong: [
      { uz: "Ikki: login va parol", en: "Two: login and password" },
      { uz: "Bitta shifrlangan qism", en: "One encrypted part" },
      {
        uz: "To‘rt: kalit, sir, vaqt va imzo",
        en: "Four: key, secret, time and signature",
      },
    ],
    explain: {
      uz: "Qismlar nuqta bilan ajratiladi.",
      en: "The parts are separated by dots.",
    },
  },
  {
    ask: {
      uz: "JWT payload’i qanday himoyalangan?",
      en: "How is a JWT payload protected?",
    },
    right: {
      uz: "Imzo uni o‘zgartirishdan himoya qiladi, lekin uni har kim o‘qiy oladi",
      en: "The signature guards it against changes, but anyone can read it",
    },
    wrong: [
      {
        uz: "U shifrlangan, faqat server o‘qiydi",
        en: "It is encrypted; only the server reads it",
      },
      { uz: "Hech qanday himoya yo‘q", en: "It has no protection at all" },
      {
        uz: "Uni faqat brauzer o‘qiy oladi",
        en: "Only the browser can read it",
      },
    ],
    explain: {
      uz: "Payload faqat Base64URL bilan yozilgan.",
      en: "The payload is only Base64URL.",
    },
  },
  {
    ask: {
      uz: "Ali tokendagi role ni admin ga o‘zgartirdi, imzo eskicha qoldi. Imzoni tekshiradigan server nima qiladi?",
      en: "Ali changed the role in his token to admin and kept the old signature. What does a server that checks signatures do?",
    },
    right: {
      uz: "Rad etadi: imzo mos kelmaydi",
      en: "Refuses it: the signature does not match",
    },
    wrong: [
      {
        uz: "Qabul qiladi: token o‘qiladi",
        en: "Accepts it: the token can be read",
      },
      { uz: "Alini admin qiladi", en: "Makes Ali an admin" },
      {
        uz: "Tokenning muddatini uzaytiradi",
        en: "Extends the token’s lifetime",
      },
    ],
    explain: {
      uz: "Imzo sarlavha va payload’dan server siri bilan hisoblanadi.",
      en: "The signature is computed from the header and payload with the server’s secret.",
    },
  },
  {
    ask: {
      uz: "alg: none hujumini nima to‘xtatadi?",
      en: "What stops the alg: none attack?",
    },
    right: {
      uz: "Ruxsat etilgan algoritmni serverda belgilash",
      en: "Fixing the allowed algorithm on the server",
    },
    wrong: [
      { uz: "Tokenni uzunroq qilish", en: "Making the token longer" },
      { uz: "Tokenni cookie’da saqlash", en: "Keeping the token in a cookie" },
      {
        uz: "Payload’ga parol qo‘shish",
        en: "Adding the password to the payload",
      },
    ],
    explain: {
      uz: "Algoritmni tokendan olgan server hujumchiga tanlov beradi.",
      en: "A server that takes the algorithm from the token lets the attacker choose it.",
    },
  },
  {
    ask: {
      uz: "Qaysi ma’lumot JWT payload’iga yozilmasligi kerak?",
      en: "Which data must not go in a JWT payload?",
    },
    right: { uz: "Foydalanuvchi paroli", en: "The user’s password" },
    wrong: [
      { uz: "Foydalanuvchi ID (sub)", en: "The user ID (sub)" },
      { uz: "Amal qilish muddati (exp)", en: "The expiry time (exp)" },
      { uz: "Rol", en: "The role" },
    ],
    explain: {
      uz: "Payload’ni tokenni ko‘rgan har kim o‘qiydi.",
      en: "Anyone who sees the token reads the payload.",
    },
  },
  {
    ask: {
      uz: "Hujumchi SIM almashtirish bilan raqamingizni oldi. Qaysi ikkinchi omil o‘g‘irlanadi?",
      en: "An attacker took your number with a SIM swap. Which second factor is stolen?",
    },
    right: { uz: "SMS kod", en: "The SMS code" },
    wrong: [
      { uz: "Ilovadagi TOTP kod", en: "The TOTP app code" },
      { uz: "Xavfsizlik kaliti", en: "The security key" },
      { uz: "Passkey", en: "The passkey" },
    ],
    explain: {
      uz: "SMS raqamga keladi; raqam boshqa kartada bo‘lsa, kod hujumchiga boradi.",
      en: "SMS goes to the number; once it is on another card, the code goes to the attacker.",
    },
  },
  {
    ask: {
      uz: "Nega passkey soxta kirish sahifasidan himoya qiladi?",
      en: "Why does a passkey protect against a fake sign-in page?",
    },
    right: {
      uz: "U faqat saytning haqiqiy manzili uchun imzo qo‘yadi",
      en: "It signs only for the site’s real address",
    },
    wrong: [
      { uz: "U uzunroq kod yuboradi", en: "It sends a longer code" },
      { uz: "U SMS orqali keladi", en: "It arrives by SMS" },
      { uz: "U parolni shifrlaydi", en: "It encrypts the password" },
    ],
    explain: {
      uz: "Soxta sahifa haqiqiy saytga uzatadigan hech narsa olmaydi.",
      en: "The fake page gets nothing it can pass to the real site.",
    },
  },
  {
    ask: {
      uz: "Kirish xato bo‘lganda qaysi xabar to‘g‘ri?",
      en: "Which message is right after a failed sign-in?",
    },
    right: { uz: "Email yoki parol noto‘g‘ri", en: "Wrong email or password" },
    wrong: [
      { uz: "Bunday email topilmadi", en: "No account with this email" },
      {
        uz: "Parol noto‘g‘ri, email to‘g‘ri",
        en: "Wrong password, the email is right",
      },
      {
        uz: "Parolning birinchi harfi xato",
        en: "The first letter of the password is wrong",
      },
    ],
    explain: {
      uz: "Umumiy xabar qaysi hisoblar mavjudligini oshkor qilmaydi.",
      en: "A shared message does not reveal which accounts exist.",
    },
  },
  {
    ask: {
      uz: "Parollarni saqlashning to‘g‘ri usuli?",
      en: "The right way to store passwords?",
    },
    right: {
      uz: "Argon2 yoki bcrypt, tuz bilan",
      en: "Argon2 or bcrypt, salted",
    },
    wrong: [
      { uz: "Base64 bilan kodlab", en: "Encoded in Base64" },
      {
        uz: "Ochiq matnda, lekin yopiq bazada",
        en: "In plain text, in a private database",
      },
      { uz: "Bitta MD5 xesh bilan", en: "As a single MD5 hash" },
    ],
    explain: {
      uz: "Sekin xesh har bir taxminni qimmat qiladi.",
      en: "A slow hash makes every guess expensive.",
    },
  },
];

export const API_POOL: PoolItem[] = [
  {
    ask: {
      uz: "Profil kartasi uchun API butun bazadagi yozuvni qaytaradi, ilova esa faqat ismni ko‘rsatadi. Muammo nimada?",
      en: "For a profile card the API returns the whole record and the app shows only the name. What is wrong?",
    },
    right: {
      uz: "Javobni har kim to‘liq o‘qiy oladi — ortiqcha maydonlar sizib chiqadi",
      en: "Anyone can read the full reply — the extra fields leak",
    },
    wrong: [
      {
        uz: "Hech narsa, ilova ularni ko‘rsatmaydi",
        en: "Nothing, the app does not show them",
      },
      { uz: "Faqat javob sekinlashadi", en: "Only the reply gets slower" },
      { uz: "Faqat HTTPS bo‘lmasa muammo", en: "Only a problem without HTTPS" },
    ],
    explain: {
      uz: "Filtr serverda bo‘lishi kerak, ilovada emas.",
      en: "The filter belongs on the server, not in the app.",
    },
  },
  {
    ask: {
      uz: "Ochiq profil javobida qaysi maydon bo‘lmasligi kerak?",
      en: "Which field must not be in a public profile reply?",
    },
    right: same("passwordHash"),
    wrong: [same("name"), same("avatar"), same("id")],
    explain: {
      uz: "Xesh qo‘lga tushsa, parolni oflayn taxmin qilish mumkin.",
      en: "With the hash, the password can be guessed offline.",
    },
  },
  {
    ask: {
      uz: "Mass assignment nima?",
      en: "What is mass assignment?",
    },
    right: {
      uz: "Server so‘rovdagi har qanday maydonni yozuvga ko‘chirishi",
      en: "The server copying any field in the request onto the record",
    },
    wrong: [
      {
        uz: "Bir vaqtda ko‘p so‘rov yuborish",
        en: "Sending many requests at once",
      },
      {
        uz: "Ko‘p foydalanuvchiga bir xil parol berish",
        en: "Giving many users the same password",
      },
      {
        uz: "Bazadagi barcha yozuvlarni o‘chirish",
        en: "Deleting every record in the database",
      },
    ],
    explain: {
      uz: "Shunda foydalanuvchi role yoki balance ni o‘zi o‘zgartira oladi.",
      en: "Then a user can change role or balance themselves.",
    },
  },
  {
    ask: {
      uz: "Mass assignment’dan qaysi kod himoyalanadi?",
      en: "Which code is safe from mass assignment?",
    },
    right: same("user.name = body.name; user.bio = body.bio;"),
    wrong: [
      same("Object.assign(user, body);"),
      same("user = { ...user, ...body };"),
      same("db.user.update({ data: body });"),
    ],
    explain: {
      uz: "Faqat ruxsat etilgan maydonlar o‘qiladi.",
      en: "Only the allowed fields are read.",
    },
  },
  {
    ask: {
      uz: "Sxema: quantity — 1 dan 10 gacha butun son. Qaysi tana o‘tadi?",
      en: "Schema: quantity is a whole number from 1 to 10. Which body passes?",
    },
    right: same('{"quantity": 4}'),
    wrong: [
      same('{"quantity": "4"}'),
      same('{"quantity": 0}'),
      same('{"quantity": 4.5}'),
    ],
    explain: {
      uz: "Tur, oraliq va butunlik — hammasi tekshiriladi.",
      en: "Type, range and wholeness are all checked.",
    },
  },
  {
    ask: {
      uz: 'Buyurtma so‘rovida "price": 0 kelsa, server nima qilishi kerak?',
      en: 'An order request arrives with "price": 0. What should the server do?',
    },
    right: {
      uz: "Rad etish yoki e’tiborsiz qoldirish — narxni o‘zi hisoblaydi",
      en: "Refuse or ignore it — it works out the price itself",
    },
    wrong: [
      { uz: "Narxni 0 deb qabul qilish", en: "Take the price as 0" },
      { uz: "Narxni ikki baravar oshirish", en: "Double the price" },
      { uz: "Foydalanuvchini bloklash", en: "Block the user" },
    ],
    explain: {
      uz: "Narx kabi qiymatlar hech qachon mijozdan olinmaydi.",
      en: "Values like the price never come from the client.",
    },
  },
  {
    ask: {
      uz: "50 ta IP’li hujumchi bitta hisob parolini taxmin qilmoqda. Qaysi cheklov samarali?",
      en: "An attacker with 50 IPs guesses one account’s password. Which limit works?",
    },
    right: { uz: "Hisob bo‘yicha cheklov", en: "A limit per account" },
    wrong: [
      { uz: "Faqat IP bo‘yicha cheklov", en: "A limit per IP only" },
      { uz: "Faqat CAPTCHA’siz cheklov", en: "A limit without any key" },
      { uz: "Cheklov emas, uzunroq javob", en: "No limit, a longer reply" },
    ],
    explain: {
      uz: "Hujumchi IP almashtiradi, hisob esa bitta.",
      en: "The attacker swaps IPs; the account stays the same.",
    },
  },
  {
    ask: {
      uz: "Chegaradan oshgan so‘rovga qaysi status kod qaytariladi?",
      en: "Which status code answers a request over the limit?",
    },
    right: same("429 Too Many Requests"),
    wrong: [same("403 Forbidden"), same("404 Not Found"), same("200 OK")],
    explain: {
      uz: "Retry-After sarlavhasi qachon qayta urinishni aytadi.",
      en: "The Retry-After header says when to try again.",
    },
  },
  {
    ask: {
      uz: "Kirish cheklovini juda past (daqiqasiga 1) qilish nimaga olib keladi?",
      en: "What does a very low sign-in limit (1 a minute) cause?",
    },
    right: {
      uz: "Xato yozgan haqiqiy foydalanuvchilar bloklanadi",
      en: "Real users who mistype get blocked",
    },
    wrong: [
      { uz: "Hech narsa, faqat foyda", en: "Nothing, only benefit" },
      { uz: "Server tezlashadi", en: "The server gets faster" },
      { uz: "Parollar avtomatik almashadi", en: "Passwords change themselves" },
    ],
    explain: {
      uz: "Cheklov hujumni sekinlashtirsin, foydalanuvchini to‘xtatmasin.",
      en: "A limit should slow the attack, not stop the user.",
    },
  },
  {
    ask: {
      uz: "SMS xizmati API kaliti qayerda saqlanadi?",
      en: "Where is an SMS service API key kept?",
    },
    right: {
      uz: "Serverdagi muhit o‘zgaruvchisi yoki secret manager’da",
      en: "In a server environment variable or a secret manager",
    },
    wrong: [
      { uz: "Mobil ilova kodida", en: "In the mobile app’s code" },
      { uz: "Git’dagi config faylda", en: "In a config file in git" },
      { uz: "Brauzer JavaScript’ida", en: "In the browser’s JavaScript" },
    ],
    explain: {
      uz: "Foydalanuvchiga yetib boradigan kodni har kim ochib ko‘ra oladi.",
      en: "Anyone can open code that reaches the user.",
    },
  },
  {
    ask: {
      uz: "Nega API kalitini manzilda (?key=) yubormaslik kerak?",
      en: "Why should an API key not go in the URL (?key=)?",
    },
    right: {
      uz: "Manzillar loglarga va tarixga yoziladi",
      en: "Addresses get written to logs and history",
    },
    wrong: [
      { uz: "Manzil juda uzun bo‘lib ketadi", en: "The address gets too long" },
      { uz: "Server uni o‘qiy olmaydi", en: "The server cannot read it" },
      { uz: "HTTPS uni bloklaydi", en: "HTTPS blocks it" },
    ],
    explain: {
      uz: "Kalit Authorization sarlavhasida yuboriladi.",
      en: "Send the key in the Authorization header.",
    },
  },
  {
    ask: {
      uz: "/api/v1 eski va tekshiruvsiz, lekin hali ishlaydi. Bu qaysi xavf?",
      en: "The old /api/v1 has no checks but still runs. Which risk is this?",
    },
    right: {
      uz: "API inventari: unutilgan versiya ochiq qolgan",
      en: "API inventory: a forgotten version left open",
    },
    wrong: [
      { uz: "XSS", en: "XSS" },
      { uz: "CSRF", en: "CSRF" },
      { uz: "Clickjacking", en: "Clickjacking" },
    ],
    explain: {
      uz: "Har bir endpoint ro‘yxatda bo‘lishi va bir xil himoyalanishi kerak.",
      en: "Every endpoint should be listed and protected the same way.",
    },
  },
  {
    ask: {
      uz: "“URL’dan rasm yuklash” endpoint’i 169.254.169.254 ga so‘rov yubordi. Bu nima?",
      en: "An “upload from URL” endpoint called 169.254.169.254. What is this?",
    },
    right: {
      uz: "SSRF: server ichki manzilga so‘rov yuborishga majburlandi",
      en: "SSRF: the server was made to call an internal address",
    },
    wrong: [
      { uz: "Oddiy rasm yuklash", en: "An ordinary picture upload" },
      { uz: "Mass assignment", en: "Mass assignment" },
      { uz: "Tezlik cheklovi", en: "A rate limit" },
    ],
    explain: {
      uz: "Bu bulut metadata manzili; ruxsat etilgan hostlar ro‘yxatini ishlating.",
      en: "That is the cloud metadata address; use an allowlist of hosts.",
    },
  },
  {
    ask: {
      uz: "Qaysi CORS sozlamasi xavfli?",
      en: "Which CORS setup is dangerous?",
    },
    right: {
      uz: "Har qanday Origin’ni aks ettirish va Allow-Credentials: true",
      en: "Echoing any Origin with Allow-Credentials: true",
    },
    wrong: [
      {
        uz: "Faqat o‘z ilovangiz manziliga ruxsat",
        en: "Allowing only your own app’s origin",
      },
      { uz: "CORS sarlavhalarini bermaslik", en: "Sending no CORS headers" },
      { uz: "Faqat GET uchun ruxsat", en: "Allowing GET only" },
    ],
    explain: {
      uz: "Shunda begona sayt foydalanuvchi cookie’si bilan javobni o‘qiydi.",
      en: "Then a foreign site reads replies with the user’s cookie.",
    },
  },
  {
    ask: {
      uz: "Xatolik javobida stack trace ko‘rsatish nega xavfli?",
      en: "Why is showing a stack trace in an error reply risky?",
    },
    right: {
      uz: "U kod tuzilishi, kutubxonalar va yo‘llarni oshkor qiladi",
      en: "It reveals the code’s structure, libraries and paths",
    },
    wrong: [
      { uz: "U sahifani sekinlashtiradi", en: "It slows the page down" },
      { uz: "U parolni o‘chiradi", en: "It deletes the password" },
      { uz: "Hech qanday xavf yo‘q", en: "There is no risk" },
    ],
    explain: {
      uz: "Foydalanuvchiga umumiy xabar, tafsilotlar esa loglarga.",
      en: "A general message to the user; the details go to the logs.",
    },
  },
];

export const CLASSIC_POOL: PoolItem[] = [
  {
    ask: {
      uz: "Sezar shifrida 3 siljish bilan “a” qaysi harfga aylanadi?",
      en: "With a Caesar shift of 3, what does “a” become?",
    },
    right: same("d"),
    wrong: [same("c"), same("x"), same("b")],
    explain: {
      uz: "a → b → c → d: uch qadam oldinga.",
      en: "a → b → c → d: three steps on.",
    },
  },
  {
    ask: {
      uz: "Sezar shifrini buzishning eng oddiy usuli?",
      en: "The simplest way to break a Caesar cipher?",
    },
    right: {
      uz: "Barcha 25 kalitni sinab chiqish",
      en: "Try all 25 keys",
    },
    wrong: [
      { uz: "Kalitni serverdan so‘rash", en: "Ask the server for the key" },
      { uz: "Matnni ikki marta shifrlash", en: "Encrypt the text twice" },
      { uz: "Buzib bo‘lmaydi", en: "It cannot be broken" },
    ],
    explain: {
      uz: "Kalitlar juda kam, shuning uchun brute force bir zumda ishlaydi.",
      en: "There are so few keys that brute force works at once.",
    },
  },
  {
    ask: {
      uz: "O‘zbekcha uzun matnda eng ko‘p uchraydigan harf qaysi?",
      en: "Which letter is most frequent in a long Uzbek text?",
    },
    right: same("a"),
    wrong: [same("z"), same("q"), same("x")],
    explain: {
      uz: "Shu sababli eng ko‘p uchragan shifr harfi odatda “a” ning o‘rnida turadi.",
      en: "So the most frequent cipher letter usually stands for “a”.",
    },
  },
  {
    ask: {
      uz: "Sezar matnida eng ko‘p uchragan harf “l”. Ehtimoliy kalit (siljish) qancha?",
      en: "The most frequent letter of a Caesar text is “l”. What is the likely key (shift)?",
    },
    right: same("11"),
    wrong: [same("12"), same("10"), same("3")],
    explain: {
      uz: "“l” “a” dan 11 harf keyin turadi.",
      en: "“l” is 11 letters after “a”.",
    },
  },
  {
    ask: {
      uz: "Oddiy almashtirish shifrida 26! kalit bor. Nega u baribir zaif?",
      en: "A simple substitution cipher has 26! keys. Why is it still weak?",
    },
    right: {
      uz: "Harflar chastotasi shifr matnida saqlanadi",
      en: "Letter frequencies survive in the ciphertext",
    },
    wrong: [
      { uz: "26! juda kichik son", en: "26! is a small number" },
      {
        uz: "Kalit matnning oxirida yoziladi",
        en: "The key is written at the end",
      },
      { uz: "U faqat raqamlarni shifrlaydi", en: "It encrypts digits only" },
    ],
    explain: {
      uz: "Kalitlar soni ko‘p bo‘lsa ham, til izlari yo‘qolmaydi.",
      en: "However many keys there are, the language’s traces remain.",
    },
  },
  {
    ask: {
      uz: "Chastota tahlilini kim birinchi bo‘lib yozib qoldirgan?",
      en: "Who first wrote down frequency analysis?",
    },
    right: { uz: "Al-Kindiy (IX asr)", en: "Al-Kindi (9th century)" },
    wrong: [
      { uz: "Yuliy Sezar", en: "Julius Caesar" },
      { uz: "Alan Turing", en: "Alan Turing" },
      { uz: "Blez de Vigenère", en: "Blaise de Vigenère" },
    ],
    explain: {
      uz: "Al-Kindiyning risolasi kriptotahlilning eng qadimgi qo‘llanmasi.",
      en: "Al-Kindi’s treatise is the oldest known manual of cryptanalysis.",
    },
  },
  {
    ask: {
      uz: "Vigenère shifri Sezardan nimasi bilan farq qiladi?",
      en: "How does Vigenère differ from Caesar?",
    },
    right: {
      uz: "Har bir harf kalit so‘zning navbatdagi harfi qadar suriladi",
      en: "Each letter moves by the next letter of a key word",
    },
    wrong: [
      { uz: "U faqat unlilarni shifrlaydi", en: "It encrypts vowels only" },
      {
        uz: "U harflarni teskari tartibda yozadi",
        en: "It writes letters backwards",
      },
      { uz: "Hech qanday farq yo‘q", en: "There is no difference" },
    ],
    explain: {
      uz: "Shuning uchun bir xil harf turli joyda turli harfga aylanadi.",
      en: "So the same letter becomes different letters in different places.",
    },
  },
  {
    ask: {
      uz: "“kalit” kaliti bilan Vigenère’da birinchi harf necha qadam suriladi?",
      en: "With the key “kalit”, how far does Vigenère move the first letter?",
    },
    right: same("10"),
    wrong: [same("11"), same("1"), same("0")],
    explain: {
      uz: "k — alifboning 11-harfi, a = 0 dan sanaganda 10.",
      en: "k is the 11th letter; counting a = 0, that is 10.",
    },
  },
  {
    ask: {
      uz: "Vigenère’ning asosiy zaifligi?",
      en: "Vigenère’s main weakness?",
    },
    right: { uz: "Kalit takrorlanadi", en: "The key repeats" },
    wrong: [
      { uz: "Kalit juda uzun", en: "The key is too long" },
      { uz: "Faqat raqamlar ishlatiladi", en: "Only digits are used" },
      {
        uz: "Shifr matni ochiq matndan qisqa",
        en: "The ciphertext is shorter",
      },
    ],
    explain: {
      uz: "Kalit uzunligi ma’lum bo‘lsa, matn bir nechta Sezar shifriga bo‘linadi.",
      en: "Once the key length is known, the text splits into Caesar ciphers.",
    },
  },
  {
    ask: {
      uz: "Xabar “salom” bilan boshlanishi ma’lum. Bu qaysi hujum?",
      en: "A message is known to start with “salom”. Which attack is this?",
    },
    right: {
      uz: "Ma’lum ochiq matn hujumi",
      en: "A known-plaintext attack",
    },
    wrong: [
      { uz: "Brute force", en: "Brute force" },
      { uz: "Fishing", en: "Phishing" },
      { uz: "DDoS", en: "DDoS" },
    ],
    explain: {
      uz: "Ochiq va shifrlangan harflarni solishtirib kalit tiklanadi.",
      en: "Comparing plain and cipher letters rebuilds the key.",
    },
  },
  {
    ask: {
      uz: "One-time pad xavfsiz bo‘lishi uchun qaysi shart kerak emas?",
      en: "Which condition is not needed for a one-time pad to be secure?",
    },
    right: {
      uz: "Algoritmni maxfiy saqlash",
      en: "Keeping the algorithm secret",
    },
    wrong: [
      { uz: "Kalit haqiqatan tasodifiy", en: "A truly random key" },
      { uz: "Kalit xabar uzunligida", en: "A key as long as the message" },
      { uz: "Kalit bir marta ishlatiladi", en: "The key is used once" },
    ],
    explain: {
      uz: "Algoritm ma’lum bo‘lsa ham, uchta shart bajarilsa — xavfsiz.",
      en: "Even with the algorithm known, the three conditions keep it secure.",
    },
  },
  {
    ask: {
      uz: "One-time pad kaliti ikki xabar uchun ishlatildi. Nima bo‘ladi?",
      en: "A one-time pad key was used for two messages. What happens?",
    },
    right: {
      uz: "Ikki shifr matnini birlashtirish kalitni yo‘qotadi va matnlarni ochish mumkin",
      en: "Combining the two ciphertexts cancels the key and the texts can be recovered",
    },
    wrong: [
      { uz: "Hech narsa, u baribir xavfsiz", en: "Nothing, it stays secure" },
      {
        uz: "Shifr ikki baravar kuchliroq bo‘ladi",
        en: "The cipher gets twice as strong",
      },
      { uz: "Xabarlar o‘chib ketadi", en: "The messages are deleted" },
    ],
    explain: {
      uz: "Nomining o‘zi aytib turibdi: kalit faqat bir marta.",
      en: "The name says it: the key is for one time only.",
    },
  },
  {
    ask: {
      uz: "Kerckhoffs tamoyili nima deydi?",
      en: "What does Kerckhoffs’s principle say?",
    },
    right: {
      uz: "Algoritm ma’lum bo‘lsa ham shifr xavfsiz qolishi kerak; maxfiy faqat kalit",
      en: "A cipher must stay secure even if the algorithm is known; only the key is secret",
    },
    wrong: [
      {
        uz: "Algoritm hech qachon oshkor qilinmasligi kerak",
        en: "The algorithm must never be revealed",
      },
      {
        uz: "Kalit algoritm ichida yozilishi kerak",
        en: "The key must be written into the algorithm",
      },
      {
        uz: "Har bir xabar uchun yangi algoritm kerak",
        en: "Each message needs a new algorithm",
      },
    ],
    explain: {
      uz: "Algoritmlar sizib chiqadi; xavfsizlik kalitga tayanishi kerak.",
      en: "Algorithms leak; security must rest on the key.",
    },
  },
  {
    ask: {
      uz: "Dasturchi o‘zi o‘ylab topgan shifrni ishlatmoqchi. To‘g‘ri maslahat?",
      en: "A developer wants to use a cipher they invented. The right advice?",
    },
    right: {
      uz: "Sinovdan o‘tgan standart kutubxonani ishlatish",
      en: "Use a tested, standard library",
    },
    wrong: [
      { uz: "Algoritmni yashirin saqlash", en: "Keep the algorithm hidden" },
      { uz: "Shifrni uch marta qo‘llash", en: "Apply the cipher three times" },
      {
        uz: "Faqat qisqa xabarlarni shifrlash",
        en: "Only encrypt short messages",
      },
    ],
    explain: {
      uz: "Uydirma shifrlar deyarli har doim oson buziladi.",
      en: "Home-made ciphers are almost always easy to break.",
    },
  },
  {
    ask: {
      uz: "Zamonaviy shifrlarda kalitlar soni qanchaga yaqin?",
      en: "Roughly how many keys do modern ciphers have?",
    },
    right: same("2¹²⁸"),
    wrong: [same("25"), same("26"), same("1000")],
    explain: {
      uz: "Bunday sonni sinab chiqish amalda imkonsiz.",
      en: "Trying that many is impossible in practice.",
    },
  },
];

export const SYMMETRIC_POOL: PoolItem[] = [
  {
    ask: {
      uz: "Simmetrik shifrlashning asosiy belgisi?",
      en: "The defining trait of symmetric encryption?",
    },
    right: {
      uz: "Bitta kalit ham shifrlaydi, ham ochadi",
      en: "One key both encrypts and decrypts",
    },
    wrong: [
      { uz: "Kalit umuman kerak emas", en: "No key is needed" },
      {
        uz: "Ochiq va yopiq kalit ishlatiladi",
        en: "A public and a private key are used",
      },
      { uz: "Ma’lumotni ochib bo‘lmaydi", en: "The data cannot be decrypted" },
    ],
    explain: {
      uz: "Ochiq/yopiq kalit juftligi — asimmetrik kriptografiya.",
      en: "A public/private key pair is asymmetric cryptography.",
    },
  },
  {
    ask: {
      uz: "Qaysi biri simmetrik shifr?",
      en: "Which one is a symmetric cipher?",
    },
    right: same("AES"),
    wrong: [same("RSA"), same("SHA-256"), same("Base64")],
    explain: {
      uz: "RSA — asimmetrik, SHA-256 — xesh, Base64 — kodlash.",
      en: "RSA is asymmetric, SHA-256 a hash, Base64 an encoding.",
    },
  },
  {
    ask: {
      uz: "AES blokining o‘lchami?",
      en: "The size of an AES block?",
    },
    right: same("128 bit"),
    wrong: [same("64 bit"), same("256 bit"), same("1024 bit")],
    explain: {
      uz: "Kalit 128/192/256 bit bo‘lishi mumkin, blok esa doim 128 bit.",
      en: "The key may be 128/192/256 bits; the block is always 128.",
    },
  },
  {
    ask: {
      uz: "DES nega eskirgan?",
      en: "Why is DES obsolete?",
    },
    right: {
      uz: "56 bitli kalitni sinab chiqish mumkin",
      en: "Its 56-bit key can be searched",
    },
    wrong: [
      { uz: "U juda sekin", en: "It is too slow" },
      {
        uz: "Uni faqat harbiylar ishlata oladi",
        en: "Only the military may use it",
      },
      { uz: "U ma’lumotni yo‘qotadi", en: "It loses data" },
    ],
    explain: {
      uz: "1998-yildayoq DES kaliti bir necha kunda topilgan.",
      en: "A DES key was found in days as early as 1998.",
    },
  },
  {
    ask: {
      uz: "ECB rejimining zaifligi?",
      en: "The weakness of ECB mode?",
    },
    right: {
      uz: "Bir xil bloklar bir xil shifrga aylanadi",
      en: "Identical blocks give identical ciphertext",
    },
    wrong: [
      { uz: "U juda sekin", en: "It is too slow" },
      {
        uz: "U kalitni shifr matniga yozadi",
        en: "It writes the key into the ciphertext",
      },
      { uz: "U faqat matnni shifrlaydi", en: "It encrypts text only" },
    ],
    explain: {
      uz: "Shuning uchun ECB’da rasmning shakli ko‘rinib qoladi.",
      en: "That is why a picture’s outline shows through ECB.",
    },
  },
  {
    ask: {
      uz: "CBC rejimida birinchi blok nima bilan aralashtiriladi?",
      en: "In CBC mode, what is the first block mixed with?",
    },
    right: {
      uz: "IV (boshlang‘ich vektor)",
      en: "The IV (initialisation vector)",
    },
    wrong: [
      { uz: "Kalitning o‘zi", en: "The key itself" },
      { uz: "Oxirgi blok", en: "The last block" },
      { uz: "Hech narsa bilan", en: "Nothing" },
    ],
    explain: {
      uz: "Keyingi bloklar oldingi shifr bloki bilan aralashtiriladi.",
      en: "Later blocks are mixed with the previous ciphertext block.",
    },
  },
  {
    ask: {
      uz: "CTR rejimida shifr matni qanday hosil bo‘ladi?",
      en: "How is the ciphertext made in CTR mode?",
    },
    right: {
      uz: "Ochiq matn XOR kalit oqimi",
      en: "Plain text XOR a keystream",
    },
    wrong: [
      { uz: "Harflarni teskari yozib", en: "By writing letters backwards" },
      {
        uz: "Har bir blokni alohida shifrlab",
        en: "By encrypting each block alone",
      },
      { uz: "Ochiq matnni siqib", en: "By compressing the plain text" },
    ],
    explain: {
      uz: "Kalit oqimi kalit, nonce va hisoblagichdan yasaladi.",
      en: "The keystream is built from the key, a nonce and a counter.",
    },
  },
  {
    ask: {
      uz: "Nonce haqida qaysi gap to‘g‘ri?",
      en: "Which statement about a nonce is true?",
    },
    right: {
      uz: "Maxfiy emas, lekin bitta kalit bilan takrorlanmasligi kerak",
      en: "It is not secret, but must never repeat under one key",
    },
    wrong: [
      {
        uz: "U kalitdek maxfiy saqlanadi",
        en: "It is kept secret like the key",
      },
      { uz: "Uni har doim 0 qilish mumkin", en: "It can always be 0" },
      { uz: "U faqat ECB’da ishlatiladi", en: "It is used only in ECB" },
    ],
    explain: {
      uz: "Nonce shifr matni bilan birga ochiq yuboriladi.",
      en: "The nonce travels openly with the ciphertext.",
    },
  },
  {
    ask: {
      uz: "Ikki xabar bir kalit va bir nonce bilan CTR’da shifrlandi. Natija?",
      en: "Two messages were encrypted in CTR with one key and one nonce. The result?",
    },
    right: {
      uz: "Birini bilgan odam ikkinchisini o‘qiy oladi",
      en: "Whoever knows one can read the other",
    },
    wrong: [
      { uz: "Ikkalasi ham xavfsiz", en: "Both stay safe" },
      { uz: "Kalit o‘zgaradi", en: "The key changes" },
      { uz: "Xabarlar qisqaradi", en: "The messages get shorter" },
    ],
    explain: {
      uz: "Kalit oqimi takrorlanadi va XOR uni yo‘qotadi.",
      en: "The keystream repeats and XOR cancels it.",
    },
  },
  {
    ask: {
      uz: "Shifrlangan to‘lovdagi summani kalitsiz o‘zgartirishni nima to‘xtatadi?",
      en: "What stops a sum in an encrypted payment being changed without the key?",
    },
    right: {
      uz: "Autentifikatsiya tegi (AEAD, masalan AES-GCM)",
      en: "An authentication tag (AEAD, e.g. AES-GCM)",
    },
    wrong: [
      { uz: "Uzunroq kalit", en: "A longer key" },
      { uz: "ECB rejimi", en: "ECB mode" },
      { uz: "Base64 kodlash", en: "Base64 encoding" },
    ],
    explain: {
      uz: "Teg bitta bit o‘zgarsa ham mos kelmay qoladi.",
      en: "The tag fails if even one bit changes.",
    },
  },
  {
    ask: {
      uz: "Qaysi biri AEAD rejimi?",
      en: "Which one is an AEAD mode?",
    },
    right: same("ChaCha20-Poly1305"),
    wrong: [same("AES-ECB"), same("AES-CBC"), same("DES-CTR")],
    explain: {
      uz: "AES-GCM va ChaCha20-Poly1305 — shifrlash va yaxlitlik birga.",
      en: "AES-GCM and ChaCha20-Poly1305 give encryption and integrity together.",
    },
  },
  {
    ask: {
      uz: "Shifrlash kaliti qayerda saqlanmasligi kerak?",
      en: "Where must an encryption key not be kept?",
    },
    right: { uz: "Dastur kodi ichida", en: "Inside the program’s code" },
    wrong: [
      { uz: "KMS’da", en: "In a KMS" },
      { uz: "HSM’da", en: "In an HSM" },
      { uz: "Maxfiy ma’lumotlar omborida", en: "In a secret manager" },
    ],
    explain: {
      uz: "Kod repozitoriyga, nusxalarga va loglarga tushadi.",
      en: "Code ends up in repositories, copies and logs.",
    },
  },
  {
    ask: {
      uz: "Paroldan shifrlash kalitini qanday yasash kerak?",
      en: "How should an encryption key be made from a password?",
    },
    right: {
      uz: "Argon2 yoki PBKDF2 bilan, tuz qo‘shib",
      en: "With Argon2 or PBKDF2, salted",
    },
    wrong: [
      { uz: "Parolning o‘zini kalit qilib", en: "Using the password itself" },
      {
        uz: "Parolni MD5 bilan bir marta xeshlab",
        en: "Hashing it once with MD5",
      },
      { uz: "Parolni teskari yozib", en: "Writing the password backwards" },
    ],
    explain: {
      uz: "Sekin funksiya parolni taxmin qilishni qimmatlashtiradi.",
      en: "A slow function makes guessing the password expensive.",
    },
  },
  {
    ask: {
      uz: "Shifrlangan zaxira nusxa bilan birga nima saqlanmasligi kerak?",
      en: "What must not be stored together with an encrypted backup?",
    },
    right: { uz: "Uning kaliti", en: "Its key" },
    wrong: [
      { uz: "Uning nonce’i", en: "Its nonce" },
      { uz: "Uning hajmi", en: "Its size" },
      { uz: "Uning sanasi", en: "Its date" },
    ],
    explain: {
      uz: "Kalit va ma’lumot birga bo‘lsa, shifrlashning ma’nosi qolmaydi.",
      en: "Key and data together make the encryption pointless.",
    },
  },
  {
    ask: {
      uz: "Amalda shifrlash muammolari ko‘pincha nimadan kelib chiqadi?",
      en: "Where do encryption problems usually come from in practice?",
    },
    right: {
      uz: "Rejim, nonce yoki kalitni noto‘g‘ri ishlatishdan",
      en: "Misusing the mode, the nonce or the key",
    },
    wrong: [
      { uz: "AES’ning buzilganidan", en: "AES being broken" },
      { uz: "Kompyuterning sekinligidan", en: "Slow computers" },
      { uz: "Internetning uzilishidan", en: "Internet outages" },
    ],
    explain: {
      uz: "AES’ning o‘zi hozircha buzilmagan.",
      en: "AES itself remains unbroken.",
    },
  },
];

export const HASHES_POOL: PoolItem[] = [
  {
    ask: {
      uz: "Kriptografik xeshning asosiy xossasi?",
      en: "The key property of a cryptographic hash?",
    },
    right: {
      uz: "Uni orqaga qaytarib bo‘lmaydi",
      en: "It cannot be reversed",
    },
    wrong: [
      {
        uz: "Uni kalit bilan ochish mumkin",
        en: "It can be opened with a key",
      },
      {
        uz: "Natija matndan uzunroq",
        en: "The result is longer than the text",
      },
      {
        uz: "Har safar boshqa natija beradi",
        en: "It gives a new result every time",
      },
    ],
    explain: {
      uz: "Bir xil matn doim bir xil, qisqa va qaytarilmas xesh beradi.",
      en: "The same text always gives the same short, one-way hash.",
    },
  },
  {
    ask: {
      uz: "Qaysi xesh xavfsizlik uchun yaroqsiz (to‘qnashuvlar topilgan)?",
      en: "Which hash is unfit for security (collisions found)?",
    },
    right: same("MD5"),
    wrong: [same("SHA-256"), same("SHA-3"), same("SHA-512")],
    explain: {
      uz: "MD5 va SHA-1 da bir xil xeshli turli fayllar yasash mumkin.",
      en: "MD5 and SHA-1 let different files be made with the same hash.",
    },
  },
  {
    ask: {
      uz: "Rainbow table nima?",
      en: "What is a rainbow table?",
    },
    right: {
      uz: "Keng tarqalgan parollar va ularning xeshlari oldindan tayyorlangan jadvali",
      en: "A precomputed table of common passwords and their hashes",
    },
    wrong: [
      { uz: "Rangli parol menejeri", en: "A colourful password manager" },
      { uz: "Shifrlash kalitlari ro‘yxati", en: "A list of encryption keys" },
      { uz: "Tarmoq trafigi diagrammasi", en: "A network traffic chart" },
    ],
    explain: {
      uz: "Salt bunday jadvallarni befoyda qiladi.",
      en: "A salt makes such tables useless.",
    },
  },
  {
    ask: {
      uz: "Salt haqida qaysi gap to‘g‘ri?",
      en: "Which statement about a salt is true?",
    },
    right: {
      uz: "U har bir foydalanuvchi uchun tasodifiy va xesh yonida ochiq saqlanadi",
      en: "It is random per user and stored openly next to the hash",
    },
    wrong: [
      {
        uz: "U barcha foydalanuvchilar uchun bir xil maxfiy kalit",
        en: "It is one secret key for all users",
      },
      {
        uz: "U parolning o‘rniga saqlanadi",
        en: "It is stored instead of the password",
      },
      { uz: "U faqat admin uchun kerak", en: "It is only needed for admins" },
    ],
    explain: {
      uz: "Salt maxfiy emas — uning vazifasi bir xil parollarni har xil qilish.",
      en: "A salt is not secret — its job is to make equal passwords differ.",
    },
  },
  {
    ask: {
      uz: "Ikki foydalanuvchining paroli bir xil. Salt bo‘lmasa nima ko‘rinadi?",
      en: "Two users have the same password. Without a salt, what shows?",
    },
    right: {
      uz: "Ularning xeshlari bir xil",
      en: "Their hashes are identical",
    },
    wrong: [
      { uz: "Hech narsa", en: "Nothing" },
      { uz: "Ularning parollari ochiq", en: "Their passwords in plain text" },
      { uz: "Ularning email’lari", en: "Their emails" },
    ],
    explain: {
      uz: "Bitta parol topilsa, ikkinchisi ham ochiladi.",
      en: "Cracking one opens the other too.",
    },
  },
  {
    ask: {
      uz: "Nega SHA-256 + salt parol uchun yetarli emas?",
      en: "Why is SHA-256 plus a salt not enough for passwords?",
    },
    right: {
      uz: "SHA-256 juda tez — taxminlar arzon",
      en: "SHA-256 is too fast — guesses are cheap",
    },
    wrong: [
      {
        uz: "SHA-256 ni orqaga qaytarish mumkin",
        en: "SHA-256 can be reversed",
      },
      { uz: "Salt xeshni buzadi", en: "The salt breaks the hash" },
      {
        uz: "SHA-256 faqat fayllar uchun ishlaydi",
        en: "SHA-256 only works on files",
      },
    ],
    explain: {
      uz: "Bitta videokarta soniyasiga milliardlab SHA-256 hisoblaydi.",
      en: "One graphics card computes billions of SHA-256 hashes a second.",
    },
  },
  {
    ask: {
      uz: "Parol saqlash uchun qaysi biri tavsiya etiladi?",
      en: "Which is recommended for storing passwords?",
    },
    right: same("Argon2id"),
    wrong: [same("SHA-1"), same("AES-256"), same("Base64")],
    explain: {
      uz: "Argon2id sekin va xotira talab qiladi — taxminlar qimmatlashadi.",
      en: "Argon2id is slow and memory-hard — guessing gets expensive.",
    },
  },
  {
    ask: {
      uz: "bcrypt cost 12 dan 13 ga oshirildi. Natija?",
      en: "bcrypt’s cost went from 12 to 13. The result?",
    },
    right: {
      uz: "Har bir xesh ikki baravar uzoqroq hisoblanadi",
      en: "Each hash takes twice as long",
    },
    wrong: [
      { uz: "Xesh qisqaradi", en: "The hash gets shorter" },
      { uz: "Salt o‘chadi", en: "The salt is removed" },
      { uz: "Hech narsa o‘zgarmaydi", en: "Nothing changes" },
    ],
    explain: {
      uz: "Cost — ikki darajasi.",
      en: "The cost is a power of two.",
    },
  },
  {
    ask: {
      uz: "Nega parollarni AES bilan shifrlab saqlash yomon fikr?",
      en: "Why is encrypting passwords with AES a bad idea?",
    },
    right: {
      uz: "Kalit sizib chiqsa, barcha parollar ochiladi",
      en: "If the key leaks, every password opens",
    },
    wrong: [
      { uz: "AES juda sekin", en: "AES is too slow" },
      { uz: "AES parollarni qisqartiradi", en: "AES shortens passwords" },
      { uz: "AES faqat rasmlarni shifrlaydi", en: "AES only encrypts images" },
    ],
    explain: {
      uz: "Xesh qaytarilmaydi — bu uning parol uchun afzalligi.",
      en: "A hash cannot be reversed — that is its advantage for passwords.",
    },
  },
  {
    ask: {
      uz: "Webhook imzosi sha256(body) bo‘lsa, hujumchi nima qila oladi?",
      en: "If a webhook’s signature is sha256(body), what can an attacker do?",
    },
    right: {
      uz: "Tanani o‘zgartirib, yangi imzoni o‘zi hisoblaydi",
      en: "Change the body and compute the new signature itself",
    },
    wrong: [
      {
        uz: "Hech narsa, xesh qaytarilmaydi",
        en: "Nothing, a hash is one-way",
      },
      { uz: "Faqat xabarni o‘qiydi", en: "Only read the message" },
      { uz: "Serverni o‘chiradi", en: "Shut down the server" },
    ],
    explain: {
      uz: "Kalitsiz xeshni har kim hisoblaydi; HMAC maxfiy kalit talab qiladi.",
      en: "Anyone can compute a keyless hash; HMAC needs the secret key.",
    },
  },
  {
    ask: {
      uz: "HMAC nima beradi?",
      en: "What does HMAC give?",
    },
    right: {
      uz: "Xabar kalitni biladigan tomondan kelgani va o‘zgarmaganini",
      en: "That a message came from someone with the key and was not changed",
    },
    wrong: [
      { uz: "Xabarni shifrlaydi", en: "It encrypts the message" },
      { uz: "Parolni xavfsiz saqlaydi", en: "It stores passwords safely" },
      { uz: "Faylni siqadi", en: "It compresses a file" },
    ],
    explain: {
      uz: "HMAC — kalitli xesh; u maxfiylik emas, haqiqiylik beradi.",
      en: "HMAC is a keyed hash; it gives authenticity, not secrecy.",
    },
  },
  {
    ask: {
      uz: "Imzolarni solishtirishda nima ishlatiladi?",
      en: "What should compare two signatures?",
    },
    right: {
      uz: "Vaqt bo‘yicha xavfsiz taqqoslash (timingSafeEqual)",
      en: "A constant-time compare (timingSafeEqual)",
    },
    wrong: [
      { uz: "Oddiy === taqqoslash", en: "A plain === comparison" },
      {
        uz: "Birinchi 4 belgini solishtirish",
        en: "Comparing the first 4 characters",
      },
      { uz: "Uzunligini solishtirish", en: "Comparing their lengths" },
    ],
    explain: {
      uz: "Oddiy taqqoslash birinchi farqda to‘xtaydi va vaqt orqali sirni oshkor qilishi mumkin.",
      en: "A plain compare stops at the first difference and can leak the secret through timing.",
    },
  },
  {
    ask: {
      uz: "Yuklab olingan fayl o‘zgarmaganini tekshirish uchun?",
      en: "To check that a downloaded file was not changed?",
    },
    right: same("SHA-256"),
    wrong: [same("bcrypt"), same("Base64"), same("MD5")],
    explain: {
      uz: "Fayl uchun tez va ishonchli xesh yetarli.",
      en: "A fast, sound hash is enough for a file.",
    },
  },
  {
    ask: {
      uz: "Zamonaviy tavsiyaga ko‘ra eng muhim parol xossasi?",
      en: "Under modern guidance, the most important property of a password?",
    },
    right: { uz: "Uzunlik", en: "Length" },
    wrong: [
      { uz: "Majburiy maxsus belgi", en: "A forced symbol" },
      { uz: "Har oy almashtirish", en: "Changing it every month" },
      { uz: "Katta harf bilan boshlanishi", en: "Starting with a capital" },
    ],
    explain: {
      uz: "Uzun ibora qisqa “murakkab” paroldan kuchliroq va eslash oson.",
      en: "A long phrase beats a short “complex” password and is easier to remember.",
    },
  },
  {
    ask: {
      uz: "Parolni qachon almashtirishni so‘rash kerak?",
      en: "When should users be asked to change a password?",
    },
    right: {
      uz: "Sizib chiqqanligi aniqlanganda",
      en: "When it is known to have leaked",
    },
    wrong: [
      { uz: "Har 30 kunda", en: "Every 30 days" },
      { uz: "Har kirishda", en: "At every sign-in" },
      {
        uz: "Hech qachon, hatto sizib chiqsa ham",
        en: "Never, even after a leak",
      },
    ],
    explain: {
      uz: "Tez-tez majburiy almashtirish zaif parollarga olib keladi.",
      en: "Frequent forced changes lead to weak passwords.",
    },
  },
];

export const PUBKEY_POOL: PoolItem[] = [
  {
    ask: {
      uz: "Bobga faqat u o‘qiy oladigan xat yuborish uchun nima bilan shifrlaysiz?",
      en: "To send Bob a letter only he can read, what do you encrypt with?",
    },
    right: { uz: "Bobning ochiq kaliti", en: "Bob’s public key" },
    wrong: [
      { uz: "Bobning yopiq kaliti", en: "Bob’s private key" },
      { uz: "Sizning ochiq kalitingiz", en: "Your public key" },
      { uz: "Umumiy parol", en: "A shared password" },
    ],
    explain: {
      uz: "Faqat Bobning yopiq kaliti uni ochadi.",
      en: "Only Bob’s private key opens it.",
    },
  },
  {
    ask: {
      uz: "Raqamli imzo qaysi kalit bilan qo‘yiladi?",
      en: "Which key makes a digital signature?",
    },
    right: {
      uz: "Yuboruvchining yopiq kaliti",
      en: "The sender’s private key",
    },
    wrong: [
      { uz: "Yuboruvchining ochiq kaliti", en: "The sender’s public key" },
      {
        uz: "Qabul qiluvchining ochiq kaliti",
        en: "The recipient’s public key",
      },
      { uz: "AES kaliti", en: "An AES key" },
    ],
    explain: {
      uz: "Imzoni hamma ochiq kalit bilan tekshiradi.",
      en: "Anyone checks it with the public key.",
    },
  },
  {
    ask: {
      uz: "Diffie–Hellman nimani hal qiladi?",
      en: "What does Diffie–Hellman solve?",
    },
    right: {
      uz: "Ochiq kanalda umumiy maxfiy kalit kelishishni",
      en: "Agreeing a shared secret key over an open channel",
    },
    wrong: [
      { uz: "Parollarni saqlashni", en: "Storing passwords" },
      { uz: "Fayllarni siqishni", en: "Compressing files" },
      { uz: "Xabarni imzolashni", en: "Signing a message" },
    ],
    explain: {
      uz: "Ikki tomon faqat ochiq qiymatlarni almashib, bir xil kalitga ega bo‘ladi.",
      en: "Swapping only public values, both sides end up with the same key.",
    },
  },
  {
    ask: {
      uz: "Diffie–Hellman’da Eve nimani topishi kerak?",
      en: "What must Eve find in Diffie–Hellman?",
    },
    right: {
      uz: "gᵃ mod p dan a ni (diskret logarifm)",
      en: "a from gᵃ mod p (a discrete logarithm)",
    },
    wrong: [
      { uz: "p va g ni", en: "p and g" },
      { uz: "Bobning parolini", en: "Bob’s password" },
      { uz: "Hech narsa, kalit ochiq", en: "Nothing, the key is public" },
    ],
    explain: {
      uz: "Katta p da bu amalda imkonsiz.",
      en: "With a large p this is impossible in practice.",
    },
  },
  {
    ask: {
      uz: "Nega kichik p bilan Diffie–Hellman xavfli?",
      en: "Why is Diffie–Hellman with a small p dangerous?",
    },
    right: {
      uz: "Eve barcha sonlarni sinab, maxfiy sonni topadi",
      en: "Eve tries every number and finds the secret",
    },
    wrong: [
      { uz: "Kalitlar mos kelmaydi", en: "The keys do not match" },
      { uz: "U juda sekin ishlaydi", en: "It runs too slowly" },
      { uz: "Hech qanday xavf yo‘q", en: "There is no danger" },
    ],
    explain: {
      uz: "Haqiqiy guruhlar 2048 bit yoki elliptik egri chiziqlar.",
      en: "Real groups are 2048 bits or elliptic curves.",
    },
  },
  {
    ask: {
      uz: "RSA’da n qanday hosil bo‘ladi?",
      en: "How is n made in RSA?",
    },
    right: {
      uz: "Ikki tub sonning ko‘paytmasi",
      en: "The product of two primes",
    },
    wrong: [
      { uz: "Ikki tub sonning yig‘indisi", en: "The sum of two primes" },
      { uz: "Tasodifiy juft son", en: "A random even number" },
      { uz: "Parolning xeshi", en: "A password’s hash" },
    ],
    explain: {
      uz: "n = p·q ochiq; p va q maxfiy.",
      en: "n = p·q is public; p and q are secret.",
    },
  },
  {
    ask: {
      uz: "RSA’ning n sonini ko‘paytuvchilarga ajratgan odam nima qila oladi?",
      en: "Whoever factors RSA’s n can do what?",
    },
    right: { uz: "Yopiq kalitni hisoblaydi", en: "Compute the private key" },
    wrong: [
      { uz: "Faqat ochiq kalitni ko‘radi", en: "Only see the public key" },
      { uz: "Kalitni uzaytiradi", en: "Make the key longer" },
      { uz: "Hech narsa", en: "Nothing" },
    ],
    explain: {
      uz: "p, q dan φ, undan d topiladi.",
      en: "From p and q comes φ, and from φ comes d.",
    },
  },
  {
    ask: {
      uz: "RSA uchun bugun kamida qancha bitli kalit kerak?",
      en: "At least how many bits does an RSA key need today?",
    },
    right: same("2048"),
    wrong: [same("512"), same("128"), same("64")],
    explain: {
      uz: "Yangi tizimlarda 3072 bit tavsiya etiladi.",
      en: "3072 bits are recommended for new systems.",
    },
  },
  {
    ask: {
      uz: "Nega ECC kalitlari RSA kalitlaridan qisqa?",
      en: "Why are ECC keys shorter than RSA keys?",
    },
    right: {
      uz: "Bir xil kuch uchun kamroq bit kerak",
      en: "They need fewer bits for the same strength",
    },
    wrong: [
      { uz: "Ular kuchsizroq", en: "They are weaker" },
      { uz: "Ular faqat sinov uchun", en: "They are only for tests" },
      { uz: "Ular simmetrik", en: "They are symmetric" },
    ],
    explain: {
      uz: "256 bitli ECC taxminan 3072 bitli RSA ga teng.",
      en: "256-bit ECC is about as strong as 3072-bit RSA.",
    },
  },
  {
    ask: {
      uz: "O‘rtadagi odam (MITM) hujumida Mallory nima qiladi?",
      en: "What does Mallory do in a man-in-the-middle attack?",
    },
    right: {
      uz: "Har ikki tomonga o‘z ochiq qiymatini yuboradi",
      en: "Sends her own public value to both sides",
    },
    wrong: [
      { uz: "Faqat tinglaydi", en: "Only listens" },
      { uz: "Kalitni ko‘paytuvchilarga ajratadi", en: "Factors the key" },
      { uz: "Serverni o‘chiradi", en: "Shuts down the server" },
    ],
    explain: {
      uz: "Natijada har bir tomon Mallory bilan kalit kelishadi.",
      en: "Each side ends up agreeing a key with Mallory.",
    },
  },
  {
    ask: {
      uz: "MITM hujumini nima to‘xtatadi?",
      en: "What stops a man-in-the-middle attack?",
    },
    right: {
      uz: "Ochiq qiymatni ishonchli kalit bilan imzolash (sertifikat)",
      en: "Signing the public value with a trusted key (a certificate)",
    },
    wrong: [
      { uz: "Uzunroq p", en: "A longer p" },
      { uz: "Ikki marta kalit almashish", en: "Exchanging keys twice" },
      { uz: "Parolni yashirish", en: "Hiding the password" },
    ],
    explain: {
      uz: "Mallory ishonchli kalit bilan imzo yasay olmaydi.",
      en: "Mallory cannot make a signature with the trusted key.",
    },
  },
  {
    ask: {
      uz: "Raqamli imzo nimani bermaydi?",
      en: "What does a digital signature not give?",
    },
    right: { uz: "Maxfiylik", en: "Secrecy" },
    wrong: [
      { uz: "Haqiqiylik", en: "Authenticity" },
      { uz: "Yaxlitlik", en: "Integrity" },
      { uz: "Inkor etib bo‘lmaslik", en: "Non-repudiation" },
    ],
    explain: {
      uz: "Imzolangan xabarni hamma o‘qiy oladi.",
      en: "Anyone can read a signed message.",
    },
  },
  {
    ask: {
      uz: "Gibrid shifrlashda katta ma’lumot nima bilan shifrlanadi?",
      en: "In hybrid encryption, what encrypts the bulk data?",
    },
    right: same("AES-GCM"),
    wrong: [same("RSA"), same("SHA-256"), same("Diffie–Hellman")],
    explain: {
      uz: "Ochiq kalit faqat AES kalitini kelishish uchun.",
      en: "The public key only agrees the AES key.",
    },
  },
  {
    ask: {
      uz: "Forward secrecy nimani kafolatlaydi?",
      en: "What does forward secrecy guarantee?",
    },
    right: {
      uz: "Server kaliti keyin o‘g‘irlansa ham eski seanslar ochilmaydi",
      en: "Old sessions stay closed even if the server key is stolen later",
    },
    wrong: [
      { uz: "Parollar eskirmaydi", en: "Passwords never expire" },
      { uz: "Kalit hech qachon almashmaydi", en: "The key never changes" },
      { uz: "Sertifikat abadiy", en: "The certificate lasts forever" },
    ],
    explain: {
      uz: "Har bir seans uchun yangi DH kaliti ishlatiladi.",
      en: "A fresh DH key is used for each session.",
    },
  },
  {
    ask: {
      uz: "Kvant kompyuter xavfiga qarshi nima joriy qilinmoqda?",
      en: "What is being rolled out against the quantum threat?",
    },
    right: {
      uz: "Kvantga chidamli algoritmlar (ML-KEM, ML-DSA)",
      en: "Quantum-resistant algorithms (ML-KEM, ML-DSA)",
    },
    wrong: [
      { uz: "MD5", en: "MD5" },
      { uz: "Qisqaroq RSA kalitlari", en: "Shorter RSA keys" },
      { uz: "Base64", en: "Base64" },
    ],
    explain: {
      uz: "RSA va ECC kvant kompyuterlar uchun zaif bo‘lishi mumkin.",
      en: "RSA and ECC could fall to quantum computers.",
    },
  },
];

export const TLS_POOL: PoolItem[] = [
  {
    ask: {
      uz: "TLS nimani yashirmaydi?",
      en: "What does TLS not hide?",
    },
    right: { uz: "Server IP manzilini", en: "The server’s IP address" },
    wrong: [
      { uz: "Kiritilgan parolni", en: "The password typed in" },
      { uz: "Sessiya cookie’sini", en: "The session cookie" },
      { uz: "Sahifa matnini", en: "The page’s text" },
    ],
    explain: {
      uz: "Ulanishning o‘zi (IP, vaqt, hajm, ko‘pincha domen) ko‘rinadi.",
      en: "The connection itself (IP, timing, size, often the domain) is visible.",
    },
  },
  {
    ask: {
      uz: "Fishing saytda HTTPS qulfi bor. Bu nimani anglatadi?",
      en: "A phishing site shows the HTTPS padlock. What does that mean?",
    },
    right: {
      uz: "Ulanish shifrlangan, lekin sayt ishonchli degani emas",
      en: "The connection is encrypted, not that the site is trustworthy",
    },
    wrong: [
      {
        uz: "Sayt bank tomonidan tasdiqlangan",
        en: "The bank has approved the site",
      },
      {
        uz: "Sayt xavfsiz, ma’lumot kiritish mumkin",
        en: "The site is safe to type into",
      },
      {
        uz: "Sayt virusdan tekshirilgan",
        en: "The site was scanned for viruses",
      },
    ],
    explain: {
      uz: "Qulf faqat shifrlashni va domen nomini tasdiqlaydi.",
      en: "The padlock only vouches for encryption and the domain name.",
    },
  },
  {
    ask: {
      uz: "*.shop.uz sertifikati qaysi manzilni qamraydi?",
      en: "Which address does a *.shop.uz certificate cover?",
    },
    right: same("pay.shop.uz"),
    wrong: [
      same("shop.uz"),
      same("a.pay.shop.uz"),
      same("shop.uz.evil.example"),
    ],
    explain: {
      uz: "Yulduzcha chapdagi faqat bitta qismni almashtiradi.",
      en: "The wildcard stands for exactly one label on the left.",
    },
  },
  {
    ask: {
      uz: "NET::ERR_CERT_DATE_INVALID nimani bildiradi?",
      en: "What does NET::ERR_CERT_DATE_INVALID mean?",
    },
    right: {
      uz: "Sertifikat muddati o‘tgan (yoki hali boshlanmagan)",
      en: "The certificate has expired (or is not valid yet)",
    },
    wrong: [
      { uz: "Nom mos emas", en: "The name does not match" },
      { uz: "Server o‘chiq", en: "The server is down" },
      { uz: "Parol noto‘g‘ri", en: "The password is wrong" },
    ],
    explain: {
      uz: "Kompyuter soati noto‘g‘ri bo‘lsa ham shu xato chiqishi mumkin.",
      en: "A wrong clock on the computer can cause it too.",
    },
  },
  {
    ask: {
      uz: "Sertifikat zanjirida server nimani yuborishi kerak?",
      en: "What must the server send in the certificate chain?",
    },
    right: {
      uz: "O‘z sertifikati va oraliq sertifikat",
      en: "Its own certificate and the intermediate",
    },
    wrong: [
      { uz: "Faqat ildiz sertifikat", en: "Only the root certificate" },
      { uz: "Yopiq kaliti", en: "Its private key" },
      { uz: "Hech narsa", en: "Nothing" },
    ],
    explain: {
      uz: "Ildiz brauzerda oldindan bor; oraliqni server yuboradi (fullchain.pem).",
      en: "The root is built in; the server sends the intermediate (fullchain.pem).",
    },
  },
  {
    ask: {
      uz: "O‘zi imzolagan sertifikat ochiq saytda nima uchun ishlamaydi?",
      en: "Why does a self-signed certificate fail on a public site?",
    },
    right: {
      uz: "Brauzer uni tasdiqlagan ishonchli CA yo‘q",
      en: "No trusted CA vouches for it",
    },
    wrong: [
      { uz: "U juda qisqa", en: "It is too short" },
      { uz: "U shifrlamaydi", en: "It does not encrypt" },
      { uz: "U faqat Windows’da ishlaydi", en: "It only works on Windows" },
    ],
    explain: {
      uz: "Har kim o‘ziga istalgan nomli sertifikat yasay oladi.",
      en: "Anyone can make themselves a certificate with any name.",
    },
  },
  {
    ask: {
      uz: "Certificate Transparency nima uchun kerak?",
      en: "What is Certificate Transparency for?",
    },
    right: {
      uz: "Berilgan barcha sertifikatlarni ochiq jurnalda ko‘rish uchun",
      en: "To see every issued certificate in public logs",
    },
    wrong: [
      { uz: "Sertifikatni yashirish uchun", en: "To hide certificates" },
      { uz: "Parollarni saqlash uchun", en: "To store passwords" },
      { uz: "Trafikni tezlashtirish uchun", en: "To speed up traffic" },
    ],
    explain: {
      uz: "Domeningizga soxta sertifikat berilsa, uni jurnaldan topasiz.",
      en: "A fake certificate for your domain shows up in the logs.",
    },
  },
  {
    ask: {
      uz: "Nega sertifikat yangilashni avtomatlashtirish kerak?",
      en: "Why automate certificate renewal?",
    },
    right: {
      uz: "Muddat qisqa va unutilgan yangilash saytni to‘xtatadi",
      en: "Lifetimes are short and a forgotten renewal takes the site down",
    },
    wrong: [
      { uz: "Qo‘lda yangilash taqiqlangan", en: "Manual renewal is forbidden" },
      {
        uz: "Avtomatik sertifikat kuchliroq shifrlaydi",
        en: "Automatic certificates encrypt more strongly",
      },
      { uz: "Hech qanday sabab yo‘q", en: "There is no reason" },
    ],
    explain: {
      uz: "ACME (certbot) yangilashni o‘zi bajaradi.",
      en: "ACME (certbot) renews on its own.",
    },
  },
  {
    ask: {
      uz: "Qaysi protokollar yoqilgan bo‘lishi kerak?",
      en: "Which protocols should be on?",
    },
    right: same("TLS 1.2, TLS 1.3"),
    wrong: [
      same("SSL 3.0, TLS 1.0"),
      same("TLS 1.0, TLS 1.1"),
      same("SSL 2.0"),
    ],
    explain: {
      uz: "Eski protokollarda ma’lum hujumlar bor (POODLE, BEAST).",
      en: "Old protocols have known attacks (POODLE, BEAST).",
    },
  },
  {
    ask: {
      uz: "Nega RSA kalit almashinuvi tavsiya etilmaydi?",
      en: "Why is RSA key exchange not recommended?",
    },
    right: {
      uz: "U forward secrecy bermaydi",
      en: "It gives no forward secrecy",
    },
    wrong: [
      { uz: "U juda tez", en: "It is too fast" },
      { uz: "Uni brauzerlar bilmaydi", en: "Browsers do not know it" },
      { uz: "U sertifikat talab qilmaydi", en: "It needs no certificate" },
    ],
    explain: {
      uz: "Server kaliti keyin o‘g‘irlansa, eski yozilgan trafik ochiladi. ECDHE ishlating.",
      en: "If the server key is stolen later, recorded traffic opens. Use ECDHE.",
    },
  },
  {
    ask: {
      uz: "SSL stripping nima?",
      en: "What is SSL stripping?",
    },
    right: {
      uz: "Hujumchi foydalanuvchini HTTPS’siz nusxada ushlab qoladi",
      en: "An attacker keeps the user on a copy without HTTPS",
    },
    wrong: [
      { uz: "Sertifikatni o‘chirish", en: "Deleting the certificate" },
      { uz: "Parolni taxmin qilish", en: "Guessing a password" },
      { uz: "Serverni so‘rovlar bilan to‘ldirish", en: "Flooding the server" },
    ],
    explain: {
      uz: "Birinchi oddiy http:// so‘rovga hujumchi javob beradi.",
      en: "The attacker answers the first plain http:// request.",
    },
  },
  {
    ask: {
      uz: "Nega HTTP’dan HTTPS’ga yo‘naltirish SSL stripping’ni to‘xtatmaydi?",
      en: "Why does an HTTP-to-HTTPS redirect not stop SSL stripping?",
    },
    right: {
      uz: "Yo‘naltirishning o‘zi shifrlanmagan so‘rovda keladi",
      en: "The redirect itself arrives over the unencrypted request",
    },
    wrong: [
      { uz: "Yo‘naltirish juda sekin", en: "The redirect is too slow" },
      {
        uz: "Brauzerlar yo‘naltirishni bilmaydi",
        en: "Browsers ignore redirects",
      },
      { uz: "U to‘xtatadi", en: "It does stop it" },
    ],
    explain: {
      uz: "Hujumchi yo‘naltirishni yetkazmaydi.",
      en: "The attacker simply never delivers the redirect.",
    },
  },
  {
    ask: {
      uz: "HSTS sarlavhasi birinchi tashrifni ham himoya qiladimi?",
      en: "Does the HSTS header protect the very first visit?",
    },
    right: {
      uz: "Yo‘q, buning uchun preload ro‘yxati kerak",
      en: "No, that needs the preload list",
    },
    wrong: [
      { uz: "Ha, har doim", en: "Yes, always" },
      { uz: "Faqat telefonlarda", en: "Only on phones" },
      { uz: "Faqat HTTP orqali", en: "Only over HTTP" },
    ],
    explain: {
      uz: "Brauzer sarlavhani birinchi HTTPS javobda ko‘radi.",
      en: "The browser first sees the header in an HTTPS reply.",
    },
  },
  {
    ask: {
      uz: "HTTPS sahifa skriptni http:// orqali yuklasa, bu qanday muammo?",
      en: "An HTTPS page loads a script over http://. What problem is this?",
    },
    right: { uz: "Aralash kontent (mixed content)", en: "Mixed content" },
    wrong: [
      { uz: "CORS", en: "CORS" },
      { uz: "IDOR", en: "IDOR" },
      { uz: "Rate limiting", en: "Rate limiting" },
    ],
    explain: {
      uz: "Hujumchi aynan o‘sha shifrlanmagan skriptni almashtiradi.",
      en: "An attacker swaps exactly that unencrypted script.",
    },
  },
  {
    ask: {
      uz: "Mobil ilova sertifikat xatolarini e’tiborsiz qoldirsa nima bo‘ladi?",
      en: "What happens if a mobile app ignores certificate errors?",
    },
    right: {
      uz: "O‘rtadagi odam har qanday sertifikat bilan trafikni o‘qiydi",
      en: "A man in the middle reads the traffic with any certificate",
    },
    wrong: [
      {
        uz: "Ilova tezroq ishlaydi va xavf yo‘q",
        en: "The app is faster and safe",
      },
      { uz: "Faqat reklama o‘zgaradi", en: "Only the ads change" },
      { uz: "Hech narsa", en: "Nothing" },
    ],
    explain: {
      uz: "Tekshiruvsiz TLS — himoyasiz TLS.",
      en: "TLS without the checks is TLS without protection.",
    },
  },
];

export const TCPIP_POOL: PoolItem[] = [
  {
    ask: {
      uz: "Port raqami qaysi sarlavhada yoziladi?",
      en: "Which header carries the port number?",
    },
    right: same("TCP/UDP"),
    wrong: [same("IP"), same("Ethernet"), same("HTTP")],
    explain: {
      uz: "Port — kompyuter ichidagi qaysi dastur; transport qatlami.",
      en: "A port names the program on the computer; it is the transport layer.",
    },
  },
  {
    ask: {
      uz: "MAC manzil qachon ahamiyatli?",
      en: "Where does a MAC address matter?",
    },
    right: {
      uz: "Faqat bitta tarmoq segmenti ichida",
      en: "Only within one network segment",
    },
    wrong: [
      { uz: "Butun internet bo‘ylab", en: "Across the whole internet" },
      { uz: "Faqat DNS’da", en: "Only in DNS" },
      { uz: "Hech qachon", en: "Never" },
    ],
    explain: {
      uz: "Har bir routerda Ethernet ramkasi yangidan yoziladi.",
      en: "Each router writes a fresh Ethernet frame.",
    },
  },
  {
    ask: {
      uz: "TCP ulanishi qaysi xabarlar bilan boshlanadi?",
      en: "Which messages start a TCP connection?",
    },
    right: same("SYN → SYN-ACK → ACK"),
    wrong: [same("ACK → SYN → FIN"), same("GET → 200 OK"), same("RST → ACK")],
    explain: {
      uz: "Uch qadamli salomlashish.",
      en: "The three-way handshake.",
    },
  },
  {
    ask: {
      uz: "Mijoz SYN’ni seq=1000 bilan yubordi. SYN-ACK’dagi ack qancha?",
      en: "The client’s SYN has seq=1000. What is the ack in the SYN-ACK?",
    },
    right: same("1001"),
    wrong: [same("1000"), same("999"), same("2000")],
    explain: {
      uz: "SYN bitta raqam egallaydi.",
      en: "A SYN takes up one number.",
    },
  },
  {
    ask: {
      uz: "100 bayt ma’lumot seq=1001 dan boshlab yuborildi. Javobdagi ack?",
      en: "100 bytes of data were sent from seq=1001. The ack in the reply?",
    },
    right: same("1101"),
    wrong: [same("1002"), same("1100"), same("101")],
    explain: {
      uz: "ack = seq + baytlar soni: keyingi kutilgan bayt.",
      en: "ack = seq + bytes: the next byte expected.",
    },
  },
  {
    ask: {
      uz: "Nega TCP boshlang‘ich raqami (ISN) tasodifiy bo‘lishi kerak?",
      en: "Why must the TCP initial sequence number be random?",
    },
    right: {
      uz: "Aks holda hujumchi soxta paketlarni ulanishga qo‘sha oladi",
      en: "Otherwise an attacker can inject forged packets into a connection",
    },
    wrong: [
      { uz: "Tezlik uchun", en: "For speed" },
      { uz: "DNS uchun", en: "For DNS" },
      { uz: "Hech qanday sabab yo‘q", en: "No reason" },
    ],
    explain: {
      uz: "Taxmin qilinadigan raqamlar ulanishni o‘g‘irlashga yo‘l ochadi.",
      en: "Guessable numbers open the way to hijacking a connection.",
    },
  },
  {
    ask: {
      uz: "Qaysi xizmat odatda UDP ishlatadi?",
      en: "Which service usually uses UDP?",
    },
    right: { uz: "Video qo‘ng‘iroq", en: "A video call" },
    wrong: [
      { uz: "SSH", en: "SSH" },
      { uz: "Pochta yuborish (SMTP)", en: "Sending mail (SMTP)" },
      { uz: "Fayl yuklab olish (HTTP/1.1)", en: "A file download (HTTP/1.1)" },
    ],
    explain: {
      uz: "Kechikish yo‘qolgan kadrdan muhimroq.",
      en: "Delay matters more than a lost frame.",
    },
  },
  {
    ask: {
      uz: "Skaner SYN yubordi va RST oldi. Port holati?",
      en: "A scanner sent a SYN and got a RST. The port’s state?",
    },
    right: { uz: "Yopiq", en: "Closed" },
    wrong: [
      { uz: "Ochiq", en: "Open" },
      { uz: "Filtrlangan", en: "Filtered" },
      { uz: "Shifrlangan", en: "Encrypted" },
    ],
    explain: {
      uz: "Kompyuter javob berdi, lekin portda dastur yo‘q.",
      en: "The host answered, but nothing listens on the port.",
    },
  },
  {
    ask: {
      uz: "Skaner SYN-ACK oldi. Port holati?",
      en: "A scanner got a SYN-ACK. The port’s state?",
    },
    right: { uz: "Ochiq", en: "Open" },
    wrong: [
      { uz: "Yopiq", en: "Closed" },
      { uz: "Filtrlangan", en: "Filtered" },
      { uz: "Noma’lum", en: "Unknown" },
    ],
    explain: {
      uz: "Portda dastur ulanishni qabul qilmoqda.",
      en: "A program on the port is accepting connections.",
    },
  },
  {
    ask: {
      uz: "traceroute qaysi maydonni oshirib boradi?",
      en: "Which field does traceroute raise step by step?",
    },
    right: same("TTL"),
    wrong: [same("Port"), same("MAC"), same("seq")],
    explain: {
      uz: "Har bir router TTL tugaganda “time exceeded” qaytaradi.",
      en: "Each router returns “time exceeded” when the TTL runs out.",
    },
  },
  {
    ask: {
      uz: "Nega barcha ICMP’ni bloklash yomon?",
      en: "Why is blocking all ICMP bad?",
    },
    right: {
      uz: "Path MTU aniqlash buziladi",
      en: "Path MTU discovery breaks",
    },
    wrong: [
      { uz: "Internet tezlashadi", en: "The internet gets faster" },
      { uz: "Parollar ochiladi", en: "Passwords are exposed" },
      { uz: "Hech qanday zarar yo‘q", en: "There is no harm" },
    ],
    explain: {
      uz: "“Fragmentation needed” xabarlarisiz katta paketlar yo‘qoladi.",
      en: "Without “fragmentation needed” messages large packets vanish.",
    },
  },
  {
    ask: {
      uz: "DNS keshini zaharlashda hujumchi nimani taxmin qiladi?",
      en: "What does an attacker guess when poisoning a DNS cache?",
    },
    right: {
      uz: "Tranzaksiya ID’si (va manba portni)",
      en: "The transaction ID (and the source port)",
    },
    wrong: [
      { uz: "Foydalanuvchi parolini", en: "The user’s password" },
      { uz: "TLS kalitini", en: "The TLS key" },
      { uz: "MAC manzilni", en: "The MAC address" },
    ],
    explain: {
      uz: "Soxta javob so‘rovning ID va portiga mos kelishi kerak.",
      en: "The forged answer must match the query’s ID and port.",
    },
  },
  {
    ask: {
      uz: "Tasodifiy manba port DNS zaharlashni qanchalik qiyinlashtiradi?",
      en: "How much harder does a random source port make DNS poisoning?",
    },
    right: {
      uz: "Taxmin maydoni ~65 ming dan ~1,8 milliardga oshadi",
      en: "The space to guess grows from ~65 thousand to ~1.8 billion",
    },
    wrong: [
      { uz: "Hech qancha", en: "Not at all" },
      { uz: "Ikki baravar", en: "Twice as hard" },
      { uz: "Butunlay imkonsiz qiladi", en: "It makes it impossible" },
    ],
    explain: {
      uz: "To‘liq himoya uchun DNSSEC kerak.",
      en: "Full protection needs DNSSEC.",
    },
  },
  {
    ask: {
      uz: "SYN toshqiniga qarshi server tomonidagi himoya?",
      en: "A server-side defence against SYN floods?",
    },
    right: same("SYN cookies"),
    wrong: [same("DNSSEC"), same("HSTS"), same("WPA3")],
    explain: {
      uz: "Server holatni seq raqamiga yozadi va xotira ajratmaydi.",
      en: "The server encodes state in the sequence number and keeps no memory.",
    },
  },
  {
    ask: {
      uz: "Nega UDP xizmatlari amplification DDoS’da ishlatiladi?",
      en: "Why are UDP services used in amplification DDoS?",
    },
    right: {
      uz: "Manzilni soxtalashtirish oson va javob so‘rovdan katta",
      en: "Sources are easy to fake and the reply is bigger than the request",
    },
    wrong: [
      { uz: "UDP shifrlangan", en: "UDP is encrypted" },
      { uz: "UDP salomlashishni talab qiladi", en: "UDP needs a handshake" },
      { uz: "UDP sekin", en: "UDP is slow" },
    ],
    explain: {
      uz: "Kichik so‘rov katta javobni qurbonga yo‘naltiradi.",
      en: "A small request steers a large reply at the victim.",
    },
  },
];
