import "server-only";
import { getSession, scopeOf } from "../auth";
import { allMessages } from "../i18n";
import { buildDictionaries, translatorFor, type Locale } from "../i18n/core";
import { getAdminLocale } from "../i18n/server";
import challenges from "../i18n/challenges.json";

// The CTF area's own words win over the same English text elsewhere
// ("Challenges" is "Topshiriqlar" here, not another area's wording), as they
// do in the browser, where only this area's dictionary is loaded.
const dictionaries = buildDictionaries([...allMessages, challenges]);

export async function getCtfTranslator() {
  return translatorFor(dictionaries, await getAdminLocale());
}

/** Owners may open unpublished competitions and the unfrozen scoreboard. */
export async function isCtfOrganiser() {
  const session = await getSession();
  return Boolean(session && scopeOf(session).owner);
}

export function formatWhen(date: Date, locale: Locale) {
  return new Intl.DateTimeFormat(locale === "uz" ? "uz-UZ" : "en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Tashkent",
  }).format(date);
}
