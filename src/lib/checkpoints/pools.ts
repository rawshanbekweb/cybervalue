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

export const FORMATS_POOL: PoolItem[] = [
  {
    ask: {
      uz: "JPEG qaysi baytlar bilan boshlanadi?",
      en: "Which bytes start a JPEG?",
    },
    right: same("FF D8"),
    wrong: [same("FF D9"), same("50 4B"), same("25 50")],
    explain: { uz: "FF D9 — oxiri.", en: "FF D9 is the end." },
  },
  {
    ask: {
      uz: "JPEG qaysi baytlar bilan tugaydi?",
      en: "Which bytes end a JPEG?",
    },
    right: same("FF D9"),
    wrong: [same("FF D8"), same("00 00"), same("50 4B")],
    explain: {
      uz: "Undan keyingisini ko‘ruvchi o‘qimaydi.",
      en: "Viewers don’t read past it.",
    },
  },
  {
    ask: {
      uz: "“PK” (50 4B 03 04) qaysi format?",
      en: "Which format is “PK” (50 4B 03 04)?",
    },
    right: same("ZIP"),
    wrong: [same("PDF"), same("PNG"), same("MP3")],
    explain: { uz: "DOCX va APK ham ZIP.", en: "DOCX and APK are ZIPs too." },
  },
  {
    ask: { uz: "binwalk nima qiladi?", en: "What does binwalk do?" },
    right: {
      uz: "Fayl ichidagi tanish imzolarni qidiradi",
      en: "Searches a file for familiar signatures inside it",
    },
    wrong: [
      { uz: "Faylni shifrlaydi", en: "Encrypts the file" },
      { uz: "Faylni o‘chiradi", en: "Deletes the file" },
      { uz: "Tarmoqni skanerlaydi", en: "Scans the network" },
    ],
    explain: {
      uz: "-e topilganlarini chiqaradi.",
      en: "-e extracts what it finds.",
    },
  },
  {
    ask: {
      uz: "Oxiriga ZIP qo‘shilgan JPEG rasm ko‘ruvchida qanday ochiladi?",
      en: "How does a JPEG with a ZIP appended open in a viewer?",
    },
    right: { uz: "Oddiy rasm kabi", en: "As an ordinary picture" },
    wrong: [
      { uz: "Xato bilan", en: "With an error" },
      { uz: "Arxiv sifatida", en: "As an archive" },
      { uz: "Ochilmaydi", en: "It doesn’t" },
    ],
    explain: {
      uz: "Ko‘ruvchi FF D9 da to‘xtaydi.",
      en: "The viewer stops at FF D9.",
    },
  },
  {
    ask: {
      uz: "Nega unzip shunday JPEG’ni ham ochadi?",
      en: "Why does unzip open such a JPEG too?",
    },
    right: {
      uz: "ZIP mundarijasi fayl oxirida",
      en: "A ZIP’s directory is at the end of the file",
    },
    wrong: [
      { uz: "JPEG ZIP’ning turi", en: "JPEG is a kind of ZIP" },
      { uz: "Ochmaydi", en: "It doesn’t" },
      { uz: "Kengaytma tufayli", en: "Because of the extension" },
    ],
    explain: {
      uz: "unzip fayl oxiridan o‘qiydi.",
      en: "unzip reads from the end.",
    },
  },
  {
    ask: { uz: "Polyglot fayl nima?", en: "What is a polyglot file?" },
    right: {
      uz: "Bir vaqtda ikki xil tur sifatida o‘qiladigan fayl",
      en: "A file that reads correctly as two types at once",
    },
    wrong: [
      { uz: "Ko‘p tilli matn", en: "A text in many languages" },
      { uz: "Shifrlangan fayl", en: "An encrypted file" },
      { uz: "Buzilgan fayl", en: "A broken file" },
    ],
    explain: {
      uz: "Masalan, rasm + arxiv.",
      en: "A picture plus an archive, say.",
    },
  },
  {
    ask: {
      uz: "Yuklangan rasmdagi qo‘shimchani qanday yo‘q qilish mumkin?",
      en: "How can extras in an uploaded picture be stripped?",
    },
    right: { uz: "Rasmni qayta kodlash", en: "Re-encode the picture" },
    wrong: [
      { uz: "Kengaytmani tekshirish", en: "Check the extension" },
      { uz: "Nomini o‘zgartirish", en: "Rename it" },
      { uz: "Hech qanday", en: "There is no way" },
    ],
    explain: {
      uz: "Qayta kodlash faqat piksellarni saqlaydi.",
      en: "Re-encoding keeps only the pixels.",
    },
  },
  {
    ask: {
      uz: "Spektrogramma nimani ko‘rsatadi?",
      en: "What does a spectrogram show?",
    },
    right: {
      uz: "Vaqt bo‘yicha har bir chastota kuchini",
      en: "The strength of each frequency over time",
    },
    wrong: [
      { uz: "Faqat balandlikni", en: "Only loudness" },
      { uz: "Fayl hajmini", en: "The file size" },
      { uz: "Metama’lumotni", en: "The metadata" },
    ],
    explain: {
      uz: "To‘lqin shakli — balandlik.",
      en: "The waveform shows loudness.",
    },
  },
  {
    ask: {
      uz: "Ovozga chizilgan so‘z qayerda ko‘rinadi?",
      en: "Where does a word drawn into a sound show?",
    },
    right: { uz: "Spektrogrammada", en: "In the spectrogram" },
    wrong: [
      { uz: "To‘lqin shaklida", en: "In the waveform" },
      { uz: "Fayl nomida", en: "In the file name" },
      { uz: "Ko‘rinmaydi", en: "Nowhere" },
    ],
    explain: { uz: "Audacity’da bir bosishda.", en: "One click in Audacity." },
  },
  {
    ask: {
      uz: "WAV namunalarining LSB’idagi matnni spektrogramma ko‘rsatadimi?",
      en: "Does a spectrogram show text in the LSBs of WAV samples?",
    },
    right: {
      uz: "Yo‘q — boshqa vosita kerak",
      en: "No — another tool is needed",
    },
    wrong: [
      { uz: "Ha, aniq", en: "Yes, clearly" },
      { uz: "Faqat MP3’da", en: "Only in MP3" },
      { uz: "Faqat stereo’da", en: "Only in stereo" },
    ],
    explain: { uz: "LSB o‘zgarishi juda kichik.", en: "LSB changes are tiny." },
  },
  {
    ask: {
      uz: "MP3 ga siqish WAV’dagi LSB xabarini?",
      en: "What does MP3 compression do to an LSB message in a WAV?",
    },
    right: { uz: "Buzadi", en: "Destroys it" },
    wrong: [
      { uz: "Saqlaydi", en: "Keeps it" },
      { uz: "Shifrlaydi", en: "Encrypts it" },
      { uz: "Kattalashtiradi", en: "Enlarges it" },
    ],
    explain: { uz: "MP3 lossy — JPEG kabi.", en: "MP3 is lossy, like JPEG." },
  },
  {
    ask: {
      uz: "Faylning haqiqiy turini qaysi buyruq aytadi?",
      en: "Which command tells a file’s real type?",
    },
    right: same("file"),
    wrong: [same("ls"), same("cat"), same("touch")],
    explain: { uz: "Imzoga qaraydi.", en: "It reads the signature." },
  },
  {
    ask: {
      uz: "Binar fayldagi o‘qiladigan satrlarni qaysi buyruq chiqaradi?",
      en: "Which command lists readable text in a binary?",
    },
    right: same("strings"),
    wrong: [same("chmod"), same("ping"), same("mv")],
    explain: {
      uz: "-n 8 — kamida 8 belgi.",
      en: "-n 8 means at least 8 characters.",
    },
  },
  {
    ask: {
      uz: "PNG LSB’larini avtomatik tekshiradigan vosita?",
      en: "Which tool checks PNG LSBs automatically?",
    },
    right: same("zsteg"),
    wrong: [same("binwalk"), same("exiftool"), same("ssh")],
    explain: {
      uz: "Barcha kanal va tartiblarni sinaydi.",
      en: "It tries every channel and order.",
    },
  },
];

export const STEGANALYSIS_POOL: PoolItem[] = [
  {
    ask: { uz: "Steganaliz nima?", en: "What is steganalysis?" },
    right: {
      uz: "Fayl ichida yashirin narsa borligini aniqlash",
      en: "Telling that a file carries something hidden",
    },
    wrong: [
      { uz: "Xabarni yashirish", en: "Hiding a message" },
      { uz: "Faylni shifrlash", en: "Encrypting a file" },
      { uz: "Faylni o‘chirish", en: "Deleting a file" },
    ],
    explain: {
      uz: "Avval borligini, keyin mazmunini.",
      en: "First that it exists, then what it says.",
    },
  },
  {
    ask: { uz: "Qaysi biri kuchli belgi?", en: "Which is a strong sign?" },
    right: { uz: "800×600 PNG 12 MB", en: "An 800×600 PNG weighing 12 MB" },
    wrong: [
      { uz: "EXIF yo‘q", en: "No EXIF" },
      { uz: "Fayl nomi IMG_2041", en: "The name IMG_2041" },
      { uz: "JPEG sifati 85%", en: "JPEG quality 85%" },
    ],
    explain: {
      uz: "Hajm piksellarga mos emas.",
      en: "The size doesn’t fit the pixels.",
    },
  },
  {
    ask: {
      uz: "LSB’ga tasodifiy bitlar yozilsa, gistogrammada nima bo‘ladi?",
      en: "Random bits written into the LSBs do what to a histogram?",
    },
    right: {
      uz: "2k va 2k+1 juftliklari tenglashadi",
      en: "Pairs 2k and 2k+1 even out",
    },
    wrong: [
      { uz: "Gistogramma yo‘qoladi", en: "The histogram disappears" },
      { uz: "Hamma qiymat 0 bo‘ladi", en: "Every value becomes 0" },
      { uz: "Hech narsa", en: "Nothing" },
    ],
    explain: {
      uz: "Har bir juftlik piksellarni teng bo‘lib oladi.",
      en: "Each pair shares its pixels evenly.",
    },
  },
  {
    ask: {
      uz: "Qaysi hujum juftliklar tengligini o‘lchaydi?",
      en: "Which attack measures how even the pairs are?",
    },
    right: { uz: "Chi-kvadrat", en: "Chi-square" },
    wrong: [
      { uz: "Brute force", en: "Brute force" },
      { uz: "SQL injection", en: "SQL injection" },
      { uz: "Phishing", en: "Phishing" },
    ],
    explain: {
      uz: "RS-tahlil ham shunga o‘xshash.",
      en: "RS analysis is similar.",
    },
  },
  {
    ask: {
      uz: "Test rasmni “toza” desa?",
      en: "A test calls a picture “clean”. Then?",
    },
    right: {
      uz: "Katta LSB payload ehtimoli kam — lekin kafolat emas",
      en: "A large LSB payload is unlikely — but it isn’t a guarantee",
    },
    wrong: [
      { uz: "Aniq hech narsa yo‘q", en: "There is definitely nothing" },
      { uz: "Rasm shifrlangan", en: "The picture is encrypted" },
      { uz: "Rasm buzilgan", en: "The picture is broken" },
    ],
    explain: {
      uz: "Test faqat o‘z izini ko‘radi.",
      en: "A test sees only its own trace.",
    },
  },
  {
    ask: {
      uz: "Kichik payloadni aniqlash nega qiyin?",
      en: "Why is a small payload hard to detect?",
    },
    right: {
      uz: "Juda kam piksel o‘zgaradi",
      en: "Very few pixels change",
    },
    wrong: [
      { uz: "U ko‘rinmas siyohda", en: "It is in invisible ink" },
      { uz: "Qiyin emas", en: "It isn’t" },
      { uz: "U shifrlangan", en: "It is encrypted" },
    ],
    explain: {
      uz: "Statistika deyarli siljimaydi.",
      en: "The statistics barely shift.",
    },
  },
  {
    ask: {
      uz: "Hajmi g‘ayritabiiy rasm uchun birinchi vosita?",
      en: "The first tool for a picture of odd size?",
    },
    right: same("binwalk"),
    wrong: [same("stegseek"), same("zsteg"), same("ping")],
    explain: {
      uz: "Ichida boshqa fayl bo‘lishi mumkin.",
      en: "There may be another file inside.",
    },
  },
  {
    ask: {
      uz: "PDF muallifi g‘alati. Qaysi vosita?",
      en: "A PDF’s author looks odd. Which tool?",
    },
    right: same("exiftool"),
    wrong: [same("binwalk"), same("zsteg"), same("stegseek")],
    explain: { uz: "Metama’lumotni o‘qiydi.", en: "It reads metadata." },
  },
  {
    ask: {
      uz: "PNG piksellarini tekshirish uchun?",
      en: "To check a PNG’s pixels?",
    },
    right: same("zsteg / stegsolve"),
    wrong: [same("exiftool"), same("strings"), same("nmap")],
    explain: {
      uz: "Barcha bit va kanallarni sinaydi.",
      en: "They try every bit and channel.",
    },
  },
  {
    ask: {
      uz: "steghide parolini lug‘atdan qaysi vosita sinaydi?",
      en: "Which tool tries steghide passphrases from a wordlist?",
    },
    right: same("stegseek"),
    wrong: [same("zsteg"), same("binwalk"), same("exiftool")],
    explain: {
      uz: "Zaif parol soniyalarda topiladi.",
      en: "A weak passphrase falls in seconds.",
    },
  },
  {
    ask: { uz: "zsteg’dagi “b1” nima?", en: "What is “b1” in zsteg?" },
    right: { uz: "Har qiymatdan 1 bit", en: "One bit per value" },
    wrong: [
      { uz: "Birinchi bayt", en: "The first byte" },
      { uz: "Ko‘k kanal", en: "The blue channel" },
      { uz: "1-sahifa", en: "Page 1" },
    ],
    explain: { uz: "b2 — ikkita bit.", en: "b2 would be two bits." },
  },
  {
    ask: { uz: "zsteg’dagi “xy” nima?", en: "What is “xy” in zsteg?" },
    right: {
      uz: "Chapdan o‘ngga, yuqoridan pastga o‘qish",
      en: "Reading left to right, top to bottom",
    },
    wrong: [
      { uz: "Koordinatalar", en: "Coordinates" },
      { uz: "Fayl turi", en: "The file type" },
      { uz: "Kanal nomi", en: "A channel name" },
    ],
    explain: { uz: "yx — ustunma-ustun.", en: "yx goes column by column." },
  },
  {
    ask: {
      uz: "steghide yashirishini nima himoya qiladi?",
      en: "What protects steghide hiding?",
    },
    right: { uz: "Uzun, tasodifiy parol", en: "A long, random passphrase" },
    wrong: [
      { uz: "Fayl nomi", en: "The file name" },
      { uz: "JPEG sifati", en: "JPEG quality" },
      { uz: "Hech narsa", en: "Nothing" },
    ],
    explain: {
      uz: "Lug‘atdagi parol tez topiladi.",
      en: "A wordlist passphrase is found fast.",
    },
  },
  {
    ask: {
      uz: "Shubhali fayl bilan birinchi qadam?",
      en: "The first step with a suspect file?",
    },
    right: { uz: "file va SHA-256 xesh", en: "file and a SHA-256 hash" },
    wrong: [
      { uz: "Parol sinash", en: "Trying passphrases" },
      { uz: "Faylni tahrirlash", en: "Editing the file" },
      { uz: "Faylni yuborish", en: "Sending the file on" },
    ],
    explain: {
      uz: "Avval nima ekanini bilib, o‘zgarmaganini qayd eting.",
      en: "Learn what it is and record that it is unchanged.",
    },
  },
  {
    ask: {
      uz: "Boshqalarning fayllarida stegseek ishlatish mumkinmi?",
      en: "May you run stegseek on other people’s files?",
    },
    right: {
      uz: "Faqat ruxsat bilan yoki rasmiy tergovda",
      en: "Only with permission or in an official investigation",
    },
    wrong: [
      { uz: "Har doim", en: "Always" },
      { uz: "Qiziq bo‘lsa", en: "If you’re curious" },
      { uz: "Tunda", en: "At night" },
    ],
    explain: {
      uz: "Ruxsatsiz — qonunbuzarlik.",
      en: "Without permission it is unlawful.",
    },
  },
];

export const SIEM_POOL: PoolItem[] = [
  {
    ask: { uz: "SIEM nima qiladi?", en: "What does a SIEM do?" },
    right: {
      uz: "Turli manbalar loglarini bir joyga yig‘ib, qidirish va ogohlantirish imkonini beradi",
      en: "Brings logs from many sources together to search and alert on",
    },
    wrong: [
      { uz: "Hujumlarni o‘zi to‘xtatadi", en: "Blocks attacks by itself" },
      { uz: "Parollarni saqlaydi", en: "Stores passwords" },
      { uz: "Loglarni o‘chiradi", en: "Deletes logs" },
    ],
    explain: {
      uz: "Security Information and Event Management.",
      en: "Security Information and Event Management.",
    },
  },
  {
    ask: {
      uz: "“Kim tunda SSH bilan kirdi?” — qaysi log?",
      en: "“Who logged in over SSH at night?” — which log?",
    },
    right: { uz: "Autentifikatsiya logi", en: "The authentication log" },
    wrong: [
      { uz: "DNS logi", en: "The DNS log" },
      { uz: "Do‘kon ilovasi logi", en: "The shop app’s log" },
      { uz: "Printer logi", en: "The printer log" },
    ],
    explain: {
      uz: "Kirishlar auth.log yoki Security.evtx’da.",
      en: "Logins live in auth.log or Security.evtx.",
    },
  },
  {
    ask: {
      uz: "“Noutbuk qaysi domenni so‘radi?” — qaysi log?",
      en: "“Which domain did a laptop look up?” — which log?",
    },
    right: { uz: "DNS logi", en: "The DNS log" },
    wrong: [
      { uz: "Autentifikatsiya logi", en: "The authentication log" },
      { uz: "Ilova logi", en: "The application log" },
      { uz: "Antivirus logi", en: "The antivirus log" },
    ],
    explain: {
      uz: "Tarmoq loglari ulanishlar haqida.",
      en: "Network logs are about connections.",
    },
  },
  {
    ask: { uz: "Normallashtirish nima?", en: "What is normalisation?" },
    right: {
      uz: "Bir xil ma’noli qiymatlarni umumiy nomli maydonlarga yozish",
      en: "Writing values that mean the same thing into fields with shared names",
    },
    wrong: [
      { uz: "Loglarni siqish", en: "Compressing logs" },
      { uz: "Loglarni shifrlash", en: "Encrypting logs" },
      { uz: "Eski loglarni o‘chirish", en: "Deleting old logs" },
    ],
    explain: {
      uz: "Shunda bitta so‘rov hamma manbada ishlaydi.",
      en: "Then one search works on every source.",
    },
  },
  {
    ask: {
      uz: "ECS’da ulanish kelgan manzil maydoni?",
      en: "In ECS, the field for the address a connection came from?",
    },
    right: { uz: "source.ip", en: "source.ip" },
    wrong: [
      { uz: "user.name", en: "user.name" },
      { uz: "host.name", en: "host.name" },
      { uz: "event.outcome", en: "event.outcome" },
    ],
    explain: {
      uz: "user.name — hisob, host.name — kompyuter.",
      en: "user.name is the account, host.name the machine.",
    },
  },
  {
    ask: {
      uz: "Windows 4625 hodisasida hisob nomi qaysi maydonda?",
      en: "In a Windows 4625 event, which field holds the account?",
    },
    right: { uz: "TargetUserName", en: "TargetUserName" },
    wrong: [
      { uz: "Computer", en: "Computer" },
      { uz: "LogonType", en: "LogonType" },
      { uz: "Status", en: "Status" },
    ],
    explain: {
      uz: "Manzil esa IpAddress’da.",
      en: "The address is in IpAddress.",
    },
  },
  {
    ask: {
      uz: "Windows’da muvaffaqiyatsiz kirish EventID’si?",
      en: "The Windows EventID for a failed logon?",
    },
    right: { uz: "4625", en: "4625" },
    wrong: [
      { uz: "4624", en: "4624" },
      { uz: "4720", en: "4720" },
      { uz: "1102", en: "1102" },
    ],
    explain: {
      uz: "4624 — muvaffaqiyatli kirish.",
      en: "4624 is a successful logon.",
    },
  },
  {
    ask: {
      uz: "SIEM vaqtni qaysi zonada saqlaydi?",
      en: "Which time zone does a SIEM store times in?",
    },
    right: { uz: "UTC", en: "UTC" },
    wrong: [
      { uz: "Har serverning o‘z zonasi", en: "Each server’s own zone" },
      { uz: "Tahlilchining zonasi", en: "The analyst’s zone" },
      { uz: "Zonasiz", en: "No zone at all" },
    ],
    explain: {
      uz: "Bitta vaqt o‘qi — to‘g‘ri tartib.",
      en: "One timeline keeps the order right.",
    },
  },
  {
    ask: {
      uz: "Barcha soatlarni nima sinxronlaydi?",
      en: "What keeps every clock in sync?",
    },
    right: { uz: "NTP", en: "NTP" },
    wrong: [
      { uz: "DNS", en: "DNS" },
      { uz: "DHCP", en: "DHCP" },
      { uz: "SMTP", en: "SMTP" },
    ],
    explain: {
      uz: "Network Time Protocol.",
      en: "The Network Time Protocol.",
    },
  },
  {
    ask: {
      uz: "Nega loglar darhol markaziy serverga yuboriladi?",
      en: "Why are logs forwarded to a central server at once?",
    },
    right: {
      uz: "Hujumchi mahalliy logni o‘chirsa ham nusxa qoladi",
      en: "A copy survives even if an attacker wipes the local log",
    },
    wrong: [
      { uz: "Disk joyini tejash uchun", en: "To save disk space" },
      { uz: "Tarmoqni tezlashtirish uchun", en: "To speed up the network" },
      { uz: "Loglarni shifrlash uchun", en: "To encrypt them" },
    ],
    explain: {
      uz: "Izlarni o‘chirish — hujumchining odatiy qadami.",
      en: "Wiping traces is a standard attacker step.",
    },
  },
  {
    ask: {
      uz: "Password spraying belgisi?",
      en: "The sign of password spraying?",
    },
    right: {
      uz: "Bitta manzil ko‘p hisobga bir-ikki martadan urinadi",
      en: "One address tries many accounts once or twice each",
    },
    wrong: [
      {
        uz: "Bitta foydalanuvchi parolni 3 marta xato yozadi",
        en: "One user mistypes a password three times",
      },
      {
        uz: "Server qayta yuklanadi",
        en: "A server reboots",
      },
      { uz: "Yangi printer ulanadi", en: "A new printer is connected" },
    ],
    explain: {
      uz: "source.ip bo‘yicha guruhlash buni ko‘rsatadi.",
      en: "Grouping by source.ip shows it.",
    },
  },
  {
    ask: {
      uz: "SPL’da “stats dc(user) by src_ip” nima qiladi?",
      en: "In SPL, what does “stats dc(user) by src_ip” do?",
    },
    right: {
      uz: "Har manzil uchun turli hisoblar sonini sanaydi",
      en: "Counts the different accounts for each address",
    },
    wrong: [
      {
        uz: "Hisoblarni o‘chiradi",
        en: "Deletes the accounts",
      },
      { uz: "Manzillarni bloklaydi", en: "Blocks the addresses" },
      { uz: "Loglarni saralaydi", en: "Sorts the logs alphabetically" },
    ],
    explain: {
      uz: "dc — distinct count.",
      en: "dc means distinct count.",
    },
  },
  {
    ask: {
      uz: "Qaysi dashboard paneli foydali?",
      en: "Which dashboard panel is useful?",
    },
    right: {
      uz: "Loglarni yubormay qo‘ygan manbalar",
      en: "Sources that stopped sending logs",
    },
    wrong: [
      {
        uz: "Aylanadigan 3D globus",
        en: "A spinning 3D globe",
      },
      { uz: "Bugungi jami loglar soni", en: "Today’s total log count" },
      { uz: "SIEM logotipi", en: "The SIEM’s logo" },
    ],
    explain: {
      uz: "Foydali panel harakatga undaydi.",
      en: "A useful panel leads to an action.",
    },
  },
  {
    ask: {
      uz: "Domen kontrolleridan 2 soat log kelmadi. Bu?",
      en: "No logs from the domain controller for 2 hours. That is?",
    },
    right: {
      uz: "Tekshirish kerak bo‘lgan signal",
      en: "A signal worth checking",
    },
    wrong: [
      { uz: "Yaxshi belgi", en: "A good sign" },
      { uz: "Oddiy holat", en: "Normal" },
      { uz: "SIEM yangilanishi", en: "A SIEM update" },
    ],
    explain: {
      uz: "Jimlik ham signal: agent buzilgan yoki o‘chirilgan bo‘lishi mumkin.",
      en: "Silence is a signal: an agent may be broken or switched off.",
    },
  },
  {
    ask: {
      uz: "Log formati o‘zgarib user.name bo‘sh qoldi. Oqibat?",
      en: "A log format changed and user.name came out empty. The result?",
    },
    right: {
      uz: "Shu maydonga tayangan qoidalar ishlamaydi",
      en: "Rules relying on that field stop working",
    },
    wrong: [
      { uz: "Hech narsa", en: "Nothing" },
      { uz: "SIEM o‘zi tuzatadi", en: "The SIEM fixes it itself" },
      { uz: "Loglar shifrlanadi", en: "The logs get encrypted" },
    ],
    explain: {
      uz: "Parserlar ham kuzatiladi.",
      en: "Parsers get watched too.",
    },
  },
];

