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

export const TRAFFIC_POOL: PoolItem[] = [
  {
    ask: {
      uz: "tcpdump qatorida 10.0.0.5.50122 nimani bildiradi?",
      en: "In a tcpdump line, what does 10.0.0.5.50122 mean?",
    },
    right: {
      uz: "10.0.0.5 manzilining 50122-porti",
      en: "Port 50122 on the address 10.0.0.5",
    },
    wrong: [
      { uz: "IPv6 manzil", en: "An IPv6 address" },
      { uz: "Paket raqami 50122", en: "Packet number 50122" },
      { uz: "MAC manzil", en: "A MAC address" },
    ],
    explain: {
      uz: "Oxirgi nuqtadan keyingi raqam — port.",
      en: "The number after the last dot is the port.",
    },
  },
  {
    ask: {
      uz: "tcpdump’dagi Flags [S] nima?",
      en: "What is Flags [S] in tcpdump?",
    },
    right: same("SYN"),
    wrong: [same("RST"), same("ACK"), same("FIN")],
    explain: {
      uz: "S — SYN, nuqta — ACK, R — RST, F — FIN.",
      en: "S is SYN, a dot is ACK, R is RST, F is FIN.",
    },
  },
  {
    ask: {
      uz: "Qaysi filtr faqat 10.0.0.66 yuborgan paketlarni ko‘rsatadi?",
      en: "Which filter shows only packets sent by 10.0.0.66?",
    },
    right: same("ip.src == 10.0.0.66"),
    wrong: [
      same("ip.dst == 10.0.0.66"),
      same("ip.addr != 10.0.0.66"),
      same("tcp.port == 10.0.0.66"),
    ],
    explain: {
      uz: "ip.src — manba, ip.dst — qabul qiluvchi, ip.addr — ikkalasidan biri.",
      en: "ip.src is the source, ip.dst the destination, ip.addr either one.",
    },
  },
  {
    ask: {
      uz: "Skanerning SYN’larini oddiy ulanishlardan qanday ajratasiz?",
      en: "How do you tell a scanner’s SYNs from ordinary connections?",
    },
    right: {
      uz: "ACK’siz SYN va manba manzil bo‘yicha, ko‘p portlarga qisqa vaqtda",
      en: "Bare SYNs from one source to many ports in a short time",
    },
    wrong: [
      { uz: "Paket rangiga qarab", en: "By the packet’s colour" },
      { uz: "Faqat UDP’ga qarab", en: "By looking at UDP only" },
      { uz: "Ajratib bo‘lmaydi", en: "You can’t" },
    ],
    explain: {
      uz: "Bitta SYN odatiy; bir manbadan yuzlab portga SYN — skaner.",
      en: "One SYN is normal; SYNs from one source to hundreds of ports is a scan.",
    },
  },
  {
    ask: {
      uz: "dns && tcp.port == 443 filtri nimani ko‘rsatadi?",
      en: "What does the filter dns && tcp.port == 443 show?",
    },
    right: {
      uz: "Deyarli hech narsani: DNS ham, 443-port TCP ham bo‘lishi kerak",
      en: "Almost nothing: a packet must be DNS and TCP on 443 at once",
    },
    wrong: [
      { uz: "Barcha DNS va barcha HTTPS’ni", en: "All DNS and all HTTPS" },
      { uz: "Faqat DNS’ni", en: "Only DNS" },
      { uz: "Hamma narsani", en: "Everything" },
    ],
    explain: {
      uz: "Ikkalasidan birini ko‘rish uchun || kerak.",
      en: "To see either one you need ||.",
    },
  },
  {
    ask: {
      uz: "Ko‘rsatish filtri yozib olish filtridan nimasi bilan farq qiladi?",
      en: "How does a display filter differ from a capture filter?",
    },
    right: {
      uz: "Faqat ko‘rinishni o‘zgartiradi; paketlar o‘chirilmaydi",
      en: "It changes only the view; no packets are thrown away",
    },
    wrong: [
      { uz: "Paketlarni shifrlaydi", en: "It encrypts the packets" },
      { uz: "Tarmoqni tezlashtiradi", en: "It speeds up the network" },
      { uz: "Hech qanday farq yo‘q", en: "There is no difference" },
    ],
    explain: {
      uz: "Capture filter (BPF) yozib olinadigan narsani cheklaydi; display filter — faqat ko‘rsatishni.",
      en: "A capture filter (BPF) limits what is recorded; a display filter only what is shown.",
    },
  },
  {
    ask: {
      uz: "HTTPS’da tarmoqdagi kuzatuvchi nimani ko‘rmaydi?",
      en: "With HTTPS, what can’t someone on the network see?",
    },
    right: {
      uz: "So‘rov yo‘li, cookie va parol",
      en: "The request path, cookies and the password",
    },
    wrong: [
      { uz: "IP manzillar", en: "The IP addresses" },
      { uz: "Paketlar hajmi", en: "The packet sizes" },
      { uz: "Ulanish vaqti", en: "When the connection happened" },
    ],
    explain: {
      uz: "Mazmun shifrlangan; metama’lumot ochiq.",
      en: "The content is encrypted; the metadata is not.",
    },
  },
  {
    ask: {
      uz: "Client Hello’dagi SNI kuzatuvchiga nimani aytadi?",
      en: "What does the SNI in a Client Hello tell an observer?",
    },
    right: {
      uz: "Qaysi sayt nomiga ulanilayotganini",
      en: "Which site name is being reached",
    },
    wrong: [
      { uz: "Foydalanuvchi parolini", en: "The user’s password" },
      { uz: "Sahifa matnini", en: "The page text" },
      { uz: "Hech narsani", en: "Nothing" },
    ],
    explain: {
      uz: "ECH yoqilmagan bo‘lsa, SNI ochiq yuboriladi.",
      en: "Unless ECH is on, the SNI is sent in the clear.",
    },
  },
  {
    ask: {
      uz: "Base64 haqida qaysi gap to‘g‘ri?",
      en: "Which is true of Base64?",
    },
    right: {
      uz: "Bu kodlash: kalitsiz har kim ortga qaytaradi",
      en: "It is an encoding: anyone can reverse it without a key",
    },
    wrong: [
      { uz: "Bu kuchli shifr", en: "It is strong encryption" },
      { uz: "Bu xesh", en: "It is a hash" },
      { uz: "Faqat server ocha oladi", en: "Only the server can open it" },
    ],
    explain: {
      uz: "Basic autentifikatsiya faqat HTTPS ichida xavfsiz.",
      en: "Basic authentication is only safe inside HTTPS.",
    },
  },
  {
    ask: {
      uz: "Qaysi protokol parolni ochiq yuboradi?",
      en: "Which protocol sends passwords in the clear?",
    },
    right: same("FTP"),
    wrong: [same("SSH"), same("SFTP"), same("HTTPS")],
    explain: {
      uz: "FTP, Telnet, POP3 va oddiy HTTP — ochiq; o‘rniga SFTP, SSH, HTTPS.",
      en: "FTP, Telnet, POP3 and plain HTTP are clear text; use SFTP, SSH, HTTPS instead.",
    },
  },
  {
    ask: {
      uz: "Soatiga minglab aGVsbG8.x7f3.evil.uz kabi DNS so‘rovlari nimaga o‘xshaydi?",
      en: "Thousands of DNS queries an hour like aGVsbG8.x7f3.evil.uz look like what?",
    },
    right: { uz: "DNS tunnel", en: "A DNS tunnel" },
    wrong: [
      { uz: "Oddiy brauzer", en: "An ordinary browser" },
      { uz: "Dasturiy yangilanish", en: "A software update" },
      { uz: "Port skaneri", en: "A port scan" },
    ],
    explain: {
      uz: "Ma’lumot subdomen nomiga kodlangan.",
      en: "The data is encoded in the subdomain.",
    },
  },
  {
    ask: {
      uz: "Shlyuz uchun ARP’ga ikki xil MAC javob bersa?",
      en: "Two different MACs answer ARP for the gateway. What is it?",
    },
    right: { uz: "ARP spoofing ehtimoli", en: "Probably ARP spoofing" },
    wrong: [
      { uz: "Odatiy holat", en: "Normal behaviour" },
      { uz: "DNS xatosi", en: "A DNS error" },
      { uz: "TLS muammosi", en: "A TLS problem" },
    ],
    explain: {
      uz: "Kimdir trafikni o‘zi orqali o‘tkazmoqchi (man-in-the-middle).",
      en: "Someone wants the traffic to pass through them (man in the middle).",
    },
  },
  {
    ask: {
      uz: "Beacon’ni nimasidan tanish mumkin?",
      en: "What gives a beacon away?",
    },
    right: {
      uz: "Bir manzilga deyarli teng oraliqlardagi ko‘p ulanishlar",
      en: "Many connections to one address at nearly equal gaps",
    },
    wrong: [
      { uz: "Katta bitta yuklab olish", en: "One big download" },
      { uz: "Faqat ish vaqtidagi trafik", en: "Traffic only in work hours" },
      { uz: "ICMP ping", en: "An ICMP ping" },
    ],
    explain: {
      uz: "Kichik jitter — avtomat belgisi; odam tartibsiz.",
      en: "Low jitter points to a program; people are irregular.",
    },
  },
  {
    ask: {
      uz: "Kommutatordagi butun segment trafigini qanday ko‘rasiz?",
      en: "How do you see a whole switched segment’s traffic?",
    },
    right: {
      uz: "SPAN (port mirroring) yoki TAP orqali",
      en: "With SPAN (port mirroring) or a TAP",
    },
    wrong: [
      {
        uz: "Wireshark’ni qayta ishga tushirib",
        en: "By restarting Wireshark",
      },
      { uz: "Wi-Fi’ni o‘chirib", en: "By turning off the Wi-Fi" },
      { uz: "Hech qanday usul yo‘q", en: "There is no way" },
    ],
    explain: {
      uz: "Kommutator har bir portga faqat unga tegishli trafikni beradi.",
      en: "A switch gives each port only the traffic meant for it.",
    },
  },
  {
    ask: {
      uz: "NetFlow nimani saqlaydi?",
      en: "What does NetFlow keep?",
    },
    right: {
      uz: "Kim, kimga, qachon va qancha — mazmunsiz",
      en: "Who, to whom, when and how much — no content",
    },
    wrong: [
      {
        uz: "Har bir paketning to‘liq mazmunini",
        en: "Every packet’s full content",
      },
      { uz: "Faqat parollarni", en: "Only passwords" },
      { uz: "Faqat DNS nomlarini", en: "Only DNS names" },
    ],
    explain: {
      uz: "Oqim yozuvlari kichik — uzoq muddat saqlash uchun qulay.",
      en: "Flow records are small, so they suit long-term keeping.",
    },
  },
];

