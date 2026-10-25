// Fixed question pools for the animated Academy labs: HTTP basics, HTTPS,
// Bash, SSH and cryptography. Each item lists the right option first; the
// checkpoint shuffles them per seed and asks ten of the fourteen.
import type { PoolItem } from "./pools";
import type { Text } from "../network/ip";

const same = (text: string): Text => ({ uz: text, en: text });

export const HTTP_BASICS_POOL: PoolItem[] = [
  {
    ask: {
      uz: "Brauzer va veb-sayt o‘rtasidagi suhbatni kim boshlaydi?",
      en: "Who starts the conversation between a browser and a website?",
    },
    right: {
      uz: "Mijoz (brauzer) so‘rov yuboradi, server javob beradi",
      en: "The client (browser) sends a request, the server answers",
    },
    wrong: [
      {
        uz: "Server o‘zi sahifalarni brauzerga yuboraveradi",
        en: "The server pushes pages to the browser on its own",
      },
      {
        uz: "Router so‘rovni o‘zi tuzib yuboradi",
        en: "The router writes the request by itself",
      },
      {
        uz: "Ikkalasi bir vaqtda gapira boshlaydi",
        en: "Both start talking at the same time",
      },
    ],
    explain: {
      uz: "HTTP — so‘rov/javob protokoli: har doim mijoz so‘raydi, server javob qaytaradi.",
      en: "HTTP is a request/response protocol: the client always asks, the server answers.",
    },
  },
  {
    ask: {
      uz: "So‘rovning birinchi qatorida qaysi uch qism bor?",
      en: "Which three parts make up the first line of a request?",
    },
    code: "POST /login HTTP/1.1",
    right: {
      uz: "Metod, yo‘l (path) va protokol versiyasi",
      en: "Method, path and protocol version",
    },
    wrong: [
      {
        uz: "Domen, port va parol",
        en: "Domain, port and password",
      },
      {
        uz: "Holat kodi, sarlavha va tana",
        en: "Status code, header and body",
      },
      {
        uz: "IP manzil, mask va gateway",
        en: "IP address, mask and gateway",
      },
    ],
    explain: {
      uz: "POST — metod, /login — so‘ralayotgan yo‘l, HTTP/1.1 — protokol versiyasi.",
      en: "POST is the method, /login the path asked for, HTTP/1.1 the protocol version.",
    },
  },
  {
    ask: {
      uz: "So‘rovdagi Host sarlavhasi nimani bildiradi?",
      en: "What does the Host header of a request say?",
    },
    code: "Host: shop.uz",
    right: {
      uz: "So‘rov qaysi sayt (domen) uchun ekanini",
      en: "Which site (domain) the request is for",
    },
    wrong: [
      { uz: "Foydalanuvchining parolini", en: "The user's password" },
      { uz: "Brauzer qaysi ekanini", en: "Which browser is used" },
      { uz: "Javob qancha kutilishini", en: "How long to wait for an answer" },
    ],
    explain: {
      uz: "Bitta serverda ko‘p sayt bo‘lishi mumkin; Host qaysi biri kerakligini aytadi. Brauzerni User-Agent bildiradi.",
      en: "One server can host many sites; Host says which one is wanted. The browser is named by User-Agent.",
    },
  },
  {
    ask: {
      uz: "Sarlavhalar bilan so‘rov tanasini nima ajratib turadi?",
      en: "What separates the headers from the request body?",
    },
    right: { uz: "Bitta bo‘sh qator", en: "One empty line" },
    wrong: [
      { uz: "Nuqtali vergul", en: "A semicolon" },
      { uz: "Content-Length sarlavhasi", en: "The Content-Length header" },
      {
        uz: "Hech narsa — ular aralash yoziladi",
        en: "Nothing, they are mixed",
      },
    ],
    explain: {
      uz: "Bo‘sh qator “sarlavhalar tugadi” degani; undan keyin tana (masalan, forma ma’lumoti) keladi.",
      en: "The empty line means “headers are over”; the body (form data, say) comes after it.",
    },
  },
  {
    ask: {
      uz: "Kirish formasidagi login va parolni yuborish uchun qaysi metod to‘g‘ri?",
      en: "Which method fits sending a login form's username and password?",
    },
    right: same("POST"),
    wrong: [same("GET"), same("DELETE"), same("HEAD")],
    explain: {
      uz: "POST ma’lumotni so‘rov tanasida yuboradi. GET ularni manzil qatoriga, tarix va loglarga yozib qo‘yadi.",
      en: "POST sends the data in the request body. GET would put it in the URL, the history and the logs.",
    },
  },
  {
    ask: {
      uz: "Nega parolni GET so‘rovi bilan yuborish yomon fikr?",
      en: "Why is sending a password with a GET request a bad idea?",
    },
    code: "GET /login?user=ali&pass=Qwerty-2026",
    right: {
      uz: "Parol manzilda qoladi: brauzer tarixi, server loglari, havolalar",
      en: "The password stays in the URL: browser history, server logs, shared links",
    },
    wrong: [
      {
        uz: "GET so‘rovlari serverga yetib bormaydi",
        en: "GET requests never reach the server",
      },
      {
        uz: "GET faqat rasmlar uchun ishlaydi",
        en: "GET only works for images",
      },
      {
        uz: "GET parolni avtomatik o‘chirib yuboradi",
        en: "GET deletes the password automatically",
      },
    ],
    explain: {
      uz: "GET parametrlari URL’ning bir qismi, URL esa ko‘p joyda saqlanadi va ko‘rinadi.",
      en: "GET parameters are part of the URL, and URLs are stored and shown in many places.",
    },
  },
  {
    ask: {
      uz: "Mahsulotlar ro‘yxatini ochish (hech narsani o‘zgartirmasdan) uchun qaysi metod?",
      en: "Which method opens a product list without changing anything?",
    },
    right: same("GET"),
    wrong: [same("POST"), same("DELETE"), same("PUT")],
    explain: {
      uz: "GET ma’lumotni faqat oladi. O‘zgartirish uchun POST, PUT yoki DELETE ishlatiladi.",
      en: "GET only fetches. Changes use POST, PUT or DELETE.",
    },
  },
  {
    ask: {
      uz: "Javobning birinchi qatoridagi “200 OK” nimani bildiradi?",
      en: "What does “200 OK” on the first line of a response mean?",
    },
    code: "HTTP/1.1 200 OK",
    right: {
      uz: "So‘rov muvaffaqiyatli bajarildi",
      en: "The request succeeded",
    },
    wrong: [
      { uz: "Sahifa topilmadi", en: "The page was not found" },
      { uz: "Server xatoga uchradi", en: "The server crashed" },
      { uz: "Avval tizimga kiring", en: "Sign in first" },
    ],
    explain: {
      uz: "2xx oilasi — muvaffaqiyat; 200 eng ko‘p uchraydigan “hammasi joyida” kodi.",
      en: "The 2xx family means success; 200 is the most common “all fine” code.",
    },
  },
  {
    ask: {
      uz: "Javobdagi Content-Type sarlavhasi nima uchun kerak?",
      en: "What is the Content-Type header of a response for?",
    },
    code: "Content-Type: text/html; charset=utf-8",
    right: {
      uz: "Brauzerga tana qanday ma’lumot ekanini aytadi (HTML, JSON, rasm…)",
      en: "It tells the browser what kind of data the body is (HTML, JSON, an image…)",
    },
    wrong: [
      {
        uz: "Sahifani shifrlaydi",
        en: "It encrypts the page",
      },
      {
        uz: "Foydalanuvchini aniqlaydi",
        en: "It identifies the user",
      },
      {
        uz: "So‘rov qaysi metod bilan kelganini aytadi",
        en: "It says which method the request used",
      },
    ],
    explain: {
      uz: "text/html bo‘lsa brauzer sahifa chizadi, application/json bo‘lsa ma’lumot sifatida o‘qiydi.",
      en: "With text/html the browser draws a page; with application/json it reads data.",
    },
  },
  {
    ask: {
      uz: "Set-Cookie sarlavhasi nima qiladi?",
      en: "What does a Set-Cookie header do?",
    },
    code: "Set-Cookie: session=7f2a; HttpOnly; Secure",
    right: {
      uz: "Brauzerga keyingi so‘rovlarda qaytarib yuboriladigan qiymatni saqlatadi",
      en: "It has the browser store a value it sends back on later requests",
    },
    wrong: [
      {
        uz: "Serverdagi faylni o‘chiradi",
        en: "It deletes a file on the server",
      },
      {
        uz: "Sahifani keshdan tozalaydi",
        en: "It clears the page from the cache",
      },
      {
        uz: "Parolni ekranga chiqaradi",
        en: "It shows the password on screen",
      },
    ],
    explain: {
      uz: "Cookie orqali server sizni keyingi so‘rovlarda “taniydi” — masalan, kirgan sessiyangizni.",
      en: "With a cookie the server “remembers” you on later requests, your signed-in session for example.",
    },
  },
  {
    ask: {
      uz: "Mavjud bo‘lmagan sahifani so‘raganda odatda qaysi kod qaytadi?",
      en: "Which code usually comes back for a page that does not exist?",
    },
    right: same("404 Not Found"),
    wrong: [
      same("200 OK"),
      same("500 Internal Server Error"),
      same("301 Moved Permanently"),
    ],
    explain: {
      uz: "4xx — mijoz tomonidagi xato: noto‘g‘ri manzil, ruxsat yo‘q va hokazo. 404 — “bunday narsa yo‘q”.",
      en: "4xx is a client-side error: a wrong address, no permission and so on. 404 means “no such thing”.",
    },
  },
  {
    ask: {
      uz: "5xx oilasidagi kod (masalan, 500) kimning xatosini bildiradi?",
      en: "Whose fault does a 5xx code (500, say) point to?",
    },
    right: {
      uz: "Serverning — u so‘rovni bajara olmadi",
      en: "The server's: it could not carry out the request",
    },
    wrong: [
      {
        uz: "Foydalanuvchining — u manzilni xato yozdi",
        en: "The user's: they mistyped the address",
      },
      {
        uz: "Hech kimning — bu muvaffaqiyat kodi",
        en: "Nobody's: it is a success code",
      },
      {
        uz: "Brauzerning — u eskirgan",
        en: "The browser's: it is out of date",
      },
    ],
    explain: {
      uz: "2xx — muvaffaqiyat, 3xx — yo‘naltirish, 4xx — mijoz xatosi, 5xx — server xatosi.",
      en: "2xx success, 3xx redirect, 4xx client error, 5xx server error.",
    },
  },
  {
    ask: {
      uz: "Sayt sizni boshqa manzilga yo‘naltirsa, qaysi oiladagi kod keladi?",
      en: "When a site sends you to another address, which code family comes back?",
    },
    right: same("3xx"),
    wrong: [same("2xx"), same("4xx"), same("5xx")],
    explain: {
      uz: "301 va 302 kabi 3xx kodlari Location sarlavhasida yangi manzilni beradi.",
      en: "3xx codes like 301 and 302 give the new address in a Location header.",
    },
  },
  {
    ask: {
      uz: "Brauzerdagi Network paneli nimani ko‘rsatadi?",
      en: "What does the browser's Network panel show?",
    },
    right: {
      uz: "Sahifa yuborgan har bir so‘rov: metod, manzil, holat kodi, sarlavhalar",
      en: "Every request the page made: method, address, status code, headers",
    },
    wrong: [
      {
        uz: "Faqat sahifadagi rasmlarni",
        en: "Only the images on the page",
      },
      {
        uz: "Serverning ichki fayllarini",
        en: "The server's internal files",
      },
      {
        uz: "Boshqa foydalanuvchilarning parollarini",
        en: "Other users' passwords",
      },
    ],
    explain: {
      uz: "F12 → Network: bitta sahifa ochilganda o‘nlab so‘rov ketadi, har birini ochib ko‘rish mumkin.",
      en: "F12 → Network: one page load makes dozens of requests, and each can be opened.",
    },
  },
];

