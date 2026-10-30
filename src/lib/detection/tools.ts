// Academy Intermediate · Detection rules: build a Sigma-style rule for
// encoded PowerShell out of selection items and a filter, and run it over
// eight process-creation events, some malicious and some normal IT work.
// Simplified, but the fields (Image, ParentImage, CommandLine, User) and the
// condition syntax are Sigma's.

export type Proc = {
  /** Shown time, UTC. */
  time: string;
  parent: string;
  image: string;
  commandLine: string;
  user: string;
  bad: boolean;
};

export const EVENTS: Proc[] = [
  {
    time: "08:41:07",
    parent: "C:\\Program Files\\Microsoft Office\\WINWORD.EXE",
    image: "C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\powershell.exe",
    commandLine: "powershell.exe -nop -w hidden -enc SQBFAFgAIAAoAE4AZQB3AC0A",
    user: "dilnoza",
    bad: true,
  },
  {
    time: "08:43:52",
    parent: "C:\\Windows\\System32\\cmd.exe",
    image: "C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\powershell.exe",
    commandLine: "powershell -enc JABjAD0ATgBlAHcALQBPAGIA",
    user: "dilnoza",
    bad: true,
  },
  {
    time: "09:00:00",
    parent: "C:\\Windows\\CCM\\CcmExec.exe",
    image: "C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\powershell.exe",
    commandLine: "powershell.exe -NoProfile -enc RwBlAHQALQBIAG8AdABGAGkA",
    user: "svc_sccm",
    bad: false,
  },
  {
    time: "09:12:30",
    parent: "C:\\Windows\\explorer.exe",
    image: "C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\powershell.exe",
    commandLine: "powershell.exe",
    user: "maria",
    bad: false,
  },
  {
    time: "09:20:14",
    parent: "C:\\Windows\\explorer.exe",
    image: "C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\powershell.exe",
    commandLine: "powershell -ep bypass -enc aQBlAHgAIAAoAGkAdwByACAA",
    user: "kamola",
    bad: true,
  },
  {
    time: "10:00:00",
    parent: "C:\\Windows\\System32\\services.exe",
    image: "C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\powershell.exe",
    commandLine: "powershell.exe -enc UwB0AGEAcgB0AC0AUwBlAHIA",
    user: "svc_sccm",
    bad: false,
  },
  {
    time: "10:05:41",
    parent: "C:\\Program Files\\Microsoft Office\\WINWORD.EXE",
    image: "C:\\Windows\\splwow64.exe",
    commandLine: "splwow64.exe 8192",
    user: "dilnoza",
    bad: false,
  },
  {
    time: "10:31:09",
    parent: "C:\\Windows\\explorer.exe",
    image: "C:\\Python312\\python.exe",
    commandLine: "python.exe report.py --encoding utf-8",
    user: "aziz",
    bad: false,
  },
];

export const ITEMS = ["image", "enc", "office"] as const;
export type Item = (typeof ITEMS)[number];

export type Rule = Record<Item, boolean> & { filter: boolean };

export const EMPTY: Rule = {
  image: false,
  enc: false,
  office: false,
  filter: false,
};

const lower = (s: string) => s.toLowerCase();

/** Does one selection item hold for this event? */
export function holds(item: Item, e: Proc) {
  switch (item) {
    case "image":
      return lower(e.image).endsWith("\\powershell.exe");
    case "enc":
      return lower(e.commandLine).includes("-enc");
    case "office":
      return ["\\winword.exe", "\\excel.exe"].some((s) =>
        lower(e.parent).endsWith(s),
      );
  }
}

/** The known automation account that legitimately runs encoded scripts. */
export const filtered = (e: Proc) => e.user === "svc_sccm";

/** selection (every chosen item) and not filter. No items: matches nothing. */
export function matches(rule: Rule, e: Proc) {
  const chosen = ITEMS.filter((i) => rule[i]);
  if (!chosen.length) return false;
  if (!chosen.every((i) => holds(i, e))) return false;
  return !(rule.filter && filtered(e));
}

export function score(rule: Rule) {
  let tp = 0;
  let fp = 0;
  let fn = 0;
  for (const e of EVENTS) {
    const hit = matches(rule, e);
    if (hit && e.bad) tp++;
    else if (hit) fp++;
    else if (e.bad) fn++;
  }
  return { tp, fp, fn };
}

export const perfect = (rule: Rule) => {
  const s = score(rule);
  return s.fp === 0 && s.fn === 0;
};

const LINES: Record<Item, string> = {
  image: "    Image|endswith: '\\powershell.exe'",
  enc: "    CommandLine|contains: '-enc'",
  office:
    "    ParentImage|endswith:\n      - '\\winword.exe'\n      - '\\excel.exe'",
};

/** The rule as Sigma YAML. */
export function sigma(rule: Rule) {
  const chosen = ITEMS.filter((i) => rule[i]);
  const out = [
    "title: Encoded PowerShell",
    "logsource:",
    "  category: process_creation",
    "  product: windows",
    "detection:",
    "  selection:",
    ...(chosen.length ? chosen.map((i) => LINES[i]) : ["    # (empty)"]),
  ];
  if (rule.filter) out.push("  filter:", "    User: 'svc_sccm'");
  out.push(
    `  condition: ${rule.filter ? "selection and not filter" : "selection"}`,
    "level: high",
  );
  return out.join("\n");
}

/** Just the program name, for the table. */
export const exe = (path: string) => path.split("\\").pop() ?? path;
