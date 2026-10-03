import { cache } from "react";
import { lang } from "next/root-params";
import { createTranslator, resolveLocale } from ".";

// The locale is the `[lang]` root segment, not a cookie, so prerendered pages
// stay static. proxy.ts maps the visitor's cookie onto that segment.
export const getLocale = cache(async () => resolveLocale(await lang()));

export async function getTranslator() {
  return createTranslator(await getLocale());
}
