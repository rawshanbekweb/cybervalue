import common from "./messages.json";
import html from "./html.json";
import ctf from "./ctf.json";

const messages = { ...common, ...html, ...ctf };

export const locales = ["uz", "en"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "uz";
export const localeCookie = "cybervalue-locale";

export function isLocale(value: unknown): value is Locale {
  return value === "uz" || value === "en";
}

export function resolveLocale(value: unknown): Locale {
  return isLocale(value) ? value : defaultLocale;
}

export type TranslationValues = Record<string, string | number>;
export type Translator = (source: string, values?: TranslationValues) => string;

const dictionaries = {
  uz: new Map<string, string>(),
  en: new Map<string, string>(),
};
for (const [en, uz] of Object.entries(messages)) {
  dictionaries.en.set(en, en);
  dictionaries.uz.set(en, uz);
}

// Original Uzbek copy can also be looked up without changing content identifiers.
for (const [en, uz] of Object.entries(messages)) {
  if (!dictionaries.en.has(uz)) dictionaries.en.set(uz, en);
  if (!dictionaries.uz.has(uz)) dictionaries.uz.set(uz, uz);
}

export function createTranslator(locale: Locale): Translator {
  return (source, values = {}) => {
    const translated = dictionaries[locale].get(source) ?? source;
    return translated.replace(/\{(\w+)\}/g, (placeholder, key: string) =>
      Object.hasOwn(values, key) ? String(values[key]) : placeholder,
    );
  };
}
