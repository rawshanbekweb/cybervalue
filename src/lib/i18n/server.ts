import { cache } from "react";
import { cookies } from "next/headers";
import { lang } from "next/root-params";
import { createTranslator, localeCookie, resolveLocale } from ".";

// The locale is the `[lang]` root segment, not a cookie, so prerendered pages
// stay static. proxy.ts maps the visitor's cookie onto that segment.
export const getLocale = cache(async () => resolveLocale(await lang()));

export async function getTranslator() {
  return createTranslator(await getLocale());
}

// The admin area sits outside [lang]; it follows the visitor's language cookie.
export const getAdminLocale = cache(async () =>
  resolveLocale((await cookies()).get(localeCookie)?.value),
);

export async function getAdminTranslator() {
  return createTranslator(await getAdminLocale());
}
