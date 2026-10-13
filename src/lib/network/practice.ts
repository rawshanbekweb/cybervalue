// Fresh exercises for the lab's "New example" button. A seeded generator makes
// every exercise reproducible in tests; answers come from the same arithmetic
// the lessons teach, so a generated task is always solvable.
import {
  classify,
  formatIp,
  parseIp,
  prefixForHosts,
  sameSubnet,
  subnet,
  type Kind,
} from "./ip";
import type { Widget } from "./curriculum";

export type Random = () => number;

// mulberry32: small, fast and good enough for picking exercises.
export function random(seed: number): Random {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const int = (r: Random, min: number, max: number) =>
  min + Math.floor(r() * (max - min + 1));
const pick = <T>(r: Random, items: readonly T[]) =>
  items[int(r, 0, items.length - 1)];

// Fisher–Yates with the seeded generator.
function shuffle<T>(r: Random, items: T[]) {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = int(r, 0, i);
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

const ip = (a: number, b: number, c: number, d: number) =>
  ((a * 256 + b) * 256 + c) * 256 + d;

// A private address that is not a network or broadcast address of any /24.
function privateHost(r: Random) {
  const kind = int(r, 0, 2);
  const d = int(r, 1, 254);
  if (kind === 0) return ip(10, int(r, 0, 255), int(r, 0, 255), d);
  if (kind === 1) return ip(172, int(r, 16, 31), int(r, 0, 255), d);
  return ip(192, 168, int(r, 0, 255), d);
}

// Lesson 1: an address to build from bits.
export const bitsExercise = (r: Random) => formatIp(privateHost(r));

// Lesson 2: a room of devices that needs the smallest fitting mask.
export function maskExercise(r: Random) {
  const hosts = pick(r, [
    int(r, 3, 6),
    int(r, 7, 14),
    int(r, 15, 30),
    int(r, 31, 62),
    int(r, 63, 126),
    int(r, 127, 254),
    int(r, 255, 1000),
  ]);
  return { ip: formatIp(privateHost(r)), hosts, prefix: prefixForHosts(hosts) };
}

// Lesson 3: an address and prefix whose block the student works out.
export function rangeExercise(r: Random) {
  const prefix = int(r, 20, 30);
  const address = privateHost(r);
  const s = subnet(address, prefix);
  return {
    cidr: `${formatIp(address)}/${prefix}`,
    network: formatIp(s.network),
    broadcast: formatIp(s.broadcast),
    hosts: s.hosts,
  };
}

// Lesson 4: a PC and five devices: one to three neighbours, the rest just
// past either edge of the PC's block, the classic near miss.
export function compareExercise(r: Random) {
  const prefix = int(r, 25, 29);
  const s = subnet(ip(10, 0, int(r, 1, 254), int(r, 0, 255)), prefix);
  const pc = int(r, s.firstHost, s.lastHost);
  const neighbours = shuffle(
    r,
    Array.from(
      { length: s.lastHost - s.firstHost + 1 },
      (_, i) => s.firstHost + i,
    ).filter((host) => host !== pc),
  ).slice(0, int(r, 1, 3));
  const outsiders = new Set<number>();
  while (neighbours.length + outsiders.size < 5)
    outsiders.add(
      r() < 0.5 ? s.network - int(r, 1, 6) : s.broadcast + int(r, 1, 6),
    );
  const list = shuffle(r, [...neighbours, ...outsiders]).map(formatIp);
  return {
    pc: formatIp(pc),
    prefix,
    devices: list,
    same: list.filter((d) => sameSubnet(parseIp(d)!, pc, prefix)),
  };
}

const KIND_SAMPLES: Record<Exclude<Kind, "special">, (r: Random) => number> = {
  private: privateHost,
  public: (r) =>
    pick(r, [
      ip(int(r, 1, 9), int(r, 0, 255), int(r, 0, 255), int(r, 1, 254)),
      ip(int(r, 11, 99), int(r, 0, 255), int(r, 0, 255), int(r, 1, 254)),
      ip(172, int(r, 32, 63), int(r, 0, 255), int(r, 1, 254)),
      ip(172, int(r, 0, 15), int(r, 0, 255), int(r, 1, 254)),
      ip(192, int(r, 169, 200), int(r, 0, 255), int(r, 1, 254)),
    ]),
  loopback: (r) => ip(127, 0, int(r, 0, 1), int(r, 1, 9)),
  "link-local": (r) => ip(169, 254, int(r, 1, 254), int(r, 1, 254)),
};

// Lesson 7: eight addresses covering every kind, near-miss publics included.
export function classifyExercise(r: Random) {
  const kinds: Exclude<Kind, "special">[] = [
    "private",
    "private",
    "private",
    "public",
    "public",
    "public",
    "loopback",
    "link-local",
  ];
  const addresses = new Set<string>();
  for (const kind of kinds) {
    let value = KIND_SAMPLES[kind](r);
    while (addresses.has(formatIp(value)) || classify(value) !== kind)
      value = KIND_SAMPLES[kind](r);
    addresses.add(formatIp(value));
  }
  return shuffle(r, [...addresses]);
}

// Lesson 12: split a /24 into equal subnets for departments. Departments and
// hosts are chosen so exactly one prefix fits both: enough subnets for every
// department and enough addresses in each.
export function subnetExercise(r: Random) {
  const prefix = int(r, 25, 28);
  const departments = int(r, 2 ** (prefix - 25) + 1, 2 ** (prefix - 24));
  const hosts = int(r, 2 ** (32 - prefix - 1) - 1, 2 ** (32 - prefix) - 2);
  const base =
    r() < 0.5
      ? ip(192, 168, int(r, 0, 255), 0)
      : ip(10, int(r, 0, 255), int(r, 0, 255), 0);
  const ask = int(r, 2, departments);
  return {
    base: formatIp(base),
    departments,
    hosts,
    ask,
    prefix,
    answer: formatIp(base + (ask - 1) * 2 ** (32 - prefix)),
  };
}

// Lesson 15: a full IPv6 address with leading zeros and zero runs to shorten.
export function ipv6Exercise(r: Random) {
  const groups = [0x2001, 0x0db8, ...Array.from({ length: 6 }, () => 0)];
  for (let i = 2; i < 8; i++)
    if (r() < 0.5)
      groups[i] = pick(r, [int(r, 1, 0xff), int(r, 0x100, 0xffff)]);
  // Always leave a run of at least two zero groups to compress.
  const start = int(r, 2, 6);
  groups[start] = 0;
  groups[start + 1] = 0;
  return groups.map((g) => g.toString(16).padStart(4, "0")).join(":");
}

// A fresh version of a lesson's exercise, or null for fixed scenarios.
export function nextExercise(widget: Widget, r: Random): Widget | null {
  switch (widget.type) {
    case "bits":
      return { type: "bits", target: bitsExercise(r) };
    case "mask": {
      const { ip, hosts } = maskExercise(r);
      return { type: "mask", ip, hosts };
    }
    case "range": {
      const { cidr, network, broadcast, hosts } = rangeExercise(r);
      return { type: "range", cidr, network, broadcast, hosts };
    }
    case "compare": {
      const { pc, prefix, devices } = compareExercise(r);
      return { type: "compare", pc, prefix, devices };
    }
    case "classify":
      return { type: "classify", addresses: classifyExercise(r) };
    case "subnetting": {
      const { base, departments, hosts, ask } = subnetExercise(r);
      return { type: "subnetting", base, departments, hosts, ask };
    }
    case "ipv6":
      return { type: "ipv6", address: ipv6Exercise(r) };
    default:
      return null;
  }
}
