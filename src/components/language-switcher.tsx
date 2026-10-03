"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { setLocale } from "@/app/locale-actions";
import { useLocale, useTranslator } from "./locale-provider";
import { locales } from "@/lib/i18n";

export function LanguageSwitcher() {
  const locale = useLocale();
  const t = useTranslator();
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [failed, setFailed] = useState(false);
  return (
    <div className="language-control">
      <div
        className="language-switcher"
        role="group"
        aria-label={t("Language")}
        aria-busy={pending}
      >
        {locales.map((value) => (
          <button
            key={value}
            type="button"
            lang={value}
            aria-label={value === "uz" ? "O‘zbekcha" : "English"}
            aria-pressed={locale === value}
            disabled={pending}
            onClick={() => {
              if (locale === value) return;
              setFailed(false);
              startTransition(async () => {
                try {
                  await setLocale(value);
                  // The action re-rendered with the old cookie; proxy.ts picks the
                  // prerendered language copy, so fetch the page again.
                  router.refresh();
                } catch {
                  setFailed(true);
                }
              });
            }}
          >
            {value.toUpperCase()}
          </button>
        ))}
      </div>
      {failed && (
        <span role="alert">{t("Could not change language. Try again.")}</span>
      )}
    </div>
  );
}