export const HTTPS_POOL: PoolItem[] = [
  {
    ask: {
      uz: "Kafedagi ochiq Wi-Fi’da oddiy HTTP bilan yuborilgan parolni kim ko‘ra oladi?",
      en: "On open café Wi-Fi, who can see a password sent over plain HTTP?",
    },
    right: {
      uz: "Shu tarmoqdagi istalgan odam, trafikni tinglasa",
      en: "Anyone on that network who listens to the traffic",
    },
    wrong: [
      {
        uz: "Hech kim — Wi-Fi o‘zi shifrlaydi",
        en: "Nobody, Wi-Fi encrypts it anyway",
      },
      { uz: "Faqat sayt egasi", en: "Only the site owner" },
      {
        uz: "Faqat kafe egasi, parol so‘rasa",
        en: "Only the café owner, if they ask",
      },
    ],
    explain: {
      uz: "HTTP ochiq matn: yo‘ldagi har bir qurilma so‘rovni o‘qiy oladi.",
      en: "HTTP is plain text: every device on the way can read the request.",
    },
  },
  {
    ask: {
      uz: "HTTPS nima?",
      en: "What is HTTPS?",
    },
    right: {
      uz: "TLS shifrlangan kanali ichida yuboriladigan oddiy HTTP",
      en: "Ordinary HTTP sent inside an encrypted TLS channel",
    },
    wrong: [
      {
        uz: "HTTP’ning tezroq, lekin shifrlanmagan turi",
        en: "A faster but unencrypted kind of HTTP",
      },
      {
        uz: "Faqat bank saytlari uchun alohida protokol",
        en: "A separate protocol only for bank sites",
      },
      {
        uz: "Viruslarni tekshiradigan dastur",
        en: "A program that checks for viruses",
      },
    ],
    explain: {
      uz: "HTTPS = HTTP + TLS. So‘rovlar o‘sha-o‘sha, faqat shifrlangan “tunnel” ichida yuradi.",
      en: "HTTPS = HTTP + TLS. The requests are the same, carried inside an encrypted “tunnel”.",
    },
  },
  {
    ask: {
      uz: "Simmetrik shifrlashning asosiy belgisi qaysi?",
      en: "What is the key feature of symmetric encryption?",
    },
    right: {
      uz: "Qulflash va ochish uchun bitta kalit ishlatiladi",
      en: "One key both locks and unlocks",
    },
    wrong: [
      {
        uz: "Kalit umuman kerak emas",
        en: "No key is needed at all",
      },
      {
        uz: "Ochiq kalit bilan ochiladi",
        en: "It is opened with the public key",
      },
      {
        uz: "Ma’lumotni qaytarib bo‘lmaydi",
        en: "The data can never be turned back",
      },
    ],
    explain: {
      uz: "Ikkala tomon bir xil kalitga ega bo‘lishi kerak — muammo shu kalitni xavfsiz kelishishda.",
      en: "Both sides need the same key; the hard part is agreeing on it safely.",
    },
  },
  {
    ask: {
      uz: "Kalitni 3 ga surilgan Sezar shifrida “abc” nima bo‘ladi?",
      en: "In a Caesar cipher with a shift of 3, what does “abc” become?",
    },
    right: same("def"),
    wrong: [same("xyz"), same("bcd"), same("cba")],
    explain: {
      uz: "Har bir harf alifbo bo‘yicha 3 ta oldinga suriladi: a→d, b→e, c→f.",
      en: "Every letter moves 3 places along the alphabet: a→d, b→e, c→f.",
    },
  },
  {
    ask: {
      uz: "Ochiq (public) kalit va yopiq (private) kalit haqida qaysi gap to‘g‘ri?",
      en: "Which is true about the public key and the private key?",
    },
    right: {
      uz: "Ochiq kalitni hamma ko‘rishi mumkin, yopiq kalit serverdan chiqmaydi",
      en: "Anyone may see the public key; the private key never leaves the server",
    },
    wrong: [
      {
        uz: "Ikkalasi ham sir saqlanishi kerak",
        en: "Both must be kept secret",
      },
      {
        uz: "Yopiq kalit brauzerga yuboriladi",
        en: "The private key is sent to the browser",
      },
      {
        uz: "Ular bir xil kalitning ikki nomi",
        en: "They are two names for the same key",
      },
    ],
    explain: {
      uz: "Ochiq kalit — qulf, uni hammaga berish mumkin. Yopiq kalit — kalitning o‘zi, faqat egasida.",
      en: "The public key is a padlock you can hand out. The private key is the key itself, kept by its owner.",
    },
  },
  {
    ask: {
      uz: "TLS qo‘l siqishuvida ClientHello xabarida brauzer nima yuboradi?",
      en: "In the TLS handshake, what does the browser send in ClientHello?",
    },
    right: {
      uz: "O‘zi biladigan TLS versiyalari va shifrlar ro‘yxati",
      en: "The TLS versions and ciphers it knows",
    },
    wrong: [
      { uz: "Foydalanuvchi paroli", en: "The user's password" },
      { uz: "Saytning sertifikati", en: "The site's certificate" },
      { uz: "Serverning yopiq kaliti", en: "The server's private key" },
    ],
    explain: {
      uz: "ClientHello — taklif; ServerHello’da server bittasini tanlaydi va sertifikatini yuboradi.",
      en: "ClientHello is an offer; in ServerHello the server picks one and sends its certificate.",
    },
  },
  {
    ask: {
      uz: "HTTPS bilan ochilgan sahifada yo‘ldagi kuzatuvchi nimani baribir ko‘radi?",
      en: "With HTTPS, what can an eavesdropper on the way still see?",
    },
    right: {
      uz: "Qaysi saytga (domenga) ulanayotganingizni",
      en: "Which site (domain) you are connecting to",
    },
    wrong: [
      { uz: "Kiritgan parolingizni", en: "The password you typed" },
      {
        uz: "Sahifa yo‘lini (/account/cards)",
        en: "The page path (/account/cards)",
      },
      { uz: "Cookie’laringizni", en: "Your cookies" },
    ],
    explain: {
      uz: "Domen va IP manzil ochiq qoladi. Yo‘l, sarlavhalar, cookie, parol va kontent shifrlanadi.",
      en: "The domain and IP address stay visible. The path, headers, cookies, passwords and content are encrypted.",
    },
  },
  {
    ask: {
      uz: "Sertifikatdagi Subject (CN) va SAN maydonlari nimani ko‘rsatadi?",
      en: "What do a certificate's Subject (CN) and SAN fields show?",
    },
    code: "SAN: bank.uz, www.bank.uz",
    right: {
      uz: "Sertifikat qaysi domen(lar) uchun berilganini",
      en: "Which domain(s) the certificate was issued for",
    },
    wrong: [
      { uz: "Sertifikatni kim imzolaganini", en: "Who signed the certificate" },
      { uz: "Saytning yopiq kalitini", en: "The site's private key" },
      { uz: "Foydalanuvchi ismini", en: "The user's name" },
    ],
    explain: {
      uz: "Imzolovchini Issuer maydoni aytadi. Brauzer manzil qatoridagi domen SAN’da borligini tekshiradi.",
      en: "The signer is in the Issuer field. The browser checks that the address-bar domain is in the SAN.",
    },
  },
  {
    ask: {
      uz: "Sertifikat ichida nima hech qachon bo‘lmaydi?",
      en: "What is never inside a certificate?",
    },
    right: {
      uz: "Saytning yopiq kaliti",
      en: "The site's private key",
    },
    wrong: [
      { uz: "Ochiq kalit", en: "The public key" },
      { uz: "Amal qilish muddati", en: "The validity dates" },
      {
        uz: "Sertifikat markazining imzosi",
        en: "The certificate authority's signature",
      },
    ],
    explain: {
      uz: "Sertifikat — ochiq hujjat, uni har bir mehmon oladi. Yopiq kalit faqat serverda turadi.",
      en: "A certificate is public; every visitor gets it. The private key stays on the server.",
    },
  },
  {
    ask: {
      uz: "Brauzer sertifikatga nega ishonadi?",
      en: "Why does a browser trust a certificate?",
    },
    right: {
      uz: "U brauzerga oldindan o‘rnatilgan ildiz CA’gacha imzolar zanjiri bilan bog‘langan",
      en: "A chain of signatures links it to a root CA built into the browser",
    },
    wrong: [
      {
        uz: "Sayt o‘zi “menga ishoning” deb yozgan",
        en: "The site wrote “trust me” in it",
      },
      {
        uz: "Sahifada qulf rasmi bor",
        en: "The page has a padlock image on it",
      },
      {
        uz: "Domen nomi chiroyli",
        en: "The domain name looks nice",
      },
    ],
    explain: {
      uz: "Sayt sertifikati → oraliq CA → ildiz CA. Ildiz CA’lar ro‘yxati brauzer va tizimda saqlanadi.",
      en: "Site certificate → intermediate CA → root CA. The list of root CAs ships with the browser and system.",
    },
  },
  {
    ask: {
      uz: "Brauzer “Sertifikat muddati tugagan” deb ogohlantirdi. Eng to‘g‘ri harakat?",
      en: "The browser warns “certificate expired”. What is the right move?",
    },
    right: {
      uz: "To‘xtash va parol yoki karta ma’lumotini kiritmaslik",
      en: "Stop and do not type a password or card details",
    },
    wrong: [
      {
        uz: "“Baribir davom etish”ni bosish",
        en: "Click “Proceed anyway”",
      },
      {
        uz: "Kompyuter soatini orqaga surish",
        en: "Set the computer clock back",
      },
      {
        uz: "Sahifani yangilab, parolni qayta kiritish",
        en: "Reload and type the password again",
      },
    ],
    explain: {
      uz: "Ogohlantirish ulanishga ishonib bo‘lmasligini bildiradi: kimdir o‘rtada turgan bo‘lishi mumkin.",
      en: "The warning means the connection cannot be trusted: someone may be in the middle.",
    },
  },
  {
    ask: {
      uz: "Quyidagilardan qaysi biri sertifikat ogohlantirishiga sabab bo‘lmaydi?",
      en: "Which of these does not cause a certificate warning?",
    },
    right: {
      uz: "Sayt sekin yuklanayotgani",
      en: "The site loading slowly",
    },
    wrong: [
      {
        uz: "Sertifikat boshqa domen uchun berilgan",
        en: "It was issued for another domain",
      },
      { uz: "Sertifikat o‘z-o‘zini imzolagan", en: "It is self-signed" },
      { uz: "Sertifikat muddati o‘tgan", en: "It has expired" },
    ],
    explain: {
      uz: "Asosiy sabablar: muddati o‘tgan, boshqa domen uchun, o‘z-o‘zini imzolagan yoki noma’lum markazdan.",
      en: "The main causes: expired, for another domain, self-signed or from an unknown authority.",
    },
  },
  {
    ask: {
      uz: "Manzil qatorida qulf belgisi bor. Bu sayt firibgar emasligini kafolatlaydimi?",
      en: "The address bar shows a padlock. Does that prove the site is not a scam?",
    },
    right: {
      uz: "Yo‘q — qulf faqat ulanish shifrlanganini bildiradi",
      en: "No: the padlock only means the connection is encrypted",
    },
    wrong: [
      {
        uz: "Ha — firibgarlar sertifikat ololmaydi",
        en: "Yes: scammers cannot get certificates",
      },
      {
        uz: "Ha — qulf davlat tomonidan beriladi",
        en: "Yes: the government hands out padlocks",
      },
      {
        uz: "Ha, agar sayt .uz bilan tugasa",
        en: "Yes, if the site ends in .uz",
      },
    ],
    explain: {
      uz: "Firibgar ham o‘z domeniga bepul sertifikat oladi. HTTPS yo‘ldagi ma’lumotni himoyalaydi, saytning halolligini emas.",
      en: "A scammer can get a free certificate for their own domain. HTTPS protects data on the way, not the site's honesty.",
    },
  },
  {
    ask: {
      uz: "Nega TLS’da avval ochiq kalitli kriptografiya, keyin simmetrik shifr ishlatiladi?",
      en: "Why does TLS use public-key cryptography first and then a symmetric cipher?",
    },
    right: {
      uz: "Ochiq kalit bilan umumiy kalit xavfsiz kelishiladi, simmetrik shifr esa tez ishlaydi",
      en: "The public key lets both sides agree on a shared key safely; the symmetric cipher is fast",
    },
    wrong: [
      {
        uz: "Ikkala usul bir xil, shunchaki ehtiyot uchun",
        en: "The two are the same, it is just for safety",
      },
      {
        uz: "Simmetrik shifr faqat rasmlar uchun",
        en: "The symmetric cipher is only for images",
      },
      {
        uz: "Ochiq kalit parolni saqlash uchun",
        en: "The public key is for storing the password",
      },
    ],
    explain: {
      uz: "Qo‘l siqishuvda kalit kelishiladi, so‘ng butun suhbat o‘sha umumiy kalit bilan tez shifrlanadi.",
      en: "The handshake agrees on a key; then the whole conversation is quickly encrypted with that shared key.",
    },
  },
];

