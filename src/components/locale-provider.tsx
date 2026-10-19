"use client";

import { createContext, useContext, useMemo } from "react";
import {
  buildDictionaries,
  defaultLocale,
  translatorFor,
  type Locale,
  type Messages,
} from "@/lib/i18n/core";
import common from "@/lib/i18n/messages.json";

// The browser gets the shared dictionary everywhere and each area's own
// dictionaries only inside that area (components/i18n), instead of every
// dictionary on every page.
const LocaleContext = createContext<Locale>(defaultLocale);
const MessagesContext = createContext<readonly Messages[]>([common]);

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

/** Adds dictionaries for everything inside; used by the area providers. */
export function MessagesLayer({
  messages,
  children,
}: {
  messages: readonly Messages[];
  children: React.ReactNode;
}) {
  const parent = useContext(MessagesContext);
  const value = useMemo(() => [...parent, ...messages], [parent, messages]);
  return (
    <MessagesContext.Provider value={value}>
      {children}
    </MessagesContext.Provider>
  );
}

export function useLocale() {
  return useContext(LocaleContext);
}

// With NEXT_PUBLIC_I18N_CHECK=1 a lookup that misses the area's
// dictionaries but exists in the full set is reported, so tests can find
// text that needs another dictionary in its area.
const reported = new Set<string>();
const report =
  process.env.NEXT_PUBLIC_I18N_CHECK === "1"
    ? (source: string) => {
        if (reported.has(source)) return;
        reported.add(source);
        void import("@/lib/i18n").then(({ hasMessage }) => {
          if (hasMessage(source))
            console.error(`[i18n] not in this area's dictionaries: ${source}`);
        });
      }
    : undefined;

const cache = new WeakMap<
  readonly Messages[],
  ReturnType<typeof buildDictionaries>
>();

export function useTranslator() {
  const locale = useLocale();
  const messages = useContext(MessagesContext);
  return useMemo(() => {
    let dictionaries = cache.get(messages);
    if (!dictionaries) {
      dictionaries = buildDictionaries(messages);
      cache.set(messages, dictionaries);
    }
    return translatorFor(dictionaries, locale, report);
  }, [locale, messages]);
}
