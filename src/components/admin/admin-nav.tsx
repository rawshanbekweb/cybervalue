"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useTranslator } from "@/components/locale-provider";

export type AdminNavItem = { href: string; label: string; badge?: number };
export type AdminNavGroup = { title?: string; items: AdminNavItem[] };

// The admin sidebar menu: marks the current section and, on phones, folds
// into a button so the page content comes first.
export function AdminNav({ groups }: { groups: AdminNavGroup[] }) {
  const t = useTranslator();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [shownFor, setShownFor] = useState(pathname);
  // Close the phone menu after navigating.
  if (shownFor !== pathname) {
    setShownFor(pathname);
    setOpen(false);
  }
  const all = groups.flatMap((g) => g.items);
  const current = all
    .filter(
      (item) =>
        pathname === item.href ||
        (item.href !== "/admin" && pathname.startsWith(`${item.href}/`)),
    )
    .sort((a, b) => b.href.length - a.href.length)[0];
  const active = useRef<HTMLAnchorElement>(null);
  // Keep the current section visible in a sidebar that scrolls.
  useEffect(() => {
    active.current?.scrollIntoView({ block: "nearest" });
  }, [pathname]);
  const attention = all.reduce((sum, item) => sum + (item.badge ?? 0), 0);
  return (
    <>
      <button
        type="button"
        className="admin-menu-toggle"
        aria-expanded={open}
        aria-controls="admin-nav"
        onClick={() => setOpen((value) => !value)}
      >
        <span>{current?.label ?? t("Menu")}</span>
        {attention > 0 && <span className="admin-badge">{attention}</span>}
        <span aria-hidden="true">{open ? "×" : "☰"}</span>
      </button>
      <nav
        id="admin-nav"
        className={`admin-nav${open ? " is-open" : ""}`}
        aria-label={t("Admin sections")}
      >
        {groups.map((group, index) => (
          <div key={group.title ?? index} className="admin-nav-section">
            {group.title && <p className="admin-nav-group">{group.title}</p>}
            {group.items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                aria-current={item === current ? "page" : undefined}
                ref={item === current ? active : undefined}
              >
                <span>{item.label}</span>
                {!!item.badge && (
                  <span
                    className="admin-badge"
                    aria-label={t("{count} need attention", {
                      count: item.badge,
                    })}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            ))}
          </div>
        ))}
      </nav>
    </>
  );
}