export const BASH_POOL: PoolItem[] = [
  {
    ask: {
      uz: "Bash skript nima uchun kerak?",
      en: "What is a Bash script for?",
    },
    right: {
      uz: "Takroriy ishlarni avtomatlashtirish: zaxira, log tekshirish, fayllarni qayta nomlash",
      en: "Automating repeated work: backups, checking logs, renaming files",
    },
    wrong: [
      {
        uz: "Faqat veb-sahifa dizayni uchun",
        en: "Only for designing web pages",
      },
      {
        uz: "Kompyuterni tezlashtirish uchun",
        en: "To make the computer faster",
      },
      {
        uz: "Internetni shifrlash uchun",
        en: "To encrypt the internet",
      },
    ],
    explain: {
      uz: "Skript — bu ketma-ket buyruqlar fayli. Bir marta yoziladi, ko‘p marta ishlatiladi.",
      en: "A script is a file of commands in order. Written once, run many times.",
    },
  },
  {
    ask: {
      uz: "Skriptning birinchi qatoridagi “#!/bin/bash” nima?",
      en: "What is “#!/bin/bash” on the first line of a script?",
    },
    code: "#!/bin/bash",
    right: {
      uz: "Shebang: skriptni qaysi dastur bajarishini aytadi",
      en: "The shebang: it says which program runs the script",
    },
    wrong: [
      {
        uz: "Oddiy izoh, hech narsa qilmaydi",
        en: "A plain comment that does nothing",
      },
      { uz: "Skript muallifining ismi", en: "The script author's name" },
      { uz: "Parol", en: "A password" },
    ],
    explain: {
      uz: "#! dan keyingi yo‘l — interpretator. Qolgan # bilan boshlanadigan qatorlar izoh.",
      en: "The path after #! is the interpreter. Other lines starting with # are comments.",
    },
  },
  {
    ask: {
      uz: "O‘zgaruvchiga qiymat berishning to‘g‘ri yozuvi qaysi?",
      en: "Which line assigns a variable correctly?",
    },
    right: same("NAME=Ali"),
    wrong: [same("NAME = Ali"), same("$NAME=Ali"), same("set NAME: Ali")],
    explain: {
      uz: "= atrofida bo‘sh joy bo‘lmaydi. Bo‘sh joy bo‘lsa, Bash NAME’ni buyruq deb o‘ylaydi.",
      en: "No spaces around =. With spaces, Bash thinks NAME is a command.",
    },
  },
  {
    ask: {
      uz: "NAME=Ali bo‘lsa, quyidagi buyruq nima chiqaradi?",
      en: "With NAME=Ali, what does this print?",
    },
    code: 'echo "Salom, $NAME"',
    right: same("Salom, Ali"),
    wrong: [same("Salom, $NAME"), same("Salom, NAME"), same("Salom,")],
    explain: {
      uz: "Qo‘shtirnoq ichida $NAME qiymati bilan almashtiriladi.",
      en: "Inside double quotes, $NAME is replaced by its value.",
    },
  },
  {
    ask: {
      uz: "NAME=Ali bo‘lsa, quyidagi buyruq nima chiqaradi?",
      en: "With NAME=Ali, what does this print?",
    },
    code: "echo 'Salom, $NAME'",
    right: same("Salom, $NAME"),
    wrong: [same("Salom, Ali"), same("Salom, NAME"), same("Salom,")],
    explain: {
      uz: "Bitta tirnoq ichida hech narsa almashtirilmaydi — matn aynan shunday chiqadi.",
      en: "Inside single quotes nothing is replaced: the text prints as written.",
    },
  },
  {
    ask: {
      uz: "Quyidagi buyruq nima chiqaradi?",
      en: "What does this print?",
    },
    code: "A=7; B=5; echo $((A + B))",
    right: same("12"),
    wrong: [same("75"), same("A + B"), same("7 + 5")],
    explain: {
      uz: "$(( )) ichida Bash hisob-kitob qiladi. Ichkarida $ belgisi ixtiyoriy.",
      en: "Inside $(( )) Bash does arithmetic. The $ sign is optional inside.",
    },
  },
  {
    ask: {
      uz: "Bu sikl necha marta “Checking” deb yozadi?",
      en: "How many times does this loop print “Checking”?",
    },
    code: 'for FILE in app.log auth.log db.log; do\n  echo "Checking $FILE"\ndone',
    right: same("3"),
    wrong: [same("1"), same("0"), same("4")],
    explain: {
      uz: "for ro‘yxatdagi har bir so‘z uchun do … done orasidagi qatorlarni bir marta bajaradi.",
      en: "for runs the lines between do and done once for each word in the list.",
    },
  },
  {
    ask: {
      uz: "for siklida do va done orasidagi qatorlar nima deb ataladi?",
      en: "What are the lines between do and done in a for loop called?",
    },
    right: { uz: "Sikl tanasi", en: "The loop body" },
    wrong: [
      { uz: "Shebang", en: "The shebang" },
      { uz: "Argumentlar", en: "The arguments" },
      { uz: "Izohlar", en: "Comments" },
    ],
    explain: {
      uz: "Tana — har bir aylanishda takrorlanadigan qism.",
      en: "The body is the part repeated on every pass.",
    },
  },
  {
    ask: {
      uz: "Bu while sikli nima chiqaradi?",
      en: "What does this while loop print?",
    },
    code: "i=3\nwhile [ $i -gt 0 ]; do\n  echo $i\n  i=$((i - 1))\ndone",
    right: same("3 2 1"),
    wrong: [same("3 2 1 0"), same("1 2 3"), same("3")],
    explain: {
      uz: "-gt — “katta”. i 0 ga tushganda shart yolg‘on bo‘ladi va sikl to‘xtaydi.",
      en: "-gt means “greater than”. When i reaches 0 the test is false and the loop stops.",
    },
  },
  {
    ask: {
      uz: "Agar while siklida hisoblagich hech qachon o‘zgarmasa nima bo‘ladi?",
      en: "What happens if the counter in a while loop never changes?",
    },
    right: {
      uz: "Sikl cheksiz aylanadi",
      en: "The loop never ends",
    },
    wrong: [
      { uz: "Sikl bir marta ishlaydi", en: "The loop runs once" },
      { uz: "Bash xatoni o‘zi tuzatadi", en: "Bash fixes the mistake itself" },
      { uz: "Sikl umuman boshlanmaydi", en: "The loop never starts" },
    ],
    explain: {
      uz: "Shart doim rost bo‘lib qoladi. Shuning uchun tanada hisoblagichni o‘zgartirish shart.",
      en: "The test stays true forever, so the body must change the counter.",
    },
  },
  {
    ask: {
      uz: "Sonlarni “teng” deb solishtirish uchun qaysi operator ishlatiladi?",
      en: "Which operator tests two numbers for “equal”?",
    },
    right: same("-eq"),
    wrong: [same("-ne"), same("-lt"), same("-gt")],
    explain: {
      uz: "-eq teng, -ne teng emas, -lt kichik, -gt katta. Qavslar ichida bo‘sh joylar shart: [ $a -eq 5 ].",
      en: "-eq equal, -ne not equal, -lt less, -gt greater. Spaces inside the brackets are required: [ $a -eq 5 ].",
    },
  },
  {
    ask: {
      uz: "Skript “./check.sh auth.log 5” bilan ishga tushdi. $1 nimaga teng?",
      en: "A script was run as “./check.sh auth.log 5”. What is $1?",
    },
    right: same("auth.log"),
    wrong: [same("5"), same("./check.sh"), same("2")],
    explain: {
      uz: "$1 — birinchi argument, $2 — ikkinchisi, $# — nechta argument berilgani (bu yerda 2).",
      en: "$1 is the first argument, $2 the second, $# how many were given (2 here).",
    },
  },
  {
    ask: {
      uz: "“echo xato >> log.txt” buyrug‘i nima qiladi?",
      en: "What does “echo error >> log.txt” do?",
    },
    right: {
      uz: "Qatorni log.txt oxiriga qo‘shadi",
      en: "Adds the line to the end of log.txt",
    },
    wrong: [
      {
        uz: "log.txt’ni o‘chirib, faqat shu qatorni yozadi",
        en: "Wipes log.txt and writes only this line",
      },
      { uz: "log.txt’ni ekranga chiqaradi", en: "Prints log.txt on screen" },
      { uz: "log.txt’ni o‘chiradi", en: "Deletes log.txt" },
    ],
    explain: {
      uz: "> faylni qaytadan yozadi, >> esa oxiriga qo‘shadi.",
      en: "> overwrites the file, >> appends to it.",
    },
  },
  {
    ask: {
      uz: "Internetdan olingan skriptni ishga tushirishdan oldin nima qilish kerak?",
      en: "What should you do before running a script from the internet?",
    },
    right: {
      uz: "Uni o‘qib chiqish: skript sizning huquqlaringiz bilan ishlaydi",
      en: "Read it: a script runs with your own permissions",
    },
    wrong: [
      {
        uz: "Hech narsa — skriptlar xavfsiz bo‘ladi",
        en: "Nothing, scripts are always safe",
      },
      {
        uz: "Darhol sudo bilan ishga tushirish",
        en: "Run it with sudo straight away",
      },
      {
        uz: "Faqat nomini o‘zgartirish",
        en: "Just rename it",
      },
    ],
    explain: {
      uz: "Skript fayllaringizni o‘chirishi yoki ma’lumotni yuborishi mumkin. Avval o‘qing, keyin ishlating.",
      en: "A script could delete your files or send data away. Read first, run later.",
    },
  },
];