export const FIREWALL_POOL: PoolItem[] = [
  {
    ask: {
      uz: "Firewall qoidalar ro‘yxatini qanday tekshiradi?",
      en: "How does a firewall go through its rule list?",
    },
    right: {
      uz: "Yuqoridan pastga; birinchi mos kelgani qaror qiladi",
      en: "From the top; the first match decides",
    },
    wrong: [
      {
        uz: "Eng aniq qoida qaror qiladi",
        en: "The most specific rule decides",
      },
      { uz: "Oxirgi qoida qaror qiladi", en: "The last rule decides" },
      { uz: "Tasodifiy tartibda", en: "In random order" },
    ],
    explain: {
      uz: "Shuning uchun aniq qoidalar tepada turadi.",
      en: "That is why specific rules go on top.",
    },
  },
  {
    ask: {
      uz: "Qaysi standart siyosat xavfsiz?",
      en: "Which default policy is the safe one?",
    },
    right: same("deny"),
    wrong: [same("allow"), same("log"), same("forward")],
    explain: {
      uz: "Ruxsat etilmagan hamma narsa taqiqlangan — unutilgan xizmat yopiq qoladi.",
      en: "Whatever is not allowed is forbidden — a forgotten service stays closed.",
    },
  },
  {
    ask: {
      uz: "iptables’dagi -j DROP va -j REJECT farqi?",
      en: "What is the difference between -j DROP and -j REJECT in iptables?",
    },
    right: {
      uz: "DROP jim tashlaydi, REJECT rad javobini yuboradi",
      en: "DROP discards silently, REJECT sends a refusal back",
    },
    wrong: [
      { uz: "Farqi yo‘q", en: "There is none" },
      { uz: "DROP paketni o‘tkazadi", en: "DROP lets the packet through" },
      { uz: "REJECT paketni shifrlaydi", en: "REJECT encrypts the packet" },
    ],
    explain: {
      uz: "DROP’da skaner portni “filtered” ko‘radi.",
      en: "With DROP a scanner sees the port as “filtered”.",
    },
  },
  {
    ask: {
      uz: "INPUT zanjiri qaysi paketlarga tegishli?",
      en: "Which packets does the INPUT chain handle?",
    },
    right: {
      uz: "Kompyuterning o‘ziga kelayotgan paketlarga",
      en: "Packets addressed to the machine itself",
    },
    wrong: [
      { uz: "Undan chiqayotganlarga", en: "Packets leaving it" },
      { uz: "U orqali o‘tayotganlarga", en: "Packets passing through it" },
      { uz: "Faqat DNS’ga", en: "DNS only" },
    ],
    explain: {
      uz: "OUTPUT — chiquvchi, FORWARD — o‘tib ketuvchi.",
      en: "OUTPUT is outbound, FORWARD is passing through.",
    },
  },
  {
    ask: {
      uz: "1: ALLOW lan → any; 2: DENY lan → db:5432. Ofis PC bazaga ulanadimi?",
      en: "1: ALLOW lan → any; 2: DENY lan → db:5432. Does an office PC reach the database?",
    },
    right: {
      uz: "Ha, 1-qoida birinchi mos keladi",
      en: "Yes, rule 1 matches first",
    },
    wrong: [
      { uz: "Yo‘q, 2-qoida aniqroq", en: "No, rule 2 is more specific" },
      { uz: "Yo‘q, standart deny", en: "No, the default is deny" },
      {
        uz: "Faqat 5432 dan boshqa portlarda",
        en: "Only on ports other than 5432",
      },
    ],
    explain: {
      uz: "DENY qoidasini tepaga ko‘tarish kerak.",
      en: "The DENY rule has to move up.",
    },
  },
  {
    ask: {
      uz: "Holatsiz firewall’da “manba porti 443 bo‘lsa kirit” qoidasining xavfi?",
      en: "On a stateless firewall, what is the risk of “let in anything from source port 443”?",
    },
    right: {
      uz: "Hujumchi manba portini 443 qilib, ichkariga kiradi",
      en: "An attacker sets source port 443 and gets in",
    },
    wrong: [
      { uz: "HTTPS ishlamay qoladi", en: "HTTPS stops working" },
      { uz: "Hech qanday xavf yo‘q", en: "There is no risk" },
      { uz: "DNS buziladi", en: "DNS breaks" },
    ],
    explain: {
      uz: "Manba portini paket yuboruvchi o‘zi tanlaydi.",
      en: "The sender picks the source port itself.",
    },
  },
  {
    ask: {
      uz: "Holatli firewall javoblarni qanday kiritadi?",
      en: "How does a stateful firewall let replies in?",
    },
    right: {
      uz: "Ichkaridan ochilgan ulanishlarni eslab, ularga tegishli (ESTABLISHED) paketlarni",
      en: "It remembers connections opened from inside and admits packets that belong to them (ESTABLISHED)",
    },
    wrong: [
      {
        uz: "Barcha TCP paketlarni kiritadi",
        en: "It admits every TCP packet",
      },
      { uz: "Javoblarni umuman kiritmaydi", en: "It never admits replies" },
      { uz: "Parol so‘raydi", en: "It asks for a password" },
    ],
    explain: {
      uz: "Bu conntrack: manzil, port va holat jadvali.",
      en: "That is conntrack: a table of addresses, ports and states.",
    },
  },
  {
    ask: {
      uz: "Veb-server bazaga 5432 orqali ulanishi kerak. Eng to‘g‘ri qoida?",
      en: "The web server must reach the database on 5432. The right rule?",
    },
    right: same("ALLOW web → db tcp/5432"),
    wrong: [
      same("ALLOW dmz → servers any"),
      same("ALLOW any → db tcp/5432"),
      same("ALLOW any → any any"),
    ],
    explain: {
      uz: "Eng kam imtiyoz: aynan manba, qabul qiluvchi va port.",
      en: "Least privilege: exactly the source, destination and port.",
    },
  },
  {
    ask: {
      uz: "Nega keng “any” qoidalari xavfli?",
      en: "Why are broad “any” rules dangerous?",
    },
    right: {
      uz: "Bitta server buzilsa, hujumchiga ko‘p yo‘l ochiladi",
      en: "Once one server falls, the attacker has many roads open",
    },
    wrong: [
      { uz: "Tarmoq sekinlashadi", en: "They slow the network" },
      { uz: "Ular ishlamaydi", en: "They don’t work" },
      { uz: "Xavfli emas", en: "They aren’t" },
    ],
    explain: {
      uz: "Har bir ortiqcha ulanish — lateral movement uchun yo‘l.",
      en: "Every extra path is a road for lateral movement.",
    },
  },
  {
    ask: {
      uz: "Internetga ochiq veb-sayt qaysi zonada turadi?",
      en: "Which zone does a public website sit in?",
    },
    right: same("DMZ"),
    wrong: [
      { uz: "Ofis LAN", en: "The office LAN" },
      { uz: "Ichki serverlar", en: "The internal servers" },
      { uz: "Mehmon Wi-Fi", en: "The guest Wi-Fi" },
    ],
    explain: {
      uz: "DMZ buzilsa ham, ichki tarmoq alohida qoladi.",
      en: "Even if the DMZ falls, the internal network stays apart.",
    },
  },
  {
    ask: {
      uz: "Tekis (flat) tarmoqning asosiy xavfi?",
      en: "The main risk of a flat network?",
    },
    right: {
      uz: "Bitta zararlangan qurilma hamma narsaga yetadi",
      en: "One infected device reaches everything",
    },
    wrong: [
      { uz: "Internet sekin", en: "Slow internet" },
      { uz: "IP manzillar tugaydi", en: "Running out of IP addresses" },
      { uz: "Xavf yo‘q", en: "There is none" },
    ],
    explain: {
      uz: "Ransomware aynan shunday tarqaladi.",
      en: "That is how ransomware spreads.",
    },
  },
  {
    ask: {
      uz: "VLAN’lar orasidagi trafikni nima cheklashi kerak?",
      en: "What should limit traffic between VLANs?",
    },
    right: {
      uz: "Firewall yoki router ACL qoidalari",
      en: "Firewall or router ACL rules",
    },
    wrong: [
      { uz: "VLAN’ning o‘zi yetarli", en: "The VLAN alone is enough" },
      { uz: "Wi-Fi paroli", en: "The Wi-Fi password" },
      { uz: "DNS", en: "DNS" },
    ],
    explain: {
      uz: "VLAN ajratadi; marshrutlash esa qoidalar bilan cheklanadi.",
      en: "VLANs separate; routing between them is limited by rules.",
    },
  },
  {
    ask: {
      uz: "Egress (chiquvchi) filtrlash nimaga yordam beradi?",
      en: "What does egress filtering help with?",
    },
    right: {
      uz: "Buzilgan server C2’ga ulana olmaydi va ma’lumot olib chiqa olmaydi",
      en: "A hacked server can’t reach its C2 or carry data out",
    },
    wrong: [
      { uz: "Saytni tezlashtiradi", en: "It speeds up the site" },
      { uz: "Parollarni shifrlaydi", en: "It encrypts passwords" },
      { uz: "Hech narsaga", en: "Nothing" },
    ],
    explain: {
      uz: "Serverlarga faqat kerakli manzillar ochiladi.",
      en: "Servers get only the destinations they need.",
    },
  },
  {
    ask: {
      uz: "RDP (3389) yoki SSH’ni qanday ochish to‘g‘ri?",
      en: "How should RDP (3389) or SSH be reachable?",
    },
    right: {
      uz: "Faqat VPN yoki bastion host orqali",
      en: "Only through a VPN or a bastion host",
    },
    wrong: [
      { uz: "Butun internetga", en: "To the whole internet" },
      { uz: "“Vaqtincha” internetga", en: "“Temporarily” to the internet" },
      { uz: "Mehmon Wi-Fi’ga", en: "To the guest Wi-Fi" },
    ],
    explain: {
      uz: "Boshqaruv portlari — hujumchilarning sevimli nishoni.",
      en: "Management ports are attackers’ favourite target.",
    },
  },
  {
    ask: {
      uz: "Firewall qoidalarini yaxshi saqlashning belgisi?",
      en: "A sign of well-kept firewall rules?",
    },
    right: {
      uz: "Har bir qoidada izoh va egasi, muntazam ko‘rib chiqish",
      en: "A comment and an owner on every rule, with regular reviews",
    },
    wrong: [
      {
        uz: "Qoidalar hech qachon o‘chirilmaydi",
        en: "Rules are never removed",
      },
      {
        uz: "Muammo bo‘lsa allow any any",
        en: "allow any any when something breaks",
      },
      { uz: "Hech kim qoidalarni ko‘rmaydi", en: "Nobody looks at the rules" },
    ],
    explain: {
      uz: "“Vaqtincha” qoidalar yillab qolib ketadi.",
      en: "“Temporary” rules linger for years.",
    },
  },
];

export const CONNECTIONS_POOL: PoolItem[] = [
  {
    ask: {
      uz: "WPA2-PSK’ning asosiy zaif joyi?",
      en: "The main weakness of WPA2-PSK?",
    },
    right: {
      uz: "Yozib olingan handshake’ni offline buzish mumkin",
      en: "A recorded handshake can be cracked offline",
    },
    wrong: [
      { uz: "U shifrlamaydi", en: "It doesn’t encrypt" },
      { uz: "Faqat 2,4 GHz’da ishlaydi", en: "It works on 2.4 GHz only" },
      { uz: "Zaif joyi yo‘q", en: "It has none" },
    ],
    explain: {
      uz: "Himoya faqat parol uzunligi va tasodifiyligiga bog‘liq.",
      en: "The only defence is the passphrase’s length and randomness.",
    },
  },
  {
    ask: {
      uz: "WPA3 (SAE) offline lug‘at hujumiga qanday qarshi turadi?",
      en: "How does WPA3 (SAE) resist offline dictionary attacks?",
    },
    right: {
      uz: "Har bir taxmin tarmoqqa jonli urinish bo‘lishi kerak",
      en: "Every guess has to be a live attempt on the network",
    },
    wrong: [
      { uz: "Parolni yashiradi", en: "It hides the password" },
      { uz: "Wi-Fi nomini yashiradi", en: "It hides the network name" },
      { uz: "Qarshi turmaydi", en: "It doesn’t" },
    ],
    explain: {
      uz: "Yozib olingan handshake offline foydasiz.",
      en: "A recorded handshake is useless offline.",
    },
  },
  {
    ask: {
      uz: "WEP haqida qaysi gap to‘g‘ri?",
      en: "Which is true of WEP?",
    },
    right: {
      uz: "Kalit trafikning o‘zidan daqiqalarda chiqadi",
      en: "The key falls out of the traffic itself in minutes",
    },
    wrong: [
      { uz: "WPA3 dan kuchliroq", en: "It is stronger than WPA3" },
      { uz: "Uzun parol bilan xavfsiz", en: "It is safe with a long password" },
      { uz: "Faqat ofislar uchun", en: "It is for offices only" },
    ],
    explain: {
      uz: "WEP butunlay buzilgan — parol uzunligi yordam bermaydi.",
      en: "WEP is fully broken — password length doesn’t help.",
    },
  },
  {
    ask: {
      uz: "“Evil twin” hujumi nima?",
      en: "What is an “evil twin” attack?",
    },
    right: {
      uz: "Haqiqiy tarmoq nomi bilan soxta Wi-Fi nuqtasi",
      en: "A fake access point with a real network’s name",
    },
    wrong: [
      { uz: "Ikki marta kiritilgan parol", en: "A password typed twice" },
      {
        uz: "Bir xil IP manzilli ikki kompyuter",
        en: "Two computers with one IP",
      },
      { uz: "DNS xatosi", en: "A DNS error" },
    ],
    explain: {
      uz: "Tarmoq nomi (SSID) hech narsani isbotlamaydi.",
      en: "A network name (SSID) proves nothing.",
    },
  },
  {
    ask: {
      uz: "Nega routerda WPS’ni o‘chirish kerak?",
      en: "Why turn WPS off on a router?",
    },
    right: {
      uz: "8 raqamli PIN amalda ~11 000 urinishda topiladi",
      en: "The 8-digit PIN falls in about 11 000 tries in practice",
    },
    wrong: [
      { uz: "U internetni sekinlashtiradi", en: "It slows the internet" },
      { uz: "U WPA3 ni yoqadi", en: "It turns on WPA3" },
      { uz: "O‘chirish shart emas", en: "There is no need" },
    ],
    explain: {
      uz: "PIN ikki yarimda alohida tekshiriladi.",
      en: "The PIN is checked in two halves separately.",
    },
  },
  {
    ask: {
      uz: "Katta ofis Wi-Fi’si uchun eng yaxshi tanlov?",
      en: "The best choice for a big office’s Wi-Fi?",
    },
    right: same("WPA3-Enterprise (802.1X)"),
    wrong: [same("WPA2-PSK"), same("WEP"), same("Open + hidden SSID")],
    explain: {
      uz: "Har bir xodimning o‘z logini — umumiy parol yo‘q.",
      en: "Each employee’s own login — no shared password.",
    },
  },
  {
    ask: {
      uz: "Split tunnel VPN nimani tunnel orqali yuboradi?",
      en: "What does a split-tunnel VPN send through the tunnel?",
    },
    right: { uz: "Faqat ofis manzillarini", en: "Only the office addresses" },
    wrong: [
      { uz: "Butun trafikni", en: "All traffic" },
      { uz: "Faqat DNS’ni", en: "Only DNS" },
      { uz: "Hech narsani", en: "Nothing" },
    ],
    explain: {
      uz: "Qolgan trafik to‘g‘ridan-to‘g‘ri, kafe tarmog‘i orqali ketadi.",
      en: "The rest goes direct, over the café network.",
    },
  },
  {
    ask: {
      uz: "DNS leak nima?",
      en: "What is a DNS leak?",
    },
    right: {
      uz: "VPN yoqilgan, lekin DNS so‘rovlari tunneldan tashqarida ketadi",
      en: "The VPN is on but DNS queries go outside the tunnel",
    },
    wrong: [
      { uz: "DNS server o‘chib qolishi", en: "The DNS server going down" },
      { uz: "Domen muddati tugashi", en: "A domain expiring" },
      { uz: "Parol sizishi", en: "A password leaking" },
    ],
    explain: {
      uz: "Kuzatuvchi qaysi saytlarga kirayotganingizni ko‘radi.",
      en: "An observer sees which sites you visit.",
    },
  },
  {
    ask: {
      uz: "VPN ishlatganda trafikingizni kim ko‘radi?",
      en: "With a VPN on, who can see your traffic?",
    },
    right: {
      uz: "VPN provayderi — shuning uchun ishonchlisini tanlang",
      en: "The VPN provider — so pick one you trust",
    },
    wrong: [
      { uz: "Hech kim, hech qachon", en: "Nobody, ever" },
      { uz: "Faqat kafe egasi", en: "Only the café owner" },
      { uz: "Faqat brauzer", en: "Only the browser" },
    ],
    explain: {
      uz: "VPN ishonchni kafe tarmog‘idan provayderga ko‘chiradi.",
      en: "A VPN moves trust from the café network to the provider.",
    },
  },
  {
    ask: {
      uz: "Qaysi VPN protokoli eskirgan va buzilgan?",
      en: "Which VPN protocol is obsolete and broken?",
    },
    right: same("PPTP"),
    wrong: [same("WireGuard"), same("IKEv2"), same("OpenVPN")],
    explain: {
      uz: "WireGuard va IPsec/IKEv2 — zamonaviy tanlov.",
      en: "WireGuard and IPsec/IKEv2 are the modern choices.",
    },
  },
  {
    ask: {
      uz: "SSH “REMOTE HOST IDENTIFICATION HAS CHANGED” desa?",
      en: "SSH says “REMOTE HOST IDENTIFICATION HAS CHANGED”. What then?",
    },
    right: {
      uz: "To‘xtash va kalitni adminning xavfsiz kanali orqali tekshirish",
      en: "Stop and check the key with the admin over a safe channel",
    },
    wrong: [
      {
        uz: "known_hosts’ni o‘chirib, qayta ulanish",
        en: "Delete known_hosts and reconnect",
      },
      { uz: "“yes” deb davom etish", en: "Type “yes” and go on" },
      { uz: "Parolni almashtirish", en: "Change your password" },
    ],
    explain: {
      uz: "Bu man-in-the-middle bo‘lishi mumkin.",
      en: "It may be a man in the middle.",
    },
  },
  {
    ask: {
      uz: "SSH fingerprint’ni qanday solishtirish kerak?",
      en: "How should an SSH fingerprint be compared?",
    },
    right: {
      uz: "Boshidan oxirigacha, e’lon qilingani bilan",
      en: "End to end, against the published one",
    },
    wrong: [
      { uz: "Faqat birinchi 4 belgini", en: "The first 4 characters only" },
      { uz: "Solishtirish shart emas", en: "There is no need" },
      { uz: "Faqat uzunligini", en: "Only its length" },
    ],
    explain: {
      uz: "Hujumchi boshi o‘xshash kalit yaratishi mumkin.",
      en: "An attacker can make a key with a similar start.",
    },
  },
  {
    ask: {
      uz: "sshd_config’dagi qaysi qator xavfsizlikni oshiradi?",
      en: "Which sshd_config line improves security?",
    },
    right: same("PasswordAuthentication no"),
    wrong: [
      same("PermitRootLogin yes"),
      same("PermitEmptyPasswords yes"),
      same("PasswordAuthentication yes"),
    ],
    explain: {
      uz: "Faqat kalit bilan kirish — parol taxmin qiluvchi bot’lar befoyda.",
      en: "Keys only — password-guessing bots get nowhere.",
    },
  },
  {
    ask: {
      uz: "ssh -L 5432:localhost:5432 server nima qiladi?",
      en: "What does ssh -L 5432:localhost:5432 server do?",
    },
    right: {
      uz: "Serverdagi bazani o‘z kompyuteringizda localhost:5432 da ochadi",
      en: "Opens the server’s database on localhost:5432 on your own machine",
    },
    wrong: [
      {
        uz: "5432-portni internetga ochadi",
        en: "Opens port 5432 to the internet",
      },
      { uz: "Bazani o‘chiradi", en: "Deletes the database" },
      { uz: "Serverni qayta yuklaydi", en: "Restarts the server" },
    ],
    explain: {
      uz: "Trafik SSH ichida shifrlangan, baza tashqaridan ko‘rinmaydi.",
      en: "The traffic is encrypted inside SSH; the database stays hidden.",
    },
  },
  {
    ask: {
      uz: "Agent forwarding (ssh -A) o‘rniga nima xavfsizroq?",
      en: "What is safer than agent forwarding (ssh -A)?",
    },
    right: same("ProxyJump (ssh -J)"),
    wrong: [
      {
        uz: "Shaxsiy kalitni serverga nusxalash",
        en: "Copying the private key to the server",
      },
      { uz: "Parol bilan kirish", en: "Logging in with a password" },
      { uz: "root bilan kirish", en: "Logging in as root" },
    ],
    explain: {
      uz: "ProxyJump agentingizni oraliq serverga bermaydi.",
      en: "ProxyJump doesn’t hand your agent to the middle server.",
    },
  },
];