export const DETECTION_POOL: PoolItem[] = [
  {
    ask: { uz: "Aniqlash qoidasi nima?", en: "What is a detection rule?" },
    right: {
      uz: "Loglardan xavfli holatni topadigan so‘rov",
      en: "A search that finds a dangerous situation in the logs",
    },
    wrong: [
      { uz: "Firewall sozlamasi", en: "A firewall setting" },
      { uz: "Parol siyosati", en: "A password policy" },
      { uz: "Zaxira nusxa", en: "A backup" },
    ],
    explain: {
      uz: "Mos hodisa topilsa, ogohlantirish chiqadi.",
      en: "When an event matches, an alert fires.",
    },
  },
  {
    ask: {
      uz: "“Fayl xeshi ma’lum zararli dastur xeshiga teng” — qaysi tur?",
      en: "“A file’s hash equals a known malware hash” — which kind?",
    },
    right: { uz: "Indikator (IOC)", en: "Indicator (IOC)" },
    wrong: [
      { uz: "Xatti-harakat", en: "Behaviour" },
      { uz: "Anomaliya", en: "Anomaly" },
      { uz: "Chegara", en: "Threshold" },
    ],
    explain: {
      uz: "Aniq ma’lum qiymat — indikator.",
      en: "An exact known value is an indicator.",
    },
  },
  {
    ask: {
      uz: "“Word PowerShell’ni ishga tushirdi” — qaysi tur?",
      en: "“Word started PowerShell” — which kind?",
    },
    right: { uz: "Xatti-harakat", en: "Behaviour" },
    wrong: [
      { uz: "Indikator", en: "Indicator" },
      { uz: "Anomaliya", en: "Anomaly" },
      { uz: "Hech qaysi", en: "None" },
    ],
    explain: {
      uz: "Hujumchining harakati tasvirlangan.",
      en: "It describes what the attacker does.",
    },
  },
  {
    ask: { uz: "Sigma nima?", en: "What is Sigma?" },
    right: {
      uz: "Aniqlash qoidalari uchun ochiq YAML formati",
      en: "An open YAML format for detection rules",
    },
    wrong: [
      { uz: "SIEM mahsuloti", en: "A SIEM product" },
      { uz: "Antivirus", en: "An antivirus" },
      { uz: "Log manbasi", en: "A log source" },
    ],
    explain: {
      uz: "U Splunk, Elastic, Sentinel so‘rovlariga o‘giriladi.",
      en: "It converts into Splunk, Elastic and Sentinel searches.",
    },
  },
  {
    ask: {
      uz: "Sigma’da bitta selection ichidagi maydonlar qanday birlashadi?",
      en: "In Sigma, how are the fields in one selection joined?",
    },
    right: { uz: "VA (AND)", en: "With AND" },
    wrong: [
      { uz: "YOKI (OR)", en: "With OR" },
      { uz: "XOR", en: "With XOR" },
      { uz: "Birlashmaydi", en: "They aren’t" },
    ],
    explain: {
      uz: "Hammasi bir vaqtda bajarilishi kerak.",
      en: "All of them must hold at once.",
    },
  },
  {
    ask: {
      uz: "“selection and not filter” nimani bildiradi?",
      en: "What does “selection and not filter” mean?",
    },
    right: {
      uz: "Tanlovga mos, lekin ma’lum istisno bo‘lmaganlar",
      en: "Matches of the selection that aren’t the known exception",
    },
    wrong: [
      { uz: "Barcha hodisalar", en: "Every event" },
      { uz: "Faqat filterdagilar", en: "Only the filtered ones" },
      { uz: "Hech narsa", en: "Nothing" },
    ],
    explain: {
      uz: "Filter yolg‘on ogohlantirishlarni olib tashlaydi.",
      en: "The filter removes false alarms.",
    },
  },
  {
    ask: {
      uz: "Sigma’da logsource nimani belgilaydi?",
      en: "What does logsource set in Sigma?",
    },
    right: {
      uz: "Qoida qaysi loglarga qo‘llanishini",
      en: "Which logs the rule applies to",
    },
    wrong: [
      { uz: "Ogohlantirish rangini", en: "The alert’s colour" },
      { uz: "Muallifni", en: "The author" },
      { uz: "Saqlash muddatini", en: "The retention period" },
    ],
    explain: {
      uz: "Masalan, product: windows, service: security.",
      en: "For example product: windows, service: security.",
    },
  },
  {
    ask: {
      uz: "Kodlangan PowerShell qoidasi IT avtomatlashtirish hisobini ham ushlayapti. Yechim?",
      en: "An encoded-PowerShell rule also catches IT’s automation account. The fix?",
    },
    right: {
      uz: "O‘sha hisobni filter bilan chiqarib tashlash",
      en: "Leave that account out with a filter",
    },
    wrong: [
      { uz: "Qoidani o‘chirish", en: "Delete the rule" },
      {
        uz: "Faqat Word’dan kelganlarni qoldirish",
        en: "Keep only the ones from Word",
      },
      {
        uz: "Ogohlantirishlarni e’tiborsiz qoldirish",
        en: "Ignore the alerts",
      },
    ],
    explain: {
      uz: "Torayish ortiqcha bo‘lsa, hujum o‘tib ketadi.",
      en: "Narrow too far and the attack slips through.",
    },
  },
  {
    ask: {
      uz: "Chegara juda past bo‘lsa nima bo‘ladi?",
      en: "What happens when a threshold is too low?",
    },
    right: {
      uz: "Ko‘p yolg‘on ogohlantirish va charchash",
      en: "Many false alarms, and alert fatigue",
    },
    wrong: [
      { uz: "Hujumlar o‘tib ketadi", en: "Attacks slip through" },
      { uz: "Hech narsa", en: "Nothing" },
      { uz: "SIEM tezlashadi", en: "The SIEM gets faster" },
    ],
    explain: {
      uz: "Juda yuqori bo‘lsa — sekin hujum o‘tib ketadi.",
      en: "Too high and slow attacks slip through.",
    },
  },
  {
    ask: {
      uz: "Har 10 daqiqada bitta urinish qanday ko‘rinadi?",
      en: "How does one try every 10 minutes show up?",
    },
    right: {
      uz: "Uzun vaqt oynasidagi qoida bilan",
      en: "Through a rule over a long time window",
    },
    wrong: [
      { uz: "5 daqiqalik oynada", en: "In a 5-minute window" },
      { uz: "Ko‘rinmaydi", en: "It can’t" },
      { uz: "Faqat antivirusda", en: "Only in antivirus" },
    ],
    explain: {
      uz: "Past va sekin hujumlar uzun oynada ko‘rinadi.",
      en: "Low-and-slow attacks show over long windows.",
    },
  },
  {
    ask: { uz: "False positive nima?", en: "What is a false positive?" },
    right: {
      uz: "Hujum yo‘q, lekin ogohlantirish chiqdi",
      en: "An alert with no attack behind it",
    },
    wrong: [
      {
        uz: "Hujum bor, lekin ogohlantirish yo‘q",
        en: "An attack with no alert",
      },
      { uz: "To‘g‘ri ogohlantirish", en: "A correct alert" },
      { uz: "To‘g‘ri jimlik", en: "Correct silence" },
    ],
    explain: {
      uz: "Hujum bor-u ogohlantirish yo‘q — false negative.",
      en: "An attack with no alert is a false negative.",
    },
  },
  {
    ask: {
      uz: "Hujumchi pwsh.exe ishlatdi, qoida jim qoldi. Bu?",
      en: "The attacker used pwsh.exe and the rule stayed silent. That is?",
    },
    right: { uz: "False negative", en: "A false negative" },
    wrong: [
      { uz: "False positive", en: "A false positive" },
      { uz: "True positive", en: "A true positive" },
      { uz: "True negative", en: "A true negative" },
    ],
    explain: {
      uz: "Shartni kengaytirish kerak.",
      en: "The condition needs widening.",
    },
  },
  {
    ask: {
      uz: "Og‘riq piramidasida hujumchi uchun eng oson almashtiriladigani?",
      en: "On the pyramid of pain, what is easiest for an attacker to change?",
    },
    right: { uz: "Xesh qiymat", en: "A hash value" },
    wrong: [
      { uz: "TTP", en: "TTPs" },
      { uz: "Vositalar", en: "Tools" },
      { uz: "Texnika", en: "A technique" },
    ],
    explain: {
      uz: "Bir bayt o‘zgarsa — xesh boshqa.",
      en: "Change one byte and the hash differs.",
    },
  },
  {
    ask: {
      uz: "Qoidani xavfsiz sinash uchun qaysi vosita?",
      en: "Which tool safely tests a rule?",
    },
    right: { uz: "Atomic Red Team", en: "Atomic Red Team" },
    wrong: [
      { uz: "Haqiqiy zararli dastur", en: "Real malware" },
      { uz: "Wireshark", en: "Wireshark" },
      { uz: "exiftool", en: "exiftool" },
    ],
    explain: {
      uz: "U hujum texnikalarini sinov muhitida takrorlaydi.",
      en: "It replays attack techniques in a test lab.",
    },
  },
  {
    ask: {
      uz: "“Detection as code” nimani bildiradi?",
      en: "What does “detection as code” mean?",
    },
    right: {
      uz: "Qoidalar git’da saqlanadi, ko‘rib chiqiladi va sinaladi",
      en: "Rules live in git and get reviewed and tested",
    },
    wrong: [
      { uz: "Qoidalarni yozmaslik", en: "Not writing rules" },
      { uz: "Faqat Python’da yozish", en: "Writing them only in Python" },
      { uz: "Kodni shifrlash", en: "Encrypting code" },
    ],
    explain: {
      uz: "Dastur kodi kabi tartib.",
      en: "The same discipline as program code.",
    },
  },
];

export const TRIAGE_POOL: PoolItem[] = [
  {
    ask: { uz: "Triage nima?", en: "What is triage?" },
    right: {
      uz: "Ogohlantirishlarni tez ko‘rib, haqiqiyligi va navbatini hal qilish",
      en: "Quickly judging alerts: which are real and which come first",
    },
    wrong: [
      { uz: "Loglarni o‘chirish", en: "Deleting logs" },
      { uz: "Qoida yozish", en: "Writing rules" },
      { uz: "Serverni qayta yuklash", en: "Rebooting a server" },
    ],
    explain: {
      uz: "Shoshilinch bo‘limdagi saralash kabi.",
      en: "Like sorting patients in an emergency room.",
    },
  },
  {
    ask: { uz: "Ustuvorlikni nima belgilaydi?", en: "What sets priority?" },
    right: {
      uz: "Jiddiylik, aktiv qiymati va hujum davom etayotgani",
      en: "Severity, asset value and whether the attack is ongoing",
    },
    wrong: [
      { uz: "Faqat kelgan vaqti", en: "Only arrival time" },
      { uz: "Faqat qoida nomi", en: "Only the rule’s name" },
      { uz: "Tahlilchi kayfiyati", en: "The analyst’s mood" },
    ],
    explain: {
      uz: "Muhim serverdagi “o‘rta” test VM’dagi “yuqori”dan muhimroq bo‘lishi mumkin.",
      en: "A “medium” on a key server can beat a “high” on a test VM.",
    },
  },
  {
    ask: {
      uz: "Qaysi biri hozir ko‘rilishi kerak?",
      en: "Which needs looking at now?",
    },
    right: {
      uz: "Fayl serverida ommaviy shifrlash",
      en: "Mass encryption on the file server",
    },
    wrong: [
      { uz: "Veb-saytga port skanerlash", en: "A port scan of the website" },
      {
        uz: "Test VM’da bir necha xato kirish",
        en: "A few failed logins on a test VM",
      },
      { uz: "Printer qog‘ozi tugadi", en: "The printer ran out of paper" },
    ],
    explain: {
      uz: "Davom etayotgan to‘lov dasturi hujumi.",
      en: "A ransomware attack under way.",
    },
  },
  {
    ask: {
      uz: "Enrichment nima?",
      en: "What is enrichment?",
    },
    right: {
      uz: "Ogohlantirishga kontekst qo‘shish: IP obro‘si, aktiv egasi, foydalanuvchi",
      en: "Adding context to an alert: IP reputation, asset owner, user",
    },
    wrong: [
      { uz: "Logni siqish", en: "Compressing the log" },
      { uz: "Ogohlantirishni o‘chirish", en: "Deleting the alert" },
      { uz: "Qoidani shifrlash", en: "Encrypting the rule" },
    ],
    explain: {
      uz: "Kontekst qarorni belgilaydi.",
      en: "Context decides the call.",
    },
  },
  {
    ask: {
      uz: "Ogohlantirishdagi “mitre: T1059.001” nimani bildiradi?",
      en: "What does “mitre: T1059.001” in an alert mean?",
    },
    right: {
      uz: "ATT&CK texnikasi — PowerShell",
      en: "The ATT&CK technique — PowerShell",
    },
    wrong: [
      { uz: "Chipta raqami", en: "A ticket number" },
      { uz: "Port raqami", en: "A port number" },
      { uz: "Xodim ID’si", en: "An employee ID" },
    ],
    explain: {
      uz: "Texnika keyingi qadamni taxmin qilishga yordam beradi.",
      en: "The technique helps guess the next step.",
    },
  },
  {
    ask: {
      uz: "Impossible travel: Frankfurt manzili kompaniya VPN’i. Qaror?",
      en: "Impossible travel: the Frankfurt address is the company VPN. The call?",
    },
    right: { uz: "Xavfsiz — yopish", en: "Benign — close it" },
    wrong: [
      { uz: "IR guruhiga uzatish", en: "Escalate to IR" },
      { uz: "Hisobni bloklash", en: "Block the account" },
      {
        uz: "Ogohlantirishni e’tiborsiz qoldirish",
        en: "Ignore it unrecorded",
      },
    ],
    explain: {
      uz: "Kutilgan harakat; VPN manzillarini istisnoga qo‘shish mumkin.",
      en: "Expected; the VPN addresses can go on the exception list.",
    },
  },
  {
    ask: {
      uz: "Word powershell -enc ni ishga tushirdi, keyin yangi domenga ulanish. Qaror?",
      en: "Word started powershell -enc, then a call to a new domain. The call?",
    },
    right: { uz: "Zararli — uzatish", en: "Malicious — escalate" },
    wrong: [
      { uz: "Xavfsiz — yopish", en: "Benign — close" },
      { uz: "Qoidani sozlash", en: "Tune the rule" },
      { uz: "Ertaga ko‘rish", en: "Look tomorrow" },
    ],
    explain: {
      uz: "Fishing, makros va C2 — haqiqiy hujum.",
      en: "Phishing, a macro and C2 — a real attack.",
    },
  },
  {
    ask: {
      uz: "Antivirus Mimikatz’ni karantinga oldi. Qaror?",
      en: "Antivirus quarantined Mimikatz. The call?",
    },
    right: {
      uz: "Uzatish — kim va qanday tushirganini aniqlash kerak",
      en: "Escalate — find out who dropped it and how",
    },
    wrong: [
      { uz: "Yopish — karantin yetarli", en: "Close — quarantine is enough" },
      { uz: "Antivirusni o‘chirish", en: "Switch off the antivirus" },
      { uz: "Faylni qayta tiklash", en: "Restore the file" },
    ],
    explain: {
      uz: "Vosita to‘xtatildi, hujumchi emas.",
      en: "The tool was stopped, not the attacker.",
    },
  },
  {
    ask: {
      uz: "Qoida eskirgan Tor ro‘yxati tufayli chiqdi. Qaror?",
      en: "A rule fired because of a stale Tor list. The call?",
    },
    right: {
      uz: "False positive — qoidani sozlash",
      en: "False positive — tune the rule",
    },
    wrong: [
      { uz: "Zararli — uzatish", en: "Malicious — escalate" },
      { uz: "Kompyuterni o‘chirish", en: "Shut the PC down" },
      { uz: "Hech narsa qilmaslik", en: "Do nothing" },
    ],
    explain: {
      uz: "Indikator eskirgan — ro‘yxatni yangilash kerak.",
      en: "The indicator is stale — the list needs updating.",
    },
  },
  {
    ask: {
      uz: "Benign va false positive farqi?",
      en: "Benign versus false positive?",
    },
    right: {
      uz: "Benign — qoida to‘g‘ri, harakat xavfsiz; FP — qoida noto‘g‘ri narsani ushladi",
      en: "Benign: the rule worked, the activity was harmless; FP: the rule caught the wrong thing",
    },
    wrong: [
      { uz: "Farqi yo‘q", en: "No difference" },
      { uz: "Benign — hujum", en: "Benign means an attack" },
      { uz: "FP — haqiqiy hujum", en: "FP means a real attack" },
    ],
    explain: {
      uz: "False positive qoidani sozlashni talab qiladi.",
      en: "A false positive calls for tuning.",
    },
  },
  {
    ask: {
      uz: "Hujummi yoki yo‘qligiga ishonchingiz komil emas. Nima qilasiz?",
      en: "You aren’t sure whether it is an attack. What do you do?",
    },
    right: {
      uz: "Faktlar bilan yuqoriga uzataman",
      en: "Escalate with the facts",
    },
    wrong: [
      { uz: "Yopaman", en: "Close it" },
      { uz: "Ertagacha kutaman", en: "Wait until tomorrow" },
      { uz: "Qoidani o‘chiraman", en: "Switch the rule off" },
    ],
    explain: {
      uz: "O‘tkazib yuborilgan hujum qimmatroq.",
      en: "A missed attack costs more.",
    },
  },
  {
    ask: {
      uz: "Uzatish xatiga nima yozilmaydi?",
      en: "What never goes into an escalation?",
    },
    right: { uz: "Foydalanuvchi paroli", en: "A user’s password" },
    wrong: [
      { uz: "UTC vaqt", en: "The UTC time" },
      { uz: "Kompyuter nomi", en: "The machine name" },
      { uz: "Qilingan ishlar", en: "What was already done" },
    ],
    explain: {
      uz: "Chiptalarni ko‘p odam o‘qiydi.",
      en: "Many people read tickets.",
    },
  },
  {
    ask: { uz: "Playbook nima?", en: "What is a playbook?" },
    right: {
      uz: "Ogohlantirish turi uchun yozilgan qadamlar",
      en: "Written steps for one kind of alert",
    },
    wrong: [
      { uz: "Hujumchi rejasi", en: "The attacker’s plan" },
      { uz: "SIEM litsenziyasi", en: "A SIEM licence" },
      { uz: "Log formati", en: "A log format" },
    ],
    explain: {
      uz: "Hamma bir xil, sinalgan tartibda ishlaydi.",
      en: "Everyone works the same tested way.",
    },
  },
  {
    ask: {
      uz: "Playbook qadamlarini avtomatlashtiradigan tizim?",
      en: "The system that automates playbook steps?",
    },
    right: { uz: "SOAR", en: "SOAR" },
    wrong: [
      { uz: "DNS", en: "DNS" },
      { uz: "VPN", en: "VPN" },
      { uz: "NTP", en: "NTP" },
    ],
    explain: {
      uz: "Security Orchestration, Automation and Response.",
      en: "Security Orchestration, Automation and Response.",
    },
  },
  {
    ask: { uz: "MTTD nimani o‘lchaydi?", en: "What does MTTD measure?" },
    right: {
      uz: "Hujum boshlanishidan aniqlanishigacha o‘rtacha vaqt",
      en: "Mean time from an attack starting to detection",
    },
    wrong: [
      { uz: "Tahlilchilar soni", en: "The number of analysts" },
      { uz: "Disk hajmi", en: "Disk size" },
      { uz: "Qoidalar soni", en: "The number of rules" },
    ],
    explain: {
      uz: "MTTR — aniqlashdan bartaraf etishgacha.",
      en: "MTTR runs from detection to resolution.",
    },
  },
];

