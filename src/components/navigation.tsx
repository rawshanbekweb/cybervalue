"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useSyncExternalStore } from "react";
import { Menu, X, ArrowUpRight, GraduationCap } from "lucide-react";
import { useTranslator } from "./locale-provider";

export function Navigation({
  items,
}: {
  items: { href: string; label: string }[];
}) {
  const path = usePathname();
  const t = useTranslator();
  const [open, setOpen] = useState(false);
  // Prerendered pages are built without knowing the request path, and React does
  // not patch attributes that differ during hydration. Mark the current section
  // only after hydration so server and client markup start identical.
  const hydrated = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  // The most specific entry wins, so /playground/junior highlights "Start here"
  // and not "Playground" as well.
  const matches = (href: string) =>
    href === "/" ? path === "/" : path === href || path.startsWith(`${href}/`);
  const current = (hydrated ? items : [])
    .filter((item) => matches(item.href))
    .sort((a, b) => b.href.length - a.href.length)[0]?.href;
  return (
    <>
      <button
        className="menu-toggle"
        aria-label={t(open ? "Close navigation" : "Open navigation")}
        aria-expanded={open}
        aria-controls="site-navigation"
        onClick={() => setOpen(!open)}
      >
        {open ? <X size={22} /> : <Menu size={22} />}
      </button>
      <nav
        id="site-navigation"
        aria-label={t("Main navigation")}
        className={`navigation ${open ? "is-open" : ""}`}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            setOpen(false);
            (
              document.querySelector(".menu-toggle") as HTMLButtonElement
            )?.focus();
          }
        }}
      >
        {items.map((item) => {
          const active = item.href === current;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              onClick={() => setOpen(false)}
            >
              {t(item.label)}
            </Link>
          );
        })}
        <Link
          className="nav-contact"
          href="/about#connect"
          onClick={() => setOpen(false)}
        >
          {t("Let’s connect")} <ArrowUpRight size={14} />
        </Link>
        {/* Signed-out visitors land on the student sign-in page. */}
        <Link
          className="nav-student"
          href="/student"
          onClick={() => setOpen(false)}
        >
          <GraduationCap size={16} aria-hidden="true" />
          {t("Student portal")}
        </Link>
      </nav>
    </>
  );
}
