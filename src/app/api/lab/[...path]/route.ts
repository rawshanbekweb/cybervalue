import { randomBytes } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { openLabDb, type UserRow } from "@/lib/lab/db";
import {
  getOrCreateLabState,
  identityFromRequest,
  verifyPassword,
  tokenFor,
  recordLoginAttempt,
  registerFailedAttempt,
  clearAttempts,
  ACCOUNTS,
  type LabState,
  type Identity,
} from "@/lib/lab/state";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface CookieOp {
  name: string;
  value: string;
  maxAge?: number;
}

interface ApiResult {
  status: number;
  data: unknown;
  headers?: Record<string, string>;
  cookies?: CookieOp[];
}

function result(
  status: number,
  data: unknown,
  headers?: Record<string, string>,
  cookies?: CookieOp[],
): ApiResult {
  return { status, data, headers, cookies };
}

const STATUS_PHRASES: Record<number, string> = {
  200: "OK",
  201: "Created",
  301: "Moved Permanently",
  302: "Found",
  400: "Bad Request",
  401: "Unauthorized",
  403: "Forbidden",
  404: "Not Found",
  429: "Too Many Requests",
  500: "Internal Server Error",
};

async function parseBody(
  request: NextRequest,
  method: string,
): Promise<{ body: Record<string, unknown> } | { error: ApiResult }> {
  if (!["POST", "PUT", "PATCH", "DELETE"].includes(method)) return { body: {} };
  const text = await request.text();
  if (Buffer.byteLength(text, "utf8") > 16384) {
    return { error: result(413, { error: "Body must not exceed 16 KB." }) };
  }
  if (!text) return { body: {} };
  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.toLowerCase().startsWith("application/json")) {
    return { error: result(415, { error: "Content-Type must be application/json." }) };
  }
  try {
    const parsed: unknown = JSON.parse(text);
    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
      throw new Error("not an object");
    }
    return { body: parsed as Record<string, unknown> };
  } catch {
    return { error: result(400, { error: "Body must be a valid JSON object." }) };
  }
}

function queryParams(request: NextRequest): Record<string, string[]> {
  const query: Record<string, string[]> = {};
  for (const key of new Set(request.nextUrl.searchParams.keys())) {
    query[key] = request.nextUrl.searchParams.getAll(key);
  }
  return query;
}