export const HUNTING_POOL: PoolItem[] = [
  {
    ask: { uz: "Tahdid izlash nima?", en: "What is threat hunting?" },
    right: {
      uz: "Qoidalar sezmagan hujumchini faol qidirish",
      en: "Actively looking for attackers the rules missed",
    },
    wrong: [
      { uz: "Ogohlantirishni kutish", en: "Waiting for alerts" },
      { uz: "Parol almashtirish", en: "Changing passwords" },
      { uz: "Antivirus o‘rnatish", en: "Installing antivirus" },
    ],
    explain: {
      uz: "Ovchi savoldan boshlaydi.",
      en: "A hunter starts from a question.",
    },
  },
  {
    ask: {
      uz: "“Assume breach” nimani bildiradi?",
      en: "What does “assume breach” mean?",
    },
    right: {
      uz: "Hujumchi allaqachon ichkarida deb hisoblash",
      en: "Working as if an attacker is already inside",
    },
    wrong: [
      { uz: "Hamma narsa xavfsiz deb hisoblash", en: "Assuming all is safe" },
      { uz: "Tarmoqni o‘chirish", en: "Shutting the network down" },
      { uz: "Faqat firewall’ga ishonish", en: "Trusting only the firewall" },
    ],
    explain: {
      uz: "Ovchining boshlang‘ich nuqtasi.",
      en: "The hunter’s starting point.",
    },
  },
  {
    ask: {
      uz: "Qaysi biri yaxshi gipoteza?",
      en: "Which is a good hypothesis?",
    },
    right: {
      uz: "RDP bilan harakat bo‘lsa, stansiyalar orasida 4624 LogonType 10 bor",
      en: "If there was RDP movement, workstations show 4624 LogonType 10 logons",
    },
    wrong: [
      {
        uz: "Bizni buzishgan bo‘lishi mumkin",
        en: "We might have been hacked",
      },
      { uz: "Tarmoqda nimadir g‘alati", en: "Something is odd" },
      { uz: "Hujumchilar yomon", en: "Attackers are bad" },
    ],
    explain: {
      uz: "Nima, qayerda, qaysi ma’lumot.",
      en: "What, where and which data.",
    },
  },
  {
    ask: { uz: "MITRE ATT&CK nima?", en: "What is MITRE ATT&CK?" },
    right: {
      uz: "Haqiqiy hujumlardan yig‘ilgan taktika va texnikalar bazasi",
      en: "A knowledge base of tactics and techniques from real attacks",
    },
    wrong: [
      { uz: "Antivirus", en: "An antivirus" },
      { uz: "SIEM", en: "A SIEM" },
      { uz: "Zaiflik skaneri", en: "A vulnerability scanner" },
    ],
    explain: {
      uz: "Hujumchi xatti-harakatining umumiy tili.",
      en: "A shared language for attacker behaviour.",
    },
  },
  {
    ask: {
      uz: "ATT&CK’da taktika nima?",
      en: "What is a tactic in ATT&CK?",
    },
    right: {
      uz: "Hujumchining maqsadi, masalan, o‘rnashish",
      en: "The attacker’s goal, such as persistence",
    },
    wrong: [
      { uz: "Aniq dastur", en: "A specific program" },
      { uz: "IP manzil", en: "An IP address" },
      { uz: "Fayl xeshi", en: "A file hash" },
    ],
    explain: {
      uz: "Texnika — maqsadga erishish usuli.",
      en: "A technique is the way to reach the goal.",
    },
  },
  {
    ask: {
      uz: "“Rejalashtirilgan vazifa yaratadi” qaysi texnika?",
      en: "“Creates a scheduled task” is which technique?",
    },
    right: { uz: "T1053.005", en: "T1053.005" },
    wrong: [
      { uz: "T1566.001", en: "T1566.001" },
      { uz: "T1021.001", en: "T1021.001" },
      { uz: "T1567.002", en: "T1567.002" },
    ],
    explain: {
      uz: "Persistence taktikasi ostida.",
      en: "Under the Persistence tactic.",
    },
  },
  {
    ask: {
      uz: "“Ilovali fishing xati” qaysi texnika?",
      en: "“A phishing email with an attachment” is which technique?",
    },
    right: { uz: "T1566.001", en: "T1566.001" },
    wrong: [
      { uz: "T1053.005", en: "T1053.005" },
      { uz: "T1003.001", en: "T1003.001" },
      { uz: "T1048", en: "T1048" },
    ],
    explain: {
      uz: "Spearphishing Attachment, Initial Access.",
      en: "Spearphishing Attachment, under Initial Access.",
    },
  },
  {
    ask: {
      uz: "T1053.005 da “.005” nima?",
      en: "In T1053.005, what is “.005”?",
    },
    right: { uz: "Subtexnika", en: "The sub-technique" },
    wrong: [
      { uz: "Versiya", en: "A version" },
      { uz: "Port", en: "A port" },
      { uz: "Jiddiylik", en: "The severity" },
    ],
    explain: {
      uz: "Windows Task Scheduler turi.",
      en: "The Windows Task Scheduler kind.",
    },
  },
  {
    ask: {
      uz: "Texnika sahifasida ovchi uchun eng muhim qism?",
      en: "On a technique’s page, the part a hunter needs most?",
    },
    right: { uz: "Ma’lumot manbalari", en: "The data sources" },
    wrong: [
      { uz: "Yaratilgan sana", en: "The date created" },
      { uz: "Sahifa rangi", en: "The page colour" },
      { uz: "Mualliflar", en: "The authors" },
    ],
    explain: {
      uz: "Qayerdan qidirishni aytadi.",
      en: "They say where to look.",
    },
  },
  {
    ask: { uz: "Stacking nima?", en: "What is stacking?" },
    right: {
      uz: "Barcha kompyuterlardan bir xil narsani yig‘ib, qiymat bo‘yicha sanash",
      en: "Collecting the same thing from every machine and counting by value",
    },
    wrong: [
      { uz: "Loglarni o‘chirish", en: "Deleting logs" },
      { uz: "Serverlarni ustma-ust qo‘yish", en: "Piling servers up" },
      { uz: "Parollarni sinash", en: "Trying passwords" },
    ],
    explain: {
      uz: "Kam uchraydigan qiymat — tekshirishga arziydi.",
      en: "The rare value is worth a look.",
    },
  },
  {
    ask: {
      uz: "40 kompyuterdan faqat bittasida “WindowsUpdateCheck” vazifasi C:\\Users\\Public’dan ishlaydi. Bu?",
      en: "Only one of 40 PCs has a “WindowsUpdateCheck” task running from C:\\Users\\Public. That is?",
    },
    right: { uz: "Tekshirishga arziydi", en: "Worth investigating" },
    wrong: [
      { uz: "Oddiy Windows yangilanishi", en: "A normal Windows update" },
      { uz: "Hammada bor", en: "Found everywhere" },
      { uz: "Muhim emas", en: "Not important" },
    ],
    explain: {
      uz: "Nomga emas, buyruqqa qarang.",
      en: "Look at the command, not the name.",
    },
  },
  {
    ask: { uz: "IOC va IOA farqi?", en: "IOC versus IOA?" },
    right: {
      uz: "IOC — buzilish izi; IOA — hujum harakati",
      en: "An IOC is a trace of a breach; an IOA is attack behaviour",
    },
    wrong: [
      { uz: "Farqi yo‘q", en: "No difference" },
      { uz: "IOA — fayl xeshi", en: "An IOA is a file hash" },
      { uz: "IOC — firewall qoidasi", en: "An IOC is a firewall rule" },
    ],
    explain: {
      uz: "Xesh — IOC; Public’dan vazifa yaratish — IOA.",
      en: "A hash is an IOC; creating a task from Public is an IOA.",
    },
  },
  {
    ask: {
      uz: "TLP:RED belgili ma’lumotni kim ko‘rishi mumkin?",
      en: "Who may see information labelled TLP:RED?",
    },
    right: {
      uz: "Faqat nomlangan qabul qiluvchilar",
      en: "Only the named recipients",
    },
    wrong: [
      { uz: "Hamma", en: "Everyone" },
      { uz: "Butun soha", en: "The whole sector" },
      { uz: "Butun tashkilot", en: "The whole organisation" },
    ],
    explain: {
      uz: "TLP:CLEAR — hammaga ochiq.",
      en: "TLP:CLEAR is open to everyone.",
    },
  },
  {
    ask: {
      uz: "Indikatorlarni almashish uchun ochiq platforma?",
      en: "An open platform for sharing indicators?",
    },
    right: { uz: "MISP", en: "MISP" },
    wrong: [
      { uz: "RDP", en: "RDP" },
      { uz: "SMTP", en: "SMTP" },
      { uz: "NTP", en: "NTP" },
    ],
    explain: {
      uz: "STIX — format, TAXII — uzatish.",
      en: "STIX is the format, TAXII the transport.",
    },
  },
  {
    ask: {
      uz: "Izlash hech narsa topmadi. Keyin?",
      en: "The hunt found nothing. Then?",
    },
    right: {
      uz: "Nima tekshirilganini yozib, qoidaga aylantirish",
      en: "Record what was checked and turn it into a rule",
    },
    wrong: [
      { uz: "Hech narsa yozmaslik", en: "Record nothing" },
      { uz: "Izlashni befoyda deyish", en: "Call it a waste" },
      { uz: "Loglarni o‘chirish", en: "Delete the logs" },
    ],
    explain: {
      uz: "Salbiy natija ham natija.",
      en: "A null result is still a result.",
    },
  },
];

export const PHISHING_POOL: PoolItem[] = [
  {
    ask: { uz: "Fishing nima?", en: "What is phishing?" },
    right: {
      uz: "Ishonchli tashkilot nomidan parol, pul yoki kirish so‘raydigan xat",
      en: "An email posing as a trusted organisation to get passwords, money or access",
    },
    wrong: [
      { uz: "Spam filtri", en: "A spam filter" },
      { uz: "Pochta serveri", en: "A mail server" },
      { uz: "Shifrlash usuli", en: "An encryption method" },
    ],
    explain: {
      uz: "U shoshiltiradi, qo‘rqitadi yoki aldaydi.",
      en: "It rushes, scares or tempts.",
    },
  },
  {
    ask: {
      uz: "Qaysi biri fishing belgisi?",
      en: "Which is a sign of phishing?",
    },
    right: {
      uz: "“24 soatda tasdiqlamasangiz, karta bloklanadi”",
      en: "“Confirm within 24 hours or your card is blocked”",
    },
    wrong: [
      { uz: "Xat ismingiz bilan boshlanadi", en: "It starts with your name" },
      { uz: "Obunadan chiqish havolasi", en: "An unsubscribe link" },
      { uz: "Kompaniya logotipi", en: "A company logo" },
    ],
    explain: {
      uz: "Shoshiltirish — o‘ylashga vaqt bermaslik.",
      en: "Rushing leaves no time to think.",
    },
  },
  {
    ask: {
      uz: "Received zanjirida birinchi server qaysi?",
      en: "Which Received header is the first server?",
    },
    right: { uz: "Eng pastdagisi", en: "The bottom one" },
    wrong: [
      { uz: "Eng tepadagisi", en: "The top one" },
      { uz: "O‘rtadagisi", en: "The middle one" },
      { uz: "Received’da ko‘rinmaydi", en: "It isn’t in Received" },
    ],
    explain: {
      uz: "Har bir server tepaga qo‘shadi.",
      en: "Each server adds one on top.",
    },
  },
  {
    ask: {
      uz: "Reply-To From’dan boshqa domenda. Bu?",
      en: "Reply-To is on a different domain from From. That is?",
    },
    right: { uz: "Ogohlik belgisi", en: "A warning sign" },
    wrong: [
      { uz: "Har doim normal", en: "Always normal" },
      { uz: "Shifrlash belgisi", en: "A sign of encryption" },
      { uz: "DKIM imzosi", en: "A DKIM signature" },
    ],
    explain: {
      uz: "Javoblar hujumchiga ketadi.",
      en: "Replies would go to the attacker.",
    },
  },
  {
    ask: { uz: "SPF nimani tekshiradi?", en: "What does SPF check?" },
    right: {
      uz: "Yuboruvchi server domen nomidan xat yuborishga ruxsat etilganmi",
      en: "Whether the sending server may send mail for the domain",
    },
    wrong: [
      { uz: "Xat imzosi", en: "The email’s signature" },
      { uz: "Virus borligi", en: "Whether it has a virus" },
      { uz: "Xat matni", en: "The email’s text" },
    ],
    explain: {
      uz: "Ro‘yxat DNS’da e’lon qilinadi.",
      en: "The list is published in DNS.",
    },
  },
  {
    ask: { uz: "DKIM nimani tekshiradi?", en: "What does DKIM check?" },
    right: {
      uz: "Xat imzolangan va yo‘lda o‘zgarmagan",
      en: "The email was signed and not changed on the way",
    },
    wrong: [
      { uz: "Yuboruvchi IP manzili", en: "The sender’s IP" },
      { uz: "Qabul qiluvchi paroli", en: "The recipient’s password" },
      { uz: "Ilova hajmi", en: "The attachment’s size" },
    ],
    explain: {
      uz: "Ochiq kalit DNS’da turadi.",
      en: "The public key sits in DNS.",
    },
  },
  {
    ask: { uz: "DMARC nima qiladi?", en: "What does DMARC do?" },
    right: {
      uz: "From domenini SPF/DKIM bilan moslashtiradi va mos kelmasa nima qilishni aytadi",
      en: "Ties the From domain to SPF/DKIM and says what to do if they don’t match",
    },
    wrong: [
      { uz: "Xatni shifrlaydi", en: "Encrypts the email" },
      { uz: "Spam’ni o‘chiradi", en: "Deletes spam" },
      { uz: "Parol saqlaydi", en: "Stores passwords" },
    ],
    explain: {
      uz: "Siyosat: none, quarantine yoki reject.",
      en: "The policy is none, quarantine or reject.",
    },
  },
  {
    ask: {
      uz: "SPF va DKIM pass bo‘lsa, xat xavfsizmi?",
      en: "If SPF and DKIM pass, is the email safe?",
    },
    right: {
      uz: "Shart emas — domenning o‘zi soxta bo‘lishi mumkin",
      en: "Not necessarily — the domain itself may be the fake",
    },
    wrong: [
      { uz: "Ha, har doim", en: "Yes, always" },
      { uz: "Ha, logo bo‘lsa", en: "Yes, if it has a logo" },
      { uz: "Ha, ilova bo‘lmasa", en: "Yes, if it has no attachment" },
    ],
    explain: {
      uz: "Hujumchilar o‘xshash domenlarni to‘g‘ri sozlaydi.",
      en: "Attackers set up look-alike domains properly.",
    },
  },
  {
    ask: {
      uz: "my.bank.uz.secure-login.example’ning haqiqiy domeni?",
      en: "The real domain of my.bank.uz.secure-login.example?",
    },
    right: { uz: "secure-login.example", en: "secure-login.example" },
    wrong: [
      { uz: "bank.uz", en: "bank.uz" },
      { uz: "my.bank.uz", en: "my.bank.uz" },
      { uz: "uz.secure", en: "uz.secure" },
    ],
    explain: {
      uz: "Domen xost nomining oxirida.",
      en: "The domain is at the end of the host name.",
    },
  },
  {
    ask: {
      uz: "“paypa1.com” qanday usul?",
      en: "What trick is “paypa1.com”?",
    },
    right: {
      uz: "Harfni o‘xshash belgiga almashtirish (typosquatting)",
      en: "Swapping a letter for a look-alike (typosquatting)",
    },
    wrong: [
      { uz: "Subdomen", en: "A subdomain" },
      { uz: "Ikki kengaytma", en: "A double extension" },
      { uz: "Shifrlash", en: "Encryption" },
    ],
    explain: {
      uz: "l o‘rniga 1.",
      en: "A 1 instead of an l.",
    },
  },
  {
    ask: {
      uz: "xn-- bilan boshlanadigan domen nima?",
      en: "What is a domain starting with xn--?",
    },
    right: {
      uz: "Punycode — lotin bo‘lmagan harflar, masalan, kirill “а”",
      en: "Punycode — non-Latin letters, such as a Cyrillic “а”",
    },
    wrong: [
      { uz: "Xavfsiz bank domeni", en: "A safe bank domain" },
      { uz: "IP manzil", en: "An IP address" },
      { uz: "Email manzili", en: "An email address" },
    ],
    explain: {
      uz: "Ko‘zga apple.com bo‘lib ko‘rinishi mumkin.",
      en: "It can look exactly like apple.com.",
    },
  },
  {
    ask: {
      uz: "Qaysi ilova eng xavfli?",
      en: "Which attachment is riskiest?",
    },
    right: { uz: "payment.pdf.lnk", en: "payment.pdf.lnk" },
    wrong: [
      { uz: "photo.png", en: "photo.png" },
      { uz: "notes.txt", en: "notes.txt" },
      { uz: "logo.jpg", en: "logo.jpg" },
    ],
    explain: {
      uz: "Yorliq buyruq ishga tushiradi.",
      en: "A shortcut runs a command.",
    },
  },
  {
    ask: {
      uz: "Nega .iso ilovalar xavfli?",
      en: "Why are .iso attachments risky?",
    },
    right: {
      uz: "Ichidagi fayllar ogohlantirishsiz ochiladi",
      en: "The files inside open without warnings",
    },
    wrong: [
      { uz: "Ular juda katta", en: "They are too big" },
      { uz: "Ular shifrlangan", en: "They are encrypted" },
      { uz: "Xavfli emas", en: "They aren’t" },
    ],
    explain: {
      uz: "Disk tasviri internetdan kelgan belgini olib tashlashi mumkin.",
      en: "A disk image can shed the downloaded-from-internet mark.",
    },
  },
  {
    ask: {
      uz: "Shubhali ilovani qayerda ochasiz?",
      en: "Where do you open a suspect attachment?",
    },
    right: { uz: "Sandbox’da", en: "In a sandbox" },
    wrong: [
      { uz: "O‘z kompyuteringizda", en: "On your own PC" },
      { uz: "Serverda", en: "On a server" },
      { uz: "Telefonda", en: "On your phone" },
    ],
    explain: {
      uz: "Ajratilgan muhit tarmoqni himoya qiladi.",
      en: "An isolated machine protects the network.",
    },
  },
  {
    ask: {
      uz: "Xodim fishing havolasida parol kiritdi. Nima qilasiz?",
      en: "A worker typed a password on a phishing link. What now?",
    },
    right: {
      uz: "Parolni almashtirib, sessiyalarini yopib, kirishlarni tekshiraman",
      en: "Reset the password, end the sessions, check the logins",
    },
    wrong: [
      { uz: "Kutaman", en: "Wait" },
      { uz: "Xodimni ayblayman", en: "Blame the worker" },
      { uz: "Xatni o‘chiraman, xolos", en: "Just delete the email" },
    ],
    explain: {
      uz: "Hujumchi parolni darhol ishlatishi mumkin.",
      en: "The attacker may use it at once.",
    },
  },
];

export const ETHICS_POOL: PoolItem[] = [
  {
    ask: { uz: "OSINT nima?", en: "What is OSINT?" },
    right: {
      uz: "Qonuniy ochiq ma’lumotlardan xulosa chiqarish",
      en: "Drawing conclusions from lawfully available information",
    },
    wrong: [
      { uz: "Parollarni buzish", en: "Cracking passwords" },
      { uz: "Serverlarni skanerlash", en: "Scanning servers" },
      { uz: "Zararli dastur yozish", en: "Writing malware" },
    ],
    explain: {
      uz: "Open-source intelligence.",
      en: "Open-source intelligence.",
    },
  },
  {
    ask: { uz: "Qaysi biri ochiq manba?", en: "Which is an open source?" },
    right: {
      uz: "Yuridik shaxslar davlat reyestri",
      en: "The government register of companies",
    },
    wrong: [
      { uz: "Sizib chiqqan mijozlar bazasi", en: "A leaked customer database" },
      {
        uz: "Taxmin qilingan parol bilan ochilgan pochta",
        en: "A mailbox opened with a guessed password",
      },
      {
        uz: "Soxta ism bilan kirilgan yopiq guruh",
        en: "A private group joined under false pretences",
      },
    ],
    explain: {
      uz: "Hamma qonuniy ko‘ra oladi.",
      en: "Anyone may lawfully see it.",
    },
  },
  {
    ask: {
      uz: "Sizib chiqqan baza internetda ochiq turibdi. U OSINT manbami?",
      en: "A leaked database sits openly online. Is it an OSINT source?",
    },
    right: { uz: "Yo‘q — o‘g‘irlangan ma’lumot", en: "No — it is stolen data" },
    wrong: [
      { uz: "Ha, ochiq", en: "Yes, it’s out there" },
      { uz: "Ha, bepul bo‘lsa", en: "Yes, if free" },
      { uz: "Ha, ish vaqtida", en: "Yes, during work hours" },
    ],
    explain: {
      uz: "Mavjudlik qonuniylik emas.",
      en: "Available isn’t lawful.",
    },
  },
  {
    ask: {
      uz: "Shaxsiy ma’lumot ochiq profilda bo‘lsa, u himoyalanganmi?",
      en: "Is personal data on a public profile still protected?",
    },
    right: {
      uz: "Ha, qonun uni baribir himoya qiladi",
      en: "Yes, the law still protects it",
    },
    wrong: [
      { uz: "Yo‘q, ochiq bo‘lsa — hammaniki", en: "No, public means anyone’s" },
      { uz: "Faqat Yevropada", en: "Only in Europe" },
      { uz: "Faqat bolalarniki", en: "Only children’s" },
    ],
    explain: {
      uz: "Maqsad va asos kerak.",
      en: "A purpose and lawful basis are needed.",
    },
  },
  {
    ask: {
      uz: "Ma’lumotlarni minimallashtirish nima?",
      en: "What is data minimisation?",
    },
    right: {
      uz: "Faqat maqsad uchun kerakli ma’lumotni yig‘ish",
      en: "Collecting only what the purpose needs",
    },
    wrong: [
      { uz: "Fayllarni siqish", en: "Compressing files" },
      { uz: "Hammasini yig‘ish", en: "Collecting everything" },
      { uz: "Ma’lumotni shifrlash", en: "Encrypting data" },
    ],
    explain: {
      uz: "Yig‘ilmagan ma’lumot sizmaydi.",
      en: "Uncollected data can’t leak.",
    },
  },
  {
    ask: {
      uz: "Taxmin qilingan parol bilan akkauntga “faqat qarash uchun” kirish?",
      en: "Logging in with a guessed password “just to look”?",
    },
    right: {
      uz: "Ruxsatsiz kirish — jinoyat",
      en: "Unauthorised access — a crime",
    },
    wrong: [
      { uz: "OSINT usuli", en: "An OSINT technique" },
      { uz: "Ruxsat etilgan", en: "Allowed" },
      { uz: "Passiv razvedka", en: "Passive reconnaissance" },
    ],
    explain: {
      uz: "Niyat emas, harakat muhim.",
      en: "The act matters, not the intent.",
    },
  },
  {
    ask: {
      uz: "Professional OSINT ishi nima bilan boshlanadi?",
      en: "What does professional OSINT work start with?",
    },
    right: {
      uz: "Yozma ruxsat: doira, usullar, sanalar",
      en: "A written authorisation: scope, methods, dates",
    },
    wrong: [
      { uz: "Darhol qidiruv", en: "Searching straight away" },
      { uz: "Port skanerlash", en: "A port scan" },
      { uz: "Og‘zaki va’da", en: "A verbal promise" },
    ],
    explain: {
      uz: "Ruxsatsiz ish — ruxsatsiz.",
      en: "Unauthorised work is unauthorised.",
    },
  },
  {
    ask: {
      uz: "Ruxsat 2-noyabrdan. 30-oktabrda passiv qidiruv mumkinmi?",
      en: "Authorisation starts 2 November. Passive searching on 30 October?",
    },
    right: { uz: "Yo‘q — muddatdan tashqari", en: "No — outside the window" },
    wrong: [
      { uz: "Ha, passiv bo‘lsa", en: "Yes, if passive" },
      { uz: "Ha, ertaroq yaxshi", en: "Yes, earlier is better" },
      { uz: "Ha, dam olish kuni bo‘lsa", en: "Yes, at weekends" },
    ],
    explain: {
      uz: "Sana ham doiraning qismi.",
      en: "The dates are part of the scope.",
    },
  },
  {
    ask: {
      uz: "Mijozning hamkor kompaniyasi xodimlarini o‘rganish mumkinmi?",
      en: "May you research the client’s partner company’s staff?",
    },
    right: {
      uz: "Yo‘q — hamkor rozilik bermagan",
      en: "No — the partner never agreed",
    },
    wrong: [
      { uz: "Ha, bog‘liq kompaniya", en: "Yes, it’s related" },
      { uz: "Ha, agar foydali bo‘lsa", en: "Yes, if useful" },
      { uz: "Ha, passiv bo‘lsa", en: "Yes, if passive" },
    ],
    explain: {
      uz: "Faqat ruxsat bergan tomon.",
      en: "Only the party that authorised it.",
    },
  },
  {
    ask: {
      uz: "Qaysi biri passiv razvedka?",
      en: "Which is passive reconnaissance?",
    },
    right: {
      uz: "crt.sh’da sertifikatlarni qidirish",
      en: "Searching certificates on crt.sh",
    },
    wrong: [
      { uz: "Port skanerlash", en: "Port scanning" },
      { uz: "Xodimga qo‘ng‘iroq qilish", en: "Phoning staff" },
      { uz: "Xodimga xat yuborish", en: "Emailing staff" },
    ],
    explain: { uz: "Maqsadga tegmaydi.", en: "It never touches the target." },
  },
  {
    ask: {
      uz: "Port skanerlash qaysi turga kiradi?",
      en: "Which kind is port scanning?",
    },
    right: { uz: "Faol", en: "Active" },
    wrong: [
      { uz: "Passiv", en: "Passive" },
      { uz: "Arxiv", en: "Archival" },
      { uz: "Hech qaysi", en: "Neither" },
    ],
    explain: {
      uz: "Maqsad serverlariga tegadi.",
      en: "It touches the target’s servers.",
    },
  },
  {
    ask: { uz: "Doxxing nima?", en: "What is doxxing?" },
    right: {
      uz: "Shaxsiy ma’lumotni roziligisiz ommaga chiqarish",
      en: "Publishing someone’s personal details without consent",
    },
    wrong: [
      { uz: "Hujjat formatlash", en: "Formatting documents" },
      { uz: "Domen sotib olish", en: "Buying a domain" },
      { uz: "Fayl arxivlash", en: "Archiving files" },
    ],
    explain: { uz: "U ta’qibga yo‘l ochadi.", en: "It enables stalking." },
  },
  {
    ask: {
      uz: "Hisobotda xodimning shaxsiy raqami bilan nima qilinadi?",
      en: "What happens to a worker’s private number in a report?",
    },
    right: {
      uz: "Topilganini yozib, raqamning o‘zini yashirish",
      en: "Note that it is findable, redact the number",
    },
    wrong: [
      { uz: "To‘liq yozish", en: "Print it in full" },
      { uz: "Qo‘ng‘iroq qilib tekshirish", en: "Ring it to check" },
      { uz: "Ijtimoiy tarmoqda e’lon qilish", en: "Post it online" },
    ],
    explain: {
      uz: "Xulosa muhim, tafsilot emas.",
      en: "The finding matters, not the detail.",
    },
  },
  {
    ask: {
      uz: "Nega shaxsiy LinkedIn bilan maqsad profillarini ko‘rmaslik kerak?",
      en: "Why not view target profiles from your own LinkedIn?",
    },
    right: {
      uz: "Ular kim ko‘rganini ko‘radi",
      en: "They can see who viewed them",
    },
    wrong: [
      { uz: "LinkedIn ishlamaydi", en: "LinkedIn won’t work" },
      { uz: "Farqi yo‘q", en: "It makes no difference" },
      { uz: "Bu taqiqlangan sayt", en: "The site is banned" },
    ],
    explain: {
      uz: "Maqsadni ogohlantirmang.",
      en: "Don’t tip off the target.",
    },
  },
  {
    ask: {
      uz: "Topilmani qayd etishda arxiv nusxasi nima uchun?",
      en: "Why record an archived copy of a finding?",
    },
    right: {
      uz: "Asl sahifa o‘chsa ham dalil qoladi",
      en: "The evidence survives if the page is deleted",
    },
    wrong: [
      { uz: "Chiroyli ko‘rinishi uchun", en: "For looks" },
      { uz: "Kerak emas", en: "It isn’t needed" },
      { uz: "Saytni tezlashtirish uchun", en: "To speed up the site" },
    ],
    explain: { uz: "Boshqalar tekshira oladi.", en: "Others can check it." },
  },
];

