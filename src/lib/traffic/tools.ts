// Academy Intermediate · Traffic analysis: a small recorded capture, a
// Wireshark-style display filter over it, the credentials a plain-HTTP
// stream gives away, and how regular check-ins (beaconing) give malware
// away. Simplified, but the filter syntax is a real subset of Wireshark's.

// --- The capture -----------------------------------------------------------------

export type Packet = {
  no: number;
  time: string;
  src: string;
  dst: string;
  proto: "tcp" | "udp" | "icmp";
  sport?: number;
  dport?: number;
  syn?: boolean;
  ack?: boolean;
  rst?: boolean;
  /** The application protocol Wireshark would name. */
  app?: "dns" | "tls" | "http" | "ftp";
  info: string;
};

const tcp = (
  no: number,
  time: string,
  src: string,
  dst: string,
  sport: number,
  dport: number,
  flags: { syn?: boolean; ack?: boolean; rst?: boolean },
  info: string,
  app?: Packet["app"],
): Packet => ({
  no,
  time,
  src,
  dst,
  proto: "tcp",
  sport,
  dport,
  syn: Boolean(flags.syn),
  ack: Boolean(flags.ack),
  rst: Boolean(flags.rst),
  app,
  info,
});

export const SCANNER = "10.0.0.66";

export const CAPTURE: Packet[] = [
  {
    no: 1,
    time: "0.000",
    src: "10.0.0.5",
    dst: "8.8.8.8",
    proto: "udp",
    sport: 51000,
    dport: 53,
    app: "dns",
    info: "Standard query A bank.uz",
  },
  {
    no: 2,
    time: "0.021",
    src: "8.8.8.8",
    dst: "10.0.0.5",
    proto: "udp",
    sport: 53,
    dport: 51000,
    app: "dns",
    info: "Standard query response A 185.8.1.10",
  },
  tcp(3, "0.030", "10.0.0.5", "185.8.1.10", 50122, 443, { syn: true }, "[SYN]"),
  tcp(
    4,
    "0.052",
    "185.8.1.10",
    "10.0.0.5",
    443,
    50122,
    { syn: true, ack: true },
    "[SYN, ACK]",
  ),
  tcp(5, "0.053", "10.0.0.5", "185.8.1.10", 50122, 443, { ack: true }, "[ACK]"),
  tcp(
    6,
    "0.054",
    "10.0.0.5",
    "185.8.1.10",
    50122,
    443,
    { ack: true },
    "Client Hello (SNI=bank.uz)",
    "tls",
  ),
  tcp(7, "1.200", SCANNER, "10.0.0.20", 40001, 21, { syn: true }, "[SYN]"),
  tcp(
    8,
    "1.201",
    "10.0.0.20",
    SCANNER,
    21,
    40001,
    { syn: true, ack: true },
    "[SYN, ACK]",
  ),
  tcp(9, "1.202", SCANNER, "10.0.0.20", 40001, 22, { syn: true }, "[SYN]"),
  tcp(
    10,
    "1.203",
    "10.0.0.20",
    SCANNER,
    22,
    40001,
    { rst: true, ack: true },
    "[RST, ACK]",
  ),
  tcp(11, "1.204", SCANNER, "10.0.0.20", 40001, 23, { syn: true }, "[SYN]"),
  tcp(12, "1.205", SCANNER, "10.0.0.20", 40001, 80, { syn: true }, "[SYN]"),
  tcp(13, "1.206", SCANNER, "10.0.0.20", 40001, 21, { rst: true }, "[RST]"),
  tcp(
    14,
    "2.410",
    "10.0.0.7",
    "10.0.0.20",
    51515,
    21,
    { ack: true },
    "Request: USER ali",
    "ftp",
  ),
  {
    no: 15,
    time: "3.000",
    src: SCANNER,
    dst: "10.0.0.1",
    proto: "icmp",
    info: "Echo (ping) request",
  },
];

/** The packets the filter lesson asks for: the scanner's bare SYNs. */
export const SCAN_TARGET = CAPTURE.filter(
  (p) => p.src === SCANNER && p.syn && !p.ack,
).map((p) => p.no);

// --- Display filters ----------------------------------------------------------------

type Value = string | number | boolean | undefined;