export const IDS_POOL: PoolItem[] = [
  {
    ask: {
      uz: "Imzo asosidagi aniqlashning zaif tomoni?",
      en: "The weakness of signature-based detection?",
    },
    right: {
      uz: "Yangi, noma’lum hujumni ko‘rmaydi",
      en: "It misses new, unknown attacks",
    },
    wrong: [
      { uz: "Juda sekin ishlaydi", en: "It is very slow" },
      { uz: "Faqat UDP’ni ko‘radi", en: "It sees UDP only" },
      { uz: "Zaif tomoni yo‘q", en: "It has none" },
    ],
    explain: {
      uz: "U faqat ma’lum izni qidiradi.",
      en: "It looks only for a known trace.",
    },
  },
  {
    ask: {
      uz: "Anomaliya asosidagi aniqlashning kamchiligi?",
      en: "The drawback of anomaly-based detection?",
    },
    right: {
      uz: "Ko‘proq yolg‘on signal beradi",
      en: "It raises more false alarms",
    },
    wrong: [
      { uz: "Yangi hujumlarni ko‘rmaydi", en: "It misses new attacks" },
      { uz: "Qoidalar yozib bo‘lmaydi", en: "No rules can be written" },
      { uz: "Shifrlashni buzadi", en: "It breaks encryption" },
    ],
    explain: {
      uz: "“Odatdan farq” har doim ham hujum emas.",
      en: "“Different from usual” isn’t always an attack.",
    },
  },
  {
    ask: {
      uz: "Suricata qoidasida alert va drop farqi?",
      en: "In a Suricata rule, alert versus drop?",
    },
    right: {
      uz: "alert faqat xabar beradi, drop paketni ham to‘xtatadi (inline)",
      en: "alert only reports; drop also stops the packet (inline)",
    },
    wrong: [
      { uz: "Farqi yo‘q", en: "No difference" },
      { uz: "drop faqat log yozadi", en: "drop only writes a log" },
      { uz: "alert paketni o‘chiradi", en: "alert deletes the packet" },
    ],
    explain: {
      uz: "drop faqat IPS (inline) rejimida ishlaydi.",
      en: "drop works only in IPS (inline) mode.",
    },
  },
  {
    ask: {
      uz: "Qoidadagi $HOME_NET nima?",
      en: "What is $HOME_NET in a rule?",
    },
    right: {
      uz: "Sozlamadagi o‘z tarmog‘imiz manzillari",
      en: "Our own network’s addresses, from the config",
    },
    wrong: [
      { uz: "Butun internet", en: "The whole internet" },
      { uz: "Foydalanuvchining uyi", en: "The user’s home" },
      { uz: "DNS server", en: "The DNS server" },
    ],
    explain: {
      uz: "$EXTERNAL_NET — qolgan hamma manzillar.",
      en: "$EXTERNAL_NET is every other address.",
    },
  },
  {
    ask: {
      uz: "sid:1000001 nima?",
      en: "What is sid:1000001?",
    },
    right: {
      uz: "Qoidaning yagona raqami",
      en: "The rule’s unique ID",
    },
    wrong: [
      { uz: "Port raqami", en: "A port number" },
      { uz: "Paketlar soni", en: "A packet count" },
      { uz: "Sessiya ID’si", en: "A session ID" },
    ],
    explain: {
      uz: "O‘z qoidalarimiz odatda 1000000 dan boshlanadi.",
      en: "Local rules usually start at 1000000.",
    },
  },
  {
    ask: {
      uz: 'Nega content:"/etc/passwd" ..%2fetc%2fpasswd ni ushlamaydi?',
      en: 'Why doesn’t content:"/etc/passwd" catch ..%2fetc%2fpasswd?',
    },
    right: {
      uz: "%2f — kodlangan “/”; xom baytlarda satr yo‘q",
      en: "%2f is an encoded “/”; the raw bytes don’t contain the string",
    },
    wrong: [
      { uz: "Suricata HTTP’ni ko‘rmaydi", en: "Suricata can’t see HTTP" },
      { uz: "Bu hujum emas", en: "It isn’t an attack" },
      { uz: "passwd kichik harfda", en: "passwd is lower case" },
    ],
    explain: {
      uz: "http.uri buferi URI’ni normallashtiradi.",
      en: "The http.uri buffer normalizes the URI.",
    },
  },
  {
    ask: {
      uz: "nocase parametri nima qiladi?",
      en: "What does the nocase option do?",
    },
    right: {
      uz: "Katta-kichik harfni farqlamaydi",
      en: "It ignores upper and lower case",
    },
    wrong: [
      { uz: "Qoidani o‘chiradi", en: "It turns the rule off" },
      { uz: "Faqat raqamlarni qidiradi", en: "It matches digits only" },
      { uz: "Shifrlangan trafikni ochadi", en: "It opens encrypted traffic" },
    ],
    explain: {
      uz: "/ETC/PASSWD ham ushlanadi.",
      en: "/ETC/PASSWD is caught too.",
    },
  },
  {
    ask: {
      uz: "“track by_src” chegarada nimani bildiradi?",
      en: "What does “track by_src” mean in a threshold?",
    },
    right: {
      uz: "Hodisalar har bir manba IP uchun alohida sanaladi",
      en: "Events are counted separately for each source IP",
    },
    wrong: [
      { uz: "Faqat birinchi manba", en: "The first source only" },
      { uz: "Hamma manbalar birga", en: "All sources together" },
      { uz: "Faqat qabul qiluvchi", en: "The destination only" },
    ],
    explain: {
      uz: "by_dst — qabul qiluvchi bo‘yicha sanaydi.",
      en: "by_dst counts per destination instead.",
    },
  },
  {
    ask: {
      uz: "Har 25 soniyada bitta taxmin qiladigan botni count 5, seconds 60 ushlaydimi?",
      en: "Does count 5, seconds 60 catch a bot guessing once every 25 seconds?",
    },
    right: {
      uz: "Yo‘q — 60 soniyaga atigi 3 urinish sig‘adi",
      en: "No — only 3 attempts fit in 60 seconds",
    },
    wrong: [
      { uz: "Ha, darhol", en: "Yes, straight away" },
      { uz: "Ha, 10 daqiqadan keyin", en: "Yes, after 10 minutes" },
      { uz: "Faqat kechasi", en: "Only at night" },
    ],
    explain: {
      uz: "“Low and slow” uchun uzunroq oyna kerak.",
      en: "“Low and slow” needs a longer window.",
    },
  },
  {
    ask: {
      uz: "Juda qattiq brute-force chegarasining oqibati?",
      en: "What does a brute-force threshold that is too strict cause?",
    },
    right: {
      uz: "Parolni xato yozgan xodimlar uchun ham signal",
      en: "Alerts for colleagues who mistype their password",
    },
    wrong: [
      { uz: "Bot’lar ko‘rinmaydi", en: "Bots go unseen" },
      { uz: "Tarmoq tezlashadi", en: "The network speeds up" },
      { uz: "Hech narsa", en: "Nothing" },
    ],
    explain: {
      uz: "Ko‘p yolg‘on signal — signal charchog‘i.",
      en: "Many false alarms lead to alert fatigue.",
    },
  },
  {
    ask: {
      uz: "SQL injection signali — manba kompaniyaning o‘z skaneri, rejadagi vaqtda. To‘g‘ri harakat?",
      en: "A SQL injection alert from the company’s own scanner, at its scheduled time. The right move?",
    },
    right: {
      uz: "Tor istisno qo‘shish: skaner IP’si va vaqti",
      en: "Add a narrow exception: the scanner’s IP and time",
    },
    wrong: [
      { uz: "Qoidani butunlay o‘chirish", en: "Turn the rule off entirely" },
      { uz: "Incident e’lon qilish", en: "Declare an incident" },
      { uz: "Skanerni bloklash", en: "Block the scanner" },
    ],
    explain: {
      uz: "Istisno qanchalik tor bo‘lsa, shuncha kam ko‘r nuqta.",
      en: "The narrower the exception, the fewer blind spots.",
    },
  },
  {
    ask: {
      uz: "SSH brute force signali, keyin o‘sha IP’dan muvaffaqiyatli kirish. Bu?",
      en: "An SSH brute-force alert, then a successful login from the same IP. This is?",
    },
    right: {
      uz: "Haqiqiy hujum — darhol eskalatsiya",
      en: "A real attack — escalate at once",
    },
    wrong: [
      { uz: "Yolg‘on signal", en: "A false positive" },
      { uz: "Oddiy holat", en: "Normal behaviour" },
      { uz: "Skaner", en: "A scanner" },
    ],
    explain: {
      uz: "Muvaffaqiyatli kirish — hujumchi ichkarida bo‘lishi mumkin.",
      en: "A successful login means the attacker may be in.",
    },
  },
  {
    ask: {
      uz: "SPAN portidagi IDS hujum paketini to‘xtata oladimi?",
      en: "Can an IDS on a SPAN port stop an attack packet?",
    },
    right: {
      uz: "Yo‘q — u faqat nusxani ko‘radi",
      en: "No — it sees only a copy",
    },
    wrong: [
      { uz: "Ha, har doim", en: "Yes, always" },
      { uz: "Faqat TCP’da", en: "Only for TCP" },
      { uz: "Faqat kunduzi", en: "Only by day" },
    ],
    explain: {
      uz: "To‘xtatish uchun inline (IPS) kerak.",
      en: "Stopping takes an inline IPS.",
    },
  },
  {
    ask: {
      uz: "HTTPS trafikida tarmoq IDS’i nimani ko‘ra oladi?",
      en: "What can a network IDS see in HTTPS traffic?",
    },
    right: {
      uz: "Metama’lumot: IP, SNI, vaqt, hajm",
      en: "Metadata: IPs, SNI, timing, sizes",
    },
    wrong: [
      { uz: "So‘rovning to‘liq matni", en: "The full request text" },
      { uz: "Parollar", en: "Passwords" },
      { uz: "Cookie’lar", en: "Cookies" },
    ],
    explain: {
      uz: "Mazmun uchun TLS tugaydigan joyda loglash kerak.",
      en: "For content, log where TLS ends.",
    },
  },
  {
    ask: {
      uz: "Million hodisada 10 hujum; IDS 99% ushlaydi, 0,1% adashadi. Signallarning qanchasi haqiqiy?",
      en: "10 attacks in a million events; the IDS catches 99% and errs on 0.1%. What share of alerts is real?",
    },
    right: same("≈ 1%"),
    wrong: [same("≈ 50%"), same("≈ 90%"), same("≈ 99%")],
    explain: {
      uz: "≈ 10 haqiqiy va ≈ 1000 yolg‘on signal.",
      en: "About 10 real and about 1000 false alerts.",
    },
  },
];

