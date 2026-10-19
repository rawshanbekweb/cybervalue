// Academy Intermediate · Web application security, module 1: HTTP in depth.
// Lessons write raw requests to a pretend server (./server.ts), set cookie
// flags, sort URLs by origin and choose security headers.
import type { Text } from "../network/ip";
import { DEMO, SESSION, TRUSTED_ORIGIN } from "./server";

export type Question = {
  ask: Text;
  options: Text[];
  answer: number;
  explain: Text;
};

export type Goal = {
  /** The request that counts: its path and, when given, its method. */
  path: string;
  method?: string;
  status: number;
  /** A response header that must be present. */
  header?: string;
  /** A request header that must be sent. */
  sends?: string;
};

export type Flag = { id: string; code: string; about: Text };

export type Widget =
  | { type: "request"; start: string; goal: Goal }
  | { type: "choice"; questions: Question[] }
  | { type: "flags"; prompt: Text; flags: Flag[]; right: string[] }
  | { type: "origin"; base: string; urls: { url: string; same: boolean }[] };

export type Lesson = {
  id: number;
  group: Text;
  title: Text;
  minutes: number;
  intro: Text;
  analogy: Text;
  theory: Text[];
  task: Text;
  hint: Text;
  widget: Widget;
};

export const PROGRESS_KEY = "cybervalue:http:progress:v1";
const HOST = "Host: shop.cybervalue.uz";

const BASICS = { uz: "So‘rov va javob", en: "Request and response" };
const STATE = {
  uz: "Holat: cookie va sessiya",
  en: "State: cookies and sessions",
};
const BROWSER = { uz: "Brauzer qoidalari", en: "Browser rules" };

