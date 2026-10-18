"use client";

import { useEffect, useRef } from "react";
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
  const tabs = useRef<HTMLElement>(null);
  // On a phone the tabs scroll sideways: bring the open section into view
  // and fade the edges that have more tabs behind them.
  useEffect(() => {
    const nav = tabs.current;
    if (!nav) return;
    const active = nav.querySelector<HTMLElement>('[aria-current="page"]');
    if (active)
      nav.scrollLeft =
        active.offsetLeft - (nav.clientWidth - active.offsetWidth) / 2;
    const update = () => {
      const max = nav.scrollWidth - nav.clientWidth;
      const fade = [
        nav.scrollLeft > 4 ? "start" : "",
        nav.scrollLeft < max - 4 ? "end" : "",
      ]
        .filter(Boolean)
        .join(" ");
      if (fade) nav.dataset.fade = fade;
      else delete nav.dataset.fade;
    };
    update();
    nav.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      nav.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [pathname]);
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
            <button type="submit" className="jr-icon-btn" title={t("Sign out")}>
              <LogOut size={16} aria-hidden="true" />
              <span className="visually-hidden">{t("Sign out")}</span>
            </button>
          </form>
        </div>
      </header>
      <nav ref={tabs} className="jr-tabs" aria-label={t("Academy sections")}>
        {SECTIONS.map((section) => (
          <Link
            key={section.href}
            href={section.href}
            aria-current={current(section.href) ? "page" : undefined}
          >
            {text({ uz: section.uz, en: section.en })}
          </Link>
        ))}
      </nav>
      {unsaved && (
        <p className="jr-verdict jr-bad jr-unsaved" role="alert">
          <CloudOff size={16} aria-hidden="true" />
          <span>
            {t(
              "Your last result was not saved. Check your connection — it will try again on your next step.",
            )}
          </span>
        </p>
      )}
      {children}
    </div>
  );
}
