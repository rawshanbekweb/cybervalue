"use client";

import Link from "next/link";
import { Fingerprint } from "lucide-react";
import { Navigation } from "@/components/navigation";
import { LanguageSwitcher } from "./language-switcher";
import { useTranslator } from "./locale-provider";

export function SiteHeader({
  items,
  studentArea = true,
}: {
  items: { href: string; label: string }[];
  studentArea?: boolean;
}) {
  const t = useTranslator();

  return (
    <header className="site-header">
      <div className="header-inner">
        <Link className="wordmark" href="/" aria-label={t("Cybervalue home")}>
          <span className="brand-mark">
            <Fingerprint size={23} />
          </span>
          cyber<span>value</span>
          <span className="brand-period">.</span>
        </Link>
        <Navigation items={items} studentArea={studentArea} />
        <LanguageSwitcher />
      </div>
    </header>
  );
}