export const SEARCH_POOL: PoolItem[] = [
  {
    ask: {
      uz: "Qidiruv tizimi nimani ko‘rsatadi?",
      en: "What does a search engine show?",
    },
    right: {
      uz: "Faqat o‘zi indekslagan sahifalarni",
      en: "Only the pages it has indexed",
    },
    wrong: [
      { uz: "Butun internetni", en: "The whole internet" },
      { uz: "Login ortidagi sahifalarni", en: "Pages behind logins" },
      { uz: "Faqat yangi sahifalarni", en: "Only new pages" },
    ],
    explain: {
      uz: "Indekslanmagan — topilmaydi.",
      en: "Not indexed, not found.",
    },
  },
  {
    ask: {
      uz: "robots.txt papkani himoya qiladimi?",
      en: "Does robots.txt protect a folder?",
    },
    right: {
      uz: "Yo‘q — bu robotlarga iltimos",
      en: "No — it is a request to crawlers",
    },
    wrong: [
      { uz: "Ha, parol qo‘yadi", en: "Yes, with a password" },
      { uz: "Ha, shifrlaydi", en: "Yes, it encrypts" },
      { uz: "Ha, o‘chiradi", en: "Yes, it deletes it" },
    ],
    explain: { uz: "Hamma o‘qiy oladi.", en: "Anyone can read it." },
  },
  {
    ask: { uz: "site: operatori nima qiladi?", en: "What does site: do?" },
    right: {
      uz: "Qidiruvni bitta domen va subdomenlariga cheklaydi",
      en: "Limits results to one domain and its subdomains",
    },
    wrong: [
      { uz: "Saytni bloklaydi", en: "Blocks a site" },
      { uz: "Sahifa sarlavhasini qidiradi", en: "Searches titles" },
      { uz: "Fayl turini tanlaydi", en: "Picks a file type" },
    ],
    explain: {
      uz: "site:sarbon-logistics.example",
      en: "site:sarbon-logistics.example",
    },
  },
  {
    ask: { uz: "filetype:pdf nima qiladi?", en: "What does filetype:pdf do?" },
    right: { uz: "Faqat PDF fayllarni qoldiradi", en: "Keeps only PDF files" },
    wrong: [
      { uz: "PDF’ni o‘chiradi", en: "Removes PDFs" },
      { uz: "PDF yaratadi", en: "Creates a PDF" },
      { uz: "Sarlavhada “pdf” qidiradi", en: "Looks for “pdf” in titles" },
    ],
    explain: { uz: "ext: ham xuddi shunday.", en: "ext: works the same way." },
  },
  {
    ask: { uz: "intitle: nima qiladi?", en: "What does intitle: do?" },
    right: {
      uz: "So‘z sahifa sarlavhasida bo‘lishini talab qiladi",
      en: "Requires the word in the page title",
    },
    wrong: [
      { uz: "Domenni cheklaydi", en: "Limits the domain" },
      { uz: "So‘zni chiqarib tashlaydi", en: "Excludes the word" },
      { uz: "Fayl turini tanlaydi", en: "Picks a file type" },
    ],
    explain: {
      uz: "“Index of” sarlavhasi — ochiq papka belgisi.",
      en: "An “Index of” title often means an open folder.",
    },
  },
  {
    ask: {
      uz: "Qo‘shtirnoq ichidagi ibora nimani bildiradi?",
      en: "What do quotes around a phrase mean?",
    },
    right: {
      uz: "Aynan shu ibora, shu tartibda",
      en: "This exact phrase, in this order",
    },
    wrong: [
      { uz: "Har qanday so‘z", en: "Any of the words" },
      { uz: "Iborani chiqarib tashlash", en: "Exclude the phrase" },
      { uz: "Iborani tarjima qilish", en: "Translate it" },
    ],
    explain: { uz: '"price list"', en: '"price list"' },
  },
  {
    ask: { uz: "-draft nima qiladi?", en: "What does -draft do?" },
    right: {
      uz: "“draft” bor natijalarni olib tashlaydi",
      en: "Drops results containing “draft”",
    },
    wrong: [
      { uz: "Faqat qoralamalarni qoldiradi", en: "Keeps only drafts" },
      { uz: "Sonni ayiradi", en: "Subtracts a number" },
      { uz: "Saralaydi", en: "Sorts results" },
    ],
    explain: { uz: "Minus — istisno.", en: "Minus means exclude." },
  },
  {
    ask: {
      uz: "Operatorlarni birlashtirib qidirish nima deyiladi?",
      en: "What is combining operators called?",
    },
    right: { uz: "Dorking", en: "Dorking" },
    wrong: [
      { uz: "Phishing", en: "Phishing" },
      { uz: "Spoofing", en: "Spoofing" },
      { uz: "Fuzzing", en: "Fuzzing" },
    ],
    explain: {
      uz: "GHDB — tayyor so‘rovlar to‘plami.",
      en: "GHDB collects ready-made dorks.",
    },
  },
  {
    ask: {
      uz: "Ruxsat etilgan tekshiruvda maxfiy fayl topildi. Nima qilasiz?",
      en: "An authorised check turns up a confidential file. What now?",
    },
    right: {
      uz: "Manzil va vaqtni yozib, mijozga darhol xabar beraman",
      en: "Record the address and time, tell the client at once",
    },
    wrong: [
      { uz: "Yuklab, tarqataman", en: "Download and share it" },
      { uz: "Ijtimoiy tarmoqda e’lon qilaman", en: "Post it online" },
      { uz: "Hech narsa qilmayman", en: "Do nothing" },
    ],
    explain: { uz: "Zarar keltirmang.", en: "Do no harm." },
  },
  {
    ask: {
      uz: "web.archive.org/web/20190704…/ nusxasi qachongi?",
      en: "When is a web.archive.org/web/20190704…/ copy from?",
    },
    right: { uz: "2019-yil 4-iyul", en: "4 July 2019" },
    wrong: [
      { uz: "2020-yil 7-aprel", en: "7 April 2020" },
      { uz: "Bugun", en: "Today" },
      { uz: "Noma’lum", en: "Unknown" },
    ],
    explain: { uz: "YYYYMMDD…", en: "YYYYMMDD…" },
  },
  {
    ask: {
      uz: "O‘chirilgan sahifani qayerdan topish mumkin?",
      en: "Where might a deleted page still be?",
    },
    right: { uz: "Veb-arxivlarda", en: "In web archives" },
    wrong: [
      { uz: "Hech qayerda", en: "Nowhere" },
      { uz: "Faqat kompaniya serverida", en: "Only on the company server" },
      { uz: "DNS’da", en: "In DNS" },
    ],
    explain: {
      uz: "Wayback Machine, archive.today.",
      en: "The Wayback Machine, archive.today.",
    },
  },
  {
    ask: { uz: "Qaysi biri kuchli manba?", en: "Which is a strong source?" },
    right: { uz: "Davlat reyestri", en: "The government register" },
    wrong: [
      { uz: "Anonim forum posti", en: "An anonymous forum post" },
      { uz: "Manbasiz skrinshot", en: "An unsourced screenshot" },
      { uz: "“Bir tanish aytdi”", en: "“A friend said”" },
    ],
    explain: { uz: "Birlamchi, rasmiy.", en: "Primary and official." },
  },
  {
    ask: {
      uz: "Beshta sayt bitta press-relizni qayta yozdi. Necha mustaqil manba?",
      en: "Five sites rewrote one press release. How many independent sources?",
    },
    right: { uz: "1", en: "1" },
    wrong: [
      { uz: "5", en: "5" },
      { uz: "6", en: "6" },
      { uz: "0", en: "0" },
    ],
    explain: { uz: "Hammasi bir joydan.", en: "All from one origin." },
  },
  {
    ask: {
      uz: "Tasdiqlash tuzog‘i nima?",
      en: "What is the confirmation trap?",
    },
    right: {
      uz: "Faqat taxminni tasdiqlaydigan dalilni qidirish",
      en: "Looking only for evidence that backs your guess",
    },
    wrong: [
      { uz: "Parolni tasdiqlash", en: "Confirming a password" },
      { uz: "Email tasdiqlash", en: "Confirming an email" },
      { uz: "Ikki manba bilan tekshirish", en: "Checking with two sources" },
    ],
    explain: {
      uz: "Qarshi dalilni ataylab qidiring.",
      en: "Seek the counter-evidence on purpose.",
    },
  },
  {
    ask: {
      uz: "O‘zbek kompaniyasi nomini qaysi yozuvlarda qidirish kerak?",
      en: "Which spellings for an Uzbek company’s name?",
    },
    right: {
      uz: "Lotin, kirill va inglizcha",
      en: "Latin, Cyrillic and English",
    },
    wrong: [
      { uz: "Faqat inglizcha", en: "English only" },
      { uz: "Faqat lotin", en: "Latin only" },
      { uz: "Faqat kirill", en: "Cyrillic only" },
    ],
    explain: {
      uz: "Eski hujjatlar ko‘pincha kirillda.",
      en: "Older records are often Cyrillic.",
    },
  },
];

export const INFRA_POOL: PoolItem[] = [
  {
    ask: { uz: "WHOIS nimani ko‘rsatadi?", en: "What does WHOIS show?" },
    right: {
      uz: "Registrator, sanalar va nom serverlari",
      en: "The registrar, dates and name servers",
    },
    wrong: [
      { uz: "Saytning paroli", en: "The site’s password" },
      { uz: "Ochiq portlar", en: "Open ports" },
      { uz: "Xodimlar ro‘yxati", en: "The staff list" },
    ],
    explain: {
      uz: "Egasi ko‘pincha yashirilgan.",
      en: "The owner is usually redacted.",
    },
  },
  {
    ask: {
      uz: "WHOIS’ning zamonaviy o‘rinbosari?",
      en: "WHOIS’s modern successor?",
    },
    right: { uz: "RDAP", en: "RDAP" },
    wrong: [
      { uz: "SNMP", en: "SNMP" },
      { uz: "LDAP", en: "LDAP" },
      { uz: "SMTP", en: "SMTP" },
    ],
    explain: { uz: "JSON shaklida javob beradi.", en: "It answers in JSON." },
  },
  {
    ask: {
      uz: "3 kun oldin ochilgan “bank” domeni?",
      en: "A “bank” domain created three days ago?",
    },
    right: { uz: "Shubhali belgi", en: "A warning sign" },
    wrong: [
      { uz: "Ishonch belgisi", en: "A sign of trust" },
      { uz: "Ahamiyatsiz", en: "Meaningless" },
      { uz: "Rasmiy domen", en: "An official domain" },
    ],
    explain: {
      uz: "Fishing domenlari odatda yangi.",
      en: "Phishing domains are usually new.",
    },
  },
  {
    ask: {
      uz: "Qaysi yozuv pochta serverini ko‘rsatadi?",
      en: "Which record names the mail server?",
    },
    right: { uz: "MX", en: "MX" },
    wrong: [
      { uz: "A", en: "A" },
      { uz: "NS", en: "NS" },
      { uz: "CNAME", en: "CNAME" },
    ],
    explain: { uz: "Mail eXchanger.", en: "Mail eXchanger." },
  },
  {
    ask: { uz: "A yozuvi nimani beradi?", en: "What does an A record give?" },
    right: { uz: "IPv4 manzil", en: "An IPv4 address" },
    wrong: [
      { uz: "Pochta serveri", en: "The mail server" },
      { uz: "Taxallus", en: "An alias" },
      { uz: "Domen egasi", en: "The owner" },
    ],
    explain: { uz: "AAAA — IPv6.", en: "AAAA is IPv6." },
  },
  {
    ask: { uz: "CNAME nima?", en: "What is a CNAME?" },
    right: { uz: "Boshqa nomga taxallus", en: "An alias to another name" },
    wrong: [
      { uz: "IP manzil", en: "An IP address" },
      { uz: "Pochta yozuvi", en: "A mail record" },
      { uz: "Sertifikat", en: "A certificate" },
    ],
    explain: {
      uz: "Ko‘pincha bulut xizmatiga ishora qiladi.",
      en: "Often points at a cloud service.",
    },
  },
  {
    ask: {
      uz: "“google-site-verification” TXT yozuvi nimani bildiradi?",
      en: "What does a “google-site-verification” TXT record show?",
    },
    right: {
      uz: "Domen Google xizmatida tasdiqlangan",
      en: "The domain is verified with a Google service",
    },
    wrong: [
      { uz: "Sayt buzilgan", en: "The site is hacked" },
      { uz: "Pochta Microsoft’da", en: "Mail is on Microsoft" },
      { uz: "Hech narsa", en: "Nothing" },
    ],
    explain: {
      uz: "Tasdiqlash kodlari xizmatlarni ko‘rsatadi.",
      en: "Verification codes reveal services.",
    },
  },
  {
    ask: {
      uz: "SPF’da include:_spf.google.com bor. Pochta qayerda?",
      en: "SPF has include:_spf.google.com. Where is mail?",
    },
    right: { uz: "Google Workspace", en: "Google Workspace" },
    wrong: [
      { uz: "Microsoft 365", en: "Microsoft 365" },
      { uz: "O‘z serverida", en: "Self-hosted" },
      { uz: "Noma’lum", en: "Unknown" },
    ],
    explain: { uz: "MX ham shuni tasdiqlaydi.", en: "The MX confirms it." },
  },
  {
    ask: {
      uz: "CNAME NXDOMAIN’ga ishora qilsa, xavf?",
      en: "A CNAME pointing at NXDOMAIN: the risk?",
    },
    right: { uz: "Subdomain takeover", en: "Subdomain takeover" },
    wrong: [
      { uz: "DDoS", en: "DDoS" },
      { uz: "SQL injection", en: "SQL injection" },
      { uz: "Xavf yo‘q", en: "None" },
    ],
    explain: {
      uz: "Nomni boshqasi egallashi mumkin.",
      en: "Someone else could claim the name.",
    },
  },
  {
    ask: {
      uz: "Subdomenlarni passiv topishning eng yaxshi manbai?",
      en: "The best passive source of subdomains?",
    },
    right: {
      uz: "Sertifikat jurnallari (crt.sh)",
      en: "Certificate logs (crt.sh)",
    },
    wrong: [
      { uz: "Port skanerlash", en: "A port scan" },
      { uz: "Xodimga qo‘ng‘iroq", en: "Phoning staff" },
      { uz: "Brute force", en: "Brute force" },
    ],
    explain: {
      uz: "Har bir sertifikat nomlarini ochiq yozadi.",
      en: "Every certificate lists its names.",
    },
  },
  {
    ask: {
      uz: "CT jurnalidagi *.domen nomi nimani bildiradi?",
      en: "What does a *.domain name in a CT log tell you?",
    },
    right: {
      uz: "Wildcard sertifikat — aniq subdomen emas",
      en: "A wildcard certificate — no specific subdomain",
    },
    wrong: [
      { uz: "Barcha subdomenlar ro‘yxati", en: "A list of all subdomains" },
      { uz: "Xato", en: "An error" },
      { uz: "Yashirin server", en: "A hidden server" },
    ],
    explain: { uz: "Ro‘yxatdan chiqariladi.", en: "Leave it out of the list." },
  },
  {
    ask: {
      uz: "Internetga ochiq jenkins.* nega xavfli?",
      en: "Why is an internet-facing jenkins.* risky?",
    },
    right: {
      uz: "CI serveri kod, kalit va serverlarga yo‘l ochishi mumkin",
      en: "A CI server can lead to code, keys and servers",
    },
    wrong: [
      { uz: "Xavfli emas", en: "It isn’t" },
      { uz: "Sayt sekinlashadi", en: "The site slows" },
      { uz: "Pochta to‘xtaydi", en: "Mail stops" },
    ],
    explain: {
      uz: "U VPN ortida bo‘lishi kerak.",
      en: "It belongs behind the VPN.",
    },
  },
  {
    ask: {
      uz: "Shodan’da qidirish passivmi?",
      en: "Is searching Shodan passive?",
    },
    right: {
      uz: "Ha — Shodan yig‘gan ma’lumotni o‘qiysiz",
      en: "Yes — you read what Shodan collected",
    },
    wrong: [
      { uz: "Yo‘q, bu skanerlash", en: "No, it is scanning" },
      { uz: "Noqonuniy", en: "It is illegal" },
      { uz: "Faqat tunda", en: "Only at night" },
    ],
    explain: {
      uz: "Topilgan xizmatga ulanish — faol.",
      en: "Connecting to what you find is active.",
    },
  },
  {
    ask: { uz: "ASN nimani bildiradi?", en: "What does an ASN tell you?" },
    right: {
      uz: "IP qaysi tarmoq va tashkilotga tegishli",
      en: "Which network and organisation an IP belongs to",
    },
    wrong: [
      { uz: "Domen paroli", en: "A domain password" },
      { uz: "Domen tugash sanasi", en: "A domain’s expiry" },
      { uz: "Port raqami", en: "A port number" },
    ],
    explain: {
      uz: "Autonomous System Number.",
      en: "Autonomous System Number.",
    },
  },
  {
    ask: {
      uz: "shop.* Shopify’ga CNAME. Uni faol tekshirish uchun kimning ruxsati kerak?",
      en: "shop.* is a CNAME to Shopify. Whose permission does active testing need?",
    },
    right: { uz: "Shopify qoidalari ham", en: "Shopify’s rules too" },
    wrong: [
      { uz: "Faqat mijozniki", en: "The client’s only" },
      { uz: "Hech kimniki", en: "Nobody’s" },
      { uz: "Registratorniki", en: "The registrar’s" },
    ],
    explain: {
      uz: "Serverlar Shopify’niki.",
      en: "The servers are Shopify’s.",
    },
  },
];

