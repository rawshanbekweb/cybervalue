import "server-only";
import { cache } from "react";
import type { Prisma, ContentKind } from "@/generated/prisma/client";
import { getDb } from "./db";
import { configuredSocials } from "./site";
import { safeLink, type Filters } from "./validation";
import { include, type Entry } from "./content-shared";
import { getLocale } from "./i18n/server";
import {
  localizeCategory,
  localizeEntry,
  localizeTag,
  translatedSlugsMatching,
} from "./i18n/entries";

export { include, type Entry };

// Supplementary data (footer links, related items, facets) must not turn a
// transient database failure into a 500 for the whole page.
async function withFallback<T>(
  label: string,
  fallback: T,
  run: () => Promise<T>,
): Promise<T> {
  try {
    return await run();
  } catch (error) {
    console.error(`[content] ${label} failed:`, error);
    return fallback;
  }
}
export const publicWhere = (): Prisma.ContentWhereInput => ({
  status: "PUBLISHED",
  publishedAt: { not: null, lte: new Date() },
  OR: [{ kind: { not: "LAB" } }, { lab: { authorized: true } }],
});

// Database text is the authored source; present it in the visitor's language.
async function localized(entries: Entry[]) {
  const locale = await getLocale();
  return entries.map((entry) => localizeEntry(entry, locale));
}

export const getRecent = cache(
  async (limit = 6, kind?: ContentKind): Promise<Entry[]> => {
    const db = getDb();
    if (!db) return [];
    return localized(
      await db.content.findMany({
        where: { ...publicWhere(), ...(kind ? { kind } : {}) },
        include,
        orderBy: [{ publishedAt: "desc" }, { id: "asc" }],
        take: limit,
      }),
    );
  },
);
export const getFeatured = cache(async (): Promise<Entry[]> => {
  const db = getDb();
  if (!db) return [];
  return withFallback("getFeatured", [], async () =>
    localized(
      await db.content.findMany({
        where: { ...publicWhere(), kind: "PROJECT", featured: true },
        include,
        orderBy: { publishedAt: "desc" },
        take: 3,
      }),
    ),
  );
});
export const getEntry = cache(
  async (kind: ContentKind, slug: string): Promise<Entry | null> => {
    const db = getDb();
    const entry = db
      ? await db.content.findFirst({
          where: { ...publicWhere(), kind, slug },
          include,
        })
      : null;
    return entry ? localizeEntry(entry, await getLocale()) : null;
  },
);
export async function getRelated(id: string): Promise<Entry[]> {
  const db = getDb();
  if (!db) return [];
  return withFallback("getRelated", [], async () =>
    localized(
      await db.content.findMany({
        where: {
          AND: [
            publicWhere(),
            {
              OR: [
                { relatedFrom: { some: { id } } },
                { related: { some: { id } } },
              ],
            },
          ],
        },
        include,
        take: 6,
        orderBy: { publishedAt: "desc" },
      }),
    ),
  );
}
export async function searchContent(filters: Filters, kind?: ContentKind) {
  const db = getDb();
  if (!db) return { items: [] as Entry[], total: 0 };
  const locale = await getLocale();
  const where: Prisma.ContentWhereInput = {
    AND: [
      publicWhere(),
      ...(kind ? [{ kind }] : []),
      ...(filters.q
        ? [
            {
              OR: [
                ...["title", "summary", "body"].map((key) => ({
                  [key]: { contains: filters.q, mode: "insensitive" },
                })),
                { slug: { in: translatedSlugsMatching(filters.q, locale) } },
              ],
            },
          ]
        : []),
      ...(filters.category ? [{ category: { slug: filters.category } }] : []),
      ...(filters.tag ? [{ tags: { some: { slug: filters.tag } } }] : []),
      ...(filters.technology
        ? [{ project: { technologies: { has: filters.technology } } }]
        : []),
      ...(filters.difficulty
        ? [{ lab: { difficulty: filters.difficulty } }]
        : []),
      ...(filters.year
        ? [
            {
              publishedAt: {
                gte: new Date(`${filters.year}-01-01T00:00:00Z`),
                lt: new Date(`${Number(filters.year) + 1}-01-01T00:00:00Z`),
              },
            },
          ]
        : []),
    ],
  };
  const [items, total] = await Promise.all([
    db.content.findMany({
      where,
      include,
      orderBy: [{ publishedAt: "desc" }, { id: "asc" }],
      skip: (filters.page - 1) * 12,
      take: 12,
    }),
    db.content.count({ where }),
  ]);
  return { items: items.map((entry) => localizeEntry(entry, locale)), total };
}
export async function getFacets(kind?: ContentKind) {
  const empty = { categories: [], tags: [], years: [], technologies: [] };
  const db = getDb();
  if (!db) return empty;
  return withFallback("getFacets", empty, () => loadFacets(db, kind));
}
async function loadFacets(
  db: NonNullable<ReturnType<typeof getDb>>,
  kind?: ContentKind,
) {
  const where = { ...publicWhere(), ...(kind ? { kind } : {}) };
  const locale = await getLocale();
  const [categories, tags, entries] = await Promise.all([
    db.category.findMany({
      where: { content: { some: where } },
      orderBy: { name: "asc" },
    }),
    db.tag.findMany({
      where: { content: { some: where } },
      orderBy: { name: "asc" },
    }),
    db.content.findMany({
      where,
      select: {
        publishedAt: true,
        project: { select: { technologies: true } },
      },
    }),
  ]);
  const byName = (a: { name: string }, b: { name: string }) =>
    a.name.localeCompare(b.name, locale);
  return {
    categories: categories
      .map((category) => localizeCategory(category, locale))
      .sort(byName),
    tags: tags.map((tag) => localizeTag(tag, locale)).sort(byName),
    years: [
      ...new Set(
        entries.flatMap((e) =>
          e.publishedAt ? [e.publishedAt.getUTCFullYear()] : [],
        ),
      ),
    ].sort((a, b) => b - a),
    technologies: [
      ...new Set(entries.flatMap((e) => e.project?.technologies ?? [])),
    ].sort(),
  };
}
export async function getSitemapEntries() {
  const db = getDb();
  return db
    ? db.content.findMany({
        where: publicWhere(),
        select: { kind: true, slug: true, updatedAt: true },
        orderBy: { slug: "asc" },
      })
    : [];
}
export const getSocials = cache(async () => {
  const db = getDb();
  const saved = db
    ? await withFallback("getSocials", [], () =>
        db.socialLink.findMany({ orderBy: { position: "asc" } }),
      )
    : [];
  const merged = new Map(configuredSocials.map((s) => [s.platform, s]));
  for (const link of saved)
    if (
      ["GitHub", "LinkedIn", "Telegram", "Instagram"].includes(link.platform) &&
      safeLink(link.url)
    )
      merged.set(link.platform, { platform: link.platform, url: link.url });
  return [...merged.values()];
});
