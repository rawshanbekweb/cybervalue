// The messages CTF Challenges sends, in the player's language. The links are
// absolute (SITE_URL) because they are opened from a mail client.
import type { Locale } from "../i18n/core";
import type { Mail } from "./mail";

type Kind = "verify" | "reset" | "exists";

const COPY: Record<
  Kind,
  Record<Locale, { subject: string; lines: string[]; button: string }>
> = {
  verify: {
    uz: {
      subject: "Cybervalue CTF: emailingizni tasdiqlang",
      lines: [
        "Salom, {name}!",
        "Cybervalue CTF Challenges’da ro‘yxatdan o‘tdingiz. Musobaqalarda qatnashish uchun emailingizni tasdiqlang.",
        "Havola 24 soat ishlaydi. Agar siz ro‘yxatdan o‘tmagan bo‘lsangiz, bu xatni e’tiborsiz qoldiring.",
      ],
      button: "Emailni tasdiqlash",
    },
    en: {
      subject: "Cybervalue CTF: confirm your email",
      lines: [
        "Hi {name}!",
        "You signed up for Cybervalue CTF Challenges. Confirm your email to take part in competitions.",
        "The link works for 24 hours. If you did not sign up, ignore this email.",
      ],
      button: "Confirm email",
    },
  },
  reset: {
    uz: {
      subject: "Cybervalue CTF: parolni tiklash",
      lines: [
        "Salom, {name}!",
        "Parolni tiklash so‘raldi. Yangi parol qo‘yish uchun havolani oching.",
        "Havola 1 soat ishlaydi va bir marta ishlatiladi. Agar siz so‘ramagan bo‘lsangiz, bu xatni e’tiborsiz qoldiring: parolingiz o‘zgarmaydi.",
      ],
      button: "Yangi parol qo‘yish",
    },
    en: {
      subject: "Cybervalue CTF: reset your password",
      lines: [
        "Hi {name}!",
        "A password reset was requested. Open the link to set a new password.",
        "The link works once, for 1 hour. If you did not ask for it, ignore this email: your password stays the same.",
      ],
      button: "Set a new password",
    },
  },
  exists: {
    uz: {
      subject: "Cybervalue CTF: bu email allaqachon ro‘yxatdan o‘tgan",
      lines: [
        "Salom, {name}!",
        "Kimdir shu email bilan yangi akkaunt ochmoqchi bo‘ldi, lekin sizda akkaunt allaqachon bor.",
        "Parolni unutgan bo‘lsangiz, uni tiklang. Agar bu siz bo‘lmasangiz, hech narsa qilish shart emas.",
      ],
      button: "Parolni tiklash",
    },
    en: {
      subject: "Cybervalue CTF: this email already has an account",
      lines: [
        "Hi {name}!",
        "Someone tried to sign up with this email, but you already have an account.",
        "If you forgot your password, reset it. If it was not you, there is nothing to do.",
      ],
      button: "Reset password",
    },
  },
};

const escape = (text: string) =>
  text.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

export function buildMail(
  kind: Kind,
  locale: Locale,
  to: string,
  name: string,
  link: string,
): Mail {
  const copy = COPY[kind][locale];
  const lines = copy.lines.map((line) => line.replace("{name}", name));
  const text = [
    ...lines,
    "",
    `${copy.button}: ${link}`,
    "",
    "— Cybervalue",
  ].join("\n");
  const html = `<!doctype html><html><body style="font-family:Arial,sans-serif;line-height:1.5;color:#111">${lines
    .map((line) => `<p>${escape(line)}</p>`)
    .join(
      "",
    )}<p><a href="${escape(link)}" style="display:inline-block;padding:10px 18px;background:#1d4f91;color:#fff;border-radius:6px;text-decoration:none">${escape(copy.button)}</a></p><p style="font-size:12px;color:#555">${escape(link)}</p><p>— Cybervalue</p></body></html>`;
  return { to, subject: copy.subject, text, html };
}
