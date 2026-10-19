// The translation machinery without any dictionary: browser components
// import from here, and each area of the site loads only the dictionaries
// it needs (see components/i18n). index.ts adds every dictionary for the
// server.

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
/** English source text mapped to its Uzbek copy. */
export type Messages = Record<string, string>;
export type Dictionaries = Record<Locale, Map<string, string>>;

export function buildDictionaries(sources: readonly Messages[]): Dictionaries {
  // Later dictionaries win on a repeated key, as one object spread would.
  const messages: Messages = Object.assign({}, ...sources);
  const dictionaries = {
    uz: new Map<string, string>(),
    en: new Map<string, string>(),
  };
  for (const [en, uz] of Object.entries(messages)) {
    dictionaries.en.set(en, en);
    dictionaries.uz.set(en, uz);
  }
  // Original Uzbek copy can also be looked up without changing content
  // identifiers.
  for (const [en, uz] of Object.entries(messages)) {
    if (!dictionaries.en.has(uz)) dictionaries.en.set(uz, en);
    if (!dictionaries.uz.has(uz)) dictionaries.uz.set(uz, uz);
  }
  return dictionaries;
}

const fill = (text: string, values: TranslationValues) =>
  text.replace(/\{(\w+)\}/g, (placeholder, key: string) =>
    Object.hasOwn(values, key) ? String(values[key]) : placeholder,
  );

export function translatorFor(
  dictionaries: Dictionaries,
  locale: Locale,
  onMissing?: (source: string) => void,
): Translator {
  return (source, values = {}) => {
    const translated = dictionaries[locale].get(source);
    if (translated === undefined) onMissing?.(source);
    return fill(translated ?? source, values);
  };
}

/** Fills {placeholders} and nothing else: for English source text. */
export const plainTranslator: Translator = (source, values = {}) =>
  fill(source, values);
