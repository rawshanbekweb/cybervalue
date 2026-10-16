"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useActionState, useId } from "react";
import {
  ArrowLeft,
  BookOpenCheck,
  Crosshair,
  KeyRound,
  Trophy,
} from "lucide-react";
import { useT } from "../network-lab/use-t";
import { juniorLoginAction } from "@/app/[lang]/playground/junior/actions";
import "./junior.css";

const FEATURES = [
  {
    icon: Crosshair,
    uz: "6 ta missiya va Kiber-shtab ishi",
    en: "6 missions and the Cyber HQ case",
  },
  {
    icon: KeyRound,
    uz: "Shifrlar xonasi: Sezardan Enigmagacha",
    en: "The Cipher Room: from Caesar to Enigma",
  },
  {
    icon: BookOpenCheck,
    uz: "Uy vazifalari va kunlik topishmoq",
    en: "Homework and a daily puzzle",
  },
  {
    icon: Trophy,
    uz: "Unvonlar, yutuqlar va guruh reytingi",
    en: "Ranks, achievements and a group ranking",
  },
];

// The academy's front door: members enter with the code their teacher gave.
export function JuniorLogin() {
  const { t } = useT();
  const id = useId();
  const pathname = usePathname();
  const [state, action, pending] = useActionState(juniorLoginAction, undefined);
  return (
    <div className="junior container page-content">
      <Link className="jr-back" href="/playground">
        <ArrowLeft size={15} aria-hidden="true" /> Playground
      </Link>
      <div className="jr-login">
        <div>
          <span className="eyebrow">
            <span className="status-dot" /> CYBERVALUE ACADEMY JUNIOR
          </span>
          <h1>
            {t("Akademiyaga", "Welcome to")}
            <br />
            <span>{t("xush kelibsiz.", "the academy.")}</span>
          </h1>
          <p className="jr-login-lead">
            {t(
              "Kiberxavfsizlikning birinchi qadami: missiyalar, shifrlar, uy vazifalari va o‘z unvoningiz. Kirish uchun o‘qituvchingiz bergan kodni kiriting.",
              "Your first step into cybersecurity: missions, ciphers, homework and a rank of your own. Enter the code your teacher gave you.",
            )}
          </p>
          <form action={action} className="jr-login-form">
            <input type="hidden" name="next" value={pathname} />
            <label htmlFor={id}>{t("Kirish kodi", "Access code")}</label>
            <input
              id={id}
              name="code"
              required
              autoComplete="off"
              autoCapitalize="characters"
              spellCheck={false}
              placeholder="XXXX-XXXX"
              maxLength={20}
            />
            {state?.error && (
              <p className="jr-verdict jr-bad" role="alert">
                {t(
                  {
                    "This access code is not valid or no longer active.":
                      "Bu kod noto‘g‘ri yoki endi faol emas.",
                    "Too many attempts. Try again in a few minutes.":
                      "Urinishlar juda ko‘p. Bir necha daqiqadan keyin qayta urining.",
                    "The academy is not available right now.":
                      "Akademiya hozir ishlamayapti.",
                  }[state.error] ?? state.error,
                  state.error,
                )}
              </p>
            )}
            <button
              type="submit"
              className="button button-primary"
              disabled={pending}
            >
              {pending
                ? t("Tekshirilmoqda…", "Checking…")
                : t("Kirish", "Enter")}
            </button>
            <p className="jr-login-note">
              {t(
                "Kodingiz yo‘qmi? O‘qituvchingizdan so‘rang. Kod shaxsiy — uni boshqalarga bermang.",
                "No code? Ask your teacher. Your code is personal — don’t share it.",
              )}
            </p>
          </form>
        </div>
        <ul className="jr-login-features">
          {FEATURES.map(({ icon: Icon, uz, en }) => (
            <li key={en}>
              <span className="jr-ring" aria-hidden="true">
                <Icon size={20} />
              </span>
              {t(uz, en)}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
