// Academy Intermediate · TLS and certificates: how a browser checks a
// certificate (trust, chain, dates, name), a grade for a server's TLS setup
// in the style of SSL Labs, and what HTTPS redirects, HSTS and preloading do
// against SSL stripping on a first and a later visit. Simplified, but the
// rules are the ones browsers and scanners apply.
import type { Text } from "../network/ip";

const t = (uz: string, en: string): Text => ({ uz, en });

// --- Names ----------------------------------------------------------------------

/**
 * Whether a certificate name covers a host. A wildcard stands for exactly
 * one label on the left: *.shop.uz covers pay.shop.uz but neither shop.uz
 * nor a.pay.shop.uz.
 */
export function nameMatches(pattern: string, host: string) {
  const p = pattern.toLowerCase();
  const h = host.toLowerCase();
  if (!p.startsWith("*.")) return p === h;
  const rest = p.slice(1);
  if (!h.endsWith(rest)) return false;
  const label = h.slice(0, h.length - rest.length);
  return label.length > 0 && !label.includes(".");
}

// --- The certificate chain --------------------------------------------------------

export const HOST = "pay.shop.uz";
export const NAMES = [
  "shop.uz",
  "www.shop.uz",
  "*.shop.uz",
  "pay.shop.uz",
] as const;

export type CertSetup = {
  /** The names (SAN) on the server's certificate. */
  names: string[];
  /** Does the server send the intermediate certificate with its own? */
  intermediate: boolean;
  /** Has the certificate expired? */
  expired: boolean;
  /** Who signed it: a public CA, or the server itself. */
  issuer: "ca" | "self";
};

export type Check = {
  id: "trust" | "chain" | "dates" | "name";
  ok: boolean;
  label: Text;
  error: string;
};

/** The browser's checks in order; the first failure is the error it shows. */
export function checkCert(s: CertSetup): Check[] {
  return [
    {
      id: "trust",
      ok: s.issuer === "ca",
      label: t(
        "Ildiz sertifikat brauzer ishonadiganlar ro‘yxatida",
        "The root is on the browser’s trusted list",
      ),
      error: "NET::ERR_CERT_AUTHORITY_INVALID",
    },
    {
      id: "chain",
      ok: s.issuer === "self" || s.intermediate,
      label: t(
        "Server oraliq sertifikatni ham yuboradi",
        "The server sends the intermediate certificate too",
      ),
      error: "NET::ERR_CERT_AUTHORITY_INVALID",
    },
    {
      id: "dates",
      ok: !s.expired,
      label: t("Muddati o‘tmagan", "It has not expired"),
      error: "NET::ERR_CERT_DATE_INVALID",
    },
    {
      id: "name",
      ok: s.names.some((n) => nameMatches(n, HOST)),
      label: t(
        `Nomlardan biri ${HOST} ga mos`,
        `One of its names covers ${HOST}`,
      ),
      error: "NET::ERR_CERT_COMMON_NAME_INVALID",
    },
  ];
}

export const certValid = (s: CertSetup) => checkCert(s).every((c) => c.ok);

// --- The TLS setup grade ------------------------------------------------------------

export type TlsSetup = {
  tls10: boolean;
  tls11: boolean;
  tls12: boolean;
  tls13: boolean;
  /** RC4 or 3DES among the cipher suites. */
  weakCiphers: boolean;
  /** Key exchange by RSA, with no forward secrecy. */
  rsaKex: boolean;
  /** A 1024-bit RSA key in the certificate. */
  key1024: boolean;
  /** Strict-Transport-Security sent with a long max-age. */
  hsts: boolean;
};

export const SETTINGS = [
  "tls10",
  "tls11",
  "tls12",
  "tls13",
  "weakCiphers",
  "rsaKex",
  "key1024",
  "hsts",
] as const;

export const GRADES = ["F", "C", "B", "A", "A+"] as const;
export type Grade = (typeof GRADES)[number];

export type Finding = { cap: Grade; why: Text };

/** Each problem caps the grade; the lowest cap wins. */
export function findings(s: TlsSetup): Finding[] {
  const out: Finding[] = [];
  if (!s.tls12 && !s.tls13)
    out.push({
      cap: "F",
      why: t(
        "Zamonaviy protokol yo‘q (TLS 1.2 yoki 1.3).",
        "No modern protocol (TLS 1.2 or 1.3).",
      ),
    });
  if (s.key1024)
    out.push({
      cap: "F",
      why: t(
        "1024 bitli RSA kaliti — juda qisqa.",
        "A 1024-bit RSA key is far too short.",
      ),
    });
  if (s.weakCiphers)
    out.push({
      cap: "C",
      why: t(
        "RC4/3DES shifrlari buzilgan yoki zaif.",
        "RC4 and 3DES are broken or weak.",
      ),
    });
  if (s.tls10 || s.tls11)
    out.push({
      cap: "B",
      why: t(
        "TLS 1.0/1.1 eskirgan va o‘chirilishi kerak.",
        "TLS 1.0/1.1 are obsolete and must be off.",
      ),
    });
  if (s.rsaKex)
    out.push({
      cap: "B",
      why: t(
        "RSA kalit almashinuvi forward secrecy bermaydi.",
        "RSA key exchange gives no forward secrecy.",
      ),
    });
  if (!s.tls13)
    out.push({
      cap: "A",
      why: t("TLS 1.3 yoqilmagan.", "TLS 1.3 is not on."),
    });
  if (!s.hsts)
    out.push({
      cap: "A",
      why: t("HSTS sarlavhasi yuborilmaydi.", "No HSTS header is sent."),
    });
  return out;
}

export function grade(s: TlsSetup): Grade {
  let best = GRADES.length - 1;
  for (const f of findings(s)) best = Math.min(best, GRADES.indexOf(f.cap));
  return GRADES[best];
}

// --- SSL stripping and HSTS -----------------------------------------------------------

export type StripSetup = { redirect: boolean; hsts: boolean; preload: boolean };

/**
 * The user types shop.uz in a café, where an attacker controls the Wi-Fi.
 * A redirect alone does not help: the first plain-HTTP request is the one
 * the attacker answers. HSTS makes the browser go straight to HTTPS, but
 * only after it has seen the header once; the preload list covers the very
 * first visit too.
 */
export function stripping(s: StripSetup) {
  const hsts = s.hsts;
  const preload = s.preload && hsts;
  return {
    first: preload,
    later: hsts && (s.redirect || preload),
  };
}

export const strippingSafe = (s: StripSetup) => {
  const r = stripping(s);
  return r.first && r.later;
};
