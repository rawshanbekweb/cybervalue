// IPv4 arithmetic for the network lab. Addresses are unsigned 32-bit numbers;
// every function is pure so lessons, the calculator and tests share it.

export type Text = { uz: string; en: string };

export function parseIp(value: string): number | null {
  const parts = value.trim().split(".");
  if (parts.length !== 4) return null;
  let ip = 0;
  for (const part of parts) {
    // Decimal only: no signs, no leading zeros (010 is octal in some tools).
    if (!/^(0|[1-9]\d{0,2})$/.test(part)) return null;
    const octet = Number(part);
    if (octet > 255) return null;
    ip = ip * 256 + octet;
  }
  return ip;
}

export const formatIp = (ip: number) =>
  [24, 16, 8, 0].map((shift) => Math.floor(ip / 2 ** shift) % 256).join(".");

export const octets = (ip: number) =>
  [24, 16, 8, 0].map((shift) => Math.floor(ip / 2 ** shift) % 256);

export const toBinary = (ip: number) =>
  octets(ip)
    .map((o) => o.toString(2).padStart(8, "0"))
    .join(".");

// /24 → 255.255.255.0
export function prefixToMask(prefix: number): number {
  if (!Number.isInteger(prefix) || prefix < 0 || prefix > 32)
    throw new RangeError("prefix must be 0–32");
  return prefix === 0 ? 0 : (2 ** 32 - 2 ** (32 - prefix)) >>> 0;
}

// A mask is valid only when its ones are contiguous from the left.
export function maskToPrefix(mask: number): number | null {
  for (let prefix = 0; prefix <= 32; prefix++)
    if (prefixToMask(prefix) === mask) return prefix;
  return null;
}

// Accepts "255.255.255.0", "/24" or "24".
export function parseMask(value: string): number | null {
  const text = value.trim();
  const short = /^\/?(\d{1,2})$/.exec(text);
  if (short) {
    const prefix = Number(short[1]);
    return prefix <= 32 ? prefix : null;
  }
  const mask = parseIp(text);
  return mask === null ? null : maskToPrefix(mask);
}

// Bitwise AND on unsigned numbers (JS bit operators are signed 32-bit).
export const and = (a: number, b: number) => (a & b) >>> 0;

export type Subnet = {
  ip: number;
  prefix: number;
  mask: number;
  wildcard: number;
  network: number;
  broadcast: number;
  firstHost: number;
  lastHost: number;
  // Usable host addresses; /31 and /32 are point-to-point and single-host.
  hosts: number;
  size: number;
};

export function subnet(ip: number, prefix: number): Subnet {
  const mask = prefixToMask(prefix);
  const size = 2 ** (32 - prefix);
  const network = and(ip, mask);
  const broadcast = network + size - 1;
  const small = prefix >= 31;
  return {
    ip,
    prefix,
    mask,
    wildcard: ~mask >>> 0,
    network,
    broadcast,
    firstHost: small ? network : network + 1,
    lastHost: small ? broadcast : broadcast - 1,
    hosts: prefix === 32 ? 1 : prefix === 31 ? 2 : size - 2,
    size,
  };
}

export const sameSubnet = (a: number, b: number, prefix: number) =>
  and(a, prefixToMask(prefix)) === and(b, prefixToMask(prefix));

// "192.168.1.10/24" → { ip, prefix }
export function parseCidr(
  value: string,
): { ip: number; prefix: number } | null {
  const [address, prefix, ...rest] = value.trim().split("/");
  if (rest.length || prefix === undefined) return null;
  const ip = parseIp(address);
  const length = /^\d{1,2}$/.test(prefix) ? Number(prefix) : NaN;
  return ip === null || !(length >= 0 && length <= 32)
    ? null
    : { ip, prefix: length };
}

// The smallest block that fits `hosts` usable addresses (at most /30).
export function prefixForHosts(hosts: number): number {
  for (let prefix = 30; prefix >= 1; prefix--)
    if (2 ** (32 - prefix) - 2 >= hosts) return prefix;
  return 0;
}

export type Kind = "private" | "public" | "loopback" | "link-local" | "special";

const inBlock = (ip: number, cidr: string) => {
  const block = parseCidr(cidr)!;
  return sameSubnet(ip, block.ip, block.prefix);
};

export function classify(ip: number): Kind {
  if (inBlock(ip, "127.0.0.0/8")) return "loopback";
  if (inBlock(ip, "169.254.0.0/16")) return "link-local";
  if (
    inBlock(ip, "10.0.0.0/8") ||
    inBlock(ip, "172.16.0.0/12") ||
    inBlock(ip, "192.168.0.0/16")
  )
    return "private";
  if (
    inBlock(ip, "0.0.0.0/8") ||
    inBlock(ip, "100.64.0.0/10") ||
    inBlock(ip, "224.0.0.0/3")
  )
    return "special";
  return "public";
}

export const KIND_LABEL: Record<Kind, Text> = {
  private: { uz: "Private (ichki)", en: "Private" },
  public: { uz: "Public (internet)", en: "Public" },
  loopback: { uz: "Loopback (o‘zi)", en: "Loopback" },
  "link-local": { uz: "APIPA / link-local", en: "APIPA / link-local" },
  special: { uz: "Maxsus", en: "Special" },
};