/** The fields the filter knows; a missing field makes a comparison false. */
const FIELDS: Record<string, (p: Packet) => Value | Value[]> = {
  "ip.src": (p) => p.src,
  "ip.dst": (p) => p.dst,
  "ip.addr": (p) => [p.src, p.dst],
  "tcp.port": (p) => (p.proto === "tcp" ? [p.sport, p.dport] : undefined),
  "tcp.srcport": (p) => (p.proto === "tcp" ? p.sport : undefined),
  "tcp.dstport": (p) => (p.proto === "tcp" ? p.dport : undefined),
  "udp.port": (p) => (p.proto === "udp" ? [p.sport, p.dport] : undefined),
  "tcp.flags.syn": (p) => (p.proto === "tcp" ? p.syn : undefined),
  "tcp.flags.ack": (p) => (p.proto === "tcp" ? p.ack : undefined),
  "tcp.flags.reset": (p) => (p.proto === "tcp" ? p.rst : undefined),
};

/** Bare protocol names: true when the packet carries that protocol. */
const PROTOCOLS: Record<string, (p: Packet) => boolean> = {
  ip: () => true,
  tcp: (p) => p.proto === "tcp",
  udp: (p) => p.proto === "udp",
  icmp: (p) => p.proto === "icmp",
  dns: (p) => p.app === "dns",
  tls: (p) => p.app === "tls",
  http: (p) => p.app === "http",
  ftp: (p) => p.app === "ftp",
};

type Token =
  | { kind: "word"; text: string }
  | { kind: "op"; text: "==" | "!=" }
  | { kind: "and" | "or" | "not" | "(" | ")" };

function tokenize(input: string): Token[] | FilterError {
  const out: Token[] = [];
  let i = 0;
  while (i < input.length) {
    const c = input[i];
    if (/\s/.test(c)) {
      i++;
      continue;
    }
    const two = input.slice(i, i + 2);
    if (two === "==" || two === "!=") {
      out.push({ kind: "op", text: two });
      i += 2;
    } else if (two === "&&") {
      out.push({ kind: "and" });
      i += 2;
    } else if (two === "||") {
      out.push({ kind: "or" });
      i += 2;
    } else if (c === "!") {
      out.push({ kind: "not" });
      i++;
    } else if (c === "(" || c === ")") {
      out.push({ kind: c });
      i++;
    } else if (/[\w.]/.test(c)) {
      let j = i;
      while (j < input.length && /[\w.]/.test(input[j])) j++;
      const word = input.slice(i, j);
      const lower = word.toLowerCase();
      if (lower === "and") out.push({ kind: "and" });
      else if (lower === "or") out.push({ kind: "or" });
      else if (lower === "not") out.push({ kind: "not" });
      else if (lower === "eq") out.push({ kind: "op", text: "==" });
      else if (lower === "ne") out.push({ kind: "op", text: "!=" });
      else out.push({ kind: "word", text: word });
      i = j;
    } else return { code: "char", name: c };
  }
  return out;
}

type Match = (p: Packet) => boolean;

/** Why a filter does not parse; `name` is the word at fault, if any. */
export type FilterError = {
  code: "char" | "unfinished" | "paren" | "field" | "value" | "unknown" | "end";
  name?: string;
};

class Fail extends Error {
  constructor(readonly error: FilterError) {
    super(error.code);
  }
}

