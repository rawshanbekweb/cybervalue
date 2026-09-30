"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X, ArrowUpRight } from "lucide-react";
import { useTranslator } from "./locale-provider";

export function Navigation({
  items,
}: {
  items: { href: string; label: string }[];
}) {
  const path = usePathname();
  const t = useTranslator();
  const [open, setOpen] = useState(false);
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
          const active =
            item.href === "/" ? path === "/" : path.startsWith(item.href);
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
      </nav>
    </>
  );
}