export const GEO_POOL: PoolItem[] = [
  {
    ask: {
      uz: "Teskari rasm qidiruvi nima?",
      en: "What is a reverse image search?",
    },
    right: {
      uz: "Rasmning o‘zini yuborib, o‘xshashlarini topish",
      en: "Sending the image itself to find similar ones",
    },
    wrong: [
      { uz: "Rasmni teskari aylantirish", en: "Flipping the image" },
      { uz: "Rasmni o‘chirish", en: "Deleting it" },
      { uz: "Rasmni shifrlash", en: "Encrypting it" },
    ],
    explain: {
      uz: "Google Lens, Bing, Yandex, TinEye.",
      en: "Google Lens, Bing, Yandex, TinEye.",
    },
  },
  {
    ask: {
      uz: "Eng eski nusxani topishga qaysi vosita qulay?",
      en: "Which tool helps find the oldest copy?",
    },
    right: { uz: "TinEye", en: "TinEye" },
    wrong: [
      { uz: "nmap", en: "nmap" },
      { uz: "Wireshark", en: "Wireshark" },
      { uz: "dig", en: "dig" },
    ],
    explain: {
      uz: "Natijalarni sana bo‘yicha saralaydi.",
      en: "It sorts matches by date.",
    },
  },
  {
    ask: {
      uz: "Butun rasm hech narsa topmadi. Keyin?",
      en: "The whole image found nothing. Then?",
    },
    right: {
      uz: "O‘ziga xos qismini kesib qidirish",
      en: "Crop a distinctive detail and search that",
    },
    wrong: [
      { uz: "To‘xtash", en: "Give up" },
      { uz: "Rasmni o‘chirish", en: "Delete it" },
      { uz: "Rangini o‘zgartirish", en: "Change its colours" },
    ],
    explain: {
      uz: "Bino yoki yozuv osonroq topiladi.",
      en: "A building or sign matches more easily.",
    },
  },
  {
    ask: {
      uz: "“Bugungi” rasmning eng eski nusxasi 2019-yilda chiqqan. Xulosa?",
      en: "The oldest copy of a “today” photo is from 2019. Conclusion?",
    },
    right: {
      uz: "Rasm eski, da’vo yolg‘on",
      en: "The photo is old; the claim is false",
    },
    wrong: [
      { uz: "Rasm bugungi", en: "It is from today" },
      { uz: "Aniqlab bo‘lmaydi", en: "Impossible to say" },
      { uz: "Rasm soxta emas, demak bugungi", en: "Not fake, so it’s today’s" },
    ],
    explain: {
      uz: "Bugungi rasm 2019-yilda chiqa olmaydi.",
      en: "Today’s photo can’t appear in 2019.",
    },
  },
  {
    ask: {
      uz: "Eng eski topilgan nusxa doim asl manbami?",
      en: "Is the oldest copy found always the original?",
    },
    right: {
      uz: "Ehtimoli yuqori, lekin kafolat emas",
      en: "Most likely, but not guaranteed",
    },
    wrong: [
      { uz: "Ha, doim", en: "Yes, always" },
      { uz: "Hech qachon", en: "Never" },
      { uz: "Faqat dushanba kuni", en: "Only on Mondays" },
    ],
    explain: {
      uz: "Eskirog‘i indekslanmagan bo‘lishi mumkin.",
      en: "An older one may not be indexed.",
    },
  },
  {
    ask: { uz: "Geolokatsiya nima?", en: "What is geolocation?" },
    right: {
      uz: "Rasm qayerda olinganini belgilardan aniqlash",
      en: "Working out where a photo was taken from its clues",
    },
    wrong: [
      { uz: "GPS qurilmasini o‘rnatish", en: "Installing a GPS unit" },
      { uz: "Xarita chizish", en: "Drawing a map" },
      { uz: "IP manzilni bloklash", en: "Blocking an IP" },
    ],
    explain: {
      uz: "Xronolokatsiya — qachonligini.",
      en: "Chronolocation is the when.",
    },
  },
  {
    ask: { uz: "Qaysi belgi eng kuchli?", en: "Which clue is strongest?" },
    right: { uz: "Ko‘cha nomi yozilgan lavha", en: "A street-name plate" },
    wrong: [
      { uz: "Bulutlar", en: "Clouds" },
      { uz: "Daraxtlar", en: "Trees" },
      { uz: "Osmon rangi", en: "The sky’s colour" },
    ],
    explain: {
      uz: "Yozuv joyni to‘g‘ridan-to‘g‘ri aytadi.",
      en: "Text names the place.",
    },
  },
  {
    ask: {
      uz: "O‘zbekiston raqamidagi 01 nimani bildiradi?",
      en: "What does 01 on an Uzbek plate mean?",
    },
    right: { uz: "Toshkent shahri", en: "The city of Tashkent" },
    wrong: [
      { uz: "Mashina yili", en: "The car’s year" },
      { uz: "Birinchi egasi", en: "The first owner" },
      { uz: "Rang kodi", en: "A colour code" },
    ],
    explain: {
      uz: "Har hududning o‘z kodi bor.",
      en: "Each region has its own code.",
    },
  },
  {
    ask: {
      uz: "Mashinalar o‘ng tomonda yuradi. Bu nimani chiqarib tashlaydi?",
      en: "Cars keep right. What does that rule out?",
    },
    right: {
      uz: "Chap tomonli davlatlarni (Buyuk Britaniya, Yaponiya)",
      en: "Left-driving countries (the UK, Japan)",
    },
    wrong: [
      { uz: "Hech narsani", en: "Nothing" },
      { uz: "Butun Osiyoni", en: "All of Asia" },
      { uz: "Faqat Toshkentni", en: "Only Tashkent" },
    ],
    explain: {
      uz: "Kuchsiz, lekin foydali belgi.",
      en: "A weak but useful clue.",
    },
  },
  {
    ask: {
      uz: "Ko‘k gumbaz bir o‘zi shaharni aytadimi?",
      en: "Does a blue dome alone name the city?",
    },
    right: {
      uz: "Yo‘q — faqat hududni toraytiradi",
      en: "No — it only narrows the region",
    },
    wrong: [
      { uz: "Ha, Toshkent", en: "Yes, Tashkent" },
      { uz: "Ha, Istanbul", en: "Yes, Istanbul" },
      { uz: "Ha, Boku", en: "Yes, Baku" },
    ],
    explain: {
      uz: "Samarqand yoki Buxoro ham bo‘lishi mumkin.",
      en: "It could be Samarkand or Bukhara.",
    },
  },
  {
    ask: {
      uz: "Toshkentda soya g‘arbga tushadi. Vaqt?",
      en: "In Tashkent, shadows point west. The time?",
    },
    right: { uz: "Ertalab", en: "Morning" },
    wrong: [
      { uz: "Kechqurun", en: "Evening" },
      { uz: "Tush", en: "Midday" },
      { uz: "Yarim tun", en: "Midnight" },
    ],
    explain: {
      uz: "Quyosh sharqda, soya teskari.",
      en: "Sun in the east, shadow opposite.",
    },
  },
  {
    ask: {
      uz: "Rasm vaqtini tekshirishga qaysi manba yordam beradi?",
      en: "Which source helps check when a photo was taken?",
    },
    right: { uz: "Ob-havo arxivi", en: "A weather archive" },
    wrong: [
      { uz: "WHOIS", en: "WHOIS" },
      { uz: "DNS", en: "DNS" },
      { uz: "Port skaneri", en: "A port scanner" },
    ],
    explain: {
      uz: "Qor yoki yomg‘ir bo‘lganini tasdiqlaydi.",
      en: "It confirms snow or rain.",
    },
  },
  {
    ask: {
      uz: "Telegram’dan olingan rasmda EXIF yo‘q. Bu?",
      en: "A photo from Telegram has no EXIF. That is?",
    },
    right: {
      uz: "Odatiy — tarmoq o‘chiradi",
      en: "Normal — the network strips it",
    },
    wrong: [
      { uz: "Soxtalik belgisi", en: "Proof of forgery" },
      { uz: "Shifrlash belgisi", en: "A sign of encryption" },
      { uz: "Virus belgisi", en: "A sign of a virus" },
    ],
    explain: {
      uz: "Yo‘qligi hech narsani isbotlamaydi.",
      en: "Its absence proves nothing.",
    },
  },
  {
    ask: {
      uz: "EXIF GPS Samarqand, rasmda Toshkent teleminorasi. Nimaga ishonasiz?",
      en: "EXIF GPS says Samarkand; the photo shows the Tashkent TV tower. Trust?",
    },
    right: { uz: "Ko‘rinadigan belgilarga", en: "The visible clues" },
    wrong: [
      { uz: "EXIF’ga", en: "The EXIF" },
      { uz: "Hech biriga", en: "Neither" },
      { uz: "Fayl nomiga", en: "The file name" },
    ],
    explain: { uz: "EXIF’ni tahrirlash oson.", en: "EXIF is easy to edit." },
  },
  {
    ask: {
      uz: "Birov ijtimoiy tarmoqdagi odamning uyini topishni so‘radi. Nima qilasiz?",
      en: "Someone asks you to find where a person on social media lives. What do you do?",
    },
    right: { uz: "Rad etaman", en: "Refuse" },
    wrong: [
      { uz: "Topib beraman", en: "Find it" },
      { uz: "Pulga topib beraman", en: "Find it for a fee" },
      { uz: "Topib, e’lon qilaman", en: "Find it and post it" },
    ],
    explain: {
      uz: "Bu ta’qibga yordam berish.",
      en: "It would help a stalker.",
    },
  },
];

export const FOOTPRINT_POOL: PoolItem[] = [
  {
    ask: { uz: "Raqamli iz nima?", en: "What is a digital footprint?" },
    right: {
      uz: "Internetda siz haqingizda qolgan hamma narsa",
      en: "Everything about you left online",
    },
    wrong: [
      { uz: "Faqat parollaringiz", en: "Only your passwords" },
      { uz: "Kompyuter xotirasi", en: "Your computer’s memory" },
      { uz: "Brauzer tarixi, xolos", en: "Just your browser history" },
    ],
    explain: { uz: "Faol va passiv izlar.", en: "Active and passive traces." },
  },
  {
    ask: { uz: "Qaysi biri passiv iz?", en: "Which is a passive trace?" },
    right: {
      uz: "Do‘st sizni belgilagan surat",
      en: "A photo a friend tagged you in",
    },
    wrong: [
      { uz: "Postingiz", en: "Your post" },
      { uz: "Izohingiz", en: "Your comment" },
      { uz: "Profilingiz", en: "Your profile" },
    ],
    explain: { uz: "Siz joylamagansiz.", en: "You didn’t post it." },
  },
  {
    ask: {
      uz: "Hamma joyda bir xil foydalanuvchi nomi nega xavfli?",
      en: "Why is one username everywhere risky?",
    },
    right: {
      uz: "Barcha akkauntlar bir odamga bog‘lanadi",
      en: "All accounts link to one person",
    },
    wrong: [
      { uz: "Xavfli emas", en: "It isn’t" },
      { uz: "Saytlar sekinlashadi", en: "Sites slow down" },
      { uz: "Parol buziladi", en: "The password breaks" },
    ],
    explain: {
      uz: "Sherlock buni bir zumda topadi.",
      en: "Sherlock finds it in moments.",
    },
  },
  {
    ask: {
      uz: "Bitta nomni ko‘p saytda tekshiradigan vosita?",
      en: "A tool that checks one handle across many sites?",
    },
    right: { uz: "Sherlock", en: "Sherlock" },
    wrong: [
      { uz: "nmap", en: "nmap" },
      { uz: "dig", en: "dig" },
      { uz: "binwalk", en: "binwalk" },
    ],
    explain: { uz: "WhatsMyName ham.", en: "WhatsMyName too." },
  },
  {
    ask: {
      uz: "Har kungi bir xil geoteg nimani oshkor qiladi?",
      en: "What does the same geotag every day reveal?",
    },
    right: {
      uz: "Kundalik yo‘l va joyingizni",
      en: "Your daily route and whereabouts",
    },
    wrong: [
      { uz: "Hech narsani", en: "Nothing" },
      { uz: "Ob-havoni", en: "The weather" },
      { uz: "Telefon modelini", en: "Your phone model" },
    ],
    explain: {
      uz: "Profilni yoping, geotegni o‘chiring.",
      en: "Go private, remove geotags.",
    },
  },
  {
    ask: {
      uz: "Ochiq Telegram guruhida raqamingiz ko‘rinadi. Nima qilasiz?",
      en: "Your number shows in a public Telegram group. What do you do?",
    },
    right: {
      uz: "Maxfiylik sozlamasida “Hech kim” qilaman",
      en: "Set it to “Nobody” in privacy settings",
    },
    wrong: [
      { uz: "Hech narsa", en: "Nothing" },
      { uz: "Guruhga ko‘proq yozaman", en: "Post more in the group" },
      { uz: "Raqamni hammaga yuboraman", en: "Send the number to everyone" },
    ],
    explain: {
      uz: "Raqam firibgarlikka yo‘l ochadi.",
      en: "A number invites scams.",
    },
  },
  {
    ask: {
      uz: "Emailingiz sizib chiqishda. Birinchi qadam?",
      en: "Your email is in a breach. The first step?",
    },
    right: {
      uz: "O‘sha parolni hamma joyda almashtirish va 2FA",
      en: "Change that password everywhere and add 2FA",
    },
    wrong: [
      { uz: "Emailni o‘chirish", en: "Delete the email account" },
      { uz: "Hech narsa", en: "Nothing" },
      { uz: "Kompyuterni almashtirish", en: "Replace the computer" },
    ],
    explain: {
      uz: "Hujumchi aynan shu parolni sinaydi.",
      en: "Attackers try exactly that password.",
    },
  },
  {
    ask: {
      uz: "Sizib chiqishlarni tekshiradigan sayt?",
      en: "A site that checks for breaches?",
    },
    right: { uz: "haveibeenpwned.com", en: "haveibeenpwned.com" },
    wrong: [
      { uz: "crt.sh", en: "crt.sh" },
      { uz: "web.archive.org", en: "web.archive.org" },
      { uz: "shodan.io", en: "shodan.io" },
    ],
    explain: { uz: "Email bo‘yicha qidiradi.", en: "It searches by email." },
  },
  {
    ask: {
      uz: "Credential stuffing nima?",
      en: "What is credential stuffing?",
    },
    right: {
      uz: "Sizib chiqqan parollarni boshqa saytlarda sinash",
      en: "Trying leaked passwords on other sites",
    },
    wrong: [
      { uz: "Parolni unutish", en: "Forgetting a password" },
      { uz: "Kuchli parol yaratish", en: "Making a strong password" },
      { uz: "Cookie tozalash", en: "Clearing cookies" },
    ],
    explain: {
      uz: "Takroriy parol — ochiq eshik.",
      en: "A reused password is an open door.",
    },
  },
  {
    ask: {
      uz: "Har sayt uchun alohida parolni nima eslab qoladi?",
      en: "What remembers a separate password per site?",
    },
    right: { uz: "Parol menejeri", en: "A password manager" },
    wrong: [
      { uz: "Qog‘ozdagi ro‘yxat ish stolida", en: "A note on your desk" },
      { uz: "Brauzer tarixi", en: "Browser history" },
      { uz: "Hech narsa", en: "Nothing" },
    ],
    explain: { uz: "Uzun, tasodifiy parollar.", en: "Long random passwords." },
  },
  {
    ask: {
      uz: "Qaysi sozlama to‘g‘ri?",
      en: "Which setting is already right?",
    },
    right: {
      uz: "Ikki bosqichli tasdiq yoqilgan",
      en: "Two-step verification on",
    },
    wrong: [
      { uz: "Kamerada joylashuv saqlanadi", en: "Camera saves location" },
      { uz: "Raqam “Hamma”ga ko‘rinadi", en: "Number visible to “Everybody”" },
      { uz: "Do‘stlar ro‘yxati ochiq", en: "Friends list public" },
    ],
    explain: {
      uz: "Qolganlari o‘zgartiriladi.",
      en: "The others need changing.",
    },
  },
  {
    ask: {
      uz: "Eski forumdagi raqamingizni o‘chira olmaysiz. Nima qilasiz?",
      en: "You can’t remove your number from an old forum. What do you do?",
    },
    right: {
      uz: "Administratorga o‘chirish so‘rovi",
      en: "Send the administrator a removal request",
    },
    wrong: [
      { uz: "Forumni buzish", en: "Hack the forum" },
      { uz: "Hech narsa", en: "Nothing" },
      { uz: "Yangi akkaunt ochish", en: "Open a new account" },
    ],
    explain: {
      uz: "Qonun o‘chirishni so‘rash huquqini beradi.",
      en: "The law lets you ask.",
    },
  },
  {
    ask: {
      uz: "O‘chirilgan post butunlay yo‘qmi?",
      en: "Is a deleted post gone for good?",
    },
    right: {
      uz: "Shart emas — arxiv yoki skrinshot qolishi mumkin",
      en: "Not necessarily — archives or screenshots may remain",
    },
    wrong: [
      { uz: "Ha, butunlay", en: "Yes, completely" },
      { uz: "Faqat bir kunga", en: "Only for a day" },
      { uz: "Faqat telefonda", en: "Only on phones" },
    ],
    explain: { uz: "Joylashdan oldin o‘ylang.", en: "Think before posting." },
  },
  {
    ask: { uz: "Qaysi iz qolsa bo‘ladi?", en: "Which trace can stay?" },
    right: {
      uz: "Maktab saytidagi olimpiada yutug‘i",
      en: "A school-site note about an olympiad win",
    },
    wrong: [
      { uz: "Ochiq telefon raqami", en: "A public phone number" },
      { uz: "Uy manzili bilan rezyume", en: "A CV with a home address" },
      { uz: "Har kungi geoteg", en: "A daily geotag" },
    ],
    explain: {
      uz: "Sizni topishga yordam bermaydi.",
      en: "It doesn’t help anyone find you.",
    },
  },
  {
    ask: {
      uz: "O‘zingizni qanchalik tez-tez qidirish kerak?",
      en: "How often should you search yourself?",
    },
    right: { uz: "Har 6 oyda", en: "Every six months" },
    wrong: [
      { uz: "Hech qachon", en: "Never" },
      { uz: "Bir marta", en: "Once" },
      { uz: "Har 10 yilda", en: "Every ten years" },
    ],
    explain: { uz: "Iz doim o‘sadi.", en: "A footprint keeps growing." },
  },
];

export const STRIDE_POOL: PoolItem[] = [
  {
    ask: { uz: "Tahdid modeli nima?", en: "What is threat modelling?" },
    right: {
      uz: "Qurishdan oldin nima noto‘g‘ri ketishi mumkinligini aniqlash",
      en: "Working out what can go wrong before it is built",
    },
    wrong: [
      { uz: "Hujumdan keyingi tergov", en: "Investigating after an attack" },
      { uz: "Parol siyosati", en: "A password policy" },
      { uz: "Antivirus sozlash", en: "Configuring antivirus" },
    ],
    explain: { uz: "Erta topilgan xato arzon.", en: "Early flaws are cheap." },
  },
  {
    ask: {
      uz: "To‘rt savolning birinchisi?",
      en: "The first of the four questions?",
    },
    right: { uz: "Biz nima qurayapmiz?", en: "What are we working on?" },
    wrong: [
      { uz: "Kim aybdor?", en: "Who is to blame?" },
      { uz: "Qancha turadi?", en: "What does it cost?" },
      { uz: "Qachon tugaydi?", en: "When is it done?" },
    ],
    explain: {
      uz: "Keyin: nima noto‘g‘ri ketishi mumkin?",
      en: "Then: what can go wrong?",
    },
  },
  {
    ask: {
      uz: "DFD’da sizning kodingiz qaysi element?",
      en: "In a DFD, which element is your code?",
    },
    right: { uz: "Jarayon", en: "A process" },
    wrong: [
      { uz: "Ombor", en: "A data store" },
      { uz: "Tashqi obyekt", en: "An external entity" },
      { uz: "Chegara", en: "A boundary" },
    ],
    explain: { uz: "Ma’lumotni qayta ishlaydi.", en: "It handles data." },
  },
  {
    ask: {
      uz: "DFD’da SMS provayderi qaysi element?",
      en: "In a DFD, which element is an SMS provider?",
    },
    right: { uz: "Tashqi obyekt", en: "An external entity" },
    wrong: [
      { uz: "Jarayon", en: "A process" },
      { uz: "Ombor", en: "A data store" },
      { uz: "Oqim", en: "A data flow" },
    ],
    explain: {
      uz: "Sizning nazoratingizdan tashqarida.",
      en: "Outside your control.",
    },
  },
  {
    ask: { uz: "Ishonch chegarasi nima?", en: "What is a trust boundary?" },
    right: {
      uz: "Ma’lumot bir ishonch darajasidan boshqasiga o‘tadigan joy",
      en: "Where data passes between levels of trust",
    },
    wrong: [
      { uz: "Sahifa chekkasi", en: "The edge of a page" },
      { uz: "Parol uzunligi", en: "A password length" },
      { uz: "Server xonasi", en: "The server room" },
    ],
    explain: { uz: "Hujumlar shu yerda.", en: "Attacks happen there." },
  },
  {
    ask: {
      uz: "Qaysi oqim ishonch chegarasini kesib o‘tadi?",
      en: "Which flow crosses a trust boundary?",
    },
    right: {
      uz: "Brauzer → DMZ’dagi veb-ilova",
      en: "Browser → the web app in the DMZ",
    },
    wrong: [
      { uz: "Ichki API → ichki baza", en: "Internal API → internal database" },
      {
        uz: "Ichki API → ichki log serveri",
        en: "Internal API → internal log server",
      },
      { uz: "Hech qaysi", en: "None" },
    ],
    explain: {
      uz: "Internetdan DMZ’ga.",
      en: "From the internet into the DMZ.",
    },
  },
  {
    ask: {
      uz: "Spoofing qaysi xususiyatni buzadi?",
      en: "Which property does spoofing break?",
    },
    right: { uz: "Autentifikatsiya", en: "Authentication" },
    wrong: [
      { uz: "Mavjudlik", en: "Availability" },
      { uz: "Yaxlitlik", en: "Integrity" },
      { uz: "Maxfiylik", en: "Confidentiality" },
    ],
    explain: {
      uz: "Kimdir o‘zini boshqa odam deb ko‘rsatadi.",
      en: "Someone pretends to be someone else.",
    },
  },
  {
    ask: {
      uz: "Tampering qaysi xususiyatni buzadi?",
      en: "Which property does tampering break?",
    },
    right: { uz: "Yaxlitlik", en: "Integrity" },
    wrong: [
      { uz: "Mavjudlik", en: "Availability" },
      { uz: "Autentifikatsiya", en: "Authentication" },
      { uz: "Maxfiylik", en: "Confidentiality" },
    ],
    explain: { uz: "Ma’lumot o‘zgartiriladi.", en: "Data is changed." },
  },
  {
    ask: {
      uz: "“O‘qituvchi bahoni o‘zgartirganini inkor qiladi, log yo‘q” — STRIDE harfi?",
      en: "“A teacher denies changing a grade, no log” — STRIDE letter?",
    },
    right: { uz: "R", en: "R" },
    wrong: [
      { uz: "S", en: "S" },
      { uz: "D", en: "D" },
      { uz: "I", en: "I" },
    ],
    explain: { uz: "Repudiation.", en: "Repudiation." },
  },
  {
    ask: {
      uz: "“API barcha telefon raqamlarini qaytaradi” — STRIDE harfi?",
      en: "“The API returns every phone number” — STRIDE letter?",
    },
    right: { uz: "I", en: "I" },
    wrong: [
      { uz: "T", en: "T" },
      { uz: "E", en: "E" },
      { uz: "S", en: "S" },
    ],
    explain: { uz: "Information disclosure.", en: "Information disclosure." },
  },
  {
    ask: {
      uz: "“O‘quvchi admin API’ni chaqira oladi” — STRIDE harfi?",
      en: "“A student can call the admin API” — STRIDE letter?",
    },
    right: { uz: "E", en: "E" },
    wrong: [
      { uz: "D", en: "D" },
      { uz: "R", en: "R" },
      { uz: "T", en: "T" },
    ],
    explain: { uz: "Elevation of privilege.", en: "Elevation of privilege." },
  },
  {
    ask: {
      uz: "Denial of service’ga qarshi odatiy chora?",
      en: "A typical control for denial of service?",
    },
    right: { uz: "Rate limiting", en: "Rate limiting" },
    wrong: [
      { uz: "Audit log", en: "An audit log" },
      { uz: "MFA", en: "MFA" },
      { uz: "Shifrlash", en: "Encryption" },
    ],
    explain: { uz: "So‘rovlar soni cheklanadi.", en: "Requests are capped." },
  },
  {
    ask: {
      uz: "Spoofing’ga qarshi odatiy chora?",
      en: "A typical control for spoofing?",
    },
    right: { uz: "MFA", en: "MFA" },
    wrong: [
      { uz: "Rate limiting", en: "Rate limiting" },
      { uz: "Kesh", en: "Caching" },
      { uz: "Siqish", en: "Compression" },
    ],
    explain: {
      uz: "Parol o‘g‘irlansa ham kira olmaydi.",
      en: "A stolen password isn’t enough.",
    },
  },
  {
    ask: {
      uz: "Xavf kichik, tuzatish qimmat. To‘g‘ri yo‘l?",
      en: "Small risk, expensive fix. The right move?",
    },
    right: {
      uz: "Qabul qilib, sababi va qayta ko‘rish sanasini yozish",
      en: "Accept it, writing down why and when to review",
    },
    wrong: [
      { uz: "Unutish", en: "Forget it" },
      { uz: "Yashirish", en: "Hide it" },
      { uz: "Loyihani to‘xtatish", en: "Stop the project" },
    ],
    explain: {
      uz: "Qabul qilish — ongli qaror.",
      en: "Accepting is a decision.",
    },
  },
  {
    ask: { uz: "Xavf qanday baholanadi?", en: "How is risk rated?" },
    right: { uz: "Ehtimollik × ta’sir", en: "Likelihood × impact" },
    wrong: [
      { uz: "Faqat ta’sir", en: "Impact only" },
      { uz: "Kod qatorlari soni", en: "Lines of code" },
      { uz: "Tasodifiy", en: "At random" },
    ],
    explain: {
      uz: "DREAD yoki CVSS kabi shkalalar ham bor.",
      en: "Scales such as DREAD or CVSS help.",
    },
  },
];