export const EVIDENCE_POOL: PoolItem[] = [
  {
    ask: {
      uz: "O‘zgaruvchanlik tartibiga ko‘ra birinchi nima yig‘iladi?",
      en: "By the order of volatility, what is collected first?",
    },
    right: { uz: "Operativ xotira (RAM)", en: "Memory (RAM)" },
    wrong: [
      { uz: "Qattiq disk", en: "The hard disk" },
      { uz: "Zaxira lentasi", en: "The backup tape" },
      { uz: "Arxiv loglari", en: "Archived logs" },
    ],
    explain: {
      uz: "RAM elektr uzilishi bilan yo‘qoladi.",
      en: "RAM is lost the moment the power goes.",
    },
  },
  {
    ask: {
      uz: "Shubhali kompyuterda antivirus ishga tushirish nega xato?",
      en: "Why is running antivirus on the suspect computer a mistake?",
    },
    right: {
      uz: "U diskka yozadi va dalilni o‘zgartiradi",
      en: "It writes to the disk and changes the evidence",
    },
    wrong: [
      { uz: "Antivirus juda qimmat", en: "Antivirus is too expensive" },
      { uz: "U internetni o‘chiradi", en: "It cuts the internet" },
      { uz: "Xato emas", en: "It isn’t" },
    ],
    explain: {
      uz: "Har qanday yozish — vaqt belgilari va fayllar o‘zgaradi.",
      en: "Any write changes timestamps and files.",
    },
  },
  {
    ask: {
      uz: "Write blocker nima qiladi?",
      en: "What does a write blocker do?",
    },
    right: {
      uz: "Diskdan faqat o‘qishga ruxsat beradi",
      en: "It allows only reading from the disk",
    },
    wrong: [
      { uz: "Diskni shifrlaydi", en: "It encrypts the disk" },
      { uz: "Diskni tozalaydi", en: "It wipes the disk" },
      { uz: "Tasvirni siqadi", en: "It compresses the image" },
    ],
    explain: {
      uz: "Tizim diskka hech narsa yoza olmaydi.",
      en: "The system can’t write anything to the disk.",
    },
  },
  {
    ask: {
      uz: "Nega fayllarni oddiy nusxalash yetmaydi?",
      en: "Why isn’t copying the files enough?",
    },
    right: {
      uz: "O‘chirilgan fayllar, bo‘sh joy va metama’lumot qoladi",
      en: "Deleted files, free space and metadata are left behind",
    },
    wrong: [
      { uz: "Juda sekin", en: "It is too slow" },
      { uz: "Fayllar shifrlanadi", en: "The files get encrypted" },
      { uz: "Yetarli", en: "It is enough" },
    ],
    explain: {
      uz: "Bit-ma-bit tasvir (dd, E01) hammasini saqlaydi.",
      en: "A bit-for-bit image (dd, E01) keeps everything.",
    },
  },
  {
    ask: {
      uz: "dd if=/dev/sdb of=disk.img — if va of almashtirilsa?",
      en: "dd if=/dev/sdb of=disk.img — what if if and of are swapped?",
    },
    right: {
      uz: "Asl diskning ustidan yoziladi — dalil yo‘qoladi",
      en: "The original disk is written over — the evidence is lost",
    },
    wrong: [
      { uz: "Hech narsa bo‘lmaydi", en: "Nothing happens" },
      { uz: "Tasvir tezroq olinadi", en: "The image is taken faster" },
      { uz: "Xesh o‘zgarmaydi", en: "The hash stays the same" },
    ],
    explain: {
      uz: "Shuning uchun write blocker ham kerak.",
      en: "That is one more reason for a write blocker.",
    },
  },
  {
    ask: {
      uz: "conv=noerror,sync nima uchun?",
      en: "What is conv=noerror,sync for?",
    },
    right: {
      uz: "Buzilgan sektorda to‘xtamaslik va uni nollar bilan to‘ldirish",
      en: "To keep going past bad sectors and fill them with zeros",
    },
    wrong: [
      { uz: "Diskni shifrlash", en: "To encrypt the disk" },
      { uz: "Xeshni hisoblash", en: "To compute the hash" },
      { uz: "Fayllarni o‘chirish", en: "To delete files" },
    ],
    explain: {
      uz: "Tasvir hajmi asl bilan bir xil qoladi.",
      en: "The image stays the same size as the original.",
    },
  },
  {
    ask: {
      uz: "Tasvir aniq nusxa ekanini nima isbotlaydi?",
      en: "What proves an image is an exact copy?",
    },
    right: {
      uz: "Asl disk va tasvirning bir xil SHA-256 xeshi",
      en: "The same SHA-256 hash for the original and the image",
    },
    wrong: [
      { uz: "Bir xil fayl hajmi", en: "The same file size" },
      { uz: "Bir xil fayl nomi", en: "The same file name" },
      { uz: "Tahlilchining so‘zi", en: "The analyst’s word" },
    ],
    explain: {
      uz: "Hajm bir xil bo‘lib, mazmun farq qilishi mumkin.",
      en: "Sizes can match while the contents differ.",
    },
  },
  {
    ask: {
      uz: "Nusxaning xeshi hisobotdagidan bitta belgiga farq qiladi. Bu?",
      en: "A copy’s hash differs from the report by one character. This means?",
    },
    right: {
      uz: "Nusxa o‘zgargan — undan foydalanib bo‘lmaydi",
      en: "The copy has changed — it can’t be used",
    },
    wrong: [
      { uz: "Arzimas farq", en: "A trifling difference" },
      { uz: "Xesh dasturi xatosi", en: "A bug in the hash tool" },
      { uz: "Yangi versiya", en: "A newer version" },
    ],
    explain: {
      uz: "Bitta bayt o‘zgarsa ham, xesh butunlay boshqacha.",
      en: "Even one changed byte changes the whole hash.",
    },
  },
  {
    ask: {
      uz: "Dalil uchun qaysi xesh eskirgan?",
      en: "Which hash is out of date for evidence?",
    },
    right: same("MD5"),
    wrong: [same("SHA-256"), same("SHA-512"), same("SHA3-256")],
    explain: {
      uz: "MD5 uchun to‘qnashuvlar topilgan.",
      en: "MD5 collisions are known.",
    },
  },
  {
    ask: {
      uz: "Tahlil qaysi faylda olib boriladi?",
      en: "Which file is the analysis done on?",
    },
    right: {
      uz: "Tasvirning ishchi nusxasida",
      en: "A working copy of the image",
    },
    wrong: [
      { uz: "Asl diskda", en: "The original disk" },
      { uz: "Asl (master) tasvirda", en: "The master image" },
      { uz: "Gumondorning kompyuterida", en: "The suspect’s computer" },
    ],
    explain: {
      uz: "Master tasvir muhrlangan holda saqlanadi.",
      en: "The master image stays sealed.",
    },
  },
  {
    ask: {
      uz: "Saqlash zanjiri nima?",
      en: "What is the chain of custody?",
    },
    right: {
      uz: "Dalilni kim, qachon, kimdan olib, kimga berganining uzluksiz yozuvi",
      en: "An unbroken record of who took the evidence from whom and when, and who they gave it to",
    },
    wrong: [
      {
        uz: "Dalillar saqlanadigan shkaf",
        en: "The locker evidence is kept in",
      },
      { uz: "Xeshlar ro‘yxati", en: "A list of hashes" },
      { uz: "Sud qarori", en: "A court order" },
    ],
    explain: {
      uz: "Bitta bo‘shliq dalilni shubha ostiga qo‘yadi.",
      en: "One gap puts the evidence in doubt.",
    },
  },
  {
    ask: {
      uz: "Saqlash zanjirida yozuv bo‘lmagan oraliq bo‘lsa?",
      en: "What if the chain of custody has a period with no entry?",
    },
    right: {
      uz: "Dalil sudda rad etilishi mumkin",
      en: "The evidence may be thrown out in court",
    },
    wrong: [
      { uz: "Hech narsa", en: "Nothing" },
      { uz: "Faqat xesh qayta olinadi", en: "Just rehash it" },
      { uz: "Dalil kuchliroq bo‘ladi", en: "The evidence gets stronger" },
    ],
    explain: {
      uz: "Bu vaqtda dalil bilan nima bo‘lganini hech kim isbotlay olmaydi.",
      en: "Nobody can show what happened to it in that time.",
    },
  },
  {
    ask: {
      uz: "Har bir saqlash yozuvida nima bo‘lishi kerak?",
      en: "What must each custody entry contain?",
    },
    right: {
      uz: "Vaqt, kimdan, kimga, muhr holati va imzolar",
      en: "The time, from whom, to whom, the seal’s state and signatures",
    },
    wrong: [
      { uz: "Faqat sana", en: "Just the date" },
      { uz: "Faqat dalil nomi", en: "Just the item’s name" },
      {
        uz: "Hech narsa, og‘zaki yetarli",
        en: "Nothing, word of mouth will do",
      },
    ],
    explain: {
      uz: "Har bir topshiriq hujjatlashtiriladi.",
      en: "Every hand-over is documented.",
    },
  },
  {
    ask: {
      uz: "Noutbuk yoniq, disk BitLocker bilan shifrlangan. Birinchi qadam?",
      en: "A laptop is on and BitLocker-encrypted. The first step?",
    },
    right: {
      uz: "RAM tasvirini olish",
      en: "Image the RAM",
    },
    wrong: [
      { uz: "Darhol o‘chirish", en: "Turn it off at once" },
      { uz: "Qayta yuklash", en: "Reboot it" },
      { uz: "Antivirus ishga tushirish", en: "Run antivirus" },
    ],
    explain: {
      uz: "Shifrlash kaliti faqat xotirada bo‘lishi mumkin.",
      en: "The encryption key may exist only in memory.",
    },
  },
  {
    ask: {
      uz: "Jonli tizimda ishlatilgan vositalar haqida nima qilinadi?",
      en: "What happens with the tools used on a live system?",
    },
    right: {
      uz: "Har biri va ishlatilgan vaqti hisobotga yoziladi",
      en: "Each one and when it ran goes into the report",
    },
    wrong: [
      { uz: "Yashiriladi", en: "They are kept quiet" },
      { uz: "O‘chirib tashlanadi", en: "They are deleted" },
      { uz: "Hech narsa", en: "Nothing" },
    ],
    explain: {
      uz: "Ular tizimda iz qoldiradi — buni tushuntirish kerak.",
      en: "They leave traces on the system — those must be explained.",
    },
  },
];

export const FILESYSTEM_POOL: PoolItem[] = [
  {
    ask: {
      uz: "MACB’dagi C nimani bildiradi?",
      en: "What does the C in MACB stand for?",
    },
    right: {
      uz: "Change — inode o‘zgargan (ruxsat, nom, egasi, mazmun)",
      en: "Change — the inode changed (permissions, name, owner, content)",
    },
    wrong: [
      { uz: "Creation — yaratilgan", en: "Creation — when it was made" },
      { uz: "Copy — nusxalangan", en: "Copy — when it was copied" },
      { uz: "Close — yopilgan", en: "Close — when it was closed" },
    ],
    explain: {
      uz: "Yaratilish — Birth (crtime).",
      en: "Creation is Birth (crtime).",
    },
  },
  {
    ask: {
      uz: "Faylni o‘qish qaysi vaqtni o‘zgartiradi?",
      en: "Which timestamp does reading a file change?",
    },
    right: same("atime"),
    wrong: [same("mtime"), same("ctime"), same("crtime")],
    explain: {
      uz: "relatime bo‘lsa, har o‘qishda emas.",
      en: "With relatime, not on every read.",
    },
  },
  {
    ask: {
      uz: "Faylga yozish qaysi vaqtlarni o‘zgartiradi?",
      en: "Which timestamps does writing to a file change?",
    },
    right: same("mtime, ctime"),
    wrong: [
      { uz: "Faqat atime", en: "Only atime" },
      same("crtime"),
      { uz: "Hech biri", en: "None of them" },
    ],
    explain: {
      uz: "Mazmun va hajm o‘zgaradi — inode ham.",
      en: "Content and size change — so does the inode.",
    },
  },
  {
    ask: {
      uz: "mv report.xlsx old.xlsx (bitta disk ichida) nimani o‘zgartiradi?",
      en: "What does mv report.xlsx old.xlsx (on one disk) change?",
    },
    right: { uz: "Faqat ctime", en: "Only ctime" },
    wrong: [
      { uz: "mtime va birth", en: "mtime and birth" },
      { uz: "Hammasini", en: "All of them" },
      { uz: "Hech narsani", en: "Nothing" },
    ],
    explain: {
      uz: "Mazmun o‘sha, inode o‘sha — faqat nom.",
      en: "Same content, same inode — only the name.",
    },
  },
  {
    ask: {
      uz: "Inode raqami nom o‘zgarganda nima bo‘ladi?",
      en: "What happens to the inode number when a file is renamed?",
    },
    right: { uz: "O‘zgarmaydi", en: "It stays the same" },
    wrong: [
      { uz: "Yangisi beriladi", en: "A new one is given" },
      { uz: "Nolga tushadi", en: "It drops to zero" },
      { uz: "O‘chiriladi", en: "It is deleted" },
    ],
    explain: {
      uz: "Nom — katalog yozuvi; inode — faylning o‘zi.",
      en: "The name is a directory entry; the inode is the file itself.",
    },
  },
  {
    ask: {
      uz: "Faylni o‘chirganda (HDD) ma’lumot bilan nima bo‘ladi?",
      en: "When a file is deleted (on an HDD), what happens to its data?",
    },
    right: {
      uz: "Ustidan yozilguncha diskda qoladi",
      en: "It stays on the disk until written over",
    },
    wrong: [
      { uz: "Darhol nollar bilan yoziladi", en: "It is zeroed at once" },
      { uz: "Bulutga ko‘chadi", en: "It moves to the cloud" },
      { uz: "Shifrlanadi", en: "It gets encrypted" },
    ],
    explain: {
      uz: "Faqat nom va bloklar “bo‘sh” deb belgilanadi.",
      en: "Only the name goes and the blocks are marked free.",
    },
  },
  {
    ask: {
      uz: "SSD’da TRIM nima qiladi?",
      en: "What does TRIM do on an SSD?",
    },
    right: {
      uz: "Bo‘sh bloklarni tez orada tozalaydi",
      en: "It soon wipes the free blocks",
    },
    wrong: [
      { uz: "Fayllarni shifrlaydi", en: "It encrypts files" },
      { uz: "Diskni tezlashtiradi, xolos", en: "It just speeds up the disk" },
      { uz: "O‘chirilganlarni tiklaydi", en: "It restores deleted files" },
    ],
    explain: {
      uz: "Shuning uchun SSD’dan tiklash qiyinroq.",
      en: "That is why recovery from an SSD is harder.",
    },
  },
  {
    ask: {
      uz: "Slack space nima?",
      en: "What is slack space?",
    },
    right: {
      uz: "Fayl oxiri va blok oxiri orasidagi joy",
      en: "The gap between a file’s end and its block’s end",
    },
    wrong: [
      { uz: "Savat papkasi", en: "The recycle bin" },
      { uz: "Operativ xotira", en: "Memory" },
      { uz: "Zaxira nusxa", en: "A backup" },
    ],
    explain: {
      uz: "Unda eski ma’lumot qoldiqlari bo‘lishi mumkin.",
      en: "It may hold scraps of older data.",
    },
  },
  {
    ask: {
      uz: "25 50 44 46 bilan boshlanadigan fayl turi?",
      en: "Which file type starts with 25 50 44 46?",
    },
    right: same("PDF"),
    wrong: [same("JPEG"), same("ZIP"), same("EXE")],
    explain: {
      uz: "Bu ASCII’da “%PDF”.",
      en: "It is “%PDF” in ASCII.",
    },
  },
  {
    ask: {
      uz: "DOCX fayl qaysi imzo bilan boshlanadi?",
      en: "Which signature does a DOCX file start with?",
    },
    right: same("50 4B 03 04 (ZIP)"),
    wrong: [same("FF D8 FF"), same("4D 5A"), same("25 50 44 46")],
    explain: {
      uz: "DOCX aslida ZIP arxiv.",
      en: "A DOCX is really a ZIP archive.",
    },
  },
  {
    ask: {
      uz: "photo.jpg 4D 5A bilan boshlanadi. Bu?",
      en: "photo.jpg starts with 4D 5A. This is?",
    },
    right: {
      uz: "Rasm niqobidagi Windows dasturi",
      en: "A Windows program dressed up as an image",
    },
    wrong: [
      { uz: "Oddiy rasm", en: "An ordinary image" },
      { uz: "Buzilgan rasm", en: "A broken image" },
      { uz: "PDF", en: "A PDF" },
    ],
    explain: {
      uz: "JPEG FF D8 FF bilan boshlanadi.",
      en: "A JPEG starts with FF D8 FF.",
    },
  },
  {
    ask: {
      uz: "Veb-log UTC+5 da 07:11, fayl tizimi UTC’da 02:11. Bu?",
      en: "Web log at 07:11 in UTC+5, file system at 02:11 UTC. These are?",
    },
    right: { uz: "Bir vaqtda", en: "The same moment" },
    wrong: [
      { uz: "5 soat farq bilan", en: "Five hours apart" },
      { uz: "Turli kunlarda", en: "On different days" },
      { uz: "Aniqlab bo‘lmaydi", en: "Impossible to tell" },
    ],
    explain: {
      uz: "07:11 − 5 = 02:11 UTC.",
      en: "07:11 minus 5 is 02:11 UTC.",
    },
  },
  {
    ask: {
      uz: "Xronologiya tuzishdan oldin vaqtlar bilan nima qilinadi?",
      en: "What is done with the times before building a timeline?",
    },
    right: {
      uz: "Hammasi bitta zonaga (UTC) keltiriladi",
      en: "They are all brought to one zone (UTC)",
    },
    wrong: [
      { uz: "Yaxlitlanadi", en: "They are rounded" },
      { uz: "Hech narsa", en: "Nothing" },
      { uz: "Mahalliy vaqtga o‘tkazilmaydi", en: "They are left as they are" },
    ],
    explain: {
      uz: "Aks holda voqealar tartibi buziladi.",
      en: "Otherwise the order of events falls apart.",
    },
  },
  {
    ask: {
      uz: "mtime birth’dan oldin bo‘lsa, bu nimaning belgisi?",
      en: "An mtime earlier than the birth time is a sign of what?",
    },
    right: {
      uz: "Timestomping — vaqt soxtalashtirilgan",
      en: "Timestomping — the time was faked",
    },
    wrong: [
      { uz: "Oddiy holat", en: "Normal behaviour" },
      { uz: "Disk to‘lgan", en: "A full disk" },
      { uz: "Virus yo‘qligi", en: "No virus present" },
    ],
    explain: {
      uz: "Fayl yaratilishidan oldin o‘zgara olmaydi.",
      en: "A file can’t change before it exists.",
    },
  },
  {
    ask: {
      uz: "NSRL kabi bazalar nimaga kerak?",
      en: "What are sets such as the NSRL for?",
    },
    right: {
      uz: "Ma’lum, o‘zgarmagan fayllarni tahlildan chetga olish",
      en: "Setting known, unchanged files aside from the analysis",
    },
    wrong: [
      { uz: "Parollarni tiklash", en: "Recovering passwords" },
      { uz: "Diskni shifrlash", en: "Encrypting the disk" },
      { uz: "Fayllarni o‘chirish", en: "Deleting files" },
    ],
    explain: {
      uz: "Xeshi mos kelmagan tizim fayli — shubhali.",
      en: "A system file whose hash doesn’t match is suspicious.",
    },
  },
];

