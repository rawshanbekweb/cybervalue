"use client";

import { useLocale } from "@/components/locale-provider";
import type { Text } from "@/lib/network/ip";

// Inline bilingual copy, as in the Linux lab: t("uz", "en") or text({ uz, en }).
export function useT() {
  const locale = useLocale() as "uz" | "en";
  return {
    locale,
    t: (uz: string, en: string) => (locale === "uz" ? uz : en),
    text: (value: Text) => value[locale],
  };
}
