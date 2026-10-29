// Academy Intermediate · Logs and SIEM: the same failed login written by
// three different sources, mapped onto one schema, and a search across the
// normalised events that shows a password-spraying attack. Simplified, but
// the log formats and field names (Elastic Common Schema) are the real ones.

// --- Normalisation ---------------------------------------------------------------------

export const FIELDS = ["source.ip", "user.name"] as const;
export type Field = (typeof FIELDS)[number];

export type RawSource = {
  id: "ssh" | "web" | "windows";
  /** Where the line came from. */
  name: string;
  line: string;
  /** The values a student can pick from. */
  tokens: string[];
  answer: Record<Field, string>;
};

export const RAWS: RawSource[] = [
  {
    id: "ssh",
    name: "/var/log/auth.log (sshd)",
    line: "Oct 29 09:14:02 web01 sshd[3102]: Failed password for maria from 203.0.113.45 port 51822 ssh2",
    tokens: ["web01", "3102", "maria", "203.0.113.45", "51822"],
    answer: { "source.ip": "203.0.113.45", "user.name": "maria" },
  },
  {
    id: "web",
    name: "app.json (web application)",
    line: '{"ts":"2026-10-29T09:14:05Z","event":"login_failed","username":"aziz","client":"203.0.113.45","ua":"python-requests/2.31"}',
    tokens: ["login_failed", "aziz", "203.0.113.45", "python-requests/2.31"],
    answer: { "source.ip": "203.0.113.45", "user.name": "aziz" },
  },
  {
    id: "windows",
    name: "Security.evtx (Windows)",
    line: "EventID=4625 Computer=DC01 TargetUserName=dilnoza IpAddress=203.0.113.45 LogonType=3 Status=0xC000006A",
    tokens: ["4625", "DC01", "dilnoza", "203.0.113.45", "0xC000006A"],
    answer: { "source.ip": "203.0.113.45", "user.name": "dilnoza" },
  },
];

export type Mapping = Partial<Record<Field, string>>;

export const mappedRight = (raw: RawSource, m: Mapping) =>
  FIELDS.every((f) => m[f] === raw.answer[f]);

export const allMapped = (maps: Record<string, Mapping>) =>
  RAWS.every((r) => mappedRight(r, maps[r.id] ?? {}));

// --- Search ----------------------------------------------------------------------------

export type Outcome = "failure" | "success";

export type LogEvent = {
  time: string;
  source: RawSource["id"];
  user: string;
  ip: string;
  outcome: Outcome;
};

export const ATTACKER = "203.0.113.45";
export const BREACHED = "dilnoza";

const A = ATTACKER;
const ev = (
  time: string,
  source: LogEvent["source"],
  user: string,
  ip: string,
  outcome: Outcome = "failure",
): LogEvent => ({ time, source, user, ip, outcome });

/**
 * Twenty minutes of logins, already normalised. One address tries a few
 * accounts each on three systems (spraying); one user mistypes a password.
 */
export const EVENTS: LogEvent[] = [
  ev("09:12:40", "ssh", "deploy", "10.0.0.50", "success"),
  ev("09:13:10", "web", "javlon", "10.0.0.12"),
  ev("09:13:22", "web", "javlon", "10.0.0.12"),
  ev("09:13:35", "web", "javlon", "10.0.0.12"),
  ev("09:13:51", "web", "javlon", "10.0.0.12", "success"),
  ev("09:14:02", "ssh", "maria", A),
  ev("09:14:05", "web", "aziz", A),
  ev("09:14:09", "windows", "dilnoza", A),
  ev("09:15:02", "ssh", "root", A),
  ev("09:15:06", "web", "sardor", A),
  ev("09:15:11", "windows", "bekzod", A),
  ev("09:16:30", "ssh", "kamola", "10.0.0.31"),
  ev("09:16:41", "ssh", "kamola", "10.0.0.31", "success"),
  ev("09:17:02", "ssh", "admin", A),
  ev("09:17:05", "web", "maria", A),
  ev("09:17:09", "windows", "admin", A),
  ev("09:21:14", "windows", "dilnoza", A, "success"),
  ev("09:22:00", "web", "sardor", "10.0.0.77", "success"),
];

export const GROUPS = ["user", "ip", "source"] as const;
export type Group = (typeof GROUPS)[number];
export type Filter = "all" | Outcome;

export const FIELD_OF: Record<Group, string> = {
  user: "user.name",
  ip: "source.ip",
  source: "event.dataset",
};

export type Row = { value: string; count: number; sources: number };

/** stats count, dc(event.dataset) by <field>, biggest first. */
export function search(filter: Filter, by: Group): Row[] {
  const rows = new Map<string, { count: number; sources: Set<string> }>();
  for (const e of EVENTS) {
    if (filter !== "all" && e.outcome !== filter) continue;
    const key = e[by];
    const row = rows.get(key) ?? { count: 0, sources: new Set<string>() };
    row.count++;
    row.sources.add(e.source);
    rows.set(key, row);
  }
  return [...rows.entries()]
    .map(([value, r]) => ({ value, count: r.count, sources: r.sources.size }))
    .sort((a, b) => b.count - a.count || a.value.localeCompare(b.value));
}

export const query = (filter: Filter, by: Group) =>
  `${filter === "all" ? "*" : `event.outcome:${filter}`} | stats count, dc(event.dataset) by ${FIELD_OF[by]}`;

export const answersRight = (ip: string, account: string) =>
  ip.trim() === ATTACKER && account.trim().toLowerCase() === BREACHED;
