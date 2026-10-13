// What happens when a browser opens https://kutubxona.example/kitoblar: DNS,
// TCP, TLS and HTTP as packets on a timeline, and what an eavesdropper on the
// same Wi-Fi can read. Also a tiny HTTP server for hand-built requests. Names
// and addresses are in the reserved .example zone and documentation ranges.
import type { Text } from "./ip";

export const CLIENT_IP = "192.168.1.10";
export const RESOLVER = "8.8.8.8";
export const HOST = "kutubxona.example";
export const SERVER = "203.0.113.10";

export type Phase = "dns" | "tcp" | "tls" | "http";
export type Packet = {
  phase: Phase;
  from: "browser" | "resolver" | "server";
  to: "browser" | "resolver" | "server";
  // Protocol and ports, e.g. "UDP 51000 → 53".
  transport: string;
  summary: string;
  fields: [string, string][];
  note: Text;
  // What someone sniffing the Wi-Fi can read from this packet.
  visible: Text;
};
export type Timing = { phase: Phase; start: number; ms: number };
export type PageLoad = { packets: Packet[]; timings: Timing[]; total: number };

const COOKIE = "session=8f3c2a91d7";

export function pageLoad({
  https,
  cached,
}: {
  https: boolean;
  cached: boolean;
}): PageLoad {
  const port = https ? 443 : 80;
  const packets: Packet[] = [];
  const timings: Timing[] = [];
  let clock = 0;
  const phase = (name: Phase, ms: number, list: Packet[]) => {
    timings.push({ phase: name, start: clock, ms });
    clock += ms;
    packets.push(...list);
  };

  if (!cached)
    phase("dns", 24, [
      {
        phase: "dns",
        from: "browser",
        to: "resolver",
        transport: "UDP 51000 → 53",
        summary: `DNS query: ${HOST} A?`,
        fields: [
          ["ID", "0x3fa2"],
          ["Question", `${HOST}  IN  A`],
          ["Recursion desired", "1"],
        ],
        note: {
          uz: "Brauzer avval IP’ni so‘raydi. DNS odatda UDP’da, 53-portga ketadi. ID — javobni so‘rov bilan bog‘lash uchun tasodifiy raqam.",
          en: "The browser first asks for the IP. DNS usually travels over UDP to port 53. The ID is a random number that ties the answer to the question.",
        },
        visible: {
          uz: "Hammasi ochiq: qaysi saytni so‘rayotganingiz ko‘rinadi (shifrlangan DNS — DoH ishlatilmasa).",
          en: "Everything: the site you are looking up is visible (unless encrypted DNS, DoH, is used).",
        },
      },
      {
        phase: "dns",
        from: "resolver",
        to: "browser",
        transport: "UDP 53 → 51000",
        summary: `DNS answer: ${HOST} A ${SERVER}`,
        fields: [
          ["ID", "0x3fa2"],
          ["Answer", `${HOST}  300  IN  A  ${SERVER}`],
        ],
        note: {
          uz: "Javob o‘sha ID bilan keladi. A yozuvi — IPv4 manzil, 300 — TTL: brauzer bu javobni 5 daqiqa eslab qoladi.",
          en: "The answer comes back with the same ID. An A record is an IPv4 address; 300 is the TTL: the browser may remember it for 5 minutes.",
        },
        visible: {
          uz: "Ochiq: sayt nomi va uning IP manzili.",
          en: "Visible: the site name and its IP address.",
        },
      },
    ]);

  const tcp = (
    summary: string,
    from: Packet["from"],
    flags: string,
    note: Text,
  ): Packet => ({
    phase: "tcp",
    from,
    to: from === "browser" ? "server" : "browser",
    transport:
      from === "browser" ? `TCP 50322 → ${port}` : `TCP ${port} → 50322`,
    summary,
    fields: [
      ["Flags", flags],
      [
        "IP",
        from === "browser"
          ? `${CLIENT_IP} → ${SERVER}`
          : `${SERVER} → ${CLIENT_IP}`,
      ],
    ],
    note,
    visible: {
      uz: "Ochiq: kimdan kimga, qaysi port. Mazmun yo‘q.",
      en: "Visible: who talks to whom and on which port. No content.",
    },
  });
  phase("tcp", 18, [
    tcp(`SYN → ${SERVER}:${port}`, "browser", "SYN", {
      uz: `Endi IP ma’lum. Brauzer serverning ${port}-portiga ulanishni boshlaydi: “ulanmoqchiman”.`,
      en: `The IP is known. The browser opens a connection to port ${port} on the server: “I want to connect”.`,
    }),
    tcp("SYN-ACK", "server", "SYN, ACK", {
      uz: "Server: “marhamat, men tayyorman”.",
      en: "Server: “come in, I am ready”.",
    }),
    tcp("ACK", "browser", "ACK", {
      uz: "Brauzer: “qabul qildim”. Uch qadamli qo‘l siqish tugadi — endi ma’lumot yuborish mumkin.",
      en: "Browser: “got it”. The three-way handshake is done; data can flow.",
    }),
  ]);

  if (https)
    phase("tls", 30, [
      {
        phase: "tls",
        from: "browser",
        to: "server",
        transport: "TCP 50322 → 443",
        summary: "TLS ClientHello",
        fields: [
          ["SNI", HOST],
          ["Versions", "TLS 1.3"],
          ["Key share", "x25519 …"],
        ],
        note: {
          uz: "Brauzer shifrlashni taklif qiladi va qaysi saytga kelganini aytadi (SNI) — bitta serverda ko‘p sayt bo‘lishi mumkin.",
          en: "The browser proposes encryption and names the site it wants (SNI): one server may host many sites.",
        },
        visible: {
          uz: "Ochiq: sayt nomi (SNI). Qaysi sahifa — yo‘q.",
          en: "Visible: the site name (SNI). Not the page.",
        },
      },
      {
        phase: "tls",
        from: "server",
        to: "browser",
        transport: "TCP 443 → 50322",
        summary: "TLS ServerHello + certificate",
        fields: [
          ["Certificate", `CN=${HOST}`],
          ["Issuer", "Example CA"],
          ["Valid until", "2027-03-01"],
        ],
        note: {
          uz: "Server sertifikatini ko‘rsatadi. Brauzer tekshiradi: nom mosmi, muddati o‘tmaganmi, ishonchli markaz imzolaganmi. Mos kelmasa — qizil ogohlantirish.",
          en: "The server shows its certificate. The browser checks the name, the dates and the signing authority. Any mismatch means a red warning.",
        },
        visible: {
          uz: "TLS 1.3’da sertifikat ham shifrlangan; faqat paket o‘lchami ko‘rinadi.",
          en: "In TLS 1.3 even the certificate is encrypted; only the packet size shows.",
        },
      },
      {
        phase: "tls",
        from: "browser",
        to: "server",
        transport: "TCP 50322 → 443",
        summary: "TLS Finished",
        fields: [["Cipher", "TLS_AES_128_GCM_SHA256"]],
        note: {
          uz: "Ikkala tomon umumiy kalitga kelishdi. Bundan keyingi hammasi shifrlangan — qulf belgisi shu.",
          en: "Both sides agreed on a shared key. Everything from here on is encrypted: that is the padlock.",
        },
        visible: {
          uz: "Faqat shifrlangan baytlar.",
          en: "Only encrypted bytes.",
        },
      },
    ]);

  const sealed: Text = {
    uz: "Faqat shifrlangan baytlar va ularning o‘lchami. Sahifa, cookie, parol — ko‘rinmaydi.",
    en: "Only encrypted bytes and their size. The page, cookies and passwords stay hidden.",
  };
  phase("http", 46, [
    {
      phase: "http",
      from: "browser",
      to: "server",
      transport: `TCP 50322 → ${port}`,
      summary: "GET /kitoblar HTTP/1.1",
      fields: [
        ["Host", HOST],
        ["User-Agent", "Mozilla/5.0"],
        ["Accept", "text/html"],
        ["Cookie", COOKIE],
      ],
      note: {
        uz: "Nihoyat so‘rov: metod (GET), yo‘l (/kitoblar), sarlavhalar. Cookie — server sizni taniydigan “kalit”.",
        en: "At last the request: method (GET), path (/kitoblar) and headers. The cookie is the key the server knows you by.",
      },
      visible: https
        ? sealed
        : {
            uz: "HAMMASI: qaysi sahifa, va cookie — hujumchi uni olib, sizning nomingizdan kirishi mumkin!",
            en: "EVERYTHING: the page, and the cookie, which an attacker can steal to log in as you!",
          },
    },
    {
      phase: "http",
      from: "server",
      to: "browser",
      transport: `TCP ${port} → 50322`,
      summary: "HTTP/1.1 200 OK",
      fields: [
        ["Content-Type", "text/html; charset=utf-8"],
        ["Content-Length", "5120"],
        ["Cache-Control", "max-age=60"],
        ["Body", "<!doctype html><h1>Kitoblar</h1>…"],
      ],
      note: {
        uz: "Server javobi: status (200 — hammasi yaxshi), sarlavhalar va sahifaning HTML’i. Brauzer HTML’ni o‘qib, sahifani chizadi.",
        en: "The server’s answer: a status (200, all good), headers and the page’s HTML. The browser reads the HTML and draws the page.",
      },
      visible: https
        ? sealed
        : {
            uz: "HAMMASI: sahifaning to‘liq mazmuni. Hujumchi uni o‘zgartirib ham yuborishi mumkin.",
            en: "EVERYTHING: the full page, which an attacker could even alter on the way.",
          },
    },
  ]);
  return { packets, timings, total: clock };
}