export const SSH_POOL: PoolItem[] = [
  {
    ask: {
      uz: "SSH nima uchun ishlatiladi?",
      en: "What is SSH used for?",
    },
    right: {
      uz: "Uzoqdagi kompyuterga shifrlangan kanal orqali ulanib, buyruq berish",
      en: "Connecting to a remote computer over an encrypted channel and running commands",
    },
    wrong: [
      {
        uz: "Veb-sahifalarni chiroyli ko‘rsatish",
        en: "Making web pages look nice",
      },
      { uz: "Fayllarni siqish", en: "Compressing files" },
      { uz: "Wi-Fi parolini topish", en: "Finding a Wi-Fi password" },
    ],
    explain: {
      uz: "SSH bilan server terminali xuddi o‘z kompyuteringizdagidek ishlaydi, lekin buyruqlar serverda bajariladi.",
      en: "With SSH a server's terminal works as if it were local, but the commands run on the server.",
    },
  },
  {
    ask: {
      uz: "SSH serveri odatda qaysi portni tinglaydi?",
      en: "Which port does an SSH server listen on by default?",
    },
    right: same("22"),
    wrong: [same("80"), same("443"), same("21")],
    explain: {
      uz: "22 — SSH, 80 — HTTP, 443 — HTTPS. Boshqa port bo‘lsa, “-p” bilan beriladi.",
      en: "22 is SSH, 80 HTTP, 443 HTTPS. Another port is given with “-p”.",
    },
  },
  {
    ask: {
      uz: "Bu buyruqda “ali” nima?",
      en: "In this command, what is “ali”?",
    },
    code: "ssh -p 2222 ali@203.0.113.10",
    right: {
      uz: "Serverdagi foydalanuvchi nomi",
      en: "The user name on the server",
    },
    wrong: [
      { uz: "Server nomi", en: "The server's name" },
      { uz: "Parol", en: "The password" },
      { uz: "Kalit fayli", en: "The key file" },
    ],
    explain: {
      uz: "@ dan oldin — foydalanuvchi, keyin — server manzili; -p 2222 — port.",
      en: "Before @ is the user, after it the server address; -p 2222 is the port.",
    },
  },
  {
    ask: {
      uz: "Quyidagi buyruq qaysi portga ulanadi?",
      en: "Which port does this command connect to?",
    },
    code: "ssh -p 2222 ali@203.0.113.10",
    right: same("2222"),
    wrong: [same("22"), same("203"), same("10")],
    explain: {
      uz: "-p standart 22-port o‘rniga boshqasini tanlaydi.",
      en: "-p picks a port other than the default 22.",
    },
  },
  {
    ask: {
      uz: "Birinchi ulanishda “The authenticity of host … can't be established” chiqdi. Bu nima?",
      en: "On the first connection you see “The authenticity of host … can't be established”. What is it?",
    },
    right: {
      uz: "Server kaliti hali known_hosts’da yo‘q — barmoq izini tekshirib, so‘ng “yes” deyish kerak",
      en: "The server's key is not in known_hosts yet: check the fingerprint, then answer “yes”",
    },
    wrong: [
      {
        uz: "Server buzilgan, darhol o‘chirish kerak",
        en: "The server is broken and must be shut down",
      },
      {
        uz: "Parol noto‘g‘ri kiritildi",
        en: "The password was wrong",
      },
      {
        uz: "Internet aloqasi yo‘q",
        en: "There is no internet connection",
      },
    ],
    explain: {
      uz: "“yes” dan keyin server kaliti ~/.ssh/known_hosts’ga yoziladi va keyingi safar tekshiriladi.",
      en: "After “yes” the server key is written to ~/.ssh/known_hosts and checked next time.",
    },
  },
  {
    ask: {
      uz: "Tanish serverga ulanganda “REMOTE HOST IDENTIFICATION HAS CHANGED!” chiqdi. Nima qilasiz?",
      en: "Connecting to a known server shows “REMOTE HOST IDENTIFICATION HAS CHANGED!”. What do you do?",
    },
    right: {
      uz: "Ulanmayman va administratordan server qayta o‘rnatilganini so‘rayman",
      en: "Do not connect, and ask the admin whether the server was reinstalled",
    },
    wrong: [
      {
        uz: "known_hosts’ni o‘chirib, darhol qayta ulanaman",
        en: "Delete known_hosts and connect again at once",
      },
      {
        uz: "Parolni yana bir necha marta kiritaman",
        en: "Type the password a few more times",
      },
      {
        uz: "E’tibor bermayman — bu oddiy xabar",
        en: "Ignore it, it is a routine message",
      },
    ],
    explain: {
      uz: "Kalit o‘zgargan: server qayta o‘rnatilgan bo‘lishi yoki kimdir o‘rtada turgan bo‘lishi (man-in-the-middle) mumkin.",
      en: "The key changed: the server may have been reinstalled, or someone may be in the middle (man-in-the-middle).",
    },
  },
  {
    ask: {
      uz: "Qaysi fayl hech kimga berilmasligi kerak?",
      en: "Which file must never be given to anyone?",
    },
    right: same("~/.ssh/id_ed25519"),
    wrong: [
      same("~/.ssh/id_ed25519.pub"),
      same("~/.ssh/known_hosts"),
      same("/etc/hostname"),
    ],
    explain: {
      uz: "id_ed25519 — yopiq kalit, faqat noutbukingizda. .pub — ochiq kalit, uni serverga qo‘yish xavfsiz.",
      en: "id_ed25519 is the private key, kept on your laptop. The .pub file is the public key, safe to put on servers.",
    },
  },
  {
    ask: {
      uz: "Yangi SSH kalit juftligini qaysi buyruq yaratadi?",
      en: "Which command creates a new SSH key pair?",
    },
    right: same("ssh-keygen"),
    wrong: [same("ssh-copy-id"), same("ssh-add-user"), same("passwd")],
    explain: {
      uz: "ssh-keygen ikki fayl yaratadi: yopiq kalit va .pub bilan tugaydigan ochiq kalit.",
      en: "ssh-keygen makes two files: the private key and the public key ending in .pub.",
    },
  },
  {
    ask: {
      uz: "“ssh-copy-id ali@server.uz” nima qiladi?",
      en: "What does “ssh-copy-id ali@server.uz” do?",
    },
    right: {
      uz: "Ochiq kalitingizni serverdagi ali hisobiga qo‘shadi",
      en: "Adds your public key to the ali account on the server",
    },
    wrong: [
      {
        uz: "Yopiq kalitingizni serverga yuboradi",
        en: "Sends your private key to the server",
      },
      {
        uz: "Serverdagi barcha fayllarni nusxalaydi",
        en: "Copies every file from the server",
      },
      {
        uz: "Server parolini o‘zgartiradi",
        en: "Changes the server password",
      },
    ],
    explain: {
      uz: "Ochiq kalit ~/.ssh/authorized_keys faylga yoziladi. Shundan keyin parolsiz, kalit bilan kirasiz.",
      en: "The public key goes into ~/.ssh/authorized_keys. From then on you sign in with the key, without a password.",
    },
  },
  {
    ask: {
      uz: "Nega kalit bilan kirish parol bilan kirishdan xavfsizroq?",
      en: "Why is signing in with a key safer than with a password?",
    },
    right: {
      uz: "Kalitni taxmin qilib bo‘lmaydi va u tarmoq orqali yuborilmaydi",
      en: "A key cannot be guessed and is never sent over the network",
    },
    wrong: [
      {
        uz: "Kalit bilan internet tezroq ishlaydi",
        en: "The internet is faster with a key",
      },
      {
        uz: "Kalitni hamma bilan bo‘lishish mumkin",
        en: "A key can be shared with everyone",
      },
      {
        uz: "Kalit hech qachon o‘g‘irlanmaydi",
        en: "A key can never be stolen",
      },
    ],
    explain: {
      uz: "Parolni topib olish (brute force) mumkin. Kalit bilan server faqat yopiq kalit egasi ekaningizni tekshiradi.",
      en: "Passwords can be brute-forced. With a key the server only checks that you hold the private key.",
    },
  },
  {
    ask: {
      uz: "Serverda faqat kalit bilan kirishga ruxsat berish uchun sshd_config’da qaysi qator kerak?",
      en: "Which sshd_config line allows key-only sign-in on the server?",
    },
    right: same("PasswordAuthentication no"),
    wrong: [
      same("PasswordAuthentication yes"),
      same("PermitRootLogin yes"),
      same("Port 80"),
    ],
    explain: {
      uz: "PasswordAuthentication no — parol bilan kirish o‘chadi, faqat kalit qoladi.",
      en: "PasswordAuthentication no turns password sign-in off, leaving only keys.",
    },
  },
  {
    ask: {
      uz: "“PermitRootLogin no” sozlamasi nima qiladi?",
      en: "What does the “PermitRootLogin no” setting do?",
    },
    right: {
      uz: "root hisobi bilan to‘g‘ridan-to‘g‘ri SSH orqali kirishni taqiqlaydi",
      en: "It forbids signing in over SSH directly as root",
    },
    wrong: [
      {
        uz: "root parolini o‘chiradi",
        en: "It deletes the root password",
      },
      {
        uz: "Barcha foydalanuvchilarni bloklaydi",
        en: "It blocks every user",
      },
      {
        uz: "SSH portini o‘zgartiradi",
        en: "It changes the SSH port",
      },
    ],
    explain: {
      uz: "Hujumchilar avvalo root’ni sinab ko‘radi. Oddiy foydalanuvchi bilan kirib, kerak bo‘lsa sudo ishlatiladi.",
      en: "Attackers try root first. You sign in as a normal user and use sudo when needed.",
    },
  },
  {
    ask: {
      uz: "Ulanganingizdan keyin “whoami” buyrug‘i qayerda bajariladi?",
      en: "Once connected, where does the “whoami” command run?",
    },
    right: {
      uz: "Serverda — javob serverdagi foydalanuvchi nomi",
      en: "On the server: it prints the user name there",
    },
    wrong: [
      {
        uz: "Noutbukda — javob sizning lokal ismingiz",
        en: "On the laptop: it prints your local name",
      },
      {
        uz: "Ikkalasida bir vaqtda",
        en: "On both at the same time",
      },
      {
        uz: "Hech qayerda — SSH’da buyruq yo‘q",
        en: "Nowhere: SSH has no commands",
      },
    ],
    explain: {
      uz: "Taklif qatori ali@web-1 ga o‘zgaradi: endi barcha buyruqlar serverda. “exit” bilan qaytasiz.",
      en: "The prompt changes to ali@web-1: every command now runs on the server. “exit” brings you back.",
    },
  },
  {
    ask: {
      uz: "SSH va HTTPS’ning umumiy jihati nima?",
      en: "What do SSH and HTTPS have in common?",
    },
    right: {
      uz: "Ikkalasi avval shifrlangan kanal quradi, keyin ma’lumot almashadi",
      en: "Both build an encrypted channel first, then exchange data",
    },
    wrong: [
      { uz: "Ikkalasi 22-portda ishlaydi", en: "Both run on port 22" },
      {
        uz: "Ikkalasi faqat brauzerda ishlaydi",
        en: "Both work only in a browser",
      },
      { uz: "Ikkalasi shifrlanmagan", en: "Neither is encrypted" },
    ],
    explain: {
      uz: "SSH ham, TLS ham server kalitini tekshiradi va suhbatni shifrlaydi; keyin kimligingizni tekshiradi.",
      en: "SSH and TLS both check the server's key and encrypt the conversation; then they check who you are.",
    },
  },
];