export const LOGS_POOL: PoolItem[] = [
  {
    ask: {
      uz: "Debian/Ubuntu’da SSH kirishlari qaysi faylga yoziladi?",
      en: "Where does Debian/Ubuntu write SSH logins?",
    },
    right: same("/var/log/auth.log"),
    wrong: [
      same("/var/log/nginx/access.log"),
      same("/etc/passwd"),
      same("/tmp/ssh.log"),
    ],
    explain: {
      uz: "RHEL’da — /var/log/secure.",
      en: "On RHEL it is /var/log/secure.",
    },
  },
  {
    ask: {
      uz: "Klassik syslog vaqtida nima yo‘q?",
      en: "What does a classic syslog timestamp lack?",
    },
    right: { uz: "Yil va vaqt zonasi", en: "The year and the time zone" },
    wrong: [
      { uz: "Soat", en: "The hour" },
      { uz: "Oy", en: "The month" },
      { uz: "Soniya", en: "The seconds" },
    ],
    explain: {
      uz: "Ularni server sozlamasidan bilish kerak.",
      en: "You have to learn them from the server’s settings.",
    },
  },
  {
    ask: {
      uz: "“Accepted password for root from 203.0.113.7” nimani bildiradi?",
      en: "What does “Accepted password for root from 203.0.113.7” mean?",
    },
    right: {
      uz: "203.0.113.7 root sifatida parol bilan muvaffaqiyatli kirgan",
      en: "203.0.113.7 logged in as root with a password",
    },
    wrong: [
      { uz: "Kirish rad etilgan", en: "The login was refused" },
      { uz: "Parol o‘zgartirilgan", en: "The password was changed" },
      { uz: "Kalit bilan kirilgan", en: "It was a key login" },
    ],
    explain: {
      uz: "Failed — rad etilgan; publickey — kalit bilan.",
      en: "Failed means refused; publickey means a key.",
    },
  },
  {
    ask: {
      uz: "useradd logida UID=0 nimani bildiradi?",
      en: "What does UID=0 in a useradd log mean?",
    },
    right: {
      uz: "Yangi hisob root huquqiga ega — orqa eshik",
      en: "The new account has root rights — a back door",
    },
    wrong: [
      { uz: "Hisob o‘chirilgan", en: "The account is disabled" },
      { uz: "Mehmon hisobi", en: "A guest account" },
      { uz: "Hech narsa", en: "Nothing" },
    ],
    explain: {
      uz: "UID 0 — root.",
      en: "UID 0 is root.",
    },
  },
  {
    ask: {
      uz: "grep -v 'deploy' nima qiladi?",
      en: "What does grep -v 'deploy' do?",
    },
    right: {
      uz: "deploy so‘zi yo‘q qatorlarni ko‘rsatadi",
      en: "Shows the lines without “deploy”",
    },
    wrong: [
      { uz: "Faqat deploy qatorlarini", en: "Only the deploy lines" },
      { uz: "deploy’ni o‘chiradi", en: "Deletes deploy" },
      { uz: "Versiyani ko‘rsatadi", en: "Shows the version" },
    ],
    explain: {
      uz: "-v — teskari moslik.",
      en: "-v inverts the match.",
    },
  },
  {
    ask: {
      uz: "Bitta SSH seansining qatorlarini nima bog‘laydi?",
      en: "What ties together the lines of one SSH session?",
    },
    right: { uz: "Bir xil PID (sshd[2211])", en: "The same PID (sshd[2211])" },
    wrong: [
      { uz: "Bir xil daqiqa", en: "The same minute" },
      { uz: "Bir xil xost", en: "The same host" },
      { uz: "Hech narsa", en: "Nothing" },
    ],
    explain: {
      uz: "Jarayon raqami seans davomida o‘zgarmaydi.",
      en: "The process ID stays the same for the session.",
    },
  },
  {
    ask: {
      uz: "Windows hodisasi 4625 nima?",
      en: "What is Windows event 4625?",
    },
    right: { uz: "Muvaffaqiyatsiz kirish", en: "A failed logon" },
    wrong: [
      { uz: "Muvaffaqiyatli kirish", en: "A successful logon" },
      { uz: "Jurnal tozalandi", en: "The log was cleared" },
      { uz: "Xizmat o‘rnatildi", en: "A service was installed" },
    ],
    explain: {
      uz: "4624 — muvaffaqiyatli.",
      en: "4624 is the successful one.",
    },
  },
  {
    ask: {
      uz: "Windows hodisasi 1102 nimani bildiradi?",
      en: "What does Windows event 1102 mean?",
    },
    right: {
      uz: "Xavfsizlik jurnali tozalangan",
      en: "The security log was cleared",
    },
    wrong: [
      { uz: "Yangi foydalanuvchi", en: "A new user" },
      { uz: "Tizim yangilandi", en: "The system was updated" },
      { uz: "Printer ulandi", en: "A printer was connected" },
    ],
    explain: {
      uz: "Kimdir izlarini yashirmoqchi bo‘lgan.",
      en: "Someone tried to hide their tracks.",
    },
  },
  {
    ask: {
      uz: "4624’dagi Logon Type 10 nima?",
      en: "What is Logon Type 10 in a 4624 event?",
    },
    right: { uz: "RDP orqali kirish", en: "A logon over RDP" },
    wrong: [
      { uz: "Klaviaturadan kirish", en: "A logon at the keyboard" },
      { uz: "Xizmat hisobi", en: "A service account" },
      { uz: "Muvaffaqiyatsiz kirish", en: "A failed logon" },
    ],
    explain: {
      uz: "2 — klaviatura, 3 — tarmoq, 10 — RDP.",
      en: "2 is the keyboard, 3 the network, 10 RDP.",
    },
  },
  {
    ask: {
      uz: "Qaysi artefakt dastur ishga tushganini ko‘rsatadi?",
      en: "Which artefact shows a program ran?",
    },
    right: same("Prefetch (.pf)"),
    wrong: [
      { uz: "Brauzer cookie’si", en: "A browser cookie" },
      { uz: "Brauzer keshi", en: "The browser cache" },
      { uz: "Xatcho‘p", en: "A bookmark" },
    ],
    explain: {
      uz: "Prefetch — Windows dastur ishga tushganda yaratadi.",
      en: "Windows creates Prefetch when a program runs.",
    },
  },
  {
    ask: {
      uz: "10 xonali vaqt raqami (1791000000) odatda qaysi format?",
      en: "A 10-digit time number (1791000000) is usually which format?",
    },
    right: { uz: "Unix soniya", en: "Unix seconds" },
    wrong: [
      { uz: "Unix millisoniya", en: "Unix milliseconds" },
      { uz: "Chrome mikrosoniya", en: "Chrome microseconds" },
      { uz: "Windows FILETIME", en: "Windows FILETIME" },
    ],
    explain: {
      uz: "13 xona — millisoniya, 17 — Chrome.",
      en: "13 digits are milliseconds, 17 Chrome.",
    },
  },
  {
    ask: {
      uz: "Chrome vaqtlari qaysi sanadan sanaladi?",
      en: "From what date does Chrome count its times?",
    },
    right: same("1601-01-01"),
    wrong: [same("1970-01-01"), same("2000-01-01"), same("1900-01-01")],
    explain: {
      uz: "Mikrosoniyalarda, Windows kabi 1601 dan.",
      en: "In microseconds, from 1601 like Windows.",
    },
  },
  {
    ask: {
      uz: "Loglarni tozalashdan eng yaxshi himoya?",
      en: "The best protection against cleared logs?",
    },
    right: {
      uz: "Real vaqtda markaziy serverga (SIEM) yuborish",
      en: "Shipping them to a central server (SIEM) in real time",
    },
    wrong: [
      { uz: "Log fayllarini yashirish", en: "Hiding the log files" },
      { uz: "Loglarni o‘chirib qo‘yish", en: "Turning logs off" },
      { uz: "Faqat haftada bir ko‘rish", en: "Looking once a week" },
    ],
    explain: {
      uz: "Hujumchi markaziy serverga yeta olmaydi.",
      en: "The attacker can’t reach the central server.",
    },
  },
  {
    ask: {
      uz: "Umumiy “admin” hisobi tergovga qanday xalaqit beradi?",
      en: "How does a shared “admin” account hurt an investigation?",
    },
    right: {
      uz: "Kim nima qilganini aniqlab bo‘lmaydi",
      en: "You can’t tell who did what",
    },
    wrong: [
      { uz: "Loglar yozilmaydi", en: "No logs get written" },
      { uz: "Hech qanday", en: "It doesn’t" },
      { uz: "Parol uzunroq bo‘ladi", en: "The password gets longer" },
    ],
    explain: {
      uz: "Har kimga o‘z hisobi kerak.",
      en: "Everyone needs their own account.",
    },
  },
  {
    ask: {
      uz: "Nega barcha serverlarda NTP kerak?",
      en: "Why should every server run NTP?",
    },
    right: {
      uz: "Turli loglardagi vaqtlarni solishtirish uchun",
      en: "So times in different logs line up",
    },
    wrong: [
      { uz: "Internetni tezlashtirish uchun", en: "To speed up the internet" },
      { uz: "Parollarni saqlash uchun", en: "To store passwords" },
      { uz: "Kerak emas", en: "It isn’t needed" },
    ],
    explain: {
      uz: "Soatlar farq qilsa, xronologiya buziladi.",
      en: "If the clocks drift, the timeline falls apart.",
    },
  },
];