// --- A small HTTP server for hand-built requests ---------------------------

export type Method = "GET" | "POST" | "HEAD" | "DELETE";
export type HttpRequest = {
  method: Method;
  path: string;
  cookie: "" | "user" | "admin";
  body: string;
};
export type HttpResponse = {
  status: number;
  reason: string;
  headers: [string, string][];
  body: string;
  explain: Text;
};

export const PATHS = [
  "/",
  "/kitoblar",
  "/kitoblar/42",
  "/kitoblar/999",
  "/eski-sahifa",
  "/kirish",
  "/admin",
];
export const DEMO_LOGIN = { user: "talaba", password: "kitob123" };
export const COOKIES = {
  user: "session=u-7d41",
  admin: "session=a-19ff",
};

const html = (title: string) =>
  `<!doctype html>\n<title>${title}</title>\n<h1>${title}</h1>`;

function respond(
  status: number,
  reason: string,
  explain: Text,
  headers: [string, string][] = [],
  body = "",
): HttpResponse {
  return {
    status,
    reason,
    headers: [
      ...(body
        ? ([
            [
              "Content-Type",
              body.startsWith("{")
                ? "application/json"
                : "text/html; charset=utf-8",
            ],
            ["Content-Length", String(new TextEncoder().encode(body).length)],
          ] as [string, string][])
        : []),
      ...headers,
    ],
    body,
    explain,
  };
}