async function dispatch(
  request: NextRequest,
  method: string,
  subpath: string,
  state: LabState,
  user: Identity | null,
): Promise<ApiResult> {
  const query = queryParams(request);
  const parsedBody = await parseBody(request, method);
  if ("error" in parsedBody) return parsedBody.error;
  const body = parsedBody.body;

  if (subpath === "/health" && method === "GET") {
    return result(200, { status: "online", database: "SQLite", mode: "local lab", user });
  }

  if (subpath === "/echo") {
    const safeHeaders: Record<string, string> = {};
    request.headers.forEach((value, key) => {
      safeHeaders[key] = key.toLowerCase() === "cookie" ? "[see it in Network → Headers]" : value;
    });
    return result(200, {
      method,
      path: "/api/echo",
      query,
      headers: safeHeaders,
      body,
      flow: ["Browser", "HTTP request", "Backend", "HTTP response", "Browser"],
    });
  }

  const statusMatch = /^\/status\/(.+)$/.exec(subpath);
  if (statusMatch && method === "GET") {
    let code = Number.parseInt(statusMatch[1], 10);
    if (!Number.isFinite(code) || !(code in STATUS_PHRASES)) code = 400;
    const headers: Record<string, string> = {};
    if (code === 301 || code === 302) headers.Location = "/api/lab/status/200";
    if (code === 401) headers["WWW-Authenticate"] = 'Bearer realm="web-security-lab"';
    return result(
      code,
      { status: code, phrase: STATUS_PHRASES[code], note: "A response returned deliberately for the status-code lesson." },
      headers,
    );
  }

  if (subpath === "/login" && method === "POST") {
    const name = body.username;
    const password = body.password;
    if (typeof name !== "string" || typeof password !== "string") {
      return result(400, { error: "Username and password must be strings." });
    }
    const attemptCount = recordLoginAttempt(state, name);
    if (attemptCount >= 5) {
      return result(429, { error: "5 failed attempts. Wait 30 seconds." }, { "Retry-After": "30" });
    }
    if (!verifyPassword(name, password)) {
      registerFailedAttempt(state, name);
      return result(
        401,
        { error: "Incorrect username or password." },
        { "WWW-Authenticate": 'Bearer realm="web-security-lab"' },
      );
    }
    clearAttempts(state, name);
    const account = ACCOUNTS[name];
    const session = randomBytes(24).toString("base64url");
    state.sessions.set(session, { username: name, expiresAt: Date.now() / 1000 + 1800 });
    return result(
      200,
      {
        message: "Login successful",
        user: { username: name, id: account.id, role: account.role },
        token: tokenFor(name),
        cookie_flags: { HttpOnly: true, SameSite: "Strict", Secure: false },
        note: "Secure=false only applies to this HTTP localhost lab. A production HTTPS deployment needs Secure set.",
      },
      undefined,
      [{ name: "session", value: session, maxAge: 1800 }],
    );
  }

  if (subpath === "/logout" && method === "POST") {
    const session = request.cookies.get("session")?.value;
    if (session) state.sessions.delete(session);
    return result(
      200,
      {
        message:
          "The cookie session has ended. The JWT stays valid until its own exp — revoking it requires a separate mechanism.",
      },
      undefined,
      [{ name: "session", value: "", maxAge: 0 }],
    );
  }

  if ((subpath === "/profile" || subpath === "/admin") && method === "GET") {
    if (!user) {
      return result(
        401,
        { error: "Log in first." },
        { "WWW-Authenticate": 'Bearer realm="web-security-lab"' },
      );
    }
    if (subpath === "/admin" && user.role !== "admin") {
      return result(403, {
        error: "The admin role is required. A button on the frontend can't grant that.",
        your_role: user.role,
      });
    }
    return result(200, { user, message: "The server checked the permission." });
  }

  const userMatch = /^\/users\/(.+)$/.exec(subpath);
  if (userMatch && method === "GET") {
    if (!user) {
      return result(
        401,
        { error: "Log in with ali / ali123 first." },
        { "WWW-Authenticate": 'Bearer realm="web-security-lab"' },
      );
    }
    const target = Number.parseInt(userMatch[1], 10);
    if (!Number.isFinite(target) || String(target) !== userMatch[1]) {
      return result(400, { error: "ID must be an integer." });
    }
    const vulnerable = query.mode?.[0] === "vulnerable";
    if (!vulnerable && target !== user.id && user.role !== "admin") {
      return result(403, {
        error: "You don't have permission to view this profile.",
        check: "current_user.id == resource.id OR role == admin",
      });
    }
    const db = openLabDb();
    try {
      const row = db.prepare("SELECT * FROM users WHERE id = ?").get(target) as UserRow | undefined;
      return result(row ? 200 : 404, {
        user: row ? { ...row } : null,
        mode: vulnerable ? "vulnerable" : "safe",
        authorization_checked: !vulnerable,
      });
    } finally {
      db.close();
    }
  }

  if (subpath === "/sql" && method === "POST") {
    const name = typeof body.username === "string" ? body.username : "ali";
    if (name.length > 300) {
      return result(400, { error: "Username must be a string of up to 300 characters." });
    }
    const vulnerable = body.mode === "vulnerable";
    // Intentional: this branch mirrors the original SQLi teaching lab exactly. It only ever
    // touches the throwaway fixture DB opened above, never anything persistent or real.
    const sql = vulnerable
      ? `SELECT id, username, role FROM users WHERE username = '${name}'`
      : "SELECT id, username, role FROM users WHERE username = ?";
    const db = openLabDb();
    try {
      const stmt = db.prepare(sql);
      const rows = vulnerable ? stmt.all() : stmt.all(name);
      return result(200, {
        query: sql,
        parameters: vulnerable ? [] : [name],
        rows: rows.map((r) => ({ ...(r as object) })),
        count: rows.length,
        mode: vulnerable ? "vulnerable" : "safe",
      });
    } catch (error) {
      return result(400, {
        query: sql,
        error: error instanceof Error ? error.message : String(error),
        note: "This query error is only ever shown inside this teaching lab.",
      });
    } finally {
      db.close();
    }
  }

  if (subpath === "/database" && method === "GET") {
    const db = openLabDb();
    try {
      const rows = db.prepare("SELECT * FROM users").all();
      return result(200, {
        table: "users",
        rows: rows.map((r) => ({ ...(r as object) })),
        note: "Synthetic teaching data only.",
      });
    } finally {
      db.close();
    }
  }

  if (subpath === "/sql/crud" && method === "POST") {
    const statements: Record<string, [string, unknown[]]> = {
      SELECT: ["SELECT * FROM users", []],
      INSERT: [
        "INSERT INTO users (id, username, name, role, email) VALUES (?, ?, ?, ?, ?)",
        [20, "lola", "Lola", "user", "lola@example.test"],
      ],
      UPDATE: ["UPDATE users SET username = ? WHERE id = ?", ["ali_updated", 15]],
      DELETE: ["DELETE FROM users WHERE id = ?", [16]],
    };
    const op = typeof body.operation === "string" ? body.operation : "SELECT";
    if (!(op in statements)) {
      return result(400, { error: "Choose SELECT, INSERT, UPDATE, or DELETE." });
    }
    const [sql, params] = statements[op];
    const db = openLabDb();
    try {
      const before = db.prepare("SELECT * FROM users").all();
      db.prepare(sql).run(...(params as (string | number)[]));
      const after = db.prepare("SELECT * FROM users").all();
      return result(200, {
        query: sql,
        parameters: params,
        before: before.map((r) => ({ ...(r as object) })),
        after: after.map((r) => ({ ...(r as object) })),
        note: "Every request runs against its own fresh, ephemeral SQLite instance.",
      });
    } finally {
      db.close();
    }
  }

  if (subpath === "/comments") {
    if (method === "GET") return result(200, { comments: state.comments });
    if (method === "POST") {
      const content = body.content;
      if (typeof content !== "string" || content.length < 1 || content.length > 2000) {
        return result(400, { error: "Comment must be 1–2000 characters." });
      }
      const comment = { id: state.comments.length + 1, content };
      state.comments.push(comment);
      return result(201, {
        comment,
        note: "The text is stored in server memory. What matters is how the browser renders it.",
      });
    }
  }

  if (subpath === "/validate" && method === "POST") {
    const age = body.age;
    if (typeof age !== "number" || !Number.isInteger(age) || age < 1 || age > 120) {
      return result(400, {
        error: "Server: age must be an integer between 1 and 120.",
        received: age,
      });
    }
    return result(200, {
      accepted: true,
      age,
      note: "The server validates this even without any frontend constraints.",
    });
  }

  if (subpath === "/checkout" && method === "POST") {
    const quantity = body.quantity ?? 1;
    if (typeof quantity !== "number" || !Number.isInteger(quantity) || quantity < 1 || quantity > 10) {
      return result(400, { error: "Quantity must be an integer between 1 and 10." });
    }
    return result(200, {
      quantity,
      client_price_ignored: body.price,
      server_unit_price: 50000,
      total: quantity * 50000,
      note: "The price was pulled from the server's own catalog.",
    });
  }

  if (subpath === "/posts" || subpath.startsWith("/posts/")) {
    if (method === "GET" && subpath === "/posts") {
      return result(200, { posts: state.posts });
    }
    if (!user) {
      return result(
        401,
        { error: "You must log in to modify a post." },
        { "WWW-Authenticate": 'Bearer realm="web-security-lab"' },
      );
    }
    if (method === "POST" && subpath === "/posts") {
      const title = typeof body.title === "string" ? body.title.trim() : null;
      if (!title || title.length < 1 || title.length > 120) {
        return result(400, { error: "Title must be 1–120 characters." });
      }
      const item = { id: state.nextId, title, owner_id: user.id };
      state.nextId += 1;
      state.posts.push(item);
      return result(201, item, { Location: `/api/lab/posts/${item.id}` });
    }
    const postMatch = /^\/posts\/(.+)$/.exec(subpath);
    const identRaw = postMatch?.[1] ?? "";
    const ident = Number.parseInt(identRaw, 10);
    if (!Number.isFinite(ident) || String(ident) !== identRaw) {
      return result(405, { error: "This method isn't available on this resource." });
    }
    const item = state.posts.find((p) => p.id === ident);
    if (!item) return result(404, { error: "Post not found." });
    if (method === "GET") return result(200, item);
    if (user.role !== "admin" && item.owner_id !== user.id) {
      return result(403, { error: "You can only modify your own posts." });
    }
    if (method === "DELETE") {
      state.posts.splice(state.posts.indexOf(item), 1);
      return result(200, { deleted: ident });
    }
    if (method === "PUT" || method === "PATCH") {
      const title = typeof body.title === "string" ? body.title.trim() : null;
      if (!title || title.length < 1 || title.length > 120) {
        return result(400, { error: "Title must be 1–120 characters." });
      }
      item.title = title;
      return result(200, item);
    }
  }

  return result(404, { error: "Endpoint or method not found.", path: subpath, method });
}