/** Parses a filter; an empty one shows everything, as in Wireshark. */
export function parseFilter(
  input: string,
): { ok: true; match: Match } | { ok: false; error: FilterError } {
  const tokens = tokenize(input);
  if (!Array.isArray(tokens)) return { ok: false, error: tokens };
  if (tokens.length === 0) return { ok: true, match: () => true };
  let pos = 0;
  const peek = () => tokens[pos];

  const literal = (text: string): Value => {
    if (/^\d+$/.test(text)) return Number(text);
    if (text === "true") return true;
    if (text === "false") return false;
    return text;
  };
  const same = (a: Value, b: Value) =>
    typeof a === "boolean" && typeof b === "number" ? Number(a) === b : a === b;

  function primary(): Match {
    const tok = peek();
    if (!tok) throw new Fail({ code: "unfinished" });
    if (tok.kind === "not") {
      pos++;
      const inner = primary();
      return (p) => !inner(p);
    }
    if (tok.kind === "(") {
      pos++;
      const inner = or();
      if (peek()?.kind !== ")") throw new Fail({ code: "paren" });
      pos++;
      return inner;
    }
    if (tok.kind !== "word") throw new Fail({ code: "field" });
    pos++;
    const name = tok.text.toLowerCase();
    const next = peek();
    if (next?.kind === "op") {
      pos++;
      const value = peek();
      if (value?.kind !== "word") throw new Fail({ code: "value" });
      pos++;
      const field = FIELDS[name];
      if (!field) throw new Fail({ code: "unknown", name: tok.text });
      const want = literal(value.text);
      const equal = next.text === "==";
      return (p) => {
        const got = field(p);
        const values = Array.isArray(got) ? got : [got];
        const present = values.filter((v) => v !== undefined);
        if (present.length === 0) return false;
        return equal
          ? present.some((v) => same(v, want))
          : present.every((v) => !same(v, want));
      };
    }
    const protocol = PROTOCOLS[name];
    if (protocol) return protocol;
    const field = FIELDS[name];
    if (field)
      return (p) => {
        const got = field(p);
        return Array.isArray(got)
          ? got.some((v) => v !== undefined)
          : got !== undefined;
      };
    throw new Fail({ code: "unknown", name: tok.text });
  }

  function and(): Match {
    let left = primary();
    while (peek()?.kind === "and") {
      pos++;
      const a = left;
      const b = primary();
      left = (p) => a(p) && b(p);
    }
    return left;
  }

  function or(): Match {
    let left = and();
    while (peek()?.kind === "or") {
      pos++;
      const a = left;
      const b = and();
      left = (p) => a(p) || b(p);
    }
    return left;
  }

  try {
    const match = or();
    if (pos < tokens.length) throw new Fail({ code: "end" });
    return { ok: true, match };
  } catch (e) {
    if (e instanceof Fail) return { ok: false, error: e.error };
    throw e;
  }
}

/** The packet numbers a filter shows, or null when it does not parse. */
export function shown(input: string, packets = CAPTURE) {
  const f = parseFilter(input);
  return f.ok ? packets.filter(f.match).map((p) => p.no) : null;
}

export const filterSolved = (input: string) => {
  const nos = shown(input);
  return (
    nos !== null &&
    nos.length === SCAN_TARGET.length &&
    nos.every((n, i) => n === SCAN_TARGET[i])
  );
};

// --- A plain-HTTP stream -------------------------------------------------------------

export const BASIC_TOKEN = "YWxpOlRvc2hrZW50MjAyNg==";

/** The stream "Follow TCP stream" reassembles for a login over plain HTTP. */
export const STREAM = [
  "GET /admin HTTP/1.1",
  "Host: router.local",
  `Authorization: Basic ${BASIC_TOKEN}`,
  "",
  "HTTP/1.1 200 OK",
  "Content-Type: text/html",
];

/** Decodes Basic credentials ("user:password" in Base64), or null. */
export function decodeBasic(token: string) {
  try {
    const text = atob(token.trim());
    const colon = text.indexOf(":");
    if (colon < 1) return null;
    return { user: text.slice(0, colon), password: text.slice(colon + 1) };
  } catch {
    return null;
  }
}

export const PASSWORD = decodeBasic(BASIC_TOKEN)!.password;

// --- Beaconing ---------------------------------------------------------------------

export type Host = {
  id: string;
  name: string;
  /** Seconds into a ten-minute window when it connected out. */
  times: number[];
  dst: string;
};

export const HOSTS: Host[] = [
  {
    id: "pc1",
    name: "10.0.0.5",
    dst: "kun.uz, google.com, …",
    times: [12, 15, 16, 80, 82, 190, 191, 193, 340, 455, 456, 520],
  },
  {
    id: "pc2",
    name: "10.0.0.9",
    dst: "203.0.113.50",
    times: [30, 90, 151, 210, 270, 331, 390, 450, 511, 570],
  },
  {
    id: "pc3",
    name: "10.0.0.12",
    dst: "update.vendor.uz",
    times: [205, 207],
  },
];

/** The gaps between connections, in seconds. */
export function gaps(times: number[]) {
  return times.slice(1).map((t, i) => t - times[i]);
}

/** Spread of the gaps relative to their mean: near 0 means a metronome. */
export function jitter(times: number[]) {
  const g = gaps(times);
  if (g.length < 2) return Infinity;
  const mean = g.reduce((a, b) => a + b, 0) / g.length;
  const sd = Math.sqrt(g.reduce((a, b) => a + (b - mean) ** 2, 0) / g.length);
  return sd / mean;
}

/** Many connections at an almost fixed interval look like a beacon. */
export const isBeacon = (h: Host) =>
  h.times.length >= 5 && jitter(h.times) < 0.1;