export const LESSONS: Lesson[] = [
  {
    id: 1,
    group: BASICS,
    title: {
      uz: "HTTP so‘rovi qanday tuzilgan",
      en: "What an HTTP request looks like",
    },
    minutes: 8,
    intro: {
      uz: "Brauzer sahifa ochganda serverga oddiy matn yuboradi: birinchi qatorda metod va yo‘l, keyin sarlavhalar, bo‘sh qator va (bo‘lsa) tana.",
      en: "When a browser opens a page it sends the server plain text: a first line with the method and path, then headers, a blank line and, if any, a body.",
    },
    analogy: {
      uz: "Bu xatga o‘xshaydi: konvertda kimga va nima haqida (birinchi qator va sarlavhalar), ichida esa xatning o‘zi (tana).",
      en: "It is like a letter: the envelope says who and what (first line and headers), the letter itself is the body.",
    },
    theory: [
      {
        uz: "GET — ma’lumot olish, POST — ma’lumot yuborish. Yo‘l (/profil) serverdagi qaysi resurs kerakligini bildiradi.",
        en: "GET fetches, POST sends. The path (/profil) names the resource on the server.",
      },
      {
        uz: "Host sarlavhasi majburiy: bitta serverda ko‘p sayt bo‘lishi mumkin, Host qaysi biri kerakligini aytadi.",
        en: "The Host header is required: one server can hold many sites, and Host says which one is meant.",
      },
      {
        uz: "Javobning birinchi qatorida holat kodi keladi: 200 — hammasi yaxshi.",
        en: "The response's first line carries a status code: 200 means all is well.",
      },
    ],
    task: {
      uz: "So‘rovda bitta qator yetishmayapti. Uni qo‘shing va serverdan 200 javobini oling.",
      en: "The request is missing a line. Add it and get a 200 from the server.",
    },
    hint: {
      uz: `Ikkinchi qatorga yozing: ${HOST}`,
      en: `Add as the second line: ${HOST}`,
    },
    widget: {
      type: "request",
      start: "GET / HTTP/1.1\n",
      goal: { path: "/", status: 200 },
    },
  },
  {
    id: 2,
    group: BASICS,
    title: { uz: "Qayta yo‘naltirish", en: "Redirects" },
    minutes: 8,
    intro: {
      uz: "Ba’zan server “bu sahifa boshqa joyga ko‘chdi” deydi: 301 kodi va Location sarlavhasi bilan.",
      en: "Sometimes the server says “this page moved”: with a 301 code and a Location header.",
    },
    analogy: {
      uz: "Do‘kon ko‘chib ketsa, eski eshikka yangi manzil yozib qo‘yiladi.",
      en: "When a shop moves, a note with the new address goes on the old door.",
    },
    theory: [
      {
        uz: "Brauzer Location’dagi manzilga o‘zi o‘tadi, siz buni sezmaysiz. Xavfsizlik tekshiruvida esa har bir yo‘naltirishni ko‘rish muhim.",
        en: "A browser follows Location by itself, so you never notice. In a security review it matters to see every redirect.",
      },
      {
        uz: "Ochiq yo‘naltirish (open redirect) — server foydalanuvchi bergan istalgan manzilga yo‘naltirsa paydo bo‘ladigan zaiflik. Fishingda ishlatiladi.",
        en: "An open redirect is a weakness where the server redirects to any address a user supplies. It is used in phishing.",
      },
    ],
    task: {
      uz: "/aksiya so‘rovini yuboring, javobdagi Location’ni o‘qing va o‘sha sahifadan 200 javobini oling.",
      en: "Send the /aksiya request, read the Location in the response and get a 200 from that page.",
    },
    hint: {
      uz: "Birinchi qatordagi yo‘lni Location’dagi yo‘lga almashtiring.",
      en: "Replace the path in the first line with the one in Location.",
    },
    widget: {
      type: "request",
      start: `GET /aksiya HTTP/1.1\n${HOST}\n`,
      goal: { path: "/chegirmalar", status: 200 },
    },
  },
  {
    id: 3,
    group: BASICS,
    title: { uz: "Holat kodlari", en: "Status codes" },
    minutes: 6,
    intro: {
      uz: "Holat kodi javobning qisqa mazmuni: 2xx — muvaffaqiyat, 3xx — boshqa joyga, 4xx — mijoz xatosi, 5xx — server xatosi.",
      en: "The status code sums up the response: 2xx success, 3xx elsewhere, 4xx the client's mistake, 5xx the server's.",
    },
    analogy: {
      uz: "Pochta kvitansiyasidagi belgiga o‘xshaydi: yetkazildi, manzil o‘zgargan, qabul qiluvchi yo‘q…",
      en: "Like the stamp on a delivery slip: delivered, moved, no such recipient…",
    },
    theory: [
      {
        uz: "401 — “kimligingizni bilmayman” (kirilmagan). 403 — “kimligingizni bilaman, lekin ruxsat yo‘q”.",
        en: "401 means “I don’t know who you are” (not signed in). 403 means “I know who you are, but you may not”.",
      },
    ],
    task: {
      uz: "Har bir savolga to‘g‘ri javobni tanlang.",
      en: "Pick the right answer to every question.",
    },
    hint: {
      uz: "401 va 403 farqiga e’tibor bering.",
      en: "Mind the difference between 401 and 403.",
    },
    widget: {
      type: "choice",
      questions: [
        {
          ask: {
            uz: "Kirmagan foydalanuvchi /profil’ni so‘radi. Qaysi kod to‘g‘ri?",
            en: "A user who has not signed in asks for /profil. Which code fits?",
          },
          options: [
            { uz: "401", en: "401" },
            { uz: "403", en: "403" },
            { uz: "404", en: "404" },
          ],
          answer: 0,
          explain: {
            uz: "Server kimligini bilmaydi, avval kirish kerak: 401.",
            en: "The server doesn’t know who it is; signing in comes first: 401.",
          },
        },
        {
          ask: {
            uz: "Oddiy foydalanuvchi kirgan, lekin /admin’ni so‘radi.",
            en: "A signed-in regular user asks for /admin.",
          },
          options: [
            { uz: "401", en: "401" },
            { uz: "403", en: "403" },
            { uz: "500", en: "500" },
          ],
          answer: 1,
          explain: {
            uz: "Kimligi ma’lum, lekin huquqi yo‘q: 403.",
            en: "Known, but not allowed: 403.",
          },
        },
        {
          ask: {
            uz: "Server kodi xatoga uchrab qulab tushdi.",
            en: "The server's code crashed on an error.",
          },
          options: [
            { uz: "400", en: "400" },
            { uz: "404", en: "404" },
            { uz: "500", en: "500" },
          ],
          answer: 2,
          explain: {
            uz: "5xx — server tomonidagi xato.",
            en: "5xx is a server-side error.",
          },
        },
        {
          ask: {
            uz: "Nega xato sahifasida dastur kodining qismlarini (stack trace) ko‘rsatish xavfli?",
            en: "Why is showing parts of the code (a stack trace) on an error page risky?",
          },
          options: [
            { uz: "Sahifa sekinlashadi", en: "The page gets slower" },
            {
              uz: "Hujumchiga ichki tuzilma haqida ma’lumot beradi",
              en: "It tells an attacker about the internals",
            },
            { uz: "Hech qanday xavfi yo‘q", en: "There is no risk" },
          ],
          answer: 1,
          explain: {
            uz: "Fayl yo‘llari, kutubxona versiyalari va so‘rovlar hujumchiga yo‘l ko‘rsatadi.",
            en: "File paths, library versions and queries show an attacker the way in.",
          },
        },
      ],
    },
  },
  {
    id: 4,
    group: STATE,
    title: { uz: "Kirish va cookie", en: "Signing in and cookies" },
    minutes: 10,
    intro: {
      uz: "HTTP “xotirasiz”: har bir so‘rov alohida. Server sizni eslab qolishi uchun kirgandan keyin Set-Cookie bilan cookie beradi.",
      en: "HTTP is stateless: every request stands alone. To remember you, the server hands out a cookie with Set-Cookie after you sign in.",
    },
    analogy: {
      uz: "Garderobdagi raqamcha: paltoni topshirasiz, raqam olasiz, keyin raqamni ko‘rsatib paltoni qaytarib olasiz.",
      en: "A cloakroom ticket: you hand in your coat, get a number, and later show the number to get the coat back.",
    },
    theory: [
      {
        uz: "Login formasi POST so‘rov bilan yuboriladi; ma’lumot tanada keladi: user=...&pass=...",
        en: "A login form is sent with POST; the data travels in the body: user=...&pass=...",
      },
      {
        uz: `O‘quv akkaunti: user=${DEMO.user}, pass=${DEMO.pass}. Haqiqiy saytlarda boshqalarning akkauntini sinash qonunga zid!`,
        en: `Training account: user=${DEMO.user}, pass=${DEMO.pass}. Trying other people's accounts on real sites is against the law!`,
      },
    ],
    task: {
      uz: "O‘quv akkaunti bilan /login’ga POST so‘rov yuboring va 200 hamda Set-Cookie javobini oling.",
      en: "Send a POST to /login with the training account and get a 200 with Set-Cookie.",
    },
    hint: {
      uz: `Bo‘sh qatordan keyin tanaga yozing: user=${DEMO.user}&pass=${DEMO.pass}`,
      en: `After the blank line write the body: user=${DEMO.user}&pass=${DEMO.pass}`,
    },
    widget: {
      type: "request",
      start: `POST /login HTTP/1.1\n${HOST}\nContent-Type: application/x-www-form-urlencoded\n\n`,
      goal: {
        path: "/login",
        method: "POST",
        status: 200,
        header: "Set-Cookie",
      },
    },
  },
  {
    id: 5,
    group: STATE,
    title: { uz: "Sessiya", en: "Sessions" },
    minutes: 8,
    intro: {
      uz: "Brauzer olingan cookie’ni keyingi har bir so‘rovga Cookie sarlavhasida qo‘shib yuboradi. Server shu bilan sizni taniydi.",
      en: "The browser adds the cookie it got to every later request in a Cookie header. That is how the server knows you.",
    },
    analogy: {
      uz: "Sessiya identifikatori — vaqtinchalik kalit. Kimdir uni o‘g‘irlasa, sizning nomingizdan kira oladi.",
      en: "A session id is a temporary key. Whoever steals it can act as you.",
    },
    theory: [
      {
        uz: "Shuning uchun sessiya identifikatori tasodifiy va uzun bo‘lishi, kirishdan keyin yangilanishi va chiqishda o‘chirilishi kerak.",
        en: "So a session id must be random and long, renewed after sign-in and destroyed on sign-out.",
      },
    ],
    task: {
      uz: "Cookie sarlavhasini qo‘shib /profil’dan 200 javobini oling.",
      en: "Add a Cookie header and get a 200 from /profil.",
    },
    hint: {
      uz: `Sarlavha qo‘shing: Cookie: session=${SESSION}`,
      en: `Add the header: Cookie: session=${SESSION}`,
    },
    widget: {
      type: "request",
      start: `GET /profil HTTP/1.1\n${HOST}\n`,
      goal: { path: "/profil", status: 200, sends: "cookie" },
    },
  },
  {
    id: 6,
    group: STATE,
    title: { uz: "Cookie bayroqlari", en: "Cookie flags" },
    minutes: 8,
    intro: {
      uz: "Set-Cookie’ga qo‘shiladigan bayroqlar cookie’ni o‘g‘irlanishdan va noto‘g‘ri ishlatilishdan himoya qiladi.",
      en: "Flags added to Set-Cookie protect the cookie from theft and misuse.",
    },
    analogy: {
      uz: "Kalitga “faqat shu eshik uchun” va “faqat qo‘riqlangan yo‘lakda” degan yorliq osgandek.",
      en: "Like tagging a key “this door only” and “guarded corridor only”.",
    },
    theory: [
      {
        uz: "HttpOnly — JavaScript cookie’ni o‘qiy olmaydi (XSS bo‘lsa ham). Secure — faqat HTTPS orqali yuboriladi. SameSite=Lax — boshqa saytdan kelgan so‘rovlarga qo‘shilmaydi (CSRF’dan himoya).",
        en: "HttpOnly: JavaScript cannot read the cookie (even with XSS). Secure: sent over HTTPS only. SameSite=Lax: not attached to requests from other sites (protects against CSRF).",
      },
      {
        uz: "Domain=.uz kabi keng domen yoki bir yillik muddat sessiya uchun xavfli.",
        en: "A broad domain like Domain=.uz or a year-long lifetime is risky for a session.",
      },
    ],
    task: {
      uz: "Sessiya cookie’si uchun to‘g‘ri bayroqlarni tanlang va xavflilarini tanlamang.",
      en: "Pick the right flags for a session cookie and leave the risky ones out.",
    },
    hint: {
      uz: "Uchta bayroq kerak: biri JavaScript’dan, biri HTTP’dan, biri boshqa saytlardan himoya qiladi.",
      en: "Three flags are needed: one against JavaScript, one against plain HTTP, one against other sites.",
    },
    widget: {
      type: "flags",
      prompt: {
        uz: `Set-Cookie: session=${SESSION}; Path=/; …`,
        en: `Set-Cookie: session=${SESSION}; Path=/; …`,
      },
      flags: [
        {
          id: "httponly",
          code: "HttpOnly",
          about: {
            uz: "JavaScript o‘qiy olmaydi",
            en: "JavaScript can’t read it",
          },
        },
        {
          id: "secure",
          code: "Secure",
          about: { uz: "Faqat HTTPS orqali", en: "HTTPS only" },
        },
        {
          id: "lax",
          code: "SameSite=Lax",
          about: {
            uz: "Boshqa saytlardan kelgan so‘rovlarga qo‘shilmaydi",
            en: "Not sent with requests from other sites",
          },
        },
        {
          id: "domain",
          code: "Domain=.uz",
          about: {
            uz: "Barcha .uz saytlariga ko‘rinadi",
            en: "Visible to every .uz site",
          },
        },
        {
          id: "year",
          code: "Max-Age=31536000",
          about: { uz: "Bir yil yashaydi", en: "Lives for a year" },
        },
        {
          id: "none",
          code: "SameSite=None",
          about: {
            uz: "Har qanday saytdan yuboriladi",
            en: "Sent from any site",
          },
        },
      ],
      right: ["httponly", "secure", "lax"],
    },
  },
  {
    id: 7,
    group: BROWSER,
    title: { uz: "Bir xil manba siyosati (SOP)", en: "The same-origin policy" },
    minutes: 8,
    intro: {
      uz: "Manba (origin) = sxema + host + port. Brauzer bir manbadagi sahifaga boshqa manba ma’lumotlarini o‘qishga ruxsat bermaydi.",
      en: "An origin is scheme + host + port. The browser does not let a page read data from another origin.",
    },
    analogy: {
      uz: "Har bir sayt o‘z xonasida: qo‘shni xonadagi narsalarni ruxsatsiz ko‘ra olmaydi.",
      en: "Every site lives in its own room and can’t look into the next room without permission.",
    },
    theory: [
      {
        uz: "https va http — boshqa sxema; 443 va 8443 — boshqa port; shop. va api. — boshqa host. Yo‘l va so‘rov parametrlari manbaga kirmaydi.",
        en: "https and http are different schemes; 443 and 8443 different ports; shop. and api. different hosts. The path and query are not part of the origin.",
      },
    ],
    task: {
      uz: "Har bir manzil https://shop.cybervalue.uz bilan bir xil manbami yoki yo‘qmi, belgilang.",
      en: "Mark whether each address has the same origin as https://shop.cybervalue.uz.",
    },
    hint: {
      uz: "Faqat sxema, host va portni solishtiring.",
      en: "Compare only the scheme, host and port.",
    },
    widget: {
      type: "origin",
      base: "https://shop.cybervalue.uz",
      urls: [
        { url: "https://shop.cybervalue.uz/profil?tab=2", same: true },
        { url: "http://shop.cybervalue.uz/", same: false },
        { url: "https://shop.cybervalue.uz:8443/", same: false },
        { url: "https://api.cybervalue.uz/", same: false },
        { url: "https://shop.cybervalue.uz:443/api", same: true },
      ],
    },
  },
  {
    id: 8,
    group: BROWSER,
    title: { uz: "CORS va oldindan so‘rov", en: "CORS and preflight" },
    minutes: 10,
    intro: {
      uz: "CORS — serverning “shu boshqa manbaga javobimni o‘qishga ruxsat beraman” degan sarlavhalari. Murakkab so‘rovlardan oldin brauzer OPTIONS bilan ruxsat so‘raydi.",
      en: "CORS is the server's headers saying “this other origin may read my response”. Before complex requests the browser asks first with OPTIONS.",
    },
    analogy: {
      uz: "Qo‘shni xonaga kirishdan oldin eshikni taqillatib “kirsam bo‘ladimi?” deb so‘rash.",
      en: "Knocking and asking “may I come in?” before entering the next room.",
    },
    theory: [
      {
        uz: `Server faqat ishonchli manbani nomma-nom ko‘rsatishi kerak: Access-Control-Allow-Origin: ${TRUSTED_ORIGIN}. “*” va cookie birga ishlamaydi va xavfli.`,
        en: `A server should name the trusted origin exactly: Access-Control-Allow-Origin: ${TRUSTED_ORIGIN}. “*” does not work with cookies, and is risky.`,
      },
      {
        uz: "CORS serverni himoya qilmaydi — u brauzerdagi foydalanuvchini himoya qiladi. Server baribir har bir so‘rovni tekshirishi shart.",
        en: "CORS does not protect the server; it protects the user in the browser. The server must still check every request.",
      },
    ],
    task: {
      uz: `${TRUSTED_ORIGIN} manbasidan /api/buyurtmalar uchun OPTIONS oldindan so‘rovini yuboring va Access-Control-Allow-Origin javobini oling.`,
      en: `Send an OPTIONS preflight for /api/buyurtmalar from ${TRUSTED_ORIGIN} and get Access-Control-Allow-Origin back.`,
    },
    hint: {
      uz: `Metodni OPTIONS qiling va sarlavha qo‘shing: Origin: ${TRUSTED_ORIGIN}`,
      en: `Make the method OPTIONS and add the header: Origin: ${TRUSTED_ORIGIN}`,
    },
    widget: {
      type: "request",
      start: `GET /api/buyurtmalar HTTP/1.1\n${HOST}\n`,
      goal: {
        path: "/api/buyurtmalar",
        method: "OPTIONS",
        status: 204,
        header: "Access-Control-Allow-Origin",
      },
    },
  },
  {
    id: 9,
    group: BROWSER,
    title: { uz: "Xavfsizlik sarlavhalari", en: "Security headers" },
    minutes: 8,
    intro: {
      uz: "Bir nechta javob sarlavhasi brauzerga qo‘shimcha himoyani yoqishni buyuradi.",
      en: "A few response headers tell the browser to switch on extra protection.",
    },
    analogy: {
      uz: "Uyga signalizatsiya, panjara va qulf qo‘yishga o‘xshaydi: har biri boshqa xavfdan saqlaydi.",
      en: "Like an alarm, bars and a lock on a house: each guards against something else.",
    },
    theory: [
      {
        uz: "Content-Security-Policy — qaysi skriptlar ishlashi mumkinligini belgilaydi (XSS’ga qarshi). Strict-Transport-Security — doim HTTPS. X-Frame-Options: DENY — sahifani boshqa saytga ramka ichida qo‘yib bo‘lmaydi (clickjacking). X-Content-Type-Options: nosniff — fayl turini taxmin qilmaydi.",
        en: "Content-Security-Policy says which scripts may run (against XSS). Strict-Transport-Security: always HTTPS. X-Frame-Options: DENY: no framing by other sites (clickjacking). X-Content-Type-Options: nosniff: no guessing file types.",
      },
      {
        uz: "Server va X-Powered-By versiyalarni oshkor qiladi — ularni olib tashlash yaxshi.",
        en: "Server and X-Powered-By give versions away; better removed.",
      },
    ],
    task: {
      uz: "Sayt uchun himoya beradigan sarlavhalarni tanlang, xavflilarini tanlamang.",
      en: "Pick the headers that protect the site and leave out the risky ones.",
    },
    hint: {
      uz: "To‘rtta sarlavha himoya qiladi; uchtasi ma’lumot oshkor qiladi yoki himoyani zaiflashtiradi.",
      en: "Four headers protect; three give information away or weaken protection.",
    },
    widget: {
      type: "flags",
      prompt: { uz: "HTTP/1.1 200 OK", en: "HTTP/1.1 200 OK" },
      flags: [
        {
          id: "csp",
          code: "Content-Security-Policy: default-src 'self'",
          about: { uz: "Faqat o‘z skriptlari", en: "Only its own scripts" },
        },
        {
          id: "hsts",
          code: "Strict-Transport-Security: max-age=31536000",
          about: { uz: "Doim HTTPS", en: "Always HTTPS" },
        },
        {
          id: "frame",
          code: "X-Frame-Options: DENY",
          about: { uz: "Ramkaga qo‘yib bo‘lmaydi", en: "No framing" },
        },
        {
          id: "nosniff",
          code: "X-Content-Type-Options: nosniff",
          about: { uz: "Fayl turi taxmin qilinmaydi", en: "No type guessing" },
        },
        {
          id: "powered",
          code: "X-Powered-By: Express 4.16",
          about: {
            uz: "Dastur versiyasini aytadi",
            en: "Says the software version",
          },
        },
        {
          id: "server",
          code: "Server: Apache/2.4.29",
          about: {
            uz: "Server versiyasini aytadi",
            en: "Says the server version",
          },
        },
        {
          id: "star",
          code: "Access-Control-Allow-Origin: *",
          about: { uz: "Har qanday sayt o‘qiy oladi", en: "Any site may read" },
        },
      ],
      right: ["csp", "hsts", "frame", "nosniff"],
    },
  },
  {
    id: 10,
    group: BROWSER,
    title: { uz: "Takrorlash", en: "Review" },
    minutes: 6,
    intro: {
      uz: "Modulning asosiy g‘oyalarini mustahkamlaymiz.",
      en: "Let's lock in the main ideas of the module.",
    },
    analogy: {
      uz: "Imtihondan oldingi qisqa takrorlash.",
      en: "A short review before the test.",
    },
    theory: [
      {
        uz: "Server mijozga hech qachon ishonmasligi kerak: sarlavhalar, cookie va tana — hammasini foydalanuvchi o‘zgartira oladi.",
        en: "A server must never trust the client: headers, cookies and the body can all be changed by the user.",
      },
    ],
    task: {
      uz: "Har bir savolga to‘g‘ri javobni tanlang.",
      en: "Pick the right answer to every question.",
    },
    hint: {
      uz: "So‘rovning har bir qismini foydalanuvchi o‘zi yozishi mumkinligini eslang.",
      en: "Remember the user can write every part of a request.",
    },
    widget: {
      type: "choice",
      questions: [
        {
          ask: {
            uz: "Server Referer sarlavhasiga qarab admin huquqini beradi. Bu to‘g‘rimi?",
            en: "A server grants admin rights based on the Referer header. Is that sound?",
          },
          options: [
            {
              uz: "Ha, Referer’ni o‘zgartirib bo‘lmaydi",
              en: "Yes, Referer can’t be changed",
            },
            {
              uz: "Yo‘q, foydalanuvchi uni istalgancha yozadi",
              en: "No, the user can write anything there",
            },
          ],
          answer: 1,
          explain: {
            uz: "Barcha sarlavhalar mijoz nazoratida; huquq serverdagi sessiyaga qarab tekshiriladi.",
            en: "Every header is under the client's control; rights are checked against the server-side session.",
          },
        },
        {
          ask: {
            uz: "CORS nimani himoya qiladi?",
            en: "What does CORS protect?",
          },
          options: [
            {
              uz: "Serverni har qanday so‘rovdan",
              en: "The server from any request",
            },
            {
              uz: "Brauzerdagi foydalanuvchi ma’lumotini boshqa saytlardan",
              en: "The user's data in the browser from other sites",
            },
            { uz: "Parollarni shifrlaydi", en: "It encrypts passwords" },
          ],
          answer: 1,
          explain: {
            uz: "curl kabi vositalar CORS’ga bo‘ysunmaydi; server o‘zi tekshirishi kerak.",
            en: "Tools like curl ignore CORS; the server must check by itself.",
          },
        },
        {
          ask: {
            uz: "Qaysi bayroq XSS bo‘lganda ham sessiya cookie’sini o‘g‘irlashni qiyinlashtiradi?",
            en: "Which flag makes stealing the session cookie hard even with XSS?",
          },
          options: [
            { uz: "Secure", en: "Secure" },
            { uz: "HttpOnly", en: "HttpOnly" },
            { uz: "Path=/", en: "Path=/" },
          ],
          answer: 1,
          explain: {
            uz: "HttpOnly cookie’ni JavaScript’dan yashiradi.",
            en: "HttpOnly hides the cookie from JavaScript.",
          },
        },
      ],
    },
  },
];

