// Academy Intermediate · Phishing analysis: the headers of a fake "bank"
// email, read from the Received chain and the authentication results, and
// six links whose shown text and real address may not agree. Simplified, but
// the header fields, results and tricks are the real ones. All addresses
// are from documentation ranges or invented domains.

// --- Headers ---------------------------------------------------------------------------

export const HEADERS = [
  "Received: from mx.navrozbank-mail.example (mx.navrozbank-mail.example [198.51.100.20])",
  "        by mx.cybervalue.uz with ESMTPS; Thu, 29 Oct 2026 07:58:12 +0000",
  "Received: from sender.mailer-host.example (unknown [203.0.113.99])",
  "        by mx.navrozbank-mail.example with SMTP; Thu, 29 Oct 2026 07:58:10 +0000",
  "Authentication-Results: mx.cybervalue.uz;",
  "        spf=fail (sender IP is 198.51.100.20) smtp.mailfrom=navrozbank-mail.example;",
  "        dkim=none;",
  "        dmarc=fail (p=reject) header.from=navrozbank.example",
  "Return-Path: <bounce@navrozbank-mail.example>",
  'From: "Navroz Bank Security" <security@navrozbank.example>',
  "Reply-To: <navroz-support@mailbox.example>",
  "Subject: URGENT: your card will be blocked in 24 hours",
] as const;

/** The first hop: the bottom-most Received header, written by the first server. */
export const ORIGIN_IP = "203.0.113.99";

/** Where replies really go. */
export const REPLY_TO = "navroz-support@mailbox.example";

export const DOMAINS = [
  "navrozbank.example",
  "navrozbank-mail.example",
  "mailbox.example",
  "cybervalue.uz",
] as const;

export const headersRight = (ip: string, reply: string | null) =>
  ip.trim() === ORIGIN_IP && reply === "mailbox.example";

// --- Links -----------------------------------------------------------------------------

export type Link = { shown: string; href: string; bad: boolean };

export const LINKS: Link[] = [
  {
    shown: "https://my.navrozbank.example/login",
    href: "https://my.navrozbank.example.secure-login.example/login",
    bad: true,
  },
  {
    shown: "Track your parcel",
    href: "https://www.pochta.uz/track?id=884120",
    bad: false,
  },
  {
    shown: "https://paypal.com",
    href: "https://paypa1.com/verify",
    bad: true,
  },
  {
    shown: "Invoice.pdf",
    href: "https://drive-docs-share.example/invoice.pdf.exe",
    bad: true,
  },
  {
    shown: "https://apple.com",
    href: "https://xn--pple-43d.com/",
    bad: true,
  },
  {
    shown: "Unsubscribe",
    href: "https://news.cybervalue.uz/unsubscribe?u=118",
    bad: false,
  },
];

export type Calls = Partial<Record<number, boolean>>;

/** true = marked suspicious. */
export const linksRight = (calls: Calls) =>
  LINKS.every((l, i) => calls[i] === l.bad);

/** The registered domain: the last two labels of the host. */
export function registered(href: string) {
  const host = new URL(href).hostname;
  return host.split(".").slice(-2).join(".");
}
