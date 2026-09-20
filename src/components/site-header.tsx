"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Fingerprint } from "lucide-react";
import { Navigation } from "@/components/navigation";

export function SiteHeader({
  items,
}: {
  items: { href: string; label: string }[];
}) {
  const pathname = usePathname();
  if (pathname?.startsWith("/concept")) return null;
  const isHome = pathname === "/";

  return (
    <header className={`site-header ${isHome ? "site-header-overlay" : ""}`}>
      <div className="header-inner">
        <Link className="wordmark" href="/" aria-label="CyberValue home">
          <span className="brand-mark">
            <Fingerprint size={23} />
          </span>
          cyber<span>value</span>
          <span className="brand-period">.</span>
        </Link>
        <Navigation items={items} />
      </div>
    </header>
  );
}