export const SECURECODE_POOL: PoolItem[] = [
  {
    ask: {
      uz: "Qaysi ma’lumotga tekshirmasdan ishonish mumkin emas?",
      en: "Which data must never be trusted without checking?",
    },
    right: {
      uz: "Brauzerdan kelgan hamma narsa: forma, URL, cookie, sarlavha",
      en: "Anything from the browser: form, URL, cookie, header",
    },
    wrong: [
      { uz: "Faqat forma maydonlari", en: "Only form fields" },
      { uz: "Faqat fayl yuklashlar", en: "Only file uploads" },
      {
        uz: "Hech biriga, HTTPS bo‘lsa",
        en: "None of it, if HTTPS is used",
      },
    ],
    explain: {
      uz: "HTTPS yo‘lni himoyalaydi, mazmunni emas.",
      en: "HTTPS protects the channel, not the content.",
    },
  },
  {
    ask: {
      uz: "Nega taqiq ro‘yxati (denylist) zaif?",
      en: "Why is a denylist weak?",
    },
    right: {
      uz: "Hujumchi ro‘yxatda yo‘q shaklni topadi",
      en: "An attacker finds a form that isn’t on the list",
    },
    wrong: [
      { uz: "U juda sekin ishlaydi", en: "It runs too slowly" },
      { uz: "U to‘g‘ri ismlarni rad etadi", en: "It rejects real names" },
      { uz: "U faqat Linuxda ishlaydi", en: "It only works on Linux" },
    ],
    explain: {
      uz: "<ScRiPt> yoki <img onerror> o‘tib ketadi.",
      en: "<ScRiPt> or <img onerror> gets through.",
    },
  },
  {
    ask: {
      uz: "Ruxsat ro‘yxati (allowlist) nima qiladi?",
      en: "What does an allowlist do?",
    },
    right: {
      uz: "Faqat kutilgan shaklga mos kirishni qabul qiladi",
      en: "Accepts only input that matches the expected shape",
    },
    wrong: [
      {
        uz: "Faqat xavfli so‘zlarni olib tashlaydi",
        en: "Removes only dangerous words",
      },
      { uz: "Hamma narsani qabul qiladi", en: "Accepts everything" },
      { uz: "Kirishni shifrlaydi", en: "Encrypts the input" },
    ],
    explain: {
      uz: "Nima mumkinligini aytish, nima mumkin emasligini sanashdan ishonchliroq.",
      en: "Saying what is allowed beats listing what isn’t.",
    },
  },
  {
    ask: {
      uz: "SQL injection’ni qanday to‘g‘ri to‘xtatasiz?",
      en: "What properly stops SQL injection?",
    },
    right: { uz: "Parametrli so‘rov", en: "A parameterised query" },
    wrong: [
      { uz: "Qo‘shtirnoqlarni olib tashlash", en: "Stripping quotes" },
      { uz: "So‘rovni katta harflarda yozish", en: "Writing SQL in capitals" },
      { uz: "Xatoni yashirish", en: "Hiding the error" },
    ],
    explain: {
      uz: "Ma’lumot so‘rov matniga hech qachon qo‘shilmaydi.",
      en: "Data never becomes part of the query text.",
    },
  },
  {
    ask: {
      uz: "Server xatosida foydalanuvchiga nima ko‘rsatiladi?",
      en: "What does the user see on a server error?",
    },
    right: {
      uz: "Umumiy xabar va murojaat raqami",
      en: "A generic message and a reference number",
    },
    wrong: [
      { uz: "To‘liq stack trace", en: "The full stack trace" },
      { uz: "SQL so‘rovi matni", en: "The SQL query text" },
      { uz: "Server versiyasi va yo‘llari", en: "Server version and paths" },
    ],
    explain: {
      uz: "Tafsilot logga ketadi, hujumchiga emas.",
      en: "Details go to the log, not to the attacker.",
    },
  },
  {
    ask: {
      uz: "Xato bo‘lganda kod qanday yo‘l tutishi kerak?",
      en: "How should code behave when something fails?",
    },
    right: {
      uz: "Yopiq holda: rad etish (fail closed)",
      en: "Fail closed: deny",
    },
    wrong: [
      { uz: "Ochiq holda: ruxsat berish", en: "Fail open: allow" },
      { uz: "Xatoni e’tiborsiz qoldirish", en: "Ignore the error" },
      { uz: "Qayta-qayta urinish", en: "Retry forever" },
    ],
    explain: {
      uz: "Huquq tekshiruvi xato bersa, ruxsat berilmaydi.",
      en: "If the permission check fails, access is refused.",
    },
  },
  {
    ask: {
      uz: "API kaliti qayerda saqlanadi?",
      en: "Where does an API key belong?",
    },
    right: {
      uz: "Muhit o‘zgaruvchisi yoki sirlar omborida",
      en: "In an environment variable or secret store",
    },
    wrong: [
      {
        uz: "Kod ichida, konstanta sifatida",
        en: "In the code, as a constant",
      },
      { uz: "README faylida", en: "In the README" },
      { uz: "Frontend JavaScript’da", en: "In frontend JavaScript" },
    ],
    explain: {
      uz: "Kod Git’ga tushadi va tarixda abadiy qoladi.",
      en: "Code goes into Git and stays in its history forever.",
    },
  },
  {
    ask: {
      uz: "Kalit Git’ga tushib qoldi. Birinchi qadam?",
      en: "A key was committed to Git. First step?",
    },
    right: {
      uz: "Kalitni bekor qilib, yangisini chiqarish",
      en: "Revoke the key and issue a new one",
    },
    wrong: [
      {
        uz: "Faylni o‘chirib qayta commit qilish",
        en: "Delete the file and commit",
      },
      { uz: "Repozitoriyani yopiq qilish", en: "Make the repository private" },
      { uz: "Hech narsa, hech kim ko‘rmagan", en: "Nothing, nobody saw it" },
    ],
    explain: {
      uz: "Tarixdan o‘chirish kechikadi: kalit allaqachon ko‘chirilgan bo‘lishi mumkin.",
      en: "Scrubbing history is too late: it may already be copied.",
    },
  },
  {
    ask: {
      uz: "Qaysi biri logga yozilmaydi?",
      en: "Which of these must not be logged?",
    },
    right: { uz: "Parol", en: "A password" },
    wrong: [
      { uz: "Kirish vaqti", en: "The login time" },
      { uz: "Foydalanuvchi ID si", en: "The user ID" },
      { uz: "Natija: muvaffaqiyatli yoki yo‘q", en: "Success or failure" },
    ],
    explain: {
      uz: "Loglarni ko‘p odam o‘qiydi; sir u yerda tarqaladi.",
      en: "Many people read logs; a secret leaks there.",
    },
  },
  {
    ask: {
      uz: "`db.users.update(id, req.body)` qanday xavf tug‘diradi?",
      en: "What is the risk of `db.users.update(id, req.body)`?",
    },
    right: {
      uz: "Foydalanuvchi role kabi maydonni o‘zi o‘zgartiradi (mass assignment)",
      en: "The user changes fields like role themselves (mass assignment)",
    },
    wrong: [
      { uz: "So‘rov sekinlashadi", en: "The query gets slower" },
      { uz: "Hech qanday xavf yo‘q", en: "No risk at all" },
      { uz: "Baza o‘chib ketadi", en: "The database is deleted" },
    ],
    explain: {
      uz: "Sxema faqat ruxsat etilgan maydonlarni o‘tkazadi.",
      en: "A schema lets only allowed fields through.",
    },
  },
  {
    ask: {
      uz: "Tekshiruv qayerda bo‘lishi shart?",
      en: "Where must validation happen?",
    },
    right: { uz: "Serverda", en: "On the server" },
    wrong: [
      { uz: "Faqat brauzerda", en: "Only in the browser" },
      { uz: "Faqat HTML atributlarida", en: "Only in HTML attributes" },
      { uz: "Hech qayerda", en: "Nowhere" },
    ],
    explain: {
      uz: "Brauzerdagi tekshiruvni chetlab o‘tish oson; u faqat qulaylik.",
      en: "Browser checks are easy to bypass; they’re a convenience.",
    },
  },
  {
    ask: {
      uz: "Eng kam huquq (least privilege) tamoyili?",
      en: "The principle of least privilege?",
    },
    right: {
      uz: "Har bir qism faqat o‘ziga kerak huquqni oladi",
      en: "Each part gets only the rights it needs",
    },
    wrong: [
      { uz: "Hamma admin bo‘ladi", en: "Everyone is admin" },
      { uz: "Huquqlar hech qachon o‘zgarmaydi", en: "Rights never change" },
      { uz: "Faqat adminlar log yozadi", en: "Only admins write logs" },
    ],
    explain: {
      uz: "Ilovaning baza foydalanuvchisi jadvallarni o‘chira olmasligi kerak.",
      en: "The app’s database user shouldn’t be able to drop tables.",
    },
  },
  {
    ask: {
      uz: "XSS’ga qarshi chiqishda nima qilinadi?",
      en: "What stops XSS on output?",
    },
    right: {
      uz: "Kontekstga mos ekranlash (escaping)",
      en: "Escaping for the context",
    },
    wrong: [
      { uz: "Ma’lumotni shifrlash", en: "Encrypting the data" },
      { uz: "Faqat HTTPS", en: "HTTPS alone" },
      { uz: "Parolni uzaytirish", en: "Longer passwords" },
    ],
    explain: {
      uz: "< belgisi &lt; bo‘lib, kod emas, matn bo‘lib chiqadi.",
      en: "< becomes &lt; and shows as text, not code.",
    },
  },
  {
    ask: {
      uz: "Ichma-ich himoya (defence in depth) nima?",
      en: "What is defence in depth?",
    },
    right: {
      uz: "Bir himoya yiqilsa, keyingisi ushlab qoladigan qatlamlar",
      en: "Layers, so one failing control is caught by the next",
    },
    wrong: [
      { uz: "Bitta kuchli parol", en: "One strong password" },
      { uz: "Faqat firewall", en: "A firewall alone" },
      { uz: "Kodni yashirish", en: "Hiding the code" },
    ],
    explain: {
      uz: "Masalan: tekshiruv + parametrli so‘rov + eng kam huquq.",
      en: "For example: validation + parameterised queries + least privilege.",
    },
  },
  {
    ask: {
      uz: "Kirish xatosida qaysi xabar to‘g‘ri?",
      en: "Which login error message is right?",
    },
    right: {
      uz: "«Email yoki parol noto‘g‘ri»",
      en: "“Wrong email or password”",
    },
    wrong: [
      { uz: "«Bunday email yo‘q»", en: "“No such email”" },
      {
        uz: "«Parol noto‘g‘ri, email to‘g‘ri»",
        en: "“Password wrong, email right”",
      },
      { uz: "«SQL xatosi: users jadvali»", en: "“SQL error: users table”" },
    ],
    explain: {
      uz: "Aniq xabar qaysi emaillar ro‘yxatdan o‘tganini oshkor qiladi.",
      en: "A precise message reveals which emails are registered.",
    },
  },
];

export const SUPPLYCHAIN_POOL: PoolItem[] = [
  {
    ask: {
      uz: "Bilvosita (transitive) kutubxona nima?",
      en: "What is a transitive dependency?",
    },
    right: {
      uz: "Siz tanlagan paket o‘zi olib kelgan paket",
      en: "A package that a package you chose pulls in",
    },
    wrong: [
      {
        uz: "package.json’da siz yozgan paket",
        en: "One you listed in package.json",
      },
      { uz: "Faqat test uchun paket", en: "A test-only package" },
      { uz: "O‘chirilgan paket", en: "A removed package" },
    ],
    explain: {
      uz: "Ularning zaifligi ham sizniki.",
      en: "Their flaws are yours too.",
    },
  },
  {
    ask: {
      uz: "Semver’da MAJOR raqami oshsa nimani bildiradi?",
      en: "In semver, what does a higher MAJOR number mean?",
    },
    right: {
      uz: "Moslikni buzadigan o‘zgarishlar",
      en: "Changes that break compatibility",
    },
    wrong: [
      { uz: "Faqat xato tuzatishlar", en: "Bug fixes only" },
      { uz: "Faqat hujjatlar", en: "Documentation only" },
      { uz: "Xavfsizlik tuzatishi", en: "A security fix" },
    ],
    explain: {
      uz: "PATCH — tuzatish, MINOR — yangi imkoniyat.",
      en: "PATCH fixes, MINOR adds features.",
    },
  },
  {
    ask: {
      uz: "Lockfile nima uchun commit qilinadi?",
      en: "Why is the lockfile committed?",
    },
    right: {
      uz: "Hamma joyda aynan bir xil versiyalar o‘rnatilishi uchun",
      en: "So exactly the same versions install everywhere",
    },
    wrong: [
      { uz: "Paketlarni tezroq yozish uchun", en: "To write packages faster" },
      { uz: "Parollarni saqlash uchun", en: "To store passwords" },
      { uz: "Kerak emas", en: "It shouldn’t be" },
    ],
    explain: {
      uz: "Unda versiya va xesh yozilgan.",
      en: "It records versions and hashes.",
    },
  },
  {
    ask: {
      uz: "CI’da qaysi buyruq ishlatiladi?",
      en: "Which command belongs in CI?",
    },
    right: { uz: "npm ci", en: "npm ci" },
    wrong: [
      { uz: "npm update", en: "npm update" },
      { uz: "npm install paket@latest", en: "npm install pkg@latest" },
      { uz: "npm audit fix --force", en: "npm audit fix --force" },
    ],
    explain: {
      uz: "U faqat lockfile’dagini o‘rnatadi.",
      en: "It installs only what the lockfile says.",
    },
  },
  {
    ask: {
      uz: "Advisory: “4.17.21 da tuzatilgan”. Sizda 4.17.15. Holat?",
      en: "Advisory: “fixed in 4.17.21”. You have 4.17.15. Status?",
    },
    right: { uz: "Zaif: yangilash kerak", en: "Affected: update it" },
    wrong: [
      { uz: "Xavfsiz", en: "Safe" },
      { uz: "Faqat MAJOR o‘zgarsa zaif", en: "Affected only on MAJOR" },
      { uz: "Aniqlab bo‘lmaydi", en: "Impossible to tell" },
    ],
    explain: {
      uz: "15 < 21: tuzatishdan eski.",
      en: "15 < 21: older than the fix.",
    },
  },
  {
    ask: {
      uz: "SCA vositasiga misol?",
      en: "An example of an SCA tool?",
    },
    right: { uz: "npm audit yoki Dependabot", en: "npm audit or Dependabot" },
    wrong: [
      { uz: "Wireshark", en: "Wireshark" },
      { uz: "nmap", en: "nmap" },
      { uz: "Photoshop", en: "Photoshop" },
    ],
    explain: {
      uz: "Ular paketlarni zaifliklar bazasi bilan solishtiradi.",
      en: "They match packages against flaw databases.",
    },
  },
  {
    ask: {
      uz: "Typosquatting nima?",
      en: "What is typosquatting?",
    },
    right: {
      uz: "Mashhur paketga o‘xshash nom bilan zararli paket",
      en: "A malicious package named like a popular one",
    },
    wrong: [
      { uz: "Paketni yangilash", en: "Updating a package" },
      { uz: "Parolni taxmin qilish", en: "Guessing a password" },
      { uz: "Serverni to‘xtatish", en: "Taking a server down" },
    ],
    explain: {
      uz: "expresss, crossenv, reqeusts kabi.",
      en: "Like expresss, crossenv or reqeusts.",
    },
  },
  {
    ask: {
      uz: "Zararli paket o‘rnatilishi bilanoq kodni qanday bajaradi?",
      en: "How does a malicious package run code as soon as it installs?",
    },
    right: {
      uz: "postinstall skripti orqali",
      en: "Through a postinstall script",
    },
    wrong: [
      { uz: "LICENSE fayli orqali", en: "Through its LICENSE file" },
      { uz: "Faqat import qilinganda", en: "Only once imported" },
      { uz: "Bajara olmaydi", en: "It can’t" },
    ],
    explain: {
      uz: "`--ignore-scripts` buni o‘chiradi.",
      en: "`--ignore-scripts` turns this off.",
    },
  },
  {
    ask: {
      uz: "Dependency confusion qanday ishlaydi?",
      en: "How does dependency confusion work?",
    },
    right: {
      uz: "Ichki paket nomi ochiq registrda kattaroq versiya bilan chiqariladi",
      en: "An internal package name is published publicly with a higher version",
    },
    wrong: [
      {
        uz: "Ikki paket bir xil faylni o‘zgartiradi",
        en: "Two packages change one file",
      },
      { uz: "Lockfile o‘chib ketadi", en: "The lockfile gets deleted" },
      { uz: "Paket nomida xato", en: "A typo in a name" },
    ],
    explain: {
      uz: "Scope (`@kompaniya/…`) va ichki registr himoya qiladi.",
      en: "A scope (`@company/…`) and an internal registry protect you.",
    },
  },
  {
    ask: {
      uz: "SBOM nima?",
      en: "What is an SBOM?",
    },
    right: {
      uz: "Ilovadagi barcha komponentlar ro‘yxati",
      en: "A list of every component in an application",
    },
    wrong: [
      { uz: "Zaifliklarni tuzatuvchi vosita", en: "A tool that fixes flaws" },
      { uz: "Server logi", en: "A server log" },
      { uz: "Parol menejeri", en: "A password manager" },
    ],
    explain: {
      uz: "Formatlari: CycloneDX, SPDX.",
      en: "Formats: CycloneDX, SPDX.",
    },
  },
  {
    ask: {
      uz: "Log4Shell paytida SBOM nimaga yordam berardi?",
      en: "How would an SBOM have helped during Log4Shell?",
    },
    right: {
      uz: "Log4j qaysi ilovalarda borligini darhol aytardi",
      en: "It would show at once which apps contain Log4j",
    },
    wrong: [
      {
        uz: "Log4j’ni avtomatik o‘chirardi",
        en: "It would remove Log4j itself",
      },
      { uz: "Hujumchini topardi", en: "It would find the attacker" },
      { uz: "Hech narsaga", en: "Not at all" },
    ],
    explain: {
      uz: "Usiz jamoalar haftalab qidirgan.",
      en: "Without one, teams searched for weeks.",
    },
  },
  {
    ask: {
      uz: "Kritik zaiflik tuzatildi. Qachon yangilaysiz?",
      en: "A critical flaw has a fix. When do you update?",
    },
    right: { uz: "Darhol", en: "Now" },
    wrong: [
      { uz: "Keyingi yili", en: "Next year" },
      { uz: "Hujum bo‘lganda", en: "After an attack" },
      { uz: "Hech qachon", en: "Never" },
    ],
    explain: {
      uz: "Oddiy yangilanishlar — jadval bo‘yicha.",
      en: "Ordinary updates go on a schedule.",
    },
  },
  {
    ask: {
      uz: "Zaif paket bilvosita. Odatiy yechim?",
      en: "The affected package is transitive. The usual fix?",
    },
    right: {
      uz: "Uni olib kelgan paketni yangilash",
      en: "Update the package that pulls it in",
    },
    wrong: [
      {
        uz: "node_modules’ni qo‘lda tahrirlash",
        en: "Edit node_modules by hand",
      },
      { uz: "E’tiborsiz qoldirish", en: "Ignore it" },
      { uz: "Lockfile’ni o‘chirish", en: "Delete the lockfile" },
    ],
    explain: {
      uz: "Kerak bo‘lsa `overrides` bilan versiyani majburlang.",
      en: "If needed, force the version with `overrides`.",
    },
  },
  {
    ask: {
      uz: "Yangi kutubxona qo‘shishdan oldin birinchi savol?",
      en: "The first question before adding a library?",
    },
    right: {
      uz: "Bu bizga rostdan kerakmi?",
      en: "Do we really need it?",
    },
    wrong: [
      { uz: "Logotipi chiroyli-mi?", en: "Is its logo nice?" },
      { uz: "Eng yangisi qaysi?", en: "Which is newest?" },
      { uz: "Nomi qisqami?", en: "Is the name short?" },
    ],
    explain: {
      uz: "Har bir kutubxona — yangi xavf.",
      en: "Every library is new risk.",
    },
  },
  {
    ask: {
      uz: "xz-utils (2024) hodisasi nimani ko‘rsatdi?",
      en: "What did the xz-utils incident (2024) show?",
    },
    right: {
      uz: "Ishonchli loyiha ham ichkaridan buzilishi mumkin",
      en: "Even a trusted project can be compromised from inside",
    },
    wrong: [
      {
        uz: "Faqat typosquatting xavfli",
        en: "Only typosquatting is dangerous",
      },
      {
        uz: "Lockfile hamma narsadan himoya qiladi",
        en: "A lockfile stops everything",
      },
      { uz: "Ochiq kod xavfsiz emas", en: "Open source is unsafe" },
    ],
    explain: {
      uz: "Yangi muallif yillar davomida ishonch qozonib, orqa eshik qo‘shgan.",
      en: "A new maintainer built trust for years, then added a backdoor.",
    },
  },
];

