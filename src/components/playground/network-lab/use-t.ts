"use client";

import { useLocale, useTranslator } from "@/components/locale-provider";
import type { Text } from "@/lib/network/ip";

// The labs' copy: t("English", values) from the shared dictionary, like the
// rest of the site, and text({ uz, en }) for lesson data that carries both
// languages itself.
export function useT() {
  const locale = useLocale() as "uz" | "en";
  const t = useTranslator();
  return {
    locale,
    t,
    text: (value: Text) => value[locale],
  };
}