export function serve(request: HttpRequest): HttpResponse {
  const { method, path, cookie } = request;
  const head = (r: HttpResponse) =>
    method === "HEAD" ? { ...r, body: "" } : r;
  if (method === "DELETE")
    return respond(
      405,
      "Method Not Allowed",
      {
        uz: "Bu manzil o‘chirishga ruxsat bermaydi. Allow sarlavhasi qaysi metodlar mumkinligini aytadi.",
        en: "This address does not allow deleting. The Allow header lists the permitted methods.",
      },
      [["Allow", "GET, HEAD, POST"]],
    );
  if (path === "/eski-sahifa")
    return respond(
      301,
      "Moved Permanently",
      {
        uz: "Sahifa doimiy ko‘chgan. Brauzer Location’dagi yangi manzilga o‘zi o‘tadi — siz buni sezmaysiz ham.",
        en: "The page moved for good. The browser follows Location to the new address by itself; you barely notice.",
      },
      [["Location", "/kitoblar"]],
    );
  if (path === "/kirish") {
    if (method !== "POST")
      return head(
        respond(
          200,
          "OK",
          {
            uz: "Kirish formasi. Login va parol POST so‘rovi tanasida yuboriladi.",
            en: "The sign-in form. The username and password go in the body of a POST request.",
          },
          [],
          html("Kirish"),
        ),
      );
    const form = new URLSearchParams(request.body.trim());
    if (
      form.get("login") === DEMO_LOGIN.user &&
      form.get("parol") === DEMO_LOGIN.password
    )
      return respond(
        302,
        "Found",
        {
          uz: "Kirish muvaffaqiyatli. Server Set-Cookie bilan sessiya kalitini beradi va /kitoblar’ga yo‘naltiradi. Brauzer bu cookie’ni keyingi har bir so‘rovga qo‘shadi.",
          en: "Signed in. The server hands out a session key with Set-Cookie and redirects to /kitoblar. The browser adds this cookie to every later request.",
        },
        [
          ["Set-Cookie", `${COOKIES.user}; HttpOnly; Secure; SameSite=Lax`],
          ["Location", "/kitoblar"],
        ],
      );
    return respond(
      401,
      "Unauthorized",
      {
        uz: "Login yoki parol noto‘g‘ri. Yaxshi server qaysi biri xato ekanini aytmaydi.",
        en: "Wrong username or password. A good server does not say which one.",
      },
      [],
      html("Login yoki parol noto‘g‘ri"),
    );
  }
  if (method === "POST")
    return respond(
      405,
      "Method Not Allowed",
      {
        uz: "Bu manzilga ma’lumot yuborib bo‘lmaydi.",
        en: "You cannot send data to this address.",
      },
      [["Allow", "GET, HEAD"]],
    );
  if (path === "/admin") {
    if (!cookie)
      return head(
        respond(
          401,
          "Unauthorized",
          {
            uz: "Siz kimligingizni aytmadingiz (cookie yo‘q). Avval tizimga kiring.",
            en: "You did not say who you are (no cookie). Sign in first.",
          },
          [],
          html("Avval tizimga kiring"),
        ),
      );
    if (cookie === "user")
      return head(
        respond(
          403,
          "Forbidden",
          {
            uz: "Server sizni taniydi, lekin sizga bu sahifa ruxsat etilmagan. 401 — “kimsiz?”, 403 — “bilaman, lekin mumkin emas”.",
            en: "The server knows you, but you may not see this page. 401 means “who are you?”, 403 means “I know you, but no”.",
          },
          [],
          html("Ruxsat yo‘q"),
        ),
      );
    return head(
      respond(
        200,
        "OK",
        {
          uz: "Admin cookie bilan sahifa ochildi. Shuning uchun cookie’ni o‘g‘irlatish — hisobni o‘g‘irlatish bilan barobar.",
          en: "The admin cookie opened the page. That is why a stolen cookie is a stolen account.",
        },
        [],
        html("Admin paneli"),
      ),
    );
  }
  const books: Record<string, string> = {
    "/": html("Kutubxona"),
    "/kitoblar": html("Kitoblar"),
    "/kitoblar/42":
      '{"id":42,"nomi":"O‘tkan kunlar","muallif":"Abdulla Qodiriy"}',
  };
  if (path in books)
    return head(
      respond(
        200,
        "OK",
        method === "HEAD"
          ? {
              uz: "HEAD — xuddi GET, lekin tanasiz: faqat sarlavhalar. Fayl o‘zgarganini yoki hajmini bilish uchun qulay.",
              en: "HEAD is GET without the body: headers only. Handy for checking size or changes.",
            }
          : path === "/kitoblar/42"
            ? {
                uz: "Sahifa emas, ma’lumot: JSON. Ilovalar va API’lar shunday gaplashadi.",
                en: "Not a page but data: JSON. Apps and APIs talk like this.",
              }
            : {
                uz: "200 OK — sahifa topildi va yuborildi.",
                en: "200 OK: the page was found and sent.",
              },
        [],
        books[path],
      ),
    );
  return head(
    respond(
      404,
      "Not Found",
      {
        uz: "Bunday sahifa yo‘q. Server ishlayapti, faqat bu manzilda hech narsa yo‘q.",
        en: "No such page. The server works; there is just nothing at this address.",
      },
      [],
      html("Topilmadi"),
    ),
  );
}

export function formatRequest(request: HttpRequest) {
  const lines = [`${request.method} ${request.path} HTTP/1.1`, `Host: ${HOST}`];
  if (request.cookie) lines.push(`Cookie: ${COOKIES[request.cookie]}`);
  const body = request.method === "POST" ? request.body.trim() : "";
  if (body) {
    lines.push("Content-Type: application/x-www-form-urlencoded");
    lines.push(`Content-Length: ${new TextEncoder().encode(body).length}`);
  }
  return `${lines.join("\n")}\n\n${body}`;
}

export const formatResponse = (response: HttpResponse) =>
  `HTTP/1.1 ${response.status} ${response.reason}\n${response.headers
    .map(([k, v]) => `${k}: ${v}`)
    .join("\n")}${response.headers.length ? "\n" : ""}\n${response.body}`;

// The status codes lesson 17 asks the student to produce.
export const GOALS = [200, 301, 302, 401, 403, 404] as const;
