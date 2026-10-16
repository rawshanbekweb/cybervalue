"use server";
import { revalidatePath } from "next/cache";
import { audit } from "@/lib/audit";
import { requireAdmin } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { limit } from "@/lib/rate-limit-db";
import { parseSiteConfig, SECTIONS } from "@/lib/site-config";
import { SITE_CONFIG_KEY } from "@/lib/site-config-server";
import { safeLink } from "@/lib/validation";

export type SettingsState = { error?: string; success?: string } | undefined;

const SOCIALS = ["GitHub", "LinkedIn", "Telegram", "Instagram"] as const;

export async function saveSettingsAction(
  _state: SettingsState,
  form: FormData,
): Promise<SettingsState> {
  const session = await requireAdmin("/admin/settings");
  if (!(await limit(`admin-write:${session.user.id}`, 60, 60_000)))
    return { error: "Too many changes. Try again shortly." };
  const db = getDb();
  if (!db) return { error: "Database is not configured." };
  const get = (name: string) => String(form.get(name) ?? "");
  const indexable = get("indexable");
  // parseSiteConfig trims, limits and drops anything unsafe.
  const config = parseSiteConfig({
    announcement: {
      enabled: form.get("announcement") === "on",
      text: { uz: get("announcementUz"), en: get("announcementEn") },
      href: get("announcementHref"),
    },
    hero: {
      title: { uz: get("titleUz"), en: get("titleEn") },
      lead: { uz: get("leadUz"), en: get("leadEn") },
    },
    sections: Object.fromEntries(
      SECTIONS.map(({ id }) => [id, form.get(`section-${id}`) === "on"]),
    ),
    indexable: indexable === "yes" ? true : indexable === "no" ? false : null,
    email: get("email"),
  });
  if (get("email") && !config.email)
    return { error: "Check the email address." };
  if (get("announcementHref") && !config.announcement.href)
    return {
      error: "The banner link must start with / or https://.",
    };
  const socials = SOCIALS.map((platform, position) => ({
    platform,
    position,
    url: get(`social-${platform}`).trim(),
  }));
  if (socials.some((s) => s.url && !safeLink(s.url)))
    return { error: "Social links must be full https:// addresses." };

  await db.$transaction([
    db.siteSetting.upsert({
      where: { key: SITE_CONFIG_KEY },
      create: { key: SITE_CONFIG_KEY, value: config },
      update: { value: config },
    }),
    db.socialLink.deleteMany({
      where: {
        platform: { in: socials.filter((s) => !s.url).map((s) => s.platform) },
      },
    }),
    ...socials
      .filter((s) => s.url)
      .map((s) =>
        db.socialLink.upsert({
          where: { platform: s.platform },
          create: s,
          update: { url: s.url, position: s.position },
        }),
      ),
  ]);
  await audit("settings.update", session.user.id, "site settings");
  // Navigation, banner and section switches show on every public page. Public
  // URLs are rewritten to /[lang], so that route pattern is what gets purged.
  revalidatePath("/[lang]", "layout");
  revalidatePath("/", "layout");
  return { success: "Saved. The site is updated." };
}
