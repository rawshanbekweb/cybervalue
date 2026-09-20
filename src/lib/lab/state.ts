import { randomBytes, pbkdf2Sync, timingSafeEqual, createHmac } from "node:crypto";

const PASSWORD_SALT = "local-teaching-fixture";
const PBKDF2_ITERATIONS = 120_000;

type Role = "user" | "admin";

interface Account {
  id: number;
  role: Role;
  name: string;
  hash: Buffer;
}

export const ACCOUNTS: Record<string, Account> = {
  ali: {
    id: 15,
    role: "user",
    name: "Ali Karimov",
    hash: pbkdf2Sync("ali123", PASSWORD_SALT, PBKDF2_ITERATIONS, 32, "sha256"),
  },
  vali: {
    id: 16,
    role: "user",
    name: "Vali Olimov",
    hash: pbkdf2Sync("vali123", PASSWORD_SALT, PBKDF2_ITERATIONS, 32, "sha256"),
  },
  admin: {
    id: 1,
    role: "admin",
    name: "Administrator",
    hash: pbkdf2Sync("admin123", PASSWORD_SALT, PBKDF2_ITERATIONS, 32, "sha256"),
  },
};

export function verifyPassword(username: string, password: string): boolean {
  const account = ACCOUNTS[username];
  if (!account) return false;
  const candidate = pbkdf2Sync(password, PASSWORD_SALT, PBKDF2_ITERATIONS, 32, "sha256");
  return candidate.length === account.hash.length && timingSafeEqual(candidate, account.hash);
}

export interface Identity {
  username: string;
  id: number;
  role: Role;
  name: string;
}

export function identityFor(username: string | null): Identity | null {
  if (!username) return null;
  const account = ACCOUNTS[username];
  if (!account) return null;
  return { username, id: account.id, role: account.role, name: account.name };
}

// This secret is generated once per Node process (not per request), matching the original
// Python demo's `secrets.token_bytes(32)` at module load — tokens don't survive a server restart.
const SECRET = randomBytes(32);

function b64url(data: Buffer): string {
  return data.toString("base64url");
}

export function tokenFor(username: string): string {
  const now = Math.floor(Date.now() / 1000);
  const head = b64url(Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })));
  const body = b64url(
    Buffer.from(
      JSON.stringify({
        sub: username,
        iat: now,
        exp: now + 1800,
        iss: "lab-local",
        aud: "web-security-lab",
      }),
    ),
  );
  const message = `${head}.${body}`;
  const signature = b64url(createHmac("sha256", SECRET).update(message).digest());
  return `${message}.${signature}`;
}

export function verifyToken(token: string): string | null {
  try {
    const [head, payload, signature] = token.split(".");
    if (!head || !payload || !signature) return null;
    const expected = b64url(createHmac("sha256", SECRET).update(`${head}.${payload}`).digest());
    const sigBuf = Buffer.from(signature);
    const expBuf = Buffer.from(expected);
    if (sigBuf.length !== expBuf.length || !timingSafeEqual(sigBuf, expBuf)) return null;
    const header = JSON.parse(Buffer.from(head, "base64url").toString("utf8"));
    const claims = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    if (header?.alg !== "HS256" || claims?.iss !== "lab-local" || claims?.aud !== "web-security-lab") {
      return null;
    }
    if (typeof claims.exp !== "number" || claims.exp <= Date.now() / 1000) return null;
    const sub = claims.sub;
    return typeof sub === "string" && sub in ACCOUNTS ? sub : null;
  } catch {
    return null;
  }
}

export interface Post {
  id: number;
  title: string;
  owner_id: number;
}

export interface Comment {
  id: number;
  content: string;
}

export interface LabState {
  sessions: Map<string, { username: string; expiresAt: number }>;
  posts: Post[];
  nextId: number;
  comments: Comment[];
  attempts: Map<string, number[]>;
}

function createLabState(): LabState {
  return {
    sessions: new Map(),
    posts: [{ id: 1, title: "My first post", owner_id: 15 }],
    nextId: 2,
    comments: [],
    attempts: new Map(),
  };
}

// Module-scope map: fine under `next start`'s single long-lived Node process, same lifetime
// assumption the original ThreadingHTTPServer made. It would not survive a serverless/multi-instance
// deployment, but this lab already treats every SQL query as a throwaway fixture, so nothing here
// needs durable storage — a restart just resets everyone's sandbox, which is harmless by design.
const STATES = new Map<string, LabState>();

export function getOrCreateLabState(labId: string | undefined): { id: string; state: LabState; isNew: boolean } {
  if (labId && STATES.has(labId)) {
    return { id: labId, state: STATES.get(labId)!, isNew: false };
  }
  const id = randomBytes(18).toString("base64url");
  const state = createLabState();
  STATES.set(id, state);
  return { id, state, isNew: true };
}

export function recordLoginAttempt(state: LabState, username: string): number {
  const now = Date.now() / 1000;
  const attempts = (state.attempts.get(username) ?? []).filter((t) => now - t < 30);
  state.attempts.set(username, attempts);
  return attempts.length;
}

export function registerFailedAttempt(state: LabState, username: string) {
  const attempts = state.attempts.get(username) ?? [];
  attempts.push(Date.now() / 1000);
  state.attempts.set(username, attempts);
}

export function clearAttempts(state: LabState, username: string) {
  state.attempts.set(username, []);
}

export function identityFromRequest(
  state: LabState,
  authorizationHeader: string | null,
  sessionCookie: string | undefined,
): Identity | null {
  let username: string | null = null;
  if (authorizationHeader?.startsWith("Bearer ")) {
    username = verifyToken(authorizationHeader.slice(7));
  } else if (sessionCookie) {
    const entry = state.sessions.get(sessionCookie);
    username = entry && entry.expiresAt > Date.now() / 1000 ? entry.username : null;
  }
  return identityFor(username);
}
