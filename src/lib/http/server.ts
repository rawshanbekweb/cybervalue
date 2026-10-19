// A pretend web server for the HTTP lab. It runs in the browser, answers a
// few routes the lessons need, and never touches the network: the student
// writes a raw request and reads the raw response.

export type HttpRequest = {
  method: string;
  path: string;
  headers: Record<string, string>;
  body: string;
};

export type HttpResponse = {
  status: number;
  reason: string;
  headers: [string, string][];
  body: string;
};

export type ParseResult =
  | { ok: true; request: HttpRequest }
  | { ok: false; line: number; message: { uz: string; en: string } };

const REASONS: Record<number, string> = {
  200: "OK",
  204: "No Content",
  301: "Moved Permanently",
  400: "Bad Request",
  401: "Unauthorized",
  403: "Forbidden",
  404: "Not Found",
  405: "Method Not Allowed",
};

export const SESSION = "s3ss10n-7f2a";
const LOGIN = { user: "ali", pass: "kuchli-parol-2026" };
export const TRUSTED_ORIGIN = "https://app.cybervalue.uz";

/** Reads "GET /path HTTP/1.1", header lines, a blank line and a body. */
export function parseRequest(raw: string): ParseResult {
  const lines = raw.replace(/\r/g, "").split("\n");
  const first = lines[0]?.trim() ?? "";
  const start = /^([A-Z]+)\s+(\/\S*)\s+HTTP\/1\.[01]$/.exec(first);
  if (!start)
    return {
      ok: false,
      line: 1,
      message: {
        uz: "Birinchi qator shunday bo‘lishi kerak: METOD /yo‘l HTTP/1.1, masalan GET / HTTP/1.1",
        en: "The first line must be: METHOD /path HTTP/1.1, for example GET / HTTP/1.1",
      },
    };
  const headers: Record<string, string> = {};
  let i = 1;
  for (; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) break;
    const header = /^([A-Za-z0-9-]+):\s*(.*)$/.exec(line.trim());
    if (!header)
      return {
        ok: false,
        line: i + 1,
        message: {
          uz: "Sarlavha “Nomi: qiymati” ko‘rinishida bo‘ladi, masalan Host: shop.uz",
          en: "A header looks like “Name: value”, for example Host: shop.uz",
        },
      };
    headers[header[1].toLowerCase()] = header[2].trim();
  }
  if (!headers.host)
    return {
      ok: false,
      line: 2,
      message: {
        uz: "HTTP/1.1 da Host sarlavhasi majburiy: qaysi saytga so‘rov ketayotganini bildiradi.",
        en: "HTTP/1.1 requires a Host header: it says which site the request is for.",
      },
    };
  return {
    ok: true,
    request: {
      method: start[1],
      path: start[2],
      headers,
      body: lines
        .slice(i + 1)
        .join("\n")
        .trim(),
    },
  };
}

const cookies = (request: HttpRequest) =>
  Object.fromEntries(
    (request.headers.cookie ?? "")
      .split(";")
      .map((part) => part.trim().split("="))
      .filter((pair) => pair.length === 2),
  ) as Record<string, string>;

const form = (body: string) =>
  Object.fromEntries(
    body
      .split("&")
      .map((part) => part.split("=").map(decodeURIComponent))
      .filter((pair) => pair.length === 2),
  ) as Record<string, string>;

function reply(
  status: number,
  body = "",
  headers: [string, string][] = [],
): HttpResponse {
  return {
    status,
    reason: REASONS[status] ?? "",
    headers: [
      ["Content-Type", "text/plain; charset=utf-8"],
      ...headers,
      ["Content-Length", String(new TextEncoder().encode(body).length)],
    ],
    body,
  };
}

/** Answers one request the way the lessons describe. */
export function serve(request: HttpRequest): HttpResponse {
  const { method, path } = request;
  const session = cookies(request).session === SESSION;
  if (path === "/") {
    if (method !== "GET") return reply(405, "", [["Allow", "GET"]]);
    return reply(200, "Cybervalue do‘koniga xush kelibsiz!");
  }
  if (path === "/aksiya") return reply(301, "", [["Location", "/chegirmalar"]]);
  if (path === "/chegirmalar")
    return reply(200, "Bugungi chegirma: 20% kitoblarga.");
  if (path === "/login") {
    if (method !== "POST") return reply(405, "", [["Allow", "POST"]]);
    const fields = form(request.body);
    if (fields.user !== LOGIN.user || fields.pass !== LOGIN.pass)
      return reply(401, "Login yoki parol noto‘g‘ri.");
    return reply(200, "Xush kelibsiz, Ali!", [
      [
        "Set-Cookie",
        `session=${SESSION}; Path=/; HttpOnly; Secure; SameSite=Lax`,
      ],
    ]);
  }
  if (path === "/profil") {
    if (!session)
      return reply(401, "Avval tizimga kiring.", [
        ["WWW-Authenticate", 'Cookie realm="shop"'],
      ]);
    return reply(200, "Ali Valiyev · buyurtmalar: 3");
  }
  if (path === "/admin")
    return session
      ? reply(403, "Sizda admin huquqi yo‘q.")
      : reply(401, "Avval tizimga kiring.");
  if (path === "/api/buyurtmalar") {
    const origin = request.headers.origin;
    const cors: [string, string][] =
      origin === TRUSTED_ORIGIN
        ? [
            ["Access-Control-Allow-Origin", TRUSTED_ORIGIN],
            ["Access-Control-Allow-Credentials", "true"],
            ["Vary", "Origin"],
          ]
        : [["Vary", "Origin"]];
    if (method === "OPTIONS")
      return reply(204, "", [
        ...cors,
        ...(origin === TRUSTED_ORIGIN
          ? ([
              ["Access-Control-Allow-Methods", "GET, POST"],
              ["Access-Control-Allow-Headers", "Content-Type"],
            ] as [string, string][])
          : []),
      ]);
    if (!session) return reply(401, "Avval tizimga kiring.", cors);
    return reply(200, '[{"id":1,"kitob":"Kiberxavfsizlik asoslari"}]', [
      ["Content-Type", "application/json"],
      ...cors,
    ]);
  }
  return reply(404, "Bunday sahifa yo‘q.");
}

export function formatResponse(response: HttpResponse) {
  return [
    `HTTP/1.1 ${response.status} ${response.reason}`,
    ...response.headers.map(([name, value]) => `${name}: ${value}`),
    "",
    response.body,
  ].join("\n");
}

export const header = (response: HttpResponse, name: string) =>
  response.headers.find(([n]) => n.toLowerCase() === name.toLowerCase())?.[1];

/** The demo account the lessons let the student use. */
export const DEMO = LOGIN;
