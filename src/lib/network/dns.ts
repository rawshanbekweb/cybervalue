// DNS for the lab: a name typed in the browser is resolved through the
// computer's cache, a resolver, the root, the TLD and the domain's own
// (authoritative) server. Names live under .example and addresses in the
// documentation ranges, so no real site is imitated.
import type { Text } from "./ip";
import type { Step } from "./sim";

export type DnsNode =
  "browser" | "resolver" | "root" | "tld" | "authoritative" | "site";
export type DnsStep = Step & { node: DnsNode };
export type CacheEntry = { name: string; ip: string; ttl: number };
export type Resolution = {
  name: string;
  ip: string | null;
  fromCache: boolean;
  steps: DnsStep[];
  // Who really owns the name: the registered domain right before ".example".
  owner: string | null;
};

export const RESOLVER_IP = "8.8.8.8";
export const TTL = 300;

// Registered domains and the A records their authoritative servers hold.
export const ZONES: Record<string, Record<string, string>> = {
  "kutubxona.example": {
    "kutubxona.example": "203.0.113.10",
    "www.kutubxona.example": "203.0.113.10",
  },
  "bank.example": {
    "bank.example": "198.51.100.20",
    "www.bank.example": "198.51.100.20",
  },
  "video.example": { "video.example": "203.0.113.45" },
  // An attacker's domain with a misleading subdomain.
  "hisob-tekshiruv.example": {
    "bank.example.hisob-tekshiruv.example": "192.0.2.66",
  },
};

export const SUGGESTED = [
  "kutubxona.example",
  "bank.example",
  "video.example",
  "bank.example.hisob-tekshiruv.example",
  "yoq.example",
];