export const RESPONSE_POOL: PoolItem[] = [
  {
    ask: {
      uz: "NIST SP 800-61 bo‘yicha birinchi bosqich?",
      en: "The first phase in NIST SP 800-61?",
    },
    right: { uz: "Tayyorgarlik", en: "Preparation" },
    wrong: [
      { uz: "Cheklash", en: "Containment" },
      { uz: "Saboqlar", en: "Lessons learned" },
      { uz: "Tiklash", en: "Recovery" },
    ],
    explain: {
      uz: "Reja, aloqa ro‘yxati va loglash — hodisadan oldin.",
      en: "The plan, contact list and logging come before any incident.",
    },
  },
  {
    ask: {
      uz: "Javob rejasi qachon yoziladi?",
      en: "When is the response plan written?",
    },
    right: { uz: "Hodisadan oldin", en: "Before any incident" },
    wrong: [
      { uz: "Hodisa paytida", en: "During the incident" },
      { uz: "Hodisadan keyin", en: "After the incident" },
      { uz: "Hech qachon", en: "Never" },
    ],
    explain: {
      uz: "Hodisa paytida reja yozishga vaqt yo‘q.",
      en: "There is no time for it mid-incident.",
    },
  },
  {
    ask: {
      uz: "Jiddiylikni nima belgilaydi?",
      en: "What sets an incident’s severity?",
    },
    right: {
      uz: "Ta’sir va shoshilinchlik",
      en: "Impact and urgency",
    },
    wrong: [
      { uz: "Xabar kelgan vaqt", en: "When the report came in" },
      { uz: "Xabar bergan odam", en: "Who reported it" },
      { uz: "Server nomi", en: "The server’s name" },
    ],
    explain: {
      uz: "Navbat kelgan tartibda emas, jiddiylik bo‘yicha.",
      en: "By severity, not the order reports arrive.",
    },
  },
  {
    ask: {
      uz: "Tarqalayotgan ransomware’ga birinchi harakat?",
      en: "The first move against spreading ransomware?",
    },
    right: {
      uz: "Zararlangan xostlarni tarmoqdan uzish",
      en: "Cut infected hosts off the network",
    },
    wrong: [
      { uz: "Hamma kompyuterni o‘chirish", en: "Power off every computer" },
      { uz: "To‘lovni to‘lash", en: "Pay the ransom" },
      { uz: "Hech narsa qilmaslik", en: "Do nothing" },
    ],
    explain: {
      uz: "Uzish tarqalishni to‘xtatadi, xotira saqlanadi.",
      en: "Isolating stops the spread and keeps memory intact.",
    },
  },
  {
    ask: {
      uz: "Nega hamma kompyuterni o‘chirish yomon?",
      en: "Why is powering off every computer a bad move?",
    },
    right: {
      uz: "RAM’dagi dalillar yo‘qoladi va kompaniya to‘xtaydi",
      en: "Memory evidence is lost and the company stops",
    },
    wrong: [
      { uz: "Elektr ko‘p sarflanadi", en: "It uses a lot of power" },
      { uz: "Yomon emas", en: "It isn’t" },
      { uz: "Disklar shifrlanadi", en: "The disks get encrypted" },
    ],
    explain: {
      uz: "Kerakli joydagina uzish — maqsadli cheklash.",
      en: "Isolate only where needed — targeted containment.",
    },
  },
  {
    ask: {
      uz: "Hodisani kompaniya chatida muhokama qilish xavfi?",
      en: "The risk of discussing the incident in company chat?",
    },
    right: {
      uz: "Hujumchi buzilgan hisob orqali o‘qiydi",
      en: "The attacker reads it through a hacked account",
    },
    wrong: [
      { uz: "Chat sekinlashadi", en: "The chat slows down" },
      { uz: "Xavf yo‘q", en: "There is none" },
      { uz: "Xabarlar o‘chadi", en: "Messages get deleted" },
    ],
    explain: {
      uz: "Tashqi kanal (telefon, alohida messenjer) ishlating.",
      en: "Use an out-of-band channel (phone, a separate messenger).",
    },
  },
  {
    ask: {
      uz: "Zararlangan mashinalarni darhol qayta o‘rnatsangiz?",
      en: "What if you reinstall infected machines straight away?",
    },
    right: {
      uz: "Hujumchi qanday kirganini bilib bo‘lmaydi",
      en: "Nobody can learn how the attacker got in",
    },
    wrong: [
      { uz: "Hammasi hal bo‘ladi", en: "Everything is solved" },
      { uz: "Dalil ko‘payadi", en: "There is more evidence" },
      { uz: "Hujumchi qaytmaydi", en: "The attacker won’t return" },
    ],
    explain: {
      uz: "Avval dalil va ildiz sabab, keyin tozalash.",
      en: "Evidence and root cause first, clean-up after.",
    },
  },
  {
    ask: {
      uz: "Hujum 1-oktabrda boshlangan. Qaysi zaxiradan tiklash kerak?",
      en: "The attack began on 1 October. Which backup to restore?",
    },
    right: {
      uz: "1-oktabrdan oldingi, tekshirilgan nusxadan",
      en: "A checked copy from before 1 October",
    },
    wrong: [
      { uz: "Eng oxirgisidan", en: "The latest one" },
      { uz: "Istalganidan", en: "Any of them" },
      { uz: "Zaxira kerak emas", en: "No backup needed" },
    ],
    explain: {
      uz: "Keyingilarida hujumchi izlari bo‘lishi mumkin.",
      en: "Later ones may carry the attacker’s traces.",
    },
  },
  {
    ask: {
      uz: "Tiklashdan keyin nima shart?",
      en: "What is a must after recovery?",
    },
    right: {
      uz: "Parollarni almashtirish va kirish yo‘lini yopish",
      en: "Changing passwords and closing the way in",
    },
    wrong: [
      { uz: "Firewall’ni o‘chirish", en: "Turning off the firewall" },
      { uz: "Loglarni o‘chirish", en: "Deleting the logs" },
      { uz: "Hech narsa", en: "Nothing" },
    ],
    explain: {
      uz: "Aks holda hujumchi o‘sha yo‘l bilan qaytadi.",
      en: "Otherwise the attacker comes back the same way.",
    },
  },
  {
    ask: {
      uz: "Dwell time nima?",
      en: "What is dwell time?",
    },
    right: {
      uz: "Hujum boshlanishidan aniqlanishigacha o‘tgan vaqt",
      en: "The time from the attack starting to its detection",
    },
    wrong: [
      { uz: "Tiklash vaqti", en: "The time to recover" },
      { uz: "Yig‘ilish davomiyligi", en: "The meeting’s length" },
      { uz: "Zaxira hajmi", en: "The backup’s size" },
    ],
    explain: {
      uz: "Qisqa dwell time — yaxshi aniqlash belgisi.",
      en: "A short dwell time is a sign of good detection.",
    },
  },
  {
    ask: {
      uz: "Hodisa kartasida nima bo‘lishi kerak?",
      en: "What belongs on an incident ticket?",
    },
    right: {
      uz: "Raqam, jiddiylik, vaqt, qamrov, harakatlar, mas’ul",
      en: "ID, severity, time, scope, actions, owner",
    },
    wrong: [
      { uz: "Faqat sarlavha", en: "Just a title" },
      { uz: "Faqat aybdor ismi", en: "Just the culprit’s name" },
      {
        uz: "Hech narsa, og‘zaki yetarli",
        en: "Nothing, word of mouth will do",
      },
    ],
    explain: {
      uz: "Karta — jamoaning umumiy xotirasi.",
      en: "The ticket is the team’s shared memory.",
    },
  },
  {
    ask: {
      uz: "Shaxsiy ma’lumotlar sizgani tasdiqlansa?",
      en: "A personal data leak is confirmed. Then?",
    },
    right: {
      uz: "Yuristlar bilan nazorat organi va jabrlanganlarga muddatida xabar berish",
      en: "With the lawyers, tell the regulator and those affected within the deadline",
    },
    wrong: [
      { uz: "Hech kimga aytmaslik", en: "Tell nobody" },
      { uz: "Faqat IT bo‘limiga", en: "Only the IT team" },
      { uz: "Faqat ijtimoiy tarmoqqa", en: "Only social media" },
    ],
    explain: {
      uz: "Yashirish javobgarlikni oshiradi.",
      en: "Hiding it adds liability.",
    },
  },
  {
    ask: {
      uz: "Jurnalistlar bilan kim gaplashadi?",
      en: "Who talks to journalists?",
    },
    right: {
      uz: "Oldindan tayinlangan vakil",
      en: "A spokesperson appointed in advance",
    },
    wrong: [
      { uz: "Istalgan xodim", en: "Any employee" },
      { uz: "IR jamoasi a’zolari", en: "Members of the IR team" },
      { uz: "Hech kim, hech qachon", en: "Nobody, ever" },
    ],
    explain: {
      uz: "Bitta aniq va izchil xabar.",
      en: "One clear and consistent message.",
    },
  },
  {
    ask: {
      uz: "Blameless saboqlar yig‘ilishining maqsadi?",
      en: "The point of a blameless lessons-learned meeting?",
    },
    right: {
      uz: "Tizimni yaxshilash, mas’ul va muddat bilan",
      en: "Fixing the system, with owners and dates",
    },
    wrong: [
      { uz: "Aybdorni topish", en: "Finding the culprit" },
      { uz: "Hisobotni uzaytirish", en: "Making the report longer" },
      { uz: "Hech narsa", en: "Nothing" },
    ],
    explain: {
      uz: "Odamlar xatolarni yashirmasa, tizim tezroq yaxshilanadi.",
      en: "When people don’t hide mistakes, things improve faster.",
    },
  },
  {
    ask: {
      uz: "Fishing havolasini bosgan xodimni ishdan bo‘shatish — qanday yondashuv?",
      en: "Firing the employee who clicked a phishing link — what kind of approach?",
    },
    right: {
      uz: "Zararli: odamlar keyingi safar xatoni yashiradi",
      en: "Harmful: next time people will hide their mistakes",
    },
    wrong: [
      { uz: "To‘g‘ri va samarali", en: "Right and effective" },
      { uz: "Majburiy talab", en: "A required step" },
      { uz: "Blameless yondashuv", en: "The blameless approach" },
    ],
    explain: {
      uz: "Savol — tizim nega bu xatoga yo‘l qo‘ydi?",
      en: "The question is why the system let it happen.",
    },
  },
];

export const REPORT_POOL: PoolItem[] = [
  {
    ask: {
      uz: "Rahbar hisobotning qaysi qismini o‘qiydi?",
      en: "Which part of the report does a manager read?",
    },
    right: { uz: "Qisqacha xulosa", en: "The executive summary" },
    wrong: [
      { uz: "Ilovalar", en: "The appendices" },
      { uz: "To‘liq loglar", en: "The full logs" },
      { uz: "Xeshlar ro‘yxati", en: "The list of hashes" },
    ],
    explain: {
      uz: "Ko‘pincha faqat birinchi sahifani.",
      en: "Often only the first page.",
    },
  },
  {
    ask: {
      uz: "Qisqacha xulosa qachon yoziladi?",
      en: "When is the executive summary written?",
    },
    right: { uz: "Oxirida", en: "Last" },
    wrong: [
      { uz: "Birinchi", en: "First" },
      { uz: "Tahlildan oldin", en: "Before the analysis" },
      { uz: "Yozilmaydi", en: "It isn’t" },
    ],
    explain: {
      uz: "Xulosa uchun topilmalar kerak.",
      en: "A summary needs the findings first.",
    },
  },
  {
    ask: {
      uz: "Qisqacha xulosada nima bo‘lishi kerak?",
      en: "What belongs in the executive summary?",
    },
    right: {
      uz: "Nima bo‘ldi, ta’siri, holat va rahbariyatdan nima kerak",
      en: "What happened, the impact, the status and what management must do",
    },
    wrong: [
      { uz: "To‘liq buyruqlar ro‘yxati", en: "The full list of commands" },
      { uz: "Barcha IP manzillar", en: "Every IP address" },
      { uz: "Faqat texnik jargon", en: "Technical jargon only" },
    ],
    explain: {
      uz: "Qisqa, aniq, jargonsiz.",
      en: "Short, clear, no jargon.",
    },
  },
  {
    ask: {
      uz: "Qamrov bo‘limi nima uchun “nima tekshirilmadi”ni ham yozadi?",
      en: "Why does the scope section also say what was not examined?",
    },
    right: {
      uz: "Keyingi bahs va noto‘g‘ri xulosalarning oldini olish uchun",
      en: "To head off arguments and wrong conclusions later",
    },
    wrong: [
      { uz: "Hisobotni uzaytirish uchun", en: "To make the report longer" },
      { uz: "Shart emas", en: "It needn’t" },
      { uz: "Mijozni qo‘rqitish uchun", en: "To scare the client" },
    ],
    explain: {
      uz: "O‘quvchi hisobot chegarasini biladi.",
      en: "The reader knows the report’s limits.",
    },
  },
  {
    ask: {
      uz: "Yaxshi topilmaning qismlari?",
      en: "The parts of a good finding?",
    },
    right: {
      uz: "Nima (UTC vaqt), dalil, ta’sir, tavsiya",
      en: "What (with UTC time), evidence, impact, recommendation",
    },
    wrong: [
      { uz: "Faqat sarlavha", en: "Just a title" },
      { uz: "Taxmin va parol", en: "A guess and a password" },
      { uz: "Faqat skrinshot", en: "Just a screenshot" },
    ],
    explain: {
      uz: "O‘quvchi har bir da’voni tekshira oladi.",
      en: "The reader can check every claim.",
    },
  },
  {
    ask: {
      uz: "Topilmaga topilgan parolni yozish kerakmi?",
      en: "Should a password you found go into a finding?",
    },
    right: {
      uz: "Yo‘q — yashiriladi (redact)",
      en: "No — it is redacted",
    },
    wrong: [
      { uz: "Ha, to‘liq", en: "Yes, in full" },
      { uz: "Ha, qalin harf bilan", en: "Yes, in bold" },
      { uz: "Faqat ilovada", en: "Only in an appendix" },
    ],
    explain: {
      uz: "Hisobot ko‘p qo‘ldan o‘tadi.",
      en: "A report passes through many hands.",
    },
  },
  {
    ask: {
      uz: "“Hujumchi juda tajribali bo‘lsa kerak” — bu?",
      en: "“The attacker must be very experienced” — this is?",
    },
    right: { uz: "Fikr, fakt emas", en: "An opinion, not a fact" },
    wrong: [
      { uz: "Tasdiqlangan fakt", en: "A confirmed fact" },
      { uz: "Dalil", en: "Evidence" },
      { uz: "Tavsiya", en: "A recommendation" },
    ],
    explain: {
      uz: "Dalilga havola yo‘q.",
      en: "It points to no evidence.",
    },
  },
  {
    ask: {
      uz: "IP manzil nimani ko‘rsatadi?",
      en: "What does an IP address point to?",
    },
    right: {
      uz: "Qurilmani — odamni emas",
      en: "A device — not a person",
    },
    wrong: [
      { uz: "Hujumchining uyini", en: "The attacker’s home" },
      { uz: "Hujumchining ismini", en: "The attacker’s name" },
      { uz: "Mamlakat hukumatini", en: "A government" },
    ],
    explain: {
      uz: "U VPN yoki buzilgan kompyuter bo‘lishi mumkin.",
      en: "It may be a VPN or a hacked computer.",
    },
  },
  {
    ask: {
      uz: "Dalillarga qanday havola qilinadi?",
      en: "How is evidence referred to?",
    },
    right: {
      uz: "Raqam bilan (E-03), ilovada xeshi bilan",
      en: "By number (E-03), listed with its hash in an appendix",
    },
    wrong: [
      { uz: "“Biror joyda bor”", en: "“It’s somewhere”" },
      { uz: "Havola kerak emas", en: "No reference needed" },
      { uz: "Faqat og‘zaki", en: "Only by word of mouth" },
    ],
    explain: {
      uz: "Har bir da’vo tekshiriladigan bo‘ladi.",
      en: "Every claim becomes checkable.",
    },
  },
  {
    ask: {
      uz: "Qaysi biri bajarsa bo‘ladigan tavsiya?",
      en: "Which recommendation is actionable?",
    },
    right: {
      uz: "“VPN’ga MFA — IT, 15-noyabrgacha”",
      en: "“MFA on the VPN — IT, by 15 November”",
    },
    wrong: [
      { uz: "“Xavfsizlikni yaxshilash”", en: "“Improve security”" },
      { uz: "“Ehtiyot bo‘lish”", en: "“Be careful”" },
      { uz: "“Yaxshiroq firewall”", en: "“A better firewall”" },
    ],
    explain: {
      uz: "Nima, kim va qachongacha.",
      en: "What, who and by when.",
    },
  },
  {
    ask: {
      uz: "Hisobot bo‘limlarining to‘g‘ri tartibi?",
      en: "The right order of a report’s sections?",
    },
    right: {
      uz: "Xulosa, qamrov, xronologiya, topilmalar, tavsiyalar, ilovalar",
      en: "Summary, scope, timeline, findings, recommendations, appendices",
    },
    wrong: [
      {
        uz: "Ilovalar, topilmalar, xulosa",
        en: "Appendices, findings, summary",
      },
      {
        uz: "Tavsiyalar, ilovalar, qamrov",
        en: "Recommendations, appendices, scope",
      },
      { uz: "Tartib muhim emas", en: "Order doesn’t matter" },
    ],
    explain: {
      uz: "Eng muhimi — tepada.",
      en: "The most important goes on top.",
    },
  },
  {
    ask: {
      uz: "TLP:RED belgisi nimani bildiradi?",
      en: "What does a TLP:RED label mean?",
    },
    right: {
      uz: "Faqat qabul qiluvchining o‘zi uchun",
      en: "For the named recipients only",
    },
    wrong: [
      { uz: "Hamma bilan ulashish mumkin", en: "It may be shared with anyone" },
      { uz: "Hujjat muhim emas", en: "The document doesn’t matter" },
      { uz: "Faqat jurnalistlar uchun", en: "Only for journalists" },
    ],
    explain: {
      uz: "AMBER — tashkilot ichida, GREEN — hamjamiyat, CLEAR — hamma.",
      en: "AMBER is the organisation, GREEN the community, CLEAR anyone.",
    },
  },
  {
    ask: {
      uz: "Hisobotni qanday yuborish kerak?",
      en: "How should the report be sent?",
    },
    right: {
      uz: "Shifrlangan holda, faqat kerakli odamlarga",
      en: "Encrypted, only to those who need it",
    },
    wrong: [
      { uz: "Ochiq havola bilan", en: "Through a public link" },
      { uz: "Umumiy chatga", en: "To the general chat" },
      { uz: "Ijtimoiy tarmoqqa", en: "On social media" },
    ],
    explain: {
      uz: "Hisobot hujumchi uchun ham yo‘l xaritasi.",
      en: "A report is also a road map for an attacker.",
    },
  },
  {
    ask: {
      uz: "Xronologiyadagi vaqtlar qaysi zonada yoziladi?",
      en: "Which time zone does the report’s timeline use?",
    },
    right: same("UTC"),
    wrong: [
      { uz: "Har bir manbaning o‘z zonasida", en: "Each source’s own zone" },
      { uz: "Tahlilchining mahalliy vaqtida", en: "The analyst’s local time" },
      { uz: "Zonasiz", en: "No zone at all" },
    ],
    explain: {
      uz: "Bitta zona — chalkashlik yo‘q.",
      en: "One zone, no confusion.",
    },
  },
  {
    ask: {
      uz: "Hisobot versiyalari bilan nima qilinadi?",
      en: "What is done about versions of the report?",
    },
    right: {
      uz: "Raqamlanadi va o‘zgarishlar jurnali yuritiladi",
      en: "They are numbered and a change log is kept",
    },
    wrong: [
      { uz: "Eski versiyalar yashiriladi", en: "Old versions are hidden" },
      { uz: "Hech narsa", en: "Nothing" },
      { uz: "Har safar yangi nom", en: "A new name each time" },
    ],
    explain: {
      uz: "Kim, qachon va nimani o‘zgartirgani ma’lum bo‘ladi.",
      en: "Who changed what, and when, stays clear.",
    },
  },
];