export const AUTOTEST_POOL: PoolItem[] = [
  {
    ask: { uz: "SAST nima qiladi?", en: "What does SAST do?" },
    right: {
      uz: "Kodni ishga tushirmasdan xavfli naqshlarni qidiradi",
      en: "Looks for dangerous patterns without running the code",
    },
    wrong: [
      { uz: "Ishlayotgan saytga hujum qiladi", en: "Attacks the running site" },
      { uz: "Kutubxonalarni yangilaydi", en: "Updates libraries" },
      { uz: "Parollarni almashtiradi", en: "Rotates passwords" },
    ],
    explain: {
      uz: "Semgrep, CodeQL, SonarQube.",
      en: "Semgrep, CodeQL, SonarQube.",
    },
  },
  {
    ask: { uz: "DAST nima qiladi?", en: "What does DAST do?" },
    right: {
      uz: "Ishlayotgan ilovaga hujumchi kabi so‘rov yuboradi",
      en: "Sends attacker-style requests to the running app",
    },
    wrong: [
      { uz: "Kodni o‘qiydi", en: "Reads the code" },
      { uz: "Lockfile’ni tekshiradi", en: "Checks the lockfile" },
      { uz: "Commit’larni qidiradi", en: "Searches commits" },
    ],
    explain: { uz: "OWASP ZAP, Burp Suite.", en: "OWASP ZAP, Burp Suite." },
  },
  {
    ask: {
      uz: "Taint analysis’da “source” nima?",
      en: "In taint analysis, what is a “source”?",
    },
    right: {
      uz: "Foydalanuvchi ma’lumoti kiradigan joy",
      en: "Where user data comes in",
    },
    wrong: [
      { uz: "Kodning manba fayli", en: "A source code file" },
      { uz: "Ma’lumotlar bazasi", en: "The database" },
      { uz: "Log fayli", en: "A log file" },
    ],
    explain: {
      uz: "Masalan req.params; “sink” — SQL, HTML, eval.",
      en: "E.g. req.params; a “sink” is SQL, HTML or eval.",
    },
  },
  {
    ask: {
      uz: "Test fixture’dagi “parol” topilmasi bilan nima qilinadi?",
      en: "What do you do with a “password” finding in a test fixture?",
    },
    right: {
      uz: "Sababi yozilgan istisno qo‘shiladi",
      en: "Add an exception with its reason",
    },
    wrong: [
      { uz: "Butun vositani o‘chirish", en: "Switch the whole tool off" },
      { uz: "Testni o‘chirish", en: "Delete the test" },
      {
        uz: "E’tiborsiz qoldirib, har safar ko‘rish",
        en: "Ignore it and see it every time",
      },
    ],
    explain: {
      uz: "Masalan `// nosemgrep: test fixture`.",
      en: "E.g. `// nosemgrep: test fixture`.",
    },
  },
  {
    ask: {
      uz: "Juda ko‘p yolg‘on signal nimaga olib keladi?",
      en: "What do too many false alarms lead to?",
    },
    right: {
      uz: "Jamoa ogohlantirishlarni o‘qimay qo‘yadi",
      en: "The team stops reading the warnings",
    },
    wrong: [
      { uz: "Kod xavfsizroq bo‘ladi", en: "Safer code" },
      { uz: "Build tezlashadi", en: "Faster builds" },
      { uz: "Hech narsaga", en: "Nothing" },
    ],
    explain: { uz: "Qoidalarni sozlang.", en: "Tune the rules." },
  },
  {
    ask: {
      uz: "Commit’dagi API kalitini qaysi vosita topadi?",
      en: "Which tool finds an API key in a commit?",
    },
    right: {
      uz: "Sirlarni qidirish (gitleaks)",
      en: "Secret scanning (gitleaks)",
    },
    wrong: [
      { uz: "DAST", en: "DAST" },
      { uz: "SCA", en: "SCA" },
      { uz: "Prettier", en: "Prettier" },
    ],
    explain: {
      uz: "Eng yaxshisi — pre-commit hook’da.",
      en: "Best in a pre-commit hook.",
    },
  },
  {
    ask: {
      uz: "Eski kutubxonadagi ma’lum zaiflikni qaysi vosita topadi?",
      en: "Which tool finds a known flaw in an old library?",
    },
    right: { uz: "SCA", en: "SCA" },
    wrong: [
      { uz: "SAST", en: "SAST" },
      { uz: "DAST", en: "DAST" },
      { uz: "Linter", en: "A linter" },
    ],
    explain: {
      uz: "U versiyalarni zaifliklar bazasi bilan solishtiradi.",
      en: "It matches versions against flaw databases.",
    },
  },
  {
    ask: {
      uz: "Yetishmayotgan CSP sarlavhasini qaysi vosita yaxshi topadi?",
      en: "Which tool best finds a missing CSP header?",
    },
    right: { uz: "DAST", en: "DAST" },
    wrong: [
      { uz: "SCA", en: "SCA" },
      { uz: "Sirlarni qidirish", en: "Secret scanning" },
      { uz: "Unit test", en: "A unit test" },
    ],
    explain: {
      uz: "Sarlavha javobda ko‘rinadi, ko‘pincha kodda emas.",
      en: "The header shows in the response, often not in code.",
    },
  },
  {
    ask: {
      uz: "DAST qayerda ishga tushiriladi?",
      en: "Where is DAST run?",
    },
    right: {
      uz: "O‘zimizning staging muhitida",
      en: "Against our own staging environment",
    },
    wrong: [
      { uz: "Birovning saytida", en: "Someone else’s site" },
      {
        uz: "Faqat dasturchining noutbukida",
        en: "Only on a developer laptop",
      },
      {
        uz: "Ishlab chiqarishda, eng ko‘p trafikda",
        en: "Production at peak traffic",
      },
    ],
    explain: {
      uz: "U ma’lumot yaratishi va o‘chirishi mumkin.",
      en: "It may create and delete data.",
    },
  },
  {
    ask: {
      uz: "SAST nimani odatda ko‘rmaydi?",
      en: "What does SAST usually miss?",
    },
    right: {
      uz: "Biznes mantiq xatolarini",
      en: "Business logic flaws",
    },
    wrong: [
      { uz: "SQL birlashtirishni", en: "SQL concatenation" },
      { uz: "eval() chaqiruvini", en: "An eval() call" },
      { uz: "innerHTML’ga yozishni", en: "Writing to innerHTML" },
    ],
    explain: {
      uz: "Masalan, narxni brauzerdan qabul qilish.",
      en: "Taking the price from the browser, for example.",
    },
  },
  {
    ask: {
      uz: "“Shift left” nimani bildiradi?",
      en: "What does “shift left” mean?",
    },
    right: {
      uz: "Tekshiruvni jarayonning boshiga surish",
      en: "Moving checks to the start of the process",
    },
    wrong: [
      { uz: "Kodni chap tomonga tekislash", en: "Left-aligning code" },
      { uz: "Testlarni o‘chirish", en: "Removing tests" },
      { uz: "Release’ni kechiktirish", en: "Delaying the release" },
    ],
    explain: { uz: "Erta — arzon.", en: "Early is cheap." },
  },
  {
    ask: {
      uz: "Qaysi topilma odatda merge’ni to‘xtatadi?",
      en: "Which finding usually blocks a merge?",
    },
    right: {
      uz: "Yangi koddagi kritik zaiflik",
      en: "A critical flaw in new code",
    },
    wrong: [
      { uz: "Eski koddagi past topilma", en: "A low finding in old code" },
      { uz: "Imlo xatosi", en: "A typo" },
      { uz: "Hech qaysi", en: "None" },
    ],
    explain: {
      uz: "Past va o‘rta — ogohlantirish va vazifa.",
      en: "Low and medium become a warning and a ticket.",
    },
  },
  {
    ask: { uz: "Baseline nima?", en: "What is a baseline?" },
    right: {
      uz: "Mavjud topilmalar ro‘yxati: faqat yangilari to‘xtatadi",
      en: "The existing findings: only new ones block",
    },
    wrong: [
      { uz: "Eng past versiya", en: "The lowest version" },
      { uz: "Asosiy server", en: "The main server" },
      { uz: "Tarmoq tezligi", en: "Network speed" },
    ],
    explain: {
      uz: "Eskilari alohida reja bilan tuzatiladi.",
      en: "Old ones are fixed on a separate plan.",
    },
  },
  {
    ask: {
      uz: "Avtomatik vositalar odam ko‘rigini almashtiradimi?",
      en: "Do automated tools replace human review?",
    },
    right: {
      uz: "Yo‘q, ular uni to‘ldiradi",
      en: "No, they complement it",
    },
    wrong: [
      { uz: "Ha, butunlay", en: "Yes, completely" },
      { uz: "Faqat kichik jamoalarda", en: "Only in small teams" },
      { uz: "Faqat Python’da", en: "Only in Python" },
    ],
    explain: {
      uz: "Dizayn va mantiqni odam ko‘radi.",
      en: "People see design and logic.",
    },
  },
  {
    ask: {
      uz: "Pull request’da odatda qaysi tekshiruvlar ishlaydi?",
      en: "Which checks usually run on a pull request?",
    },
    right: { uz: "SAST va SCA", en: "SAST and SCA" },
    wrong: [
      { uz: "Faqat DAST", en: "DAST only" },
      { uz: "Hech qaysi", en: "None" },
      { uz: "Faqat qo‘lda pentest", en: "Only a manual pentest" },
    ],
    explain: {
      uz: "Ular tez va o‘zgarishni darhol ko‘radi.",
      en: "They are fast and see the change at once.",
    },
  },
];

export const CODEREVIEW_POOL: PoolItem[] = [
  {
    ask: {
      uz: "Kod ko‘rigida odam vositadan nimani yaxshiroq topadi?",
      en: "What does a reviewer find better than a tool?",
    },
    right: {
      uz: "Huquq va biznes mantiq xatolarini",
      en: "Authorisation and logic flaws",
    },
    wrong: [
      { uz: "Eski kutubxonalarni", en: "Old libraries" },
      { uz: "Formatlash xatolarini", en: "Formatting errors" },
      { uz: "Hech narsani", en: "Nothing" },
    ],
    explain: {
      uz: "Masalan, buyurtma egasini tekshirish unutilgani.",
      en: "Such as a missing check of who owns an order.",
    },
  },
  {
    ask: {
      uz: "Qaysi PR’ni yaxshi ko‘rib chiqish oson?",
      en: "Which PR is easier to review well?",
    },
    right: { uz: "Bitta vazifali kichik PR", en: "A small PR about one task" },
    wrong: [
      { uz: "3000 qatorlik PR", en: "A 3,000-line PR" },
      { uz: "Tavsifsiz PR", en: "A PR with no description" },
      { uz: "Beshta vazifali PR", en: "A PR about five tasks" },
    ],
    explain: {
      uz: "Katta PR’da diqqat pasayadi.",
      en: "Attention drops on big PRs.",
    },
  },
  {
    ask: {
      uz: "IDOR nima?",
      en: "What is an IDOR?",
    },
    right: {
      uz: "ID ni o‘zgartirib, birovning ma’lumotiga kirish",
      en: "Reaching someone else’s data by changing an ID",
    },
    wrong: [
      { uz: "Parolni taxmin qilish", en: "Guessing a password" },
      { uz: "Serverni to‘xtatish", en: "Taking a server down" },
      { uz: "Kodni shifrlash", en: "Encrypting code" },
    ],
    explain: {
      uz: "Har so‘rovda egasi tekshiriladi.",
      en: "Check the owner on every request.",
    },
  },
  {
    ask: {
      uz: '`if (user.role = "admin")` da xato nima?',
      en: 'What is wrong with `if (user.role = "admin")`?',
    },
    right: {
      uz: "= qiymat beradi, shart har doim rost",
      en: "= assigns, so the condition is always true",
    },
    wrong: [
      { uz: "Qo‘shtirnoq noto‘g‘ri", en: "Wrong quotes" },
      { uz: "Hech narsa", en: "Nothing" },
      {
        uz: "admin katta harf bo‘lishi kerak",
        en: "admin must be capitalised",
      },
    ],
    explain: { uz: "=== bilan taqqoslanadi.", en: "Compare with ===." },
  },
  {
    ask: {
      uz: "`cors({ origin: true, credentials: true })` xavfi?",
      en: "The risk of `cors({ origin: true, credentials: true })`?",
    },
    right: {
      uz: "Har qanday sayt foydalanuvchi cookie’lari bilan so‘rov yuboradi",
      en: "Any site can send requests with the user’s cookies",
    },
    wrong: [
      { uz: "Sayt sekinlashadi", en: "The site gets slower" },
      { uz: "Xavf yo‘q", en: "No risk" },
      { uz: "Cookie’lar o‘chadi", en: "Cookies get deleted" },
    ],
    explain: {
      uz: "Ishonchli manbalar ro‘yxatini yozing.",
      en: "List the trusted origins.",
    },
  },
  {
    ask: {
      uz: "Yaxshi ko‘rik izohida nima bo‘ladi?",
      en: "What does a good review comment contain?",
    },
    right: {
      uz: "Muammo, ta’sir va tuzatish",
      en: "The problem, the impact and the fix",
    },
    wrong: [
      { uz: "Faqat “bu xavfli”", en: "Just “this is insecure”" },
      { uz: "Muallifni tanqid", en: "Criticism of the author" },
      { uz: "Faqat emoji", en: "Just an emoji" },
    ],
    explain: {
      uz: "Kodni tanqid qiling, odamni emas.",
      en: "Criticise the code, not the person.",
    },
  },
  {
    ask: { uz: "Xavf qanday baholanadi?", en: "How is risk rated?" },
    right: { uz: "Ta’sir × ehtimollik", en: "Impact × likelihood" },
    wrong: [
      { uz: "Qatorlar soni", en: "Line count" },
      { uz: "Fayl hajmi", en: "File size" },
      { uz: "Muallif yoshi", en: "The author’s age" },
    ],
    explain: { uz: "CVSS buni rasmiylashtiradi.", en: "CVSS formalises it." },
  },
  {
    ask: {
      uz: "Login ham kerak bo‘lmagan admin kirishi qaysi daraja?",
      en: "Admin access needing not even a login is which level?",
    },
    right: { uz: "Kritik", en: "Critical" },
    wrong: [
      { uz: "Past", en: "Low" },
      { uz: "O‘rta", en: "Medium" },
      { uz: "Daraja yo‘q", en: "No level" },
    ],
    explain: {
      uz: "Ta’sir ham, ehtimollik ham eng yuqori.",
      en: "Both impact and likelihood are at the top.",
    },
  },
  {
    ask: {
      uz: "X-Powered-By sarlavhasi odatda qaysi daraja?",
      en: "An X-Powered-By header is usually which level?",
    },
    right: { uz: "Past", en: "Low" },
    wrong: [
      { uz: "Kritik", en: "Critical" },
      { uz: "Yuqori", en: "High" },
      { uz: "Daraja yo‘q", en: "No level" },
    ],
    explain: {
      uz: "Ozgina ma’lumot beradi, o‘zi hech narsani ochmaydi.",
      en: "It tells a little but opens nothing.",
    },
  },
  {
    ask: {
      uz: "Kritik topilma bor. Qaror?",
      en: "There’s a critical finding. The decision?",
    },
    right: { uz: "Request changes", en: "Request changes" },
    wrong: [
      { uz: "Approve", en: "Approve" },
      { uz: "Izohsiz merge", en: "Merge without comment" },
      { uz: "E’tiborsiz qoldirish", en: "Ignore it" },
    ],
    explain: {
      uz: "Tuzatilmaguncha birlashtirilmaydi.",
      en: "It doesn’t merge until fixed.",
    },
  },
  {
    ask: {
      uz: "Faqat nit qolgan. Qaror?",
      en: "Only nits remain. The decision?",
    },
    right: { uz: "Izohlar bilan Approve", en: "Approve with comments" },
    wrong: [
      { uz: "PR’ni yopish", en: "Close the PR" },
      { uz: "Request changes", en: "Request changes" },
      { uz: "Hech narsa demaslik", en: "Say nothing" },
    ],
    explain: {
      uz: "Nit — kichik uslub izohi.",
      en: "A nit is a small style note.",
    },
  },
  {
    ask: {
      uz: "Autentifikatsiya va avtorizatsiya farqi?",
      en: "Authentication versus authorisation?",
    },
    right: {
      uz: "Kim ekanligi va nimaga haqli ekanligi",
      en: "Who someone is, and what they may do",
    },
    wrong: [
      { uz: "Ikkalasi bir xil", en: "They’re the same" },
      { uz: "Shifrlash va xeshlash", en: "Encryption and hashing" },
      { uz: "Login va logout", en: "Login and logout" },
    ],
    explain: {
      uz: "requireLogin faqat birinchisini tekshiradi.",
      en: "requireLogin checks only the first.",
    },
  },
  {
    ask: {
      uz: "Bir yillik sessiya muddatining xavfi?",
      en: "The risk of a year-long session?",
    },
    right: {
      uz: "O‘g‘irlangan cookie bir yil ishlaydi",
      en: "A stolen cookie works for a year",
    },
    wrong: [
      { uz: "Xavf yo‘q", en: "No risk" },
      { uz: "Sayt sekinlashadi", en: "The site gets slower" },
      { uz: "Parol unutiladi", en: "Passwords get forgotten" },
    ],
    explain: {
      uz: "Qisqa muddat va qayta kirish talab qiling.",
      en: "Use short lifetimes and re-authentication.",
    },
  },
  {
    ask: {
      uz: "Ko‘ruvchi xotirasi o‘rniga nimaga tayanadi?",
      en: "What does a reviewer rely on instead of memory?",
    },
    right: { uz: "Tekshiruv ro‘yxatiga", en: "A checklist" },
    wrong: [
      { uz: "Omadga", en: "Luck" },
      { uz: "Muallifning so‘ziga", en: "The author’s word" },
      { uz: "Kod uzunligiga", en: "Code length" },
    ],
    explain: {
      uz: "OWASP Code Review Guide, ASVS.",
      en: "The OWASP Code Review Guide, ASVS.",
    },
  },
  {
    ask: {
      uz: "Muallif topilmaga rozi emas. Nima qilinadi?",
      en: "The author disagrees with a finding. What now?",
    },
    right: {
      uz: "Hujum yo‘lini misol bilan ko‘rsatish",
      en: "Show the attack path with an example",
    },
    wrong: [
      { uz: "Indamay tasdiqlash", en: "Approve quietly" },
      { uz: "Baqirish", en: "Shout" },
      { uz: "PR’ni o‘chirish", en: "Delete the PR" },
    ],
    explain: {
      uz: "Dalil bahsni hal qiladi.",
      en: "Evidence settles it.",
    },
  },
];