export const CRYPTO_POOL: PoolItem[] = [
  {
    ask: {
      uz: "Kompyuter “A” harfini qanday saqlaydi?",
      en: "How does a computer store the letter “A”?",
    },
    right: {
      uz: "Raqam sifatida (ASCII’da 65)",
      en: "As a number (65 in ASCII)",
    },
    wrong: [
      { uz: "Harf rasmi sifatida", en: "As a picture of the letter" },
      { uz: "Shifrlangan holda", en: "Encrypted" },
      { uz: "Hash sifatida", en: "As a hash" },
    ],
    explain: {
      uz: "Har bir belgi raqamga mos keladi: A = 65, a = 97. Matn — bu raqamlar ketma-ketligi.",
      en: "Every character maps to a number: A = 65, a = 97. Text is a sequence of numbers.",
    },
  },
  {
    ask: {
      uz: "Base64 haqida qaysi gap to‘g‘ri?",
      en: "Which is true about Base64?",
    },
    right: {
      uz: "Bu kodlash: kalitsiz, istalgan odam qaytarib o‘qiy oladi",
      en: "It is an encoding: no key, anyone can turn it back",
    },
    wrong: [
      { uz: "Bu kuchli shifr", en: "It is a strong cipher" },
      {
        uz: "Bu hash, qaytarib bo‘lmaydi",
        en: "It is a hash that cannot be reversed",
      },
      {
        uz: "Faqat yopiq kalit bilan ochiladi",
        en: "Only the private key opens it",
      },
    ],
    explain: {
      uz: "Base64 ma’lumotni boshqa alifboga ko‘chiradi xolos. Uni “shifrlangan” deb parol saqlash xato.",
      en: "Base64 only rewrites data in another alphabet. Storing passwords in it as if “encrypted” is a mistake.",
    },
  },
  {
    ask: {
      uz: "Qaysi biri qaytarib bo‘lmaydigan “barmoq izi”?",
      en: "Which one is a one-way “fingerprint”?",
    },
    right: { uz: "Hash (masalan, SHA-256)", en: "A hash (SHA-256, say)" },
    wrong: [
      { uz: "Base64", en: "Base64" },
      { uz: "AES shifri", en: "The AES cipher" },
      { uz: "Sezar shifri", en: "The Caesar cipher" },
    ],
    explain: {
      uz: "Kodlash — tarjima, hash — barmoq izi, shifr — seyf (kalit bilan ochiladi).",
      en: "Encoding is a translation, a hash a fingerprint, a cipher a safe (opened with a key).",
    },
  },
  {
    ask: {
      uz: "SHA-256 natijasi necha belgili hex qator bo‘ladi?",
      en: "How many hex characters long is a SHA-256 result?",
    },
    right: same("64"),
    wrong: [
      same("32"),
      same("256"),
      { uz: "Kirish uzunligiga bog‘liq", en: "Depends on the input" },
    ],
    explain: {
      uz: "SHA-256 doim 256 bit qaytaradi, bu 64 ta hex belgi — kirish qancha uzun bo‘lishidan qat’i nazar.",
      en: "SHA-256 always returns 256 bits, which is 64 hex characters, however long the input is.",
    },
  },
  {
    ask: {
      uz: "Matndagi bitta harf o‘zgarsa, uning hashi qanday o‘zgaradi?",
      en: "If one letter of a text changes, how does its hash change?",
    },
    right: {
      uz: "Butunlay — taxminan yarmi boshqacha bo‘ladi (ko‘chki effekti)",
      en: "Completely: about half of it changes (the avalanche effect)",
    },
    wrong: [
      { uz: "Faqat bitta belgi o‘zgaradi", en: "Only one character changes" },
      { uz: "Umuman o‘zgarmaydi", en: "It does not change at all" },
      { uz: "Hash uzunroq bo‘ladi", en: "The hash gets longer" },
    ],
    explain: {
      uz: "Bir xil kirish doim bir xil hash beradi, ozgina farq esa butunlay boshqa natija beradi.",
      en: "The same input always gives the same hash; a tiny change gives a completely different one.",
    },
  },
  {
    ask: {
      uz: "Yuklab olingan faylning hashi sayt e’lon qilgan hash bilan bir xil. Bu nimani bildiradi?",
      en: "A downloaded file's hash matches the one the site published. What does that mean?",
    },
    right: {
      uz: "Fayl yo‘lda o‘zgarmagan — bayt-baytigacha bir xil",
      en: "The file was not changed on the way: it is identical byte for byte",
    },
    wrong: [
      { uz: "Fayl shifrlangan", en: "The file is encrypted" },
      { uz: "Faylda virus bor", en: "The file has a virus" },
      { uz: "Fayl siqilgan", en: "The file is compressed" },
    ],
    explain: {
      uz: "Bitta bayt, hatto ko‘rinmas bo‘sh joy ham hashni butunlay o‘zgartiradi.",
      en: "A single byte, even an invisible space, changes the hash completely.",
    },
  },
  {
    ask: {
      uz: "Parollarni saqlashda “tuz” (salt) nima uchun qo‘shiladi?",
      en: "Why is a salt added when storing passwords?",
    },
    right: {
      uz: "Bir xil parollar har xil hash beradi, tayyor jadvallar ishlamaydi",
      en: "Identical passwords get different hashes, so ready-made tables fail",
    },
    wrong: [
      {
        uz: "Parolni qaytarib ochish uchun",
        en: "To decrypt the password later",
      },
      { uz: "Parolni qisqartirish uchun", en: "To make the password shorter" },
      { uz: "Tuz sir saqlanadigan kalit", en: "The salt is a secret key" },
    ],
    explain: {
      uz: "Server hash(tuz + parol)ni saqlaydi, tuz esa ochiq holda yonida turadi. Har bir foydalanuvchiga o‘z tuzi.",
      en: "The server stores hash(salt + password), with the salt kept openly beside it. Each user gets their own salt.",
    },
  },
  {
    ask: {
      uz: "Lug‘at hujumi qanday ishlaydi?",
      en: "How does a dictionary attack work?",
    },
    right: {
      uz: "Mashhur parollarni birma-bir hash qilib, o‘g‘irlangan hash bilan solishtiradi",
      en: "It hashes popular passwords one by one and compares them with the leaked hash",
    },
    wrong: [
      {
        uz: "Hashni teskari hisoblab parolni topadi",
        en: "It computes the hash backwards",
      },
      {
        uz: "Serverdan parolni so‘raydi",
        en: "It asks the server for the password",
      },
      {
        uz: "Lug‘atdagi so‘zlarni shifrlaydi",
        en: "It encrypts dictionary words",
      },
    ],
    explain: {
      uz: "Hashni qaytarib bo‘lmaydi, lekin taxmin qilish mumkin. Shuning uchun oddiy parollar tez topiladi.",
      en: "A hash cannot be reversed, but it can be guessed. That is why common passwords fall fast.",
    },
  },
  {
    ask: {
      uz: "Lug‘at hujumidan eng yaxshi himoya qaysi?",
      en: "What is the best defence against a dictionary attack?",
    },
    right: {
      uz: "Uzun, tasodifiy va lug‘atda yo‘q parol",
      en: "A long, random password that is in no dictionary",
    },
    wrong: [
      { uz: "Parolni Base64’da yozish", en: "Writing the password in Base64" },
      {
        uz: "Parolga ismingizni qo‘shish",
        en: "Adding your name to the password",
      },
      {
        uz: "Qisqa, lekin katta harfli parol",
        en: "A short password in capitals",
      },
    ],
    explain: {
      uz: "Lug‘atda yo‘q va uzun parolni birma-bir taxmin qilish juda uzoq vaqt oladi.",
      en: "A long password that is in no list takes far too long to guess one by one.",
    },
  },
  {
    ask: {
      uz: "XOR natijasi qanday: 1 XOR 1 = ?",
      en: "What is the XOR result: 1 XOR 1 = ?",
    },
    right: same("0"),
    wrong: [same("1"), same("2"), same("11")],
    explain: {
      uz: "XOR: bitlar bir xil bo‘lsa 0, har xil bo‘lsa 1.",
      en: "XOR gives 0 when the bits match and 1 when they differ.",
    },
  },
  {
    ask: {
      uz: "Matnni bir xil kalit bilan ikki marta XOR qilsangiz nima bo‘ladi?",
      en: "What happens if you XOR a text with the same key twice?",
    },
    right: {
      uz: "Asl matn qaytadi",
      en: "You get the original text back",
    },
    wrong: [
      {
        uz: "Matn ikki baravar kuchli shifrlanadi",
        en: "It is encrypted twice as strongly",
      },
      { uz: "Matn o‘chib ketadi", en: "The text is erased" },
      { uz: "Hash hosil bo‘ladi", en: "It turns into a hash" },
    ],
    explain: {
      uz: "Kalit bit 1 bo‘lsa holat almashadi; ikki marta almashsa — joyiga qaytadi. Shifrlash va ochish bitta amal.",
      en: "A key bit of 1 flips the state; two flips bring it back. Encrypting and decrypting are the same step.",
    },
  },
  {
    ask: {
      uz: "Kalitga bitta bit qo‘shilsa, mumkin bo‘lgan kalitlar soni qanday o‘zgaradi?",
      en: "Adding one bit to a key changes the number of possible keys how?",
    },
    right: { uz: "Ikki baravar ko‘payadi", en: "It doubles" },
    wrong: [
      { uz: "Bittaga ko‘payadi", en: "It grows by one" },
      { uz: "O‘zgarmaydi", en: "It stays the same" },
      { uz: "Ikki baravar kamayadi", en: "It halves" },
    ],
    explain: {
      uz: "n bitli kalitda 2ⁿ ta variant bor. Shuning uchun 128 bitli kalitni birma-bir topib bo‘lmaydi.",
      en: "An n-bit key has 2ⁿ options. That is why a 128-bit key cannot be found by trying them all.",
    },
  },
  {
    ask: {
      uz: "Raqamli imzo nima bilan yaratiladi va nima bilan tekshiriladi?",
      en: "What makes a digital signature, and what checks it?",
    },
    right: {
      uz: "Yopiq kalit bilan yaratiladi, ochiq kalit bilan tekshiriladi",
      en: "The private key makes it, the public key checks it",
    },
    wrong: [
      {
        uz: "Ochiq kalit bilan yaratiladi, yopiq kalit bilan tekshiriladi",
        en: "The public key makes it, the private key checks it",
      },
      { uz: "Ikkalasi ham parol bilan", en: "Both use a password" },
      { uz: "Base64 bilan yaratiladi", en: "Base64 makes it" },
    ],
    explain: {
      uz: "Faqat egasi imzolay oladi, lekin uni hamma ochiq kalit bilan tekshira oladi.",
      en: "Only the owner can sign, but anyone can check the signature with the public key.",
    },
  },
  {
    ask: {
      uz: "Imzolangan hujjatdagi bitta raqam o‘zgartirilsa nima bo‘ladi?",
      en: "What happens if one figure in a signed document is changed?",
    },
    right: {
      uz: "Imzo tekshiruvdan o‘tmaydi",
      en: "The signature no longer checks out",
    },
    wrong: [
      { uz: "Imzo o‘zi yangilanadi", en: "The signature updates itself" },
      {
        uz: "Hech narsa — imzo faqat ismni tasdiqlaydi",
        en: "Nothing, a signature only confirms the name",
      },
      { uz: "Hujjat shifrlanib qoladi", en: "The document becomes encrypted" },
    ],
    explain: {
      uz: "Imzo ikki narsani isbotlaydi: kim yuborgani va yo‘lda o‘zgarmagani.",
      en: "A signature proves two things: who sent it and that it did not change on the way.",
    },
  },
];
