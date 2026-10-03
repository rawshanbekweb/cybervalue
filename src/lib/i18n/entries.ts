import type { Entry } from "../content-shared";
import type { Locale } from ".";
import {
  TRANSLATED_AT,
  categoryTranslations,
  entryTranslations,
  tagTranslations,
} from "./entry-translations";

type Named = { slug: string; name: string };

function localizeNamed<T extends Named>(
  item: T,
  table: Record<string, { from: string } & Partial<Record<Locale, string>>>,
  locale: Locale,
): T {
  const known = table[item.slug];
  const name = known?.from === item.name ? known[locale] : undefined;
  return name ? { ...item, name } : item;
}

export const localizeTag = <T extends Named>(tag: T, locale: Locale) =>
  localizeNamed(tag, tagTranslations, locale);
export const localizeCategory = <T extends Named>(
  category: T,
  locale: Locale,
) => localizeNamed(category, categoryTranslations, locale);

// Translations describe the entry as it was when TRANSLATED_AT was recorded. An
// entry edited afterwards keeps its authored text rather than showing stale copy.
export function localizeEntry<T extends Entry>(entry: T, locale: Locale): T {
  const translation = entryTranslations[entry.slug]?.[locale];
  const current = entry.updatedAt.getTime() <= TRANSLATED_AT;
  const t = current ? translation : undefined;
  return {
    ...entry,
    title: t?.title ?? entry.title,
    summary: t?.summary ?? entry.summary,
    body: t?.body ?? entry.body,
    project:
      entry.project && t?.project
        ? { ...entry.project, ...t.project }
        : entry.project,
    lab: entry.lab && t?.lab ? { ...entry.lab, ...t.lab } : entry.lab,
    category: entry.category && localizeCategory(entry.category, locale),
    tags: entry.tags.map((tag) => localizeTag(tag, locale)),
  };
}

// Slugs whose translated text contains the query, so searching in Uzbek finds
// entries whose database text is English.
export function translatedSlugsMatching(query: string, locale: Locale) {
  const needle = query.toLowerCase();
  return Object.entries(entryTranslations)
    .filter(([, byLocale]) => {
      const t = byLocale[locale];
      return (
        t &&
        [t.title, t.summary, t.body].some((text) =>
          text?.toLowerCase().includes(needle),
        )
      );
    })
    .map(([slug]) => slug);
}