/** Keeps only lessons that exist, marked done. */
export function restoreProgress(raw: unknown): Record<number, true> {
  if (!raw || typeof raw !== "object") return {};
  const out: Record<number, true> = {};
  for (const lesson of LESSONS)
    if ((raw as Record<string, unknown>)[lesson.id] === true)
      out[lesson.id] = true;
  return out;
}

/** Whether a sent request and its response meet a lesson's goal. */
export function goalMet(
  goal: Goal,
  request: { method: string; path: string; headers: Record<string, string> },
  response: { status: number; headers: [string, string][] },
) {
  return (
    request.path.split("?")[0] === goal.path &&
    (!goal.method || request.method === goal.method) &&
    response.status === goal.status &&
    (!goal.header ||
      response.headers.some(
        ([name]) => name.toLowerCase() === goal.header!.toLowerCase(),
      )) &&
    (!goal.sends || goal.sends.toLowerCase() in request.headers)
  );
}

/** Same origin: scheme, host and port (with the default port filled in). */
export function sameOrigin(a: string, b: string) {
  const x = new URL(a);
  const y = new URL(b);
  const port = (u: URL) => u.port || (u.protocol === "https:" ? "443" : "80");
  return (
    x.protocol === y.protocol &&
    x.hostname === y.hostname &&
    port(x) === port(y)
  );
}