export const STEGO_POOL: PoolItem[] = [
  {
    ask: {
      uz: "Steganografiya nimani yashiradi?",
      en: "What does steganography hide?",
    },
    right: {
      uz: "Xabar borligining o‘zini",
      en: "The fact that a message exists",
    },
    wrong: [
      { uz: "Faqat xabar mazmunini", en: "Only what the message says" },
      { uz: "Jo‘natuvchining IP’sini", en: "The sender’s IP" },
      { uz: "Hech narsani", en: "Nothing" },
    ],
    explain: {
      uz: "Shifrlash mazmunni yashiradi; stego — borligini.",
      en: "Encryption hides the content; stego hides its existence.",
    },
  },
  {
    ask: {
      uz: "Cover nima?",
      en: "What is the cover?",
    },
    right: {
      uz: "Xabar yashiriladigan oddiy fayl",
      en: "The ordinary file the message is hidden in",
    },
    wrong: [
      { uz: "Yashirin xabarning o‘zi", en: "The hidden message itself" },
      { uz: "Parol", en: "The passphrase" },
      { uz: "Shifr algoritmi", en: "The cipher" },
    ],
    explain: {
      uz: "Payload — xabar; stego-ob’ekt — xabarli fayl.",
      en: "The payload is the message; the stego object is the file carrying it.",
    },
  },
  {
    ask: {
      uz: "Payload nima?",
      en: "What is the payload?",
    },
    right: { uz: "Yashirin xabar", en: "The hidden message" },
    wrong: [
      { uz: "Cover rasm", en: "The cover picture" },
      { uz: "Fayl nomi", en: "The file name" },
      { uz: "Fayl hajmi", en: "The file size" },
    ],
    explain: {
      uz: "Uni yashirishdan oldin shifrlash yaxshi.",
      en: "Encrypting it before hiding is wise.",
    },
  },
  {
    ask: {
      uz: "Akrostixda xabar qayerda?",
      en: "Where is the message in an acrostic?",
    },
    right: {
      uz: "Har bir qatorning birinchi harfida",
      en: "In the first letter of each line",
    },
    wrong: [
      { uz: "Oxirgi qatorda", en: "In the last line" },
      { uz: "She’r sarlavhasida", en: "In the title" },
      { uz: "Muallif ismida", en: "In the author’s name" },
    ],
    explain: {
      uz: "Eng qadimgi matn usullaridan biri.",
      en: "One of the oldest text methods.",
    },
  },
  {
    ask: {
      uz: "Zero-width space (U+200B) ekranda qanday ko‘rinadi?",
      en: "How does a zero-width space (U+200B) look on screen?",
    },
    right: { uz: "Umuman ko‘rinmaydi", en: "It doesn’t show at all" },
    wrong: [
      { uz: "Bo‘sh joy kabi", en: "Like a space" },
      { uz: "Nuqta kabi", en: "Like a dot" },
      { uz: "Qizil belgi", en: "As a red mark" },
    ],
    explain: {
      uz: "Shuning uchun u bit sifatida yashirishga qulay.",
      en: "Which is why it works as a hidden bit.",
    },
  },
  {
    ask: {
      uz: "5 belgilik sir zero-width bitlarida necha belgi bo‘ladi?",
      en: "How many zero-width characters does a five-character secret take?",
    },
    right: same("40"),
    wrong: [same("5"), same("8"), same("16")],
    explain: {
      uz: "Har bir belgi 8 bit.",
      en: "Each character is 8 bits.",
    },
  },
  {
    ask: {
      uz: "Zero-width yashirishni nima fosh qiladi?",
      en: "What gives zero-width hiding away?",
    },
    right: {
      uz: "Matn uzunligi ko‘rinadiganidan katta",
      en: "The text is longer than it looks",
    },
    wrong: [
      { uz: "Shrift rangi", en: "The font colour" },
      { uz: "Xabar vaqti", en: "The message time" },
      { uz: "Hech narsa", en: "Nothing" },
    ],
    explain: {
      uz: "Belgilarni sanash yetarli.",
      en: "Counting the characters is enough.",
    },
  },
  {
    ask: {
      uz: "steghide’da -ef nima?",
      en: "What is -ef in steghide?",
    },
    right: {
      uz: "Yashiriladigan fayl (payload)",
      en: "The file to hide (the payload)",
    },
    wrong: [
      { uz: "Cover fayl", en: "The cover file" },
      { uz: "Parol", en: "The passphrase" },
      { uz: "Natija papkasi", en: "The output folder" },
    ],
    explain: {
      uz: "-cf — cover, -p — parol.",
      en: "-cf is the cover, -p the passphrase.",
    },
  },
  {
    ask: {
      uz: "steghide embed cover faylni qanday o‘zgartiradi?",
      en: "How does steghide embed change the cover file?",
    },
    right: {
      uz: "Joyida — asl nusxa yo‘qoladi",
      en: "In place — the original is lost",
    },
    wrong: [
      { uz: "Umuman o‘zgartirmaydi", en: "It doesn’t change it" },
      { uz: "Yangi nom bilan nusxa yaratadi", en: "It makes a renamed copy" },
      { uz: "Faylni o‘chiradi", en: "It deletes the file" },
    ],
    explain: {
      uz: "Asl nusxani oldindan saqlang.",
      en: "Keep a copy of the original first.",
    },
  },
  {
    ask: {
      uz: "Qaysi biri steganografiyaning qonuniy qo‘llanishi?",
      en: "Which is a legitimate use of steganography?",
    },
    right: { uz: "Mualliflik suv belgisi", en: "A copyright watermark" },
    wrong: [
      { uz: "Zararli dastur buyruqlari", en: "Malware commands" },
      { uz: "Ma’lumot o‘g‘irlash", en: "Data theft" },
      { uz: "Fishing skripti", en: "A phishing script" },
    ],
    explain: {
      uz: "Printer nuqtalari ham qonuniy misol.",
      en: "Printer tracking dots are another legitimate example.",
    },
  },
  {
    ask: {
      uz: "Zararli dasturlar stegodan qanday foydalanadi?",
      en: "How does malware use steganography?",
    },
    right: {
      uz: "Buyruqlarni yoki o‘g‘irlangan ma’lumotni rasmlarda tashiydi",
      en: "It carries commands or stolen data inside pictures",
    },
    wrong: [
      { uz: "Antivirusni yangilaydi", en: "It updates antivirus" },
      { uz: "Hech qanday", en: "It doesn’t" },
      { uz: "Faqat matn yozadi", en: "It only writes text" },
    ],
    explain: {
      uz: "Oddiy rasm trafigi shubha uyg‘otmaydi.",
      en: "Ordinary picture traffic raises no suspicion.",
    },
  },
  {
    ask: {
      uz: "Kerkhoffs tamoyiliga ko‘ra stego xavfsizligi nimaga tayanadi?",
      en: "By Kerckhoffs’s principle, what does stego security rest on?",
    },
    right: { uz: "Faqat kalitga", en: "The key alone" },
    wrong: [
      { uz: "Usul siriga", en: "A secret method" },
      { uz: "Fayl nomiga", en: "The file name" },
      { uz: "Fayl formatiga", en: "The file format" },
    ],
    explain: {
      uz: "Usul ma’lum deb hisoblang.",
      en: "Assume the method is known.",
    },
  },
  {
    ask: {
      uz: "2 MB payload uchun qaysi cover yaxshiroq?",
      en: "Which cover suits a 2 MB payload better?",
    },
    right: { uz: "40 MB video", en: "A 40 MB video" },
    wrong: [
      { uz: "16×16 ikonka", en: "A 16×16 icon" },
      { uz: "Bir qatorli SMS", en: "A one-line text" },
      { uz: "1 KB matn fayli", en: "A 1 KB text file" },
    ],
    explain: {
      uz: "Katta coverda o‘zgarish ulushi kichik.",
      en: "In a big cover the change is a smaller share.",
    },
  },
  {
    ask: {
      uz: "Payloadni yashirishdan oldin shifrlash nima beradi?",
      en: "What does encrypting the payload before hiding give?",
    },
    right: {
      uz: "Topilsa ham kalitsiz o‘qib bo‘lmaydi",
      en: "Even if found, it can’t be read without the key",
    },
    wrong: [
      { uz: "Fayl kichrayadi", en: "The file shrinks" },
      { uz: "Yashirish shart emas bo‘ladi", en: "Hiding becomes unnecessary" },
      { uz: "Hech narsa", en: "Nothing" },
    ],
    explain: {
      uz: "Ikki qatlamli himoya.",
      en: "Two layers of protection.",
    },
  },
  {
    ask: {
      uz: "Yashirilgan ma’lumotning belgilaridan biri?",
      en: "One sign of hidden data?",
    },
    right: {
      uz: "Fayl hajmi kutilganidan katta",
      en: "The file is bigger than expected",
    },
    wrong: [
      { uz: "Fayl nomi qisqa", en: "A short file name" },
      { uz: "Rasm rangli", en: "The picture is in colour" },
      { uz: "Fayl yangi", en: "The file is new" },
    ],
    explain: {
      uz: "Asl nusxa bilan solishtirish ham yordam beradi.",
      en: "Comparing with the original helps too.",
    },
  },
];

