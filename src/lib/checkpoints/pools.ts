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