export const HARDENING_POOL: PoolItem[] = [
  {
    ask: { uz: "Mustahkamlash (hardening) nima?", en: "What is hardening?" },
    right: {
      uz: "Keraksizini olib tashlash va qolganini qattiq sozlash",
      en: "Removing what isn’t needed and locking down the rest",
    },
    wrong: [
      { uz: "Serverni tezlashtirish", en: "Making a server faster" },
      { uz: "Zaxira nusxa olish", en: "Taking a backup" },
      { uz: "Antivirus o‘rnatish", en: "Installing antivirus" },
    ],
    explain: {
      uz: "Kichik hujum yuzasi — kam eshik.",
      en: "A small attack surface means fewer doors.",
    },
  },
  {
    ask: {
      uz: "`-rw-rw-rw-` faylga kim yoza oladi?",
      en: "Who can write to a `-rw-rw-rw-` file?",
    },
    right: { uz: "Har bir foydalanuvchi", en: "Every user" },
    wrong: [
      { uz: "Faqat egasi", en: "Only the owner" },
      { uz: "Faqat root", en: "Only root" },
      { uz: "Hech kim", en: "Nobody" },
    ],
    explain: {
      uz: "Oxirgi uchlikdagi w — boshqalar uchun.",
      en: "The w in the last triplet is for others.",
    },
  },
  {
    ask: { uz: "SUID bit nima qiladi?", en: "What does the SUID bit do?" },
    right: {
      uz: "Dastur egasi huquqi bilan ishlaydi",
      en: "Runs the program with its owner’s rights",
    },
    wrong: [
      { uz: "Faylni yashiradi", en: "Hides the file" },
      { uz: "Faylni shifrlaydi", en: "Encrypts the file" },
      { uz: "O‘chirishni taqiqlaydi", en: "Blocks deletion" },
    ],
    explain: {
      uz: "Egasi root bo‘lsa — root huquqi bilan.",
      en: "If the owner is root, it runs as root.",
    },
  },
  {
    ask: {
      uz: "/tmp dagi `t` (sticky bit) nima uchun?",
      en: "What is the `t` (sticky bit) on /tmp for?",
    },
    right: {
      uz: "Har kim faqat o‘z faylini o‘chira oladi",
      en: "Each user can delete only their own files",
    },
    wrong: [
      { uz: "Papka vaqtinchalik", en: "The folder is temporary" },
      { uz: "Papka shifrlangan", en: "The folder is encrypted" },
      { uz: "Papka faqat root uchun", en: "The folder is root-only" },
    ],
    explain: {
      uz: "Hamma yozadi, lekin birovnikini o‘chirmaydi.",
      en: "All may write, none may delete others’ files.",
    },
  },
  {
    ask: {
      uz: "/etc/shadow uchun to‘g‘ri huquq?",
      en: "The right mode for /etc/shadow?",
    },
    right: {
      uz: "640 (root va shadow guruhi)",
      en: "640 (root and the shadow group)",
    },
    wrong: [
      { uz: "666", en: "666" },
      { uz: "777", en: "777" },
      { uz: "644", en: "644" },
    ],
    explain: {
      uz: "Unda parol xeshlari saqlanadi.",
      en: "It holds the password hashes.",
    },
  },
  {
    ask: {
      uz: "Root ishga tushiradigan cron skripti hamma uchun yoziladigan. Xavf?",
      en: "A cron script root runs is world-writable. The risk?",
    },
    right: {
      uz: "Har kim root bo‘lib buyruq bajartira oladi",
      en: "Anyone can get commands run as root",
    },
    wrong: [
      { uz: "Skript sekinlashadi", en: "The script slows down" },
      { uz: "Xavf yo‘q", en: "No risk" },
      { uz: "Disk to‘ladi", en: "The disk fills up" },
    ],
    explain: { uz: "chmod 755, egasi root.", en: "chmod 755, owned by root." },
  },
  {
    ask: {
      uz: "Barcha SUID fayllarni qanday topasiz?",
      en: "How do you list every SUID file?",
    },
    right: {
      uz: "find / -perm -4000 -type f",
      en: "find / -perm -4000 -type f",
    },
    wrong: [
      { uz: "ls -la /", en: "ls -la /" },
      { uz: "ps aux", en: "ps aux" },
      { uz: "df -h", en: "df -h" },
    ],
    explain: {
      uz: "4000 — SUID bitining raqami.",
      en: "4000 is the SUID bit’s number.",
    },
  },
  {
    ask: {
      uz: "sudoers’dagi eng xavfli qator?",
      en: "The most dangerous sudoers line?",
    },
    right: {
      uz: "user ALL=(ALL) NOPASSWD: ALL",
      en: "user ALL=(ALL) NOPASSWD: ALL",
    },
    wrong: [
      {
        uz: "user ALL=(root) /usr/bin/systemctl restart app",
        en: "user ALL=(root) /usr/bin/systemctl restart app",
      },
      { uz: "Defaults env_reset", en: "Defaults env_reset" },
      { uz: "Defaults logfile", en: "Defaults logfile" },
    ],
    explain: {
      uz: "Hamma narsa, parolsiz.",
      en: "Everything, with no password.",
    },
  },
  {
    ask: {
      uz: "sudo ruxsatlarini qaysi buyruq ko‘rsatadi?",
      en: "Which command shows your sudo rights?",
    },
    right: { uz: "sudo -l", en: "sudo -l" },
    wrong: [
      { uz: "whoami", en: "whoami" },
      { uz: "id -u", en: "id -u" },
      { uz: "ls /etc", en: "ls /etc" },
    ],
    explain: {
      uz: "Pentesterning birinchi buyrug‘i.",
      en: "A pentester’s first command.",
    },
  },
  {
    ask: {
      uz: "Xizmat `0.0.0.0:3306` da tinglayapti. Bu nimani bildiradi?",
      en: "A service listens on `0.0.0.0:3306`. What does that mean?",
    },
    right: {
      uz: "Barcha tarmoqlardan, internetdan ham ulanish mumkin",
      en: "Reachable from every network, the internet included",
    },
    wrong: [
      { uz: "Faqat shu serverdan", en: "Only from this server" },
      { uz: "Xizmat o‘chiq", en: "The service is off" },
      { uz: "Faqat IPv6", en: "IPv6 only" },
    ],
    explain: {
      uz: "Faqat lokal uchun — 127.0.0.1.",
      en: "Local only would be 127.0.0.1.",
    },
  },
  {
    ask: {
      uz: "Baza faqat shu serverdagi ilovaga kerak. To‘g‘ri qaror?",
      en: "Only the app on this server uses the database. The right call?",
    },
    right: { uz: "127.0.0.1 ga bog‘lash", en: "Bind it to 127.0.0.1" },
    wrong: [
      { uz: "Ochiq qoldirish", en: "Keep it public" },
      { uz: "Portni almashtirish", en: "Change the port" },
      { uz: "Parolni olib tashlash", en: "Remove the password" },
    ],
    explain: {
      uz: "Port almashtirish — yashirish, himoya emas.",
      en: "Changing the port hides; it doesn’t protect.",
    },
  },
  {
    ask: {
      uz: "Telnet o‘rniga nima ishlatiladi?",
      en: "What replaces telnet?",
    },
    right: { uz: "SSH", en: "SSH" },
    wrong: [
      { uz: "FTP", en: "FTP" },
      { uz: "HTTP", en: "HTTP" },
      { uz: "SMTP", en: "SMTP" },
    ],
    explain: {
      uz: "Telnet parolni ochiq matnda yuboradi.",
      en: "Telnet sends passwords in clear text.",
    },
  },
  {
    ask: {
      uz: "Qaysi SSH sozlamasi mustahkamlaydi?",
      en: "Which SSH setting hardens it?",
    },
    right: { uz: "PasswordAuthentication no", en: "PasswordAuthentication no" },
    wrong: [
      { uz: "PermitRootLogin yes", en: "PermitRootLogin yes" },
      { uz: "PermitEmptyPasswords yes", en: "PermitEmptyPasswords yes" },
      { uz: "Port 23", en: "Port 23" },
    ],
    explain: {
      uz: "Faqat kalit bilan kirish — parol taxmini ishlamaydi.",
      en: "Keys only — password guessing stops working.",
    },
  },
  {
    ask: {
      uz: "fail2ban nima qiladi?",
      en: "What does fail2ban do?",
    },
    right: {
      uz: "Ko‘p xato urinishdan keyin IP ni bloklaydi",
      en: "Blocks an IP after repeated failures",
    },
    wrong: [
      { uz: "Parollarni shifrlaydi", en: "Encrypts passwords" },
      { uz: "Yangilanish o‘rnatadi", en: "Installs updates" },
      { uz: "Zaxira oladi", en: "Takes backups" },
    ],
    explain: {
      uz: "U loglarni kuzatib, firewall qoidasi qo‘shadi.",
      en: "It watches logs and adds firewall rules.",
    },
  },
  {
    ask: {
      uz: "Firewall uchun to‘g‘ri boshlang‘ich siyosat?",
      en: "The right default firewall policy?",
    },
    right: {
      uz: "Kiruvchi hammasi yopiq, keraklilari ochiladi",
      en: "Deny incoming, open only what’s needed",
    },
    wrong: [
      { uz: "Hammasi ochiq", en: "Allow everything" },
      { uz: "Faqat chiquvchini yopish", en: "Block only outgoing" },
      { uz: "Firewall kerak emas", en: "No firewall" },
    ],
    explain: {
      uz: "ufw default deny incoming.",
      en: "ufw default deny incoming.",
    },
  },
];

export const WINDOWS_POOL: PoolItem[] = [
  {
    ask: {
      uz: "Windows’dagi eng yuqori huquqli hisob?",
      en: "The most privileged account on Windows?",
    },
    right: { uz: "SYSTEM", en: "SYSTEM" },
    wrong: [
      { uz: "Guest", en: "Guest" },
      { uz: "Oddiy foydalanuvchi", en: "A standard user" },
      { uz: "Everyone", en: "Everyone" },
    ],
    explain: {
      uz: "SYSTEM — operatsion tizimning o‘zi.",
      en: "SYSTEM is the operating system itself.",
    },
  },
  {
    ask: { uz: "UAC nima qiladi?", en: "What does UAC do?" },
    right: {
      uz: "Tizimga tegadigan amal uchun alohida tasdiq so‘raydi",
      en: "Asks for confirmation before anything touches the system",
    },
    wrong: [
      { uz: "Diskni shifrlaydi", en: "Encrypts the disk" },
      { uz: "Viruslarni o‘chiradi", en: "Deletes viruses" },
      { uz: "Parolni saqlaydi", en: "Stores passwords" },
    ],
    explain: {
      uz: "Admin ham oddiy huquq bilan boshlaydi.",
      en: "Even an admin starts with standard rights.",
    },
  },
  {
    ask: {
      uz: "Kundalik ish uchun qanday hisob ishlatiladi?",
      en: "Which account is used for daily work?",
    },
    right: { uz: "Oddiy (standard) hisob", en: "A standard account" },
    wrong: [
      { uz: "Domain Admin", en: "Domain Admin" },
      { uz: "Lokal Administrator", en: "Local Administrator" },
      { uz: "SYSTEM", en: "SYSTEM" },
    ],
    explain: {
      uz: "Admin hisob faqat boshqaruv uchun.",
      en: "The admin account is for administration only.",
    },
  },
  {
    ask: { uz: "ACL nima?", en: "What is an ACL?" },
    right: {
      uz: "“Kimga — nima” huquq yozuvlari ro‘yxati",
      en: "A list of “who — what” permission entries",
    },
    wrong: [
      { uz: "Antivirus nomi", en: "An antivirus product" },
      { uz: "Tarmoq kabeli", en: "A network cable" },
      { uz: "Parol turi", en: "A kind of password" },
    ],
    explain: {
      uz: "Har bir fayl va papkada bor.",
      en: "Every file and folder has one.",
    },
  },
  {
    ask: {
      uz: "Qaysi NTFS huquqi huquqlarni ham o‘zgartiradi?",
      en: "Which NTFS right can change permissions?",
    },
    right: { uz: "Full control", en: "Full control" },
    wrong: [
      { uz: "Read", en: "Read" },
      { uz: "Modify", en: "Modify" },
      { uz: "List folder", en: "List folder" },
    ],
    explain: {
      uz: "Faqat administratorlarga beriladi.",
      en: "It’s for administrators only.",
    },
  },
  {
    ask: {
      uz: "Allow va Deny to‘qnashsa?",
      en: "Allow and Deny clash. Which wins?",
    },
    right: { uz: "Deny", en: "Deny" },
    wrong: [
      { uz: "Allow", en: "Allow" },
      { uz: "Oxirgi qo‘shilgani", en: "Whichever was added last" },
      { uz: "Tasodifiy", en: "Random" },
    ],
    explain: {
      uz: "Aniq taqiq ruxsatdan kuchli.",
      en: "An explicit deny beats an allow.",
    },
  },
  {
    ask: {
      uz: "Ish haqi papkasida “Everyone: Full control”. Xavf?",
      en: "A payroll folder grants “Everyone: Full control”. The risk?",
    },
    right: {
      uz: "Har kim o‘qiydi, o‘zgartiradi va huquqlarni qayta yozadi",
      en: "Anyone can read, change and rewrite its permissions",
    },
    wrong: [
      { uz: "Faqat sekinlashadi", en: "It only slows down" },
      { uz: "Xavf yo‘q", en: "No risk" },
      { uz: "Faqat adminlar ko‘radi", en: "Only admins see it" },
    ],
    explain: {
      uz: "Huquq faqat kerakli guruhga beriladi.",
      en: "Grant rights only to the group that needs them.",
    },
  },
  {
    ask: {
      uz: "Huquqlar odatda kimga beriladi?",
      en: "Who are permissions normally granted to?",
    },
    right: { uz: "Guruhlarga", en: "Groups" },
    wrong: [
      { uz: "Har bir odamga", en: "Each person" },
      { uz: "Everyone ga", en: "Everyone" },
      { uz: "Kompyuter nomiga", en: "Computer names" },
    ],
    explain: {
      uz: "Odam ketsa — guruhdan chiqariladi.",
      en: "When someone leaves, they leave the group.",
    },
  },
  {
    ask: {
      uz: "Domen hisoblari qayerda saqlanadi?",
      en: "Where are domain accounts stored?",
    },
    right: { uz: "Domen kontrollerda", en: "On the domain controller" },
    wrong: [
      { uz: "Har bir kompyuterda", en: "On each computer" },
      { uz: "Routerda", en: "On the router" },
      { uz: "Bulutda, hamisha", en: "Always in the cloud" },
    ],
    explain: {
      uz: "DC — eng muhim himoyalanadigan server.",
      en: "The DC is the server to protect most.",
    },
  },
  {
    ask: { uz: "Group Policy nima uchun?", en: "What is Group Policy for?" },
    right: {
      uz: "Sozlamani ko‘p kompyuterga markazdan qo‘llash",
      en: "Applying settings to many computers centrally",
    },
    wrong: [
      { uz: "Fayllarni zaxiralash", en: "Backing up files" },
      { uz: "Elektron pochta", en: "Email" },
      { uz: "Virus skanerlash", en: "Virus scanning" },
    ],
    explain: {
      uz: "GPO OU’ga bog‘lanadi.",
      en: "A GPO is linked to an OU.",
    },
  },
  {
    ask: {
      uz: "Event ID 4625 nimani bildiradi?",
      en: "What does Event ID 4625 mean?",
    },
    right: { uz: "Muvaffaqiyatsiz kirish", en: "A failed logon" },
    wrong: [
      { uz: "Muvaffaqiyatli kirish", en: "A successful logon" },
      { uz: "Log tozalandi", en: "The log was cleared" },
      { uz: "Yangi hisob", en: "A new account" },
    ],
    explain: {
      uz: "4624 — muvaffaqiyatli kirish.",
      en: "4624 is a successful logon.",
    },
  },
  {
    ask: {
      uz: "Event ID 1102 nimani bildiradi?",
      en: "What does Event ID 1102 mean?",
    },
    right: { uz: "Audit logi tozalandi", en: "The audit log was cleared" },
    wrong: [
      { uz: "Yangi foydalanuvchi", en: "A new user" },
      { uz: "Muvaffaqiyatsiz kirish", en: "A failed logon" },
      { uz: "Qayta yuklash", en: "A reboot" },
    ],
    explain: {
      uz: "Darhol tekshiriladigan signal.",
      en: "A signal to investigate at once.",
    },
  },
  {
    ask: {
      uz: "Event ID 4732 nimani bildiradi?",
      en: "What does Event ID 4732 mean?",
    },
    right: {
      uz: "Himoyalangan guruhga a’zo qo‘shildi",
      en: "A member was added to a security group",
    },
    wrong: [
      { uz: "Parol almashdi", en: "A password changed" },
      { uz: "Fayl o‘chirildi", en: "A file was deleted" },
      { uz: "Printer qo‘shildi", en: "A printer was added" },
    ],
    explain: {
      uz: "Administrators guruhiga qo‘shilish — muhim signal.",
      en: "Being added to Administrators is a key signal.",
    },
  },
  {
    ask: {
      uz: "Noutbuk o‘g‘irlandi. Qaysi vosita ma’lumotni saqlaydi?",
      en: "A laptop was stolen. Which tool protects its data?",
    },
    right: { uz: "BitLocker", en: "BitLocker" },
    wrong: [
      { uz: "Defender", en: "Defender" },
      { uz: "Event Viewer", en: "Event Viewer" },
      { uz: "Group Policy", en: "Group Policy" },
    ],
    explain: { uz: "U diskni shifrlaydi.", en: "It encrypts the disk." },
  },
  {
    ask: { uz: "LAPS nima qiladi?", en: "What does LAPS do?" },
    right: {
      uz: "Har bir kompyuterga alohida, almashadigan lokal admin paroli",
      en: "Gives each computer its own rotating local admin password",
    },
    wrong: [
      { uz: "Internetni tezlashtiradi", en: "Speeds up the internet" },
      { uz: "Fayllarni shifrlaydi", en: "Encrypts files" },
      { uz: "Loglarni o‘chiradi", en: "Deletes logs" },
    ],
    explain: {
      uz: "Bitta parol sizsa ham, tarmoq ochilmaydi.",
      en: "One leaked password doesn’t open the whole network.",
    },
  },
];

export const AUTHN_POOL: PoolItem[] = [
  {
    ask: {
      uz: "Autentifikatsiyaning uch omili?",
      en: "The three authentication factors?",
    },
    right: {
      uz: "Bilish, ega bo‘lish, o‘zingiz",
      en: "Something you know, have and are",
    },
    wrong: [
      { uz: "Login, parol, email", en: "Login, password, email" },
      { uz: "Kim, qachon, qayerda", en: "Who, when, where" },
      { uz: "Faqat parol", en: "Only a password" },
    ],
    explain: {
      uz: "MFA — kamida ikki xil tur.",
      en: "MFA uses at least two different kinds.",
    },
  },
  {
    ask: {
      uz: "Ikki xil parol ikki omilli autentifikatsiyami?",
      en: "Are two passwords two-factor authentication?",
    },
    right: { uz: "Yo‘q, ikkalasi ham “bilish”", en: "No, both are “know”" },
    wrong: [
      { uz: "Ha", en: "Yes" },
      { uz: "Faqat uzun bo‘lsa", en: "Only if they’re long" },
      { uz: "Faqat telefonda", en: "Only on a phone" },
    ],
    explain: {
      uz: "Omillar har xil turdan bo‘lishi kerak.",
      en: "Factors must be of different kinds.",
    },
  },
  {
    ask: {
      uz: "Zamonaviy parol siyosatida eng muhimi?",
      en: "What matters most in a modern password policy?",
    },
    right: {
      uz: "Uzunlik va sizib chiqqanlar ro‘yxati",
      en: "Length and the breached list",
    },
    wrong: [
      { uz: "Har 30 kunda almashtirish", en: "Changing it every 30 days" },
      { uz: "Faqat belgilar", en: "Symbols alone" },
      { uz: "Qisqa va oson", en: "Short and easy" },
    ],
    explain: {
      uz: "NIST SP 800-63B tavsiyasi.",
      en: "As NIST SP 800-63B advises.",
    },
  },
  {
    ask: {
      uz: "Parolni qachon majburan almashtirish kerak?",
      en: "When should a password be forcibly changed?",
    },
    right: { uz: "Sizib chiqqanda", en: "When it has leaked" },
    wrong: [
      { uz: "Har hafta", en: "Every week" },
      { uz: "Har 90 kunda", en: "Every 90 days" },
      { uz: "Hech qachon", en: "Never" },
    ],
    explain: {
      uz: "Tez-tez almashtirish bashorat qilinadigan parollar beradi.",
      en: "Frequent changes breed predictable passwords.",
    },
  },
  {
    ask: {
      uz: "Nega parol joylashtirishni (paste) bloklamaslik kerak?",
      en: "Why not block pasting into password fields?",
    },
    right: {
      uz: "Parol menejerlari ishlashi uchun",
      en: "So password managers work",
    },
    wrong: [
      { uz: "Sayt tezlashadi", en: "The site gets faster" },
      { uz: "Parol qisqaradi", en: "Passwords get shorter" },
      { uz: "Sabab yo‘q", en: "No reason" },
    ],
    explain: {
      uz: "Menejer har bir saytga uzun, noyob parol beradi.",
      en: "A manager gives every site a long, unique password.",
    },
  },
  {
    ask: {
      uz: "Parol qanday saqlanadi?",
      en: "How should passwords be stored?",
    },
    right: {
      uz: "Sekin, tuzli xesh (Argon2id, bcrypt)",
      en: "As a slow, salted hash (Argon2id, bcrypt)",
    },
    wrong: [
      { uz: "Ochiq matnda", en: "In plain text" },
      { uz: "MD5 bilan", en: "With MD5" },
      { uz: "Base64 bilan", en: "As Base64" },
    ],
    explain: {
      uz: "Sekinlik taxminni qimmat qiladi.",
      en: "Slowness makes guessing expensive.",
    },
  },
  {
    ask: { uz: "Tuz (salt) nima qiladi?", en: "What does a salt do?" },
    right: {
      uz: "Bir xil parollarga har xil xesh beradi",
      en: "Gives identical passwords different hashes",
    },
    wrong: [
      { uz: "Parolni shifrlaydi", en: "Encrypts the password" },
      { uz: "Parolni qisqartiradi", en: "Shortens the password" },
      { uz: "Hech narsa", en: "Nothing" },
    ],
    explain: {
      uz: "Oldindan hisoblangan jadvallar ishlamaydi.",
      en: "Precomputed tables stop working.",
    },
  },
  {
    ask: {
      uz: "Qaysi MFA fishingga chidamli?",
      en: "Which MFA resists phishing?",
    },
    right: {
      uz: "Xavfsizlik kaliti yoki passkey",
      en: "A security key or passkey",
    },
    wrong: [
      { uz: "SMS kod", en: "An SMS code" },
      { uz: "Maxfiy savol", en: "A security question" },
      { uz: "Email kod", en: "An email code" },
    ],
    explain: {
      uz: "U faqat haqiqiy sayt bilan ishlaydi.",
      en: "It works only with the real site.",
    },
  },
  {
    ask: {
      uz: "SMS kodning asosiy zaifligi?",
      en: "The main weakness of SMS codes?",
    },
    right: { uz: "SIM almashtirish (SIM swap)", en: "SIM swapping" },
    wrong: [
      { uz: "Juda uzun", en: "Too long" },
      { uz: "Internet kerak", en: "Needs internet" },
      { uz: "Zaifligi yo‘q", en: "No weakness" },
    ],
    explain: {
      uz: "Hujumchi raqamingizni o‘z SIM kartasiga o‘tkazadi.",
      en: "The attacker moves your number to their SIM.",
    },
  },
  {
    ask: {
      uz: "“MFA charchoq” hujumi nima?",
      en: "What is an “MFA fatigue” attack?",
    },
    right: {
      uz: "Foydalanuvchi zerikib, push so‘rovni tasdiqlab yuboradi",
      en: "Flooding push prompts until the user approves one",
    },
    wrong: [
      { uz: "Parolni unutish", en: "Forgetting a password" },
      { uz: "Telefonni yo‘qotish", en: "Losing a phone" },
      { uz: "Sekin internet", en: "Slow internet" },
    ],
    explain: {
      uz: "Raqam moslash buni to‘xtatadi.",
      en: "Number matching stops it.",
    },
  },
  {
    ask: {
      uz: "Hamkasbingizga serverga kirish kerak. Nima qilasiz?",
      en: "A colleague needs server access. What do you do?",
    },
    right: {
      uz: "U o‘z kalitini yaratib, ochiq qismini beradi",
      en: "They make their own key and share its public part",
    },
    wrong: [
      { uz: "Shaxsiy kalitingizni berasiz", en: "Give them your private key" },
      { uz: "Root parolini aytasiz", en: "Tell them the root password" },
      { uz: "Bitta umumiy kalit", en: "Share one common key" },
    ],
    explain: {
      uz: "Har kimning o‘z kaliti — ketganda faqat uniki o‘chiriladi.",
      en: "One key each — only theirs is removed when they leave.",
    },
  },
  {
    ask: {
      uz: "Ochiq SSH kalit qayerga qo‘yiladi?",
      en: "Where does a public SSH key go?",
    },
    right: {
      uz: "Serverdagi ~/.ssh/authorized_keys",
      en: "~/.ssh/authorized_keys on the server",
    },
    wrong: [
      { uz: "Elektron pochtaga", en: "Into an email" },
      { uz: "/etc/passwd", en: "/etc/passwd" },
      { uz: "GitHub README", en: "A GitHub README" },
    ],
    explain: {
      uz: "ssh-copy-id buni o‘zi qiladi.",
      en: "ssh-copy-id does it for you.",
    },
  },
  {
    ask: {
      uz: "Shaxsiy SSH kalitni nima himoya qiladi?",
      en: "What protects a private SSH key?",
    },
    right: { uz: "Parol iborasi (passphrase)", en: "A passphrase" },
    wrong: [
      { uz: "Fayl nomi", en: "Its file name" },
      { uz: "Ochiq kalit", en: "The public key" },
      { uz: "Hech narsa", en: "Nothing" },
    ],
    explain: {
      uz: "Noutbuk o‘g‘irlansa ham, kalit darhol ishlatilmaydi.",
      en: "A stolen laptop’s key can’t be used straight away.",
    },
  },
  {
    ask: { uz: "Password spraying nima?", en: "What is password spraying?" },
    right: {
      uz: "Bitta parolni ko‘p hisobga sinash",
      en: "Trying one password against many accounts",
    },
    wrong: [
      { uz: "Ko‘p parolni bitta hisobga", en: "Many passwords on one account" },
      { uz: "Parolni shifrlash", en: "Encrypting passwords" },
      { uz: "Parolni almashtirish", en: "Changing passwords" },
    ],
    explain: {
      uz: "U bloklash chegarasidan pastda qoladi.",
      en: "It stays under lockout limits.",
    },
  },
  {
    ask: {
      uz: "“Imkonsiz sayohat” signali nimani bildiradi?",
      en: "What does an “impossible travel” alert mean?",
    },
    right: {
      uz: "Bir hisob qisqa vaqtda uzoq joylardan kirgan",
      en: "One account signed in from far-apart places too quickly",
    },
    wrong: [
      { uz: "Foydalanuvchi ta’tilda", en: "The user is on holiday" },
      { uz: "Internet sekin", en: "Slow internet" },
      { uz: "Parol uzun", en: "A long password" },
    ],
    explain: {
      uz: "Ehtimol, sessiya yoki parol o‘g‘irlangan.",
      en: "A session or password was probably stolen.",
    },
  },
];