// "https://Bank.Example/kirish" → "bank.example"
export function normalizeName(input: string): string | null {
  const name = input
    .trim()
    .toLowerCase()
    .replace(/^[a-z]+:\/\//, "")
    .replace(/[/?#].*$/, "")
    .replace(/:\d+$/, "")
    .replace(/\.$/, "");
  return /^(?=.{1,253}$)([a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?\.)*[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?$/.test(
    name,
  )
    ? name
    : null;
}

const step = (node: DnsNode, text: Text, values?: Record<string, string>) => ({
  node,
  text,
  values,
});

export function resolve(input: string, cache: CacheEntry[]): Resolution {
  const name = normalizeName(input);
  if (!name)
    return {
      name: input,
      ip: null,
      fromCache: false,
      owner: null,
      steps: [
        step("browser", {
          uz: "Bu domen nomi emas: faqat harflar, raqamlar, “-” va nuqtalar bo‘ladi.",
          en: "That is not a domain name: only letters, digits, “-” and dots are allowed.",
        }),
      ],
    };
  if (name === "localhost")
    return {
      name,
      ip: "127.0.0.1",
      fromCache: false,
      owner: null,
      steps: [
        step("browser", {
          uz: "localhost hech qayerga so‘ralmaydi: u doim 127.0.0.1 — kompyuterning o‘zi (hosts fayli).",
          en: "localhost is never looked up: it is always 127.0.0.1, the computer itself (hosts file).",
        }),
      ],
    };
  const values = { name };
  const cached = cache.find((entry) => entry.name === name);
  if (cached)
    return {
      name,
      ip: cached.ip,
      fromCache: true,
      owner: ownerOf(name),
      steps: [
        step(
          "browser",
          {
            uz: "Kompyuter keshida {name} → {ip} bor. Hech qayerga so‘rov ketmadi — javob bir zumda.",
            en: "The computer’s cache already has {name} → {ip}. No query left the computer; the answer is instant.",
          },
          { ...values, ip: cached.ip },
        ),
        step(
          "site",
          {
            uz: "Brauzer {ip}:443 ga HTTPS orqali ulanadi.",
            en: "The browser connects to {ip}:443 over HTTPS.",
          },
          { ip: cached.ip },
        ),
      ],
    };
  const steps: DnsStep[] = [
    step(
      "browser",
      {
        uz: "Keshda {name} yo‘q. Kompyuter DHCP’dan olgan DNS serveriga (resolver {resolver}) so‘raydi.",
        en: "{name} is not cached. The computer asks the DNS server it got from DHCP (resolver {resolver}).",
      },
      { ...values, resolver: RESOLVER_IP },
    ),
  ];
  const labels = name.split(".");
  if (labels.at(-1) !== "example")
    return {
      name,
      ip: null,
      fromCache: false,
      owner: null,
      steps: [
        ...steps,
        step("resolver", {
          uz: "Bu o‘quv laboratoriyasida faqat .example domenlari bor — bu zona o‘qitish uchun ajratilgan. Ro‘yxatdagi nomlardan birini sinab ko‘ring.",
          en: "This teaching lab only has .example names, a zone reserved for teaching. Try one of the suggested names.",
        }),
      ],
    };
  steps.push(
    step(
      "root",
      {
        uz: "Resolver root serverdan so‘raydi. Root: “.example zonasini bilmayman, lekin uning serverlari manzili mana.”",
        en: "The resolver asks a root server. Root: “I don’t know the name, but here are the servers for .example.”",
      },
      values,
    ),
  );
  const owner = ownerOf(name);
  const zone = owner ? ZONES[owner] : undefined;
  if (!owner || !zone)
    return {
      name,
      ip: null,
      fromCache: false,
      owner: null,
      steps: [
        ...steps,
        step(
          "tld",
          {
            uz: ".example serveri: “{name} degan domen ro‘yxatdan o‘tmagan” (NXDOMAIN). Brauzer “sayt topilmadi” deydi.",
            en: ".example server: “No domain {name} is registered” (NXDOMAIN). The browser says the site cannot be found.",
          },
          values,
        ),
      ],
    };
  steps.push(
    step(
      "tld",
      {
        uz: ".example serveri: “{owner} domeni egasining serveri — ns1.{owner}. Undan so‘rang.”",
        en: ".example server: “{owner} is served by ns1.{owner}. Ask it.”",
      },
      { ...values, owner },
    ),
  );
  const ip = zone[name];
  if (!ip)
    return {
      name,
      ip: null,
      fromCache: false,
      owner,
      steps: [
        ...steps,
        step(
          "authoritative",
          {
            uz: "ns1.{owner}: “{name} degan yozuv menda yo‘q” (NXDOMAIN).",
            en: "ns1.{owner}: “I have no record for {name}” (NXDOMAIN).",
          },
          { ...values, owner },
        ),
      ],
    };
  return {
    name,
    ip,
    fromCache: false,
    owner,
    steps: [
      ...steps,
      step(
        "authoritative",
        {
          uz: "ns1.{owner} (avtoritativ server): “{name} → {ip}, {ttl} soniya eslab qolinglar.”",
          en: "ns1.{owner} (authoritative): “{name} → {ip}, remember it for {ttl} seconds.”",
        },
        { ...values, owner, ip, ttl: String(TTL) },
      ),
      step(
        "resolver",
        {
          uz: "Resolver javobni kompyuterga qaytaradi, kompyuter uni keshga yozadi.",
          en: "The resolver returns the answer; the computer stores it in its cache.",
        },
        values,
      ),
      step(
        "site",
        {
          uz: "Brauzer {ip}:443 ga HTTPS orqali ulanadi va sahifani oladi.",
          en: "The browser connects to {ip}:443 over HTTPS and loads the page.",
        },
        { ip },
      ),
    ],
  };
}

// "a.b.bank.example" → "bank.example"; the label before the TLD is the owner.
export function ownerOf(name: string): string | null {
  const labels = name.split(".");
  return labels.length >= 2 ? labels.slice(-2).join(".") : null;
}

// A name that starts with someone else's domain, like
// bank.example.hisob-tekshiruv.example, imitates that domain.
export function imitates(name: string): string | null {
  const owner = ownerOf(name);
  return (
    Object.keys(ZONES).find(
      (domain) => domain !== owner && name.startsWith(`${domain}.`),
    ) ?? null
  );
}

export const remember = (cache: CacheEntry[], result: Resolution) =>
  result.ip && !result.fromCache && result.owner
    ? [...cache, { name: result.name, ip: result.ip, ttl: TTL }]
    : cache;
