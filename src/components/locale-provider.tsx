"use client";

import { createContext, useContext, useMemo } from "react";
import { createTranslator, defaultLocale, type Locale } from "@/lib/i18n";

const LocaleContext = createContext<Locale>(defaultLocale);

export function LocaleProvider({
  locale,
  children,
}: {
  locale: Locale;
  children: React.ReactNode;
}) {
  return (
    <LocaleContext.Provider value={locale}>{children}</LocaleContext.Provider>
  );
}

export function useLocale() {
  return useContext(LocaleContext);
}

export function useTranslator() {
  const locale = useLocale();
  return useMemo(() => createTranslator(locale), [locale]);
}