export const LSB_POOL: PoolItem[] = [
  {
    ask: {
      uz: "Bitta rang kanali necha bit?",
      en: "How many bits is one colour channel?",
    },
    right: same("8"),
    wrong: [same("1"), same("3"), same("24")],
    explain: {
      uz: "0 dan 255 gacha — 8 bit.",
      en: "0 to 255 is 8 bits.",
    },
  },
  {
    ask: {
      uz: "LSB nima?",
      en: "What is the LSB?",
    },
    right: {
      uz: "Eng kichik bit — qiymati 1",
      en: "The least significant bit — worth 1",
    },
    wrong: [
      { uz: "Eng katta bit — 128", en: "The most significant bit — 128" },
      { uz: "Rasm formati", en: "A picture format" },
      { uz: "Kanal nomi", en: "A channel name" },
    ],
    explain: {
      uz: "Uni o‘zgartirish ko‘zga ko‘rinmaydi.",
      en: "Flipping it can’t be seen.",
    },
  },
  {
    ask: {
      uz: "Qaysi bitni o‘zgartirish rangni eng ko‘p o‘zgartiradi?",
      en: "Which bit changes the colour most when flipped?",
    },
    right: { uz: "7-bit (MSB)", en: "Bit 7 (the MSB)" },
    wrong: [
      { uz: "0-bit (LSB)", en: "Bit 0 (the LSB)" },
      { uz: "1-bit", en: "Bit 1" },
      { uz: "Hammasi bir xil", en: "They are all the same" },
    ],
    explain: {
      uz: "U 128 qadamga teng.",
      en: "It is worth 128 steps.",
    },
  },
  {
    ask: {
      uz: "200 ning LSB’i o‘zgartirilsa?",
      en: "Flip the LSB of 200 and you get?",
    },
    right: same("201"),
    wrong: [same("72"), same("199"), same("100")],
    explain: {
      uz: "11001000 → 11001001.",
      en: "11001000 → 11001001.",
    },
  },
  {
    ask: {
      uz: "Ko‘z qaysi rangga eng kam sezgir?",
      en: "Which colour is the eye least sensitive to?",
    },
    right: { uz: "Ko‘k", en: "Blue" },
    wrong: [
      { uz: "Yashil", en: "Green" },
      { uz: "Qizil", en: "Red" },
      { uz: "Hammasiga bir xil", en: "All the same" },
    ],
    explain: {
      uz: "Shuning uchun ko‘k kanal yashirish uchun qulay.",
      en: "Which makes the blue channel handy for hiding.",
    },
  },
  {
    ask: {
      uz: "Bitta harf (ASCII) uchun nechta piksel kerak (har pikselga 1 bit)?",
      en: "How many pixels does one ASCII letter take at 1 bit per pixel?",
    },
    right: same("8"),
    wrong: [same("1"), same("3"), same("24")],
    explain: {
      uz: "Bitta belgi — 8 bit.",
      en: "One character is 8 bits.",
    },
  },
  {
    ask: {
      uz: "01001000 qaysi ASCII belgi?",
      en: "Which ASCII character is 01001000?",
    },
    right: same("H"),
    wrong: [same("A"), same("Z"), same("h")],
    explain: {
      uz: "01001000 = 72 = H.",
      en: "01001000 is 72, which is H.",
    },
  },
  {
    ask: {
      uz: "100×100 rasm, RGB, har kanalga 1 bit — necha bayt?",
      en: "A 100×100 RGB picture, 1 bit per channel — how many bytes?",
    },
    right: same("3 750"),
    wrong: [same("10 000"), same("30 000"), same("1 250")],
    explain: {
      uz: "100 × 100 × 3 ÷ 8.",
      en: "100 × 100 × 3 ÷ 8.",
    },
  },
  {
    ask: {
      uz: "Ikki LSB ishlatishning kamchiligi?",
      en: "The drawback of using two LSBs?",
    },
    right: {
      uz: "Rang ko‘proq o‘zgaradi, aniqlash osonlashadi",
      en: "Colours shift more and detection gets easier",
    },
    wrong: [
      { uz: "Sig‘im kamayadi", en: "Capacity drops" },
      { uz: "Kamchiligi yo‘q", en: "There is none" },
      { uz: "Rasm o‘chadi", en: "The picture is erased" },
    ],
    explain: {
      uz: "Sig‘im va yashirinlik — muvozanat.",
      en: "Capacity and stealth trade off.",
    },
  },
  {
    ask: {
      uz: "Bit tekisligi nima?",
      en: "What is a bit plane?",
    },
    right: {
      uz: "Bitta kanalning bitta biti, oq-qora ko‘rinishda",
      en: "One bit of one channel, shown in black and white",
    },
    wrong: [
      { uz: "Rasmning nusxasi", en: "A copy of the picture" },
      { uz: "Fayl formati", en: "A file format" },
      { uz: "Rang palitrasi", en: "A colour palette" },
    ],
    explain: {
      uz: "stegsolve aynan shuni ko‘rsatadi.",
      en: "That is what stegsolve shows.",
    },
  },
  {
    ask: {
      uz: "Tabiiy rasmning 0-bit tekisligi odatda qanday ko‘rinadi?",
      en: "What does a natural picture’s bit-0 plane usually look like?",
    },
    right: { uz: "Shovqin kabi", en: "Like noise" },
    wrong: [
      { uz: "Aniq harflar", en: "Clear letters" },
      { uz: "Butunlay oq", en: "All white" },
      { uz: "Asl rasm kabi", en: "Like the original" },
    ],
    explain: {
      uz: "Shakl yoki harf ko‘rinsa — shubhali.",
      en: "Shapes or letters there are suspicious.",
    },
  },
  {
    ask: {
      uz: "Qaysi format LSB xabarini saqlaydi?",
      en: "Which format keeps an LSB message?",
    },
    right: same("PNG"),
    wrong: [same("JPEG"), same("WebP (lossy)"), same("GIF (resized)")],
    explain: {
      uz: "PNG lossless.",
      en: "PNG is lossless.",
    },
  },
  {
    ask: {
      uz: "LSB xabarli rasm ijtimoiy tarmoqqa yuklansa?",
      en: "What happens when an LSB picture is uploaded to a social network?",
    },
    right: {
      uz: "Qayta siqiladi va xabar yo‘qoladi",
      en: "It is recompressed and the message is lost",
    },
    wrong: [
      { uz: "Xabar saqlanadi", en: "The message survives" },
      { uz: "Xabar shifrlanadi", en: "The message gets encrypted" },
      { uz: "Hech narsa", en: "Nothing" },
    ],
    explain: {
      uz: "Lossy siqish LSB’larni o‘zgartiradi.",
      en: "Lossy compression changes the LSBs.",
    },
  },
  {
    ask: {
      uz: "LSB yashirishni statistik aniqlash nimaga asoslanadi?",
      en: "What does statistical LSB detection rely on?",
    },
    right: {
      uz: "2k va 2k+1 qiymatlar juftliklari tenglashadi",
      en: "Pairs of values 2k and 2k+1 even out",
    },
    wrong: [
      { uz: "Fayl nomi", en: "The file name" },
      { uz: "Rasm o‘lchami", en: "The picture size" },
      { uz: "Rang nomi", en: "A colour’s name" },
    ],
    explain: {
      uz: "Chi-kvadrat testi shuni o‘lchaydi.",
      en: "The chi-square test measures that.",
    },
  },
  {
    ask: {
      uz: "Asl rasm topilsa, eng oson tekshiruv?",
      en: "If the original is found, the easiest check?",
    },
    right: {
      uz: "Piksel-ma-piksel solishtirish",
      en: "Comparing pixel by pixel",
    },
    wrong: [
      { uz: "Diqqat bilan qarash", en: "Looking closely" },
      { uz: "Fayl nomini solishtirish", en: "Comparing file names" },
      { uz: "Tekshirib bo‘lmaydi", en: "It can’t be checked" },
    ],
    explain: {
      uz: "Farq qilgan piksellar — yashirilgan joy.",
      en: "The pixels that differ are the hiding place.",
    },
  },
];

export const METADATA_POOL: PoolItem[] = [
  {
    ask: { uz: "Metama’lumot nima?", en: "What is metadata?" },
    right: { uz: "Fayl haqidagi ma’lumot", en: "Data about the file" },
    wrong: [
      { uz: "Faylning mazmuni", en: "The file’s content" },
      { uz: "Fayl nomi xolos", en: "Only the file name" },
      { uz: "Shifrlash kaliti", en: "An encryption key" },
    ],
    explain: {
      uz: "U fayl ichida, ko‘zga ko‘rinmas joyda.",
      en: "It sits inside the file, out of sight.",
    },
  },
  {
    ask: {
      uz: "Qaysi EXIF maydoni joylashuvni oshkor qiladi?",
      en: "Which EXIF field gives away location?",
    },
    right: same("GPS Latitude / Longitude"),
    wrong: [same("Image Width"), same("Color Space"), same("Orientation")],
    explain: {
      uz: "Koordinatalar xaritada joyni ko‘rsatadi.",
      en: "Coordinates point to a place on a map.",
    },
  },
  {
    ask: {
      uz: "39° 30′ 0″ o‘nlik graduslarda?",
      en: "39° 30′ 0″ in decimal degrees?",
    },
    right: same("39.5"),
    wrong: [same("39.30"), same("3930"), same("39.03")],
    explain: { uz: "39 + 30/60 = 39.5.", en: "39 + 30/60 = 39.5." },
  },
  {
    ask: {
      uz: "DMS’ni o‘nlikka aylantirish formulasi?",
      en: "The formula for DMS to decimal?",
    },
    right: same("deg + min/60 + sec/3600"),
    wrong: [
      same("deg + min + sec"),
      same("deg × min × sec"),
      same("deg + min/100 + sec/10000"),
    ],
    explain: {
      uz: "Bir gradusda 60 daqiqa, bir daqiqada 60 soniya.",
      en: "A degree has 60 minutes, a minute 60 seconds.",
    },
  },
  {
    ask: {
      uz: "Kamera seriya raqami nega shaxsiy?",
      en: "Why is a camera serial number personal?",
    },
    right: {
      uz: "U bir odamning turli rasmlarini bog‘laydi",
      en: "It ties different photos to one person",
    },
    wrong: [
      { uz: "U parolni saqlaydi", en: "It stores a password" },
      { uz: "Shaxsiy emas", en: "It isn’t" },
      { uz: "U GPS’ni saqlaydi", en: "It stores the GPS" },
    ],
    explain: {
      uz: "Bir xil raqam — bir xil kamera.",
      en: "Same number, same camera.",
    },
  },
  {
    ask: {
      uz: "Orientation maydonini o‘chirsangiz?",
      en: "What if you delete the Orientation field?",
    },
    right: {
      uz: "Tik rasm yonboshlab ko‘rinadi",
      en: "An upright photo shows on its side",
    },
    wrong: [
      { uz: "GPS o‘chadi", en: "The GPS goes" },
      { uz: "Hech narsa", en: "Nothing" },
      { uz: "Rang o‘zgaradi", en: "The colours change" },
    ],
    explain: {
      uz: "U ko‘rsatish uchun kerak.",
      en: "It is needed for display.",
    },
  },
  {
    ask: {
      uz: "Faqat GPS’ni o‘chiradigan exiftool buyrug‘i?",
      en: "The exiftool command that removes only GPS?",
    },
    right: same("exiftool -gps:all= photo.jpg"),
    wrong: [
      same("exiftool -all= photo.jpg"),
      same("exiftool photo.jpg"),
      same("mv photo.jpg x.jpg"),
    ],
    explain: {
      uz: "-all= hammasini o‘chiradi.",
      en: "-all= removes everything.",
    },
  },
  {
    ask: {
      uz: "Fayl nomini o‘zgartirish metama’lumotni o‘chiradimi?",
      en: "Does renaming a file remove its metadata?",
    },
    right: { uz: "Yo‘q", en: "No" },
    wrong: [
      { uz: "Ha", en: "Yes" },
      { uz: "Faqat GPS’ni", en: "Only the GPS" },
      { uz: "Faqat JPEG’da", en: "Only for JPEG" },
    ],
    explain: {
      uz: "Metama’lumot fayl ichida.",
      en: "Metadata lives inside the file.",
    },
  },
  {
    ask: {
      uz: "Faylni ZIP’ga solish metama’lumotni o‘chiradimi?",
      en: "Does zipping a file remove its metadata?",
    },
    right: {
      uz: "Yo‘q — ochilganda hammasi joyida",
      en: "No — it is all there once unzipped",
    },
    wrong: [
      { uz: "Ha", en: "Yes" },
      { uz: "Faqat muallifni", en: "Only the author" },
      { uz: "Faqat shifrlangan ZIP’da", en: "Only in an encrypted ZIP" },
    ],
    explain: {
      uz: "ZIP faylni o‘zgartirmaydi.",
      en: "ZIP doesn’t change the file.",
    },
  },
  {
    ask: {
      uz: "Word hujjatidagi Template yo‘li nimani oshkor qiladi?",
      en: "What does the Template path in a Word file give away?",
    },
    right: { uz: "Windows foydalanuvchi nomini", en: "The Windows user name" },
    wrong: [
      { uz: "Parolni", en: "The password" },
      { uz: "IP manzilni", en: "The IP address" },
      { uz: "Hech narsani", en: "Nothing" },
    ],
    explain: { uz: "C:\\Users\\<ism>\\…", en: "C:\\Users\\<name>\\…" },
  },
  {
    ask: {
      uz: "“Anonim” xat muallifini nima fosh qilishi mumkin?",
      en: "What can unmask the author of an “anonymous” letter?",
    },
    right: {
      uz: "Creator va Last Modified By maydonlari",
      en: "The Creator and Last Modified By fields",
    },
    wrong: [
      { uz: "Shrift o‘lchami", en: "The font size" },
      { uz: "Sahifalar soni", en: "The page count" },
      { uz: "Hech narsa", en: "Nothing" },
    ],
    explain: {
      uz: "Office ismni o‘zi yozadi.",
      en: "Office writes the name itself.",
    },
  },
  {
    ask: {
      uz: "EXIF’da “Software: Adobe Photoshop” — bu?",
      en: "“Software: Adobe Photoshop” in EXIF — this means?",
    },
    right: {
      uz: "Rasm tahrirlangan bo‘lishi mumkin",
      en: "The photo may have been edited",
    },
    wrong: [
      { uz: "Rasm albatta asl", en: "It is certainly original" },
      { uz: "Kamera modeli", en: "The camera model" },
      { uz: "Hech narsa", en: "Nothing" },
    ],
    explain: {
      uz: "Kamera bunday yozuv qoldirmaydi.",
      en: "A camera doesn’t write that.",
    },
  },
  {
    ask: {
      uz: "Nega metama’lumot yagona dalil bo‘lolmaydi?",
      en: "Why can’t metadata be the only evidence?",
    },
    right: { uz: "Uni soxtalashtirish oson", en: "It is easy to fake" },
    wrong: [
      { uz: "U shifrlangan", en: "It is encrypted" },
      { uz: "U doim noto‘g‘ri", en: "It is always wrong" },
      { uz: "U o‘qilmaydi", en: "It can’t be read" },
    ],
    explain: {
      uz: "exiftool bilan istalgan maydon yoziladi.",
      en: "exiftool can write any field.",
    },
  },
  {
    ask: {
      uz: "Telefonda GPS yozilishining oldini olishning oddiy usuli?",
      en: "A simple way to stop phone photos carrying GPS?",
    },
    right: {
      uz: "Kamera uchun joylashuv ruxsatini o‘chirish",
      en: "Turn off location permission for the camera",
    },
    wrong: [
      { uz: "Rasmni kichraytirish", en: "Make the photo smaller" },
      { uz: "Telefonni qayta yuklash", en: "Restart the phone" },
      { uz: "Rasmni qayta nomlash", en: "Rename the photo" },
    ],
    explain: {
      uz: "Ruxsatsiz kamera koordinata yozmaydi.",
      en: "Without permission no coordinates are written.",
    },
  },
  {
    ask: {
      uz: "Qaysi vosita hujjatlardan metama’lumotni tozalaydi?",
      en: "Which tool cleans metadata from documents?",
    },
    right: same("mat2"),
    wrong: [same("ping"), same("grep"), same("ssh")],
    explain: { uz: "exiftool ham ishlaydi.", en: "exiftool works too." },
  },
];
