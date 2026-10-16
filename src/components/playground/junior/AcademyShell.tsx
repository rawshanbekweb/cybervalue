"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CloudOff, LogOut } from "lucide-react";
import { useT } from "../network-lab/use-t";
import { juniorLogoutAction } from "@/app/[lang]/junior/actions";
import { useJuniorState } from "./state";
import "./junior.css";

const SECTIONS = [
  { href: "/junior", uz: "Missiyalar", en: "Missions" },
  {
    href: "/junior/ciphers",
    uz: "Shifrlar xonasi",
    en: "Cipher Room",
  },
  { href: "/junior/homework", uz: "Uy vazifalari", en: "Homework" },
  {
    href: "/junior/achievements",
    uz: "Yutuqlar",
    en: "Achievements",
  },
  {
    href: "/junior/secret",
    uz: "Maxfiy xabar",
    en: "Secret message",
  },
];

// The academy's frame for a signed-in member: who is in, their rank and XP,
// and the sections, each on its own page.
export function AcademyShell({ children }: { children: React.ReactNode }) {
  const { t, text } = useT();
  const pathname = usePathname();
  const { member, agent, rank, xp, unsaved } = useJuniorState();
  const current = (href: string) =>
    href === "/junior"
      ? /\/junior\/?$/.test(pathname)
      : pathname.endsWith(href);
  return (
    <div className="junior jr-academy container page-content">
      <header className="jr-topbar">
        <Link href="/junior" className="jr-brand">
          <span>Cybervalue Academy</span> Junior
        </Link>
        <div className="jr-who">
          <span className="jr-who-name">{agent.name || member?.name}</span>
          <span className="jr-who-rank">
            {text(rank.title)} · {xp} XP
          </span>
          <form action={juniorLogoutAction}>
            <button
              type="submit"
              className="jr-icon-btn"
              title={t("Chiqish", "Sign out")}
            >
              <LogOut size={16} aria-hidden="true" />
              <span className="visually-hidden">
                {t("Chiqish", "Sign out")}
              </span>
            </button>
          </form>
        </div>
      </header>
      <nav
        className="jr-tabs"
        aria-label={t("Akademiya bo‘limlari", "Academy sections")}
      >
        {SECTIONS.map((section) => (
          <Link
            key={section.href}
            href={section.href}
            aria-current={current(section.href) ? "page" : undefined}
          >
            {t(section.uz, section.en)}
          </Link>
        ))}
      </nav>
      {unsaved && (
        <p className="jr-verdict jr-bad jr-unsaved" role="alert">
          <CloudOff size={16} aria-hidden="true" />
          <span>
            {t(
              "Oxirgi natija saqlanmadi. Internetni tekshiring — keyingi harakatda yana urinamiz.",
              "Your last result was not saved. Check your connection — it will try again on your next step.",
            )}
          </span>
        </p>
      )}
      {children}
    </div>
  );
}