async function handle(request: NextRequest, path: string[] | undefined): Promise<NextResponse> {
  const subpath = "/" + (path ?? []).join("/");
  const method = request.method;

  const expectedOrigin = request.nextUrl.origin;
  const origin = request.headers.get("origin");
  if (origin && origin !== expectedOrigin) {
    return NextResponse.json({ error: "Request from a different origin was rejected." }, { status: 403 });
  }
  if (request.headers.get("sec-fetch-site") === "cross-site") {
    return NextResponse.json({ error: "Cross-site request was rejected." }, { status: 403 });
  }

  const { id: labId, state, isNew } = getOrCreateLabState(request.cookies.get("lab")?.value);
  const user = identityFromRequest(
    state,
    request.headers.get("authorization"),
    request.cookies.get("session")?.value,
  );

  const outcome = await dispatch(request, method, subpath, state, user);
  const response = NextResponse.json(outcome.data, { status: outcome.status });
  response.headers.set("Cache-Control", "no-store");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Lab-Mode", "local-educational");
  for (const [key, value] of Object.entries(outcome.headers ?? {})) {
    response.headers.set(key, value);
  }
  if (isNew) {
    response.cookies.set("lab", labId, { httpOnly: true, sameSite: "strict", path: "/" });
  }
  for (const cookie of outcome.cookies ?? []) {
    response.cookies.set(cookie.name, cookie.value, {
      httpOnly: true,
      sameSite: "strict",
      path: "/",
      maxAge: cookie.maxAge,
    });
  }
  return response;
}

type RouteParams = { params: Promise<{ path: string[] }> };

export async function GET(request: NextRequest, { params }: RouteParams) {
  return handle(request, (await params).path);
}
export async function POST(request: NextRequest, { params }: RouteParams) {
  return handle(request, (await params).path);
}
export async function PUT(request: NextRequest, { params }: RouteParams) {
  return handle(request, (await params).path);
}
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  return handle(request, (await params).path);
}
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  return handle(request, (await params).path);
}
